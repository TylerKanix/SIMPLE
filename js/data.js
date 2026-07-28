/* ==========================================================================
   MANDATE — static game data
   All ideology is expressed on a signed axis from -2 (left) to +2 (right).
   Nothing here is a claim about the real world; it is a playable caricature
   of American coalition politics, tuned so that the trade-offs bite.
   ========================================================================== */

const ISSUES = [
  { id: 'health',  name: 'Health Care',      short: 'Health',   axis: 'Single-payer ↔ Market' },
  { id: 'taxes',   name: 'Taxes & Spending', short: 'Taxes',    axis: 'Redistribute ↔ Cut' },
  { id: 'immig',   name: 'Immigration',      short: 'Immig.',   axis: 'Open ↔ Restrict' },
  { id: 'climate', name: 'Climate & Energy', short: 'Climate',  axis: 'Decarbonize ↔ Extract' },
  { id: 'guns',    name: 'Guns',             short: 'Guns',     axis: 'Restrict ↔ Deregulate' },
  { id: 'trade',   name: 'Trade & Industry', short: 'Trade',    axis: 'Free trade ↔ Protection' },
  { id: 'social',  name: 'Abortion',         short: 'Social',   axis: 'Codify ↔ Ban' },
  { id: 'defense', name: 'Defense',          short: 'Defense',  axis: 'Restraint ↔ Buildup' },
  { id: 'crime',   name: 'Crime & Policing', short: 'Crime',    axis: 'Reform ↔ Crackdown' },
  { id: 'reform',  name: 'Democracy Reform', short: 'Reform',   axis: 'Overhaul ↔ Integrity' },
  { id: 'housing', name: 'Housing',          short: 'Housing',  axis: 'Federal ↔ Local' },
  { id: 'tech',    name: 'Tech & AI',        short: 'Tech',     axis: 'Rein in ↔ Accelerate' }
];

const ISSUE_IDS = ISSUES.map(i => i.id);

/* Five stances per issue, indexed -2..+2. `cost` is annual budget impact in
   $B (negative = raises revenue / cuts spending). */
const STANCES = {
  health: [
    { p: -2, label: 'Single-Payer Medicare for All',        cost: 900, blurb: 'Abolish private insurance. Universal, and universally expensive.' },
    { p: -1, label: 'Public Option + Drug Price Caps',      cost: 220, blurb: 'Compete with insurers instead of replacing them.' },
    { p:  0, label: 'Shore Up the ACA Marketplaces',        cost:  60, blurb: 'Extend subsidies, fix the family glitch, declare victory.' },
    { p:  1, label: 'Block-Grant Medicaid, Expand HSAs',    cost: -80, blurb: 'Push the risk down to the states and the household.' },
    { p:  2, label: 'Repeal the ACA, Full Market Pricing',  cost:-180, blurb: 'Twenty million people find out what a risk pool is.' }
  ],
  taxes: [
    { p: -2, label: 'Wealth Tax and a 50% Top Rate',        cost:-520, blurb: 'Enormous revenue on paper. Enormous lawyers in practice.' },
    { p: -1, label: 'Raise Corporate & Top Bracket Rates',  cost:-280, blurb: 'The default revenue-raiser of the modern left.' },
    { p:  0, label: 'Close Loopholes, Hold Rates Steady',   cost: -70, blurb: 'Everyone agrees, right up until you name a loophole.' },
    { p:  1, label: 'Broad Middle-Class Tax Cut',           cost: 240, blurb: 'Popular. Expensive. Hard to ever undo.' },
    { p:  2, label: 'Flat Tax, Abolish Estate & Cap Gains', cost: 640, blurb: 'A simpler code and a spectacular deficit.' }
  ],
  immig: [
    { p: -2, label: 'Citizenship for All, Decriminalize',   cost:  40, blurb: 'The maximal position. Your base is thrilled. Nobody else is.' },
    { p: -1, label: 'Dreamer Legalization + More Visas',    cost:  10, blurb: 'Polls well until the word "amnesty" is applied to it.' },
    { p:  0, label: 'Border Security for Legal Reform',     cost:  25, blurb: 'The grand bargain that has failed since 1986.' },
    { p:  1, label: 'Hard Enforcement, End Parole',         cost:  35, blurb: 'Detention beds, expedited removal, a lot of litigation.' },
    { p:  2, label: 'Mass Deportation and a Moratorium',    cost: 150, blurb: 'Logistically staggering. Politically electric.' }
  ],
  climate: [
    { p: -2, label: 'Green New Deal, Fossil Phase-Out',     cost: 600, blurb: 'Decarbonize the grid by 2035 and reorganize the economy.' },
    { p: -1, label: 'Clean Energy Credits + EPA Rules',     cost: 190, blurb: 'Carrots in the tax code, sticks in the Federal Register.' },
    { p:  0, label: 'All-of-the-Above Energy Abundance',    cost:  70, blurb: 'Build everything. Offend the fewest people.' },
    { p:  1, label: 'Permitting Reform, Drill and Pipe',    cost: -20, blurb: 'Unleash supply, let emissions be somebody else\'s file.' },
    { p:  2, label: 'Exit Paris, Repeal Emissions Rules',   cost: -45, blurb: 'A full reversal, and a decade of regulatory whiplash.' }
  ],
  guns: [
    { p: -2, label: 'Assault Weapons Ban + Licensing',      cost:  12, blurb: 'The bill that costs Blue Dogs their seats.' },
    { p: -1, label: 'Universal Checks and Red Flag Laws',   cost:   6, blurb: 'Ninety percent support. Forty votes in the Senate.' },
    { p:  0, label: 'Enforce Existing Law, Fund Mental Health', cost: 9, blurb: 'The position you take when you want to change the subject.' },
    { p:  1, label: 'National Concealed-Carry Reciprocity', cost:   2, blurb: 'The most permissive state sets the national floor.' },
    { p:  2, label: 'Repeal the NFA, Constitutional Carry', cost:   1, blurb: 'Maximalist. Guarantees the suburbs notice you.' }
  ],
  trade: [
    { p: -2, label: 'Rejoin the Pacts, Cut Tariffs',        cost: -30, blurb: 'Efficient, cheap, and radioactive in the Rust Belt.' },
    { p: -1, label: 'Deals with Labor & Climate Chapters',  cost:  15, blurb: 'Free trade wearing a union jacket.' },
    { p:  0, label: 'Targeted Tariffs on Strategic Sectors', cost: -10, blurb: 'Chips, steel, batteries. Everything else is fine.' },
    { p:  1, label: 'Buy American Mandates + Tariffs',      cost:  60, blurb: 'Reshoring by decree. Prices follow.' },
    { p:  2, label: 'An Across-the-Board Tariff Wall',      cost:-140, blurb: 'A tariff is a tax. Voters will learn this by year two.' }
  ],
  social: [
    { p: -2, label: 'Codify Roe, Repeal Hyde, Fund Access', cost:  14, blurb: 'Everything the movement has asked for since 1976.' },
    { p: -1, label: 'Codify Roe, Keep the Hyde Amendment',  cost:   3, blurb: 'The Senate-passable version. The base calls it a betrayal.' },
    { p:  0, label: 'Leave It to the States',               cost:   0, blurb: 'A procedural answer to a moral question.' },
    { p:  1, label: 'A 15-Week National Standard',          cost:   2, blurb: 'Splits the difference. Enrages both flanks.' },
    { p:  2, label: 'A National Ban from Conception',       cost:   2, blurb: 'Locks down the primary. Detonates the suburbs.' }
  ],
  defense: [
    { p: -2, label: 'Cut the Pentagon 20%, End the Wars',   cost:-170, blurb: 'The peace dividend, if you can survive the hearings.' },
    { p: -1, label: 'Flat Budget, Diplomacy First',         cost: -40, blurb: 'Real cuts, once you account for inflation.' },
    { p:  0, label: 'Modernize, Hold Spending Steady',      cost:  20, blurb: 'The Joint Chiefs will accept this. Barely.' },
    { p:  1, label: '3.5% of GDP, Rebuild the Fleet',       cost: 160, blurb: 'Shipyards in six states suddenly love you.' },
    { p:  2, label: 'Massive Buildup, Confront Everywhere', cost: 340, blurb: 'Deterrence is cheaper than war, until it is not.' }
  ],
  crime: [
    { p: -2, label: 'Decarcerate, End Cash Bail, Redirect', cost:  30, blurb: 'Morally coherent. Electorally hazardous after any bad news cycle.' },
    { p: -1, label: 'Consent Decrees + Reentry Investment', cost:  22, blurb: 'Reform through the Civil Rights Division.' },
    { p:  0, label: 'Fund the Police AND Fund Reform',      cost:  28, blurb: 'The consultant-approved answer.' },
    { p:  1, label: '100,000 More Cops, Bail Crackdown',    cost:  45, blurb: 'The 1994 playbook, run again.' },
    { p:  2, label: 'Mandatory Minimums, Federalize Crime', cost:  70, blurb: 'Prison population up, crime rate on a lag.' }
  ],
  reform: [
    { p: -2, label: 'Expand the Court, DC Statehood, Nuke the Filibuster', cost: 25, blurb: 'Rewrite the rules while you hold the pen.' },
    { p: -1, label: 'Voting Rights Act, Anti-Gerrymander',  cost:  12, blurb: 'A generational structural gain — if you can pass it.' },
    { p:  0, label: 'Modest Ethics and Disclosure Rules',   cost:   3, blurb: 'Nobody opposes it. Nobody notices it.' },
    { p:  1, label: 'Voter ID, Clean the Rolls',            cost:   5, blurb: 'Popular in the abstract, litigated in the particular.' },
    { p:  2, label: 'Proof of Citizenship, State Certification', cost: 8, blurb: 'Hardens the process and the opposition.' }
  ],
  housing: [
    { p: -2, label: 'Federal Rent Caps + 5M Public Units',  cost: 310, blurb: 'The biggest federal build since Levittown.' },
    { p: -1, label: 'Vouchers + Zoning Preemption',         cost: 140, blurb: 'Overrule the suburbs from Washington. They will notice.' },
    { p:  0, label: 'Tax Credits for Builders',             cost:  55, blurb: 'LIHTC, but more of it.' },
    { p:  1, label: 'Cut Federal Rules, Let Localities Decide', cost: -15, blurb: 'Homeowners approve. Renters keep renting.' },
    { p:  2, label: 'Abolish HUD, Pure Local Control',      cost: -60, blurb: 'A clean line on a spreadsheet and a mess in every city.' }
  ],
  tech: [
    { p: -2, label: 'Break Up Big Tech, License Frontier AI', cost:  18, blurb: 'Antitrust as industrial policy.' },
    { p: -1, label: 'Privacy Law, Antitrust, AI Audits',    cost:  10, blurb: 'The Brussels approach with an American accent.' },
    { p:  0, label: 'A Light-Touch Federal AI Framework',   cost:   6, blurb: 'Standards bodies and strongly worded guidance.' },
    { p:  1, label: 'Preempt State AI Laws, Speed Permits', cost:   4, blurb: 'One national rule, written by the people being regulated.' },
    { p:  2, label: 'Zero Regulation, Full Acceleration',   cost:   0, blurb: 'Let it rip and litigate the wreckage later.' }
  ]
};

