import { MS_PER_HOUR } from '../constants.js';
import { DB } from '../db.js';
import { isEnabled } from '../util/featureFlags.js';

export const MUSCLE_HEADS = {
  chest_upper: { recoveryHours: 60, label: 'Piept sus' },
  chest_mid:   { recoveryHours: 60, label: 'Piept mijloc' },
  chest_lower: { recoveryHours: 60, label: 'Piept jos' },
  delt_front:  { recoveryHours: 48, label: 'Umar fata' },
  delt_mid:    { recoveryHours: 48, label: 'Umar lateral' },
  delt_rear:   { recoveryHours: 48, label: 'Umar spate' },
  tri_long:    { recoveryHours: 48, label: 'Triceps lung' },
  tri_lateral: { recoveryHours: 48, label: 'Triceps lateral' },
  tri_medial:  { recoveryHours: 48, label: 'Triceps medial' },
  bi_long:     { recoveryHours: 48, label: 'Biceps lung' },
  bi_short:    { recoveryHours: 48, label: 'Biceps scurt' },
  lat:         { recoveryHours: 72, label: 'Lat' },
  mid_trap:    { recoveryHours: 72, label: 'Trapez mijloc' },
  rear_delt_trap: { recoveryHours: 48, label: 'Delt spate/trapez' },
  lower_back:  { recoveryHours: 72, label: 'Spate jos' },
  quad:        { recoveryHours: 96, label: 'Cvadriceps' },
  hamstring:   { recoveryHours: 96, label: 'Ischiogambieri' },
  glute:       { recoveryHours: 72, label: 'Fese' },
  calf:        { recoveryHours: 48, label: 'Gamba' },
};

// The `core` secondary token (loaded compounds below) is NOT a MUSCLE_HEADS
// bench — it decays at getMuscleState's default 48h rate and aggregates into the
// Big-11 `core` recovery group (GROUP_HEAD_MAP_BIG11.core = ['core']). Added to
// the squat/hinge/OHP/row patterns where the trunk braces isometrically, so the
// Recovery body map's Core group reflects a heavy compound day instead of
// reading 'recovered' forever.
export const EXERCISE_MUSCLES = {
  'Incline DB Press':       { primary: ['chest_upper'], secondary: ['delt_front','tri_lateral'] },
  'Flat DB Press':          { primary: ['chest_mid'], secondary: ['delt_front','tri_lateral'] },
  'Pec Deck / Cable Fly':   { primary: ['chest_mid','chest_upper'], secondary: [] },
  'Cable Fly':              { primary: ['chest_mid','chest_upper'], secondary: [] },
  'Incline DB Press pump':  { primary: ['chest_upper'], secondary: ['delt_front','tri_lateral'] },
  'DB Shoulder Press':      { primary: ['delt_front','delt_mid'], secondary: ['tri_lateral','core'] },
  'Lateral Raises':         { primary: ['delt_mid'], secondary: [] },
  'Lateral Raises (cable)': { primary: ['delt_mid'], secondary: [] },
  'Rear Delt Fly':          { primary: ['delt_rear','rear_delt_trap'], secondary: [] },
  'Rear Delt Cable':        { primary: ['delt_rear','rear_delt_trap'], secondary: [] },
  'Face Pulls':             { primary: ['delt_rear','rear_delt_trap'], secondary: [] },
  'Overhead Triceps':       { primary: ['tri_long'], secondary: ['tri_medial'] },
  'Pushdown':               { primary: ['tri_lateral','tri_medial'], secondary: [] },
  'Lat Pulldown':           { primary: ['lat'], secondary: ['bi_long','mid_trap'] },
  'Cable Row':              { primary: ['mid_trap','lat'], secondary: ['bi_short','core'] },
  'Chest-Supported Row':    { primary: ['mid_trap','lat'], secondary: ['bi_short'] },
  'Bayesian Curl':          { primary: ['bi_long'], secondary: [] },
  'Incline DB Curl':        { primary: ['bi_long'], secondary: [] },
  'Cable Curl':             { primary: ['bi_long','bi_short'], secondary: [] },
  'Preacher Curl':          { primary: ['bi_short'], secondary: [] },
  'Hammer Curl':            { primary: ['bi_long'], secondary: ['bi_short'] },
  'Leg Press':              { primary: ['quad','glute'], secondary: ['hamstring','core'] },
  'Leg Extension':          { primary: ['quad'], secondary: [] },
  'Leg Curl':               { primary: ['hamstring'], secondary: [] },
  'Romanian Deadlift':      { primary: ['hamstring','glute'], secondary: ['lower_back','core'] },
  'Calf Raises':            { primary: ['calf'], secondary: [] },
};

