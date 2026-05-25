import { DB, tod } from '../../db.js';
import { TARGET_DATE } from '../../constants.js';
import { toast } from '../../ui/ui.js';
import { saveReadiness, READINESS_LABELS } from '../../engine/readiness.js';
import { updateExCard } from './logging.js';
import { getCachedDirector, sessionCache } from './state.js';
import { state } from '../../state.js';
import { renderCoachIdle } from './renderIdle.js';
import { t } from '../../i18n/index.js';

export function showReadinessModal() {
  if (document.getElementById('readiness-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'readiness-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:8000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px';
  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:28px 24px;width:100%;max-width:400px;text-align:center">
      <div style="font-size:13px;color:var(--accent);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">INAINTE DE ANTRENAMENT</div>
      <div style="font-size:20px;font-weight:700;margin-bottom:6px">Cum te simti azi?</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:24px">Raspunsul afecteaza recomandarile de azi</div>
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
  sessionCache.invalidate();
  renderCoachIdle();
  toast(`${READINESS_LABELS[value].emoji} ${READINESS_LABELS[value].label}`, 'var(--accent)');
}

export function showSkipModal() {
  const modal = document.createElement('div');
  modal.id = 'skip-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:8000;display:flex;align-items:flex-end;justify-content:center';
  modal.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 0 0;width:100%;max-width:500px;padding:24px 20px 36px">
    <div style="font-size:15px;font-weight:700;margin-bottom:16px">De ce sari azi?</div>
    ${['Obosit / recuperare insuficienta','Lipsa timp','Durere / accidentare','Alt motiv'].map((reason) =>
      `<button onclick="confirmSkip('${reason}')" style="display:block;width:100%;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:13px 16px;margin-bottom:8px;cursor:pointer;font-size:13px;color:var(--text);font-family:'DM Sans',sans-serif">${reason}</button>`
    ).join('')}
    <button onclick="document.getElementById('skip-modal').remove()" style="margin-top:8px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;width:100%;text-align:center;padding:8px">Anuleaza</button>
  </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

export function confirmSkip(reason) {
  const modal = document.getElementById('skip-modal');
  if (modal) modal.remove();
  const days = ['Duminica','Luni','Marti','Miercuri','Joi','Vineri','Sambata'];
  const skips = DB.get('workout-skips') || [];
  skips.push({ date: tod(), dayOfWeek: days[new Date().getDay()], reason, ts: Date.now() });
  DB.set('workout-skips', skips.slice(-100));
  toast('📌 Skip inregistrat', 'var(--text2)');
  renderCoachIdle();
  if (window.renderDash) window.renderDash();
}

export function showAlternativeModal(exerciseName) {
  const existing = document.getElementById('alt-modal');
  if (existing) existing.remove();

  const ALTERNATIVES = {
    'Lat Pulldown': [
      { name: 'Cable Row', reason: 'Similar lat activation, horizontal pull' },
      { name: 'Chest-Supported Row', reason: 'Spate complet, fara cablu' },
    ],
    'Cable Row': [
      { name: 'Chest-Supported Row', reason: 'Identic, pe banca' },
      { name: 'Lat Pulldown', reason: 'Vertical pull, lat dominant' },
    ],
    'Pec Deck / Cable Fly': [
      { name: 'Incline DB Press', reason: 'Presa + stretch piept' },
      { name: 'Cable Fly', reason: 'Aceeasi miscare pe cablu' },
    ],
    'Leg Press': [
      { name: 'Romanian Deadlift', reason: 'Posterior chain, fara aparat' },
    ],
    'Overhead Triceps': [
      { name: 'Pushdown', reason: 'Triceps lateral+medial, acelasi cablu' },
    ],
    'Pushdown': [
      { name: 'Overhead Triceps', reason: 'Triceps lung, aceeasi stiva' },
    ],
    'Bayesian Curl': [
      { name: 'Incline DB Curl', reason: 'Biceps lung, unghi similar' },
      { name: 'Cable Curl', reason: 'Tensiune constanta, cablu' },
    ],
  };

  const alts = ALTERNATIVES[exerciseName] || [];
  const modal = document.createElement('div');
  modal.id = 'alt-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:8000;display:flex;align-items:flex-end;justify-content:center';
  modal.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 0 0;width:100%;max-width:500px;padding:24px 20px 36px">
    <div style="font-size:15px;font-weight:700;margin-bottom:4px">⚠️ Aparat ocupat</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:16px">Alege o alternativa pentru <strong style="color:var(--text)">${exerciseName}</strong></div>
    ${alts.length ? alts.map(a => `
      <button onclick="selectAlternative('${exerciseName}','${a.name}')" style="display:block;width:100%;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:13px 16px;margin-bottom:8px;cursor:pointer">
        <div style="font-size:13px;font-weight:600;color:var(--text)">${a.name}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">${a.reason}</div>
      </button>`).join('') : '<div style="font-size:12px;color:var(--text3);padding:12px">Nicio alternativa disponibila — continua cu exercitiul urmator</div>'}
    <button onclick="markEquipmentUnavailable('${exerciseName}')" style="display:block;width:100%;text-align:left;background:rgba(255,68,68,0.08);border:1px solid rgba(255,68,68,0.2);border-radius:var(--rs);padding:11px 16px;margin-bottom:8px;cursor:pointer;font-size:12px;color:var(--red)">🚫 Nu am acest aparat (elimina permanent)</button>
    <button onclick="document.getElementById('alt-modal').remove()" style="margin-top:4px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;width:100%;text-align:center;padding:8px">Anuleaza</button>
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
  renderCoachIdle();
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
  renderCoachIdle();
}

export function showWhyForExercise(exerciseName) {
  // Render modal in-app (NU `alert()` native — anti-RE: ZERO category leak +
  // ZERO numerice exposure per i18n bundle why.categorical.* lock-uite).
  import('../../engine/whyEngine.js').then(({ whySummary }) => {
    const session = getCachedDirector();
    const exercise = session?.exercises?.find(e => (e.name || '').toLowerCase() === exerciseName.toLowerCase());
    const lastWeight = (() => {
      try {
        const logs = DB.get('logs') || [];
        const exLogs = logs
          .filter(l => (l.ex || '').toLowerCase() === exerciseName.toLowerCase() && !l.baseline)
          .map(l => Number(l.w))
          .filter(Number.isFinite);
        return exLogs.length > 0 ? exLogs[exLogs.length - 1] : null;
      } catch { return null; }
    })();
    const ctx = {
      readiness: { score: (() => {
        try {
          const today = tod();
          const r = DB.get('readiness');
          return typeof r === 'object' ? (r[today]?.score ?? r[today] ?? null) : null;
        } catch { return null; }
      })() },
      isInCut: (() => {
        const phase = DB.get('phase-override') || 'AUTO';
        return phase === 'CUT' || (phase === 'AUTO' && new Date() < TARGET_DATE);
      })(),
      user: { phase: DB.get('phase-override') || 'AUTO' },
    };
    const exerciseInput = exercise
      ? { ...exercise, recommendation: { ...(exercise.recommendation || {}), lastWeight } }
      : { name: exerciseName, recommendation: { lastWeight } };
    const summary = whySummary(exerciseInput, ctx);
    _renderWhyModal(exerciseName, summary);
  }).catch(() => {
    _renderWhyModal(exerciseName, t('why.unavailable'));
  });
}

function _renderWhyModal(exerciseName, summary) {
  const existing = document.getElementById('why-modal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'why-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:8000;display:flex;align-items:flex-end;justify-content:center';
  const safeName = String(exerciseName).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeSummary = String(summary).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
  modal.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 0 0;width:100%;max-width:500px;padding:24px 20px 32px">
    <div style="font-size:15px;font-weight:700;margin-bottom:14px">${t('why.title', { exercise: safeName })}</div>
    <div style="font-size:13px;color:var(--text);line-height:1.6;margin-bottom:20px">${safeSummary}</div>
    <button onclick="document.getElementById('why-modal').remove()" style="display:block;width:100%;background:var(--accent);border:none;border-radius:var(--rs);padding:12px;cursor:pointer;font-size:13px;color:var(--bg);font-weight:600;font-family:'DM Sans',sans-serif">${t('why.dismiss')}</button>
  </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}
