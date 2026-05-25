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

export type WorkoutPhase = 'logging' | 'rating' | 'rest' | 'transition' | 'idle';

// U-03 (HIGH) — session intensity/pain context carried preview → workout.
// EnergyCheck/EnergyCause/PainButton/ScheduleOverride selectau intensityMod
// 'plus'/'minus' + painContext, propagat doar via location.state efemer →
// WorkoutPreview.handleStart naviga la /workout FARA state → adaptarea afisata
// pe preview NU ajungea in sesiunea reala (target-uri pline). Stocam in store
// (runtime-only, NU persistat) ca Workout.tsx sa aplice modifierul la target.
export type SessionIntensityMod = 'plus' | 'normal' | 'minus';

export interface SessionPainContext {
  region: string;
  intensity: 1 | 2 | 3;
}

export interface SessionContext {
  intensityMod: SessionIntensityMod;
  painContext: SessionPainContext | null;
}

export interface ExerciseHistoryEntry {
  kg: number;
  reps: number;
  rating: 'usor' | 'potrivit' | 'greu';
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
}

export const LOGS_MAX = 5000;

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
  // explicit marker '(sesiune nedefinita)' NU silent pretend.
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

      startSession: (sessionStart) =>
        set({
          sessionStart,
          phase: 'logging',
          exIdx: 0,
          setIdx: 0,
          prHit: false,
          prData: null,
          history: {},
        }),

      // HIGH-CODE-05 fix: title preserved from caller (real workout name)
      // NU hardcoded 'Push' lie. Empty/whitespace title → explicit marker
      // '(sesiune nedefinita)' (Bugatti truth — NU silent fallback la 'Push').
      // Caller (Workout.tsx) reads getTodayWorkout().workoutTitle.
      pauseSession: (title) =>
        set((s) => {
          const safeTitle = title.trim() === '' ? '(sesiune nedefinita)' : title;
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
          return {
            phase: 'idle' as WorkoutPhase,
            sessionStart: null,
            lastSession: summary,
            // Phase 4 task_21: append la sessionsHistory cumulative list
            // pentru Istoric tab. Newest tail (reverse-chrono UI iter pe display).
            sessionsHistory: [...s.sessionsHistory, summary],
            exIdx: 0,
            setIdx: 0,
            history: {},
            sessionContext: null,
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
        }),
    }),
    {
      name: 'wv2-workout-store',
      storage: createJSONStorage(() => localStorage),
      // Persist selective: pausedSnapshot + lastSession + sessionsHistory +
      // streak + lastStreakDate (NU sessionStart/sessionContext runtime-only).
      // Phase 4 task_21 adds history pentru Istoric tab persistent browse.
      // U-05: lastStreakDate persistat ca day-boundary sa supravietuiasca reload.
      partialize: (state) => ({
        pausedSnapshot: state.pausedSnapshot,
        lastSession: state.lastSession,
        sessionsHistory: state.sessionsHistory,
        streak: state.streak,
        lastStreakDate: state.lastStreakDate,
      }) as Partial<WorkoutState & WorkoutActions>,
    }
  )
);
