// ══ SW UPDATE — PWA auto-update on launch (skip mid-session) ═════════════════
// Redesign 2026-06-02 (Daniel LOCKED) — replaces the floating UpdatePrompt
// banner. Behavior:
//   - Keep the existing auto-CHECK (registerSW + registration.update() on
//     launch, visibilitychange→visible, every 30min) — unchanged from the
//     prior UpdatePrompt component.
//   - Change the APPLY: when a new SW is detected (onNeedRefresh), if it is
//     SAFE (no ACTIVE workout session) → show a brief "Updating..." toast +
//     auto-apply (updateSW(true) → reload). User lands on the new version
//     automatically. NEVER interrupt training (Daniel verbatim: "if the person
//     is mid set... I don't care, it checks for it in the next deployment").
//   - If onNeedRefresh fires mid-active-session → DEFER (set a pending flag).
//     A waiting SW activates on the next cold open anyway; we also re-attempt
//     the deferred apply once the session ends (the next safe check applies it).
//   - Account "Check for updates & apply" button calls checkForUpdatesAndApply()
//     → registration.update() then applies (Daniel's dev/testing tool).
//
// Active-session detection: read the workout store (sessionStart !== null =
// live session, the same signal SessionPill / getCurrentMode use for
// 'active'/'resting'). A PAUSED snapshot is NOT a live session (user stepped
// away / is browsing) → safe to apply. We read the store imperatively
// (getState) at the moment of the event, NOT via a hook subscription, because
// the SW callback fires outside React render.
//
// vite.config keeps registerType:'prompt' — the SW WAITS; WE decide when to
// apply. The apply path mirrors the recent UpdatePrompt fix: updateSW(true)
// (explicit reloadPage) + an installed-PWA safety-net reload (~1.2s after
// skipWaiting) because controllerchange can be flaky on an installed PWA.
//
// jsdom/SSR: `virtual:pwa-register` is a Vite-injected virtual module absent on
// disk → the dynamic import rejects → caught → graceful no-op (no crash, no
// toast). vitest aliases it to a stub (vitest.config.js).

/// <reference types="vite-plugin-pwa/client" />
import { useEffect } from 'react';
import { useWorkoutStore } from '../stores/workoutStore';
import { toast } from './toast';
import { t } from '../../i18n/index.js';

type UpdateSW = (reloadPage?: boolean) => Promise<void>;

// Module-level handles so BOTH the auto-apply path and the Account button reach
// the same registration + updateSW after the (single) registerSW call.
let updateSWHandle: UpdateSW | null = null;
let swRegistration: ServiceWorkerRegistration | undefined;
// A new SW was detected while a session was active — apply it at the next safe
// opportunity (session end / next launch / Account button).
let pendingUpdate = false;
let registered = false;

// A live workout session is in progress (mid-set). Mirrors getCurrentMode's
// 'active'/'resting' modes: sessionStart !== null. A paused snapshot is NOT
// live (sessionStart is null while paused) → safe to apply.
function isSessionActive(): boolean {
  return useWorkoutStore.getState().sessionStart !== null;
}

// Apply the waiting SW + reload onto the new version. Mirrors the recent
// UpdatePrompt fix: pass reloadPage:true (do NOT rely on the lib default) +
// force a reload ~1.2s after skipWaiting as a safety net for installed PWAs
// where controllerchange can fail to fire (a no-op if the page already
// reloaded — it's gone by then).
function applyUpdate(): void {
  void Promise.resolve(updateSWHandle?.(true)).catch(() => { /* graceful — offline */ });
  if (typeof window !== 'undefined') {
    setTimeout(() => { window.location.reload(); }, 1200);
  }
}

// Show the brief, non-blocking "Updating..." indicator, then apply.
function showUpdatingToastThenApply(): void {
  toast.show({ message: t('swUpdate.updating'), variant: 'info' });
  applyUpdate();
}

// A new SW is waiting. Apply now if safe; otherwise defer until the session
// ends / next launch.
function handleNeedRefresh(): void {
  if (isSessionActive()) {
    pendingUpdate = true;
    return;
  }
  showUpdatingToastThenApply();
}

// Account button (Daniel dev/testing tool): force a check then apply. We bump
// pendingUpdate first so that if the network check surfaces a new SW via
// onNeedRefresh (async), the safe-apply still fires; and if a SW is ALREADY
// waiting (pendingUpdate set earlier, or registration.waiting present) we apply
// immediately. Graceful no-op in jsdom (no registration).
export function checkForUpdatesAndApply(): void {
  if (!swRegistration) return;
  void swRegistration.update().catch(() => { /* graceful — offline or 404 */ });
  // Apply right away — registration.update() already kicked the check; the
  // waiting SW (if any) applies, and if a brand-new one installs onNeedRefresh
  // will safe-apply it too. This button is the explicit "I want it now" path.
  showUpdatingToastThenApply();
}

// Persistent app-level registration + periodic-check hook. Mount ONCE at the
// app shell (Layout). Replaces the floating UpdatePrompt banner. Subsequent
// mounts are no-ops (registered guard) so a remount never double-registers.
export function useSwUpdate(): void {
  useEffect(() => {
    if (registered) return;
    registered = true;

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    function checkForUpdate(): void {
      if (cancelled || !swRegistration) return;
      // Forces the browser to bypass the HTTP cache for sw.js + re-evaluate.
      // A new SW → install lifecycle → onNeedRefresh. Silent no-op otherwise.
      void swRegistration.update().catch(() => { /* graceful — offline or 404 */ });
    }

    function handleVisibility(): void {
      if (document.visibilityState === 'visible') {
        // If an update was deferred mid-session, retry the safe-apply on return
        // (the session may have ended). Otherwise just re-check.
        if (pendingUpdate && !isSessionActive()) {
          pendingUpdate = false;
          showUpdatingToastThenApply();
          return;
        }
        checkForUpdate();
      }
    }

    // Dynamic import so jsdom/SSR (no virtual module) degrades gracefully.
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        if (cancelled) return;
        const update = registerSW({
          onNeedRefresh() {
            if (!cancelled) handleNeedRefresh();
          },
          onRegisteredSW(_swUrl, r) {
            if (cancelled || !r) return;
            swRegistration = r;
            // Periodic check while app open — 30min (covers active sessions
            // without hammering the network). visibilitychange covers the
            // home-screen-icon return path for installed PWAs.
            intervalId = setInterval(checkForUpdate, 30 * 60 * 1000);
            document.addEventListener('visibilitychange', handleVisibility);
            // Initial nudge — the SW that registered moments ago may already be
            // stale relative to the latest deploy on the network.
            checkForUpdate();
          },
        });
        updateSWHandle = update;
      })
      .catch(() => {
        // Virtual module unavailable (test/SSR) — graceful no-op.
      });

    return () => {
      cancelled = true;
      if (intervalId !== undefined) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);
}

// Test-only reset of the module-level singletons (vitest resetModules does not
// reset live bindings within an already-imported module across re-renders in
// the same file). Not exported for app code.
export function __resetSwUpdateForTests(): void {
  updateSWHandle = null;
  swRegistration = undefined;
  pendingUpdate = false;
  registered = false;
}
