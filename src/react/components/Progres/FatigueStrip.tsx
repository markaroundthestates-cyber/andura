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
// §DRIFT-2 (chat5 2026-05-23) — Option A mockup literal restore (SUPERSEDED).
// Mockup L1716-1721 verbatim: background:white, border-radius:14px, NU icon
// prefix. Removed lucide Activity icon, bg-paper2 → bg-white, rounded-2xl →
// rounded-[14px]. D015 LOCK V1 DESIGN MASTER authority preserved.
//
// ANDURA PULSE reskin (Wave 2c, 2026-05-29) — the andura-clasic.html DESIGN
// MASTER is retired (Pulse is the single design system now), so the §DRIFT-2
// `bg-white rounded-[14px]` + no-icon mockup-literal pins no longer apply. The
// strip now matches its grid sibling BMRStrip + BodyFatStrip: token surface
// (bg-paper2 border-line rounded-2xl), an Activity icon prefix, and the
// animate-card-rise entrance. Engine signal + display scale + testids
// unchanged — presentation-only.

import type { JSX } from 'react';
import { Activity } from 'lucide-react';
import { getFatigue, type FatigueOutput } from '../../lib/engineWrappers';
import { t } from '../../../i18n/index.js';

/**
 * Wave E4 — resolve the engine's verdict label through i18n using the semantic
 * `key` (HIGH_FATIGUE / MODERATE_FATIGUE / PEAK_FORM / NORMAL /
 * INSUFFICIENT_DATA). Falls back to the engine's RO copy when the key is
 * missing (defensive — engine guarantees a key post-Wave-E4 but partial mocks
 * may not). Empty string `key` (older shape) also falls through.
 *
 * Progress redesign (Daniel 2026-05-30): the verbose `.detail` prose paragraph
 * was struck out — the compact score + the one-word `label` are all the Fatigue
 * tile shows now, so only the label is resolved here.
 */
function localizedFatigue(f: FatigueOutput): { label: string } {
  const k = f.key && f.key.length > 0 ? f.key : null;
  if (!k) return { label: f.label };
  const labelKey =
    k === 'INSUFFICIENT_DATA'
      ? 'coachEngine.fatigue.insufficient.label'
      : `coachEngine.fatigue.${k}.label`;
  const label = t(labelKey);
  return {
    label: label && label !== labelKey ? label : f.label,
  };
}

export function FatigueStrip(): JSX.Element {
  const fatigue = getFatigue();
  // §F-pass2-fatiguestrip-01 — convert 0-100 engine score → 0-10 display.
  const scoreOutOfTen = fatigue ? Math.round(fatigue.score / 10) : null;
  const localized = fatigue ? localizedFatigue(fatigue) : null;

  return (
    <section
      data-testid="fatigue-strip"
      className="pulse-card pulse-card-tight pulse-card-glow overflow-hidden p-4 mb-4 flex items-center gap-4 animate-card-rise"
      style={{ ['--wash' as string]: 'var(--aqua)' }}
      aria-label={t('progres.fatigue.ariaLabel')}
    >
      {/* Pulse MiniStat parity (11.403, interfata-noua/screens-tabs.jsx:42,126):
          the Fatigue tile carries an aqua corner tile-wash + an aqua-tinted icon
          (was a flat brick icon-prefix with no wash). aqua is a CSS var, not a
          Tailwind color, so the icon hue is applied inline. */}
      <Activity
        className="w-6 h-6 flex-shrink-0"
        style={{ color: 'var(--aqua)' }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-1">
          {t('progres.fatigue.todayLabel')}
        </p>
        {fatigue && localized ? (
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
              {localized.label}
            </p>
          </>
        ) : (
          <p className="text-sm text-ink2" data-testid="fatigue-empty">
            {t('progres.fatigue.emptyHint')}
          </p>
        )}
      </div>
    </section>
  );
}
