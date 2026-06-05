// ══ BOTTOM NAV — 4 Taburi LOCKED V1 (Antrenor/Progres/Istoric/Cont) ═══════
// Per DECISIONS.md §D-LEGACY-066 Root Nav V2 + §D015/§D016. Active tab
// derivat path prefix /app/{tab}/* — Co-CTO LOCK Phase 2 routing C hybrid.
// Persistent în Layout `<Outlet />` parent — NU re-renderează cross-tab.
//
// §i18n 2026-05-28 — labels routed through t('nav.tabs.*') so the bottom nav
// flips immediately when Daniel toggles language in Cont > Setari > Limba.
// Route ids stay Romanian (URL stability) — only the visible label localizes.
//
// ANDURA PULSE reskin (2026-05-29) — ported from interfata-noua/ui.jsx
// BottomNav (~236-269). A single sliding pill indicator (bnav-top) translates
// across the 4 tabs to mark the active one; the active icon sits in a glowing
// tinted chip; labels are font-mono uppercase. Router-driven navigation,
// testids, i18n labels, aria-current/aria-label, the 4-tab structure, and the
// `compact` nav-style are ALL preserved — only the skin changed. Motion (pill
// slide + icon scale) is transform/opacity-only → auto-collapsed by the global
// prefers-reduced-motion block in global.css.

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
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

  // This nav is persistent (Layout <Outlet> parent) and never re-mounts on tab
  // navigation, so its t() labels would freeze at the locale present on first
  // mount (English by default) even after the user switches language — Daniel
  // audit 2026-06-05. Re-render when setLocale() broadcasts a locale change.
  const [, bumpLocale] = useState(0);
  useEffect(() => {
    const onLocaleChange = (): void => bumpLocale((n) => n + 1);
    window.addEventListener('andura:localechange', onLocaleChange);
    return () => window.removeEventListener('andura:localechange', onLocaleChange);
  }, []);

  const isActive = (tab: Tab): boolean =>
    location.pathname === `/app/${tab}` ||
    location.pathname.startsWith(`/app/${tab}/`);

  // Index of the active tab → drives the sliding pill's translateX. Default to
  // 0 (Antrenor) when no /app/{tab} prefix matches so the pill never hangs
  // off-grid (it stays under tab 0 but the active icon styling is per-button).
  const activeIdx = Math.max(
    0,
    TABS.findIndex((tb) => isActive(tb.id))
  );
  const onAnyTab = TABS.some((tb) => isActive(tb.id));

  return (
    <nav
      className={`app-fixed-column fixed bottom-0 grid grid-cols-4 items-center gap-1 z-50 ${
        compact ? 'h-12 px-3' : 'h-16 px-3'
      }`}
      aria-label={t('nav.ariaLabel')}
      data-nav-style={navStyle}
      style={{
        // Pulse chrome: soft top-fade from transparent into the page surface so
        // the bar reads as part of the glass rather than a hard band. Token
        // --paper keeps it cross-theme; keeps the subtle elevation hairline.
        background:
          'linear-gradient(180deg, transparent, var(--paper) 38%)',
        boxShadow:
          '0 -12px 24px -12px color-mix(in oklab, var(--paper) 70%, black), 0 -1px 0 var(--line)',
      }}
    >
      {/* Sliding active-pill indicator (mockup bnav-top). Spans one tab column
          (25% width) and translates to the active tab via translateX. A short
          brick hairline + faint tinted wash anchor "which tab is active" with a
          soft 280ms confirm on switch. aria-hidden — aria-current owns the
          semantic. Hidden entirely when no tab matches (off-grid guard). */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 w-1/4 h-full transition-transform duration-300 ease-out pointer-events-none"
        style={{
          transform: `translateX(${activeIdx * 100}%)`,
          opacity: onAnyTab ? 1 : 0,
        }}
      >
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-10 rounded-b-full bg-brick"
        />
        <span
          className="absolute inset-x-2 inset-y-1 rounded-xl"
          style={{
            background: 'color-mix(in oklab, var(--brick) 16%, transparent)',
          }}
        />
      </span>

      {TABS.map(({ id, Icon }) => {
        const active = isActive(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => navigate(`/app/${id}`)}
            className={`relative flex ${
              compact ? 'flex-row gap-1.5' : 'flex-col gap-1'
            } items-center justify-center h-full active:scale-[.96] transition-colors ${
              active ? 'text-brick' : 'text-ink2'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            {/* Active icon sits in a glowing tinted chip (mockup .bnav-ico.on).
                The glow + tint derive from --brick via color-mix so every theme
                reads native. Icon pops slightly (scale-110) on activation. */}
            <span
              aria-hidden="true"
              className="relative grid place-items-center rounded-xl transition-all duration-250"
              style={{
                width: 46,
                height: compact ? 26 : 30,
                background: active
                  ? 'color-mix(in oklab, var(--brick) 16%, transparent)'
                  : 'transparent',
                boxShadow: active
                  ? '0 0 20px -4px color-mix(in oklab, var(--brick) 55%, transparent)'
                  : 'none',
              }}
            >
              <Icon
                size={compact ? 16 : 20}
                aria-hidden="true"
                strokeWidth={active ? 2.2 : 1.8}
                className={`relative transition-transform duration-200 ${active ? 'scale-110' : 'scale-100'}`}
              />
            </span>
            <span
              className="relative font-mono uppercase"
              style={{ fontSize: 9, letterSpacing: '0.1em' }}
            >
              {t(`nav.tabs.${id}`)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
