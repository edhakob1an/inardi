// iNardi game server. One endpoint, POST { action, ...args } with the player's session token.
// The server rolls every die and replays every move through the same rules engine the game uses,
// so a modified client can't fake rolls, play illegal moves or touch coin balances.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import './engine.js';
import './bot.js';

// deno-lint-ignore no-explicit-any
const N: any = (globalThis as any).Nardi;
// deno-lint-ignore no-explicit-any
const Bot: any = (globalThis as any).NardiBot;
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

const TURN_SECONDS = 60;          // time for one turn (roll + moves)
const FIRST_TURN_GRACE = 10;      // extra seconds when a game starts
const ROOMS = [100, 500, 1000, 5000, 10000];   // coin rooms for random matchmaking
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

// ---------------------------------------------------------------- achievements
// stat -> thresholds per tier, coins per tier, optional exclusive item unlocked at a tier
type Tier = { n: number; coins: number; unlock?: [string, string] };
const ACH: { id: string; stat: string; tiers: Tier[] }[] = [
  { id: 'first_win', stat: 'won', tiers: [{ n: 1, coins: 10 }] },
  { id: 'champion', stat: 'won', tiers: [{ n: 10, coins: 30 }, { n: 50, coins: 100 }, { n: 250, coins: 300 }] },
  { id: 'streak', stat: 'best_streak', tiers: [{ n: 3, coins: 20 }, { n: 5, coins: 60 }, { n: 10, coins: 200 }] },
  { id: 'mars', stat: 'mars_wins', tiers: [{ n: 1, coins: 15 }, { n: 10, coins: 80 }, { n: 50, coins: 250 }] },
  { id: 'comeback', stat: 'comebacks', tiers: [{ n: 1, coins: 20 }, { n: 5, coins: 80 }, { n: 20, coins: 250 }] },
  { id: 'doubles', stat: 'perfect_doubles', tiers: [{ n: 1, coins: 30 }] },
  { id: 'untouchable', stat: 'untouched_wins', tiers: [{ n: 1, coins: 20 }, { n: 5, coins: 80 }, { n: 20, coins: 250 }] },
  { id: 'speed', stat: 'fast_wins', tiers: [{ n: 1, coins: 15 }, { n: 5, coins: 60 }, { n: 20, coins: 200 }] },
  { id: 'both', stat: 'both', tiers: [{ n: 3, coins: 20 }, { n: 10, coins: 80 }, { n: 30, coins: 250 }] },
  { id: 'high_roller', stat: 'high_rooms', tiers: [{ n: 1, coins: 50 }, { n: 2, coins: 150 }, { n: 3, coins: 400 }] },
  { id: 'fortune', stat: 'coins_won_total', tiers: [{ n: 10000, coins: 50 }, { n: 100000, coins: 300 }, { n: 1000000, coins: 1500 }] },
  { id: 'royal', stat: 'royal_wins', tiers: [{ n: 1, coins: 500, unlock: ['avatars', 'crown'] }] },
  { id: 'friendly', stat: 'friends', tiers: [{ n: 1, coins: 10 }, { n: 5, coins: 40 }, { n: 20, coins: 150 }] },
  { id: 'good_sport', stat: 'gg_count', tiers: [{ n: 5, coins: 10 }, { n: 25, coins: 40 }, { n: 100, coins: 150 }] },
  { id: 'rematch', stat: 'rematches', tiers: [{ n: 1, coins: 10 }, { n: 10, coins: 50 }, { n: 50, coins: 200 }] },
  { id: 'daily', stat: 'daily7', tiers: [{ n: 1, coins: 30 }, { n: 5, coins: 150 }, { n: 20, coins: 500 }] },
  { id: 'veteran', stat: 'level', tiers: [{ n: 5, coins: 50 }, { n: 10, coins: 150 }, { n: 25, coins: 500 }] },
  { id: 'collector', stat: 'owned', tiers: [{ n: 5, coins: 30 }, { n: 10, coins: 100 }, { n: 20, coins: 300 }] },
  { id: 'top10', stat: 'top10', tiers: [{ n: 1, coins: 100, unlock: ['frames', 'laurel'] }, { n: 5, coins: 300 }, { n: 20, coins: 800 }] },
  { id: 'number_one', stat: 'number_one', tiers: [{ n: 1, coins: 500, unlock: ['avatars', 'ara_gold'] }] },
];
async function achStats(uid: string, p: Game) {
  const [{ count: f1 }, prizes] = await Promise.all([
    db.from('friends').select('friend_id', { count: 'exact', head: true }).eq('user_id', uid),
    db.from('weekly_prizes').select('rank').eq('user_id', uid),
  ]);
  const { data: mine } = await db.from('friends').select('friend_id').eq('user_id', uid);
  let friends = 0;
  if (mine && mine.length) {
    const { count } = await db.from('friends').select('user_id', { count: 'exact', head: true }).eq('friend_id', uid).in('user_id', mine.map((x: any) => x.friend_id));
    friends = count || 0;
  }
  const owned = (p.owned_skins.length - 1) + (p.owned_sets.length - 1) + ((p.owned_dice || []).length - 1) + ((p.owned_avatars || []).length - 1) + ((p.owned_frames || []).length - 1);
  const pr = prizes.data || [];
  return { won: p.won, best_streak: p.best_streak, mars_wins: p.mars_wins, comebacks: p.comebacks, perfect_doubles: p.perfect_doubles,
    untouched_wins: p.untouched_wins, fast_wins: p.fast_wins, both: Math.min(p.short_wins, p.long_wins), high_rooms: (p.high_rooms || []).length,
    coins_won_total: p.coins_won_total, royal_wins: p.royal_wins, friends, gg_count: p.gg_count, rematches: p.rematches, daily7: p.daily7,
    level: p.level, owned, top10: pr.filter((x: any) => x.rank <= 10).length, number_one: pr.filter((x: any) => x.rank === 1).length, _f: f1 } as Record<string, number>;
}
// grant every tier the player has reached but not yet received; returns what was new
async function checkAch(uid: string) {
  let p = await profile(uid);
  const st = await achStats(uid, p), got: { id: string; tier: number; coins: number; unlock?: [string, string] }[] = [];
  for (const a of ACH) {
    const have = Number(p.ach?.[a.id] || 0), reach = a.tiers.filter(t => (st[a.stat] || 0) >= t.n).length;
    for (let t = have + 1; t <= reach; t++) {
      const T = a.tiers[t - 1];
      const { data } = await db.rpc('ach_grant', { p_user: uid, p_id: a.id, p_tier: t, p_coins: T.coins, p_kind: T.unlock?.[0] || '', p_item: T.unlock?.[1] || '' });
      if (data === true) got.push({ id: a.id, tier: t, coins: T.coins, unlock: T.unlock });
    }
  }
  if (got.length) p = await profile(uid);
  return { profile: p, ach_new: got, ach_stats: st };
}

