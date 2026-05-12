// ══ WORKOUT — main session execution screen (V2 mockup port) ═══════════════
// Port spec: mockup `04-architecture/mockups/andura-clasic.html:§workout` line
// 887-1006. Full-screen overlay (NU modal bottom-sheet) rendering the active-
// session view: top bar + exercise progress + exercise card (group + name +
// tempo/RIR/RPE marius-persona row + sets table) + rest timer panel + 2
// action buttons (Inregistreaza setul + Termina sesiunea).
//
// Engine integration preserved orthogonal: rendering reads state + DP/AA/SYS
// engine snapshots ON each refresh (NU drift cache). Set-completion + end-
// session wired to existing handlers in logging.js + session.js (NU
// re-implement V1 prod flow — pattern preserved Bugatti single-concern).
//
// V1 prod parallel: V1 still drives session via session-ui block in index.html
// (`startSession()` toggles DOM display). workout.js is V2 vanilla screen
// renderer mounted via `state.currentScreen='workout'`. Step 2 React migration
// will unify under single component tree.
//
// Audit primat: V1_FEATURES_AUDIT_V1 scope LIMITED renderIdle + rating only.
// Alternate authority chain applied (mockup V2 SoT line 887-1006 +
// state.js:29 pre-stubbed enum 'workout' contract + existing engine ADRs
// preserved unchanged).

import { DB } from '../../db.js';
import { EX_SETS } from '../../constants.js';
import { state } from '../../state.js';
import { DP } from '../../engine/dp.js';
import { AA } from '../../engine/aa.js';
import { SYS } from '../../engine/sys.js';
import { getExGroup } from './util.js';
import { setDone } from './logging.js';
import { finishEarly } from './session.js';

const escapeHtml = (s) => String(s || '').replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));

function fmtElapsed(startMs) {
  if (!startMs) return '0:00';
  const sec = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const mm = Math.floor(sec / 60);
  const ss = sec % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}

function renderSetsTable(currentEx, currentSet, sessLog) {
  if (!currentEx) return '<div style="color:var(--text3);font-size:12px;padding:8px 0">Niciun exercitiu activ</div>';
  const totalSets = EX_SETS[currentEx] || 3;
  let rec;
  try {
    rec = AA.applyTo(DP.recommend(currentEx), currentEx);
  } catch {
    rec = { kg: '—', repsTarget: '—' };
  }
  const exLogs = (sessLog || []).filter(l => l.ex === currentEx);
  const rows = [];
  rows.push(`<div class="workout-sets-head" style="display:grid;grid-template-columns:32px 1fr 1fr 44px;gap:10px;padding-bottom:8px;border-bottom:1px solid var(--border)">
    <div style="font-size:10px;color:var(--text3);text-align:center;text-transform:uppercase;letter-spacing:0.06em">SET</div>
    <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em">KG</div>
    <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em">REPETARI</div>
    <div></div>
  </div>`);
  for (let i = 1; i <= totalSets; i++) {
    const logged = exLogs.find(l => Number(l.set) === i);
    const isDone = !!logged;
    const isCurrent = i === currentSet && !isDone;
    const kgVal = logged ? logged.w : (isCurrent ? rec.kg : rec.kg);
    const repsVal = logged ? logged.reps : (isCurrent ? rec.repsTarget : rec.repsTarget);
    const numColor = isCurrent ? 'var(--accent)' : (isDone ? 'var(--text)' : 'var(--text3)');
    const valColor = isCurrent ? 'var(--accent)' : (isDone ? 'var(--text)' : 'var(--text3)');
    const checkContent = isDone
      ? '<div style="width:18px;height:18px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#000;font-size:11px;font-weight:700">✓</div>'
      : isCurrent
        ? '<div style="width:18px;height:18px;border-radius:50%;border:2px solid var(--accent)"></div>'
        : '<div style="width:18px;height:18px;border-radius:50%;border:2px solid var(--border)"></div>';
    rows.push(`<div class="workout-set-row" data-set="${i}" data-state="${isDone ? 'done' : isCurrent ? 'current' : 'pending'}" style="display:grid;grid-template-columns:32px 1fr 1fr 44px;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:13px;font-weight:600;text-align:center;color:${numColor}">${i}</div>
      <div style="font-size:13px;color:${valColor}${isCurrent ? ';font-weight:600' : ''}">${escapeHtml(kgVal)} kg</div>
      <div style="font-size:13px;color:${valColor}">${escapeHtml(repsVal)}</div>
      <div style="display:flex;justify-content:flex-end">${checkContent}</div>
    </div>`);
  }
  return rows.join('');
}

function renderTempoRow(currentEx) {
  if (!currentEx) return '';
  let tempo;
  try { tempo = SYS.getTempo(currentEx); } catch { tempo = null; }
  if (!tempo) return '';
  const t = tempo.tempo || '—';
  const rir = (tempo.rir != null) ? tempo.rir : '—';
  const rpe = (tempo.rir != null) ? `${10 - tempo.rir - 1}-${10 - tempo.rir}` : '—';
  return `<div class="workout-tempo-row" style="margin-top:12px;padding:10px 12px;background:var(--bg3);border-radius:var(--rs);display:flex;gap:14px;font-family:'JetBrains Mono',monospace;font-size:12px;flex-wrap:wrap">
    <span><span style="color:var(--text3)">tempo</span> ${escapeHtml(t)}</span>
    <span><span style="color:var(--text3)">RIR</span> ${escapeHtml(rir)}</span>
    <span><span style="color:var(--text3)">RPE</span> ${escapeHtml(rpe)}</span>
  </div>`;
}

