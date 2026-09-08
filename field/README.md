# Doors & Shifts

A canvassing calendar: who is walking, where, and how many doors.

This is a standalone field tool, not part of the Mandate game that lives in the
rest of this repository. It shares nothing with `js/` and is not loaded by
`index.html`.

**Published board:** https://claude.ai/code/artifact/e0bfcd23-d423-42b4-9551-e7025ac212d7

That address is the working copy. Its data lives in the artifact's own store, so
shifts entered there survive reloads and republishes, and anyone who can open the
page sees the same plan.

## What it does

- **Month calendar.** Every shift is a chip: launch time, turf, who is assigned,
  and doors knocked against the goal. An eighth column totals each week.
- **Volunteers.** A roster with role, phone, usual availability, shifts this
  month, and each person's share of the doors their crews knocked.
- **Turf.** Universe size per precinct or grid, doors knocked into it, and how
  much of it is covered.
- **Door-goal estimates.** Canvassers x hours x doors-per-canvasser-hour, with
  the rate set in Settings (18/hr by default).
- **Copy for text.** Turns a shift into a paste-ready block for the group text:
  date, time, turf, precinct, launch site, who is out, and the goal.
- **Weekly repeats.** One shift can lay down every week through Election Day.

## Files

- `canvass-board.html` — the whole tool. No build step and no dependencies; the
  only external request is the Google Fonts stylesheet.
- `sample-plan.json` — the example roster, turf, and September shifts seeded into
  the published board. The board marks these records as samples and offers a
  one-click **Clear samples**.

## Running it

Two ways:

1. **Published (recommended).** Open the link above. Data is stored server-side
   and shared with everyone who can open the artifact.
2. **Standalone.** Open `canvass-board.html` in a browser. Without the artifact
   runtime there is no shared store, so it falls back to `localStorage` and says
   so in a banner: the plan lives in that one browser only.

To republish after editing, publish `canvass-board.html` to the **same** artifact
url. Publishing without the url mints a second board at a new address and strands
whoever is holding the old link.
