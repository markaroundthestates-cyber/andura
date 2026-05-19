// Track 7 §7.7 — Checkly synthetic prod config per master spec §2.
//
// READY-TO-ACTIVATE skeleton. Daniel manual activation steps per
// 📥_inbox/SETUP_DANIEL_TRACK_7.md §A.1:
//   1. Sign up Checkly Free Hobby (1,500 browser checks/lună sufficient solo dev)
//   2. Generate CHECKLY_API_KEY + CHECKLY_ACCOUNT_ID
//   3. npm i -D checkly @checkly/cli (installs framework)
//   4. Upload secrets la GitHub repo Settings → Actions secrets
//   5. Run `npx checkly deploy` locally pentru first-push synthetic monitors
//
// Once activated:
//   - Frequency 5min EU CDN regions = ~8,640 checks/lună (peste Free Hobby
//     1,500 limit → upgrade to $40/mo paid tier OR reduce frequency 30min
//     = ~1,440 checks/lună sub limit)
//   - Slack alert routing via webhook URL (Daniel adds în Checkly UI alert
//     channels, NU în code — sensitive config)
//   - Rocky AI auto-triage (early 2026 feature) per master spec §2

import { defineConfig } from 'checkly';

export default defineConfig({
  projectName: 'Andura PWA',
  logicalId: 'andura-pwa',
  repoUrl: 'https://github.com/markaroundthestates-cyber/andura',
  checks: {
    // Default frequency 5min — adjust to 30min if Free Hobby tier insufficient.
    // Override per-check via frequency: option în spec files.
    frequency: 5,
    locations: ['eu-west-1', 'eu-central-1'], // Romania CDN proximity
    runtimeId: '2024.02',
    tags: ['andura', 'track-7-§7.7', 'production-smoke'],
    playwrightConfig: {
      use: {
        baseURL: 'https://andura.app',
        // Inherit Track 7 §7.2 stability principles
        ignoreHTTPSErrors: false,
        actionTimeout: 15000,
      },
    },
    // Browser checks discover din __checks__/*.spec.ts
    checkMatch: '**/__checks__/**/*.spec.ts',
    browserChecks: {
      frequency: 5,
      testMatch: '**/__checks__/**/*.spec.ts',
    },
  },
  cli: {
    runLocation: 'eu-west-1',
    privateRunLocation: undefined,
    retries: 2,
    verbose: false,
  },
});
