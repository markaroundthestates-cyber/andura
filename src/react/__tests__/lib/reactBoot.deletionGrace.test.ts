// §56.5.2 soft-delete — runPostAuthSync deletion-marker seam. When a marker is
// found on sign-in, the cloud restore is SKIPPED and appStore.pendingDeletionRestore
// is set (drives the RestoreAccount screen). No marker → normal restore proceeds.

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../bootstrap.js', () => ({
  runBootMigrations: vi.fn(async () => ({ migrationsRun: 0, totalEntriesMigrated: 0, errors: [] })),
  startTierRotation: vi.fn(async () => ({ initial: { rotated: 0 } })),
  exposeForceRotationHelper: vi.fn(),
}));
vi.mock('../../../util/logsMigration.js', () => ({
  migrateLogsUtcToLocal: vi.fn(() => ({ skipped: true })),
}));
vi.mock('../../../firebase.js', () => ({
  initFirebaseSync: vi.fn(async () => undefined),
}));
vi.mock('../../../migrations/2026-05-02-auth-path-migration.js', () => ({
  runAuthPathMigration: vi.fn(async () => ({ status: 'no-source' })),
}));
vi.mock('../../../auth.js', () => ({
  getAuthState: vi.fn(() => ({ uid: 'u-del', idToken: 't', expiry: Date.now() + 1e6 })),
  restoreSession: vi.fn(async () => false),
}));
vi.mock('../../../util/dataReset.js', () => ({
  enforceDataOwner: vi.fn(async () => false),
}));
vi.mock('../../../storage/migrateAnonymousToAuth.js', () => ({
  migrateAnonymousToAuth: vi.fn(async () => undefined),
}));
vi.mock('../../lib/storeSync', () => ({
  hydrateStoresFromCloud: vi.fn(async () => undefined),
  startStoreSyncSubscriptions: vi.fn(() => () => {}),
}));
const readDeletionMarker = vi.fn();
vi.mock('../../lib/accountDeletion', () => ({
  readDeletionMarker: (...a: unknown[]) => readDeletionMarker(...a),
}));

import { runPostAuthSync, __resetReactBootGuards } from '../../lib/reactBoot';
import { initFirebaseSync } from '../../../firebase.js';
import { hydrateStoresFromCloud } from '../../lib/storeSync';
import { enforceDataOwner } from '../../../util/dataReset.js';
import { useAppStore } from '../../stores/appStore';

beforeEach(() => {
  vi.clearAllMocks();
  __resetReactBootGuards();
  useAppStore.getState().setPendingDeletionRestore(null);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
});

describe('runPostAuthSync — soft-delete marker seam', () => {
  it('fresh marker → sets pendingDeletionRestore + SKIPS cloud restore', async () => {
    const requestedAt = Date.now() - 1000;
    readDeletionMarker.mockResolvedValue({ requestedAt, expired: false });
    await runPostAuthSync();
    expect(useAppStore.getState().pendingDeletionRestore).toEqual({ requestedAt, expired: false });
    // Restore + hydrate + account-switch guard must NOT run for a pending-delete account.
    expect(initFirebaseSync).not.toHaveBeenCalled();
    expect(hydrateStoresFromCloud).not.toHaveBeenCalled();
    expect(enforceDataOwner).not.toHaveBeenCalled();
  });

  it('expired marker → still sets the flag (delete-now only) + skips restore', async () => {
    const requestedAt = 1;
    readDeletionMarker.mockResolvedValue({ requestedAt, expired: true });
    await runPostAuthSync();
    expect(useAppStore.getState().pendingDeletionRestore).toEqual({ requestedAt, expired: true });
    expect(initFirebaseSync).not.toHaveBeenCalled();
  });

  it('no marker → clears any stale flag + proceeds with normal restore', async () => {
    useAppStore.getState().setPendingDeletionRestore({ requestedAt: 1, expired: false });
    readDeletionMarker.mockResolvedValue(null);
    await runPostAuthSync();
    expect(useAppStore.getState().pendingDeletionRestore).toBeNull();
    expect(initFirebaseSync).toHaveBeenCalled();
  });

  it('marker read throws → fail-open: normal restore still runs', async () => {
    readDeletionMarker.mockRejectedValue(new Error('network'));
    await runPostAuthSync();
    expect(initFirebaseSync).toHaveBeenCalled();
  });
});
