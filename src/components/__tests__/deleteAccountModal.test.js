import { describe, it, expect } from 'vitest';
import {
  REQUIRED_CONFIRMATION,
  DELETE_COPY,
  isValidConfirmation,
  renderDeletePostSplash,
} from '../deleteAccountModal.js';

describe('§56.5.2 Delete account modal — wording UI LOCKED V1 verbatim', () => {
  it('REQUIRED_CONFIRMATION is exact "ȘTERGE" cu Ș U+0218', () => {
    expect(REQUIRED_CONFIRMATION).toBe('ȘTERGE');
    // Verify Ș is U+0218 (Latin Capital Letter S with Comma Below)
    expect(REQUIRED_CONFIRMATION.charCodeAt(0)).toBe(0x0218);
  });

  it('DELETE_COPY.step1 verbatim spec', () => {
    expect(DELETE_COPY.step1).toBe('Această acțiune va șterge contul în 30 de zile. Te poți răzgândi în acest interval. Pentru a confirma, scrie ȘTERGE mai jos.');
  });

  it('DELETE_COPY.splash verbatim spec', () => {
    expect(DELETE_COPY.splash).toBe('Contul tău este programat pentru ștergere definitivă în 30 de zile. Dacă te răzgândești, trimite un e-mail la suport@andura.app.');
  });

  it('DELETE_COPY frozen', () => {
    expect(Object.isFrozen(DELETE_COPY)).toBe(true);
  });
});

describe('isValidConfirmation — case-sensitive RO diacritics strict', () => {
  it('"ȘTERGE" (Ș U+0218) → true', () => {
    expect(isValidConfirmation('ȘTERGE')).toBe(true);
  });
  it('"STERGE" (S U+0053 Latin) → false', () => {
    expect(isValidConfirmation('STERGE')).toBe(false);
  });
  it('"șterge" lowercase → false', () => {
    expect(isValidConfirmation('șterge')).toBe(false);
  });
  it('"sterge" lowercase fără diacritic → false', () => {
    expect(isValidConfirmation('sterge')).toBe(false);
  });
  it('" ȘTERGE " whitespace → false (strict equals, NU trim)', () => {
    expect(isValidConfirmation(' ȘTERGE ')).toBe(false);
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
