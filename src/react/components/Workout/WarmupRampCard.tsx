// ══ WARM-UP RAMP CARD — in-workout primer stepper (gym-log arc follow-up
// 2026-06-12, Daniel GO) ══════════════════════════════════════════════════════
// The engine emits the per-set ascending primer ramp (warmupRampFor → 50/70/90%
// of the opening compound's working load, equipment-snapped) and the PREVIEW
// shows it — but in the live session the ramp was only informational text. This
// card makes it actionable: it walks the user through each primer set with its
// own SHORT rest countdown, then collapses for the working sets.
//
// DELIBERATE BOUNDARIES (the whole design):
//   - SELF-CONTAINED: own stepper + own countdown. It NEVER touches the session
//     FSM (logging/rest/transition), logSet, or the DP engine — a 50%×10 primer
//     fed into checkInSessionAdjust/logs would poison calibration. Warm-up is
//     ceremony, not data.
//   - SHORT RESTS, scaling with primer intensity (founder rule 2026-06-12 "vezi
//     ce pauza pui intre warmup si working set"): 30s after the 50% set, 45s
//     after 70%, 60s after the 90% CNS primer → working set. NEVER the full
//     2-3min working restSec — warm-up rests are movement breaks, not recovery.
//   - DISMISSIBLE + SKIPPABLE: every countdown has a skip; the whole card can be
//     dismissed ("Sar peste") — users who warm up their own way are not nagged.
//   - PER-SESSION MEMORY: completion/dismissal is keyed on sessionStart in
//     sessionStorage, so a re-mount (tab nav, refresh) never resurrects a done
//     card mid-session; a NEW session gets a fresh card. sessionStorage (not
//     localStorage) so it self-cleans with the browsing context.
//
// A11y: role="group" with a label; the live countdown is role="status" so the
// transition to the next primer is announced. Token-only styling (Pulse).

import { useEffect, useRef, useState, type JSX } from 'react';
import { Flame, Check } from 'lucide-react';
import { t } from '../../../i18n/index.js';

/** Short inter-primer rest seconds by primer intensity (pct of working load). */
const REST_BY_PCT: Record<number, number> = { 50: 30, 70: 45, 90: 60 };
const DEFAULT_REST_SEC = 30;

export interface WarmupStep {
  kg: number;
  reps: number;
  pct: number;
}

interface WarmupRampCardProps {
  /** The engine-emitted primer steps (light→heavy), already equipment-snapped. */
  steps: ReadonlyArray<WarmupStep>;
  /** sessionStart ms — keys the per-session done/dismiss memory. */
  sessionKey: number;
}

const storageKey = (sessionKey: number): string => `wu-done-${sessionKey}`;

/** Read the per-session done flag (defensive — storage can throw in private mode). */
function isDone(sessionKey: number): boolean {
  try { return sessionStorage.getItem(storageKey(sessionKey)) === '1'; }
  catch { return false; }
}

function markDone(sessionKey: number): void {
  try { sessionStorage.setItem(storageKey(sessionKey), '1'); }
  catch { /* private mode — the card may reappear on remount; harmless */ }
}

export function WarmupRampCard({ steps, sessionKey }: WarmupRampCardProps): JSX.Element | null {
  const [stepIdx, setStepIdx] = useState(0);
  // Seconds left in the post-primer rest; 0 = no rest running (logging the step).
  const [restLeft, setRestLeft] = useState(0);
  const [done, setDone] = useState(() => isDone(sessionKey));
  const intervalRef = useRef<number | null>(null);

  // Tick the short rest countdown; when it hits 0 advance to the next primer
  // (or finish after the last one).
  useEffect(() => {
    if (restLeft <= 0) return undefined;
    intervalRef.current = window.setInterval(() => {
      setRestLeft((s) => {
        if (s <= 1) {
          // Rest over → next primer, or done after the last.
          setStepIdx((i) => {
            if (i + 1 >= steps.length) {
              markDone(sessionKey);
              setDone(true);
              return i;
            }
            return i + 1;
          });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [restLeft > 0, steps.length, sessionKey]);

  if (done || steps.length === 0) return null;

  const step = steps[stepIdx]!;
  const resting = restLeft > 0;

  const completeStep = (): void => {
    // Last primer's rest still runs (60s before the working set — the part the
    // founder flagged: short, never the full working rest).
    setRestLeft(REST_BY_PCT[step.pct] ?? DEFAULT_REST_SEC);
  };

  const skipRest = (): void => {
    setRestLeft(0);
    setStepIdx((i) => {
      if (i + 1 >= steps.length) {
        markDone(sessionKey);
        setDone(true);
        return i;
      }
      return i + 1;
    });
  };

  const dismissAll = (): void => {
    markDone(sessionKey);
    setDone(true);
  };

  return (
    <div
      className="pulse-card pulse-card-tight px-3.5 py-3 mb-3"
      role="group"
      aria-label={t('workout.warmupCard.ariaLabel')}
      data-testid="warmup-ramp-card"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--brick)' }}>
          <Flame size={13} aria-hidden="true" />
          {t('workout.warmupCard.title')}
        </p>
        <button
          type="button"
          onClick={dismissAll}
          className="text-xs font-medium text-ink3"
          data-testid="warmup-dismiss"
        >
          {t('workout.warmupCard.dismiss')}
        </button>
      </div>

      {/* Primer chips: done = volt check, current = bold active, rest = muted. */}
      <div className="flex flex-wrap gap-2 mb-2.5">
        {steps.map((s, i) => {
          const isPast = i < stepIdx || (i === stepIdx && resting);
          const isCurrent = i === stepIdx && !resting;
          return (
            <span
              key={s.pct}
              data-testid={`warmup-step-${i}`}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
                isCurrent ? 'font-semibold' : isPast ? 'opacity-60' : 'text-ink3'
              }`}
              style={isCurrent
                ? { background: 'color-mix(in oklab, var(--volt) 25%, transparent)', color: 'var(--brick)' }
                : undefined}
            >
              {isPast && <Check size={11} aria-hidden="true" />}
              {t('workout.preview.warmupRampStep', { kg: s.kg, reps: s.reps })}
            </span>
          );
        })}
      </div>

      {resting ? (
        // Short movement-break countdown — role=status announces the tick-over.
        <div className="flex items-center justify-between" role="status" data-testid="warmup-rest">
          <span className="text-sm text-ink2">
            {t('workout.warmupCard.resting', { sec: restLeft })}
          </span>
          <button
            type="button"
            onClick={skipRest}
            className="text-xs font-semibold"
            style={{ color: 'var(--aqua-ink)' }}
            data-testid="warmup-rest-skip"
          >
            {t('workout.warmupCard.skipRest')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={completeStep}
          className="btn-secondary-lift w-full py-2.5 bg-paper2 border border-lineStrong text-ink rounded-xl text-sm font-semibold"
          data-testid="warmup-step-done"
        >
          {t('workout.warmupCard.stepDone', { kg: step.kg, reps: step.reps })}
        </button>
      )}
    </div>
  );
}
