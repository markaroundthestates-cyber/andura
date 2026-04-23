// ══ Admin Prefill — E2E smoke tests ═══════════════════════════════════════
import { test, expect } from '@playwright/test';

const BASE_URL = '/salafull/';

test('adminPrefillAll populates all data', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
  });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  // Clear slate, then run prefill
  await page.evaluate(() => {
    localStorage.removeItem('kcals');
    localStorage.removeItem('prots');
    localStorage.removeItem('weights');
    localStorage.removeItem('logs');
  });

  const isAvailable = await page.evaluate(() => typeof window.adminPrefillAll === 'function');
  if (!isAvailable) { test.skip(); return; }

  const result = await page.evaluate(() => window.adminPrefillAll());

  expect(result.kcalsDays,   'kcals should cover 9 days').toBeGreaterThanOrEqual(9);
  expect(result.protsDays,   'prots should cover 9 days').toBeGreaterThanOrEqual(9);
  expect(result.weightsDays, 'weights should cover 7 days').toBeGreaterThanOrEqual(7);

  const kcals   = await page.evaluate(() => JSON.parse(localStorage.getItem('kcals')   || '{}'));
  const prots   = await page.evaluate(() => JSON.parse(localStorage.getItem('prots')   || '{}'));
  const weights = await page.evaluate(() => JSON.parse(localStorage.getItem('weights') || '{}'));
  const logs    = await page.evaluate(() => JSON.parse(localStorage.getItem('logs')    || '[]'));

  expect(Object.keys(kcals).length,   'kcals keys in storage').toBeGreaterThanOrEqual(9);
  expect(Object.keys(prots).length,   'prots keys in storage').toBeGreaterThanOrEqual(9);
  expect(Object.keys(weights).length, 'weights keys in storage').toBeGreaterThanOrEqual(7);
  expect(logs.length,                 'logs entries in storage').toBeGreaterThanOrEqual(20);
});

test('adminPrefillAll merge does not overwrite existing data', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
    localStorage.setItem('kcals', JSON.stringify({ '2026-04-15': 9999 }));
  });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  const isAvailable = await page.evaluate(() => typeof window.adminPrefillAll === 'function');
  if (!isAvailable) { test.skip(); return; }

  await page.evaluate(() => window.adminPrefillAll());

  const kcals = await page.evaluate(() => JSON.parse(localStorage.getItem('kcals') || '{}'));
  expect(kcals['2026-04-15'], 'Existing value must not be overwritten').toBe(9999);
});

test('adminPrefillAll is available as window function', async ({ page }) => {
  await page.addInitScript(() => { window._suppressFirebaseSync = true; });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  const isFunction = await page.evaluate(() => typeof window.adminPrefillAll === 'function');
  expect(isFunction, 'window.adminPrefillAll should be a function').toBe(true);
});

test('Admin prefill button exists in developer zone', async ({ page }) => {
  await page.addInitScript(() => { window._suppressFirebaseSync = true; });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(500);

  const btnExists = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    return buttons.some(b =>
      b.textContent.includes('Admin') ||
      b.textContent.includes('Import MFP') ||
      b.id === 'btn-admin-prefill'
    );
  });

  expect(btnExists, 'Developer zone should have Admin prefill button').toBe(true);
});
