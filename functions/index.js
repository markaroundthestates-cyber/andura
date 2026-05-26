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
  DAILY_REMINDER,
  WEEKLY_SUMMARY,
} = require('./scheduler');

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

    for (const uid of Object.keys(users)) {
      const user = users[uid];
      if (!user) continue;

      const prefs = user.notificationPrefs;
      if (!prefs || prefs.enabled !== true) continue;

      const tokenMap = user.fcmTokens;
      if (!tokenMap) continue;
      const tokens = Object.keys(tokenMap).filter((t) => tokenMap[t] === true);
      if (!tokens.length) continue;

      if (isDueNow(prefs, now)) {
        dueDaily++;
        jobs.push(sendAndPrune(uid, tokens, DAILY_REMINDER));
      } else if (isWeeklySummaryDue(prefs, now)) {
        // else-if: never double-notify a user in the same tick.
        dueWeekly++;
        jobs.push(sendAndPrune(uid, tokens, WEEKLY_SUMMARY));
      }
    }

    await Promise.allSettled(jobs);
    logger.info('fcm-scheduler tick done', {
      users: Object.keys(users).length,
      dueDaily,
      dueWeekly,
    });
  }
);
