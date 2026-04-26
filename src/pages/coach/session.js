import { DB, $, tod } from '../../db.js';
import { EX_SETS, PROG } from '../../constants.js';
import { SYS } from '../../engine/sys.js';
import { toast, speak, hidePauseScreen } from '../../ui/ui.js';
import { getTodayExercises, beepStart } from './util.js';
import { updateExCard, renderSessLog } from './logging.js';
import { stopPause, setupInactivity, teardownInactivity } from './restTimer.js';
import { showSessionRating } from './rating.js';
import { wakeLockRef, getCachedDirector } from './state.js';
import { state } from '../../state.js';
import { renderCoachIdle } from './renderIdle.js';
import { populateOutcome, computeMatchScore, readActiveForDate } from '../../util/coachDecisionLog.js';

export function saveDraft() {
  if (!state.sessActive || !state.sessStart) return;
  DB.set('session-draft', {
    date: tod(),
    sessStart: state.sessStart,
    sessLog: [...state.sessLog],
    currentEx: state.currentEx,
    currentSet: state.currentSet,
    timestamp: Date.now()
  });
}

export function clearDraft() { localStorage.removeItem('session-draft'); }

export function tickSess() {}

export function startSession() {
  // Feature 2: Check for existing session draft from today
  const draft = DB.get('session-draft');
  if (draft && draft.date === tod() && draft.sessLog && draft.sessLog.length > 0) {
    if (confirm(`Ai ${draft.sessLog.length} seturi nefinalizate din azi. Continui sesiunea anterioară?`)) {
      state.sessActive = true; state.sessStart = draft.sessStart; state.sessLog = [...draft.sessLog];
      state.currentEx = draft.currentEx || ''; state.currentSet = draft.currentSet || 1;
      state.dropSetUsedThisSession = false; state.earlyStopReason = null;
      state.sessKcalBurn = 0;
      // H4c: derive completed exercises from saved sessLog instead of resetting to empty
      const _exSetCounts = {};
      draft.sessLog.forEach(s => { _exSetCounts[s.ex] = (_exSetCounts[s.ex] || 0) + 1; });
      state.completedExercises = new Set(
        Object.entries(_exSetCounts).filter(([ex, n]) => n >= (EX_SETS[ex] || 3)).map(([ex]) => ex)
      );
      requestWakeLock();
      { const _ssMap = [6, 0, 1, 2, 3, 4, 5]; state.sessType = (PROG[_ssMap[new Date().getDay()]]?.t || '').toUpperCase() || null; }
      state.cdlEntryId = getCachedDirector()?.cdlEntryId ?? null;
      state.isMuted = DB.get('muted') || false;
      const mb2 = $('mute-btn'); if (mb2) { mb2.textContent = state.isMuted ? '🔇' : '🔊'; mb2.style.color = state.isMuted ? 'var(--accent2)' : 'var(--text2)'; }
      state.sessionTotalExercises = getTodayExercises().length;
      const ts2 = $('today-screen'); if (ts2) ts2.style.display = 'none';
      const su2 = $('session-ui'); if (su2) su2.style.display = 'block';
      state.sessTimer = setInterval(tickSess, 1000);
      setupInactivity();
      toast('🔄 Sesiune restaurată!', 'var(--accent)');
      updateExCard(); renderSessLog(); return;
    } else { clearDraft(); }
  }

  state.sessActive = true; state.sessStart = Date.now(); state.sessLog = []; state.sessKcalBurn = 0; state.dropSetUsedThisSession = false; state.earlyStopReason = null;
  requestWakeLock();
  { const _ssMap = [6, 0, 1, 2, 3, 4, 5]; state.sessType = (PROG[_ssMap[new Date().getDay()]]?.t || '').toUpperCase() || null; }
  state.cdlEntryId = getCachedDirector()?.cdlEntryId ?? null;
  state.completedExercises = new Set();
  state.isMuted = DB.get('muted') || false;
  const mb = $('mute-btn'); if (mb) { mb.textContent = state.isMuted ? '🔇' : '🔊'; mb.style.color = state.isMuted ? 'var(--accent2)' : 'var(--text2)'; }
  const todayExsForCount = getTodayExercises();
  state.sessionTotalExercises = todayExsForCount.length;
  const ts = $('today-screen'); if (ts) ts.style.display = 'none';
  const su = $('session-ui'); if (su) su.style.display = 'block';
  state.sessTimer = setInterval(tickSess, 1000);
  beepStart(); speak('Antrenament pornit.');
  toast('🔥 START!');
  setupInactivity(); // Feature 5: Inactivity auto-pause

  // Auto-select first exercise of today
  const todayExs = getTodayExercises();
  if (todayExs.length > 0) {
    state.currentEx = todayExs[0];
    state.currentSet = 1;
    updateExCard();
  }
  renderSessLog();
}

