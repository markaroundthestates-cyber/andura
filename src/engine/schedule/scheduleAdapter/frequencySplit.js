// ── Frequency-based split (D-volume-driven program 2026-06-02) ───────────
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.
//
// The program is VOLUME-DRIVEN: the user's Nth active training day maps to the
// Nth cluster of a frequency-appropriate template — NOT to the absolute weekday.
// The old DAY_TO_SESSION_TYPE absolute-weekday map surfaced legs only on
// Wednesday and never reached glutes/calves; this maps active-day position →
// cluster so a Lower/Legs/Full day exists at every frequency and every Big-11
// group (incl. fese/gambe) is reachable.
//
// Templates (ordered clusters, lowercase = CLUSTER_BIG6_TO_BIG11_WEIGHT keys).
// 3 → Full×3 (Daniel choice: better frequency, legs every session). Indexed 1..7.

import { SCHEDULE_STORE_KEY } from './constants.js';
import { resolveFocusPreset } from './focus.js';

const FREQUENCY_SPLITS = Object.freeze({
  1: Object.freeze(['full']),
  2: Object.freeze(['upper', 'lower']),
  3: Object.freeze(['full', 'full', 'full']),
  4: Object.freeze(['upper', 'lower', 'upper', 'lower']),
  5: Object.freeze(['upper', 'lower', 'push', 'pull', 'legs']),
  6: Object.freeze(['push', 'pull', 'legs', 'upper', 'lower', 'full']),
  7: Object.freeze(['push', 'pull', 'legs', 'upper', 'lower', 'full', 'full']),
});

// ══ W-Split rebalance (oracle grid GAP 1 + GAP 4, 2026-06-09) ════════════════
// FLAG-GATED (dp_split_rebalance_v1). When OFF the legacy templates +
// reshapeSplitForFocus run UNCHANGED (byte-identical). When ON, the split-picker
// gains four week-level fixes the per-exercise brain cannot reach (the 5th — the
// senior per-session cap + maintenance floor — lives in sessionBuilder /
// volumeAdaptation). All tie-breaks are positional (no Math.random / Date.now) →
// deterministic.

// Full-body templates for minimal frequency: each session trains ALL major
// regions, so a once/twice-weekly user is never handed an upper/lower (or
// push/pull) split that zeroes legs or leaves back < chest. 1 day = one full
// body; 2 days = full-body A/B (identical clusters — buildSession varies the
// exercise pick by seed, so A/B are not literal clones).
const MINIMAL_FREQ_FULLBODY = Object.freeze({
  1: Object.freeze(['full']),
  2: Object.freeze(['full', 'full']),
});

// Clusters that train chest (push side) vs back (pull side). upper/full train
// BOTH, so they are region-neutral for the back≥chest day-count floor — only
// push (chest-only) and pull (back-only) tilt the balance.
const PUSH_REGION_CLUSTERS = Object.freeze(['push']);
const PULL_REGION_CLUSTERS = Object.freeze(['pull']);

/** Day-count of clusters in `set` within `split`. */
function countClusters(split, set) {
  let n = 0;
  for (const c of split) if (set.includes(c)) n += 1;
  return n;
}

/**
 * Focus → desired day-mix DIRECTION. A focus must bias WHICH clusters land on the
 * week's days, not just per-exercise sets. Returns the cluster the focus leans
 * TOWARD and the antagonist it leans AWAY from, so the rebalancer can convert a
 * surplus antagonist day into a focus-region day. `null` → no day-mix lean
 * (balanced / arms — arms wants push+pull both, handled separately).
 */
