// ══ COACH TODAY CARD (RN port) — Workout Mode ═════════════════════════════
// RN twin of src/react/components/Antrenor/CoachTodayCard.tsx. The big "today's
// session" card on the Antrenor home. ALL engine/store logic is kept 1:1 (the
// title/quote/lagging/why/calibration/return derivations, the today-session
// double-log guard, the reveal options). Only the markup is RN.
//
// Web→RN notes:
//   - Navigation: react-router useNavigate → mobile/lib/nav gotoReplace-style
//     goto(); the override link routes to 'schedule-override' identically.
//   - haptic(): the web motion.ts haptic is window/navigator-guarded so it is a
//     safe no-op under RN today; W-Final swaps it for expo-haptics (FLAG).
//   - The volt glow corner (.coach-glow) + pulse-grad-bg/pulse-shine gradient
//     CTA shimmer are dropped/approximated (FIDELITY FLAG, design-polish wave):
//     the Start CTA uses the volt→aqua LinearGradient fill (the signature look).
//   - Ripple is the W2b RN Ripple (android_ripple — no inline overlay).

import { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Layers, Dumbbell, ArrowRight, CheckCircle2, Trash2, Plus, Sparkles } from 'lucide-react-native';
import { todTs } from '../../../src/db.js';
import type { PlannedWorkoutOutput } from '../../../src/react/lib/engineWrappers';
import * as engineWrappers from '../../../src/react/lib/engineWrappers';
import { coachPick } from '../../../src/react/lib/coachVoice';
import { composeCoachInsight } from '../../../src/react/lib/coachInsight';
import { ENGINE_WORKOUT_TITLE_FALLBACK } from '../../../src/react/lib/scheduleAdapterAggregate';
import { useWorkoutStore } from '../../../src/react/stores/workoutStore';
import { haptic } from '../../lib/motion';
import { Ripple } from '../Ripple';
import { Kicker } from '../pulse/Kicker';
import { PulseCard } from '../pulse/PulseCard';
import { accent, dark, withAlpha } from '../../lib/tokens';
import { goto } from '../../lib/nav';
import { t } from '../../../src/i18n/index.js';

interface Props {
  onStart: () => void;
  workout?: PlannedWorkoutOutput | null;
}

function formatDaysSince(days: number): string {
  if (days <= 1) return t('coachToday.daysSince.yesterday');
  if (days <= 6) return t('coachToday.daysSince.daysFmt', { n: days });
  return t('coachToday.daysSince.lastWeek');
}