// ---------------------------------------------------------------- cases
// odds per case; 'rare' = a dice or checker set, 'epic' = a board, frame or premium avatar, 'legendary' = case-only items
type Drop = { w: number; coins?: number; pearls?: number; tier?: 'rare' | 'epic' | 'legendary' };
const CASES: Record<string, { price: number; drops: Drop[] }> = {
  bronze: { price: 30, drops: [{ w: 40, coins: 200 }, { w: 25, coins: 500 }, { w: 20, pearls: 10 }, { w: 10, pearls: 25 }, { w: 5, tier: 'rare' }] },
  silver: { price: 80, drops: [{ w: 30, coins: 500 }, { w: 20, coins: 1500 }, { w: 20, pearls: 25 }, { w: 15, pearls: 60 }, { w: 10, tier: 'rare' }, { w: 5, tier: 'epic' }] },
  gold:   { price: 200, drops: [{ w: 25, coins: 2000 }, { w: 20, pearls: 60 }, { w: 20, pearls: 150 }, { w: 15, tier: 'rare' }, { w: 15, tier: 'epic' }, { w: 5, tier: 'legendary' }] },
};
const POOL: Record<string, [string, string][]> = {
  rare: [['dice', 'wood'], ['dice', 'pearl'], ['dice', 'obsidian'], ['dice', 'lapis'], ['sets', 'bone'], ['sets', 'pearl'], ['sets', 'tuff'], ['sets', 'amber']],
  epic: [['skins', 'oak'], ['skins', 'ebony'], ['skins', 'tuff'], ['skins', 'garnet'], ['frames', 'gold'], ['frames', 'garnet'], ['frames', 'lapis'], ['avatars', 'star'], ['avatars', 'goldsign'], ['avatars', 'silversign']],
  legendary: [['avatars', 'pearl'], ['frames', 'pearl'], ['frames', 'diamond']],
};
const DUP = { rare: 30, epic: 80, legendary: 200 };
function rnd(n: number) { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] % n; }
const ownedOf = (p: Game, k: string): string[] => ({ skins: p.owned_skins, sets: p.owned_sets, dice: p.owned_dice, avatars: p.owned_avatars, frames: p.owned_frames } as any)[k] || [];

