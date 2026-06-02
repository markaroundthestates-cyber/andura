// ══ ENERGY CAUSE (RN port, route '/app/antrenor/energy-cause') ════════════
// RN twin of src/react/routes/screens/antrenor/EnergyCause.tsx. Cause picker
// (6 granular options) + mandatory Skip (anti-force-typing D-LEGACY-010). Same
// testIDs (energy-cause, energy-cause-back, energy-cause-skip, data-cause) +
// i18n. The { energyLevel, intensityMod } context arrives as URL params (from
// EnergyCheck) and is forwarded to WorkoutPreview along with the picked cause.

import { ScrollView, View, Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Moon,
  Utensils,
  Wind,
  Dumbbell,
  Thermometer,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react-native';
import { gotoPath, goBack } from '../../../lib/nav';
import { SubHeader } from '../../../components/SubHeader';
import { PulseCard } from '../../../components/pulse/PulseCard';
import { dark } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

interface CauseOption {
  labelKey: string;
  cause: string;
  Icon: LucideIcon;
}

const CAUSE_OPTIONS: readonly CauseOption[] = [
  { labelKey: 'energyCause.causes.sleep', cause: 'Dormit putin', Icon: Moon },
  { labelKey: 'energyCause.causes.food', cause: 'Mancat putin', Icon: Utensils },
  { labelKey: 'energyCause.causes.stress', cause: 'Stres mental', Icon: Wind },
  { labelKey: 'energyCause.causes.training', cause: 'Antrenament greu ieri', Icon: Dumbbell },
  { labelKey: 'energyCause.causes.illness', cause: 'Boala sau racit', Icon: Thermometer },
  { labelKey: 'energyCause.causes.other', cause: 'Altceva', Icon: MoreHorizontal },
];

export default function EnergyCause(): React.JSX.Element {
  const { energyLevel, intensityMod } = useLocalSearchParams<{
    energyLevel?: string;
    intensityMod?: string;
  }>();

  function handleSelect(cause: string): void {
    router.push({
      pathname: gotoPath('workout-preview') as never,
      params: { energyLevel, intensityMod, cause },
    });
  }

  function handleSkip(): void {
    router.push({
      pathname: gotoPath('workout-preview') as never,
      params: { energyLevel, intensityMod },
    });
  }

  return (
    <View className="bg-paper" style={{ flex: 1 }} testID="energy-cause">
      <SubHeader
        title={t('energyCause.subHeaderTitle')}
        onBack={goBack}
        testIdBack="energy-cause-back"
      />
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={{ fontSize: 16, color: dark.ink2, marginBottom: 24 }}>{t('energyCause.body')}</Text>
        <View style={{ gap: 10 }}>
          {CAUSE_OPTIONS.map(({ labelKey, cause, Icon }) => (
            <Pressable key={cause} onPress={() => handleSelect(cause)}>
              <PulseCard style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
                <Icon size={16} color={dark.brick} />
                <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink }}>{t(labelKey)}</Text>
              </PulseCard>
            </Pressable>
          ))}
        </View>
        <Pressable testID="energy-cause-skip" onPress={handleSkip} style={{ marginTop: 24, paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: dark.ink2 }}>{t('energyCause.skipCta')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
