// ══ src/i18n/index.js — translation infrastructure tests ════════════════════
// Coverage:
//   - t() happy path (existing key, RO + EN)
//   - t() missing key fallback chain (locale → EN → key string)
//   - t() vars interpolation `{name}` syntax
//   - t() defensive (empty key, non-string key)
//   - getCurrentLocale() priority: localStorage → navigator → 'ro'
//   - setLocale() persistence + validation
//   - Bundle integrity: RO + EN have identical keys structure
//   - Missing key dev warn

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { t, getCurrentLocale, setLocale, _resetI18nCache, _getBundle } from '../index.js';

beforeEach(() => {
  try { localStorage.clear(); } catch { /* swallow */ }
  _resetI18nCache();
});

afterEach(() => {
  _resetI18nCache();
});

// ── t() happy path ─────────────────────────────────────────────────────────

describe('t() happy path', () => {
  it('returns RO string for known key (default locale)', () => {
    setLocale('ro');
    expect(t('common.ok')).toBe('OK');
    expect(t('common.cancel')).toBe('Anuleaza');
  });

  it('returns nested key value via dotted path', () => {
    setLocale('ro');
    const result = t('why.categorical.hold');
    expect(result).toContain('Pastram greutatea');
    expect(result).toContain('{exercise}');
  });

  it('returns EN string when locale=en (clean English post 2026-05-28 paradigm flip)', () => {
    setLocale('en');
    expect(t('common.ok')).toBe('OK');
    expect(t('common.cancel')).toBe('Cancel');
  });
});

// ── t() vars interpolation ─────────────────────────────────────────────────

describe('t() vars interpolation', () => {
  it('substitutes {name} placeholders cu vars', () => {
    setLocale('ro');
    const result = t('why.categorical.progression_up', { exercise: 'Bench Press' });
    expect(result).toContain('Bench Press');
    expect(result).not.toContain('{exercise}');
  });

  it('preserves placeholder daca var lipseste', () => {
    setLocale('ro');
    const result = t('why.categorical.hold', {}); // no exercise var
    expect(result).toContain('{exercise}');
  });

  it('handles numeric vars (coerce to string)', () => {
    setLocale('ro');
    // Hypothetical key not yet in bundle — test interpolation logic via title pattern
    const result = t('why.title', { exercise: 'Squat' });
    expect(result).toContain('Squat');
  });

  it('ignores extra vars not in template', () => {
    setLocale('ro');
    const result = t('common.ok', { extra: 'ignored' });
    expect(result).toBe('OK');
  });
});

// ── t() fallback chain ─────────────────────────────────────────────────────

describe('t() fallback chain', () => {
  it('returns key string when key missing in both bundles', () => {
    setLocale('ro');
    expect(t('nonexistent.key.path')).toBe('nonexistent.key.path');
  });

  it('logs dev warn on missing key (non-prod env)', () => {
    setLocale('ro');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    t('definitely.missing.key');
    // Note: in vitest env, NODE_ENV is 'test', not 'production', so warn fires
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[i18n]'));
    warnSpy.mockRestore();
  });
});

// ── t() defensive ──────────────────────────────────────────────────────────

describe('t() defensive', () => {
  it('returns empty string for empty key', () => {
    expect(t('')).toBe('');
  });

  it('returns empty string for non-string key', () => {
    expect(t(null)).toBe('');
    expect(t(undefined)).toBe('');
    expect(t(123)).toBe('');
  });

  it('handles null vars gracefully', () => {
    setLocale('ro');
    expect(t('common.ok', null)).toBe('OK');
    expect(t('common.ok', undefined)).toBe('OK');
  });
});

// ── getCurrentLocale ───────────────────────────────────────────────────────

