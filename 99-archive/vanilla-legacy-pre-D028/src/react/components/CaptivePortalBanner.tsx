// ══ CAPTIVE PORTAL BANNER — §36-H4 hotel/airport WiFi indicator ════════════
// Renders fixed top-of-screen banner when `online && captive` (network shows
// connected but sync fails — typical captive portal not yet accepted ToS).
//
// Distinct de OfflineBanner (§13-M3): OfflineBanner = `!online`, this =
// `online && captive`. Different message: instruct user to open browser tab
// + accept WiFi terms.
//
// ARIA live region 'polite' for screen readers.

import type { JSX } from 'react';
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../lib/networkStatus';

export function CaptivePortalBanner(): JSX.Element | null {
  const { online, captive } = useNetworkStatus();
  if (!online || !captive) return null;

  return (
    <div
      data-testid="captive-portal-banner"
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 bg-brick text-paper px-4 py-2 flex items-center justify-center gap-2 text-sm"
    >
      <WifiOff className="w-4 h-4" aria-hidden="true" />
      <span>WiFi limitat — deschide browser-ul si accepta termenii retelei.</span>
    </div>
  );
}
