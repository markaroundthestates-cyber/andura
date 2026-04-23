// ══ SIMULATION A — Sequential Load: 500 virtual users ════════════════════
// Simulates 500 virtual users exercising sequentially through the engine stack.
// Each user: random readiness + phase + 2-12 weeks of logs.
// Checks: no crashes, no impossible weights, no infinite loops.
// STOP criteria: > 5 failures from 500 → exit code 1

import { evaluate } from '../../src/engine/ruleEngine.js';
import { detectWeakGroups } from '../../src/engine/weaknessDetector.js';
import { detectGlobalStagnation } from '../../src/engine/stagnationDetector.js';
import { absenceProbabilityByDay } from '../../src/engine/predictionEngine.js';
import { recompileWeek } from '../../src/engine/recompileEngine.js';
import { getAlternatives } from '../../src/engine/alternativeEngine.js';
import { explainRecommendation } from '../../src/engine/whyEngine.js';
import { computeUserProfile } from '../../src/engine/responseProfile.js';
import { runProactiveChecks } from '../../src/engine/proactiveEngine.js';

const EXERCISES = [
  'Incline DB Press', 'Pec Deck / Cable Fly', 'DB Shoulder Press', 'Lateral Raises',
  'Overhead Triceps', 'Pushdown', 'Lat Pulldown', 'Cable Row', 'Face Pulls',
  'Bayesian Curl', 'Incline DB Curl',
];
const PHASES = ['AUTO', 'CUT', 'BULK'];
const EQUIPMENT = [[], ['cable'], ['pec_deck'], ['barbell']];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUser(seed) {
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(seed) / 0x80000000;
  };

  const readinessScore = Math.floor(rng() * 100) + 1;
  const phase = PHASES[Math.floor(rng() * PHASES.length)];
  const weeksOfHistory = Math.floor(rng() * 11) + 2; // 2–12 weeks
  const isInCut = phase === 'CUT' || (phase === 'AUTO' && new Date() < new Date('2026-07-20'));
  const unavailableEquipment = EQUIPMENT[Math.floor(rng() * EQUIPMENT.length)];

  // Generate workout logs
  const logs = [];
  const baseTs = Date.now() - weeksOfHistory * 7 * 24 * 3600 * 1000;
  const exercises = EXERCISES.slice(0, Math.floor(rng() * 5) + 4);

  for (let week = 0; week < weeksOfHistory; week++) {
    for (const ex of exercises) {
      const weekStart = baseTs + week * 7 * 24 * 3600 * 1000;
      const weight = 10 + Math.floor(rng() * 80);
      const reps = 6 + Math.floor(rng() * 7);
      const ts = weekStart + Math.floor(rng() * 5) * 24 * 3600 * 1000;
      logs.push({ ex, w: weight, reps, ts, session: weekStart, date: new Date(ts).toISOString().slice(0, 10) });
    }
  }

  return { readinessScore, phase, isInCut, unavailableEquipment, logs, weeksOfHistory };
}

