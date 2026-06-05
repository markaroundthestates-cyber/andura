// Calibration honesty — getCalibrationMaturity composer tests.
//
// Reuses the real calibration engine (detectCalibrationLevel) to surface an
// HONEST "still learning you" signal while the model is immature, and HIDE it
// (null) once dialed in. Truth-only: the session count is the user's REAL
// unique-session count; "sessions to next tier" is the next tier's minSessions
// entry threshold minus that count — never a fabricated number.

import { describe, it, expect, beforeEach } from 'vitest';
import { getCalibrationMaturity, getLaggingSignal } from '../../lib/engineWrappers';
import { useWorkoutStore } from '../../stores/workoutStore';
import { CALIBRATION_LEVELS } from '../../../engine/calibration.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Build N sessions evenly spread across `spanDays` ending today. Each session is
// a minimal sessionsHistory entry — only `ts` (the finish time) is read by the
// calibration ctx mapping.
function seedSessions(count: number, spanDays: number): void {
  const now = Date.now();
  const sessions = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = count > 1 ? (spanDays / (count - 1)) * (count - 1 - i) : 0;
    sessions.push({ ts: now - daysAgo * DAY_MS, title: `s${i}`, meta: '' });
  }
  useWorkoutStore.setState({ sessionsHistory: sessions });
}

beforeEach(() => {
  useWorkoutStore.setState({ sessionsHistory: [] });
});

describe('engineWrappers — getCalibrationMaturity (calibration honesty)', () => {
  it('cold start (0 sessions) → honest early-state signal, no crash', () => {
    const sig = getCalibrationMaturity();
    expect(sig).not.toBeNull();
    expect(sig?.tierName).toBe('cold_start');
    expect(sig?.sessionsCount).toBe(0);
    // Honest count to the next tier (INITIAL entry threshold).
    expect(sig?.sessionsToNext).toBe(CALIBRATION_LEVELS.INITIAL.minSessions);
  });

  it('immature tier exposes a real session count + sessions-to-next', () => {
    // 4 sessions over 10 days → INITIAL (engine routing).
    seedSessions(4, 10);
    const sig = getCalibrationMaturity();
    expect(sig).not.toBeNull();
    expect(sig?.tierName).toBe('initial');
    expect(sig?.sessionsCount).toBe(4);
    // DEVELOPING entry threshold is 6 → 6 - 4 = 2 sessions remaining (honest).
    expect(sig?.sessionsToNext).toBe(CALIBRATION_LEVELS.DEVELOPING.minSessions - 4);
  });

  it('returns null once the model is dialed in (PERSONALIZED+)', () => {
    // 60 sessions over 150 days → PERSONALIZED (id 4) → bannerText null → hidden.
    seedSessions(60, 150);
    expect(getCalibrationMaturity()).toBeNull();
  });

  it('never fabricates a count past a known threshold (sessionsToNext stays honest)', () => {
    // 4 sessions in 10 days (INITIAL). The "sessions remaining" is a positive,
    // real delta to the next tier — never negative, never invented.
    seedSessions(4, 10);
    const sig = getCalibrationMaturity();
    expect(sig?.sessionsToNext).toBeGreaterThan(0);
    expect(Number.isInteger(sig?.sessionsToNext)).toBe(true);
  });
});

// Trend-claim gate (chest-heavy-plan bug, 2026-06-05). The "{group} undervolume
// {weeks} wks" lagging line is a CONFIDENT multi-week trend claim. It must be
// mutually exclusive with the "still learning you" calibration line — never both
// at once. While the model is immature, getLaggingSignal suppresses the line.
describe('engineWrappers — getLaggingSignal gated by calibration maturity', () => {
  it('suppresses the undervolume-trend line while the model is still immature', () => {
    // A few sessions → immature (getCalibrationMaturity non-null). Whatever the
    // weakness detector finds, no confident multi-week trend claim is allowed yet.
    seedSessions(4, 10);
    expect(getCalibrationMaturity()).not.toBeNull(); // still learning
    expect(getLaggingSignal()).toBeNull(); // → no trend claim
  });
});

// Plan-allocation gate (LLM-judge Pattern A, 2026-06-06). The lagging line says
// "focus azi pe {group}". The founder bug: it named biceps as sub-volume "focus
// azi" while TODAY's plan was chest+shoulders only (zero biceps). The line must
// only fire when today's plan actually trains the weak group.
describe('engineWrappers — getLaggingSignal gated by today plan allocation', () => {
  // Build a MATURE history (so the calibration gate is open) where biceps is the
  // weak group: many chest sessions at a high 1RM + a single, very light biceps
  // log → biceps avg 1RM far below the cross-group average → detected weak.
  function seedMatureWeakBiceps(): void {
    const now = Date.now();
    const sessions = [];
    for (let i = 0; i < 60; i++) {
      const ts = now - ((150 / 59) * (59 - i)) * DAY_MS;
      sessions.push({
        ts,
        title: `s${i}`,
        meta: '',
        exercises: [
          {
            exerciseId: 'flat-db-press',
            exerciseName: 'Flat DB Press',
            engineName: 'Flat DB Press',
            totalVolume: 500,
            peakOneRM: 116,
            sets: [{ kg: 100, reps: 5, rating: 'potrivit' as const, timestamp: ts }],
          },
          // Very light biceps → its 1RM is far under the average → weak group.
          {
            exerciseId: 'cable-curl',
            exerciseName: 'Cable Curl',
            engineName: 'Cable Curl',
            totalVolume: 25,
            peakOneRM: 6,
            sets: [{ kg: 5, reps: 5, rating: 'potrivit' as const, timestamp: ts }],
          },
        ],
      });
    }
    useWorkoutStore.setState({ sessionsHistory: sessions });
  }

  it('SUPPRESSES "focus azi pe {group}" when today plan does not train the weak group', () => {
    seedMatureWeakBiceps();
    expect(getCalibrationMaturity()).toBeNull(); // mature → trend gate open
    // Sanity: with no allocation the line DOES fire (weak biceps detected).
    expect(getLaggingSignal()).not.toBeNull();
    // Today's plan trains chest+shoulders only — zero biceps. The line is a lie.
    const chestShouldersOnly = new Set(['piept', 'umeri']);
    expect(getLaggingSignal({ allocatedGroups: chestShouldersOnly })).toBeNull();
  });

  it('SHOWS "focus azi pe {group}" when today plan actually trains the weak group', () => {
    seedMatureWeakBiceps();
    expect(getCalibrationMaturity()).toBeNull();
    // Today's plan includes biceps → naming it is honest.
    const withBiceps = new Set(['piept', 'biceps']);
    expect(getLaggingSignal({ allocatedGroups: withBiceps })).not.toBeNull();
  });
});
