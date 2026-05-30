// ══ SETTINGS PROFILE — Skinfold (pliuri cutanate) section ═══════════════
// Presentational extraction from SettingsProfile.tsx (hygiene split — zero
// behavior change). Advanced/optional caliper toggle + per-sex inputs + hint.
// All state stays in the parent; passed as props. DOM byte-identical.

import type { JSX } from 'react';
import type { OnboardingData } from '../../../../stores/onboardingStore';
import { t } from '../../../../../i18n/index.js';
import { LabelRow, SelectRow } from './rows';

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
}: SkinfoldSectionProps): JSX.Element {
  return (
    <>
      {/* §progress-v2 — Pliuri cutanate (avansat, optional). Secundar/collapsed
          ca sa NU fie in fata user-ului obisnuit (Gigel n-are caliper): doar un
          toggle; inputurile per-sex apar cand e bifat. Cand cele 3 site-uri sunt
          valide, BF% foloseste J-P (mai acurat) peste US Navy. */}
      <SelectRow
        label={t('settings.profile.skinfoldToggle')}
        htmlFor="profile-skinfold-toggle"
        isLast
      >
        <input
          id="profile-skinfold-toggle"
          type="checkbox"
          checked={skinfoldOn}
          onChange={(e) => setSkinfoldOn(e.target.checked)}
          data-testid="profile-skinfold-toggle"
          className="w-[18px] h-[18px] accent-brick"
        />
      </SelectRow>
      {skinfoldOn && (
        <div
          className="pulse-card pulse-card-tight overflow-hidden mb-1 mt-1"
          data-testid="profile-skinfold-panel"
        >
          {draft.sex === 'f' ? (
            <>
              <LabelRow label={t('settings.profile.skinfoldTriceps')}>
                <input
                  type="number"
                  min={2}
                  max={60}
                  step={0.5}
                  inputMode="decimal"
                  autoComplete="off"
                  value={sfTriceps}
                  onChange={(e) => setSfTriceps(e.target.value)}
                  data-testid="profile-skinfold-triceps"
                  className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
                />
              </LabelRow>
              <LabelRow label={t('settings.profile.skinfoldSuprailiac')}>
                <input
                  type="number"
                  min={2}
                  max={60}
                  step={0.5}
                  inputMode="decimal"
                  autoComplete="off"
                  value={sfSuprailiac}
                  onChange={(e) => setSfSuprailiac(e.target.value)}
                  data-testid="profile-skinfold-suprailiac"
                  className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
                />
              </LabelRow>
            </>
          ) : (
            <>
              <LabelRow label={t('settings.profile.skinfoldChest')}>
                <input
                  type="number"
                  min={2}
                  max={60}
                  step={0.5}
                  inputMode="decimal"
                  autoComplete="off"
                  value={sfChest}
                  onChange={(e) => setSfChest(e.target.value)}
                  data-testid="profile-skinfold-chest"
                  className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
                />
              </LabelRow>
              <LabelRow label={t('settings.profile.skinfoldAbdomen')}>
                <input
                  type="number"
                  min={2}
                  max={60}
                  step={0.5}
                  inputMode="decimal"
                  autoComplete="off"
                  value={sfAbdomen}
                  onChange={(e) => setSfAbdomen(e.target.value)}
                  data-testid="profile-skinfold-abdomen"
                  className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
                />
              </LabelRow>
            </>
          )}
          <LabelRow label={t('settings.profile.skinfoldThigh')} isLast>
            <input
              type="number"
              min={2}
              max={60}
              step={0.5}
              inputMode="decimal"
              autoComplete="off"
              value={sfThigh}
              onChange={(e) => setSfThigh(e.target.value)}
              data-testid="profile-skinfold-thigh"
              className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
            />
          </LabelRow>
        </div>
      )}
      <p className="text-xs text-ink3 mb-4 px-1 leading-snug">
        {t('settings.profile.skinfoldHint')}
      </p>
    </>
  );
}
