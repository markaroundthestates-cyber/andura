// ══ useCountUp (RN) ═══════════════════════════════════════════════════════
// RN twin of src/react/hooks/useCountUp.ts. Same contract: value INITIALIZED
// to the final target (so first render + tests show the real number with zero
// flicker), tween only restarts when `to` changes, snaps instantly under
// reduced motion. The web hook keyed off matchMedia; RN has no matchMedia, so
// it reads the OS reduce-motion flag via `useReducedMotion`. rAF + performance
// .now exist in RN's runtime; under jest-expo rAF is not flushed so the value
// stays at the real target in tests (same as the web hook's jsdom behavior).

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(to: number, durationMs = 600, from = 0): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState<number>(to);
  const animatedToRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (animatedToRef.current === to) return;

    const start = animatedToRef.current ?? from;
    animatedToRef.current = to;

    if (reduced) {
      setValue(to);
      return;
    }
    if (start === to) {
      setValue(to);
      return;
    }

    const startTs = Date.now();
    const delta = to - start;
    function tick(): void {
      const elapsed = Date.now() - startTs;
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
  }, [to, durationMs, from, reduced]);

  return value;
}
