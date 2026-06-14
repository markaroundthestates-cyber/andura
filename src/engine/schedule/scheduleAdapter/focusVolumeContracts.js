// ══ FOCUS VOLUME CONTRACTS (focus-contracts arc 2026-06-12) ═════════════════════
// A per-focus WEEKLY GROUP-VOLUME cap/floor layer. The per-session focus-policy
// resolver (focusPolicy.applyFocusPolicy) shapes WHICH exercises a day carries and
// its per-session structural minimums — but it is LOCAL (no cross-day ledger), so it
// cannot enforce the CROSS-GROUP weekly RELATIONSHIPS the founder approved (e.g.
// "back may not dwarf shoulders", "biceps ≈ triceps on an arms focus"). Those live
// at the WEEKLY VOLUME altitude: the per-group sets/week budget the composer divides
// across the week (sessionSetBudget). This layer adjusts that budget map per the
// focus's contract, deterministically, clamped to [MEV, MRV] so a cap never starves a
// group and a floor never exceeds MRV — the maintenance floor (applyMaintenanceFloor,
// which runs BEFORE this) stays supreme.
//
// WHY BUDGET, NOT DELIVERED: getDailyWorkout composes PER DAY (no composeWeek), so a
// single day's pass cannot see the week's DELIVERED total. We therefore express each
// contract as a BUDGET clamp (sets/week the group's weekly target is held to). The
// composer's frequency × per-session budget then delivers a weekly total that tracks
// the budget monotonically; the contract NUMBERS here are tuned (focus×frequency
// sweep) so the DELIVERED totals land inside the founder's contract bands. The budget
// map is the STABLE weekly SSOT (balancedTargets) — identical across all 7 days — so
// the clamp is consistent every day of the week.
//
// FLAG: gated at the call site by dp_focus_contracts_v1 (featureFlags.js). OFF → the
// budget passes through untouched → byte-identical (the fp hash holds; pinned OFF in
// the fp cohorts). PURE + deterministic: median/ratio arithmetic on the budget map,
// no Math.random / Date.now / store access.
//
// KEYS: the budget map is Big-11 EN (chest/back/shoulders/biceps/triceps/quads/
// hamstrings/glutes/calves/abs/forearms) — the SAME keys ISRAETEL_BASELINES uses, so
// the [MEV,MRV] clamp reads landmarks directly with no RO bridge.

import { ISRAETEL_BASELINES } from '../../periodization/constants.js';

/** Day-band key from training days/week (mirrors focusPolicy.dayBandKey). */
function band(daysPerWeek) {
  const d = Number(daysPerWeek);
  if (!Number.isFinite(d) || d <= 2) return 'lo'; // 1-2 days
  if (d <= 3) return 'mid'; // 3 days
  return 'hi'; // 4-7 days
}

/** Clamp a budget value to the group's [MEV, MRV] landmark band. A group with no
 *  landmark (unexpected) is returned unchanged. Never returns < MEV (a contract cap
 *  must not starve a group below maintenance) and never > MRV (a floor caps out). */
function clampToBand(enKey, value) {
  const lm = ISRAETEL_BASELINES[enKey];
  if (!lm) return value;
  return Math.min(lm.MRV, Math.max(lm.MEV, value));
}

/** Lower out[key] to at most `ceil` (clamped to its band), only if it currently
 *  exceeds it. Never raises. No-op when the key is absent / non-positive. */
function capTo(out, key, ceil) {
  const cur = out[key];
  if (typeof cur !== 'number' || !Number.isFinite(cur) || cur <= 0) return;
  const target = clampToBand(key, ceil);
  if (cur > target) out[key] = target;
}

/** Raise out[key] to at least `floor` (clamped to its band), only if it currently
 *  falls short. Never lowers. Applies even when the key is absent (a focus floor on
 *  a group the base budget omitted still injects the maintenance target). */
function floorTo(out, key, floor) {
  const lm = ISRAETEL_BASELINES[key];
  if (!lm) return;
  const cur = typeof out[key] === 'number' && Number.isFinite(out[key]) ? out[key] : 0;
  const target = clampToBand(key, floor);
  if (cur < target) out[key] = target;
}

