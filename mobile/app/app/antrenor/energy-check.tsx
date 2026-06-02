// ══ ENERGY CHECK (RN port, route '/app/antrenor/energy-check') ════════════
// RN twin of src/react/routes/screens/antrenor/EnergyCheck.tsx. 5-option energy
// self-report + optional time-budget chips. ALL logic kept 1:1: saveReadiness
// persists the engine readiness, the time-budget store wiring, the plus/minus
// routing. Same testIDs (energy-check, energy-check-back, energy-time-budget,
// time-chip-N, time-chip-nolimit, energy-btn data via data-energy-level) + i18n.
//
// Web→RN routing state: the web carried { energyLevel, intensityMod } via
// react-router navigate state. expo-router has no opaque state object, so these
// flow as URL params (router.push({ pathname, params })). EnergyCause /
// WorkoutPreview read them via useLocalSearchParams (same field names).

import { ScrollView, View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { gotoPath, goBack } from '../../../lib/nav';
import { SubHeader } from '../../../components/SubHeader';
import { PulseCard } from '../../../components/pulse/PulseCard';
import { saveReadiness } from '../../../../src/engine/readiness.js';
import { useWorkoutStore } from '../../../../src/react/stores/workoutStore';
import { dark, varColor, withAlpha } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

export type EnergyLevel = 'excelent' | 'bine' | 'normal' | 'slabit' | 'obosit';
export type IntensityMod = 'plus' | 'normal' | 'minus';

interface EnergyOption {
  level: EnergyLevel;
  color: string;
  labelKey: string;
  hintKey: string;
  intensity: IntensityMod;
  readiness: 1 | 2 | 3 | 4 | 5;
}

const TIME_BUDGET_CHOICES = [30, 45, 60, 90] as const;

const ENERGY_OPTIONS: readonly EnergyOption[] = [
  { level: 'excelent', color: 'var(--volt)', labelKey: 'energyCheck.levels.excellent', hintKey: 'energyCheck.levels.excellentHint', intensity: 'plus', readiness: 5 },
  { level: 'bine', color: 'var(--aqua)', labelKey: 'energyCheck.levels.good', hintKey: 'energyCheck.levels.goodHint', intensity: 'normal', readiness: 4 },
  { level: 'normal', color: 'var(--gold)', labelKey: 'energyCheck.levels.normal', hintKey: 'energyCheck.levels.normalHint', intensity: 'normal', readiness: 3 },
  { level: 'slabit', color: 'var(--ember)', labelKey: 'energyCheck.levels.weak', hintKey: 'energyCheck.levels.weakHint', intensity: 'minus', readiness: 2 },
  { level: 'obosit', color: 'var(--ember-red)', labelKey: 'energyCheck.levels.tired', hintKey: 'energyCheck.levels.tiredHint', intensity: 'minus', readiness: 1 },
];

export default function EnergyCheck(): React.JSX.Element {
  const sessionTimeBudgetMin = useWorkoutStore((s) => s.sessionTimeBudgetMin);
  const setSessionTimeBudgetMin = useWorkoutStore((s) => s.setSessionTimeBudgetMin);

  function handleSelect(option: EnergyOption): void {
    saveReadiness(option.readiness);
    const params = { energyLevel: option.level, intensityMod: option.intensity };
    if (option.intensity === 'minus') {
      router.push({ pathname: gotoPath('energy-cause') as never, params });
    } else {
      router.push({ pathname: gotoPath('workout-preview') as never, params });
    }
  }

  return (
    <View className="bg-paper" style={{ flex: 1 }} testID="energy-check">
      <SubHeader
        title={t('energyCheck.subHeaderTitle')}
        onBack={goBack}
        testIdBack="energy-check-back"
      />
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="font-display" style={{ fontSize: 22, fontWeight: '700', color: dark.ink, marginBottom: 8 }}>
          {t('energyCheck.title')}
        </Text>
        <Text style={{ fontSize: 16, color: dark.ink2, marginBottom: 24 }}>{t('energyCheck.subtitle')}</Text>

        {/* Optional pre-session time budget. */}
        <View testID="energy-time-budget" style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, color: dark.ink3, marginBottom: 8 }}>
            {t('energyCheck.timeBudget.label')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TIME_BUDGET_CHOICES.map((min) => {
              const selected = sessionTimeBudgetMin === min;
              return (
                <Pressable
                  key={min}
                  testID={`time-chip-${min}`}
                  accessibilityState={{ selected }}
                  onPress={() => setSessionTimeBudgetMin(selected ? null : min)}
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: selected ? varColor('--volt') : dark.lineStrong,
                    backgroundColor: selected ? withAlpha(varColor('--volt'), 0.12) : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: selected ? varColor('--volt') : dark.ink2 }}>
                    {t('energyCheck.timeBudget.minutes', { n: min })}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              testID="time-chip-nolimit"
              accessibilityState={{ selected: sessionTimeBudgetMin === null }}
              onPress={() => setSessionTimeBudgetMin(null)}
              style={{
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: sessionTimeBudgetMin === null ? varColor('--volt') : dark.lineStrong,
                backgroundColor: sessionTimeBudgetMin === null ? withAlpha(varColor('--volt'), 0.12) : 'transparent',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: sessionTimeBudgetMin === null ? varColor('--volt') : dark.ink2 }}>
                {t('energyCheck.timeBudget.noLimit')}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          {ENERGY_OPTIONS.map((opt) => {
            const dotColor = varColor(opt.color);
            return (
              <Pressable key={opt.level} onPress={() => handleSelect(opt)}>
                <PulseCard style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 }}>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: dotColor,
                      shadowColor: dotColor,
                      shadowOpacity: 0.9,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 0 },
                    }}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text className="font-display" style={{ fontSize: 16, fontWeight: '600', color: dark.ink }}>
                      {t(opt.labelKey)}
                    </Text>
                    <Text style={{ fontSize: 14, color: dark.ink2 }}>{t(opt.hintKey)}</Text>
                  </View>
                  <ChevronRight size={18} color={dark.ink3} />
                </PulseCard>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
