// Bundle 4 — Tests for workoutPreview.js workout-preview screen + cascade flow.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  showWorkoutPreview,
  closeWorkoutPreview,
  resolveMissingEquipmentTarget,
  pickNextAlternative,
  getWorkoutPreviewMountState,
} from '../workoutPreview.js';
import { state } from '../../../state.js';
import {
  getMissingEquipment,
  getSkippedExercises,
  getRefusalCounter,
  REFUSAL_COUNTER_THRESHOLD,
} from '../../../engine/schedule/scheduleAdapter.js';

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
  state.currentScreen = 'antrenor';
  state.previewRefusalsByExercise = {};
});

afterEach(() => {
  closeWorkoutPreview();
  document.querySelectorAll('.andura-modal-overlay, #refusal-counter-modal').forEach(el => el.remove());
});

describe('workoutPreview — resolveMissingEquipmentTarget', () => {
  it('dumbbell exercise → equipment "gantere"', () => {
    const result = resolveMissingEquipmentTarget('Incline DB Press');
    expect(result).toEqual({ type: 'equipment', value: 'gantere' });
  });

  it('cable exercise → equipment "aparat-cablu"', () => {
    const result = resolveMissingEquipmentTarget('Cable Curl');
    expect(result).toEqual({ type: 'equipment', value: 'aparat-cablu' });
  });

  it('machine exercise → exercise fallback (ambiguous)', () => {
    const result = resolveMissingEquipmentTarget('Leg Press');
    expect(result).toEqual({ type: 'exercise', value: 'Leg Press' });
  });

  it('barbell exercise → exercise fallback (ambiguous)', () => {
    const result = resolveMissingEquipmentTarget('Flat Barbell Bench');
    expect(result).toEqual({ type: 'exercise', value: 'Flat Barbell Bench' });
  });

  it('empty / non-string input → exercise fallback empty value', () => {
    expect(resolveMissingEquipmentTarget('')).toEqual({ type: 'exercise', value: '' });
    expect(resolveMissingEquipmentTarget(null)).toEqual({ type: 'exercise', value: '' });
  });

  it('unknown exercise → fallback metadata.equipment_type=machine → exercise fallback', () => {
    const result = resolveMissingEquipmentTarget('NonExistentExercise');
    expect(result).toEqual({ type: 'exercise', value: 'NonExistentExercise' });
  });
});

describe('workoutPreview — pickNextAlternative', () => {
  it('returns first ranked alternative when none excluded', () => {
    const result = pickNextAlternative('Incline DB Press', []);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns null when all alternatives excluded', () => {
    // Incline DB Press has alternatives ['Flat DB Press', 'Pec Deck / Cable Fly'].
    const result = pickNextAlternative('Incline DB Press', ['Flat DB Press', 'Pec Deck / Cable Fly']);
    expect(result).toBeNull();
  });

  it('returns null for unknown exercise (no metadata)', () => {
    const result = pickNextAlternative('NonExistent', []);
    expect(result).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(pickNextAlternative('', [])).toBeNull();
    expect(pickNextAlternative(null, [])).toBeNull();
  });

  it('skips already-excluded alternatives and picks next valid', () => {
    // Use Cable Curl (tier 2) — has 2 valid alternatives (Bayesian Curl + Preacher Curl).
    // Tier 1 exercises like 'Incline DB Press' have only 1 high-force valid alt → no chain to test.
    const first = pickNextAlternative('Cable Curl', []);
    const second = pickNextAlternative('Cable Curl', [first]);
    expect(second).not.toBe(first);
    expect(second).not.toBeNull();
  });
});

describe('workoutPreview — showWorkoutPreview mount', () => {
  it('mounts overlay with id="workout-preview-screen"', () => {
    showWorkoutPreview();
    expect(document.getElementById('workout-preview-screen')).not.toBeNull();
  });

  it('state.currentScreen set to "workout-preview"', () => {
    showWorkoutPreview();
    expect(state.currentScreen).toBe('workout-preview');
  });

  it('resets state.previewRefusalsByExercise on mount', () => {
    state.previewRefusalsByExercise = { 'OldData': ['stale'] };
    showWorkoutPreview();
    expect(state.previewRefusalsByExercise).toEqual({});
  });

  it('renders default 5 exercises when no opts.exercises provided', () => {
    showWorkoutPreview();
    const rows = document.querySelectorAll('.preview-ex-row');
    expect(rows.length).toBe(5);
  });

  it('uses opts.exercises when provided', () => {
    showWorkoutPreview({ exercises: ['Cable Curl', 'Lateral Raises'] });
    const rows = document.querySelectorAll('.preview-ex-row');
    expect(rows.length).toBe(2);
    expect(rows[0].dataset.exercise).toBe('Cable Curl');
    expect(rows[1].dataset.exercise).toBe('Lateral Raises');
  });

  it('idempotent — second call does NOT duplicate', () => {
    showWorkoutPreview();
    showWorkoutPreview();
    expect(document.querySelectorAll('#workout-preview-screen').length).toBe(1);
  });

  it('intensity banner reflects opts.energyMod=plus', () => {
    showWorkoutPreview({ energyMod: 'plus' });
    const msg = document.getElementById('preview-intensity-msg');
    expect(msg.textContent).toContain('+15%');
  });

  it('intensity banner reflects opts.energyMod=minus', () => {
    showWorkoutPreview({ energyMod: 'minus' });
    const msg = document.getElementById('preview-intensity-msg');
    expect(msg.textContent).toContain('reduce');
  });

  it('intensity banner default normal when no opt', () => {
    showWorkoutPreview();
    const msg = document.getElementById('preview-intensity-msg');
    expect(msg.textContent).toContain('Sesiune normala');
  });

  it('each row has 2 inline buttons (missing + dontwant)', () => {
    showWorkoutPreview({ exercises: ['Cable Curl'] });
    const row = document.querySelector('.preview-ex-row');
    expect(row.querySelector('.preview-ex-missing')).not.toBeNull();
    expect(row.querySelector('.preview-ex-dontwant')).not.toBeNull();
  });
});