/* ==========================================================================
   VOTER BLOCS
   `pull` is the partisan baseline (-1 Democratic, +1 Republican).
   `ideal` and `weight` are per-issue, in ISSUE_IDS order.
   `turnout` is a propensity multiplier.
   ========================================================================== */
const BLOCS = [
  {
    id: 'urbanProf', name: 'Urban Professionals', pull: -0.60, turnout: 1.15,
    ideal:  [-0.8, -0.5, -1.2, -1.4, -1.2, -1.0, -1.5,  0.2,  0.0, -1.0, -0.5, -0.3],
    weight: [ 0.5,  0.7,  0.4,  0.8,  0.4,  0.4,  0.8,  0.3,  0.5,  0.6,  0.6,  0.5]
  },
  {
    id: 'suburbMod', name: 'Suburban Moderates', pull: 0.05, turnout: 1.08,
    ideal:  [-0.2,  0.2,  0.1, -0.4, -0.4,  0.1, -0.6,  0.3,  0.6, -0.2,  0.6, -0.2],
    weight: [ 0.7,  0.8,  0.6,  0.4,  0.5,  0.4,  0.8,  0.3,  0.8,  0.3,  0.6,  0.3]
  },
  {
    id: 'ruralTrad', name: 'Rural Traditionalists', pull: 0.90, turnout: 1.00,
    ideal:  [ 0.8,  1.0,  1.5,  1.3,  1.6,  0.8,  1.3,  1.0,  1.3,  0.9,  1.5,  0.6],
    weight: [ 0.6,  0.6,  0.9,  0.6,  0.9,  0.6,  0.7,  0.5,  0.6,  0.4,  0.3,  0.2]
  },
  {
    id: 'unionHH', name: 'Union Households', pull: -0.30, turnout: 1.02,
    ideal:  [-1.2, -0.6,  0.3, -0.3,  0.2,  1.6, -0.2,  0.4,  0.4, -0.4, -0.6, -0.4],
    weight: [ 0.8,  0.7,  0.5,  0.5,  0.4,  1.0,  0.4,  0.4,  0.5,  0.3,  0.6,  0.3]
  },
  {
    id: 'youngLeft', name: 'Young Progressives', pull: -0.90, turnout: 0.70,
    ideal:  [-1.8, -1.4, -1.5, -1.9, -1.4, -0.6, -1.8, -1.2, -1.5, -1.7, -1.5, -1.0],
    weight: [ 0.8,  0.7,  0.6,  1.0,  0.5,  0.3,  0.9,  0.4,  0.7,  0.7,  0.9,  0.5]
  },
  {
    id: 'evangelical', name: 'Evangelical Conservatives', pull: 1.00, turnout: 1.12,
    ideal:  [ 1.0,  1.1,  1.3,  1.2,  1.4,  0.6,  1.9,  1.2,  1.2,  1.0,  1.2,  0.8],
    weight: [ 0.4,  0.5,  0.7,  0.3,  0.6,  0.3,  1.0,  0.5,  0.6,  0.4,  0.2,  0.3]
  },
  {
    id: 'blackVoters', name: 'Black Voters', pull: -1.30, turnout: 0.94,
    ideal:  [-1.4, -0.9, -0.3, -0.7, -0.8,  0.3, -0.6, -0.1, -0.6, -1.6, -1.1, -0.4],
    weight: [ 0.8,  0.6,  0.3,  0.4,  0.5,  0.3,  0.5,  0.3,  0.7,  0.9,  0.7,  0.3]
  },
  {
    id: 'hispanicVoters', name: 'Hispanic Voters', pull: -0.40, turnout: 0.76,
    ideal:  [-1.1, -0.7, -1.0, -0.5, -0.4,  0.2, -0.3,  0.1,  0.1, -0.9, -1.0, -0.3],
    weight: [ 0.8,  0.8,  0.7,  0.4,  0.3,  0.4,  0.4,  0.3,  0.6,  0.4,  0.7,  0.3]
  },
  {
    id: 'seniors', name: 'Seniors', pull: 0.20, turnout: 1.35,
    ideal:  [-0.4,  0.5,  0.9,  0.4,  0.5,  0.6,  0.4,  0.7,  1.1,  0.4,  1.4,  0.3],
    weight: [ 1.0,  0.7,  0.6,  0.3,  0.4,  0.4,  0.5,  0.5,  0.7,  0.4,  0.4,  0.2]
  },
  {
    id: 'smallBiz', name: 'Small Business Owners', pull: 0.50, turnout: 1.12,
    ideal:  [ 1.0,  1.5,  0.6,  0.9,  0.5,  0.2,  0.2,  0.4,  0.9,  0.3,  0.9,  0.6],
    weight: [ 0.7,  1.0,  0.6,  0.5,  0.3,  0.6,  0.2,  0.3,  0.6,  0.3,  0.4,  0.4]
  },
  {
    id: 'libertarian', name: 'Libertarians', pull: 0.40, turnout: 0.95,
    ideal:  [ 1.6,  1.8, -0.2,  1.2,  1.8, -1.6, -0.4, -1.0, -0.6,  0.2,  1.6,  1.6],
    weight: [ 0.5,  1.0,  0.4,  0.4,  0.9,  0.5,  0.4,  0.5,  0.5,  0.5,  0.4,  0.8]
  },
  {
    id: 'securityHawks', name: 'Veterans & Security Hawks', pull: 0.50, turnout: 1.14,
    ideal:  [ 0.4,  0.4,  0.9,  0.3,  0.9,  0.5,  0.5,  1.8,  1.2,  0.5,  0.7,  0.5],
    weight: [ 0.5,  0.4,  0.6,  0.3,  0.5,  0.4,  0.3,  1.0,  0.7,  0.4,  0.3,  0.3]
  }
];