// OVER-DELIVERY model (calibrated on the 2026-06-12 focus×frequency sweep): a group
// the split trains on MORE cluster-days than its weekly-frequency divisor assumes
// DELIVERS more sets than its budget — the split-asymmetry leak. For the back bucket
// at ≥4 training days the delivered total runs ≈1.5× the budget (v-taper's pull-heavy
// 6-7d week pushes ~1.7-1.8×). To land a DELIVERED ceiling X we therefore cap the
// BUDGET at X / OVERDELIVER. Tuning these here (not the gate) is the protocol: the
// gate asserts the DELIVERED ratios; this layer's job is to make them hold. A cap is
// always MEV-clamped — where MEV prevents reaching the target (the 6-7d split lands a
// back anchor on every upper/pull day regardless of budget) the contract is the
// reachable part and the residual is reported as a split-structure gap, NOT forced.
const OVERDELIVER_HI = 1.5;       // back/over-trained groups @4-7d

// ── Per-focus weekly volume contracts ────────────────────────────────────────────
// Each fn mutates a COPY of the budget map in place. Numbers are sets/week budgets,
// tuned against the focus×frequency sweep so the DELIVERED weekly totals land inside
// the founder's contract bands (the composer over-delivers an over-trained group per
// the OVERDELIVER model above, so a budget cap sits BELOW the delivered ceiling).
// Every write is band-clamped.
const CONTRACTS = Object.freeze({
  // BALANCED — the back:19-vs-shldr:4 distortion is fixed by LIFTING the slot-starved
  // shoulders, NOT by touching the back volume budget. The lift is a SLOT one: the
  // resolver injects a side-delt slot on each push/upper/full day (FOCUS_RULES.balanced
  // `_contract` side_delt minimum), which raises delivered shoulders to ≥6 AND raises the
  // median of the other majors, keeping the DELIVERED back within ≤1.6×median naturally
  // (verified on the sweep + gate). The VOLUME layer intentionally does NOTHING for
  // balanced: a back ceiling would clamp legitimate deload (−45%) + M3 imbalance
  // back-raises to one value, and a shoulder budget FLOOR would override the deload cut
  // for shoulders (both break the periodization tests). Slot injection is deload-safe
  // (it adds a structural minimum, not weekly volume). → balanced volumeTargets are
  // untouched (byte-identical to pre-arc even with the flag ON).
  balanced() {
    // no volume-budget change — the side-delt SLOT (resolver) carries contract 1.
  },

  // V-TAPER — back is the V frame but must not bloat to 36-37 @6-7d (junk back, the
  // shoulders starved to 16). Cap back so DELIVERED ≤28 @6-7d (budget ≤ 28/1.75 ≈ 16);
  // raise shoulders to MRV so DELIVERED climbs toward ≥20-22 @6-7d. The lower region
  // stays de-emphasized (applyFocusBias floored it to MEV). shoulders is emphasized
  // (lerped toward MRV 26) — we only FLOOR it (never lower the emphasis).
  'v-taper'(out, b) {
    if (b === 'hi') {
      // back is EMPHASIZED on v-taper (it is the V frame) — its budget must stay ABOVE
      // a balanced back, so we do NOT cap the budget below the emphasis (the ≤28
      // DELIVERED ceiling is enforced by the per-session maxFocusVerticalPull cap + the
      // shrug/lower-back demotion, which thin the pull-heavy week's back EXERCISES from
      // 4/day → ~3/day; that brought delivered back 35→26 on the sweep). We only cap a
      // GROSS overflow (above MAV+1) so a runaway never reaches MRV; the emphasized
      // ~MAV budget passes through untouched.
      capTo(out, 'back', (ISRAETEL_BASELINES.back?.MAV ?? 18) + 1);
      floorTo(out, 'shoulders', 26); // MRV — best-effort lift of the slot-starved delts
    }
  },

  // ARMS — biceps ≥ 0.85×triceps + shoulders ≤ max(biceps,triceps) + OHP ≤8/wk. KEY
  // DELIVERY FACT (sweep): triceps over-delivers (it owns Close-Grip Bench, a tier-1
  // COMPOUND carrying ~4 sets) while biceps is pure isolation (~3 sets/curl) — so in
  // DELIVERED space max(bi,tri)=tri and the shoulder cap must be tied to the TRICEPS
  // budget (biceps' MRV budget is huge but UNDER-delivers, so max(bi_budget,tri_budget)
  // never caps anything). Cap shoulders ≤ triceps budget so delivered shoulders drops
  // below the delivered arms. Floor biceps toward triceps parity (best-effort — the
  // Close-Grip compound on triceps is a structural ceiling the budget can't fully close;
  // the residual bi:tri ratio gap @6-7d is reported, not forced).
  arms(out, b, armsSignatureOn) {
    const tri = out.triceps;
    if (typeof tri === 'number' && tri > 0) {
      floorTo(out, 'biceps', tri); // push biceps budget to triceps parity (MRV-clamped)
    }
    // Shoulders is only a SECONDARY emphasis on arms — but it OVER-delivers ~1.8× its
    // budget (OHP 4-set + laterals across the push days) so even at a ~10 budget the
    // delivered shoulders (18-22) dwarfs the arms. The contract wants shoulders
    // SUBORDINATE to the arms → cap the shoulder budget to its MEV floor (8) so the
    // delivered ~14 lands at/below the delivered triceps. The arm-OHP cap
    // (maxArmVerticalPress) holds the press side; this holds the volume side.
    capTo(out, 'shoulders', (ISRAETEL_BASELINES.shoulders?.MEV ?? 8));

    // ── ARMS SIGNATURE (dp_arms_signature_v1, 2026-06-13) ──────────────────────────
    // The cap above + the umeri demotion (focus.js) drop shoulders below the arms, but
    // BACK still out-volumes the arms in ~half the configs (back MEV-floored to 10 over-
    // delivers to ~13-15, while direct biceps/triceps deliver ≈1:1 their budget). To make
    // biceps + triceps the CLEAR top-two by volume (the eval signature) the arm BUDGETS
    // must be floored above what back DELIVERS. The floors are LEVEL-SCALED via the
    // group's own MAV/MRV landmarks (a beginner's base budget is lower, so the lerp lands
    // a smaller absolute dose) + the day-band (`hi` = 4-7d, the only band where a back
    // anchor lands on every upper/pull day): push each arm toward MRV so delivered biceps/
    // triceps clear the ~15 delivered back. Every write is MRV-clamped (floorTo); the
    // maintenance floor (applyMaintenanceFloor, run BEFORE this) keeps every non-focus
    // group ≥ MEV — these floors only RAISE the arms, they never lower another group.
    if (armsSignatureOn) {
      const biMAV = ISRAETEL_BASELINES.biceps?.MAV ?? 14;
      const biMRV = ISRAETEL_BASELINES.biceps?.MRV ?? 26;
      const triMAV = ISRAETEL_BASELINES.triceps?.MAV ?? 12;
      const triMRV = ISRAETEL_BASELINES.triceps?.MRV ?? 22;
      // Floor the arm BUDGETS toward the signature band so biceps + triceps DELIVER above
      // the maintenance back. The budget is the weekly SSOT divided across the week's arm
      // exposures; the floor lets each curl/extension reach the emphasized isolation ceiling
      // (4 sets) on its arm-capable days. LEVEL-SCALED: the per-exercise ceiling (4) + the
      // available curl/extension SLOTS bound the delivered dose, so a beginner with few arm
      // slots lands a smaller absolute total than an advanced split with more — the floor is
      // the same intent, the slots scale it. MAV is the productive signature ceiling (a
      // higher near-MRV floor MEASURED worse: the coherent weekly allocator spread the larger
      // budget across more thin-set exercises, LOWERING the delivered arms — 27/57 → 22/57).
      // `hi` (4-7d) lerps toward MRV (more arm slots to fill); 1-3d full-body weeks stay at
      // MAV. floorTo never lowers + is MRV-clamped.
      const biFloor = b === 'hi' ? Math.round((biMAV + biMRV) / 2) : biMAV; // ~20 / 14
      const triFloor = b === 'hi' ? Math.round((triMAV + triMRV) / 2) : triMAV; // ~17 / 12
      floorTo(out, 'biceps', biFloor);
      floorTo(out, 'triceps', triFloor);

      // ── NON-FOCUS COMPOUND TRIM (arms-signature closure, 2026-06-13b) ────────────
      // The bi/tri floors above raised the ARMS, but the eval still capped these
      // configs ("focus muscle NOT emphasized") because the COMPOUND-driven groups —
      // chest (pressing) and quads (squat/press) — were NEVER de-emphasized: arms only
      // emphasizes biceps/triceps/umeri and de-emphasizes umeri, so chest/quads passed
      // through at their full base budget (MAV ~14) and DELIVERED ≈1× (chest 14 ties
      // triceps, quads 9-12 beats the under-delivering biceps). An elite coach
      // programming an ARMS SPECIALIZATION drops every non-focus mover to MAINTENANCE so
      // the arms are the unambiguous signature. Cap the non-focus COMPOUND budgets to
      // their MEV (chest 8, quads 8, hams 6, glutes 6) — delivered ≈MEV, well under the
      // arms — WITHOUT orphaning anything (capTo is MEV-clamped + the maintenance floor,
      // run BEFORE this, keeps each ≥ MEV; the net is each pinned EXACTLY at MEV, never
      // below). chest is the founder's explicit no-orphan group: at MEV 8 it delivers
      // ~6-8, the "kept at maintenance, not abandoned" target. BACK is intentionally
      // NOT budget-trimmed here (a back budget shave was MEASURED net-negative — back
      // over-delivers ~1.5× from the upper/pull split slot structure, so the cap never
      // reaches delivery and it disturbs the coherent allocator; back is held at the SLOT
      // altitude by maxBackLatWork:1 above, keeping ONE maintenance lat/day). Every write
      // is MEV-clamped (capTo) so no group can drop below maintenance.
      capTo(out, 'chest', ISRAETEL_BASELINES.chest?.MEV ?? 8);
      capTo(out, 'quads', ISRAETEL_BASELINES.quads?.MEV ?? 8);
      capTo(out, 'hamstrings', ISRAETEL_BASELINES.hamstrings?.MEV ?? 6);
      capTo(out, 'glutes', ISRAETEL_BASELINES.glutes?.MEV ?? 6);
      // NOTE on BACK (maintenance on an arms focus): back is thinned only at the SLOT
      // altitude (the arms-signature maxBackLatWork session cap in FOCUS_RULES.arms holds
      // the pull/upper days to ONE back lat where it is not PR-protected, never to 0 →
      // never orphaned). A BUDGET cap toward MEV was MEASURED net-negative (26/57 vs 27/57):
      // back over-delivers ~1.5× its budget so a budget shave does not reach delivery, and it
      // disturbs the coherent allocator's per-exercise dose. Residual: a LOGGED-PR back lat
      // is PR-protected (the slot cap cannot trim it) + the Upper/Lower split at 4d gives the
      // arms few slots, so on heavily-back-logged personas the delivered back can still exceed
      // the slot-limited arms — a split-structure + PR-continuity limit, documented, NOT
      // forced (we never strip a logged lift, never drop a group below MEV).
    }
  },

  // CHEST — chest > back AND chest > triceps (tol 1 set; the sweep ran back 19-22 ≥
  // chest 16-21). chest is emphasized (lerped to MRV 22, delivers ≈1×); back over-
  // delivers ≈1.3-1.5× so capping back to chest-1 in budget still lets it pass chest in
  // DELIVERY — deflate the back cap so the DELIVERED back stays below the delivered
  // chest. triceps (chest's secondary emphasis) delivers ≈1× → cap to chest-1 budget.
  chest(out, b) {
    const ch = out.chest;
    if (typeof ch === 'number' && ch > 0) {
      const deflate = b === 'hi' ? OVERDELIVER_HI : 1;
      capTo(out, 'back', (ch - 1) / deflate); // delivered chest > delivered back
      capTo(out, 'triceps', ch - 1);          // triceps below chest
    }
  },

  // SHOULDERS — back < shoulders at every frequency (the sweep ran back 19 > shldr 16
  // @5d). shoulders is emphasized but DELIVERS only ≈0.6× budget (slot-starved delts)
  // while back over-delivers — so cap the back budget to a deflated fraction of the
  // shoulder budget so the DELIVERED back stays under the DELIVERED shoulders.
  shoulders(out, b) {
    const sh = out.shoulders;
    if (typeof sh === 'number' && sh > 0) {
      // delivered shoulders ≈ 0.6×sh; want delivered back < that → back budget ≤
      // 0.6×sh / overdeliver. At hi the back leak is the strongest.
      const deflate = b === 'hi' ? OVERDELIVER_HI : 1.1;
      capTo(out, 'back', (0.6 * sh) / deflate);
    }
  },

  // BACK — direct biceps DELIVERED ≥8 @4d+ (the sweep ran bi 4-6). The slot is injected
  // by the resolver (minDirectBicepsSlots requirement); the budget floor lifts the
  // per-session biceps dose so a single biceps slot carries ~3-4 sets across the upper/
  // pull days → ≥8/wk. back is emphasized (untouched — the back cap contracts do not
  // apply to a back FOCUS).
  back(out, b) {
    if (b === 'hi') floorTo(out, 'biceps', 16); // delivered direct biceps ≥8 @4d+
  },

  // UPPER — back ≤1.5×shoulders AND back ≤1.5×chest (the sweep ran back 35 vs tri 6 +
  // back 25 vs shldr 14 @4d); direct triceps ≥8 + direct biceps ≥8 @4d+ (tri 4-6).
  // piept/spate/umeri all emphasized. Cap back to the tighter of the two ratios in
  // DELIVERED space (deflated); floor the arms so the upper-body arm work DELIVERS.
  upper(out, b) {
    const sh = out.shoulders;
    const ch = out.chest;
    // delivered shoulders ≈0.6×budget; delivered chest ≈1×budget; back ≈1.5×budget.
    // back ≤1.5×min(delivered sh, delivered ch) → budget cap = 1.5×min(0.6 sh, ch)/1.5.
    const refsDelivered = [];
    if (typeof sh === 'number' && sh > 0) refsDelivered.push(0.6 * sh);
    if (typeof ch === 'number' && ch > 0) refsDelivered.push(ch);
    if (refsDelivered.length) {
      const deflate = b === 'hi' ? OVERDELIVER_HI : 1;
      capTo(out, 'back', (1.5 * Math.min(...refsDelivered)) / deflate);
    }
    if (b === 'hi') {
      floorTo(out, 'triceps', 16); // delivered direct triceps ≥8 @4d+
      floorTo(out, 'biceps', 14);  // delivered direct biceps ≥8 @4d+
    }
  },

  // LOWER — upper maintenance caps @4d+: back ≤0.65×max(lower), chest/triceps ≤0.55×
  // max(lower) (the sweep ran back 22 > quad 18 @6-7d). The lower region is emphasized;
  // cap the upper maintenance groups to a fraction of the biggest lower bucket so the
  // legs lead. At ≤3d (full-body) the upper work rides along — no cap (would starve a
  // full-body day's only press/pull). NOTE: the 6-7d lower split lands a back anchor on
  // its 2 upper/pull days; even at the MEV-clamped budget floor (back MEV 10) the
  // DELIVERED back stays ~16-20 (split-structure leak) — that residual is reported as
  // an unreachable-without-split-surgery gap, not forced below MEV.
  lower(out, b) {
    if (b !== 'hi') return;
    const lowerMax = Math.max(out.quads || 0, out.hamstrings || 0, out.glutes || 0);
    if (lowerMax <= 0) return;
    capTo(out, 'back', (0.65 * lowerMax) / OVERDELIVER_HI);
    capTo(out, 'chest', 0.55 * lowerMax);
    capTo(out, 'triceps', 0.55 * lowerMax);
  },
});

