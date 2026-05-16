// Bundle 4 — Tests for refusalCounterModal "permanent?" prompt.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { showRefusalCounterModal, closeRefusalCounterModal } from '../refusalCounterModal.js';
import {
  getSkippedExercises,
  getRefusalCounter,
  incrementRefusal,
} from '../../../engine/schedule/scheduleAdapter.js';

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
});

afterEach(() => {
  closeRefusalCounterModal();
});

describe('refusalCounterModal — render', () => {
  it('mounts modal with id="refusal-counter-modal"', () => {
    showRefusalCounterModal('Cable Curl', 3);
    expect(document.getElementById('refusal-counter-modal')).not.toBeNull();
  });

  it('modal text contains exercise name + count', () => {
    showRefusalCounterModal('Cable Curl', 3);
    const modal = document.getElementById('refusal-counter-modal');
    expect(modal.textContent).toContain('Cable Curl');
    expect(modal.textContent).toContain('3');
    expect(modal.textContent).toContain('Vrei sa nu-l mai propun deloc?');
  });

  it('renders 2 buttons "Da, elimina permanent" + "Nu, propune din nou"', () => {
    showRefusalCounterModal('Cable Curl', 3);
    const modal = document.getElementById('refusal-counter-modal');
    const permBtn = modal.querySelector('.refusal-permanent');
    const keepBtn = modal.querySelector('.refusal-keep');
    expect(permBtn).not.toBeNull();
    expect(keepBtn).not.toBeNull();
    expect(permBtn.textContent).toContain('Da, elimina permanent');
    expect(keepBtn.textContent).toContain('Nu, propune din nou');
  });

  it('idempotent — second call does NOT duplicate modal', () => {
    showRefusalCounterModal('Cable Curl', 3);
    showRefusalCounterModal('Cable Curl', 3);
    expect(document.querySelectorAll('#refusal-counter-modal').length).toBe(1);
  });

  it('rejects empty / invalid exerciseName silently', () => {
    showRefusalCounterModal('', 3);
    showRefusalCounterModal(null, 3);
    expect(document.getElementById('refusal-counter-modal')).toBeNull();
  });

  it('escapes HTML in exercise name (XSS guard)', () => {
    showRefusalCounterModal('<script>alert(1)</script>', 3);
    const modal = document.getElementById('refusal-counter-modal');
    expect(modal.innerHTML).not.toContain('<script>alert');
    expect(modal.innerHTML).toContain('&lt;script&gt;');
  });
});

describe('refusalCounterModal — "Da" button (permanent)', () => {
  it('toggleSkippedExercise called for the exercise', () => {
    incrementRefusal('Cable Curl');
    incrementRefusal('Cable Curl');
    incrementRefusal('Cable Curl');
    showRefusalCounterModal('Cable Curl', 3);
    const permBtn = document.querySelector('.refusal-permanent');
    permBtn.click();
    expect(getSkippedExercises()).toContain('Cable Curl');
  });

  it('refusal counter reset to 0 for that exercise', () => {
    incrementRefusal('Cable Curl');
    incrementRefusal('Cable Curl');
    incrementRefusal('Cable Curl');
    expect(getRefusalCounter()['Cable Curl']).toBe(3);
    showRefusalCounterModal('Cable Curl', 3);
    document.querySelector('.refusal-permanent').click();
    expect(getRefusalCounter()['Cable Curl']).toBeUndefined();
  });

  it('modal closes after click', () => {
    showRefusalCounterModal('Cable Curl', 3);
    document.querySelector('.refusal-permanent').click();
    expect(document.getElementById('refusal-counter-modal')).toBeNull();
  });

  it('invokes onResolve with {action: "permanent"}', () => {
    let resolved = null;
    showRefusalCounterModal('Cable Curl', 3, r => { resolved = r; });
    document.querySelector('.refusal-permanent').click();
    expect(resolved).toEqual({ action: 'permanent', exerciseName: 'Cable Curl' });
  });
});

describe('refusalCounterModal — "Nu" button (keep, reset)', () => {
  it('toggleSkippedExercise NOT called (exercise stays unskipped)', () => {
    incrementRefusal('Cable Curl');
    incrementRefusal('Cable Curl');
    incrementRefusal('Cable Curl');
    showRefusalCounterModal('Cable Curl', 3);
    document.querySelector('.refusal-keep').click();
    expect(getSkippedExercises()).not.toContain('Cable Curl');
  });

  it('refusal counter reset to 0 for that exercise', () => {
    incrementRefusal('Cable Curl');
    incrementRefusal('Cable Curl');
    incrementRefusal('Cable Curl');
    showRefusalCounterModal('Cable Curl', 3);
    document.querySelector('.refusal-keep').click();
    expect(getRefusalCounter()['Cable Curl']).toBeUndefined();
  });

  it('modal closes after click', () => {
    showRefusalCounterModal('Cable Curl', 3);
    document.querySelector('.refusal-keep').click();
    expect(document.getElementById('refusal-counter-modal')).toBeNull();
  });

  it('invokes onResolve with {action: "keep"}', () => {
    let resolved = null;
    showRefusalCounterModal('Cable Curl', 3, r => { resolved = r; });
    document.querySelector('.refusal-keep').click();
    expect(resolved).toEqual({ action: 'keep', exerciseName: 'Cable Curl' });
  });
});

describe('refusalCounterModal — backdrop dismiss', () => {
  it('refusal counter reset (Gigel dismiss treated as "Nu" effect)', () => {
    incrementRefusal('Cable Curl');
    incrementRefusal('Cable Curl');
    incrementRefusal('Cable Curl');
    showRefusalCounterModal('Cable Curl', 3);
    const modal = document.getElementById('refusal-counter-modal');
    modal.click();  // event.target === modal (backdrop)
    expect(getRefusalCounter()['Cable Curl']).toBeUndefined();
  });

  it('toggleSkippedExercise NOT called on backdrop', () => {
    showRefusalCounterModal('Cable Curl', 3);
    const modal = document.getElementById('refusal-counter-modal');
    modal.click();
    expect(getSkippedExercises()).not.toContain('Cable Curl');
  });

  it('invokes onResolve with {action: "dismiss"}', () => {
    let resolved = null;
    showRefusalCounterModal('Cable Curl', 3, r => { resolved = r; });
    document.getElementById('refusal-counter-modal').click();
    expect(resolved).toEqual({ action: 'dismiss', exerciseName: 'Cable Curl' });
  });
});
