// ══ MUSCLE BODY MAP — anatomical recovery figure (Big-11) ════════════════════
// Daniel's brief (v2 polish): a PREMIUM, near-photoreal dark-mode anatomy
// visualization where each muscle group glows by recovery state
// (fatigued → ember-red, partial → gold, recovered → volt). v1 was a flat-fill
// front-only figure; v2 raises FIDELITY (per-region radial gradients = muscle-
// belly depth, fascia separation lines, layered outer glow) and COVERAGE
// (sex-specific male/female figures + a Fata/Spate toggle so the posterior chain
// — spate / fese / picioare-hamstrings — is finally painted on a body, not only
// in the legend). NOT a gorilla, NOT a stickman, NOT circles.
//
// DATA CONTRACT (unchanged — drop-in, matched 1:1 with MuscleRecoveryGrid):
//   useMuscleRecoveryGroups() → { group, label, state }[] where state is the
//   engine's DISCRETE 'recovered' | 'partial' | 'fatigued' (muscleRecovery.
//   getRecoveryByGroup, Big-11 canonical V1). Group keys verbatim:
//     piept · spate · umeri · biceps · triceps · antebrate · core ·
//     picioare-quads · picioare-hamstrings · fese · gambe
//   Same hook, same discrete states, same color ramp, same a11y labels, same
//   reduced-motion gating, same cold/empty state. ONLY fidelity + coverage rise.
//
// SEX: male/female front+back path sets, chosen from the SAME source the BF/Navy
// strip uses (onboardingStore data.sex 'm' | 'f'); null → male as a neutral
// default (matches BMR sex-avg fallback elsewhere). Proportions are natural
// (male: broader shoulders; female: waist taper + wider hips), never exaggerated.
//
// COLOR never the sole carrier of meaning: every drawn region has a paired
// accessible label, plus the legend + the per-group readout (color-blind safe,
// WCAG 1.4.1). The readout still carries EVERY Big-11 group regardless of view.
//
// MOTION: a soft glow pulse on stressed regions. The keyframe is named so the
// global prefers-reduced-motion block in global.css collapses it; we ALSO guard
// inline (animation only attached when motion is allowed) for belt-and-braces.
//
// EMPTY / COLD STATE: a fresh user (no sessions) yields all-'recovered' from the
// engine. We additionally detect the cold case (no real training data) and render
// the figure DIMMED/neutral with an explicit empty note — no recovery claim.

import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useMuscleRecoveryGroups } from './MuscleRecoveryGrid';
import { getBodyFigure, type Sex, type View } from './muscleBodyAnatomy';
import type { RecoveryState } from '../../../engine/muscleRecovery.js';
import { t } from '../../../i18n/index.js';

// ── State → color token (red→orange→yellow→green spectrum, Pulse palette) ──────
// recovered = volt (electric lime/green), partial = gold (amber/yellow),
// fatigued = ember-red. The intermediate orange lives in the gradient + glow.
const STATE_COLOR: Record<RecoveryState, string> = {
  recovered: 'var(--volt)',
  partial: 'var(--gold)',
  fatigued: 'var(--ember-red)',
};

// Neutral/cold figure tint (no recovery data) — muted line color, no claim.
const NEUTRAL_FILL = 'var(--line)';

// Legend order = severity ramp red→green so the gradient reads left→right.
const LEGEND_ORDER: RecoveryState[] = ['fatigued', 'partial', 'recovered'];

