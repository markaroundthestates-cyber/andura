#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════════════
// gdpr_k_anonymity_check.js — Standalone k-anonymity validation tool
//
// Validates anonymized arbitration_log dataset pentru re-identification risk.
// Per AUDIT_5000Q Q-0049 + Q-0570 + Q-1100 (combination age + decision pattern
// + timestamps could re-identify users) + chat strategic 2026-04-29 lock #9.
//
// SSOT: k-anonymity minim **k=5**. Combinations cu count < 5 = at-risk re-id.
//
// Usage:
//   node scripts/gdpr_k_anonymity_check.js \
//     --dataset path/to/arbitration_log.json \
//     --k 5 \
//     --output path/to/report.json
//
// Inputs:
//   --dataset  JSON array of anonymized arbitration_log entries
//   --k        Minimum group size (default 5 per SSOT)
//   --output   Where to write JSON report
//
// Quasi-identifiers extracted per entry (5 fields):
//   - age_bucket          (5-year buckets: 18-22, 23-27, ... 58-62)
//   - sex                 (M / F / X)
//   - experience_tier     (beginner / intermediate / advanced)
//   - decision_type       (DELOAD / AA_HIGH / REST_DAY / CUT_CONSERVATIVE / etc.)
//   - timestamp_week      (year-week ISO format YYYY-Www)
//
// Output JSON shape:
//   {
//     summary: { totalEntries, totalCombinations, passCombinations, failCombinations, kThreshold },
//     atRiskCombinations: [{ combination, count, percentageOfDataset, suggestedMitigation }],
//     recommendation: 'PROCEED' | 'BLOCK',
//     mitigationGuidance: { generalize_age, generalize_timestamp, drop_decision_type, etc. }
//   }
//
// Exit code: 0 if PROCEED (all combinations ≥ k), 1 if BLOCK.
// ════════════════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

function fail(msg) {
  console.error(`[gdpr_k_anonymity] ERROR: ${msg}`);
  process.exit(1);
}

const args = parseArgs(process.argv);
if (!args.dataset || !args.output) {
  fail('Required args: --dataset <path> --output <path>. Optional: --k N (default 5)');
}

const K = parseInt(args.k) || 5;

// ── Load dataset ────────────────────────────────────────────────────────────

let dataset;
try {
  dataset = JSON.parse(readFileSync(args.dataset, 'utf-8'));
  if (!Array.isArray(dataset)) fail('Dataset must be a JSON array of entries');
} catch (err) {
  fail(`Cannot read dataset JSON: ${err.message}`);
}

console.log(`[gdpr_k_anonymity] Loaded ${dataset.length} entries. k threshold = ${K}.`);

// ── Quasi-identifiers extraction ────────────────────────────────────────────

function ageBucket(age) {
  if (age == null || isNaN(age)) return 'unknown';
  // 5-year buckets starting from 18
  if (age < 18) return '<18';
  if (age >= 65) return '65+';
  const lo = Math.floor((age - 18) / 5) * 5 + 18;
  const hi = lo + 4;
  return `${lo}-${hi}`;
}

