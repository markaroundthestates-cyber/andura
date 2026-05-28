// ══ SCHEDULE ADAPTER AGGREGATE — Phase 6 task_02 Real Wire Async ═════════
// Per DECISIONS.md §D027 STRATEGY LOCKED V1 Option C big-bang async migration.
// Phase 5 task_05 PHASE_5_BASELINE_PUSH stub eliminated. Real pipeline
// invocation via scheduleAdapter.getDailyWorkout(userState, now) async
// (Phase 6 task_01 LANDED runPipeline 8-adapter consumer + sessionBuilder
// delegate).
//
// Returns null when:
//   - Calendar override rest day (selectedDays[dayIdx].active === false)
//   - Pipeline hard halt (Periodization or downstream emit hard error)
//   - getDailyWorkout throws (D4 contract surface defensive)
//
// Returns PlannedWorkoutOutput shape when training day + pipeline complete.
// Async signature consumed via useState + useEffect loading pattern în 5
// React consumers (SessionPill / Workout / WorkoutPreview / PostRpe /
// coachDirectorAggregate).

import { getDailyWorkout } from '../../engine/schedule/scheduleAdapter.js';
import { useWorkoutStore } from '../stores/workoutStore';
import type { LastSessionSummary } from '../stores/workoutStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { MS_PER_DAY, COMPOUND_EX } from '../../constants.js';
import type { PlannedExercise, PlannedWorkoutOutput } from './engineWrappers';
import { toExerciseDisplay } from './exerciseDisplay';
import { DP } from '../../engine/dp.js';
import { getComputedReadinessScore, getTodayReadiness } from '../../engine/readiness.js';
import { suggestStartWeight } from '../../engine/coldStartGuidelines.js';
import { DB } from '../../db.js';
import { PAIN_REGION_GROUP_MAP } from '../../engine/muscleRecoveryConstants.js';
import { resolvePersonaId } from '../../engine/periodization/volumeLandmarks.js';
import { estimateBF_Deurenberg } from '../../engine/bodyComposition.js';
import {
  getCurrentWeightKg,
  readUserMaintenanceTDEE,
  readUserWeightKg,
  computeProteinTargetG,
} from './userTdee';

// ── RO onboarding → EN engine vocabulary (CRIT C1) ─────────────────────────
// Onboarding stores experience/goal as RO strings (onboardingStore Experience
// 'incepator'|'intermediar'|'avansat'; Goal 'masa'|'slabire'|...). The engine
// cold-start guideline keys on EN buckets (beginner|intermediate|advanced /
// 'cut'). A naive RO pass silently falls to the x1.0 multiplier default — a
// real bug (avansat would get intermediate weights). Map explicitly at the
// adapter boundary so RO strings NEVER enter the engine.
const EXPERIENCE_RO_TO_EN: Readonly<Record<string, string>> = {
  incepator: 'beginner',
  intermediar: 'intermediate',
  avansat: 'advanced',
};

function experienceToEngine(experience: unknown): string {
  if (typeof experience === 'string' && experience in EXPERIENCE_RO_TO_EN) {
    return EXPERIENCE_RO_TO_EN[experience] as string;
  }
  return 'beginner'; // conservative default (lowest start-weight multiplier)
}

// ── recentSessions engine-shape transform (SHAPE audit Gap HIGH #1) ────────
// LastSessionSummary (UI/persist shape) carries display + numeric session
// fields but NONE of the per-session signal fields engine consumers read off
// recentSessions[*]. Passing summaries raw made periodization/deload/
// energyAdjustment/goalAdaptation dual-signal logic permanently run zero-
// signal baseline (verified: mesocycle.js:93-122 isMariusDualSignalGreen reads
// .rir/.weekIdx; goalAdaptation/pushBackTiers.js:76 + templates.js:49 read
// .daysAgo/.injury; bayesianNutrition/profileTyping.js:129 +
// volumeLandmarks.js:156 read .daysAgo).
//
// toEngineSession derives ONLY fields that have an honest source in the
// summary itself (Bugatti truth + D027 §5 anti-fabrication — NU inventa fields
// care nu exista in store):
//   - daysAgo: floor((now - ts) / day) — exact from summary.ts.
//   - rir: mode per-set rating mapped usor→3 / potrivit→2 / greu→1 (matches
//     SHAPE audit table + suflet rir-matrix.js HEAVY/CHALLENGING/COMFORTABLE
//     rirMin bands). Real per-session effort signal from exercises[*].sets[*].
// energy / injury / weekIdx are NOT derived HERE: energy needs a per-session
// readiness-emoji not captured on the summary, injury lives in the pain CDL
// channel (separate write path), weekIdx needs a mesocycle anchor absent from
// the store. This pure transform stays injury-free. The Pain CDL injury signal
// IS now wired into the pipeline, but at the builder layer
// (buildUserStateForPipeline overlays `injury:true` from DB('pain-cdl')), NOT
// fabricated inside this summary→session transform. Engines treat absent fields
// as "insufficient data" → conservative baseline (no false-positive extension/
// deload). Deriving them from nothing would feed wrong signal — worse than absent.
export interface EngineSession extends LastSessionSummary {
  daysAgo: number;
  rir?: number;
  // Overlaid by buildUserStateForPipeline from the Pain CDL (goalAdaptation
  // push-back reads recentSessions[*].injury). NU set by toEngineSession.
  injury?: boolean;
  // Overlaid by buildUserStateForPipeline from the persisted energyEmoji
  // (deload isEnergyDownSustained reads recentSessions[*].energyDirection ==
  // 'DOWN'). NU set by toEngineSession (builder-layer only).
  energyDirection?: string;
  // Overlaid by buildUserStateForPipeline from the session timeline modulo 4
  // (mesocycle isMariusDualSignalGreen requires weeks 1-4 present). NU set by
  // toEngineSession (builder-layer only).
  weekIdx?: number;
}

