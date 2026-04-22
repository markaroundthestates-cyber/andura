// ══ MAIN ENTRY POINT ══════════════════════════════════════════
import { initFirebaseSync } from './firebase.js';
import { DP } from './engine/dp.js';
import { AA } from './engine/aa.js';
import { injectBaseline, injectMFPWeights } from './inject.js';
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
         selectDateFromPicker, setChartRange, savePhoto, setBFOverride, clearBFOverride } from './pages/weight.js';
import { cleanFakeLogs, saveStepsQuick, getGroupColor, toggleMute, skipPause, resetNotes } from './pages/coach.js';
import { setDone, confirmReps, selectRPE, startSession, cancelWorkout,
         skipExercise, adjSessionReps, editSessionKg, confirmEditKg,
         adjSessionKg, confirmSessionKg, rateSession, endSession } from './pages/coach.js';
import { setPhaseOverride, clearPhaseOverride } from './pages/plan.js';
import { updateNotifBtn, requestNotifications, closeDayFromDash, dismissMFPPrompt } from './pages/dashboard.js';

// Toate funcțiile accesibile din HTML via onclick
Object.assign(window, {
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
  toggleHistoryAll, cleanFakeLogs, saveStepsQuick, getGroupColor, resetNotes,
  setDone, confirmReps, selectRPE, startSession, cancelWorkout, endSession,
  skipExercise, adjSessionReps, editSessionKg, confirmEditKg, adjSessionKg, confirmSessionKg, rateSession,
  setPhaseOverride, clearPhaseOverride,
  updateNotifBtn, requestNotifications, closeDayFromDash, dismissMFPPrompt,
  sp: goTo, __v: 6,
});

// ── INIT ─────────────────────────────────────────────────────
async function init() {
  await initFirebaseSync();
  injectBaseline();
  injectMFPWeights();
  initW();
  initKcal();
  initProt();

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
