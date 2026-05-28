// ══ MOTION — imperative micro-utils (Wave C3 2026-05-28) ══════════════════
// Tiny helpers for one-shot motion effects that don't deserve a component
// (edge-flash, haptic feedback). Vanilla DOM, SSR-safe (window guards),
// auto-collapse under prefers-reduced-motion.

/**
 * Brief, full-viewport tint pulse to confirm a "registered" event (pain logged,
 * critical action acknowledged). Uses the .andura-edge-flash keyframe defined
 * in global.css. The element auto-removes after the animation ends.
 *
 * @param color CSS color or var (default `var(--brick)`). Pass `var(--danger)`
 *              for error contexts, `var(--succ)` for success.
 */
export function edgeFlash(color = 'var(--brick)'): void {
  if (typeof document === 'undefined') return;
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return; // Vestibular safety — skip the flash entirely under reduced motion.
  }
  const el = document.createElement('div');
  el.className = 'andura-edge-flash';
  el.style.setProperty('--flash-color', color);
  document.body.appendChild(el);
  window.setTimeout(() => {
    el.remove();
  }, 420);
}

/**
 * Trigger a brief haptic buzz on supported devices (Android Chrome + most
 * mobile browsers). Skipped silently on desktop (no Vibration API) or under
 * prefers-reduced-motion. Pair with confirm taps (set logged, pain reported)
 * for tactile feedback without sound.
 *
 * @param durationMs single-pulse duration (default 10ms — Material spec for
 *                   "subtle confirmation").
 */
export function haptic(durationMs = 10): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  try {
    navigator.vibrate(durationMs);
  } catch {
    // Soft-fail: some browsers throw if called from a non-user-gesture context.
  }
}

/** Detect a coarse pointer (touch device). Lets components amplify motion on
 *  mobile (where hover doesn't exist) without breaking desktop fine-pointer
 *  hover affordances. */
export function isCoarsePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}
