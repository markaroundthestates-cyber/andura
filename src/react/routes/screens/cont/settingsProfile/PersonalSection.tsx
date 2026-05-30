// ══ SETTINGS PROFILE — Personal section (age/weight/sex) ════════════════
// Presentational extraction from SettingsProfile.tsx (hygiene split — zero
// behavior change). All state/handlers stay in the parent; this renders the
// "sectionPersonal" card from props + callbacks. DOM byte-identical.

import type { JSX } from 'react';
import type { Sex, OnboardingData } from '../../../../stores/onboardingStore';
import { t } from '../../../../../i18n/index.js';
import { LabelRow, SelectRow } from './rows';

interface PersonalSectionProps {
  draft: OnboardingData;
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}

export function PersonalSection({ draft, update }: PersonalSectionProps): JSX.Element {
  return (
    <>
      <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
        {t('settings.profile.sectionPersonal')}
      </p>
      <div className="pulse-card pulse-card-tight overflow-hidden mb-4">
        <LabelRow label={t('settings.profile.age')}>
          <input
            type="number"
            min={18}
            max={99}
            inputMode="numeric"
            autoComplete="off"
            value={draft.age ?? ''}
            onChange={(e) => update('age', e.target.value ? Number(e.target.value) : null)}
            data-testid="profile-age-input"
            className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
          />
        </LabelRow>
        <LabelRow label={t('settings.profile.weight')}>
          <input
            type="number"
            min={30}
            max={250}
            step={0.1}
            inputMode="decimal"
            autoComplete="off"
            value={draft.weight ?? ''}
            onChange={(e) => update('weight', e.target.value ? Number(e.target.value) : null)}
            data-testid="profile-weight-input"
            className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
          />
        </LabelRow>
        <SelectRow label={t('settings.profile.sex')} htmlFor="profile-sex-select" isLast>
          <select
            id="profile-sex-select"
            value={draft.sex ?? ''}
            onChange={(e) => update('sex', (e.target.value || null) as Sex | null)}
            data-testid="profile-sex-select"
            className="px-2.5 py-1.5 border border-lineStrong rounded-xl bg-paper text-ink text-sm"
          >
            <option value="">—</option>
            <option value="m">{t('settings.profile.sexMale')}</option>
            <option value="f">{t('settings.profile.sexFemale')}</option>
          </select>
        </SelectRow>
      </div>
    </>
  );
}