async function finish(g: Game, winner: number, reason: string, points: number) {
  await rpc('settle_game', { p_game: g.id, p_winner: winner, p_reason: reason, p_points: points });
  return await loadGame(g.id);
}

// ---------------------------------------------------------------- fill-in opponents
// A believable player for a table nobody else is at: a local-sounding name, a level that fits the room,
// cosmetics and lifetime statistics to match. Dice and rules are exactly those of a real game.
const BOT_FIRST = ['Ashot', 'Narek', 'Gor', 'Tigran', 'Armen', 'Davit', 'Hayk', 'Karen', 'Vardan', 'Aram', 'Levon', 'Sargis', 'Artur', 'Samvel', 'Vahe',
  'Hovhannes', 'Gagik', 'Arsen', 'Edgar', 'Mher', 'Ruben', 'Suren', 'Garik', 'Robert', 'Arman', 'Erik', 'Gevorg', 'Mkrtich', 'Rafik', 'Ararat',
  'Lilit', 'Anahit', 'Ani', 'Mariam', 'Nare', 'Gayane', 'Sona', 'Lusine', 'Astghik', 'Hasmik', 'Armine', 'Siranush',
  'Sergey', 'Andrey', 'Dima', 'Alex', 'Misha', 'Oleg', 'Artyom', 'Vova', 'Igor', 'Kolya', 'Anna', 'Olga', 'Irina',
  'Ali', 'Murad', 'Reza', 'George', 'Nick', 'David', 'Sam'];