// ══ BUILD #5 — per-user LEARNED recovery (F3 spec §5) ════════════════════════
// The FIXED global recoveryHours above are a population prior. Build #5 learns a
// PER-USER per-muscle recovery time-constant from when the user's performance
// (e1RM proxy) on that muscle's lifts actually RETURNS to baseline after a gap,
// sourced from the durable + synced `logs` key (NOT the D107 behavioral log —
// that captures taps, not cross-session performance return; see F3 §5b). Learned
// hours blend toward the global prior with a SLOW EMA and clamp to [0.5x, 2x] of
// the global so a single anomaly barely moves it and a bad constant cannot
// over/under-train a muscle. Flag dp_learned_recovery_v1 (default OFF) -> the
// globals -> byte-identical.

export const RECOVERY_CONSTANTS_KEY = 'dp-recovery-constants';
export const RECOVERY_EMA_ALPHA = 0.3;     // slow EMA (mirrors dp.js calibration alpha)
export const RECOVERY_CLAMP_LO = 0.5;      // learned hours floored at 0.5x the global
export const RECOVERY_CLAMP_HI = 2.0;      // ceiled at 2x the global
const RECOVERY_R_CAP = 12;                 // saturate effective reps (same as e1RM #1)
const RECOVERY_MIN_GAPS = 3;               // need >=3 observed return-gaps to learn

// Inline RIR-corrected Epley (kept local to avoid a dp.js <-> muscleMap import
// cycle). Mirrors DP.e1RMForSet: usor 6.5 -> RIR 3, potrivit 7.5 -> 1, greu 8.5 -> 0.
/** @param {number} w @param {number} reps @param {number} [rpe] @returns {number|null} */
function _recoveryE1RM(w, reps, rpe) {
  const W = Number(w);
  const R = typeof reps === 'string' ? parseInt(reps, 10) : Number(reps);
  if (!Number.isFinite(W) || W <= 0 || !Number.isFinite(R) || R <= 0) return null;
  const r = Number(rpe);
  const rir = !Number.isFinite(r) ? 1 : r <= 6.5 ? 3 : r >= 8.5 ? 0 : 1;
  const rEff = Math.min(RECOVERY_R_CAP, R + rir);
  return W * (1 + rEff / 30);
}

/**
 * Learn a per-muscle recovery time-constant (hours) from the user's logs.
 * For each muscle, walk that muscle's primary-lift sessions chronologically and
 * collect the inter-session GAP (hours) on the sessions where performance had
 * RETURNED — the session's best e1RM is at/above the rolling baseline (the user
 * was recovered when they re-loaded). The learned constant is the median of those
 * return-gaps, EMA-blended toward the global prior, clamped to [0.5x, 2x]. Muscles
 * with fewer than RECOVERY_MIN_GAPS observations are left to the global prior
 * (absent from the returned map). PURE — no DB, no clock.
 *
 * @param {MuscleLog[]} logs
 * @param {Record<string, {hours:number, n:number}>} [prior] existing learned
 *   constants to EMA-continue (the persisted `dp-recovery-constants`); absent ->
 *   seed from the global prior.
 * @param {number} [bwTrendFactor] F6c #21 — a sustained bodyweight-trend nudge on the
 *   learned recovery (a cut → > 1 longer recovery, a surplus → < 1 shorter). Applied
 *   to the EMA-blended hours BEFORE the existing [0.5x, 2x] clamp (REUSE the band —
 *   no new clamp). Default 1 (no nudge) → byte-identical. Gated by the caller behind
 *   dp_strength_bw_ratio_v1.
 * @returns {Record<string, {hours:number, n:number}>}
 */
