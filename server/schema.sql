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
-- progression, daily bonus and presence (added later; "add column if not exists" keeps this file re-runnable)
alter table public.profiles add column if not exists owned_dice text[] not null default '{ivory}';
alter table public.profiles add column if not exists xp integer not null default 0;
alter table public.profiles add column if not exists level integer not null default 1;
alter table public.profiles add column if not exists daily_streak integer not null default 0;
alter table public.profiles add column if not exists daily_last date;
alter table public.profiles add column if not exists last_seen timestamptz;
alter table public.profiles add column if not exists last_bot_xp_at timestamptz;
-- avatars and frames, and lifetime statistics (online games; bot games counted separately)
alter table public.profiles add column if not exists owned_avatars text[] not null default '{default}';
alter table public.profiles add column if not exists owned_frames  text[] not null default '{none}';
alter table public.profiles add column if not exists streak integer not null default 0;
alter table public.profiles add column if not exists best_streak integer not null default 0;
alter table public.profiles add column if not exists mars_wins integer not null default 0;
alter table public.profiles add column if not exists coins_won_total integer not null default 0;
alter table public.profiles add column if not exists bot_played integer not null default 0;
alter table public.profiles add column if not exists bot_won integer not null default 0;
-- achievements: counters the server keeps, and the tier reached per achievement {"champion": 2, ...}
alter table public.profiles add column if not exists ach jsonb not null default '{}';
alter table public.profiles add column if not exists comebacks integer not null default 0;
alter table public.profiles add column if not exists perfect_doubles integer not null default 0;
alter table public.profiles add column if not exists untouched_wins integer not null default 0;
alter table public.profiles add column if not exists fast_wins integer not null default 0;
alter table public.profiles add column if not exists short_wins integer not null default 0;
alter table public.profiles add column if not exists long_wins integer not null default 0;
alter table public.profiles add column if not exists high_rooms text[] not null default '{}';
alter table public.profiles add column if not exists royal_wins integer not null default 0;
alter table public.profiles add column if not exists gg_count integer not null default 0;
alter table public.profiles add column if not exists rematches integer not null default 0;
alter table public.profiles add column if not exists daily7 integer not null default 0;
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
  kind  text not null,
  id    text not null,
  price integer not null check (price >= 0),
  primary key (kind, id)
);
alter table public.shop_items drop constraint if exists shop_items_kind_check;
alter table public.shop_items add constraint shop_items_kind_check check (kind in ('skins', 'sets', 'dice', 'avatars', 'frames'));
alter table public.shop_items enable row level security;
drop policy if exists "anyone reads prices" on public.shop_items;
create policy "anyone reads prices" on public.shop_items for select to anon, authenticated using (true);
insert into public.shop_items values
  ('skins', 'walnut', 0), ('skins', 'oak', 400), ('skins', 'ebony', 900),
  ('sets', 'classic', 0), ('sets', 'bone', 200), ('sets', 'pearl', 500),
  ('dice', 'ivory', 0), ('dice', 'wood', 250), ('dice', 'pearl', 600),
  ('skins', 'tuff', 1200), ('sets', 'tuff', 700), ('dice', 'obsidian', 800),
  ('skins', 'garnet', 1500), ('sets', 'amber', 900), ('dice', 'lapis', 1000),
  ('avatars', 'default', 0), ('avatars', 'ararat', 300), ('avatars', 'pomegranate', 300), ('avatars', 'star', 500), ('avatars', 'eternity', 600),
  ('avatars', 'garnet', 600), ('avatars', 'goldsign', 800), ('avatars', 'silversign', 800),
  ('frames', 'none', 0), ('frames', 'bronze', 200), ('frames', 'silver', 500), ('frames', 'gold', 1000), ('frames', 'garnet', 1500),
  ('frames', 'lapis', 2000), ('frames', 'diamond', 5000)
on conflict (kind, id) do update set price = excluded.price;

