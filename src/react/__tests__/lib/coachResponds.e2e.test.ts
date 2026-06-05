// ── E2E: the coach VISIBLY responds to the per-set rating (Daniel P0) ───────
// Daniel reported THREE times: prescribed "18kg × 10", logged it rated EASY
// (usor), next session STILL recommended the same; logged easy AGAIN, weight/
// reps did NOT move. A prior dp.js threshold calibration shipped LIVE and STILL
// did not fix it. So this test replicates the PRODUCTION wire end-to-end — NO
// hand-injected rpe, NO mocked engine path:
//   1. A finished session set with rating:'usor' is persisted via the REAL
//      persistSessionLogs (workoutStore.logic), which derives rpe from
//      RATING_TO_RPE (usor -> 6.5) into DB('logs'). We exercise that mapping.
//   2. The LIVE recommendation paths the Coach plan consumes are then driven:
//      - DP.getSmartRecommendation(name, readinessScore, null, undefined, rating)
//        (the exact call shape from scheduleAdapterAggregate.compose ~L139)
//      - composePlannedWorkoutToday (the full async pipeline the screen renders)
//   3. ASSERT: after an EASY-rated set below the rep-range top, the NEXT
//      recommendation INCREASES (rep target +1, or +1 stack step at the top).
//      A GREU-rated set HOLDS. This must hold for a NORMAL user AND a cold-start/
//      uncalibrated user (Daniel's "Log your first session to wake readiness").

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { persistSessionLogs } from '../../stores/workoutStore.logic';
import type { LastSessionSummary } from '../../stores/workoutStore.types';
import { DP } from '../../../engine/dp.js';
import { getComputedReadinessScore } from '../../../engine/readiness.js';
import { composePlannedWorkoutToday } from '../../lib/scheduleAdapterAggregate';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { DB, tod } from '../../../db.js';

const MONDAY_2026_05_18 = new Date(2026, 4, 18); // freq-'4' UPPER day (Lat Pulldown surfaces)

// Build a finished-session summary EXACTLY as the store stores it: one exercise,
// one working set carrying the coarse per-set `rating`. No rpe field — the rpe is
// DERIVED by persistSessionLogs via RATING_TO_RPE, which is the production wire.
//
// `displayName` is the RO display string the screen actually shows ("Impins din
// piept"); `engineName` is the English canonical the DP brain keys on ("Flat DB
// Press"). The PRODUCTION flow (PostRpe) records both. When displayName !==
// engineName (always under RO locale) the summary MUST still let DP find the
// history — that is the Daniel P0 break we reproduce.
function sessionWith(
  engineName: string,
  kg: number,
  reps: number,
  rating: 'usor' | 'potrivit' | 'greu',
  tsOffset: number,
  displayName: string = engineName,
): LastSessionSummary {
  const ts = Date.now() - tsOffset;
  return {
    title: 'Push',
    meta: 'x',
    ts,
    energyEmoji: 'green',
    energy: 'green',
    exercises: [
      {
        exerciseId: engineName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        // The screen sets exerciseName to the RO DISPLAY name (PlannedExercise.name).
        exerciseName: displayName,
        // The engine canonical key (PlannedExercise.engineName) — the fix routes
        // the persisted log's `ex` from THIS so DP.getLogs(engineName) finds it.
        engineName,
        sets: [{ kg, reps, rating, timestamp: ts + 1 }],
        totalVolume: kg * reps,
        peakOneRM: kg * 1.2,
      },
    ],
  };
}

function resetOnboarding(): void {
  useOnboardingStore.setState({
    data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 75, height: 175 },
    completed: true,
    completedAt: Date.now(),
  });
}

beforeEach(() => {
  localStorage.clear();
  resetOnboarding();
  useWorkoutStore.setState({
    exIdx: 0, setIdx: 0, phase: 'idle', prHit: false, prData: null,
    history: {}, sessionStart: null, lastRating: null, pausedSnapshot: null,
    lastSession: null, sessionsHistory: [], streak: 0,
  });
  vi.restoreAllMocks();
});

