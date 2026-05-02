// ══ Week 2 UI — Smoke tests for new features ══════════════════════════════
import { test, expect } from '@playwright/test';

const BASE_URL = '/andura/';

// ── Test 1: restoreRealLogs is globally accessible ────────────────────────
test('restoreRealLogs is available as window function', async ({ page }) => {
  await page.addInitScript(() => { window._suppressFirebaseSync = true; });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  const isFunction = await page.evaluate(() => typeof window.restoreRealLogs === 'function');
  expect(isFunction, 'window.restoreRealLogs should be a function').toBe(true);
});

// ── Test 2: restoreRealLogs actually restores logs ────────────────────────
test('restoreRealLogs restores Apr 21 + Apr 22 logs', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
  });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  // Clear existing logs first
  await page.evaluate(() => localStorage.removeItem('logs'));

  // Call restoreRealLogs
  const result = await page.evaluate(() => {
    if (typeof window.restoreRealLogs !== 'function') return null;
    return window.restoreRealLogs({ merge: false });
  });

  if (result === null) { test.skip(); return; }

  expect(result.restored, 'Should restore > 0 entries').toBeGreaterThan(0);
  expect(result.total, 'Total logs should be > 20').toBeGreaterThan(20);

  const logs = await page.evaluate(() => {
    const raw = localStorage.getItem('logs');
    return raw ? JSON.parse(raw) : [];
  });
  expect(logs.length, 'Logs in localStorage should be > 20').toBeGreaterThan(20);

  const dates = [...new Set(logs.map(l => l.date))];
  expect(dates, 'Should contain Apr 21 2026').toContain('2026-04-21');
  expect(dates, 'Should contain Apr 22 2026').toContain('2026-04-22');
});

// ── Test 3: showWhyForExercise is globally accessible ─────────────────────
test('showWhyForExercise is available as window function', async ({ page }) => {
  await page.addInitScript(() => { window._suppressFirebaseSync = true; });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  const isFunction = await page.evaluate(() => typeof window.showWhyForExercise === 'function');
  expect(isFunction, 'window.showWhyForExercise should be a function').toBe(true);
});

// ── Test 4: ❓ De ce? button appears on coach screen ─────────────────────
test('Why button appears on coach screen when readiness is set', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('onboarding-done', 'true');
    localStorage.setItem('phase-override', 'AUTO');
    localStorage.setItem('readiness', JSON.stringify({ [today]: { score: 4, emoji: '😊' } }));
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Check for the why button via onclick attribute or text
  const whyButtonCount = await page.evaluate(() => {
    return document.querySelectorAll('button[onclick*="showWhyForExercise"]').length;
  });

  // If coach screen rendered exercises, there should be why buttons
  const bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
  const hasExercises = bodyText.includes('kg') || bodyText.includes('Lat Pulldown') || bodyText.includes('Incline');

  if (hasExercises) {
    expect(whyButtonCount, 'Should have at least 1 ❓ De ce? button').toBeGreaterThan(0);
  } else {
    // Readiness not set or no plan for today — skip gracefully
    test.skip();
  }
});

// ── Test 5: Restore Real Logs button exists in developer zone ─────────────
test('Developer zone contains Restore Real Logs button', async ({ page }) => {
  await page.addInitScript(() => { window._suppressFirebaseSync = true; });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(500);

  // Find in DOM (button may be inside a collapsible section)
  const btnExists = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    return buttons.some(b => b.textContent.includes('Restore Real Logs') || b.textContent.includes('Apr 21'));
  });

  expect(btnExists, 'Developer zone should have Restore Real Logs button').toBe(true);
});

// ── Test 6: restoreRealLogs merge=true does not create duplicates ──────────
test('restoreRealLogs merge=true adds no duplicates on second call', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
  });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  if (await page.evaluate(() => typeof window.restoreRealLogs !== 'function')) {
    test.skip(); return;
  }

  // First restore (merge=false → clean state)
  await page.evaluate(() => {
    localStorage.removeItem('logs');
    window.restoreRealLogs({ merge: false });
  });
  const countAfterFirst = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('logs') || '[]').length
  );

  // Second restore (merge=true → should not add duplicates)
  await page.evaluate(() => window.restoreRealLogs({ merge: true }));
  const countAfterSecond = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('logs') || '[]').length
  );

  expect(countAfterSecond, 'Second merge should not add duplicates').toBe(countAfterFirst);
});