const RATING_TO_RIR: Readonly<Record<string, number>> = {
  usor: 3,
  potrivit: 2,
  greu: 1,
};

/**
 * Derive the dominant (mode) per-set rating across a session's exercises,
 * mapped to a baseline RIR. Returns undefined when the summary carries no
 * per-set breakdown (pre-Phase-5 persisted sessions) — engines skip rir-less
 * entries rather than assume a value.
 */
function deriveSessionRir(summary: LastSessionSummary): number | undefined {
  const counts: Record<string, number> = {};
  for (const ex of summary.exercises ?? []) {
    for (const s of ex.sets) {
      counts[s.rating] = (counts[s.rating] ?? 0) + 1;
    }
  }
  let topRating: string | null = null;
  let topCount = 0;
  for (const [rating, n] of Object.entries(counts)) {
    if (n > topCount) {
      topCount = n;
      topRating = rating;
    }
  }
  if (topRating === null) return undefined;
  return RATING_TO_RIR[topRating];
}

/**
 * Pure transform: LastSessionSummary → engine recentSessions[*] shape.
 * Additive — preserves all original summary fields; layers derived signal
 * fields the engine pipeline consumes. `now` injectable for testability
 * (engines stay pure; Date read happens here at the adapter boundary).
 */
export function toEngineSession(
  summary: LastSessionSummary,
  now: number = Date.now(),
): EngineSession {
  const daysAgo = Math.max(0, Math.floor((now - summary.ts) / MS_PER_DAY));
  const rir = deriveSessionRir(summary);
  return rir === undefined
    ? { ...summary, daysAgo }
    : { ...summary, daysAgo, rir };
}

// ── Injury safety signal wire (SAFETY-adjacent — oracle-concern #2) ────────
// A known injury did NOTHING in the live path: buildUserStateForPipeline passed
// `meta:{}`, so the pipeline injury gates ran INERT —
//   - specialization activationGating Gate 4 (detectInjuryAutoDisable) reads
//     `ctx.meta.painButtonActive` + `ctx.meta.painAffectedGroups`
//     (src/engine/specialization/index.js:211-212 + activationGating.js:77-117)
//   - goalAdaptation push-back (computeRiskScore) reads
//     `ctx.recentSessions[*].injury === true` + `.daysAgo <= injuryWindowDays`
//     (src/engine/goalAdaptation/pushBackTiers.js:76-86)
// Neither input was ever fed. The honest live source is the append-only Pain
// CDL the PainButton screen persists (DB('pain-cdl'), src/.../PainButton.tsx:97
// + 112-121) — region + intensity + ts per report. deriveInjurySignal reads
// that channel and maps regions → Big 11 muscle groups via the canonical
// PAIN_REGION_GROUP_MAP (muscleRecoveryConstants.js:109 — same map the recovery
// engine already consumes; NU reinventa). Pure: `now` injected, DB read happens
// at the buildUserStateForPipeline boundary, NOT here.

// Lookback window for a Pain CDL report to count as a "recent" injury. Matches
// the goalAdaptation push-back injuryWindowDays (6 sapt = 42 zile,
// goalAdaptation/constants.js PUSHBACK_RISK_THRESHOLDS.injuryWindowDays) so the
// specialization gate + push-back agree on what "recent" means.
const INJURY_LOOKBACK_DAYS = 42;

// Pain CDL storage key + entry shape — local mirror of PainButton.tsx
// PAIN_CDL_KEY/PainCdlEntry (same lib-redeclare precedent as engineWrappers.ts
// readPainCdl, avoids a lib → React-screen import edge).
const PAIN_CDL_KEY = 'pain-cdl';

interface PainCdlEntryRead {
  type?: string;
  region?: string;
  intensity?: 1 | 2 | 3;
  ts?: number;
}

export interface InjurySignal {
  /** True when >=1 Pain CDL report falls within the lookback window. */
  active: boolean;
  /** Big 11 muscle groups loaded by the reported pain regions (deduped). */
  affectedGroups: string[];
}

/**
 * Derive the live injury safety signal from the append-only Pain CDL log.
 * Only reports within INJURY_LOOKBACK_DAYS count (a 3-month-old tweak is not a
 * current contraindication). Regions map to muscle groups via the canonical
 * PAIN_REGION_GROUP_MAP. Pure — `now` injectable for deterministic tests.
 *
 * @param painCdl raw DB('pain-cdl') entries (newest-first per PainButton write)
 * @param now epoch ms reference for the window
 */
export function deriveInjurySignal(
  painCdl: ReadonlyArray<PainCdlEntryRead> | null | undefined,
  now: number = Date.now(),
): InjurySignal {
  const entries = Array.isArray(painCdl) ? painCdl : [];
  const groups = new Set<string>();
  let active = false;
  const regionMap = PAIN_REGION_GROUP_MAP as Record<string, string[] | undefined>;
  for (const e of entries) {
    if (!e || e.type !== 'pain' || typeof e.region !== 'string') continue;
    const ts = Number(e.ts);
    if (!Number.isFinite(ts)) continue;
    const daysAgo = Math.floor((now - ts) / MS_PER_DAY);
    if (daysAgo < 0 || daysAgo > INJURY_LOOKBACK_DAYS) continue;
    active = true;
    for (const g of regionMap[e.region] ?? []) groups.add(g);
  }
  return { active, affectedGroups: [...groups] };
}

