import { defineConfig } from '@playwright/test';

// §2-C1 + §2-H1 audit fix — local dev server gate + retries + workers + fullyParallel.
// Local PR Playwright targets `npm run preview` on http://localhost:4173 by default;
// post-deploy live smoke (qa-report.yml) opts in via PLAYWRIGHT_BASE_URL env var
// pointing to https://andura.app. Single config preserved; baseURL env-gated.
const liveProdMode = !!process.env.PLAYWRIGHT_BASE_URL;
const resolvedBaseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  // §2-H1 audit fix — CI retries + workers limit, fully parallel default.
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  fullyParallel: true,
  use: {
    baseURL: resolvedBaseURL,
    headless: true,
    actionTimeout: 15000,
  },
  // §2-C1 audit fix — local preview server gate. Skip when targeting live prod
  // (PLAYWRIGHT_BASE_URL set). reuseExistingServer prevents respawn in dev.
  webServer: liveProdMode ? undefined : {
    command: 'npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
  reporter: 'list',
  projects: [
    // Track 7 §7.2 — auth setup project (generates storageState if Firebase
    // Admin SA env present; otherwise gracefully skip + main project runs
    // unauthenticated specs).
    {
      name: 'setup',
      testMatch: /tests[\\/]auth\.setup\.ts$/,
    },
    {
      name: 'all',
      testDir: './tests',
      // Exclude Vitest-only directories (tests/engine/ + tests/fixtures/) +
      // auth.setup.ts (owned by 'setup' project). Playwright + Vitest co-exist
      // under tests/ post Track 7 §7.1 — testIgnore preserves separation.
      testIgnore: [
        'tests/engine/**',
        'tests/fixtures/**',
        'tests/auth.setup.ts',
      ],
      // 'setup' must succeed (or skip) before main suite runs.
      dependencies: ['setup'],
      // Authenticated specs read this via test-level `use: { storageState }`
      // override — default 'all' project stays unauthenticated.
    },
  ],
});
