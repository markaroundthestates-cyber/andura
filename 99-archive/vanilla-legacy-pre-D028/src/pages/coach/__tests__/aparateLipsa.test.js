import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  showAparateLipsa,
  closeAparateLipsaModal,
  APARATE_LIPSA_LABELS,
} from '../aparateLipsa.js';
import {
  VALID_EQUIPMENT_IDS,
  MISSING_EQUIPMENT_KEY,
  getMissingEquipment,
  setMissingEquipment,
} from '../../../engine/schedule/scheduleAdapter.js';
import { state } from '../../../state.js';

describe('aparateLipsa — labels + IDs', () => {
  it('exports a label for every valid equipment ID', () => {
    for (const id of VALID_EQUIPMENT_IDS) {
      expect(APARATE_LIPSA_LABELS[id]).toBeDefined();
      expect(typeof APARATE_LIPSA_LABELS[id]).toBe('string');
      expect(APARATE_LIPSA_LABELS[id].length).toBeGreaterThan(0);
    }
  });

  it('labels are RO-friendly (parity mockup S1.7)', () => {
    expect(APARATE_LIPSA_LABELS['gantere']).toBe('Gantere');
    expect(APARATE_LIPSA_LABELS['banca-inclinata']).toBe('Banca inclinata');
    expect(APARATE_LIPSA_LABELS['aparat-cablu']).toContain('cablu');
  });
});

describe('aparateLipsa — showAparateLipsa modal render', () => {
  beforeEach(() => {
    localStorage.clear();
    state.currentScreen = 'antrenor';
  });
  afterEach(() => {
    closeAparateLipsaModal();
  });

  it('renders modal with id="aparate-lipsa-modal"', () => {
    showAparateLipsa();
    expect(document.getElementById('aparate-lipsa-modal')).not.toBeNull();
  });

  it('sets state.currentScreen = "aparate-lipsa"', () => {
    showAparateLipsa();
    expect(state.currentScreen).toBe('aparate-lipsa');
  });

  it('renders 10 checkboxes (one per VALID_EQUIPMENT_IDS entry)', () => {
    showAparateLipsa();
    const checkboxes = document.querySelectorAll('#aparate-lipsa-modal input[type="checkbox"][data-equipment]');
    expect(checkboxes).toHaveLength(10);
  });

  it('renders each equipment ID as a data-equipment attribute', () => {
    showAparateLipsa();
    const renderedIds = Array.from(
      document.querySelectorAll('#aparate-lipsa-modal input[data-equipment]')
    ).map(cb => cb.dataset.equipment);
    expect(renderedIds.sort()).toEqual([...VALID_EQUIPMENT_IDS].sort());
  });

  it('hydrates checked state from localStorage on render', () => {
    setMissingEquipment(['gantere', 'leg-press']);
    showAparateLipsa();
    const ganterCb = document.querySelector('input[data-equipment="gantere"]');
    const legPressCb = document.querySelector('input[data-equipment="leg-press"]');
    const banciCb = document.querySelector('input[data-equipment="banca-plana"]');
    expect(ganterCb.checked).toBe(true);
    expect(legPressCb.checked).toBe(true);
    expect(banciCb.checked).toBe(false);
  });

  it('hydrates from legacy-mixed storage (filters S1.5 invalid entries)', () => {
    localStorage.setItem(MISSING_EQUIPMENT_KEY, JSON.stringify(['Impins inclinat', 'gantere']));
    showAparateLipsa();
    const ganterCb = document.querySelector('input[data-equipment="gantere"]');
    expect(ganterCb.checked).toBe(true);
  });

  it('idempotent — calling showAparateLipsa twice does not duplicate modal', () => {
    showAparateLipsa();
    showAparateLipsa();
    const modals = document.querySelectorAll('#aparate-lipsa-modal');
    expect(modals).toHaveLength(1);
  });
});

describe('aparateLipsa — toggle persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    state.currentScreen = 'antrenor';
  });
  afterEach(() => {
    closeAparateLipsaModal();
  });

  it('checking a box adds to localStorage', () => {
    showAparateLipsa();
    const cb = document.querySelector('input[data-equipment="gantere"]');
    cb.checked = true;
    cb.dispatchEvent(new Event('change'));
    expect(getMissingEquipment()).toContain('gantere');
  });

  it('unchecking a box removes from localStorage', () => {
    setMissingEquipment(['gantere']);
    showAparateLipsa();
    const cb = document.querySelector('input[data-equipment="gantere"]');
    cb.checked = false;
    cb.dispatchEvent(new Event('change'));
    expect(getMissingEquipment()).not.toContain('gantere');
  });

  it('toggling multiple boxes accumulates list', () => {
    showAparateLipsa();
    for (const id of ['gantere', 'leg-press', 'aparat-cablu']) {
      const cb = document.querySelector(`input[data-equipment="${id}"]`);
      cb.checked = true;
      cb.dispatchEvent(new Event('change'));
    }
    expect(getMissingEquipment().sort()).toEqual(['aparat-cablu', 'gantere', 'leg-press']);
  });
});