describe('workoutPreview — "Nu am" (missing equipment) handler', () => {
  it('dumbbell exercise click → toggleMissingEquipment("gantere") global state', () => {
    showWorkoutPreview({ exercises: ['Incline DB Press'] });
    const row = document.querySelector('.preview-ex-row');
    const btn = row.querySelector('.preview-ex-missing');
    btn.click();
    expect(getMissingEquipment()).toContain('gantere');
  });

  it('barbell exercise click → toggleSkippedExercise (ambiguous fallback)', () => {
    showWorkoutPreview({ exercises: ['Flat Barbell Bench'] });
    const row = document.querySelector('.preview-ex-row');
    row.querySelector('.preview-ex-missing').click();
    expect(getSkippedExercises()).toContain('Flat Barbell Bench');
  });

  it('cascade replaces row name in-place', () => {
    showWorkoutPreview({ exercises: ['Incline DB Press'] });
    const row = document.querySelector('.preview-ex-row');
    const originalName = row.dataset.exercise;
    row.querySelector('.preview-ex-missing').click();
    expect(row.dataset.exercise).not.toBe(originalName);
    expect(row.dataset.exercise.length).toBeGreaterThan(0);
  });

  it('cascade tracks refusal in state.previewRefusalsByExercise', () => {
    showWorkoutPreview({ exercises: ['Incline DB Press'] });
    const row = document.querySelector('.preview-ex-row');
    row.querySelector('.preview-ex-missing').click();
    expect(state.previewRefusalsByExercise['Incline DB Press']).toBeDefined();
    expect(state.previewRefusalsByExercise['Incline DB Press'].length).toBeGreaterThan(0);
  });

  it('exhausted alternatives → row marked exhausted', () => {
    showWorkoutPreview({ exercises: ['Incline DB Press'] });
    const row = document.querySelector('.preview-ex-row');
    // Click missing repeatedly to exhaust alternatives.
    for (let i = 0; i < 6; i++) {
      const btn = row.querySelector('.preview-ex-missing');
      if (btn && !btn.disabled) btn.click();
    }
    // After exhaustion, row should be marked.
    expect(row.dataset.exhausted).toBe('true');
  });
});

describe('workoutPreview — "Nu vreau" handler', () => {
  it('first click → incrementRefusal called', () => {
    showWorkoutPreview({ exercises: ['Cable Curl'] });
    const row = document.querySelector('.preview-ex-row');
    row.querySelector('.preview-ex-dontwant').click();
    expect(getRefusalCounter()['Cable Curl']).toBe(1);
  });

  it('cascade replaces row name', () => {
    showWorkoutPreview({ exercises: ['Cable Curl'] });
    const row = document.querySelector('.preview-ex-row');
    const originalName = row.dataset.exercise;
    row.querySelector('.preview-ex-dontwant').click();
    expect(row.dataset.exercise).not.toBe(originalName);
  });

  it('refusal counter reaching threshold triggers refusal-counter-modal', () => {
    // Pre-seed counter at threshold-1.
    for (let i = 0; i < REFUSAL_COUNTER_THRESHOLD - 1; i++) {
      // Use scheduleAdapter incrementRefusal directly to bypass UI.
      const adapter = require ? null : null;
    }
    // Instead, simulate via direct localStorage seed.
    localStorage.setItem('wv2-refusal-counter', JSON.stringify({ 'Cable Curl': REFUSAL_COUNTER_THRESHOLD - 1 }));

    showWorkoutPreview({ exercises: ['Cable Curl'] });
    const row = document.querySelector('.preview-ex-row');
    row.querySelector('.preview-ex-dontwant').click();
    expect(document.getElementById('refusal-counter-modal')).not.toBeNull();
  });

  it('refusal counter below threshold does NOT trigger modal', () => {
    showWorkoutPreview({ exercises: ['Cable Curl'] });
    const row = document.querySelector('.preview-ex-row');
    row.querySelector('.preview-ex-dontwant').click();
    expect(document.getElementById('refusal-counter-modal')).toBeNull();
  });
});

describe('workoutPreview — confirm button', () => {
  it('clicking Confirma incep closes preview', () => {
    showWorkoutPreview({ exercises: ['Cable Curl'] });
    const confirmBtn = document.querySelector('.preview-confirm');
    confirmBtn.click();
    expect(document.getElementById('workout-preview-screen')).toBeNull();
  });

  it('invokes opts.onConfirm callback', () => {
    let confirmed = null;
    showWorkoutPreview({ exercises: ['Cable Curl'], onConfirm: ctx => { confirmed = ctx; } });
    document.querySelector('.preview-confirm').click();
    expect(confirmed).not.toBeNull();
    expect(Array.isArray(confirmed.exercises)).toBe(true);
  });
});

describe('workoutPreview — debug export', () => {
  it('getWorkoutPreviewMountState reflects mounted=true after show', () => {
    showWorkoutPreview();
    const debug = getWorkoutPreviewMountState();
    expect(debug.mounted).toBe(true);
    expect(debug.currentScreen).toBe('workout-preview');
  });

  it('getWorkoutPreviewMountState reflects mounted=false after close', () => {
    showWorkoutPreview();
    closeWorkoutPreview();
    const debug = getWorkoutPreviewMountState();
    expect(debug.mounted).toBe(false);
  });
});
