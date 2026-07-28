/* ==========================================================================
   MANDATE — game flow and screens
   ========================================================================== */

const G = {
  screen: 'title',
  seed: 0,
  player: null,
  opp: null,
  env: null,
  primary: null,
  general: null,
  gov: null,
  log: []
};

const $app = () => document.getElementById('screen');

function logMsg(text, cls, when) {
  G.log.unshift({ text, cls: cls || '', when: when || '' });
  if (G.log.length > 220) G.log.pop();
}

function render() {
  renderTopbar();
  const el = $app();
  el.innerHTML = '';
  ({
    title: scrTitle, setup: scrSetup, platform: scrPlatform, primary: scrPrimary,
    general: scrGeneral, night: scrNight, govern: scrGovern,
    bill: scrBill, final: scrFinal
  })[G.screen](el);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ==========================================================================
   TOPBAR
   ========================================================================== */
function renderTopbar() {
  const bar = document.getElementById('stats');
  const p = G.player;
  if (!p || G.screen === 'title' || G.screen === 'setup') { bar.innerHTML = ''; return; }
  let out = '';
  if (G.screen === 'platform') {
    const cost = platformCost(p.platform);
    out += statBlock('Party', p.party.name.slice(0, 3).toUpperCase());
    out += statBlock('Sig. Issues', `${p.platform.signature.length}/3`, p.platform.signature.length === 3 ? 'good' : 'warn');
    out += statBlock('Fiscal Impact', bn(cost), cost > 400 ? 'bad' : cost > 0 ? 'warn' : 'good');
    out += statBlock('Coherence', platformSpread(p.platform).toFixed(2), platformSpread(p.platform) > 1.3 ? 'warn' : 'good');
  } else if (G.screen === 'primary') {
    const pr = G.primary;
    out += statBlock('Contest', `${pr.index + 1}/${PRIMARY_CALENDAR.length}`);
    out += statBlock('Delegates', pr.delegates[p.id] || 0);
    out += statBlock('War Chest', money(pr.funds), pr.funds < 25 ? 'bad' : '');
    out += statBlock('Moves Left', pr.moves, pr.moves ? '' : 'warn');
    out += statBlock('Momentum', sgn(pr.momentum, 0), pr.momentum > 0 ? 'good' : pr.momentum < 0 ? 'bad' : '');
  } else if (G.screen === 'general' || G.screen === 'night') {
    const gn = G.general;
    out += statBlock('Week', `${gn.week}/10`);
    out += statBlock('Days', gn.days, gn.days ? '' : 'warn');
    out += statBlock('Cash', money(gn.money), gn.money < 30 ? 'bad' : '');
    out += statBlock('Base', Math.round(p.baseMorale), p.baseMorale < 45 ? 'bad' : p.baseMorale > 62 ? 'good' : '');
    out += statBlock('Proj. EV', gn.proj ? gn.proj.evP : '—', gn.proj && gn.proj.evP >= 270 ? 'good' : 'bad');
  } else if ((G.screen === 'govern' || G.screen === 'bill') && G.gov && G.gov.congress) {
    const g = G.gov;
    out += statBlock('Quarter', `${g.quarter}/16`);
    out += statBlock('Approval', Math.round(g.approval), g.approval >= 50 ? 'good' : g.approval < 42 ? 'bad' : 'warn');
    out += statBlock('Capital', Math.round(g.capital), g.capital >= 25 ? 'good' : g.capital < 10 ? 'bad' : '');
    out += statBlock('House', `${g.congress.house.P}–${g.congress.house.O}`, g.congress.house.P >= 218 ? 'good' : 'bad');
    out += statBlock('Senate', `${g.congress.senate.P}–${g.congress.senate.O}`, g.congress.senate.P >= 50 ? 'good' : 'bad');
    out += statBlock('Base', Math.round(g.baseMorale), g.baseMorale < 45 ? 'bad' : g.baseMorale > 62 ? 'good' : '');
    out += statBlock('Economy', sgn(g.econ, 1), g.econ > 0.3 ? 'good' : g.econ < -0.3 ? 'bad' : '');
  }
  bar.innerHTML = out;
}

/* ==========================================================================
   1. TITLE
   ========================================================================== */
function scrTitle(el) {
  el.appendChild(h(`
    <div class="title-screen fade-in">
      <h1>Mandate</h1>
      <div class="tag">Craft a platform · Win a nomination · Take 270 · Then govern</div>
      <div class="blurb">
        Anyone can promise. The question this game asks is what you are prepared to
        trade — a plank for a primary, a province for a general, a provision for a
        vote — and whether what survives the Senate is still worth having signed.
      </div>
      <div class="btn-row" style="justify-content:center;margin-top:30px">
        <button class="btn primary" id="start">Announce Your Candidacy</button>
      </div>
      <div class="muted tiny" style="margin-top:26px;max-width:560px;margin-left:auto;margin-right:auto;line-height:1.7">
        Four acts: the platform, the primary, the general election, and the presidency.
        Everything you choose in act one is a liability or an asset in act four.
      </div>
    </div>`));
  el.querySelector('#start').onclick = () => { G.screen = 'setup'; render(); };
}

/* ==========================================================================
   2. SETUP
   ========================================================================== */
let _setup = { party: 'D', bg: 'gov', name: '' };

function scrSetup(el) {
  el.appendChild(h(`
    <div class="fade-in">
      <div class="panel">
        <div class="panel-head"><h2>Act I · The Announcement</h2>
          <span class="sub">Who is running, and under whose banner</span></div>
        <div class="split-wide">
          <div>
            <div class="field"><label>Candidate Name</label>
              <input type="text" id="cname" placeholder="e.g. Eleanor Vance" value="${esc(_setup.name)}"></div>
            <div class="field"><label>Party</label>
              <div class="card-grid" id="parties"></div></div>
            <div class="field"><label>Random Seed <span class="muted">(same seed, same world)</span></label>
              <input type="text" id="seed" value="${G.seed || ''}" placeholder="leave blank for random"></div>
          </div>
          <div>
            <div class="field"><label>Background</label>
              <div class="card-grid" id="bgs"></div></div>
          </div>
        </div>
        <div class="btn-row" style="margin-top:16px">
          <button class="btn ghost" id="back">Back</button>
          <button class="btn primary" id="next">Draft the Platform →</button>
        </div>
      </div>
    </div>`));

  const pw = el.querySelector('#parties');
  for (const id of ['D', 'R']) {
    const p = PARTIES[id];
    const c = h(`<div class="card ${_setup.party === id ? 'sel' : ''}" data-p="${id}">
      <h4 style="color:${p.color}">${p.name} Party</h4>
      <div class="desc">${id === 'D'
        ? 'A coalition of cities, colleges, unions, and non-white voters that agrees on almost nothing except who it is against.'
        : 'A coalition of the countryside, the churches, and the small-business class, currently arguing about how much of the old orthodoxy survives.'}</div></div>`);
    c.onclick = () => { _setup.party = id; render(); };
    pw.appendChild(c);
  }

  const bw = el.querySelector('#bgs');
  for (const b of BACKGROUNDS) {
    const c = h(`<div class="card ${_setup.bg === b.id ? 'sel' : ''}">
      <h4>${esc(b.name)}</h4>
      <div class="desc">${esc(b.desc)}</div>
      <div class="trait-row">
        ${Object.entries(b.traits).map(([k, v]) => `<span class="trait">${k.slice(0, 4).toUpperCase()} ${v}</span>`).join('')}
      </div>
      <div class="perk">◆ ${esc(PERK_TEXT[b.perk])}</div></div>`);
    c.onclick = () => { _setup.bg = b.id; render(); };
    bw.appendChild(c);
  }

  el.querySelector('#cname').oninput = e => _setup.name = e.target.value;
  el.querySelector('#back').onclick = () => { G.screen = 'title'; render(); };
  el.querySelector('#next').onclick = () => {
    const seedIn = el.querySelector('#seed').value.trim();
    G.seed = seedIn ? hashSeed(seedIn) : Math.floor(Math.random() * 2 ** 31);
    setSeed(G.seed);
    applyCycleDrift();
    startCampaign();
  };
}

function hashSeed(s) {
  let x = 2166136261;
  for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); }
  return x >>> 0;
}

function startCampaign() {
  const bg = BACKGROUNDS.find(b => b.id === _setup.bg);
  const party = PARTIES[_setup.party];
  G.player = {
    id: 'player',
    name: (_setup.name || 'Your Candidate').trim(),
    party, partyId: party.id,
    background: bg, perk: bg.perk,
    traits: Object.assign({}, bg.traits),
    platform: seedPlatform(party),
    baseMorale: 55,
    bonusU: 0,
    veep: null
  };
  refreshCandidate(G.player);
  G.screen = 'platform';
  render();
}

/* Start the player somewhere plausible for their party rather than at zero. */
function seedPlatform(party) {
  const p = emptyPlatform();
  for (const id of ISSUE_IDS) p.positions[id] = party.dir < 0 ? -1 : 1;
  return p;
}

/* ==========================================================================
   3. PLATFORM
   ========================================================================== */
