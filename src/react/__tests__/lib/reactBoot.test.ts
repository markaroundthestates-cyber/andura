// ══ reactBoot.ts — S-07 boot orchestration wiring tests ════════════════════
// AUDIT-3 §S-07 fix coverage. Verifies the React entry now performs the boot
// orchestration that the retired main.js did:
//   - runReactBoot: migrations + tier rotation run in the right order, once
//     (idempotent), graceful on failure, kicks cloud sync only when authed.
//   - runPostAuthSync: path migration → Firebase restore, gated on auth, deduped.
//   - NO-DATA-LOSS: real firebase.js merge proves restore-on-login cannot
//     overwrite newer local data.
//
// Two layers:
//   1. Orchestration unit tests — mock the underlying boot modules to assert
//      sequencing/guards without network or IDB.
//   2. No-data-loss integration test — real syncFromFirebase merge against a
//      stubbed RTDB response, asserting local-always-wins + additive restore.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock the underlying boot modules (orchestration layer) ──────────────────
vi.mock('../../../bootstrap.js', () => ({
  runBootMigrations: vi.fn(async () => ({ migrationsRun: 1, totalEntriesMigrated: 0, errors: [] })),
  startTierRotation: vi.fn(async () => ({ initial: { rotated: 0 } })),
  exposeForceRotationHelper: vi.fn(),
}));
vi.mock('../../../util/logsMigration.js', () => ({
  migrateLogsUtcToLocal: vi.fn(() => ({ skipped: true, reason: 'already-migrated' })),
}));
vi.mock('../../../firebase.js', () => ({
  initFirebaseSync: vi.fn(async () => undefined),
}));
vi.mock('../../../migrations/2026-05-02-auth-path-migration.js', () => ({
  runAuthPathMigration: vi.fn(async () => ({ status: 'no-source' })),
}));
vi.mock('../../../auth.js', () => ({
  getAuthState: vi.fn(() => null),
  restoreSession: vi.fn(async () => false),
}));
// H1 account-switch guard — mock so we can assert it runs before the cloud sync.
vi.mock('../../../util/dataReset.js', () => ({
  enforceDataOwner: vi.fn(async () => false),
}));
// §56.5.2 soft-delete — mock the deletion-marker read so runPostAuthSync's
// pre-restore check resolves to "no pending deletion" (normal sign-in) without a
// real network round-trip. A returning marker is covered separately in
// reactBoot.deletionGrace.test.ts.
vi.mock('../../lib/accountDeletion', () => ({
  readDeletionMarker: vi.fn(async () => null),
}));

import {
  runReactBoot,
  runPostAuthSync,
  __resetReactBootGuards,
} from '../../lib/reactBoot';
import { runBootMigrations, startTierRotation, exposeForceRotationHelper } from '../../../bootstrap.js';
import { migrateLogsUtcToLocal } from '../../../util/logsMigration.js';
import { initFirebaseSync } from '../../../firebase.js';
import { runAuthPathMigration } from '../../../migrations/2026-05-02-auth-path-migration.js';
import { getAuthState, restoreSession } from '../../../auth.js';
import { enforceDataOwner } from '../../../util/dataReset.js';
// BUG #3 stay-logged-in — the boot bridge writes into the REAL appStore (NOT
// mocked) so reload recognizes a persisted session app-wide. Assert via getState.
import { useAppStore } from '../../stores/appStore';

const mockGetAuthState = vi.mocked(getAuthState);
const mockRestoreSession = vi.mocked(restoreSession);
const mockInitFirebaseSync = vi.mocked(initFirebaseSync);
const mockRunAuthPathMigration = vi.mocked(runAuthPathMigration);
const mockRunBootMigrations = vi.mocked(runBootMigrations);
const mockStartTierRotation = vi.mocked(startTierRotation);
const mockMigrateLogsUtcToLocal = vi.mocked(migrateLogsUtcToLocal);
const mockEnforceDataOwner = vi.mocked(enforceDataOwner);

let consoleDebugSpy: ReturnType<typeof vi.spyOn>;
let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  __resetReactBootGuards();
  // BUG #3 — reset the real appStore auth flag so the boot-bridge tests start
  // from the post-reload default (store persists only isSkipAuth, so a real
  // reload re-instantiates isAuthenticated=false; mirror that here for isolation).
  useAppStore.getState().setAuthenticated(false);
  mockGetAuthState.mockReturnValue(null);
  mockMigrateLogsUtcToLocal.mockReturnValue({ skipped: true, reason: 'already-migrated' } as never);
  mockRunBootMigrations.mockResolvedValue({ migrationsRun: 1, totalEntriesMigrated: 0, errors: [] } as never);
  mockStartTierRotation.mockResolvedValue({ initial: { rotated: 0 } } as never);
  mockInitFirebaseSync.mockResolvedValue(undefined as never);
  mockRunAuthPathMigration.mockResolvedValue({ status: 'no-source' } as never);
  mockRestoreSession.mockResolvedValue(false);
  mockEnforceDataOwner.mockResolvedValue(false);
  consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleDebugSpy.mockRestore();
  consoleWarnSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

