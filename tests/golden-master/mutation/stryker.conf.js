// Stryker mutation testing config — Bugatti baseline audit
// Per Daniel directive 2026-05-05 evening late: full src/**/*.js scope.
// Hardware: i7-8700K 6c/12t @ 3.70GHz + 64 GB RAM @ 3600 MHz.
//
// Run:
//   npx stryker run --configFile tests/golden-master/mutation/stryker.conf.js
//
// Expected runtime: ~6-12h CPU-bound (mutants × full test suite re-run pe 19K LOC src/).

export default {
  packageManager: 'npm',
  reporters: ['progress', 'clear-text', 'html', 'json'],
  testRunner: 'vitest',

  // Bugatti baseline — FULL src/**/*.js scope per Daniel directive
  mutate: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/__tests__/**',
  ],

  // Thresholds first-run baseline = NO break (capture state, NU CI fail)
  thresholds: {
    high: 80,
    low: 60,
    break: 0,  // first-run baseline — NU break, audit only
  },

  vitest: {
    configFile: 'vitest.config.js',
  },

  // Concurrency calibrat pentru i7-8700K 6c/12t
  // Reserve 2 logical cores pentru OS + Daniel ne-blocked concurrent work
  concurrency: 6,
  timeoutMS: 10000,
  maxConcurrentTestRunners: 6,

  disableTypeChecks: false,

  mutator: {
    excludedMutations: [
      'StringLiteral',  // avoid trivial wording mutations noise
    ],
  },

  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'tests/**',
    'cc-reports/**',
    '📤_outbox/**',
    '📥_inbox/**',
    'scripts/**',
    'simulations/**',
    'reports/**',
  ],
};
