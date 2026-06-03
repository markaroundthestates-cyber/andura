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

import { View, Text, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { gotoPath } from '../../../lib/nav';
import { SubHeader } from '../../../components/SubHeader';
import { PressScale } from '../../../components/Press';
import { useEntrance } from '../../../lib/motion';
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

// Override option card — staggered entrance + press-scale feedback.
function OverrideRow({
  index,
  testID,
  label,
  description,
  onPress,
}: {
  index: number;
  testID: string;
  label: string;
  description: string;
  onPress: () => void;
}): React.JSX.Element {
  const entering = useEntrance(index);
  return (
    <Animated.View entering={entering}>
      <PressScale
        testID={testID}
        accessibilityRole="button"
        onPress={onPress}
        style={{
          gap: 4,
          padding: 16,
          backgroundColor: surface.base,
          borderWidth: 1,
          borderColor: dark.line,
          borderRadius: radius.DEFAULT,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '500', color: dark.ink }}>{label}</Text>
        <Text style={{ fontSize: 14, color: dark.ink2 }}>{description}</Text>
      </PressScale>
    </Animated.View>
  );
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
          {OVERRIDE_OPTIONS.map((opt, i) => (
            <OverrideRow
              key={opt.kind}
              index={i}
              testID={`schedule-override-option-${opt.kind}`}
              label={t(opt.labelKey)}
              description={t(opt.descriptionKey)}
              onPress={() => handleSelect(opt.kind)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