function scrPlatform(el) {
  const p = G.player;
  const primW = primaryElectorate(p.partyId);
  const genOpp = genericOpponent(p.partyId === 'D' ? 'R' : 'D');

  el.appendChild(h(`<div class="fade-in">
    <div class="callout">
      <b>The central tension.</b> The primary electorate is not the country. Every
      plank is scored twice below — once against the people who pick your nominee,
      once against the people who pick your president. Three <span class="pill gold">signature</span>
      issues get 2.35× weight with voters, and become the promises you are judged on in office.
    </div>
    <div class="split">
      <div class="panel" style="padding-top:0">
        <div class="panel-head"><h2>The Platform</h2><span class="sub">Twelve axes, five stances each</span></div>
        <div id="issues"></div>
      </div>
      <div class="rail">
        <div class="panel">
          <div class="panel-head"><h2>Primary Electorate</h2><span class="sub">who nominates you</span></div>
          <div id="primBars"></div>
          <div class="kpi" style="margin-top:12px;border-top:1px solid var(--line);padding-top:11px">
            <div><span class="k">Primary Score</span><span class="v" id="primScore">—</span></div>
            <div><span class="k">Base Morale</span><span class="v" id="baseM">—</span></div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>General Electorate</h2><span class="sub">vs. a generic opponent</span></div>
          <div id="genBars"></div>
          <div id="evbar" style="margin-top:12px"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Interest Groups</h2><span class="sub">who funds the ads</span></div>
          <div id="groups" class="small"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>The Books</h2></div>
          <div id="books" class="small"></div>
          <div class="btn-row" style="margin-top:14px">
            <button class="btn primary" id="lock" style="width:100%">Lock the Platform · Enter the Primary →</button>
          </div>
          <div class="tiny muted" style="margin-top:8px">You may not change your positions again until you are in office — and then only by passing something.</div>
        </div>
      </div>
    </div></div>`));

  const iw = el.querySelector('#issues');
  ISSUES.forEach((iss, k) => {
    const cur = p.platform.positions[iss.id];
    const isSig = p.platform.signature.includes(iss.id);
    const row = h(`<div class="issue">
      <div class="issue-head">
        <h4>${esc(iss.name)}</h4>
        <span class="axis">${esc(iss.axis)}</span>
        <span class="spacer"></span>
        <button class="sig-btn ${isSig ? 'on' : ''}" data-sig="${iss.id}">${isSig ? '◆ signature' : 'make signature'}</button>
      </div>
      <div class="stance-row">
        ${STANCES[iss.id].map(s => `
          <div class="stance ${s.p === cur ? 'sel' : ''}" data-i="${iss.id}" data-p="${s.p}">
            <span class="pos">${sgn(s.p, 0)}</span>
            <div class="lbl">${esc(s.label)}</div>
            <div class="cost">${s.cost === 0 ? '—' : bn(s.cost) + '/yr'}</div>
            <div class="blurb">${esc(s.blurb)}</div>
          </div>`).join('')}
      </div></div>`);
    iw.appendChild(row);
  });

  iw.querySelectorAll('.stance').forEach(s => {
    s.onclick = () => {
      p.platform.positions[s.dataset.i] = parseInt(s.dataset.p, 10);
      refreshCandidate(p);
      render();
    };
  });
  iw.querySelectorAll('.sig-btn').forEach(b => {
    b.onclick = () => {
      const id = b.dataset.sig, sig = p.platform.signature;
      const at = sig.indexOf(id);
      if (at >= 0) { sig.splice(at, 1); p.platform.salience[id] = 0; }
      else if (sig.length < 3) { sig.push(id); p.platform.salience[id] = 1; }
      refreshCandidate(p);
      render();
    };
  });

  // --- readouts ---
  const primRival = archetypeCandidate(p.partyId, RIVAL_ARCHETYPES[p.partyId][0]);
  renderBlocBars(el.querySelector('#primBars'), p, primRival, primW);
  renderBlocBars(el.querySelector('#genBars'), p, genOpp, nationalWeights());

  let primScore = 0;
  for (const b of BLOCS) primScore += primW[b.id] * (p.uMap[b.id] - primRival.uMap[b.id]);
  el.querySelector('#primScore').textContent = sgn(primScore * 10, 0);
  el.querySelector('#primScore').style.color = primScore > 0 ? 'var(--green)' : 'var(--red)';

  const morale = baseMoraleFromPlatform(p);
  p.baseMorale = morale;
  el.querySelector('#baseM').textContent = Math.round(morale);
  el.querySelector('#baseM').style.color = morale > 60 ? 'var(--green)' : morale < 45 ? 'var(--red)' : 'var(--amber)';

  const env = { incumbentParty: p.partyId === 'D' ? 'R' : 'D', incumbentPenalty: 0.10 };
  const proj = projectElection(p, genOpp, env, {});
  renderEvBar(el.querySelector('#evbar'), proj.evP, proj.evO, p.partyId);

  // interest groups
  const gEl = el.querySelector('#groups');
  const gscores = GROUPS.map(g => {
    let s = 0, w = 0;
    ISSUE_IDS.forEach((iid, k) => {
      const c = g.care[k]; if (c < 0.05) return;
      s += c * (1.1 - Math.abs(p.platform.positions[iid] - g.ideal[k]) * 0.62); w += c;
    });
    return { g, s: s / Math.max(0.001, w) };
  }).sort((a, b) => b.s - a.s);
  gEl.innerHTML = gscores.map(x => `<div style="display:flex;justify-content:space-between;padding:3px 0">
      <span class="dim">${esc(x.g.name)}</span>
      <span class="mono" style="color:${x.s > 0.25 ? 'var(--green)' : x.s < -0.25 ? 'var(--red)' : 'var(--text-mute)'}">${
        x.s > 0.6 ? 'ALLY' : x.s > 0.2 ? 'friendly' : x.s > -0.2 ? 'neutral' : x.s > -0.6 ? 'opposed' : 'HOSTILE'}</span></div>`).join('');

  // books
  const cost = platformCost(p.platform);
  const spread = platformSpread(p.platform);
  el.querySelector('#books').innerHTML = `
    <div style="display:flex;justify-content:space-between;padding:3px 0"><span class="dim">Annual fiscal impact</span>
      <span class="mono" style="color:${cost > 400 ? 'var(--red)' : cost > 0 ? 'var(--amber)' : 'var(--green)'}">${bn(cost)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:3px 0"><span class="dim">Ideological center</span>
      <span class="mono">${sgn(platformCenter(p.platform), 2)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:3px 0"><span class="dim">Heterodoxy</span>
      <span class="mono" style="color:${spread > 1.3 ? 'var(--amber)' : 'var(--text)'}">${spread.toFixed(2)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:3px 0"><span class="dim">Electoral college bias</span>
      <span class="mono">${biasLabel()}</span></div>
    <div class="tiny muted" style="margin-top:8px">${spread > 1.3
      ? 'A heterodox platform. Cross-pressured voters find it refreshing; everyone else finds it confusing, and the press will call it incoherent.'
      : spread < 0.7 ? 'A tightly disciplined platform. Easy to explain, easy to attack as ideological.'
      : 'A conventional spread of positions.'}</div>`;

  el.querySelector('#lock').onclick = () => {
    if (p.platform.signature.length < 3) {
      showModal({ title: 'Pick Three Signature Issues', kicker: 'The Message',
        text: 'A campaign that emphasizes everything emphasizes nothing. Choose the three issues you will actually run on.',
        choices: [{ label: 'Go back to the platform' }] });
      return;
    }
    beginPrimary();
  };
}

/* This cycle's college bias and national environment, in plain language. */
function biasLabel() {
  const b = CYCLE_BIAS;
  if (Math.abs(b) < 0.4) return 'neutral';
  return (b > 0 ? 'R+' : 'D+') + Math.abs(b).toFixed(1);
}
function envLabel() {
  if (!G.env) return '—';
  const e = G.env.incumbentPenalty;
  const who = G.env.incumbentParty === G.player.partyId ? 'you' : 'them';
  if (Math.abs(e) < 0.05) return 'neutral';
  const mag = Math.abs(e) > 0.22 ? 'strong' : 'mild';
  return e > 0 ? `${mag} anti-incumbent (helps ${who === 'you' ? 'them' : 'you'})`
               : `${mag} pro-incumbent (helps ${who})`;
}

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

/* ==========================================================================
   OPPONENT CONSTRUCTION
   ========================================================================== */
function archetypeCandidate(partyId, arch) {
  const pf = emptyPlatform();
  for (const id of ISSUE_IDS) {
    let v = arch.tilt + gauss(0, 0.45);
    if (arch.lane === 'libertarian' && (id === 'defense' || id === 'social' || id === 'crime')) v -= 1.6;
    if (arch.lane === 'labor' && (id === 'trade')) v += 2.0;
    if (arch.lane === 'labor' && (id === 'immig')) v += 0.7;
    if (arch.lane === 'religious' && (id === 'social')) v += 1.0;
    if (arch.lane === 'moderate' && (id === 'health' || id === 'taxes')) v += 0.5 * PARTIES[partyId].dir;
    pf.positions[id] = clamp(Math.round(v), -2, 2);
  }
  const sig = [ISSUE_IDS[Math.floor(rnd() * 12)], ISSUE_IDS[Math.floor(rnd() * 12)]];
  sig.forEach(i => { if (!pf.signature.includes(i)) { pf.signature.push(i); pf.salience[i] = 1; } });
  return makeCandidate({
    id: arch.name, name: arch.name, partyId, platform: pf, blurb: arch.blurb,
    funds: arch.funds, lane: arch.lane, organization: 20 + rnd() * 25, momentum: 0,
    traits: Object.assign({ discipline: 55, money: 55, legislative: 55 }, arch.traits)
  });
}

/* ==========================================================================
   4. PRIMARY
   ========================================================================== */
const PRIMARY_MOVES = [
  { id: 'ads',    name: 'Broadcast & Cable Buy', cost: 20, tip: 'Raw persuasion at scale. The only tool that works in a fourteen-state night.' },
  { id: 'ground', name: 'Build Field Operation', cost: 12, tip: 'Permanent organization. Enormous in caucus and single states, useful everywhere after.' },
  { id: 'retail', name: 'Live in the State',     cost: 3,  tip: 'Two hundred town halls. Devastating in one state, invisible in fourteen.' },
  { id: 'money',  name: 'Call Time & Finance Events', cost: 0, tip: 'Raise cash. Costs you a move and the base notices where the money comes from.' },
  { id: 'contrast', name: 'Draw a Contrast',     cost: 8,  tip: 'Attack the leader directly. Effective, and it raises your own negatives.' },
  { id: 'debate', name: 'Debate Prep',           cost: 2,  tip: 'Momentum, plus insurance against the next bad news cycle.' }
];

function beginPrimary() {
  const p = G.player;
  const archs = RIVAL_ARCHETYPES[p.partyId];
  const field = archs.map(a => archetypeCandidate(p.partyId, a));
  const startFunds = 55 + (p.traits.money - 50) * 1.4 + (p.perk === 'selffund' ? 180 : 0);

  G.primary = {
    index: 0, moves: 3, funds: Math.round(startFunds),
    momentum: 0, organization: 15, spend: 0, negatives: 0,
    delegates: Object.fromEntries([['player', 0], ...field.map(f => [f.id, 0])]),
    field, allocated: 0, results: [], dropped: []
  };
  G.player.id = 'player';
  G.player.organization = 15;
  logMsg(`${p.name} announces for president.`, 'big', 'ANNOUNCEMENT');
  G.screen = 'primary';
  render();
}

