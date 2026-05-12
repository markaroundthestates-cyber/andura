// ══ V2 4 taburi smoke E2E ════════════════════════════════════════════════════
// Per ADR 03-decisions/008-vitest-playwright-testing.md LOCK V1 stack +
// src/state.js:29 router enum + src/router.js V2 4 taburi routing intent +
// mockup 04-architecture/mockups/andura-clasic.html bottom-nav line 1701-1715
// (Antrenor/Progres/Istoric/Settings).
//
// Test scope SLICE 3: 4 main tab navigation smoke + cross-tab persistence.
// Runs against live deploy (playwright.config.js baseURL = https://andura.app).
// Forward-compat: detects EITHER V1 prod `.nb` button nav OR V2 mockup
// `[data-tab="..."]` nav-tab structure (during `feature/v2-vanilla-port` deploy
// transition both states valid). Graceful test.skip() when scaffolding absent
// (mirrors tests/e2e/smoke/critical-paths.spec.js pattern preserved invariant).
//
// Zero arbitrary `page.waitForTimeout(N)` — waitForLoadState + expect.toBeVisible
// auto-retry only (ADR 008 §1 LOCK V1 — no flaky waits).

import { test, expect } from '@playwright/test';
import { setupUser } from './helpers/setup.js';
import { EMPTY, WITH_HISTORY } from './fixtures/users.js';

const BASE_URL = '/';

// Logical tab → candidate selector chain (V2 first, V1 fallback by index).
// V1 prod `.nb` buttons positional (index.html line 655-678 — 6 buttons total):
//   nth(1) sp('coach')    [#page-coach]    = antrenor (main coach landing)
//   nth(2) sp('dash')     [#page-dash]     = progres (dashboard charts)
//   nth(3) sp('weight')   [#page-weight]   = istoric (contains #session-history)
//   nth(4) sp('prog')     (Program — V2 conceptually merged into Antrenor)
//   nth(5) sp('plan')     (Plan — V2 conceptually merged into Antrenor)
//   nth(6) sp('settings') [#page-settings] = cont (account / setari)
const TAB_SELECTORS = {
  antrenor: ['[data-tab="antrenor"]', '#nav-coach', '.nb:nth-of-type(1)'],
  progres:  ['[data-tab="progres"]',  '.nb:nth-of-type(2)'],
  istoric:  ['[data-tab="istoric"]',  '.nb:nth-of-type(3)'],
  cont:     ['[data-tab="settings"]', '[data-tab="cont"]', '#nav-settings', '.nb:nth-of-type(6)'],
};

async function findTab(page, tabName) {
  const candidates = TAB_SELECTORS[tabName] || [];
  for (const sel of candidates) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) > 0) return loc;
  }
  return null;
}

