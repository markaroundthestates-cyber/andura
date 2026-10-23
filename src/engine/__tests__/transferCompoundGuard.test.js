// Founder 2026-10-23 — his friend's legs day (history = the founder's copied sessions:
// Leg Extension 93 x 10, Leg Press 90 x 8) seeded a Smith Reverse Lunge at 86 kg off
// the Leg Extension (ratio 0.9) and a Walking Lunge at 40 kg per hand, and gave him a
// Glute Drive machine although he refuses hip thrusts (back).
import { describe, it, expect, afterEach } from 'vitest';
import { transferCompatibleLifts, classifyPattern } from '../dp/ceiling.js';
import { getSimilarityMultiplier } from '../exerciseMapping.js';
import { getExerciseMetadata } from '../exerciseLibrary.js';
import { buildExclusionTokens, isExcludedMovement } from '../movementExclusion.js';
import { movementKey } from '../sessionBuilder.js';
import { DP } from '../dp.js';

const eq = (n) => getExerciseMetadata(n)?.equipment_type;
const flags = (o) => localStorage.setItem('_devFlags', JSON.stringify(o));

afterEach(() => {
  localStorage.removeItem('_devFlags');
  localStorage.removeItem('logs');
});

describe('dp_transfer_compound_guard_v1 — cold-start transfer sanity', () => {
  it('a leg isolation never seeds a compound (and back); compounds still seed compounds', () => {
    expect(transferCompatibleLifts('Smith Reverse Lunge', 'Leg Extension')).toBe(false);
    expect(transferCompatibleLifts('Barbell Back Squat (High Bar)', 'Leg Curl')).toBe(false);
    expect(transferCompatibleLifts('Leg Extension', 'Leg Press')).toBe(false);
    expect(transferCompatibleLifts('Barbell Back Squat (High Bar)', 'Leg Press')).toBe(true);
    expect(transferCompatibleLifts('Leg Curl', 'Leg Extension')).toBe(true);
    flags({ dp_transfer_compound_guard_v1: false });
    expect(transferCompatibleLifts('Smith Reverse Lunge', 'Leg Extension')).toBe(true);
  });

  it('a one-leg dumbbell lift from the leg press: half the legs, per hand', () => {
    expect(getSimilarityMultiplier('Walking Lunge', 'Leg Press', eq, classifyPattern)).toBeCloseTo(0.45 * 0.55 * 0.4, 5);
    expect(getSimilarityMultiplier('Smith Reverse Lunge', 'Leg Press', eq, classifyPattern)).toBeCloseTo(0.45 * 0.55, 5);
    // A two-leg lift is untouched (the 10-01 squat ← leg press ratio).
    expect(getSimilarityMultiplier('Barbell Back Squat (High Bar)', 'Leg Press', eq, classifyPattern)).toBe(0.45);
    flags({ dp_transfer_compound_guard_v1: false });
    expect(getSimilarityMultiplier('Walking Lunge', 'Leg Press', eq, classifyPattern)).toBe(0.45);
  });

  it('his history seeds the Smith Reverse Lunge off the Leg Press at a lunge load, not 86', () => {
    const now = Date.UTC(2026, 9, 23, 6);
    const logs = [];
    for (const d of [3, 10, 17]) {
      for (let s = 0; s < 3; s++) {
        logs.push({ ex: 'Leg Extension', w: 93, reps: '10', rpe: 7.5, date: '2026-10-1' + (9 - (d % 10)), ts: now - d * 864e5 + s });
        logs.push({ ex: 'Leg Press', w: 90, reps: '8', rpe: 7.5, date: '2026-10-1' + (9 - (d % 10)), ts: now - d * 864e5 + 100 + s });
      }
    }
    localStorage.setItem('logs', JSON.stringify(logs));
    const seed = DP.coldStartTransfer('Smith Reverse Lunge', 8);
    expect(seed?.source).toBe('Leg Press');
    expect(seed?.kg).toBeLessThanOrEqual(40);
  });

  it('generic-to-generic wall compares the last WORD (split on whitespace, not on "s")', () => {
    flags({ dp_transfer_generic_wall_v1: true });
    expect(classifyPattern('Cable Crunch')).toBe('generic');
    expect(transferCompatibleLifts('Cable Crunch', 'Machine Crunch')).toBe(true);
  });
});

describe('dp_glute_drive_hip_thrust_v1 — a hip-thrust refusal covers the Glute Drive', () => {
  const tok = (n) => String(movementKey(n, getExerciseMetadata(n))).split('::')[1] ?? '';
  it('refused hip thrust → Glute Drive Machine excluded; other glute work is not', () => {
    const excl = buildExclusionTokens([], ['squat', 'deadlift', 'hip-thrust']);
    expect(isExcludedMovement('Glute Drive Machine', tok('Glute Drive Machine'), excl)).toBe(true);
    expect(isExcludedMovement('Cable Glute Kickback', tok('Cable Glute Kickback'), excl)).toBe(false);
    flags({ dp_glute_drive_hip_thrust_v1: false });
    expect(isExcludedMovement('Glute Drive Machine', tok('Glute Drive Machine'), excl)).toBe(false);
  });
});
