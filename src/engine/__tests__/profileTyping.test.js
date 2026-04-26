import { describe, it, expect } from 'vitest';
import {
  analyzeProfile,
  inferBehavioralProfile,
  detectYoyoRisk,
  computeCounterMarkers,
  reconciliationAction,
  _matchSprinterSignature,
  _matchMarathonSignature,
  _matchYoyoSignature,
  _matchStrategicSignature,
  _counterMarkersSprinter,
  _counterMarkersMarathon,
  _counterMarkersYoyo,
  _counterMarkersStrategic,
  _computeConfidence,
  _hasInsufficientData,
} from '../profileTyping.js';

import {
  realWorkoutEntry,
  deviationEntry,
  skipEntry,
  scenarioVolumeCreep,
  scenarioClean,
  scenarioSprinter,
  scenarioMarathon,
  scenarioYoyo,
  scenarioStrategic,
} from '../../../tests/fixtures/cdlEntries.js';

// ── Behavioral inference ──────────────────────────────────────────────────────

describe('profileTyping — Behavioral inference', () => {
  it('returns Sprinter on Sprinter signature CDL', () => {
    const entries = scenarioSprinter({ baseDate: '2026-04-01' });
    const result = inferBehavioralProfile(entries);
    expect(result.primary).toBe('Sprinter');
    expect(result.confidence).toBe('high');
    expect(result.sessionCount).toBeGreaterThanOrEqual(12);
  });

  it('returns Marathon on Marathon signature CDL', () => {
    const entries = scenarioMarathon({ baseDate: '2026-04-01' });
    const result = inferBehavioralProfile(entries);
    expect(result.primary).toBe('Marathon');
    expect(result.confidence).toBe('high');
  });

  it('returns Yo-yo on Yo-yo signature CDL (pre-drop detection)', () => {
    const { cdlEntries, hyperfocusData } = scenarioYoyo({ baseDate: '2026-04-01' });
    const result = inferBehavioralProfile(cdlEntries, hyperfocusData);
    expect(result.primary).toBe('Yo-yo');
    expect(result.confidence).toBe('high');
  });

  it('returns Strategic on Strategic signature CDL', () => {
    const entries = scenarioStrategic({ baseDate: '2026-04-01' });
    const result = inferBehavioralProfile(entries);
    expect(result.primary).toBe('Strategic');
    expect(result.confidence).toBe('high');
  });

  it('signature object contains counts for all 4 profiles', () => {
    const entries = scenarioSprinter({ baseDate: '2026-04-01' });
    const { signature } = inferBehavioralProfile(entries);
    expect(signature).toHaveProperty('Sprinter');
    expect(signature).toHaveProperty('Marathon');
    expect(signature).toHaveProperty('Yoyo');
    expect(signature).toHaveProperty('Strategic');
    expect(signature.Sprinter).toBeGreaterThanOrEqual(3);
  });

  it('returns null primary and low confidence for empty entries', () => {
    const result = inferBehavioralProfile([]);
    expect(result.primary).toBeNull();
    expect(result.confidence).toBe('low');
    expect(result.sessionCount).toBe(0);
  });
});

// ── Counter-markers ───────────────────────────────────────────────────────────

describe('profileTyping — Counter-markers', () => {
  it('Sprinter: high consistency + planned rest → counter-marker matched', () => {
    // High consistency (all executed) + ≥2 rest_marked=true → contradicts Sprinter burst/no-rest
    const entries = [
      ...scenarioMarathon({ baseDate: '2026-04-01' }),  // has high consistency + rest days
    ];
    const markers = _counterMarkersSprinter(entries);
    expect(markers).toContain('high_consistency_with_planned_rest');
  });

  it('Marathon: frequent volume creep → counter-marker matched', () => {
    const entries = [
      deviationEntry({ date: '2026-03-20', proposedSets: 16, actualSets: 20 }),
      deviationEntry({ date: '2026-03-22', proposedSets: 16, actualSets: 20 }),
      deviationEntry({ date: '2026-03-24', proposedSets: 16, actualSets: 20 }),
    ];
    const markers = _counterMarkersMarathon(entries);
    expect(markers).toContain('volume_creep_frequent');
  });

  it('Yo-yo: sustained rhythm with ≥2 rest days → counter-marker matched', () => {
    // ≥6 executed sessions + ≥2 rest days = sustained rhythm (contradicts all-in/drop)
    const entries = [
      realWorkoutEntry({ date: '2026-03-17' }),
      realWorkoutEntry({ date: '2026-03-19' }),
      realWorkoutEntry({ date: '2026-03-21' }),
      skipEntry({ date: '2026-03-22', restMarkedValue: true }),
      skipEntry({ date: '2026-03-23', restMarkedValue: true }),
      realWorkoutEntry({ date: '2026-03-24' }),
      realWorkoutEntry({ date: '2026-03-26' }),
      realWorkoutEntry({ date: '2026-03-28' }),
    ];
    const markers = _counterMarkersYoyo(entries);
    expect(markers).toContain('sustained_intensity_with_rhythm');
  });

  it('Strategic: impulsive volume creep without reason → counter-marker matched', () => {
    const entries = [
      deviationEntry({ date: '2026-03-20', proposedSets: 16, actualSets: 20, deviationReason: null }),
      deviationEntry({ date: '2026-03-22', proposedSets: 16, actualSets: 20, deviationReason: null }),
    ];
    const markers = _counterMarkersStrategic(entries);
    expect(markers).toContain('impulsive_volume_creep_no_reason');
  });

  it('Marathon: no volume creep → no counter-markers', () => {
    const entries = scenarioMarathon({ baseDate: '2026-04-01' });
    const markers = _counterMarkersMarathon(entries);
    expect(markers).toHaveLength(0);
  });

  it('computeCounterMarkers dispatches to correct helper', () => {
    const entries = [
      deviationEntry({ date: '2026-03-20', proposedSets: 16, actualSets: 20 }),
      deviationEntry({ date: '2026-03-22', proposedSets: 16, actualSets: 20 }),
    ];
    expect(computeCounterMarkers('Marathon', entries)).toContain('volume_creep_frequent');
    expect(computeCounterMarkers('UnknownProfile', entries)).toHaveLength(0);
  });
});

