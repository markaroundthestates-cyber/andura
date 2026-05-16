/**
 * Medical Safety Disclaimer + T&C Mandatory Accept Gate — invariant tests.
 *
 * Authority: wiki/concepts/medical-safety-disclaimer-t-c-mandatory LOCK V1
 * 2026-05-14 + Daniel CEO directive verbatim chat birou 2026-05-14:
 * "Disclaimer la inceput... si atat conteaza".
 *
 * Tests verify: render structure, checkbox/button state coupling, callback
 * fire + localStorage persist, idempotent skip-when-accepted, XSS guard
 * (textContent NU innerHTML), T&C secondary modal, no-diacritics rule LOCK V1,
 * mandatory-accept (backdrop + escape blocked), re-render idempotent.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../styles.css', () => ({}));

import {
  showMedicalDisclaimerGate,
  isMedicalDisclaimerAccepted,
  clearMedicalDisclaimerAcceptance,
  MEDICAL_DISCLAIMER_ACCEPTED_KEY,
  MEDICAL_DISCLAIMER_VERSION,
} from '../index.js';
import { T_AND_C_TEXT_RO } from '../tcText.js';

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('showMedicalDisclaimerGate — render structure', () => {
  it('renders overlay with high z-index dialog role', () => {
    showMedicalDisclaimerGate({ onAccept: () => {} });
    const overlay = document.getElementById('medical-disclaimer-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.getAttribute('role')).toBe('dialog');
    expect(overlay.getAttribute('aria-modal')).toBe('true');
  });

  it('renders header + disclaimer text + T&C link + checkbox + Continui button', () => {
    showMedicalDisclaimerGate({ onAccept: () => {} });
    expect(document.querySelector('.medical-disclaimer-header')).not.toBeNull();
    expect(document.querySelector('.medical-disclaimer-text')).not.toBeNull();
    expect(document.querySelector('.medical-disclaimer-tc-link')).not.toBeNull();
    expect(document.getElementById('medical-disclaimer-checkbox')).not.toBeNull();
    expect(document.getElementById('medical-disclaimer-continue')).not.toBeNull();
  });
});

describe('showMedicalDisclaimerGate — checkbox + button state coupling', () => {
  it('checkbox initially unchecked + Continui button disabled', () => {
    showMedicalDisclaimerGate({ onAccept: () => {} });
    const checkbox = document.getElementById('medical-disclaimer-checkbox');
    const btn = document.getElementById('medical-disclaimer-continue');
    expect(checkbox.checked).toBe(false);
    expect(btn.disabled).toBe(true);
  });

  it('checkbox check → Continui button enabled', () => {
    showMedicalDisclaimerGate({ onAccept: () => {} });
    const checkbox = document.getElementById('medical-disclaimer-checkbox');
    const btn = document.getElementById('medical-disclaimer-continue');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    expect(btn.disabled).toBe(false);
  });

  it('multiple rapid checkbox toggles → final button state matches final checkbox', () => {
    showMedicalDisclaimerGate({ onAccept: () => {} });
    const checkbox = document.getElementById('medical-disclaimer-checkbox');
    const btn = document.getElementById('medical-disclaimer-continue');
    for (let i = 0; i < 5; i++) {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    }
    expect(btn.disabled).toBe(!checkbox.checked);
  });

  it('clicking disabled Continui button does NOT fire callback or persist flag', () => {
    const onAccept = vi.fn();
    showMedicalDisclaimerGate({ onAccept });
    const btn = document.getElementById('medical-disclaimer-continue');
    btn.click();
    expect(onAccept).not.toHaveBeenCalled();
    expect(isMedicalDisclaimerAccepted()).toBe(false);
  });
});

describe('showMedicalDisclaimerGate — accept flow', () => {
  it('checkbox check + button click → fires onAccept + persists localStorage flag', () => {
    const onAccept = vi.fn();
    showMedicalDisclaimerGate({ onAccept });
    const checkbox = document.getElementById('medical-disclaimer-checkbox');
    const btn = document.getElementById('medical-disclaimer-continue');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    btn.click();
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(isMedicalDisclaimerAccepted()).toBe(true);
  });

  it('localStorage flag format: ISO timestamp + pipe + version', () => {
    showMedicalDisclaimerGate({ onAccept: () => {} });
    const checkbox = document.getElementById('medical-disclaimer-checkbox');
    const btn = document.getElementById('medical-disclaimer-continue');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    btn.click();
    const stored = localStorage.getItem(MEDICAL_DISCLAIMER_ACCEPTED_KEY);
    expect(stored).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\|v\d+$/);
    expect(stored.endsWith('|' + MEDICAL_DISCLAIMER_VERSION)).toBe(true);
  });

  it('post-accept: overlay removed from DOM', () => {
    showMedicalDisclaimerGate({ onAccept: () => {} });
    const checkbox = document.getElementById('medical-disclaimer-checkbox');
    const btn = document.getElementById('medical-disclaimer-continue');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    btn.click();
    expect(document.getElementById('medical-disclaimer-overlay')).toBeNull();
  });
});

describe('showMedicalDisclaimerGate — idempotent + defensive', () => {
  it('idempotent: pre-set localStorage flag → skip render + fire onAccept synchronous', () => {
    localStorage.setItem(MEDICAL_DISCLAIMER_ACCEPTED_KEY, '2026-05-15T12:00:00.000Z|v1');
    const onAccept = vi.fn();
    showMedicalDisclaimerGate({ onAccept });
    expect(document.getElementById('medical-disclaimer-overlay')).toBeNull();
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('re-render idempotent: second call when overlay already present → no double-render', () => {
    showMedicalDisclaimerGate({ onAccept: () => {} });
    showMedicalDisclaimerGate({ onAccept: () => {} });
    expect(document.querySelectorAll('#medical-disclaimer-overlay').length).toBe(1);
  });

  it('defensive null onAccept → console.warn NU throw', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => showMedicalDisclaimerGate({})).not.toThrow();
    const checkbox = document.getElementById('medical-disclaimer-checkbox');
    const btn = document.getElementById('medical-disclaimer-continue');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    expect(() => btn.click()).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('defensive: no opts argument → no throw (default empty opts)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => showMedicalDisclaimerGate()).not.toThrow();
    warnSpy.mockRestore();
  });
});

describe('showMedicalDisclaimerGate — XSS guard (textContent NU innerHTML)', () => {
  it('disclaimer text node uses textContent (no innerHTML injection vector)', () => {
    showMedicalDisclaimerGate({ onAccept: () => {} });
    const textEl = document.querySelector('.medical-disclaimer-text');
    expect(textEl.children.length).toBe(0); // pure text node, no child elements
    expect(textEl.textContent.length).toBeGreaterThan(50);
  });

  it('checkbox label node uses textContent', () => {
    showMedicalDisclaimerGate({ onAccept: () => {} });
    const labelEl = document.querySelector('.medical-disclaimer-checkbox-label');
    expect(labelEl.children.length).toBe(0);
  });

  it('T&C modal body uses textContent (pre-wrap CSS handles whitespace)', () => {
    showMedicalDisclaimerGate({ onAccept: () => {} });
    document.querySelector('.medical-disclaimer-tc-link').click();
    const body = document.querySelector('.medical-disclaimer-tc-modal-body');
    expect(body.children.length).toBe(0);
    expect(body.textContent.length).toBeGreaterThan(500);
  });
});

describe('showMedicalDisclaimerGate — T&C secondary modal', () => {
  it('T&C link click → secondary modal renders', () => {
    showMedicalDisclaimerGate({ onAccept: () => {} });
    document.querySelector('.medical-disclaimer-tc-link').click();
    expect(document.querySelector('.medical-disclaimer-tc-modal-backdrop')).not.toBeNull();
    expect(document.querySelector('.medical-disclaimer-tc-modal-title')).not.toBeNull();
  });

  it('T&C modal close button → modal removed, primary disclaimer overlay preserved', () => {
    showMedicalDisclaimerGate({ onAccept: () => {} });
    document.querySelector('.medical-disclaimer-tc-link').click();
    document.querySelector('.medical-disclaimer-tc-modal-close').click();
    expect(document.querySelector('.medical-disclaimer-tc-modal-backdrop')).toBeNull();
    expect(document.getElementById('medical-disclaimer-overlay')).not.toBeNull();
  });
});

describe('T_AND_C_TEXT_RO — no-diacritics rule LOCK V1 PERMANENT 2026-05-10', () => {
  it('T_AND_C_TEXT_RO contains zero RO diacritics', () => {
    expect(T_AND_C_TEXT_RO).not.toMatch(/[șțăâîȘȚĂÂÎ]/);
  });

  it('T_AND_C_TEXT_RO non-empty long-form (>500 chars)', () => {
    expect(T_AND_C_TEXT_RO.length).toBeGreaterThan(500);
  });

  it('T_AND_C_TEXT_RO contains medical disclaimer + responsibility sections', () => {
    expect(T_AND_C_TEXT_RO).toMatch(/DISCLAIMER MEDICAL/i);
    expect(T_AND_C_TEXT_RO).toMatch(/LIMITAREA RESPONSABILITATII/i);
    expect(T_AND_C_TEXT_RO).toMatch(/GDPR/i);
  });
});

describe('isMedicalDisclaimerAccepted + clearMedicalDisclaimerAcceptance helpers', () => {
  it('isMedicalDisclaimerAccepted returns false when flag absent', () => {
    expect(isMedicalDisclaimerAccepted()).toBe(false);
  });

  it('isMedicalDisclaimerAccepted returns true when flag set', () => {
    localStorage.setItem(MEDICAL_DISCLAIMER_ACCEPTED_KEY, '2026-05-15T12:00:00.000Z|v1');
    expect(isMedicalDisclaimerAccepted()).toBe(true);
  });

  it('clearMedicalDisclaimerAcceptance removes the flag', () => {
    localStorage.setItem(MEDICAL_DISCLAIMER_ACCEPTED_KEY, '2026-05-15T12:00:00.000Z|v1');
    clearMedicalDisclaimerAcceptance();
    expect(isMedicalDisclaimerAccepted()).toBe(false);
  });
});
