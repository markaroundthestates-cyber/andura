// ══ ENGINE WRAPPERS — Nutrition / kcal coherence math ════════════════════
// Hygiene split (barrel re-export, zero behavior change): the goal/phase/
// target-weight kcal coherence model + AUTO phase detection, extracted verbatim
// from engineWrappers.ts. The instrumented Bayesian-nutrition ADAPTERS
// (getNutritionTargetsToday / readTdeeEstimateKcal) stay in engineWrappers.ts
// and consume these helpers — only the pure sizing math + private I/O-boundary
// helpers live here. Re-exported by engineWrappers.ts; public API unchanged.
//
// Cross-refs:
//   - DECISIONS.md §D-LEGACY-017 Bayesian Nutrition Inference
//   - DECISIONS.md §D-LEGACY-027 Engine Energy Adjustment
//   - Coherence model 2026-05-30 (goal/phase DIRECTION authoritative)

// Audit MED — sex-aware kcal floor (Daniel CEO directive 2026-05-26: minim
// ABSOLUT femei 1000 / barbati 1200). RECOMMENDED target se clampeaza la acest
// floor per-sex (constants.js:293-311 rol (a)), NU la 1200 flat — aliniaza calea
// de recomandare cu intentia LOCKED + filtrul de observatii (resolveKcalFloorForSex).
import { resolveKcalFloorForSex } from '../../engine/bayesianNutrition/constants.js';
// Piesa 1 nutrition-brain fix — real per-user maintenance TDEE base (omoara
// baza flat 2640). Multiplicatorul de faza se aplica pe TDEE-ul real per-user.
import {
  readUserMaintenanceTDEE,
  readUserWeightKg,
  getCurrentWeightKg,
  computeProteinTargetG,
  readOnboardingGoal,
} from './userTdee';
// Problem 2 — AUTO phase auto-detection din weight trend (goal 'auto' onboarding
// → engine recomanda faza, NU mentenanta flat). Cold-start onest: fara istoric
// greutate → MAINTAIN (×1.0). PHASES enum + detector pure din Engine #2.
import {
  detectAutoPhaseFromWeightTrend,
  detectAutoPhaseFromBodyComp,
} from '../../engine/goalAdaptation/phaseAutoDetection.js';
import { useProgresStore } from '../stores/progresStore';
// BUG #13 + BUG #4 safety — guardrail anti-subnutritie pe OUTPUT-ul de kcal:
// cand user-ul e deja subponderal (BMI <= 18.5) NU servim deficit nici mentenanta,
// ci un surplus moderat de crestere (clampKcalToHealthyFloor ridica la TDEE×1.08).
// computeBMI alimenteaza si AUTO body-comp detection (BUG #5).
import { clampKcalToHealthyFloor, computeBMI } from '../../engine/bodyComposition.js';
import { useOnboardingStore } from '../stores/onboardingStore';
import { estimateBfFraction } from './scheduleAdapterAggregate';
// daysUntilTarget feeds the coherence-model rate-cap sizing (deadline → days).
import { daysUntilTarget } from './targetSafety';
// Coherence model 2026-05-30 (Daniel repro masa+target90 → 2200 deficit). The
// goal/phase DIRECTION is authoritative; the target weight only sizes the
// magnitude WITHIN that direction (rate-capped). Replaces the old precedence
// where a below-current target weight (a deficit) outranked + discarded a BULK
// goal's surplus. sizeKcalForPhase forces the sign from the phase.
import {
  targetDirection,
  phaseForGoal,
  enabledGoalsForDirection,
  sizeKcalForPhase,
  type PhaseToken,
} from './goalPhaseModel';
import type { Goal } from '../stores/onboardingStore';
import type { NutritionTargetsEngine } from './engineWrappers.types';

export const BASELINE_NUTRITION: NutritionTargetsEngine = {
  kcalTarget: 2640,    // mockup verbatim L1812
  proteinTargetG: 180, // mockup verbatim L1825
  fatG: 70,
  carbsG: 280,
  source: 'baseline',
  confidence: 0,
};

