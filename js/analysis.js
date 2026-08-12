/* ==========================================================================
   MANDATE — decision analysis

   sim.js answers "what happens". This file answers "what would happen
   instead", which is the question a player actually has in front of a menu.

   Everything here works the same way: measure, change exactly one input,
   measure again, put the original back. The numbers on screen are therefore
   produced by the same engine that will resolve the turn — not by a second,
   friendlier model that can quietly drift away from it. When the readout says
   a plank costs you two points in Pennsylvania, election night will agree.

   No DOM in this file.
   ========================================================================== */

/* ==========================================================================
   CONTEXT
   The opponent and environment every measurement is taken against. Before
   the nominee exists, a generic one stands in.
   ========================================================================== */
function analysisCtx(player, over) {
  const oppParty = player.partyId === 'D' ? 'R' : 'D';
  const ctx = {
    opp: G.opp || genericOpponent(oppParty),
    env: G.env || { incumbentParty: oppParty, incumbentPenalty: 0.10 },
    rival: primaryBenchmark(player),
    primW: primaryElectorate(player.partyId),
    natW: nationalWeights(),
    efforts: (G.general && G.general.efforts) || {}
  };
  return Object.assign(ctx, over || {});
}

/* The rival the primary readout scores you against: whoever is actually
   leading the field. Generating a fresh one per render — as an earlier
   version did — both changed the yardstick under the player mid-decision and
   consumed seeded randomness, so two identical playthroughs diverged based on
   how many times the platform screen had been redrawn. */
function primaryBenchmark(player) {
  const field = (G.primary && G.primary.field) || G.field || [];
  const live = field.filter(f => !(G.primary && G.primary.dropped.includes(f.id)));
  if (!live.length) return genericOpponent(player.partyId);
  if (!G.primary) return live[0];
  return live.slice().sort((a, b) =>
    (G.primary.delegates[b.id] || 0) - (G.primary.delegates[a.id] || 0) ||
    b.momentum - a.momentum)[0];
}

/* ==========================================================================
   MEASUREMENT
   One reading of where a candidate stands, on every axis the player is
   trading between.
   ========================================================================== */
function measureCandidate(cand, ctx) {
  refreshCandidate(cand);

  // Primary standing, scored the way the primary itself scores it — against
  // the shifted electorate that actually shows up in March.
  let prim = 0;
  for (const b of BLOCS) prim += ctx.primW[b.id] * (cand.uMapPrim[b.id] - ctx.rival.uMapPrim[b.id]);

  const gen = projectElection(cand, ctx.opp, ctx.env, ctx.efforts);
  const byState = {};
  for (const s of gen.states) byState[s.abbr] = s.margin;

  const byBloc = {};
  for (const b of BLOCS) byBloc[b.id] = logistic((cand.uMap[b.id] - ctx.opp.uMap[b.id]) * 1.25);

  return {
    prim: prim * 100,
    tip: gen.tipping.margin * 100,
    tipState: gen.tipping.name,
    ev: gen.evP,
    pop: gen.popular * 100,
    morale: cand.baseMorale,
    cost: platformCost(cand.platform),
    byState, byBloc
  };
}

/* ==========================================================================
   STANCE ANALYSIS — the platform screen
   For one issue, what each of the five available stances would do to the two
   electorates that disagree about you.
   ========================================================================== */
function stanceAnalysis(cand, issueId, ctx) {
  const pos = cand.platform.positions;
  const orig = pos[issueId];
  const base = measureCandidate(cand, ctx);
  const baseCost = (STANCES[issueId].find(s => s.p === orig) || { cost: 0 }).cost;
  const out = [];

  for (const st of STANCES[issueId]) {
    if (st.p === orig) {
      out.push({ p: st.p, current: true, dPrim: 0, dTip: 0, dEv: 0, dMorale: 0, dCost: 0,
                 blocs: [], states: [] });
      continue;
    }
    pos[issueId] = st.p;
    const m = measureCandidate(cand, ctx);
    out.push({
      p: st.p, current: false,
      dPrim: m.prim - base.prim,
      dTip: m.tip - base.tip,
      dEv: m.ev - base.ev,
      dMorale: m.morale - base.morale,
      dCost: st.cost - baseCost,
      blocs: blocMovers(base.byBloc, m.byBloc, ctx),
      states: stateMovers(base.byState, m.byState)
    });
  }

  pos[issueId] = orig;
  refreshCandidate(cand);

  // Which option each electorate would pick, for the badges on the cards.
  const bestPrim = out.reduce((a, b) => (b.dPrim > a.dPrim ? b : a), out[0]);
  const bestGen  = out.reduce((a, b) => (b.dTip  > a.dTip  ? b : a), out[0]);
  out.forEach(o => {
    o.bestPrimary = o === bestPrim && o.dPrim > 0.05;
    o.bestGeneral = o === bestGen && o.dTip > 0.02;
  });
  return out;
}

