// ══ DIMENSION REGISTRY (ADR 018 §1) ═══════════════════════════════════════
// Static array of dimensions that contribute to engine decision-making.
// Coach Director (post-Sprint Foundation strangler) iterates this registry,
// NOT hard-coded calls. Adding a new dimension = new entry here + zero edit
// in director.
//
// Per ADR 018 DP-1 (APPROVED 2026-04-27): static export-const array, NU
// dynamic register() API. YAGNI clearly at scale N=1.

import { isEnabled } from '../util/featureFlags.js';
import * as autoAggressionDimension from './dimensions/autoAggressionDimension.js';

/**
 * @typedef {'GATE'|'ADJUSTMENT'|'ENHANCEMENT'} DimensionStage
 *
 * @typedef {object} DimensionRegistryEntry
 * @property {string} id - Stable unique identifier (ex: 'AUTO_AGGRESSION', 'PROFILE_TYPING')
 * @property {object} module - Imported module exporting analyze(input) per ADR 018 §2
 * @property {DimensionStage} stage - Pipeline stage (gate / adjust / enhance)
 * @property {number} priority - 0-100 numeric (ADR 004 scale, hybrid per ADR 018 DP-3)
 * @property {string|null} enabledFlag - Feature flag id (ADR 018 §5) or null = always-on
 * @property {string|null} requiresCalibration - Min calibration tier (ADR 009) or null
 * @property {number} schemaVersion - DimensionResult schema version (ADR 018 §4)
 */

/**
 * Static dimensions array. Modify inline to register a new dimension.
 *
 * Initial state in Sprint Foundation Batch 1: empty.
 * Actual dimensions get registered post-Batch 1, in the order specified by
 * ADR 018 Migration Path:
 *
 *   Phase 1 (Strangler AA):
 *     { id: 'AUTO_AGGRESSION', module: ...autoAggression, stage: 'GATE',
 *       priority: 95, enabledFlag: 'aa_detection_v1', requiresCalibration: null,
 *       schemaVersion: 1 }
 *
 *   Phase 2 (Profile Typing greenfield, ADR 014 update):
 *     { id: 'PROFILE_TYPING', module: ...profileTyping, stage: 'ADJUSTMENT',
 *       priority: 65, enabledFlag: 'profile_typing_v1',
 *       requiresCalibration: 'INITIAL', schemaVersion: 1 }
 *
 *   Phase 3 (Wrap existing rules → CORE_RULES):
 *     { id: 'CORE_RULES', module: ...coreRules, stage: 'GATE',
 *       priority: 100, enabledFlag: null, requiresCalibration: null,
 *       schemaVersion: 1 }
 *
 *   Phase 4 (Greenfield ADR 016 + 017):
 *     { id: 'VITALITY', module: ...vitality, stage: 'ADJUSTMENT',
 *       priority: 65, enabledFlag: 'vitality_layer_v1',
 *       requiresCalibration: 'PERSONALIZING', schemaVersion: 1 }
 *     { id: 'DEMOGRAPHIC_PRIOR', module: ...demographicPrior, stage: 'ADJUSTMENT',
 *       priority: 40, enabledFlag: 'demographic_prior_v1',
 *       requiresCalibration: 'COLD_START', schemaVersion: 1 }
 *
 * @type {Array<DimensionRegistryEntry>}
 */
export const DIMENSIONS = [
  // Phase 1 — Strangler AA (ADR 018 §6). Always-on at every calibration tier
  // (matches legacy applyAAAdjustments behavior); gated behind aa_via_cluster
  // feature flag (default 0% rollout) so production keeps running the legacy
  // path until parity is validated.
  {
    id: autoAggressionDimension.DIMENSION_ID,
    module: autoAggressionDimension,
    stage: 'ENHANCEMENT',
    priority: 95,
    enabledFlag: 'aa_via_cluster',
    requiresCalibration: null,
    schemaVersion: 1,
  },
];

/**
 * Calibration tier ordering (ADR 009). Index = severity (higher = more demanding).
 * Names normalized to UPPERCASE for case-insensitive comparison
 * (calibration.js exposes lowercase 'cold_start' etc; ADR docs reference UPPERCASE).
 */
export const CALIBRATION_TIER_ORDER = [
  'COLD_START',
  'INITIAL',
  'PERSONALIZING',
  'PERSONALIZED',
  'OPTIMIZED',
];

/**
 * Filter the registry for dimensions active under the given ctx + flags.
 *
 * Active = (calibration gate open) AND (feature flag enabled OR no flag).
 *
 * Flag resolution order:
 *   - When `opts.flags` is provided (testing path): explicit map, key must be
 *     explicitly `true` to enable; missing keys or `false` both disable (fail-closed).
 *   - When `opts.flags` is NOT provided (production path): delegate to
 *     `featureFlags.isEnabled(flagId, ctx.userId)` per ADR 018 §5 + DP-6
 *     (per-user hash bucketing).
 *
 * @param {object} ctx - CoachContext snapshot (uses ctx.calibrationLevel + ctx.userId)
 * @param {object} [opts]
 * @param {object} [opts.flags] - Explicit flag map { flagId: boolean } — testing override
 * @param {Array<DimensionRegistryEntry>} [opts.dimensions] - Override registry (testing)
 * @returns {Array<DimensionRegistryEntry>}
 */
