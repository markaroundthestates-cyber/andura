import { describe, it, expect, beforeEach } from 'vitest';
import {
  READINESS_PR,
  READINESS_HIGH,
  READINESS_MED,
  READINESS_LOW,
  getReadinessVerdict,
  getReadinessScore,
  saveReadiness,
  getTodayReadiness,
  getComputedReadinessScore,
} from '../readiness.js';
import { tod } from '../../db.js';

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

describe('readiness — getReadinessScore', () => {
  it('returns null when readinessInput is null/undefined', () => {
    expect(getReadinessScore(null, 2000, 180, 2000, 180)).toBeNull();
    expect(getReadinessScore(undefined, 2000, 180, 2000, 180)).toBeNull();
  });

  it('maps base readiness 1-5 to 60 + points (5 → 100, 1 → 60)', () => {
    expect(getReadinessScore(5, null, null, null, null)).toBe(100);
    expect(getReadinessScore(3, null, null, null, null)).toBe(85);
    expect(getReadinessScore(1, null, null, null, null)).toBe(60);
  });

  it('penalizes severe kcal underfeed (<70% target) by 20', () => {
    // base 5 → 100, kcal 0.6 ratio → -20 → 80
    expect(getReadinessScore(5, 1200, null, 2000, null)).toBe(80);
  });

  it('applies graded kcal penalties at 85% and 95% boundaries', () => {
    expect(getReadinessScore(5, 1600, null, 2000, null)).toBe(90); // 0.80 → -10
    expect(getReadinessScore(5, 1850, null, 2000, null)).toBe(95); // 0.925 → -5
  });

  it('applies protein penalties (<70% → -10, <85% → -5)', () => {
    expect(getReadinessScore(5, null, 100, null, 180)).toBe(90); // 0.55 → -10
    expect(getReadinessScore(5, null, 140, null, 180)).toBe(95); // 0.77 → -5
  });

  it('clamps to [10, 100]', () => {
    // base 1 (60) with both severe penalties → clamps but stays >= 10
    const low = getReadinessScore(1, 100, 10, 2000, 180);
    expect(low).toBeGreaterThanOrEqual(10);
    expect(low).toBeLessThanOrEqual(100);
  });
});

describe('readiness — DB-backed helpers', () => {
  beforeEach(() => localStorage.clear());

  it('getTodayReadiness returns null when unset', () => {
    expect(getTodayReadiness()).toBeNull();
  });

  it('saveReadiness then getTodayReadiness round-trips todays value', () => {
    saveReadiness(4);
    expect(getTodayReadiness()).toBe(4);
    const raw = JSON.parse(localStorage.getItem('readiness'));
    expect(raw[tod()]).toBe(4);
  });

  it('getComputedReadinessScore returns null when no readiness today', () => {
    expect(getComputedReadinessScore()).toBeNull();
  });

  it('getComputedReadinessScore derives a clamped score from saved input', () => {
    saveReadiness(5);
    const score = getComputedReadinessScore();
    expect(score).not.toBeNull();
    expect(score).toBeGreaterThanOrEqual(10);
    expect(score).toBeLessThanOrEqual(100);
  });
});
