// In-memory react-native-mmkv mock for jest (W2c).
//
// react-native-mmkv is a native TurboModule (C++ backed) — absent under
// jest-expo, so the real `new MMKV()` throws at module load. Every kv-backed
// Zustand store (src/react/stores/*) resolves `../../storage/kv` → kv.native.js
// → `import { MMKV } from 'react-native-mmkv'` at REQUIRE time (persist hydrates
// during create()), so importing ANY persisted store under RNTL crashes without
// this mock.
//
// Wired via `moduleNameMapper` in mobile/package.json jest config (NOT
// jest.mock) so it applies from BOTH the mobile root AND the shared `../src`
// tree — kv.native.js lives outside mobile/rootDir, where a relative jest.mock
// factory + mobile/node_modules resolution would not reach it.
//
// A plain Map backs each instance (the API surface kv.native.js uses:
// getString/set/delete, plus contains/getAllKeys/clearAll for completeness).
// Persistence works in-memory across a single test; a fresh module registry per
// test file gives clean isolation, and clearAll() supports explicit resets.

class MMKV {
  constructor() {
    this._store = new Map();
  }
  getString(key) {
    return this._store.has(key) ? this._store.get(key) : undefined;
  }
  set(key, value) {
    this._store.set(key, String(value));
  }
  delete(key) {
    this._store.delete(key);
  }
  contains(key) {
    return this._store.has(key);
  }
  getAllKeys() {
    return Array.from(this._store.keys());
  }
  clearAll() {
    this._store.clear();
  }
}

module.exports = { MMKV };
