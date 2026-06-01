'use strict';

// Andura account-deletion 30-day grace purge - PURE logic (no I/O).
// `now` is always passed in so this module is fully testable via node --test.
//
// Client soft-delete (§56.5.2): "Sterge contul" writes
// `users/{uid}/account/deletionRequestedAt` (epoch ms) and wipes the LOCAL
// device only. The cloud node is retained for 30 days so the user can restore
// it by signing back in. This scheduled function is the BACKSTOP that performs
// the eventual hard purge once the grace window has elapsed.

// 30-day grace window in ms. Mirrors the client DELETION_GRACE_MS
// (src/react/lib/accountDeletion.ts) + auth.js buildSoftDeleteFlag.
const GRACE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Decide whether a single user's deletion marker is past the grace window.
 * Defensive: a malformed / missing / non-positive timestamp is NEVER treated as
 * due (we must never purge a user without an aged, well-formed marker).
 *
 * @param {unknown} accountNode value of users/{uid}/account
 * @param {number} now epoch ms
 * @returns {boolean} true only when a valid marker is >= GRACE_MS old
 */
function isDeletionDue(accountNode, now) {
  if (!accountNode || typeof accountNode !== 'object') return false;
  const raw = accountNode.deletionRequestedAt;
  const requestedAt = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(requestedAt) || requestedAt <= 0) return false;
  // Guard against a clock-skew / future-dated marker: a negative age is never due.
  return now - requestedAt >= GRACE_MS;
}

/**
 * PURE selection: given the whole `users` snapshot value, return the list of
 * uids whose deletion marker has aged past the grace window. Skips any user
 * without a valid aged marker (no marker, malformed, or still within grace).
 *
 * @param {Record<string, unknown>|null|undefined} users users node value
 * @param {number} now epoch ms
 * @returns {string[]} uids to hard-delete
 */
function selectExpiredUids(users, now) {
  if (!users || typeof users !== 'object') return [];
  const due = [];
  for (const uid of Object.keys(users)) {
    const user = users[uid];
    if (!user || typeof user !== 'object') continue;
    if (isDeletionDue(user.account, now)) due.push(uid);
  }
  return due;
}

module.exports = {
  GRACE_MS,
  isDeletionDue,
  selectExpiredUids,
};
