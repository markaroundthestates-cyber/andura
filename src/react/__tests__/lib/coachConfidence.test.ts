// ══ COACH CONFIDENCE (#63) TESTS — sigma → tier + no-jargon i18n gate ════════
// Locks the pure tier classifier (cold-start / fluke / wide → LEARNING; converged
// → DIALED_IN; in-between → GETTING_THERE) and the GIGEL i18n-leak ban: the tier
// copy in BOTH locales must contain NO number / RIR / 1RM / sigma / MEV / kalman
// and interpolate ONLY {exercise}.

import { describe, it, expect } from 'vitest';
import {
  confidenceTier,
  confidenceTierKey,
  SIGMA_HI,
  SIGMA_LO,
  N_MIN,
} from '../../lib/coachConfidence';
import { _getBundle } from '../../../i18n/index.js';

// SIGMA_HI is anchored to the engine's SIGMA_PROBE_THRESHOLD (6); SIGMA_LO=4; N_MIN=3.
describe('confidenceTier — anchored thresholds', () => {
  it('anchors SIGMA_HI to the engine probe threshold', () => {
    expect(SIGMA_HI).toBe(6);
    expect(SIGMA_LO).toBe(4);
    expect(N_MIN).toBe(3);
  });

  it('cold-start / e1RM-ineligible (sigma null) → LEARNING (honest default)', () => {
    expect(confidenceTier(null, 0)).toBe('LEARNING');
    expect(confidenceTier(null, 10)).toBe('LEARNING');
  });

  it('wide sigma (>= SIGMA_HI) → LEARNING even with many observations', () => {
    expect(confidenceTier(7, 5)).toBe('LEARNING');
    expect(confidenceTier(SIGMA_HI, 5)).toBe('LEARNING');
  });

  it('mid sigma (SIGMA_LO <= s < SIGMA_HI) → GETTING_THERE', () => {
    expect(confidenceTier(5, 5)).toBe('GETTING_THERE');
    expect(confidenceTier(SIGMA_LO, 5)).toBe('GETTING_THERE');
  });

  it('narrow sigma (< SIGMA_LO) + enough observations → DIALED_IN', () => {
    expect(confidenceTier(3, 5)).toBe('DIALED_IN');
  });

  it('narrow sigma but n < N_MIN → LEARNING (a 1-2 set fluke never claims dialed-in)', () => {
    expect(confidenceTier(3, 2)).toBe('LEARNING');
    expect(confidenceTier(1, 1)).toBe('LEARNING');
  });

  it('non-finite sigma → LEARNING', () => {
    expect(confidenceTier(Number.NaN, 5)).toBe('LEARNING');
    expect(confidenceTier(Number.POSITIVE_INFINITY, 5)).toBe('LEARNING');
  });

  it('every tier maps to a distinct coachConfidence.* key', () => {
    expect(confidenceTierKey('LEARNING')).toBe('coachConfidence.learning');
    expect(confidenceTierKey('GETTING_THERE')).toBe('coachConfidence.gettingThere');
    expect(confidenceTierKey('DIALED_IN')).toBe('coachConfidence.dialedIn');
  });
});

// GIGEL rule (hard, mechanically enforced) — no numbers, no jargon in either locale.
const BANNED = /\d|RPE|RIR|e1RM|1RM|sigma|MEV|MAV|MRV|kalman|kg/i;
const KEYS = ['learning', 'gettingThere', 'dialedIn'] as const;

describe('coachConfidence i18n — no-numbers / no-jargon ban (en + ro)', () => {
  for (const locale of ['en', 'ro'] as const) {
    it(`${locale}: every tier copy is jargon-free and interpolates only {exercise}`, () => {
      const bundle = _getBundle(locale) as Record<string, Record<string, string>>;
      const block = bundle.coachConfidence;
      expect(block).toBeTruthy();
      for (const k of KEYS) {
        const copy = block![k]!;
        expect(typeof copy).toBe('string');
        expect(copy.length).toBeGreaterThan(0);
        // No digit, no jargon token anywhere.
        expect(BANNED.test(copy)).toBe(false);
        // The only allowed placeholder is {exercise}.
        const placeholders = copy.match(/\{[^}]+\}/g) ?? [];
        for (const p of placeholders) expect(p).toBe('{exercise}');
      }
    });
  }
});
