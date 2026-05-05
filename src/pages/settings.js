// ══ SETTINGS PAGE — Auth Phase 2 Batch 2 wiring (§56.5 + §56.7 LOCKED V1) ═══
// Per `06-sessions-log/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §56.5 +
// §56.7 + §56.12 (Logout — wired în batch 3).
//
// NU framework — vanilla JS DOM render per ADR 005 conventions.

import { openRecoveryEmailLostModal } from '../components/recoveryEmailLostModal.js';
import { openDeleteAccountModal, renderDeletePostSplash, DELETE_COPY } from '../components/deleteAccountModal.js';
import { openEmailChangeForm, EMAIL_CHANGE_COPY } from '../components/emailChangeForm.js';
import { openForkDecisionModal, detectMergeBranch, forkDecisionToastWording, FORK_DECISION_COPY } from '../components/forkDecisionModal.js';
import { signOut, buildSoftDeleteFlag, USER_DISABLED_COPY } from '../auth.js';

/**
 * Render the Settings page into the given root element.
 * Wires sections: Email change + Recovery email lost + Delete account + Auth merge restore stub.
 *
 * @param {object} opts
 * @param {HTMLElement} opts.root           container element
 * @param {Document} [opts.doc]             test injection
 * @param {() => Promise<void>} [opts.onAccountDeleted]  callback post soft-delete confirm
 * @param {(email: string) => Promise<{ ok: boolean, error?: string }>} [opts.onEmailChangeSubmit]
 */
export function renderSettingsPage({
  root,
  doc = (typeof document !== 'undefined' ? document : null),
  onAccountDeleted,
  onEmailChangeSubmit,
}) {
  if (!root || !doc) return;
  root.innerHTML = '';

  const heading = doc.createElement('h1');
  heading.textContent = 'Setări';
  root.appendChild(heading);

  // §56.5.4 Email change section
  const sectionEmail = doc.createElement('section');
  sectionEmail.className = 'andura-settings-section andura-settings-email-change';
  const emailHeader = doc.createElement('h2');
  emailHeader.textContent = 'Schimbă adresa de e-mail';
  sectionEmail.appendChild(emailHeader);
  const btnEmailChange = doc.createElement('button');
  btnEmailChange.textContent = 'Schimbă adresa';
  btnEmailChange.addEventListener('click', async () => {
    const result = await openEmailChangeForm({ doc });
    if (result.submitted && typeof onEmailChangeSubmit === 'function') {
      const out = await onEmailChangeSubmit(result.email).catch(() => ({ ok: false, error: 'unknown' }));
      if (!out.ok && out.error === 'EMAIL_EXISTS') {
        const errModal = doc.createElement('div');
        errModal.className = 'andura-modal-overlay andura-error-modal';
        errModal.textContent = EMAIL_CHANGE_COPY.errorAlreadyUsed;
        const close = doc.createElement('button');
        close.textContent = 'Închide';
        close.addEventListener('click', () => { try { errModal.remove(); } catch {} });
        errModal.appendChild(close);
        doc.body.appendChild(errModal);
      }
    }
  });
  sectionEmail.appendChild(btnEmailChange);
  root.appendChild(sectionEmail);

  // §56.5.1 Recovery email lost section
  const sectionRecovery = doc.createElement('section');
  sectionRecovery.className = 'andura-settings-section andura-settings-recovery-email';
  const recoveryHeader = doc.createElement('h2');
  recoveryHeader.textContent = 'Acces pierdut la e-mail';
  sectionRecovery.appendChild(recoveryHeader);
  const btnRecoveryLost = doc.createElement('button');
  btnRecoveryLost.textContent = 'Mi-am pierdut accesul la email';
  btnRecoveryLost.addEventListener('click', () => { openRecoveryEmailLostModal({ doc }); });
  sectionRecovery.appendChild(btnRecoveryLost);
  root.appendChild(sectionRecovery);

  // §56.5.2 Delete account section
  const sectionDelete = doc.createElement('section');
  sectionDelete.className = 'andura-settings-section andura-settings-delete-account';
  const deleteHeader = doc.createElement('h2');
  deleteHeader.textContent = 'Cont';
  sectionDelete.appendChild(deleteHeader);
  const btnDelete = doc.createElement('button');
  btnDelete.textContent = 'Șterge cont definitiv';
  btnDelete.className = 'andura-button-danger';
  btnDelete.addEventListener('click', async () => {
    const verdict = await openDeleteAccountModal({ doc });
    if (verdict.confirmed) {
      const flag = buildSoftDeleteFlag();
      if (typeof onAccountDeleted === 'function') {
        await onAccountDeleted(flag).catch(() => {});
      }
      try { signOut(); } catch {}
      const splash = renderDeletePostSplash({ doc });
      root.innerHTML = '';
      if (splash) root.appendChild(splash);
    }
  });
  sectionDelete.appendChild(btnDelete);
  root.appendChild(sectionDelete);
}

// Re-export public API for callers wiring routes.
export {
  openRecoveryEmailLostModal,
  openDeleteAccountModal,
  openForkDecisionModal,
  detectMergeBranch,
  forkDecisionToastWording,
  USER_DISABLED_COPY,
  DELETE_COPY,
  FORK_DECISION_COPY,
};
