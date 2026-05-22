// ══ ONBOARDING STORE TESTS — §30-C1 Big 6 bounds enforcement ═════════════
// CRIT-BETA cluster fix 2026-05-22. Verifies two-tier validation:
// (1) `isSafeOnboardingValue` catastrophe gate (NaN/Infinity/neg/0 rejected
//     silently at setField — engine-killer protection).
// (2) `validateOnboardingField` range gate (age 16-99, weight 30-250kg) —
//     surfaces Gigel-friendly reason string for UI toast.
// (3) `finalize()` gate refuses to mark completed if any field out-of-range.
//
// Source: 📤_outbox/audit-nuclear-2026-05-19/findings-§30.md §30-C1 +
//         RECON_CRIT_OPEN_chat-4.md cluster BETA + DECISIONS.md D046 §28-H5.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  useOnboardingStore,
  validateOnboardingField,
  isSafeOnboardingValue,
  ONBOARDING_BOUNDS,
} from '../../stores/onboardingStore';

function resetStore(): void {
  useOnboardingStore.setState({
    data: {
      age: null,
      sex: null,
      goal: null,
      frequency: null,
      experience: null,
      weight: null,
    },
    completed: false,
    completedAt: null,
  });
  localStorage.clear();
}

describe('onboardingStore — ONBOARDING_BOUNDS constants', () => {
  it('age bounds 16-99 (D046 §28-H5 GDPR Romania)', () => {
    expect(ONBOARDING_BOUNDS.age.min).toBe(16);
    expect(ONBOARDING_BOUNDS.age.max).toBe(99);
  });

  it('weight bounds 30-250 kg (audit §30.6)', () => {
    expect(ONBOARDING_BOUNDS.weight.min).toBe(30);
    expect(ONBOARDING_BOUNDS.weight.max).toBe(250);
  });
});

describe('onboardingStore — isSafeOnboardingValue catastrophe gate', () => {
  it('accepts null (clearing field always safe)', () => {
    expect(isSafeOnboardingValue('age', null)).toBe(true);
    expect(isSafeOnboardingValue('weight', null)).toBe(true);
  });

  it('accepts in-progress typing values (e.g. 1 while building 16)', () => {
    // Intermediate typing values must pass — UX continuity. Range gate
    // catches them at Continua button instead.
    expect(isSafeOnboardingValue('age', 1)).toBe(true);
    expect(isSafeOnboardingValue('age', 5)).toBe(true);
    expect(isSafeOnboardingValue('weight', 5)).toBe(true);
  });

  it('accepts valid range values', () => {
    expect(isSafeOnboardingValue('age', 32)).toBe(true);
    expect(isSafeOnboardingValue('weight', 78.5)).toBe(true);
  });

  it('rejects NaN (paste "abc" → Number("abc") = NaN)', () => {
    expect(isSafeOnboardingValue('age', NaN)).toBe(false);
    expect(isSafeOnboardingValue('weight', NaN)).toBe(false);
  });

  it('rejects Infinity (programmatic abuse)', () => {
    expect(isSafeOnboardingValue('age', Infinity)).toBe(false);
    expect(isSafeOnboardingValue('weight', -Infinity)).toBe(false);
  });

  it('rejects negative numerics', () => {
    expect(isSafeOnboardingValue('age', -5)).toBe(false);
    expect(isSafeOnboardingValue('weight', -10)).toBe(false);
  });

  it('rejects zero (engine math divide-by-zero protection)', () => {
    expect(isSafeOnboardingValue('age', 0)).toBe(false);
    expect(isSafeOnboardingValue('weight', 0)).toBe(false);
  });

  it('accepts literal-union fields (type-narrow safe by construction)', () => {
    expect(isSafeOnboardingValue('sex', 'm')).toBe(true);
    expect(isSafeOnboardingValue('goal', 'forta')).toBe(true);
    expect(isSafeOnboardingValue('frequency', '3')).toBe(true);
    expect(isSafeOnboardingValue('experience', 'avansat')).toBe(true);
  });
});

describe('onboardingStore — validateOnboardingField range gate', () => {
  it('accepts null', () => {
    expect(validateOnboardingField('age', null)).toEqual({ ok: true });
    expect(validateOnboardingField('weight', null)).toEqual({ ok: true });
  });

  it('accepts age boundary min (16)', () => {
    expect(validateOnboardingField('age', 16)).toEqual({ ok: true });
  });

  it('accepts age boundary max (99)', () => {
    expect(validateOnboardingField('age', 99)).toEqual({ ok: true });
  });

  it('rejects age below min (8) cu Gigel-friendly reason', () => {
    const result = validateOnboardingField('age', 8);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('16');
      expect(result.reason).toContain('99');
      expect(result.reason.toLowerCase()).toContain('varsta');
    }
  });

  it('rejects age above max (150)', () => {
    const result = validateOnboardingField('age', 150);
    expect(result.ok).toBe(false);
  });

  it('rejects age = 15 (GDPR Romania minor below 16)', () => {
    const result = validateOnboardingField('age', 15);
    expect(result.ok).toBe(false);
  });

  it('accepts weight boundary min (30)', () => {
    expect(validateOnboardingField('weight', 30)).toEqual({ ok: true });
  });

  it('accepts weight boundary max (250)', () => {
    expect(validateOnboardingField('weight', 250)).toEqual({ ok: true });
  });

  it('rejects weight below min (10) cu Gigel-friendly reason', () => {
    const result = validateOnboardingField('weight', 10);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('30');
      expect(result.reason).toContain('250');
      expect(result.reason.toLowerCase()).toContain('greutate');
    }
  });

  it('rejects weight above max (999) — engine NaN protection', () => {
    const result = validateOnboardingField('weight', 999);
    expect(result.ok).toBe(false);
  });

  it('rejects NaN with invalid-value reason', () => {
    const ageRes = validateOnboardingField('age', NaN);
    expect(ageRes.ok).toBe(false);
    if (!ageRes.ok) expect(ageRes.reason.toLowerCase()).toContain('invalida');
  });

  it('accepts literal-union fields unconditional', () => {
    expect(validateOnboardingField('sex', 'm')).toEqual({ ok: true });
    expect(validateOnboardingField('goal', 'forta')).toEqual({ ok: true });
    expect(validateOnboardingField('frequency', '3')).toEqual({ ok: true });
    expect(validateOnboardingField('experience', 'incepator')).toEqual({ ok: true });
  });
});