function scrPrimary(el) {
  const pr = G.primary, p = G.player;
  const contest = PRIMARY_CALENDAR[pr.index];
  const live = [p, ...pr.field.filter(f => !pr.dropped.includes(f.id))];
  const totalAlloc = Math.max(1, pr.allocated);

  el.appendChild(h(`<div class="fade-in">
    <div class="ticker">▲ ${esc(contest.name)} — ${contest.delegates} delegates — ${esc(contest.note)}</div>
    <div class="split">
      <div>
        <div class="panel">
          <div class="panel-head"><h2>Week ${contest.week} · ${esc(contest.name)}</h2>
            <span class="spacer"></span><span class="sub">${contest.states.join(' · ')}</span></div>
          <div class="grid g2">
            <div>
              <h4 class="small" style="margin-bottom:8px">Spend Your Moves</h4>
              <div id="moves"></div>
            </div>
            <div>
              <h4 class="small" style="margin-bottom:8px">Where the Race Stands</h4>
              <table><thead><tr><th>Candidate</th><th class="num">Poll</th><th class="num">Delegates</th></tr></thead>
                <tbody id="standings"></tbody></table>
              <div class="tiny muted" style="margin-top:9px">Delegates are allocated proportionally with a 15% viability
                threshold. ${Math.round(totalAlloc)} of ${PRIMARY_CALENDAR.reduce((a, c) => a + c.delegates, 0)} allocated so far.</div>
            </div>
          </div>
          <div class="btn-row" style="margin-top:16px;border-top:1px solid var(--line);padding-top:14px">
            <button class="btn primary" id="hold">Hold the ${esc(contest.name.split(' ')[0])} Vote →</button>
            <span class="muted small">${pr.moves} move${pr.moves === 1 ? '' : 's'} remaining · unspent moves are lost</span>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>The Field</h2></div>
          <div id="field" class="grid g2"></div>
        </div>
      </div>
      <div class="rail">
        <div class="panel">
          <div class="panel-head"><h2>Primary Coalition</h2><span class="sub">you vs. the leader</span></div>
          <div id="pbars"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>The Wire</h2></div>
          <div class="log" id="log"></div>
        </div>
      </div>
    </div></div>`));

  // moves
  const mv = el.querySelector('#moves');
  for (const m of PRIMARY_MOVES) {
    const afford = pr.funds >= m.cost && pr.moves > 0;
    const b = h(`<div class="prov ${afford ? '' : 'stripped'}" style="grid-template-columns:1fr 66px">
      <div><div class="nm">${esc(m.name)}</div><div class="note">${esc(m.tip)}</div></div>
      <div class="fig">${m.id === 'money' ? '<span style="color:var(--green)">+cash</span>' : '−' + money(m.cost)}</div></div>`);
    if (afford) b.onclick = () => doPrimaryMove(m);
    mv.appendChild(b);
  }

  // standings
  const polls = primaryPolls(contest, live);
  const sb = el.querySelector('#standings');
  live.map(c => ({ c, poll: polls[c.id === 'player' ? 'player' : c.id], del: pr.delegates[c.id] || 0 }))
    .sort((a, b) => b.del - a.del || b.poll - a.poll)
    .forEach(r => {
      sb.appendChild(h(`<tr>
        <td style="${r.c.id === 'player' ? 'color:var(--gold);font-weight:600' : ''}">${esc(r.c.id === 'player' ? p.name + ' (you)' : r.c.name)}</td>
        <td class="num">${(r.poll * 100).toFixed(0)}%</td>
        <td class="num">${r.del}</td></tr>`));
    });

  const fw = el.querySelector('#field');
  pr.field.forEach(f => {
    const out = pr.dropped.includes(f.id);
    fw.appendChild(h(`<div class="card" style="cursor:default;${out ? 'opacity:.4' : ''}">
      <h4>${esc(f.name)} ${out ? '<span class="pill red">withdrawn</span>' : ''}</h4>
      <div class="desc">${esc(f.blurb)}</div>
      <div class="trait-row">
        <span class="trait">CENTER ${sgn(platformCenter(f.platform), 1)}</span>
        <span class="trait">CASH $${Math.round(f.funds)}M</span>
        <span class="trait">MOM ${sgn(f.momentum, 0)}</span>
      </div></div>`));
  });

  const leader = pr.field.filter(f => !pr.dropped.includes(f.id))
    .sort((a, b) => (pr.delegates[b.id] || 0) - (pr.delegates[a.id] || 0))[0];
  if (leader) renderBlocBars(el.querySelector('#pbars'), p, leader, primaryElectorate(p.partyId));
  renderLog(el.querySelector('#log'));

  el.querySelector('#hold').onclick = () => holdContest();
}

function primaryPolls(contest, live) {
  const pr = G.primary;
  const out = {}; let denom = 0; const exps = {};
  for (const c of live) {
    const w = statePrimaryWeights(STATE_BY_ABBR[contest.states[0]], G.player.partyId);
    let s = 0;
    for (const b of BLOCS) s += w[b.id] * (c.uMapPrim || c.uMap)[b.id];
    s += (c.id === 'player' ? pr.momentum : c.momentum) * 0.10;
    s += Math.log(1 + (c.id === 'player' ? pr.spend : c.funds * 0.25) / 12) * 0.16;
    exps[c.id] = Math.exp(s * 1.55); denom += exps[c.id];
  }
  for (const c of live) out[c.id] = exps[c.id] / denom;
  return out;
}

function doPrimaryMove(m) {
  const pr = G.primary, p = G.player;
  pr.moves--; pr.funds -= m.cost;
  const contest = PRIMARY_CALENDAR[pr.index];
  const single = contest.states.length === 1;
  switch (m.id) {
    case 'ads':      pr.spend += 26; logMsg('Ad buy placed in ' + contest.states.join(', ') + '.', '', 'FILING'); break;
    case 'ground':   pr.organization += 11; logMsg('Field offices open. Organization is now ' + Math.round(pr.organization) + '.', '', 'FIELD'); break;
    case 'retail':   pr.spend += single ? 30 : 5; pr.momentum += single ? 2 : 0;
                     logMsg(single ? 'Twelve county events. Local press is glowing.' : 'Retail politics does not scale to a fourteen-state night.', single ? 'good' : 'bad', 'TRAIL'); break;
    case 'money':    { const raise = Math.round(28 + (p.traits.money - 50) * 0.7 + (p.baseMorale - 50) * (p.perk === 'movement' ? 1.1 : 0.45));
                     pr.funds += raise; logMsg(`Fundraising quarter closes at ${money(raise)}.`, 'good', 'FINANCE'); break; }
    case 'contrast': { pr.spend += 12; pr.negatives += 6;
                     const tgt = pr.field.filter(f => !pr.dropped.includes(f.id)).sort((a, b) => b.momentum - a.momentum)[0];
                     if (tgt) { tgt.momentum -= 5; logMsg(`Contrast ad against ${tgt.name} is running everywhere.`, '', 'PAID MEDIA'); } break; }
    case 'debate':   pr.momentum += 3; logMsg('Three days of debate prep. It shows.', 'good', 'PREP'); break;
  }
  if (p.perk === 'media' && m.cost > 0) { pr.spend += 6; }
  render();
}

async function holdContest() {
  const pr = G.primary, p = G.player;
  const contest = PRIMARY_CALENDAR[pr.index];
  const live = pr.field.filter(f => !pr.dropped.includes(f.id));

  // Rivals spend
  const spendMap = { player: pr.spend };
  for (const f of live) {
    const s = Math.min(f.funds, contest.delegates / 1400 * 210 + 12);
    f.funds -= s; spendMap[f.id] = s * (0.9 + rnd() * 0.4);
  }

  const fieldForSim = [
    { id: 'player', partyId: p.partyId, uMap: p.uMap, uMapPrim: p.uMapPrim, momentum: pr.momentum, organization: pr.organization },
    ...live.map(f => ({ id: f.id, partyId: p.partyId, uMap: f.uMap, uMapPrim: f.uMapPrim, momentum: f.momentum, organization: f.organization }))
  ];
  const res = runPrimaryContest(contest, fieldForSim, spendMap);
  for (const k in res.delegates) pr.delegates[k] += res.delegates[k];
  pr.allocated += contest.delegates;
  pr.results.push({ contest, res });

  // Momentum from beating or missing expectations
  const order = Object.entries(res.shares).sort((a, b) => b[1] - a[1]);
  const winnerId = order[0][0];
  const myShare = res.shares['player'];
  const expected = 1 / fieldForSim.length;
  pr.momentum = clamp(pr.momentum * 0.55 + (myShare - expected) * 26, -18, 18);
  for (const f of live) f.momentum = clamp(f.momentum * 0.55 + (res.shares[f.id] - expected) * 26, -18, 18);

  const winName = winnerId === 'player' ? p.name : live.find(f => f.id === winnerId).name;
  logMsg(`${contest.name}: ${winName} wins with ${(order[0][1] * 100).toFixed(1)}%. You take ${res.delegates['player']} delegates.`,
    winnerId === 'player' ? 'good' : '', 'RESULTS');

  // Withdrawals
  if (pr.index >= 2) {
    for (const f of live) {
      const totalShare = (pr.delegates[f.id] || 0) / Math.max(1, pr.allocated);
      if ((totalShare < 0.09 && f.funds < 40) || f.funds < 8) {
        pr.dropped.push(f.id);
        logMsg(`${f.name} suspends the campaign.`, 'big', 'WITHDRAWAL');
        // Their voters consolidate onto the nearest candidate ideologically
        const remaining = [{ id: 'player', c: p }, ...pr.field.filter(x => !pr.dropped.includes(x.id)).map(x => ({ id: x.id, c: x }))];
        const dist = remaining.map(r => ({ r, d: Math.abs(platformCenter(r.c.platform) - platformCenter(f.platform)) }))
          .sort((a, b) => a.d - b.d);
        if (dist[0]) {
          if (dist[0].r.id === 'player') { pr.momentum += 5; logMsg(`${f.name}'s people are coming to you.`, 'good', 'CONSOLIDATION'); }
          else { dist[0].r.c.momentum += 5; logMsg(`${f.name}'s lane consolidates behind ${dist[0].r.c.name}.`, 'bad', 'CONSOLIDATION'); }
        }
      }
    }
  }

  pr.spend *= 0.35;
  pr.index++;
  pr.moves = 3;
  pr.funds += Math.round(14 + (p.baseMorale - 50) * (p.perk === 'movement' ? 0.9 : 0.35));

  // Event
  if (rnd() < 0.62) await primaryEvent();

  if (pr.index >= PRIMARY_CALENDAR.length) return resolveNomination();
  render();
}

async function primaryEvent() {
  const p = G.player, pr = G.primary;
  const ev = pick(CAMPAIGN_EVENTS);
  const iss = pick(ISSUES.filter(i => p.platform.signature.includes(i.id)).concat(ISSUES)).name;
  const idx = await showModal({
    kicker: 'On the Trail', title: ev.title,
    text: esc(ev.text.replace('{ISSUE}', iss)),
    choices: ev.choices.map(c => ({ label: c.label }))
  });
  const e = ev.choices[idx].eff;
  if (e.momentum) pr.momentum += e.momentum;
  if (e.money) pr.funds += e.money;
  if (e.base) p.baseMorale = clamp(p.baseMorale + e.base, 10, 95);
  if (e.negatives) pr.negatives += e.negatives;
  if (e.authenticity) { p.traits.authenticity = clamp(p.traits.authenticity + e.authenticity, 5, 99); refreshCandidate(p); }
  if (e.suburb) { p.bonusU += e.suburb * 0.004; refreshCandidate(p); }
  if (e.discipline) p.traits.discipline = clamp(p.traits.discipline + e.discipline, 5, 99);
  logMsg(`${ev.title}: you chose "${ev.choices[idx].label}".`, '', 'TRAIL');
}