export function learnRecovery(logs, prior, bwTrendFactor) {
  const bwF = Number.isFinite(bwTrendFactor) && bwTrendFactor > 0 ? bwTrendFactor : 1;
  /** @type {Record<string, {hours:number, n:number}>} */
  const out = {};
  const rows = (logs || []).filter(l => !l.baseline && l.ex && l.w);
  // Group the best per-session e1RM per muscle (keyed by calendar day).
  /** @type {Record<string, Map<number, {ts:number, best:number}>>} */
  const perMuscle = {};
  for (const l of rows) {
    const ms = (/** @type {Record<string, {primary:string[],secondary:string[]}>} */ (EXERCISE_MUSCLES))[l.ex ?? ''];
    if (!ms) continue;
    const ts = Number(l.ts) || new Date(l.date ?? '').getTime();
    if (!Number.isFinite(ts) || ts <= 0) continue;
    const e = _recoveryE1RM(l.w, /** @type {any} */ (l.reps), l.rpe);
    if (e == null) continue;
    const day = Math.floor(ts / 86400000);
    for (const m of ms.primary) {
      const map = perMuscle[m] || (perMuscle[m] = new Map());
      const cur = map.get(day);
      if (!cur || e > cur.best) map.set(day, { ts, best: e });
    }
  }
  for (const m of Object.keys(perMuscle)) {
    const head = /** @type {Record<string,{recoveryHours:number}>} */ (MUSCLE_HEADS)[m];
    if (!head) continue;
    const global = head.recoveryHours;
    const sessions = [...perMuscle[m].values()].sort((a, b) => a.ts - b.ts);
    if (sessions.length < RECOVERY_MIN_GAPS + 1) continue;
    // Rolling baseline = best-so-far; a session whose best >= baseline means the
    // user was recovered when they re-loaded -> the prior gap was a sufficient
    // recovery window. Collect those gaps.
    const gaps = [];
    let baseline = sessions[0].best;
    for (let i = 1; i < sessions.length; i++) {
      const s = sessions[i];
      const gapH = (s.ts - sessions[i - 1].ts) / MS_PER_HOUR;
      if (gapH > 0 && s.best >= baseline * 0.98) gaps.push(gapH);
      if (s.best > baseline) baseline = s.best;
    }
    if (gaps.length < RECOVERY_MIN_GAPS) continue;
    gaps.sort((a, b) => a - b);
    const mid = Math.floor(gaps.length / 2);
    const observed = gaps.length % 2 ? gaps[mid] : (gaps[mid - 1] + gaps[mid]) / 2;
    // EMA toward the observed return-gap, starting from the existing learned value
    // (or the global prior on first learn). Slow alpha + clamp [0.5x, 2x].
    const start = prior && prior[m] && Number.isFinite(prior[m].hours) ? prior[m].hours : global;
    let blended = start + RECOVERY_EMA_ALPHA * (observed - start);
    // F6c #21 — bodyweight-trend nudge (cut → slower recovery, surplus → faster),
    // applied BEFORE the clamp so the existing [0.5x, 2x] band still bounds it
    // (no new clamp). bwF === 1 (default / flag OFF) → no change → byte-identical.
    blended *= bwF;
    blended = Math.max(global * RECOVERY_CLAMP_LO, Math.min(global * RECOVERY_CLAMP_HI, blended));
    const n = (prior && prior[m] && Number.isFinite(prior[m].n) ? prior[m].n : 0) + 1;
    out[m] = { hours: Math.round(blended), n };
  }
  return out;
}

// ── F6c #21 — bodyweight-trend → recovery nudge factor ──────────────────────
// UNVERIFIED DESIGN PROPOSAL (spec §9): how far a sustained cut/surplus shifts the
// learned recovery. Conservative, single-step magnitudes — the slow EMA + the
// existing [0.5x, 2x] clamp keep it bounded. Daniel sanity-check before flip.
export const BW_RECOVERY_CUT_FACTOR = 1.15;     // a cut → ~15% longer recovery
export const BW_RECOVERY_SURPLUS_FACTOR = 0.90; // a surplus → ~10% shorter recovery
const BW_TREND_MIN_FRACTION = 0.005;            // >=0.5% bodyweight move = a real trend

/**
 * Bodyweight-trend recovery nudge factor for the learned-recovery EMA. A sustained
 * DEFICIT (a CUT phase confirmed by a falling bodyweight series) slows recovery
 * (factor > 1); a sustained SURPLUS (a BULK phase + a rising series) speeds it
 * (< 1); anything ambiguous → 1 (no nudge → byte-identical). REQUIRES BOTH the phase
 * token AND a confirming bodyweight move (phase alone, e.g. a brand-new CUT with no
 * weight change yet, does not nudge). PURE — the phase token is passed in (no
 * nutrition import).
 *
 * @param {Record<string, number>|null|undefined} weightsSeries date→kg map (the `weights` key)
 * @param {string|null|undefined} phase resolveActivePhase token (CUT|BULK|MAINTENANCE|STRENGTH)
 * @returns {number} the recovery factor (1 = no nudge)
 */
export function bodyweightTrendRecoveryFactor(weightsSeries, phase) {
  if (phase !== 'CUT' && phase !== 'BULK') return 1;
  if (!weightsSeries || typeof weightsSeries !== 'object') return 1;
  const dates = Object.keys(weightsSeries).sort((a, b) => a.localeCompare(b));
  if (dates.length < 2) return 1;
  const first = Number(weightsSeries[dates[0]]);
  const last = Number(weightsSeries[dates[dates.length - 1]]);
  if (!Number.isFinite(first) || first <= 0 || !Number.isFinite(last) || last <= 0) return 1;
  const change = (last - first) / first; // signed fraction of bodyweight
  if (phase === 'CUT' && change <= -BW_TREND_MIN_FRACTION) return BW_RECOVERY_CUT_FACTOR;
  if (phase === 'BULK' && change >= BW_TREND_MIN_FRACTION) return BW_RECOVERY_SURPLUS_FACTOR;
  return 1; // phase + series disagree (or move too small) → no nudge
}

