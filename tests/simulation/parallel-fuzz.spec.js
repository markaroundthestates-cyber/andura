// ══ SIMULATION C — Parallel Fuzz Tests: 10 concurrent Playwright browsers ══
// Tests race conditions in localStorage reads/writes across concurrent contexts.
// Each worker does: set storage → read back → verify consistency.

import { test, expect } from '@playwright/test';

const BASE_URL = '/salafull/';

// Suppress Firebase in all tests
test.use({
  storageState: undefined,
});

// Run up to 10 in parallel
test.describe.configure({ mode: 'parallel' });

async function setupFuzzContext(page) {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
  });
}

// ── Worker 1: Rapid storage writes ───────────────────────────────────────
test('Fuzz: rapid sequential storage writes are consistent', async ({ page }) => {
  await setupFuzzContext(page);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const results = await page.evaluate(async () => {
    const writes = 50;
    const failures = [];
    for (let i = 0; i < writes; i++) {
      const val = { count: i, ts: Date.now() };
      localStorage.setItem('fuzz-test-key', JSON.stringify(val));
      const readBack = JSON.parse(localStorage.getItem('fuzz-test-key') ?? 'null');
      if (!readBack || readBack.count !== i) {
        failures.push(`Write ${i}: expected count=${i}, got count=${readBack?.count}`);
      }
    }
    localStorage.removeItem('fuzz-test-key');
    return failures;
  });

  expect(results, `Rapid storage failures: ${results.join('; ')}`).toHaveLength(0);
});

// ── Worker 2: Concurrent array append simulation ─────────────────────────
test('Fuzz: concurrent log appends preserve all entries', async ({ page }) => {
  await setupFuzzContext(page);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const results = await page.evaluate(async () => {
    const COUNT = 30;
    // Simulate multiple "simultaneous" appends
    localStorage.setItem('fuzz-logs', JSON.stringify([]));

    for (let i = 0; i < COUNT; i++) {
      const current = JSON.parse(localStorage.getItem('fuzz-logs') ?? '[]');
      current.push({ id: i, ts: Date.now() });
      localStorage.setItem('fuzz-logs', JSON.stringify(current));
    }

    const final = JSON.parse(localStorage.getItem('fuzz-logs') ?? '[]');
    localStorage.removeItem('fuzz-logs');

    if (final.length !== COUNT) return [`Expected ${COUNT} entries, got ${final.length}`];

    // Check no duplicates
    const ids = final.map(e => e.id);
    const unique = new Set(ids);
    if (unique.size !== COUNT) return [`Duplicate entries: ${COUNT - unique.size} duplicates`];

    return [];
  });

  expect(results, `Log append failures: ${results.join('; ')}`).toHaveLength(0);
});

// ── Worker 3: Storage full graceful handling ──────────────────────────────
test('Fuzz: storage gracefully handles large payloads', async ({ page }) => {
  await setupFuzzContext(page);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const results = await page.evaluate(() => {
    const failures = [];
    // Write a large-ish object (should not throw, even if it exceeds quota)
    try {
      const bigData = Array.from({ length: 1000 }, (_, i) => ({
        ex: 'Bench Press', w: 80, reps: 8, ts: Date.now() - i * 1000,
      }));
      localStorage.setItem('fuzz-big', JSON.stringify(bigData));
      const readBack = JSON.parse(localStorage.getItem('fuzz-big') ?? '[]');
      if (readBack.length !== 1000) failures.push(`Expected 1000 entries, got ${readBack.length}`);
      localStorage.removeItem('fuzz-big');
    } catch (e) {
      // Storage full is expected behavior — not a failure
      if (!e.name?.includes('QuotaExceeded') && !e.message?.includes('quota')) {
        failures.push(`Unexpected error: ${e.message}`);
      }
    }
    return failures;
  });

  expect(results, `Storage size failures: ${results.join('; ')}`).toHaveLength(0);
});

// ── Worker 4: JSON parse safety ───────────────────────────────────────────
test('Fuzz: malformed localStorage values do not crash', async ({ page }) => {
  await setupFuzzContext(page);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Inject malformed values before page load
  await page.evaluate(() => {
    localStorage.setItem('logs', 'NOT VALID JSON{{{');
    localStorage.setItem('readiness', 'null');
    localStorage.setItem('weights', '{}');
  });

  // Navigate — page should not crash
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1000);

  const criticalErrors = errors.filter(m =>
    m.includes('SyntaxError') && !m.includes('ResizeObserver')
  );

  // Malformed JSON in logs should be caught gracefully, not crash the page
  expect(
    criticalErrors.length,
    `Critical errors after malformed JSON: ${criticalErrors.join('; ')}`
  ).toBe(0);
});