async function resolveNomination() {
  const pr = G.primary, p = G.player;
  const mine = pr.delegates['player'];
  const all = Object.entries(pr.delegates).sort((a, b) => b[1] - a[1]);
  const total = Object.values(pr.delegates).reduce((a, b) => a + b, 0);
  const majority = mine > total / 2;
  const plurality = all[0][0] === 'player';

  if (majority) {
    await showModal({ kicker: 'The Nomination', title: 'You Clinch It',
      text: `You cross the majority threshold with <b>${mine}</b> of ${total} delegates. The party is yours — the parts of it that are speaking to you, anyway.`,
      choices: [{ label: 'Accept the nomination →' }] });
    return beginVeep();
  }
  if (plurality) {
    // Contested convention: the establishment weighs electability and loyalty.
    const centerPenalty = Math.abs(platformCenter(p.platform)) > 1.35 ? -0.25 : 0.12;
    const odds = clamp(0.42 + (mine / total - 0.35) * 2.4 + centerPenalty + (pr.momentum / 60), 0.08, 0.94);
    const win = rnd() < odds;
    await showModal({ kicker: 'A Contested Convention', title: 'Nobody Has a Majority',
      text: `You lead with <b>${mine}</b> of ${total} delegates but no one has a majority. It goes to a second ballot, where the unpledged delegates — governors, members of Congress, and the state chairs you have or have not been nice to — decide.<br><br>Your standing with them: <b>${Math.round(odds * 100)}%</b>.`,
      choices: [{ label: 'Take the second ballot' }] });
    if (win) {
      await showModal({ kicker: 'The Second Ballot', title: 'They Give It To You',
        text: 'The establishment concludes you are the least bad option available. It is not the mandate you wanted, and your base noticed how it happened.',
        choices: [{ label: 'Accept the nomination →' }] });
      p.baseMorale = clamp(p.baseMorale - 7, 10, 95);
      return beginVeep();
    }
    return primaryLoss('The convention takes it from you on the second ballot.');
  }
  return primaryLoss(`${all[0][0]} takes the nomination with ${all[0][1]} delegates to your ${mine}.`);
}

async function primaryLoss(reason) {
  await showModal({ kicker: 'The End of the Road', title: 'You Concede',
    text: esc(reason) + '<br><br>You give a gracious speech, endorse the nominee, and are mentioned as a possible Secretary of Commerce.',
    choices: [{ label: 'See the post-mortem' }] });
  G.gov = { failedAt: 'primary', platform: G.player.platform, approval: 0, econ: 0, laws: [], enacted: {},
    baseMorale: G.player.baseMorale, deficit: 0, institutionalDamage: 0, reelected: null, quarter: 0 };
  G.screen = 'final';
  render();
}

/* ==========================================================================
   5. THE TICKET
   ========================================================================== */
function beginVeep() {
  const p = G.player;
  const dir = p.party.dir;
  const swingStates = ['PA', 'MI', 'WI', 'AZ', 'GA', 'NV', 'NC'];
  const st = pick(swingStates);
  G.veepOptions = [
    { id: 'balance', name: `The Moderate Senator from ${STATE_BY_ABBR[st].name}`,
      desc: 'A homestate advantage in a state you probably need, and a permanent argument with your own left.',
      eff: { state: st, stateBonus: 0.035, base: -6, mod: 0.13 } },
    { id: 'unify', name: 'The Movement Runner-Up',
      desc: 'The person your base actually wanted at the top of the ticket. Enthusiasm surges; suburban numbers do not.',
      eff: { base: 12, mod: -0.10, morale: true } },
    { id: 'safe', name: 'The Governor Nobody Dislikes',
      desc: 'Competent, forgettable, and impossible to attack. A ticket that adds nothing and subtracts nothing.',
      eff: { mod: 0.05, gravitas: 6 } },
    { id: 'coalition', name: 'The Big-City Mayor',
      desc: 'Turnout in the cities that decide three states, and a lot of ads about crime.',
      eff: { turnout: 0.06, base: 5, mod: -0.05 } }
  ];
  showVeep();
}

async function showVeep() {
  const p = G.player;
  const idx = await showModal({
    kicker: 'The Ticket', title: 'Choose a Running Mate',
    text: 'The vice presidency is worth about one state and a great deal of internal peace. Choose which you need.',
    choices: G.veepOptions.map(v => ({ label: v.name, hint: v.desc }))
  });
  const v = G.veepOptions[idx];
  p.veep = v;
  const e = v.eff;
  if (e.base) p.baseMorale = clamp(p.baseMorale + e.base, 10, 95);
  if (e.mod) p.bonusU += e.mod * 0.35;
  if (e.gravitas) p.traits.gravitas = clamp(p.traits.gravitas + e.gravitas, 5, 99);
  refreshCandidate(p);
  logMsg(`${v.name} joins the ticket.`, 'big', 'THE TICKET');
  beginGeneral();
}

/* ==========================================================================
   6. GENERAL ELECTION
   ========================================================================== */
function beginGeneral() {
  const p = G.player;
  const oppParty = p.partyId === 'D' ? 'R' : 'D';
  // The national environment. Time-for-a-change is real but not guaranteed:
  // a popular incumbent party with a good economy is a headwind, and drawing
  // this one-sided would make one party's map nearly unloseable.
  const econ = rndRange(-1.0, 1.0);
  const env = {
    incumbentParty: oppParty,
    incumbentPenalty: clamp(gauss(0.05, 0.20) - econ * 0.06, -0.42, 0.50),
    econ
  };
  const opp = genericOpponent(oppParty);
  opp.name = oppParty === 'D' ? 'Gov. Marcus Hale (D)' : 'Sen. Diane Prescott (R)';
  optimizeOpponent(opp, p, env, 3);

  G.opp = opp; G.env = env;
  G.general = {
    week: 1, days: 5,
    money: Math.round(160 + G.primary.funds * 0.5 + (p.traits.money - 50) * 2),
    efforts: {}, target: 'PA', proj: null, oppEfforts: {}, eventsDone: []
  };
  STATES.forEach(s => { G.general.efforts[s.abbr] = { persuade: 0, ground: 0, digital: 0 }; });
  updateProjection();
  logMsg(`General election begins. Opponent: ${opp.name}.`, 'big', 'CONVENTION');
  G.screen = 'general';
  render();
}

function updateProjection() {
  G.general.proj = projectElection(G.player, G.opp, G.env, G.general.efforts);
}

function scrGeneral(el) {
  const gn = G.general, p = G.player;
  const proj = gn.proj;
  const battle = proj.states.slice().sort((a, b) => Math.abs(a.margin) - Math.abs(b.margin)).slice(0, 12);

  el.appendChild(h(`<div class="fade-in">
    <div class="ticker">▲ WEEK ${gn.week} OF 10 — ${esc(p.name)} (${p.party.id}) vs. ${esc(G.opp.name)} — tipping point: ${esc(proj.tipping.name)} ${sgn(proj.tipping.margin * 100, 1)} — college bias ${biasLabel()} — environment ${envLabel()}</div>
    <div class="split">
      <div>
        <div class="panel">
          <div class="panel-head"><h2>The Map</h2><span class="spacer"></span>
            <span class="sub">Click a state to target it · <span class="mono">${esc(gn.target)}</span> selected</span></div>
          <div id="map"></div>
          <div id="ev" style="margin-top:14px"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Deploy the Campaign</h2><span class="sub">Target: ${esc(STATE_BY_ABBR[gn.target].name)} (${STATE_BY_ABBR[gn.target].ev} EV)</span></div>
          <div id="actions"></div>
          <div class="btn-row" style="margin-top:12px;border-top:1px solid var(--line);padding-top:13px">
            <button class="btn primary" id="endweek">End Week ${gn.week} →</button>
            <span class="muted small">${gn.days} day${gn.days === 1 ? '' : 's'} · ${money(gn.money)} on hand</span>
          </div>
        </div>
      </div>
      <div class="rail">
        <div class="panel">
          <div class="panel-head"><h2>Battlegrounds</h2><span class="sub">closest twelve</span></div>
          <div class="results-scroll"><table><thead><tr><th>State</th><th class="num">EV</th><th class="num">Margin</th><th class="num">Spent</th></tr></thead>
            <tbody id="battle"></tbody></table></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>National Coalition</h2></div>
          <div id="gbars"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>The Wire</h2></div>
          <div class="log" id="log"></div>
        </div>
      </div>
    </div></div>`));

  renderMap(el.querySelector('#map'), proj.states, {
    playerParty: p.partyId, target: gn.target,
    onClick: abbr => { gn.target = abbr; render(); }
  });
  renderEvBar(el.querySelector('#ev'), proj.evP, proj.evO, p.partyId);

  const aw = el.querySelector('#actions');
  for (const a of CAMPAIGN_ACTIONS) {
    const ok = gn.money >= a.cost && gn.days >= a.days;
    const row = h(`<div class="prov ${ok ? '' : 'stripped'}" style="grid-template-columns:1fr 110px">
      <div><div class="nm">${esc(a.name)}</div><div class="note">${esc(a.desc)}</div></div>
      <div class="fig">${a.cost ? '−' + money(a.cost) : '<span style="color:var(--green)">+cash</span>'}<br>
        <span class="muted tiny">${a.days ? a.days + ' day' + (a.days > 1 ? 's' : '') : 'no days'}</span></div></div>`);
    if (ok) row.onclick = () => doCampaignAction(a);
    aw.appendChild(row);
  }

  const bt = el.querySelector('#battle');
  for (const s of battle) {
    const e = gn.efforts[s.abbr];
    const spent = Math.round(e.persuade + e.ground + e.digital);
    bt.appendChild(h(`<tr style="cursor:pointer" data-a="${s.abbr}">
      <td>${esc(s.name)}${gn.target === s.abbr ? ' <span class="pill gold">target</span>' : ''}</td>
      <td class="num">${s.ev}</td>
      <td class="num" style="color:${s.margin > 0 ? 'var(--green)' : 'var(--red)'}">${sgn(s.margin * 100, 1)}</td>
      <td class="num muted">${spent || '—'}</td></tr>`));
  }
  bt.querySelectorAll('tr').forEach(tr => tr.onclick = () => { gn.target = tr.dataset.a; render(); });

  renderBlocBars(el.querySelector('#gbars'), p, G.opp, nationalWeights());
  renderLog(el.querySelector('#log'));
  el.querySelector('#endweek').onclick = () => endCampaignWeek();
}

function doCampaignAction(a) {
  const gn = G.general, p = G.player;
  const t = gn.target;
  gn.money -= a.cost; gn.days -= a.days;
  const eff = gn.efforts[t];
  const comp = p.perk === 'executive' ? 1.1 : 1;
  switch (a.id) {
    case 'ads':      eff.persuade += 20 * comp; logMsg(`$22M broadcast buy in ${STATE_BY_ABBR[t].name}.`, '', `WEEK ${gn.week}`); break;
    case 'digital':  eff.digital += 16 * comp; logMsg(`Digital persuasion program live in ${STATE_BY_ABBR[t].name}.`, '', `WEEK ${gn.week}`); break;
    case 'ground':   eff.ground += 15 * comp; logMsg(`Field program expands in ${STATE_BY_ABBR[t].name}.`, '', `WEEK ${gn.week}`); break;
    case 'rally':    eff.persuade += 7; p.baseMorale = clamp(p.baseMorale + 2.5, 10, 95);
                     logMsg(`Rally in ${STATE_BY_ABBR[t].name}. The crowd is enormous and so is the B-roll.`, 'good', `WEEK ${gn.week}`); break;
    case 'retail':   eff.persuade += 24; eff.ground += 6;
                     logMsg(`Two days of diners and union halls in ${STATE_BY_ABBR[t].name}.`, 'good', `WEEK ${gn.week}`); break;
    case 'money':    { const raise = Math.round(55 + (p.traits.money - 50) * 1.6 + (p.baseMorale - 50) * (p.perk === 'movement' ? 1.4 : 0.6));
                     gn.money += raise; logMsg(`Finance swing raises ${money(raise)}.`, 'good', `WEEK ${gn.week}`); break; }
    case 'surrogate': eff.persuade += 9; eff.ground += 4; logMsg(`Surrogates fan out across ${STATE_BY_ABBR[t].name}.`, '', `WEEK ${gn.week}`); break;
    case 'oppo':     eff.persuade += 13; p.baseMorale = clamp(p.baseMorale - 1.5, 10, 95);
                     G.opp.bonusU -= 0.035; refreshCandidate(G.opp);
                     logMsg('The oppo drop lands. Both sets of negatives tick up.', '', `WEEK ${gn.week}`); break;
  }
  if (p.perk === 'media' && a.cost > 0) eff.persuade += 5;
  updateProjection();
  render();
}

