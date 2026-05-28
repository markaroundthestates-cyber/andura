// ══ STATS GRID — F10 3-Cell Compact ═══════════════════════════════════════
// Per mockup §F10 audit-driven V1 feature.
// Streak + Fatigue + Readiness 3-cell layout cu icons.
//
// Phase 3: props din parent (workoutStore.streak + engineWrappers.getFatigue
// + engineWrappers.getReadiness).

import type { JSX } from 'react';
import { Flame, Battery, Sparkles } from 'lucide-react';
import type { ReadinessOutput, FatigueOutput } from '../../lib/engineWrappers';
import { useCountUp } from '../../hooks/useCountUp';

interface Props {
  streak: number;
  fatigue: FatigueOutput | null;
  readiness: ReadinessOutput | null;
}

export function StatsGrid({ streak, fatigue, readiness }: Props): JSX.Element {
  // §MED-CODE-23 — unit label below big number (2-line visual). Number rendered
  // separat, deci label = doar substantivul: "zi" la 1, "zile" altfel (fara
  // prefix "de" care apare la pluralRo 20+).
  const streakLabel = streak === 1 ? 'zi' : 'zile';
  // Tasteful count-up on the streak hero number (2026-05-27). Snaps to final
  // under prefers-reduced-motion; in tests rAF is not flushed so the final
  // value renders synchronously (label/plural assertions unaffected).
  const streakDisplay = useCountUp(streak);
  const fatigueDisplay = useCountUp(fatigue?.score ?? 0);
  const readinessDisplay = useCountUp(readiness?.score ?? 0);

  // Wave A4 polish (Daniel 2026-05-28 "clumzy" feedback) — cards get an accent
  // icon top-right (semantic hint), inner ring border for depth, and a soft
  // gradient overlay (paper2 → transparent) that lifts the tile off the page
  // bg without adding a heavy box-shadow (would clash with mov ambient glow).
  // Card-rise + stagger so the trio settles in left-to-right on mount.
  return (
    <div
      className="grid grid-cols-3 gap-2 mb-4"
      role="region"
      aria-label="Statistici - streak, oboseala, energie"
    >
      <StatTile
        label="Streak"
        value={streakDisplay}
        sublabel={streakLabel}
        Icon={Flame}
        accentVar="--brick"
        delayClass="delay-0"
        testId="stats-streak"
        sublabelTestId="stats-streak-label"
        // Wave C3 — flame flickers on streak >= 1 (active streak); silent at 0
        // so an empty-state tile reads calm, not nagging.
        iconAnimClass={streak >= 1 ? 'animate-flame' : undefined}
      />
      <StatTile
        label="Oboseala"
        value={fatigue ? fatigueDisplay : '-'}
        sublabel={fatigue ? fatigue.label : 'NA'}
        Icon={Battery}
        accentVar="--olive"
        delayClass="delay-75"
        testId="stats-fatigue"
      />
      <StatTile
        label="Readiness"
        value={readiness ? readinessDisplay : '-'}
        sublabel={readiness ? readiness.label : 'NA'}
        Icon={Sparkles}
        accentVar="--deep"
        delayClass="delay-150"
        testId="stats-readiness"
      />
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: string | number;
  sublabel: string;
  Icon: typeof Flame;
  accentVar: string;
  delayClass: string;
  testId: string;
  sublabelTestId?: string;
  /** Wave C3 — opt-in for an idle micro-animation on the corner icon (e.g.
   *  flame flicker on the streak tile). Other tiles stay still. */
  iconAnimClass?: string | undefined;
}

function StatTile({
  label,
  value,
  sublabel,
  Icon,
  accentVar,
  delayClass,
  testId,
  sublabelTestId,
  iconAnimClass,
}: StatTileProps): JSX.Element {
  return (
    <div
      className={`relative overflow-hidden bg-paper2 rounded-xl p-3 text-center border border-line animate-card-rise ${delayClass}`}
    >
      {/* Decorative accent dot — semantic hint of which stat this is, even
          when the number reads as '-'. color-mix keeps it cross-palette.
          Wave C3 — optional iconAnimClass applies a tile-specific idle motion
          (e.g. flame flicker on streak). Default = static. */}
      <Icon
        aria-hidden="true"
        className={`absolute top-2 right-2 w-3.5 h-3.5${iconAnimClass ? ` ${iconAnimClass}` : ''}`}
        style={{ color: `color-mix(in oklab, var(${accentVar}) 80%, transparent)` }}
      />
      {/* Subtle radial wash anchored top-left so the eye is drawn to the
          number, not the tile edge. opacity 0.08 keeps it whisper-quiet.
          Wave C3 — drift the wash over a slow 22s cycle so the tile reads as
          a "living surface" (peripheral motion, never foreground). The drift
          collapses under reduced-motion via global * cap. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none animate-ambient-drift"
        style={{
          backgroundImage: `radial-gradient(circle at 0% 0%, color-mix(in oklab, var(${accentVar}) 18%, transparent) 0%, transparent 60%)`,
        }}
      />
      <div className="relative text-[10px] text-ink2 uppercase tracking-wider font-medium">
        {label}
      </div>
      <div
        className="relative text-2xl font-bold text-ink mt-1 tabular-nums"
        data-testid={testId}
      >
        {value}
      </div>
      <div
        className="relative text-xs text-ink2 mt-0.5"
        data-testid={sublabelTestId}
      >
        {sublabel}
      </div>
    </div>
  );
}
