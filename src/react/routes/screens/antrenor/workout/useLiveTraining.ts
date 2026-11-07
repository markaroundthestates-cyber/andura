// ══ useLiveTraining — the Workout screen's half of a live session ══════════════
// Posts my beat (exercise, sets done, rest end) whenever it changes, reads the
// others' every few seconds, and raises "Randul tau" (with a short vibration) when
// the one before me in the rotation finishes a set on the exercise I am on.
// Inert outside a live session (liveSession null → no network at all).

import { useEffect, useRef, useState } from 'react';
import { useWorkoutStore } from '../../../../stores/workoutStore';
import { partnerUid } from '../../../../lib/partner';
import { predecessor, readLive, writeBeat, type Beat } from '../../../../lib/liveSession';
import { toast } from '../../../../lib/toast';
import { t } from '../../../../../i18n/index.js';

export const LIVE_POLL_MS = 3000;
const CUE_MS = 20_000;

export interface LiveTraining {
  others: Array<{ uid: string; beat: Beat }>;
  cue: boolean;
  ended: boolean;
}

export function useLiveTraining(current: { exName: string; engineName: string; setIdx: number; sets: number } | null): LiveTraining {
  const live = useWorkoutStore((s) => s.liveSession);
  const restEndsAt = useWorkoutStore((s) => s.restEndsAt);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const [state, setState] = useState<LiveTraining>({ others: [], cue: false, ended: false });
  const lastPred = useRef<{ uid: string; key: string } | null>(null);
  const cueUntil = useRef(0);
  const me = partnerUid();

  const exName = current?.exName ?? '';
  const engineName = current?.engineName ?? '';
  const setIdx = current?.setIdx ?? 0;
  const sets = current?.sets ?? 0;

  // My beat, on every change that matters to the others.
  useEffect(() => {
    if (!live || !current) return;
    if (setIdx > 0) cueUntil.current = 0; // I lifted — my turn is used
    void writeBeat(live, { exName, engineName, setIdx, sets, restEndsAt: restEndsAt ?? null, joinedAt: sessionStart ?? live.startedAt });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `current` is read through its fields
  }, [live, exName, engineName, setIdx, sets, restEndsAt, sessionStart]);

  // The others' beats.
  useEffect(() => {
    if (!live || !me) return undefined;
    let alive = true;
    const tick = async (): Promise<void> => {
      const s = await readLive(live);
      if (!alive || !s) return;
      const pred = predecessor(live.host, me, s.beats);
      const pb = pred ? s.beats[pred] : undefined;
      if (pred && pb) {
        const key = `${pb.engineName}|${pb.setIdx}`;
        const prev = lastPred.current;
        if (prev && prev.uid === pred && prev.key !== key && pb.engineName === engineName && pb.setIdx > 0) {
          cueUntil.current = Date.now() + CUE_MS;
          try { navigator.vibrate?.(200); } catch { /* not supported */ }
          // Also over the rest card, wherever the screen is scrolled.
          toast.show({ message: t('live.yourTurn'), variant: 'info' });
        }
        lastPred.current = { uid: pred, key };
      }
      setState({
        others: Object.entries(s.beats).filter(([u]) => u !== me).map(([uid, beat]) => ({ uid, beat })),
        cue: Date.now() < cueUntil.current,
        ended: s.endedAt !== null,
      });
    };
    void tick();
    const id = setInterval(() => void tick(), LIVE_POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, [live, me, engineName]);

  return state;
}
