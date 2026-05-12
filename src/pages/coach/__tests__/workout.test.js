// Workout — main session execution screen (V2 mockup port) tests.
// Per mockup `04-architecture/mockups/andura-clasic.html:§workout` line 887-1006.
// Engine integration preserved orthogonal: DP/AA/SYS mocked; setDone + finishEarly
// wired but tolerated when DOM scaffolding absent (V1 prod parallel rendering).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../db.js', () => {
  const store = new Map();
  return {
    DB: {
      get: (k) => (store.has(k) ? store.get(k) : null),
      set: (k, v) => store.set(k, v),
      _store: store,
    },
    $: (id) => document.getElementById(id),
    tod: () => '2026-05-12',
    cleanEx: (s) => s,
  };
});

vi.mock('../../../engine/dp.js', () => ({
  DP: {
    recommend: vi.fn(() => ({ kg: 22.5, repsTarget: '8-10', rir: 2, status: 'STABLE', statusLabel: '', statusColor: '#888' })),
    getLogs: vi.fn(() => []),
    getIntensityLabel: vi.fn(() => 'medie'),
    getIncrement: vi.fn(() => 2.5),
  },
}));

vi.mock('../../../engine/aa.js', () => ({
  AA: { applyTo: vi.fn((rec) => rec) },
}));

vi.mock('../../../engine/sys.js', () => ({
  SYS: {
    getTempo: vi.fn(() => ({ tempo: '3-1-1-0', rir: 2, note: 'Controlat' })),
    getTechniques: vi.fn(() => []),
  },
}));

vi.mock('../logging.js', () => ({
  setDone: vi.fn(),
  updateExCard: vi.fn(),
  renderSessLog: vi.fn(),
}));

vi.mock('../session.js', () => ({
  finishEarly: vi.fn(),
}));

vi.mock('../restTimer.js', () => ({
  getSmartPause: vi.fn(() => 90),
  startPause: vi.fn(),
  skipPause: vi.fn(),
}));

import {
  showWorkoutScreen,
  renderWorkoutScreen,
  closeWorkoutScreen,
  getWorkoutMountState,
} from '../workout.js';
import { state } from '../../../state.js';
import { setDone } from '../logging.js';
import { finishEarly } from '../session.js';

