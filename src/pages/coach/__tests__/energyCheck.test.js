// Energy Check §G port tests — 3-state UI + cause drill + readiness mapping.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../db.js', () => {
  const store = new Map();
  return {
    DB: {
      get: (k) => (store.has(k) ? store.get(k) : null),
      set: (k, v) => store.set(k, v),
      _store: store,
    },
    tod: () => '2026-05-12',
    todDate: () => new Date('2026-05-12'),
  };
});

vi.mock('../../../engine/readiness.js', () => ({
  saveReadiness: vi.fn(),
}));

import {
  showEnergyCheck,
  showEnergyCause,
  selectEnergyCause,
  ENERGY_STATES,
  ENERGY_CAUSES,
} from '../energyCheck.js';
import { DB } from '../../../db.js';
import { saveReadiness } from '../../../engine/readiness.js';

beforeEach(() => {
  document.body.innerHTML = '';
  DB._store.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('showEnergyCheck — 3-state UI render', () => {
  it('mounts modal with 3 state buttons + skip option', () => {
    showEnergyCheck();
    expect(document.getElementById('energy-check-modal')).not.toBeNull();
    expect(document.querySelector('.energy-btn-excellent')).not.toBeNull();
    expect(document.querySelector('.energy-btn-normal')).not.toBeNull();
    expect(document.querySelector('.energy-btn-tired')).not.toBeNull();
    expect(document.querySelector('.energy-skip')).not.toBeNull();
  });

  it('renders 3 emoji indicators 🟢 🟡 🔴', () => {
    showEnergyCheck();
    const text = document.getElementById('energy-check-modal').textContent;
    expect(text).toContain('🟢');
    expect(text).toContain('🟡');
    expect(text).toContain('🔴');
  });

  it('uses Romanian copy NU English', () => {
    showEnergyCheck();
    const text = document.getElementById('energy-check-modal').textContent;
    expect(text).toContain('Excelent');
    expect(text).toContain('Normal');
    expect(text).toContain('Obosit');
    expect(text).not.toMatch(/Tired|Energy level/i);
  });

  it('is idempotent — second call NU creates duplicate modal', () => {
    showEnergyCheck();
    showEnergyCheck();
    expect(document.querySelectorAll('#energy-check-modal').length).toBe(1);
  });
});

describe('selectEnergyState — readiness mapping + flow', () => {
  it('Excelent -> saveReadiness(5) + onProceed({state:excellent})', () => {
    const onProceed = vi.fn();
    showEnergyCheck(onProceed);
    document.querySelector('.energy-btn-excellent').click();
    expect(saveReadiness).toHaveBeenCalledWith(5);
    expect(onProceed).toHaveBeenCalledWith({ state: ENERGY_STATES.EXCELLENT, readiness: 5, skipped: false });
    expect(document.getElementById('energy-check-modal')).toBeNull();
  });

  it('Normal -> saveReadiness(3) + onProceed({state:normal})', () => {
    const onProceed = vi.fn();
    showEnergyCheck(onProceed);
    document.querySelector('.energy-btn-normal').click();
    expect(saveReadiness).toHaveBeenCalledWith(3);
    expect(onProceed).toHaveBeenCalledWith({ state: ENERGY_STATES.NORMAL, readiness: 3, skipped: false });
  });

  it('Obosit -> saveReadiness(2) + opens energy-cause drill (NU onProceed yet)', () => {
    const onProceed = vi.fn();
    showEnergyCheck(onProceed);
    document.querySelector('.energy-btn-tired').click();
    expect(saveReadiness).toHaveBeenCalledWith(2);
    expect(onProceed).not.toHaveBeenCalled();
    expect(document.getElementById('energy-cause-modal')).not.toBeNull();
  });

  it('skip -> NU saveReadiness + onProceed({skipped:true,state:null})', () => {
    const onProceed = vi.fn();
    showEnergyCheck(onProceed);
    document.querySelector('.energy-skip').click();
    expect(saveReadiness).not.toHaveBeenCalled();
    expect(onProceed).toHaveBeenCalledWith({ state: null, skipped: true });
  });
});

describe('showEnergyCause — 4 cauze drill', () => {
  it('renders 4 cause buttons (Stres / Somn slab / Durere / Altul)', () => {
    showEnergyCause();
    const buttons = document.querySelectorAll('#energy-cause-modal button[data-cause]');
    expect(buttons.length).toBe(4);
    const causes = Array.from(buttons).map(b => b.dataset.cause);
    expect(causes).toEqual(['stress', 'poor_sleep', 'soreness', 'other']);
  });

  it('cause labels match mockup spec', () => {
    showEnergyCause();
    const text = document.getElementById('energy-cause-modal').textContent;
    expect(text).toContain('Stres');
    expect(text).toContain('Somn slab');
    expect(text).toContain('Durere');
    expect(text).toContain('Altul');
  });
});

describe('selectEnergyCause — DB log + onProceed', () => {
  it('logs to energy-cause-log + onProceed payload', () => {
    const onProceed = vi.fn();
    showEnergyCause(onProceed);
    document.querySelector('button[data-cause="stress"]').click();

    const log = DB.get('energy-cause-log');
    expect(log).toHaveLength(1);
    expect(log[0].cause).toBe('stress');
    expect(log[0].date).toBe('2026-05-12');
    expect(typeof log[0].ts).toBe('number');

    expect(onProceed).toHaveBeenCalledWith({
      state: ENERGY_STATES.TIRED,
      readiness: 2,
      cause: 'stress',
      skipped: false,
    });
    expect(document.getElementById('energy-cause-modal')).toBeNull();
  });

  it('skip cause -> onProceed with cause:null skipped:true', () => {
    const onProceed = vi.fn();
    showEnergyCause(onProceed);
    document.querySelector('.cause-skip').click();
    expect(onProceed).toHaveBeenCalledWith({
      state: ENERGY_STATES.TIRED,
      readiness: 2,
      cause: null,
      skipped: true,
    });
    expect(DB.get('energy-cause-log')).toBeNull();
  });

  it('rolling window 90 entries (Tier 0 alignment, ADR 020)', () => {
    const seeded = Array.from({ length: 95 }, (_, i) => ({ date: '2026-05-01', cause: 'stress', ts: i }));
    DB.set('energy-cause-log', seeded);

    selectEnergyCause('poor_sleep', () => {});
    const log = DB.get('energy-cause-log');
    expect(log.length).toBe(90);
    expect(log[0].cause).toBe('poor_sleep');
  });
});

describe('ENERGY_CAUSES export shape', () => {
  it('catalog 4 entries keys + labels', () => {
    expect(ENERGY_CAUSES.map(c => c.key)).toEqual(['stress', 'poor_sleep', 'soreness', 'other']);
    ENERGY_CAUSES.forEach(c => {
      expect(typeof c.key).toBe('string');
      expect(typeof c.label).toBe('string');
      expect(c.label.length).toBeGreaterThan(0);
    });
  });
});
