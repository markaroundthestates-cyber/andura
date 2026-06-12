// ══ SETTINGS PROFILE — Body composition section ═════════════════════════
// Presentational extraction from SettingsProfile.tsx (hygiene split — zero
// behavior change). Talie + Gat + Sold + Inaltime → BF% auto + manual override
// + hint + footer. All derived values (bfAuto/bfSource/bfNavyIncomplete) and
// state stay in the parent; passed as props. DOM byte-identical.

import type { JSX } from 'react';
import type { OnboardingData } from '../../../../stores/onboardingStore';
import { t } from '../../../../../i18n/index.js';
import { Kicker } from '../../../../components/pulse/Kicker';
import { Pill } from '../../../../components/pulse/Pill';
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
  /** Live out-of-range flags (mark the offending input). */
  waistInvalid: boolean;
  neckInvalid: boolean;
  hipInvalid: boolean;
  /** Friendly inline message when a body measurement is out of range / swapped
   *  (empty string = no error). */
  bodyMeasureError: string;
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
  waistInvalid,
  neckInvalid,
  hipInvalid,
  bodyMeasureError,
}: BodyCompSectionProps): JSX.Element {
  // BF override out-of-range feedback (2026-05-31) — the save path accepts only
  // 3-60% and previously DROPPED an out-of-range value silently (90 → cleared,
  // no feedback). Surface it inline so the user sees the rejection. Only when
  // manual is ON + a non-empty value that parses outside the band.
  const bfOv = Number(bfOverride);
  const bfOutOfRange =
    bfManual && bfOverride.trim() !== '' && Number.isFinite(bfOv) && (bfOv < 3 || bfOv > 60);

  return (
    <>
      {/* §F-pass2-settings-profile-03 — Compozitie corporala (mockup L2034-2047).
          Talie + Gat + Inaltime → BF% auto US Navy + manual override. */}
      <Kicker>{t('settings.profile.sectionBody')}</Kicker>
      <div className="pulse-card pulse-card-tight overflow-hidden mb-1 mt-2">
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
            aria-invalid={waistInvalid || undefined}
            data-testid="profile-waist-input"
            className={`pulse-field w-20 px-2.5 py-1.5 text-right rounded-xl text-sm ${waistInvalid ? '!border-brick' : ''}`}
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
            aria-invalid={neckInvalid || undefined}
            data-testid="profile-neck-input"
            className={`pulse-field w-20 px-2.5 py-1.5 text-right rounded-xl text-sm ${neckInvalid ? '!border-brick' : ''}`}
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
              aria-invalid={hipInvalid || undefined}
              data-testid="profile-hip-input"
              className={`pulse-field w-20 px-2.5 py-1.5 text-right rounded-xl text-sm ${hipInvalid ? '!border-brick' : ''}`}
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
            className="pulse-field w-20 px-2.5 py-1.5 text-right rounded-xl text-sm"
          />
        </LabelRow>
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <span className="text-sm text-ink">{t('settings.profile.bfAuto')}</span>
          <span className="flex items-center gap-2.5">
            <span
              className="font-display text-lg font-bold text-ink"
              data-testid="profile-bf-auto"
            >
              {bfAuto != null ? `${bfAuto}%` : '—'}
            </span>
            <Pill color="var(--ink-3)">
              <span data-testid="profile-bf-source">{bfSource}</span>
            </Pill>
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
              aria-invalid={bfOutOfRange || undefined}
              data-testid="profile-bf-override"
              className={`pulse-field w-20 px-2.5 py-1.5 text-right rounded-xl text-sm ${
                bfOutOfRange ? '!border-brick' : ''
              }`}
            />
          </span>
        </SelectRow>
      </div>
      {bodyMeasureError && (
        <p
          className="text-xs text-brick mb-1 px-1 leading-snug"
          role="status"
          data-testid="profile-body-measure-error"
        >
          {bodyMeasureError}
        </p>
      )}
      {bfOutOfRange && (
        <p
          className="text-xs text-brick mb-1 px-1 leading-snug"
          role="status"
          data-testid="profile-bf-range-error"
        >
          {t('settings.profile.bfRangeError')}
        </p>
      )}
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
