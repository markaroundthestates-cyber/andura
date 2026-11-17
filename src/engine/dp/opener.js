// ══ OPENING SET — dp_opener_set_v1 ═════════════════════════════════════════════════
// Founder 2026-11-17: his training partner says Andura "ii recomanda mereu maxim".
// His Lat Pulldown sessions run 52 → 59 → 59 → 66, 52 → 73, 52 → 59 → 66: he opens
// lighter and climbs to a top set. The rec progresses from that top set, so set 1 asked
// for 66 (or 73) and he moved it down to 52 every single session. The founder does the
// same on the leg press (80 → 100 → 100) and the chest press (50 → 60 → 60).
//
// When most of his recent sessions on a lift OPEN at least a rung under that session's
// top, set 1 is offered at his usual opening ratio of today's target (with his usual
// opening reps); the working target follows from set 2. A lift he works in straight sets
// (or opens heaviest) gets nothing. PURE given the rows + the snap passed in.

/** Most recent sessions read (each with >= 2 sets of the lift). */
export const OPENER_SESSIONS = 3;
/** First set at or below this share of the session top = an opening set. */
export const OPENER_MAX_RATIO = 0.93;

const repsOf = (r) => (typeof r.reps === 'string' ? parseInt(r.reps, 10) : Number(r.reps));
/** @param {number[]} xs */
function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * The opening set for today's target, or null.
 * @param {ReadonlyArray<{w?: number, reps?: number|string, ts?: number, session?: number, date?: string}>} rows this lift's logs
 * @param {number} targetKg today's working target
 * @param {(kg: number) => number} snap onto the lift's real rungs
 * @returns {{kg: number, reps: number|null}|null}
 */
export function openerFrom(rows, targetKg, snap) {
  if (!(targetKg > 0) || !Array.isArray(rows) || typeof snap !== 'function') return null;
  /** @type {Map<string, Array<any>>} */
  const bySession = new Map();
  for (const r of rows) {
    if (!r || !(Number(r.w) > 0) || !Number.isFinite(Number(r.ts))) continue;
    const key = r.session != null ? `s${r.session}` : r.date != null ? `d${r.date}` : null;
    if (!key) continue;
    if (!bySession.has(key)) bySession.set(key, []);
    /** @type {Array<any>} */ (bySession.get(key)).push(r);
  }
  const newestTs = (s) => Math.max(...s.map((r) => Number(r.ts)));
  const sessions = [...bySession.values()]
    .filter((s) => s.length >= 2)
    .sort((a, b) => newestTs(b) - newestTs(a))
    .slice(0, OPENER_SESSIONS);
  if (sessions.length < 2) return null;
  const opens = [];
  for (const s of sessions) {
    const sets = [...s].sort((a, b) => Number(a.ts) - Number(b.ts));
    const top = Math.max(...sets.map((r) => Number(r.w)));
    const ratio = Number(sets[0].w) / top;
    if (ratio <= OPENER_MAX_RATIO) opens.push({ ratio, reps: repsOf(sets[0]) });
  }
  if (opens.length < 2 || opens.length * 2 <= sessions.length) return null;
  const kg = snap(targetKg * median(opens.map((o) => o.ratio)));
  if (!(kg > 0) || kg >= targetKg) return null;
  const reps = Math.round(median(opens.map((o) => o.reps).filter((x) => Number.isFinite(x) && x > 0)));
  return { kg, reps: reps > 0 ? reps : null };
}

// ── dp_set_shape_v1 (founder 2026-11-17, the rest of "mereu maxim") ─────────────────
// The opener fixed set 1; after it every set still asked for his top. His sessions have
// a SHAPE: Lat Pulldown 52 → 59 → 66 (climbs to the last set), Chest-Supported Row
// 70 → 90 → 80 and Machine Shoulder Press 50 → 80 → 70 → 70 (a top set, then back-offs).
// Each recent session is resampled onto the planned set count; per slot, the median
// share of that session's top (the upper middle of two, so one odd session cannot move
// it) times today's target, snapped to a real rung. A slot within SHAPE_FLAT_RATIO of the
// top is the working target. Straight sets → null (nothing changes).

/** A slot at or above this share of the top is the working target itself. */
export const SHAPE_FLAT_RATIO = 0.97;

/** Upper middle of a sorted copy (len 2 → the higher value). @param {number[]} xs */
function upperMedian(xs) {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/**
 * Per-set {kg, reps} for today's target in his usual shape, or null for straight sets.
 * @param {ReadonlyArray<{w?: number, reps?: number|string, ts?: number, session?: number, date?: string}>} rows
 * @param {number} targetKg today's working target (the top)
 * @param {number} targetReps
 * @param {number} nSets planned sets
 * @param {(kg: number) => number} snap
 * @returns {Array<{kg: number, reps: number}>|null}
 */
export function setShapeFrom(rows, targetKg, targetReps, nSets, snap) {
  if (!(targetKg > 0) || !(nSets >= 2) || !Array.isArray(rows) || typeof snap !== 'function') return null;
  /** @type {Map<string, Array<any>>} */
  const bySession = new Map();
  for (const r of rows) {
    if (!r || !(Number(r.w) > 0) || !Number.isFinite(Number(r.ts))) continue;
    const key = r.session != null ? `s${r.session}` : r.date != null ? `d${r.date}` : null;
    if (!key) continue;
    if (!bySession.has(key)) bySession.set(key, []);
    /** @type {Array<any>} */ (bySession.get(key)).push(r);
  }
  const newestTs = (s) => Math.max(...s.map((r) => Number(r.ts)));
  const sessions = [...bySession.values()]
    .filter((s) => s.length >= 2)
    .sort((a, b) => newestTs(b) - newestTs(a))
    .slice(0, OPENER_SESSIONS)
    .map((s) => [...s].sort((a, b) => Number(a.ts) - Number(b.ts)));
  if (sessions.length < 2) return null;
  const slots = [];
  for (let k = 0; k < nSets; k++) {
    const ratios = [];
    const reps = [];
    for (const s of sessions) {
      const top = Math.max(...s.map((r) => Number(r.w)));
      const row = s[Math.round((k * (s.length - 1)) / (nSets - 1))];
      ratios.push(Number(row.w) / top);
      reps.push(repsOf(row));
    }
    const ratio = upperMedian(ratios);
    const kg = ratio >= SHAPE_FLAT_RATIO ? targetKg : snap(targetKg * ratio);
    const slotReps = Math.round(upperMedian(reps.filter((x) => Number.isFinite(x) && x > 0)) || 0);
    slots.push(kg > 0 && kg < targetKg ? { kg, reps: slotReps > 0 ? slotReps : targetReps } : { kg: targetKg, reps: targetReps });
  }
  return slots.some((s) => s.kg < targetKg) ? slots : null;
}