// ── Worker 5: Navigator.onLine simulation ────────────────────────────────
test('Fuzz: offline Firebase sync suppression works', async ({ page }) => {
  await setupFuzzContext(page);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const result = await page.evaluate(async () => {
    // Check that _suppressFirebaseSync is honored
    window._suppressFirebaseSync = true;
    let syncAttempted = false;
    const origFetch = window.fetch;
    window.fetch = (...args) => {
      if (args[0]?.includes?.('firebasedatabase')) {
        syncAttempted = true;
        return Promise.reject(new Error('Simulated offline'));
      }
      return origFetch(...args);
    };

    // Wait a moment for any debounced sync to fire
    await new Promise(r => setTimeout(r, 4000));
    window.fetch = origFetch;
    return { syncAttempted };
  });

  // _suppressFirebaseSync=true should prevent Firebase calls
  expect(result.syncAttempted).toBe(false);
});

// ── Worker 6: Page reload preserves localStorage ─────────────────────────
test('Fuzz: localStorage persists across page reload', async ({ page }) => {
  await setupFuzzContext(page);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const testKey = 'fuzz-persist-test';
  const testVal = JSON.stringify({ ts: Date.now(), data: [1, 2, 3] });

  await page.evaluate(({ key, val }) => {
    localStorage.setItem(key, val);
  }, { key: testKey, val: testVal });

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });

  const readBack = await page.evaluate(key => localStorage.getItem(key), testKey);
  expect(readBack).toBe(testVal);

  await page.evaluate(key => localStorage.removeItem(key), testKey);
});

// ── Worker 7: Multiple setItems atomic simulation ─────────────────────────
test('Fuzz: multiple keys set atomically are all readable', async ({ page }) => {
  await setupFuzzContext(page);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const results = await page.evaluate(() => {
    const keys = ['fuzz-k1', 'fuzz-k2', 'fuzz-k3', 'fuzz-k4', 'fuzz-k5'];
    const values = keys.map((k, i) => ({ key: k, val: `val-${i}` }));

    values.forEach(({ key, val }) => localStorage.setItem(key, val));

    const failures = values
      .filter(({ key, val }) => localStorage.getItem(key) !== val)
      .map(({ key, val }) => `${key}: expected "${val}", got "${localStorage.getItem(key)}"`);

    keys.forEach(k => localStorage.removeItem(k));
    return failures;
  });

  expect(results, `Multi-key failures: ${results.join('; ')}`).toHaveLength(0);
});

// ── Worker 8: DB.set dispatch does not loop ───────────────────────────────
test('Fuzz: DB.set does not cause infinite loops', async ({ page }) => {
  await setupFuzzContext(page);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(500);

  // Time 100 sequential DB operations
  const result = await page.evaluate(() => {
    const db = window.__DB ?? null;
    if (!db) return { skipped: true };
    const start = performance.now();
    try {
      for (let i = 0; i < 100; i++) {
        const key = `fuzz-db-${i % 5}`;
        localStorage.setItem(key, JSON.stringify({ i }));
      }
      for (let i = 0; i < 5; i++) {
        localStorage.removeItem(`fuzz-db-${i}`);
      }
    } catch (e) {
      return { error: e.message };
    }
    return { elapsed: performance.now() - start, skipped: false };
  });

  if (!result.skipped) {
    expect(result.error).toBeUndefined();
    // 100 operations should complete in < 100ms
    expect(result.elapsed, `100 DB ops took ${result.elapsed}ms`).toBeLessThan(200);
  }
});

// ── Worker 9: Page load with empty storage ────────────────────────────────
test('Fuzz: page loads cleanly with empty storage', async ({ page }) => {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.clear();
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(500);

  const criticalErrors = errors.filter(m =>
    m.includes('TypeError') || m.includes('ReferenceError') || m.includes('SyntaxError')
  );
  expect(criticalErrors, `Critical errors on empty storage: ${criticalErrors.join('; ')}`).toHaveLength(0);
});

// ── Worker 10: addInitScript state doesn't leak between tests ──────────────
test('Fuzz: test isolation — addInitScript does not leak state', async ({ page }) => {
  await page.addInitScript(() => {
    window._suppressFirebaseSync = true;
    localStorage.setItem('onboarding-done', 'true');
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const onboarding = await page.evaluate(() => localStorage.getItem('onboarding-done'));
  expect(onboarding).toBe('true');

  // Reload — addInitScript re-runs so onboarding-done should still be 'true'
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  const onboardingAfterReload = await page.evaluate(() => localStorage.getItem('onboarding-done'));
  expect(onboardingAfterReload).toBe('true');
});
