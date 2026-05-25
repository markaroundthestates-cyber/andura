// Coach Brain Eval — deterministic invariant checker (level 1).
//
// Per mandate: run on ALL scenarios, ZERO LLM, free + reproducible. Catches
// mechanical engine breakage instantly at 50k scale. Each invariant returns a
// list of violations; a violation = a REAL engine bug (or a deliberate edge
// the engine should still satisfy).
//
// Invariants (mandate-derived):
//   I1 corridor      floor <= ceiling for intensity corridor + every muscle volume corridor
//   I2 kcal floor    kcal-floor filter min == 1200; no sub-1200 obs survive into learning
//   I3 deload week4  weekInMesocycle === 4 (non-extension) => periodization DELOAD + deload SCHEDULED_LINEAR
//   I4 no NaN        zero NaN/undefined/Infinity in any numeric decision output
//   I5 monotonic     deeper deload state => depth_pct >= lighter; DELOAD phase volume <= non-DELOAD baseline
//   I6 safety        deload depth_pct in [0,100]; duration_weeks >= 0; pipeline did not hard-halt unexpectedly
//
// Some invariants are per-scenario (I1/I2/I3/I4/I6). I5 (monotonicity) compares
// across matched scenario pairs — handled in checkMonotonicity (batch-level).

const KCAL_FLOOR = 1200;

/** True if v is a finite number (rejects NaN/Infinity/undefined/null/non-number). */
function isFiniteNum(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

/** Recursively scan a value for NaN / Infinity / undefined in numeric slots. */
function scanBadNumbers(value, path, out) {
  if (value === undefined) {
    out.push(path.join('.') + ' = undefined');
    return;
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) out.push(path.join('.') + ' = NaN');
    else if (!Number.isFinite(value)) out.push(path.join('.') + ' = Infinity');
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => scanBadNumbers(v, [...path, String(i)], out));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) scanBadNumbers(v, [...path, k], out);
  }
}

/**
 * I1 — Corridor invariant: floor <= ceiling everywhere.
 * @returns {string[]} violation messages
 */
export function checkCorridor(decision) {
  const v = [];
  const d = decision.dimensions;
  const co = d.volume && d.volume.constraintObject;
  if (co) {
    const ic = co.intensity_pct_1rm;
    if (ic && isFiniteNum(ic.floor) && isFiniteNum(ic.ceiling) && ic.floor > ic.ceiling) {
      v.push(`intensity corridor floor ${ic.floor} > ceiling ${ic.ceiling}`);
    }
    const vpm = co.volume_per_muscle || {};
    for (const [m, band] of Object.entries(vpm)) {
      if (band && isFiniteNum(band.floor) && isFiniteNum(band.ceiling) && band.floor > band.ceiling) {
        v.push(`volume corridor[${m}] floor ${band.floor} > ceiling ${band.ceiling}`);
      }
    }
  }
  // Also the periodization-level intensity_target_pct {floor, ceiling}.
  const itp = d.volume && d.volume.intensityCorridor;
  if (itp && isFiniteNum(itp.floor) && isFiniteNum(itp.ceiling) && itp.floor > itp.ceiling) {
    v.push(`intensity_target_pct floor ${itp.floor} > ceiling ${itp.ceiling}`);
  }
  return v;
}

/**
 * I2 — Kcal floor invariant: filter min === 1200 and no surviving sub-floor obs.
 * Cross-checks the engine's reported floor + recomputes expected exclusions from
 * the scenario's raw observations.
 * @returns {string[]}
 */
export function checkKcalFloor(decision, scenario) {
  const v = [];
  const n = decision.dimensions.nutrition;
  if (!n) return v; // no nutrition dimension (cold-start) — nothing to assert
  if (n.kcalFloorMin != null && n.kcalFloorMin !== KCAL_FLOOR) {
    v.push(`kcal floor min = ${n.kcalFloorMin}, expected ${KCAL_FLOOR}`);
  }
  const obs = (scenario.userState.meta && scenario.userState.meta.observations) || [];
  const expectedExcluded = obs.filter((o) => isFiniteNum(o && o.kcalDaily) && o.kcalDaily < KCAL_FLOOR).length;
  if (n.kcalFloorExcluded != null && n.kcalFloorExcluded !== expectedExcluded) {
    v.push(`kcal floor excludedCount = ${n.kcalFloorExcluded}, expected ${expectedExcluded}`);
  }
  return v;
}

