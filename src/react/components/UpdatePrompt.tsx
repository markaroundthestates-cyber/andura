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
// jsdom test environment: `virtual:pwa-register` is a Vite-injected virtual
// module absent on disk, so the dynamic import rejects → caught → the no-op
// fallback persists (banner never shows in tests, mount never throws).

/// <reference types="vite-plugin-pwa/client" />
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export function UpdatePrompt(): JSX.Element | null {
  const [needRefresh, setNeedRefresh] = useState(false);
  // The reload trigger returned by registerSW (no-op until a SW registers).
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    let cancelled = false;
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
        });
        setUpdateSW(() => update);
      })
      .catch(() => {
        // Virtual module unavailable (test/SSR) — fallback no-op, banner hidden.
      });
    return () => { cancelled = true; };
  }, []);

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Versiune noua disponibila"
      data-testid="update-prompt"
      className="animate-slide-down app-fixed-column app-fixed-column--inset fixed top-2 z-50 bg-paper2 border border-line rounded-xl shadow-lg p-3 flex items-center gap-3"
    >
      <RefreshCw className="w-4 h-4 text-brick flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">Versiune noua</p>
        <p className="text-xs text-ink2">Actualizeaza pentru ultimele fix-uri.</p>
      </div>
      <button
        type="button"
        onClick={() => { void updateSW?.(); }}
        data-testid="update-prompt-cta"
        className="px-3 py-1.5 bg-brick text-paper rounded-lg text-xs font-semibold"
      >
        Actualizeaza
      </button>
    </div>
  );
}
