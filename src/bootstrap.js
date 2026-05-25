// ══ APP BOOTSTRAP — Schema migrations + tier rotation wiring (ADR 018 + 020) ═
// Encapsulates the boot orchestration steps so they're testable in isolation:
//
//   - runBootMigrations()         → schema migrations eager (ADR 018 §4)
//   - startTierRotation()         → ADR 020 Phase 1 rotation initial pass + timer
//   - exposeForceRotationHelper() → window.__forceRotation dev helper
//
// All helpers are non-blocking (graceful degradation per ADR 018 §4): boot
// continues even if migrations or rotation fail. Errors land in Sentry via
// the underlying modules + console diagnostics for dev visibility.

import { runMigrations } from './migrations/index.js';

// DEXIE-EAGER-ON-BOOT perf-infra — tieringEngine.js statically imports Dexie
// (storage/db.js → `import Dexie`), so a static import here pulled the ~32KB
// vendor-data (Dexie) chunk onto every anonymous cold-start critical path —
// contradicting the vite.config claim that Dexie is lazy (destructive-action
// only). startTierRotation + the dev helper now dynamically `import()` the
// tiering module so Dexie loads off the boot path (still runs the ADR 020
// no-data-loss rotation, just lazily). The import is cached after first call.

/**
 * Run pending schema migrations (ADR 018 §4 eager, before any engine read).
 * Logs summary or warnings; never throws.
 *
 * @returns {Promise<{ migrationsRun: number, totalEntriesMigrated: number, errors: Array } | null>}
 */
export async function runBootMigrations() {
  try {
    const result = await runMigrations();
    if (result?.totalEntriesMigrated > 0) {
      console.log(`[Migrations] ${result.totalEntriesMigrated} entries migrated`);
    }
    if (result?.errors?.length > 0) {
      console.warn('[Migrations] Errors:', result.errors);
    }
    return result;
  } catch (err) {
    console.error('[Migrations] Failed:', err);
    // Continue boot — non-blocking per ADR 018 §4 graceful degradation
    return null;
  }
}

/**
 * Initialize ADR 020 Phase 1 tier rotation (initial pass + periodic timer).
 * Logs initial rotation summary; never throws.
 *
 * @param {object} [opts] - Forwarded to `initAutoBackup` (testing override)
 * @returns {Promise<{ initial: { rotated: number } | null } | null>}
 */
export async function startTierRotation(opts) {
  try {
    // Lazy import keeps Dexie off the cold-start critical path (see header).
    const { initAutoBackup } = await import('./storage/tieringEngine.js');
    const result = await initAutoBackup(opts);
    const rotated = result?.initial?.rotated;
    if (rotated > 0) {
      console.log(`[Storage] Rotated ${rotated} entries Tier 0 → Tier 1 (initial pass)`);
    }
    return result;
  } catch (err) {
    console.error('[Storage] initAutoBackup failed:', err);
    // Continue boot — non-blocking
    return null;
  }
}

/**
 * Expose `window.__forceRotation()` as a dev helper for post-deploy smoke tests.
 * Call from DevTools Console to trigger an immediate rotation pass.
 *
 * Safe in non-browser contexts (no-op when `window` undefined).
 */
export function exposeForceRotationHelper() {
  if (typeof window === 'undefined') return;
  window.__forceRotation = async () => {
    // Lazy import keeps Dexie off the cold-start critical path (see header).
    const { rotateOnce } = await import('./storage/tieringEngine.js');
    const result = await rotateOnce();
    console.log('[Storage] Forced rotation result:', result);
    return result;
  };
}
