// ══ SESSION ELAPSED — Leaf Clock Component ═══════════════════════════════
// Perf isolation (perf/PWA audit): the 1-second elapsed clock used to live as
// `elapsed` state + setInterval inside Workout.tsx, re-rendering the ENTIRE
// active-session subtree once per second. On a low-end Android (Gigel/Maria)
// that 1Hz full-subtree reconcile is palpable jank on the most interactive
// screen.
//
// This leaf owns the setInterval + the elapsed state and renders ONLY the
// timer text. Per-second re-renders are now confined to this leaf; the parent
// Workout subtree no longer reconciles on each tick. SessionTimer is React.memo
// so the surrounding chrome stays put while this leaf ticks.
//
// Behavior identical to the prior inline timer: elapsed = floor((now -
// startedAt)/1000), init 0, recompute every 1000ms while startedAt != null.
// Renders the same `· MM:SS` span + data-testid="workout-elapsed" verbatim.

import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { formatMMSS } from '../../lib/format';

interface SessionElapsedProps {
  // Session start epoch ms (workoutStore.sessionStart). Null = no live session
  // (pre-start / discarded) → clock parked at 0:00, no interval.
  startedAt: number | null;
}

export function SessionElapsed({ startedAt }: SessionElapsedProps): JSX.Element {
  const [elapsed, setElapsed] = useState(0);

  // Session timer — increments per second cand startedAt set. Verbatim port of
  // the prior Workout.tsx inline effect (floor delta seconds, first tick after
  // 1000ms — initial paint stays 0:00 from the useState seed, identical to
  // before). startedAt===null parks at 0:00 with no interval.
  useEffect(() => {
    if (startedAt === null) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return <span data-testid="workout-elapsed">· {formatMMSS(elapsed)}</span>;
}
