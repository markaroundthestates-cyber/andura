// ══ OFFLINE BANNER — §13-M3 visible network status ════════════════════════
// Network state banner cu 3 stari surfacate via useNetworkStatus hook
// (audit §36-M5 extracted):
//   - online      : NU render
//   - offline     : steady banner "Esti offline ..."
//   - reconnected : transient ~3s "Reconectat" feedback (audit §36-M6)
//
// PWA still functional (Service Worker cache); banner signals user
// "syncing paused — actions queued local" + "back online" confirmation.
//
// ARIA live region 'polite' for screen readers.

import type { JSX } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineBanner(): JSX.Element | null {
  const status = useNetworkStatus();

  if (status === 'online') return null;

  if (status === 'reconnected') {
    // §36-M6 transient feedback — confirm reconnect (~3s via hook timer).
    // Wave C3 — slides down from top (260ms cubic-bezier), success green
    // surface reads "we're back" the moment it lands. Icon scale-in for
    // a tiny confirmation pop.
    return (
      <div
        data-testid="offline-banner"
        data-state="reconnected"
        role="status"
        aria-live="polite"
        className="animate-slide-down app-fixed-column fixed top-0 z-50 bg-succ text-paper px-4 py-2 flex items-center justify-center gap-2 text-sm"
      >
        <Wifi className="w-4 h-4 animate-scale-in" aria-hidden="true" />
        <span>Reconectat - sync reluat.</span>
      </div>
    );
  }

  // status === 'offline'
  return (
    <div
      data-testid="offline-banner"
      data-state="offline"
      role="status"
      aria-live="polite"
      className="animate-slide-down app-fixed-column fixed top-0 z-50 bg-ink2 text-paper px-4 py-2 flex items-center justify-center gap-2 text-sm"
    >
      <WifiOff className="w-4 h-4" aria-hidden="true" />
      <span>Esti offline — datele se salveaza local. Sync reluat la conexiune.</span>
    </div>
  );
}
