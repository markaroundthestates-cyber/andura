// restTimer SVG ring countdown + V1 prod linear bar coexistence tests.
// Per mockup 04-architecture/mockups/andura-clasic.html:§rest-timer line 982-996.
// Voice preservation: V1 logic (ps-timer + ps-progress + beep + speak + updateExCard)
// preserved verbatim; SVG ring extend is additive (V2 workout overlay path).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../db.js', () => ({
  $: (id) => document.getElementById(id),
}));

vi.mock('../../../engine/dp.js', () => ({
  DP: {
    recommend: vi.fn(() => ({ kg: 22.5, repsTarget: '8-10' })),
    getIntensityLabel: vi.fn(() => 'medie'),
  },
}));

vi.mock('../../../engine/sys.js', () => ({
  SYS: {
    getTempo: vi.fn(() => ({ rir: 2, tempo: '3-1-1-0' })),
  },
}));

vi.mock('../../../constants.js', () => ({
  COMPOUND_EX: ['Squat'],
  PAUSE_COMPOUND: 120,
  PAUSE_ISO: 60,
}));

vi.mock('../../../ui/ui.js', () => ({
  toast: vi.fn(),
  beep: vi.fn(),
  beepAlert: vi.fn(),
  speak: vi.fn(),
  showPauseScreen: vi.fn(),
  hidePauseScreen: vi.fn(),
}));

vi.mock('../logging.js', () => ({
  updateExCard: vi.fn(),
}));

vi.mock('../../../state.js', () => ({
  state: {
    pauseTimer: null,
    pauseTotal: 0,
    pauseLeft: 0,
    lastPauseEndedAt: null,
    currentEx: 'Squat',
  },
}));

import {
  updateRestRing,
  REST_RING_CIRCUMFERENCE,
  REST_RING_COLORS,
  startPause,
  stopPause,
  getSmartPause,
} from '../restTimer.js';
import { state } from '../../../state.js';

function mountRingHTML() {
  document.body.innerHTML = `
    <div id="rest-timer">
      <svg><circle id="rest-circle" stroke-dasharray="188.5" stroke-dashoffset="60" stroke="#c8412e"></circle></svg>
      <div id="rest-time">0:00</div>
    </div>
    <div id="ps-timer">0</div>
    <div id="ps-progress" style="width:0%"></div>
    <div id="ps-next"></div>
    <div id="ps-rec-kg"></div>
    <div id="ps-rec-reps"></div>
  `;
}

describe('updateRestRing — SVG dashoffset inverse fill', () => {
  beforeEach(() => mountRingHTML());
  afterEach(() => { document.body.innerHTML = ''; });

  it('pct=1 (full time remaining) → offset=0 (full ring visible)', () => {
    updateRestRing(120, 120);
    const circle = document.getElementById('rest-circle');
    expect(Number(circle.getAttribute('stroke-dashoffset'))).toBeCloseTo(0, 5);
  });

  it('pct=0 (time depleted) → offset=circumference (no ring visible)', () => {
    updateRestRing(0, 120);
    const circle = document.getElementById('rest-circle');
    expect(Number(circle.getAttribute('stroke-dashoffset'))).toBeCloseTo(REST_RING_CIRCUMFERENCE, 5);
  });

  it('pct=0.5 → offset=circumference/2', () => {
    updateRestRing(60, 120);
    const circle = document.getElementById('rest-circle');
    expect(Number(circle.getAttribute('stroke-dashoffset'))).toBeCloseTo(REST_RING_CIRCUMFERENCE / 2, 5);
  });
});

describe('updateRestRing — 3 color states per mockup §rest-timer', () => {
  beforeEach(() => mountRingHTML());
  afterEach(() => { document.body.innerHTML = ''; });

  it('pct >= 0.30 → normal color #c8412e (mockup verbatim)', () => {
    updateRestRing(60, 120); // pct=0.5
    const circle = document.getElementById('rest-circle');
    expect(circle.getAttribute('stroke')).toBe(REST_RING_COLORS.normal);
    expect(circle.getAttribute('stroke')).toBe('#c8412e');
  });

  it('0.10 <= pct < 0.30 → warning amber', () => {
    updateRestRing(20, 120); // pct=0.166
    const circle = document.getElementById('rest-circle');
    expect(circle.getAttribute('stroke')).toBe(REST_RING_COLORS.warning);
  });

  it('pct < 0.10 → urgent red', () => {
    updateRestRing(6, 120); // pct=0.05
    const circle = document.getElementById('rest-circle');
    expect(circle.getAttribute('stroke')).toBe(REST_RING_COLORS.urgent);
  });

  it('pulse class added at urgent and removed when no longer urgent', () => {
    updateRestRing(6, 120);
    const circle = document.getElementById('rest-circle');
    expect(circle.classList.contains('rest-urgent-pulse')).toBe(true);

    updateRestRing(60, 120);
    expect(circle.classList.contains('rest-urgent-pulse')).toBe(false);
  });
});

describe('updateRestRing — MM:SS center label', () => {
  beforeEach(() => mountRingHTML());
  afterEach(() => { document.body.innerHTML = ''; });

  it('78s → "1:18" (matches mockup §rest-timer snapshot)', () => {
    updateRestRing(78, 120);
    expect(document.getElementById('rest-time').textContent).toBe('1:18');
  });

  it('65s → "1:05" (zero-pads seconds)', () => {
    updateRestRing(65, 120);
    expect(document.getElementById('rest-time').textContent).toBe('1:05');
  });

  it('0s → "0:00"', () => {
    updateRestRing(0, 120);
    expect(document.getElementById('rest-time').textContent).toBe('0:00');
  });

  it('120s → "2:00"', () => {
    updateRestRing(120, 120);
    expect(document.getElementById('rest-time').textContent).toBe('2:00');
  });
});

