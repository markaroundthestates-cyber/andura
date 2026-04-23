export const MUSCLE_HEADS = {
  chest_upper: { recoveryHours: 60, label: 'Piept sus' },
  chest_mid:   { recoveryHours: 60, label: 'Piept mijloc' },
  chest_lower: { recoveryHours: 60, label: 'Piept jos' },
  delt_front:  { recoveryHours: 48, label: 'Umăr față' },
  delt_mid:    { recoveryHours: 48, label: 'Umăr lateral' },
  delt_rear:   { recoveryHours: 48, label: 'Umăr spate' },
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
  calf:        { recoveryHours: 48, label: 'Gambă' },
};

export const EXERCISE_MUSCLES = {
  'Incline DB Press':       { primary: ['chest_upper'], secondary: ['delt_front','tri_lateral'] },
  'Flat DB Press':          { primary: ['chest_mid'], secondary: ['delt_front','tri_lateral'] },
  'Pec Deck / Cable Fly':   { primary: ['chest_mid','chest_upper'], secondary: [] },
  'Cable Fly':              { primary: ['chest_mid','chest_upper'], secondary: [] },
  'Incline DB Press pump':  { primary: ['chest_upper'], secondary: ['delt_front','tri_lateral'] },
  'DB Shoulder Press':      { primary: ['delt_front','delt_mid'], secondary: ['tri_lateral'] },
  'Lateral Raises':         { primary: ['delt_mid'], secondary: [] },
  'Lateral Raises (cable)': { primary: ['delt_mid'], secondary: [] },
  'Rear Delt Fly':          { primary: ['delt_rear','rear_delt_trap'], secondary: [] },
  'Rear Delt Cable':        { primary: ['delt_rear','rear_delt_trap'], secondary: [] },
  'Face Pulls':             { primary: ['delt_rear','rear_delt_trap'], secondary: [] },
  'Overhead Triceps':       { primary: ['tri_long'], secondary: ['tri_medial'] },
  'Pushdown':               { primary: ['tri_lateral','tri_medial'], secondary: [] },
  'Lat Pulldown':           { primary: ['lat'], secondary: ['bi_long','mid_trap'] },
  'Cable Row':              { primary: ['mid_trap','lat'], secondary: ['bi_short'] },
  'Chest-Supported Row':    { primary: ['mid_trap','lat'], secondary: ['bi_short'] },
  'Bayesian Curl':          { primary: ['bi_long'], secondary: [] },
  'Incline DB Curl':        { primary: ['bi_long'], secondary: [] },
  'Cable Curl':             { primary: ['bi_long','bi_short'], secondary: [] },
  'Preacher Curl':          { primary: ['bi_short'], secondary: [] },
  'Hammer Curl':            { primary: ['bi_long'], secondary: ['bi_short'] },
  'Leg Press':              { primary: ['quad','glute'], secondary: ['hamstring'] },
  'Leg Extension':          { primary: ['quad'], secondary: [] },
  'Leg Curl':               { primary: ['hamstring'], secondary: [] },
  'Romanian Deadlift':      { primary: ['hamstring','glute'], secondary: ['lower_back'] },
  'Calf Raises':            { primary: ['calf'], secondary: [] },
};

export const VOLUME_LANDMARKS = {
  delt_mid:    { MEV: 6,  MAV: 16, MRV: 26 },
  chest_upper: { MEV: 4,  MAV: 12, MRV: 20 },
  chest_mid:   { MEV: 4,  MAV: 12, MRV: 20 },
  lat:         { MEV: 4,  MAV: 12, MRV: 20 },
  tri_long:    { MEV: 4,  MAV: 10, MRV: 18 },
  tri_lateral: { MEV: 4,  MAV: 10, MRV: 18 },
  bi_long:     { MEV: 4,  MAV: 10, MRV: 20 },
  bi_short:    { MEV: 2,  MAV:  8, MRV: 16 },
  delt_rear:   { MEV: 4,  MAV: 12, MRV: 20 },
  quad:        { MEV: 4,  MAV: 12, MRV: 20 },
  hamstring:   { MEV: 4,  MAV: 10, MRV: 16 },
  glute:       { MEV: 4,  MAV: 10, MRV: 16 },
  mid_trap:    { MEV: 4,  MAV: 12, MRV: 20 },
};

export function getMuscleState(logs) {
  const now = Date.now();
  const state = {};
  Object.keys(MUSCLE_HEADS).forEach(m => { state[m] = 0; });

  const recentLogs = (logs || []).filter(l => !l.baseline && l.ex && l.w);
  recentLogs.forEach(l => {
    const ms = EXERCISE_MUSCLES[l.ex];
    if (!ms) return;
    const logTime = l.ts || new Date(l.date).getTime();
    const rpeContrib = l.rpe ? Math.min(l.rpe / 10, 1) : 0.7;
    ms.primary.forEach(m => {
      const recovH = MUSCLE_HEADS[m]?.recoveryHours || 48;
      const hoursAgo = (now - logTime) / 3600000;
      const decay = Math.exp(-hoursAgo / recovH);
      state[m] = Math.min(100, state[m] + 15 * 1.5 * rpeContrib * decay);
    });
    ms.secondary.forEach(m => {
      const recovH = MUSCLE_HEADS[m]?.recoveryHours || 48;
      const hoursAgo = (now - logTime) / 3600000;
      const decay = Math.exp(-hoursAgo / recovH);
      state[m] = Math.min(100, state[m] + 15 * 1.0 * rpeContrib * decay);
    });
  });

  return state;
}

export function getWeeklyVolume(logs, days = 7) {
  const cutoff = Date.now() - days * 86400000;
  const vol = {};
  Object.keys(MUSCLE_HEADS).forEach(m => { vol[m] = 0; });
  (logs || []).filter(l => !l.baseline && l.ex && l.w && (l.ts || new Date(l.date).getTime()) > cutoff).forEach(l => {
    const ms = EXERCISE_MUSCLES[l.ex];
    if (!ms) return;
    ms.primary.forEach(m => { vol[m] = (vol[m] || 0) + 1; });
    ms.secondary.forEach(m => { vol[m] = (vol[m] || 0) + 0.5; });
  });
  return vol;
}

export function getMuscleBalance(logs) {
  const vol = getWeeklyVolume(logs, 14);
  const alerts = [];
  const pairs = [
    ['tri_long', 'tri_lateral', 'Triceps lung vs lateral'],
    ['bi_long',  'bi_short',    'Biceps lung vs scurt'],
    ['delt_mid', 'delt_rear',   'Umăr lateral vs spate'],
    ['chest_upper','chest_mid', 'Piept sus vs mijloc'],
  ];
  pairs.forEach(([a, b, label]) => {
    const va = vol[a] || 0, vb = vol[b] || 0;
    const total = va + vb;
    if (total < 4) return;
    if (va > 0 && vb > 0 && Math.abs(va - vb) / Math.max(va, vb) > 0.4) {
      const dominant = va > vb ? MUSCLE_HEADS[a]?.label : MUSCLE_HEADS[b]?.label;
      const lagging  = va > vb ? MUSCLE_HEADS[b]?.label : MUSCLE_HEADS[a]?.label;
      alerts.push({ a, b, label, dominant, lagging, volA: va, volB: vb });
    }
  });
  return alerts;
}
