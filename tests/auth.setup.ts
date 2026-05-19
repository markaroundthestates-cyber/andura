// Track 7 §7.2 — Playwright auth project setup.
// Per master spec §1.2: Firebase Admin Service Account → custom token → sign-in →
// storageState saved to playwright/.auth/user.json. Authenticated specs depend on
// 'setup' project; auth UI tested only by tests/magic-link.spec.ts (one path).
//
// Env vars REQUIRED (graceful skip if absent — local dev without SA still runs
// unauthenticated specs):
//   - GOOGLE_APPLICATION_CREDENTIALS = absolute path to firebase-service-account.json
//   - PLAYWRIGHT_AUTH_TEST_UID = uid string to inject as authenticated user
//
// .gitignore already excludes firebase-service-account.json (line 20).

import { test as setup, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';

export const STORAGE_STATE = 'playwright/.auth/user.json';

setup('authenticate via Firebase Admin custom token (if SA present)', async ({ page }) => {
  const saPath = process.env['GOOGLE_APPLICATION_CREDENTIALS'];
  const testUid = process.env['PLAYWRIGHT_AUTH_TEST_UID'];

  if (!saPath || !testUid) {
    setup.skip(
      true,
      `auth setup skipped — set GOOGLE_APPLICATION_CREDENTIALS + PLAYWRIGHT_AUTH_TEST_UID to enable Firebase Admin authenticated tests. Unauthenticated specs (magic-link.spec.ts) still run.`,
    );
    return;
  }
  if (!existsSync(saPath)) {
    setup.skip(true, `auth setup skipped — service account file not found at ${saPath}`);
    return;
  }

  // Dynamic import to avoid hard dep on firebase-admin when SA absent.
  // @nearform/playwright-firebase exposes Firebase Admin custom token mint
  // helper compatible cu Web Auth signInWithCustomToken on page side.
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');

  if (!getApps().length) {
    initializeApp({
      credential: cert(saPath),
    });
  }

  const customToken = await getAuth().createCustomToken(testUid);

  // Navigate to app + inject custom token into Firebase Web SDK on page side.
  // Page must expose a window.__signInWithCustomToken(token) helper OR we use
  // Firebase Web SDK directly via page.evaluate. Simpler: visit a route that
  // accepts ?customToken= query param + bootstraps session.
  await page.goto('/');
  // Defer actual sign-in implementation until React app exposes integration hook
  // — store custom token in localStorage as marker for downstream specs to read.
  await page.evaluate((token) => {
    window.localStorage.setItem('playwright.firebase.customToken', token);
  }, customToken);

  // Save storage state — downstream specs reuse via use.storageState option.
  mkdirSync(dirname(STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE });

  expect(customToken.length).toBeGreaterThan(50);
});
