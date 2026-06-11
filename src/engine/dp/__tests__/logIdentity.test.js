// ══ ID-MIGRATION Phase 2/2b — logIdentity read-side primitives ═══════════════
// loggedRowMatcher / canonicalLoggedName: the getLogs / _loggedExerciseNames seam
// (covered live in dp.idMigration.test.js). loggedNameMatchesCI: the
// stagnationDetector case-insensitive seam. canonicalizeNameKeyedMap: the producer-
// map collapse used by getRefusalPenalties / getSkippedExercises / painSwapMap.
//
// Resolver runs for REAL (nothing mocked) so these fail the day the proven aliases
// are dropped — "Chest Fly" → "Cable Fly" (cable-fly), the 2026-06-10 data remap.

import { describe, it, expect } from 'vitest';
import {
  loggedRowMatcher,
  canonicalLoggedName,
  loggedNameMatchesCI,
  canonicalizeNameKeyedMap,
} from '../logIdentity.js';

describe('canonicalLoggedName', () => {
  it('maps a historical alias to the current canonical name', () => {
    expect(canonicalLoggedName('Chest Fly')).toBe('Cable Fly');
  });
  it('is the identity for an already-canonical name', () => {
    expect(canonicalLoggedName('Cable Fly')).toBe('Cable Fly');
  });
  it('keeps an off-library name verbatim (brand-new lift stays itself)', () => {
    expect(canonicalLoggedName('My Custom Lift')).toBe('My Custom Lift');
  });
});

describe('loggedRowMatcher', () => {
  it('matches a row stored under the alias when querying the canonical', () => {
    const m = loggedRowMatcher('Cable Fly');
    expect(m({ ex: 'Chest Fly' })).toBe(true);
    expect(m({ ex: 'Cable Fly' })).toBe(true);
    expect(m({ ex: 'Lat Pulldown' })).toBe(false);
  });
  it('an unknown query matches only its own exact rows (no false merge)', () => {
    const m = loggedRowMatcher('My Custom Lift');
    expect(m({ ex: 'My Custom Lift' })).toBe(true);
    expect(m({ ex: 'Cable Fly' })).toBe(false);
  });
});

describe('loggedNameMatchesCI', () => {
  it('matches case-insensitively AND by canonical identity', () => {
    const m = loggedNameMatchesCI('Cable Fly');
    expect(m('cable fly')).toBe(true);   // CI exact on the query name
    expect(m('Chest Fly')).toBe(true);   // alias → resolves to the same canonical
    expect(m('Lat Pulldown')).toBe(false);
    expect(m(undefined)).toBe(false);
    // The resolver is exact-key: a mis-cased ALIAS row ("CHEST FLY") resolves to
    // null and is NOT the query name CI either → unmatched (logs store exact names).
    expect(m('CHEST FLY')).toBe(false);
  });
  it('an unknown query matches only its own name, case-insensitively', () => {
    const m = loggedNameMatchesCI('My Custom Lift');
    expect(m('my custom lift')).toBe(true);
    expect(m('Cable Fly')).toBe(false);
  });
});

describe('canonicalizeNameKeyedMap', () => {
  it('folds an alias key and its canonical onto one canonical key via combine', () => {
    const out = canonicalizeNameKeyedMap(
      { 'Chest Fly': 1, 'Cable Fly': 2, 'Lat Pulldown': 5 },
      (a, b) => a + b,
    );
    expect(out).toEqual({ 'Cable Fly': 3, 'Lat Pulldown': 5 });
  });
  it('combine receives (accumulated, incoming) in source order', () => {
    const out = canonicalizeNameKeyedMap(
      { 'Cable Fly': 'first', 'Chest Fly': 'second' },
      (prev, next) => `${prev}|${next}`,
    );
    expect(out['Cable Fly']).toBe('first|second');
  });
  it('does not call combine for a non-colliding key', () => {
    let calls = 0;
    canonicalizeNameKeyedMap({ 'Cable Fly': 1 }, (a, b) => { calls++; return a + b; });
    expect(calls).toBe(0);
  });
  it('keeps off-library keys verbatim', () => {
    const out = canonicalizeNameKeyedMap({ 'My Custom Lift': 9 }, (a, b) => a + b);
    expect(out).toEqual({ 'My Custom Lift': 9 });
  });
  it('non-object input → {}', () => {
    expect(canonicalizeNameKeyedMap(null, (a, b) => a)).toEqual({});
    expect(canonicalizeNameKeyedMap([1, 2], (a, b) => a)).toEqual({});
  });
});
