// ══ src/router.js — minimal intra-coach router tests ═════════════════════════
// Tests:
//   - navigate(name) mutates state.currentScreen
//   - navigate(name) dispatches 'andura:screen-change' CustomEvent with detail.screen
//   - Sequential navigate() preserves last value
//   - navigate() with empty/invalid arg throws TypeError

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { navigate } from '../router.js';
import { state } from '../state.js';

describe('router — navigate()', () => {
  let originalScreen;

  beforeEach(() => {
    originalScreen = state.currentScreen;
  });

  afterEach(() => {
    state.currentScreen = originalScreen;
  });

  it('sets state.currentScreen to the target screen name', () => {
    navigate('workout');
    expect(state.currentScreen).toBe('workout');
  });

  it("dispatches 'andura:screen-change' event with detail.screen matching arg", () => {
    const listener = vi.fn();
    document.addEventListener('andura:screen-change', listener);
    navigate('energy-check');
    expect(listener).toHaveBeenCalledTimes(1);
    const evt = listener.mock.calls[0][0];
    expect(evt.detail).toEqual({ screen: 'energy-check' });
    document.removeEventListener('andura:screen-change', listener);
  });

  it('sequential navigate() calls preserve the last value', () => {
    navigate('energy-check');
    navigate('ceva-nu-merge');
    navigate('post-rpe');
    expect(state.currentScreen).toBe('post-rpe');
  });

  it('throws TypeError on empty string or non-string arg', () => {
    expect(() => navigate('')).toThrow(TypeError);
    expect(() => navigate(null)).toThrow(TypeError);
    expect(() => navigate(undefined)).toThrow(TypeError);
    expect(() => navigate(42)).toThrow(TypeError);
  });
});

