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
  'profile-history', 'dp-cal-factors',
  // Durable per-UID learned engine state — synced (firebase.js SYNC_KEYS) so they
  // MUST also reset locally (else they survive a fullReset while the cloud clears
  // them = shared-device cross-user bleed once a dp_*_v1 flag flips ON). Same
  // start-over semantic as dp-cal-factors. `tombstones` is the soft-delete ledger
  // (synced) — stale residue after a start-over, cleared for the same parity reason.
  'dp-strength-posterior', 'dp-recovery-constants', 'dp-exercise-pain',
  'dp-pain-memory', 'dp-log-quarantine', 'dp-equipment-ladder', 'dp-equipment-obs', 'dp-temperament',
  'dp-fatigue-curve', 'dp-learned-volume', 'dp-pivot-prompts',
  'dp-nof1-preference', 'dp-nof1-experiment', 'dp-behavior-tuning', 'dp-gyms', 'tombstones'
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

// ══ SYNC CLASSIFICATION — how each synced key behaves under sync + delete ════
// SSOT (Hardening A5): every key in firebase.js SYNC_KEYS is classified into one
// of three sync-behavior categories. This is the single explicit answer to
// "what happens to key X when it syncs and when the user deletes from it":
//
//   'append-only'  — a CDL-style log: entries are appended + (rarely) superseded
//                    in place, NEVER reordered or overwritten by sync. The merge
//                    is a UNION by entry id/ts (firebase.js array branch) so a
//                    remote append and a local append both survive. Resetting
//                    these is a deliberate start-over (CDL_KEYS wiped on fullReset),
//                    NOT a per-entry user delete.
//   'mutable'      — profile / settings / per-day rollups (objects + scalars):
//                    last-write-wins. firebase.js merges objects as
//                    Object.assign(remote, local) (LOCAL wins on key collision)
//                    and keeps the local scalar. No per-entry delete semantics.
//   'deletable'    — a ts-indexed history array the user can delete entries from.
//                    Deletion writes a tombstone (util/tombstones.js) that the
//                    post-merge filter re-applies so a remote copy can't resurrect
//                    a deleted entry. These are exactly tombstones.js TS_INDEXED_KEYS.
//
// `coach-decisions` is BOTH append-only (its CDL semantic) AND ts-indexed, so the
// tombstone filter can scrub a resurrected CDL row — but the user does not delete
// individual CDL entries from the UI, so it is classified by its primary
// append-only semantic. `tombstones` itself is the delete-ledger (mutable map).
/** @typedef {'append-only'|'mutable'|'deletable'} SyncCategory */
/** @type {Readonly<Record<string, SyncCategory>>} */
export const SYNC_CLASSIFICATION = Object.freeze({
  // ── deletable — ts-indexed history, user-deletable, tombstone-protected ──
  'logs': 'deletable',
  'pr-records': 'deletable',

  // ── append-only — CDL log + derived behavioral history (union on sync) ──
  'coach-decisions': 'append-only',
  'coach-decisions-aggregate': 'append-only',
  'coach-decisions-archive': 'append-only',
  'cdl-patterns': 'append-only',
  'applied-patterns': 'append-only',
  'profile-history': 'append-only',

  // ── mutable — objects/scalars, last-write-wins on sync ──────────────────
  'weights': 'mutable',
  'kcals': 'mutable',
  'prots': 'mutable',
  'waters': 'mutable',
  'wellbeing': 'mutable',
  'session-burns': 'mutable',
  'session-ratings': 'mutable',
  'muted': 'mutable',
  'notif-enabled': 'mutable',
  'suppl-list': 'mutable',
  'early-stops': 'mutable',
  'phase-log': 'mutable',
  'closed-days': 'mutable',
  'step-streaks': 'mutable',
  'steps-today': 'mutable',
  'bf-override': 'mutable',
  'phase-override': 'mutable',
  'current-kcal': 'mutable',
  'phase-change-date': 'mutable',
  'readiness': 'mutable',
  'unavailable-equipment': 'mutable',
  'sf.userConfig': 'mutable',
  'peak-hours': 'mutable',
  'session-start-hours': 'mutable',
  'auto-recommendations': 'mutable',
  'applied-recommendations': 'mutable',
  'session-draft': 'mutable',
  'workout-skips': 'mutable',
  'tombstones': 'mutable', // the soft-delete ledger itself (a merged map)

  // ── mutable — DP learned per-UID engine state (object-merge LWW on sync) ──
  // All are name-keyed or fixed-key OBJECT maps that the engine learns over time
  // and merges (remote ∪ local, local wins on collision). They are never
  // per-entry user-deleted (deletion = full reset, which CDL_KEYS-style wipes
  // them) and never an ordered append-log, so each is 'mutable'. Name-keyed maps
  // (firebase.js NAME_KEYED_SYNC_KEYS) round-trip via encode/decodeNameKeyed.
  'dp-cal-factors': 'mutable',
  'dp-strength-posterior': 'mutable',
  'dp-recovery-constants': 'mutable',
  'dp-exercise-pain': 'mutable',
  'dp-pain-memory': 'mutable',
  'dp-log-quarantine': 'mutable',
  'dp-equipment-ladder': 'mutable',
  'dp-equipment-obs': 'mutable',
  'dp-temperament': 'mutable',
  'dp-fatigue-curve': 'mutable',
  'dp-learned-volume': 'mutable',
  'dp-pivot-prompts': 'mutable',
  'dp-nof1-preference': 'mutable',
  'dp-nof1-experiment': 'mutable',
  'dp-behavior-tuning': 'mutable',
  'dp-gyms': 'mutable',
});

// Returns all currently-stored keys that match a DYNAMIC_KEY_PREFIXES entry
export function getAllDynamicKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && DYNAMIC_KEY_PREFIXES.some(p => k.startsWith(p))) keys.push(k);
  }
  return keys;
}
