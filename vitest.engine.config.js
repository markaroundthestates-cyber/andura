import baseConfig from './vitest.config.js';

// Engine-only vitest config for Stryker `mutation:engine` (2026-06-12).
//
// WHY: Stryker mutates ONLY src/engine, but with the full vitest.config.js its
// initial dry-run executes the ENTIRE suite (8200+ tests incl. the whole React
// app). The suite grew past Stryker's 5-min default dryRunTimeoutMinutes →
// "Initial test run timed out!" → the nightly went red on a TIMEOUT, not a real
// regression. Narrowing the dry-run to the tests that actually cover src/engine
// (src/engine/__tests__ + tests/engine — ~123 files) makes the dry-run fast and
// the mutation score measure what it should: how well the ENGINE tests kill
// engine mutants. Same base (jsdom, setup, _DIAG excludes) — only `include` is
// narrowed and coverage is dropped (irrelevant + slows the run under Stryker).
export default {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: [
      'src/engine/**/*.test.{js,ts,tsx}',
      'tests/engine/**/*.test.{js,ts}',
    ],
    // Exclude the SLOW integration/regression sims (calibration-sim 68s,
    // full-path-sim, persona-matrix, wiring-coverage 29s, replay-real). They are
    // determinism/wiring GATES, not mutant-killers — they add little to the
    // mutation score while dominating the dry-run and tripping the per-test
    // timeout under Stryker's instrumented pool (the audit flagged them as
    // pass-in-isolation / slow-under-load). They keep running in the main CI
    // suite; here their absence keeps the engine dry-run fast + green.
    exclude: [
      ...baseConfig.test.exclude,
      'tests/engine/calibration-sim/**',
      'tests/engine/full-path-sim/**',
      'tests/engine/persona-matrix/**',
      'tests/engine/wiring-coverage.test.js',
      'tests/engine/replay-real/**',
    ],
    coverage: { enabled: false },
  },
};
