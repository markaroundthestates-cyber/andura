// ══ SETTINGS PROFILE — Personal section (RN port) ═══════════════════════
// RN twin of src/.../settingsProfile/PersonalSection.tsx. Same props (draft +
// update), same testIDs (profile-age-input / profile-weight-input /
// profile-sex-select), same i18n. <input type=number> → NumberField; <select>
// → SegmentedField. State stays in the parent (unchanged).

import { View } from 'react-native';
import type { Sex, OnboardingData } from '../../../src/react/stores/onboardingStore';
import { t } from '../../../src/i18n/index.js';
import { Kicker } from '../pulse/Kicker';
import { Card, LabelRow, NumberField, SegmentedField } from './fields';

interface PersonalSectionProps {
  draft: OnboardingData;
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}

export function PersonalSection({ draft, update }: PersonalSectionProps) {
  return (
    <View>
      <Kicker>{t('settings.profile.sectionPersonal')}</Kicker>
      <Card style={{ marginTop: 8, marginBottom: 16 }}>
        <LabelRow label={t('settings.profile.age')}>
          <NumberField
            testID="profile-age-input"
            value={draft.age != null ? String(draft.age) : ''}
            onChangeText={(v) => update('age', v ? Number(v) : null)}
          />
        </LabelRow>
        <LabelRow label={t('settings.profile.weight')}>
          <NumberField
            testID="profile-weight-input"
            decimal
            value={draft.weight != null ? String(draft.weight) : ''}
            onChangeText={(v) => update('weight', v ? Number(v) : null)}
          />
        </LabelRow>
        <LabelRow label={t('settings.profile.sex')} isLast>
          <SegmentedField<Sex>
            testID="profile-sex-select"
            value={draft.sex ?? ''}
            onChange={(v) => update('sex', v)}
            options={[
              { value: 'm', label: t('settings.profile.sexMale') },
              { value: 'f', label: t('settings.profile.sexFemale') },
            ]}
          />
        </LabelRow>
      </Card>
    </View>
  );
}
