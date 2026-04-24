import { DB, $ } from '../../db.js';
import { toast } from '../../ui/ui.js';
import { filterValidLogs } from '../../util/logFilter.js';
import { uiToggleFlags } from './state.js';

export function extractAndSavePRs() {
  const logs = DB.get('logs') || [];
  const prMap = {};
  logs.filter(l => l.w && l.reps && !l.baseline).forEach(l => {
    const score = l.w * (parseInt(l.reps) || 1);
    if (!prMap[l.ex] || score > prMap[l.ex].score) {
      prMap[l.ex] = { ex: l.ex, kg: l.w, reps: l.reps, date: l.date, ts: l.ts, score };
    }
  });
  const prs = Object.values(prMap).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  DB.set('pr-records', prs);
  return prs;
}

export function cleanFakeLogs() {
  extractAndSavePRs();
  const logs = DB.get('logs') || [];
  const before = logs.length;
  const result = filterValidLogs(logs);
  if (result.length !== logs.length) DB.set('logs', result);
  const removed = before - result.length;
  toast(`✅ Curățat ${removed} loguri (${result.length} rămase)`, 'var(--green)');
  // CICLU A (temporar): renderCoachIdle nu e extras încă
  window.renderCoachIdle?.();
  if (window.renderDash) window.renderDash();
}

export function togglePRWall() {
  uiToggleFlags.prWallExpanded = !uiToggleFlags.prWallExpanded;
  renderPRWall();
}

export function renderPRWall() {
  const el = $('pr-wall-list');
  if (!el) return;

  const prs = DB.get('pr-records') || extractAndSavePRs();
  const entries = prs.filter(p => p.ex && p.ex !== '__early_stop__');
  if (!prs.length || !entries.length) {
    el.innerHTML = `<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px 20px;text-align:center;margin:4px 0">
      <div style="font-size:32px;margin-bottom:10px">🎯</div>
      <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px">Niciun record personal încă</div>
      <div style="font-size:12px;color:var(--text3);line-height:1.5">Completează primul antrenament pentru a-ți vedea recordurile personale</div>
    </div>`;
    return;
  }

  const visible = uiToggleFlags.prWallExpanded ? entries : entries.slice(0, 3);
  const hasMore = entries.length > 3;

  el.innerHTML = visible.map((e, i) => {
    const d = new Date(e.date);
    const dateStr = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear().toString().slice(2)}`;
    const isLast = i === visible.length - 1 && !hasMore;
    return `<div style="display:flex;align-items:center;gap:12px;padding:10px 16px;${!isLast ? 'border-bottom:1px solid var(--border)' : ''}">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700">${e.ex}</div>
        <div style="font-size:11px;color:var(--text3)">${dateStr}</div>
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:var(--accent)">${e.kg} kg</div>
      <div style="font-size:11px;color:var(--text3);min-width:40px;text-align:right">×${e.reps || '—'}</div>
    </div>`;
  }).join('') + (hasMore ? `<div onclick="togglePRWall()" style="padding:10px 16px;text-align:center;cursor:pointer;color:var(--accent);font-size:12px;border-top:1px solid var(--border)">
    ${uiToggleFlags.prWallExpanded ? '▴ Restrânge' : `▾ Vezi toate (${entries.length})`}
  </div>` : '');
}
