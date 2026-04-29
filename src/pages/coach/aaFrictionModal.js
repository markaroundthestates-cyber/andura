import '../../styles/aa-friction.css';
import { readAllActive } from '../../util/coachDecisionLog.js';

export const FRICTION_PENDING_KEY = 'aa-friction-pending';

// Signal type → user-facing wording. {N} and {dates} interpolated where available.
export const SIGNAL_WORDING = {
  volume_creep:         (n, dates) => `Volume creep: ${n} sesiuni cu volum adăugat după rating ≤2${dates ? ' (' + dates + ')' : ''}`,
  frustration:          (n)        => `Frustration markers: ${n} sesiuni rated 1-2/5`,
  recovery_debt:        (n, weeks) => `Recovery debt: ${n} rest days în ${weeks || '?'} săpt`,
  ignore_recovery:      (n)        => `Ignore recovery: composite fatigue ${n} sesiuni fără volume drop`,
  calorie_acceleration: (n)        => `Calorie acceleration: drop ${n}+ kcal pe 7 zile`,
};

function formatSignal(type) {
  const fn = SIGNAL_WORDING[type];
  // default n=? when metadata not available
  return fn ? fn('?') : type;
}

export function getRecentOverrideCount() {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const recent = readAllActive(e => e.date >= cutoffStr && e.outcome?.aaOverride === true);
    return recent.length;
  } catch {
    return 0;
  }
}

export function generateExpectedPhrase(signalCount, escalated, overrideCount) {
  if (escalated && overrideCount > 0) {
    return `continui peste ${signalCount} signals — a ${overrideCount + 1}-a override în 7 zile`;
  }
  return `continui peste ${signalCount} signals în 14 zile`;
}

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

// Build comparison HTML lists
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

export function showAAFrictionModal(session, ctx) {
  return new Promise((resolve) => {
    const signals = session.aaBlocked?.signals ?? ctx?.autoAggression?.signals ?? [];
    const today = new Date().toISOString().slice(0, 10);

    // Escalation check
    const overrideCount = getRecentOverrideCount();
    const escalated = overrideCount >= 1;

    // State persistence (D8)
    let state = readPendingState();
    if (state) {
      if (state.sessionDate !== today) {
        // stale — clear and regenerate
        clearPendingState();
        state = null;
      }
    }

    if (!state) {
      state = {
        sessionDate: today,
        signals,
        expectedPhrase: generateExpectedPhrase(signals.length, escalated, overrideCount),
        escalated,
      };
      writePendingState(state);
    }

    const activePhrase = state.expectedPhrase;
    const activeEscalated = state.escalated;

    const { origHtml, redHtml } = renderComparisonLists(session);

    const warningText = activeEscalated
      ? '⚠ Override repetat detectat. Friction crescut.'
      : '⚠ A 2-a override în 7 zile escalează friction.';

    // Build DOM
    const backdrop = document.createElement('div');
    backdrop.className = 'aa-friction-backdrop';

    const sheet = document.createElement('div');
    sheet.className = 'aa-friction-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-labelledby', 'aa-friction-title');

    sheet.innerHTML = `
      <div class="aa-friction-handle"></div>
      <h2 id="aa-friction-title">Plan ajustat — ${signals.length} signals detectate</h2>

      <ul class="aa-friction-signals">
        ${signals.map(s => `<li>${formatSignal(s)}</li>`).join('')}
      </ul>

      <p class="aa-friction-context">Pattern de overreaching detectat. Coach-ul propune plan redus 30%.</p>

      <div class="aa-friction-comparison">
        <div class="plan-original">
          <span class="label">Plan inițial</span>
          <ul>${origHtml}</ul>
        </div>
        <div class="plan-reduced">
          <span class="label">Plan redus</span>
          <ul>${redHtml}</ul>
        </div>
      </div>

      <button class="btn-primary btn-cancel">Acceptă plan redus</button>

      <details class="aa-friction-override">
        <summary>Override (typing required)</summary>
        <p class="warning-text">${warningText}</p>
        <p>Tastează exact: <code>${activePhrase}</code></p>
        <input type="text" class="aa-friction-input" placeholder="tastează aici..." autocomplete="off" />
        <button class="btn-override" disabled>Confirm override</button>
      </details>

      <details class="aa-friction-details">
        <summary>Detalii signals</summary>
        <ul class="signals-detailed">
          ${signals.map(s => `<li>${formatSignal(s)}</li>`).join('')}
        </ul>
      </details>
    `;

    backdrop.appendChild(sheet);
    document.body.appendChild(backdrop);

    const inputEl = sheet.querySelector('.aa-friction-input');
    const overrideBtn = sheet.querySelector('.btn-override');
    const cancelBtn = sheet.querySelector('.btn-cancel');
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

    // Typing validation
    inputEl.addEventListener('input', () => {
      const val = inputEl.value.trim().toLowerCase();
      const match = val === activePhrase.trim().toLowerCase();
      overrideBtn.disabled = !match;
    });

    cancelBtn.addEventListener('click', () => {
      cleanup(() => resolve({ action: 'cancel', source: 'accept' }));
    });

    overrideBtn.addEventListener('click', () => {
      if (overrideBtn.disabled) return;
      cleanup(() => resolve({ action: 'override', overrideRationale: activePhrase, source: 'override' }));
    });

    // Backdrop tap — user-dismiss (learning signal for ModalManager)
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) cleanup(() => resolve({ action: 'cancel', source: 'backdrop' }));
    });

    // Swipe-down on handle
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
        cleanup(() => resolve({ action: 'cancel', source: 'swipe' }));
      }
    }, { passive: true });
  });
}
