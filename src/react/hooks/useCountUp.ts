// ══ useCountUp — number count-up animation hook (Daniel 2026-05-27) ════════
// Animates a number from a start value up to `to` over ~600ms ease-out using
// requestAnimationFrame. Tasteful dynamism for streak/kcal/weight/volume stats.
//
// CRITICAL a11y: this is JS-driven motion, NOT covered by the global CSS
// prefers-reduced-motion block in global.css. The hook checks matchMedia
// '(prefers-reduced-motion: reduce)' and SNAPS straight to the final value
// when the user opts out (Maria 65 vestibular safety).
//
// SSR/test safety: the returned value is INITIALIZED to `to` (the final
// value), so the first synchronous render already shows the real number. The
// rAF tween only paints intermediate frames in a live browser — jsdom/tests
// never observe a half-counted value. Re-trigger is guarded: the tween only
// restarts when `to` actually changes (animated once per value change).

import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  // Defensive: matchMedia absent in some non-browser envs.
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ease-out cubic — fast start, gentle settle. Matches the calm 200-300ms CSS
// entrance family (decelerate-to-rest, never overshoot).
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Count up to `to` over `durationMs` (default 600ms). Returns the current
 * value, already rounded to an integer. Snaps to `to` immediately when the
 * user prefers reduced motion. Animates only once per `to` change.
 *
 * @param to        final target value
 * @param durationMs tween duration (default 600)
 * @param from      start value for the FIRST tween (default 0)
 */
export function useCountUp(to: number, durationMs = 600, from = 0): number {
  // Initialize to the FINAL value → first render + reduced-motion + tests all
  // show the real number with zero flicker.
  const [value, setValue] = useState<number>(to);
  // Track the last target we tweened toward, so an unrelated re-render with an
  // unchanged `to` does NOT restart the animation (guard re-trigger). null
  // sentinel = "not yet animated" so the FIRST mount tweens from `from`.
  const animatedToRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Same target as the last tween → nothing to do (re-trigger guard).
    if (animatedToRef.current === to) return;

    // First tween starts from `from`; subsequent value changes tween from the
    // previously-displayed target (animatedToRef) for a smooth roll.
    const start = animatedToRef.current ?? from;
    animatedToRef.current = to;

    // Reduced motion → snap straight to the final value, no rAF (a11y).
    if (prefersReducedMotion()) {
      setValue(to);
      return;
    }

    // Nothing to animate (start already equals target) → just settle.
    if (start === to) {
      setValue(to);
      return;
    }

    const startTs = performance.now();
    const delta = to - start;
    // NOTE: all value updates happen inside the rAF tick — we intentionally do
    // NOT setValue(start) synchronously here. React Testing Library flushes
    // effects via act(), but does NOT flush requestAnimationFrame callbacks. So
    // in a synchronous test the displayed value stays at the initial `to` (the
    // real number); only a live browser paints the intermediate frames.
    function tick(now: number): void {
      const elapsed = now - startTs;
      const t = Math.min(1, elapsed / durationMs);
      setValue(Math.round(start + delta * easeOutCubic(t)));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [to, durationMs, from]);

  return value;
}
