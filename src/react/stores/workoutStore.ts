// ══ WORKOUT STORE — Zustand State Machine V2 ══════════════════════════════
// Per DECISIONS.md §D015 §D016 + mockup wv2 object port React.
// Pure-function actions per ADR 026 §9, side-effects la I/O boundary
// (persist middleware Zustand pentru localStorage sync).
//
// Cross-refs:
//   - DECISIONS.md §D015 STRAT PIVOT React Andura Clasic
//   - DECISIONS.md §D-LEGACY-013 Auto-Aggression Detection (force-typing ELIMINATED)
//   - mockup andura-clasic.html wv2 object reference

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DB, todTs } from '../../db.js';
import { archiveSession } from '../lib/dexieMigration';

export type WorkoutPhase = 'logging' | 'rating' | 'rest' | 'transition' | 'idle';

// Non-localized paused-session title SENTINEL (NOT user copy). Persisted on the
// pausedSnapshot when pauseSession receives an empty/whitespace title; the
// render boundary (ResumeSessionCard) detects it and substitutes a locale-aware
// label via t() — the store never persists Romanian copy (i18n leak harness).
export const PAUSED_SESSION_UNTITLED = '__paused_session_untitled__';

// U-03 (HIGH) — session intensity/pain context carried preview → workout.
// EnergyCheck/EnergyCause/PainButton/ScheduleOverride selectau intensityMod
// 'plus'/'minus' + painContext, propagat doar via location.state efemer →
// WorkoutPreview.handleStart naviga la /workout FARA state → adaptarea afisata
// pe preview NU ajungea in sesiunea reala (target-uri pline). Stocam in store
// (runtime-only, NU persistat) ca Workout.tsx sa aplice modifierul la target.
export type SessionIntensityMod = 'plus' | 'normal' | 'minus';

export type EnergyLight = 'green' | 'yellow' | 'red';

// Pre-workout readiness bucket → traffic-light, the SAME 1:1 map WorkoutPreview
// uses for its banner (plus = success/up, minus = danger/down, normal =
// neutral). Persisted on the finished session as energyEmoji + energy so the
// live energy engines read a real per-session readiness signal. Pure.
const INTENSITY_MOD_TO_ENERGY: Readonly<Record<SessionIntensityMod, EnergyLight>> = {
  plus: 'green',
  normal: 'yellow',
  minus: 'red',
};

export function energyLightForIntensityMod(mod: SessionIntensityMod): EnergyLight {
  return INTENSITY_MOD_TO_ENERGY[mod];
}

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
  exerciseName: string;
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

export const LOGS_MAX = 5000;

// ── Per-set coarse rating → numeric RPE (engine signal restoration) ─────────
// The React per-set flow captures only a coarse rating ('usor'/'potrivit'/
// 'greu', ExerciseHistoryEntry.rating) — no numeric RPE. The live engines that
// read DB('logs') (dp.getState lastRPE, fatigue avgRPE) therefore fell to the
// default 7 forever. Map each set's OWN coarse rating to a calibrated RPE via
// the canonical RIR↔RPE identity (RIR+RPE≈10; usor→RIR3 / potrivit→RIR2 /
// greu→RIR1, see scheduleAdapterAggregate RATING_TO_RIR):
//   - potrivit → 7.5: fatigue-neutral ((avgRPE-7.5) term = 0) + dp default-equiv
//   - usor     → 6.5: below neutral, pulls fatigue down, well under increase gate
//   - greu     → 8.5: above neutral, raises fatigue, but stays UNDER dp's
//                     lastRPE>=9 TOO-HEAVY cliff (a single honest hard set must
//                     not auto-flag over-conservative). Literal 10-RIR (=9) would
//                     trip that cliff on every greu set — too aggressive.
// Per-set stamp from each set's own rating — NU propagate one session rating
// onto all sets, NU fabricate per-set variation.
const RATING_TO_RPE: Readonly<Record<'usor' | 'potrivit' | 'greu', number>> = {
  usor: 6.5,
  potrivit: 7.5,
  greu: 8.5,
};

