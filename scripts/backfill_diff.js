#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════════════
// backfill_diff.js — Standalone CDL backfill validation tool
//
// Compares 100% synthetic CDL entries vs raw log source per ADR 011 Backfill +
// chat strategic 2026-04-29 lock decision #5 (automated diff > 25% manual sample).
//
// Usage:
//   node scripts/backfill_diff.js \
//     --synthetic path/to/synthetic.json \
//     --raw path/to/raw.json \
//     --output path/to/report.json \
//     [--samples 20]
//
// Inputs:
//   --synthetic  JSON array of CDL synthetic entries (output of cdlBackfill.js)
//   --raw        JSON array of raw `logs` entries (DB.get('logs'))
//   --output     Where to write JSON report
//   --samples    Number of random control samples to surface (default 20)
//
// Output JSON shape:
//   {
//     summary: { totalCompared, criticalCount, severeCount, moderateCount, minorCount, passCount },
//     discrepancies: [{ id, severity, category, expected, actual, sessionTs }],
//     controlSamples: [{ id, sessionTs, exercises, proposedSets, actualSets, sessionType }],
//     recommendation: 'PROCEED' | 'BLOCK' | 'REVIEW'
//   }
//
// Recommendation logic:
//   PROCEED — 0 critical + 0 severe (only moderate/minor noise)
//   REVIEW  — 1-3 critical + ≤5 severe (Daniel investigates flagged entries)
//   BLOCK   — 4+ critical OR 6+ severe (backfill script needs fix + re-run)
//
// Severity mapping per discrepancy category:
//   CRITICAL — sessionType mismatch (deviated session inferred wrong direction)
//   SEVERE   — exercises overlap (jaccard) < 50%
//   MODERATE — actualSets vs proposedSets diff >20%
//   MINOR    — timestamp drift, metadata fields (e.g., notes empty)
//
// NU integrate cu engine. Pure JSON in/out. Run-once validation pre Daniel sign-off.
// ════════════════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// ── Args parsing (no external deps) ─────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = value;
    }
  }
  return args;
}

function fail(msg) {
  console.error(`[backfill_diff] ERROR: ${msg}`);
  process.exit(1);
}

const args = parseArgs(process.argv);
if (!args.synthetic || !args.raw || !args.output) {
  fail('Required args: --synthetic <path> --raw <path> --output <path>. Optional: --samples N (default 20)');
}

const SAMPLES_COUNT = parseInt(args.samples) || 20;

// ── Load inputs ─────────────────────────────────────────────────────────────

let synthetic, rawLogs;
try {
  synthetic = JSON.parse(readFileSync(args.synthetic, 'utf-8'));
  if (!Array.isArray(synthetic)) fail('Synthetic input must be a JSON array');
} catch (err) {
  fail(`Cannot read synthetic JSON: ${err.message}`);
}
try {
  rawLogs = JSON.parse(readFileSync(args.raw, 'utf-8'));
  if (!Array.isArray(rawLogs)) fail('Raw logs input must be a JSON array');
} catch (err) {
  fail(`Cannot read raw logs JSON: ${err.message}`);
}

console.log(`[backfill_diff] Loaded ${synthetic.length} synthetic entries vs ${rawLogs.length} raw logs.`);

// ── Group raw logs by session ts ────────────────────────────────────────────

