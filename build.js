#!/usr/bin/env node
/* Bundle Mandate into one self-contained HTML file.
 *
 *   node build.js [outfile]
 *
 * The multi-file version in this repo opens directly from disk, but a single
 * file is what you want for sharing, hosting, or emailing to someone. The
 * output has no external requests of any kind: styles and scripts are inlined
 * and there is nothing to fetch.
 *
 * Emits a document fragment — <title>, <style>, markup, <script> — with no
 * <html>, <head>, or <body> wrapper, so it can be served as-is by a host that
 * supplies its own skeleton, and still renders correctly when opened directly
 * because browsers reconstruct the missing elements.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SCRIPTS = ['js/data.js', 'js/sim.js', 'js/ui.js', 'js/main.js'];
const out = process.argv[2] || path.join(ROOT, 'mandate.html');

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* Inlining breaks if a source ever contains a literal closing script tag —
   the parser would end the block early and dump the rest as text. */
const css = read('styles.css');
const js = SCRIPTS.map(f => `/* ===== ${f} ===== */\n${read(f)}`).join('\n\n');
for (const [name, body] of [['script', js], ['style', css]]) {
  const bad = new RegExp('</' + name, 'i');
  if (bad.test(body)) {
    console.error(`error: a source file contains a literal </${name}, which cannot be inlined safely.`);
    process.exit(1);
  }
}

/* Reuse the real markup rather than keeping a second copy in sync by hand. */
const shell = read('index.html');
const body = shell.match(/<body>([\s\S]*?)<script/i);
if (!body) { console.error('error: could not find the body markup in index.html'); process.exit(1); }

const html = `<title>Mandate — a political campaign and governing simulator</title>
<style>
${css}
</style>
${body[1].trim()}
<script>
${js}
</script>
`;

fs.writeFileSync(out, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`wrote ${path.relative(process.cwd(), out)} (${kb} KB, ${SCRIPTS.length + 1} sources inlined)`);
