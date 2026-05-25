import '../../styles/aa-friction.css';

// ── Storage keys ─────────────────────────────────────────────────────────────
//
// FRICTION_PENDING_KEY — short-lived state used during the modal lifecycle
// (cleared on cleanup). Retained for tests that import it.
//
// FRICTION_DISMISSED_DATE_KEY — calendar-day persistence:
//   When user dismisses (backdrop / swipe / override), we write today's date.
//   On the next render we check the value: if it equals today, we skip the
//   modal entirely. Reset is implicit via the date rolling forward — i.e. the
//   next calendar day, the value no longer matches and the modal can show
//   again. A real session START (separate event) also resets the gate.

export const FRICTION_PENDING_KEY = 'aa-friction-pending';
export const FRICTION_DISMISSED_DATE_KEY = 'aa-friction-dismissed-date';

function todayLocalDateStr() {
  return new Date().toLocaleDateString('sv'); // YYYY-MM-DD, local timezone
}

/**
 * True when the user has already dismissed the friction modal today.
 * Caller (renderIdle) should skip showing the modal in that case.
 */
export function isAAFrictionDismissedToday() {
  try {
    return localStorage.getItem(FRICTION_DISMISSED_DATE_KEY) === todayLocalDateStr();
  } catch {
    return false;
  }
}

/**
 * Mark the modal as dismissed for today. Persists across page refreshes.
 * Called for every "user did not accept the reduced plan" outcome:
 *   - backdrop tap, swipe-down, or override click.
 * NOT called for the "Accepta plan redus" button (that is acceptance, not dismiss).
 */
export function markAAFrictionDismissedToday() {
  try {
    localStorage.setItem(FRICTION_DISMISSED_DATE_KEY, todayLocalDateStr());
  } catch { /* storage full — soft fail */ }
}

/** Test/admin escape hatch — clear the per-day dismiss flag. */
export function clearAAFrictionDismissedDate() {
  try {
    localStorage.removeItem(FRICTION_DISMISSED_DATE_KEY);
  } catch { /* swallow */ }
}

// ── Pending state (modal lifecycle) ──────────────────────────────────────────

export function isAAFrictionPending() {
  try {
    return localStorage.getItem(FRICTION_PENDING_KEY) !== null;
  } catch {
    return false;
  }
}

function writePendingState(state) {
  try {
    localStorage.setItem(FRICTION_PENDING_KEY, JSON.stringify(state));
  } catch { /* degraded — storage full */ }
}

function clearPendingState() {
  try {
    localStorage.removeItem(FRICTION_PENDING_KEY);
  } catch { /* degraded */ }
}

function readPendingState() {
  try {
    const raw = localStorage.getItem(FRICTION_PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Comparison list rendering ────────────────────────────────────────────────

function renderComparisonLists(session) {
  const reduced = session.exercises ?? [];
  const original = reduced.map(e => ({ ...e, sets: e.aaOriginalSets ?? e.sets }));

  const origHtml = original.map(e =>
    `<li>${e.name ?? e.ex ?? '?'} ${e.sets}×${e.reps || 8}</li>`
  ).join('');
  const redHtml = reduced.map(e =>
    `<li>${e.name ?? e.ex ?? '?'} ${e.sets}×${e.reps || 8}</li>`
  ).join('');

  return { origHtml, redHtml };
}

// ── Public modal entry point ─────────────────────────────────────────────────

export function showAAFrictionModal(session /*, ctx */) {
  return new Promise((resolve) => {
    const today = todayLocalDateStr();

    // Lifecycle state — pending key only used to survive an in-progress
    // modal across an accidental refresh on the same day.
    let state = readPendingState();
    if (state && state.sessionDate !== today) {
      clearPendingState();
      state = null;
    }
    if (!state) {
      state = { sessionDate: today };
      writePendingState(state);
    }

    const { origHtml, redHtml } = renderComparisonLists(session);

    // Build DOM
    const backdrop = document.createElement('div');
    backdrop.className = 'aa-friction-backdrop';

    const sheet = document.createElement('div');
    sheet.className = 'aa-friction-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-labelledby', 'aa-friction-title');

    sheet.innerHTML = `
      <div class="aa-friction-handle"></div>
      <h2 id="aa-friction-title">Plan ajustat — recovery</h2>

      <p class="aa-friction-context">
        Coach-ul observa oboseala acumulata. Plan redus 30% astazi pentru recovery.
      </p>

      <div class="aa-friction-comparison">
        <div class="plan-original">
          <span class="label">Plan initial</span>
          <ul>${origHtml}</ul>
        </div>
        <div class="plan-reduced">
          <span class="label">Plan redus</span>
          <ul>${redHtml}</ul>
        </div>
      </div>

      <button class="btn-primary btn-cancel">Accepta plan redus</button>
      <button class="btn-override-simple">Override (inteleg riscurile)</button>

      <details class="aa-friction-more">
        <summary>Mai multe?</summary>
        <p>Coach-ul ajusteaza automat cand vede pattern-uri de oboseala. Te ajuta sa eviti accidentari.</p>
      </details>
    `;

    backdrop.appendChild(sheet);
    document.body.appendChild(backdrop);

    const cancelBtn = sheet.querySelector('.btn-cancel');
    const overrideBtn = sheet.querySelector('.btn-override-simple');
    const handle = sheet.querySelector('.aa-friction-handle');

    let resolved = false;

    function cleanup(cb) {
      if (resolved) return;
      resolved = true;
      clearPendingState();
      sheet.classList.add('slide-down');
      setTimeout(() => {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        cb();
      }, 200);
    }

    // "Accepta plan redus" — accept = NOT a dismiss; do not write the day flag.
    cancelBtn.addEventListener('click', () => {
      cleanup(() => resolve({ action: 'cancel', source: 'accept' }));
    });

    // Single-click override — silent learning continues via CDL ext.
    overrideBtn.addEventListener('click', () => {
      markAAFrictionDismissedToday();
      cleanup(() => resolve({ action: 'override', source: 'override-button' }));
    });

    // Backdrop tap — dismiss, learn.
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        markAAFrictionDismissedToday();
        cleanup(() => resolve({ action: 'cancel', source: 'backdrop' }));
      }
    });

    // Swipe-down on handle — dismiss, learn.
    let touchStartY = 0;
    let swipeCancelled = false;

    handle.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      swipeCancelled = false;
    }, { passive: true });

    handle.addEventListener('touchmove', (e) => {
      if (swipeCancelled || resolved) return;
      const delta = e.touches[0].clientY - touchStartY;
      if (delta > 100) {
        swipeCancelled = true;
        markAAFrictionDismissedToday();
        cleanup(() => resolve({ action: 'cancel', source: 'swipe' }));
      }
    }, { passive: true });
  });
}
