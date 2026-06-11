// ── Refusal flow storage (Bundle 4 — Tier 0 active rolling per ADR 020 §1.4) ──
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.
//
// Per Daniel verbatim chat-current 2026-05-13 "Daca refuza azi un exercitiu poate
// il face alta data. Daca nu are echipament sigur nu il face" — distinct semantic:
//   - SKIPPED_EXERCISES_KEY  → permanent exercise refusals (cross-session, reversibile Cont)
//   - REFUSAL_COUNTER_KEY    → ephemeral counter cross-session per-exercise (threshold-triggered "permanent?" modal)
// Co-CTO bias REFUSAL_COUNTER_THRESHOLD = 3 (Gigel sweet spot anti-paternalism).

export const SKIPPED_EXERCISES_KEY = 'wv2-skipped-exercises';
export const REFUSAL_COUNTER_KEY   = 'wv2-refusal-counter';
export const REFUSAL_COUNTER_THRESHOLD = 3;

/**
 * Read permanently-skipped exercises list from localStorage. Dedupes + filters
 * to non-empty strings. Safe against malformed JSON / non-array / disabled storage.
 *
 * @returns {string[]} exercise names marked permanent skip
 */
export function getSkippedExercises() {
  let raw = null;
  try { raw = localStorage.getItem(SKIPPED_EXERCISES_KEY); } catch { return []; }
  if (!raw) return [];
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(parsed)) return [];
  return [...new Set(parsed.filter(e => typeof e === 'string' && e.length > 0))];
}

/**
 * Persist skipped-exercises list. Dedupes + filters to non-empty strings before write.
 *
 * @param {string[]} list
 */
export function setSkippedExercises(list) {
  const safe = Array.isArray(list)
    ? [...new Set(list.filter(e => typeof e === 'string' && e.length > 0))]
    : [];
  try { localStorage.setItem(SKIPPED_EXERCISES_KEY, JSON.stringify(safe)); } catch { /* noop */ }
}

/**
 * Toggle a single exercise name in skipped list. Returns the new list.
 * Empty / non-string exerciseName silently rejected — returns current.
 *
 * @param {string} exerciseName
 * @returns {string[]} new list post-toggle
 */
export function toggleSkippedExercise(exerciseName) {
  if (typeof exerciseName !== 'string' || exerciseName.length === 0) return getSkippedExercises();
  const current = getSkippedExercises();
  const next = current.includes(exerciseName)
    ? current.filter(e => e !== exerciseName)
    : [...current, exerciseName];
  setSkippedExercises(next);
  return next;
}

// ── Refusal-memory schema upgrade (QA refusal-memory, 2026-06-10) ────────────
// Stored entry value is EITHER the legacy plain count (number, pre-upgrade) OR
// the timestamped {n, ts} shape written from now on. ts = the LAST refusal's
// epoch-ms — it drives the soft compose-demote decay below. Legacy numeric
// entries read as {n, ts: 0} → fully decayed → ZERO penalty (conservative fresh
// start; the threshold "permanent?" modal still sees their counts).
/** @returns {Record<string, {n: number, ts: number}>} raw entries, both shapes normalized */
function _readRefusalEntries() {
  let raw = null;
  try { raw = localStorage.getItem(REFUSAL_COUNTER_KEY); } catch { return {}; }
  if (!raw) return {};
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { return {}; }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  /** @type {Record<string, {n: number, ts: number}>} */
  const out = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (typeof k !== 'string' || k.length === 0) continue;
    if (typeof v === 'number' && v >= 0 && Number.isFinite(v)) {
      out[k] = { n: Math.floor(v), ts: 0 }; // legacy shape
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      const n = Number(/** @type {{n?: unknown}} */ (v).n);
      const ts = Number(/** @type {{ts?: unknown}} */ (v).ts);
      if (Number.isFinite(n) && n >= 0) out[k] = { n: Math.floor(n), ts: Number.isFinite(ts) && ts > 0 ? ts : 0 };
    }
  }
  return out;
}

