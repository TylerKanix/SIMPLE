#!/usr/bin/env node
/* The whole suite. `node test/all.js` before every commit. */
const { execFileSync } = require('child_process');
const path = require('path');
const SUITE = ['discipline.js', 'effects.js', 'temperament.js', 'determinism.js', 'replay.js', 'storage.js'];
const fs = require('fs');
let failed = [];
for (const t of SUITE) {
  const p = path.join(__dirname, t);
  if (!fs.existsSync(p)) { console.log(`\n— ${t} (not yet written)`); continue; }
  console.log(`\n— ${t}`);
  try { execFileSync(process.execPath, [p], { stdio: 'inherit' }); }
  catch (e) { failed.push(t); }
}
console.log(failed.length ? `\nFAILED: ${failed.join(', ')}` : '\nall suites green');
process.exit(failed.length ? 1 : 0);
