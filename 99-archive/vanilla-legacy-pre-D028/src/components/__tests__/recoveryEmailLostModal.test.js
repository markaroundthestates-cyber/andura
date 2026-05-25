import { describe, it, expect } from 'vitest';
import { RECOVERY_EMAIL_LOST_COPY, openRecoveryEmailLostModal } from '../recoveryEmailLostModal.js';

describe('§56.5.1 Recovery email lost — wording LOCKED V1 verbatim', () => {
  it('RECOVERY_EMAIL_LOST_COPY verbatim', () => {
    expect(RECOVERY_EMAIL_LOST_COPY).toBe('Contul tau in cloud nu mai poate fi accesat. Totusi, datele tale de antrenament de pe acest dispozitiv sunt in siguranta si raman aici. Pierzi doar sincronizarea automata cu alte telefoane sau tablete.');
  });
});

describe('openRecoveryEmailLostModal — null doc resolves', () => {
  it('null doc → resolves immediately', async () => {
    await expect(openRecoveryEmailLostModal({ doc: null })).resolves.toBeUndefined();
  });
});

describe('openRecoveryEmailLostModal — DOM render', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders modal cu wording verbatim + Inteleg button + closes on click', async () => {
    const promise = openRecoveryEmailLostModal({ doc: document });
    const overlay = document.querySelector('.andura-recovery-email-lost-modal');
    expect(overlay).not.toBeNull();
    const body = overlay.querySelector('.andura-modal-body');
    expect(body.textContent).toBe(RECOVERY_EMAIL_LOST_COPY);
    const btn = overlay.querySelector('button');
    expect(btn.textContent).toBe('Inteleg');
    btn.click();
    await promise;
    expect(document.querySelector('.andura-recovery-email-lost-modal')).toBe(null);
  });
});
