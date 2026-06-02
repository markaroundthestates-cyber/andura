// ══ SCHEDULE OVERRIDE (RN port, route '/app/antrenor/schedule-override') ══
// RN twin of src/react/routes/screens/antrenor/ScheduleOverride.tsx. Ephemeral
// today-only override picker (D-LEGACY-076 — next session resets to the preset).
// NO DEAD BUTTONS: every option drives a real WorkoutPreview adaptation —
// easier → intensityMod 'minus', harder → 'plus', different-muscle → the engine
// picks the most-recovered alternative cluster (getTodayWorkout differentMuscle).
// Web passed react-router location.state → RN passes expo-router params
// (overrideKind + intensityMod) that WorkoutPreview already parses. ALL routing
// logic kept 1:1. testIDs kept (schedule-override / -back + data-override-kind →
// per-option testID).

import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { gotoPath } from '../../../lib/nav';
import { SubHeader } from '../../../components/SubHeader';
import { surface, dark, radius } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

export type OverrideKind = 'easier' | 'harder' | 'different-muscle';
type IntensityMod = 'plus' | 'normal' | 'minus';

interface OverrideOption {
  kind: OverrideKind;
  labelKey: string;
  descriptionKey: string;
}

const OVERRIDE_OPTIONS: readonly OverrideOption[] = [
  { kind: 'easier', labelKey: 'scheduleOverride.options.easierLabel', descriptionKey: 'scheduleOverride.options.easierDescription' },
  { kind: 'harder', labelKey: 'scheduleOverride.options.harderLabel', descriptionKey: 'scheduleOverride.options.harderDescription' },
  { kind: 'different-muscle', labelKey: 'scheduleOverride.options.differentMuscleLabel', descriptionKey: 'scheduleOverride.options.differentMuscleDescription' },
];

function intensityFor(kind: OverrideKind): IntensityMod {
  if (kind === 'easier') return 'minus';
  if (kind === 'harder') return 'plus';
  return 'normal';
}

export default function ScheduleOverride(): React.JSX.Element {
  function handleSelect(kind: OverrideKind): void {
    router.push({
      pathname: gotoPath('workout-preview'),
      params: { overrideKind: kind, intensityMod: intensityFor(kind) },
    } as never);
  }

  function handleBack(): void {
    router.back();
  }

  return (
    <View testID="schedule-override" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader title={t('scheduleOverride.subHeaderTitle')} onBack={handleBack} testIdBack="schedule-override-back" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <Text className="font-display" style={{ fontSize: 24, fontWeight: '700', color: dark.ink, marginBottom: 8 }}>
          {t('scheduleOverride.heading')}
        </Text>
        <Text style={{ fontSize: 16, color: dark.ink2, marginBottom: 24 }}>{t('scheduleOverride.body')}</Text>
        <View style={{ gap: 12 }}>
          {OVERRIDE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.kind}
              testID={`schedule-override-option-${opt.kind}`}
              accessibilityRole="button"
              onPress={() => handleSelect(opt.kind)}
              style={{
                gap: 4,
                padding: 16,
                backgroundColor: surface.base,
                borderWidth: 1,
                borderColor: dark.line,
                borderRadius: radius.DEFAULT,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: dark.ink }}>{t(opt.labelKey)}</Text>
              <Text style={{ fontSize: 14, color: dark.ink2 }}>{t(opt.descriptionKey)}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
