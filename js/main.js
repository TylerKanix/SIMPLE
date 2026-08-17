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
    general: scrGeneral, night: scrNight, results: scrResults, govern: scrGovern,
    bill: scrBill, war: scrWar, final: scrFinal
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
    // This figure is the *spread* of the platform: high means heterodox, not
    // coherent. Labelling it "Coherence" inverted its meaning on screen.
    out += statBlock('Heterodoxy', platformSpread(p.platform).toFixed(2), platformSpread(p.platform) > 1.3 ? 'warn' : 'good');
  } else if (G.screen === 'primary') {
    const pr = G.primary;
    out += statBlock('Contest', `${pr.index + 1}/${PRIMARY_CALENDAR.length}`);
    out += statBlock('Delegates', pr.delegates[p.id] || 0);
    out += statBlock('War Chest', money(pr.funds), pr.funds < 25 ? 'bad' : '');
    out += statBlock('Moves Left', pr.moves, pr.moves ? '' : 'warn');
    out += statBlock('Momentum', sgn(pr.momentum, 0), pr.momentum > 0 ? 'good' : pr.momentum < 0 ? 'bad' : '');
    out += statBlock('Negatives', Math.round(p.negatives), p.negatives > 12 ? 'bad' : p.negatives > 5 ? 'warn' : '');
  } else if (G.screen === 'general' || G.screen === 'night') {
    const gn = G.general;
    out += statBlock('Week', `${gn.week}/10`);
    out += statBlock('Days', gn.days, gn.days ? '' : 'warn');
    out += statBlock('Cash', money(gn.money), gn.money < 30 ? 'bad' : '');
    out += statBlock('Base', Math.round(p.baseMorale), p.baseMorale < 45 ? 'bad' : p.baseMorale > 62 ? 'good' : '');
    out += statBlock('Discipline', Math.round(p.traits.discipline), p.traits.discipline < 42 ? 'warn' : '');
    out += statBlock('Proj. EV', gn.proj ? gn.proj.evP : '—', gn.proj && gn.proj.evP >= 270 ? 'good' : 'bad');
  } else if ((G.screen === 'govern' || G.screen === 'bill') && G.gov && G.gov.congress) {
    const g = G.gov;
    out += statBlock('Quarter', `${g.term === 2 ? g.quarter - 16 : g.quarter}/16`,
      g.term === 2 ? 'warn' : '');
    out += statBlock('Weeks', `${g.weeks}/${QUARTER_WEEKS}`, g.weeks ? '' : 'warn');
    out += statBlock('Approval', Math.round(g.approval), g.approval >= 50 ? 'good' : g.approval < 42 ? 'bad' : 'warn');
    out += statBlock('Capital', Math.round(g.capital), g.capital >= 25 ? 'good' : g.capital < 10 ? 'bad' : '');
    if (g.camp) {
      out += statBlock('Proj. EV', g.camp.proj ? g.camp.proj.evP : '—',
        g.camp.proj && g.camp.proj.evP >= 270 ? 'good' : 'bad');
      out += statBlock('Camp. Cash', money(g.campFunds), g.campFunds < 30 ? 'bad' : '');
    }
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
  // The country, drifting, behind the title — the same tile grid the desk
  // calls states on, at a seventh of the opacity and no longer carrying data.
  let i = 0;
  const bg = TILE_MAP.map(row => `<div class="tb-row">${row.map(abbr => {
    if (!abbr) return '<i style="visibility:hidden"></i>';
    const st = STATE_BY_ABBR[abbr];
    i++;
    return `<i style="background:${marginColor(st.pvi / 130)};animation-delay:${(i % 17) * -0.9}s"></i>`;
  }).join('')}</div>`).join('');

  el.appendChild(h(`
    <div class="title-wrap fade-in">
      <div class="title-bg" aria-hidden="true">${bg}</div>
      <div class="title-screen">
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
        <div class="muted tiny" style="margin-top:26px;max-width:600px;margin-left:auto;margin-right:auto;line-height:1.75">
          Four acts: the platform, the primary, the general election, and the presidency.
          Everything you choose in act one is a liability or an asset in act four.
          Every choice is priced before you make it — what it costs you with the party,
          and what it costs you with the country.
        </div>
      </div>
    </div>`));
  el.querySelector('#start').onclick = () => { G.screen = 'setup'; render(); };
}

/* ==========================================================================
   2. SETUP
   ========================================================================== */
let _setup = { party: 'D', bg: 'gov', name: '', age: 54, home: 'PA', bio: ['smalltown'] };

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
            <div class="split-two">
              <div class="field"><label>Age on Inauguration Day</label>
                <input type="range" id="age" min="35" max="82" value="${_setup.age}" class="slider">
                <div id="ageRead" class="age-read"></div></div>
              <div class="field"><label>Home State <span class="muted">(worth about three points there)</span></label>
                <select id="home">${STATES.map(s =>
                  `<option value="${s.abbr}" ${_setup.home === s.abbr ? 'selected' : ''}>${esc(s.name)} — ${s.ev} EV</option>`).join('')}</select>
                <div id="homeRead" class="age-read"></div></div>
            </div>
            <div class="field"><label>Before Politics <span class="muted">(choose two)</span></label>
              <div class="bio-grid" id="bios"></div></div>
            <div class="field"><label>Random Seed <span class="muted">(same seed, same world)</span></label>
              <input type="text" id="seed" value="${G.seed || ''}" placeholder="leave blank for random"></div>
          </div>
          <div>
            <div class="field"><label>Background</label>
              <div class="card-grid" id="bgs"></div></div>
            <div class="field"><label>Who This Makes You</label>
              <div class="panel" style="margin:0"><div id="bioBars"></div></div></div>
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

  // biography — pick two
  const biow = el.querySelector('#bios');
  for (const b of BIO_TRAITS) {
    const on = _setup.bio.includes(b.id);
    const c = h(`<div class="bio ${on ? 'sel' : ''}" title="${esc(b.desc)}">
      <span class="bn">${esc(b.name)}</span>
      <span class="ba">${Object.entries(Object.assign({}, b.aff, b.anti || {}))
        .sort((x, y) => Math.abs(y[1]) - Math.abs(x[1])).slice(0, 2)
        .map(([id, v]) => `<i class="${v > 0 ? 'g' : 'r'}">${esc(BLOC_BY_ID[id].name)}</i>`).join('')}</span></div>`);
    c.onclick = () => {
      const at = _setup.bio.indexOf(b.id);
      if (at >= 0) _setup.bio.splice(at, 1);
      else if (_setup.bio.length < 2) _setup.bio.push(b.id);
      else { _setup.bio.shift(); _setup.bio.push(b.id); }
      render();
    };
    biow.appendChild(c);
  }

  // live read on what the biography and age are worth
  const drawBio = () => {
    const prof = ageProfile(_setup.age);
    const aff = bioAffinity(_setup.bio, _setup.age);
    el.querySelector('#ageRead').innerHTML =
      `<b>${_setup.age}</b> · gravitas ${sgn(prof.gravitas, 0)} · ${
        prof.scrutiny ? `<span class="a">${esc(prof.scrutiny)}</span>` : 'an unremarkable age for it'}`;
    const st = STATE_BY_ABBR[_setup.home];
    el.querySelector('#homeRead').innerHTML =
      `${esc(st.name)} · ${st.ev} EV · lean ${st.pvi > 0 ? 'D' : 'R'}+${Math.abs(st.pvi).toFixed(1)}`;
    const rows = Object.entries(aff).filter(([, v]) => Math.abs(v) > 0.01)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    el.querySelector('#bioBars').innerHTML = rows.length
      ? rows.map(([id, v]) => `<div class="drow"><span class="dk">${esc(BLOC_BY_ID[id].name)}</span>
          ${delta(v * 100, { dp: 0, dead: 0.5 })}</div>`).join('')
      : '<div class="muted small">Nothing that reads as a signal to anybody in particular.</div>';
  };
  drawBio();
  el.querySelector('#age').oninput = e => { _setup.age = +e.target.value; drawBio(); };
  el.querySelector('#home').onchange = e => { _setup.home = e.target.value; drawBio(); };

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

/* Everything the biography and the age are worth, as one affinity map. */
function bioAffinity(bioIds, age) {
  const out = {};
  const add = m => { for (const k in m) out[k] = (out[k] || 0) + m[k]; };
  for (const id of bioIds) { const b = BIO_BY_ID[id]; if (b) { add(b.aff); if (b.anti) add(b.anti); } }
  add(ageProfile(age).aff);
  return out;
}

/* The home state and, at a fraction of the value, the region around it. */
function homeOf(abbr) {
  const reg = REGION_OF[abbr];
  return { abbr, region: reg ? new Set(reg.states) : null, regionName: reg ? reg.name : '' };
}

