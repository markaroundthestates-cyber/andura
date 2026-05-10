// ══ MIGRATION RUNNER (ADR 018 §4) ═══════════════════════════════════════════
// Eager schema migration pass. Called on app init before any engine read so
// downstream readers can assume CURRENT schema (no per-reader version checks).
//
// Per ADR 018 DP-5 (APPROVED 2026-04-27): eager > lazy. Local-first storage,
// CDL Tier 1 max ~250 entries — sub-millisecond per entry. Fail-loud (Sentry
// critical) on migrate() throws. App continues in graceful degradation
// (aggregation engines already gestioneaza nullable fields per ADR 011).

import { DB } from '../db.js';
import { captureException as sentryCaptureException } from '../util/sentry.js';
import { MIGRATIONS } from './MIGRATIONS.js';

/** Sentry warning fires when a single migration touches more than this. */
export const LARGE_MIGRATION_THRESHOLD = 100;

/**
 * Returns the schema version of an entry. Entries fara explicit schemaVersion
 * field tratate ca v1 per ADR 018 §4 Implementation notes (existing entries
 * pre-versioning treated as initial schema).
 *
 * @param {*} entry
 * @returns {number}
 */
export function getEntryVersion(entry) {
  return entry && typeof entry.schemaVersion === 'number' ? entry.schemaVersion : 1;
}

/**
 * Run all pending migrations. Idempotent — re-runs are no-ops once entries
 * are at the latest version targeted by MIGRATIONS.
 *
 * Failsafe contract per ADR 018 §4:
 *   - migrate() throws on entry X → entries deja migrate (indices < X)
 *     persistate; restul (X si dupa) lasate in vechea forma; Sentry critical.
 *   - DB.set throws → Sentry critical, error recorded; runner continua cu
 *     migration-ul / key-ul urmator.
 *   - Non-array entries la storageKey → log warning + skip (defensive).
 *
 * @param {object} [opts]
 * @param {Array} [opts.migrations=MIGRATIONS] - Override migration list (testing)
 * @param {object} [opts.db=DB] - Override DB sink (testing)
 * @param {{ captureException?: Function }} [opts.sentry] - Override Sentry sink
 * @param {{ log?: Function, warn?: Function, error?: Function }} [opts.logger=console]
 * @returns {{ migrationsRun: number, totalEntriesMigrated: number, perMigration: Array, errors: Array }}
 */
export function runMigrations(opts = {}) {
  const migrations = opts.migrations ?? MIGRATIONS;
  const db = opts.db ?? DB;
  const sentry = opts.sentry ?? { captureException: sentryCaptureException };
  const logger = opts.logger ?? console;

  if (!Array.isArray(migrations) || migrations.length === 0) {
    return { migrationsRun: 0, totalEntriesMigrated: 0, perMigration: [], errors: [] };
  }

  // Stable sort by fromVersion ASC — chains apply in order even daca registry
  // is registered out-of-order (defensive). V8 sort is stable per ECMA-2019.
  const sorted = [...migrations].sort((a, b) => a.fromVersion - b.fromVersion);

  const errors = [];
  const perMigration = [];
  let totalEntriesMigrated = 0;

  for (const migration of sorted) {
    const { fromVersion, toVersion, description, storageKeys, migrate } = migration;
    let migratedThisMigration = 0;

    for (const key of storageKeys) {
      let entries;
      try {
        entries = db.get(key);
      } catch (err) {
        const ctx = { migration: description, fromVersion, toVersion, storageKey: key, op: 'read' };
        logger.warn?.(`[Migrations] Failed to read storage key '${key}':`, err);
        _safeSentry(sentry, err, { tags: { component: 'migrationRunner', severity: 'warning', ...ctx } });
        errors.push({ ...ctx, reason: _stringifyError(err) });
        continue;
      }
      if (entries == null) continue;
      if (!Array.isArray(entries)) {
        logger.warn?.(`[Migrations] Storage key '${key}' is not an array (got ${typeof entries}) — skipping`);
        continue;
      }

      const next = [];
      let aborted = false;

      for (const entry of entries) {
        // Once aborted, copy remaining entries unchanged (ADR 018 §4 Failsafe).
        if (aborted) {
          next.push(entry);
          continue;
        }
        const version = getEntryVersion(entry);
        if (version !== fromVersion) {
          // Chain integrity: skip if already past this step OR version gap (not our shape).
          next.push(entry);
          continue;
        }
        try {
          const migrated = migrate(entry);
          if (!migrated || typeof migrated !== 'object' || Array.isArray(migrated)) {
            throw new TypeError('migrate() must return a plain object');
          }
          next.push({ ...migrated, schemaVersion: toVersion });
          migratedThisMigration++;
        } catch (err) {
          const ctx = {
            migration: description,
            fromVersion,
            toVersion,
            storageKey: key,
            entryId: entry?.id ?? null,
            op: 'migrate',
          };
          logger.error?.(`[Migrations] CRITICAL: migrate() threw on '${key}':`, err, ctx);
          _safeSentry(sentry, err, { tags: { component: 'migrationRunner', severity: 'critical', ...ctx } });
          errors.push({ ...ctx, reason: _stringifyError(err) });
          next.push(entry);
          aborted = true;
        }
      }

      try {
        db.set(key, next);
      } catch (err) {
        const ctx = { migration: description, fromVersion, toVersion, storageKey: key, op: 'persist' };
        logger.error?.(`[Migrations] CRITICAL: persist failed for '${key}':`, err);
        _safeSentry(sentry, err, { tags: { component: 'migrationRunner', severity: 'critical', ...ctx } });
        errors.push({ ...ctx, reason: _stringifyError(err) });
      }
    }

    totalEntriesMigrated += migratedThisMigration;
    perMigration.push({ fromVersion, toVersion, description, count: migratedThisMigration });

    logger.log?.(
      `[Migrations] ${description} (v${fromVersion}→v${toVersion}): ${migratedThisMigration} entries migrated across [${storageKeys.join(', ')}]`
    );

    if (migratedThisMigration > LARGE_MIGRATION_THRESHOLD) {
      logger.warn?.(
        `[Migrations] Large migration: ${migratedThisMigration} entries (> ${LARGE_MIGRATION_THRESHOLD}) for '${description}'`
      );
      _safeSentry(sentry, new Error(`Large migration: ${migratedThisMigration} entries`), {
        tags: {
          component: 'migrationRunner',
          severity: 'warning',
          op: 'large_migration',
          migration: description,
          fromVersion,
          toVersion,
          count: migratedThisMigration,
        },
      });
    }
  }

  return { migrationsRun: sorted.length, totalEntriesMigrated, perMigration, errors };
}

function _safeSentry(sentry, err, ctx) {
  if (!sentry?.captureException) return;
  try { sentry.captureException(err, ctx); }
  catch { /* swallow Sentry errors so runner never dies from monitoring */ }
}

function _stringifyError(err) {
  if (!err) return 'unknown';
  if (err instanceof Error) return err.message || err.toString();
  return String(err);
}