function findByEnSlug(
  exercises: ReadonlyArray<{ id: string; targetKg: number; targetReps: number }>,
  enName: string,
): { id: string; targetKg: number; targetReps: number } | undefined {
  const slug = enName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return exercises.find((e) => e.id.startsWith(`${slug}-`));
}

// ── Diagnostic: what does the uncalibrated readiness source return? ─────────
describe('E2E coach-responds — readiness source when uncalibrated', () => {
  it('getComputedReadinessScore returns null when no energy-check today (cold start)', () => {
    // No DB('readiness') entry for today → null (NOT a low gating number).
    expect(getComputedReadinessScore(null, null)).toBeNull();
  });
});

// ── The production wire: persistSessionLogs derives rpe from the rating ──────
describe('E2E coach-responds — persistSessionLogs writes the derived rpe', () => {
  it('a usor-rated set lands in DB(logs) with rpe 6.5 (RATING_TO_RPE), not hand-injected', () => {
    const summary = sessionWith('Flat DB Press', 18, 10, 'usor', 1000);
    persistSessionLogs(summary, summary.ts);
    const logs = DB.get('logs') as Array<{ ex: string; w: number; reps: string; rpe?: number }>;
    const entry = logs.find((l) => l.ex === 'Flat DB Press');
    expect(entry).toBeDefined();
    expect(entry!.w).toBe(18);
    expect(entry!.rpe).toBe(6.5); // usor -> 6.5 via RATING_TO_RPE
  });

  // ── THE LIVE P0 BUG (root cause): logs persisted under the RO DISPLAY name ──
  // The screen records exerciseName = PlannedExercise.name (RO display, e.g.
  // "Impins din piept"). Before the fix, persistSessionLogs wrote logs[].ex =
  // that RO string, but DP.getLogs/getSmartRecommendation key on the ENGLISH
  // canonical ("Flat DB Press") → the names never matched → DP saw NO history →
  // cold-start INIT every session → the rating never moved the recommendation.
  // The fix routes logs[].ex from the engineName, so DP can find the history.
  it('persists logs[].ex under the ENGINE canonical name, not the RO display name', () => {
    const summary = sessionWith('Flat DB Press', 18, 10, 'usor', 1000, 'Impins din piept');
    persistSessionLogs(summary, summary.ts);
    const logs = DB.get('logs') as Array<{ ex: string; w: number; rpe?: number }>;
    // DP reads the EN canonical — the log MUST be keyed on it (the live break).
    const byEngine = logs.find((l) => l.ex === 'Flat DB Press');
    expect(byEngine).toBeDefined();
    expect(byEngine!.rpe).toBe(6.5);
    // It must NOT be stranded under the RO display name (where DP can't see it).
    expect(logs.find((l) => l.ex === 'Impins din piept')).toBeUndefined();
  });
});

