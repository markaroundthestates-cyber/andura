// Equipment Swap — free-text fallback drill tests.
// Per mockup `04-architecture/mockups/andura-clasic.html:§equipment-swap` line
// 811-825. Coach interpretation deferred V2 (similar Altceva pattern in
// painButton.js §submitAltcevaNote). Engine smart-routing contract preserved
// orthogonal (ADR_SMART_ROUTING_EQUIPMENT_v1 LOCK 2026-05-02 unchanged).

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
  showEquipmentSwap,
  submitSwapRequest,
} from '../equipmentSwap.js';
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

describe('showEquipmentSwap — render free-text modal', () => {
  it('mounts modal with textarea + submit + cancel', () => {
    showEquipmentSwap('Bench Press');
    expect(document.getElementById('equipment-swap-modal')).not.toBeNull();
    expect(document.querySelector('.swap-text')).not.toBeNull();
    expect(document.querySelector('.swap-submit')).not.toBeNull();
    expect(document.querySelector('.swap-cancel')).not.toBeNull();
  });

  it('renders mockup header + subtitle + hint', () => {
    showEquipmentSwap();
    const text = document.getElementById('equipment-swap-modal').textContent;
    expect(text).toContain('Schimba echipament');
    expect(text).toContain('Smart-routing nu a gasit alternativa');
    expect(text).toContain('Ce echipament ai in loc?');
    expect(text).toContain('Coach-ul interpreteaza liber');
    expect(text).toContain('Cere swap');
  });

  it('displays current exercise context block when provided', () => {
    showEquipmentSwap('Impins inclinat haltera');
    const text = document.getElementById('equipment-swap-modal').textContent;
    expect(text).toContain('Exercitiu curent');
    expect(text).toContain('Impins inclinat haltera');
  });

  it('falls back to state.currentEx when no exercise param', () => {
    state.currentEx = 'Squat';
    showEquipmentSwap();
    expect(document.getElementById('equipment-swap-modal').textContent).toContain('Squat');
  });

  it('omits exercise context block when no exercise available', () => {
    showEquipmentSwap();
    const text = document.getElementById('equipment-swap-modal').textContent;
    expect(text).not.toContain('Exercitiu curent');
  });

  it('sets state.currentScreen = "equipment-swap" on mount (router enum line 29)', () => {
    showEquipmentSwap();
    expect(state.currentScreen).toBe('equipment-swap');
  });

  it('idempotent — second call does NOT duplicate', () => {
    showEquipmentSwap();
    showEquipmentSwap();
    expect(document.querySelectorAll('#equipment-swap-modal').length).toBe(1);
  });

  it('escapes HTML in exercise name (XSS guard)', () => {
    showEquipmentSwap('<script>alert(1)</script>');
    const html = document.getElementById('equipment-swap-modal').innerHTML;
    expect(html).not.toContain('<script>alert(1)');
    expect(html).toContain('&lt;script');
  });

  it('textarea has 500 char maxlength + initial 0/500 counter', () => {
    showEquipmentSwap();
    const textarea = document.querySelector('.swap-text');
    expect(textarea.getAttribute('maxlength')).toBe('500');
    expect(document.querySelector('.swap-count').textContent).toBe('0/500');
  });
});

describe('counter live update on textarea input', () => {
  it('updates counter as user types', () => {
    showEquipmentSwap();
    const textarea = document.querySelector('.swap-text');
    textarea.value = 'doar gantere pana la 12 kg';
    textarea.dispatchEvent(new Event('input'));
    expect(document.querySelector('.swap-count').textContent).toBe('26/500');
  });
});