async function endCampaignWeek() {
  const gn = G.general, p = G.player;

  // Opponent allocates against the closest states
  const proj = gn.proj;
  const targets = proj.states.slice().sort((a, b) => Math.abs(a.margin) - Math.abs(b.margin)).slice(0, 5);
  for (const t of targets) {
    const e = gn.efforts[t.abbr];
    e.persuade -= 7 + rnd() * 6;   // opposition spending nets against yours
  }

  // Base morale decays unless fed
  const decay = p.perk === 'movement' ? 0.6 : 1.6;
  p.baseMorale = clamp(p.baseMorale - decay, 10, 95);

  gn.week++; gn.days = 5;
  gn.money += Math.round(30 + (p.baseMorale - 50) * 0.8);

  if (gn.week === 4 || gn.week === 7) await generalEvent(gn.week === 4 ? 'debate' : null);
  else if (rnd() < 0.5) await generalEvent();

  if (gn.week > 10) return runElectionNight();
  updateProjection();
  render();
}

async function generalEvent(force) {
  const p = G.player, gn = G.general;
  const ev = force ? CAMPAIGN_EVENTS.find(e => e.id === 'debate') : pick(CAMPAIGN_EVENTS);
  const iss = pick(ISSUES).name;
  const idx = await showModal({
    kicker: force === 'debate' ? 'Ninety Minutes, Live' : 'The Campaign',
    title: ev.title, text: esc(ev.text.replace('{ISSUE}', iss)),
    choices: ev.choices.map(c => ({ label: c.label }))
  });
  const e = ev.choices[idx].eff;
  if (e.momentum) { p.bonusU += e.momentum * 0.010; }
  if (e.money) gn.money += e.money;
  if (e.base) p.baseMorale = clamp(p.baseMorale + e.base, 10, 95);
  if (e.suburb) p.bonusU += e.suburb * 0.004;
  if (e.authenticity) p.traits.authenticity = clamp(p.traits.authenticity + e.authenticity, 5, 99);
  if (e.negatives) G.opp.bonusU -= 0.02;
  refreshCandidate(p); refreshCandidate(G.opp);
  logMsg(`${ev.title} — "${ev.choices[idx].label}"`, '', `WEEK ${gn.week}`);
}

/* ==========================================================================
   7. ELECTION NIGHT
   ========================================================================== */
function runElectionNight() {
  const result = runGeneralElection(G.player, G.opp, G.env, G.general.efforts);
  // Poll-closing order derived from the tile map: eastern columns first.
  const col = {};
  TILE_MAP.forEach(row => row.forEach((a, i) => { if (a) col[a] = i; }));
  result.order = result.states.slice().sort((a, b) => (col[b.abbr] - col[a.abbr]) || (rnd() - 0.5));
  G.general.result = result;
  G.general.called = [];
  G.screen = 'night';
  render();
  stepNight();
}

function stepNight() {
  const r = G.general.result;
  if (G.general.called.length >= r.order.length) return setTimeout(finishNight, 900);
  const next = r.order[G.general.called.length];
  G.general.called.push(next.abbr);
  paintNight();
  setTimeout(stepNight, G.general.called.length < 8 ? 260 : 130);
}

function scrNight(el) {
  el.appendChild(h(`<div class="fade-in">
    <div class="ticker" id="callticker">▲ POLLS CLOSING — DECISION DESK</div>
    <div class="split">
      <div class="panel">
        <div class="panel-head"><h2>Election Night</h2><span class="spacer"></span><span class="sub" id="clock"></span></div>
        <div id="map"></div>
        <div id="ev" style="margin-top:16px"></div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Calls</h2></div>
        <div class="results-scroll"><table><thead><tr><th>State</th><th class="num">EV</th><th class="num">Margin</th></tr></thead>
          <tbody id="calls"></tbody></table></div>
      </div>
    </div></div>`));
  paintNight();
}

function paintNight() {
  const r = G.general.result, gn = G.general, p = G.player;
  const shown = r.states.filter(s => gn.called.includes(s.abbr));
  const evP = shown.filter(s => s.won).reduce((a, s) => a + s.ev, 0);
  const evO = shown.filter(s => !s.won).reduce((a, s) => a + s.ev, 0);
  const mapEl = document.querySelector('#map'); if (!mapEl) return;
  renderMap(mapEl, shown, { playerParty: p.partyId });
  renderEvBar(document.querySelector('#ev'), evP, evO, p.partyId);
  document.querySelector('#clock').textContent = `${shown.length} of 51 called`;
  const tb = document.querySelector('#calls');
  tb.innerHTML = shown.slice().reverse().slice(0, 30).map(s =>
    `<tr><td>${esc(s.name)} <span class="pill ${s.won ? 'green' : 'red'}">${s.won ? 'YOU' : 'THEM'}</span></td>
      <td class="num">${s.ev}</td>
      <td class="num" style="color:${s.won ? 'var(--green)' : 'var(--red)'}">${sgn(s.margin * 100, 1)}</td></tr>`).join('');
  const last = shown[shown.length - 1];
  if (last) document.querySelector('#callticker').textContent =
    `▲ CALL: ${last.name.toUpperCase()} — ${last.won ? 'YOU' : G.opp.name.toUpperCase()} — ${sgn(last.margin * 100, 1)} · ${evP} EV vs ${evO} EV`;
}

async function finishNight() {
  const r = G.general.result, p = G.player;
  const won = r.evP >= 270;
  const pop = r.popular;
  await showModal({
    kicker: won ? 'The Networks Call It' : 'The Concession',
    title: won ? `${p.name} Is Elected President` : `${G.opp.name} Wins`,
    text: `<b>${r.evP}</b> electoral votes to <b>${r.evO}</b>. Popular vote: ${pct(pop, 1)} to ${pct(1 - pop, 1)}.<br><br>
      Tipping-point state: <b>${esc(r.tipping.name)}</b> at ${sgn(r.tipping.margin * 100, 1)}.
      ${won && pop < 0.5 ? '<br><br>You won the college and lost the country. Half the coverage tomorrow will be about that.' : ''}
      ${!won ? '<br><br>You call at 1:40am and concede at 2:15.' : ''}`,
    choices: [{ label: won ? 'Begin the transition →' : 'See the post-mortem' }]
  });
  if (!won) {
    G.gov = { failedAt: 'general', platform: p.platform, approval: 0, econ: 0, laws: [], enacted: {},
      baseMorale: p.baseMorale, deficit: 0, institutionalDamage: 0, reelected: null, quarter: 0, result: r };
    G.screen = 'final'; return render();
  }
  beginGovernment(r);
}

/* ==========================================================================
   8. GOVERNING
   ========================================================================== */
function beginGovernment(result) {
  const p = G.player;
  const natMargin = result.popular * 2 - 1;
  const congress = deriveCongress(natMargin, p.partyId);
  G.gov = {
    quarter: 1,
    approval: clamp(52 + natMargin * 40, 40, 64),
    capital: 0,
    econ: G.env.econ * 0.5,
    deficit: 1100 + Math.max(0, platformCost(p.platform)) * 0.2,
    baseMorale: p.baseMorale,
    bipartisan: 10,
    oppEnergy: 12,
    institutionalDamage: 0,
    filibusterGone: false,
    vehicleUsed: false,
    congress,
    seats: caucusSeats(congress, p.partyId),
    platform: p.platform,
    playerParty: p.partyId,
    perk: p.perk,
    enacted: {},
    laws: [],
    billsDone: [],
    ious: [],
    reelected: null,
    natMargin,
    result,
    actionTaken: false
  };
  G.gov.capital = quarterlyCapital(G.gov);
  logMsg(`Inauguration. ${congress.house.P}–${congress.house.O} House, ${congress.senate.P}–${congress.senate.O} Senate.`, 'big', 'JAN 20');
  G.screen = 'govern';
  render();
}

const GOV_ACTIONS = [
  { id: 'bill',   name: 'Move a Bill to the Floor', cost: 0,
    desc: 'Draft it, whip it, and find out what your majority is actually worth.' },
  { id: 'exec',   name: 'Sign an Executive Order', cost: 8,
    desc: 'Immediate, unilateral, half as strong, and one adverse ruling from nothing.' },
  { id: 'pulpit', name: 'National Address & Tour', cost: 10,
    desc: 'Spend capital to move approval and pressure exposed members.' },
  { id: 'party',  name: 'Party Building & Fundraising', cost: 6,
    desc: 'Recruit candidates and bank money. Pays off at the midterms.' },
  { id: 'summit', name: 'Foreign Summit', cost: 9,
    desc: 'Gravitas, a bump with hawks, and two weeks not spent on the agenda.' },
  { id: 'hold',   name: 'Consolidate and Wait', cost: 0,
    desc: 'Bank political capital. Sometimes the correct play, never the satisfying one.' }
];