const BLOC_BY_ID = Object.fromEntries(BLOCS.map(b => [b.id, b]));

/* ==========================================================================
   STATES
   Demographic descriptors are rough real-world percentages and drive a bloc
   composition, which determines how *responsive* a state is to a change in
   the platform.  `base` is the state's prior partisan margin (Democratic
   two-party margin in points), used to anchor the model: at boot, sim.js
   solves each state's `cult` residual so that a generic Democrat against a
   generic Republican reproduces `base` exactly.  Demographics then explain
   the swing away from that anchor.  ev = 2024 apportionment.
   ========================================================================== */
/* [abbr, name, ev, urban, evangelical, union, black, hispanic, senior, college, veteran, base] */
const STATE_ROWS = [
  ['AL','Alabama',        9, 59, 49, 8,  27,  5, 18, 27,  9, -25.4],
  ['AK','Alaska',         3, 66, 26, 18,  3,  7, 13, 30, 13, -10.6],
  ['AZ','Arizona',       11, 90, 26, 5,   5, 32, 18, 31,  8,   0.3],
  ['AR','Arkansas',       6, 56, 46, 5,  15,  8, 18, 25,  9, -28.2],
  ['CA','California',    54, 95, 20, 16,  6, 40, 15, 36,  4,  29.9],
  ['CO','Colorado',      10, 86, 23, 7,   4, 22, 15, 43,  8,  13.8],
  ['CT','Connecticut',    7, 88, 13, 17, 11, 17, 18, 41,  5,  20.3],
  ['DE','Delaware',       3, 83, 22, 11, 22, 10, 20, 33,  8,  19.4],
  ['DC','D.C.',           3,100, 18, 10, 44, 11, 13, 63,  4,  87.0],
  ['FL','Florida',       30, 92, 27, 5,  16, 27, 21, 32, 10,  -3.4],
  ['GA','Georgia',       16, 77, 38, 5,  32, 10, 15, 33,  9,   0.3],
  ['HI','Hawaii',         4, 92, 15, 22,  2, 11, 19, 34,  8,  29.6],
  ['ID','Idaho',          4, 71, 28, 5,   1, 13, 17, 29,  9, -31.4],
  ['IL','Illinois',      19, 89, 21, 14, 14, 18, 17, 37,  5,  17.5],
  ['IN','Indiana',       11, 73, 33, 9,  10,  8, 17, 29,  7, -16.3],
  ['IA','Iowa',           6, 64, 30, 7,   4,  7, 18, 30,  7,  -8.3],
  ['KS','Kansas',         6, 73, 34, 7,   6, 13, 17, 35,  8, -15.0],
  ['KY','Kentucky',       8, 59, 42, 9,   8,  4, 18, 26,  8, -26.2],
  ['LA','Louisiana',      8, 73, 41, 6,  32,  6, 17, 26,  8, -18.9],
  ['ME','Maine',          4, 39, 15, 12,  2,  2, 23, 34,  9,   9.3],
  ['MD','Maryland',      10, 87, 22, 12, 30, 12, 17, 43,  7,  33.5],
  ['MA','Massachusetts', 11, 92, 11, 13,  8, 13, 18, 46,  4,  34.4],
  ['MI','Michigan',      15, 75, 25, 14, 13,  6, 19, 32,  6,   2.8],
  ['MN','Minnesota',     10, 73, 21, 14,  7,  6, 17, 38,  6,   7.2],
  ['MS','Mississippi',    6, 49, 47, 6,  38,  4, 17, 24,  8, -16.7],
  ['MO','Missouri',      10, 70, 36, 9,  12,  5, 18, 31,  8, -15.7],
  ['MT','Montana',        4, 56, 24, 11,  1,  4, 20, 34, 10, -16.6],
  ['NE','Nebraska',       5, 73, 30, 8,   5, 12, 16, 34,  7, -19.6],
  ['NV','Nevada',         6, 94, 22, 17,  9, 30, 17, 27,  9,   2.4],
  ['NH','New Hampshire',  4, 61, 13, 9,   2,  4, 20, 39,  8,   7.4],
  ['NJ','New Jersey',    14, 95, 15, 16, 13, 22, 17, 43,  4,  16.1],
  ['NM','New Mexico',     5, 77, 26, 7,   2, 50, 19, 30, 10,  11.0],
  ['NY','New York',      28, 88, 16, 21, 15, 20, 18, 39,  4,  23.4],
  ['NC','North Carolina',16, 68, 35, 3,  22, 11, 17, 34,  8,  -1.3],
  ['ND','North Dakota',   3, 61, 26, 6,   3,  4, 16, 31,  8, -33.9],
  ['OH','Ohio',          17, 78, 29, 12, 13,  4, 18, 30,  7,  -8.1],
  ['OK','Oklahoma',       7, 67, 44, 5,   7, 12, 17, 27,  9, -33.4],
  ['OR','Oregon',         8, 81, 20, 15,  2, 14, 19, 36,  8,  16.4],
  ['PA','Pennsylvania',  19, 79, 25, 13, 11,  8, 20, 33,  7,   1.2],
  ['RI','Rhode Island',   4, 91, 12, 16,  6, 17, 19, 36,  6,  21.0],
  ['SC','South Carolina', 9, 67, 40, 3,  26,  6, 19, 30, 10, -11.7],
  ['SD','South Dakota',   3, 57, 28, 5,   2,  5, 18, 31,  8, -26.5],
  ['TN','Tennessee',     11, 66, 44, 5,  17,  6, 18, 30,  8, -23.6],
  ['TX','Texas',         40, 88, 32, 4,  13, 40, 13, 33,  8,  -5.7],
  ['UT','Utah',           6, 91, 12, 4,   1, 15, 12, 37,  7, -20.9],
  ['VT','Vermont',        3, 35, 12, 12,  1,  2, 22, 41,  7,  35.7],
  ['VA','Virginia',      13, 76, 30, 5,  19, 10, 17, 41,  9,  10.2],
  ['WA','Washington',    12, 84, 19, 19,  4, 14, 17, 39,  8,  19.5],
  ['WV','West Virginia',  4, 45, 40, 11,  4,  2, 21, 22,  9, -39.1],
  ['WI','Wisconsin',     10, 70, 24, 8,   6,  7, 18, 32,  6,   0.6],
  ['WY','Wyoming',        3, 65, 30, 6,   1, 10, 18, 29, 10, -43.7]
];

