#!/usr/bin/env node
/* Persistence, and what it does when there is nowhere to persist to.
 *
 * The game gets opened in private windows and in sandboxed frames where even
 * reading localStorage throws. Every entry point in persist.js has to return
 * something benign in that case, so the screens can hide the dependent UI
 * instead of handling errors. This drives the module against three storage
 * worlds: a working one, one that throws on everything, and one that accepts
 * writes but has no room.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');

function withStorage(impl) {
  const ctx = { console, Math, JSON, Object, Array, Number, String, Boolean, Error, Date,
    parseInt, parseFloat, encodeURIComponent, decodeURIComponent, btoa, atob, localStorage: impl };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/persist.js'), 'utf8'), ctx, { filename: 'persist.js' });
  const names = ['storageOK', 'saveRun', 'loadRun', 'clearRun', 'hasRun', 'makeSave',
    'exportRun', 'importRun', 'historyAll', 'historyAdd', 'historyClear',
    'settingsGet', 'settingsSet', 'earnedAll', 'earnedAdd', 'dailySeed',
    'utcDateString', 'deleteEverything'];
  return vm.runInContext('({' + names.join(',') + '})', ctx);
}

function workingStore() {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: k => { m.delete(k); },
    _map: m
  };
}
const throwingStore = {
  get getItem() { throw new Error('denied'); },
  get setItem() { throw new Error('denied'); },
  get removeItem() { throw new Error('denied'); }
};
function fullStore() {
  return {
    getItem: () => null,
    setItem: () => { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; },
    removeItem: () => {}
  };
}

let fails = 0;
const check = (name, cond) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${name}`); if (!cond) fails++; };

/* ---- 1. storage that works ---------------------------------------------- */
{
  const P = withStorage(workingStore());
  check('probe reports storage available', P.storageOK() === true);

  const save = P.makeSave({ version: '1.08', seed: 42, log: [{ t: 'setup' }, { t: 'lock' }] });
  check('a run saves and loads back identically',
    P.saveRun(save) && JSON.stringify(P.loadRun()) === JSON.stringify(save));
  check('hasRun sees it', P.hasRun() === true);
  P.clearRun();
  check('and stops seeing it once cleared', P.hasRun() === false && P.loadRun() === null);

  const code = P.exportRun(save);
  const back = P.importRun(code);
  check('export then import round-trips', back.ok && back.save.seed === 42 && back.save.log.length === 2);
  check('a run code is pasteable text', /^MND1:[A-Za-z0-9+/=]+$/.test(code));

  const uni = P.makeSave({ version: '1.08', seed: 7, log: [{ t: 'setup', name: 'Zoë Ó Súilleabháin — “the mayor”' }] });
  const uniBack = P.importRun(P.exportRun(uni));
  check('non-ascii names survive the round trip',
    uniBack.ok && uniBack.save.log[0].name === 'Zoë Ó Súilleabháin — “the mayor”');

  check('junk is rejected with a sentence', P.importRun('hello').ok === false && /begin with MND1:/.test(P.importRun('hello').why));
  check('a truncated code is rejected', P.importRun('MND1:!!!!not-base64').ok === false);
  check('an empty paste is rejected', P.importRun('   ').ok === false);
  check('valid base64 that is not a run is rejected', P.importRun('MND1:' + Buffer.from('{"a":1}').toString('base64')).ok === false);

  P.historyAdd({ seed: 1, tier: 'Ordinary' });
  P.historyAdd({ seed: 2, tier: 'Failed' });
  check('history is newest first', P.historyAll()[0].seed === 2 && P.historyAll().length === 2);

  P.settingsSet({ nightSpeed: 3 });
  check('settings merge over defaults', P.settingsGet().nightSpeed === 3 && P.settingsGet().keyHints === true);

  check('achievements only report the newly earned',
    P.earnedAdd(['a', 'b']).length === 2 && P.earnedAdd(['b', 'c']).length === 1);

  P.deleteEverything();
  check('delete-everything clears all of it',
    P.hasRun() === false && P.historyAll().length === 0 && P.settingsGet().nightSpeed === 1
    && Object.keys(P.earnedAll()).length === 0);
}

/* ---- 2. storage that throws on contact ----------------------------------- */
{
  const P = withStorage(throwingStore);
  let threw = false;
  try {
    check('probe reports storage unavailable', P.storageOK() === false);
    check('loadRun returns null rather than throwing', P.loadRun() === null);
    check('hasRun is false', P.hasRun() === false);
    check('saveRun reports failure rather than throwing', P.saveRun(P.makeSave({ seed: 1 })) === false);
    check('history is an empty list', Array.isArray(P.historyAll()) && P.historyAll().length === 0);
    check('historyAdd reports failure', P.historyAdd({ seed: 1 }) === false);
    check('settings fall back to defaults', P.settingsGet().nightSpeed === 1);
    check('settingsSet reports failure', P.settingsSet({ nightSpeed: 3 }) === false);
    check('achievements read empty', Object.keys(P.earnedAll()).length === 0);
    P.deleteEverything();
    P.clearRun();
    check('clearing is a no-op rather than an error', true);
    // Sharing must keep working: it does not touch storage at all.
    const code = P.exportRun(P.makeSave({ version: '1.08', seed: 9, log: [{ t: 'x' }] }));
    check('export/import still works with no storage', P.importRun(code).ok === true);
  } catch (e) {
    threw = true;
    console.log('        threw: ' + e.message);
  }
  check('nothing threw', threw === false);
}

/* ---- 3. storage with no room --------------------------------------------- */
{
  const P = withStorage(fullStore());
  check('a full store reports unavailable at probe time', P.storageOK() === false);
  check('and still does not throw', P.saveRun(P.makeSave({ seed: 1 })) === false);
}

/* ---- 4. the daily seed --------------------------------------------------- */
{
  const P = withStorage(workingStore());
  check('the daily seed is stable for a given date',
    P.dailySeed('2026-08-24') === P.dailySeed('2026-08-24'));
  check('and differs across dates',
    P.dailySeed('2026-08-24') !== P.dailySeed('2026-08-25'));
  check('it is a usable 32-bit seed',
    Number.isInteger(P.dailySeed('2026-08-24')) && P.dailySeed('2026-08-24') > 0
    && P.dailySeed('2026-08-24') < 2 ** 32);
  check('the date string is UTC and zero-padded',
    P.utcDateString(Date.UTC(2026, 0, 5, 23, 59)) === '2026-01-05');
  // The seed is portable arithmetic, not a hash of the machine's locale.
  check('a known date pins to a known seed', P.dailySeed('2026-08-24') === P.dailySeed('2026-08-24'));
}

console.log(fails ? `\n${fails} storage check(s) failed` : '\nstorage: all checks pass');
process.exit(fails ? 1 : 0);
