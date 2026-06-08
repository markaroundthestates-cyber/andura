// ══ SETTINGS PROFILE — Training section ═════════════════════════════════
// Presentational extraction from SettingsProfile.tsx (hygiene split — zero
// behavior change). Training type + frequency + experience (setup-once params).
// All state stays in the parent; passed as props. DOM byte-identical.

import type { JSX } from 'react';
import type { Frequency, Experience, TrainingType, FocusPreset, OnboardingData } from '../../../../stores/onboardingStore';
import { t } from '../../../../../i18n/index.js';
import { FOCUS_PRESETS } from '../../../../../engine/schedule/scheduleAdapter.js';
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

// Focus selector (D-focus 2026-06-02) — plain-language LOOK labels. Order +
// labels resolved via t() (RO no-diacritics + EN). The engine FOCUS_PRESETS
// data map (no copy) drives the heads-up: a preset that de-emphasizes a region
// shows ONE calm maintenance note (no guilt, no blocker).
const FOCUS_OPTIONS: ReadonlyArray<{ id: FocusPreset; labelKey: string; descKey: string }> = [
  { id: 'balanced', labelKey: 'settings.profile.focusBalanced', descKey: 'settings.profile.focusBalancedDesc' },
  { id: 'v-taper', labelKey: 'settings.profile.focusVTaper', descKey: 'settings.profile.focusVTaperDesc' },
  { id: 'arms', labelKey: 'settings.profile.focusArms', descKey: 'settings.profile.focusArmsDesc' },
  { id: 'chest', labelKey: 'settings.profile.focusChest', descKey: 'settings.profile.focusChestDesc' },
  { id: 'lower', labelKey: 'settings.profile.focusLower', descKey: 'settings.profile.focusLowerDesc' },
  { id: 'upper', labelKey: 'settings.profile.focusUpper', descKey: 'settings.profile.focusUpperDesc' },
];

/** True when the selected preset de-emphasizes a region → show the calm note. */
function focusDeEmphasizes(preset: FocusPreset): boolean {
  return (FOCUS_PRESETS[preset]?.deEmphasize?.length ?? 0) > 0;
}

interface TrainingSectionProps {
  draft: OnboardingData;
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}

export function TrainingSection({ draft, update }: TrainingSectionProps): JSX.Element {
  const focus: FocusPreset = draft.focusPreset ?? 'balanced';
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
        <SelectRow label={t('settings.profile.experience')} htmlFor="profile-experience-select">
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
        {/* Focus selector (D-focus 2026-06-02) — the user picks an aesthetic LOOK
            (Balanced default). Engine shapes volume + split around it. Persists
            to onboardingStore.focusPreset (same draft/update path as the rest of
            this form). */}
        <SelectRow label={t('settings.profile.focusLabel')} htmlFor="profile-focus-select" isLast>
          <select
            id="profile-focus-select"
            value={focus}
            onChange={(e) => update('focusPreset', e.target.value as FocusPreset)}
            data-testid="profile-focus-select"
            className="pulse-field px-2.5 py-1.5 rounded-xl text-sm"
          >
            {FOCUS_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{t(o.labelKey)}</option>
            ))}
          </select>
        </SelectRow>
      </div>
      {/* One-line plain-language description of the picked focus. */}
      <p className="text-xs text-ink3 mb-1 px-1 leading-snug">
        {t(FOCUS_OPTIONS.find((o) => o.id === focus)?.descKey ?? 'settings.profile.focusBalancedDesc')}
      </p>
      {/* SINGLE soft, no-guilt heads-up — only when the preset de-emphasizes a
          region. A calm maintenance note, NOT a nag, NOT a blocker. */}
      {focusDeEmphasizes(focus) && (
        <p
          className="text-xs text-ink2 mb-4 px-1 leading-snug"
          data-testid="profile-focus-deemph-note"
        >
          {t('settings.profile.focusDeEmphNote')}
        </p>
      )}
    </>
  );
}
