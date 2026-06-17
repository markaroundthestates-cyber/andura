'use strict';

// Andura FCM push scheduler - Cloud Functions v2 (Gen 2).
// Runs every 15 minutes in Europe/Bucharest, reads each user's
// notificationPrefs + fcmTokens from RTDB, and sends a daily training
// reminder (and a Sunday-evening weekly summary) via FCM multicast.
//
// All scheduling logic lives in ./scheduler.js as PURE functions (unit-tested
// with node --test). This file is the thin I/O shell: read RTDB, decide via
// isDueNow / isWeeklySummaryDue, send, then prune dead tokens.

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');

const {
  isDueNow,
  isWeeklySummaryDue,
  isDailyCoachDue,
  isSessionMissedDue,
  DAILY_REMINDER,
  WEEKLY_SUMMARY,
  DAILY_COACH,
  SESSION_MISSED,
} = require('./scheduler');

const { selectExpiredUids } = require('./deletionGrace');

admin.initializeApp();

// FCM error codes that mean the token is permanently dead -> delete it.
const DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

/**
 * Send a notification to a user's tokens and prune any that FCM reports as
 * permanently invalid.
 * @param {string} uid
 * @param {string[]} tokens
 * @param {{ title: string, body: string }} message
 */
async function sendAndPrune(uid, tokens, message) {
  if (!tokens.length) return;

  const res = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title: message.title, body: message.body },
    // §notif-tap — deep-link carried on data.link; the FCM SW
    // (public/firebase-messaging-sw.js notificationclick) routes the tap to the
    // Antrenor tab (daily-coach nudge) instead of being a dead tap.
    data: { link: '/antrenor' },
  });

  const deletions = {};
  res.responses.forEach((r, i) => {
    if (!r.success && r.error && DEAD_TOKEN_CODES.has(r.error.code)) {
      // Build a multi-location update to remove dead tokens in one write.
      deletions[`users/${uid}/fcmTokens/${tokens[i]}`] = null;
    }
  });

  const deadCount = Object.keys(deletions).length;
  if (deadCount > 0) {
    await admin.database().ref().update(deletions);
  }

  logger.info('fcm-send', {
    uid,
    sent: res.successCount,
    failed: res.failureCount,
    pruned: deadCount,
  });
}

exports.scheduledPushNotifications = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'Europe/Bucharest',
    region: 'europe-west1',
    retryCount: 0,
  },
  async () => {
    const now = new Date();
    const snap = await admin.database().ref('users').once('value');
    const users = snap.val();
    if (!users) {
      logger.info('fcm-scheduler: no users');
      return;
    }

    const jobs = [];
    let dueDaily = 0;
    let dueWeekly = 0;
    let dueCoach = 0;
    let dueMissed = 0;

    for (const uid of Object.keys(users)) {
      const user = users[uid];
      if (!user) continue;

      const prefs = user.notificationPrefs;
      if (!prefs || prefs.enabled !== true) continue;

      const tokenMap = user.fcmTokens;
      if (!tokenMap) continue;
      const tokens = Object.keys(tokenMap).filter((t) => tokenMap[t] === true);
      if (!tokens.length) continue;

      // logs is a SYNC_KEY (users/{uid}/logs) — needed for the session-missed
      // signal. Array of session rows, each carrying a 'date' ('YYYY-MM-DD').
      const logs = Array.isArray(user.logs) ? user.logs : [];

      // else-if chain: never double-notify a user in the same tick. The fixed
      // slots cannot collide (daily-coach 07:30 vs weekly-summary Sun 19:00 vs
      // the user's reminder time vs reminder+grace), but the chain is the safety.
      if (isDueNow(prefs, now)) {
        dueDaily++;
        jobs.push(sendAndPrune(uid, tokens, DAILY_REMINDER));
      } else if (isDailyCoachDue(prefs, now)) {
        dueCoach++;
        jobs.push(sendAndPrune(uid, tokens, DAILY_COACH));
      } else if (isSessionMissedDue(prefs, now, logs)) {
        dueMissed++;
        jobs.push(sendAndPrune(uid, tokens, SESSION_MISSED));
      } else if (isWeeklySummaryDue(prefs, now)) {
        dueWeekly++;
        jobs.push(sendAndPrune(uid, tokens, WEEKLY_SUMMARY));
      }
    }

    await Promise.allSettled(jobs);
    logger.info('fcm-scheduler tick done', {
      users: Object.keys(users).length,
      dueDaily,
      dueCoach,
      dueMissed,
      dueWeekly,
    });
  }
);

// ── §56.5.2 account-deletion 30-day grace purge ──────────────────────────────
// Daily backstop for the client soft-delete. Scans users/*/account/
// deletionRequestedAt and HARD-deletes any user whose marker is >= 30 days old:
//   1. DELETE the RTDB node users/{uid} (the retained backup).
//   2. admin.auth().deleteUser(uid) (the Firebase Auth account).
// Idempotent, logged, defensive: selectExpiredUids skips any user without an
// aged, well-formed marker, so a user is NEVER purged without one. Per-uid
// errors are isolated (Promise.allSettled) so one failure never blocks the rest;
// a still-present marker is simply retried on the next daily run.

// FCM-style: cron at 03:15 Europe/Bucharest daily (off-peak; the schedule
// string accepts App Engine cron syntax). Single Cloud Scheduler job.
const DELETION_PURGE_SCHEDULE = 'every day 03:15';

/**
 * Hard-delete one user (RTDB node + Auth account). Auth deletion tolerates an
 * already-removed account (user-not-found) so a partially-completed prior run
 * re-converges cleanly. Returns true on full success.
 * @param {string} uid
 * @returns {Promise<boolean>}
 */
async function purgeUser(uid) {
  await admin.database().ref(`users/${uid}`).remove();
  try {
    await admin.auth().deleteUser(uid);
  } catch (err) {
    // Idempotent: a prior run (or a manual delete) may have already removed the
    // Auth record. Anything else re-throws so the marker survives for a retry.
    if (err && err.code === 'auth/user-not-found') {
      logger.info('deletion-grace: auth user already gone', { uid });
    } else {
      throw err;
    }
  }
  return true;
}

exports.scheduledAccountDeletionPurge = onSchedule(
  {
    schedule: DELETION_PURGE_SCHEDULE,
    timeZone: 'Europe/Bucharest',
    region: 'europe-west1',
    retryCount: 0,
  },
  async () => {
    const now = Date.now();
    const snap = await admin.database().ref('users').once('value');
    const users = snap.val();
    const expired = selectExpiredUids(users, now);
    if (!expired.length) {
      logger.info('deletion-grace: nothing due', {
        scanned: users ? Object.keys(users).length : 0,
      });
      return;
    }

    const results = await Promise.allSettled(expired.map((uid) => purgeUser(uid)));
    let purged = 0;
    let failed = 0;
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        purged++;
        logger.info('deletion-grace: purged', { uid: expired[i] });
      } else {
        failed++;
        logger.error('deletion-grace: purge failed (will retry next run)', {
          uid: expired[i],
          error: r.reason && r.reason.message ? r.reason.message : String(r.reason),
        });
      }
    });
    logger.info('deletion-grace tick done', { due: expired.length, purged, failed });
  }
);
