// ══ CALIBRATION TIERS — User maturity levels for engine feature gating ═══════
// 5 tiers from cold start (day 0) to optimized (180+ days).
// Engines only run when enabled for the current tier — prevents false positives
// and unnecessary computation for new users.

export const CALIBRATION_LEVELS = {
  COLD_START: {
    id: 0,
    name: 'cold_start',
    displayName: 'Inițializare',
    durationDays: 7,
    minSessions: 0,
    maxSessions: 2,
    userWeight: 0.0,
    generalWeight: 1.0,
    recalibrationFrequency: 'per_session',
    patternsEnabled: false,
    weakGroupEnabled: false,
    stagnationEnabled: false,
    predictionEnabled: false,
    bannerText: 'Sistemul învață din tine. Recomandările se personalizează rapid.',
    description: 'Guidelines bazate pe onboarding (beginner/intermediate/advanced, cut/bulk).',
  },

  INITIAL: {
    id: 1,
    name: 'initial',
    displayName: 'Calibrare inițială',
    durationDays: 28,
    minSessions: 3,
    maxSessions: 12,
    userWeight: 0.5,
    generalWeight: 0.5,
    recalibrationFrequency: 'daily',
    patternsEnabled: true,
    patternMinConfidence: 0.70,
    weakGroupEnabled: false,
    stagnationEnabled: false,
    predictionEnabled: false,
    bannerText: 'Calibrare în curs. Mai am nevoie de câteva sesiuni pentru predicții precise.',
    description: '50% user data + 50% population guideline. Pattern detection activ (high confidence only).',
  },

  PERSONALIZING: {
    id: 2,
    name: 'personalizing',
    displayName: 'Personalizare activă',
    durationDays: 90,
    minSessions: 12,
    maxSessions: 40,
    userWeight: 0.8,
    generalWeight: 0.2,
    recalibrationFrequency: 'weekly',
    patternsEnabled: true,
    patternMinConfidence: 0.60,
    weakGroupEnabled: true,
    stagnationEnabled: true,
    predictionEnabled: true,
    bannerText: 'Recomandările sunt acum majoritar bazate pe tine.',
    description: '80% user data + 20% general. Toate engines active cu threshold relaxat.',
  },

  PERSONALIZED: {
    id: 3,
    name: 'personalized',
    displayName: 'Personalizat',
    durationDays: 180,
    minSessions: 40,
    maxSessions: 80,
    userWeight: 1.0,
    generalWeight: 0.0,
    recalibrationFrequency: 'weekly',
    patternsEnabled: true,
    patternMinConfidence: 0.50,
    weakGroupEnabled: true,
    stagnationEnabled: true,
    predictionEnabled: true,
    responseProfileEnabled: true,
    bannerText: null,
    description: '100% user data. Rolling window ultimele 5-6 luni. Response Profile activ.',
  },

  OPTIMIZED: {
    id: 4,
    name: 'optimized',
    displayName: 'Optimizat',
    durationDays: Infinity,
    minSessions: 80,
    maxSessions: Infinity,
    userWeight: 1.0,
    generalWeight: 0.0,
    recalibrationFrequency: 'monthly_or_trigger',
    patternsEnabled: true,
    patternMinConfidence: 0.45,
    weakGroupEnabled: true,
    stagnationEnabled: true,
    predictionEnabled: true,
    responseProfileEnabled: true,
    rollingWindowMonths: 6,
    bannerText: null,
    description: 'Sistem optimizat. Rolling window 6 luni, recalibrare lunară + trigger events.',
  },
};

/**
 * Detect calibration level from log history.
 * Uses unique session count (by session ID or date) and first-session age.
 */
export function detectCalibrationLevel(ctx) {
  const allLogs = ctx.allLogs ?? [];

  // Count unique sessions — a session = unique session timestamp or workout date
  const sessionKeys = new Set();
  for (const log of allLogs) {
    const key = log.session ?? log.date ?? log.timestamp;
    if (key) sessionKeys.add(String(key).slice(0, 10)); // normalize to date prefix
  }
  const sessionsCount = ctx.allSessions?.length ?? sessionKeys.size;

  // First session date
  const dates = allLogs
    .map(l => {
      const raw = l.date || l.timestamp || l.ts;
      const d = raw ? new Date(raw) : null;
      return d && !isNaN(d.getTime()) ? d : null;
    })
    .filter(Boolean);
  const firstDate = dates.length > 0
    ? new Date(Math.min(...dates.map(d => d.getTime())))
    : new Date();
  const daysSinceFirst = (Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceFirst < 7 || sessionsCount < 3)  return CALIBRATION_LEVELS.COLD_START;
  if (daysSinceFirst < 28 || sessionsCount < 12) return CALIBRATION_LEVELS.INITIAL;
  if (daysSinceFirst < 90 || sessionsCount < 40) return CALIBRATION_LEVELS.PERSONALIZING;
  if (daysSinceFirst < 180 || sessionsCount < 80) return CALIBRATION_LEVELS.PERSONALIZED;
  return CALIBRATION_LEVELS.OPTIMIZED;
}

/**
 * Whether a recalibration run is due based on tier frequency and last run timestamp.
 */
export function shouldRecalibrate(level, lastRecalibration) {
  if (!lastRecalibration) return true;

  const hoursSince = (Date.now() - new Date(lastRecalibration).getTime()) / (1000 * 60 * 60);

  switch (level.recalibrationFrequency) {
    case 'per_session':        return false;           // triggered after session, not time-based
    case 'daily':              return hoursSince >= 20; // slack for timezone drift
    case 'weekly':             return hoursSince >= 24 * 7;
    case 'monthly_or_trigger': return hoursSince >= 24 * 30;
    default:                   return false;
  }
}

/**
 * Filter logs to the rolling window defined for the level.
 * Only OPTIMIZED (6 months) currently has a window; others return all logs.
 */
export function applyRollingWindow(logs, level) {
  if (!level.rollingWindowMonths) return logs;
  const cutoff = Date.now() - level.rollingWindowMonths * 30 * 24 * 60 * 60 * 1000;
  return logs.filter(log => {
    const raw = log.date || log.timestamp || log.ts;
    const d = raw ? new Date(raw) : null;
    return d && !isNaN(d.getTime()) && d.getTime() >= cutoff;
  });
}
