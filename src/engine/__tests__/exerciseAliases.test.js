// ══ CANONICAL ALIAS MAP — resolveCanonical (#6) ═══════════════════════════════
// Guards the root fix for the name-key bug class (b32abac3 + 981c48e4): any inbound
// name (EN canonical | RO display | legacy synonym) resolves to ONE canonical
// engineName the engine reads. ADDITIVE: already-canonical names are the IDENTITY.

import { describe, it, expect } from 'vitest';
import { resolveCanonical, isAlias, EXPLICIT_ALIASES, RO_DISPLAY_ALIASES } from '../exerciseAliases.js';
import { EXERCISE_METADATA } from '../exerciseLibrary.js';

describe('resolveCanonical — alias → canonical engineName', () => {
  it('IDENTITY for an already-canonical engineName (the common, byte-identical case)', () => {
    // Every real library key resolves to ITSELF — EXCEPT the audited fold list
    // (untagged long-tail synonyms intentionally folded to a CORE_AUTO). No
    // canonical is renamed.
    for (const key of Object.keys(EXERCISE_METADATA)) {
      if (Object.prototype.hasOwnProperty.call(EXPLICIT_ALIASES, key)) continue;
      expect(resolveCanonical(key)).toBe(key);
    }
  });

  it('STRICT INVARIANT: no CORE_AUTO canonical is ever an EXPLICIT_ALIASES fold key', () => {
    // The fold list may only contain untagged long-tail duplicates — never a
    // curated CORE_AUTO staple (else its identity would be silently overridden).
    for (const aliasKey of Object.keys(EXPLICIT_ALIASES)) {
      const meta = EXERCISE_METADATA[aliasKey];
      if (meta) {
        expect(meta.status, `"${aliasKey}" is folded but is CORE_AUTO`).not.toBe('CORE_AUTO');
      }
    }
  });

  it('resolves the legacy pre-F-1 display synonyms to their CORE_AUTO canonical', () => {
    expect(resolveCanonical('Pushdown')).toBe('Cable Triceps Pushdown Straight Bar');
    expect(resolveCanonical('Overhead Triceps')).toBe('Cable Overhead Triceps Extension Rope');
    expect(resolveCanonical('Lateral Raises')).toBe('DB Lateral Raise');
    expect(resolveCanonical('Lateral Raises (cable)')).toBe('Cable Lateral Raise');
    expect(resolveCanonical('Face Pulls')).toBe('Face Pull');
    expect(resolveCanonical('Hammer Curl')).toBe('DB Hammer Curl Standing');
    expect(resolveCanonical('Pec Deck')).toBe('Pec Deck / Cable Fly');
  });

  it('resolves the doc-enumerated Low Bar alias to the High Bar canonical', () => {
    expect(resolveCanonical('Barbell Back Squat (Low Bar)')).toBe('Barbell Back Squat (High Bar)');
  });

  it('resolves an RO display name to its EN canonical (the b32abac3 strand)', () => {
    // The exact pairs the #41 guard names as the trap.
    expect(resolveCanonical('Impins din piept plat cu bara')).toBe('Flat Barbell Bench');
    expect(resolveCanonical('Impins plat cu gantere')).toBe('Flat DB Press');
    expect(resolveCanonical('Genuflexiuni cu bara sus')).toBe('Barbell Back Squat (High Bar)');
    expect(resolveCanonical('Ridicari laterale cu gantere')).toBe('DB Lateral Raise');
  });

  it('PASSTHROUGH for an unknown name (never strands a new exercise)', () => {
    expect(resolveCanonical('Totally Made Up Lift 9000')).toBe('Totally Made Up Lift 9000');
  });

  it('is defensive on non-string / empty input (never throws)', () => {
    expect(resolveCanonical('')).toBe('');
    // @ts-expect-error runtime guard
    expect(resolveCanonical(undefined)).toBe(undefined);
    // @ts-expect-error runtime guard
    expect(resolveCanonical(null)).toBe(null);
  });

  it('isAlias only true for names that remap', () => {
    expect(isAlias('Pushdown')).toBe(true);
    expect(isAlias('Flat DB Press')).toBe(false); // canonical
    expect(isAlias('Totally Made Up Lift 9000')).toBe(false); // unknown passthrough
  });
});

describe('alias-map data integrity — single-hop, every value is a real canonical', () => {
  it('every EXPLICIT_ALIASES value is a real library key', () => {
    for (const [alias, canonical] of Object.entries(EXPLICIT_ALIASES)) {
      expect(
        Object.prototype.hasOwnProperty.call(EXERCISE_METADATA, canonical),
        `EXPLICIT_ALIASES["${alias}"] → "${canonical}" is not a library key`
      ).toBe(true);
    }
  });

  it('every generated RO_DISPLAY_ALIASES value is a real library key', () => {
    for (const [ro, canonical] of Object.entries(RO_DISPLAY_ALIASES)) {
      expect(
        Object.prototype.hasOwnProperty.call(EXERCISE_METADATA, canonical),
        `RO_DISPLAY_ALIASES["${ro}"] → "${canonical}" is not a library key`
      ).toBe(true);
    }
  });

  it('single-hop: no alias VALUE is itself an alias key (no transitive loop)', () => {
    for (const value of Object.values(EXPLICIT_ALIASES)) {
      expect(resolveCanonical(value)).toBe(value);
    }
    for (const value of Object.values(RO_DISPLAY_ALIASES)) {
      expect(resolveCanonical(value)).toBe(value);
    }
  });

  it('no explicit fold is a self-loop (alias key !== its canonical value)', () => {
    for (const [alias, canonical] of Object.entries(EXPLICIT_ALIASES)) {
      expect(alias).not.toBe(canonical);
    }
  });
});
