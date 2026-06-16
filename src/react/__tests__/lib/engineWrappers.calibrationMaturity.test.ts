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
  // SET-VOLUME weak group — the signal the PLAN actually amplifies (F0 dedup #2:
  // getLaggingSignal now reads getLaggingMuscles, set-volume ratio < 0.6 over the
  // trailing 14 days, NOT the narrate-only 1RM detector). 60 sessions over 150
  // days keep the model mature; the RECENT (in-window) sessions carry MANY chest
  // sets and FEW biceps sets so biceps' set ratio falls under 0.6 vs the average.
  // Crucially the 1RM signal does NOT make biceps weak here (biceps kg is HIGH) —
  // proving the sentence follows the driving (volume) signal, not 1RM.
  function seedMatureWeakBiceps(): void {
    const now = Date.now();
    const sessions = [];
    for (let i = 0; i < 60; i++) {
      const ts = now - ((150 / 59) * (59 - i)) * DAY_MS;
      const inWindow = now - ts < 14 * DAY_MS;
      const exercises = [
        {
          exerciseId: 'flat-db-press',
          exerciseName: 'Flat DB Press', // chest_mid → piept
          engineName: 'Flat DB Press',
          totalVolume: 1500,
          peakOneRM: 116,
          // Many chest sets per recent session → high chest set-volume.
          sets: [
            { kg: 100, reps: 5, rating: 'potrivit' as const, timestamp: ts },
            { kg: 100, reps: 5, rating: 'potrivit' as const, timestamp: ts },
            { kg: 100, reps: 5, rating: 'potrivit' as const, timestamp: ts },
          ],
        },
      ];
      // Biceps appears only in-window, with a SINGLE set (low set-volume) but a
      // HIGH kg (so 1RM ratio would NOT flag it — only set-volume does).
      if (inWindow) {
        exercises.push({
          exerciseId: 'cable-curl',
          exerciseName: 'Cable Curl', // bi_long/bi_short → biceps
          engineName: 'Cable Curl',
          totalVolume: 200,
          peakOneRM: 110,
          sets: [{ kg: 40, reps: 5, rating: 'potrivit' as const, timestamp: ts }],
        });
      }
      sessions.push({ ts, title: `s${i}`, meta: '', exercises });
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

  // F0 dedup #2 honesty fix: the sentence must follow the DRIVING (set-volume)
  // signal, NOT the narrate-only 1RM detector. In seedMatureWeakBiceps biceps is
  // VOLUME-weak (1 set vs 3 chest sets in-window) but NOT 1RM-weak (biceps kg=40,
  // peakOneRM=110, on par with chest). The old detectWeakGroups path (1RM ratio
  // < 0.8) would NOT have flagged biceps; getLaggingMuscles (set-volume) does.
  // Asserting biceps IS named proves the sentence now matches what the plan
  // amplifies — it can no longer name a muscle the plan ignores.
  it('names the SET-VOLUME-weak group (drives the plan), not a 1RM-only signal', () => {
    seedMatureWeakBiceps();
    expect(getCalibrationMaturity()).toBeNull();
    // Plan trains biceps today → the volume-weak group is honestly named.
    const line = getLaggingSignal({ allocatedGroups: new Set(['piept', 'biceps']) });
    expect(line).not.toBeNull();
    expect(line).toContain('Biceps'); // RO label for the biceps group
  });

  // cycle-11 cross-line contradiction gate: the why-line says "lighter on {group}
  // — still recovering" for a group cut for fatigue TODAY. The lagging line must
  // NOT then say "focus azi pe {group}" for the SAME muscle. recovery wins.
  it('SUPPRESSES the lagging line when the weak group is recovery-cut today', () => {
    seedMatureWeakBiceps();
    expect(getCalibrationMaturity()).toBeNull();
    const withBiceps = new Set(['piept', 'biceps']);
    // Sanity: without a recovery-cut, biceps is named.
    expect(getLaggingSignal({ allocatedGroups: withBiceps })).not.toBeNull();
    // Biceps is recovery-cut today → the lagging line is suppressed (no contradiction).
    expect(
      getLaggingSignal({ allocatedGroups: withBiceps }, new Set(['biceps'])),
    ).toBeNull();
    // A recovery-cut on a DIFFERENT group does not suppress the biceps lagging line.
    expect(
      getLaggingSignal({ allocatedGroups: withBiceps }, new Set(['umeri'])),
    ).not.toBeNull();
  });
});
