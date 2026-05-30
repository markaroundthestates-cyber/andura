// ══ SETTINGS PROFILE — Body composition section ═════════════════════════
// Presentational extraction from SettingsProfile.tsx (hygiene split — zero
// behavior change). Talie + Gat + Sold + Inaltime → BF% auto + manual override
// + hint + footer. All derived values (bfAuto/bfSource/bfNavyIncomplete) and
// state stay in the parent; passed as props. DOM byte-identical.

import type { JSX } from 'react';
import type { OnboardingData } from '../../../../stores/onboardingStore';
import { t } from '../../../../../i18n/index.js';
import { LabelRow, SelectRow } from './rows';

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
}: BodyCompSectionProps): JSX.Element {
  return (
    <>
      {/* §F-pass2-settings-profile-03 — Compozitie corporala (mockup L2034-2047).
          Talie + Gat + Inaltime → BF% auto US Navy + manual override. */}
      <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
        {t('settings.profile.sectionBody')}
      </p>
      <div className="pulse-card pulse-card-tight overflow-hidden mb-1">
        <LabelRow label={t('settings.profile.waist')}>
          <input
            type="number"
            min={50}
            max={200}
            step={0.5}
            inputMode="decimal"
            autoComplete="off"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            data-testid="profile-waist-input"
            className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
          />
        </LabelRow>
        <LabelRow label={t('settings.profile.neck')}>
          <input
            type="number"
            min={25}
            max={60}
            step={0.5}
            inputMode="decimal"
            autoComplete="off"
            value={neck}
            onChange={(e) => setNeck(e.target.value)}
            data-testid="profile-neck-input"
            className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
          />
        </LabelRow>
        {/* §progress-v2 — sold intra in US Navy DOAR pentru femei. Input afisat
            conditionat ca sa nu deruteze barbatii (formula lor nu-l foloseste). */}
        {draft.sex === 'f' && (
          <LabelRow label={t('settings.profile.hip')}>
            <input
              type="number"
              min={50}
              max={200}
              step={0.5}
              inputMode="decimal"
              autoComplete="off"
              value={hip}
              onChange={(e) => setHip(e.target.value)}
              data-testid="profile-hip-input"
              className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
            />
          </LabelRow>
        )}
        <LabelRow label={t('settings.profile.height')}>
          <input
            type="number"
            min={120}
            max={230}
            step={0.5}
            inputMode="decimal"
            autoComplete="off"
            value={draft.height ?? ''}
            onChange={(e) => update('height', e.target.value ? Number(e.target.value) : null)}
            data-testid="profile-height-input"
            className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper text-ink font-mono text-sm"
          />
        </LabelRow>
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <span className="text-sm text-ink">{t('settings.profile.bfAuto')}</span>
          <span className="flex items-center gap-2">
            <span
              className="font-mono text-sm font-semibold text-ink"
              data-testid="profile-bf-auto"
            >
              {bfAuto != null ? `${bfAuto}%` : '—'}
            </span>
            <span className="text-[11px] text-ink3" data-testid="profile-bf-source">{bfSource}</span>
          </span>
        </div>
        <SelectRow label={t('settings.profile.bfManual')} htmlFor="profile-bf-manual" isLast>
          <span className="flex items-center gap-2">
            <input
              id="profile-bf-manual"
              type="checkbox"
              checked={bfManual}
              onChange={(e) => setBfManual(e.target.checked)}
              data-testid="profile-bf-manual"
              className="w-[18px] h-[18px] accent-brick"
            />
            <input
              type="number"
              min={3}
              max={60}
              step={0.1}
              inputMode="decimal"
              autoComplete="off"
              disabled={!bfManual}
              placeholder="—"
              value={bfOverride}
              onChange={(e) => setBfOverride(e.target.value)}
              data-testid="profile-bf-override"
              className="w-20 px-2.5 py-1.5 text-right border border-lineStrong rounded-xl bg-paper2 text-ink3 font-mono text-sm disabled:opacity-60"
            />
          </span>
        </SelectRow>
      </div>
      {bfNavyIncomplete && (
        <p
          className="text-xs text-ink2 mb-1 px-1 leading-snug"
          data-testid="profile-bf-hint"
        >
          {t('settings.profile.bfHint')}
        </p>
      )}
      <p className="text-xs text-ink3 mb-4 px-1 leading-snug">
        {t('settings.profile.bodyCompFooter')}
      </p>
    </>
  );
}