/**
 * Audit MED — floor-ul de kcal per-user pe sex (CEO directive 2026-05-26: femei
 * 1000 / barbati 1200, minim ABSOLUT). Citeste sexul din onboarding la I/O
 * boundary, deleaga la resolveKcalFloorForSex (fallback 1200 KCAL_FLOOR_DAILY_MIN
 * cand sex absent). Aliniaza calea de RECOMANDARE cu filtrul de observatii
 * (acelasi floor per-sex). Inlocuieste const-ul local flat KCAL_FLOOR_DAILY_MIN
 * 1200 (LOCK 8) — floor-ul absolut traieste acum canonic in bayesianNutrition/
 * constants.js (resolveKcalFloorForSex fallback), single source.
 */
export function readUserKcalFloor(): number {
  return resolveKcalFloorForSex(useOnboardingStore.getState().data.sex);
}

export function mapBNConfidence(c: unknown): number {
  if (c === 'high') return 1;
  if (c === 'medium') return 0.5;
  return 0.2;
}

/**
 * Piesa 1 nutrition-brain fix — per-user nutrition baseline cand engine NU emite
 * estimare (tier 'none' T0 fresh / posterior.mu absent / engine throws).
 *
 * Omoara baza flat 2640: kcalTarget = TDEE-ul REAL per-user (mentenanta) cand
 * override de faza absent, sau TDEE × multiplicator de faza cand override
 * prezent. proteinTarget = g/kg × greutate per-user. Maria 40kg mentenanta →
 * ~1300-1500; Marius 110kg/2m bulk → ~3500-4000.
 *
 * Pure I/O-boundary read (onboardingStore) + delegare la userTdee pure helpers.
 * Fallback la BASELINE_NUTRITION flat DOAR cand stats onboarding absente
 * (cold start fara onboarding) — ultim resort, NU default.
 *
 * @param phaseKcal kcal-ul derivat din override-ul de faza (deja TDEE-real ×
 *   multiplicator via getPhaseOverrideKcalToday), sau null cand AUTO/absent.
 */
export function buildPerUserBaseline(phaseKcal: number | null): NutritionTargetsEngine {
  const tdee = readUserMaintenanceTDEE();
  // Coherence model 2026-05-30 — the goal/phase DIRECTION is authoritative; the
  // target weight only sizes the magnitude within that direction (rate-capped).
  // getCoherentKcalToday already folds in goal + AUTO derivation + target sizing
  // + sex floor (it reads `phase-override` itself), so it SUPERSEDES the old
  // `targetKcal > goalMult` precedence that let a below-current target weight
  // (a deficit) discard a BULK goal's surplus (Daniel repro masa+target90).
  const coherent = getCoherentKcalToday(tdee);
  // Stats onboarding absente (cold start) → fallback flat 2640 ultim resort.
  if (tdee === null && phaseKcal === null && coherent === null) return BASELINE_NUTRITION;

  const baseTdee = tdee as number;
  const kcalFloor = readUserKcalFloor(); // sex-aware (femei 1000 / barbati 1200)
  // Precedence: manual phase override snapshot (phase-log kcal, deterministic at
  // change-time) > coherent goal/target/AUTO sizing > maintenance (TDEE real).
  const kcalTarget =
    phaseKcal !== null
      ? phaseKcal
      : coherent !== null
        ? coherent.kcal
        : Math.max(Math.round(baseTdee), kcalFloor);
  // L7 — surface the base-target safety limit, but ONLY when the coherent sizing
  // is the value we actually show (a manual phase-override snapshot supersedes it).
  const safetyLimited = phaseKcal === null ? resolveSafetyLimited(coherent) : undefined;

  const proteinTargetG =
    computeProteinTargetG(readUserWeightKg()) ?? BASELINE_NUTRITION.proteinTargetG;

  // BUG #13 safety — acelasi guardrail si pe calea baseline per-user (ex: user
  // fresh subponderal care a ales "slabire" la onboarding → goalMult CUT 0.82).
  const guarded = applyHealthyFloorGuardrail(kcalTarget);

  return {
    kcalTarget: guarded.kcal,
    proteinTargetG,
    fatG: BASELINE_NUTRITION.fatG,
    carbsG: BASELINE_NUTRITION.carbsG,
    // 'engine' cand am o estimare derivata real (TDEE per-user sau override
    // faza); 'baseline' doar cand cadem pe flat 2640 (cold start).
    source: tdee !== null || phaseKcal !== null ? 'engine' : 'baseline',
    confidence: 0,
    healthyFloorClamped: guarded.clamped,
    // When the subponderal guardrail RAISED the target, it was not held down by
    // a safety floor/cap — suppress the limit note so the two never contradict.
    ...(!guarded.clamped && safetyLimited ? { safetyLimited } : {}),
  };
}