/* Derive a bloc composition vector from the demographic descriptors. Blocs
   overlap in real life; here they are treated as disjoint slices of the
   electorate, then normalized. */
function deriveComposition(d) {
  const suburban = Math.max(0, d.urban - 30);
  const rural = 100 - d.urban;
  const raw = {
    urbanProf:      d.urban * d.college / 100 * 0.95,
    suburbMod:      suburban * 0.40 + rural * 0.22,
    ruralTrad:      rural * (0.34 + d.evangelical * 0.010) + 3,
    unionHH:        d.union * 1.45,
    youngLeft:      d.college * 0.30 + d.urban * 0.07,
    evangelical:    d.evangelical * 0.58,
    blackVoters:    d.black * 0.92,
    hispanicVoters: d.hispanic * 0.82,
    seniors:        d.senior * 1.25,
    smallBiz:       6 + rural * 0.09,
    libertarian:    3.5 + rural * 0.05,
    securityHawks:  d.veteran * 1.15
  };
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const out = {};
  for (const k in raw) out[k] = raw[k] / total;
  return out;
}

const STATES = STATE_ROWS.map(r => {
  const d = {
    abbr: r[0], name: r[1], ev: r[2],
    urban: r[3], evangelical: r[4], union: r[5], black: r[6],
    hispanic: r[7], senior: r[8], college: r[9], veteran: r[10],
    base: r[11], cult: 0
  };
  d.comp = deriveComposition(d);
  // Turnout-weighted population share, used to build the national electorate.
  d.weight = d.ev;
  return d;
});

const STATE_BY_ABBR = Object.fromEntries(STATES.map(s => [s.abbr, s]));

/* Classic tile-grid cartogram layout — 11 columns wide. */
const TILE_MAP = [
  ['',  '',  '',  '',  '',  '',  '',  '',  '',  '',  'ME'],
  ['AK','',  '',  '',  '',  '',  '',  '',  'VT','NH',''  ],
  ['',  '',  '',  '',  '',  '',  'WI','',  'NY','MA','RI'],
  ['WA','ID','MT','ND','MN','IL','MI','PA','NJ','CT',''  ],
  ['OR','NV','WY','SD','IA','IN','OH','VA','MD','DE',''  ],
  ['CA','UT','CO','NE','MO','KY','WV','NC','DC','',  ''  ],
  ['',  'AZ','NM','KS','AR','TN','SC','',  '',  '',  ''  ],
  ['',  '',  '',  'OK','LA','MS','AL','GA','',  '',  ''  ],
  ['HI','',  '',  'TX','',  '',  '',  'FL','',  '',  ''  ]
];

/* ==========================================================================
   PARTIES AND FACTIONS
   ========================================================================== */
const PARTIES = {
  D: {
    id: 'D', name: 'Democratic', dir: -1, color: '#3d7dd8', light: '#7aa9e8',
    primaryWeights: { urbanProf: 2.2, youngLeft: 1.9, blackVoters: 2.6, hispanicVoters: 1.5,
                      unionHH: 1.7, suburbMod: 1.1, seniors: 1.0, ruralTrad: 0.2,
                      evangelical: 0.1, smallBiz: 0.4, libertarian: 0.2, securityHawks: 0.5 }
  },
  R: {
    id: 'R', name: 'Republican', dir: 1, color: '#d1483f', light: '#e88a83',
    primaryWeights: { urbanProf: 0.6, youngLeft: 0.1, blackVoters: 0.15, hispanicVoters: 0.5,
                      unionHH: 0.7, suburbMod: 1.2, seniors: 1.6, ruralTrad: 2.4,
                      evangelical: 2.5, smallBiz: 1.8, libertarian: 1.2, securityHawks: 1.6 }
  }
};

/* Candidate backgrounds. Traits run 0..100. */
const BACKGROUNDS = [
  { id: 'gov',    name: 'Two-Term Governor',
    desc: 'You balanced a budget and cut a ribbon on something. Nobody in Washington respects you, which is the point.',
    traits: { charisma: 55, discipline: 72, gravitas: 62, authenticity: 60, money: 55, legislative: 45 },
    perk: 'executive' },
  { id: 'sen',    name: 'Senior Senator',
    desc: 'Thirty years of votes. Every single one of them is now an attack ad.',
    traits: { charisma: 48, discipline: 60, gravitas: 78, authenticity: 38, money: 62, legislative: 85 },
    perk: 'whip' },
  { id: 'mayor',  name: 'Big-City Mayor',
    desc: 'You ran a government larger than eleven states and everyone calls it a small job.',
    traits: { charisma: 62, discipline: 58, gravitas: 48, authenticity: 58, money: 50, legislative: 52 },
    perk: 'coalition' },
  { id: 'exec',   name: 'Business Executive',
    desc: 'You have never held office and you consider that a qualification.',
    traits: { charisma: 60, discipline: 40, gravitas: 45, authenticity: 66, money: 92, legislative: 22 },
    perk: 'selffund' },
  { id: 'general',name: 'Retired Four-Star',
    desc: 'You are unbeatable on defense and completely lost on health care.',
    traits: { charisma: 45, discipline: 80, gravitas: 88, authenticity: 62, money: 45, legislative: 30 },
    perk: 'commander' },
  { id: 'organizer', name: 'Movement Organizer',
    desc: 'You built a small-dollar list of four million people and a lot of enemies.',
    traits: { charisma: 74, discipline: 45, gravitas: 35, authenticity: 88, money: 58, legislative: 35 },
    perk: 'movement' },
  { id: 'backbench', name: 'House Firebrand',
    desc: 'You have never passed a bill but you have never lost a cable hit.',
    traits: { charisma: 80, discipline: 35, gravitas: 30, authenticity: 72, money: 66, legislative: 40 },
    perk: 'media' }
];

const PERK_TEXT = {
  executive:  'Competence: +15% effect from every governing action.',
  whip:       'Whip Operation: legislative deals cost 25% less capital.',
  coalition:  'Coalition Builder: +8% support among Black and Hispanic voters.',
  selffund:   'Self-Funder: start with $180M extra and never worry about a fundraiser.',
  commander:  'Commander: immune to the "weak on security" attack; crises cost half.',
  movement:   'Movement: base enthusiasm decays 60% slower; small-dollar money scales with base morale.',
  media:      'Earned Media: every campaign action also generates free coverage.'
};

/* ==========================================================================
   PRIMARY RIVALS — ideological archetypes, generated per party
   ========================================================================== */
const RIVAL_ARCHETYPES = {
  D: [
    { name: 'The Vice President',  lane: 'establishment', tilt: -0.35, funds: 210, name0: 'establishment',
      blurb: 'Loyal, tired, and inevitable until they are not.', traits: { charisma: 45, gravitas: 80, authenticity: 40 } },
    { name: 'The Movement Senator',lane: 'left', tilt: -1.55, funds: 165,
      blurb: 'Small-dollar juggernaut. Terrifies the donor class.', traits: { charisma: 72, gravitas: 60, authenticity: 88 } },
    { name: 'The Rust Belt Populist', lane: 'labor', tilt: -0.75, funds: 95,
      blurb: 'Wins union halls, loses editorial boards.', traits: { charisma: 66, gravitas: 55, authenticity: 78 } },
    { name: 'The Tech Governor',   lane: 'moderate', tilt: 0.05, funds: 320,
      blurb: 'Self-funding, data-driven, and slightly synthetic.', traits: { charisma: 52, gravitas: 58, authenticity: 32 } }
  ],
  R: [
    { name: 'The Frontrunner',     lane: 'establishment', tilt: 0.95, funds: 240,
      blurb: 'Owns the base and every primary-day headline.', traits: { charisma: 78, gravitas: 50, authenticity: 80 } },
    { name: 'The Faith Coalition Senator', lane: 'religious', tilt: 1.45, funds: 130,
      blurb: 'Church networks in nine states. Debate-stage discipline.', traits: { charisma: 58, gravitas: 70, authenticity: 74 } },
    { name: 'The Chamber Governor',lane: 'moderate', tilt: 0.35, funds: 285,
      blurb: 'Wall Street\'s candidate. Nobody in Iowa has heard of them.', traits: { charisma: 50, gravitas: 72, authenticity: 38 } },
    { name: 'The Libertarian Insurgent', lane: 'libertarian', tilt: 0.55, funds: 70,
      blurb: 'Ends the Fed, ends the wars, ends up with 9%.', traits: { charisma: 60, gravitas: 45, authenticity: 90 } }
  ]
};

