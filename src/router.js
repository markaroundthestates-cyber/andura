// src/router.js — minimal intra-coach router for Antrenor V2 sub-pages (energy-check, cause, ceva-nu-merge, pain-button, equipment-swap, workout, post-rpe). Replaces mockup goto() global pattern.

import { state } from './state.js';

/**
 * Navigate to a named screen.
 * Mutates state.currentScreen and dispatches `andura:screen-change` event on `document`.
 *
 * @param {string} screenName — Target screen identifier (e.g. 'antrenor', 'workout', 'energy-check').
 * @returns {void}
 * @throws {TypeError} If screenName is not a non-empty string.
 */
export function navigate(screenName) {
  if (typeof screenName !== 'string' || screenName.length === 0) {
    throw new TypeError('navigate(screenName): screenName must be a non-empty string');
  }
  state.currentScreen = screenName;
  document.dispatchEvent(new CustomEvent('andura:screen-change', { detail: { screen: screenName } }));
}

/**
 * Navigate back to the previous screen.
 * @returns {void}
 */
export function back() {
  // TODO Step 5 (workout exit) — implement back-stack pop. Current stub no-op.
}
