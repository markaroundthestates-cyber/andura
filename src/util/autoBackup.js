// ══ AUTO-BACKUP DAILY — Backup automat zilnic ════════════════════════════
// Creează un backup complet al localStorage o dată pe zi.
// Stochează ultimele 30 de backup-uri. Permite restaurare granulară.

import { DB } from '../db.js';

const BACKUP_INDEX_KEY = 'backup-index';
const BACKUP_PREFIX = 'backup-';
const MAX_BACKUPS = 30;

const USER_DATA_KEYS = [
  'logs', 'weights', 'kcals', 'prots', 'waters', 'pr-records',
  'phase-log', 'phase-change-date', 'bf-override', 'readiness',
  'session-burns', 'closed-days', 'wellbeing', 'suppl-list',
  'active-theme', 'device-id', 'notif-enabled', 'muted', 'workout-skips',
  'current-kcal', 'phase-override', 'onboarding-done',
];

/**
 * Determina dacă trebuie creat un backup azi.
 * @returns {boolean}
 */
export function shouldCreateDailyBackup() {
  const index = DB.get(BACKUP_INDEX_KEY) ?? [];
  if (index.length === 0) return true;
  const lastDate = index[index.length - 1]?.date;
  const today = new Date().toISOString().slice(0, 10);
  return lastDate !== today;
}

/**
 * Creează un backup zilnic și îl stochează.
 * @returns {{ key: string, date: string, size: number }}
 */
export function createDailyBackup() {
  const today = new Date().toISOString().slice(0, 10);
  const ts = Date.now();
  const key = `${BACKUP_PREFIX}${ts}`;

  const data = {};
  for (const k of USER_DATA_KEYS) {
    const v = DB.get(k);
    if (v !== null && v !== undefined) data[k] = v;
  }

  const backup = { key, date: today, timestamp: ts, version: 'daily-v1', data };

  try {
    localStorage.setItem(key, JSON.stringify(backup));
  } catch (e) {
    // Storage full — prune first then retry
    pruneOldBackups();
    try { localStorage.setItem(key, JSON.stringify(backup)); } catch { return null; }
  }

  // Update index
  const index = DB.get(BACKUP_INDEX_KEY) ?? [];
  index.push({ key, date: today, timestamp: ts });
  DB.set(BACKUP_INDEX_KEY, index);

  pruneOldBackups();
  return { key, date: today, size: JSON.stringify(data).length };
}

/**
 * Elimină backup-urile mai vechi decât MAX_BACKUPS.
 */
export function pruneOldBackups() {
  const index = DB.get(BACKUP_INDEX_KEY) ?? [];
  if (index.length <= MAX_BACKUPS) return;

  const toRemove = index.slice(0, index.length - MAX_BACKUPS);
  for (const entry of toRemove) {
    localStorage.removeItem(entry.key);
  }

  DB.set(BACKUP_INDEX_KEY, index.slice(-MAX_BACKUPS));
}

/**
 * Returnează lista backup-urilor disponibile, cronologic DESC.
 * @returns {Array<{ key, date, timestamp }>}
 */
export function listBackups() {
  const index = DB.get(BACKUP_INDEX_KEY) ?? [];
  return [...index].sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Restaurează dintr-un backup (după key sau numărul de zile în urmă).
 * @param {string|number} keyOrDaysAgo - key direct sau număr de zile (1=ieri, 3=3 zile, etc.)
 * @returns {{ restored: boolean, date: string, keysRestored: number }}
 */
export function restoreFromBackup(keyOrDaysAgo) {
  let key;

  if (typeof keyOrDaysAgo === 'number') {
    const index = listBackups();
    if (index.length === 0) return { restored: false, reason: 'no_backups' };
    const targetTs = Date.now() - keyOrDaysAgo * 24 * 3600 * 1000;
    const closest = index.reduce((best, cur) =>
      Math.abs(cur.timestamp - targetTs) < Math.abs(best.timestamp - targetTs) ? cur : best
    );
    key = closest.key;
  } else {
    key = keyOrDaysAgo;
  }

  const raw = localStorage.getItem(key);
  if (!raw) return { restored: false, reason: 'not_found' };

  let backup;
  try { backup = JSON.parse(raw); } catch { return { restored: false, reason: 'parse_error' }; }

  if (!backup?.data || typeof backup.data !== 'object') {
    return { restored: false, reason: 'invalid_format' };
  }

  let keysRestored = 0;
  for (const [k, v] of Object.entries(backup.data)) {
    DB.set(k, v);
    keysRestored++;
  }

  return { restored: true, date: backup.date, keysRestored };
}

/**
 * Inițializare: creează backup dacă nu există azi.
 */
export function initAutoBackup() {
  if (shouldCreateDailyBackup()) {
    createDailyBackup();
  }
}

// Expose globally for UI access
if (typeof window !== 'undefined') {
  window.listBackups = listBackups;
  window.restoreFromBackup = restoreFromBackup;
  window.createDailyBackup = createDailyBackup;
}
