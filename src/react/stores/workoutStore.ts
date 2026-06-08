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
import { todTs } from '../../db.js';
import { captureException } from '../../util/sentry.js';

// F1 fix (audit 2026-06-07, MED-HIGH) — quota-safe persist storage.
// zustand's createJSONStorage(() => localStorage) calls localStorage.setItem
// UNGUARDED inside the persist-wrapped `set`, so a QuotaExceededError on the
// `wv2-workout-store` write propagates straight out of finishSession → aborts
// PostRpe.handleSubmit before incrementStreak/navigate → the just-completed
// session is silently lost. Mirror the src/db.js DB.set soft-fail: try/catch
// the disk write, Sentry-capture + swallow QuotaExceededError so the in-memory
// state update + navigate still complete. Other errors bubble per contract.
const quotaSafeLocalStorage: Storage = {
  get length() { return localStorage.length; },
  clear: () => localStorage.clear(),
  key: (i) => localStorage.key(i),
  getItem: (k) => localStorage.getItem(k),
  removeItem: (k) => localStorage.removeItem(k),
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch (err) {
      if (err && (err as { name?: string }).name === 'QuotaExceededError') {
        try { captureException(err, { tags: { component: 'workoutStore.persist', key: k } }); } catch { /* swallow Sentry failure */ }
        return; // soft-fail: in-memory state stays correct; finish completes
      }
      throw err;
    }
  },
};

// ── Hygiene split (zero behavior change) ─────────────────────────────────────
// Pure types + the WorkoutMode FSM selector live in workoutStore.types.ts; pure
// computation helpers + their constants (energy map, logs writeback, overflow
// archive, streak math) live in workoutStore.logic.ts. They are re-exported
// here verbatim so every external importer of '../stores/workoutStore' resolves
// the SAME named symbols — consumers untouched. The store itself (single
// create(...) below) keeps its byte-identical public API + persist shape.
export type {
  WorkoutPhase,
  SessionIntensityMod,
  EnergyLight,
  EnergyLevelSelfReport,
  SessionEnergy,
  SessionPainContext,
  SessionContext,
  ExerciseHistoryEntry,
  PRData,
  PausedSession,
  SessionExerciseBreakdown,
  LastSessionSummary,
  LogEntry,
  WorkoutState,
  WorkoutMode,
  WorkoutModeView,
  WorkoutModeInputs,
  WorkoutActions,
} from './workoutStore.types';
export { getCurrentMode } from './workoutStore.types';
export {
  PAUSED_SESSION_UNTITLED,
  energyLightForIntensityMod,
  LOGS_MAX,
  SESSIONS_HISTORY_MAX,
  buildLogEntriesFromSummary,
  persistSessionLogs,
  archiveOverflowSessions,
  diffCalendarDays,
  nextStreak,
} from './workoutStore.logic';

