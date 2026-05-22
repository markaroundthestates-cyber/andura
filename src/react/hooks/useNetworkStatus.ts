// == USE NETWORK STATUS HOOK -- audit-§36-M5 surgical extract =================
// Pure listener pattern (NO polling, NO setInterval — per audit §36 LOW-L3
// preserved). Wraps window.online/offline events + initial navigator.onLine
// snapshot.
//
// Tagged transition state pentru ReconnectBanner UX feedback (§36-M6):
//   - 'online'     : steady-state, was-online previously
//   - 'offline'    : steady-state, currently offline
//   - 'reconnected': transient (~3s) post offline -> online flip
//
// Audit-§36 lineage:
//   §36-M5 — navigator.onLine + actual ping (extract hook from inline
//     OfflineBanner useEffect). NO ping here — pure event-driven (ping
//     deferred §36-H4 captive portal detection if needed).
//   §36-M6 — Reconnect UX banner. Hook exposes 'reconnected' status pentru
//     transient feedback layer to render.
//
// SSR/jsdom safe: navigator/window absent -> defaults online + listeners
// skip.

import { useEffect, useRef, useState } from 'react';

export type NetworkStatus = 'online' | 'offline' | 'reconnected';

const RECONNECT_FLASH_MS = 3000; // §36-M6 transient banner duration

/**
 * Subscribes to window online/offline events + emits transient 'reconnected'
 * status on offline -> online transition for ~3s.
 *
 * @returns Current network status ('online' | 'offline' | 'reconnected').
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    if (typeof navigator === 'undefined') return 'online';
    return navigator.onLine === false ? 'offline' : 'online';
  });

  // Track if we were offline previously to detect reconnection edge.
  const wasOfflineRef = useRef<boolean>(
    typeof navigator !== 'undefined' && navigator.onLine === false,
  );

  // Hold reconnect-flash timer so we can cancel on unmount + on re-offline.
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearFlash(): void {
      if (flashTimerRef.current !== null) {
        clearTimeout(flashTimerRef.current);
        flashTimerRef.current = null;
      }
    }

    function handleOnline(): void {
      if (wasOfflineRef.current) {
        // Edge: offline -> online. Transient feedback for §36-M6.
        wasOfflineRef.current = false;
        setStatus('reconnected');
        clearFlash();
        flashTimerRef.current = setTimeout(() => {
          flashTimerRef.current = null;
          setStatus('online');
        }, RECONNECT_FLASH_MS);
      } else {
        setStatus('online');
      }
    }

    function handleOffline(): void {
      wasOfflineRef.current = true;
      clearFlash(); // cancel pending 'online' transition if user flapped
      setStatus('offline');
    }

    if (typeof window === 'undefined') return undefined;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearFlash();
    };
  }, []);

  return status;
}