function scrGovern(el) {
  const g = G.gov, p = G.player;
  const yr = 2029 + Math.floor((g.quarter - 1) / 4);
  const q = ((g.quarter - 1) % 4) + 1;

  el.appendChild(h(`<div class="fade-in">
    <div class="ticker">▲ Q${q} ${yr} — QUARTER ${g.quarter} OF 16 — APPROVAL ${Math.round(g.approval)}% — ${g.laws.length} LAWS ENACTED${g.filibusterGone ? ' — FILIBUSTER ABOLISHED' : ''}</div>
    <div class="split">
      <div>
        <div class="panel">
          <div class="panel-head"><h2>The Quarter</h2><span class="spacer"></span>
            <span class="sub">${g.actionTaken ? 'action used' : '1 major action available'}</span></div>
          <div id="actions"></div>
          <div class="btn-row" style="margin-top:12px;border-top:1px solid var(--line);padding-top:13px">
            <button class="btn primary" id="endq">Advance to Q${g.quarter + 1} →</button>
            <span class="muted small">${Math.round(g.capital)} political capital on hand</span>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>The Agenda</h2><span class="sub">promises against the record</span></div>
          <table><thead><tr><th>Issue</th><th>You Promised</th><th>Enacted</th><th class="num">Status</th></tr></thead>
            <tbody id="agenda"></tbody></table>
        </div>
      </div>
      <div class="rail">
        <div class="panel">
          <div class="panel-head"><h2>Congress</h2><span class="sub">caucus by caucus</span></div>
          <div id="congress"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Indicators</h2></div>
          <div class="kpi" id="kpi"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>The Wire</h2></div>
          <div class="log" id="log"></div>
        </div>
      </div>
    </div></div>`));

  const aw = el.querySelector('#actions');
  for (const a of GOV_ACTIONS) {
    const ok = !g.actionTaken && g.capital >= a.cost;
    const row = h(`<div class="prov ${ok ? '' : 'stripped'}" style="grid-template-columns:1fr 84px">
      <div><div class="nm">${esc(a.name)}</div><div class="note">${esc(a.desc)}</div></div>
      <div class="fig">${a.cost ? a.cost + ' cap' : '—'}</div></div>`);
    if (ok) row.onclick = () => doGovAction(a);
    aw.appendChild(row);
  }

  const ag = el.querySelector('#agenda');
  for (const iss of ISSUES) {
    const promised = g.platform.positions[iss.id];
    const got = g.enacted[iss.id];
    const sig = g.platform.signature.includes(iss.id);
    const stance = STANCES[iss.id].find(s => s.p === promised);
    let status = '<span class="pill">not addressed</span>';
    if (got !== undefined) {
      status = Math.abs(got - promised) <= 0.7
        ? '<span class="pill green">kept</span>'
        : '<span class="pill red">watered down</span>';
    }
    ag.appendChild(h(`<tr>
      <td>${esc(iss.short)} ${sig ? '<span class="pill gold">sig</span>' : ''}</td>
      <td class="small dim">${esc(stance ? stance.label : '—')}</td>
      <td class="num small">${got === undefined ? '—' : sgn(got, 2)}</td>
      <td class="num">${status}</td></tr>`));
  }

  const cw = el.querySelector('#congress');
  cw.innerHTML = '';
  for (const partyKey of [p.partyId, p.partyId === 'D' ? 'R' : 'D']) {
    const cs = CAUCUSES.filter(c => c.party === partyKey);
    cw.appendChild(h(`<div class="tiny muted" style="margin:8px 0 4px;letter-spacing:.1em;text-transform:uppercase">${
      PARTIES[partyKey].name}${partyKey === p.partyId ? ' — yours' : ' — the opposition'}</div>`));
    for (const c of cs) {
      cw.appendChild(h(`<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:12px" title="${esc(c.blurb)}">
        <span class="dim">${esc(c.name)}</span>
        <span class="mono">${g.seats.house[c.id]}H · ${g.seats.senate[c.id]}S</span></div>`));
    }
  }

  el.querySelector('#kpi').innerHTML = `
    <div><span class="k">Deficit</span><span class="v">${bn(g.deficit)}</span></div>
    <div><span class="k">Bipartisan</span><span class="v">${Math.round(g.bipartisan)}</span></div>
    <div><span class="k">Opp. Energy</span><span class="v">${Math.round(g.oppEnergy)}</span></div>
    <div><span class="k">Institutions</span><span class="v" style="color:${g.institutionalDamage > 4 ? 'var(--red)' : 'inherit'}">${g.institutionalDamage}</span></div>`;

  renderLog(el.querySelector('#log'));
  el.querySelector('#endq').onclick = () => endQuarter();
}

async function doGovAction(a) {
  const g = G.gov, p = G.player;
  if (a.id === 'bill') {
    const avail = BILLS.filter(b => !g.billsDone.includes(b.id));
    if (!avail.length) { await showModal({ title: 'The Agenda Is Exhausted', text: 'Every vehicle has been used this term.', choices: [{ label: 'Back' }] }); return; }
    const idx = await showModal({
      kicker: 'Legislative Strategy', title: 'Which Bill?',
      text: 'You have the floor time for one major bill. Leadership wants to know which.',
      choices: avail.map(b => ({ label: b.name, hint: b.blurb }))
    });
    G.bill = { bill: avail[idx], selected: avail[idx].provisions.slice(0, 3).map(x => x.id),
      boosts: {}, pulpit: 0, reconciliation: false, vehicle: false, spentCapital: 0, dealsWith: [] };
    G.screen = 'bill'; return render();
  }

  g.capital -= a.cost;
  g.actionTaken = true;
  const comp = g.perk === 'executive' ? 1.15 : 1;

  if (a.id === 'exec') {
    const idx = await showModal({
      kicker: 'Article II', title: 'Executive Action',
      text: 'A pen and a phone. You get roughly 55% of the policy, none of the votes, and a lawsuit filed within the hour.',
      choices: ISSUES.filter(i => g.enacted[i.id] === undefined).slice(0, 6).map(i => ({
        label: i.name, hint: STANCES[i.id].find(s => s.p === g.platform.positions[i.id]).label
      })).concat([{ label: 'Never mind' }])
    });
    const pool = ISSUES.filter(i => g.enacted[i.id] === undefined).slice(0, 6);
    if (idx >= pool.length) { g.capital += a.cost; g.actionTaken = false; return render(); }
    const iss = pool[idx];
    const target = g.platform.positions[iss.id];
    const strength = 0.55 * comp;
    const enactedPos = target * strength;
    g.enacted[iss.id] = enactedPos;
    g.laws.push({ name: `Executive Order on ${iss.name}`, issue: iss.id, pos: enactedPos, exec: true });
    g.baseMorale = clamp(g.baseMorale + 4, 10, 95);
    g.oppEnergy += 5;
    logMsg(`Executive order signed on ${iss.name}. Effective immediately; challenged by 3pm.`, 'good', `Q${g.quarter}`);
    if (rnd() < 0.42) {
      await showModal({ kicker: 'The Courts', title: 'Enjoined',
        text: `A district judge stays your ${esc(iss.name.toLowerCase())} order nationwide. It will be at the Supreme Court in eighteen months, which is to say after the midterms.`,
        choices: [{ label: 'Appeal' }] });
      g.enacted[iss.id] = enactedPos * 0.35;
      g.approval -= 2;
      logMsg(`The ${iss.name} order is enjoined.`, 'bad', `Q${g.quarter}`);
    }
  } else if (a.id === 'pulpit') {
    const bump = 2.6 * comp + (p.traits.charisma - 50) / 22;
    g.approval = clamp(g.approval + bump, 8, 92);
    g.pulpitStock = (g.pulpitStock || 0) + 0.55;
    logMsg(`Address to the nation. Approval ${sgn(bump, 1)}.`, 'good', `Q${g.quarter}`);
  } else if (a.id === 'party') {
    g.partyBuilding = (g.partyBuilding || 0) + 1;
    g.baseMorale = clamp(g.baseMorale + 3, 10, 95);
    logMsg('A quarter of recruitment, retreats, and call time for the committees.', '', `Q${g.quarter}`);
  } else if (a.id === 'summit') {
    g.approval = clamp(g.approval + 1.8, 8, 92);
    g.bipartisan += 5;
    p.traits.gravitas = clamp(p.traits.gravitas + 2, 5, 99);
    logMsg('A summit, a communiqué, and a week of respectful coverage.', 'good', `Q${g.quarter}`);
  } else if (a.id === 'hold') {
    g.capital += 12;
    logMsg('A quiet quarter. Capital banked.', '', `Q${g.quarter}`);
  }
  render();
}

async function endQuarter() {
  const g = G.gov;

  // Economy random walk, nudged by fiscal policy
  const fiscalImpulse = clamp((g.deficit - 1200) / 3000, -0.3, 0.5);
  g.econ = clamp(g.econ * 0.78 + gauss(0.02, 0.32) + fiscalImpulse * 0.10, -2.2, 2.2);
  g.approval = clamp(g.approval + approvalDrift(g), 8, 92);
  g.baseMorale = clamp(g.baseMorale - 0.8 + g.laws.length * 0.35, 10, 95);
  g.oppEnergy = clamp(g.oppEnergy + 1.4 - (g.approval - 48) * 0.08, 0, 60);
  g.bipartisan = clamp(g.bipartisan - 0.6, 0, 60);
  g.deficit += Math.max(0, g.deficit * 0.004);

  if (rnd() < 0.55) await governingEvent();

  g.quarter++;
  g.actionTaken = false;
  g.capital = Math.round(clamp(g.capital * 0.35 + quarterlyCapital(g), 0, 90));

  if (g.quarter === 9) await runMidterms();
  if (g.quarter > 16) return runReelection();
  render();
}

async function governingEvent() {
  const g = G.gov, p = G.player;
  const ev = pick(GOVERNING_EVENTS);
  const caucusName = pick(CAUCUSES.filter(c => c.party === g.playerParty)).name;
  const text = ev.text
    .replace('{DEPT}', pick(DEPTS))
    .replace('{CAUCUS}', caucusName)
    .replace('{ISSUE}', pick(ISSUES).name);
  const idx = await showModal({
    kicker: `Quarter ${g.quarter}`, title: ev.title, text: esc(text),
    choices: ev.choices.map(c => ({ label: c.label }))
  });
  const e = ev.choices[idx].eff;
  const soften = (p.perk === 'commander' && ev.id === 'foreign') ? 0.5 : 1;
  if (e.econ) g.econ = clamp(g.econ + e.econ * soften, -2.2, 2.2);
  if (e.approval) g.approval = clamp(g.approval + e.approval * soften, 8, 92);
  if (e.capital) g.capital = Math.max(0, g.capital + e.capital * soften);
  if (e.base) g.baseMorale = clamp(g.baseMorale + e.base, 10, 95);
  if (e.deficit) g.deficit += e.deficit;
  if (e.oppEnergy) g.oppEnergy += e.oppEnergy;
  if (e.bipartisan) g.bipartisan += e.bipartisan;
  if (e.hawks) p.bonusU += 0.01;
  if (e.coherence) g.institutionalDamage += e.coherence < 0 ? 1 : 0;
  if (e.courtRisk) g.institutionalDamage += 1;
  if (e.policyStrength) {
    for (const k in g.enacted) g.enacted[k] *= (1 + e.policyStrength * 0.3);
  }
  logMsg(`${ev.title} — "${ev.choices[idx].label}"`, '', `Q${g.quarter}`);
}

async function runMidterms() {
  const g = G.gov;
  const sw = midtermSwing(g);
  const boost = (g.partyBuilding || 0) * 4;
  const house = sw.house + boost;
  const senate = sw.senate + Math.round(boost / 8);
  g.congress.house.P = clamp(g.congress.house.P + house, 120, 330);
  g.congress.house.O = 435 - g.congress.house.P;
  g.congress.senate.P = clamp(g.congress.senate.P + senate, 30, 70);
  g.congress.senate.O = 100 - g.congress.senate.P;
  g.seats = caucusSeats(g.congress, g.playerParty);
  const kept = g.congress.house.P >= 218;
  await showModal({
    kicker: 'The Midterms', title: kept ? 'You Hold the House' : 'You Lose the House',
    text: `Net change: <b>${sgn(house, 0)}</b> House seats, <b>${sgn(senate, 0)}</b> Senate seats.<br><br>
      New Congress: <b>${g.congress.house.P}–${g.congress.house.O}</b> House, <b>${g.congress.senate.P}–${g.congress.senate.O}</b> Senate.<br><br>
      ${kept ? 'The agenda survives. Narrowly.'
             : 'Oversight begins in January. Subpoenas by March. Nothing you send up will get a hearing.'}`,
    choices: [{ label: 'Begin the second half' }]
  });
  logMsg(`Midterms: ${sgn(house, 0)} House, ${sgn(senate, 0)} Senate.`, kept ? '' : 'bad', 'NOVEMBER');
  if (!kept) g.oppEnergy += 14;
}

