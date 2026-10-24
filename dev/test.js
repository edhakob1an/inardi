const N = require('./engine.js'), B = require('./bot.js');
let fails = 0;
function assert(c, msg) { if (!c) { fails++; console.log('FAIL:', msg); } }

function checkInvariants(s, tag) {
  for (const p of [0, 1]) {
    const tot = s.pos[p].reduce((a, b) => a + b, 0) + s.bar[p] + s.off[p];
    assert(tot === 15, tag + ' count p' + p + '=' + tot);
    assert(s.pos[p].every(x => x >= 0), tag + ' negative');
  }
  for (let abs = 0; abs < 24; abs++) {
    const a = s.pos[0][N.IDX[s.variant][0][abs]], b = s.pos[1][N.IDX[s.variant][1][abs]];
    assert(!(a && b), tag + ' shared point ' + abs);
  }
  if (s.variant === 'long') assert(s.bar[0] === 0 && s.bar[1] === 0, tag + ' bar in long');
  if (s.variant === 'long') for (const p of [0, 1]) assert(!N.violatesBlockade(s, p), tag + ' blockade p' + p);
}

// --- unit tests ---
{ // larger die rule (short): only one die playable -> must use larger
  const s = N.newGame('short'); s.pos[0].fill(0); s.pos[1].fill(0);
  s.pos[0][20] = 1; s.off[0] = 14; s.pos[1][5] = 15; // p0 single checker at idx20 (4-point)
  const t = new N.Turn(s, 0, 2, 6); // 6 bears off; 2 then needs 4 to bear... both usable? 2 -> idx22, then 6 bears off -> 2 uses
  assert(t.total === 2, 'two dice usable ' + t.total);
}
{ // long: head rule — only one checker from head on normal roll
  const s = N.newGame('long'); s.turnsTaken = [1, 1];
  const t = new N.Turn(s, 0, 5, 3);
  t.play(t.legal()[0]);
  assert(t.legal().every(m => m.from !== 0), 'head rule second move');
}
{ // long first turn 6-6: two checkers from head
  const s = N.newGame('long');
  const opts = N.allTurns(s, 0, 6, 6);
  assert(opts.some(o => o.state.pos[0][0] === 13), 'first 6-6 allows two from head');
  assert(opts.every(o => o.state.pos[0][0] >= 13), 'never three from head');
}
{ // short: entering from bar is forced first
  const s = N.newGame('short'); s.bar[0] = 1; s.pos[0][0] = 1;
  const t = new N.Turn(s, 0, 3, 5);
  assert(t.legal().every(m => m.from === -1), 'bar first');
}
{ // long: blockade of 6 forbidden when no opponent checker ahead
  const s = N.newGame('long'); s.pos[0].fill(0); s.pos[1].fill(0);
  s.pos[1][0] = 15; // opp all on head (opp idx 0) — behind everything
  // p0 occupies its idx 13..17 (5 in a row) + checker at 12 that could move to 18
  for (const i of [13, 14, 15, 16, 17]) s.pos[0][i] = 2; s.pos[0][10] = 5;
  const ms = N.singleMoves(s, 0, 1, { headMoves: 0, headLimit: 1 });
  // moving 12->... we need a move making a 6th: 10 + ... use die such that lands at 18 or 12
  const ms2 = N.singleMoves(s, 0, 2, { headMoves: 0, headLimit: 1 }); // 10->12 makes 12..17 = 6 run
  assert(!ms2.some(m => m.from === 10 && m.to === 12), 'blockade forbidden');
}

// --- self-play ---
function play(variant, seed) {
  let s = N.newGame(variant), p = seed % 2, turns = 0;
  while (N.winner(s) < 0 && turns < 1000) {
    const d1 = 1 + Math.floor(Math.random() * 6), d2 = 1 + Math.floor(Math.random() * 6);
    const t = new N.Turn(s, p, d1, d2);
    const choice = B.chooseTurn(s, p, d1, d2, turns % 3 ? 'normal' : 'easy');
    // replay choice through Turn to verify legality
    for (const m of choice.moves) {
      const legal = t.legal();
      assert(legal.some(x => x.from === m.from && x.to === m.to && x.die === m.die), variant + ' illegal bot move');
      t.play(m);
    }
    assert(t.done(), variant + ' turn not complete');
    s = t.finish(); checkInvariants(s, variant + ' t' + turns);
    p = 1 - p; turns++;
    if (fails > 5) return -1;
  }
  assert(N.winner(s) >= 0, variant + ' no winner after ' + turns);
  return turns;
}
for (const v of ['short', 'long']) {
  const t0 = Date.now(); let total = 0;
  for (let g = 0; g < 40; g++) total += play(v, g);
  console.log(v, 'avg turns', (total / 40).toFixed(1), 'ms/game', ((Date.now() - t0) / 40).toFixed(0));
}
console.log(fails ? fails + ' FAILURES' : 'ALL OK');
