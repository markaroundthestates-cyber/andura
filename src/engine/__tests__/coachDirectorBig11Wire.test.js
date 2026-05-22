// ══ COACH DIRECTOR Big 11 WIRE — C4.5 ADR_ENGINE_REFACTOR §4.5 LOCK V1 ══════
// Orchestrator integration assertions per Decision §3.5:
//   - aggregateGroupScoresPerEngine consume policy differential per engine
//     (primary-only Muscle Recovery/Periodization/Weakness Detector vs primary
//     + weighted secondary 0.3 Specialization via computeWeightedGroupScore
//     helper C4.4 LANDED `657b7175`)
//   - ZERO mutation input array (pure-function discipline ADR-026 §9)
//   - Object.frozen return map (immutability invariant)
//   - Bundle 6.0.4.2 RDL/Good Morning posterior chain dual-cluster integration
//     (spate primary + picioare-hamstrings secondary anatomically defensible)
//   - translateGroupToRO post-C4.5 cap-coadă cleanup verify Big 6 EN deprecated

import { describe, it, expect } from 'vitest';
import { aggregateGroupScoresPerEngine } from '../coachDirector.js';
import { translateGroupToRO } from '../specialization/applicationStrategy.js';
import { SECONDARY_TAG_WEIGHT_DEFAULT } from '../specialization/constants.js';

describe('aggregateGroupScoresPerEngine — primary-only consume policy (Muscle Recovery + Periodization + Weakness Detector)', () => {
  const exercises = [
    { muscle_target_primary: 'piept',   muscle_target_secondary: ['triceps', 'umeri'] },
    { muscle_target_primary: 'piept',   muscle_target_secondary: ['triceps'] },
    { muscle_target_primary: 'spate',   muscle_target_secondary: ['biceps'] },
    { muscle_target_primary: 'biceps',  muscle_target_secondary: ['antebrate'] },
  ];

  it('muscleRecovery: primary-only count per Big 11 group', () => {
    const r = aggregateGroupScoresPerEngine(exercises, 'muscleRecovery');
    expect(r).toEqual({ piept: 2.0, spate: 1.0, biceps: 1.0 });
    expect(r.triceps).toBeUndefined();
    expect(r.umeri).toBeUndefined();
    expect(r.antebrate).toBeUndefined();
  });

  it('periodization: primary-only count per Big 11 group (same policy)', () => {
    const r = aggregateGroupScoresPerEngine(exercises, 'periodization');
    expect(r).toEqual({ piept: 2.0, spate: 1.0, biceps: 1.0 });
  });

  it('weaknessDetector: primary-only count per Big 11 group (same policy)', () => {
    const r = aggregateGroupScoresPerEngine(exercises, 'weaknessDetector');
    expect(r).toEqual({ piept: 2.0, spate: 1.0, biceps: 1.0 });
  });
});

describe('aggregateGroupScoresPerEngine — specialization weighted secondary 0.3 consume per Decision §3.5', () => {
  it('specialization: primary 1.0 + secondary 0.3 sum per Big 11 group', () => {
    const exercises = [
      { muscle_target_primary: 'piept', muscle_target_secondary: ['triceps', 'umeri'] },
      { muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'] },
    ];
    const r = aggregateGroupScoresPerEngine(exercises, 'specialization');
    expect(r.piept).toBeCloseTo(2.0); // 2 primary matches
    expect(r.triceps).toBeCloseTo(0.6); // 2 secondary matches × 0.3
    expect(r.umeri).toBeCloseTo(SECONDARY_TAG_WEIGHT_DEFAULT); // 1 secondary × 0.3
  });

  it('Bundle 6.0.4.2 RDL/Good Morning posterior chain dual-cluster integration (spate primary + picioare-hamstrings secondary anatomically defensible)', () => {
    const exercises = [
      { muscle_target_primary: 'spate', muscle_target_secondary: ['picioare-hamstrings', 'fese'] },
      { muscle_target_primary: 'spate', muscle_target_secondary: ['picioare-hamstrings'] },
    ];
    const r = aggregateGroupScoresPerEngine(exercises, 'specialization');
    expect(r.spate).toBeCloseTo(2.0); // 2 primary
    expect(r['picioare-hamstrings']).toBeCloseTo(0.6); // 2 secondary × 0.3
    expect(r.fese).toBeCloseTo(SECONDARY_TAG_WEIGHT_DEFAULT); // 1 secondary × 0.3
  });
});

describe('aggregateGroupScoresPerEngine — pure-function discipline ADR-026 §9 invariant', () => {
  it('ZERO mutation input array (pure-function discipline)', () => {
    const exercises = [
      { muscle_target_primary: 'piept', muscle_target_secondary: ['triceps'] },
      { muscle_target_primary: 'spate', muscle_target_secondary: ['biceps'] },
    ];
    const snapshot = JSON.stringify(exercises);
    aggregateGroupScoresPerEngine(exercises, 'specialization');
    aggregateGroupScoresPerEngine(exercises, 'muscleRecovery');
    expect(JSON.stringify(exercises)).toBe(snapshot);
  });

  it('returns Object.frozen map (immutability invariant)', () => {
    const exercises = [{ muscle_target_primary: 'piept' }];
    const r = aggregateGroupScoresPerEngine(exercises, 'muscleRecovery');
    expect(Object.isFrozen(r)).toBe(true);
  });

  it('malformed input handling: null exercises → frozen empty map (NU throws)', () => {
    expect(() => aggregateGroupScoresPerEngine(null, 'muscleRecovery')).not.toThrow();
    const r = aggregateGroupScoresPerEngine(null, 'muscleRecovery');
    expect(r).toEqual({});
    expect(Object.isFrozen(r)).toBe(true);
  });

  it('malformed input handling: unknown engineId → frozen empty map (NU throws — defensive fallback)', () => {
    const exercises = [{ muscle_target_primary: 'piept' }];
    expect(() => aggregateGroupScoresPerEngine(exercises, 'unknownEngine')).not.toThrow();
    const r = aggregateGroupScoresPerEngine(exercises, 'unknownEngine');
    expect(r).toEqual({});
    expect(Object.isFrozen(r)).toBe(true);
  });

  it('malformed input handling: empty engineId → frozen empty map', () => {
    const exercises = [{ muscle_target_primary: 'piept' }];
    const r = aggregateGroupScoresPerEngine(exercises, '');
    expect(r).toEqual({});
  });

  it('skips exercises without muscle_target_primary (defensive)', () => {
    const exercises = [
      { muscle_target_primary: 'piept' },
      { muscle_target_primary: '', muscle_target_secondary: ['umeri'] }, // skip primary empty
      null, // skip null entry
      { muscle_target_secondary: ['triceps'] }, // missing primary
    ];
    const r = aggregateGroupScoresPerEngine(exercises, 'muscleRecovery');
    expect(r).toEqual({ piept: 1.0 });
  });
});

describe('translateGroupToRO — post-C4.5 cap-coada cleanup verify Big 6 EN fallback DEPRECATED', () => {
  it('Big 11 RO canonical V1 SSOT preserved (piept → Piept)', () => {
    expect(translateGroupToRO('piept')).toBe('Piept');
  });

  it('Big 6 EN chest → Chest capitalized fallback (NU Piept map entry post-C4.5)', () => {
    expect(translateGroupToRO('chest')).toBe('Chest');
  });

  it('Big 6 EN back → Back capitalized fallback (NU Spate map entry post-C4.5)', () => {
    expect(translateGroupToRO('back')).toBe('Back');
  });
});
