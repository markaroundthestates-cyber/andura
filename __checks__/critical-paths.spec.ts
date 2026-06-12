// Track 7 §7.7 — Checkly synthetic prod critical paths against live andura.app.
//
// ACTIVE config (2026-06-12). Grounded against the REAL deployed app, NOT the
// pre-Beta skeleton assumptions. The app is auth-gated: the only surfaces a
// synthetic (unauthenticated) browser can reach are the public entry shell —
//   /        → Splash (auto-advances ~2.6s → /auth for anon, /app for authed)
//   /auth    → Magic Link login form (email entry + send + Google/skip)
//   /terms   /privacy → public legal pages
// Authenticated paths (Antrenor/Progres/Istoric/Cont + workout flow) sit behind
// ProtectedRoute (anon → redirect /auth) so they are intentionally NOT probed
// here — that needs a Firebase storageState (future activation, see tail).
//
// Routes verified from src/react/routes/router.tsx (createBrowserRouter):
//   '/' Splash · '/auth' Auth · '/app/{antrenor,progres,istoric,cont}' protected.
// Selectors verified from the screen source (data-testid attributes):
//   Splash.tsx  → [data-testid="splash"]
//   Auth.tsx    → [data-testid="auth"], #auth-email / [data-testid="auth-email-input"]
//                 (type=email), [data-testid="auth-send"]
//
// What this monitors every run:
//   1. App shell boots on /  (Splash paints, bundles load, no fatal JS error)
//   2. Login screen reachable + email form interactive on /auth
//   3. No console errors / failed bundle (chunk 404) across the entry flow
//   4. PWA service worker registers + manifest link present
//
// Alert routing: configured in checkly.config.ts (EmailAlertChannel →
// support@andura.app). Webhook/Slack channels stay in the Checkly UI (sensitive).

import { test, expect } from '@playwright/test';

// Treat sourcemap / favicon / third-party noise as non-fatal. Everything else
// (chunk load failures, uncaught app exceptions) should fail the check.
const NON_FATAL = /favicon|sourcemap\.map|\.map\b|ERR_ABORTED/i;

// NOTE 2026-06-12: NO test.describe wrapper — the Checkly CLI bundles its own
// @playwright/test runtime; a describe() registered against the project-local
// 1.59 instance threw "did not expect test.describe() to be called here" at
// deploy bundling (dual-instance hazard). Top-level test() calls bundle clean.
  test('1. App shell boots on / (Splash paints, no fatal error)', async ({ page }) => {
    const errors: string[] = [];
    const failedRequests: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('requestfailed', (req) => {
      const url = req.url();
      if (!NON_FATAL.test(url)) {
        failedRequests.push(`${url} — ${req.failure()?.errorText ?? 'failed'}`);
      }
    });

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 20000 });

    // The Pulse Splash auto-advances after ~2.6s. Either we catch the Splash
    // node, or it has already routed to /auth (anon) — both prove the shell
    // booted. Assert on the #root mount having real content either way.
    const splash = page.locator('[data-testid="splash"]');
    const auth = page.locator('[data-testid="auth"]');
    await expect(splash.or(auth).first()).toBeVisible({ timeout: 10000 });

    const fatal = errors.filter((e) => !NON_FATAL.test(e));
    expect(fatal, `console errors on /:\n${fatal.join('\n')}`).toEqual([]);
    expect(
      failedRequests,
      `failed bundle/network requests on /:\n${failedRequests.join('\n')}`,
    ).toEqual([]);
  });

  test('2. Login screen reachable + email form interactive (/auth)', async ({ page }) => {
    await page.goto('/auth', { waitUntil: 'domcontentloaded', timeout: 20000 });

    // The Auth screen section.
    await expect(page.locator('[data-testid="auth"]')).toBeVisible({
      timeout: 10000,
    });

    // Magic-link email input present + interactive (NO dispatch — that's the
    // manual smoke gate; we only prove the form accepts input on live).
    const emailInput = page.locator('#auth-email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    await emailInput.fill('checkly-synthetic@andura.app');
    await expect(emailInput).toHaveValue('checkly-synthetic@andura.app');

    // Send CTA present (enabled once a valid email is typed, as above).
    const sendBtn = page.locator('[data-testid="auth-send"]');
    await expect(sendBtn).toBeVisible();
    await expect(sendBtn).toBeEnabled();
  });

  test('3. No console errors / failed bundles across entry flow', async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !NON_FATAL.test(msg.text())) {
        consoleErrors.push(msg.text());
      }
    });
    page.on('requestfailed', (req) => {
      const url = req.url();
      if (!NON_FATAL.test(url)) {
        failedRequests.push(`${url} — ${req.failure()?.errorText ?? 'failed'}`);
      }
    });

    // Walk the public entry surfaces a real anon user hits first.
    await page.goto('/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.goto('/auth', { waitUntil: 'networkidle', timeout: 20000 });

    expect(
      consoleErrors,
      `console.error across entry flow:\n${consoleErrors.join('\n')}`,
    ).toEqual([]);
    expect(
      failedRequests,
      `failed requests across entry flow:\n${failedRequests.join('\n')}`,
    ).toEqual([]);
  });

  test('4. PWA service worker registers + manifest present', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 20000 });

    // SW registration resolves asynchronously after load — wait for it rather
    // than reading getRegistration() once (avoids a cold-visit false negative).
    const swRegistered = await page
      .waitForFunction(
        async () => {
          if (!('serviceWorker' in navigator)) return false;
          const reg = await navigator.serviceWorker.getRegistration();
          return !!reg;
        },
        undefined,
        { timeout: 10000 },
      )
      .then(() => true)
      .catch(() => false);
    expect(swRegistered, 'service worker registered within 10s').toBe(true);

    // Manifest link is injected by vite-plugin-pwa at build (/manifest.webmanifest).
    const manifestLink = page.locator('link[rel="manifest"]');
    expect(
      await manifestLink.count(),
      'manifest link present in <head>',
    ).toBeGreaterThan(0);
  });

  // ── Future activation (requires Firebase Admin SA / storageState) ──────────
  // Authenticated paths can't be probed without a real session. When a synthetic
  // login fixture exists, add checks for: Antrenor hub render (/app/antrenor),
  // workout flow cold-start, Firestore write latency budget (Cluster B5 SLO).

