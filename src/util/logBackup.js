import { DB } from '../db.js';

/**
 * @param {string} [key]
 * @returns {{ key: string, count: number }}
 */
export function backupLogsToLocal(key = 'sf.logs-backup') {
  const logs = /** @type {Array<unknown>} */ (DB.get('logs') || []);
  const timestamp = Date.now();
  localStorage.setItem(`${key}-${timestamp}`, JSON.stringify({
    timestamp,
    count: logs.length,
    logs
  }));
  return { key: `${key}-${timestamp}`, count: logs.length };
}

/**
 * @param {string} backupKey
 * @returns {{ restored: number }}
 */
export function restoreLogsFromBackup(backupKey) {
  const data = localStorage.getItem(backupKey);
  if (!data) throw new Error(`Backup ${backupKey} not found`);
  const { logs } = JSON.parse(data);
  DB.set('logs', logs);
  return { restored: logs.length };
}