// ── Builder-layer signal completion (energyDirection / weekIdx / bf / phase) ──
// Every helper below is PURE. They feed the SINGLE buildUserStateForPipeline
// overlay so the live engines that read recentSessions[*] / user / meta stop
// running on defaults. All degrade safe-absent (engines Number.isFinite /
// typeof-guard every field) → conservative baseline when a source is missing.

// energyEmoji (persisted traffic-light) → deload ENERGY_DIRECTION vocabulary
// (deload/constants.js: {UP,DOWN,NONE}). green->UP, yellow->NONE, red->DOWN.
// ONE persisted source (energyEmoji on the summary), the deload word derived at
// the boundary — NOT a third persisted copy.
const EMOJI_TO_DIRECTION: Readonly<Record<string, string>> = {
  green: 'UP',
  yellow: 'NONE',
  red: 'DOWN',
};

/**
 * Audit HIGH — readiness score cu tinta nutritionala REALA per-user (mentenanta
 * + proteine g/kg × greutate), NU flat 2000/180. Acelasi calcul ca
 * engineWrappers.getUserReadinessScore, inlinat aici ca sa NU cream un import
 * circular (engineWrappers importa deja din acest modul). Threadeaza targets in
 * engine; cold-start fara onboarding → null → engine cade pe flat.
 */
function readinessScoreForUser(): number | null {
  const targetKcal = readUserMaintenanceTDEE();
  const targetProt = computeProteinTargetG(readUserWeightKg());
  return getComputedReadinessScore(targetKcal, targetProt);
}

/**
 * Audit MED — emoji-ul de energie de AZI (din EnergyCheck) → traffic-light
 * pentru engine-ul Energy Adjustment (resolveEmojiState citeste meta.energyEmoji
 * 'green'|'yellow'|'red'). EnergyCheck persista readiness 1-5 (saveReadiness);
 * il mapam pe banda traffic-light (mirror EnergyCheck intensity + EMOJI_TO_DIRECTION):
 *   5 (excelent) / 4 (bine) → green (UP)
 *   3 (normal)             → yellow (NONE)
 *   2 (slabit) / 1 (obosit) → red (DOWN)
 * Fara energy-check azi → undefined (engine ramane inert pe sesiunea curenta,
 * NU fabricam un semnal). Reads readiness store → I/O boundary.
 */
function readTodayEnergyEmoji(): string | undefined {
  const r = getTodayReadiness();
  if (r == null || !Number.isFinite(r)) return undefined;
  if (r >= 4) return 'green';
  if (r === 3) return 'yellow';
  if (r >= 1) return 'red';
  return undefined;
}

// 4-week mesocycle cycle length (mesocycle.isMariusDualSignalGreen requires
// weeks 1,2,3,4 present). Matches generator weekIdx = (i % 4) + 1.
const MESOCYCLE_WEEKS = 4;

/**
 * Earliest session timestamp = training start anchor. undefined when no
 * sessions yet (a brand-new user has no training history). Pure.
 */
function trainingStartTs(
  sessions: ReadonlyArray<LastSessionSummary>,
): number | undefined {
  let earliest = Infinity;
  for (const s of sessions) {
    const ts = Number(s?.ts);
    if (Number.isFinite(ts) && ts < earliest) earliest = ts;
  }
  return Number.isFinite(earliest) ? earliest : undefined;
}

/**
 * Derive a session's mesocycle weekIdx (1-4) from its age relative to the
 * training start, modulo the 4-week cycle. No stateful counter — survives gaps
 * honestly (a break advances the modulo, matching real mesocycle drift).
 * undefined when the start anchor is unknown (single/no-timeline). Pure.
 */
function deriveWeekIdx(
  sessionTs: number,
  startTs: number | undefined,
  now: number,
): number | undefined {
  if (!Number.isFinite(sessionTs) || startTs === undefined) return undefined;
  const ts = Math.min(sessionTs, now);
  const weeksSinceStart = Math.floor((ts - startTs) / (7 * MS_PER_DAY));
  if (!Number.isFinite(weeksSinceStart) || weeksSinceStart < 0) return undefined;
  return (weeksSinceStart % MESOCYCLE_WEEKS) + 1;
}

/**
 * Estimate body-fat as a FRACTION (0.0-1.0) from BMI/age/sex via Deurenberg
 * 1991: BF% = 1.20·BMI + 0.23·age − 10.8·sex − 5.4 (sex: male=1, female=0).
 * The percent is divided by 100 → FRACTION, because the engine thresholds are
 * fractional (bfPctHighMale 0.25); a raw percent would false-positive every
 * user (CRITICAL trap). Clamp [0.03, 0.60]. undefined when any input missing →
 * engine sees absent → no false BF-high risk (computeRiskScore guards
 * Number.isFinite(bf) && bf > 0). Population estimate, fitness-not-medicine —
 * NOT a body-composition measurement. Pure.
 *
 * @param input weight (kg), height (cm), age (years), sex ('m'|'f')
 */
