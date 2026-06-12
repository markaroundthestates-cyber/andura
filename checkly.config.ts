// Track 7 §7.7 — Checkly synthetic prod config for live andura.app.
//
// DEPLOY-READY (2026-06-12, "ne apucam de tot"). Founder activation = 3 steps:
//   1. Create a Checkly account (Free/Hobby) → app.checklyhq.com
//   2. Create an API key + grab the Account ID (User Settings → API keys /
//      Account settings → General). Export them locally:
//        export CHECKLY_API_KEY=cu_xxx
//        export CHECKLY_ACCOUNT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
//   3. npx checkly test     (dry-run against Checkly infra — needs the creds)
//      npx checkly deploy    (creates the checks live on the account)
// Full runbook + free-tier math: salafull/_CHECKLY_ACTIVATION_2026-06-12.md
//
// Free-tier math (Hobby):
//   1 browser check × frequency 10min × 2 locations
//     = 6 runs/h × 24h × 30d × 2 loc = 8,640 check-runs/mo.
//   Hobby includes generous browser-check runs for a single check at this
//   cadence; 10min (vs 5min = 17,280/mo) halves consumption and is the
//   recommended starting cadence. Bump to 5min later only if needed.
//
// Alert channel: EmailAlertChannel → support@andura.app (below). Slack/webhook
// channels, if wanted, are added in the Checkly UI (sensitive — not in code).

import { defineConfig } from 'checkly';
import { EmailAlertChannel } from 'checkly/constructs';

// Email alerts on failure + recovery to the founder inbox. Checkly sends a
// verification mail to this address on first deploy; confirm it once.
const emailChannel = new EmailAlertChannel('andura-prod-email', {
  address: 'support@andura.app',
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: false,
});

export default defineConfig({
  projectName: 'andura',
  logicalId: 'andura',
  repoUrl: 'https://github.com/markaroundthestates-cyber/andura',
  checks: {
    // 10min cadence = free-tier-friendly (see math above). EU-only locations,
    // closest to the Romanian user base. Latest runtime (Playwright + browser
    // binaries) per Checkly docs.
    frequency: 10,
    locations: ['eu-west-1', 'eu-central-1'], // Ireland + Frankfurt (RO proximity)
    runtimeId: '2025.04',
    tags: ['andura', 'production-smoke', 'track-7'],
    alertChannels: [emailChannel],
    playwrightConfig: {
      use: {
        baseURL: 'https://andura.app',
        ignoreHTTPSErrors: false,
        actionTimeout: 15000,
      },
    },
    // Browser checks are discovered from __checks__/*.spec.ts.
    checkMatch: '**/__checks__/**/*.spec.ts',
    browserChecks: {
      frequency: 10,
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