describe('submit swap request — DB log + onResolve callback', () => {
  it('Cere swap with text -> logs entry to equipment-swap-log', () => {
    const onResolve = vi.fn();
    showEquipmentSwap('Impins inclinat', onResolve);
    const textarea = document.querySelector('.swap-text');
    textarea.value = 'doar gantere pana la 12 kg';
    document.querySelector('.swap-submit').click();

    const log = DB.get('equipment-swap-log');
    expect(log).toHaveLength(1);
    expect(log[0].note).toBe('doar gantere pana la 12 kg');
    expect(log[0].exerciseName).toBe('Impins inclinat');
    expect(log[0].date).toBe('2026-05-12');
  });

  it('Cere swap empty -> no-op (NU log, NU close)', () => {
    const onResolve = vi.fn();
    showEquipmentSwap('X', onResolve);
    const textarea = document.querySelector('.swap-text');
    textarea.value = '   '; // whitespace only
    document.querySelector('.swap-submit').click();

    expect(DB.get('equipment-swap-log')).toBeNull();
    expect(document.getElementById('equipment-swap-modal')).not.toBeNull();
    expect(onResolve).not.toHaveBeenCalled();
  });

  it('Cere swap -> shows deferred coach interpretation toast (mockup verbatim)', () => {
    showEquipmentSwap('X');
    document.querySelector('.swap-text').value = 'note';
    document.querySelector('.swap-submit').click();
    const toast = document.getElementById('swap-toast');
    expect(toast).not.toBeNull();
    expect(toast.textContent).toContain('Caut swap echivalent');
  });

  it('Cere swap -> closes modal + state.currentScreen reset', () => {
    showEquipmentSwap();
    document.querySelector('.swap-text').value = 'note';
    document.querySelector('.swap-submit').click();
    expect(document.getElementById('equipment-swap-modal')).toBeNull();
    expect(state.currentScreen).toBe('antrenor');
  });

  it('Cere swap -> invokes onResolve with action=swap-request + note + exercise', () => {
    const onResolve = vi.fn();
    showEquipmentSwap('Squat', onResolve);
    document.querySelector('.swap-text').value = 'doar bara olympic';
    document.querySelector('.swap-submit').click();
    expect(onResolve).toHaveBeenCalledWith({
      action: 'swap-request',
      note: 'doar bara olympic',
      exerciseName: 'Squat',
    });
  });

  it('Anuleaza -> close + onResolve cancel (NU log)', () => {
    const onResolve = vi.fn();
    showEquipmentSwap('X', onResolve);
    document.querySelector('.swap-cancel').click();
    expect(document.getElementById('equipment-swap-modal')).toBeNull();
    expect(state.currentScreen).toBe('antrenor');
    expect(onResolve).toHaveBeenCalledWith({ action: 'cancel', source: 'cancel' });
    expect(DB.get('equipment-swap-log')).toBeNull();
  });

  it('backdrop tap -> close + onResolve backdrop', () => {
    const onResolve = vi.fn();
    showEquipmentSwap('X', onResolve);
    document.getElementById('equipment-swap-modal').click();
    expect(document.getElementById('equipment-swap-modal')).toBeNull();
    expect(onResolve).toHaveBeenCalledWith({ action: 'cancel', source: 'backdrop' });
  });
});

describe('submitSwapRequest — direct invocation guards', () => {
  it('null note -> no-op', () => {
    submitSwapRequest(null, 'X', () => {});
    expect(DB.get('equipment-swap-log')).toBeNull();
  });

  it('non-string note -> no-op', () => {
    submitSwapRequest(42, 'X', () => {});
    expect(DB.get('equipment-swap-log')).toBeNull();
  });

  it('whitespace-only note -> no-op', () => {
    submitSwapRequest('   ', 'X', () => {});
    expect(DB.get('equipment-swap-log')).toBeNull();
  });

  it('trims note to 500 chars max', () => {
    const long = 'a'.repeat(800);
    submitSwapRequest(long, 'Bench', () => {});
    const log = DB.get('equipment-swap-log');
    expect(log[0].note.length).toBe(500);
  });

  it('falls back to state.currentEx when no exerciseName param', () => {
    state.currentEx = 'Deadlift';
    submitSwapRequest('note', '', () => {});
    const log = DB.get('equipment-swap-log');
    expect(log[0].exerciseName).toBe('Deadlift');
  });
});

describe('DB equipment-swap-log rolling window 90 (Tier 0 ADR 020 alignment)', () => {
  it('rolls at 90 entries', () => {
    const seeded = Array.from({ length: 95 }, (_, i) => ({ date: '2026-05-01', note: `n${i}`, ts: i }));
    DB.set('equipment-swap-log', seeded);

    submitSwapRequest('new note', 'Bench', () => {});
    const log = DB.get('equipment-swap-log');
    expect(log.length).toBe(90);
    expect(log[0].note).toBe('new note');
  });

  it('keeps latest entries on rollover (unshift order)', () => {
    submitSwapRequest('first', 'A', () => {});
    submitSwapRequest('second', 'B', () => {});
    submitSwapRequest('third', 'C', () => {});
    const log = DB.get('equipment-swap-log');
    expect(log[0].note).toBe('third');
    expect(log[1].note).toBe('second');
    expect(log[2].note).toBe('first');
  });
});
