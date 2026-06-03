// ══ REST NOTIFICATION — OS background rest-timer (W-Final, D103 flagship) ════
// The in-app SVG countdown (RestOverlay) is the foreground UI; this is the
// BACKGROUND guarantee. When a rest starts, we schedule ONE local notification
// to fire at rest-end so the user is alerted even when the app is backgrounded
// (mid-TikTok). It is cancelled the moment the rest ends early (skip / next-set /
// session end) so a stale buzz never fires after the user is already lifting.
//
// Web/jest guard: expo-notifications is a native module — `Platform.OS === 'web'`
// (and jest, which runs the RN preset but has no native scheduler) must no-op so
// `expo export -p web` and the jest suite don't touch the native bridge. Every
// public fn early-returns on web and swallows scheduler errors (a denied
// permission must never break the workout FSM).

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { t } from '../../src/i18n/index.js';

// One outstanding rest notification at a time — the FSM only ever rests once.
let scheduledId: string | null = null;
let permissionAsked = false;

const isNative = Platform.OS !== 'web';

// Present the rest-end alert even when the app is foregrounded (iOS suppresses
// foreground notifications by default). If the user is staring at the in-app
// countdown the OS banner is harmless; the point is it ALSO fires when they're
// backgrounded. Set once at module load, web/jest-guarded.
if (isNative) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // Soft-fail — handler is best-effort.
  }
}

/**
 * Ask for notification permission once, gracefully. Returns true if granted.
 * A denied/undetermined result is fine — we just skip the background buzz and
 * keep the in-app countdown. Safe to call repeatedly (only prompts once).
 */
export async function ensureRestNotifPermission(): Promise<boolean> {
  if (!isNative) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (permissionAsked && !current.canAskAgain) return false;
    permissionAsked = true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

/**
 * Schedule a single local notification to fire in `seconds`. Cancels any prior
 * rest notification first (defensive — the FSM only rests once at a time). A
 * non-positive duration is a no-op (nothing to wait for).
 *
 * @param seconds rest duration remaining until the alert should fire.
 */
export async function scheduleRestEndNotification(seconds: number): Promise<void> {
  if (!isNative || !Number.isFinite(seconds) || seconds <= 0) return;
  try {
    await cancelRestEndNotification();
    const granted = await ensureRestNotifPermission();
    if (!granted) return;
    scheduledId = await Notifications.scheduleNotificationAsync({
      content: {
        title: t('restOverlay.notifTitle'),
        body: t('restOverlay.notifBody'),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.round(seconds),
      },
    });
  } catch {
    // Soft-fail: scheduling must never break the in-app rest timer.
    scheduledId = null;
  }
}

/**
 * Cancel the outstanding rest notification (early skip / next-set / session end /
 * screen unmount). Idempotent — safe when nothing is scheduled.
 */
export async function cancelRestEndNotification(): Promise<void> {
  if (!isNative || scheduledId === null) return;
  const id = scheduledId;
  scheduledId = null;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Soft-fail.
  }
}
