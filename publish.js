#!/usr/bin/env node
/* Build Mandate and emit the copy that gets published as an Artifact.
 *
 *   node publish.js [outfile]
 *
 * The only difference from `node build.js` is the <title>. The bundle names
 * itself "Mandate — a political campaign and governing simulator", which is
 * right for a file someone is handed and wrong as a name in an artifact
 * gallery, where a title carrying its own explainer reads as filler. The
 * artifact copy is titled just "Mandate".
 *
 * Nothing else is touched, so this stays a one-line transform rather than a
 * second version of the game that can drift away from the real one.
 *
 * ---------------------------------------------------------------------------
 * KEEPING THE LINK
 *
 * The published game lives at a fixed address, recorded in README.md under
 * "The published build". Publishing an update means republishing THIS file to
 * THAT url — passing it explicitly if you are not in the conversation that
 * first published it. Publishing without the url mints a new artifact and
 * quietly strands everyone holding the old link.
 * ---------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const bundle = path.join(ROOT, 'mandate.html');
const out = process.argv[2] || path.join(ROOT, 'mandate.artifact.html');

/* Always rebuild first: publishing a stale bundle is the failure this whole
   script exists to make hard. */
execFileSync(process.execPath, [path.join(ROOT, 'build.js')], { stdio: 'inherit' });

const src = fs.readFileSync(bundle, 'utf8');
const titled = src.replace(/^<title>[\s\S]*?<\/title>/, '<title>Mandate</title>');
if (titled === src) {
  console.error('error: could not find the <title> to rewrite; refusing to publish an unnamed build.');
  process.exit(1);
}

fs.writeFileSync(out, titled);
const kb = (Buffer.byteLength(titled) / 1024).toFixed(0);
console.log(`wrote ${path.relative(process.cwd(), out)} (${kb} KB) — publish this file to the url in README.md`);
