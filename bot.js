/* Heuristic nardi bot: evaluates every distinct end position of a roll and picks the best. */
(function (root) {
  'use strict';
  const N = typeof module !== 'undefined' ? require('./engine.js') : root.Nardi;

  // probability that a blot at distance d gets hit (rough single-distance values)
  const HITP = [0, .31, .33, .39, .42, .42, .47, .17, .17, .14, .08, .08, .08];

  function evalShort(s, p) {
    const o = 1 - p, me = s.pos[p], op = s.pos[o];
    const race = N.pips(s, o) - N.pips(s, p);
    // contact?  my rearmost vs opponent's rearmost (in my path coords opp idx j = my 23-j)
    let myRear = s.bar[p] ? -1 : 24; for (let i = 0; i < 24 && myRear === 24; i++) if (me[i]) myRear = i;
    let oppFar = -2; for (let j = 0; j < 24; j++) if (op[j]) { oppFar = Math.max(oppFar, 23 - j); }
    if (s.bar[o]) oppFar = 24;
    if (myRear >= oppFar) return race * 2 + s.off[p] * 3; // pure race

    let score = race * 0.6;
    // blots
    for (let i = 0; i < 24; i++) {
      if (me[i] !== 1) continue;
      const target = 23 - i; // in opponent coords
      const dists = new Set();
      if (s.bar[o] && target + 1 <= 12) dists.add(target + 1);
      for (let j = 0; j < target; j++) if (op[j]) { const d = target - j; if (d <= 12) dists.add(d); }
      let miss = 1; for (const d of dists) miss *= 1 - HITP[d];
      score -= (1 - miss) * (i + 9) * 0.55;
    }
    // made points & prime
    let run = 0, best = 0, madeHome = 0;
    for (let i = 0; i < 24; i++) {
      if (me[i] >= 2) {
        score += 2 + (i >= 18 ? 3.5 : 0) + (i >= 14 && i < 18 ? 2 : 0) + (i <= 5 ? 1.5 : 0);
        if (i >= 18) madeHome++;
        run++; best = Math.max(best, run);
      } else run = 0;
      if (me[i] > 3) score -= (me[i] - 3) * 0.8;
    }
    score += best >= 3 ? best * best * 1.2 : 0;
    score += s.bar[o] * (8 + madeHome * 3);
    score -= s.bar[p] * 10;
    score += s.off[p] * 2;
    return score;
  }

  function evalLong(s, p) {
    const o = 1 - p, v = s.variant, me = s.pos[p], op = s.pos[o];
    let score = (N.pips(s, o) - N.pips(s, p)) * 0.7;
    score -= Math.max(0, me[0] - 1) * 1.2;              // get checkers off the head
    // blocking value: my points in the opponent's path just ahead of its checkers
    const blk = new Array(24).fill(false);
    for (let i = 0; i < 24; i++) if (me[i]) {
      blk[N.IDX[v][o][N.PATH[v][p][i]]] = true;
      score += 1.5;                                      // occupied point
      if (me[i] > 4 && i !== 0) score -= (me[i] - 4) * 0.9;
    }
    let oppRear = 24; for (let j = 0; j < 24; j++) if (op[j]) { oppRear = j; break; }
    let run = 0;
    for (let b = 0; b < 24; b++) {
      if (blk[b] && b > oppRear) {
        run++;
        let near = 0; for (let j = Math.max(0, b - 12); j < b; j++) near += op[j];
        score += Math.min(near, 4) * 0.5;
        score += run * 1.2;
      } else run = 0;
    }
    score += s.off[p] * 2;
    return score;
  }

  function evaluate(s, p) { return s.variant === 'short' ? evalShort(s, p) : evalLong(s, p); }

  // level: 'easy' | 'normal'
  function chooseTurn(s, p, d1, d2, level) {
    const opts = N.allTurns(s, p, d1, d2);
    if (opts.length === 1) return opts[0];
    if (level === 'easy' && Math.random() < 0.35) return opts[Math.floor(Math.random() * opts.length)];
    const noise = level === 'easy' ? 14 : 0.3;
    let best = null, bv = -Infinity;
    for (const o of opts) {
      if (N.winner(o.state) === p) return o;
      const v = evaluate(o.state, p) + (Math.random() - 0.5) * noise;
      if (v > bv) { bv = v; best = o; }
    }
    return best;
  }

  const api = { chooseTurn, evaluate };
  if (typeof module !== 'undefined') module.exports = api; else root.NardiBot = api;
})(typeof window !== 'undefined' ? window : globalThis);
