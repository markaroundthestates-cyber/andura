// ══ FATIGUE STRIP — Phase 6 task_22 Progres Dashboard ════════════════════
// Consume getFatigue engineWrappers (Phase 4 task_11 LANDED). 4 states
// mockup parity: PEAK_FORM / NORMAL / MODERATE_FATIGUE / HIGH_FATIGUE.
//
// §F-pass2-fatiguestrip-01 (HIGH-EPSILON 2026-05-22) — display scale converted
// from engine 0-100 to mockup-parity 0-10 (intuitive Gigel scan, mockup L1720
// verbatim "6/10"). Engine signal unchanged; UI render only. Per Karpathy SF
// Math.round(score / 10) preserves precision sufficient for visual ladder.
//
// §F-pass2-fatiguestrip-03 (MED chat5 Wave 11) — sub-label restructure mockup
// L1720-1721 verbatim pattern: value standalone (mono "6/10") + descriptive
// sub-label below (NU inline span lipit cu separator). Engine label text
// preserved verbatim ("Azi mergem mai bland" / "Pas mai conservator" / etc) —
// fatigue.js #L66-L92 deja emite Romanian human-friendly wording, NU jargon.
// Mono font on numeric value reinforces 'metric snapshot' visual semantics.
//
// §DRIFT-2 (chat5 2026-05-23) — Option A mockup literal restore. Mockup
// L1716-1721 verbatim: background:white, border-radius:14px (NU 16px Tailwind
// rounded-2xl default), NU icon prefix. Removed lucide Activity icon (mockup
// has ZERO icons in fatigue card), bg-paper2 → bg-white, rounded-2xl →
// rounded-[14px]. D015 LOCK V1 DESIGN MASTER authority preserved.

import type { JSX } from 'react';
import { getFatigue } from '../../lib/engineWrappers';

export function FatigueStrip(): JSX.Element {
  const fatigue = getFatigue();
  // §F-pass2-fatiguestrip-01 — convert 0-100 engine score → 0-10 display.
  const scoreOutOfTen = fatigue ? Math.round(fatigue.score / 10) : null;

  return (
    <section
      data-testid="fatigue-strip"
      className="bg-white border border-line rounded-[14px] p-4 mb-4"
      aria-label="Stare oboseala"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
          Oboseala azi
        </p>
        {fatigue ? (
          <>
            {/* §F-pass2-fatiguestrip-03 — value standalone mono mockup
               L1720; sub-label deplasat pe linie noua mockup L1721. */}
            <p className="text-xl font-bold text-ink font-mono tracking-tight">
              {scoreOutOfTen}
              <span className="text-sm font-normal text-ink2">/10</span>
            </p>
            <p
              className="text-xs text-ink2 mt-0.5"
              data-testid="fatigue-sub-label"
            >
              {fatigue.label}
            </p>
            {fatigue.detail && (
              <p className="text-xs text-ink2 mt-0.5" data-testid="fatigue-detail">
                {fatigue.detail}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-ink2" data-testid="fatigue-empty">
            Nu ai destule sesiuni inca. Estimarea apare dupa 2+ sesiuni.
          </p>
        )}
      </div>
    </section>
  );
}
