// ══ COACH-REPLAY — journey debugger (DEV INSTRUMENT, never bundled) ═════════
// task #66. Feed a REAL user's logs, replay their journey through the engine
// OFFLINE, and emit a per-session DECISION TRACE answering "why did the coach
// recommend X for this user on this day."
//
// FORM-FACTOR (spec §2c): a script that REUSES the full-path-sim `world` — the
// REAL prod compose path (composePlannedWorkoutToday → getDailyWorkout →
// 8-engine pipeline → sessionBuilder → DP). It is the sim's seed-and-compose
// loop (acwrRealClockFullPath, fp-run.js:196-238) GENERALIZED to walk a real
// multi-session log set instead of one hand-built spike. ZERO new engine wiring.
//
// Because the world surface is TS imported into a jsdom env, this module is
// imported + driven by `replay.test.js` under vitest (the env the harness
// already runs in) — exactly how the full-path-sim is driven. It is NEVER in the
// production bundle: it lives in scripts/, no prod route, no feature flag on the
// app path. Its safety is structural (the prod app never imports scripts/).
//
// WHY-TRACE source (spec §2b, path 1): F5-W0 already landed (compose.ts:326-345)
// — every composed PlannedExercise CARRIES `recReason:{status,note}` +
// `confidence:{sigma,n}`. The replay reads them straight off the composed plan.
// No engine source touch, no direct getSmartRecommendation re-derive needed.
//
// PRIVACY (spec §2e): operates on an EXPORT in the harness's in-memory jsdom
// localStorage (reset each run). Read-only on the real account. The export file
// lives under the gitignored scripts/coach-replay/_local/ — real data in, never
// committed.

import { world, setPathAFlags, resetWorld } from '../../tests/engine/full-path-sim/fp-config.js';
import { ingestExport, groupSessions } from './ingest.mjs';

/** Flag-override writer — REUSES the harness setPathAFlags (the resolution-order
 *  step-1 `_devFlags` override the real featureFlags.isEnabled honors first).
 *  null → baseline (registry defaults, all OFF); a flag id → exactly that ON. */
function setFlag(flagId) {
  if (!flagId) { setPathAFlags(false); return; }
  setPathAFlags({ only: flagId });
}

/**
 * Seed the harness world from an ingested export, then compose forward session
 * by session, recording the per-exercise decision trace.
 *
 * The journey is walked deterministically: each session's clock is the
 * session's own `ts` (injected into composePlannedWorkoutToday) — no Date.now in
 * the driven path. To make each compose see the user's history UP TO that day,
 * the logs are seeded incrementally: before composing session k, DB.set('logs',
 * <all rows strictly BEFORE session k's day>) — so the engine prescribes from
 * exactly what it would have known going INTO that session.
 *
 * @param {Record<string, unknown>} raw  the parsed real export
 * @param {{ flag?: string|null }} [opts]  optional single-flag override (A/B)
 * @returns {Promise<{
 *   meta: { sessions:number, exercises:string[], orphanRows:number, flag:string|null },
 *   sessions: Array<{
 *     sessionNo:number, date:string, ts:number,
 *     sessionType:string|null, intensityMod:number|null,
 *     exercises: Array<{
 *       engineName:string, name:string, sets:number, targetKg:number,
 *       targetReps:number, restSec:number,
 *       recReason:{status:string|null, note:string|null},
 *       confidence:{sigma:number|null, n:number},
 *       voices:string[],
 *       actual:{loggedKg:number|null, loggedReps:number|null, rpe:number|null}|null
 *     }>
 *   }>
 * }>}
 */
export async function replayJourney(raw, opts = {}) {
  const flag = opts.flag ?? null;
  const { logs, onboarding, stats } = ingestExport(raw);

  resetWorld();
  setFlag(flag);

  // Onboarding — fall back to a neutral intermediate profile if the export
  // carried none (so compose can still run); the user's own `data` is preferred.
  world.useOnboardingStore.setState({
    data: {
      age: 30, sex: 'm', goal: 'masa', frequency: '4', experience: 'intermediar',
      weight: 80, height: 178, focusPreset: 'balanced', focusPresetPickedAt: null,
      ...(onboarding || {}),
    },
    completed: true,
    completedAt: (stats.firstTs ?? Date.now()),
  });

  const sessions = groupSessions(logs);
  const trace = [];

  for (let k = 0; k < sessions.length; k++) {
    const s = sessions[k];
    // Seed the engine's view = every row STRICTLY BEFORE this session's day.
    const priorRows = logs.filter((r) => Number.isFinite(r.ts) && r.ts < s.ts && r.ex && Number.isFinite(r.w));
    world.DB.set('logs', priorRows);

    let plan = null;
    try {
      plan = await world.composePlannedWorkoutToday(new Date(s.ts));
    } catch {
      plan = null;
    }
    if (!plan) {
      trace.push({ sessionNo: k + 1, date: s.dayKey, ts: s.ts, sessionType: null, intensityMod: null, missed: true, exercises: [] });
      continue;
    }

    // Index the actual logged outcome by EN engineName for this session's day.
    const actualByEx = new Map();
    for (const r of s.rows) {
      if (!r.ex || !Number.isFinite(r.w)) continue;
      if (!actualByEx.has(r.ex)) {
        actualByEx.set(r.ex, {
          loggedKg: r.w,
          loggedReps: typeof r.reps === 'string' ? parseInt(r.reps, 10) : (Number(r.reps) || null),
          rpe: Number.isFinite(r.rpe) ? r.rpe : null,
        });
      }
    }

    const exercises = (plan.exercises || []).map((ex) => {
      // recReason + confidence are CARRIED by F5-W0 (compose.ts:326-345). The
      // signal trace (which engine voices fired) is attached as plan.__signalTrace
      // only when the signal-bus dev flag is ON; degrade to [] otherwise.
      const voices = collectVoices(plan, ex.engineName);
      return {
        engineName: ex.engineName ?? null,
        name: ex.name,
        sets: ex.sets,
        targetKg: ex.targetKg,
        targetReps: ex.targetReps,
        restSec: ex.restSec,
        recReason: {
          status: ex.recReason?.status ?? null,
          note: ex.recReason?.note ?? null,
        },
        confidence: {
          sigma: ex.confidence?.sigma ?? null,
          n: ex.confidence?.n ?? 0,
        },
        voices,
        actual: actualByEx.get(ex.engineName) ?? null,
      };
    });

    trace.push({
      sessionNo: k + 1,
      date: s.dayKey,
      ts: s.ts,
      sessionType: plan.sessionType ?? null,
      intensityMod: plan.intensityMod ?? null,
      missed: false,
      exercises,
    });
  }

  return {
    meta: { sessions: trace.length, exercises: stats.exercises, orphanRows: stats.orphanRows, flag },
    sessions: trace,
  };
}

