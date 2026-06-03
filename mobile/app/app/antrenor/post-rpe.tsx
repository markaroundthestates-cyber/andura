// ══ POST-RPE (RN port, route '/app/antrenor/post-rpe') ════════════════════
// RN twin of src/react/routes/screens/antrenor/PostRpe.tsx. Post-session RPE
// rating (Usoara / Normala / Grea) → finalize pipeline. ALL store + engine logic
// kept 1:1: setLastRating, the async getTodayWorkout, the double-workout-per-day
// confirm, the in-flight submit latch (submittingRef), the PR enrichment
// (enrichExercisesWithPR + priorLogs from DB), finishSession, incrementStreak,
// refreshPRRecordsFromLogs, then route to post-summary. Select-then-Save (two
// taps) guards an accidental finalize. testIDs kept verbatim.

import { useRef, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { PressScale } from '../../../components/Press';
import { useWorkoutStore, energyLightForIntensityMod } from '../../../../src/react/stores/workoutStore';
import type {
  SessionExerciseBreakdown,
  LogEntry,
} from '../../../../src/react/stores/workoutStore';
import { getTodayWorkout } from '../../../../src/react/lib/engineWrappers';
import { ENGINE_WORKOUT_TITLE_FALLBACK } from '../../../../src/react/lib/scheduleAdapterAggregate';
import { gotoPath } from '../../../lib/nav';
import {
  enrichExercisesWithPR,
  refreshPRRecordsFromLogs,
} from '../../../../src/react/lib/prRecordsWriteback';
import { DB, todTs } from '../../../../src/db.js';
import { toast } from '../../../../src/react/lib/toast';
import { Kicker } from '../../../components/pulse/Kicker';
import { accent, dark, surface, varColor, withAlpha } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

export type SessionRating = 'usoara' | 'normala' | 'grea';

interface RatingMeta {
  rating: SessionRating;
  labelKey: string;
  descriptionKey: string;
  accent: string;
}

const RATING_META: readonly RatingMeta[] = [
  { rating: 'usoara', labelKey: 'postRpe.ratings.easyLabel', descriptionKey: 'postRpe.ratings.easyDescription', accent: accent.volt },
  { rating: 'normala', labelKey: 'postRpe.ratings.rightLabel', descriptionKey: 'postRpe.ratings.rightDescription', accent: accent.aqua },
  { rating: 'grea', labelKey: 'postRpe.ratings.hardLabel', descriptionKey: 'postRpe.ratings.hardDescription', accent: accent.ember },
];

function formatKg(kg: number): string {
  return kg.toLocaleString('ro-RO').replace(/\./g, ' ').replace(/,/g, '.');
}

export default function PostRpe(): React.JSX.Element {
  const history = useWorkoutStore((s) => s.history);
  const sessionStart = useWorkoutStore((s) => s.sessionStart);
  const sessionContext = useWorkoutStore((s) => s.sessionContext);
  const sessionsHistory = useWorkoutStore((s) => s.sessionsHistory);
  const setLastRating = useWorkoutStore((s) => s.setLastRating);
  const finishSession = useWorkoutStore((s) => s.finishSession);
  const incrementStreak = useWorkoutStore((s) => s.incrementStreak);

  const [confirmAnother, setConfirmAnother] = useState(false);
  const loggedToday = sessionsHistory.some(
    (s) => Number.isFinite(s.ts) && todTs(s.ts) === todTs(Date.now()),
  );

  const [pick, setPick] = useState<SessionRating | null>(null);
  const submittingRef = useRef(false);

  async function handleSubmit(rating: SessionRating): Promise<void> {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLastRating(rating);

    const entries = Object.values(history).flat();
    const setsDone = entries.length;
    const volume = entries.reduce((acc, h) => acc + h.kg * h.reps, 0);
    const dur =
      sessionStart !== null
        ? Math.max(1, Math.floor((Date.now() - sessionStart) / 60000))
        : 0;

    const planned = await getTodayWorkout();
    if (setsDone === 0) {
      submittingRef.current = false;
      toast.show({
        message: t('postRpe.noSetsToast'),
        variant: 'error',
      });
      router.push(gotoPath('antrenor') as never);
      return;
    }

    if (loggedToday && !confirmAnother) {
      submittingRef.current = false;
      setConfirmAnother(true);
      return;
    }
    const rawTitle = planned?.workoutTitle;
    const title =
      rawTitle && rawTitle !== ENGINE_WORKOUT_TITLE_FALLBACK
        ? rawTitle
        : t('postRpe.fallbackTitle');
    const setsPart = setsDone === 1 ? `1 ${t('common.set')}` : `${setsDone} ${t('common.setsPlural')}`;
    const meta = t('postRpe.metaTemplate', {
      sets: setsPart,
      minutes: dur,
      kg: formatKg(volume),
    });

    const exercisesBase: SessionExerciseBreakdown[] = Object.entries(history)
      .map(([exIdxStr, sets]) => {
        const exIdx = Number(exIdxStr);
        const planEx = planned?.exercises[exIdx];
        const exerciseId = planEx?.id ?? `ex-${exIdx}`;
        const exerciseName = planEx?.name ?? t('postRpe.fallbackExerciseName', { n: exIdx + 1 });
        let totalVolume = 0;
        let peakOneRM = 0;
        const breakdownSets = sets.map((s) => {
          totalVolume += s.kg * s.reps;
          const oneRM = s.kg * (1 + s.reps / 30);
          if (oneRM > peakOneRM) peakOneRM = oneRM;
          return {
            kg: s.kg,
            reps: s.reps,
            rating: s.rating,
            timestamp: s.timestamp ?? Date.now(),
          };
        });
        return {
          exerciseId,
          exerciseName,
          sets: breakdownSets,
          totalVolume,
          peakOneRM: Math.round(peakOneRM * 10) / 10,
        };
      })
      .filter((bd) => bd.sets.length > 0);

    const priorLogs = (DB.get<LogEntry[]>('logs') ?? []) as LogEntry[];
    const exercises = enrichExercisesWithPR(exercisesBase, priorLogs);

    const energy =
      sessionContext !== null
        ? energyLightForIntensityMod(sessionContext.intensityMod)
        : undefined;

    finishSession({
      title,
      meta,
      ts: Date.now(),
      sets: setsDone,
      durationMin: dur,
      volumeKg: volume,
      exercises,
      ...(energy !== undefined ? { energyEmoji: energy, energy } : {}),
    });
    incrementStreak();

    refreshPRRecordsFromLogs();

    router.push(gotoPath('post-summary') as never);
  }

  return (
    <View testID="post-rpe" style={{ flex: 1, backgroundColor: dark.paper }}>
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
        <Kicker color={accent.aqua}>{t('postRpe.kicker')}</Kicker>
        <Text className="font-display" style={{ fontSize: 24, fontWeight: '700', color: dark.ink, marginTop: 8, marginBottom: 8 }}>
          {t('postRpe.heading')}
        </Text>
        <Text testID="post-rpe-intro" className="font-serif" style={{ fontSize: 16, color: dark.ink2, fontStyle: 'italic', marginBottom: 24, lineHeight: 24 }}>
          {`“${t('postRpe.intro')}”`}
        </Text>

        <View style={{ gap: 12, flex: 1 }}>
          {RATING_META.map((opt) => {
            const selected = pick === opt.rating;
            return (
              <PressScale
                key={opt.rating}
                testID={`post-rpe-rating-${opt.rating}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setPick(opt.rating)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  padding: 20,
                  borderRadius: 22,
                  backgroundColor: selected ? withAlpha(opt.accent, 0.09) : surface.base,
                  borderWidth: 1.5,
                  borderColor: selected ? opt.accent : dark.line,
                  ...(selected ? { shadowColor: opt.accent, shadowOpacity: 0.5, shadowRadius: 14, elevation: 6 } : {}),
                }}
              >
                <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                  <Text className="font-display" style={{ fontSize: 18, fontWeight: '700', color: selected ? opt.accent : dark.ink }}>
                    {t(opt.labelKey)}
                  </Text>
                  <Text style={{ fontSize: 14, color: dark.ink2 }}>{t(opt.descriptionKey)}</Text>
                </View>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: selected ? opt.accent : dark.lineStrong,
                    backgroundColor: selected ? opt.accent : 'transparent',
                  }}
                >
                  {selected && <Check size={16} color={varColor('--on-accent')} strokeWidth={2.6} />}
                </View>
              </PressScale>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer action group (pinned). */}
      <View testID="post-rpe-footer-actions" style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, backgroundColor: dark.paper }}>
        {confirmAnother && (
          <View testID="post-rpe-already-logged" style={{ marginBottom: 16, padding: 16, borderRadius: 22, backgroundColor: dark.paper2, borderWidth: 1, borderColor: dark.lineStrong }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: dark.ink }}>{t('postRpe.alreadyLoggedTitle')}</Text>
            <Text style={{ fontSize: 14, color: dark.ink2, marginTop: 4 }}>{t('postRpe.alreadyLoggedBody')}</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <PressScale
                testID="post-rpe-already-logged-no"
                accessibilityRole="button"
                onPress={() => setConfirmAnother(false)}
                style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: dark.paper, borderWidth: 1, borderColor: dark.lineStrong, borderRadius: 12 }}
              >
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: dark.ink }}>{t('postRpe.alreadyLoggedNo')}</Text>
              </PressScale>
              <PressScale
                testID="post-rpe-already-logged-yes"
                accessibilityRole="button"
                onPress={() => { if (pick) void handleSubmit(pick); }}
                style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: accent.volt, borderRadius: 12 }}
              >
                <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: dark.onAccent }}>{t('postRpe.alreadyLoggedYes')}</Text>
              </PressScale>
            </View>
          </View>
        )}
        {!confirmAnother && (
          <PressScale
            testID="post-rpe-save"
            accessibilityRole="button"
            disabled={pick === null}
            onPress={() => { if (pick) void handleSubmit(pick); }}
            style={{ paddingVertical: 16, backgroundColor: accent.volt, borderRadius: 999, opacity: pick === null ? 0.45 : 1 }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('postRpe.submitCta')}</Text>
          </PressScale>
        )}
        <Text testID="post-rpe-footer" style={{ marginTop: 16, fontSize: 12, color: dark.ink3, textAlign: 'center', lineHeight: 18 }}>
          {t('postRpe.footer')}
        </Text>
      </View>
    </View>
  );
}
