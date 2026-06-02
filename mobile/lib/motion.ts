// ══ MOTION — RN twin of src/react/lib/motion.ts (W3b → W-Final) ════════════
// The web module is vanilla DOM (document.createElement edge-flash +
// navigator.vibrate haptic), which cannot run on native. On RN we back `haptic()`
// with expo-haptics — KEEPING the same `haptic(durationMs)` signature so every
// caller (SetLogInput / PrFlash / CoachTodayCard / pain-button) works unchanged.
// The web's `durationMs` intent maps to a discrete expo-haptics feel: short taps
// (confirm a set / nav tap) → light impact; a longer pulse (the PR celebration,
// ~40ms) → a success notification. `edgeFlash` / `isCoarsePointer` are NOT
// consumed by RN screens, so they are intentionally omitted here.
//
// Web/jest guard: expo-haptics is a native module — `Platform.OS === 'web'` (and
// jest, which has no native bridge) no-ops so `expo export -p web` + the suite
// never touch native. Errors are swallowed (haptics are best-effort feedback).

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const isNative = Platform.OS !== 'web';

// Above this single-pulse duration the web treated it as a "stronger" buzz (the
// PR flash fires haptic(40)); map that to a success notification, shorter taps to
// a light impact.
const NOTIFICATION_THRESHOLD_MS = 30;

/**
 * Brief haptic confirmation buzz. RN-backed by expo-haptics; web/jest no-op.
 * Same signature as the web module so call sites are untouched.
 *
 * @param durationMs single-pulse duration (web semantics). On RN it only selects
 *                   the feel: < 30ms → light impact, >= 30ms → success notify.
 */
export function haptic(durationMs = 10): void {
  if (!isNative) return;
  try {
    if (durationMs >= NOTIFICATION_THRESHOLD_MS) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // Soft-fail (parity with the web's silent guard).
  }
}
