// ══ COACH-REPLAY — ingest (PURE, no engine, no jsdom) ══════════════════════
// Parse a REAL user export into the seed shape the full-path-sim `world` expects:
//   - DB.set('logs', <rows>)              (the e1RM/recovery/DP log stream)
//   - useOnboardingStore.setState({ data, completed:true, ... })
//
// Two accepted input shapes (both produced by the real app):
//   A) GDPR / account export object: { logs: [...], data: {...onboarding} }
//      (the export bundle — `data` is the onboarding store's `data` slice).
//   B) A raw localStorage dump object whose keys are the DB keys, e.g.
//      { "logs": "<json-string-or-array>", "onb": "<json>" } — values may be
//      JSON strings (localStorage stores strings) OR already-parsed.
//
// LOAD-BEARING (memory project_dp_namekey_fix): the engine reads a log row's
// `ex` as the EN canonical engineName. The ingest NEVER rewrites `ex` to the RO
// display name — it preserves the key the engine reads, and FLAGS any row whose
// `ex` is missing (those rows are dead to the engine). This is the exact trap
// that made the coach "not adapt".
//
// PURE: no engine import, no DB write, no jsdom. Returns a plain seed object that
// replay.mjs feeds into the harness world. Real data stays in-memory only.

/** @param {unknown} v @returns {unknown} */
function maybeParse(v) {
  if (typeof v !== 'string') return v;
  const s = v.trim();
  if (!s) return null;
  try { return JSON.parse(s); } catch { return v; }
}

/**
 * Normalize one log row to the shape DP.getLogs reads: { ex, w, reps, rpe, ts }.
 * Tolerant of the few historical spellings the export carries (`kg` alias for
 * `w`, `date`/`session` carried alongside `ts`). Never invents `ex` — a row
 * without an EN engineName key is returned with `ex:null` so the caller can
 * count + report it (it is engine-dead, exactly the name-key bug class).
 * @param {Record<string, unknown>} row
 */
function normalizeLogRow(row) {
  if (!row || typeof row !== 'object') return null;
  const ex = typeof row.ex === 'string' && row.ex ? row.ex : null;
  const w = Number(row.w ?? row.kg);
  const ts = Number(row.ts ?? row.session);
  const out = {
    ...row,
    ex,
    w: Number.isFinite(w) ? w : undefined,
    reps: row.reps,
    rpe: row.rpe != null ? Number(row.rpe) : undefined,
    ts: Number.isFinite(ts) ? ts : undefined,
  };
  return out;
}

/**
 * Ingest a real export into a seed the harness world can load.
 *
 * @param {Record<string, unknown>} raw  the parsed export (shape A or B)
 * @returns {{
 *   logs: Array<Record<string, unknown>>,
 *   onboarding: Record<string, unknown> | null,
 *   stats: { totalRows:number, engineKeyedRows:number, orphanRows:number,
 *            exercises:string[], firstTs:number|null, lastTs:number|null }
 * }}
 */
export function ingestExport(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('[coach-replay] ingest: export is not an object');
  }

  // logs: shape A `.logs`, else shape B `raw.logs` (string or array).
  let logsRaw = maybeParse(raw.logs);
  if (!Array.isArray(logsRaw)) {
    throw new Error('[coach-replay] ingest: no `logs` array found in export');
  }

  // onboarding `data`: shape A `.data`, shape B `.onb`/`.onboarding` (string).
  let onb =
    (raw.data && typeof raw.data === 'object' ? raw.data : null) ??
    maybeParse(raw.onb) ??
    maybeParse(raw.onboarding) ??
    null;
  if (onb && typeof onb === 'object' && 'data' in onb && onb.data && typeof onb.data === 'object') {
    // a full onboarding-store dump: { data:{...}, completed:true }
    onb = onb.data;
  }

  const rows = logsRaw.map(normalizeLogRow).filter(Boolean);
  const keyed = rows.filter((r) => r.ex && Number.isFinite(r.w));
  const orphans = rows.length - keyed.length;
  const exercises = [...new Set(keyed.map((r) => r.ex))].sort();
  const tss = keyed.map((r) => r.ts).filter((t) => Number.isFinite(t));

  return {
    logs: rows,
    onboarding: onb && typeof onb === 'object' ? onb : null,
    stats: {
      totalRows: rows.length,
      engineKeyedRows: keyed.length,
      orphanRows: orphans,
      exercises,
      firstTs: tss.length ? Math.min(...tss) : null,
      lastTs: tss.length ? Math.max(...tss) : null,
    },
  };
}

/**
 * Group log rows into sessions by their `ts`/`session`/`date` day, sorted oldest
 * → newest. Each session boundary is "going into this training day"; the replay
 * composes the plan the engine WOULD produce at that day's clock, then the actual
 * logged sets are the recorded outcome. A session timestamp = the median row `ts`
 * of that day (stable, deterministic — no Date.now).
 *
 * @param {Array<Record<string, unknown>>} rows
 * @returns {Array<{ dayKey:string, ts:number, rows:Array<Record<string, unknown>> }>}
 */
export function groupSessions(rows) {
  const byDay = new Map();
  for (const r of rows) {
    if (!Number.isFinite(r.ts)) continue;
    // Prefer an explicit `date` (sv ISO yyyy-mm-dd); else derive from ts.
    const dayKey =
      typeof r.date === 'string' && r.date
        ? r.date
        : new Date(r.ts).toISOString().slice(0, 10);
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey).push(r);
  }
  const sessions = [];
  for (const [dayKey, dayRows] of byDay) {
    const tss = dayRows.map((r) => r.ts).filter(Number.isFinite).sort((a, b) => a - b);
    const ts = tss.length ? tss[Math.floor(tss.length / 2)] : Date.parse(dayKey);
    sessions.push({ dayKey, ts, rows: dayRows });
  }
  sessions.sort((a, b) => a.ts - b.ts);
  return sessions;
}
