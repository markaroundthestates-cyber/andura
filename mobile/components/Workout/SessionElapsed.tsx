// ══ SESSION ELAPSED (RN port) — leaf clock ════════════════════════════════
// RN twin of src/react/components/Workout/SessionElapsed.tsx. Owns the 1Hz
// setInterval + elapsed state so per-second re-renders are confined to this leaf
// (the memoized SessionTimer chrome does not reconcile each tick). Behavior is
// identical: elapsed = floor((now - startedAt)/1000), seed 0, first tick after
// 1000ms; startedAt===null parks at 0:00 with no interval. Renders the same
// "· MM:SS" text + testID="workout-elapsed".

import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { formatMMSS } from '../../../src/react/lib/format';
import { dark } from '../../lib/tokens';

interface SessionElapsedProps {
  /** Session start epoch ms (workoutStore.sessionStart). Null = no live session. */
  startedAt: number | null;
}

export function SessionElapsed({ startedAt }: SessionElapsedProps): React.JSX.Element {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (startedAt === null) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <Text testID="workout-elapsed" style={{ color: dark.ink2 }}>
      {' '}
      · {formatMMSS(elapsed)}
    </Text>
  );
}
