// ══ DATABASE + UTILS ════════════════════════════════════════

import { captureException } from './util/sentry.js';
import { kv } from './storage/kv';
import { dbSetRaw } from './storage/dbset';

/**
 * Tier 0 localStorage wrapper.
 *
 * `set` returns `{ok: true}` on success or `{ok: false, error: 'quota_exceeded', key}`
 * when `QuotaExceededError` is thrown by `localStorage.setItem` (Safari/iOS PWA 5MB
 * cap, Maria 65 long-session edge). Unknown errors bubble per existing contract.
 * Existing callers ignore the return value (fire-and-forget) — non-breaking.
 *
 * MED-CODE-22 (code review v2 chat 5) — prior version silently crashed the React
 * tree on quota exhaustion. Sentry capture wired pentru production observability.
 */
export const DB = {
  get: k => { try { return JSON.parse(kv.getItem(k) || 'null') } catch { return null } },
  set: (k, v) => {
    try {
      // NOTE: DB.set routes through dbSetRaw (the THROWING setter), NOT kv.setItem.
      // The MED-CODE-22 quota contract (return {ok:false,error:'quota_exceeded'} +
      // Sentry, rethrow unknown) needs the QuotaExceededError to PROPAGATE here;
      // kv.setItem swallows all throws (silent no-op, feeds Zustand's void
      // StateStorage). dbSetRaw is platform-split: raw localStorage.setItem on
      // web (Storage.prototype.setItem spy intact for db-set-quota.test.js) and
      // MMKV `set` on native (no localStorage there → bare setItem = ReferenceError),
      // both of which still THROW on real failure so the branching below holds.
      dbSetRaw(k, JSON.stringify(v));
      return { ok: true };
    } catch (err) {
      if (err && err.name === 'QuotaExceededError') {
        try { captureException(err, { tags: { component: 'DB.set', key: k } }); } catch { /* swallow Sentry failure */ }
        return { ok: false, error: 'quota_exceeded', key: k };
      }
      throw err;
    }
  }
};

export const $ = id => document.getElementById(id);
// ── Date helpers — LOCAL timezone (fix UTC bug 26 apr 2026) ─────────────
// 'sv' locale returns YYYY-MM-DD format in local timezone.
// NEVER use toISOString() for "today" date in production — UTC bug at midnight.

/** Current local date as YYYY-MM-DD */
export const tod = () => new Date().toLocaleDateString('sv');

/** Convert timestamp to local date YYYY-MM-DD */
export const todTs = (ts) => new Date(ts).toLocaleDateString('sv');

/** Local date for arbitrary Date object */
export const todDate = (d) => d.toLocaleDateString('sv');
export const fmt = s => new Date(s).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' });
export const cleanEx = n => n.replace(/\s*[-–]\s*(wide|neutral|rope|cable|drop|pump).*$/i, '').trim();
