import { MS_PER_HOUR } from '../constants.js';

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

/**
 * @typedef {{ baseline?: boolean, ex?: string, w?: number, ts?: number, date?: string, rpe?: number, [k: string]: unknown }} MuscleLog
 *
 * @param {MuscleLog[]} logs
 * @param {number} [now] — reference timestamp for time-decay (default Date.now);
 *   inject for deterministic testing. Decay math unchanged.
 * @returns {Record<string, number>}
 */
export function getMuscleState(logs, now = Date.now()) {
  /** @type {Record<string, number>} */
  const state = {};
  Object.keys(MUSCLE_HEADS).forEach(m => { state[m] = 0; });

  const recentLogs = (logs || []).filter(l => !l.baseline && l.ex && l.w);
  recentLogs.forEach(l => {
    const ms = (/** @type {Record<string, { primary: string[], secondary: string[] }>} */ (EXERCISE_MUSCLES))[l.ex ?? ''];
    if (!ms) return;
    const logTime = l.ts || new Date(l.date ?? '').getTime();
    const rpeContrib = l.rpe ? Math.min(l.rpe / 10, 1) : 0.7;
    ms.primary.forEach(/** @param {string} m */ (m) => {
      const recovH = (/** @type {Record<string, { recoveryHours: number, label: string }>} */ (MUSCLE_HEADS))[m]?.recoveryHours || 48;
      const hoursAgo = (now - logTime) / MS_PER_HOUR;
      const decay = Math.exp(-hoursAgo / recovH);
      state[m] = Math.min(100, (state[m] ?? 0) + 15 * 1.5 * rpeContrib * decay);
    });
    ms.secondary.forEach(/** @param {string} m */ (m) => {
      const recovH = (/** @type {Record<string, { recoveryHours: number, label: string }>} */ (MUSCLE_HEADS))[m]?.recoveryHours || 48;
      const hoursAgo = (now - logTime) / MS_PER_HOUR;
      const decay = Math.exp(-hoursAgo / recovH);
      state[m] = Math.min(100, (state[m] ?? 0) + 15 * 1.0 * rpeContrib * decay);
    });
  });

  return state;
}
