// React Native (Metro, iOS/Android) throwing setter — sibling of dbset.js.
//
// There is NO `localStorage` on native, so a bare `localStorage.setItem` (the
// web dbset.js) would throw ReferenceError. This variant writes through MMKV
// instead — the shared default instance (mmkv.native.js), the same keyspace as
// kv.native.js — so DB.set's Tier-0 writes land where DB.get (via kv) reads.
//
// CRUCIAL: this is the THROWING path. MMKV `set` propagates real failures, so
// DB.set's QuotaExceededError / unknown-error branching keeps working — unlike
// `kv.setItem`, which swallows. Metro loads this file into the RN graph; Vite/
// Vitest never resolve a `.native.js` sibling.

import { storage } from './mmkv.native.js';

/**
 * Native throwing setter — MMKV `set`. Propagates failures to DB.set.
 *
 * @param {string} key
 * @param {string} value  pre-serialized JSON string
 * @returns {void}
 */
export function dbSetRaw(key, value) {
  storage.set(key, value);
}
