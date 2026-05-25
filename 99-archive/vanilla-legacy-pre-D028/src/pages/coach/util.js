import { DB, cleanEx } from '../../db.js';
import { PROG, COMPOUND_EX, TARGET_DATE } from '../../constants.js';
import { state } from '../../state.js';
import { beep } from '../../ui/ui.js';

export function isInCutPhase() {
  const phase = DB.get('phase-override') || 'AUTO';
  return phase === 'CUT' || (phase === 'AUTO' && new Date() < TARGET_DATE);
}

export function formatSetsReps(rawStr, exName, isInCut) {
  if (!isInCut || !rawStr || COMPOUND_EX.includes(exName)) return rawStr;
  const m = rawStr.match(/^(\d+)×(\d+)(?:–(\d+))?(.*)$/u);
  if (!m) return rawStr;
  const sets = m[1];
  const rMin = parseInt(m[2]);
  const rMax = m[3] ? parseInt(m[3]) : rMin;
  const suffix = m[4] || '';
  if (rMax <= 10 || rMax > 15) return rawStr;
  return `${sets}×${Math.min(rMin, 10)}${suffix}`;
}

export function getGroupColor(g) {
  const c = {spate:'#4fc3f7',piept:'#ffd54f',umeri:'#ffb74d',brate:'#a1887f',picioare:'#81c784',triceps:'#e0e0e0'};
  return c[g] || 'var(--text3)';
}

export function getExGroup(ex) {
  const g = {
    spate:['Lat Pulldown','Cable Row','Chest-Supported Row','Face Pulls'],
    piept:['Incline DB Press','Flat DB Press','Pec Deck / Cable Fly'],
    umeri:['DB Shoulder Press','Lateral Raises','Rear Delt Fly'],
    brate:['Incline DB Curl','Bayesian Curl','Cable Curl','Preacher Curl'],
    triceps:['Overhead Triceps','Pushdown'],
    picioare:['Romanian Deadlift','Leg Press','Leg Curl','Leg Extension','Calf Raises']
  };
  for (const [grp, exs] of Object.entries(g)) { if (exs.some(e => ex.includes(e))) return grp.toUpperCase(); }
  return 'EXERCITIU';
}

export function getDisplayTime(prog) {
  if (!prog) return null;
  const adaptive = getAdaptiveTime(prog.day);
  if (adaptive) return `~${adaptive} min`;
  const accurate = calcAccurateTime(prog);
  if (accurate) return `~${accurate} min`;
  if (prog.tm) return prog.tm.includes('min') ? prog.tm : `~${prog.tm}`;
  return null;
}

export function calcAccurateTime(prog) {
  if (!prog || !prog.ex || prog.ex.length === 0) return null;
  const COMPOUND_EX_LIST = ['Lat Pulldown','Cable Row','Incline DB Press',
    'DB Shoulder Press','Flat DB Press','Chest-Supported Row','Romanian Deadlift',
    'Leg Press','RDL'];
  let totalSeconds = 0;
  prog.ex.forEach(ex => {
    const isCompound = COMPOUND_EX_LIST.some(c => ex.n && ex.n.includes(c.split(' ')[0]));
    const setsMatch = ex.s ? ex.s.match(/^(\d+)/) : null;
    const sets = setsMatch ? parseInt(setsMatch[1]) : 3;
    const setTime = isCompound ? 45 : 30;
    const restTime = isCompound ? 180 : 90;
    const exTime = sets * setTime + (sets - 1) * restTime + 30;
    totalSeconds += exTime;
  });
  totalSeconds += 8 * 60;
  return Math.round(totalSeconds / 60);
}

export function getAdaptiveTime(dayLabel) {
  const burns = DB.get('session-burns') || [];
  const dayBurns = burns.filter(b => b.day === dayLabel && b.mins > 10).slice(0, 5);
  if (dayBurns.length < 3) return null;
  const avg = Math.round(dayBurns.reduce((a, b) => a + b.mins, 0) / dayBurns.length);
  return avg;
}

export function getTodayExercises() {
  const dayMap = [6,0,1,2,3,4,5];
  const tp = PROG[dayMap[new Date().getDay()]];
  if (!tp || tp.t === 'off' || !tp.ex) return [];
  const unavail = DB.get('unavailable-equipment') || [];
  let exList = tp.ex.map(e => cleanEx(e.n || '')).filter(ex => !unavail.includes(ex));
  return exList;
}

export function beepStart() { if (typeof beep === 'function') beep(660, 0.1); }
export function resetNotes() { state.activeNotes.clear(); }