// Stable SVG gradient id per state (inner highlight → outer state color). One
// set lives in <defs>; regions reference them so the fill reads as a lit muscle
// belly rather than a flat patch (the v1 → v2 fidelity lift).
const GRAD_ID: Record<RecoveryState, string> = {
  recovered: 'andura-bodymap-grad-recovered',
  partial: 'andura-bodymap-grad-partial',
  fatigued: 'andura-bodymap-grad-fatigued',
};
const NEUTRAL_GRAD_ID = 'andura-bodymap-grad-neutral';
const GLOW_FILTER_ID = 'andura-bodymap-glow';

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
  // Sex from the SAME source the BodyFat / US-Navy strip reads. null → male as a
  // neutral default (parity with the sex-avg BMR fallback). 'm' | 'f' only.
  const sexRaw = useOnboardingStore((s) => s.data.sex);
  const sex: Sex = sexRaw === 'f' ? 'f' : 'm';

  // Fata / Spate — UI-local only (persist nothing). Default front.
  const [view, setView] = useState<View>('front');

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

  const figure = getBodyFigure(sex, view);
  const reduceMotion = prefersReducedMotion();

  // Engine returned nothing (threw / empty taxonomy) → render nothing so a bare
  // heading isn't left dangling (mirrors MuscleRecoveryGrid's null guard).
  if (groups.length === 0) return null;

  const stateLabel = (state: RecoveryState): string => t(`progres.recovery.state.${state}`);
  const regionAria = (label: string, state: RecoveryState): string =>
    t('progres.recovery.bodyMap.regionLabel', { group: label, state: stateLabel(state) });
  const figureAlt =
    view === 'back'
      ? t('progres.recovery.bodyMap.figureAltBack')
      : t('progres.recovery.bodyMap.figureAlt');

  return (
    <section
      data-testid="muscle-body-map"
      className="pulse-card p-4 mb-4"
      data-cold={isCold ? 'true' : 'false'}
      data-sex={sex}
      data-view={view}
      aria-label={t('progres.recovery.bodyMap.ariaLabel')}
    >
      <div className="flex items-start gap-4">
        {/* ── Figure column (toggle + SVG) ──────────────────────────────────── */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          {/* Fata / Spate segmented toggle. */}
          <div
            className="body-map-toggle"
            role="group"
            data-testid="body-map-view-toggle"
            aria-label={t('progres.recovery.bodyMap.viewToggleAriaLabel')}
          >
            <button
              type="button"
              className="body-map-toggle__btn"
              aria-pressed={view === 'front'}
              data-testid="body-map-view-front"
              onClick={() => setView('front')}
            >
              {t('progres.recovery.bodyMap.viewFront')}
            </button>
            <button
              type="button"
              className="body-map-toggle__btn"
              aria-pressed={view === 'back'}
              data-testid="body-map-view-back"
              onClick={() => setView('back')}
            >
              {t('progres.recovery.bodyMap.viewBack')}
            </button>
          </div>

          <svg
            width={140}
            height={340}
            viewBox="0 0 140 340"
            role="img"
            aria-label={figureAlt}
            data-testid="body-map-figure"
            style={{ opacity: isCold ? 0.55 : 1 }}
          >
            {/* ── Fidelity defs: per-state belly gradients + layered glow ────── */}
            <defs>
              {/* Inner highlight → outer state color: reads as a lit muscle belly
                  with depth, not a flat fill. Same ramp for every state, tinted. */}
              {(['recovered', 'partial', 'fatigued'] as RecoveryState[]).map((state) => (
                <radialGradient
                  key={state}
                  id={GRAD_ID[state]}
                  cx="42%"
                  cy="34%"
                  r="78%"
                >
                  <stop
                    offset="0%"
                    stopColor={`color-mix(in oklab, ${STATE_COLOR[state]} 92%, #fff 8%)`}
                  />
                  <stop offset="58%" stopColor={STATE_COLOR[state]} />
                  <stop
                    offset="100%"
                    stopColor={`color-mix(in oklab, ${STATE_COLOR[state]} 62%, #000 38%)`}
                  />
                </radialGradient>
              ))}
              {/* Neutral / cold belly — muted, no recovery claim. */}
              <radialGradient id={NEUTRAL_GRAD_ID} cx="42%" cy="34%" r="78%">
                <stop
                  offset="0%"
                  stopColor={`color-mix(in oklab, ${NEUTRAL_FILL} 70%, #fff 6%)`}
                />
                <stop offset="100%" stopColor={`color-mix(in oklab, ${NEUTRAL_FILL} 55%, #000 45%)`} />
              </radialGradient>
              {/* Refined outer glow — soft, premium halo around stressed regions. */}
              <filter id={GLOW_FILTER_ID} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Neutral body silhouette base with a subtle vertical depth shade. */}
            <path
              d={figure.silhouette}
              fill="color-mix(in oklab, var(--line) 70%, transparent)"
              stroke="var(--line)"
              strokeWidth={1}
              data-testid="body-map-silhouette"
            />

            {/* Colored muscle regions. */}
            {figure.regions.map((region, i) => {
              const state = stateByGroup[region.group];
              const drawCold = isCold || state === undefined;
              const fill = drawCold ? `url(#${NEUTRAL_GRAD_ID})` : `url(#${GRAD_ID[state]})`;
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
                  // Fascia / muscle-separation line — a hairline of the state color
                  // around each belly so adjacent regions read as distinct muscles.
                  stroke={
                    drawCold
                      ? 'color-mix(in oklab, var(--line) 80%, transparent)'
                      : `color-mix(in oklab, ${STATE_COLOR[state]} 55%, #000 45%)`
                  }
                  strokeWidth={0.6}
                  data-testid={`body-region-${region.group}`}
                  data-recovery-state={drawCold ? 'neutral' : state}
                  role="img"
                  aria-label={drawCold ? groupLabel : regionAria(groupLabel, state)}
                  className={stressed ? 'body-map-region--stressed' : undefined}
                  style={{
                    filter: drawCold ? 'none' : `url(#${GLOW_FILTER_ID})`,
                  }}
                />
              );
            })}
          </svg>
        </div>

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
          {/* Per-group readout — carries EVERY group regardless of the active
              view so no state is color-only or hidden. The data-on-view flag
              marks which groups the current figure actually paints. */}
          <ul className="flex flex-col gap-1" data-testid="body-map-readout">
            {groups.map(({ group, label, state }) => {
              // Is this group painted on the figure currently shown? Used only as
              // a data flag (no group is ever hidden from the readout itself).
              const paintedGroups = new Set(figure.regions.map((r) => r.group));
              const onView = paintedGroups.has(group);
              return (
                <li
                  key={group}
                  className="flex items-center justify-between gap-2 text-[10.5px]"
                  data-testid={`body-readout-${group}`}
                  data-recovery-state={isCold ? 'neutral' : state}
                  data-on-view={onView ? 'true' : 'false'}
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
              );
            })}
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