/* The states where the move actually matters. Ranking on the size of the
   swing alone surfaces California and Texas every time — they are large, and
   they move, and it changes nothing, because they were never in doubt. What a
   campaign needs to see is the swing weighted by whether the state is close
   enough for a swing to decide it. Anything that flips goes to the top. */
function stateMovers(before, after, n) {
  const rows = [];
  for (const abbr in after) {
    const d = (after[abbr] - before[abbr]) * 100;
    if (Math.abs(d) < 0.05) continue;
    const ev = STATE_BY_ABBR[abbr].ev;
    const flipped = (after[abbr] > 0) !== (before[abbr] > 0);
    const closest = Math.min(Math.abs(after[abbr]), Math.abs(before[abbr])) * 100;
    const near = Math.exp(-Math.pow(closest / 7, 2));
    rows.push({ abbr, d, ev, flipped, score: Math.abs(d) * ev * (0.06 + near) + (flipped ? 1e5 : 0) });
  }
  rows.sort((a, b) => b.score - a.score);
  return rows.slice(0, n || 5);
}

/* Blocs whose support moved, ranked by how many actual votes that is worth —
   a four-point swing among seniors is not a four-point swing among a bloc a
   third their size, and ranking on the raw percentage says it is. */
function blocMovers(before, after, ctx, n) {
  const rows = [];
  for (const b of BLOCS) {
    const d = (after[b.id] - before[b.id]) * 100;
    if (Math.abs(d) < 0.05) continue;
    rows.push({ id: b.id, name: b.name, d, weight: ctx.natW[b.id] });
  }
  rows.sort((a, b) => Math.abs(b.d) * b.weight - Math.abs(a.d) * a.weight);
  return rows.slice(0, n || 4);
}

/* A plain-language read on a stance, which is the part a table of deltas
   cannot say: the two electorates frequently want opposite things, and that
   conflict is the whole game rather than an error to be resolved. */
function stanceVerdict(o) {
  if (o.current) return { tone: 'cur', text: 'Your current position.' };
  const p = o.dPrim, g = o.dTip;
  const strongP = Math.abs(p) > 0.6, strongG = Math.abs(g) > 0.25;
  if (!strongP && !strongG) return { tone: 'flat', text: 'Moves almost nothing either way.' };
  if (p > 0 && g > 0) return { tone: 'good', text: 'Free money — helps you in both rooms.' };
  if (p < 0 && g < 0) return { tone: 'bad', text: 'Costs you with the party and the country at once.' };
  if (p > 0 && g < 0) return { tone: 'trade', text: 'Wins the nomination, loses ground in November.' };
  return { tone: 'trade', text: 'Sells well in November. Your own side will not like it.' };
}

/* ==========================================================================
   EFFECTS
   Event choices carry an effects object. Showing the player what a choice
   does means every key displayed has to be a key the engine actually reads —
   otherwise the interface is advertising consequences that never arrive.
   `applied` is that guarantee: it is set only for keys with a live handler.
   ========================================================================== */
