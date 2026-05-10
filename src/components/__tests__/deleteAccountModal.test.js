import { describe, it, expect } from 'vitest';
import {
  REQUIRED_CONFIRMATION,
  DELETE_COPY,
  isValidConfirmation,
  renderDeletePostSplash,
} from '../deleteAccountModal.js';

describe('§56.5.2 Delete account modal — wording UI LOCKED V1 verbatim', () => {
  it('REQUIRED_CONFIRMATION is exact "STERGE" (post NO_DIACRITICS_RULE 2026-05-10)', () => {
    expect(REQUIRED_CONFIRMATION).toBe('STERGE');
    expect(REQUIRED_CONFIRMATION.charCodeAt(0)).toBe(0x0053);
  });

  it('DELETE_COPY.step1 verbatim spec', () => {
    expect(DELETE_COPY.step1).toBe('Aceasta actiune va sterge contul in 30 de zile. Te poti razgandi in acest interval. Pentru a confirma, scrie STERGE mai jos.');
  });

  it('DELETE_COPY.splash verbatim spec', () => {
    expect(DELETE_COPY.splash).toBe('Contul tau este programat pentru stergere definitiva in 30 de zile. Daca te razgandesti, trimite un e-mail la suport@andura.app.');
  });

  it('DELETE_COPY frozen', () => {
    expect(Object.isFrozen(DELETE_COPY)).toBe(true);
  });
});

describe('isValidConfirmation — case-sensitive (post NO_DIACRITICS_RULE 2026-05-10)', () => {
  it('"STERGE" → true', () => {
    expect(isValidConfirmation('STERGE')).toBe(true);
  });
  it('"sterge" lowercase → false', () => {
    expect(isValidConfirmation('sterge')).toBe(false);
  });
  it('" STERGE " whitespace → false (strict equals, NU trim)', () => {
    expect(isValidConfirmation(' STERGE ')).toBe(false);
  });
  it('empty string → false', () => {
    expect(isValidConfirmation('')).toBe(false);
  });
  it('null/undefined → false', () => {
    expect(isValidConfirmation(null)).toBe(false);
    expect(isValidConfirmation(undefined)).toBe(false);
  });
});

describe('renderDeletePostSplash', () => {
  it('null doc → null', () => {
    expect(renderDeletePostSplash({ doc: null })).toBe(null);
  });
});
