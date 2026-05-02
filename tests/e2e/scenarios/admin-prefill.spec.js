// ══ Admin Prefill — E2E smoke tests ═══════════════════════════════════════
import { test, expect } from '@playwright/test';

const BASE_URL = '/andura/';

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

test('adminPrefillAll real data overrides auto-saved target defaults', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
    // Simulate what initKcal auto-save would have written on Apr 21-23
    localStorage.setItem('kcals', JSON.stringify({
      '2026-04-21': 1800,
      '2026-04-22': 1800,
      '2026-04-23': 1800,
    }));
    localStorage.setItem('prots', JSON.stringify({
      '2026-04-21': 180,
      '2026-04-22': 180,
      '2026-04-23': 180,
    }));
  });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  const isAvailable = await page.evaluate(() => typeof window.adminPrefillAll === 'function');
  if (!isAvailable) { test.skip(); return; }

  await page.evaluate(() => window.adminPrefillAll());

  const kcals = await page.evaluate(() => JSON.parse(localStorage.getItem('kcals') || '{}'));
  const prots = await page.evaluate(() => JSON.parse(localStorage.getItem('prots') || '{}'));

  // Real MFP values must win over auto-saved 1800/180 defaults
  expect(kcals['2026-04-22'], 'Apr 22 kcal should be real MFP value 1911 not target 1800').toBe(1911);
  expect(kcals['2026-04-21'], 'Apr 21 kcal should be real MFP value 1787 not target 1800').toBe(1787);
  expect(kcals['2026-04-23'], 'Apr 23 kcal should be real MFP value 1297 not target 1800').toBe(1297);
  expect(prots['2026-04-22'], 'Apr 22 prot should be real MFP value 249 not target 180').toBe(249);
});

test('adminPrefillAll keeps manually entered values on other dates', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
    // A value on a date NOT in kcalsData — should be preserved
    localStorage.setItem('kcals', JSON.stringify({ '2026-04-10': 2100 }));
  });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  const isAvailable = await page.evaluate(() => typeof window.adminPrefillAll === 'function');
  if (!isAvailable) { test.skip(); return; }

  await page.evaluate(() => window.adminPrefillAll());

  const kcals = await page.evaluate(() => JSON.parse(localStorage.getItem('kcals') || '{}'));
  expect(kcals['2026-04-10'], 'Entry on date outside admin range must be preserved').toBe(2100);
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
