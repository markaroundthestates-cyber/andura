// ══ MIGRATIONS REGISTRY (ADR 018 §4) ════════════════════════════════════════
// Ordered list of schema migrations applied eagerly on app load via
// `runMigrations()` (see ./migrationRunner.js).
//
// Per ADR 018 DP-5 (APPROVED 2026-04-27): eager trigger pe init, NU lazy on
// read. Single batch pass, fail-loud (Sentry) pe migration throws.
//
// ── Migration shape ────────────────────────────────────────────────────────
//
//   {
//     fromVersion: number,            // entries at this version are migrated
//     toVersion:   number,            // target version (= fromVersion + 1 by convention)
//     description: string,            // human-readable, used in logs + Sentry tags
//     storageKeys: string[],          // localStorage keys to scan
//     migrate(entry): object          // pure transform; runner sets schemaVersion automat
//   }
//
// Each migration MUST be idempotent at the boundary: re-running on entries
// already at toVersion is a no-op (runner enforces via version filter).
//
// ── Initial state ──────────────────────────────────────────────────────────
//
// Empty in Sprint Foundation Batch 2. First real migration arrives when CDL
// schema bumps v1→v2 (TBD viitor — likely add `outcome.vitalitySignals`
// when ADR 016 Vitality Layer ports as dimension, or add `proposed.dimensionTrace`
// from Decision Cluster post-strangler).
//
// ── ADR 020 cross-ref (NOT a schema migration) ─────────────────────────────
//
// ADR 020 Tier 0 → Tier 1 rotation lives in `src/storage/tieringEngine.js`,
// NU here. Reasons:
//   - Schema migration = transform entry shape in-place (this runner's contract:
//     read array → migrate(entry) → write array same key).
//   - Tier rotation = MOVE entries between storage media (localStorage →
//     IndexedDB), pattern incompatible cu migrate(entry) signature.
//
// Rotation runs lazily on app init via `initAutoBackup()` + periodically
// (hourly default) per `ROTATION_CHECK_INTERVAL_MS`. Idempotent re-runs are
// no-ops once entries in Tier 0 are all <30d age. NU schema bump versioning.
//
// Future: daca schema-level CDL changes also need cross-tier propagation
// (e.g., re-shape Tier 1 archived entries), build a separate `tier1Migrations`
// runner OR extend this runner cu `targetTier: 'tier0' | 'tier1'`. Out of
// scope for ADR 020 §1.
//
// Future first migration template:
//
//   export const MIGRATIONS = [
//     {
//       fromVersion: 1,
//       toVersion: 2,
//       description: 'Add outcome.autoAggression nullable + outcome.rest_marked',
//       storageKeys: ['coach-decisions', 'coach-decisions-aggregate'],
//       migrate(entry) {
//         return {
//           ...entry,
//           outcome: entry.outcome
//             ? { autoAggression: null, rest_marked: null, ...entry.outcome }
//             : null,
//         };
//       },
//     },
//   ];

import { TIER_5_TO_6_MIGRATION } from './2026-05-02-tier-5-to-6.js';

/** @type {Array<{ fromVersion: number, toVersion: number, description: string, storageKeys: string[], migrate: (entry: object) => object }>} */
export const MIGRATIONS = [
  // v1 → v2: 5-tier → 6-tier id renumber (DEVELOPING inserted at id 2).
  // Per ADR 009 §AMENDMENT D1 (RESOLVED 2026-04-30 evening). Defensive: most
  // CDL entries store calibrationLevel as a name string and need no transform;
  // migration handles the rare case where the full level object was persisted.
  TIER_5_TO_6_MIGRATION,
];
