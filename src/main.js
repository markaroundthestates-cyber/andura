// ══ MAIN ENTRY POINT ══════════════════════════════════════════
import { initSentry } from './util/sentry.js';
initSentry(); // fire-and-forget, production only

window.__dataRegistryEnabled = true;

import { applyTheme, getActiveTheme } from './themes/themeManager.js';
import { initFirebaseSync, clearFirebaseKeys, syncToFirebase } from './firebase.js';
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
import { runBootMigrations, startTierRotation, exposeForceRotationHelper } from './bootstrap.js';
import { handleAuthCallbackRoute, mountAuthBanner, showAuthScreen } from './pages/authShell.js';
import { isAuthenticated } from './auth.js';
import { runAuthPathMigration } from './migrations/2026-05-02-auth-path-migration.js';

// Expune functii globale pentru onclick="" in HTML
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

// Toate functiile accesibile din HTML via onclick
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
    if (confirm('Soft Reset: sterge datele de test, pastreaza loguri reale, greutati, kcal. Continui?')) {
      await resetButKeepRealLogs();
    }
  },
  dashSaveReadiness: (v) => { saveReadiness(v); renderDash(); },
  _devResetTest: async () => {
    if (confirm('Stergi date de test (patterns, session drafts, etc.)?\nLogurile reale si greutatile raman.')) {
      await resetTestData();
    }
  },
  _devFullReset: async () => {
    if (confirm('⚠️ ATENTIE: Stergi TOT (loguri, greutati, tot).\nEsti sigur?')) {
      if (confirm('Ultima confirmare: chiar stergi TOATE datele?')) {
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
        if (typeof syncToFirebase === 'function') syncToFirebase();
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

// ── Auth wiring per §AMENDMENT 2026-05-04 + §56.1-§56.19 LOCKED V1 ──────────
// Pre-init step: handle /auth-callback route INAINTE de Firebase sync init.
// Magic Link verify + Google OAuth id_token exchange fire in handleAuthCallbackRoute.
// Returns null cand URL nu e /auth-callback (no-op majority case).
//
// Post-auth-success per §56.4.1 + §AMENDMENT 2026-05-04.4: trigger Daniel
// legacy `users/daniel` → `users/{uid}` migration runner (idempotent — does
// nothing daca deja migrated sau daca uid != Daniel's uid).
async function processAuthCallbackOnBoot() {
  try {
    const result = await handleAuthCallbackRoute();
    if (!result) return null;
    if (result.ok) {
      // Per §56.4 LOCKED V1: idempotent migration runner. Already-migrated
      // sau no-source = no-op silent. Sets `_migration` flag in localStorage.
      try { await runAuthPathMigration(); }
      catch (err) { console.warn('[Auth] post-auth migration runner threw:', err); }
    } else {
      console.warn('[Auth] callback failed:', result.provider, result.error);
    }
    return result;
  } catch (err) {
    console.warn('[Auth] handleAuthCallbackRoute threw:', err);
    return null;
  }
}

// ── INIT ─────────────────────────────────────────────────────
async function init() {
  applyTheme(getActiveTheme());
  setupOfflineIndicator();
  cleanDuplicateLogs();
  // Auth callback processing happens BEFORE Firebase sync init: ensures
  // post-Magic-Link verify, the subsequent initFirebaseSync runs cu uid
  // resolved (so `users/<uid>` path used immediately, NU Anonymous null).
  await processAuthCallbackOnBoot();
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
  // ── ADR 018 §4 Schema migrations — eager, before any engine read ──────────
  // Registry currently empty; first real migration arrives when CDL bumps v1→v2.
  // Wired now so future migrations don't silent-fail.
  await runBootMigrations();
  window.__constants = { PROG, KCAL_TARGET, PROT_TARGET };
  await initFirebaseSync();
  await clearStalePatternsIfColdStart(); // after sync: Firebase can't restore cleared keys
  // ── ADR 020 Tier 0 → Tier 1 rotation ─────────────────────────────────────
  // Smoke test post-deploy (Daniel manual):
  //   1. DevTools → Application → Local Storage → verify size < 4MB
  //   2. DevTools → Application → IndexedDB → verify SalafullDB stores exist
  //   3. Console: log lines `[Storage] Rotated N entries Tier 0 → Tier 1`
  //   4. After 1h tick: rotation runs again automat (check console)
  //   5. To force rotation now: open Console → call `window.__forceRotation()`
  //      (dev helper exposed via `exposeForceRotationHelper`).
  await startTierRotation();
  exposeForceRotationHelper();
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

  // Populeaza pr-records din istoricul complet la fiecare init
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
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  checkWeightReminder();

  // §56.1.1 auth-banner-soft — non-blocking "Salveaza-ti progresul" prompt
  // for Anonymous users post-onboarding. Auto-hides on auth success.
  // Per §56.3.1: shown DUPA T0 onboarding (Investment Phase commitment).
  // Banner self-skips daca isAuthenticated() already true.
  if (onboardingDone && !isAuthenticated()) {
    mountAuthBanner({
      googleClientId: window.__GOOGLE_CLIENT_ID,
      onAuthSuccess: ({ uid }) => {
        // Post-auth success — trigger Daniel legacy path migration.
        // Idempotent: no-op for non-Daniel users sau already-migrated.
        runAuthPathMigration().catch(err => {
          console.warn('[Auth] post-banner-auth migration threw:', err);
        });
      },
    });
  }
}

// Expose auth helpers globally pentru future onclick="" wiring in Settings UI
// (Phase 2 — Account Lifecycle: logout double-confirm, account deletion 2-step).
window.showAuthScreen = showAuthScreen;
window.isAuthenticated = isAuthenticated;

init();