export function showWorkoutScreen(opts = {}) {
  if (document.getElementById('workout-screen')) return;
  state.currentScreen = 'workout';

  const overlay = document.createElement('div');
  overlay.id = 'workout-screen';
  overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:7500;display:flex;flex-direction:column;overflow-y:auto';

  document.body.appendChild(overlay);
  renderWorkoutScreen(opts);
}

export function renderWorkoutScreen(opts = {}) {
  const overlay = document.getElementById('workout-screen');
  if (!overlay) return;

  const currentEx = state.currentEx || '';
  const safeEx = escapeHtml(currentEx);
  const group = currentEx ? getExGroup(currentEx) : 'SESIUNE';
  const sessType = escapeHtml(state.sessType || '');
  const completed = state.completedExercises ? state.completedExercises.size : 0;
  const total = state.sessionTotalExercises || 0;
  const progressPct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const elapsed = fmtElapsed(state.sessStart);
  const showRest = !!state.pauseTimer && state.pauseLeft > 0;
  const restLeft = state.pauseLeft || 0;
  const restTotal = state.pauseTotal || 1;
  const restPct = Math.max(0, Math.min(100, Math.round((restLeft / restTotal) * 100)));

  overlay.innerHTML = `
    <div class="workout-top-bar" style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--border)">
      <button class="workout-close" aria-label="Inchide" style="background:none;border:none;padding:6px;cursor:pointer;color:var(--text);font-size:18px">✕</button>
      <div style="text-align:center;flex:1">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em">${sessType ? `Sesiune ${sessType}` : 'Sesiune'}${group !== 'SESIUNE' ? ` · ${escapeHtml(group)}` : ''}</div>
        <div class="workout-timer" style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;color:var(--text)">${elapsed}</div>
      </div>
      <button class="workout-menu" aria-label="Meniu" style="background:none;border:none;padding:6px;cursor:pointer;color:var(--text);font-size:18px">⋯</button>
    </div>

    <div class="workout-progress" style="display:flex;align-items:center;gap:8px;padding:12px 20px 0">
      <div style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace">${String(completed).padStart(2,'0')}/${String(total).padStart(2,'0')}</div>
      <div style="flex:1;height:4px;background:var(--bg3);border-radius:2px;overflow:hidden">
        <div class="workout-progress-fill" style="width:${progressPct}%;height:100%;background:var(--accent);transition:width .25s"></div>
      </div>
      <div style="font-size:11px;color:var(--text3)">${safeEx || '—'}</div>
    </div>

    <div style="padding:14px 20px 24px">
      <div class="workout-ex-card" style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
          <div style="flex:1;min-width:0">
            <div class="workout-ex-group" style="font-size:10px;color:var(--accent);font-weight:600;text-transform:uppercase;letter-spacing:0.06em">${escapeHtml(group)}</div>
            <h2 class="workout-ex-name" style="font-size:22px;font-weight:700;color:var(--text);margin:4px 0 0;letter-spacing:-0.02em">${safeEx || '—'}</h2>
          </div>
        </div>
        ${renderTempoRow(currentEx)}
        <div class="workout-sets" style="margin-top:16px">
          ${renderSetsTable(currentEx, state.currentSet || 1, state.sessLog)}
        </div>
      </div>

      <div class="workout-rest" style="display:${showRest ? 'flex' : 'none'};margin-top:14px;background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:14px;align-items:center;gap:14px">
        <div class="workout-rest-progress" style="width:60px;height:60px;border-radius:50%;border:4px solid var(--bg3);border-top-color:var(--accent);transform:rotate(${Math.round((1 - restLeft / restTotal) * 360)}deg);transition:transform .25s"></div>
        <div style="flex:1">
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em">Pauza</div>
          <div class="workout-rest-time" style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:600;color:var(--text)">${restLeft}s · ${restPct}%</div>
        </div>
      </div>

      <button class="workout-log-set" style="width:100%;margin-top:16px;padding:14px;background:var(--accent);color:#000;border:none;border-radius:var(--rs);cursor:pointer;font-size:14px;font-weight:600">
        ✓ Inregistreaza setul
      </button>

      <button class="workout-finish" style="width:100%;margin-top:10px;padding:14px;background:none;border:1px solid var(--border);border-radius:var(--rs);cursor:pointer;font-size:13px;color:var(--text)">
        ⚑ Termina sesiunea
      </button>
    </div>`;

  overlay.querySelector('.workout-close').addEventListener('click', () => closeWorkoutScreen(opts));
  overlay.querySelector('.workout-log-set').addEventListener('click', () => {
    try { setDone(); } catch { /* DOM-dependent in V1 prod; swallow when scaffolding absent */ }
    if (typeof opts.onSetDone === 'function') opts.onSetDone();
    renderWorkoutScreen(opts);
  });
  overlay.querySelector('.workout-finish').addEventListener('click', () => {
    try { finishEarly(); } catch { /* DOM-dependent in V1 prod; swallow */ }
    if (typeof opts.onFinish === 'function') opts.onFinish();
    closeWorkoutScreen(opts);
  });
}

export function closeWorkoutScreen(opts = {}) {
  const overlay = document.getElementById('workout-screen');
  if (overlay) overlay.remove();
  if (state.currentScreen === 'workout') state.currentScreen = 'antrenor';
  if (typeof opts.onClose === 'function') opts.onClose();
}

// Debug-friendly export for callers wiring DB log access if needed (e.g.,
// session resume flow). NU strictly required by mockup; export for parity
// with sibling pages.
export function getWorkoutMountState() {
  return {
    mounted: !!document.getElementById('workout-screen'),
    currentScreen: state.currentScreen,
    currentEx: state.currentEx,
    currentSet: state.currentSet,
  };
}
