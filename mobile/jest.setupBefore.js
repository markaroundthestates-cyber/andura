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