/* Primary calendar — delegate counts approximate the real thing. */
const PRIMARY_CALENDAR = [
  { id: 'IA', name: 'Iowa Caucuses',      states: ['IA'], delegates: 41,  week: 1,
    note: 'Retail politics. Organization beats money.' },
  { id: 'NH', name: 'New Hampshire',      states: ['NH'], delegates: 34,  week: 2,
    note: 'Independents can vote. Moderates overperform.' },
  { id: 'NV', name: 'Nevada',             states: ['NV'], delegates: 48,  week: 3,
    note: 'Culinary Union and a heavily Hispanic electorate.' },
  { id: 'SC', name: 'South Carolina',     states: ['SC'], delegates: 63,  week: 4,
    note: 'The firewall. Black voters decide it.' },
  { id: 'ST', name: 'Super Tuesday',      states: ['CA','TX','NC','VA','MA','MN','CO','TN','AL','OK','AR','UT','ME','VT'],
    delegates: 1420, week: 6, note: 'Fourteen states at once. Only paid media reaches them all.' },
  { id: 'MW', name: 'The Midwest Swing',  states: ['MI','OH','MO','MS','WA','IL'], delegates: 640, week: 8,
    note: 'Where a wounded frontrunner usually dies.' },
  { id: 'NE', name: 'The Northeast Close',states: ['NY','PA','MD','CT','RI','DE','NJ','WI','IN','GA','AZ','FL'],
    delegates: 890, week: 11, note: 'The math becomes arithmetic.' }
];

/* ==========================================================================
   CONGRESS — caucuses rather than 535 individuals
   `ideal` is per-issue. `discipline` = willingness to take a tough vote for
   the president. `price` = capital cost multiplier for a deal.
   `exposure` = sensitivity to presidential approval in their seats.
   ========================================================================== */
const CAUCUSES = [
  // --- Democratic ---
  { id: 'prog',  name: 'Progressive Caucus',        party: 'D', chamber: 'both', share: 0.42,
    ideal: [-1.7,-1.4,-1.3,-1.8,-1.3,-0.5,-1.7,-1.2,-1.4,-1.6,-1.4,-0.9],
    discipline: 0.62, price: 1.5, exposure: 0.25,
    blurb: 'Safe seats, loud microphones, and a deep suspicion of half-loaves.' },
  { id: 'newdem',name: 'New Democrat Coalition',    party: 'D', chamber: 'both', share: 0.40,
    ideal: [-0.7,-0.5,-0.5,-0.9,-0.7,-0.6,-1.0, 0.2, 0.1,-0.8,-0.3,-0.2],
    discipline: 0.85, price: 0.9, exposure: 0.55,
    blurb: 'The governing wing. Will vote for anything that scores well with CBO.' },
  { id: 'bluedog',name: 'Blue Dogs & Frontliners',  party: 'D', chamber: 'both', share: 0.18,
    ideal: [-0.1, 0.2, 0.5,-0.1, 0.5, 0.5,-0.3, 0.6, 0.7,-0.2, 0.4, 0.1],
    discipline: 0.45, price: 1.9, exposure: 1.00,
    blurb: 'They hold Trump seats. Every roll call is a job interview.' },
  // --- Republican ---
  { id: 'mainst',name: 'Main Street Republicans',   party: 'R', chamber: 'both', share: 0.17,
    ideal: [ 0.4, 0.7, 0.5, 0.3, 0.5, 0.1, 0.2, 0.8, 0.7, 0.3, 0.7, 0.2],
    discipline: 0.48, price: 1.8, exposure: 1.00,
    blurb: 'Suburban districts, appropriations instincts, terrified of a primary.' },
  { id: 'rsc',   name: 'Republican Study Committee',party: 'R', chamber: 'both', share: 0.55,
    ideal: [ 1.1, 1.4, 1.2, 1.0, 1.3, 0.5, 1.3, 1.3, 1.2, 0.9, 1.1, 0.7],
    discipline: 0.82, price: 1.0, exposure: 0.45,
    blurb: 'The mainstream conservative body. Movable on defense and disaster money.' },
  { id: 'freedom',name: 'Freedom Caucus',           party: 'R', chamber: 'both', share: 0.28,
    ideal: [ 1.8, 1.9, 1.8, 1.6, 1.8, 0.9, 1.8, 1.0, 1.5, 1.4, 1.8, 1.4],
    discipline: 0.30, price: 2.6, exposure: 0.15,
    blurb: 'They would rather shut it down. Deficit numbers are a moral document.' }
];

const CAUCUS_BY_ID = Object.fromEntries(CAUCUSES.map(c => [c.id, c]));

/* ==========================================================================
   INTEREST GROUPS — react to bills, spend money, pressure caucuses
   ========================================================================== */
