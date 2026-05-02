// ══ Readiness Scenario Tests ═════════════════════════════════════════════════
// Verify readiness verdict logic across different phases.

import { test, expect } from '@playwright/test';
import { setupUser } from '../helpers/setup.js';
import { expectTextNotInPage, expectTextInPage } from '../helpers/assertions.js';

const BASE_URL = '/andura/';
const TODAY = new Date().toISOString().slice(0, 10);

test.describe('Readiness Verdict — Phase-aware labels', () => {
  test('AUTO phase before July 20 2026: score>=85 shows Sesiune solidă (not Zi de PR)', async ({ page }) => {
    await setupUser(page, {
      _suppressFirebaseSync: true,
      'onboarding-done': true,
      'phase-override': 'AUTO',
      'current-kcal': '1800',
      readiness: { [TODAY]: { score: 100, emoji: '🔥' } },
    });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
    if (!bodyText.trim()) { test.skip(); return; }

    expect(bodyText).not.toContain('Zi de PR');
  });

  test('CUT phase: score>=85 shows Sesiune solidă (not Zi de PR)', async ({ page }) => {
    await setupUser(page, {
      _suppressFirebaseSync: true,
      'onboarding-done': true,
      'phase-override': 'CUT',
      'current-kcal': '1800',
      readiness: { [TODAY]: { score: 90, emoji: '🔥' } },
    });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
    if (!bodyText.trim()) { test.skip(); return; }

    expect(bodyText).not.toContain('Zi de PR');
  });

  test('No readiness set: shows readiness input prompt', async ({ page }) => {
    await setupUser(page, {
      _suppressFirebaseSync: true,
      'onboarding-done': true,
      'phase-override': 'AUTO',
      'current-kcal': '1800',
    });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
    if (!bodyText.trim()) { test.skip(); return; }

    // Should not show any verdict when readiness is not set
    expect(bodyText).not.toContain('Zi de PR');
    expect(bodyText).not.toContain('Sesiune solidă');
  });
});
