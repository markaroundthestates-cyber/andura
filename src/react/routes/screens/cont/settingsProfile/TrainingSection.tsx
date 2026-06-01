// ══ SETTINGS PROFILE — Training section ═════════════════════════════════
// Presentational extraction from SettingsProfile.tsx (hygiene split — zero
// behavior change). Training type + frequency + experience (setup-once params).
// All state stays in the parent; passed as props. DOM byte-identical.

import type { JSX } from 'react';
import type { Frequency, Experience, TrainingType, OnboardingData } from '../../../../stores/onboardingStore';
import { t } from '../../../../../i18n/index.js';
import { Kicker } from '../../../../components/pulse/Kicker';
import { SelectRow } from './rows';

// Frequency labels resolved via t() per-locale (e.g. "3x/sapt" vs "3x/week").
function frequencyLabel(f: Frequency): string {
  return t('settings.profile.frequencyShort', { n: f });
}

const EXPERIENCE_LABEL_KEYS: Record<Experience, string> = {
  incepator: 'settings.profile.experienceBeginner',
  intermediar: 'settings.profile.experienceIntermediate',
  avansat: 'settings.profile.experienceAdvanced',
};

interface TrainingSectionProps {
  draft: OnboardingData;
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}

export function TrainingSection({ draft, update }: TrainingSectionProps): JSX.Element {
  return (
    <>
      {/* §obiectiv-relocate 2026-05-28 Daniel verbatim "muta aia cu Obiectiv
          de la Coach la progres". Obiectiv (goal pick) relocated la Progres >
          ObiectivGoalCard. Frecventa + Experienta raman aici — setup-once
          params, NU progress-tracking goal (clear separation). */}
      <Kicker>{t('settings.profile.sectionTraining')}</Kicker>
      <div className="pulse-card pulse-card-tight overflow-hidden mb-4 mt-2">
        {/* Training type toggle (Daniel spec 2026-05-30) — change gym/aerobic/
            both later. Reuses the onboarding option labels. Skip-auth safe:
            writes onboardingStore.data (local, per-UID), same path as the rest
            of this form. */}
        <SelectRow label={t('settings.profile.trainingType')} htmlFor="profile-training-type-select">
          <select
            id="profile-training-type-select"
            value={draft.trainingType ?? 'gym'}
            onChange={(e) => update('trainingType', e.target.value as TrainingType)}
            data-testid="profile-training-type-select"
            className="pulse-field px-2.5 py-1.5 rounded-xl text-sm"
          >
            <option value="gym">{t('onboarding.options.trainingType.gym')}</option>
            <option value="aerobic">{t('onboarding.options.trainingType.aerobic')}</option>
            <option value="both">{t('onboarding.options.trainingType.both')}</option>
          </select>
        </SelectRow>
        <SelectRow label={t('settings.profile.frequency')} htmlFor="profile-frequency-select">
          <select
            id="profile-frequency-select"
            value={draft.frequency ?? ''}
            onChange={(e) => update('frequency', (e.target.value || null) as Frequency | null)}
            data-testid="profile-frequency-select"
            className="pulse-field px-2.5 py-1.5 rounded-xl text-sm"
          >
            <option value="">—</option>
            {(['2', '3', '4', '5'] as Frequency[]).map((f) => (
              <option key={f} value={f}>{frequencyLabel(f)}</option>
            ))}
          </select>
        </SelectRow>
        <SelectRow label={t('settings.profile.experience')} htmlFor="profile-experience-select" isLast>
          <select
            id="profile-experience-select"
            value={draft.experience ?? ''}
            onChange={(e) => update('experience', (e.target.value || null) as Experience | null)}
            data-testid="profile-experience-select"
            className="pulse-field px-2.5 py-1.5 rounded-xl text-sm"
          >
            <option value="">—</option>
            {(Object.keys(EXPERIENCE_LABEL_KEYS) as Experience[]).map((x) => (
              <option key={x} value={x}>{t(EXPERIENCE_LABEL_KEYS[x])}</option>
            ))}
          </select>
        </SelectRow>
      </div>
    </>
  );
}
