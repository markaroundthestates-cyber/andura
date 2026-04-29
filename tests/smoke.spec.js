import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    // AA friction modal is suppressed for smoke tests so its backdrop never
    // intercepts UI clicks (smoke isn't validating coach engine behaviour).
    await page.addInitScript(() => { window._suppressAAFrictionModal = true; });
  });

  test('app loads in under 5 seconds', async ({ page }) => {
    const start = Date.now();

    await page.goto('/salafull/', { waitUntil: 'domcontentloaded', timeout: 5000 });

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('no ReferenceError or TypeError in console', async ({ page }) => {
    const pageErrors = [];

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('/salafull/');
    await page.waitForLoadState('networkidle');

    const criticalErrors = pageErrors.filter(
      (msg) => msg.includes('ReferenceError') || msg.includes('TypeError')
    );

    expect(
      criticalErrors,
      `Console errors found:\n${criticalErrors.join('\n')}`
    ).toHaveLength(0);
  });

  test('page title exists and body is not empty', async ({ page }) => {
    await page.goto('/salafull/');
    await page.waitForLoadState('networkidle');

    // Title should be non-empty
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);

    // Body should have some content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText.trim().length).toBeGreaterThan(0);
  });
});
