// ══ MUSCLE BODY MAP — anatomical recovery figure (Big-11) ════════════════════
// Daniel's brief: replace the recovery RING grid with a human body model — a
// realistic, neutral, naturally-proportioned front-view figure where each muscle
// group glows by recovery state (red → orange → yellow → green). NOT a gorilla,
// NOT a stickman, NOT circles. This is the standalone component; integration into
// Progres happens in a later build (no Progres.tsx / grid edits here).
//
// DATA CONTRACT (matched 1:1 with MuscleRecoveryGrid):
//   useMuscleRecoveryGroups() → { group, label, state }[] where state is the
//   engine's DISCRETE 'recovered' | 'partial' | 'fatigued' (muscleRecovery.
//   getRecoveryByGroup, Big-11 canonical V1). Group keys verbatim:
//     piept · spate · umeri · biceps · triceps · antebrate · core ·
//     picioare-quads · picioare-hamstrings · fese · gambe
//   We reuse the SAME hook so this is a drop-in replacement — no new wiring, no
//   fabricated per-muscle percentage. The figure is a front view, so back-only
//   groups (spate, fese, picioare-hamstrings) cannot be shown on the silhouette;
//   they still appear in the legend's per-group readout so no state is hidden.
//
// COLOR: red (fatigued / needs recovery) → … → green (recovered) via the Pulse
// palette where it fits. The engine has 3 discrete states, so we map:
//   fatigued → ember-red, partial → gold/amber, recovered → volt (green-lime).
// Each region is paired with a per-group accessible label + a legend so color is
// NEVER the sole carrier of meaning (color-blind safe, WCAG 1.4.1).
//
// MOTION: a soft glow pulse on stressed regions. The keyframe is named so the
// global prefers-reduced-motion block in global.css collapses it; we ALSO guard
// inline (animation only attached when motion is allowed) for belt-and-braces.
//
// EMPTY / COLD STATE: a fresh user (no sessions) yields all-'recovered' from the
// engine. We additionally detect the cold case (no real training data) and render
// the figure DIMMED/neutral with an explicit empty note — no recovery claim.

import type { JSX } from 'react';
import { useMemo } from 'react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useMuscleRecoveryGroups } from './MuscleRecoveryGrid';
import type { RecoveryState } from '../../../engine/muscleRecovery.js';
import { t } from '../../../i18n/index.js';

// ── State → color token (red→orange→yellow→green spectrum, Pulse palette) ──────
// recovered = volt (electric lime/green), partial = gold (amber/yellow),
// fatigued = ember-red. The intermediate orange lives in the glow blend.
const STATE_COLOR: Record<RecoveryState, string> = {
  recovered: 'var(--volt)',
  partial: 'var(--gold)',
  fatigued: 'var(--ember-red)',
};

// Neutral/cold figure tint (no recovery data) — muted line color, no claim.
const NEUTRAL_FILL = 'var(--line)';

// Legend order = severity ramp red→green so the gradient reads left→right.
const LEGEND_ORDER: RecoveryState[] = ['fatigued', 'partial', 'recovered'];

// ── Big-11 group → front-view SVG region path ─────────────────────────────────
// viewBox 140 × 330. Proportions follow the 8-head canon (head ≈ 1/8 height ≈ 40px,
// shoulders ≈ 2 head-widths). Gender-neutral, natural limb taper. Back-only groups
// (spate / fese / picioare-hamstrings) have no front silhouette path — they render
// in the legend readout only (see notes above). antebrate has no engine heads
// (placeholder group) but a real forearm region, so it is drawn and colored.
interface Region {
  group: string;
  path: string;
}

