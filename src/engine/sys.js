// ══ SYS ENGINE — TDEE / Phases / BF% ═══════════════════════
import { DB } from '../db.js';
import { SW_KG, TW_KG, START_DATE, TARGET_DATE, KCAL_TARGET } from '../constants.js';
import { getUserConfig } from '../config/user.js';

export const SYS = {
  get HEIGHT() { return getUserConfig().bio.height; },
  get START_KG() { return getUserConfig().bio.startKg; },
  get START_BF() { return getUserConfig().bio.startBF; },
  get AGE() { return getUserConfig().bio.age; },

  getCurrentKg() {
    const ws = DB.get('weights') || {};
    const dates = Object.keys(ws).sort((a,b) => a.localeCompare(b));
    if (!dates.length) return this.START_KG;
    return ws[dates[dates.length-1]];
  },

  getBF() {
    const override = DB.get('bf-override');
    if (override !== null && override !== undefined) return parseFloat(override);

    const kg = this.getCurrentKg();
    const kgLost = this.START_KG - kg;
    // Assume 75% fat loss, 25% muscle (realistic in deficit with training)
    const fatLost = kgLost * 0.75;
    const startFatKg = this.START_KG * (this.START_BF / 100);
    const currentFatKg = Math.max(3, startFatKg - fatLost);
    const calculatedBF = (currentFatKg / kg) * 100;
    return Math.round(Math.max(5, Math.min(45, calculatedBF)) * 10) / 10;
  },

  getLBM() {
    const kg = this.getCurrentKg();
    const bf = this.getBF();
    return Math.round((kg * (1 - bf/100)) * 10) / 10;
  },

  estimateTDEE() {
    const ws = DB.get('weights') || {};
    let dates = Object.keys(ws).sort((a, b) => a.localeCompare(b));

    // Folosește greutăți din momentul schimbării fazei (sau ultimele 14 zile)
    const phaseChangeDate = DB.get('phase-change-date');
    if (phaseChangeDate) {
      const filtered = dates.filter(d => d >= phaseChangeDate);
      if (filtered.length >= 4) dates = filtered;
      // Dacă sunt prea puține date din faza nouă, fallback la ultimele 14 zile
      else dates = dates.slice(-14);
    } else {
      dates = dates.slice(-14);
    }

    if (dates.length < 4) {
      // Katch-McArdle BF-aware preferred when LBM known; Mifflin fallback when BF unknown
      const kg = this.getCurrentKg();
      const bf = this.getBF();
      let bmr;
      if (Number.isFinite(bf)) {
        const lbm = this.getLBM();
        bmr = 370 + 21.6 * lbm;
      } else {
        bmr = 10*kg + 6.25*this.HEIGHT - 5*this.AGE + 5;
      }
      return Math.round(bmr * 1.55);
    }

    const w1 = ws[dates[0]], w2 = ws[dates[dates.length-1]];
    const kgLost = w1 - w2;
    const currentKcal = DB.get('current-kcal') || KCAL_TARGET;
    const daysElapsed = Math.max(1, Math.round((new Date(dates[dates.length-1]) - new Date(dates[0])) / 86400000));
    const dailyDeficit = (kgLost * 7700) / daysElapsed;
    return Math.round(Math.max(KCAL_TARGET, Math.min(3500, currentKcal + dailyDeficit)));
  },

  getPhase() {
    // Override manual bate orice
    const override = DB.get('phase-override');
    if (override) return override;

    const bf = this.getBF();
    const now = new Date();

    // Auto pilot activ: BF + sezon decid faza (regula de bază: BF >15% = niciodată bulk)
    const summerEnd = new Date(now.getFullYear(), 7, 31); // 31 Aug
    const isSummer = now <= summerEnd;
    const isWinter = now.getMonth() >= 9 || now.getMonth() <= 1; // Oct-Feb

    if (bf > 18) return 'CUT';
    if (bf > 15) {
      // Vară cu BF 15-18%: mentenanță sau cut ușor
      if (isSummer) return 'MAINTENANCE';
      return 'CUT';
    }
    // BF 12-15%: cut până la 12%, apoi decide sezon
    if (bf > 12) {
      if (isSummer) return 'MAINTENANCE';
      return 'CUT';
    }
    // BF 10-12%: aproape de target
    if (bf > 10) {
      if (isSummer) return 'MAINTENANCE';
      if (isWinter) return 'BULK';
      return 'CUT';
    }
    // BF <=10%: target atins
    if (isSummer) return 'MAINTENANCE';
    if (isWinter) return 'BULK';
    return 'MAINTENANCE';
  },

  getKcalTarget() {
    const tdee = this.estimateTDEE();

    // Manual phase override → calculează kcal pentru faza respectivă, indiferent de dată
    const phaseOverride = DB.get('phase-override');
    if (phaseOverride && phaseOverride !== 'AUTO') {
      switch(phaseOverride) {
        case 'CUT':         return Math.round(tdee * 0.82);
        case 'BULK':        return Math.round(tdee * 1.08);
        case 'MAINTENANCE': return tdee;
        case 'STRENGTH':    return Math.round(tdee * 1.05);
      }
    }

    // AUTO: derive faza din BF + sezon, apoi aplică multiplicator pe TDEE
    const phase = this.getPhase();
    switch(phase) {
      case 'CUT':         return Math.round(tdee * 0.82);
      case 'BULK':        return Math.round(tdee * 1.08);
      case 'MAINTENANCE': return tdee;
      case 'STRENGTH':    return Math.round(tdee * 1.05);
      default:            return KCAL_TARGET;
    }
  },

  kgAtBF(targetBF) {
    const lbm = this.getLBM();
    return Math.round((lbm / (1 - targetBF/100)) * 10) / 10;
  },

  weeksToKg(targetKg) {
    const current = this.getCurrentKg();
    const diff = current - targetKg;
    if (diff <= 0) return 0;
    // 0.5 kg/week realistic in deficit
    return Math.ceil(diff / 0.5);
  },

  addWeeks(date, weeks) {
    const d = new Date(date);
    d.setDate(d.getDate() + weeks * 7);
    return d;
  },

  fmtDate(date) {
    return date.toLocaleDateString('ro-RO', {day:'numeric', month:'short', year:'numeric'});
  },

  getCheckpoints() {
    const bf = this.getBF();
    const phase = this.getPhase();
    const checkpoints = [];
    const now = new Date();

    if (phase === 'CUT' || phase === 'MAINTENANCE') {
      const bfTargets = [20, 17, 15, 12, 10];
      bfTargets.forEach(t => {
        if (bf > t + 0.5) {
          const targetKg = this.kgAtBF(t);
          const weeks = this.weeksToKg(targetKg);
          const date = this.addWeeks(now, weeks);
          checkpoints.push({
            type: 'bf', label: `${t}% BF`,
            sub: `~${targetKg} kg`,
            weeks, date,
            color: t <= 12 ? 'var(--green)' : 'var(--accent)'
          });
        }
      });
    }

    if (phase === 'BULK') {
      const bulkEndBF = 17;
      const targetKg = this.kgAtBF(bulkEndBF);
      const kgToGain = targetKg - this.getCurrentKg();
      if (kgToGain > 0) {
        const weeks = Math.ceil(kgToGain / 0.25); // 0.25 kg/week bulk
        checkpoints.push({
          type: 'bulk',
          label: `Oprire creștere la ${bulkEndBF}% BF`,
          sub: `~${targetKg} kg — începe definirea`,
          weeks, date: this.addWeeks(now, weeks),
          color: 'var(--accent3)'
        });
      }
    }

    // Summer peak always shown
    const summerPeak = new Date(now.getFullYear(), 5, 15);
    if (now < summerPeak) {
      const weeksToSummer = Math.round((summerPeak - now) / (7*86400000));
      const projectedBF = Math.max(5, bf - weeksToSummer * 0.25);
      checkpoints.push({
        type: 'season',
        label: 'VARĂ PEAK',
        sub: `BF estimat: ~${projectedBF.toFixed(1)}%`,
        weeks: weeksToSummer,
        date: summerPeak,
        color: 'var(--accent2)'
      });
    }

    return checkpoints.sort((a,b) => a.weeks - b.weeks).slice(0,5);
  },

  getTimeline() {
    const now = new Date();
    const year = now.getFullYear();
    return [
      { label: 'Definire până la vară', date: new Date(year,0,1), endDate: new Date(year,5,1), type: 'cut' },
      { label: 'Vară peak (menținere)', date: new Date(year,5,1), endDate: new Date(year,7,31), type: 'summer' },
      { label: 'Creștere (toamnă-iarnă)', date: new Date(year,8,1), endDate: new Date(year+1,1,28), type: 'bulk' },
      { label: 'Definire pre-vară', date: new Date(year+1,2,1), endDate: new Date(year+1,5,1), type: 'cut' },
      { label: 'Vară peak 2027', date: new Date(year+1,5,1), endDate: new Date(year+1,7,31), type: 'summer' },
    ].map(item => ({
      ...item,
      status: now < item.date ? 'future' : now >= item.date && now < item.endDate ? 'current' : 'past'
    }));
  },

  // Tempo recommendations per exercise and phase
  getTempo(exName) {
    const phase = this.getPhase();
    const isCompound = ['DB Shoulder Press','Incline DB Press','Flat DB Press','Lat Pulldown','Cable Row','Chest-Supported Row','Romanian Deadlift','Leg Press'].includes(exName);

    if (phase === 'STRENGTH') {
      return isCompound ? {tempo:'2-0-X-0', rir:2, note:'Ridicăm exploziv, coborâm controlat'} : {tempo:'2-1-2-0', rir:2, note:'Mișcare controlată, fără elan'};
    }
    if (phase === 'BULK') {
      return isCompound ? {tempo:'3-1-2-0', rir:2, note:'Coborâre lentă, tensiune prelungită'} : {tempo:'3-1-2-1', rir:2, note:'Strângere maximă în vârf'};
    }
    // CUT / MAINTENANCE — more metabolic
    return isCompound ? {tempo:'3-1-2-0', rir:3, note:'În definire menținem, nu împingem'} : {tempo:'2-1-2-1', rir:3, note:'Calitatea execuției peste greutate'};
  },

  // Special techniques recommendation
  getTechniques(exName, setNumber, totalSets) {
    const phase = this.getPhase();
    const techniques = [];
    const isIsolation = ['Lateral Raises','Rear Delt Fly','Cable Curl','Preacher Curl','Overhead Triceps','Pushdown','Leg Extension','Leg Curl','Calf Raises','Face Pulls'].includes(exName);

    // Drop sets — NOT în CUT (deficit); recomandat în BULK/STRENGTH
    const isEffectivelyCut = phase === 'CUT' || (phase === 'AUTO' && new Date() < TARGET_DATE);
    if (isIsolation && setNumber === totalSets && !isEffectivelyCut) {
      techniques.push({icon:'🔻', label:'DROP SET', desc:'−30% greutate pe ultimul set · Mergem până nu mai putem'});
    }
    // Partial reps — on last set of isolation
    if (isIsolation && setNumber === totalSets && ['Lateral Raises','Calf Raises'].includes(exName)) {
      techniques.push({icon:'⚡', label:'PARȚIALE', desc:'10 reps parțiale după ultimul set complet'});
    }
    // Pause reps — compounds in strength phase
    if (!isIsolation && phase === 'STRENGTH' && setNumber <= 2) {
      techniques.push({icon:'⏸', label:'PAUZĂ 1 SEC', desc:'Pauză 1 sec în poziția de jos'});
    }
    return techniques;
  },

  // OFF day quest
  getOffDayQuest() {
    const streaks = DB.get('step-streaks') || {count:0, lastDate:'', totalDays:0};
    const stepsToday = DB.get('steps-today') || 0;
    const target = 8000;
    const pct = Math.min(100, Math.round(stepsToday/target*100));

    return {
      stepsToday, target, pct,
      streak: streaks.count,
      totalDays: streaks.totalDays,
      done: stepsToday >= target
    };
  }
};
