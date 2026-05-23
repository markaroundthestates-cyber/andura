// ══ ORCHESTRATOR ADAPTER SENTRY COVERAGE — Anti-drift gate (D063/D074) ════
//
// Co-CTO autonomous decision: extend D063 LOCK V1 anti-drift paradigm to
// orchestrator pipeline adapters (src/coach/orchestrator/adapters/*) — 0/8 →
// 8/8 instrumented per gsd-eval-auditor finding chat 5 BLOCKER 2 caveats +
// D074 scope clarification.
//
// Companion to React engineWrappers anti-drift gate (Wave 12 ad82ab65
// `assert_all_adapters_instrumented.test.ts` lives on main lineage). This
// test scopes the orchestrator pipeline 8-adapter topology per ADR 030 D1
// LOCK V1 + ADR 026 §42.10 pipeline sequence.
//
// Future drift scenarios this test catches:
//   - New adapter added to ORDERED_ADAPTERS without Sentry wrap → missing tag
//   - Existing adapter loses captureException invocation → count mismatch
//   - Adapter tag string drift (typo) → required-set assertion fails
//   - Source tag drift (orchestrator-adapter-fallback) → co-occurrence fail

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ADAPTERS_DIR = resolve(__dirname, '../adapters');

// Pipeline §42.10 sequential — 8 prescriptive engines per ADR 030 D1 LOCK V1.
// Adapter id strings derived from each engine's ENGINE_ID constant (verbatim
// from index.js per-engine module).
const REQUIRED_ORCHESTRATOR_ADAPTERS = Object.freeze([
  { file: 'periodizationAdapter.js', tag: 'periodization' },
  { file: 'goalAdaptationAdapter.js', tag: 'goalAdaptation' },
  { file: 'energyAdjustmentAdapter.js', tag: 'energyAdjustment' },
  { file: 'bayesianNutritionAdapter.js', tag: 'bayesianNutrition' },
  { file: 'tempoAdapter.js', tag: 'tempo' },
  { file: 'specializationAdapter.js', tag: 'specialization' },
  { file: 'warmupAdapter.js', tag: 'warmup' },
  { file: 'deloadAdapter.js', tag: 'deload' },
]);

const EXPECTED_ADAPTER_COUNT = 8;
const SOURCE_TAG = 'orchestrator-adapter-fallback';

describe('Orchestrator pipeline adapter Sentry coverage anti-drift gate (D063/D074)', () => {
  it('all 8 orchestrator pipeline adapters have adapter: <name> tag inside captureException', () => {
    const missing = [];
    for (const { file, tag } of REQUIRED_ORCHESTRATOR_ADAPTERS) {
      const source = readFileSync(join(ADAPTERS_DIR, file), 'utf-8');
      const tagPattern = new RegExp(`adapter:\\s*['"\`]${tag}['"\`]`);
      if (!tagPattern.test(source)) missing.push(`${file} (tag: ${tag})`);
    }
    expect(missing, `Adapters missing Sentry tag: ${missing.join(', ')}`).toEqual([]);
  });

  it('every adapter file has exactly one captureException invocation', () => {
    const mismatches = [];
    for (const { file } of REQUIRED_ORCHESTRATOR_ADAPTERS) {
      const source = readFileSync(join(ADAPTERS_DIR, file), 'utf-8');
      const matches = source.match(/captureException\s*\(/g) ?? [];
      if (matches.length !== 1) {
        mismatches.push(`${file}: ${matches.length} sites (expected 1)`);
      }
    }
    expect(mismatches, `Adapter site count drift: ${mismatches.join(', ')}`).toEqual([]);
  });

  it('every adapter imports captureException from util/sentry.js (consent gate D055)', () => {
    // D055 consent gate: captureException helper goes through util/sentry.js
    // wrapper (NU direct @sentry/browser import). Drift catch: bypass via
    // direct import → telemetryOptIn check skipped.
    const missing = [];
    for (const { file } of REQUIRED_ORCHESTRATOR_ADAPTERS) {
      const source = readFileSync(join(ADAPTERS_DIR, file), 'utf-8');
      const importPattern = /import\s*\{[^}]*captureException[^}]*\}\s*from\s*['"`][^'"`]*util\/sentry(?:\.js)?['"`]/;
      if (!importPattern.test(source)) missing.push(file);
    }
    expect(missing, `Adapters without sentry util import: ${missing.join(', ')}`).toEqual([]);
  });

  it('every adapter tag co-occurs with source: orchestrator-adapter-fallback', () => {
    // Invariant: every Sentry capture from orchestrator adapter MUST carry
    // source tag for ops dashboard filter. Drift catch: new adapter added
    // cu Sentry wrap dar lipseste source tag → ops query misses signal.
    const missing = [];
    for (const { file } of REQUIRED_ORCHESTRATOR_ADAPTERS) {
      const source = readFileSync(join(ADAPTERS_DIR, file), 'utf-8');
      const sourcePattern = new RegExp(`source:\\s*['"\`]${SOURCE_TAG}['"\`]`);
      if (!sourcePattern.test(source)) missing.push(file);
    }
    expect(missing, `Adapters without source tag: ${missing.join(', ')}`).toEqual([]);
  });

  it('adapters directory contains exactly 8 adapter files (pipeline topology lock)', () => {
    // Topology guard per ADR 030 D1 + ADR 026 §42.10 — 8 prescriptive engines.
    // Adding adapter #9 = update REQUIRED_ORCHESTRATOR_ADAPTERS array + this
    // count. Test enforces explicit author intent vs accidental drop-in.
    const files = readdirSync(ADAPTERS_DIR).filter(
      (f) => f.endsWith('Adapter.js') && f !== 'index.js',
    );
    expect(files.length).toBe(EXPECTED_ADAPTER_COUNT);
    const fileSet = new Set(files);
    for (const { file } of REQUIRED_ORCHESTRATOR_ADAPTERS) {
      expect(fileSet.has(file), `Missing adapter file: ${file}`).toBe(true);
    }
  });
});
