// ══ SET HISTORY CHIPS (RN port) — per-set progress row ════════════════════
// RN twin of src/react/components/Workout/SetHistoryChips.tsx. One chip per
// planned set: logged sets fill volt + check (kg x reps x rating preserved as
// the accessibilityLabel so the data is not lost), the current set glows
// (active), the rest are muted pending numbers. testID set-history (root) +
// per-logged-set set-history-{i} kept verbatim.

import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import type { ExerciseHistoryEntry } from '../../../src/react/stores/workoutStore';
import { accent, dark, surface } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface SetHistoryChipsProps {
  totalSets: number;
  loggedSets: readonly ExerciseHistoryEntry[];
  currentSetIdx: number;
  isBodyweight: boolean;
}

export function SetHistoryChips({
  totalSets,
  loggedSets,
  currentSetIdx,
  isBodyweight,
}: SetHistoryChipsProps): React.JSX.Element {
  return (
    <View testID="set-history" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
      {Array.from({ length: totalSets }, (_, i) => {
        const logged = loggedSets[i];
        const isDone = logged !== undefined;
        const isActive = !isDone && i === currentSetIdx;
        const detail = isDone
          ? isBodyweight
            ? (logged.addedKg ?? 0) > 0
              ? `+${logged.addedKg} ${t('common.kg')} x ${logged.reps} ${t('common.reps')} - ${logged.rating}`
              : `${t('setLog.bodyweightLabel')} x ${logged.reps} ${t('common.reps')} - ${logged.rating}`
            : `${logged.kg} ${t('common.kg')} x ${logged.reps} ${t('common.reps')} - ${logged.rating}`
          : undefined;
        const setLabel = t('workout.setLabel', { current: i + 1, total: totalSets });
        return (
          <View
            key={i}
            testID={isDone ? `set-history-${i}` : undefined}
            accessibilityLabel={detail ? `${setLabel}: ${detail}` : setLabel}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDone ? accent.volt : surface.s2,
              borderWidth: 1,
              borderColor: isActive ? accent.volt : dark.line,
              ...(isActive ? { shadowColor: accent.volt, shadowOpacity: 0.55, shadowRadius: 10, elevation: 4 } : {}),
            }}
          >
            {isDone ? (
              <Check size={14} color={dark.onAccent} strokeWidth={2.6} />
            ) : (
              <Text style={{ fontSize: 13, fontWeight: '600', color: isActive ? accent.volt : dark.ink2 }}>{i + 1}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
