// ══ DP ENGINE — Double Progression ══════════════════════════
import { DB } from '../db.js';
import { COMPOUND_EX, EX_SETS, EX_REPS as _EX_REPS, TARGET_DATE } from '../constants.js';
import { roundToEquipmentWeight, getPrevWeight } from '../config/weights.js';
import { SIMILAR_EXERCISES, getSimilarityMultiplier } from './exerciseMapping.js';
import { now as clockNow } from './clock.js';
import { suggestStartWeight } from './coldStartGuidelines.js';

export const DP = {
  // Rep ranges per exercise
  REP_RANGES: {
    'DB Shoulder Press':[6,10],'Incline DB Press':[6,10],'Flat DB Press':[8,12],
    'Lat Pulldown':[8,12],'Cable Row':[8,12],'Chest-Supported Row':[10,12],
    'Romanian Deadlift':[8,12],'Leg Press':[15,20],
    'Lateral Raises':[12,15],'Rear Delt Fly':[12,15],'Face Pulls':[15,20],
    'Incline DB Curl':[10,12],'Bayesian Curl':[10,12],'Cable Curl':[10,12],
    'Preacher Curl':[10,12],'Overhead Triceps':[10,12],'Pushdown':[10,12],
    'Pec Deck / Cable Fly':[12,15],'Leg Curl':[15,20],'Leg Extension':[15,20],
    'Calf Raises':[15,20]
  },

  // Weight steps per equipment type
  // Helcometre (weight stack cu placi de 4kg): Lat Pulldown, Cable Row, Face Pulls, etc.
  // Cabluri izolatie (stack mai fin, 2.5kg): Lateral Raises cable, Bayesian, Cable Curl, Pushdown, Overhead, Pec Deck
  // Gantere (DB): 2kg step (set de gantere standard: 10-12-14-16-18-20...)
  // Legs (Leg Press, Leg Curl, Leg Extension): 5kg step
  WEIGHT_STEPS: {
    // Helcometre — stack din 4 in 4 kg
    'Lat Pulldown': 4, 'Cable Row': 4, 'Chest-Supported Row': 4,
    'Face Pulls': 2.5,
    // Cabluri izolatie — stack mai fin
    'Lateral Raises (cable)': 2.5, 'Rear Delt Cable': 2.5,
    'Bayesian Curl': 2, 'Cable Curl': 2.5,
    'Overhead Triceps': 2.5, 'Pushdown': 2.5,
    'Pec Deck / Cable Fly': 2.5, 'Cable Fly': 2.5,
    // Gantere — seturi standard din 2 in 2
    'Lateral Raises': 2,
    'Rear Delt Fly': 2,
    'Incline DB Curl': 2, 'Hammer Curl': 2,
    'Preacher Curl': 2,
    'DB Shoulder Press': 2, 'Incline DB Press': 2, 'Flat DB Press': 2,
    // Picioare — placi mari
    'Leg Press': 5, 'Leg Curl': 5, 'Leg Extension': 5, 'Romanian Deadlift': 2.5,
    'Calf Raises': 5,
  },

  // Rotunjeste greutatea la cea mai apropiata valoare din lista reala a echipamentului
  /**
   * @param {number} kg
   * @param {string} ex
   */
  roundToStep(kg, ex) {
    return roundToEquipmentWeight(kg, ex);
  },

  // Microload increments (o treapta pe echipamentul respectiv)
  MICRO: {
    compound: 2.5, isolation: 1.0, legs: 2.5
  },

  // Max sensible weights per exercise — calibrat pe nivelul real al utilizatorului
  // Daniel: Lat Pulldown 64, Cable Row 72, Incline DB 30, Lateral Raises 10, Bayesian 18
  MAX_KG: {
    // Izolatie umeri — cap real ~16-18kg/gantera pentru lateral raises
    'Lateral Raises': 18,
    'Lateral Raises (cable)': 25, // cablu = greutate mai mare posibil
    'Rear Delt Fly': 16,
    'Face Pulls': 55, // cablu, poate creste mai mult
    // Izolatie biceps
    'Incline DB Curl': 18, // per gantera
    'Hammer Curl': 28, // per gantera — Daniel face 20-22kg
    'Bayesian Curl': 25,
    'Cable Curl': 35,
    'Preacher Curl': 30,
    // Triceps
    'Overhead Triceps': 55,
    'Pushdown': 55,
    // Piept izolatie
    'Pec Deck / Cable Fly': 60,
    // Picioare — Leg Press are mult loc
    'Leg Press': 400, 'Leg Curl': 160, 'Leg Extension': 160, 'Calf Raises': 200,
  },

  // How many kg before we stop adding weight and switch to reps/volume
  WEIGHT_CAP_STRATEGY: {
    // isolation: after cap → add reps first, then volume, NOT weight
    'Lateral Raises': 'reps', 'Lateral Raises (cable)': 'reps',
    'Rear Delt Fly': 'reps', 'Face Pulls': 'reps',
    'Incline DB Curl': 'reps', 'Bayesian Curl': 'reps', 'Hammer Curl': 'reps',
    'Cable Curl': 'reps', 'Preacher Curl': 'reps',
    'Overhead Triceps': 'reps', 'Pushdown': 'reps',
  },

  // In CUT: isolation exercises with rMax in 11-15 range cap at 10 reps.
  // Covers 10-12 and 12-15 ranges (Lateral Raises, Rear Delt Fly, etc.).
  // High-rep leg exercises (15-20) are intentionally excluded.
  /**
   * @param {string} ex
   * @param {boolean} isInCut
   */
  getPhaseAwareRepRange(ex, isInCut) {
    const ranges = /** @type {Record<string, number[]>} */ (this.REP_RANGES);
    const range = ranges[ex] || [8, 12];
    if (!isInCut) return range;
    const [rMin, rMax] = range;
    if (rMax != null && rMax > 10 && rMax <= 15 && !COMPOUND_EX.includes(ex)) return [Math.min(rMin ?? 8, 10), 10];
    return range;
  },

  /** @param {string} ex */
  getIncrement(ex) {
    // Incrementul = 1 treapta pe echipamentul exercitiului
    const steps = /** @type {Record<string, number>} */ (this.WEIGHT_STEPS);
    return steps[ex] || (COMPOUND_EX.includes(ex) ? 2.5 : 2.5);
  },

  // Get last N logs for exercise
  /**
   * @param {string} ex
   * @param {number} [n]
   */
  getLogs(ex, n=10) {
    /** @type {Array<{ex?: string, w?: number, reps?: number | string, rpe?: number}>} */
    const logs = /** @type {any} */ (DB.get('logs')) || [];
    return logs.filter((l) => l.ex === ex && l.w).slice(0, n);
  },

  // Get progression state for exercise
  /** @param {string} ex */
  getState(ex) {
    const logs = this.getLogs(ex, 6);
    if (!logs.length) return {
      stage: 'INIT', level: 0, logs: [],
      lastW: 0, lastReps: 8, lastRPE: 7,
      isStagnant: false, atTopReps: false,
      range: [8, 12], rMin: 8, rMax: 12,
      currentSets: 3, extraSets: 0,
    };

    const ranges = /** @type {Record<string, number[]>} */ (this.REP_RANGES);
    const range = ranges[ex] || [8,12];
    const [rMin, rMax] = range;
    const lastLog = logs[0];
    if (!lastLog) return {
      stage: 'INIT', level: 0, logs: [],
      lastW: 0, lastReps: 8, lastRPE: 7,
      isStagnant: false, atTopReps: false,
      range: [8, 12], rMin: 8, rMax: 12,
      currentSets: 3, extraSets: 0,
    };
    const lastW = lastLog.w ?? 0;
    const lastReps = typeof lastLog.reps === 'string' ? parseInt(lastLog.reps) : (lastLog.reps ?? (rMin ?? 8));
    const lastRPE = lastLog.rpe || 7;

    // Check stagnation (same weight last 3+ sessions)
    const last3W = logs.slice(0,3).map((l) => l.w);
    const isStagnant = last3W.length >= 3 && last3W.every(w => w === last3W[0]);

    // Check if at top of rep range consistently
    const last3Reps = logs.slice(0,3).map((l) => typeof l.reps === 'string' ? (parseInt(l.reps) || (rMin ?? 8)) : (l.reps ?? (rMin ?? 8)));
    const atTopReps = last3Reps.every((r) => r >= (rMax ?? 12));

    // How many sets at +1 volume
    const exSets = /** @type {Record<string, number>} */ (EX_SETS);
    const currentSets = exSets[ex] || 3;
    const extraSets = /** @type {number} */ (DB.get(`ex-extra-sets-${ex}`)) || 0;

    return {
      lastW, lastReps, lastRPE, isStagnant, atTopReps,
      range, rMin: rMin ?? 8, rMax: rMax ?? 12, currentSets, extraSets,
      logs
    };
  },

  // MAIN RECOMMENDATION FUNCTION
  /** @param {string} ex */
  recommend(ex, nowMs) {
    const result = this._recommendRaw(ex, nowMs);
    // Rotunjeste kg la step-ul echipamentului (helcometre din 4, cabluri din 2.5, DB din 2)
    if (result && result.kg) result.kg = this.roundToStep(result.kg, ex);
    return result;
  },

  // CUT decision — shared injectable-clock helper. `nowMs` DEFAULTS to the real
  // clock (Date.now), so production is byte-identical to the prior inline
  // `new Date() < TARGET_DATE`. Tests pass nowMs to pin the AUTO/target-date branch.
  /**
   * @param {string} phaseOverride 'CUT' | 'BULK' | 'AUTO' | ...
   * @param {number} [nowMs] Injected epoch ms; defaults to real clock.
   * @returns {boolean}
   */
  _isInCut(phaseOverride, nowMs) {
    const ms = nowMs == null ? clockNow() : nowMs;
    return phaseOverride === 'CUT' || (phaseOverride === 'AUTO' && ms < TARGET_DATE.getTime());
  },

  /**
   * @param {string} ex
   * @param {number} [nowMs] Injected epoch ms; defaults to real clock.
   */
  _recommendRaw(ex, nowMs) {
    const state = this.getState(ex);
    const inc = this.getIncrement(ex);
    const phaseOverride = /** @type {string | null} */ (DB.get('phase-override')) || 'AUTO';
    const isInCut = this._isInCut(phaseOverride, nowMs);
    const range = this.getPhaseAwareRepRange(ex, isInCut);
    const rMin = range[0] ?? 8;
    const rMax = range[1] ?? 12;
    const maxKgs = /** @type {Record<string, number>} */ (this.MAX_KG);
    const maxKg = maxKgs[ex] || null;
    const capStrats = /** @type {Record<string, string>} */ (this.WEIGHT_CAP_STRATEGY);
    const _capStrategy = capStrats[ex] || null;

    // No history → start conservative
    if (!state.logs.length) {
      const defaultKg = COMPOUND_EX.includes(ex) ? 20 : 10;
      return {
        kg: defaultKg, repsTarget: rMin, rir: 3,
        status: 'INIT', statusColor: 'var(--text2)',
        statusLabel: '🟡 Pornim conservator',
        progressionNote: 'Greutate de pornire. O recalibram dupa primul set.',
        progressionStage: 0
      };
    }

    const { lastW, lastReps, lastRPE, isStagnant, atTopReps, extraSets } = state;

    // ── SCALE BACK: ≤50% of minimum reps → drop one step on equipment list
    if (lastReps < Math.ceil(rMin * 0.5)) {
      const prevKg = getPrevWeight(lastW, ex);
      return {
        kg: prevKg, repsTarget: rMin, rir: 3,
        status: 'SCALE BACK', statusColor: 'var(--accent2)',
        statusLabel: '🟡 Scadem un pas',
        progressionNote: `${lastW} kg → ${prevKg} kg · Nu am ajuns la intervalul de reps minim.`,
        progressionStage: 1
      };
    }

    // ── CAP CHECK: at or above max sensible weight for this exercise
    if (maxKg && lastW >= maxKg) {
      // Don't add weight — focus on reps and quality
      const targetReps = Math.min(rMax + 4, lastReps + 1); // can exceed normal range
      if (lastReps >= rMax + 4) {
        // At both weight cap AND rep cap → maintain, focus on technique/feel
        return {
          kg: lastW, repsTarget: rMax, rir: 2,
          status: 'PEAK',
          statusColor: 'var(--purple)',
          statusLabel: '🟢 La varf',
          progressionNote: `${lastW} kg este plafonul pe acest exercitiu. Focus pe o executie impecabila.`,
          progressionStage: 1
        };
      }
      return {
        kg: lastW, repsTarget: targetReps, rir: 2,
        status: 'CAP REPS',
        statusColor: 'var(--accent)',
        statusLabel: '🟢 Crestem reps',
        progressionNote: `Suntem la plafonul de greutate (${maxKg} kg). Astazi urcam la ${targetReps} reps.`,
        progressionStage: 1
      };
    }

    // Stage 1: CONSOLIDATE — hold weight, improve reps
    if (lastRPE >= 9 || lastReps < rMax) {
      const targetReps = Math.min(rMax, lastReps + (lastRPE <= 7 ? 2 : 1));
      return {
        kg: lastW, repsTarget: targetReps, rir: lastRPE >= 9 ? 1 : 2,
        status: lastRPE >= 9 ? 'TOO HEAVY' : 'CONSOLIDATE',
        statusColor: lastRPE >= 9 ? 'var(--red)' : 'var(--accent)',
        statusLabel: lastRPE >= 9 ? '🔴 E prea greu' : '🟡 Consolidam reps',
        progressionNote: `Ultima data: ${lastW} kg × ${lastReps} reps. Tintim ${targetReps} astazi.`,
        progressionStage: 1
      };
    }

    // Stage 2: INCREASE — reached top reps, add weight
    if (atTopReps && lastRPE <= 8) {
      const newKg = Math.round((lastW + inc) * 2) / 2;
      return {
        kg: newKg, repsTarget: rMin, rir: 3,
        status: 'INCREASE',
        statusColor: 'var(--green)',
        statusLabel: '🟢 Crestem greutatea',
        progressionNote: `${lastW} kg → ${newKg} kg · Revenim la ${rMin} reps`,
        progressionStage: 2
      };
    }

    // Stage 3: STAGNATION — add 1 set (max once)
    if (isStagnant && typeof extraSets === 'number' && extraSets === 0) {
      DB.set(`ex-extra-sets-${ex}`, 1);
      return {
        kg: lastW, repsTarget: rMax, rir: 2,
        status: 'STAGNANT +SET',
        statusColor: 'var(--accent2)',
        statusLabel: '🟡 Plus un set azi',
        progressionNote: `Greutate constanta 3 sesiuni · Astazi adaugam 1 set`,
        progressionStage: 3
      };
    }

    // Stage 4: TECHNIQUE — drop set (max 1/workout, already tracked)
    if (isStagnant && typeof extraSets === 'number' && extraSets >= 1) {
      // Drop set nu in CUT — in deficit mentii greutatea, straight sets cu executie perfecta
      const phaseOverride = /** @type {string | null} */ (DB.get('phase-override')) || 'AUTO';
      const isInCut = this._isInCut(phaseOverride, nowMs);
      if (isInCut) {
        return {
          kg: lastW, repsTarget: rMax, rir: 2,
          status: 'MAINTAIN',
          statusColor: 'var(--accent)',
          statusLabel: '🟡 Consolidare in definire',
          progressionNote: `Stagnare 3 sesiuni la ${lastW} kg · In definire prioritizam calitatea, nu greutatea`,
          progressionStage: 3
        };
      }
      return {
        kg: lastW, repsTarget: rMax, rir: 1,
        status: 'TECHNIQUE',
        statusColor: 'var(--purple)',
        statusLabel: '🟡 Drop set la final',
        progressionNote: `Stagnare lunga · Drop set pe ultimul: −30% greutate pentru a sparge platoul`,
        progressionStage: 4,
        technique: 'DROP SET'
      };
    }

    // Default: maintain
    return {
      kg: lastW, repsTarget: Math.min(rMax, lastReps + 1), rir: 2,
      status: 'ON TARGET',
      statusColor: 'var(--green)',
      statusLabel: '🟢 In tinta',
      progressionNote: `Ultima: ${lastW} kg × ${lastReps} reps`,
      progressionStage: 0
    };
  }, // end _recommendRaw

  // In-session RPE correction: if 2 sets RPE 10 → drop weight now
  /**
   * @param {string} ex
   * @param {number[]} recentRPEs
   * @param {number[]} recentReps
   * @param {number} [nowMs] Injected epoch ms; defaults to real clock.
   */
  checkInSessionAdjust(ex, recentRPEs, recentReps, nowMs) {
    const dpState = this.getState(ex);
    const inc = this.getIncrement(ex);
    const phOv = /** @type {string | null} */ (DB.get('phase-override')) || 'AUTO';
    const inCut = this._isInCut(phOv, nowMs);
    const range = this.getPhaseAwareRepRange(ex, inCut);
    const rMax = range[1] ?? 12;

    // No history yet — can't adjust
    if (!dpState.lastW) return { adjust: false };

    // Prea greu: 2× RPE 10 → scade imediat
    if (recentRPEs.length >= 2 && recentRPEs.slice(0,2).every((r) => r >= 10)) {
      const newKg = getPrevWeight(dpState.lastW, ex);
      return { adjust: true, dir: 'down', newKg, msg: `Greutatea este prea mare · Trecem la ${newKg} kg pentru urmatorul set` };
    }
    // Prea usor: 2× Easy (RPE ≤6.5) si reps > rMax → creste imediat
    if (recentRPEs.length >= 2 && recentRPEs.slice(0,2).every((r) => r <= 6.5)) {
      const lastReps = recentReps && recentReps.length ? Math.max(...recentReps.slice(0,2)) : 0;
      if (lastReps >= rMax) {
        const newKg = this.roundToStep(dpState.lastW + inc, ex);
        return { adjust: true, dir: 'up', newKg, msg: `Doua seturi prea usoare · Urcam la ${newKg} kg pentru urmatorul set` };
      }
    }
    return { adjust: false };
  },

  // Returns phase-aware rep range for ex.
  /**
   * @param {string} ex
   * @param {number} [nowMs] Injected epoch ms; defaults to real clock.
   */
  getRepsRange(ex, nowMs) {
    const phOv = /** @type {string | null} */ (DB.get('phase-override')) || 'AUTO';
    const inCut = this._isInCut(phOv, nowMs);
    return this.getPhaseAwareRepRange(ex, inCut);
  },

  /** @param {number} rir */
  getIntensityLabel(rir) {
    if (rir <= 1) return '🔴 La limita';
    if (rir <= 2) return '🟠 Greu';
    if (rir <= 3) return '🟡 Provocator';
    return '🟢 Confortabil';
  },

  /**
   * @param {string} ex
   * @param {number | null} readinessScore
   * @param {any} _muscleState
   * @param {number} [nowMs] Injected epoch ms; defaults to real clock.
   */
  getSmartRecommendation(ex, readinessScore, _muscleState, nowMs) {
    const base = this.recommend(ex, nowMs);
    /** @type {Record<string, any>} */
    let result = { ...base };
    result.intensityLabel = this.getIntensityLabel(result.rir ?? 2);

    // Readiness check: don't increase if tired
    if (readinessScore != null && readinessScore < 60 && result.status === 'INCREASE') {
      result.kg = this.getState(ex).lastW;
      result.status = 'CONSOLIDATE';
      result.statusLabel = '🟡 Consolidam reps';
      result.statusColor = 'var(--accent)';
      result.progressionNote = `Recuperare incompleta · Mentinem ${result.kg} kg azi`;
    }

    // Rep range instead of fixed — phase-aware (CUT caps isolation to 10)
    const phOv2 = /** @type {string | null} */ (DB.get('phase-override')) || 'AUTO';
    const inCut2 = this._isInCut(phOv2, nowMs);
    const range = this.getPhaseAwareRepRange(ex, inCut2);
    const [rMin, rMax] = range;
    const rMinSafe = rMin ?? 8;
    const rMaxSafe = rMax ?? 12;
    const rTarget = result.repsTarget || rMinSafe;
    const rLow = Math.max(rMinSafe, rTarget - 1);
    const rHigh = Math.min(rMaxSafe + 2, rTarget + 1);
    result.repsRange = `${rLow}–${rHigh}`;

    return result;
  }
};