function focusDayMixLean(preset) {
  const emph = preset.emphasize;
  const wantsBack = emph.includes('spate');
  const wantsChest = emph.includes('piept');
  const wantsShoulders = emph.includes('umeri');
  const wantsArms = emph.includes('biceps') || emph.includes('triceps');
  const wantsLower =
    emph.includes('fese') ||
    emph.includes('picioare-quads') ||
    emph.includes('picioare-hamstrings');
  // v-taper / back / upper (back is emphasized, chest is not the lead) → PULL-heavy.
  // (upper emphasizes piept too, but its defining ask is width/back ≥ chest — the
  // antagonist floor below still guarantees back ≥ chest.)
  if (wantsBack && !wantsChest) return { toward: 'pull', away: 'push' };
  // chest → PUSH-heavy.
  if (wantsChest && !wantsBack) return { toward: 'push', away: 'pull' };
  // shoulders (umeri lives in push) with nothing pulled → mild PUSH lean.
  if (wantsShoulders && !wantsBack && !wantsChest && !wantsArms) {
    return { toward: 'push', away: 'pull' };
  }
  // lower → leg-heavy (handled by the existing FOCUS_LOWER_EMPH_SPLITS path; no
  // push/pull lean here).
  if (wantsLower) return null;
  // arms → balanced push+pull (don't over-bloat one side); no lean.
  return null;
}

/**
 * Apply the focus day-mix lean to a split: convert ONE `away`-region day into a
 * `toward`-region day, but only when the split has a surplus of the away region
 * (>1, so the away region is never abandoned). Pure; first matching slot only.
 */
function applyDayMixLean(split, lean) {
  if (!lean) return split;
  const awaySet = lean.away === 'push' ? PUSH_REGION_CLUSTERS : PULL_REGION_CLUSTERS;
  const awayCount = countClusters(split, awaySet);
  const towardCount = countClusters(split, lean.toward === 'push' ? PUSH_REGION_CLUSTERS : PULL_REGION_CLUSTERS);
  // Only lean when the away side currently leads AND has a day to spare.
  if (awayCount <= towardCount || awayCount < 2) return split;
  const out = [...split];
  for (let i = 0; i < out.length; i++) {
    if (awaySet.includes(out[i])) { out[i] = lean.toward; break; }
  }
  return out;
}

/**
 * HARD FLOOR — the focus region's weekly day-count ≥ its antagonist's. For a
 * back-emphasis focus (v-taper / back / upper) this enforces back-exposure ≥
 * chest-exposure (the V means the back LEADS, never trails chest); for a chest
 * focus the mirror. Rebalances by swapping ONE antagonist (push/pull) day for a
 * focus-region day until the floor holds OR no swappable antagonist day remains
 * (last-option safety: never produce an empty/degenerate split). Pure.
 */
function enforceAntagonistFloor(split, lean) {
  if (!lean) return split;
  const focusSet = lean.toward === 'push' ? PUSH_REGION_CLUSTERS : PULL_REGION_CLUSTERS;
  const antagSet = lean.away === 'push' ? PUSH_REGION_CLUSTERS : PULL_REGION_CLUSTERS;
  const out = [...split];
  // Swap antagonist→focus days one at a time while the antagonist still out-counts
  // the focus region. Bounded by split length (can't loop forever).
  for (let guard = 0; guard < out.length; guard++) {
    const focusN = countClusters(out, focusSet);
    const antagN = countClusters(out, antagSet);
    if (focusN >= antagN) break; // floor satisfied
    // Find an antagonist day to convert; keep ≥1 antagonist day (the antagonist is
    // MAINTAINED, never abandoned) only if converting would not zero a region the
    // floor needs — but the floor requires focus ≥ antagonist, so converting down
    // to parity is correct. Stop if no antagonist day left to convert.
    let swapped = false;
    for (let i = 0; i < out.length; i++) {
      if (antagSet.includes(out[i])) { out[i] = focusSet[0]; swapped = true; break; }
    }
    if (!swapped) break;
  }
  return out;
}

/**
 * W-Split rebalance (flag-gated). Minimal-freq full-body + focus day-mix lean +
 * antagonist floor, layered ON TOP of the existing focus reshape. Pure.
 *
 * @param {number} n - active training days (already clamped to [1,7])
 * @param {string[]} base - the legacy FREQUENCY_SPLITS template (fresh copy)
 * @param {{emphasize: ReadonlyArray<string>, deEmphasize: ReadonlyArray<string>}} preset
 * @returns {string[]} rebalanced split
 */
