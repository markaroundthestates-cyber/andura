// FOCUS-FLOOR DROP-GUARD through the LIVE compose path (registry-default flags).
// Regression lock for the /10-eval finding (2026-06-13): on a full-body FOCUS week
// (freq <=3 -> every day 'full') buildSession correctly PLACES the maintained
// de-emphasized-region slot (v-taper/upper legs) and the 2nd-arm-head slot (arms
// biceps), but those sit in the TAIL behind the focus compounds, so the persona
// time-budget trim (trimSessionToTimeBudget) DROPPED them tail-first -> the region /
// arm head zeroed for the whole week (v-taper legs=0, arms biceps=0 — a prime-mover
// orphan the rubric caps). The focus-floor drop-guard makes the trim refuse to drop
// the LAST carrier of a maintained region / signature group (sets can still shave,
// non-protected tail still drops, so the cap is still met). Composes through the
// SHIPPED path (resetWorld -> registry defaults, dp_split_rebalance_v1 ON) so a
// regression that only shows up at live defaults is caught here.

import { describe, it, expect } from 'vitest';
import { world, resetWorld } from './full-path-sim/fp-config.js';
import { DB } from '../../src/db.js';
import { getExerciseMetadata } from '../../src/engine/exerciseLibrary.js';

const MS_DAY = 86400000;
const WEEK_START = Date.UTC(2026, 5, 15, 6, 0, 0);
const AW3 = [true, false, true, false, true, false, false]; // L, Mi, V (canonical 3-day)

function lh(ex, kg, reps, n) {
  const r = [];
  for (let s = 0; s < n; s++) {
    const ts = WEEK_START - (s + 1) * 3 * MS_DAY;
    for (let k = 0; k < 3; k++) r.push({ date: '2026-06-10', ex, kg, reps: String(reps), rpe: 7.5, session: ts, set: k + 1, sets: 1, ts: ts - k * 60000, w: kg });
  }
  return r;
}
// Intermediate-male history WITH leg + arm lifts — a real trained user whose legs
// (v-taper) and biceps (arms) must still be maintained on a focus week.
const LOGS = [
  ...lh('Barbell Bench Press', 80, 8, 4), ...lh('Barbell Back Squat', 110, 6, 4),
  ...lh('Romanian Deadlift', 90, 8, 3), ...lh('Lat Pulldown', 70, 10, 4),
  ...lh('Cable Row', 70, 10, 4), ...lh('Barbell Curl', 35, 10, 3),
];
function prs(l) { const b = {}; for (const x of l) { const c = b[x.ex]; if (!c || x.w > c.kg) b[x.ex] = { ex: x.ex, kg: x.w, reps: Number(x.reps), ts: x.ts, date: x.date }; } return Object.values(b); }
function seed(focusPreset, goal) {
  resetWorld(); // -> registry-default flags (LIVE), dp_split_rebalance_v1 ON
  try { localStorage.setItem('wv2-schedule-store', JSON.stringify({ state: { days: AW3.map((a) => (a ? 'training' : 'rest')) } })); } catch { /* jsdom */ }
  DB.set('logs', [...LOGS].sort((a, b) => b.ts - a.ts));
  DB.set('pr-records', prs(LOGS));
  world.useOnboardingStore.setState({
    data: { age: 32, sex: 'm', goal, experience: 'intermediar', weight: 80, height: 178, frequency: '3', focusPreset, focusPresetPickedAt: WEEK_START - 7 * MS_DAY },
    completed: true, completedAt: WEEK_START,
  });
}
async function weeklyByGroup(focusPreset, goal) {
  const w = {};
  for (const off of [0, 2, 4]) {
    seed(focusPreset, goal);
    const plan = await world.composePlannedWorkoutToday(new Date(WEEK_START + off * MS_DAY));
    for (const e of plan?.exercises || []) {
      const g = getExerciseMetadata(e.engineName || e.name)?.muscle_target_primary;
      if (g) w[g] = (w[g] || 0) + (e.sets || 0);
    }
  }
  return w;
}

describe('FOCUS-FLOOR drop-guard — full-body focus week keeps the maintained region / arm head (live)', () => {
  it('v-taper 3-day full-body: the de-emphasized big-leg region survives the time-trim (> 0)', async () => {
    const w = await weeklyByGroup('v-taper', 'forta');
    const legs = (w['picioare-quads'] || 0) + (w['picioare-hamstrings'] || 0) + (w.fese || 0);
    expect(legs, `big-leg weekly sets (weekly=${JSON.stringify(w)})`).toBeGreaterThan(0);
  }, 120000);

  it('arms 3-day full-body: biceps (2nd arm head) survives the time-trim (> 0)', async () => {
    const w = await weeklyByGroup('arms', 'forta');
    expect(w.biceps || 0, `biceps weekly sets (weekly=${JSON.stringify(w)})`).toBeGreaterThan(0);
  }, 120000);
});
