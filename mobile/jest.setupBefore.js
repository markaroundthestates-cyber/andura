// Pre-framework setup (runs before the test framework + before module imports
// that execute at require-time). react-native-css-interop's NATIVE runtime
// destructures `AccessibilityInfo` from "react-native" and calls
// `.isReduceMotionEnabled()` + `.addEventListener(...)` at module-load (it loads
// via NativeWind's babel JSX rewrite, pulled in by every styled component +
// lucide-react-native + expo-linear-gradient). The jest-expo RN mock does not
// expose AccessibilityInfo, so that require crashes. We patch the RN mock to
// add a minimal AccessibilityInfo before any UI-kit module loads, so the shared
// components (which all run through the NativeWind className runtime) mount.

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  if (!RN.AccessibilityInfo) {
    RN.AccessibilityInfo = {};
  }
  Object.assign(RN.AccessibilityInfo, {
    isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    announceForAccessibility: jest.fn(),
    setAccessibilityFocus: jest.fn(),
  });
  return RN;
});

// NOTE: the react-native-mmkv jest mock lives in mobile/__mocks__/react-native-mmkv.js
// and is wired via `moduleNameMapper` in package.json (NOT a jest.mock factory
// here) so it resolves from BOTH the mobile root AND the shared `../src` tree —
// kv.native.js (which imports react-native-mmkv at require time) lives outside
// mobile/rootDir, where a relative factory + mobile/node_modules resolution
// would not reach it. See that file's header for the in-memory MMKV details.
