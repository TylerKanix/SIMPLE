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
  { id: 'ads',     name: 'Buy Broadcast Ads',   cost: 22, days: 0, group: 'Persuasion',
    desc: 'Blunt, expensive, and the only thing that moves numbers at scale.' },
  { id: 'target',  name: 'Targeted Buy',        cost: 13, days: 0, group: 'Persuasion', picksBloc: true,
    desc: 'Choose a bloc and spend the whole budget on it. Better than broadcast at the right bloc, worth nothing at the wrong one, and it saturates after a buy or two — the same people can only be reached so often.' },
  { id: 'digital', name: 'Digital Persuasion',  cost: 9,  days: 0, group: 'Persuasion',
    desc: 'Cheap and precise. Weak on seniors, strong on everyone under 45.' },
  { id: 'surrogate', name: 'Deploy Surrogates', cost: 6,  days: 0, group: 'Persuasion',
    desc: 'Half the effect of your own time, but you keep the days.' },
  { id: 'ground',  name: 'Field Organizing',    cost: 14, days: 1, group: 'Mobilization',
    desc: 'Slow to build, but it raises turnout and it does not decay.' },
  { id: 'rally',   name: 'Hold a Rally',        cost: 4,  days: 1, group: 'Mobilization',
    desc: 'Feeds the base, generates local news, risks a viral moment.' },
  { id: 'retail',  name: 'Retail Campaigning',  cost: 2,  days: 2, group: 'Mobilization',
    desc: 'Diners and VFW halls. Enormous per-voter effect, tiny reach.' },
  { id: 'money',   name: 'Fundraising Circuit', cost: 0,  days: 2, group: 'Mobilization',
    desc: 'Two days of call time and closed-door dinners. Someone will film one.' },

  /* ---- the other campaign ------------------------------------------------
     Everything here works on them rather than on you, and everything here can
     rebound. A campaign that only ever attacks ends the cycle with negatives
     of its own that follow it into office. */
  { id: 'oppo',    name: 'Push Opposition Research', cost: 11, days: 0, group: 'The Other Campaign',
    desc: 'Drives up their negatives and yours. Rarely a clean trade.', backfire: 0.18 },
  { id: 'attack',  name: 'Negative Buy on a Bloc',   cost: 15, days: 0, group: 'The Other Campaign', picksBloc: true,
    desc: 'Tell one group of people, at length, what the other candidate thinks of them. Suppresses their support more than it raises yours.', backfire: 0.24 },
  { id: 'bracket', name: 'Bracket Their Rally',      cost: 7,  days: 1, group: 'The Other Campaign',
    desc: 'Show up in the same media market on the same day and take half their coverage.', backfire: 0.12 },
  { id: 'forceMap',name: 'Force Them to Defend',     cost: 18, days: 0, group: 'The Other Campaign',
    desc: 'Buy air in a state they thought was safe. Cheap panic: they pull spending out of a battleground to answer it.', backfire: 0.10 },
  { id: 'debatePrep', name: 'Opposition Debate Prep', cost: 5, days: 2, group: 'The Other Campaign',
    desc: 'A week studying their tics and their record. Pays off the next time you share a stage.' }
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

/* ==========================================================================
   WHAT THE POLICIES ACTUALLY DO

   A provision's `note` is the politics of it — who wants it and what it
   costs you. That is what you need while whipping votes, and it is all the
   bill screen used to say. It is not what you need while deciding whether
   the bill is worth passing.

   `does` is the policy: the mechanism, and the number a budget office would
   put on it. `out` is that number in a form the game can add up, so that
   sixteen quarters of legislating produce a country that measurably differs
   from the one you inherited — and so a bill you gutted to get to sixty
   votes shows up as a smaller change rather than merely a lower score.

   Figures are plausible caricatures tuned for play, not forecasts.
   ========================================================================== */
const OUTCOMES = [
  { id: 'covered',   name: 'People with health insurance', unit: 'M',  dp: 1 },
  { id: 'premiums',  name: 'Exchange premiums',            unit: '%',  dp: 0 },
  { id: 'drugCost',  name: 'Prescription drug costs',      unit: '%',  dp: 0 },
  { id: 'poverty',   name: 'Child poverty rate',           unit: 'pp', dp: 1 },
  { id: 'jobs',      name: 'Jobs',                         unit: 'M',  dp: 2 },
  { id: 'wages',     name: 'Blue-collar wages',            unit: '%',  dp: 1 },
  { id: 'prices',    name: 'Consumer prices',              unit: '%',  dp: 1 },
  { id: 'emissions', name: 'Carbon emissions',             unit: '%',  dp: 0 },
  { id: 'homes',     name: 'Homes built',                  unit: 'M',  dp: 2 },
  { id: 'rent',      name: 'Rents',                        unit: '%',  dp: 0 },
  { id: 'crime',     name: 'Violent crime',                unit: '%',  dp: 0 },
  { id: 'incarc',    name: 'Federal prison population',    unit: 'K',  dp: 0 },
  { id: 'border',    name: 'Unauthorized crossings',       unit: '%',  dp: 0 },
  { id: 'legalized', name: 'People given legal status',    unit: 'M',  dp: 1 },
  { id: 'access',    name: 'Voters registered or protected', unit: 'M', dp: 1 }
];
const OUTCOME_BY_ID = Object.fromEntries(OUTCOMES.map(o => [o.id, o]));

