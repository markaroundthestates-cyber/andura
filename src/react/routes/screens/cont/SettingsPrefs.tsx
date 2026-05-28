// ══ SETTINGS PREFS — Phase 6 task_13 Cont Sub-Screen ═════════════════════
// Units kg (lb disabled, post-Beta) + week start L/D + LIVE language toggle
// (EN default / RO opt-in, post 2026-05-28 paradigm flip — Daniel verbatim
// "schimbam complet limba default in engleza si lasam romana ca optiune din
// cont"). Language picker calls i18n.setLocale which persists to localStorage
// and syncs <html lang>; reload-free swap requires t()-wired consumer screens.

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, ChevronRight, RefreshCcw, GitBranch } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import type { WeekStart } from '../../../stores/settingsStore';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { getCurrentLocale, setLocale, t } from '../../../../i18n/index.js';

const UNIT_OPTIONS: ReadonlyArray<{ value: 'kg' | 'lb'; labelKey: string }> = [
  { value: 'kg', labelKey: 'settings.prefs.units.kg' },
  { value: 'lb', labelKey: 'settings.prefs.units.lb' },
];

const WEEK_START_OPTIONS: ReadonlyArray<{ value: WeekStart; labelKey: string }> = [
  { value: 'L', labelKey: 'settings.prefs.weekStart.monday' },
  { value: 'D', labelKey: 'settings.prefs.weekStart.sunday' },
];

type Locale = 'en' | 'ro';
const LANGUAGE_OPTIONS: ReadonlyArray<{ value: Locale; labelKey: string }> = [
  // Order matters: EN first as the post-2026-05-28 default (Daniel verbatim).
  { value: 'en', labelKey: 'settings.prefs.language.english' },
  { value: 'ro', labelKey: 'settings.prefs.language.romanian' },
];

export function SettingsPrefs(): JSX.Element {
  const navigate = useNavigate();
  const setUnitSystem = useSettingsStore((s) => s.setUnitSystem);
  const weekStart = useSettingsStore((s) => s.weekStart);
  const setWeekStart = useSettingsStore((s) => s.setWeekStart);

  // §i18n 2026-05-28 — live language switch. setLocale() persists to
  // localStorage (`sf.locale`), syncs `<html lang>`, and updates the cached
  // locale so t() picks the new bundle on the next render. We mirror the
  // chosen value into local React state so the UI flips immediately (without
  // waiting for a full re-render cycle triggered by an external listener).
  const [locale, setLocaleState] = useState<Locale>(() => getCurrentLocale() as Locale);

  function handleLocaleChange(next: Locale): void {
    if (next === locale) return;
    setLocale(next);
    setLocaleState(next);
  }

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-prefs">
      <SubHeader
        title={t('settings.prefs.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-prefs-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        {/* §6-M3 revert per Karpathy SF — aria-pressed pe <button> valid
            toggle pattern. Vezi SchimbaFazaConfirm + Onboarding pentru
            rationale full. */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          {t('settings.prefs.units.heading')}
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden">
          {UNIT_OPTIONS.map((opt, idx) => {
            // Honest V1: app shows weights in kg everywhere; lb conversion is
            // post-Beta. kg is the effective active unit regardless of any
            // legacy persisted value; lb is disabled (no false "switched" state).
            const disabled = opt.value === 'lb';
            const selected = opt.value === 'kg';
            return (
              <button
                key={opt.value}
                type="button"
                data-testid={`unit-${opt.value}`}
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => !disabled && setUnitSystem(opt.value)}
                className={`w-full flex items-center px-4 py-3 text-left ${idx < UNIT_OPTIONS.length - 1 ? 'border-b border-line' : ''} ${disabled ? 'text-ink2 opacity-60 cursor-not-allowed' : selected ? 'text-brick font-semibold' : 'text-ink'}`}
              >
                <span className="flex-1 text-sm">{t(opt.labelKey)}</span>
                {selected && <span aria-hidden="true">•</span>}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-ink2 mb-4 mt-2 leading-snug">
          {t('settings.prefs.units.note')}
        </p>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          {t('settings.prefs.weekStart.heading')}
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden mb-4">
          {WEEK_START_OPTIONS.map((opt, idx) => {
            const selected = weekStart === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                data-testid={`week-start-${opt.value}`}
                aria-pressed={selected}
                onClick={() => setWeekStart(opt.value)}
                className={`w-full flex items-center px-4 py-3 text-left ${idx < WEEK_START_OPTIONS.length - 1 ? 'border-b border-line' : ''} ${selected ? 'text-brick font-semibold' : 'text-ink'}`}
              >
                <span className="flex-1 text-sm">{t(opt.labelKey)}</span>
                {selected && <span aria-hidden="true">•</span>}
              </button>
            );
          })}
        </div>

        {/* §i18n 2026-05-28 — LIVE language toggle (Daniel CEO directive
            "schimbam complet limba default in engleza si lasam romana ca
            optiune din cont"). EN = default post-flip; RO = opt-in. State is
            persisted to localStorage via i18n.setLocale (`sf.locale`) +
            syncs <html lang> for a11y/SEO. Selected row marked with • per
            UNIT_OPTIONS / WEEK_START_OPTIONS pattern for visual consistency. */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          {t('settings.prefs.language.heading')} / Language
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden mb-4">
          {LANGUAGE_OPTIONS.map((opt, idx) => {
            const selected = locale === opt.value;
            const isLast = idx === LANGUAGE_OPTIONS.length - 1;
            return (
              <button
                key={opt.value}
                type="button"
                data-testid={`language-${opt.value}`}
                aria-pressed={selected}
                onClick={() => handleLocaleChange(opt.value)}
                className={`w-full flex items-center px-4 py-3 text-left ${isLast ? '' : 'border-b border-line'} ${selected ? 'text-brick font-semibold' : 'text-ink'}`}
              >
                <span className="flex-1 text-sm">{t(opt.labelKey)}</span>
                {opt.value === 'en' && (
                  <span className="text-xs text-ink3 mr-2">{t('settings.prefs.language.default')}</span>
                )}
                {selected && <span aria-hidden="true">•</span>}
              </button>
            );
          })}
        </div>

        {/* §B001+B002+B011 D047 Stage 3 — Avansat section drill-downs (mockup L2085-2096). */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          {t('settings.prefs.advanced.heading')}
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden">
          <button
            type="button"
            onClick={() => navigate(gotoPath('reset-coach-confirm'))}
            data-testid="advanced-reset-coach"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <RefreshCcw className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('settings.prefs.advanced.resetCoach')}</p>
              <p className="text-xs text-ink2">{t('settings.prefs.advanced.resetCoachDesc')}</p>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => navigate(gotoPath('redo-onboarding-confirm'))}
            data-testid="advanced-redo-onboarding"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <RotateCcw className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('settings.prefs.advanced.redoOnboarding')}</p>
              <p className="text-xs text-ink2">{t('settings.prefs.advanced.redoOnboardingDesc')}</p>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => navigate(gotoPath('schimba-faza-confirm'))}
            data-testid="advanced-schimba-faza"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink"
          >
            <GitBranch className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('settings.prefs.advanced.schimbaFaza')}</p>
              <p className="text-xs text-ink2">{t('settings.prefs.advanced.schimbaFazaDesc')}</p>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