function timestampWeek(ts) {
  if (ts == null) return 'unknown';
  const d = new Date(typeof ts === 'number' ? ts : ts);
  if (isNaN(d.getTime())) return 'unknown';
  // ISO week
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function extractQuasiId(entry) {
  return {
    age_bucket: ageBucket(entry.age ?? entry.demographic?.age),
    sex: entry.sex ?? entry.demographic?.sex ?? 'unknown',
    experience_tier: entry.experience_tier ?? entry.demographic?.experience ?? 'unknown',
    decision_type: entry.decision_type ?? entry.proposed?.rationale?.winnerId ?? 'unknown',
    timestamp_week: timestampWeek(entry.ts ?? entry.timestamp),
  };
}

function combinationKey(qid) {
  return `${qid.age_bucket}|${qid.sex}|${qid.experience_tier}|${qid.decision_type}|${qid.timestamp_week}`;
}

// ── Group by combination ────────────────────────────────────────────────────

const groups = new Map();
for (const entry of dataset) {
  const qid = extractQuasiId(entry);
  const key = combinationKey(qid);
  if (!groups.has(key)) groups.set(key, { qid, count: 0, sampleIds: [] });
  const g = groups.get(key);
  g.count++;
  if (g.sampleIds.length < 3 && entry.id) g.sampleIds.push(entry.id);
}

console.log(`[gdpr_k_anonymity] ${groups.size} unique combinations from ${dataset.length} entries.`);

// ── Identify at-risk combinations (count < k) ───────────────────────────────

const atRisk = [];
const passing = [];
for (const [key, g] of groups.entries()) {
  if (g.count < K) atRisk.push({ key, ...g });
  else passing.push({ key, ...g });
}

// ── Mitigation guidance per at-risk combination ────────────────────────────

function suggestMitigation(qid) {
  const suggestions = [];
  if (qid.age_bucket === 'unknown') {
    suggestions.push('Drop entries with missing age OR fill with age_bucket=18-65 generic');
  } else if (qid.age_bucket.includes('-')) {
    suggestions.push('Generalize age_bucket: 5-year → 10-year ranges (18-27, 28-37, ...)');
  }
  if (qid.timestamp_week !== 'unknown') {
    suggestions.push('Drop timestamp_week granularity → timestamp_month OR timestamp_quarter');
  }
  if (qid.decision_type === 'unknown') {
    suggestions.push('Backfill decision_type from rationale or drop entries');
  } else {
    suggestions.push('Bucket decision_type into broader categories: SAFETY / OPTIMIZATION / PREFERENCE');
  }
  return suggestions;
}

const atRiskWithMitigation = atRisk.map(g => ({
  combination: g.qid,
  count: g.count,
  percentageOfDataset: +((g.count / dataset.length) * 100).toFixed(2),
  suggestedMitigation: suggestMitigation(g.qid),
  sampleIds: g.sampleIds,
}));

// ── Recommendation ──────────────────────────────────────────────────────────

const recommendation = atRisk.length === 0 ? 'PROCEED' : 'BLOCK';

// ── General mitigation guidance ────────────────────────────────────────────

const mitigationGuidance = {
  generalize_age: atRisk.length > 0
    ? 'Consider 10-year age buckets if 5-year produces small groups'
    : null,
  generalize_timestamp: atRisk.length > 0
    ? 'Drop week granularity → month/quarter buckets'
    : null,
  bucket_decision_type: atRisk.length > 0
    ? 'Bucket decision_type into 3-5 broad categories instead of fine-grained rule IDs'
    : null,
  drop_quasi_identifier: atRisk.length > dataset.length * 0.1
    ? 'Consider dropping one quasi-identifier entirely (likely timestamp_week or decision_type)'
    : null,
  reduce_dataset_publication: atRisk.length > dataset.length * 0.5
    ? 'Dataset has too many small groups — consider not publishing OR aggressive aggregation'
    : null,
};

// ── Build report ────────────────────────────────────────────────────────────

const report = {
  generatedAt: new Date().toISOString(),
  inputs: {
    dataset: args.dataset,
    kThreshold: K,
  },
  quasiIdentifiers: [
    'age_bucket (5-year)',
    'sex',
    'experience_tier',
    'decision_type',
    'timestamp_week (ISO YYYY-Www)',
  ],
  summary: {
    totalEntries: dataset.length,
    totalCombinations: groups.size,
    passCombinations: passing.length,
    failCombinations: atRisk.length,
    kThreshold: K,
    minGroupSize: groups.size > 0 ? Math.min(...[...groups.values()].map(g => g.count)) : 0,
    maxGroupSize: groups.size > 0 ? Math.max(...[...groups.values()].map(g => g.count)) : 0,
  },
  recommendation,
  recommendationRationale: recommendation === 'PROCEED'
    ? `All ${groups.size} unique combinations have ≥${K} members — k-anonymity satisfied.`
    : `${atRisk.length} combinations below k=${K} threshold — re-identification risk.`,
  atRiskCombinations: atRiskWithMitigation,
  mitigationGuidance,
};

// ── Write output ────────────────────────────────────────────────────────────

const outDir = dirname(args.output);
try {
  mkdirSync(outDir, { recursive: true });
} catch { /* exists */ }

writeFileSync(args.output, JSON.stringify(report, null, 2), 'utf-8');

// ── Console summary ─────────────────────────────────────────────────────────

console.log(`[gdpr_k_anonymity] DONE.`);
console.log(`  Total entries: ${dataset.length}`);
console.log(`  Unique combinations: ${groups.size}`);
console.log(`  PASS k=${K}: ${passing.length}`);
console.log(`  FAIL k=${K}: ${atRisk.length}`);
console.log(`  Recommendation: ${recommendation}`);
console.log(`  Report: ${args.output}`);

process.exit(recommendation === 'PROCEED' ? 0 : 1);