const PROVISION_DETAIL = {
  /* --- The Health Security Act --- */
  h1: { does: 'Stands up a federally administered plan on every exchange, paying providers Medicare rates plus five percent. Roughly eight million uninsured people take it up, and the competition drags private exchange premiums down about a tenth.',
        out: { covered: 8, premiums: -11 } },
  h2: { does: 'Lets Medicare negotiate directly on the hundred highest-spend drugs, with a punitive excise tax on manufacturers who refuse to come to the table. Out-of-pocket drug spending falls about a quarter.',
        out: { drugCost: -26 } },
  h3: { does: 'Caps insulin at $35 a month and total annual out-of-pocket drug costs at $2,000. Narrow, cheap, and the only provision here that a voter feels the month it takes effect.',
        out: { drugCost: -6, covered: 0.3 } },
  h4: { does: 'Extends premium tax credits up to six times the poverty line — about $180,000 for a family of four — ending the subsidy cliff that made exchange coverage unaffordable just above the cutoff.',
        out: { covered: 4.5, premiums: -7 } },
  h5: { does: 'Runs a federal Medicaid look-alike directly in the states that never expanded, covering the roughly four million people in the coverage gap over their governors\' objections.',
        out: { covered: 3.8, poverty: -0.4 } },
  h6: { does: 'Bars every dollar in the bill from paying for abortion care. It changes no coverage numbers. It buys three moderate votes and costs you the organized support of your own coalition.',
        out: {} },
  h7: { does: 'Lets small employers band together to buy coverage outside state benefit rules and triples HSA contribution limits. Healthy buyers get cheaper plans; the people left in the regulated pool get worse ones.',
        out: { covered: -1.2, premiums: -4 } },

  /* --- The Revenue and Growth Act --- */
  t1: { does: 'Takes the corporate rate from 21% back to 28%. Raises about $320B a year — the single largest pay-for available to you — at a modest cost to business investment.',
        out: { jobs: -0.30, wages: -0.4 } },
  t2: { does: 'A 20% minimum tax on the total income, including unrealized gains, of households worth over $100M. Roughly 700 families pay it. It will be at the Supreme Court within a year.',
        out: {} },
  t3: { does: 'Restores the expanded child tax credit at $3,600 per young child, paid monthly and fully refundable. It cuts child poverty close to in half, which is the largest single thing in this bill.',
        out: { poverty: -4.1 } },
  t4: { does: 'Lifts the cap on deducting state and local taxes. It is worth almost nothing below the top decile, and nine suburban members will not vote for the bill without it.',
        out: {} },
  t5: { does: 'Lets small firms immediately expense equipment and raises the pass-through deduction. Genuinely useful to Main Street, and it buys a surprising number of Blue Dogs.',
        out: { jobs: 0.40 } },
  t6: { does: 'Funds the IRS to audit partnerships and high earners again. Raises about $140B a year without changing a single rate, and becomes an attack ad about armed agents regardless.',
        out: {} },
  t7: { does: 'Cuts the top individual rate to 33%. It costs $240B a year and it is the toll if you actually want Freedom Caucus votes on anything in this bill.',
        out: { jobs: 0.20 } },

  /* --- The Infrastructure and Industry Act --- */
  i1: { does: 'Reauthorizes the highway program at nearly double and funds transit capital. About 1.4 million construction and supply-chain jobs over the build-out, and every member gets a ribbon.',
        out: { jobs: 1.40 } },
  i2: { does: 'Grants and credits for domestic leading-edge fabs. Around 350,000 jobs, heavily concentrated in four states, and a supply chain that no longer runs entirely through the Taiwan Strait.',
        out: { jobs: 0.35 } },
  i3: { does: 'Requires Davis-Bacon prevailing wages and project labor agreements on everything the bill funds. Construction wages rise about five percent; so does the cost per mile.',
        out: { wages: 5.0, prices: 0.3 } },
  i4: { does: 'Requires domestic content in federally funded projects. Reshores some manufacturing, and raises the price of everything built under the bill by a couple of percent.',
        out: { jobs: 0.20, prices: 1.5 } },
  i5: { does: 'Categorical exclusions and a two-year shot clock on environmental review. Unlocks stalled construction of every kind — including, awkwardly for your allies, transmission and housing.',
        out: { homes: 0.30, jobs: 0.30, emissions: -1 } },
  i6: { does: 'Fiber to the last mile in counties private carriers will never serve. Cheap, popular, and it buys rural members of both parties for the price of laying cable.',
        out: { jobs: 0.15 } },
  i7: { does: 'Builds interregional high-voltage transmission and hardens the grid. The most emissions any single infrastructure line item buys, because renewables that cannot reach a city are decorative.',
        out: { emissions: -4, jobs: 0.40 } },

  /* --- The Border and Opportunity Act --- */
  m1: { does: 'A path to citizenship for people brought here as children — about 2.3 million people who currently renew a two-year work permit and hope. It is the moral core of the bill and the reason it dies.',
        out: { legalized: 2.3, jobs: 0.30 } },
  m2: { does: 'Uncaps agricultural and essential-worker visas and gives current undocumented farm workers a status track. Farm-state Republicans need this and would rather not say so on camera.',
        out: { legalized: 1.1, prices: -0.8, jobs: 0.20 } },
  m3: { does: 'Raises the credible-fear standard and imposes a transit bar. Asylum grants fall sharply and so do crossings. Every advocacy group in your coalition will call it cruel, and mean it.',
        out: { border: -18 } },
  m4: { does: 'Sensors, towers, surveillance aircraft, and a number of miles of physical barrier. Real effect on crossings, and the single most photographed line item in the bill.',
        out: { border: -12 } },
  m5: { does: 'Mandatory employment verification for every employer in the country. It works — it removes the job magnet — and business hates it far more than restrictionists love it.',
        out: { border: -22, jobs: -0.20 } },
  m6: { does: 'Doubles the immigration court bench and funds counsel. Cuts a three-year backlog to under a year, which does more for orderly process than any wall. Nobody campaigns on it.',
        out: { border: -6 } },
  m7: { does: 'Sets a statutory floor of 125,000 refugee admissions a year, taking the number out of the president\'s hands. Your base considers it non-negotiable; the Senate considers it fatal.',
        out: { legalized: 0.5 } },

  /* --- The Energy Transition Act --- */
  c1: { does: 'Ten-year technology-neutral tax credits for clean generation and storage. The workhorse of the entire climate agenda: about a fourteen percent cut in power-sector emissions, and it survives both reconciliation and the courts.',
        out: { emissions: -14, jobs: 0.60 } },
  c2: { does: 'A binding clean-electricity standard rising to 80% by 2035 — a mandate rather than an incentive, and worth more emissions than everything else here combined. The Byrd rule eats it alive.',
        out: { emissions: -19 } },
  c3: { does: 'A per-ton fee on methane leaked from oil and gas production. Cheap, immediate, the highest-leverage ton of carbon in the bill, and personally offensive to exactly two senators.',
        out: { emissions: -6 } },
  c4: { does: 'Fast-track licensing for advanced nuclear and enhanced geothermal. Splits the environmental coalition down the middle and picks up Republicans who will not vote for a credit with "clean" in the name.',
        out: { emissions: -5, jobs: 0.20 } },
  c5: { does: 'Pensions, healthcare, and site remediation for coal communities. It is not climate policy. It is the direct purchase of two specific votes, and it is the honest price of the rest of the bill.',
        out: { jobs: 0.10 } },
  c6: { does: 'Mandates new offshore and federal onshore lease sales as a condition of the credits. It adds emissions back. It is also what got the last one of these over the line.',
        out: { emissions: 7, jobs: 0.20 } },
  c7: { does: 'A carbon tariff on imported steel, cement, and aluminum. Climate hawks like the emissions; steel unions like the protection; consumers pay for it either way.',
        out: { emissions: -3, prices: 0.9, jobs: 0.10 } },

  /* --- The Democracy and Ethics Act --- */
  r1: { does: 'Restores federal preclearance for election-law changes in jurisdictions with a recent record of discrimination. Protects roughly four million voters from rule changes between now and the next census.',
        out: { access: 4.2 } },
  r2: { does: 'Requires independent redistricting commissions in every state. It would reshape the House for a generation, and roughly forty of your own members privately hope it fails.',
        out: { access: 2.0 } },
  r3: { does: 'Automatic registration at every state DMV and benefits agency, with same-day registration nationwide. Adds close to ten million registered voters, disproportionately young and renting.',
        out: { access: 9.5 } },
  r4: { does: 'Forces disclosure of donors above $10,000 to any group spending on elections. Polls at 85% in both parties and passes in neither, because both parties\' money likes the dark.',
        out: {} },
  r5: { does: 'Bars members of Congress and their spouses from trading individual stocks. Universally popular with voters, universally resented in the cloakroom, and worth exactly one news cycle.',
        out: {} },
  r6: { does: 'Requires photo ID to vote, paired with a free federal card and automatic issuance. Turns out a small number of people still cannot get one. This is the trade that could theoretically get you to sixty.',
        out: { access: -1.8 } },
  r7: { does: 'Eighteen-year terms with a nomination every two years. Probably unconstitutional by statute rather than amendment, and definitely a two-year fight that eats everything else.',
        out: {} },

  /* --- The Public Safety Act --- */
  p1: { does: 'Grants for 50,000 additional local officers with a community-policing requirement attached. Mayors of every party want it; the evidence says it cuts violent crime a few percent; your left flank calls it a betrayal.',
        out: { crime: -4 } },
  p2: { does: 'National use-of-force and misconduct-registry standards tied to federal funding. The bill is dead the moment qualified immunity is mentioned on the floor, and it will be.',
        out: {} },
  p3: { does: 'Funds hospital-based and street-outreach violence interruption. Pound for pound the most effective thing in this bill — around a seven percent cut in shootings — and nobody has ever campaigned on it.',
        out: { crime: -7 } },
  p4: { does: 'Schedules fentanyl analogues and raises trafficking penalties. It passes 91-9 standing on its own, which makes it the vehicle everything else in this bill rides on.',
        out: { incarc: 12, crime: -1 } },
  p5: { does: 'Funds reentry housing and jobs programs and expands federal expungement. Releases about sixty thousand people and cuts recidivism enough to show up in the crime numbers.',
        out: { incarc: -60, crime: -1 } },
  p6: { does: 'Mandatory minimums for repeat federal offenses. Adds a hundred and forty thousand people to federal prisons over a decade for a small, lagging crime effect. It buys the Freedom Caucus.',
        out: { incarc: 140, crime: -2 } },

  /* --- The Housing Abundance Act --- */
  z1: { does: 'Overrides local single-family-only zoning within half a mile of transit as a condition of federal transportation money. The single most effective provision in the bill — about 1.6 million homes — and every local official in America will revolt.',
        out: { homes: 1.60, rent: -9 } },
  z2: { does: 'Takes Section 8 from a lottery to an entitlement for everyone eligible. Immediate, direct relief to about two million households; landlord acceptance is the catch, and rents drift up where supply is fixed.',
        out: { poverty: -1.2, rent: 2 } },
  z3: { does: 'Roughly doubles the low-income housing tax credit allocation. The bipartisan default: slow, expensive per unit, and it does actually build.',
        out: { homes: 0.70 } },
  z4: { does: 'A refundable credit for first-time buyers. Extremely popular, and every economist will tell you that subsidizing demand into fixed supply mostly raises the price.',
        out: { homes: 0.10, prices: 0.6, rent: 1 } },
  z5: { does: 'A national cap on annual rent increases. Cuts rents hard for people who already have a lease and quietly reduces what gets built for everyone who does not. It will not get fifty votes.',
        out: { rent: -12, homes: -0.40 } },
  z6: { does: 'Exempts infill housing from federal environmental review. Cheap, effective, and a direct hit on an allied group that will sue you over it within the week.',
        out: { homes: 0.50 } }
};

