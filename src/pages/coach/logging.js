import { DB, $, tod } from '../../db.js';
import { EX_SETS } from '../../constants.js';
import { DP } from '../../engine/dp.js';
import { AA } from '../../engine/aa.js';
import { SYS } from '../../engine/sys.js';
import { toast, beep, beepDone, speak } from '../../ui/ui.js';
import { getSmartPause, startPause } from './restTimer.js';
import { getTodayExercises, getExGroup, resetNotes } from './util.js';
import { state } from '../../state.js';
import { saveDraft, endSession, updateSessionProgress } from './session.js';

export function updateExCard() {
  if (!state.currentEx) return;
  const rec = AA.applyTo(DP.recommend(state.currentEx), state.currentEx);
  const totalSets = EX_SETS[state.currentEx] || 3;
  const tempo = SYS.getTempo(state.currentEx);
  const techniques = SYS.getTechniques(state.currentEx, state.currentSet, totalSets);

  const grp = getExGroup(state.currentEx);
  const glEl = $('ex-group-label'); if (glEl) glEl.textContent = grp;
  const ndEl = $('ex-name-display'); if (ndEl) ndEl.textContent = state.currentEx;

  const pb = $('progression-badge');
  if (pb) { pb.textContent = rec.statusLabel; pb.style.background = rec.statusColor + '22'; pb.style.color = rec.statusColor; pb.style.border = `1px solid ${rec.statusColor}44`; }

  const kbEl = $('rec-kg-big');
  if (kbEl) { kbEl.textContent = rec.kg; kbEl.style.color = rec.status === 'TOO HEAVY' ? 'var(--red)' : rec.status === 'INCREASE' ? 'var(--green)' : 'var(--accent)'; }
  const rbEl = $('rec-reps-big'); if (rbEl) rbEl.textContent = rec.repsTarget;
  const rirEl = $('rec-rir');
  if (rirEl) rirEl.textContent = DP.getIntensityLabel(tempo?.rir ?? rec.rir ?? 2);
  const sbEl = $('rec-set-big'); if (sbEl) sbEl.textContent = state.currentSet;
  const stEl = $('rec-set-total'); if (stEl) stEl.textContent = `din ${totalSets}`;

  const lastLog = DP.getLogs(state.currentEx, 1)[0];
  const lastPerfEl = $('last-perf');
  if (lastPerfEl) {
    lastPerfEl.style.display = 'block';
    lastPerfEl.textContent = lastLog ? `Last: ${lastLog.w}kg × ${lastLog.reps || '?'} reps` : 'Prima sesiune la acest exercițiu';
  }

  let tempoTxt = `Tempo: ${tempo.tempo} · ${tempo.note}`;
  if (techniques.length) tempoTxt += ` · ${techniques[0].icon} ${techniques[0].label}`;
  if (rec.technique) tempoTxt = `⚡ ${rec.technique} · ${tempoTxt}`;
  const tempoRowEl = $('tempo-row');
  if (tempoRowEl) { tempoRowEl.textContent = tempoTxt; tempoRowEl.style.display = 'block'; }

  const msg = $('coach-msg-box');
  if (msg) {
    if (rec.autoAdjusted) {
      msg.style.display = 'block';
      msg.textContent = rec.autoAdjustMsg.includes('scad') ? `⚙️ AUTO: TOO HEAVY → −${DP.getIncrement(state.currentEx)}kg` : `⚙️ AUTO: TOO EASY → +${DP.getIncrement(state.currentEx)}kg`;
      msg.style.background = rec.autoAdjustColor + '15';
      msg.style.color = rec.autoAdjustColor;
      msg.style.border = `2px solid ${rec.autoAdjustColor}44`;
    } else if (rec.progressionStage >= 2) {
      msg.style.display = 'block';
      msg.textContent = rec.progressionNote;
      msg.style.background = rec.statusColor + '15';
      msg.style.color = rec.statusColor;
      msg.style.border = `2px solid ${rec.statusColor}44`;
    } else {
      msg.style.display = 'none';
    }
  }

  const sdEl = $('sets-dots');
  if (sdEl) sdEl.innerHTML = Array.from({ length: totalSets }, (_, i) => `
    <div style="flex:1;height:6px;border-radius:3px;background:${i < state.currentSet - 1 ? 'var(--accent)' : i === state.currentSet - 1 ? 'rgba(200,255,0,0.4)' : 'var(--bg3)'};transition:background .3s"></div>
  `).join('');

  state.sessRepsInput = rec.repsTarget;
  const srEl = $('session-reps'); if (srEl) srEl.textContent = state.sessRepsInput;

  const saEl = $('set-actions'); if (saEl) saEl.style.display = 'flex';
  const riEl = $('rpe-inline'); if (riEl) riEl.style.display = 'none';
  const rsEl = $('rpe-screen'); if (rsEl) rsEl.style.display = 'none';

  speak(`Set ${state.currentSet}. ${state.currentEx}. Metti ${rec.kg} chili. ${rec.repsTarget} repetizioni.`);
}

