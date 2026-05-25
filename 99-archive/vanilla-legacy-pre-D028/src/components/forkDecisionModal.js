// ══ FORK DECISION MODAL — Anonymous→Auth Merge UI (§56.7 LOCKED V1) ══════════
// Per `06-sessions-log/_FROZEN/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §56.7 +
// §63.7 (ZERO default highlight, force conscious choice anti-mistake Maria 65).
// Wording UI LOCKED V1 verbatim — ZERO drift.

/**
 * Wording UI LOCKED V1 — DO NOT modify (anti-drift §56.7 verbatim).
 */
export const FORK_DECISION_COPY = Object.freeze({
  prompt: 'Am gasit un istoric in cloud. Ce vrei sa pastrezi?',
  optionTelefon: '[Telefon] — Datele de pe acest dispozitiv (anonim)',
  optionCloud: '[Cloud] — Datele din contul tau existent',
  archiveNote: 'Sursa pe care nu o alegi va fi arhivata 7 zile (recuperabila din Setari).',
  toastTelefonChosen: 'Datele din [Cloud] au fost arhivate. Le poti recupera timp de 7 zile din zona de Setari.',
  toastCloudChosen: 'Datele din [Telefon] au fost arhivate. Le poti recupera timp de 7 zile din zona de Setari.',
});

/**
 * Open the Fork Decision UI blocking modal. Both options are styled
 * neutrally identical — ZERO default highlight enforced (NU autofocus,
 * NU aria-default, NU different button class).
 *
 * @param {object} [opts]
 * @param {Document} [opts.doc]    test injection
 * @returns {Promise<'telefon'|'cloud'>}
 */
export function openForkDecisionModal({ doc = (typeof document !== 'undefined' ? document : null) } = {}) {
  if (!doc) return Promise.resolve('cloud');
  return new Promise((resolve) => {
    const overlay = doc.createElement('div');
    overlay.className = 'andura-modal-overlay andura-fork-decision-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const prompt = doc.createElement('div');
    prompt.className = 'andura-modal-prompt';
    prompt.textContent = FORK_DECISION_COPY.prompt;

    // Both buttons — IDENTICAL class (ZERO default highlight). NU autofocus.
    const btnTelefon = doc.createElement('button');
    btnTelefon.textContent = FORK_DECISION_COPY.optionTelefon;
    btnTelefon.className = 'andura-fork-button';      // identical class

    const btnCloud = doc.createElement('button');
    btnCloud.textContent = FORK_DECISION_COPY.optionCloud;
    btnCloud.className = 'andura-fork-button';        // identical class

    const note = doc.createElement('div');
    note.className = 'andura-modal-note';
    note.textContent = FORK_DECISION_COPY.archiveNote;

    btnTelefon.addEventListener('click', () => {
      try { overlay.remove(); } catch { /* swallow */ }
      resolve('telefon');
    });
    btnCloud.addEventListener('click', () => {
      try { overlay.remove(); } catch { /* swallow */ }
      resolve('cloud');
    });

    overlay.appendChild(prompt);
    overlay.appendChild(btnTelefon);
    overlay.appendChild(btnCloud);
    overlay.appendChild(note);
    doc.body.appendChild(overlay);
  });
}

/**
 * Branch detection logic (pure function — no DOM, no IO).
 * Per §56.7 pseudo-code:
 *  - Both non-empty → 'fork' (show modal)
 *  - Anonymous only → 'auto-migrate'
 *  - Cloud only OR neither → 'use-cloud' (or no-op)
 *
 * @param {{ anonymousData: boolean, cloudData: boolean }} input
 * @returns {'fork'|'auto-migrate'|'use-cloud'}
 */
export function detectMergeBranch({ anonymousData, cloudData }) {
  if (anonymousData && cloudData) return 'fork';
  if (anonymousData && !cloudData) return 'auto-migrate';
  return 'use-cloud';
}

/**
 * Format toast wording per user choice. Pure function.
 *
 * @param {'telefon'|'cloud'} choice
 * @returns {string}
 */
export function forkDecisionToastWording(choice) {
  return choice === 'telefon'
    ? FORK_DECISION_COPY.toastTelefonChosen
    : FORK_DECISION_COPY.toastCloudChosen;
}
