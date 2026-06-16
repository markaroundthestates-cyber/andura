// NUTR-1 (cycle-7 audit) — a subponderal user (BMI<=18.5) who picked 'slabire'
// is fed a healthy-floor SURPLUS by clampKcalToHealthyFloor (anti-undereating),
// NOT the raw CUT deficit. resolveEnergyMagnitude must NOT emit a CUT severity in
// that case, otherwise dp_energy_volume_v1 throttles training volume ~26% for
// someone the engine is simultaneously feeding to GAIN (a direct contradiction).
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolveEnergyMagnitude } from '../../lib/engineWrappers.nutrition';
import { useOnboardingStore } from '../../stores/onboardingStore';

function seed(data: Record<string, unknown>): void {
  useOnboardingStore.setState({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { age: 30, sex: 'f', frequency: '4', experience: 'intermediar', ...data } as any,
    completed: true,
    completedAt: Date.now(),
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('resolveEnergyMagnitude — NUTR-1 subponderal CUT guard', () => {
  it('CONTROL: a normal-BMI (24.5) slabire user emits a CUT severity', () => {
    seed({ goal: 'slabire', weight: 75, height: 175 }); // BMI 24.5
    const out = resolveEnergyMagnitude();
    expect(out).not.toBeNull();
    expect(out?.phase).toBe('CUT');
    expect(out!.severity).toBeGreaterThan(0);
  });

  it('a subponderal (BMI 15.6) slabire user gets NO CUT modulation (fed a surplus)', () => {
    seed({ goal: 'slabire', weight: 45, height: 170 }); // BMI 15.6 → healthy-floor surplus
    const out = resolveEnergyMagnitude();
    expect(out).toBeNull();
  });
});
