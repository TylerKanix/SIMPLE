/* ==========================================================================
   MANDATE — rendering helpers
   ========================================================================== */

/* Build an element from markup. This uses <template> rather than a <div>
   because the HTML parser silently discards table-scoped tags (<tr>, <td>,
   <tbody>) when they are assigned into a non-table container, which would
   make every table in the game render empty. */
function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function pct(x, d) { return (x * 100).toFixed(d === undefined ? 1 : d) + '%'; }
function sgn(x, d) { const v = x.toFixed(d === undefined ? 1 : d); return (x > 0 ? '+' : '') + v; }
function money(x) { return '$' + Math.round(x) + 'M'; }
function bn(x) { return (x < 0 ? '−$' : '$') + Math.abs(Math.round(x)) + 'B'; }

/* Blue/red by Democratic margin. */
function marginColor(dm) {
  const a = Math.min(1, Math.abs(dm) / 0.18);
  const hue = dm >= 0 ? 214 : 4;
  const sat = 16 + 48 * a;
  const light = 21 + 25 * a;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

function leanTag(frac) {
  if (frac >= 0.80) return ['y', 'YES'];
  if (frac >= 0.60) return ['ly', 'LEAN Y'];
  if (frac >= 0.40) return ['u', 'SPLIT'];
  if (frac >= 0.20) return ['ln', 'LEAN N'];
  return ['n', 'NO'];
}

/* ---- tile-grid electoral map --------------------------------------------- */
function renderMap(container, results, opts) {
  opts = opts || {};
  const byAbbr = {};
  (results || []).forEach(r => byAbbr[r.abbr] = r);
  const playerDir = opts.playerParty === 'D' ? 1 : -1;

  const wrap = document.createElement('div');
  wrap.className = 'map';
  for (const row of TILE_MAP) {
    const rowEl = document.createElement('div');
    rowEl.className = 'map-row';
    for (const abbr of row) {
      const t = document.createElement('div');
      if (!abbr) { t.className = 'tile empty'; rowEl.appendChild(t); continue; }
      const st = STATE_BY_ABBR[abbr];
      const r = byAbbr[abbr];
      t.className = 'tile';
      if (opts.target === abbr) t.classList.add('target');
      const dm = r ? r.margin * playerDir : 0;
      t.style.background = r && !opts.hideResults ? marginColor(dm) : '#1a2029';
      t.style.color = '#e7edf5';
      t.innerHTML = `<span>${abbr}</span><span class="ev">${st.ev}</span>`;
      const marginTxt = r ? `${(Math.abs(r.margin) * 100).toFixed(1)} pts ${r.margin > 0 ? 'you' : 'them'}` : '';
      t.title = `${st.name} — ${st.ev} EV${r ? '\n' + marginTxt : ''}`;
      if (opts.onClick) t.onclick = () => opts.onClick(abbr);
      if (opts.badge && opts.badge[abbr]) {
        const b = document.createElement('span');
        b.className = 'ev';
        b.style.color = '#ffd77a';
        b.textContent = opts.badge[abbr];
        t.appendChild(b);
      }
      rowEl.appendChild(t);
    }
    wrap.appendChild(rowEl);
  }
  container.innerHTML = '';
  container.appendChild(wrap);

  const leg = h(`<div class="map-legend">
    <span style="margin-right:6px">R +15</span>
    ${[-0.16, -0.10, -0.05, -0.015, 0.015, 0.05, 0.10, 0.16].map(v => `<i style="background:${marginColor(v)}"></i>`).join('')}
    <span style="margin-left:6px">D +15</span></div>`);
  container.appendChild(leg);
}

/* ---- electoral vote bar --------------------------------------------------- */
function renderEvBar(container, evP, evO, playerParty) {
  const total = 538;
  const pw = evP / total * 100, ow = evO / total * 100;
  const pc = playerParty === 'D' ? 'var(--dem)' : 'var(--gop)';
  const oc = playerParty === 'D' ? 'var(--gop)' : 'var(--dem)';
  container.innerHTML = `
    <div class="evbar">
      <div class="side l" style="width:${pw}%;background:${pc}">${evP}</div>
      <div class="gap"></div>
      <div class="side r" style="width:${ow}%;background:${oc}">${evO}</div>
      <div class="needle"></div>
    </div>
    <div class="tiny muted center" style="margin-top:5px">270 to win</div>`;
}

/* ---- bloc support bars ---------------------------------------------------- */
function renderBlocBars(container, player, opp, weightsById) {
  const rows = BLOCS.map(b => {
    const diff = player.uMap[b.id] - opp.uMap[b.id];
    const share = 1 / (1 + Math.exp(-diff * 1.25));
    const w = weightsById ? weightsById[b.id] : 1 / BLOCS.length;
    return { b, share, w };
  }).sort((a, b) => b.share - a.share);

  container.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'bloc-list';
  for (const r of rows) {
    const col = r.share >= 0.5
      ? `hsl(${player.party.id === 'D' ? 214 : 4}, ${20 + 50 * Math.min(1, (r.share - .5) / .25)}%, ${24 + 24 * Math.min(1, (r.share - .5) / .25)}%)`
      : `hsl(${player.party.id === 'D' ? 4 : 214}, ${20 + 50 * Math.min(1, (.5 - r.share) / .25)}%, ${24 + 24 * Math.min(1, (.5 - r.share) / .25)}%)`;
    list.appendChild(h(`<div class="bloc">
        <span class="nm" title="${esc(r.b.name)} — ${pct(r.w, 1)} of the electorate">${esc(r.b.name)}</span>
        <span class="bar"><span class="fill" style="width:${(r.share * 100).toFixed(1)}%;background:${col}"></span><span class="mid"></span></span>
        <span class="pct" style="color:${r.share >= .5 ? '#8fd6ab' : '#e5978c'}">${(r.share * 100).toFixed(0)}</span>
      </div>`));
  }
  container.appendChild(list);
}

/* ---- vote meter ----------------------------------------------------------- */
function voteMeter(label, yes, need, total) {
  const pass = yes >= need;
  const w = Math.min(100, yes / total * 100);
  const tx = need / total * 100;
  return `<div class="vote-meter ${pass ? 'pass' : 'fail'}">
    <div class="lbl"><span>${label}</span><span class="mono">${yes} / ${need} needed</span></div>
    <div class="track">
      <div class="fill" style="width:${w}%"></div>
      <div class="thresh" style="left:${tx}%"></div>
      <div class="val">${yes} YES &nbsp;·&nbsp; ${pass ? 'PASSES' : 'SHORT BY ' + (need - yes)}</div>
    </div></div>`;
}

/* ---- modal ---------------------------------------------------------------- */
function showModal(opts) {
  return new Promise(resolve => {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    const body = opts.choices.map((c, i) =>
      `<button class="choice" data-i="${i}">${esc(c.label)}${c.hint ? `<div class="eff">${esc(c.hint)}</div>` : ''}</button>`
    ).join('');
    bg.innerHTML = `<div class="modal fade-in">
      <div class="m-head">
        ${opts.kicker ? `<div class="kicker">${esc(opts.kicker)}</div>` : ''}
        <h3>${esc(opts.title)}</h3>
      </div>
      <div class="m-body">
        ${opts.text ? `<p>${opts.text}</p>` : ''}
        ${opts.html || ''}
        ${body}
      </div></div>`;
    bg.querySelectorAll('.choice').forEach(btn => {
      btn.onclick = () => { document.body.removeChild(bg); resolve(parseInt(btn.dataset.i, 10)); };
    });
    document.body.appendChild(bg);
  });
}

/* ---- topbar stats --------------------------------------------------------- */
function statBlock(k, v, cls) {
  return `<div class="stat ${cls || ''}"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`;
}
