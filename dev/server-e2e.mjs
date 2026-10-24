// End-to-end test: two guest players against the live server.
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const N = require('/home/claude/nardi/engine.js');
const B = require('/home/claude/nardi/bot.js');
const K = JSON.parse(fs.readFileSync('/home/claude/nardi/server/public_keys.json', 'utf8'));
const FN = K.url + '/functions/v1/game';
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('  FAIL:', m); } else console.log('  ok:', m); };

async function guest(label) {
  const sb = createClient(K.url, K.publishable, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.signInAnonymously();
  if (error) throw error;
  const token = data.session.access_token;
  const call = async (action, args = {}) => {
    const r = await fetch(FN, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, apikey: K.publishable }, body: JSON.stringify({ action, ...args }) });
    return r.json();
  };
  return { label, sb, call, id: data.user.id };
}

async function playOut(g, players, opts = {}) {
  let game = g, guard = 0;
  while (game.status === 'active' && guard++ < 600) {
    const P = players[game.turn];
    if (game.phase === 'roll') {
      const r = await P.call('roll', { game_id: game.id });
      if (r.error) { ok(false, 'roll error ' + r.error); return game; }
      game = r.game; continue;
    }
    // choose a turn with the bot, from the server's state and dice
    const choice = B.chooseTurn(game.state, game.turn, game.dice[0], game.dice[1], 'normal');
    if (opts.cheatOnce && !opts.cheated && choice.moves.length) {
      opts.cheated = true;
      const bad = await P.call('move', { game_id: game.id, moves: [{ from: 0, to: 23, die: 6 }] });
      ok(bad.error === 'illegal_move', 'server rejects an illegal move (' + bad.error + ')');
      const part = await P.call('move', { game_id: game.id, moves: choice.moves.slice(0, 1) });
      ok(choice.moves.length === 1 || part.error === 'turn_incomplete', 'server rejects an unfinished turn (' + (part.error || 'single move') + ')');
      const other = players[1 - game.turn];
      const wrong = await other.call('roll', { game_id: game.id });
      ok(wrong.error === 'not_your_turn' || wrong.error === 'already_rolled', 'opponent cannot act out of turn (' + wrong.error + ')');
      if (choice.moves.length === 1) { game = part.game; continue; }
    }
    const r = await P.call('move', { game_id: game.id, moves: choice.moves.map(m => ({ from: m.from, to: m.to, die: m.die })) });
    if (r.error) { ok(false, 'move error ' + r.error); return game; }
    game = r.game;
  }
  return game;
}

const coins = async (p) => (await p.call('me')).profile.coins;

console.log('1. guests sign in');
const A = await guest('A'), Bp = await guest('B');
const pa = await A.call('me'), pb = await Bp.call('me');
ok(pa.profile && pa.profile.coins === 1000, 'A gets a profile with 1000 coins: ' + pa.profile?.name);
ok(pb.profile && pb.profile.coins === 1000, 'B gets a profile with 1000 coins: ' + pb.profile?.name);

console.log('2. clients cannot write coins directly');
const upd = await A.sb.from('profiles').update({ coins: 999999 }).eq('id', A.id).select();
const after = await coins(A);
ok(after === 1000, 'direct coin edit has no effect (' + (upd.error?.message || 'no rows') + ')');
const peek = await A.sb.from('profiles').select('*').eq('id', Bp.id);
ok(!peek.data || peek.data.length === 0, 'A cannot read B\'s profile');

console.log('3. friend game by invite code (short)');
const inv = await A.call('invite_create', { variant: 'short' });
ok(inv.game && inv.game.invite_code, 'invite created: ' + inv.game?.invite_code);
const self = await A.call('invite_join', { code: inv.game.invite_code });
ok(self.error === 'own_invite', 'cannot join own invite');
const j = await Bp.call('invite_join', { code: inv.game.invite_code.toLowerCase() });
ok(j.game && j.game.status === 'active', 'B joins, game active, opening ' + j.game?.opening + ', first turn p' + j.game?.turn);
const t0 = Date.now();
const fin = await playOut(j.game, [A, Bp], { cheatOnce: true });
ok(fin.status === 'finished' && (fin.winner === 0 || fin.winner === 1), `friend game finished: winner p${fin.winner}, ${fin.points} pt, reason ${fin.end_reason}, ${fin.move_no} updates in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
ok(await coins(A) === 1000 && await coins(Bp) === 1000, 'friend games do not move coins');

console.log('4. random matchmaking, Bronze 100, long nardi');
const q1 = await A.call('queue', { variant: 'long', stake: 100 });
ok(q1.queued, 'A waits in the 100 room');
const q2 = await Bp.call('queue', { variant: 'long', stake: 100 });
ok(q2.game && q2.game.stake === 100, 'B is matched with A immediately');
const ping = await A.call('queue_ping');
ok(ping.game && ping.game.id === q2.game.id, 'A learns about the match from the ping');
ok(await coins(A) === 900 && await coins(Bp) === 900, 'both stakes taken (900 / 900)');
const dbl = await A.call('queue', { variant: 'long', stake: 100 });
ok(dbl.error === 'already_in_game', 'cannot queue while in a game');
const fin2 = await playOut(q2.game, [A, Bp]);
const ca = await coins(A), cb = await coins(Bp);
ok(fin2.status === 'finished', `room game finished: winner p${fin2.winner} (${fin2.winner === 0 ? 'A' : 'B'}), ${fin2.points} pt`);
const wA = fin2.winner === 0;  // A was the waiting player -> seat 0
ok((wA ? ca === 1100 && cb === 900 : ca === 900 && cb === 1100), `pot paid once: A ${ca}, B ${cb}`);
const again = await A.call('resign', { game_id: fin2.id });
ok(again.error === 'not_active', 'finished game cannot be settled twice');

console.log('5. resign and timeout claim');
await A.call('queue', { variant: 'short', stake: 100 });
const q3 = await Bp.call('queue', { variant: 'short', stake: 100 });
const early = await (q3.game.turn === 0 ? Bp : A).call('claim_timeout', { game_id: q3.game.id });
ok(early.error === 'not_yet', 'timeout cannot be claimed early');
const res = await A.call('resign', { game_id: q3.game.id });
ok(res.game && res.game.status === 'finished' && res.game.winner === 1, 'A resigns, B wins');

console.log('6. shop');
const buy = await A.call('buy', { kind: 'skins', id: 'oak' });
ok(buy.profile && buy.profile.owned_skins.includes('oak') && buy.profile.equip.skin === 'oak', 'A buys and equips Golden Oak (coins ' + buy.profile?.coins + ')');
const buy2 = await A.call('buy', { kind: 'skins', id: 'oak' });
ok(buy2.error === 'already_owned', 'cannot buy twice');
const fake = await A.call('equip', { kind: 'skins', id: 'ebony' });
ok(fake.error === 'not_owned', 'cannot equip an item not owned');
const ad1 = await A.call('ad_reward'), ad2 = await A.call('ad_reward');
ok(ad1.profile && ad2.error === 'too_soon', 'ad reward has a cooldown');

console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
process.exit(0);