// Valid manual-override tokens (membership check only — the kcal MAGNITUDE is
// sized coherently via sizeKcalForPhase, NOT these keys; see getPhaseOverrideKcalToday).
export const PHASE_MULTIPLIERS: Record<string, number> = {
  CUT: 0.82,
  BULK: 1.08,
  MAINTENANCE: 1.0,
  STRENGTH: 1.05,
};

/**
 * BUG #13 + BUG #4 safety chokepoint — aplica guardrail-ul anti-subnutritie pe
 * kcal-ul final. Cand user-ul e deja subponderal (BMI <= 18.5), ridica kcal-ul
 * la un surplus moderat de crestere (TDEE×1.08) daca recomandarea e sub el —
 * subponderalul trebuie sa CREASCA spre o greutate sanatoasa, NU sa stea in
 * deficit/mentenanta. Citeste greutate/inaltime (onboardingStore) + mentenanta
 * reala (readUserMaintenanceTDEE) la I/O boundary, deleaga la pura
 * clampKcalToHealthyFloor.
 *
 * Returns kcal-ul (posibil ridicat) + `clamped` (UI safety message). Cand lipsesc
 * stats (cold start) → passthrough (pura returneaza clamped=false).
 */
export function applyHealthyFloorGuardrail(kcal: number): { kcal: number; clamped: boolean } {
  const { height } = useOnboardingStore.getState().data;
  // Canonical greutate curenta (ultima logata > onboarding) pentru BMI — audit
  // CRIT: logarea unei greutati misca detectia de subponderal + tinta de kcal.
  const weight = getCurrentWeightKg();
  const maintenanceKcal = readUserMaintenanceTDEE();
  const r = clampKcalToHealthyFloor({
    kcalRecommendation: kcal,
    maintenanceKcal: maintenanceKcal ?? NaN,
    weightKg: weight,
    heightCm: height,
  });
  return { kcal: r.kcal, clamped: r.clamped };
}
/**
 * Resolve the ACTIVE phase token, coherence-model precedence (2026-05-30):
 *   1. manual phase override (B001 SchimbaFaza) when set + not AUTO — the user
 *      explicitly picked a phase; honor it UNLESS it contradicts the target-weight
 *      direction (a BULK/STRENGTH override under a LOSE target, or a CUT override
 *      under a GAIN target). A stale override must not outrank a fresher, clearly
 *      contradicting target: treat it invalid (enabledGoalsForDirection) and fall
 *      through to the coherent goal/AUTO resolution below — the same reconciliation
 *      the goal-vs-target path already applies (override-vs-target parity).
 *   2. else the onboarding goal's phase (phaseForGoal). 'auto'/null → AUTO.
 *   3. AUTO resolves to the real phase, signal precedence:
 *      a. target-weight direction (the user's explicit master intent): LOSE→CUT,
 *         GAIN→BULK. A MAINTAIN-band target falls through.
 *      b. the established Engine #2 detector (detectAutoPhaseKey): weight-trend
 *         (what the body actually does over time) with a sex-aware body-comp
 *         fallback (BMI + BF%). Always yields a phase (cold-start → MAINTENANCE).
 *
 *   The pure deriveAutoPhase() in goalPhaseModel (men BF>15→CUT / <12→BUILD,
 *   women BF>25/22) is the literal spec model used for the gating/derivation
 *   contract + its own unit tests; the engine wiring REUSES the established
 *   detector here so the well-tested AUTO body-comp behavior is not regressed.
 * Pure-ish I/O boundary (reads localStorage + stores). Defensive → AUTO.
 */
