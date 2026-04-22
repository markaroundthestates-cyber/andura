// ══ REALITY CHECK ENGINE ════════════════════════════════════
import { DB } from '../db.js';
import { SYS } from './sys.js';

export function getRealityCheck() {
  const today = new Date().toISOString().slice(0, 10);
  const phaseOverride = DB.get('phase-override');
  if (today < '2026-07-20' && !phaseOverride) {
    return {
      type: 'fixed',
      icon: '✅',
      color: 'var(--green)',
      message: 'Menții 1800 kcal fix până 20 iulie ✓'
    };
  }

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

  // Plateau: no meaningful decrease over a span of at least 7 calendar days.
  // We check that: (a) we have at least 4 weigh-in entries, (b) the oldest of
  // those entries is at least 7 calendar days ago, and (c) no entry is lower
  // than the first by more than 0.05 kg (noise threshold).
  // This avoids false plateaus when the user simply hasn't logged every day.
  if (dates.length >= 4) {
    const spanDays = Math.round(
      (new Date(dates[dates.length - 1]) - new Date(dates[0])) / 86400000
    );
    if (spanDays >= 7) {
      const firstVal = vals[0];
      const allNonDecreasing = vals.every(v => v >= firstVal - 0.05);
      if (allNonDecreasing) {
        return {
          type: 'plateau',
          icon: '🔴',
          color: 'var(--red)',
          message: 'Nicio scădere în 7+ zile. Timp să ajustezi ceva.'
        };
      }
    }
  }

  // Too fast: losing more than 1 kg/week
  if (trend < -1) {
    const suggestedKcal = SYS.getKcalTarget() + 100;
    return {
      type: 'warning',
      icon: '⚡',
      color: 'var(--accent2)',
      message: `Slăbești prea rapid — risc masă musculară. Mărește la ${suggestedKcal} kcal temporar.`
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