/**
 * I3 — Deload week-4 non-negotiable. When weekInMesocycle === 4 and no Marius
 * extension was granted, periodization phase MUST be DELOAD and the deload
 * engine MUST resolve a non-IDLE scheduled state.
 * @returns {string[]}
 */
export function checkDeloadWeek4(decision, scenario) {
  const v = [];
  const weeksElapsed = Number(scenario.userState.meta && scenario.userState.meta.weeksElapsed);
  if (!Number.isFinite(weeksElapsed)) return v;
  const weekInMeso = (weeksElapsed % 4) + 1;
  if (weekInMeso !== 4) return v;

  const d = decision.dimensions;
  const phase = d.volume && d.volume.phase;
  // Marius dual-signal extension can legitimately skip deload — detect via signal.
  const periodSignals = (decision.raw.periodization && decision.raw.periodization.ok && decision.raw.periodization.output.signals) || [];
  const extensionGranted = periodSignals.includes('marius_extension_granted_no_deload')
    || periodSignals.includes('marius_dual_signal_green');
  if (extensionGranted) return v; // legit skip

  if (phase !== 'DELOAD') {
    v.push(`week4 but periodization phase = ${phase} (expected DELOAD)`);
  }
  const deloadState = d.deload && d.deload.deloadState;
  if (deloadState === 'IDLE' || deloadState == null) {
    v.push(`week4 DELOAD but deload_state = ${deloadState} (expected scheduled/reactive non-IDLE)`);
  }
  return v;
}

/**
 * I4 — Zero NaN / Infinity / undefined across all numeric decision outputs.
 * @returns {string[]}
 */
export function checkNoBadNumbers(decision) {
  const out = [];
  scanBadNumbers(decision.dimensions, ['dimensions'], out);
  return out;
}

/**
 * I6 — Safety bounds + pipeline integrity. depth_pct in [0,100], duration >= 0,
 * and the pipeline must NOT hard-halt for a well-formed scenario (a halt here
 * means an engine rejected a valid input = bug).
 * @returns {string[]}
 */
export function checkSafetyBounds(decision) {
  const v = [];
  if (decision.haltedAt) {
    v.push(`pipeline hard-halted at "${decision.haltedAt}": ` +
      decision.pipelineErrors.map((e) => `${e.adapter}:${e.code}`).join(', '));
  }
  const dl = decision.dimensions.deload;
  if (dl) {
    if (dl.depthPct != null) {
      if (!isFiniteNum(dl.depthPct)) v.push(`deload depth_pct not finite: ${dl.depthPct}`);
      else if (dl.depthPct < 0 || dl.depthPct > 100) v.push(`deload depth_pct out of [0,100]: ${dl.depthPct}`);
    }
    if (dl.durationWeeks != null && isFiniteNum(dl.durationWeeks) && dl.durationWeeks < 0) {
      v.push(`deload duration_weeks negative: ${dl.durationWeeks}`);
    }
  }
  // Energy magnitude % sanity (engine adjustment should be a fraction/percent, not absurd).
  const en = decision.dimensions.energy;
  if (en && en.adjustmentMagnitudePct != null && isFiniteNum(en.adjustmentMagnitudePct)) {
    if (Math.abs(en.adjustmentMagnitudePct) > 100) {
      v.push(`energy adjustment magnitude implausible: ${en.adjustmentMagnitudePct}`);
    }
  }
  return v;
}

/**
 * Run all per-scenario invariants for one decision.
 * @returns {{ scenarioId:string, archetype:string, violations: Array<{invariant:string, detail:string}> }}
 */
export function checkScenario(scenario, decision) {
  const violations = [];
  const add = (invariant, msgs) => msgs.forEach((m) => violations.push({ invariant, detail: m }));
  add('I1_corridor', checkCorridor(decision));
  add('I2_kcal_floor', checkKcalFloor(decision, scenario));
  add('I3_deload_week4', checkDeloadWeek4(decision, scenario));
  add('I4_no_bad_numbers', checkNoBadNumbers(decision));
  add('I6_safety_bounds', checkSafetyBounds(decision));
  return { scenarioId: scenario.id, archetype: scenario.archetype, violations };
}

