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
    // 10min cadence, single EU location. PLAN CONSTRAINT (deploy red
    // 2026-06-12): the current Checkly plan only allows eu-central-1,
    // eu-west-2, us-east-1, us-west-1, ap-southeast-1/2 — eu-west-1 (Ireland)
    // is NOT in the plan. Frankfurt = closest to RO users.
    frequency: 10,
    locations: ['eu-central-1'],
    runtimeId: '2025.04',
    tags: ['andura', 'production-smoke', 'track-7'],
  },
  cli: {
    runLocation: 'eu-central-1',
    privateRunLocation: undefined,
    retries: 2,
    verbose: false,
  },
});