/* Fold the policy detail into the bills themselves. Keeping it in a separate
   table means the legislative data stays readable as legislative data. */
BILLS.forEach(b => b.provisions.forEach(p => Object.assign(p, PROVISION_DETAIL[p.id] || { does: '', out: {} })));

/* More weather for a longer term. Sixteen quarters of eight events repeats
   fast; these widen the range of what a year in office can throw at you, and
   every effect key below is one the engine actually reads. */
GOVERNING_EVENTS.push(
  { id: 'strike', title: 'A National Rail Strike',
    text: 'Ninety thousand workers walk at midnight. The Railway Labor Act lets you impose a contract and end it by Thursday; the unions who knocked doors for you are asking whether you will.',
    choices: [
      { label: 'Impose the contract. Keep the freight moving.', eff: { econ: 1, approval: 3, base: -14, loyalty: -6 } },
      { label: 'Stay out of it and let them bargain', eff: { econ: -1, approval: -4, base: 10 } },
      { label: 'Force the carriers to the table personally', eff: { capital: -12, base: 6, bipartisan: -5, approval: 1 } }
    ] },
  { id: 'pandemic', title: 'A Novel Respiratory Virus',
    text: 'Forty cases in three states and a doubling time your public health people describe as "concerning." Everything you do now will look like an overreaction if it works.',
    choices: [
      { label: 'Move early and hard', eff: { econ: -1, approval: -4, deficit: 220, capital: -10 } },
      { label: 'Fund the response, avoid restrictions', eff: { deficit: 90, approval: 1, capital: -4 } },
      { label: 'Leave it to the states', eff: { approval: -2, oppEnergy: 6, base: -6 } }
    ] },
  { id: 'leak', title: 'A Cable Leaks',
    text: 'A verbatim transcript of your call with an allied head of government is on a news site. The quotes are accurate and unflattering, and the leak came from inside the building.',
    choices: [
      { label: 'Order a leak investigation', eff: { capital: -6, coherence: -1, oppEnergy: 4 } },
      { label: 'Own the substance in public', eff: { approval: -2, coherence: 3, bipartisan: -3 } },
      { label: 'Call the leader and apologize privately', eff: { approval: -1, capital: -3, hawks: 2 } }
    ] },
  { id: 'primaryChallenge', title: 'A Primary Challenger Files',
    text: 'A member of your own party with a national following has filed paperwork in New Hampshire. They will not win. They will spend a year explaining to your voters what you failed to do.',
    choices: [
      { label: 'Ignore them entirely', eff: { base: -6, oppEnergy: 3 } },
      { label: 'Move toward them on the agenda', eff: { base: 11, capital: -10, approval: -2 } },
      { label: 'Have the party close ranks and shut it down', eff: { base: -9, capital: -8, loyalty: 8 } }
    ] },
  { id: 'debtCeiling', title: 'The Debt Ceiling',
    text: 'Treasury runs out of extraordinary measures in five weeks. The opposition wants a decade of caps; your own leadership wants you to mint a coin and dare the courts.',
    choices: [
      { label: 'Cut the deal. Take the caps.', eff: { approval: 4, base: -12, capital: -8, econ: -1 } },
      { label: 'Invoke the Fourteenth Amendment', eff: { base: 12, courtRisk: 1, oppEnergy: 14, approval: -3 } },
      { label: 'Refuse to negotiate and let them blink', eff: { econ: -1, approval: -5, capital: -6, base: 8 } }
    ] },
  { id: 'nobel', title: 'An Unexpected Peace',
    text: 'Two years of quiet work by your envoy produces a signing ceremony nobody predicted. The credit is genuinely shared, and the podium only fits one person.',
    choices: [
      { label: 'Take the podium', eff: { approval: 6, hawks: 3, bipartisan: -2 } },
      { label: 'Put the envoy and the parties out front', eff: { approval: 3, bipartisan: 7, capital: 5 } },
      { label: 'Spend the moment pushing the treaty through the Senate', eff: { capital: -10, bipartisan: 10, approval: 2 } }
    ] }
);