// ── Confidence calculation ────────────────────────────────────────────────────

describe('profileTyping — Confidence calculation', () => {
  it('HIGH: ≥3 signature markers AND zero counter-markers', () => {
    expect(_computeConfidence(3, 0)).toBe('high');
    expect(_computeConfidence(4, 0)).toBe('high');
    expect(_computeConfidence(5, 0)).toBe('high');
  });

  it('MEDIUM: 2 signature markers AND ≤1 counter-marker', () => {
    expect(_computeConfidence(2, 0)).toBe('medium');
    expect(_computeConfidence(2, 1)).toBe('medium');
    expect(_computeConfidence(3, 1)).toBe('medium');
  });

  it('LOW: <2 signature markers OR ≥2 counter-markers', () => {
    expect(_computeConfidence(1, 0)).toBe('low');
    expect(_computeConfidence(0, 0)).toBe('low');
    expect(_computeConfidence(3, 2)).toBe('low');
    expect(_computeConfidence(5, 3)).toBe('low');
  });

  it('accepts array inputs (counts length)', () => {
    expect(_computeConfidence(['a', 'b', 'c'], [])).toBe('high');
    expect(_computeConfidence(['a', 'b'], ['x'])).toBe('medium');
    expect(_computeConfidence(['a'], ['x', 'y'])).toBe('low');
  });
});

// ── YO-YO_RISK detection ──────────────────────────────────────────────────────

describe('profileTyping — YO-YO_RISK detection', () => {
  it('3+ weeks all-in (aggressive volume + zero rest + zero frustration) → YO-YO_RISK', () => {
    // Build entries spanning 3 weeks, all deviations, no rest, no low ratings
    const entries = [
      // Week 1
      deviationEntry({ date: '2026-03-09', proposedSets: 16, actualSets: 22 }),
      deviationEntry({ date: '2026-03-11', proposedSets: 16, actualSets: 22 }),
      realWorkoutEntry({ date: '2026-03-13' }),
      // Week 2
      deviationEntry({ date: '2026-03-16', proposedSets: 16, actualSets: 22 }),
      realWorkoutEntry({ date: '2026-03-18' }),
      realWorkoutEntry({ date: '2026-03-20' }),
      // Week 3
      deviationEntry({ date: '2026-03-23', proposedSets: 16, actualSets: 22 }),
      realWorkoutEntry({ date: '2026-03-25' }),
      realWorkoutEntry({ date: '2026-03-27' }),
    ];
    expect(detectYoyoRisk(entries)).toBe(true);
  });

  it('consistent volume with 2+ rest days → NO YO-YO_RISK', () => {
    const entries = scenarioMarathon({ baseDate: '2026-04-01' });
    expect(detectYoyoRisk(entries)).toBe(false);
  });

  it('aggressive volume with low rating (frustration) → NO YO-YO_RISK', () => {
    // Frustration present = not the all-in/no-frustration Yo-yo pre-drop pattern
    const entries = [
      realWorkoutEntry({ date: '2026-03-09', rating: 2 }),  // frustration
      deviationEntry({ date: '2026-03-11', proposedSets: 16, actualSets: 22 }),
      deviationEntry({ date: '2026-03-16', proposedSets: 16, actualSets: 22 }),
      realWorkoutEntry({ date: '2026-03-23' }),
    ];
    expect(detectYoyoRisk(entries)).toBe(false);
  });

  it('aggressive volume spanning only 2 ISO weeks → NO YO-YO_RISK', () => {
    const entries = [
      deviationEntry({ date: '2026-03-16', proposedSets: 16, actualSets: 22 }),
      deviationEntry({ date: '2026-03-18', proposedSets: 16, actualSets: 22 }),
      realWorkoutEntry({ date: '2026-03-20' }),
      realWorkoutEntry({ date: '2026-03-22' }),
    ];
    expect(detectYoyoRisk(entries)).toBe(false);
  });
});

