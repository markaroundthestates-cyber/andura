// ══ PAIN BUTTON §36.38 — Pain/Discomfort drill (3 predefined + Altceva text) ══
// Port spec: mockup `04-architecture/mockups/andura-clasic.html:§pain-button`.
// Engine contract preserved: ADR_PAIN_DISCOMFORT_BUTTON_v1 §PAIN_OPTIONS keys
// (`discomfort_general` / `discomfort_specific` / `doms_severe`) unchanged in
// `src/engine/pain-button/`. UI labels override ADR EXT-1 (2 PRIMARY + 1 expand)
// per V2 mockup design SoT (3 visible + Altceva free-text). Mapping below.
//
// Anti-paternalism preserved (F2 SUFLET): user describes observable subjective
// state, engine adapts. ZERO medical claim wording. Altceva textarea stores
// free-text note for coach interpretation (NU auto-routed via engine — pattern
// inference deferred V2 per ADR §Alternatives #4).

import { DB, tod } from '../../db.js';
import { state } from '../../state.js';
import { processPainInput, buildOverrideAuditEntry } from '../../engine/pain-button/index.js';

// UI options map (mockup labels) -> engine PAIN_OPTIONS keys (ADR LOCK V1).
export const PAIN_UI_OPTIONS = [
  {
    key: 'acute_pain',
    engineKey: 'discomfort_specific',
    icon: '⚡',
    label: 'Durere acuta',
    sub: 'Stop imediat exercitiu, swap sigur',
  },
  {
    key: 'joint_discomfort',
    engineKey: 'discomfort_general',
    icon: '🦴',
    label: 'Disconfort articulatie',
    sub: 'Reducem amplitudine + greutate',
  },
  {
    key: 'extreme_fatigue',
    engineKey: 'doms_severe',
    icon: '🔋',
    label: 'Oboseala extrema',
    sub: 'Taiem volum 30% astazi',
  },
];

const ALTCEVA_MAX_LENGTH = 500;
const PAIN_NOTES_WINDOW = 90;

