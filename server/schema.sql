-- iNardi multiplayer schema
-- Clients (guest or signed-in players) may only READ their own rows.
-- Every write goes through the `game` edge function (service role) and the
-- SECURITY DEFINER functions below, so coin balances can't be edited from a phone.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default 'Guest',
  coins       integer not null default 1000 check (coins >= 0),
  owned_skins text[] not null default '{walnut}',
  owned_sets  text[] not null default '{classic}',
  owned_dice  text[] not null default '{ivory}',
  equip       jsonb  not null default '{"skin":"walnut","set":"classic","dice":"ivory"}',
  played      integer not null default 0,
  won         integer not null default 0,
  last_ad_at  timestamptz,
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated using (id = auth.uid());

-- new account -> profile with starting coins
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, 'Guest ' || lpad((floor(random() * 10000))::int::text, 4, '0'))
  on conflict (id) do nothing;
  insert into public.coin_ledger (user_id, delta, reason) values (new.id, 1000, 'welcome');
  return new;
end $$;

-- ---------------------------------------------------------------- ledger
create table if not exists public.coin_ledger (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  delta      integer not null,
  reason     text not null,
  game_id    uuid,
  created_at timestamptz not null default now()
);
create index if not exists coin_ledger_user on public.coin_ledger (user_id, created_at desc);
alter table public.coin_ledger enable row level security;
drop policy if exists "read own ledger" on public.coin_ledger;
create policy "read own ledger" on public.coin_ledger for select to authenticated using (user_id = auth.uid());

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- shop prices (server is the source of truth)
create table if not exists public.shop_items (
  kind  text not null check (kind in ('skins', 'sets', 'dice')),
  id    text not null,
  price integer not null check (price >= 0),
  primary key (kind, id)
);
alter table public.shop_items enable row level security;
drop policy if exists "anyone reads prices" on public.shop_items;
create policy "anyone reads prices" on public.shop_items for select to anon, authenticated using (true);
insert into public.shop_items values
  ('skins', 'walnut', 0), ('skins', 'oak', 400), ('skins', 'ebony', 900),
  ('sets', 'classic', 0), ('sets', 'bone', 200), ('sets', 'pearl', 500),
  ('dice', 'ivory', 0), ('dice', 'wood', 250), ('dice', 'pearl', 600)
on conflict (kind, id) do update set price = excluded.price;

-- app switches (e.g. preview_mode lets testers add free coin packs; turn it off before launch)
create table if not exists public.app_config (key text primary key, value jsonb not null);
alter table public.app_config enable row level security;
insert into public.app_config values ('preview_mode', 'true'), ('turn_seconds', '60'), ('rooms', '[100, 500, 1000]')
on conflict (key) do nothing;

