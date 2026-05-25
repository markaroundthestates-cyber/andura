/**
 * E2E persona detection — audit §30-H1 / §7-H2 / §7.10 verification.
 *
 * Validates analyzeProfile (engine public entry) correctly classifies the
 * 3 Andura user archetypes from CLAUDE.md against the ADR 013 behavioral
 * profile taxonomy (Sprinter / Marathon / Yo-yo / Strategic):
 *
 *   - Gigel  = user mediu non-tech RO, intra cu entuziasm + over-commits
 *              early + no rest acknowledgment + zero frustration logged.
 *              Expected behavioral classification: Yo-yo (pre-drop pattern).
 *
 *   - Marius = performant la sala, conscious deviations cu reason logged,
 *              reasoned early-stops, low impulsivity, stable ratings.
 *              Expected behavioral classification: Strategic.
 *
 *   - Maria 65 = conservativ varstnic, high consistency, planned rest days,
 *                zero volume creep, stable ratings, no frustration spikes.
 *                Expected behavioral classification: Marathon.
 *
 * Reference: ADR 013 (signature markers + counter-markers)
 *            findings-§30.md §30-H1 + findings-§07.md §7-H2 / §7.10
 *            CLAUDE.md persona definitions
 */

import { describe, it, expect } from 'vitest';
import { analyzeProfile } from '../profileTyping.js';
import {
  scenarioYoyo,
  scenarioStrategic,
  scenarioMarathon,
} from '../../../tests/fixtures/cdlEntries.js';

describe('profileTyping E2E — Gigel / Marius / Maria persona detection (§30-H1)', () => {
  it('Gigel (mediu non-tech, over-commits early no rest) -> Yo-yo behavioral', () => {
    // Gigel signature: aggressive volume early + zero rest_marked + no frustration
    // + calorie acceleration + hyperfocus — pre-drop all-in pattern.
    const { cdlEntries, hyperfocusData } = scenarioYoyo({ baseDate: '2026-04-01' });

    const result = analyzeProfile({
      selfReport: null,  // Gigel non-tech, may skip self-typing onboarding
      cdlEntries,
      hyperfocusData,
    });

    expect(result.primary).toBe('Yo-yo');
    expect(result.source).toBe('behavioral');
    expect(result.confidence).toBe('high');
    // YO-YO_RISK preventive flag fires when 3+ weeks all-in pattern detected
    expect(result.riskFlags).toContain('YO-YO_RISK');
  });

  it('Marius (performant la sala, conscious deviations + reason) -> Strategic behavioral', () => {
    // Marius signature: deviationReason logged + reasoned earlyStop +
    // low impulsivity + stable ratings.
    const cdlEntries = scenarioStrategic({ baseDate: '2026-04-01' });

    const result = analyzeProfile({
      selfReport: null,
      cdlEntries,
    });

    expect(result.primary).toBe('Strategic');
    expect(result.source).toBe('behavioral');
    expect(result.confidence).toBe('high');
    expect(result.riskFlags).not.toContain('YO-YO_RISK');
  });

  it('Maria 65 (conservativ, planned rest, zero creep) -> Marathon behavioral', () => {
    // Maria signature: consistency >=80% + zero volume creep + planned rest days
    // + no frustration spikes — steady-state Marathon pattern.
    const cdlEntries = scenarioMarathon({ baseDate: '2026-04-01' });

    const result = analyzeProfile({
      selfReport: null,
      cdlEntries,
    });

    expect(result.primary).toBe('Marathon');
    expect(result.source).toBe('behavioral');
    expect(result.confidence).toBe('high');
    expect(result.riskFlags).not.toContain('YO-YO_RISK');
  });

  it('Marius self-report Strategic + behavioral Strategic -> reconciled match', () => {
    // E2E reconciliation when self-report agrees with behavioral inference.
    const cdlEntries = scenarioStrategic({ baseDate: '2026-04-01' });
    const selfReport = { primary: 'Strategic', secondary: null, confidence: 'high' };

    const result = analyzeProfile({
      selfReport,
      cdlEntries,
      previousReconciliations: [],
    });

    expect(result.primary).toBe('Strategic');
    expect(result.source).toBe('reconciled');
    expect(result.reconciliation).toBe('match');
  });

  it('Gigel self-report Marathon + behavioral Yo-yo -> mismatch flagged (Gigel-test critical)', () => {
    // Critical Gigel scenario: user self-reports steady "Marathon" identity
    // but behavioral data shows Yo-yo pre-drop pattern. System must surface
    // mismatch for reconciliation prompt — pre-emptive intervention.
    const { cdlEntries, hyperfocusData } = scenarioYoyo({ baseDate: '2026-04-01' });
    const selfReport = { primary: 'Marathon', secondary: null, confidence: 'medium' };

    const result = analyzeProfile({
      selfReport,
      cdlEntries,
      hyperfocusData,
      previousReconciliations: [],
    });

    expect(result.reconciliation).toBe('mismatch');
    expect(result.primary).toBe('Yo-yo');           // behavioral wins
    expect(result.secondary).toBe('Marathon');      // self-report preserved
    expect(result.riskFlags).toContain('YO-YO_RISK');
  });

  it('all 3 personas produce distinct primary classifications (discrimination check)', () => {
    // Sanity: the same engine must NOT collapse all 3 archetypes into one bucket.
    const gigel = analyzeProfile({
      selfReport: null,
      ...scenarioYoyo({ baseDate: '2026-04-01' }),  // spreads cdlEntries + hyperfocusData
    });
    const marius = analyzeProfile({
      selfReport: null,
      cdlEntries: scenarioStrategic({ baseDate: '2026-04-01' }),
    });
    const maria = analyzeProfile({
      selfReport: null,
      cdlEntries: scenarioMarathon({ baseDate: '2026-04-01' }),
    });

    const classifications = [gigel.primary, marius.primary, maria.primary];
    const distinct = new Set(classifications);
    expect(distinct.size).toBe(3);  // each persona gets a different profile
  });
});
