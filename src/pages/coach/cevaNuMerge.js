// ══ CEVA NU MERGE — unified drill (Pain+Equipment merged, 4 optiuni preset) ══
// Port spec: mockup `04-architecture/mockups/andura-clasic.html:§ceva-nu-merge`.
// LOCK V1 2026-05-10 SUPERSEDE ADR 023 split — preset fan-out la flow-uri existing
// (NU LLM intent interpretation free-text). 4 optiuni:
//   1. Ma doare       -> showPainButton (reason='pain')
//   2. Nu am aparat   -> showAlternativeModal (reason='equipment')
//   3. Altceva        -> showPainButton + Altceva panel open (reason='altceva')
//   4. Anuleaza       -> close

import { DB, tod } from '../../db.js';
import { state } from '../../state.js';
import { showPainButton } from './painButton.js';
import { showAlternativeModal } from './modals.js';

export const CEVA_NU_MERGE_OPTIONS = [
  { reason: 'pain',      icon: '⚠️', label: 'Ma doare',      sub: 'Durere acuta, articulara sau musculara' },
  { reason: 'equipment', icon: '🔁', label: 'Nu am aparat',  sub: 'Aparat ocupat sau lipsa — propunem alternative' },
  { reason: 'altceva',   icon: '💬', label: 'Altceva',       sub: 'Descrii liber — coach-ul interpreteaza' },
];

const CEVA_LOG_WINDOW = 90;

export function showCevaNuMerge(exerciseName, onResolve) {
  if (document.getElementById('ceva-nu-merge-modal')) return;
  state.currentScreen = 'ceva-nu-merge';

  const modal = document.createElement('div');
  modal.id = 'ceva-nu-merge-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:8000;display:flex;align-items:flex-end;justify-content:center';

  const ctxExercise = exerciseName || state.currentEx || '';
  const safeEx = String(ctxExercise).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));

  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 0 0;width:100%;max-width:500px;padding:22px 20px 32px">
      <div style="font-size:15px;font-weight:700;margin-bottom:4px">Ce nu merge?</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:16px;line-height:1.5">Alege optiunea care se potriveste${ctxExercise ? ` la <strong style="color:var(--text)">${safeEx}</strong>` : ''}. Coach-ul ajusteaza imediat.</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${CEVA_NU_MERGE_OPTIONS.map(opt =>
          `<button data-reason="${opt.reason}" style="display:flex;align-items:flex-start;gap:12px;width:100%;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:13px 16px;cursor:pointer">
            <span style="font-size:22px;flex-shrink:0">${opt.icon}</span>
            <span style="display:flex;flex-direction:column;flex:1"><span style="font-size:13px;font-weight:600;color:var(--text)">${opt.label}</span><span style="font-size:11px;color:var(--text3);margin-top:2px">${opt.sub}</span></span>
            <span style="font-size:18px;color:var(--text3);align-self:center">›</span>
          </button>`
        ).join('')}
      </div>
      <button class="ceva-cancel" style="margin-top:14px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;width:100%;text-align:center;padding:8px">Anuleaza</button>
    </div>`;

  document.body.appendChild(modal);

  modal.querySelectorAll('button[data-reason]').forEach(btn => {
    btn.addEventListener('click', () => selectCevaNuMergeReason(btn.dataset.reason, ctxExercise, onResolve));
  });
  modal.querySelector('.ceva-cancel').addEventListener('click', () => {
    closeCevaModal();
    if (typeof onResolve === 'function') onResolve({ action: 'cancel', source: 'cancel' });
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeCevaModal();
      if (typeof onResolve === 'function') onResolve({ action: 'cancel', source: 'backdrop' });
    }
  });
}

export function selectCevaNuMergeReason(reason, exerciseName, onResolve) {
  if (!CEVA_NU_MERGE_OPTIONS.find(o => o.reason === reason)) return;

  state.cevaNuMergeReason = reason;

  const log = DB.get('ceva-nu-merge-log') || [];
  log.unshift({
    date: tod(),
    ts: Date.now(),
    reason,
    exerciseName: exerciseName || state.currentEx || '',
  });
  DB.set('ceva-nu-merge-log', log.slice(0, CEVA_LOG_WINDOW));

  closeCevaModal();

  const ctxEx = exerciseName || state.currentEx || '';

  if (reason === 'pain') {
    showPainButton(ctxEx, onResolve);
    return;
  }
  if (reason === 'equipment') {
    showAlternativeModal(ctxEx);
    if (typeof onResolve === 'function') onResolve({ action: 'fan-out', reason: 'equipment' });
    return;
  }
  if (reason === 'altceva') {
    showPainButton(ctxEx, onResolve);
    // Mockup line 788: Altceva -> goto('pain-button') with altceva intent.
    // Open Altceva panel immediately for free-text input.
    const toggle = document.querySelector('.pain-altceva-toggle');
    if (toggle) toggle.click();
    return;
  }
}

function closeCevaModal() {
  const modal = document.getElementById('ceva-nu-merge-modal');
  if (modal) modal.remove();
  if (state.currentScreen === 'ceva-nu-merge') state.currentScreen = 'antrenor';
}
