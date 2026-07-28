# Mandate

A political strategy game about the distance between a platform and a signing ceremony.

You write a platform, win a nomination, take 270, and then discover what your
promises are worth once they have to survive a whip count. Everything chosen in
act one is an asset or a liability in act four.

**To play:** open `index.html` in a browser. No build step, no dependencies, no
server. Double-clicking the file works.

---

## The four acts

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
days are both scarce. Election night calls state by state from east to west.

**IV — The Government.** Sixteen quarters. Bills are assembled from modular
provisions and taken to a whip count where caucuses split rather than move as
blocs. Concessions cost you your promise; refusing them costs you the bill.
Then midterms, then a referendum on the record.

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

### Everything else

Deficits accumulate and fiscal hawks price them in. Executive orders give you
about half the policy with no votes and a real chance of being enjoined.
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
js/ui.js        rendering helpers — map, bars, meters, modals
js/main.js      game flow and screens
```
