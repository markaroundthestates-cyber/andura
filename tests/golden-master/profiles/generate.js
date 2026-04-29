#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════════════
// generate.js — Golden Master profile generator
//
// Produces N profile JSON files into profiles/generated/ cu distribution coverage
// per chat strategic 2026-04-29 lock decision #7 (hybrid 150 generated + 100 manual).
//
// Sprint 2 scaffold: 30 profiles default (10 T0+COLD_START, 10 T1+DEVELOPING,
// 10 T2+PERSONALIZED). Expand to 150 in Sprint 3 — re-run cu --count 150.
//
// Usage:
//   node tests/golden-master/profiles/generate.js [--count 30] [--seed 42] [--output profiles/generated]
//
// Output: deterministic per --seed (same seed → same profiles).
// ════════════════════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

const args = parseArgs(process.argv);
const COUNT = parseInt(args.count) || 30;
const SEED = parseInt(args.seed) || 42;
const OUTPUT_DIR = args.output || join(__dirname, 'generated');

// Mulberry32 deterministic PRNG (seedable, simple, sufficient for fixtures)
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

// ── Generators per tier ─────────────────────────────────────────────────────

function genBeginner(idx) {
  const sex = pick(['M', 'F']);
  const age = randInt(18, 65);
  const weight = sex === 'M' ? randInt(60, 95) : randInt(48, 75);
  const height = sex === 'M' ? randInt(165, 190) : randInt(155, 175);
  const bmi = +(weight / Math.pow(height / 100, 2)).toFixed(1);
  const bfEst = sex === 'M' ? randInt(15, 28) : randInt(22, 35);
  const lbm = +(weight * (1 - bfEst / 100)).toFixed(1);
  const sessionType = pick(['PUSH', 'PULL', 'LEGS']);
  return {
    profileId: `gen-${String(idx + 1).padStart(3, '0')}`,
    label: `Beginner ${sex} ${age}y T0`,
    tags: ['generated', 'T0', 'COLD_START', 'beginner', sessionType],
    demographic: { age, sex, experience: 'beginner' },
    biometrics: { weight_kg: weight, height_cm: height, bmi, bf_pct_estimated: bfEst, lbm_kg: lbm },
    history: {
      sessions_count: randInt(0, 4),
      engine_tier: 'T0',
      calibration_confidence: 'COLD_START',
      days_since_first_session: randInt(0, 6),
      last_session_type: null,
      weak_groups: [],
      stagnation_weeks: 0,
      in_cut: false,
    },
    context: {
      readiness_score: randInt(60, 90),
      fatigue_index: +(rand() * 0.3).toFixed(2),
      is_high_risk_today: false,
      patterns: [],
      patternsSuppressed: false,
    },
    expected_arbitrator_output: {
      session_type: sessionType,
      volume_multiplier: 1.0,
      rest_day: false,
      rationale_codes: ['COLD_START_INITIAL'],
      calibration_banner_shown: true,
    },
    _metadata: {
      generated_by: 'tests/golden-master/profiles/generate.js',
      generated_at: '2026-04-30',
      intentional_edge_case: false,
      intentional_edge_case_doc: null,
    },
  };
}

function genIntermediate(idx) {
  const sex = pick(['M', 'F']);
  const age = randInt(20, 55);
  const weight = sex === 'M' ? randInt(65, 100) : randInt(50, 80);
  const height = sex === 'M' ? randInt(168, 192) : randInt(158, 178);
  const bmi = +(weight / Math.pow(height / 100, 2)).toFixed(1);
  const bfEst = sex === 'M' ? randInt(12, 22) : randInt(20, 30);
  const lbm = +(weight * (1 - bfEst / 100)).toFixed(1);
  const sessionType = pick(['PUSH', 'PULL', 'LEGS']);
  const sessions = randInt(15, 30);
  const inCut = rand() > 0.5;
  return {
    profileId: `gen-${String(idx + 1).padStart(3, '0')}`,
    label: `Intermediate ${sex} ${age}y T1 DEVELOPING`,
    tags: ['generated', 'T1', 'DEVELOPING', 'intermediate', sessionType, inCut ? 'in_cut' : 'maintenance'],
    demographic: { age, sex, experience: 'intermediate' },
    biometrics: { weight_kg: weight, height_cm: height, bmi, bf_pct_estimated: bfEst, lbm_kg: lbm },
    history: {
      sessions_count: sessions,
      engine_tier: 'T1',
      calibration_confidence: 'DEVELOPING',
      days_since_first_session: randInt(20, 75),
      last_session_type: pick(['PUSH', 'PULL', 'LEGS']),
      weak_groups: rand() > 0.6 ? [pick(['shoulders', 'hamstrings', 'lats'])] : [],
      stagnation_weeks: randInt(0, 1),
      in_cut: inCut,
    },
    context: {
      readiness_score: randInt(50, 90),
      fatigue_index: +(rand() * 0.5).toFixed(2),
      is_high_risk_today: false,
      patterns: [],
      patternsSuppressed: false,
    },
    expected_arbitrator_output: {
      session_type: sessionType,
      volume_multiplier: inCut ? 0.9 : 1.0,
      rest_day: false,
      rationale_codes: inCut ? ['CUT_CONSERVATIVE'] : [],
      calibration_banner_shown: true,
    },
    _metadata: {
      generated_by: 'tests/golden-master/profiles/generate.js',
      generated_at: '2026-04-30',
      intentional_edge_case: false,
      intentional_edge_case_doc: null,
    },
  };
}

