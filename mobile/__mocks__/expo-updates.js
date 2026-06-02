// Jest mock for expo-updates (WF-2).
//
// expo-updates is a native module — under jest-expo `Updates.isEnabled` is
// false and the OTA APIs would hit native code. The WF-2 update module
// (mobile/lib/updates.ts) is guarded by `Updates.isEnabled`, so the default
// disabled state already makes every entry point a no-op (matching dev / Expo
// Go / not-yet-configured runtime). Tests that exercise the enabled path flip
// `__setEnabled(true)`.
//
// Wired via `moduleNameMapper` in mobile/package.json jest config (NOT
// jest.mock) so it resolves from BOTH the mobile root AND the shared `../src`
// tree, same pattern as the react-native-mmkv mock.
//
// `isEnabled` is exposed as a GETTER (not a plain value) so that consumers
// reading it through babel's `import * as Updates` interop wildcard copy still
// observe the live flag flipped by `__setEnabled` — a plain data property gets
// snapshotted into the interop copy and would not update.

let _enabled = false;

module.exports = {
  get isEnabled() {
    return _enabled;
  },
  // Test helper — mirrors Expo Go / dev (false) vs configured build (true).
  __setEnabled(value) {
    _enabled = value;
  },
  checkForUpdateAsync: jest.fn(async () => ({ isAvailable: false })),
  fetchUpdateAsync: jest.fn(async () => ({ isNew: true })),
  reloadAsync: jest.fn(async () => {}),
};
