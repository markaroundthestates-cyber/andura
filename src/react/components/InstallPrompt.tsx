// ══ INSTALL PROMPT — §7-H5 PWA installable banner ═════════════════════════
// Capture `beforeinstallprompt` event (Chromium/Edge desktop+Android) +
// surface "Instaleaza Andura" CTA. Once dismissed, store flag localStorage
// pentru a NU re-prompt aceeași sesiune (Daniel anti-paternalism).
//
// iOS Safari: no beforeinstallprompt event — fallback hidden (post-Beta
// detect navigator.standalone + instructional copy "Apasa share > Add to
// Home Screen").

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'wv2-install-prompt-dismissed';

export function InstallPrompt(): JSX.Element | null {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    function handler(e: Event): void {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall(): Promise<void> {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    const choice = await deferredEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredEvent(null);
    }
  }

  function handleDismiss(): void {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // localStorage unavailable — in-memory dismiss only
    }
    setDismissed(true);
    setDeferredEvent(null);
  }

  if (dismissed || !deferredEvent) return null;

  return (
    // E2E-01: outer fixed layer spans left-3/right-3 but is pointer-events-none
    // so its (mostly transparent) footprint does NOT intercept taps on content
    // beneath (e.g. Istoric session rows). Only the visible card re-enables
    // pointer events. Mirrors the ToastViewport overlay idiom (Toast.tsx).
    <div className="fixed bottom-20 left-3 right-3 z-40 pointer-events-none">
      <div
        data-testid="install-prompt"
        role="region"
        aria-live="polite"
        aria-label="Instaleaza Andura"
        className="pointer-events-auto bg-paper2 border border-line rounded-xl p-3 flex items-center gap-3 shadow-lg"
      >
        <div className="w-10 h-10 rounded-lg bg-brick/10 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-brick" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">Instaleaza Andura</p>
          <p className="text-xs text-ink2">Acces rapid din ecranul de start.</p>
        </div>
        <button
          type="button"
          onClick={() => { void handleInstall(); }}
          data-testid="install-prompt-accept"
          className="px-3 py-2 bg-brick text-paper rounded-lg text-xs font-semibold"
        >
          Instaleaza
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          data-testid="install-prompt-dismiss"
          aria-label="Inchide"
          className="p-2 text-ink2"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
