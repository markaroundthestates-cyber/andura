import { describe, it, expect } from 'vitest';
import {
  resolvePersonaDuration,
  resolveGoalPhaseModifier,
  isDeloadWeek,
  isEnergyDownAutoShorten,
  computeDuration,
} from '../durationCalculator.js';
import {
  PERSONA_DURATION,
  PERIODIZATION_PHASE,
  ENERGY_DIRECTION,
  SCHEMA_CONSTANTS,
} from '../constants.js';

describe('resolvePersonaDuration — Cluster B3 Source 2 §45.6.3 verbatim', () => {
  it('Maria 65 → 5-10 min mobility flow', () => {
    const r = resolvePersonaDuration('maria');
    expect(r.min).toBe(5);
    expect(r.max).toBe(10);
    expect(r.rationale).toContain('mobility_flow');
  });

  it('Gigica 35 → 5-7 min dynamic + ramp first exercise', () => {
    const r = resolvePersonaDuration('gigica');
    expect(r.min).toBe(5);
    expect(r.max).toBe(7);
    expect(r.rationale).toContain('dynamic');
  });

  it('Marius 25 → 8-10 min ramp protocol heavy compounds', () => {
    const r = resolvePersonaDuration('marius');
    expect(r.min).toBe(8);
    expect(r.max).toBe(10);
    expect(r.rationale).toContain('ramp_50_70_90');
  });

  it('case-insensitive normalize', () => {
    expect(resolvePersonaDuration('MARIA').max).toBe(10);
    expect(resolvePersonaDuration('Marius').min).toBe(8);
  });

  it('unknown persona → Maria fallback safe default (mobility 5-10)', () => {
    const r = resolvePersonaDuration('unknown');
    expect(r).toEqual(PERSONA_DURATION.maria);
  });

  it('null / undefined → Maria fallback', () => {
    expect(resolvePersonaDuration(null)).toEqual(PERSONA_DURATION.maria);
    expect(resolvePersonaDuration(undefined)).toEqual(PERSONA_DURATION.maria);
  });
});

describe('resolveGoalPhaseModifier — Cluster D2 verbatim', () => {
  it('CUT → modifier 1.0 preserve full Maria 65 retention', () => {
    const r = resolveGoalPhaseModifier('CUT');
    expect(r.modifier).toBe(1.0);
    expect(r.rationale).toContain('cut_preserve_full');
  });

  it('BULK → modifier 1.0 Marius full ramp upper bound preserved', () => {
    const r = resolveGoalPhaseModifier('BULK');
    expect(r.modifier).toBe(1.0);
    expect(r.rationale).toContain('bulk_marius_full_ramp');
  });

  it('MAINTAIN → modifier 1.0 baseline', () => {
    const r = resolveGoalPhaseModifier('MAINTAIN');
    expect(r.modifier).toBe(1.0);
  });

  it('RECOMP → modifier 1.0 baseline (sub-phase MAINTAIN treatment)', () => {
    const r = resolveGoalPhaseModifier('RECOMP');
    expect(r.modifier).toBe(1.0);
  });

  it('null / unknown → 1.0 baseline defensive', () => {
    expect(resolveGoalPhaseModifier(null).modifier).toBe(1.0);
    expect(resolveGoalPhaseModifier('foo').modifier).toBe(1.0);
  });
});

describe('isDeloadWeek — Cluster D1 cross-ref §9.1 Hook 1', () => {
  it('DELOAD → true', () => {
    expect(isDeloadWeek(PERIODIZATION_PHASE.DELOAD)).toBe(true);
    expect(isDeloadWeek('DELOAD')).toBe(true);
  });

  it('LOAD / LOAD+ / PEAK → false', () => {
    expect(isDeloadWeek('LOAD')).toBe(false);
    expect(isDeloadWeek('LOAD+')).toBe(false);
    expect(isDeloadWeek('PEAK')).toBe(false);
  });

  it('null / undefined → false defensive', () => {
    expect(isDeloadWeek(null)).toBe(false);
    expect(isDeloadWeek(undefined)).toBe(false);
  });
});

