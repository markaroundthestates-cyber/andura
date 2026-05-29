import { describe, it, expect } from 'vitest';
import {
  detectCalibrationLevel,
  shouldRecalibrate,
  applyRollingWindow,
  _applyInactivityDecay,
  CALIBRATION_LEVELS,
} from '../calibration.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeLog(daysAgo, exercise = 'Lat Pulldown', sessionId = '0') {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return {
    date: d.toISOString().slice(0, 10),
    timestamp: d.toISOString(),
    ex: exercise,
    w: 30,
    reps: 8,
    session: `session-${sessionId}`,
  };
}

function makeCtxWithSessions(sessionCount, daysOld) {
  const logs = [];
  for (let i = 0; i < sessionCount; i++) {
    const dayOffset = sessionCount > 1 ? (daysOld / (sessionCount - 1)) * i : 0;
    const daysAgo = Math.max(0, daysOld - dayOffset);
    for (let s = 0; s < 3; s++) {
      logs.push(makeLog(daysAgo, 'Lat Pulldown', String(i)));
    }
  }
  return { allLogs: logs };
}

// ── detectCalibrationLevel ───────────────────────────────────────────────────

describe('detectCalibrationLevel', () => {
  it('returns COLD_START for 0 sessions', () => {
    const result = detectCalibrationLevel({ allLogs: [] });
    expect(result.name).toBe('cold_start');
  });

  it('returns COLD_START for 2 sessions in 3 days', () => {
    const result = detectCalibrationLevel(makeCtxWithSessions(2, 3));
    expect(result.name).toBe('cold_start');
  });

  it('returns COLD_START even with logs if <7 days old', () => {
    const ctx = makeCtxWithSessions(5, 4); // 5 sessions but only 4 days old
    const result = detectCalibrationLevel(ctx);
    expect(result.name).toBe('cold_start');
  });

  it('returns INITIAL for 4 sessions in 10 days', () => {
    // <14 days OR <6 sessions → INITIAL per ADR 009 §AMENDMENT D1
    const result = detectCalibrationLevel(makeCtxWithSessions(4, 10));
    expect(result.name).toBe('initial');
  });

  it('returns DEVELOPING for 8 sessions in 14 days', () => {
    // ≥14 days AND ≥6 sessions, but <28 days OR <12 sessions → DEVELOPING (bridge tier)
    const result = detectCalibrationLevel(makeCtxWithSessions(8, 14));
    expect(result.name).toBe('developing');
  });

  it('returns DEVELOPING for 10 sessions in 20 days', () => {
    const result = detectCalibrationLevel(makeCtxWithSessions(10, 20));
    expect(result.name).toBe('developing');
  });

  it('returns PERSONALIZING for 25 sessions in 60 days', () => {
    const result = detectCalibrationLevel(makeCtxWithSessions(25, 60));
    expect(result.name).toBe('personalizing');
  });

  it('returns PERSONALIZED for 60 sessions in 150 days', () => {
    const result = detectCalibrationLevel(makeCtxWithSessions(60, 150));
    expect(result.name).toBe('personalized');
  });

  it('returns OPTIMIZED for 200 sessions in 400 days', () => {
    const result = detectCalibrationLevel(makeCtxWithSessions(200, 400));
    expect(result.name).toBe('optimized');
  });

  it('returns a valid CALIBRATION_LEVELS entry', () => {
    const result = detectCalibrationLevel({ allLogs: [] });
    expect(result).toBe(CALIBRATION_LEVELS.COLD_START);
  });
});

// ── Feature flags per level ───────────────────────────────────────────────────

describe('COLD_START feature flags', () => {
  it('has patternsEnabled=false', () => {
    expect(CALIBRATION_LEVELS.COLD_START.patternsEnabled).toBe(false);
  });

  it('has weakGroupEnabled=false', () => {
    expect(CALIBRATION_LEVELS.COLD_START.weakGroupEnabled).toBe(false);
  });

  it('has stagnationEnabled=false', () => {
    expect(CALIBRATION_LEVELS.COLD_START.stagnationEnabled).toBe(false);
  });

  it('has predictionEnabled=false', () => {
    expect(CALIBRATION_LEVELS.COLD_START.predictionEnabled).toBe(false);
  });

  it('has a bannerText', () => {
    expect(typeof CALIBRATION_LEVELS.COLD_START.bannerText).toBe('string');
    expect(CALIBRATION_LEVELS.COLD_START.bannerText.length).toBeGreaterThan(0);
  });
});

