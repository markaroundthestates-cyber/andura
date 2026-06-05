// ══ SETTINGS APPEARANCE — Phase 6 task_12 Cont Sub-Screen ════════════════
// Mockup verbatim source: andura-clasic.html#screen-settings-appearance.
//
// ADDENDUM 4 (Pulse arc #5 2026-06-01) — this sub-screen is now the single
// canonical home for ALL appearance controls. The Account home (Cont.tsx) used
// to render the FULL expanded accent + Dark/Light block inline AND an
// "Appearance" row (a visible duplicate). That expanded block MOVED here so the
// Account home stays a clean row list and every appearance control is one tap
// deeper. This screen holds: (1) Accent color (4 Pulse swatches Volt/Aqua/
// Ember/Violet) wired to settingsStore.accent + applied app-wide via
// paletteSync.applyAccent (documentElement --brick override; persisted under
// 'wv2-settings-store'); (2) Mode (Dark/Light) wired to settingsStore.theme;
// (3) Bottom bar density (Comfortable / Compact) wired to
// settingsStore.bottomNavStyle. Render-move only — store wires + every
// data-testid (cont-accent-*, cont-theme-*, nav-style-*) are unchanged.

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import type { Accent } from '../../../stores/settingsStore';
import { applyAccent } from '../../../lib/paletteSync';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';

const ACCENT_OPTIONS: ReadonlyArray<{ value: Accent; hex: string; labelKey: string }> = [
  { value: 'volt', hex: 'var(--volt)', labelKey: 'cont.appearance.accentVolt' },
  { value: 'aqua', hex: 'var(--aqua)', labelKey: 'cont.appearance.accentAqua' },
  { value: 'ember', hex: 'var(--ember)', labelKey: 'cont.appearance.accentEmber' },
  { value: 'violet', hex: 'var(--violet)', labelKey: 'cont.appearance.accentViolet' },
];

const NAV_STYLE_OPTIONS: ReadonlyArray<{ value: 'compact' | 'comfortable'; labelKey: string }> = [
  { value: 'comfortable', labelKey: 'settings.appearance.navComfortable' },
  { value: 'compact', labelKey: 'settings.appearance.navCompact' },
];

export function SettingsAppearance(): JSX.Element {
  const navigate = useNavigate();

  // Pulse ACCENT picker (moved from the inline Cont card per ADDENDUM 4) —
  // swaps the primary accent (--brick) at runtime among the four Pulse hues.
  // Wired to the REAL settingsStore.accent (persisted under 'wv2-settings-
  // store') + applied app-wide via paletteSync.applyAccent (documentElement
  // --brick override). Default Volt = the theme default (no override).
  const accent = useSettingsStore((s) => s.accent);
  const setAccent = useSettingsStore((s) => s.setAccent);
  const pickAccent = (a: Accent): void => {
    setAccent(a);
    applyAccent(a);
  };

  // Dark/Light toggle wired to the REAL theme store (useSettingsStore.theme +
  // setTheme). ThemeSync applies it to <html data-theme> and zustand `persist`
  // saves it under 'wv2-settings-store' (NOT ephemeral). `auto` (system) shows
  // Dark as the active half; the binary toggle commits 'dark' / 'light'.
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const isLight = theme === 'light';
  const MODE_OPTIONS = [
    { value: 'dark' as const, labelKey: 'cont.appearance.modeDark', active: !isLight },
    { value: 'light' as const, labelKey: 'cont.appearance.modeLight', active: isLight },
  ];

  // Bottom-nav density (Comfortable / Compact) — wired to bottomNavStyle.
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
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink3 mb-4">
          {t('settings.appearance.subtitle')}
        </p>

        {/* ACCENT — 4 Pulse swatches; selected gets a glow halo + check
            (mockup .acc-sw). Moved from the inline Cont card per ADDENDUM 4. */}
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-ink3 mb-3">
          {t('cont.appearance.accentLabel')}
        </p>
        <div className="pulse-card p-4 mb-6">
          <div className="flex gap-3" role="group" aria-label={t('cont.appearance.accentLabel')} data-testid="cont-appearance-accent">
            {ACCENT_OPTIONS.map((opt) => {
              const active = accent === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  data-testid={`cont-accent-${opt.value}`}
                  aria-pressed={active}
                  aria-label={t(opt.labelKey)}
                  onClick={() => pickAccent(opt.value)}
                  className="flex flex-col items-center flex-1 press-feedback"
                >
                  <span
                    className="w-[42px] h-[42px] rounded-full grid place-items-center transition-transform duration-200"
                    style={{
                      background: opt.hex,
                      boxShadow: active ? `0 0 18px -2px ${opt.hex}` : 'none',
                      transform: active ? 'scale(1.06)' : 'none',
                    }}
                  >
                    {active && (
                      <Check className="w-[15px] h-[15px]" strokeWidth={2.8} style={{ color: 'var(--on-accent)' }} aria-hidden="true" />
                    )}
                  </span>
                  <span className="font-mono text-[9.5px] text-ink3 uppercase tracking-wide mt-1.5">{t(opt.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MODE — Dark/Light segmented toggle; active half = a gradient derived
            from the LIVE accent (--brick), not the fixed volt→aqua --grad-pulse,
            so it tracks the selected accent like the rest of the UI (audit
            2026-06-05: the toggle stayed volt after switching accent to Aqua). */}
        <div
          className="flex gap-1.5 rounded-[14px] p-1 mb-6"
          style={{ background: 'var(--surface-2)' }}
          role="group"
          aria-label={t('cont.appearance.modeLabel')}
        >
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-testid={`cont-theme-${opt.value}`}
              aria-pressed={opt.active}
              onClick={() => setTheme(opt.value)}
              className={`flex-1 min-h-[44px] py-2.5 rounded-[11px] text-sm font-semibold transition-colors ${
                opt.active ? 'text-ink' : 'text-ink2'
              }`}
              style={
                opt.active
                  ? {
                      background:
                        'linear-gradient(135deg, var(--brick), color-mix(in oklab, var(--brick) 72%, black))',
                      color: 'var(--on-accent)',
                    }
                  : undefined
              }
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>

        {/* BOTTOM BAR — density option (Comfortable / Compact). §F-pass2-
            settings-appearance-02 HIGH-BETA chat 4 Co-CTO decision: KEEP this
            section (useful UX option pentru Maria 65 vs Marius). Wire la
            useSettingsStore bottomNavStyle preserved. §6-M3 aria-pressed pe
            <button> valid toggle. */}
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-ink3 mb-3">
          {t('settings.appearance.navHeading')}
        </p>
        <div className="pulse-card pulse-card-tight overflow-hidden">
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
                {selected && (
                  <Check className="w-4 h-4 text-brick" strokeWidth={2.6} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
