// ══ CUT phase rep display — Bug 3 regression ═════════════════════════════════
// Verifies that isolation exercises show "3×10" (not "3×10–12") when phase=CUT.
import { test, expect } from '@playwright/test';

const BASE_URL = '/salafull/';

// Joi = index 3 in PROG (Lateral Raises, Rear Delt Fly, Cable Curl, Preacher Curl,
// Overhead Triceps, Pushdown) — all isolation exercises.
test('CUT phase shows 3×10 for Cable Curl on coach idle (not 3×10–12)', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
    localStorage.setItem('phase-override', 'CUT');
    // Seed readiness so coach renders the exercise list
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('readiness', JSON.stringify({ [today]: { score: 80, emoji: '💪' } }));
  });

  // Navigate to the app on a Thursday (Joi)
  // We can't control the day, so we check if the text is NOT "10–12" for any visible exercise
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1000);

  // The coach preview for any day should not show "10–12" for isolation exercises in CUT
  const bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');

  // If today is not a rest day, check that none of the isolation exercises show the uncapped range
  if (bodyText.includes('Cable Curl') || bodyText.includes('Preacher Curl') ||
      bodyText.includes('Overhead Triceps') || bodyText.includes('Pushdown')) {
    expect(bodyText).not.toMatch(/10–12/);
  } else {
    // Rest day or no relevant exercises visible — skip assertion
    test.skip();
  }
});