export function skipExercise() {
  state.completedExercises.add(state.currentEx); // skip = counts as done
  updateSessionProgress();
  const todayExs = getTodayExercises();
  const idx = todayExs.indexOf(state.currentEx);
  if (idx < todayExs.length - 1) {
    state.currentEx = todayExs[idx + 1];
    state.currentSet = 1;
    updateExCard();
    toast('Exercițiu sărit');
  } else {
    endSession();
  }
}

export function cancelWorkout() {
  if (!confirm('Anulezi antrenamentul? Nicio dată nu va fi salvată.')) return;
  clearDraft(); teardownInactivity();
  clearInterval(state.sessTimer); state.sessTimer = null;
  stopPause(); state.sessActive = false; state.lastPauseEndedAt = null;
  releaseWakeLock();
  if (state.sessStart) {
    const logs = DB.get('logs') || [];
    DB.set('logs', logs.filter(l => l.session !== state.sessStart));
  }
  // ── CDL outcome — cancel (ADR 011) ────────────────────────────────────
  try {
    if (state.cdlEntryId) {
      const _today = tod();
      populateOutcome(_today, {
        executed: false,
        earlyStop: false,
        earlyStopReason: null,
        actualExercises: [],
        actualSets: 0,
        actualDurationMins: state.sessStart ? Math.round((Date.now() - state.sessStart) / 60000) : 0,
        matchScore: null,
        deviation: false,
        rating: null,
      });
    } else {
      console.warn('[session] CDL cancel outcome skipped — cdlEntryId not set');
    }
  } catch (err) {
    console.error('[session] CDL populateOutcome failed (degraded mode):', err);
    try {
      if (typeof window !== 'undefined' && window.Sentry?.captureException) {
        window.Sentry.captureException(err, { tags: { component: 'session', op: 'cdl_cancel' } });
      }
    } catch (_) {}
  }
  state.sessLog = [];
  state.completedExercises = new Set();
  state.dropSetUsedThisSession = false;
  state.earlyStopReason = null;
  state.sessionKgOverride = null;
  state.activeNotes = new Set();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  const suEl = $('session-ui'); if (suEl) suEl.style.display = 'none';
  hidePauseScreen();
  const tsEl = $('today-screen'); if (tsEl) tsEl.style.display = 'block';
  toast('❌ Antrenament anulat — nicio dată salvată', 'var(--red)');
  renderCoachIdle();
}

