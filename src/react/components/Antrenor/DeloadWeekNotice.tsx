// Founder 2026-11-14: "daca tot programeaza andura deload, fa sa imi dea si mesaj la
// inceput de saptamana... asa daca ma anunta ca e saptamana de deload, nu fortez eu
// greutati". The deload used to show only as a one-line hint on the today card, so
// he overrode every lift during the planned 4th week. Once per deload week (per
// device), the first time Home shows a deload plan: what it is, how much lighter,
// how long, and "don't force the weights".
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { BatteryCharging } from 'lucide-react';
import { t } from '../../../i18n/index.js';
import { weekStartIso } from '../../stores/scheduleStore';
import type { PlannedWorkoutOutput } from '../../lib/engineWrappers';

export const DELOAD_NOTICE_KEY = 'wv2-deload-notice-week';

function seenThisWeek(week: string): boolean {
  try { return localStorage.getItem(DELOAD_NOTICE_KEY) === week; } catch { return false; }
}

export function DeloadWeekNotice({ workout }: { workout: PlannedWorkoutOutput | null }): JSX.Element | null {
  const week = weekStartIso();
  const active = workout?.intensityMod === 'minus';
  const [open, setOpen] = useState(false);
  const okRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (active && !seenThisWeek(week)) setOpen(true);
  }, [active, week]);
  useEffect(() => { if (open) okRef.current?.focus(); }, [open]);
  if (!open || !workout) return null;

  const close = (): void => {
    try { localStorage.setItem(DELOAD_NOTICE_KEY, week); } catch { /* shown again next visit */ }
    setOpen(false);
  };
  const pct = Number(workout.deloadPctDecrement);
  const lighter = Number.isFinite(pct) && pct > 0
    ? t('deloadNotice.lighterPct', { pct: Math.round(pct) })
    : t('deloadNotice.lighter');
  const body = workout.deloadKind === 'reactive'
    ? t('deloadNotice.bodyReactive', { lighter })
    : t('deloadNotice.bodyScheduled', { lighter });

  return (
    <div className="animate-fade-in fixed inset-0 bg-overlaySoft flex items-end justify-center z-50" data-testid="deload-notice-backdrop">
      <div
        className="animate-slide-up bg-paper rounded-t-2xl pt-4 px-6 pb-6 w-full max-w-md"
        data-testid="deload-notice"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deload-notice-title"
      >
        <div className="flex items-center gap-2 mb-2">
          <BatteryCharging className="w-5 h-5 text-brick" aria-hidden="true" />
          <h2 id="deload-notice-title" className="text-base font-bold text-ink">{t('deloadNotice.title')}</h2>
        </div>
        <p className="text-sm text-ink2 mb-4" data-testid="deload-notice-body">{body}</p>
        <button
          ref={okRef}
          type="button"
          onClick={close}
          data-testid="deload-notice-ok"
          className="w-full py-3 bg-ink text-paper dark:bg-brick rounded-xl text-base font-semibold transition-transform active:scale-[.97]"
        >
          {t('deloadNotice.cta')}
        </button>
      </div>
    </div>
  );
}
