import { DB } from '../db.js';

export function analyzeAndApplyPatterns(logs) {
  // Run async without blocking
  setTimeout(() => _analyze(logs), 500);
}

function _analyze(logs) {
  if (!logs || logs.length < 20) return;
  const burns = DB.get('session-burns') || [];
  const applied = DB.get('applied-patterns') || [];
  const newPatterns = [];

  // A. Skip day detection — last 8 weeks
  const now = new Date();
  const eightWeeksAgo = new Date(now.getTime() - 56 * 86400000);
  const recentBurns = burns.filter(b => new Date(b.date) >= eightWeeksAgo);
  const dayScheduled = { 'Marți': 0, 'Miercuri': 0, 'Joi': 0, 'Vineri': 0, 'Sâmbătă': 0 };
  const dayCompleted = { ...dayScheduled };
  // Count scheduled and completed per day
  for (let i = 0; i < 56; i++) {
    const d = new Date(now.getTime() - i * 86400000);
    const dayMap = [6,0,1,2,3,4,5];
    const PROG_DAYS = ['Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă','Duminică'];
    const progDay = PROG_DAYS[dayMap[d.getDay()]];
    if (dayScheduled[progDay] !== undefined) {
      dayScheduled[progDay]++;
      const dStr = d.toISOString().slice(0,10);
      if (recentBurns.some(b => b.date === dStr)) dayCompleted[progDay]++;
    }
  }
  // Guard: need at least 4 total completed sessions AND 4 in last 4 weeks
  // before flagging any day as high-skip. Without this, a user with 2 sessions
  // across 56 days gets 87-100% skip rate on every workout day — false positive.
  const totalCompleted = Object.values(dayCompleted).reduce((s, v) => s + v, 0);
  if (totalCompleted < 4) return;
  const fourWeeksAgo = new Date(now.getTime() - 28 * 86400000);
  if (burns.filter(b => new Date(b.date) >= fourWeeksAgo).length < 4) return;

  Object.entries(dayScheduled).forEach(([day, scheduled]) => {
    if (scheduled < 4) return;
    const skipRate = 1 - (dayCompleted[day] || 0) / scheduled;
    if (skipRate > 0.4) {
      const alreadyApplied = applied.some(p => p.type === 'SKIP_DAY' && p.day === day);
      if (!alreadyApplied) {
        newPatterns.push({ type: 'SKIP_DAY', day, skipRate: Math.round(skipRate*100), appliedAt: Date.now(), description: `${day} are ${Math.round(skipRate*100)}% skip rate — sesiune scurtată la esențiale` });
      }
    }
  });

  // B. Early end pattern
  const earlyStops = DB.get('early-stops') || [];
  const recentSessions = burns.filter(b => new Date(b.date) >= eightWeeksAgo);
  if (recentSessions.length >= 5) {
    const earlyEndRate = earlyStops.filter(e => new Date(e.date || 0) >= eightWeeksAgo).length / recentSessions.length;
    if (earlyEndRate > 0.4) {
      const alreadyApplied = applied.some(p => p.type === 'EARLY_END');
      if (!alreadyApplied) {
        newPatterns.push({ type: 'EARLY_END', earlyEndRate: Math.round(earlyEndRate*100), appliedAt: Date.now(), description: `${Math.round(earlyEndRate*100)}% sesiuni terminate devreme — program scurtat 20%` });
      }
    }
  }

  // C. Time pattern — peak hours
  const sessionHours = burns.filter(b => b.startHour != null).map(b => b.startHour);
  if (sessionHours.length >= 10) {
    const hourCounts = {};
    sessionHours.forEach(h => { hourCounts[h] = (hourCounts[h]||0)+1; });
    const peakHour = Object.entries(hourCounts).sort((a,b)=>b[1]-a[1])[0]?.[0];
    if (peakHour) {
      const existing = DB.get('peak-hours') || {};
      existing.detected = Number(peakHour);
      DB.set('peak-hours', existing);
    }
  }

  // D. Exercise stagnation
  const exStagnation = [];
  const exNames = [...new Set((logs||[]).filter(l=>!l.baseline&&l.ex).map(l=>l.ex))];
  exNames.forEach(ex => {
    const exLogs = logs.filter(l=>l.ex===ex&&l.w).slice(0,12);
    if (exLogs.length < 9) return;
    const last3w = exLogs.slice(0,3).map(l=>l.w);
    const prev3w = exLogs.slice(6,9).map(l=>l.w);
    if (last3w.every(w=>w===last3w[0]) && prev3w.every(w=>w===prev3w[0]) && last3w[0]===prev3w[0]) {
      exStagnation.push({ ex, kg: last3w[0] });
    }
  });
  if (exStagnation.length) {
    const alreadyApplied = applied.some(p => p.type === 'STAGNATION' && Date.now() - p.appliedAt < 7*86400000);
    if (!alreadyApplied && exStagnation.length) {
      newPatterns.push({ type: 'STAGNATION', exercises: exStagnation.map(e=>e.ex), appliedAt: Date.now(), description: `${exStagnation.length} exerciții stagnate 3+ săptămâni` });
    }
  }

  if (newPatterns.length) {
    const all = [...applied, ...newPatterns];
    DB.set('applied-patterns', all.slice(-20));
  }
}

export function getAppliedPatterns() {
  return DB.get('applied-patterns') || [];
}

export function dismissPattern(index) {
  const all = DB.get('applied-patterns') || [];
  all.splice(index, 1);
  DB.set('applied-patterns', all);
}