async function runReelection() {
  const g = G.gov, p = G.player;
  // A referendum on approval and the economy, with a coalition check.
  const opp2 = genericOpponent(p.partyId === 'D' ? 'R' : 'D');
  opp2.name = 'The Challenger';
  // A referendum on the record. Calibrated so that a president at 47 and a
  // flat economy faces a mild headwind rather than a fourteen-point one.
  const env2 = {
    incumbentParty: p.partyId,
    incumbentPenalty: clamp(0.10 - (g.approval - 47) * 0.018 - g.econ * 0.05, -0.24, 0.42)
  };
  optimizeOpponent(opp2, p, env2, 2);
  p.baseMorale = g.baseMorale;
  refreshCandidate(p);
  const efforts = {}; STATES.forEach(s => efforts[s.abbr] = { persuade: 0, ground: 0, digital: 0 });
  const r = runGeneralElection(p, opp2, env2, efforts);
  g.reelected = r.evP >= 270;
  g.reelectionResult = r;
  await showModal({
    kicker: 'Four Years Later', title: g.reelected ? 'Re-Elected' : 'Defeated',
    text: `<b>${r.evP}</b> to <b>${r.evO}</b> in the electoral college; ${pct(r.popular, 1)} of the two-party vote.<br><br>
      ${g.reelected
        ? 'The country renews the contract. Whatever you did not finish, you now have to finish with a weaker hand and less time.'
        : 'The country declines to renew the contract. Everything you passed by executive action ends on January 20th.'}`,
    choices: [{ label: 'The verdict of history →' }]
  });
  G.screen = 'final';
  render();
}

/* ==========================================================================
   9. BILL — drafting and whipping
   ========================================================================== */
function scrBill(el) {
  const g = G.gov, B = G.bill, bill = B.bill;
  const byrd = applyByrd(bill, B.selected);
  const effective = B.reconciliation ? byrd.kept : B.selected;
  const gp = groupPressure(bill, effective);
  const ctx = {
    seats: g.seats, approval: g.approval, baseMorale: g.baseMorale, deficit: g.deficit,
    bipartisan: g.bipartisan, playerParty: g.playerParty,
    boosts: mergeBoosts(gp.boosts, B.boosts), pulpit: B.pulpit,
    reconciliation: B.reconciliation, filibusterGone: g.filibusterGone, vehicle: B.vehicle
  };
  const wc = whipCount(bill, effective, ctx);
  const bs = billState(bill, effective);
  const promised = g.platform.positions[bill.issue];

  el.appendChild(h(`<div class="fade-in">
    <div class="ticker">▲ ${esc(bill.name).toUpperCase()} — ${effective.length} PROVISIONS — ${bn(bs.cost)}/YR — ${
      B.reconciliation ? 'RECONCILIATION (50 VOTES)' : g.filibusterGone ? 'MAJORITY RULE (50 VOTES)' : 'REGULAR ORDER (60 VOTES)'}</div>
    <div class="split">
      <div>
        <div class="panel">
          <div class="panel-head"><h2>${esc(bill.name)}</h2><span class="spacer"></span>
            <span class="sub">Position ${sgn(bs.pos, 2)} · you promised ${sgn(promised, 2)}</span></div>
          <div class="callout">${esc(bill.blurb)}</div>
          <div id="provs"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>The Whip Count</h2><span class="sub">members move, caucuses split</span></div>
          <div id="whip"></div>
        </div>
      </div>
      <div class="rail">
        <div class="panel">
          <div class="panel-head"><h2>Floor Math</h2></div>
          <div id="meters"></div>
          <div class="btn-row" style="margin-top:8px">
            <button class="btn primary" id="floor" style="width:100%">Bring It to the Floor</button>
          </div>
          <div class="btn-row" style="margin-top:6px">
            <button class="btn ghost sm" id="shelve">Shelve the Bill</button>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Procedural Tools</h2><span class="sub">${Math.round(g.capital)} capital</span></div>
          <div id="tools"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Outside Pressure</h2></div>
          <div id="groups" class="small"></div>
        </div>
      </div>
    </div></div>`));

  // provisions
  const pw = el.querySelector('#provs');
  for (const pv of bill.provisions) {
    const on = B.selected.includes(pv.id);
    const strippedByByrd = B.reconciliation && on && !pv.byrd;
    const row = h(`<div class="prov ${on ? 'on' : ''} ${strippedByByrd ? 'stripped' : ''}">
      <div class="box">${on ? '✓' : ''}</div>
      <div>
        <div class="nm">${esc(pv.name)} ${strippedByByrd ? '<span class="byrd">— STRUCK BY THE BYRD RULE</span>' : ''}</div>
        <div class="note">${esc(pv.note)}</div>
      </div>
      <div class="fig">${bn(pv.cost)}<br><span class="muted tiny">pos ${sgn(pv.pos, 1)}</span></div></div>`);
    row.onclick = () => {
      const i = B.selected.indexOf(pv.id);
      if (i >= 0) B.selected.splice(i, 1); else B.selected.push(pv.id);
      render();
    };
    pw.appendChild(row);
  }

  // whip board
  const ww = el.querySelector('#whip');
  for (const r of wc.rows.sort((a, b) => b.frac - a.frac)) {
    const [cls, txt] = leanTag(r.frac);
    const canDeal = g.capital >= dealCost(r.caucus) && !B.dealsWith.includes(r.caucus.id);
    const row = h(`<div class="whip-row">
      <div class="whip-name">${esc(r.caucus.name)}<small>${esc(r.caucus.blurb)}</small></div>
      <div class="whip-bar"><div class="yes" style="width:${(r.frac * 100).toFixed(1)}%"></div>
        <div class="txt">${(r.frac * 100).toFixed(0)}% yes</div></div>
      <div class="whip-count">${r.houseYes}/${r.house} H<br>${r.senateYes}/${r.senate} S</div>
      <div class="whip-act">
        <span class="lean ${cls}">${txt}</span><br>
        <button class="btn sm" data-deal="${r.caucus.id}" ${canDeal ? '' : 'disabled'} style="margin-top:4px">
          ${B.dealsWith.includes(r.caucus.id) ? 'dealt' : 'deal ' + dealCost(r.caucus)}</button>
      </div></div>`);
    ww.appendChild(row);
  }
  ww.querySelectorAll('[data-deal]').forEach(b => b.onclick = () => makeDeal(b.dataset.deal));

  // meters
  el.querySelector('#meters').innerHTML =
    voteMeter('House', wc.houseYes, 218, 435) +
    voteMeter('Senate', wc.senateYes, wc.senateNeeded, 100) +
    `<div class="small dim" style="margin-top:6px">
      Cost: <span class="mono">${bn(bs.cost)}</span>/yr · Bill position <span class="mono">${sgn(bs.pos, 2)}</span>
      vs. your promise <span class="mono">${sgn(promised, 2)}</span>
      ${Math.abs(bs.pos - promised) <= 0.7 ? '<span class="pill green">on promise</span>' : '<span class="pill red">off promise</span>'}</div>`;

  // tools
  const tw = el.querySelector('#tools');
  const tools = [
    { id: 'recon', name: B.reconciliation ? 'Return to Regular Order' : 'Move Under Reconciliation', cost: 6,
      desc: B.reconciliation ? 'Go back to sixty votes and restore the struck provisions.'
        : `Fifty votes in the Senate. The Byrd rule strips ${bill.provisions.filter(x => !x.byrd && B.selected.includes(x.id)).length} of your provisions.` },
    { id: 'pulpit', name: 'Take It to the Country', cost: 9,
      desc: 'A prime-time push. Moves the members whose seats you carried; irrelevant to the ones you did not.' },
    { id: 'vehicle', name: 'Attach to a Must-Pass Vehicle', cost: 14,
      desc: g.vehicleUsed ? 'Already used this term.' : 'Hang it on the NDAA. Everyone gets a vote they can explain. Once per term.' },
    { id: 'nuke', name: 'Abolish the Filibuster', cost: 26,
      desc: g.filibusterGone ? 'Already done. There is no undoing it.'
        : 'Fifty votes for everything, forever, for both parties. Your institutionalists will not forgive it.' }
  ];
  for (const t of tools) {
    const used = (t.id === 'vehicle' && (g.vehicleUsed || B.vehicle)) || (t.id === 'nuke' && g.filibusterGone);
    const ok = g.capital >= t.cost && !used;
    const row = h(`<div class="prov ${ok ? '' : 'stripped'}" style="grid-template-columns:1fr 56px">
      <div><div class="nm">${esc(t.name)}</div><div class="note">${esc(t.desc)}</div></div>
      <div class="fig">${t.cost} cap</div></div>`);
    if (ok) row.onclick = () => useTool(t);
    tw.appendChild(row);
  }

  // groups
  el.querySelector('#groups').innerHTML = gp.detail.length
    ? gp.detail.map(d => `<div style="display:flex;justify-content:space-between;padding:3px 0">
        <span class="dim">${esc(d.group.name)}</span>
        <span class="mono" style="color:${d.reaction > 0 ? 'var(--green)' : 'var(--red)'}">${
          d.reaction > 0.5 ? 'campaigning for' : d.reaction > 0 ? 'supportive' : d.reaction > -0.5 ? 'opposed' : 'ALL-OUT WAR'}</span></div>`).join('')
    : '<span class="muted">Nobody outside Washington has noticed this bill.</span>';

  el.querySelector('#floor').onclick = () => bringToFloor(wc, bs, effective);
  el.querySelector('#shelve').onclick = async () => {
    await showModal({ title: 'Shelve It', text: 'The bill goes back to committee. You keep your capital and lose the quarter.',
      choices: [{ label: 'Shelve it' }, { label: 'Keep working' }] }).then(i => {
        if (i === 0) { G.gov.actionTaken = true; logMsg(`${bill.name} is pulled from the floor.`, 'bad', `Q${G.gov.quarter}`); G.screen = 'govern'; render(); }
      });
  };
}

function mergeBoosts(a, b) {
  const out = Object.assign({}, a);
  for (const k in b) out[k] = (out[k] || 0) + b[k];
  return out;
}

function dealCost(caucus) {
  const g = G.gov;
  const base = Math.round(9 * caucus.price);
  return Math.round(base * (g.perk === 'whip' ? 0.75 : 1));
}

