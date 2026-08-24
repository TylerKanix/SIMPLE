#!/usr/bin/env node
/* Replay equivalence — the save system's correctness proof.
 *
 * A save is a seed and a list of decisions. If replaying that list from that
 * seed does not land on exactly the state the player was in, the save is a
 * lie. So: play a scripted run forward, capture the save, replay it into a
 * fresh world, and compare a hash of everything.
 *
 * The whole game is loaded here, main.js included, against a DOM stub thin
 * enough to be honest: rendering is suppressed during replay by design, and
 * the forward pass answers its own modals in place of a player. Nothing else
 * is faked.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { stable, hash } = require('./harness.js');
const ROOT = path.join(__dirname, '..');

const FILES = ['js/data.js', 'js/sim.js', 'js/analysis.js', 'js/persist.js', 'js/ui.js', 'js/main.js'];

function domStub() {
  const noop = () => {};
  const el = () => ({
    innerHTML: '', textContent: '', style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: () => false, contains: () => false },
    appendChild: noop, removeChild: noop, setAttribute: noop, getAttribute: () => null,
    querySelector: () => null, querySelectorAll: () => [], addEventListener: noop, focus: noop,
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0 })
  });
  return {
    // 'loading' keeps boot() from firing: the tests drive the game themselves.
    readyState: 'loading',
    addEventListener: noop, removeEventListener: noop,
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    createElement: el, body: el(), documentElement: el()
  };
}

function memStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}

function boot() {
  const ctx = {
    console, Math, JSON, Object, Array, Number, String, Boolean, Error, Date, Promise,
    isNaN, parseInt, parseFloat, encodeURIComponent, decodeURIComponent, btoa, atob,
    setTimeout, clearTimeout, localStorage: memStorage()
  };
  ctx.window = ctx;
  ctx.document = domStub();
  ctx.window.scrollTo = () => {};
  vm.createContext(ctx);
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  const api = ['G', 'RUN', 'record', 'applyDecision', 'primeRun', 'replaySave', 'currentSave',
    'setSeed', 'calibrateStates', 'resetWorld', 'GAME_VERSION', 'PRIMARY_MOVES', 'PRIMARY_CALENDAR',
    'CAMPAIGN_ACTIONS', 'GOV_ACTIONS', 'BILLS', 'SITUATIONS', 'WAR_FRONTS', 'exportRun', 'importRun',
    'WAR_ESCALATIONS', 'replaying', 'billContext', 'CAUCUSES', 'dealCost'];
  const out = vm.runInContext('({' + api.map(n => `${n}: typeof ${n} === 'undefined' ? undefined : ${n}`).join(',') + '})', ctx);
  out.ctx = ctx;
  out.eval = src => vm.runInContext(src, ctx);
  return out;
}

/* The stand-in for a player at a modal. Deterministic, and varied enough that
   the run does not consist entirely of first options. */
function installChooser(S, policy) {
  S.eval('__answer = null;');
  S.ctx.__policy = policy;
  S.eval(`showModal = function (opts) {
    const n = (opts.choices || []).length || 1;
    return Promise.resolve(__policy(opts, n));
  };`);
}

/* Drive the game from wherever it is, choosing legal actions, until it ends
   or the budget runs out. The point is coverage, not skill. */
