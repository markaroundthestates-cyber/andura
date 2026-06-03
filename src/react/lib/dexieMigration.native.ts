// ══ DEXIE MIGRATION — NATIVE NO-OP SIBLING (RN port) ════════════════════════
// Metro (iOS/Android) resolves THIS file over `dexieMigration.ts` for the native
// platform; Vite/Vitest + Metro-web keep the real `dexieMigration.ts` (Dexie /
// IndexedDB) UNCHANGED. Callers import this extensionless (`../lib/dexieMigration`
// in workoutStore.logic.ts, `../../../lib/dexieMigration` dynamic import in
// SettingsExport) so each bundler picks its own variant.
//
// WHY no-op: `dexieMigration.ts` is the web-only Tier-2 COLD archive — a SEPARATE
// IndexedDB database (`AnduraArchive`) holding sessions the workout store dropped
// past its in-store cap. Native Tier-1 runs on op-sqlite (`db.native.js`), which
// has no `sessions` archive table, and pulling `dexie` (web IndexedDB) into the
// RN graph is exactly what this port avoids. So on native the archive layer is a
// no-op: `archiveSession` drops the overflow silently and `getArchivedSessions`
// returns `[]` — BYTE-IDENTICAL to the real layer's fail-silent contract in any
// env where IndexedDB is unavailable (the jsdom path the web tests already pin).
//
// `dexie` is NOT imported here (not even transitively). The pure §35-H1
// aggregation now lives in the dependency-free `./sessionAggregate` module (LO-03)
// imported + re-exported by BOTH this native sibling and `dexieMigration.ts`, so
// the two no longer keep hand-synced copies that could silently drift. Importing
// the shared module does NOT pull Dexie (it has zero runtime deps), so the native
// graph stays Dexie-free.

import type { LastSessionSummary } from '../stores/workoutStore';
export { aggregateSessionsByWeek } from './sessionAggregate';
export type { WeeklySessionAggregate } from './sessionAggregate';

/** Native no-op archive — overflow session dropped (no cold-storage tier). */
export async function archiveSession(_session: LastSessionSummary): Promise<void> {
  /* native: no IndexedDB cold archive — fail-silent, mirrors web no-IDB path */
}

/** Native no-op — no archive store, returns empty (web no-IDB contract). */
export async function getArchivedSessions(): Promise<
  Array<LastSessionSummary & { archivedAt: number }>
> {
  return [];
}

/** Native no-op — nothing to clear. */
export async function clearArchive(): Promise<void> {
  /* native: no archive store */
}

// §35-H1 aggregation re-exported from ./sessionAggregate above (LO-03 SSOT).
