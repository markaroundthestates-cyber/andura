// ══ MUSCLE BODY MAP (RN port) — photoreal recovery body (Big-11) ══════════════
// RN twin of src/react/components/Progres/MuscleBodyMap.tsx. The premium dark-mode
// anatomy visualization: a real grey-anatomy photoreal base (bundled webp, sex +
// view) with a soft colored recovery GLOW per Big-11 muscle painted on top.
//
// DATA CONTRACT (unchanged — 1:1 with MuscleRecoveryGrid): useMuscleRecoveryGroups()
// → { group, label, state }[] with discrete 'recovered'|'partial'|'fatigued'.
// Same hook, same states, same color ramp, same cold/empty handling, same a11y
// labels, same testIDs.
//
// FIDELITY FLAGS (vs web):
//  - The web painted glows as absolutely-positioned <span>s with `mix-blend-mode:
//    screen` over the body image. RN has NO blend modes, so the glow is an Svg
//    overlay of soft RadialGradient discs (volt/gold/ember per state) at moderate
//    opacity. Reads as a colored aura on the body, lighter than the web's screen-
//    blend luminance lift — visual-fidelity flag for the design polish pass.
//  - The reduced-motion stressed-glow pulse is dropped (the web used a CSS
//    keyframe). The static glow alone carries the recovery meaning; motion was
//    decorative. Reanimated pulse can be re-added at the motion wave if desired.
//  - The web <img> onError SVG-fallback figure is N/A: bundled require() assets
//    always resolve in RN, so the photoreal base never fails to load.

