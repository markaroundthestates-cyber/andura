// Track 7 §7.7 — Checkly synthetic prod config for live andura.app.
//
// ACTIVE (2026-06-12). Secrets CHECKLY_API_KEY + CHECKLY_ACCOUNT_ID live as
// GitHub repo secrets (uploaded by Daniel 2026-05-19); deploy.yml's
// checkly-deploy job runs `npx checkly deploy --force` on every push to main.
//
// API CHECKS ONLY (2026-06-12 decision): the original browser-check spec hit
// the @playwright/test dual-instance hazard inside Checkly's jiti bundler
// ("Playwright Test did not expect test.describe() to be called here" — the
// repo ships BOTH `playwright` and `@playwright/test` for its own E2E, and the
// CLI's loader resolves a second runner instance; founder verdict: monitors
// must be green with zero asterisks). ApiChecks need no Playwright at all =
// the hazard class is gone. Coverage trade-off (honest): no JS execution —
// console errors / SW behavior are NOT probed; uptime, HTML shell, and asset
// integrity ARE. A browser check can return when the playwright versions are
// consolidated.
//
// Free-tier math (Hobby): 3 API checks × 10min × 1 location
//   = 6/h × 24h × 30d × 3 = 12,960 API-check runs/mo — well inside the free
//   10k browser + 50k API allowance class; API checks are the cheap kind.
//
// Alert channel: EmailAlertChannel → support@andura.app (verification mail on
// first deploy; confirm once). Slack/webhook channels via UI if wanted.

import { defineConfig } from 'checkly';
import { ApiCheck, AssertionBuilder, EmailAlertChannel } from 'checkly/constructs';

// Email alerts on failure + recovery to the founder inbox.
const emailChannel = new EmailAlertChannel('andura-prod-email', {
  address: 'support@andura.app',
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: false,
});

// ── 1. App shell — the SPA HTML serves and contains the Vite entry. ─────────
new ApiCheck('andura-shell', {
  name: 'andura.app — app shell serves (HTML + entry script)',
  request: {
    method: 'GET',
    url: 'https://andura.app/',
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      // The built index.html always carries the module entry + the app mount.
      AssertionBuilder.body().contains('<div id="root">'),
      AssertionBuilder.body().contains('type="module"'),
    ],
  },
  maxResponseTime: 10000,
  degradedResponseTime: 5000,
});

// ── 2. PWA manifest — installability surface stays intact. ──────────────────
new ApiCheck('andura-manifest', {
  name: 'andura.app — PWA manifest serves',
  request: {
    method: 'GET',
    url: 'https://andura.app/manifest.webmanifest',
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.body().contains('"name"'),
      AssertionBuilder.body().contains('standalone'),
    ],
  },
  maxResponseTime: 10000,
  degradedResponseTime: 5000,
});

// ── 3. Legal page — static scrollable /terms route serves (SPA fallback). ───
new ApiCheck('andura-terms', {
  name: 'andura.app — /terms route serves',
  request: {
    method: 'GET',
    url: 'https://andura.app/terms',
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.body().contains('<div id="root">'),
    ],
  },
  maxResponseTime: 10000,
  degradedResponseTime: 5000,
});

export default defineConfig({
  projectName: 'andura',
  logicalId: 'andura',
  repoUrl: 'https://github.com/markaroundthestates-cyber/andura',
  checks: {
    // 10min cadence, EU-only locations (RO proximity).
    frequency: 10,
    locations: ['eu-west-1', 'eu-central-1'], // Ireland + Frankfurt
    runtimeId: '2025.04',
    tags: ['andura', 'production-smoke', 'track-7'],
    alertChannels: [emailChannel],
  },
  cli: {
    runLocation: 'eu-west-1',
    privateRunLocation: undefined,
    retries: 2,
    verbose: false,
  },
});