function rebalanceSplit(n, base, preset) {
  // (1) Minimal frequency → FULL-BODY (never an upper/lower that zeroes a region).
  if (MINIMAL_FREQ_FULLBODY[n]) return [...MINIMAL_FREQ_FULLBODY[n]];
  // Start from the existing focus reshape (lower de-emph / emph templates), which
  // already gives v-taper its push/pull/legs shape — then layer the day-mix lean +
  // floor so the focus region provably leads.
  let split = reshapeSplitForFocus([...base], preset);
  const lean = focusDayMixLean(preset);
  // (3) FOCUS drives the day-type MIX.
  split = applyDayMixLean(split, lean);
  // (4) HARD FLOOR — focus region day-count ≥ antagonist.
  split = enforceAntagonistFloor(split, lean);
  // (2) push:pull DAY-COUNT balance for the BALANCED (no-lean) case: a balanced
  // multi-day split must not skew push≠pull. The legacy templates are already
  // balanced (5d = 1 push : 1 pull; 6/7 add full/upper), so this is a no-op guard
  // that only fires if a template ever drifts — converts the surplus side's first
  // day toward parity. Skipped when a focus lean intentionally tilts the week.
  if (!lean) {
    const pushN = countClusters(split, PUSH_REGION_CLUSTERS);
    const pullN = countClusters(split, PULL_REGION_CLUSTERS);
    if (Math.abs(pushN - pullN) > 1) {
      const fromSet = pushN > pullN ? PUSH_REGION_CLUSTERS : PULL_REGION_CLUSTERS;
      const toCluster = pushN > pullN ? 'pull' : 'push';
      const next = [...split];
      for (let i = 0; i < next.length; i++) {
        if (fromSet.includes(next[i])) { next[i] = toCluster; break; }
      }
      split = next;
    }
  }
  // Last-option safety: never return empty/degenerate.
  return split.length > 0 ? split : [...base];
}

// ── Focus-aware split reshaping (D-focus 2026-06-02) ─────────────────────
// A focus preset that DE-EMPHASIZES the lower body should also reshape the WEEK:
// remove ~1 lower/legs cluster and reallocate that day to the focus region
// (upper-biased push/pull). E.g. v-taper @ 4 days: the balanced template
// ['upper','lower','upper','lower'] (TWO leg days) → ['push','pull','upper','lower']
// (ONE leg day; the freed day becomes focus-region work). The emphasized region
// thus gains ≥1 cluster. `balanced` → the templates UNCHANGED (byte-identical).
//
// CRITICAL — recovery SPACING (fix 2026-06-02): a naive slot-swap (replace the
// first leg day with push) yields ['upper','push','upper','lower'] = UPPER then
// PUSH on consecutive training days. Both hammer chest/shoulders/triceps, so the
// same muscles are trained two days running → the second session lands fried
// (recovery cut + bite collapse it to ~2 sets/exercise — the "27-min" thin-session
// bug). The reshape therefore prefers a purpose-built SPACED template
// (FOCUS_LOWER_DEEMPH_SPLITS) that keeps each muscle's hits ≥48-72h apart, and
// only falls back to the slot-swap for day-counts without a spaced template.
const LOWER_CLUSTERS = Object.freeze(['lower', 'legs']);

// Recovery-SPACED templates for lower-de-emphasis presets (v-taper), keyed by
// training-day count. Each trades ONE leg day for focus-region work AND orders
// the week so the push muscles (piept/umeri/triceps) never train on back-to-back
// active days. 4 days L/Ma/J/V: push(Mon)→pull(Tue, spate/biceps fresh)→upper(Thu,
// 72h after push)→lower(Fri). Day-counts absent here fall back to the slot-swap.
const FOCUS_LOWER_DEEMPH_SPLITS = Object.freeze({
  4: Object.freeze(['push', 'pull', 'upper', 'lower']),
  // 5 days L/Ma/Mi/V/S (Mon-Tue-Wed consecutive block + Fri-Sat): push/pull/legs
  // are mutually non-overlapping, so the Mon-Tue-Wed block stays clean, and
  // push(Fri)/pull(Sat) repeat the width work without overlap. ONE leg day (Wed);
  // umeri hit Mon+Fri, spate hit Tue+Sat — emphasis preserved, fully spaced.
  5: Object.freeze(['push', 'pull', 'legs', 'push', 'pull']),
  // 6/7 days are reachable only by MANUAL calendar edits (onboarding offers 2-5),
  // and a dense week is usually consecutive (e.g. Mon-Sat), so the split itself
  // must never place overlapping clusters on adjacent positions. push/pull/legs
  // are mutually non-overlapping, so a push/pull alternation with ONE leg day is
  // spacing-safe at any consecutive-day layout (no muscle on back-to-back days;
  // each width region hit every ~48h). The blind slot-swap instead produced
  // pull→pull (and lower→full) adjacency. Width-emphasis (umeri via push, spate
  // via pull) preserved; legs maintained at one day.
  6: Object.freeze(['push', 'pull', 'push', 'pull', 'push', 'legs']),
  7: Object.freeze(['push', 'pull', 'push', 'pull', 'push', 'pull', 'legs']),
});

