// ══ FULL-PATH-SIM — deterministic analysis (pure) ══════════════════════════
// Mirrors the calibration-sim metric vocabulary (crater / oscillation / stuckLow /
// absurd / convergence) but adapted to WHOLE-SESSION outputs: the composed plan's
// prescribed kg per exercise (path B fills it INSIDE the full path here) PLUS
// session-shape metrics the dp-direct sim could never see — set volume per session,
// estimated duration, exercise count, intensityMod ('minus') rate.
//
// Pure: takes the in-memory cohort ({ cohort: [{ profile, sessions }] }). No I/O.

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const median = (a) => {
  if (!a.length) return 0;
  const b = [...a].sort((x, y) => x - y);
  const m = b.length >> 1;
  return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};
const round = (x, n = 3) => {
  const f = 10 ** n;
  return Math.round(x * f) / f;
};

/**
 * CRATER (F-1 zero-tolerance class), measured on the FULL-PATH prescribed kg: a
 * load the user is CURRENTLY working re-prescribed at <25% of their recent reality.
 * Per-exercise rolling window of the loads the plan prescribed (the user lifts
 * them) — a collapse far below the current working load is the bug. ZERO required.
 */
export function craterViolations(data) {
  const WINDOW = 6;
  const craters = [];
  for (const c of data.cohort) {
    const series = {};
    for (const s of c.sessions) {
      if (s.missed || !s.plan) continue;
      for (const e of s.plan.exercises) {
        if (!Number.isFinite(e.targetKg)) continue;
        (series[e.engineName] = series[e.engineName] || []).push({ kg: e.targetKg, s: s.sessionNo });
      }
    }
    for (const [ex, pts] of Object.entries(series)) {
      const recent = [];
      for (const p of pts) {
        const currentWork = recent.length ? Math.max(...recent) : 0;
        if (currentWork > 0 && p.kg > 0 && p.kg < currentWork * 0.25) {
          craters.push({ id: c.profile.id, ex, currentWork: round(currentWork, 1), kg: p.kg, s: p.s });
        }
        if (p.kg > 0) {
          recent.push(p.kg);
          if (recent.length > WINDOW) recent.shift();
        }
      }
    }
  }
  return craters;
}

/**
 * Pure whole-session analysis over an in-memory cohort. Returns:
 *   - session: aggregate session-shape stats (count, sets, duration, deload rate)
 *   - load: per-exercise prescribed-kg quality (final signed err vs hidden cap)
 *   - failureFlags: oscillation / stuckLow / absurd (load), adapted to the seam
 *   - convergence: per profile×exercise, sessions until kg within ±band of cap
 */