export function getActiveDimensions(ctx, opts = {}) {
  const { flags, dimensions = DIMENSIONS } = opts;
  const ctxLevel = _normalizeCalibrationName(ctx?.calibrationLevel);

  return dimensions.filter(dim => {
    if (!isCalibrationGateOpen(dim.requiresCalibration, ctxLevel)) return false;
    if (dim.enabledFlag) {
      if (flags) {
        if (!flags[dim.enabledFlag]) return false;
      } else if (!isEnabled(dim.enabledFlag, ctx?.userId)) {
        return false;
      }
    }
    return true;
  });
}

/**
 * @param {string|null} required - Minimum tier required, or null = always open
 * @param {string|null} ctxLevel - Current ctx tier (already normalized) or null
 * @returns {boolean}
 */
export function isCalibrationGateOpen(required, ctxLevel) {
  if (!required) return true;
  if (!ctxLevel) return false;
  const reqIdx = CALIBRATION_TIER_ORDER.indexOf(_normalizeTierName(required));
  const ctxIdx = CALIBRATION_TIER_ORDER.indexOf(_normalizeTierName(ctxLevel));
  if (reqIdx === -1 || ctxIdx === -1) return false;
  return ctxIdx >= reqIdx;
}

/**
 * Lookup helper — find registry entry by id.
 *
 * @param {string} id
 * @param {Array<DimensionRegistryEntry>} [dimensions=DIMENSIONS]
 * @returns {DimensionRegistryEntry|undefined}
 */
export function findDimension(id, dimensions = DIMENSIONS) {
  return dimensions.find(d => d.id === id);
}

/**
 * Validate that a registry entry has the correct shape. Throws on invalid input.
 * Used at registration sites + tests.
 *
 * @param {*} entry
 * @returns {void}
 */
export function assertValidDimensionEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    throw new TypeError('DimensionRegistryEntry must be an object');
  }
  if (typeof entry.id !== 'string' || entry.id.length === 0) {
    throw new TypeError('DimensionRegistryEntry.id must be a non-empty string');
  }
  if (!entry.module || typeof entry.module !== 'object') {
    throw new TypeError(`DimensionRegistryEntry[${entry.id}].module must be an imported module`);
  }
  if (typeof entry.module.analyze !== 'function') {
    throw new TypeError(`DimensionRegistryEntry[${entry.id}].module must export an 'analyze' function`);
  }
  if (!['GATE', 'ADJUSTMENT', 'ENHANCEMENT'].includes(entry.stage)) {
    throw new TypeError(`DimensionRegistryEntry[${entry.id}].stage must be 'GATE'|'ADJUSTMENT'|'ENHANCEMENT' (got '${entry.stage}')`);
  }
  if (typeof entry.priority !== 'number' || entry.priority < 0 || entry.priority > 100) {
    throw new TypeError(`DimensionRegistryEntry[${entry.id}].priority must be a number 0..100 (got ${entry.priority})`);
  }
  if (entry.enabledFlag !== null && typeof entry.enabledFlag !== 'string') {
    throw new TypeError(`DimensionRegistryEntry[${entry.id}].enabledFlag must be string|null`);
  }
  if (entry.requiresCalibration !== null) {
    if (typeof entry.requiresCalibration !== 'string') {
      throw new TypeError(`DimensionRegistryEntry[${entry.id}].requiresCalibration must be string|null`);
    }
    const norm = _normalizeTierName(entry.requiresCalibration);
    if (!CALIBRATION_TIER_ORDER.includes(norm)) {
      throw new TypeError(
        `DimensionRegistryEntry[${entry.id}].requiresCalibration '${entry.requiresCalibration}' not in [${CALIBRATION_TIER_ORDER.join(', ')}]`
      );
    }
  }
  if (typeof entry.schemaVersion !== 'number' || !Number.isInteger(entry.schemaVersion) || entry.schemaVersion < 1) {
    throw new TypeError(`DimensionRegistryEntry[${entry.id}].schemaVersion must be a positive integer (got ${entry.schemaVersion})`);
  }
}

/**
 * Validate the registry as a whole. Catches duplicate ids + entry shape errors.
 *
 * @param {Array<DimensionRegistryEntry>} [dimensions=DIMENSIONS]
 * @returns {void}
 */
export function assertValidRegistry(dimensions = DIMENSIONS) {
  if (!Array.isArray(dimensions)) {
    throw new TypeError('DIMENSIONS must be an array');
  }
  const seen = new Set();
  for (const entry of dimensions) {
    assertValidDimensionEntry(entry);
    if (seen.has(entry.id)) {
      throw new TypeError(`DimensionRegistry duplicate id: '${entry.id}'`);
    }
    seen.add(entry.id);
  }
}

function _normalizeCalibrationName(level) {
  if (!level) return null;
  if (typeof level === 'string') return _normalizeTierName(level);
  if (typeof level === 'object' && typeof level.name === 'string') return _normalizeTierName(level.name);
  return null;
}

function _normalizeTierName(name) {
  return String(name).toUpperCase();
}
