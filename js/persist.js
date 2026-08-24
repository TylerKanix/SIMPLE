/* ==========================================================================
   MANDATE — persistence
   Storage, saves, history, settings. No DOM, and no knowledge of the game's
   rules: this module moves opaque blobs in and out of localStorage and lets
   main.js decide what they mean.

   Everything here is written on the assumption that storage may simply not be
   there. The game is shipped as a single file that gets opened in private
   windows and sandboxed frames, and a sandbox without allow-same-origin makes
   even *reading* localStorage throw rather than return null. So the capability
   is probed once, and every entry point returns a benign value when it is
   absent. Callers hide the dependent UI rather than handling errors.
   ========================================================================== */

const STORE_KEYS = {
  run:      'mandate.run',       // the one in-progress run
  history:  'mandate.history',   // completed and abandoned runs
  settings: 'mandate.settings',
  achieve:  'mandate.achievements'
};

/* The save format. Bump when a change makes old logs unreplayable; the loader
   tries anyway and falls back to a clear message rather than a crash. */
const SAVE_FORMAT = 1;

/* ---- capability ----------------------------------------------------------
   Probed once, with a real write, because a storage object can exist and
   still refuse to hold anything (Safari private mode used to do exactly
   that, and quota-exceeded looks the same). */
let _storageOK = null;
function storageOK() {
  if (_storageOK !== null) return _storageOK;
  try {
    const k = 'mandate.probe';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    _storageOK = true;
  } catch (e) {
    _storageOK = false;
  }
  return _storageOK;
}

function readKey(key, fallback) {
  if (!storageOK()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function writeKey(key, value) {
  if (!storageOK()) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    /* Out of quota is the realistic failure. History is the only thing here
       that grows without bound, so shed the oldest half of it and retry once
       before giving up. */
    try {
      const h = readKey(STORE_KEYS.history, []);
      if (Array.isArray(h) && h.length > 4) {
        localStorage.setItem(STORE_KEYS.history, JSON.stringify(h.slice(0, Math.floor(h.length / 2))));
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
    } catch (e2) { /* fall through */ }
    return false;
  }
}

function dropKey(key) {
  if (!storageOK()) return;
  try { localStorage.removeItem(key); } catch (e) { /* nothing to do */ }
}

/* ---- utf-8 safe base64 ---------------------------------------------------
   Candidate names carry accents, and btoa throws on anything above U+00FF.
   Percent-encoding first is the smallest reliable fix that works in every
   browser this game gets opened in. */
function b64encode(str) {
  const bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    (_, h) => String.fromCharCode(parseInt(h, 16)));
  return btoa(bytes);
}
function b64decode(b64) {
  const bytes = atob(b64);
  return decodeURIComponent(Array.prototype.map.call(bytes,
    c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}

/* ---- the in-progress run -------------------------------------------------
   A save is a seed and an ordered list of the decisions taken since. It is
   not a snapshot of the world: the world is whatever replaying those
   decisions from that seed produces, which is the same guarantee the game
   already makes about seeds and is why this format is small enough to paste
   into a message. */
function makeSave(o) {
  return {
    format: SAVE_FORMAT,
    version: o.version,
    seed: o.seed,
    mode: o.mode || 'full',
    difficulty: o.difficulty || 'standard',
    daily: o.daily || null,
    log: o.log || [],
    at: o.at || 0,
    label: o.label || ''
  };
}

function saveRun(save) { return writeKey(STORE_KEYS.run, save); }
function loadRun() { return readKey(STORE_KEYS.run, null); }
function clearRun() { dropKey(STORE_KEYS.run); }
function hasRun() {
  const r = loadRun();
  return !!(r && Array.isArray(r.log) && r.log.length);
}

/* ---- sharing -------------------------------------------------------------
   A run code is the save, base64'd, with a short prefix so a stray paste can
   be rejected with a sentence instead of a stack trace. */
const RUN_PREFIX = 'MND1:';

function exportRun(save) {
  return RUN_PREFIX + b64encode(JSON.stringify(save));
}

function importRun(text) {
  const s = String(text || '').trim().replace(/\s+/g, '');
  if (!s) return { ok: false, why: 'Nothing pasted.' };
  if (s.indexOf(RUN_PREFIX) !== 0) return { ok: false, why: 'That is not a Mandate run code — they begin with ' + RUN_PREFIX };
  let obj;
  try { obj = JSON.parse(b64decode(s.slice(RUN_PREFIX.length))); }
  catch (e) { return { ok: false, why: 'The code is damaged — it may have been cut short in transit.' }; }
  if (!obj || typeof obj.seed !== 'number' || !Array.isArray(obj.log)) {
    return { ok: false, why: 'The code decoded but does not describe a run.' };
  }
  return { ok: true, save: obj };
}

/* ---- run history ---------------------------------------------------------
   Newest first, capped. Each entry is a summary written at the end of a run,
   not a replayable save — but it carries the seed, so any of them can be
   started again. */
const HISTORY_CAP = 60;

function historyAll() {
  const h = readKey(STORE_KEYS.history, []);
  return Array.isArray(h) ? h : [];
}
function historyAdd(entry) {
  const h = historyAll();
  h.unshift(entry);
  return writeKey(STORE_KEYS.history, h.slice(0, HISTORY_CAP));
}
function historyClear() { dropKey(STORE_KEYS.history); }

/* ---- settings ------------------------------------------------------------ */
const SETTINGS_DEFAULT = {
  nightSpeed: 1,        // 1x or 3x on election night
  nightSkip: false,     // remembered "skip to the call"
  confirmAdvance: false,
  keyHints: true,
  reduceMotion: false
};
function settingsGet() {
  return Object.assign({}, SETTINGS_DEFAULT, readKey(STORE_KEYS.settings, {}));
}
function settingsSet(patch) {
  return writeKey(STORE_KEYS.settings, Object.assign(settingsGet(), patch));
}

/* ---- achievements -------------------------------------------------------- */
function earnedAll() {
  const e = readKey(STORE_KEYS.achieve, {});
  return e && typeof e === 'object' ? e : {};
}
function earnedAdd(ids, when) {
  const e = earnedAll();
  const added = [];
  for (const id of ids) {
    // Presence, not truthiness: the stored value is a timestamp, and a
    // timestamp of zero is falsy, which made every achievement earned before
    // the clock was passed in re-fire on every single run.
    if (!Object.prototype.hasOwnProperty.call(e, id)) {
      e[id] = when || 0;
      added.push(id);
    }
  }
  if (added.length) writeKey(STORE_KEYS.achieve, e);
  return added;
}

/* ---- the daily seed ------------------------------------------------------
   Derived from the UTC date so that every player on Earth gets the same
   world on the same day, and so that the derivation can be checked without
   asking a server anything. */
function utcDateString(ms) {
  const d = ms === undefined ? new Date() : new Date(ms);
  const p = n => (n < 10 ? '0' : '') + n;
  return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate());
}
function dailySeed(dateStr) {
  const s = dateStr || utcDateString();
  // FNV-1a, so the mapping from date to world is fixed and portable.
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/* ---- wiping ------------------------------------------------------------- */
function deleteEverything() {
  for (const k of Object.keys(STORE_KEYS)) dropKey(STORE_KEYS[k]);
}