// ── Estimare greutate initiala pentru exercitii fara istoric ──────────────────
// Cauta exercitii similare cu istoric si aplica un multiplicator conservativ.

/**
 * @param {string} exerciseName
 * @param {{ recentLogs?: Array<any>, bodyweightKg?: number | null, sex?: string | null, experience?: string | null } | null | undefined} ctx
 */
export function getInitialRecommendation(exerciseName, ctx) {
  const recentLogs = (ctx && ctx.recentLogs) || [];

  // Exact match in context (handles test log format 'exercise' field vs app 'ex' field)
  const exactLog = _findLastLog(exerciseName, recentLogs);
  if (exactLog && exactLog.weight) {
    const rounded = roundToEquipmentWeight(exactLog.weight, exerciseName);
    return {
      kg: rounded, weight: rounded, repsTarget: 8, reps: 8, sets: 3, rir: 2,
      status: 'CONSOLIDATE', statusColor: 'var(--accent)', statusLabel: '🟡 Continuam',
      isInitial: false, rationale: `Pornim de la ultima sesiune: ${exactLog.weight} kg`, confidence: 0.9
    };
  }

  const similar = /** @type {Record<string, string[]>} */ (SIMILAR_EXERCISES);
  const similarList = similar[exerciseName] || [];

  for (const similarName of similarList) {
    const lastLog = _findLastLog(similarName, recentLogs);
    if (lastLog && lastLog.weight) {
      const multiplier = getSimilarityMultiplier(exerciseName, similarName);
      const estimated = lastLog.weight * multiplier;
      const rounded = roundToEquipmentWeight(estimated, exerciseName);
      return {
        kg: rounded,
        weight: rounded,
        repsTarget: 10,
        reps: 10,
        sets: 3,
        rir: 3,
        status: 'INIT',
        statusColor: 'var(--text3)',
        statusLabel: '🟡 Pornire estimata',
        isInitial: true,
        rationale: `Pornim de la ${similarName} · ${lastLog.weight} kg cu ajustare ×${multiplier}`,
        confidence: 0.7
      };
    }
  }

  // Fallback — no exact log, no similar-exercise log. Scale the starting weight
  // by the user's PROFILE (bodyweight + sex + experience) instead of returning
  // the bare equipment floor. The flat-floor fallback gave EVERY user (including
  // a 110kg trained lifter) the equipment minimum — the cold-start "Flat DB
  // Press 10kg" bug. suggestStartWeight applies a conservative per-movement
  // bodyweight coefficient (RIR + AaFriction recalibrate after the first set),
  // floored at the population prior, then we snap to the equipment stack (which
  // enforces the never-below-floor / never-absurd clamp).
  const bw = ctx && Number(ctx.bodyweightKg);
  const hasBw = !!bw && Number.isFinite(bw) && bw > 0;
  let fallbackKg;
  if (hasBw) {
    const experience = (ctx && typeof ctx.experience === 'string' && ctx.experience) || 'beginner';
    const scaled = suggestStartWeight(exerciseName, experience, {
      bodyweightKg: bw,
      sex: ctx ? ctx.sex : undefined,
    });
    // Snap to a real equipment value, then never below the equipment minimum.
    fallbackKg = Math.max(roundToEquipmentWeight(scaled, exerciseName), _minWeightForExercise(exerciseName));
  } else {
    // No bodyweight available → legacy conservative equipment minimum (unchanged).
    fallbackKg = _minWeightForExercise(exerciseName);
  }
  return {
    kg: fallbackKg,
    weight: fallbackKg,
    repsTarget: 10,
    reps: 10,
    sets: 3,
    rir: 3,
    status: 'INIT',
    statusColor: 'var(--text3)',
    statusLabel: '🟡 Pornim conservator',
    isInitial: true,
    rationale: 'Greutate de pornire · Recalibram dupa primul set',
    confidence: 0.4
  };
}