// U-11 (MED) — rolling cap pe sessionsHistory (persistat integral cu exercises
// breakdown per sesiune). Fara cap creste nelimitat → pe orizont 2-3 ani user
// zilnic atinge quota localStorage (~5MB) → zustand persist esueaza silent →
// pierdere istoric. Cap 500 = ~1.4 ani uz zilnic full-detail, peste fereastra
// 90-zile a oricarui consumer (RatingsStrip90Day/PRWallRecent/CoachTodayCard).
// Newest-tail (la fel ca append existent) → slice(-MAX) pastreaza recente.
//
// 08.040 fix — pana acum slice(-MAX) ARUNCA TACIT cea mai veche sesiune cand
// se depaseste cap-ul (ANDURA never-delete violation pe orizont 2-3 ani). Acum
// overflow-ul (sesiunile cele mai vechi care ar cadea afara) e ARHIVAT in Tier-1
// IDB (`archiveSession` din dexieMigration.ts, acelasi pattern ca rotatia CDL)
// INAINTE de slice, deci raman recuperabile via `getArchivedSessions` — zero
// pierdere silentioasa. Fire-and-forget + fail-silent (jsdom fara IndexedDB
// → no-op): arhivarea nu blocheaza + nu arunca pe path-ul de finish session.
export const SESSIONS_HISTORY_MAX = 500;

export function buildLogEntriesFromSummary(
  summary: LastSessionSummary,
  sessionStart: number
): LogEntry[] {
  const entries: LogEntry[] = [];
  const exercises = summary.exercises ?? [];
  for (const ex of exercises) {
    let setIdx = 0;
    for (const s of ex.sets) {
      setIdx += 1;
      const ts = s.timestamp;
      entries.push({
        date: todTs(ts),
        ex: ex.exerciseName,
        w: s.kg,
        kg: s.kg,
        set: setIdx,
        sets: 1,
        reps: String(s.reps),
        ts,
        session: sessionStart,
        ...(s.isPR ? { isPR: true } : {}),
        // Per-set RPE from this set's OWN coarse rating (spread-conditional keeps
        // the entry clean when rating absent on a legacy breakdown).
        ...(s.rating ? { rpe: RATING_TO_RPE[s.rating] } : {}),
      });
    }
  }
  return entries;
}

export function persistSessionLogs(
  summary: LastSessionSummary,
  sessionStart: number | null
): void {
  if (sessionStart == null) return;
  try {
    const newEntries = buildLogEntriesFromSummary(summary, sessionStart);
    if (newEntries.length === 0) return;
    const existing = DB.get<LogEntry[]>('logs') ?? [];
    // Newest-first: prepend new entries reversed so chronologically-latest set
    // ends up at index 0 (matches legacy unshift loop order). New entries
    // already iterated exIdx ascending + setIdx ascending; reverse to get
    // latest-set-first within session.
    const merged = [...newEntries.slice().reverse(), ...existing].slice(0, LOGS_MAX);
    DB.set('logs', merged);
  } catch {
    // Soft-fail — storage quota / SSR jsdom edge. Engine adapters tolerate
    // missing logs (return 'DATE INSUFICIENTE' baseline). Preserves zero-
    // throw render contract Zustand action boundary.
  }
}

// 08.040 — archive the sessions that a SESSIONS_HISTORY_MAX cap would otherwise
// drop, into the Tier-1 IDB archive (same never-delete pattern as CDL rotation).
// `nextHistory` is the about-to-be-persisted list BEFORE the slice; we archive
// exactly the oldest (head) overflow that slice(-MAX) would discard. Pure on the
// store side — the archive write is fire-and-forget + fail-silent (no IndexedDB
// in jsdom → archiveSession no-ops). Exported for test determinism.
export function archiveOverflowSessions(
  nextHistory: readonly LastSessionSummary[],
  max: number = SESSIONS_HISTORY_MAX,
): void {
  if (nextHistory.length <= max) return;
  const overflow = nextHistory.slice(0, nextHistory.length - max); // oldest head
  for (const s of overflow) {
    // Fire-and-forget — never block / throw on the finish path. archiveSession
    // already swallows its own errors.
    void archiveSession(s);
  }
}