beforeEach(() => {
  document.body.innerHTML = '';
  state.currentScreen = 'antrenor';
  state.currentEx = 'Incline DB Press';
  state.currentSet = 2;
  state.sessActive = true;
  state.sessStart = Date.now() - 14 * 60 * 1000; // 14 min ago
  state.sessLog = [
    { ex: 'Incline DB Press', w: 22.5, set: 1, reps: '10' },
  ];
  state.sessType = 'A';
  state.completedExercises = new Set();
  state.sessionTotalExercises = 5;
  state.pauseTimer = null;
  state.pauseLeft = 0;
  state.pauseTotal = 0;
  vi.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('showWorkoutScreen — mount overlay', () => {
  it('mounts overlay with top bar + progress + exercise card + 2 action buttons', () => {
    showWorkoutScreen();
    expect(document.getElementById('workout-screen')).not.toBeNull();
    expect(document.querySelector('.workout-top-bar')).not.toBeNull();
    expect(document.querySelector('.workout-progress')).not.toBeNull();
    expect(document.querySelector('.workout-ex-card')).not.toBeNull();
    expect(document.querySelector('.workout-log-set')).not.toBeNull();
    expect(document.querySelector('.workout-finish')).not.toBeNull();
  });

  it('renders mockup header bits — Sesiune label + session type + elapsed timer', () => {
    showWorkoutScreen();
    const top = document.querySelector('.workout-top-bar').textContent;
    expect(top).toContain('Sesiune A');
    expect(document.querySelector('.workout-timer').textContent).toMatch(/^\d+:\d{2}$/);
  });

  it('sets state.currentScreen = "workout" on mount (router enum line 29)', () => {
    showWorkoutScreen();
    expect(state.currentScreen).toBe('workout');
  });

  it('idempotent — second showWorkoutScreen call does NOT duplicate', () => {
    showWorkoutScreen();
    showWorkoutScreen();
    expect(document.querySelectorAll('#workout-screen').length).toBe(1);
  });

  it('renders current exercise name in card h2', () => {
    showWorkoutScreen();
    expect(document.querySelector('.workout-ex-name').textContent).toBe('Incline DB Press');
  });

  it('renders exercise group from util.getExGroup', () => {
    showWorkoutScreen();
    expect(document.querySelector('.workout-ex-group').textContent).toBe('PIEPT');
  });

  it('escapes HTML in exercise name (XSS guard)', () => {
    state.currentEx = '<script>alert(1)</script>';
    showWorkoutScreen();
    const html = document.getElementById('workout-screen').innerHTML;
    expect(html).not.toContain('<script>alert(1)');
    expect(html).toContain('&lt;script');
  });

  it('handles empty currentEx gracefully (no crash, em-dash placeholder)', () => {
    state.currentEx = '';
    showWorkoutScreen();
    expect(document.getElementById('workout-screen')).not.toBeNull();
    expect(document.querySelector('.workout-ex-name').textContent).toBe('—');
  });
});

describe('Progress bar — completedExercises / sessionTotalExercises', () => {
  it('renders 00/05 when 0 completed of 5', () => {
    showWorkoutScreen();
    const progressTxt = document.querySelector('.workout-progress').textContent;
    expect(progressTxt).toContain('00/05');
  });

  it('renders 03/05 when 3 completed of 5', () => {
    state.completedExercises = new Set(['A', 'B', 'C']);
    showWorkoutScreen();
    const progressTxt = document.querySelector('.workout-progress').textContent;
    expect(progressTxt).toContain('03/05');
  });

  it('fill width matches percentage (60% for 3/5)', () => {
    state.completedExercises = new Set(['A', 'B', 'C']);
    showWorkoutScreen();
    const fill = document.querySelector('.workout-progress-fill');
    expect(fill.style.width).toBe('60%');
  });

  it('handles zero total gracefully (no NaN)', () => {
    state.sessionTotalExercises = 0;
    showWorkoutScreen();
    const fill = document.querySelector('.workout-progress-fill');
    expect(fill.style.width).toBe('0%');
  });
});

describe('Sets table — render from EX_SETS + sessLog state', () => {
  it('renders 3 set rows (default EX_SETS fallback)', () => {
    state.currentEx = 'UnknownExercise';
    showWorkoutScreen();
    expect(document.querySelectorAll('.workout-set-row').length).toBe(3);
  });

  it('marks set 1 as done (in sessLog), set 2 as current, set 3 as pending', () => {
    showWorkoutScreen();
    const rows = document.querySelectorAll('.workout-set-row');
    expect(rows[0].getAttribute('data-state')).toBe('done');
    expect(rows[1].getAttribute('data-state')).toBe('current');
    expect(rows[2].getAttribute('data-state')).toBe('pending');
  });

  it('shows kg + reps for done set from sessLog', () => {
    showWorkoutScreen();
    const row = document.querySelectorAll('.workout-set-row')[0];
    expect(row.textContent).toContain('22.5 kg');
    expect(row.textContent).toContain('10');
  });
});

describe('Tempo row — SYS.getTempo integration', () => {
  it('renders tempo/RIR/RPE row from SYS.getTempo', () => {
    showWorkoutScreen();
    const tempo = document.querySelector('.workout-tempo-row');
    expect(tempo).not.toBeNull();
    expect(tempo.textContent).toContain('tempo');
    expect(tempo.textContent).toContain('3-1-1-0');
    expect(tempo.textContent).toContain('RIR');
    expect(tempo.textContent).toContain('RPE');
  });

  it('omits tempo row when no current exercise', () => {
    state.currentEx = '';
    showWorkoutScreen();
    expect(document.querySelector('.workout-tempo-row')).toBeNull();
  });
});

describe('Rest timer panel — visibility from state.pauseTimer', () => {
  it('hidden when no pause active', () => {
    showWorkoutScreen();
    const rest = document.querySelector('.workout-rest');
    expect(rest.style.display).toBe('none');
  });

  it('visible when state.pauseTimer active + pauseLeft > 0 + renders SVG ring per mockup §rest-timer', () => {
    state.pauseTimer = 1; // truthy
    state.pauseLeft = 45;
    state.pauseTotal = 90;
    showWorkoutScreen();
    const rest = document.querySelector('.workout-rest');
    expect(rest.style.display).toBe('flex');
    // V2 mockup §rest-timer center label MM:SS format (NU V1 "Ns" linear)
    expect(rest.textContent).toContain('0:45');
    // % remaining preserved in label sub-line
    expect(rest.textContent).toContain('50%');
    // SVG ring scaffolding present per mockup line 985-988
    expect(rest.querySelector('#rest-circle')).toBeTruthy();
    expect(rest.querySelector('#rest-time')).toBeTruthy();
    expect(rest.querySelector('.workout-rest-skip')).toBeTruthy();
  });
});

describe('Action buttons — setDone + finishEarly wiring', () => {
  it('Inregistreaza setul -> calls setDone() + triggers re-render', () => {
    showWorkoutScreen();
    document.querySelector('.workout-log-set').click();
    expect(setDone).toHaveBeenCalledTimes(1);
    expect(document.getElementById('workout-screen')).not.toBeNull();
  });

  it('Inregistreaza setul -> invokes onSetDone callback if provided', () => {
    const onSetDone = vi.fn();
    showWorkoutScreen({ onSetDone });
    document.querySelector('.workout-log-set').click();
    expect(onSetDone).toHaveBeenCalledTimes(1);
  });

  it('Termina sesiunea -> calls finishEarly() + closes overlay', () => {
    showWorkoutScreen();
    document.querySelector('.workout-finish').click();
    expect(finishEarly).toHaveBeenCalledTimes(1);
    expect(document.getElementById('workout-screen')).toBeNull();
    expect(state.currentScreen).toBe('antrenor');
  });

  it('Termina sesiunea -> invokes onFinish callback if provided', () => {
    const onFinish = vi.fn();
    showWorkoutScreen({ onFinish });
    document.querySelector('.workout-finish').click();
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('swallows setDone error when DOM scaffolding absent (V1 prod parallel guard)', () => {
    setDone.mockImplementationOnce(() => { throw new Error('DOM lookup failed'); });
    showWorkoutScreen();
    expect(() => document.querySelector('.workout-log-set').click()).not.toThrow();
  });

  it('swallows finishEarly error when DOM scaffolding absent', () => {
    finishEarly.mockImplementationOnce(() => { throw new Error('DOM lookup failed'); });
    showWorkoutScreen();
    expect(() => document.querySelector('.workout-finish').click()).not.toThrow();
    expect(document.getElementById('workout-screen')).toBeNull();
  });
});

describe('Close button — reset state + invoke onClose callback', () => {
  it('close X -> removes overlay + resets state.currentScreen', () => {
    showWorkoutScreen();
    document.querySelector('.workout-close').click();
    expect(document.getElementById('workout-screen')).toBeNull();
    expect(state.currentScreen).toBe('antrenor');
  });

  it('close X -> invokes onClose callback if provided', () => {
    const onClose = vi.fn();
    showWorkoutScreen({ onClose });
    document.querySelector('.workout-close').click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('renderWorkoutScreen — re-render after state change', () => {
  it('re-render with updated currentSet reflects new current row', () => {
    showWorkoutScreen();
    state.sessLog.push({ ex: 'Incline DB Press', w: 22.5, set: 2, reps: '10' });
    state.currentSet = 3;
    renderWorkoutScreen();
    const rows = document.querySelectorAll('.workout-set-row');
    expect(rows[0].getAttribute('data-state')).toBe('done');
    expect(rows[1].getAttribute('data-state')).toBe('done');
    expect(rows[2].getAttribute('data-state')).toBe('current');
  });

  it('no-op when overlay not mounted', () => {
    renderWorkoutScreen();
    expect(document.getElementById('workout-screen')).toBeNull();
  });
});

describe('closeWorkoutScreen — defensive', () => {
  it('no-op when no overlay mounted', () => {
    expect(() => closeWorkoutScreen()).not.toThrow();
  });

  it('does NOT touch state.currentScreen when not on workout', () => {
    state.currentScreen = 'antrenor';
    closeWorkoutScreen();
    expect(state.currentScreen).toBe('antrenor');
  });
});

describe('getWorkoutMountState — debug helper', () => {
  it('reports mounted=false when overlay absent', () => {
    const s = getWorkoutMountState();
    expect(s.mounted).toBe(false);
  });

  it('reports mounted=true + current screen/ex/set when mounted', () => {
    showWorkoutScreen();
    const s = getWorkoutMountState();
    expect(s.mounted).toBe(true);
    expect(s.currentScreen).toBe('workout');
    expect(s.currentEx).toBe('Incline DB Press');
    expect(s.currentSet).toBe(2);
  });
});