import type {
  WorkoutPhase,
  WorkoutState,
  WorkoutActions,
} from './workoutStore.types';
import {
  PAUSED_SESSION_UNTITLED,
  SESSIONS_HISTORY_MAX,
  persistSessionLogs,
  archiveOverflowSessions,
  nextStreak,
} from './workoutStore.logic';

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
      sessionEnergy: null,
      sessionTimeBudgetMin: null,
      refusalTriedByEx: {},
      performedExercises: {},
      droppedExercises: {},
      deletedSessionTs: [],

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
          performedExercises: {},
      droppedExercises: {},
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
          sessionEnergy: null,
          sessionTimeBudgetMin: null,
          refusalTriedByEx: {},
          performedExercises: {},
      droppedExercises: {},
        }),

      finishSession: (summary) =>
        set((s) => {
          // CRIT #2 shape-check audit chat 5 — persist per-set logs to DB so
          // engine adapters (readiness/fatigue/adherence/MMI/stagnationDetector)
          // receive real session history from React production path. Pure
          // side-effect at action boundary per ADR 026 §9 (engines read DB
          // synchronously; localStorage write is sync). Soft-fail inside
          // persistSessionLogs preserves zero-throw render contract.
          // Safety net (Daniel P0 2026-06-05): persistSessionLogs early-returns
          // when sessionStart is null. The 'finished' mount-gate bug left
          // sessionStart null for every returning user → engine logs NEVER
          // written. Fall back to the summary's own timestamp so the per-set
          // logs the engine reads are written no matter the session lifecycle.
          const sessionGroupStart = s.sessionStart ?? summary.ts ?? Date.now();
          persistSessionLogs(summary, sessionGroupStart);
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
            sessionEnergy: null,
            sessionTimeBudgetMin: null,
            refusalTriedByEx: {},
            performedExercises: {},
      droppedExercises: {},
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
      swapExercise: (exIdx, performed) =>
        set((s) => {
          const { [exIdx]: _dropped, ...restHistory } = s.history;
          const isCurrent = s.exIdx === exIdx;
          return {
            history: restHistory,
            // Record the substitute actually performed at this slot so the saved
            // session (PostRpe) reflects what was DONE, not the original plan
            // (history-records-recommendation bug 2026-06-03).
            performedExercises: performed
              ? { ...s.performedExercises, [exIdx]: performed }
              : s.performedExercises,
            ...(isCurrent
              ? { setIdx: 0, phase: 'logging' as WorkoutPhase, prHit: false, prData: null }
              : {}),
          };
        }),

      // Delete a logged session (mislogged workout) by its ts. Removes it from
      // sessionsHistory + records a tombstone so cloud sync can't resurrect it.
      // lastSession cleared only when it IS the deleted one (no stale post-summary
      // surface). streak intentionally NOT rewound (see WorkoutActions.deleteSession
      // doc — forward-only day-boundary counter, not derived from history).
      deleteSession: (ts) =>
        set((s) => {
          if (!Number.isFinite(ts)) return {};
          if (!s.sessionsHistory.some((sess) => sess.ts === ts)) return {};
          return {
            sessionsHistory: s.sessionsHistory.filter((sess) => sess.ts !== ts),
            deletedSessionTs: s.deletedSessionTs.includes(ts)
              ? s.deletedSessionTs
              : [...s.deletedSessionTs, ts],
            ...(s.lastSession?.ts === ts ? { lastSession: null } : {}),
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

      // Founder swap redesign 2026-06-05 — DROP the exercise at exIdx (pick-list
      // "I don't want to do this"). Index-stable: mark the slot dropped + clear
      // its partial history; never splice the array (would shift every other
      // index-keyed map). Idempotent. The screen's advance loop skips dropped
      // slots; restoreExercise brings one back.
      dropExercise: (exIdx, identity) =>
        set((s) => {
          if (s.droppedExercises[exIdx]) return {};
          const { [exIdx]: _dropped, ...restHistory } = s.history;
          return {
            history: restHistory,
            droppedExercises: { ...s.droppedExercises, [exIdx]: identity },
          };
        }),

      // Founder swap redesign 2026-06-05 — RESTORE a dropped slot (machine freed
      // up). Clear its drop marker + jump the session to it fresh (setIdx 0,
      // logging). No-op when the slot was not dropped.
      restoreExercise: (exIdx) =>
        set((s) => {
          if (!s.droppedExercises[exIdx]) return {};
          const { [exIdx]: _restored, ...rest } = s.droppedExercises;
          return {
            droppedExercises: rest,
            exIdx,
            setIdx: 0,
            phase: 'logging' as WorkoutPhase,
          };
        }),

      markPRHit: (data) => set({ prHit: true, prData: data ?? null }),

      setLastRating: (rating) => set({ lastRating: rating }),

      // U-03 (HIGH) — WorkoutPreview.handleStart seteaza context inainte de
      // navigate workout. startSession (mount Workout idle) NU il sterge (e
      // setat fix inainte); cleared la session teardown (finish/discard/reset)
      // ca sa NU se scurga la sesiunea urmatoare (intrare directa Antrenor).
      setSessionContext: (ctx) => set({ sessionContext: ctx }),

      // Pre-workout reframe (Daniel UX LOCK 2026-06-08) — record the energy
      // self-report (energyLevel + intensityMod [+ cause]) on EnergyCheck/
      // EnergyCause. The flow now returns to the hub before Start, so this store
      // slice (NOT location.state) carries the self-report through to
      // WorkoutPreview. Cleared on session teardown so it never leaks to the next.
      setSessionEnergy: (energy) => set({ sessionEnergy: energy }),

      // Pre-session TIME budget — EnergyCheck "How much time today?" choice.
      // composePlannedWorkoutToday reads it to SHRINK the persona-derived cap.
      // Cleared (null) on session teardown so it never leaks to the next session.
      setSessionTimeBudgetMin: (min) => set({ sessionTimeBudgetMin: min }),

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
          sessionEnergy: null,
          sessionTimeBudgetMin: null,
          refusalTriedByEx: {},
          performedExercises: {},
          droppedExercises: {},
        }),
    }),
    {
      name: 'wv2-workout-store',
      // F1 fix — quota-safe storage adapter (see quotaSafeLocalStorage above):
      // a localStorage quota error on the persist write must NOT throw into
      // finishSession (would abort PostRpe before streak/navigate → lost session).
      storage: createJSONStorage(() => quotaSafeLocalStorage),
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
        // Tombstones for deleted sessions — must persist so a deleted workout
        // stays gone across reload + cloud hydrate (storeSync re-applies them).
        deletedSessionTs: state.deletedSessionTs,
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
