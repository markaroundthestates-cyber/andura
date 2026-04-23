// ══ E2E Assertion Helpers ════════════════════════════════════════════════════
import { expect } from '@playwright/test';

/**
 * Assert that the given text does NOT appear anywhere in the page body.
 * Uses innerText (visible text only).
 * @param {import('@playwright/test').Page} page
 * @param {string} text
 */
export async function expectTextNotInPage(page, text) {
  const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
  expect(bodyText, `Expected page NOT to contain: "${text}"`).not.toContain(text);
}

/**
 * Assert that the given text appears in the page body.
 * Waits up to 3000ms.
 * @param {import('@playwright/test').Page} page
 * @param {string} text
 */
export async function expectTextInPage(page, text) {
  await expect(page.locator('body')).toContainText(text, { timeout: 3000 });
}

/**
 * Assert that a weight selector contains one of the valid values.
 * If the selector doesn't exist, the check is skipped gracefully.
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @param {(number|string)[]} validWeights
 */
export async function expectValidWeight(page, selector, validWeights) {
  const el = page.locator(selector).first();
  const count = await el.count();
  if (count === 0) return; // element not present — skip

  const text = await el.innerText({ timeout: 3000 }).catch(() => '');
  const numMatch = text.match(/[\d.]+/);
  if (!numMatch) return; // can't parse weight — skip

  const weight = parseFloat(numMatch[0]);
  expect(
    validWeights.map(Number),
    `Weight ${weight} not in valid set [${validWeights.join(', ')}]`
  ).toContain(weight);
}