const REGIONS: Region[] = [
  // CHEST — two pectoral slabs below the clavicle line.
  { group: 'piept', path: 'M52 96 Q70 90 70 90 L70 120 Q60 126 50 122 Q47 108 52 96 Z' },
  { group: 'piept', path: 'M88 96 Q70 90 70 90 L70 120 Q80 126 90 122 Q93 108 88 96 Z' },
  // SHOULDERS — rounded deltoid caps at the outer top of each arm.
  { group: 'umeri', path: 'M46 92 Q36 90 33 102 Q31 112 38 116 Q47 110 50 100 Q49 94 46 92 Z' },
  { group: 'umeri', path: 'M94 92 Q104 90 107 102 Q109 112 102 116 Q93 110 90 100 Q91 94 94 92 Z' },
  // CORE / ABS — central column from sternum to pelvis.
  { group: 'core', path: 'M58 124 L82 124 L80 168 Q70 174 60 168 Z' },
  // BICEPS — front of the upper arm.
  { group: 'biceps', path: 'M36 118 Q30 122 31 138 Q33 150 40 150 Q44 138 43 124 Q41 119 36 118 Z' },
  { group: 'biceps', path: 'M104 118 Q110 122 109 138 Q107 150 100 150 Q96 138 97 124 Q99 119 104 118 Z' },
  // TRICEPS — outer back of the upper arm (visible silhouette edge, front view).
  { group: 'triceps', path: 'M30 120 Q24 126 26 142 Q28 152 33 150 Q31 138 32 124 Q31 120 30 120 Z' },
  { group: 'triceps', path: 'M110 120 Q116 126 114 142 Q112 152 107 150 Q109 138 108 124 Q109 120 110 120 Z' },
  // FOREARMS — lower arm.
  { group: 'antebrate', path: 'M30 152 Q27 162 30 180 Q34 190 39 188 Q41 172 40 154 Q35 150 30 152 Z' },
  { group: 'antebrate', path: 'M110 152 Q113 162 110 180 Q106 190 101 188 Q99 172 100 154 Q105 150 110 152 Z' },
  // QUADS — front of the thighs.
  { group: 'picioare-quads', path: 'M56 178 Q50 200 52 240 Q56 256 64 254 Q68 218 68 180 Q62 176 56 178 Z' },
  { group: 'picioare-quads', path: 'M84 178 Q90 200 88 240 Q84 256 76 254 Q72 218 72 180 Q78 176 84 178 Z' },
  // CALVES — lower legs.
  { group: 'gambe', path: 'M55 256 Q51 278 55 304 Q59 314 64 312 Q66 286 65 258 Q60 254 55 256 Z' },
  { group: 'gambe', path: 'M85 256 Q89 278 85 304 Q81 314 76 312 Q74 286 75 258 Q80 254 85 256 Z' },
];

// Body-outline silhouette (drawn behind the colored regions as a neutral base so
// non-front groups still read as part of a whole figure). Head + neck + torso +
// limbs as a single soft outline.
const SILHOUETTE =
  // head
  'M70 30 m-15 0 a15 15 0 1 0 30 0 a15 15 0 1 0 -30 0 ' +
  // neck + torso + arms + legs outline
  'M63 46 L77 46 L80 60 Q100 64 108 92 L114 150 L112 192 L100 192 L96 150 ' +
  'Q94 120 88 100 L88 172 L92 256 L88 314 L74 314 L70 258 L66 314 L52 314 ' +
  'L48 256 L52 172 L52 100 Q46 120 44 150 L40 192 L28 192 L26 150 L32 92 ' +
  'Q40 64 60 60 Z';

// Groups present in the engine taxonomy but NOT drawable on a FRONT view.
// They still surface in the legend per-group readout (no state hidden).
const BACK_ONLY = new Set(['spate', 'fese', 'picioare-hamstrings']);

