// ══ CALIBRATION-SIM — deterministic analysis (pure) ════════════════════════
// Ported from salafull/scripts/admin/_SIM_analyze.mjs. T1.3 refactor: pure
// analyzeCohort(cohort) → { convergence, failureFlags, systematicBias }, taking
// the in-memory cohort instead of reading _SIM_logs.json. No file I/O.

import { engine } from './sim-config.js';

const BAND = 0.1;

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const median = (a) => {
  if (!a.length) return 0;
  const b = [...a].sort((x, y) => x - y);
  const m = b.length >> 1;
  return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};
const round = (x, n = 2) => {
  const f = 10 ** n;
  return Math.round(x * f) / f;
};

const _META = {};
function meta(ex) {
  if (_META[ex]) return _META[ex];
  const m = engine.getExerciseMetadata(ex);
  _META[ex] = { muscle: m ? m.muscle_target_primary : 'unknown', equip: m ? m.equipment_type : 'unknown' };
  return _META[ex];
}

function push(map, key, val) {
  (map[key] = map[key] || []).push(val);
}

const summarize = (map) =>
  Object.fromEntries(
    Object.entries(map)
      .map(([k, v]) => [
        k,
        {
          n: v.length,
          meanSignedErr: round(mean(v), 3),
          medianSignedErr: round(median(v), 3),
          meanAbsErr: round(mean(v.map(Math.abs)), 3),
        },
      ])
      .sort((a, b) => Math.abs(b[1].meanSignedErr) - Math.abs(a[1].meanSignedErr)),
  );

/**
 * CRATER zero-tolerance detector (F-1 bug class). The exact F-1 failure was a
 * heavy lift the user is CURRENTLY working (e.g. a 140kg squat) re-prescribed at
 * the equipment FLOOR (5kg) — `recKg < currentWork * 0.25`. This MUST be ZERO.
 *
 * "currentWork" = the max load the user actually LIFTED over a recent rolling
 * window of this exercise's set-1 logs (the engine reads only the latest logs,
 * getLogs n=10). This tracks the user's CURRENT reality: a user who genuinely
 * settled to ~6kg over many sessions has no "crater" when prescribed 5kg, even
 * if they once did 24kg 40 sessions ago — the engine correctly tracks them down
 * (NOT a bug). Only a collapse far below what they're lifting RIGHT NOW is a
 * crater. Per the spec §0, oracle-relative `absurd`/`stuckLow` (conservative-vs-
 * aggressive-oracle gaps) are regression-band metrics, NOT this zero-tolerance
 * gate. RETURN DELOAD is the only legal sub-floor (dp.js:766) and is exempt.
 *
 * @returns {Array} list of { id, ex, currentWork, recKg, s } craters (empty = clean)
 */
export function craterViolations(data) {
  const RECENT_WINDOW = 8; // last ~8 set-1 logs define "current working reality"
  const craters = [];
  for (const c of data.cohort) {
    const series = {};
    for (const s of c.sessions) {
      if (s.missed) continue;
      for (const e of s.recLog) {
        if (e.set !== 1) continue; // plan target only
        (series[e.ex] = series[e.ex] || []).push({
          s: s.sessionIdx, recKg: e.recKg, status: e.status, enteredKg: e.enteredKg,
        });
      }
    }
    for (const [ex, pts] of Object.entries(series)) {
      const recent = []; // rolling window of recent ENTERED loads (current reality)
      for (const p of pts) {
        const currentWork = recent.length ? Math.max(...recent) : 0;
        if (currentWork > 0 && p.status !== 'RETURN DELOAD') {
          if (Number.isFinite(p.recKg) && p.recKg > 0 && p.recKg < currentWork * 0.25) {
            craters.push({ id: c.profile.id, ex, currentWork: Math.round(currentWork * 10) / 10, recKg: p.recKg, s: p.s });
          }
        }
        if (Number.isFinite(p.enteredKg) && p.enteredKg > 0) {
          recent.push(p.enteredKg);
          if (recent.length > RECENT_WINDOW) recent.shift();
        }
      }
    }
  }
  return craters;
}

/**
 * Pure analysis over an in-memory cohort ({ cohort: [{ profile, sessions }] }).
 * Returns convergence (overall), failureFlags (counts + detail), systematicBias.
 */