const EFFECT_META = {
  momentum:  { label: 'Momentum',       good: 1,  applied: 'campaign' },
  money:     { label: 'Cash',           good: 1,  applied: 'campaign', unit: 'M' },
  base:      { label: 'Base morale',    good: 1,  applied: 'both' },
  suburb:    { label: 'Suburbs',        good: 1,  applied: 'campaign' },
  negatives: { label: 'Your negatives', good: -1, applied: 'campaign' },
  authenticity: { label: 'Authenticity', good: 1, applied: 'campaign' },
  discipline:{ label: 'Message discipline', good: 1, applied: 'campaign' },
  coherence: { label: 'Message discipline', good: 1, applied: 'campaign' },
  media:     { label: 'Earned media',   good: 1,  applied: 'campaign' },
  debt:      { label: 'Favors owed',    good: -1, applied: 'campaign' },
  leak:      { label: 'Leak risk',      good: -1, applied: 'campaign' },
  approval:  { label: 'Approval',       good: 1,  applied: 'gov' },
  capital:   { label: 'Political capital', good: 1, applied: 'gov' },
  econ:      { label: 'Economy',        good: 1,  applied: 'gov' },
  deficit:   { label: 'Deficit',        good: -1, applied: 'gov', unit: 'B' },
  oppEnergy: { label: 'Opposition energy', good: -1, applied: 'gov' },
  bipartisan:{ label: 'Cross-aisle goodwill', good: 1, applied: 'gov' },
  hawks:     { label: 'Security voters', good: 1, applied: 'gov' },
  loyalty:   { label: 'Caucus loyalty', good: 1,  applied: 'gov' },
  courtRisk: { label: 'Damage to institutions', good: -1, applied: 'gov' },
  policyStrength: { label: 'Strength of everything enacted', good: 1, applied: 'gov' }
};

/* Turn an effects object into readable, signed consequences. */
function effectSummary(eff, scope) {
  const out = [];
  for (const k in eff) {
    // `coherence` means two different things in the two acts: message
    // discipline on the trail, and a norm bent in office, where the engine
    // converts any negative value into a point of institutional damage.
    // Displaying it as the campaign meaning would hide the real consequence.
    if (k === 'coherence' && scope === 'gov') {
      if (eff[k] < 0) out.push({ key: k, label: 'Damage to the institutions', value: 1, unit: '', good: false });
      continue;
    }
    const m = EFFECT_META[k];
    if (!m) continue;
    if (m.applied !== 'both' && m.applied !== scope) continue;
    const v = eff[k];
    if (!v) continue;
    out.push({
      key: k, label: m.label, value: v, unit: m.unit || '',
      good: v * m.good > 0
    });
  }
  return out;
}

/* ==========================================================================
   CAMPAIGN ACTIONS — the general election
   What one more ad buy is actually worth in the state you are standing in,
   which is the only honest way to decide whether to make it.
   ========================================================================== */
function campaignActionPreview(action, abbr) {
  const gn = G.general, p = G.player;
  const eff = gn.efforts[abbr];
  const before = Object.assign({}, eff);
  const base = stateResult(STATE_BY_ABBR[abbr], p, G.opp, G.env, eff).margin;

  const comp = p.perk === 'executive' ? 1.1 : 1;
  const add = { persuade: 0, ground: 0, digital: 0 };
  switch (action.id) {
    case 'ads':      add.persuade = 20 * comp; break;
    case 'digital':  add.digital = 16 * comp; break;
    case 'ground':   add.ground = 15 * comp; break;
    case 'rally':    add.persuade = 7; break;
    case 'retail':   add.persuade = 24; add.ground = 6; break;
    case 'surrogate':add.persuade = 9; add.ground = 4; break;
    case 'oppo':     add.persuade = 13; break;
    case 'money':    return { pts: 0, note: 'Raises cash. Moves no votes by itself.' };
  }
  if (p.perk === 'media' && action.cost > 0) add.persuade += 5;

  for (const k in add) eff[k] += add[k];
  const after = stateResult(STATE_BY_ABBR[abbr], p, G.opp, G.env, eff).margin;
  Object.assign(eff, before);

  const pts = (after - base) * 100;
  return {
    pts,
    perDollar: action.cost ? pts / action.cost : null,
    note: null
  };
}

/* ==========================================================================
   STATES
   ========================================================================== */
