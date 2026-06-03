// ══ Shared MMKV instance (React Native) ══════════════════════════════════════
//
// The default MMKV store backing Tier-0 on native. Shared by BOTH native
// Tier-0 paths so they read/write the SAME flat keyspace (a second `new MMKV()`
// would create a parallel store and split the keys):
//   - kv.native.js   — the SWALLOWING StateStorage adapter (Zustand persist +
//                      scheduleAdapter). Never throws.
//   - dbset.native.js — the THROWING setter behind DB.set (MED-CODE-22 quota
//                      contract needs throws to propagate).
//
// Native only — Metro loads this into the RN graph; Vite/Vitest never resolve a
// `.native.js` sibling, so `react-native-mmkv` is never imported on web/test.

// NOTE: react-native-mmkv removed for Expo SDK 52 (RN 0.76). mmkv v4 is
// Nitro-based and its nitro-modules peer requires RN 0.78 (SDK 53) — the
// ReactModuleInfo constructor mismatch fails the Android Kotlin compile.
// Native Tier-0 runs on the in-memory store below for now (ephemeral —
// persists in-session, lost on restart).
// TODO(persistent-storage, pre-Beta): restore a SDK-52-compatible sync KV
// (an mmkv 2.x/3.x line that pairs with RN 0.76, or an op-sqlite-backed sync KV).

/**
 * In-memory fallback store implementing the MMKV surface that kv.native.js +
 * dbset.native.js use (getString/set/delete/getAllKeys/clearAll). HI-01: the
 * real `new MMKV()` runs at module load — a native-module hiccup (a failed JSI
 * install, a corrupt store) would throw at the top level and WHITE-SCREEN boot.
 * Degrading to an ephemeral Map keeps the app usable for the session (persistence
 * lost until next launch) instead of crashing on launch. Same Map-backed shape
 * as the jest mock.
 */
function makeMemoryStore() {
  const m = new Map();
  return {
    getString: (k) => (m.has(k) ? m.get(k) : undefined),
    set: (k, v) => { m.set(k, String(v)); },
    delete: (k) => { m.delete(k); },
    contains: (k) => m.has(k),
    getAllKeys: () => Array.from(m.keys()),
    clearAll: () => { m.clear(); },
  };
}

/**
 * Default native Tier-0 store. TEMPORARY: in-memory only (see top-of-file note)
 * until a SDK-52-compatible sync KV is restored. One flat keyspace, same shape
 * as web `localStorage`.
 */
export const storage = makeMemoryStore();
