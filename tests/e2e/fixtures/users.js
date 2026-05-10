// ══ E2E Test Fixtures — User profiles for Playwright tests ══════════════════
// All users suppress Firebase sync to avoid network dependencies.
// Readiness format: { score: 0-100, emoji } for coachContext compatibility.

const TODAY = new Date().toISOString().slice(0, 10);

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function tsFor(date, offsetMs = 0) {
  return new Date(date + 'T10:00:00').getTime() + offsetMs;
}

// ── EMPTY: fresh user, no data ───────────────────────────────────────────────
export const EMPTY = {
  _suppressFirebaseSync: true,
  'onboarding-done': true,
};

// ── CUT_ACTIVE: AUTO phase before 2026-07-20, kcal=1800, readiness score 85+ ─
export const CUT_ACTIVE = {
  _suppressFirebaseSync: true,
  'onboarding-done': true,
  'phase-override': 'AUTO',
  'current-kcal': '1800',
  // Readiness input 5 (max) → score = 60 + 40 = 100 >= 85
  readiness: { [TODAY]: { score: 100, emoji: '🔥' } },
};

// ── WITH_HISTORY: 3 PULL sessions in last 7 days (5 exercises × 3 sets each) ─
const PULL_EXERCISES = [
  'Lat Pulldown',
  'Cable Row',
  'Chest-Supported Row',
  'Bayesian Curl',
  'Face Pulls',
];

function buildPullSession(date, sessionTs) {
  const logs = [];
  PULL_EXERCISES.forEach((ex, ei) => {
    for (let s = 0; s < 3; s++) {
      logs.push({
        date,
        ex,
        w: 60 + ei * 5,
        sets: 1,
        reps: '8',
        rpe: 7 + (s % 2),
        ts: sessionTs + (ei * 3 + s) * 1000,
        session: sessionTs,
        baseline: false,
      });
    }
  });
  return logs;
}

const session1Date = daysAgo(6);
const session2Date = daysAgo(4);
const session3Date = daysAgo(2);
const session1Ts = tsFor(session1Date);
const session2Ts = tsFor(session2Date);
const session3Ts = tsFor(session3Date);

const WITH_HISTORY_LOGS = [
  ...buildPullSession(session1Date, session1Ts),
  ...buildPullSession(session2Date, session2Ts),
  ...buildPullSession(session3Date, session3Ts),
];

const WITH_HISTORY_BURNS = [
  { date: session1Date, day: 'Marti',    mins: 55, kcal: 290, sets: 15, startHour: 18 },
  { date: session2Date, day: 'Joi',      mins: 58, kcal: 305, sets: 15, startHour: 18 },
  { date: session3Date, day: 'Sambata',  mins: 60, kcal: 315, sets: 15, startHour: 10 },
];

export const WITH_HISTORY = {
  _suppressFirebaseSync: true,
  'onboarding-done': true,
  'phase-override': 'AUTO',
  'current-kcal': '1800',
  logs: WITH_HISTORY_LOGS,
  'session-burns': WITH_HISTORY_BURNS,
};

// ── CONTAMINATED: mature user (3 sessions) with stale applied-patterns ────────
// Must have ≥3 sessions so clearStalePatternsIfColdStart does NOT fire on init.
export const CONTAMINATED = {
  _suppressFirebaseSync: true,
  'onboarding-done': true,
  'phase-override': 'AUTO',
  'current-kcal': '1800',
  logs: WITH_HISTORY_LOGS,
  'auto-recommendations': [
    {
      type: 'early_end',
      confidence: 0.88,
      earlyEndRate: 88,
      appliedAt: Date.now() - 86400000,
      description: '88% sesiuni terminate devreme — program scurtat 20%',
    },
  ],
  'applied-patterns': [
    {
      type: 'EARLY_END',
      earlyEndRate: 88,
      appliedAt: Date.now() - 86400000,
      description: '88% sesiuni terminate devreme — program scurtat 20%',
    },
  ],
};