export function showPainButton(exerciseName, onResolve) {
  if (document.getElementById('pain-button-modal')) return;
  state.currentScreen = 'pain-button';

  const modal = document.createElement('div');
  modal.id = 'pain-button-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:8000;display:flex;align-items:flex-end;justify-content:center';

  const ctxExercise = exerciseName || state.currentEx || '';
  const safeEx = String(ctxExercise).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));

  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 0 0;width:100%;max-width:500px;padding:22px 20px 32px">
      <div style="font-size:15px;font-weight:700;margin-bottom:4px">Ma doare ceva</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:16px;line-height:1.5">Coach-ul reduce intensitatea sau schimba exercitiul. Spune ce simti${ctxExercise ? ` la <strong style="color:var(--text)">${safeEx}</strong>` : ''}:</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${PAIN_UI_OPTIONS.map(opt =>
          `<button data-pain="${opt.key}" style="display:flex;align-items:flex-start;gap:12px;width:100%;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:13px 16px;cursor:pointer">
            <span style="font-size:22px;flex-shrink:0">${opt.icon}</span>
            <span style="display:flex;flex-direction:column"><span style="font-size:13px;font-weight:600;color:var(--text)">${opt.label}</span><span style="font-size:11px;color:var(--text3);margin-top:2px">${opt.sub}</span></span>
          </button>`
        ).join('')}
        <button class="pain-altceva-toggle" style="display:flex;align-items:flex-start;gap:12px;width:100%;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:13px 16px;cursor:pointer">
          <span style="font-size:22px;flex-shrink:0">⋯</span>
          <span style="display:flex;flex-direction:column"><span style="font-size:13px;font-weight:600;color:var(--text)">Altceva</span><span style="font-size:11px;color:var(--text3);margin-top:2px">Descrie liber</span></span>
        </button>
      </div>
      <div class="pain-altceva-panel" style="display:none;margin-top:14px">
        <textarea class="pain-altceva-text" placeholder="Descrie ce simti. Ex: intepatura usoara lombar la genuflexiuni..." rows="4" maxlength="${ALTCEVA_MAX_LENGTH}" style="width:100%;padding:12px;border:1px solid var(--border);border-radius:var(--rs);background:var(--card);color:var(--text);font-family:inherit;font-size:13px;resize:none"></textarea>
        <div class="pain-altceva-count" style="font-size:10px;color:var(--text3);text-align:right;margin-top:4px">0/${ALTCEVA_MAX_LENGTH}</div>
        <button class="pain-altceva-submit" style="width:100%;margin-top:8px;padding:12px;background:var(--accent);color:#000;border:none;border-radius:var(--rs);cursor:pointer;font-size:13px;font-weight:600">Trimite la coach</button>
      </div>
      <button class="pain-cancel" style="margin-top:14px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;width:100%;text-align:center;padding:8px">Anuleaza</button>
    </div>`;

  document.body.appendChild(modal);

  modal.querySelectorAll('button[data-pain]').forEach(btn => {
    btn.addEventListener('click', () => selectPainOption(btn.dataset.pain, ctxExercise, onResolve));
  });

  const toggle = modal.querySelector('.pain-altceva-toggle');
  const panel = modal.querySelector('.pain-altceva-panel');
  const textarea = modal.querySelector('.pain-altceva-text');
  const counter = modal.querySelector('.pain-altceva-count');
  const submit = modal.querySelector('.pain-altceva-submit');

  toggle.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    if (panel.style.display === 'block') textarea.focus();
  });

  textarea.addEventListener('input', () => {
    counter.textContent = `${textarea.value.length}/${ALTCEVA_MAX_LENGTH}`;
  });

  submit.addEventListener('click', () => {
    const note = textarea.value.trim();
    if (!note) return;
    submitAltcevaNote(note, ctxExercise, onResolve);
  });

  modal.querySelector('.pain-cancel').addEventListener('click', () => {
    closePainModal();
    if (typeof onResolve === 'function') onResolve({ action: 'cancel', source: 'cancel' });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePainModal();
      if (typeof onResolve === 'function') onResolve({ action: 'cancel', source: 'backdrop' });
    }
  });
}

export function selectPainOption(uiKey, exerciseName, onResolve) {
  const opt = PAIN_UI_OPTIONS.find(o => o.key === uiKey);
  if (!opt) return;

  const engineResult = processPainInput(opt.engineKey);

  const audit = buildOverrideAuditEntry({
    exerciseName: exerciseName || state.currentEx || '',
    painKey: opt.engineKey,
    userOverride: false,
  });
  const log = DB.get('pain-button-log') || [];
  log.unshift({
    date: tod(),
    uiKey: opt.key,
    engineKey: opt.engineKey,
    action: engineResult.action,
    rationale: engineResult.rationale,
    exerciseName: exerciseName || state.currentEx || '',
    audit,
  });
  DB.set('pain-button-log', log.slice(0, PAIN_NOTES_WINDOW));

  closePainModal();
  showSafetyToast();

  if (typeof onResolve === 'function') {
    onResolve({
      action: 'pain',
      uiKey: opt.key,
      engineKey: opt.engineKey,
      engineAction: engineResult.action,
      rationale: engineResult.rationale,
    });
  }
}

export function submitAltcevaNote(note, exerciseName, onResolve) {
  if (!note || typeof note !== 'string') return;
  const trimmed = note.trim().slice(0, ALTCEVA_MAX_LENGTH);
  if (!trimmed) return;

  const notes = DB.get('pain-altceva-notes') || [];
  notes.unshift({
    date: tod(),
    ts: Date.now(),
    note: trimmed,
    exerciseName: exerciseName || state.currentEx || '',
  });
  DB.set('pain-altceva-notes', notes.slice(0, PAIN_NOTES_WINDOW));

  closePainModal();
  showSafetyToast('Trimis. Coach-ul adapteaza.');

  if (typeof onResolve === 'function') {
    onResolve({
      action: 'altceva',
      note: trimmed,
      exerciseName: exerciseName || state.currentEx || '',
    });
  }
}

function closePainModal() {
  const modal = document.getElementById('pain-button-modal');
  if (modal) modal.remove();
  if (state.currentScreen === 'pain-button') state.currentScreen = 'antrenor';
}

function showSafetyToast(message) {
  const text = message || 'Siguranta e pe primul loc. Am ajustat restul sesiunii.';
  const existing = document.getElementById('pain-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'pain-toast';
  toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--bg2);border:1px solid var(--accent);border-radius:var(--rs);padding:12px 18px;font-size:13px;color:var(--text);z-index:9000;max-width:340px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.4)';
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}
