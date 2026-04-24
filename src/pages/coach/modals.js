import { DB, tod } from '../../db.js';
import { PROG } from '../../constants.js';
import { toast } from '../../ui/ui.js';
import { saveReadiness, READINESS_LABELS } from '../../engine/readiness.js';
import { updateExCard } from './logging.js';
import { getCachedDirector, sessionCache } from './state.js';
import { state } from '../../state.js';
import { renderCoachIdle } from './renderIdle.js';

export function showReadinessModal() {
  if (document.getElementById('readiness-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'readiness-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:8000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px';
  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:28px 24px;width:100%;max-width:400px;text-align:center">
      <div style="font-size:13px;color:var(--accent);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">ÎNAINTE DE ANTRENAMENT</div>
      <div style="font-size:20px;font-weight:700;margin-bottom:6px">Cum te simți azi?</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:24px">Răspunsul afectează recomandările de azi</div>
      <div style="display:flex;justify-content:space-between;gap:8px">
        ${[1,2,3,4,5].map(v => `
          <button onclick="selectReadiness(${v})" style="flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px 4px;cursor:pointer;transition:all .15s">
            <div style="font-size:28px">${READINESS_LABELS[v].emoji}</div>
            <div style="font-size:9px;color:var(--text3);margin-top:6px;line-height:1.3">${READINESS_LABELS[v].label}</div>
          </button>`).join('')}
      </div>
      <button onclick="document.getElementById('readiness-modal').remove()" style="margin-top:20px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;padding:8px">Sari peste</button>
    </div>`;
  document.body.appendChild(modal);
}

export function selectReadiness(value) {
  saveReadiness(value);
  const modal = document.getElementById('readiness-modal');
  if (modal) modal.remove();
  renderCoachIdle();
  toast(`${READINESS_LABELS[value].emoji} ${READINESS_LABELS[value].label}`, 'var(--accent)');
}

export function showSkipModal() {
  const modal = document.createElement('div');
  modal.id = 'skip-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:8000;display:flex;align-items:flex-end;justify-content:center';
  const dayMap = [6,0,1,2,3,4,5];
  const tp = PROG ? PROG[dayMap[new Date().getDay()]] : null;
  modal.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 0 0;width:100%;max-width:500px;padding:24px 20px 36px">
    <div style="font-size:15px;font-weight:700;margin-bottom:16px">De ce sari azi?</div>
    ${['Obosit / recuperare insuficientă','Lipsă timp','Durere / accidentare','Alt motiv'].map((reason) =>
      `<button onclick="confirmSkip('${reason}')" style="display:block;width:100%;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:13px 16px;margin-bottom:8px;cursor:pointer;font-size:13px;color:var(--text);font-family:'DM Sans',sans-serif">${reason}</button>`
    ).join('')}
    <button onclick="document.getElementById('skip-modal').remove()" style="margin-top:8px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;width:100%;text-align:center;padding:8px">Anulează</button>
  </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

export function confirmSkip(reason) {
  const modal = document.getElementById('skip-modal');
  if (modal) modal.remove();
  const days = ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'];
  const skips = DB.get('workout-skips') || [];
  skips.push({ date: tod(), dayOfWeek: days[new Date().getDay()], reason, ts: Date.now() });
  DB.set('workout-skips', skips.slice(-100));
  toast('📌 Skip înregistrat', 'var(--text2)');
  // CICLU D (temporar)
  window.renderCoachIdle?.();
  if (window.renderDash) window.renderDash();
}

export function showAlternativeModal(exerciseName) {
  const existing = document.getElementById('alt-modal');
  if (existing) existing.remove();

  const ALTERNATIVES = {
    'Lat Pulldown': [
      { name: 'Cable Row', reason: 'Similar lat activation, horizontal pull' },
      { name: 'Chest-Supported Row', reason: 'Spate complet, fără cablu' },
    ],
    'Cable Row': [
      { name: 'Chest-Supported Row', reason: 'Identic, pe bancă' },
      { name: 'Lat Pulldown', reason: 'Vertical pull, lat dominant' },
    ],
    'Pec Deck / Cable Fly': [
      { name: 'Incline DB Press', reason: 'Presă + stretch piept' },
      { name: 'Cable Fly', reason: 'Aceeași mișcare pe cablu' },
    ],
    'Leg Press': [
      { name: 'Romanian Deadlift', reason: 'Posterior chain, fără aparat' },
    ],
    'Overhead Triceps': [
      { name: 'Pushdown', reason: 'Triceps lateral+medial, același cablu' },
    ],
    'Pushdown': [
      { name: 'Overhead Triceps', reason: 'Triceps lung, aceeași stivă' },
    ],
    'Bayesian Curl': [
      { name: 'Incline DB Curl', reason: 'Biceps lung, unghi similar' },
      { name: 'Cable Curl', reason: 'Tensiune constantă, cablu' },
    ],
  };

  const alts = ALTERNATIVES[exerciseName] || [];
  const modal = document.createElement('div');
  modal.id = 'alt-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:8000;display:flex;align-items:flex-end;justify-content:center';
  modal.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 0 0;width:100%;max-width:500px;padding:24px 20px 36px">
    <div style="font-size:15px;font-weight:700;margin-bottom:4px">⚠️ Aparat ocupat</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:16px">Alege o alternativă pentru <strong style="color:var(--text)">${exerciseName}</strong></div>
    ${alts.length ? alts.map(a => `
      <button onclick="selectAlternative('${exerciseName}','${a.name}')" style="display:block;width:100%;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:13px 16px;margin-bottom:8px;cursor:pointer">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${a.name}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">${a.reason}</div>
      </button>`).join('') : '<div style="font-size:12px;color:var(--text3);padding:12px">Nicio alternativă disponibilă — continuă cu exercițiul următor</div>'}
    <button onclick="markEquipmentUnavailable('${exerciseName}')" style="display:block;width:100%;text-align:left;background:rgba(255,68,68,0.08);border:1px solid rgba(255,68,68,0.2);border-radius:var(--rs);padding:11px 16px;margin-bottom:8px;cursor:pointer;font-size:12px;color:var(--red)">🚫 Nu am acest aparat (elimină permanent)</button>
    <button onclick="document.getElementById('alt-modal').remove()" style="margin-top:4px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;width:100%;text-align:center;padding:8px">Anulează</button>
  </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

export function selectAlternative(original, alternative) {
  const modal = document.getElementById('alt-modal');
  if (modal) modal.remove();
  const occ = DB.get('equipment-occupied-session') || [];
  if (!occ.includes(original)) occ.push(original);
  DB.set('equipment-occupied-session', occ);
  state.currentEx = alternative;
  updateExCard();
  toast(`Schimbat → ${alternative}`, 'var(--accent2)');
}

export function markEquipmentUnavailable(exerciseName) {
  const modal = document.getElementById('alt-modal');
  if (modal) modal.remove();
  const unavail = DB.get('unavailable-equipment') || [];
  if (!unavail.includes(exerciseName)) unavail.push(exerciseName);
  DB.set('unavailable-equipment', unavail);
  toast(`🚫 ${exerciseName} eliminat permanent`, 'var(--red)');
  // CICLU D (temporar)
  window.renderCoachIdle?.();
}

export function markOccupied(exerciseName) {
  if (state.sessActive) {
    showAlternativeModal(exerciseName);
    return;
  }
  const occ = DB.get('equipment-occupied-session') || [];
  if (!occ.includes(exerciseName)) {
    occ.push(exerciseName);
    DB.set('equipment-occupied-session', occ);
  }
  toast(`⚠️ ${exerciseName} marcat ocupat`, 'var(--accent2)');
  // CICLU D (temporar)
  window.renderCoachIdle?.();
}

export function showWhyForExercise(exerciseName) {
  import('../../engine/whyEngine.js').then(({ explainRecommendation }) => {
    const session = getCachedDirector();
    const exercise = session?.exercises?.find(e => (e.name || '').toLowerCase() === exerciseName.toLowerCase());
    const ctx = {
      readiness: { score: DB.get('readiness') ? (() => {
        try {
          const today = new Date().toISOString().slice(0,10);
          const r = DB.get('readiness');
          return typeof r === 'object' ? (r[today]?.score ?? r[today] ?? null) : null;
        } catch { return null; }
      })() : null },
      isInCut: (() => {
        const phase = DB.get('phase-override') || 'AUTO';
        return phase === 'CUT' || (phase === 'AUTO' && new Date() < new Date('2026-07-20'));
      })(),
      patterns: (() => {
        const lvl = (getCachedDirector() || sessionCache?.get())?.calibrationLevel;
        return (lvl?.patternsEnabled !== false) ? (DB.get('applied-patterns') || []) : [];
      })(),
      user: { phase: DB.get('phase-override') || 'AUTO' },
    };
    const { summary, reasons } = explainRecommendation(exercise || { name: exerciseName }, ctx);
    const lines = reasons.map(r => `[${r.category}] ${r.text}`).join('\n\n');
    alert(`❓ De ce ${exerciseName}?\n\n${summary}\n\n${lines || '(Fără date suficiente pentru explicație detaliată)'}`);
  }).catch(() => {
    alert(`❓ De ce ${exerciseName}?\n\n(WhyEngine indisponibil momentan)`);
  });
}
