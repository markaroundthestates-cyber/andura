// ══ SETTINGS PAGE — Auth Phase 2 Batch 2 wiring (§56.5 + §56.7 LOCKED V1) ═══
// Per `06-sessions-log/_FROZEN/HANDOVER_AUTH_FLOW_2026-04-30_evening.md` §56.5 +
// §56.7 + §56.12 (Logout — wired in batch 3).
//
// NU framework — vanilla JS DOM render per ADR 005 conventions.

import { openRecoveryEmailLostModal } from '../components/recoveryEmailLostModal.js';
import { openDeleteAccountModal, renderDeletePostSplash, DELETE_COPY } from '../components/deleteAccountModal.js';
import { openEmailChangeForm, EMAIL_CHANGE_COPY } from '../components/emailChangeForm.js';
import { openForkDecisionModal, detectMergeBranch, forkDecisionToastWording, FORK_DECISION_COPY } from '../components/forkDecisionModal.js';
import { openLogoutStep1, openLogoutStep2, renderLogoutSplash, LOGOUT_COPY } from '../components/logoutModal.js';
import { signOut, buildSoftDeleteFlag, getAuthState, USER_DISABLED_COPY } from '../auth.js';
import { wipeUserDB } from '../storage/db.js';
import { trackEvent, EVENTS } from '../util/telemetry.js';

// Splash visibility window before redirect home (UX-2). Long enough Maria 65
// reads "Te-ai deconectat. Revino oricand." sau delete confirm message.
const SPLASH_VISIBLE_MS = 1500;

/**
 * UX-1 mutual exclusivity helper: close any open Settings modal overlay
 * before opening a new one. Prevents confusing 2-modals-stacked state.
 *
 * Strategy: remove all `.andura-modal-overlay` elements from doc.body. Each
 * overlay manages its own pending Promise resolution via internal click
 * handlers — DOM removal NU rejects the pending Promise (caller must accept
 * stale resolution sau cancel pattern). Acceptable trade-off pentru UX
 * sanity vs Promise leak (Garbage-collected post-microtask).
 *
 * @param {Document} doc
 */
export function _closeAllSettingsModals(doc) {
  if (!doc || !doc.querySelectorAll) return;
  const overlays = doc.querySelectorAll('.andura-modal-overlay');
  overlays.forEach((el) => { try { el.remove(); } catch { /* swallow */ } });
}

/**
 * Render the Settings page into the given root element.
 * Wires sections: Email change + Recovery email lost + Delete account + Logout.
 *
 * UX-1: clicking any section button closes any other open Settings modal first
 * (mutual exclusivity — only 1 modal active at a time).
 * UX-2: post-logout / post-account-delete signOut → invokes `onSignedOut`
 * callback (default redirects to home page) after splash visibility window.
 *
 * @param {object} opts
 * @param {HTMLElement} opts.root           container element
 * @param {Document} [opts.doc]             test injection
 * @param {() => Promise<void>} [opts.onAccountDeleted]  callback post soft-delete confirm
 * @param {(email: string) => Promise<{ ok: boolean, error?: string }>} [opts.onEmailChangeSubmit]
 * @param {() => void} [opts.onSignedOut]   callback invoked post signOut + splash (UX-2 redirect home)
 * @param {(fn: () => void, ms: number) => unknown} [opts.scheduler]  setTimeout injection (test)
 */
