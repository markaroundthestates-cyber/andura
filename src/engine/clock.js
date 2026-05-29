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

/**
 * Current epoch milliseconds. Default real-clock source for engines.
 * @returns {number}
 */
export function now() {
  return Date.now();
}

/**
 * Current Date object. Default real-clock source for engines.
 * @returns {Date}
 */
export function nowDate() {
  return new Date();
}
