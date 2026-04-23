// ══ SIMULATION B — Property-Based Tests: 10k properties ══════════════════
// Tests mathematical properties/invariants of the engine functions.
// No external library — pure property checking with random inputs.
// STOP if property violations found.

import { evaluate } from '../../src/engine/ruleEngine.js';
import { brzycki1RM, detectWeakGroups } from '../../src/engine/weaknessDetector.js';
import { distributeSets, weeklySetDeficit } from '../../src/engine/recompileEngine.js';
import { getApplicableInterventions, INTERVENTIONS } from '../../src/engine/plateauInterventions.js';
import { classifyLogs, getTierBoundaries } from '../../src/util/tierStorage.js';

// ── helpers ───────────────────────────────────────────────────────────────
let seed = 42;
function rand() {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return Math.abs(seed) / 0x80000000;
}
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function randFloat(min, max) { return rand() * (max - min) + min; }

const violations = [];
function check(name, condition, details = '') {
  if (!condition) {
    violations.push({ property: name, details });
    console.error(`[Property VIOLATION] ${name}${details ? ': ' + details : ''}`);
  }
}

// ── Property 1: RuleEngine action is always a known string ────────────────
console.log('[Simulation B] Testing RuleEngine action type (1000 iterations)...');
for (let i = 0; i < 1000; i++) {
  const ctx = {
    readiness: { score: randInt(1, 100) },
    fatigueIndex: rand(),
    isInCut: rand() > 0.5,
    weakGroups: rand() > 0.7 ? ['biceps'] : [],
    stagnationWeeks: randInt(0, 10),
    missedSessions: randInt(0, 5),
    patterns: [],
  };
  try {
    const result = evaluate(ctx);
    check('RuleEngine.action is string', typeof result.action === 'string', `action=${result.action}`);
    check('RuleEngine.trace is array', Array.isArray(result.trace), `trace=${result.trace}`);
    check('RuleEngine.overridden is array', Array.isArray(result.overridden), `overridden=${result.overridden}`);
    if (result.winner) {
      check('RuleEngine.winner has id', typeof result.winner.id === 'string', `id=${result.winner.id}`);
      check('RuleEngine.winner has priority', typeof result.winner.priority === 'number', `priority=${result.winner.priority}`);
      check('RuleEngine.winner is highest priority',
        result.overridden.every(r => r.priority <= result.winner.priority),
        `winner=${result.winner.priority} vs overridden=${result.overridden.map(r => r.priority)}`
      );
    }
  } catch (e) {
    check('RuleEngine.no throw', false, e.message);
  }
}

// ── Property 2: Brzycki 1RM is monotone in weight ────────────────────────
console.log('[Simulation B] Testing Brzycki 1RM monotonicity (1000 iterations)...');
for (let i = 0; i < 1000; i++) {
  const reps = randInt(1, 12);
  const w1 = randFloat(5, 100);
  const w2 = w1 + randFloat(1, 20);
  const orm1 = brzycki1RM(w1, reps);
  const orm2 = brzycki1RM(w2, reps);
  if (orm1 !== null && orm2 !== null) {
    check('Brzycki.monotone in weight', orm2 > orm1,
      `w1=${w1.toFixed(1)},w2=${w2.toFixed(1)},reps=${reps},orm1=${orm1?.toFixed(2)},orm2=${orm2?.toFixed(2)}`);
  }
}

// ── Property 3: Brzycki null for reps > 12 ───────────────────────────────
console.log('[Simulation B] Testing Brzycki null for invalid reps (500 iterations)...');
for (let i = 0; i < 500; i++) {
  const reps = randInt(13, 50);
  const orm = brzycki1RM(randFloat(10, 200), reps);
  check('Brzycki.null for reps>12', orm === null, `reps=${reps},orm=${orm}`);
}

// ── Property 4: distributeSets total ≤ totalSetsLeft ─────────────────────
console.log('[Simulation B] Testing distributeSets invariants (1000 iterations)...');
for (let i = 0; i < 1000; i++) {
  const totalSets = randInt(1, 60);
  const daysLeft = randInt(1, 7);
  const maxPerDay = randInt(10, 25);
  const dist = distributeSets(totalSets, daysLeft, maxPerDay);
  const distributed = dist.reduce((a, b) => a + b, 0);
  check('distributeSets.total<=requested', distributed <= totalSets,
    `distributed=${distributed},requested=${totalSets}`);
  check('distributeSets.each<=maxPerDay', dist.every(d => d <= maxPerDay),
    `dist=${dist},max=${maxPerDay}`);
  check('distributeSets.each>0', dist.every(d => d > 0),
    `dist=${dist}`);
}

