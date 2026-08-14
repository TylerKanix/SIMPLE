# Mandate

A political strategy game about the distance between a platform and a signing ceremony.

You write a platform, win a nomination, take 270, and then discover what your
promises are worth once they have to survive a whip count. Everything chosen in
act one is an asset or a liability in act four.

**To play:** open `index.html` in a browser. No build step, no dependencies, no
server. Double-clicking the file works.

---

## The acts

**0 — The Candidate.** A party, a background, an age, a home state worth about
three points where you are from, and two things you did before politics. Age
buys gravitas and seniors and costs you the young; biography is a standing
affinity with particular blocs that no position can buy. All of it is priced on
screen while you choose it.

**I — The Platform.** Twelve issue axes, five stances each, scored live against
two different electorates: the one that nominates you and the one that elects
you. Pick three signature issues; emphasis is worth as much as position, and
those three become the promises you are graded on in office.

**II — The Primary.** Seven contests, proportional allocation, a 15% viability
threshold. Three moves per contest against a field of ideological archetypes.
Rivals drop out and their voters consolidate onto whoever is nearest them.
Failing to clinch a majority sends it to a second ballot, where the unpledged
delegates decide whether you are electable.

**III — The General.** Ten weeks, an electoral college tile map, and an
opponent who repositions to exploit whatever ground you left open. Money and
days are both scarce, and there are three separate ways to spend them: broad
persuasion, buys aimed at a single bloc in a single state, and a playbook run
against the other campaign. Every state carries a posture — persuasion,
turnout, or hold — and a path-to-270 panel stacks the map safest-first so the
state the whole race rests on is the one with the line drawn through it.

Election night calls the safe states east to west and then holds every close
one back, running them least-close to most, so the state that decides it is the
last on the board. Afterwards the map stays open: every state clickable, a
sortable table of all fifty-one, and a breakdown of where you ran ahead of and
behind a generic nominee.

**IV — The Government.** Sixteen quarters, each of them thirteen weeks of
presidential time spent across fourteen kinds of action — a bill is most of a
quarter, a pardon is an afternoon. Bills are assembled from modular provisions,
each carrying both its politics and what it actually does, and taken to a whip
count where caucuses split rather than move as blocs. Concessions cost you your
promise; refusing them costs you the bill. Then midterms. Then, from the election
year on, the re-election is fought in the same quarters as the governing, on the
record being made in them. Win it and you play the second term — a new Congress,
every vehicle reset, and political capital that drains a little faster every
quarter because you cannot run again and everyone in your party knows it.

Situations land on the desk throughout: a landfall, a bank failing on a Friday,
Americans taken abroad. They do not resolve themselves, they take weeks you were
going to spend on the agenda, and letting one run out the clock costs more than
handling it would have.

---

## What the model actually does

The interesting part is the tension, so the mechanics are built to make it real
rather than to feel real.

### Coalitions, not sliders

Twelve voter blocs, each with an ideal point and a salience weight on every
issue, plus a partisan baseline and a turnout propensity. States are built from
demographic descriptors — urbanization, religiosity, union density, education,
race, age, veteran share — which determine each state's bloc composition.

That composition governs how far a state moves when you change a plank. Running
on protectionist trade and moderate immigration swings Michigan, Pennsylvania,
Wisconsin, and Iowa several points each while barely touching Arizona or
Georgia, because the model knows why those states are different.

### The map is a swing model, not a demographic fantasy

A purely demographic model says rural Maine votes like rural Mississippi. It
does not. So each state's partisan lean is anchored to a prior result, and at
boot the engine solves a residual per state — by bisection — so that two
generic nominees reproduce that lean exactly. Demographics then explain the
*swing* away from the anchor, which is the part you control.

Leans are stored as margins relative to the nation rather than absolute ones,
so two generic nominees start at 50–50 and both parties are playable.

### The college bias is drawn fresh every cycle

Seeding a map from one real election also inherits that election's electoral
college bias as a permanent constant, which makes one party's campaign the same
uphill walk in every playthrough. Real maps do not work that way. So each game
draws a bias target, applies an education-and-region realignment drift, and
nudges the battlegrounds until the map delivers it. Across cycles the bias runs
from about D+1.5 to about R+3.5. It is shown to you on the platform and
campaign screens, along with the national environment, because you should be
able to plan around the terrain.

