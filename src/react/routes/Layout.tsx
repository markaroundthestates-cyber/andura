// ══ LAYOUT SHELL — 4-Tab App Container (Outlet + BottomNav Persistent) ════
// Per Co-CTO LOCK Phase 2 routing C hybrid. /app/* parent route. Bottom nav
// vizibil exclusiv în acest layout. Top-level screens (splash/auth/onb) NU.
//
// Phase 6 task_20: ErrorBoundary root wrap pentru route-level error isolation
// + Suspense fallback LoadingSkeleton pentru lazy code-split readiness (Phase
// 7+ wires lazy() per route — current pattern eager-load preserved cu
// Suspense boundary ready pentru incremental migration).

import type { JSX, RefObject } from 'react';
import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { SessionPill } from '../components/SessionPill';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useSwUpdate } from '../lib/swUpdate';
import { InstallPrompt } from '../components/InstallPrompt';
import { OfflineBanner } from '../components/OfflineBanner';
import { ToastViewport } from '../components/Toast';
import { MedicalDisclaimerModal } from '../components/MedicalDisclaimerModal';
import { AuroraBackground } from '../components/pulse/AuroraBackground';
import { useCoachStore } from '../stores/coachStore';
import { useSettingsStore } from '../stores/settingsStore';
import { t } from '../../i18n/index.js';

// S3.D anti-misclick (Daniel verbatim 2026-05-13): in-session routes hide
// BottomNav so Gigel doesn't accidentally exit mid-set. Pause/exit only via
// X button on the workout screen. Pre-session screens (energy-check,
// workout-preview) still show nav.
const IN_SESSION_ROUTES: ReadonlySet<string> = new Set([
  '/app/antrenor/workout',
  '/app/antrenor/post-rpe',
  '/app/antrenor/post-summary',
]);

// SCROLL-TO-TOP-ON-NAV FIX (2026-05-30) — the .app-scroll wrapper lives
// OUTSIDE <Routes>, so it persists across tab changes and its scrollTop is
// never reset on navigation: a tab scrolled to the bottom keeps the new tab
// pinned at the bottom (Daniel: clear in Account, likely all tabs). Reset BOTH
// surfaces on every real pathname change — the .app-scroll container (desktop,
// where overflow lives) AND window/document (mobile, where the viewport
// scrolls). Keyed on pathname only, so in-page scroll within a tab is never
// reset and intentional scroll-into-view inside a screen is untouched.
function useScrollResetOnNav(scrollRef: RefObject<HTMLDivElement | null>): void {
  const pathname = useLocation().pathname;
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [pathname, scrollRef]);
}

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
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollResetOnNav(scrollRef);
  // PWA auto-update redesign (2026-06-02) — persistent app-level SW
  // registration + periodic check. Auto-applies a new version on launch /
  // return when SAFE (no live workout session); defers mid-session. Replaces
  // the floating UpdatePrompt banner. The check keeps running app-wide and the
  // updateSW handle stays reachable for the Account "Check for updates" button.
  useSwUpdate();
  return (
    <div className={`relative min-h-screen bg-paper text-ink flex flex-col persona-${persona}`}>
      {/* ANDURA PULSE (2026-05-29) — the living aurora backdrop sits behind
          every authenticated route. position:absolute inset-0 z-0 +
          pointer-events:none so it is CLIPPED inside the desktop phone bezel
          (#root has overflow + border-radius + a transform containing block)
          and never intercepts clicks. The shell is `relative` so the absolute
          layer covers the full scroll height; all foreground chrome (main,
          nav, banners) renders later in the DOM → stacks above z-0. Motion is
          --motion-aware + auto-collapsed under prefers-reduced-motion.
          Supersedes the prior BackgroundAurora (brick/olive). */}
      <AuroraBackground />
      {/* §6-C2 audit fix — skip-to-content link WCAG 2.4.1 Bypass Blocks SC A.
          NO_DIACRITICS rule preserved ("continut" not "conținut"). */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-brick focus:text-paper focus:px-4 focus:py-2 focus:rounded focus:z-[100]"
      >
        {t('nav.skipToContent')}
      </a>
      <OfflineBanner />
      {!inSession && <InstallPrompt />}
      {/* DESKTOP BOTTOM-NAV FREEZE FIX (2026-05-29) — .app-scroll is the inner
          scroll surface. On desktop (>=768px) the scroll overflow lives HERE,
          not on #root, so the `position: fixed` BottomNav/SessionPill (which
          resolve their containing block to #root via translateZ(0)) pin to the
          device screen instead of scrolling 1:1 with content. #root keeps the
          transform (containing block) + overflow:hidden (clips rounded corners)
          but no longer scrolls. SubHeader (sticky top-0) sticks to this
          wrapper's top. On mobile (<768px) this is a transparent passthrough —
          #root has no transform/height/overflow there, so .app-scroll grows
          with content and the page scrolls on the viewport as before, BottomNav
          fixed to the viewport. flex-1 lets it fill the shell column. */}
      <div ref={scrollRef} className="app-scroll flex-1 flex flex-col">
        {/* relative z-10 lifts routed content above the z-0 AuroraBackground —
            a positioned z-0 layer otherwise paints over static siblings. The
            fixed chrome (nav z-50, SessionPill, banners) already sits higher. */}
        <main id="main-content" className={`relative z-10 flex-1 ${inSession ? 'pb-0' : 'app-content-pad'}`}>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton testId="layout-suspense" />}>
              {/* Wave C3 (2026-05-28) — page transition uses animate-page-enter
                  (320ms cubic-bezier(0.16, 1, 0.3, 1), 6px slide-up). Slightly
                  gentler than fade-in-up (12px) so the bottom nav reads stable
                  while content settles. key={pathname} remounts the wrapper so
                  the animation replays per navigation. Auto-gated by
                  prefers-reduced-motion via global * cap. */}
              <div key={pathname} className="animate-page-enter">
                <Outlet />
              </div>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
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
