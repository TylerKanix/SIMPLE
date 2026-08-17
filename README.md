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

And one presidency in ten is handed a war, which is not a situation with more
text on it. It has a board, an opponent who moves on it, and a war room you have
to keep going back to.

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

### One presidency in ten gets a war

The roll happens once, at the inauguration, and is then fixed, so a seed either
contains a war or it does not and a run with one in it can be replayed and
argued about. Over six hundred simulated presidencies the rate comes out at
9.3%, and the cable arrives somewhere between the third quarter and the tenth.

The theatre and both belligerents are invented. What is on the screen is five
fronts, an adversary who writes its orders for the quarter before it sees
yours, and two clocks: how much longer they will keep fighting, and how much
longer your own country will let you. You do not win by spending enough weeks.
You win by emptying the first clock before the second one empties.

**Frontage is the whole strategic argument.** Every front caps what it can
absorb — about twice the force needed to hold a continuous line there — and
past that cap the extra divisions are fed, counted, and contribute nothing.
Two divisions are a wall in the Kesar passes and twenty are a queue. The
southern steppe needs nine to be a line rather than a series of opinions, which
is why it is the front both sides leave thin and the front that gets turned.
The cap is what stops mass being a strategy on its own: a numerical advantage
has to be spent somewhere it fits, and the only fronts with room are the ones
nobody wants.

**Four postures, and none of them sits between any of the others.** Assault is
the only one that takes ground quickly. Hold is the only one that makes their
offensive cost them more than it costs you. Envelop is the only one whose
payoff is a function of their weakness rather than your strength — enormous
against a front they have thinned, actively bad against one they have not, and
unrunnable without sorties overhead. Withdraw is the only one that gives you
divisions back, and it breaks contact, so most of what they spend attacking a
front you are leaving lands on ground you have already left.

Sampling three hundred and fifty real board states and rolling each one forward
three quarters under every posture, the best answer was assault 25% of the
time, hold 60%, envelop 10% and withdraw 5% — and the split by front is the
strategy in miniature: the coastal shelf is assault country, the steppe is
where envelopment lives, and the fronts that show withdrawals are the highlands
and the river line, which are the two you most often cannot afford. Hold is the
plurality answer because you can only be offensive in one or two places, which
is the same reason they can.

**They have a main effort.** No more than two fronts are offensive in any
quarter on their side either. Screening a front they are not pushing costs you
almost nothing; screening one they are costs you the front. Which two they have
chosen is the single most valuable thing reconnaissance buys.

**The preview is exact and your information is not.** Every figure on a posture
button is the resolving engine run against a copy of the board — but it is run
against your intelligence estimate rather than against the truth, and what is
shown is the band between the top and the bottom of that estimate. Sorties
narrow it. A front nobody has looked at in three quarters produces an honest
and useless answer.

**It eats the presidency, which is the point.** Weeks in the war room are weeks
the agenda does not get, and the gradient is steep: playing the same strategy at
five weeks a quarter wins outright or settles well in 8 runs out of 10, at three
weeks it wins about a quarter of the time, and at zero — the theatre running
itself on last quarter's orders — it never wins at all. Concentrating the six
sorties on the main effort rather than spreading them one per front is worth
about the same again. Refusing to mobilize loses every time; the standing force
is deliberately not enough. Deep strikes are the exception that had to be
designed against: uncapped, twelve consecutive campaigns won every war in the
harness at two-thirds of the casualties, so each one now buys less than the last
and hands back more will every quarter after it, and spamming them loses.

A well-run war runs nine to twelve quarters, kills fourteen to nineteen thousand
Americans, and costs somewhere over two trillion dollars, all of it borrowed and
all of it on the deficit line the fiscal hawks are reading. Winning it is the
largest single thing available to a presidency. It is also three years in which
you were doing that instead of the thing you were elected to do, and the final
accounting reports both.

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
in for 535 individuals. The war's theatre, its geography and both belligerents
are invented, drawn for the strategic problem they pose rather than after
anywhere in particular, and nothing in it is a claim about any real conflict. Bloc ideal points, stance costs, and caucus positions are
a playable caricature calibrated for tension, not a forecast, and nothing in the
data files is a claim about how any real group votes.

## Layout

```
index.html      shell
styles.css      stylesheet
js/data.js      issues, stances, blocs, states, caucuses, groups, bills, events, fronts
js/sim.js       simulation engine — no DOM
js/analysis.js  decision pricing, dossiers, state files — no DOM
js/ui.js        rendering helpers — map, bars, charts, meters, modals
js/main.js      game flow and screens
build.js        bundles all of the above into one standalone mandate.html
```