/** Which engine "voices" touched this exercise, read from the optional signal
 *  trace (F0 __signalTrace, dev-gated). Empty when the trace is absent — the
 *  recReason.status IS always the primary "why" regardless. */
function collectVoices(plan, engineName) {
  const tr = plan && plan.__signalTrace;
  if (!tr || typeof tr !== 'object') return [];
  const out = [];
  try {
    const entries = Array.isArray(tr.entries) ? tr.entries : Object.values(tr);
    for (const e of entries) {
      if (!e || typeof e !== 'object') continue;
      if (e.applied && (e.exercise == null || e.exercise === engineName)) {
        out.push(String(e.engine ?? e.name ?? 'engine'));
      }
    }
  } catch { /* trace shape is best-effort */ }
  return [...new Set(out)];
}

/**
 * A/B replay: the SAME real logs OFF vs ONE flag ON → the per-session decision
 * diff ("what flag X would have changed for THIS user"). The support superpower
 * (spec §2c) — costs ~nothing since each arm is one replayJourney pass.
 *
 * @param {Record<string, unknown>} raw
 * @param {string} flagId
 */
export async function replayAB(raw, flagId) {
  const off = await replayJourney(raw, { flag: null });
  const on = await replayJourney(raw, { flag: flagId });
  const diffs = [];
  const n = Math.min(off.sessions.length, on.sessions.length);
  for (let i = 0; i < n; i++) {
    const so = off.sessions[i];
    const sn = on.sessions[i];
    const byEx = new Map();
    for (const e of so.exercises) byEx.set(e.engineName, { off: e });
    for (const e of sn.exercises) byEx.set(e.engineName, { ...(byEx.get(e.engineName) || {}), on: e });
    for (const [engineName, { off: o, on: n2 }] of byEx) {
      if (!o || !n2) continue;
      if (o.targetKg !== n2.targetKg || o.sets !== n2.sets || o.targetReps !== n2.targetReps ||
          o.recReason.status !== n2.recReason.status) {
        diffs.push({
          sessionNo: so.sessionNo, date: so.date, engineName,
          off: { targetKg: o.targetKg, sets: o.sets, targetReps: o.targetReps, status: o.recReason.status },
          on: { targetKg: n2.targetKg, sets: n2.sets, targetReps: n2.targetReps, status: n2.recReason.status },
        });
      }
    }
  }
  return { flag: flagId, totalDiffs: diffs.length, diffs, off, on };
}

/** Human-readable dump of a replay trace (the fp-analyze.js readable-dump style).
 *  Numbers are FINE here — this is a dev/support console tool, NOT a user surface
 *  (the GIGEL no-raw-number rule applies only to the in-app #63 UI). */
export function formatTrace(result) {
  const L = [];
  L.push(`COACH-REPLAY — ${result.meta.sessions} sessions · flag=${result.meta.flag ?? 'OFF (baseline)'}`);
  L.push(`exercises: ${result.meta.exercises.join(', ') || '(none engine-keyed)'}`);
  if (result.meta.orphanRows > 0) {
    L.push(`!! ${result.meta.orphanRows} log row(s) had NO engine key (ex) — engine-dead (name-key bug class)`);
  }
  L.push('');
  for (const s of result.sessions) {
    if (s.missed) { L.push(`#${s.sessionNo} ${s.date} — (no plan composed)`); continue; }
    L.push(`#${s.sessionNo} ${s.date} — ${s.sessionType ?? '?'} (intensityMod ${s.intensityMod ?? '-'})`);
    for (const e of s.exercises) {
      const c = e.confidence.sigma == null ? 'sigma=null' : `sigma=${e.confidence.sigma.toFixed(2)} n=${e.confidence.n}`;
      const why = e.recReason.status ? `${e.recReason.status}${e.recReason.note ? ` — "${e.recReason.note}"` : ''}` : '(no recReason)';
      const act = e.actual ? `  [logged ${e.actual.loggedKg}kg×${e.actual.loggedReps ?? '?'}${e.actual.rpe != null ? ` rpe${e.actual.rpe}` : ''}]` : '';
      L.push(`   ${e.engineName}: ${e.targetKg}kg × ${e.targetReps} × ${e.sets}set  →  ${why}  (${c})${act}`);
      if (e.voices.length) L.push(`      voices: ${e.voices.join(', ')}`);
    }
    L.push('');
  }
  return L.join('\n');
}
