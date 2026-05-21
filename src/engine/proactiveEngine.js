// ══ PROACTIVE ENGINE — 10 verificari proactive ════════════════════════════
// Returneaza alerte actionabile pentru user (proteina, somn, PR, recuperare etc.)
import { KCAL_TARGET } from '../constants.js';
import { tod, todDate, todTs } from '../db.js';
import { READINESS_PR, READINESS_MED } from './readiness.js';

/** @typedef {Record<string, number>} DateMap */
/** @typedef {Record<string, number | {score?: number} | null>} ReadinessMap */
/** @typedef {Array<{baseline?: boolean, ex?: string, date?: string, ts?: number, rpe?: number, w?: number, reps?: number}>} PaLog */
/** @typedef {Record<string, number>} HourCounts */
/** @typedef {{warning?: number, info?: number, success?: number}} SeverityOrderMap */

/**
 * Check 1: Deficit de proteina.
 * Tinta: 2.2g/kg corp. Alerta daca media ultimelor 3 zile e sub 80% din tinta.
 */
/**
 * @param {DateMap | null | undefined} prots
 * @param {number | null | undefined} bodyweightKg
 */
export function checkProteinDeficit(prots, bodyweightKg) {
  if (!prots || !bodyweightKg) return null;
  const last3 = Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return todDate(d);
  });
  const values = last3.map((d) => prots[d]).filter((v) => v !== undefined && v !== null);
  if (values.length === 0) return null;
  const avgProt = values.reduce((a, b) => a + Number(b), 0) / values.length;
  const target = bodyweightKg * 2.2;
  if (avgProt < target * 0.8) {
    return {
      type: 'protein_deficit',
      severity: 'warning',
      message: `Proteina medie ultimele ${values.length} zile: ${Math.round(avgProt)}g. Tinta: ${Math.round(target)}g. Creste aportul.`,
      avgProtein: Math.round(avgProt),
      target: Math.round(target),
    };
  }
  return null;
}

/**
 * Check 2: Sleep debt proxy — readiness trend descrescator.
 * 3+ zile consecutive cu readiness < 60.
 */
/** @param {ReadinessMap | null | undefined} readiness */
export function checkSleepDebt(readiness) {
  if (!readiness) return null;
  const last5 = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return todDate(d);
  });
  const values = last5
    .map(d => {
      const r = readiness[d];
      return typeof r === 'object' ? r?.score : (typeof r === 'number' ? r : null);
    })
    .filter(v => v !== null);

  if (values.length < 3) return null;
  const consecutiveLow = values.slice(0, 3).every((v) => v != null && v < READINESS_MED);
  if (consecutiveLow) {
    return {
      type: 'sleep_debt',
      severity: 'warning',
      message: `Readiness sub ${READINESS_MED} pentru ${values.slice(0, 3).length} zile consecutive. Prioritizeaza somnul.`,
      values: values.slice(0, 3),
    };
  }
  return null;
}

/**
 * Check 3: Oportunitate PR — readiness >= 85 si nu a mai fost PR in 14 zile.
 */
/**
 * @param {ReadinessMap | null | undefined} readiness
 * @param {Array<{baseline?: boolean, ex?: string, ts?: number, isPR?: boolean}> | null | undefined} logs
 */
export function checkPROpportunity(readiness, logs) {
  if (!readiness || !logs) return null;
  const today = tod();
  const todayScore = (() => {
    const r = readiness[today];
    return typeof r === 'object' ? r?.score : (typeof r === 'number' ? r : null);
  })();
  if (!todayScore || todayScore < READINESS_PR) return null;

  // Check last PR
  const twoWeeksAgo = Date.now() - 14 * 24 * 3600 * 1000;
  const recentPR = logs.some((l) => l.isPR && (l.ts ?? 0) > twoWeeksAgo);
  if (!recentPR) {
    return {
      type: 'pr_opportunity',
      severity: 'info',
      message: `Readiness la ${todayScore} — zi buna pentru un PR. Nu ai mai setat niciun PR in 14 zile.`,
      readinessScore: todayScore,
    };
  }
  return null;
}

