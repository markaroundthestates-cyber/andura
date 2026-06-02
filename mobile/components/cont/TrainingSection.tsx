// ══ SETTINGS PROFILE — Training section (RN port) ═══════════════════════
// RN twin of src/.../settingsProfile/TrainingSection.tsx. Training type +
// frequency + experience + focus (setup-once params). Same testIDs
// (profile-training-type-select, profile-frequency-select, profile-experience-
// select, profile-focus-select, profile-focus-deemph-note) + i18n + the engine
// FOCUS_PRESETS data map. <select> → SegmentedField. State in the parent.

import { View, Text } from 'react-native';
import type {
  Frequency,
  Experience,
  TrainingType,
  FocusPreset,
  OnboardingData,
} from '../../../src/react/stores/onboardingStore';
import { t } from '../../../src/i18n/index.js';
import { FOCUS_PRESETS } from '../../../src/engine/schedule/scheduleAdapter.js';
import { Kicker } from '../pulse/Kicker';
import { dark } from '../../lib/tokens';
import { Card, LabelRow, SegmentedField } from './fields';

function frequencyLabel(f: Frequency): string {
  return t('settings.profile.frequencyShort', { n: f });
}

const EXPERIENCE_LABEL_KEYS: Record<Experience, string> = {
  incepator: 'settings.profile.experienceBeginner',
  intermediar: 'settings.profile.experienceIntermediate',
  avansat: 'settings.profile.experienceAdvanced',
};

const FOCUS_OPTIONS: ReadonlyArray<{ id: FocusPreset; labelKey: string; descKey: string }> = [
  { id: 'balanced', labelKey: 'settings.profile.focusBalanced', descKey: 'settings.profile.focusBalancedDesc' },
  { id: 'v-taper', labelKey: 'settings.profile.focusVTaper', descKey: 'settings.profile.focusVTaperDesc' },
  { id: 'arms', labelKey: 'settings.profile.focusArms', descKey: 'settings.profile.focusArmsDesc' },
  { id: 'chest', labelKey: 'settings.profile.focusChest', descKey: 'settings.profile.focusChestDesc' },
  { id: 'lower', labelKey: 'settings.profile.focusLower', descKey: 'settings.profile.focusLowerDesc' },
];

function focusDeEmphasizes(preset: FocusPreset): boolean {
  return (FOCUS_PRESETS[preset]?.deEmphasize?.length ?? 0) > 0;
}

interface TrainingSectionProps {
  draft: OnboardingData;
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}

export function TrainingSection({ draft, update }: TrainingSectionProps) {
  const focus: FocusPreset = draft.focusPreset ?? 'balanced';
  return (
    <View>
      <Kicker>{t('settings.profile.sectionTraining')}</Kicker>
      <Card style={{ marginTop: 8, marginBottom: 16 }}>
        <LabelRow label={t('settings.profile.trainingType')}>
          <SegmentedField<TrainingType>
            testID="profile-training-type-select"
            value={draft.trainingType ?? 'gym'}
            onChange={(v) => update('trainingType', v)}
            options={[
              { value: 'gym', label: t('onboarding.options.trainingType.gym') },
              { value: 'aerobic', label: t('onboarding.options.trainingType.aerobic') },
              { value: 'both', label: t('onboarding.options.trainingType.both') },
            ]}
          />
        </LabelRow>
        <LabelRow label={t('settings.profile.frequency')}>
          <SegmentedField<Frequency>
            testID="profile-frequency-select"
            value={draft.frequency ?? ''}
            onChange={(v) => update('frequency', v)}
            options={(['2', '3', '4', '5'] as Frequency[]).map((f) => ({ value: f, label: frequencyLabel(f) }))}
          />
        </LabelRow>
        <LabelRow label={t('settings.profile.experience')}>
          <SegmentedField<Experience>
            testID="profile-experience-select"
            value={draft.experience ?? ''}
            onChange={(v) => update('experience', v)}
            options={(Object.keys(EXPERIENCE_LABEL_KEYS) as Experience[]).map((x) => ({
              value: x,
              label: t(EXPERIENCE_LABEL_KEYS[x]),
            }))}
          />
        </LabelRow>
        <LabelRow label={t('settings.profile.focusLabel')} isLast>
          <SegmentedField<FocusPreset>
            testID="profile-focus-select"
            value={focus}
            onChange={(v) => update('focusPreset', v)}
            options={FOCUS_OPTIONS.map((o) => ({ value: o.id, label: t(o.labelKey) }))}
          />
        </LabelRow>
      </Card>
      <Text style={{ fontSize: 12, color: dark.ink3, marginBottom: 4, paddingHorizontal: 4 }}>
        {t(FOCUS_OPTIONS.find((o) => o.id === focus)?.descKey ?? 'settings.profile.focusBalancedDesc')}
      </Text>
      {focusDeEmphasizes(focus) && (
        <Text testID="profile-focus-deemph-note" style={{ fontSize: 12, color: dark.ink2, marginBottom: 16, paddingHorizontal: 4 }}>
          {t('settings.profile.focusDeEmphNote')}
        </Text>
      )}
    </View>
  );
}
