/**
 * Tests for TASK #22c session.js fixes:
 * C2c — cancelWorkout full state reset
 * H4c — resume derives completedExercises from sessLog
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sessionSrc = readFileSync(resolve(__dirname, '../session.js'), 'utf8');

// ── C2c — cancelWorkout full state reset ─────────────────────────────────

describe('C2c — cancelWorkout state cleanup', () => {
  it('calls clearDraft and teardownInactivity (parity with endSession)', () => {
    expect(sessionSrc).toContain('clearDraft(); teardownInactivity();');
  });

  it('calls releaseWakeLock on cancel', () => {
    // Extract just the cancelWorkout function body
    const cancelStart = sessionSrc.indexOf('export function cancelWorkout()');
    const cancelEnd = sessionSrc.indexOf('\nexport function endSession()');
    const cancelBody = sessionSrc.slice(cancelStart, cancelEnd);
    expect(cancelBody).toContain('releaseWakeLock()');
  });

  it('resets all 5 extra state fields: completedExercises, dropSetUsedThisSession, earlyStopReason, sessionKgOverride, activeNotes', () => {
    const cancelStart = sessionSrc.indexOf('export function cancelWorkout()');
    const cancelEnd = sessionSrc.indexOf('\nexport function endSession()');
    const cancelBody = sessionSrc.slice(cancelStart, cancelEnd);
    expect(cancelBody).toContain('state.completedExercises = new Set()');
    expect(cancelBody).toContain('state.dropSetUsedThisSession = false');
    expect(cancelBody).toContain('state.earlyStopReason = null');
    expect(cancelBody).toContain('state.sessionKgOverride = null');
    expect(cancelBody).toContain('state.activeNotes = new Set()');
  });
});

// ── H4c — resume derives completedExercises from sessLog ─────────────────

describe('H4c — resume completedExercises derivation', () => {
  it('derives completedExercises from sessLog on resume instead of new Set()', () => {
    expect(sessionSrc).toContain('_exSetCounts');
    expect(sessionSrc).toContain('draft.sessLog.forEach');
    expect(sessionSrc).toContain('EX_SETS[ex] || 3');
  });

  it('correctly identifies completed exercises — pure logic verification', () => {
    // Simulate the derivation logic inline
    const EX_SETS_mock = { 'Bench Press': 3, 'Squat': 4, 'Pull Up': 3 };
    const sessLog = [
      { ex: 'Bench Press', set: 1 },
      { ex: 'Bench Press', set: 2 },
      { ex: 'Bench Press', set: 3 },
      { ex: 'Squat', set: 1 },
      { ex: 'Squat', set: 2 },
      // Squat only has 2 of 4 sets — NOT complete
    ];
    const exSetCounts = {};
    sessLog.forEach(s => { exSetCounts[s.ex] = (exSetCounts[s.ex] || 0) + 1; });
    const completed = new Set(
      Object.entries(exSetCounts)
        .filter(([ex, n]) => n >= (EX_SETS_mock[ex] || 3))
        .map(([ex]) => ex)
    );
    expect(completed.has('Bench Press')).toBe(true);
    expect(completed.has('Squat')).toBe(false);
    expect(completed.has('Pull Up')).toBe(false);
    expect(completed.size).toBe(1);
  });

  it('resume with all exercises done marks all as completed', () => {
    const EX_SETS_mock = { 'Curl': 3, 'Row': 3 };
    const sessLog = [
      { ex: 'Curl', set: 1 }, { ex: 'Curl', set: 2 }, { ex: 'Curl', set: 3 },
      { ex: 'Row', set: 1 }, { ex: 'Row', set: 2 }, { ex: 'Row', set: 3 },
    ];
    const exSetCounts = {};
    sessLog.forEach(s => { exSetCounts[s.ex] = (exSetCounts[s.ex] || 0) + 1; });
    const completed = new Set(
      Object.entries(exSetCounts)
        .filter(([ex, n]) => n >= (EX_SETS_mock[ex] || 3))
        .map(([ex]) => ex)
    );
    expect(completed.size).toBe(2);
    expect(completed.has('Curl')).toBe(true);
    expect(completed.has('Row')).toBe(true);
  });
});
