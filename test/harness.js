/* Shared rig for the test suite.
 *
 * Loads the game's DOM-free layers (data, sim, analysis) into a fresh V8
 * context so a test can drive the simulation headlessly. Top-level `const`
 * lives in a script's lexical scope rather than on the global object, so the
 * tables have to be pulled out by name — `expose` below is that list.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

/* Everything a test needs that is declared with const/let rather than as a
   function. Functions land on the global object by themselves. */
const EXPOSE = [
  'ISSUES', 'ISSUE_IDS', 'STANCES', 'BLOCS', 'BLOC_BY_ID', 'STATES', 'STATE_BY_ABBR',
  'TILE_MAP', 'PARTIES', 'BACKGROUNDS', 'RIVAL_ARCHETYPES', 'PRIMARY_CALENDAR',
  'CAUCUSES', 'CAUCUS_BY_ID', 'GROUPS', 'CAMPAIGN_ACTIONS', 'BILLS',
  'CAMPAIGN_EVENTS', 'GOVERNING_EVENTS', 'SITUATIONS', 'OUTCOMES', 'BIO_TRAITS',
  'PATCH_NOTES', 'GAME_VERSION', 'RECORD_EVENTS', 'DEPTS',
  'WAR_ODDS', 'WAR_THEATRE', 'WAR_FRONTS', 'WAR_FRONT_BY_ID', 'WAR_ESCALATIONS',
  'WAR_POSTURES', 'WAR_POSTURE_LIST', 'WAR_AIR_POOL', 'WAR_LIFT', 'WAR_DENSITY_CAP',
  'WAR_ENEMY_DENSITY', 'WAR_QUARTERS_HARD', 'WAR_START_DIVS', 'WAR_CMD_MAX_WEEKS',
  'WAR_ENDINGS', 'POSTURES', 'POSTURE_LIST', 'GENERIC', 'CYCLE_BIAS', 'TEMPERAMENTS', 'TEMPERAMENT_LIST'
];

function load(files) {
  const ctx = { console, Math, JSON, Object, Array, Number, String, Boolean, Error, isNaN, parseInt, parseFloat };
  vm.createContext(ctx);
  /* analysis.js reads the live game object for context it can be handed
     instead. Tests drive the sim directly, so a bare stand-in is enough and
     keeps the DOM-free layers loadable on their own. */
  vm.runInContext('var G = { opp: null, env: null, general: null };', ctx);
  for (const f of files || ['js/data.js', 'js/sim.js', 'js/analysis.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  }
  const pulled = vm.runInContext('({' + EXPOSE.map(n => `${n}: typeof ${n} === 'undefined' ? undefined : ${n}`).join(',') + '})', ctx);
  // `CYCLE_BIAS` and friends are reassigned as the sim runs, so expose a live
  // reader rather than a stale copy.
  ctx.read = name => vm.runInContext(name, ctx);
  return Object.assign(ctx, pulled);
}

/* ---- a stable hash ------------------------------------------------------
   Key order is normalised and floats are rounded, because the point of these
   goldens is to catch a changed *model*, not a changed last bit of a
   transcendental on someone else's V8. Nine decimals is far tighter than any
   real tuning change and far looser than platform noise. */
function stable(v, seen) {
  seen = seen || new Set();
  if (v === null || v === undefined) return String(v);
  if (typeof v === 'number') {
    if (!isFinite(v)) return String(v);
    return (Math.round(v * 1e9) / 1e9).toFixed(9);
  }
  if (typeof v === 'function') return undefined;
  if (typeof v !== 'object') return JSON.stringify(v);
  if (seen.has(v)) return '"[cycle]"';
  seen.add(v);
  let out;
  if (Array.isArray(v)) {
    out = '[' + v.map(x => stable(x, seen)).filter(x => x !== undefined).join(',') + ']';
  } else {
    out = '{' + Object.keys(v).sort()
      .map(k => { const s = stable(v[k], seen); return s === undefined ? undefined : JSON.stringify(k) + ':' + s; })
      .filter(Boolean).join(',') + '}';
  }
  seen.delete(v);
  return out;
}

function hash(v) {
  return require('crypto').createHash('sha256').update(stable(v)).digest('hex').slice(0, 16);
}

module.exports = { load, stable, hash, ROOT };
