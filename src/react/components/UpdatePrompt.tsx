// ══ UPDATE PROMPT — Phase 6 task_21 PWA Service Worker New Version ═══════
// Detects a new SW version via vite-plugin-pwa + surfaces a banner with an
// "Actualizeaza" CTA. ZERO auto-reload — the user explicitly consents (Maria 65
// anti-paternalism, NU rip mid-action).
//
// §S-12 audit fix (AUDIT-3) — prior wiring was contradictory + dead. vite.config
// used registerType:'autoUpdate' (Workbox silently skipWaiting+clientsClaim, no
// event) while this component listened for a custom 'sw-updated' event that
// NOTHING dispatched → banner never showed AND the SW could swap mid-session
// silently (opposite of the stated intent). Fix: vite.config → registerType:
// 'prompt' + this component drives the banner from the real vite-plugin-pwa
// `registerSW({ onNeedRefresh })` callback, which fires when a new SW is waiting.
//
// §SW-UPDATE-CHECK 2026-05-28 (Daniel smoke installed PWA stale): browser
// re-checks SW only on navigation OR every ~24h. For installed PWA opened from
// home-screen icon, scope NEVER navigates → SW update check never fires →
// onNeedRefresh never triggers → user sees stale forever (until reinstall).
// Fix: capture `registration` via `onRegisteredSW(swUrl, r)` + force
// `registration.update()` on:
//   (a) visibilitychange → visible (user revine in tab/PWA)
//   (b) every 30min while app open (`setInterval`)
// Both check with browser cache headers; bail safely if registration missing.
//
// jsdom test environment: `virtual:pwa-register` is a Vite-injected virtual
// module absent on disk, so the dynamic import rejects → caught → the no-op
// fallback persists (banner never shows in tests, mount never throws).

/// <reference types="vite-plugin-pwa/client" />
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { t } from '../../i18n/index.js';

export function UpdatePrompt(): JSX.Element | null {
  const [needRefresh, setNeedRefresh] = useState(false);
  // The reload trigger returned by registerSW (no-op until a SW registers).
  const [updateSW, setUpdateSW] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    let cancelled = false;
    let registration: ServiceWorkerRegistration | undefined;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    function checkForUpdate(): void {
      if (cancelled || !registration) return;
      // registration.update() forces browser to bypass HTTP cache for sw.js +
      // re-evaluate. If a new SW is found, install lifecycle fires + onNeedRefresh
      // surfaces the banner. Silent no-op when nothing changed.
      void registration.update().catch(() => { /* graceful — offline or 404 */ });
    }

    function handleVisibility(): void {
      if (document.visibilityState === 'visible') checkForUpdate();
    }

    // Dynamic import so jsdom/SSR (no virtual module) degrades gracefully —
    // registerType:'prompt' means Workbox waits for our explicit reload.
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        if (cancelled) return;
        const update = registerSW({
          // Fires when a new SW is installed + waiting. We surface the banner
          // instead of reloading — the user taps "Actualizeaza" to apply.
          onNeedRefresh() {
            if (!cancelled) setNeedRefresh(true);
          },
          // Capture the registration so we can force update checks on
          // visibility/focus + periodic interval (see §SW-UPDATE-CHECK).
          onRegisteredSW(_swUrl, r) {
            if (cancelled || !r) return;
            registration = r;
            // Periodic check while app is open — 30min covers active sessions
            // without hammering the network. visibilitychange covers the
            // home-screen-icon return path.
            intervalId = setInterval(checkForUpdate, 30 * 60 * 1000);
            document.addEventListener('visibilitychange', handleVisibility);
            // Initial nudge in case the SW that registered moments ago is
            // already stale relative to the latest deploy on the network.
            checkForUpdate();
          },
        });
        setUpdateSW(() => update);
      })
      .catch(() => {
        // Virtual module unavailable (test/SSR) — fallback no-op, banner hidden.
      });
    return () => {
      cancelled = true;
      if (intervalId !== undefined) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Apply the waiting SW on explicit consent. Pass reloadPage:true so the page
  // reloads onto the new version (do NOT rely on the lib default — the prior
  // `updateSW()` no-arg call left the user on the stale page). On an INSTALLED
  // PWA (home-screen icon, scope never navigates) the controllerchange
  // auto-reload can fail to fire, so force a reload shortly after skipWaiting as
  // a safety net — a no-op if the page already reloaded (it's gone by then).
  function applyUpdate(): void {
    void Promise.resolve(updateSW?.(true)).catch(() => { /* graceful — offline */ });
    if (typeof window !== 'undefined') {
      setTimeout(() => { window.location.reload(); }, 1200);
    }
  }

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('updatePrompt.ariaLabel')}
      data-testid="update-prompt"
      className="animate-slide-down app-fixed-column app-fixed-column--inset fixed top-2 z-50 bg-paper2 border border-line rounded-xl shadow-lg p-3 flex items-center gap-3"
    >
      <RefreshCw className="w-4 h-4 text-brick flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">{t('updatePrompt.title')}</p>
        <p className="text-xs text-ink2">{t('updatePrompt.body')}</p>
      </div>
      <button
        type="button"
        onClick={applyUpdate}
        data-testid="update-prompt-cta"
        className="px-3 py-1.5 bg-brick text-paper rounded-lg text-xs font-semibold"
      >
        {t('updatePrompt.updateCta')}
      </button>
    </div>
  );
}