export function analyzeCohort(data) {
  const byEx = {}, byEquip = {}, byMuscle = {};

  for (const c of data.cohort) {
    for (const s of c.sessions) {
      if (s.missed) continue;
      for (const e of s.recLog) {
        if (e.set !== 1) continue;
        const tw = e.trueWorkingKgAtRecReps;
        if (!tw || tw <= 0) continue;
        const se = (e.recKg - tw) / tw;
        const m = meta(e.ex);
        push(byEx, e.ex, se);
        push(byEquip, m.equip, se);
        push(byMuscle, m.muscle, se);
      }
    }
  }

  // Convergence: per profile×exercise, sessions until rec within ±BAND and staying.
  const convRecords = [];
  for (const c of data.cohort) {
    const series = {};
    for (const s of c.sessions) {
      if (s.missed) continue;
      for (const e of s.recLog) {
        if (e.set !== 1) continue;
        (series[e.ex] = series[e.ex] || []).push({ s: s.sessionIdx, recKg: e.recKg, tw: e.trueWorkingKgAtRecReps });
      }
    }
    for (const [ex, pts] of Object.entries(series)) {
      if (pts.length < 5) continue;
      let conv = null;
      for (let i = 0; i < pts.length; i++) {
        const within = pts.slice(i).every((p) => p.tw > 0 && Math.abs(p.recKg - p.tw) / p.tw <= BAND);
        if (within && pts.length - i >= 3) {
          conv = pts[i].s;
          break;
        }
      }
      const last = pts[pts.length - 1];
      const finalErr = last.tw > 0 ? (last.recKg - last.tw) / last.tw : null;
      convRecords.push({
        id: c.profile.id, archetype: c.profile.archetype, ex, equip: meta(ex).equip,
        converged: conv !== null, sessionsToConverge: conv,
        finalSignedErr: finalErr == null ? null : round(finalErr, 3),
      });
    }
  }
  const convergedAll = convRecords.filter((r) => r.converged);
  const convOverall = {
    totalSeries: convRecords.length,
    convergedPct: convRecords.length ? round((100 * convergedAll.length) / convRecords.length, 1) : 0,
    medianSessionsToConverge: round(median(convergedAll.map((r) => r.sessionsToConverge)), 1),
    meanFinalAbsErr: round(mean(convRecords.map((r) => Math.abs(r.finalSignedErr ?? 0))), 3),
  };

  // Failure flags.
  const flags = { nonAdaptation: [], oscillation: [], stuckHigh: [], stuckLow: [], absurd: [] };
  for (const c of data.cohort) {
    const series = {};
    for (const s of c.sessions) {
      if (s.missed) continue;
      for (const e of s.recLog) {
        if (e.set !== 1) continue;
        (series[e.ex] = series[e.ex] || []).push({
          s: s.sessionIdx, recKg: e.recKg, tw: e.trueWorkingKgAtRecReps, entered: e.enteredKg, status: e.status,
        });
      }
    }
    for (const [ex, pts] of Object.entries(series)) {
      if (pts.length < 6) continue;
      const errs = pts.map((p) => (p.recKg - p.tw) / p.tw);
      const finalErr = errs[errs.length - 1];
      const recVals = pts.map((p) => p.recKg);
      const overrides = pts.filter((p) => p.entered > p.recKg * 1.15).length;
      const recRange = (Math.max(...recVals) - Math.min(...recVals)) / Math.max(1, recVals[0]);
      if (overrides >= pts.length * 0.6 && recRange < 0.1) {
        flags.nonAdaptation.push({ id: c.profile.id, ex });
      }
      let flips = 0;
      for (let i = 2; i < pts.length; i++) {
        const a = recVals[i] - recVals[i - 1];
        const b = recVals[i - 1] - recVals[i - 2];
        if (a * b < 0 && Math.abs(a) / Math.max(1, recVals[i - 1]) > 0.12) flips++;
      }
      if (flips >= 4) flags.oscillation.push({ id: c.profile.id, ex, flips });
      if (finalErr > 0.2) flags.stuckHigh.push({ id: c.profile.id, ex, finalSignedErr: round(finalErr, 2) });
      if (finalErr < -0.2) flags.stuckLow.push({ id: c.profile.id, ex, equip: meta(ex).equip, finalSignedErr: round(finalErr, 2) });
      for (const p of pts) {
        if (p.tw > 0 && (p.recKg > p.tw * 3 || p.recKg < p.tw * 0.25)) {
          flags.absurd.push({ id: c.profile.id, ex, s: p.s, recKg: p.recKg, trueWork: round(p.tw, 1) });
          break;
        }
      }
    }
  }

  return {
    convergence: { overall: convOverall },
    systematicBias: { byExercise: summarize(byEx), byEquipment: summarize(byEquip), byMuscle: summarize(byMuscle) },
    failureFlags: {
      counts: Object.fromEntries(Object.entries(flags).map(([k, v]) => [k, v.length])),
      stuckLow: flags.stuckLow,
      absurd: flags.absurd,
    },
    convRecords,
  };
}