function startCampaign() {
  const bg = BACKGROUNDS.find(b => b.id === _setup.bg);
  const party = PARTIES[_setup.party];
  const prof = ageProfile(_setup.age);
  G.player = {
    id: 'player',
    name: (_setup.name || 'Your Candidate').trim(),
    party, partyId: party.id,
    background: bg, perk: bg.perk,
    age: _setup.age,
    bio: _setup.bio.slice(),
    bioAff: bioAffinity(_setup.bio, _setup.age),
    home: homeOf(_setup.home),
    stamina: prof.stamina,
    traits: Object.assign({}, bg.traits),
    platform: seedPlatform(party),
    baseMorale: 55,
    bonusU: 0,
    veep: null,
    negatives: 0,
    debts: 0
  };
  // Biography and age move the personal traits as well as the affinities.
  for (const id of _setup.bio) {
    const b = BIO_BY_ID[id];
    if (b && b.traits) for (const k in b.traits) G.player.traits[k] = clamp(G.player.traits[k] + b.traits[k], 5, 99);
  }
  G.player.traits.gravitas = clamp(G.player.traits.gravitas + prof.gravitas, 5, 99);

  refreshCandidate(G.player);
  _usedNames.first.clear(); _usedNames.last.clear();
  G.field = buildField(party.id);
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
  const ctx = analysisCtx(p);
  const primW = ctx.primW, genOpp = ctx.opp;

  // Every alternative position, measured once. The chips on the cards, the
  // badges, and the hover panel all read from this, so the number the player
  // sees while deciding is the number the simulation will use.
  const analysis = {};
  for (const id of ISSUE_IDS) analysis[id] = stanceAnalysis(p, id, ctx);
  const now = measureCandidate(p, ctx);

  el.appendChild(h(`<div class="fade-in">
    <div class="callout">
      <b>The central tension.</b> The primary electorate is not the country. Every
      plank is scored twice — <span class="lg-p">P</span> is your standing with the people who
      pick your nominee, <span class="lg-g">G</span> is the margin in the state that decides
      November. When they disagree, that is the game. Three
      <span class="pill gold">signature</span> issues get 2.35× weight with voters and become
      the promises you are judged on in office.
    </div>
    <div class="split">
      <div class="panel" style="padding-top:0">
        <div class="panel-head"><h2>The Platform</h2>
          <span class="sub">Twelve axes, five stances each — hover any stance to price it</span></div>
        <div id="issues"></div>
      </div>
      <div class="rail">
        <div class="panel impact" id="impactPanel">
          <div class="panel-head"><h2>The Trade</h2><span class="sub" id="impactSub">hover a stance</span></div>
          <div id="impact"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Where You Stand</h2></div>
          <div class="kpi big">
            <div><span class="k">Primary Standing</span><span class="v" id="primScore">—</span></div>
            <div><span class="k">Tipping State</span><span class="v" id="tipVal">—</span></div>
            <div><span class="k">Base Morale</span><span class="v" id="baseM">—</span></div>
          </div>
          <div id="evbar" style="margin-top:13px"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Primary Electorate</h2><span class="sub">who nominates you</span></div>
          <div id="primBars"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>General Electorate</h2><span class="sub">vs. a generic opponent</span></div>
          <div id="genBars"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>The Field</h2><span class="sub">who you have to beat first</span></div>
          <div id="rivals"></div>
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
  ISSUES.forEach(iss => {
    const cur = p.platform.positions[iss.id];
    const isSig = p.platform.signature.includes(iss.id);
    const an = analysis[iss.id];
    const row = h(`<div class="issue">
      <div class="issue-head">
        <h4>${esc(iss.name)}</h4>
        <span class="axis">${esc(iss.axis)}</span>
        <span class="spacer"></span>
        <button class="sig-btn ${isSig ? 'on' : ''}" data-sig="${iss.id}">${isSig ? '◆ signature' : 'make signature'}</button>
      </div>
      <div class="stance-row">
        ${STANCES[iss.id].map((s, i) => {
          const a = an[i];
          const badge = a.bestPrimary && a.bestGeneral ? '<span class="sb both" title="Best available in both rooms">◆★</span>'
            : a.bestPrimary ? '<span class="sb p" title="Best available with primary voters">◆</span>'
            : a.bestGeneral ? '<span class="sb g" title="Best available in November">★</span>' : '';
          return `
          <div class="stance ${s.p === cur ? 'sel' : ''}" data-i="${iss.id}" data-p="${s.p}" data-k="${i}">
            <span class="pos">${sgn(s.p, 0)}</span>${badge}
            <div class="lbl">${esc(s.label)}</div>
            <div class="cost">${s.cost === 0 ? '—' : bn(s.cost) + '/yr'}</div>
            <div class="blurb">${esc(s.blurb)}</div>
            <div class="sdelta">${a.current
              ? '<span class="cur-tag">CURRENT</span>'
              : `<span class="dd">P ${delta(a.dPrim, { dead: 0.08 })}</span><span class="dd">G ${delta(a.dTip, { dead: 0.03, dp: 2 })}</span>`}</div>
          </div>`; }).join('')}
      </div></div>`);
    iw.appendChild(row);
  });

  // Hover pricing. The panel is written directly rather than through render()
  // so that moving across a row of stances does not rebuild the whole screen.
  const impact = el.querySelector('#impact');
  const impactSub = el.querySelector('#impactSub');
  const showImpact = (issId, k) => {
    const iss = ISSUES.find(i => i.id === issId);
    const a = analysis[issId][k];
    const st = STANCES[issId][k];
    impactSub.textContent = iss.short;
    impact.innerHTML = impactHtml(iss, st, a, p);
  };
  const idleImpact = () => {
    impactSub.textContent = 'hover a stance';
    impact.innerHTML = `<div class="impact-idle">
      <p>Move the cursor over any stance and this panel prices it: what it does to
      your standing in the primary, to the margin in the state that decides the
      general, to your own base, and to the budget.</p>
      <div class="legend-key">
        <span><i class="sb p">◆</i> best available with primary voters</span>
        <span><i class="sb g">★</i> best available in November</span>
      </div></div>`;
  };
  idleImpact();
  iw.querySelectorAll('.stance').forEach(s => {
    s.onmouseenter = () => showImpact(s.dataset.i, +s.dataset.k);
    s.onfocus = () => showImpact(s.dataset.i, +s.dataset.k);
    s.onclick = () => {
      p.platform.positions[s.dataset.i] = parseInt(s.dataset.p, 10);
      refreshCandidate(p);
      render();
    };
  });
  iw.onmouseleave = idleImpact;

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
  renderBlocBars(el.querySelector('#primBars'), p, ctx.rival, primW, { primary: true });
  renderBlocBars(el.querySelector('#genBars'), p, genOpp, ctx.natW);

  const ps = el.querySelector('#primScore');
  ps.textContent = sgn(now.prim, 0);
  ps.className = 'v ' + (now.prim > 0 ? 'g' : 'r');
  const tv = el.querySelector('#tipVal');
  tv.textContent = sgn(now.tip, 1);
  tv.className = 'v ' + (now.tip > 0 ? 'g' : 'r');
  tv.title = now.tipState;

  const morale = now.morale;
  const bm = el.querySelector('#baseM');
  bm.textContent = Math.round(morale);
  bm.className = 'v ' + (morale > 60 ? 'g' : morale < 45 ? 'r' : 'a');

  renderEvBar(el.querySelector('#evbar'), now.ev, 538 - now.ev, p.partyId);

  // the primary field, with a dossier behind each name
  const rw = el.querySelector('#rivals');
  for (const f of G.field) {
    const d = opponentDossier(p, f, { primary: true });
    const row = h(`<div class="rival-row">
      <div><div class="rn">${esc(f.name)}</div><div class="rr">${esc(f.role)}</div></div>
      <div class="rv">${delta(d.overall, { dp: 0, dead: 0.5, title: 'Your standing against them with primary voters' })}</div>
    </div>`);
    row.onclick = () => openDossier(f, { primary: true });
    rw.appendChild(row);
  }

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

/* The price of one stance, in the four currencies a candidate spends. */
function impactHtml(iss, st, a, p) {
  const v = stanceVerdict(a);
  if (a.current) {
    return `<div class="imp-head"><span class="imp-iss">${esc(iss.name)}</span>
        <div class="imp-lbl">${esc(st.label)}</div></div>
      <div class="verdict cur">This is where you stand now.</div>
      <div class="imp-blurb">${esc(st.blurb)}</div>`;
  }
  return `<div class="imp-head"><span class="imp-iss">${esc(iss.name)}</span>
      <div class="imp-lbl">${esc(st.label)}</div></div>
    <div class="verdict ${v.tone}">${esc(v.text)}</div>
    <div class="imp-rows">
      ${deltaRow('Primary standing', a.dPrim, { dp: 1, dead: 0.08 })}
      ${deltaRow('Margin in the tipping state', a.dTip, { dp: 2, dead: 0.02, unit: ' pts' })}
      ${deltaRow('Electoral votes', a.dEv, { dp: 0, dead: 0.5 })}
      ${deltaRow('Your own base', a.dMorale, { dp: 1, dead: 0.1 })}
      ${deltaRow('Annual cost', a.dCost, { dp: 0, dead: 1, unit: 'B', goodUp: false })}
    </div>
    ${a.blocs.length ? `<div class="imp-sec">Who moves</div>
      <div class="imp-list">${a.blocs.map(b =>
        `<div class="drow"><span class="dk">${esc(b.name)}</span>${delta(b.d, { dp: 1, dead: 0.05 })}</div>`).join('')}</div>` : ''}
    ${a.states.length ? `<div class="imp-sec">Where it lands</div>
      <div class="imp-list">${a.states.map(s =>
        `<div class="drow"><span class="dk">${esc(STATE_BY_ABBR[s.abbr].name)}
          <i class="ev-mini">${s.ev}</i>${s.flipped ? '<i class="flip">flips</i>' : ''}</span>${
          delta(s.d, { dp: 1, dead: 0.05 })}</div>`).join('')}</div>` : ''}
    <div class="imp-blurb">${esc(st.blurb)}</div>`;
}

/* ==========================================================================
   OPPONENT DOSSIERS
   A name and a one-line joke is a caricature. This is the file a campaign
   would actually keep: where they beat you, where you beat them, whose votes
   they are holding, and what they are going to spend the fall saying.
   ========================================================================== */
function openDossier(opp, opts) {
  opts = opts || {};
  const p = G.player;
  const d = opponentDossier(p, opp, opts);
  const room = opts.primary ? 'with primary voters' : 'with the country';

  const attacks = d.theirBest.length
    ? d.theirBest.map(c => `<li><b>${esc(c.issue.name)}</b> — they run on
        “${esc(c.theirLabel)}” against your “${esc(c.mineLabel)}”.
        <span class="mono r">${sgn(c.edge, 1)}</span></li>`).join('')
    : '<li class="muted">Nothing in their platform beats yours on its own merits.</li>';
  const yours = d.yourBest.length
    ? d.yourBest.map(c => `<li><b>${esc(c.issue.name)}</b> — your “${esc(c.mineLabel)}”
        against their “${esc(c.theirLabel)}”.
        <span class="mono g">${sgn(c.edge, 1)}</span></li>`).join('')
    : '<li class="muted">You have no clean contrast to draw. That is a problem.</li>';

  const html = `
    <div class="dos-top">
      <div>
        <div class="dos-role">${esc(opp.role || 'The Nominee')} · ${esc(opp.party.name)}</div>
        <div class="dos-blurb">${esc(opp.blurb || 'The other party settled on them, and the country will decide whether that was a mistake.')}</div>
        <div class="trait-row">
          ${['charisma', 'gravitas', 'authenticity', 'discipline'].map(t =>
            `<span class="trait">${t.slice(0, 4).toUpperCase()} ${Math.round(opp.traits[t])}</span>`).join('')}
          ${opp.funds !== undefined ? `<span class="trait">CASH $${Math.round(opp.funds)}M</span>` : ''}
          <span class="trait">CENTER ${sgn(d.center, 2)}</span>
          <span class="trait">SPREAD ${d.spread.toFixed(2)}</span>
        </div>
      </div>
      <div class="dos-score">
        <span class="k">You, head to head ${esc(room)}</span>
        <span class="v ${d.overall > 0 ? 'g' : 'r'}">${sgn(d.overall, 1)}</span>
      </div>
    </div>

    <div class="dos-grid">
      <div>
        <div class="dos-sec">Their best attack on you</div>
        <ul class="dos-list bad">${attacks}</ul>
        <div class="dos-sec">Your best contrast</div>
        <ul class="dos-list good">${yours}</ul>
      </div>
      <div>
        <div class="dos-sec">Whose votes they hold</div>
        <div id="dosBars"></div>
      </div>
    </div>

    <div class="dos-sec">Position by position</div>
    <div class="table-scroll"><table class="contrast"><thead><tr>
      <th>Issue</th><th>You</th><th>Them</th><th class="num">Who the room prefers</th>
    </tr></thead><tbody>
    ${d.contrast.slice().sort((a, b) => ISSUE_IDS.indexOf(a.issue.id) - ISSUE_IDS.indexOf(b.issue.id)).map(c => `
      <tr>
        <td>${esc(c.issue.short)}
          ${c.yourSignature ? '<span class="pill gold">yours</span>' : ''}
          ${c.theirSignature ? '<span class="pill red">theirs</span>' : ''}</td>
        <td class="small dim">${esc(c.mineLabel)}</td>
        <td class="small dim">${esc(c.theirLabel)}</td>
        <td class="num"><span class="edgebar"><i style="width:${Math.min(50, Math.abs(c.edge) * 14).toFixed(0)}%;
          ${c.edge > 0 ? 'left:50%' : 'right:50%'};background:${c.edge > 0 ? 'var(--green)' : 'var(--red)'}"></i>
          <b class="mid"></b></span>
          <span class="mono ${c.edge > 0 ? 'g' : 'r'}">${sgn(c.edge, 1)}</span></td>
      </tr>`).join('')}
    </tbody></table></div>
    <div class="tiny muted" style="margin-top:9px">Positive means the electorate in question sits closer to
      your position than to theirs, weighted by how much each bloc cares about that issue and by
      whichever of you is pushing it harder.</div>`;

  const sheet = showSheet(opp.name, 'Opposition File', html);
  renderBlocBars(sheet.querySelector('#dosBars'), p, opp,
    opts.primary ? primaryElectorate(p.partyId) : nationalWeights(), { primary: !!opts.primary });
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

/* ==========================================================================
   OPPONENT CONSTRUCTION
   ========================================================================== */

/* Rivals get real names as well as archetypes. "The Movement Senator" tells
   you what someone is for; a name is what you end up arguing with. */
const FIRST_NAMES = ['Marguerite', 'Desmond', 'Corinne', 'Ellis', 'Priya', 'Rafael', 'Odessa',
  'Whitfield', 'Ingrid', 'Camille', 'Barrett', 'Nadia', 'Sterling', 'Junie', 'Amara',
  'Rowan', 'Delphine', 'Augustus', 'Marisol', 'Everett', 'Thea', 'Lionel'];
const LAST_NAMES = ['Okafor', 'Brandt', 'Salazar', 'Whitmore', 'Duvall', 'Castellano', 'Reyes',
  'Ashworth', 'Nakamura', 'Boudreaux', 'Kilgore', 'Vance', 'Mbeki', 'Thorne', 'Alcott',
  'Ferreira', 'Hollingsworth', 'Quintero', 'Bramble', 'Osei', 'Lindqvist', 'Marchetti'];

/* Names are drawn without replacement across a playthrough. Drawing them
   independently produced fields containing both a Sen. Mbeki and a Rep.
   Mbeki, which reads as a bug in a standings table however plausible it is
   in life. */
const _usedNames = { first: new Set(), last: new Set() };
function personName() {
  let first, last, n = 0;
  do { first = pick(FIRST_NAMES); } while (_usedNames.first.has(first) && ++n < 40);
  n = 0;
  do { last = pick(LAST_NAMES); } while (_usedNames.last.has(last) && ++n < 40);
  _usedNames.first.add(first); _usedNames.last.add(last);
  return first + ' ' + last;
}

/* The honorific each lane would actually be carrying. */
const LANE_TITLE = {
  establishment: 'Vice President', left: 'Sen.', labor: 'Rep.', moderate: 'Gov.',
  religious: 'Sen.', libertarian: 'Rep.'
};

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
  const person = personName();
  return makeCandidate({
    id: arch.name, name: `${LANE_TITLE[arch.lane] || 'Gov.'} ${person}`, role: arch.name,
    partyId, platform: pf, blurb: arch.blurb,
    funds: arch.funds, lane: arch.lane, organization: 20 + rnd() * 25, momentum: 0,
    traits: Object.assign({ discipline: 55, money: 55, legislative: 55 }, arch.traits)
  });
}

/* Build the primary field exactly once per playthrough. It is generated from
   the seeded stream, so creating it lazily — as the platform screen used to,
   once per redraw — both moved the yardstick under the player mid-decision
   and made the rest of the world depend on how many times they had clicked. */
function buildField(partyId) {
  return RIVAL_ARCHETYPES[partyId].map(a => archetypeCandidate(partyId, a));
}

function fieldName(id) {
  if (id === 'player') return G.player.name;
  const f = (G.field || []).find(x => x.id === id);
  return f ? f.name : id;
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
  const field = G.field;
  const startFunds = 55 + (p.traits.money - 50) * 1.4 + (p.perk === 'selffund' ? 180 : 0);

  G.primary = {
    index: 0, moves: 3, funds: Math.round(startFunds),
    momentum: 0, organization: 15, spend: 0, negatives: 0,
    delegates: Object.fromEntries([['player', 0], ...field.map(f => [f.id, 0])]),
    field, allocated: 0, results: [], dropped: []
  };
  G.player.id = 'player';
  G.player.organization = 15;
  // The platform is locked; from here morale is something that happens to you.
  G.player.moraleFromPlatform = false;
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
    ${tickerBar([
      ['Contest', esc(contest.name)],
      ['Week', contest.week],
      ['Delegates', contest.delegates],
      ['Your total', pr.delegates[p.id] || 0],
      ['Read', esc(contest.note)]
    ], 'Primary')}
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
    const d = opponentDossier(p, f, { primary: true });
    const worst = d.theirBest[0];
    const card = h(`<div class="card rival ${out ? 'out' : ''}">
      <h4>${esc(f.name)} ${out ? '<span class="pill red">withdrawn</span>' : ''}</h4>
      <div class="role">${esc(f.role)}</div>
      <div class="desc">${esc(f.blurb)}</div>
      <div class="hh">
        <span class="k">Head to head</span>
        ${delta(d.overall, { dp: 1, dead: 0.3 })}
      </div>
      ${worst && !out ? `<div class="threat">Runs at you on <b>${esc(worst.issue.short)}</b></div>` : ''}
      <div class="trait-row">
        <span class="trait">CENTER ${sgn(platformCenter(f.platform), 1)}</span>
        <span class="trait">CASH $${Math.round(f.funds)}M</span>
        <span class="trait">MOM ${sgn(f.momentum, 0)}</span>
        <span class="trait">DEL ${pr.delegates[f.id] || 0}</span>
      </div>
      <div class="card-cta">Open the file →</div></div>`);
    card.onclick = () => openDossier(f, { primary: true });
    fw.appendChild(card);
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
    case 'contrast': { pr.spend += 12; p.negatives += 6;
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

  // Anything said in a donor room eventually gets played back.
  if (p.leakRisk && rnd() < p.leakRisk * 0.28) {
    p.leakRisk = 0;
    p.baseMorale = clamp(p.baseMorale - 7, 10, 95);
    p.negatives += 5;
    refreshCandidate(p);
    await showModal({
      kicker: 'The Tape', title: 'Someone Was Recording',
      text: 'Ninety seconds of you in a ballroom, explaining to donors what you privately think of the position you ran on, is now the top story on three networks. Your own volunteers are the ones sending it to each other.',
      choices: [{ label: 'Issue a statement' }]
    });
    logMsg('The donor-room tape leaks. Your base has heard it.', 'bad', 'THE TAPE');
  }

  // Event
  if (rnd() < 0.62) await primaryEvent();

  if (pr.index >= PRIMARY_CALENDAR.length) return resolveNomination();
  render();
}

async function primaryEvent() {
  const p = G.player;
  const ev = pick(CAMPAIGN_EVENTS);
  const iss = pick(ISSUES.filter(i => p.platform.signature.includes(i.id)).concat(ISSUES)).name;
  const idx = await showModal({
    kicker: 'On the Trail', title: ev.title,
    text: esc(ev.text.replace('{ISSUE}', iss)),
    choices: ev.choices.map(c => ({ label: c.label, tags: effectTags(effectSummary(c.eff, 'campaign')) }))
  });
  applyCampaignEffect(ev.choices[idx].eff, 'primary');
  logMsg(`${ev.title}: you chose "${ev.choices[idx].label}".`, '', 'TRAIL');
}

/* One place where a campaign event's effects are applied, so the primary and
   the general cannot drift apart on what the same choice means — and so that
   every key the interface promises the player is a key something reads.
   An effect nobody applies is worse than an effect nobody shows. */
function applyCampaignEffect(e, phase) {
  const p = G.player, pr = G.primary, gn = G.general;
  if (e.momentum) {
    if (phase === 'primary') pr.momentum += e.momentum;
    else p.bonusU += e.momentum * 0.010;
  }
  if (e.money) { if (phase === 'primary') pr.funds += e.money; else gn.money += e.money; }
  if (e.base) p.baseMorale = clamp(p.baseMorale + e.base, 10, 95);
  if (e.suburb) p.bonusU += e.suburb * 0.004;
  if (e.authenticity) p.traits.authenticity = clamp(p.traits.authenticity + e.authenticity, 5, 99);
  if (e.negatives) p.negatives = Math.max(0, p.negatives + e.negatives);
  // A gaffe cleaned up and a debate played straight are the same skill.
  const disc = (e.discipline || 0) + (e.coherence || 0);
  if (disc) p.traits.discipline = clamp(p.traits.discipline + disc, 5, 99);
  if (e.media) {
    if (phase === 'primary') pr.spend += e.media * 8;
    else gn.efforts[gn.target].persuade += e.media * 6;
  }
  if (e.debt) p.debts += e.debt;          // collected on inauguration day
  if (e.leak) p.leakRisk = (p.leakRisk || 0) + e.leak;
  refreshCandidate(p);
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
  return primaryLoss(`${fieldName(all[0][0])} takes the nomination with ${all[0][1]} delegates to your ${mine}.`);
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
  opp.name = (oppParty === 'D' ? 'Gov. ' : 'Sen. ') + personName();
  opp.role = 'The Opposition Nominee';
  // They are from somewhere too, and it is worth the same to them.
  const oppHome = pick(STATES.filter(s => s.ev >= 6 && s.abbr !== p.home.abbr));
  opp.home = homeOf(oppHome.abbr);
  opp.age = Math.round(rndRange(48, 71));
  opp.bioAff = bioAffinity([pick(BIO_TRAITS).id], opp.age);
  refreshCandidate(opp);
  opp.blurb = oppParty === 'D'
    ? 'Came out of a bruising primary with the coalition mostly intact and a pollster who reads the same numbers you do.'
    : 'Won the nomination by consolidating early, and has spent every week since testing which of your positions is the softest.';
  // Record where they were before they went looking for the ground you left
  // open, so the player can be shown what the other campaign decided to do.
  const opening = Object.assign({}, opp.platform.positions);
  optimizeOpponent(opp, p, env, 3);
  opp.moves = ISSUE_IDS.filter(id => opp.platform.positions[id] !== opening[id])
    .map(id => ({ id, from: opening[id], to: opp.platform.positions[id] }));

  // A primary spent driving up everyone's negatives, including your own,
  // does not end at the convention.
  if (p.negatives) {
    p.bonusU -= p.negatives * 0.0022;
    refreshCandidate(p);
    logMsg(`You enter the general with ${Math.round(p.negatives)} points of accumulated negatives.`,
      p.negatives > 12 ? 'bad' : '', 'CONVENTION');
  }

  G.opp = opp; G.env = env;
  G.general = {
    week: 1, days: 5,
    money: Math.round(160 + G.primary.funds * 0.5 + (p.traits.money - 50) * 2),
    efforts: {}, target: 'PA', proj: null, oppEfforts: {}, eventsDone: [], history: []
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
  const battle = proj.states.slice().sort((a, b) => Math.abs(a.margin) - Math.abs(b.margin)).slice(0, 14);
  const elast = stateElasticities(p, G.opp, G.env, gn.efforts);
  const baseline = genericBaseline(p.partyId);
  const regions = regionSummary(proj.states, p.partyId);
  const tgt = stateProfile(gn.target, p, G.opp, G.env, gn.efforts, elast);
  const oppD = opponentDossier(p, G.opp, {});

  el.appendChild(h(`<div class="fade-in">
    ${tickerBar([
      ['Week', `${gn.week} of 10`],
      ['Matchup', `${esc(p.name)} (${p.party.id}) v. ${esc(G.opp.name)} (${G.opp.party.id})`],
      ['Tipping point', `${esc(proj.tipping.name)} ${sgn(proj.tipping.margin * 100, 1)}`,
        proj.tipping.margin > 0 ? 'g' : 'r'],
      ['College bias', biasLabel()],
      ['Environment', envLabel()]
    ], 'Live')}
    <div class="split">
      <div>
        <div class="panel">
          <div class="panel-head"><h2>The Map</h2><span class="spacer"></span>
            <span class="sub">Click a state to target it and open its file</span></div>
          <div id="map"></div>
          <div id="ev" style="margin-top:14px"></div>
          <div class="region-strip" id="regions"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Deploy the Campaign</h2>
            <span class="spacer"></span>
            <span class="sub">in ${esc(tgt.st.name)} · every figure is the margin it buys there</span></div>
          <div id="actions"></div>
          <div class="btn-row" style="margin-top:12px;border-top:1px solid var(--line);padding-top:13px">
            <button class="btn primary" id="endweek">End Week ${gn.week} →</button>
            <span class="muted small">${gn.days} day${gn.days === 1 ? '' : 's'} · ${money(gn.money)} on hand</span>
          </div>
        </div>
      </div>
      <div class="rail">
        <div class="panel statefile">
          <div class="panel-head"><h2>State File</h2><span class="spacer"></span>
            <span class="sub">${esc(tgt.region.name)}</span></div>
          <div id="sfile"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>The Opposition</h2><span class="spacer"></span>
            <span class="sub">${esc(G.opp.name)}</span></div>
          <div id="oppbox"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Battlegrounds</h2><span class="sub">closest fourteen</span></div>
          <div class="results-scroll"><table><thead><tr>
            <th>State</th><th class="num">EV</th><th class="num">Margin</th>
            <th class="num" title="How far this state moves when the country moves a point">Elas.</th>
            <th class="num">Spent</th></tr></thead>
            <tbody id="battle"></tbody></table></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>The Path to 270</h2><span class="sub">cheapest first</span></div>
          <div id="path"></div>
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

  // Order every state by how safe it is for you and walk the running total up
  // to 270. Where the line falls is the tipping point; everything above it is
  // the campaign you are actually running, and everything below it is a state
  // you are spending money on for reasons you should be able to name.
  const path = proj.states.slice().sort((a, b) => b.margin - a.margin);
  let acc = 0, crossed = false;
  el.querySelector('#path').innerHTML = `<div class="path-list">${path.map(s => {
    const before = acc; acc += s.ev;
    const isCross = !crossed && acc >= 270;
    if (isCross) crossed = true;
    if (before > 300) return '';
    return `<div class="path-row ${isCross ? 'cross' : ''} ${s.margin > 0 ? 'won' : 'lost'}"
        data-a="${s.abbr}" title="${esc(s.name)}">
      <span class="pn">${esc(s.name)}</span>
      <span class="pm mono ${s.margin > 0 ? 'g' : 'r'}">${sgn(s.margin * 100, 1)}</span>
      <span class="pc mono">${acc}</span>
    </div>${isCross ? '<div class="path-line"><i></i><b>270</b><i></i></div>' : ''}`;
  }).join('')}</div>
  <div class="tiny muted" style="margin-top:9px">You are at <b class="mono">${proj.evP}</b>.
    ${proj.evP >= 270
      ? `The line rests on <b>${esc(proj.tipping.name)}</b> — that is the state you cannot afford to lose.`
      : `You need <b class="mono">${270 - proj.evP}</b> more, and the cheapest are the ones just below the line.`}</div>`;
  el.querySelectorAll('#path .path-row').forEach(r =>
    r.onclick = () => { gn.target = r.dataset.a; render(); });

  renderMap(el.querySelector('#map'), proj.states, {
    playerParty: p.partyId, target: gn.target, efforts: gn.efforts,
    baseline, elasticity: elast,
    onClick: abbr => { gn.target = abbr; render(); }
  });
  renderEvBar(el.querySelector('#ev'), proj.evP, proj.evO, p.partyId);

  // regional strip — where the map is actually being won and lost
  el.querySelector('#regions').innerHTML = regions.map(r => `
    <div class="reg" title="${esc(r.reg.name)}: ${r.evP} EV yours, ${r.evO} theirs">
      <span class="rn">${esc(r.reg.name)}</span>
      <span class="rb"><i style="width:${(r.evP / (r.evP + r.evO) * 100).toFixed(0)}%;
        background:${p.partyId === 'D' ? 'var(--dem)' : 'var(--gop)'}"></i></span>
      <span class="rv mono">${r.evP}<i>–${r.evO}</i></span>
      ${r.close ? `<span class="rc">${r.close} close</span>` : ''}
    </div>`).join('');

  // state file, with the posture this state is being contested under
  const eff0 = gn.efforts[gn.target];
  el.querySelector('#sfile').innerHTML = stateFileHtml(tgt) + `
    <div class="posture">
      <div class="imp-sec" style="margin-top:0">Plan of attack here</div>
      <div class="posture-row">${POSTURE_LIST.map(ps =>
        `<button class="pbtn ${(eff0.posture || 'balanced') === ps.id ? 'on' : ''}" data-pos="${ps.id}"
          title="${esc(ps.blurb)}">${esc(ps.name)}</button>`).join('')}</div>
      <div class="tiny muted" id="postureNote">${esc((POSTURES[eff0.posture || 'balanced']).blurb)}</div>
      ${Object.keys(eff0.bloc || {}).length ? `<div class="imp-sec">Aimed at</div>
        <div class="imp-list">${Object.entries(eff0.bloc).map(([id, v]) =>
          `<div class="drow"><span class="dk">${esc(BLOC_BY_ID[id].name)}</span>
            <span class="mono">${Math.round(v)}</span></div>`).join('')}</div>` : ''}
    </div>`;
  const full = el.querySelector('#sfile .full-file');
  if (full) full.onclick = () => openStateFile(gn.target, tgt);
  el.querySelectorAll('#sfile .pbtn').forEach(b => b.onclick = () => {
    gn.efforts[gn.target].posture = b.dataset.pos;
    updateProjection(); render();
  });

  // opposition summary
  const ob = el.querySelector('#oppbox');
  const worst = oppD.theirBest[0];
  ob.innerHTML = `
    <div class="opp-line"><span class="k">You, head to head</span>${delta(oppD.overall, { dp: 1, dead: 0.2 })}</div>
    <div class="opp-line"><span class="k">Their platform center</span><span class="mono">${sgn(oppD.center, 2)}</span></div>
    ${worst ? `<div class="opp-attack">Running at you on <b>${esc(worst.issue.name)}</b> —
      “${esc(worst.theirLabel)}” <span class="mono r">${sgn(worst.edge, 1)}</span></div>` : ''}
    ${G.opp.moves && G.opp.moves.length ? `<div class="opp-moves">Since the convention they have moved on
      ${G.opp.moves.map(m => `<b>${esc(ISSUES.find(i => i.id === m.id).short)}</b>`).join(', ')}.</div>` : ''}
    <button class="btn sm" id="oppfile" style="margin-top:9px;width:100%">Open the opposition file →</button>`;
  el.querySelector('#oppfile').onclick = () => openDossier(G.opp, {});

  const aw = el.querySelector('#actions');
  let lastGrp = null;
  for (const a of CAMPAIGN_ACTIONS) {
    const ok = gn.money >= a.cost && gn.days >= a.days;
    const pv = campaignActionPreview(a, gn.target);
    if (a.group !== lastGrp) { lastGrp = a.group; aw.appendChild(h(`<div class="act-group">${esc(a.group)}</div>`)); }
    const row = h(`<div class="prov act ${ok ? '' : 'stripped'}">
      <div><div class="nm">${esc(a.name)}${a.picksBloc ? ' <span class="pill">pick a bloc</span>' : ''}</div>
        <div class="note">${esc(a.desc)}</div>
        ${a.backfire ? `<div class="blocked">${Math.round(a.backfire * 100)}% chance it becomes the story instead.</div>` : ''}</div>
      <div class="gain">${pv.note ? `<span class="muted tiny">${esc(pv.note)}</span>`
        : `${pv.prefix ? `<span class="per">${esc(pv.prefix)}${pv.best ? ': ' + esc(BLOC_BY_ID[pv.best].name) : ''}</span>` : ''}
           ${delta(pv.pts, { dp: 2, dead: 0.005, unit: ' pts' })}
           ${pv.perDollar ? `<span class="per">${(pv.perDollar * 100).toFixed(2)} per $10M</span>` : ''}`}</div>
      <div class="fig">${a.cost ? '−' + money(a.cost) : '<span class="g">+cash</span>'}<br>
        <span class="muted tiny">${a.days ? a.days + ' day' + (a.days > 1 ? 's' : '') : 'no days'}</span></div></div>`);
    if (ok) row.onclick = () => doCampaignAction(a);
    aw.appendChild(row);
  }

  const bt = el.querySelector('#battle');
  for (const s of battle) {
    const e = gn.efforts[s.abbr];
    const spent = Math.round(e.persuade + e.ground + e.digital);
    const el2 = elast[s.abbr] || 1;
    bt.appendChild(h(`<tr class="${gn.target === s.abbr ? 'on' : ''}" data-a="${s.abbr}">
      <td>${esc(s.name)}${gn.target === s.abbr ? ' <span class="pill gold">target</span>' : ''}</td>
      <td class="num">${s.ev}</td>
      <td class="num ${s.margin > 0 ? 'g' : 'r'}">${sgn(s.margin * 100, 1)}</td>
      <td class="num ${el2 > 1.15 ? 'a' : ''}">${el2.toFixed(2)}</td>
      <td class="num muted">${spent || '—'}</td></tr>`));
  }
  bt.querySelectorAll('tr').forEach(tr => tr.onclick = () => { gn.target = tr.dataset.a; render(); });

  renderBlocBars(el.querySelector('#gbars'), p, G.opp, nationalWeights());
  renderLog(el.querySelector('#log'));
  el.querySelector('#endweek').onclick = () => endCampaignWeek();
}

/* Two generic nominees on the current map: the yardstick every "you are
   running ahead of / behind where a normal candidate would be" figure uses. */
function genericBaseline(partyId, env) {
  const gP = GENERIC[partyId], gO = GENERIC[partyId === 'D' ? 'R' : 'D'];
  const e = env || G.env;
  const out = {};
  for (const st of STATES) out[st.abbr] = stateResult(st, gP, gO, e, null).margin;
  return out;
}

/* ==========================================================================
   STATE FILES
   A state is not a coloured square with a number on it. It has a lean it
   arrived with, a swing you are responsible for, an elasticity that decides
   whether money spent here does anything, and a handful of blocs that
   actually decide it.
   ========================================================================== */
function stateFileHtml(t) {
  const top = t.blocs.slice(0, 3);
  const bottom = t.blocs.slice(-2).reverse();
  return `
    <div class="sf-head">
      <div><div class="sf-name">${esc(t.st.name)}</div>
        <div class="sf-sub">${t.st.ev} electoral votes · ${esc(t.region.name)}</div></div>
      <div class="sf-margin ${t.margin > 0 ? 'g' : 'r'}">${sgn(t.margin, 1)}</div>
    </div>
    <div class="sf-lean">${esc(leanLabel(t.margin))}</div>
    <div class="imp-rows">
      ${deltaRow('vs. a generic nominee', t.swing, { dp: 1, dead: 0.1, unit: ' pts',
        title: 'How far your platform and your campaign have moved this state off its baseline' })}
      <div class="drow"><span class="dk">Elasticity</span>
        <span class="mono ${t.elasticity > 1.15 ? 'a' : t.elasticity < 0.85 ? 'muted' : ''}">${
          t.elasticity.toFixed(2)}× — ${t.elasticity > 1.15 ? 'swings hard'
            : t.elasticity < 0.85 ? 'barely moves' : 'average'}</span></div>
      <div class="drow"><span class="dk">Invested here</span>
        <span class="mono">${t.spent || '—'}</span></div>
      <div class="drow"><span class="dk">One more broadcast buy</span>
        ${delta(t.adValue, { dp: 2, dead: 0.005, unit: ' pts' })}</div>
    </div>
    <div class="imp-sec">Who is carrying you here</div>
    <div class="imp-list">${top.map(b => `<div class="drow"><span class="dk">${esc(b.name)}
      <i class="ev-mini">${(b.size * 100).toFixed(0)}%</i></span>
      <span class="mono g">+${(b.net * 100).toFixed(1)}</span></div>`).join('')}</div>
    <div class="imp-sec">Who is costing you</div>
    <div class="imp-list">${bottom.map(b => `<div class="drow"><span class="dk">${esc(b.name)}
      <i class="ev-mini">${(b.size * 100).toFixed(0)}%</i></span>
      <span class="mono r">${(b.net * 100).toFixed(1)}</span></div>`).join('')}</div>
    <button class="btn sm full-file" style="margin-top:11px;width:100%">Open the full state file →</button>`;
}

const DEMO_LABELS = [
  ['urban', 'Urban & suburban'], ['college', 'College-educated'], ['evangelical', 'Evangelical'],
  ['union', 'Union household'], ['black', 'Black'], ['hispanic', 'Hispanic'],
  ['senior', '65 and over'], ['veteran', 'Veteran']
];

function openStateFile(abbr, t) {
  const st = t.st;
  const html = `
    <div class="dos-top">
      <div>
        <div class="dos-role">${esc(t.region.name)} · ${st.ev} electoral votes</div>
        <div class="dos-blurb">Prior lean <b>${st.pvi > 0 ? 'D' : 'R'}+${Math.abs(st.pvi).toFixed(1)}</b>
          relative to the country. You are currently running
          <b class="${t.swing > 0 ? 'g' : 'r'}">${sgn(t.swing, 1)}</b> against what a generic
          ${G.player.party.name} would do here, and the state as a whole is
          <b>${esc(leanLabel(t.margin))}</b>.</div>
      </div>
      <div class="dos-score">
        <span class="k">Your margin</span>
        <span class="v ${t.margin > 0 ? 'g' : 'r'}">${sgn(t.margin, 1)}</span>
      </div>
    </div>
    <div class="dos-grid">
      <div>
        <div class="dos-sec">Who lives here</div>
        <div class="demo">${DEMO_LABELS.map(([k, label]) => `
          <div class="demo-row"><span class="dl">${esc(label)}</span>
            <span class="db"><i style="width:${Math.min(100, st[k])}%"></i></span>
            <span class="dv mono">${st[k]}%</span></div>`).join('')}</div>
      </div>
      <div>
        <div class="dos-sec">Every bloc, and what it is worth to you</div>
        <div class="table-scroll" style="max-height:260px"><table><thead><tr>
          <th>Bloc</th><th class="num">Share</th><th class="num">You</th><th class="num">Net</th>
        </tr></thead><tbody>
        ${t.blocs.map(b => `<tr>
          <td>${esc(b.name)}</td>
          <td class="num muted">${(b.size * 100).toFixed(1)}%</td>
          <td class="num ${b.share > .5 ? 'g' : 'r'}">${(b.share * 100).toFixed(0)}%</td>
          <td class="num ${b.net > 0 ? 'g' : 'r'}">${sgn(b.net * 100, 1)}</td>
        </tr>`).join('')}
        </tbody></table></div>
      </div>
    </div>
    <div class="dos-sec">What money does here</div>
    <div class="sf-money">
      <div><span class="k">Elasticity</span><span class="v">${t.elasticity.toFixed(2)}×</span>
        <span class="n">${t.elasticity > 1.15
          ? 'Weakly sorted and genuinely persuadable. A national wave lands here first, and so does an ad buy.'
          : t.elasticity < 0.85
          ? 'Everyone here has already decided. Money spent persuading is mostly wasted; turnout is the only lever.'
          : 'Moves about as much as the country does.'}</span></div>
      <div><span class="k">Already invested</span><span class="v">${t.spent || 0}</span>
        <span class="n">${t.spent > 60 ? 'Saturated. The next dollar is worth much less than the first.'
          : t.spent ? 'Some presence on the ground.' : 'You have not spent a dollar here.'}</span></div>
      <div><span class="k">Next broadcast buy</span><span class="v">${sgn(t.adValue, 2)}</span>
        <span class="n">What $22M of television would move the margin, at the current level of saturation.</span></div>
    </div>`;
  showSheet(st.name, 'State File', html);
}

async function doCampaignAction(a) {
  const gn = G.general, p = G.player;
  const t = gn.target;

  // The buys that pick a bloc ask which one, and show what each is worth here
  // before you commit: its size in this state, and how close it currently is.
  let blocId = null;
  if (a.picksBloc) {
    const prof = stateProfile(t, p, G.opp, G.env, gn.efforts, null);
    const ranked = prof.blocs.slice().sort((x, y) => y.size - x.size);
    const idx = await showModal({
      kicker: a.id === 'attack' ? 'Negative Targeting' : 'Audience', title: `Which Bloc, in ${STATE_BY_ABBR[t].name}?`,
      text: a.id === 'attack'
        ? 'Money aimed at one group is worth far more per dollar than money sprayed at a state. A negative buy works best where they are currently winning — you are not persuading, you are dampening.'
        : 'Money aimed at one group is worth far more per dollar than money sprayed at a state, and worth nothing at all if you pick a bloc that is small here or has already made up its mind.',
      choices: ranked.map(b => ({
        label: b.name,
        hint: `${(b.size * 100).toFixed(1)}% of this state · you are at ${(b.share * 100).toFixed(0)}%` +
              ` · ${Math.abs(b.share - .5) < .08 ? 'genuinely up for grabs' : b.share > .5 ? 'already yours' : 'theirs for now'}`
      })).concat([{ label: 'Never mind' }])
    });
    if (idx >= ranked.length) return;
    blocId = ranked[idx].id;
  }

  gn.money -= a.cost; gn.days -= a.days;
  const eff = gn.efforts[t];
  const comp = p.perk === 'executive' ? 1.1 : 1;
  if (!eff.bloc) eff.bloc = {};
  const bumpBloc = (id, v) => { eff.bloc[id] = (eff.bloc[id] || 0) + v; };

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

    case 'target':   bumpBloc(blocId, 22 * comp);
                     logMsg(`$13M aimed squarely at ${BLOC_BY_ID[blocId].name} in ${STATE_BY_ABBR[t].name}.`, 'good', `WEEK ${gn.week}`); break;

    case 'attack': { // Dampening rather than persuading: it pulls them down
                     // more than it pulls you up, and it costs you your own.
                     bumpBloc(blocId, 15 * comp);
                     G.opp.bonusU -= 0.030; refreshCandidate(G.opp);
                     p.baseMorale = clamp(p.baseMorale - 2, 10, 95);
                     p.negatives += 4;
                     logMsg(`A negative campaign against ${G.opp.name} runs on every screen ${BLOC_BY_ID[blocId].name} in ${STATE_BY_ABBR[t].name} own.`, '', `WEEK ${gn.week}`); break; }

    case 'bracket':  eff.persuade += 10;
                     G.opp.bonusU -= 0.012; refreshCandidate(G.opp);
                     gn.bracketed = (gn.bracketed || 0) + 1;
                     logMsg(`You land in ${STATE_BY_ABBR[t].name} the same morning they do and take half the coverage.`, 'good', `WEEK ${gn.week}`); break;

    case 'forceMap': { // Their money has to come from somewhere.
                     const safe = gn.proj.states.filter(s => !s.won && s.margin < -0.06 && s.margin > -0.20)
                       .sort((x, y) => y.ev - x.ev)[0];
                     if (safe) {
                       gn.efforts[safe.abbr].persuade += 9;
                       gn.forced = (gn.forced || 0) + 1;
                       // pull their spending out of the closest battleground
                       const tight = gn.proj.states.slice()
                         .sort((x, y) => Math.abs(x.margin) - Math.abs(y.margin))[0];
                       if (tight) gn.efforts[tight.abbr].persuade += 11;
                       logMsg(`You go up on air in ${safe.name}. They pull out of ${tight ? tight.name : 'a battleground'} to answer it.`, 'good', `WEEK ${gn.week}`);
                     } else {
                       gn.money += a.cost;
                       logMsg('There is no state of theirs soft enough to be worth the feint.', 'bad', `WEEK ${gn.week}`);
                     }
                     break; }

    case 'debatePrep': gn.debatePrep = (gn.debatePrep || 0) + 1;
                     logMsg('Two days in a hotel ballroom with someone playing them. It will show.', '', `WEEK ${gn.week}`); break;
  }

  // Going negative is not free. Sometimes the story becomes the attack.
  if (a.backfire && rnd() < a.backfire) {
    p.baseMorale = clamp(p.baseMorale - 3, 10, 95);
    p.negatives += 5;
    p.bonusU -= 0.014;
    logMsg('The attack becomes the story. Your own numbers take the hit instead.', 'bad', `WEEK ${gn.week}`);
  }

  if (p.perk === 'media' && a.cost > 0) eff.persuade += 5;
  refreshCandidate(p);
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
    // A state you have dug into absorbs most of what they throw at it.
    const blunt = (POSTURES[e.posture || 'balanced'] || POSTURES.balanced).blunt || 1;
    e.persuade -= (7 + rnd() * 6) * blunt;   // opposition spending nets against yours
  }

  // Base morale decays unless fed. A disciplined campaign bleeds it slower:
  // fewer unforced errors to explain to your own people every week.
  const decay = (p.perk === 'movement' ? 0.6 : 1.6) * (1 - (p.traits.discipline - 50) / 200);
  p.baseMorale = clamp(p.baseMorale - decay, 10, 95);

  gn.history.push({ week: gn.week, ev: gn.proj.evP, tip: gn.proj.tipping.margin * 100 });
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
    choices: ev.choices.map(c => ({ label: c.label, tags: effectTags(effectSummary(c.eff, 'campaign')) }))
  });
  const e = ev.choices[idx].eff;
  applyCampaignEffect(e, 'general');
  if (e.negatives) { G.opp.bonusU -= 0.02; refreshCandidate(G.opp); }
  logMsg(`${ev.title} — "${ev.choices[idx].label}"`, '', `WEEK ${gn.week}`);
}

