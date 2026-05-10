#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════════════
// runner.js — Golden Master Suite test runner (minimal Sprint 2 scaffold)
//
// Loads all profiles din profiles/generated/ + profiles/manual/ si aserteaza
// expected_arbitrator_output match cu engine output actual.
//
// Sprint 2 = scaffold only. Asserts limited to schema validation + tag sanity.
// Sprint 3 = wire engine real (coachDirector.buildSession + arbitrator) cu
// profile state injection prin DB mock.
//
// Usage:
//   node tests/golden-master/runner.js                       — run all profiles
//   node tests/golden-master/runner.js --profile <path>     — single profile
//   node tests/golden-master/runner.js --tag T0             — filter by tag
//   node tests/golden-master/runner.js --dry-run            — schema check only
//
// Exit code: 0 PASS / 1 FAIL.
// ════════════════════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync } from 'node:fs';
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
const DRY_RUN = !!args['dry-run'];

const REQUIRED_FIELDS = [
  'profileId',
  'demographic',
  'biometrics',
  'history',
  'context',
  'expected_arbitrator_output',
];

const REQUIRED_HISTORY_FIELDS = [
  'sessions_count',
  'engine_tier',
  'calibration_confidence',
];

const ENGINE_TIER_VALUES = ['T0', 'T1', 'T2'];
const CALIBRATION_CONFIDENCE_VALUES = [
  'COLD_START', 'INITIAL', 'DEVELOPING', 'PERSONALIZING', 'PERSONALIZED', 'OPTIMIZED',
];
const SESSION_TYPE_VALUES = ['PUSH', 'PULL', 'LEGS', 'REST'];

// ── Profile validation ─────────────────────────────────────────────────────

function validateProfile(profile, sourcePath) {
  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    if (!(field in profile)) errors.push(`Missing required field: ${field}`);
  }
  for (const field of REQUIRED_HISTORY_FIELDS) {
    if (profile.history && !(field in profile.history)) {
      errors.push(`Missing history.${field}`);
    }
  }
  if (profile.history) {
    if (!ENGINE_TIER_VALUES.includes(profile.history.engine_tier)) {
      errors.push(`Invalid engine_tier: ${profile.history.engine_tier}`);
    }
    if (!CALIBRATION_CONFIDENCE_VALUES.includes(profile.history.calibration_confidence)) {
      errors.push(`Invalid calibration_confidence: ${profile.history.calibration_confidence}`);
    }
  }
  if (profile.expected_arbitrator_output) {
    if (!SESSION_TYPE_VALUES.includes(profile.expected_arbitrator_output.session_type)) {
      errors.push(`Invalid session_type: ${profile.expected_arbitrator_output.session_type}`);
    }
  }
  return errors;
}

// ── Discover profiles ──────────────────────────────────────────────────────

function discoverProfiles() {
  const profiles = [];
  const dirs = [
    join(__dirname, 'profiles', 'generated'),
    join(__dirname, 'profiles', 'manual'),
  ];
  for (const dir of dirs) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (!name.endsWith('.json')) continue;
      const fullPath = join(dir, name);
      try {
        if (!statSync(fullPath).isFile()) continue;
        const profile = JSON.parse(readFileSync(fullPath, 'utf-8'));
        profiles.push({ path: fullPath, profile });
      } catch (err) {
        profiles.push({ path: fullPath, profile: null, parseError: err.message });
      }
    }
  }
  return profiles;
}

// ── Filter ─────────────────────────────────────────────────────────────────

function filterProfiles(profiles, args) {
  if (args.profile) {
    return profiles.filter(p => p.path.endsWith(args.profile) || p.path === args.profile);
  }
  if (args.tag) {
    return profiles.filter(p => p.profile?.tags?.includes(args.tag));
  }
  return profiles;
}

// ── Engine assertion (Sprint 2 stub) ───────────────────────────────────────

function runEngineAssertion(profile) {
  // Sprint 3 task: instantiate coachDirector + arbitrator, inject profile state,
  // compare actual output cu profile.expected_arbitrator_output.
  // Sprint 2 = TODO marker. Schema validation only.
  return { skipped: true, reason: 'engine assertion = Sprint 3 implementation' };
}

// ── Main ───────────────────────────────────────────────────────────────────

const all = discoverProfiles();
const targets = filterProfiles(all, args);

console.log(`[runner] ${all.length} profiles discovered, ${targets.length} matching filter.`);

let passCount = 0;
let failCount = 0;
const failures = [];

for (const { path, profile, parseError } of targets) {
  if (parseError) {
    failCount++;
    failures.push({ path, error: `JSON parse error: ${parseError}` });
    continue;
  }
  const validationErrors = validateProfile(profile, path);
  if (validationErrors.length > 0) {
    failCount++;
    failures.push({ path, error: `Schema errors: ${validationErrors.join('; ')}` });
    continue;
  }
  if (!DRY_RUN) {
    const engineResult = runEngineAssertion(profile);
    if (engineResult.skipped) {
      // Sprint 2 stub — skip is OK
    } else if (!engineResult.passed) {
      failCount++;
      failures.push({ path, error: `Engine assertion failed: ${engineResult.reason}` });
      continue;
    }
  }
  passCount++;
}

console.log(`[runner] PASS: ${passCount} / ${targets.length}`);
if (failCount > 0) {
  console.log(`[runner] FAIL: ${failCount}`);
  for (const f of failures) {
    console.log(`  ${f.path}: ${f.error}`);
  }
}

if (DRY_RUN) {
  console.log(`[runner] DRY_RUN — schema validation only. Engine assertions = Sprint 3.`);
}

process.exit(failCount > 0 ? 1 : 0);
