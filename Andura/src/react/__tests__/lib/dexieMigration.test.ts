// Phase 5 task_12 — Dexie scaffold tests. Use fake-indexeddb cand
// available; otherwise skip jsdom-incompatible IDB tests gracefully.

import { describe, it, expect } from 'vitest';
import { archiveSession, getArchivedSessions, clearArchive } from '../../lib/dexieMigration';
import type { LastSessionSummary } from '../../stores/workoutStore';

describe('dexieMigration — scaffold smoke', () => {
  it('exports archiveSession + getArchivedSessions + clearArchive', () => {
    expect(typeof archiveSession).toBe('function');
    expect(typeof getArchivedSessions).toBe('function');
    expect(typeof clearArchive).toBe('function');
  });

  it('getArchivedSessions returns empty array în jsdom no-IDB env (fail-silent)', async () => {
    const result = await getArchivedSessions();
    expect(Array.isArray(result)).toBe(true);
  });

  it('archiveSession does not throw în jsdom no-IDB env (fail-silent)', async () => {
    const session: LastSessionSummary = {
      title: 'Push',
      meta: 'x',
      ts: Date.now(),
    };
    await expect(archiveSession(session)).resolves.toBeUndefined();
  });

  it('clearArchive does not throw în jsdom no-IDB env', async () => {
    await expect(clearArchive()).resolves.toBeUndefined();
  });
});
