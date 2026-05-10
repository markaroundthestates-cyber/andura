// SafetyBanner wiring tests — Batch B Tasks 7-9.
import { describe, it, expect, vi } from 'vitest';
import {
  buildPlanAdjustedBanner,
  buildDeloadSkipBanner,
  buildPlateauBanner,
  SAFETY_WIRING_COPY,
} from '../safetyBannerWiring.js';
import { createSafetyBanner } from '../safetyBanner.js';
import { getDeloadSkipWarning } from '../../engine/progressionMatrix.js';

describe('Wiring 1 — F-NEW-4 plan-ajustat banner', () => {
  it('returns severity=info with LOCKED wording', () => {
    const b = buildPlanAdjustedBanner({ onUseOriginal: () => {} });
    expect(b.severity).toBe('info');
    expect(b.message).toBe('Plan ajustat astazi pentru recovery.');
    expect(b.action.label).toBe('Folosesc varianta mea');
    expect(b.dismissId).toBe('fnew4-plan-adjusted');
  });

  it('action.onClick fires the user callback', () => {
    const onUseOriginal = vi.fn();
    const b = buildPlanAdjustedBanner({ onUseOriginal });
    b.action.onClick();
    expect(onUseOriginal).toHaveBeenCalledTimes(1);
  });

  it('handles missing callback gracefully', () => {
    const b = buildPlanAdjustedBanner({});
    expect(() => b.action.onClick()).not.toThrow();
  });

  it('Anti-RE: zero numerics in banner output', () => {
    const b = buildPlanAdjustedBanner({ onUseOriginal: () => {} });
    expect(b.message).not.toMatch(/\d/);
    expect(b.message.toLowerCase()).not.toMatch(/deviation|threshold|%/);
  });

  it('renders correctly when fed to createSafetyBanner', () => {
    // Use sessionStorage mock so dismiss state is isolated.
    const storage = { _data: {}, getItem(k) { return this._data[k] ?? null; }, setItem(k, v) { this._data[k] = v; }, removeItem(k) { delete this._data[k]; } };
    const payload = buildPlanAdjustedBanner({ onUseOriginal: () => {} });
    const { element } = createSafetyBanner({ ...payload, storage });
    expect(element).not.toBeNull();
    expect(element.querySelector('.safety-banner__message').textContent)
      .toBe('Plan ajustat astazi pentru recovery.');
    expect(element.querySelector('.safety-banner__action').textContent)
      .toBe('Folosesc varianta mea');
  });
});

describe('Wiring 2 — F-NEW-2 deload skip banner', () => {
  it('returns severity=warning with LOCKED wording verbatim', () => {
    const b = buildDeloadSkipBanner();
    expect(b.severity).toBe('warning');
    expect(b.message).toBe(getDeloadSkipWarning());
    expect(b.dismissId).toBe('fnew2-deload-skip');
  });

  it('Anti-RE: no procentage or backend numerics', () => {
    const b = buildDeloadSkipBanner();
    expect(b.message).not.toMatch(/\d+%/);
    expect(b.message.toLowerCase()).not.toMatch(/volume_mul|intensity_mul|deviation/);
  });

  it('renders correctly when fed to createSafetyBanner', () => {
    const storage = { _data: {}, getItem(k) { return this._data[k] ?? null; }, setItem(k, v) { this._data[k] = v; }, removeItem(k) { delete this._data[k]; } };
    const { element } = createSafetyBanner({ ...buildDeloadSkipBanner(), storage });
    expect(element.getAttribute('data-severity')).toBe('warning');
    expect(element.querySelector('.safety-banner__message').textContent)
      .toBe(getDeloadSkipWarning());
  });
});

describe('Wiring 3 — Plateau §27 two-layer', () => {
  it('returns null on invalid layer', () => {
    expect(buildPlateauBanner({})).toBeNull();
    expect(buildPlateauBanner({ layer: 0 })).toBeNull();
    expect(buildPlateauBanner({ layer: 3 })).toBeNull();
  });

  it('Layer 1 — info severity + LOCKED suggestion wording', () => {
    const b = buildPlateauBanner({ layer: 1 });
    expect(b.severity).toBe('info');
    expect(b.message).toBe('Greutatea s-a oprit. Sesiunea de azi incearca o varianta diferita.');
    expect(b.dismissId).toBe('plateau-layer1');
  });

  it('Layer 2 — warning severity with weeks + technique', () => {
    const b = buildPlateauBanner({ layer: 2, weeks: 5, technique: 'Drop Set' });
    expect(b.severity).toBe('warning');
    expect(b.message).toBe('Saptamana a 5-a fara progres. Incercam Drop Set astazi.');
    expect(b.dismissId).toBe('plateau-layer2');
  });

  it('Layer 2 — gracefully omits weeks part when missing', () => {
    const b = buildPlateauBanner({ layer: 2, technique: 'Tempo 3-1-3' });
    expect(b.message).toBe('Incercam Tempo 3-1-3 astazi.');
  });

  it('Layer 2 — fallback technique when missing', () => {
    const b = buildPlateauBanner({ layer: 2, weeks: 4 });
    expect(b.message).toContain('o varianta tehnica');
  });

  it('Layer 2 — Anti-RE: no efficacy % or backend numerics', () => {
    const b = buildPlateauBanner({ layer: 2, weeks: 5, technique: 'Drop Set' });
    expect(b.message).not.toMatch(/efficacy|0\.\d/i);
    expect(b.message).not.toMatch(/[0-9]{2,}%/);
  });

  it('Layer 1 + Layer 2 render correctly', () => {
    const storage = { _data: {}, getItem(k) { return this._data[k] ?? null; }, setItem(k, v) { this._data[k] = v; }, removeItem(k) { delete this._data[k]; } };
    const layer1 = createSafetyBanner({ ...buildPlateauBanner({ layer: 1 }), storage });
    expect(layer1.element.getAttribute('data-severity')).toBe('info');
    const layer2 = createSafetyBanner({ ...buildPlateauBanner({ layer: 2, weeks: 5, technique: 'Drop Set' }), storage });
    expect(layer2.element.getAttribute('data-severity')).toBe('warning');
  });
});

describe('SAFETY_WIRING_COPY exposure', () => {
  it('exposes plan-adjusted + plateau-layer1 wording', () => {
    expect(SAFETY_WIRING_COPY.planAdjusted.message).toBe('Plan ajustat astazi pentru recovery.');
    expect(SAFETY_WIRING_COPY.planAdjusted.actionLabel).toBe('Folosesc varianta mea');
    expect(SAFETY_WIRING_COPY.plateauLayer1).toContain('Greutatea s-a oprit');
  });
});
