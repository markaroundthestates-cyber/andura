// ══ Session logs persistence — Bug 1 regression ══════════════════════════
// Verifies that cleanFakeLogs() does NOT delete real multi-set sessions
// when `session` is stored as a Number (Date.now()) — the string/number
// mismatch in Set.has() previously wiped all non-baseline logs.
import { test, expect } from '@playwright/test';

const BASE_URL = '/';
const SESSION_TS = 1745366400000; // numeric — Apr 23 2026

test('cleanFakeLogs preserves real multi-set session with numeric session key', async ({ page }) => {
  await page.addInitScript((ts) => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
    const logs = [
      { date: '2026-04-23', ex: 'Cable Curl',      w: 30, reps: '10', rpe: 7, ts: ts + 1, session: ts },
      { date: '2026-04-23', ex: 'Cable Curl',      w: 30, reps: '10', rpe: 7, ts: ts + 2, session: ts },
      { date: '2026-04-23', ex: 'Preacher Curl',   w: 20, reps: '10', rpe: 7, ts: ts + 3, session: ts },
      { date: '2026-04-23', ex: 'Preacher Curl',   w: 20, reps: '10', rpe: 7, ts: ts + 4, session: ts },
      { date: '2026-04-23', ex: 'Overhead Triceps',w: 25, reps: '10', rpe: 7, ts: ts + 5, session: ts },
      // baseline — always preserved
      { date: '2026-04-17', ex: 'Lat Pulldown', w: 50, reps: '8', baseline: true, ts: 1, session: null },
    ];
    localStorage.setItem('logs', JSON.stringify(logs));
  }, SESSION_TS);

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  const { before, after } = await page.evaluate(() => {
    const before = JSON.parse(localStorage.getItem('logs') || '[]').length;
    window.cleanFakeLogs();
    const after = JSON.parse(localStorage.getItem('logs') || '[]').length;
    return { before, after };
  });

  expect(after, 'real multi-set logs must survive cleanFakeLogs').toBe(before);
  expect(after).toBe(6); // 5 real sets + 1 baseline
});

test('cleanFakeLogs removes singleton sessions (test aborts)', async ({ page }) => {
  await page.addInitScript((ts) => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
    const logs = [
      { date: '2026-04-23', ex: 'Cable Curl', w: 30, reps: '5', rpe: 7, ts: ts + 1, session: ts },
      { date: '2026-04-17', ex: 'Lat Pulldown', w: 50, reps: '8', baseline: true, ts: 1, session: null },
    ];
    localStorage.setItem('logs', JSON.stringify(logs));
  }, SESSION_TS);

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  const after = await page.evaluate(() => {
    window.cleanFakeLogs();
    return JSON.parse(localStorage.getItem('logs') || '[]').length;
  });

  expect(after).toBe(1); // only baseline remains
});
