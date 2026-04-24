// ══ COACH PAGE ORCHESTRATOR ══════════════════════════════════
import './coach/state.js';

export { getGroupColor, getExGroup, getDisplayTime, calcAccurateTime,
         getAdaptiveTime, getTodayExercises, resetNotes } from './coach/util.js';
export { extractAndSavePRs, cleanFakeLogs, renderPRWall, togglePRWall } from './coach/pr.js';
export { skipPause } from './coach/restTimer.js';
export { updateExCard, setDone, confirmReps, selectRPE,
         adjSessionReps, renderSessLog, editSessionKg,
         adjSessionKg, confirmSessionKg, confirmEditKg, toggleMute } from './coach/logging.js';
export { showSessionRating, rateSession } from './coach/rating.js';
export { showReadinessModal, selectReadiness, showSkipModal, confirmSkip,
         showAlternativeModal, selectAlternative, markEquipmentUnavailable,
         markOccupied, showWhyForExercise } from './coach/modals.js';
export { startSession, skipExercise, cancelWorkout, endSession, closeSummary,
         updateSessionProgress, finishEarly, confirmEarlyStop,
         releaseWakeLock, requestWakeLock } from './coach/session.js';
export { renderCoachIdle, toggleExList, checkMuscleBalance, checkWeightReminder,
         saveStepsQuick } from './coach/renderIdle.js';