/**
 * Read refusal counter Map<exerciseName, count>. Safe against malformed JSON.
 * (Counts only — the threshold "permanent?" modal contract is unchanged.)
 *
 * @returns {Record<string, number>} {[exerciseName]: count}
 */
export function getRefusalCounter() {
  const entries = _readRefusalEntries();
  /** @type {Record<string, number>} */
  const out = {};
  for (const [k, v] of Object.entries(entries)) out[k] = v.n;
  return out;
}

/**
 * Increment counter for one exercise. Returns the new count for that exercise.
 * Empty / non-string exerciseName silently rejected — returns 0.
 *
 * @param {string} exerciseName
 * @param {number} [now] — epoch ms of this refusal (default Date.now; inject for tests)
 * @returns {number} new count for exerciseName (or 0 on rejection)
 */
export function incrementRefusal(exerciseName, now = Date.now()) {
  if (typeof exerciseName !== 'string' || exerciseName.length === 0) return 0;
  const entries = _readRefusalEntries();
  const prev = entries[exerciseName];
  const next = { ...entries, [exerciseName]: { n: (prev?.n || 0) + 1, ts: now } };
  try { localStorage.setItem(REFUSAL_COUNTER_KEY, JSON.stringify(next)); } catch { /* noop */ }
  return next[exerciseName].n;
}

// ── Soft compose-demote from refusals (Daniel 2026-06-10: "reversibil sau sa
// apara totusi recomandarile refuzate") ──────────────────────────────────────
// A refusal DEMOTES the exercise in auto-composition (poolForGroup's existing
// penalty channel: >= 0.5 → stable-partition to the back; PR-history lifts are
// never demoted; last-option guarded → never a ban) and DECAYS with a 28-day
// half-life so it comes back on its own. It still appears in swap pick-lists
// (those are untouched) — both of Daniel's requirements by construction.
//   1 refusal  → 0.6 today → under the 0.5 demote cutoff in ~10 days
//   2 refusals → 0.9 today → under 0.5 in ~24 days
//   3+         → capped 0.9 (the existing threshold modal asks "permanent?" anyway)
const REFUSAL_PENALTY_BASE = 0.6;
const REFUSAL_PENALTY_STACK = 0.3;
const REFUSAL_PENALTY_CAP = 0.9;
const REFUSAL_HALF_LIFE_DAYS = 28;

/**
 * Per-exercise soft demote penalties derived from the refusal counter.
 * Pure given (storage, now). Empty counter / fully-decayed entries → {}.
 *
 * @param {number} [now] — epoch ms (default Date.now; inject for tests)
 * @returns {Record<string, number>} engineName → penalty (0..0.9); only entries > 0.05
 */
export function getRefusalPenalties(now = Date.now()) {
  const entries = _readRefusalEntries();
  /** @type {Record<string, number>} */
  const out = {};
  for (const [name, { n, ts }] of Object.entries(entries)) {
    if (n <= 0 || ts <= 0) continue; // legacy/no-timestamp → no soft penalty
    const days = Math.max(0, (now - ts) / 86400000);
    const base = Math.min(REFUSAL_PENALTY_CAP, REFUSAL_PENALTY_BASE + REFUSAL_PENALTY_STACK * (n - 1));
    const p = base * Math.exp((-Math.LN2 * days) / REFUSAL_HALF_LIFE_DAYS);
    if (p > 0.05) out[name] = p;
  }
  return out;
}

/**
 * Clear counter entry for one exercise. Preserves other entries.
 * No-op when entry absent or invalid input.
 *
 * @param {string} exerciseName
 */
export function resetRefusalCounter(exerciseName) {
  if (typeof exerciseName !== 'string' || exerciseName.length === 0) return;
  const current = getRefusalCounter();
  if (!(exerciseName in current)) return;
  const { [exerciseName]: _drop, ...rest } = current;
  try { localStorage.setItem(REFUSAL_COUNTER_KEY, JSON.stringify(rest)); } catch { /* noop */ }
}
