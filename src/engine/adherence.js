// ══ ADHERENCE SCORE ENGINE ════════════════════════════════════
import { DB, tod } from '../db.js';
import { PROG } from '../constants.js';
import * as coachDecisionLog from '../util/coachDecisionLog.js';

export function getAdherenceScore() {
  const today = tod();
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon ... 6=Sat

  const kcals = DB.get('kcals') || {};
  const prots = DB.get('prots') || {};
  const ws = DB.get('weights') || {};
  const logs = DB.get('logs') || [];

  // Map JS getDay() to PROG index
  // PROG: [0]=Luni(Mon), [1]=Marti(Tue), [2]=Mie(Wed), [3]=Joi(Thu),
  //        [4]=Vineri(Fri), [5]=Sambata(Sat), [6]=Duminica(Sun)
  const dayMap = [6, 0, 1, 2, 3, 4, 5]; // JS 0(Sun)→PROG[6], JS 1(Mon)→PROG[0], etc.
  const progDay = PROG[dayMap[dayOfWeek]];

  let score = 0;

  // +25p: kcal logged today
  if (kcals[today] !== undefined) score += 25;

  // +25p: protein >= 150g
  if (prots[today] !== undefined && prots[today] >= 150) score += 25;

  // +30p: workout compliance — CDL primary, logs fallback
  if (progDay && progDay.t === 'off') {
    // Rest day per PROG = automatic compliance
    score += 30;
  } else {
    const cdlEntry = coachDecisionLog.readActiveForDate(today);
    if (cdlEntry?.outcome) {
      // CDL has populated outcome → use it (binary in legacy pillar)
      const executed = cdlEntry.outcome.executed;
      if (executed === true || executed === 'partial') {
        score += 30;
      }
      // executed === false → 0p (skipped)
    } else {
      // No CDL entry (cold start, pre-30.4, session in progress) → fallback logs
      const todayLogs = logs.filter(l => l.date === today && !l.baseline && l.ex !== '__early_stop__');
      if (todayLogs.length > 0) score += 30;
    }
  }

  // +20p: weight logged today
  if (ws[today] !== undefined) score += 20;

  let color, label;
  if (score >= 80) {
    color = 'var(--green)';
    label = 'Excelent';
  } else if (score >= 50) {
    color = 'var(--accent)';
    label = 'OK';
  } else {
    color = 'var(--accent2)';
    label = 'Slab';
  }

  return { score, color, label };
}

/**
 * Pure CDL-based adherence metrics. Used by renderIdle (30.8) and consumers
 * needing detailed breakdown.
 *
 * Synthetic entries EXCLUDED entirely (we count only real proposed/executed
 * pentru score). Pentru weighted analysis vezi patternLearning.analyzeFromCDL.
 *
 * @param {object} opts
 * @param {number} [opts.windowDays=30]
 * @returns {{
 *   score: number|null,
 *   proposed: number,
 *   executed: number,
 *   partial: number,
 *   skipped: number,
 *   deviated: number
 * }}
 */
export function computeAdherence({ windowDays = 30 } = {}) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - windowDays);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);

  const entries = coachDecisionLog.readAllActive(e =>
    e.date >= cutoffStr &&
    e.synthetic !== true &&
    e.outcome != null
  );

  const proposed = entries.length;
  if (proposed === 0) {
    return { score: null, proposed: 0, executed: 0, partial: 0, skipped: 0, deviated: 0 };
  }

  let executed = 0;
  let partial = 0;
  let skipped = 0;
  let deviated = 0;

  for (const e of entries) {
    const o = e.outcome;
    if (o.deviation === true) {
      deviated++;
      // Deviation NOT counted as adherence — separate metric
      continue;
    }
    if (o.executed === true) executed++;
    else if (o.executed === 'partial') partial++;
    else if (o.executed === false) skipped++;
  }

  // score = (executed × 1.0 + partial × 0.5) / proposed × 100
  const rawScore = ((executed * 1.0) + (partial * 0.5)) / proposed * 100;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  return { score, proposed, executed, partial, skipped, deviated };
}