// ── U-05 streak day-boundary helpers ────────────────────────────────────────
// `next` streak from prior state: same calendar day → unchanged (no double-
// count pe 2 sesiuni/zi), exact next day → +1, gap > 1 day OR no prior streak
// → reset la 1. ISO day-keys via todTs (toLocaleDateString('sv'), tz-safe per
// useSessionsByDate.ts). Pure + exported pentru test determinism.
export function diffCalendarDays(fromIso: string, toIso: string): number {
  // ISO day "YYYY-MM-DD" parsed as UTC midnight → integer day delta, DST-safe.
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return Number.NaN;
  return Math.round((to - from) / 86_400_000);
}

export function nextStreak(
  prevStreak: number,
  lastStreakDate: string | null,
  todayIso: string,
): number {
  if (lastStreakDate === null) return 1;
  const delta = diffCalendarDays(lastStreakDate, todayIso);
  if (!Number.isFinite(delta) || delta < 0) return 1; // corrupt/future date → reset
  if (delta === 0) return prevStreak; // aceeasi zi → no-op
  if (delta === 1) return prevStreak + 1; // ziua urmatoare → +1
  return 1; // gap > 1 zi → reset la 1
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
  // Daniel smoke 2026-05-28 (#2 + #6) — "Nu vreau" exhaustive cycle. Per-exIdx
  // set of English canonical engine names the user has refused this session
  // (the original + every prior swap). resolveRefusalSwap consults this so each
  // candidate is offered ONCE before showing the "ai incercat tot" exhausted
  // copy. Runtime-only (NOT persisted) — fresh slate every session, day-zero
  // refusal history doesn't shape today's pool. Per-exIdx because the slot may
  // legitimately be re-used across exercises (refusing Bench at exIdx=0 must not
  // hide Bench from a future session that opens it at the same slot).
  refusalTriedByEx: Record<number, string[]>;
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
  swapExercise: (exIdx: number) => void;
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

export const useWorkoutStore = create<WorkoutState & WorkoutActions>()(
  persist(
    (set) => ({
      exIdx: 0,
      setIdx: 0,
      phase: 'idle',
      prHit: false,
      prData: null,
      history: {},
      sessionStart: null,
      lastRating: null,
      pausedSnapshot: null,
      lastSession: null,
      sessionsHistory: [],
      streak: 0,
      lastStreakDate: null,
      sessionContext: null,
      refusalTriedByEx: {},

      startSession: (sessionStart) =>
        set({
          sessionStart,
          phase: 'logging',
          exIdx: 0,
          setIdx: 0,
          prHit: false,
          prData: null,
          history: {},
          // Daniel smoke 2026-05-28 (#2 + #6) — fresh refusal slate per session.
          refusalTriedByEx: {},
        }),

      // HIGH-CODE-05 fix: title preserved from caller (real workout name)
      // NU hardcoded 'Push' lie. Empty/whitespace title → non-localized marker
      // PAUSED_SESSION_UNTITLED (Bugatti truth — NU silent fallback la 'Push';
      // ResumeSessionCard resolves it to locale-aware copy via t()).
      // Caller (Workout.tsx) reads getTodayWorkout().workoutTitle.
      pauseSession: (title) =>
        set((s) => {
          const safeTitle = title.trim() === '' ? PAUSED_SESSION_UNTITLED : title;
          return {
            pausedSnapshot: s.sessionStart
              ? {
                  title: safeTitle,
                  meta: `ex ${s.exIdx + 1}`,
                  exIdx: s.exIdx,
                  setIdx: s.setIdx,
                  phase: s.phase,
                  history: s.history,
                  sessionStart: s.sessionStart,
                }
              : null,
            phase: 'idle',
            sessionStart: null,
          };
        }),

      resumeSession: () =>
        set((s) =>
          s.pausedSnapshot
            ? {
                exIdx: s.pausedSnapshot.exIdx,
                setIdx: s.pausedSnapshot.setIdx,
                phase: s.pausedSnapshot.phase,
                history: s.pausedSnapshot.history,
                sessionStart: s.pausedSnapshot.sessionStart,
                pausedSnapshot: null,
              }
            : {}
        ),

      discardSession: () =>
        set({
          phase: 'idle',
          exIdx: 0,
          setIdx: 0,
          history: {},
          sessionStart: null,
          prHit: false,
          prData: null,
          pausedSnapshot: null,
          sessionContext: null,
          refusalTriedByEx: {},
        }),

      finishSession: (summary) =>
        set((s) => {
          // CRIT #2 shape-check audit chat 5 — persist per-set logs to DB so
          // engine adapters (readiness/fatigue/adherence/MMI/stagnationDetector)
          // receive real session history from React production path. Pure
          // side-effect at action boundary per ADR 026 §9 (engines read DB
          // synchronously; localStorage write is sync). Soft-fail inside
          // persistSessionLogs preserves zero-throw render contract.
          persistSessionLogs(summary, s.sessionStart);
          // U-11 (MED): rolling cap SESSIONS_HISTORY_MAX — slice ultimele N
          // (newest-tail) ca persist sa nu depaseasca quota localStorage.
          // 08.040: archiveaza overflow-ul (sesiunile vechi care ar cadea afara)
          // in Tier-1 IDB INAINTE de slice — zero pierdere silentioasa.
          const nextHistory = [...s.sessionsHistory, summary];
          archiveOverflowSessions(nextHistory);
          return {
            phase: 'idle' as WorkoutPhase,
            sessionStart: null,
            lastSession: summary,
            // Phase 4 task_21: append la sessionsHistory cumulative list
            // pentru Istoric tab. Newest tail (reverse-chrono UI iter pe display).
            sessionsHistory: nextHistory.slice(-SESSIONS_HISTORY_MAX),
            exIdx: 0,
            setIdx: 0,
            history: {},
            sessionContext: null,
            refusalTriedByEx: {},
          };
        }),

      setPhase: (phase) => set({ phase }),

      logSet: (exIdx, entry) =>
        set((s) => ({
          history: {
            ...s.history,
            // Phase 4 task_14: auto-stamp timestamp dacă nu provided pentru
            // aaFrictionDetect fast_sets interval calculation. Backward compat
            // existing test call sites care nu specifica timestamp.
            [exIdx]: [
              ...(s.history[exIdx] || []),
              { ...entry, timestamp: entry.timestamp ?? Date.now() },
            ],
          },
        })),

      advanceExercise: () =>
        set((s) => ({ exIdx: s.exIdx + 1, setIdx: 0, phase: 'logging' })),

      // WP-5 moat substitution — swap exercise at exIdx for an alternative. The
      // list lives in Workout screen local state; here we own only store-side
      // integrity. Drop history[exIdx] (partial sets belonged to the original);
      // when swapping the CURRENT exercise, reset setIdx/phase so the new
      // movement starts fresh at set 1. Never touches sessionStart/streak/
      // lastSession/sessionsHistory/other-index history (safety contract §8.5).
      swapExercise: (exIdx) =>
        set((s) => {
          const { [exIdx]: _dropped, ...restHistory } = s.history;
          const isCurrent = s.exIdx === exIdx;
          return {
            history: restHistory,
            ...(isCurrent
              ? { setIdx: 0, phase: 'logging' as WorkoutPhase, prHit: false, prData: null }
              : {}),
          };
        }),

      // Daniel smoke 2026-05-28 (#2 + #6) — exhaustive "Nu vreau" pool tracking.
      // Idempotent append per-exIdx (Set + spread to drop dupes, ordered preserved
      // first-seen-first so the candidates pool ordering stays predictable).
      markRefusalTried: (exIdx, engineName) =>
        set((s) => {
          if (typeof engineName !== 'string' || engineName.length === 0) return {};
          const prior = s.refusalTriedByEx[exIdx] ?? [];
          if (prior.includes(engineName)) return {};
          return {
            refusalTriedByEx: {
              ...s.refusalTriedByEx,
              [exIdx]: [...prior, engineName],
            },
          };
        }),

      markPRHit: (data) => set({ prHit: true, prData: data ?? null }),

      setLastRating: (rating) => set({ lastRating: rating }),

      // U-03 (HIGH) — WorkoutPreview.handleStart seteaza context inainte de
      // navigate workout. startSession (mount Workout idle) NU il sterge (e
      // setat fix inainte); cleared la session teardown (finish/discard/reset)
      // ca sa NU se scurga la sesiunea urmatoare (intrare directa Antrenor).
      setSessionContext: (ctx) => set({ sessionContext: ctx }),

      // U-05 (HIGH) — day-boundary streak. Aceeasi zi calendaristica = no-op
      // (2 sesiuni/zi NU = 2 zile), ziua urmatoare = +1, gap > 1 zi = reset 1.
      // `now` injectabil pentru test determinism. lastStreakDate persistat.
      incrementStreak: (now = Date.now()) =>
        set((s) => {
          const todayIso = todTs(now);
          const updated = nextStreak(s.streak, s.lastStreakDate, todayIso);
          return { streak: updated, lastStreakDate: todayIso };
        }),

      resetStreak: () => set({ streak: 0, lastStreakDate: null }),

      reset: () =>
        set({
          exIdx: 0,
          setIdx: 0,
          phase: 'idle',
          prHit: false,
          prData: null,
          history: {},
          sessionStart: null,
          lastRating: null,
          pausedSnapshot: null,
          sessionContext: null,
          refusalTriedByEx: {},
        }),
    }),
    {
      name: 'wv2-workout-store',
      storage: createJSONStorage(() => localStorage),
      // Persist selective: pausedSnapshot + lastSession + sessionsHistory +
      // streak + lastStreakDate (NU sessionContext/refusalTriedByEx runtime-only).
      // Phase 4 task_21 adds history pentru Istoric tab persistent browse.
      // U-05: lastStreakDate persistat ca day-boundary sa supravietuiasca reload.
      //
      // 08.063 fix — IN-PROGRESS LIVE SESSION persisted (sessionStart + exIdx +
      // setIdx + phase + history + prHit + prData). Pre-fix doar pausedSnapshot
      // supravietuia reload; o sesiune ACTIVA (user logand seturi live) pierdea
      // TACIT toate seturile + pozitia la un reload accidental (swipe-refresh
      // mobil, crash tab, OS kill PWA). Acum reload-ul REIA sesiunea: la mount
      // Workout.tsx vede getCurrentMode === 'active' (sessionStart != null) si NU
      // re-porneste — continua exact de unde a ramas cu seturile logate intacte.
      // sessionContext/refusalTriedByEx raman runtime-only (hint-uri de adaptare,
      // NU date introduse de user — pierderea lor la reload nu pierde seturi).
      partialize: (state) => ({
        pausedSnapshot: state.pausedSnapshot,
        lastSession: state.lastSession,
        sessionsHistory: state.sessionsHistory,
        streak: state.streak,
        lastStreakDate: state.lastStreakDate,
        // In-progress live session — resume on reload (no silent set loss).
        sessionStart: state.sessionStart,
        exIdx: state.exIdx,
        setIdx: state.setIdx,
        phase: state.phase,
        history: state.history,
        prHit: state.prHit,
        prData: state.prData,
      }) as Partial<WorkoutState & WorkoutActions>,
    }
  )
);
