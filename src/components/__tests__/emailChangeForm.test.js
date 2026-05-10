import { describe, it, expect } from 'vitest';
import {
  EMAIL_CHANGE_COPY,
  isValidEmail,
  validateEmailChangeInputs,
} from '../emailChangeForm.js';

describe('§56.5.4 Email change — wording LOCKED V1 verbatim', () => {
  it('errorAlreadyUsed verbatim', () => {
    expect(EMAIL_CHANGE_COPY.errorAlreadyUsed).toBe('Adresa este deja folosita de un alt cont.');
  });
  it('EMAIL_CHANGE_COPY frozen', () => {
    expect(Object.isFrozen(EMAIL_CHANGE_COPY)).toBe(true);
  });
});

describe('isValidEmail', () => {
  it('valid emails accepted', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('a.b+c@example.co.uk')).toBe(true);
  });
  it('invalid emails rejected', () => {
    expect(isValidEmail('plainstring')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('test@.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
  it('non-string → false', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
  });
});

describe('validateEmailChangeInputs — typo guard double-input', () => {
  it('both equal valid → valid', () => {
    expect(validateEmailChangeInputs('a@b.com', 'a@b.com').valid).toBe(true);
  });
  it('mismatch → mismatch reason', () => {
    const r = validateEmailChangeInputs('a@b.com', 'a@bx.com');
    expect(r.valid).toBe(false);
    expect(r.reason).toBe('mismatch');
  });
  it('invalid format primary → invalid_format', () => {
    const r = validateEmailChangeInputs('not-email', 'not-email');
    expect(r.valid).toBe(false);
    expect(r.reason).toBe('invalid_format');
  });
  it('whitespace handled (trim equiv)', () => {
    expect(validateEmailChangeInputs(' a@b.com ', 'a@b.com').valid).toBe(true);
  });
  it('null inputs → invalid', () => {
    expect(validateEmailChangeInputs(null, null).valid).toBe(false);
  });
});
