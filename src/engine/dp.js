// ══ DP ENGINE — Double Progression ══════════════════════════
import { DB } from '../db.js';
import { COMPOUND_EX, EX_SETS, EX_REPS as _EX_REPS, TARGET_DATE } from '../constants.js';
import { roundToEquipmentWeight, getPrevWeight, getNextWeight } from '../config/weights.js';
import { SIMILAR_EXERCISES, getSimilarityMultiplier, getTransferSources } from './exerciseMapping.js';
import { getExerciseMetadata } from './exerciseLibrary.js';
import { now as clockNow } from './clock.js';
import { suggestStartWeight } from './coldStartGuidelines.js';
import { isEnabled } from '../util/featureFlags.js';
import { updatePosterior, savePosterior, loadPosterior } from './dp/strengthKalman.js';
import { ceilingE1RM, gainDecay } from './dp/ceiling.js';
import { sanityCheckSet } from './dp/anomalyGuard.js';
import { getUserConfig } from '../config/user.js';
import { t } from '../i18n/index.js';

export const DP = {
  // Rep ranges per exercise — keyed on the CANONICAL engineNames the session
  // builder actually emits for ACTIVE CORE_AUTO exercises (exercises.json status
  // CORE_AUTO). The founder's tuning (12-15 lateral/rear-delt/face-pull, 10-12
  // curls/triceps, 10-15 legs) is re-pointed onto the real emitted names — the
  // earlier legacy keys (Lateral Raises / Pushdown / Calf Raises / …) were DEAD
  // (status=undefined → never offered active), so the intent never reached the
  // engine. See _ENGINE_AUDIT F-1.
  REP_RANGES: {
    'DB Shoulder Press':[6,10],'Incline DB Press':[6,10],'Flat DB Press':[8,12],
    'Lat Pulldown':[8,12],'Cable Row':[8,12],'Chest-Supported Row':[10,12],
    'Romanian Deadlift':[8,12],'Leg Press':[8,12],
    // Umeri izolatie — lateral / rear delt (founder intent [12,15])
    'DB Lateral Raise':[12,15],'Cable Lateral Raise':[12,15],
    'Machine Lateral Raise':[12,15],'Leaning Lateral Raise':[12,15],
    'DB Rear Delt Fly':[12,15],'Cable Rear Delt Fly':[12,15],'Reverse Pec Deck':[12,15],
    'Face Pull':[12,15],
    // Biceps izolatie (founder intent [10,12])
    'Incline DB Curl':[10,12],'Bayesian Curl':[10,12],'Cable Curl':[10,12],
    'EZ-bar Preacher Curl':[10,12],
    // Triceps izolatie (founder intent [10,12])
    'Cable Overhead Triceps Extension Rope':[10,12],
    'Cable Single-Arm Overhead Triceps Extension':[10,12],
    'DB Overhead Triceps Extension Two-Hand':[10,12],
    'Cable Triceps Pushdown Straight Bar':[10,12],'Cable Triceps Pushdown Rope':[10,12],
    'Cable Triceps Pushdown V-bar':[10,12],'Cable Triceps Pushdown Single-Arm':[10,12],
    'Triceps Press Machine':[10,12],
    // Piept izolatie
    'Pec Deck / Cable Fly':[12,15],
    // Picioare / gambe (founder intent [10,15])
    'Leg Curl':[10,15],'Leg Extension':[10,15],
    'Standing Calf Raise Machine':[10,15],'Seated Calf Raise Machine':[10,15],
    'Smith Standing Calf Raise':[10,15],'Leg Press Calf Raise':[10,15],
    'Standing DB Calf Raise':[10,15],'Single-Leg Calf Raise Bodyweight':[10,15]
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

  // Max sensible weights per exercise — calibrat pe nivelul real al utilizatorului.
  // Keyed on the CORE_AUTO engineNames the builder emits (legacy keys like
  // 'Lateral Raises'/'Pushdown'/'Calf Raises' were DEAD — never offered active —
  // so their caps never applied). Daniel refs: Lat Pulldown 64, Cable Row 72,
  // Incline DB 30, lateral raise ~10, Bayesian 18.
  // Heavy generic COMPOUNDS get explicit defensive caps too (audit F-1): without
  // a MAX_KG they were bounded only by accident of the equipment-list ceiling, so
  // an absurd load could be prescribed if equipment data changed. Caps sit well
  // above any realistic strong-lifter load — they clip ONLY absurd values.
  MAX_KG: {
    // Izolatie umeri — cap real ~16-18kg/gantera pentru lateral raises
    'DB Lateral Raise': 18,
    'Cable Lateral Raise': 25, // cablu = greutate mai mare posibil
    'Machine Lateral Raise': 30, 'Leaning Lateral Raise': 18,
    'DB Rear Delt Fly': 16, 'Cable Rear Delt Fly': 25, 'Reverse Pec Deck': 45,
    'Face Pull': 55, // cablu, poate creste mai mult
    // Izolatie biceps
    'Incline DB Curl': 18, // per gantera
    'Bayesian Curl': 25,
    'Cable Curl': 35,
    'EZ-bar Preacher Curl': 50,
    // Triceps
    'Cable Overhead Triceps Extension Rope': 55,
    'Cable Single-Arm Overhead Triceps Extension': 35,
    'DB Overhead Triceps Extension Two-Hand': 45,
    'Cable Triceps Pushdown Straight Bar': 70, 'Cable Triceps Pushdown Rope': 70,
    'Cable Triceps Pushdown V-bar': 70, 'Cable Triceps Pushdown Single-Arm': 40,
    'Triceps Press Machine': 120,
    // Piept izolatie
    'Pec Deck / Cable Fly': 60,
    // Picioare / gambe — Leg Press are mult loc
    'Leg Press': 400, 'Leg Curl': 160, 'Leg Extension': 160,
    'Standing Calf Raise Machine': 250, 'Seated Calf Raise Machine': 200,
    'Smith Standing Calf Raise': 250, 'Leg Press Calf Raise': 400,
    'Standing DB Calf Raise': 50,
    // ── Heavy generic COMPOUNDS — explicit defensive caps (audit F-1) ──────────
    // Barbell presses / rows / squats / deadlifts: ceilings above world-class
    // training loads; protect against absurd prescription if equipment changes.
    'Flat Barbell Bench': 220, 'Incline Barbell Bench': 200,
    'Close-Grip Bench Press': 180, 'Smith Close-Grip Bench': 180,
    'Smith Machine Bench': 220, 'Smith Incline Bench': 200,
    'Barbell Row': 200, 'Pendlay Row': 200, 'Landmine T-Bar Row': 200,
    'Hammer Strength Row': 250, 'T-Bar Row Machine': 250,
    'Barbell Back Squat (High Bar)': 320, 'Front Squat': 250,
    'Hack Squat Machine': 400, 'Pendulum Squat': 400, 'Belt Squat': 400,
    'Smith Machine Squat': 320,
    'Trap Bar Deadlift': 360, 'Hip Thrust': 360,
    'Plate-Loaded Hip Thrust Machine': 360, 'Smith Hip Thrust': 360,
    'OHP': 150, 'Smith OHP': 150, 'Landmine Shoulder Press': 120,
    // Bodyweight compounds — cap is on ADDED external load (vest/belt).
    'Weighted Pull-up': 80, 'Pull-up': 80, 'Chin-up': 80, 'Dip': 100,
  },

  // How many kg before we stop adding weight and switch to reps/volume
  WEIGHT_CAP_STRATEGY: {
    // isolation: after cap → add reps first, then volume, NOT weight.
    // Keyed on real emitted CORE_AUTO names (legacy keys were dead — audit F-1).
    'DB Lateral Raise': 'reps', 'Cable Lateral Raise': 'reps',
    'Machine Lateral Raise': 'reps', 'Leaning Lateral Raise': 'reps',
    'DB Rear Delt Fly': 'reps', 'Cable Rear Delt Fly': 'reps',
    'Reverse Pec Deck': 'reps', 'Face Pull': 'reps',
    'Incline DB Curl': 'reps', 'Bayesian Curl': 'reps',
    'Cable Curl': 'reps', 'EZ-bar Preacher Curl': 'reps',
    'Cable Overhead Triceps Extension Rope': 'reps',
    'Cable Single-Arm Overhead Triceps Extension': 'reps',
    'DB Overhead Triceps Extension Two-Hand': 'reps',
    'Cable Triceps Pushdown Straight Bar': 'reps', 'Cable Triceps Pushdown Rope': 'reps',
    'Cable Triceps Pushdown V-bar': 'reps', 'Cable Triceps Pushdown Single-Arm': 'reps',
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

  // ── PERSISTENT PER-EXERCISE machine-calibration factor ──────────────────────
  // The gap (founder): a cable/machine's EFFECTIVE resistance depends on its
  // pulley ratio, which varies by gym — "32 kg on the stack" feels different on
  // every machine. We must NOT ask the user "how many pulleys?". Instead the
  // engine LEARNS, from logged performance on THIS user's real machine, a stable
  // per-exercise correction factor that absorbs whatever the mechanical reality
  // is, converging after a few sessions, no questions asked.
  //
  // DISTINCT from the per-BUCKET session-bias above (no overlap of purpose):
  //   - session-bias: FAST (alpha 0.4), per-BUCKET, VOLATILE (4h TTL). Its job is
  //     to calibrate the STARTING estimate of the NEXT exercise in the SAME
  //     session by transferring across exercises that share a coarse bucket. It
  //     deliberately self-expires so it never carries a stale within-session
  //     guess into the next day.
  //   - calibration factor (this): SLOW (alpha 0.3), PER-EXERCISE (engineName),
  //     PERSISTENT (synced per-UID, survives reload). Its job is to capture the
  //     STABLE per-machine/strength offset of one specific exercise across
  //     sessions. Different scope, different lifetime, different key — they read
  //     the same (recKg, loggedKg) observation but never collide.
  //
  // NO DOUBLE-COUNT with the transient fatigue models. We learn from the ratio
  // loggedKg / recKg where recKg is the ALREADY-ADJUSTED recommendation — it has
  // the synergist pre-fatigue discount, readiness gate, across-session recovery
  // AND this factor itself already folded in. So if a set was discounted 7% for
  // synergist pre-fatigue and the user lifts exactly the discounted rec, the
  // ratio is ~1.0 → the factor does not move → the transient discount is NEVER
  // baked into the persistent factor. The slow alpha washes residual noise.
  // The self-consistent fixed point is recKg == loggedKg (factor stops moving
  // when the recommendation already matches the user's real working load).

  CAL_ALPHA: 0.3,            // slow EMA → only the stable offset survives noise
  CAL_MIN: 0.6,             // clamp band: one weird session can't break it
  CAL_MAX: 1.5,
  CAL_DEV_MIN: 0.6,         // per-observation deviation clamp (outlier guard)
  CAL_DEV_MAX: 1.5,

  /** @returns {Record<string, {kgFactor:number, n:number}>} */
  _getCalFactors() {
    const raw = /** @type {any} */ (DB.get('dp-cal-factors'));
    return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
  },

  // The learned multiplier for one exercise. No data → 1.0 (identity), so a brand
  // new user and the golden master are byte-unchanged. Clamped to the sane band.
  /** @param {string} ex @returns {number} */
  _calFactor(ex) {
    const f = this._getCalFactors()[ex];
    if (!f || !Number.isFinite(f.kgFactor)) return 1;
    return Math.max(this.CAL_MIN, Math.min(this.CAL_MAX, f.kgFactor));
  },

  // Apply the learned per-exercise factor to a recommended load. Identity when no
  // data (factor 1.0). Bodyweight / 0-load left untouched (the load axis is reps).
  /** @param {string} ex @param {number} kg @returns {number} */
  _applyCalibration(ex, kg) {
    if (!kg || !Number.isFinite(kg) || kg <= 0) return kg;
    return kg * this._calFactor(ex);
  },

  // Update the persistent per-exercise factor from one logged set. recKg is the
  // ALREADY-ADJUSTED recommendation (factor + synergist discount + recovery +
  // readiness all folded in) → learning the residual deviation cannot double-
  // count any transient. Slow EMA (CAL_ALPHA) so a single outlier barely moves
  // it; deviation and result both clamped. No-op without a valid (recKg, loggedKg).
  /**
   * @param {string} ex
   * @param {{recKg?:number, loggedKg?:number}} obs
   */
  _recordCalibration(ex, obs) {
    if (typeof ex !== 'string' || !ex) return;
    const recKg = Number(obs.recKg);
    const loggedKg = Number(obs.loggedKg);
    if (!Number.isFinite(recKg) || recKg <= 0) return;
    if (!Number.isFinite(loggedKg) || loggedKg <= 0) return;
    let dev = loggedKg / recKg;
    dev = Math.max(this.CAL_DEV_MIN, Math.min(this.CAL_DEV_MAX, dev));
    const factors = this._getCalFactors();
    const prev = factors[ex];
    const prevFactor = (prev && Number.isFinite(prev.kgFactor)) ? prev.kgFactor : 1;
    const n = (prev && Number.isFinite(prev.n)) ? prev.n : 0;
    const next = prevFactor + this.CAL_ALPHA * (dev - prevFactor);
    factors[ex] = {
      kgFactor: Math.max(this.CAL_MIN, Math.min(this.CAL_MAX, next)),
      n: n + 1,
    };
    DB.set('dp-cal-factors', factors);
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

  // ── DEEP ADAPTATION: demonstrated working capacity (Daniel decision #6) ──────
  // The hardened sim (_SIM_REVALIDATE v2) proved the core defect: a user who
  // FOLLOWS the coach never converges (trusts_coach 0.6%, timid −0.701 collapse),
  // because the engine seeds an under-low cold-start and only climbs one small
  // rep-ladder step per session — ~30 sessions to reach the real working weight.
  // Only users who OVERRIDE the load UP converge (ego_lifter 11%), because the
  // next prescription anchors on the last LOGGED load (getState.lastW).
  //
  // The fix reads the user's OWN demonstrated capacity straight from the logs:
  // the HEAVIEST load they have actually COMPLETED at target reps (reps >= rMin)
  // without a distress (failed) set. That single number drives both halves of the
  // adaptation fix:
  //   (a) PR-FLOOR — the rec never drops below it (stops the timid down-ratchet:
  //       rating everything "greu" can no longer spiral the rec below proven kg).
  //   (b) FIND-YOUR-WEIGHT catch-up — when the current rec sits well below it (an
  //       under-seeded cold start, or the user keeps logging more), climb in BIG
  //       steps toward it instead of one rep at a time (~2-3 sessions, not ~30).
  // Both are CATCHING UP to established capacity, so they run in ALL phases. Only
  // pushing ABOVE the demonstrated load toward a NEW max is phase-gated (part c).
  //
  // Pure: reads only the exercise's own `logs`. A distress set (rpe>=8.5 AND reps
  // below rMin = a failed/overload set) is EXCLUDED — we floor on what they truly
  // OWN, never on a grind they could not complete. Returns 0 when no qualifying
  // log exists (cold start) → the floor/catch-up are inert and the path is
  // byte-unchanged for a brand-new user.
  /**
   * @param {string} ex
   * @param {number} rMin minimum reps of the active (phase-aware) range
   * @returns {number} heaviest completed-at-target-reps load, or 0
   */
  _demonstratedWorkingW(ex, rMin) {
    const logs = this.getLogs(ex, 12); // newest-first
    let best = 0;
    const floorReps = rMin ?? 8;
    for (const l of logs) {
      const w = Number(l.w);
      if (!Number.isFinite(w) || w <= 0) continue;
      const reps = typeof l.reps === 'string' ? parseInt(l.reps, 10) : Number(l.reps);
      if (!Number.isFinite(reps) || reps < floorReps) continue; // must hit target reps
      const rpe = Number(l.rpe) || 7;
      // Exclude a genuine failed/overload set (hard AND short of the minimum) — but
      // a set that HIT the reps counts even if rated greu (greu-at-target = capacity).
      if (rpe >= 8.5 && reps < floorReps) continue;
      if (w > best) best = w;
    }
    return best;
  },

  // ══ BUILD #1 — e1RM as the internal progression currency (F3 spec §1) ════════
  // RIR-corrected Epley estimated-1RM. The 3-bucket per-set rating maps to
  // reps-in-reserve (NOT to RPE-as-a-number): `usor` had clear headroom, `greu`
  // was at/near failure. e1RM = W·(1 + R_eff/30) with R_eff = reps + RIR, the
  // EFFECTIVE reps SATURATED at R_CAP (Epley is linear and over-estimates in the
  // high-rep zone Daniel trains — see F3 §1c caveat 1). This is the SUBSTRATE the
  // PR-floor / find-your-weight re-express in (a 60×12 no longer floors identically
  // to a 60×8). Computed on the fly from existing logs — NO new persistence (#1).
  // Bodyweight/band exercises have no clean external-load e1RM → null → the caller
  // falls through to today's raw-kg path (e1RM is opt-IN per exercise, never forced).
  //
  // ADDITIVE second map — the existing workoutStore RATING_TO_RPE (usor 6.5 /
  // potrivit 7.5 / greu 8.5) is UNTOUCHED; this is a separate RIR map for e1RM only.
  // Values 3/1/0 are a conservative DESIGN PROPOSAL (F3 §10) pending a sim sweep +
  // Daniel sanity check before the flag flips ON.
  RATING_TO_RIR: { usor: 3, potrivit: 1, greu: 0 },
  E1RM_R_CAP: 12, // saturate EFFECTIVE reps in Epley (Daniel high-rep, F3 §1c)

  // Map a logged set's stored rpe (the 3-bucket reverse-map, or a legacy raw rpe)
  // back to reps-in-reserve. The 3 buckets are 6.5/7.5/8.5; a legacy/absent rpe
  // defaults to the neutral potrivit-equivalent (RIR 1), matching the existing
  // neutral-7 convention (getState lastRPE = lastLog.rpe || 7).
  /** @param {number} [rpe] @returns {number} */
  _rirFromRpe(rpe) {
    const r = Number(rpe);
    if (!Number.isFinite(r)) return this.RATING_TO_RIR.potrivit;
    if (r <= 6.5) return this.RATING_TO_RIR.usor;   // usor — clear headroom
    if (r >= 8.5) return this.RATING_TO_RIR.greu;   // greu — at/near failure
    return this.RATING_TO_RIR.potrivit;             // potrivit — working target
  },

  // Whether an exercise has a clean external-load e1RM. Bodyweight/band resistance
  // is indeterminate (W is 0 or "added load only") → excluded from e1RM, the
  // caller uses the raw-kg path. Detection via getExerciseMetadata (F3 §1c.2).
  /** @param {string} ex @returns {boolean} */
  _e1rmEligible(ex) {
    const eq = getExerciseMetadata(ex)?.equipment_type;
    return eq !== 'bodyweight' && eq !== 'band';
  },

  // ══ BUILD #3 — realistic ceiling source helpers (F3 spec §3) ════════════════
  // Current bodyweight (kg) for ceiling normalization. Reads the logged weights
  // series (latest) with the userConfig startKg as the fallback — the same source
  // SYS.getCurrentKg uses. Pure read; returns 0 when unresolvable.
  /** @returns {number} */
  _currentBodyweightKg() {
    const ws = /** @type {any} */ (DB.get('weights')) || {};
    const dates = Object.keys(ws).sort((a, b) => a.localeCompare(b));
    if (dates.length) {
      const last = dates[dates.length - 1];
      const w = last != null ? Number(ws[last]) : NaN;
      if (Number.isFinite(w) && w > 0) return w;
    }
    const cfg = getUserConfig();
    const start = cfg && cfg.bio ? Number(cfg.bio.startKg ?? cfg.bio.currentKgFallback) : NaN;
    return Number.isFinite(start) && start > 0 ? start : 0;
  },

  // Training age = distinct calendar-day sessions logged for this exercise (a
  // proxy for the attainable fraction of the ceiling). Reads the exercise's own logs.
  /** @param {string} ex @returns {number} */
  _trainingAge(ex) {
    const logs = this.getLogs(ex, 12);
    const days = new Set();
    for (const l of logs) {
      const ts = Number(l.ts);
      if (Number.isFinite(ts) && ts > 0) days.add(Math.floor(ts / 86400000));
    }
    return days.size;
  },

  // The realistic derived ceiling expressed as a working-kg cap at the rep target
  // (back-solved from the e1RM ceiling, like demoW). Sex is unavailable in the
  // engine's per-set path (it lives in the React onboarding store, passed only via
  // ctx to the cold-start) → default 'm' (the more permissive factor — a higher
  // ceiling, never an under-cap). Returns 0 when bodyweight is unusable.
  /** @param {string} ex @param {number} repTarget @returns {number} */
  _ceilingKg(ex, repTarget) {
    if (!this._e1rmEligible(ex)) return 0;
    const bw = this._currentBodyweightKg();
    if (bw <= 0) return 0;
    const ceilE1RM = ceilingE1RM(ex, bw, 'm', this._trainingAge(ex));
    if (!(ceilE1RM > 0)) return 0;
    return this._kgFromE1RM(ceilE1RM, repTarget ?? 8);
  },

  // The effective per-exercise weight cap. With dp_ceiling_v1 ON the derived
  // realistic ceiling REPLACES the flat MAX_KG — but only ever as the MAX of the
  // two, so a mapped lift's cap is never LOWERED below its hand-tuned MAX_KG (the
  // §8.4 no-regression gate) and an UNMAPPED lift (MAX_KG null → old 80kg-default
  // fragility, F-1) gets a finite derived ceiling instead. OFF → the flat MAX_KG
  // (byte-identical legacy).
  /** @param {string} ex @param {number} repTarget @returns {number|null} */
  _effectiveMaxKg(ex, repTarget) {
    const flat = /** @type {Record<string, number>} */ (this.MAX_KG)[ex] || null;
    if (!isEnabled('dp_ceiling_v1')) return flat;
    const ceil = this.roundToStep(this._ceilingKg(ex, repTarget), ex);
    if (!(ceil > 0)) return flat; // ceiling unavailable → keep the flat cap
    return flat ? Math.max(flat, ceil) : ceil;
  },

  // RIR-corrected, saturated Epley e1RM for one logged set. Returns null when the
  // inputs are unusable (no/zero load) — null = "no e1RM", fall through to raw kg.
  /** @param {number} w @param {number} reps @param {number} [rpe] @returns {number|null} */
  e1RMForSet(w, reps, rpe) {
    const W = Number(w);
    const R = typeof reps === 'string' ? parseInt(reps, 10) : Number(reps);
    if (!Number.isFinite(W) || W <= 0) return null;
    if (!Number.isFinite(R) || R <= 0) return null;
    const rEff = Math.min(this.E1RM_R_CAP, R + this._rirFromRpe(rpe));
    return W * (1 + rEff / 30);
  },

  // Back-solve a target working load (kg) from an e1RM at a given rep target. The
  // inverse of e1RMForSet at RIR 1 (the `potrivit` working target, F3 §1d): the kg
  // that, taken to `repTarget` reps with ~1 RIR, realizes `e1rm`. Within a fixed
  // rep band this returns the SAME kg the raw path floored at (golden-safe).
  /** @param {number} e1rm @param {number} repTarget @returns {number} */
  _kgFromE1RM(e1rm, repTarget) {
    const rEff = Math.min(this.E1RM_R_CAP, (Number(repTarget) || 8) + this.RATING_TO_RIR.potrivit);
    return e1rm / (1 + rEff / 30);
  },

  // e1RM analogue of _demonstratedWorkingW: the HIGHEST e1RM the user has owned at
  // ≥rMin reps (same failed-AND-short exclusion as the raw path), back-solved to kg
  // at the CURRENT rep target. So high-rep work is no longer discarded vs a lower-
  // rep heavier set. Returns 0 when no qualifying log (cold start → inert, raw path
  // unchanged). Bodyweight/band → 0 (the caller's raw _demonstratedWorkingW runs).
  /** @param {string} ex @param {number} rMin @returns {number} */
  _demonstratedWorkingW_e1rm(ex, rMin) {
    if (!this._e1rmEligible(ex)) return 0;
    const logs = this.getLogs(ex, 12);
    const floorReps = rMin ?? 8;
    let bestE1RM = 0;
    for (const l of logs) {
      const w = Number(l.w);
      if (!Number.isFinite(w) || w <= 0) continue;
      const reps = typeof l.reps === 'string' ? parseInt(l.reps, 10) : Number(l.reps);
      if (!Number.isFinite(reps) || reps < floorReps) continue; // must hit target reps
      const rpe = Number(l.rpe) || 7;
      if (rpe >= 8.5 && reps < floorReps) continue; // failed/overload set excluded
      const e = this.e1RMForSet(w, reps, rpe);
      if (e != null && e > bestE1RM) bestE1RM = e;
    }
    if (bestE1RM <= 0) return 0;
    return this._kgFromE1RM(bestE1RM, floorReps);
  },

  // ══ BUILD #2 — Kalman strength posterior demoW (F3 spec §2) ══════════════════
  // Build the per-set e1RM observation stream from this exercise's logs (oldest-
  // first), fold it through the REUSED 1-D Kalman (strengthKalman) into a posterior
  // {mu,sigma}, persist it (quota-guarded), and back-solve `mu` to a working kg at
  // the rep target. `mu` is the SMOOTHED demonstrated e1RM — bounded by the high
  // measurement noise so a single coarse-rating set barely moves it (damps the
  // saw-tooth the raw max-of-logs can introduce). Returns 0 when no usable
  // observation (cold start / e1RM-ineligible) → caller falls to the raw path.
  /** @param {string} ex @param {number} rMin @param {boolean} [persist] @returns {number} */
  _kalmanDemoW(ex, rMin, persist = false) {
    if (!this._e1rmEligible(ex)) return 0;
    const logs = this.getLogs(ex, 12); // newest-first
    const floorReps = rMin ?? 8;
    // PURE recompute over the available log window (oldest-first), seeded fresh each
    // time → deterministic and side-effect-free for the READ path. `recommend()`
    // reads demoW several times per render, so persisting on every read would
    // double-count the same sets (a NO-DOUBLE-COUNT trap). Persistence is opt-in
    // (`persist`) and reserved for a single authoritative per-session write site.
    const obs = [];
    for (let i = logs.length - 1; i >= 0; i--) { // oldest-first
      const l = logs[i];
      const w = Number(l.w);
      if (!Number.isFinite(w) || w <= 0) continue;
      const reps = typeof l.reps === 'string' ? parseInt(l.reps, 10) : Number(l.reps);
      if (!Number.isFinite(reps)) continue;
      const rpe = Number(l.rpe) || 7;
      const e = this.e1RMForSet(w, reps, rpe);
      if (e == null) continue;
      // A failed-AND-short greu set is a noisy observation → down-weighted (high R).
      const failedShort = rpe >= 8.5 && reps < floorReps;
      obs.push({ e1rm: e, ts: Number(l.ts) || 0, failedShort });
    }
    const post = updatePosterior(null, obs);
    if (!post || !Number.isFinite(post.mu) || post.mu <= 0) return 0;
    if (persist) savePosterior(ex, post); // quota-guarded; never throws
    // Smoothing must NEVER drop the demonstrated FLOOR below proven raw capacity
    // (that down-drift is what feeds the find-your-weight saw-tooth). Take the MAX
    // of the Kalman-smoothed estimate and the raw heaviest-at-target load: the
    // posterior can RAISE the floor (cross-rep-scheme normalization) but a lagging
    // estimate can never LOWER it below what the user has owned.
    const kalmanKg = this._kgFromE1RM(post.mu, floorReps);
    const rawKg = this._demonstratedWorkingW_e1rm(ex, floorReps);
    return Math.max(kalmanKg, rawKg);
  },

  // The PR-floor / find-your-weight demonstrated load. Resolution order (each flag
  // defaults OFF → byte-identical legacy):
  //   dp_strength_kalman_v1 ON → the Kalman-smoothed posterior mu (back-solved kg)
  //   dp_e1rm_v1 ON            → the e1RM-back-solved heaviest-at-target load (#1)
  //   else                     → the raw heaviest-at-target kg (legacy)
  // Kalman depends on #1's e1RM observation; if it produces nothing it degrades to
  // the #1 e1RM path, then to the raw path — never a regression. Flags resolve
  // per-user; in no-uid contexts (sim) they resolve to default OFF.
  /** @param {string} ex @param {number} rMin @returns {number} */
  _demoWorkingW(ex, rMin) {
    if (isEnabled('dp_strength_kalman_v1')) {
      const k = this._kalmanDemoW(ex, rMin);
      if (k > 0) return k;
    }
    if (isEnabled('dp_e1rm_v1')) {
      const e = this._demonstratedWorkingW_e1rm(ex, rMin);
      if (e > 0) return e;
      // e1RM produced nothing (cold start / ineligible) → raw path, never a regression.
    }
    return this._demonstratedWorkingW(ex, rMin);
  },

  // ══ BUILD #4 — cross-exercise transfer cold-start (F3 spec §4) ═══════════════
  // When a NEW exercise has no logs, seed its working load from a RELATED exercise
  // the user HAS trained, in e1RM space (so a related lift at 12×15 can seed a new
  // lift at 8×10 — e1RM normalizes the rep scheme; raw-kg transfer could not). The
  // related-exercise graph comes from getTransferSources (equipment_alternatives →
  // legacy SIMILAR_EXERCISES → muscle match over the user's own logged lifts).
  // First related lift with a usable e1RM wins, scaled by the legacy similarity
  // ratio. LOW risk — only the FIRST session of a new exercise (no history to
  // regress), bounded by equipment snap + ceiling. Flag dp_transfer_coldstart_v1
  // (default OFF). e1RM-ineligible target (bodyweight/band) → null (raw path).

  // The names the user has actually logged (the candidate pool for the
  // muscle-match last resort in getTransferSources). Reads the `logs` key once.
  /** @returns {string[]} */
  _loggedExerciseNames() {
    const logs = /** @type {Array<{ex?: string, w?: number}>} */ (DB.get('logs')) || [];
    const names = new Set();
    for (const l of logs) { if (l && l.ex && l.w) names.add(l.ex); }
    return [...names];
  },

  // The user's best DEMONSTRATED e1RM for one exercise (kg-scale e1RM, NOT a
  // working kg). Prefers the Kalman posterior mu (dp_strength_kalman_v1 ON +
  // persisted) else the heaviest qualifying per-set e1RM from the logs. Returns 0
  // when the user has no usable e1RM for it. Pure read.
  /** @param {string} ex @param {number} rMin @returns {number} */
  _bestE1RM(ex, rMin) {
    if (!this._e1rmEligible(ex)) return 0;
    if (isEnabled('dp_strength_kalman_v1')) {
      const post = loadPosterior(ex);
      if (post && Number.isFinite(post.mu) && post.mu > 0) return post.mu;
    }
    const logs = this.getLogs(ex, 12);
    const floorReps = rMin ?? 8;
    let best = 0;
    for (const l of logs) {
      const w = Number(l.w);
      if (!Number.isFinite(w) || w <= 0) continue;
      const reps = typeof l.reps === 'string' ? parseInt(l.reps, 10) : Number(l.reps);
      if (!Number.isFinite(reps) || reps < floorReps) continue;
      const rpe = Number(l.rpe) || 7;
      if (rpe >= 8.5 && reps < floorReps) continue;
      const e = this.e1RMForSet(w, reps, rpe);
      if (e != null && e > best) best = e;
    }
    return best;
  },

  // Seed a NEW exercise's working kg from a related lift's e1RM. Returns null when
  // no related lift has a usable e1RM (caller falls to today's suggestStartWeight).
  // @param {string} ex new exercise engineName
  // @param {number} repTarget rep target to back-solve the seed at
  // @returns {{kg:number, source:string, ratio:number}|null}
  coldStartTransfer(ex, repTarget) {
    if (!this._e1rmEligible(ex)) return null;
    const rt = repTarget ?? 10;
    const sources = getTransferSources(ex, getExerciseMetadata, this._loggedExerciseNames());
    for (const src of sources) {
      const srcE1RM = this._bestE1RM(src, rt);
      if (srcE1RM <= 0) continue;
      const ratio = getSimilarityMultiplier(ex, src);
      const seededE1RM = srcE1RM * ratio;
      const kg = this.roundToStep(this._kgFromE1RM(seededE1RM, rt), ex);
      if (kg > 0) return { kg, source: src, ratio };
    }
    return null;
  },

  // ══ BUILD #6 — intensity corridor as an e1RM band (F3 spec §6) ═══════════════
  // The periodization %1RM corridor {floor,ceiling} finally BOUNDS the prescribed
  // kg, now that e1RM (#1) + Kalman mu (#2) exist. The intensity the user trains at
  // = (prescribedKg · (1 + repTarget_eff/30)) / mu = the implied %1RM; the corridor
  // bounds it: too light → raise to floor, too heavy → lower to ceiling. This is
  // the genuine path-A (periodization constraint) + path-B (kg prescription) unify
  // F2 deferred (it designed a relative-width hack precisely BECAUSE there was no
  // e1RM). Dimension-correct (no fake e1RM), goal-aware (forta band high, sanatate
  // low). Applied as the LAST load step, after all gates. Kill-switch null/OFF →
  // no-op. Depends on #1 + #2 (needs mu for the implied-%1RM denominator).
  //
  // PR-floor reconciliation (F3 §6c): the corridor FLOOR and the PR-floor both
  // raise a too-light load → the PR-floor already ran upstream (recommend), so the
  // corridor floor only ever raises FURTHER (most protective). The corridor ceiling
  // is the deliberate goal cap (a lighter-goal user is meant to train lighter) and
  // wins over a high demonstrated e1RM — a Daniel-flagged design choice (F3 §10).
  //
  // @param {number} kg the gated prescribed load
  // @param {string} ex @param {number} repTarget
  // @param {{floor:number, ceiling:number}} corridor %1RM band
  // @returns {number} corridor-bounded kg (snapped), or the input kg when inert
  _applyIntensityCorridor(kg, ex, repTarget, corridor) {
    if (!isEnabled('dp_intensity_corridor_v1')) return kg;          // kill-switch
    if (!corridor || typeof corridor !== 'object') return kg;
    const floor = Number(corridor.floor);
    const ceiling = Number(corridor.ceiling);
    if (!(Number.isFinite(floor) && Number.isFinite(ceiling) && floor > 0 && ceiling >= floor)) return kg;
    if (!Number.isFinite(kg) || kg <= 0) return kg;
    if (!this._e1rmEligible(ex)) return kg;                         // no clean %1RM
    const rt = repTarget ?? 8;
    const mu = this._bestE1RM(ex, rt);                              // Kalman mu / best e1RM
    if (!(mu > 0)) return kg;                                       // no estimate → inert
    const rEff = Math.min(this.E1RM_R_CAP, rt + this.RATING_TO_RIR.potrivit);
    const impliedPct = (kg * (1 + rEff / 30)) / mu;
    // The kg that realizes a target %1RM at this rep scheme.
    const kgForPct = (pct) => (pct * mu) / (1 + rEff / 30);
    if (impliedPct < floor)   return this.roundToStep(kgForPct(floor), ex);
    if (impliedPct > ceiling) return this.roundToStep(kgForPct(ceiling), ex);
    return kg;                                                      // inside the band → byte-identical
  },

  // ── RETURN-AFTER-GAP DELOAD + RAMP (detraining, Daniel decision #3) ──────────
  // Real failure observed in the founder's data: 3 months off legs → the engine
  // (reading only the pre-gap lastW) let him chase a 230 PR + full v-taper volume
  // on the very first session back → "barely walk", DOMS / injury risk. After a
  // training GAP for an exercise, the COMEBACK must be DELOADED then RAMPED, fully
  // automatic from the logs — no user input.
  //
  // FULLY LOG-DRIVEN (no extra DB writes — the recommend path stays side-effect
  // free for this feature): the gap and the ramp position are both READ from the
  // exercise's own timestamped log history.
  //   - GAP = the span between the two most-recent DISTINCT-DAY logs that exceeds
  //     RETURN_GAP_MIN. The "pre-gap working load" is the load logged just BEFORE
  //     that gap; the comeback sessions are the logs AFTER it.
  //   - Comeback session index = how many logs landed AFTER the gap boundary
  //     (0 = none yet → the very first session back; 1,2,3 = ramping up).
  // The deload multiplier starts deep (scaled by gap length) and RAMPS by
  // RETURN_RAMP_STEP per comeback session back toward 1.0 over ~3-4 sessions.
  //
  // Composes cleanly with the rest of the pipeline (getSmartRecommendation applies
  // it as the LAST load multiplier, after readiness / rating / synergist gates and
  // before the final equipment snap) and STACKS sensibly — it only ever LOWERS the
  // load and caps PR, so it cannot push past the other safety gates. The set-trim
  // (−1 set on the comeback) is surfaced as `setsAdjust` for the schedule layer to
  // apply against its own recovery-aware set floor (never below 1).
  //
  // FUTURE PR-FLOOR (decision #6, not built here): an active return-deload window
  // DELIBERATELY prescribes below the demonstrated max on the comeback. A future
  // upward-climb / PR-floor MUST EXEMPT an exercise whose rec carries
  // `returnDeload` (status 'RETURN DELOAD') — do not floor the comeback up to PR.

  // A gap shorter than this is NORMAL (a missed day, a rest week) and must NOT
  // trigger a deload — false positives ruin trust. ~3 weeks.
  RETURN_GAP_MIN_WEEKS: 3,
  // Deload DEPTH scales with gap length, clamped to a sane monotonic band:
  //   ~3 weeks  → mild  (~70% of pre-gap working load)
  //   ~3 months → deep  (~60%)
  // Linear in gap weeks between the two anchors, clamped at both ends.
  RETURN_DELOAD_MILD: 0.70,   // start fraction at the 3-week trigger
  RETURN_DELOAD_DEEP: 0.60,   // floor fraction at / beyond ~3 months (13 weeks)
  RETURN_DELOAD_DEEP_WEEKS: 13,
  // Per comeback session, ramp the multiplier back toward full by this much.
  // ~0.13 → ~3-4 sessions from 0.60/0.70 back to 1.0.
  RETURN_RAMP_STEP: 0.13,
  // Sets trimmed on the comeback (and while ramping) — the schedule layer clamps
  // against its own MIN floor so a session never drops below 1 working set.
  RETURN_SET_TRIM: 1,

  // ms in a week — gap arithmetic.
  _WEEK_MS: 7 * 24 * 3600 * 1000,

  // Compute the return-after-gap deload plan for an exercise from its OWN log
  // history. Pure (reads logs only). Returns null when there is no qualifying gap
  // (cold start, a single log, or every gap < RETURN_GAP_MIN_WEEKS) → the normal
  // pipeline is byte-unchanged. When a gap qualifies, returns the load multiplier
  // for THIS comeback session, the pre-gap working load, the comeback index, the
  // gap length, and whether the ramp is complete.
  /**
   * @param {string} ex
   * @param {number} [nowMs] Injected epoch ms; defaults to real clock.
   * @returns {{ multiplier:number, preGapW:number, gapWeeks:number, session:number, done:boolean } | null}
   */
  _returnDeload(ex, nowMs) {
    const ms = nowMs == null ? clockNow() : nowMs;
    // Read enough history to see the gap boundary + the few comeback sessions.
    const logs = this.getLogs(ex, 12); // newest-first, ts DESC
    // Need at least one historical log to anchor the pre-gap working load. The
    // commonest comeback (one logged session, then a long break) is handled by the
    // gap-from-now path below with a single log.
    if (logs.length < 1) return null;

    // Find the gap boundary: the largest span between consecutive (newest-first)
    // logs that exceeds the trigger. logs[i] is newer than logs[i+1]; the span
    // logs[i].ts - logs[i+1].ts is the gap the user took BEFORE logging logs[i].
    const gapMinMs = this.RETURN_GAP_MIN_WEEKS * this._WEEK_MS;
    let boundary = -1; // index of the FIRST post-gap (comeback) log, newest-first
    let gapMs = 0;
    for (let i = 0; i < logs.length - 1; i++) {
      const a = Number(logs[i].ts);
      const b = Number(logs[i + 1].ts);
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      const span = a - b;
      if (span >= gapMinMs && span > gapMs) {
        gapMs = span;
        boundary = i;
      }
    }

    // Also consider the gap from the LAST log to NOW (the user is back today but
    // has not logged yet this session) — the most common comeback case.
    const lastTs = Number(logs[0].ts);
    const gapFromNow = Number.isFinite(lastTs) ? ms - lastTs : 0;
    let preGapW;
    let session;
    if (gapFromNow >= gapMinMs && gapFromNow >= gapMs) {
      // First session back, nothing logged post-gap yet. Pre-gap load = last log.
      gapMs = gapFromNow;
      preGapW = Number(logs[0].w);
      session = 0;
    } else if (boundary >= 0) {
      // Already logged 1+ comeback sessions — we are mid-ramp. Pre-gap load is the
      // log just BEFORE the boundary (logs[boundary + 1]); comeback session index
      // = how many logs landed at/after the boundary (boundary is 0-based newest-
      // first, so boundary === 0 → 1 comeback log so far → session 1, etc.).
      preGapW = Number(logs[boundary + 1].w);
      session = boundary + 1;
    } else {
      return null;
    }
    if (!Number.isFinite(preGapW) || preGapW <= 0) return null;

    const gapWeeks = gapMs / this._WEEK_MS;
    // Depth scales linearly with gap length between the mild and deep anchors,
    // clamped to the band (monotonic: longer gap → deeper start).
    const span = Math.max(1, this.RETURN_DELOAD_DEEP_WEEKS - this.RETURN_GAP_MIN_WEEKS);
    const frac = Math.min(1, Math.max(0,
      (gapWeeks - this.RETURN_GAP_MIN_WEEKS) / span));
    const startMult = this.RETURN_DELOAD_MILD
      - frac * (this.RETURN_DELOAD_MILD - this.RETURN_DELOAD_DEEP);
    // Ramp back toward full by RETURN_RAMP_STEP per comeback session.
    const multiplier = Math.min(1, startMult + session * this.RETURN_RAMP_STEP);
    // Window complete once the multiplier has climbed back to (≈) full.
    if (multiplier >= 1) return null;
    return { multiplier, preGapW, gapWeeks, session, done: false };
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

    // ── Cross-session EASE-BACK gate signals (Gigel sim 2026-06-06, Target 2) ──
    // The single-`greu` EASE-BACK at the recommend path saw-tooths a strong/
    // consistent user: working AT true capacity is rated greu, so every session
    // the engine demotes the load the user just demonstrated → 248 oscillation
    // flags, chronic undershoot, never-converge. EASE-BACK must require a SUSTAINED
    // hard signal (2+ consecutive greu) OR genuine distress (a hard set where reps
    // collapsed well below the minimum). A single greu AT target reps is normal
    // working intensity → HOLD / progress, never ease.
    // consecutiveGreu: count of most-recent logs (newest-first) rated greu (rpe>=8.5).
    let consecutiveGreu = 0;
    for (const l of logs) {
      if ((l.rpe || 7) >= 8.5) consecutiveGreu++;
      else break;
    }
    // lastRepsBelowTarget: the last set felt hard AND reps fell clearly short of the
    // bottom of the range (true overload / failed set) — eases immediately even on
    // one set. Threshold = below rMin (could not finish the minimum prescribed reps).
    const lastRepsBelowTarget = lastRPE >= 8.5 && lastReps < (rMin ?? 8);

    // consecutiveEasyHit: count of most-recent logs (newest-first) that were NOT
    // hard (rpe < 8.5) AND hit the rep target (reps >= rMin). A run of these is the
    // "the load is too light / they keep doing more" signal a COACH-FOLLOWER emits:
    // they log AT the under-seeded rec, never above it, so demoW can't exceed it —
    // but a sustained easy-at-target run proves the rec is below their real working
    // weight and the FIND-YOUR-WEIGHT catch-up (decision #6 part b) should climb in
    // big steps even without a heavier logged load. Resets on a hard / short set.
    let consecutiveEasyHit = 0;
    for (const l of logs) {
      const r = l.rpe || 7;
      const rp = typeof l.reps === 'string' ? parseInt(l.reps, 10) : Number(l.reps);
      if (r < 8.5 && Number.isFinite(rp) && rp >= (rMin ?? 8)) consecutiveEasyHit++;
      else break;
    }

    // How many sets at +1 volume
    const exSets = /** @type {Record<string, number>} */ (EX_SETS);
    const currentSets = exSets[ex] || 3;
    const extraSets = /** @type {number} */ (DB.get(`ex-extra-sets-${ex}`)) || 0;

    return {
      lastW, lastReps, lastRPE, isStagnant, atTopReps,
      consecutiveGreu, lastRepsBelowTarget, consecutiveEasyHit,
      range, rMin: rMin ?? 8, rMax: rMax ?? 12, currentSets, extraSets,
      logs
    };
  },

  // MAIN RECOMMENDATION FUNCTION
  /** @param {string} ex */
  recommend(ex, nowMs) {
    const result = this._recommendRaw(ex, nowMs);
    if (result && result.kg) {
      // Apply the learned persistent per-exercise machine-calibration factor to
      // the raw load, THEN snap to a real equipment value. No learned data →
      // factor 1.0 (identity) → byte-identical to the prior behavior (golden-safe
      // for cold start). Applied here (not in _recommendRaw) so every branch
      // (INIT / INCREASE / EASE / CAP / …) is corrected uniformly before snapping.
      const calibrated = this._applyCalibration(ex, result.kg);
      // Rotunjeste kg la step-ul echipamentului (helcometre din 4, cabluri din 2.5, DB din 2)
      result.kg = this.roundToStep(calibrated, ex);

      // ── PR-FLOOR (Daniel decision #6, part a) — FIRM ─────────────────────────
      // The rec must NEVER drop below the user's demonstrated working capacity (the
      // heaviest load they completed at target reps). This stops the timid down-
      // ratchet proven in the hardened sim (timid −0.701 collapse): rating every set
      // "greu" can no longer spiral the rec below a load the user has actually owned —
      // EASE-BACK / SCALE-BACK / maintain can lighten WITHIN that floor but never
      // below it. A FLOOR, not a target (we never push UP to it here — catch-up
      // (part b) does the upward climb; this only blocks the down-ratchet).
      // EXEMPTION: an active return-deload window is ALLOWED below the floor by
      // design — the comeback intentionally starts light (decision #3, 344e92a6).
      if (this._returnDeload(ex, nowMs) == null) {
        const phaseOverride = /** @type {string | null} */ (DB.get('phase-override')) || 'AUTO';
        const inCut = this._isInCut(phaseOverride, nowMs);
        const rng = this.getPhaseAwareRepRange(ex, inCut);
        const floorW = this._demoWorkingW(ex, rng[0] ?? 8);
        if (floorW > 0 && Number.isFinite(result.kg) && result.kg > 0 && result.kg < floorW) {
          result.kg = this.roundToStep(floorW, ex);
          // Re-tag a down-ratchet status as a floor HOLD so the note matches the kg
          // (EASE BACK / SCALE BACK can no longer claim to lighten below proven kg).
          if (result.status === 'EASE BACK' || result.status === 'SCALE BACK') {
            result.status = 'ON TARGET';
            result.statusColor = 'var(--green)';
            result.statusLabel = '🟢 La nivelul tau';
            result.progressionNote = `Ramanem la ${result.kg} kg · nivelul pe care l-ai demonstrat deja.`;
          } else if (result.status === 'CATCH UP') {
            // The floor lifted the catch-up step straight to the demonstrated load —
            // keep the note's kg aligned with the final prescribed kg.
            result.progressionNote = `Te descurci usor → urcam la ${result.kg} kg, catre nivelul tau real.`;
          }
        }
      }
    }
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
    // CAP: the flat hand-tuned MAX_KG, OR (dp_ceiling_v1 ON) the MAX of it and the
    // derived realistic ceiling (back-solved at the rep target). Never below the old
    // MAX_KG; gives unmapped lifts a finite ceiling instead of the 80kg default (F-1).
    const maxKg = this._effectiveMaxKg(ex, rMin);
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

    const { lastW, lastReps, lastRPE, isStagnant, atTopReps, extraSets,
      consecutiveGreu, lastRepsBelowTarget, consecutiveEasyHit } = state;

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

    // ── FIND-YOUR-WEIGHT fast climb (Daniel decision #6, part b) — ALL phases ───
    // The defect (hardened sim): a coach-follower seeds an under-low cold start and
    // climbs only ONE rep-ladder step per session → ~30 sessions to reach their real
    // working weight. When the current load sits well BELOW the user's demonstrated
    // working capacity (heaviest load completed at target reps) AND the last set was
    // NOT hard (usor/potrivit) while HITTING the reps, jump in BIG steps toward the
    // demonstrated load — this is CATCHING UP to what they already own, not chasing
    // a new max, so it runs in every phase (a cut user still trains at their real
    // weight, not 40 kg). Composes with the ease-back gate: it only fires on a non-
    // hard, reps-hit set, so a hard-but-hit set HOLDS and a distress set EASES (both
    // handled below) — the climb never fights the ease-back. Skipped during an
    // active return-deload window (the comeback intentionally starts light).
    const demoW = this._demoWorkingW(ex, rMin);
    const lastNotHard = lastRPE < 8.5;
    const hitRepsNow = lastReps >= rMin;
    const rdActive = this._returnDeload(ex, nowMs) != null;
    // TWO catch-up triggers:
    //   • belowDemo — the rec sits below a HEAVIER load the user already logged at
    //     target reps (e.g. an override-up user, or a re-seeded cold start). Climb
    //     toward that demonstrated load (never past it).
    //   • easyRun — a coach-FOLLOWER who logs AT the under-seeded rec never produces
    //     a higher demoW, so a sustained easy-at-target run (consecutiveEasyHit>=2)
    //     is the "too light" signal. Climb a big step even with no heavier log; the
    //     EASE-BACK / hard set still gates it (lastNotHard + hitRepsNow required).
    const belowDemo = demoW > 0 && lastW < demoW * 0.97;
    // easyRun fires only on USOR (lastRPE<=6.5), not potrivit: at the user's true
    // working weight the rating is potrivit, which must STOP the climb — climbing on
    // potrivit would overshoot true capacity. usor = genuine headroom, climb.
    // Runs in (almost) all phases — part b is catch-up to the user's REAL working
    // weight, not a new max: an usor rating proves the load is below true capacity,
    // and the climb self-stops the moment the rating becomes potrivit (true working
    // weight). EXPLICIT CUT restraint (part c): in a deliberate deficit we do NOT
    // chase a new max above what the user has already demonstrated (demoW), so the
    // pure easy-run climb is suppressed there once at/above demoW — the EASY-branch
    // MAINTAIN then holds. (AUTO's date-based cut is NOT a deliberate deficit and
    // still climbs to find the real weight; belowDemo always runs, all phases.)
    const explicitCutAtCap = phaseOverride === 'CUT' && demoW > 0 && lastW >= demoW;
    const easyRun = consecutiveEasyHit >= 2 && lastRPE <= 6.5 && !explicitCutAtCap;
    if (!rdActive && lastNotHard && hitRepsNow && (belowDemo || easyRun)) {
      // Big jump toward the user's real working weight. When a heavier demoW exists
      // we jump STRAIGHT to it (capped there — never overshoot a proven load). On the
      // pure easy-run signal (no heavier log) the step is +20%, growing with the run
      // length (a long sustained-usor run = very under-seeded → climb faster) so a
      // follower reaches their working weight in ~2-3 sessions, not ~30. Snap to a
      // real equipment step; guarantee at least one step of progress on a coarse
      // stack. Bounded by the exercise MAX_KG below.
      let stepFrac = 0.20 + 0.10 * Math.min(3, Math.max(0, consecutiveEasyHit - 2));
      // DIMINISHING RETURNS (dp_ceiling_v1 ON): a PURE easy-run push is chasing a
      // NEW max, so its step decays toward 0 as the current e1RM approaches the
      // realistic ceiling — the climb cannot blow past genetic reality and slows
      // long before it. The belowDemo catch-up (returning to an already-OWNED load)
      // is NOT throttled. OFF → stepFrac unchanged (byte-identical).
      if (!belowDemo && isEnabled('dp_ceiling_v1')) {
        const curE1RM = this.e1RMForSet(lastW, lastReps, lastRPE);
        const bw = this._currentBodyweightKg();
        const ceilE1RM = bw > 0 ? ceilingE1RM(ex, bw, 'm', this._trainingAge(ex)) : 0;
        if (curE1RM != null && ceilE1RM > 0) {
          stepFrac *= gainDecay(curE1RM, ceilE1RM);
        }
      }
      const ceiling = belowDemo ? demoW : lastW * (1 + stepFrac);
      const jumpedRaw = belowDemo ? demoW : lastW * (1 + stepFrac);
      let climbKg = this.roundToStep(Math.min(ceiling, jumpedRaw), ex);
      if (climbKg <= lastW) climbKg = belowDemo
        ? Math.min(demoW, getNextWeight(lastW, ex))
        : getNextWeight(lastW, ex);
      if (climbKg > lastW) {
        // Respect the exercise cap (never climb past a defensive MAX_KG).
        if (maxKg && climbKg > maxKg) climbKg = roundToEquipmentWeight(maxKg, ex);
        if (climbKg > lastW) {
          return {
            kg: climbKg, repsTarget: rMin, rir: 3,
            status: 'CATCH UP',
            statusColor: 'var(--green)',
            statusLabel: '🟢 Urcam la nivelul tau',
            progressionNote: `Te descurci usor → urcam la ${climbKg} kg, catre nivelul tau real.`,
            progressionStage: 2
          };
        }
      }
    }

    // ── RATING-DRIVEN PROGRESSION (Daniel bug 2026-06-04) ───────────────────────
    // The coach must VISIBLY respond to the last set's rating from session 1 — not
    // wait for 3 sessions at rMax before moving. The per-set rating (usor/potrivit/
    // greu) reaches us as lastRPE (greu≈10, potrivit≈7.5, usor≈6.5). One step max
    // per session — never a multi-step jump. EASY steps up decisively (rep target
    // +1, or weight +1 stack step + reset to rMin when already at the top); HARD
    // holds the weight and never increases; MEDIUM does modest standard filling.
    const atTop = lastReps >= rMax;

    // HARD (greu) → ease the cross-session load — but ONLY on a SUSTAINED hard
    // signal, never a single greu at target (Gigel sim 2026-06-06, Target 2).
    // Threshold calibrated to the REAL per-set rating→RPE scale (workoutStore
    // RATING_TO_RPE: usor=6.5 / potrivit=7.5 / greu=8.5). The coarse rating never
    // produces 9, so the gate is >= 8.5.
    //
    // EASE-BACK requires EITHER:
    //   (a) genuine distress — the last hard set's reps collapsed below rMin
    //       (a failed/overload set), OR
    //   (b) 2+ CONSECUTIVE greu sessions WHILE not hitting the rep target
    //       (a sustained too-heavy trend the user cannot work through).
    // A SINGLE greu at/near target reps is normal working intensity for a strong
    // or override-up user; and EVEN a sustained greu run is PRODUCTIVE overload as
    // long as the user keeps completing the prescribed reps (greu-at-capacity =
    // capacity signal, NOT overload — the override-up suppressor). Easing either
    // case demotes the load they just demonstrated and drives the saw-tooth. Both
    // fall through to standard double-progression (HOLD weight, MEDIUM path).
    const hitTargetReps = lastReps >= (rMin ?? 8);
    const sustainedHard = lastRepsBelowTarget || (consecutiveGreu >= 2 && !hitTargetReps);
    if (lastRPE >= 8.5 && sustainedHard) {
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

    // ── PHASE-AWARE push ABOVE established capacity (decision #6, part c) ────────
    // Past the user's demonstrated working weight we are chasing a NEW max, not
    // catching up — so the phase governs how hard we push:
    //   • STRENGTH: aggressive — drive the WEIGHT up on an easy set even before the
    //     rep range is filled (chase strength). BULK/surplus keeps the standard
    //     rep-then-weight double progression (it already drives load up steadily; the
    //     weight-first-on-easy behavior is reserved for an explicit STRENGTH block).
    //   • CUT / deficit: RESTRAINED — once at/above the established working weight
    //     do NOT chase a new PR; hold and maintain (no aggressive new-max climbing
    //     while under-fuelled). Catch-up (part b) already ran above, so the user is
    //     at their real weight, not 40 kg — this only caps the climb PAST it.
    //   • MAINTENANCE / BULK / AUTO: normal double progression (untouched).
    const isStrengthPhase = phaseOverride === 'STRENGTH';
    const aboveEstablished = demoW > 0 && lastW >= demoW;

    // EASY (usor / lastRPE <= 6.5) → DECISIVE forward step THIS session.
    if (lastRPE <= 6.5) {
      // CUT restraint: in an EXPLICIT deficit, at/above the established working
      // weight → do NOT chase a new max. Hold the load, maintain. Gated on explicit
      // 'CUT' (not AUTO's date-based cut) so the normal AUTO double-progression
      // (easy → +1 rep) is unchanged for the default user.
      if (phaseOverride === 'CUT' && aboveEstablished) {
        return {
          kg: lastW, repsTarget: Math.min(rMax, Math.max(lastReps, rMin)), rir: 2,
          status: 'MAINTAIN',
          statusColor: 'var(--accent)',
          statusLabel: '🟡 Mentinem in definire',
          progressionNote: `In definire mentinem ${lastW} kg la nivelul tau · nu fortam un PR nou acum.`,
          progressionStage: 0
        };
      }
      if (!atTop) {
        // STRENGTH phase: aggressive — drive the WEIGHT up on an easy set even
        // before the rep range is filled (chase strength), as long as a real step
        // exists. Other phases raise the rep target by +1 toward rMax (standard).
        if (isStrengthPhase) {
          const strKg = getNextWeight(lastW, ex);
          if (strKg > lastW && !(maxKg && strKg > maxKg)) {
            return {
              kg: strKg, repsTarget: rMin, rir: 3,
              status: 'INCREASE',
              statusColor: 'var(--green)',
              statusLabel: '🟢 Crestem greutatea',
              progressionNote: `Faza de forta · usor → urcam la ${strKg} kg.`,
              progressionStage: 2
            };
          }
        }
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
   * @param {{ recKg?: number, recReps?: number, loggedKg?: number, setIdx?: number, nowMs?: number, userConfirmed?: boolean } | number} [opts]
   *   Optional context: recKg/recReps = what was RECOMMENDED for the set just
   *   logged; loggedKg = the load the user ACTUALLY logged for that set (defaults
   *   to the DP history lastW when omitted); setIdx = 0-based position of the NEXT
   *   set (fatigue); userConfirmed = the user explicitly confirmed a flagged
   *   fat-finger value (#5/A) so calibration may learn from it. A bare number is
   *   accepted as legacy `nowMs` for back-compat.
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
      // #5/A anomaly guard (belt-and-suspenders): if the logged load is an
      // implausible fat-finger (×10 typo / past the physical ceiling) AND the user
      // did NOT explicitly confirm it (ctx.userConfirmed !== true), skip the
      // calibration + session-bias learning so a single outlier can never poison
      // the per-exercise factor / the session bucket — even if it lands in `logs`.
      // A CONFIRMED-real outlier (userConfirmed===true) flows through normally.
      const suspect = ctx.userConfirmed === true ? null : sanityCheckSet({
        ex, w: loggedKg, reps: loggedReps,
        lastLoggedW: dpState.lastW || null,
        maxKg: /** @type {Record<string, number>} */ (this.MAX_KG)[ex] || null,
        bwKg: this._currentBodyweightKg(),
        sex: 'm', repTarget: rMin,
      });
      const calibrationSafe = !(suspect && suspect.field === 'weight');
      if (calibrationSafe) {
        this._recordSessionBias(ex, { recKg: Number(ctx.recKg), loggedKg, lastRPE, nowMs });
        // Persistent per-exercise machine-calibration: learn the STABLE offset of
        // THIS exercise on the user's real machine. recKg is the already-adjusted
        // recommendation, so the slow EMA captures the durable per-machine reality
        // without baking in synergist pre-fatigue / recovery / readiness transients
        // (see _recordCalibration). Self-guards on a valid (recKg, loggedKg).
        this._recordCalibration(ex, { recKg: Number(ctx.recKg), loggedKg });
      }
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
      // Daniel decision 2026-06-06 (Gigel rule, extends DECISIONS dp-hard-eases to
      // the in-session next-set): a hard set must VISIBLY ease the WEIGHT one step
      // whenever we have a real working load to drop from. Holding the load and only
      // trimming the rep target reads as "the coach did nothing" to a non-expert who
      // watches the kg — the exact "weights never change" complaint. So weight-FIRST:
      // step the load down (getPrevWeight) when there is prior history to drop from.
      // This eases DOWN in any phase (you always lighten what felt too hard) and does
      // NOT touch the UP path, so it never pushes strength progression in a deficit.
      if (dpState.lastW > 0) {
        const easedKg = getPrevWeight(baseKg, ex);
        if (easedKg < baseKg) {
          return { adjust: true, dir: 'down', newKg: easedKg, msg: t('workout.adjust.greuWeight', { kg: easedKg }) };
        }
      }
      // Cold-start (no working load yet) OR already at the lightest step — no reliable
      // load to drop from, so trim the rep target instead (−1 maint / −2 hypertrophy),
      // floored. Keeps the first-ever session conservative rather than echoing the set.
      const drop = isMaint ? 1 : 2;
      const newReps = Math.max(rMin, baseReps - drop);
      if (newReps < baseReps) {
        return { adjust: true, dir: 'down', newReps, holdKg: baseKg, msg: t('workout.adjust.greuReps', { reps: newReps }) };
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
  getSmartRecommendation(ex, readinessScore, _muscleState, nowMs, sessionRating, priorExercises, opts = {}) {
    const base = this.recommend(ex, nowMs);
    /** @type {Record<string, any>} */
    let result = { ...base };
    // F2 #2 — RIR label override: when Goal Adaptation supplies a rir_target_modifier
    // [min,max] band, the displayed intensity label reflects the engine's intended
    // RIR (band floor — the harder end the user trains toward) instead of DP's raw
    // per-exercise rir. Label only — NO load/reps change. Absent → DP's rir-derived
    // label (byte-identical). Bounded by getIntensityLabel's own thresholds.
    const rirMod = opts && Array.isArray(opts.rirTargetModifier) ? opts.rirTargetModifier : null;
    const labelRir =
      rirMod && Number.isFinite(rirMod[0]) ? rirMod[0] : (result.rir ?? 2);
    result.intensityLabel = this.getIntensityLabel(labelRir);

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
      // Nearest-snap the discounted target. On fine increments (dumbbells, finer
      // cables) this already lands on a lower step and we honor it directly.
      let discountedKg = this.roundToStep(preKg * (1 - discountFraction), ex);
      // DEFECT-1: on a COARSE stack the 8-12% haircut can round back UP to preKg
      // (e.g. 23kg matrix_cable: 21.07 → nearest is 23), so the discount silently
      // no-ops at common loads. When the discount is genuine but nearest-snap did
      // not move the load down, drop to the next-LOWER available equipment step so
      // the lighter intent is honored. Bounded to ONE step below preKg (never an
      // over-drop): getPrevWeight returns exactly the adjacent lower step, and we
      // only take it if it actually moves down (already at the stack floor → no-op).
      if (discountedKg >= preKg) {
        const prevKg = getPrevWeight(preKg, ex);
        if (prevKg < preKg) discountedKg = prevKg;
      }
      // Commit only if the load actually moved DOWN (we never report a discount we
      // did not apply — e.g. already at the equipment floor).
      if (discountedKg < preKg) {
        result.kg = discountedKg;
        result.synergistDiscount = discountFraction;
        result.synergistPreFatigue = { ...synergistLoad };
        result.synergistKgBefore = preKg;
      }
    }

    // ── RETURN-AFTER-GAP DELOAD + RAMP (detraining, decision #3) ────────────────
    // Applied as the LAST load multiplier — after readiness / rating / synergist
    // gates — so it always wins on a genuine comeback (it only ever LOWERS the
    // load + caps PR, so it cannot conflict with those gates). Anchored on the
    // PRE-GAP working load (not the gated rec), so the comeback is a true fraction
    // of what the user actually trained before the gap. NO-OP when there is no
    // qualifying gap (cold start / single log / gap < 3 weeks) → byte-unchanged.
    const rd = this._returnDeload(ex, nowMs);
    if (rd && Number.isFinite(result.kg) && result.kg > 0) {
      const target = rd.preGapW * rd.multiplier;
      // NO PR on the comeback: never prescribe at/above the pre-gap working load
      // (cap intensity). The deload target is already below it, but the cap also
      // guards the ramp's final sessions from snapping back up to / past it.
      const cappedTarget = Math.min(target, getPrevWeight(rd.preGapW, ex));
      const deloadKg = this.roundToStep(Math.max(0, cappedTarget), ex);
      // The return window is AUTHORITATIVE on the load: it both deloads the first
      // session back AND ramps each subsequent session toward (but never up to)
      // the pre-gap working load — faster than DP's one-step climb, and capped
      // below PR. So it overrides whatever the normal path produced (which on the
      // ramp is the slow climb from the already-low comeback lastW). It only ever
      // sits BELOW the pre-gap load (the cap), so it never pushes past PR.
      if (deloadKg > 0) {
        result.kg = deloadKg;
        result.status = 'RETURN DELOAD';
        result.statusColor = 'var(--accent2)';
        result.statusLabel = '🟡 Revenire dupa pauza';
        const wk = Math.round(rd.gapWeeks);
        result.progressionNote = rd.session === 0
          ? `Pauza de ~${wk} saptamani · pornim usor la ${deloadKg} kg si urcam treptat, fara PR azi.`
          : `Revenire in crestere · ${deloadKg} kg azi, continuam sa urcam catre nivelul de dinainte.`;
        // Set-trim on the comeback — the schedule layer applies this against its
        // own recovery-aware MIN floor (never below 1 working set).
        result.setsAdjust = -this.RETURN_SET_TRIM;
        // Forensic flags (explainability / future PR-floor exemption — decision #6
        // must NOT floor the comeback up to PR while returnDeload is present).
        result.returnDeload = {
          multiplier: rd.multiplier,
          preGapKg: rd.preGapW,
          gapWeeks: rd.gapWeeks,
          session: rd.session,
        };
      }
    }

    // Rep range instead of fixed — phase-aware (CUT caps isolation to 10)
    const phOv2 = /** @type {string | null} */ (DB.get('phase-override')) || 'AUTO';
    const inCut2 = this._isInCut(phOv2, nowMs);
    const range = this.getPhaseAwareRepRange(ex, inCut2);
    let [rMin, rMax] = range;
    let rMinSafe = rMin ?? 8;
    let rMaxSafe = rMax ?? 12;
    // F2 #2 — Goal Adaptation rep_range_modifier [min,max]: the engine's intended
    // per-(template,phase,mode) rep band. INTERSECT with the phase-aware range
    // (never widen past it — the CUT cap + per-exercise REP_RANGES stay
    // authoritative ceilings); empty intersection falls back to the phase band.
    // Then clamp the prescribed repsTarget into the intersected band so the goal
    // actually narrows the prescribed reps. Absent/malformed → byte-identical.
    const repMod = opts && Array.isArray(opts.repRangeModifier) ? opts.repRangeModifier : null;
    if (repMod && Number.isFinite(repMod[0]) && Number.isFinite(repMod[1])) {
      const lo = Math.max(rMinSafe, Math.min(repMod[0], repMod[1]));
      const hi = Math.min(rMaxSafe, Math.max(repMod[0], repMod[1]));
      if (lo <= hi) {
        rMinSafe = lo;
        rMaxSafe = hi;
        if (Number.isFinite(result.repsTarget)) {
          result.repsTarget = Math.max(rMinSafe, Math.min(rMaxSafe, result.repsTarget));
        }
      }
    }
    const rTarget = result.repsTarget || rMinSafe;
    const rLow = Math.max(rMinSafe, rTarget - 1);
    const rHigh = Math.min(rMaxSafe + 2, rTarget + 1);

    // F2 §3 / F3 #6 — intensity corridor (e1RM band) as the LAST load step, after
    // every gate. Bounds the implied %1RM into the goal's periodization band. EXEMPT
    // during an active return-deload comeback (the comeback intentionally starts
    // light, F2 §3b guard) — never fight the ramp. Flag dp_intensity_corridor_v1
    // OFF / no corridor in opts → no-op → byte-identical.
    const corridor = opts && opts.intensityCorridor ? opts.intensityCorridor : null;
    if (corridor && !result.returnDeload && Number.isFinite(result.kg) && result.kg > 0) {
      const bounded = this._applyIntensityCorridor(result.kg, ex, rTarget, corridor);
      if (Number.isFinite(bounded) && bounded > 0 && bounded !== result.kg) {
        result.kg = bounded;
        result.intensityCorridorApplied = { floor: corridor.floor, ceiling: corridor.ceiling, kg: bounded };
      }
    }

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

  // F3 #4 — cross-exercise transfer in e1RM space (flag dp_transfer_coldstart_v1,
  // default OFF → this whole block is skipped → byte-identical legacy). Seeds the
  // new lift's load from a RELATED lift the user has e1RM for (equipment_alternatives
  // → SIMILAR_EXERCISES → muscle match), normalizing the rep scheme. Wins over the
  // legacy raw-kg similar loop below; falls through to it / to the profile fallback
  // when no related e1RM exists.
  if (isEnabled('dp_transfer_coldstart_v1')) {
    const seed = DP.coldStartTransfer(exerciseName, 10);
    if (seed && seed.kg > 0) {
      const rounded = roundToEquipmentWeight(seed.kg, exerciseName);
      return {
        kg: rounded, weight: rounded, repsTarget: 10, reps: 10, sets: 3, rir: 3,
        status: 'INIT', statusColor: 'var(--text3)', statusLabel: '🟡 Pornire estimata',
        isInitial: true,
        rationale: `Pornim de la ${seed.source} (estimare e1RM ×${seed.ratio})`,
        confidence: 0.7,
      };
    }
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
