// ══ FULL-PATH-SIM — main run: drive the COMPLETE composition seam ══════════
// For each synthetic user, walk `weeks` × 4 active days. Each session:
//   1) set today's onboarding/readiness/time-budget world state,
//   2) compose TODAY's plan through the FULL path (composePlannedWorkoutToday),
//   3) "perform" it (the user lifts the prescribed kg, rates each set vs the
//      hidden true capacity), build a session summary,
//   4) persist it (persistSessionLogs writes logs + learnedVolume; push to
//      sessionsHistory) so the NEXT compose sees real history — closing the
//      multi-session feedback loop the calibration-sim never had through this path.
//
// The plan captured at step 2 IS the whole-session output (exercise list, set
// counts, prescribed kg, est duration, intensityMod) — what fp-analyze measures.
// Deterministic: mulberry32 per profile + a fixed COHORT_START; every engine clock
// is the injected `now`/ts (no Date.now leak in the driven path).

import { world, resetWorld, setPathAFlags } from './fp-config.js';
import { buildJourneyCohort, trueCapAt } from './fp-journeys.js';
import { computeACWR } from '../../../src/engine/muscleRecovery.js';
import { getComputedReadinessScore } from '../../../src/engine/readiness.js';
import { tod as todReal } from '../../../src/db.js';

const MS_DAY = 86400000;
const COHORT_START = Date.UTC(2026, 0, 5); // Monday — stable active-day rotation
const ACTIVE_OFFSETS = [0, 1, 2, 3];       // L, M, Mi, J of each week (freq '4')
const round1 = (x) => Math.round(x * 10) / 10;

// EN→engine rating from how the prescribed load sits vs the hidden true working
// load: well under → 'usor', near → 'potrivit', at/over → 'greu' (user-reaction model).
function rateSet(prescribedKg, trueWorkingKg) {
  if (trueWorkingKg <= 0) return 'potrivit';
  const ratio = prescribedKg / trueWorkingKg;
  if (ratio <= 0.85) return 'usor';
  if (ratio >= 1.02) return 'greu';
  return 'potrivit';
}

// The kg the user can move at the recommended rep target, from the hidden ~10-rep
// cap (Epley-style normalization — matches the calibration-sim oracle convention).
function trueWorkingKgAtReps(capAt10, repsTarget) {
  return (capAt10 * (1 + 10 / 30)) / (1 + repsTarget / 30);
}

/** Per-trait world signals written to the stores/DB the compose path reads, BEFORE
 *  each compose so the path-A engines pick them up.
 *
 *  NOTE — readiness across the journey is NOT drivable: readiness.js resolves the
 *  energy-check against the WALL clock (db.tod()), not the composer's injected
 *  simulated date, so a per-session readiness on a 2026-01-simulated day never
 *  reaches getComputedReadinessScore (it looks up the REAL today). The journey
 *  therefore exercises the weekly-recovery / emphasis / learned-volume / stimulus
 *  flags (which read logs/sessionsHistory/time-budget — all date-injectable); the
 *  ACWR/readiness flag is proven separately by acwrRealClockFullPath(). We still
 *  set sessionTimeBudgetMin per trait (that IS read live from the store). */
function applyTraitSignals(profile) {
  world.useWorkoutStore.setState({
    sessionTimeBudgetMin: profile.trait === 'tight_time' ? 40 : null,
  });
}

/**
 * Drive one cohort through the FULL composition path and RETURN the per-profile
 * journey of composed plans + the performed reality.
 *
 * @param {boolean} flagsOn true = path-A flags ON (dev-flag override), false = baseline
 * @param {number} nProfiles cohort size
 * @param {number} seed deterministic seed
 * @param {number} weeks journey length in weeks (4 active days each)
 */