const REGIONS = [
  { id: 'ne', name: 'The Northeast', states: ['ME','NH','VT','MA','RI','CT','NY','NJ','PA','DE','MD','DC'] },
  { id: 'mw', name: 'The Midwest',   states: ['OH','MI','WI','MN','IA','IL','IN','MO'] },
  { id: 'pl', name: 'Plains & Mountain West', states: ['ND','SD','NE','KS','MT','WY','ID','UT','CO'] },
  { id: 'so', name: 'The South',     states: ['VA','WV','NC','SC','GA','FL','AL','MS','TN','KY','AR','LA','OK','TX'] },
  { id: 'we', name: 'The West',      states: ['AZ','NM','NV','CA','OR','WA','HI','AK'] }
];
const REGION_OF = {};
REGIONS.forEach(r => r.states.forEach(a => REGION_OF[a] = r));

/* How far a state moves when the whole country moves a point. Competitive,
   weakly-sorted states swing hard; states where every bloc has already made
   up its mind barely register a national wave. Measured rather than assumed:
   nudge the candidate uniformly and see who actually moves. */
function stateElasticities(player, opp, env, efforts) {
  const orig = player.bonusU || 0;
  const a = projectElection(player, opp, env, efforts);
  player.bonusU = orig + 0.12;
  refreshCandidate(player);
  const b = projectElection(player, opp, env, efforts);
  player.bonusU = orig;
  refreshCandidate(player);

  const mA = {}, mB = {};
  a.states.forEach(s => mA[s.abbr] = s.margin);
  b.states.forEach(s => mB[s.abbr] = s.margin);
  const nat = (b.popular - a.popular) * 2;   // national two-party margin shift

  const out = {};
  for (const abbr in mA) out[abbr] = nat ? (mB[abbr] - mA[abbr]) / nat : 1;
  return out;
}

/* Everything worth knowing about one state, assembled for the dossier. */
function stateProfile(abbr, player, opp, env, efforts, elasticity) {
  const st = STATE_BY_ABBR[abbr];
  const eff = (efforts && efforts[abbr]) || { persuade: 0, ground: 0, digital: 0 };
  const r = stateResult(st, player, opp, env, eff);

  // The same state contested by two generic nominees: the baseline your
  // platform and your campaign are being measured against.
  const gP = GENERIC[player.partyId], gO = GENERIC[player.partyId === 'D' ? 'R' : 'D'];
  const baseline = stateResult(st, gP, gO, env, null).margin;

  // Each bloc's net contribution to your margin here.
  let total = 0;
  for (const id in r.blocDetail) total += r.blocDetail[id].vP + r.blocDetail[id].vO;
  const blocs = BLOCS.map(b => {
    const d = r.blocDetail[b.id];
    if (!d) return null;
    return {
      id: b.id, name: b.name,
      share: d.share,
      size: (d.pool) / Object.values(r.blocDetail).reduce((a, x) => a + x.pool, 0),
      net: total ? (d.vP - d.vO) / total : 0
    };
  }).filter(Boolean).sort((a, b) => b.net - a.net);

  // What one more broadcast buy would be worth here.
  const before = Object.assign({}, eff);
  eff.persuade += 20;
  const withAd = stateResult(st, player, opp, env, eff).margin;
  Object.assign(eff, before);

  return {
    st, region: REGION_OF[abbr],
    margin: r.margin * 100,
    baseline: baseline * 100,
    swing: (r.margin - baseline) * 100,
    elasticity: elasticity ? elasticity[abbr] : null,
    blocs,
    spent: Math.round(eff.persuade + eff.ground + eff.digital),
    adValue: (withAd - r.margin) * 100,
    demo: st
  };
}

/* Regional totals for the general-election board. */
function regionSummary(states, playerParty) {
  const byAbbr = {};
  states.forEach(s => byAbbr[s.abbr] = s);
  return REGIONS.map(reg => {
    let evP = 0, evO = 0, wm = 0, w = 0, close = 0;
    for (const a of reg.states) {
      const s = byAbbr[a]; if (!s) continue;
      if (s.won) evP += s.ev; else evO += s.ev;
      wm += s.margin * s.ev; w += s.ev;
      if (Math.abs(s.margin) < 0.05) close++;
    }
    return { reg, evP, evO, margin: w ? (wm / w) * 100 : 0, close };
  });
}

/* ==========================================================================
   OPPONENTS
   ========================================================================== */