/**
 * Check 4: Grupe musculare neantronate 5+ zile.
 * Computes daysSinceLast from logs directly (getMuscleState returns {muscle:0-100}).
 */
/**
 * @param {PaLog | null | undefined} logs
 * @param {Record<string, any> | null | undefined} muscleState
 * @param {Record<string, string[]> | null | undefined} muscleExercises
 */
export function checkRecoveryGroups(logs, muscleState, muscleExercises) {
  if (!logs || logs.length === 0) return null;
  if (!muscleExercises) return null;

  const now = Date.now();
  /** @type {Record<string, number>} */
  const daysSinceLast = {};

  for (const [muscle, exercises] of Object.entries(muscleExercises)) {
    const relevant = logs.filter((l) => l.ex && exercises.includes(l.ex) && !l.baseline);
    if (relevant.length === 0) {
      daysSinceLast[muscle] = Infinity;
    } else {
      const lastTs = Math.max(...relevant.map((l) => l.ts || (l.date ? new Date(l.date).getTime() : 0)));
      daysSinceLast[muscle] = (now - lastTs) / 86400000;
    }
  }

  const undertrained = Object.entries(daysSinceLast)
    .filter(([, days]) => days > 5)
    .map(([group]) => group);

  if (undertrained.length > 0) {
    return {
      type: 'undertrained_groups',
      severity: 'info',
      message: `Grupe musculare neantronate 5+ zile: ${undertrained.join(', ')}.`,
      groups: undertrained,
    };
  }
  return null;
}

/**
 * Check 5: Streak de antrenament — motivational.
 */
/** @param {PaLog | null | undefined} logs */
export function checkTrainingStreak(logs) {
  if (!logs || logs.length === 0) return null;
  const days = new Set(
    logs.map((l) => {
      const ts = l.ts ?? (l.date ? new Date(l.date).getTime() : null);
      return ts ? todTs(ts) : null;
    }).filter(Boolean)
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(todDate(d))) streak++;
    else break;
  }
  if (streak >= 5) {
    return {
      type: 'training_streak',
      severity: 'success',
      message: `${streak} zile consecutive de antrenament! Mentine ritmul.`,
      streak,
    };
  }
  return null;
}

/**
 * Check 6: Kcal sub tinta (KCAL_TARGET) — prea mult deficit.
 */
/**
 * @param {DateMap | null | undefined} kcals
 * @param {number | null | undefined} currentKcalTarget
 */
export function checkKcalDeficit(kcals, currentKcalTarget) {
  if (!kcals || !currentKcalTarget) return null;
  const last3 = Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return todDate(d);
  });
  const values = last3.map((d) => kcals[d]).filter((v) => v !== undefined && v !== null);
  if (values.length === 0) return null;
  const avgKcal = values.reduce((a, b) => a + Number(b), 0) / values.length;
  if (avgKcal < KCAL_TARGET) {
    return {
      type: 'kcal_too_low',
      severity: 'warning',
      message: `Kcal medii ultimele ${values.length} zile: ${Math.round(avgKcal)}. Sub ${KCAL_TARGET} kcal — risc de masa musculara.`,
      avgKcal: Math.round(avgKcal),
    };
  }
  return null;
}

/**
 * Check 7: Sesiune planificata dar ore de varf depasite.
 */
/** @param {Record<number, number> | null | undefined} peakHours */
export function checkPeakHours(peakHours) {
  if (!peakHours || Object.keys(peakHours).length === 0) return null;
  const hour = new Date().getHours();
  const today = new Date().getDay(); // 0-6
  const peakStart = peakHours[today];
  if (peakStart !== undefined && hour > peakStart + 2) {
    return {
      type: 'past_peak_hours',
      severity: 'info',
      message: `Ati depasit orele de varf (${peakStart}:00–${peakStart + 2}:00). Totusi antreneaza-te — orice sesiune conteaza.`,
    };
  }
  return null;
}

