// ══ NETWORK STATUS — §36-H4 useNetworkStatus + captive portal detect ═════
// Wave 2d HIGH-IOTA — hotel/airport WiFi blocks ALL outbound except portal
// host until ToS accept. `navigator.onLine === true` (radio link present), but
// fetch to real endpoint returns HTML login page sau 4xx/5xx instead of JSON.
// Without indicator, user sees stale data + "syncing..." spinner forever.
//
// Detection strategy MVP: fetch known-good Firebase REST endpoint (FIREBASE_URL
// /.json) cu HEAD method + 5s AbortSignal timeout. Expected: 200 + JSON
// content-type. Captive portal: typically returns 200 + text/html (login page)
// SAU 302 redirect. Treat any non-JSON or timeout as captive=true.
//
// Hook returns `{ online, captive }`. Consumer (CaptivePortalBanner) renders
// banner when `online && captive`. Pure offline `!online` handled separately
// by existing OfflineBanner per §13-M3.
//
// Cross-refs:
//   - ADR 002 — Firebase REST (probe endpoint matches sync target)
//   - §13-M3 OfflineBanner pattern — separate concerns

import { useEffect, useState } from 'react';
import { FIREBASE_URL } from '../../firebase.js';

export interface NetworkStatus {
  online: boolean;
  /** True when navigator.onLine=true but reachability fails (captive portal). */
  captive: boolean;
}

const PROBE_TIMEOUT_MS = 5_000;
const PROBE_INTERVAL_MS = 60_000; // every 60s polling — minimal battery cost

/**
 * Probe FIREBASE_URL `.json` HEAD endpoint. Returns true if reachable + JSON
 * content (NOT captive portal redirect/login). Fail-silent on timeout/network.
 */
async function probeReachability(): Promise<boolean> {
  if (typeof fetch === 'undefined') return false;
  try {
    const signal = AbortSignal.timeout(PROBE_TIMEOUT_MS);
    // FIREBASE_URL root + `.json` shallow read — RTDB returns `null` if no
    // rule violation, JSON content-type. Captive portal returns HTML.
    const r = await fetch(`${FIREBASE_URL}/.json?shallow=true`, {
      method: 'GET',
      cache: 'no-store',
      signal,
    });
    if (!r.ok) return false;
    const contentType = r.headers.get('content-type') ?? '';
    return contentType.toLowerCase().includes('application/json');
  } catch {
    return false;
  }
}

/**
 * useNetworkStatus — React hook for online + captive-portal awareness.
 *
 * - Subscribes to window online/offline events for instant transition.
 * - Probes reachability cand transitioning to online (poate fi captive).
 * - Periodic poll PROBE_INTERVAL_MS while online but only when document.visible
 *   (skip background battery cost).
 */
export function useNetworkStatus(): NetworkStatus {
  const [online, setOnline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine !== false;
  });
  const [captive, setCaptive] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    /** @type {ReturnType<typeof setInterval> | null} */
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function runProbe(): Promise<void> {
      if (cancelled) return;
      const reachable = await probeReachability();
      if (!cancelled) setCaptive(!reachable);
    }

    function handleOnline(): void {
      setOnline(true);
      void runProbe();
    }
    function handleOffline(): void {
      setOnline(false);
      setCaptive(false); // No probe sense when offline radio
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial probe if online at mount
    if (online) void runProbe();

    // Periodic only when document visible (skip bg battery)
    function startInterval(): void {
      if (intervalId !== null) return;
      intervalId = setInterval(() => {
        if (online && document.visibilityState === 'visible') void runProbe();
      }, PROBE_INTERVAL_MS);
    }
    function stopInterval(): void {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
    function handleVis(): void {
      if (document.visibilityState === 'visible') startInterval();
      else stopInterval();
    }

    if (typeof document !== 'undefined') {
      if (document.visibilityState === 'visible') startInterval();
      document.addEventListener('visibilitychange', handleVis);
    }

    return () => {
      cancelled = true;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVis);
      }
      stopInterval();
    };
    // online intentional dep — re-bind initial probe when transition.
  }, [online]);

  return { online, captive };
}