/* ==========================================================================
   7. ELECTION NIGHT
   ========================================================================== */
function runElectionNight() {
  const result = runGeneralElection(G.player, G.opp, G.env, G.general.efforts);
  G.general.result = result;
  G.general.called = [];
  G.general.baseline = genericBaseline(G.player.partyId);
  orderTheNight(result);
  G.screen = 'night';
  render();
  stepNight();
}

/* The order the desk calls them in, which is the entire source of the drama.
   Safe states go first, east to west, because that is when they close and
   because they are not in doubt. Everything genuinely close is held back and
   run from least close to most, so the state that decides it is the last one
   on the board rather than an accident of longitude. */
function orderTheNight(result) {
  const col = {};
  TILE_MAP.forEach(row => row.forEach((a, i) => { if (a) col[a] = i; }));
  const close = s => Math.abs(s.margin) * 100;
  const safe = result.states.filter(s => close(s) >= 6.5)
    .sort((a, b) => (col[b.abbr] - col[a.abbr]) || (rnd() - 0.5));
  const tight = result.states.filter(s => close(s) < 6.5)
    .sort((a, b) => close(b) - close(a));
  result.order = safe.concat(tight);
  result.safeCount = safe.length;

  // Which call actually crosses 270 — the desk holds its breath for that one.
  let ev = 0, evO = 0;
  result.decisive = null;
  for (const s of result.order) {
    if (s.won) ev += s.ev; else evO += s.ev;
    if (!result.decisive && (ev >= 270 || evO >= 270)) result.decisive = s.abbr;
  }
}