// ── runReactBoot: orchestration + ordering ──────────────────────────────────

describe('runReactBoot — boot orchestration', () => {
  it('runs migrations + tier rotation in the main.js order', async () => {
    const order: string[] = [];
    mockMigrateLogsUtcToLocal.mockImplementation(() => { order.push('utc'); return { skipped: true } as never; });
    mockRunBootMigrations.mockImplementation(async () => { order.push('schema'); return {} as never; });
    mockStartTierRotation.mockImplementation(async () => { order.push('rotation'); return {} as never; });
    (exposeForceRotationHelper as ReturnType<typeof vi.fn>).mockImplementation(() => { order.push('helper'); });

    await runReactBoot();

    // Order matches retired main.js init(): UTC migration → schema migrations →
    // tier rotation → expose dev helper.
    expect(order).toEqual(['utc', 'schema', 'rotation', 'helper']);
  });

  it('calls each boot step exactly once', async () => {
    await runReactBoot();
    expect(migrateLogsUtcToLocal).toHaveBeenCalledOnce();
    expect(runBootMigrations).toHaveBeenCalledOnce();
    expect(startTierRotation).toHaveBeenCalledOnce();
    expect(exposeForceRotationHelper).toHaveBeenCalledOnce();
  });

  it('is idempotent — second call is a no-op (no double migration)', async () => {
    await runReactBoot();
    await runReactBoot();
    await runReactBoot();
    // Guard prevents re-running heavyweight boot steps (anti double-migration).
    expect(runBootMigrations).toHaveBeenCalledOnce();
    expect(startTierRotation).toHaveBeenCalledOnce();
    expect(migrateLogsUtcToLocal).toHaveBeenCalledOnce();
  });

  it('continues when UTC migration throws (graceful degradation)', async () => {
    mockMigrateLogsUtcToLocal.mockImplementation(() => { throw new Error('utc boom'); });
    await runReactBoot();
    // Boot must not abort — later steps still run.
    expect(runBootMigrations).toHaveBeenCalledOnce();
    expect(startTierRotation).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).toHaveBeenCalledWith('[Migration] UTC→Local failed:', expect.any(Error));
  });

  it('logs when UTC migration actually modified data', async () => {
    mockMigrateLogsUtcToLocal.mockReturnValue({ skipped: false, logsModified: 3 } as never);
    await runReactBoot();
    expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('local timezone'));
  });

  it('does NOT trigger cloud sync when unauthenticated', async () => {
    mockGetAuthState.mockReturnValue(null);
    await runReactBoot();
    // Anonymous cold boot: no network restore attempt.
    expect(initFirebaseSync).not.toHaveBeenCalled();
    expect(runAuthPathMigration).not.toHaveBeenCalled();
  });

  it('triggers cloud sync for a returning authenticated user (token persisted)', async () => {
    mockGetAuthState.mockReturnValue({ uid: 'u-returning', idToken: 't', expiry: Date.now() + 1e6 } as never);
    await runReactBoot();
    // Fire-and-forget — drain the microtask queue (the soft-delete marker check
    // adds one awaited hop before restore), then assert.
    for (let i = 0; i < 5; i++) await Promise.resolve();
    expect(initFirebaseSync).toHaveBeenCalledOnce();
  });

  it('restores the session on boot BEFORE deciding cloud sync (stay-logged-in)', async () => {
    const order: string[] = [];
    mockRestoreSession.mockImplementation(async () => { order.push('restore'); return true; });
    mockGetAuthState.mockReturnValue({ uid: 'u-returning', idToken: 't', expiry: Date.now() + 1e6 } as never);
    mockInitFirebaseSync.mockImplementation(async () => { order.push('sync'); });
    await runReactBoot();
    await Promise.resolve();
    await Promise.resolve();
    expect(mockRestoreSession).toHaveBeenCalledOnce();
    // Session restore (token refresh) precedes the cloud sync so the sync POST
    // carries a fresh idToken.
    expect(order[0]).toBe('restore');
  });

  it('continues boot when restoreSession throws (graceful — lazy refresh later)', async () => {
    mockRestoreSession.mockRejectedValue(new Error('restore boom'));
    mockGetAuthState.mockReturnValue({ uid: 'u-returning', idToken: 't', expiry: Date.now() + 1e6 } as never);
    await runReactBoot();
    for (let i = 0; i < 5; i++) await Promise.resolve();
    // Boot does not abort — sync still proceeds for the (stale-but-present) session.
    expect(initFirebaseSync).toHaveBeenCalledOnce();
    expect(consoleWarnSpy).toHaveBeenCalledWith('[Auth] boot session restore failed:', expect.any(Error));
  });
});