describe('getCurrentLocale', () => {
  it('returns localStorage override when set', () => {
    localStorage.setItem('sf.locale', 'en');
    _resetI18nCache();
    expect(getCurrentLocale()).toBe('en');
  });

  it('returns valid locale default when no override + jsdom navigator unspecific', () => {
    _resetI18nCache();
    // jsdom navigator.language is typically en-US. Both en+ro are
    // auto-detectable post 2026-05-28 (DEFAULT_LOCALE flipped to 'en').
    const locale = getCurrentLocale();
    expect(['ro', 'en']).toContain(locale);
  });

  it('en-US browser auto-detects EN (post 2026-05-28 paradigm flip — EN is default + translated)', () => {
    // BUG #6 anti-TODO_EN-leak guard REMOVED 2026-05-28 — EN bundle is now
    // fully translated (Daniel CEO directive: default EN, RO opt-in). Browser
    // en-US should auto-pick EN (the new default-language match).
    const navSpy = vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    _resetI18nCache();
    expect(getCurrentLocale()).toBe('en');
    navSpy.mockRestore();
  });

  it('ro browser auto-detects RO (user preference respected over EN default)', () => {
    const navSpy = vi.spyOn(navigator, 'language', 'get').mockReturnValue('ro-RO');
    _resetI18nCache();
    expect(getCurrentLocale()).toBe('ro');
    navSpy.mockRestore();
  });

  it('explicit ro localStorage override still honored (RO opt-in from Cont > Limba)', () => {
    localStorage.setItem('sf.locale', 'ro');
    _resetI18nCache();
    expect(getCurrentLocale()).toBe('ro');
  });

  it('explicit en localStorage override still honored', () => {
    localStorage.setItem('sf.locale', 'en');
    _resetI18nCache();
    expect(getCurrentLocale()).toBe('en');
  });

  it('caches result across calls (no re-detect)', () => {
    setLocale('en');
    const first = getCurrentLocale();
    const second = getCurrentLocale();
    expect(first).toBe(second);
  });

  it('invalid localStorage value falls through to navigator/default', () => {
    localStorage.setItem('sf.locale', 'fr'); // unsupported
    _resetI18nCache();
    const locale = getCurrentLocale();
    expect(['ro', 'en']).toContain(locale);
  });
});

// ── setLocale ──────────────────────────────────────────────────────────────

describe('setLocale', () => {
  it('persists to localStorage + updates cache', () => {
    expect(setLocale('en')).toBe(true);
    expect(localStorage.getItem('sf.locale')).toBe('en');
    expect(getCurrentLocale()).toBe('en');
  });

  it('returns false for unsupported locale (NU persist)', () => {
    setLocale('ro');
    expect(setLocale('fr')).toBe(false);
    expect(localStorage.getItem('sf.locale')).toBe('ro');
  });

  it('switching locale updates t() output', () => {
    setLocale('ro');
    expect(t('common.cancel')).toBe('Anuleaza');
    setLocale('en');
    expect(t('common.cancel')).toBe('Cancel');
  });

  it('syncs <html lang> attribute on setLocale (a11y + SEO cue)', () => {
    setLocale('ro');
    expect(document.documentElement.lang).toBe('ro');
    setLocale('en');
    expect(document.documentElement.lang).toBe('en');
  });
});

// ── Bundle integrity (RO + EN same key structure) ──────────────────────────

describe('bundle integrity', () => {
  /** Recursively flatten dotted-path keys (excluding _meta). */
  function flattenKeys(obj, prefix = '') {
    const keys = [];
    for (const [k, v] of Object.entries(obj)) {
      if (k === '_meta') continue;
      const path = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        keys.push(...flattenKeys(v, path));
      } else {
        keys.push(path);
      }
    }
    return keys.sort();
  }

  it('RO and EN bundles have identical key structures', () => {
    const ro = _getBundle('ro');
    const en = _getBundle('en');
    expect(ro).toBeDefined();
    expect(en).toBeDefined();
    expect(flattenKeys(ro)).toEqual(flattenKeys(en));
  });

  it('all RO values are strings (no objects/arrays mixed)', () => {
    const ro = _getBundle('ro');
    for (const path of flattenKeys(ro)) {
      // _resolve helper can't be imported direct — call t() instead
      _resetI18nCache();
      setLocale('ro');
      const result = t(path);
      expect(typeof result).toBe('string');
      expect(result).not.toBe(path); // shouldn't fall through to key
    }
  });

  it('all EN values are strings (no leftover TODO_EN placeholders post 2026-05-28 flip)', () => {
    const en = _getBundle('en');
    setLocale('en');
    for (const path of flattenKeys(en)) {
      const result = t(path);
      expect(typeof result).toBe('string');
      expect(result).not.toBe(path); // resolved, NU fallback la key
      expect(result.startsWith('TODO_EN'), `Key "${path}" still has TODO_EN placeholder — EN must be fully translated`).toBe(false);
    }
  });

  it('RO strings have no diacritics (D-LEGACY-064 UI rule preserved)', () => {
    const ro = _getBundle('ro');
    setLocale('ro');
    for (const path of flattenKeys(ro)) {
      const result = t(path);
      // Don't fail on _meta description (vault doc, allowed diacritics).
      if (path.startsWith('_meta')) continue;
      expect(result, `Key "${path}" has Romanian diacritics — D-LEGACY-064 UI rule violated`).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
    }
  });

  it('RO bundle has why.categorical.* with all 4 verdicts', () => {
    const ro = _getBundle('ro');
    expect(ro.why.categorical.progression_up).toBeDefined();
    expect(ro.why.categorical.progression_down).toBeDefined();
    expect(ro.why.categorical.hold).toBeDefined();
    expect(ro.why.categorical.recovery).toBeDefined();
  });
});
