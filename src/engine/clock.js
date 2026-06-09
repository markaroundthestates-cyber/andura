// ══ CLOCK — injectable wall-clock provider ═══════════════════════════════════
//
// §07.198-204 audit fix — engine compute reads wall-clock directly
// (`new Date()` / `Date.now()`) inside staleness / CUT / target-date branches,
// which makes those date-dependent paths impossible to pin deterministically in
// tests. This tiny module centralizes the real-clock read so engine functions
// can accept an OPTIONAL injected `now` and DEFAULT to the real clock.
//
// BEHAVIOR-PRESERVING invariant: production callers pass nothing → identical to
// the prior inline `Date.now()` / `new Date()`. The default arguments below are
// the ONLY clock source when no injection is provided, so no computed number
// changes. Injection exists solely for deterministic tests.

// Test-only override. PRODUCTION never touches this (no caller sets it), so
// `now()`/`nowDate()` are byte-identical to the prior inline `Date.now()` /
// `new Date()`. A simulated-date journey/test sets it so the date-dependent
// engine paths (DP._returnDeload, weeksElapsed) see simulated time.
let __mockMs = null;

/**
 * Current epoch milliseconds. Default real-clock source for engines.
 * @returns {number}
 */
export function now() {
  return __mockMs == null ? Date.now() : __mockMs;
}

/**
 * Current Date object. Default real-clock source for engines.
 * @returns {Date}
 */
export function nowDate() {
  return __mockMs == null ? new Date() : new Date(__mockMs);
}

/**
 * TEST-ONLY: pin the engine clock to a fixed epoch ms. Never called in prod.
 * @param {number} ms
 */
export function __setClockForTest(ms) {
  __mockMs = ms;
}

/**
 * TEST-ONLY: restore the real wall clock.
 */
export function __resetClockForTest() {
  __mockMs = null;
}
