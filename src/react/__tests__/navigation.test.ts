// ══ NAVIGATION HELPER TESTS — Mockup goto() Convention LOCK ═══════════════

import { describe, it, expect } from 'vitest';
import { gotoPath } from '../lib/navigation';

describe('Navigation helper — mockup goto() convention LOCK', () => {
  it('splash → /', () => {
    expect(gotoPath('splash')).toBe('/');
  });

  it('auth → /auth', () => {
    expect(gotoPath('auth')).toBe('/auth');
  });

  it('auth-reactivate → /auth/reactivate', () => {
    expect(gotoPath('auth-reactivate')).toBe('/auth/reactivate');
  });

  it('onb-1 → /onboarding/1', () => {
    expect(gotoPath('onb-1')).toBe('/onboarding/1');
  });

  it('onb-7 → /onboarding/7', () => {
    expect(gotoPath('onb-7')).toBe('/onboarding/7');
  });

  it('antrenor → /app/antrenor', () => {
    expect(gotoPath('antrenor')).toBe('/app/antrenor');
  });

  it('progres → /app/progres', () => {
    expect(gotoPath('progres')).toBe('/app/progres');
  });

  it('istoric → /app/istoric', () => {
    expect(gotoPath('istoric')).toBe('/app/istoric');
  });

  it('cont → /app/cont', () => {
    expect(gotoPath('cont')).toBe('/app/cont');
  });
});
