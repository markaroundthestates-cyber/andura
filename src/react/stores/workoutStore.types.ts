// ══ WORKOUT STORE — Types + Mode FSM selector ════════════════════════════════
// Extracted verbatim from workoutStore.ts (hygiene split, zero behavior change).
// Pure type declarations + the WorkoutMode discriminated-union derivation. The
// store (workoutStore.ts) re-exports every symbol here so external importers
// resolve unchanged.

export type WorkoutPhase = 'logging' | 'rating' | 'rest' | 'transition' | 'idle';

export type SessionIntensityMod = 'plus' | 'normal' | 'minus';

export type EnergyLight = 'green' | 'yellow' | 'red';

export interface SessionPainContext {
  region: string;
  intensity: 1 | 2 | 3;
}

export interface SessionContext {
  intensityMod: SessionIntensityMod;
  painContext: SessionPainContext | null;
}

export interface ExerciseHistoryEntry {
  // For LOADED exercises: the external kg the user lifted.
  // For BODYWEIGHT exercises: the EFFECTIVE load (bodyweight x fraction +
  // addedKg) so PR/volume/progression math (which all read `kg`) are correct
  // without per-consumer changes. The user-entered ADDED weight is preserved
  // separately in `addedKg` for honest display ("+ X kg").
  kg: number;
  reps: number;
  rating: 'usor' | 'potrivit' | 'greu';
  // Bodyweight exercises only: the added belt/dumbbell weight the user entered
  // (0 = pure bodyweight, negative = assisted). Absent for loaded exercises
  // (their `kg` already IS the entered load). Display-only; the training load
  // is `kg` (effective).
  addedKg?: number;
  // Phase 4 task_14: timestamp pentru aaFrictionDetect fast_sets pattern.
  // Optional pentru backward compat — logSet action auto-set Date.now()
  // dacă call site nu provides.
  timestamp?: number;
}

// Phase 4 task_10/18: PR detection payload (engineWrappers.getPRDelta result).
export interface PRData {
  exercise: string;
  deltaKg: number;
  // Actual achieved weight of the PR set (engine raw.kg). The summary detail
  // line shows THIS (the real lift), not deltaKg — a reps/volume PR has
  // deltaKg=0, which rendered a misleading "0 kg" (Daniel audit 2026-06-05).
  // Optional for backward compat with persisted/legacy prData lacking it.
  kg?: number;
  type: 'weight' | 'reps' | 'volume';
  // Phase 4 task_18: enriched fields optional pentru backward compat (zero
  // legacy default cand absent). PostSummary banner Phase 5+ task_22
  // visual extension uses these.
  deltaPct?: number;
  oneRMEstimate?: number;
}

export interface PausedSession {
  title: string;
  meta: string;
  exIdx: number;
  setIdx: number;
  phase: WorkoutPhase;
  history: Record<number, ExerciseHistoryEntry[]>;
  sessionStart: number;
}

// Phase 5 task_03: per-exercise breakdown saved cu sessionsHistory pentru
// IstoricDetail granular render. Optional field — backward compat pentru
// sesiuni persisted Phase 4 fără breakdown.
export interface SessionExerciseBreakdown {
  exerciseId: string;
  // RO/locale DISPLAY name shown in Istoric ("Impins din piept"). NOT an engine key.
  exerciseName: string;
  // English canonical engine key ("Flat DB Press") — the identity DP / PR records
  // key on. Persisted so the writeback (buildLogEntriesFromSummary) routes
  // logs[].ex from THIS, not the RO display name. Optional — legacy sessions
  // (pre-fix) carry only exerciseName; the writeback falls back to it.
  engineName?: string;
  sets: Array<{
    kg: number;
    reps: number;
    rating: 'usor' | 'potrivit' | 'greu';
    timestamp: number;
    isPR?: boolean;
  }>;
  totalVolume: number; // sum(kg*reps)
  peakOneRM: number; // max Epley estimate across sets, 1 decimal
}

export interface LastSessionSummary {
  title: string;
  meta: string; // "5 seturi · 52 min · 12 450 kg" — display string (legacy + UI)
  ts: number; // Date.now() la finish
  // Phase 4 task_10: numeric fields preserved separat de display string
  // pentru clean consumption (eliminate PostSummary parseMeta regex stub).
  // Optional pentru backward compat cand persisted pre-migration.
  sets?: number;
  durationMin?: number;
  volumeKg?: number;
  // Phase 5 task_03: per-exercise breakdown pentru IstoricDetail.
  exercises?: SessionExerciseBreakdown[];
  // Pre-workout readiness traffic-light persisted on the finished session so the
  // live energy engines read a per-session signal off recentSessions[*]. Derived
  // from the session's pre-workout intensityMod (the same plus/normal/minus
  // readiness bucket WorkoutPreview shows): plus->green, normal->yellow,
  // minus->red. Two engine vocabularies, ONE persisted value:
  //   - energyEmoji ('green'|'yellow'|'red') → energyAdjustment green-streak UP gate
  //   - energy (same value)                  → recovery red-flag + mesocycle red gate
  // (energyDirection — deload vocabulary — is DERIVED from energyEmoji at the
  // pipeline builder layer, NOT persisted as a third copy.) Optional + absent
  // when the session had no energy-check (direct Antrenor entry) → engines see
  // no-signal baseline. NU fabricate green when absent.
  energyEmoji?: 'green' | 'yellow' | 'red';
  energy?: 'green' | 'yellow' | 'red';
}