// ── runPostAuthSync: auth-gated cloud restore ───────────────────────────────

describe('runPostAuthSync — restore on login', () => {
  it('runs path migration THEN restore (correct order for canonical path)', async () => {
    mockGetAuthState.mockReturnValue({ uid: 'u-1', idToken: 't', expiry: Date.now() + 1e6 } as never);
    const order: string[] = [];
    mockRunAuthPathMigration.mockImplementation(async () => { order.push('migrate'); return {} as never; });
    mockInitFirebaseSync.mockImplementation(async () => { order.push('restore'); });

    await runPostAuthSync();

    // Migration first so restore reads from users/{uid}, not legacy users/daniel.
    expect(order).toEqual(['migrate', 'restore']);
  });

  it('is a no-op when unauthenticated (no network attempt)', async () => {
    mockGetAuthState.mockReturnValue(null);
    await runPostAuthSync();
    expect(runAuthPathMigration).not.toHaveBeenCalled();
    expect(initFirebaseSync).not.toHaveBeenCalled();
  });

  it('H1 — runs the data-owner guard with the current uid BEFORE the cloud sync', async () => {
    mockGetAuthState.mockReturnValue({ uid: 'uid-switch', idToken: 't', expiry: Date.now() + 1e6 } as never);
    const order: string[] = [];
    mockEnforceDataOwner.mockImplementation(async () => { order.push('guard'); return false; });
    mockInitFirebaseSync.mockImplementation(async () => { order.push('sync'); });

    await runPostAuthSync();

    // Account-switch guard purges a different prior user's local data BEFORE the
    // local-always-wins merge could push it up to the new uid's cloud.
    expect(mockEnforceDataOwner).toHaveBeenCalledWith('uid-switch');
    expect(order[0]).toBe('guard');
    expect(order).toContain('sync');
  });

  it('H1 — a guard throw is isolated + the sync still proceeds (best-effort)', async () => {
    mockGetAuthState.mockReturnValue({ uid: 'uid-g', idToken: 't', expiry: Date.now() + 1e6 } as never);
    mockEnforceDataOwner.mockRejectedValue(new Error('wipe boom'));
    await runPostAuthSync();
    expect(initFirebaseSync).toHaveBeenCalledOnce();
    expect(consoleWarnSpy).toHaveBeenCalledWith('[Auth] data-owner guard threw:', expect.any(Error));
  });

  it('dedups concurrent calls (single sync under burst)', async () => {
    mockGetAuthState.mockReturnValue({ uid: 'u-2', idToken: 't', expiry: Date.now() + 1e6 } as never);
    // Fire three in parallel (fresh login racing returning-user boot path).
    await Promise.all([runPostAuthSync(), runPostAuthSync(), runPostAuthSync()]);
    expect(initFirebaseSync).toHaveBeenCalledOnce();
    expect(runAuthPathMigration).toHaveBeenCalledOnce();
  });

  it('does not re-sync once completed for the SAME uid (done flag keyed by uid)', async () => {
    mockGetAuthState.mockReturnValue({ uid: 'u-3', idToken: 't', expiry: Date.now() + 1e6 } as never);
    await runPostAuthSync();
    await runPostAuthSync();
    expect(initFirebaseSync).toHaveBeenCalledOnce();
  });

  it('RE-S-03 — restores again for a DIFFERENT uid (in-session logout→login)', async () => {
    // First account authenticates + syncs (sets done-flag for uid-A).
    mockGetAuthState.mockReturnValue({ uid: 'uid-A', idToken: 't', expiry: Date.now() + 1e6 } as never);
    await runPostAuthSync();
    expect(initFirebaseSync).toHaveBeenCalledOnce();

    // Pure-SPA logout→login as a second account WITHOUT a page reload (so the
    // module-level guard is NOT reset). Pre-fix the bare boolean `_postAuthDone`
    // stayed true and uid-B silently skipped its cloud restore. Keyed by uid,
    // the different uid now triggers a fresh restore.
    mockGetAuthState.mockReturnValue({ uid: 'uid-B', idToken: 't2', expiry: Date.now() + 1e6 } as never);
    await runPostAuthSync();
    expect(initFirebaseSync).toHaveBeenCalledTimes(2);
    expect(runAuthPathMigration).toHaveBeenCalledTimes(2);

    // Re-confirming uid-B dedups (no third sync).
    await runPostAuthSync();
    expect(initFirebaseSync).toHaveBeenCalledTimes(2);
  });

  it('logout-restore — andura:signedout clears the per-uid done flag so the SAME user re-restores on re-login', async () => {
    // Existing user logs in + syncs (sets done-flag for their uid).
    mockGetAuthState.mockReturnValue({ uid: 'uid-same', idToken: 't', expiry: Date.now() + 1e6 } as never);
    await runPostAuthSync();
    expect(initFirebaseSync).toHaveBeenCalledOnce();

    // Without a logout, a repeat is correctly deduped (no redundant restore).
    await runPostAuthSync();
    expect(initFirebaseSync).toHaveBeenCalledOnce();

    // Pure-SPA logout (LogoutConfirm → auth.js signOut) dispatches andura:signedout
    // + wipes the local stores (incl. onboarding.completed → false), all in the same
    // page load. The re-login as the SAME uid MUST re-run the cloud restore to bring
    // back the onboarding-complete flag — otherwise the user is wrongly sent through
    // onboarding again. The signedout listener clears the done-flag so this works.
    window.dispatchEvent(new Event('andura:signedout'));

    mockGetAuthState.mockReturnValue({ uid: 'uid-same', idToken: 't2', expiry: Date.now() + 1e6 } as never);
    await runPostAuthSync();
    // Restore re-ran for the same uid (was skipped pre-fix → onboarding flag lost).
    expect(initFirebaseSync).toHaveBeenCalledTimes(2);
    expect(runAuthPathMigration).toHaveBeenCalledTimes(2);
  });

  it('survives a path-migration throw + still attempts restore', async () => {
    mockGetAuthState.mockReturnValue({ uid: 'u-4', idToken: 't', expiry: Date.now() + 1e6 } as never);
    mockRunAuthPathMigration.mockRejectedValue(new Error('migrate boom'));
    await runPostAuthSync();
    // Migration failure is isolated — restore still runs.
    expect(initFirebaseSync).toHaveBeenCalledOnce();
    expect(consoleWarnSpy).toHaveBeenCalledWith('[Auth] post-auth path migration threw:', expect.any(Error));
  });

  it('swallows a restore failure (offline) without throwing + allows retry', async () => {
    mockGetAuthState.mockReturnValue({ uid: 'u-5', idToken: 't', expiry: Date.now() + 1e6 } as never);
    mockInitFirebaseSync.mockRejectedValueOnce(new Error('network down'));
    await expect(runPostAuthSync()).resolves.toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith('[Sync] post-auth Firebase sync failed:', expect.any(Error));
    // Not marked done → a later trigger can retry.
    mockInitFirebaseSync.mockResolvedValueOnce(undefined as never);
    await runPostAuthSync();
    expect(initFirebaseSync).toHaveBeenCalledTimes(2);
  });
});