// ── Reconciliation actions ────────────────────────────────────────────────────

describe('profileTyping — Reconciliation actions', () => {
  const strategicSR = { primary: 'Strategic', secondary: null, confidence: 'high' };
  const strategicBehHigh = { primary: 'Strategic', confidence: 'high', sessionCount: 15 };
  const sprinterBehHigh = { primary: 'Sprinter', confidence: 'high', sessionCount: 15 };

  it('match + HIGH confidence + no previous → match_first_prompt', () => {
    expect(reconciliationAction(strategicSR, strategicBehHigh, [])).toBe('match_first_prompt');
  });

  it('match + HIGH confidence + 1 previous → match_silent', () => {
    expect(reconciliationAction(strategicSR, strategicBehHigh, [{ date: '2026-03-01' }])).toBe('match_silent');
  });

  it('match + MED/LOW confidence → match_silent', () => {
    const behMed = { primary: 'Strategic', confidence: 'medium', sessionCount: 15 };
    expect(reconciliationAction(strategicSR, behMed, [])).toBe('match_silent');
    const behLow = { primary: 'Strategic', confidence: 'low', sessionCount: 15 };
    expect(reconciliationAction(strategicSR, behLow, [])).toBe('match_silent');
  });

  it('mismatch primary + HIGH confidence → mismatch_high', () => {
    expect(reconciliationAction(strategicSR, sprinterBehHigh, [])).toBe('mismatch_high');
  });

  it('mismatch + MED confidence → mismatch_lowmed', () => {
    const sprinterBehMed = { primary: 'Sprinter', confidence: 'medium', sessionCount: 15 };
    expect(reconciliationAction(strategicSR, sprinterBehMed, [])).toBe('mismatch_lowmed');
  });

  it('<12 sessions → insufficient', () => {
    const behInsufficient = { primary: 'Strategic', confidence: 'high', sessionCount: 8 };
    expect(reconciliationAction(strategicSR, behInsufficient, [])).toBe('insufficient');
  });

  it('0 sessions → stale', () => {
    const behStale = { primary: null, confidence: 'low', sessionCount: 0 };
    expect(reconciliationAction(strategicSR, behStale, [])).toBe('stale');
  });

  it('null behavioral → stale', () => {
    expect(reconciliationAction(strategicSR, null, [])).toBe('stale');
  });
});

// ── _hasInsufficientData ──────────────────────────────────────────────────────

describe('profileTyping — _hasInsufficientData', () => {
  it('0 executed sessions (skip-only or empty) → stale=true, insufficient=true', () => {
    // Skip-only: 1 entry but executed=false → sessionCount=0 → stale
    const skipOnly = _hasInsufficientData([skipEntry({ date: '2026-03-01' })]);
    expect(skipOnly.stale).toBe(true);
    expect(skipOnly.insufficient).toBe(true);
    expect(skipOnly.sessionCount).toBe(0);
    // Empty array → also stale
    const empty = _hasInsufficientData([]);
    expect(empty.stale).toBe(true);
  });

  it('<12 sessions → insufficient=true, stale=false', () => {
    const entries = Array.from({ length: 8 }, (_, i) =>
      realWorkoutEntry({ date: `2026-03-${String(i + 10).padStart(2, '0')}` })
    );
    const result = _hasInsufficientData(entries);
    expect(result.insufficient).toBe(true);
    expect(result.stale).toBe(false);
    expect(result.sessionCount).toBe(8);
  });

  it('≥12 sessions → insufficient=false', () => {
    const entries = Array.from({ length: 14 }, (_, i) =>
      realWorkoutEntry({ date: `2026-03-${String(i + 1).padStart(2, '0')}` })
    );
    const result = _hasInsufficientData(entries);
    expect(result.insufficient).toBe(false);
    expect(result.stale).toBe(false);
    expect(result.sessionCount).toBe(14);
  });
});

// ── analyzeProfile — edge cases ───────────────────────────────────────────────

