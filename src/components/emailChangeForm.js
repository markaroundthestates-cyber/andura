// ══ EMAIL CHANGE FORM — typo guard double-input + §56.5.4 LOCKED V1 ══════════
// Per `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §56.5.4 +
// §64.1 Magic Link new address ONLY pattern.
// Wording UI LOCKED V1 verbatim — ZERO drift.

/**
 * Wording UI LOCKED V1 — DO NOT modify.
 */
export const EMAIL_CHANGE_COPY = Object.freeze({
  errorAlreadyUsed: 'Adresa este deja folosita de un alt cont.',
});

/**
 * Validate email format (RFC 5322 simplified).
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate typo guard: both inputs equal trimmed + valid format.
 * @param {string} primary
 * @param {string} confirm
 * @returns {{ valid: boolean, reason: string|null }}
 */
export function validateEmailChangeInputs(primary, confirm) {
  const p = String(primary ?? '').trim();
  const c = String(confirm ?? '').trim();
  if (!isValidEmail(p)) return { valid: false, reason: 'invalid_format' };
  if (p !== c) return { valid: false, reason: 'mismatch' };
  return { valid: true, reason: null };
}

/**
 * Render the email change form cu typo guard double-input. Returns submitted
 * email on user confirm.
 *
 * @param {object} [opts]
 * @param {Document} [opts.doc]
 * @returns {Promise<{ submitted: boolean, email?: string }>}
 */
export function openEmailChangeForm({ doc = (typeof document !== 'undefined' ? document : null) } = {}) {
  if (!doc) return Promise.resolve({ submitted: false });
  return new Promise((resolve) => {
    const overlay = doc.createElement('div');
    overlay.className = 'andura-modal-overlay andura-email-change-form';
    overlay.setAttribute('role', 'dialog');

    const labelPrimary = doc.createElement('label');
    labelPrimary.textContent = 'Adresa noua';
    const inputPrimary = doc.createElement('input');
    inputPrimary.type = 'email';
    inputPrimary.className = 'andura-email-input-primary';
    labelPrimary.appendChild(inputPrimary);

    const labelConfirm = doc.createElement('label');
    labelConfirm.textContent = 'Confirma adresa noua';
    const inputConfirm = doc.createElement('input');
    inputConfirm.type = 'email';
    inputConfirm.className = 'andura-email-input-confirm';
    labelConfirm.appendChild(inputConfirm);

    const errLine = doc.createElement('div');
    errLine.className = 'andura-form-error';
    errLine.style.display = 'none';

    const btnSubmit = doc.createElement('button');
    btnSubmit.textContent = 'Trimite link de verificare';
    btnSubmit.className = 'andura-modal-button-primary';

    const btnCancel = doc.createElement('button');
    btnCancel.textContent = 'Renunta';
    btnCancel.className = 'andura-modal-button-secondary';

    btnSubmit.addEventListener('click', () => {
      const verdict = validateEmailChangeInputs(inputPrimary.value, inputConfirm.value);
      if (!verdict.valid) {
        errLine.style.display = 'block';
        errLine.textContent = verdict.reason === 'mismatch'
          ? 'Adresele introduse nu corespund.'
          : 'Adresa invalida.';
        return;
      }
      try { overlay.remove(); } catch { /* swallow */ }
      resolve({ submitted: true, email: String(inputPrimary.value).trim() });
    });
    btnCancel.addEventListener('click', () => {
      try { overlay.remove(); } catch { /* swallow */ }
      resolve({ submitted: false });
    });

    overlay.appendChild(labelPrimary);
    overlay.appendChild(labelConfirm);
    overlay.appendChild(errLine);
    overlay.appendChild(btnSubmit);
    overlay.appendChild(btnCancel);
    doc.body.appendChild(overlay);
  });
}
