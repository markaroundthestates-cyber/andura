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
} from './userTdee';
// Problem 2 — AUTO phase auto-detection din weight trend (goal 'auto' onboarding
// → engine recomanda faza, NU mentenanta flat). Cold-start onest: fara istoric
// greutate → MAINTAIN (×1.0). PHASES enum + detector pure din Engine #2.
import { useProgresStore } from '../stores/progresStore';
// BUG #13 + BUG #4 safety — guardrail anti-subnutritie pe OUTPUT-ul de kcal:
// cand user-ul e deja subponderal (BMI <= 18.5) NU servim deficit nici mentenanta,
// ci un surplus moderat de crestere (clampKcalToHealthyFloor ridica la TDEE×1.08).
// computeBMI alimenteaza si AUTO body-comp detection (BUG #5).
import { clampKcalToHealthyFloor } from '../../engine/bodyComposition.js';
import { useOnboardingStore } from '../stores/onboardingStore';
// daysUntilTarget feeds the coherence-model rate-cap sizing (deadline → days).
import { daysUntilTarget } from './targetSafety';
// Coherence model 2026-05-30 (Daniel repro masa+target90 → 2200 deficit). The
// goal/phase DIRECTION is authoritative; the target weight only sizes the
// magnitude WITHIN that direction (rate-capped). Replaces the old precedence
// where a below-current target weight (a deficit) outranked + discarded a BULK
// goal's surplus. sizeKcalForPhase forces the sign from the phase.
import {
  targetDirection,
  sizeKcalForPhase,
  type PhaseToken,
} from './goalPhaseModel';
import type { NutritionTargetsEngine } from './engineWrappers.types';
// resolveActivePhase + AUTO detector + manual-override gating moved to the
// ./phaseResolution LEAF (severs the nutrition→userTdee→workoutStore→
// workoutStore.logic→nutrition circular edge, madge hard-gate). Imported back
// here for the coherence-model functions + re-exported below → public API kept.
import {
  resolveActivePhase,
  PHASE_MULTIPLIERS,
  isPhaseTokenEnabledForDirection,
} from './phaseResolution';
export { resolveActivePhase, getAutoDetectedPhaseLabelRo } from './phaseResolution';

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
// resolveActivePhase + PHASE_TOKEN_TO_GOAL + isPhaseTokenEnabledForDirection +
// PHASE_MULTIPLIERS moved to the ./phaseResolution LEAF (severs the
// nutrition→userTdee→workoutStore→workoutStore.logic→nutrition circular edge).
// Imported back at the top of this module; resolveActivePhase re-exported there.

/**
 * #76 — resolve the ACTIVE energy MAGNITUDE (phase + deficit/surplus SEVERITY) for
 * the session-volume modulation. The SEVERITY is the deficit/surplus kcal-shift as
 * a FRACTION of maintenance (|kcalTarget − maintenance| / maintenance), derived
 * from the SAME coherent kcal-sizing model the nutrition UI uses (resolveActivePhase
 * → getCoherentKcalToday → sizeKcalForPhase.dailyShift). This is the actual
 * kcal-delta magnitude, NOT the bayesian likelihood typing (which is async + needs
 * a full BN ctx not assembled at this sync compose boundary — see the report).
 *
 * Returns null when there is NO directional energy signal (cold-start, no goal/
 * target, MAINTENANCE, or no maintenance estimate) so the caller falls back to the
 * neutral (no-modulation) path. severity is clamped [0,1]. I/O boundary (reads the
 * same stores resolveActivePhase / getCoherentKcalToday read); pure-ish, no clock.
 *
 * @returns {{ phase: PhaseToken, severity: number } | null}
 */
export function resolveEnergyMagnitude(): { phase: PhaseToken; severity: number } | null {
  const phase = resolveActivePhase();
  // No phase, or MAINTENANCE → no deficit/surplus magnitude to modulate against.
  if (phase === null || phase === 'MAINTENANCE') return null;
  const tdee = readUserMaintenanceTDEE();
  if (tdee === null || !Number.isFinite(tdee) || tdee <= 0) return null;
  const coherent = getCoherentKcalToday(tdee);
  if (coherent === null) return null;
  // severity = the absolute kcal shift as a fraction of maintenance. A CUT lands
  // below maintenance (deficit), a BULK/STRENGTH above (surplus) — either way the
  // magnitude is |delta|/maintenance, clamped [0,1].
  const severity = Math.min(1, Math.max(0, Math.abs(tdee - coherent.kcal) / tdee));
  return { phase, severity };
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

// detectAutoPhaseKey + AUTO_PHASE_LABELS_RO + getAutoDetectedPhaseLabelRo moved
// to the ./phaseResolution LEAF (single-source AUTO detector). getAutoDetected-
// PhaseLabelRo is re-exported at the top of this module → public API unchanged.
