// ══ WORKOUT PREVIEW (RN port, route '/app/antrenor/workout-preview') ══════
// RN twin of src/react/routes/screens/antrenor/WorkoutPreview.tsx. Step 3 of
// the energy → cause → preview flow. ALL engine logic kept 1:1: the async
// getTodayWorkout state machine (loading/error/fallback), the title sentinel
// bridge, the engine-intensity duration/volume scaling, the busy-type
// recompose, the FALLBACK_EXERCISES demo guard, setSessionContext on start.
// Same testIDs (workout-preview, preview-hero, preview-duration,
// preview-exercise-count, preview-volume, preview-error-banner,
// preview-warmup-row, preview-exercise-list/-row/-sub/-media-N,
// preview-coach-line, preview-closing-note, preview-start-cta) + i18n.
//
// Web→RN routing state: intensityMod / overrideKind / cause arrive as URL
// params (from EnergyCheck / EnergyCause). painContext / equipmentContext are
// object contexts produced by W3c screens (pain-button / equipment-swap); they
// arrive as JSON-encoded params when present and are parsed defensively here
// (no W3a producer yet — forward-compatible). The page wraps the engine 'plus'/
// 'minus' duration & volume scaling unchanged.

import { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { PressScale } from '../../../components/Press';
import { useEntrance } from '../../../lib/motion';
import { Clock, Layers, TrendingUp, Flame, Check, Zap } from 'lucide-react-native';
import { gotoPath } from '../../../lib/nav';
import { coachPick } from '../../../../src/react/lib/coachVoice';
import { getTodayWorkout, resolveSessionTitle } from '../../../../src/react/lib/engineWrappers';
import type { PlannedWorkoutOutput } from '../../../../src/react/lib/engineWrappers';
import { ENGINE_WORKOUT_TITLE_FALLBACK } from '../../../../src/react/lib/scheduleAdapterAggregate';
import { recomposeWithBusyTypes } from '../../../../src/react/lib/substitution';
import { ExerciseMedia } from '../../../components/ExerciseMedia';
import { useWorkoutStore } from '../../../../src/react/stores/workoutStore';
import { Kicker } from '../../../components/pulse/Kicker';
import { PulseCard } from '../../../components/pulse/PulseCard';
import { accent, dark, status, varColor, withAlpha } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

type IntensityMod = 'plus' | 'normal' | 'minus';

interface IntensityBanner {
  accent: string;
  msg: string;
}

function bannerFor(intensityMod: IntensityMod): IntensityBanner {
  if (intensityMod === 'plus') {
    return { accent: accent.volt, msg: t('workout.preview.intensityBanner.plus') };
  }
  if (intensityMod === 'minus') {
    return { accent: accent.ember, msg: t('workout.preview.intensityBanner.minus') };
  }
  return { accent: accent.aqua, msg: t('workout.preview.intensityBanner.normal') };
}

function durationFor(intensityMod: IntensityMod): number {
  if (intensityMod === 'minus') return 35;
  if (intensityMod === 'plus') return 60;
  return 50;
}

function volumeFor(intensityMod: IntensityMod): number {
  if (intensityMod === 'minus') return 10200;
  if (intensityMod === 'plus') return 14500;
  return 12450;
}

function formatVolume(kg: number): string {
  return kg.toLocaleString('ro-RO').replace(/,/g, ' ').replace(/\./g, ' ');
}

interface FallbackExercise {
  nameKey: string;
  detail: { sets: number; kg?: number; reps?: string; seconds?: number };
}
const FALLBACK_EXERCISES: FallbackExercise[] = [
  { nameKey: 'workout.preview.fallbackExercises.inclineDbPress', detail: { sets: 4, kg: 22.5, reps: '8-10' } },
  { nameKey: 'workout.preview.fallbackExercises.seatedMilitaryPress', detail: { sets: 4, kg: 20, reps: '8-10' } },
  { nameKey: 'workout.preview.fallbackExercises.lateralRaise', detail: { sets: 3, kg: 8, reps: '12-15' } },
  { nameKey: 'workout.preview.fallbackExercises.tricepCableExtension', detail: { sets: 3, kg: 15, reps: '10-12' } },
  { nameKey: 'workout.preview.fallbackExercises.plank', detail: { sets: 3, seconds: 45 } },
];

function fallbackDetail(d: FallbackExercise['detail']): string {
  if (d.seconds !== undefined) {
    return t('workout.preview.exerciseTimedDetail', { sets: d.sets, seconds: d.seconds });
  }
  return t('workout.preview.exerciseDetail', { sets: d.sets, kg: d.kg ?? 0, reps: d.reps ?? '' });
}

// Defensively parse a JSON-encoded object param (painContext / equipmentContext
// from W3c). Returns null on absence / malformed (never throws in render).
function parseJsonParam<T>(raw: string | string[] | undefined): T | null {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function WorkoutPreview(): React.JSX.Element {
  const params = useLocalSearchParams<{
    intensityMod?: string;
    overrideKind?: string;
    cause?: string;
    painContext?: string;
    equipmentContext?: string;
  }>();
  const setSessionContext = useWorkoutStore((s) => s.setSessionContext);

  const intensityMod = (params.intensityMod as IntensityMod) ?? 'normal';
  const overrideKind = params.overrideKind as 'easier' | 'harder' | 'different-muscle' | undefined;
  const painContext = parseJsonParam<{ region: string; intensity: 1 | 2 | 3 }>(params.painContext);
  const equipmentContext = parseJsonParam<{ busyCoarseTypes?: string[] }>(params.equipmentContext);
  const busyCoarseTypes = equipmentContext?.busyCoarseTypes ?? [];
  const wantDifferentMuscle = overrideKind === 'different-muscle';

  const [workout, setWorkout] = useState<PlannedWorkoutOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  useEffect(() => {
    let cancelled = false;
    getTodayWorkout(wantDifferentMuscle ? { differentMuscle: true } : {})
      .then((w) => {
        if (!cancelled) {
          setWorkout(w);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [wantDifferentMuscle]);

  const engineFallbackSentinel = t('coachToday.engineFallbackTitle');
  const rawWorkoutTitle = workout?.workoutTitle;
  const isEngineFallback =
    rawWorkoutTitle === ENGINE_WORKOUT_TITLE_FALLBACK ||
    rawWorkoutTitle === 'Antrenament azi' ||
    rawWorkoutTitle === engineFallbackSentinel;
  const title = rawWorkoutTitle && !isEngineFallback ? rawWorkoutTitle : resolveSessionTitle(workout?.sessionType);
  const engineIntensityMod: IntensityMod = workout?.intensityMod ?? 'normal';
  const banner = bannerFor(intensityMod);
  const baseDuration = workout?.estimatedDuration ?? durationFor('normal');
  const baseVolume = workout?.volumeKg ?? volumeFor('normal');
  const duration =
    engineIntensityMod === 'minus'
      ? Math.round(baseDuration * 0.7)
      : engineIntensityMod === 'plus'
        ? Math.round(baseDuration * 1.2)
        : baseDuration;
  const volume =
    engineIntensityMod === 'minus'
      ? Math.round(baseVolume * 0.82)
      : engineIntensityMod === 'plus'
        ? Math.round(baseVolume * 1.16)
        : baseVolume;
  const coachLine = coachPick('preview', undefined, 0);

  const displayExercises =
    workout?.exercises && busyCoarseTypes.length > 0
      ? recomposeWithBusyTypes(workout.exercises, busyCoarseTypes)
      : workout?.exercises;

  function handleStart(): void {
    setSessionContext({ intensityMod, painContext: painContext ?? null });
    router.push(gotoPath('workout') as never);
  }

  const exerciseCount = workout?.exerciseCount ?? 5;

  // Staggered screen entrance (reduced-motion-safe, web-visible).
  const enterHero = useEntrance(0);
  const enterBanner = useEntrance(1);
  const enterList = useEntrance(2);
  const enterCta = useEntrance(3);

  const rows =
    displayExercises && displayExercises.length > 0
      ? displayExercises.map((ex, i) => ({
          key: ex.id,
          name: ex.name,
          engineName: ex.engineName ?? ex.name,
          sub: ex.swapReason ? t('workout.preview.swappedPrefix', { reason: ex.swapReason }) : ex.sub,
          detail: ex.isBodyweight
            ? ex.targetKg > 0
              ? t('workout.preview.exerciseDetailBodyweightAdded', { sets: ex.sets, kg: ex.targetKg, reps: ex.targetReps })
              : t('workout.preview.exerciseDetailBodyweight', { sets: ex.sets, reps: ex.targetReps })
            : t('workout.preview.exerciseDetail', { sets: ex.sets, kg: ex.targetKg, reps: ex.targetReps }),
          idx: i,
        }))
      : FALLBACK_EXERCISES.map((ex, i) => {
          const name = t(ex.nameKey);
          return {
            key: `fallback-${i}`,
            name,
            engineName: name,
            sub: undefined as string | undefined,
            detail: fallbackDetail(ex.detail),
            idx: i,
          };
        });

  return (
    <ScrollView
      testID="workout-preview"
      accessibilityState={{ busy: loading }}
      className="bg-paper"
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 20, paddingBottom: 24 }}
    >
      {error && (
        <View
          testID="preview-error-banner"
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          style={{
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            marginBottom: 16,
            backgroundColor: status.dangerBg,
            borderColor: status.dangerBorder,
          }}
        >
          <Text style={{ fontSize: 16, color: dark.ink }}>{t('workout.preview.errorBanner')}</Text>
        </View>
      )}

      {/* Hero — kicker + title + meta row. */}
      <Animated.View
        entering={enterHero}
        testID="preview-hero"
        accessibilityLabel={t('workout.preview.ariaLabel')}
        style={{ marginBottom: 16 }}
      >
        <Kicker color={accent.volt}>{t('workout.preview.todaysSessionKicker')}</Kicker>
        <Text className="font-display" style={{ fontSize: 24, fontWeight: '700', marginTop: 6, color: dark.ink }}>
          {title}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 6 }}>
          <View testID="preview-duration" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 10 }}>
            <Clock size={14} color={dark.ink2} />
            <Text style={{ fontSize: 14, color: dark.ink2 }}>~ {duration} min</Text>
          </View>
          <View testID="preview-exercise-count" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 10 }}>
            <Layers size={14} color={dark.ink2} />
            <Text style={{ fontSize: 14, color: dark.ink2 }}>
              {t('workout.preview.exercisesCount', { n: exerciseCount })}
            </Text>
          </View>
          <View testID="preview-volume" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} color={dark.ink2} />
            <Text style={{ fontSize: 14, color: dark.ink2 }}>{formatVolume(volume)} kg</Text>
          </View>
        </View>
      </Animated.View>

      {/* Intensity banner — tinted by the self-report. */}
      <Animated.View
        entering={enterBanner}
        accessibilityRole="text"
        accessibilityLiveRegion="polite"
        accessibilityLabel={t('workout.preview.intensityBanner.ariaLabel')}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
          padding: 14,
          borderRadius: 16,
          borderWidth: 1,
          marginBottom: 16,
          backgroundColor: withAlpha(banner.accent, 0.12),
          borderColor: withAlpha(banner.accent, 0.35),
        }}
      >
        <Zap size={18} color={banner.accent} fill={banner.accent} style={{ marginTop: 2 }} />
        <Text style={{ flex: 1, fontSize: 14, lineHeight: 21, color: dark.ink }}>{banner.msg}</Text>
      </Animated.View>

      {/* Warmup row — renders only when the engine emits a warmup blueprint. */}
      {workout?.warmup && (
        <PulseCard
          testID="preview-warmup-row"
          accessibilityLabel={t('workout.preview.warmupAriaLabel')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 16 }}
        >
          <Flame size={16} color={dark.brick} />
          <Text className="font-serif" style={{ flex: 1, fontStyle: 'italic', fontSize: 14, lineHeight: 21, color: dark.ink2 }}>
            {workout.warmup.durationMin > 0
              ? t('workout.preview.warmupLine', { min: workout.warmup.durationMin })
              : workout.warmup.line}
          </Text>
        </PulseCard>
      )}

      {/* Exercise list. */}
      <View style={{ marginBottom: 10 }}>
        <Kicker>{t('workout.preview.exercisesHeading')}</Kicker>
      </View>
      <Animated.View entering={enterList}>
      <PulseCard testID="preview-exercise-list" style={{ marginBottom: 16 }}>
        {rows.map((item, i) => (
          <View
            key={item.key}
            testID="preview-exercise-row"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: dark.line,
            }}
          >
            <View style={{ position: 'relative' }}>
              <ExerciseMedia engineName={item.engineName} variant="thumbnail" testId={`preview-exercise-media-${item.idx}`} />
              <View
                style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  width: 20,
                  height: 20,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: dark.paper,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: withAlpha(varColor('--brick'), 0.16),
                }}
              >
                <Text className="font-mono" style={{ fontSize: 10, fontWeight: '700', color: dark.brick }}>
                  {item.idx + 1}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '600', color: dark.ink }}>
                {item.name}
              </Text>
              {item.sub && (
                <Text testID="preview-exercise-sub" style={{ fontSize: 12, color: dark.ink3, marginTop: 2 }}>
                  {item.sub}
                </Text>
              )}
              <Text className="font-mono" style={{ fontSize: 12, color: dark.ink3, marginTop: 2 }}>
                {item.detail}
              </Text>
            </View>
          </View>
        ))}
      </PulseCard>
      </Animated.View>

      {coachLine && (
        <Text
          testID="preview-coach-line"
          className="font-serif"
          style={{ fontSize: 16, fontStyle: 'italic', color: dark.ink2, marginBottom: 24 }}
        >
          {`“${coachLine}”`}
        </Text>
      )}

      <Text
        testID="preview-closing-note"
        style={{ fontSize: 14, fontStyle: 'italic', lineHeight: 21, color: dark.ink3, marginTop: 14, marginBottom: 16 }}
      >
        {t('workout.preview.closingNote')}
      </Text>

      <Animated.View entering={enterCta}>
      <PressScale testID="preview-start-cta" onPress={handleStart} style={{ borderRadius: 999, overflow: 'hidden' }}>
        <LinearGradient
          colors={[accent.volt, accent.aqua]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 }}
        >
          <Check size={20} color={dark.onAccent} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>
            {t('workout.preview.confirmStartCta')}
          </Text>
        </LinearGradient>
      </PressScale>
      </Animated.View>
    </ScrollView>
  );
}
