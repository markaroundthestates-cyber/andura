// ══ CALIBRATION-SIM — main run: drive the REAL adaptation pipeline ═════════
// Ported from salafull/scripts/admin/_SIM_run.mjs. T1.2 refactor: runCohort()
// RETURNS the cohort object instead of writeFileSync, and the engine surface is
// the relative-imported prod modules (via sim-config `engine`). Deterministic:
// mulberry32 seeded per profile + fixed COHORT_START → no clock leak.

import { engine, resetStore, N_PROFILES, SEED } from './sim-config.js';
import { buildCohort, trueCapAt } from './sim-profiles.js';
import { chooseSet, sessionMess, sessionDayFactor, rng } from './sim-behavior.js';

const EXP_TO_EN = { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' };
const MS_DAY = 86400000;
const COHORT_START = Date.UTC(2026, 0, 5);
const round1 = (x) => Math.round(x * 10) / 10;

function recommendFor(E, profile, ex, sessionIdx, priorExercises, nowMs, lastSessionRating) {
  const hasHistory = E.DP.getLogs(ex, 1).length > 0;
  const rec = E.DP.getSmartRecommendation(ex, null, null, nowMs, lastSessionRating || null, priorExercises);
  const targetReps = rec && typeof rec.repsTarget === 'number' ? rec.repsTarget : 10;
  let kg, source;
  if (hasHistory && rec && typeof rec.kg === 'number') {
    kg = rec.kg;
    source = 'history';
  } else {
    const csProfile = { bodyweightKg: profile.bodyweightKg, sex: profile.sex };
    const raw = E.suggestStartWeight(ex, EXP_TO_EN[profile.experience], csProfile);
    kg = E.roundToEquipmentWeight(raw, ex);
    source = 'coldstart';
  }
  return {
    kg, repsTarget: targetReps,
    status: rec ? rec.status : 'INIT',
    source,
  };
}

/**
 * Run the deterministic cohort against the REAL engine and RETURN the cohort
 * object (no file write). nProfiles defaults to the full N_PROFILES; tests may
 * pass a smaller count for speed (the determinism + invariants hold at any N).
 */
export function runCohort(nProfiles = N_PROFILES, seed = SEED) {
  const E = engine;
  const cohort = buildCohort(nProfiles, seed);
  const perProfile = [];

  for (const profile of cohort) {
    resetStore();
    const r = rng(profile._seed);
    const sessions = [];
    const nSessionsThis = profile.sessionCount;
    let calendarDay = 0;
    let lastTrainedDay = null;
    let lastSessionRating = null;
    const behaviorMem = {};

    for (let s = 0; s < nSessionsThis; s++) {
      const day = profile.rotation[s % profile.rotation.length];
      const mess = sessionMess(profile, s, r);
      if (mess.missed) {
        calendarDay += 2;
        sessions.push({ sessionIdx: s, missed: true, exercises: [] });
        continue;
      }
      calendarDay += s === 0 ? 0 : 1 + (r() < 0.4 ? 1 : 0);
      const nowMs = COHORT_START + calendarDay * MS_DAY;
      const gapDays = lastTrainedDay == null ? null : calendarDay - lastTrainedDay;

      const sessionExercises = [];
      const recLog = [];
      const prior = [];
      sessionDayFactor(profile, behaviorMem, r);

      for (const ex of day) {
        if (r() < mess.skipP) {
          recLog.push({ ex, skipped: true });
          continue;
        }
        const nSets = E.EX_SETS[ex] || 3;
        const trueCapBase = trueCapAt(profile, ex, s);
        if (trueCapBase == null) continue;
        let capNow = trueCapBase;
        if (mess.offDay) capNow *= 0.88;
        if (mess.deload) capNow *= 0.85;

        const setBreakdown = [];
        const setRecs = [];
        const rec0 = recommendFor(E, profile, ex, s, prior, nowMs, lastSessionRating);
        const recentRPEs = [];
        const recentReps = [];

        for (let si = 0; si < nSets; si++) {
          const setRec = setRecs.length === 0 ? rec0 : setRecs[setRecs.length - 1];
          const chosen = chooseSet(profile, setRec, capNow, r, si, behaviorMem, ex);
          const ts = nowMs + si * 180000 + day.indexOf(ex) * 1000;
          setBreakdown.push({ kg: chosen.kg, reps: chosen.reps, rating: chosen.rating, timestamp: ts });
          const rpe = chosen.rating === 'greu' ? 8.5 : chosen.rating === 'potrivit' ? 7.5 : 6.5;
          recentRPEs.push(rpe);
          recentReps.push(chosen.reps);

          const adj = E.DP.checkInSessionAdjust(ex, recentRPEs, recentReps, {
            recKg: setRec.kg, recReps: setRec.repsTarget, loggedKg: chosen.kg,
            setIdx: si + 1, nowMs,
          });
          const nextRec = { ...setRec };
          if (adj && adj.adjust) {
            if (typeof adj.newKg === 'number') nextRec.kg = adj.newKg;
            if (typeof adj.newReps === 'number') nextRec.repsTarget = adj.newReps;
            if (typeof adj.holdKg === 'number') nextRec.kg = adj.holdKg;
          }
          setRecs.push(nextRec);

          recLog.push({
            ex, set: si + 1, source: rec0.source, status: rec0.status,
            recKg: setRec.kg, recReps: setRec.repsTarget,
            enteredKg: chosen.kg, enteredReps: chosen.reps, rating: chosen.rating,
            trueCap: round1(capNow),
            trueWorkingKgAtRecReps: round1((capNow * (1 + 10 / 30)) / (1 + setRec.repsTarget / 30)),
          });
        }

        sessionExercises.push({ exerciseName: ex, engineName: ex, sets: setBreakdown });
        prior.push({ name: ex, sets: nSets });
      }

      const summary = { ts: nowMs, exercises: sessionExercises };
      E.persistSessionLogs(summary, nowMs);

      let nSetsTotal = 0, hardSets = 0, easySets = 0;
      for (const e of recLog) {
        if (e.skipped || !e.enteredKg) continue;
        nSetsTotal++;
        if (e.rating === 'greu') hardSets++;
        if (e.rating === 'usor') easySets++;
      }
      const hardFrac = nSetsTotal ? hardSets / nSetsTotal : 0;
      lastSessionRating = hardFrac >= 0.5 ? 'grea' : easySets / Math.max(1, nSetsTotal) >= 0.5 ? 'usoara' : 'ok';
      lastTrainedDay = calendarDay;

      sessions.push({
        sessionIdx: s, missed: false, offDay: mess.offDay, deload: mess.deload,
        calendarDay, gapDays, sessionRating: lastSessionRating, recLog,
      });
    }

    perProfile.push({
      profile: {
        id: profile.id, archetype: profile.archetype, experience: profile.experience,
      },
      sessions,
    });
  }

  return { cohort: perProfile };
}
