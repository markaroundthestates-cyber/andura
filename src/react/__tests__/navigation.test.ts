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

  it('onb-8 → /onboarding/8 (P-02 height step)', () => {
    expect(gotoPath('onb-8')).toBe('/onboarding/8');
  });

  it('onb-9 → /onboarding/9 (summary step, training-type 2026-05-30)', () => {
    expect(gotoPath('onb-9')).toBe('/onboarding/9');
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

describe('Navigation helper — Phase 3 Antrenor sub-screens nested', () => {
  it('energy-check → /app/antrenor/energy-check', () => {
    expect(gotoPath('energy-check')).toBe('/app/antrenor/energy-check');
  });

  it('energy-cause → /app/antrenor/energy-cause', () => {
    expect(gotoPath('energy-cause')).toBe('/app/antrenor/energy-cause');
  });

  it('time-budget → /app/antrenor/time-budget', () => {
    expect(gotoPath('time-budget')).toBe('/app/antrenor/time-budget');
  });

  it('workout-preview → /app/antrenor/workout-preview', () => {
    expect(gotoPath('workout-preview')).toBe('/app/antrenor/workout-preview');
  });

  it('workout → /app/antrenor/workout', () => {
    expect(gotoPath('workout')).toBe('/app/antrenor/workout');
  });

  it('ceva-nu-merge → /app/antrenor/ceva-nu-merge', () => {
    expect(gotoPath('ceva-nu-merge')).toBe('/app/antrenor/ceva-nu-merge');
  });

  it('pain-button → /app/antrenor/pain-button', () => {
    expect(gotoPath('pain-button')).toBe('/app/antrenor/pain-button');
  });

  it('equipment-swap → /app/antrenor/equipment-swap', () => {
    expect(gotoPath('equipment-swap')).toBe('/app/antrenor/equipment-swap');
  });

  it('aparate-lipsa → /app/antrenor/aparate-lipsa', () => {
    expect(gotoPath('aparate-lipsa')).toBe('/app/antrenor/aparate-lipsa');
  });

  it('schedule-override → /app/antrenor/schedule-override', () => {
    expect(gotoPath('schedule-override')).toBe('/app/antrenor/schedule-override');
  });

  it('post-rpe → /app/antrenor/post-rpe', () => {
    expect(gotoPath('post-rpe')).toBe('/app/antrenor/post-rpe');
  });

  it('post-summary → /app/antrenor/post-summary', () => {
    expect(gotoPath('post-summary')).toBe('/app/antrenor/post-summary');
  });

  it('throws pentru unknown screen (runtime fallback)', () => {
    expect(() =>
      // @ts-expect-error testing runtime fallback la unknown screen
      gotoPath('unknown-fake-screen')
    ).toThrow(/Unknown screen/);
  });
});
