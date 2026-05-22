// ══ BOTTOM NAV — 4 Taburi LOCKED V1 (Antrenor/Progres/Istoric/Cont) ═══════
// Per DECISIONS.md §D-LEGACY-066 Root Nav V2 + §D015/§D016. Active tab
// derivat path prefix /app/{tab}/* — Co-CTO LOCK Phase 2 routing C hybrid.
// Tailwind classes parity mockup andura-clasic.html bottom-nav block.
// Persistent în Layout `<Outlet />` parent — NU re-renderează cross-tab.

import type { JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, Clock, User } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';

type Tab = 'antrenor' | 'progres' | 'istoric' | 'cont';

interface TabConfig {
  id: Tab;
  label: string;
  Icon: typeof Activity;
}

const TABS: readonly TabConfig[] = [
  { id: 'antrenor', label: 'Antrenor', Icon: Activity },
  { id: 'progres', label: 'Progres', Icon: BarChart3 },
  { id: 'istoric', label: 'Istoric', Icon: Clock },
  { id: 'cont', label: 'Cont', Icon: User },
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
      className={`fixed bottom-0 left-0 right-0 bg-paper border-t border-line flex justify-around items-center gap-2 z-50 ${
        compact ? 'h-12' : 'h-16'
      }`}
      aria-label="Navigare principala"
      data-nav-style={navStyle}
    >
      {TABS.map(({ id, label, Icon }) => {
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
            <Icon size={compact ? 16 : 20} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