describe('OPTIMIZED feature flags', () => {
  it('has all engines enabled', () => {
    const lvl = CALIBRATION_LEVELS.OPTIMIZED;
    expect(lvl.patternsEnabled).toBe(true);
    expect(lvl.weakGroupEnabled).toBe(true);
    expect(lvl.stagnationEnabled).toBe(true);
    expect(lvl.predictionEnabled).toBe(true);
    expect(lvl.responseProfileEnabled).toBe(true);
  });

  it('has rollingWindowMonths=6', () => {
    expect(CALIBRATION_LEVELS.OPTIMIZED.rollingWindowMonths).toBe(6);
  });

  it('has bannerText=null', () => {
    expect(CALIBRATION_LEVELS.OPTIMIZED.bannerText).toBeNull();
  });
});

// ── shouldRecalibrate ────────────────────────────────────────────────────────

describe('shouldRecalibrate', () => {
  it('returns true if never calibrated', () => {
    expect(shouldRecalibrate(CALIBRATION_LEVELS.INITIAL, null)).toBe(true);
    expect(shouldRecalibrate(CALIBRATION_LEVELS.INITIAL, undefined)).toBe(true);
  });

  it('returns false for daily tier if recalibrated <20h ago', () => {
    const recent = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(); // 10h ago
    expect(shouldRecalibrate(CALIBRATION_LEVELS.INITIAL, recent)).toBe(false);
  });

  it('returns true for daily tier if recalibrated >20h ago', () => {
    const old = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25h ago
    expect(shouldRecalibrate(CALIBRATION_LEVELS.INITIAL, old)).toBe(true);
  });

  it('returns false for weekly tier if recalibrated 3 days ago', () => {
    const recent = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(shouldRecalibrate(CALIBRATION_LEVELS.PERSONALIZING, recent)).toBe(false);
  });

  it('returns true for weekly tier if recalibrated 8 days ago', () => {
    const old = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    expect(shouldRecalibrate(CALIBRATION_LEVELS.PERSONALIZING, old)).toBe(true);
  });

  it('returns false for per_session tier regardless of time', () => {
    const old = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
    expect(shouldRecalibrate(CALIBRATION_LEVELS.COLD_START, old)).toBe(false);
  });
});

// ── _applyInactivityDecay (ADR 012) ─────────────────────────────────────────

describe('_applyInactivityDecay', () => {
  it('0 inactive days → no decay', () => {
    expect(_applyInactivityDecay('OPTIMIZED', 0)).toBe('OPTIMIZED');
  });

  it('59 inactive days → no decay', () => {
    expect(_applyInactivityDecay('OPTIMIZED', 59)).toBe('OPTIMIZED');
  });

  it('60 inactive days → -1 tier (OPTIMIZED → PERSONALIZED)', () => {
    expect(_applyInactivityDecay('OPTIMIZED', 60)).toBe('PERSONALIZED');
  });

  it('119 inactive days → -1 tier (not yet 120)', () => {
    expect(_applyInactivityDecay('OPTIMIZED', 119)).toBe('PERSONALIZED');
  });

  it('120 inactive days → -2 tiers (OPTIMIZED → PERSONALIZING)', () => {
    expect(_applyInactivityDecay('OPTIMIZED', 120)).toBe('PERSONALIZING');
  });

  it('9999 inactive days → floored at INITIAL', () => {
    expect(_applyInactivityDecay('OPTIMIZED', 9999)).toBe('INITIAL');
  });

  it('COLD_START → COLD_START (unaffected by decay)', () => {
    expect(_applyInactivityDecay('COLD_START', 9999)).toBe('COLD_START');
  });

  it('detectCalibrationLevel: OPTIMIZED user inactive 90 days → PERSONALIZED', () => {
    // 200 sessions spanning 400→90 days ago (oldest first, newest = 90 days ago)
    // daysSinceFirst ≈ 400 → OPTIMIZED by count+age
    // but most recent log ts = 90 days ago → floor(90/60)=1 decay → PERSONALIZED
    const logs = [];
    for (let i = 0; i < 200; i++) {
      const daysAgo = 90 + Math.floor(i * (310 / 199)); // i=0 → 90d, i=199 → 400d
      const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      logs.push({
        date: d.toISOString().slice(0, 10),
        ts: d.getTime(),
        ex: 'Lat Pulldown',
        w: 30,
        reps: 8,
        session: `session-${i}`,
      });
    }
    const ctx = { allLogs: logs };
    const result = detectCalibrationLevel(ctx);
    expect(result.name).toBe('personalized');
  });
});

