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
import { DEV_FLAGS_KEY } from '../../../src/util/featureFlags.js';
import { learnFatigueCurve, saveFatigueCurve } from '../../../src/engine/dp/fatigueCurve.js';

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

// ── F6a wired-flag full-path probes (was-dark → now alive) ─────────────────────
// These three flags ride the deload-set seam, NOT the readiness/energy-score seam
// the journey cohort drives — so (like ACWR) they get a targeted real-clock probe
// that builds the precise trait, flips OFF→ON, and shows the COMPOSED stream move.

/** Write a single dev-flag override (any flag id), the resolution-order step-1 the
 *  real featureFlags.isEnabled honors first. Empty/false clears (baseline). */
function setFlag(flagId) {
  if (!flagId) { try { localStorage.removeItem(DEV_FLAGS_KEY); } catch { /* */ } return; }
  try { localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify({ [flagId]: true })); } catch { /* */ }
}
const _isod = (ms) => new Date(ms).toLocaleDateString('sv');
const _sig = (p) => (p ? p.exercises.map((e) => `${e.engineName}:${e.sets}:${e.targetKg}`).join('|') : 'null');
const _sets = (p) => (p ? p.exercises.reduce((a, e) => a + e.sets, 0) : 0);

function _seedOnboarding(extra = {}) {
  world.useOnboardingStore.setState({
    data: {
      age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar',
      weight: 80, height: 178, focusPreset: 'balanced', focusPresetPickedAt: null, ...extra,
    },
    completed: true, completedAt: Date.now() - 200 * MS_DAY,
  });
}

/**
 * #20 dp_fatigue_curve_v1 — a per-user CRASHER (reps collapse early at fixed load)
 * earns -1 working set through distributeGroupSets. Seed a crasher log history,
 * run the REAL finish-time learner (gated ON) to populate dp-fatigue-curve, then
 * compose with the flag OFF vs ON: ON drops the crasher's set count (clamped ≥1).
 * @returns {{setsOff:number,setsOn:number,moved:boolean,curveKeys:number}}
 */
export async function fatigueCurveFullPath() {
  resetWorld();
  _seedOnboarding();
  const now = Date.now();
  // Two learned curves on exercises a freq-4 push/upper day surfaces ABOVE their
  // band floor (so the ±1 is VISIBLE, not absorbed by the clamp):
  //   - DB Shoulder Press = CRASHER (reps crash by set 2: 10→4 → dropIndex 2 → -1).
  //     It composes at the compound ceiling (5) → -1 makes it 4.
  //   - Pec Deck / Cable Fly = MAINTAINER (reps held flat: 10→10 → never drops →
  //     dropIndex = sets+1 → +1). It composes at the isolation floor (2) → +1 → 3.
  // 6 fixed-load sessions > FATIGUE_MIN_SESSIONS so the curve is trusted.
  const CRASHER = 'DB Shoulder Press';
  const MAINTAINER = 'Pec Deck / Cable Fly';
  const logs = [];
  for (let d = 42; d >= 2; d -= 7) {
    const ts = now - d * MS_DAY;
    [10, 4, 4, 4].forEach((reps, i) => {
      logs.push({ ex: CRASHER, w: 20, kg: 20, reps: String(reps), set: i + 1, ts: ts + i * 1000, session: ts, date: _isod(ts), rpe: 7.5 });
    });
    [10, 10, 10, 10].forEach((reps, i) => {
      logs.push({ ex: MAINTAINER, w: 30, kg: 30, reps: String(reps), set: i + 1, ts: ts + 10000 + i * 1000, session: ts, date: _isod(ts), rpe: 7.5 });
    });
  }
  world.DB.set('logs', logs);

  // Compose OFF first (no curve consumed → population set counts).
  setFlag(null);
  const planOff = await world.composePlannedWorkoutToday(new Date());

  // Learn the curve at "finish time" with the flag ON (the real persist path runs
  // learnFatigueCurve only when gated). Persist into dp-fatigue-curve.
  setFlag('dp_fatigue_curve_v1');
  const learned = learnFatigueCurve(logs);
  saveFatigueCurve(learned);
  const planOn = await world.composePlannedWorkoutToday(new Date());

  // Per-exercise set count by EN name (proof the ±1 landed on the right exercise).
  const byName = (p) => {
    const m = {};
    if (p) for (const e of p.exercises) m[e.engineName] = e.sets;
    return m;
  };
  const off = byName(planOff);
  const on = byName(planOn);
  return {
    setsOff: _sets(planOff),
    setsOn: _sets(planOn),
    moved: _sig(planOff) !== _sig(planOn),
    curveKeys: Object.keys(learned).length,
    crasherOff: off[CRASHER] ?? null,
    crasherOn: on[CRASHER] ?? null,
    maintainerOff: off[MAINTAINER] ?? null,
    maintainerOn: on[MAINTAINER] ?? null,
  };
}