export function analyzeFullPath(data) {
  const BAND = 0.12; // looser than dp-direct: the full path adds set-volume scaling

  // ── session-shape aggregates ──────────────────────────────────────────────
  const exCounts = [], durations = [], setTotals = [], volumes = [];
  let plannedSessions = 0, minusSessions = 0, emptySessions = 0;
  const traitCounts = {};
  for (const c of data.cohort) {
    for (const s of c.sessions) {
      if (s.missed || !s.plan) continue;
      plannedSessions += 1;
      traitCounts[c.profile.trait] = (traitCounts[c.profile.trait] || 0) + 1;
      exCounts.push(s.plan.exerciseCount);
      durations.push(s.plan.estimatedDuration);
      volumes.push(s.plan.volumeKg);
      const sets = s.plan.exercises.reduce((a, e) => a + e.sets, 0);
      setTotals.push(sets);
      if (s.plan.intensityMod === 'minus') minusSessions += 1;
      if (s.plan.exerciseCount === 0) emptySessions += 1;
    }
  }
  const session = {
    plannedSessions,
    emptySessions,
    meanExerciseCount: round(mean(exCounts), 2),
    meanSetTotal: round(mean(setTotals), 2),
    meanDurationMin: round(mean(durations), 1),
    meanVolumeKg: round(mean(volumes), 0),
    minusRatePct: round(plannedSessions ? (100 * minusSessions) / plannedSessions : 0, 1),
  };

  // ── per-exercise prescribed-load quality + failure flags ──────────────────
  const flags = { oscillation: [], stuckLow: [], stuckHigh: [], absurd: [] };
  const convRecords = [];
  for (const c of data.cohort) {
    const series = {};
    for (const s of c.sessions) {
      if (s.missed || !s.plan) continue;
      for (const e of s.plan.exercises) {
        if (!Number.isFinite(e.targetKg) || !Number.isFinite(e.trueWorkKg) || e.trueWorkKg <= 0) continue;
        (series[e.engineName] = series[e.engineName] || []).push({
          s: s.sessionNo, kg: e.targetKg, tw: e.trueWorkKg,
        });
      }
    }
    for (const [ex, pts] of Object.entries(series)) {
      if (pts.length < 5) continue;
      const kgs = pts.map((p) => p.kg);
      // oscillation — saw-tooth flips > 12% of the running value
      let flips = 0;
      for (let i = 2; i < pts.length; i++) {
        const a = kgs[i] - kgs[i - 1];
        const b = kgs[i - 1] - kgs[i - 2];
        if (a * b < 0 && Math.abs(a) / Math.max(1, kgs[i - 1]) > 0.12) flips++;
      }
      if (flips >= 4) flags.oscillation.push({ id: c.profile.id, ex, flips });
      const finalErr = (pts[pts.length - 1].kg - pts[pts.length - 1].tw) / pts[pts.length - 1].tw;
      if (finalErr < -0.2) flags.stuckLow.push({ id: c.profile.id, ex, finalErr: round(finalErr, 2) });
      if (finalErr > 0.2) flags.stuckHigh.push({ id: c.profile.id, ex, finalErr: round(finalErr, 2) });
      for (const p of pts) {
        if (p.tw > 0 && (p.kg > p.tw * 3 || p.kg < p.tw * 0.25)) {
          flags.absurd.push({ id: c.profile.id, ex, s: p.s, kg: p.kg, tw: round(p.tw, 1) });
          break;
        }
      }
      // convergence — first session from which kg stays within ±BAND of cap
      let conv = null;
      for (let i = 0; i < pts.length; i++) {
        const within = pts.slice(i).every((p) => Math.abs(p.kg - p.tw) / p.tw <= BAND);
        if (within && pts.length - i >= 3) { conv = pts[i].s; break; }
      }
      convRecords.push({
        id: c.profile.id, ex, converged: conv !== null,
        sessionsToConverge: conv, finalSignedErr: round(finalErr, 3),
      });
    }
  }
  const converged = convRecords.filter((r) => r.converged);
  const convergence = {
    totalSeries: convRecords.length,
    convergedPct: convRecords.length ? round((100 * converged.length) / convRecords.length, 1) : 0,
    medianSessionsToConverge: round(median(converged.map((r) => r.sessionsToConverge)), 1),
    meanFinalAbsErr: round(mean(convRecords.map((r) => Math.abs(r.finalSignedErr ?? 0))), 3),
  };

  return {
    session,
    convergence,
    failureFlags: {
      counts: Object.fromEntries(Object.entries(flags).map(([k, v]) => [k, v.length])),
      absurd: flags.absurd,
      stuckLow: flags.stuckLow,
    },
    traitCounts,
  };
}

/** Compact A/B delta report (OFF baseline → ON), the first real flip signal. */
export function diffAnalyses(off, on) {
  const dSess = (k) => round(on.session[k] - off.session[k], 3);
  return {
    session: {
      plannedSessions: { off: off.session.plannedSessions, on: on.session.plannedSessions },
      meanExerciseCount: { off: off.session.meanExerciseCount, on: on.session.meanExerciseCount, delta: dSess('meanExerciseCount') },
      meanSetTotal: { off: off.session.meanSetTotal, on: on.session.meanSetTotal, delta: dSess('meanSetTotal') },
      meanDurationMin: { off: off.session.meanDurationMin, on: on.session.meanDurationMin, delta: dSess('meanDurationMin') },
      meanVolumeKg: { off: off.session.meanVolumeKg, on: on.session.meanVolumeKg, delta: dSess('meanVolumeKg') },
      minusRatePct: { off: off.session.minusRatePct, on: on.session.minusRatePct, delta: dSess('minusRatePct') },
    },
    convergence: {
      convergedPct: { off: off.convergence.convergedPct, on: on.convergence.convergedPct },
      meanFinalAbsErr: { off: off.convergence.meanFinalAbsErr, on: on.convergence.meanFinalAbsErr },
    },
    failureFlags: {
      off: off.failureFlags.counts,
      on: on.failureFlags.counts,
    },
  };
}
