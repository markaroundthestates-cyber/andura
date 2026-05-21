// ══ MIGRATION 2026-05-02: 5→6 calibration tier renumber ════════════════════
// Per ADR 009 §AMENDMENT D1 (RESOLVED 2026-04-30 evening): canonical 6-tier
// system post DEVELOPING insertion at id 2. Existing tier ids 2/3/4 shift to
// 3/4/5. CDL entries with `context.calibrationLevel` as a name string need
// no transform (names didn't change). Defensive migration handles the case
// where context.calibrationLevel is persisted as the full level object —
// rare per coachDirector.js:235 (`?.name || ...`) but possible per ADR 011
// CDL primitive snapshot patterns.
//
// Idempotent: schemaVersion gate (v1→v2) prevents re-runs. Re-running on
// v2 entries is a no-op per migrationRunner contract.
//
// Cross-refs:
//   - ADR 009 §AMENDMENT 2026-04-30 (canonical 6-tier table)
//   - HANDOVER §34.3 (Blocker 3 spec)
//   - src/engine/calibration.js (CALIBRATION_LEVELS source-of-truth post refactor)
//   - src/migrations/migrationRunner.js (eager runner contract per ADR 018 §4)

/**
 * Map old tier id (5-tier system) → new tier id (6-tier system).
 * COLD_START (0) and INITIAL (1) unchanged. PERSONALIZING/PERSONALIZED/OPTIMIZED
 * shift by +1 to make room for DEVELOPING at id 2.
 *
 * @param {number} oldId
 * @returns {number} newId
 */
export function remapTierId(oldId) {
  if (typeof oldId !== 'number' || !Number.isFinite(oldId)) return oldId;
  if (oldId <= 1) return oldId;          // COLD_START, INITIAL unchanged
  if (oldId >= 2 && oldId <= 4) return oldId + 1; // PERSONALIZING/PERSONALIZED/OPTIMIZED bump
  return oldId;                          // unknown id — leave untouched
}

/**
 * Transform a CDL entry from v1 (5-tier id space) → v2 (6-tier id space).
 * Idempotent at the boundary: re-running on v2 entries returns them unchanged
 * (runner enforces via schemaVersion filter).
 *
 * @param {object} entry - CDL entry
 * @returns {object} migrated entry (runner sets schemaVersion=2)
 */
/**
 * @typedef {{ context?: { calibrationLevel?: unknown }, calibrationLevel?: unknown, [k: string]: unknown }} MigEntry
 *
 * @param {unknown} entry
 * @returns {unknown}
 */
export function migrate(entry) {
  if (!entry || typeof entry !== 'object') return entry;

  // calibrationLevel may live on entry.context (primary) or entry root (legacy
  // shape per ADR 011 §context snapshot evolution). Handle both defensively.
  const next = /** @type {MigEntry} */ ({ ...entry });
  if (next.context && typeof next.context === 'object') {
    next.context = _remapLevelField(/** @type {{ calibrationLevel?: unknown, [k: string]: unknown }} */ (next.context));
  }
  // Some early CDL shapes also carried calibrationLevel at the entry root.
  if ('calibrationLevel' in next && typeof next.calibrationLevel === 'object') {
    next.calibrationLevel = _remapLevelObject(next.calibrationLevel);
  }
  return next;
}

/**
 * @param {{ calibrationLevel?: unknown, [k: string]: unknown }} ctx
 */
function _remapLevelField(ctx) {
  const lvl = ctx.calibrationLevel;
  if (lvl == null) return ctx;
  if (typeof lvl === 'string') return ctx;       // name-only: names didn't change
  if (typeof lvl !== 'object') return ctx;
  return { ...ctx, calibrationLevel: _remapLevelObject(lvl) };
}

/**
 * @param {unknown} lvl
 */
function _remapLevelObject(lvl) {
  if (!lvl || typeof lvl !== 'object') return lvl;
  const obj = /** @type {{ id?: unknown, [k: string]: unknown }} */ (lvl);
  if (typeof obj.id !== 'number') return lvl;
  return { ...obj, id: remapTierId(obj.id) };
}

/**
 * Migration registration entry per ADR 018 §4 contract. Imported by
 * src/migrations/MIGRATIONS.js into the eager runner registry.
 */
export const TIER_5_TO_6_MIGRATION = {
  fromVersion: 1,
  toVersion: 2,
  description: 'tier 5→6 id renumber (DEVELOPING inserted, ADR 009 §AMENDMENT D1)',
  storageKeys: ['coach-decisions', 'coach-decisions-aggregate', 'coach-decisions-archive'],
  migrate,
};