// ── Sub-bucket SELECTION demotion (focus-contracts arc) ──────────────────────────
// Contracts 6 + 7: on a v-taper / back / upper focus the SHRUG family (traps) and the
// BACK-EXTENSION / hyperextension / good-morning family (lower-back) are NOT the lats —
// they must NOT consume the focus's back/width slots as fillers. We DEMOTE them in the
// SELECTION pool via the EXISTING structural-penalty channel (the same demote-only,
// last-option mechanism lumbarDedup uses) so the lat-width + rear/side-delt + curl work
// is picked FIRST and a shrug/hyperext only lands if nothing better fits (keeping the
// weekly shrug ~2-3 sets, never a focus-filler). Demote-only — never a hard delete, so
// a thin pool still surfaces them rather than producing a sub-3 day. The lower-back
// family ALSO stays governed by the existing lumbar channel (mergePenalties unions the
// two — max wins). Focuses NOT in this set → empty map → byte-identical.
// v-taper/back/upper: traps/erectors steal the lat-WIDTH focus slots. chest: the
// chest>back contract needs the NON-focus back maintenance lean (a shrug/hyperext on a
// chest week's pull day is pure junk that inflates back past chest). lower: the upper
// maintenance must stay minimal (a shrug/hyperext on a lower week's upper day eats the
// back maintenance cap). All five demote shrug + lower-back to last-option in selection.
const DEMOTE_FOCUSES = Object.freeze(new Set(['v-taper', 'back', 'upper', 'chest', 'lower']));
// ARMS SIGNATURE (dp_arms_signature_v1, 2026-06-13b): `arms` joins the demote set ONLY
// under the arms-signature flag (threaded in at the call site). On an arms week back is
// MAINTENANCE — the maxBackLatWork:1 cap thins the LAT work to one anchor, but a DB Shrug
// (trap, spate-primary, NOT lat work → the cap misses it) still landed ~2 sets on each
// pull/upper day, keeping delivered back ~12 (≈ the arms it should subordinate). Demoting
// the shrug + lower-back family to last-option clears that trap junk so the freed pull/
// upper slot carries arm work and delivered back drops below the arms. Gated by the flag
// (NOT in the static DEMOTE_FOCUSES set) so OFF → arms is byte-identical to the pre-flag rule.
const ARMS_SIGNATURE_DEMOTE_FOCUS = 'arms';
/** Shrug family (traps) — spate-primary, name-matched to deriveExerciseTags 'shrug'. */
const SHRUG_FAMILY = Object.freeze([
  'BB Shrug', 'DB Shrug', 'Trap Bar Shrug', 'Cable Shrug', 'Machine Shrug',
  'Smith Machine Shrug', 'Behind-Back BB Shrug', 'Plate Shrug',
]);
/** Lower-back family (hyperextension / back extension / good-morning) — spate-primary.
 *  Mirrors deriveExerciseTags 'lower_back'. The heavy good-mornings are ALSO in the
 *  lumbar channel; listing them here adds the FOCUS demote (a back focus is lat-width,
 *  not erector work) — mergePenalties max-unions, so no double-count, just the stricter
 *  of the two. */
