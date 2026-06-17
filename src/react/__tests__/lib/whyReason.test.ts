// ══ MOAT "why?" (#56) TESTS — engine status → key + no-jargon i18n gate ══════
// Locks whyForStatus: every engine status maps to a why.reason.* key (or null for
// absent/unknown → caller falls back honestly), and the GIGEL i18n-leak ban: every
// why.reason.* copy in BOTH locales is jargon-free.

import { describe, it, expect } from 'vitest';
import { whyForStatus, whyForStatusMetric, WHY_REASON_KEYS } from '../../lib/whyReason';
import { _getBundle } from '../../../i18n/index.js';

// The full engine status enum (dp.js): every value must resolve to a non-null key.
const ALL_STATUSES = [
  'INCREASE',
  'CATCH UP',
  'EASE BACK',
  'CONSOLIDATE',
  'INIT',
  'MAINTAIN',
  'ON TARGET',
  'PEAK',
  'CAP REPS',
  'CAP',
  'STAGNANT +SET',
  'TECHNIQUE',
  'SCALE BACK',
];

describe('whyForStatus — real engine reason, never a re-guess', () => {
  it('maps every engine status to a why.reason.* key', () => {
    for (const s of ALL_STATUSES) {
      const key = whyForStatus(s);
      expect(key, `status ${s}`).toMatch(/^why\.reason\./);
    }
  });

  it('EASE BACK and INCREASE map to DIFFERENT keys (the verdict is real)', () => {
    expect(whyForStatus('EASE BACK')).not.toBe(whyForStatus('INCREASE'));
  });

  it('is case- and whitespace-tolerant on the raw status', () => {
    expect(whyForStatus('ease back')).toBe(whyForStatus('EASE BACK'));
    expect(whyForStatus('  INCREASE  ')).toBe(whyForStatus('INCREASE'));
  });

  it('absent / unknown status → null (caller degrades to the honest fallback)', () => {
    expect(whyForStatus(undefined)).toBeNull();
    expect(whyForStatus(null)).toBeNull();
    expect(whyForStatus('')).toBeNull();
    expect(whyForStatus('SOMETHING ELSE')).toBeNull();
  });
});

describe('whyForStatusMetric — seconds/hold framing, no weight talk', () => {
  it('maps every engine status to a why.reasonMetric.* key', () => {
    for (const s of ALL_STATUSES) {
      const key = whyForStatusMetric(s);
      expect(key, `status ${s}`).toMatch(/^why\.reasonMetric\./);
    }
  });

  it('absent / unknown status → null (caller degrades to the honest fallback)', () => {
    expect(whyForStatusMetric(undefined)).toBeNull();
    expect(whyForStatusMetric('SOMETHING ELSE')).toBeNull();
  });

  it('a metric why-line is NEVER weight-framed (en + ro)', () => {
    // The defect: a time/carry hold got the weight-framed why.reason copy ("urc
    // greutatea" / "nudging the weight up"). Every metric copy must avoid weight talk.
    const WEIGHT_TALK = /greutate|greutatea|weight/i;
    for (const locale of ['en', 'ro'] as const) {
      const bundle = _getBundle(locale) as Record<string, Record<string, Record<string, string>>>;
      const block = bundle.why!.reasonMetric;
      expect(block, `${locale} reasonMetric block`).toBeTruthy();
      for (const s of ALL_STATUSES) {
        const leaf = whyForStatusMetric(s)!.replace('why.reasonMetric.', '');
        const copy = block![leaf]!;
        expect(typeof copy, `${locale} ${s}`).toBe('string');
        expect(WEIGHT_TALK.test(copy), `${locale} ${s}: ${copy}`).toBe(false);
      }
    }
  });
});

// GIGEL rule — no numbers/jargon in any why.reason copy, either locale.
const BANNED = /\d|RPE|RIR|e1RM|1RM|sigma|MEV|MAV|MRV|kalman/i;

describe('why.reason i18n — no-jargon ban (en + ro)', () => {
  for (const locale of ['en', 'ro'] as const) {
    it(`${locale}: every why.reason.* copy resolves, is jargon-free, only {exercise}/{kg}`, () => {
      const bundle = _getBundle(locale) as Record<string, Record<string, Record<string, string>>>;
      const block = bundle.why!.reason;
      expect(block).toBeTruthy();
      const metricBlock = bundle.why!.reasonMetric;
      expect(metricBlock).toBeTruthy();
      // Every distinct key the mapper can emit must exist in BOTH the reps + metric
      // bundles, jargon-free, with only {exercise}/{kg} placeholders.
      for (const fullKey of WHY_REASON_KEYS) {
        const leaf = fullKey.replace('why.reason.', '');
        for (const copy of [block![leaf]!, metricBlock![leaf]!]) {
          expect(typeof copy, fullKey).toBe('string');
          expect(copy.length).toBeGreaterThan(0);
          expect(BANNED.test(copy), `${fullKey}: ${copy}`).toBe(false);
          const placeholders = copy.match(/\{[^}]+\}/g) ?? [];
          for (const p of placeholders) {
            expect(['{exercise}', '{kg}']).toContain(p);
          }
        }
      }
    });
  }
});
