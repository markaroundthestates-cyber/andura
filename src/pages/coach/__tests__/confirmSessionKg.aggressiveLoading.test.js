/**
 * confirmSessionKg() + Aggressive Loading Tier-Aware Warning integration
 * Per [[wiki/concepts/aggressive-loading-warning-tier-aware]] LOCK V1 2026-05-14
 *
 * Tests the integration of:
 *   - Tier read (computeEngineTier from session count in logs)
 *   - Threshold evaluation (evaluateAggressiveLoading)
 *   - Modal pre-set + override 1-tap
 *   - CDL log silent (aggressive-loading-log DB key)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../ui/ui.js', () => ({
  toast: vi.fn(),
  speak: vi.fn(),
  beep: vi.fn(),
  beepDone: vi.fn(),
}));
vi.mock('../restTimer.js', () => ({
  getSmartPause: vi.fn(() => 90),
  startPause: vi.fn(),
}));
vi.mock('../session.js', () => ({
  saveDraft: vi.fn(),
  endSession: vi.fn(),
  updateSessionProgress: vi.fn(),
}));
vi.mock('../util.js', () => ({
  getTodayExercises: vi.fn(() => ['Flat Barbell Bench']),
  getExGroup: vi.fn(() => 'piept'),
  resetNotes: vi.fn(),
}));
vi.mock('../../../engine/sys.js', () => ({
  SYS: {
    getTempo: vi.fn(() => ({ tempo: '2-0-2', note: 'std', rir: 2 })),
    getTechniques: vi.fn(() => []),
  },
}));
vi.mock('../../../engine/aa.js', () => ({
  AA: {
    applyTo: vi.fn((rec) => rec),
  },
}));
vi.mock('../../../engine/dp.js', () => ({
  DP: {
    recommend: vi.fn(() => ({ kg: 100, repsTarget: 8, status: 'NORMAL', statusLabel: 'Normal', statusColor: '#888', progressionStage: 0 })),
    getIncrement: vi.fn(() => 2.5),
    roundToStep: vi.fn((kg) => Math.round(kg * 2) / 2),
    getLogs: vi.fn(() => []),
    getIntensityLabel: vi.fn(() => 'RIR 2'),
  },
}));

import { confirmSessionKg, confirmReps } from '../logging.js';
import { state } from '../../../state.js';

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
  state.currentEx = 'Flat Barbell Bench';
  state.currentSet = 1;
  state.sessionKgOverride = null;
  window._kgOvVal = null;
});

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
  state.sessionKgOverride = null;
});

function seedLogs(distinctDates) {
  const logs = [];
  for (let i = 0; i < distinctDates; i++) {
    logs.push({ date: `2026-04-${String(i + 1).padStart(2, '0')}`, ex: 'X', w: 50, set: 1, reps: '8', ts: i });
  }
  localStorage.setItem('logs', JSON.stringify(logs));
}

function readAggressiveLog() {
  return JSON.parse(localStorage.getItem('aggressive-loading-log') || '[]');
}

describe('confirmSessionKg() — non-aggressive path (no modal)', () => {
  it('actualKg within threshold → no modal + override set normally', async () => {
    seedLogs(0);  // T0
    window._kgOvVal = 130;  // +30% under T0 compound threshold 0.50
    await confirmSessionKg();
    expect(document.getElementById('aggressive-loading-modal')).toBeNull();
    expect(state.sessionKgOverride).toBe(130);
    expect(readAggressiveLog().length).toBe(0);
  });

  it('actualKg = recommended → no modal, no log', async () => {
    seedLogs(0);
    window._kgOvVal = 100;
    await confirmSessionKg();
    expect(document.getElementById('aggressive-loading-modal')).toBeNull();
    expect(state.sessionKgOverride).toBe(100);
    expect(readAggressiveLog().length).toBe(0);
  });

  it('actualKg below recommended (de-load) → no modal, no log', async () => {
    seedLogs(30);
    window._kgOvVal = 80;
    await confirmSessionKg();
    expect(document.getElementById('aggressive-loading-modal')).toBeNull();
    expect(state.sessionKgOverride).toBe(80);
    expect(readAggressiveLog().length).toBe(0);
  });

  it('invalid kg (0) → returns early, no modal, override not set', async () => {
    seedLogs(0);
    window._kgOvVal = 0;
    await confirmSessionKg();
    expect(state.sessionKgOverride).toBeNull();
  });
});

describe('confirmSessionKg() — aggressive path (modal + CDL)', () => {
  it('T0 compound +60% → shows modal with T0 calibration wording', async () => {
    seedLogs(0);  // T0
    window._kgOvVal = 160;  // +60% over baseline 100
    const promise = confirmSessionKg();
    const overlay = document.getElementById('aggressive-loading-modal');
    expect(overlay).toBeTruthy();
    expect(overlay.textContent).toContain('calibrare');
    expect(overlay.textContent).toContain('160 kg');

    document.querySelector('.btn-continue').click();
    await promise;
    expect(state.sessionKgOverride).toBe(160);
  });

  it('continue button → override kept + CDL user_override_weight_high logged', async () => {
    seedLogs(30);  // T2 (>= 21)
    window._kgOvVal = 125;  // +25% over baseline 100 — past T2 0.20 threshold
    const promise = confirmSessionKg();
    document.querySelector('.btn-continue').click();
    await promise;

    expect(state.sessionKgOverride).toBe(125);
    const log = readAggressiveLog();
    expect(log.length).toBe(1);
    expect(log[0].type).toBe('user_override_weight_high');
    expect(log[0].exerciseName).toBe('Flat Barbell Bench');
    expect(log[0].recommended).toBe(100);
    expect(log[0].actual).toBe(125);
    expect(log[0].deviation_pct).toBeCloseTo(0.25, 5);
    expect(log[0].tier).toBe('T2');
    expect(log[0].category).toBeDefined();
    expect(log[0].date).toBeDefined();
    expect(log[0].ts).toBeDefined();
  });

  it('revert button → override cleared + CDL user_override_weight_high_reverted logged', async () => {
    seedLogs(30);  // T2
    window._kgOvVal = 130;  // +30% past T2 0.20 threshold
    const promise = confirmSessionKg();
    document.querySelector('.btn-revert').click();
    await promise;

    expect(state.sessionKgOverride).toBeNull();
    const log = readAggressiveLog();
    expect(log.length).toBe(1);
    expect(log[0].type).toBe('user_override_weight_high_reverted');
    expect(log[0].actual).toBe(130);
    expect(log[0].recommended).toBe(100);
  });

  it('tier T1 reachable with 10 distinct session dates (5-20 range)', async () => {
    seedLogs(10);  // T1
    window._kgOvVal = 140;  // +40% past T1 compound 0.30 threshold
    const promise = confirmSessionKg();
    document.querySelector('.btn-continue').click();
    await promise;
    expect(readAggressiveLog()[0].tier).toBe('T1');
  });

  it('tier T0 modal does NOT trigger at +40% compound (under 0.50 threshold)', async () => {
    seedLogs(0);  // T0
    window._kgOvVal = 140;  // +40% under T0 compound 0.50 threshold
    await confirmSessionKg();
    expect(document.getElementById('aggressive-loading-modal')).toBeNull();
    expect(readAggressiveLog().length).toBe(0);
  });

  it('CDL log entries accumulate across multiple aggressive sessions', async () => {
    seedLogs(30);  // T2
    window._kgOvVal = 125;
    let p = confirmSessionKg();
    document.querySelector('.btn-continue').click();
    await p;

    window._kgOvVal = 130;
    p = confirmSessionKg();
    document.querySelector('.btn-revert').click();
    await p;

    const log = readAggressiveLog();
    expect(log.length).toBe(2);
    // unshift order — newest first
    expect(log[0].type).toBe('user_override_weight_high_reverted');
    expect(log[1].type).toBe('user_override_weight_high');
  });

  it('modal contains exercise name in DOM', async () => {
    seedLogs(30);
    state.currentEx = 'Flat Barbell Bench';
    window._kgOvVal = 130;
    const promise = confirmSessionKg();
    expect(document.getElementById('aggressive-loading-modal').textContent).toContain('Flat Barbell Bench');
    document.querySelector('.btn-revert').click();
    await promise;
  });
});

describe('confirmReps() — CDL enrichment with repsAchieved + RPE', () => {
  it('after continue → confirmReps enriches CDL entry with reps + RPE', async () => {
    seedLogs(30);  // T2
    state.sessActive = true;
    state.sessStart = Date.now();
    state.sessLog = [];
    state.activeNotes = [];
    state.sessRepsInput = 8;
    state.lastSetRPE = 7;
    state.completedExercises = new Set();
    state.sessionTotalExercises = 1;

    window._kgOvVal = 125;  // +25% past T2 0.20 threshold
    const p = confirmSessionKg();
    document.querySelector('.btn-continue').click();
    await p;

    expect(readAggressiveLog()[0].repsAchieved).toBeUndefined();

    confirmReps();

    const log = readAggressiveLog();
    expect(log[0].repsAchieved).toBe(8);
    expect(log[0].targetReps).toBe(8);
    expect(log[0].RPE).toBe(7);
  });

  it('revert path → no enrichment occurs (override was cleared)', async () => {
    seedLogs(30);
    state.sessActive = true;
    state.sessStart = Date.now();
    state.sessLog = [];
    state.activeNotes = [];
    state.sessRepsInput = 8;
    state.lastSetRPE = 6.5;
    state.completedExercises = new Set();
    state.sessionTotalExercises = 1;

    window._kgOvVal = 130;
    const p = confirmSessionKg();
    document.querySelector('.btn-revert').click();
    await p;

    confirmReps();

    const log = readAggressiveLog();
    expect(log[0].type).toBe('user_override_weight_high_reverted');
    expect(log[0].repsAchieved).toBeUndefined();
  });
});
