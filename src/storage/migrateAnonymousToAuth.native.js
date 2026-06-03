// ══ MIGRATE ANONYMOUS → AUTH — NATIVE NO-OP SIBLING (RN port, CR-02 / HI-03) ══
// Metro (iOS/Android) resolves THIS file over `migrateAnonymousToAuth.js` for the
// native platform; Vite/Vitest + Metro-web keep the real (Dexie) module UNCHANGED.
// Callers import this extensionless (`../../storage/migrateAnonymousToAuth` in
// reactBoot.ts) so each bundler picks its own variant.
//
// WHY no-op: the web module is the IndexedDB Tier-1 namespace handover — it opens
// `andura_anonymous_<deviceId>` + `andura_<uid>` with `new Dexie(...)` and merges
// them (then `Dexie.delete`). That logic is intrinsically Dexie/IndexedDB and
// pulling `dexie` into the React Native graph is exactly what this port avoids
// (HI-03 — dexie stays a web-only dependency). On native the Tier-1 store is
// op-sqlite (db.native.js), one `.db` file per namespace; the anonymous→auth file
// handover is a foundation follow-up, NOT a silent-loss risk on the web path. The
// no-op returns the same shape as the web "no IndexedDB available" branch, which
// the web tests already pin — so callers (reactBoot) behave identically.
//
// `dexie` is NOT imported here (not even transitively). The flag-prefix export is
// inlined to match the web module's public surface.

/** localStorage flag prefix marking a completed anon→auth migration per uid.
 *  Mirrors the web export so any consumer reading it resolves on native too. */
export const ANON_MIGRATED_FLAG_PREFIX = 'anon-migrated-';

/**
 * Native no-op — no IndexedDB Tier-1 archive to merge (op-sqlite is one file per
 * namespace). Returns the web "no IndexedDB" contract shape so reactBoot's
 * post-auth flow proceeds unchanged.
 *
 * @param {string} uid Firebase Auth uid
 * @returns {Promise<{ migrated: boolean, copied: number, reason?: string }>}
 */
export async function migrateAnonymousToAuth(uid) {
  if (!uid || typeof uid !== 'string') {
    return { migrated: false, copied: 0, reason: 'no_uid' };
  }
  return { migrated: true, copied: 0, reason: 'native_no_indexeddb' };
}
