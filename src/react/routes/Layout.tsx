// ══ LAYOUT SHELL — 4-Tab App Container (Outlet + BottomNav Persistent) ════
// Per Co-CTO LOCK Phase 2 routing C hybrid. /app/* parent route. Bottom nav
// vizibil exclusiv în acest layout. Top-level screens (splash/auth/onb) NU.
//
// Phase 6 task_20: ErrorBoundary root wrap pentru route-level error isolation
// + Suspense fallback LoadingSkeleton pentru lazy code-split readiness (Phase
// 7+ wires lazy() per route — current pattern eager-load preserved cu
// Suspense boundary ready pentru incremental migration).

import type { JSX } from 'react';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { SessionPill } from '../components/SessionPill';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { UpdatePrompt } from '../components/UpdatePrompt';
import { useCoachStore } from '../stores/coachStore';

export function Layout(): JSX.Element {
  // §1-H3 audit fix: hoist persona wrapper from Antrenor.tsx → Layout.tsx so all
  // 4 tabs + nested sub-screens inherit persona-aware text scaling (Maria 65
  // needs large text app-wide, not only on Antrenor home).
  const persona = useCoachStore((s) => s.persona);
  return (
    <div className={`min-h-screen bg-paper text-ink flex flex-col persona-${persona}`}>
      {/* §6-C2 audit fix — skip-to-content link WCAG 2.4.1 Bypass Blocks SC A.
          NO_DIACRITICS rule preserved ("continut" not "conținut"). */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-brick focus:text-paper focus:px-4 focus:py-2 focus:rounded focus:z-[100]"
      >
        Sari la continut
      </a>
      <UpdatePrompt />
      <main id="main-content" className="flex-1 pb-16">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSkeleton testId="layout-suspense" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <SessionPill />
      <BottomNav />
    </div>
  );
}
