// ══ AUTO-BACKUP DAILY — Backup automat zilnic ════════════════════════════
// Creeaza un backup complet al localStorage o data pe zi.
// Stocheaza ultimele 30 de backup-uri. Permite restaurare granulara.

import { DB, tod } from '../db.js';
import { demoteToTier2, demoteToTier3 } from './coachDecisionLog.js';

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

/** @typedef {{ key: string, date: string, timestamp: number }} BackupIndexEntry */
/** @typedef {{ restored: boolean, date?: string, keysRestored?: number, reason?: string }} RestoreResult */

/**
 * Determina daca trebuie creat un backup azi.
 * @returns {boolean}
 */
export function shouldCreateDailyBackup() {
  /** @type {BackupIndexEntry[]} */
  const index = DB.get(BACKUP_INDEX_KEY) ?? [];
  if (index.length === 0) return true;
  const lastDate = index[index.length - 1]?.date;
  const today = tod();
  return lastDate !== today;
}

/**
 * Creeaza un backup zilnic si il stocheaza.
 * @returns {{ key: string, date: string, size: number } | null}
 */
export function createDailyBackup() {
  const today = tod();
  const ts = Date.now();
  const key = `${BACKUP_PREFIX}${ts}`;

  /** @type {Record<string, unknown>} */
  const data = {};
  for (const k of USER_DATA_KEYS) {
    const v = DB.get(k);
    if (v !== null && v !== undefined) data[k] = v;
  }

  const backup = { key, date: today, timestamp: ts, version: 'daily-v1', data };

  try {
    localStorage.setItem(key, JSON.stringify(backup));
  } catch {
    // Storage full — prune first then retry
    pruneOldBackups();
    try { localStorage.setItem(key, JSON.stringify(backup)); } catch { return null; }
  }

  // Update index
  /** @type {BackupIndexEntry[]} */
  const index = DB.get(BACKUP_INDEX_KEY) ?? [];
  index.push({ key, date: today, timestamp: ts });
  DB.set(BACKUP_INDEX_KEY, index);

  pruneOldBackups();
  return { key, date: today, size: JSON.stringify(data).length };
}

/**
 * Elimina backup-urile mai vechi decat MAX_BACKUPS.
 */
export function pruneOldBackups() {
  /** @type {BackupIndexEntry[]} */
  const index = DB.get(BACKUP_INDEX_KEY) ?? [];
  if (index.length <= MAX_BACKUPS) return;

  const toRemove = index.slice(0, index.length - MAX_BACKUPS);
  for (const entry of toRemove) {
    localStorage.removeItem(entry.key);
  }

  DB.set(BACKUP_INDEX_KEY, index.slice(-MAX_BACKUPS));
}

/**
 * Returneaza lista backup-urilor disponibile, cronologic DESC.
 * @returns {BackupIndexEntry[]}
 */
export function listBackups() {
  /** @type {BackupIndexEntry[]} */
  const index = DB.get(BACKUP_INDEX_KEY) ?? [];
  return [...index].sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Restaureaza dintr-un backup (dupa key sau numarul de zile in urma).
 * @param {string|number} keyOrDaysAgo - key direct sau numar de zile (1=ieri, 3=3 zile, etc.)
 * @returns {RestoreResult}
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

function shouldDemoteCdlToday() {
  const last = localStorage.getItem('cdl-last-demote-date');
  const today = tod();
  return last !== today;
}

/**
 * Initializare: creeaza backup daca nu exista azi.
 */
export function initAutoBackup() {
  if (shouldCreateDailyBackup()) {
    createDailyBackup();
  }

  try {
    if (shouldDemoteCdlToday()) {
      const tier2Result = demoteToTier2();
      const tier3Result = demoteToTier3();
      localStorage.setItem('cdl-last-demote-date', tod());
      if (tier2Result.errors.length || tier3Result.errors.length) {
        console.warn('[CDL] Demotion completed with errors:', { tier2Result, tier3Result });
      }
    }
  } catch (err) {
    console.error('[CDL] Demote hook failed:', err);
  }
}

// Expose globally for UI access
if (typeof window !== 'undefined') {
  window.listBackups = listBackups;
  window.restoreFromBackup = restoreFromBackup;
  window.createDailyBackup = createDailyBackup;
}
