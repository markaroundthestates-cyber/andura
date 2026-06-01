// §56.5.2 soft-delete — accountDeletion marker helpers (mark / read / clear /
// hard-delete). Pure unit coverage with firebase.js + auth.js mocked.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  markAccountForDeletion,
  readDeletionMarker,
  clearDeletionMarker,
  hardDeleteCloudUser,
  DELETION_GRACE_MS,
  DELETION_MARKER_FIELD,
} from '../../lib/accountDeletion';

const fbGetUserChild = vi.fn();
const fbPatchUserChild = vi.fn();
const buildAuthUrl = vi.fn(async (p: string) => `https://rtdb.test/${p}.json?auth=tok`);
const getAuthState = vi.fn();

vi.mock('../../../firebase.js', () => ({
  fbGetUserChild: (...a: never[]) => fbGetUserChild(...a),
  fbPatchUserChild: (...a: never[]) => fbPatchUserChild(...a),
  buildAuthUrl: (p: string) => buildAuthUrl(p),
}));
vi.mock('../../../auth.js', () => ({
  getAuthState: () => getAuthState(),
}));
vi.mock('../../../util/logger.js', () => ({
  logger: { warn: vi.fn(), debug: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
  fbPatchUserChild.mockResolvedValue(true);
  getAuthState.mockReturnValue({ uid: 'u1', idToken: 't', expiry: Date.now() + 3_600_000 });
});

describe('markAccountForDeletion', () => {
  it('PATCHes account/deletionRequestedAt with the given epoch ms', async () => {
    const ok = await markAccountForDeletion(123456);
    expect(ok).toBe(true);
    expect(fbPatchUserChild).toHaveBeenCalledWith('account', { [DELETION_MARKER_FIELD]: 123456 });
  });

  it('returns false when the PATCH fails (caller still proceeds locally)', async () => {
    fbPatchUserChild.mockResolvedValue(false);
    expect(await markAccountForDeletion()).toBe(false);
  });
});

describe('readDeletionMarker', () => {
  it('returns null when the account node is absent', async () => {
    fbGetUserChild.mockResolvedValue(null);
    expect(await readDeletionMarker()).toBeNull();
  });

  it('returns null when the field is missing/malformed', async () => {
    fbGetUserChild.mockResolvedValue({ somethingElse: 1 });
    expect(await readDeletionMarker()).toBeNull();
    fbGetUserChild.mockResolvedValue({ [DELETION_MARKER_FIELD]: 'not-a-number' });
    expect(await readDeletionMarker()).toBeNull();
    fbGetUserChild.mockResolvedValue({ [DELETION_MARKER_FIELD]: 0 });
    expect(await readDeletionMarker()).toBeNull();
  });

  it('returns a non-expired marker within the 30-day window', async () => {
    const now = 1_000_000_000_000;
    const requestedAt = now - DELETION_GRACE_MS + 1000; // 1s short of 30d
    fbGetUserChild.mockResolvedValue({ [DELETION_MARKER_FIELD]: requestedAt });
    const m = await readDeletionMarker(now);
    expect(m).toEqual({ requestedAt, expired: false });
  });

  it('flags expired once the 30-day window has elapsed', async () => {
    const now = 1_000_000_000_000;
    const requestedAt = now - DELETION_GRACE_MS - 1; // just past 30d
    fbGetUserChild.mockResolvedValue({ [DELETION_MARKER_FIELD]: requestedAt });
    const m = await readDeletionMarker(now);
    expect(m).toEqual({ requestedAt, expired: true });
  });
});

describe('clearDeletionMarker', () => {
  it('PATCHes the field to null (Restore)', async () => {
    const ok = await clearDeletionMarker();
    expect(ok).toBe(true);
    expect(fbPatchUserChild).toHaveBeenCalledWith('account', { [DELETION_MARKER_FIELD]: null });
  });
});

describe('hardDeleteCloudUser', () => {
  it('DELETEs the whole users/{uid} node when authenticated', async () => {
    const fetchSpy = vi.fn(async () => new Response(null, { status: 200 }));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    const ok = await hardDeleteCloudUser();
    expect(ok).toBe(true);
    expect(buildAuthUrl).toHaveBeenCalledWith('users/u1');
    expect(fetchSpy).toHaveBeenCalledWith('https://rtdb.test/users/u1.json?auth=tok', { method: 'DELETE' });
  });

  it('returns false when unauthenticated (no uid)', async () => {
    getAuthState.mockReturnValue(null);
    expect(await hardDeleteCloudUser()).toBe(false);
  });
});