export function estimateBfFraction(input: {
  weight?: number | null;
  height?: number | null;
  age?: number | null;
  sex?: string | null;
}): number | undefined {
  // Canonical Deurenberg math lives in engine/bodyComposition (PERCENT 2-60).
  // Single source of truth — here we divide to a FRACTION at the engine
  // boundary (engine thresholds are fractional; raw percent false-positives
  // every user, CRITICAL trap) + apply the engine clamp [0.03, 0.60].
  const bfPercent = estimateBF_Deurenberg({
    weightKg: Number(input.weight),
    heightCm: Number(input.height),
    ageYears: Number(input.age),
    ...(typeof input.sex === 'string' ? { sex: input.sex } : {}),
  });
  if (bfPercent == null) return undefined;
  const fraction = bfPercent / 100; // percent → FRACTION (engine thresholds are fractional)
  return Math.min(0.6, Math.max(0.03, fraction));
}

/**
 * Profile tier from onboarding experience (specialization Gate 2 reads T1+).
 * incepator->T0 (calibration-window noise), intermediar->T1, avansat->T2. null
 * when experience missing → engine resolveTier returns null → conservative
 * baseline (specialization stays gated). Pure.
 */
/**
 * Distinct EN exercise names the user has logged with a weight (the PR-anchor
 * set for WP-4 selection). Reads the same `logs` channel DP.getLogs consumes.
 * Pure-ish (reads persisted DB only). Returns [] when nothing logged.
 */
function distinctLoggedExerciseNames(): string[] {
  const logs =
    (DB.get('logs') as Array<{ ex?: string; w?: number }> | null) ?? [];
  const names = new Set<string>();
  for (const l of logs) {
    if (l && typeof l.ex === 'string' && l.ex && l.w) names.add(l.ex);
  }
  return [...names];
}

function tierForExperience(experience: unknown): 'T0' | 'T1' | 'T2' | null {
  switch (experience) {
    case 'incepator':
      return 'T0';
    case 'intermediar':
      return 'T1';
    case 'avansat':
      return 'T2';
    default:
      return null;
  }
}

/**
 * Onboarding goal → nutrition phase (BULK/CUT/MAINTAIN), consistent with
 * goalAdaptation basePhaseForGoal/basePhaseForTemplate semantics. Specialization
 * Gate 3 activates on BULK/RECOMP; push-back/RECOMP detection read it. RECOMP is
 * a runtime sub-phase (detected from bf/trainingWeeks downstream), not a base
 * onboarding goal → the builder emits BULK/CUT/MAINTAIN only. null/auto ->
 * undefined (let the engine auto-detect; meta.goalPhase absent = conservative).
 * Pure.
 *
 * Deliberately a SEPARATE map from periodization resolveGoalId →
 * goalAdaptation basePhaseForGoal: those key on the canonical EN goal-id vocab
 * (hipertrofie/recompozitie/sanatate) and never return undefined, whereas this
 * boundary maps the RO onboarding Goal vocab (masa/mentenanta/auto — absent
 * upstream) and MUST emit undefined for 'auto'/null so the engine auto-detects.
 * Routing through the canonical chain would mis-default masa/mentenanta/slabire.
 */
function goalPhaseForGoal(goal: unknown): 'BULK' | 'CUT' | 'MAINTAIN' | undefined {
  switch (goal) {
    case 'forta':
    case 'masa':
      return 'BULK';
    case 'slabire':
      return 'CUT';
    case 'mentenanta':
      // §obiectiv-drop-longevitate 2026-05-28 — 'longevitate' dropped (semantic
      // dup of mentenanta); legacy persisted users migrated via onboardingStore.
      return 'MAINTAIN';
    default:
      return undefined; // 'auto' / null → engine auto-detect
  }
}

/**
 * Build the userState aggregate consumed by getDailyWorkout pipeline.
 * Primary-source slice fields verified (anti-recurrence D027 §5):
 *   - user: useOnboardingStore.data Big 6 + height (age/sex/goal/frequency/
 *     experience/weight/height), plus bfPct (Deurenberg estimate, FRACTION) +
 *     trainingWeeks (from the session timeline). Both estimated at the builder —
 *     NO new onboarding question (honors D078 minimal onboarding); both degrade
 *     safe-absent (Number.isFinite guarded downstream).
 *   - recentSessions: useWorkoutStore.sessionsHistory (newest-first), each mapped
 *     through the PURE toEngineSession then a SINGLE builder-layer overlay that
 *     stamps injury / energyDirection / weekIdx (the signal fields engines read
 *     off recentSessions[*] that toEngineSession cannot honestly derive alone).
 *   - meta: painButtonActive/painAffectedGroups (injury gate) + persona/goalPhase
 *     (specialization Gate 1/3). profileTier (Gate 2) is a top-level field.
 *
 * Every overlay/estimate is sourced from already-persisted data → ZERO migration
 * (derived fields materialize on the next pipeline run). NU fabricate fields care
 * nu există în stores (slip cause D027 §5): absent source → field omitted →
 * engine conservative baseline.
 */
