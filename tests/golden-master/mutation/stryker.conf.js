// Stryker mutation testing config — ARBITRATOR + voices + dimensions
// Per chat strategic 2026-04-29 lock decision #7 — target mutation score >75%.
//
// Sprint 2 status: config livrat, Stryker deps NOT installed (deferred Sprint 3
// dependency add — risk overnight autonomous run).
//
// Install pre-run:
//   npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
//
// Run:
//   npx stryker run --configFile tests/golden-master/mutation/stryker.conf.js

export default {
  packageManager: 'npm',
  reporters: ['progress', 'clear-text', 'html'],
  testRunner: 'vitest',

  // Mutation scope — ARBITRATOR core + voice engines + dimensions
  // (per ADR 018 §architecture overview Cognitive Layers)
  mutate: [
    'src/engine/coachDirector.js',
    'src/engine/arbitrator.js',          // (post-ADR 018 strangler implementation)
    'src/engine/voices/**/*.js',         // (post-ADR 018 strangler implementation)
    'src/engine/dimensions/**/*.js',
    'src/engine/ruleEngine.js',
    'src/engine/decisionCluster.js',     // (post-ADR 018 Faza 0)
  ],

  // Thresholds per chat strategic lock decision
  // break: under acest scor → exit code 1 (CI fail)
  // low/high: gradient pentru reporting (yellow/green)
  thresholds: {
    high: 80,
    low: 60,
    break: 75,
  },

  // Vitest specific config
  vitest: {
    configFile: 'vitest.config.js',
  },

  // Performance
  concurrency: 4,
  timeoutMS: 10000,
  maxConcurrentTestRunners: 4,

  // Disable mutators that produce known-noisy mutations
  disableTypeChecks: false,

  // Mutation log per ADR 018 documentation discipline
  mutator: {
    excludedMutations: [
      'StringLiteral',  // Avoid trivial string mutations on user-facing text
    ],
  },

  // Ignore patterns
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'tests/**',
    'cc-reports/**',
    'scripts/**',
  ],
};
