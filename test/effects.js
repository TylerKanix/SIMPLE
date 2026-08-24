#!/usr/bin/env node
/* Advertised effects must be applied effects.
 *
 * Every event and situation shows the player what a choice does before they
 * make it, and the game's whole claim is that the figure shown is the figure
 * the engine uses. An effects object carrying a key the applier does not read
 * is an interface promising a consequence that never arrives — invisible in
 * play, and exactly the sort of thing that rots as content is added.
 *
 * So the truth is read out of the code rather than kept in a second list: the
 * keys each applier actually branches on are extracted from main.js, and every
 * effects object in data.js is checked against the applier for its scope.
 */
const fs = require('fs');
const path = require('path');
const { load } = require('./harness.js');
const ROOT = path.join(__dirname, '..');

const main = fs.readFileSync(path.join(ROOT, 'js/main.js'), 'utf8');

/* Pull the body of a function and collect the `e.<key>` it reads. */
function appliedKeys(fnName) {
  const start = main.indexOf('function ' + fnName + '(');
  if (start < 0) throw new Error('cannot find ' + fnName);
  // Walk braces from the first { after the signature.
  let i = main.indexOf('{', start), depth = 0, end = i;
  for (; i < main.length; i++) {
    if (main[i] === '{') depth++;
    else if (main[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  const body = main.slice(start, end);
  const keys = new Set();
  const re = /\be\.([A-Za-z][A-Za-z0-9_]*)/g;
  let m;
  while ((m = re.exec(body))) keys.add(m[1]);
  return keys;
}

const CAMPAIGN_APPLIED = appliedKeys('applyCampaignEffect');
const GOV_APPLIED = appliedKeys('applyGovEffect');

const S = load();
let fails = 0;
const check = (name, cond, extra) => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${name}${cond || !extra ? '' : '\n        ' + extra}`);
  if (!cond) fails++;
};

function audit(label, items, applied, getEffs) {
  const stray = [];
  for (const it of items) {
    for (const [where, eff] of getEffs(it)) {
      for (const k of Object.keys(eff || {})) {
        if (!applied.has(k)) stray.push(`${it.id}.${where}.${k}`);
      }
    }
  }
  check(`${label}: every effect key is one the applier reads`, stray.length === 0, stray.join(', '));
}

audit('campaign events', S.CAMPAIGN_EVENTS, CAMPAIGN_APPLIED,
  e => e.choices.map((c, i) => ['choice' + i, c.eff]));

audit('governing events', S.GOVERNING_EVENTS, GOV_APPLIED,
  e => e.choices.map((c, i) => ['choice' + i, c.eff]));

audit('situations', S.SITUATIONS, GOV_APPLIED,
  s => [['resolved', s.resolved], ['ignored', s.ignored]]);

audit('war escalations', S.WAR_ESCALATIONS, GOV_APPLIED,
  e => [['eff', e.eff]]);

/* Shape checks: content that cannot be played is worse than content that is
   merely unbalanced, and both are cheap to catch here. */
function shape(label, items, fn) {
  const bad = items.filter(x => !fn(x)).map(x => x.id);
  check(label, bad.length === 0, bad.join(', '));
}

shape('every event offers a real choice (two or more options)',
  S.CAMPAIGN_EVENTS.concat(S.GOVERNING_EVENTS), e => e.choices && e.choices.length >= 2);
shape('every choice has a label and an effects object',
  S.CAMPAIGN_EVENTS.concat(S.GOVERNING_EVENTS),
  e => e.choices.every(c => typeof c.label === 'string' && c.label && c.eff && typeof c.eff === 'object'));
shape('no choice is free of consequence',
  S.CAMPAIGN_EVENTS.concat(S.GOVERNING_EVENTS),
  e => e.choices.every(c => Object.keys(c.eff).length > 0));
shape('every situation has both outcomes and both texts', S.SITUATIONS,
  s => s.resolved && s.ignored && s.resolvedText && s.ignoredText && s.weeks > 0 && s.quarters > 0);

/* The house style bans exclamation points; it is a small thing and it is the
   sort of small thing that drifts once a pool gets large. */
const shouty = [];
for (const e of S.CAMPAIGN_EVENTS.concat(S.GOVERNING_EVENTS)) {
  const blob = [e.title, e.text].concat(e.choices.map(c => c.label)).join(' ');
  if (blob.indexOf('!') >= 0) shouty.push(e.id);
}
for (const s of S.SITUATIONS) {
  if ([s.name, s.desc, s.resolvedText, s.ignoredText].join(' ').indexOf('!') >= 0) shouty.push(s.id);
}
check('nothing in the pools shouts', shouty.length === 0, shouty.join(', '));

/* Unique ids and titles, since a duplicate silently halves how often one of
   them can appear and makes the log ambiguous. */
for (const [label, items] of [['campaign', S.CAMPAIGN_EVENTS], ['governing', S.GOVERNING_EVENTS], ['situations', S.SITUATIONS]]) {
  const ids = items.map(x => x.id);
  const titles = items.map(x => x.title || x.name);
  check(`${label} ids are unique`, new Set(ids).size === ids.length);
  check(`${label} titles are unique`, new Set(titles).size === titles.length,
    titles.filter((t, i) => titles.indexOf(t) !== i).join(', '));
}

/* The counts the design calls for. */
check(`campaign pool is at least 18 (${S.CAMPAIGN_EVENTS.length})`, S.CAMPAIGN_EVENTS.length >= 18);
check(`governing pool is at least 24 (${S.GOVERNING_EVENTS.length})`, S.GOVERNING_EVENTS.length >= 24);
check(`situation pool is at least 12 (${S.SITUATIONS.length})`, S.SITUATIONS.length >= 12);

console.log(fails ? `\n${fails} effect check(s) failed` : '\neffects: everything advertised is applied');
process.exit(fails ? 1 : 0);