describe('isEnergyDownAutoShorten — Cluster D3 cross-ref §9.3 Hook', () => {
  it('DOWN → true (auto-shorten upper bound 5-10 → 5-7)', () => {
    expect(isEnergyDownAutoShorten(ENERGY_DIRECTION.DOWN)).toBe(true);
    expect(isEnergyDownAutoShorten('DOWN')).toBe(true);
  });

  it('UP / NONE → false (NU auto-shorten override)', () => {
    expect(isEnergyDownAutoShorten('UP')).toBe(false);
    expect(isEnergyDownAutoShorten('NONE')).toBe(false);
  });

  it('null / undefined → false defensive', () => {
    expect(isEnergyDownAutoShorten(null)).toBe(false);
    expect(isEnergyDownAutoShorten(undefined)).toBe(false);
  });
});

describe('computeDuration — full Cluster B1+B2+B3+D integration', () => {
  it('Maria 65 + BULK + LOAD → full 5-10 range, midpoint ~7-8', () => {
    const r = computeDuration({
      persona: 'maria',
      goalPhase: 'BULK',
      periodizationPhase: 'LOAD',
      energyDirection: 'NONE',
    });
    expect(r.lowerBound).toBe(5);
    expect(r.upperBound).toBe(10);
    expect(r.durationMin).toBeGreaterThanOrEqual(5);
    expect(r.durationMin).toBeLessThanOrEqual(10);
    expect(r.energyDownAutoShortened).toBe(false);
    expect(r.deloadLighter).toBe(false);
  });

  it('Gigica + CUT + LOAD → 5-7 range', () => {
    const r = computeDuration({
      persona: 'gigica',
      goalPhase: 'CUT',
      periodizationPhase: 'LOAD',
    });
    expect(r.lowerBound).toBe(5);
    expect(r.upperBound).toBe(7);
  });

  it('Marius + BULK + LOAD → full ramp 8-10 range', () => {
    const r = computeDuration({
      persona: 'marius',
      goalPhase: 'BULK',
      periodizationPhase: 'LOAD',
    });
    expect(r.lowerBound).toBe(8);
    expect(r.upperBound).toBe(10);
  });

  it('Energy DOWN auto-shorten — Marius 8-10 → upper clamped to 7', () => {
    const r = computeDuration({
      persona: 'marius',
      goalPhase: 'BULK',
      periodizationPhase: 'LOAD',
      energyDirection: 'DOWN',
    });
    expect(r.upperBound).toBe(SCHEMA_CONSTANTS.durationMaxEnergyDown); // 7
    expect(r.energyDownAutoShortened).toBe(true);
    expect(r.rationale).toContain('energy_down_auto_shorten_d3_anti_cascade');
  });

  it('Periodization DELOAD → upper clamped to 7 (lighter recovery)', () => {
    const r = computeDuration({
      persona: 'maria',
      periodizationPhase: 'DELOAD',
    });
    expect(r.upperBound).toBeLessThanOrEqual(SCHEMA_CONSTANTS.durationMaxEnergyDown);
    expect(r.deloadLighter).toBe(true);
    expect(r.rationale).toContain('deload_lighter_d1');
  });

  it('Defensive: undefined persona → Maria fallback safe 5-10', () => {
    const r = computeDuration({});
    expect(r.lowerBound).toBe(5);
    expect(r.upperBound).toBe(10);
  });

  it('durationMin always integer (rounded)', () => {
    const r = computeDuration({ persona: 'gigica', energyDirection: 'DOWN' });
    expect(Number.isInteger(r.durationMin)).toBe(true);
  });

  it('Energy DOWN takes priority — even cu Marius BULK full ramp clamped', () => {
    const ramp = computeDuration({
      persona: 'marius',
      goalPhase: 'BULK',
      energyDirection: 'NONE',
    });
    const downRamp = computeDuration({
      persona: 'marius',
      goalPhase: 'BULK',
      energyDirection: 'DOWN',
    });
    expect(downRamp.upperBound).toBeLessThan(ramp.upperBound);
  });
});
