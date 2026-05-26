// ══ DATA REGISTRY — Central source of truth for all localStorage keys ════════
// All key names, categories, and reset behavior live here.
// window.__dataRegistryEnabled is set in main.js once the registry is active.

// Stable training/nutrition data — deleted on fullReset, preserved by resetTestData
export const USER_DATA_KEYS = [
  'weights', 'kcals', 'prots', 'logs', 'readiness',
  'phase-override', 'phase-log', 'phase-change-date', 'bf-override',
  'pr-records', 'current-kcal', 'suppl-list', 'waters', 'workout-skips',
  'session-burns', 'wellbeing', 'notif-enabled', 'closed-days', 'muted',
  'onboarding-done', 'onboarding-completed', 'last-recalibration', 'sf.userConfig',
  'profile-history'
];

// Coach/session transient state — deleted by both resetTestData and fullReset
export const TEST_RESIDUE_KEYS = [
  'auto-recommendations', 'applied-recommendations',
  'early-stops', 'session-draft', 'peak-hours', 'step-streaks',
  'session-start-hours', 'session-ratings', 'dev-mode',
  'unavailable-equipment', 'equipment-occupied-session',
  'pattern-learning-cache', 'detected-patterns',
  'weak-group-cache', 'response-profile', 'steps-today'
];

// Subset of keys that trigger director cache invalidation when written (mirrored in firebase.js)
export const COACH_RELEVANT_KEYS = [
  'logs', 'readiness', 'phase-override', 'current-kcal', 'weights',
  'unavailable-equipment', 'equipment-occupied-session', 'applied-patterns',
  'session-burns', 'early-stops', 'workout-skips'
];

// Prefixes for keys generated at runtime with template literals
export const DYNAMIC_KEY_PREFIXES = [
  'ex-extra-sets-',  // dp.js: per-exercise extra sets
  'muscle-extra-',   // renderIdle.js: per-muscle extra sets
  'aa-cooldown-',    // aa.js: auto-adjustment cooldowns
  'backup-',         // autoBackup.js / dataCleanup.js: timestamped backups
];

// Keys that survive fullReset: device identity + UI preferences + last backup for undo.
// `data-owner-uid` (H1 shared-device fix) is the marker recording which uid the
// local Tier-0 data belongs to; it must survive a reset so the SAME user is not
// needlessly re-wiped on their next login, while a DIFFERENT uid still triggers
// the account-switch wipe (see util/dataReset.js enforceDataOwner).
export const PRESERVE_ON_RESET_KEYS = ['device-id', 'active-theme', 'last-backup', 'data-owner-uid'];

// Coach Decision Log + derived behavioral state (ADR 011, 013, 014).
// Semantic: derived behavioral history, not raw input.
// resetTestData: PRESERVE (real history, not test residue).
// fullReset: WIPE (start-over semantic — fresh history for clean coaching).
export const CDL_KEYS = [
  'coach-decisions',
  'coach-decisions-aggregate',
  'coach-decisions-archive',
  'cdl-patterns',
  'applied-patterns',
];

// Returns all currently-stored keys that match a DYNAMIC_KEY_PREFIXES entry
export function getAllDynamicKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && DYNAMIC_KEY_PREFIXES.some(p => k.startsWith(p))) keys.push(k);
  }
  return keys;
}