export function renderSettingsPage({
  root,
  doc = (typeof document !== 'undefined' ? document : null),
  onAccountDeleted,
  onEmailChangeSubmit,
  onSignedOut,
  scheduler = (typeof setTimeout !== 'undefined' ? setTimeout : null),
}) {
  if (!root || !doc) return;
  root.innerHTML = '';

  /**
   * Lazy-resolve default redirect — imports nav.js dynamic so that test
   * environments cu `onSignedOut` injection nu burden import graph.
   * Production: invokes `goTo('coach')` to land user on home tab.
   */
  const _defaultSignedOutRedirect = () => {
    import('../ui/nav.js')
      .then((m) => { try { m.goTo('coach'); } catch { /* swallow */ } })
      .catch(() => { /* swallow non-DOM env */ });
  };
  const _onSignedOut = typeof onSignedOut === 'function' ? onSignedOut : _defaultSignedOutRedirect;

  const heading = doc.createElement('h1');
  heading.textContent = 'Setari';
  root.appendChild(heading);

  // §56.5.4 Email change section
  const sectionEmail = doc.createElement('section');
  sectionEmail.className = 'andura-settings-section andura-settings-email-change';
  const emailHeader = doc.createElement('h2');
  emailHeader.textContent = 'Schimba adresa de e-mail';
  sectionEmail.appendChild(emailHeader);
  const btnEmailChange = doc.createElement('button');
  btnEmailChange.textContent = 'Schimba adresa';
  btnEmailChange.addEventListener('click', async () => {
    _closeAllSettingsModals(doc);
    const result = await openEmailChangeForm({ doc });
    if (result.submitted && typeof onEmailChangeSubmit === 'function') {
      const out = await onEmailChangeSubmit(result.email).catch(() => ({ ok: false, error: 'unknown' }));
      if (!out.ok && out.error === 'EMAIL_EXISTS') {
        const errModal = doc.createElement('div');
        errModal.className = 'andura-modal-overlay andura-error-modal';
        errModal.textContent = EMAIL_CHANGE_COPY.errorAlreadyUsed;
        const close = doc.createElement('button');
        close.textContent = 'Inchide';
        close.addEventListener('click', () => { try { errModal.remove(); } catch {} });
        errModal.appendChild(close);
        doc.body.appendChild(errModal);
      }
    }
  });
  sectionEmail.appendChild(btnEmailChange);
  root.appendChild(sectionEmail);

  // Bundle 3 V1 2026-05-13: Aparate lipsa section — permanent missing-equipment picker
  // entry button. Mirrors mockup §settings-row L1865 parity. Coach engine #2
  // buildSession() consumes wv2-missing-equipment registry post-S2.B coachContext.js
  // (commit fce846a). Anti-paternalism: user opt-in via Cont permanent list.
  const sectionAparate = doc.createElement('section');
  sectionAparate.className = 'andura-settings-section andura-settings-aparate-lipsa';
  const aparateHeader = doc.createElement('h2');
  aparateHeader.textContent = 'Aparate lipsa';
  sectionAparate.appendChild(aparateHeader);
  const btnAparate = doc.createElement('button');
  btnAparate.textContent = 'Aparate lipsa';
  btnAparate.addEventListener('click', async () => {
    _closeAllSettingsModals(doc);
    const m = await import('./coach/aparateLipsa.js');
    if (typeof m.showAparateLipsa === 'function') m.showAparateLipsa();
  });
  sectionAparate.appendChild(btnAparate);
  root.appendChild(sectionAparate);

  // §56.5.1 Recovery email lost section
  const sectionRecovery = doc.createElement('section');
  sectionRecovery.className = 'andura-settings-section andura-settings-recovery-email';
  const recoveryHeader = doc.createElement('h2');
  recoveryHeader.textContent = 'Acces pierdut la e-mail';
  sectionRecovery.appendChild(recoveryHeader);
  const btnRecoveryLost = doc.createElement('button');
  btnRecoveryLost.textContent = 'Mi-am pierdut accesul la email';
  btnRecoveryLost.addEventListener('click', () => {
    _closeAllSettingsModals(doc);
    openRecoveryEmailLostModal({ doc });
  });
  sectionRecovery.appendChild(btnRecoveryLost);
  root.appendChild(sectionRecovery);

  // §56.5.2 Delete account section
  const sectionDelete = doc.createElement('section');
  sectionDelete.className = 'andura-settings-section andura-settings-delete-account';
  const deleteHeader = doc.createElement('h2');
  deleteHeader.textContent = 'Cont';
  sectionDelete.appendChild(deleteHeader);
  const btnDelete = doc.createElement('button');
  btnDelete.textContent = 'Sterge cont definitiv';
  btnDelete.className = 'andura-button-danger';
  btnDelete.addEventListener('click', async () => {
    _closeAllSettingsModals(doc);
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
      // UX-2: post-signOut redirect home after splash visibility window.
      if (typeof scheduler === 'function') {
        scheduler(_onSignedOut, SPLASH_VISIBLE_MS);
      }
    }
  });
  sectionDelete.appendChild(btnDelete);
  root.appendChild(sectionDelete);

  // §56.12 Logout section (batch 3)
  const sectionLogout = doc.createElement('section');
  sectionLogout.className = 'andura-settings-section andura-settings-logout';
  const logoutHeader = doc.createElement('h2');
  logoutHeader.textContent = 'Deconectare';
  sectionLogout.appendChild(logoutHeader);
  const btnLogout = doc.createElement('button');
  btnLogout.textContent = 'Deconectare';
  btnLogout.className = 'andura-button-logout';
  btnLogout.addEventListener('click', async () => {
    _closeAllSettingsModals(doc);
    const step1 = await openLogoutStep1({ doc });
    if (!step1.continue) return;
    const step2 = await openLogoutStep2({ doc });
    if (!step2.confirmed) return;
    const auth = getAuthState();
    const uid = auth?.uid;
    try { signOut(); } catch {}
    if (step1.wipeLocal && uid) {
      try { await wipeUserDB(uid); } catch {}
      try { await trackEvent(EVENTS.LOGOUT_WITH_WIPE); } catch {}
    } else {
      try { await trackEvent(EVENTS.LOGOUT_NO_WIPE); } catch {}
    }
    const splash = renderLogoutSplash({ doc });
    root.innerHTML = '';
    if (splash) root.appendChild(splash);
    // UX-2: post-signOut redirect home after splash visibility window.
    if (typeof scheduler === 'function') {
      scheduler(_onSignedOut, SPLASH_VISIBLE_MS);
    }
  });
  sectionLogout.appendChild(btnLogout);
  root.appendChild(sectionLogout);
}

/**
 * Convenience wrapper used by the SPA router (`src/ui/nav.js`).
 * Finds `#page-settings` in DOM si render-eaza cu defaults.
 *
 * No-op silent daca DOM/element absent (server-side render compatibility).
 */
export function renderSettings() {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('page-settings');
  if (!root) return;
  renderSettingsPage({ root, doc: document });
}

// Re-export public API for callers wiring routes.
export {
  openRecoveryEmailLostModal,
  openDeleteAccountModal,
  openForkDecisionModal,
  openLogoutStep1,
  openLogoutStep2,
  detectMergeBranch,
  forkDecisionToastWording,
  USER_DISABLED_COPY,
  DELETE_COPY,
  FORK_DECISION_COPY,
  LOGOUT_COPY,
};