describe('profileTyping — analyzeProfile edge cases', () => {
  it('selfReport=null + sufficient cdlEntries → source=behavioral', () => {
    const entries = scenarioMarathon({ baseDate: '2026-04-01' });
    const result = analyzeProfile({ selfReport: null, cdlEntries: entries });
    expect(result.source).toBe('behavioral');
    expect(result.selfReport).toBeNull();
    expect(result.primary).not.toBeNull();
  });

  it('cdlEntries=[] + selfReport populated → source=self-report, behavioral=null', () => {
    const selfReport = { primary: 'Strategic', secondary: null, confidence: 'high' };
    const result = analyzeProfile({ selfReport, cdlEntries: [] });
    expect(result.source).toBe('self-report');
    expect(result.primary).toBe('Strategic');
    expect(result.behavioral).toBeNull();
  });

  it('both null → null primary, low confidence', () => {
    const result = analyzeProfile({ selfReport: null, cdlEntries: [] });
    expect(result.primary).toBeNull();
    expect(result.confidence).toBe('low');
  });

  it('riskFlags includes YO-YO_RISK when all-in pattern detected', () => {
    const entries = [
      deviationEntry({ date: '2026-03-09', proposedSets: 16, actualSets: 22 }),
      deviationEntry({ date: '2026-03-11', proposedSets: 16, actualSets: 22 }),
      realWorkoutEntry({ date: '2026-03-13' }),
      deviationEntry({ date: '2026-03-16', proposedSets: 16, actualSets: 22 }),
      realWorkoutEntry({ date: '2026-03-18' }),
      realWorkoutEntry({ date: '2026-03-20' }),
      deviationEntry({ date: '2026-03-23', proposedSets: 16, actualSets: 22 }),
      realWorkoutEntry({ date: '2026-03-25' }),
    ];
    const result = analyzeProfile({ selfReport: null, cdlEntries: entries });
    expect(result.riskFlags).toContain('YO-YO_RISK');
  });

  it('result always contains required fields', () => {
    const result = analyzeProfile({ selfReport: null, cdlEntries: [] });
    expect(result).toHaveProperty('primary');
    expect(result).toHaveProperty('secondary');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('source');
    expect(result).toHaveProperty('selfReport');
    expect(result).toHaveProperty('behavioral');
    expect(result).toHaveProperty('reconciliation');
    expect(result).toHaveProperty('riskFlags');
    expect(result).toHaveProperty('reasoning');
  });

  it('reconciliation=match when self-report matches behavioral primary', () => {
    const entries = scenarioStrategic({ baseDate: '2026-04-01' });
    const selfReport = { primary: 'Strategic', secondary: null, confidence: 'high' };
    const result = analyzeProfile({ selfReport, cdlEntries: entries, previousReconciliations: [] });
    expect(result.reconciliation).toBe('match');
    expect(result.source).toBe('reconciled');
  });

  it('reconciliation=mismatch when self-report differs from behavioral', () => {
    const entries = scenarioSprinter({ baseDate: '2026-04-01' });
    const selfReport = { primary: 'Marathon', secondary: null, confidence: 'high' };
    const result = analyzeProfile({ selfReport, cdlEntries: entries, previousReconciliations: [] });
    expect(result.reconciliation).toBe('mismatch');
    expect(result.secondary).toBe('Marathon');  // self-report preserved as secondary
  });
});

// ── Signature marker counts (unit-level) ──────────────────────────────────────

describe('profileTyping — Signature marker unit checks', () => {
  it('_matchSprinterSignature score is less than Marathon for clean entries (Marathon wins)', () => {
    // Clean profile: no deviations, no frustration, no hyperfocus, no calorie acceleration.
    // Recovery debt may fire (clean has ~1 rest/week, <2 threshold), but Marathon still wins overall.
    const entries = scenarioClean({ count: 12 });
    const sprinterScore = _matchSprinterSignature(entries);
    const marathonScore = _matchMarathonSignature(entries);
    expect(marathonScore).toBeGreaterThan(sprinterScore);
  });

  it('_matchMarathonSignature returns 0 for zero executed sessions', () => {
    const entries = [skipEntry({ date: '2026-03-01' }), skipEntry({ date: '2026-03-02' })];
    expect(_matchMarathonSignature(entries)).toBe(0);
  });

  it('_matchYoyoSignature: zero rest days contributes marker', () => {
    // All workouts, no rest → rest_marked=0 → marker 3 matches
    const entries = [
      realWorkoutEntry({ date: '2026-03-10' }),
      realWorkoutEntry({ date: '2026-03-12' }),
    ];
    const count = _matchYoyoSignature(entries);
    expect(count).toBeGreaterThanOrEqual(1);  // at least marker 3 (zero rest) + marker 4 (no low rating)
  });

  it('_matchStrategicSignature: deviationReason present → marker 1 fires', () => {
    const entries = [
      deviationEntry({ date: '2026-03-15', proposedSets: 16, actualSets: 18, deviationReason: 'progression_check' }),
      realWorkoutEntry({ date: '2026-03-17' }),
    ];
    const count = _matchStrategicSignature(entries);
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
