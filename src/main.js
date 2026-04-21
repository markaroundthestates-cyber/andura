// ══ MAIN ENTRY POINT ═════════════════════════════════════════
import { initFirebaseSync } from './firebase.js';
import { injectBaseline, injectMFPWeights } from './inject.js';
import { initW, initKcal, initProt } from './pages/weight.js';
import { renderCoachIdle, checkWeightReminder } from './pages/coach.js';
import { renderDash } from './pages/dashboard.js';
import { renderProg } from './pages/plan.js';
import { goTo } from './ui/nav.js';
import { checkOnboarding } from './onboarding.js';
import { DB } from './db.js';

// Expune funcții globale pentru onclick="" în HTML
import { toast } from './ui/ui.js';
import { saveW, saveKcal, adjKcal, setKcalDirect,
         saveProt, adjProt, setProtDirect, shiftLogDate, toggleDatePicker,
         exportCSV, exportJSON, importJSON, triggerMFPImport,
         toggleHistoryAll } from './pages/weight.js';
import { cleanFakeLogs } from './pages/coach.js';
import { setDone, confirmReps, selectRPE, startSession, cancelWorkout,
         skipExercise, adjSessionReps, editSessionKg, confirmEditKg,
         rateSession } from './pages/coach.js';
import { setPhaseOverride, clearPhaseOverride } from './pages/plan.js';
import { updateNotifBtn, requestNotifications, closeDayFromDash } from './pages/dashboard.js';

// Toate funcțiile accesibile din HTML via onclick
Object.assign(window, {
  goTo, toast,
  saveW, saveWeight: saveW, adjWeight: saveW, saveKcal, adjKcal, setKcalDirect,
  saveProt, adjProt, setProtDirect, shiftLogDate, toggleDatePicker,
  exportCSV, exportJSON, importJSON, triggerMFPImport,
  toggleHistoryAll, cleanFakeLogs,
  setDone, confirmReps, selectRPE, startSession, cancelWorkout,
  skipExercise, adjSessionReps, editSessionKg, confirmEditKg, rateSession,
  setPhaseOverride, clearPhaseOverride,
  updateNotifBtn, requestNotifications, closeDayFromDash,
  sp: goTo,
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
