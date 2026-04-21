// ══ CONSTANTS ══════════════════════════════════════════════

export const SW_KG = 111.4, TW_KG = 101.5;
export const START_DATE = new Date('2026-04-17');
export const TARGET_DATE = new Date('2026-07-20');
export const DTOT = Math.round((TARGET_DATE - START_DATE) / 86400000);
export const KCAL_TARGET = 1800;
export const PROT_TARGET = 180;
export const PAUSE_COMPOUND = 120, PAUSE_ISO = 75;

export const COMPOUND_EX = [
  'DB Shoulder Press','Incline DB Press','Flat DB Press','Flat Barbell Bench',
  'Lat Pulldown','Cable Row','Chest-Supported Row','Romanian Deadlift','Leg Press'
];

export const EX_SETS = {
  'DB Shoulder Press':4,'Incline DB Press':4,'Flat DB Press':3,'Lat Pulldown':4,
  'Cable Row':3,'Chest-Supported Row':2,'Romanian Deadlift':3,'Leg Press':3,
  'Lateral Raises':4,'Rear Delt Fly':4,'Face Pulls':3,'Incline DB Curl':3,
  'Bayesian Curl':3,'Cable Curl':3,'Preacher Curl':3,'Overhead Triceps':3,
  'Pushdown':3,'Pec Deck / Cable Fly':3,'Leg Curl':3,'Leg Extension':3,'Calf Raises':4
};

export const EX_REPS = {
  'DB Shoulder Press':'6–10','Incline DB Press':'6–10','Flat DB Press':'8–12',
  'Lat Pulldown':'8–12','Cable Row':'8–12','Chest-Supported Row':'10–12',
  'Romanian Deadlift':'8–12','Leg Press':'15–20','Lateral Raises':'12–15',
  'Rear Delt Fly':'12–15','Face Pulls':'15–20','Incline DB Curl':'10–12',
  'Bayesian Curl':'10–12','Cable Curl':'10–12','Preacher Curl':'10–12',
  'Overhead Triceps':'10–12','Pushdown':'10–12','Pec Deck / Cable Fly':'12–15',
  'Leg Curl':'15–20','Leg Extension':'15–20','Calf Raises':'15–20'
};

export const PROG = [
  {day:'Luni',t:'off',lb:'OFF',tm:null,ex:[]},
  {day:'Marți',t:'free',lb:'PULL · Spate + Biceps',tm:'~75 min',ex:[
    {n:'Lat Pulldown',s:'4×8–12',g:'spate'},{n:'Cable Row',s:'3×8–12',g:'spate'},
    {n:'Face Pulls',s:'3×15–20',g:'umeri'},{n:'Incline DB Curl',s:'3×10–12',g:'brate'},
    {n:'Bayesian Curl',s:'3×10–12',g:'brate'}
  ]},
  {day:'Miercuri',t:'lim',lb:'PUSH · Umeri + Piept',tm:'MAX 65 MIN',ex:[
    {n:'DB Shoulder Press',s:'3×6–10',g:'umeri'},{n:'Incline DB Press',s:'4×6–10',g:'piept'},
    {n:'Pec Deck / Cable Fly',s:'3×12–15',g:'piept'},{n:'Lateral Raises (cable)',s:'3×12–15',g:'umeri'},
    {n:'Overhead Triceps',s:'3×10–12',g:'triceps'},{n:'Pushdown',s:'3×12',g:'triceps'}
  ]},
  {day:'Joi',t:'lim',lb:'UMERI COMPLET + BRAȚE',tm:'MAX 65 MIN',ex:[
    {n:'Lateral Raises + drop',s:'4×12–15',g:'umeri'},{n:'Rear Delt Fly',s:'4×12–15',g:'umeri'},
    {n:'Cable Curl',s:'3×10–12',g:'brate'},{n:'Preacher Curl',s:'3×10–12',g:'brate'},
    {n:'Overhead Triceps',s:'3×10–12',g:'triceps'},{n:'Pushdown',s:'2×12',g:'triceps'}
  ]},
  {day:'Vineri',t:'free',lb:'UPPER PUMP + PICIOARE',tm:'~90 min',ex:[
    {n:'Incline DB Press pump',s:'3×12–15',g:'piept'},{n:'Cable Fly',s:'2×15',g:'piept'},
    {n:'Lateral Raises',s:'4×15–20',g:'umeri'},{n:'Rear Delt Cable',s:'2×15–20',g:'umeri'},
    {n:'Leg Press',s:'3×15–20',g:'picioare'},{n:'Romanian Deadlift',s:'3×12–15',g:'picioare'},
    {n:'Leg Curl',s:'3×15–20',g:'picioare'},{n:'Leg Extension',s:'3×15–20',g:'picioare'},
    {n:'Calf Raises',s:'4×15–20',g:'picioare'}
  ]},
  {day:'Sâmbătă',t:'free',lb:'FULL UPPER',tm:'~110 min',ex:[
    {n:'DB Shoulder Press',s:'4×6–10',g:'umeri'},{n:'Incline DB Press',s:'3×6–10',g:'piept'},
    {n:'Flat DB Press',s:'3×8–12',g:'piept'},{n:'Pec Deck / Cable Fly',s:'2×12–15',g:'piept'},
    {n:'Lat Pulldown',s:'3×8–12',g:'spate'},{n:'Cable Row',s:'3×8–12',g:'spate'},
    {n:'Chest-Supported Row',s:'2×10–12',g:'spate'},{n:'Lateral Raises (cable)',s:'4×12–15+drop',g:'umeri'},
    {n:'Rear Delt Fly',s:'3×12–15',g:'umeri'},{n:'Incline DB Curl',s:'3×10–12',g:'brate'},
    {n:'Overhead Triceps',s:'3×10–12',g:'triceps'}
  ]},
  {day:'Duminică',t:'off',lb:'OFF COMPLET',tm:null,ex:[]}
];