export function endSession() {
  if (!state.sessActive) return;
  clearDraft(); teardownInactivity(); // Feature 2+5
  clearInterval(state.sessTimer); state.sessTimer = null;
  stopPause(); state.sessActive = false; state.lastPauseEndedAt = null;
  releaseWakeLock();
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  const hasEarlyStop = state.earlyStopReason !== null;

  const mins = Math.round((Date.now() - state.sessStart) / 60000);
  const kcal = Math.round(SYS.getCurrentKg() * 0.09 * mins);
  const burnLog = DB.get('session-burns') || [];
  // Save with day key for adaptive timer
  const _dayMap = [6, 0, 1, 2, 3, 4, 5];
  const dayKey = PROG[_dayMap[new Date().getDay()]]?.day || 'default';
  burnLog.unshift({ date: tod(), mins, kcal, sets: state.sessLog.length, day: dayKey });
  DB.set('session-burns', burnLog.slice(0, 100));

  // ── Calculează sumar sesiune ──────────────────────────────────────────────
  const totalVolume = state.sessLog.reduce((a, s) => a + (s.w * (parseInt(s.reps) || 8)), 0);
  const totalSets = state.sessLog.length;
  const uniqueEx = [...new Set(state.sessLog.map(s => s.ex))];
  const avgRPE = state.sessLog.filter(s => s.rpe).reduce((a, s, _, arr) => a + s.rpe / arr.length, 0);
  const notes = state.sessLog.flatMap(s => s.notes || []);
  const feltStrong = notes.filter(n => n === 'strong').length;
  const feltHeavy = notes.filter(n => n === 'form' || n === 'fatigue').length;
  const moodLabel = feltStrong > feltHeavy ? '💪 Sesiune puternică' : feltHeavy > feltStrong ? '😓 Sesiune grea' : '⚡ Sesiune ok';

  // ── Detectează recorduri ──────────────────────────────────────────────────
  const allLogs = DB.get('logs') || [];
  const prs = [];
  uniqueEx.forEach(ex => {
    const thisSess = state.sessLog.filter(s => s.ex === ex);
    const bestKg = Math.max(...thisSess.map(s => s.w));
    const bestReps = Math.max(...thisSess.filter(s => s.w === bestKg).map(s => parseInt(s.reps) || 8));
    // Compare to historical (exclude today's session)
    const historical = allLogs.filter(l => l.ex === ex && l.session !== state.sessStart && !l.baseline);
    if (!historical.length) {
      prs.push({ ex, type: 'prima', label: `${ex} — Prima sesiune! ${bestKg}kg × ${bestReps}` });
    } else {
      const histBestKg = Math.max(...historical.map(l => l.w || 0));
      const histBestReps = Math.max(...historical.filter(l => l.w === histBestKg).map(l => parseInt(l.reps) || 8));
      if (bestKg > histBestKg) {
        prs.push({ ex, type: 'kg', label: `${ex}: +${bestKg - histBestKg}kg nou maxim (${bestKg}kg × ${bestReps})` });
      } else if (bestKg === histBestKg && bestReps > histBestReps) {
        prs.push({ ex, type: 'reps', label: `${ex}: +${bestReps - histBestReps} reps (${bestKg}kg × ${bestReps})` });
      }
    }
  });

  // ── CDL outcome (ADR 011) ─────────────────────────────────────────────
  try {
    if (state.cdlEntryId) {
      const _today = tod();
      const activeEntry = readActiveForDate(_today);
      if (activeEntry) {
        const actualExercises = [...new Set(state.sessLog.map(l => l.ex))];
        const actualSets = state.sessLog.length;
        const matchResult = computeMatchScore(activeEntry.proposed, {
          actualSessionType: state.sessType,
          actualExercises,
          actualSets,
        });
        populateOutcome(_today, {
          executed: hasEarlyStop ? 'partial' : true,
          earlyStop: hasEarlyStop,
          earlyStopReason: state.earlyStopReason,
          actualExercises,
          actualSets,
          actualDurationMins: mins,
          matchScore: matchResult.matchScore,
          deviation: matchResult.deviation,
          rating: null,
        });
      }
    } else {
      console.warn('[session] CDL outcome skipped — cdlEntryId not set');
    }
  } catch (err) {
    console.error('[session] CDL populateOutcome failed (degraded mode):', err);
    try {
      if (typeof window !== 'undefined' && window.Sentry?.captureException) {
        window.Sentry.captureException(err, { tags: { component: 'session', op: 'cdl_outcome' } });
      }
    } catch (_) {}
  }

  // ── Întreabă cum a fost sesiunea (un singur tap) ─────────────────────────
  const ratedSets = state.sessLog.filter(s => s.rpe !== undefined && s.rpe !== null).length;
  const noneRated = state.sessLog.length > 0 && ratedSets === 0;
  showSessionRating({ mins, kcal, totalVolume, totalSets, uniqueEx, avgRPE, prs, noneRated });
}