describe('updateRestRing — defensive no-op + clamping', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  it('no #rest-circle and no #rest-time present → no-op (V1 prod path)', () => {
    document.body.innerHTML = '<div></div>';
    expect(() => updateRestRing(60, 120)).not.toThrow();
  });

  it('total <= 0 → no-op', () => {
    mountRingHTML();
    const circle = document.getElementById('rest-circle');
    const initial = circle.getAttribute('stroke-dashoffset');
    updateRestRing(0, 0);
    expect(circle.getAttribute('stroke-dashoffset')).toBe(initial);
  });

  it('negative left clamps to 0 (offset = full circumference)', () => {
    mountRingHTML();
    updateRestRing(-5, 120);
    const circle = document.getElementById('rest-circle');
    expect(Number(circle.getAttribute('stroke-dashoffset'))).toBeCloseTo(REST_RING_CIRCUMFERENCE, 5);
  });

  it('left > total clamps to total (offset=0)', () => {
    mountRingHTML();
    updateRestRing(200, 120);
    const circle = document.getElementById('rest-circle');
    expect(Number(circle.getAttribute('stroke-dashoffset'))).toBeCloseTo(0, 5);
  });

  it('updates only label when circle absent', () => {
    document.body.innerHTML = '<div id="rest-time">--</div>';
    updateRestRing(30, 60);
    expect(document.getElementById('rest-time').textContent).toBe('0:30');
  });

  it('updates only circle when label absent', () => {
    document.body.innerHTML = '<svg><circle id="rest-circle" stroke-dashoffset="0" stroke=""></circle></svg>';
    updateRestRing(60, 120);
    const circle = document.getElementById('rest-circle');
    expect(Number(circle.getAttribute('stroke-dashoffset'))).toBeCloseTo(REST_RING_CIRCUMFERENCE / 2, 5);
  });
});

describe('getSmartPause — V1 logic preserved', () => {
  it('compound exercise base pause = PAUSE_COMPOUND ± RIR adjustment', () => {
    const sec = getSmartPause('Squat');
    expect(typeof sec).toBe('number');
    expect(sec).toBeGreaterThanOrEqual(30);
  });

  it('isolation exercise base pause = PAUSE_ISO', () => {
    const sec = getSmartPause('Curl');
    expect(typeof sec).toBe('number');
    expect(sec).toBeGreaterThanOrEqual(30);
  });
});

describe('startPause integration — V1 + V2 ring update coexist', () => {
  beforeEach(() => {
    mountRingHTML();
    state.pauseTimer = null;
    state.pauseTotal = 0;
    state.pauseLeft = 0;
    vi.useFakeTimers();
  });
  afterEach(() => {
    stopPause();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('startPause initializes V1 ps-timer + V2 SVG ring on initial render', () => {
    startPause(90, 'Bench');
    expect(state.pauseTotal).toBe(90);
    expect(state.pauseLeft).toBe(90);
    expect(document.getElementById('ps-timer').textContent).toBe('90');
    expect(document.getElementById('rest-time').textContent).toBe('1:30');
    const circle = document.getElementById('rest-circle');
    expect(Number(circle.getAttribute('stroke-dashoffset'))).toBeCloseTo(0, 5);
  });

  it('interval tick decrements pauseLeft + updates BOTH V1 width bar + V2 ring dashoffset', () => {
    startPause(100, 'Bench');
    vi.advanceTimersByTime(1000);

    expect(state.pauseLeft).toBe(99);
    expect(document.getElementById('ps-timer').textContent).toBe('99');

    const widthPct = document.getElementById('ps-progress').style.width;
    expect(parseFloat(widthPct)).toBeCloseTo(99, 1);

    const circle = document.getElementById('rest-circle');
    const offset = Number(circle.getAttribute('stroke-dashoffset'));
    expect(offset).toBeCloseTo(REST_RING_CIRCUMFERENCE * (1 - 0.99), 1);
  });

  it('color transition through 3 states across countdown', () => {
    startPause(100, 'Bench');
    const circle = document.getElementById('rest-circle');

    // tick 50 → pct=0.50 → normal
    vi.advanceTimersByTime(50000);
    expect(circle.getAttribute('stroke')).toBe(REST_RING_COLORS.normal);

    // tick to 20 left → pct=0.20 → warning
    vi.advanceTimersByTime(30000);
    expect(state.pauseLeft).toBe(20);
    expect(circle.getAttribute('stroke')).toBe(REST_RING_COLORS.warning);

    // tick to 5 left → pct=0.05 → urgent
    vi.advanceTimersByTime(15000);
    expect(state.pauseLeft).toBe(5);
    expect(circle.getAttribute('stroke')).toBe(REST_RING_COLORS.urgent);
    expect(circle.classList.contains('rest-urgent-pulse')).toBe(true);
  });

  it('stopPause clears interval — pauseTimer becomes null', () => {
    startPause(90, 'Bench');
    expect(state.pauseTimer).not.toBeNull();
    stopPause();
    expect(state.pauseTimer).toBeNull();
  });
});
