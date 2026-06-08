// ══ SCHEDULE ADAPTER — Calendar V1 S2 production wiring (BARREL) ════════════
// UI-side adapter per ADR 030 D2 thin scope. Engines remain pure-function per
// ADR 026 §9 — this module mutates UI state + localStorage edges only;
// downstream engines absorb naturally via existing evaluate(ctx) consuming
// ctx.meta.calendarOverride + ctx.equipment.available.
//
// Two concerns bundled per Calendar S1.0→S1.7 spec end-state:
//   1. Calendar week override: mid-week edit detection + recompute future days
//      while keeping past days invariant per Daniel verbatim 2026-05-12
//      "zilele trecute raman bifate si se recalibreaza restul".
//   2. Missing equipment list (Tier 0 active rolling per ADR 020): permanent
//      user-driven state, read/write/toggle parity mockup S1.7 demo JS
//      toggleEquipmentMissing() + hydrateAparateLipsa().
//
// ZERO mutation of engine modules. ZERO new engine methods. Engines unchanged.
//
// This file is a thin BARREL: the implementation was split into per-topic
// modules under ./scheduleAdapter/ (each grouped on the original section banner
// seams). Every public symbol is re-exported here with its ORIGINAL name so
// every external import keeps working unchanged. ZERO behavior change.

export {
  CALENDAR_OVERRIDE_KEY,
  MISSING_EQUIPMENT_KEY,
  SCHEDULE_STORE_KEY,
  DAY_INDICES,
  DAY_LABELS,
  VALID_EQUIPMENT_IDS,
} from './scheduleAdapter/constants.js';

export { mapDateToIndex, getWeekStartIso } from './scheduleAdapter/dateHelpers.js';

export { detectMidWeekEdit } from './scheduleAdapter/midWeekEdit.js';

export {
  getCalendarOverride,
  commitCalendarEdit,
  resetWeekOverride,
} from './scheduleAdapter/calendarOverrideStorage.js';

export {
  getMissingEquipment,
  setMissingEquipment,
  toggleMissingEquipment,
} from './scheduleAdapter/missingEquipmentStorage.js';

export {
  SKIPPED_EXERCISES_KEY,
  REFUSAL_COUNTER_KEY,
  REFUSAL_COUNTER_THRESHOLD,
  getSkippedExercises,
  setSkippedExercises,
  toggleSkippedExercise,
  getRefusalCounter,
  incrementRefusal,
  resetRefusalCounter,
} from './scheduleAdapter/refusalFlowStorage.js';

export { translateToEngineEquipment } from './scheduleAdapter/equipmentTranslation.js';

export { frequencyToSplit } from './scheduleAdapter/frequencySplit.js';

export { pickAlternativeCluster } from './scheduleAdapter/alternativeCluster.js';

export { weeklySessionsPerGroup } from './scheduleAdapter/weeklySessions.js';

export { FOCUS_PRESETS, FOCUS_PRESET_IDS, primaryEmphasizedGroup } from './scheduleAdapter/focus.js';

export { getDailyWorkout } from './scheduleAdapter/getDailyWorkout.js';
