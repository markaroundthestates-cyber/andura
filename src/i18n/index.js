// ══ I18N — Translation infrastructure (PRODUCT_STRATEGY §i18n + COG-ARCH §Q5) ═
// Decoupled JSON bundles per ADR; runtime `t(key, vars)` helper cu fallback chain
// + dotted-path key resolution + var interpolation `{name}` syntax.
//
// Locales supported v1: `en` (DEFAULT — 2026-05-28 paradigm flip), `ro` (opt-in
// din Cont > Setari > Limba).
//
// Daniel directive 2026-05-28 verbatim: "Plot twist - nu imi plac sub nici o
// forma denumirile in romana asa ca schimbam complet limba default in engleza
// si lasam romana ca optiune din cont sa ramana limba romana pentru cine vrea".
// Default locale flipped `ro` → `en`. EN bundle no longer carries TODO_EN
// placeholders — strings are clean fitness English (industry-standard
// vocabulary: Workout/Reps/Sets/Body fat etc.). RO bundle stays as-is for
// users who opt in via the Cont language toggle. RO no-diacritics rule
// (D-LEGACY-064) preserved — RO strings remain without diacritics.
//
// ── Public API ──────────────────────────────────────────────────────────────
//
//   t(key, vars?)        → translated string sau key fallback daca missing
//   getCurrentLocale()   → 'ro' | 'en' (auto-detect: localStorage → navigator → 'en')
//   setLocale(locale)    → persist localStorage 'sf.locale' + updates <html lang>
//   _resetI18nCache()    → clear cache (testing only)
//
// ── Lookup chain ────────────────────────────────────────────────────────────
//
//   1. Bundle pentru locale curent
//   2. Bundle pentru 'en' (default fallback — was 'en' even pre-flip)
//   3. Key string itself (last-resort, dev visibility)

import { logger } from '../util/logger.js';
import roBundle from './ro.json';
import enBundle from './en.json';

const BUNDLES = Object.freeze({
  ro: roBundle,
  en: enBundle,
});

const LOCALE_STORAGE_KEY = 'sf.locale';
const DEFAULT_LOCALE = 'en';
const FALLBACK_LOCALE = 'en';

// Locales auto-selectable din navigator.language. Both supported now (was
// `['ro']` only when EN bundle had TODO_EN placeholders — that anti-leak
// guard is no longer needed since EN is translated). User explicit choice via
// setLocale → localStorage takes precedence anyway.
const AUTO_DETECT_LOCALES = Object.freeze(['en', 'ro']);

/** @type {'ro' | 'en' | null} */
let _cachedLocale = null;

// ── Public: t(key, vars?) ───────────────────────────────────────────────────

/**
 * Translate function — returneaza string pentru locale curent.
 *
 * @param {string} key - dotted path (e.g., `'modals.readiness.title'`)
 * @param {Record<string, string|number>} [vars] - vars pentru interpolation `{name}`
 * @returns {string} translated string sau key fallback daca missing
 */
export function t(key, vars = {}) {
  if (typeof key !== 'string' || key.length === 0) return '';

  const locale = getCurrentLocale();
  const bundles = /** @type {Record<string, any>} */ (BUNDLES);

  // Try current locale → fallback locale → key string itself
  const found = _resolve(bundles[locale], key)
    ?? _resolve(bundles[FALLBACK_LOCALE], key)
    ?? null;

  if (found == null) {
    if (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production') {
      logger.warn(`[i18n] Missing key: ${key}`);
    }
    return key;
  }

  return _interpolate(found, vars);
}

// ── Public: getCurrentLocale ────────────────────────────────────────────────

/**
 * Auto-detect locale: localStorage `sf.locale` override → `navigator.language`
 * → fallback `'en'` (DEFAULT_LOCALE). Cached after first call (use
 * `_resetI18nCache()` for tests).
 *
 * @returns {'ro' | 'en'}
 */
