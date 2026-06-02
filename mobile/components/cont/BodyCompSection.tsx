// ══ SETTINGS PROFILE — Body composition section (RN port) ═══════════════
// RN twin of src/.../settingsProfile/BodyCompSection.tsx. Talie + Gat + Sold +
// Inaltime → BF% auto + manual override + hint + footer. Same derived-prop
// contract + testIDs (profile-waist/neck/hip/height-input, profile-bf-auto,
// profile-bf-source, profile-bf-manual, profile-bf-override,
// profile-bf-range-error, profile-bf-hint). <input number> → NumberField;
// <input checkbox> → the shared Toggle (the form-control primitive).

import { View, Text } from 'react-native';
import type { OnboardingData } from '../../../src/react/stores/onboardingStore';
import { t } from '../../../src/i18n/index.js';
import { Kicker } from '../pulse/Kicker';
import { Pill } from '../pulse/Pill';
import { Toggle } from '../Toggle';
import { dark } from '../../lib/tokens';
import { Card, LabelRow, NumberField } from './fields';

interface BodyCompSectionProps {
  draft: OnboardingData;
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  waist: string;
  setWaist: (v: string) => void;
  neck: string;
  setNeck: (v: string) => void;
  hip: string;
  setHip: (v: string) => void;
  bfAuto: number | null;
  bfSource: string;
  bfManual: boolean;
  setBfManual: (v: boolean) => void;
  bfOverride: string;
  setBfOverride: (v: string) => void;
  bfNavyIncomplete: boolean;
}

export function BodyCompSection({
  draft,
  update,
  waist,
  setWaist,
  neck,
  setNeck,
  hip,
  setHip,
  bfAuto,
  bfSource,
  bfManual,
  setBfManual,
  bfOverride,
  setBfOverride,
  bfNavyIncomplete,
}: BodyCompSectionProps) {
  const bfOv = Number(bfOverride);
  const bfOutOfRange = bfManual && bfOverride.trim() !== '' && Number.isFinite(bfOv) && (bfOv < 3 || bfOv > 60);

  return (
    <View>
      <Kicker>{t('settings.profile.sectionBody')}</Kicker>
      <Card style={{ marginTop: 8, marginBottom: 4 }}>
        <LabelRow label={t('settings.profile.waist')}>
          <NumberField testID="profile-waist-input" decimal value={waist} onChangeText={setWaist} />
        </LabelRow>
        <LabelRow label={t('settings.profile.neck')}>
          <NumberField testID="profile-neck-input" decimal value={neck} onChangeText={setNeck} />
        </LabelRow>
        {draft.sex === 'f' && (
          <LabelRow label={t('settings.profile.hip')}>
            <NumberField testID="profile-hip-input" decimal value={hip} onChangeText={setHip} />
          </LabelRow>
        )}
        <LabelRow label={t('settings.profile.height')}>
          <NumberField
            testID="profile-height-input"
            decimal
            value={draft.height != null ? String(draft.height) : ''}
            onChangeText={(v) => update('height', v ? Number(v) : null)}
          />
        </LabelRow>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: dark.line,
          }}
        >
          <Text style={{ fontSize: 14, color: dark.ink }}>{t('settings.profile.bfAuto')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text testID="profile-bf-auto" className="font-display" style={{ fontSize: 18, fontWeight: '700', color: dark.ink }}>
              {bfAuto != null ? `${bfAuto}%` : '—'}
            </Text>
            <Pill color={dark.ink3}>
              <Text testID="profile-bf-source">{bfSource}</Text>
            </Pill>
          </View>
        </View>
        <LabelRow label={t('settings.profile.bfManual')} isLast>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Toggle
              checked={bfManual}
              onToggle={() => setBfManual(!bfManual)}
              ariaLabel={t('settings.profile.bfManual')}
              testId="profile-bf-manual"
            />
            <NumberField
              testID="profile-bf-override"
              decimal
              disabled={!bfManual}
              placeholder="—"
              value={bfOverride}
              onChangeText={setBfOverride}
              invalid={bfOutOfRange}
            />
          </View>
        </LabelRow>
      </Card>
      {bfOutOfRange && (
        <Text testID="profile-bf-range-error" style={{ fontSize: 12, color: dark.brick, marginBottom: 4, paddingHorizontal: 4 }}>
          {t('settings.profile.bfRangeError')}
        </Text>
      )}
      {bfNavyIncomplete && (
        <Text testID="profile-bf-hint" style={{ fontSize: 12, color: dark.ink2, marginBottom: 4, paddingHorizontal: 4 }}>
          {t('settings.profile.bfHint')}
        </Text>
      )}
      <Text style={{ fontSize: 12, color: dark.ink3, marginBottom: 16, paddingHorizontal: 4 }}>
        {t('settings.profile.bodyCompFooter')}
      </Text>
    </View>
  );
}