export async function runFullPathCohortAsync(flagsOn, nProfiles, seed, weeks) {
  const cohort = buildJourneyCohort(nProfiles, seed);
  const perProfile = [];

  for (const profile of cohort) {
    resetWorld();
    setPathAFlags(flagsOn); // dev-flag override AFTER the localStorage clear

    // emphasis users carry a non-balanced focus picked 1 week ago → the spec
    // engine's 4-week meso clock is still ACTIVE (weeks-elapsed < 4).
    const emphasisActive = profile.trait === 'emphasis' && profile.emphasisPreset !== 'balanced';
    world.useOnboardingStore.setState({
      data: {
        age: profile.age, sex: profile.sex, goal: profile.goal,
        frequency: profile.frequency, experience: profile.experience,
        weight: profile.weight, height: profile.height,
        focusPreset: emphasisActive ? profile.emphasisPreset : 'balanced',
        focusPresetPickedAt: emphasisActive ? COHORT_START - 7 * MS_DAY : null,
      },
      completed: true,
      completedAt: COHORT_START,
    });

    const sessions = [];
    let sessionNo = 0;

    for (let week = 0; week < weeks; week++) {
      for (const off of ACTIVE_OFFSETS) {
        sessionNo += 1;
        const nowMs = COHORT_START + (week * 7 + off) * MS_DAY;
        const now = new Date(nowMs);

        applyTraitSignals(profile);

        // ── DRIVE THE FULL PATH — the keystone call the old sim never reached. ──
        let plan = null;
        try {
          plan = await world.composePlannedWorkoutToday(now);
        } catch {
          plan = null;
        }

        if (plan === null) {
          sessions.push({ sessionNo, missed: true, plan: null });
          continue;
        }

        // ── PERFORM the prescribed plan (user lifts the rec kg vs hidden cap) ──
        const breakdown = [];
        const planRecord = {
          sessionType: plan.sessionType ?? null,
          intensityMod: plan.intensityMod,
          exerciseCount: plan.exerciseCount,
          estimatedDuration: plan.estimatedDuration,
          volumeKg: plan.volumeKg,
          exercises: [],
        };
        // fatigued_week pushes loads up a touch → bigger stress → recovery debt.
        const fatigueBoost = profile.trait === 'fatigued_week' ? 1.12 : 1.0;
        for (const ex of plan.exercises) {
          const capAt10 = trueCapAt(profile, ex.engineName, week);
          const trueWorkKg = trueWorkingKgAtReps(capAt10, ex.targetReps);
          const setRows = [];
          for (let si = 0; si < ex.sets; si++) {
            const lifted = round1((ex.targetKg || 0) * fatigueBoost);
            const rating = rateSet(lifted, trueWorkKg);
            setRows.push({
              kg: lifted, reps: ex.targetReps, rating,
              timestamp: nowMs + si * 180000 + breakdown.length * 1000,
            });
          }
          breakdown.push({
            exerciseId: ex.id,
            exerciseName: ex.name,
            engineName: ex.engineName, // EN canonical — DP/learnedVolume key on this
            sets: setRows,
            totalVolume: setRows.reduce((a, s) => a + s.kg * s.reps, 0),
            peakOneRM: Math.max(0, ...setRows.map((s) => s.kg * (1 + s.reps / 30))),
          });
          planRecord.exercises.push({
            engineName: ex.engineName, name: ex.name, sets: ex.sets,
            targetKg: ex.targetKg, targetReps: ex.targetReps, restSec: ex.restSec,
            trueWorkKg: round1(trueWorkKg),
          });
        }

        // ── PERSIST (logs + learnedVolume) + append sessionsHistory for next compose ──
        const energyTag =
          profile.trait === 'fatigued_week' ? 'red' : profile.trait === 'acwr_spike' ? 'green' : 'yellow';
        const summary = {
          title: plan.sessionType ?? 'Antrenament', meta: 'x', ts: nowMs,
          energyEmoji: energyTag, energy: energyTag, exercises: breakdown,
        };
        world.persistSessionLogs(summary, nowMs);
        const prev = world.useWorkoutStore.getState().sessionsHistory ?? [];
        world.useWorkoutStore.setState({ sessionsHistory: [...prev, summary] });

        sessions.push({ sessionNo, missed: false, plan: planRecord });
      }
    }

    perProfile.push({
      profile: {
        id: profile.id, trait: profile.trait, age: profile.age,
        goal: profile.goal, experience: profile.experience, emphasisPreset: profile.emphasisPreset,
      },
      sessions,
    });
  }
  return { cohort: perProfile };
}

/**
 * REAL-CLOCK ACWR full-path probe (the journey loop can't drive ACWR — see the
 * report's "couldn't drive headless"). readiness.js resolves readiness against the
 * WALL clock (db.tod() = new Date()), not the composer's injected date, so a
 * multi-day SIMULATED journey can never set a per-session readiness. Here we seed a
 * genuine acute:chronic volume SPIKE dated relative to the REAL now, set today's
 * readiness, and compose with `now = new Date()` so the full path resolves a real
 * readiness — then flip dp_acwr_readiness_v1 OFF→ON and confirm the penalty crosses
 * the band and CUTS the composed session volume. Returns the OFF/ON session totals.
 *
 * @returns {{ acwr:number, scoreOff:number|null, scoreOn:number|null,
 *             setsOff:number, setsOn:number, moved:boolean }}
 */
export async function acwrRealClockFullPath() {
  resetWorld();
  world.useOnboardingStore.setState({
    data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar',
      weight: 80, height: 178, focusPreset: 'balanced', focusPresetPickedAt: null },
    completed: true, completedAt: Date.now(),
  });
  const now = Date.now();
  const isod = (ms) => new Date(ms).toLocaleDateString('sv');
  const logs = [];
  // Small chronic base (28d) + a big acute spike (last 6d) → ACWR well above 1.5.
  for (let d = 28; d >= 8; d--) {
    const ts = now - d * MS_DAY;
    for (let s = 1; s <= 2; s++) logs.push({ ex: 'Lat Pulldown', w: 40, kg: 40, reps: '10', set: s, ts, session: ts, date: isod(ts) });
  }
  for (let d = 5; d >= 0; d--) {
    const ts = now - d * MS_DAY;
    for (let s = 1; s <= 8; s++) logs.push({ ex: 'Lat Pulldown', w: 90, kg: 90, reps: '10', set: s, ts, session: ts, date: isod(ts), rpe: 8.5 });
  }
  world.DB.set('logs', logs);
  world.DB.set('readiness', { [todReal()]: 3 });
  world.DB.set('kcals', { [isod(now - MS_DAY)]: 1700 });
  world.DB.set('prots', { [isod(now - MS_DAY)]: 150 });

  const acwr = computeACWR(logs, now);

  setPathAFlags(false);
  const scoreOff = getComputedReadinessScore(2000, 180);
  const planOff = await world.composePlannedWorkoutToday(new Date());

  setPathAFlags({ only: 'dp_acwr_readiness_v1' });
  const scoreOn = getComputedReadinessScore(2000, 180);
  const planOn = await world.composePlannedWorkoutToday(new Date());

  const totalSets = (p) => (p ? p.exercises.reduce((a, e) => a + e.sets, 0) : 0);
  const sig = (p) => (p ? p.exercises.map((e) => `${e.engineName}:${e.sets}:${e.targetKg}`).join('|') : 'null');
  return {
    acwr: acwr ? acwr.acwr : null,
    scoreOff, scoreOn,
    setsOff: totalSets(planOff), setsOn: totalSets(planOn),
    moved: sig(planOff) !== sig(planOn),
  };
}
