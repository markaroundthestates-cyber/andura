// ══ INJECT BASELINE + MFP ════════════════════════════════════
import { DB, tod } from './db.js';


export function injectBaseline() {
  if (localStorage.getItem('DEV_INJECT_BASELINE') !== 'true') return;
  const existing = DB.get('logs') || [];
  // Only skip if we have REAL training data (not just baseline)
  const hasRealData = existing.some(l => !l.baseline);
  const hasBaseline = existing.some(l => l.baseline);
  if (hasRealData || hasBaseline) return; // already has data
  
  const t = Date.now();
  const d = new Date(); d.setDate(d.getDate() - 3);
  const baseDate = d.toISOString().split('T')[0];
  const logs = [];
  
  const baseline = [
    {date:baseDate,ex:'Lat Pulldown',w:64,sets:1,reps:'8',rpe:8,ts:t-0,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lat Pulldown',w:64,sets:1,reps:'8',rpe:8,ts:t-1000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lat Pulldown',w:64,sets:1,reps:'8',rpe:8,ts:t-2000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lat Pulldown',w:64,sets:1,reps:'8',rpe:8,ts:t-3000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Cable Row',w:72,sets:1,reps:'8',rpe:7,ts:t-10000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Cable Row',w:72,sets:1,reps:'8',rpe:7,ts:t-11000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Cable Row',w:72,sets:1,reps:'8',rpe:7,ts:t-12000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Face Pulls',w:41,sets:1,reps:'8',rpe:6,ts:t-20000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Face Pulls',w:41,sets:1,reps:'8',rpe:6,ts:t-21000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Face Pulls',w:41,sets:1,reps:'8',rpe:6,ts:t-22000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Incline DB Curl',w:10,sets:1,reps:'10',rpe:7,ts:t-30000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Incline DB Curl',w:10,sets:1,reps:'10',rpe:7,ts:t-31000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Incline DB Curl',w:10,sets:1,reps:'10',rpe:7,ts:t-32000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Bayesian Curl',w:18,sets:1,reps:'10',rpe:8,ts:t-40000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Bayesian Curl',w:18,sets:1,reps:'10',rpe:8,ts:t-41000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Bayesian Curl',w:18,sets:1,reps:'10',rpe:8,ts:t-42000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'DB Shoulder Press',w:20,sets:1,reps:'8',rpe:7,ts:t-50000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'DB Shoulder Press',w:20,sets:1,reps:'8',rpe:7,ts:t-51000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'DB Shoulder Press',w:20,sets:1,reps:'8',rpe:7,ts:t-52000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lateral Raises',w:10,sets:1,reps:'10',rpe:8,ts:t-60000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lateral Raises',w:10,sets:1,reps:'10',rpe:8,ts:t-61000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lateral Raises',w:10,sets:1,reps:'10',rpe:8,ts:t-62000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lateral Raises',w:10,sets:1,reps:'10',rpe:8,ts:t-63000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Rear Delt Fly',w:9,sets:1,reps:'10',rpe:7,ts:t-70000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Rear Delt Fly',w:9,sets:1,reps:'10',rpe:7,ts:t-71000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Rear Delt Fly',w:9,sets:1,reps:'10',rpe:7,ts:t-72000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Rear Delt Fly',w:9,sets:1,reps:'10',rpe:7,ts:t-73000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Incline DB Press',w:30,sets:1,reps:'8',rpe:8,ts:t-80000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Incline DB Press',w:30,sets:1,reps:'8',rpe:8,ts:t-81000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Incline DB Press',w:30,sets:1,reps:'8',rpe:8,ts:t-82000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Incline DB Press',w:30,sets:1,reps:'8',rpe:8,ts:t-83000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Pec Deck / Cable Fly',w:32,sets:1,reps:'10',rpe:7,ts:t-90000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Pec Deck / Cable Fly',w:32,sets:1,reps:'10',rpe:7,ts:t-91000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Pec Deck / Cable Fly',w:32,sets:1,reps:'10',rpe:7,ts:t-92000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Overhead Triceps',w:41,sets:1,reps:'10',rpe:7,ts:t-100000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Overhead Triceps',w:41,sets:1,reps:'10',rpe:7,ts:t-101000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Overhead Triceps',w:41,sets:1,reps:'10',rpe:7,ts:t-102000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Pushdown',w:41,sets:1,reps:'10',rpe:7,ts:t-110000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Pushdown',w:41,sets:1,reps:'10',rpe:7,ts:t-111000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Pushdown',w:41,sets:1,reps:'10',rpe:7,ts:t-112000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Pushdown',w:41,sets:1,reps:'10',rpe:7,ts:t-120000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Pushdown',w:41,sets:1,reps:'10',rpe:7,ts:t-121000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Leg Press',w:150,sets:1,reps:'12',rpe:4,ts:t-130000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Leg Press',w:150,sets:1,reps:'12',rpe:4,ts:t-131000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Leg Press',w:150,sets:1,reps:'12',rpe:4,ts:t-132000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Leg Extension',w:100,sets:1,reps:'10',rpe:8,ts:t-140000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Leg Extension',w:100,sets:1,reps:'10',rpe:8,ts:t-141000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Leg Extension',w:100,sets:1,reps:'10',rpe:8,ts:t-142000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Leg Curl',w:100,sets:1,reps:'10',rpe:7,ts:t-150000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Leg Curl',w:100,sets:1,reps:'10',rpe:7,ts:t-151000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Leg Curl',w:100,sets:1,reps:'10',rpe:7,ts:t-152000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lateral Raises',w:10,sets:1,reps:'12',rpe:8,ts:t-160000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lateral Raises',w:10,sets:1,reps:'12',rpe:8,ts:t-161000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lateral Raises',w:10,sets:1,reps:'12',rpe:8,ts:t-162000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lateral Raises',w:10,sets:1,reps:'12',rpe:8,ts:t-163000,session:t-86400000,baseline:true},
  ];
  
  DB.set('logs', baseline);
  DB.set('onboarding-done', true);
}

export function injectMFPWeights() {
  if (localStorage.getItem('DEV_INJECT_BASELINE') !== 'true') return;
  const ws = DB.get('weights') || {};
  // Only inject if we don't have historical data
  const dates = Object.keys(ws).sort();
  const hasHistory = dates.some(d => d < '2026-04-20');
  if (hasHistory) return;
  
  // Daniel's MFP weight history (from imported CSV)
  const mfpWeights = {
    '2026-04-15': 112.0,
    '2026-04-16': 111.8,
    '2026-04-17': 111.4,
    '2026-04-18': 110.8,
    '2026-04-19': 110.2,
  };
  
  Object.assign(ws, mfpWeights);
  DB.set('weights', ws);
}

export function injectRealSessions() {
  if (localStorage.getItem('DEV_INJECT_BASELINE') !== 'true') return { added: 0, had21: true, had22: true };
  const logs = DB.get('logs') || [];

  // Session timestamps — Apr 21 PULL ~18:00, Apr 22 PUSH ~18:00
  const s21 = new Date('2026-04-21T18:00:00').getTime();
  const s22 = new Date('2026-04-22T18:00:00').getTime();

  const has21 = logs.some(l => l.date === '2026-04-21' && !l.baseline);
  const has22 = logs.some(l => l.date === '2026-04-22' && !l.baseline);

  const newLogs = [];

  if (!has21) {
    // ── PULL DAY — 21 Apr ─────────────────────────────────────
    const pull = [
      // Lat Pulldown — 4 sets
      {ex:'Lat Pulldown',  w:64, reps:'8', rpe:8, set:1},
      {ex:'Lat Pulldown',  w:64, reps:'8', rpe:8, set:2},
      {ex:'Lat Pulldown',  w:64, reps:'8', rpe:8, set:3},
      {ex:'Lat Pulldown',  w:64, reps:'8', rpe:8, set:4},
      // Cable Row — 3 sets
      {ex:'Cable Row',     w:72, reps:'8', rpe:7, set:1},
      {ex:'Cable Row',     w:72, reps:'8', rpe:7, set:2},
      {ex:'Cable Row',     w:72, reps:'8', rpe:7, set:3},
      // Face Pulls — 3 sets
      {ex:'Face Pulls',    w:41, reps:'8', rpe:6, set:1},
      {ex:'Face Pulls',    w:41, reps:'8', rpe:6, set:2},
      {ex:'Face Pulls',    w:41, reps:'8', rpe:6, set:3},
      // Incline DB Curl — 3 sets
      {ex:'Incline DB Curl', w:10, reps:'10', rpe:7, set:1},
      {ex:'Incline DB Curl', w:10, reps:'10', rpe:7, set:2},
      {ex:'Incline DB Curl', w:10, reps:'10', rpe:7, set:3},
      // Bayesian Curl — 3 sets
      {ex:'Bayesian Curl', w:18, reps:'10', rpe:8, set:1},
      {ex:'Bayesian Curl', w:18, reps:'10', rpe:8, set:2},
      {ex:'Bayesian Curl', w:18, reps:'10', rpe:8, set:3},
    ];
    pull.forEach((s, i) => newLogs.push({
      date:'2026-04-21', ex:s.ex, w:s.w, sets:1, reps:s.reps, rpe:s.rpe,
      ts: s21 + i * 3000, session: s21, baseline: false,
    }));
  }

  if (!has22) {
    // ── PUSH DAY — 22 Apr ─────────────────────────────────────
    const push = [
      // DB Shoulder Press — pyramid
      {ex:'DB Shoulder Press', w:20,   reps:'15', rpe:7, set:1, userOverride:true},
      {ex:'DB Shoulder Press', w:22.5, reps:'12', rpe:7, set:2, userOverride:true},
      {ex:'DB Shoulder Press', w:25,   reps:'8',  rpe:8, set:3, userOverride:true},
      // Incline DB Press — 4 sets
      {ex:'Incline DB Press',  w:30, reps:'8', rpe:8, set:1, userOverride:false},
      {ex:'Incline DB Press',  w:30, reps:'7', rpe:9, set:2, userOverride:true},
      {ex:'Incline DB Press',  w:30, reps:'6', rpe:9, set:3, userOverride:true},
      {ex:'Incline DB Press',  w:27.5, reps:'9', rpe:7, set:4, userOverride:true},
      // Pec Deck / Cable Fly
      {ex:'Pec Deck / Cable Fly', w:30, reps:'15', rpe:6, set:1, userOverride:true},
      {ex:'Pec Deck / Cable Fly', w:36, reps:'13', rpe:7, set:2, userOverride:true},
      {ex:'Pec Deck / Cable Fly', w:36, reps:'10', rpe:8, set:3, userOverride:true},
      // Lateral Raises
      {ex:'Lateral Raises', w:10, reps:'8',  rpe:7, set:1, userOverride:false},
      {ex:'Lateral Raises', w:10, reps:'9',  rpe:7, set:2, userOverride:false},
      {ex:'Lateral Raises', w:10, reps:'10', rpe:8, set:3, userOverride:false},
      // Overhead Triceps
      {ex:'Overhead Triceps', w:41, reps:'10', rpe:7, set:1, userOverride:false},
      {ex:'Overhead Triceps', w:41, reps:'9',  rpe:8, set:2, userOverride:false},
      {ex:'Overhead Triceps', w:36, reps:'11', rpe:7, set:3, userOverride:false},
      // Pushdown
      {ex:'Pushdown', w:41, reps:'9',  rpe:8, set:1, userOverride:false},
      {ex:'Pushdown', w:36, reps:'11', rpe:7, set:2, userOverride:false},
      {ex:'Pushdown', w:36, reps:'12', rpe:7, set:3, userOverride:false},
    ];
    push.forEach((s, i) => newLogs.push({
      date:'2026-04-22', ex:s.ex, w:s.w, sets:1, reps:s.reps, rpe:s.rpe,
      ts: s22 + i * 3000, session: s22, baseline: false,
    }));
  }

  if (!newLogs.length) return { added: 0, had21: has21, had22: has22 };

  DB.set('logs', [...logs, ...newLogs]);

  // ── Session burns ─────────────────────────────────────────
  const burns = DB.get('session-burns') || [];
  if (!has21 && !burns.some(b => b.date === '2026-04-21')) {
    burns.push({ date:'2026-04-21', day:'Marți', mins:62, kcal:320, sets:16, startHour:18 });
  }
  if (!has22 && !burns.some(b => b.date === '2026-04-22')) {
    burns.push({ date:'2026-04-22', day:'Miercuri', mins:68, kcal:350, sets:19, startHour:18 });
  }
  DB.set('session-burns', burns);

  return { added: newLogs.length, had21: has21, had22: has22 };
}
