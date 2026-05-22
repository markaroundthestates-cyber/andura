// ══ FATIGUE STRIP — Phase 6 task_22 Progres Dashboard ════════════════════
// Consume getFatigue engineWrappers (Phase 4 task_11 LANDED). 4 states
// mockup parity: PEAK_FORM / NORMAL / MODERATE_FATIGUE / HIGH_FATIGUE.
//
// §F-pass2-fatiguestrip-01 (HIGH-EPSILON 2026-05-22) — display scale converted
// from engine 0-100 to mockup-parity 0-10 (intuitive Gigel scan, mockup L1720
// verbatim "6/10"). Engine signal unchanged; UI render only. Per Karpathy SF
// Math.round(score / 10) preserves precision sufficient for visual ladder.

import type { JSX } from 'react';
import { Activity } from 'lucide-react';
import { getFatigue } from '../../lib/engineWrappers';

export function FatigueStrip(): JSX.Element {
  const fatigue = getFatigue();
  // §F-pass2-fatiguestrip-01 — convert 0-100 engine score → 0-10 display.
  const scoreOutOfTen = fatigue ? Math.round(fatigue.score / 10) : null;

  return (
    <section
      data-testid="fatigue-strip"
      className="bg-paper2 border border-line rounded-2xl p-4 mb-4 flex items-center gap-4"
      aria-label="Stare oboseala"
    >
      <Activity className="w-6 h-6 text-brick flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
          Oboseala azi
        </p>
        {fatigue ? (
          <>
            <p className="text-xl font-bold text-ink">
              {scoreOutOfTen}/10
              <span className="text-sm font-normal text-ink2 ml-2">
                · {fatigue.label}
              </span>
            </p>
            {fatigue.detail && (
              <p className="text-xs text-ink2 mt-0.5" data-testid="fatigue-detail">
                {fatigue.detail}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-ink2" data-testid="fatigue-empty">
            Logheaza 2+ sesiuni pentru o estimare.
          </p>
        )}
      </div>
    </section>
  );
}
