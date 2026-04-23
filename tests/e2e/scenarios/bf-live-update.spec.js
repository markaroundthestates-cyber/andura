// ══ BF Override Live Update Test ═════════════════════════════════════════════
import { test, expect } from '@playwright/test';
import { setupUser } from '../helpers/setup.js';
import { WITH_HISTORY } from '../fixtures/users.js';

const BASE_URL = '/salafull/';

test('BF override updates UI without page reload', async ({ page }) => {
  await setupUser(page, WITH_HISTORY);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 });

  // Dispatch storage event to simulate setBFOverride() being called
  await page.evaluate(() => {
    localStorage.setItem('bf-override', '20.5');
    window.dispatchEvent(new StorageEvent('storage', { key: 'bf-override', newValue: '20.5' }));
  });

  await page.waitForTimeout(500);

  // The bf-override-note element should reflect the new value
  const noteText = await page.evaluate(() => {
    const el = document.getElementById('bf-override-note');
    return el ? el.textContent : '';
  });

  // After dispatch, plan.js listener triggers renderProg() which updates bf-override-note
  expect(noteText).toContain('20.5');
});
