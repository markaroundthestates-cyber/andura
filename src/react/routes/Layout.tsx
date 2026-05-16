// ══ LAYOUT SHELL — 4-Tab App Container (Outlet + BottomNav Persistent) ════
// Per Co-CTO LOCK Phase 2 routing C hybrid. /app/* parent route. Bottom nav
// vizibil exclusiv în acest layout. Top-level screens (splash/auth/onb) NU.

import type { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';

export function Layout(): JSX.Element {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