export function CoachTodayCard({ onStart, workout }: Props): React.JSX.Element {
  const engineFallbackSentinel = t('coachToday.engineFallbackTitle');
  const rawWorkoutTitle = workout?.workoutTitle;
  const isEngineFallback =
    rawWorkoutTitle === ENGINE_WORKOUT_TITLE_FALLBACK ||
    rawWorkoutTitle === 'Antrenament azi' ||
    rawWorkoutTitle === engineFallbackSentinel;
  const sessionType = workout?.sessionType;
  const title = rawWorkoutTitle && !isEngineFallback
    ? rawWorkoutTitle
    : sessionType
      ? engineWrappers.resolveSessionTitle?.(sessionType) ?? t('coachToday.fallbackTitle')
      : t('coachToday.fallbackTitle');
  const duration = workout?.estimatedDuration ?? 48;
  const exerciseCount = workout?.exerciseCount ?? 5;
  const intensityMod = workout?.intensityMod ?? 'normal';
  const intensityLabel = t(`coachToday.intensity.${intensityMod}`);

  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const todayDate = new Date().toISOString().slice(0, 10);
  const coachQuote = useMemo<string>(() => {
    try {
      const dynamic = engineWrappers.getCoachTodayQuote?.() ?? null;
      if (dynamic !== null) {
        const dayLabel = formatDaysSince(dynamic.daysSince);
        return t('coachToday.recoveredQuote', { group: dynamic.recoveredLabel, when: dayLabel });
      }
    } catch {
      // fall through to generic fallback
    }
    return coachPick('preview', undefined, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionsHistory, todayDate]);

  const laggingSignal = useMemo<string | null>(() => {
    try {
      return engineWrappers.getLaggingSignal?.() ?? null;
    } catch {
      return null;
    }
  }, []);

  const coachWhyLine = useMemo<string | null>(() => {
    try {
      return composeCoachInsight(workout?.coachAdaptations);
    } catch {
      return null;
    }
  }, [workout?.coachAdaptations]);

  const calibrationLine = useMemo<string | null>(() => {
    try {
      const sig = engineWrappers.getCalibrationMaturity?.() ?? null;
      if (sig === null) return null;
      return sig.sessionsToNext != null
        ? t('coachCalibration.withCount', { n: sig.sessionsToNext })
        : t('coachCalibration.noCount');
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionsHistory]);

  const returnLine = useMemo<string | null>(() => {
    try {
      const sig = engineWrappers.getReturnAfterMissSignal?.() ?? null;
      if (sig === null) return null;
      return sig.missedDays === 1
        ? t('coachReturn.line_one')
        : t('coachReturn.line_other', { n: sig.missedDays });
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionsHistory]);

  const todaySession = useMemo(
    () =>
      sessionsHistory.find(
        (s) => Number.isFinite(s.ts) && todTs(s.ts) === todTs(Date.now()),
      ) ?? null,
    [sessionsHistory],
  );
  const deleteSession = useWorkoutStore((s) => s.deleteSession);
  const [revealOptions, setRevealOptions] = useState(false);

  const handleDeleteToday = (): void => {
    if (todaySession) deleteSession(todaySession.ts);
    setRevealOptions(false);
  };

  const handleOverride = (): void => {
    goto('schedule-override');
  };

  const metaRow = (
    <View style={{ flexDirection: 'row', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Clock size={14} color={dark.ink2} />
        <Text style={{ fontSize: 14, color: dark.ink2 }}>{t('coachToday.durationLabel', { min: duration })}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Layers size={14} color={dark.ink2} />
        <Text style={{ fontSize: 14, color: dark.ink2 }}>
          {t(exerciseCount === 1 ? 'coachToday.exercisesCount_one' : 'coachToday.exercisesCount_other', { n: exerciseCount })}
        </Text>
      </View>
      <View testID="coach-today-intensity" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Dumbbell size={14} color={dark.ink2} />
        <Text style={{ fontSize: 14, color: dark.ink2 }}>{intensityLabel}</Text>
      </View>
    </View>
  );

  return (
    <PulseCard
      style={{ padding: 18, marginBottom: 10 }}
      accessibilityLabel={t('coachToday.ariaLabel')}
    >
      <Kicker color={accent.volt}>{t('coachToday.kicker')}</Kicker>
      <Text className="font-display" style={{ fontSize: 20, fontWeight: '700', marginTop: 6, color: dark.ink }}>
        {title}
      </Text>
      <Text
        testID="coach-today-quote"
        className="font-serif"
        style={{ fontStyle: 'italic', marginTop: 8, lineHeight: 21, fontSize: 14, color: accent.volt }}
      >
        {`“${coachQuote}”`}
      </Text>
      {laggingSignal && (
        <Text
          testID="coach-today-lagging"
          className="font-serif"
          style={{
            fontStyle: 'italic',
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: withAlpha(accent.ember, 0.35),
            fontSize: 12,
            lineHeight: 17,
            color: accent.ember,
          }}
        >
          {`“${laggingSignal}”`}
        </Text>
      )}
      {metaRow}
      {coachWhyLine && (
        <View testID="coach-why-line" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 14 }}>
          <Sparkles size={16} color={accent.volt} style={{ marginTop: 2 }} />
          <Text style={{ flex: 1, fontSize: 14, lineHeight: 21, color: dark.ink2 }}>{coachWhyLine}</Text>
        </View>
      )}
      {calibrationLine && (
        <View testID="coach-calibration-line" style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 12, lineHeight: 17, color: dark.ink3 }}>{calibrationLine}</Text>
        </View>
      )}
      {returnLine && (
        <View testID="coach-return-line" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10 }}>
          <Sparkles size={16} color={accent.aqua} style={{ marginTop: 2 }} />
          <Text style={{ flex: 1, fontSize: 14, lineHeight: 21, color: dark.ink2 }}>{returnLine}</Text>
        </View>
      )}
      {todaySession ? (
        <View style={{ marginTop: 16 }}>
          <Pressable
            testID="coach-session-logged"
            accessibilityState={{ expanded: revealOptions }}
            onPress={() => {
              haptic(12);
              setRevealOptions((v) => !v);
            }}
            style={{
              borderWidth: 1,
              borderColor: withAlpha(accent.volt, 0.45),
              backgroundColor: withAlpha(accent.volt, 0.1),
              borderRadius: 999,
              paddingVertical: 15,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={18} color={accent.volt} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: accent.volt }}>
              {t('coachToday.sessionLogged')}
            </Text>
          </Pressable>
          {revealOptions && (
            <View style={{ gap: 10, marginTop: 10 }}>
              <Pressable
                testID="coach-session-delete"
                onPress={handleDeleteToday}
                style={{
                  borderWidth: 1,
                  borderColor: withAlpha(accent.ember, 0.45),
                  borderRadius: 999,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Trash2 size={16} color={accent.ember} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: accent.ember }}>
                  {t('coachToday.deleteSessionToday')}
                </Text>
              </Pressable>
              <Pressable
                testID="coach-session-add-second"
                onPress={() => {
                  haptic(12);
                  onStart();
                }}
                style={{
                  borderWidth: 1,
                  borderColor: dark.lineStrong,
                  borderRadius: 999,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Plus size={16} color={dark.ink2} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: dark.ink2 }}>
                  {t('coachToday.addSecondToday')}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : (
        <>
          <Pressable
            onPress={() => {
              haptic(12);
              onStart();
            }}
            style={{ marginTop: 16, borderRadius: 999, overflow: 'hidden' }}
          >
            <Ripple color="rgba(255,255,255,0.55)" />
            <LinearGradient
              colors={[accent.volt, accent.aqua]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>
                {t('coachToday.startCta')}
              </Text>
              <ArrowRight size={18} color={dark.onAccent} />
            </LinearGradient>
          </Pressable>
          <Pressable testID="coach-today-override" onPress={handleOverride} style={{ marginTop: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: dark.ink3, textDecorationLine: 'underline' }}>
              {t('coachToday.overrideCta')}
            </Text>
          </Pressable>
        </>
      )}
    </PulseCard>
  );
}