import { useMemo, useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { useWorkoutStore } from '../../../src/react/stores/workoutStore';
import { useOnboardingStore } from '../../../src/react/stores/onboardingStore';
import { useMuscleRecoveryGroups } from './MuscleRecoveryGrid';
import { getBodyImage, getGlowRegions, type Sex, type View as BodyView } from './muscleBodyAnatomy';
import type { RecoveryState } from '../../../src/engine/muscleRecovery.js';
import { getFatigue } from '../../../src/react/lib/engineWrappers';
import { dark, accent, withAlpha } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

// State → color token (red→orange→green spectrum, Pulse palette). Resolved from
// the static token table (RN has no CSS vars). volt/gold/ember-red mirror the
// web's --volt / --gold / --ember-red recovery ramp.
const STATE_COLOR: Record<RecoveryState, string> = {
  recovered: accent.volt, //   --volt
  partial: accent.gold, //     --gold
  fatigued: accent.emberRed, // --ember-red
};

// Neutral/cold tint (no recovery data) — muted line color, no claim.
const NEUTRAL_FILL = dark.lineStrong;

// Legend order = severity ramp red→green so the gradient reads top→bottom.
const LEGEND_ORDER: RecoveryState[] = ['fatigued', 'partial', 'recovered'];

// Map overall fatigue score (0-10) → the SAME legend vocabulary the recovery
// states use, so the header word reads consistently with the body legend.
function fatigueWord(scoreOutOfTen: number): RecoveryState {
  if (scoreOutOfTen >= 7) return 'fatigued';
  if (scoreOutOfTen >= 4) return 'partial';
  return 'recovered';
}

// Rendered body box (px). 2:3 aspect matches the 640×960 source renders.
const BOX_W = 150;
const BOX_H = 225;

export function MuscleBodyMap(): React.JSX.Element | null {
  const groups = useMuscleRecoveryGroups();
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  // Sex from the SAME source the BodyFat/US-Navy strip reads. null → male.
  const sexRaw = useOnboardingStore((s) => s.data.sex);
  const sex: Sex = sexRaw === 'f' ? 'f' : 'm';

  // Fata / Spate — UI-local only. Default front.
  const [view, setView] = useState<BodyView>('front');

  // Cold state: no real session data → engine baselines everything to
  // 'recovered', which would over-claim recovery. Render neutral instead.
  const isCold = !Array.isArray(sessionsHistory) || sessionsHistory.length === 0;

  // Quick lookup: group → state.
  const stateByGroup = useMemo(() => {
    const map: Record<string, RecoveryState> = {};
    for (const g of groups) map[g.group] = g.state;
    return map;
  }, [groups]);

  // Engine returned nothing → render nothing (mirrors the grid null guard).
  if (groups.length === 0) return null;

  const stateLabel = (state: RecoveryState): string => t(`progres.recovery.state.${state}`);
  const regionAria = (label: string, state: RecoveryState): string =>
    t('progres.recovery.bodyMap.regionLabel', { group: label, state: stateLabel(state) });
  const figureAlt =
    view === 'back'
      ? t('progres.recovery.bodyMap.figureAltBack')
      : t('progres.recovery.bodyMap.figureAlt');

  const labelFor = (group: string): string =>
    groups.find((g) => g.group === group)?.label ?? group;

  const glows = getGlowRegions(view);
  const imageSrc = getBodyImage(sex, view);
  const paintedGroups = new Set(glows.map((g) => g.group));

  // Overall fatigue line — render ONLY with REAL fatigue data (key !==
  // INSUFFICIENT_DATA). Reuses the recovery legend vocabulary.
  const fatigue = getFatigue();
  const fatigueLine =
    fatigue && fatigue.key !== 'INSUFFICIENT_DATA'
      ? {
          score: Math.round(fatigue.score / 10),
          word: t(`progres.recovery.state.${fatigueWord(Math.round(fatigue.score / 10))}`),
        }
      : null;

  return (
    <View
      testID="muscle-body-map"
      className="bg-paper-2 border border-line p-4 mb-4"
      style={{ borderRadius: 22 }}
      accessibilityLabel={t('progres.recovery.bodyMap.ariaLabel')}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
        {/* ── Figure column (toggle + photoreal body + glow overlay) ──────── */}
        <View style={{ alignItems: 'center', gap: 8 }}>
          {/* Fata / Spate segmented toggle. */}
          <View
            testID="body-map-view-toggle"
            accessibilityRole="radiogroup"
            accessibilityLabel={t('progres.recovery.bodyMap.viewToggleAriaLabel')}
            className="flex-row border border-line"
            style={{ borderRadius: 999, padding: 2 }}
          >
            {(['front', 'back'] as const).map((v) => {
              const active = view === v;
              return (
                <Pressable
                  key={v}
                  testID={v === 'front' ? 'body-map-view-front' : 'body-map-view-back'}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setView(v)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: active ? withAlpha(dark.brick, 0.16) : 'transparent',
                  }}
                >
                  <Text
                    className="font-mono uppercase"
                    style={{
                      fontSize: 10,
                      letterSpacing: 0.6,
                      color: active ? dark.brick : dark.ink2,
                    }}
                  >
                    {v === 'front'
                      ? t('progres.recovery.bodyMap.viewFront')
                      : t('progres.recovery.bodyMap.viewBack')}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View
            testID="body-map-figure"
            accessibilityRole="image"
            accessibilityLabel={figureAlt}
            style={{ width: BOX_W, height: BOX_H }}
          >
            {/* Photoreal grey-anatomy base render (sex + view). Cold-state dim
                lives on the body image (not the container). */}
            <Image
              testID="body-map-image"
              source={imageSrc}
              accessibilityIgnoresInvertColors
              style={{
                position: 'absolute',
                width: BOX_W,
                height: BOX_H,
                opacity: isCold ? 0.55 : 1,
              }}
              resizeMode="contain"
            />
            {/* Colored recovery glow per Big-11 group as an Svg RadialGradient
                overlay (RN has no mix-blend-mode: screen — visual-fidelity flag). */}
            <Svg
              width={BOX_W}
              height={BOX_H}
              viewBox={`0 0 ${BOX_W} ${BOX_H}`}
              style={{ position: 'absolute' }}
              pointerEvents="none"
            >
              <Defs>
                {glows.map((glow, i) => {
                  const state = stateByGroup[glow.group];
                  const drawCold = isCold || state === undefined;
                  const color = drawCold ? NEUTRAL_FILL : STATE_COLOR[state];
                  const gid = `bodymap-glow-${i}`;
                  return (
                    <RadialGradient key={gid} id={gid} cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor={color} stopOpacity={drawCold ? 0.35 : 0.85} />
                      <Stop offset="55%" stopColor={color} stopOpacity={drawCold ? 0.18 : 0.4} />
                      <Stop offset="100%" stopColor={color} stopOpacity={0} />
                    </RadialGradient>
                  );
                })}
              </Defs>
              {glows.map((glow, i) => {
                const state = stateByGroup[glow.group];
                const drawCold = isCold || state === undefined;
                // r is a fraction of WIDTH → radius in px off BOX_W; centers
                // mapped from normalized 0-1 to the box.
                const cx = glow.cx * BOX_W;
                const cy = glow.cy * BOX_H;
                const r = glow.r * BOX_W;
                return (
                  <Circle
                    key={`${glow.group}-${i}`}
                    testID={`body-region-${glow.group}`}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={`url(#bodymap-glow-${i})`}
                    accessibilityLabel={
                      drawCold ? labelFor(glow.group) : regionAria(labelFor(glow.group), state)
                    }
                  />
                );
              })}
            </Svg>
          </View>
        </View>

        {/* ── Legend + per-group readout ──────────────────────────────────── */}
        <View style={{ flex: 1, minWidth: 0 }}>
          {/* Header row: RECOVERY legend title + overall fatigue score. */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <Text
              className="uppercase text-ink3 font-semibold"
              style={{ fontSize: 10, letterSpacing: 0.6 }}
            >
              {t('progres.recovery.bodyMap.legendTitle')}
            </Text>
            {fatigueLine && (
              <Text
                testID="recovery-fatigue-line"
                className="text-ink2 font-semibold"
                style={{ fontSize: 10 }}
              >
                {t('progres.recovery.fatigueLine', {
                  score: String(fatigueLine.score),
                  word: fatigueLine.word,
                })}
              </Text>
            )}
          </View>
          {/* Color → meaning legend (red→green ramp). */}
          <View testID="body-map-legend" style={{ gap: 6, marginBottom: 12 }}>
            {LEGEND_ORDER.map((state) => (
              <View key={state} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: STATE_COLOR[state],
                  }}
                />
                <Text className="text-ink2" style={{ fontSize: 11 }}>
                  {stateLabel(state)}
                </Text>
              </View>
            ))}
          </View>
          {/* Per-group readout — carries EVERY group regardless of view. */}
          <View testID="body-map-readout" style={{ gap: 4 }}>
            {groups.map(({ group, label, state }) => {
              const onView = paintedGroups.has(group);
              return (
                <View
                  key={group}
                  testID={`body-readout-${group}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    opacity: onView ? 1 : 0.65,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: isCold ? NEUTRAL_FILL : STATE_COLOR[state],
                      }}
                    />
                    <Text className="text-ink" style={{ fontSize: 10.5 }} numberOfLines={1}>
                      {label}
                    </Text>
                  </View>
                  <Text
                    className="text-ink3 uppercase"
                    style={{ fontSize: 10.5, letterSpacing: 0.6 }}
                  >
                    {stateLabel(state)}
                  </Text>
                </View>
              );
            })}
          </View>
          {isCold && (
            <Text testID="body-map-empty" className="text-ink3" style={{ fontSize: 10, marginTop: 8, lineHeight: 13 }}>
              {t('progres.recovery.bodyMap.empty')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