/* Issue by issue, which of you is standing closer to the country. This is the
   raw material of an attack ad in either direction: the emphasis multiplier
   uses whichever candidate is pushing the issue hardest, because an issue one
   side is running on is an issue both sides end up answering for. */
function issueContrast(player, opp, weights, shift) {
  const sh = shift || 0;
  return ISSUES.map((iss, k) => {
    const iid = iss.id;
    const mine = player.platform.positions[iid], theirs = opp.platform.positions[iid];
    const emph = 1 + 1.35 * Math.max(player.platform.salience[iid] || 0, opp.platform.salience[iid] || 0);
    let edge = 0;
    for (const b of BLOCS) {
      const w = (weights[b.id] || 0) * b.weight[k] * emph;
      const ideal = b.ideal[k] + sh;
      edge += w * (Math.abs(theirs - ideal) - Math.abs(mine - ideal)) * 0.62;
    }
    return {
      issue: iss, mine, theirs, edge: edge * 100,
      mineLabel: STANCES[iid].find(s => s.p === mine).label,
      theirLabel: STANCES[iid].find(s => s.p === theirs).label,
      yourSignature: (player.platform.salience[iid] || 0) > 0,
      theirSignature: (opp.platform.salience[iid] || 0) > 0
    };
  });
}

/* A full read on one opponent: where they beat you, where you beat them, who
   their coalition is, and what they are going to spend the fall saying. */
function opponentDossier(player, opp, opts) {
  opts = opts || {};
  const weights = opts.primary ? primaryElectorate(player.partyId) : nationalWeights();
  const shift = opts.primary ? PRIMARY_SHIFT * player.party.dir : 0;
  const contrast = issueContrast(player, opp, weights, shift).sort((a, b) => a.edge - b.edge);

  const uP = opts.primary ? player.uMapPrim : player.uMap;
  const uO = opts.primary ? opp.uMapPrim : opp.uMap;
  const blocs = BLOCS.map(b => ({
    id: b.id, name: b.name, weight: weights[b.id] || 0,
    share: logistic((uP[b.id] - uO[b.id]) * 1.25)
  })).sort((a, b) => b.weight - a.weight);

  let overall = 0;
  for (const b of BLOCS) overall += (weights[b.id] || 0) * (uP[b.id] - uO[b.id]);

  return {
    opp, contrast, blocs, overall: overall * 100,
    theirBest: contrast.slice(0, 3).filter(c => c.edge < -0.15),
    yourBest: contrast.slice().reverse().slice(0, 3).filter(c => c.edge > 0.15),
    center: platformCenter(opp.platform),
    spread: platformSpread(opp.platform)
  };
}

/* ==========================================================================
   BILLS
   What each provision is worth in votes — the number the whip board is
   actually for, and the one the player was previously left to infer from a
   position figure and a price tag.
   ========================================================================== */
function provisionImpact(bill, selected, ctx, reconciliation) {
  const effective = list => reconciliation ? applyByrd(bill, list).kept : list;
  const baseCount = whipCount(bill, effective(selected), ctx);
  const out = {};
  for (const pv of bill.provisions) {
    const on = selected.includes(pv.id);
    const alt = on ? selected.filter(x => x !== pv.id) : selected.concat([pv.id]);
    const wc = whipCount(bill, effective(alt), ctx);
    out[pv.id] = {
      on,
      dHouse: (on ? baseCount.houseYes - wc.houseYes : wc.houseYes - baseCount.houseYes),
      dSenate: (on ? baseCount.senateYes - wc.senateYes : wc.senateYes - baseCount.senateYes),
      caucus: caucusMovers(bill, effective(selected), effective(alt), ctx, on)
    };
  }
  return out;
}

/* Which caucus a provision is actually buying or losing. */
function caucusMovers(bill, before, after, ctx, on) {
  const rows = [];
  for (const c of CAUCUSES) {
    const a = logistic(caucusUtility(c, bill, before, ctx) * 1.35);
    const b = logistic(caucusUtility(c, bill, after, ctx) * 1.35);
    const d = (on ? a - b : b - a) * 100;
    if (Math.abs(d) >= 1) rows.push({ id: c.id, name: c.name, d });
  }
  return rows.sort((x, y) => Math.abs(y.d) - Math.abs(x.d)).slice(0, 2);
}

