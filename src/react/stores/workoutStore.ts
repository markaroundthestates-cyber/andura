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
  purgeDeletedSessionLogs,
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
  purgeDeletedSessionLogs,
  nextStreak,
} from './workoutStore.logic';

// APP-LIFECYCLE-01 — max age of a persisted in-progress live session before it
// is treated as stale on rehydrate. 08.063 persists the in-progress session
// (sessionStart + exIdx/setIdx/phase/history/prHit/prData) so an accidental
// reload resumes it; but a session abandoned hours ago (closed tab overnight,
// PWA OS-killed mid-set) rehydrates a ghost "live session" pill that getCurrentMode
// reads as 'active'. Discard the in-progress fields (KEEP sessionsHistory/streak/
// lastSession) when the rehydrated sessionStart is older than this window.
const MAX_LIVE_SESSION_MS = 6 * 60 * 60 * 1000; // 6h

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
      restEndsAt: null,
      restInitialSec: 0,
      pendingAdvance: false,
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
          // Fresh start — no rest carried from any prior/abandoned session.
          restEndsAt: null,
          restInitialSec: 0,
          pendingAdvance: false,
          // A fresh start SUPERSEDES any abandoned pause — the user tapped Start
          // for a NEW workout, so the lingering pausedSnapshot (which would make
          // getCurrentMode report 'paused' and dead-end the Workout mount) is
          // dropped. Without this clear, a paused-but-not-resumed/discarded user
          // could never train again (BLOCKER 2026-06-13).
          pausedSnapshot: null,
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
                  // Carry the live rest timer into the snapshot so resume mid-rest
                  // rehydrates it (instead of resolving instantly + skipping the
                  // exercise advance). Absolute restEndsAt survives the pause gap.
                  restEndsAt: s.restEndsAt,
                  restInitialSec: s.restInitialSec,
                  pendingAdvance: s.pendingAdvance,
                }
              : null,
            phase: 'idle',
            sessionStart: null,
            // Live rest fields go idle alongside the live session (they live on
            // the snapshot now; resumeSession restores them).
            restEndsAt: null,
            restInitialSec: 0,
            pendingAdvance: false,
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
                // Rehydrate the rest timer captured at pause (legacy snapshots
                // lacking these fields → no rest, idle defaults).
                restEndsAt: s.pausedSnapshot.restEndsAt ?? null,
                restInitialSec: s.pausedSnapshot.restInitialSec ?? 0,
                pendingAdvance: s.pausedSnapshot.pendingAdvance ?? false,
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
          restEndsAt: null,
          restInitialSec: 0,
          pendingAdvance: false,
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
            restEndsAt: null,
            restInitialSec: 0,
            pendingAdvance: false,
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

      // Persist the live rest-countdown so a mid-rest re-mount rehydrates it
      // (cycle-7 fix). Workout.tsx calls this on every rest enter/extend/exit.
      setRestState: ({ restEndsAt, restInitialSec, pendingAdvance }) =>
        set({ restEndsAt, restInitialSec, pendingAdvance }),

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
          const deleted = s.sessionsHistory.find((sess) => sess.ts === ts);
          if (!deleted) return {};
          // Cycle-5 audit (LOW): also remove the deleted session's per-set log rows
          // from DB('logs') + recompute pr-records from the SURVIVING logs, so a PR
          // from a mislogged (now-deleted) session doesn't linger on the PR Wall +
          // inflate the Records count. Side-effect at the action boundary (same
          // pattern as finishSession→persistSessionLogs); soft-fail inside.
          purgeDeletedSessionLogs(deleted, ts);
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

      // Founder Busy/Missing redesign 2026-06-12 — DEFER the exercise at `fromIdx`
      // to a LATER slot `toIdx` (in-session "Ocupat": the machine is busy, move it
      // back and surface it again later — maybe it freed up). This is the STORE-side
      // half of an array reorder the Workout screen performs on its local exercises
      // list; here we keep every index-keyed map (history / performedExercises /
      // refusalTriedByEx / droppedExercises) ALIGNED to the new positions so no
      // slot's logged sets / tried-set / drop marker desync (the central invariant —
      // see workoutStore.types WorkoutState doc). The move is a forward rotation of
      // [fromIdx..toIdx]: element fromIdx → toIdx, every index in (fromIdx, toIdx]
      // shifts DOWN by one. `exIdx`/`setIdx` are LEFT untouched — the cursor stays at
      // fromIdx, which now holds what used to be the next pending exercise, so it
      // becomes current immediately with its own progress intact. No-op when the
      // indices are out of order / equal (defer must move strictly forward). Pure
      // index arithmetic; never touches sessionStart/streak/history of unaffected
      // slots. The screen only ever defers a NOT-yet-started current exercise behind
      // PENDING ones, so in practice the shifted range carries empty history — but the
      // remap is total so a refusal-tried / partially-logged slot would survive too.
      deferExercise: (fromIdx, toIdx) =>
        set((s) => {
          if (
            !Number.isInteger(fromIdx) ||
            !Number.isInteger(toIdx) ||
            toIdx <= fromIdx ||
            fromIdx < 0
          ) {
            return {};
          }
          // Remap one index-keyed map under the forward rotation [fromIdx..toIdx].
          const remap = <V,>(m: Record<number, V>): Record<number, V> => {
            const next: Record<number, V> = {};
            for (const [k, v] of Object.entries(m)) {
              const i = Number(k);
              let ni = i;
              if (i === fromIdx) ni = toIdx; // the moved slot lands at toIdx
              else if (i > fromIdx && i <= toIdx) ni = i - 1; // leapfrogged slots shift down
              next[ni] = v;
            }
            return next;
          };
          return {
            history: remap(s.history),
            performedExercises: remap(s.performedExercises),
            refusalTriedByEx: remap(s.refusalTriedByEx),
            droppedExercises: remap(s.droppedExercises),
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
          restEndsAt: null,
          restInitialSec: 0,
          pendingAdvance: false,
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
        // In-session STRUCTURAL decisions — index-keyed maps aligned with the
        // persisted history/exIdx, so they restore consistently on resume. Without
        // them a mid-session reload (1) resurrects a DROPPED exercise as pending
        // (the advance skip-loop no longer skips it) and (2) reverts a SWAPPED slot
        // to the original plan while the substitute's sets live under that slot —
        // mixing engine keys on continued logging. refusalTriedByEx/sessionContext
        // stay runtime-only (adaptation hints, not user decisions).
        droppedExercises: state.droppedExercises,
        performedExercises: state.performedExercises,
        // Live rest countdown — persisted so a reload / re-mount mid-rest
        // rehydrates the timer instead of resolving rest instantly (which would
        // skip/reset the exercise advance). restEndsAt is absolute epoch ms so
        // the remaining time is correct no matter how long the reload took.
        restEndsAt: state.restEndsAt,
        restInitialSec: state.restInitialSec,
        pendingAdvance: state.pendingAdvance,
      }) as Partial<WorkoutState & WorkoutActions>,
      // APP-LIFECYCLE-01 — discard a STALE in-progress session on rehydrate so a
      // workout abandoned hours ago doesn't resurrect a ghost "live session" pill.
      // The 08.063 persist resumes an in-progress session across reload; that is
      // correct for an accidental refresh, but a session whose sessionStart is
      // older than MAX_LIVE_SESSION_MS (tab closed overnight, PWA OS-killed) must
      // reset to idle. Only the in-progress fields are cleared — sessionsHistory /
      // streak / lastStreakDate / lastSession / pausedSnapshot / deletedSessionTs
      // survive untouched (idle defaults match the create(...) initial state).
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<WorkoutState>) };
        if (
          merged.sessionStart !== null
          && Date.now() - merged.sessionStart > MAX_LIVE_SESSION_MS
        ) {
          merged.sessionStart = null;
          merged.exIdx = 0;
          merged.setIdx = 0;
          merged.phase = 'idle';
          merged.history = {};
          merged.prHit = false;
          merged.prData = null;
          merged.restEndsAt = null;
          merged.restInitialSec = 0;
          merged.pendingAdvance = false;
          // The in-session structural-decision maps belong to the discarded
          // session — clear them to the idle defaults too (they are meaningless
          // once the in-progress fields above reset).
          merged.droppedExercises = {};
          merged.performedExercises = {};
        }
        return merged;
      },
    }
  )
);
