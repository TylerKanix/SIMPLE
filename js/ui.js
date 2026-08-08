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

/* ---- signed deltas -------------------------------------------------------
   The workhorse of the whole "is this good or bad" layer. Direction is
   carried by a glyph as well as by hue, so the readout survives a colourblind
   reader, a greyscale screenshot, and a projector. */
function delta(v, opts) {
  opts = opts || {};
  const dp = opts.dp === undefined ? 1 : opts.dp;
  const dead = opts.dead === undefined ? 0.05 : opts.dead;
  if (Math.abs(v) < dead) return `<span class="delta flat">—</span>`;
  const goodUp = opts.goodUp === false ? -1 : 1;
  const good = v * goodUp > 0;
  const arrow = v > 0 ? '▲' : '▼';
  return `<span class="delta ${good ? 'up' : 'down'}" ${opts.title ? `title="${esc(opts.title)}"` : ''}>${
    arrow} ${Math.abs(v).toFixed(dp)}${opts.unit || ''}</span>`;
}

/* A labelled delta: the label in ink, the number in its own colour. */
function deltaRow(label, v, opts) {
  return `<div class="drow"><span class="dk">${esc(label)}</span>${delta(v, opts)}</div>`;
}

/* ---- event consequences --------------------------------------------------
   Every tag here corresponds to a key the engine reads. Nothing decorative
   gets in: a consequence that is shown is a consequence that happens. */
function effectTags(list) {
  if (!list.length) return '<span class="eff-none">No measurable effect.</span>';
  return `<span class="eff-tags">${list.map(e => `<span class="eff-tag ${e.good ? 'good' : 'bad'}">${
    esc(e.label)} <b>${e.value > 0 ? '+' : '−'}${Math.abs(e.value)}${e.unit}</b></span>`).join('')}</span>`;
}

/* ---- trend chart ---------------------------------------------------------
   One series, so it needs no legend — the panel heading names it. Faint
   reference line, thin 2px stroke, soft area fill, and the current value
   called out at the end, which is the only point anybody reads first. */
function sparkline(points, opts) {
  opts = opts || {};
  // The viewBox is sized close to the box it renders into. Stretching a narrow
  // one to fit would scale x and y by different factors, which thickens the
  // stroke in one direction and turns the endpoint dot into an ellipse.
  const w = opts.w || 480, ht = opts.h || 58, pad = 3;
  if (!points || points.length < 2) {
    return `<div class="spark-empty">Not enough history yet.</div>`;
  }
  const lo = opts.min !== undefined ? opts.min : Math.min(...points) - 2;
  const hi = opts.max !== undefined ? opts.max : Math.max(...points) + 2;
  const span = Math.max(0.001, hi - lo);
  const x = i => pad + (i / (points.length - 1)) * (w - pad * 2);
  const y = v => pad + (1 - (v - lo) / span) * (ht - pad * 2);

  const line = points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const area = `${line}L${x(points.length - 1).toFixed(1)},${ht - pad}L${x(0).toFixed(1)},${ht - pad}Z`;
  const last = points[points.length - 1];
  const col = opts.color || 'var(--gold)';
  const ref = opts.ref !== undefined && opts.ref > lo && opts.ref < hi
    ? `<line x1="${pad}" x2="${w - pad}" y1="${y(opts.ref).toFixed(1)}" y2="${y(opts.ref).toFixed(1)}"
         stroke="var(--line-2)" stroke-width="1" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>` : '';

  return `<svg class="spark" viewBox="0 0 ${w} ${ht}" preserveAspectRatio="none" role="img"
      aria-label="${esc(opts.label || 'trend')}: ${points.map(p => p.toFixed(0)).join(', ')}">
    <defs><linearGradient id="${opts.id || 'sg'}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="${col}" stop-opacity=".28"/>
      <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
    </linearGradient></defs>
    ${ref}
    <path d="${area}" fill="url(#${opts.id || 'sg'})"/>
    <path d="${line}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round"
      stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    <circle cx="${x(points.length - 1).toFixed(1)}" cy="${y(last).toFixed(1)}" r="3" fill="${col}"
      stroke="var(--bg-2)" stroke-width="2" vector-effect="non-scaling-stroke"/>
  </svg>`;
}

/* Blue/red by Democratic margin — a diverging scale with a genuinely neutral
   grey at the midpoint, so a tied state does not read as leaning. */