// ── DP.getSmartRecommendation: EASY must move the next recommendation ────────
// This is the exact call shape compose.ts uses (readinessScore, null, undefined,
// sessionRating). We drive it for a NORMAL (history) user and a COLD-START user.
describe('E2E coach-responds — DP.getSmartRecommendation moves on EASY', () => {
  it('NORMAL user: EASY set below rep top → next recommendation INCREASES reps', () => {
    // Daniel's case: 18kg x 10 (Flat DB Press range 8-12, so 10 is below top 12),
    // rated EASY. Persist via the real wire so rpe=6.5 lands in DB(logs).
    persistSessionLogs(sessionWith('Flat DB Press', 18, 10, 'usor', 3000), Date.now() - 3000);
    // readiness uncalibrated (no energy-check) → null → no gate. sessionRating
    // null (no post-session whole-session rating) — mirror the real cold path.
    const rec = DP.getSmartRecommendation('Flat DB Press', null, null, undefined, null);
    expect(rec).not.toBeNull();
    // EASY at 10 reps (top 12) → +1 rep target = 11, weight held. (18kg snaps to
    // the real dumbbell stack 17.5 — there is no 18kg DB; that snap is correct.)
    expect(rec.repsTarget).toBe(11);
    expect(rec.kg).toBe(17.5);
    expect(rec.status).toBe('INCREASE');
  });

  it('NORMAL user: EASY set at the rep top → next recommendation INCREASES weight', () => {
    // 17.5kg x 12 (top of Flat DB Press 8-12) rated EASY → +1 stack step (DB -> 20).
    persistSessionLogs(sessionWith('Flat DB Press', 17.5, 12, 'usor', 3000), Date.now() - 3000);
    const rec = DP.getSmartRecommendation('Flat DB Press', null, null, undefined, null);
    expect(rec.kg).toBeGreaterThan(17.5); // +1 equipment step (20)
    expect(rec.status).toBe('INCREASE');
  });

  it('HARD set EASES the weight down (rating said too heavy)', () => {
    // Daniel/Gigel P0 2026-06-05: HARD used to HOLD at the same weight (the coach
    // labelled it "too heavy" then re-prescribed the identical load). It now drops
    // one equipment step so the next session is genuinely lighter.
    persistSessionLogs(sessionWith('Flat DB Press', 17.5, 10, 'greu', 3000), Date.now() - 3000);
    const rec = DP.getSmartRecommendation('Flat DB Press', null, null, undefined, null);
    expect(rec.kg).toBeLessThan(17.5); // eased down, not held
    expect(rec.status).toBe('EASE BACK');
  });

  it('COLD-START user (uncalibrated readiness): EASY set still moves the recommendation', () => {
    // The killer case Daniel hit: a fresh user whose readiness is uncalibrated.
    // There is NO energy-check, so getComputedReadinessScore() is null. If the
    // composer ever fed a LOW number instead of null, the readiness gate would
    // silently HOLD every increase. We drive the SAME path with readiness null
    // (the honest uncalibrated value) and prove EASY still increases.
    persistSessionLogs(sessionWith('Flat DB Press', 18, 10, 'usor', 3000), Date.now() - 3000);
    const readiness = getComputedReadinessScore(null, null); // uncalibrated -> null
    const rec = DP.getSmartRecommendation('Flat DB Press', readiness, null, undefined, null);
    expect(rec.repsTarget).toBe(11); // EASY moved it despite cold-start readiness
    expect(rec.status).toBe('INCREASE');
  });
});

