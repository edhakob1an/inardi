// iNardi game server. One endpoint, POST { action, ...args } with the player's session token.
// The server rolls every die and replays every move through the same rules engine the game uses,
// so a modified client can't fake rolls, play illegal moves or touch coin balances.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import './engine.js';

// deno-lint-ignore no-explicit-any
const N: any = (globalThis as any).Nardi;
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

const TURN_SECONDS = 60;          // time for one turn (roll + moves)
const FIRST_TURN_GRACE = 10;      // extra seconds when a game starts
const ROOMS = [100, 500, 1000];   // coin rooms for random matchmaking
const PACKS = [1000, 5000, 12000];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const reply = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
class Fail extends Error { constructor(public code: string, public status = 400) { super(code); } }

// fair die: rejection sampling on crypto random bytes
function die(): number { const b = new Uint8Array(1); do crypto.getRandomValues(b); while (b[0] >= 252); return (b[0] % 6) + 1; }
function openingRoll(): number[] { let a, b; do { a = die(); b = die(); } while (a === b); return [a, b]; }
function inviteCode(): string {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', b = new Uint8Array(6); crypto.getRandomValues(b);
  return [...b].map(x => A[x % A.length]).join('');
}
const later = (s: number) => new Date(Date.now() + s * 1000).toISOString();
const variantOk = (v: unknown) => v === 'short' || v === 'long';

