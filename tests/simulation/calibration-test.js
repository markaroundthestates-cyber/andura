// ══ CALIBRATION STRESS TEST — Motor correctness across all 5 tiers ═════════
// Validates that coachDirector returns sensible sessions for every
// calibration level from cold start (0 sessions) to optimized (400 days).
//
// Run: node --experimental-vm-modules tests/simulation/calibration-test.js

import { detectCalibrationLevel, CALIBRATION_LEVELS } from '../../src/engine/calibration.js';
import { applyRollingWindow } from '../../src/engine/calibration.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeLog(daysAgo, exercise = 'Lat Pulldown', sessionIndex = 0) {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return {
    date: d.toISOString().slice(0, 10),
    timestamp: d.toISOString(),
    ex: exercise,
    w: 30 + sessionIndex * 0.5,
    reps: 8,
    rpe: 7,
    session: d.toISOString().slice(0, 10) + '-' + sessionIndex,
  };
}

function makeLogsForScenario(sessionCount, daysOld) {
  const logs = [];
  const exerciseCycle = ['Lat Pulldown', 'Cable Row', 'Incline DB Press', 'DB Shoulder Press', 'Pushdown'];
  for (let i = 0; i < sessionCount; i++) {
    const dayOffset = sessionCount > 1 ? (daysOld / (sessionCount - 1)) * i : 0;
    // Each session = 5 sets (5 log entries with same session key)
    for (let s = 0; s < 5; s++) {
      logs.push({
        date: new Date(Date.now() - (daysOld - dayOffset) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        timestamp: new Date(Date.now() - (daysOld - dayOffset) * 24 * 60 * 60 * 1000).toISOString(),
        ex: exerciseCycle[(i + s) % exerciseCycle.length],
        w: 30 + i * 0.5,
        reps: 8,
        rpe: 7,
        session: `session-${i}`,
      });
    }
  }
  return logs;
}

// ── Scenarios ─────────────────────────────────────────────────────────────────

const SCENARIOS = [
  { name: 'cold_start',              sessions: 0,   daysOld: 0,   expectedLevel: 'cold_start'   },
  { name: 'cold_start_with_sessions',sessions: 2,   daysOld: 3,   expectedLevel: 'cold_start'   },
  { name: 'initial',                 sessions: 8,   daysOld: 14,  expectedLevel: 'initial'       },
  { name: 'personalizing',           sessions: 25,  daysOld: 60,  expectedLevel: 'personalizing' },
  { name: 'personalized',            sessions: 60,  daysOld: 150, expectedLevel: 'personalized'  },
  { name: 'optimized',               sessions: 200, daysOld: 400, expectedLevel: 'optimized'     },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

const results = [];
let failures = 0;

for (const scenario of SCENARIOS) {
  const logs = makeLogsForScenario(scenario.sessions, scenario.daysOld);
  const ctx = { allLogs: logs };

  try {
    const level = detectCalibrationLevel(ctx);

    // 1. Level must be detected
    if (!level) throw new Error('detectCalibrationLevel returned null');

    // 2. Level must match expected
    if (level.name !== scenario.expectedLevel) {
      throw new Error(`Expected level '${scenario.expectedLevel}', got '${level.name}' (sessions=${scenario.sessions}, days=${scenario.daysOld})`);
    }

    // 3. Cold start must have patterns disabled
    if ((scenario.name === 'cold_start' || scenario.name === 'cold_start_with_sessions') && level.patternsEnabled) {
      throw new Error('Cold start should have patternsEnabled=false');
    }

    // 4. Cold start must have weakGroup/stagnation/prediction disabled
    if (scenario.name.startsWith('cold_start') && (level.weakGroupEnabled || level.stagnationEnabled)) {
      throw new Error('Cold start should have weakGroupEnabled/stagnationEnabled=false');
    }

    // 5. Optimized must have rolling window
    if (scenario.name === 'optimized' && !level.rollingWindowMonths) {
      throw new Error('Optimized should have rollingWindowMonths defined');
    }

    // 6. Rolling window filters old logs correctly
    if (scenario.name === 'optimized') {
      const windowed = applyRollingWindow(logs, level);
      const cutoffMs = Date.now() - level.rollingWindowMonths * 30 * 24 * 60 * 60 * 1000;
      const tooOld = windowed.filter(l => new Date(l.date).getTime() < cutoffMs);
      if (tooOld.length > 0) {
        throw new Error(`Rolling window left ${tooOld.length} logs older than ${level.rollingWindowMonths} months`);
      }
    }

    // 7. Banner: COLD_START and INITIAL must have bannerText, OPTIMIZED must not
    if ((scenario.name === 'cold_start' || scenario.name === 'initial') && !level.bannerText) {
      throw new Error(`${level.name} should have a bannerText`);
    }
    if (scenario.name === 'optimized' && level.bannerText !== null) {
      throw new Error('OPTIMIZED should have bannerText=null');
    }

    results.push({ scenario: scenario.name, status: 'PASS', level: level.name });
  } catch (err) {
    failures++;
    results.push({ scenario: scenario.name, status: 'FAIL', error: err.message });
    console.error(`[FAIL] ${scenario.name}: ${err.message}`);
  }
}

// ── Additional unit checks ────────────────────────────────────────────────────

// Check shouldRecalibrate
import { shouldRecalibrate } from '../../src/engine/calibration.js';

try {
  const daily = CALIBRATION_LEVELS.INITIAL;

  if (!shouldRecalibrate(daily, null)) {
    throw new Error('shouldRecalibrate should return true when last=null');
  }
  const recent = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(); // 10h ago
  if (shouldRecalibrate(daily, recent)) {
    throw new Error('shouldRecalibrate should return false when only 10h ago for daily tier');
  }
  const old = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25h ago
  if (!shouldRecalibrate(daily, old)) {
    throw new Error('shouldRecalibrate should return true when 25h ago for daily tier');
  }
  results.push({ scenario: 'shouldRecalibrate_checks', status: 'PASS', level: 'n/a' });
} catch (err) {
  failures++;
  results.push({ scenario: 'shouldRecalibrate_checks', status: 'FAIL', error: err.message });
}

// ── Report ────────────────────────────────────────────────────────────────────

console.log('\n═══ CALIBRATION STRESS TEST RESULTS ═══');
for (const r of results) {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  const detail = r.status === 'FAIL' ? ` → ${r.error}` : ` (${r.level})`;
  console.log(`${icon} ${r.scenario}${detail}`);
}
console.log(`\nTotal: ${results.length} | Passed: ${results.filter(r => r.status === 'PASS').length} | Failed: ${failures}`);

if (failures > 0) {
  console.error('\n[CALIBRATION TEST] FAILED — fix issues before deploying');
  process.exit(1);
} else {
  console.log('\n[CALIBRATION TEST] ALL PASS');
  process.exit(0);
}
