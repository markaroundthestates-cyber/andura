// ══ SAFETY BANNER (Foundation 3 — ADR 013 §SAFETY_TRIPWIRE pattern) ═════════
// Reusable presentational component for soft warnings and informational
// notices. Bugatti tone — factual, agency-preserving, NU paternalist.
//
// Severities:
//   - 'info'     informational neutral (e.g. "Pauza face parte din drum.")
//   - 'warning'  caution dar NU alarm (e.g. F-NEW-2 deload skip)
//   - 'critical' rare, doar vital safety (e.g. injury risk — escalation)
//
// Per HANDOVER §29.5 + ADR 013: this is the canonical pattern reused by
// plateau interventions, tier policy edge cases, F-NEW-2 deload skip
// banner, F-NEW-4 plan-ajustat banner. Direct DOM imperative, no framework
// (per ADR 005 vanilla JS).
//
// Per-session dismiss: an optional `dismissId` (string) is stored in
// sessionStorage so the same banner does not re-show after the user
// dismisses it within the same browser session.

const DISMISS_PREFIX = 'safetyBanner_dismissed_';
const VALID_SEVERITIES = Object.freeze(['info', 'warning', 'critical']);

/**
 * Build a safety banner element (detached). Caller is responsible for
 * inserting it into the DOM (e.g., `parent.appendChild(banner.element)`)
 * AND for calling `banner.dispose()` when the banner is removed.
 *
 * @param {object} opts
 * @param {'info'|'warning'|'critical'} opts.severity
 * @param {string} opts.message - Bugatti-tone factual message (no force-typing, no procentage leak).
 * @param {{ label: string, onClick: Function }} [opts.action] - Optional CTA button.
 * @param {string} [opts.dismissId] - Stable id; if set, banner will check sessionStorage on render and skip if dismissed.
 * @param {Storage} [opts.storage] - Override (testing). Defaults to window.sessionStorage when available.
 * @returns {{ element: HTMLElement|null, dismissed: boolean, dispose: Function }}
 *   element=null ONLY when dismissId hits a previously-dismissed key
 *   (caller treats that as no-op).
 */
export function createSafetyBanner(opts) {
  const { severity, message, action, dismissId } = _validateOpts(opts);
  const storage = _resolveStorage(opts.storage);

  if (dismissId && _isDismissed(storage, dismissId)) {
    return { element: null, dismissed: true, dispose: () => {} };
  }

  const el = document.createElement('div');
  el.className = `safety-banner safety-banner--${severity}`;
  el.setAttribute('role', severity === 'critical' ? 'alert' : 'status');
  el.setAttribute('data-severity', severity);
  if (dismissId) el.setAttribute('data-dismiss-id', dismissId);

  const msg = document.createElement('p');
  msg.className = 'safety-banner__message';
  msg.textContent = message;
  el.appendChild(msg);

  const cleanups = [];

  if (action && typeof action.onClick === 'function') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'safety-banner__action';
    btn.textContent = action.label || 'OK';
    const handler = (ev) => action.onClick(ev);
    btn.addEventListener('click', handler);
    cleanups.push(() => btn.removeEventListener('click', handler));
    el.appendChild(btn);
  }

  // Dismiss button is always rendered for non-critical severities; critical
  // banners require explicit consumer action handling (no soft-dismiss).
  let dismissBtn = null;
  if (severity !== 'critical') {
    dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'safety-banner__dismiss';
    dismissBtn.setAttribute('aria-label', 'Închide');
    dismissBtn.textContent = '×';
    const onDismiss = () => {
      if (dismissId) _markDismissed(storage, dismissId);
      el.remove();
    };
    dismissBtn.addEventListener('click', onDismiss);
    cleanups.push(() => dismissBtn.removeEventListener('click', onDismiss));
    el.appendChild(dismissBtn);
  }

  return {
    element: el,
    dismissed: false,
    dispose: () => cleanups.forEach(fn => { try { fn(); } catch {} }),
  };
}

/**
 * Manually clear a per-session dismiss flag (useful when context changes
 * — e.g., F-NEW-3 cooldown override re-arms a banner).
 *
 * @param {string} dismissId
 * @param {Storage} [storage]
 */
export function resetDismiss(dismissId, storage) {
  const s = _resolveStorage(storage);
  if (!s || !dismissId) return;
  try { s.removeItem(DISMISS_PREFIX + dismissId); } catch {}
}

/**
 * Test helper — check if a dismissId is currently marked dismissed.
 *
 * @param {string} dismissId
 * @param {Storage} [storage]
 * @returns {boolean}
 */
export function isDismissed(dismissId, storage) {
  return _isDismissed(_resolveStorage(storage), dismissId);
}

// ── internals ────────────────────────────────────────────────────────────

function _validateOpts(opts) {
  if (!opts || typeof opts !== 'object') {
    throw new TypeError('createSafetyBanner: opts required');
  }
  const { severity, message } = opts;
  if (!VALID_SEVERITIES.includes(severity)) {
    throw new TypeError(`createSafetyBanner: severity must be one of ${VALID_SEVERITIES.join('/')} (got '${severity}')`);
  }
  if (typeof message !== 'string' || message.length === 0) {
    throw new TypeError('createSafetyBanner: message must be a non-empty string');
  }
  return opts;
}

function _resolveStorage(override) {
  if (override) return override;
  try { return typeof window !== 'undefined' ? window.sessionStorage : null; }
  catch { return null; }
}

function _isDismissed(storage, dismissId) {
  if (!storage || !dismissId) return false;
  try { return storage.getItem(DISMISS_PREFIX + dismissId) === '1'; }
  catch { return false; }
}

function _markDismissed(storage, dismissId) {
  if (!storage || !dismissId) return;
  try { storage.setItem(DISMISS_PREFIX + dismissId, '1'); } catch {}
}
