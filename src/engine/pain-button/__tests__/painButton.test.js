import { describe, it, expect } from 'vitest';
import { PAIN_OPTIONS, processPainInput, buildOverrideAuditEntry } from '../index.js';

describe('Pain Button §36.38', () => {
  it('exposes 3 pain options (general/specific/technical)', () => {
    expect(PAIN_OPTIONS).toHaveLength(3);
    expect(PAIN_OPTIONS.map(o => o.level)).toEqual(['general', 'specific', 'technical']);
  });
  it('"Mișcarea mă deranjează" wording locked V1', () => {
    expect(PAIN_OPTIONS[0].label).toBe('Mișcarea mă deranjează');
  });
  it('processPainInput general → suggest_alternative', () => {
    expect(processPainInput('discomfort_general').action).toBe('suggest_alternative');
  });
  it('processPainInput DOMS sever → skip', () => {
    expect(processPainInput('doms_severe').action).toBe('skip');
  });
  it('buildOverrideAuditEntry sets user_override_pain_redflag flag', () => {
    const entry = buildOverrideAuditEntry({ exerciseName: 'Squat', painKey: 'discomfort_specific', userOverride: true });
    expect(entry.user_override_pain_redflag).toBe(true);
    expect(entry.exerciseName).toBe('Squat');
  });
});
