// ══ EXPO-UPDATES (OTA) — RN twin of src/react/lib/swUpdate.ts §D102 ═════════
// Mirrors the PWA update policy on native:
//   - AUTO-CHECK at LAUNCH (wired in mobile/app/_layout.tsx boot).
//   - APPLY (Updates.reloadAsync) ONLY when there is NO active workout session
//     (workoutStore.sessionStart === null) — NEVER interrupt training (Daniel
//     verbatim: "if the person is mid set... it checks for it in the next
//     deployment"). A PAUSED snapshot is NOT a live session (sessionStart is null
//     while paused) → safe to apply.
//   - If an update is available mid-session → DEFER (pending flag) + re-attempt
//     the safe-apply once the session ENDS (we subscribe to the store).
//   - The Account "Check for updates & apply" row calls checkAndMaybeApply()
//     with user feedback (toast) — Daniel's explicit dev/testing tool.
//
// GUARDS (so `expo export -p web` + jest + Expo Go dev never break):
//   - Platform.OS === 'web' → no-op (the web has its own swUpdate.ts SW flow).
//   - !Updates.isEnabled (dev client / Expo Go / EAS Update not configured) →
//     graceful no-op. The code is ready; the OTA channel is Daniel-gated
//     (eas update:configure + project id + runtimeVersion policy).
//
// Until Daniel runs `eas update:configure`, Updates.isEnabled is false at
// runtime, so every entry point below is an intentional no-op — no crash.

import { Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { useWorkoutStore } from '../../src/react/stores/workoutStore';
import { toast } from '../../src/react/lib/toast';
import { t } from '../../src/i18n/index.js';

// An update was fetched while a session was active — apply at the next safe
// opportunity (session end / next launch / manual button).
let pendingApply = false;
// Single store subscription guard (launch wiring mounts once).
let sessionWatchUnsub: (() => void) | null = null;

// OTA is usable: native platform + Updates runtime enabled (EAS Update
// configured AND not a dev client). False on web, in Expo Go, and until Daniel
// runs `eas update:configure`.
function otaEnabled(): boolean {
  return Platform.OS !== 'web' && Updates.isEnabled;
}

// A live workout session is in progress (mid-set). Mirrors swUpdate.ts
// isSessionActive(): sessionStart !== null. Paused snapshot → sessionStart null
// → safe to apply.
function isSessionActive(): boolean {
  return useWorkoutStore.getState().sessionStart !== null;
}

// Apply the already-fetched update + reload onto the new bundle. Graceful on
// any failure (offline / mid-fetch race).
async function applyFetchedUpdate(): Promise<void> {
  try {
    await Updates.reloadAsync();
  } catch {
    // Soft-fail — stays on the current bundle; next launch retries.
  }
}

// Watch the workout store; when a deferred update exists and the session ends
// (sessionStart back to null), apply it. Subscribed once, lazily, only after a
// deferral so we don't pay for it on the happy path.
function ensureSessionEndWatcher(): void {
  if (sessionWatchUnsub) return;
  sessionWatchUnsub = useWorkoutStore.subscribe((state) => {
    if (pendingApply && state.sessionStart === null) {
      pendingApply = false;
      sessionWatchUnsub?.();
      sessionWatchUnsub = null;
      void applyFetchedUpdate();
    }
  });
}

/**
 * Check for an OTA update; if one is available, fetch it and apply (reload) ONLY
 * when no workout session is active — otherwise defer until the session ends.
 *
 * @param opts.notify when true (manual Account-button path), surface toast
 *   feedback (updating / up-to-date / deferred / error). Launch auto-check runs
 *   silent (notify omitted) — same as the web SW launch check.
 */
export async function checkAndMaybeApply(opts: { notify?: boolean } = {}): Promise<void> {
  const { notify = false } = opts;
  if (!otaEnabled()) {
    // Dev / Expo Go / web / not-yet-configured. The manual button still gives
    // feedback so the user is not left wondering.
    if (notify) toast.show({ message: t('swUpdate.upToDate'), variant: 'info' });
    return;
  }

  try {
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) {
      if (notify) toast.show({ message: t('swUpdate.upToDate'), variant: 'info' });
      return;
    }

    await Updates.fetchUpdateAsync();

    if (isSessionActive()) {
      // Mid-set — defer. Re-apply on session end (and next launch picks it up
      // anyway). Manual button: tell the user it's queued.
      pendingApply = true;
      ensureSessionEndWatcher();
      if (notify) toast.show({ message: t('swUpdate.deferred'), variant: 'info' });
      return;
    }

    if (notify) toast.show({ message: t('swUpdate.updating'), variant: 'info' });
    await applyFetchedUpdate();
  } catch {
    // Offline / check failed — graceful. Only the explicit button reports it.
    if (notify) toast.show({ message: t('swUpdate.checkFailed'), variant: 'error' });
  }
}

/**
 * Launch-time auto-check. Wire ONCE into the app boot (root _layout). Silent
 * (no toast) — mirrors the web SW launch check. Fire-and-forget; never blocks
 * render, never throws (checkAndMaybeApply swallows its own errors).
 */
export function runLaunchUpdateCheck(): void {
  if (!otaEnabled()) return;
  void checkAndMaybeApply();
}

// Test-only reset of the module-level singletons (jest resetModules does not
// reset live bindings within an already-imported module). Not for app code.
export function __resetUpdatesForTests(): void {
  pendingApply = false;
  sessionWatchUnsub?.();
  sessionWatchUnsub = null;
}
