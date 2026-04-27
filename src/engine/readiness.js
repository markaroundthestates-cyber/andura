import { DB, tod, todDate } from '../db.js';
import { KCAL_TARGET, PROT_TARGET } from '../constants.js';

export const READINESS_PR   = 85;
export const READINESS_HIGH = 70;
export const READINESS_MED  = 55;
export const READINESS_LOW  = 40;

export const READINESS_LABELS = {
  1: { emoji: '😴', label: 'Epuizat', sub: 'Somn prost, energie zero' },
  2: { emoji: '😕', label: 'Obosit',  sub: 'Sub formă normală' },
  3: { emoji: '😐', label: 'Normal',  sub: 'Ok, standard' },
  4: { emoji: '😊', label: 'Bine',    sub: 'Somn bun, energie bună' },
  5: { emoji: '🔥', label: 'Excelent', sub: 'Ready to crush it' },
};

export function getReadinessScore(readinessInput, kcalYesterday, protYesterday, targetKcal, targetProt) {
  if (readinessInput == null) return null;
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

export function getReadinessVerdict(score, { isInCut = false } = {}) {
  if (score == null) return { label: null, color: 'var(--text3)', volumeMultiplier: 1.0, canPR: false };
  if (isInCut) {
    // În CUT, PR-urile sunt rare — nu promovăm 'Zi de PR'
    if (score >= READINESS_PR)   return { label: 'Sesiune solidă',    color: 'var(--green)',    volumeMultiplier: 1.0,  canPR: false };
    if (score >= READINESS_HIGH) return { label: 'Sesiune normală',   color: 'var(--accent)',   volumeMultiplier: 1.0,  canPR: false };
    if (score >= READINESS_MED)  return { label: 'Sesiune moderată',  color: 'var(--accent2)',  volumeMultiplier: 0.85, canPR: false };
    if (score >= READINESS_LOW)  return { label: 'Sesiune ușoară',    color: 'var(--accent3)',  volumeMultiplier: 0.7,  canPR: false };
    return { label: 'Odihnă',             color: 'var(--red)',      volumeMultiplier: 0,    canPR: false };
  } else {
    // Phase normală / BULK — logica originală
    if (score >= READINESS_PR)   return { label: 'Zi de PR',          color: 'var(--green)',    volumeMultiplier: 1.1,  canPR: true  };
    if (score >= READINESS_HIGH) return { label: 'Sesiune normală',   color: 'var(--accent)',   volumeMultiplier: 1.0,  canPR: false };
    if (score >= READINESS_MED)  return { label: 'Sesiune moderată',  color: 'var(--accent2)',  volumeMultiplier: 0.85, canPR: false };
    if (score >= READINESS_LOW)  return { label: 'Sesiune ușoară',    color: 'var(--accent3)',  volumeMultiplier: 0.7,  canPR: false };
    return { label: 'Odihnește-te',       color: 'var(--red)',      volumeMultiplier: 0,    canPR: false };
  }
}

export function saveReadiness(value) {
  const all = DB.get('readiness') || {};
  all[tod()] = Number(value);
  DB.set('readiness', all);
}

export function getTodayReadiness() {
  const all = DB.get('readiness') || {};
  return all[tod()] ?? null;
}

export function getComputedReadinessScore() {
  const r = getTodayReadiness();
  if (r == null) return null;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
  const yDate = todDate(yesterday);
  const kcals = DB.get('kcals') || {};
  const prots = DB.get('prots') || {};
  // KCAL_TARGET and PROT_TARGET imported directly from constants.js
  return getReadinessScore(r, kcals[yDate], prots[yDate], KCAL_TARGET, PROT_TARGET);
}
