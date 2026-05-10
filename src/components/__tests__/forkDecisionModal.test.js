import { describe, it, expect } from 'vitest';
import {
  FORK_DECISION_COPY,
  detectMergeBranch,
  forkDecisionToastWording,
} from '../forkDecisionModal.js';

describe('§56.7 Fork Decision UI — wording LOCKED V1 verbatim', () => {
  it('prompt verbatim', () => {
    expect(FORK_DECISION_COPY.prompt).toBe('Am gasit un istoric in cloud. Ce vrei sa pastrezi?');
  });
  it('optionTelefon verbatim', () => {
    expect(FORK_DECISION_COPY.optionTelefon).toBe('[Telefon] — Datele de pe acest dispozitiv (anonim)');
  });
  it('optionCloud verbatim', () => {
    expect(FORK_DECISION_COPY.optionCloud).toBe('[Cloud] — Datele din contul tau existent');
  });
  it('archiveNote verbatim', () => {
    expect(FORK_DECISION_COPY.archiveNote).toBe('Sursa pe care nu o alegi va fi arhivata 7 zile (recuperabila din Setari).');
  });
  it('toastTelefonChosen verbatim', () => {
    expect(FORK_DECISION_COPY.toastTelefonChosen).toBe('Datele din [Cloud] au fost arhivate. Le poti recupera timp de 7 zile din zona de Setari.');
  });
  it('toastCloudChosen verbatim', () => {
    expect(FORK_DECISION_COPY.toastCloudChosen).toBe('Datele din [Telefon] au fost arhivate. Le poti recupera timp de 7 zile din zona de Setari.');
  });
  it('FORK_DECISION_COPY frozen', () => {
    expect(Object.isFrozen(FORK_DECISION_COPY)).toBe(true);
  });
});

describe('detectMergeBranch — branch logic per §56.7 pseudo-code', () => {
  it('both non-empty → fork', () => {
    expect(detectMergeBranch({ anonymousData: true, cloudData: true })).toBe('fork');
  });
  it('anonymous only → auto-migrate', () => {
    expect(detectMergeBranch({ anonymousData: true, cloudData: false })).toBe('auto-migrate');
  });
  it('cloud only → use-cloud', () => {
    expect(detectMergeBranch({ anonymousData: false, cloudData: true })).toBe('use-cloud');
  });
  it('neither → use-cloud (no-op equivalent)', () => {
    expect(detectMergeBranch({ anonymousData: false, cloudData: false })).toBe('use-cloud');
  });
});

describe('forkDecisionToastWording', () => {
  it('telefon → "Datele din [Cloud]" toast', () => {
    expect(forkDecisionToastWording('telefon')).toBe(FORK_DECISION_COPY.toastTelefonChosen);
  });
  it('cloud → "Datele din [Telefon]" toast', () => {
    expect(forkDecisionToastWording('cloud')).toBe(FORK_DECISION_COPY.toastCloudChosen);
  });
});

describe('Fork Decision UI rendering — ZERO default highlight enforced', () => {
  // jsdom DOM tests
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  it('both buttons have IDENTICAL class (no default highlight)', async () => {
    const { openForkDecisionModal } = await import('../forkDecisionModal.js');
    // Open modal
    const promise = openForkDecisionModal({ doc: document });
    const buttons = document.querySelectorAll('.andura-fork-button');
    expect(buttons.length).toBe(2);
    // ZERO default highlight: identical class, no autofocus, no aria-default
    expect(buttons[0].className).toBe(buttons[1].className);
    expect(buttons[0].hasAttribute('autofocus')).toBe(false);
    expect(buttons[1].hasAttribute('autofocus')).toBe(false);
    expect(buttons[0].getAttribute('aria-default')).toBe(null);
    expect(buttons[1].getAttribute('aria-default')).toBe(null);
    // Cleanup: click one to resolve promise
    buttons[0].click();
    await promise;
  });
});
