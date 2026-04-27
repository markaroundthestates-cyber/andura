// ══ MIGRATIONS — Public entry point (ADR 018 §4) ════════════════════════════
// Single import surface for app init code:
//
//   import { runMigrations } from './migrations';
//   runMigrations(); // eager, before any engine read
//
// Re-exports the registry + runner + helpers for tests + ad-hoc tooling.

export { MIGRATIONS } from './MIGRATIONS.js';
export { runMigrations, getEntryVersion, LARGE_MIGRATION_THRESHOLD } from './migrationRunner.js';