function marginColor(dm) {
  const a = Math.min(1, Math.abs(dm) / 0.18);
  const hue = dm >= 0 ? 214 : 4;
  const sat = 14 + 52 * a;
  const light = 19 + 27 * a;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

function leanTag(frac) {
  if (frac >= 0.80) return ['y', 'YES'];
  if (frac >= 0.60) return ['ly', 'LEAN Y'];
  if (frac >= 0.40) return ['u', 'SPLIT'];
  if (frac >= 0.20) return ['ln', 'LEAN N'];
  return ['n', 'NO'];
}

/* Named lean, used wherever a raw margin is less useful than a category. */
function leanLabel(m) {
  const a = Math.abs(m);
  const who = m > 0 ? 'you' : 'them';
  if (a < 1) return 'a genuine toss-up';
  if (a < 3) return `a toss-up tilting ${who}`;
  if (a < 6) return `lean ${who}`;
  if (a < 12) return `likely ${who}`;
  return `safe ${who}`;
}

/* ---- shared map tooltip --------------------------------------------------
   A real card rather than a native title attribute: the browser tooltip takes
   a second to appear and cannot show a table, and this map is something the
   player scrubs across rather than rests on. */
let _tip;
function tooltip() {
  if (!_tip) {
    _tip = document.createElement('div');
    _tip.className = 'tip';
    document.body.appendChild(_tip);
  }
  return _tip;
}
function showTip(html, ev) {
  const t = tooltip();
  t.innerHTML = html;
  t.classList.add('on');
  const pad = 14, r = t.getBoundingClientRect();
  let x = ev.clientX + pad, y = ev.clientY + pad;
  if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - pad;
  if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - pad;
  t.style.left = Math.max(8, x) + 'px';
  t.style.top = Math.max(8, y) + 'px';
}
function hideTip() { if (_tip) _tip.classList.remove('on'); }

/* ---- tile-grid electoral map --------------------------------------------- */
function renderMap(container, results, opts) {
  opts = opts || {};
  const byAbbr = {};
  (results || []).forEach(r => byAbbr[r.abbr] = r);
  const playerDir = opts.playerParty === 'D' ? 1 : -1;

  const wrap = document.createElement('div');
  wrap.className = 'map' + (opts.big ? ' big' : '');
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
      if (r && opts.flash && opts.flash === abbr) t.classList.add('called');
      const dm = r ? r.margin * playerDir : 0;
      t.style.background = r && !opts.hideResults ? marginColor(dm) : 'var(--bg-3)';
      t.innerHTML = `<span class="ab">${abbr}</span><span class="ev">${st.ev}</span>` +
        (r && opts.showMargins ? `<span class="mg">${sgn(r.margin * 100, 0)}</span>` : '');

      t.onmousemove = e => showTip(tileTip(st, r, opts), e);
      t.onmouseleave = hideTip;
      if (opts.onClick) t.onclick = () => { hideTip(); opts.onClick(abbr); };
      if (opts.badge && opts.badge[abbr]) {
        const b = document.createElement('span');
        b.className = 'badge';
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
    <span>${opts.playerParty === 'D' ? 'THEM' : 'YOU'} +15</span>
    ${[-0.16, -0.10, -0.05, -0.015, 0.015, 0.05, 0.10, 0.16].map(v => `<i style="background:${marginColor(v)}"></i>`).join('')}
    <span>${opts.playerParty === 'D' ? 'YOU' : 'THEM'} +15</span></div>`);
  container.appendChild(leg);
}

function tileTip(st, r, opts) {
  const eff = opts.efforts && opts.efforts[st.abbr];
  const spent = eff ? Math.round(eff.persuade + eff.ground + eff.digital) : 0;
  const rows = [];
  if (r) {
    rows.push(['Margin', `<b class="${r.margin > 0 ? 'g' : 'r'}">${sgn(r.margin * 100, 1)}</b> — ${leanLabel(r.margin * 100)}`]);
    if (opts.baseline && opts.baseline[st.abbr] !== undefined) {
      const sw = (r.margin - opts.baseline[st.abbr]) * 100;
      rows.push(['vs. a generic nominee', `<b class="${sw > 0 ? 'g' : 'r'}">${sgn(sw, 1)}</b>`]);
    }
    if (opts.elasticity && opts.elasticity[st.abbr] !== undefined) {
      const e = opts.elasticity[st.abbr];
      rows.push(['Elasticity', `${e.toFixed(2)}× — ${e > 1.15 ? 'swings hard' : e < 0.85 ? 'barely moves' : 'average'}`]);
    }
  }
  if (spent) rows.push(['Invested here', `${spent} effort`]);
  return `<div class="tip-h">${esc(st.name)} <span>${st.ev} EV</span></div>
    ${rows.map(([k, v]) => `<div class="tip-r"><span>${k}</span><span>${v}</span></div>`).join('')}
    ${opts.onClick ? '<div class="tip-f">Click for the full state file</div>' : ''}`;
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
    <div class="tiny muted center" style="margin-top:5px">270 TO WIN${
      evP >= 270 ? ' · <span style="color:var(--green)">YOU ARE OVER THE LINE</span>' :
      evP ? ` · <span style="color:var(--amber)">${270 - evP} SHORT</span>` : ''}</div>`;
}

/* ---- bloc support bars ---------------------------------------------------
   The bar is support; the rule under the name is how much of the electorate
   that support is worth. A bloc you are winning 70–30 and a bloc you are
   winning 70–30 that happens to be four times larger are not the same fact,
   and the previous version drew them identically. */
function renderBlocBars(container, player, opp, weightsById, opts) {
  opts = opts || {};
  const uP = opts.primary ? player.uMapPrim : player.uMap;
  const uO = opts.primary ? opp.uMapPrim : opp.uMap;
  const rows = BLOCS.map(b => {
    const share = logistic((uP[b.id] - uO[b.id]) * 1.25);
    const w = weightsById ? weightsById[b.id] : 1 / BLOCS.length;
    return { b, share, w };
  }).sort((a, b) => b.share - a.share);
  const maxW = Math.max(...rows.map(r => r.w));

  container.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'bloc-list';
  for (const r of rows) {
    const win = r.share >= 0.5;
    const inten = Math.min(1, Math.abs(r.share - .5) / .25);
    const hue = (win ? player.party.id : (player.party.id === 'D' ? 'R' : 'D')) === 'D' ? 214 : 4;
    const col = `hsl(${hue}, ${18 + 52 * inten}%, ${26 + 24 * inten}%)`;
    const el = h(`<div class="bloc">
        <span class="nm">${esc(r.b.name)}<i style="width:${(r.w / maxW * 100).toFixed(0)}%"></i></span>
        <span class="bar"><span class="fill" style="width:${(r.share * 100).toFixed(1)}%;background:${col}"></span><span class="mid"></span></span>
        <span class="pct ${win ? 'g' : 'r'}">${(r.share * 100).toFixed(0)}</span>
      </div>`);
    el.onmousemove = e => showTip(
      `<div class="tip-h">${esc(r.b.name)}</div>
       <div class="tip-r"><span>Your share</span><span><b class="${win ? 'g' : 'r'}">${(r.share * 100).toFixed(1)}%</b></span></div>
       <div class="tip-r"><span>Share of the electorate</span><span>${(r.w * 100).toFixed(1)}%</span></div>
       <div class="tip-r"><span>Turnout propensity</span><span>${r.b.turnout.toFixed(2)}×</span></div>`, e);
    el.onmouseleave = hideTip;
    list.appendChild(el);
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
      `<button class="choice" data-i="${i}">
         <span class="cl">${esc(c.label)}</span>
         ${c.hint ? `<span class="eff">${esc(c.hint)}</span>` : ''}
         ${c.tags ? c.tags : ''}
       </button>`
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
    const first = bg.querySelector('.choice');
    if (first) first.focus();
  });
}

/* A dismissable panel for reference material — dossiers, state files — where
   the player is reading rather than choosing. */
function showSheet(title, kicker, html) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal sheet fade-in">
    <div class="m-head">
      ${kicker ? `<div class="kicker">${esc(kicker)}</div>` : ''}
      <h3>${esc(title)}</h3>
      <button class="x" aria-label="Close">✕</button>
    </div>
    <div class="m-body">${html}</div></div>`;
  const close = () => { if (bg.parentNode) document.body.removeChild(bg); hideTip(); };
  bg.querySelector('.x').onclick = close;
  bg.onclick = e => { if (e.target === bg) close(); };
  document.addEventListener('keydown', function esc2(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc2); }
  });
  document.body.appendChild(bg);
  return bg;
}

/* ---- the lower third -----------------------------------------------------
   Labelled figures rather than a sentence, because every one of them is a
   number the player is about to decide something with. */
function tickerBar(items, live) {
  return `<div class="ticker">${live ? `<span class="live">${esc(live)}</span>` : ''}${
    items.filter(Boolean).map(([k, v, cls]) =>
      `<span class="tk"><b>${esc(k)}</b><span class="${cls || ''}">${v}</span></span>`).join('')}</div>`;
}

/* ---- topbar stats --------------------------------------------------------- */
function statBlock(k, v, cls) {
  return `<div class="stat ${cls || ''}"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`;
}
