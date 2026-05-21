// ══ AA ENGINE — Auto-Adjust (3-session pattern) ═════════════
import { DB } from '../db.js';
import { COMPOUND_EX as _COMPOUND_EX } from '../constants.js';
import { DP } from './dp.js';

export const AA = {
  // Check last 3 sessions for a given exercise and return adjustment
  // ex: exercise name — form signal is per-exercise; sleep/fatigue/strong are global per session
  /** @param {string} [ex] */
  getRecoveryContext(ex) {
    /** @type {Array<{baseline?: boolean, session?: string, ts?: number, notes?: string[], ex?: string}>} */
    const logs = /** @type {any} */ (DB.get('logs')) || [];
    /** @type {Record<string, Array<{baseline?: boolean, session?: string, ts?: number, notes?: string[], ex?: string}>>} */
    const sessions = {};
    logs.filter((l) => !l.baseline && l.session).forEach((l) => {
      const key = l.session ?? '';
      if (!sessions[key]) sessions[key] = [];
      sessions[key].push(l);
    });
    const last3Sessions = Object.values(sessions)
      .sort((a,b) => (b[0]?.ts ?? 0) - (a[0]?.ts ?? 0))
      .slice(0, 3);

    if (!last3Sessions.length) return { ok: true, reason: null };

    // Global signals deduplicated per session (1 count per session, not per set)
    const sleepBad = last3Sessions.filter(s => s.some((l) => (l.notes||[]).includes('sleep'))).length;
    const fatigue  = last3Sessions.filter(s => s.some((l) => (l.notes||[]).includes('fatigue'))).length;
    const strong   = last3Sessions.filter(s => s.some((l) => (l.notes||[]).includes('strong'))).length;
    // Form is per-exercise: only count sessions where this exercise had bad form
    const exSessions = ex
      ? last3Sessions.map(s => s.filter((l) => l.ex === ex)).filter(s => s.length > 0)
      : last3Sessions;
    const formBad = exSessions.filter(s => s.some((l) => (l.notes||[]).includes('form'))).length;

    // Somn prost in 2+ sesiuni → RPE artificial ridicat, IGNORE decrease
    if (sleepBad >= 2) {
      return {
        ok: false,
        suppressDecrease: true,
        suppressIncrease: false,
        reason: `😴 Somn prost in ${sleepBad} sesiuni → RPE artificial. Nu scad greutatea.`,
        color: 'var(--accent2)'
      };
    }

    // Oboseala repetata + form slaba → sugereaza deload
    if (fatigue >= 3 || (fatigue >= 2 && formBad >= 2)) {
      return {
        ok: false,
        suppressDecrease: false,
        suppressIncrease: true,
        forceDeload: true,
        reason: `😓 Oboseala repetata (${fatigue}x) → consider deload saptamana asta`,
        color: 'var(--accent2)'
      };
    }

    // Forma slaba pe acelasi exercitiu → scade independent de RPE
    if (formBad >= 2) {
      return {
        ok: false,
        suppressDecrease: false,
        suppressIncrease: true,
        formIssue: true,
        reason: `⚠️ Forma slaba repetata → nu cresti greutatea`,
        color: 'var(--accent2)'
      };
    }

    // Sesiune puternica repetata → poate fi mai agresiv
    if (strong >= 3) {
      return {
        ok: true,
        aggressive: true,
        reason: `💪 Forma excelenta repetata → progresie accelerata`,
        color: 'var(--green)'
      };
    }

    return { ok: true, reason: null };
  },

  // Notes-only safety net: intervine NUMAI cand exista semnal negativ din notes.
  // RPE per-set nu e colectat → logica INCREASE/DECREASE bazata pe RPE eliminata.
  /** @param {string} ex */
  check(ex) {
    const cooldownKey = 'aa-cooldown-' + ex;
    const lastAdj = /** @type {number | null} */ (DB.get(cooldownKey));
    if (lastAdj) {
      const daysSince = Math.round((Date.now() - lastAdj) / 86400000);
      if (daysSince < 4) return null;
    }

    /** @type {Array<{baseline?: boolean, notes?: string[], w?: number}>} */
    const logs = /** @type {any} */ (DP.getLogs(ex, 9)).filter((/** @type {any} */ l) => !l.baseline);
    if (logs.length < 4) return null;

    const recovery = this.getRecoveryContext(ex);
    const lastW = logs[0]?.w || 20;
    const inc = DP.getIncrement(ex);

    // Oboseala repetata + forma slaba → forteaza deload
    if (recovery.forceDeload) {
      DB.set('aa-cooldown-' + ex, Date.now());
      return {
        action: 'DECREASE',
        newKg: Math.max(1, Math.round((lastW - inc) * 2) / 2),
        reason: recovery.reason,
        color: recovery.color
      };
    }

    // Somn prost / oboseala → tine greutatea, nu creste
    if (!recovery.ok && recovery.suppressIncrease) {
      return {
        action: 'HOLD',
        newKg: lastW,
        reason: recovery.reason,
        color: recovery.color
      };
    }

    // Stop fizic recent → reduce volum 10%
    /** @type {Array<{reason?: string}>} */
    const earlyStops = /** @type {any} */ (DB.get('early-stops')) || [];
    const hasPhysicalStop = earlyStops.slice(-3).some(
      (s) => s.reason === 'Oboseala extrema' || s.reason === 'Am dureri'
    );
    if (hasPhysicalStop) {
      return {
        action: 'REDUCE_VOLUME',
        newKg: lastW,
        volumeReduction: 0.1,
        autoFatigueNote: true,
        reason: 'Early stop fizic recent → volum redus 10%',
        color: 'var(--accent2)'
      };
    }

    // Forma slaba repetata → scade
    if (recovery.formIssue && logs.filter((l) => (l.notes||[]).includes('form')).length >= 2) {
      const newW = Math.max(1, Math.round((lastW - inc) * 2) / 2);
      DB.set('aa-cooldown-' + ex, Date.now());
      return {
        action: 'DECREASE',
        newKg: newW,
        reason: `⚠️ Forma slaba repetata → scad ${inc}kg pentru executie corecta`,
        color: 'var(--accent2)'
      };
    }

    return null;
  },

  // Apply auto-adjust to DP recommendation
  /**
   * @param {Record<string, any>} rec
   * @param {string} ex
   */
  applyTo(rec, ex) {
    const adj = this.check(ex);
    if (!adj) return rec;
    const inc = DP.getIncrement(ex);
    const roundedKg = DP.roundToStep(adj.newKg, ex);
    // For HOLD actions keep the original DP status/label — only update kg and message
    if (adj.action === 'HOLD' || adj.action === 'REDUCE_VOLUME') {
      return {
        ...rec,
        kg: roundedKg,
        autoAdjusted: true,
        autoAdjustMsg: adj.reason,
        autoAdjustColor: adj.color,
      };
    }
    return {
      ...rec,
      kg: roundedKg,
      autoAdjusted: true,
      autoAdjustMsg: adj.reason,
      autoAdjustColor: adj.color,
      status: adj.action === 'DECREASE' ? 'AUTO↓' : 'AUTO↑',
      statusColor: adj.color,
      statusLabel: adj.action === 'DECREASE' ? `🔴 AUTO: −${inc}kg` : `🟢 AUTO: +${inc}kg`
    };
  }
};
