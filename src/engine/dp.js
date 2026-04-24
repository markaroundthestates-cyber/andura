// ══ DP ENGINE — Double Progression ══════════════════════════
import { DB } from '../db.js';
import { COMPOUND_EX, EX_SETS, EX_REPS, TARGET_DATE } from '../constants.js';
import { roundToEquipmentWeight, getPrevWeight } from '../config/weights.js';
import { SIMILAR_EXERCISES, getSimilarityMultiplier } from './exerciseMapping.js';

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
  // Helcometre (weight stack cu plăci de 4kg): Lat Pulldown, Cable Row, Face Pulls, etc.
  // Cabluri izolație (stack mai fin, 2.5kg): Lateral Raises cable, Bayesian, Cable Curl, Pushdown, Overhead, Pec Deck
  // Gantere (DB): 2kg step (set de gantere standard: 10-12-14-16-18-20...)
  // Legs (Leg Press, Leg Curl, Leg Extension): 5kg step
  WEIGHT_STEPS: {
    // Helcometre — stack din 4 în 4 kg
    'Lat Pulldown': 4, 'Cable Row': 4, 'Chest-Supported Row': 4,
    'Face Pulls': 2.5,
    // Cabluri izolație — stack mai fin
    'Lateral Raises (cable)': 2.5, 'Rear Delt Cable': 2.5,
    'Bayesian Curl': 2, 'Cable Curl': 2.5,
    'Overhead Triceps': 2.5, 'Pushdown': 2.5,
    'Pec Deck / Cable Fly': 2.5, 'Cable Fly': 2.5,
    // Gantere — seturi standard din 2 în 2
    'Lateral Raises': 2,
    'Rear Delt Fly': 2,
    'Incline DB Curl': 2, 'Hammer Curl': 2,
    'Preacher Curl': 2,
    'DB Shoulder Press': 2, 'Incline DB Press': 2, 'Flat DB Press': 2,
    // Picioare — plăci mari
    'Leg Press': 5, 'Leg Curl': 5, 'Leg Extension': 5, 'Romanian Deadlift': 2.5,
    'Calf Raises': 5,
  },

  // Rotunjește greutatea la cea mai apropiată valoare din lista reală a echipamentului
  roundToStep(kg, ex) {
    return roundToEquipmentWeight(kg, ex);
  },

  // Microload increments (o treaptă pe echipamentul respectiv)
  MICRO: {
    compound: 2.5, isolation: 1.0, legs: 2.5
  },

  // Max sensible weights per exercise — calibrat pe nivelul real al utilizatorului
  // Daniel: Lat Pulldown 64, Cable Row 72, Incline DB 30, Lateral Raises 10, Bayesian 18
  MAX_KG: {
    // Izolație umeri — cap real ~16-18kg/ganteră pentru lateral raises
    'Lateral Raises': 18,
    'Lateral Raises (cable)': 25, // cablu = greutate mai mare posibil
    'Rear Delt Fly': 16,
    'Face Pulls': 55, // cablu, poate crește mai mult
    // Izolație biceps
    'Incline DB Curl': 18, // per ganteră
    'Hammer Curl': 28, // per ganteră — Daniel face 20-22kg
    'Bayesian Curl': 25,
    'Cable Curl': 35,
    'Preacher Curl': 30,
    // Triceps
    'Overhead Triceps': 55,
    'Pushdown': 55,
    // Piept izolație
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
  getPhaseAwareRepRange(ex, isInCut) {
    const range = this.REP_RANGES[ex] || [8, 12];
    if (!isInCut) return range;
    const [rMin, rMax] = range;
    if (rMax > 10 && rMax <= 15 && !COMPOUND_EX.includes(ex)) return [Math.min(rMin, 10), 10];
    return range;
  },

  getIncrement(ex) {
    // Incrementul = 1 treaptă pe echipamentul exercițiului
    return this.WEIGHT_STEPS[ex] || (COMPOUND_EX.includes(ex) ? 2.5 : 2.5);
  },

  // Get last N logs for exercise
  getLogs(ex, n=10) {
    const logs = DB.get('logs') || [];
    return logs.filter(l => l.ex === ex && l.w).slice(0, n);
  },

  // Get progression state for exercise
  getState(ex) {
    const logs = this.getLogs(ex, 6);
    if (!logs.length) return { stage:'INIT', level:0, logs:[] };

    const range = this.REP_RANGES[ex] || [8,12];
    const [rMin, rMax] = range;
    const lastW = logs[0].w;
    const lastReps = parseInt(logs[0].reps) || rMin;
    const lastRPE = logs[0].rpe || 7;

    // Check stagnation (same weight last 3+ sessions)
    const last3W = logs.slice(0,3).map(l=>l.w);
    const isStagnant = last3W.length >= 3 && last3W.every(w => w === last3W[0]);

    // Check if at top of rep range consistently
    const last3Reps = logs.slice(0,3).map(l=>parseInt(l.reps)||rMin);
    const atTopReps = last3Reps.every(r => r >= rMax);

    // How many sets at +1 volume
    const currentSets = EX_SETS[ex] || 3;
    const extraSets = DB.get(`ex-extra-sets-${ex}`) || 0;

    return {
      lastW, lastReps, lastRPE, isStagnant, atTopReps,
      range, rMin, rMax, currentSets, extraSets,
      logs
    };
  },

  // MAIN RECOMMENDATION FUNCTION
  recommend(ex) {
    const result = this._recommendRaw(ex);
    // Rotunjește kg la step-ul echipamentului (helcometre din 4, cabluri din 2.5, DB din 2)
    if (result && result.kg) result.kg = this.roundToStep(result.kg, ex);
    return result;
  },

  _recommendRaw(ex) {
    const state = this.getState(ex);
    const inc = this.getIncrement(ex);
    const phaseOverride = DB.get('phase-override') || 'AUTO';
    const isInCut = phaseOverride === 'CUT' || (phaseOverride === 'AUTO' && new Date() < TARGET_DATE);
    const range = this.getPhaseAwareRepRange(ex, isInCut);
    const [rMin, rMax] = range;
    const maxKg = this.MAX_KG[ex] || null;
    const capStrategy = this.WEIGHT_CAP_STRATEGY[ex] || null;

    // No history → start conservative
    if (!state.logs.length) {
      const defaultKg = COMPOUND_EX.includes(ex) ? 20 : 10;
      return {
        kg: defaultKg, repsTarget: rMin, rir: 3,
        status: 'INIT', statusColor: 'var(--text2)',
        statusLabel: 'PRIMA DATĂ – START CONSERVATIV',
        progressionNote: 'Greutate estimată. Ajustezi după primul set.',
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
        statusLabel: '⬇️ SCADE GREUTATEA',
        progressionNote: `${lastW}kg → ${prevKg}kg · Reps insuficiente (${lastReps}/${rMin})`,
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
          statusLabel: '🔝 LA MAXIM',
          progressionNote: `${lastW}kg e limita pentru acest exercițiu. Focus pe execuție perfectă.`,
          progressionStage: 1
        };
      }
      return {
        kg: lastW, repsTarget: targetReps, rir: 2,
        status: 'CAP REPS',
        statusColor: 'var(--accent)',
        statusLabel: '↑ CREȘTI REPS',
        progressionNote: `La limita de greutate (${maxKg}kg). Acum crești reps: ${lastReps} → ${targetReps}`,
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
        statusLabel: lastRPE >= 9 ? '🔴 PREA GREU' : '🟡 CONSOLIDARE REPS',
        progressionNote: `Last: ${lastW}kg × ${lastReps} reps · Fă ${targetReps} azi`,
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
        statusLabel: '🟢 CREȘTI GREUTATEA',
        progressionNote: `${lastW}kg → ${newKg}kg · Revii la ${rMin} reps`,
        progressionStage: 2
      };
    }

    // Stage 3: STAGNATION — add 1 set (max once)
    if (isStagnant && extraSets === 0) {
      DB.set(`ex-extra-sets-${ex}`, 1);
      return {
        kg: lastW, repsTarget: rMax, rir: 2,
        status: 'STAGNANT +SET',
        statusColor: 'var(--accent2)',
        statusLabel: '⚠️ STAGNARE → +1 SET',
        progressionNote: `3 sesiuni la ${lastW}kg · Adaugă 1 set azi`,
        progressionStage: 3
      };
    }

    // Stage 4: TECHNIQUE — drop set (max 1/workout, already tracked)
    if (isStagnant && extraSets >= 1) {
      // Drop set nu în CUT — în deficit menții greutatea, straight sets cu execuție perfectă
      const phaseOverride = DB.get('phase-override') || 'AUTO';
      const isInCut = phaseOverride === 'CUT' ||
        (phaseOverride === 'AUTO' && new Date() < TARGET_DATE);
      if (isInCut) {
        return {
          kg: lastW, repsTarget: rMax, rir: 2,
          status: 'MAINTAIN',
          statusColor: 'var(--accent)',
          statusLabel: '🟡 MENȚII',
          progressionNote: `Stagnare detectată · În CUT menții ${lastW}kg — execuție perfectă`,
          progressionStage: 3
        };
      }
      return {
        kg: lastW, repsTarget: rMax, rir: 1,
        status: 'TECHNIQUE',
        statusColor: 'var(--purple)',
        statusLabel: '⚡ TEHNICĂ: DROP SET',
        progressionNote: `Stagnare lungă · Drop set ultimul set: −30% greutate`,
        progressionStage: 4,
        technique: 'DROP SET'
      };
    }

    // Default: maintain
    return {
      kg: lastW, repsTarget: Math.min(rMax, lastReps + 1), rir: 2,
      status: 'ON TARGET',
      statusColor: 'var(--green)',
      statusLabel: '🟢 ON TARGET',
      progressionNote: `Last: ${lastW}kg × ${lastReps} reps`,
      progressionStage: 0
    };
  }, // end _recommendRaw

  // In-session RPE correction: if 2 sets RPE 10 → drop weight now
  checkInSessionAdjust(ex, recentRPEs, recentReps) {
    const dpState = this.getState(ex);
    const inc = this.getIncrement(ex);
    const phOv = DB.get('phase-override') || 'AUTO';
    const inCut = phOv === 'CUT' || (phOv === 'AUTO' && new Date() < TARGET_DATE);
    const range = this.getPhaseAwareRepRange(ex, inCut);
    const [, rMax] = range;

    // No history yet — can't adjust
    if (!dpState.lastW) return { adjust: false };

    // Prea greu: 2× RPE 10 → scade imediat
    if (recentRPEs.length >= 2 && recentRPEs.slice(0,2).every(r => r >= 10)) {
      const newKg = getPrevWeight(dpState.lastW, ex);
      return { adjust: true, dir: 'down', newKg, msg: `2× RPE 10 → scade la ${newKg}kg ACUM` };
    }
    // Prea ușor: 2× RPE ≤6 și reps > rMax → crește imediat
    if (recentRPEs.length >= 2 && recentRPEs.slice(0,2).every(r => r <= 6)) {
      const lastReps = recentReps && recentReps.length ? Math.max(...recentReps.slice(0,2)) : 0;
      if (lastReps >= rMax) {
        const newKg = this.roundToStep(dpState.lastW + inc, ex);
        return { adjust: true, dir: 'up', newKg, msg: `2× RPE 6 + reps maxime → crește la ${newKg}kg ACUM` };
      }
    }
    return { adjust: false };
  },

  // Returns phase-aware rep range for ex.
  getRepsRange(ex) {
    const phOv = DB.get('phase-override') || 'AUTO';
    const inCut = phOv === 'CUT' || (phOv === 'AUTO' && new Date() < TARGET_DATE);
    return this.getPhaseAwareRepRange(ex, inCut);
  },

  getIntensityLabel(rir) {
    if (rir <= 1) return '🔴 La limită';
    if (rir <= 2) return '🟠 Greu';
    if (rir <= 3) return '🟡 Provocator';
    return '🟢 Confortabil';
  },

  getSmartRecommendation(ex, readinessScore, muscleState) {
    const base = this.recommend(ex);
    let result = { ...base };
    result.intensityLabel = this.getIntensityLabel(result.rir ?? 2);

    // Readiness check: don't increase if tired
    if (readinessScore != null && readinessScore < 60 && result.status === 'INCREASE') {
      result.kg = this.getState(ex).lastW;
      result.status = 'CONSOLIDATE';
      result.statusLabel = '🟡 CONSOLIDARE REPS';
      result.statusColor = 'var(--accent)';
      result.progressionNote = `Readiness redus (${readinessScore}) — menții ${result.kg}kg`;
    }

    // Rep range instead of fixed — phase-aware (CUT caps isolation to 10)
    const phOv2 = DB.get('phase-override') || 'AUTO';
    const inCut2 = phOv2 === 'CUT' || (phOv2 === 'AUTO' && new Date() < TARGET_DATE);
    const range = this.getPhaseAwareRepRange(ex, inCut2);
    const [rMin, rMax] = range;
    const rTarget = result.repsTarget || rMin;
    const rLow = Math.max(rMin, rTarget - 1);
    const rHigh = Math.min(rMax + 2, rTarget + 1);
    result.repsRange = `${rLow}–${rHigh}`;

    return result;
  }
};

