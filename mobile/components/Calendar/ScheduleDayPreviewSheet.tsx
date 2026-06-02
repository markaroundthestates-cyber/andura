// ══ SCHEDULE DAY PREVIEW SHEET (RN port, W3c — replaces the W3a stub) ══════
// RN twin of src/react/components/Calendar/ScheduleDayPreviewSheet.tsx. Tapping
// a TRAINING day on the weekly schedule (Calendar7Day) when NOT in edit mode
// opens this read-only bottom sheet (RN Modal): a preview of the exercises the
// coach would propose for that day, from the SAME engine pipeline the real
// Workout/WorkoutPreview screen uses (getWorkoutForDay), so it reflects current
// recovery/readiness/progression.
//
// States (honest — never fabricate a session):
//   - REST day             → rest copy (engine not invoked).
//   - TRAINING + exercises → proposed exercise list (name + sets/reps/target).
//   - TRAINING + null/empty → explanatory empty state.
//
// Read-only: NO logging, NO editing (the WorkoutPreview "Confirma, incep" CTA is
// deliberately absent). Recomputes from the live engine each open (re-runs on
// dayIdx change). ALL engine/title-resolution logic kept 1:1 from the web. The
// web's DOM focus-management + Escape close map to the RN Modal's
// onRequestClose. Same testIDs (schedule-day-preview-backdrop / -sheet /
// -title / -rest / -loading / -empty / -list / -exercise / -media-N /
// -live-note / -close).

import { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { Layers, Clock } from 'lucide-react-native';
import { getWorkoutForDay, resolveSessionTitle } from '../../../src/react/lib/engineWrappers';
import type { PlannedWorkoutOutput, PlannedExercise } from '../../../src/react/lib/engineWrappers';
import { ENGINE_WORKOUT_TITLE_FALLBACK } from '../../../src/react/lib/scheduleAdapterAggregate';
import type { DayKind } from '../../../src/react/stores/scheduleStore';
import { ExerciseMedia } from '../ExerciseMedia';
import { Kicker } from '../pulse/Kicker';
import { accent, dark, radius, surface, withAlpha } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface ScheduleDayPreviewSheetProps {
  /** Open boolean — parent (Calendar7Day) owns it. */
  open: boolean;
  /** Monday-first weekday index 0..6 of the tapped day. null when closed. */
  dayIdx: number | null;
  /** Live schedule kind for that day — drives rest vs training routing. */
  dayKind: DayKind;
  /** Localized day label (e.g. "Mon" / "L") for the sheet title. */
  dayLabel: string;
  onClose: () => void;
}

// Same bodyweight-aware detail copy as WorkoutPreview (identical i18n keys).
function exerciseDetail(ex: PlannedExercise): string {
  if (ex.isBodyweight) {
    return ex.targetKg > 0
      ? t('workout.preview.exerciseDetailBodyweightAdded', {
          sets: ex.sets,
          kg: ex.targetKg,
          reps: ex.targetReps,
        })
      : t('workout.preview.exerciseDetailBodyweight', {
          sets: ex.sets,
          reps: ex.targetReps,
        });
  }
  return t('workout.preview.exerciseDetail', {
    sets: ex.sets,
    kg: ex.targetKg,
    reps: ex.targetReps,
  });
}

// Resolve the localized session title the same way WorkoutPreview does.
function resolveTitle(workout: PlannedWorkoutOutput): string {
  const raw = workout.workoutTitle;
  const engineFallbackSentinel = t('coachToday.engineFallbackTitle');
  const isFallback =
    raw === ENGINE_WORKOUT_TITLE_FALLBACK ||
    raw === 'Antrenament azi' ||
    raw === engineFallbackSentinel;
  return raw && !isFallback ? raw : resolveSessionTitle(workout.sessionType);
}

export function ScheduleDayPreviewSheet({
  open,
  dayIdx,
  dayKind,
  dayLabel,
  onClose,
}: ScheduleDayPreviewSheetProps): React.JSX.Element | null {
  const [workout, setWorkout] = useState<PlannedWorkoutOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Recompute from the live engine each open + whenever the tapped day changes.
  // Rest days skip the engine entirely. Training days fetch the proposed session.
  useEffect(() => {
    if (!open || dayIdx === null) return;
    if (dayKind === 'rest') {
      setWorkout(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setWorkout(null);
    getWorkoutForDay(dayIdx)
      .then((w) => {
        if (!cancelled) {
          setWorkout(w);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWorkout(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, dayIdx, dayKind]);

  if (!open || dayIdx === null) return null;

  const isRest = dayKind === 'rest';
  const kindLabel = isRest
    ? t('calendar.dayPreview.restKind')
    : t('calendar.dayPreview.trainingKind');
  const exercises = workout?.exercises ?? [];
  const hasSession = !isRest && workout !== null && exercises.length > 0;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        testID="schedule-day-preview-backdrop"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
      >
        <Pressable
          testID="schedule-day-preview-sheet"
          accessibilityViewIsModal
          accessibilityLabel={t('calendar.dayPreview.ariaLabel')}
          onPress={() => {}}
          style={{
            backgroundColor: dark.paper,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 20,
            maxHeight: '80%',
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Kicker color={accent.volt}>
              {t('calendar.dayPreview.title', { day: dayLabel, kind: kindLabel })}
            </Kicker>

            {hasSession && (
              <Text
                testID="schedule-day-preview-title"
                className="font-display"
                style={{ fontSize: 20, fontWeight: '700', color: dark.ink, marginTop: 4 }}
              >
                {resolveTitle(workout)}
              </Text>
            )}

            {/* Meta row (count + duration) — only for a real proposed session. */}
            {hasSession && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8, marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Layers size={14} color={dark.ink2} />
                  <Text style={{ fontSize: 14, color: dark.ink2 }}>
                    {t('calendar.dayPreview.metaCount', { n: exercises.length })}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color={dark.ink2} />
                  <Text style={{ fontSize: 14, color: dark.ink2 }}>
                    {t('calendar.dayPreview.metaDuration', { min: workout.estimatedDuration })}
                  </Text>
                </View>
              </View>
            )}

            {/* REST state. */}
            {isRest && (
              <Text testID="schedule-day-preview-rest" style={{ fontSize: 14, lineHeight: 21, color: dark.ink2, marginTop: 8 }}>
                {t('calendar.dayPreview.restBody')}
              </Text>
            )}

            {/* LOADING state. */}
            {!isRest && loading && (
              <Text
                testID="schedule-day-preview-loading"
                accessibilityLiveRegion="polite"
                style={{ fontSize: 14, fontStyle: 'italic', lineHeight: 21, color: dark.ink3, marginTop: 8 }}
              >
                {t('workout.preview.loading')}
              </Text>
            )}

            {/* EMPTY state — training day but engine can't propose a session. */}
            {!isRest && !loading && !hasSession && (
              <Text testID="schedule-day-preview-empty" style={{ fontSize: 14, lineHeight: 21, color: dark.ink2, marginTop: 8 }}>
                {t('calendar.dayPreview.emptyBody')}
              </Text>
            )}

            {/* PROPOSED exercise list — read-only. */}
            {hasSession && (
              <>
                <View style={{ marginTop: 12, marginBottom: 8 }}>
                  <Kicker>{t('calendar.dayPreview.exercisesHeading')}</Kicker>
                </View>
                <View
                  testID="schedule-day-preview-list"
                  style={{
                    backgroundColor: surface.base,
                    borderWidth: 1,
                    borderColor: dark.line,
                    borderRadius: radius.DEFAULT,
                    overflow: 'hidden',
                    marginBottom: 16,
                  }}
                >
                  {exercises.map((ex, i) => (
                    <View
                      key={ex.id}
                      testID="schedule-day-preview-exercise"
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
                        <ExerciseMedia
                          engineName={ex.engineName ?? ex.name}
                          variant="thumbnail"
                          testId={`schedule-day-preview-media-${i}`}
                        />
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
                            backgroundColor: withAlpha(dark.brick, 0.16),
                          }}
                        >
                          <Text className="font-mono" style={{ fontSize: 10, fontWeight: '700', color: dark.brick }}>
                            {i + 1}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '600', color: dark.ink }}>
                          {ex.name}
                        </Text>
                        {ex.sub && (
                          <Text style={{ fontSize: 12, color: dark.ink3, marginTop: 2 }}>{ex.sub}</Text>
                        )}
                        <Text className="font-mono" style={{ fontSize: 12, color: dark.ink3, marginTop: 2 }}>
                          {exerciseDetail(ex)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
                {/* Honest live-recompute note. */}
                <Text
                  testID="schedule-day-preview-live-note"
                  style={{ fontSize: 14, fontStyle: 'italic', lineHeight: 21, color: dark.ink3, marginBottom: 12 }}
                >
                  {t('calendar.dayPreview.liveNote')}
                </Text>
              </>
            )}

            <Pressable
              testID="schedule-day-preview-close"
              accessibilityRole="button"
              onPress={onClose}
              style={{ marginTop: 4, paddingVertical: 10, minHeight: 44, justifyContent: 'center' }}
            >
              <Text style={{ textAlign: 'center', fontSize: 14, color: dark.ink2 }}>
                {t('calendar.dayPreview.closeCta')}
              </Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
