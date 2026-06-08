// ══ WORKOUT STORE — Pure logic helpers + constants ═══════════════════════════
// Extracted verbatim from workoutStore.ts (hygiene split, zero behavior change).
// Energy mapping + logs writeback builders + sessionsHistory overflow archive +
// streak day-boundary math. The store (workoutStore.ts) re-exports every symbol
// here so external importers resolve unchanged.

import { DB, todTs } from '../../db.js';
import { archiveSession } from '../lib/dexieMigration';
import { isEnabled } from '../../util/featureFlags.js';
import { learnRecovery, saveRecoveryConstants, RECOVERY_CONSTANTS_KEY } from '../../engine/muscleMap.js';
import { learnedStepFromLogs, saveLearnedStep } from '../../engine/dp/equipmentLadder.js';
import { DP } from '../../engine/dp.js';
import type {
  SessionIntensityMod,
  EnergyLight,
  LastSessionSummary,
  LogEntry,
} from './workoutStore.types';

// Non-localized paused-session title SENTINEL (NOT user copy). Persisted on the
// pausedSnapshot when pauseSession receives an empty/whitespace title; the
// render boundary (ResumeSessionCard) detects it and substitutes a locale-aware
// label via t() — the store never persists Romanian copy (i18n leak harness).
export const PAUSED_SESSION_UNTITLED = '__paused_session_untitled__';

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
//
// ── TWO HORIZONS, TWO THRESHOLDS — deliberate divergence (do NOT unify) ───────
// There are intentionally TWO rating→RPE maps, one per decision horizon. They
// are co-located here so editing one without the other is impossible to miss
// (guard test pins the inequalities below):
//
//   RATING_TO_RPE (CROSS-SESSION, PERSISTED) — greu = 8.5.
//     Stamped onto persisted log rows (below) and read back by dp.js's
//     cross-session gates calibrated to this scale: greu gate (dp.js ~981,
//     lastRPE >= 8.5), consecutiveGreu, distress, easy. greu MUST stay < 9.5 so
//     a persisted honest hard set never accidentally trips the in-session-only
//     ease branch; and >= 8.5 so the cross-session greu gate fires.
//
//   INSESSION_RATING_TO_RPE (LIVE PER-SET) — greu = 10.
//     Fed ONLY to DP.checkInSessionAdjust for the live "this set was greu →
//     ease the NEXT set DOWN now" correction, whose greu branch fires at
//     lastRPE >= 9.5 (dp.js ~1327). greu MUST be >= 9.5 or that live ease branch
//     goes dead (a behavior regression).
//
// Unifying the numbers is a PRESCRIPTION change, not a cleanup: lowering
// in-session greu to 8.5 kills the live ease branch; raising persisted greu to
// 10 trips the cross-session ease/consecutiveGreu logic harder (moves live kg).
export const RATING_TO_RPE: Readonly<Record<'usor' | 'potrivit' | 'greu', number>> = {
  usor: 6.5,
  potrivit: 7.5,
  greu: 8.5,
};

// LIVE per-set horizon (see TWO HORIZONS note above). Lives here next to
// RATING_TO_RPE so the divergence is discoverable; imported by Workout.tsx and
// fed only to DP.checkInSessionAdjust. greu = 10 so the >= 9.5 in-session ease
// branch is reachable. Not persisted.
export const INSESSION_RATING_TO_RPE: Readonly<
  Record<'usor' | 'potrivit' | 'greu', number>
> = {
  usor: 6.5,
  potrivit: 7.5,
  greu: 10,
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
    // Daniel P0 (2026-06-05): the engine (DP.getLogs / getState / PR records)
    // keys on the ENGLISH canonical name. The screen records exerciseName as the
    // RO DISPLAY name ("Impins din piept"), so writing logs[].ex from it stranded
    // every log where DP couldn't find it → cold-start INIT every session →
    // ratings never moved the next recommendation (the "weight didn't move" bug).
    // Route logs[].ex from the engineName; fall back to exerciseName only for
    // legacy sessions (pre-fix) that never carried it.
    const engineKey = ex.engineName ?? ex.exerciseName;
    for (const s of ex.sets) {
      setIdx += 1;
      const ts = s.timestamp;
      entries.push({
        date: todTs(ts),
        ex: engineKey,
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
    // F3 #5 — learn the per-muscle recovery constant from the freshly-updated log
    // history (flag dp_learned_recovery_v1, default OFF → skipped → byte-identical).
    // Single authoritative per-session write site (avoids re-learning on every
    // render read). Quota-guarded + fail-silent inside the try.
    if (isEnabled('dp_learned_recovery_v1')) {
      const prior = (DB.get(RECOVERY_CONSTANTS_KEY) as Record<string, { hours: number; n: number }>) || undefined;
      const learned = learnRecovery(merged as unknown as Parameters<typeof learnRecovery>[0], prior);
      if (Object.keys(learned).length) saveRecoveryConstants(learned);
    }
    // F4 #10 — learn the per-gym equipment ladder (true load increment) for each
    // exercise just logged (flag dp_learned_ladder_v1, default OFF → skipped →
    // byte-identical). Same authoritative per-session write site as recovery
    // above. The inference needs the full distinct-load history per exercise, so
    // it reads from `merged` (the just-updated log). Quota-guarded + fail-silent.
    if (isEnabled('dp_learned_ladder_v1')) {
      const loadsByEx: Record<string, number[]> = {};
      for (const l of merged as Array<{ ex?: string; w?: number }>) {
        if (typeof l.ex !== 'string' || !l.ex || !(Number(l.w) > 0)) continue;
        (loadsByEx[l.ex] ??= []).push(Number(l.w));
      }
      for (const [ex, loads] of Object.entries(loadsByEx)) {
        const step = learnedStepFromLogs(loads);
        if (step > 0) saveLearnedStep(ex, step, new Set(loads).size);
      }
    }
    // F4 #3/F — learn the per-user temperament RIR bias (sandbagger vs grinder)
    // from the freshly-updated log history (flag dp_temperament_v1, default OFF →
    // skipped → byte-identical). Same authoritative per-session write site. The
    // fold reads from `logs` (already persisted above) inside DP. Quota-guarded +
    // fail-silent. isInCut is unknown at this layer → false (the rep-range floor it
    // tunes is the only effect, and the structural-RIR signal is robust to it).
    if (isEnabled('dp_temperament_v1')) {
      DP.learnTemperament(false);
    }
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
