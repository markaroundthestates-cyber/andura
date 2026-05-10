import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderSettingsPage, _closeAllSettingsModals } from '../settings.js';

describe('Settings page render — Auth Phase 2 Batch 2', () => {
  let root;
  beforeEach(() => {
    document.body.innerHTML = '';
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  it('renders Setari heading', () => {
    renderSettingsPage({ root, doc: document });
    expect(root.querySelector('h1').textContent).toBe('Setari');
  });

  it('renders 4 sections (email change + recovery + delete + logout)', () => {
    renderSettingsPage({ root, doc: document });
    const sections = root.querySelectorAll('section');
    expect(sections.length).toBe(4);
  });

  it('logout section has button cu wording "Deconectare"', () => {
    renderSettingsPage({ root, doc: document });
    const section = root.querySelector('.andura-settings-logout');
    expect(section).not.toBeNull();
    const btn = section.querySelector('.andura-button-logout');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('Deconectare');
  });

  it('email change section has button', () => {
    renderSettingsPage({ root, doc: document });
    const section = root.querySelector('.andura-settings-email-change');
    expect(section.querySelector('button')).not.toBeNull();
  });

  it('recovery email lost section has button cu wording exact', () => {
    renderSettingsPage({ root, doc: document });
    const section = root.querySelector('.andura-settings-recovery-email');
    const btn = section.querySelector('button');
    expect(btn.textContent).toBe('Mi-am pierdut accesul la email');
  });

  it('delete account section has danger button', () => {
    renderSettingsPage({ root, doc: document });
    const section = root.querySelector('.andura-settings-delete-account');
    const btn = section.querySelector('button.andura-button-danger');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('Sterge cont definitiv');
  });

  it('null root no-throw', () => {
    expect(() => renderSettingsPage({ root: null, doc: document })).not.toThrow();
  });
});

describe('UX-1 mutual exclusivity — _closeAllSettingsModals helper', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('removes single overlay', () => {
    const overlay = document.createElement('div');
    overlay.className = 'andura-modal-overlay andura-recovery-email-lost-modal';
    document.body.appendChild(overlay);
    expect(document.querySelectorAll('.andura-modal-overlay').length).toBe(1);
    _closeAllSettingsModals(document);
    expect(document.querySelectorAll('.andura-modal-overlay').length).toBe(0);
  });

  it('removes ALL overlays simultaneously (UX-1 strict)', () => {
    ['andura-email-change-form', 'andura-delete-account-modal', 'andura-fork-decision-modal']
      .forEach((cls) => {
        const o = document.createElement('div');
        o.className = `andura-modal-overlay ${cls}`;
        document.body.appendChild(o);
      });
    expect(document.querySelectorAll('.andura-modal-overlay').length).toBe(3);
    _closeAllSettingsModals(document);
    expect(document.querySelectorAll('.andura-modal-overlay').length).toBe(0);
  });

  it('no-op when no overlays present', () => {
    _closeAllSettingsModals(document);
    expect(document.querySelectorAll('.andura-modal-overlay').length).toBe(0);
  });

  it('null doc no-throw', () => {
    expect(() => _closeAllSettingsModals(null)).not.toThrow();
    expect(() => _closeAllSettingsModals(undefined)).not.toThrow();
  });
});

describe('UX-1 mutual exclusivity — Settings buttons close prev modal first', () => {
  let root;
  beforeEach(() => {
    document.body.innerHTML = '';
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  it('clicking another section while modal open closes prev modal first', async () => {
    renderSettingsPage({ root, doc: document });
    // Simulate: user clicks "Schimba adresa" → email modal opens
    const btnEmail = root.querySelector('.andura-settings-email-change button');
    btnEmail.click();
    // At this point an email-change form overlay should be in doc.body
    let overlays = document.querySelectorAll('.andura-modal-overlay');
    expect(overlays.length).toBe(1);
    expect(overlays[0].classList.contains('andura-email-change-form')).toBe(true);

    // Now user clicks "Mi-am pierdut accesul" — should close email modal first
    const btnRecovery = root.querySelector('.andura-settings-recovery-email button');
    btnRecovery.click();
    // After click: only ONE overlay (recovery modal)
    overlays = document.querySelectorAll('.andura-modal-overlay');
    expect(overlays.length).toBe(1);
    expect(overlays[0].classList.contains('andura-recovery-email-lost-modal')).toBe(true);
  });

  it('clicking delete after email change → email closed + delete opens singular', async () => {
    renderSettingsPage({ root, doc: document });
    root.querySelector('.andura-settings-email-change button').click();
    expect(document.querySelector('.andura-email-change-form')).not.toBeNull();

    root.querySelector('.andura-settings-delete-account button').click();
    expect(document.querySelector('.andura-email-change-form')).toBeNull();
    expect(document.querySelector('.andura-delete-account-modal')).not.toBeNull();
    expect(document.querySelectorAll('.andura-modal-overlay').length).toBe(1);
  });

  it('clicking logout after another open modal → prev closed + logout opens', async () => {
    renderSettingsPage({ root, doc: document });
    root.querySelector('.andura-settings-recovery-email button').click();
    expect(document.querySelector('.andura-recovery-email-lost-modal')).not.toBeNull();

    root.querySelector('.andura-settings-logout button').click();
    expect(document.querySelector('.andura-recovery-email-lost-modal')).toBeNull();
    expect(document.querySelector('.andura-logout-step1')).not.toBeNull();
    expect(document.querySelectorAll('.andura-modal-overlay').length).toBe(1);
  });
});

describe('UX-2 post-logout redirect home — onSignedOut callback', () => {
  let root;
  beforeEach(() => {
    document.body.innerHTML = '';
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  it('logout flow invokes onSignedOut after splash via scheduler', async () => {
    const onSignedOut = vi.fn();
    let scheduledCb = null;
    const scheduler = vi.fn((cb, ms) => { scheduledCb = cb; return 1; });
    renderSettingsPage({ root, doc: document, onSignedOut, scheduler });

    // Click Deconectare → step1 opens
    root.querySelector('.andura-settings-logout button').click();
    // step 1 confirm via Continua button (default checkbox OFF wipeLocal=false)
    let step1Continue = document.querySelector('.andura-logout-step1 .andura-modal-button-primary');
    expect(step1Continue).not.toBeNull();
    step1Continue.click();
    // Wait microtask for step 2 to mount
    await new Promise((r) => setTimeout(r, 0));
    let step2Confirm = document.querySelector('.andura-logout-step2 .andura-modal-button-primary');
    expect(step2Confirm).not.toBeNull();
    step2Confirm.click();
    // Wait for async logout flow + splash render
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    // Splash should be rendered + scheduler called
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(scheduler.mock.calls[0][1]).toBeGreaterThanOrEqual(1000);

    // Manually invoke scheduled callback (test simulates timeout fire)
    expect(onSignedOut).not.toHaveBeenCalled();
    scheduledCb();
    expect(onSignedOut).toHaveBeenCalledTimes(1);
  });

  it('delete account flow invokes onSignedOut after splash via scheduler', async () => {
    const onSignedOut = vi.fn();
    let scheduledCb = null;
    const scheduler = vi.fn((cb, ms) => { scheduledCb = cb; return 1; });
    renderSettingsPage({ root, doc: document, onSignedOut, scheduler });

    // Click Sterge cont → delete modal opens
    root.querySelector('.andura-settings-delete-account button').click();
    // Type STERGE + click Confirma
    const input = document.querySelector('.andura-delete-account-modal .andura-modal-input');
    input.value = 'STERGE';
    input.dispatchEvent(new Event('input'));
    const btnConfirm = document.querySelector('.andura-delete-account-modal .andura-modal-button-primary');
    btnConfirm.click();
    // Wait for async delete flow + splash render
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    // Scheduler called for redirect home
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(onSignedOut).not.toHaveBeenCalled();
    scheduledCb();
    expect(onSignedOut).toHaveBeenCalledTimes(1);
  });

  it('logout cancelled → onSignedOut NU invoked', async () => {
    const onSignedOut = vi.fn();
    const scheduler = vi.fn();
    renderSettingsPage({ root, doc: document, onSignedOut, scheduler });

    root.querySelector('.andura-settings-logout button').click();
    // Cancel step1
    const cancel = document.querySelector('.andura-logout-step1 .andura-modal-button-secondary');
    cancel.click();
    await new Promise((r) => setTimeout(r, 0));

    expect(scheduler).not.toHaveBeenCalled();
    expect(onSignedOut).not.toHaveBeenCalled();
  });
});