export function buildUserStateForPipeline(): {
  user: Record<string, unknown>;
  recentSessions: ReadonlyArray<unknown>;
  weights: Record<string, unknown>;
  prNames: string[];
  profileTier: string | null;
  flags: Record<string, unknown>;
  meta: Record<string, unknown>;
} {
  const onboardingData = useOnboardingStore.getState().data;
  const sessionsHistory = useWorkoutStore.getState().sessionsHistory ?? [];
  const now = Date.now();
  // Live injury safety signal from the Pain CDL channel (DB('pain-cdl')) — the
  // honest persisted source PainButton writes. Feeds BOTH pipeline injury gates
  // that were previously inert (meta:{}):
  //   - specialization Gate 4 reads meta.painButtonActive + meta.painAffectedGroups
  //   - goalAdaptation push-back reads recentSessions[*].injury + .daysAgo
  const injury = deriveInjurySignal(DB.get<PainCdlEntryRead[]>(PAIN_CDL_KEY), now);
  // Training start anchor (earliest session ts) — shared by weekIdx + trainingWeeks.
  const startTs = trainingStartTs(sessionsHistory);
  // sessionsHistory appends newest-tail (workoutStore.finishSession); engine
  // recentSessions consumers slice(0, N) expecting newest-first (types.js:17
  // "ordered desc by date" + mesocycle.js:99/triggerHierarchy.js:246 trailing
  // window). Reverse to newest-first, map each through the PURE toEngineSession,
  // then a SINGLE builder-layer overlay stamps the signal fields that have no
  // honest per-summary source (injury / energyDirection / weekIdx). One overlay
  // map — NU stack a second/third .map(). toEngineSession stays injury/energy/
  // weekIdx-free (purity contract test).
  const recentSessions = sessionsHistory
    .slice()
    .reverse()
    .map((s) => toEngineSession(s, now))
    .map((s) => {
      const overlay: Partial<EngineSession> = {};
      // injury:true on sessions inside the lookback window → push-back recent-
      // injury check (reads recentSessions[*].injury, NU meta).
      if (injury.active && s.daysAgo <= INJURY_LOOKBACK_DAYS) overlay.injury = true;
      // energyDirection from the persisted energyEmoji → deload isEnergyDownSustained.
      const direction =
        typeof s.energyEmoji === 'string' ? EMOJI_TO_DIRECTION[s.energyEmoji] : undefined;
      if (direction !== undefined) overlay.energyDirection = direction;
      // weekIdx from the session timeline modulo 4 → mesocycle dual-signal.
      const weekIdx = deriveWeekIdx(Number(s.ts), startTs, now);
      if (weekIdx !== undefined) overlay.weekIdx = weekIdx;
      return Object.keys(overlay).length > 0 ? { ...s, ...overlay } : s;
    });
  // Canonical greutate CURENTA: ultima greutate LOGATA > onboarding (sursa unica,
  // audit CRIT). Feed pipeline-ul (bf%/demografice) cu greutatea reala curenta —
  // era inghetata pe onboarding, deci logarea unei greutati nu misca planul.
  const currentWeightKg = getCurrentWeightKg();
  // Audit MED — emoji-ul de energie de AZI (EnergyCheck) pentru engine Energy
  // Adjustment (meta.energyEmoji). undefined cand fara energy-check azi.
  const todayEnergyEmoji = readTodayEnergyEmoji();
  // bfPct as a FRACTION (Deurenberg) — engine thresholds are fractional; a raw
  // percent would false-positive every user (CRITICAL trap, fact 10).
  const bfPct = estimateBfFraction({
    weight: currentWeightKg,
    height: onboardingData.height,
    age: onboardingData.age,
    sex: onboardingData.sex,
  });
  // trainingWeeks from the first-session date (0 when no sessions — a brand-new
  // user IS a newbie). Feeds templates.isNewbieEffect (<=12 weeks).
  const trainingWeeks =
    startTs === undefined
      ? 0
      : Math.max(0, Math.floor((now - startTs) / (7 * MS_PER_DAY)));
  // Specialization meta wire (was unset → blocked at Gate 1 persona for EVERY
  // real user). persona = canonical age-based resolvePersonaId (reused, NOT
  // reinvented); profileTier from experience (Gate 2 reads T1+); goalPhase from
  // goal (Gate 3 activates BULK/RECOMP). Absent inputs → conservative baseline.
  const persona = resolvePersonaId(
    onboardingData.age !== null ? { age: onboardingData.age } : {},
  );
  const profileTier = tierForExperience(onboardingData.experience);
  const goalPhase = goalPhaseForGoal(onboardingData.goal);
  // PR-anchor set for WP-4 selection: distinct exercise names the user has
  // actually logged (weighted set). sessionBuilder prefers these over other
  // candidates so existing users keep visible PR continuity. EN canonical names
  // (logs key on the EN name, same as DP.getLogs / cold-start guidelines).
  const prNames = distinctLoggedExerciseNames();
  return {
    user: {
      age: onboardingData.age,
      sex: onboardingData.sex,
      goal: onboardingData.goal,
      frequency: onboardingData.frequency,
      experience: onboardingData.experience,
      // Canonical greutate curenta (ultima logata > onboarding) — audit CRIT.
      weight: currentWeightKg,
      height: onboardingData.height,
      // Degrade safe-absent: only set when the estimate/timeline is real.
      ...(bfPct !== undefined ? { bfPct } : {}),
      trainingWeeks,
    },
    recentSessions,
    weights: {},
    // WP-4 PR-anchor set (sessionBuilder prefers logged names).
    prNames,
    // Gate 2 tier (specialization resolveTier reads top-level profileTier).
    profileTier,
    flags: {},
    meta: {
      // painButtonActive + painAffectedGroups = specialization injury gate input
      // (activationGating Gate 4) — PRESERVED from the injury wire.
      painButtonActive: injury.active,
      painAffectedGroups: injury.affectedGroups,
      // persona (Gate 1) + goalPhase (Gate 3). Omit goalPhase when undefined
      // (goal 'auto'/null) → engine auto-detect, NU a fabricated phase.
      persona,
      ...(goalPhase !== undefined ? { goalPhase } : {}),
      // Fix #3 — macrocycle anchor (periodization/index.js:85 reads
      // meta.weeksElapsed). Was NEVER set → NaN → hasMacrocycleAnchor=false →
      // every user frozen at macrocycle week 0 forever (block 1 / meso 1 / LOAD).
      // weeksElapsed === trainingWeeks (weeks since the first logged session) —
      // SAME continuous count, single source (NU a second derivation that could
      // drift). Floors to the macrocycle block/mesocycle/phase via
      // computeMacrocycleBlock; advances volume scaling M1→M2→M3 + phase as the
      // user accumulates weeks. 0 for a brand-new user = correct (week 0, LOAD).
      weeksElapsed: trainingWeeks,
      // Fix #6 — reactive deload AA trigger (energy-down sustained). The deload
      // engine reads meta.recentSessionsForEnergy (deload/index.js:218) and
      // isEnergyDownSustained checks the 3 most recent for energyDirection==DOWN
      // (triggerHierarchy.js:244). The builder ALREADY stamps energyDirection on
      // recentSessions[*] (from persisted energyEmoji), but the deload engine
      // reads meta.recentSessionsForEnergy, NOT recentSessions[*] — the
      // field-name mismatch the audit flagged (§2). Pointing the meta field at
      // the same already-stamped array closes it: 3 consecutive red sessions →
      // REACTIVE_AA deload → intensity_modifier → intensityMod 'minus' downstream.
      // NU a new signal — the SAME energyDirection data, surfaced where deload
      // reads it. The composite trigger (performanceDropPct/restTimeMultiplier/
      // rirMismatch) needs CDL telemetry not assembled here — DEFERRED (see report).
      recentSessionsForEnergy: recentSessions,
      // Audit MED — emoji-ul de energie de AZI (EnergyCheck) → engine Energy
      // Adjustment (resolveEmojiState citeste meta.energyEmoji). Era nesetat →
      // engine inert pe sesiunea curenta (green→UP / yellow→NONE / red→DOWN nu
      // contribuiau). Omit cand fara energy-check azi (engine ramane inert onest,
      // NU fabricam semnal). exactOptionalPropertyTypes: spread conditional.
      ...(todayEnergyEmoji !== undefined ? { energyEmoji: todayEnergyEmoji } : {}),
    },
  };
}