/* ==========================================================================
   BIOGRAPHY
   A candidate is not only a platform. Voters read things into where someone
   is from, how old they are, and what they did before politics, and those
   readings are worth real points with particular blocs. Each entry below is
   an affinity — a standing bonus to how much a bloc likes you, independent of
   any position you take.
   ========================================================================== */
const BIO_TRAITS = [
  { id: 'veteran', name: 'Served in Uniform',
    desc: 'Two tours and a discharge you can put in an ad.',
    aff: { securityHawks: 0.34, ruralTrad: 0.12 }, traits: { gravitas: 3 } },
  { id: 'union', name: 'Union Family',
    desc: 'Your father had a local number and you can still say it.',
    aff: { unionHH: 0.36, blackVoters: 0.06 }, traits: { authenticity: 3 } },
  { id: 'smalltown', name: 'Small-Town Roots',
    desc: 'A place with one stoplight and a water tower with your county on it.',
    aff: { ruralTrad: 0.30, suburbMod: 0.06 } },
  { id: 'immigrant', name: 'Immigrant Family',
    desc: 'The first in the family born here, and the story writes itself.',
    aff: { hispanicVoters: 0.30, urbanProf: 0.10 }, traits: { authenticity: 3 } },
  { id: 'faith', name: 'Active in a Congregation',
    desc: 'You can quote scripture without sounding like you were handed the verse.',
    aff: { evangelical: 0.28, blackVoters: 0.14 } },
  { id: 'teacher', name: 'Taught School',
    desc: 'Eleven years in a public classroom, which is eleven years of unimpeachable answers.',
    aff: { suburbMod: 0.22, youngLeft: 0.10 } },
  { id: 'founder', name: 'Built a Business',
    desc: 'You made a payroll, and you will mention it in every debate.',
    aff: { smallBiz: 0.34, libertarian: 0.12 }, traits: { money: 6 } },
  { id: 'organizerBio', name: 'Community Organizing',
    desc: 'You know what a precinct captain does because you were one.',
    aff: { youngLeft: 0.26, blackVoters: 0.16 } },
  { id: 'doctor', name: 'Practiced Medicine',
    desc: 'Nobody argues with a doctor about health care on television.',
    aff: { seniors: 0.24, suburbMod: 0.12 }, traits: { gravitas: 4 } },
  { id: 'prosecutor', name: 'Career Prosecutor',
    desc: 'You have put people in prison, which is either the credential or the problem.',
    aff: { suburbMod: 0.16, seniors: 0.14, securityHawks: 0.10 },
    anti: { youngLeft: -0.14 } }
];
const BIO_BY_ID = Object.fromEntries(BIO_TRAITS.map(b => [b.id, b]));

