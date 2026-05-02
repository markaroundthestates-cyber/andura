import { test, expect } from '@playwright/test';

test.describe('Visual / structural tests', () => {
  test.beforeEach(async ({ page }) => {
    // Suppress AA friction modal — backdrop would intercept theme/nav clicks.
    // Suppress onboarding overlay — first-run overlay also intercepts clicks.
    // (Firebase sync stays enabled so production data flows naturally.)
    await page.addInitScript(() => {
      window._suppressAAFrictionModal = true;
      window._suppressOnboardingOverlay = true;
    });
    await page.goto('/');
    // Wait for the SPA to fully bootstrap (networkidle = no pending requests)
    await page.waitForLoadState('networkidle');
    // Also wait for the nav to be present before any test body runs
    await page.waitForSelector('.nb', { timeout: 10000 });
  });

  // ── Nav ────────────────────────────────────────────────────────────────────
  test('nav has exactly 5 visible .nb elements', async ({ page }) => {
    const navButtons = page.locator('.nb');
    await expect(navButtons).toHaveCount(5);

    for (let i = 0; i < 5; i++) {
      await expect(navButtons.nth(i)).toBeVisible();
    }
  });

  // ── Theme switcher presence ────────────────────────────────────────────────
  test('#theme-switcher exists in the DOM', async ({ page }) => {
    const switcher = page.locator('#theme-switcher');
    await expect(switcher).toBeAttached();
  });

  // ── Google Fonts — no 400 responses ───────────────────────────────────────
  test('no 400 responses for Google Fonts requests', async ({ page }) => {
    const fontErrors = [];

    page.on('response', (response) => {
      if (
        response.url().includes('fonts.googleapis.com') &&
        response.status() >= 400
      ) {
        fontErrors.push(`${response.status()} → ${response.url()}`);
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    expect(
      fontErrors,
      `Bad font responses:\n${fontErrors.join('\n')}`
    ).toHaveLength(0);
  });

  // ── Body max-width on wide viewport ───────────────────────────────────────
  test('body max-width is <= 430px on a 1280px viewport', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const wPage = await context.newPage();

    await wPage.goto('/');
    await wPage.waitForLoadState('networkidle');
    // Wait for SPA nav to appear so styles are applied
    await wPage.waitForSelector('.nb', { timeout: 10000 });

    const bodyWidth = await wPage.evaluate(() =>
      document.body.getBoundingClientRect().width
    );
    expect(bodyWidth).toBeLessThanOrEqual(430);

    await context.close();
  });

  // ── Theme menu opens on click ──────────────────────────────────────────────
  test('clicking theme switcher shows the theme menu', async ({ page }) => {
    const menu = page.locator('#theme-menu');

    // Wait for theme button to be ready
    await page.waitForSelector('#theme-btn', { timeout: 10000 });

    // Menu should be hidden initially
    await expect(menu).toBeHidden();

    // Click the toggle button
    await page.locator('#theme-btn').click();

    // Menu should now be visible
    await expect(menu).toBeVisible();

    // Should contain all three theme option labels
    await expect(menu).toContainText('FORGE');
    await expect(menu).toContainText('ZEN');
    await expect(menu).toContainText('ANIME');
  });

  // ── Theme switch changes --bg CSS variable ─────────────────────────────────
  test('selecting ZEN theme changes --bg CSS variable', async ({ page }) => {
    // Start fresh from the default FORGE theme
    await page.evaluate(() => localStorage.removeItem('active-theme'));
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#theme-btn', { timeout: 10000 });

    // Read the initial --bg value (FORGE theme)
    const initialBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    );

    // Open the theme menu
    await page.locator('#theme-btn').click();
    await expect(page.locator('#theme-menu')).toBeVisible();

    // Click the ZEN option by text
    await page.locator('#theme-menu').getByText('ZEN').click();

    // Wait for CSS variable to propagate
    await page.waitForTimeout(400);

    // Read --bg after switching
    const newBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    );

    expect(newBg).not.toBe('');
    expect(newBg).not.toBe(initialBg);
  });
});
