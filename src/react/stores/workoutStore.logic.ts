// ══ WORKOUT STORE — Pure logic helpers + constants ═══════════════════════════
// Extracted verbatim from workoutStore.ts (hygiene split, zero behavior change).
// Energy mapping + logs writeback builders + sessionsHistory overflow archive +
// streak day-boundary math. The store (workoutStore.ts) re-exports every symbol
// here so external importers resolve unchanged.

import { DB, todTs } from '../../db.js';
import { archiveSession } from '../lib/dexieMigration';
import { isEnabled } from '../../util/featureFlags.js';
import { learnRecovery, saveRecoveryConstants, RECOVERY_CONSTANTS_KEY, bodyweightTrendRecoveryFactor } from '../../engine/muscleMap.js';
import { resolveActivePhase } from '../lib/phaseResolution';
import { learnedStepFromLogs, saveLearnedStep, observeLoggedWeight, saveUserLadder } from '../../engine/dp/equipmentLadder.js';
import { learnVolumeLandmarks, saveLearnedVolume, LEARNED_VOLUME_KEY } from '../../engine/periodization/learnedVolume.js';
import { learnFatigueCurve, saveFatigueCurve, FATIGUE_CURVE_KEY } from '../../engine/dp/fatigueCurve.js';
import { distillAndPersistBehaviorTuning } from '../../engine/dp/behaviorDistill.js';
import { debugLog } from '../lib/debugLog';
import { refreshPRRecordsFromLogs } from '../lib/prRecordsWriteback';
import { DP } from '../../engine/dp.js';
import { resolveCanonical } from '../../engine/exerciseAliases.js';
import { useOnboardingStore } from './onboardingStore';
import { experienceToEngine } from '../lib/scheduleAdapterAggregate.session';
import {
  activeWeekFromOverride,
  activeWeekFromScheduleStore,
  activeWeekForFrequency,
} from '../../engine/schedule/scheduleAdapter/frequencySplit.js';
import { getCalendarOverride } from '../../engine/schedule/scheduleAdapter/calendarOverrideStorage.js';
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
    //
    // #6 canonical resolution (behind dp_library_chains_v1, default OFF → the
    // unresolved legacy derivation, byte-identical to pre-#6). When ON, the derived
    // key is passed through resolveCanonical so a legacy/RO-display name (the
    // exerciseName fallback path) can NEVER strand a log off the engine key again —
    // it resolves to the EN canonical the engine reads. IDENTITY for an already-
    // canonical engineName (the common case: engineName present → already the
    // library key); unknown names pass through unchanged.
    const rawKey = ex.engineName ?? ex.exerciseName;
    const engineKey = isEnabled('dp_library_chains_v1') ? resolveCanonical(rawKey) : rawKey;
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
        // Gym-log arc 2026-06-11: CALIBRATION marker (level-set, not a record) —
        // detectPR excludes these rows from prevBest (like baseline), so a false
        // anchor never becomes the record to beat.
        ...(s.calibration ? { calibration: true } : {}),
        // C17-METRIC-DURATION-LOST — persist the PERFORMED seconds for a
        // time/carry set so the durable log row records the real held work (was
        // lost as reps:0). Absent on reps sets → kg/reps consumers unchanged.
        ...(s.durationSec ? { durationSec: s.durationSec } : {}),
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
      // F6c #21 — bodyweight-trend → recovery nudge (flag dp_strength_bw_ratio_v1,
      // default OFF → factor 1 → byte-identical). A sustained cut slows the learned
      // recovery; a surplus speeds it (REUSING the existing [0.5x, 2x] clamp). The
      // resolved phase token is passed in (engine never imports nutrition).
      const bwTrendFactor = isEnabled('dp_strength_bw_ratio_v1')
        ? bodyweightTrendRecoveryFactor(
            DB.get('weights') as Record<string, number> | null,
            resolveActivePhase(),
          )
        : 1;
      const learned = learnRecovery(merged as unknown as Parameters<typeof learnRecovery>[0], prior, bwTrendFactor);
      if (Object.keys(learned).length) saveRecoveryConstants(learned);
    }
    // F4 #10 — learn the per-gym equipment ladder (true load increment) for each
    // exercise just logged (flag dp_learned_ladder_v1, default OFF → skipped →
    // byte-identical). Same authoritative per-session write site as recovery
    // above. The inference needs the full distinct-load history per exercise, so
    // it reads from `merged` (the just-updated log). Quota-guarded + fail-silent.
    if (isEnabled('dp_learned_ladder_v1') || isEnabled('dp_user_ladder_v1')) {
      const loadsByEx: Record<string, number[]> = {};
      for (const l of merged as Array<{ ex?: string; w?: number }>) {
        if (typeof l.ex !== 'string' || !l.ex || !(Number(l.w) > 0)) continue;
        (loadsByEx[l.ex] ??= []).push(Number(l.w));
      }
      for (const [ex, loads] of Object.entries(loadsByEx)) {
        // Per-user STATION LADDER (founder goal 2026-06-12, flag dp_user_ladder_v1):
        // learn THIS user's real rungs (step + observed range) from their distinct
        // logged loads on THIS station, responsive after ~3 distinct logs, so the
        // rec snaps to THEIR gym — never the founder's hard-coded stacks. Writes the
        // range fields into the SAME synced dp-equipment-ladder record. When ON this
        // SUPERSEDES the strict modal-step-only write below (it records {step,range}).
        // OFF → only the legacy step-only write runs → byte-identical.
        let userLadderWritten = false;
        if (isEnabled('dp_user_ladder_v1')) {
          userLadderWritten = saveUserLadder(ex, loads).learned;
        }
        // Legacy modal-step-only learn (dp_learned_ladder_v1) — only refines the step
        // granularity. Skip when the user-ladder write already recorded this record
        // (it carries the step too) to avoid clobbering the range fields.
        if (isEnabled('dp_learned_ladder_v1') && !userLadderWritten) {
          const step = learnedStepFromLogs(loads);
          if (step > 0) saveLearnedStep(ex, step, new Set(loads).size);
        }
      }
    }
    // Gym-log arc 2026-06-11 — equipment-ladder TEMPLATE observations (flag
    // dp_equipment_ladder_v1). Every logged weight feeds the per-exercise
    // observation set (`dp-equipment-obs`); 2-3 distinct values matching a common
    // commercial stack/dumbbell/plate template resolve the machine's WHOLE ladder
    // (Daniel: "daca omu logheaza x, sa stie ca aparatul are greutatile y").
    // Same authoritative write site as the learned-step above; fail-silent.
    if (isEnabled('dp_equipment_ladder_v1')) {
      for (const l of merged as Array<{ ex?: string; w?: number }>) {
        if (typeof l.ex !== 'string' || !l.ex || !(Number(l.w) > 0)) continue;
        observeLoggedWeight(l.ex, Number(l.w));
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
    // F6b V1 #10 — learn the per-user productive volume band (personalMEV/MAV) per
    // muscle from the freshly-updated log history (flag dp_learned_volume_v1, default
    // OFF → skipped → byte-identical). Same authoritative per-session write site. When
    // dp_effective_reps_v1 is ALSO on, learn on EFFECTIVE (stimulus) volume rather than
    // raw set count (V3 dose link). Quota-guarded + fail-silent inside the try.
    if (isEnabled('dp_learned_volume_v1')) {
      const priorVol = (DB.get(LEARNED_VOLUME_KEY) as Record<string, { mev: number; mav: number; n: number }>) || undefined;
      const learnedVol = learnVolumeLandmarks(
        merged as unknown as Parameters<typeof learnVolumeLandmarks>[0],
        priorVol,
        { effective: isEnabled('dp_effective_reps_v1'), fixInversions: isEnabled('dp_learned_volume_fix_v1') }
      );
      if (Object.keys(learnedVol).length) saveLearnedVolume(learnedVol);
    }
    // F6a #20 — learn the per-user per-exercise reps-drop-off curve at fixed load
    // (flag dp_fatigue_curve_v1, default OFF → skipped → byte-identical). Same
    // authoritative per-session write site. A MAINTAINER (flat curve, drop-off
    // late/never) → +1 working set / a CRASHER (early drop-off) → -1, consumed by
    // distributeGroupSets via fatigueSetsAdjust. EMA-continued from the persisted
    // cache so the curve never saw-tooths. Quota-guarded + fail-silent inside the try.
    if (isEnabled('dp_fatigue_curve_v1')) {
      const priorCurve = (DB.get(FATIGUE_CURVE_KEY) as Record<string, { dropIndex: number; n: number }>) || undefined;
      const learnedCurve = learnFatigueCurve(
        merged as unknown as Parameters<typeof learnFatigueCurve>[0],
        priorCurve,
      );
      if (Object.keys(learnedCurve).length) saveFatigueCurve(learnedCurve);
    }
    // #59 D107 — distill the durable behavior log (behavior_tier1) into the per-user
    // rating-semantic tuning (flag dp_behavior_distill_v1, default OFF → skipped →
    // byte-identical). The log read is ASYNC (IDB) so this is FIRED-AND-FORGOTTEN —
    // never awaited, never blocks the sync finish path; the distillation is pure +
    // fail-silent inside. The tuning (dp-behavior-tuning) is read by dp._rirFromRpe
    // on the NEXT recommendation. Debug-noise (`tap`) is excluded INSIDE the
    // distiller (only `rec`/`log` semantic events feed it).
    if (isEnabled('dp_behavior_distill_v1')) {
      void distillAndPersistBehaviorTuning(() => debugLog.snapshot());
    }
    // F6c #34 — advance the live N-of-1 self-experiment by ONE on this session
    // completion (flag dp_nof1_v1, ON 2026-06-14 → the experiment scheduler runs;
    // OFF would skip it → byte-identical, no experiment scheduled, no preference
    // written — the reversible default). Same authoritative per-session write site
    // as the learners above. DP owns the
    // signal reads (the in-flight state, the per-arm #31 slope, the posterior
    // sigma) + the persistence; this seam supplies ONLY the lifts logged this
    // session (EN-canonical, from `newEntries[].ex`) + the two guardrail inputs
    // it can't read engine-side: the resolved nutrition phase (CUT confounds) +
    // the onboarding experience (a beginner has no stable baseline). Quota-
    // guarded + fail-silent inside the try.
    if (isEnabled('dp_nof1_v1')) {
      const loggedExNames = [...new Set(newEntries.map((e) => e.ex).filter(Boolean))];
      const experience = experienceToEngine(useOnboardingStore.getState().data.experience);
      const step = DP.stepNof1Experiment(loggedExNames, {
        phaseToken: resolveActivePhase(),
        isBeginner: experience === 'beginner',
      });
      // A3 — narrate the WINNER. When an experiment just CONCLUDED with a real
      // decided arm ('volume'|'intensity', null = inconclusive → no narration),
      // stash a one-shot record the post-session coach surface reads + clears.
      // READ-ONLY narration of the decision DP already made/persisted above — NOT
      // in the compose path, never touches the prescription → fp-regression unmoved.
      // Quota-guarded + fail-silent (same try as the step itself).
      if (step && step.action === 'decide' && step.arm && step.exercise) {
        DB.set('dp-nof1-narration', {
          exercise: step.exercise,
          arm: step.arm,
          ts: Date.now(),
        });
      }
    }
  } catch {
    // Soft-fail — storage quota / SSR jsdom edge. Engine adapters tolerate
    // missing logs (return 'DATE INSUFICIENTE' baseline). Preserves zero-
    // throw render contract Zustand action boundary.
  }
}