/* Age is a real variable and it cuts both ways: it buys gravitas and seniors,
   it costs you the young, and past a point the coverage is about your health
   rather than your platform. */
function ageProfile(age) {
  return {
    aff: {
      youngLeft: clamp((56 - age) / 52, -0.34, 0.30),
      seniors:   clamp((age - 48) / 70, -0.22, 0.26),
      urbanProf: clamp((58 - age) / 150, -0.10, 0.09)
    },
    gravitas: clamp((age - 46) * 0.42, -8, 15),
    // Days on the trail are a physical fact, and the press starts counting.
    stamina: clamp((66 - age) / 14, -1.4, 1.0),
    scrutiny: age >= 72 ? 'Coverage of your age is now a recurring story.'
            : age <= 41 ? 'You will be asked whether you are ready in every interview.' : null
  };
}

const HOME_STATE_BONUS = 0.170;   // about three points at home
const HOME_REGION_BONUS = 0.030;

/* ==========================================================================
   SITUATIONS
   An event is a fork: you pick, it applies, it is over. A situation is the
   other kind of thing that happens to a president — it lands on the desk, it
   does not resolve itself, and it takes weeks you were going to spend on the
   agenda. Ignoring one is a real option with a real price.
   ========================================================================== */
const SITUATIONS = [
  { id: 'hurricane', name: 'Category Five Landfall', weeks: 5, quarters: 2,
    desc: 'Two million people without power in a state you lost by nine. FEMA is stood up, the governor is on television hourly, and the federal response is now personally yours whatever the org chart says.',
    working: 'Running the federal response',
    resolved: { approval: 5, bipartisan: 7, deficit: 70 },
    ignored:  { approval: -9, deficit: 40, oppEnergy: 8 },
    resolvedText: 'The response is competent and visible, and the governor who spent a year attacking you says so on camera.',
    ignoredText: 'The word used in every retrospective is "abandoned", and it attaches to you rather than to the agency.' },

  { id: 'bank', name: 'A Bank Fails on a Friday', weeks: 4, quarters: 1,
    desc: 'The fourth-largest regional bank does not open Monday unless something happens over the weekend. Treasury wants an emergency guarantee; your own left calls it a bailout and they are not entirely wrong.',
    working: 'Managing the failure',
    resolved: { econ: 1, approval: -2, base: -5, capital: -6 },
    ignored:  { econ: -2, approval: -7, deficit: 180 },
    resolvedText: 'Depositors are made whole, contagion stops at two institutions, and nobody thanks you for the crisis that did not happen.',
    ignoredText: 'Three more banks go over the following fortnight and the word contagion enters the coverage.' },

  { id: 'hostage', name: 'Americans Taken Abroad', weeks: 6, quarters: 3,
    desc: 'Eleven citizens held by a group your intelligence people describe as "not a state and not quite not a state". The families are on television. Every option is bad and the good one is slow.',
    working: 'Working the negotiation',
    resolved: { approval: 7, hawks: 4, capital: -8 },
    ignored:  { approval: -8, oppEnergy: 12 },
    resolvedText: 'They come home on a Tuesday, on a plane, and the footage runs for a week.',
    ignoredText: 'The families stop asking you for help and start asking the other party for it.' },

  { id: 'outbreak', name: 'A Foodborne Outbreak', weeks: 3, quarters: 2,
    desc: 'Nineteen states, a supply chain nobody can map, and an agency you have not staffed since the transition.',
    working: 'Standing up the response',
    resolved: { approval: 2, capital: -3 },
    ignored:  { approval: -5, econ: -1 },
    resolvedText: 'Traced to one processor in eight days. The recall is enormous and boring, which is the goal.',
    ignoredText: 'It takes eleven weeks to trace and the hearings take longer than that.' },

  { id: 'border', name: 'A Surge at the Border', weeks: 5, quarters: 2,
    desc: 'Encounters triple in six weeks. The facilities are past capacity, the footage is unbearable in both directions, and both parties have found the version of it that helps them.',
    working: 'Managing the surge',
    resolved: { approval: 4, base: -6, capital: -7 },
    ignored:  { approval: -8, oppEnergy: 14 },
    resolvedText: 'Processing capacity triples, the numbers come down, and nobody on either flank is satisfied.',
    ignoredText: 'The images run nightly for a month and become the only thing anyone knows about your presidency.' },

  { id: 'cyber', name: 'The Grid Is Probed', weeks: 4, quarters: 2,
    desc: 'A foreign actor is inside the operational networks of three utilities. Nothing has happened yet. Saying so publicly causes a panic; not saying so is a decision you will have to defend later.',
    working: 'Running the remediation',
    resolved: { capital: -5, hawks: 5, approval: 1 },
    ignored:  { approval: -6, econ: -1, oppEnergy: 8 },
    resolvedText: 'Quietly remediated across nine months. The disclosure, when it comes, is a paragraph.',
    ignoredText: 'Six hundred thousand people lose power for two days and the timeline leaks in full.' },

  { id: 'succession', name: 'A Nuclear State Loses Its Leader', weeks: 6, quarters: 3,
    desc: 'The succession is contested, the arsenal is not obviously under anyone\'s control, and your options range from doing nothing loudly to doing something you cannot undo.',
    working: 'Managing the succession',
    resolved: { approval: 5, hawks: 7, capital: -10 },
    ignored:  { approval: -6, hawks: -6, oppEnergy: 10 },
    resolvedText: 'A quiet channel, a set of assurances, and a transition that ends without an incident anyone can point to.',
    ignoredText: 'It resolves without you, which every foreign ministry in the world notices.' },

  { id: 'strikeWave', name: 'A Strike Wave', weeks: 4, quarters: 2,
    desc: 'Ports, then rail, then two automakers. It is no longer a labour dispute, it is an economic story, and both sides think you are theirs.',
    working: 'Mediating',
    resolved: { econ: 1, base: 6, bipartisan: -4, capital: -6 },
    ignored:  { econ: -2, approval: -4, base: -8 },
    resolvedText: 'Contracts at three of the four tables, and the fourth settles on the pattern within a month.',
    ignoredText: 'Eleven weeks of shutdown, and everyone involved agrees the White House was not there.' }
];

