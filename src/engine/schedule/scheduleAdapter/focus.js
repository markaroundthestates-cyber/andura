// ══ FOCUS SELECTOR — goal/look presets shape volume + split (D-focus 2026-06-02) ══
// Split out of scheduleAdapter.js (barrel preserved). ZERO behavior change.
//
// ADR 025 "override optional": Andura decides by default (focusPreset='balanced'
// → ZERO change, byte-identical to pre-feature). A user CAN pick a high-level
// LOOK (not muscles — Gigel thinks "wider shoulders", not "lateral delt"). The
// preset maps the look → a per-Big-11-group emphasis: EMPHASIZED groups bias
// toward their Israetel MRV (more width/size), DE-EMPHASIZED groups relax toward
// their MEV (MAINTAINED with less work — NEVER below MEV, never abandoned), the
// rest neutral. Two layers act: (1) the focus volume stage below biases the
// weekly budget; (2) frequencyToSplit reshapes the week (a de-emphasized lower
// body frees a leg day → the focus region gets it). Groups are Big-11 RO keys —
// the SAME vocabulary weakGroups / the recovery engine use.
//
// FOCUS_LERP = the fraction of the gap (current → target landmark) the focus
// stage closes. 0.50 rationale: half-way to MRV (emphasize) / half-way to MEV
// (de-emphasize) is a decisive, FELT shift without pinning a group at an extreme
// (MRV is a short overreach ceiling; MEV is the maintenance floor). ONE documented
// constant for both directions — not a per-preset multiplier zoo. Every group is
// clamped to [MEV, MRV] always.

import {
  BIG11_RO_TO_EN_MAP,
  ISRAETEL_BASELINES,
} from '../../periodization/constants.js';

const FOCUS_LERP = 0.50;

/**
 * Goal/look presets → per-Big-11-RO-group emphasis. `balanced` (default) is the
 * empty no-op. `emphasize` raises toward MRV; `deEmphasize` relaxes toward MEV.
 * Groups not listed are neutral (unchanged). RO Big-11 keys (weakGroups vocab).
 *
 * @type {Readonly<Object<string, {emphasize: ReadonlyArray<string>, deEmphasize: ReadonlyArray<string>}>>}
 */
export const FOCUS_PRESETS = Object.freeze({
  // DEFAULT — no change, current behavior exactly.
  balanced: Object.freeze({ emphasize: Object.freeze([]), deEmphasize: Object.freeze([]) }),
  // Width: shoulders + back UP; lower body relaxed to maintenance (Daniel's case:
  // big legs already, wants the V). piept/core/biceps/triceps neutral.
  'v-taper': Object.freeze({
    emphasize: Object.freeze(['umeri', 'spate']),
    deEmphasize: Object.freeze(['picioare-quads', 'picioare-hamstrings', 'fese', 'gambe']),
  }),
  // Arms: biceps + triceps UP (umeri secondary); rest neutral.
  arms: Object.freeze({
    emphasize: Object.freeze(['biceps', 'triceps', 'umeri']),
    deEmphasize: Object.freeze([]),
  }),
  // Chest: piept UP (triceps secondary); rest neutral.
  chest: Object.freeze({
    emphasize: Object.freeze(['piept', 'triceps']),
    deEmphasize: Object.freeze([]),
  }),
  // Shoulders: umeri UP (lateral + rear delt for width); NOTHING de-emphasized
  // (a standalone shoulder bias, not a body-region trade like v-taper). Distinct
  // from v-taper (umeri + spate both up, lower relaxed) and from upper/arms (umeri
  // only secondary). umeri is the PRIMARY emphasis → routes into the lateral-raise
  // guarantee (dp_smart_selection_v1) the same as v-taper/upper.
  shoulders: Object.freeze({
    emphasize: Object.freeze(['umeri']),
    deEmphasize: Object.freeze([]),
  }),
  // Back: spate UP (lats / upper back for width); NOTHING de-emphasized (a
  // standalone back bias). Distinct from v-taper (umeri + spate, lower relaxed)
  // and upper (piept + spate + umeri). Bias the group up only.
  back: Object.freeze({
    emphasize: Object.freeze(['spate']),
    deEmphasize: Object.freeze([]),
  }),
  // Lower: fese + quads/hams UP (gambe secondary); upper neutral.
  lower: Object.freeze({
    emphasize: Object.freeze(['fese', 'picioare-quads', 'picioare-hamstrings', 'gambe']),
    deEmphasize: Object.freeze([]),
  }),
  // Upper: the MIRROR of v-taper — piept/spate/umeri UP; the SAME lower groups
  // relaxed to maintenance. De-emphasizing the identical lower set means UPPER
  // inherits the lower-de-emphasis split reshape (reshapeSplitForFocus keys on
  // picioare-*/fese being de-emphasized) + the divisor fix + the M2/M3
  // suppression for FREE — one mechanism, data-only addition.
  upper: Object.freeze({
    emphasize: Object.freeze(['piept', 'spate', 'umeri']),
    deEmphasize: Object.freeze(['picioare-quads', 'picioare-hamstrings', 'fese', 'gambe']),
  }),
});

/** Valid focusPreset ids (the keys of FOCUS_PRESETS). */
export const FOCUS_PRESET_IDS = Object.freeze(Object.keys(FOCUS_PRESETS));

