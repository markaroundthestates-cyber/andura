// ══ MAIN ENTRY POINT ══════════════════════════════════════════
import { applyTheme, getActiveTheme } from './themes/themeManager.js';
import { initFirebaseSync } from './firebase.js';
import { DP } from './engine/dp.js';
import { AA } from './engine/aa.js';
import { injectBaseline, injectMFPWeights, injectRealSessions } from './inject.js';
import { initW, initKcal, initProt } from './pages/weight.js';
import { renderCoachIdle, checkWeightReminder, closeSummary } from './pages/coach.js';
import { renderDash } from './pages/dashboard.js';
import { renderProg } from './pages/plan.js';
import { goTo } from './ui/nav.js';
import { checkOnboarding, setObRPE, saveOnboarding, skipOnboarding } from './onboarding.js';
import { DB, cleanEx } from './db.js';

// Expune funcții globale pentru onclick="" în HTML
import { toast } from './ui/ui.js';
import { saveW, saveKcal, adjKcal, setKcalDirect,
         saveProt, adjProt, setProtDirect, shiftLogDate, toggleDatePicker,
         exportCSV, exportJSON, importJSON, triggerMFPImport,
         toggleHistoryAll, onDI, adj,
         lockWeight, unlockWeight, lockKcal, unlockKcal, lockProt, unlockProt,
         selectDateFromPicker, setChartRange, savePhoto, setBFOverride, clearBFOverride,
         renderDailyDropdown, showDayDetail, closeDayDetail,
         renderSessionsDropdown, showSessionDetail, hideSessionDetail } from './pages/weight.js';
import { cleanFakeLogs, extractAndSavePRs, finishEarly, confirmEarlyStop, saveStepsQuick, getGroupColor, toggleMute, skipPause, resetNotes, renderPRWall, togglePRWall, toggleExList } from './pages/coach.js';
import { setDone, confirmReps, selectRPE, startSession, cancelWorkout,
         skipExercise, adjSessionReps, editSessionKg, confirmEditKg,
         adjSessionKg, confirmSessionKg, rateSession, endSession } from './pages/coach.js';
import { showReadinessModal, selectReadiness, showSkipModal, confirmSkip, showAlternativeModal, selectAlternative, markEquipmentUnavailable, markOccupied } from './pages/coach.js';
import { saveReadiness, getTodayReadiness } from './engine/readiness.js';
import { getAppliedPatterns, dismissPattern } from './engine/patternLearning.js';
import { PROG, KCAL_TARGET, PROT_TARGET } from './constants.js';
import { setPhaseOverride, clearPhaseOverride } from './pages/plan.js';
import { updateNotifBtn, requestNotifications, closeDayFromDash, dismissMFPPrompt, showRecoveryModal } from './pages/dashboard.js';
import { resetTestData, fullReset, inspectStorage } from './util/dataCleanup.js';

// Toate funcțiile accesibile din HTML via onclick
Object.assign(window, {
  applyTheme,
  goTo, toast, DP, AA, cleanEx,
  renderDash, renderCoachIdle, closeSummary,
  initW, onDI, adj,
  saveW, saveWeight: saveW, adjWeight: saveW, saveKcal, adjKcal, setKcalDirect,
  saveProt, adjProt, setProtDirect, shiftLogDate, toggleDatePicker,
  exportCSV, exportJSON, importJSON, triggerMFPImport,
  lockWeight, unlockWeight, lockKcal, unlockKcal, lockProt, unlockProt,
  selectDateFromPicker, setChartRange, savePhoto, setBFOverride, clearBFOverride,
  toggleMute, skipPause,
  setObRPE, saveOnboarding, skipOnboarding,
  toggleHistoryAll, cleanFakeLogs, extractAndSavePRs, finishEarly, confirmEarlyStop, saveStepsQuick, getGroupColor, resetNotes,
  setDone, confirmReps, selectRPE, startSession, cancelWorkout, endSession,
  skipExercise, adjSessionReps, editSessionKg, confirmEditKg, adjSessionKg, confirmSessionKg, rateSession,
  setPhaseOverride, clearPhaseOverride,
  updateNotifBtn, requestNotifications, closeDayFromDash, dismissMFPPrompt, showRecoveryModal,
  renderDailyDropdown, showDayDetail, closeDayDetail,
  renderSessionsDropdown, showSessionDetail, hideSessionDetail,
  renderPRWall, togglePRWall, toggleExList,
  showReadinessModal, selectReadiness, showSkipModal, confirmSkip,
  showAlternativeModal, selectAlternative, markEquipmentUnavailable, markOccupied,
  saveReadiness, getTodayReadiness,
  inspectStorage,
  dismissAutoPattern: (i) => { dismissPattern(i); renderDash(); },
  dashSaveReadiness: (v) => { saveReadiness(v); renderDash(); },
  _devResetTest: () => {
    if (confirm('Ștergi date de test (patterns, session drafts, etc.)?\nLogurile reale și greutățile rămân.')) {
      resetTestData();
      location.reload();
    }
  },
  _devFullReset: () => {
    if (confirm('⚠️ ATENȚIE: Ștergi TOT (loguri, greutăți, tot).\nEști sigur?')) {
      if (confirm('Ultima confirmare: chiar ștergi TOATE datele?')) {
        fullReset();
        location.reload();
      }
    }
  },
  injectRealSessions,
  sp: goTo, __v: 6,
});

// ── Feature 10: Clean Duplicate Logs ─────────────────────────
function cleanDuplicateLogs() {
  const logs = DB.get('logs') || [];
  const seen = new Set();
  const clean = logs.filter(l => {
    const key = `${l.session||l.date}|${l.ex}|${l.set||0}|${l.kg}|${l.reps}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (clean.length < logs.length) DB.set('logs', clean);
}

// ── Feature 7: Offline Indicator ─────────────────────────────
function setupOfflineIndicator() {
  const el = document.getElementById('offline-indicator');
  if (!el) return;
  const update = () => {
    if (navigator.onLine) {
      el.style.display = 'none';
      if (window._wasOffline) {
        window._wasOffline = false;
        import('./firebase.js').then(m => m.syncToFirebase && m.syncToFirebase());
      }
    } else {
      el.style.display = 'flex';
      window._wasOffline = true;
    }
  };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

// ── INIT ─────────────────────────────────────────────────────
async function init() {
  applyTheme(getActiveTheme());
  setupOfflineIndicator();
  cleanDuplicateLogs();
  window.__constants = { PROG, KCAL_TARGET, PROT_TARGET };
  await initFirebaseSync();
  injectBaseline();
  injectMFPWeights();
  const injected = injectRealSessions();
  if (injected.added > 0) {
    extractAndSavePRs();
    console.log(`[inject] +${injected.added} sets added (Apr21=${!injected.had21}, Apr22=${!injected.had22})`);
  }
  initW();
  initKcal();
  initProt();

  // Populează pr-records din istoricul complet la fiecare init
  extractAndSavePRs();

  const onboardingDone = DB.get('onboarding-done') || (DB.get('logs') || []).length > 0;
  if (!onboardingDone) {
    checkOnboarding();
  } else {
    renderCoachIdle();
    renderDash();
    renderProg();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/salafull/sw.js').catch(() => {});
  }

  checkWeightReminder();
}

init();
