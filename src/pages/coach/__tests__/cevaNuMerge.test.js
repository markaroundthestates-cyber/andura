// Ceva Nu Merge — unified Pain+Equipment drill tests.
// Per LOCK V1 2026-05-10 SUPERSEDE ADR 023 split: 4 optiuni preset (3 reasons +
// cancel) fan-out la flow-uri existing.

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
  };
});

vi.mock('../modals.js', () => ({
  showAlternativeModal: vi.fn(),
}));

vi.mock('../painButton.js', () => ({
  showPainButton: vi.fn((exerciseName) => {
    const modal = document.createElement('div');
    modal.id = 'pain-button-modal';
    modal.innerHTML = '<button class="pain-altceva-toggle"></button><div class="pain-altceva-panel" style="display:none"></div>';
    modal.querySelector('.pain-altceva-toggle').addEventListener('click', () => {
      modal.querySelector('.pain-altceva-panel').style.display = 'block';
    });
    document.body.appendChild(modal);
  }),
}));

import {
  showCevaNuMerge,
  selectCevaNuMergeReason,
  CEVA_NU_MERGE_OPTIONS,
} from '../cevaNuMerge.js';
import { DB } from '../../../db.js';
import { state } from '../../../state.js';
import { showAlternativeModal } from '../modals.js';
import { showPainButton } from '../painButton.js';

