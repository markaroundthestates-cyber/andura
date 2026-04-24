export const sessionCache = {
  session: null,
  timestamp: null,
  TTL_MS: 5 * 60 * 1000,
  get() {
    if (!this.session) return null;
    if (Date.now() - this.timestamp > this.TTL_MS) { this.session = null; return null; }
    return this.session;
  },
  set(s) { this.session = s; this.timestamp = Date.now(); },
  invalidate() { this.session = null; this.timestamp = null; console.log('[Cache] Director session invalidated'); }
};
if (typeof window !== 'undefined') window._directorCache = sessionCache;

let _cachedDirectorValue = null;
export function getCachedDirector() { return _cachedDirectorValue; }
export function setCachedDirector(s) { _cachedDirectorValue = s; }

export const wakeLockRef = { current: null };
export const uiToggleFlags = { exListExpanded: {}, prWallExpanded: false };
