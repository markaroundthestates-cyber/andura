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
// Empty în Sprint Foundation Batch 2. First real migration arrives when CDL
// schema bumps v1→v2 (TBD viitor — likely add `outcome.vitalitySignals`
// when ADR 016 Vitality Layer ports as dimension, or add `proposed.dimensionTrace`
// from Decision Cluster post-strangler).
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

/** @type {Array<{ fromVersion: number, toVersion: number, description: string, storageKeys: string[], migrate: (entry: object) => object }>} */
export const MIGRATIONS = [];