/**
 * Resolve a focusPreset id to its emphasis spec. Unknown/missing/`balanced` →
 * the balanced no-op (graceful degradation, ADR 025). Pure.
 *
 * @param {string|null|undefined} focusPreset
 * @returns {{emphasize: ReadonlyArray<string>, deEmphasize: ReadonlyArray<string>}}
 */
export function resolveFocusPreset(focusPreset) {
  return FOCUS_PRESETS[focusPreset] ?? FOCUS_PRESETS.balanced;
}

/**
 * The Big-11 RO groups a preset DE-EMPHASIZES — the set whose auto-signals (M2
 * weakness amp + M3 imbalance correction) must be SUPPRESSED so Andura doesn't
 * re-inflate the region the user intentionally minimized (Daniel: focus BEATS
 * auto-balance). `balanced`/unknown → empty (no suppression). Pure.
 *
 * @param {string|null|undefined} focusPreset
 * @returns {Set<string>} Big-11 RO de-emphasized group ids
 */
export function deEmphasizedGroups(focusPreset) {
  return new Set(resolveFocusPreset(focusPreset).deEmphasize);
}

/**
 * The Big-11 RO groups a preset EMPHASIZES — the set the session builder must
 * surface VISIBLY (extra exercise slots + front-of-session), so an arms/chest
 * pick produces a noticeably different generated session than balanced (not just
 * a paper volume bump that the SESSION_SIZE clamp + slot caps absorb). The weekly
 * volume bias (applyFocusBias) raises these groups' budget; this set lets that
 * intent reach the visible exercise list. `balanced`/unknown → empty (no boost).
 * Pure.
 *
 * @param {string|null|undefined} focusPreset
 * @returns {Set<string>} Big-11 RO emphasized group ids
 */
export function emphasizedGroups(focusPreset) {
  return new Set(resolveFocusPreset(focusPreset).emphasize);
}

/**
 * The PRIMARY emphasized Big-11 RO group of a preset — its first `emphasize[]`
 * entry (Top-1 discipline, the specialization engine V1 invariant). This is the
 * group routed into the specialization engine as the user-picked TARGET
 * (meta.userOverrideWeakGroup) when the emphasis-specialization trade is on.
 * `balanced`/unknown/empty-emphasize → null (no target). Pure.
 *
 * @param {string|null|undefined} focusPreset
 * @returns {string|null} Big-11 RO primary emphasized group, or null
 */
export function primaryEmphasizedGroup(focusPreset) {
  const emphasize = resolveFocusPreset(focusPreset).emphasize;
  return emphasize.length > 0 ? emphasize[0] : null;
}

/**
 * Focus volume stage — bias each group's weekly budget by the preset. EMPHASIZED
 * groups lerp toward MRV; DE-EMPHASIZED groups lerp toward MEV (maintenance floor
 * — clamped so they NEVER drop below MEV, never to zero); neutral groups
 * unchanged. Every touched group is clamped to [MEV, MRV]. The budget is EN-keyed
 * (chest/back/...) but presets are Big-11 RO — each is bridged to EN
 * (BIG11_RO_TO_EN_MAP) for its budget entry + landmarks (ISRAETEL_BASELINES).
 * Returns a NEW map. `balanced` (empty preset) → the map returned unchanged
 * (byte-identical, graceful degradation, ADR 025). Pure.
 *
 * @param {Object<string, number>|null|undefined} volumeMapEN - Big-11 EN budget
 * @param {string|null|undefined} focusPreset
 * @param {boolean} [suppressEmphasizeUp=false] - F emphasis-specialization (T7):
 *   when the specialization-phase emphasis is ACTIVE, the emphasized target's
 *   UP-bias toward MRV is owned by applyWeaknessAmplification (the spec target is
 *   in weakGroups), so the emphasize loop here is SKIPPED to avoid a double-lerp.
 *   The de-emphasize→MEV branch is unaffected (v-taper/upper lower-region relax).
 *   Default false → byte-identical to the pre-feature emphasize+de-emphasize.
 * @returns {Object<string, number>|null} biased EN-keyed budget (null passes through)
 */
export function applyFocusBias(volumeMapEN, focusPreset, suppressEmphasizeUp = false) {
  if (!volumeMapEN || typeof volumeMapEN !== 'object') return volumeMapEN ?? null;
  const preset = resolveFocusPreset(focusPreset);
  if (preset.emphasize.length === 0 && preset.deEmphasize.length === 0) {
    return { ...volumeMapEN };
  }
  const out = { ...volumeMapEN };
  const biasGroup = (roGroup, towardKey) => {
    const enKey = BIG11_RO_TO_EN_MAP[roGroup] ?? roGroup;
    const current = out[enKey];
    const lm = ISRAETEL_BASELINES[enKey];
    if (typeof current !== 'number' || !Number.isFinite(current) || current <= 0) return;
    if (!lm) return;
    const target = lm[towardKey];
    if (typeof target !== 'number' || !Number.isFinite(target)) return;
    const biased = current + (target - current) * FOCUS_LERP;
    // Clamp to [MEV, MRV] always — a de-emphasized group is MAINTAINED at MEV,
    // never below; an emphasized group never exceeds MRV.
    out[enKey] = Math.min(lm.MRV, Math.max(lm.MEV, biased));
  };
  if (!suppressEmphasizeUp) {
    for (const roGroup of preset.emphasize) biasGroup(roGroup, 'MRV');
  }
  for (const roGroup of preset.deEmphasize) biasGroup(roGroup, 'MEV');
  return out;
}