// Reduced-motion gate. The glow keyframe is ALSO collapsed by the global
// prefers-reduced-motion block in global.css; this is the belt-and-braces JS
// guard (same pattern as useCountUp) so the animating class is never even
// attached when the user opts out (Maria 65 vestibular safety).
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function MuscleBodyMap(): JSX.Element | null {
  const groups = useMuscleRecoveryGroups();
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);

  // Cold state: no real session data → the engine reports everything as
  // 'recovered' by baseline, which would paint a fully-green figure that
  // OVER-claims recovery for someone who never trained. Detect the empty case
  // and render neutral instead (data honesty — Pulse blueprint flag).
  const isCold = !Array.isArray(sessionsHistory) || sessionsHistory.length === 0;

  // Quick lookup: group → state.
  const stateByGroup = useMemo(() => {
    const map: Record<string, RecoveryState> = {};
    for (const g of groups) map[g.group] = g.state;
    return map;
  }, [groups]);

  const reduceMotion = prefersReducedMotion();

  // Engine returned nothing (threw / empty taxonomy) → render nothing so a bare
  // heading isn't left dangling (mirrors MuscleRecoveryGrid's null guard).
  if (groups.length === 0) return null;

  const stateLabel = (state: RecoveryState): string => t(`progres.recovery.state.${state}`);
  const regionAria = (label: string, state: RecoveryState): string =>
    t('progres.recovery.bodyMap.regionLabel', { group: label, state: stateLabel(state) });

  return (
    <section
      data-testid="muscle-body-map"
      className="pulse-card p-4 mb-4"
      data-cold={isCold ? 'true' : 'false'}
      aria-label={t('progres.recovery.bodyMap.ariaLabel')}
    >
      <div className="flex items-start gap-4">
        {/* ── Figure ──────────────────────────────────────────────────────── */}
        <svg
          width={140}
          height={330}
          viewBox="0 0 140 330"
          role="img"
          aria-label={t('progres.recovery.bodyMap.figureAlt')}
          data-testid="body-map-figure"
          className="shrink-0"
          style={{ opacity: isCold ? 0.55 : 1 }}
        >
          {/* Neutral body silhouette base. */}
          <path
            d={SILHOUETTE}
            fill="color-mix(in oklab, var(--line) 70%, transparent)"
            stroke="var(--line)"
            strokeWidth={1}
            data-testid="body-map-silhouette"
          />
          {/* Colored muscle regions. */}
          {REGIONS.map((region, i) => {
            const state = stateByGroup[region.group];
            const drawCold = isCold || state === undefined;
            const fill = drawCold ? NEUTRAL_FILL : STATE_COLOR[state];
            const groupLabel =
              groups.find((g) => g.group === region.group)?.label ?? region.group;
            // Glow + pulse only for stressed states in a live (non-cold) figure,
            // and only when motion is allowed.
            const stressed =
              !drawCold && !reduceMotion && (state === 'fatigued' || state === 'partial');
            return (
              <path
                key={`${region.group}-${i}`}
                d={region.path}
                fill={fill}
                data-testid={`body-region-${region.group}`}
                data-recovery-state={drawCold ? 'neutral' : state}
                role="img"
                aria-label={drawCold ? groupLabel : regionAria(groupLabel, state)}
                className={stressed ? 'body-map-region--stressed' : undefined}
                style={{
                  filter: drawCold
                    ? 'none'
                    : `drop-shadow(0 0 4px color-mix(in oklab, ${STATE_COLOR[state]} 60%, transparent))`,
                }}
              />
            );
          })}
        </svg>

        {/* ── Legend + per-group readout ──────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wide text-ink3 font-semibold mb-2">
            {t('progres.recovery.bodyMap.legendTitle')}
          </div>
          {/* Color → meaning legend (red→green ramp). */}
          <ul className="flex flex-col gap-1.5 mb-3" data-testid="body-map-legend">
            {LEGEND_ORDER.map((state) => (
              <li key={state} className="flex items-center gap-2 text-[11px] text-ink2">
                <span
                  aria-hidden="true"
                  className="block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: STATE_COLOR[state] }}
                />
                <span>{stateLabel(state)}</span>
              </li>
            ))}
          </ul>
          {/* Per-group readout — carries EVERY group (incl. back-only ones the
              front figure cannot draw) so no state is color-only or hidden. */}
          <ul className="flex flex-col gap-1" data-testid="body-map-readout">
            {groups.map(({ group, label, state }) => (
              <li
                key={group}
                className="flex items-center justify-between gap-2 text-[10.5px]"
                data-testid={`body-readout-${group}`}
                data-recovery-state={isCold ? 'neutral' : state}
                data-back-only={BACK_ONLY.has(group) ? 'true' : undefined}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <span
                    aria-hidden="true"
                    className="block w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: isCold ? NEUTRAL_FILL : STATE_COLOR[state] }}
                  />
                  <span className="text-ink truncate">{label}</span>
                </span>
                <span className="text-ink3 uppercase tracking-wide shrink-0">
                  {stateLabel(state)}
                </span>
              </li>
            ))}
          </ul>
          {isCold && (
            <p className="text-[10px] text-ink3 mt-2 leading-tight" data-testid="body-map-empty">
              {t('progres.recovery.bodyMap.empty')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