// DP.getSmartRecommendation return slice we read for the planned target (kg +
// repsTarget). DP emits a richer object (status/statusLabel/repsRange/...) but
// the planner only needs the prescriptive numbers. `kg` already rounded to the
// equipment step inside DP.recommend (which getSmartRecommendation wraps);
// `repsTarget` is phase-aware (DP reads phase-override for CUT). When readiness
// < 60 on an INCREASE day, getSmartRecommendation HOLDS the weight at lastW
// (readiness gate) — that suppression IS the wire fix #1.
interface DpRecommendation {
  kg?: number;
  repsTarget?: number;
}

// Fix #4 — default rest fallback (the prior hardcode) used only when the engine
// emits no rest range (empty user / goalAdaptation blueprint absent).
const DEFAULT_REST_SEC = 90;

/**
 * Resolve a per-exercise rest in seconds from the engine's goal-adaptation rest
 * range [minSec, maxSec] (template × phase × mode). A real coach rests compounds
 * longer than isolation, so compounds (COMPOUND_EX) take the range MAX, isolation
 * the range MIN. Range absent/malformed → DEFAULT_REST_SEC (prior 90s behavior).
 * Pure.
 *
 * @param engineName English canonical exercise name (COMPOUND_EX keys on it)
 * @param restRange engine rest-time prescription [minSec, maxSec] or null
 */
function resolveRestSec(
  engineName: string,
  restRange: readonly [number, number] | null,
): number {
  if (
    !Array.isArray(restRange) ||
    restRange.length < 2 ||
    !Number.isFinite(restRange[0]) ||
    !Number.isFinite(restRange[1])
  ) {
    return DEFAULT_REST_SEC;
  }
  const [minSec, maxSec] = restRange;
  return COMPOUND_EX.includes(engineName) ? maxSec : minSec;
}

/**
 * Map engine exercise (sessionBuilder output `{ name, sets }`) to
 * PlannedExercise consumer shape. Engine emits only name + sets count; the
 * prescriptive targetKg/targetReps come from the DP progressive-overload brain
 * (CRIT C1 — was hardcoded targetKg:20 / targetReps:10 for every exercise).
 *
 *   - User WITH logged history (DP.getLogs(name) non-empty): targetKg/
 *     targetReps from DP.getSmartRecommendation(name, readinessScore, null) —
 *     the readiness-GATED double-progression output keyed on the ENGLISH
 *     canonical name. On an INCREASE day with readiness < 60 the engine holds
 *     the weight at lastW instead of adding a step ("don't push heavy when you
 *     slept badly"). readinessScore null (no energy-check today) → engine runs
 *     the plain double-progression (no gate), identical to the prior behavior.
 *   - NEW user / cold start (no logs): targetKg from suggestStartWeight(name,
 *     experienceEn) population prior; targetReps from DP's phase-aware INIT
 *     repsTarget (rMin, CUT-capped via phase-override).
 *
 * CRIT parity: the engine name is an English canonical key (PR records,
 * alternativeEngine maps, DP REP_RANGES). The `id` slug + the DP/cold-start
 * lookups all use that English name; only `name`/`sub` carry the Romanian
 * display form (Romanian-first app) via exerciseDisplay.toExerciseDisplay.
 *
 * @param readinessScore live today readiness (getComputedReadinessScore) read
 *   ONCE by the composer and threaded in — null when no energy-check logged.
 * @param restRange engine goal-adaptation rest prescription [minSec, maxSec]
 *   (template × phase × mode), threaded from the plan. Compounds rest at the
 *   range MAX, isolation at MIN (resolveRestSec). null → 90s fallback.
 */
