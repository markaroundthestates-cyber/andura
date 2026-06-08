// ══ COACH-REPLAY — acceptance (DEV INSTRUMENT, runs under the sim's vitest env) ══
// task #66 §2f. Seeds a TINY known real-shaped log export (one exercise, several
// sessions of a clean overload progression) and asserts the replay emits a
// per-session DECISION TRACE that surfaces the engine's REAL recReason.status +
// confidence{sigma,n} — proving the tool reports the real decision, not a
// re-guess. Reuses the full-path-sim determinism (real compose path, injected
// clock — no Date.now leak in the driven path).
//
// LOAD-BEARING (memory project_dp_namekey_fix): the export's log rows are keyed
// on the EN engineName the engine reads. A row with NO `ex` key is engine-dead;
// the ingest must COUNT it as an orphan, not silently rewrite it. Asserted below.

import { describe, it, expect } from 'vitest';
import { replayJourney, replayAB, formatTrace } from '../../../scripts/coach-replay/replay.mjs';
import { ingestExport, groupSessions } from '../../../scripts/coach-replay/ingest.mjs';

const MS_DAY = 86400000;
const isod = (ms) => new Date(ms).toISOString().slice(0, 10);

/** A small real-shaped export: one barbell lift logged across several weekly
 *  sessions at a steadily climbing load (a clean overload journey). EN engine
 *  key on `ex` (the load-bearing rule). One deliberate orphan row (no `ex`). */
function buildExport(nowAnchor) {
  const logs = [];
  // 5 weekly sessions of Lat Pulldown, 3 sets, climbing 40 → 55kg at 10 reps.
  const loads = [40, 45, 50, 52.5, 55];
  loads.forEach((w, wi) => {
    const ts = nowAnchor - (loads.length - wi) * 7 * MS_DAY;
    for (let s = 1; s <= 3; s++) {
      logs.push({ ex: 'Lat Pulldown', w, kg: w, reps: '10', set: s, ts: ts + s * 1000, session: ts, date: isod(ts), rpe: 7.5 });
    }
  });
  // One engine-dead row: a log written under the RO DISPLAY name (no canonical
  // `ex`) — the exact name-key bug class the ingest must flag, not adopt.
  logs.push({ name: 'Tractiuni la helcometru', w: 60, reps: '10', set: 1, ts: nowAnchor - 3 * MS_DAY });
  return {
    logs,
    data: { age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar', weight: 80, height: 178 },
  };
}

describe('coach-replay — ingest (pure)', () => {
  it('preserves the EN engine key + counts orphan (no-ex) rows', () => {
    const exp = buildExport(Date.parse('2026-06-01T12:00:00Z'));
    const { logs, onboarding, stats } = ingestExport(exp);
    expect(stats.exercises).toContain('Lat Pulldown');
    expect(stats.orphanRows).toBe(1); // the RO-display-name row is engine-dead
    expect(onboarding?.goal).toBe('masa');
    // every engine-keyed row kept its EN `ex` verbatim (NEVER rewritten to RO)
    const keyed = logs.filter((r) => r.ex);
    expect(keyed.every((r) => r.ex === 'Lat Pulldown')).toBe(true);
  });

  it('groups rows into chronologically-ordered sessions', () => {
    const exp = buildExport(Date.parse('2026-06-01T12:00:00Z'));
    const { logs } = ingestExport(exp);
    const sessions = groupSessions(logs.filter((r) => r.ex));
    expect(sessions.length).toBeGreaterThanOrEqual(5);
    for (let i = 1; i < sessions.length; i++) {
      expect(sessions[i].ts).toBeGreaterThanOrEqual(sessions[i - 1].ts);
    }
  });
});

describe('coach-replay — journey replay through the REAL compose path', () => {
  it('emits a per-session decision trace carrying recReason + confidence', async () => {
    const exp = buildExport(Date.now());
    const result = await replayJourney(exp);

    expect(result.meta.sessions).toBeGreaterThan(0);
    expect(result.meta.exercises).toContain('Lat Pulldown');
    expect(result.meta.orphanRows).toBe(1);

    // At least one composed session must surface a recReason.status for the lift
    // the user actually trained — the engine's real "why," carried by F5-W0.
    const composed = result.sessions.filter((s) => !s.missed && s.exercises.length);
    expect(composed.length).toBeGreaterThan(0);

    const withReason = composed
      .flatMap((s) => s.exercises)
      .filter((e) => e.recReason.status != null);
    expect(withReason.length).toBeGreaterThan(0);

    // confidence shape is present (sigma may be null at cold start; n a number).
    const anyEx = composed.flatMap((s) => s.exercises)[0];
    expect(anyEx).toHaveProperty('confidence.n');
    expect(typeof anyEx.confidence.n).toBe('number');

    // the readable dump renders without throwing (the support console form).
    expect(typeof formatTrace(result)).toBe('string');
  });

  it('the Lat Pulldown rec status + sigma reflect a real DP branch as history accumulates (not a re-guess)', async () => {
    const exp = buildExport(Date.now());
    const result = await replayJourney(exp);
    // Lat Pulldown rows in chronological order — the lift the user actually trained.
    const latRows = result.sessions
      .filter((s) => !s.missed)
      .flatMap((s) => s.exercises.filter((e) => e.engineName === 'Lat Pulldown' && e.recReason.status));
    expect(latRows.length).toBeGreaterThan(0);

    // Each status is one of the engine's machine enums — NOT a fabricated label.
    // (Verified vocabulary surfaced by the replay: RETURN DELOAD / CONSOLIDATE /
    // INCREASE / EASE BACK / INIT / ON TARGET / CATCH UP / CAP REPS / MAINTAIN /
    // STAGNANT +SET / TECHNIQUE / SCALE BACK / PEAK.)
    const ENUMS = ['INCREASE', 'EASE BACK', 'CONSOLIDATE', 'CATCH UP', 'INIT', 'ON TARGET',
      'CAP REPS', 'MAINTAIN', 'STAGNANT +SET', 'TECHNIQUE', 'SCALE BACK', 'PEAK', 'RETURN DELOAD'];
    for (const e of latRows) {
      expect(ENUMS.some((en) => e.recReason.status.includes(en))).toBe(true);
    }

    // The confidence posterior is REAL engine state: as observations accumulate
    // across sessions, sigma must MONOTONICALLY shrink and n must grow — the
    // Kalman "I'm getting to know this lift" signal, not a re-guess. (We compare
    // the first vs the last Lat Pulldown row that carry a finite sigma.)
    const withSigma = latRows.filter((e) => e.confidence.sigma != null);
    expect(withSigma.length).toBeGreaterThanOrEqual(2);
    const first = withSigma[0];
    const last = withSigma[withSigma.length - 1];
    expect(last.confidence.n).toBeGreaterThan(first.confidence.n);
    expect(last.confidence.sigma).toBeLessThan(first.confidence.sigma);
  });
});

describe('coach-replay — A/B flag diff (support superpower)', () => {
  it('runs the same logs OFF vs ONE flag ON and returns a structured diff', async () => {
    const exp = buildExport(Date.now());
    const ab = await replayAB(exp, 'dp_acwr_readiness_v1');
    expect(ab.flag).toBe('dp_acwr_readiness_v1');
    expect(Array.isArray(ab.diffs)).toBe(true);
    expect(typeof ab.totalDiffs).toBe('number');
    // both arms produced the same number of composed sessions (deterministic).
    expect(ab.off.sessions.length).toBe(ab.on.sessions.length);
  });
});