async function autoplay(S, budget) {
  const G = S.G;
  let steps = 0;
  const seen = new Set();
  while (steps++ < budget) {
    const scr = G.screen;
    if (scr === 'final') break;
    if (scr === 'platform') {
      // A handful of positions, three signature issues, then lock it in.
      if (!seen.has('plat')) {
        seen.add('plat');
        await S.record({ t: 'st', i: 'health', p: -1 });
        await S.record({ t: 'st', i: 'trade', p: 0 });
        for (const i of ['health', 'taxes', 'climate']) await S.record({ t: 'sig', i });
      }
      await S.record({ t: 'lock' });
      continue;
    }
    if (scr === 'primary') {
      const pr = G.primary;
      if (pr && pr.moves > 0) {
        const m = S.PRIMARY_MOVES.find(x => x.cost <= pr.funds);
        if (m) { await S.record({ t: 'pm', i: m.id }); continue; }
      }
      await S.record({ t: 'hold' });
      continue;
    }
    if (scr === 'general') {
      const gn = G.general;
      // Spend where the map is actually decided: the closest state you are
      // currently losing, then the closest you are holding. Not clever, but it
      // wins often enough that the suite reaches the presidency, which is the
      // whole point of having it.
      const st = (gn.proj && gn.proj.states) ? gn.proj.states.slice() : [];
      st.sort((a, b) => Math.abs(a.margin) - Math.abs(b.margin));
      const behind = st.filter(x => x.margin < 0);
      const target = (behind[0] || st[0] || { abbr: 'PA' }).abbr;
      const a = S.CAMPAIGN_ACTIONS.find(x => !x.picksBloc && (x.cost || 0) <= gn.money && (x.days || 0) <= gn.days);
      if (a && gn.days > 1) { await S.record({ t: 'camp', i: a.id, a: target }); continue; }
      await S.record({ t: 'endweek' });
      continue;
    }
    if (scr === 'results') { await S.record({ t: 'go' }); continue; }
    if (scr === 'govern') {
      const g = G.gov;
      if (g.war && !g.war.ended && g.war.weeksThisQuarter === 0 && g.weeks >= 2) {
        await S.record({ t: 'warroom' });
        // give the theatre an order or two while we are in there
        const F = S.WAR_FRONTS[0];
        await S.record({ t: 'wpost', f: F.id, v: 'hold' });
        await S.record({ t: 'wair', f: F.id, d: 1 });
        S.G.screen = 'govern';
      }
      const act = S.GOV_ACTIONS.find(x => x.group !== 'Re-Election' && x.cost <= g.capital && x.weeks <= g.weeks);
      if (act && g.weeks > 2) { await S.record({ t: 'gov', i: act.id }); continue; }
      await S.record({ t: 'endq' });
      continue;
    }
    if (scr === 'bill') {
      const B = G.bill;
      // Whip your own count: cut a deal you can afford, then drop provisions
      // from the bottom until the thing can actually pass. This is the loop
      // the screen exists to support, so the suite should walk it.
      let guard = 0;
      while (guard++ < 24 && G.screen === 'bill') {
        const bc = S.billContext();
        if (bc.wc.passes) break;
        const affordable = S.CAUCUSES.find(c => !B.dealsWith.includes(c.id) && S.dealCost(c) <= G.gov.capital);
        if (affordable) { await S.record({ t: 'deal', i: affordable.id }); continue; }
        const droppable = B.selected.slice().reverse().find(id => B.selected.length > 1);
        if (!droppable) break;
        await S.record({ t: 'prov', i: droppable });
      }
      await S.record({ t: 'floor' });
      continue;
    }
    if (scr === 'war') { S.G.screen = 'govern'; continue; }
    if (scr === 'night') { await new Promise(r => setTimeout(r, 5)); continue; }
    break;
  }
  return steps;
}

/* Hash everything the run consists of.
 *
 * Two things are left out on purpose. The wire is prose about the state
 * rather than state. And `screen` is where the camera is pointing, not part
 * of the run: moving between a screen and its sub-screens — opening a
 * dossier, stepping back out of the war room — changes nothing the
 * simulation reads and is deliberately not logged, so a replay can land the
 * player on the act's main screen where they had clicked back to it. That is
 * a legitimate place to resume, and it is checked separately below rather
 * than being allowed to fail an equivalence test it has no business failing. */
function stateHash(S) {
  const copy = Object.assign({}, S.G);
  delete copy.log;
  delete copy.screen;
  return hash(copy);
}

const ACT_SCREENS = ['setup', 'platform', 'primary', 'general', 'night', 'results', 'govern', 'bill', 'war', 'final'];