export function setDone() {
  if (!state.currentEx) { toast('⚠ Selectează exercițiu', 'var(--accent2)'); return; }
  beepDone();
  const sa = $('set-actions'); if (sa) sa.style.display = 'none';
  const ri = $('rpe-inline'); if (ri) ri.style.display = 'block';
}

export function confirmReps() {
  state.lastPauseEndedAt = null;
  const ri = $('rpe-inline'); if (ri) ri.style.display = 'none';

  const rec = AA.applyTo(DP.recommend(state.currentEx), state.currentEx);
  const totalSets = EX_SETS[state.currentEx] || 3;

  const logs = DB.get('logs') || [];
  const noteArr = [...state.activeNotes]; resetNotes();
  const logKg = state.sessionKgOverride !== null ? state.sessionKgOverride : rec.kg;
  state.sessionKgOverride = null;
  logs.unshift({ date: tod(), ex: state.currentEx, w: logKg, sets: 1, reps: String(state.sessRepsInput), rpe: 8, notes: noteArr, ts: Date.now(), session: state.sessStart });
  DB.set('logs', logs.slice(0, 500));
  state.sessLog.push({ ex: state.currentEx, kg: logKg, rpe: 8, set: state.currentSet, reps: state.sessRepsInput });
  const ssc = $('sess-progress-txt'); if (ssc) ssc.textContent = `${state.completedExercises.size}/${state.sessionTotalExercises || getTodayExercises().length}`;

  saveDraft();

  if (state.currentSet >= totalSets) {
    state.completedExercises.add(state.currentEx);
    updateSessionProgress();
    const todayExs = getTodayExercises();
    const idx = todayExs.indexOf(state.currentEx);
    if (idx < todayExs.length - 1) {
      const nextEx = todayExs[idx + 1];
      const pauseSec = getSmartPause(state.currentEx);
      state.currentEx = nextEx; state.currentSet = 1;
      startPause(pauseSec, nextEx);
    } else {
      speak('Antrenament complet! Excelent!');
      toast('✅ Toate exercițiile completate!', 'var(--green)');
      endSession();
    }
  } else {
    state.currentSet++;
    startPause(getSmartPause(state.currentEx), state.currentEx);
  }
  renderSessLog();
}

export function selectRPE(rpe) { }

export function adjSessionReps(d) {
  state.sessRepsInput = Math.max(1, Math.min(30, state.sessRepsInput + d));
  $('session-reps').textContent = state.sessRepsInput;
}

