// ══ MOTION — RN twin of src/react/lib/motion.ts (W3b) ═════════════════════
// The web module is vanilla DOM (document.createElement edge-flash +
// navigator.vibrate haptic), which cannot run on native. The ported Workout
// components only consume `haptic()` (confirm-tap buzz). Here it stays a
// web-guarded no-op on RN — there is no DOM `navigator.vibrate`, so the body is
// skipped exactly as the web's own desktop fallback path. W-Final swaps this for
// expo-haptics (impact/notification/selection). `edgeFlash` / `isCoarsePointer`
// are NOT consumed by W3b screens, so they are intentionally omitted here.

/**
 * Brief haptic confirmation buzz. On RN there is no Web Vibration API, so this
 * no-ops (the same soft-fail the web takes on desktop). Kept as the call site so
 * W-Final can drop in expo-haptics without touching the screens.
 *
 * @param _durationMs single-pulse duration (ignored until expo-haptics lands).
 */
export function haptic(_durationMs = 10): void {
  // W-Final: expo-haptics. RN has no navigator.vibrate — no-op now.
  const nav = typeof navigator !== 'undefined' ? (navigator as { vibrate?: (ms: number) => void }) : undefined;
  if (!nav || typeof nav.vibrate !== 'function') return;
  try {
    nav.vibrate(_durationMs);
  } catch {
    // Soft-fail (parity with the web guard).
  }
}
