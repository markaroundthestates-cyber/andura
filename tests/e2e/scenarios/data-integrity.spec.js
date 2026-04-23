// ══ Data Integrity Tests — no fake data injected after reset ══════════════════
import { test, expect } from '@playwright/test';
import { setupUser } from '../helpers/setup.js';
import { EMPTY, CONTAMINATED, WITH_HISTORY } from '../fixtures/users.js';

const BASE_URL = '/salafull/';

test.describe('Data integrity after reset', () => {

  test('No fake data injected after Full Reset', async ({ page }) => {
    await setupUser(page, CONTAMINATED);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // Simulate full reset: clear localStorage and reload
    await page.evaluate(() => {
      localStorage.clear();
      window._suppressFirebaseSync = true;
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    await page.waitForTimeout(1000);

    const logs = await page.evaluate(() => {
      const raw = localStorage.getItem('logs');
      return raw ? JSON.parse(raw) : [];
    });

    expect(logs.length).toBe(0);

    const body = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
    expect(body).not.toContain('Pattern detectat');
    expect(body).not.toContain('Program scurtat');
    expect(body).not.toContain('skip rate');
  });

  test('No [inject] console messages for clean user', async ({ page }) => {
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'log') consoleMessages.push(msg.text());
    });

    await setupUser(page, EMPTY);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    await page.waitForTimeout(1000);

    const injectMessages = consoleMessages.filter(m => m.includes('[inject]'));
    expect(injectMessages).toHaveLength(0);
  });

  test('Empty state shows no fake data', async ({ page }) => {
    await setupUser(page, EMPTY);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    await page.waitForTimeout(1000);

    const body = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
    expect(body).not.toMatch(/Apr 21|Apr 22|21\/4|22\/4/);
  });
});