export function renderSessLog() {
  const sl = $('sess-log');
  if (!sl) return;
  if (!state.sessLog.length) { sl.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text3);font-size:12px">Niciun set</div>'; return; }
  sl.innerHTML = [...state.sessLog].reverse().map(s => {
    const nc = s.rpe >= 9 ? 'var(--red)' : s.rpe <= 6.5 ? 'var(--accent3)' : 'var(--green)';
    const nx = s.rpe >= 9 ? 'SCADE' : s.rpe <= 6.5 ? 'CREȘTE' : 'MENȚINE';
    return `<div style="padding:10px 14px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:12px;font-weight:500">${s.ex}</div>
        <div style="font-size:10px;color:var(--text2);margin-top:1px">Set ${s.set} · ${s.kg}kg · ${s.reps || '?'} reps${s.notes && s.notes.length ? ' · <span style="color:var(--accent2)">' + s.notes.join(', ') + '</span>' : ''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:22px">${s.rpe >= 9 ? '🔴' : s.rpe >= 8 ? '🟠' : s.rpe >= 7 ? '🟡' : '🟢'}</span>
        <span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;background:${nc}22;color:${nc}">${nx}</span>
      </div>
    </div>`;
  }).join('');
}

export function editSessionKg() {
  const rec = AA.applyTo(DP.recommend(state.currentEx), state.currentEx);
  const startKg = state.sessionKgOverride !== null ? state.sessionKgOverride : (rec.kg || 20);
  const step = DP.getIncrement(state.currentEx);
  window._kgOvVal = startKg;

  document.getElementById('kg-edit-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'kg-edit-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px';
  overlay.innerHTML = `
    <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">GREUTATE · SET ${state.currentSet}</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:24px">${state.currentEx}</div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <button onclick="adjSessionKg(-${step * 2})" style="width:58px;height:58px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);color:var(--text);font-size:13px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace">−${step * 2}</button>
      <button onclick="adjSessionKg(-${step})" style="width:58px;height:58px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);color:var(--text);font-size:18px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace">−${step}</button>
      <div id="kg-ov-val" style="font-family:'Bebas Neue',sans-serif;font-size:72px;color:var(--accent);min-width:120px;text-align:center;line-height:1">${startKg}</div>
      <button onclick="adjSessionKg(${step})" style="width:58px;height:58px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);color:var(--text);font-size:18px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace">+${step}</button>
      <button onclick="adjSessionKg(${step * 2})" style="width:58px;height:58px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);color:var(--text);font-size:13px;font-weight:700;cursor:pointer;font-family:'JetBrains Mono',monospace">+${step * 2}</button>
    </div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:28px">Recomandat: ${rec.kg} kg</div>
    <button onclick="confirmSessionKg()" style="width:100%;max-width:320px;padding:18px;background:var(--accent);color:#000;font-weight:700;font-size:20px;border:none;border-radius:var(--r);cursor:pointer;font-family:'Bebas Neue',sans-serif;letter-spacing:1px">✓ CONFIRMĂ</button>
    <button onclick="document.getElementById('kg-edit-overlay')?.remove()" style="margin-top:12px;padding:12px;background:transparent;color:var(--text3);font-size:13px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif">Anulează</button>
  `;
  document.body.appendChild(overlay);
}

export function adjSessionKg(delta) {
  window._kgOvVal = Math.round((window._kgOvVal + delta) * 10) / 10;
  const el = document.getElementById('kg-ov-val');
  if (el) el.textContent = window._kgOvVal;
}

export function confirmSessionKg() {
  const kg = window._kgOvVal;
  if (!kg || kg <= 0) return;
  state.sessionKgOverride = DP.roundToStep(kg, state.currentEx);
  const big = $('rec-kg-big');
  if (big) { big.textContent = state.sessionKgOverride; big.style.color = 'var(--accent2)'; }
  document.getElementById('kg-edit-overlay')?.remove();
  toast(`${state.sessionKgOverride} kg ✓`, 'var(--accent)');
}

export function confirmEditKg() { confirmSessionKg(); }

export function toggleMute() {
  state.isMuted = !state.isMuted;
  DB.set('muted', state.isMuted);
  const btn = $('mute-btn');
  if (btn) btn.textContent = state.isMuted ? '🔇' : '🔊';
}