function toPlannedExercise(
  engineEx: { name: string; sets: number },
  idx: number,
  experienceEn: string,
  readinessScore: number | null,
  restRange: readonly [number, number] | null,
): PlannedExercise {
  const slug = engineEx.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const display = toExerciseDisplay(engineEx.name);
  // English canonical name — DP records + cold-start guideline key on it.
  // getSmartRecommendation wraps DP.recommend + applies the readiness gate
  // (holds weight on INCREASE days when readinessScore < 60). This is the
  // cycle-4 fix completion: the prescribed kg now consumes today's readiness.
  const rec = DP.getSmartRecommendation(
    engineEx.name,
    readinessScore,
    null,
  ) as DpRecommendation | null;
  const hasHistory = DP.getLogs(engineEx.name, 1).length > 0;
  const targetReps =
    rec && typeof rec.repsTarget === 'number' ? rec.repsTarget : 10;
  // With history → DP weight (double-progression). Cold start → population
  // prior scaled by experience (DP INIT default 20/10 is too coarse for a new
  // user; suggestStartWeight is per-exercise calibrated).
  const targetKg = hasHistory
    ? rec && typeof rec.kg === 'number'
      ? rec.kg
      : suggestStartWeight(engineEx.name, experienceEn)
    : suggestStartWeight(engineEx.name, experienceEn);
  return {
    id: `${slug}-${idx}`,
    name: display.name,
    // English canonical name preserved for WP-5 substitution + DP/library keys.
    engineName: engineEx.name,
    ...(display.sub !== undefined ? { sub: display.sub } : {}),
    sets: engineEx.sets,
    targetReps,
    targetKg,
    // Fix #4 — rest from the engine rest range (compound=MAX / isolation=MIN),
    // NOT the prior hardcoded 90 for every exercise.
    restSec: resolveRestSec(engineEx.name, restRange),
  };
}

/**
 * WP-5 moat substitution — build a ready-to-render PlannedExercise for an
 * alternative swapped IN for a blocked/refused exercise. Re-uses the SAME
 * prescription path as the initial plan (toPlannedExercise) so the alternative
 * arrives with a real DP / cold-start targetKg/targetReps/rest, then stamps the
 * substitution marker (`swapReason` → WorkoutPreview "Inlocuit · {motiv}").
 *
 * Reads experience (cold-start scaling) + live readiness (DP gate) at this
 * boundary — the same sources composePlannedWorkoutToday threads in — so a
 * mid-session swap is prescribed consistently with the rest of the session.
 * Rest range is not re-derived per swap (the goal-adaptation range needs the
 * full pipeline); restSec falls back to the engine default inside
 * toPlannedExercise (null restRange → 90s), which matches an un-planned swap.
 *
 * @param engineName English canonical name of the alternative
 * @param idx position in the session (id slug)
 * @param swapReason short RO reason surfaced in the display sub slot
 */
export function buildSwappedExercise(
  engineName: string,
  idx: number,
  swapReason: string,
): PlannedExercise {
  const experienceEn = experienceToEngine(
    useOnboardingStore.getState().data.experience,
  );
  const readinessScore = readinessScoreForUser();
  const planned = toPlannedExercise(
    { name: engineName, sets: 3 },
    idx,
    experienceEn,
    readinessScore,
    null,
  );
  return { ...planned, swapReason };
}

// Audit HIGH "0 kg" — secunde estimate per set de lucru (timp sub tensiune +
// tranzitie/setup), folosit la estimarea de durata. Banda tipica 30-50s pentru
// un set de hipertrofie; 40 = mijloc conservativ. Estimare documentata.
const SET_WORK_SEC = 40;

/**
 * Tonajul planificat REAL (kg) — suma sets × targetReps × targetKg peste
 * exercitiile prescrise. Inlocuieste hardcode-ul volumeKg:0 din engine (care
 * facea WorkoutPreview sa arate "0 kg"). Returns null cand NU exista exercitii
 * (sau toate cu greutate 0, ex: bodyweight) → caller cade pe fallback-ul UI.
 * Pure. Rotunjit la kg.
 */
export function computePlannedVolumeKg(
  exercises: ReadonlyArray<{ sets: number; targetReps: number; targetKg: number }>,
): number | null {
  if (!Array.isArray(exercises) || exercises.length === 0) return null;
  let total = 0;
  for (const ex of exercises) {
    const sets = Number(ex.sets);
    const reps = Number(ex.targetReps);
    const kg = Number(ex.targetKg);
    if (Number.isFinite(sets) && Number.isFinite(reps) && Number.isFinite(kg)) {
      total += sets * reps * kg;
    }
  }
  // Tonaj 0 (toate bodyweight / greutati 0) → null ca UI sa cada pe fallback,
  // NU sa afiseze "0 kg" (acelasi simptom pe care il reparam).
  return total > 0 ? Math.round(total) : null;
}

/**
 * Durata estimata (minute) REAL din volumul de seturi: fiecare set ~ SET_WORK_SEC
 * de lucru + restSec de odihna, sumat peste exercitii, plus incalzirea. Inlocuieste
 * hardcode-ul estimatedDurationMin:50 din engine. Returns null cand fara exercitii
 * → caller cade pe fallback. Pure. Rotunjit la minut.
 */