const GROUPS = [
  { id: 'afl',    name: 'The Labor Federation',   power: 0.75,
    ideal: [-1.3,-0.8, 0.2,-0.4, 0.1, 1.7,-0.3, 0.3, 0.2,-0.9,-0.7,-0.6],
    care:  [ 0.7, 0.6, 0.4, 0.5, 0.2, 1.0, 0.2, 0.3, 0.2, 0.6, 0.5, 0.4],
    reach: { prog: 0.5, newdem: 0.6, bluedog: 0.8, mainst: 0.2, rsc: 0.05, freedom: 0 } },
  { id: 'chamber',name: 'The Chamber of Commerce', power: 0.90,
    ideal: [ 1.1, 1.6, -0.6, 0.9, 0.3,-0.9, 0.0, 0.4, 0.6, 0.2, 0.8, 0.9],
    care:  [ 0.8, 1.0, 0.6, 0.7, 0.1, 0.8, 0.1, 0.3, 0.3, 0.3, 0.4, 0.7],
    reach: { prog: 0.05, newdem: 0.5, bluedog: 0.8, mainst: 0.9, rsc: 0.8, freedom: 0.3 } },
  { id: 'nra',    name: 'The Gun Owners League',    power: 0.70,
    ideal: [ 0, 0, 0, 0, 1.9, 0, 0, 0, 0.4, 0, 0, 0],
    care:  [ 0, 0, 0.1, 0, 1.0, 0, 0, 0, 0.3, 0, 0, 0],
    reach: { prog: 0, newdem: 0.15, bluedog: 0.85, mainst: 0.7, rsc: 0.9, freedom: 0.95 } },
  { id: 'green',  name: 'Climate Action Now',       power: 0.55,
    ideal: [ 0,-0.5, 0,-1.9, 0,-0.3, 0,-0.4, 0,-0.6,-0.6,-0.2],
    care:  [ 0, 0.3, 0, 1.0, 0, 0.3, 0, 0.2, 0, 0.3, 0.4, 0.2],
    reach: { prog: 0.9, newdem: 0.5, bluedog: 0.15, mainst: 0.15, rsc: 0.02, freedom: 0 } },
  { id: 'pharma', name: 'PhRMA',                    power: 0.85,
    ideal: [ 1.4, 0.7, 0, 0, 0, -0.4, 0, 0, 0, 0, 0, 0.6],
    care:  [ 1.0, 0.4, 0, 0, 0, 0.3, 0, 0, 0, 0, 0, 0.3],
    reach: { prog: 0.15, newdem: 0.6, bluedog: 0.7, mainst: 0.8, rsc: 0.7, freedom: 0.3 } },
  { id: 'aarp',   name: 'The Seniors Lobby',        power: 0.95,
    ideal: [-0.9, 0.2, 0, 0, 0, 0, 0, 0, 0.3, 0, 0.6, 0],
    care:  [ 1.0, 0.6, 0, 0, 0, 0, 0, 0, 0.2, 0, 0.3, 0],
    reach: { prog: 0.7, newdem: 0.8, bluedog: 0.9, mainst: 0.9, rsc: 0.7, freedom: 0.4 } },
  { id: 'faith',  name: 'The Family Council',       power: 0.65,
    ideal: [ 0, 0, 0.9, 0, 0.6, 0, 1.9, 0, 0.6, 0, 0, 0.5],
    care:  [ 0, 0, 0.4, 0, 0.2, 0, 1.0, 0, 0.3, 0, 0, 0.3],
    reach: { prog: 0, newdem: 0.05, bluedog: 0.3, mainst: 0.5, rsc: 0.9, freedom: 0.9 } },
  { id: 'defcon', name: 'Defense Contractors',      power: 0.80,
    ideal: [ 0, 0.4, 0, 0, 0, 0.4, 0, 1.8, 0, 0, 0, 0.4],
    care:  [ 0, 0.3, 0, 0, 0, 0.2, 0, 1.0, 0, 0, 0, 0.2],
    reach: { prog: 0.3, newdem: 0.7, bluedog: 0.8, mainst: 0.9, rsc: 0.9, freedom: 0.5 } },
  { id: 'tech',   name: 'The Tech Council',         power: 0.70,
    ideal: [ 0.3, 0.6,-0.9, -0.4, 0,-1.0, 0, 0, 0, 0, -0.4, 1.7],
    care:  [ 0.2, 0.5, 0.5, 0.3, 0, 0.5, 0, 0, 0, 0.2, 0.3, 1.0],
    reach: { prog: 0.3, newdem: 0.7, bluedog: 0.5, mainst: 0.6, rsc: 0.5, freedom: 0.4 } }
];

const GROUP_BY_ID = Object.fromEntries(GROUPS.map(g => [g.id, g]));

/* ==========================================================================
   CAMPAIGN ACTIONS
   ========================================================================== */
const CAMPAIGN_ACTIONS = [
  { id: 'ads',     name: 'Buy Broadcast Ads',   cost: 22, days: 0,
    desc: 'Blunt, expensive, and the only thing that moves numbers at scale.' },
  { id: 'digital', name: 'Digital Persuasion',  cost: 9,  days: 0,
    desc: 'Cheap and precise. Weak on seniors, strong on everyone under 45.' },
  { id: 'ground',  name: 'Field Organizing',    cost: 14, days: 1,
    desc: 'Slow to build, but it raises turnout and it does not decay.' },
  { id: 'rally',   name: 'Hold a Rally',        cost: 4,  days: 1,
    desc: 'Feeds the base, generates local news, risks a viral moment.' },
  { id: 'retail',  name: 'Retail Campaigning',  cost: 2,  days: 2,
    desc: 'Diners and VFW halls. Enormous per-voter effect, tiny reach.' },
  { id: 'money',   name: 'Fundraising Circuit', cost: 0,  days: 2,
    desc: 'Two days of call time and closed-door dinners. Someone will film one.' },
  { id: 'surrogate', name: 'Deploy Surrogates', cost: 6,  days: 0,
    desc: 'Half the effect of your own time, but you keep the days.' },
  { id: 'oppo',    name: 'Push Opposition Research', cost: 11, days: 0,
    desc: 'Drives up their negatives and yours. Rarely a clean trade.' }
];

/* ==========================================================================
   LEGISLATIVE AGENDA — bills are assembled from modular provisions
   `pos` shifts the bill's position on its issue axis.
   `byrd` = survives the Byrd rule and can ride reconciliation.
   ========================================================================== */