// Phase token → its equivalent onboarding goal (inverse of phaseForGoal), so a
// manual override can be tested against the SAME gating set the goal card uses.
const PHASE_TOKEN_TO_GOAL: Record<string, Goal> = {
  CUT: 'slabire',
  BULK: 'masa',
  STRENGTH: 'forta',
  MAINTENANCE: 'mentenanta',
};

/**
 * True when a manual phase override is coherent with the target-weight direction
 * (reuses enabledGoalsForDirection — the goal-card gating set). No direction (no
 * target / MAINTAIN-band) → nothing to contradict, override stays valid. AUTO is
 * never reconciled here (handled before this). Pure.
 */
function isPhaseTokenEnabledForDirection(
  token: PhaseToken,
  dir: ReturnType<typeof targetDirection>,
): boolean {
  if (dir === null) return true;
  const goal = PHASE_TOKEN_TO_GOAL[token];
  if (goal === undefined) return true;
  return enabledGoalsForDirection(dir).has(goal);
}

export function resolveActivePhase(): PhaseToken | null {
  // Target-weight direction (master intent) — needed up front so a manual
  // override can be reconciled against it before it is honored.
  const { weightKg } = useProgresStore.getState().targetObiectiv;
  const dir = targetDirection(getCurrentWeightKg(), weightKg);
  try {
    const raw = JSON.parse(localStorage.getItem('phase-override') ?? 'null') as string | null;
    if (raw && raw !== 'AUTO' && PHASE_MULTIPLIERS[raw] !== undefined) {
      // Override-vs-target reconciliation (parity with goal-vs-target below): a
      // manual phase that contradicts a clear target direction (e.g. a BULK
      // override while target < current) is treated as INVALID via the same
      // gating set the goal card uses, and we fall through to the coherent
      // goal/AUTO resolution. A non-contradicting override is honored.
      if (!isPhaseTokenEnabledForDirection(raw as PhaseToken, dir)) {
        /* contradicting override → drop, fall through to goal-derived */
      } else {
        return raw as PhaseToken;
      }
    }
  } catch {
    /* fall through to goal-derived */
  }
  const goal = readOnboardingGoal();
  // Cold-start, no onboarding goal AND no target → no directional signal at all;
  // return null so the caller falls back to plain maintenance (no fabricated
  // deficit/surplus). A target set without a goal still drives direction below.
  if ((goal === null || goal === undefined) && dir === null) return null;

  const token = phaseForGoal(goal as Parameters<typeof phaseForGoal>[0]);
  if (token !== 'AUTO') return token;

  // AUTO — (a) target direction is the explicit master signal.
  if (dir === 'LOSE') return 'CUT';
  if (dir === 'GAIN') return 'BULK';

  // (b) established Engine #2 detector (weight-trend + sex-aware body-comp).
  const trendKey = detectAutoPhaseKey();
  return trendKey === 'CUT' || trendKey === 'BULK' || trendKey === 'STRENGTH'
    ? (trendKey as PhaseToken)
    : 'MAINTENANCE';
}

/**
 * Coherence-model kcal (2026-05-30) — the ONE function that makes goal + target
 * weight + phase + kcal coherent. The active phase sets the SIGN (CUT=deficit,
 * BULK=surplus, MAINTENANCE≈0, STRENGTH≈slight surplus); the target weight +
 * deadline only size the MAGNITUDE within that direction, rate-capped (1.5kg/wk
 * loss, 0.5kg/wk gain) + sex-floored. So masa + target-90 from 110 now yields a
 * SURPLUS (the Daniel repro is fixed — a below-current target can never flip a
 * BULK goal into a deficit). Returns null when no maintenance estimate (caller
 * cold-start fallback). I/O boundary.
 *
 * Returns the kcal target PLUS the two safety signals from sizeKcalForPhase
 * (rateCapped = a cap reduced the shift, floored = the sex floor clamped the
 * result) so the display layer can surface a "limitat pentru siguranta" note
 * explaining WHY an extreme-profile target landed where it did. Returns null
 * when there is no directional signal (caller falls back to maintenance).
 */
