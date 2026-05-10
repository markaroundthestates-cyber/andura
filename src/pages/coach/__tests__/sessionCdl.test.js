/**
 * TASK #30.5 — CDL outcome population in endSession + cancelWorkout
 * Tests run coachDecisionLog.js + db.js for real (jsdom localStorage).
 * All DOM/UI layers mocked.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock all DOM-heavy and UI layers ─────────────────────────────────────────
vi.mock('../rating.js', () => ({ showSessionRating: vi.fn() }));
vi.mock('../renderIdle.js', () => ({ renderCoachIdle: vi.fn() }));
vi.mock('../../../ui/ui.js', () => ({
  toast: vi.fn(),
  speak: vi.fn(),
  hidePauseScreen: vi.fn(),
}));
vi.mock('../../../engine/sys.js', () => ({
  SYS: { getCurrentKg: vi.fn(() => 75) },
}));
vi.mock('../restTimer.js', () => ({
  stopPause: vi.fn(),
  setupInactivity: vi.fn(),
  teardownInactivity: vi.fn(),
}));
vi.mock('../logging.js', () => ({
  updateExCard: vi.fn(),
  renderSessLog: vi.fn(),
}));
vi.mock('../util.js', () => ({
  getTodayExercises: vi.fn(() => []),
  beepStart: vi.fn(),
}));

// Mock coach state — provide getCachedDirector that returns configurable cdlEntryId
let _mockCdlEntryId = 'cdl_test_id_default';
vi.mock('../state.js', () => ({
  wakeLockRef: { current: null },
  getCachedDirector: vi.fn(() => ({ cdlEntryId: _mockCdlEntryId })),
  uiToggleFlags: { exListExpanded: {}, prWallExpanded: false },
  sessionCache: { exercises: [] },
}));

// Mock constants to avoid complex PROG/EX_SETS dependency
vi.mock('../../../constants.js', () => ({
  PROG: [
    { t: 'PUSH', day: 'push' },
    { t: 'PULL', day: 'pull' },
    { t: 'LEGS', day: 'legs' },
    { t: 'PUSH', day: 'push' },
    { t: 'PULL', day: 'pull' },
    { t: 'LEGS', day: 'legs' },
    { t: 'REST', day: 'rest' },
  ],
  EX_SETS: {},
}));

// Real CDL + db (jsdom localStorage)
import { writeProposed, readActiveForDate, STORAGE_KEYS } from '../../../util/coachDecisionLog.js';
import { state } from '../../../state.js';
import { endSession, cancelWorkout } from '../session.js';
import { tod } from '../../../db.js';

const TODAY = tod();

function makeProposed(overrides = {}) {
  return {
    date: TODAY,
    context: {
      calibrationLevel: 'PERSONALIZING',
      readinessScore: 75,
      fatigueIndex: 0.3,
      daysSinceLastSession: 1,
      lastSessionType: 'PULL',
      isInCut: false,
      weakGroups: [],
      stagnationWeeks: 0,
      predictionToday: { isHighRisk: false, probability: 0.1 },
      partial: false,
    },
    proposed: {
      sessionType: 'PUSH',
      rationale: { winnerId: 'STANDARD', winnerPriority: 50, overridden: [] },
      exercises: ['Bench Press', 'Incline DB Press', 'Pec Deck', 'Tricep Pushdown'],
      proposedSets: 12,
      volumeMultiplier: 1.0,
      notes: '',
      ...overrides.proposed,
    },
    ...overrides,
  };
}

function resetState() {
  state.sessActive = false;
  state.sessStart = null;
  state.sessLog = [];
  state.sessTimer = null;
  state.earlyStopReason = null;
  state.cdlEntryId = null;
  state.sessType = null;
  state.lastPauseEndedAt = null;
  state.dropSetUsedThisSession = false;
  state.completedExercises = new Set();
  state.sessionKgOverride = null;
  state.activeNotes = new Set();
}

beforeEach(() => {
  localStorage.clear();
  resetState();
  vi.clearAllMocks();
  // Suppress console noise from degraded-mode catches
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  // Suppress speechSynthesis
  Object.defineProperty(window, 'speechSynthesis', {
    value: { cancel: vi.fn() },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Test 1 ────────────────────────────────────────────────────────────────────
describe('endSession — CDL outcome (ADR 011)', () => {
  it('populates outcome on today\'s CDL entry (happy path)', () => {
    const written = writeProposed(makeProposed());
    state.cdlEntryId = written.id;
    state.sessType = 'PUSH';
    state.sessActive = true;
    state.sessStart = Date.now() - 30 * 60 * 1000;
    state.sessLog = [
      { ex: 'Bench Press', w: 80, reps: '8', set: 1 },
      { ex: 'Bench Press', w: 80, reps: '8', set: 2 },
      { ex: 'Bench Press', w: 80, reps: '8', set: 3 },
    ];

    endSession();

    const entry = readActiveForDate(TODAY);
    expect(entry).not.toBeNull();
    expect(entry.outcome).not.toBeNull();
    expect(entry.outcome.executed).toBe(true);
    expect(entry.outcome.earlyStop).toBe(false);
    expect(entry.outcome.rating).toBeNull();
  });

  // ── Test 2 ────────────────────────────────────────────────────────────────
  it('skips populate and warns when cdlEntryId is null', () => {
    state.cdlEntryId = null;
    state.sessActive = true;
    state.sessStart = Date.now() - 10 * 60 * 1000;
    state.sessLog = [];

    endSession();

    expect(console.warn).toHaveBeenCalledWith(
      '[session] CDL outcome skipped — cdlEntryId not set'
    );
    // No CDL entry written (nothing in storage)
    const entry = readActiveForDate(TODAY);
    expect(entry).toBeNull();
  });

  // ── Test 5 ────────────────────────────────────────────────────────────────
  it('sets executed=partial + earlyStop=true when earlyStopReason is set', () => {
    const written = writeProposed(makeProposed());
    state.cdlEntryId = written.id;
    state.sessType = 'PUSH';
    state.sessActive = true;
    state.sessStart = Date.now() - 20 * 60 * 1000;
    state.earlyStopReason = 'Oboseala extrema';
    state.sessLog = [
      { ex: 'Bench Press', w: 80, reps: '8', set: 1 },
    ];

    endSession();

    const entry = readActiveForDate(TODAY);
    expect(entry.outcome.executed).toBe('partial');
    expect(entry.outcome.earlyStop).toBe(true);
    expect(entry.outcome.earlyStopReason).toBe('Oboseala extrema');
  });

  // ── Test 6 ────────────────────────────────────────────────────────────────
  it('sets matchScore=null + deviation=true when sessType differs from proposed', () => {
    const written = writeProposed(makeProposed()); // proposed sessionType = 'PUSH'
    state.cdlEntryId = written.id;
    state.sessType = 'PULL'; // deviation!
    state.sessActive = true;
    state.sessStart = Date.now() - 25 * 60 * 1000;
    state.sessLog = [
      { ex: 'Pull Up', w: 0, reps: '8', set: 1 },
    ];

    endSession();

    const entry = readActiveForDate(TODAY);
    expect(entry.outcome.matchScore).toBeNull();
    expect(entry.outcome.deviation).toBe(true);
  });

  // ── Test 7 ────────────────────────────────────────────────────────────────
  it('computes matchScore when sessionType matches', () => {
    // proposed: 4 exercises, 12 sets; actual: 3 of 4 exercises, 9 sets
    // volumeRatio = 9/12 = 0.75; jaccard = 3/4 = 0.75 (3 intersect / 4 union)
    // score = 0.6 * 0.75 + 0.4 * 0.75 = 0.75
    const written = writeProposed(makeProposed());
    state.cdlEntryId = written.id;
    state.sessType = 'PUSH';
    state.sessActive = true;
    state.sessStart = Date.now() - 45 * 60 * 1000;
    state.sessLog = [
      { ex: 'Bench Press', w: 80, reps: '8', set: 1 },
      { ex: 'Bench Press', w: 80, reps: '8', set: 2 },
      { ex: 'Bench Press', w: 80, reps: '8', set: 3 },
      { ex: 'Incline DB Press', w: 40, reps: '10', set: 1 },
      { ex: 'Incline DB Press', w: 40, reps: '10', set: 2 },
      { ex: 'Incline DB Press', w: 40, reps: '10', set: 3 },
      { ex: 'Pec Deck', w: 50, reps: '12', set: 1 },
      { ex: 'Pec Deck', w: 50, reps: '12', set: 2 },
      { ex: 'Pec Deck', w: 50, reps: '12', set: 3 },
      // Tricep Pushdown skipped → actual exercises = 3 of 4
    ];

    endSession();

    const entry = readActiveForDate(TODAY);
    expect(entry.outcome.deviation).toBe(false);
    expect(typeof entry.outcome.matchScore).toBe('number');
    expect(entry.outcome.matchScore).toBeCloseTo(0.75, 5);
  });

  // ── Test 8 ────────────────────────────────────────────────────────────────
  it('catches immutability error if outcome already set, session still completes', () => {
    const written = writeProposed(makeProposed());
    state.cdlEntryId = written.id;
    state.sessType = 'PUSH';

    // First endSession — populates outcome
    state.sessActive = true;
    state.sessStart = Date.now() - 15 * 60 * 1000;
    state.sessLog = [{ ex: 'Bench Press', w: 80, reps: '8', set: 1 }];
    endSession();

    const firstOutcome = readActiveForDate(TODAY)?.outcome;
    expect(firstOutcome).not.toBeNull();

    // Second endSession — outcome already set → populateOutcome throws
    // Reset state to allow second call through
    state.sessActive = true;
    state.sessStart = Date.now() - 5 * 60 * 1000;
    state.sessLog = [{ ex: 'Bench Press', w: 80, reps: '8', set: 1 }];
    state.cdlEntryId = written.id;

    endSession(); // must not throw, degrades gracefully

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[session] CDL populateOutcome failed (degraded mode):'),
      expect.anything()
    );
    // outcome still holds the original values from first call
    expect(readActiveForDate(TODAY)?.outcome?.executed).toBe(firstOutcome.executed);
  });
});

// ── cancelWorkout tests ───────────────────────────────────────────────────────
describe('cancelWorkout — CDL outcome (ADR 011)', () => {
  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    // Stub DOM elements used in cancelWorkout
    document.getElementById = vi.fn(() => null);
    document.querySelector = vi.fn(() => null);
  });

  // ── Test 3 ────────────────────────────────────────────────────────────────
  it('populates outcome.executed=false on cancel', () => {
    const written = writeProposed(makeProposed());
    state.cdlEntryId = written.id;
    state.sessActive = true;
    state.sessStart = Date.now() - 10 * 60 * 1000;

    cancelWorkout();

    const entry = readActiveForDate(TODAY);
    expect(entry.outcome).not.toBeNull();
    expect(entry.outcome.executed).toBe(false);
    expect(entry.outcome.earlyStop).toBe(false);
    expect(entry.outcome.actualExercises).toEqual([]);
    expect(entry.outcome.actualSets).toBe(0);
  });

  // ── Test 4 ────────────────────────────────────────────────────────────────
  it('skips populate and warns when cdlEntryId is null on cancel', () => {
    state.cdlEntryId = null;
    state.sessActive = true;
    state.sessStart = Date.now() - 5 * 60 * 1000;

    cancelWorkout();

    expect(console.warn).toHaveBeenCalledWith(
      '[session] CDL cancel outcome skipped — cdlEntryId not set'
    );
    const entry = readActiveForDate(TODAY);
    expect(entry).toBeNull();
  });
});
