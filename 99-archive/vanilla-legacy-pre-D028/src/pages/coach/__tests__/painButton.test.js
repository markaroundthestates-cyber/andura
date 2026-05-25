// Pain Button §36.38 port tests — mockup labels + engine PAIN_OPTIONS mapping +
// Altceva free-text submit + state router transitions.

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

import {
  showPainButton,
  selectPainOption,
  submitAltcevaNote,
  PAIN_UI_OPTIONS,
} from '../painButton.js';
import { DB } from '../../../db.js';
import { state } from '../../../state.js';

beforeEach(() => {
  document.body.innerHTML = '';
  DB._store.clear();
  state.currentScreen = 'antrenor';
  state.currentEx = '';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('showPainButton — UI render (mockup spec)', () => {
  it('mounts modal with 3 predefined PAIN_UI_OPTIONS + Altceva toggle + cancel', () => {
    showPainButton('Bench Press');
    expect(document.getElementById('pain-button-modal')).not.toBeNull();
    expect(document.querySelectorAll('button[data-pain]').length).toBe(3);
    expect(document.querySelector('.pain-altceva-toggle')).not.toBeNull();
    expect(document.querySelector('.pain-cancel')).not.toBeNull();
  });

  it('renders mockup labels (Durere acuta / Disconfort articulatie / Oboseala extrema)', () => {
    showPainButton();
    const text = document.getElementById('pain-button-modal').textContent;
    expect(text).toContain('Durere acuta');
    expect(text).toContain('Disconfort articulatie');
    expect(text).toContain('Oboseala extrema');
    expect(text).toContain('Altceva');
  });

  it('displays current exercise context when provided', () => {
    showPainButton('Squat');
    expect(document.getElementById('pain-button-modal').textContent).toContain('Squat');
  });

  it('falls back to state.currentEx when exerciseName param omitted', () => {
    state.currentEx = 'Deadlift';
    showPainButton();
    expect(document.getElementById('pain-button-modal').textContent).toContain('Deadlift');
  });

  it('sets state.currentScreen = "pain-button" on mount, resets on close', () => {
    showPainButton();
    expect(state.currentScreen).toBe('pain-button');
    document.querySelector('.pain-cancel').click();
    expect(state.currentScreen).toBe('antrenor');
  });

  it('is idempotent — second showPainButton call does NOT duplicate', () => {
    showPainButton();
    showPainButton();
    expect(document.querySelectorAll('#pain-button-modal').length).toBe(1);
  });

  it('Altceva panel hidden by default, shown after toggle click', () => {
    showPainButton();
    const panel = document.querySelector('.pain-altceva-panel');
    expect(panel.style.display).toBe('none');
    document.querySelector('.pain-altceva-toggle').click();
    expect(panel.style.display).toBe('block');
  });

  it('escapes HTML in exercise name (XSS guard)', () => {
    showPainButton('<img src=x onerror=alert(1)>');
    const html = document.getElementById('pain-button-modal').innerHTML;
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img');
  });
});

describe('selectPainOption — engine mapping + DB log', () => {
  it('Durere acuta -> engine discomfort_specific + reduce_volume action', () => {
    const onResolve = vi.fn();
    showPainButton('Bench Press', onResolve);
    document.querySelector('button[data-pain="acute_pain"]').click();

    expect(onResolve).toHaveBeenCalledWith(expect.objectContaining({
      action: 'pain',
      uiKey: 'acute_pain',
      engineKey: 'discomfort_specific',
      engineAction: 'reduce_volume',
    }));
    const log = DB.get('pain-button-log');
    expect(log[0].uiKey).toBe('acute_pain');
    expect(log[0].engineKey).toBe('discomfort_specific');
    expect(log[0].exerciseName).toBe('Bench Press');
    expect(log[0].audit).toBeDefined();
    expect(log[0].audit.user_override_pain_redflag).toBe(false);
  });

  it('Disconfort articulatie -> engine discomfort_general + suggest_alternative', () => {
    const onResolve = vi.fn();
    showPainButton('Squat', onResolve);
    document.querySelector('button[data-pain="joint_discomfort"]').click();
    expect(onResolve).toHaveBeenCalledWith(expect.objectContaining({
      uiKey: 'joint_discomfort',
      engineKey: 'discomfort_general',
      engineAction: 'suggest_alternative',
    }));
  });

  it('Oboseala extrema -> engine doms_severe + skip', () => {
    const onResolve = vi.fn();
    showPainButton('Deadlift', onResolve);
    document.querySelector('button[data-pain="extreme_fatigue"]').click();
    expect(onResolve).toHaveBeenCalledWith(expect.objectContaining({
      uiKey: 'extreme_fatigue',
      engineKey: 'doms_severe',
      engineAction: 'skip',
    }));
  });

  it('closes modal + shows safety toast post-selection', () => {
    showPainButton('Bench Press');
    document.querySelector('button[data-pain="acute_pain"]').click();
    expect(document.getElementById('pain-button-modal')).toBeNull();
    expect(document.getElementById('pain-toast')).not.toBeNull();
    expect(document.getElementById('pain-toast').textContent).toMatch(/Siguranta/i);
  });

  it('rolling window 90 entries pain-button-log', () => {
    const seeded = Array.from({ length: 95 }, (_, i) => ({ date: '2026-05-01', uiKey: 'acute_pain', engineKey: 'discomfort_specific', ts: i }));
    DB.set('pain-button-log', seeded);

    selectPainOption('joint_discomfort', 'Squat', () => {});
    const log = DB.get('pain-button-log');
    expect(log.length).toBe(90);
    expect(log[0].uiKey).toBe('joint_discomfort');
  });

  it('NO medical claim wording in UI (anti-paternalism §ADR_PAIN)', () => {
    showPainButton();
    const text = document.getElementById('pain-button-modal').textContent.toLowerCase();
    expect(text).not.toContain('doctor');
    expect(text).not.toContain('medic');
    expect(text).not.toContain('consult');
    expect(text).not.toContain('diagnos');
  });
});

describe('submitAltcevaNote — free-text submit', () => {
  it('saves note to pain-altceva-notes + onResolve action=altceva', () => {
    const onResolve = vi.fn();
    showPainButton('Bench Press', onResolve);
    document.querySelector('.pain-altceva-toggle').click();
    const ta = document.querySelector('.pain-altceva-text');
    ta.value = 'intepatura usoara lombar';
    document.querySelector('.pain-altceva-submit').click();

    const notes = DB.get('pain-altceva-notes');
    expect(notes).toHaveLength(1);
    expect(notes[0].note).toBe('intepatura usoara lombar');
    expect(notes[0].exerciseName).toBe('Bench Press');
    expect(onResolve).toHaveBeenCalledWith(expect.objectContaining({
      action: 'altceva',
      note: 'intepatura usoara lombar',
    }));
  });

  it('empty / whitespace-only note ignored — NU submit, NU close', () => {
    const onResolve = vi.fn();
    showPainButton('X', onResolve);
    document.querySelector('.pain-altceva-toggle').click();
    document.querySelector('.pain-altceva-text').value = '   ';
    document.querySelector('.pain-altceva-submit').click();

    expect(DB.get('pain-altceva-notes')).toBeNull();
    expect(onResolve).not.toHaveBeenCalled();
    expect(document.getElementById('pain-button-modal')).not.toBeNull();
  });

  it('truncates note to 500 chars (mockup maxlength)', () => {
    const longNote = 'a'.repeat(600);
    submitAltcevaNote(longNote, 'Squat', () => {});
    const notes = DB.get('pain-altceva-notes');
    expect(notes[0].note.length).toBe(500);
  });

  it('counter updates as user types', () => {
    showPainButton();
    document.querySelector('.pain-altceva-toggle').click();
    const ta = document.querySelector('.pain-altceva-text');
    ta.value = 'hello';
    ta.dispatchEvent(new Event('input'));
    expect(document.querySelector('.pain-altceva-count').textContent).toBe('5/500');
  });
});

describe('PAIN_UI_OPTIONS shape', () => {
  it('exports 3 mockup options with engine key mapping', () => {
    expect(PAIN_UI_OPTIONS).toHaveLength(3);
    expect(PAIN_UI_OPTIONS.map(o => o.key)).toEqual(['acute_pain', 'joint_discomfort', 'extreme_fatigue']);
    PAIN_UI_OPTIONS.forEach(opt => {
      expect(opt.engineKey).toMatch(/^(discomfort_general|discomfort_specific|doms_severe)$/);
      expect(opt.icon).toBeDefined();
      expect(opt.label).toBeDefined();
      expect(opt.sub).toBeDefined();
    });
  });

  it('engine keys cover all ADR PAIN_OPTIONS (LOCK V1 contract)', () => {
    const engineKeys = new Set(PAIN_UI_OPTIONS.map(o => o.engineKey));
    expect(engineKeys.has('discomfort_general')).toBe(true);
    expect(engineKeys.has('discomfort_specific')).toBe(true);
    expect(engineKeys.has('doms_severe')).toBe(true);
  });
});

describe('cancel + backdrop dismiss', () => {
  it('Anuleaza button -> cancel action source', () => {
    const onResolve = vi.fn();
    showPainButton('X', onResolve);
    document.querySelector('.pain-cancel').click();
    expect(onResolve).toHaveBeenCalledWith({ action: 'cancel', source: 'cancel' });
  });

  it('backdrop tap -> cancel source backdrop', () => {
    const onResolve = vi.fn();
    showPainButton('X', onResolve);
    document.getElementById('pain-button-modal').click();
    expect(onResolve).toHaveBeenCalledWith({ action: 'cancel', source: 'backdrop' });
  });
});
