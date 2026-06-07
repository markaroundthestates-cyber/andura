// Aerobic class logging incl. the BACKDATED date-picker (decision #45).
// _AUDIT_E2E_2026-06-07 §4 — guard the new retroactive-logging feature
// end-to-end: open the class logger, pick a PAST day, log a class, and assert
// it lands on that day's list with the "logging for a past day" hint shown.
//
// The aerobic dashboard only renders for a class-training profile, so this spec
// re-seeds the onboarding store to trainingType 'aerobic' on top of the
// authenticated session before loading the Antrenor tab.

import { test, expect, type Page } from '@playwright/test';
import { STORAGE_STATE } from './auth.storageState';
import { existsSync } from 'node:fs';

// Skip guard keys on the SA env (collection-time) — the storageState file is
// written by the 'setup' project at run-time. See core-loop.spec.ts for the
// rationale.
const hasSA = !!process.env['GOOGLE_APPLICATION_CREDENTIALS'];
test.skip(
  !hasSA,
  'aerobic-log requires a Firebase Admin SA (set GOOGLE_APPLICATION_CREDENTIALS so auth.setup.ts can mint a real session).',
);
test.use({ storageState: existsSync(STORAGE_STATE) || hasSA ? STORAGE_STATE : undefined });

// Acknowledge the first-visit medical disclaimer + wait for its backdrop to
// detach (it intercepts pointer events until dismissed).
async function dismissDisclaimer(page: Page): Promise<void> {
  const ack = page.getByTestId('disclaimer-acknowledge');
  await ack.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
  if (await ack.count()) {
    await ack.click({ timeout: 5000 }).catch(() => {});
  }
  await page
    .getByTestId('disclaimer-backdrop')
    .waitFor({ state: 'detached', timeout: 5000 })
    .catch(() => {});
}

// Block all Firebase RTDB traffic so the cloud restore can't overwrite the
// aerobic profile we seed locally (the test account's real cloud profile is gym)
// and so these write-heavy tests never touch real cloud data. The aerobic store
// is localStorage-only when sync is unavailable — exactly what we want here.
async function blockCloud(page: Page): Promise<void> {
  await page.route(/firebasedatabase\.app|firebaseio\.com/, (route) => route.abort());
}

// Re-seed the persisted onboarding store to aerobic mode so Antrenor renders the
// AerobicCoach dashboard (key + version match src/react/stores/onboardingStore.ts).
async function seedAerobicProfile(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const profile = {
      state: {
        data: {
          age: 35,
          sex: 'f',
          goal: 'mentenanta',
          frequency: '3',
          experience: 'incepator',
          weight: 65,
          height: 168,
          trainingType: 'aerobic',
          targetWeight: null,
          targetDate: null,
          focusPreset: 'balanced',
        },
        completed: true,
        completedAt: Date.now(),
      },
      version: 7,
    };
    window.localStorage.setItem('wv2-onboarding-store', JSON.stringify(profile));
  });
}

// Serial — both tests log to the same test account's aerobic history.
test.describe.configure({ mode: 'serial' });

test.describe('Aerobic class logging — backdated date-picker (#45)', () => {
  test('log a BACKDATED class → appears on the past day with a backdate hint', async ({ page }) => {
    await blockCloud(page);
    await seedAerobicProfile(page);
    await page.goto('/app/antrenor');
    await dismissDisclaimer(page);

    // Aerobic dashboard renders for the class profile.
    await expect(page.getByTestId('aerobic-coach')).toBeVisible({ timeout: 20000 });

    // Open the inline class logger.
    await page.getByTestId('aerobic-log-cta').click();
    await expect(page.getByTestId('aerobic-logger')).toBeVisible({ timeout: 10000 });

    // BACKDATE: set the date input to 3 days ago (within the loggable backlog
    // window; max=today is enforced by the input). YYYY-MM-DD local.
    const past = new Date();
    past.setDate(past.getDate() - 3);
    const pastISO = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;

    const dateInput = page.getByTestId('aerobic-date-input');
    await dateInput.fill(pastISO);
    // The backdate hint flips to the "logging for a past day" copy (RO or EN
    // depending on the active locale).
    await expect(page.getByTestId('aerobic-date-hint')).toHaveText(/zi trecuta|past day/i);

    // Pick a class type + a duration, save.
    await page.getByTestId('aerobic-type-aerobic').click();
    await page.getByTestId('aerobic-minutes-input').fill('45');
    await page.getByTestId('aerobic-logger-save').click();

    // The logger closes and the selected (past) day's list now has an entry.
    await expect(page.getByTestId('aerobic-logger')).toHaveCount(0, { timeout: 10000 });
    const list = page.getByTestId('aerobic-today-list');
    await expect(list).toBeVisible({ timeout: 10000 });
    await expect(list.locator('[data-testid^="aerobic-today-item-"]')).not.toHaveCount(0);

    // The week-count reflects the new class (>= 1).
    const weekVal = (await page.getByTestId('aerobic-week-val').textContent().catch(() => '')) ?? '';
    expect.soft(/[1-9]/.test(weekVal), `week count = "${weekVal}"`).toBe(true);
  });

  test('log a class for TODAY (default date) → appears immediately', async ({ page }) => {
    await blockCloud(page);
    await seedAerobicProfile(page);
    await page.goto('/app/antrenor');
    await dismissDisclaimer(page);
    await expect(page.getByTestId('aerobic-coach')).toBeVisible({ timeout: 20000 });

    await page.getByTestId('aerobic-log-cta').click();
    await expect(page.getByTestId('aerobic-logger')).toBeVisible({ timeout: 10000 });
    // Default date is today → the hint is the "today" copy, not backdated
    // (RO "Azi" / EN "Today").
    await expect(page.getByTestId('aerobic-date-hint')).toHaveText(/^(azi|today)$/i);

    await page.getByTestId('aerobic-type-spinning').click();
    await page.getByTestId('aerobic-minutes-input').fill('50');
    await page.getByTestId('aerobic-logger-save').click();

    await expect(page.getByTestId('aerobic-logger')).toHaveCount(0, { timeout: 10000 });
    await expect(
      page.getByTestId('aerobic-today-list').locator('[data-testid^="aerobic-today-item-"]'),
    ).not.toHaveCount(0);
  });
});
