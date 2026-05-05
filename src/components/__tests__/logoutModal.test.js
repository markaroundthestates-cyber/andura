import { describe, it, expect, beforeEach } from 'vitest';
import {
  LOGOUT_COPY,
  openLogoutStep1,
  openLogoutStep2,
  renderLogoutSplash,
} from '../logoutModal.js';

describe('§56.12 Logout — wording UI LOCKED V1 verbatim', () => {
  it('step1Prompt verbatim', () => {
    expect(LOGOUT_COPY.step1Prompt).toBe('Vei fi deconectat. Continui?');
  });
  it('wipeCheckboxLabel verbatim', () => {
    expect(LOGOUT_COPY.wipeCheckboxLabel).toBe('Șterge și datele locale de pe acest dispozitiv');
  });
  it('step2Prompt verbatim (anti-tap-accidental Maria 65)', () => {
    expect(LOGOUT_COPY.step2Prompt).toBe('Sigur vrei să te deconectezi?');
  });
  it('step2Detail verbatim', () => {
    expect(LOGOUT_COPY.step2Detail).toBe('Va trebui să te autentifici din nou pentru a-ți vedea datele.');
  });
  it('splash post-logout verbatim', () => {
    expect(LOGOUT_COPY.splash).toBe('Te-ai deconectat. Revino oricând.');
  });
  it('LOGOUT_COPY frozen', () => {
    expect(Object.isFrozen(LOGOUT_COPY)).toBe(true);
  });
});

describe('openLogoutStep1 — checkbox default OFF + branch coverage', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('null doc → resolves cancel default', async () => {
    const r = await openLogoutStep1({ doc: null });
    expect(r.continue).toBe(false);
    expect(r.wipeLocal).toBe(false);
  });

  it('renders checkbox default OFF (per §56.12 LOCKED V1)', async () => {
    const promise = openLogoutStep1({ doc: document });
    const checkbox = document.querySelector('.andura-logout-wipe-checkbox');
    expect(checkbox).not.toBeNull();
    expect(checkbox.checked).toBe(false);
    // Cancel to cleanup
    document.querySelector('.andura-modal-button-secondary').click();
    await promise;
  });

  it('Continue without checkbox → wipeLocal false', async () => {
    const promise = openLogoutStep1({ doc: document });
    document.querySelector('.andura-modal-button-primary').click();
    const r = await promise;
    expect(r.continue).toBe(true);
    expect(r.wipeLocal).toBe(false);
  });

  it('Continue with checkbox bifat → wipeLocal true', async () => {
    const promise = openLogoutStep1({ doc: document });
    document.querySelector('.andura-logout-wipe-checkbox').checked = true;
    document.querySelector('.andura-modal-button-primary').click();
    const r = await promise;
    expect(r.continue).toBe(true);
    expect(r.wipeLocal).toBe(true);
  });

  it('Cancel → continue false', async () => {
    const promise = openLogoutStep1({ doc: document });
    document.querySelector('.andura-modal-button-secondary').click();
    const r = await promise;
    expect(r.continue).toBe(false);
  });
});

describe('openLogoutStep2 — anti-tap-accidental confirm', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders prompt + detail wording', async () => {
    const promise = openLogoutStep2({ doc: document });
    const overlay = document.querySelector('.andura-logout-step2');
    expect(overlay).not.toBeNull();
    expect(overlay.querySelector('.andura-modal-prompt').textContent).toBe(LOGOUT_COPY.step2Prompt);
    expect(overlay.querySelector('.andura-modal-detail').textContent).toBe(LOGOUT_COPY.step2Detail);
    document.querySelector('.andura-modal-button-secondary').click();
    await promise;
  });

  it('Confirm → confirmed true', async () => {
    const promise = openLogoutStep2({ doc: document });
    document.querySelector('.andura-modal-button-primary').click();
    const r = await promise;
    expect(r.confirmed).toBe(true);
  });

  it('Cancel → confirmed false', async () => {
    const promise = openLogoutStep2({ doc: document });
    document.querySelector('.andura-modal-button-secondary').click();
    const r = await promise;
    expect(r.confirmed).toBe(false);
  });
});

describe('renderLogoutSplash', () => {
  it('null doc → null', () => {
    expect(renderLogoutSplash({ doc: null })).toBe(null);
  });
});