async function clickTab(page, tabName) {
  const tab = await findTab(page, tabName);
  if (!tab) return false;
  await tab.click({ timeout: 5000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  return true;
}

function attachConsoleErrorCapture(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

// ── Test 1: Antrenor tab smoke (default landing) ─────────────────────────────
test('Antrenor tab smoke — default landing renders main coach surface', async ({ page }) => {
  const errors = attachConsoleErrorCapture(page);

  await setupUser(page, EMPTY);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 });

  const tab = await findTab(page, 'antrenor');
  if (!tab) { test.skip(); return; }

  await tab.click({ timeout: 5000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  // Antrenor surface signal: either V2 antrenor screen OR V1 page-coach.
  const antrenorSurface = page.locator('#page-coach, [data-screen="antrenor"], .antrenor-screen').first();
  await expect(antrenorSurface, 'Antrenor surface should be visible').toBeVisible({ timeout: 5000 });

  const critical = errors.filter(e => /ReferenceError|TypeError|SyntaxError/.test(e));
  expect(critical, `No critical JS errors on Antrenor: ${critical.join('; ')}`).toHaveLength(0);
});

// ── Test 2: Progres tab smoke ────────────────────────────────────────────────
test('Progres tab smoke — chart container visible after navigate', async ({ page }) => {
  const errors = attachConsoleErrorCapture(page);

  await setupUser(page, WITH_HISTORY);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 });

  const clicked = await clickTab(page, 'progres');
  if (!clicked) { test.skip(); return; }

  // Progres surface signal: V2 progres screen OR V1 page-dash (dashboard)
  const progresSurface = page.locator('#page-dash, [data-screen="progres"], .progres-screen, svg').first();
  await expect(progresSurface, 'Progres/chart surface should be visible').toBeVisible({ timeout: 5000 });

  const critical = errors.filter(e => /ReferenceError|TypeError|SyntaxError/.test(e));
  expect(critical, `No critical JS errors on Progres: ${critical.join('; ')}`).toHaveLength(0);
});

// ── Test 3: Istoric tab smoke ────────────────────────────────────────────────
test('Istoric tab smoke — session history list visible', async ({ page }) => {
  const errors = attachConsoleErrorCapture(page);

  await setupUser(page, WITH_HISTORY);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 });

  const clicked = await clickTab(page, 'istoric');
  if (!clicked) { test.skip(); return; }

  // Istoric surface signal: V2 istoric screen OR V1 page-weight (which contains session-history)
  const istoricSurface = page.locator('#page-weight, [data-screen="istoric"], .istoric-screen, #session-history').first();
  await expect(istoricSurface, 'Istoric/history surface should be visible').toBeVisible({ timeout: 5000 });

  const critical = errors.filter(e => /ReferenceError|TypeError|SyntaxError/.test(e));
  expect(critical, `No critical JS errors on Istoric: ${critical.join('; ')}`).toHaveLength(0);
});

// ── Test 4: Cont tab smoke ───────────────────────────────────────────────────
test('Cont tab smoke — profile/settings section visible', async ({ page }) => {
  const errors = attachConsoleErrorCapture(page);

  await setupUser(page, EMPTY);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 });

  const clicked = await clickTab(page, 'cont');
  if (!clicked) { test.skip(); return; }

  // Cont surface signal: V2 cont/settings screen OR V1 page-settings
  const contSurface = page.locator('#page-settings, [data-screen="settings"], [data-screen="cont"], .settings-screen').first();
  await expect(contSurface, 'Cont/settings surface should be visible').toBeVisible({ timeout: 5000 });

  const critical = errors.filter(e => /ReferenceError|TypeError|SyntaxError/.test(e));
  expect(critical, `No critical JS errors on Cont: ${critical.join('; ')}`).toHaveLength(0);
});

// ── Test 5: Cross-tab persistence ────────────────────────────────────────────
test('Cross-tab persistence — localStorage state preserved across tab navigation', async ({ page }) => {
  const errors = attachConsoleErrorCapture(page);

  await setupUser(page, EMPTY);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 });

  // Set a sentinel value in localStorage from Antrenor context
  const startedTab = await findTab(page, 'antrenor');
  if (!startedTab) { test.skip(); return; }
  await startedTab.click({ timeout: 5000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  await page.evaluate(() => {
    localStorage.setItem('v2-smoke-sentinel', JSON.stringify({ marker: 'antrenor-set', ts: Date.now() }));
  });

  // Navigate to Progres
  const clickedProgres = await clickTab(page, 'progres');
  if (!clickedProgres) { test.skip(); return; }

  const stillSetAfterNav = await page.evaluate(() => localStorage.getItem('v2-smoke-sentinel'));
  expect(stillSetAfterNav, 'Sentinel should persist after Progres navigation').not.toBeNull();
  expect(stillSetAfterNav, 'Sentinel content preserved').toContain('antrenor-set');

  // Return to Antrenor
  const clickedBack = await clickTab(page, 'antrenor');
  if (!clickedBack) { test.skip(); return; }

  const stillSetAfterReturn = await page.evaluate(() => localStorage.getItem('v2-smoke-sentinel'));
  expect(stillSetAfterReturn, 'Sentinel should still persist after returning to Antrenor').not.toBeNull();
  expect(stillSetAfterReturn, 'Sentinel content matches across round-trip').toContain('antrenor-set');

  const critical = errors.filter(e => /ReferenceError|TypeError|SyntaxError/.test(e));
  expect(critical, `No critical JS errors across tab roundtrip: ${critical.join('; ')}`).toHaveLength(0);
});