/**
 * #26 dp_subrecovery_drift_v1 — an EARLY systemic under-recovery (greu-share rising
 * at a fixed working load across ≥2 muscle groups) pre-empts a deload: the drift
 * candidate feeds the AA trigger (meta.aaMarkerDirectActive) → REACTIVE_AA deload →
 * intensityMod 'minus' through the full compose seam. OFF → no candidate → 'normal'.
 * @returns {{intensityModOff:string,intensityModOn:string,moved:boolean,setsOff:number,setsOn:number}}
 */
export async function subRecoveryDriftFullPath() {
  resetWorld();
  _seedOnboarding();
  const now = Date.now();
  // Same fixed working load (60kg, 10 reps held) on exercises spanning ≥2 muscle
  // groups (back + legs), with the greu rating SHARE rising across the window
  // (early sets potrivit, later sets greu) → rating-drift slope > 0, reps held.
  const exs = ['Lat Pulldown', 'Cable Row', 'Leg Press', 'Leg Extension'];
  const logs = [];
  const N = 8;
  for (const ex of exs) {
    for (let i = N - 1; i >= 0; i--) {
      // newest-first persisted; older = potrivit (7.5), newer = greu (8.5) → rising.
      const ts = now - i * 3 * MS_DAY;
      const rpe = i <= 3 ? 8.5 : 7.5; // last 4 sessions drift to greu at flat load
      logs.push({ ex, w: 60, kg: 60, reps: '10', set: 1, ts, session: ts, date: _isod(ts), rpe });
    }
  }
  world.DB.set('logs', logs);

  setFlag(null);
  const planOff = await world.composePlannedWorkoutToday(new Date());
  setFlag('dp_subrecovery_drift_v1');
  const planOn = await world.composePlannedWorkoutToday(new Date());

  return {
    intensityModOff: planOff ? planOff.intensityMod : 'null',
    intensityModOn: planOn ? planOn.intensityMod : 'null',
    moved: _sig(planOff) !== _sig(planOn),
    setsOff: _sets(planOff),
    setsOn: _sets(planOn),
  };
}

/**
 * #32 dp_dip_classifier_v1 — a LIFE_DIP (low accumulated volume + bad-sleep week +
 * a sustained energy-down pattern that WOULD trigger a reactive deload) is the
 * lifestyle cause, NOT training fatigue → the classifier SUPPRESSES the reactive
 * deload (meta.suppressReactiveDeload). OFF → the energy-down-sustained AA deload
 * fires (intensityMod 'minus'); ON → suppressed (intensityMod 'normal'). The proof
 * is the SUPPRESSION direction: ON removes a deload OFF produced.
 * @returns {{intensityModOff:string,intensityModOn:string,suppressed:boolean,acwr:number|null}}
 */
export async function dipClassifierFullPath() {
  resetWorld();
  _seedOnboarding();
  const now = Date.now();
  // FLAT, EVEN low-volume history over 28d (NO acute spike → ACWR ~1.0 ≤ 1.2 →
  // volumeNotHigh, NOT fatigue) on a SINGLE exercise/group (so drift is NOT
  // systemic → the LIFE_DIP gate requires !driftSystemic). Light loads, reps held,
  // no rating drift. The 4 most-recent sessions carry a 'sleep' note → fatigue.js
  // sleepBad >= 2 (the LIFESTYLE source). One session every 2 days, identical load,
  // so the acute(7d) and chronic(28d) windows match → ACWR ~1.0.
  const logs = [];
  for (let d = 28; d >= 0; d -= 2) {
    const ts = now - d * MS_DAY;
    const recent = d <= 7; // last 4 sessions → lifestyle sleep markers
    logs.push({
      ex: 'Lat Pulldown', w: 40, kg: 40, reps: '10', set: 1, ts, session: ts,
      date: _isod(ts), rpe: 7.5, ...(recent ? { notes: ['sleep'] } : {}),
    });
  }
  world.DB.set('logs', logs);
  const acwr = computeACWR(logs, now);

  // A sustained energy-DOWN pattern (3 red sessions) → isEnergyDownSustained → the
  // reactive-AA deload the LIFE_DIP must suppress. recentSessions come from
  // sessionsHistory (newest-tail); energyEmoji 'red' → energyDirection DOWN.
  const history = [];
  for (let k = 2; k >= 0; k--) {
    const ts = now - k * MS_DAY;
    history.push({ title: 'Antrenament', meta: 'x', ts, energyEmoji: 'red', energy: 'red', exercises: [] });
  }
  world.useWorkoutStore.setState({ sessionsHistory: history });

  setFlag(null);
  const planOff = await world.composePlannedWorkoutToday(new Date());
  setFlag('dp_dip_classifier_v1');
  const planOn = await world.composePlannedWorkoutToday(new Date());

  return {
    intensityModOff: planOff ? planOff.intensityMod : 'null',
    intensityModOn: planOn ? planOn.intensityMod : 'null',
    suppressed: !!(planOff && planOn && planOff.intensityMod === 'minus' && planOn.intensityMod === 'normal'),
    acwr: acwr ? acwr.acwr : null,
  };
}
