// ══ EQUIPMENT SWAP — free-text fallback when smart-routing finds no alternative ══
// Port spec: mockup `04-architecture/mockups/andura-clasic.html:§equipment-swap`
// (line 811-825). Reached from cevaNuMerge `equipment` reason when engine smart-
// routing returns ZERO valid alternatives (Tier 1 strict / Tier 2 muscle match
// per ADR_SMART_ROUTING_EQUIPMENT_v1 LOCK 2026-05-02). User describes free-text
// what equipment they have on hand; coach interpretation DEFERRED V2 (mockup
// verbatim onclick="showToast('Caut swap echivalent...')").
//
// Engine contract preserved orthogonal: smart-routing engine `src/engine/smart-
// routing/` LOCK V1 unchanged. equipmentSwap.js = UI fallback escape hatch when
// engine exhausts pre-computed alternatives (ADR §Anti-paternalism: skip exercise
// remains default; this drill is opt-in user-initiated when user has off-spec gear).
//
// Anti-paternalism preserved: user describes objective equipment availability,
// engine NU auto-interpret in V1 — note stored for coach observation. Pattern
// inference (LLM-side swap suggestion) DEFERRED V2 same scope as Altceva pain
// note (painButton.js §Altceva).

import { DB, tod } from '../../db.js';
import { state } from '../../state.js';

const SWAP_TEXT_MAX_LENGTH = 500;
const SWAP_LOG_WINDOW = 90;

export function showEquipmentSwap(exerciseName, onResolve) {
  if (document.getElementById('equipment-swap-modal')) return;
  state.currentScreen = 'equipment-swap';

  const modal = document.createElement('div');
  modal.id = 'equipment-swap-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:8000;display:flex;align-items:flex-end;justify-content:center';

  const ctxExercise = exerciseName || state.currentEx || '';
  const safeEx = String(ctxExercise).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));

  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px 16px 0 0;width:100%;max-width:500px;padding:22px 20px 32px">
      <div style="font-size:15px;font-weight:700;margin-bottom:4px">Schimba echipament</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:14px;line-height:1.5">Smart-routing nu a gasit alternativa. Spune ce ai la indemana.</div>
      ${ctxExercise ? `
      <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:12px 14px;margin-bottom:14px">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em;font-weight:600">Exercitiu curent</div>
        <div style="font-size:14px;font-weight:600;color:var(--text);margin-top:2px">${safeEx}</div>
      </div>` : ''}
      <label class="swap-label" style="font-size:11px;color:var(--text2);font-weight:500;display:block;margin-bottom:6px">Ce echipament ai in loc?</label>
      <textarea class="swap-text" placeholder="Ex: doar gantere pana la 12 kg, fara banc inclinat. Sau: cablu cu pulley jos." rows="5" maxlength="${SWAP_TEXT_MAX_LENGTH}" style="width:100%;padding:12px;border:1px solid var(--border);border-radius:var(--rs);background:var(--card);color:var(--text);font-family:inherit;font-size:13px;resize:none"></textarea>
      <div class="swap-count" style="font-size:10px;color:var(--text3);text-align:right;margin-top:4px">0/${SWAP_TEXT_MAX_LENGTH}</div>
      <p class="swap-hint" style="font-size:11px;color:var(--text3);margin-top:8px;line-height:1.5;font-style:italic">Coach-ul interpreteaza liber si propune un swap echivalent.</p>
      <button class="swap-submit" style="width:100%;margin-top:14px;padding:12px;background:var(--accent);color:#000;border:none;border-radius:var(--rs);cursor:pointer;font-size:13px;font-weight:600">Cere swap</button>
      <button class="swap-cancel" style="margin-top:10px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;width:100%;text-align:center;padding:8px">Anuleaza</button>
    </div>`;

  document.body.appendChild(modal);

  const textarea = modal.querySelector('.swap-text');
  const counter = modal.querySelector('.swap-count');
  const submit = modal.querySelector('.swap-submit');
  const cancel = modal.querySelector('.swap-cancel');

  textarea.addEventListener('input', () => {
    counter.textContent = `${textarea.value.length}/${SWAP_TEXT_MAX_LENGTH}`;
  });

  submit.addEventListener('click', () => {
    const note = textarea.value.trim();
    if (!note) return;
    submitSwapRequest(note, ctxExercise, onResolve);
  });

  cancel.addEventListener('click', () => {
    closeEquipmentSwapModal();
    if (typeof onResolve === 'function') onResolve({ action: 'cancel', source: 'cancel' });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeEquipmentSwapModal();
      if (typeof onResolve === 'function') onResolve({ action: 'cancel', source: 'backdrop' });
    }
  });
}

export function submitSwapRequest(note, exerciseName, onResolve) {
  if (!note || typeof note !== 'string') return;
  const trimmed = note.trim().slice(0, SWAP_TEXT_MAX_LENGTH);
  if (!trimmed) return;

  const log = DB.get('equipment-swap-log') || [];
  log.unshift({
    date: tod(),
    ts: Date.now(),
    note: trimmed,
    exerciseName: exerciseName || state.currentEx || '',
  });
  DB.set('equipment-swap-log', log.slice(0, SWAP_LOG_WINDOW));

  closeEquipmentSwapModal();
  showSwapToast();

  if (typeof onResolve === 'function') {
    onResolve({
      action: 'swap-request',
      note: trimmed,
      exerciseName: exerciseName || state.currentEx || '',
    });
  }
}

function closeEquipmentSwapModal() {
  const modal = document.getElementById('equipment-swap-modal');
  if (modal) modal.remove();
  if (state.currentScreen === 'equipment-swap') state.currentScreen = 'antrenor';
}

function showSwapToast(message) {
  // Mockup verbatim: onclick="showToast('Caut swap echivalent...')" — coach
  // interpretation deferred V2 (pattern inference NU în scope V1 same as Altceva
  // free-text per painButton.js §submitAltcevaNote).
  const text = message || 'Caut swap echivalent...';
  const existing = document.getElementById('swap-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'swap-toast';
  toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--bg2);border:1px solid var(--accent);border-radius:var(--rs);padding:12px 18px;font-size:13px;color:var(--text);z-index:9000;max-width:340px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.4)';
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}
