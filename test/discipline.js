#!/usr/bin/env node
/* Stream discipline.
 *
 * The prime invariant is that one seeded stream drives the entire run. This
 * check enforces the two rules that keep it true:
 *
 *   1. Math.random appears nowhere except inside freshSeed(), which picks the
 *      seed itself and therefore cannot draw from the stream it starts.
 *   2. Date/time is never read inside the simulation layers, because a run
 *      that depends on when it was played is not reproducible.
 *
 * Cheap, fast, and catches the class of mistake that is otherwise invisible
 * until two players compare the same seed and get different countries.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

/* Strip comments and string bodies before scanning. Without this the checks
   trip over their own documentation and over prose in the content tables —
   a caucus blurb calling the deficit "a moral document" is not a DOM access. */
function codeOnly(src) {
  let out = '', i = 0, n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); const seg = src.slice(i, e < 0 ? n : e + 2);
      out += seg.replace(/[^\n]/g, ' '); i = e < 0 ? n : e + 2; continue; }
    if (c === '/' && d === '/') { const e = src.indexOf('\n', i); const seg = src.slice(i, e < 0 ? n : e);
      out += seg.replace(/[^\n]/g, ' '); i = e < 0 ? n : e; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; let j = i + 1;
      while (j < n && src[j] !== q) { if (src[j] === '\\') j++; j++; }
      out += q + src.slice(i + 1, j).replace(/[^\n]/g, ' ') + (src[j] === q ? q : ''); i = j + 1; continue;
    }
    out += c; i++;
  }
  return out;
}

const SIM_LAYERS = ['js/sim.js', 'js/analysis.js'];
const ALL = ['js/data.js', 'js/sim.js', 'js/analysis.js', 'js/ui.js', 'js/main.js', 'js/persist.js'];

let fails = 0;
const fail = m => { console.log('  FAIL  ' + m); fails++; };
const ok = m => console.log('  ok    ' + m);

/* ---- 1. Math.random ------------------------------------------------------ */
let stray = [];
for (const f of ALL) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const lines = codeOnly(fs.readFileSync(p, 'utf8')).split('\n');
  lines.forEach((ln, i) => {
    if (!/Math\.random/.test(ln)) return;
    // The sole exemption, matched on the declaration itself rather than on a
    // comment that could drift away from the code.
    if (f === 'js/sim.js' && /function freshSeed\(\)/.test(ln)) return;
    stray.push(`${f}:${i + 1}  ${ln.trim()}`);
  });
}
if (stray.length) { fail('Math.random outside freshSeed():'); stray.forEach(s => console.log('        ' + s)); }
else ok('Math.random appears only inside freshSeed()');

/* ---- 2. no clock in the simulation --------------------------------------- */
const CLOCK = /\bDate\.now\(|new Date\(/;
let clocks = [];
for (const f of SIM_LAYERS) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  codeOnly(fs.readFileSync(p, 'utf8')).split('\n').forEach((ln, i) => {
    if (CLOCK.test(ln)) clocks.push(`${f}:${i + 1}  ${ln.trim()}`);
  });
}
if (clocks.length) { fail('the clock is read inside a simulation layer:'); clocks.forEach(s => console.log('        ' + s)); }
else ok('no wall-clock reads in sim/analysis');

/* ---- 3. the DOM stays out of the sim ------------------------------------- */
const DOM = /\b(document|window|localStorage)\b/;
let doms = [];
for (const f of SIM_LAYERS) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  codeOnly(fs.readFileSync(p, 'utf8')).split('\n').forEach((ln, i) => {
    if (DOM.test(ln)) doms.push(`${f}:${i + 1}  ${ln.trim()}`);
  });
}
if (doms.length) { fail('DOM or storage referenced in a simulation layer:'); doms.forEach(s => console.log('        ' + s)); }
else ok('sim/analysis stay free of the DOM');

process.exit(fails ? 1 : 0);
