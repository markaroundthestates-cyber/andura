import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getWordingForTier,
  showAggressiveLoadingModal,
} from '../aggressiveLoadingModal.js';

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('getWordingForTier() — placeholders + tier mapping', () => {
  it('T0 wording mentions calibrare + actualKg substituted', () => {
    const w = getWordingForTier('T0', { actualKg: 60, recommendedKg: 40, deviationPct: 0.50 });
    expect(w).toContain('calibrare');
    expect(w).toContain('60 kg');
  });

  it('T1 wording = T0 wording (both calibration phase)', () => {
    const a = getWordingForTier('T0', { actualKg: 70, recommendedKg: 50, deviationPct: 0.40 });
    const b = getWordingForTier('T1', { actualKg: 70, recommendedKg: 50, deviationPct: 0.40 });
    expect(a).toBe(b);
  });

  it('T2 wording mentions recommended + deviation%', () => {
    const w = getWordingForTier('T2', { actualKg: 120, recommendedKg: 100, deviationPct: 0.20 });
    expect(w).toContain('120 kg');
    expect(w).toContain('100 kg');
    expect(w).toContain('+20%');
  });

  it('T3 wording = T2 wording (mature engine collapsed)', () => {
    const a = getWordingForTier('T2', { actualKg: 100, recommendedKg: 80, deviationPct: 0.25 });
    const b = getWordingForTier('T3', { actualKg: 100, recommendedKg: 80, deviationPct: 0.25 });
    expect(a).toBe(b);
  });

  it('unknown tier falls back to T2 wording', () => {
    const w = getWordingForTier('UNKNOWN_TIER', { actualKg: 100, recommendedKg: 80, deviationPct: 0.25 });
    const t2 = getWordingForTier('T2', { actualKg: 100, recommendedKg: 80, deviationPct: 0.25 });
    expect(w).toBe(t2);
  });

  it('deviationPct rounded to integer percent', () => {
    const w = getWordingForTier('T2', { actualKg: 100, recommendedKg: 80, deviationPct: 0.2567 });
    expect(w).toContain('+26%');
  });

  // Romanian-first no-diacritics LOCK V1 PERMANENT 2026-05-10 invariant.
  it('ZERO diacritics ș/ț/ă/â/î/Ș/Ț/Ă/Â/Î across all tier wordings', () => {
    const ctx = { actualKg: 100, recommendedKg: 80, deviationPct: 0.25 };
    const diacritics = /[șțăâîȘȚĂÂÎ]/;
    expect(getWordingForTier('T0', ctx)).not.toMatch(diacritics);
    expect(getWordingForTier('T1', ctx)).not.toMatch(diacritics);
    expect(getWordingForTier('T2', ctx)).not.toMatch(diacritics);
    expect(getWordingForTier('T3', ctx)).not.toMatch(diacritics);
  });
});

describe('showAggressiveLoadingModal() — DOM contract + override 1-tap', () => {
  it('renders overlay with tier-specific wording', async () => {
    const promise = showAggressiveLoadingModal({
      tier: 'T2',
      actualKg: 120,
      recommendedKg: 100,
      deviationPct: 0.20,
      exerciseName: 'Flat Barbell Bench',
    });
    const overlay = document.getElementById('aggressive-loading-modal');
    expect(overlay).toBeTruthy();
    expect(overlay.textContent).toContain('120 kg');
    expect(overlay.textContent).toContain('Flat Barbell Bench');

    document.querySelector('.btn-revert').click();
    await promise;
  });

  it('NO forced typing — zero input fields in modal DOM (ADR 013 §AMENDMENT 2026-04-30)', async () => {
    const promise = showAggressiveLoadingModal({
      tier: 'T0',
      actualKg: 80,
      recommendedKg: 50,
      deviationPct: 0.60,
    });
    const overlay = document.getElementById('aggressive-loading-modal');
    expect(overlay.querySelector('input')).toBeNull();
    expect(overlay.querySelector('textarea')).toBeNull();

    document.querySelector('.btn-continue').click();
    await promise;
  });

  it('continue button resolves with action="continue"', async () => {
    const promise = showAggressiveLoadingModal({
      tier: 'T1',
      actualKg: 80,
      recommendedKg: 60,
      deviationPct: 0.33,
    });
    document.querySelector('.btn-continue').click();
    const result = await promise;
    expect(result.action).toBe('continue');
    expect(result.source).toBe('continue-button');
  });

  it('revert button resolves with action="revert"', async () => {
    const promise = showAggressiveLoadingModal({
      tier: 'T2',
      actualKg: 100,
      recommendedKg: 80,
      deviationPct: 0.25,
    });
    document.querySelector('.btn-revert').click();
    const result = await promise;
    expect(result.action).toBe('revert');
    expect(result.source).toBe('revert-button');
  });

  it('modal removed from DOM after resolution', async () => {
    const promise = showAggressiveLoadingModal({
      tier: 'T0',
      actualKg: 60,
      recommendedKg: 40,
      deviationPct: 0.50,
    });
    document.querySelector('.btn-continue').click();
    await promise;
    expect(document.getElementById('aggressive-loading-modal')).toBeNull();
  });

  it('exerciseName HTML-escaped (XSS safety)', async () => {
    const promise = showAggressiveLoadingModal({
      tier: 'T2',
      actualKg: 100,
      recommendedKg: 80,
      deviationPct: 0.25,
      exerciseName: '<script>alert(1)</script>',
    });
    const overlay = document.getElementById('aggressive-loading-modal');
    expect(overlay.innerHTML).not.toContain('<script>alert(1)</script>');
    expect(overlay.querySelector('script')).toBeNull();
    document.querySelector('.btn-revert').click();
    await promise;
  });

  it('second invocation removes prior modal (no stacking)', async () => {
    const p1 = showAggressiveLoadingModal({
      tier: 'T0', actualKg: 60, recommendedKg: 40, deviationPct: 0.50,
    });
    const overlays1 = document.querySelectorAll('#aggressive-loading-modal');
    expect(overlays1.length).toBe(1);

    const p2 = showAggressiveLoadingModal({
      tier: 'T2', actualKg: 120, recommendedKg: 100, deviationPct: 0.20,
    });
    const overlays2 = document.querySelectorAll('#aggressive-loading-modal');
    expect(overlays2.length).toBe(1);

    document.querySelector('.btn-revert').click();
    await p2;
    // p1 promise stays unresolved — its DOM was forcibly removed; that's OK
    // because the caller pattern guarantees a single in-flight modal.
  });
});
