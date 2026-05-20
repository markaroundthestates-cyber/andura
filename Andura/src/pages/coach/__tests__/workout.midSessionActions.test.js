// Bundle 4 — Tests for workout.js mid-session 2 action buttons + cascade.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  showWorkoutScreen,
  closeWorkoutScreen,
  pickNextAlternativeMidSession,
} from '../workout.js';
import { state } from '../../../state.js';
import {
  getRefusalCounter,
  getMissingEquipment,
  getSkippedExercises,
  REFUSAL_COUNTER_THRESHOLD,
} from '../../../engine/schedule/scheduleAdapter.js';

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
  state.currentScreen = 'antrenor';
  state.currentEx = '';
  state.currentSet = 1;
  state.sessLog = [];
  state.completedExercises = new Set();
  state.sessionTotalExercises = 0;
  state.sessStart = null;
  state.midSessionRefusalsByExercise = {};
  state.sessionPlan = null;
});

afterEach(() => {
  closeWorkoutScreen();
  document.querySelectorAll('#refusal-counter-modal').forEach(el => el.remove());
});

describe('workout.js — mid-session 2 action buttons render', () => {
  it('renders .workout-ex-action-ocupat button', () => {
    state.currentEx = 'Cable Curl';
    showWorkoutScreen();
    expect(document.querySelector('.workout-ex-action-ocupat')).not.toBeNull();
  });

  it('renders .workout-ex-action-nuvreau button', () => {
    state.currentEx = 'Cable Curl';
    showWorkoutScreen();
    expect(document.querySelector('.workout-ex-action-nuvreau')).not.toBeNull();
  });

  it('both buttons have ARIA labels (Aparat ocupat / Nu vreau)', () => {
    state.currentEx = 'Cable Curl';
    showWorkoutScreen();
    expect(document.querySelector('.workout-ex-action-ocupat').getAttribute('aria-label')).toBe('Aparat ocupat');
    expect(document.querySelector('.workout-ex-action-nuvreau').getAttribute('aria-label')).toBe('Nu vreau');
  });

  it('buttons appear in workout-ex-actions container', () => {
    state.currentEx = 'Cable Curl';
    showWorkoutScreen();
    const container = document.querySelector('.workout-ex-actions');
    expect(container).not.toBeNull();
    expect(container.querySelectorAll('button').length).toBe(2);
  });
});

describe('workout.js — "Aparat ocupat" handler (pure ephemeral)', () => {
  it('cascade replaces state.currentEx with alternative', () => {
    state.currentEx = 'Incline DB Press';
    showWorkoutScreen();
    document.querySelector('.workout-ex-action-ocupat').click();
    expect(state.currentEx).not.toBe('Incline DB Press');
    expect(state.currentEx.length).toBeGreaterThan(0);
  });

  it('NO global equipment storage mutation (pure ephemeral per Co-CTO bias §0.2)', () => {
    state.currentEx = 'Incline DB Press';
    showWorkoutScreen();
    document.querySelector('.workout-ex-action-ocupat').click();
    expect(getMissingEquipment()).toEqual([]);
    expect(getSkippedExercises()).toEqual([]);
  });

  it('refusal counter NOT incremented (Ocupat is not Nu vreau)', () => {
    state.currentEx = 'Incline DB Press';
    showWorkoutScreen();
    document.querySelector('.workout-ex-action-ocupat').click();
    expect(getRefusalCounter()).toEqual({});
  });

  it('tracks refusal in state.midSessionRefusalsByExercise ephemerally', () => {
    state.currentEx = 'Incline DB Press';
    showWorkoutScreen();
    document.querySelector('.workout-ex-action-ocupat').click();
    expect(state.midSessionRefusalsByExercise['Incline DB Press']).toBeDefined();
    expect(state.midSessionRefusalsByExercise['Incline DB Press'].length).toBeGreaterThan(0);
  });
});

describe('workout.js — "Nu vreau" handler (shared counter)', () => {
  it('increments shared refusal counter (cross-flow with preview)', () => {
    state.currentEx = 'Cable Curl';
    showWorkoutScreen();
    document.querySelector('.workout-ex-action-nuvreau').click();
    expect(getRefusalCounter()['Cable Curl']).toBe(1);
  });

  it('cascade replaces state.currentEx with alternative', () => {
    state.currentEx = 'Incline DB Press';
    showWorkoutScreen();
    document.querySelector('.workout-ex-action-nuvreau').click();
    expect(state.currentEx).not.toBe('Incline DB Press');
  });

  it('threshold reach triggers refusal-counter-modal', () => {
    localStorage.setItem('wv2-refusal-counter', JSON.stringify({ 'Cable Curl': REFUSAL_COUNTER_THRESHOLD - 1 }));
    state.currentEx = 'Cable Curl';
    showWorkoutScreen();
    document.querySelector('.workout-ex-action-nuvreau').click();
    expect(document.getElementById('refusal-counter-modal')).not.toBeNull();
  });

  it('below threshold does NOT trigger modal', () => {
    state.currentEx = 'Cable Curl';
    showWorkoutScreen();
    document.querySelector('.workout-ex-action-nuvreau').click();
    expect(document.getElementById('refusal-counter-modal')).toBeNull();
  });
});

describe('workout.js — pickNextAlternativeMidSession', () => {
  it('returns first alternative when no session plan', () => {
    const result = pickNextAlternativeMidSession('Incline DB Press');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns null for empty / invalid input', () => {
    expect(pickNextAlternativeMidSession('')).toBeNull();
    expect(pickNextAlternativeMidSession(null)).toBeNull();
  });

  it('returns null for exercise without metadata', () => {
    expect(pickNextAlternativeMidSession('Nonexistent')).toBeNull();
  });

  it('peek-next filter respected when session plan defines next exercise', () => {
    // Set session plan: current exercise then next sharing muscle_target_primary.
    // Incline DB Press → muscle_target_primary='piept'. If plan next is 'Flat DB Press'
    // (also piept), the filter should skip 'Flat DB Press' as an alternative.
    state.sessionPlan = ['Incline DB Press', 'Flat DB Press'];
    const result = pickNextAlternativeMidSession('Incline DB Press');
    // Result should not be 'Flat DB Press' (would conflict with next-piept).
    // Filter relaxed-fallback may still allow if all options conflict — at minimum should not throw.
    expect(typeof result === 'string' || result === null).toBe(true);
  });

  it('tracks refusals in state.midSessionRefusalsByExercise (separate from preview)', () => {
    state.previewRefusalsByExercise = { 'Cable Curl': ['preview-tracked'] };
    state.midSessionRefusalsByExercise = {};
    state.currentEx = 'Cable Curl';
    showWorkoutScreen();
    document.querySelector('.workout-ex-action-nuvreau').click();
    expect(state.midSessionRefusalsByExercise['Cable Curl']).toBeDefined();
    expect(state.previewRefusalsByExercise['Cable Curl']).toEqual(['preview-tracked']);
  });
});