// ── Logs writeback shim (CRIT #2 shape-check audit chat 5) ─────────────────
// Post-D028 vanilla retire → React-side workoutStore.finishSession never
// persists logs to DB. Engine adapters (readiness/fatigue/adherence/MMI/
// stagnationDetector) consume DB.get('logs') → permanent input-starved.
//
// Per-set flat schema matches legacy src/pages/coach/logging.js:195 engine
// consumer contract (NOT session-aggregate — engines filter by l.session +
// l.ex + l.w). Cap 5000 entries matches legacy logging.js:198 convention.
// Newest-first (unshift) preserves dp.getLogs slice(0, n) recency assumption.
//
// Cross-refs:
//   - src/engine/fatigue.js#calculateFatigueScore reads l.session + l.ts
//   - src/engine/dp.js#getLogs reads l.ex + l.w slice top N recent
//   - src/engine/prEngine.js#detectPR reads l.ex + l.w + l.reps
export interface LogEntry {
  date: string;
  ex: string;
  w: number;
  kg: number;
  set: number;
  sets: number;
  reps: string;
  ts: number;
  session: number;
  isPR?: boolean;
  // Per-set numeric RPE derived from the coarse per-set rating (RATING_TO_RPE).
  // Optional — backward compat with pre-migration logs (no source rating on
  // them). dp.getState reads `lastLog.rpe || 7`; fatigue reads `l.rpe` (top-2
  // avg/session) — both default neutral 7 when absent (no crash, no fabrication).
  rpe?: number;
}

export interface WorkoutState {
  exIdx: number;
  setIdx: number;
  phase: WorkoutPhase;
  prHit: boolean;
  prData: PRData | null; // Phase 4 task_10: details despre PR detected (NU just flag)
  history: Record<number, ExerciseHistoryEntry[]>;
  sessionStart: number | null;
  lastRating: 'usoara' | 'normala' | 'grea' | null;
  pausedSnapshot: PausedSession | null;
  lastSession: LastSessionSummary | null;
  // Phase 4 task_21: persisted past sessions cumulative list pentru Istoric
  // tab list view + detail navigation. Reverse-chrono append (newest tail).
  sessionsHistory: LastSessionSummary[];
  streak: number;
  // U-05 (HIGH) — ISO day (YYYY-MM-DD) of last streak increment. Persisted.
  // null = niciun streak inca. Day-boundary logic: aceeasi zi = no-op, ziua
  // urmatoare = +1, gap > 1 zi = reset la 1. Fara asta "streak" era doar
  // numar total sesiuni (2 sesiuni/zi = "2 zile consecutive" minciuna).
  lastStreakDate: string | null;
  // U-03 (HIGH) — runtime-only session intensity/pain context (NU persistat).
  // null = sesiune fara adaptare (intrare directa Antrenor → workout). Set de
  // WorkoutPreview.handleStart din location.state inainte de navigate workout.
  sessionContext: SessionContext | null;
  // Optional pre-session TIME budget (minutes) the user picked on EnergyCheck
  // ("How much time today?"). null = no limit / skipped → the persona+fatigue-
  // derived cap is used unchanged (byte-identical to the prior behavior). When
  // set, composePlannedWorkoutToday SHRINKS the effective cap to fit (it never
  // EXTENDS past the persona cap — safety: user time only ever tightens it).
  // Runtime-only (NOT persisted), like sessionContext — a per-session hint, not
  // user-entered training data; cleared on session teardown so it never leaks
  // to the next session.
  sessionTimeBudgetMin: number | null;
  // Tombstones — the `ts` of every logged session the user explicitly DELETED
  // from Istoric (mislogged workout, Daniel's wife). Plain removal from
  // sessionsHistory is not enough: the cloud sync merges by UNION (mergeArrayUnion
  // never drops a remote entry), so a deleted session would RESURRECT on the next
  // hydrate. The tombstone is the positive record of the deletion — synced + re-
  // applied on merge so it stays gone on every device (never-delete-without-record).
  deletedSessionTs: number[];
  // Daniel smoke 2026-05-28 (#2 + #6) — "Nu vreau" exhaustive cycle. Per-exIdx
  // set of English canonical engine names the user has refused this session
  // (the original + every prior swap). resolveRefusalSwap consults this so each
  // candidate is offered ONCE before showing the "ai incercat tot" exhausted
  // copy. Runtime-only (NOT persisted) — fresh slate every session, day-zero
  // refusal history doesn't shape today's pool. Per-exIdx because the slot may
  // legitimately be re-used across exercises (refusing Bench at exIdx=0 must not
  // hide Bench from a future session that opens it at the same slot).
  refusalTriedByEx: Record<number, string[]>;
  /**
   * The exercise actually PERFORMED at each slot after an in-session swap
   * (busy / refusal / missing-equipment). Keyed by exIdx. PostRpe reads this so a
   * saved session records the SUBSTITUTE actually done, not the original
   * recommendation (history-records-recommendation bug 2026-06-03). Runtime-only,
   * fresh per session — same lifecycle as refusalTriedByEx.
   */
  performedExercises: Record<number, { id: string; name: string; engineName?: string }>;
}

