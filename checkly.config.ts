// Track 7 §7.7 — Checkly synthetic prod config for live andura.app.
//
// ACTIVE (2026-06-12). Secrets CHECKLY_API_KEY + CHECKLY_ACCOUNT_ID live as
// GitHub repo secrets (uploaded by Daniel 2026-05-19); deploy.yml's
// checkly-deploy job runs `npx checkly deploy --force` on every push to main.
//
// IMPORTANT (checkly 7.x): this file must contain ONLY defineConfig — Check
// constructs are forbidden in the config file and live in the checkMatch'd
// check files instead (see __checks__/andura-api.check.ts).

import { defineConfig } from 'checkly';

export default defineConfig({
  projectName: 'andura',
  logicalId: 'andura',
  repoUrl: 'https://github.com/markaroundthestates-cyber/andura',
  checks: {
    checkMatch: '__checks__/**/*.check.ts',
    // 10min cadence, EU-only locations (RO proximity).
    frequency: 10,
    locations: ['eu-west-1', 'eu-central-1'], // Ireland + Frankfurt
    runtimeId: '2025.04',
    tags: ['andura', 'production-smoke', 'track-7'],
  },
  cli: {
    runLocation: 'eu-west-1',
    privateRunLocation: undefined,
    retries: 2,
    verbose: false,
  },
});