// ── BUG #3 stay-logged-in: boot bridges persisted tokens → appStore ──────────
// A returning user must NOT be forced to re-login each reload. The store only
// persists isSkipAuth, so on every reload isAuthenticated starts false; pre-fix
// it was synced from the persisted firebase-* tokens ONLY inside ProtectedRoute,
// but Splash (`/`) is a top-level route outside that gate → a logged-in user
// landing on `/` saw "Log In" + got bounced to /auth. runReactBoot now bridges
// the persisted session into the store at boot so the whole app (Splash
// included) recognizes the user. Simulates reload via fresh runReactBoot with a
// reset store + persisted-token getAuthState.

describe('runReactBoot — auth survives reload (BUG #3)', () => {
  it('sets appStore.isAuthenticated true when a session is persisted (reload)', async () => {
    // Reload state: store re-instantiated false (beforeEach), tokens persisted.
    expect(useAppStore.getState().isAuthenticated).toBe(false);
    mockGetAuthState.mockReturnValue({ uid: 'u-return', idToken: 't', expiry: Date.now() + 1e6 } as never);

    await runReactBoot();

    // Bridge ran: the returning user is recognized app-wide (Splash shows
    // "Continua" + routes to /app, NOT "Log In" → /auth re-login).
    expect(useAppStore.getState().isAuthenticated).toBe(true);
  });

  it('leaves appStore.isAuthenticated false for an anonymous boot (no tokens)', async () => {
    mockGetAuthState.mockReturnValue(null);

    await runReactBoot();

    // No persisted session → no bridge → anon user still sees the entry CTA.
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });
});
