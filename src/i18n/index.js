// ══ I18N — Translation infrastructure (PRODUCT_STRATEGY §i18n + COG-ARCH §Q5) ═
// Decoupled JSON bundles per ADR; runtime `t(key, vars)` helper cu fallback chain
// + dotted-path key resolution + var interpolation `{name}` syntax.
//
// Locales supported v1: `ro` (default), `en` (placeholder cu TODO_EN markers
// pentru Daniel translation work).
//
// ── Public API ──────────────────────────────────────────────────────────────
//
//   t(key, vars?)        → translated string sau key fallback dacă missing
//   getCurrentLocale()   → 'ro' | 'en' (auto-detect: localStorage → navigator → 'ro')
//   setLocale(locale)    → persist localStorage 'sf.locale'
//   _resetI18nCache()    → clear cache (testing only)
//
// ── Lookup chain ────────────────────────────────────────────────────────────
//
//   1. Bundle pentru locale curent
//   2. Bundle pentru 'en' (default fallback)
//   3. Key string itself (last-resort, dev visibility)

import roBundle from './ro.json';
import enBundle from './en.json';

const BUNDLES = Object.freeze({
  ro: roBundle,
  en: enBundle,
});

const LOCALE_STORAGE_KEY = 'sf.locale';
const DEFAULT_LOCALE = 'ro';
const FALLBACK_LOCALE = 'en';

let _cachedLocale = null;

// ── Public: t(key, vars?) ───────────────────────────────────────────────────

/**
 * Translate function — returnează string pentru locale curent.
 *
 * @param {string} key - dotted path (e.g., `'modals.readiness.title'`)
 * @param {Record<string, string|number>} [vars] - vars pentru interpolation `{name}`
 * @returns {string} translated string sau key fallback dacă missing
 */
export function t(key, vars = {}) {
  if (typeof key !== 'string' || key.length === 0) return '';

  const locale = getCurrentLocale();

  // Try current locale → fallback locale → key string itself
  const found = _resolve(BUNDLES[locale], key)
    ?? _resolve(BUNDLES[FALLBACK_LOCALE], key)
    ?? null;

  if (found == null) {
    if (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production') {
      console.warn(`[i18n] Missing key: ${key}`);
    }
    return key;
  }

  return _interpolate(found, vars);
}

// ── Public: getCurrentLocale ────────────────────────────────────────────────

/**
 * Auto-detect locale: localStorage `sf.locale` override → `navigator.language`
 * → fallback `'ro'`. Cached after first call (use `_resetI18nCache()` for tests).
 *
 * @returns {'ro' | 'en'}
 */
export function getCurrentLocale() {
  if (_cachedLocale) return _cachedLocale;

  // 1. localStorage override (user explicit choice)
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE_KEY) : null;
    if (stored && BUNDLES[stored]) {
      _cachedLocale = stored;
      return stored;
    }
  } catch { /* private mode etc — ignore */ }

  // 2. navigator.language prefix match
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.language : null;
    if (nav) {
      const prefix = String(nav).slice(0, 2).toLowerCase();
      if (BUNDLES[prefix]) {
        _cachedLocale = prefix;
        return prefix;
      }
    }
  } catch { /* ignore */ }

  // 3. Default
  _cachedLocale = DEFAULT_LOCALE;
  return DEFAULT_LOCALE;
}

// ── Public: setLocale ──────────────────────────────────────────────────────

/**
 * Set + persist user locale override. Validates against supported bundles.
 *
 * @param {'ro' | 'en'} locale
 * @returns {boolean} true dacă applied, false dacă unsupported
 */
export function setLocale(locale) {
  if (!BUNDLES[locale]) return false;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }
  } catch { /* ignore */ }
  _cachedLocale = locale;
  return true;
}

/**
 * Reset cached locale (testing). Forces next `getCurrentLocale()` to re-detect.
 */
export function _resetI18nCache() {
  _cachedLocale = null;
}

/**
 * Get loaded bundle (testing + introspection only).
 *
 * @param {'ro' | 'en'} locale
 * @returns {object | null}
 */
export function _getBundle(locale) {
  return BUNDLES[locale] ?? null;
}

// ── Internal: dotted-path resolver ──────────────────────────────────────────

function _resolve(obj, path) {
  if (!obj || typeof obj !== 'object' || typeof path !== 'string') return null;
  const parts = path.split('.');
  let cur = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return null;
    cur = cur[part];
  }
  return typeof cur === 'string' ? cur : null;
}

// ── Internal: var interpolation `{name}` ────────────────────────────────────

function _interpolate(str, vars) {
  if (!vars || typeof vars !== 'object') return str;
  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(vars, key)
      ? String(vars[key])
      : match;
  });
}
