// ══ DP ENGINE — Double Progression ══════════════════════════
import { DB } from '../db.js';
import { COMPOUND_EX, EX_SETS, EX_REPS as _EX_REPS, TARGET_DATE } from '../constants.js';
import { roundToEquipmentWeight, getPrevWeight, getNextWeight } from '../config/weights.js';
import { SIMILAR_EXERCISES, getSimilarityMultiplier } from './exerciseMapping.js';
import { getExerciseMetadata } from './exerciseLibrary.js';
import { now as clockNow } from './clock.js';
import { suggestStartWeight } from './coldStartGuidelines.js';
import { t } from '../i18n/index.js';

export const DP = {
  // Rep ranges per exercise
  REP_RANGES: {
    'DB Shoulder Press':[6,10],'Incline DB Press':[6,10],'Flat DB Press':[8,12],
    'Lat Pulldown':[8,12],'Cable Row':[8,12],'Chest-Supported Row':[10,12],
    'Romanian Deadlift':[8,12],'Leg Press':[8,12],
    'Lateral Raises':[12,15],'Rear Delt Fly':[12,15],'Face Pulls':[12,15],
    'Incline DB Curl':[10,12],'Bayesian Curl':[10,12],'Cable Curl':[10,12],
    'Preacher Curl':[10,12],'Overhead Triceps':[10,12],'Pushdown':[10,12],
    'Pec Deck / Cable Fly':[12,15],'Leg Curl':[10,15],'Leg Extension':[10,15],
    'Calf Raises':[10,15]
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

  // ── INTRA-SESSION SYNERGIST PRE-FATIGUE discount ────────────────────────────
  // The gap (founder, an experienced lifter): a small muscle worked LATER in the
  // session as an isolation is already PRE-FATIGUED if an earlier compound used it
  // as a SYNERGIST (rows/pulldowns hammer the biceps; presses hammer the triceps;
  // rows hammer the rear delts). The engine prescribes the isolation as if the
  // muscle were fresh → the starting estimate is too high. This model applies a
  // MODEST, conservative haircut to the isolation's load when its target muscle
  // accumulated genuine synergist volume earlier THIS session.
  //
  // DISTINCT from the two existing fatigue mechanisms (no double-count):
  //   - _recordSessionBias: a per-BUCKET (compound|iso × large|small × force) load-
  //     DEVIATION EMA. A back compound and a biceps curl fall in different buckets
  //     and NEVER cross-contaminate, so it cannot see synergist pre-fatigue at all.
  //     It reacts to how far the user's logged kg drifted from the rec; this reacts
  //     to the PLAN's prior synergist set-volume. Orthogonal axes.
  //   - muscleRecovery / muscleMap: ACROSS sessions (hours-based recovery). This is
  //     WITHIN the current session, from exercises done minutes ago.
  //
  // The synergist signal is the library's `muscle_target_secondary` (e.g. Cable Row
  // lists "biceps"). We only discount SMALL muscles that commonly act as synergists
  // to big compounds and get over-prescribed when isolated — biceps / triceps /
  // shoulders (rear+side delts) / forearms / calves. We never discount the big
  // compounds themselves (the gap is small-muscle isolations starting too high).

  // Big-11 RO muscle_target_primary values we treat as small/synergist isolations
  // eligible for the discount. Large prime movers (piept/spate/picioare*/fese) and
  // core are excluded — they are not the over-prescribed-after-a-compound case.
  /** @type {ReadonlySet<string>} */
  SYNERGIST_SMALL_MUSCLES: new Set(['biceps', 'triceps', 'umeri', 'antebrate', 'gambe']),

  // Per accumulated synergist-set, how much load to shave (fraction). A high-force
  // compound contributes more per set than a low-force one (force factor below).
  // Tuned conservative: a typical back day (Cable Row 3 sets + Lat Pulldown 4 sets,
  // both high-force) accumulates ~7 weighted sets → ~7% haircut on the biceps curl.
  SYNERGIST_DISCOUNT_PER_SET: 0.012,

  // Hard cap on the total haircut — never crater the weight. A realistic single
  // equipment step or two, not a collapse: 12% off is the most pre-fatigue ever
  // removes, no matter how much synergist volume piled up earlier.
  SYNERGIST_DISCOUNT_CAP: 0.12,

  // Force-demand weighting: a high-force compound (heavy row/press) loads its
  // synergists far harder per set than a low-force movement. Multiplies the set
  // count that feeds the discount.
  /** @type {Readonly<Record<string, number>>} */
  SYNERGIST_FORCE_FACTOR: { high: 1, medium: 0.6, low: 0.3 },

  // Accumulate per-muscle synergist set-volume from the exercises done EARLIER in
  // the same session. `priorExercises` is the ordered list of exercises BEFORE the
  // one being prescribed: each { name, sets }. For every prior exercise we read its
  // muscle_target_secondary (the synergist muscles it fatigued) and add its set
  // count × the force factor to each of those muscles. Primary muscles are NOT
  // accumulated here — the DP history already carries direct-work fatigue; the gap
  // is specifically the SECONDARY/synergist case. Pure; reads only the library.
  /**
   * @param {ReadonlyArray<{name?:string, sets?:number}>} priorExercises
   * @returns {Record<string, number>} muscle (Big-11 RO) → weighted synergist sets
   */
  accumulateSynergistLoad(priorExercises) {
    /** @type {Record<string, number>} */
    const load = {};
    if (!Array.isArray(priorExercises)) return load;
    for (const pe of priorExercises) {
      if (!pe || typeof pe.name !== 'string') continue;
      const meta = getExerciseMetadata(pe.name);
      const sec = (meta && Array.isArray(meta.muscle_target_secondary))
        ? meta.muscle_target_secondary : [];
      if (!sec.length) continue;
      const sets = Number(pe.sets);
      if (!Number.isFinite(sets) || sets <= 0) continue;
      const forceFactors = /** @type {Record<string, number>} */ (this.SYNERGIST_FORCE_FACTOR);
      const force = (meta && meta.force_demand) || 'medium';
      const factor = forceFactors[force] ?? 0.6;
      const weighted = sets * factor;
      for (const m of sec) {
        if (typeof m !== 'string') continue;
        load[m] = (load[m] || 0) + weighted;
      }
    }
    return load;
  },

  // The fraction to shave off a SMALL-muscle isolation's load given the synergist
  // volume its target muscle accumulated earlier this session. 0 when: the exercise
  // is a compound, its primary muscle is not a small/synergist muscle, or there was
  // no prior synergist load on that muscle (e.g. the isolation came FIRST). Capped.
  /**
   * @param {string} ex exercise being prescribed (English canonical name)
   * @param {Record<string, number>} synergistLoad output of accumulateSynergistLoad
   * @returns {number} discount fraction in [0, SYNERGIST_DISCOUNT_CAP]
   */
  synergistDiscountFraction(ex, synergistLoad) {
    if (!synergistLoad || typeof synergistLoad !== 'object') return 0;
    // Big compounds are not the over-prescribed case — never discount them.
    if (COMPOUND_EX.includes(ex)) return 0;
    const meta = getExerciseMetadata(ex);
    const primary = (meta && meta.muscle_target_primary) || 'unknown';
    const small = /** @type {Set<string>} */ (this.SYNERGIST_SMALL_MUSCLES);
    if (!small.has(primary)) return 0;
    const accumulated = Number(synergistLoad[primary]) || 0;
    if (accumulated <= 0) return 0;
    const raw = accumulated * this.SYNERGIST_DISCOUNT_PER_SET;
    return Math.min(this.SYNERGIST_DISCOUNT_CAP, raw);
  },

  // ── Per-session BUCKETED bias (Bug 4) ───────────────────────────────────────
  // Daniel: at set 1 we only estimate; once one exercise is logged we already
  // have actual kg + reps + rating, so the STARTING recommendation of the NEXT
  // exercise this session should be calibrated. But what we learn on a
  // compound/large-muscle lift must NOT leak onto a biceps curl — so the bias is
  // keyed by a coarse bucket: (compound|isolation) x (large|small) x force_demand.
  // The bias is a small multiplier (kg) bounded to a conservative band; it lives
  // only for the current session (DB key cleared by the app at session start —
  // we never persist a stale bias across sessions here).

  // Large = piept/spate/picioare/umeri (+ fese); small = biceps/triceps/abdomen
  // (+ antebrate/gambe). Compound vs isolation = COMPOUND_EX membership.
  /** @param {string} ex @returns {string} bucket key */
  _exerciseBucket(ex) {
    const kind = COMPOUND_EX.includes(ex) ? 'compound' : 'isolation';
    const meta = getExerciseMetadata(ex);
    const m = (meta && meta.muscle_target_primary) || 'unknown';
    const LARGE = ['piept', 'spate', 'picioare', 'umeri', 'fese'];
    // muscle_target_primary uses prefixes like 'picioare-quads' → match by prefix.
    const isLarge = LARGE.some((g) => m === g || m.indexOf(g) === 0);
    const size = isLarge ? 'large' : 'small';
    const force = (meta && meta.force_demand) || 'medium';
    return `${kind}:${size}:${force}`;
  },

  // Per-session bias is meant to live ONLY for the current session. The app
  // owns session lifecycle, so rather than depend on an external "session start"
  // clear, the bias self-expires by wall clock: a stored bias older than
  // SESSION_BIAS_TTL_MS (4h — comfortably longer than any single session, short
  // enough that the NEXT day's session starts clean) is treated as absent. This
  // keeps the whole feature self-contained in the engine with no stale carry-over.
  SESSION_BIAS_TTL_MS: 4 * 3600 * 1000,

  /** @param {number} [nowMs] @returns {Record<string, {kgFactor:number, n:number}>} */
  _getSessionBias(nowMs) {
    const raw = /** @type {any} */ (DB.get('session-bias'));
    if (!raw || typeof raw !== 'object') return {};
    const ms = nowMs == null ? clockNow() : nowMs;
    // Fail closed: a missing/non-finite ts (legacy or partial write) is treated
    // as expired, NOT live-forever (audit MD-02 — the TTL is the safety net for
    // exactly the case where the app's session-start clear failed).
    if (!Number.isFinite(raw.ts) || (ms - raw.ts) > this.SESSION_BIAS_TTL_MS) return {};
    const { ts: _ts, ...buckets } = raw;
    return buckets;
  },

  // Apply the current bucket's learned kg multiplier to a STARTING estimate.
  // Conservative: clamped to [0.8, 1.25] so a single odd set never produces a
  // wild start; returns the input unchanged when no bias is known for the bucket.
  /** @param {string} ex @param {number} kg @param {number} [nowMs] */
  _applySessionBias(ex, kg, nowMs) {
    if (!kg || !Number.isFinite(kg)) return kg;
    const bias = this._getSessionBias(nowMs);
    const entry = bias[this._exerciseBucket(ex)];
    if (!entry || !Number.isFinite(entry.kgFactor)) return kg;
    const f = Math.max(0.8, Math.min(1.25, entry.kgFactor));
    return kg * f;
  },

  // Learn from one logged set: how far the user's ACTUAL load deviated from what
  // we recommended (loggedKg / recKg) blends into the bucket's running factor.
  // Small step (EMA-style, weight 0.4) so the bias converges fast in the first
  // session without oscillating. Only records when we have both a recommendation
  // and a real logged load. The rating nudges the factor a touch (greu → ease the
  // bucket down, usor → up) so subsequent exercises start kinder/bolder honestly.
  /**
   * @param {string} ex
   * @param {{recKg?:number, loggedKg?:number, lastRPE?:number, nowMs?:number}} obs
   */
  _recordSessionBias(ex, obs) {
    const recKg = Number(obs.recKg);
    const loggedKg = Number(obs.loggedKg);
    if (!Number.isFinite(recKg) || recKg <= 0) return;
    if (!Number.isFinite(loggedKg) || loggedKg <= 0) return;
    // Per-observation deviation, clamped so an extreme single set can't dominate.
    let dev = loggedKg / recKg;
    dev = Math.max(0.7, Math.min(1.4, dev));
    // Rating nudge: a hard set shades the bucket down ~5%, an easy set shades it
    // up ~5% — small, honest, on top of the load deviation. Thresholds match the
    // real coarse rating→RPE scale (greu=8.5 / usor=6.5), so >= 8.5 / <= 6.5.
    const rpe = Number(obs.lastRPE);
    if (Number.isFinite(rpe)) {
      if (rpe >= 8.5) dev *= 0.95;
      else if (rpe <= 6.5) dev *= 1.05;
    }
    const nowMs = Number.isFinite(Number(obs.nowMs)) ? Number(obs.nowMs) : clockNow();
    const bias = this._getSessionBias(nowMs);
    const key = this._exerciseBucket(ex);
    const prev = bias[key];
    const prevFactor = (prev && Number.isFinite(prev.kgFactor)) ? prev.kgFactor : 1;
    const n = (prev && Number.isFinite(prev.n)) ? prev.n : 0;
    // EMA toward the new observation (alpha 0.4) → fast but smooth convergence.
    const next = prevFactor + 0.4 * (dev - prevFactor);
    bias[key] = { kgFactor: Math.max(0.8, Math.min(1.25, next)), n: n + 1 };
    DB.set('session-bias', { ...bias, ts: nowMs });
  },

  // Get last N logs for exercise
  /**
   * @param {string} ex
   * @param {number} [n]
   */
  getLogs(ex, n=10) {
    /** @type {Array<{ex?: string, w?: number, reps?: number | string, rpe?: number, ts?: number}>} */
    const logs = /** @type {any} */ (DB.get('logs')) || [];
    // Order-independent: sort by timestamp DESC (newest first) so logs[0] is
    // genuinely the latest and slice(0,3) is the latest 3 regardless of how the
    // DB stored them (writers prepend newest-first, but the firebase remote
    // union + legacy IDB-handover merges don't guarantee it). Entries missing
    // `ts` (legacy logs) fall back to 0 → sort to the end; stable sort keeps
    // their relative insertion order. Sort a copy — never mutate the DB array.
    return logs
      .filter((l) => l.ex === ex && l.w)
      .sort((a, b) => (b.ts || 0) - (a.ts || 0))
      .slice(0, n);
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
      // Apply the learned per-session bucket bias to the STARTING estimate, then
      // snap to a real equipment value (the bare 20/10 floor is not on every
      // stack — e.g. pec_deck starts at 18). recommend()'s final gate snaps too,
      // but snapping here keeps progressionNote text and the returned kg aligned.
      const baseDefault = COMPOUND_EX.includes(ex) ? 20 : 10;
      const defaultKg = roundToEquipmentWeight(this._applySessionBias(ex, baseDefault, nowMs), ex);
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
      // Weight is the progression lever — but we are capped, so fill reps to the
      // TOP of the hypertrophy range and stop there. Never escalate a (often
      // heavy/compound) lift to 20+ reps: once at rMax at the cap we maintain and
      // focus on execution, we do NOT keep stacking reps (the old rMax+4 ceiling
      // prescribed e.g. a capped Leg Press at 16-24 reps).
      const targetReps = Math.min(rMax, lastReps + 1); // stay within the range
      if (lastReps >= rMax) {
        // At both weight cap AND the top of the rep range → maintain, focus on
        // technique/feel.
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

    // ── RATING-DRIVEN PROGRESSION (Daniel bug 2026-06-04) ───────────────────────
    // The coach must VISIBLY respond to the last set's rating from session 1 — not
    // wait for 3 sessions at rMax before moving. The per-set rating (usor/potrivit/
    // greu) reaches us as lastRPE (greu≈10, potrivit≈7.5, usor≈6.5). One step max
    // per session — never a multi-step jump. EASY steps up decisively (rep target
    // +1, or weight +1 stack step + reset to rMin when already at the top); HARD
    // holds the weight and never increases; MEDIUM does modest standard filling.
    const atTop = lastReps >= rMax;

    // HARD (greu) → hold weight, never increase. Keep the rep target where it is.
    // Threshold calibrated to the REAL per-set rating→RPE scale (workoutStore
    // RATING_TO_RPE: usor=6.5 / potrivit=7.5 / greu=8.5). The coarse rating never
    // produces 9, so the gate is >= 8.5 (catches greu=8.5; potrivit=7.5 stays MEDIUM).
    if (lastRPE >= 8.5) {
      const easedKg = getPrevWeight(lastW, ex);
      const targetReps = Math.max(rMin, Math.min(lastReps, rMax));
      if (easedKg < lastW) {
        // The rating said too heavy → the coach actually LIGHTENS the load. It used
        // to HOLD at lastW, which contradicted the "too heavy" label and ignored how
        // the set felt: the user lifts a weight, rates it hard, and is handed the
        // exact same weight again (Daniel/Gigel P0 2026-06-05 — "il doare in cur de
        // ce simt eu"). One equipment step down; paired with EASY stepping back up,
        // the coach auto-regulates around the user's true working weight instead of
        // re-prescribing a load they just struggled with.
        return {
          kg: easedKg, repsTarget: targetReps, rir: 2,
          status: 'EASE BACK',
          statusColor: 'var(--accent2)',
          statusLabel: '🟡 Usuram putin',
          progressionNote: `A fost greu · coboram la ${easedKg} kg ca sa stapanesti miscarea.`,
          progressionStage: 1
        };
      }
      // Already at the equipment floor → cannot lighten the load; trim the rep
      // target instead so the next session is still genuinely easier than this one.
      const trimmedReps = Math.max(rMin, lastReps - 1);
      return {
        kg: lastW, repsTarget: trimmedReps, rir: 2,
        status: 'EASE BACK',
        statusColor: 'var(--accent2)',
        statusLabel: '🟡 Usuram putin',
        progressionNote: `A fost greu · ramanem la ${lastW} kg dar tintim ${trimmedReps} reps.`,
        progressionStage: 1
      };
    }

    // EASY (usor / lastRPE <= 6.5) → DECISIVE forward step THIS session.
    if (lastRPE <= 6.5) {
      if (!atTop) {
        // Below the top of the range → raise the rep TARGET by +1 (toward rMax).
        const targetReps = Math.min(rMax, lastReps + 1);
        return {
          kg: lastW, repsTarget: targetReps, rir: 2,
          status: 'INCREASE',
          statusColor: 'var(--green)',
          statusLabel: '🟢 Crestem reps',
          progressionNote: `Usor data trecuta → urcam la ${targetReps} reps.`,
          progressionStage: 1
        };
      }
      // Already at the top of the range → next equipment stack step + reset to rMin.
      const newKg = getNextWeight(lastW, ex);
      if (newKg > lastW) {
        return {
          kg: newKg, repsTarget: rMin, rir: 3,
          status: 'INCREASE',
          statusColor: 'var(--green)',
          statusLabel: '🟢 Crestem greutatea',
          progressionNote: `Ai atins varful de reps → urcam la ${newKg} kg, revenim la ${rMin} reps.`,
          progressionStage: 2
        };
      }
      // No higher stack step available (snaps back to same) → hold, focus quality.
      return {
        kg: lastW, repsTarget: rMax, rir: 2,
        status: 'ON TARGET',
        statusColor: 'var(--green)',
        statusLabel: '🟢 In tinta',
        progressionNote: `Esti la varful echipamentului · mentinem ${lastW} kg × ${rMax} reps.`,
        progressionStage: 0
      };
    }

    // MEDIUM (potrivit / ~7.5) → modest STANDARD double progression. Below the top
    // of the range, fill it with +1 rep. The WEIGHT increase still waits for the
    // range to be genuinely filled (atTopReps = consistently at rMax) — this is the
    // classic double-progression gate and it PRESERVES the stagnation/+set rescue
    // for a manageable-but-stuck lift. (EASY above already escapes this gate and
    // bumps weight the moment a single top-range set feels easy — that is the
    // decisive responsiveness the medium rating intentionally does not get.)
    if (!atTop) {
      const targetReps = Math.min(rMax, lastReps + 1);
      return {
        kg: lastW, repsTarget: targetReps, rir: 2,
        status: 'CONSOLIDATE',
        statusColor: 'var(--accent)',
        statusLabel: '🟡 Consolidam reps',
        progressionNote: `Ultima data: ${lastW} kg × ${lastReps} reps · tintim ${targetReps} astazi.`,
        progressionStage: 1
      };
    }
    if (atTopReps) {
      const newKg = getNextWeight(lastW, ex);
      if (newKg > lastW) {
        return {
          kg: newKg, repsTarget: rMin, rir: 3,
          status: 'INCREASE',
          statusColor: 'var(--green)',
          statusLabel: '🟢 Crestem greutatea',
          progressionNote: `${lastW} kg → ${newKg} kg · revenim la ${rMin} reps.`,
          progressionStage: 2
        };
      }
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

  // ── In-session RESPONSIVE autoregulation (per-set) ──────────────────────────
  // Daniel bug 2026-05-30: the old version only moved WEIGHT and only when the
  // last TWO RPEs were both ≥10 (or both ≤6.5 + reps maxed) — so a single "greu"
  // did nothing, "potrivit" never adapted, and the rep target stayed a static
  // 4×10 "all the way, nu conteaza ca sunt exhausted". This rewrite reacts to
  // EACH logged set from THREE signals:
  //   (a) the rating (greu/potrivit/usor → RPE),
  //   (b) the ACTUAL logged load+reps vs the recommended target (deviation),
  //   (c) accumulated fatigue (set position — later sets allow a small taper).
  // PHASE-AWARE: STRENGTH autoregulates WEIGHT; MASA/hypertrophy (BULK/CUT/AUTO)
  // autoregulates REPS (hold weight); MAINTENANCE is mild. The over-/under-
  // performance signal is persisted via the normal log history (the next session's
  // getState reads it) so a too-low recommendation lifts the NEXT session too —
  // we never fabricate, we just feed the existing DP progression.
  //
  // This is the POST-confirm learning layer. It does NOT replace the AaFriction
  // over-recommendation SAFETY guard (which still asks "sure?" on an unsafe jump
  // BEFORE the set), nor the kcal floors, nor the never-fabricate DP invariants.
  /**
   * @param {string} ex
   * @param {number[]} recentRPEs RPE per logged set (last = most recent).
   * @param {number[]} recentReps reps per logged set (last = most recent).
   * @param {{ recKg?: number, recReps?: number, loggedKg?: number, setIdx?: number, nowMs?: number } | number} [opts]
   *   Optional context: recKg/recReps = what was RECOMMENDED for the set just
   *   logged; loggedKg = the load the user ACTUALLY logged for that set (defaults
   *   to the DP history lastW when omitted); setIdx = 0-based position of the NEXT
   *   set (fatigue). A bare number is accepted as legacy `nowMs` for back-compat.
   */
  checkInSessionAdjust(ex, recentRPEs, recentReps, opts) {
    const ctx = (typeof opts === 'number' || opts == null) ? { nowMs: opts } : opts;
    const nowMs = ctx.nowMs;
    const dpState = this.getState(ex);
    const inc = this.getIncrement(ex);
    const phOv = /** @type {string | null} */ (DB.get('phase-override')) || 'AUTO';
    const inCut = this._isInCut(phOv, nowMs);
    const range = this.getPhaseAwareRepRange(ex, inCut);
    const rMin = range[0] ?? 8;
    const rMax = range[1] ?? 12;

    // Need at least one rated set to respond to.
    if (!recentRPEs || !recentRPEs.length) return { adjust: false };

    const lastRPE = /** @type {number} */ (recentRPEs[recentRPEs.length - 1]);
    const loggedReps = (recentReps && recentReps.length)
      ? /** @type {number} */ (recentReps[recentReps.length - 1]) : null;
    // The load the user ACTUALLY logged for the set just rated. Prefer the
    // explicit value from the caller (the UI's logged kg); fall back to the DP
    // history lastW only when not provided (legacy callers / engine-only tests).
    const loggedKg = (Number.isFinite(Number(ctx.loggedKg)) && Number(ctx.loggedKg) > 0)
      ? Number(ctx.loggedKg) : dpState.lastW;

    // Calibrate intra-session even on a FIRST-EVER session (Bug 4): the old gate
    // bailed whenever there was no prior DP history (!dpState.lastW), so a brand
    // new user's first session never adapted no matter how the sets went. We can
    // calibrate as soon as we have a real load to reason about THIS session —
    // either prior history (dpState.lastW) OR the load the user just logged.
    // Without either, there is genuinely nothing to recalibrate against.
    if (!dpState.lastW && !(Number.isFinite(loggedKg) && loggedKg > 0)) {
      return { adjust: false };
    }

    // Learn the per-session BUCKETED bias from this set so the STARTING
    // recommendation of subsequent exercises in the same bucket is calibrated
    // (load deviation + rating). Bucketed → a compound/large lift never biases a
    // biceps curl. Recorded once per rated set; reading happens in _recommendRaw.
    // _recordSessionBias self-guards on a valid recKg, so this is a no-op when
    // the caller did not pass a recommendation.
    if (Number.isFinite(loggedKg) && loggedKg > 0) {
      this._recordSessionBias(ex, { recKg: Number(ctx.recKg), loggedKg, lastRPE, nowMs });
    }

    // STRENGTH phase autoregulates WEIGHT; everything else (BULK/CUT/AUTO masa-
    // like) autoregulates REPS. MAINTENANCE flagged for milder magnitudes.
    const isStrength = phOv === 'STRENGTH';
    const isMaint = phOv === 'MAINTENANCE';

    // ── (b) Performance deviation: did the user demonstrate FAR more/less than
    // we recommended? Compare against the set's recommendation when provided.
    const recKg = Number(ctx.recKg);
    const recReps = Number(ctx.recReps);
    const haveRec = Number.isFinite(recKg) && recKg > 0 && Number.isFinite(recReps) && recReps > 0;
    if (haveRec && loggedReps != null && loggedReps > 0) {
      const recVol = recKg * recReps;
      const loggedVol = loggedKg * loggedReps;
      const volRatio = loggedVol / recVol;
      // FAR over (≥1.5× the recommended set volume) AND not a near-failure rating
      // → the recommendation was too low. Ramp the next set toward the demonstrated
      // capacity. Heavy-low-reps (chose strength: loggedKg well above recKg) moves
      // the WEIGHT toward what they lifted + lowers the rep target; light-high-reps
      // adds reps (or weight in strength phase).
      if (volRatio >= 1.5 && lastRPE < 9.5) {
        const heavyLowReps = loggedKg >= recKg * 1.3;
        if (isStrength || heavyLowReps) {
          // Move target weight toward the demonstrated load — but SMOOTH: one
          // step up from the recommendation toward what they actually lifted
          // (never jump straight to loggedKg in a single set).
          const aimed = Math.min(loggedKg, this.roundToStep(recKg + inc * 2, ex));
          const newKg = this.roundToStep(Math.max(aimed, recKg + inc), ex);
          const newReps = heavyLowReps ? Math.max(rMin, Math.round(recReps * 0.85)) : recReps;
          if (newKg > recKg) {
            return {
              adjust: true, dir: 'up', newKg, newReps,
              msg: t('workout.adjust.overPerformWeight', { kg: newKg }),
            };
          }
        } else {
          // Hypertrophy/masa over-performance → raise the REP target toward what
          // they hit, one smooth step (cap at rMax + a little headroom).
          const newReps = Math.min(rMax + 2, Math.max(recReps + 1, Math.min(loggedReps, recReps + 2)));
          if (newReps > recReps) {
            return {
              adjust: true, dir: 'up', newReps, holdKg: recKg,
              msg: t('workout.adjust.overPerformReps', { reps: newReps }),
            };
          }
        }
      }
      // FAR under (≤0.6× recommended volume) AND it felt hard → ease the next set.
      if (volRatio <= 0.6 && lastRPE >= 8) {
        if (isStrength) {
          const newKg = getPrevWeight(loggedKg, ex);
          if (newKg < loggedKg) {
            return { adjust: true, dir: 'down', newKg, msg: t('workout.adjust.underWeight', { kg: newKg }) };
          }
        } else {
          const newReps = Math.max(rMin, (loggedReps ?? recReps) - 1);
          if (newReps < recReps) {
            return { adjust: true, dir: 'down', newReps, holdKg: recKg, msg: t('workout.adjust.underReps', { reps: newReps }) };
          }
        }
      }
    }

    // ── (a) Rating-driven per-set autoregulation (single set, responsive). ──────
    // RPE thresholds map from the in-session coarse ratings (usor≈6.5, potrivit≈7.5,
    // greu≈10 in the UI map): greu → ease, usor → hold/nudge up, potrivit → hold.
    const baseReps = haveRec ? recReps : (loggedReps ?? rMin);
    const baseKg = haveRec ? recKg : loggedKg;
    // Fatigue taper (c): later sets (setIdx ≥ 2) naturally allow one fewer rep.
    const setIdx = Number(ctx.setIdx);
    const lateSet = Number.isFinite(setIdx) && setIdx >= 2;

    // GREU (single hard set) → ease the NEXT set MODESTLY.
    if (lastRPE >= 9.5) {
      if (isStrength) {
        const newKg = getPrevWeight(baseKg, ex);
        if (newKg < baseKg) {
          return { adjust: true, dir: 'down', newKg, msg: t('workout.adjust.greuWeight', { kg: newKg }) };
        }
        return { adjust: false };
      }
      // masa/maintenance → drop the rep target (−1 maint / −2 hypertrophy), floored.
      const drop = isMaint ? 1 : 2;
      const newReps = Math.max(rMin, baseReps - drop);
      if (newReps < baseReps) {
        return { adjust: true, dir: 'down', newReps, holdKg: baseKg, msg: t('workout.adjust.greuReps', { reps: newReps }) };
      }
      // Reps already at the floor (rMin) — a hard set can't be eased by dropping reps
      // further. With a known working load (prior history), ease the WEIGHT one step
      // instead of returning {adjust:false} and echoing the same set unchanged — the
      // "coach just repeats the last set" bug (e.g. 8x64 rated hard -> next 8x64).
      // Cold-start (no history, lastW=0) keeps the conservative starting load: we don't
      // yet have a reliable basis to drop from, so the first session stays untouched.
      if (dpState.lastW > 0) {
        const easedKg = getPrevWeight(baseKg, ex);
        if (easedKg < baseKg) {
          return { adjust: true, dir: 'down', newKg: easedKg, msg: t('workout.adjust.greuWeight', { kg: easedKg }) };
        }
      }
      return { adjust: false };
    }

    // USOR (clearly easy, 2+ in reserve) → nudge UP modestly. Hold otherwise.
    if (lastRPE <= 6.5) {
      // Only nudge up when the user actually completed (≥) the rep target — an
      // easy rating on sub-target reps is a wash, hold.
      const hitTarget = loggedReps == null || loggedReps >= baseReps;
      if (hitTarget && !lateSet) {
        if (isStrength) {
          const newKg = this.roundToStep(baseKg + inc, ex);
          if (newKg > baseKg) {
            return { adjust: true, dir: 'up', newKg, msg: t('workout.adjust.usorWeight', { kg: newKg }) };
          }
        } else {
          const newReps = Math.min(rMax, baseReps + 1);
          if (newReps > baseReps) {
            return { adjust: true, dir: 'up', newReps, holdKg: baseKg, msg: t('workout.adjust.usorReps', { reps: newReps }) };
          }
        }
      }
      return { adjust: false };
    }

    // POTRIVIT → hold, with a small natural taper on LATE sets only (−1 rep in
    // hypertrophy, weight unchanged — fatigue accumulation, not a correction).
    if (lateSet && !isStrength) {
      const newReps = Math.max(rMin, baseReps - 1);
      if (newReps < baseReps) {
        return { adjust: true, dir: 'down', newReps, holdKg: baseKg, msg: t('workout.adjust.taperReps', { reps: newReps }) };
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
   * @param {('usoara'|'normala'|'grea'|null)} [sessionRating] Post-session
   *   subjective rating from the LAST session (workoutStore.lastRating). An
   *   honest coach must NOT blindly push when the user said the session was hard:
   *   'grea' demotes an INCREASE day to a HOLD (same mechanism as low readiness).
   *   'usoara'/'normala'/null leave the normal double-progression untouched.
   *   Optional trailing param — existing callers are byte-identical.
   * @param {ReadonlyArray<{name?:string, sets?:number}>} [priorExercises] The
   *   exercises ALREADY positioned earlier in TODAY's session plan (ordered, the
   *   ones before `ex`). Used by the intra-session synergist pre-fatigue discount:
   *   if `ex` is a small-muscle isolation (biceps/triceps/delts/forearms/calves)
   *   and an earlier compound used that muscle as a SYNERGIST, the starting load
   *   is shaved a modest, capped amount so it is not prescribed as if fresh.
   *   Omitted / empty → no discount (the isolation is treated as the first work of
   *   the session). Byte-identical for every existing caller that does not pass it.
   */
  getSmartRecommendation(ex, readinessScore, _muscleState, nowMs, sessionRating, priorExercises) {
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

    // Post-session rating gate (Daniel bug 2026-05-31): the user rated the LAST
    // session 'grea' — do NOT push a weight increase this session. Hold the load
    // (back to lastW) and keep reps, exactly like the low-readiness gate above.
    // Only demotes an INCREASE; HOLD/CONSOLIDATE/SCALE-BACK are already non-pushing.
    if (sessionRating === 'grea' && result.status === 'INCREASE') {
      result.kg = this.getState(ex).lastW;
      result.status = 'CONSOLIDATE';
      result.statusLabel = '🟡 Consolidam reps';
      result.statusColor = 'var(--accent)';
      result.progressionNote = `Ultima sesiune a fost grea · Mentinem ${result.kg} kg azi`;
    }

    // ── INTRA-SESSION SYNERGIST PRE-FATIGUE (the gap) ───────────────────────────
    // If this is a small-muscle isolation and an earlier compound this session used
    // that muscle as a synergist, shave a modest, capped amount off the prescribed
    // load — the muscle is NOT fresh. Applied AFTER readiness/rating gates so it
    // discounts the final intended load, then snapped back to a real equipment
    // value. Discount fraction is exposed for explainability/testing. Conservative:
    // never touches a compound, never an isolation with no prior synergist work,
    // never more than SYNERGIST_DISCOUNT_CAP. Bodyweight/0-load left untouched (the
    // load axis is reps, not external kg). Orthogonal to _recordSessionBias (load-
    // deviation bucket EMA) and muscleRecovery (across-session hours) — no double-
    // count: those never see this session's plan-ordered synergist volume.
    const synergistLoad = this.accumulateSynergistLoad(priorExercises || []);
    const discountFraction = this.synergistDiscountFraction(ex, synergistLoad);
    if (discountFraction > 0 && Number.isFinite(result.kg) && result.kg > 0) {
      const preKg = result.kg;
      const discountedKg = this.roundToStep(preKg * (1 - discountFraction), ex);
      // Only commit the discount if it actually moved the load DOWN a real step
      // (a tiny haircut that snaps back to the same equipment value is a no-op —
      // we never report a discount we did not apply).
      if (discountedKg < preKg) {
        result.kg = discountedKg;
        result.synergistDiscount = discountFraction;
        result.synergistPreFatigue = { ...synergistLoad };
        result.synergistKgBefore = preKg;
      }
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