// ── The full live pipeline: composePlannedWorkoutToday ──────────────────────
// Drive the EXACT async path the Coach screen renders. Seed a usor-rated history
// for Lat Pulldown (the EN canonical that surfaces on the freq-'4' UPPER day) via
// the real persistSessionLogs, then assert the planned targetReps INCREASES vs a
// baseline medium-rated session.
describe('E2E coach-responds — composePlannedWorkoutToday responds to EASY', () => {
  function seedHistory(rating: 'usor' | 'potrivit' | 'greu', reps: number): void {
    // 3 sessions so getState has a stable lastReps/lastRPE; all same rating.
    persistSessionLogs(sessionWith('Lat Pulldown', 56, reps, rating, 3000), Date.now() - 3000);
    persistSessionLogs(sessionWith('Lat Pulldown', 56, reps, rating, 2000), Date.now() - 2000);
    persistSessionLogs(sessionWith('Lat Pulldown', 56, reps, rating, 1000), Date.now() - 1000);
  }

  it('EASY-rated Lat Pulldown (reps 9, range 8-12) → planned reps 10 (one up), weight held', async () => {
    seedHistory('usor', 9);
    const out = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    expect(out).not.toBeNull();
    const lat = findByEnSlug(out!.exercises, 'Lat Pulldown');
    expect(lat).toBeDefined();
    // EASY at 9 reps → INCREASE rep target to 10; weight held (snapped 56 -> 55).
    expect(lat!.targetReps).toBe(10);
    expect(lat!.targetKg).toBe(55);
  });

  it('EASY twice (the live "logged easy AGAIN") keeps moving forward, never stalls', async () => {
    // First easy session at 9 reps.
    persistSessionLogs(sessionWith('Lat Pulldown', 56, 9, 'usor', 4000), Date.now() - 4000);
    const out1 = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    const lat1 = findByEnSlug(out1!.exercises, 'Lat Pulldown')!;
    expect(lat1.targetReps).toBe(10);

    // User does the next session at the new target (10 reps) and rates it easy
    // again — the SECOND easy session. The recommendation must move FURTHER (11),
    // not stall at the same 10 (Daniel's exact complaint).
    persistSessionLogs(sessionWith('Lat Pulldown', 56, 10, 'usor', 1000), Date.now() - 1000);
    const out2 = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    const lat2 = findByEnSlug(out2!.exercises, 'Lat Pulldown')!;
    expect(lat2.targetReps).toBeGreaterThan(lat1.targetReps); // 10 -> 11, NOT stuck
  });

  it('GREU-rated Lat Pulldown EASES the weight down end-to-end', async () => {
    // P0 2026-06-05: a hard set now lightens the next prescription instead of
    // re-serving the same weight the user struggled with. Seed at a real ladder
    // value (55) — 56 is not a Lat Pulldown stack step (it snaps to 55), which
    // would mask the one-step drop.
    persistSessionLogs(sessionWith('Lat Pulldown', 55, 10, 'greu', 3000), Date.now() - 3000);
    persistSessionLogs(sessionWith('Lat Pulldown', 55, 10, 'greu', 2000), Date.now() - 2000);
    persistSessionLogs(sessionWith('Lat Pulldown', 55, 10, 'greu', 1000), Date.now() - 1000);
    const out = await composePlannedWorkoutToday(MONDAY_2026_05_18);
    const lat = findByEnSlug(out!.exercises, 'Lat Pulldown')!;
    expect(lat.targetKg).toBeLessThan(55); // eased below last weight
  });

  // ── THE PRODUCTION SCENARIO (Daniel's exact live test) ───────────────────
  // The screen records exerciseName as the RO DISPLAY name. We replicate that
  // EXACTLY: persist a usor-rated session whose breakdown carries the RO display
  // name "Impins din piept" but the engine name "Flat DB Press" (MONDAY surfaces
  // Lat Pulldown, but we assert at the DP level for Flat DB Press to mirror
  // Daniel's "18kg × 10" card). Before the fix logs[].ex = "Impins din piept" →
  // DP.getState("Flat DB Press") empty → cold-start INIT → rating ignored. After
  // the fix the log is keyed on the engine name → DP sees history → EASY moves it.
  it('RO-display-named session (the live wire) still moves the DP recommendation on EASY', async () => {
    // First easy session — recorded with the RO display name, like the screen.
    persistSessionLogs(
      sessionWith('Flat DB Press', 17.5, 10, 'usor', 3000, 'Impins din piept'),
      Date.now() - 3000,
    );
    const rec1 = DP.getSmartRecommendation('Flat DB Press', null, null, undefined, null);
    // DP found the RO-displayed history → EASY moved the rep target (10 -> 11).
    expect(rec1.status).toBe('INCREASE');
    expect(rec1.repsTarget).toBe(11);

    // "Logged easy AGAIN" — second easy session at the new target, still RO-named.
    persistSessionLogs(
      sessionWith('Flat DB Press', 17.5, 11, 'usor', 1000, 'Impins din piept'),
      Date.now() - 1000,
    );
    const rec2 = DP.getSmartRecommendation('Flat DB Press', null, null, undefined, null);
    // It must move FURTHER (11 -> 12), not stall at the same number.
    expect(rec2.repsTarget).toBeGreaterThan(rec1.repsTarget);
  });
});