const BILLS = [
  {
    id: 'healthAct', name: 'The Health Security Act', issue: 'health',
    blurb: 'Your health care promise, translated into legislative text and immediately attacked from both directions.',
    provisions: [
      { id: 'h1', name: 'Public Option on the Exchanges', pos: -1.4, cost: 190, byrd: false,
        note: 'The core. Insurers will spend $200M against it.' },
      { id: 'h2', name: 'Medicare Drug Price Negotiation', pos: -0.9, cost: -95, byrd: true,
        note: 'Saves money and polls at 83%. PhRMA declares war.' },
      { id: 'h3', name: 'Cap Insulin and Out-of-Pocket Costs', pos: -0.5, cost: 30, byrd: true,
        note: 'Cheap, tangible, and impossible to vote against on camera.' },
      { id: 'h4', name: 'Extend ACA Subsidies to 600% FPL', pos: -0.7, cost: 120, byrd: true,
        note: 'Helps the near-middle class. Costs real money.' },
      { id: 'h5', name: 'Medicaid Expansion Federal Backstop', pos: -1.0, cost: 85, byrd: true,
        note: 'Covers the holdout states over their governors\' objections.' },
      { id: 'h6', name: 'Hyde-Style Funding Restrictions', pos: 0.9, cost: 0, byrd: false,
        note: 'The price of three moderate votes. The price of your base\'s morale.' },
      { id: 'h7', name: 'Association Health Plans & HSA Expansion', pos: 1.2, cost: -35, byrd: true,
        note: 'A genuine olive branch to small business and Main Street.' }
    ]
  },
  {
    id: 'taxAct', name: 'The Revenue and Growth Act', issue: 'taxes',
    blurb: 'The one bill that can move through reconciliation cleanly, which makes it the vehicle everyone wants to hang things on.',
    provisions: [
      { id: 't1', name: 'Raise the Corporate Rate to 28%', pos: -1.2, cost: -320, byrd: true,
        note: 'The single largest pay-for available to you.' },
      { id: 't2', name: 'Billionaire Minimum Income Tax', pos: -1.6, cost: -180, byrd: true,
        note: 'Polls beautifully. Constitutionally adventurous.' },
      { id: 't3', name: 'Expanded Child Tax Credit', pos: -0.8, cost: 210, byrd: true,
        note: 'Cuts child poverty in half. Expires unless you pay for it forever.' },
      { id: 't4', name: 'Restore the Full SALT Deduction', pos: 0.4, cost: 90, byrd: true,
        note: 'Nine suburban members will not vote for the bill without it.' },
      { id: 't5', name: 'Small Business Expensing', pos: 0.9, cost: 60, byrd: true,
        note: 'Buys Main Street and a surprising number of Blue Dogs.' },
      { id: 't6', name: 'IRS Enforcement Funding', pos: -0.6, cost: -140, byrd: true,
        note: 'Raises revenue without raising a rate. Becomes an attack ad anyway.' },
      { id: 't7', name: 'Cut the Top Individual Rate', pos: 1.7, cost: 240, byrd: true,
        note: 'If you actually want Freedom Caucus votes, this is the toll.' }
    ]
  },
  {
    id: 'infraAct', name: 'The Infrastructure and Industry Act', issue: 'trade',
    blurb: 'The most bipartisan thing on your desk, which is exactly why your own left flank distrusts it.',
    provisions: [
      { id: 'i1', name: 'Roads, Bridges, and Transit', pos: 0.0, cost: 280, byrd: false,
        note: 'Every member gets a ribbon. Nearly free votes.' },
      { id: 'i2', name: 'Domestic Semiconductor Buildout', pos: 0.6, cost: 160, byrd: false,
        note: 'Industrial policy the hawks love and the libertarians loathe.' },
      { id: 'i3', name: 'Prevailing Wage & Project Labor Agreements', pos: -0.9, cost: 25, byrd: false,
        note: 'Labor demands it. The Chamber calls it a poison pill.' },
      { id: 'i4', name: 'Buy American Content Requirements', pos: 1.1, cost: 40, byrd: false,
        note: 'Populist in both parties. Hated by economists in both parties.' },
      { id: 'i5', name: 'Categorical Permitting Reform', pos: 0.8, cost: -20, byrd: false,
        note: 'Unlocks construction. Environmental groups will sue you over it.' },
      { id: 'i6', name: 'Rural Broadband to the Last Mile', pos: -0.2, cost: 70, byrd: false,
        note: 'Buys rural members of both parties for the price of fiber.' },
      { id: 'i7', name: 'Grid Modernization & Transmission', pos: -0.5, cost: 110, byrd: false,
        note: 'Climate policy dressed as an engineering problem.' }
    ]
  },
  {
    id: 'immigAct', name: 'The Border and Opportunity Act', issue: 'immig',
    blurb: 'Nobody has passed one of these since 1986. Several people have lost their careers trying.',
    provisions: [
      { id: 'm1', name: 'Path to Citizenship for Dreamers', pos: -1.3, cost: 15, byrd: false,
        note: 'The moral core of the bill and the reason it dies.' },
      { id: 'm2', name: 'Agricultural and Essential Worker Visas', pos: -0.9, cost: 8, byrd: false,
        note: 'Farm state Republicans quietly need this.' },
      { id: 'm3', name: 'Asylum Standard Tightening', pos: 1.2, cost: 5, byrd: false,
        note: 'The concession that gets you a Senate hearing. Advocates will call it cruel.' },
      { id: 'm4', name: 'Border Infrastructure and Technology', pos: 1.0, cost: 45, byrd: false,
        note: 'Sensors, towers, and a number of miles of physical barrier.' },
      { id: 'm5', name: 'Mandatory E-Verify', pos: 1.4, cost: 12, byrd: false,
        note: 'Business hates it more than the restrictionists love it.' },
      { id: 'm6', name: 'Double the Immigration Court Bench', pos: -0.3, cost: 30, byrd: false,
        note: 'Boring, effective, and universally under-supported.' },
      { id: 'm7', name: 'Refugee Admissions Floor of 125,000', pos: -1.5, cost: 20, byrd: false,
        note: 'Your base considers this non-negotiable. The Senate considers it fatal.' }
    ]
  },
  {
    id: 'climateAct', name: 'The Energy Transition Act', issue: 'climate',
    blurb: 'Two coal-state senators sit between you and the entire climate agenda.',
    provisions: [
      { id: 'c1', name: 'Clean Electricity Tax Credits', pos: -1.2, cost: 240, byrd: true,
        note: 'The workhorse. Survives reconciliation. Survives the courts.' },
      { id: 'c2', name: 'Clean Electricity Performance Standard', pos: -1.8, cost: 90, byrd: false,
        note: 'A mandate, not an incentive. The Byrd rule eats it alive.' },
      { id: 'c3', name: 'Methane Fee on Producers', pos: -1.4, cost: -30, byrd: true,
        note: 'Cheap, effective, and personally offensive to two senators.' },
      { id: 'c4', name: 'Nuclear and Geothermal Fast-Track', pos: 0.3, cost: 60, byrd: false,
        note: 'Splits the environmental coalition and picks up Republicans.' },
      { id: 'c5', name: 'Coal Community Transition Fund', pos: -0.4, cost: 75, byrd: true,
        note: 'The direct purchase of two specific votes.' },
      { id: 'c6', name: 'Offshore and Federal Lands Leasing', pos: 1.3, cost: -55, byrd: true,
        note: 'The concession that got the last one over the line.' },
      { id: 'c7', name: 'Border Carbon Adjustment', pos: -0.6, cost: -70, byrd: false,
        note: 'A tariff that climate hawks and steel unions can both endorse.' }
    ]
  },
  {
    id: 'reformAct', name: 'The Democracy and Ethics Act', issue: 'reform',
    blurb: 'The bill that requires you to break the Senate in order to pass it.',
    provisions: [
      { id: 'r1', name: 'Restore Preclearance Under the VRA', pos: -1.4, cost: 10, byrd: false,
        note: 'The heart of it. Not one Republican vote available.' },
      { id: 'r2', name: 'Ban Partisan Gerrymandering', pos: -1.5, cost: 8, byrd: false,
        note: 'Would reshape the House. Roughly forty of your own members privately hate it.' },
      { id: 'r3', name: 'Automatic Voter Registration', pos: -1.0, cost: 12, byrd: false,
        note: 'Administratively simple, politically total war.' },
      { id: 'r4', name: 'Dark Money Disclosure', pos: -0.8, cost: 3, byrd: false,
        note: 'Polls at 85% in both parties. Passes in neither.' },
      { id: 'r5', name: 'Congressional Stock Trading Ban', pos: -0.4, cost: 1, byrd: false,
        note: 'Universally popular with voters. Universally resented in the cloakroom.' },
      { id: 'r6', name: 'Voter ID with Free Federal Cards', pos: 0.9, cost: 20, byrd: false,
        note: 'The trade that could theoretically get you to sixty.' },
      { id: 'r7', name: 'Supreme Court Term Limits', pos: -1.6, cost: 2, byrd: false,
        note: 'Probably unconstitutional by statute. Definitely a two-year fight.' }
    ]
  },
  {
    id: 'crimeAct', name: 'The Public Safety Act', issue: 'crime',
    blurb: 'The bill where your primary coalition and your general-election coalition openly disagree.',
    provisions: [
      { id: 'p1', name: 'COPS Hiring Grants', pos: 1.0, cost: 40, byrd: true,
        note: 'Mayors of every party want this. Your left flank calls it a betrayal.' },
      { id: 'p2', name: 'National Police Accountability Standards', pos: -1.4, cost: 15, byrd: false,
        note: 'Qualified immunity is the word that kills bills.' },
      { id: 'p3', name: 'Community Violence Intervention Funding', pos: -0.8, cost: 25, byrd: true,
        note: 'Evidence-based, cheap, and nobody campaigns on it.' },
      { id: 'p4', name: 'Fentanyl Trafficking Penalties', pos: 1.2, cost: 10, byrd: false,
        note: 'Passes 91-9 on its own. Useful as a vehicle.' },
      { id: 'p5', name: 'Federal Reentry and Expungement', pos: -1.1, cost: 20, byrd: true,
        note: 'The First Step Act coalition still exists, barely.' },
      { id: 'p6', name: 'Mandatory Minimums for Repeat Offenses', pos: 1.6, cost: 35, byrd: false,
        note: 'Buys the Freedom Caucus. Costs you a floor fight in your own conference.' }
    ]
  },
  {
    id: 'housingAct', name: 'The Housing Abundance Act', issue: 'housing',
    blurb: 'Everyone agrees there is a housing crisis. Nobody agrees whose zoning caused it.',
    provisions: [
      { id: 'z1', name: 'Federal Zoning Preemption for Transit Corridors', pos: -1.3, cost: 20, byrd: false,
        note: 'The single most effective provision. Local officials will revolt.' },
      { id: 'z2', name: 'Expand the Housing Voucher Program', pos: -1.0, cost: 150, byrd: true,
        note: 'Immediate relief. Landlord acceptance is the catch.' },
      { id: 'z3', name: 'Low-Income Housing Tax Credit Expansion', pos: -0.3, cost: 90, byrd: true,
        note: 'The bipartisan default. Slow, but it builds.' },
      { id: 'z4', name: 'First-Time Buyer Down Payment Credit', pos: -0.2, cost: 110, byrd: true,
        note: 'Popular. Economists will tell you it raises prices.' },
      { id: 'z5', name: 'National Rent Stabilization Standard', pos: -1.9, cost: 25, byrd: false,
        note: 'Your left demands it. It will not get fifty votes.' },
      { id: 'z6', name: 'Environmental Review Streamlining for Housing', pos: 0.9, cost: -10, byrd: false,
        note: 'Cheap, effective, and a direct hit on an allied group.' }
    ]
  }
];

