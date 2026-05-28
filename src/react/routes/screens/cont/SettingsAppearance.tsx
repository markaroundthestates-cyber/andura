// ══ SETTINGS APPEARANCE — Phase 6 task_12 Cont Sub-Screen ════════════════
// Mockup verbatim source: andura-clasic.html#screen-settings-appearance.
// Theme selector (light/dark/auto) + bottom nav style (compact/comfortable).
// Theme switch read/write settingsStore.theme. CSS runtime swap APLICAT live
// via themeSync.ts (ThemeSync component + applyInitialTheme) — seteaza
// <html data-theme>, iar global.css [data-theme="dark"] re-skin tokens.
// Default = dark (tema mov Brain Coach, CEO pick 2026-05-27).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, MonitorCog, Palette, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import type { Theme } from '../../../stores/settingsStore';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';

const THEME_OPTIONS: ReadonlyArray<{ value: Theme; labelKey: string; Icon: typeof Sun }> = [
  { value: 'light', labelKey: 'settings.appearance.themeLightLabel', Icon: Sun },
  { value: 'dark', labelKey: 'settings.appearance.themeDarkLabel', Icon: Moon },
  { value: 'auto', labelKey: 'settings.appearance.themeAutoLabel', Icon: MonitorCog },
];

const NAV_STYLE_OPTIONS: ReadonlyArray<{ value: 'compact' | 'comfortable'; labelKey: string }> = [
  { value: 'comfortable', labelKey: 'settings.appearance.navComfortable' },
  { value: 'compact', labelKey: 'settings.appearance.navCompact' },
];

export function SettingsAppearance(): JSX.Element {
  const navigate = useNavigate();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const navStyle = useSettingsStore((s) => s.bottomNavStyle);
  const setBottomNavStyle = useSettingsStore((s) => s.setBottomNavStyle);

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-appearance">
      <SubHeader
        title={t('settings.appearance.title')}
        onBack={() => navigate(gotoPath('cont'))}
        testIdBack="settings-appearance-back"
      />

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink2 mb-4 leading-snug">
          {t('settings.appearance.subtitle')}
        </p>

        {/* §6-M3 revert per Karpathy SF — aria-pressed pe <button> valid
            toggle pattern. Vezi SchimbaFazaConfirm + Onboarding pentru
            rationale full. */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          {t('settings.appearance.themeHeading')}
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden mb-4">
          {THEME_OPTIONS.map((opt, idx) => {
            const Icon = opt.Icon;
            const selected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                data-testid={`theme-${opt.value}`}
                aria-pressed={selected}
                onClick={() => setTheme(opt.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left ${idx < THEME_OPTIONS.length - 1 ? 'border-b border-line' : ''} ${selected ? 'text-brick font-semibold' : 'text-ink'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="flex-1 text-sm">{t(opt.labelKey)}</span>
                {selected && <span aria-hidden="true">•</span>}
              </button>
            );
          })}
        </div>

        {/* §F-pass2-settings-appearance-02 HIGH-BETA chat 4 Co-CTO decision: KEEP
            "Bara de jos" section (Spatios/Compact) — useful UX option pentru
            Maria 65 (Spatios default) vs Marius (Compact preference). Mockup
            omission este mockup drift, NU prod bug. Wire la useSettingsStore
            bottomNavStyle preserved. */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          {t('settings.appearance.navHeading')}
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden">
          {NAV_STYLE_OPTIONS.map((opt, idx) => {
            const selected = navStyle === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                data-testid={`nav-style-${opt.value}`}
                aria-pressed={selected}
                onClick={() => setBottomNavStyle(opt.value)}
                className={`w-full flex items-center px-4 py-3 text-left ${idx < NAV_STYLE_OPTIONS.length - 1 ? 'border-b border-line' : ''} ${selected ? 'text-brick font-semibold' : 'text-ink'}`}
              >
                <span className="flex-1 text-sm">{t(opt.labelKey)}</span>
                {selected && <span aria-hidden="true">•</span>}
              </button>
            );
          })}
        </div>

        {/* PAR-002 Wave 2e — Themes palette picker drill-down. */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mt-4 mb-2">
          {t('settings.appearance.paletteHeading')}
        </p>
        <div className="bg-paper2 border border-line rounded-[14px] overflow-hidden">
          <button
            type="button"
            data-testid="settings-themes-link"
            onClick={() => navigate(gotoPath('settings-themes'))}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-ink"
          >
            <Palette className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span className="flex-1 text-sm">{t('settings.appearance.themesLink')}</span>
            <ChevronRight className="w-5 h-5 text-ink2" strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