/**
 * Flag-gated read of the persisted learned recovery constants as a flat
 * {muscle: hours} map. OFF or empty -> null -> getMuscleState uses the globals.
 * @returns {Record<string, number>|null}
 */
function _learnedRecoveryHours() {
  if (!isEnabled('dp_learned_recovery_v1')) return null;
  const raw = /** @type {any} */ (DB.get(RECOVERY_CONSTANTS_KEY));
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  /** @type {Record<string, number>} */
  const out = {};
  for (const m of Object.keys(raw)) {
    const h = Number(raw[m] && raw[m].hours);
    if (Number.isFinite(h) && h > 0) out[m] = h;
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Persist freshly-learned recovery constants (quota-guarded). Merges over any
 * existing key. Returns the DB.set result. Reserved for a single authoritative
 * per-session write site.
 * @param {Record<string, {hours:number, n:number}>} learned
 * @returns {{ok:boolean, error?:string}}
 */
export function saveRecoveryConstants(learned) {
  if (!learned || typeof learned !== 'object') return { ok: false, error: 'bad_input' };
  const existing = /** @type {any} */ (DB.get(RECOVERY_CONSTANTS_KEY)) || {};
  const merged = (existing && typeof existing === 'object' && !Array.isArray(existing)) ? { ...existing } : {};
  for (const m of Object.keys(learned)) merged[m] = learned[m];
  const res = DB.set(RECOVERY_CONSTANTS_KEY, merged);
  return res && res.ok === false ? res : { ok: true };
}

/**
 * @typedef {{ baseline?: boolean, ex?: string, w?: number, ts?: number, date?: string, rpe?: number, [k: string]: unknown }} MuscleLog
 *
 * @param {MuscleLog[]} logs
 * @param {number} [now] — reference timestamp for time-decay (default Date.now);
 *   inject for deterministic testing. Decay math unchanged.
 * @param {Record<string, number>|null} [learnedHours] — per-muscle learned recovery
 *   hours override. Omitted → flag-gated read of `dp-recovery-constants` (OFF →
 *   null → the global MUSCLE_HEADS recoveryHours → byte-identical legacy).
 * @returns {Record<string, number>}
 */
export function getMuscleState(logs, now = Date.now(), learnedHours) {
  /** @type {Record<string, number>} */
  const state = {};
  Object.keys(MUSCLE_HEADS).forEach(m => { state[m] = 0; });

  // recoveryHours_user[m] ?? MUSCLE_HEADS[m].recoveryHours (F3 §5c). When no
  // override is passed, resolve the flag-gated learned map (OFF → null → globals).
  const learned = learnedHours !== undefined ? learnedHours : _learnedRecoveryHours();
  const recovHoursFor = (/** @type {string} */ m) =>
    (learned && Number.isFinite(learned[m]) && learned[m] > 0
      ? learned[m]
      : (/** @type {Record<string, { recoveryHours: number, label: string }>} */ (MUSCLE_HEADS))[m]?.recoveryHours) || 48;

  const recentLogs = (logs || []).filter(l => !l.baseline && l.ex && l.w);
  recentLogs.forEach(l => {
    const ms = (/** @type {Record<string, { primary: string[], secondary: string[] }>} */ (EXERCISE_MUSCLES))[l.ex ?? ''];
    if (!ms) return;
    const logTime = l.ts || new Date(l.date ?? '').getTime();
    const rpeContrib = l.rpe ? Math.min(l.rpe / 10, 1) : 0.7;
    ms.primary.forEach(/** @param {string} m */ (m) => {
      const recovH = recovHoursFor(m);
      const hoursAgo = (now - logTime) / MS_PER_HOUR;
      const decay = Math.exp(-hoursAgo / recovH);
      state[m] = Math.min(100, (state[m] ?? 0) + 15 * 1.5 * rpeContrib * decay);
    });
    ms.secondary.forEach(/** @param {string} m */ (m) => {
      const recovH = recovHoursFor(m);
      const hoursAgo = (now - logTime) / MS_PER_HOUR;
      const decay = Math.exp(-hoursAgo / recovH);
      state[m] = Math.min(100, (state[m] ?? 0) + 15 * 1.0 * rpeContrib * decay);
    });
  });

  return state;
}