const LOWER_BACK_FAMILY = Object.freeze([
  'Roman Chair Back Extension', '45° Hyperextension', 'GHD Back Extension',
  'Weighted Hyperextension', 'Reverse Hyperextension', 'Hyperextension Machine',
  'Hyperextension Bodyweight', 'BB Good Morning', 'Banded Good Morning',
  'Seated Good Morning', 'Barbell Good Morning', 'Smith Good Morning', 'Zercher Good Morning',
]);

/**
 * Focus-contract SELECTION demotion map (engineName → penalty 1.0) for the shrug +
 * lower-back families on a width/back focus. Returns {} for any other focus (or when
 * the flag is off, at the call site). Pure. The penalty value 1.0 matches lumbarDedup
 * — a full demote-to-last-option, never a removal.
 *
 * @param {string|null|undefined} focusPreset
 * @param {boolean} [armsSignatureOn=false] - dp_arms_signature_v1. When ON, the `arms`
 *   focus ALSO demotes the shrug/lower-back family (back is maintenance on an arms week).
 *   OFF → arms is NOT in the demote set → byte-identical to the pre-flag rule.
 * @returns {Record<string, number>} engineName → 1.0
 */
export function focusContractDemotions(focusPreset, armsSignatureOn = false) {
  /** @type {Record<string, number>} */
  const out = {};
  const armsDemote = armsSignatureOn && focusPreset === ARMS_SIGNATURE_DEMOTE_FOCUS;
  if (!DEMOTE_FOCUSES.has(focusPreset) && !armsDemote) return out;
  for (const n of SHRUG_FAMILY) out[n] = 1.0;
  for (const n of LOWER_BACK_FAMILY) out[n] = 1.0;
  return out;
}