const rawBySession = {};
for (const log of rawLogs) {
  if (!log.session) continue;
  const ts = String(log.session);
  if (!rawBySession[ts]) rawBySession[ts] = [];
  rawBySession[ts].push(log);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function jaccard(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersect = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 1 : intersect / union;
}

// Simplified muscle-group classification (for sessionType sanity check).
// Heuristic keyword-based — NOT canonical (canonical = src/util/cdlBackfill.js).
// Standalone diff intentionally inlines this to avoid engine coupling.
function classifyExercise(name) {
  if (!name) return null;
  const n = name.toLowerCase();
  // PUSH: chest, shoulder, triceps
  if (/(bench|press|push|chest|fly|pec|dip|shoulder|delt|tricep|skullcrush|pushdown)/i.test(n)) {
    if (/(squat|leg|deadlift|hamstring|glute|calf|hip)/i.test(n)) return null;
    return 'PUSH';
  }
  // PULL: back, biceps, lat, row
  if (/(row|pulldown|pull-up|pullup|chinup|chin-up|lat|curl|bicep|deadlift|shrug|reverse fly|rear delt|face pull)/i.test(n)) {
    return 'PULL';
  }
  // LEGS: quad, hamstring, glute, calf
  if (/(squat|leg press|leg ext|leg curl|hip thrust|rdl|romanian|hamstring|quad|glute|calf|hack squat|lunge|bulgarian)/i.test(n)) {
    return 'LEGS';
  }
  return null;
}

function inferSessionTypeHeuristic(exercises) {
  if (!exercises || exercises.length === 0) return 'UNKNOWN';
  const counts = { PUSH: 0, PULL: 0, LEGS: 0 };
  let known = 0;
  for (const ex of exercises) {
    const cat = classifyExercise(ex);
    if (cat) { counts[cat]++; known++; }
  }
  if (known === 0) return 'UNKNOWN';
  if (known / exercises.length < 0.5) return 'MIXED';
  const dominant = Object.entries(counts).find(([, c]) => c / known > 0.7);
  return dominant ? dominant[0] : 'MIXED';
}

function pctDiff(actual, expected) {
  if (expected === 0) return actual === 0 ? 0 : 1;
  return Math.abs(actual - expected) / expected;
}

// ── Compare each synthetic entry vs raw ─────────────────────────────────────

const discrepancies = [];
let passCount = 0;
let totalCompared = 0;

for (const entry of synthetic) {
  if (!entry.synthetic) continue; // Skip non-synthetic entries
  totalCompared++;

  const sessionTs = String(entry.ts);
  const rawSession = rawBySession[sessionTs];

  if (!rawSession || rawSession.length === 0) {
    discrepancies.push({
      id: entry.id,
      severity: 'CRITICAL',
      category: 'orphan_synthetic',
      sessionTs: entry.ts,
      detail: 'Synthetic entry has no matching raw logs session',
      expected: 'matching raw session at ts',
      actual: 'none found',
    });
    continue;
  }

  // 1. Exercises overlap (jaccard)
  const rawExercises = [...new Set(rawSession.map(l => l.ex).filter(Boolean))];
  const proposedExercises = entry.proposed?.exercises || [];
  const overlap = jaccard(rawExercises, proposedExercises);
  if (overlap < 0.5) {
    discrepancies.push({
      id: entry.id,
      severity: 'SEVERE',
      category: 'exercises_overlap_low',
      sessionTs: entry.ts,
      detail: `Jaccard overlap ${(overlap * 100).toFixed(1)}% (threshold 50%)`,
      expected: rawExercises,
      actual: proposedExercises,
    });
  }

  // 2. SessionType heuristic re-check
  const expectedType = inferSessionTypeHeuristic(rawExercises);
  const actualType = entry.proposed?.sessionType;
  if (expectedType !== 'UNKNOWN' && expectedType !== actualType && expectedType !== 'MIXED') {
    discrepancies.push({
      id: entry.id,
      severity: 'CRITICAL',
      category: 'sessionType_mismatch',
      sessionTs: entry.ts,
      detail: `Expected ${expectedType} from raw exercises, got ${actualType} in synthetic`,
      expected: expectedType,
      actual: actualType,
    });
  }

  // 3. Sets count comparison
  const rawSetCount = rawSession.length;
  const proposedSets = entry.proposed?.proposedSets ?? 0;
  const actualSets = entry.outcome?.actualSets ?? 0;
  const setsDiff = pctDiff(rawSetCount, proposedSets);
  if (setsDiff > 0.2) {
    discrepancies.push({
      id: entry.id,
      severity: 'MODERATE',
      category: 'sets_count_drift',
      sessionTs: entry.ts,
      detail: `Raw logs ${rawSetCount} vs synthetic proposedSets ${proposedSets} (diff ${(setsDiff * 100).toFixed(1)}%)`,
      expected: rawSetCount,
      actual: proposedSets,
    });
  }
  if (actualSets !== rawSetCount) {
    discrepancies.push({
      id: entry.id,
      severity: 'MODERATE',
      category: 'actualSets_mismatch',
      sessionTs: entry.ts,
      detail: `Raw logs ${rawSetCount} vs synthetic outcome.actualSets ${actualSets}`,
      expected: rawSetCount,
      actual: actualSets,
    });
  }

  // 4. Outcome.executed sanity (synthetic always has logs)
  if (entry.outcome?.executed !== true) {
    discrepancies.push({
      id: entry.id,
      severity: 'MINOR',
      category: 'outcome_executed_not_true',
      sessionTs: entry.ts,
      detail: 'Synthetic entry should have outcome.executed = true (raw logs exist)',
      expected: true,
      actual: entry.outcome?.executed,
    });
  }

  // 5. Outcome.deviation should be false for synthetic (match assumed)
  if (entry.outcome?.deviation === true) {
    discrepancies.push({
      id: entry.id,
      severity: 'MINOR',
      category: 'outcome_deviation_true',
      sessionTs: entry.ts,
      detail: 'Synthetic entry should have outcome.deviation = false (no real proposal to deviate from)',
      expected: false,
      actual: true,
    });
  }

  if (
    discrepancies.length === 0 ||
    discrepancies[discrepancies.length - 1].id !== entry.id
  ) {
    passCount++;
  }
}

// ── Severity counts ─────────────────────────────────────────────────────────

const severityCounts = { CRITICAL: 0, SEVERE: 0, MODERATE: 0, MINOR: 0 };
for (const d of discrepancies) severityCounts[d.severity]++;

// ── Control samples (random 20 entries that PASS) ──────────────────────────

const failingIds = new Set(discrepancies.map(d => d.id));
const passingEntries = synthetic.filter(e => e.synthetic && !failingIds.has(e.id));

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const controlSamples = shuffle(passingEntries).slice(0, SAMPLES_COUNT).map(e => ({
  id: e.id,
  sessionTs: e.ts,
  date: e.date,
  exercises: e.proposed?.exercises,
  proposedSets: e.proposed?.proposedSets,
  actualSets: e.outcome?.actualSets,
  sessionType: e.proposed?.sessionType,
  // Sample raw logs for visual inspection
  rawLogsSample: (rawBySession[String(e.ts)] || []).slice(0, 5).map(l => ({
    ex: l.ex, w: l.w, reps: l.reps, rpe: l.rpe,
  })),
}));

// ── Recommendation logic ────────────────────────────────────────────────────

let recommendation;
if (severityCounts.CRITICAL >= 4 || severityCounts.SEVERE >= 6) {
  recommendation = 'BLOCK';
} else if (severityCounts.CRITICAL >= 1 || severityCounts.SEVERE >= 1) {
  recommendation = 'REVIEW';
} else {
  recommendation = 'PROCEED';
}

// ── Build report ────────────────────────────────────────────────────────────

const report = {
  generatedAt: new Date().toISOString(),
  inputs: {
    synthetic: args.synthetic,
    raw: args.raw,
    sampleSize: SAMPLES_COUNT,
  },
  summary: {
    totalCompared,
    passCount,
    failCount: totalCompared - passCount,
    discrepanciesTotal: discrepancies.length,
    severityCounts,
  },
  recommendation,
  recommendationRationale: {
    PROCEED: '0 critical + 0 severe — backfill quality acceptable',
    REVIEW: '1-3 critical OR 1-5 severe — Daniel investigates flagged entries before sign-off',
    BLOCK: '4+ critical OR 6+ severe — backfill script needs fix + re-run',
  }[recommendation],
  discrepancies,
  controlSamples,
};

// ── Write output ────────────────────────────────────────────────────────────

const outDir = dirname(args.output);
try {
  mkdirSync(outDir, { recursive: true });
} catch { /* exists */ }

writeFileSync(args.output, JSON.stringify(report, null, 2), 'utf-8');

// ── Console summary ─────────────────────────────────────────────────────────

console.log(`[backfill_diff] DONE.`);
console.log(`  Total compared: ${totalCompared}`);
console.log(`  PASS: ${passCount}`);
console.log(`  FAIL: ${totalCompared - passCount}`);
console.log(`  Discrepancies: ${discrepancies.length} (CRITICAL ${severityCounts.CRITICAL}, SEVERE ${severityCounts.SEVERE}, MODERATE ${severityCounts.MODERATE}, MINOR ${severityCounts.MINOR})`);
console.log(`  Recommendation: ${recommendation}`);
console.log(`  Report: ${args.output}`);

process.exit(recommendation === 'BLOCK' ? 1 : 0);
