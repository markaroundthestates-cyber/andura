// ══ UI — Toast, Audio, Flash ════════════════════════════════
import { $ } from '../db.js';
import { state } from '../state.js';

// ── Toast ────────────────────────────────────────────────────
export function toast(msg, color = 'var(--accent)') {
  const t = $('toast'); if (!t) return;
  t.textContent = msg;
  t.style.background = color;
  t.style.color = (color === 'var(--accent)' || color === 'var(--green)') ? '#000' : '#fff';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

// ── Audio ────────────────────────────────────────────────────
let audioCtx = null;
function vibrate(pattern) { if (navigator.vibrate) navigator.vibrate(pattern); }

export function beep(freq = 880, dur = 0.15, vol = 0.3) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = freq; o.type = 'sine';
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}

export function beepDone() { beep(660, .1); setTimeout(() => beep(880, .2), 120); vibrate([50]); }
export function beepAlert() {
  for (let i = 0; i < 3; i++) setTimeout(() => { beep(1100, .12, .5); vibrate([200]); }, i * 200);
}

export function speak(txt) {
  if (state.isMuted || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(txt);
  u.lang = 'ro-RO'; u.rate = 1.1; u.pitch = 1;
  window.speechSynthesis.speak(u);
}

// ── Coach Flash ──────────────────────────────────────────────
export function showCoachFlash(type, title, sub) {
  const flash = $('flash'), ft = $('flash-title'), fs = $('flash-sub');
  if (!flash) return;
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
export function showFlashFeedback(rpe, kg, ex, DP) {
  if (!DP) return; // called without DP context — skip
  const inc = DP.getIncrement(ex);
  const nextUp = DP.roundToStep(kg + inc, ex);
  const nextDn = DP.roundToStep(Math.max(1, kg - inc), ex);
  let type, title, sub;
  if (rpe <= 6)      { type='up'; title=`URMĂTOAREA: ${nextUp} KG`; sub='Prea ușor — crește greutatea'; }
  else if (rpe <= 8) { type='ok'; title='ȚINE GREUTATEA'; sub=`Progres corect · RPE ${rpe}`; }
  else if (rpe === 9){ type='ok'; title='MAI SCOATE REPS'; sub='La limită — nu crești încă'; }
  else               { type='dn'; title=`SCADE LA ${nextDn} KG`; sub='Prea greu — calitate înainte de kilograme'; }
  showCoachFlash(type, title, sub);
}
