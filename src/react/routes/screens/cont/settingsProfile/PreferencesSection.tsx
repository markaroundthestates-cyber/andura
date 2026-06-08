// ══ SETTINGS PROFILE — Preferences section (#81 refusals + #82 equipment) ════
// Editable-later surface for the movement-pattern refusals + equipment profile
// captured (optionally) at onboarding. Writes the same onboardingStore.data
// fields the engine already reads (refusedPatterns / equipmentProfile) via the
// parent's draft/update path — committed by SettingsProfile.handleSave's
// Object.keys(draft).forEach(setField) loop. Empty = today's behavior.

import type { JSX } from 'react';
import type { OnboardingData } from '../../../../stores/onboardingStore';
import { t } from '../../../../../i18n/index.js';
import { Kicker } from '../../../../components/pulse/Kicker';
import { PreferencesPickers } from '../../../../components/PreferencesPickers';

interface PreferencesSectionProps {
  draft: OnboardingData;
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}

export function PreferencesSection({ draft, update }: PreferencesSectionProps): JSX.Element {
  return (
    <>
      <Kicker>{t('settings.profile.sectionPreferences')}</Kicker>
      <div className="pulse-card pulse-card-tight p-4 mb-4 mt-2">
        <PreferencesPickers
          refusedPatterns={draft.refusedPatterns ?? []}
          equipmentProfile={draft.equipmentProfile ?? []}
          onRefusedChange={(v) => update('refusedPatterns', v)}
          onEquipmentChange={(v) => update('equipmentProfile', v)}
        />
      </div>
    </>
  );
}
