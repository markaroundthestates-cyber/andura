// ══ CALIBRATION-SIM — synthetic per-set behavior model ═════════════════════
// Ported verbatim from salafull/scripts/admin/_SIM_behavior.mjs (relative import).
// Given Andura's recommendation + the user's hidden true capacity, decide what
// the user actually does and how they rate it (usor/potrivit/greu).

import { rng, gauss, clamp } from './sim-config.js';

const REF_REPS = 10;
const oneRMEquiv = (w, reps) => w * (1 + reps / 30);
export function trueMaxFromCap(trueCap) {
  return oneRMEquiv(trueCap, REF_REPS);
}

function rateSet(kg, reps, trueMax, r) {
  const lf = oneRMEquiv(kg, reps) / trueMax;
  const jit = gauss(r, 0, 0.02);
  const x = lf + jit;
  if (x >= 0.95) return 'greu';
  if (x >= 0.8) return 'potrivit';
  return 'usor';
}

function doableKgFor(trueCap, reps) {
  return (trueCap * (1 + REF_REPS / 30)) / (1 + reps / 30);
}

const ARCH = {
  trusts_coach: { settle: 0.75, setSd: 0.03 },
  consistent: { settle: 0.8, setSd: 0.03 },
  ego_lifter: { settle: 0.55, setSd: 0.05 },
  timid: { settle: 0.6, setSd: 0.05 },
  erratic: { settle: 0.25, setSd: 0.1 },
};

export function sessionDayFactor(profile, memory, r) {
  const prev = memory._day ?? 1.0;
  const sd = profile.setNoise;
  const next = clamp(0.4 * prev + 0.6 * gauss(r, 1.0, sd), 1 - 2.2 * sd, 1 + 2.2 * sd);
  memory._day = next;
  return next;
}

export function chooseSet(profile, rec, trueCapNow, r, setIdx, memory, ex) {
  const recKg = Number(rec.kg) || 0;
  const recReps = Number(rec.repsTarget) || 10;
  const natural = doableKgFor(trueCapNow, recReps);
  const arch = profile.archetype;
  const tune = ARCH[arch] || ARCH.consistent;
  const mem = memory || {};

  let intended;
  if (arch === 'trusts_coach') {
    const ratio = recKg > 0 ? natural / recKg : 1;
    if (ratio > 1.4) intended = recKg * 1.2;
    else if (ratio < 0.7) intended = recKg * 0.82;
    else intended = recKg;
  } else if (arch === 'consistent') {
    intended = natural;
  } else if (arch === 'ego_lifter') {
    intended = Math.max(recKg, natural * 1.08);
  } else if (arch === 'timid') {
    intended = Math.min(recKg, natural) * 0.84;
  } else {
    intended = natural * clamp(gauss(r, 1.0, 0.18), 0.6, 1.45);
  }
  intended = Math.max(1, intended);

  if (setIdx === 0) {
    const a = mem[ex];
    mem[ex] = a == null ? intended : a + (1 - tune.settle) * (intended - a);
  }
  let chosenKg = mem[ex] != null ? mem[ex] : intended;

  const dayF = mem._day ?? 1.0;
  chosenKg *= dayF;
  chosenKg *= clamp(gauss(r, 1.0, tune.setSd), 1 - 3 * tune.setSd, 1 + 3 * tune.setSd);
  if (setIdx >= 2) chosenKg *= clamp(gauss(r, 0.97, 0.015), 0.92, 1.0);
  chosenKg = Math.max(1, chosenKg);

  const capToday = trueCapNow * dayF;
  const trueMaxToday = trueMaxFromCap(capToday);

  const doableAtRec = doableKgFor(capToday, recReps);
  let reps = recReps;
  if (chosenKg > doableAtRec) {
    const over = chosenKg / doableAtRec - 1;
    reps = Math.max(2, Math.round(recReps - over * 18));
  } else if (chosenKg < doableAtRec * 0.92) {
    const under = 1 - chosenKg / doableAtRec;
    reps = Math.round(recReps + under * 10);
  }
  reps = clamp(reps, 2, 30);

  const rating = rateSet(chosenKg, reps, trueMaxToday, r);
  return { kg: round1(chosenKg), reps, rating };
}

export function sessionMess(profile, sessionIdx, r) {
  const arch = profile.archetype;
  const missP = arch === 'erratic' ? 0.18 : arch === 'consistent' ? 0.02 : 0.07;
  const skipP = arch === 'erratic' ? 0.15 : 0.05;
  const offP = 0.08;
  const deloadEvery = arch === 'consistent' ? 8 : arch === 'ego_lifter' ? 14 : 11;
  return {
    missed: r() < missP,
    skipP,
    offDay: r() < offP,
    deload: sessionIdx > 0 && sessionIdx % deloadEvery === 0,
  };
}

const round1 = (x) => Math.round(x * 10) / 10;
export { rng };
