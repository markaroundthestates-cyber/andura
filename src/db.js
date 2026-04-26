// ══ DATABASE + UTILS ════════════════════════════════════════

export const DB = {
  get: k => { try { return JSON.parse(localStorage.getItem(k) || 'null') } catch { return null } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
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