describe('onboardingStore — setField catastrophe rejection', () => {
  beforeEach(resetStore);

  it('commits valid age', () => {
    useOnboardingStore.getState().setField('age', 32);
    expect(useOnboardingStore.getState().data.age).toBe(32);
  });

  it('commits in-progress typing value (1) for UX continuity', () => {
    useOnboardingStore.getState().setField('age', 1);
    expect(useOnboardingStore.getState().data.age).toBe(1);
  });

  it('silently rejects NaN — engine-killer protection', () => {
    useOnboardingStore.getState().setField('age', NaN);
    expect(useOnboardingStore.getState().data.age).toBeNull();
  });

  it('silently rejects Infinity', () => {
    useOnboardingStore.getState().setField('weight', Infinity);
    expect(useOnboardingStore.getState().data.weight).toBeNull();
  });

  it('silently rejects negative numerics', () => {
    useOnboardingStore.getState().setField('age', -5);
    useOnboardingStore.getState().setField('weight', -10);
    expect(useOnboardingStore.getState().data.age).toBeNull();
    expect(useOnboardingStore.getState().data.weight).toBeNull();
  });

  it('silently rejects zero', () => {
    useOnboardingStore.getState().setField('age', 0);
    expect(useOnboardingStore.getState().data.age).toBeNull();
  });

  it('allows setField(null) to clear field', () => {
    useOnboardingStore.getState().setField('age', 32);
    useOnboardingStore.getState().setField('age', null);
    expect(useOnboardingStore.getState().data.age).toBeNull();
  });

  it('commits literal-union fields (type-narrow safe)', () => {
    useOnboardingStore.getState().setField('sex', 'm');
    useOnboardingStore.getState().setField('goal', 'forta');
    useOnboardingStore.getState().setField('frequency', '3');
    useOnboardingStore.getState().setField('experience', 'avansat');
    const { data } = useOnboardingStore.getState();
    expect(data.sex).toBe('m');
    expect(data.goal).toBe('forta');
    expect(data.frequency).toBe('3');
    expect(data.experience).toBe('avansat');
  });
});

describe('onboardingStore — finalize gate (engine boundary)', () => {
  beforeEach(resetStore);

  it('refuses finalize cu age out-of-range (12)', () => {
    // Bypass setField to inject invalid value (simulate stale persisted state)
    useOnboardingStore.setState({
      data: {
        age: 12,
        sex: 'm',
        goal: 'forta',
        frequency: '3',
        experience: 'avansat',
        weight: 78,
      },
    });
    useOnboardingStore.getState().finalize();
    expect(useOnboardingStore.getState().completed).toBe(false);
    expect(useOnboardingStore.getState().completedAt).toBeNull();
  });

  it('refuses finalize cu weight out-of-range (999)', () => {
    useOnboardingStore.setState({
      data: {
        age: 32,
        sex: 'm',
        goal: 'forta',
        frequency: '3',
        experience: 'avansat',
        weight: 999,
      },
    });
    useOnboardingStore.getState().finalize();
    expect(useOnboardingStore.getState().completed).toBe(false);
  });

  it('finalizes cu all Big 6 valid', () => {
    useOnboardingStore.setState({
      data: {
        age: 32,
        sex: 'm',
        goal: 'forta',
        frequency: '3',
        experience: 'avansat',
        weight: 78,
      },
    });
    useOnboardingStore.getState().finalize();
    expect(useOnboardingStore.getState().completed).toBe(true);
    expect(useOnboardingStore.getState().completedAt).not.toBeNull();
  });

  it('finalizes cu boundary values (age 16 + weight 30)', () => {
    useOnboardingStore.setState({
      data: {
        age: 16,
        sex: 'f',
        goal: 'longevitate',
        frequency: '2',
        experience: 'incepator',
        weight: 30,
      },
    });
    useOnboardingStore.getState().finalize();
    expect(useOnboardingStore.getState().completed).toBe(true);
  });

  it('finalizes cu boundary values (age 99 + weight 250)', () => {
    useOnboardingStore.setState({
      data: {
        age: 99,
        sex: 'f',
        goal: 'mentenanta',
        frequency: '2',
        experience: 'avansat',
        weight: 250,
      },
    });
    useOnboardingStore.getState().finalize();
    expect(useOnboardingStore.getState().completed).toBe(true);
  });
});

describe('onboardingStore — reset clears bounds state', () => {
  beforeEach(resetStore);

  it('reset clears data + completed + completedAt', () => {
    useOnboardingStore.getState().setField('age', 32);
    useOnboardingStore.getState().setField('weight', 78);
    useOnboardingStore.setState({ completed: true, completedAt: Date.now() });
    useOnboardingStore.getState().reset();
    const s = useOnboardingStore.getState();
    expect(s.data.age).toBeNull();
    expect(s.data.weight).toBeNull();
    expect(s.completed).toBe(false);
    expect(s.completedAt).toBeNull();
  });
});
