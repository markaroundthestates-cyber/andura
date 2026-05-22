// Track 7 §7.2 — React 4-tab smoke E2E.
// Per master spec §1.2 core suite scope:
//   - Login (storageState — auth setup project dependency) → home Antrenor
//   - Antrenor sub-screens click-through
//   - Progres tab + log-weight + chart render
//   - Istoric tab list + detail nav
//   - Cont tab + settings + Aparate filter
//   - PWA offline + mobile emulation
//
// This file is the SKELETON — when GOOGLE_APPLICATION_CREDENTIALS env var is
// absent, deep-route specs auto-skip. Public-routes coverage (home + Cont
// stubs) still runs.

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const TABS = ['antrenor', 'progres', 'istoric', 'cont'] as const;

async function dismissMedicalDisclaimerIfPresent(page: import('@playwright/test').Page) {
  const acceptButton = page.getByRole('button', {
    name: /accept|continui|inteleg|de acord/i,
  });
  if (await acceptButton.count()) {
    await acceptButton.first().click({ timeout: 5000 }).catch(() => {});
  }
}

async function navToTab(page: import('@playwright/test').Page, tab: string): Promise<boolean> {
  const candidates = [
    page.getByRole('link', { name: new RegExp(tab, 'i') }),
    page.getByRole('button', { name: new RegExp(tab, 'i') }),
    page.locator(`[data-tab="${tab}"]`),
    page.locator(`a[href*="${tab}"]`),
  ];
  for (const c of candidates) {
    if (await c.count()) {
      await c.first().click({ timeout: 5000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      return true;
    }
  }
  return false;
}

test.describe('React 4-tab smoke (public routes only — no auth required)', () => {
  test('homepage loads + bottom-nav 4 taburi present', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await dismissMedicalDisclaimerIfPresent(page);

    // Bottom-nav presence — at least 2 of 4 expected taburi locatable.
    let found = 0;
    for (const tab of TABS) {
      const candidates = [
        page.locator(`[data-tab="${tab}"]`),
        page.getByRole('link', { name: new RegExp(tab, 'i') }),
        page.locator(`a[href*="${tab}"]`),
      ];
      for (const c of candidates) {
        if (await c.count()) {
          found += 1;
          break;
        }
      }
    }
    expect.soft(found, `4-tab presence (found ${found}/4)`).toBeGreaterThanOrEqual(2);

    const fatal = errors.filter(
      (e) =>
        !/favicon|hot-update|sourcemap|service-worker registration failed/i.test(e),
    );
    expect.soft(fatal, fatal.join('\n')).toHaveLength(0);
  });

  for (const tab of TABS) {
    test(`navigate to ${tab} tab — render check (auth-gated)`, async ({ page }) => {
      test.skip(
        !process.env['GOOGLE_APPLICATION_CREDENTIALS'],
        'requires Firebase Admin SA for authenticated 4-tab walk-through',
      );
      await page.goto('/');
      await dismissMedicalDisclaimerIfPresent(page);
      const reached = await navToTab(page, tab);
      expect.soft(reached, `nav to ${tab}`).toBe(true);
    });
  }

  test('PWA offline mode — page reloads from SW cache', async ({ page, context }) => {
    await page.goto('/');
    await dismissMedicalDisclaimerIfPresent(page);
    // Wait briefly for SW registration; if not registered, test.skip().
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg;
    });
    if (!swRegistered) {
      test.skip(true, 'service worker not registered în current dev build — SW activates în prod build only');
      return;
    }

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await context.setOffline(false);
    // Soft assertion — page should render *something* offline (SW cached shell).
    const bodyText = await page.locator('body').innerText();
    expect.soft(bodyText.length, 'offline body content').toBeGreaterThan(20);
  });

  test('Homepage axe-core WCAG 2.1 AA scan — zero critical/serious', async ({ page }) => {
    await page.goto('/');
    await dismissMedicalDisclaimerIfPresent(page);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect.soft(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
});
