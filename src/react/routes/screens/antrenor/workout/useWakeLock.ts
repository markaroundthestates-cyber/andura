import { useEffect, useRef } from 'react';

// Wake lock acquire on mount + release on unmount — fail silent.
// Phase 4 task_15 §B: visibilitychange re-acquire pattern. Browser tab
// background → OS auto-releases wake lock. Foreground re-acquires daca lock
// null. lockRef shared mutable reference cu event handler.
//
// Extracted verbatim from Workout.tsx (behavior preserved) — owns lockRef +
// the acquire/visibilitychange effect; returns nothing.
export function useWakeLock(): void {
  const lockRef = useRef<{ release: () => Promise<void> } | null>(null);
  useEffect(() => {
    interface WakeLockSentinel {
      release: () => Promise<void>;
    }
    interface NavigatorWithWakeLock {
      wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
    }
    const nav = navigator as unknown as NavigatorWithWakeLock;
    const acquire = (): void => {
      if (!nav.wakeLock || lockRef.current) return;
      nav.wakeLock
        .request('screen')
        .then((sentinel) => {
          lockRef.current = sentinel;
        })
        .catch(() => {
          /* fail silent */
        });
    };
    acquire();
    function handleVisibilityChange(): void {
      if (document.visibilityState === 'visible' && !lockRef.current) {
        acquire();
      } else if (document.visibilityState === 'hidden') {
        // OS auto-releases; clear ref so foreground re-acquires fresh.
        lockRef.current = null;
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (lockRef.current) {
        lockRef.current.release().catch(() => {
          /* fail silent */
        });
        lockRef.current = null;
      }
    };
  }, []);
}