function runUserSimulation(userId) {
  const user = generateUser(userId * 12345 + 67890);

  const ctx = {
    readiness: { score: user.readinessScore, isSet: true },
    isInCut: user.isInCut,
    user: { phase: user.phase },
    patterns: [],
    weakGroups: [],
    stagnationWeeks: 0,
    missedSessions: 0,
    fatigueIndex: user.readinessScore < 55 ? 0.9 : 0,
  };

  const failures = [];

  // Test 1: Rule Engine must not throw
  try {
    const ruleResult = evaluate(ctx);
    if (!ruleResult || !ruleResult.action) failures.push('RuleEngine: no action returned');
    if (!['rest', 'deload', 'conservative', 'prioritize_weak', 'compensate_volume',
          'deload_stagnation', 'technique_focus', 'volume_increase', 'shorten_session', 'normal']
        .includes(ruleResult.action)) {
      failures.push(`RuleEngine: unknown action "${ruleResult.action}"`);
    }
  } catch (e) {
    failures.push(`RuleEngine threw: ${e.message}`);
  }

  // Test 2: WeaknessDetector must not throw
  try {
    const { weakGroups } = detectWeakGroups(user.logs);
    if (!Array.isArray(weakGroups)) failures.push('WeaknessDetector: weakGroups not array');
  } catch (e) {
    failures.push(`WeaknessDetector threw: ${e.message}`);
  }

  // Test 3: StagnationDetector must not throw
  try {
    const { maxStagnationWeeks } = detectGlobalStagnation(user.logs);
    if (typeof maxStagnationWeeks !== 'number') failures.push('StagnationDetector: not a number');
    if (maxStagnationWeeks < 0) failures.push('StagnationDetector: negative weeks');
  } catch (e) {
    failures.push(`StagnationDetector threw: ${e.message}`);
  }

  // Test 4: AlternativeEngine must not throw and return valid arrays
  try {
    for (const ex of EXERCISES.slice(0, 5)) {
      const alts = getAlternatives(ex, user.unavailableEquipment);
      if (!Array.isArray(alts)) failures.push(`AlternativeEngine: not array for ${ex}`);
    }
  } catch (e) {
    failures.push(`AlternativeEngine threw: ${e.message}`);
  }

  // Test 5: RecompileEngine must not throw
  try {
    const result = recompileWeek({ logs: user.logs, readinessScore: user.readinessScore });
    if (typeof result.deficit !== 'number') failures.push('RecompileEngine: deficit not number');
    if (result.deficit < 0) failures.push('RecompileEngine: negative deficit');
  } catch (e) {
    failures.push(`RecompileEngine threw: ${e.message}`);
  }

  // Test 6: WhyEngine must not throw
  try {
    const exercise = { name: EXERCISES[0], recommendation: { kg: 30, status: 'CONSOLIDATE' } };
    const { summary, reasons } = explainRecommendation(exercise, ctx);
    if (!summary) failures.push('WhyEngine: no summary');
    if (!Array.isArray(reasons)) failures.push('WhyEngine: reasons not array');
  } catch (e) {
    failures.push(`WhyEngine threw: ${e.message}`);
  }

  // Test 7: ResponseProfile must not throw
  try {
    const { volume, frequency } = computeUserProfile(user.logs);
    if (volume.score < 0 || volume.score > 1) failures.push('ResponseProfile: volume score out of range');
    if (frequency.score < 0 || frequency.score > 1) failures.push('ResponseProfile: frequency score out of range');
  } catch (e) {
    failures.push(`ResponseProfile threw: ${e.message}`);
  }

  // Test 8: ProactiveEngine must not throw
  try {
    const today = new Date().toISOString().slice(0, 10);
    const alerts = runProactiveChecks({
      logs: user.logs,
      readiness: { [today]: { score: user.readinessScore } },
      user: { weight: 85 },
    });
    if (!Array.isArray(alerts)) failures.push('ProactiveEngine: not array');
  } catch (e) {
    failures.push(`ProactiveEngine threw: ${e.message}`);
  }

  return failures;
}

async function main() {
  const TOTAL_USERS = 500;
  const MAX_FAILURES = 5;
  let totalFailures = 0;
  const failureDetails = [];

  console.log(`[Simulation A] Running ${TOTAL_USERS} sequential virtual users...`);
  const start = Date.now();

  for (let i = 0; i < TOTAL_USERS; i++) {
    const failures = runUserSimulation(i);
    if (failures.length > 0) {
      totalFailures++;
      failureDetails.push({ user: i, failures });
      console.error(`[Simulation A] User ${i} FAILED:`, failures.join('; '));
    }

    if (totalFailures > MAX_FAILURES) {
      console.error(`[Simulation A] STOP: ${totalFailures} failures exceeded limit of ${MAX_FAILURES}`);
      console.error('[Simulation A] Failure details:');
      failureDetails.forEach(({ user, failures }) => {
        console.error(`  User ${user}: ${failures.join('; ')}`);
      });
      process.exit(1);
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  if (totalFailures === 0) {
    console.log(`[Simulation A] PASS: 0/${TOTAL_USERS} failures in ${elapsed}s`);
  } else {
    console.warn(`[Simulation A] WARN: ${totalFailures}/${TOTAL_USERS} failures in ${elapsed}s (within limit)`);
  }

  process.exit(0);
}

main().catch(e => {
  console.error('[Simulation A] Fatal error:', e);
  process.exit(1);
});