/* How long the desk sits on a call before making it. */
function nightDelay(s, idx, r) {
  if (s.abbr === r.decisive) return 2100;
  const c = Math.abs(s.margin) * 100;
  if (c < 1.0) return 1700;
  if (c < 2.5) return 1150;
  if (c < 4.5) return 800;
  if (c < 6.5) return 560;
  return idx < 5 ? 340 : (s.ev >= 16 ? 200 : 105);
}

function stepNight() {
  const r = G.general.result;
  if (G.general.called.length >= r.order.length) return setTimeout(finishNight, 1400);
  const next = r.order[G.general.called.length];
  G.general.called.push(next.abbr);
  paintNight();
  setTimeout(stepNight, nightDelay(next, G.general.called.length, r));
}

function scrNight(el) {
  el.appendChild(h(`<div class="fade-in">
    <div id="callticker"></div>
    <div class="split">
      <div class="panel">
        <div class="panel-head"><h2>Election Night</h2><span class="spacer"></span><span class="sub" id="clock"></span></div>
        <div id="map"></div>
        <div id="ev" style="margin-top:16px"></div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Calls</h2><span class="spacer"></span>
          <span class="sub">as the desk makes them</span></div>
        <div class="results-scroll"><table><thead><tr>
          <th>State</th><th class="num">EV</th><th class="num">Margin</th><th class="num">vs. baseline</th>
        </tr></thead><tbody id="calls"></tbody></table></div>
      </div>
    </div></div>`));
  G.general.baseline = G.general.baseline || genericBaseline(G.player.partyId);
  paintNight();
}

function paintNight() {
  const r = G.general.result, gn = G.general, p = G.player;
  const shown = r.states.filter(s => gn.called.includes(s.abbr));
  const evP = shown.filter(s => s.won).reduce((a, s) => a + s.ev, 0);
  const evO = shown.filter(s => !s.won).reduce((a, s) => a + s.ev, 0);
  const mapEl = document.querySelector('#map'); if (!mapEl) return;
  const last = shown[shown.length - 1];
  // Once the safe states are on the board, everything still outstanding is a
  // battleground, and it says so rather than sitting there looking unpainted.
  const pending = gn.called.length >= r.safeCount
    ? r.order.slice(gn.called.length).map(s => s.abbr) : [];
  renderMap(mapEl, shown, {
    playerParty: p.partyId, big: true, baseline: gn.baseline,
    flash: last && last.abbr, pending,
    decisive: r.decisive && gn.called.includes(r.decisive) ? r.decisive : null
  });
  renderEvBar(document.querySelector('#ev'), evP, evO, p.partyId);
  document.querySelector('#clock').textContent =
    `${shown.length} of 51 called${pending.length ? ` · ${pending.length} too close to call` : ''}`;

  const tb = document.querySelector('#calls');
  tb.innerHTML = shown.slice().reverse().slice(0, 34).map(s => {
    const sw = (s.margin - gn.baseline[s.abbr]) * 100;
    return `<tr><td>${esc(s.name)} <span class="pill ${s.won ? 'green' : 'red'}">${s.won ? 'YOU' : 'THEM'}</span></td>
      <td class="num">${s.ev}</td>
      <td class="num ${s.won ? 'g' : 'r'}">${sgn(s.margin * 100, 1)}</td>
      <td class="num">${delta(sw, { dp: 1, dead: 0.2 })}</td></tr>`;
  }).join('');

  const isDecisive = last && last.abbr === r.decisive;
  document.querySelector('#callticker').innerHTML = last
    ? tickerBar([
        [isDecisive ? 'The race is called' : 'Call',
          `${esc(last.name)} — ${last.won ? 'you' : esc(G.opp.name)}`, last.won ? 'g' : 'r'],
        ['Margin', sgn(last.margin * 100, 1), last.won ? 'g' : 'r'],
        ['Electoral votes', `${evP} – ${evO}`],
        ['To 270', evP >= 270 ? 'over the line' : evO >= 270 ? 'they are over the line' : `${270 - evP} more`]
      ], isDecisive ? 'RACE CALLED' : 'Decision Desk')
    : tickerBar([['Status', 'polls closing across the eastern states']], 'Decision Desk');
}

async function finishNight() {
  const r = G.general.result, p = G.player;
  const won = r.evP >= 270;
  const pop = r.popular;

  // The second election ends the game rather than starting a term.
  if (G.general.reelection) {
    const g = G.gov;
    await showModal({
      kicker: 'Four Years Later', title: won ? `${p.name} Is Re-Elected` : `${G.opp2.name} Wins`,
      text: `<b>${r.evP}</b> to <b>${r.evO}</b> in the electoral college; ${pct(pop, 1)} of the two-party vote.
        Tipping-point state: <b>${esc(r.tipping.name)}</b> at ${sgn(r.tipping.margin * 100, 1)}.<br><br>
        ${won
          ? 'The country renews the contract. Whatever you did not finish, you now have to finish with a weaker hand and less time.'
          : 'The country declines to renew the contract. Every rule you wrote survives until someone runs the process in reverse; everything you did by executive order ends on January 20th.'}`,
      choices: [{ label: 'The verdict of history →' }]
    });
    // An order is a lease on policy. A statute is not.
    if (!won) {
      // Reverse exactly what each order was still delivering — an order that
      // spent three years enjoined was not delivering the whole of it.
      for (const l of g.laws) if (l.exec) {
        g.enacted[l.issue] = 0;
        applyIssueOutcomes(g, l.issue, g.platform.positions[l.issue], -(l.outScale || 0.5));
      }
      logMsg('Every executive order is revoked in the first week of the next administration.', 'bad', 'JAN 20');
    }
    G.results = { r, won, next: won ? 'secondTerm' : 'final', env: g.env2 };
    G.screen = 'results';
    return render();
  }
  await showModal({
    kicker: won ? 'The Networks Call It' : 'The Concession',
    title: won ? `${p.name} Is Elected President` : `${G.opp.name} Wins`,
    text: `<b>${r.evP}</b> electoral votes to <b>${r.evO}</b>. Popular vote: ${pct(pop, 1)} to ${pct(1 - pop, 1)}.<br><br>
      Tipping-point state: <b>${esc(r.tipping.name)}</b> at ${sgn(r.tipping.margin * 100, 1)}.
      ${won && pop < 0.5 ? '<br><br>You won the college and lost the country. Half the coverage tomorrow will be about that.' : ''}
      ${!won ? '<br><br>You call at 1:40am and concede at 2:15.' : ''}`,
    choices: [{ label: won ? 'Begin the transition →' : 'See the post-mortem' }]
  });
  // The map is worth looking at before the game moves on from it.
  G.results = { r, won, next: won ? 'govern' : 'final', env: G.env };
  G.screen = 'results';
  render();
}

/* ==========================================================================
   7b. THE RESULTS — the map, once it has stopped moving
   ========================================================================== */
function scrResults(el) {
  const { r, won } = G.results;
  const p = G.player, gn = G.general;
  const env = G.results.env || G.env;
  const baseline = gn.baseline || genericBaseline(p.partyId, env);
  const regions = regionSummary(r.states, p.partyId);
  const sort = G.results.sort || 'margin';

  const rows = r.states.slice().sort((a, b) =>
    sort === 'ev' ? b.ev - a.ev :
    sort === 'swing' ? ((b.margin - baseline[b.abbr]) - (a.margin - baseline[a.abbr])) :
    sort === 'name' ? a.name.localeCompare(b.name) :
    b.margin - a.margin);

  el.appendChild(h(`<div class="fade-in">
    ${tickerBar([
      ['Result', won ? `${esc(p.name)} wins` : `${esc(G.opp.name)} wins`, won ? 'g' : 'r'],
      ['Electoral college', `${r.evP} – ${r.evO}`],
      ['Popular vote', `${pct(r.popular, 1)} – ${pct(1 - r.popular, 1)}`],
      ['Tipping point', `${esc(r.tipping.name)} ${sgn(r.tipping.margin * 100, 1)}`],
      ['College bias', biasLabel()]
    ], 'Final')}
    <div class="split">
      <div>
        <div class="panel">
          <div class="panel-head"><h2>The Final Map</h2><span class="spacer"></span>
            <span class="sub">click any state for its full file</span></div>
          <div id="map"></div>
          <div id="ev" style="margin-top:16px"></div>
          <div class="region-strip" id="regions"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Every State</h2><span class="spacer"></span>
            <span class="sub">sort by
              <button class="sortb ${sort === 'margin' ? 'on' : ''}" data-s="margin">margin</button>
              <button class="sortb ${sort === 'ev' ? 'on' : ''}" data-s="ev">votes</button>
              <button class="sortb ${sort === 'swing' ? 'on' : ''}" data-s="swing">your swing</button>
              <button class="sortb ${sort === 'name' ? 'on' : ''}" data-s="name">name</button></span></div>
          <div class="table-scroll" style="max-height:520px"><table><thead><tr>
            <th>State</th><th class="num">EV</th><th class="num">Margin</th>
            <th class="num">vs. generic</th><th class="num">Spent</th></tr></thead>
            <tbody id="all"></tbody></table></div>
        </div>
      </div>
      <div class="rail">
        <div class="panel">
          <div class="panel-head"><h2>How It Was Won</h2></div>
          <div id="why"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>National Coalition</h2><span class="sub">final</span></div>
          <div id="cbars"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Closest Calls</h2></div>
          <div id="closest"></div>
        </div>
        <div class="btn-row">
          <button class="btn primary" id="go" style="width:100%">${
            won ? 'Begin the transition →' : 'See the post-mortem →'}</button>
        </div>
      </div>
    </div></div>`));

  const elast = stateElasticities(p, G.opp, env, gn.efforts);
  renderMap(el.querySelector('#map'), r.states, {
    playerParty: p.partyId, big: true, showMargins: true, baseline, elasticity: elast,
    efforts: gn.efforts,
    onClick: abbr => openStateFile(abbr, stateProfile(abbr, p, G.opp, env, gn.efforts, elast))
  });
  renderEvBar(el.querySelector('#ev'), r.evP, r.evO, p.partyId);

  el.querySelector('#regions').innerHTML = regions.map(reg => `
    <div class="reg"><span class="rn">${esc(reg.reg.name)}</span>
      <span class="rb"><i style="width:${(reg.evP / Math.max(1, reg.evP + reg.evO) * 100).toFixed(0)}%;
        background:${p.partyId === 'D' ? 'var(--dem)' : 'var(--gop)'}"></i></span>
      <span class="rv mono">${reg.evP}<i>–${reg.evO}</i></span></div>`).join('');

  const tb = el.querySelector('#all');
  for (const s of rows) {
    const sw = (s.margin - baseline[s.abbr]) * 100;
    const e = gn.efforts[s.abbr];
    const spent = Math.round(e.persuade + e.ground + e.digital +
      Object.values(e.bloc || {}).reduce((a, b) => a + b, 0));
    tb.appendChild(h(`<tr data-a="${s.abbr}">
      <td>${esc(s.name)} <span class="pill ${s.won ? 'green' : 'red'}">${s.won ? 'YOU' : 'THEM'}</span></td>
      <td class="num">${s.ev}</td>
      <td class="num ${s.won ? 'g' : 'r'}">${sgn(s.margin * 100, 1)}</td>
      <td class="num">${delta(sw, { dp: 1, dead: 0.2 })}</td>
      <td class="num muted">${spent || '—'}</td></tr>`));
  }
  tb.querySelectorAll('tr').forEach(tr => tr.onclick = () =>
    openStateFile(tr.dataset.a, stateProfile(tr.dataset.a, p, G.opp, env, gn.efforts, elast)));
  el.querySelectorAll('.sortb').forEach(b => b.onclick = () => { G.results.sort = b.dataset.s; render(); });

  // where the election was actually decided
  const swings = r.states.map(s => ({ s, sw: (s.margin - baseline[s.abbr]) * 100 }));
  const best = swings.slice().sort((a, b) => b.sw - a.sw).slice(0, 3);
  const worst = swings.slice().sort((a, b) => a.sw - b.sw).slice(0, 3);
  const flipped = r.states.filter(s => s.won !== (baseline[s.abbr] > 0));
  el.querySelector('#why').innerHTML = `
    <div class="imp-rows">
      ${deltaRow('Popular vote margin', (r.popular * 2 - 1) * 100, { dp: 1, unit: ' pts' })}
      ${deltaRow('Tipping-point margin', r.tipping.margin * 100, { dp: 1, unit: ' pts' })}
      <div class="drow"><span class="dk">College bias this cycle</span><span class="mono">${biasLabel()}</span></div>
      <div class="drow"><span class="dk">States you moved off their lean</span><span class="mono">${flipped.length}</span></div>
    </div>
    <div class="imp-sec">You ran furthest ahead in</div>
    <div class="imp-list">${best.map(x => `<div class="drow"><span class="dk">${esc(x.s.name)}
      <i class="ev-mini">${x.s.ev}</i></span>${delta(x.sw, { dp: 1 })}</div>`).join('')}</div>
    <div class="imp-sec">You ran furthest behind in</div>
    <div class="imp-list">${worst.map(x => `<div class="drow"><span class="dk">${esc(x.s.name)}
      <i class="ev-mini">${x.s.ev}</i></span>${delta(x.sw, { dp: 1 })}</div>`).join('')}</div>`;

  renderBlocBars(el.querySelector('#cbars'), p, G.opp, nationalWeights());

  const closest = r.states.slice().sort((a, b) => Math.abs(a.margin) - Math.abs(b.margin)).slice(0, 8);
  el.querySelector('#closest').innerHTML = `<div class="imp-list">${closest.map(s =>
    `<div class="drow"><span class="dk">${esc(s.name)} <i class="ev-mini">${s.ev}</i></span>
      <span class="mono ${s.won ? 'g' : 'r'}">${sgn(s.margin * 100, 2)}</span></div>`).join('')}</div>
    <div class="tiny muted" style="margin-top:8px">${(() => {
      const flip = closest.filter(s => !s.won).slice(0, 3);
      const need = 270 - r.evP;
      if (r.evP >= 270) return 'Any two of these going the other way would have made for a much longer night.';
      let acc = 0; const list = [];
      for (const s of flip) { acc += s.ev; list.push(s.name); if (acc >= need) break; }
      return acc >= need ? `${list.join(', ')} would have been enough.`
        : 'Even sweeping the close ones would not have been enough.';
    })()}</div>`;

  el.querySelector('#go').onclick = () => {
    if (G.results.next === 'govern') return beginGovernment(G.results.r);
    if (G.results.next === 'secondTerm') return beginSecondTerm();
    if (G.results.next === 'final') {
      if (!G.gov) {
        G.gov = { failedAt: 'general', platform: p.platform, approval: 0, econ: 0, laws: [], enacted: {},
          baseMorale: p.baseMorale, deficit: 0, institutionalDamage: 0, reelected: null, quarter: 0,
          result: G.results.r, outcomes: {} };
      }
      G.screen = 'final'; render();
    }
  };
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
    loyalty: 0,
    natMargin,
    result,
    history: [],
    weeks: QUARTER_WEEKS,
    done: [],              // what you spent this quarter's weeks on
    outcomes: {},          // what has actually changed in the country
    judiciary: 0,          // friendly benches: executive action survives longer
    competence: 0,         // a cabinet that returns calls
    camp: null,            // the re-election campaign, once there is one
    campFunds: 0,
    term: 1,
    situations: [],        // live crises eating this quarter's weeks
    seenSituations: [],
    war: null,             // the theatre, once there is one
    warAt: null,           // the quarter the cable arrives, decided now and fixed
    warOver: null
  };
  /* Rolled once, here, and never again. Most presidencies do not get one; a
     seed either contains a war or it does not, which is the only way a run
     with one in it can be replayed and argued about. */
  if (rnd() < WAR_ODDS) G.gov.warAt = 3 + Math.floor(rnd() * 8);   // Q3 through Q10
  G.gov.capital = quarterlyCapital(G.gov);
  G.gov.history.push({ q: 0, approval: G.gov.approval, econ: G.gov.econ, laws: 0 });
  // Every promise made in a ballroom during the primary is now a phone call
  // from someone who wants their appointment.
  if (p.debts) {
    G.gov.capital = Math.max(2, G.gov.capital - p.debts * 6);
    logMsg(p.debts === 1
      ? 'A commitment made during the primary comes due before you are sworn in.'
      : `${p.debts} commitments made during the primary come due before you are sworn in.`,
      'bad', 'TRANSITION');
  }
  logMsg(`Inauguration. ${congress.house.P}–${congress.house.O} House, ${congress.senate.P}–${congress.senate.O} Senate.`, 'big', 'JAN 20');
  G.screen = 'govern';
  render();
}

