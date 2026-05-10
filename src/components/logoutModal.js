// ══ LOGOUT MODAL — double-confirm anti-tap-accidental (§56.12 LOCKED V1) ═══
// Per `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §56.12 +
// §62.8 anti-tap-accidental Maria 65.
// Wording UI LOCKED V1 verbatim — ZERO drift.

/**
 * Wording UI LOCKED V1 — DO NOT modify (anti-drift §56.12 verbatim).
 */
export const LOGOUT_COPY = Object.freeze({
  step1Prompt: 'Vei fi deconectat. Continui?',
  wipeCheckboxLabel: 'Sterge si datele locale de pe acest dispozitiv',
  step2Prompt: 'Sigur vrei sa te deconectezi?',
  step2Detail: 'Va trebui sa te autentifici din nou pentru a-ti vedea datele.',
  splash: 'Te-ai deconectat. Revino oricand.',
});

/**
 * Open Logout step 1 cu wipe opt-in checkbox. Returns user verdict.
 *
 * @param {object} [opts]
 * @param {Document} [opts.doc]
 * @returns {Promise<{ continue: boolean, wipeLocal: boolean }>}
 */
export function openLogoutStep1({ doc = (typeof document !== 'undefined' ? document : null) } = {}) {
  if (!doc) return Promise.resolve({ continue: false, wipeLocal: false });
  return new Promise((resolve) => {
    const overlay = doc.createElement('div');
    overlay.className = 'andura-modal-overlay andura-logout-step1';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const prompt = doc.createElement('div');
    prompt.className = 'andura-modal-prompt';
    prompt.textContent = LOGOUT_COPY.step1Prompt;

    const checkboxLabel = doc.createElement('label');
    checkboxLabel.className = 'andura-modal-checkbox-label';
    const checkbox = doc.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'andura-logout-wipe-checkbox';
    checkbox.checked = false; // default OFF per §56.12 LOCKED V1
    const checkboxText = doc.createElement('span');
    checkboxText.textContent = LOGOUT_COPY.wipeCheckboxLabel;
    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(checkboxText);

    const btnContinue = doc.createElement('button');
    btnContinue.textContent = 'Continua';
    btnContinue.className = 'andura-modal-button-primary';

    const btnCancel = doc.createElement('button');
    btnCancel.textContent = 'Renunta';
    btnCancel.className = 'andura-modal-button-secondary';

    btnContinue.addEventListener('click', () => {
      const wipeLocal = checkbox.checked;
      try { overlay.remove(); } catch {}
      resolve({ continue: true, wipeLocal });
    });
    btnCancel.addEventListener('click', () => {
      try { overlay.remove(); } catch {}
      resolve({ continue: false, wipeLocal: false });
    });

    overlay.appendChild(prompt);
    overlay.appendChild(checkboxLabel);
    overlay.appendChild(btnContinue);
    overlay.appendChild(btnCancel);
    doc.body.appendChild(overlay);
  });
}

/**
 * Open Logout step 2 — anti-tap-accidental confirm.
 *
 * @param {object} [opts]
 * @param {Document} [opts.doc]
 * @returns {Promise<{ confirmed: boolean }>}
 */
export function openLogoutStep2({ doc = (typeof document !== 'undefined' ? document : null) } = {}) {
  if (!doc) return Promise.resolve({ confirmed: false });
  return new Promise((resolve) => {
    const overlay = doc.createElement('div');
    overlay.className = 'andura-modal-overlay andura-logout-step2';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const prompt = doc.createElement('div');
    prompt.className = 'andura-modal-prompt';
    prompt.textContent = LOGOUT_COPY.step2Prompt;

    const detail = doc.createElement('div');
    detail.className = 'andura-modal-detail';
    detail.textContent = LOGOUT_COPY.step2Detail;

    const btnConfirm = doc.createElement('button');
    btnConfirm.textContent = 'Da, deconecteaza-ma';
    btnConfirm.className = 'andura-modal-button-primary';

    const btnCancel = doc.createElement('button');
    btnCancel.textContent = 'Renunta';
    btnCancel.className = 'andura-modal-button-secondary';

    btnConfirm.addEventListener('click', () => {
      try { overlay.remove(); } catch {}
      resolve({ confirmed: true });
    });
    btnCancel.addEventListener('click', () => {
      try { overlay.remove(); } catch {}
      resolve({ confirmed: false });
    });

    overlay.appendChild(prompt);
    overlay.appendChild(detail);
    overlay.appendChild(btnConfirm);
    overlay.appendChild(btnCancel);
    doc.body.appendChild(overlay);
  });
}

/**
 * Render splash post-logout cu wording LOCKED V1.
 * @param {object} [opts]
 * @param {Document} [opts.doc]
 * @returns {HTMLElement|null}
 */
export function renderLogoutSplash({ doc = (typeof document !== 'undefined' ? document : null) } = {}) {
  if (!doc) return null;
  const splash = doc.createElement('div');
  splash.className = 'andura-logout-splash';
  splash.textContent = LOGOUT_COPY.splash;
  return splash;
}