/* ==========================================================================
   THE WAR

   Most presidencies do not have one. This one has a one-in-ten chance of it,
   rolled once at the inauguration and then fixed for the rest of the run.

   Note what that does and does not promise. The roll draws from the same
   seeded stream every other decision draws from, and how many draws happen
   before it depends on how the primary and the general were played — so a seed
   and the same choices reproduce a run exactly, war included, but the same
   seed played differently can land on the other side of the roll.

   A situation is a thing you spend weeks on until it goes away. A war is not
   that. It has a board, an opponent who moves on it, and two clocks: how much
   longer they will keep fighting, and how much longer you will be allowed to.
   You do not win it by putting enough weeks in. You win it by making the first
   clock run out before the second one does.

   The theatre and the belligerents are invented. Nothing here is a claim about
   any real conflict, and the geography is drawn for the strategic problem it
   poses rather than after anywhere in particular.
   ========================================================================== */

/* Rolled once, at the inauguration. */
const WAR_ODDS = 0.10;

const WAR_THEATRE = {
  ally: 'Vasterny',
  foe: 'Aravand',
  foeAdj: 'Aravandi',
  cable: 'Aravandi armour crossed the Vasterny frontier at four in the morning, local time, on three axes. Vasterny has invoked the mutual defence article. The treaty says you have already decided this.',
  brief: 'Five fronts, a treaty obligation you inherited, and an adversary with a nuclear arsenal and a shorter supply line than yours. Nobody is going to march on their capital. The war ends when one government decides it costs more than it is worth, and one of those governments is yours.'
};