-- ---------------------------------------------------------------- games
create table if not exists public.games (
  id          uuid primary key default gen_random_uuid(),
  variant     text not null check (variant in ('short', 'long')),
  stake       integer not null default 0 check (stake >= 0),
  kind        text not null check (kind in ('invite', 'match')),
  status      text not null default 'waiting' check (status in ('waiting', 'active', 'finished', 'cancelled')),
  invite_code text unique,
  p0          uuid references auth.users(id) on delete set null,
  p1          uuid references auth.users(id) on delete set null,
  p0_name     text,
  p1_name     text,
  state       jsonb,            -- engine state (positions, bar, off, turnsTaken)
  turn        smallint,         -- whose turn: 0 = light, 1 = dark
  phase       text check (phase in ('roll', 'move')),
  dice        smallint[],       -- current roll during 'move'
  opening     smallint[],       -- opening roll [p0 die, p1 die]
  last_moves  jsonb,            -- moves of the last finished turn, for the opponent's replay
  last_player smallint,
  last_dice   smallint[],
  move_no     integer not null default 0,   -- bumps on every change; optimistic concurrency
  deadline    timestamptz,
  winner      smallint,
  points      smallint,
  end_reason  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists games_p0 on public.games (p0, status);
create index if not exists games_p1 on public.games (p1, status);
create index if not exists games_deadline on public.games (deadline) where status = 'active';
alter table public.games enable row level security;
drop policy if exists "players read their games" on public.games;
create policy "players read their games" on public.games for select to authenticated using (auth.uid() = p0 or auth.uid() = p1);

do $$ begin
  alter publication supabase_realtime add table public.games;
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------- matchmaking queue
create table if not exists public.match_queue (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  variant    text not null,
  stake      integer not null,
  name       text,
  created_at timestamptz not null default now(),
  seen_at    timestamptz not null default now()   -- heartbeat; stale entries are never matched
);
alter table public.match_queue enable row level security;   -- no policies: server only

-- Pair the caller with the longest-waiting live player in the same room, or queue them.
-- Stakes are taken from both players in the same transaction that creates the game.
create or replace function public.matchmake(p_user uuid, p_variant text, p_stake int, p_state jsonb, p_opening smallint[])
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_me profiles; v_opp match_queue; v_game uuid; v_first smallint; v_secs int;
begin
  perform pg_advisory_xact_lock(hashtext('mm:' || p_variant || ':' || p_stake));
  select * into v_me from profiles where id = p_user for update;
  if not found then return jsonb_build_object('error', 'no_profile'); end if;
  if v_me.coins < p_stake then return jsonb_build_object('error', 'not_enough_coins'); end if;
  if exists (select 1 from games where status = 'active' and p_user in (p0, p1)) then
    return jsonb_build_object('error', 'already_in_game');
  end if;
  select (value #>> '{}')::int into v_secs from app_config where key = 'turn_seconds';
  delete from match_queue where user_id = p_user;
  loop
    select * into v_opp from match_queue
      where variant = p_variant and stake = p_stake and user_id <> p_user and seen_at > now() - interval '12 seconds'
      order by created_at limit 1 for update skip locked;
    exit when not found;
    delete from match_queue where user_id = v_opp.user_id;
    perform 1 from profiles where id = v_opp.user_id and coins >= p_stake for update;
    if found and not exists (select 1 from games where status = 'active' and v_opp.user_id in (p0, p1)) then
      update profiles set coins = coins - p_stake where id in (p_user, v_opp.user_id);
      v_first := case when p_opening[1] > p_opening[2] then 0 else 1 end;
      insert into games (variant, stake, kind, status, p0, p1, p0_name, p1_name, state, turn, phase, opening, deadline)
      values (p_variant, p_stake, 'match', 'active', v_opp.user_id, p_user, v_opp.name, v_me.name, p_state, v_first, 'roll',
              p_opening, now() + make_interval(secs => coalesce(v_secs, 60) + 10))
      returning id into v_game;
      if p_stake > 0 then
        insert into coin_ledger (user_id, delta, reason, game_id)
        values (p_user, -p_stake, 'stake', v_game), (v_opp.user_id, -p_stake, 'stake', v_game);
      end if;
      return jsonb_build_object('game_id', v_game);
    end if;
  end loop;
  insert into match_queue (user_id, variant, stake, name) values (p_user, p_variant, p_stake, v_me.name)
  on conflict (user_id) do update set variant = excluded.variant, stake = excluded.stake, name = excluded.name, created_at = now(), seen_at = now();
  return jsonb_build_object('queued', true);
end $$;

-- Finish a game exactly once and pay the pot to the winner.
create or replace function public.settle_game(p_game uuid, p_winner smallint, p_reason text, p_points smallint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare g games; v_winner uuid; v_pot int;
begin
  update games set status = 'finished', winner = p_winner, end_reason = p_reason, points = p_points,
         deadline = null, phase = null, move_no = move_no + 1, updated_at = now()
   where id = p_game and status = 'active'
  returning * into g;
  if not found then return jsonb_build_object('error', 'not_active'); end if;
  v_winner := case when p_winner = 0 then g.p0 else g.p1 end;
  v_pot := g.stake * 2;
  if v_pot > 0 and v_winner is not null then
    update profiles set coins = coins + v_pot where id = v_winner;
    insert into coin_ledger (user_id, delta, reason, game_id) values (v_winner, v_pot, 'win', g.id);
  end if;
  update profiles set played = played + 1 where id in (g.p0, g.p1);
  update profiles set won = won + 1 where id = v_winner;
  return jsonb_build_object('ok', true, 'pot', v_pot);
end $$;

-- Buy a skin or checker set with coins.
create or replace function public.buy_item(p_user uuid, p_kind text, p_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_price int; v_p profiles;
begin
  select price into v_price from shop_items where kind = p_kind and id = p_id;
  if not found then return jsonb_build_object('error', 'no_such_item'); end if;
  select * into v_p from profiles where id = p_user for update;
  if (p_kind = 'skins' and p_id = any (v_p.owned_skins)) or (p_kind = 'sets' and p_id = any (v_p.owned_sets))
     or (p_kind = 'dice' and p_id = any (v_p.owned_dice)) then
    return jsonb_build_object('error', 'already_owned');
  end if;
  if v_p.coins < v_price then return jsonb_build_object('error', 'not_enough_coins'); end if;
  update profiles set coins = coins - v_price,
         owned_skins = case when p_kind = 'skins' then array_append(owned_skins, p_id) else owned_skins end,
         owned_sets  = case when p_kind = 'sets'  then array_append(owned_sets, p_id)  else owned_sets  end,
         owned_dice  = case when p_kind = 'dice'  then array_append(owned_dice, p_id)  else owned_dice  end
   where id = p_user;
  if v_price > 0 then insert into coin_ledger (user_id, delta, reason) values (p_user, -v_price, 'buy:' || p_kind || ':' || p_id); end if;
  return jsonb_build_object('ok', true);
end $$;

-- Add coins for a reason (ad reward, preview pack). Cooldown for ad rewards.
create or replace function public.grant_coins(p_user uuid, p_amount int, p_reason text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_p profiles;
begin
  if p_amount <= 0 or p_amount > 20000 then return jsonb_build_object('error', 'bad_amount'); end if;
  select * into v_p from profiles where id = p_user for update;
  if p_reason = 'ad' then
    if v_p.last_ad_at is not null and v_p.last_ad_at > now() - interval '30 seconds' then
      return jsonb_build_object('error', 'too_soon');
    end if;
    update profiles set last_ad_at = now() where id = p_user;
  elsif p_reason = 'preview_pack' then
    if coalesce((select (value #>> '{}')::boolean from app_config where key = 'preview_mode'), false) is not true then
      return jsonb_build_object('error', 'disabled');
    end if;
  else
    return jsonb_build_object('error', 'bad_reason');
  end if;
  update profiles set coins = coins + p_amount where id = p_user;
  insert into coin_ledger (user_id, delta, reason) values (p_user, p_amount, p_reason);
  return jsonb_build_object('ok', true);
end $$;

-- Only the server (service role) may call these.
revoke all on function public.matchmake(uuid, text, int, jsonb, smallint[]) from public, anon, authenticated;
revoke all on function public.settle_game(uuid, smallint, text, smallint) from public, anon, authenticated;
revoke all on function public.buy_item(uuid, text, text) from public, anon, authenticated;
revoke all on function public.grant_coins(uuid, int, text) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.matchmake(uuid, text, int, jsonb, smallint[]) to service_role;
grant execute on function public.settle_game(uuid, smallint, text, smallint) to service_role;
grant execute on function public.buy_item(uuid, text, text) to service_role;
grant execute on function public.grant_coins(uuid, int, text) to service_role;

-- table privileges: clients read only; service role does everything
revoke all on public.profiles, public.coin_ledger, public.games, public.match_queue, public.shop_items, public.app_config from anon, authenticated;
grant select on public.profiles, public.coin_ledger, public.games to authenticated;
grant select on public.shop_items to anon, authenticated;
grant all on public.profiles, public.coin_ledger, public.games, public.match_queue, public.shop_items, public.app_config to service_role;
grant usage, select on all sequences in schema public to service_role;

-- ---------------------------------------------------------------- housekeeping (every minute)
create or replace function public.housekeeping() returns void
language plpgsql security definer set search_path = public as $$
declare g record;
begin
  -- a player who ran out of time and never came back loses (the opponent may also claim this sooner)
  for g in select id, turn from games where status = 'active' and deadline < now() - interval '90 seconds' loop
    perform settle_game(g.id, (1 - g.turn)::smallint, 'timeout', 1::smallint);
  end loop;
  delete from match_queue where seen_at < now() - interval '1 minute';
  update games set status = 'cancelled', updated_at = now() where status = 'waiting' and created_at < now() - interval '1 day';
end $$;
revoke all on function public.housekeeping() from public, anon, authenticated;
