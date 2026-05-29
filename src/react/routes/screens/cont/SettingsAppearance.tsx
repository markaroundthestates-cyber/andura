// ══ SETTINGS APPEARANCE — Phase 6 task_12 Cont Sub-Screen ════════════════
// Mockup verbatim source: andura-clasic.html#screen-settings-appearance.
//
// [05.061] consolidation 2026-05-29 (Pulse arc #5) — the theme (light/dark/
// auto) controls here were a STALE DUPLICATE of the inline LIVE Appearance
// card now living in Cont.tsx (accent picker + Dark/Light toggle, the single
// canonical surface per D095 — the old multi-palette "themes" system was
// dropped). To avoid a duplicate appearance UI, this screen no longer renders
// the theme picker; it is now the canonical home for the one control the
// inline Cont card does NOT carry: the bottom-nav density (Comfortable /
// Compact). Wired to useSettingsStore.bottomNavStyle (unchanged). The screen
// is also re-skinned to the Pulse glass card language (.pulse-card).

import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../../stores/settingsStore';
import { gotoPath } from '../../../lib/navigation';
import { SubHeader } from '../../../components/SubHeader';
import { t } from '../../../../i18n/index.js';

const NAV_STYLE_OPTIONS: ReadonlyArray<{ value: 'compact' | 'comfortable'; labelKey: string }> = [
  { value: 'comfortable', labelKey: 'settings.appearance.navComfortable' },
  { value: 'compact', labelKey: 'settings.appearance.navCompact' },
];

export function SettingsAppearance(): JSX.Element {
  const navigate = useNavigate();
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

        {/* §F-pass2-settings-appearance-02 HIGH-BETA chat 4 Co-CTO decision: KEEP
            "Bara de jos" section (Spatios/Compact) — useful UX option pentru
            Maria 65 (Spatios default) vs Marius (Compact preference). Mockup
            omission este mockup drift, NU prod bug. Wire la useSettingsStore
            bottomNavStyle preserved. [05.061] — accent + Dark/Light live inline
            in Cont (canonical); this is the lone control unique to this screen.
            §6-M3 revert per Karpathy SF — aria-pressed pe <button> valid toggle. */}
        <p className="text-xs uppercase tracking-wide font-semibold text-ink2 mb-2">
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
                {selected && <span aria-hidden="true">•</span>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