/* Each front is a different strategic problem, and the difference is mostly
   `frontage`: how much force it takes to hold a coherent line there at all.
   A mountain pass is held by two divisions and cannot be taken by twenty. The
   steppe needs nine to be a line rather than a suggestion, which is why it is
   the front everyone leaves thin and the front that gets turned. */
const WAR_FRONTS = [
  { id: 'corridor', name: 'The Northern Corridor', terrain: 'Industrial plain',
    frontage: 6.0, value: 26, defBonus: 1.06, attrition: 1.16, supplyBase: 0.80,
    enemy0: 9.6, line0: -0.40,
    blurb: 'Their main axis and the shortest road to the Vasterny capital. Rail, refineries, and no ground worth the name. Whatever you do not put here, they will notice.' },

  { id: 'kesar', name: 'The Kesar Highlands', terrain: 'Mountain',
    frontage: 2.0, value: 11, defBonus: 1.62, attrition: 0.74, supplyBase: 0.58,
    enemy0: 3.4, line0: -0.08,
    blurb: 'Held by whoever got to the ridge first, and held cheaply. Two divisions are a wall here and twenty are a queue. The economy-of-force front, if you can bear to treat it as one.' },

  { id: 'dranov', name: 'The Dranov River Line', terrain: 'River crossing',
    frontage: 4.0, value: 19, defBonus: 1.34, attrition: 1.05, supplyBase: 0.92,
    enemy0: 6.2, line0: -0.24,
    blurb: 'A crossing under fire, which is the most expensive thing infantry does. Behind it your supply is better than anywhere else in the theatre — the depots are ninety miles back and on your side of the water.' },

  { id: 'shelf', name: 'The Coastal Shelf', terrain: 'Open littoral',
    frontage: 5.0, value: 22, defBonus: 0.86, attrition: 1.22, supplyBase: 0.96,
    enemy0: 5.8, line0: -0.18,
    blurb: 'Flat, dry, and overlooked by your ships. Armour works here and so does everything that kills armour. The two deepwater ports are the reason the theatre is supplied at all.' },

  { id: 'steppe', name: 'The Southern Steppe', terrain: 'Open steppe',
    frontage: 9.0, value: 14, defBonus: 0.78, attrition: 0.92, supplyBase: 0.66,
    enemy0: 3.9, line0: -0.10,
    blurb: 'Four hundred kilometres of nothing, and a line here is a series of opinions with gaps between them. Worth little to hold and everything to get behind — their whole northern effort is supplied across it.' }
];
const WAR_FRONT_BY_ID = Object.fromEntries(WAR_FRONTS.map(f => [f.id, f]));

/* The decisions that are not about the board. Each one is a thing a president
   can do that a theatre commander cannot, and each one is paid for at home. */