describe('aparateLipsa — close behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    state.currentScreen = 'antrenor';
  });

  it('closeAparateLipsaModal removes the modal DOM', () => {
    showAparateLipsa();
    closeAparateLipsaModal();
    expect(document.getElementById('aparate-lipsa-modal')).toBeNull();
  });

  it('closeAparateLipsaModal resets state.currentScreen to "antrenor"', () => {
    showAparateLipsa();
    expect(state.currentScreen).toBe('aparate-lipsa');
    closeAparateLipsaModal();
    expect(state.currentScreen).toBe('antrenor');
  });

  it('Gata button invokes onResolve with action="done" + current list', () => {
    setMissingEquipment(['gantere']);
    let resolved = null;
    showAparateLipsa(r => { resolved = r; });
    document.querySelector('.aparate-close').click();
    expect(resolved).toEqual({ action: 'done', list: ['gantere'] });
  });

  it('backdrop click invokes onResolve with action="cancel"', () => {
    let resolved = null;
    showAparateLipsa(r => { resolved = r; });
    const modal = document.getElementById('aparate-lipsa-modal');
    modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // jsdom Event lacks target propagation control; we simulate by dispatching on modal itself with e.target = modal
    // The actual handler checks e.target === modal — simulate directly:
    const ev = new Event('click', { bubbles: false });
    Object.defineProperty(ev, 'target', { value: modal, writable: false });
    modal.dispatchEvent(ev);
    expect(resolved && resolved.action).toBe('cancel');
  });
});

// ══ Bundle 4 — 2 grupuri (Aparate + Exerciții refuzate permanent) ═══════════

describe('aparateLipsa — Bundle 4 2-grupuri display', () => {
  beforeEach(() => {
    localStorage.clear();
    state.currentScreen = 'antrenor';
  });
  afterEach(() => {
    closeAparateLipsaModal();
  });

  it('renders Grupul 1 "Aparate" section header', () => {
    showAparateLipsa();
    const modal = document.getElementById('aparate-lipsa-modal');
    expect(modal.textContent).toContain('Aparate');
  });

  it('renders Grupul 2 "Exercitii refuzate permanent" section header', () => {
    showAparateLipsa();
    const modal = document.getElementById('aparate-lipsa-modal');
    expect(modal.textContent).toContain('Exercitii refuzate permanent');
  });

  it('Grupul 2 empty state shows Gigel-friendly message when no skipped exercises', () => {
    showAparateLipsa();
    const stack = document.getElementById('exercitii-refuzate-stack');
    expect(stack).not.toBeNull();
    const emptyMarker = stack.querySelector('[data-exercise-empty="true"]');
    expect(emptyMarker).not.toBeNull();
    expect(emptyMarker.textContent).toContain('Nu ai eliminat niciun exercitiu permanent');
  });

  it('Grupul 2 renders dynamic checkbox row per skipped exercise', () => {
    localStorage.setItem('wv2-skipped-exercises', JSON.stringify(['Cable Curl', 'Lateral Raises']));
    showAparateLipsa();
    const stack = document.getElementById('exercitii-refuzate-stack');
    const rows = stack.querySelectorAll('[data-exercise-row]');
    expect(rows.length).toBe(2);
    expect(stack.textContent).toContain('Cable Curl');
    expect(stack.textContent).toContain('Lateral Raises');
  });

  it('Grupul 2 checkboxes are checked by default (debifare-only mode)', () => {
    localStorage.setItem('wv2-skipped-exercises', JSON.stringify(['Cable Curl']));
    showAparateLipsa();
    const cb = document.querySelector('input[type="checkbox"][data-exercise="Cable Curl"]');
    expect(cb).not.toBeNull();
    expect(cb.checked).toBe(true);
  });

  it('Grupul 2 checkbox uncheck → toggleSkippedExercise removes from list', () => {
    localStorage.setItem('wv2-skipped-exercises', JSON.stringify(['Cable Curl']));
    showAparateLipsa();
    const cb = document.querySelector('input[type="checkbox"][data-exercise="Cable Curl"]');
    cb.checked = false;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
    const stored = JSON.parse(localStorage.getItem('wv2-skipped-exercises'));
    expect(stored).not.toContain('Cable Curl');
  });

  it('Grupul 1 + Grupul 2 stacks coexist (separate sections)', () => {
    localStorage.setItem('wv2-skipped-exercises', JSON.stringify(['Cable Curl']));
    showAparateLipsa();
    expect(document.getElementById('aparate-lipsa-stack')).not.toBeNull();
    expect(document.getElementById('exercitii-refuzate-stack')).not.toBeNull();
  });

  it('Grupul 2 escapes HTML in exercise names (XSS guard)', () => {
    localStorage.setItem('wv2-skipped-exercises', JSON.stringify(['<script>alert(1)</script>']));
    showAparateLipsa();
    const stack = document.getElementById('exercitii-refuzate-stack');
    // Real XSS protection check: no actual <script> element parsed in DOM (even though
    // the raw string appears in attribute-value serialization, that's not executable).
    expect(stack.querySelector('script')).toBeNull();
    // Visible text inside <span> must be escaped (entities preserved as text, not parsed).
    const spans = stack.querySelectorAll('span');
    let foundEscaped = false;
    for (const span of spans) {
      if (span.textContent.includes('<script>alert')) foundEscaped = true;  // textContent decodes entities — original raw string visible as text
    }
    expect(foundEscaped).toBe(true);
  });
});
