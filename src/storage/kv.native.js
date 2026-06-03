// React Native (Metro, iOS/Android) KV adapter — sibling of kv.js.
//
// Metro picks `kv.native.js` for the native platforms. The backing store is
// react-native-mmkv: a synchronous, C++-backed key/value store (the RN parallel
// of localStorage), so the shared SYNCHRONOUS `{ getItem, setItem, removeItem }`
// contract holds without async refactors in the Zustand persist + scheduleAdapter
// callers. NO `import.meta` / no web globals here — Metro loads this file (not
// kv.js) into the RN graph.
//
// Store keys are identical to web (`wv2-*`, `wv2-calendar-override`, ...), so a
// future single-store namespacing strategy stays a one-line MMKV `id` change.
// One default MMKV instance covers all keys (same flat keyspace as localStorage).

// Shared default MMKV instance (also used by dbset.native.js — DB.set throwing
// setter) so both native Tier-0 paths write the SAME flat keyspace.
import { storage } from './mmkv.native.js';

/**
 * Synchronous KV backed by MMKV. `getString` returns `undefined` for a missing
 * key; the Web Storage contract (and Zustand's `createJSONStorage`) expects
 * `null`, so absence is normalized to `null`.
 *
 * @type {{ getItem: (name: string) => string | null, setItem: (name: string, value: string) => void, removeItem: (name: string) => void, keys: () => string[], clearAll: () => void }}
 */
export const kv = {
  getItem(name) {
    const v = storage.getString(name);
    return v === undefined ? null : v;
  },
  setItem(name, value) {
    storage.set(name, value);
  },
  removeItem(name) {
    storage.delete(name);
  },
  /**
   * Enumerate every stored key — MMKV `getAllKeys()` (the RN parallel of the web
   * `localStorage.length`/`key(i)` walk). Used by export + reset flows.
   * @returns {string[]}
   */
  keys() {
    return storage.getAllKeys();
  },
  /**
   * Wipe the ENTIRE MMKV keyspace — the native parallel of localStorage.clear().
   * Used by the GDPR Art. 17 full-namespace flush on account delete so no Tier-0
   * data lingers on the device. The default MMKV instance covers all keys.
   */
  clearAll() {
    storage.clearAll();
  },
};
