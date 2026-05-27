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
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { SessionPill } from '../components/SessionPill';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { UpdatePrompt } from '../components/UpdatePrompt';
import { InstallPrompt } from '../components/InstallPrompt';
import { OfflineBanner } from '../components/OfflineBanner';
import { ToastViewport } from '../components/Toast';
import { MedicalDisclaimerModal } from '../components/MedicalDisclaimerModal';
import { useCoachStore } from '../stores/coachStore';
import { useSettingsStore } from '../stores/settingsStore';

// S3.D anti-misclick (Daniel verbatim 2026-05-13): in-session routes hide
// BottomNav so Gigel doesn't accidentally exit mid-set. Pause/exit only via
// X button on the workout screen. Pre-session screens (energy-check,
// workout-preview) still show nav.
const IN_SESSION_ROUTES: ReadonlySet<string> = new Set([
  '/app/antrenor/workout',
  '/app/antrenor/post-rpe',
  '/app/antrenor/post-summary',
]);

export function Layout(): JSX.Element {
  // §1-H3 audit fix: hoist persona wrapper from Antrenor.tsx → Layout.tsx so all
  // 4 tabs + nested sub-screens inherit persona-aware text scaling (Maria 65
  // needs large text app-wide, not only on Antrenor home).
  const persona = useCoachStore((s) => s.persona);
  const pathname = useLocation().pathname;
  const inSession = IN_SESSION_ROUTES.has(pathname);
  // U-01 audit fix (AUDIT-2 §U-01 CRIT) — Medical Disclaimer LOCK 4 gate was
  // built but never mounted; acceptDisclaimer() had zero non-test callers.
  // Mount here so the gate covers the entire authenticated app (post auth +
  // onboarding via ProtectedRoute) before any training flow. Mandatory modal
  // (no cancel) — acknowledge persists acceptedDisclaimer in settingsStore
  // (partialize) so it does not reappear each load.
  const acceptedDisclaimer = useSettingsStore((s) => s.acceptedDisclaimer);
  const acceptDisclaimer = useSettingsStore((s) => s.acceptDisclaimer);
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
      <OfflineBanner />
      <UpdatePrompt />
      {!inSession && <InstallPrompt />}
      <main id="main-content" className={`flex-1 ${inSession ? 'pb-0' : 'pb-16'}`}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSkeleton testId="layout-suspense" />}>
            {/* Subtle screen entrance on route change. key={pathname} remounts
                the wrapper so the fadeInUp replays per navigation. Animation is
                transform/opacity only, auto-gated by prefers-reduced-motion. */}
            <div key={pathname} className="animate-fade-in-up">
              <Outlet />
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      <SessionPill />
      {!inSession && <BottomNav />}
      <ToastViewport />
      <MedicalDisclaimerModal
        open={!acceptedDisclaimer}
        onAcknowledge={acceptDisclaimer}
      />
    </div>
  );
}