const BOT_NICK = ['Davo', 'Gogo', 'Tiko', 'Aro', 'Hayko', 'Naro', 'Vazo', 'Arto', 'Sako', 'Rubo', 'Mko', 'Gev', 'Edo', 'Levo', 'Suro'];
const BOT_TAIL = ['nardi', 'Nardi', 'king', 'pro', 'master', 'yan', 'Erevan', 'GY', 'arm', 'zone', 'Zar', 'boss'];
function rint(a: number, b: number) { return a + rnd(b - a + 1); }
function pick<T>(xs: T[]): T { return xs[rnd(xs.length)]; }
function botName() {
  const f = Math.random() < .12 ? pick(BOT_NICK) : pick(BOT_FIRST), t = rnd(10);
  if (t < 3) return f + rint(1, 99);                                  // Ashot77
  if (t < 5) return f + rint(1970, 2006);                             // Gor1985
  if (t < 6) return f + '_' + rint(1, 999);                           // Narek_92
  if (t < 7) return f + '.' + 'ABDGHKLMNPSTV'[rnd(13)];               // Lilit.A
  if (t < 8) return f + '_' + pick(BOT_TAIL);                         // Davo_nardi
  if (t < 9) return f.toLowerCase() + rint(10, 99);                   // tigran23
  return f;                                                           // Hayk
}
const BOT_LEVELS: Record<number, [number, number]> = { 100: [2, 12], 500: [5, 18], 1000: [8, 24], 5000: [14, 34], 10000: [20, 45] };
const BOT_AVATARS: [string, number][] = [['default', 40], ['ararat', 12], ['pomegranate', 12], ['star', 9], ['eternity', 8], ['garnet', 7], ['goldsign', 5], ['silversign', 5], ['pearl', 2]];
const BOT_FRAMES: [string, number][] = [['none', 34], ['bronze', 20], ['silver', 16], ['gold', 12], ['garnet', 7], ['lapis', 6], ['diamond', 3], ['pearl', 2]];
function weighted(xs: [string, number][], boost = 0) {
  const w = xs.map(([, n], i) => n * (1 + boost * i / xs.length)), sum = w.reduce((a, b) => a + b, 0); let r = Math.random() * sum;
  for (let i = 0; i < xs.length; i++) { r -= w[i]; if (r <= 0) return xs[i][0]; }
  return xs[0][0];
}
function makeBot(stake: number, myLevel: number) {
  const [lo, hi] = BOT_LEVELS[stake] || [3, 15];
  let level = rint(lo, hi);
  if (myLevel >= lo && myLevel <= hi && Math.random() < .5) level = Math.max(lo, Math.min(hi, myLevel + rint(-3, 4)));   // often near your own level
  const played = Math.round(level * rint(9, 16) + rint(0, 30)), won = Math.round(played * (.42 + Math.random() * .16));
  const short_wins = Math.round(won * (.3 + Math.random() * .5)), long_wins = won - short_wins;
  const boost = Math.min(2, level / 18);
  const stats: Record<string, number> = {
    won, best_streak: Math.min(won, rint(2, 5) + Math.floor(level / 6)), mars_wins: Math.round(won * (.06 + Math.random() * .1)),
    comebacks: Math.round(won * Math.random() * .03), perfect_doubles: Math.random() < level / 60 ? 1 : 0,
    untouched_wins: Math.round(short_wins * Math.random() * .06), fast_wins: Math.round(won * Math.random() * .05), both: Math.min(short_wins, long_wins),
    high_rooms: stake >= 5000 ? rint(1, 3) : stake >= 1000 ? rint(0, 2) : 0,
    coins_won_total: Math.round(won * stake * (.4 + Math.random() * .5) + won * 120), royal_wins: stake === 10000 && Math.random() < .5 ? rint(1, 6) : 0,
    friends: rint(0, Math.min(6, Math.floor(level / 5))), gg_count: rint(0, Math.floor(played / 12)), rematches: rint(0, Math.floor(played / 30)),
    daily7: rint(0, Math.floor(level / 10)), level, owned: Math.min(22, Math.floor(level / 3) + rint(0, 2)), top10: 0, number_one: 0,
  };
  const ach: Record<string, number> = {};
  for (const a of ACH) { const n = a.tiers.filter(t => (stats[a.stat] || 0) >= t.n).length; if (n) ach[a.id] = n; }
  return {
    id: crypto.randomUUID(), name: botName(), level, xp: 50 * level * (level - 1) + rint(0, level * 40),
    avatar: weighted(BOT_AVATARS, boost), frame: weighted(BOT_FRAMES, boost),
    skill: Math.random() < (stake >= 5000 ? .75 : stake >= 1000 ? .6 : .45) ? 'normal' : 'easy',
    played, won, streak: rint(0, 3), best_streak: stats.best_streak, mars_wins: stats.mars_wins, coins_won_total: stats.coins_won_total,
    bot_played: rint(0, 40), bot_won: 0, created_at: new Date(Date.now() - rint(20, 330) * 864e5).toISOString(), ach, stats,
  };
}
// a finished-or-running game whose computer opponent has this id
async function botById(id: string) {
  const { data } = await db.from('games').select('bot').eq('bot->>id', id).order('created_at', { ascending: false }).limit(1);
  return data && data[0] ? data[0].bot : null;
}
function botCard(b: Game) {
  const keys = ['id', 'name', 'level', 'xp', 'played', 'won', 'streak', 'best_streak', 'mars_wins', 'coins_won_total', 'bot_played', 'bot_won', 'created_at', 'ach', 'avatar', 'frame'];
  const c: Game = {}; for (const k of keys) c[k] = b[k];
  c.bot_won = Math.round((b.bot_played || 0) * .7);
  return { ...c, online: true };
}
// play the computer opponent's whole turn: fair dice, a move chosen by the bot, replayed through the rules engine
async function playBotTurn(g: Game) {
  const bs = Number(g.bot.seat), d = [die(), die()];
  const sixes = [...(g.sixes || [0, 0])]; if (d[0] === 6 && d[1] === 6) sixes[bs]++;
  const t = new N.Turn(g.state, bs, d[0], d[1]);
  if (t.total === 0) return await save(g, { sixes, state: t.finish(), turn: 1 - bs, phase: 'roll', dice: null, last_moves: [], last_player: bs, last_dice: d, deadline: later(TURN_SECONDS) });
  const choice = Bot.chooseTurn(g.state, bs, d[0], d[1], g.bot.skill === 'easy' ? 'easy' : 'normal'), played: Game[] = [];
  for (const m of choice.moves) {
    const legal = t.legal().find((x: Game) => x.from === m.from && x.to === m.to && x.die === m.die);
    if (!legal) break;
    t.play(legal); played.push(legal);
  }
  const ns = t.finish(), w = N.winner(ns);
  const hits = [...(g.hits || [0, 0])], behind = [...(g.behind || [0, 0])];
  hits[bs] += played.filter(m => m.hit).length;
  const pp = [N.pips(ns, 0), N.pips(ns, 1)];
  for (const s of [0, 1]) behind[s] = Math.max(behind[s], pp[s] - pp[1 - s]);
  const base = { sixes, state: ns, last_moves: played, last_player: bs, last_dice: d, dice: null, hits, behind };
  if (w >= 0) { const g2 = await save(g, { ...base, phase: 'roll' }); return await finish(g2, w, 'win', N.resultPoints(ns, w)); }
  return await save(g, { ...base, turn: 1 - bs, phase: 'roll', deadline: later(TURN_SECONDS) });
}