// ── applyRollingWindow ────────────────────────────────────────────────────────

describe('applyRollingWindow', () => {
  it('returns all logs if level has no rollingWindowMonths', () => {
    const logs = [makeLog(10), makeLog(200), makeLog(400)];
    const result = applyRollingWindow(logs, CALIBRATION_LEVELS.PERSONALIZED);
    expect(result.length).toBe(3);
  });

  it('filters logs older than 6 months for OPTIMIZED', () => {
    const recent = makeLog(30);   // 1 month ago — keep
    const old    = makeLog(200);  // ~6.5 months ago — filter
    const logs = [recent, old];
    const result = applyRollingWindow(logs, CALIBRATION_LEVELS.OPTIMIZED);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(recent);
  });

  it('keeps logs well within the 6-month window', () => {
    const withinWindow = makeLog(170); // 170 days < 180-day cutoff
    const result = applyRollingWindow([withinWindow], CALIBRATION_LEVELS.OPTIMIZED);
    expect(result.length).toBe(1);
  });

  it('returns empty array if all logs are outside window', () => {
    const veryOld = makeLog(500);
    const result = applyRollingWindow([veryOld], CALIBRATION_LEVELS.OPTIMIZED);
    expect(result.length).toBe(0);
  });
});

// §07.198-204 — staleness / inactivity-decay / recalibration-due / rolling
// window now accept an injected nowMs (ctx.nowMs for detectCalibrationLevel,
// trailing arg elsewhere) defaulting to the real clock. A FIXED reference
// instant decouples these from the wall clock so the day/hour thresholds are
// deterministic regardless of when CI runs.
describe('calibration injectable clock (§07.198-204)', () => {
  const NOW = Date.parse('2026-03-15T12:00:00Z');
  const DAY = 86400000;

  // Build a log dated `daysAgo` relative to the fixed NOW (not the real clock).
  function logAt(daysAgo, sessionId) {
    const d = new Date(NOW - daysAgo * DAY);
    return {
      date: d.toISOString().slice(0, 10),
      timestamp: d.toISOString(),
      ex: 'Lat Pulldown',
      w: 30,
      reps: 8,
      session: `s-${sessionId}`,
    };
  }

  it('detectCalibrationLevel: COLD_START when first log < 7d ago (pinned nowMs)', () => {
    const ctx = { allLogs: [logAt(3, 0), logAt(2, 1), logAt(1, 2)], nowMs: NOW };
    expect(detectCalibrationLevel(ctx)).toBe(CALIBRATION_LEVELS.COLD_START);
  });

  it('detectCalibrationLevel: stale last log triggers inactivity decay vs fresh (pinned nowMs)', () => {
    // 12 sessions spanning ~189-200d ago: enough age+count for a high base tier,
    // but the newest non-baseline log is 189d stale → ADR 012 decay drops it.
    const stale = [];
    for (let i = 0; i < 12; i++) stale.push(logAt(200 - i, i)); // newest = 189d ago
    // Same history but with one fresh (today) log → no decay applied.
    const fresh = [...stale, logAt(0, 'recent')];
    const decayedLevel = detectCalibrationLevel({ allLogs: stale, nowMs: NOW });
    const freshLevel = detectCalibrationLevel({ allLogs: fresh, nowMs: NOW });
    // Decay never RAISES a tier, and the stale set lands strictly below the
    // fresh set here (different object identity proves the date branch ran).
    expect(decayedLevel).not.toBe(freshLevel);
    expect(decayedLevel).not.toBe(CALIBRATION_LEVELS.OPTIMIZED);
  });

  it('shouldRecalibrate: daily tier due at >=20h since last run (pinned nowMs)', () => {
    const level = { recalibrationFrequency: 'daily' };
    const last21h = new Date(NOW - 21 * 3600 * 1000).toISOString();
    const last10h = new Date(NOW - 10 * 3600 * 1000).toISOString();
    expect(shouldRecalibrate(level, last21h, NOW)).toBe(true);
    expect(shouldRecalibrate(level, last10h, NOW)).toBe(false);
  });

  it('applyRollingWindow: 6-month cutoff pinned via injected nowMs', () => {
    const within = logAt(170, 'w'); // < 180d
    const outside = logAt(200, 'o'); // > 180d
    const result = applyRollingWindow([within, outside], CALIBRATION_LEVELS.OPTIMIZED, NOW);
    expect(result.length).toBe(1);
    expect(result[0].session).toBe('s-w');
  });
});
