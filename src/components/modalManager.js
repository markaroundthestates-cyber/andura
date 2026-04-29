// ══ MODAL MANAGER — two-category queue (coaching | safety) ══════════════════
// Coaching modals: max 2 active simultaneously; extras queued.
// Safety modals: highest priority, sticky (not user-dismissable), rendered first.
// Dismiss learning: user-dismiss (backdrop/swipe) written to CDL ext field.
//   3 consecutive session-dismissals → isSuppressed() returns true for that modal.
// Compatible Write Rule: no new localStorage keys — dismiss data lives in
//   CDL entry ext.modalDismisses (coach-decisions array, existing key).

import { DB } from '../db.js';

const _COACHING_MAX = 2;

/** @type {Array<{id: string, category: string, sticky: boolean}>} */
const _active = [];

/** @type {Array<object>} */
const _queue = [];

// ── Private helpers ──────────────────────────────────────────────────────────

/**
 * Write a dismiss event to today's CDL entry under ext.modalDismisses.
 * @param {string} modalId
 */
function _logDismiss(modalId) {
  try {
    const today = new Date().toLocaleDateString('sv');
    const entries = DB.get('coach-decisions') ?? [];
    const entry = entries
      .filter(e => e.date === today && !e.superseded)
      .sort((a, b) => b.ts - a.ts)[0];
    if (!entry) return;
    entry.ext = entry.ext ?? {};
    entry.ext.modalDismisses = entry.ext.modalDismisses ?? [];
    entry.ext.modalDismisses.push({ modalId, ts: Date.now(), dismissed: true });
    DB.set('coach-decisions', entries);
  } catch { /* non-blocking — dismiss log is best-effort */ }
}

/**
 * Count how many of the most-recent CDL sessions had a dismiss for modalId,
 * stopping at the first session that did NOT dismiss (consecutive-only).
 * @param {string} modalId
 * @returns {number}
 */
function _getConsecutiveDismissals(modalId) {
  try {
    const entries = (DB.get('coach-decisions') ?? [])
      .filter(e => !e.superseded)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 5);
    let count = 0;
    for (const e of entries) {
      if (e.ext?.modalDismisses?.some(d => d.modalId === modalId && d.dismissed)) {
        count++;
      } else {
        break;
      }
    }
    return count;
  } catch { return 0; }
}

function _processQueue() {
  if (!_queue.length) return;
  const next = _queue.shift();
  _doShow(next);
}

function _deactivate(id) {
  const idx = _active.findIndex(m => m.id === id);
  if (idx !== -1) _active.splice(idx, 1);
  _processQueue();
}

/**
 * Activate a modal config immediately.
 * config.present() must return a Promise that resolves with the result
 * when the user interacts (accept, override, dismiss, etc.).
 * result.source === 'backdrop' | 'swipe' is treated as a learning-dismiss.
 * @param {object} config
 */
function _doShow(config) {
  const entry = {
    id: config.id,
    category: config.category ?? 'coaching',
    sticky: config.sticky ?? false,
  };
  _active.push(entry);

  Promise.resolve().then(async () => {
    try {
      const result = await config.present();
      _deactivate(config.id);
      const isDismiss = result?.source === 'backdrop' || result?.source === 'swipe';
      if (isDismiss && !entry.sticky) _logDismiss(config.id);
      config.onComplete?.(result);
    } catch {
      _deactivate(config.id);
    }
  });
}

// ── Public API ───────────────────────────────────────────────────────────────

export const modalManager = {
  /**
   * Queue and display a modal.
   *
   * @param {{
   *   id: string,
   *   category?: 'coaching' | 'safety',
   *   sticky?: boolean,
   *   present: () => Promise<{ action: string, source?: string, [key: string]: any }>,
   *   onComplete?: (result: any) => void
   * }} config
   */
  show(config) {
    // Test isolation: tests opting out of the AA friction modal can set
    // window._suppressAAFrictionModal = true via addInitScript. This avoids
    // the modal backdrop intercepting clicks on UI under test.
    if (typeof window !== 'undefined'
        && config.id === 'aa-friction'
        && window._suppressAAFrictionModal === true) {
      return;
    }

    // Deduplication: skip if the same id is already active or queued.
    if (_active.some(m => m.id === config.id) || _queue.some(m => m.id === config.id)) {
      return;
    }

    if (config.category === 'safety') {
      // Safety modals always shown immediately, always sticky.
      _doShow({ ...config, sticky: true });
      return;
    }

    // Coaching: max 2 active simultaneously.
    const coaching = _active.filter(m => m.category === 'coaching');
    if (coaching.length >= _COACHING_MAX) {
      _queue.push(config);
      return;
    }
    _doShow(config);
  },

  /**
   * True when the given modal has been user-dismissed (backdrop/swipe) in
   * 3 or more of the most recent consecutive CDL sessions.
   * Engine uses this to skip the modal for the current session.
   * @param {string} modalId
   * @returns {boolean}
   */
  isSuppressed(modalId) {
    return _getConsecutiveDismissals(modalId) >= 3;
  },

  /** Number of currently active modals. */
  get activeCount() { return _active.length; },

  /** Number of modals waiting in queue. */
  get queueLength() { return _queue.length; },
};

export default modalManager;
