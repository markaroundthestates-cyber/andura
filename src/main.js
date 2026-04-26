// ══ MAIN ENTRY POINT ══════════════════════════════════════════
import { initSentry } from './util/sentry.js';
initSentry(); // fire-and-forget, production only

window.__dataRegistryEnabled = true;

import { applyTheme, getActiveTheme } from './themes/themeManager.js';
import { initFirebaseSync, clearFirebaseKeys } from './firebase.js';
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
import './util/cdlBackfill.js';
import { migrateLogsUtcToLocal } from './util/logsMigration.js';

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
import { cleanFakeLogs, extractAndSavePRs, finishEarly, confirmEarlyStop, saveStepsQuick, getGroupColor, toggleMute, skipPause, resetNotes, renderPRWall, togglePRWall, toggleExList, showWhyForExercise } from './pages/coach.js';
import { setDone, confirmReps, selectRPE, startSession, cancelWorkout,
         skipExercise, adjSessionReps, editSessionKg, confirmEditKg,
         adjSessionKg, confirmSessionKg, rateSession, endSession } from './pages/coach.js';
import { showReadinessModal, selectReadiness, showSkipModal, confirmSkip, showAlternativeModal, selectAlternative, markEquipmentUnavailable, markOccupied } from './pages/coach.js';
import { saveReadiness, getTodayReadiness } from './engine/readiness.js';
import { PROG, KCAL_TARGET, PROT_TARGET } from './constants.js';
import { setPhaseOverride, clearPhaseOverride } from './pages/plan.js';
import { updateNotifBtn, requestNotifications, closeDayFromDash, dismissMFPPrompt, showRecoveryModal } from './pages/dashboard.js';
import { resetTestData, fullReset, inspectStorage, resetButKeepRealLogs, restoreRealLogs, cleanDuplicateLogs } from './util/dataCleanup.js';
import { adminPrefillAll } from './util/adminPrefill.js';

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
  showWhyForExercise,
  saveReadiness, getTodayReadiness,
  inspectStorage,
  resetButKeepRealLogs,
  restoreRealLogs,
  adminPrefillAll,
  _devSoftReset: async () => {
    if (confirm('Soft Reset: șterge datele de test, păstrează loguri reale, greutăți, kcal. Continui?')) {
      await resetButKeepRealLogs();
    }
  },
  dashSaveReadiness: (v) => { saveReadiness(v); renderDash(); },
  _devResetTest: async () => {
    if (confirm('Ștergi date de test (patterns, session drafts, etc.)?\nLogurile reale și greutățile rămân.')) {
      await resetTestData();
    }
  },
  _devFullReset: async () => {
    if (confirm('⚠️ ATENȚIE: Ștergi TOT (loguri, greutăți, tot).\nEști sigur?')) {
      if (confirm('Ultima confirmare: chiar ștergi TOATE datele?')) {
        await fullReset();
      }
    }
  },
  injectRealSessions,
  sp: goTo, __v: 6,
});

// ── Calibration: clear stale pattern caches for cold_start users ─────────────
// Must be called AFTER initFirebaseSync so Firebase doesn't restore cleared keys.
async function clearStalePatternsIfColdStart() {
  try {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    const sessionKeys = new Set(logs.map(l => l.session ?? l.date).filter(Boolean));
    if (sessionKeys.size < 3) {
      localStorage.removeItem('applied-patterns');
      localStorage.removeItem('pattern-learning-cache');
      localStorage.removeItem('detected-patterns');
      console.log('[Calibration] Cleared stale pattern caches (cold_start)');
      // Also clear from Firebase so the next sync doesn't restore them
      if (!window._suppressFirebaseSync) {
        await clearFirebaseKeys(['applied-patterns', 'pattern-learning-cache', 'detected-patterns']);
      }
    }
  } catch { /* non-blocking */ }
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
  // Migration UTC → Local (idempotent, runs once)
  try {
    const migrationResult = migrateLogsUtcToLocal();
    if (!migrationResult.skipped) {
      console.log('[Migration] Logs/CDL date format updated to local timezone');
    }
  } catch (err) {
    console.error('[Migration] Failed:', err);
    // Continue boot — migration failure non-blocking
  }
  window.__constants = { PROG, KCAL_TARGET, PROT_TARGET };
  await initFirebaseSync();
  await clearStalePatternsIfColdStart(); // after sync: Firebase can't restore cleared keys
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
