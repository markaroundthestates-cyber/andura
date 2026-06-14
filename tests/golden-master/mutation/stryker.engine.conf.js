// Stryker config for `npm run mutation:engine` (Track 7 nightly).
//
// Replaces the bare CLI invocation (which had no config → full-suite dry-run →
// timeout, 2026-06-12). Mutates ONLY src/engine; the dry-run runs the
// engine-only vitest config so it doesn't execute the whole React app.
//
// Run: npx stryker run --configFile tests/golden-master/mutation/stryker.engine.conf.js
export default {
  packageManager: 'npm',
  reporters: ['progress-append-only', 'clear-text', 'html', 'json'],
  testRunner: 'vitest',

  // Engine scope only; .d.ts are declaration files (no runtime), excluded.
  mutate: [
    'src/engine/**/*.ts',
    'src/engine/**/*.js',
    '!src/engine/**/*.d.ts',
  ],

  // Dry-run executes ONLY the engine tests (see the config), not the 8200-test
  // app suite — this is what cures the initial-dry-run timeout.
  vitest: {
    configFile: 'vitest.engine.config.js',
  },

  // INFORMATIVE nightly (no gate): a low score must NOT fail the run; a CRASH
  // still does (honest-red — the continue-on-error swallow was removed earlier).
  thresholds: {
    high: 80,
    low: 60,
    break: 0,
  },

  // disableTypeChecks:false → Stryker's preprocessor does NOT rewrite files, so
  // it never tries to Babel-parse a `.d.ts` (the `export const X: number;`
  // declaration that emitted the "Missing initializer" WARN annotation). The JS
  // engine files don't need type-check stripping anyway.
  disableTypeChecks: false,

  // Headroom over the 5-min default so a slow CI runner can finish the dry-run
  // even as the engine test count grows. Job timeout is 330 min (track-7-nightly).
  dryRunTimeoutMinutes: 20,
  timeoutMS: 15000,

  // INCREMENTAL (2026-06-14): the engine grew +5.5k LOC in one night (gym-log arc
  // + focus-volume contracts + inferFrequency + weekLedger) → a full mutate pass
  // overran the 180-min job and got timeout-cancelled. Incremental re-uses prior
  // mutant results for files+covering-tests that didn't change, so steady-state
  // nights only re-test what moved. The CI workflow caches this file across runs
  // (actions/cache). A cold cache (first run / post-big-refactor) is still a full
  // pass — that's what the 330-min job headroom is for.
  incremental: true,
  incrementalFile: 'reports/stryker-incremental.json',

  // GitHub-hosted runner = 2 vCPU; keep the runners modest to avoid IPC thrash.
  concurrency: 2,
  maxConcurrentTestRunners: 2,

  mutator: {
    excludedMutations: ['StringLiteral'],
  },
};
