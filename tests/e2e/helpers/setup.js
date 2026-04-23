// ══ E2E Setup Helpers ════════════════════════════════════════════════════════

/**
 * Inject a user fixture into localStorage via addInitScript.
 * Must be called before page.goto().
 *
 * @param {import('@playwright/test').Page} page
 * @param {Object} userData - key/value pairs to set in localStorage
 *   Special key `_suppressFirebaseSync` sets window._suppressFirebaseSync = true.
 */
export async function setupUser(page, userData) {
  await page.addInitScript((data) => {
    // Always suppress Firebase to avoid network calls in tests
    window._suppressFirebaseSync = true;

    Object.entries(data).forEach(([key, value]) => {
      if (key === '_suppressFirebaseSync') return; // handled above
      if (typeof value === 'object' && value !== null) {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, String(value));
      }
    });
  }, userData);
}

/**
 * Clear localStorage and reload, ensuring a clean slate between tests.
 * @param {import('@playwright/test').Page} page
 */
export async function resetBetweenTests(page) {
  await page.evaluate(() => {
    localStorage.clear();
    window._suppressFirebaseSync = true;
  });
}