// #70-D2/Elena — recovery-SPACED templates for a LOWER-EMPHASIS preset (`lower`),
// the symmetric counterpart of FOCUS_LOWER_DEEMPH_SPLITS. A user who picks a glute/
// leg focus must get the lower body as the PROMINENT region, but the balanced 5-day
// template (upper/lower/push/pull/legs) is upper-dominant (3 upper-region days vs 2
// lower) → back out-volumes the focused legs (Elena: spate 26 > quads 10). Here ONE
// upper-region day is traded for a lower/legs day so the lower body leads, kept
// spacing-safe (legs / lower never on back-to-back active days; push/pull carry the
// retained upper work non-overlapping). Day-counts absent here keep the balanced
// template (the volume stage still biases the emphasized groups up).
const FOCUS_LOWER_EMPH_SPLITS = Object.freeze({
  // 4 days L/Ma/J/V: lower/upper/legs/upper → TWO lower-region days (lower+legs),
  // upper split across two non-adjacent days. (balanced was upper/lower/upper/lower
  // = 2 lower already, so 4-day lower focus is fine — omitted; the volume bias leads.)
  // 5 days: legs/upper/lower/push/pull → THREE lower-region hits (legs+lower) lead,
  // upper carried by upper+push+pull spaced; legs(Mon)/lower(Wed) non-adjacent.
  5: Object.freeze(['legs', 'upper', 'lower', 'push', 'pull']),
  // 6/7 (manual calendar) — lead with two lower-region days, upper spaced after.
  6: Object.freeze(['legs', 'upper', 'lower', 'push', 'pull', 'legs']),
  7: Object.freeze(['legs', 'upper', 'lower', 'push', 'pull', 'legs', 'upper']),
});

/**
 * Reshape an ordered cluster template for a focus preset that de-emphasizes the
 * lower body: replace ONE lower/legs cluster with a focus-region cluster
 * (push/pull alternation), so the week trades a leg day for upper-focus work.
 * Only the FIRST lower slot is swapped (≥1 leg day always retained — a
 * de-emphasized muscle is MAINTAINED, never abandoned). Presets that do not
 * de-emphasize the lower body, or templates with ≤1 lower slot, are returned
 * unchanged.
 *
 * #70-D2/Elena — the MIRROR case: a preset that EMPHASIZES the lower body trades
 * ONE upper-region day for a lower/legs day (FOCUS_LOWER_EMPH_SPLITS), so a glute/
 * leg focus makes the legs the PROMINENT region instead of being out-volumed by
 * the upper-dominant default template. Pure.
 *
 * @param {string[]} split - ordered Big-6 cluster ids (a fresh copy)
 * @param {{emphasize: ReadonlyArray<string>, deEmphasize: ReadonlyArray<string>}} preset
 * @returns {string[]} reshaped split (same length)
 */