-- app switches (e.g. preview_mode lets testers add free coin packs; turn it off before launch)
create table if not exists public.app_config (key text primary key, value jsonb not null);
alter table public.app_config enable row level security;
insert into public.app_config values ('preview_mode', 'true'), ('turn_seconds', '60'), ('rooms', '[100, 500, 1000, 5000, 10000]')
on conflict (key) do nothing;
update public.app_config set value = '[100, 500, 1000, 5000, 10000]' where key = 'rooms';

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
alter table public.games add column if not exists invited uuid references auth.users(id) on delete set null;   -- friend invite / rematch target
alter table public.games add column if not exists rematch_of uuid;
alter table public.games add column if not exists p0_level smallint;
alter table public.games add column if not exists p1_level smallint;
-- per-game tracking for achievements: 6-6 rolls, hits made, the most pips each player was behind, "good game" sent
alter table public.games add column if not exists sixes smallint[] not null default '{0,0}';
alter table public.games add column if not exists hits smallint[] not null default '{0,0}';
alter table public.games add column if not exists behind smallint[] not null default '{0,0}';
alter table public.games add column if not exists gg smallint[] not null default '{0,0}';
create index if not exists games_p0 on public.games (p0, status);
create index if not exists games_invited on public.games (invited, status);
create index if not exists games_rematch on public.games (rematch_of);
create index if not exists games_p1 on public.games (p1, status);
create index if not exists games_deadline on public.games (deadline) where status = 'active';
alter table public.games enable row level security;
drop policy if exists "players read their games" on public.games;
create policy "players read their games" on public.games for select to authenticated using (auth.uid() = p0 or auth.uid() = p1);
drop policy if exists "invited player reads the invite" on public.games;
create policy "invited player reads the invite" on public.games for select to authenticated using (auth.uid() = invited);

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
  v_me profiles; v_opp match_queue; v_game uuid; v_first smallint; v_secs int; v_opl int;
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
      select level into v_opl from profiles where id = v_opp.user_id;
      v_first := case when p_opening[1] > p_opening[2] then 0 else 1 end;
      insert into games (variant, stake, kind, status, p0, p1, p0_name, p1_name, p0_level, p1_level, state, turn, phase, opening, deadline)
      values (p_variant, p_stake, 'match', 'active', v_opp.user_id, p_user, v_opp.name, v_me.name, v_opl, v_me.level, p_state, v_first, 'roll',
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

-- ---------------------------------------------------------------- levels
-- total XP needed for a level: 50 * L * (L - 1)  ->  L2 = 100, L3 = 300, L5 = 1000, L10 = 4500
create or replace function public.level_for(p_xp int) returns int language sql immutable as $$
  select floor((1 + sqrt(1 + 0.08 * greatest(p_xp, 0))) / 2)::int $$;
-- coins for reaching a level; every fifth level pays more
create or replace function public.level_reward(p_level int) returns int language sql immutable as $$
  select case when p_level % 5 = 0 then 500 + 100 * p_level else 100 + 10 * p_level end $$;
create or replace function public.add_xp(p_user uuid, p_xp int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_p profiles; v_new int; v_coins int := 0; l int;
begin
  if p_xp <= 0 then return jsonb_build_object('xp', 0); end if;
  select * into v_p from profiles where id = p_user for update;
  if not found then return jsonb_build_object('xp', 0); end if;
  v_new := greatest(v_p.level, level_for(v_p.xp + p_xp));
  for l in v_p.level + 1 .. v_new loop
    v_coins := v_coins + level_reward(l);
    insert into coin_ledger (user_id, delta, reason) values (p_user, level_reward(l), 'level:' || l);
  end loop;
  update profiles set xp = xp + p_xp, level = v_new, coins = coins + v_coins where id = p_user;
  return jsonb_build_object('xp', p_xp, 'level', v_new, 'from', v_p.level, 'coins', v_coins);
end $$;

-- ---------------------------------------------------------------- weekly leaderboard (weeks start Monday 00:00 Yerevan time)
create or replace function public.week_start(p_t timestamptz) returns date language sql stable as $$
  select date_trunc('week', p_t at time zone 'Asia/Yerevan')::date $$;
create table if not exists public.weekly_stats (
  user_id   uuid not null references auth.users(id) on delete cascade,
  week      date not null,
  wins      integer not null default 0,
  coins_won integer not null default 0,
  games     integer not null default 0,
  primary key (user_id, week)
);
create index if not exists weekly_wins on public.weekly_stats (week, wins desc, coins_won desc);
alter table public.weekly_stats enable row level security;   -- server only
create table if not exists public.weekly_prizes (
  user_id uuid not null references auth.users(id) on delete cascade,
  week    date not null,
  rank    integer not null,
  coins   integer not null,
  seen    boolean not null default false,
  primary key (user_id, week)
);
alter table public.weekly_prizes enable row level security;  -- server only

-- top players of this week; p_board = 'wins' (has prizes) or 'coins'
create or replace function public.leaderboard(p_user uuid, p_board text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_week date := week_start(now()); v_top jsonb; v_me jsonb;
begin
  with r as (
    select s.user_id, s.wins, s.coins_won, s.games,
           row_number() over (order by case when p_board = 'coins' then s.coins_won else s.wins end desc,
                                       case when p_board = 'coins' then s.wins else s.coins_won end desc, s.games, s.user_id) as rank
      from weekly_stats s where s.week = v_week and (case when p_board = 'coins' then s.coins_won else s.wins end) > 0
  )
  select coalesce(jsonb_agg(jsonb_build_object('rank', r.rank, 'id', r.user_id, 'name', p.name, 'level', p.level, 'wins', r.wins, 'coins', r.coins_won, 'me', r.user_id = p_user) order by r.rank) filter (where r.rank <= 50), '[]'),
         (array_agg(jsonb_build_object('rank', r.rank, 'id', r.user_id, 'name', p.name, 'level', p.level, 'wins', r.wins, 'coins', r.coins_won, 'me', true)) filter (where r.user_id = p_user))[1]
    into v_top, v_me
    from r join profiles p on p.id = r.user_id;
  return jsonb_build_object('top', v_top, 'me', v_me, 'ends_at', ((v_week + 7)::timestamp at time zone 'Asia/Yerevan'),
                            'prizes', '[5000, 3000, 2000, 500, 500, 500, 500, 500, 500, 500]'::jsonb);
end $$;

-- pay last week's top 10 (by wins) once; called from housekeeping
create or replace function public.pay_weekly_prizes() returns void
language plpgsql security definer set search_path = public as $$
declare v_prev date := week_start(now()) - 7; r record; v_c int;
  v_prize int[] := array[5000, 3000, 2000, 500, 500, 500, 500, 500, 500, 500];
begin
  if exists (select 1 from app_config where key = 'paid_week' and (value #>> '{}') >= v_prev::text) then return; end if;
  for r in select user_id, row_number() over (order by wins desc, coins_won desc, games, user_id) as rk
             from weekly_stats where week = v_prev and wins > 0 order by rk limit 10 loop
    v_c := v_prize[r.rk];
    update profiles set coins = coins + v_c where id = r.user_id;
    insert into coin_ledger (user_id, delta, reason) values (r.user_id, v_c, 'weekly:' || r.rk);
    insert into weekly_prizes (user_id, week, rank, coins) values (r.user_id, v_prev, r.rk, v_c) on conflict do nothing;
  end loop;
  insert into app_config values ('paid_week', to_jsonb(v_prev::text)) on conflict (key) do update set value = excluded.value;
end $$;

-- ---------------------------------------------------------------- daily bonus (7-day streak, day changes at midnight Yerevan time)
create or replace function public.claim_daily(p_user uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_p profiles; v_today date := (now() at time zone 'Asia/Yerevan')::date; v_day int; v_reward int;
begin
  select * into v_p from profiles where id = p_user for update;
  if not found then return jsonb_build_object('error', 'no_profile'); end if;
  if v_p.daily_last = v_today then return jsonb_build_object('error', 'already_claimed'); end if;
  v_day := case when v_p.daily_last = v_today - 1 then v_p.daily_streak % 7 + 1 else 1 end;
  v_reward := (array[100, 150, 200, 300, 400, 500, 1000])[v_day];
  update profiles set coins = coins + v_reward, daily_streak = v_day, daily_last = v_today, daily7 = daily7 + case when v_day = 7 then 1 else 0 end where id = p_user;
  insert into coin_ledger (user_id, delta, reason) values (p_user, v_reward, 'daily:' || v_day);
  return jsonb_build_object('ok', true, 'day', v_day, 'reward', v_reward);
end $$;

-- ---------------------------------------------------------------- friends
-- a row means "user_id added friend_id"; both directions = friends. You can only add someone you have played with.
create table if not exists public.friends (
  user_id    uuid not null references auth.users(id) on delete cascade,
  friend_id  uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);
create index if not exists friends_rev on public.friends (friend_id);
alter table public.friends enable row level security;   -- server only

create or replace function public.friends_list(p_user uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  with ids as (
    select friend_id as id from friends where user_id = p_user
    union select user_id from friends where friend_id = p_user
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', p.id, 'name', p.name, 'level', p.level,
    'state', case when o.user_id is not null and i.user_id is not null then 'friend' when o.user_id is not null then 'sent' else 'request' end,
    'online', p.last_seen > now() - interval '75 seconds',
    'playing', exists (select 1 from games g where g.status = 'active' and p.id in (g.p0, g.p1))
  ) order by (p.last_seen > now() - interval '75 seconds') desc, p.name), '[]')
  from ids join profiles p on p.id = ids.id
  left join friends o on o.user_id = p_user and o.friend_id = ids.id
  left join friends i on i.user_id = ids.id and i.friend_id = p_user
$$;

-- ---------------------------------------------------------------- rematch: the first press creates a request, the opponent's press starts it
create or replace function public.rematch(p_user uuid, p_old uuid, p_state jsonb, p_opening smallint[])
returns jsonb language plpgsql security definer set search_path = public as $$
declare g games; r games; v_opp uuid; v_me profiles; v_op profiles; v_secs int; v_first smallint;
begin
  select * into g from games where id = p_old;
  if not found or g.status <> 'finished' then return jsonb_build_object('error', 'not_finished'); end if;
  if p_user is distinct from g.p0 and p_user is distinct from g.p1 then return jsonb_build_object('error', 'not_your_game'); end if;
  v_opp := case when g.p0 = p_user then g.p1 else g.p0 end;
  if v_opp is null then return jsonb_build_object('error', 'opponent_gone'); end if;
  perform pg_advisory_xact_lock(hashtext('rm:' || p_old));
  select * into r from games where rematch_of = p_old and status in ('waiting', 'active') order by created_at desc limit 1;
  if found then
    if r.status = 'active' then return jsonb_build_object('game_id', r.id); end if;
    if r.p0 = p_user then return jsonb_build_object('waiting', r.id); end if;
    -- the opponent asked first: start the game, taking both stakes
    select * into v_me from profiles where id = p_user for update;
    select * into v_op from profiles where id = v_opp for update;
    if v_me.coins < r.stake then return jsonb_build_object('error', 'not_enough_coins'); end if;
    if v_op.coins < r.stake then return jsonb_build_object('error', 'opponent_no_coins'); end if;
    if exists (select 1 from games where status = 'active' and (p_user in (p0, p1) or v_opp in (p0, p1))) then
      return jsonb_build_object('error', 'already_in_game');
    end if;
    select (value #>> '{}')::int into v_secs from app_config where key = 'turn_seconds';
    update profiles set coins = coins - r.stake where id in (p_user, v_opp);
    if r.stake > 0 then
      insert into coin_ledger (user_id, delta, reason, game_id) values (p_user, -r.stake, 'stake', r.id), (v_opp, -r.stake, 'stake', r.id);
    end if;
    v_first := case when p_opening[1] > p_opening[2] then 0 else 1 end;
    update games set p1 = p_user, p1_name = v_me.name, p1_level = v_me.level, status = 'active', state = p_state, opening = p_opening,
           turn = v_first, phase = 'roll', deadline = now() + make_interval(secs => coalesce(v_secs, 60) + 10),
           move_no = move_no + 1, updated_at = now()
     where id = r.id;
    return jsonb_build_object('game_id', r.id);
  end if;
  select * into v_me from profiles where id = p_user;
  if v_me.coins < g.stake then return jsonb_build_object('error', 'not_enough_coins'); end if;
  if exists (select 1 from games where status = 'active' and v_opp in (p0, p1)) then return jsonb_build_object('error', 'opponent_busy'); end if;
  update games set status = 'cancelled' where p0 = p_user and status = 'waiting';
  insert into games (variant, stake, kind, status, p0, p0_name, p0_level, invited, rematch_of, state)
  values (g.variant, g.stake, 'invite', 'waiting', p_user, v_me.name, v_me.level, v_opp, p_old, p_state)
  returning * into r;
  return jsonb_build_object('waiting', r.id);
end $$;

-- ---------------------------------------------------------------- achievements: grant one tier exactly once
create or replace function public.ach_grant(p_user uuid, p_id text, p_tier int, p_coins int, p_kind text, p_item text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_p profiles;
begin
  select * into v_p from profiles where id = p_user for update;
  if not found or coalesce((v_p.ach ->> p_id)::int, 0) >= p_tier then return false; end if;
  update profiles set ach = ach || jsonb_build_object(p_id, p_tier), coins = coins + p_coins,
         owned_avatars = case when p_kind = 'avatars' and not (p_item = any (owned_avatars)) then array_append(owned_avatars, p_item) else owned_avatars end,
         owned_frames  = case when p_kind = 'frames'  and not (p_item = any (owned_frames))  then array_append(owned_frames, p_item)  else owned_frames end
   where id = p_user;
  if p_coins > 0 then insert into coin_ledger (user_id, delta, reason) values (p_user, p_coins, 'ach:' || p_id || ':' || p_tier); end if;
  return true;
end $$;
revoke all on function public.ach_grant(uuid, text, int, int, text, text) from public, anon, authenticated;
grant execute on function public.ach_grant(uuid, text, int, int, text, text) to service_role;

-- Finish a game exactly once and pay the pot to the winner.
create or replace function public.settle_game(p_game uuid, p_winner smallint, p_reason text, p_points smallint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare g games; v_winner uuid; v_loser uuid; v_pot int; v_turns int; v_pw int; v_week date := public.week_start(now());
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
  update profiles set won = won + 1, streak = streak + 1, best_streak = greatest(best_streak, streak + 1),
         mars_wins = mars_wins + case when p_points = 2 then 1 else 0 end, coins_won_total = coins_won_total + g.stake
   where id = v_winner;
  v_loser := case when p_winner = 0 then g.p1 else g.p0 end;
  -- XP: a real game gives full XP; a game resigned or timed out in the first few turns gives little (no farming by quick resigns)
  v_turns := coalesce((g.state->'turnsTaken'->>0)::int, 0) + coalesce((g.state->'turnsTaken'->>1)::int, 0);
  if v_winner is not null then perform add_xp(v_winner, case when p_reason <> 'win' and v_turns < 8 then 10 else 50 + case when p_points = 2 then 25 else 0 end end); end if;
  update profiles set streak = 0 where id = v_loser and v_loser is not null;
  -- achievement counters
  if v_winner is not null then
    v_pw := p_winner;
    update profiles set
      short_wins = short_wins + case when g.variant = 'short' then 1 else 0 end,
      long_wins  = long_wins  + case when g.variant = 'long'  then 1 else 0 end,
      comebacks  = comebacks  + case when p_reason = 'win' and g.behind[v_pw + 1] >= 40 then 1 else 0 end,
      untouched_wins = untouched_wins + case when p_reason = 'win' and g.variant = 'short' and g.hits[2 - v_pw] = 0 then 1 else 0 end,
      fast_wins  = fast_wins  + case when p_reason = 'win' and now() - g.created_at < interval '5 minutes' then 1 else 0 end,
      royal_wins = royal_wins + case when g.stake = 10000 then 1 else 0 end,
      high_rooms = case when g.stake in (1000, 5000, 10000) and not (g.stake::text = any (high_rooms)) then array_append(high_rooms, g.stake::text) else high_rooms end
     where id = v_winner;
  end if;
  update profiles set perfect_doubles = perfect_doubles + 1 where (id = g.p0 and g.sixes[1] >= 3) or (id = g.p1 and g.sixes[2] >= 3);
  if g.rematch_of is not null then update profiles set rematches = rematches + 1 where id in (g.p0, g.p1); end if;
  if v_loser is not null then perform add_xp(v_loser, case when p_reason = 'win' then 20 when v_turns < 8 then 0 else 5 end); end if;
  -- weekly leaderboard: only games played for coins count
  if g.stake > 0 then
    if v_winner is not null then
      insert into weekly_stats (user_id, week, wins, coins_won, games) values (v_winner, v_week, 1, g.stake, 1)
      on conflict (user_id, week) do update set wins = weekly_stats.wins + 1, coins_won = weekly_stats.coins_won + excluded.coins_won, games = weekly_stats.games + 1;
    end if;
    if v_loser is not null then
      insert into weekly_stats (user_id, week, games) values (v_loser, v_week, 1)
      on conflict (user_id, week) do update set games = weekly_stats.games + 1;
    end if;
  end if;
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
     or (p_kind = 'dice' and p_id = any (v_p.owned_dice)) or (p_kind = 'avatars' and p_id = any (v_p.owned_avatars))
     or (p_kind = 'frames' and p_id = any (v_p.owned_frames)) then
    return jsonb_build_object('error', 'already_owned');
  end if;
  if v_p.coins < v_price then return jsonb_build_object('error', 'not_enough_coins'); end if;
  update profiles set coins = coins - v_price,
         owned_skins = case when p_kind = 'skins' then array_append(owned_skins, p_id) else owned_skins end,
         owned_sets  = case when p_kind = 'sets'  then array_append(owned_sets, p_id)  else owned_sets  end,
         owned_dice  = case when p_kind = 'dice'  then array_append(owned_dice, p_id)  else owned_dice  end,
         owned_avatars = case when p_kind = 'avatars' then array_append(owned_avatars, p_id) else owned_avatars end,
         owned_frames  = case when p_kind = 'frames'  then array_append(owned_frames, p_id)  else owned_frames  end
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
revoke all on function public.add_xp(uuid, int) from public, anon, authenticated;
revoke all on function public.leaderboard(uuid, text) from public, anon, authenticated;
revoke all on function public.pay_weekly_prizes() from public, anon, authenticated;
revoke all on function public.claim_daily(uuid) from public, anon, authenticated;
revoke all on function public.friends_list(uuid) from public, anon, authenticated;
revoke all on function public.rematch(uuid, uuid, jsonb, smallint[]) from public, anon, authenticated;
grant execute on function public.add_xp(uuid, int), public.leaderboard(uuid, text), public.pay_weekly_prizes(), public.claim_daily(uuid),
  public.friends_list(uuid), public.rematch(uuid, uuid, jsonb, smallint[]) to service_role;
grant execute on function public.matchmake(uuid, text, int, jsonb, smallint[]) to service_role;
grant execute on function public.settle_game(uuid, smallint, text, smallint) to service_role;
grant execute on function public.buy_item(uuid, text, text) to service_role;
grant execute on function public.grant_coins(uuid, int, text) to service_role;

-- table privileges: clients read only; service role does everything
revoke all on public.profiles, public.coin_ledger, public.games, public.match_queue, public.shop_items, public.app_config,
  public.weekly_stats, public.weekly_prizes, public.friends from anon, authenticated;
grant select on public.profiles, public.coin_ledger, public.games to authenticated;
grant select on public.shop_items to anon, authenticated;
grant all on public.profiles, public.coin_ledger, public.games, public.match_queue, public.shop_items, public.app_config,
  public.weekly_stats, public.weekly_prizes, public.friends to service_role;
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
  -- invites sent to one person (friend invite, rematch) expire after 10 minutes
  update games set status = 'cancelled', updated_at = now() where status = 'waiting' and invited is not null and created_at < now() - interval '10 minutes';
  perform pay_weekly_prizes();
end $$;
revoke all on function public.housekeeping() from public, anon, authenticated;