function makeDeal(caucusId) {
  const g = G.gov, B = G.bill;
  const c = CAUCUS_BY_ID[caucusId];
  const cost = dealCost(c);
  if (g.capital < cost) return;
  g.capital -= cost;
  B.spentCapital += cost;
  B.dealsWith.push(caucusId);
  B.boosts[caucusId] = (B.boosts[caucusId] || 0) + 1.25 * (1 + (G.player.traits.legislative - 50) / 160);
  // Deals are not free later.
  g.ious.push({ caucus: caucusId, quarter: g.quarter });
  if (c.party !== g.playerParty) g.bipartisan += 4;
  else g.baseMorale = clamp(g.baseMorale - (c.id === 'bluedog' || c.id === 'mainst' ? 2.5 : -1), 10, 95);
  logMsg(`Deal cut with the ${c.name}: earmarks, a committee gavel, and a project in three districts.`, '', `Q${g.quarter}`);
  render();
}

async function useTool(t) {
  const g = G.gov, B = G.bill;
  if (t.id === 'recon') {
    if (!B.reconciliation) {
      const stripped = B.bill.provisions.filter(x => !x.byrd && B.selected.includes(x.id));
      const i = await showModal({
        kicker: 'The Byrd Rule', title: 'Move Under Reconciliation?',
        text: `The Senate parliamentarian will strike anything that is not primarily budgetary. You would lose:<br><br>${
          stripped.length ? stripped.map(s => '• ' + esc(s.name)).join('<br>') : '• nothing — this bill is all money'}<br><br>
          In exchange the Senate threshold drops from sixty to fifty.`,
        choices: [{ label: 'Do it. Fifty votes.' }, { label: 'Keep regular order' }]
      });
      if (i !== 0) return;
    }
    g.capital -= t.cost; B.reconciliation = !B.reconciliation;
    logMsg(B.reconciliation ? 'The bill moves under reconciliation.' : 'The bill returns to regular order.', '', `Q${g.quarter}`);
  } else if (t.id === 'pulpit') {
    g.capital -= t.cost;
    B.pulpit += 0.75 + (G.player.traits.charisma - 50) / 90;
    g.approval = clamp(g.approval + 0.8, 8, 92);
    logMsg('Prime-time address on the bill. The switchboards light up in eleven districts.', 'good', `Q${g.quarter}`);
  } else if (t.id === 'vehicle') {
    g.capital -= t.cost; B.vehicle = true; g.vehicleUsed = true;
    logMsg('The bill is attached to the defense authorization. Everyone gets cover.', 'good', `Q${g.quarter}`);
  } else if (t.id === 'nuke') {
    const i = await showModal({
      kicker: 'The Nuclear Option', title: 'Abolish the Legislative Filibuster?',
      text: 'Fifty votes passes everything from this moment on — for you, and for whoever holds the chamber next. Two of your own senators have said they will not vote for the rules change, and the ones who do will remember that you asked.',
      choices: [{ label: 'Break it. We came here to legislate.' }, { label: 'Leave the Senate as it is' }]
    });
    if (i !== 0) return;
    g.capital -= t.cost;
    g.filibusterGone = true;
    g.institutionalDamage += 3;
    g.oppEnergy += 18;
    g.baseMorale = clamp(g.baseMorale + 9, 10, 95);
    logMsg('The legislative filibuster is abolished on a party-line vote.', 'big', `Q${g.quarter}`);
  }
  render();
}

async function bringToFloor(wc, bs, effective) {
  const g = G.gov, B = G.bill, bill = B.bill;
  if (!effective.length) {
    await showModal({ title: 'There Is No Bill', text: 'You cannot pass an empty vehicle. Add provisions.', choices: [{ label: 'Back' }] });
    return;
  }
  // A last flicker of uncertainty: a couple of members are always a surprise.
  const houseFinal = wc.houseYes + Math.round(gauss(0, 5));
  const senateFinal = wc.senateYes + Math.round(gauss(0, 1.6));
  const passes = houseFinal >= 218 && senateFinal >= wc.senateNeeded;

  g.actionTaken = true;
  g.billsDone.push(bill.id);

  if (passes) {
    g.enacted[bill.issue] = bs.pos;
    g.laws.push({ name: bill.name, issue: bill.issue, pos: bs.pos, cost: bs.cost, provisions: effective.length });
    g.deficit += Math.max(0, bs.cost) * 0.9;
    g.deficit += Math.min(0, bs.cost) * 0.9;
    g.approval = clamp(g.approval + 2.2, 8, 92);
    const promised = g.platform.positions[bill.issue];
    const onPromise = Math.abs(bs.pos - promised) <= 0.7;
    g.baseMorale = clamp(g.baseMorale + (onPromise ? 5 : -6), 10, 95);
    logMsg(`${bill.name} passes the House ${houseFinal}–${435 - houseFinal} and the Senate ${senateFinal}–${100 - senateFinal}.`, 'big', `Q${g.quarter}`);
    await showModal({
      kicker: 'Signed in the East Room', title: `${bill.name} Is Law`,
      text: `House <b>${houseFinal}–${435 - houseFinal}</b>. Senate <b>${senateFinal}–${100 - senateFinal}</b>.<br><br>
        Enacted position <b>${sgn(bs.pos, 2)}</b> against a promise of <b>${sgn(promised, 2)}</b>.
        ${onPromise
          ? ' Your people got what you told them they would get.'
          : ' It is not what you promised. The people who knocked doors for you have noticed, and they are on television about it.'}
        <br><br>Ten-year cost: <b>${bn(bs.cost * 10)}</b>.`,
      choices: [{ label: 'Back to the agenda' }]
    });
  } else {
    const gap = Math.max(218 - houseFinal, wc.senateNeeded - senateFinal);
    g.approval = clamp(g.approval - 3.2, 8, 92);
    g.baseMorale = clamp(g.baseMorale - 7, 10, 95);
    g.oppEnergy += 6;
    logMsg(`${bill.name} fails. House ${houseFinal}, Senate ${senateFinal}.`, 'bad', `Q${g.quarter}`);
    await showModal({
      kicker: 'The Vote', title: `${bill.name} Fails`,
      text: `House <b>${houseFinal}</b> of 218 needed. Senate <b>${senateFinal}</b> of ${wc.senateNeeded} needed. Short by ${gap}.<br><br>
        The vehicle is spent for this Congress. Your capital is gone, your base is furious, and the opposition has a clip of you promising it would pass.`,
      choices: [{ label: 'Back to the agenda' }]
    });
  }
  G.screen = 'govern';
  render();
}

/* ==========================================================================
   10. FINAL SCORE
   ========================================================================== */
function scrFinal(el) {
  const g = G.gov, p = G.player;
  const s = finalScore(g);
  const tier = legacyTier(s.total);
  const failed = g.failedAt;

  el.appendChild(h(`<div class="fade-in">
    <div class="title-screen" style="padding-top:20px">
      <div class="tag">${failed ? (failed === 'primary' ? 'You never reached the general' : 'You never reached the Oval Office') : 'The verdict of history'}</div>
      <h1 style="font-size:44px">${esc(failed ? 'Also Ran' : tier.title)}</h1>
      <div class="blurb">${esc(failed
        ? 'The platform you wrote is now a footnote in someone else\'s primary. Every plank you chose for the nomination is why you did not reach the country, or the other way around.'
        : tier.text)}</div>
    </div>
    <div class="split" style="margin-top:20px">
      <div class="panel">
        <div class="panel-head"><h2>The Record</h2></div>
        <table><tbody id="score"></tbody></table>
      </div>
      <div class="rail">
        <div class="panel">
          <div class="panel-head"><h2>Promises</h2></div>
          <table><thead><tr><th>Issue</th><th class="num">Outcome</th></tr></thead><tbody id="prom"></tbody></table>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Laws Enacted</h2></div>
          <div id="laws" class="small"></div>
        </div>
      </div>
    </div>
    <div class="btn-row" style="justify-content:center;margin:22px 0">
      <button class="btn primary" id="again">Run Again</button>
      <button class="btn ghost" id="seedbtn">Seed: ${G.seed}</button>
    </div>
    <div class="footer-note">Mandate · a game about the distance between a platform and a signing ceremony</div>
  </div>`));

  const sc = el.querySelector('#score');
  const labels = {
    promises: 'Promises kept and broken', approval: 'Standing with the country',
    economy: 'The economy you leave', legislation: 'Legislative record',
    reelection: 'The voters\' verdict', base: 'Your own coalition',
    deficit: 'Fiscal position', institutions: 'Damage to the institutions'
  };
  for (const k in s.parts) {
    if (failed && ['approval', 'economy', 'legislation', 'reelection', 'deficit', 'institutions'].includes(k)) continue;
    sc.appendChild(h(`<tr><td class="dim">${labels[k]}</td>
      <td class="num" style="color:${s.parts[k] > 0 ? 'var(--green)' : s.parts[k] < 0 ? 'var(--red)' : 'var(--text-mute)'}">${sgn(s.parts[k], 0)}</td></tr>`));
  }
  sc.appendChild(h(`<tr><td style="font-weight:600">Legacy Score</td>
    <td class="num" style="font-size:18px;font-weight:700;color:var(--gold)">${Math.round(failed ? s.parts.promises + s.parts.base : s.total)}</td></tr>`));

  const pr = el.querySelector('#prom');
  for (const iss of ISSUES) {
    const promised = g.platform.positions[iss.id];
    const got = g.enacted[iss.id];
    const sig = g.platform.signature.includes(iss.id);
    let v = '<span class="pill">never taken up</span>';
    if (got !== undefined) v = Math.abs(got - promised) <= 0.7
      ? '<span class="pill green">kept</span>' : '<span class="pill red">broken</span>';
    pr.appendChild(h(`<tr><td>${esc(iss.short)}${sig ? ' <span class="pill gold">sig</span>' : ''}</td><td class="num">${v}</td></tr>`));
  }

  el.querySelector('#laws').innerHTML = g.laws.length
    ? g.laws.map(l => `<div style="padding:3px 0" class="dim">• ${esc(l.name)}${l.exec ? ' <span class="pill">executive</span>' : ''}
        <span class="muted mono tiny">${l.cost !== undefined ? bn(l.cost) + '/yr' : ''}</span></div>`).join('')
    : '<span class="muted">Nothing was signed.</span>';

  el.querySelector('#again').onclick = () => location.reload();
  el.querySelector('#seedbtn').onclick = () => {
    navigator.clipboard && navigator.clipboard.writeText(String(G.seed));
    el.querySelector('#seedbtn').textContent = 'Seed copied: ' + G.seed;
  };
}

/* ==========================================================================
   SHARED
   ========================================================================== */
function renderLog(el) {
  if (!el) return;
  el.innerHTML = G.log.slice(0, 40).map(l =>
    `<div class="log-item ${l.cls}">${l.when ? `<span class="when">${esc(l.when)}</span>` : ''}${esc(l.text)}</div>`).join('')
    || '<div class="muted small">Nothing on the wire yet.</div>';
}

/* ---- boot ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  setSeed(Math.floor(Math.random() * 2 ** 31));
  calibrateStates();
  render();
});