/**
 * @param {string} name
 * @param {Array<{logs?: Array<{ex?: string, w?: number, reps?: number | string}>}>} recentLogs
 */
function _findLastLog(name, recentLogs) {
  for (const session of recentLogs) {
    const logs = session.logs || [];
    const log = logs.find((l) => l.ex === name);
    if (log) return { weight: log.w, reps: log.reps };
  }
  return null;
}

/** @param {string} exerciseName */
function _minWeightForExercise(exerciseName) {
  /** @type {Record<string, string>} */
  const equipMap = {
    'Cable Curl': 'matrix_cable', 'Preacher Curl': 'matrix_cable',
    'Hammer Curl': 'dumbbell', 'Overhead Triceps': 'matrix_cable',
    'Pushdown': 'matrix_cable', 'Rear Delt Fly': 'pec_deck',
    'Face Pulls': 'matrix_cable', 'Lateral Raises (cable)': 'matrix_cable',
    'Cable Fly': 'matrix_cable', 'Leg Press': 'leg_press_plates'
  };
  /** @type {Record<string, number>} */
  const minByEquip = {
    'dumbbell': 7, 'matrix_cable': 5, 'bailib_stack': 5,
    'pec_deck': 18, 'leg_machine': 10, 'leg_press_plates': 20
  };
  const equip = equipMap[exerciseName] || (COMPOUND_EX.includes(exerciseName) ? 'bailib_stack' : 'matrix_cable');
  return minByEquip[equip] || 10;
}