type Game = Record<string, any>;
async function loadGame(id: string): Promise<Game> {
  if (typeof id !== 'string') throw new Fail('bad_game');
  const { data, error } = await db.from('games').select('*').eq('id', id).maybeSingle();
  if (error) throw error; if (!data) throw new Fail('no_game', 404);
  return data;
}
const seat = (g: Game, uid: string) => (g.p0 === uid ? 0 : g.p1 === uid ? 1 : -1);
// write only if nobody changed the game since we read it
async function save(g: Game, patch: Record<string, unknown>): Promise<Game> {
  const { data, error } = await db.from('games').update({ ...patch, move_no: g.move_no + 1, updated_at: new Date().toISOString() })
    .eq('id', g.id).eq('move_no', g.move_no).select().maybeSingle();
  if (error) throw error; if (!data) throw new Fail('conflict', 409);
  return data;
}
async function rpc(fn: string, args: Record<string, unknown>) {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw error;
  if (data && data.error) throw new Fail(data.error);
  return data;
}
async function profile(uid: string) {
  const { data, error } = await db.from('profiles').select('*').eq('id', uid).maybeSingle();
  if (error) throw error; if (!data) throw new Fail('no_profile', 404);
  return data;
}
async function activeGame(uid: string) {
  const { data } = await db.from('games').select('id,status,kind,invite_code').in('status', ['active', 'waiting'])
    .or(`p0.eq.${uid},p1.eq.${uid}`).order('created_at', { ascending: false }).limit(1);
  return data && data[0] || null;
}
// calendar day in Yerevan (UTC+4, no daylight saving): the daily bonus resets at local midnight
const ymd = (daysAgo = 0) => new Date(Date.now() + 4 * 3600e3 - daysAgo * 864e5).toISOString().slice(0, 10);
function dailyStatus(p: Game) {
  const available = p.daily_last !== ymd(0);
  return { available, day: available ? (p.daily_last === ymd(1) ? (p.daily_streak % 7) + 1 : 1) : p.daily_streak, streak: p.daily_streak };
}
const DAILY = [100, 150, 200, 300, 400, 500, 1000];
async function touch(uid: string) { await db.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', uid); }
// invites sent to this player (friend invites and rematch requests) that are still open
async function pendingInvites(uid: string) {
  const { data } = await db.from('games').select('id,p0,p0_name,p0_level,variant,stake,invite_code,rematch_of,created_at')
    .eq('invited', uid).eq('status', 'waiting').gte('created_at', new Date(Date.now() - 600e3).toISOString()).order('created_at', { ascending: false }).limit(5);
  return data || [];
}
async function unseenPrizes(uid: string) {
  const { data } = await db.from('weekly_prizes').select('week,rank,coins').eq('user_id', uid).eq('seen', false);
  return data || [];
}
const isUuid = (x: unknown) => typeof x === 'string' && /^[0-9a-f-]{36}$/i.test(x);
async function playedTogether(a: string, b: string) {
  const { data } = await db.from('games').select('id').in('status', ['active', 'finished'])
    .or(`and(p0.eq.${a},p1.eq.${b}),and(p0.eq.${b},p1.eq.${a})`).limit(1);
  return !!(data && data.length);
}
async function isFriendRow(a: string, b: string) {
  const { data } = await db.from('friends').select('user_id').eq('user_id', a).eq('friend_id', b).maybeSingle();
  return !!data;
}

async function finish(g: Game, winner: number, reason: string, points: number) {
  await rpc('settle_game', { p_game: g.id, p_winner: winner, p_reason: reason, p_points: points });
  return await loadGame(g.id);
}

const ACTIONS: Record<string, (uid: string, a: any) => Promise<unknown>> = {
  // ---------------------------------------------------------------- account
  async me(uid) {
    await touch(uid);
    const p = await profile(uid);
    return { profile: p, game: await activeGame(uid), daily: dailyStatus(p), prizes: await unseenPrizes(uid), invites: await pendingInvites(uid) };
  },

  // called every ~45 s while the app is open: keeps "online" status fresh and picks up invites
  async ping(uid) { await touch(uid); return { invites: await pendingInvites(uid) }; },

  // ---------------------------------------------------------------- daily bonus, XP, weekly prizes
  async claim_daily(uid) {
    const r = await rpc('claim_daily', { p_user: uid });
    const p = await profile(uid);
    return { ...r, profile: p, daily: dailyStatus(p) };
  },

  async ack_prizes(uid) { await db.from('weekly_prizes').update({ seen: true }).eq('user_id', uid).eq('seen', false); return { ok: true }; },

  // a finished game against the bot; rate-limited because the result comes from the phone
  async bot_result(uid, a) {
    const p = await profile(uid);
    if (p.last_bot_xp_at && Date.parse(p.last_bot_xp_at) > Date.now() - 90e3) throw new Fail('too_soon');
    await db.from('profiles').update({ last_bot_xp_at: new Date().toISOString() }).eq('id', uid);
    const xp = a.won ? (a.mars ? 30 : 20) : 8;
    const r = await rpc('add_xp', { p_user: uid, p_xp: xp });
    return { xp: r, profile: await profile(uid) };
  },

  async leaderboard(uid, a) { return await rpc('leaderboard', { p_user: uid, p_board: a.board === 'coins' ? 'coins' : 'wins' }); },

  // ---------------------------------------------------------------- friends
  async friends(uid) { await touch(uid); return { friends: await rpc('friends_list', { p_user: uid }) }; },

  async friend_add(uid, a) {
    if (!isUuid(a.user_id) || a.user_id === uid) throw new Fail('bad_user');
    if (!(await isFriendRow(a.user_id, uid)) && !(await playedTogether(uid, a.user_id))) throw new Fail('not_played');
    const { count } = await db.from('friends').select('user_id', { count: 'exact', head: true }).eq('user_id', uid);
    if ((count || 0) >= 200) throw new Fail('too_many_friends');
    const { error } = await db.from('friends').upsert({ user_id: uid, friend_id: a.user_id }, { onConflict: 'user_id,friend_id', ignoreDuplicates: true });
    if (error) throw error;
    return { friends: await rpc('friends_list', { p_user: uid }) };
  },

  async friend_remove(uid, a) {
    if (!isUuid(a.user_id)) throw new Fail('bad_user');
    await db.from('friends').delete().eq('user_id', uid).eq('friend_id', a.user_id);
    await db.from('friends').delete().eq('user_id', a.user_id).eq('friend_id', uid);
    return { friends: await rpc('friends_list', { p_user: uid }) };
  },

  async invite_decline(uid, a) {
    await db.from('games').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', a.game_id).eq('invited', uid).eq('status', 'waiting');
    return { ok: true };
  },

  // ---------------------------------------------------------------- rematch (same opponent, same stake; colours are re-rolled)
  async rematch(uid, a) {
    if (!isUuid(a.game_id)) throw new Fail('bad_game');
    const old = await loadGame(a.game_id);
    const r = await rpc('rematch', { p_user: uid, p_old: old.id, p_state: N.newGame(old.variant), p_opening: openingRoll() });
    if (r.game_id) return { game: await loadGame(r.game_id) };
    return { waiting: await loadGame(r.waiting) };
  },

  async set_name(uid, a) {
    const name = String(a.name || '').normalize('NFC').replace(/\s+/g, ' ').trim();
    if (!/^[\p{L}\p{N} _.-]{2,16}$/u.test(name)) throw new Fail('bad_name');
    await db.from('profiles').update({ name }).eq('id', uid);
    return { profile: await profile(uid) };
  },

  async buy(uid, a) {
    await rpc('buy_item', { p_user: uid, p_kind: a.kind, p_id: a.id });
    return ACTIONS.equip(uid, a);
  },

  async equip(uid, a) {
    const p = await profile(uid);
    if (a.kind === 'skins' && p.owned_skins.includes(a.id)) p.equip.skin = a.id;
    else if (a.kind === 'sets' && p.owned_sets.includes(a.id)) p.equip.set = a.id;
    else if (a.kind === 'dice' && (p.owned_dice || []).includes(a.id)) p.equip.dice = a.id;
    else throw new Fail('not_owned');
    await db.from('profiles').update({ equip: p.equip }).eq('id', uid);
    return { profile: await profile(uid) };
  },

  async ad_reward(uid) { await rpc('grant_coins', { p_user: uid, p_amount: 50, p_reason: 'ad' }); return { profile: await profile(uid) }; },

  async preview_pack(uid, a) {
    if (!PACKS.includes(a.amount)) throw new Fail('bad_amount');
    await rpc('grant_coins', { p_user: uid, p_amount: a.amount, p_reason: 'preview_pack' });
    return { profile: await profile(uid) };
  },

  // ---------------------------------------------------------------- friend games
  async invite_create(uid, a) {
    if (!variantOk(a.variant)) throw new Fail('bad_variant');
    const cur = await activeGame(uid);
    if (cur && cur.status === 'active') throw new Fail('already_in_game');
    let invited = null;
    if (a.friend_id !== undefined) {
      if (!isUuid(a.friend_id) || !(await isFriendRow(uid, a.friend_id)) || !(await isFriendRow(a.friend_id, uid))) throw new Fail('not_friends');
      invited = a.friend_id;
    }
    await db.from('games').update({ status: 'cancelled' }).eq('p0', uid).eq('status', 'waiting');
    const p = await profile(uid);
    for (let i = 0; i < 5; i++) {
      const code = inviteCode();
      const { data, error } = await db.from('games').insert({
        variant: a.variant, kind: 'invite', status: 'waiting', invite_code: code, p0: uid, p0_name: p.name, p0_level: p.level, invited, state: N.newGame(a.variant),
      }).select().single();
      if (!error) return { game: data };
      if (error.code !== '23505') throw error;   // retry only on a duplicate code
    }
    throw new Fail('try_again');
  },

  async invite_join(uid, a) {
    const code = String(a.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const { data: g } = await db.from('games').select('*').eq('invite_code', code).maybeSingle();
    if (!g || g.status !== 'waiting' || g.p1) throw new Fail('invite_gone', 404);
    if (g.p0 === uid) throw new Fail('own_invite');
    const cur = await activeGame(uid);
    if (cur && cur.status === 'active') throw new Fail('already_in_game');
    const p = await profile(uid), op = openingRoll();
    const { data, error } = await db.from('games').update({
      p1: uid, p1_name: p.name, p1_level: p.level, status: 'active', opening: op, turn: op[0] > op[1] ? 0 : 1, phase: 'roll',
      deadline: later(TURN_SECONDS + FIRST_TURN_GRACE), move_no: g.move_no + 1, updated_at: new Date().toISOString(),
    }).eq('id', g.id).eq('status', 'waiting').is('p1', null).select().maybeSingle();
    if (error) throw error; if (!data) throw new Fail('invite_gone', 404);
    return { game: data };
  },

  async invite_cancel(uid, a) {
    await db.from('games').update({ status: 'cancelled' }).eq('id', a.game_id).eq('p0', uid).eq('status', 'waiting');
    return { ok: true };
  },

  // ---------------------------------------------------------------- coin rooms
  async queue(uid, a) {
    if (!variantOk(a.variant)) throw new Fail('bad_variant');
    if (!ROOMS.includes(a.stake)) throw new Fail('bad_room');
    const r = await rpc('matchmake', { p_user: uid, p_variant: a.variant, p_stake: a.stake, p_state: N.newGame(a.variant), p_opening: openingRoll() });
    return r.game_id ? { game: await loadGame(r.game_id) } : { queued: true };
  },

  // the waiting player calls this every few seconds: keeps their place and tells them when they were matched
  async queue_ping(uid) {
    await db.from('match_queue').update({ seen_at: new Date().toISOString() }).eq('user_id', uid);
    const { data } = await db.from('games').select('*').eq('p0', uid).eq('status', 'active').eq('kind', 'match')
      .gte('created_at', new Date(Date.now() - 120000).toISOString()).limit(1);
    if (data && data[0]) return { game: data[0] };
    const { data: q } = await db.from('match_queue').select('user_id').eq('user_id', uid).maybeSingle();
    return { queued: !!q };
  },

  async queue_cancel(uid) { await db.from('match_queue').delete().eq('user_id', uid); return { ok: true }; },

  // ---------------------------------------------------------------- playing
  async roll(uid, a) {
    const g = await loadGame(a.game_id), me = seat(g, uid);
    if (g.status !== 'active') throw new Fail('not_active');
    if (me !== g.turn) throw new Fail('not_your_turn');
    if (g.phase !== 'roll') throw new Fail('already_rolled');
    const d = [die(), die()], t = new N.Turn(g.state, me, d[0], d[1]);
    if (t.total === 0) {   // nothing playable: the turn passes
      return { game: await save(g, { state: t.finish(), turn: 1 - me, phase: 'roll', dice: null, last_moves: [], last_player: me, last_dice: d, deadline: later(TURN_SECONDS) }) };
    }
    return { game: await save(g, { phase: 'move', dice: d }) };
  },

  // the whole turn is sent at once; the server replays it move by move
  async move(uid, a) {
    const g = await loadGame(a.game_id), me = seat(g, uid);
    if (g.status !== 'active') throw new Fail('not_active');
    if (me !== g.turn) throw new Fail('not_your_turn');
    if (g.phase !== 'move' || !g.dice) throw new Fail('roll_first');
    if (!Array.isArray(a.moves) || a.moves.length > 4) throw new Fail('bad_moves');
    const t = new N.Turn(g.state, me, g.dice[0], g.dice[1]), played = [];
    for (const m of a.moves) {
      const legal = t.legal().find((x: any) => x.from === m?.from && x.to === m?.to && x.die === m?.die);
      if (!legal) throw new Fail('illegal_move');
      t.play(legal); played.push(legal);
    }
    if (!t.done()) throw new Fail('turn_incomplete');
    const ns = t.finish(), w = N.winner(ns);
    const base = { state: ns, last_moves: played, last_player: me, last_dice: g.dice, dice: null };
    if (w >= 0) {
      const g2 = await save(g, { ...base, phase: 'roll' });
      return { game: await finish(g2, w, 'win', N.resultPoints(ns, w)) };
    }
    return { game: await save(g, { ...base, turn: 1 - me, phase: 'roll', deadline: later(TURN_SECONDS) }) };
  },

  async resign(uid, a) {
    const g = await loadGame(a.game_id), me = seat(g, uid);
    if (me < 0) throw new Fail('not_your_game');
    if (g.status !== 'active') throw new Fail('not_active');
    return { game: await finish(g, 1 - me, 'resign', 1) };
  },

  async claim_timeout(uid, a) {
    const g = await loadGame(a.game_id), me = seat(g, uid);
    if (me < 0) throw new Fail('not_your_game');
    if (g.status !== 'active') throw new Fail('not_active');
    if (g.turn === me) throw new Fail('your_turn');
    if (!g.deadline || Date.parse(g.deadline) > Date.now()) throw new Fail('not_yet');
    return { game: await finish(g, me, 'timeout', 1) };
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const { data: { user }, error } = await db.auth.getUser(jwt);
    if (error || !user) throw new Fail('unauthorized', 401);
    const body = await req.json().catch(() => ({}));
    const fn = ACTIONS[body?.action];
    if (!fn) throw new Fail('unknown_action');
    return reply(await fn(user.id, body));
  } catch (e) {
    if (e instanceof Fail) return reply({ error: e.code }, e.status);
    console.error(e);
    return reply({ error: 'server_error' }, 500);
  }
});
