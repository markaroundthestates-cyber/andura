// ══ DELETE ACCOUNT MODAL — 2-step "ȘTERGE" confirmation (§56.5.2 LOCKED V1) ══
// Per `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §56.5.2 +
// §62.X (META Review Division of Labor) + §64.2 (2-step ȘTERGE).
// Wording UI LOCKED V1 verbatim — ZERO drift, RO diacritics exact.
//
// CRITICAL: confirmation string equals "ȘTERGE" case-sensitive cu Ș U+0218
// NOT S U+0053 (latin), NU "STERGE" (without diacritic), NU "șterge" (lowercase).

/**
 * Confirmation string LOCKED V1 — Ș este U+0218 (Cyrillic Capital Letter Es with cedilla
 * — actually Latin Capital S with comma below, U+0218). DO NOT modify.
 * @type {string}
 */
export const REQUIRED_CONFIRMATION = 'ȘTERGE';

/**
 * Wording UI LOCKED V1 — DO NOT modify (anti-drift §56.5.2 verbatim).
 * @type {{ step1: string, splash: string }}
 */
export const DELETE_COPY = Object.freeze({
  step1: 'Această acțiune va șterge contul în 30 de zile. Te poți răzgândi în acest interval. Pentru a confirma, scrie ȘTERGE mai jos.',
  splash: 'Contul tău este programat pentru ștergere definitivă în 30 de zile. Dacă te răzgândești, trimite un e-mail la suport@andura.app.',
});

/**
 * Strict case-sensitive RO diacritics validator. Returns true ONLY pentru
 * "ȘTERGE" exact (Ș U+0218 + TERGE Latin uppercase).
 *
 * Examples:
 *  - "ȘTERGE" → true
 *  - "STERGE" → false (S U+0053 != Ș U+0218)
 *  - "șterge" → false (lowercase rejected)
 *  - " ȘTERGE " → false (whitespace not trimmed implicit — strict equals)
 *
 * @param {string} input
 * @returns {boolean}
 */
export function isValidConfirmation(input) {
  return input === REQUIRED_CONFIRMATION;
}

/**
 * Open the delete account modal step 1. Returns user verdict.
 *
 * @param {object} [opts]
 * @param {Document} [opts.doc]    test injection
 * @returns {Promise<{ confirmed: boolean }>}
 */
export function openDeleteAccountModal({ doc = (typeof document !== 'undefined' ? document : null) } = {}) {
  if (!doc) return Promise.resolve({ confirmed: false });
  return new Promise((resolve) => {
    const overlay = doc.createElement('div');
    overlay.className = 'andura-modal-overlay andura-delete-account-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const body = doc.createElement('div');
    body.className = 'andura-modal-body';
    body.textContent = DELETE_COPY.step1;

    const input = doc.createElement('input');
    input.type = 'text';
    input.className = 'andura-modal-input';
    input.setAttribute('aria-label', 'Confirmare ȘTERGE');

    const btnConfirm = doc.createElement('button');
    btnConfirm.textContent = 'Confirmă';
    btnConfirm.className = 'andura-modal-button-primary';
    btnConfirm.disabled = true;

    const btnCancel = doc.createElement('button');
    btnCancel.textContent = 'Renunță';
    btnCancel.className = 'andura-modal-button-secondary';

    input.addEventListener('input', () => {
      btnConfirm.disabled = !isValidConfirmation(input.value);
    });

    btnConfirm.addEventListener('click', () => {
      if (isValidConfirmation(input.value)) {
        try { overlay.remove(); } catch { /* swallow */ }
        resolve({ confirmed: true });
      }
    });
    btnCancel.addEventListener('click', () => {
      try { overlay.remove(); } catch { /* swallow */ }
      resolve({ confirmed: false });
    });

    overlay.appendChild(body);
    overlay.appendChild(input);
    overlay.appendChild(btnConfirm);
    overlay.appendChild(btnCancel);
    doc.body.appendChild(overlay);
  });
}

/**
 * Render splash screen post-delete confirmation. Pure DOM, NO async.
 *
 * @param {object} [opts]
 * @param {Document} [opts.doc]
 * @returns {HTMLElement|null}
 */
export function renderDeletePostSplash({ doc = (typeof document !== 'undefined' ? document : null) } = {}) {
  if (!doc) return null;
  const splash = doc.createElement('div');
  splash.className = 'andura-delete-post-splash';
  splash.textContent = DELETE_COPY.splash;
  return splash;
}
