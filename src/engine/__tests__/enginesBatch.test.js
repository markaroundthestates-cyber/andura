/**
 * Tests for TASK #22d engine fixes:
 * - isoWeek ISO 8601 Thursday rule (stagnationDetector + responseProfile)
 * - H14g checkRecoveryGroups computes daysSinceLast from logs
 */

import { describe, it, expect } from 'vitest';
import { checkRecoveryGroups } from '../proactiveEngine.js';

// ── isoWeek helper (same algorithm as stagnationDetector.js / responseProfile.js) ──

function isoWeek(ts) {
  const d = new Date(ts || Date.now());
  const thursday = new Date(d);
  thursday.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
  const jan4 = new Date(thursday.getFullYear(), 0, 4);
  const w1start = new Date(jan4);
  w1start.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const week = Math.floor((thursday - w1start) / (7 * 86400000)) + 1;
  return `${thursday.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ── ISO week boundary tests ────────────────────────────────────────────────

describe('isoWeek — ISO 8601 Thursday rule', () => {
  it('2025-12-29 (Mon) belongs to 2026-W01 (its Thursday is Jan 1 2026)', () => {
    // Dec 29 2025 is Monday. Its Thursday is Jan 1 2026 → 2026-W01
    const ts = new Date('2025-12-29').getTime();
    expect(isoWeek(ts)).toBe('2026-W01');
  });

  it('2026-01-01 (Thu) belongs to 2026-W01', () => {
    const ts = new Date('2026-01-01').getTime();
    expect(isoWeek(ts)).toBe('2026-W01');
  });

  it('2026-01-04 (Sun) belongs to 2026-W01', () => {
    const ts = new Date('2026-01-04').getTime();
    expect(isoWeek(ts)).toBe('2026-W01');
  });

  it('2025-12-28 (Sun) belongs to 2025-W52 (its Thursday is Dec 25)', () => {
    // Dec 28 2025 is Sunday. Thursday of that week is Dec 25 → 2025-W52
    const ts = new Date('2025-12-28').getTime();
    expect(isoWeek(ts)).toBe('2025-W52');
  });

  it('2025-01-01 (Wed) belongs to 2025-W01 (its Thursday is Jan 2)', () => {
    const ts = new Date('2025-01-01').getTime();
    expect(isoWeek(ts)).toBe('2025-W01');
  });

  it('2024-12-30 (Mon) belongs to 2025-W01 (its Thursday is Jan 2 2025)', () => {
    const ts = new Date('2024-12-30').getTime();
    expect(isoWeek(ts)).toBe('2025-W01');
  });
});

// ── H14g — checkRecoveryGroups real computation ───────────────────────────

describe('H14g — checkRecoveryGroups from logs', () => {
  const muscleExercises = {
    lat: ['Lat Pulldown', 'Cable Row'],
    quad: ['Leg Press', 'Leg Extension'],
    delt_rear: ['Rear Delt Fly', 'Face Pulls'],
  };

  it('returns null when logs empty', () => {
    expect(checkRecoveryGroups([], null, muscleExercises)).toBeNull();
  });

  it('returns null when muscleExercises not provided', () => {
    const logs = [{ ex: 'Lat Pulldown', w: 60, ts: Date.now() - 86400000 }];
    expect(checkRecoveryGroups(logs, null, null)).toBeNull();
  });

  it('returns undertrained alert when muscle has no logs in 6 days', () => {
    const now = Date.now();
    const logs = [
      // lat trained 2 days ago — not undertrained
      { ex: 'Lat Pulldown', w: 60, ts: now - 2 * 86400000, baseline: false },
      // quad trained 7 days ago — undertrained
      { ex: 'Leg Press', w: 100, ts: now - 7 * 86400000, baseline: false },
      // delt_rear has no logs → undertrained (Infinity days)
    ];
    const result = checkRecoveryGroups(logs, null, muscleExercises);
    expect(result).not.toBeNull();
    expect(result.type).toBe('undertrained_groups');
    expect(result.groups).toContain('quad');
    expect(result.groups).toContain('delt_rear');
    expect(result.groups).not.toContain('lat');
  });

  it('returns null when all muscles trained within 5 days', () => {
    const now = Date.now();
    const logs = [
      { ex: 'Lat Pulldown', w: 60, ts: now - 1 * 86400000, baseline: false },
      { ex: 'Leg Press', w: 100, ts: now - 2 * 86400000, baseline: false },
      { ex: 'Rear Delt Fly', w: 10, ts: now - 3 * 86400000, baseline: false },
    ];
    expect(checkRecoveryGroups(logs, null, muscleExercises)).toBeNull();
  });

  it('ignores baseline logs for daysSinceLast computation', () => {
    const now = Date.now();
    const logs = [
      // baseline log from today — should not count
      { ex: 'Lat Pulldown', w: 60, ts: now - 1000, baseline: true },
      // real lat log from 8 days ago
      { ex: 'Lat Pulldown', w: 60, ts: now - 8 * 86400000, baseline: false },
    ];
    const result = checkRecoveryGroups(logs, null, { lat: ['Lat Pulldown'] });
    expect(result).not.toBeNull();
    expect(result.groups).toContain('lat');
  });
});
