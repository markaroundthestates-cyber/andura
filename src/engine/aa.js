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

  check(ex) {
    // Cooldown: skip if auto-adjusted last session
    const cooldownKey = 'aa-cooldown-' + ex;
    const lastAdj = DB.get(cooldownKey);
    if (lastAdj) {
      const daysSince = Math.round((Date.now() - lastAdj) / 86400000);
      if (daysSince < 4) return null;
    }

    const logs = DP.getLogs(ex, 9).filter(l => !l.baseline);
    if (logs.length < 4) return null; // not enough real data yet

    // ── Citește contextul de recuperare din note ──────────────────────────
    const recovery = this.getRecoveryContext(ex);

    // Group by session
    const sessions = [];
    let curSession = [logs[0]];
    for (let i = 1; i < logs.length; i++) {
      const gap = Math.abs(logs[i-1].ts - logs[i].ts);
      if (gap < 4 * 3600 * 1000) {
        curSession.push(logs[i]);
      } else {
        sessions.push(curSession);
        curSession = [logs[i]];
      }
    }
    if (curSession.length) sessions.push(curSession);
    if (sessions.length < 2) return null;

    const last3 = sessions.slice(0, Math.min(3, sessions.length));
    const rpes = last3.map(s => {
      const setsWithRPE = s.filter(l=>l.rpe).sort((a,b)=>b.rpe-a.rpe);
      if (!setsWithRPE.length) return 7;
      const topSets = setsWithRPE.slice(0, Math.min(2, setsWithRPE.length));
      return topSets.reduce((a,b)=>a+b.rpe,0) / topSets.length;
    });
    const avgRPE = rpes.reduce((a,b)=>a+b,0) / rpes.length;
    const highCount = rpes.filter(r => r >= 9).length;
    const lowCount = rpes.filter(r => r <= 7).length;

    const inc = DP.getIncrement(ex);
    const lastW = logs[0].w || 20;

    // ── DECREASE: RPE ridicat ────────────────────────────────────────────
    if (highCount >= 2) {
      // Somn prost → RPE artificial → NU scade greutatea
      if (recovery.suppressDecrease) {
        return {
          action: 'HOLD',
          newKg: lastW,
          reason: recovery.reason,
          color: recovery.color
        };
      }
      const newW = Math.max(1, Math.round((lastW - inc) * 2) / 2);
      DB.set('aa-cooldown-' + ex, Date.now());
      return {
        action: 'DECREASE',
        newKg: newW,
        reason: `RPE ≥9 în ${highCount}/3 sesiuni → scad ${inc}kg`,
        color: 'var(--red)'
      };
    }

    // ── INCREASE: RPE scăzut ─────────────────────────────────────────────
    if (lowCount >= 2) {
      // Oboseală sau formă slabă → nu crește chiar dacă RPE e mic
      if (recovery.suppressIncrease) {
        return {
          action: 'HOLD',
          newKg: lastW,
          reason: recovery.reason,
          color: recovery.color
        };
      }
      // Dacă e în formă excelentă → increment dublu o dată
      const multiplier = recovery.aggressive ? 2 : 1;
      const newW = Math.round((lastW + inc * multiplier) * 2) / 2;
      DB.set('aa-cooldown-' + ex, Date.now());
      return {
        action: 'INCREASE',
        newKg: newW,
        reason: recovery.aggressive
          ? `💪 Formă excelentă + RPE ≤7 → +${inc*multiplier}kg`
          : `RPE ≤7 în ${lowCount}/3 sesiuni → cresc ${inc}kg`,
        color: recovery.aggressive ? 'var(--green)' : 'var(--green)'
      };
    }

    // ── EARLY STOP: stop fizic recent → reduce volum ─────────────────────
    const earlyStops = DB.get('early-stops') || [];
    const last3Stops = earlyStops.slice(-3);
    const hasPhysicalStop = last3Stops.some(s => s.reason === 'Oboseală extremă' || s.reason === 'Am dureri');
    const consecutiveStops = earlyStops.length >= 2 &&
      last3Stops.slice(-2).every(s => s.reason !== 'Lipsă timp' && s.reason !== 'Alt motiv');

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

    // ── FORM ISSUE: formă slabă repetată → scade chiar dacă RPE e ok ────
    if (recovery.formIssue) {
      const exFormLogs = logs.filter(l => (l.notes||[]).includes('form'));
      if (exFormLogs.length >= 2) {
        const newW = Math.max(1, Math.round((lastW - inc) * 2) / 2);
        DB.set('aa-cooldown-' + ex, Date.now());
        return {
          action: 'DECREASE',
          newKg: newW,
          reason: `⚠️ Formă slabă repetată → scad ${inc}kg pentru execuție corectă`,
          color: 'var(--accent2)'
        };
      }
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
