// ══ BOTTOM NAV — 4 Taburi LOCKED V1 (Antrenor/Progres/Istoric/Cont) ═══════
// Per DECISIONS.md §D-LEGACY-066 Root Nav V2 + §D015/§D016. Active tab
// derivat path prefix /app/{tab}/* — Co-CTO LOCK Phase 2 routing C hybrid.
// Tailwind classes parity mockup andura-clasic.html bottom-nav block.
// Persistent în Layout `<Outlet />` parent — NU re-renderează cross-tab.
//
// §i18n 2026-05-28 — labels routed through t('nav.tabs.*') so the bottom nav
// flips immediately when Daniel toggles language in Cont > Setari > Limba.
// Route ids stay Romanian (URL stability) — only the visible label localizes.

import type { JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, Activity, CalendarDays, User } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../../i18n/index.js';

type Tab = 'antrenor' | 'progres' | 'istoric' | 'cont';

interface TabConfig {
  id: Tab;
  Icon: typeof Activity;
}

const TABS: readonly TabConfig[] = [
  { id: 'antrenor', Icon: Dumbbell },
  { id: 'progres', Icon: Activity },
  { id: 'istoric', Icon: CalendarDays },
  { id: 'cont', Icon: User },
];

export function BottomNav(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const navStyle = useSettingsStore((s) => s.bottomNavStyle);
  const compact = navStyle === 'compact';

  const isActive = (tab: Tab): boolean =>
    location.pathname === `/app/${tab}` ||
    location.pathname.startsWith(`/app/${tab}/`);

  return (
    <nav
      className={`app-fixed-column fixed bottom-0 bg-paper border-t border-line flex justify-around items-center gap-2 z-50 ${
        compact ? 'h-12' : 'h-16'
      }`}
      aria-label={t('nav.ariaLabel')}
      data-nav-style={navStyle}
    >
      {TABS.map(({ id, Icon }) => {
        const active = isActive(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => navigate(`/app/${id}`)}
            className={`flex ${
              compact ? 'flex-row gap-1.5' : 'flex-col gap-1'
            } items-center justify-center flex-1 h-full text-xs font-medium transition-colors ${
              active ? 'text-brick' : 'text-ink2'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            {/* Active tab icon pops slightly (scale-110) for a subtle motion
                cue on switch. transition-transform keeps it smooth; auto-gated
                by the global prefers-reduced-motion block. */}
            <Icon
              size={compact ? 16 : 20}
              aria-hidden="true"
              className={`transition-transform ${active ? 'scale-110' : 'scale-100'}`}
            />
            <span>{t(`nav.tabs.${id}`)}</span>
          </button>
        );
      })}
    </nav>
  );
}