function reshapeSplitForFocus(split, preset) {
  // Only reshape when the lower body is de-emphasized (the v-taper / freed-day
  // case). Emphasis-only presets (arms/chest) keep the balanced template
  // — the volume stage carries those; no day is freed.
  const deEmphLower =
    preset.deEmphasize.includes('picioare-quads') ||
    preset.deEmphasize.includes('picioare-hamstrings') ||
    preset.deEmphasize.includes('fese');
  // #70-D2/Elena — a LOWER-emphasis preset reshapes toward MORE lower days (the
  // mirror of the de-emphasis reshape) so the focused region actually leads the
  // week. Only fires when the lower body is emphasized AND NOT de-emphasized.
  const emphLower =
    !deEmphLower &&
    (preset.emphasize.includes('fese') ||
      preset.emphasize.includes('picioare-quads') ||
      preset.emphasize.includes('picioare-hamstrings'));
  if (emphLower) {
    const lowerEmph = FOCUS_LOWER_EMPH_SPLITS[split.length];
    return lowerEmph ? [...lowerEmph] : split;
  }
  if (!deEmphLower) return split;
  const lowerIdxs = [];
  for (let i = 0; i < split.length; i++) {
    if (LOWER_CLUSTERS.includes(split[i])) lowerIdxs.push(i);
  }
  // Need ≥2 lower slots to free one (always retain ≥1 leg day).
  if (lowerIdxs.length < 2) return split;
  // Prefer a recovery-SPACED template for this day-count (keeps the push muscles
  // off back-to-back days; see FOCUS_LOWER_DEEMPH_SPLITS). Falls through to the
  // slot-swap below only for day-counts without a spaced template.
  const spaced = FOCUS_LOWER_DEEMPH_SPLITS[split.length];
  if (spaced) return [...spaced];
  // Free the FIRST lower slot → a focus-region cluster. Alternate push/pull so
  // both width regions (umeri via push, spate via pull) get the freed work.
  const out = [...split];
  const firstLower = lowerIdxs[0];
  const priorPush = out.slice(0, firstLower).filter((c) => c === 'push').length;
  out[firstLower] = priorPush % 2 === 0 ? 'push' : 'pull';
  return out;
}

/**
 * Ordered cluster template for N training days/week. Pure + unit-testable. N is
 * clamped to [1,7] (0 active days → the 1-day Full template defensively, but the
 * caller gates rest days separately). Returns a fresh array copy.
 *
 * `focusPreset` (optional, default 'balanced') makes the split focus-aware: a
 * preset that de-emphasizes the lower body trades ONE leg day for focus-region
 * work (reshapeSplitForFocus). `balanced`/unknown → the templates UNCHANGED
 * (byte-identical to pre-feature).
 *
 * `rebalance` (W-Split, dp_split_rebalance_v1) gates the week-level rebalance:
 * minimal-freq full-body + focus day-mix lean + the back≥chest antagonist floor.
 * Default false → ZERO change (the legacy reshape path runs unchanged).
 *
 * @param {number} n - active training days that week
 * @param {string} [focusPreset='balanced'] - focus preset id
 * @param {boolean} [rebalance=false] - W-Split flag (dp_split_rebalance_v1)
 * @returns {string[]} ordered Big-6 cluster ids
 */
export function frequencyToSplit(n, focusPreset = 'balanced', rebalance = false) {
  const clamped = Math.min(7, Math.max(1, Number.isFinite(n) ? Math.round(n) : 1));
  const base = [...(FREQUENCY_SPLITS[clamped] || FREQUENCY_SPLITS[1])];
  const preset = resolveFocusPreset(focusPreset);
  if (rebalance) return rebalanceSplit(clamped, base, preset);
  return reshapeSplitForFocus(base, preset);
}

// Cluster id → uppercase session-type title tag (the OUTPUT field consumers
// resolve to a localized title via engineWrappers.resolveSessionTitle). legs and
// lower both surface as a lower-body "Picioare" title; full/upper get their own.
export const CLUSTER_TO_SESSION_TAG = Object.freeze({
  push: 'PUSH',
  pull: 'PULL',
  legs: 'LEGS',
  lower: 'LOWER',
  upper: 'UPPER',
  full: 'FULL',
});

