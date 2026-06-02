// ══ dbSetRaw — the THROWING Tier-0 string setter behind DB.set (RN port) ═════
//
// DB.set (src/db.js) owns the MED-CODE-22 quota contract: it must RETHROW the
// raw setter's error so a QuotaExceededError becomes
// `{ok:false,error:'quota_exceeded'}` + Sentry, and any unknown error bubbles.
// That contract needs a setter that PROPAGATES throws — the opposite of the
// `kv.setItem` adapter, which deliberately SWALLOWS all throws (it feeds
// Zustand's `createJSONStorage`, a void StateStorage that must never crash).
//
// So DB.set routes through THIS dedicated throwing setter, platform-split via the
// sibling pattern (like env.js / kv.js):
//   - Vite + Vitest resolve THIS base file → raw `localStorage.setItem`
//     (byte-identical to pre-port; the db-set-quota.test.js spy on
//     `Storage.prototype.setItem` still observes the call + its throw).
//   - Metro (Expo web) resolves dbset.web.js → same raw `localStorage.setItem`.
//   - Metro (iOS/Android) resolves dbset.native.js → MMKV `set` (no
//     `localStorage` on native → a bare `localStorage.setItem` would throw
//     ReferenceError). MMKV `set` still THROWS on real failure, so DB.set's
//     quota/unknown branching keeps working on native.
//
// Consumers import this extensionless (`./storage/dbset`) so each bundler picks
// its variant. Web behavior is UNCHANGED.

/**
 * Web throwing setter — raw `localStorage.setItem`. Lets QuotaExceededError +
 * unknown errors PROPAGATE to DB.set (MED-CODE-22 contract).
 *
 * @param {string} key
 * @param {string} value  pre-serialized JSON string
 * @returns {void}
 */
export function dbSetRaw(key, value) {
  localStorage.setItem(key, value);
}