/* ==========================================================================
   EVENTS — campaign and governing
   ========================================================================== */
const CAMPAIGN_EVENTS = [
  { id: 'gaffe', title: 'An Unfortunate Clip',
    text: 'A rope-line answer about {ISSUE} is running on a loop. Your press shop wants a same-day cleanup; your strategist says any response feeds it another day.',
    choices: [
      { label: 'Clarify immediately and move on', eff: { momentum: -1, coherence: 2, media: 1 } },
      { label: 'Refuse to apologize. Double down.', eff: { momentum: 2, base: 4, suburb: -5, coherence: -1 } },
      { label: 'Say nothing and let it die', eff: { momentum: -3, coherence: 0 } }
    ] },
  { id: 'endorse', title: 'A Kingmaker Calls',
    text: 'The most respected figure in your party will endorse — but wants a private commitment on {ISSUE} and a cabinet seat for an ally.',
    choices: [
      { label: 'Take the deal', eff: { momentum: 6, money: 25, debt: 1 } },
      { label: 'Accept the endorsement, promise nothing', eff: { momentum: 3, authenticity: 2 } },
      { label: 'Decline publicly. Run against the establishment.', eff: { momentum: -2, base: 8, authenticity: 5 } }
    ] },
  { id: 'oppo', title: 'Opposition Research Lands',
    text: 'A rival has a decade-old vote of yours on {ISSUE} and a very good ad buy behind it.',
    choices: [
      { label: 'Own the evolution. Explain the change.', eff: { coherence: 3, momentum: -1 } },
      { label: 'Counterattack with their record', eff: { momentum: 1, negatives: 4 } },
      { label: 'Pivot to the economy relentlessly', eff: { momentum: 0, discipline: 2 } }
    ] },
  { id: 'donor', title: 'The Donor Retreat',
    text: 'Two hundred million dollars is in one ballroom and they want to know whether you meant what you said about {ISSUE}.',
    choices: [
      { label: 'Reassure them in the room', eff: { money: 60, authenticity: -4, leak: 1 } },
      { label: 'Repeat your public position verbatim', eff: { money: 15, authenticity: 3 } },
      { label: 'Skip the retreat. Post about it.', eff: { money: -10, base: 7, authenticity: 5 } }
    ] },
  { id: 'debate', title: 'The Debate',
    text: 'Ninety minutes, live. Your team has a prepared attack, a prepared defense, and a warning that the prepared line always looks prepared.',
    choices: [
      { label: 'Run the attack', eff: { momentum: 4, negatives: 3 } },
      { label: 'Play it safe and stay on message', eff: { momentum: 1, discipline: 3 } },
      { label: 'Go off-script and be honest about a hard trade-off', eff: { momentum: 2, authenticity: 6, base: -3 } }
    ] }
];

const GOVERNING_EVENTS = [
  { id: 'recession', title: 'The Economy Turns',
    text: 'Two quarters of contraction. Unemployment is up eight tenths and your party is being asked whether the agenda caused it.',
    choices: [
      { label: 'Emergency stimulus package', eff: { econ: 2, deficit: 400, capital: -18 } },
      { label: 'Let the Fed handle it and stay disciplined', eff: { econ: -1, approval: -3, capital: 4 } },
      { label: 'Blame the previous administration loudly', eff: { approval: -1, base: 4, coherence: -2 } }
    ] },
  { id: 'scotus', title: 'A Supreme Court Vacancy',
    text: 'A seat opens. The Senate math is what it is, and your base has been waiting for this for a decade.',
    choices: [
      { label: 'Nominate a movement champion', eff: { base: 12, capital: -22, oppEnergy: 10 } },
      { label: 'Nominate a consensus appellate judge', eff: { base: -4, capital: -8, approval: 2 } },
      { label: 'Trade the seat for a legislative win', eff: { base: -10, capital: 15, coherence: -3 } }
    ] },
  { id: 'foreign', title: 'A Crisis Abroad',
    text: 'An ally is under attack and the intelligence is ambiguous. Congress wants a briefing; the wire services want a decision in four hours.',
    choices: [
      { label: 'Commit forces', eff: { approval: 5, capital: -12, hawks: 8, base: -8, deficit: 90 } },
      { label: 'Sanctions and arms, no troops', eff: { approval: 1, capital: -4 } },
      { label: 'Insist on a congressional authorization first', eff: { approval: -3, capital: 6, coherence: 4 } }
    ] },
  { id: 'scandal', title: 'A Cabinet Secretary Is a Problem',
    text: 'Your {DEPT} Secretary used a charter flight and a subordinate\'s NDA. The story has a second day.',
    choices: [
      { label: 'Accept the resignation today', eff: { approval: 1, capital: -5, base: -3 } },
      { label: 'Defend them and wait it out', eff: { approval: -5, capital: -8, loyalty: 5 } },
      { label: 'Order an IG investigation and say nothing', eff: { approval: -2, capital: -2 } }
    ] },
  { id: 'shutdown', title: 'The Appropriations Cliff',
    text: 'Funding lapses in nine days. The opposition wants a policy rider attached; your own left says a shutdown is preferable to the rider.',
    choices: [
      { label: 'Accept the rider. Keep the government open.', eff: { approval: 3, base: -10, capital: -6 } },
      { label: 'Veto and take the shutdown', eff: { approval: -6, base: 12, capital: -14, econ: -1 } },
      { label: 'Negotiate a clean short-term CR', eff: { approval: 0, capital: -9 } }
    ] },
  { id: 'court', title: 'The Fifth Circuit Enjoins You',
    text: 'A district judge in a carefully chosen division has enjoined your signature rule nationwide.',
    choices: [
      { label: 'Appeal and comply in the meantime', eff: { capital: -3, approval: -2 } },
      { label: 'Rewrite the rule to survive review', eff: { capital: -10, policyStrength: -0.3 } },
      { label: 'Attack the judge and the venue-shopping', eff: { base: 8, approval: -3, coherence: -2 } }
    ] },
  { id: 'primaryThreat', title: 'Your Own Flank Revolts',
    text: 'Members of the {CAUCUS} have announced they will withhold votes on everything until you move on {ISSUE}.',
    choices: [
      { label: 'Meet them halfway in public', eff: { capital: -8, base: 6 } },
      { label: 'Dare them. Go around with the other party.', eff: { capital: -14, base: -12, bipartisan: 10 } },
      { label: 'Buy them off with an executive action', eff: { capital: -6, base: 8, courtRisk: 12 } }
    ] },
  { id: 'disaster', title: 'A Category Five',
    text: 'Landfall in a state you lost by nine. Supplemental appropriations are needed and the delegation is hostile.',
    choices: [
      { label: 'Go there. Full federal response.', eff: { approval: 6, capital: -6, deficit: 60, bipartisan: 8 } },
      { label: 'Send FEMA, stay in Washington', eff: { approval: -1, deficit: 40 } },
      { label: 'Condition aid on their votes', eff: { approval: -8, capital: 5, coherence: -6 } }
    ] }
];

const DEPTS = ['Housing', 'Transportation', 'Veterans Affairs', 'Interior', 'Commerce', 'Labor', 'Energy'];
