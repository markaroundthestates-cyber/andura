// ══ INJECT BASELINE + MFP ════════════════════════════════════
import { DB, tod } from './db.js';


export function injectBaseline() {
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
    {date:baseDate,ex:'Lateral Raises + drop',w:10,sets:1,reps:'12',rpe:8,ts:t-160000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lateral Raises + drop',w:10,sets:1,reps:'12',rpe:8,ts:t-161000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lateral Raises + drop',w:10,sets:1,reps:'12',rpe:8,ts:t-162000,session:t-86400000,baseline:true},
    {date:baseDate,ex:'Lateral Raises + drop',w:10,sets:1,reps:'12',rpe:8,ts:t-163000,session:t-86400000,baseline:true},
  ];
  
  DB.set('logs', baseline);
  DB.set('onboarding-done', true);
  console.log('✓ Baseline Daniel injectat:', baseline.length, 'seturi');
}

export function injectMFPWeights() {
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
  console.log('✓ MFP weight history injected');
}