// ── §44-C1 Discriminated Union — WorkoutMode FSM tag ────────────────────────
// Pure-function selector `getCurrentMode(state)` derives a tagged variant out
// of the existing WorkoutState shape (zero breaking change to consumers care
// still field-access direct). 5 mutually exclusive modes per audit §44:
//   idle      → no active session + no paused snapshot + no lastSession
//   active    → sessionStart set (phase logging|rating|transition)
//   resting   → sessionStart set + phase=rest
//   paused    → pausedSnapshot present, sessionStart null
//   finished  → lastSession present + idle + no paused (postSession surface)
// Exhaustiveness compiler check via `switch` on .kind cu `default: never`.
export type WorkoutMode = 'idle' | 'active' | 'resting' | 'paused' | 'finished';

export type WorkoutModeView =
  | { kind: 'idle' }
  | { kind: 'active'; sessionStart: number; exIdx: number; phase: WorkoutPhase }
  | { kind: 'resting'; sessionStart: number; exIdx: number }
  | { kind: 'paused'; snapshot: PausedSession }
  | { kind: 'finished'; lastSession: LastSessionSummary };

// Minimum-fields shape accepted de getCurrentMode (avoid over-binding la
// WorkoutState complet). Consumers pot pass-in literal subscriptions individual
// din primitive selectors — stable refs, NU object-identity churn per render.
export interface WorkoutModeInputs {
  phase: WorkoutPhase;
  sessionStart: number | null;
  pausedSnapshot: PausedSession | null;
  lastSession: LastSessionSummary | null;
  exIdx: number;
}

// Derive current mode from minimum WorkoutState slice. Priority order:
//   1. active session (sessionStart !== null) → resting if phase=rest else active
//   2. paused snapshot (no live session)
//   3. finished (lastSession present, no live, no paused)
//   4. idle (default)
export function getCurrentMode(state: WorkoutModeInputs): WorkoutModeView {
  if (state.sessionStart !== null) {
    if (state.phase === 'rest') {
      return { kind: 'resting', sessionStart: state.sessionStart, exIdx: state.exIdx };
    }
    return {
      kind: 'active',
      sessionStart: state.sessionStart,
      exIdx: state.exIdx,
      phase: state.phase,
    };
  }
  if (state.pausedSnapshot !== null) {
    return { kind: 'paused', snapshot: state.pausedSnapshot };
  }
  if (state.lastSession !== null) {
    return { kind: 'finished', lastSession: state.lastSession };
  }
  return { kind: 'idle' };
}

