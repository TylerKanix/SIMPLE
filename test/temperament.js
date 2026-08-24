#!/usr/bin/env node
/* Temperaments have to be legible, not merely present.
 *
 * The design bar is that someone who has finished three runs can name the
 * opponent's temperament blind. A label the engine barely acts on fails that
 * bar while passing every other kind of test, so this measures the behaviour
 * each one is supposed to produce and asserts the gaps are wide enough to
 * notice: how far they move to chase you, how straight a line they take, and
 * how much of their campaign they spend on you rather than on themselves.
 */
const { load, hash } = require('./harness.js');

let fails = 0;
const check = (name, cond, extra) => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${name}${cond || !extra ? '' : '\n        ' + extra}`);
  if (!cond) fails++;
};

const S = load();
const T = S.read('TEMPERAMENTS');
const IDS = Object.keys(T);

check(`there are four temperaments (${IDS.length})`, IDS.length === 4);
check('each names itself and says what it does to you',
  IDS.every(k => T[k].name && T[k].blurb && T[k].blurb.length > 40));

/* ---- how far they will move to chase you --------------------------------
   Measured the way the player experiences it: how many planks the opposition
   actually shifts over a campaign, starting from the same platform against the
   same opponent on the same seed. */
function planksMoved(temperId, seed) {
  const W = load();
  W.setSeed(seed);
  W.resetWorld();
  W.applyCycleDrift();
  const me = W.makeCandidate({
    id: 'p', name: 'Test', partyId: 'D',
    platform: (() => {
      const pl = W.emptyPlatform();
      for (const id of W.ISSUE_IDS) pl.positions[id] = -1;
      pl.signature = ['health', 'taxes', 'climate'];
      return pl;
    })()
  });
  const opp = W.genericOpponent('R');
  opp.temperament = W.read('TEMPERAMENTS')[temperId];
  const before = Object.assign({}, opp.platform.positions);
  const env = { incumbentParty: 'R', incumbentPenalty: 0.08, econ: 0.3 };
  const start = W.projectElection(opp, me, env, {}).tipping.margin;
  W.optimizeOpponent(opp, me, env, 4);
  let moved = 0;
  for (const id of W.ISSUE_IDS) if (opp.platform.positions[id] !== before[id]) moved++;
  const end = W.projectElection(opp, me, env, {}).tipping.margin;
  // `gain` is what the repositioning was actually worth to them, which is the
  // thing the player feels. Plank count alone rewards flailing.
  return { moved, gain: (end - start) * 100 };
}

const SEEDS = [11, 202, 3003, 40404, 55, 606, 7007, 80808, 91, 1212, 131313, 1414];
const moved = {}, gain = {};
for (const id of IDS) {
  const runs = SEEDS.map(s => planksMoved(id, s));
  moved[id] = runs.reduce((a, r) => a + r.moved, 0) / runs.length;
  gain[id] = runs.reduce((a, r) => a + r.gain, 0) / runs.length;
}
console.log(`  over ${SEEDS.length} seeds — planks moved, and what the moving was worth:`);
for (const id of IDS) {
  console.log(`      ${T[id].name.padEnd(16)} ${moved[id].toFixed(2)} planks   ${gain[id] >= 0 ? '+' : ''}${gain[id].toFixed(2)} pts at the tipping point`);
}

check('a base mobilizer moves fewer planks than a disciplined campaign',
  moved.mobilizer < moved.disciplined,
  `${moved.mobilizer.toFixed(2)} vs ${moved.disciplined.toFixed(2)}`);
check('and gains less from the campaign as a result',
  gain.mobilizer < gain.disciplined,
  `${gain.mobilizer.toFixed(2)} vs ${gain.disciplined.toFixed(2)}`);
check('a disciplined campaign converts its moves better than an erratic one',
  gain.disciplined > gain.erratic,
  `${gain.disciplined.toFixed(2)} vs ${gain.erratic.toFixed(2)}`);
check('the best and worst repositioners are separated by a visible margin',
  Math.max.apply(null, IDS.map(i => gain[i])) - Math.min.apply(null, IDS.map(i => gain[i])) >= 0.35,
  'spread ' + (Math.max.apply(null, IDS.map(i => gain[i])) - Math.min.apply(null, IDS.map(i => gain[i]))).toFixed(2));

/* ---- how much they spend on you ----------------------------------------- */
const attack = IDS.map(id => T[id].attack);
check('an attack dog spends at least twice as much on you as the most restrained',
  T.attackdog.attack / Math.min.apply(null, attack) >= 2,
  `${T.attackdog.attack} vs ${Math.min.apply(null, attack)}`);

/* ---- how much variance they accept -------------------------------------- */
check('an erratic campaign is the noisiest mover',
  IDS.every(id => id === 'erratic' || T.erratic.noise > T[id].noise));
check('an erratic campaign accepts the most risk in what its money buys',
  IDS.every(id => id === 'erratic' || T.erratic.risk > T[id].risk));

/* ---- no temperament is strictly better than another --------------------- */
{
  const dominated = [];
  for (const a of IDS) {
    for (const b of IDS) {
      if (a === b) continue;
      // "Better at everything the engine reads" would make one of them the
      // one you always hope for, which is the same design failure as a
      // dominant posture.
      const A = T[a], B = T[b];
      if (A.reposition >= B.reposition && A.attack >= B.attack && A.spend >= B.spend
        && A.risk <= B.risk && A.noise <= B.noise
        && (A.reposition > B.reposition || A.attack > B.attack)) dominated.push(`${b} dominated by ${a}`);
    }
  }
  check('no temperament dominates another on every dial', dominated.length === 0, dominated.join(', '));
}

/* ---- and drawing one costs exactly one number --------------------------- */
{
  const W = load();
  W.setSeed(999);
  const a = W.drawTemperament();
  W.setSeed(999);
  const b = W.drawTemperament();
  check('drawing a temperament is reproducible from the seed', a.id === b.id);
  W.setSeed(999);
  W.drawTemperament();
  const afterDraw = W.rnd();
  W.setSeed(999);
  W.rnd();
  const afterOne = W.rnd();
  check('and consumes exactly one draw', afterDraw === afterOne);

  const seen = {};
  W.setSeed(4242);
  for (let i = 0; i < 4000; i++) { const t = W.drawTemperament().id; seen[t] = (seen[t] || 0) + 1; }
  const counts = IDS.map(id => seen[id] || 0);
  check('all four are drawn, roughly evenly',
    Math.min.apply(null, counts) > 800 && Math.max.apply(null, counts) < 1200,
    IDS.map(id => `${id}:${seen[id] || 0}`).join(' '));
}

console.log(fails ? `\n${fails} temperament check(s) failed` : '\ntemperament: four opponents that behave differently');
process.exit(fails ? 1 : 0);
