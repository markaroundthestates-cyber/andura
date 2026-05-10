import { DB, todDate } from '../db.js';
import { MS_PER_DAY } from '../constants.js';
import { readAllActive } from '../util/coachDecisionLog.js';

export const CDL_PATTERNS_KEY = 'cdl-patterns';

const MIN_CDL_WEIGHT = 4;

let _patternAnalyzeInFlight = false;

export function analyzeAndApplyPatterns(logs) {
  if (_patternAnalyzeInFlight) return;
  _patternAnalyzeInFlight = true;
  setTimeout(() => {
    try { _analyze(logs); } finally { _patternAnalyzeInFlight = false; }
  }, 500);
}

function _analyze(logs) {
  if (!logs || logs.length < 20) return;
  const burns = DB.get('session-burns') || [];
  const applied = DB.get('applied-patterns') || [];
  const newPatterns = [];

  const now = new Date();
  const eightWeeksAgo = new Date(now.getTime() - 56 * MS_PER_DAY);
  const fourWeeksAgo = new Date(now.getTime() - 28 * MS_PER_DAY);
  const recentBurns = burns.filter(b => new Date(b.date) >= eightWeeksAgo);

  // Guard: insufficient history for reliable pattern detection
  if (recentBurns.length < 4) return;
  if (burns.filter(b => new Date(b.date) >= fourWeeksAgo).length < 4) return;

  // SKIP_DAY detection removed — deprecated pattern type replaced by CDL-based LOW_ADHERENCE/HIGH_DEVIATION

  // B. Early end pattern (from session-burns + early-stops)
  const earlyStops = DB.get('early-stops') || [];
  if (recentBurns.length >= 5) {
    const earlyEndRate = earlyStops.filter(e => new Date(e.date || 0) >= eightWeeksAgo).length / recentBurns.length;
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
      newPatterns.push({ type: 'STAGNATION', exercises: exStagnation.map(e=>e.ex), appliedAt: Date.now(), description: `${exStagnation.length} exercitii stagnate 3+ saptamani` });
    }
  }

  if (newPatterns.length) {
    const all = [...applied, ...newPatterns];
    DB.set('applied-patterns', all.slice(-20));
  }

  // CDL parallel write — runs regardless of legacy pattern results
  try {
    const cdlPatterns = analyzeFromCDL({ windowDays: 30 });
    DB.set(CDL_PATTERNS_KEY, cdlPatterns);
  } catch (_) {
    // CDL analysis failure must not break legacy pattern flow
  }
}

/**
 * Analyse CDL entries for adherence/deviation/earlyEnd patterns.
 * Synthetic entries are weighted 0.5× per ADR 011.
 * Returns pattern array — does NOT write to storage.
 */
export function analyzeFromCDL({ windowDays = 30 } = {}) {
  const patterns = [];

  // STAGNATION from logs — always checked; logs are authoritative for weight progression
  const logs = DB.get('logs') || [];
  const exStagnation = [];
  const exNames = [...new Set((logs || []).filter(l => !l.baseline && l.ex).map(l => l.ex))];
  exNames.forEach(ex => {
    const exLogs = logs.filter(l => l.ex === ex && l.w).slice(0, 12);
    if (exLogs.length < 9) return;
    const last3w = exLogs.slice(0, 3).map(l => l.w);
    const prev3w = exLogs.slice(6, 9).map(l => l.w);
    if (last3w.every(w => w === last3w[0]) && prev3w.every(w => w === prev3w[0]) && last3w[0] === prev3w[0]) {
      exStagnation.push(ex);
    }
  });
  if (exStagnation.length) {
    patterns.push({
      type: 'STAGNATION',
      exercises: exStagnation,
      appliedAt: Date.now(),
      description: `${exStagnation.length} exercitii stagnate 3+ saptamani`,
    });
  }

  // CDL-derived patterns — gated by MIN_CDL_WEIGHT to prevent false positives on sparse data
  const cutoff = Date.now() - windowDays * MS_PER_DAY;
  const allEntries = readAllActive();
  const relevant = allEntries.filter(e => {
    const ts = e.ts ?? (e.date ? new Date(e.date + 'T12:00:00').getTime() : 0);
    return ts >= cutoff && e.outcome != null;
  });

  let totalWeight = 0;
  let adheredWeight = 0;
  let deviatedWeight = 0;
  let earlyEndWeight = 0;
  let executedWeight = 0;

  for (const entry of relevant) {
    const w = entry.synthetic ? 0.5 : 1.0;
    totalWeight += w;
    const { executed, deviation, earlyStop } = entry.outcome;
    if (executed !== false) executedWeight += w;
    if (executed === true && !deviation) adheredWeight += w;
    if (deviation) deviatedWeight += w;
    if (executed === 'partial' || earlyStop === true) earlyEndWeight += w;
  }

  if (totalWeight < MIN_CDL_WEIGHT) return patterns;

  const adherenceRate = adheredWeight / totalWeight;
  const deviationRate = deviatedWeight / totalWeight;
  const earlyEndRate = executedWeight > 0 ? earlyEndWeight / executedWeight : 0;

  if (adherenceRate < 0.5) {
    patterns.push({
      type: 'LOW_ADHERENCE',
      adherenceRate: Math.round(adherenceRate * 100),
      appliedAt: Date.now(),
      description: `Adherence scazuta ultimele ${windowDays} zile: ${Math.round(adherenceRate * 100)}%. Reducem volum si verificam contextul.`,
    });
  }

  if (deviationRate > 0.3) {
    patterns.push({
      type: 'HIGH_DEVIATION',
      deviationRate: Math.round(deviationRate * 100),
      appliedAt: Date.now(),
      description: `Deviation crescut: ${Math.round(deviationRate * 100)}% sesiuni diferite de propunere. Coach-ul ajusteaza propunerile.`,
    });
  }

  if (earlyEndRate > 0.4) {
    patterns.push({
      type: 'EARLY_END',
      earlyEndRate: Math.round(earlyEndRate * 100),
      appliedAt: Date.now(),
      description: `${Math.round(earlyEndRate * 100)}% sesiuni terminate devreme — program scurtat 20%`,
    });
  }

  return patterns;
}

export function getAppliedPatterns() {
  return DB.get('applied-patterns') || [];
}

export function dismissPattern(index) {
  const all = DB.get('applied-patterns') || [];
  all.splice(index, 1);
  DB.set('applied-patterns', all);
}
