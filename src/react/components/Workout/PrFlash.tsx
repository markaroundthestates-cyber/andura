// ══ PR FLASH — mid-session personal-record celebration (Pulse arc 2026-05-29)
// Mockup parity: interfata-noua/screens-workout.jsx PrFlash :438-457. A brief,
// celebratory full-bleed overlay fired the instant the engine detects a PR
// mid-workout (getPRDelta → markPRHit in Workout.performLogSet). The PostSummary
// PR banner stays the durable record; this is the in-the-moment "you just did
// it" hit that the mockup promotes.
//
// Behavior (matches the mock): auto-dismisses after ~2.6s, a tap closes it
// early, and a short triple-buzz haptic fires on mount (Android only, silent on
// desktop / under reduced motion via the haptic util). ConfettiBurst supplies
// the theme-aware particle spray (no dependency) and auto-cleans itself.
//
// CRITICAL (safety-screen rule): this overlay is TRANSIENT + auto-dismissing —
// it never traps focus and never blocks the session's exit/menu permanently
// (it tears itself down). It is NOT a substitute for any FSM transition; it is
// pure celebration layered on top of the existing markPRHit moment. The parent
// owns when to mount it (keyed on the PR payload) and clears it on close.
//
// A11y: role="status" announces the win through its visible copy ("New
// record!" + exercise + delta). aria-hidden decoration (trophy ring + confetti)
// carries no semantics. Token-only styling (var(--ember)/var(--volt)); no raw
// hex. Reduced motion: ConfettiBurst collapses to a single frame globally; the
// entrance fade is a short CSS transition the global motion cap tames.

import { useEffect, type JSX } from 'react';
import { Trophy, Target } from 'lucide-react';
import { ConfettiBurst } from '../ConfettiBurst';
import { haptic } from '../../lib/motion';
import { t } from '../../../i18n/index.js';

interface PrFlashProps {
  /** Exercise display name the PR was set on. */
  exercise: string;
  /** Positive kg delta over the prior record (already rounded by the engine). */
  deltaKg: number;
  /** Fired on tap or after the auto-dismiss timeout. */
  onClose: () => void;
  /** Auto-dismiss delay in ms (default 2600 — matches the mockup). */
  durationMs?: number;
  /**
   * (8) 'pr' (default) = a real record over a valid history — full confetti
   * celebration. 'calibration' = a first-rep / massive-manual-jump over a bad
   * cold-start seed: NOT a record, so we show a calm "level set" reper instead of
   * the confetti so the user (and the engine) is never told a calibration is a PR.
   */
  variant?: 'pr' | 'calibration';
}

export function PrFlash({ exercise, deltaKg, onClose, durationMs = 2600, variant = 'pr' }: PrFlashProps): JSX.Element {
  const isCalibration = variant === 'calibration';
  // Calibration uses the steady volt token (a "we now know your level" signal);
  // a real PR keeps the ember celebration. The icon + copy + confetti follow suit.
  const accent = isCalibration ? 'var(--volt)' : 'var(--ember)';
  useEffect(() => {
    // Triple-buzz celebration pattern (mockup vibrate([20,40,30])). haptic()
    // guards desktop + reduced-motion internally; pass the peak pulse length.
    // Calibration is informational, not a win — a single gentler buzz.
    haptic(isCalibration ? 18 : 40);
    const tid = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(tid);
  }, [onClose, durationMs, isCalibration]);

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[48] grid place-items-center p-8 text-center"
      data-testid="pr-flash"
      data-variant={variant}
      role="status"
      aria-label={isCalibration ? t('workout.calibrationFlash.ariaLabel') : t('workout.prFlash.ariaLabel')}
      onClick={onClose}
      style={{
        background: `radial-gradient(120% 90% at 50% 40%, color-mix(in oklab, ${accent} 20%, var(--paper)) 0%, color-mix(in oklab, var(--paper) 92%, transparent) 75%)`,
      }}
    >
      {/* Confetti spawns from this relative host's center — a real PR only; a
          calibration reper is calm (no confetti spray). */}
      {!isCalibration && (
        <span aria-hidden="true" className="relative">
          <ConfettiBurst count={56} />
        </span>
      )}
      <div className="animate-scale-in relative">
        <div
          aria-hidden="true"
          className="mx-auto w-24 h-24 rounded-full grid place-items-center"
          style={{
            background: `color-mix(in oklab, ${accent} 16%, transparent)`,
            border: `2px solid color-mix(in oklab, ${accent} 45%, transparent)`,
            boxShadow: `0 0 50px -6px ${accent}`,
          }}
        >
          {isCalibration ? (
            <Target className="w-12 h-12" aria-hidden="true" style={{ color: accent }} />
          ) : (
            <Trophy className="w-12 h-12" aria-hidden="true" style={{ color: accent }} />
          )}
        </div>
        <p className="font-display text-3xl font-bold mt-4" style={{ color: accent }}>
          {isCalibration ? t('workout.calibrationFlash.title') : t('workout.prFlash.title')}
        </p>
        <p className="text-base text-ink mt-2" data-testid="pr-flash-detail">
          {isCalibration
            ? t('workout.calibrationFlash.detail', { exercise })
            : t('workout.prFlash.detail', { exercise, deltaKg })}
        </p>
      </div>
    </div>
  );
}