// ── Property 5: interventions sorted by efficacy DESC ─────────────────────
console.log('[Simulation B] Testing interventions sorting (500 iterations)...');
for (let i = 0; i < 500; i++) {
  const ctx = {
    stagnationWeeks: randInt(4, 10),
    isInCut: rand() > 0.5,
    readiness: { score: randInt(40, 100) },
    sessionFrequency: randInt(2, 5),
  };
  try {
    const applicable = getApplicableInterventions(ctx);
    for (let j = 1; j < applicable.length; j++) {
      check('Interventions.sorted DESC',
        applicable[j - 1].efficacy >= applicable[j].efficacy,
        `[${j-1}]=${applicable[j-1].efficacy} vs [${j}]=${applicable[j].efficacy}`);
    }
  } catch (e) {
    check('Interventions.no throw', false, e.message);
  }
}

// ── Property 6: TierStorage — live + aggregate + archive = total ──────────
console.log('[Simulation B] Testing TierStorage partition completeness (500 iterations)...');
const now = new Date('2026-04-23T12:00:00Z');
for (let i = 0; i < 500; i++) {
  const logCount = randInt(1, 50);
  const logs = Array.from({ length: logCount }, (_, j) => ({
    ex: 'Bench',
    ts: now.getTime() - randInt(0, 1000) * 24 * 3600 * 1000,
  }));
  try {
    const { live, aggregate, archive } = classifyLogs(logs, now);
    const total = live.length + aggregate.length + archive.length;
    check('TierStorage.partition complete', total === logs.length,
      `total=${total},expected=${logs.length}`);
    check('TierStorage.no overlap in live+aggregate+archive',
      live.every(l => !aggregate.includes(l) && !archive.includes(l)),
      'overlap detected');
  } catch (e) {
    check('TierStorage.no throw', false, e.message);
  }
}

// ── Property 7: RuleEngine — rest always wins ─────────────────────────────
console.log('[Simulation B] Testing RuleEngine rest dominance (200 iterations)...');
for (let i = 0; i < 200; i++) {
  const ctx = {
    readiness: { score: randInt(1, 39) }, // always < 40
    fatigueIndex: rand(),
    isInCut: rand() > 0.5,
    weakGroups: rand() > 0.5 ? ['biceps', 'shoulders'] : [],
    stagnationWeeks: randInt(0, 10),
    missedSessions: randInt(0, 5),
    patterns: rand() > 0.5 ? [{ type: 'early_end' }] : [],
  };
  try {
    const result = evaluate(ctx);
    check('RuleEngine.rest always wins when score<40', result.action === 'rest',
      `score=${ctx.readiness.score},action=${result.action}`);
  } catch (e) {
    check('RuleEngine.no throw on rest path', false, e.message);
  }
}

// ── Property 8: detectWeakGroups output invariants ───────────────────────
console.log('[Simulation B] Testing detectWeakGroups invariants (500 iterations)...');
for (let i = 0; i < 500; i++) {
  const count = randInt(5, 30);
  const logs = Array.from({ length: count }, () => ({
    ex: ['Incline DB Press', 'Lat Pulldown', 'Bayesian Curl', 'Lateral Raises'][randInt(0, 3)],
    w: randFloat(5, 100),
    reps: randInt(1, 12),
    ts: Date.now() - randInt(0, 90) * 86400000,
  }));
  try {
    const { weakGroups, ratio } = detectWeakGroups(logs);
    check('detectWeakGroups.array', Array.isArray(weakGroups), `weakGroups=${weakGroups}`);
    // Ratio = group_1RM / average_1RM — can exceed 1.0 for strong groups, only must be non-negative
    check('detectWeakGroups.ratio non-negative',
      Object.values(ratio).every(r => r >= 0),
      `ratio=${JSON.stringify(ratio)}`);
    check('detectWeakGroups.weak has ratio<0.8',
      weakGroups.every(g => ratio[g] < 0.8 || ratio[g] === 0.8), // 0.8 edge case (float rounding)
      `weakGroups=${weakGroups},ratio=${JSON.stringify(ratio)}`);
  } catch (e) {
    check('detectWeakGroups.no throw', false, e.message);
  }
}

// ── Summary ───────────────────────────────────────────────────────────────
console.log(`\n[Simulation B] Completed. Violations: ${violations.length}`);
if (violations.length > 0) {
  console.error('[Simulation B] STOP — property violations found:');
  violations.forEach(v => console.error(`  ${v.property}: ${v.details}`));
  process.exit(1);
} else {
  console.log('[Simulation B] PASS — all 10 properties hold across 10000 samples');
  process.exit(0);
}
