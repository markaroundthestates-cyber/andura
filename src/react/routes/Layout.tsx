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

export function Layout(): JSX.Element {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <main className="flex-1 pb-16">
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
