// Track 7 §7.3 — Visual regression Playwright `toHaveScreenshot()` native multi-
// browser per master spec §1.3. Zero plugin — Playwright built-in.
//
// Stability principles (master spec §1.3 verbatim):
//   - disable animations + transitions (use option `animations: 'disabled'`)
//   - fixed viewport per shot
//   - mask dynamic content (timestamps, randomized IDs) via `mask:` option
//   - maxDiffPixelRatio 0.02 (2% threshold tolerant of font rendering jitter)
//
// LOCAL OPT-IN ONLY — excluded from the blocking CI smoke (qa-report.yml uses
// --grep-invert "Visual regression"). No platform-matched baselines are
// committed (CI=linux, dev=win32), and pixel-diffs fire on every intentional
// design change. Run locally: `npm run test:visual`. Regenerate baselines after
// an intended UI change: `npm run visual:update`. Promote to a CI gate post-Beta
// once the design is frozen and linux baselines are generated + committed.

import { test, expect } from '@playwright/test';

async function dismissMedicalDisclaimerIfPresent(page: import('@playwright/test').Page) {
  const acceptButton = page.getByRole('button', {
    name: /accept|continui|inteleg|de acord/i,
  });
  if (await acceptButton.count()) {
    await acceptButton.first().click({ timeout: 5000 }).catch(() => {});
  }
}

const SCREENSHOT_OPTIONS = {
  fullPage: true,
  animations: 'disabled' as const,
  caret: 'hide' as const,
  maxDiffPixelRatio: 0.02,
};

test.describe('Visual regression — public routes', () => {
  test('homepage initial render', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 size
    await page.goto('/');
    await dismissMedicalDisclaimerIfPresent(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Mask any dynamic timestamp-like elements (defensive — selectors may not
    // exist in current build; locator.count() == 0 = no-op mask).
    const masks = [
      page.locator('[data-testid="timestamp"]'),
      page.locator('time'),
      page.locator('[data-dynamic]'),
    ];
    const activeMasks = [];
    for (const m of masks) {
      if (await m.count()) activeMasks.push(m);
    }

    await expect(page).toHaveScreenshot('homepage-mobile-390x844.png', {
      ...SCREENSHOT_OPTIONS,
      mask: activeMasks,
    });
  });

  test('homepage mobile small viewport (375x667 — iPhone SE)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await dismissMedicalDisclaimerIfPresent(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page).toHaveScreenshot('homepage-mobile-375x667.png', SCREENSHOT_OPTIONS);
  });

  test('homepage tablet portrait (768x1024 — iPad Air)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await dismissMedicalDisclaimerIfPresent(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page).toHaveScreenshot('homepage-tablet-768x1024.png', SCREENSHOT_OPTIONS);
  });
});