/* ==========================================================================
   THE QUARTER
   A president does not get one thing done in three months, and being allowed
   only one made every quarter the same shrug. The constraint is time: a
   quarter is thirteen weeks of it, and everything below is priced in weeks as
   well as in capital. A major bill is most of a quarter. A pardon is an
   afternoon. What you cannot do is all of it.
   ========================================================================== */
const QUARTER_WEEKS = 13;

const GOV_ACTIONS = [
  { id: 'bill', name: 'Move a Bill to the Floor', cost: 0, weeks: 6, group: 'Legislative',
    desc: 'Draft it, whip it, and find out what your majority is actually worth.' },
  { id: 'reg', name: 'Direct an Agency Rulemaking', cost: 11, weeks: 5, group: 'Executive',
    desc: 'Notice, comment, and a rule with an administrative record behind it. Slower than an order and far harder for a court to erase.' },
  { id: 'exec', name: 'Sign an Executive Order', cost: 8, weeks: 3, group: 'Executive',
    desc: 'Immediate, unilateral, half as strong, and one adverse ruling from nothing.' },
  { id: 'judges', name: 'Confirm Judicial Nominees', cost: 7, weeks: 3, group: 'Executive',
    desc: 'Fill the district and circuit vacancies. Everything you sign afterwards lands in front of judges somebody appointed.' },
  { id: 'clemency', name: 'Clemency and Pardons', cost: 3, weeks: 1, group: 'Executive',
    desc: 'A stroke of the pen that empties cells. Your base notices. So does every prosecutor in the country.' },
  { id: 'pulpit', name: 'National Address and Tour', cost: 10, weeks: 3, group: 'Political',
    desc: 'Spend capital to move approval and pressure the members whose seats you carried.' },
  { id: 'negotiate', name: 'Meet the Opposition Leader', cost: 5, weeks: 2, group: 'Political',
    desc: 'A private hour in the residence. Cross-aisle goodwill is the only thing that ever gets you to sixty.' },
  { id: 'cabinet', name: 'Cabinet Shake-Up', cost: 4, weeks: 2, group: 'Political',
    desc: 'Replace the weak link. Costs you a confirmation fight and buys you a department that returns calls.' },
  { id: 'summit', name: 'Foreign Summit', cost: 9, weeks: 4, group: 'Political',
    desc: 'Gravitas, a bump with security voters, and a month not spent on the agenda.' },
  { id: 'party', name: 'Party Building and Recruitment', cost: 6, weeks: 3, group: 'Political',
    desc: 'Recruit candidates and bank money for the committees. Pays off at the midterms.' },
  { id: 'hold', name: 'Consolidate and Wait', cost: 0, weeks: 2, group: 'Political',
    desc: 'Bank political capital. Sometimes the correct play, never the satisfying one.' },
  { id: 'fundraise', name: 'Re-Election Finance', cost: 0, weeks: 2, group: 'Re-Election',
    desc: 'Call time and closed-door dinners for your own campaign. Legal, tedious, and the reason you can afford a map.' },
  { id: 'travel', name: 'Official Travel', cost: 3, weeks: 2, group: 'Re-Election',
    desc: 'Government business, in a state you happen to need. Air Force One is the best backdrop in politics.' },
  { id: 'campaign', name: 'Campaign Swing', cost: 0, weeks: 3, group: 'Re-Election',
    desc: 'Four states in three days on the campaign\'s dime. The only thing that moves a map at scale.' }
];

/* Which of them you can actually reach for this quarter. */
function actionAvailable(a, g) {
  if (a.group === 'Re-Election') {
    if (a.id === 'fundraise') return g.quarter >= 9;   // you may raise before you run
    return !!g.camp;                                   // the rest need a campaign
  }
  return true;
}
function actionBlockedReason(a, g) {
  if (a.group !== 'Re-Election') return null;
  if (a.id === 'fundraise') return 'Available once the midterms are behind you.';
  return `Available in the election year, from Q13.`;
}

function scrGovern(el) {
  const g = G.gov, p = G.player;
  const yr = 2029 + Math.floor((g.quarter - 1) / 4);
  const q = ((g.quarter - 1) % 4) + 1;
  const termQ = g.term === 2 ? g.quarter - 16 : g.quarter;

  el.appendChild(h(`<div class="fade-in">
    ${tickerBar([
      ['Quarter', `Q${q} ${yr} · ${termQ} of 16${g.term === 2 ? ' · second term' : ''}`],
      ['Approval', `${Math.round(g.approval)}%`, g.approval >= 50 ? 'g' : g.approval < 42 ? 'r' : ''],
      ['Laws enacted', g.laws.length],
      ['Capital', Math.round(g.capital)],
      g.filibusterGone ? ['Senate', 'filibuster abolished', 'r'] : null,
      g.camp ? ['Re-election', `${esc(G.opp2.name)} · ${g.camp.proj ? g.camp.proj.evP + ' EV' : '—'}`,
        g.camp.proj && g.camp.proj.evP >= 270 ? 'g' : 'r'] : null,
      g.war && !g.war.ended ? ['The war', `their will ${Math.round(g.war.enemyWill)} · yours ${Math.round(g.war.homeWill)}`,
        g.war.enemyWill < g.war.homeWill ? 'g' : 'r'] : null
    ], 'Governing')}
    ${g.war && !g.war.ended ? `<div class="war-banner">
      <div style="flex:1">
        <div class="wb-k">Live theatre · quarter ${g.war.turn + 1}</div>
        <div class="wb-t">${esc(WAR_THEATRE.foeAdj)} forces are in ${esc(WAR_THEATRE.ally)}. ${esc(warPosture(g.war))}</div>
        <div class="wb-n">${g.war.casualties.toFixed(1)}k American casualties so far ·
          ${g.war.weeksThisQuarter} of your weeks committed this quarter ·
          ${g.war.weeksThisQuarter >= WAR_CMD_ORDER_WEEKS ? 'orders are yours to give' : 'running on last quarter\'s orders'}</div>
      </div>
      <button class="btn primary" id="towar">The War Room →</button>
    </div>` : ''}
    <div class="split">
      <div>
        <div class="panel">
          <div class="panel-head"><h2>The Quarter</h2><span class="spacer"></span>
            <span class="sub">${g.weeks} of ${QUARTER_WEEKS} weeks unspent</span></div>
          <div class="weekbar" title="${g.weeks} weeks of presidential time left this quarter">
            ${Array.from({ length: QUARTER_WEEKS }, (_, i) =>
              `<i class="${i < QUARTER_WEEKS - g.weeks ? 'used' : ''}"></i>`).join('')}
          </div>
          ${g.done.length ? `<div class="done-list">This quarter: ${g.done.map(d => esc(d)).join(' · ')}</div>` : ''}
          <div id="actions"></div>
          <div class="btn-row" style="margin-top:12px;border-top:1px solid var(--line);padding-top:13px">
            <button class="btn primary" id="endq">${
              g.quarter === 16 ? 'To the Election →'
              : g.quarter >= 32 ? 'Leave Office →'
              : `Advance to Q${termQ + 1} →`}</button>
            <span class="muted small">${Math.round(g.capital)} political capital · ${g.weeks} week${g.weeks === 1 ? '' : 's'} left</span>
          </div>
        </div>
        ${g.camp ? `<div class="panel">
          <div class="panel-head"><h2>The Re-Election</h2><span class="spacer"></span>
            <span class="sub">${money(g.campFunds)} on hand · ${esc(g.camp.target)} targeted</span></div>
          <div id="campmap"></div>
          <div id="campev" style="margin-top:13px"></div>
          <div id="camptarget"></div>
        </div>` : ''}
        <div class="panel">
          <div class="panel-head"><h2>The Agenda</h2><span class="sub">promises against the record</span></div>
          <table><thead><tr><th>Issue</th><th>You Promised</th><th>Enacted</th><th class="num">Status</th></tr></thead>
            <tbody id="agenda"></tbody></table>
        </div>
      </div>
      <div class="rail">
        <div class="panel">
          <div class="panel-head"><h2>The Country</h2><span class="sub">what has actually changed</span></div>
          <div id="outcomes"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Congress</h2><span class="sub">caucus by caucus</span></div>
          <div id="congress"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Indicators</h2><span class="sub">quarter by quarter</span></div>
          <div id="kpi"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>The Wire</h2></div>
          <div class="log" id="log"></div>
        </div>
      </div>
    </div></div>`));

  const aw = el.querySelector('#actions');

  // The war outranks the desk, which outranks the agenda.
  if (g.war && !g.war.ended) {
    const w = g.war;
    aw.appendChild(h(`<div class="act-group">The Theatre</div>`));
    const proj = warTurnPreview(w);
    const row = h(`<div class="prov act">
      <div><div class="nm">Take the War Room
          <span class="pill ${w.homeWill < 34 ? 'red' : 'gold'}">${w.homeWill < 34 ? 'the country is running out of patience' : 'quarter ' + (w.turn + 1)}</span></div>
        <div class="note">Give the theatre its orders for the quarter: where the weight goes, what each
          front is trying to do, and where the sorties are. Weeks committed here are weeks the agenda
          does not get, and below ${WAR_CMD_ORDER_WEEKS} of them you do not get to change anything.</div></div>
      <div class="gain">
        <span class="eff-tag ${proj.enemyWill < 0 ? 'good' : 'bad'}">Their will <b>${sgn(proj.enemyWill, 1)}</b></span>
        <span class="eff-tag bad">Casualties <b>${proj.out.casualties.toFixed(1)}k</b></span></div>
      <div class="fig"><span class="wk">${w.weeksThisQuarter} wk</span><br><span class="muted tiny">committed</span></div></div>`);
    row.onclick = () => enterWarRoom();
    aw.appendChild(row);
  }

  // Anything currently on the desk comes first, because it is the thing most
  // likely to cost you the quarter if you keep deciding it can wait.
  if (g.situations.length) {
    aw.appendChild(h(`<div class="act-group">On the Desk</div>`));
    for (const live of g.situations) {
      const s = SITUATIONS.find(x => x.id === live.id);
      const left = s.weeks - live.put;
      const put = Math.min(left, g.weeks);
      const ok = put > 0;
      const qLeft = live.due - g.quarter;
      const row = h(`<div class="prov act situation ${ok ? '' : 'stripped'}">
        <div><div class="nm">${esc(s.name)}
            <span class="pill ${qLeft <= 0 ? 'red' : 'gold'}">${qLeft <= 0 ? 'last chance' : qLeft + ' quarter' + (qLeft === 1 ? '' : 's') + ' left'}</span></div>
          <div class="note">${esc(s.desc)}</div>
          <div class="sitbar"><i style="width:${(live.put / s.weeks * 100).toFixed(0)}%"></i>
            <b>${live.put} of ${s.weeks} weeks</b></div>
          ${!ok ? '<div class="blocked">No weeks left this quarter.</div>' : ''}</div>
        <div class="gain">${effectTags(effectSummary(s.resolved, 'gov'))}</div>
        <div class="fig"><span class="wk">${put} wk</span><br><span class="muted tiny">put in</span></div></div>`);
      if (ok) row.onclick = () => {
        live.put += put; g.weeks -= put;
        g.done.push(s.working);
        logMsg(`${put} week${put === 1 ? '' : 's'} on ${s.name.toLowerCase()}.`, '', `Q${g.quarter}`);
        render();
      };
      aw.appendChild(row);
    }
  }

  let lastGroup = null;
  for (const a of GOV_ACTIONS) {
    const avail = actionAvailable(a, g);
    const ok = avail && g.capital >= a.cost && g.weeks >= a.weeks;
    if (!avail && a.group === 'Re-Election' && a.id !== 'fundraise' && g.quarter < 9) continue;
    if (a.group !== lastGroup) {
      lastGroup = a.group;
      aw.appendChild(h(`<div class="act-group">${esc(a.group)}</div>`));
    }
    const pv = govActionPreview(a, g, p);
    const why = !avail ? actionBlockedReason(a, g)
      : g.weeks < a.weeks ? `Needs ${a.weeks} weeks; ${g.weeks} left.`
      : g.capital < a.cost ? `Needs ${a.cost} capital.` : null;
    const row = h(`<div class="prov act ${ok ? '' : 'stripped'}">
      <div><div class="nm">${esc(a.name)}</div><div class="note">${esc(a.desc)}</div>
        ${why ? `<div class="blocked">${esc(why)}</div>` : ''}</div>
      <div class="gain">${pv.map(x => x.value === null
        ? `<span class="muted tiny">${esc(x.label)}</span>`
        : `<span class="eff-tag ${x.good ? 'good' : 'bad'}">${esc(x.label)}
             <b>${x.raw ? esc(String(x.value)) : (x.value > 0 ? '+' : '−') + Math.abs(x.value)}</b></span>`).join('')}</div>
      <div class="fig"><span class="wk">${a.weeks} wk</span><br>${a.cost ? a.cost + ' cap' : '—'}</div></div>`);
    if (ok) row.onclick = () => doGovAction(a);
    aw.appendChild(row);
  }

  // What has actually changed in the country, as distinct from what it thinks
  // of you. Presented without a verdict: whether fewer crossings or fewer
  // people in prison is an improvement is the argument the game is about.
  const oc = el.querySelector('#outcomes');
  const moved = OUTCOMES.filter(o => Math.abs(g.outcomes[o.id] || 0) > 0.004);
  oc.innerHTML = moved.length
    ? `<div class="imp-list">${moved.map(o => {
        const v = g.outcomes[o.id];
        return `<div class="drow"><span class="dk">${esc(o.name)}</span>
          <span class="mono outcome">${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(o.dp)}${o.unit}</span></div>`;
      }).join('')}</div>
      <div class="tiny muted" style="margin-top:9px">Measured against the country you inherited. Passing a
        watered-down bill moves these less — which is the part a promise-kept tally cannot tell you.</div>`
    : `<div class="impact-idle"><p>Nothing has changed yet. Signing something is the only thing that moves
        these numbers — an executive order moves them about half as far, and only while it survives.</p></div>`;

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

  const hist = g.history;
  el.querySelector('#kpi').innerHTML = `
    <div class="trend">
      <div class="th"><span class="k">Approval</span><span class="v ${g.approval >= 50 ? 'g' : g.approval < 42 ? 'r' : 'a'}">${Math.round(g.approval)}%</span></div>
      ${sparkline(hist.map(x => x.approval), { id: 'sA', ref: 50, min: 25, max: 70,
        color: g.approval >= 50 ? 'var(--green)' : 'var(--amber)', label: 'approval by quarter' })}
      <div class="tf">Q1 → Q${Math.max(1, hist.length)} · the dashed line is fifty</div>
    </div>
    <div class="trend">
      <div class="th"><span class="k">The Economy</span><span class="v ${g.econ > 0.3 ? 'g' : g.econ < -0.3 ? 'r' : ''}">${sgn(g.econ, 1)}</span></div>
      ${sparkline(hist.map(x => x.econ), { id: 'sE', ref: 0, min: -2.2, max: 2.2,
        color: g.econ >= 0 ? 'var(--dem-lt)' : 'var(--gop-lt)', label: 'economy by quarter' })}
      <div class="tf">Growth above and below trend</div>
    </div>
    <div class="kpi">
      <div><span class="k">Deficit</span><span class="v">${bn(g.deficit)}</span></div>
      <div><span class="k">Bipartisan</span><span class="v">${Math.round(g.bipartisan)}</span></div>
      <div><span class="k">Opp. Energy</span><span class="v">${Math.round(g.oppEnergy)}</span></div>
      <div><span class="k">Institutions</span><span class="v ${g.institutionalDamage > 4 ? 'r' : ''}">${g.institutionalDamage}</span></div>
    </div>`;

  // The re-election, run from the Oval Office. Same map, same engine, same
  // state files — the difference is that the record you are defending is the
  // one sitting in the other panels on this screen.
  if (g.camp) {
    const c = g.camp;
    const elast = stateElasticities(p, G.opp2, g.env2, c.efforts);
    renderMap(el.querySelector('#campmap'), c.proj.states, {
      playerParty: p.partyId, target: c.target, efforts: c.efforts, elasticity: elast,
      onClick: abbr => { c.target = abbr; render(); }
    });
    renderEvBar(el.querySelector('#campev'), c.proj.evP, c.proj.evO, p.partyId);
    const t = stateProfile(c.target, p, G.opp2, g.env2, c.efforts, elast);
    el.querySelector('#camptarget').innerHTML = `
      <div class="camp-target">
        <div><span class="k">${esc(t.st.name)}</span>
          <span class="v ${t.margin > 0 ? 'g' : 'r'}">${sgn(t.margin, 1)}</span>
          <span class="n">${esc(leanLabel(t.margin))} · ${t.st.ev} EV · ${t.spent || 'nothing'} invested</span></div>
        <div class="tiny muted">A campaign swing here is worth about
          ${sgn(t.adValue * 1.6, 2)} points at the current level of saturation.
          Your approval and the economy set the ground you are running on; the map only adjusts it.</div>
      </div>`;
  }

  renderLog(el.querySelector('#log'));
  const tw = el.querySelector('#towar');
  if (tw) tw.onclick = () => enterWarRoom();
  el.querySelector('#endq').onclick = () => endQuarter();
}

