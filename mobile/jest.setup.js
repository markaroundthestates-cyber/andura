// Jest setup — RN test infra foundation (Wave 2b).
// jest-expo preset + @testing-library/react-native. The jest-expo preset wires
// react-native + the Expo module mocks; Reanimated 3's official jest mock
// (registered via its package "jest" entry under the preset) turns worklets
// into plain synchronous JS, so withTiming/withRepeat resolve instantly and
// useSharedValue is a plain object — components mount without a native bridge.
//
// AccessibilityInfo.isReduceMotionEnabled (queried by useReducedMotion) already
// resolves to false under the RN jest mock, so no extra stub is needed here.

import '@testing-library/react-native';
