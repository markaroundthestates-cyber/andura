// ══ KV — synchronous key/value storage adapter (RN port, Wave 1) ════════════
// A tiny SYNCHRONOUS string KV interface — `{ getItem, setItem, removeItem }` —
// that every persisted edge (the 9 wv2-* Zustand stores via persist, plus the
// scheduleAdapter calendar/equipment/refusal keys) reads through, so the SAME
// shared `src/` code runs unchanged on web (localStorage) and React Native
// (react-native-mmkv, also synchronous).
//
// Per-bundler resolution (the env-shim pattern from `src/util/env*.js`):
//   - Vite + Vitest resolve THIS file → `localStorage` (behavior-IDENTICAL to
//     pre-port; the adapter forwards each call to the live `localStorage` object
//     at call-time, so test helpers like `localStorage.clear()` stay transparent).
//   - Metro (Expo web) resolves `kv.web.js` → `localStorage`.
//   - Metro (iOS/Android) resolves `kv.native.js` → react-native-mmkv.
//
// Consumers import this extensionless (`./kv` / `../../storage/kv`) so each
// bundler picks its own variant. The interface is a STRING KV (matches the
// Web Storage + MMKV `getString`/`set`/`delete` contracts); JSON
// (de)serialization stays in the caller (Zustand `createJSONStorage`, the
// scheduleAdapter helpers), exactly as today.
//
// SHAPE (StateStorage-compatible — `createJSONStorage` accepts it directly):
//   getItem(name: string): string | null
//   setItem(name: string, value: string): void
//   removeItem(name: string): void

/**
 * Synchronous KV backed by the web `localStorage`. Each method forwards to the
 * live global at call-time (NOT a cached reference) so jsdom/test resets +
 * runtime storage swaps remain transparent. A guarded no-op fallback keeps SSR /
 * storage-disabled contexts from throwing — identical to the per-call try/catch
 * the previous `() => localStorage` callsites relied on downstream.
 *
 * @type {{ getItem: (name: string) => string | null, setItem: (name: string, value: string) => void, removeItem: (name: string) => void }}
 */
export const kv = {
  getItem(name) {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null;
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(name, value);
    } catch {
      /* quota / disabled — silent, mirrors prior localStorage.setItem callers */
    }
  },
  removeItem(name) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(name);
    } catch {
      /* disabled — silent */
    }
  },
};