beforeEach(() => {
  document.body.innerHTML = '';
  DB._store.clear();
  state.currentScreen = 'antrenor';
  state.cevaNuMergeReason = null;
  state.currentEx = '';
  vi.clearAllMocks();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('showCevaNuMerge — render 4 optiuni preset', () => {
  it('mounts modal with 3 reason buttons + cancel', () => {
    showCevaNuMerge('Bench Press');
    expect(document.getElementById('ceva-nu-merge-modal')).not.toBeNull();
    expect(document.querySelectorAll('button[data-reason]').length).toBe(3);
    expect(document.querySelector('.ceva-cancel')).not.toBeNull();
  });

  it('renders mockup labels (Ma doare / Nu am aparat / Altceva)', () => {
    showCevaNuMerge();
    const text = document.getElementById('ceva-nu-merge-modal').textContent;
    expect(text).toContain('Ma doare');
    expect(text).toContain('Nu am aparat');
    expect(text).toContain('Altceva');
    expect(text).toContain('Anuleaza');
  });

  it('displays exercise context when provided', () => {
    showCevaNuMerge('Squat');
    expect(document.getElementById('ceva-nu-merge-modal').textContent).toContain('Squat');
  });

  it('falls back to state.currentEx when no exercise param', () => {
    state.currentEx = 'Deadlift';
    showCevaNuMerge();
    expect(document.getElementById('ceva-nu-merge-modal').textContent).toContain('Deadlift');
  });

  it('sets state.currentScreen = "ceva-nu-merge" on mount', () => {
    showCevaNuMerge();
    expect(state.currentScreen).toBe('ceva-nu-merge');
  });

  it('idempotent — second call does NOT duplicate', () => {
    showCevaNuMerge();
    showCevaNuMerge();
    expect(document.querySelectorAll('#ceva-nu-merge-modal').length).toBe(1);
  });

  it('escapes HTML in exercise name (XSS guard)', () => {
    showCevaNuMerge('<script>alert(1)</script>');
    const html = document.getElementById('ceva-nu-merge-modal').innerHTML;
    expect(html).not.toContain('<script>alert(1)');
    expect(html).toContain('&lt;script');
  });
});

describe('selectCevaNuMergeReason — fan-out routing (preserves SUPERSEDE ADR 023)', () => {
  it('Ma doare -> state.cevaNuMergeReason="pain" + showPainButton called', () => {
    const onResolve = vi.fn();
    showCevaNuMerge('Bench Press', onResolve);
    document.querySelector('button[data-reason="pain"]').click();

    expect(state.cevaNuMergeReason).toBe('pain');
    expect(showPainButton).toHaveBeenCalledWith('Bench Press', onResolve);
    expect(document.getElementById('ceva-nu-merge-modal')).toBeNull();
  });

  it('Nu am aparat -> state.cevaNuMergeReason="equipment" + showAlternativeModal called', () => {
    const onResolve = vi.fn();
    showCevaNuMerge('Lat Pulldown', onResolve);
    document.querySelector('button[data-reason="equipment"]').click();

    expect(state.cevaNuMergeReason).toBe('equipment');
    expect(showAlternativeModal).toHaveBeenCalledWith('Lat Pulldown');
    expect(onResolve).toHaveBeenCalledWith({ action: 'fan-out', reason: 'equipment' });
  });

  it('Altceva -> state.cevaNuMergeReason="altceva" + showPainButton + altceva panel opened', () => {
    const onResolve = vi.fn();
    showCevaNuMerge('Squat', onResolve);
    document.querySelector('button[data-reason="altceva"]').click();

    expect(state.cevaNuMergeReason).toBe('altceva');
    expect(showPainButton).toHaveBeenCalledWith('Squat', onResolve);
    const panel = document.querySelector('.pain-altceva-panel');
    expect(panel.style.display).toBe('block');
  });

  it('Anuleaza -> close modal + onResolve cancel', () => {
    const onResolve = vi.fn();
    showCevaNuMerge('X', onResolve);
    document.querySelector('.ceva-cancel').click();
    expect(document.getElementById('ceva-nu-merge-modal')).toBeNull();
    expect(state.currentScreen).toBe('antrenor');
    expect(onResolve).toHaveBeenCalledWith({ action: 'cancel', source: 'cancel' });
  });

  it('backdrop tap -> close + onResolve backdrop', () => {
    const onResolve = vi.fn();
    showCevaNuMerge('X', onResolve);
    document.getElementById('ceva-nu-merge-modal').click();
    expect(onResolve).toHaveBeenCalledWith({ action: 'cancel', source: 'backdrop' });
  });

  it('unknown reason -> no-op (defensive guard)', () => {
    const onResolve = vi.fn();
    showCevaNuMerge('X', onResolve);
    selectCevaNuMergeReason('nonexistent', 'X', onResolve);
    expect(showPainButton).not.toHaveBeenCalled();
    expect(showAlternativeModal).not.toHaveBeenCalled();
    expect(state.cevaNuMergeReason).toBe(null);
  });
});

describe('DB ceva-nu-merge-log rolling window 90', () => {
  it('logs entry on each selection', () => {
    selectCevaNuMergeReason('pain', 'Bench Press', () => {});
    const log = DB.get('ceva-nu-merge-log');
    expect(log).toHaveLength(1);
    expect(log[0].reason).toBe('pain');
    expect(log[0].exerciseName).toBe('Bench Press');
    expect(log[0].date).toBe('2026-05-12');
  });

  it('rolls at 90 entries (Tier 0 alignment ADR 020)', () => {
    const seeded = Array.from({ length: 95 }, (_, i) => ({ date: '2026-05-01', reason: 'pain', ts: i }));
    DB.set('ceva-nu-merge-log', seeded);

    selectCevaNuMergeReason('equipment', 'Squat', () => {});
    const log = DB.get('ceva-nu-merge-log');
    expect(log.length).toBe(90);
    expect(log[0].reason).toBe('equipment');
  });
});

describe('CEVA_NU_MERGE_OPTIONS catalog', () => {
  it('exports 3 fan-out reasons (pain / equipment / altceva)', () => {
    expect(CEVA_NU_MERGE_OPTIONS).toHaveLength(3);
    expect(CEVA_NU_MERGE_OPTIONS.map(o => o.reason)).toEqual(['pain', 'equipment', 'altceva']);
    CEVA_NU_MERGE_OPTIONS.forEach(opt => {
      expect(opt.icon).toBeDefined();
      expect(opt.label).toBeDefined();
      expect(opt.sub).toBeDefined();
    });
  });

  it('reasons match state.cevaNuMergeReason allowed values (state.js:30 contract)', () => {
    const allowed = ['pain', 'equipment', 'altceva'];
    CEVA_NU_MERGE_OPTIONS.forEach(opt => {
      expect(allowed).toContain(opt.reason);
    });
  });
});
