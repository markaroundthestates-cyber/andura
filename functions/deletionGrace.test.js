'use strict';

// node --test coverage for the PURE deletion-grace selection logic.

const test = require('node:test');
const assert = require('node:assert/strict');

const { GRACE_MS, isDeletionDue, selectExpiredUids } = require('./deletionGrace');

const NOW = 1_000_000_000_000;

test('isDeletionDue: false for missing / malformed marker', () => {
  assert.equal(isDeletionDue(undefined, NOW), false);
  assert.equal(isDeletionDue(null, NOW), false);
  assert.equal(isDeletionDue({}, NOW), false);
  assert.equal(isDeletionDue({ deletionRequestedAt: 'nope' }, NOW), false);
  assert.equal(isDeletionDue({ deletionRequestedAt: 0 }, NOW), false);
  assert.equal(isDeletionDue({ deletionRequestedAt: -5 }, NOW), false);
});

test('isDeletionDue: false while still within the 30-day window', () => {
  const within = { deletionRequestedAt: NOW - GRACE_MS + 1000 }; // 1s short of 30d
  assert.equal(isDeletionDue(within, NOW), false);
});

test('isDeletionDue: true exactly at and past the 30-day boundary', () => {
  assert.equal(isDeletionDue({ deletionRequestedAt: NOW - GRACE_MS }, NOW), true);
  assert.equal(isDeletionDue({ deletionRequestedAt: NOW - GRACE_MS - 1 }, NOW), true);
});

test('isDeletionDue: false for a future-dated (clock-skew) marker', () => {
  assert.equal(isDeletionDue({ deletionRequestedAt: NOW + 5000 }, NOW), false);
});

test('selectExpiredUids: only aged markers selected, others skipped', () => {
  const users = {
    aged: { account: { deletionRequestedAt: NOW - GRACE_MS - 1 } },
    within: { account: { deletionRequestedAt: NOW - 1000 } },
    noMarker: { account: {} },
    noAccount: { weights: {} },
    malformed: { account: { deletionRequestedAt: 'x' } },
    agedToo: { account: { deletionRequestedAt: NOW - GRACE_MS } },
    nullUser: null,
  };
  const due = selectExpiredUids(users, NOW).sort();
  assert.deepEqual(due, ['aged', 'agedToo']);
});

test('selectExpiredUids: empty / non-object snapshot → []', () => {
  assert.deepEqual(selectExpiredUids(null, NOW), []);
  assert.deepEqual(selectExpiredUids(undefined, NOW), []);
  assert.deepEqual(selectExpiredUids('nope', NOW), []);
  assert.deepEqual(selectExpiredUids({}, NOW), []);
});

test('GRACE_MS is exactly 30 days', () => {
  assert.equal(GRACE_MS, 30 * 24 * 60 * 60 * 1000);
});
