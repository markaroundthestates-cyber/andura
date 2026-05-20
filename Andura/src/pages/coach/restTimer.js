import { $ } from '../../db.js';
import { DP } from '../../engine/dp.js';
import { SYS } from '../../engine/sys.js';
import { COMPOUND_EX, PAUSE_COMPOUND, PAUSE_ISO } from '../../constants.js';
import { toast, beep, beepAlert, speak, showPauseScreen, hidePauseScreen } from '../../ui/ui.js';
import { state } from '../../state.js';
import { updateExCard } from './logging.js';

const INACTIVITY_DELAY = 2 * 60 * 1000;
let inactivityTimer = null;

// SVG ring geometry — matches mockup §rest-timer (r=30 → 2π·30 ≈ 188.5)
export const REST_RING_CIRCUMFERENCE = 188.5;

// Color states — mockup §rest-timer normal stroke #c8412e accent rust
export const REST_RING_COLORS = Object.freeze({
  normal:  '#c8412e',
  warning: '#f5b942',
  urgent:  '#ff4757',
});

const URGENT_PULSE_CLASS = 'rest-urgent-pulse';

/**
 * Render countdown ring + label per mockup §rest-timer V2 design.
 * No-op when SVG scaffolding absent (V1 prod path uses #ps-progress linear bar).
 *
 * @param {number} left — seconds remaining (>= 0)
 * @param {number} total — total pause duration in seconds (> 0)
 * @returns {void}
 */
export function updateRestRing(left, total) {
  if (typeof document === 'undefined' || !total || total <= 0) return;
  const circle = document.getElementById('rest-circle');
  const label = document.getElementById('rest-time');
  if (!circle && !label) return;

  const safeLeft = Math.max(0, Math.min(total, left));
  const pct = safeLeft / total;

  if (circle) {
    const offset = REST_RING_CIRCUMFERENCE * (1 - pct);
    circle.setAttribute('stroke-dashoffset', String(offset));

    let color = REST_RING_COLORS.normal;
    if (pct < 0.10) color = REST_RING_COLORS.urgent;
    else if (pct < 0.30) color = REST_RING_COLORS.warning;
    circle.setAttribute('stroke', color);

    if (pct < 0.10) circle.classList.add(URGENT_PULSE_CLASS);
    else circle.classList.remove(URGENT_PULSE_CLASS);
  }

  if (label) {
    const m = Math.floor(safeLeft / 60);
    const s = safeLeft % 60;
    label.textContent = `${m}:${String(s).padStart(2, '0')}`;
  }
}

export function getSmartPause(ex) {
  const base = COMPOUND_EX.includes(ex) ? PAUSE_COMPOUND : PAUSE_ISO;
  const rir = SYS.getTempo(ex)?.rir ?? 2;
  let adj = 0;
  if (rir <= 1) adj = 30;
  else if (rir <= 2) adj = 0;
  else if (rir <= 3) adj = -15;
  else adj = -30;
  return Math.max(30, base + adj);
}

export function startPause(sec, nextEx = '') {
  stopPause();
  state.pauseTotal = sec; state.pauseLeft = sec;
  $('ps-timer').textContent = sec;
  $('ps-progress').style.width = '100%';
  const recNext = nextEx ? DP.recommend(nextEx) : {};
  $('ps-next').textContent = nextEx ? `URMEAZA: ${nextEx}` : '';
  $('ps-rec-kg').textContent = recNext.kg ? `${recNext.kg} kg` : '';
  $('ps-rec-reps').textContent = recNext.repsTarget ? `${recNext.repsTarget} reps · ${DP.getIntensityLabel(SYS.getTempo(nextEx || '').rir || 2)}` : '';

  showPauseScreen();
  speak(`Pauza de ${sec} secunde.`);

  updateRestRing(state.pauseLeft, state.pauseTotal);

  state.pauseTimer = setInterval(() => {
    state.pauseLeft--;
    $('ps-timer').textContent = state.pauseLeft;
    $('ps-progress').style.width = (state.pauseLeft / state.pauseTotal * 100) + '%';
    updateRestRing(state.pauseLeft, state.pauseTotal);
    if (state.pauseLeft === 10) { beep(660, .1); speak('10 secunde.'); }
    if (state.pauseLeft <= 3 && state.pauseLeft > 0) beep(880, .08);
    if (state.pauseLeft <= 0) {
      state.lastPauseEndedAt = Date.now();
      stopPause(); hidePauseScreen();
      beepAlert();
      speak(`${nextEx || state.currentEx}. Gata!`);
      updateExCard();
    }
  }, 1000);
}

export function stopPause() { clearInterval(state.pauseTimer); state.pauseTimer = null; }

export function skipPause() {
  stopPause();
  hidePauseScreen();
  updateExCard();
  toast('⚠️ Pauza scurta poate reduce performanta la setul urmator', 'var(--accent2)');
}

export function setupInactivity() {
  teardownInactivity();
  const handler = () => {
    if (!state.sessActive) return;
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      const sinceLastRest = Date.now() - (state.lastPauseEndedAt || 0);
      if (state.sessActive && !state.pauseTimer && sinceLastRest > 5 * 60 * 1000) {
        startPause(getSmartPause(state.currentEx || ''), state.currentEx || '');
        toast('⏸ Pauza automata – inactivitate 2 min', 'var(--accent2)');
      }
    }, INACTIVITY_DELAY);
  };
  window._coachInactivityHandler = handler;
  ['click', 'touchstart', 'keydown', 'mousemove'].forEach(ev =>
    document.addEventListener(ev, handler, { passive: true })
  );
  handler();
}

export function teardownInactivity() {
  clearTimeout(inactivityTimer);
  inactivityTimer = null;
  if (window._coachInactivityHandler) {
    ['click', 'touchstart', 'keydown', 'mousemove'].forEach(ev =>
      document.removeEventListener(ev, window._coachInactivityHandler)
    );
    window._coachInactivityHandler = null;
  }
}