export interface WorkoutActions {
  startSession: (sessionStart: number) => void;
  // HIGH-CODE-05 fix: title preserved from caller (real workout name) NU
  // hardcoded 'Push' lie. Maria 65 antreneaza picioare → pauzeaza → resume
  // → vede 'Push' was Bugatti truth violation. Caller (Workout.tsx) reads
  // getTodayWorkout().workoutTitle and passes here. Empty string fallback
  // non-localized marker PAUSED_SESSION_UNTITLED NU silent pretend.
  pauseSession: (title: string) => void;
  resumeSession: () => void;
  /**
   * Discards the CURRENT in-progress session without persisting to
   * `sessionsHistory` / `lastSession`. Mid-session abandon path.
   *
   * Cleared: `exIdx`, `setIdx`, `phase`, `prHit`, `prData`, `history`,
   * `sessionStart`, `pausedSnapshot`.
   *
   * Preserved: `sessionsHistory`, `streak`, `lastSession`, `lastRating`
   * (pre-session rating context kept — only the session being abandoned
   * goes away). See {@link reset} for active-session wipe that also
   * clears `lastRating`.
   */
  discardSession: () => void;
  finishSession: (summary: LastSessionSummary) => void;
  setPhase: (phase: WorkoutPhase) => void;
  logSet: (exIdx: number, entry: ExerciseHistoryEntry) => void;
  advanceExercise: () => void;
  markPRHit: (data?: PRData) => void;
  setLastRating: (rating: 'usoara' | 'normala' | 'grea') => void;
  // U-03 (HIGH) — set session intensity/pain context (WorkoutPreview.handleStart).
  setSessionContext: (ctx: SessionContext | null) => void;
  // Pre-session TIME budget — set on EnergyCheck ("How much time today?"). null
  // clears the limit (back to persona-derived cap). composePlannedWorkoutToday
  // reads it to SHRINK the effective time cap (never extends it).
  setSessionTimeBudgetMin: (min: number | null) => void;
  // U-05 (HIGH) — day-boundary streak. `now` injectabil (default Date.now())
  // pentru determinism test. Aceeasi zi = no-op, ziua urmatoare = +1, gap > 1
  // zi (sau primul streak) = reset la 1.
  incrementStreak: (now?: number) => void;
  resetStreak: () => void;
  /**
   * Swap the exercise at `exIdx` for an alternative (moat substitution — WP-5
   * in-session "Aparat ocupat" / "Nu vreau"). The exercise LIST itself lives in
   * the Workout screen's local state (sourced from getTodayWorkout); this action
   * owns only the store-side integrity: it CLEARS any sets logged so far for
   * `exIdx` (they belonged to the original, now-replaced exercise — meaningless
   * for the alternative) and, when the swap targets the CURRENT exercise, resets
   * `setIdx`/`phase` so logging restarts at set 1 of the new movement.
   *
   * RISK (§8.5) safety contract — surgical, no corruption:
   *   - NEVER touches `sessionStart`, `streak`, `lastSession`, `sessionsHistory`,
   *     `prHit`/`prData`, or any OTHER exercise's history.
   *   - Only `history[exIdx]` is dropped (the partial sets of the swapped-out
   *     movement). Sets already logged for prior exercises are invariant.
   *   - If `exIdx` is the current exercise and we are mid-rest/transition, phase
   *     returns to 'logging' at setIdx 0 (the new exercise starts fresh).
   * A swap on a NOT-yet-started exercise (no sets logged) is a no-op on history.
   */
  swapExercise: (exIdx: number, performed?: { id: string; name: string; engineName?: string }) => void;
  /**
   * Delete a logged session from `sessionsHistory` by its `ts` (mislogged
   * workout — per-entry remove from Istoric). Records a tombstone
   * (`deletedSessionTs`) so the cloud sync cannot resurrect it on hydrate (the
   * union merge re-applies tombstones — see storeSync workout.apply). Idempotent
   * — deleting an absent/already-deleted ts is a safe no-op.
   *
   * Derived counters: `streak`/`lastStreakDate` are NOT recomputed here. Streak
   * is a forward-only day-boundary counter (incrementStreak), not a function of
   * sessionsHistory — silently rewinding it on an arbitrary mid-history delete
   * would be guesswork and could corrupt a legitimately-earned streak. We delete
   * only the session record the user pointed at; the streak stays as earned.
   * `lastSession` (the post-summary surface) is cleared only when it IS the
   * deleted session, so the "finished" surface doesn't keep showing a workout
   * the user just removed.
   */
  deleteSession: (ts: number) => void;
  /**
   * Daniel smoke 2026-05-28 (#2 + #6) — append an engine name to the per-exIdx
   * refusal-tried set so subsequent "Nu vreau" taps on the same slot skip names
   * already proposed (no ping-pong, no repeats until pool exhausted). Idempotent
   * — calling with an already-tried name is a no-op. Pure on store side; the
   * pool query lives in src/engine/alternativeFinder.js findRefusalPool.
   */
  markRefusalTried: (exIdx: number, engineName: string) => void;

  /**
   * Resets ACTIVE-session runtime state only — NOT cumulative history.
   *
   * Cleared: `exIdx`, `setIdx`, `phase`, `prHit`, `prData`, `history`,
   * `sessionStart`, `lastRating`, `pausedSnapshot`.
   *
   * Preserved: `sessionsHistory`, `streak`, `lastSession` (cumulative
   * per-user data persisted across sessions via `partialize`).
   *
   * Differs from {@link discardSession} only by also clearing `lastRating`
   * (semantic: `reset` is a full active-session wipe, `discardSession`
   * is mid-session abandon — pre-session rating context preserved).
   *
   * For full-wipe semantics (Tier 0 erasure) see
   * `ResetDataConfirm` / `DeleteAccountConfirm`: they pair `reset()` with
   * `resetStreak()` + raw `setState({ lastSession: null, sessionsHistory: [] })`.
   */
  reset: () => void;
}
