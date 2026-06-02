// ══ useReducedMotion (RN) ═════════════════════════════════════════════════
// RN twin of the web's `prefers-reduced-motion` query. The PWA relies on a
// global CSS block to collapse every keyframe; RN has no such global, so each
// looping animation must opt out itself. This hook reads
// AccessibilityInfo.isReduceMotionEnabled() once on mount and subscribes to
// changes, so the pulse visuals (orb breath, ring spin, shimmer, aurora drift,
// confetti) can freeze when the OS "Reduce Motion" toggle is on — Maria 65
// vestibular safety, the same contract as the web global block.

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduced(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => {
      setReduced(v);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
