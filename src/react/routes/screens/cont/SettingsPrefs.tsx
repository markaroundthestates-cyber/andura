// ══ SETTINGS PREFS — Phase 6 task_13 Cont Sub-Screen ═════════════════════
// Units kg (lb disabled, post-Beta) + week start L/D + LIVE language toggle
// (EN default / RO opt-in, post 2026-05-28 paradigm flip — Daniel verbatim
// "schimbam complet limba default in engleza si lasam romana ca optiune din
// cont"). Language picker calls i18n.setLocale which persists to localStorage
// and syncs <html lang>; reload-free swap requires t()-wired consumer screens.

import type { JSX } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, ChevronRight, RefreshCcw, GitBranch, DownloadCloud, Bug, ClipboardCopy } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { gotoPath } from '../../../lib/navigation';
import { checkForUpdatesAndApply } from '../../../lib/swUpdate';
import { debugLog, isDebugEnabled, setDebugEnabled, isCollectEnabled, setCollectEnabled } from '../../../lib/debugLog';
import { toast } from '../../../lib/toast';
import { SubHeader } from '../../../components/SubHeader';
import { getCurrentLocale, setLocale, t } from '../../../../i18n/index.js';

// Founder pick 2026-06-12 — kg-only. Pounds (lb) is hidden entirely (not just
// disabled) so kg is the single visible + stored unit; lb conversion stays
// post-Beta. Single-option array keeps the toggle-group markup unchanged.
const UNIT_OPTIONS: ReadonlyArray<{ value: 'kg' | 'lb'; labelKey: string }> = [
  { value: 'kg', labelKey: 'settings.prefs.units.kg' },
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

  // D107 phase 1 — permanent interaction-log controls. The flag lives in
  // localStorage (`andura-debug`), NOT in settingsStore — it must never sync to
  // the cloud. Mirror it into local state so the toggle flips immediately; the
  // capture listener reads the flag at next launch (mount-once, per the desc).
  const [debugOn, setDebugOn] = useState<boolean>(() => isDebugEnabled());

  // D107 — durable behavioral-log COLLECTION gate (distinct from the founder's
  // debug verbosity above). DEFAULT-ON (Daniel decision 2026-06-07): always-on
  // capture, the user opts OUT here. Honest user-facing OFF switch = trust.
  const [collectOn, setCollectOn] = useState<boolean>(() => isCollectEnabled());

  function handleToggleDebug(next: boolean): void {
    if (next === debugOn) return;
    setDebugEnabled(next);
    setDebugOn(next);
  }

  function handleToggleCollect(next: boolean): void {
    if (next === collectOn) return;
    setCollectEnabled(next);
    setCollectOn(next);
  }

  // Gym-log arc 2026-06-11 (Daniel: "sa nu citesc 100 antrenamente pana la bug"):
  // the copy button defaults to the LAST WORKOUT slice (no navigation taps);
  // 'last3' / 'all' stay on-demand. Storage + engine learning are untouched —
  // only what the button copies is scoped.
  async function handleCopyDebugLog(scope: 'last' | 'last3' | 'all' = 'last'): Promise<void> {
    // Export now reads the durable IDB store (async).
    const events = await debugLog.snapshot();
    if (events.length === 0) {
      toast.show({ message: t('settings.prefs.advanced.debugLogEmpty'), variant: 'info' });
      return;
    }
    const json = await debugLog.exportJson(scope);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard
        .writeText(json)
        .then(() => toast.show({ message: t('settings.prefs.advanced.debugLogCopied'), variant: 'success' }))
        .catch(() => { /* clipboard denied — silent, never throw */ });
    }
  }

  return (
    <section className="min-h-screen flex flex-col" data-testid="settings-prefs">
      <SubHeader
        title={t('settings.prefs.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-prefs-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        {/* §6-M3 revert per Karpathy SF — aria-pressed pe <button> valid
            toggle pattern. Vezi SchimbaFazaConfirm + Onboarding pentru
            rationale full. */}
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-ink3 mb-3">
          {t('settings.prefs.units.heading')}
        </p>
        <div
          className="flex gap-1.5 rounded-[14px] p-1"
          style={{ background: 'var(--surface-2)' }}
          role="group"
          aria-label={t('settings.prefs.units.heading')}
        >
          {UNIT_OPTIONS.map((opt) => {
            // Honest V1: app shows weights in kg everywhere; lb conversion is
            // post-Beta. kg is the only offered option (lb hidden, founder pick
            // 2026-06-12) so it is always the selected active unit.
            const selected = opt.value === 'kg';
            return (
              <button
                key={opt.value}
                type="button"
                data-testid={`unit-${opt.value}`}
                aria-pressed={selected}
                onClick={() => setUnitSystem(opt.value)}
                className={`flex-1 min-h-[44px] py-2.5 rounded-[11px] text-sm font-semibold transition-colors ${selected ? '' : 'text-ink2'}`}
                style={selected ? { background: 'var(--grad-pulse)', color: 'var(--on-accent)' } : undefined}
              >
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-ink2 mb-4 mt-2 leading-snug">
          {t('settings.prefs.units.note')}
        </p>

        {/* Week-start control removed (founder pick 2026-06-12) — weeks always
            start on Monday; settingsStore.weekStart stays at its 'L' default. It has
            NO runtime consumer (Calendar/heatmap use the independent Monday-hardcoded
            weekStartIso()), so hiding the toggle is zero-risk. Hidden, not just
            pinned, since Sunday-start is not an offered option. */}

        {/* §i18n 2026-05-28 — LIVE language toggle (Daniel CEO directive
            "schimbam complet limba default in engleza si lasam romana ca
            optiune din cont"). EN = default post-flip; RO = opt-in. State is
            persisted to localStorage via i18n.setLocale (`sf.locale`) +
            syncs <html lang> for a11y/SEO. Selected row marked with • per
            UNIT_OPTIONS / WEEK_START_OPTIONS pattern for visual consistency. */}
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-ink3 mb-3">
          {t('settings.prefs.language.bilingualHeading')}
        </p>
        <div
          className="flex gap-1.5 rounded-[14px] p-1 mb-4"
          style={{ background: 'var(--surface-2)' }}
          role="group"
          aria-label={t('settings.prefs.language.bilingualHeading')}
        >
          {LANGUAGE_OPTIONS.map((opt) => {
            const selected = locale === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                data-testid={`language-${opt.value}`}
                aria-pressed={selected}
                onClick={() => handleLocaleChange(opt.value)}
                className={`flex-1 min-h-[44px] py-2 rounded-[11px] text-sm font-semibold flex flex-col items-center justify-center leading-tight transition-colors ${selected ? '' : 'text-ink2'}`}
                style={selected ? { background: 'var(--grad-pulse)', color: 'var(--on-accent)' } : undefined}
              >
                <span>{t(opt.labelKey)}</span>
                {opt.value === 'en' && (
                  <span className="font-mono text-[9px] uppercase tracking-wide opacity-70">{t('settings.prefs.language.default')}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* §B001+B002+B011 D047 Stage 3 — Avansat section drill-downs (mockup L2085-2096). */}
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-ink3 mb-3">
          {t('settings.prefs.advanced.heading')}
        </p>
        <div className="pulse-card pulse-card-tight overflow-hidden">
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
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <GitBranch className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('settings.prefs.advanced.schimbaFaza')}</p>
              <p className="text-xs text-ink2">{t('settings.prefs.advanced.schimbaFazaDesc')}</p>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
          </button>
          {/* PWA update redesign (2026-06-02) — force "check for updates &
              apply" (Daniel dev/testing tool). Runs registration.update() then
              applies the waiting SW with an "Updating..." toast + reload. No
              navigation — acts in place. */}
          <button
            type="button"
            onClick={() => checkForUpdatesAndApply()}
            data-testid="advanced-check-update"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <DownloadCloud className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('settings.prefs.advanced.checkUpdate')}</p>
              <p className="text-xs text-ink2">{t('settings.prefs.advanced.checkUpdateDesc')}</p>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
          </button>
          {/* D107 phase 1 — permanent interaction-log (debug). Toggle (default
              OFF, applies next launch) + copy-as-JSON. Flag is localStorage-only
              (`andura-debug`), never cloud-synced. */}
          <button
            type="button"
            role="switch"
            aria-checked={debugOn}
            onClick={() => handleToggleDebug(!debugOn)}
            data-testid="advanced-debug-toggle"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <Bug className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('settings.prefs.advanced.debugLog')}</p>
              <p className="text-xs text-ink2">{t('settings.prefs.advanced.debugLogDesc')}</p>
            </div>
            <span
              className="relative inline-flex w-10 h-6 rounded-full flex-shrink-0 transition-colors"
              style={{ background: debugOn ? 'var(--grad-pulse)' : 'var(--surface-2)' }}
              aria-hidden="true"
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-paper transition-transform"
                style={{ transform: debugOn ? 'translateX(16px)' : 'translateX(0)' }}
              />
            </span>
          </button>
          {/* D107 — durable behavioral-log collection gate (default-OFF for now;
              honest user-facing switch). Distinct from the debug toggle above. */}
          <button
            type="button"
            role="switch"
            aria-checked={collectOn}
            onClick={() => handleToggleCollect(!collectOn)}
            data-testid="advanced-collect-toggle"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink border-b border-line"
          >
            <DownloadCloud className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('settings.prefs.advanced.collect')}</p>
              <p className="text-xs text-ink2">{t('settings.prefs.advanced.collectDesc')}</p>
            </div>
            <span
              className="relative inline-flex w-10 h-6 rounded-full flex-shrink-0 transition-colors"
              style={{ background: collectOn ? 'var(--grad-pulse)' : 'var(--surface-2)' }}
              aria-hidden="true"
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-paper transition-transform"
                style={{ transform: collectOn ? 'translateX(16px)' : 'translateX(0)' }}
              />
            </span>
          </button>
          <button
            type="button"
            onClick={() => void handleCopyDebugLog()}
            data-testid="advanced-debug-copy"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-ink"
          >
            <ClipboardCopy className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('settings.prefs.advanced.debugLogCopy')}</p>
              <p className="text-xs text-ink2">{t('settings.prefs.advanced.debugLogCopyDesc')}</p>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0 text-ink2" strokeWidth={1.6} aria-hidden="true" />
          </button>
          {/* Scope variants (on-demand): the default button above copies the LAST
              workout; these copy the last 3 / the full raw history. */}
          <div className="flex gap-2 px-4 pb-3.5">
            <button
              type="button"
              onClick={() => void handleCopyDebugLog('last3')}
              data-testid="advanced-debug-copy-last3"
              className="flex-1 text-xs text-ink2 border border-line rounded-lg py-2"
            >
              {t('settings.prefs.advanced.debugLogCopyLast3')}
            </button>
            <button
              type="button"
              onClick={() => void handleCopyDebugLog('all')}
              data-testid="advanced-debug-copy-all"
              className="flex-1 text-xs text-ink2 border border-line rounded-lg py-2"
            >
              {t('settings.prefs.advanced.debugLogCopyAll')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
