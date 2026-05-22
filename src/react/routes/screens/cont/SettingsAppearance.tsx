// ══ SETTINGS APPEARANCE — Phase 6 task_12 Cont Sub-Screen ════════════════
// Mockup verbatim source: andura-clasic.html#screen-settings-appearance.
// Theme selector (light/dark/auto) + bottom nav style (compact/comfortable).
// Theme switch read/write settingsStore.theme. Phase 7+ wire actual CSS
// theme runtime swap (currently store value-only V1).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, MonitorCog } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import type { Theme } from '../../../stores/settingsStore';
import { gotoPath } from '../../../lib/navigation';

const THEME_OPTIONS: ReadonlyArray<{ value: Theme; label: string; Icon: typeof Sun }> = [
  { value: 'light', label: 'Luminos', Icon: Sun },
  { value: 'dark', label: 'Intunecat', Icon: Moon },
  { value: 'auto', label: 'Auto sistem', Icon: MonitorCog },
];

const NAV_STYLE_OPTIONS: ReadonlyArray<{ value: 'compact' | 'comfortable'; label: string }> = [
  { value: 'comfortable', label: 'Spatios (recomandat)' },
  { value: 'compact', label: 'Compact' },
];

export function SettingsAppearance(): JSX.Element {
  const navigate = useNavigate();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const navStyle = useSettingsStore((s) => s.bottomNavStyle);
  const setBottomNavStyle = useSettingsStore((s) => s.setBottomNavStyle);

  return (
    <section className="bg-paper min-h-screen flex flex-col" data-testid="settings-appearance">
      <header className="flex items-center gap-3 p-4 border-b border-line bg-paper sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate(gotoPath('cont'))}
          aria-label="Inapoi"
          data-testid="settings-appearance-back"
          className="p-2 -ml-2 text-ink"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-semibold text-ink">Aspect</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-ink2 mb-4 leading-snug">
          Cum arata Andura pentru tine.
        </p>

        {/* §6-M3 revert per Karpathy SF — aria-pressed pe <button> valid
            toggle pattern. Vezi SchimbaFazaConfirm + Onboarding pentru
            rationale full. */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Tema
        </p>
        <div className="bg-paper2 border border-line rounded-xl overflow-hidden mb-4">
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
                <span className="flex-1 text-sm">{opt.label}</span>
                {selected && <span aria-hidden="true">•</span>}
              </button>
            );
          })}
        </div>

        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
          Bara de jos
        </p>
        <div className="bg-paper2 border border-line rounded-xl overflow-hidden">
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
                <span className="flex-1 text-sm">{opt.label}</span>
                {selected && <span aria-hidden="true">•</span>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
