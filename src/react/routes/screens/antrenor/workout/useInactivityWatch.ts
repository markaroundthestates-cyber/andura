import { useCallback, useEffect, useState } from 'react';

const INACTIVITY_THRESHOLD_MIN = 7; // Mockup wv2 verbatim L4401
const INACTIVITY_CHECK_INTERVAL_MS = 30_000; // Mockup wv2 verbatim L4404

export interface InactivityWatch {
  inactivityPromptOpen: boolean;
  setInactivityPromptOpen: (v: boolean) => void;
  bumpActivity: () => void;
}

// Phase 4 task_15 §A: inactivity watch — interval 30s checks idle minutes vs
// lastActivityAt; > 7 min triggers prompt overlay. Reset triggers
// (input/rating/skip) call bumpActivity().
//
// Extracted verbatim from Workout.tsx (behavior preserved) — owns lastActivityAt
// + inactivityPromptOpen + the 30s watch effect + the bumpActivity callback.
export function useInactivityWatch(): InactivityWatch {
  const [lastActivityAt, setLastActivityAt] = useState<number>(Date.now());
  const [inactivityPromptOpen, setInactivityPromptOpen] = useState(false);

  // Phase 4 task_15 §A: inactivity watch — interval 30s checks idle minutes
  // vs lastActivityAt; > 7 min triggers prompt overlay. Reset triggers
  // (input/rating/skip) bumpActivity() inline.
  useEffect(() => {
    const interval = setInterval(() => {
      const idleMin = (Date.now() - lastActivityAt) / 60_000;
      if (idleMin > INACTIVITY_THRESHOLD_MIN) {
        setInactivityPromptOpen(true);
      }
    }, INACTIVITY_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [lastActivityAt]);

  // useCallback: referenced by handlers passed to memoized SessionTimer; only
  // touches stable state setters so the empty dep array is correct + stable.
  const bumpActivity = useCallback((): void => {
    setLastActivityAt(Date.now());
    setInactivityPromptOpen(false);
  }, []);

  return { inactivityPromptOpen, setInactivityPromptOpen, bumpActivity };
}