// Engine-side mirror of scheduleStore.defaultWeekForFrequency: derive the 7-day
// active/rest tuple from the onboarding `frequency` ('2'..'5') when no calendar
// override exists. Returns an array of 7 booleans (true = active training day).
// Spacing matches the store exactly so the engine + UI agree on which weekdays
// are training days. Unknown/missing frequency → the store DEFAULT_WEEK pattern.
const FREQUENCY_DEFAULT_WEEK = Object.freeze({
  '2': Object.freeze([true, false, false, true, false, false, false]),       // L, J
  '3': Object.freeze([true, false, true, false, true, false, false]),        // L, Mi, V
  '4': Object.freeze([true, true, false, true, true, false, false]),         // L, Ma, J, V
  '5': Object.freeze([true, true, true, false, true, true, false]),          // L, Ma, Mi, V, S
});
// Store DEFAULT_WEEK fallback: L, Mi, V, S active (4 days).
const DEFAULT_ACTIVE_WEEK = Object.freeze([true, false, true, false, true, true, false]);

/**
 * Active-day boolean tuple (length 7, Monday=0) for a frequency string.
 * @param {string|null|undefined} frequency - onboarding frequency ('2'..'5')
 * @returns {ReadonlyArray<boolean>}
 */
export function activeWeekForFrequency(frequency) {
  return FREQUENCY_DEFAULT_WEEK[String(frequency)] || DEFAULT_ACTIVE_WEEK;
}

/**
 * Active-day boolean tuple from a calendar override's selectedDays (active flag),
 * or null when the override is absent/malformed (caller then falls back to
 * frequency). Length-7 padded (missing/short → inactive tail).
 * @param {{selectedDays?: Array<{active?: boolean}>}|null|undefined} override
 * @returns {boolean[]|null}
 */
export function activeWeekFromOverride(override) {
  if (!override || !Array.isArray(override.selectedDays)) return null;
  const out = [];
  for (let i = 0; i < 7; i++) {
    const cfg = override.selectedDays[i];
    out.push(!!(cfg && cfg.active !== false && cfg.active !== undefined ? cfg.active : false));
  }
  return out;
}

/**
 * Active-day boolean tuple (length 7, Monday=0) from the persisted React
 * scheduleStore (`wv2-schedule-store` → state.days: ('training'|'rest')[7]).
 * This is the schedule the Calendar UI DISPLAYS, so honoring it keeps the engine
 * in agreement with what the user sees even when no explicit calendar edit was
 * committed (no override). Returns null when the store is absent/malformed so the
 * caller falls back to the frequency default.
 *
 * @returns {boolean[]|null}
 */
export function activeWeekFromScheduleStore() {
  let raw = null;
  try { raw = localStorage.getItem(SCHEDULE_STORE_KEY); } catch { return null; }
  if (!raw) return null;
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { return null; }
  const days = parsed && parsed.state && parsed.state.days;
  if (!Array.isArray(days) || days.length !== 7) return null;
  return days.map((d) => d === 'training');
}

/**
 * Resolve the cluster for a given weekday index from an active-day week +
 * frequency split. The cluster is template[ position-of-dayIdx-among-active ].
 * When dayIdx is not itself active (no override gating it), position = the count
 * of active days strictly before it (where it would slot) — keeps a deterministic
 * cluster for any queried day without returning null (rest-day null is gated
 * separately by the override only, per unchanged behavior).
 *
 * The focus-aware split (focusPreset) reshapes which cluster fills each slot, so
 * the scheduled cluster matches the reshaped week. Default 'balanced' → unchanged.
 *
 * @param {ReadonlyArray<boolean>} activeWeek - length-7 active flags (Monday=0)
 * @param {number} dayIdx - 0..6
 * @param {string} [focusPreset='balanced'] - focus preset id
 * @param {boolean} [rebalance=false] - W-Split flag (dp_split_rebalance_v1)
 * @returns {string} cluster id
 */
export function clusterForDay(activeWeek, dayIdx, focusPreset = 'balanced', rebalance = false) {
  const activeIdxs = [];
  for (let i = 0; i < 7; i++) if (activeWeek[i]) activeIdxs.push(i);
  const n = activeIdxs.length;
  const split = frequencyToSplit(n > 0 ? n : 1, focusPreset, rebalance);
  const pos = activeIdxs.indexOf(dayIdx);
  // dayIdx active → its ordinal position; otherwise slot by active-days-before-it.
  const position = pos >= 0
    ? pos
    : activeIdxs.filter((i) => i < dayIdx).length;
  return split[Math.min(position, split.length - 1)];
}