/**
 * Apply the per-focus WEEKLY volume contracts to an EN-keyed weekly budget map.
 * Returns a NEW map (never mutates the input). A focus with no contract (or an
 * unknown id) returns a shallow clone unchanged. Pure + deterministic.
 *
 * @param {Record<string, number>|null|undefined} volumeTargetsEN - Big-11 EN sets/week budget
 * @param {string|null|undefined} focusPreset - FOCUS_PRESETS id (balanced/v-taper/...)
 * @param {number|null|undefined} daysPerWeek - training days/week (selects the band)
 * @param {boolean} [armsSignatureOn=false] - dp_arms_signature_v1 (arms biceps/triceps
 *   volume floors). OFF → the arms contract runs its pre-flag body only (byte-identical);
 *   only the `arms` focus reads this. Other focuses ignore it.
 * @returns {Record<string, number>|null} the contracted budget (null passes through)
 */
export function applyFocusVolumeContracts(volumeTargetsEN, focusPreset, daysPerWeek, armsSignatureOn = false) {
  if (!volumeTargetsEN || typeof volumeTargetsEN !== 'object') return volumeTargetsEN ?? null;
  const fn = CONTRACTS[focusPreset];
  const out = { ...volumeTargetsEN };
  if (typeof fn !== 'function') return out;
  fn(out, band(daysPerWeek), armsSignatureOn);
  return out;
}

