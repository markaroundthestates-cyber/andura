// ══ FATIGUE SCORE ENGINE ════════════════════════════════════
import { DB } from '../db.js';


export function calculateFatigueScore() {
  const logs = DB.get('logs') || [];
  const wb = DB.get('wellbeing') || {};

  // Grupeaza ultimele 4 sesiuni
  const sessions = {};
  logs.filter(l => !l.baseline && l.session).forEach(l => {
    if (!sessions[l.session]) sessions[l.session] = [];
    sessions[l.session].push(l);
  });
  const last4 = Object.values(sessions)
    .sort((a,b) => b[0].ts - a[0].ts)
    .slice(0, 4);

  if (last4.length < 2) {
    return { score: 0, label: 'DATE INSUFICIENTE', color: 'var(--text3)',
      detail: 'Completeaza 2+ sesiuni pentru fatigue score', recommend: 'none' };
  }

  // ── Semnale ──────────────────────────────────────────────────────────────
  const allNotes = last4.flatMap(s => s.flatMap(l => l.notes || []));
  const sleepBad  = allNotes.filter(n => n === 'sleep').length;
  const fatigue   = allNotes.filter(n => n === 'fatigue').length;
  const formBad   = allNotes.filter(n => n === 'form').length;
  const strong    = allNotes.filter(n => n === 'strong').length;

  // RPE mediu din ultimele 4 sesiuni (top sets)
  const sessionRPEs = last4.map(s => {
    const rpes = s.filter(l=>l.rpe).map(l=>l.rpe).sort((a,b)=>b-a).slice(0,2);
    return rpes.length ? rpes.reduce((a,b)=>a+b,0)/rpes.length : 7;
  });
  const avgRPE = sessionRPEs.reduce((a,b)=>a+b,0) / sessionRPEs.length;
  const rpeRising = sessionRPEs.length >= 3 &&
    sessionRPEs[0] > sessionRPEs[sessionRPEs.length-1] + 0.6;

  // Somn din wellbeing (ultimele 4 zile)
  const recentDates = Object.keys(wb).sort().reverse().slice(0, 4);
  const avgSleep = recentDates.length
    ? recentDates.reduce((a,d) => a + (wb[d]?.sleep || 3), 0) / recentDates.length
    : 3;

  // ── Calculeaza scor (0-100, mai mare = mai obosit) ─────────────────────
  let score = 0;
  score += sleepBad  * 13;
  score += fatigue   * 11;
  score += formBad   * 7;
  score -= strong    * 9;
  score += Math.max(0, (avgRPE - 7.5) * 11);
  score += rpeRising ? 12 : 0;
  score += (avgSleep <= 2.5) ? 18 : (avgSleep <= 3.5) ? 7 : 0;
  score = Math.max(0, Math.min(100, Math.round(score)));

  // ── Verdict (wording LOCKED V1 §36.58 — sentence case + voice plural + zero numerice raw) ──
  let label, color, recommend, detail, icon, key;

  if (score >= 65 || fatigue >= 4 || sleepBad >= 3) {
    key = 'HIGH_FATIGUE';
    label = 'Azi mergem mai bland';
    icon = '🔴';
    color = 'var(--red)';
    recommend = 'deload';
    detail = 'Au fost cateva sesiuni grele recent. Volumul este calibrat mai conservator pentru o recuperare completa.';
  } else if (score >= 40 || (avgRPE >= 8.7 && rpeRising)) {
    key = 'MODERATE_FATIGUE';
    label = 'Pas mai conservator';
    icon = '🟡';
    color = 'var(--accent2)';
    recommend = 'reduce';
    detail = 'Astazi mentinem greutatile, cu accent pe tehnica si control.';
  } else if (score <= 15 && strong >= 2) {
    key = 'PEAK_FORM';
    label = 'Suntem in forma buna';
    icon = '🟢';
    color = 'var(--green)';
    recommend = 'push';
    detail = 'Recuperarea este completa. Avem energie sa plusam pe bara astazi.';
  } else {
    key = 'NORMAL';
    label = 'Pe drum bun';
    icon = '🟢';
    color = 'var(--green)';
    recommend = 'normal';
    detail = 'Ritmul este sanatos. Mergem cu planul de astazi.';
  }

  return { score, key, label, icon, color, recommend, detail, avgRPE, sleepBad, fatigue, strong };
}