/* What a deal with this caucus would buy, before you pay for it. */
function dealImpact(caucus, bill, effective, ctx) {
  const boost = 1.25 * (1 + (G.player.traits.legislative - 50) / 160);
  const before = whipCount(bill, effective, ctx);
  const ctx2 = Object.assign({}, ctx, {
    boosts: Object.assign({}, ctx.boosts, { [caucus.id]: (ctx.boosts[caucus.id] || 0) + boost })
  });
  const after = whipCount(bill, effective, ctx2);
  return {
    dHouse: after.houseYes - before.houseYes,
    dSenate: after.senateYes - before.senateYes
  };
}

/* ==========================================================================
   GOVERNING ACTIONS
   ========================================================================== */
function govActionPreview(a, g, p) {
  const comp = (g.perk === 'executive' ? 1.15 : 1) * (1 + (g.competence || 0) * 0.05);
  const enjoin = Math.round(Math.max(0.10, 0.42 - (g.judiciary || 0) * 0.07) * 100);
  switch (a.id) {
    case 'bill':   return [{ label: 'Opens the drafting table', value: null }];
    case 'exec':   return [
      { label: 'Enacts', value: Math.round(55 * comp) + '% of the promise', raw: true, good: true },
      { label: 'Base morale', value: 4, good: true },
      { label: 'Opposition energy', value: 5, good: false },
      { label: 'Struck down', value: enjoin + '% chance', raw: true, good: false }];
    case 'reg':    return [
      { label: 'Enacts', value: Math.round(75 * comp) + '% of the promise', raw: true, good: true },
      { label: 'Survives a change of president', value: 'yes', raw: true, good: true },
      { label: 'Vacated on procedure', value: Math.max(4, 16 - (g.judiciary || 0) * 3) + '% chance', raw: true, good: false }];
    case 'judges': return [
      { label: 'Every later order struck down', value: '−7pp', raw: true, good: true },
      { label: 'Base morale', value: 2, good: true },
      { label: 'Opposition energy', value: 3, good: false }];
    case 'clemency': return [
      { label: 'Federal prison population', value: 'about −1.5K', raw: true, good: true },
      { label: 'Base morale', value: 3, good: true },
      { label: 'Approval', value: -1.2, good: false }];
    case 'pulpit': return [
      { label: 'Approval', value: +(2.6 * comp + (p.traits.charisma - 50) / 22).toFixed(1), good: true },
      { label: 'Pressure on exposed members', value: 'next bill', raw: true, good: true }];
    case 'negotiate': return [
      { label: 'Cross-aisle goodwill', value: Math.round(7 + (p.traits.legislative - 50) / 12), good: true },
      { label: 'Base morale', value: -1.5, good: false }];
    case 'cabinet': return [
      { label: 'Every executive action', value: '+5% stronger', raw: true, good: true },
      { label: 'Political capital', value: -2, good: false }];
    case 'party':  return [
      { label: 'Base morale', value: 3, good: true },
      { label: 'Midterm seats', value: '+4 per quarter spent', raw: true, good: true }];
    case 'summit': return [
      { label: 'Approval', value: 1.8, good: true },
      { label: 'Cross-aisle goodwill', value: 5, good: true },
      { label: 'Gravitas', value: 2, good: true }];
    case 'hold':   return [
      { label: 'Political capital', value: 12, good: true }];
    case 'fundraise': return [
      { label: 'Campaign cash', value: '+' + Math.max(10, Math.round(45 + (p.traits.money - 50) * 1.2
          + (g.baseMorale - 50) * 0.9 + (g.approval - 45) * 1.1)) + 'M', raw: true, good: true }];
    case 'travel': return [
      { label: 'Margin in the target state', value: '+0.6 pts', raw: true, good: true },
      { label: 'Approval', value: 0.4, good: true }];
    case 'campaign': return [
      { label: 'Margin in the target state', value: '+1.7 pts', raw: true, good: true },
      { label: 'Campaign cash', value: '−30M', raw: true, good: false }];
  }
  return [];
}
