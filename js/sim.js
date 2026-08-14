/* ==========================================================================
   MANDATE — simulation engine
   Pure functions where possible. No DOM in this file.
   ========================================================================== */

/* ---- seeded RNG so a run can be reproduced and argued about --------------- */
let _seed = 123456789;
function setSeed(s) { _seed = (s >>> 0) || 1; }
function rnd() {
  // xorshift32
  _seed ^= _seed << 13; _seed >>>= 0;
  _seed ^= _seed >> 17;
  _seed ^= _seed << 5;  _seed >>>= 0;
  return _seed / 4294967296;
}
function rndRange(a, b) { return a + rnd() * (b - a); }
function gauss(mu, sigma) {
  const u = Math.max(1e-9, rnd()), v = Math.max(1e-9, rnd());
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
function logistic(x) { return 1 / (1 + Math.exp(-x)); }

/* ==========================================================================
   PLATFORM
   ========================================================================== */
function emptyPlatform() {
  const positions = {}, salience = {};
  ISSUE_IDS.forEach(id => { positions[id] = 0; salience[id] = 0; });
  return { positions, salience, signature: [] };
}

function platformCost(platform) {
  let total = 0;
  for (const id of ISSUE_IDS) {
    const st = STANCES[id].find(s => s.p === platform.positions[id]);
    if (st) total += st.cost;
  }
  return total;
}

/* Ideological spread. A candidate who is -2 on everything is coherent;
   one who is -2 on health and +2 on guns is heterodox, which is worth
   something with cross-pressured voters and costly with everyone else. */
function platformSpread(platform) {
  const v = ISSUE_IDS.map(id => platform.positions[id]);
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  return Math.sqrt(v.reduce((a, b) => a + (b - m) * (b - m), 0) / v.length);
}
function platformCenter(platform) {
  const v = ISSUE_IDS.map(id => platform.positions[id]);
  return v.reduce((a, b) => a + b, 0) / v.length;
}

/* ==========================================================================
   BLOC UTILITY
   The core of the whole game: how much a slice of the electorate likes a
   candidate, given positions, emphasis, party, and personal traits.
   ========================================================================== */
const HETERODOX_FRIENDLY = { suburbMod: 1, libertarian: 1, unionHH: 0.6, hispanicVoters: 0.4 };

/* Party identification is enormously sticky and issue proximity is a
   marginal adjustment on top of it. If that balance is wrong in the other
   direction, a Democrat can simply adopt Republican positions and win
   Mississippi, which is not a game about American politics. */
const PARTY_PULL_W = 2.05;
const ISSUE_W = 1.50;

/* `shift` moves every bloc's ideal point toward one side. It is how primary
   electorates are modeled: the same blocs, but the subset that shows up in
   March is meaningfully more ideological than the one that shows up in
   November. */
function blocUtility(bloc, cand, shift) {
  const p = cand.platform;
  const sh = shift || 0;
  let issueU = 0, wTotal = 0;
  ISSUE_IDS.forEach((iid, k) => {
    const emph = 1 + 1.35 * (p.salience[iid] || 0);
    const w = bloc.weight[k] * emph;
    const diff = Math.abs(p.positions[iid] - (bloc.ideal[k] + sh));
    issueU += w * (1.15 - diff * 0.62);
    wTotal += w;
  });
  let u = (issueU / Math.max(0.001, wTotal)) * ISSUE_W;

  // Partisan baseline
  u += bloc.pull * cand.party.dir * PARTY_PULL_W;

  // Personal traits
  const t = cand.traits;
  u += (t.charisma - 50) / 100 * 0.22;
  u += (t.gravitas - 50) / 100 * 0.15;
  u += (t.authenticity - 50) / 100 * 0.20;

  // Heterodoxy: rewarded by cross-pressured blocs, punished elsewhere,
  // and the punishment shrinks the more authentic you are.
  const spread = platformSpread(p);
  const hx = Math.max(0, spread - 0.95);
  const friendly = HETERODOX_FRIENDLY[bloc.id] || 0;
  u += hx * friendly * 0.26;
  u -= hx * (1 - friendly) * 0.20 * (1 - (t.authenticity - 30) / 140);

  // Extremism reads as risk — to a general electorate. A primary electorate
  // barely registers it, which is the trap.
  const primary = sh !== 0;
  u -= Math.max(0, Math.abs(platformCenter(p)) - 1.1) * (primary ? 0.05 : 0.28);

  // The absence of any conviction at all is the mirror image: a candidate
  // whose every position is the midpoint is a candidate nobody can describe.
  // Activists punish that far harder than the country does.
  let conviction = 0;
  for (const iid of ISSUE_IDS) conviction += Math.abs(p.positions[iid]);
  conviction /= ISSUE_IDS.length;
  u -= Math.max(0, 0.95 - conviction) * (primary ? 0.80 : 0.42) * (1 - (t.authenticity - 30) / 200);

  // Biography and age: a standing affinity, independent of any position.
  if (cand.bioAff) u += cand.bioAff[bloc.id] || 0;

  if (cand.perk === 'coalition' && (bloc.id === 'blackVoters' || bloc.id === 'hispanicVoters')) u += 0.22;
  if (cand.perk === 'commander' && bloc.id === 'securityHawks') u += 0.26;
  if (cand.perk === 'movement' && (bloc.id === 'youngLeft' || bloc.id === 'ruralTrad')) u += 0.13;

  u += (cand.bonusU || 0);
  return u;
}

/* Cache utilities per candidate — recomputed whenever the platform changes. */
function blocUtilityMap(cand, shift) {
  const m = {};
  for (const b of BLOCS) m[b.id] = blocUtility(b, cand, shift);
  return m;
}

/* How far primary voters sit from general-election voters of the same bloc. */
const PRIMARY_SHIFT = 0.85;
function primaryUtilityMap(cand) {
  return blocUtilityMap(cand, PRIMARY_SHIFT * cand.party.dir);
}

/* The morale of your own party's committed voters, which converts into
   turnout. Activists are not median voters: they sit well out on their own
   side and they score you against that, not against the country. This is the
   engine of the whole primary-versus-general trade-off. */
const ACTIVIST_IDEAL = 1.8;
function baseMoraleFromPlatform(cand) {
  const dir = cand.party.dir;
  let s = 0, w = 0;
  for (const iid of ISSUE_IDS) {
    const emph = 1 + 0.9 * (cand.platform.salience[iid] || 0);
    s += emph * (1 - Math.abs(cand.platform.positions[iid] - ACTIVIST_IDEAL * dir) * 0.62);
    w += emph;
  }
  return clamp(50 + (s / w) * 40, 10, 95);
}

/* ==========================================================================
   GENERAL ELECTION
   ========================================================================== */
const CULT_W = 0.55;
const PERSUADE_K = 0.0100;   // per unit of sqrt(effort)
const GROUND_K   = 0.0048;   // turnout multiplier per unit of sqrt(effort)
/* Aiming a budget at one bloc instead of spraying it at a state.
   Two things stop this being a dominant strategy rather than a choice.
   First, narrowcasting saturates far faster than broadcast does: you can only
   put a message in front of the same two million people so many times, so the
   bloc term uses a much steeper root than the statewide one. Measured at equal
   dollars: a first buy at the right bloc is worth about 1.25x a broadcast buy,
   and a third buy into that same bloc is worth about 0.2x one.
   Second, a message written for one group is seen by the others. */
const TARGET_K    = 3.40;
const TARGET_POW  = 0.34;    // versus 0.5 for broad spending — it walls off sooner
const SPILL_K     = 0.05;    // what the people it was not written for make of it

/* How a state is being contested. Persuasion moves share; turnout moves your
   own half of the blocs that already agree with you. Neither dominates: the
   right posture depends on whether the state is close because both sides are
   persuadable or close because neither side has shown up. */
const POSTURES = {
  /* The default, and deliberately never the best answer: it is what a state
     looks like before anyone has decided what to do with it. Nothing is
     sharpened and nothing is wasted, which is the worst of a plan and the best
     of not having one. */
  balanced:   { id: 'balanced',   name: 'No Plan Yet',   persuade: 1.00, ground: 1.00,
                blurb: 'No theory of this state at all. Never the best answer once you have one — and never a disaster if you never get one.' },
  persuasion: { id: 'persuasion', name: 'Persuasion',    persuade: 1.34, ground: 0.68,
                blurb: 'Everything into changing minds. Right where the middle is genuinely up for grabs.' },
  turnout:    { id: 'turnout',    name: 'Turnout',       persuade: 0.66, ground: 1.42,
                blurb: 'Everything into getting your own people to the polls. Right where the state is sorted and the margin is a mobilization problem.' },
  /* Defend is deliberately not a third point on the persuasion-turnout line —
     an interpolation between two options is always beaten by one of them. It
     is worse than either at *gaining* and it is the only posture that does
     anything about the other campaign: an operation dug in to hold a state
     blunts most of what they spend attacking it. */
  defend:     { id: 'defend',     name: 'Hold and Defend', persuade: 0.82, ground: 1.06, blunt: 0.42,
                blurb: 'Poor at building a lead and the only thing that protects one: it absorbs most of what the other campaign spends against you here each week.' }
};
const POSTURE_LIST = Object.values(POSTURES);

/* sqrt that keeps its sign, so that being outspent still reads as a deficit. */
function signedRoot(x) { return Math.sign(x) * Math.sqrt(Math.abs(x)); }

function stateResult(state, player, opp, env, effort) {
  const uP = player.uMap, uO = opp.uMap;
  let votesP = 0, votesTotal = 0;
  const blocDetail = {};

  const eff = effort || {};
  // Campaign effort has sharply diminishing returns. Without the square root,
  // stacking ad buys in one state moves it twenty points and the map becomes
  // a spreadsheet exercise; with it, a fully-funded effort in a battleground
  // is worth a few points — enough to decide a close state and nothing more.
  const persuade = signedRoot(eff.persuade || 0);
  const ground = signedRoot(eff.ground || 0);
  const digital = signedRoot(eff.digital || 0);

  // A state gets a posture as well as a budget. Persuasion buys share;
  // turnout buys your own half of every bloc that already agrees with you.
  // Running the same play in all fifty-one states is what the posture exists
  // to stop being the obvious move.
  const post = POSTURES[eff.posture || 'balanced'] || POSTURES.balanced;
  const blocBuy = eff.bloc || {};

  // Spillover. Anything aimed at one bloc is overheard by the rest, and the
  // further a bloc sits from the one the message was written for, the worse
  // it plays. This is why you cannot simply buy every bloc in turn.
  let spill = null;
  for (const id in blocBuy) {
    if (!blocBuy[id]) continue;
    if (!spill) spill = {};
    const src = BLOC_BY_ID[id];
    const reach = Math.pow(Math.abs(blocBuy[id]), TARGET_POW);
    for (const c of BLOCS) {
      if (c.id === id) continue;
      const apart = Math.abs(c.pull - src.pull) / 2;          // 0 when aligned, 1 at the poles
      spill[c.id] = (spill[c.id] || 0) - reach * apart * SPILL_K * PERSUADE_K;
    }
  }

  for (const b of BLOCS) {
    const comp = state.comp[b.id];
    if (!comp) continue;
    let diff = uP[b.id] - uO[b.id];

    // Cultural residual not captured by demographics
    diff += state.cult * CULT_W * player.party.dir;

    // Where you are from. Worth about three points at home and a fraction of
    // that across the region, which is roughly what a favourite son is worth.
    if (player.home) {
      if (player.home.abbr === state.abbr) diff += HOME_STATE_BONUS;
      else if (player.home.region && player.home.region.has(state.abbr)) diff += HOME_REGION_BONUS;
    }
    if (opp.home) {
      if (opp.home.abbr === state.abbr) diff -= HOME_STATE_BONUS;
      else if (opp.home.region && opp.home.region.has(state.abbr)) diff -= HOME_REGION_BONUS;
    }

    // National environment: economy and time-for-a-change punish the
    // party that currently holds the White House.
    diff -= env.incumbentPenalty * (player.party.id === env.incumbentParty ? 1 : -1);

    // Campaign effort in this state
    diff += persuade * PERSUADE_K * post.persuade;

    // Digital reaches low-propensity voters far better than broadcast does
    diff += digital * PERSUADE_K * (b.turnout < 1 ? 1.6 : 0.55) * post.persuade;

    // Money aimed at one bloc, and the overheard cost of everyone else's.
    const aimed = blocBuy[b.id] || 0;
    if (aimed) diff += Math.sign(aimed) * Math.pow(Math.abs(aimed), TARGET_POW) * PERSUADE_K * TARGET_K;
    if (spill) diff += spill[b.id] || 0;

    const share = logistic(diff * 1.25);

    // Turnout. Each side mobilizes its own half of the bloc: a demoralized
    // Democratic base means fewer Democratic votes out of this bloc without
    // changing the Republican ones. Applying only the player's morale — as
    // an earlier version did — hands whoever is passed in as `player` a free
    // mobilization edge and lets the AI moderate at no cost to its base.
    const basePool = comp * b.turnout;
    const align = clamp(b.pull * player.party.dir, -1, 1);
    const enthP = (player.baseMorale - 58) / 42;
    const enthO = ((opp.baseMorale === undefined ? 58 : opp.baseMorale) - 58) / 42;

    let mobP = 1 + ground * GROUND_K * post.ground;   // your field turns out your voters
    if (align > 0) mobP *= clamp(1 + enthP * (0.15 + 0.58 * align), 0.50, 1.35);
    let mobO = 1;
    if (align < 0) mobO *= clamp(1 + enthO * (0.15 + 0.58 * -align), 0.50, 1.35);

    const vP = basePool * share * mobP;
    const vO = basePool * (1 - share) * mobO;
    votesP += vP;
    votesTotal += vP + vO;
    blocDetail[b.id] = { share, pool: basePool, vP, vO };
  }

  let margin = (votesP / votesTotal) * 2 - 1; // player two-party margin, -1..1
  return { margin, share: votesP / votesTotal, blocDetail };
}

function runGeneralElection(player, opp, env, efforts, opts) {
  opts = opts || {};
  const nationalNoise = opts.noNoise ? 0 : gauss(0, 0.020);
  const results = [];
  let evP = 0, evO = 0, popP = 0, popTotal = 0;

  for (const st of STATES) {
    const r = stateResult(st, player, opp, env, efforts[st.abbr]);
    const stateNoise = opts.noNoise ? 0 : gauss(0, 0.016);
    const margin = r.margin + nationalNoise + stateNoise;
    const share = 0.5 + margin / 2;
    const won = margin > 0;
    if (won) evP += st.ev; else evO += st.ev;
    popP += share * st.weight;
    popTotal += st.weight;
    results.push({ abbr: st.abbr, name: st.name, ev: st.ev, margin, share, won });
  }
  results.sort((a, b) => b.margin - a.margin);
  return {
    states: results, evP, evO,
    popular: popP / popTotal,
    tipping: findTipping(results, evP >= 270)
  };
}

function findTipping(sorted, playerWon) {
  let acc = 0;
  for (const r of sorted) {
    acc += r.ev;
    if (acc >= 270) return r;
  }
  return sorted[sorted.length - 1];
}

/* A projection with no noise, for the map the player looks at while
   deciding where to spend. */
function projectElection(player, opp, env, efforts) {
  return runGeneralElection(player, opp, env, efforts, { noNoise: true });
}

/* ==========================================================================
   CALIBRATION
   The demographic model alone does not reproduce American politics — it says
   rural Maine should vote like rural Mississippi, and it does not. So the
   model is run as a *swing* model: each state's `cult` residual is solved at
   boot so that a generic Democrat against a generic Republican reproduces
   that state's known prior margin. Demographics then govern how far a state
   moves when the platform changes, which is the part the player controls.
   ========================================================================== */
/* The reference nominee: party-line on every issue, no emphasis, average in
   every personal respect. It must be built exactly the way a real candidate
   is — including deriving its base morale rather than assuming it — or the
   turnout term desynchronizes and the anchor stops holding. */
function calibrationCandidate(partyId) {
  const pf = emptyPlatform();
  const dir = PARTIES[partyId].dir;
  for (const id of ISSUE_IDS) pf.positions[id] = dir;
  return makeCandidate({ id: 'calib', partyId, platform: pf });
}

/* ==========================================================================
   CANDIDATE CONSTRUCTION AND THE OPPOSING AI
   ========================================================================== */
function makeCandidate(o) {
  const c = Object.assign({ id: 'x', name: 'Opponent', bonusU: 0 }, o);
  c.traits = Object.assign(
    { charisma: 50, discipline: 50, gravitas: 50, authenticity: 50, money: 50, legislative: 50 },
    o.traits || {});
  c.party = PARTIES[c.partyId];
  refreshCandidate(c);
  return c;
}

/* Call after any change to a candidate's platform, traits, or bonuses.

   Base morale is derived from the platform only while the platform is still
   being written. Once it is locked, morale becomes a live quantity that
   rallies, gaffes, running mates, deals and defeats all move — and
   recomputing it here would silently throw every one of those away. It did:
   any handler that adjusted morale and then refreshed the candidate, which is
   most of them, was reverting its own effect on the next line. */
function refreshCandidate(c) {
  c.uMap = blocUtilityMap(c);
  c.uMapPrim = primaryUtilityMap(c);
  if (c.moraleFromPlatform !== false) c.baseMorale = baseMoraleFromPlatform(c);
  return c;
}

/* Each party's default message runs on the ground it owns. Giving both sides
   the same three signature issues quietly hands one of them the election. */
const DEFAULT_MESSAGE = {
  D: ['health', 'housing', 'social'],
  R: ['taxes', 'immig', 'crime']
};

function genericOpponent(partyId) {
  const pf = emptyPlatform();
  const dir = PARTIES[partyId].dir;
  for (const id of ISSUE_IDS) pf.positions[id] = dir;
  pf.signature = DEFAULT_MESSAGE[partyId].slice();
  pf.signature.forEach(i => pf.salience[i] = 1);
  return makeCandidate({
    id: 'gen', name: 'The Opposition', partyId, platform: pf,
    traits: { charisma: 55, discipline: 58, gravitas: 60, authenticity: 52, money: 70, legislative: 55 }
  });
}

/* The opposing nominee repositions to exploit whatever ground you left open.
   They cannot cross the aisle and they pay the same base-turnout price you do
   for moderating, so the greedy search finds a real equilibrium rather than
   collapsing onto the median voter. */
function optimizeOpponent(opp, player, env, rounds) {
  const dir = opp.party.dir;
  // Optimize the tipping-point margin, not the electoral vote count. It is
  // what a real campaign maximizes, and it is smooth — electoral votes come
  // in lumps of three to fifty-four, which stalls a greedy search early and
  // makes the AI accidentally better at playing one party than the other.
  const score = () => {
    refreshCandidate(opp);
    const r = projectElection(opp, player, env, {});
    return r.tipping.margin + r.popular * 0.05;
  };
  for (let r = 0; r < rounds; r++) {
    const baseScore = score();
    let best = null;
    for (const id of ISSUE_IDS) {
      const orig = opp.platform.positions[id];
      for (const st of STANCES[id]) {
        if (st.p === orig) continue;
        if (st.p * dir < -0.5) continue;                  // cannot cross the aisle
        opp.platform.positions[id] = st.p;
        if (platformCenter(opp.platform) * dir < 0.45) { opp.platform.positions[id] = orig; continue; }
        const s = score();
        if (s > baseScore && (!best || s > best.s)) best = { id, p: st.p, s };
        opp.platform.positions[id] = orig;
      }
    }
    if (!best) break;
    opp.platform.positions[best.id] = best.p;
  }
  score();
  return opp;
}

/* How far safe-state margins are compressed toward the national result.
   Tuned so the tipping-point state sits about a point and a half from the
   national margin — a real college bias, not a disqualifying one. */
const SAFE_COMPRESSION = 0.40;

let CALIBRATED = false;
let NATIONAL_BASE = 0;
/* The two generic nominees are kept after calibration rather than discarded.
   Every "you are running four points ahead of a generic Democrat here" figure
   in the game is measured against them, so they have to be the same objects
   the map was solved with. */
const GENERIC = { D: null, R: null };
function calibrateStates() {
  if (CALIBRATED) return;
  const D = calibrationCandidate('D'), R = calibrationCandidate('R');
  GENERIC.D = D; GENERIC.R = R;
  const env = { incumbentParty: 'R', incumbentPenalty: 0 };

  // Anchor to *relative* lean, not absolute. The prior year's national margin
  // is divided out so that two generic nominees start at 50-50 and both
  // parties are playable; each state keeps its lean relative to the country,
  // which is what a partisan index actually measures. The national
  // environment then comes from the economy and time-for-a-change instead of
  // from a frozen result.
  let wsum = 0;
  NATIONAL_BASE = 0;
  for (const st of STATES) { NATIONAL_BASE += st.base * st.weight; wsum += st.weight; }
  NATIONAL_BASE /= wsum;

  // A partisan index is normally built from more than one cycle. A single
  // year — especially one with very lopsided safe states — overstates how
  // much of one party's vote is wasted, and hands the other party a huge
  // structural edge in the electoral college. Compressing the safe-state
  // margins is what a two-cycle blend does in practice, and it brings the
  // college bias down to a couple of points instead of three and a half.
  for (const st of STATES) {
    const raw = st.base - NATIONAL_BASE;
    st.pvi = raw * (1 - SAFE_COMPRESSION * Math.min(1, Math.abs(raw) / 30));
  }
  let mean = 0;
  for (const st of STATES) mean += st.pvi * st.weight;
  mean /= wsum;
  for (const st of STATES) st.pvi -= mean;   // re-center on a 50-50 nation

  for (const st of STATES) solveCult(st, D, R, env, st.pvi / 100);
  CALIBRATED = true;
}

/* Solve a state's residual so it reproduces `target`. The margin is monotone
   in cult for a fixed pair of candidates, so plain bisection converges. */
function solveCult(st, D, R, env, target) {
  let lo = -12, hi = 12;
  for (let i = 0; i < 44; i++) {
    const mid = (lo + hi) / 2;
    st.cult = mid;
    if (stateResult(st, D, R, env, null).margin > target) lo = mid; else hi = mid;
  }
  st.cult = (lo + hi) / 2;
}

/* Every cycle the map moves. The diploma divide widens or narrows, a region
   swings, and the state that decides the election is not the one that decided
   the last one. Without this the college bias is a fixed constant and one
   party's campaign is the same uphill walk every single game.
   Called once per playthrough, after the game seed is set. */
function applyCycleDrift() {
  const D = calibrationCandidate('D'), R = calibrationCandidate('R');
  const env = { incumbentParty: 'R', incumbentPenalty: 0 };
  const diploma = gauss(0, 1.6);   // this cycle's education realignment
  const region = gauss(0, 1.1);    // sun belt versus rust belt
  for (const st of STATES) {
    const edu = (st.college - 33) / 9;
    const sun = (st.hispanic - 12) / 14;
    st.pvi += diploma * edu + region * sun + gauss(0, 1.9);
  }

  // Then set this cycle's electoral college bias. Seeding the map from a
  // single real election also inherits that election's college bias as a
  // permanent constant, which makes one party's campaign the same uphill
  // walk in every playthrough. Real maps do not work that way: the gap
  // between the tipping-point state and the national margin has changed
  // sign within living memory. So it is drawn fresh each cycle and the
  // battleground states are nudged until the map actually delivers it.
  const target = gauss(0.6, 1.9);   // points of bias against the Democrats
  recenter(D, R, env);
  for (let pass = 0; pass < 6; pass++) {
    const bias = -projectElection(D, R, env, {}).tipping.margin * 100;
    if (Math.abs(bias - target) < 0.25) break;
    const adj = (bias - target) * 0.85;
    for (const st of STATES) {
      const competitive = Math.exp(-Math.pow(st.pvi / 13, 2));
      st.pvi += adj * competitive;
    }
    recenter(D, R, env);
  }
  CYCLE_BIAS = -projectElection(D, R, env, {}).tipping.margin * 100;
}
let CYCLE_BIAS = 0;

/* Re-center the map on a 50-50 nation and re-solve every residual. */
function recenter(D, R, env) {
  let mean = 0, wsum = 0;
  for (const st of STATES) { mean += st.pvi * st.weight; wsum += st.weight; }
  mean /= wsum;
  for (const st of STATES) { st.pvi -= mean; solveCult(st, D, R, env, st.pvi / 100); }
}

/* ==========================================================================
   PRIMARY
   ========================================================================== */
/* The November electorate: every state's composition, weighted by electoral
   votes and by how reliably each bloc actually turns out. */
function nationalWeights() {
  const out = {}; let tot = 0;
  for (const b of BLOCS) {
    let v = 0;
    for (const s of STATES) v += s.comp[b.id] * s.weight;
    v *= b.turnout; out[b.id] = v; tot += v;
  }
  for (const k in out) out[k] /= tot;
  return out;
}

function primaryElectorate(partyId) {
  const w = PARTIES[partyId].primaryWeights;
  const out = {};
  let tot = 0;
  for (const b of BLOCS) { const v = (w[b.id] || 0) * b.turnout; out[b.id] = v; tot += v; }
  for (const k in out) out[k] /= tot;
  return out;
}

/* State-level primary electorate = national party weights × state composition */
function statePrimaryWeights(state, partyId) {
  const w = PARTIES[partyId].primaryWeights;
  const out = {}; let tot = 0;
  for (const b of BLOCS) {
    const v = state.comp[b.id] * (w[b.id] || 0) * b.turnout;
    out[b.id] = v; tot += v;
  }
  for (const k in out) out[k] /= (tot || 1);
  return out;
}

function runPrimaryContest(contest, field, spendMap) {
  // field: [{ id, name, uMap, funds, momentum, traits, organization }]
  const stateShares = {};
  const totals = {};
  field.forEach(c => totals[c.id] = 0);
  let totalDelegateWeight = 0;

  for (const abbr of contest.states) {
    const st = STATE_BY_ABBR[abbr];
    if (!st) continue;
    const w = statePrimaryWeights(st, field[0].partyId);
    const scores = {};
    for (const c of field) {
      let s = 0;
      for (const b of BLOCS) s += w[b.id] * (c.uMapPrim || c.uMap)[b.id];
      s += (c.momentum || 0) * 0.10;
      s += Math.log(1 + (spendMap[c.id] || 0) / 12) * 0.16;
      s += (c.organization || 0) * 0.012 * (contest.states.length === 1 ? 2.0 : 0.6);
      s += gauss(0, 0.10);
      scores[c.id] = s;
    }
    // Multinomial logit over the field
    let denom = 0; const exps = {};
    for (const c of field) { exps[c.id] = Math.exp(scores[c.id] * 1.55); denom += exps[c.id]; }
    const share = {};
    for (const c of field) share[c.id] = exps[c.id] / denom;
    stateShares[abbr] = share;
    const wgt = st.ev;
    totalDelegateWeight += wgt;
    for (const c of field) totals[c.id] += share[c.id] * wgt;
  }

  for (const k in totals) totals[k] /= (totalDelegateWeight || 1);

  // 15% viability threshold, then proportional allocation
  const viable = {}; let vSum = 0;
  for (const c of field) {
    const v = totals[c.id] >= 0.15 ? totals[c.id] : 0;
    viable[c.id] = v; vSum += v;
  }
  if (vSum === 0) { for (const c of field) { viable[c.id] = totals[c.id]; vSum += totals[c.id]; } }
  const delegates = {};
  for (const c of field) delegates[c.id] = Math.round(contest.delegates * viable[c.id] / vSum);

  return { shares: totals, delegates, stateShares };
}

/* ==========================================================================
   CONGRESS
   ========================================================================== */
const FISCAL = { prog: 0.05, newdem: 0.35, bluedog: 0.85, mainst: 0.60, rsc: 0.95, freedom: 1.75 };

/* Seat totals from the presidential result. Coattails are real but modest;
   the midterm penalty is applied separately. */
function deriveCongress(natMargin, partyId) {
  const swing = natMargin * 100; // player's national two-party margin in points
  // House: 435 seats. A structural bias against the party with efficient
  // urban clustering, expressed as a small handicap for the Democrats.
  const structural = partyId === 'D' ? -2.2 : 0.8;
  const houseP = Math.round(clamp(218 + (swing + structural) * 6.4, 150, 300));
  const senateP = Math.round(clamp(50 + (swing + structural * 0.6) * 1.35, 36, 64));
  return { house: { P: houseP, O: 435 - houseP }, senate: { P: senateP, O: 100 - senateP } };
}

/* Split each party's seats among its caucuses. */
function caucusSeats(congress, playerPartyId) {
  const out = {};
  for (const chamber of ['house', 'senate']) {
    out[chamber] = {};
    for (const partyKey of ['P', 'O']) {
      const partyId = partyKey === 'P' ? playerPartyId : (playerPartyId === 'D' ? 'R' : 'D');
      const cs = CAUCUSES.filter(c => c.party === partyId);
      const tot = cs.reduce((a, c) => a + c.share, 0);
      const seats = congress[chamber][partyKey];
      cs.forEach(c => {
        // The Senate is systematically less factionalized than the House.
        let share = c.share / tot;
        if (chamber === 'senate') {
          const pull = (c.id === 'freedom' || c.id === 'prog') ? 0.62 : 1.18;
          share *= pull;
        }
        out[chamber][c.id] = share * seats;
      });
      // renormalize
      const s = cs.reduce((a, c) => a + out[chamber][c.id], 0);
      cs.forEach(c => out[chamber][c.id] = Math.round(out[chamber][c.id] * seats / s));
      // fix rounding drift
      let drift = seats - cs.reduce((a, c) => a + out[chamber][c.id], 0);
      let i = 0;
      while (drift !== 0 && cs.length) {
        out[chamber][cs[i % cs.length].id] += Math.sign(drift);
        drift -= Math.sign(drift); i++;
      }
    }
  }
  return out;
}

/* ==========================================================================
   BILLS AND WHIP COUNTS
   ========================================================================== */
function billState(bill, selectedIds) {
  const provs = bill.provisions.filter(p => selectedIds.includes(p.id));
  const cost = provs.reduce((a, p) => a + p.cost, 0);
  const pos = provs.length ? provs.reduce((a, p) => a + p.pos, 0) / provs.length : 0;
  const magnitude = provs.reduce((a, p) => a + Math.abs(p.pos) * (0.5 + Math.abs(p.cost) / 300), 0);
  return { provs, cost, pos, magnitude };
}

/* How much a caucus likes the bill as currently drafted. */
function caucusUtility(caucus, bill, selectedIds, ctx) {
  const k = ISSUE_IDS.indexOf(bill.issue);
  const ideal = caucus.ideal[k];
  const bs = billState(bill, selectedIds);
  const samePartyLabel = caucus.party === ctx.playerParty;

  let u = 0;
  for (const p of bs.provs) {
    const weight = 0.55 + Math.min(1.1, Math.abs(p.cost) / 220);
    u += weight * (1.05 - Math.abs(p.pos - ideal) * 0.72);
  }
  u /= Math.max(1, bs.provs.length * 0.55);

  // Fiscal pain, and the fact that deficit hawks scale with the running total
  const fis = FISCAL[caucus.id] || 0.5;
  u -= Math.max(0, bs.cost) / 260 * fis;
  u -= Math.max(0, ctx.deficit - 1400) / 2600 * fis;

  // Party loyalty and presidential pressure
  if (samePartyLabel) {
    u += caucus.discipline * 1.55;
    u += (ctx.loyalty || 0) * 0.06;             // credit banked by standing by your people
    u += (ctx.approval - 44) / 48 * caucus.exposure * 1.25;
    u += (ctx.baseMorale - 50) / 100 * (caucus.id === 'prog' || caucus.id === 'freedom' ? 0.9 : 0.25);
  } else {
    u -= 1.85 - ctx.bipartisan * 0.030;
    u += (ctx.approval - 56) / 44 * caucus.exposure * 1.05;
  }

  // Empty bills are not bills
  if (bs.provs.length === 0) u -= 3;

  // Deals, earmarks, and pulpit pressure applied during the whip phase
  u += (ctx.boosts && ctx.boosts[caucus.id]) || 0;
  if (ctx.pulpit) u += ctx.pulpit * caucus.exposure * 0.9;
  if (ctx.reconciliation && !samePartyLabel) u -= 0.9; // partisan process hardens them
  if (ctx.vehicle) u += 0.75;

  return u;
}

function whipCount(bill, selectedIds, ctx) {
  const rows = [];
  for (const c of CAUCUSES) {
    const u = caucusUtility(c, bill, selectedIds, ctx);
    // Within a caucus, members are spread around the caucus position, so a
    // marginal caucus splits rather than moving as a bloc.
    const frac = clamp(logistic(u * 1.35), 0.01, 0.99);
    rows.push({
      caucus: c, u, frac,
      house: ctx.seats.house[c.id] || 0,
      senate: ctx.seats.senate[c.id] || 0,
      houseYes: Math.round((ctx.seats.house[c.id] || 0) * frac),
      senateYes: Math.round((ctx.seats.senate[c.id] || 0) * frac)
    });
  }
  const houseYes = rows.reduce((a, r) => a + r.houseYes, 0);
  const senateYes = rows.reduce((a, r) => a + r.senateYes, 0);
  const senateNeeded = ctx.reconciliation || ctx.filibusterGone ? 50 : 60;
  return {
    rows, houseYes, houseNeeded: 218, senateYes, senateNeeded,
    housePass: houseYes >= 218,
    senatePass: senateYes >= senateNeeded,
    passes: houseYes >= 218 && senateYes >= senateNeeded
  };
}

/* Byrd rule: reconciliation strips anything that is not primarily budgetary. */
function applyByrd(bill, selectedIds) {
  const kept = [], stripped = [];
  for (const p of bill.provisions) {
    if (!selectedIds.includes(p.id)) continue;
    (p.byrd ? kept : stripped).push(p);
  }
  return { kept: kept.map(p => p.id), stripped };
}

/* ==========================================================================
   INTEREST GROUPS
   ========================================================================== */
function groupReaction(group, bill, selectedIds) {
  const k = ISSUE_IDS.indexOf(bill.issue);
  const bs = billState(bill, selectedIds);
  if (!bs.provs.length) return 0;
  const care = group.care[k];
  if (care < 0.05) return 0;
  const dist = Math.abs(bs.pos - group.ideal[k]);
  return clamp((1.2 - dist * 0.75) * care * group.power, -1.4, 1.4);
}

/* Groups convert their reaction into pressure on caucuses they can reach. */
function groupPressure(bill, selectedIds) {
  const boosts = {}, detail = [];
  for (const g of GROUPS) {
    const r = groupReaction(g, bill, selectedIds);
    if (Math.abs(r) < 0.05) continue;
    detail.push({ group: g, reaction: r });
    for (const cid in g.reach) {
      boosts[cid] = (boosts[cid] || 0) + r * g.reach[cid] * 0.42;
    }
  }
  detail.sort((a, b) => Math.abs(b.reaction) - Math.abs(a.reaction));
  return { boosts, detail };
}

/* ==========================================================================
   OUTCOMES
   What a presidency did, as distinct from what the country thought of it.
   A promise-kept tally cannot tell the difference between a bill that passed
   whole and the same bill gutted to reach sixty votes; these numbers can.
   ========================================================================== */
function addOutcomes(g, out, scale) {
  if (!out) return;
  const s = scale === undefined ? 1 : scale;
  for (const k in out) g.outcomes[k] = (g.outcomes[k] || 0) + out[k] * s;
}

/* An order or a rule is policy without a bill, so there are no provisions to
   read outcomes off. Approximate it: take the bill covering that issue, keep
   the provisions pointing the way the president promised, and apply a share
   scaled by how far the promise went and how much of it survives contact. */
function applyIssueOutcomes(g, issueId, target, scale) {
  const bill = BILLS.find(b => b.issue === issueId);
  if (!bill || !target) return;
  const dir = Math.sign(target);
  const provs = bill.provisions.filter(p => Math.sign(p.pos) === dir);
  if (!provs.length) return;
  const share = scale * Math.min(1, Math.abs(target) / 2) / Math.max(1, provs.length / 2.2);
  for (const pv of provs) addOutcomes(g, pv.out, share);
}

/* ==========================================================================
   APPROVAL AND CAPITAL
   ========================================================================== */
function quarterlyCapital(g) {
  const q = g.term === 2 ? g.quarter - 16 : g.quarter;
  let cap = 14;
  cap += (g.approval - 47) * 0.55;
  cap += (g.econ) * 2.4;
  if (q <= 2) cap += 12;                       // honeymoon, in either term
  if (q > 8) cap -= 5;                         // lame-duck drift within a term
  // A president who cannot run again cannot threaten anyone with a primary,
  // and every member of their own party is already working for the successor.
  if (g.term === 2) cap -= 4 + Math.max(0, q - 6) * 0.8;
  cap += g.congress.senate.P >= 60 ? 6 : 0;
  cap *= (g.perk === 'executive') ? 1.15 : 1;
  return Math.round(clamp(cap, 3, 60));
}

function approvalDrift(g) {
  // Thermostatic: the public moves against whoever is acting.
  let d = 0;
  d += g.econ * 1.5;
  d -= 0.7;                                     // gravity
  d += (48 - g.approval) * 0.09;                // mean reversion
  return d;
}

/* Enacted policy positions vs. what you promised. */
function promiseScore(platform, enacted) {
  let kept = 0, broken = 0, untouched = 0;
  const detail = [];
  for (const id of ISSUE_IDS) {
    const promised = platform.positions[id];
    const got = enacted[id];
    if (got === undefined) {
      if (Math.abs(promised) >= 1) { untouched++; detail.push({ id, status: 'untouched', promised }); }
      continue;
    }
    const dist = Math.abs(got - promised);
    if (dist <= 0.7) { kept++; detail.push({ id, status: 'kept', promised, got }); }
    else { broken++; detail.push({ id, status: 'broken', promised, got }); }
  }
  return { kept, broken, untouched, detail };
}

function midtermSwing(g) {
  // Presidents lose seats. Bad presidents lose more.
  let base = -24;
  base += (g.approval - 47) * 1.5;
  base += g.econ * 7;
  base -= Math.max(0, g.oppEnergy) * 0.35;
  base += (g.baseMorale - 50) * 0.18;
  const house = Math.round(clamp(base + gauss(0, 6), -68, 30));
  const senate = Math.round(clamp(base / 9 + gauss(0, 1.4), -9, 5));
  return { house, senate };
}

function finalScore(g) {
  const ps = promiseScore(g.platform, g.enacted);
  const parts = {
    promises: ps.kept * 90 - ps.broken * 25,
    approval: Math.round((g.approval - 45) * 8),
    economy: Math.round(g.econ * 60),
    legislation: g.laws.length * 55,
    reelection: g.reelected === true ? 400 : (g.reelected === false ? -150 : 0),
    base: Math.round((g.baseMorale - 50) * 3),
    deficit: -Math.round(Math.max(0, g.deficit - 1200) / 12),
    institutions: -Math.round(g.institutionalDamage * 12)
  };
  const total = Object.values(parts).reduce((a, b) => a + b, 0);
  return { parts, total, ps };
}

const LEGACY_TIERS = [
  { min: 1400, title: 'Transformational',  text: 'Historians will describe an era with your name on it. The coalition you built outlived you.' },
  { min: 900,  title: 'Consequential',     text: 'You moved the country somewhere it was not going to go by itself. The cost was real and so was the change.' },
  { min: 500,  title: 'Effective',         text: 'You governed competently, kept most of what you promised, and left the machine running.' },
  { min: 180,  title: 'Ordinary',          text: 'A presidency. Some bills, some setbacks, a library with reasonable attendance.' },
  { min: -100, title: 'Frustrated',        text: 'You learned that the Senate is a place where agendas go to be studied.' },
  { min: -1e9, title: 'Failed',            text: 'The coalition broke, the agenda stalled, and your own party started running against you.' }
];
function legacyTier(total) { return LEGACY_TIERS.find(t => total >= t.min); }
