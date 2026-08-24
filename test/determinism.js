#!/usr/bin/env node
/* Determinism goldens.
 *
 *   node test/determinism.js            check against the stored goldens
 *   node test/determinism.js --update   regenerate them (say so in the commit)
 *
 * The game's whole contract is that a seed plus the same choices reproduces a
 * run exactly. These scenarios drive the simulation headlessly along fixed
 * paths and hash what comes out, so any change that moves the model shows up
 * as a failing hash rather than as a quietly different country three months
 * later. They are also the net under every refactor: rearranging how the
 * screens call the sim must not change what the sim returns.
 *
 * A failing hash is not automatically a bug — it means "you changed the
 * model, confirm you meant to". Regenerate in the same commit as the change.
 */
const fs = require('fs');
const path = require('path');
const { load, hash } = require('./harness.js');

const GOLDEN = path.join(__dirname, 'golden.json');

/* ---- scenario 1: the world itself ---------------------------------------
   Calibration and the cycle drift, which between them decide every map the
   game will ever draw. `resetWorld` is exercised too, because a second run in
   the same page has to produce the same country as the first. */
function worldScenario(S) {
  S.setSeed(20260824);
  S.resetWorld();
  S.applyCycleDrift();
  const first = {
    bias: S.read('CYCLE_BIAS'),
    pvi: S.STATES.map(s => ({ a: s.abbr, pvi: s.pvi, cult: s.cult }))
  };
  // Same seed, after a reset: must land on precisely the same map.
  S.setSeed(20260824);
  S.resetWorld();
  S.applyCycleDrift();
  const second = {
    bias: S.read('CYCLE_BIAS'),
    pvi: S.STATES.map(s => ({ a: s.abbr, pvi: s.pvi, cult: s.cult }))
  };
  if (hash(first) !== hash(second)) throw new Error('resetWorld did not restore the map');
  return first;
}

function candidate(S, partyId, over) {
  const c = S.makeCandidate(Object.assign({
    id: 'p', name: 'Test', partyId,
    platform: (() => {
      const pl = S.emptyPlatform();
      for (const id of S.ISSUE_IDS) pl.positions[id] = partyId === 'D' ? -1 : 1;
      pl.signature = ['health', 'taxes', 'climate'];
      return pl;
    })(),
    baseMorale: 55, bonusU: 0
  }, over || {}));
  return c;
}

/* ---- scenario 2: a nomination fight -------------------------------------- */
function primaryScenario(S) {
  S.setSeed(4242);
  S.resetWorld();
  S.applyCycleDrift();
  const me = candidate(S, 'D');
  const field = [
    { id: 'p', name: 'Test', partyId: 'D', uMap: S.primaryUtilityMap(me), funds: 40, momentum: 0,
      traits: me.traits, organization: 30 },
    { id: 'r1', name: 'Rival One', partyId: 'D', uMap: S.primaryUtilityMap(candidate(S, 'D', { bonusU: 0.2 })),
      funds: 55, momentum: 2, traits: { charisma: 60, discipline: 45 }, organization: 35 },
    { id: 'r2', name: 'Rival Two', partyId: 'D', uMap: S.primaryUtilityMap(candidate(S, 'D', { bonusU: -0.3 })),
      funds: 25, momentum: -1, traits: { charisma: 40, discipline: 65 }, organization: 20 }
  ];
  const out = [];
  for (const contest of S.PRIMARY_CALENDAR) {
    out.push(S.runPrimaryContest(contest, field, { p: 6, r1: 8, r2: 3 }));
  }
  return out;
}

/* ---- scenario 3: a general election and the Congress it produces --------- */
function generalScenario(S) {
  S.setSeed(777);
  S.resetWorld();
  S.applyCycleDrift();
  const me = candidate(S, 'D');
  const opp = S.genericOpponent('R');
  const env = { incumbentParty: 'R', incumbentPenalty: 0.08, econ: 0.3 };
  const efforts = {};
  // A fixed, uneven spend so the effort model is actually exercised.
  S.STATES.forEach((s, i) => {
    efforts[s.abbr] = { persuade: (i % 7) * 5, ground: (i % 4) * 4, digital: (i % 3) * 2,
      posture: ['balanced', 'persuasion', 'turnout', 'defend'][i % 4], blocs: {} };
  });
  S.optimizeOpponent(opp, me, env, 2);
  const proj = S.projectElection(me, opp, env, efforts);
  const real = S.runGeneralElection(me, opp, env, efforts, {});
  const congress = S.deriveCongress(real.popular * 2 - 1, 'D');
  const seats = S.caucusSeats(congress, 'D');

  // And a whip count on the first bill, at three levels of concession.
  const bill = S.BILLS[0];
  const ctx = { seats, playerParty: 'D', approval: 52, baseMorale: 55, bipartisan: 12,
    deficit: 1400, loyalty: 0, boosts: {}, pulpit: 0, reconciliation: false, vehicle: false };
  const whips = [3, 5, bill.provisions.length].map(n =>
    S.whipCount(bill, bill.provisions.slice(0, n).map(x => x.id), ctx));

  return { proj: { evP: proj.evP, evO: proj.evO, tipping: proj.tipping.abbr, states: proj.states },
    real: { evP: real.evP, evO: real.evO, popular: real.popular }, congress, seats, whips };
}

/* ---- scenario 4: a war, played to a finish ------------------------------
   The tuning here was measured rather than guessed (see the README), so it is
   the part of the model most worth pinning down. */
