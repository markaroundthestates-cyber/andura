// ══ §56.5.2 + §56.5.3 + §56.7 detection helpers tests ════════════════════
import { describe, it, expect } from 'vitest';
import {
  USER_DISABLED_COPY,
  isUserDisabledError,
  buildSoftDeleteFlag,
  detectAnonymousLocalData,
  detectCloudUserData,
} from '../auth.js';

describe('§56.5.3 USER_DISABLED — wording + detector', () => {
  it('USER_DISABLED_COPY verbatim spec', () => {
    expect(USER_DISABLED_COPY).toBe('Acest cont este dezactivat si programat pentru stergere definitiva. Daca te-ai razgandit si vrei sa il reactivezi, trimite un e-mail la suport@andura.app in termenul de 30 de zile de la solicitare.');
  });

  it('isUserDisabledError matches "USER_DISABLED" exact', () => {
    expect(isUserDisabledError('USER_DISABLED')).toBe(true);
  });
  it('isUserDisabledError matches "USER_DISABLED" prefix (suffix tolerated)', () => {
    expect(isUserDisabledError('USER_DISABLED: Some detail')).toBe(true);
  });
  it('isUserDisabledError NU matches other codes', () => {
    expect(isUserDisabledError('INVALID_OOB_CODE')).toBe(false);
    expect(isUserDisabledError('EMAIL_NOT_FOUND')).toBe(false);
  });
  it('isUserDisabledError defensive null/undefined/non-string', () => {
    expect(isUserDisabledError(null)).toBe(false);
    expect(isUserDisabledError(undefined)).toBe(false);
    expect(isUserDisabledError(123)).toBe(false);
    expect(isUserDisabledError({})).toBe(false);
  });
});

describe('§56.5.2 buildSoftDeleteFlag — 30 zile grace schema', () => {
  it('returns { requestedAt, scheduledHardDelete } cu 30 zile diff', () => {
    const now = 1_700_000_000_000;
    const flag = buildSoftDeleteFlag(now);
    expect(flag.requestedAt).toBe(now);
    expect(flag.scheduledHardDelete).toBe(now + 30 * 24 * 60 * 60 * 1000);
  });
  it('default now = Date.now() if not passed', () => {
    const before = Date.now();
    const flag = buildSoftDeleteFlag();
    const after = Date.now();
    expect(flag.requestedAt).toBeGreaterThanOrEqual(before);
    expect(flag.requestedAt).toBeLessThanOrEqual(after);
  });
});

describe('§56.7 detect helpers — pure functions cu probe injection', () => {
  it('detectAnonymousLocalData(probe true) → true', async () => {
    expect(await detectAnonymousLocalData(async () => true)).toBe(true);
  });
  it('detectAnonymousLocalData(probe false) → false', async () => {
    expect(await detectAnonymousLocalData(async () => false)).toBe(false);
  });
  it('detectAnonymousLocalData defensive: probe throws → false', async () => {
    expect(await detectAnonymousLocalData(async () => { throw new Error('boom'); })).toBe(false);
  });
  it('detectAnonymousLocalData non-function → false', async () => {
    expect(await detectAnonymousLocalData(null)).toBe(false);
    expect(await detectAnonymousLocalData(undefined)).toBe(false);
    expect(await detectAnonymousLocalData('not a fn')).toBe(false);
  });
  it('detectCloudUserData same pattern as anonymous detect', async () => {
    expect(await detectCloudUserData(async () => true)).toBe(true);
    expect(await detectCloudUserData(async () => false)).toBe(false);
    expect(await detectCloudUserData(async () => { throw new Error(); })).toBe(false);
    expect(await detectCloudUserData(null)).toBe(false);
  });
});
