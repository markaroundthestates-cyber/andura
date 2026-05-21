// ── Logs migration — UTC date → local date ──────────────────────────────
// Recomputes log.date from log.ts using local timezone. Idempotent.
// Triggered once on first load post-deploy via migration flag.

import { DB, todTs } from '../db.js';

/** @typedef {{ ts?: number, date?: string, [k: string]: unknown }} LogEntry */

const MIGRATION_FLAG = 'migration-utc-to-local-v1';

export function migrateLogsUtcToLocal() {
  if (localStorage.getItem(MIGRATION_FLAG) === 'done') {
    return { skipped: true, reason: 'already-migrated' };
  }

  /** @type {LogEntry[]} */
  const logs = DB.get('logs') || [];
  let modified = 0;
  /** @type {string | null} */
  let backupKey = null;

  if (logs.length > 0) {
    backupKey = `logs-backup-pre-utc-migration-${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(logs));

    const migratedLogs = logs.map(log => {
      if (!log.ts) return log;
      const correctDate = todTs(log.ts);
      if (log.date !== correctDate) {
        modified++;
        return { ...log, date: correctDate };
      }
      return log;
    });
    DB.set('logs', migratedLogs);
  }

  // Also migrate CDL entries (coach-decisions)
  /** @type {LogEntry[]} */
  const cdl = DB.get('coach-decisions') || [];
  let cdlModified = 0;
  /** @type {string | null} */
  let cdlBackupKey = null;

  if (cdl.length > 0) {
    cdlBackupKey = `cdl-backup-pre-utc-migration-${Date.now()}`;
    localStorage.setItem(cdlBackupKey, JSON.stringify(cdl));

    const migratedCdl = cdl.map(entry => {
      if (!entry.ts) return entry;
      const correctDate = todTs(entry.ts);
      if (entry.date !== correctDate) {
        cdlModified++;
        return { ...entry, date: correctDate };
      }
      return entry;
    });
    DB.set('coach-decisions', migratedCdl);
  }

  localStorage.setItem(MIGRATION_FLAG, 'done');

  console.log('[Migration UTC→Local]', {
    logsModified: modified,
    cdlModified,
    totalLogs: logs.length,
    totalCdl: cdl.length,
    backupKey,
    cdlBackupKey
  });

  return {
    skipped: false,
    logsModified: modified,
    cdlModified,
    totalLogs: logs.length,
    totalCdl: cdl.length,
    backupKey,
    cdlBackupKey,
  };
}
