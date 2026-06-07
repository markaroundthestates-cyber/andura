// Track 7 §7.2 — Playwright auth project setup (REAL Firebase sign-in).
//
// Establishes a genuine authenticated session for the deep journey specs by:
//   1. Minting a Firebase custom token for the TEST account via the Admin SA
//      (server-side, in this Node setup — the SA private key never touches the
//      page or the repo).
//   2. Exchanging it for a real idToken + refreshToken via the public
//      `accounts:signInWithCustomToken` Identity Toolkit REST endpoint.
//   3. Seeding the exact localStorage keys src/auth.js reads (firebase-id-token /
//      firebase-uid / firebase-refresh-token / firebase-id-token-expiry) PLUS a
//      complete onboarding profile, so ProtectedRoute's full gate passes
//      (auth + onboarding-complete) and the app boots straight into the app shell.
//   4. Saving storageState to playwright/.auth/user.json for the deep specs to reuse.
//
// This is a REAL session — getAuthState()/isAuthenticated() resolve true and the
// idToken is a valid Firebase token (not a stub marker). Pre-fix this file only
// wrote a custom-token marker and never signed in, so every deep spec skipped.
//
// ── Env vars ────────────────────────────────────────────────────────────────
//   FIREBASE_SERVICE_ACCOUNT         INLINE Admin SA JSON (raw JSON or base64) —
//                                    the CI path (GitHub Actions secret). Takes
//                                    precedence over the file path below. The key
//                                    is parsed in-memory; never written to disk.
//   GOOGLE_APPLICATION_CREDENTIALS   absolute path to the Firebase Admin SA JSON
//                                    (lives OUTSIDE the repo, gitignored). The
//                                    LOCAL run path (~/.andura-admin/). Used when
//                                    FIREBASE_SERVICE_ACCOUNT is absent.
//   PLAYWRIGHT_AUTH_TEST_EMAIL       test account email. Defaults to the seeded
//                                    throwaway test account (mark.aroundthestates).
//                                    NEVER the primary account.
//   PLAYWRIGHT_AUTH_TEST_UID         optional — skips the getUserByEmail lookup.
//   PLAYWRIGHT_FIREBASE_API_KEY      public web API key for the REST exchange.
//                                    Optional — if absent we self-source it from
//                                    the loaded app bundle (the same public key
//                                    every visitor's browser already downloads).
//
// Graceful skip when no SA is present (CI prod-smoke + local dev without the SA
// still run the unauthenticated specs). See _AUDIT_E2E_2026-06-07.md §3 + §5.
//
// ── Wiring this into CI (closes the P0 core-loop gap) ─────────────────────────
// The live QA workflow (.github/workflows/qa-report.yml) runs SA-free, so these
// deep specs skip there by design. To get the automated gym test green in CI,
// add a job (or extend qa-report) with the SA available:
//   1. Add a GitHub Actions repo secret  FIREBASE_ADMIN_SA  = the full contents
//      of the Admin service-account JSON (the one in ~/.andura-admin/). Treat it
//      as a secret — it is NOT the public web API key.
//   2. In the job, write it to a file and point GOOGLE_APPLICATION_CREDENTIALS at
//      it, e.g.:
//        - run: printf '%s' "$SA" > "$RUNNER_TEMP/sa.json"
//          env: { SA: '${{ secrets.FIREBASE_ADMIN_SA }}' }
//        - run: npx playwright test tests/auth.setup.ts tests/core-loop.spec.ts tests/aerobic-log.spec.ts
//          env:
//            GOOGLE_APPLICATION_CREDENTIALS: ${{ runner.temp }}/sa.json
//            PLAYWRIGHT_FIREBASE_API_KEY:    ${{ secrets.VITE_FIREBASE_API_KEY }}  # public web key
//            PLAYWRIGHT_BASE_URL:            https://andura.app   # or omit to run the local preview build
//   Recommend a SEPARATE authenticated-nightly job so the public prod smoke stays
//   SA-free. Aerobic/#45 specs need the deployed build to carry the date-picker
//   (or run them against the local preview build, which always has current code).

import { test as setup, expect } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { STORAGE_STATE } from './auth.storageState';

export { STORAGE_STATE };

// The throwaway TEST account — seeded for tests (reference_andura_account_roles).
// NEVER the primary maziludaniel... account (real gym data).
const DEFAULT_TEST_EMAIL = 'mark.aroundthestates@gmail.com';

// Identity Toolkit custom-token exchange endpoint (public; key is the web API key).
const SIGNIN_CUSTOM_TOKEN_URL =
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken';

// Auth localStorage keys — MUST match src/auth.js AUTH_STORAGE_KEYS verbatim.
const AUTH_KEYS = {
  idToken: 'firebase-id-token',
  uid: 'firebase-uid',
  refreshToken: 'firebase-refresh-token',
  expiry: 'firebase-id-token-expiry',
} as const;

// A complete gym-mode onboarding profile so ProtectedRoute's onboardingCompleted
// gate passes and the engine has a real baseline (key + version match
// src/react/stores/onboardingStore.ts: name 'wv2-onboarding-store', version 7).
const ONBOARDED_PROFILE = {
  state: {
    data: {
      age: 30,
      sex: 'm',
      goal: 'masa',
      frequency: '3',
      experience: 'intermediar',
      weight: 80,
      height: 180,
      trainingType: 'gym',
      targetWeight: null,
      targetDate: null,
      focusPreset: 'balanced',
    },
    completed: true,
    completedAt: Date.now(),
  },
  version: 7,
};

