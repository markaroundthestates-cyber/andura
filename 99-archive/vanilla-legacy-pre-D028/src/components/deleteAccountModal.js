// DELETE ACCOUNT MODAL — 2-step "STERGE" confirmation (§56.5.2 LOCKED V1).
// Post NO_DIACRITICS_RULE 2026-05-10: confirmation is plain Latin "STERGE"
// (case-sensitive, no diacritics anywhere in app).

export const REQUIRED_CONFIRMATION = 'STERGE';

/**
 * Wording UI LOCKED V1 — DO NOT modify (anti-drift §56.5.2 verbatim).
 * @type {{ step1: string, splash: string }}
 */
export const DELETE_COPY = Object.freeze({
  step1: 'Aceasta actiune va sterge contul in 30 de zile. Te poti razgandi in acest interval. Pentru a confirma, scrie STERGE mai jos.',
  splash: 'Contul tau este programat pentru stergere definitiva in 30 de zile. Daca te razgandesti, trimite un e-mail la suport@andura.app.',
});

// Strict equals (case-sensitive, no trim) against REQUIRED_CONFIRMATION.
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
    input.setAttribute('aria-label', 'Confirmare STERGE');

    const btnConfirm = doc.createElement('button');
    btnConfirm.textContent = 'Confirma';
    btnConfirm.className = 'andura-modal-button-primary';
    btnConfirm.disabled = true;

    const btnCancel = doc.createElement('button');
    btnCancel.textContent = 'Renunta';
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