/**
 * I5 — Monotonicity (batch-level). Compares matched scenario pairs that differ
 * in ONE controlled dimension, asserting the engine response moves the expected
 * direction. Two checks:
 *   (a) Volume monotonic in deload: DELOAD-week phase volume sum <= same-archetype
 *       non-DELOAD week volume sum (more recovery => less volume).
 *   (b) Deload depth monotonic in severity: a scenario whose deload_state is a
 *       reactive (HIGH) state must have depth_pct >= a SCHEDULED_LINEAR one for
 *       the same archetype, when both present.
 *
 * @param {Array<{scenario:object, decision:object}>} runs
 * @returns {Array<{invariant:string, detail:string}>}
 */
export function checkMonotonicity(runs) {
  const v = [];
  // Group by archetype.
  const byArch = {};
  for (const r of runs) {
    const a = r.scenario.archetype;
    (byArch[a] = byArch[a] || []).push(r);
  }
  const volumeSum = (d) => {
    const vt = d.dimensions.volume && d.dimensions.volume.volumeTargetPct;
    if (!vt || typeof vt !== 'object') return null;
    let s = 0;
    for (const x of Object.values(vt)) if (isFiniteNum(x)) s += x;
    return s;
  };
  for (const [arch, list] of Object.entries(byArch)) {
    const deloadRuns = list.filter((r) => r.decision.dimensions.volume && r.decision.dimensions.volume.phase === 'DELOAD');
    const loadRuns = list.filter((r) => {
      const p = r.decision.dimensions.volume && r.decision.dimensions.volume.phase;
      return p && p !== 'DELOAD';
    });
    // (a) max deload-week volume should not exceed max load-week volume for arch.
    const deloadVols = deloadRuns.map((r) => volumeSum(r.decision)).filter((x) => x != null);
    const loadVols = loadRuns.map((r) => volumeSum(r.decision)).filter((x) => x != null);
    if (deloadVols.length && loadVols.length) {
      const maxDeload = Math.max(...deloadVols);
      const maxLoad = Math.max(...loadVols);
      // DELOAD volume = 0.55x baseline → must be <= load volume. Tolerance: allow
      // equality (defensive) but flag a strict increase.
      if (maxDeload > maxLoad + 1e-9) {
        v.push(`[${arch}] DELOAD-week max volume ${maxDeload} > LOAD-week max volume ${maxLoad} (recovery should reduce volume)`);
      }
    }
    // (b) reactive depth >= scheduled depth.
    const depthOf = (state) => {
      const cand = list
        .filter((r) => r.decision.dimensions.deload && r.decision.dimensions.deload.deloadState === state)
        .map((r) => r.decision.dimensions.deload.depthPct)
        .filter((x) => isFiniteNum(x));
      return cand.length ? Math.max(...cand) : null;
    };
    const scheduled = depthOf('SCHEDULED_LINEAR');
    const reactiveComposite = depthOf('REACTIVE_COMPOSITE');
    if (scheduled != null && reactiveComposite != null && reactiveComposite < scheduled - 1e-9) {
      v.push(`[${arch}] REACTIVE_COMPOSITE depth ${reactiveComposite} < SCHEDULED_LINEAR depth ${scheduled} (reactive should be >= scheduled)`);
    }
  }
  return v.map((detail) => ({ invariant: 'I5_monotonicity', detail }));
}

/**
 * Aggregate invariant run over a batch of runs.
 * @param {Array<{scenario:object, decision:object}>} runs
 */
export function runInvariants(runs) {
  const perScenario = runs.map((r) => checkScenario(r.scenario, r.decision));
  const monotonic = checkMonotonicity(runs);

  // Tally by invariant code.
  const byInvariant = {};
  let totalViolations = 0;
  const violatingScenarios = [];
  for (const s of perScenario) {
    if (s.violations.length) {
      violatingScenarios.push(s);
      totalViolations += s.violations.length;
      for (const vio of s.violations) {
        byInvariant[vio.invariant] = (byInvariant[vio.invariant] || 0) + 1;
      }
    }
  }
  for (const m of monotonic) {
    totalViolations += 1;
    byInvariant[m.invariant] = (byInvariant[m.invariant] || 0) + 1;
  }

  return {
    totalScenarios: runs.length,
    totalViolations,
    byInvariant,
    violatingScenarios,
    monotonicViolations: monotonic,
  };
}

export { KCAL_FLOOR, isFiniteNum };