// Parse the inline FIREBASE_SERVICE_ACCOUNT secret (raw JSON or base64-encoded
// JSON — detect by trying JSON.parse first, then base64). Returns the parsed SA
// object so cert() can consume it in-memory (the key never touches disk).
function parseInlineSA(raw: string): Record<string, unknown> {
  const tryParse = (s: string): Record<string, unknown> | null => {
    try {
      const o = JSON.parse(s);
      return o && typeof o === 'object' ? (o as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  };
  const direct = tryParse(raw.trim());
  if (direct) return direct;
  const decoded = tryParse(Buffer.from(raw.trim(), 'base64').toString('utf8'));
  if (decoded) return decoded;
  throw new Error('FIREBASE_SERVICE_ACCOUNT is neither valid JSON nor base64-encoded JSON');
}

setup('authenticate via Firebase Admin custom token (if SA present)', async ({ page }) => {
  // SA source: inline secret (CI) takes precedence over the local file path.
  const saInline = process.env['FIREBASE_SERVICE_ACCOUNT'];
  const saPath = process.env['GOOGLE_APPLICATION_CREDENTIALS'];
  if (!saInline && !saPath) {
    setup.skip(
      true,
      'auth setup skipped — set FIREBASE_SERVICE_ACCOUNT (CI secret) or GOOGLE_APPLICATION_CREDENTIALS (local SA JSON path) to enable authenticated deep-journey specs. Unauthenticated specs (magic-link, public smoke) still run.',
    );
    return;
  }
  if (!saInline && saPath && !existsSync(saPath)) {
    setup.skip(true, `auth setup skipped — service account file not found at ${saPath}`);
    return;
  }

  // ── 1. Mint a custom token via Admin (private key stays server-side). ───────
  // Dynamic import so firebase-admin is only required when a SA is actually wired.
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  if (!getApps().length) {
    // Inline secret → parse + cert() the object (in-memory). Else cert(filePath).
    const credential = saInline
      ? cert(parseInlineSA(saInline) as Parameters<typeof cert>[0])
      : cert(saPath as string);
    initializeApp({ credential });
  }

  const email = process.env['PLAYWRIGHT_AUTH_TEST_EMAIL'] || DEFAULT_TEST_EMAIL;
  const uid: string =
    process.env['PLAYWRIGHT_AUTH_TEST_UID'] || (await getAuth().getUserByEmail(email)).uid;
  const customToken = await getAuth().createCustomToken(uid);

  // ── 2. Load the app, source the public web API key, exchange for an idToken. ─
  // signInWithCustomToken does NOT return localId, so the uid comes from the
  // Admin lookup above (the custom token's subject) — never the response body.
  await page.goto('/');

  type ExchangeResult =
    | { ok: true; idToken: string; refreshToken: string; expiresIn: number }
    | { ok: false; error: string };

  const envApiKey = process.env['PLAYWRIGHT_FIREBASE_API_KEY'] || null;
  const session: ExchangeResult = await page.evaluate(
    async ({ token, signinUrl, envKey }) => {
      // Source the web API key: env override first, else self-extract from the
      // already-loaded bundle (the same public key every browser downloads).
      let apiKey: string | null = envKey;
      if (!apiKey) {
        const w = window as unknown as { __FIREBASE_API_KEY?: string };
        apiKey = w.__FIREBASE_API_KEY ?? null;
      }
      if (!apiKey) {
        for (const s of Array.from(document.scripts)) {
          if (!s.src) continue;
          try {
            const js = await (await fetch(s.src)).text();
            const m = js.match(/AIza[0-9A-Za-z_\-]{30,}/);
            if (m) {
              apiKey = m[0];
              break;
            }
          } catch {
            /* ignore — try the next script */
          }
        }
      }
      if (!apiKey) return { ok: false, error: 'web_api_key_not_found' };

      const r = await fetch(`${signinUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, returnSecureToken: true }),
      });
      const data = await r.json();
      if (!r.ok || !data.idToken) {
        return { ok: false, error: data?.error?.message || `http_${r.status}` };
      }
      return {
        ok: true,
        idToken: data.idToken as string,
        refreshToken: data.refreshToken as string,
        expiresIn: Number(data.expiresIn) || 3600,
      };
    },
    { token: customToken, signinUrl: SIGNIN_CUSTOM_TOKEN_URL, envKey: envApiKey },
  );

  expect(
    session.ok,
    `custom-token exchange failed: ${session.ok ? '' : session.error}`,
  ).toBe(true);
  if (!session.ok) return; // type narrow

  // ── 3. Seed the exact auth + onboarding localStorage the app reads on boot. ─
  await page.evaluate(
    ({ keys, idToken, refreshToken, expiry, uid: u, onboarding }) => {
      window.localStorage.setItem(keys.idToken, idToken);
      window.localStorage.setItem(keys.refreshToken, refreshToken);
      window.localStorage.setItem(keys.uid, u);
      window.localStorage.setItem(keys.expiry, String(expiry));
      window.localStorage.setItem('wv2-onboarding-store', JSON.stringify(onboarding));
    },
    {
      keys: AUTH_KEYS,
      idToken: session.idToken,
      refreshToken: session.refreshToken,
      expiry: Date.now() + session.expiresIn * 1000,
      uid: uid as string,
      onboarding: ONBOARDED_PROFILE,
    },
  );

  // ── 4. Verify the gate would pass + persist storageState. ───────────────────
  await page.goto('/app');
  await expect(page).toHaveURL(/\/app/, { timeout: 15000 });

  mkdirSync(dirname(STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE });
});
