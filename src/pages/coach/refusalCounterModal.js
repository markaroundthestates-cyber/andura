// ══ REFUSAL COUNTER MODAL — "Vrei să nu-l mai propun deloc?" (Bundle 4) ════
// Triggered when refusal counter for an exercise reaches REFUSAL_COUNTER_THRESHOLD
// (default 3) per Daniel verbatim chat-current 2026-05-13:
//   "Daca vede ca de 3-4-5 ori am dat nu vreau sa ma intrebe daca e permanent sau nu"
// Co-CTO bias §0.1: threshold = 3 (Gigel sweet spot anti-paternalism).
//
// 2 buttons:
//   - "Da, elimină permanent" → toggleSkippedExercise + resetRefusalCounter
//   - "Nu, propune din nou"   → resetRefusalCounter only (counter cleared, exercise stays)
// Backdrop click = same effect as "Nu" (Gigel dismiss UX, NU permanent).
//
// Pattern parity aparateLipsa.js modal (bottom-sheet overlay, z-index 8000).

import {
  toggleSkippedExercise,
  resetRefusalCounter,
} from '../../engine/schedule/scheduleAdapter.js';

const escapeHtml = (s) => String(s || '').replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));

export function showRefusalCounterModal(exerciseName, count, onResolve) {
  if (document.getElementById('refusal-counter-modal')) return;
  if (typeof exerciseName !== 'string' || exerciseName.length === 0) return;

  const modal = document.createElement('div');
  modal.id = 'refusal-counter-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:8500;display:flex;align-items:center;justify-content:center;padding:24px';

  const safeName = escapeHtml(exerciseName);
  const safeCount = Number.isFinite(count) ? Math.floor(count) : 0;

  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:24px 20px;width:100%;max-width:380px">
      <div style="font-size:13px;color:var(--accent);text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;text-align:center">PERMANENT?</div>
      <div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:14px;text-align:center;line-height:1.45">Ai refuzat <strong>${safeName}</strong> de ${safeCount} ori.</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:20px;text-align:center;line-height:1.5">Vrei sa nu-l mai propun deloc?</div>
      <button class="refusal-permanent" style="width:100%;padding:14px;background:#c8412e;color:#fff;border:none;border-radius:var(--rs);cursor:pointer;font-size:14px;font-weight:600;margin-bottom:10px">Da, elimina permanent</button>
      <button class="refusal-keep" style="width:100%;padding:14px;background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:var(--rs);cursor:pointer;font-size:14px">Nu, propune din nou</button>
    </div>`;

  document.body.appendChild(modal);

  const permBtn = modal.querySelector('.refusal-permanent');
  permBtn.addEventListener('click', () => {
    toggleSkippedExercise(exerciseName);
    resetRefusalCounter(exerciseName);
    closeRefusalCounterModal();
    if (typeof onResolve === 'function') onResolve({ action: 'permanent', exerciseName });
  });

  const keepBtn = modal.querySelector('.refusal-keep');
  keepBtn.addEventListener('click', () => {
    resetRefusalCounter(exerciseName);
    closeRefusalCounterModal();
    if (typeof onResolve === 'function') onResolve({ action: 'keep', exerciseName });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      resetRefusalCounter(exerciseName);
      closeRefusalCounterModal();
      if (typeof onResolve === 'function') onResolve({ action: 'dismiss', exerciseName });
    }
  });
}

export function closeRefusalCounterModal() {
  const modal = document.getElementById('refusal-counter-modal');
  if (modal) modal.remove();
}
