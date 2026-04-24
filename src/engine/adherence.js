// ══ ADHERENCE SCORE ENGINE ════════════════════════════════════
import { DB, tod } from '../db.js';
import { PROG } from '../constants.js';

export function getAdherenceScore() {
  const today = tod();
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon ... 6=Sat

  const kcals = DB.get('kcals') || {};
  const prots = DB.get('prots') || {};
  const ws = DB.get('weights') || {};
  const logs = DB.get('logs') || [];

  // Map JS getDay() to PROG index
  // PROG: [0]=Luni(Mon), [1]=Marți(Tue), [2]=Mie(Wed), [3]=Joi(Thu),
  //        [4]=Vineri(Fri), [5]=Sâmbătă(Sat), [6]=Duminică(Sun)
  const dayMap = [6, 0, 1, 2, 3, 4, 5]; // JS 0(Sun)→PROG[6], JS 1(Mon)→PROG[0], etc.
  const progDay = PROG[dayMap[dayOfWeek]];

  let score = 0;

  // +25p: kcal logged today
  if (kcals[today] !== undefined) score += 25;

  // +25p: protein >= 150g
  if (prots[today] !== undefined && prots[today] >= 150) score += 25;

  // +30p: workout compliance
  if (progDay && progDay.t === 'off') {
    // Rest day = automatic compliance
    score += 30;
  } else {
    // Check if there are non-baseline, non-marker logs for today
    const todayLogs = logs.filter(l => l.date === today && !l.baseline && l.ex !== '__early_stop__');
    if (todayLogs.length > 0) score += 30;
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