### Why you cannot just run to the center

Pure proximity voting makes the median voter a dominant strategy, which is both
wrong and boring. Three things push back:

- **Party identification is sticky.** It carries roughly twice the weight of
  issue proximity. A Democrat cannot adopt Republican positions and win
  Mississippi.
- **Activists are not median voters.** Base morale is scored against an
  activist ideal well out on your own flank, and it converts directly into
  turnout. Moderating your way to a perfect polling average empties your own
  half of every bloc you need.
- **Conviction is legible.** A platform of pure midpoints is a candidate nobody
  can describe, and it carries a penalty — much harsher in a primary than in a
  general.

Primary electorates are modeled as the same blocs with their ideal points
shifted toward the flank, and they barely register extremism while punishing
mush. General electorates do the reverse. That is the trap.

### Whip counts split caucuses

Six caucuses across both parties, each with an ideal point on every issue, a
discipline score, a price, and an exposure to presidential approval in their
seats. A caucus does not vote as a bloc — its members are spread around its
position, so a marginal caucus splits and you get fourteen of the twenty-three
Blue Dogs.

Bills are built from provisions. Each provision moves the bill's position,
costs money, and either survives the Byrd rule or does not. Reconciliation
drops the Senate threshold from sixty to fifty and strips everything that is
not primarily budgetary. Interest groups react to the bill as drafted and apply
pressure to the caucuses they can reach.

The result is the intended dilemma. In a typical Congress the maximal package
fails by a handful of votes; adding the SALT deduction to buy nine suburban
members passes it 218–218; dropping the billionaire tax makes it comfortable
but moves the bill from −1.20 to −0.18, which is no longer the thing you
promised. Your base notices, and base morale is turnout.

### Every decision is priced before you make it

The engine that resolves a turn is the engine that previews it. To price an
alternative the game measures the current position, changes exactly one input,
measures again, and puts the original back — so the figure shown while you are
deciding is the figure the simulation will use, not a second and friendlier
model that can drift away from it.

Every stance carries what it does to your primary standing and to the margin in
the tipping-point state. Campaign actions show the margin they buy in the
targeted state. Bill provisions show what dropping one costs in House and Senate
votes and which caucus it was buying. Event choices list their consequences, and
every consequence listed is one the engine actually applies.

### What the policies do, as distinct from what they cost you

Each provision carries its politics — who wants it, what it costs you — and,
separately, its policy: the mechanism, and the number a budget office would put
on it. Those numbers accumulate across a term into a ledger of what actually
changed in the country: people insured, child poverty, emissions, homes built,
rents, the federal prison population, crossings, voters registered.

This is the thing a promises-kept tally cannot tell you. A bill gutted to reach
sixty votes still counts as a bill passed; the ledger is where the difference
shows up. Outcomes are reported without a verdict — whether fewer people in
federal prison is an improvement is the argument the game is about.

### Everything else

Deficits accumulate and fiscal hawks price them in. Executive orders give you
about half the policy with no votes and a real chance of being enjoined —
lower if you have spent quarters confirming judges, and revoked outright if you
lose. Rulemakings are slower and costlier and survive a change of president.
Abolishing the filibuster works exactly once and belongs to whoever holds the
chamber next. Midterms punish presidents, and worse ones more. The final score
weighs promises kept against promises broken, the economy you leave, damage to
the institutions, and the voters' verdict.

---

## Notes

Runs are seeded — enter a seed on the setup screen and the same world regenerates,
so a run can be reproduced and argued about. The seed is shown on the results
screen.

Blocs overlap in reality and are treated as disjoint slices here. Caucuses stand
in for 535 individuals. Bloc ideal points, stance costs, and caucus positions are
a playable caricature calibrated for tension, not a forecast, and nothing in the
data files is a claim about how any real group votes.

## Layout

```
index.html      shell
styles.css      stylesheet
js/data.js      issues, stances, blocs, states, caucuses, groups, bills, events
js/sim.js       simulation engine — no DOM
js/analysis.js  decision pricing, dossiers, state files — no DOM
js/ui.js        rendering helpers — map, bars, charts, meters, modals
js/main.js      game flow and screens
build.js        bundles all of the above into one standalone mandate.html
```
