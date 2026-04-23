// ══ Calibration UI gating — E2E smoke tests ═══════════════════════════════
// Verifies that cold_start users never see SKIP_DAY patterns in the UI
// (neither the Why modal nor the "Program scurtat" banner).
import { test, expect } from '@playwright/test';

const BASE_URL = '/salafull/';

test('Cold start user does not see SKIP_DAY in Why modal', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
    // 1 session only — cold_start tier
    localStorage.setItem('logs', JSON.stringify([
      { ex: 'Lat Pulldown', w: 50, reps: 8, rpe: 7, date: '2026-04-21', session: 'sess-1' }
    ]));
    // Inject a stale SKIP_DAY pattern to simulate the bug
    localStorage.setItem('applied-patterns', JSON.stringify([
      { type: 'SKIP_DAY', day: 'Joi', skipRate: 100, confidence: 0.9, appliedAt: Date.now() }
    ]));
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1000);

  // Intercept alert and capture its text
  let alertText = '';
  page.on('dialog', async dialog => {
    alertText = dialog.message();
    await dialog.accept();
  });

  // Click the first ❓ De ce? button if visible
  const whyBtn = page.locator('button:has-text("De ce")').first();
  if (await whyBtn.count() > 0) {
    await whyBtn.click();
    await page.waitForTimeout(500);
    expect(alertText).not.toContain('SKIP_DAY');
    expect(alertText).not.toContain('Pattern detectat: SKIP_DAY');
  } else {
    test.skip(); // No why button — readiness not set or off day
  }
});

test('Cold start does not show program shortened banner', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
    // Cold start: no sessions
    localStorage.removeItem('logs');
    // Inject stale skip pattern
    localStorage.setItem('applied-patterns', JSON.stringify([
      { type: 'SKIP_DAY', day: 'Joi', skipRate: 100, confidence: 0.9, appliedAt: Date.now() },
      { type: 'SKIP_DAY', day: 'Marți', skipRate: 88, confidence: 0.88, appliedAt: Date.now() }
    ]));
    localStorage.setItem('readiness', JSON.stringify({
      [new Date().toISOString().slice(0, 10)]: { score: 4, emoji: '😊' }
    }));
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);

  const bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
  expect(bodyText).not.toMatch(/Program scurtat/i);
  expect(bodyText).not.toMatch(/skip.*esențiale/i);
});

test('Stale pattern caches cleared on cold_start init', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
    // Single session = cold_start
    localStorage.setItem('logs', JSON.stringify([
      { ex: 'Lat Pulldown', w: 50, reps: 8, date: '2026-04-21', session: 'sess-1' }
    ]));
    // Pre-inject stale caches
    localStorage.setItem('applied-patterns', JSON.stringify([
      { type: 'SKIP_DAY', day: 'Joi', skipRate: 100 }
    ]));
    localStorage.setItem('pattern-learning-cache', '{"stale":true}');
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  const appliedPatterns = await page.evaluate(() => localStorage.getItem('applied-patterns'));
  const patternCache   = await page.evaluate(() => localStorage.getItem('pattern-learning-cache'));

  expect(appliedPatterns, 'applied-patterns should be cleared for cold_start user').toBeNull();
  expect(patternCache,    'pattern-learning-cache should be cleared for cold_start user').toBeNull();
});

// ── Bug 2 regression tests ────────────────────────────────────────────────────

test('Dashboard auto-rec card hidden for cold_start (patternsEnabled=false)', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
    // Cold start: 0 real sessions
    localStorage.removeItem('logs');
    // Stale pattern present — should not reach the dashboard banner
    localStorage.setItem('applied-patterns', JSON.stringify([
      { type: 'SKIP_DAY', day: 'Marți', skipRate: 88, confidence: 0.88, appliedAt: Date.now(),
        description: 'Marți are 88% skip rate — sesiune scurtată la esențiale' }
    ]));
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1200);

  const bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
  expect(bodyText).not.toMatch(/Am ajustat programul automat/i);
  expect(bodyText).not.toMatch(/Marți are 88%/i);
});

test('clearStalePatternsIfColdStart runs after initFirebaseSync (no false restore)', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
    // Single session = cold_start
    localStorage.setItem('logs', JSON.stringify([
      { ex: 'Lat Pulldown', w: 50, reps: 8, date: '2026-04-21', session: 'sess-1' }
    ]));
    localStorage.setItem('applied-patterns', JSON.stringify([
      { type: 'SKIP_DAY', day: 'Joi', skipRate: 100 }
    ]));
    localStorage.setItem('pattern-learning-cache', '{"stale":true}');
    localStorage.setItem('detected-patterns', '[]');
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  const applied   = await page.evaluate(() => localStorage.getItem('applied-patterns'));
  const cache     = await page.evaluate(() => localStorage.getItem('pattern-learning-cache'));
  const detected  = await page.evaluate(() => localStorage.getItem('detected-patterns'));

  expect(applied,   'applied-patterns cleared for cold_start').toBeNull();
  expect(cache,     'pattern-learning-cache cleared for cold_start').toBeNull();
  expect(detected,  'detected-patterns cleared for cold_start').toBeNull();
});

test('Mature user (initial tier) still sees patterns when enabled', async ({ page }) => {
  // 8 sessions over 14 days = INITIAL tier — patterns enabled at >=0.70 confidence
  const sessions = Array.from({ length: 8 }, (_, i) => ({
    ex: 'Lat Pulldown', w: 50, reps: 8, date: `2026-04-${String(i + 1).padStart(2, '0')}`,
    session: `sess-${i}`
  }));

  await page.addInitScript((sessionsData) => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
    localStorage.setItem('logs', JSON.stringify(sessionsData));
    // Pattern with high confidence (>=0.70) should pass the INITIAL tier filter
    localStorage.setItem('applied-patterns', JSON.stringify([
      { type: 'EARLY_END', earlyEndRate: 75, confidence: 0.75, appliedAt: Date.now(), description: '75% sesiuni terminate devreme' }
    ]));
  }, sessions);

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(800);

  // Applied patterns should NOT be cleared (this is initial tier, not cold_start)
  const appliedPatterns = await page.evaluate(() => localStorage.getItem('applied-patterns'));
  expect(appliedPatterns, 'Patterns should be preserved for initial tier user').not.toBeNull();
});