export interface CoherentKcalResult {
  kcal: number;
  rateCapped: boolean;
  floored: boolean;
}

/**
 * Map the coherent-sizing safety flags to the single display signal. Floor wins
 * over cap when both fire — hitting the hard minimum is the stronger statement
 * (the deeper safety boundary) than a rate cap. null when nothing was limited.
 */
export function resolveSafetyLimited(
  r: CoherentKcalResult | null,
): 'floored' | 'capped' | undefined {
  if (!r) return undefined;
  if (r.floored) return 'floored';
  if (r.rateCapped) return 'capped';
  return undefined;
}
export function getCoherentKcalToday(tdee: number | null): CoherentKcalResult | null {
  if (tdee === null || !Number.isFinite(tdee) || tdee <= 0) return null;
  const phase = resolveActivePhase();
  // No directional signal (cold-start, no goal, no target) → plain maintenance.
  if (phase === null) return null;
  const { weightKg, month } = useProgresStore.getState().targetObiectiv;
  const currentWeight = getCurrentWeightKg();
  const days = month ? daysUntilTarget(month) : null;
  const r = sizeKcalForPhase({
    phase,
    maintenanceTdee: tdee,
    currentKg: currentWeight,
    targetKg: weightKg,
    daysRemaining: days,
    kcalFloor: readUserKcalFloor(),
  });
  return { kcal: r.kcalTarget, rateCapped: r.rateCapped, floored: r.floored };
}

export function getPhaseOverrideKcalToday(): number | null {
  try {
    const phaseRaw = JSON.parse(localStorage.getItem('phase-override') ?? 'null') as
      | string
      | null;
    if (!phaseRaw || phaseRaw === 'AUTO') return null;
    const multiplier = PHASE_MULTIPLIERS[phaseRaw];
    if (multiplier === undefined) return null;
    // Override-vs-target reconciliation (parity with resolveActivePhase): a manual
    // override that contradicts a clear target direction is NOT honored here — return
    // null so the precedence in getNutritionTargetsToday falls through to the coherent
    // path (which reconciles the override to the actual direction). Anti-stale.
    const { weightKg } = useProgresStore.getState().targetObiectiv;
    const dir = targetDirection(getCurrentWeightKg(), weightKg);
    if (!isPhaseTokenEnabledForDirection(phaseRaw as PhaseToken, dir)) return null;
    // Try today's phase-log entry first (snapshot at change-time, deterministic)
    const todayISO = new Date().toLocaleDateString('sv');
    const phaseLog = JSON.parse(localStorage.getItem('phase-log') ?? '[]') as Array<{
      date: string;
      kcalTarget: number;
      ts?: number;
    }>;
    const todayEntry = phaseLog.find((e) => e.date === todayISO);
    const kcalFloor = readUserKcalFloor(); // sex-aware (femei 1000 / barbati 1200)
    // SINGLE-PATH sizing (audit MED 2, 2026-05-31): the displayed override kcal is
    // sized by the SAME coherent path AUTO uses (resolveActivePhase →
    // sizeKcalForPhase), NOT a divergent flat multiplier. Previously explicit CUT
    // used ×0.82 while AUTO-resolved CUT used −20% (×0.80) — same phase, 54 kcal
    // apart (Daniel repro 2173 AUTO vs 2227 explicit). The snapshot is now a
    // ts-recency GATE only; its stored kcal no longer drives the magnitude.
    const baseTdee = readUserMaintenanceTDEE() ?? BASELINE_NUTRITION.kcalTarget;
    const coherent = getCoherentKcalToday(baseTdee);
    const sizedKcal =
      coherent !== null ? coherent.kcal : Math.max(Math.round(baseTdee), kcalFloor);
    if (todayEntry) {
      // Recency: a FRESHER same-day weigh-in (ts) outranks the morning snapshot →
      // return null so the coherent path recomputes off the fresh weight. Older
      // snapshots without `ts` keep the prior snapshot-wins behavior.
      const snapTs = todayEntry.ts;
      const latestWeighInTs = useProgresStore
        .getState()
        .weightLog.reduce((m, e) => (Number.isFinite(e.ts) && e.ts > m ? e.ts : m), 0);
      if (typeof snapTs === 'number' && latestWeighInTs > snapTs) return null;
      return Math.max(sizedKcal, kcalFloor); // snapshot phase honored, sized coherently
    }
    // No snapshot (override picked earlier) → size coherently off per-user maintenance.
    return Math.max(sizedKcal, kcalFloor);
  } catch {
    return null;
  }
}