// ── LOWER back-cap via the cross-day week LEDGER (gap 4, dp_week_ledger_v1) ─────────
// The per-day `lower` contract above caps the back BUDGET to (0.65×max-lower)/over-
// deliver, but the founder's DELIVERED ≤0.65×max-lower cap still leaked: the lower
// split lands a back anchor on its 2 upper/pull days, and the MEV-floored back budget
// (10) over-delivers there to ~14-20 (≈ the biggest single lower bucket). The budget
// cap alone cannot push below that because it does not SEE the week's projected delivery.
//
// With the LEDGER we read the PROJECTED week-back vs the projected biggest lower bucket
// and shave the back budget HARDER when the projection still exceeds the cap — down to
// (but never below) back MEV. This is the SAME displaceable logic the focus resolver
// uses: the MEV floor is supreme (never breached), so the cap is enforced as far as the
// maintenance floor allows and the residual (if MEV itself sits above the cap) is the
// honest, documented limit. Only fires at ≥4 training days (the band where the split
// carries dedicated upper/pull days); ≤3d full-body rides along untouched.
const LOWER_BUCKETS = Object.freeze(['quads', 'hamstrings', 'glutes']);

/**
 * Shave the LOWER focus's back budget toward the founder's ≤0.65×max-lower DELIVERED
 * cap using the week ledger's projection — never below back MEV. Returns a NEW map (a
 * shallow clone when not applicable). Pure + deterministic.
 *
 * @param {Record<string, number>|null|undefined} volumeTargetsEN - the contracted budget
 * @param {string|null|undefined} focusPreset - must be 'lower' to fire
 * @param {number|null|undefined} daysPerWeek - ≥4 to fire (the split carries upper days)
 * @param {import('./weekLedger.js').WeekLedger|null|undefined} ledger - computeWeekLedger output
 * @returns {Record<string, number>|null} the back-shaved budget (null passes through)
 */