const WAR_ESCALATIONS = [
  { id: 'mobilize', name: 'Call Up the Reserves', capital: 8, weeks: 1, repeatable: true,
    desc: 'Six more divisions, and six more sets of families finding out at a kitchen table. The mobilization is legal, popular in the abstract, and detested in the particular.',
    eff: { approval: -3, base: -7, deficit: 95 } },

  { id: 'production', name: 'Invoke Wartime Production', capital: 6, weeks: 2, repeatable: false,
    desc: 'Priority ratings on the shell plants and the interceptor lines. The stockpile stops being the thing that decides how many quarters you can fight for.',
    eff: { deficit: 165, econ: 0.35 } },

  { id: 'coalition', name: 'Bring In the Alliance', capital: 12, weeks: 3, repeatable: false,
    needs: { bipartisan: 16 },
    desc: 'Four allied divisions, shared basing, and — the part that actually matters — a war that is no longer only yours to answer for. Requires goodwill you may not have spent a quarter building.',
    eff: { bipartisan: -6, approval: 2 } },

  { id: 'strike', name: 'Deep Strike Campaign', capital: 9, weeks: 2, repeatable: true,
    desc: 'Their depots, their bridges, their grid. It shortens the war and it is the part of the war that will be litigated for thirty years. Every strike is also a recruiting poster on their side of the line.',
    eff: { base: -9, approval: 1, deficit: 40, courtRisk: 1 } },

  { id: 'talks', name: 'Open a Channel', capital: 4, weeks: 1, repeatable: false, terminal: true,
    desc: 'A third country, a hotel, and a set of terms that will be exactly as good as the line on the map the morning you sit down. Ending it is a decision, not a default.',
    eff: {} }
];

/* The war writes to the same ledger as everything else, because it is the same
   country. Reported without a verdict, like the rest of it. */
const WAR_OUTCOMES = [
  { id: 'warDead',    name: 'American service members killed', unit: 'K', dp: 1 },
  { id: 'warCost',    name: 'Direct cost of the war',          unit: 'B', dp: 0 },
  { id: 'displaced',  name: 'Vasterny civilians displaced',    unit: 'M', dp: 1 }
];

/* Folded into the main ledger so the governing screen and the final accounting
   pick them up without knowing the war exists. Every ledger line renders only
   once it is non-zero, so a presidency without a war never shows them. */
for (const o of WAR_OUTCOMES) { OUTCOMES.push(o); OUTCOME_BY_ID[o.id] = o; }

/* ==========================================================================
   PATCH NOTES

   Versioning starts at 1.07 — the release that added the war. Everything
   before it shipped unnumbered, so there is nothing honest to backfill and
   nothing here pretends otherwise.

   Newest first. `GAME_VERSION` is derived from the top entry rather than
   written down twice, because two copies of a version number are one copy too
   many and they always drift.
   ========================================================================== */
const PATCH_NOTES = [
  { v: '1.09', date: '2026-08-24', title: 'Saves, past runs, and a seed for the day',
    notes: [
      'The game saves itself. Close the tab mid-primary and the title screen offers Continue, on the same seed, at the same point, with the same platform.',
      'A save is not a snapshot of the world — it is the seed and the decisions you took. Restoring one replays them. That makes saves small enough to paste into a message: Copy Run Code on the results screen, and Paste a Run on the title screen, and someone else gets your run rather than merely your country.',
      'Past Runs keeps every finished and abandoned run with its seed, so any of them can be argued with a second time. Copy Run Card writes the whole thing as a dozen lines you can paste anywhere.',
      'Today\'s Seed gives every player on Earth the same country on the same day. Play it as often as you like; only the first one is not marked practice.',
      'None of this exists in a browser that refuses to store anything — a private window, or a sandboxed frame. The game notices, hides the buttons that would not work, says why, and plays exactly as before.'
    ] },

  { v: '1.08', date: '2026-08-19', title: 'Patch notes, and a link that keeps its address',
    notes: [
      'Added this panel. It lists every release from 1.07 on.',
      'The published build now updates in place, so the link you have is the link — a new version arrives at the same address instead of a new one.'
    ] },

  { v: '1.07.1', date: '2026-08-17', title: 'Replay fixes',
    notes: [
      '"Run Again" works again. It used to reload the page, which a sandboxed frame refuses without saying so — the button was dead exactly where the game is most often opened.',
      'Fixed a bug that reload had been hiding: restarting in place drifted an already-drifted map, so the same seed quietly produced a different country on every replay. The map is now rebuilt from its baseline each run.',
      'Corrected the documentation on what a seed promises. The war roll draws from the same stream as every other decision, so a seed plus the same choices reproduces a run exactly — but no seed guarantees a war on its own.'
    ] },

  { v: '1.07', date: '2026-08-17', title: 'The war',
    notes: [
      'One presidency in ten is handed a war. The roll happens once, at the inauguration, and the cable arrives somewhere between the third quarter and the tenth.',
      'Five fronts across an invented theatre, each a different strategic problem. Frontage caps what a front can absorb, so twenty divisions in a mountain pass are a queue and mass on its own is not a strategy.',
      'Four postures per front — assault, hold, envelop, withdraw — none of them a blend of the others. Every one is priced by the engine that resolves the turn, against your intelligence estimate rather than the truth.',
      'Two clocks: how much longer they will keep fighting, and how much longer your own country will let you. You win by emptying the first before the second.',
      'Weeks in the war room are weeks the agenda does not get, and the war is scored in the final accounting alongside what it cost to fight.'
    ] }
];

const GAME_VERSION = PATCH_NOTES[0].v;
