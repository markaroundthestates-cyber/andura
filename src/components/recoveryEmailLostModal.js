// ══ RECOVERY EMAIL LOST MODAL — refusal pattern explicit (§56.5.1 LOCKED V1) ══
// Per `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §56.5.1.
// Wording UI LOCKED V1 verbatim — ZERO drift even minor punctuation, RO diacritics.
//
// Pre-Beta refusal pattern: NU SMS verify, NU email secundar. Explicit modal
// info-only cu single "Înțeleg" close button.

/**
 * Wording UI LOCKED V1 — DO NOT modify (anti-drift §56.5.1 verbatim).
 * @type {string}
 */
export const RECOVERY_EMAIL_LOST_COPY
  = 'Contul tău în cloud nu mai poate fi accesat. Totuși, datele tale de antrenament de pe acest dispozitiv sunt în siguranță și rămân aici. Pierzi doar sincronizarea automată cu alte telefoane sau tablete.';

/**
 * Open the recovery email lost modal. Returns when user clicks "Înțeleg".
 *
 * @param {object} [opts]
 * @param {Document} [opts.doc]    test injection
 * @returns {Promise<void>}
 */
export function openRecoveryEmailLostModal({ doc = (typeof document !== 'undefined' ? document : null) } = {}) {
  if (!doc) return Promise.resolve();
  return new Promise((resolve) => {
    const overlay = doc.createElement('div');
    overlay.className = 'andura-modal-overlay andura-recovery-email-lost-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const body = doc.createElement('div');
    body.className = 'andura-modal-body';
    body.textContent = RECOVERY_EMAIL_LOST_COPY;
    const btn = doc.createElement('button');
    btn.textContent = 'Înțeleg';
    btn.className = 'andura-modal-button';
    btn.addEventListener('click', () => {
      try { overlay.remove(); } catch { /* swallow */ }
      resolve();
    });
    overlay.appendChild(body);
    overlay.appendChild(btn);
    doc.body.appendChild(overlay);
  });
}
