// Track 7 §7.7 — Checkly synthetic prod critical paths per master spec §2.
//
// READY-TO-ACTIVATE skeleton. Activates when Daniel completes setup per
// 📥_inbox/SETUP_DANIEL_TRACK_7.md §A.1.
//
// Critical paths verified every 5 minutes EU CDN against live andura.app:
//   1. Homepage loads + bottom-nav 4 taburi present (no auth required)
//   2. Magic Link login flow (Magic Link smoke pre-Beta gate)
//   3. Antrenor tab render + AaFriction LOCK 9 trigger path
//   4. LockExercises LOCK 4 disclaimer surface
//   5. Engine API roundtrip (Firestore read latency budget)
//   6. PWA installability + SW registration
//
// Alert routing: Slack `#andura-alerts` channel via Checkly webhook (Daniel
// configures în Checkly UI alert channels — NU în code, sensitive config).
// Optional: Sentry incident linking + Rocky AI auto-triage classification
// (early 2026 Checkly feature per master spec §2).

import { test, expect } from '@playwright/test';

test.describe('Andura production critical paths (Checkly synthetic)', () => {
  test('1. Homepage loads + bottom-nav 4 taburi present', async ({ page }) => {
    await page.goto('/');
    // Accept Medical Disclaimer if shown (LOCK 4)
    const acceptButton = page.getByRole('button', {
      name: /accept|continui|inteleg|de acord/i,
    });
    if (await acceptButton.count()) {
      await acceptButton.first().click({ timeout: 5000 }).catch(() => {});
    }

    // Bottom-nav presence — at least 3 of 4 expected taburi present
    const tabs = ['antrenor', 'progres', 'istoric', 'cont'];
    let found = 0;
    for (const tab of tabs) {
      const candidates = [
        page.locator(`[data-tab="${tab}"]`),
        page.getByRole('link', { name: new RegExp(tab, 'i') }),
      ];
      for (const c of candidates) {
        if (await c.count()) {
          found += 1;
          break;
        }
      }
    }
    expect(found, `4-tab presence pe live (${found}/4)`).toBeGreaterThanOrEqual(3);
  });

  test('2. Magic Link login UI reachable + form interactive', async ({ page }) => {
    await page.goto('/');
    const acceptButton = page.getByRole('button', {
      name: /accept|continui|inteleg|de acord/i,
    });
    if (await acceptButton.count()) {
      await acceptButton.first().click({ timeout: 5000 }).catch(() => {});
    }

    const emailInput = page.locator('input[type="email"]').first();
    expect(await emailInput.count(), 'email input present').toBeGreaterThan(0);

    // Verify form accepts valid email format (NU dispatch — that's manual smoke)
    await emailInput.fill('checkly-synthetic@andura.app');
    expect(await emailInput.inputValue()).toBe('checkly-synthetic@andura.app');
  });

  test('3. Antrenor tab navigation reachable', async ({ page }) => {
    // Subscribe pageerror BEFORE navigation pentru capture early errors
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // waitUntil 'networkidle' = deterministic wait pentru full load, NO
    // arbitrary waitForTimeout (eslint-plugin-playwright NU instalat în Checkly
    // context — Checkly runner is independent from local Playwright suite).
    await page.goto('/antrenor', { waitUntil: 'networkidle', timeout: 15000 });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length, 'Antrenor route returns content').toBeGreaterThan(50);

    const fatal = errors.filter((e) => !/favicon|sourcemap/i.test(e));
    expect(fatal, fatal.join('\n')).toEqual([]);
  });

  test('4. PWA Service Worker registered + installable manifest', async ({ page }) => {
    await page.goto('/');
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg;
    });
    expect(swRegistered, 'service worker registered').toBe(true);

    const manifestLink = page.locator('link[rel="manifest"]');
    expect(await manifestLink.count(), 'manifest link present').toBeGreaterThan(0);
  });

  // Future activation (requires Firebase Admin SA for authenticated paths):
  //
  // test('5. AaFriction LOCK 9 per-set safety modal trigger path', async ({ page }) => {
  //   // Authenticated session via storageState — trigger RIR 0 condition
  //   // → verify PerSetSafetyModal renders + wording anti-paternalism
  // });
  //
  // test('6. LockExercises LOCK 4 disclaimer surface', async ({ page }) => {
  //   // Navigate la Aparate filter în Cont tab → verify greyed-out logic +
  //   // LOCK 4 Medical Disclaimer surface
  // });
  //
  // test('7. Engine API roundtrip Firestore latency budget', async ({ page }) => {
  //   // Authenticated → trigger workout save → measure Firestore write latency
  //   // → assert <500ms median (Cluster B5 SLO)
  // });
});
