// ══ AA ENGINE — Auto-Adjust (3-session pattern) ═════════════
import { DB } from '../db.js';
import { COMPOUND_EX } from '../constants.js';
import { DP } from './dp.js';

export const AA = {
  // Check last 3 sessions for a given exercise and return adjustment
  // ex: exercise name — form signal is per-exercise; sleep/fatigue/strong are global per session
  getRecoveryContext(ex) {
    const logs = DB.get('logs') || [];
    const sessions = {};
    logs.filter(l => !l.baseline && l.session).forEach(l => {
      if (!sessions[l.session]) sessions[l.session] = [];
      sessions[l.session].push(l);
    });
    const last3Sessions = Object.values(sessions)
      .sort((a,b) => b[0].ts - a[0].ts)
      .slice(0, 3);

    if (!last3Sessions.length) return { ok: true, reason: null };

    // Global signals deduplicated per session (1 count per session, not per set)
    const sleepBad = last3Sessions.filter(s => s.some(l => (l.notes||[]).includes('sleep'))).length;
    const fatigue  = last3Sessions.filter(s => s.some(l => (l.notes||[]).includes('fatigue'))).length;
    const strong   = last3Sessions.filter(s => s.some(l => (l.notes||[]).includes('strong'))).length;
    // Form is per-exercise: only count sessions where this exercise had bad form
    const exSessions = ex
      ? last3Sessions.map(s => s.filter(l => l.ex === ex)).filter(s => s.length > 0)
      : last3Sessions;
    const formBad = exSessions.filter(s => s.some(l => (l.notes||[]).includes('form'))).length;

    // Somn prost în 2+ sesiuni → RPE artificial ridicat, IGNORE decrease
    if (sleepBad >= 2) {
      return {
        ok: false,
        suppressDecrease: true,
        suppressIncrease: false,
        reason: `😴 Somn prost în ${sleepBad} sesiuni → RPE artificial. Nu scad greutatea.`,
        color: 'var(--accent2)'
      };
    }

    // Oboseală repetată + form slabă → sugerează deload
    if (fatigue >= 3 || (fatigue >= 2 && formBad >= 2)) {
      return {
        ok: false,
        suppressDecrease: false,
        suppressIncrease: true,
        forceDeload: true,
        reason: `😓 Oboseală repetată (${fatigue}x) → consider deload săptămâna asta`,
        color: 'var(--accent2)'
      };
    }

    // Formă slabă pe același exercițiu → scade independent de RPE
    if (formBad >= 2) {
      return {
        ok: false,
        suppressDecrease: false,
        suppressIncrease: true,
        formIssue: true,
        reason: `⚠️ Formă slabă repetată → nu crești greutatea`,
        color: 'var(--accent2)'
      };
    }

    // Sesiune puternică repetată → poate fi mai agresiv
    if (strong >= 3) {
      return {
        ok: true,
        aggressive: true,
        reason: `💪 Formă excelentă repetată → progresie accelerată`,
        color: 'var(--green)'
      };
    }

    return { ok: true, reason: null };
  },

  // Notes-only safety net: intervine NUMAI când există semnal negativ din notes.
  // RPE per-set nu e colectat → logica INCREASE/DECREASE bazată pe RPE eliminată.
  check(ex) {
    const cooldownKey = 'aa-cooldown-' + ex;
    const lastAdj = DB.get(cooldownKey);
    if (lastAdj) {
      const daysSince = Math.round((Date.now() - lastAdj) / 86400000);
      if (daysSince < 4) return null;
    }

    const logs = DP.getLogs(ex, 9).filter(l => !l.baseline);
    if (logs.length < 4) return null;

    const recovery = this.getRecoveryContext(ex);
    const lastW = logs[0].w || 20;
    const inc = DP.getIncrement(ex);

    // Oboseală repetată + formă slabă → forțează deload
    if (recovery.forceDeload) {
      DB.set('aa-cooldown-' + ex, Date.now());
      return {
        action: 'DECREASE',
        newKg: Math.max(1, Math.round((lastW - inc) * 2) / 2),
        reason: recovery.reason,
        color: recovery.color
      };
    }

    // Somn prost / oboseală → ține greutatea, nu crește
    if (!recovery.ok && recovery.suppressIncrease) {
      return {
        action: 'HOLD',
        newKg: lastW,
        reason: recovery.reason,
        color: recovery.color
      };
    }

    // Stop fizic recent → reduce volum 10%
    const earlyStops = DB.get('early-stops') || [];
    const hasPhysicalStop = earlyStops.slice(-3).some(
      s => s.reason === 'Oboseală extremă' || s.reason === 'Am dureri'
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

    // Formă slabă repetată → scade
    if (recovery.formIssue && logs.filter(l => (l.notes||[]).includes('form')).length >= 2) {
      const newW = Math.max(1, Math.round((lastW - inc) * 2) / 2);
      DB.set('aa-cooldown-' + ex, Date.now());
      return {
        action: 'DECREASE',
        newKg: newW,
        reason: `⚠️ Formă slabă repetată → scad ${inc}kg pentru execuție corectă`,
        color: 'var(--accent2)'
      };
    }

    return null;
  },

  // Apply auto-adjust to DP recommendation
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
