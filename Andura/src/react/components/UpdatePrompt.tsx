// ══ UPDATE PROMPT — Phase 6 task_21 PWA Service Worker New Version ═══════
// Detects new SW version via vite-plugin-pwa virtual module + surfaces
// banner cu "Actualizeaza" CTA. ZERO auto-reload (user explicit consent —
// Maria 65 anti-paternalism, NU rip mid-action).
//
// jsdom test environment: virtual module unavailable → safe fallback to
// noop hook (returns needRefresh=false always). Defensive try/catch on
// dynamic import.

/// <reference types="vite-plugin-pwa/react" />
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface RegisterSWReturn {
  needRefresh: [boolean, (v: boolean) => void];
  offlineReady: [boolean, (v: boolean) => void];
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
}

// Stub fallback când virtual:pwa-register/react NU disponibil (test/SSR).
const FALLBACK: RegisterSWReturn = {
  needRefresh: [false, () => {}],
  offlineReady: [false, () => {}],
  updateServiceWorker: async () => {},
};

export function UpdatePrompt(): JSX.Element | null {
  const [state, setState] = useState<RegisterSWReturn>(FALLBACK);

  useEffect(() => {
    // Phase 6 task_21 V1: passive listener pentru SW update event.
    // Production: vite-plugin-pwa registers SW + dispatches 'sw-updated'
    // event. Test/jsdom: NU dispatch → fallback no-op preserved.
    function handleUpdate(): void {
      setState((prev) => ({
        ...prev,
        needRefresh: [true, prev.needRefresh[1]],
        updateServiceWorker: async (reload?: boolean) => {
          if (reload && typeof window !== 'undefined') {
            window.location.reload();
          }
        },
      }));
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('sw-updated', handleUpdate);
      return () => window.removeEventListener('sw-updated', handleUpdate);
    }
    return undefined;
  }, []);

  const [needRefresh] = state.needRefresh;
  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-label="Versiune noua disponibila"
      data-testid="update-prompt"
      className="fixed top-2 left-2 right-2 z-50 bg-paper2 border border-line rounded-xl shadow-lg p-3 flex items-center gap-3"
    >
      <RefreshCw className="w-4 h-4 text-brick flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">Versiune noua</p>
        <p className="text-xs text-ink2">Actualizeaza pentru ultimele fix-uri.</p>
      </div>
      <button
        type="button"
        onClick={() => { void state.updateServiceWorker(true); }}
        data-testid="update-prompt-cta"
        className="px-3 py-1.5 bg-brick text-paper rounded-lg text-xs font-semibold"
      >
        Actualizeaza
      </button>
    </div>
  );
}
