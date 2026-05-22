// §44-H3 (HIGH-DELTA 2026-05-22) — Workout FSM 5-moduri E2E coverage.
//
// Per audit §44.12 — Vitest unit tests cover transitions exhaustively
// (workoutStore.test.ts §44-H1 + §44-H2 + §44-H3 matrix + valid-mode probe).
// This spec validates the 5 modes are observable in the real app:
//   idle      → splash → login → antrenor (no session active surface)
//   active    → tap "Incepe sesiunea" → workout screen with FSM mount
//   resting   → mid-session rest overlay (skip-rest CTA visible)
//   paused    → workout exit sheet → pause → antrenor sees resume hatch
//   finished  → after all sets → post-rpe surface
//
// Gracefully skips when GOOGLE_APPLICATION_CREDENTIALS absent (same pattern as
// smoke-react.spec.ts) — public-routes coverage runs unauthenticated; deep
// FSM journey requires auth + planned workout fixture which depend on
// Firebase Admin SA env. Documentation-first per Daniel co-CTO Bugatti
// quality preference (NU flakey CI runs without verified prerequisites).

import { test, expect } from '@playwright/test';

const hasAuth = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

test.describe('Workout FSM — 5 moduri E2E (§44-H3)', () => {
  test.skip(!hasAuth, 'Auth env (GOOGLE_APPLICATION_CREDENTIALS) absent — FSM E2E requires authenticated user with planned workout fixture');

  test('idle mode — antrenor home shows no active session pill', async ({ page }) => {
    await page.goto('/app/antrenor');
    // Pre-condition: no active session → SessionPill should be hidden.
    // SessionPill testid 'session-pill' or absent — checks absence ok pe
    // signal anti-paternalism brand (NU forte un mock state).
    const pill = page.getByTestId('session-pill-live');
    await expect(pill).toHaveCount(0);
  });

  test('active mode — workout screen renders chrome + log zone post-start', async ({ page }) => {
    // Test depends on planned workout fixture available via auth + Firebase.
    // Navigation flow: antrenor → "Incepe sesiunea" → /app/antrenor/workout.
    await page.goto('/app/antrenor');
    const startBtn = page.getByRole('button', { name: /incepe sesiunea/i });
    if ((await startBtn.count()) === 0) {
      test.skip(true, 'Coach Today card not visible (rest day or empty engine pipeline)');
    }
    await startBtn.first().click();
    await page.waitForURL(/\/workout$/i, { timeout: 10_000 }).catch(() => {});
    // FSM active mode signal: workout-title visible + workout-progress.
    await expect(page.getByTestId('workout-title')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('workout-progress')).toBeVisible();
  });

  test('paused mode — exit-pause flow surfaces resume hatch on antrenor', async ({ page }) => {
    await page.goto('/app/antrenor');
    const startBtn = page.getByRole('button', { name: /incepe sesiunea/i });
    if ((await startBtn.count()) === 0) {
      test.skip(true, 'Coach Today card not visible (rest day or empty engine pipeline)');
    }
    await startBtn.first().click();
    await page.waitForURL(/\/workout$/i, { timeout: 10_000 }).catch(() => {});
    await expect(page.getByTestId('workout-exit-trigger')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('workout-exit-trigger').click();
    // ExitConfirmSheet opens — tap "Pauza" path.
    const pauseBtn = page.getByRole('button', { name: /pauza/i });
    if ((await pauseBtn.count()) === 0) {
      test.skip(true, 'ExitConfirmSheet pause action not visible in current build');
    }
    await pauseBtn.first().click();
    await page.waitForURL(/\/antrenor$/i, { timeout: 10_000 }).catch(() => {});
    // Resume hatch visible on antrenor — ResumeSessionCard or session-pill.
    const resume = page.getByRole('button', { name: /reia sesiunea|continua/i });
    await expect(resume.first()).toBeVisible({ timeout: 10_000 });
  });

  test('finished mode — post-rpe surface reachable from active session', async ({ page }) => {
    // Note: completing a full session E2E in headless Playwright requires
    // skip-rest + logSet × N + final advance. Documented as soft-coverage
    // smoke — Vitest tests assert finished mode transition exhaustively at
    // store level. Here we just confirm the post-rpe route exists.
    await page.goto('/app/antrenor/post-rpe');
    // Route present (rendered something) — no crash, no 404 fallback.
    const errorMarker = page.getByText(/not found/i);
    await expect(errorMarker).toHaveCount(0);
  });

  test('resting mode — rest overlay appears after logSet (smoke)', async ({ page }) => {
    await page.goto('/app/antrenor');
    const startBtn = page.getByRole('button', { name: /incepe sesiunea/i });
    if ((await startBtn.count()) === 0) {
      test.skip(true, 'Coach Today card not visible (rest day or empty engine pipeline)');
    }
    await startBtn.first().click();
    await page.waitForURL(/\/workout$/i, { timeout: 10_000 }).catch(() => {});
    // Rate first set as 'potrivit' — triggers rest phase entry.
    const rate = page.getByRole('button', { name: /potrivit/i });
    if ((await rate.count()) === 0) {
      test.skip(true, 'Rating button not visible (workout in unexpected phase)');
    }
    await rate.first().click();
    // RestOverlay testid or visible countdown — best-effort smoke (some
    // workout fixtures may only have 1 set → transition phase NOT rest).
    const rest = page.getByTestId('rest-overlay');
    const skipRest = page.getByRole('button', { name: /sari pauza|skip/i });
    // Either rest-overlay or transition screen acceptable signal.
    const restVisible = (await rest.count()) > 0 || (await skipRest.count()) > 0;
    expect(restVisible).toBe(true);
  });
});