export function closeSummary() {
  const m = document.getElementById('summary-modal');
  if (m) m.remove();
  const ts = $('today-screen'); if (ts) ts.style.display = 'block';
  renderCoachIdle();
  if (window.renderDash) window.renderDash();
  // Auto close day if it's evening (22:00–23:59)
  const h = new Date().getHours();
  if (h >= 22 && window.closeDayFromDash) window.closeDayFromDash();
}

export function updateSessionProgress() {
  const done = state.completedExercises.size;
  const total = state.sessionTotalExercises || getTodayExercises().length;
  const pct = total > 0 ? Math.round(done / total * 100) : 0;
  const txtEl = $('sess-progress-txt');
  const barEl = $('sess-progress-bar');
  if (txtEl) txtEl.textContent = `${done}/${total}`;
  if (barEl) barEl.style.width = pct + '%';
}

// ── FIX 2b: Finish Early — funcții ───────────────────────────────────────
export function finishEarly() {
  const reasons = ['Oboseală extremă', 'Am dureri', 'Lipsă timp', 'Alt motiv'];
  document.getElementById('early-stop-modal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'early-stop-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:300;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px';
  modal.innerHTML = `
    <div style="width:100%;max-width:340px;background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:24px 20px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--accent2);margin-bottom:6px;text-align:center">STOP DEVREME</div>
      <div style="font-size:12px;color:var(--text3);text-align:center;margin-bottom:20px">De ce oprești antrenamentul?</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${reasons.map(r => `<button onclick="confirmEarlyStop('${r}')"
          style="padding:14px 16px;background:rgba(255,149,0,0.07);border:1px solid rgba(255,149,0,0.25);border-radius:var(--rs);color:var(--text);font-size:14px;font-weight:600;cursor:pointer;text-align:left;font-family:'DM Sans',sans-serif">${r}</button>`).join('')}
      </div>
      <button onclick="document.getElementById('early-stop-modal')?.remove()"
        style="margin-top:16px;width:100%;padding:12px;background:transparent;color:var(--text3);font-size:13px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif">Anulează</button>
    </div>
  `;
  document.body.appendChild(modal);
}

export function confirmEarlyStop(reason) {
  // 1. Salvează în state
  state.earlyStopReason = reason;

  // 2. Salvează în log-ul sesiunii
  const setsCompleted = state.sessLog.length;
  const todayExs = getTodayExercises();
  const avgSets = todayExs.length > 0 ? todayExs.reduce((a, ex) => a + (EX_SETS[ex] || 3), 0) / todayExs.length : 3;
  const totalSets = Math.round(state.sessionTotalExercises * avgSets);
  const earlyLog = { date: tod(), earlyStop: { reason, setsCompleted, totalSets }, session: state.sessStart };
  const logs = DB.get('logs') || [];
  logs.unshift({ ...earlyLog, ex: '__early_stop__', w: 0, reps: '0', ts: Date.now(), session: state.sessStart, earlyStop: { reason, setsCompleted, totalSets } });
  DB.set('logs', logs.slice(0, 5000));

  // 3. Salvează în 'early-stops' key
  const earlyStops = DB.get('early-stops') || [];
  earlyStops.push({ date: tod(), reason, session: state.sessStart, setsCompleted, totalSets });
  DB.set('early-stops', earlyStops.slice(-50));

  // 4. Ascunde modalul
  document.getElementById('early-stop-modal')?.remove();

  // 5. Flow normal (rating etc.)
  endSession();
}

export function releaseWakeLock() {
  try { if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; } } catch (e) {}
}

export async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    }
  } catch (e) { /* Wake Lock not available — silently ignore */ }
}