export function applyLedgerLowerBackCap(volumeTargetsEN, focusPreset, daysPerWeek, ledger) {
  if (!volumeTargetsEN || typeof volumeTargetsEN !== 'object') return volumeTargetsEN ?? null;
  const out = { ...volumeTargetsEN };
  if (focusPreset !== 'lower' || band(daysPerWeek) !== 'hi') return out;
  if (!ledger || typeof ledger.weekSetsByGroup !== 'object') return out;
  const wk = ledger.weekSetsByGroup;
  const lowerMaxDelivered = Math.max(
    0, ...LOWER_BUCKETS.map((g) => wk[g] || 0),
  );
  if (lowerMaxDelivered <= 0) return out;
  const backDelivered = wk.back || 0;
  const cap = 0.65 * lowerMaxDelivered;          // founder's DELIVERED ceiling
  if (backDelivered <= cap) return out;          // already within the cap → no shave
  // The projected delivered back exceeds the cap. Scale the BUDGET down by the SAME
  // ratio the delivery overshoots (delivered tracks budget monotonically), MEV-clamped.
  const curBudget = out.back;
  if (typeof curBudget !== 'number' || !(curBudget > 0)) return out;
  const scaled = curBudget * (cap / backDelivered);
  capTo(out, 'back', scaled); // capTo clamps to [MEV, MRV] — MEV stays supreme
  return out;
}
