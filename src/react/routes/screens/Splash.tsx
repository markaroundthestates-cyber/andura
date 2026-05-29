// ══ SPLASH — Pulse auto-advancing landing ════════════════════════════════
// Pulse arc reskin (2026-05-29, GROUP A / A1). The manual two-CTA landing was
// replaced by Daniel's Pulse mockup (interfata-noua/screens-entry.jsx
// SplashScreen ~25-52): an animated PulseMark logo + a volt->aqua gradient
// "Andura" wordmark + the tagline + a 3-dot loader. It AUTO-ADVANCES after
// ~2.6s and is tap-to-skip; on advance it routes via the EXISTING
// isAuthenticated logic (-> /app/antrenor authenticated, else /auth).
//
// The mockup drops the splash-cta / splash-secondary buttons; the routing
// reality they encoded (login default vs continue-when-authed) is preserved by
// the auto-advance target. Returning users aren't forced to wait — a tap (or
// keyboard Enter/Space) skips straight through. splash-trust-footer is kept.
//
// Token-only: the wordmark uses the shared .pulse-gradtext idiom (--grad-pulse
// volt->aqua), text via tokens, zero raw hex. Motion (PulseMark draw/glow, the
// dot float, the entrance) is foundation CSS, auto-gated by the global
// prefers-reduced-motion block.

import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { isAuthenticated as readAuthFromStorage } from '../../../auth.js';
import { PulseMark } from '../../components/pulse/PulseMark';
import { t } from '../../../i18n/index.js';

// Auto-advance delay — matches the mockup's 2600ms (long enough for the logo
// draw + wordmark rise to read, short enough to not feel like a wait).
const ADVANCE_MS = 2600;

export function Splash(): JSX.Element {
  const navigate = useNavigate();
  // §01.009 audit fix — a returning user's session is the stored Firebase
  // token (firebase-id-token etc.), NOT appStore.isAuthenticated: that flag is
  // session-scope (not persisted — appStore.partialize keeps only isSkipAuth)
  // and starts false on a cold reload, before ProtectedRoute's storage-sync
  // runs. Splash sits ABOVE ProtectedRoute, so checking the flag alone sends a
  // logged-in returner to /auth. Read the real token (same source-of-truth as
  // ProtectedRoute) so a valid session lands in the app; isSkipAuth keeps the
  // test-drive returner in too.
  const isSkipAuth = useAppStore((s) => s.isSkipAuth);
  const hasSession = readAuthFromStorage() || isSkipAuth;

  // Guard so the auto-advance timer and a manual tap can't both fire navigate.
  const advancedRef = useRef(false);
  const advance = (): void => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    navigate(hasSession ? '/app/antrenor' : '/auth');
  };

  useEffect(() => {
    const id = window.setTimeout(advance, ADVANCE_MS);
    return () => window.clearTimeout(id);
    // advance closes over hasSession (read once at mount); stable for the
    // splash lifetime — auth flips only via navigation away. Empty deps = one
    // timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      onClick={advance}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          advance();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={t('splash.appName')}
      className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center gap-3.5 px-7 text-center cursor-pointer"
      data-testid="splash"
    >
      <div className="animate-scale-in">
        <PulseMark size={96} />
      </div>

      {/* Gradient "Andura" wordmark — Space Grotesk display + volt->aqua
          .pulse-gradtext. Wide tracking echoes the mockup's letter-spaced
          wordmark. The brand name stays readable text for screen readers. */}
      <h1
        className="pulse-gradtext font-display animate-fade-in-up text-[42px] font-bold leading-none tracking-[0.12em]"
        style={{ animationDelay: '120ms' }}
      >
        {t('splash.appName')}
      </h1>

      {/* Tagline — mono eyebrow per mockup tone. Reuses the existing two-line
          splash tagline keys (i18n parity; no new strings). */}
      <p
        className="font-mono animate-fade-in-up text-[11px] tracking-[0.22em] uppercase text-ink3 leading-relaxed"
        style={{ animationDelay: '200ms' }}
      >
        {t('splash.taglineLine1')} {t('splash.taglineLine2')}
      </p>

      {/* 3-dot loader — volt / aqua / ember floaters signalling the brief
          auto-advance wait (mockup .splash-dots). Decorative. */}
      <div
        className="splash-dots flex gap-[7px] mt-5 animate-fade-in-up"
        style={{ animationDelay: '320ms' }}
        aria-hidden="true"
      >
        <i className="splash-dot" />
        <i className="splash-dot" />
        <i className="splash-dot" />
      </div>

      <p
        className="mt-6 text-[11px] text-ink3 leading-relaxed animate-fade-in-up"
        style={{ animationDelay: '420ms' }}
        data-testid="splash-trust-footer"
      >
        {t('splash.trustFooter')}
      </p>

      <style>{`
        .splash-dot {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background: var(--volt);
          animation: splashDotFloat calc(1s / max(var(--motion), .35)) ease-in-out infinite;
        }
        .splash-dot:nth-child(2) { background: var(--aqua); animation-delay: .15s; }
        .splash-dot:nth-child(3) { background: var(--ember); animation-delay: .3s; }
        @keyframes splashDotFloat {
          0%, 100% { transform: translateY(0); opacity: .55; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-dot { animation: none; opacity: .8; }
        }
      `}</style>
    </section>
  );
}