async function doGovAction(a) {
  const g = G.gov, p = G.player;
  if (a.id === 'bill') {
    const avail = BILLS.filter(b => !g.billsDone.includes(b.id));
    if (!avail.length) { await showModal({ title: 'The Agenda Is Exhausted', text: 'Every vehicle has been used this term.', choices: [{ label: 'Back' }] }); return; }
    // What each vehicle is worth before you spend six weeks on it: how far
    // your promise on that issue still is from what is enacted, and what the
    // full bill would do to the country.
    const idx = await showModal({
      kicker: 'Legislative Strategy', title: 'Which Bill?',
      text: 'You have the floor time for one major bill. Leadership wants to know which.',
      choices: avail.map(b => {
        const full = {};
        for (const pv of b.provisions) addOutcomes({ outcomes: full }, pv.out);
        const top = OUTCOMES.filter(o => Math.abs(full[o.id] || 0) > 0.004)
          .sort((x, y) => Math.abs(full[y.id]) - Math.abs(full[x.id])).slice(0, 3);
        const promised = g.platform.positions[b.issue];
        const done = g.enacted[b.issue];
        return {
          label: b.name,
          hint: `${b.blurb}  ·  You promised ${STANCES[b.issue].find(s => s.p === promised).label}` +
                (done === undefined ? ' — nothing enacted yet.' : ` — currently at ${sgn(done, 2)}.`),
          tags: `<span class="eff-tags">${top.map(o =>
            `<span class="out-tag">${esc(o.name)} <b>${full[o.id] > 0 ? '+' : '−'}${
              Math.abs(full[o.id]).toFixed(o.dp)}${o.unit}</b></span>`).join('')}</span>`
        };
      })
    });
    G.bill = { bill: avail[idx], selected: avail[idx].provisions.slice(0, 3).map(x => x.id),
      boosts: {}, pulpit: 0, reconciliation: false, vehicle: false, spentCapital: 0, dealsWith: [] };
    G.screen = 'bill'; return render();
  }

  g.capital -= a.cost;
  g.weeks -= a.weeks;
  g.done.push(a.name);
  const comp = (g.perk === 'executive' ? 1.15 : 1) * (1 + g.competence * 0.05);

  if (a.id === 'exec') {
    const idx = await showModal({
      kicker: 'Article II', title: 'Executive Action',
      text: 'A pen and a phone. You get roughly 55% of the policy, none of the votes, and a lawsuit filed within the hour.',
      choices: ISSUES.filter(i => g.enacted[i.id] === undefined).slice(0, 6).map(i => ({
        label: i.name, hint: STANCES[i.id].find(s => s.p === g.platform.positions[i.id]).label
      })).concat([{ label: 'Never mind' }])
    });
    const pool = ISSUES.filter(i => g.enacted[i.id] === undefined).slice(0, 6);
    if (idx >= pool.length) { g.capital += a.cost; g.weeks += a.weeks; g.done.pop(); return render(); }
    const iss = pool[idx];
    const target = g.platform.positions[iss.id];
    const strength = 0.55 * comp;
    const enactedPos = target * strength;
    g.enacted[iss.id] = enactedPos;
    const order = { name: `Executive Order on ${iss.name}`, issue: iss.id, pos: enactedPos, exec: true, outScale: 0.5 };
    g.laws.push(order);
    applyIssueOutcomes(g, iss.id, target, 0.5);
    g.baseMorale = clamp(g.baseMorale + 4, 10, 95);
    g.oppEnergy += 5;
    logMsg(`Executive order signed on ${iss.name}. Effective immediately; challenged by 3pm.`, 'good', `Q${g.quarter}`);
    // Benches you have filled are benches that do not enjoin you on a Friday.
    if (rnd() < Math.max(0.10, 0.42 - g.judiciary * 0.07)) {
      await showModal({ kicker: 'The Courts', title: 'Enjoined',
        text: `A district judge stays your ${esc(iss.name.toLowerCase())} order nationwide. It will be at the Supreme Court in eighteen months, which is to say after the midterms.`,
        choices: [{ label: 'Appeal' }] });
      g.enacted[iss.id] = enactedPos * 0.35;
      applyIssueOutcomes(g, iss.id, target, -0.325);
      order.outScale -= 0.325;
      g.approval -= 2;
      logMsg(`The ${iss.name} order is enjoined.`, 'bad', `Q${g.quarter}`);
    }
  } else if (a.id === 'reg') {
    // A rule is slower and costlier than an order and it does not evaporate.
    const pool = ISSUES.filter(i => g.enacted[i.id] === undefined);
    if (!pool.length) { g.capital += a.cost; g.weeks += a.weeks; g.done.pop();
      await showModal({ title: 'Nothing Left to Regulate', text: 'Every issue on your platform has already been addressed one way or another.', choices: [{ label: 'Back' }] });
      return render(); }
    const idx = await showModal({
      kicker: 'The Federal Register', title: 'Direct a Rulemaking',
      text: 'Eighteen months of notice and comment, an administrative record built to survive review, and a rule that the next president has to run the same process in reverse to undo. Roughly three quarters of the policy, and it holds.',
      choices: pool.slice(0, 6).map(i => ({
        label: i.name, hint: STANCES[i.id].find(s => s.p === g.platform.positions[i.id]).label
      })).concat([{ label: 'Never mind' }])
    });
    if (idx >= Math.min(6, pool.length)) { g.capital += a.cost; g.weeks += a.weeks; g.done.pop(); return render(); }
    const iss = pool[idx];
    const target = g.platform.positions[iss.id];
    const enactedPos = target * 0.75 * comp;
    g.enacted[iss.id] = enactedPos;
    g.laws.push({ name: `${iss.name} Rule`, issue: iss.id, pos: enactedPos, rule: true });
    applyIssueOutcomes(g, iss.id, target, 0.7);
    g.oppEnergy += 3;
    logMsg(`Final rule published on ${iss.name}. It took a year and it will outlast you.`, 'good', `Q${g.quarter}`);
    if (rnd() < Math.max(0.04, 0.16 - g.judiciary * 0.03)) {
      await showModal({ kicker: 'The Courts', title: 'Vacated and Remanded',
        text: 'A circuit panel finds the record inadequate under the Administrative Procedure Act. The agency can try again, with a better record and eighteen more months.',
        choices: [{ label: 'Send it back to the agency' }] });
      g.enacted[iss.id] = enactedPos * 0.5;
      applyIssueOutcomes(g, iss.id, target, -0.35);
      logMsg(`The ${iss.name} rule is vacated on procedure.`, 'bad', `Q${g.quarter}`);
    }
  } else if (a.id === 'judges') {
    g.judiciary++;
    g.baseMorale = clamp(g.baseMorale + 2, 10, 95);
    g.oppEnergy += 3;
    logMsg(`Eleven district and two circuit judges confirmed. The bench tilts a little further your way.`, 'good', `Q${g.quarter}`);
  } else if (a.id === 'clemency') {
    const n = Math.round(rndRange(600, 2400));
    g.outcomes.incarc = (g.outcomes.incarc || 0) - n / 1000;
    g.baseMorale = clamp(g.baseMorale + 3, 10, 95);
    g.approval = clamp(g.approval - 1.2, 8, 92);
    g.oppEnergy += 4;
    logMsg(`${n.toLocaleString()} federal sentences commuted. Every US Attorney in the country objects in writing.`, '', `Q${g.quarter}`);
  } else if (a.id === 'negotiate') {
    const gain = 7 + (p.traits.legislative - 50) / 12;
    g.bipartisan = clamp(g.bipartisan + gain, 0, 60);
    g.baseMorale = clamp(g.baseMorale - 1.5, 10, 95);
    logMsg(`An hour in the residence with the other leader. No cameras, and sixty votes look marginally less impossible.`, '', `Q${g.quarter}`);
  } else if (a.id === 'cabinet') {
    g.competence++;
    g.capital -= 2;
    logMsg(`A department gets a new secretary and, eventually, a functioning front office.`, '', `Q${g.quarter}`);
  } else if (a.id === 'fundraise') {
    const raise = Math.round(45 + (p.traits.money - 50) * 1.2 + (g.baseMorale - 50) * 0.9 + (g.approval - 45) * 1.1);
    g.campFunds += Math.max(10, raise);
    logMsg(`Re-election finance quarter closes at ${money(Math.max(10, raise))}.`, 'good', `Q${g.quarter}`);
  } else if (a.id === 'travel' || a.id === 'campaign') {
    const c = g.camp, t = c.target;
    const isSwing = a.id === 'campaign';
    const cash = isSwing ? 30 : 0;
    if (isSwing && g.campFunds < cash) {
      g.capital += a.cost; g.weeks += a.weeks; g.done.pop();
      await showModal({ title: 'The Campaign Cannot Pay For It', text: `A swing costs ${money(cash)} and you have ${money(g.campFunds)}. Spend a quarter on finance first.`, choices: [{ label: 'Back' }] });
      return render();
    }
    g.campFunds -= cash;
    c.efforts[t].persuade += isSwing ? 26 : 9;
    c.efforts[t].ground += isSwing ? 8 : 4;
    if (!isSwing) g.approval = clamp(g.approval + 0.4, 8, 92);
    updateCampProjection();
    logMsg(isSwing
      ? `Campaign swing through ${STATE_BY_ABBR[t].name}. Four events, one motorcade, and a local news cycle you own.`
      : `Official travel to ${STATE_BY_ABBR[t].name} — a plant tour, a check presentation, and a backdrop no challenger can match.`,
      'good', `Q${g.quarter}`);
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

  if (g.war && !g.war.ended) await endWarQuarter();
  if (rnd() < 0.55) await governingEvent();
  await advanceSituations();
  // A country fighting one of these has less appetite for the rest of it.
  if (rnd() < (g.war && !g.war.ended ? 0.22 : 0.42)) await raiseSituation();

  g.history.push({ q: g.quarter, approval: g.approval, econ: g.econ, laws: g.laws.length });
  g.quarter++;
  if (g.warAt === g.quarter && !g.war) await openWar();
  g.weeks = QUARTER_WEEKS;
  g.done = [];
  g.capital = Math.round(clamp(g.capital * 0.35 + quarterlyCapital(g), 0, 90));

  if (g.quarter === 9 || g.quarter === 25) await runMidterms();
  if (g.quarter === 13) await beginReelection();
  // The campaign is not a separate game running alongside this one. Every
  // quarter of governing re-prices the map you are defending.
  if (g.camp) refreshCampEnvironment();
  if (g.quarter === 17 && g.term !== 2) return runReelectionNight();
  if (g.quarter > 32) return finishSecondTerm();
  render();
}

/* A second term does not end at a ballot box. It ends. */
async function finishSecondTerm() {
  const g = G.gov;
  await showModal({
    kicker: 'January 20th', title: 'The Term Ends',
    text: `Eight years, <b>${g.laws.length}</b> laws and orders, and a successor being sworn in on the
      steps behind you. Approval closes at <b>${Math.round(g.approval)}%</b>.<br><br>
      What you passed by statute outlives you. What you did with a pen depends entirely on the person
      taking the oath, and nobody is asking your opinion about it any more.`,
    choices: [{ label: 'The verdict of history →' }]
  });
  G.screen = 'final';
  render();
}

/* ==========================================================================
   THE SECOND TERM
   Won on a record, and played with a worse hand: no next election to hold
   your own party in line, a Congress that starts thinking about the person
   who replaces you, and the clock audible in every room.
   ========================================================================== */
async function beginSecondTerm() {
  const g = G.gov, p = G.player;
  g.term = 2;
  g.quarter = 17;
  g.weeks = QUARTER_WEEKS;
  g.done = [];
  g.camp = null;
  g.billsDone = [];              // a new Congress, and the vehicles reset
  g.vehicleUsed = false;
  g.bipartisan = clamp(g.bipartisan + 6, 0, 60);
  g.oppEnergy = clamp(g.oppEnergy - 8, 0, 60);
  g.approval = clamp(g.approval + 3, 8, 92);

  // The new Congress, from the margin you were just re-elected by.
  const nat = g.reelectionResult.popular * 2 - 1;
  g.congress = deriveCongress(nat, p.partyId);
  g.seats = caucusSeats(g.congress, p.partyId);
  g.capital = quarterlyCapital(g);

  await showModal({
    kicker: 'The Second Inaugural', title: 'Four More Years, and a Shorter Leash',
    text: `A new Congress: <b>${g.congress.house.P}–${g.congress.house.O}</b> House,
      <b>${g.congress.senate.P}–${g.congress.senate.O}</b> Senate. Every legislative vehicle is
      available again.<br><br>
      What you no longer have is the thing that made your own party listen. You cannot run again, so
      every member of it is now quietly working for whoever does — political capital comes in slower,
      the midterms in two years will be brutal, and the second half of this term is the part where
      presidents stop passing things and start signing pardons.<br><br>
      Do the big thing now.`,
    choices: [{ label: 'Take the oath →' }]
  });
  logMsg(`Second inaugural. ${g.congress.house.P}–${g.congress.house.O} House, ${g.congress.senate.P}–${g.congress.senate.O} Senate.`, 'big', 'JAN 20');
  G.screen = 'govern';
  render();
}

/* ==========================================================================
   THE SECOND ELECTION
   Fought from the Oval Office, in the same quarters as the governing, on the
   record being made in them. The old version resolved it in a single modal
   after the term ended, which meant the last four years of a presidency were
   played with no idea whether they were helping.
   ========================================================================== */
async function beginReelection() {
  const g = G.gov, p = G.player;
  const oppParty = p.partyId === 'D' ? 'R' : 'D';
  const opp2 = genericOpponent(oppParty);
  opp2.name = (oppParty === 'D' ? 'Gov. ' : 'Sen. ') + personName();
  opp2.role = 'The Challenger';
  opp2.blurb = 'Spent two years running against your record in early states while you were running the country. Has the advantage of never having had to sign anything.';
  g.env2 = { incumbentParty: p.partyId, incumbentPenalty: 0 };
  refreshCampEnvironment(true);
  optimizeOpponent(opp2, p, g.env2, 3);
  G.opp2 = opp2;

  const efforts = {};
  STATES.forEach(s => efforts[s.abbr] = { persuade: 0, ground: 0, digital: 0 });
  g.camp = { efforts, target: 'PA', proj: null };
  updateCampProjection();

  await showModal({
    kicker: 'The Election Year', title: `${opp2.name} Is the Nominee`,
    text: `The other party has settled on a challenger, and you are now doing two jobs with the same thirteen weeks a quarter.<br><br>
      Your record is the campaign: approval is at <b>${Math.round(g.approval)}%</b>, the economy is
      <b>${sgn(g.econ, 1)}</b>, and on that basis the map has you at
      <b>${g.camp.proj.evP}</b> electoral votes.<br><br>
      Official travel, campaign swings, and finance are now on the quarterly menu — but every week
      spent on them is a week not spent governing, and governing is what moves the number above.`,
    choices: [{ label: 'Run on the record →' }]
  });
  logMsg(`${opp2.name} wins the opposition nomination. The re-election campaign begins.`, 'big', `Q${g.quarter}`);
}

/* Approval and the economy set the ground the campaign is fought on. */
function refreshCampEnvironment(init) {
  const g = G.gov, p = G.player;
  g.env2.incumbentPenalty = clamp(0.10 - (g.approval - 47) * 0.018 - g.econ * 0.05, -0.24, 0.42);
  p.baseMorale = g.baseMorale;
  refreshCandidate(p);
  if (!init) updateCampProjection();
}

function updateCampProjection() {
  const g = G.gov;
  if (g.camp && G.opp2) g.camp.proj = projectElection(G.player, G.opp2, g.env2, g.camp.efforts);
}

function runReelectionNight() {
  const g = G.gov, p = G.player;
  refreshCampEnvironment();
  const result = runGeneralElection(p, G.opp2, g.env2, g.camp.efforts);
  g.reelectionResult = result;
  g.reelected = result.evP >= 270;

  const col = {};
  TILE_MAP.forEach(row => row.forEach((a, i) => { if (a) col[a] = i; }));
  result.order = result.states.slice().sort((a, b) => (col[b.abbr] - col[a.abbr]) || (rnd() - 0.5));

  G.opp = G.opp2;   // the night screen names whoever is in G.opp
  G.general = { result, called: [], baseline: genericBaseline(p.partyId, g.env2), reelection: true,
                efforts: g.camp.efforts, week: 10, days: 0, money: g.campFunds, proj: g.camp.proj };
  G.screen = 'night';
  render();
  stepNight();
}

/* ==========================================================================
   SITUATIONS
   Things that land on the desk and stay there until somebody spends weeks on
   them. The point is that the weeks are the same weeks the agenda needs.
   ========================================================================== */
async function raiseSituation() {
  const g = G.gov;
  const pool = SITUATIONS.filter(s => !g.seenSituations.includes(s.id));
  if (!pool.length || g.situations.length >= 2) return;
  const s = pick(pool);
  g.seenSituations.push(s.id);
  g.situations.push({ id: s.id, put: 0, due: g.quarter + s.quarters });
  await showModal({
    kicker: 'It Lands on the Desk', title: s.name,
    text: esc(s.desc) + `<br><br>Handling it takes <b>${s.weeks} weeks</b> of your time, and you have
      <b>${s.quarters} quarter${s.quarters === 1 ? '' : 's'}</b> before it stops being something you
      can still get in front of. Those are the same weeks the agenda needs, which is the whole of the
      decision.`,
    choices: [{ label: 'Understood', tags: effectTags(effectSummary(s.resolved, 'gov')) },
              { label: 'Let it run and take the consequences', tags: effectTags(effectSummary(s.ignored, 'gov')) }]
  });
  logMsg(`${s.name}. It needs ${s.weeks} weeks and it will not wait forever.`, 'bad', `Q${g.quarter}`);
}

/* Resolve anything finished, and collect on anything that ran out of time. */
async function advanceSituations() {
  const g = G.gov;
  const still = [];
  for (const live of g.situations) {
    const s = SITUATIONS.find(x => x.id === live.id);
    if (live.put >= s.weeks) {
      applyGovEffect(s.resolved);
      await showModal({ kicker: 'Resolved', title: s.name, text: esc(s.resolvedText),
        choices: [{ label: 'Back to the agenda', tags: effectTags(effectSummary(s.resolved, 'gov')) }] });
      logMsg(`${s.name}: handled.`, 'good', `Q${g.quarter}`);
    } else if (g.quarter >= live.due) {
      applyGovEffect(s.ignored);
      await showModal({ kicker: 'It Got Away From You', title: s.name, text: esc(s.ignoredText),
        choices: [{ label: 'Back to the agenda', tags: effectTags(effectSummary(s.ignored, 'gov')) }] });
      logMsg(`${s.name}: you never got in front of it.`, 'bad', `Q${g.quarter}`);
    } else still.push(live);
  }
  g.situations = still;
}

/* The one place a governing effects object is applied — events and situations
   both come through here, so the two cannot drift apart on what a key means.
   `soften` is the perk multiplier on the things a perk can actually blunt. */
function applyGovEffect(e, soften) {
  const g = G.gov, p = G.player;
  const s = soften === undefined ? 1 : soften;
  if (e.econ) g.econ = clamp(g.econ + e.econ * s, -2.2, 2.2);
  if (e.approval) g.approval = clamp(g.approval + e.approval * s, 8, 92);
  if (e.capital) g.capital = Math.max(0, g.capital + e.capital * s);
  if (e.base) g.baseMorale = clamp(g.baseMorale + e.base, 10, 95);
  if (e.deficit) g.deficit += e.deficit;
  if (e.oppEnergy) g.oppEnergy = clamp(g.oppEnergy + e.oppEnergy, 0, 60);
  if (e.bipartisan) g.bipartisan = clamp(g.bipartisan + e.bipartisan, 0, 60);
  if (e.hawks) { p.bonusU += e.hawks * 0.004; refreshCandidate(p); }
  if (e.loyalty) g.loyalty = (g.loyalty || 0) + e.loyalty;
  if (e.coherence && e.coherence < 0) g.institutionalDamage += 1;
  if (e.courtRisk) g.institutionalDamage += 1;
  if (e.policyStrength) for (const k in g.enacted) g.enacted[k] *= (1 + e.policyStrength * 0.3);
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
    choices: ev.choices.map(c => ({ label: c.label, tags: effectTags(effectSummary(c.eff, 'gov')) }))
  });
  // A retired four-star takes a crisis abroad better than anyone else does.
  const soften = (p.perk === 'commander' && ev.id === 'foreign') ? 0.5 : 1;
  applyGovEffect(ev.choices[idx].eff, soften);
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
    bipartisan: g.bipartisan, playerParty: g.playerParty, loyalty: g.loyalty || 0,
    boosts: mergeBoosts(gp.boosts, B.boosts), pulpit: B.pulpit,
    reconciliation: B.reconciliation, filibusterGone: g.filibusterGone, vehicle: B.vehicle
  };
  const wc = whipCount(bill, effective, ctx);
  const impact = provisionImpact(bill, B.selected, ctx, B.reconciliation);
  const bs = billState(bill, effective);
  const promised = g.platform.positions[bill.issue];

  el.appendChild(h(`<div class="fade-in">
    ${tickerBar([
      ['Bill', esc(bill.name)],
      ['Provisions', effective.length],
      ['Cost', bn(bs.cost) + '/yr'],
      ['Senate threshold', B.reconciliation ? 'reconciliation · 50 votes'
        : g.filibusterGone ? 'majority rule · 50 votes' : 'regular order · 60 votes',
        B.reconciliation || g.filibusterGone ? 'g' : ''],
      ['On promise', Math.abs(bs.pos - promised) <= 0.7 ? 'yes' : 'no',
        Math.abs(bs.pos - promised) <= 0.7 ? 'g' : 'r']
    ], 'Floor')}
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
          <div class="panel-head"><h2>If This Becomes Law</h2><span class="sub">as currently drafted</span></div>
          <div id="billout"></div>
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
    const im = impact[pv.id];
    // What dropping it costs, or what adding it buys — the number the whip
    // board exists to produce, rather than a position figure to infer it from.
    const verb = on ? 'drop' : 'add';
    const movers = im.caucus.map(c =>
      `<span class="mv ${c.d > 0 ? 'g' : 'r'}">${esc(c.name.replace(/ (Caucus|Coalition|Committee|Republicans|& Frontliners)$/, ''))} ${sgn(c.d, 0)}</span>`).join('');
    const row = h(`<div class="prov bill ${on ? 'on' : ''} ${strippedByByrd ? 'stripped' : ''}">
      <div class="box">${on ? '✓' : ''}</div>
      <div>
        <div class="nm">${esc(pv.name)} ${strippedByByrd ? '<span class="byrd">— STRUCK BY THE BYRD RULE</span>' : ''}</div>
        <div class="does">${esc(pv.does)}</div>
        <div class="note"><b>Politics:</b> ${esc(pv.note)}</div>
        ${Object.keys(pv.out).length ? `<div class="outs">${Object.entries(pv.out).map(([k, v]) => {
          const o = OUTCOME_BY_ID[k];
          return `<span class="out-tag">${esc(o.name)}
            <b>${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(o.dp)}${o.unit}</b></span>`;
        }).join('')}</div>` : ''}
        ${movers ? `<div class="movers">${verb} it: ${movers}</div>` : ''}
      </div>
      <div class="votes">
        <span class="vh">${on ? 'costs if dropped' : 'buys if added'}</span>
        <span class="vv">${delta(im.dHouse, { dp: 0, dead: 0.5 })}<i>H</i></span>
        <span class="vv">${delta(im.dSenate, { dp: 0, dead: 0.5 })}<i>S</i></span>
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
    const dealt = B.dealsWith.includes(r.caucus.id);
    const canDeal = g.capital >= dealCost(r.caucus) && !dealt;
    const di = dealt ? null : dealImpact(r.caucus, bill, effective, ctx);
    const row = h(`<div class="whip-row">
      <div class="whip-name">${esc(r.caucus.name)}<small>${esc(r.caucus.blurb)}</small></div>
      <div class="whip-bar"><div class="yes" style="width:${(r.frac * 100).toFixed(1)}%"></div>
        <div class="txt">${(r.frac * 100).toFixed(0)}% yes</div></div>
      <div class="whip-count">${r.houseYes}/${r.house} H<br>${r.senateYes}/${r.senate} S</div>
      <div class="whip-act">
        <span class="lean ${cls}">${txt}</span>
        <button class="btn sm" data-deal="${r.caucus.id}" ${canDeal ? '' : 'disabled'}>
          ${dealt ? 'dealt' : 'deal ' + dealCost(r.caucus)}</button>
        ${di && (di.dHouse || di.dSenate)
          ? `<span class="buys">buys ${di.dHouse > 0 ? '+' + di.dHouse : di.dHouse}H
             ${di.dSenate > 0 ? '+' + di.dSenate : di.dSenate}S</span>`
          : dealt ? '<span class="buys">bought</span>' : '<span class="buys muted">no votes left to buy</span>'}
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

  // What the bill in its current shape would actually do. The whip count says
  // whether it can pass; this says whether it is worth passing, which is the
  // question a stripped-down bill makes urgent.
  const totals = {};
  for (const pv of bs.provs) addOutcomes({ outcomes: totals }, pv.out);
  const rows = OUTCOMES.filter(o => Math.abs(totals[o.id] || 0) > 0.004);
  const full = {};
  for (const pv of bill.provisions) addOutcomes({ outcomes: full }, pv.out);
  el.querySelector('#billout').innerHTML = rows.length
    ? `<div class="imp-list">${rows.map(o => {
        const v = totals[o.id], whole = full[o.id] || 0;
        const share = whole ? Math.abs(v / whole) : 1;
        return `<div class="drow"><span class="dk">${esc(o.name)}
          ${share < 0.92 && Math.sign(v) === Math.sign(whole)
            ? `<i class="ev-mini">${Math.round(share * 100)}% of the full bill</i>` : ''}</span>
          <span class="mono outcome">${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(o.dp)}${o.unit}</span></div>`;
      }).join('')}</div>
      <div class="tiny muted" style="margin-top:9px">Ten-year cost <span class="mono">${bn(bs.cost * 10)}</span>.
        Dropping a provision to buy a caucus drops what it was going to do along with it.</div>`
    : '<div class="impact-idle"><p>As drafted, this bill changes nothing measurable in the country. It may still be worth passing for what it says.</p></div>';

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
        if (i === 0) { spendBillWeeks(); logMsg(`${bill.name} is pulled from the floor.`, 'bad', `Q${G.gov.quarter}`); G.screen = 'govern'; render(); }
      });
  };
}

/* Floor time is charged when the bill leaves the drafting table, however it
   leaves — a bill pulled from the floor still ate the quarter. */
function spendBillWeeks() {
  const g = G.gov, a = GOV_ACTIONS.find(x => x.id === 'bill');
  g.weeks = Math.max(0, g.weeks - a.weeks);
  g.done.push(a.name);
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

  spendBillWeeks();
  g.billsDone.push(bill.id);

  if (passes) {
    g.enacted[bill.issue] = bs.pos;
    // Only what actually survived to the floor changes anything in the world.
    for (const pv of bs.provs) addOutcomes(g, pv.out);
    g.laws.push({ name: bill.name, issue: bill.issue, pos: bs.pos, cost: bs.cost,
      provisions: effective.length, out: bs.provs.reduce((a, pv) => { addOutcomes({ outcomes: a }, pv.out); return a; }, {}) });
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
      <div>
        <div class="panel">
          <div class="panel-head"><h2>The Record</h2></div>
          <table><tbody id="score"></tbody></table>
        </div>
        ${g.result ? `<div class="panel">
          <div class="panel-head"><h2>${g.reelectionResult ? 'The Second Election' : 'The Election'}</h2>
            <span class="spacer"></span><span class="sub" id="mapsub"></span></div>
          <div id="finalmap"></div>
          <div id="finalev" style="margin-top:14px"></div>
        </div>` : ''}
      </div>
      <div class="rail">
        ${!failed ? `<div class="panel">
          <div class="panel-head"><h2>The Country You Leave</h2><span class="sub">measured against the one you inherited</span></div>
          <div id="finalout"></div>
        </div>` : ''}
        ${g.war ? `<div class="panel">
          <div class="panel-head"><h2>The War</h2><span class="sub">${esc(WAR_THEATRE.ally)} · began Q${g.war.startQuarter} · ${g.war.turn} quarters</span></div>
          <div class="imp-list">
            <div class="drow"><span class="dk">Outcome</span><span class="mono ${WAR_ENDINGS[(g.war.terms || warTerms(g.war)).id].grade >= 0 ? 'g' : 'r'}">${
              g.war.terms ? esc(WAR_ENDINGS[g.war.terms.id].title) : 'Still running — ' + esc((warTerms(g.war)).label.toLowerCase())}</span></div>
            <div class="drow"><span class="dk">American casualties</span><span class="mono">${g.war.casualties.toFixed(1)}k</span></div>
            <div class="drow"><span class="dk">${esc(WAR_THEATRE.foeAdj)} casualties</span><span class="mono">${g.war.foeCasualties.toFixed(1)}k</span></div>
            <div class="drow"><span class="dk">Direct cost</span><span class="mono">${bn(g.war.cost)}</span></div>
            <div class="drow"><span class="dk">Quarters of your time</span><span class="mono">${g.war.turn}</span></div>
          </div>
          <div class="tiny muted" style="margin-top:8px">${g.war.terms ? '' :
            'You left office with it unfinished. It is graded on the line where it stood, because that is what your successor was handed. '}Every one of those quarters was thirteen weeks
            in which something else was not being done. That is the part the legacy score cannot
            itemise and the part the histories will spend the most words on.</div>
        </div>` : ''}
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
    deficit: 'Fiscal position', institutions: 'Damage to the institutions',
    war: 'The war'
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

  const fo = el.querySelector('#finalout');
  if (fo) {
    const moved = OUTCOMES.filter(o => Math.abs((g.outcomes || {})[o.id] || 0) > 0.004);
    fo.innerHTML = moved.length
      ? `<div class="imp-list">${moved.map(o => {
          const v = g.outcomes[o.id];
          return `<div class="drow"><span class="dk">${esc(o.name)}</span>
            <span class="mono outcome">${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(o.dp)}${o.unit}</span></div>`;
        }).join('')}</div>
        <div class="tiny muted" style="margin-top:9px">Whether these are improvements is the argument you
          spent four years having. The record is only that they are what changed.</div>`
      : `<div class="impact-idle"><p>Nothing measurable changed. The country you hand over is the one you
          were given, which is its own kind of verdict.</p></div>`;
  }

  // The map you actually got, which is the only argument that ever settled one.
  const fm = el.querySelector('#finalmap');
  if (fm) {
    const r = g.reelectionResult || g.result;
    renderMap(fm, r.states, { playerParty: p.partyId, big: true, showMargins: true });
    renderEvBar(el.querySelector('#finalev'), r.evP, r.evO, p.partyId);
    el.querySelector('#mapsub').textContent =
      `${r.evP}–${r.evO} · tipping point ${r.tipping.name} ${sgn(r.tipping.margin * 100, 1)}`;
  }

  el.querySelector('#laws').innerHTML = g.laws.length
    ? g.laws.map(l => {
        const outs = Object.entries(l.out || {}).filter(([, v]) => Math.abs(v) > 0.004);
        return `<div class="law-row">
          <div class="dim">${esc(l.name)}${l.exec ? ' <span class="pill">executive order</span>' : ''}${
            l.rule ? ' <span class="pill">rule</span>' : ''}
            <span class="muted mono tiny">${l.cost !== undefined ? bn(l.cost) + '/yr' : ''}</span></div>
          ${outs.length ? `<div class="outs">${outs.map(([k, v]) => {
            const o = OUTCOME_BY_ID[k];
            return `<span class="out-tag">${esc(o.name)} <b>${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(o.dp)}${o.unit}</b></span>`;
          }).join('')}</div>` : ''}
        </div>`;
      }).join('')
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
function boot() {
  setSeed(Math.floor(Math.random() * 2 ** 31));
  calibrateStates();
  render();
}

/* Bundled into a single file, this script can run after the document has
   already finished parsing, in which case DOMContentLoaded will never fire. */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

/* ==========================================================================
   10. THE WAR
   A situation is weeks. This is a board, an opponent who moves on it, and two
   clocks. The presidency does not pause while you play it — the weeks are the
   same weeks the agenda needs, and the whole design of the thing is that
   winning it well is expensive enough to cost you the domestic presidency you
   were elected to have.
   ========================================================================== */

/* Entering the room commits the minimum two weeks if they are going spare, so
   that the player arrives somewhere they can act rather than at a screen on
   which every control is greyed out. Dialling it back to zero is one click and
   returns the weeks; that is a decision, and it should look like one. */
function enterWarRoom() {
  const g = G.gov, w = g.war;
  if (w && !w.ended && w.weeksThisQuarter === 0 && g.weeks >= WAR_CMD_ORDER_WEEKS) {
    w.weeksThisQuarter = WAR_CMD_ORDER_WEEKS;
    g.weeks -= WAR_CMD_ORDER_WEEKS;
  }
  G.screen = 'war';
  render();
}

async function openWar() {
  const g = G.gov;
  g.war = createWar(g.quarter);
  await showModal({
    kicker: 'Four in the Morning', title: `${WAR_THEATRE.foeAdj} Forces Cross the Frontier`,
    text: `${esc(WAR_THEATRE.cable)}<br><br>${esc(WAR_THEATRE.brief)}<br><br>
      The theatre commander wants orders every quarter. Giving them takes weeks you were going
      to spend on the agenda — <b>two</b> at minimum to change anything at all, up to
      <b>${WAR_CMD_MAX_WEEKS}</b> for a war that is actually being run rather than merely
      reported to you.`,
    choices: [{ label: 'To the situation room →' }]
  });
  logMsg(`${WAR_THEATRE.foeAdj} armour crosses the ${WAR_THEATRE.ally} frontier on three axes.`, 'big', `Q${g.quarter}`);
  enterWarRoom();
}

/* Resolve the quarter's orders, apply what it did to the presidency, and show
   the after-action. Every number in the modal came out of the same call that
   moved the line. */
async function endWarQuarter() {
  const g = G.gov, w = g.war;
  const out = resolveWarTurn(w, g);
  applyGovEffect(warPoliticalEffect(w, out));
  g.outcomes.warDead = w.casualties;
  g.outcomes.warCost = w.cost;
  g.outcomes.displaced = w.displaced;
  w.weeksThisQuarter = 0;
  w.liftLeft = WAR_LIFT;

  const moved = WAR_FRONTS.filter(F => Math.abs(out.fronts[F.id].delta) > 0.03)
    .sort((a, b) => Math.abs(out.fronts[b.id].delta) - Math.abs(out.fronts[a.id].delta));
  const rows = moved.slice(0, 4).map(F => {
    const r = out.fronts[F.id];
    return `<div class="drow"><span class="dk">${esc(F.name)}</span>
      <span class="mono ${r.delta > 0 ? 'g' : 'r'}">${sgn(r.delta * 100, 0)}</span></div>`;
  }).join('');

  if (!w.ended) {
    await showModal({
      kicker: `The Theatre · Quarter ${w.turn}`, title: out.progress > 1.2 ? 'The Line Moves'
        : out.progress < -1.2 ? 'They Push' : 'A Quarter of Nothing Much',
      html: `<div class="imp-list">${rows || '<div class="drow"><span class="dk">The line holds everywhere</span></div>'}</div>
        <div style="margin-top:10px">${willBars(w)}</div>`,
      text: `<b>${out.casualties.toFixed(1)}k</b> American casualties this quarter,
        <b>${out.foeCasualties.toFixed(1)}k</b> theirs.
        ${out.muniFactor < 1 ? `<br><span style="color:var(--amber)">The stockpile did not cover the orders — everything drawn against it ran at ${Math.round(out.muniFactor * 100)}%.</span>` : ''}`,
      choices: [{ label: 'Back to the desk', tags: effectTags(effectSummary(warPoliticalEffect(w, out), 'gov')) }]
    });
    logMsg(`Theatre: ${sgn(out.progress, 1)} on the line, ${out.casualties.toFixed(1)}k casualties.`,
      out.progress > 1.2 ? 'good' : out.progress < -1.2 ? 'bad' : '', `Q${g.quarter}`);
    return;
  }
  await finishWar(w.ended === 'victory' ? { id: 'victory', label: 'Aravandi capitulation', score: 1 } : warTerms(w));
}

/* Every ending is the same arithmetic on the same line — what differs is who
   decided to stop. */
async function finishWar(terms, how) {
  const g = G.gov, w = g.war;
  w.terms = terms;
  w.ended = w.ended || how || 'armistice';
  const E = WAR_ENDINGS[terms.id];
  const cap = w.ended === 'victory';

  const eff = {
    victory:    { approval: 11, hawks: 9, bipartisan: 8, capital: 10, base: 4 },
    favourable: { approval: 6, hawks: 5, bipartisan: 4, capital: 4 },
    status:     { approval: -1, hawks: -1, oppEnergy: 6 },
    poor:       { approval: -9, hawks: -7, base: -8, oppEnergy: 16 },
    rout:       { approval: -15, hawks: -11, base: -12, oppEnergy: 24, coherence: -1 }
  }[terms.id];

  const body = {
    victory: `The ${WAR_THEATRE.foeAdj} government accepts the terms on a Sunday and announces them on a Monday. The frontier is restored and then some, and the footage of the first units coming home runs for a fortnight.`,
    favourable: `They sign because the arithmetic stopped working for them before it stopped working for you. The line you are left holding is better than the one you inherited, and everybody involved understands why they signed.`,
    status: `The frontier ends up more or less where it started. Both governments describe this as a vindication, and the people who fought over the ground in between are not asked.`,
    poor: `You sign because the alternative is signing later with less. ${WAR_THEATRE.ally} loses territory it will spend a generation talking about, and the word in every headline is "concessions".`,
    rout: `The appropriation fails on the floor and the withdrawal begins whether or not you have authorised it. The last aircraft out is the photograph that goes in the textbooks, and it is a photograph of your presidency.`
  }[terms.id];

  await showModal({
    kicker: cap ? 'They Capitulate' : w.ended === 'collapse' ? 'The Money Runs Out' : 'The War Ends',
    title: E.title,
    text: `${esc(body)}<br><br>
      <b>${w.turn} quarters.</b> <b>${w.casualties.toFixed(1)}k</b> American casualties.
      <b>${bn(w.cost)}</b> in direct cost, all of it borrowed.`,
    choices: [{ label: 'It is over', tags: effectTags(effectSummary(eff, 'gov')) }]
  });
  applyGovEffect(eff);
  g.deficit += 0;   // already accrued quarter by quarter
  g.warOver = terms.id;
  g.outcomes.warDead = w.casualties;
  g.outcomes.warCost = w.cost;
  g.outcomes.displaced = w.displaced;
  logMsg(`${E.title}. ${w.turn} quarters, ${w.casualties.toFixed(1)}k casualties.`,
    E.grade > 100 ? 'big' : E.grade < 0 ? 'bad' : '', `Q${g.quarter}`);
  G.screen = 'govern';
}

/* ---- the war room -------------------------------------------------------- */
function scrWar(el) {
  const g = G.gov, w = g.war;
  if (w.liftLeft === undefined) w.liftLeft = WAR_LIFT;
  const cmd = warCommand(w.weeksThisQuarter);
  const canOrder = w.weeksThisQuarter >= WAR_CMD_ORDER_WEEKS;
  const airUsed = warFrontsOf(w).reduce((a, f) => a + f.air, 0);
  const airLeft = WAR_AIR_POOL - airUsed;
  const proj = warTurnPreview(w);

  el.appendChild(h(`<div class="fade-in">
    ${tickerBar([
      ['Quarter', `${w.turn + 1} of the war`],
      ['Their will', Math.round(w.enemyWill), w.enemyWill < 30 ? 'g' : ''],
      ['Your patience', Math.round(w.homeWill), w.homeWill < 30 ? 'r' : ''],
      ['Casualties', `${w.casualties.toFixed(1)}k`],
      ['In reserve', `${w.reserve.toFixed(1)} div`],
      ['Munitions', Math.round(w.munitions)],
      ['Command', `${Math.round(cmd * 100)}%`, canOrder ? '' : 'r']
    ], 'The Theatre')}
    <div class="split">
      <div>
        <div class="panel">
          <div class="panel-head"><h2>The Fronts</h2><span class="spacer"></span>
            <span class="sub" id="liftsub"></span></div>
          <div class="front-ends" style="margin-bottom:6px">
            <span>${esc(WAR_THEATRE.foeAdj)} objective</span><span>the frontier</span><span>their ground</span></div>
          <div id="fronts"></div>
        </div>
      </div>
      <div class="rail">
        <div class="panel">
          <div class="panel-head"><h2>The Two Clocks</h2><span class="sub">whichever empties first</span></div>
          ${willBars(w)}
          <div class="tiny muted">Their will falls when you take ground they value and when their
            formations are destroyed. Yours falls on casualties, on time, and fastest of all on a
            quarter in which nothing happened. Approval and cross-aisle goodwill at home slow it.</div>
          <div class="kpi" style="margin-top:10px">
            <div><span class="k">Their will, this quarter</span><span class="v ${proj.enemyWill < 0 ? 'g' : 'r'}">${sgn(proj.enemyWill, 1)}</span></div>
            <div><span class="k">Your casualties</span><span class="v">${proj.out.casualties.toFixed(1)}k</span></div>
          </div>
          <div class="tiny muted" style="margin-top:6px">${proj.enemyWill < -4
            ? 'These orders break them faster than the country is tiring of it.'
            : proj.enemyWill < 0 ? 'These orders grind them down, slowly.'
            : 'These orders do not move them. A quarter like this one is a quarter they win.'}</div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Your Time</h2><span class="sub">${g.weeks} weeks left this quarter</span></div>
          <div id="weeks"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Sorties</h2><span class="sub">${airLeft} of ${WAR_AIR_POOL} unassigned</span></div>
          <div class="tiny muted">Sorties do two things: they multiply whatever a front is already
            doing, and they close the intelligence band on what is in front of it. An envelopment
            without them is a guess.</div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Not on the Board</h2><span class="sub">what only a president can do</span></div>
          <div id="escs"></div>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>The Wire</h2></div>
          <div class="log" id="log"></div>
        </div>
      </div>
    </div>
    <div class="btn-row" style="margin:16px 0">
      <button class="btn primary" id="back">← Back to the Desk</button>
      <span class="muted small" id="ordsub"></span>
    </div>
  </div>`));

  el.querySelector('#liftsub').textContent = canOrder
    ? `${w.liftLeft.toFixed(1)} divisions still movable this quarter`
    : `Orders need ${WAR_CMD_ORDER_WEEKS} weeks of your time`;
  el.querySelector('#ordsub').textContent = canOrder
    ? `Orders stand until you change them. They resolve when the quarter ends.`
    : `The theatre is running itself on last quarter's orders.`;

  /* ---- weeks ---- */
  const wk = el.querySelector('#weeks');
  wk.innerHTML = `<div class="stepper" style="margin-bottom:6px">
      <button id="wdn">−</button><span class="sv">${w.weeksThisQuarter} wk</span><button id="wup">+</button>
      <span class="tiny muted" style="margin-left:8px">command ${Math.round(cmd * 100)}%</span></div>
    <div class="tiny muted">${canOrder
      ? 'Enough to give orders. Every further week is executed staff work rather than a memo — it raises what every front does, on offence and on defence.'
      : `Below ${WAR_CMD_ORDER_WEEKS} weeks the theatre runs on the orders it already has and runs them badly.`}</div>`;
  const wdn = wk.querySelector('#wdn'), wup = wk.querySelector('#wup');
  wdn.disabled = w.weeksThisQuarter <= 0;
  wup.disabled = w.weeksThisQuarter >= WAR_CMD_MAX_WEEKS || g.weeks <= 0;
  wdn.onclick = () => { w.weeksThisQuarter--; g.weeks++; render(); };
  wup.onclick = () => { w.weeksThisQuarter++; g.weeks--; render(); };

  /* ---- the fronts ---- */
  const fw = el.querySelector('#fronts');
  for (const F of WAR_FRONTS) {
    const f = w.fronts[F.id];
    const est = warEstimate(f);
    const yc = f.yours / F.frontage;
    const row = h(`<div class="front ${f.posture === 'assault' || f.posture === 'envelop' ? 'main' : ''}">
      <div class="fh"><span class="fn">${esc(F.name)}</span>
        <span class="ft">${esc(F.terrain)} · ${F.frontage.toFixed(0)} div frontage</span>
        <span class="spacer"></span>
        <span class="fv">worth ${F.value}</span></div>
      <div class="fnote">${esc(F.blurb)}</div>
      ${frontBar(f, F, { delta: canOrder ? warOrderPreview(w, F.id, f.posture).delta : 0 })}
      ${f.line <= -0.985 ? `<div class="fnote" style="color:var(--gop-lt)">This front has collapsed onto the
        ${esc(WAR_THEATRE.foeAdj)} objective line. There is no more ground here to lose, which is why every
        order below reads as nothing — the only figures that still move are the casualties and what
        pulling out would free up.</div>`
        : f.line >= 0.985 ? `<div class="fnote" style="color:var(--green-lt)">You hold everything this front
        has to give. Weight kept here past this point is buying nothing.</div>` : ''}
      <div class="fstats">
        <span>yours <b>${f.yours.toFixed(1)}</b> div ${yc < 0.9 ? '<span class="warn">· line is porous</span>' : ''}</span>
        <span>theirs <b>${est.lo.toFixed(1)}–${est.hi.toFixed(1)}</b>
          <span class="intel-band" style="width:${Math.round(6 + est.err * 60)}px"></span></span>
        <span>supply <b>${Math.round(f.supply * 100)}%</b></span>
        <span>dug in <b>${Math.round(f.dug * 100)}%</b></span>
        <span>they are <b>${WAR_POSTURES[f.ePosture].id === 'hold' ? 'holding' : 'pushing'}</b>${f.intel < 0.5 ? ' <span class="warn">(unconfirmed)</span>' : ''}</span>
      </div>
      <div class="postures" data-f="${F.id}"></div>
      <div class="fstats" style="margin-top:8px;align-items:center">
        <span>divisions <span class="stepper" data-d="${F.id}"></span></span>
        <span>sorties <span class="stepper" data-a="${F.id}"></span></span>
      </div>
    </div>`);

    /* Four postures, each priced by the engine that will resolve them, against
       the intelligence estimate rather than against the truth. */
    const pw = row.querySelector('.postures');
    for (const P of WAR_POSTURE_LIST) {
      const pv = warOrderPreview(w, F.id, P.id);
      const need = P.needsAir && f.air <= 0;
      const b = h(`<button class="pbtn ${f.posture === P.id ? 'on' : ''} ${need ? 'bad' : ''}">
        <div class="pn">${esc(P.name)}</div>
        <div class="pv ${pv.delta > 0.005 ? 'g' : pv.delta < -0.005 ? 'r' : ''}">${sgn(pv.delta * 100, 0)}
          <span class="pb" style="display:inline">±${Math.round(pv.band * 50)}</span></div>
        <div class="pb">${pv.cas.toFixed(1)}k lost${pv.released ? ` · frees ${pv.released.toFixed(1)}` : ''}</div>
        ${need ? '<div class="pb" style="color:var(--amber)">no sorties overhead</div>' : ''}
      </button>`);
      b.title = P.blurb;
      if (canOrder) b.onclick = () => { f.posture = P.id; render(); };
      else b.classList.add('bad');
      pw.appendChild(b);
    }

    /* Divisions: moved against the quarter's lift, through the reserve. */
    const dv = row.querySelector('[data-d]');
    const step = 0.5;
    dv.innerHTML = `<button data-x="-1">−</button><span class="sv">${f.yours.toFixed(1)}</span><button data-x="1">+</button>`;
    const [dm, dp] = dv.querySelectorAll('button');
    dm.disabled = !canOrder || f.yours < step + 0.25 || w.liftLeft < step;
    dp.disabled = !canOrder || w.reserve < step || w.liftLeft < step
      || f.yours >= F.frontage * WAR_DENSITY_CAP;
    dm.onclick = () => { f.yours -= step; w.reserve += step; w.liftLeft -= step; render(); };
    dp.onclick = () => { f.yours += step; w.reserve -= step; w.liftLeft -= step; render(); };
    dp.title = f.yours >= F.frontage * WAR_DENSITY_CAP
      ? 'This front cannot absorb any more. Anything else sent here is a traffic problem.' : '';

    const av = row.querySelector('[data-a]');
    av.innerHTML = `<button data-x="-1">−</button><span class="sv">${f.air}</span><button data-x="1">+</button>`;
    const [am, ap] = av.querySelectorAll('button');
    am.disabled = !canOrder || f.air <= 0;
    ap.disabled = !canOrder || airLeft <= 0;
    am.onclick = () => { f.air--; render(); };
    ap.onclick = () => { f.air++; render(); };

    fw.appendChild(row);
  }

  /* ---- escalations ---- */
  const ew = el.querySelector('#escs');
  for (const E of WAR_ESCALATIONS) {
    const avail = warEscalationAvailable(w, E, g);
    const ok = avail && g.capital >= E.capital && g.weeks >= E.weeks;
    const why = !avail
      ? (E.needs ? `Needs ${Object.entries(E.needs).map(([k, v]) => `${v} ${k === 'bipartisan' ? 'cross-aisle goodwill' : k}`).join(', ')}.` : 'Already done.')
      : g.weeks < E.weeks ? `Needs ${E.weeks} week${E.weeks === 1 ? '' : 's'}; ${g.weeks} left.`
      : g.capital < E.capital ? `Needs ${E.capital} capital.` : null;
    const extra = E.id === 'strike' && w.strikes
      ? `<div class="tiny" style="color:var(--amber);margin-top:3px">Campaign ${w.strikes + 1}. Each one buys less than the last and hands back more.</div>` : '';
    // Opening a channel has no effects object because what it does is end the
    // war on whatever the map says this morning. Say that instead of the
    // "no measurable effect" the generic summariser produces for an empty one.
    const t = E.id === 'talks' ? warTerms(w) : null;
    const tags = t
      ? `<span class="eff-tags"><span class="eff-tag ${WAR_ENDINGS[t.id].grade >= 0 ? 'good' : 'bad'}">Terms today <b>${esc(t.label)}</b></span></span>`
      : effectTags(effectSummary(E.eff, 'gov'));
    const row = h(`<div class="esc ${ok ? '' : 'stripped'}">
      <div class="top"><div class="nm">${esc(E.name)}</div>
        <div class="cost">${E.weeks} wk · ${E.capital} cap</div></div>
      <div class="note">${esc(E.desc)}</div>
      ${why ? `<div class="blocked">${esc(why)}</div>` : ''}${extra}
      ${tags}</div>`);
    if (ok) row.onclick = () => doWarEscalation(E);
    ew.appendChild(row);
  }

  renderLog(el.querySelector('#log'));
  el.querySelector('#back').onclick = () => { G.screen = 'govern'; render(); };
}

async function doWarEscalation(E) {
  const g = G.gov, w = g.war;
  if (E.id === 'talks') {
    const t = warTerms(w);
    const idx = await showModal({
      kicker: 'A Third Country, A Hotel', title: 'Open a Channel',
      text: `Terms are exactly as good as the line on the map this morning, and the line this morning
        is <b>${esc(t.label.toLowerCase())}</b>.<br><br>
        Their will to keep fighting stands at <b>${Math.round(w.enemyWill)}</b>; your own country's
        patience stands at <b>${Math.round(w.homeWill)}</b>. Whichever of those two numbers is lower
        is the one the other side is reading.`,
      choices: [
        { label: `Sign — ${t.label}`, tags: `<span class="eff-tags"><span class="eff-tag ${WAR_ENDINGS[t.id].grade >= 0 ? 'good' : 'bad'}">Legacy <b>${sgn(WAR_ENDINGS[t.id].grade, 0)}</b></span></span>` },
        { label: 'Keep fighting for a better line' }
      ]
    });
    if (idx === 1) return;
    g.capital -= E.capital; g.weeks -= E.weeks;
    await finishWar(t, 'armistice');
    return render();
  }
  g.capital -= E.capital;
  g.weeks -= E.weeks;
  warEscalate(w, E.id);
  applyGovEffect(E.eff);
  logMsg(`${E.name}.`, E.id === 'strike' ? 'bad' : '', `Q${g.quarter}`);
  render();
}
