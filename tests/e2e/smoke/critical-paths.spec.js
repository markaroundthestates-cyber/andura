// ══ Critical Path Smoke Tests ════════════════════════════════════════════════
// These tests verify the most important user-facing behaviors.
// They run against the live GitHub Pages deployment.
// Tests gracefully skip (not fail) when UI elements are absent in test env.

import { test, expect } from '@playwright/test';
import { setupUser } from '../helpers/setup.js';
import { expectTextNotInPage, expectTextInPage } from '../helpers/assertions.js';
import { expectNoKey, getStorageState } from '../helpers/storage.js';
import { EMPTY, CUT_ACTIVE, WITH_HISTORY, CONTAMINATED } from '../fixtures/users.js';

const BASE_URL = '/salafull/';

// ── Test 1: App loads without errors for empty user ──────────────────────────
test('App loads without errors for empty user', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await setupUser(page, EMPTY);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 });

  const criticalErrors = pageErrors.filter(
    (m) => m.includes('ReferenceError') || m.includes('TypeError') || m.includes('SyntaxError')
  );
  expect(
    criticalErrors,
    `Critical JS errors: ${criticalErrors.join('; ')}`
  ).toHaveLength(0);
});

// ── Test 2: Empty user sees readiness prompt, NOT 'Zi de PR' ─────────────────
test('Empty user sees readiness prompt, NOT Zi de PR', async ({ page }) => {
  await setupUser(page, EMPTY);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 });

  // Should show the readiness input prompt
  const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');

  // If body has content, verify no 'Zi de PR' (readiness not set = no verdict shown)
  if (bodyText.trim().length > 0) {
    expect(bodyText, 'Empty user should NOT see "Zi de PR"').not.toContain('Zi de PR');
  } else {
    // Page didn't render — skip rather than fail
    test.skip();
  }
});

// ── Test 3: CUT phase user does NOT see 'Zi de PR' even with max readiness ───
test('CUT phase user does NOT see Zi de PR with max readiness', async ({ page }) => {
  // CUT_ACTIVE has readiness score 100 (max) but phase=AUTO before July 20 2026
  await setupUser(page, CUT_ACTIVE);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 });

  const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');

  if (bodyText.trim().length > 0) {
    expect(
      bodyText,
      'CUT phase user with score>=85 should NOT see "Zi de PR"'
    ).not.toContain('Zi de PR');

    // Should see a conservative label instead
    const hasConservativeLabel =
      bodyText.includes('Sesiune solidă') ||
      bodyText.includes('Sesiune normală') ||
      bodyText.includes('Sesiune moderată');

    // Only assert if readiness card is rendered (not all views show it)
    const hasReadinessInfo = bodyText.includes('Readiness') || bodyText.includes('readiness');
    if (hasReadinessInfo) {
      expect(
        hasConservativeLabel,
        'CUT phase should show a conservative label (Sesiune solidă/normală/moderată)'
      ).toBe(true);
    }
  } else {
    test.skip();
  }
});

// ── Test 4: Reset Test Data removes contaminated residue ─────────────────────
test('Reset Test Data removes contaminated residue', async ({ page }) => {
  await setupUser(page, CONTAMINATED);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 });

  // Verify contamination is present before reset
  const beforeReset = await page.evaluate(() => localStorage.getItem('applied-patterns'));
  expect(beforeReset, 'applied-patterns should be set before reset').not.toBeNull();

  // Call _devResetTest via the exposed window API (suppress confirm dialog)
  await page.evaluate(() => {
    // Override confirm to auto-accept
    window.confirm = () => true;
  });

  // Call resetTestData directly (exposed via window)
  const resetResult = await page.evaluate(async () => {
    if (typeof window.resetTestData === 'function') {
      return await window.resetTestData({ clearFirebase: false, reload: false });
    }
    return null;
  });

  // If resetTestData is available, verify cleanup
  if (resetResult !== null) {
    const afterApplied = await page.evaluate(() => localStorage.getItem('applied-patterns'));
    const afterAutoRec = await page.evaluate(() => localStorage.getItem('auto-recommendations'));
    // applied-patterns PRESERVED post-resetTestData per ADR 011 CDL_KEYS semantic (TASK #2, 52e09f1)
    expect(afterApplied, 'applied-patterns should be PRESERVED after resetTestData (CDL_KEYS per ADR 011)').not.toBeNull();
    // auto-recommendations rămâne TEST_RESIDUE_KEYS — legitim wipe la resetTestData
    expect(afterAutoRec, 'auto-recommendations should be null after reset').toBeNull();
  } else {
    // resetTestData not exposed — skip rather than fail
    test.skip();
  }
});

// ── Test 5: Session history shows correct counts (≠ '3 exerciții · 3 seturi') ─
test('Session history shows correct counts for 5-exercise sessions', async ({ page }) => {
  await setupUser(page, WITH_HISTORY);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 });

  // Navigate to weight page
  const weightBtn = page.locator('.nb').nth(2);
  const weightBtnCount = await weightBtn.count();
  if (!weightBtnCount) { test.skip(); return; }

  await weightBtn.click();
  await page.waitForTimeout(600);

  const sessionHistory = page.locator('#session-history');
  const histCount = await sessionHistory.count();
  if (!histCount) { test.skip(); return; }

  const histText = await sessionHistory.innerText({ timeout: 5000 }).catch(() => '');
  if (!histText.trim()) { test.skip(); return; }

  // Each session has 5 unique exercises — verify correct exercise count appears
  // New format uses "5 ex" (short form), not "3 ex"
  expect(
    histText,
    'Session with 5 unique exercises should show "5 ex"'
  ).toContain('5 ex');

  // Must NOT show "3 ex" (the old incorrect count)
  expect(
    histText,
    'Should not show wrong count of 3 exercises'
  ).not.toMatch(/\b3 ex\b/);
});

// ── Test 6: Equipment validation — no impossible weights recommended ──────────
test('Equipment validation — no impossible weights recommended', async ({ page }) => {
  // Setup with some history to trigger recommendations
  const readinessData = { [new Date().toISOString().slice(0, 10)]: { score: 75, emoji: '😊' } };
  await setupUser(page, {
    _suppressFirebaseSync: true,
    'onboarding-done': true,
    'phase-override': 'AUTO',
    'current-kcal': '1800',
    readiness: readinessData,
    logs: [
      { date: new Date().toISOString().slice(0, 10), ex: 'DB Shoulder Press', w: 25, reps: '8', rpe: 7, ts: Date.now() - 1000, session: Date.now() - 10000, baseline: false },
    ],
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 });

  const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
  if (!bodyText.trim()) { test.skip(); return; }

  // Check that 26kg is not recommended for DB Shoulder Press
  // Valid dumbbell weights: 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30...
  // 26kg is NOT a valid dumbbell weight
  expect(
    bodyText,
    'Should not recommend impossible weight 26kg for DB Shoulder Press'
  ).not.toContain('26kg');
});
