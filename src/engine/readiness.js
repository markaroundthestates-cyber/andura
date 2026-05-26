import { DB, tod, todDate } from '../db.js';
import { KCAL_TARGET, PROT_TARGET } from '../constants.js';

export const READINESS_PR   = 85;
export const READINESS_HIGH = 70;
export const READINESS_MED  = 55;
export const READINESS_LOW  = 40;

export const READINESS_LABELS = {
  1: { emoji: '😴', label: 'Epuizat', sub: 'Somn prost, energie zero' },
  2: { emoji: '😕', label: 'Obosit',  sub: 'Sub forma normala' },
  3: { emoji: '😐', label: 'Normal',  sub: 'Ok, standard' },
  4: { emoji: '😊', label: 'Bine',    sub: 'Somn bun, energie buna' },
  5: { emoji: '🔥', label: 'Excelent', sub: 'Ready to crush it' },
};

/**
 * @param {number | null | undefined} readinessInput
 * @param {number | null | undefined} kcalYesterday
 * @param {number | null | undefined} protYesterday
 * @param {number | null | undefined} targetKcal
 * @param {number | null | undefined} targetProt
 */
export function getReadinessScore(readinessInput, kcalYesterday, protYesterday, targetKcal, targetProt) {
  if (readinessInput == null) return null;
  /** @type {Record<number, number>} */
  const readinessPoints = { 5: 40, 4: 35, 3: 25, 2: 15, 1: 0 };
  let score = 60 + (readinessPoints[readinessInput] ?? 0);

  if (kcalYesterday != null && targetKcal) {
    const ratio = kcalYesterday / targetKcal;
    if (ratio < 0.70) score -= 20;
    else if (ratio < 0.85) score -= 10;
    else if (ratio < 0.95) score -= 5;
  }
  if (protYesterday != null && targetProt) {
    const ratio = protYesterday / targetProt;
    if (ratio < 0.70) score -= 10;
    else if (ratio < 0.85) score -= 5;
  }
  return Math.max(10, Math.min(100, Math.round(score)));
}

/**
 * @param {number | null | undefined} score
 * @param {{ isInCut?: boolean, hasHistory?: boolean }} [opts]
 *
 * `hasHistory` (default true pentru backward-compat engine callers) —
 * cand false (user fresh care NU a antrenat niciodata) NU promovam 'Zi de PR':
 * un PR-day claim e necinstit fara istoric de antrenament (nimic de batut).
 * Mirror semantics fatigue.js 'DATE INSUFICIENTE' gate (last4.length < 2).
 */
export function getReadinessVerdict(score, { isInCut = false, hasHistory = true } = {}) {
  if (score == null) return { label: null, color: 'var(--text3)', volumeMultiplier: 1.0, canPR: false };
  if (isInCut) {
    // In CUT, PR-urile sunt rare — nu promovam 'Zi de PR'
    if (score >= READINESS_PR)   return { label: 'Sesiune solida',    color: 'var(--green)',    volumeMultiplier: 1.0,  canPR: false };
    if (score >= READINESS_HIGH) return { label: 'Sesiune normala',   color: 'var(--accent)',   volumeMultiplier: 1.0,  canPR: false };
    if (score >= READINESS_MED)  return { label: 'Sesiune moderata',  color: 'var(--accent2)',  volumeMultiplier: 0.85, canPR: false };
    if (score >= READINESS_LOW)  return { label: 'Sesiune usoara',    color: 'var(--accent3)',  volumeMultiplier: 0.7,  canPR: false };
    return { label: 'Odihna',             color: 'var(--red)',      volumeMultiplier: 0,    canPR: false };
  } else {
    // Phase normala / BULK — logica originala. PR-day DOAR cand exista istoric:
    // user fresh (hasHistory=false) primeste 'Sesiune normala', NU 'Zi de PR'.
    if (score >= READINESS_PR && hasHistory) return { label: 'Zi de PR',          color: 'var(--green)',    volumeMultiplier: 1.1,  canPR: true  };
    if (score >= READINESS_HIGH) return { label: 'Sesiune normala',   color: 'var(--accent)',   volumeMultiplier: 1.0,  canPR: false };
    if (score >= READINESS_MED)  return { label: 'Sesiune moderata',  color: 'var(--accent2)',  volumeMultiplier: 0.85, canPR: false };
    if (score >= READINESS_LOW)  return { label: 'Sesiune usoara',    color: 'var(--accent3)',  volumeMultiplier: 0.7,  canPR: false };
    return { label: 'Odihneste-te',       color: 'var(--red)',      volumeMultiplier: 0,    canPR: false };
  }
}

/** @param {number} value */
export function saveReadiness(value) {
  /** @type {Record<string, number>} */
  const all = /** @type {any} */ (DB.get('readiness')) || {};
  all[tod()] = Number(value);
  DB.set('readiness', all);
}

export function getTodayReadiness() {
  /** @type {Record<string, number>} */
  const all = /** @type {any} */ (DB.get('readiness')) || {};
  return all[tod()] ?? null;
}

export function getComputedReadinessScore() {
  const r = getTodayReadiness();
  if (r == null) return null;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
  const yDate = todDate(yesterday);
  /** @type {Record<string, number>} */
  const kcals = /** @type {any} */ (DB.get('kcals')) || {};
  /** @type {Record<string, number>} */
  const prots = /** @type {any} */ (DB.get('prots')) || {};
  // KCAL_TARGET and PROT_TARGET imported directly from constants.js
  return getReadinessScore(r, kcals[yDate], prots[yDate], KCAL_TARGET, PROT_TARGET);
}
