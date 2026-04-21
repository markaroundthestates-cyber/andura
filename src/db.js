// ══ DATABASE + UTILS ════════════════════════════════════════

export const DB = {
  get: k => { try { return JSON.parse(localStorage.getItem(k) || 'null') } catch { return null } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

export const $ = id => document.getElementById(id);
export const tod = () => new Date().toISOString().split('T')[0];
export const fmt = s => new Date(s).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' });
export const cleanEx = n => n.replace(/\s*[-–]\s*(wide|neutral|rope|cable|drop|pump).*$/i, '').trim();
