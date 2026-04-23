// ══ E2E Storage Helpers ══════════════════════════════════════════════════════
import { expect } from '@playwright/test';

/**
 * Returns the full localStorage state as a plain object.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<Record<string, string>>}
 */
export async function getStorageState(page) {
  return page.evaluate(() => {
    const result = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      result[key] = localStorage.getItem(key);
    }
    return result;
  });
}

/**
 * Assert that a localStorage key is absent.
 * @param {import('@playwright/test').Page} page
 * @param {string} key
 */
export async function expectNoKey(page, key) {
  const value = await page.evaluate((k) => localStorage.getItem(k), key);
  expect(value, `Expected localStorage key "${key}" to be absent`).toBeNull();
}

/**
 * Set a localStorage key (evaluated in page context).
 * @param {import('@playwright/test').Page} page
 * @param {string} key
 * @param {unknown} value - will be JSON-serialized if object, string otherwise
 */
export async function setKey(page, key, value) {
  await page.evaluate(({ k, v }) => {
    localStorage.setItem(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }, { k: key, v: value });
}