// ── Estimare greutate inițială pentru exerciții fără istoric ──────────────────
// Caută exerciții similare cu istoric și aplică un multiplicator conservativ.

export function getInitialRecommendation(exerciseName, ctx) {
  const recentLogs = (ctx && ctx.recentLogs) || [];

  // Exact match in context (handles test log format 'exercise' field vs app 'ex' field)
  const exactLog = _findLastLog(exerciseName, recentLogs);
  if (exactLog && exactLog.weight) {
    const rounded = roundToEquipmentWeight(exactLog.weight, exerciseName);
    return {
      kg: rounded, weight: rounded, repsTarget: 8, reps: 8, sets: 3, rir: 2,
      status: 'CONSOLIDATE', statusColor: 'var(--accent)', statusLabel: '🟡 CONSOLIDARE',
      isInitial: false, rationale: `Bazat pe ultimul log: ${exactLog.weight}kg`, confidence: 0.9
    };
  }

  const similarList = SIMILAR_EXERCISES[exerciseName] || [];

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
        statusLabel: '⚡ START ESTIMAT',
        isInitial: true,
        rationale: `Estimat din ${similarName} (${lastLog.weight}kg × ${multiplier})`,
        confidence: 0.7
      };
    }
  }

  // Fallback — greutate minimă conservativă pe echipament
  const minKg = _minWeightForExercise(exerciseName);
  return {
    kg: minKg,
    weight: minKg,
    repsTarget: 10,
    reps: 10,
    sets: 3,
    rir: 3,
    status: 'INIT',
    statusColor: 'var(--text3)',
    statusLabel: '⚡ START',
    isInitial: true,
    rationale: 'Start conservativ — ajustăm după primul set',
    confidence: 0.4
  };
}

function _findLastLog(name, recentLogs) {
  for (const session of recentLogs) {
    const logs = session.logs || [];
    const log = logs.find(l => (l.exercise || l.ex) === name);
    if (log) return { weight: log.weight ?? log.w, reps: log.reps };
  }
  return null;
}

function _minWeightForExercise(exerciseName) {
  const equipMap = {
    'Cable Curl': 'matrix_cable', 'Preacher Curl': 'matrix_cable',
    'Hammer Curl': 'dumbbell', 'Overhead Triceps': 'matrix_cable',
    'Pushdown': 'matrix_cable', 'Rear Delt Fly': 'pec_deck',
    'Face Pulls': 'matrix_cable', 'Lateral Raises (cable)': 'matrix_cable',
    'Cable Fly': 'matrix_cable', 'Leg Press': 'leg_press_plates'
  };
  const minByEquip = {
    'dumbbell': 7, 'matrix_cable': 5, 'bailib_stack': 5,
    'pec_deck': 18, 'leg_machine': 10, 'leg_press_plates': 20
  };
  const equip = equipMap[exerciseName] || (COMPOUND_EX.includes(exerciseName) ? 'bailib_stack' : 'matrix_cable');
  return minByEquip[equip] || 10;
}