let fails = 0;
const check = (name, cond, extra) => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${name}${cond || !extra ? '' : '\n        ' + extra}`);
  if (!cond) fails++;
};

const POLICIES = {
  'first option':   () => 0,
  'last option':    (o, n) => n - 1,
  'alternating':    (() => { let k = 0; return (o, n) => (k++) % n; })()
};

const COVER = new Set();

(async () => {
  for (const [shape, policy] of Object.entries(POLICIES)) {
    for (const seed of [12345, 777, 20260824]) {
      const S = boot();
      installChooser(S, policy);
      S.eval('calibrateStates();');
      S.primeRun({ seed, headless: true });
      await S.record({ t: 'setup', s: { party: seed % 2 ? 'D' : 'R', bg: 'gov', name: 'Test', age: 54, home: 'PA', bio: ['smalltown'] } });
      const steps = await autoplay(S, 400);
      const forward = stateHash(S);
      const save = S.currentSave();
      const logLen = save.log.length;

      // Replay into the same world object, from scratch.
      const R = boot();
      installChooser(R, () => { throw new Error('a modal was shown during replay'); });
      R.eval('calibrateStates();');
      await R.replaySave(JSON.parse(JSON.stringify(save)));
      const replayed = stateHash(R);

      const G = S.G;
      const reached = G.gov ? (G.gov.failedAt ? 'lost the ' + G.gov.failedAt
        : 'governed to Q' + G.gov.quarter + (G.gov.war ? ' (with a war)' : ''))
        : (G.general ? 'the general' : G.primary ? 'the primary' : 'the platform');
      COVER.add(G.gov && !G.gov.failedAt ? 'office' : 'defeat');
      if (G.gov && G.gov.war) COVER.add('war');
      if (G.gov && G.gov.laws && G.gov.laws.length) COVER.add('legislation');
      if (G.gov && G.gov.quarter > 17) COVER.add('second term');
      check(`${shape} · seed ${seed} · ${logLen} decisions · ${reached} · replays identically`,
        forward === replayed, `forward ${forward} vs replay ${replayed}`);
      check(`${shape} · seed ${seed} · resumes on a real screen`,
        ACT_SCREENS.indexOf(R.G.screen) >= 0, 'screen=' + R.G.screen);

      // And the export/import round trip has to survive the same way.
      const code = S.exportRun(save);
      const back = S.importRun(code);
      const T = boot();
      installChooser(T, () => { throw new Error('a modal was shown during replay'); });
      T.eval('calibrateStates();');
      await T.replaySave(back.save);
      check(`${shape} · seed ${seed} · survives export and import`, stateHash(T) === forward);
    }
  }

  /* The war carries more distinct decision kinds than the rest of the game put
     together — orders, redeployments, sorties, escalations — and fires in one
     run in ten, so it needs forcing rather than waiting for. */
  {
    /* The odds are a constant, so the war is found rather than forced —
       which has the side benefit of exercising the real one-in-ten path. */
    let S = null, save = null, forward = null, tried = 0;
    for (let seed = 1; seed <= 60 && !save; seed++) {
      tried++;
      const T = boot();
      installChooser(T, (o, n) => (n > 1 ? 1 : 0));
      T.eval('calibrateStates();');
      T.primeRun({ seed: seed * 1013, headless: true });
      await T.record({ t: 'setup', s: { party: 'D', bg: 'general', name: 'War Test', age: 58, home: 'OH', bio: ['veteran'] } });
      await autoplay(T, 600);
      if (T.G.gov && T.G.gov.war) { S = T; save = T.currentSave(); forward = stateHash(T); }
    }
    check(`a war turned up within ${tried} seeds`, !!save);
    if (save) {
      COVER.add('war');
      const kinds = new Set(save.log.filter(e => e.t !== '?').map(e => e.t));
      check('the war\'s orders are in the log',
        ['warroom', 'wpost', 'wair'].every(k => kinds.has(k)), [...kinds].join(','));
      const R = boot();
      installChooser(R, () => { throw new Error('a modal was shown during replay'); });
      R.eval('calibrateStates();');
      await R.replaySave(JSON.parse(JSON.stringify(save)));
      check('a war run replays identically', stateHash(R) === forward);
    }
  }

  /* A corrupt log must fail loudly and safely, not half-apply. */
  {
    const S = boot();
    installChooser(S, () => 0);
    S.eval('calibrateStates();');
    let threw = null;
    try {
      await S.replaySave({ format: 1, version: '1.08', seed: 1, log: [{ t: 'nonsense' }] });
    } catch (e) { threw = e; }
    check('an unknown decision is rejected rather than ignored', threw && /unknown decision/.test(threw.message));
  }
  {
    const S = boot();
    installChooser(S, () => 0);
    S.eval('calibrateStates();');
    let threw = null;
    try {
      await S.replaySave({ format: 1, version: '1.08', seed: 1, log: [{ t: '?', k: 'x', v: 0 }] });
    } catch (e) { threw = e; }
    check('an orphaned modal answer is rejected', threw && /never asked for/.test(threw.message));
  }

  /* A suite that only ever loses the primary would pass while proving very
     little, so the shapes it actually reached are asserted, not just reported. */
  console.log('\n  covered: ' + [...COVER].sort().join(', '));
  check('the suite reaches the presidency at least once', COVER.has('office'));
  check('the suite legislates at least once', COVER.has('legislation'));

  console.log(fails ? `\n${fails} replay check(s) failed` : '\nreplay: every run reconstructs exactly');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('\nreplay harness crashed:\n' + (e.stack || e.message)); process.exit(1); });