// Cycle-5 audit (LOW) — when a mislogged session is DELETED, its per-set log
// rows must also leave DB('logs') and the pr-records hash must be recomputed.
// Otherwise a PR from a later-deleted session lingers on the PR Wall + inflates
// the Records count (the session vanishes from History but its logs persist).
//
// Correlation: the durable log row's `ts` IS the set's own timestamp
// (buildLogEntriesFromSummary: `ts = s.timestamp`), the SAME value carried on the
// deleted summary's `exercises[*].sets[*].timestamp`. That is the robust key —
// `LogEntry.session` is `sessionStart` (session START), which differs from the
// summary's `ts` (session FINISH) for a normal session, so matching on session-ts
// alone would miss the rows. We additionally drop rows whose `l.session === ts`
// as a belt-and-suspenders for the null-sessionStart fallback path (finishSession
// then writes `session: summary.ts`). After pruning, refreshPRRecordsFromLogs()
// recomputes pr-records from the SURVIVING logs. Soft-fail (same zero-throw
// render contract as persistSessionLogs). Pure on the store side.
export function purgeDeletedSessionLogs(
  summary: LastSessionSummary | undefined,
  ts: number,
): void {
  try {
    const logs = DB.get<LogEntry[]>('logs') ?? [];
    if (logs.length === 0) {
      // merge:false — a genuine delete must be able to REMOVE a PR (a merge would
      // re-keep the deleted record, making deletions impossible). Force a rebuild.
      refreshPRRecordsFromLogs({ merge: false });
      return;
    }
    // Collect the deleted session's set timestamps (primary correlation key).
    const setTimestamps = new Set<number>();
    for (const ex of summary?.exercises ?? []) {
      for (const s of ex.sets) {
        if (typeof s.timestamp === 'number') setTimestamps.add(s.timestamp);
      }
    }
    const surviving = logs.filter(
      (l) => !setTimestamps.has(l.ts) && l.session !== ts,
    );
    if (surviving.length !== logs.length) DB.set('logs', surviving);
    // merge:false — recompute from the SURVIVING logs only so a deleted-session PR
    // is genuinely removed (the finish path uses the default merge:true to survive
    // the 5000-log prune; deletion must override that to allow removal).
    refreshPRRecordsFromLogs({ merge: false });
  } catch {
    // Soft-fail — storage / SSR jsdom edge. Leaving the logs as-is is safe; the
    // tombstone already removed the session from History. Zero-throw at the
    // Zustand action boundary.
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

// Weekday index (Monday=0 .. Sunday=6) for an ISO day-key "YYYY-MM-DD". UTC-parsed
// to match diffCalendarDays' day-key math (getUTCDay of T00:00:00Z = the weekday of
// that calendar date). Mirrors the engine's mapDateToIndex convention (dateHelpers.js).
function weekdayFromIso(iso: string): number {
  const t = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(t)) return -1;
  const jsDow = new Date(t).getUTCDay(); // Sunday=0 .. Saturday=6
  return jsDow === 0 ? 6 : jsDow - 1; // → Monday=0
}

// Count SCHEDULED training days that fall STRICTLY BETWEEN fromIso and toIso
// (exclusive of both endpoints), per the user's active-week tuple (length 7,
// Monday=0, true = training day). A non-zero count means the user skipped a
// scheduled session in the gap → the streak is broken. activeWeek absent → -1
// (caller falls back to plain calendar-consecutive behavior).
export function scheduledTrainingDaysMissed(
  activeWeek: ReadonlyArray<boolean> | null | undefined,
  fromIso: string,
  toIso: string,
): number {
  if (!Array.isArray(activeWeek) || activeWeek.length !== 7) return -1;
  const delta = diffCalendarDays(fromIso, toIso);
  if (!Number.isFinite(delta) || delta <= 1) return 0; // adjacent / same day → none skipped
  const fromWd = weekdayFromIso(fromIso);
  if (fromWd < 0) return -1;
  let missed = 0;
  // Days strictly between: offsets 1 .. delta-1 from fromIso.
  for (let offset = 1; offset < delta; offset++) {
    const wd = (fromWd + offset) % 7;
    if (activeWeek[wd] === true) missed++;
  }
  return missed;
}

export function nextStreak(
  prevStreak: number,
  lastStreakDate: string | null,
  todayIso: string,
  activeWeek?: ReadonlyArray<boolean> | null,
): number {
  if (lastStreakDate === null) return 1;
  const delta = diffCalendarDays(lastStreakDate, todayIso);
  if (!Number.isFinite(delta) || delta < 0) return 1; // corrupt/future date → reset
  if (delta === 0) return prevStreak; // aceeasi zi → no-op (U-05: 2 sesiuni/zi != 2 zile)
  if (delta === 1) return prevStreak + 1; // ziua urmatoare → +1
  // Gap > 1 CALENDAR day. Schedule-aware: an UNBROKEN streak when NO scheduled
  // training day was missed in the gap (e.g. Mon→Wed with Tue a scheduled rest).
  // Only a genuinely MISSED scheduled session breaks it. No activeWeek → -1 →
  // legacy calendar-consecutive reset (back-compat for callers without schedule).
  const missed = scheduledTrainingDaysMissed(activeWeek, lastStreakDate, todayIso);
  if (missed === 0) return prevStreak + 1; // rest-day gap, perfect adherence → +1
  return 1; // a scheduled session was skipped → reset la 1
}

// Resolve the user's active-week tuple the SAME way the engine does
// (getDailyWorkout.js: override → schedule-store → frequency default), so the
// streak's "scheduled training day" notion matches the calendar the user sees.
// Soft-fails to null on any error → streak falls back to calendar-consecutive.
export function resolveStreakActiveWeek(): ReadonlyArray<boolean> | null {
  try {
    const frequency = useOnboardingStore.getState().data.frequency;
    return (
      activeWeekFromOverride(getCalendarOverride()) ??
      activeWeekFromScheduleStore() ??
      activeWeekForFrequency(frequency)
    );
  } catch {
    return null;
  }
}
