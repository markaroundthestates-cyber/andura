// ══ LIVE STRIP — who you train with, where they are (founder 2026-11-07) ══════
// One row per friend in the live session: exercise, set, rest countdown (or done),
// a "Randul tau" banner when the one before you just finished a set, and "Treci si
// tu" when a friend moved to an exercise still ahead of you.

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { t } from '../../../i18n/index.js';
import { formatMMSS } from '../../lib/format';
import type { LiveTraining } from '../../routes/screens/antrenor/workout/useLiveTraining';

export function LiveStrip({ live, myEngineName, canFollow, onFollow }: {
  live: LiveTraining;
  myEngineName: string;
  canFollow: (engineName: string) => boolean;
  onFollow: (engineName: string, name: string) => void;
}): JSX.Element | null {
  const [now, setNow] = useState(() => Date.now());
  const resting = live.others.some(({ beat }) => (beat.restEndsAt ?? 0) > now);
  useEffect(() => {
    if (!resting) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [resting]);
  if (live.others.length === 0) return null;
  return (
    <div className="mb-4" data-testid="live-strip">
      {live.cue && (
        <p className="text-sm font-semibold mb-1.5" style={{ color: 'var(--volt)' }} role="status" data-testid="live-cue">
          {t('live.yourTurn')}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        {live.others.map(({ uid, beat }) => {
          const rest = (beat.restEndsAt ?? 0) - now;
          const follow = !beat.done && beat.engineName !== myEngineName && canFollow(beat.engineName);
          return (
            <div key={uid} className="pulse-card pulse-card-tight flex items-center gap-2 px-3 py-2 text-xs text-ink2" data-testid={`live-friend-${uid}`}>
              <Users className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="font-semibold text-ink">{beat.name}</span>
              <span className="truncate flex-1">
                {beat.done
                  ? t('live.done')
                  : t('live.at', { exercise: beat.exName, set: Math.min(beat.setIdx + 1, Math.max(beat.sets, 1)), sets: beat.sets })}
                {!beat.done && rest > 0 && ` · ${t('live.rest', { time: formatMMSS(Math.ceil(rest / 1000)) })}`}
              </span>
              {follow && (
                <button type="button" onClick={() => onFollow(beat.engineName, beat.exName)} className="text-brick font-semibold" data-testid={`live-follow-${uid}`}>
                  {t('live.follow')}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {live.ended && <p className="text-xs text-ink3 mt-1.5" data-testid="live-ended">{t('live.hostEnded')}</p>}
    </div>
  );
}