export function getCurrentLocale() {
  if (_cachedLocale) return _cachedLocale;
  const bundles = /** @type {Record<string, any>} */ (BUNDLES);

  // 1. localStorage override (user explicit choice)
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE_KEY) : null;
    if (stored && bundles[stored]) {
      _cachedLocale = /** @type {'ro' | 'en'} */ (stored);
      return _cachedLocale;
    }
  } catch { /* private mode etc — ignore */ }

  // 2. navigator.language prefix match — doar locale auto-selectable
  // (AUTO_DETECT_LOCALES = ['en', 'ro'] — ambele auto-detectabile acum ca EN e
  // tradus complet; vechiul excludere `en` nu mai e necesara).
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.language : null;
    if (nav) {
      const prefix = String(nav).slice(0, 2).toLowerCase();
      if (AUTO_DETECT_LOCALES.includes(prefix) && bundles[prefix]) {
        _cachedLocale = /** @type {'ro' | 'en'} */ (prefix);
        return _cachedLocale;
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
 * Also syncs `document.documentElement.lang` so a11y tools + SEO crawlers
 * see the right language (browser/screen-reader pronunciation cue).
 *
 * @param {'ro' | 'en'} locale
 * @returns {boolean} true daca applied, false daca unsupported
 */
export function setLocale(locale) {
  const bundles = /** @type {Record<string, any>} */ (BUNDLES);
  if (!bundles[locale]) return false;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }
  } catch { /* ignore */ }
  _cachedLocale = locale;
  // Sync <html lang> — best-effort; non-DOM env (SSR/jsdom no document) skipped.
  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = locale;
    }
  } catch { /* ignore */ }
  // Notify PERSISTENT components that never re-mount on navigation (e.g. the
  // BottomNav lives in Layout's <Outlet> parent and is never re-rendered when a
  // route re-mounts), so their t() calls re-evaluate against the new bundle. Most
  // screens flip simply by being re-mounted on tab nav; the persistent chrome
  // needs this signal (Daniel audit 2026-06-05: nav stayed English on RO).
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('andura:localechange', { detail: locale }));
    }
  } catch { /* ignore */ }
  return true;
}

/**
 * Sync <html lang> with the current locale. Useful for app boot (call once
 * after i18n module loads) so the initial HTML lang attribute reflects the
 * persisted/detected choice without requiring an explicit setLocale call.
 */
export function syncHtmlLang() {
  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = getCurrentLocale();
    }
  } catch { /* ignore */ }
}

/**
 * Reset cached locale (testing). Forces next `getCurrentLocale()` to re-detect.
 */
export function _resetI18nCache() {
  _cachedLocale = null;
}

/**
 * Resolve a dotted-path key whose VALUE is an array of strings (e.g. the
 * coach-voice pools). Mirror lookup chain of `t()`: current locale → fallback
 * → []. Defensive: filters non-string entries silently. Used by `coachVoice`
 * pickers and any other consumer that needs locale-aware random pools.
 *
 * @param {string} key - dotted path (e.g., `'coachEngine.voice.preset'`)
 * @returns {string[]} array of strings (empty when missing / non-array)
 */
export function tArray(key) {
  if (typeof key !== 'string' || key.length === 0) return [];
  const locale = getCurrentLocale();
  const bundles = /** @type {Record<string, any>} */ (BUNDLES);
  const found = _resolveArray(bundles[locale], key)
    ?? _resolveArray(bundles[FALLBACK_LOCALE], key)
    ?? null;
  if (!Array.isArray(found)) return [];
  return found.filter((/** @type {unknown} */ x) => typeof x === 'string');
}

/** @param {unknown} obj @param {string} path */
function _resolveArray(obj, path) {
  if (!obj || typeof obj !== 'object' || typeof path !== 'string') return null;
  const parts = path.split('.');
  /** @type {any} */
  let cur = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return null;
    cur = cur[part];
  }
  return Array.isArray(cur) ? cur : null;
}

/**
 * Get loaded bundle (testing + introspection only).
 *
 * @param {'ro' | 'en'} locale
 * @returns {object | null}
 */
export function _getBundle(locale) {
  const bundles = /** @type {Record<string, any>} */ (BUNDLES);
  return bundles[locale] ?? null;
}

// ── Internal: dotted-path resolver ──────────────────────────────────────────

/** @param {unknown} obj @param {string} path */
function _resolve(obj, path) {
  if (!obj || typeof obj !== 'object' || typeof path !== 'string') return null;
  const parts = path.split('.');
  /** @type {any} */
  let cur = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return null;
    cur = cur[part];
  }
  return typeof cur === 'string' ? cur : null;
}

// ── Internal: var interpolation `{name}` ────────────────────────────────────

/** @param {string} str @param {Record<string, string | number> | null | undefined} vars */
function _interpolate(str, vars) {
  if (!vars || typeof vars !== 'object') return str;
  return str.replace(/\{(\w+)\}/g, (/** @type {string} */ match, /** @type {string} */ key) => {
    return Object.prototype.hasOwnProperty.call(vars, key)
      ? String(vars[key])
      : match;
  });
}