/**
 * Check 8: Greutate corporala in crestere la CUT.
 */
/**
 * @param {DateMap | null | undefined} weights
 * @param {boolean | null | undefined} isInCut
 */
export function checkWeightTrend(weights, isInCut) {
  if (!isInCut || !weights) return null;
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return todDate(d);
  });
  const values = last7.map((d) => weights[d]).filter((v) => v !== undefined && v !== null).map(Number);
  if (values.length < 4) return null;
  const firstHalf = values.slice(Math.floor(values.length / 2));
  const secondHalf = values.slice(0, Math.floor(values.length / 2));
  const avgOld = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgNew = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  if (avgNew > avgOld + 0.3) {
    return {
      type: 'weight_increasing_in_cut',
      severity: 'warning',
      message: `Greutatea a crescut cu ${(avgNew - avgOld).toFixed(1)}kg in CUT. Verifica caloriile.`,
      trend: +(avgNew - avgOld).toFixed(2),
    };
  }
  return null;
}

/**
 * Check 9: Nu s-a antrenat 4+ zile.
 */
/** @param {PaLog | null | undefined} logs */
export function checkInactivity(logs) {
  if (!logs || logs.length === 0) return null;
  const lastTs = Math.max(...logs.map((l) => l.ts ?? 0).filter(Boolean));
  if (!lastTs) return null;
  const daysSinceLast = (Date.now() - lastTs) / (24 * 3600 * 1000);
  if (daysSinceLast >= 4) {
    return {
      type: 'inactivity',
      severity: 'warning',
      message: `Nu ai antrenat de ${Math.floor(daysSinceLast)} zile. Reincepe cu o sesiune usoara.`,
      daysSinceLast: Math.floor(daysSinceLast),
    };
  }
  return null;
}

/**
 * Check 10: Hidratare insuficienta (waters < 2L).
 */
/** @param {DateMap | null | undefined} waters */
export function checkHydration(waters) {
  if (!waters) return null;
  const today = tod();
  const todayWater = waters[today];
  if (todayWater !== undefined && todayWater !== null && Number(todayWater) < 2000) {
    return {
      type: 'low_hydration',
      severity: 'info',
      message: `Hidratare azi: ${Number(todayWater)}ml. Tinta: 2000ml. Bea apa inainte de antrenament.`,
      ml: Number(todayWater),
    };
  }
  return null;
}

/**
 * Ruleaza toate cele 10 verificari si returneaza alertele active.
 * @param {Record<string, any> | null | undefined} ctx - CoachContext + extra fields
 * @returns {Array<any>} alerts sorted by severity (warning first, then info, then success)
 */
export function runProactiveChecks(ctx) {
  /** @type {Record<string, any>} */
  const safe = ctx ?? {};
  const {
    prots, weights, kcals, waters, readiness, logs,
    muscleState, isInCut, peakHours,
    user,
  } = safe;

  const bodyweightKg = user?.weight ?? weights?.[tod()] ?? null;
  const currentKcalTarget = user?.kcalTarget ?? null;

  const checks = [
    checkProteinDeficit(prots, bodyweightKg),
    checkSleepDebt(readiness),
    checkPROpportunity(readiness, logs),
    checkRecoveryGroups(logs, muscleState, safe.muscleExercises),
    checkTrainingStreak(logs),
    checkKcalDeficit(kcals, currentKcalTarget),
    checkPeakHours(peakHours),
    checkWeightTrend(weights, isInCut),
    checkInactivity(logs),
    checkHydration(waters),
  ];

  /** @type {Record<string, number>} */
  const SEVERITY_ORDER = { warning: 0, info: 1, success: 2 };
  const filtered = /** @type {Array<{severity?: string}>} */ (checks.filter(Boolean));
  return filtered
    .sort((a, b) => (SEVERITY_ORDER[a.severity ?? ''] ?? 9) - (SEVERITY_ORDER[b.severity ?? ''] ?? 9));
}
