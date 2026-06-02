// ══ ONBOARDING — summary review step (RN port) ════════════════════════════
// Twin of src/react/routes/screens/onboarding/Step8Summary.tsx. Pure
// presentational — reads the finalized data passed by the parent wizard which
// still owns every hook/store call/handler. Each row resolves via t() at render
// (live locale). Markup -> View/Text + lucide-react-native icons; same testID
// (onb-summary) + the two-column icon+label / value hierarchy.

import type { ComponentType } from 'react';
import { View, Text } from 'react-native';
import {
  User,
  Calendar,
  Target,
  Activity,
  Award,
  Scale,
  Ruler,
  HeartPulse,
  type LucideProps,
} from 'lucide-react-native';
import type { OnboardingData } from '../../../src/react/stores/onboardingStore';
import { goalLabel } from './shared';
import { dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

type IconType = ComponentType<LucideProps>;

export function Step8Summary({ data }: { data: OnboardingData }): React.JSX.Element {
  const empty = t('onboarding.confirm.empty');
  const sexValue =
    data.sex === 'm' ? t('onboarding.confirm.values.sexM')
    : data.sex === 'f' ? t('onboarding.confirm.values.sexF')
    : empty;
  const trainingTypeValue =
    (data.trainingType ?? 'gym') === 'aerobic' ? t('onboarding.confirm.values.trainingTypeAerobic')
    : (data.trainingType ?? 'gym') === 'both' ? t('onboarding.confirm.values.trainingTypeBoth')
    : t('onboarding.confirm.values.trainingTypeGym');
  const goalValue = data.goal ? goalLabel(data.goal) : empty;
  const frequencyValue = data.frequency
    ? t('onboarding.confirm.values.frequencyShort', { n: data.frequency })
    : empty;
  const experienceValue = data.experience
    ? t(`onboarding.confirm.values.experience${data.experience.charAt(0).toUpperCase() + data.experience.slice(1)}`)
    : empty;
  const weightValue = data.weight
    ? t('onboarding.confirm.values.weightSuffix', { kg: data.weight })
    : empty;
  const heightValue = data.height
    ? t('onboarding.confirm.values.heightSuffix', { cm: data.height })
    : empty;

  const rows: Array<{ Icon: IconType; label: string; value: string | number }> = [
    { Icon: Calendar, label: t('onboarding.confirm.fields.age'), value: data.age ?? empty },
    { Icon: User, label: t('onboarding.confirm.fields.sex'), value: sexValue },
    { Icon: HeartPulse, label: t('onboarding.confirm.fields.trainingType'), value: trainingTypeValue },
    { Icon: Target, label: t('onboarding.confirm.fields.goal'), value: goalValue },
    { Icon: Activity, label: t('onboarding.confirm.fields.frequency'), value: frequencyValue },
    { Icon: Award, label: t('onboarding.confirm.fields.experience'), value: experienceValue },
    { Icon: Scale, label: t('onboarding.confirm.fields.weight'), value: weightValue },
    { Icon: Ruler, label: t('onboarding.confirm.fields.height'), value: heightValue },
  ];

  return (
    <View>
      <Text className="font-bold text-ink" style={{ fontSize: 24, marginBottom: 8 }}>{t('onboarding.steps.9.title')}</Text>
      <Text className="text-ink2" style={{ fontSize: 14, marginBottom: 24, lineHeight: 20 }}>{t('onboarding.steps.9.desc')}</Text>
      <View
        testID="onb-summary"
        className="bg-paper-2 border border-line"
        style={{ borderRadius: 22, overflow: 'hidden' }}
      >
        {rows.map(({ Icon, label, value }, idx) => (
          <View
            key={label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: idx < rows.length - 1 ? 1 : 0,
              borderBottomColor: dark.line,
            }}
          >
            <Icon size={16} color={dark.brick} />
            <Text className="text-ink2" style={{ flex: 1, fontSize: 14 }}>{label}</Text>
            <Text className="font-medium text-ink" style={{ fontSize: 14 }}>{String(value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