function warScenario(S) {
  S.setSeed(99001);
  S.resetWorld();
  const w = S.createWar(3);
  const ctx = { approval: 52, bipartisan: 12 };
  const trace = [];
  let axis = null;
  for (let t = 0; t < 12 && !w.ended; t++) {
    // A fixed, legible plan: mass on one axis, screen the rest, sorties
    // concentrated, mobilize once, strike once when they are nearly broken.
    if (t === 0) S.warEscalate(w, 'production');
    if (t === 1) S.warEscalate(w, 'mobilize');
    if (w.enemyWill < 40 && w.strikes < 1) S.warEscalate(w, 'strike');
    if (!axis) {
      let best = null, bs = -1e9;
      for (const F of S.WAR_FRONTS) {
        const f = w.fronts[F.id];
        const s = F.value * (1.05 - f.line) / (2.5 + Math.max(0, f.enemy * 1.7 - f.yours)) / F.defBonus;
        if (s > bs) { bs = s; best = F.id; }
      }
      axis = best;
    }
    const AX = S.WAR_FRONTS.find(F => F.id === axis);
    let lift = S.WAR_LIFT;
    for (const F of S.WAR_FRONTS) {
      if (F.id === axis) continue;
      const f = w.fronts[F.id];
      const want = Math.min(F.frontage * 0.95, f.enemy * 0.95);
      if (f.yours > want && lift > 0) { const mv = Math.min(lift, f.yours - want); f.yours -= mv; w.reserve += mv; lift -= mv; }
    }
    const m = w.fronts[axis];
    const mv = Math.min(lift, w.reserve, AX.frontage * S.WAR_DENSITY_CAP - m.yours);
    if (mv > 0) { m.yours += mv; w.reserve -= mv; }
    for (const F of S.WAR_FRONTS) { w.fronts[F.id].posture = 'hold'; w.fronts[F.id].air = 0; }
    const ratio = S.warMass(m.yours, AX.frontage) / Math.max(0.4, S.warMass(m.enemy, AX.frontage) * AX.defBonus);
    if (ratio > 1.20 && m.supply > 0.34) m.posture = 'assault';
    m.air = 3; w.fronts.steppe.air = 2; w.fronts.corridor.air = 1;
    w.weeksThisQuarter = 5;
    const out = S.resolveWarTurn(w, ctx);
    trace.push({ t: w.turn, e: w.enemyWill, h: w.homeWill, cas: w.casualties,
      prog: out.progress, lines: S.WAR_FRONTS.map(F => w.fronts[F.id].line) });
  }
  return { trace, terms: S.warTerms(w), ended: w.ended, cost: w.cost, dead: w.casualties };
}

/* ---- scenario 5: posture niches -----------------------------------------
   The measured claim in the README is that no posture is dominated. This
   pins the measurement itself, so a tuning change that quietly kills an
   option fails here instead of in a player's tenth run. */
function postureScenario(S) {
  const POSTS = ['assault', 'hold', 'envelop', 'withdraw'];
  const wins = { assault: 0, hold: 0, envelop: 0, withdraw: 0 };
  const clone = w => JSON.parse(JSON.stringify(w));
  const ctx = { approval: 52, bipartisan: 12 };
  for (let seed = 0; seed < 24; seed++) {
    S.setSeed(5000 + seed * 17);
    const base = S.createWar(3);
    for (let i = 0; i < 1 + (seed % 5); i++) {
      for (const F of S.WAR_FRONTS) { base.fronts[F.id].posture = 'hold'; base.fronts[F.id].air = 1; }
      base.weeksThisQuarter = 4;
      S.resolveWarTurn(base, ctx);
      if (base.ended) break;
    }
    if (base.ended) continue;
    for (const F of S.WAR_FRONTS) {
      let best = null, bs = -1e9;
      for (const P of POSTS) {
        const w = clone(base);
        for (let t = 0; t < 3 && !w.ended; t++) {
          w.weeksThisQuarter = 4;
          for (const G2 of S.WAR_FRONTS) { w.fronts[G2.id].posture = 'hold'; w.fronts[G2.id].air = 1; }
          w.fronts[F.id].posture = P;
          if (P === 'envelop') w.fronts[F.id].air = 2;
          S.resolveWarTurn(w, ctx);
        }
        const sc = w.homeWill - w.enemyWill;
        if (sc > bs) { bs = sc; best = P; }
      }
      wins[best]++;
    }
  }
  return wins;
}

const SCENARIOS = {
  world: worldScenario,
  primary: primaryScenario,
  general: generalScenario,
  war: warScenario,
  postures: postureScenario
};

function run() {
  const results = {};
  for (const [name, fn] of Object.entries(SCENARIOS)) {
    const S = load();           // a clean world per scenario, like a fresh page
    results[name] = hash(fn(S));
  }
  return results;
}

const update = process.argv.includes('--update');
const got = run();

if (update || !fs.existsSync(GOLDEN)) {
  fs.writeFileSync(GOLDEN, JSON.stringify(got, null, 2) + '\n');
  console.log('goldens written:');
  for (const k of Object.keys(got)) console.log(`  ${k.padEnd(10)} ${got[k]}`);
  process.exit(0);
}

const want = JSON.parse(fs.readFileSync(GOLDEN, 'utf8'));
let bad = 0;
for (const k of Object.keys(SCENARIOS)) {
  const ok = want[k] === got[k];
  if (!ok) bad++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${k.padEnd(10)} ${got[k]}${ok ? '' : `  (golden ${want[k]})`}`);
}
if (bad) {
  console.log(`\n${bad} scenario${bad === 1 ? '' : 's'} moved. If that was deliberate, rerun with --update in the same commit.`);
  process.exit(1);
}
console.log('\ndeterminism: all scenarios match their goldens');