function genAdvanced(idx) {
  const sex = pick(['M', 'F']);
  const age = randInt(22, 50);
  const weight = sex === 'M' ? randInt(72, 110) : randInt(55, 85);
  const height = sex === 'M' ? randInt(170, 195) : randInt(160, 180);
  const bmi = +(weight / Math.pow(height / 100, 2)).toFixed(1);
  const bfEst = sex === 'M' ? randInt(8, 18) : randInt(16, 26);
  const lbm = +(weight * (1 - bfEst / 100)).toFixed(1);
  const sessionType = pick(['PUSH', 'PULL', 'LEGS']);
  const sessions = randInt(80, 200);
  const inCut = rand() > 0.6;
  const stagnation = rand() > 0.7 ? randInt(2, 4) : 0;
  return {
    profileId: `gen-${String(idx + 1).padStart(3, '0')}`,
    label: `Advanced ${sex} ${age}y T2 PERSONALIZED`,
    tags: ['generated', 'T2', 'PERSONALIZED', 'advanced', sessionType, inCut ? 'in_cut' : 'maintenance', stagnation ? 'stagnant' : 'progressing'],
    demographic: { age, sex, experience: 'advanced' },
    biometrics: { weight_kg: weight, height_cm: height, bmi, bf_pct_estimated: bfEst, lbm_kg: lbm },
    history: {
      sessions_count: sessions,
      engine_tier: 'T2',
      calibration_confidence: 'PERSONALIZED',
      days_since_first_session: randInt(120, 600),
      last_session_type: pick(['PUSH', 'PULL', 'LEGS']),
      weak_groups: rand() > 0.5 ? [pick(['shoulders', 'hamstrings', 'lats', 'calves'])] : [],
      stagnation_weeks: stagnation,
      in_cut: inCut,
    },
    context: {
      readiness_score: randInt(45, 90),
      fatigue_index: +(rand() * 0.6).toFixed(2),
      is_high_risk_today: rand() > 0.85,
      patterns: stagnation > 2 ? [{ type: 'STAGNATION', exercises: ['Bench Press'] }] : [],
      patternsSuppressed: false,
    },
    expected_arbitrator_output: {
      session_type: sessionType,
      volume_multiplier: stagnation > 2 ? 0.7 : (inCut ? 0.9 : 1.0),
      rest_day: false,
      rationale_codes: stagnation > 2 ? ['STAGNATION_DELOAD'] : (inCut ? ['CUT_CONSERVATIVE'] : []),
      calibration_banner_shown: false,
    },
    _metadata: {
      generated_by: 'tests/golden-master/profiles/generate.js',
      generated_at: '2026-04-30',
      intentional_edge_case: false,
      intentional_edge_case_doc: null,
    },
  };
}

// ── Distribution: 1/3 each tier (configurable later for 150 expansion) ──────

function generateDistribution(count) {
  const profiles = [];
  const perTier = Math.floor(count / 3);
  const remainder = count - perTier * 3;
  for (let i = 0; i < perTier; i++) profiles.push(genBeginner(profiles.length));
  for (let i = 0; i < perTier; i++) profiles.push(genIntermediate(profiles.length));
  for (let i = 0; i < perTier + remainder; i++) profiles.push(genAdvanced(profiles.length));
  return profiles;
}

// ── Write profiles to disk ──────────────────────────────────────────────────

try {
  mkdirSync(OUTPUT_DIR, { recursive: true });
} catch { /* exists */ }

const profiles = generateDistribution(COUNT);
for (const p of profiles) {
  const path = join(OUTPUT_DIR, `${p.profileId}.json`);
  writeFileSync(path, JSON.stringify(p, null, 2), 'utf-8');
}

console.log(`[generate] DONE. ${profiles.length} profiles written to ${OUTPUT_DIR} (seed=${SEED}).`);
console.log(`  T0 COLD_START : ${profiles.filter(p => p.tags.includes('T0')).length}`);
console.log(`  T1 DEVELOPING : ${profiles.filter(p => p.tags.includes('T1')).length}`);
console.log(`  T2 PERSONALIZED: ${profiles.filter(p => p.tags.includes('T2')).length}`);
