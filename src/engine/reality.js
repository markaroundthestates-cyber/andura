// ══ REALITY CHECK ENGINE ════════════════════════════════════
import { DB } from '../db.js';

export function getRealityCheck() {
  const ws = DB.get('weights') || {};
  const dates = Object.keys(ws).sort().slice(-8);
  if (dates.length < 4) return null;

  const vals = dates.map(d => ws[d]);
  const n = vals.length;
  const sumX = n * (n - 1) / 2;
  const sumY = vals.reduce((a, b) => a + b, 0);
  const sumXY = vals.reduce((s, v, i) => s + i * v, 0);
  const sumX2 = vals.reduce((s, _, i) => s + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const trend = Math.round(slope * 7 * 100) / 100; // kg per week

  // Plateau: 7 consecutive days without weight decrease
  if (dates.length >= 7) {
    const last7 = dates.slice(-7).map(d => ws[d]);
    const firstVal = last7[0];
    const allNonDecreasing = last7.every(v => v >= firstVal - 0.05);
    if (allNonDecreasing) {
      return {
        type: 'plateau',
        icon: '🔴',
        color: 'var(--red)',
        message: 'Nicio scădere în 7 zile. Timp să ajustezi ceva.'
      };
    }
  }

  // Too fast: losing more than 1 kg/week
  if (trend < -1) {
    return {
      type: 'warning',
      icon: '⚡',
      color: 'var(--accent2)',
      message: 'Slăbești prea rapid — risc masă musculară. Mărește la 1900 kcal temporar.'
    };
  }

  // Too slow: less than 0.3 kg/week loss (and we have at least 7 days of data)
  if (trend > -0.3 && dates.length >= 7) {
    return {
      type: 'slow',
      icon: '🐢',
      color: 'var(--accent)',
      message: 'Progres lent. Verifică kcal sau activitate.'
    };
  }

  // OK: -0.3 to -1 kg/week
  if (trend <= -0.3 && trend >= -1) {
    return {
      type: 'ok',
      icon: '✅',
      color: 'var(--green)',
      message: 'Progres perfect. Menține ritmul.'
    };
  }

  return null;
}