/**
 * AUTO phase key — combina DOUA semnale pure (Engine #2):
 *   1. weight-trend (detectAutoPhaseFromWeightTrend): ce face corpul de fapt in
 *      timp. Are PRIORITATE cand exista un trend directional clar (CUT/BULK) —
 *      o pierdere/crestere consistenta sustine faza respectiva.
 *   2. body-comp (detectAutoPhaseFromBodyComp): BMI + bf% din onboarding. Decide
 *      cand weight-trend e MAINTAIN (cold-start / span scurt / platou) — asa un
 *      user NOU supraponderal (110kg/1.84m, BMI 32.5, fara istoric) primeste CUT
 *      in loc de mentenanta tacuta (BUG #5).
 *
 * Mapeaza PHASES engine → cheile PHASE_MULTIPLIERS ('MAINTAIN' → 'MAINTENANCE').
 * Defensive: throw → 'MAINTENANCE'. Pure-ish I/O boundary (citeste stores).
 */
function detectAutoPhaseKey(): string {
  try {
    const phaseToKey = (phase: string): string =>
      phase === 'CUT' ? 'CUT' : phase === 'BULK' ? 'BULK' : 'MAINTENANCE';

    // 1. weight-trend prioritar cand are semnal directional (CUT/BULK).
    const weightLog = useProgresStore.getState().weightLog;
    const trend = detectAutoPhaseFromWeightTrend(weightLog);
    if (trend.phase === 'CUT' || trend.phase === 'BULK') {
      return phaseToKey(trend.phase);
    }

    // 2. weight-trend MAINTAIN (cold-start/flat) → decide din compozitia corporala.
    // Canonical greutate curenta (ultima logata > onboarding) — audit CRIT.
    const { sex, height, age } = useOnboardingStore.getState().data;
    const weight = getCurrentWeightKg();
    const bfFraction = estimateBfFraction({ weight, height, age, sex });
    const bmi = computeBMI(Number(weight), Number(height));
    const bodyComp = detectAutoPhaseFromBodyComp({
      bfPctFraction: bfFraction ?? null,
      bmi,
      ...(sex ? { sex } : {}),
    });
    return phaseToKey(bodyComp.phase);
  } catch {
    return 'MAINTENANCE';
  }
}

/**
 * Problem 2 + BUG #5 (UI surface) — eticheta RO a fazei AUTO-detectate (weight
 * trend + body-comp), pentru SchimbaFaza ("Auto → Mentinere/Cut/Bulk recomandat").
 * Cold-start fara stats → 'Mentinere'. Reuse detectAutoPhaseKey (single source).
 */
const AUTO_PHASE_LABELS_RO: Record<string, string> = {
  CUT: 'Cut',
  BULK: 'Bulk',
  MAINTENANCE: 'Mentinere',
};
export function getAutoDetectedPhaseLabelRo(): string {
  return AUTO_PHASE_LABELS_RO[detectAutoPhaseKey()] ?? 'Mentinere';
}