const ACTIONS: Record<string, (uid: string, a: any) => Promise<unknown>> = {
  // ---------------------------------------------------------------- account
  async me(uid) {
    await touch(uid);
    const { profile: p, ach_new, ach_stats } = await checkAch(uid);
    return { ach_new, ach_stats, profile: p, game: await activeGame(uid), daily: dailyStatus(p), prizes: await unseenPrizes(uid), invites: await pendingInvites(uid) };
  },

  // called every ~45 s while the app is open: keeps "online" status fresh and picks up invites
  async ping(uid) { await touch(uid); return { invites: await pendingInvites(uid) }; },

  // ---------------------------------------------------------------- daily bonus, XP, weekly prizes
  async claim_daily(uid) {
    const r = await rpc('claim_daily', { p_user: uid });
    const { profile: p, ach_new } = await checkAch(uid);
    return { ...r, profile: p, daily: dailyStatus(p), ach_new };
  },

  async ack_prizes(uid) { await db.from('weekly_prizes').update({ seen: true }).eq('user_id', uid).eq('seen', false); return { ok: true }; },

  // a finished game against the bot; rate-limited because the result comes from the phone
  async bot_result(uid, a) {
    const p = await profile(uid);
    if (p.last_bot_xp_at && Date.parse(p.last_bot_xp_at) > Date.now() - 90e3) throw new Fail('too_soon');
    await db.from('profiles').update({ last_bot_xp_at: new Date().toISOString() }).eq('id', uid);
    const xp = a.won ? (a.mars ? 30 : 20) : 8;
    await db.from('profiles').update({ bot_played: p.bot_played + 1, bot_won: p.bot_won + (a.won ? 1 : 0) }).eq('id', uid);
    const r = await rpc('add_xp', { p_user: uid, p_xp: xp });
    const c = await checkAch(uid);
    return { xp: r, profile: c.profile, ach_new: c.ach_new };
  },

  // public card of a player: what an opponent sees when tapping their name
  async player(_uid, a) {
    if (!isUuid(a.user_id)) throw new Fail('bad_user');
    const { count: real } = await db.from('profiles').select('id', { count: 'exact', head: true }).eq('id', a.user_id);
    if (!real) { const b = await botById(a.user_id); if (b) return { player: botCard(b) }; }
    const { data: p } = await db.from('profiles').select('id,name,level,xp,played,won,streak,best_streak,mars_wins,coins_won_total,bot_played,bot_won,equip,created_at,last_seen,ach').eq('id', a.user_id).maybeSingle();
    if (!p) throw new Fail('no_profile', 404);
    return { player: { ...p, avatar: p.equip?.avatar || 'default', frame: p.equip?.frame || 'none', equip: undefined,
      online: !!p.last_seen && Date.parse(p.last_seen) > Date.now() - 75e3, last_seen: undefined } };
  },

  async case_buy(uid, a) {
    const c = CASES[a.kind]; if (!c) throw new Fail('bad_case');
    await rpc('case_buy', { p_user: uid, p_kind: a.kind, p_price: c.price });
    return { profile: await profile(uid) };
  },
  async case_daily(uid) { await rpc('case_daily', { p_user: uid }); return { profile: await profile(uid) }; },
  async case_open(uid, a) {
    const c = CASES[a.kind]; if (!c) throw new Fail('bad_case');
    const p = await profile(uid);
    if (!(Number(p.cases?.[a.kind]) > 0)) throw new Fail('no_case');
    let r = rnd(c.drops.reduce((n, d) => n + d.w, 0)), d = c.drops[0];
    for (const x of c.drops) { if (r < x.w) { d = x; break; } r -= x.w; }
    let item: [string, string] | null = null;
    if (d.tier) {
      const pool = POOL[d.tier], fresh = pool.filter(([k, id]) => !ownedOf(p, k).includes(id));
      const from = fresh.length ? fresh : pool;      // everything owned: the item comes as a duplicate and turns into pearls
      item = from[rnd(from.length)];
    }
    const res = await rpc('case_apply', { p_user: uid, p_kind: a.kind, p_coins: d.coins || 0, p_pearls: d.pearls || 0,
      p_item_kind: item ? item[0] : '', p_item_id: item ? item[1] : '', p_dup: d.tier ? DUP[d.tier] : 0 });
    const reward = { coins: d.coins || 0, pearls: res.pearls, tier: d.tier || (d.pearls ? 'pearls' : 'coins'), item, dup: res.dup };
    const ch = await checkAch(uid);
    return { reward, profile: ch.profile, ach_new: ch.ach_new };
  },

  async leaderboard(uid, a) { return await rpc('leaderboard', { p_user: uid, p_board: a.board === 'coins' ? 'coins' : 'wins' }); },

  // ---------------------------------------------------------------- friends
  async friends(uid) { await touch(uid); return { friends: await rpc('friends_list', { p_user: uid }) }; },

  async friend_add(uid, a) {
    if (!isUuid(a.user_id) || a.user_id === uid) throw new Fail('bad_user');
    // a computer opponent: nothing is stored, it never becomes a friend
    if (!(await isFriendRow(a.user_id, uid)) && (await botById(a.user_id))) return { friends: await rpc('friends_list', { p_user: uid }) };
    if (!(await isFriendRow(a.user_id, uid)) && !(await playedTogether(uid, a.user_id))) throw new Fail('not_played');
    const { count } = await db.from('friends').select('user_id', { count: 'exact', head: true }).eq('user_id', uid);
    if ((count || 0) >= 200) throw new Fail('too_many_friends');
    const { error } = await db.from('friends').upsert({ user_id: uid, friend_id: a.user_id }, { onConflict: 'user_id,friend_id', ignoreDuplicates: true });
    if (error) throw error;
    const c = await checkAch(uid);
    return { friends: await rpc('friends_list', { p_user: uid }), ach_new: c.ach_new, profile: c.profile };
  },

  // "Good game" / "Well played" sent to the opponent: counts once per game
  async gg(uid, a) {
    const g = await loadGame(a.game_id), me = seat(g, uid);
    if (me < 0) throw new Fail('not_your_game');
    if (!(g.status === 'active' || (g.status === 'finished' && Date.parse(g.updated_at) > Date.now() - 600e3))) throw new Fail('not_active');
    if (g.gg[me]) return { ok: true };
    const gg = [...g.gg]; gg[me] = 1;
    await db.from('games').update({ gg }).eq('id', g.id);
    const p = await profile(uid);
    await db.from('profiles').update({ gg_count: p.gg_count + 1 }).eq('id', uid);
    const c = await checkAch(uid);
    return { ok: true, ach_new: c.ach_new, profile: c.profile };
  },

  async achievements(uid, a) {
    const id = isUuid(a.user_id) ? a.user_id : uid;
    if (id === uid) { const c = await checkAch(uid); return { ach: c.profile.ach, stats: c.ach_stats, ach_new: c.ach_new, profile: c.profile }; }
    const { count: real } = await db.from('profiles').select('id', { count: 'exact', head: true }).eq('id', id);
    if (!real) { const b = await botById(id); if (b) return { ach: b.ach, stats: b.stats }; }
    const p = await profile(id);
    return { ach: p.ach, stats: await achStats(id, p) };
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
    if (old.bot) {
      if (seat(old, uid) !== 0) throw new Fail('not_your_game');
      const prior = await db.from('games').select('id,status').eq('rematch_of', old.id).limit(1);
      if (prior.data && prior.data[0]) {
        if (prior.data[0].status === 'active') return { game: await loadGame(prior.data[0].id) };
        return { waiting: prior.data[0] };
      }
      await new Promise(res => setTimeout(res, 2500 + rnd(4000)));
      if (Math.random() < .55) {
        const r = await rpc('bot_rematch', { p_user: uid, p_old: old.id, p_state: N.newGame(old.variant), p_opening: openingRoll() });
        if (r.game_id) return { game: await loadGame(r.game_id) };
      }
      const { data: w, error } = await db.from('games').insert({ variant: old.variant, stake: old.stake, kind: 'invite', status: 'cancelled', p0: uid, p0_name: old.p0_name, rematch_of: old.id, state: null }).select().maybeSingle();
      if (error) throw error;
      return { waiting: w };
    }
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
    const r: any = await ACTIONS.equip(uid, a), c = await checkAch(uid);
    return { ...r, profile: c.profile, ach_new: c.ach_new };
  },

  async equip(uid, a) {
    const p = await profile(uid);
    if (a.kind === 'skins' && p.owned_skins.includes(a.id)) p.equip.skin = a.id;
    else if (a.kind === 'sets' && p.owned_sets.includes(a.id)) p.equip.set = a.id;
    else if (a.kind === 'dice' && (p.owned_dice || []).includes(a.id)) p.equip.dice = a.id;
    else if (a.kind === 'avatars' && (p.owned_avatars || []).includes(a.id)) p.equip.avatar = a.id;
    else if (a.kind === 'frames' && (p.owned_frames || []).includes(a.id)) p.equip.frame = a.id;
    else throw new Fail('not_owned');
    await db.from('profiles').update({ equip: p.equip }).eq('id', uid);
    return { profile: await profile(uid) };
  },

  async ad_reward(uid) { await rpc('grant_coins', { p_user: uid, p_amount: 50, p_reason: 'ad' }); return { profile: await profile(uid) }; },

  async preview_pack(uid, a) {
    if (a.currency === 'pearls') {
      if (![100, 500, 1200].includes(a.amount)) throw new Fail('bad_amount');
      await rpc('grant_pearls', { p_user: uid, p_amount: a.amount, p_reason: 'preview_pack' });
      return { profile: await profile(uid) };
    }
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
    // who else is waiting at another table or mode, so the client can offer a switch
    const { data: w } = await db.from('match_queue').select('variant,stake').neq('user_id', uid)
      .gte('seen_at', new Date(Date.now() - 20000).toISOString()).limit(20);
    return { queued: !!q, waiting: w || [] };
  },

  // nobody came to the table: the waiting player gets a computer opponent
  async queue_bot(uid, a) {
    if (!variantOk(a.variant)) throw new Fail('bad_variant');
    if (!ROOMS.includes(a.stake)) throw new Fail('bad_room');
    const me = await profile(uid);
    const r = await rpc('bot_match', { p_user: uid, p_variant: a.variant, p_stake: a.stake, p_state: N.newGame(a.variant), p_opening: openingRoll(), p_bot: makeBot(a.stake, me.level) });
    return { game: await loadGame(r.game_id) };
  },

  // the player's app asks for the computer opponent's turn after a short "thinking" pause
  async bot_turn(uid, a) {
    const g = await loadGame(a.game_id);
    if (seat(g, uid) < 0 || !g.bot) throw new Fail('not_your_game');
    if (g.status !== 'active' || g.turn !== Number(g.bot.seat) || g.phase !== 'roll') return { game: g };
    return { game: await playBotTurn(g) };
  },

  async queue_cancel(uid) { await db.from('match_queue').delete().eq('user_id', uid); return { ok: true }; },

  // ---------------------------------------------------------------- playing
  async roll(uid, a) {
    const g = await loadGame(a.game_id), me = seat(g, uid);
    if (g.status !== 'active') throw new Fail('not_active');
    if (me !== g.turn) throw new Fail('not_your_turn');
    if (g.phase !== 'roll') throw new Fail('already_rolled');
    const d = [die(), die()], t = new N.Turn(g.state, me, d[0], d[1]);
    const sixes = [...(g.sixes || [0, 0])]; if (d[0] === 6 && d[1] === 6) sixes[me]++;
    if (t.total === 0) {   // nothing playable: the turn passes
      return { game: await save(g, { sixes, state: t.finish(), turn: 1 - me, phase: 'roll', dice: null, last_moves: [], last_player: me, last_dice: d, deadline: later(TURN_SECONDS) }) };
    }
    return { game: await save(g, { sixes, phase: 'move', dice: d }) };
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
    const hits = [...(g.hits || [0, 0])], behind = [...(g.behind || [0, 0])];
    hits[me] += played.filter((m: any) => m.hit).length;
    const pp = [N.pips(ns, 0), N.pips(ns, 1)];
    for (const s of [0, 1]) behind[s] = Math.max(behind[s], pp[s] - pp[1 - s]);
    const base = { state: ns, last_moves: played, last_player: me, last_dice: g.dice, dice: null, hits, behind };
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
    if (g.bot) return { game: await playBotTurn(g) };
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
