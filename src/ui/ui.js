// ══ UI — Toast, Audio, Flash ════════════════════════════════
import { $ } from '../db.js';
import { state } from '../state.js';

// ── Toast ────────────────────────────────────────────────────
/**
 * @param {string} msg
 * @param {string} [color]
 */
export function toast(msg, color = 'var(--accent)') {
  const t = $('toast'); if (!t) return;
  t.textContent = msg;
  t.style.background = color;
  t.style.color = (color === 'var(--accent)' || color === 'var(--green)') ? '#000' : '#fff';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

// ── Audio ────────────────────────────────────────────────────
/** @type {AudioContext | null} */
let audioCtx = null;
/** @param {number | number[]} pattern */
function vibrate(pattern) { if (navigator.vibrate) navigator.vibrate(pattern); }

export function beep(freq = 880, dur = 0.15, vol = 0.3) {
  try {
    if (!audioCtx) {
      const Ctor = window.AudioContext
        || /** @type {typeof AudioContext | undefined} */ (/** @type {any} */ (window).webkitAudioContext);
      if (!Ctor) return;
      audioCtx = new Ctor();
    }
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = freq; o.type = 'sine';
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch {}
}

export function beepDone() { beep(660, .1); setTimeout(() => beep(880, .2), 120); vibrate([50]); }
export function beepAlert() {
  for (let i = 0; i < 3; i++) setTimeout(() => { beep(1100, .12, .5); vibrate([200]); }, i * 200);
}

/** @param {string} txt */
export function speak(txt) {
  if (state.isMuted || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(txt);
  u.lang = 'ro-RO'; u.rate = 1.1; u.pitch = 1;
  window.speechSynthesis.speak(u);
}

// ── Coach Flash ──────────────────────────────────────────────
/**
 * @param {'up'|'ok'|'dn'|string} type
 * @param {string} title
 * @param {string} sub
 */
export function showCoachFlash(type, title, sub) {
  const flash = $('flash'), ft = $('flash-title'), fs = $('flash-sub');
  if (!flash) return;
  /** @type {Record<string, string>} */
  const colors = { up: 'var(--green)', ok: 'var(--accent)', dn: 'var(--red)' };
  const color = colors[type] || 'var(--accent)';
  flash.style.display = 'block';
  flash.style.borderColor = color;
  flash.style.background = color + '15';
  if (ft) { ft.style.color = color; ft.textContent = title; }
  if (fs) { fs.style.color = 'var(--text2)'; fs.textContent = sub; }
  setTimeout(() => { flash.style.display = 'none'; }, 2800);
}

// showFlashFeedback is in coach.js to avoid circular dep with DP
export function showPauseScreen() { const el = $('pause-screen'); if (el) el.style.display = 'flex'; }
export function hidePauseScreen() { const el = $('pause-screen'); if (el) el.style.display = 'none'; }

// showFlashFeedback — here to avoid circular with DP engine
// Called from coach.js which has DP imported already
// Kept as pass-through — coach.js will use showCoachFlash directly
/**
 * @param {number} rpe
 * @param {number} kg
 * @param {string} ex
 * @param {{ getIncrement: (ex: string) => number, roundToStep: (kg: number, ex: string) => number } | null | undefined} DP
 */
export function showFlashFeedback(rpe, kg, ex, DP) {
  if (!DP) return; // called without DP context — skip
  const inc = DP.getIncrement(ex);
  const nextUp = DP.roundToStep(kg + inc, ex);
  const nextDn = DP.roundToStep(Math.max(1, kg - inc), ex);
  let type, title, sub;
  if (rpe <= 6)      { type='up'; title=`URMATOAREA: ${nextUp} KG`; sub='Prea usor — creste greutatea'; }
  else if (rpe <= 8) { type='ok'; title='TINE GREUTATEA'; sub=`Progres corect · RPE ${rpe}`; }
  else if (rpe === 9){ type='ok'; title='MAI SCOATE REPS'; sub='La limita — nu cresti inca'; }
  else               { type='dn'; title=`SCADE LA ${nextDn} KG`; sub='Prea greu — calitate inainte de kilograme'; }
  showCoachFlash(type, title, sub);
}
