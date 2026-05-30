// ══ src/bootstrap.js — boot wiring tests (ADR 018 + 020) ════════════════════
// Tests:
//   - runBootMigrations calls runMigrations + logs summary
//   - runBootMigrations gracefully degrades on throw
//   - startTierRotation calls initAutoBackup
//   - startTierRotation gracefully degrades on throw
//   - exposeForceRotationHelper sets window.__forceRotation
//   - window.__forceRotation invokes rotateOnce when called

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies (hoisted by vitest)
vi.mock('../migrations/index.js', () => ({
  runMigrations: vi.fn(),
}));

vi.mock('../storage/tieringEngine.js', () => ({
  initAutoBackup: vi.fn(),
  rotateOnce: vi.fn(),
}));

import { runBootMigrations, startTierRotation, exposeForceRotationHelper } from '../bootstrap.js';
import { runMigrations } from '../migrations/index.js';
import { initAutoBackup, rotateOnce } from '../storage/tieringEngine.js';

// logger.debug routes through console.debug (env-gated logger, util/logger.js).
let consoleDebugSpy;
let consoleWarnSpy;
let consoleErrorSpy;

beforeEach(() => {
  vi.clearAllMocks();
  consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  delete globalThis.window?.__forceRotation;
});

afterEach(() => {
  consoleDebugSpy.mockRestore();
  consoleWarnSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

// ── runBootMigrations ──────────────────────────────────────────────────────

describe('runBootMigrations', () => {
  it('calls runMigrations + returns result on success', async () => {
    const expected = { migrationsRun: 1, totalEntriesMigrated: 5, perMigration: [], errors: [] };
    runMigrations.mockResolvedValue(expected);

    const result = await runBootMigrations();

    expect(runMigrations).toHaveBeenCalledOnce();
    expect(result).toBe(expected);
  });

  it('logs summary when entries migrated', async () => {
    runMigrations.mockResolvedValue({ migrationsRun: 1, totalEntriesMigrated: 7, perMigration: [], errors: [] });
    await runBootMigrations();
    expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('7 entries migrated'));
  });

  it('warns on errors but still returns result', async () => {
    const expected = { migrationsRun: 1, totalEntriesMigrated: 0, perMigration: [], errors: [{ key: 'foo' }] };
    runMigrations.mockResolvedValue(expected);
    const result = await runBootMigrations();
    expect(consoleWarnSpy).toHaveBeenCalledWith('[Migrations] Errors:', expected.errors);
    expect(result).toBe(expected);
  });

  it('continues on throw (graceful degradation per ADR 018 §4)', async () => {
    const err = new Error('migration crashed');
    runMigrations.mockRejectedValue(err);

    const result = await runBootMigrations();

    expect(consoleErrorSpy).toHaveBeenCalledWith('[Migrations] Failed:', err);
    expect(result).toBeNull();
  });

  it('handles null result gracefully (defensive)', async () => {
    runMigrations.mockResolvedValue(null);
    const result = await runBootMigrations();
    expect(result).toBeNull();
    expect(consoleDebugSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});

// ── startTierRotation ──────────────────────────────────────────────────────

describe('startTierRotation', () => {
  it('calls initAutoBackup + returns result on success', async () => {
    const expected = { initial: { rotated: 0, perKey: [], errors: [] } };
    initAutoBackup.mockResolvedValue(expected);

    const result = await startTierRotation();

    expect(initAutoBackup).toHaveBeenCalledOnce();
    expect(result).toBe(expected);
  });

  it('forwards opts to initAutoBackup (testing override)', async () => {
    initAutoBackup.mockResolvedValue({ initial: null });
    const opts = { intervalMs: 100, runImmediately: false };
    await startTierRotation(opts);
    expect(initAutoBackup).toHaveBeenCalledWith(opts);
  });

  it('logs summary when initial rotation rotated entries', async () => {
    initAutoBackup.mockResolvedValue({ initial: { rotated: 3, perKey: [], errors: [] } });
    await startTierRotation();
    expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('Rotated 3 entries'));
  });

  it('continues on throw (graceful degradation)', async () => {
    const err = new Error('Dexie quota exceeded');
    initAutoBackup.mockRejectedValue(err);

    const result = await startTierRotation();

    expect(consoleErrorSpy).toHaveBeenCalledWith('[Storage] initAutoBackup failed:', err);
    expect(result).toBeNull();
  });
});

// ── exposeForceRotationHelper ──────────────────────────────────────────────

describe('exposeForceRotationHelper', () => {
  it('sets window.__forceRotation when window defined', () => {
    expect(window.__forceRotation).toBeUndefined();
    exposeForceRotationHelper();
    expect(typeof window.__forceRotation).toBe('function');
  });

  it('window.__forceRotation invokes rotateOnce on call', async () => {
    const expected = { rotated: 5, perKey: [], errors: [] };
    rotateOnce.mockResolvedValue(expected);

    exposeForceRotationHelper();
    const result = await window.__forceRotation();

    expect(rotateOnce).toHaveBeenCalledOnce();
    expect(result).toBe(expected);
    expect(consoleDebugSpy).toHaveBeenCalledWith('[Storage] Forced rotation result:', expected);
  });

  it('idempotent — re-calling overwrites existing helper', () => {
    exposeForceRotationHelper();
    const first = window.__forceRotation;
    exposeForceRotationHelper();
    const second = window.__forceRotation;
    // Both are functions; instances may differ but contract preserved
    expect(typeof first).toBe('function');
    expect(typeof second).toBe('function');
  });
});

// ── Order contract (init() ordering) ───────────────────────────────────────

describe('boot ordering contract', () => {
  it('runMigrations + initAutoBackup callable in expected sequence', async () => {
    const order = [];
    runMigrations.mockImplementation(async () => {
      order.push('migrations');
      return { totalEntriesMigrated: 0, errors: [] };
    });
    initAutoBackup.mockImplementation(async () => {
      order.push('autoBackup');
      return { initial: null };
    });

    await runBootMigrations();
    await startTierRotation();

    expect(order).toEqual(['migrations', 'autoBackup']);
  });
});
