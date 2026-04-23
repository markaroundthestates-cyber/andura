// ══ E2E Session Fixtures ═════════════════════════════════════════════════════

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const PULL_EXERCISES = [
  'Lat Pulldown',
  'Cable Row',
  'Chest-Supported Row',
  'Bayesian Curl',
  'Face Pulls',
];

export const PUSH_EXERCISES = [
  'Incline DB Press',
  'Flat DB Press',
  'Pec Deck',
  'DB Shoulder Press',
  'Lateral Raises',
];

/**
 * Build a set of logs for a single session.
 * @param {string} date - ISO date string
 * @param {number} sessionTs - session timestamp
 * @param {string[]} exercises - list of exercise names
 * @param {number} setsPerEx - sets per exercise
 */
export function buildSession(date, sessionTs, exercises, setsPerEx = 3) {
  const logs = [];
  exercises.forEach((ex, ei) => {
    for (let s = 0; s < setsPerEx; s++) {
      logs.push({
        date,
        ex,
        w: 50 + ei * 5,
        sets: 1,
        reps: '8',
        rpe: 7,
        ts: sessionTs + (ei * setsPerEx + s) * 1000,
        session: sessionTs,
        baseline: false,
      });
    }
  });
  return logs;
}

export const RECENT_PULL_SESSIONS = (() => {
  const sessions = [];
  for (let i = 0; i < 3; i++) {
    const date = daysAgo(2 + i * 2);
    const ts = new Date(date + 'T10:00:00').getTime();
    sessions.push({ date, ts, logs: buildSession(date, ts, PULL_EXERCISES, 3) });
  }
  return sessions;
})();
