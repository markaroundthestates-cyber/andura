// ══ OFFLINE BANNER — §13-M3 visible network status ════════════════════════
// Listens to window online/offline events. Renders fixed top-of-screen
// banner when offline. PWA still functional (Service Worker cache),
// banner signals user "syncing paused — actions queued local".
//
// ARIA live region 'polite' for screen readers.

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner(): JSX.Element | null {
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return false;
    return navigator.onLine === false;
  });

  useEffect(() => {
    function handleOnline(): void {
      setIsOffline(false);
    }
    function handleOffline(): void {
      setIsOffline(true);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      data-testid="offline-banner"
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 bg-ink2 text-paper px-4 py-2 flex items-center justify-center gap-2 text-sm"
    >
      <WifiOff className="w-4 h-4" aria-hidden="true" />
      <span>Esti offline — datele se salveaza local. Sync reluat la conexiune.</span>
    </div>
  );
}
