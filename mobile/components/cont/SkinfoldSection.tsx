// ══ SETTINGS PROFILE — Skinfold (pliuri cutanate) section (RN port) ═════
// RN twin of src/.../settingsProfile/SkinfoldSection.tsx. Advanced/optional
// caliper toggle + per-sex inputs + hint. Same testIDs (profile-skinfold-
// toggle, -panel, -chest/-abdomen/-thigh/-triceps/-suprailiac) + i18n. State
// in the parent. <input checkbox> → shared Toggle; <input number> → NumberField.

import { View, Text } from 'react-native';
import type { OnboardingData } from '../../../src/react/stores/onboardingStore';
import { t } from '../../../src/i18n/index.js';
import { Toggle } from '../Toggle';
import { dark } from '../../lib/tokens';
import { Card, LabelRow, NumberField } from './fields';

interface SkinfoldSectionProps {
  draft: OnboardingData;
  skinfoldOn: boolean;
  setSkinfoldOn: (v: boolean) => void;
  sfChest: string;
  setSfChest: (v: string) => void;
  sfAbdomen: string;
  setSfAbdomen: (v: string) => void;
  sfThigh: string;
  setSfThigh: (v: string) => void;
  sfTriceps: string;
  setSfTriceps: (v: string) => void;
  sfSuprailiac: string;
  setSfSuprailiac: (v: string) => void;
}

export function SkinfoldSection({
  draft,
  skinfoldOn,
  setSkinfoldOn,
  sfChest,
  setSfChest,
  sfAbdomen,
  setSfAbdomen,
  sfThigh,
  setSfThigh,
  sfTriceps,
  setSfTriceps,
  sfSuprailiac,
  setSfSuprailiac,
}: SkinfoldSectionProps) {
  return (
    <View>
      <Card>
        <LabelRow label={t('settings.profile.skinfoldToggle')} isLast>
          <Toggle
            checked={skinfoldOn}
            onToggle={() => setSkinfoldOn(!skinfoldOn)}
            ariaLabel={t('settings.profile.skinfoldToggle')}
            testId="profile-skinfold-toggle"
          />
        </LabelRow>
      </Card>
      {skinfoldOn && (
        <Card style={{ marginTop: 4, marginBottom: 4 }}>
          <View testID="profile-skinfold-panel">
            {draft.sex === 'f' ? (
              <>
                <LabelRow label={t('settings.profile.skinfoldTriceps')}>
                  <NumberField testID="profile-skinfold-triceps" decimal value={sfTriceps} onChangeText={setSfTriceps} />
                </LabelRow>
                <LabelRow label={t('settings.profile.skinfoldSuprailiac')}>
                  <NumberField testID="profile-skinfold-suprailiac" decimal value={sfSuprailiac} onChangeText={setSfSuprailiac} />
                </LabelRow>
              </>
            ) : (
              <>
                <LabelRow label={t('settings.profile.skinfoldChest')}>
                  <NumberField testID="profile-skinfold-chest" decimal value={sfChest} onChangeText={setSfChest} />
                </LabelRow>
                <LabelRow label={t('settings.profile.skinfoldAbdomen')}>
                  <NumberField testID="profile-skinfold-abdomen" decimal value={sfAbdomen} onChangeText={setSfAbdomen} />
                </LabelRow>
              </>
            )}
            <LabelRow label={t('settings.profile.skinfoldThigh')} isLast>
              <NumberField testID="profile-skinfold-thigh" decimal value={sfThigh} onChangeText={setSfThigh} />
            </LabelRow>
          </View>
        </Card>
      )}
      <Text style={{ fontSize: 12, color: dark.ink3, marginBottom: 16, marginTop: 4, paddingHorizontal: 4 }}>
        {t('settings.profile.skinfoldHint')}
      </Text>
    </View>
  );
}
