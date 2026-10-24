/* Nardi rules engine — short nardi (backgammon rules) and long nardi.
   Board: 24 absolute points, abs = row*12 + col (row 0 = top, row 1 = bottom, col 0..11 left→right).
   Each player walks their own path: path index 0 (start / head / "24-point") … 23 (last point), 24 = borne off, -1 = bar.
   Player 0 = light checkers, sits at the bottom. Player 1 = dark checkers, sits at the top. */
(function (root) {
  'use strict';

  // ---------- paths ----------
  function top(col) { return col; }
  function bot(col) { return 12 + col; }
  const PATH = { short: [[], []], long: [[], []] };
  for (let i = 0; i < 24; i++) {
    // P0 (both variants): top-right → top-left → bottom-left → bottom-right (home = bottom-right)
    const p0 = i < 12 ? top(11 - i) : bot(i - 12);
    PATH.short[0].push(p0); PATH.long[0].push(p0);
    // P1 short (mirror): bottom-right → bottom-left → top-left → top-right (home = top-right)
    PATH.short[1].push(i < 12 ? bot(11 - i) : top(i - 12));
    // P1 long (same rotation as P0, starting opposite): bottom-left → bottom-right → top-right → top-left (home = top-left)
    PATH.long[1].push(i < 12 ? bot(i) : top(23 - i));
  }
  const IDX = { short: [[], []], long: [[], []] };
  for (const v of ['short', 'long']) for (const p of [0, 1]) {
    IDX[v][p] = new Array(24);
    PATH[v][p].forEach((abs, i) => { IDX[v][p][abs] = i; });
  }

  // ---------- state ----------
  // pos[p][i] = number of p's checkers at p's path index i
  function newGame(variant) {
    const s = { variant, pos: [new Array(24).fill(0), new Array(24).fill(0)], bar: [0, 0], off: [0, 0], turnsTaken: [0, 0] };
    for (const p of [0, 1]) {
      if (variant === 'short') { s.pos[p][0] = 2; s.pos[p][11] = 5; s.pos[p][16] = 3; s.pos[p][18] = 5; }
      else s.pos[p][0] = 15;
    }
    return s;
  }
  function clone(s) {
    return { variant: s.variant, pos: [s.pos[0].slice(), s.pos[1].slice()], bar: s.bar.slice(), off: s.off.slice(), turnsTaken: s.turnsTaken.slice() };
  }
  function key(s) { return s.pos[0].join(',') + '|' + s.pos[1].join(',') + '|' + s.bar.join(',') + '|' + s.off.join(','); }

  // count of opponent checkers on the abs point that p's path index i lands on
  function oppAt(s, p, i) {
    const abs = PATH[s.variant][p][i];
    return s.pos[1 - p][IDX[s.variant][1 - p][abs]];
  }

  function allHome(s, p) {
    if (s.bar[p]) return false;
    for (let i = 0; i < 18; i++) if (s.pos[p][i]) return false;
    return true;
  }

  // ---------- turn context ----------
  // ctx = { headMoves, headLimit }
  function newTurnCtx(s, p, dice) {
    let headLimit = 1;
    if (s.variant === 'long' && s.turnsTaken[p] === 0 && dice[0] === dice[1] && [3, 4, 6].includes(dice[0])) headLimit = 2;
    return { headMoves: 0, headLimit };
  }

  // ---------- long nardi blockade rule ----------
  // p may not hold 6+ consecutive points (in the opponent's travel order) unless an opponent checker is already past the block.
  function violatesBlockade(s, p) {
    if (s.variant !== 'long') return false;
    const o = 1 - p, v = s.variant;
    const blocked = new Array(24).fill(false);
    for (let i = 0; i < 24; i++) if (s.pos[p][i]) blocked[IDX[v][o][PATH[v][p][i]]] = true;
    let furthestOpp = -1; // furthest opponent checker along its path
    for (let i = 23; i >= 0; i--) if (s.pos[o][i]) { furthestOpp = i; break; }
    if (s.off[o] > 0) furthestOpp = 24;
    let run = 0;
    for (let j = 0; j < 24; j++) {
      run = blocked[j] ? run + 1 : 0;
      if (run >= 6) {
        // block ends at j or later; find its end
        let end = j; while (end + 1 < 24 && blocked[end + 1]) end++;
        if (furthestOpp <= end) return true;
        j = end; run = 0;
      }
    }
    return false;
  }

  // ---------- single moves ----------
  // returns list of {from, to, die, hit}
  function singleMoves(s, p, die, ctx) {
    const out = [];
    const short = s.variant === 'short';
    if (short && s.bar[p] > 0) {
      const to = die - 1, n = oppAt(s, p, to);
      if (n < 2) out.push({ from: -1, to, die, hit: n === 1 });
      return out;
    }
    const home = allHome(s, p);
    for (let i = 0; i < 24; i++) {
      if (!s.pos[p][i]) continue;
      if (!short && i === 0 && ctx.headMoves >= ctx.headLimit) continue;
      const t = i + die;
      if (t < 24) {
        const n = oppAt(s, p, t);
        if (short ? n >= 2 : n >= 1) continue;
        out.push({ from: i, to: t, die, hit: short && n === 1 });
      } else if (home) {
        if (t === 24) out.push({ from: i, to: 24, die, hit: false });
        else {
          // higher die: only from the rearmost occupied point
          let behind = false;
          for (let k = 18; k < i; k++) if (s.pos[p][k]) { behind = true; break; }
          if (!behind) out.push({ from: i, to: 24, die, hit: false });
        }
      }
    }
    if (!short) return out.filter(m => !violatesBlockade(applyMove(s, p, m), p));
    return out;
  }

  function applyMove(s, p, m, ctx) {
    const n = clone(s);
    if (m.from === -1) n.bar[p]--; else n.pos[p][m.from]--;
    if (m.to === 24) n.off[p]++;
    else {
      if (m.hit) {
        const o = 1 - p, oi = IDX[n.variant][o][PATH[n.variant][p][m.to]];
        n.pos[o][oi]--; n.bar[o]++;
      }
      n.pos[p][m.to]++;
    }
    if (ctx && m.from === 0 && n.variant === 'long') ctx.headMoves++;
    return n;
  }

  // ---------- full-turn logic (must use as many dice as possible; larger die if only one) ----------
  function diceList(d1, d2) { return d1 === d2 ? [d1, d1, d1, d1] : [d1, d2]; }
  function removeOne(arr, v) { const a = arr.slice(); a.splice(a.indexOf(v), 1); return a; }
  function uniq(arr) { return [...new Set(arr)]; }

  function maxUses(s, p, dice, ctx, memo) {
    if (!dice.length || s.off[p] === 15) return 0;
    const k = key(s) + '#' + dice.join('') + '#' + ctx.headMoves;
    if (memo.has(k)) return memo.get(k);
    let best = 0;
    for (const d of uniq(dice)) {
      for (const m of singleMoves(s, p, d, ctx)) {
        const c2 = { headMoves: ctx.headMoves, headLimit: ctx.headLimit };
        const n = applyMove(s, p, m, c2);
        const u = 1 + maxUses(n, p, removeOne(dice, d), c2, memo);
        if (u > best) best = u;
        if (best === dice.length) break;
      }
      if (best === dice.length) break;
    }
    memo.set(k, best);
    return best;
  }

  // Turn object drives a human or bot turn.
  function Turn(s, p, d1, d2) {
    this.p = p; this.rolled = [d1, d2];
    this.dice = diceList(d1, d2);
    this.ctx = newTurnCtx(s, p, [d1, d2]);
    this.memo = new Map();
    this.state = s;
    this.history = []; // [{state, dice, ctx, move}]
    this.total = maxUses(s, p, this.dice, this.ctx, this.memo);
    this.largerOnly = false;
    if (this.total === 1 && d1 !== d2) {
      const big = Math.max(d1, d2);
      if (singleMoves(s, p, big, this.ctx).length) this.largerOnly = big;
    }
  }
  Turn.prototype.used = function () { return this.history.length; };
  Turn.prototype.legal = function () {
    const s = this.state, p = this.p, need = this.total - this.used();
    if (need <= 0) return [];
    const res = [];
    for (const d of uniq(this.dice)) {
      if (this.largerOnly && d !== this.largerOnly) continue;
      for (const m of singleMoves(s, p, d, this.ctx)) {
        const c2 = { headMoves: this.ctx.headMoves, headLimit: this.ctx.headLimit };
        const n = applyMove(s, p, m, c2);
        if (1 + maxUses(n, p, removeOne(this.dice, d), c2, this.memo) >= need) res.push(m);
      }
    }
    return res;
  };
  Turn.prototype.play = function (m) {
    this.history.push({ state: this.state, dice: this.dice, ctx: { ...this.ctx }, move: m });
    this.state = applyMove(this.state, this.p, m, this.ctx);
    this.dice = removeOne(this.dice, m.die);
  };
  Turn.prototype.undo = function () {
    const h = this.history.pop(); if (!h) return null;
    this.state = h.state; this.dice = h.dice; this.ctx = h.ctx; return h.move;
  };
  Turn.prototype.done = function () { return this.used() >= this.total || this.state.off[this.p] === 15; };
  Turn.prototype.finish = function () { const n = clone(this.state); n.turnsTaken[this.p]++; return n; };

  // All distinct end positions for a roll (for the bot). Returns [{moves, state}]
  function allTurns(s, p, d1, d2) {
    const t = new Turn(s, p, d1, d2);
    const results = new Map(), seen = new Set();
    (function rec(turn, moves) {
      if (turn.done()) {
        const k = key(turn.state);
        if (!results.has(k)) results.set(k, { moves: moves.slice(), state: turn.finish() });
        return;
      }
      const sk = key(turn.state) + '#' + turn.dice.join('') + '#' + turn.ctx.headMoves;
      if (seen.has(sk)) return; seen.add(sk);
      for (const m of turn.legal()) {
        turn.play(m); moves.push(m);
        rec(turn, moves);
        moves.pop(); turn.undo();
      }
    })(t, []);
    if (!results.size) results.set(key(s), { moves: [], state: t.finish() });
    return [...results.values()];
  }

  function pips(s, p) {
    let t = s.bar[p] * 25;
    for (let i = 0; i < 24; i++) t += s.pos[p][i] * (24 - i);
    return t;
  }
  function winner(s) { return s.off[0] === 15 ? 0 : s.off[1] === 15 ? 1 : -1; }
  function resultPoints(s, w) { return s.off[1 - w] === 0 ? 2 : 1; } // 2 = mars

  const api = { PATH, IDX, newGame, clone, key, singleMoves, applyMove, maxUses, Turn, allTurns, pips, winner, resultPoints, violatesBlockade, allHome, oppAt, diceList };
  if (typeof module !== 'undefined') module.exports = api; else root.Nardi = api;
})(typeof window !== 'undefined' ? window : globalThis);
