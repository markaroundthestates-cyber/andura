import { describe, it, expect } from 'vitest';
import {
  READINESS_PR,
  READINESS_HIGH,
  READINESS_MED,
  READINESS_LOW,
  getReadinessVerdict,
} from '../readiness.js';

describe('readiness — named threshold exports', () => {
  it('exports correct values: PR=85, HIGH=70, MED=55, LOW=40', () => {
    expect(READINESS_PR).toBe(85);
    expect(READINESS_HIGH).toBe(70);
    expect(READINESS_MED).toBe(55);
    expect(READINESS_LOW).toBe(40);
  });

  it('thresholds are strictly ordered: LOW < MED < HIGH < PR', () => {
    expect(READINESS_LOW).toBeLessThan(READINESS_MED);
    expect(READINESS_MED).toBeLessThan(READINESS_HIGH);
    expect(READINESS_HIGH).toBeLessThan(READINESS_PR);
  });
});

describe('readiness — getReadinessVerdict', () => {
  it('score=85 CUT → Sesiune solida, canPR=false', () => {
    const v = getReadinessVerdict(85, { isInCut: true });
    expect(v.label).toBe('Sesiune solida');
    expect(v.canPR).toBe(false);
    expect(v.volumeMultiplier).toBe(1.0);
  });

  it('score=85 non-CUT → Zi de PR, canPR=true, volumeMultiplier=1.1', () => {
    const v = getReadinessVerdict(85, { isInCut: false });
    expect(v.label).toBe('Zi de PR');
    expect(v.canPR).toBe(true);
    expect(v.volumeMultiplier).toBe(1.1);
  });

  it('score=30 → rest verdict, volumeMultiplier=0', () => {
    const vCut = getReadinessVerdict(30, { isInCut: true });
    expect(vCut.volumeMultiplier).toBe(0);
    const vNorm = getReadinessVerdict(30, { isInCut: false });
    expect(vNorm.volumeMultiplier).toBe(0);
  });

  it('score=null → label=null, volumeMultiplier=1.0', () => {
    const v = getReadinessVerdict(null);
    expect(v.label).toBeNull();
    expect(v.volumeMultiplier).toBe(1.0);
  });

  it('READINESS_MED boundary (55) → Sesiune moderata, volumeMultiplier=0.85', () => {
    const v = getReadinessVerdict(READINESS_MED, { isInCut: false });
    expect(v.label).toBe('Sesiune moderata');
    expect(v.volumeMultiplier).toBe(0.85);
  });
});