export function computeEstimatedDurationMin(
  exercises: ReadonlyArray<{ sets: number; restSec: number }>,
  warmupMin: number = 0,
): number | null {
  if (!Array.isArray(exercises) || exercises.length === 0) return null;
  let totalSec = 0;
  for (const ex of exercises) {
    const sets = Number(ex.sets);
    const restSec = Number(ex.restSec);
    if (Number.isFinite(sets) && sets > 0) {
      const rest = Number.isFinite(restSec) ? restSec : 0;
      totalSec += sets * (SET_WORK_SEC + rest);
    }
  }
  if (totalSec <= 0) return null;
  const warmup = Number.isFinite(warmupMin) && warmupMin > 0 ? warmupMin : 0;
  return Math.round(totalSec / 60) + Math.round(warmup);
}

/**
 * Phase 6 task_02 real wire. Async pipeline consumer — caller (5 consumers
 * React) handles loading state via useState + useEffect pattern. Returns
 * null pe rest day OR pipeline hard halt OR thrown exception (fail-silent).
 */
export async function composePlannedWorkoutToday(
  now: Date = new Date(),
): Promise<PlannedWorkoutOutput | null> {
  try {
    const userState = buildUserStateForPipeline();
    const plan = await getDailyWorkout(userState, now);
    if (plan === null) return null;
    // RO onboarding experience → EN engine bucket once (cold-start weight
    // scaling). RO strings never reach the engine (CRIT C1 map above).
    const experienceEn = experienceToEngine(
      useOnboardingStore.getState().data.experience,
    );
    // Fix #1 — live readiness read ONCE here, threaded into every exercise's
    // DP.getSmartRecommendation. Null when no energy-check logged today (engine
    // skips the gate). Same source the readiness card + "why" explainer use.
    const readinessScore = readinessScoreForUser();
    // Fix #4 — engine goal-adaptation rest range [minSec, maxSec] threaded into
    // each exercise's restSec (compound=MAX / iso=MIN). null → 90s fallback.
    const restRangeRaw = plan.restTimeRange as [number, number] | null | undefined;
    const restRange =
      Array.isArray(restRangeRaw) && restRangeRaw.length >= 2 ? restRangeRaw : null;
    const exercises = (plan.exercises ?? []).map((ex, idx) =>
      toPlannedExercise(ex, idx, experienceEn, readinessScore, restRange),
    );
    // Deload engine emits intensity_modifier object always (IDLE state =
    // {rir_increment:0, intensity_pct_decrement:0}). 'minus' only when
    // ACTIVE deload (any non-zero modifier field). Phase 7+ wires 'plus'
    // via Energy Adjustment composite output.
    const mod = plan.intensityModifier as { rir_increment?: number; intensity_pct_decrement?: number } | null;
    const hasActiveDeload = mod !== null && (
      (mod.rir_increment ?? 0) > 0 || (mod.intensity_pct_decrement ?? 0) > 0
    );
    // F-workout-preview/T1 — Engine Warm-up blueprint surface. Engine emits
    // duration_min (5-10 adaptive) + ui_label "Incalzire ~X min" via
    // src/engine/warmup/index.js:289-300. Map to consumer-friendly {line,
    // durationMin}. Null when ui_label missing/empty (defensive guard).
    const warmupRaw = plan.warmup as { duration_min?: number; ui_label?: string } | null;
    const warmupLine = typeof warmupRaw?.ui_label === 'string' ? warmupRaw.ui_label : '';
    const warmupDuration = typeof warmupRaw?.duration_min === 'number' ? warmupRaw.duration_min : 0;
    const warmup = warmupRaw !== null && warmupLine.length > 0
      ? { line: warmupLine, durationMin: warmupDuration }
      : null;
    // Audit HIGH "0 kg" — tonajul planificat REAL din exercitiile prescrise
    // (sets × targetReps × targetKg), NU hardcode-ul 0 din engine
    // (scheduleAdapter.js volumeKg:0 → WorkoutPreview arata "0 kg" via `0 ?? fb`).
    // Sumam aici (React-side) unde targetKg/targetReps deja reale per exercitiu
    // (DP / cold-start). null cand nu avem exercitii → fallback WorkoutPreview.
    const volumeKg = computePlannedVolumeKg(exercises);
    // Durata estimata REAL din volumul de seturi + odihna (vs hardcode 50 engine):
    // per set ~ timp sub tensiune/tranzitie + restSec. null cand fara exercitii.
    const estimatedDuration = computeEstimatedDurationMin(exercises, warmup?.durationMin ?? 0);
    return {
      workoutTitle: plan.workoutTitle ?? 'Antrenament azi',
      exerciseCount: exercises.length,
      // Real-or-fallback: cand computul da null (fara exercitii), cade pe valoarea
      // engine (?? 50 / ?? 0 in WorkoutPreview). NU mai forteaza 0/50 hardcodat.
      estimatedDuration: estimatedDuration ?? plan.estimatedDurationMin ?? 50,
      intensityMod: hasActiveDeload ? 'minus' : 'normal',
      exercises,
      volumeKg: volumeKg ?? plan.volumeKg ?? 0,
      warmup,
    };
  } catch (e) {
    console.warn('[scheduleAdapterAggregate] composePlannedWorkoutToday failed:', e);
    return null;
  }
}
