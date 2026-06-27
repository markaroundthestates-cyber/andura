// ══ FULL-PATH-SIM — config + engine bridge ════════════════════════════════
// The KEYSTONE the calibration-sim could NOT reach. calibration-sim drives
// dp.js getSmartRecommendation DIRECTLY (readiness=null), so it BYPASSES the
// path-A composition chain. This harness drives the WHOLE seam:
//
//   composePlannedWorkoutToday   (scheduleAdapterAggregate.compose.ts)
//     → buildUserStateForPipeline (scheduleAdapterAggregate.builder.ts)
//     → getDailyWorkout           (engine/schedule/scheduleAdapter/getDailyWorkout.js)
//        → runPipeline            (coach/orchestrator — 8-engine pipeline, ADR 030)
//        → buildSession           (engine/sessionBuilder.js)
//     → toPlannedExercise per ex  → DP.getSmartRecommendation (path B fills load)
//     → scaleSetsByReadiness + trimSessionToTimeBudget (compose seam)
//
// so the path-A engines wired behind flags are EXERCISED end-to-end. It mirrors
// the calibration-sim structure (config / profiles / run / analyze / hash) so the
// two are comparable, and it is deterministic (mulberry32 seeded) → a CI gate.
//
// The A/B mechanism is the SAME `localStorage._devFlags` override featureFlags.js
// reads first (resolution order step 1) — NO src change, NO real flag flip.

import { composePlannedWorkoutToday } from '../../../src/react/lib/scheduleAdapterAggregate.ts';
import { persistSessionLogs } from '../../../src/react/stores/workoutStore.logic.ts';
import { useOnboardingStore } from '../../../src/react/stores/onboardingStore.ts';
import { useWorkoutStore } from '../../../src/react/stores/workoutStore.ts';
import { useAerobicStore } from '../../../src/react/stores/aerobicStore.ts';
import { DB } from '../../../src/db.js';
import { getExerciseMetadata } from '../../../src/engine/exerciseLibrary.js';
import { DEV_FLAGS_KEY } from '../../../src/util/featureFlags.js';

export const N_PROFILES = 24;       // CI tier (determinism + deltas hold at any N)
export const N_WEEKS = 16;          // weeks of sessions per user journey
export const SEED = 0xf01ce7;       // distinct from calibration-sim SEED

// The path-A flags this harness PROVES are observable + safe through the real
// seam. Each maps to the journey trait that fires it.
export const PATH_A_FLAGS = Object.freeze([
  'dp_acwr_readiness_v1',          // ACWR spike → readiness penalty → set/weight hold
  'dp_weekly_recovery_alloc_v1',   // fatigued week → weekly volume redistributed
  'dp_emphasis_specialization_v1', // user emphasis pick → spec target + trade + #72 per-exercise sets-boost
  'dp_coherent_weekly_alloc_v1',   // #71 same-lift no longer swings across days (stable per-exercise dose)
  'dp_learned_volume_v1',          // multi-week response → personal MEV/MAV landmarks
  'dp_stimulus_per_min_v1',        // tight time budget → densest-first trim
  // dp_dip_classifier_v1 + dp_auto_pivot_v1 have NO live caller in the compose
  // path (dark primitives) — exercised at their reachable seam in fp-darkprimitives,
  // NOT here, and flagged honestly in the report. Including them here would be
  // faking full-path coverage they do not have.
]);

// The set of dp_*_v1 intelligence flags FLIPPED to registry-default ON (the clean
// partial flip 2026-06-08 — the subset proven 100% on the #70 persona-matrix AND
// green on the full suite; the e1rm/kalman/ceiling/population_prior/acwr/learned-
// volume/weekly-recovery/stimulus cluster stayed OFF because their ON behavior
// breaks pinned per-exercise unit contracts — reported as needs-fix). The frozen
// A/B baselines (hashOff = all-off world, hashOn = PATH_A-on / rest-off) were
// generated when these defaulted OFF — so once the registry defaults to ON, this
// harness can no longer rely on "no _devFlags ⇒ off". setPathAFlags now writes an
// EXPLICIT _devFlags map over this set so the OFF arm forces them all OFF and the
// ON arm forces exactly PATH_A_FLAGS ON (the rest OFF), making the A/B independent
// of the registry default — the SAME _devFlags-override mechanism, no engine
// change, baselines preserved byte-for-byte.
export const FLIPPED_FLAGS = Object.freeze([
  'dp_emphasis_specialization_v1', 'dp_coherent_weekly_alloc_v1',
  'dp_pain_deprioritize_v1', 'dp_pain_memory_v1', 'dp_effective_reps_v1',
  'dp_tendon_cap_v1', 'dp_deficit_throttle_v1', 'dp_energy_volume_v1',
  // THE FLIP 2026-06-08 — per-exercise intelligence brain + path-A dependents now
  // default ON. Added here so the A/B OFF baseline forces them explicitly OFF
  // (the harness can no longer rely on "no _devFlags ⇒ off"), keeping hashOff a
  // true all-off baseline byte-for-byte.
  'dp_e1rm_v1', 'dp_strength_kalman_v1', 'dp_ceiling_v1',
  'dp_population_prior_v1', 'dp_acwr_readiness_v1', 'dp_learned_volume_v1',
  'dp_weekly_recovery_alloc_v1', 'dp_stimulus_per_min_v1',
  // THE FLIP 2026-06-09 — #7 metric-types now defaults ON (the seconds INPUT UI
  // landed W2). Added here so the A/B arms force it explicitly OFF: the prescription
  // stream pins weight×reps for EVERY exercise; honoring metric-types would suppress
  // reps→targetSec for time/carry holds and move the frozen hashes. The honoring is
  // a CORRECTNESS fix (a Plank in seconds, not phantom reps) verified on the live
  // compose path + the #70 matrix, NOT in this determinism stream.
  'dp_metric_types_v1',
  // THE FLIP 2026-06-09 — Wave 1.3-D focus-policy now defaults ON (caps +
  // per-session requirements + weekly-as-session, verified 25/25 on the #70
  // persona matrix). Added here so the A/B arms force it explicitly OFF: the
  // frozen prescription stream pins a fixed per-focus composition for every
  // profile; honoring the focus-policy caps/requirements would prune/inject
  // exercises and move the frozen hashes. The ON behavior is proven correct on
  // the #70 matrix + the persona-acceptance suite, NOT in this determinism stream.
  'dp_focus_policy_v1',
  // THE FLIP 2026-06-09 — W-Goal coherent strength (dp_strength_goal_v1, scoped to
  // forta only after the corridor-leak fix) + focus-aware split rebalance
  // (dp_split_rebalance_v1) now default ON. Added here so the A/B arms force them
  // explicitly OFF: the all-off baseline stays a true all-off world (the harness can
  // no longer rely on "no _devFlags ⇒ off"), keeping hashOff byte-for-byte. ON behavior
  // is proven on the #70 matrix + the unit suites, NOT in this determinism stream.
  'dp_strength_goal_v1', 'dp_split_rebalance_v1',
  // THE FLIP 2026-06-10 (R4) — anchor-protective shave defaults ON (the non-
  // recovered shave exempts the anchor compound, re-shaved from the back).
  // Path-A SETS distribution → pinned OFF here so hashOff stays byte-for-byte.
  'dp_anchor_sets_v1',
  // THE FLIP 2026-06-10 — metadata-derived rep-range resolver now defaults ON
  // (izolarile primesc banda lor de clasa 12-20/15-20; CUT nu le mai striveste la
  // 10). Added here so the A/B arms force it explicitly OFF: the frozen stream
  // pins the legacy rep band per exercise; honoring the derived/curated ranges
  // would move the frozen hashes. ON behavior is proven on Daniel's before/after
  // probe + the #70 persona matrix, NOT in this determinism stream.
  'dp_rep_class_v1',
  // THE FLIP 2026-06-10 (R6a) — upper-day biceps guarantee defaults ON (a cluster
  // that trains biceps injects one if selection rounded it out). Path-A selection
  // surface → pinned OFF here so the frozen composition hashes stay byte-for-byte.
  'dp_biceps_guarantee_v1',
  // THE FLIP 2026-06-13 (R6a-T) — full-body triceps guarantee defaults ON (a
  // full-body day injects one direct-triceps lift if selection rounded it out).
  // Path-A selection surface → pinned OFF here so the frozen composition hashes
  // stay byte-for-byte.
  'dp_triceps_fullbody_guarantee_v1',
  // THE FLIP 2026-06-13 (R6a-T2) — split-day (UPPER/LOWER) triceps guarantee defaults
  // ON (an upper day on a no-push week suppresses the #2 triceps de-dup AND injects one
  // direct-triceps lift if selection rounded it out). Path-A selection surface → pinned
  // OFF here so the frozen composition hashes stay byte-for-byte (OFF → de-dup runs
  // unchanged + the guarantee never fires → byte-identical baseline).
  'dp_triceps_split_guarantee_v1',
  // THE FLIP 2026-06-13 (R6b) — spate-injury hamstring leg-curl guarantee defaults
  // ON (a disc/lower-back user whose hinge family is excluded gets a spine-neutral
  // leg curl injected if hamstrings were orphaned). INERT in this harness either way
  // (the fp journeys seed NO spate/lower-back pain → null excludedMovements → the
  // sentinel gate is never satisfied), pinned OFF anyway for the all-off-world
  // guarantee (the frozen composition hashes stay byte-for-byte).
  'dp_legcurl_guarantee_v1',
  // THE FLIP 2026-06-14 (knee-safe quads) — a KNEE injury also excludes the loaded Leg
  // Press family + step-up/wall-sit (hip-dominant leg day). INERT in this harness either
  // way (the fp journeys seed NO knee pain → null excludedMovements → the sentinel gate is
  // never satisfied), pinned OFF anyway for the all-off-world guarantee (the frozen
  // composition hashes stay byte-for-byte).
  'dp_knee_safe_quads_v1',
  // THE FLIP 2026-06-14 (shoulder-impingement safe) — a SHOULDER injury (umeri) also excludes
  // deep Dips + the behind-the-back/behind-neck lateral + behind-neck press (joint-friendly
  // substitution). INERT in this harness either way (the fp journeys seed NO shoulder pain →
  // null excludedMovements → the sentinel gate is never satisfied), pinned OFF anyway for the
  // all-off-world guarantee (the frozen composition hashes stay byte-for-byte).
  'dp_shoulder_safe_v1',
  // THE FLIP 2026-06-14 (orphaned-hamstrings fix) — the masa/forta HAMSTRING floor defaults
  // ON (a hypertrophy/strength program never zeroes hamstrings on a leg-training cluster: a
  // hinge/leg-curl is injected via a length-stable swap when hams would be 0). The fp cohort
  // DOES include masa/forta journeys on full/lower/legs clusters, so the ON behavior WOULD
  // move the frozen composition hashes — pinned OFF here (in FLIPPED_FLAGS only, NOT
  // PATH_A_FLAGS) so ctx.hamstringFloor is false → the new block never runs → BOTH frozen
  // baselines (hashOff/hashOn) stay byte-for-byte. ON is proven on the eval grid (masa/forta
  // hams==0 → ~0, focus still leads, p7/spate uses leg curl not RDL, maintenance/older
  // unchanged) + the new hamstring-floor regression test, NOT in this determinism stream.
  'dp_hamstring_floor_v1',
  // THE FLIP 2026-06-13 (orphaned-legs fix) — the FULL-BODY posterior+quad floor
  // defaults ON (a freq 1-3 full-body day under an upper-biased focus that would
  // otherwise zero legs gets a quad slot + a posterior slot guaranteed). Pinned OFF here
  // so ctx.posteriorChainFloor is false → the new block never runs → the frozen
  // composition hashes stay byte-for-byte. ON is proven on the eval grid + the
  // posteriorChainFloor regression suite + the focus-signature gate, NOT in this stream.
  'dp_posterior_chain_floor_v1',
  // THE FLIP 2026-06-14 (freq-1 orphaned-legs fix) — the SINGLE-DAY full-body leg floor
  // defaults ON (a freq-1 full-body day trades a redundant accessory for the missing quad/
  // posterior compound so legs are not orphaned for the whole week). The fp cohort journeys
  // run multi-day weeks (N_WEEKS sessions), so daysPerWeek > 1 → the new freq-1 branch never
  // fires → already inert, pinned OFF anyway (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) for the
  // all-off-world guarantee (the frozen composition hashes stay byte-for-byte).
  'dp_fullbody_leg_floor_v1',
  // THE FLIP 2026-06-13 (arms-signature eval ceiling) — the arms-focus volume/slot
  // signature (umeri demoted out of the emphasize list + biceps/triceps weekly volume
  // floors) defaults ON. `arms` IS in this harness's EMPHASIS_PRESETS, so the ON
  // behavior WOULD move the frozen prescription hashes — pinned OFF here so hashOff/
  // hashOn stay byte-for-byte; ON is proven on the eval grid + the focus-signature gate
  // + the arms-signature regression suite, NOT in this determinism stream.
  'dp_arms_signature_v1',
  // THE FLIP 2026-06-14 (arms-focus major-protect re-judge regression) — the arms-focus
  // CHEST + lateral-delt guarantees (repairing the chest/shoulder starvation arms-signature
  // causes) default ON. `arms` IS in this harness's EMPHASIS_PRESETS and it only fires WITH
  // dp_arms_signature_v1, so the ON behavior WOULD move the frozen prescription hashes —
  // pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so ctx.armsChestFloor +
  // ctx.lateralDeltGuarantee(arms) are false in both A/B arms → the new blocks never run →
  // BOTH frozen baselines (hashOff/hashOn) stay byte-for-byte. ON is proven on the eval grid
  // (arms chest >= MEV + a lateral lands, bi/tri still lead) + the arms-protect regression
  // test + the arms-signature gate, NOT in this determinism stream.
  'dp_arms_protect_majors_v1',
  // THE FLIP 2026-06-16 (lower-focus 5d back-orphan fix) — the back maintenance floor defaults
  // ON. On a LOWER-emphasis 5/6/7d split (legs/upper/lower/PUSH/legs…) chest gets a 2nd weekly
  // exposure (the push day) while back rides the lone `upper` day, so on a slot-starved upper
  // session back collapses below maintenance; ON swaps one surplus upper-day chest press for a
  // back row. `lower` IS in this harness's EMPHASIS_PRESETS, so the ON behavior WOULD move the
  // frozen prescription hashes — pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so
  // ctx.backMaintenanceFloor is false in both A/B → the new block never runs → BOTH frozen
  // baselines (hashOff/hashOn) stay byte-for-byte. ON is proven on the eval grid (p2/p3/p5_
  // lower_5d back 3 -> 6 toward MV, chest stays >= MEV, p4/p12 untouched) + the back-maintenance-
  // floor regression test, NOT in this determinism stream.
  'dp_back_maintenance_floor_v1',
  // THE FLIP 2026-06-16 (arms full-day signature fix) — the arms full-day chest→arm swap defaults
  // ON. On an ARMS focus whose week runs FULL-body days, redundant chest PRESSES stack (2/day) so
  // chest out-volumes the focus arms; ON swaps one surplus full-day chest press for an under-served
  // direct-arm movement. `arms` IS in this harness's EMPHASIS_PRESETS, so the ON behavior WOULD move
  // the frozen prescription hashes — pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so
  // ctx.armsFulldaySwap is false in both A/B arms → the new block never runs → BOTH frozen baselines
  // (hashOff/hashOn) stay byte-for-byte. ON is proven on the eval grid (p7/p2_arms full-day: one
  // chest press/day → arm work, chest stays >= MEV, bi/tri rise toward MAV, total unchanged; arms
  // U/L upper-day path + non-arms focuses byte-identical) + the new arms-fullday-swap regression
  // test, NOT in this determinism stream.
  'dp_arms_fullday_swap_v1',
  // THE FLIP 2026-06-17 (arms push/upper-day consolidate, C21-SEL-02) — the arms push/upper-day
  // chest→arm consolidation defaults ON. On an ARMS focus whose week has a dedicated PUSH day (the
  // 5-day arms split), redundant tier-1 chest PRESSES stack (3-4/day across flat/incline/dip sub-
  // families) so chest out-volumes the focus arms; ON keeps one best chest press (MEV) and swaps each
  // surplus press for an under-served direct-arm movement. `arms` IS in this harness's EMPHASIS_PRESETS,
  // so the ON behavior WOULD move the frozen prescription hashes — pinned OFF here (in FLIPPED_FLAGS
  // only, NOT PATH_A_FLAGS) so ctx.armsPushdaySwap is false in both A/B arms → the new block never runs
  // → BOTH frozen baselines (hashOff/hashOn) stay byte-for-byte. ON is proven on the eval grid (arms
  // 5d push day: 3 presses → 1 press + arm work, chest stays >= MEV, bi/tri rise; non-arms + full-day
  // arms path byte-identical) + the new arms-pushday-consolidate regression test, NOT in this stream.
  'dp_arms_pushday_consolidate_v1',
  // THE FLIP 2026-06-10 (R5) — metadata-derived load model defaults ON (a derived
  // maxKg cap + equipment step fills the ~uncapped exercises; curated wins). It
  // moves prescribed kg + the at-cap brake → pinned OFF here so hashOff/hashOn
  // stay frozen; ON is proven on the Daniel probe + loadModel.test.js + #70.
  'dp_load_model_v1',
  // THE FLIP 2026-06-10 (R6d) — cross-week lumbar dedup defaults ON (a repeat
  // leg/posterior day demotes the heavy hinge family). Composition surface →
  // pinned OFF here so the frozen hashes stay byte-for-byte; ON is the exact
  // RDL+Hyperextension fix from Daniel's real week, demote-only + guarded.
  'dp_lumbar_dedup_v1',
  // THE FLIP 2026-06-10 — refusal-memory soft demote defaults ON. Inert in this
  // harness either way (resetWorld clears localStorage → no refusal entries),
  // pinned OFF anyway for the all-off-world guarantee.
  'dp_refusal_memory_v1',
  // THE FLIP 2026-06-12 (founder Busy/Missing redesign) — equipment-memory HARD
  // exclusion defaults ON. Inert in this harness either way (resetWorld clears
  // localStorage → no remembered-missing exercises), pinned OFF anyway for the
  // all-off-world guarantee (the frozen composition hashes stay byte-for-byte).
  'dp_equipment_memory_v1',
  // THE FLIP 2026-06-24 (founder Smith-machine avoid) — equipment_smith_avoid_v1
  // defaults ON. Inert in this harness either way (resetWorld clears localStorage →
  // the missing-equipment picker set is empty → no 'smith' → empty Smith union),
  // pinned OFF anyway for the all-off-world guarantee (frozen hashes byte-for-byte).
  'equipment_smith_avoid_v1',
  // Real-data coaching fixes 2026-06-24 (founder behavior-log) — default ON,
  // composition surfaces → pinned OFF so the frozen full-path hashes stay byte-for-byte.
  'dp_deload_self_feed_fix_v1', 'dp_coldstart_press_class_v1',
  // THE FLIP 2026-06-10 (F5) — cross-day lat-iso dedup defaults ON (the upper
  // day defers a weekly minimum its specialist pull/back days already deliver).
  // Composition surface → pinned OFF so the frozen hashes stay byte-for-byte;
  // ON is proven on the resolver suite + the #70 persona matrix.
  'dp_latiso_dedup_v1',
  // THE FLIP 2026-06-11 (gym-log arc) — four composition/load surfaces default
  // ON; pinned OFF here so the frozen hashes stay byte-for-byte. transfer/ladder
  // are load-path (cohort logs adherently → mostly inert, pinned for the all-off
  // guarantee); rotation is inert in-harness anyway (resetWorld clears logged
  // PRs → no rotatable pair).
  'dp_transfer_coldstart_v1',
  'dp_learned_ladder_v1',
  'dp_equipment_ladder_v1',
  // THE FLIP 2026-06-12 (founder live gym session) — real-machine-stack snap defaults
  // ON. Load-path (snaps a rec onto the founder's measured pin stack). The cohort
  // exercises route through the GENERIC ladders not the founder's named stations, so
  // it is mostly inert in-harness, but pinned OFF here for the all-off-world guarantee
  // (the frozen prescription hashes stay byte-for-byte).
  'dp_real_ladder_snap_v1',
  // THE FLIP 2026-06-12 (founder goal — per-user station ladder) — dp_user_ladder_v1
  // defaults ON. Load-path (snaps a rec onto THE USER's own learned-from-logs station
  // ladder, with precedence over the founder stacks). The cohort logs adherently and
  // routes through the generic ladders, so it is mostly inert in-harness, but pinned
  // OFF here for the all-off-world guarantee (the frozen prescription hashes stay
  // byte-for-byte; if a hash moved, the gating would be leaking).
  'dp_user_ladder_v1',
  // CABLE TOWER (Bug 2 2026-06-27) — dp_cable_tower_v1 routes the founder's Cable Row
  // to the 10lb cable stack instead of ROW step-6. Load-path (the snapped rec kg moves:
  // Cable Row 73->73 not 72, 68->68 not 66), pinned OFF here (in FLIPPED_FLAGS only,
  // NOT PATH_A_FLAGS) so BOTH A/B arms force the legacy ROW snap → the frozen full-path
  // hashes stay byte-for-byte. ON behavior is proven on the realMachineStacks +
  // dp.machineCalibration suites, not this determinism stream.
  'dp_cable_tower_v1',
  // THE FLIP 2026-06-16 (cycle-10 ladder-snap reconcile) — dp_ladder_snap_reconcile_v1
  // defaults ON. recommend() reconciles the FINAL kg with the real ladder so a down/up
  // step that the snap collapsed onto the same rung lands on a real rung that MOVED, and
  // the PR-floor restore snaps UP to the nearest real rung >= the proven load (never
  // below). It is load-path (a kg change the full-path stream could see — roundToStep's
  // nearest snap can collapse a step even on the generic ladder), pinned OFF here (in
  // FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so BOTH A/B arms force the legacy pre-snap kg/
  // note → the frozen full-path hashes (hashOff/hashOn) stay byte-for-byte. ON behavior
  // (Cable Row eases to a real lower rung; squat floor restores to 110 not 100) is proven
  // on the dp.ladderReconcile cluster-10 regression suite, NOT this determinism stream.
  'dp_ladder_snap_reconcile_v1',
  'dp_accessory_rotation_v1',
  'dp_warmup_ramp_v1',
  'dp_progression_bonus_v1',
  'dp_base_lookback_v1',
  'dp_recovery_dose_v1',
  // THE FLIP 2026-06-12 (focus-contracts arc) — per-focus WEEKLY volume contracts
  // (back caps, biceps/triceps/shoulder floors, cross-group ratio caps) + the
  // sub-bucket OHP/shrug/close-grip caps default ON. Composition/volume surface →
  // pinned OFF here so the frozen prescription hashes stay byte-for-byte; ON behavior
  // is proven on the focus×frequency sweep + the focus-signature gate, NOT in this
  // determinism stream.
  'dp_focus_contracts_v1',
  // THE FLIP 2026-06-12 (focus-contracts arc — week-ledger closure) — the cross-day week
  // ledger (per-group SET + per-sub-bucket SLOT projection of the week's prior days)
  // defaults ON. Composition surface → pinned OFF here so the frozen prescription hashes
  // stay byte-for-byte; ON behavior is proven on the focus-signature gate (the 4 closed
  // GAP asserts) + the focus/frequency sweep, NOT in this determinism stream.
  'dp_week_ledger_v1',
  // THE FLIP 2026-06-15 (cross-week carryover balance) — dp_carryover_balance_v1 defaults
  // ON (a region scheduled last microcycle that got ZERO real sets is front-loaded to the
  // earliest spacing-safe slot this week — placement only, no volume cram). The fp cohort
  // logs adherently (every scheduled cluster gets real sets), so owed is normally [] and it
  // is mostly inert in-harness, but pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS)
  // for the all-off-world guarantee so BOTH frozen hashes (hashOff/hashOn) stay byte-for-byte
  // even if a journey ever skipped a region. ON behavior is proven on the new carryoverBalance
  // unit suite (the founder v-taper @4d skipped-lower case), NOT in this determinism stream.
  'dp_carryover_balance_v1',
  // THE FLIP 2026-06-15 (persona-aware MRV ceiling) — dp_mrv_ceiling_v1 defaults ON. It
  // caps the DELIVERED weekly per-muscle total at the persona MRV by trimming the above-
  // MRV excess (an EXACT weekly recompute decides WHICH muscles are over). Composition/
  // volume surface → the ON behavior WOULD trim an over-MRV cohort journey's session and
  // move the frozen prescription hashes — pinned OFF here (in FLIPPED_FLAGS only, NOT
  // PATH_A_FLAGS) so ctx.mrvCeiling is null in both A/B arms → BOTH frozen baselines
  // (hashOff/hashOn) stay byte-for-byte. ON behavior is proven on the eval grid (only
  // over-MRV configs change, all genuinely over) + the focus/persona gates, NOT in this
  // determinism stream.
  'dp_mrv_ceiling_v1',
  // THE FLIP 2026-06-12 (isolation-rotation arc) — INTRA-WEEK isolation rotation
  // defaults ON (adjacent training days vary the equal-ish UNLOGGED isolation by the
  // training-day ordinal). UNLIKE the cross-week dp_accessory_rotation_v1 this is NOT
  // inert in-harness: the cohort's UNLOGGED isolations ARE present even though
  // resetWorld clears logged PRs, so the rotation WOULD reorder the pool head. Pinned
  // OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so BOTH frozen hashes stay
  // byte-for-byte; ON behavior is proven on the new sessionBuilder.intraWeekRotation
  // suite + the sweep adjacency drop, NOT in this determinism stream.
  'dp_rotation_intraweek_v1',
  // THE FLIP 2026-06-13 (hard user time-cap fit) — dp_hard_time_cap_v1 defaults ON.
  // It lets a USER-SET sessionTimeBudgetMin pierce the trim floor so the session
  // actually fits the stated minutes. This harness's `tight_time` trait DOES set
  // sessionTimeBudgetMin:40 (fp-run applyTraitSignals), so the ON behavior WOULD
  // shrink that journey's sessions below the floor and move the frozen hashes —
  // pinned OFF here so BOTH frozen baselines stay byte-for-byte (the tight_time
  // journey keeps its floor-bounded trim). ON is proven on the eval grid (p9
  // <=35min) + the trimSessionToTimeBudget unit suite, NOT in this determinism
  // stream.
  'dp_hard_time_cap_v1',
  // THE FLIP 2026-06-13 (finer sub-family selection dedup) — dp_selection_dedup_v1
  // defaults ON. It keys the in-session movement dedup with deepFamily=true so a
  // "bench" resolves to its chest-press sub-family (two flat presses collapse to one
  // press slot; the freed slot fills with the in-pool complementary incline = a SWAP,
  // never an add). Composition/selection surface → the ON behavior WOULD move the
  // frozen full-path prescription hashes (a chest day re-keys + swaps), so it is
  // pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) → deepFamily false →
  // movementKey is byte-identical → BOTH frozen baselines (hashOff/hashOn) stay
  // byte-for-byte. ON behavior is proven on the eval grid (chest flat-press duplicate
  // occurrences drop sharply, avg exercises/day UNCHANGED) + the new selectionDedup
  // regression suite, NOT in this determinism stream.
  'dp_selection_dedup_v1',
  // THE FLIP 2026-06-13 (beginner volume v2) — dp_beginner_volume_v2 defaults ON.
  // It lowers the BEGINNER experience scalar (0.70 → 0.55, 0.50 for age ≥ 60) so a
  // novice's weekly volume lands in the evidence-based band. The fp cohort DOES
  // include incepator journeys (resolveExperienceId reads user.experience), and the
  // ON behavior WOULD shrink their base periodization volume map → move the frozen
  // prescription hashes. Pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so
  // the beginner scalar stays 0.70 in both A/B arms → BOTH frozen baselines
  // (hashOff/hashOn) stay byte-for-byte. ON behavior is proven on the eval grid
  // (p1/p10 totals + max-emphasized into band, no muscle below MEV) + the new
  // volumeLandmarks beginner-v2 regression suite, NOT in this determinism stream.
  'dp_beginner_volume_v2',
  // THE FLIP 2026-06-13 (beginner session-size cap) — dp_beginner_session_size_v1
  // defaults ON. It caps a BEGINNER's session at ~5 compound-first exercises (in
  // place of SESSION_SIZE=8) so a novice gets the elite-coach <=4-5 movements/day.
  // The fp cohort DOES include incepator journeys (resolveExperienceId reads
  // user.experience), and the ON behavior WOULD shrink their session fill + relax
  // the iso guarantees → move the frozen prescription hashes. Pinned OFF here (in
  // FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so ctx.beginnerSessionSize is null → the
  // builder uses SESSION_SIZE=8 in both A/B arms → BOTH frozen baselines (hashOff/
  // hashOn) stay byte-for-byte. ON behavior is proven on the eval grid (p1/p10 ex/
  // day ~5, focus leads, majors compound-covered) + the new beginner-session-size
  // regression test + the focus-signature gate, NOT in this determinism stream.
  'dp_beginner_session_size_v1',
  // THE FLIP 2026-06-16 (beginner calf rescue) — dp_beginner_calf_rescue_v1 defaults
  // ON. At the beginner 5-slot cap a balanced full-body day seats chest/back/quads +
  // a shoulders-iso + a hams-iso, so calves (gambe) got ZERO sets all week. When ON,
  // buildSession seats one calf slot via a SWAP (displace a secondary-covered or non-
  // major iso, never a compound/leg/focus). The fp cohort includes incepator full-body
  // journeys, so the ON swap WOULD move their frozen prescription hashes — pinned OFF
  // here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so ctx.beginnerCalfRescue is false
  // → the rescue never runs in either A/B arm → BOTH frozen baselines (hashOff/hashOn)
  // stay byte-for-byte. ON behavior is proven on the beginnerCalfRescue gate test
  // (Maria-65 + young beginner get calves; intermediate control unchanged), NOT in
  // this determinism stream. Selection-only (no dp.js load math) → no sim-config pin.
  'dp_beginner_calf_rescue_v1',
  // THE FLIP 2026-06-14 (low-capacity weekly-band clamp) — dp_lowcap_weekly_band_v1
  // defaults ON. It clamps a MAINTENANCE-goal or OLDER (age >=60) trainee's per-muscle
  // weekly DELIVERED volume into the maintenance band so the total no longer scales
  // linearly with frequency. The fp cohort DOES include mentenanta / age->=60 journeys
  // (buildUserStateForPipeline threads user.goal + user.age), and the ON behavior WOULD
  // trim those sessions → move the frozen prescription hashes. Pinned OFF here (in
  // FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so ctx.lowCapWeeklyBand is null in both A/B
  // arms → no clamp → BOTH frozen baselines (hashOff/hashOn) stay byte-for-byte. ON
  // behavior is proven on the eval grid (p9 <=45, p10 <=42 at all freq, no muscle below
  // the maintenance floor, trained adults byte-identical) + the new lowcap-band
  // regression test, NOT in this determinism stream.
  'dp_lowcap_weekly_band_v1',
  // THE FLIP 2026-06-14 (maintenance volume band) — a MAINTENANCE GOAL's focus muscle uses
  // the LOWER maintenance focus ceiling (7, not the growth 11) so even the focus sits at
  // maintenance. The fp cohort DOES include mentenanta journeys, so the ON behavior WOULD
  // trim those focus sessions → move the frozen hashes — pinned OFF here (in FLIPPED_FLAGS
  // only, NOT PATH_A_FLAGS) so lowCapBand.maintenanceGoal is false in both A/B arms → the
  // growth focus ceiling holds → BOTH frozen baselines stay byte-for-byte. ON is proven on
  // the eval grid (p9/p10 focus <=7, no MAV, masa/older p11 unchanged) + the lowcap-band
  // maintenance regression test, NOT in this determinism stream.
  'dp_maintenance_volume_band_v1',
  // THE FLIP 2026-06-14 (focus-leads-on-splits) — dp_focus_lead_splits_v1 defaults ON. On
  // a pure UPPER/LOWER split where a lower/arms focus does NOT clearly lead, it trims the
  // non-focus majors toward MEV (+ for arms guarantees a 2nd arm slot) so the focus leads.
  // `lower` and `arms` ARE in this harness's EMPHASIS_PRESETS, so the ON behavior WOULD move
  // the frozen prescription hashes — pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS)
  // so ctx.focusLeadSplits is null in both A/B arms → no trim/swap → BOTH frozen baselines
  // (hashOff/hashOn) stay byte-for-byte. ON is proven on the eval grid (p2/p8/p12_lower legs
  // lead, p2/p7_arms bi+tri lead + each >= MEV, already-leading configs byte-identical) + the
  // new focus-lead-splits regression test, NOT in this determinism stream.
  'dp_focus_lead_splits_v1',
  // THE FLIP 2026-06-15 (arms focus-lead on non-U/L splits) — dp_focus_lead_arms_nonul_v1
  // defaults ON. It relaxes dp_focus_lead_splits_v1's pure-U/L scope guard so the arms trim +
  // arm-slot guarantee ALSO fire on a 5-day arms split (['upper','lower','push','pull','legs'])
  // which has no dedicated arm/full day. `arms` IS in this harness's EMPHASIS_PRESETS, so an
  // arms-ish 5-day-style journey ON would move the frozen prescription hashes — pinned OFF here
  // (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so ctx.focusLeadSplits stays null on non-U/L arms
  // splits in both A/B arms → no trim/swap → BOTH frozen baselines (hashOff/hashOn) stay
  // byte-for-byte. ON is proven on the eval grid (5-day arms: non-focus majors → MEV, bi/tri
  // get their slots + lead; 4-day arms + non-arms focuses byte-identical) + the new arms-non-U/L
  // regression test, NOT in this determinism stream.
  'dp_focus_lead_arms_nonul_v1',
  // THE FLIP 2026-06-14 (lateral-delt guarantee) — dp_lateral_delt_guarantee_v1 defaults ON.
  // On a v-taper/shoulders focus the umeri-training session guarantees >=1 direct lateral
  // raise (the #1 width driver), preferring to displace a redundant 2nd overhead press.
  // `v-taper` IS in this harness's EMPHASIS_PRESETS, so the ON behavior WOULD move the frozen
  // prescription hashes — pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so
  // ctx.lateralDeltGuarantee is false in both A/B arms → the new block never runs → BOTH
  // frozen baselines (hashOff/hashOn) stay byte-for-byte. ON is proven on the eval grid
  // (v-taper/shoulders OHP-only 28 -> ~0, focus still leads, no double-OHP, other focuses
  // byte-identical) + the new lateral-delt-guarantee regression test, NOT in this stream.
  'dp_lateral_delt_guarantee_v1',
  // THE FLIP 2026-06-14 (auto-infer frequency) — dp_auto_infer_frequency_v1 defaults
  // ON. It scales a user's WEEKLY volume budget down when their logged training cadence
  // falls SHORT of the configured frequency (inferred-vs-configured ratio, MEV-floored).
  // This harness's journeys DO build real multi-week sessionsHistory (the cohort logs
  // adherently via persistSessionLogs), so recentSessions is NON-empty and the inferred
  // frequency WOULD fire and scale the budget → move the frozen prescription hashes.
  // Pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so the inference is never
  // invoked in either A/B arm → baseVolumeTargets is the raw periodization budget → BOTH
  // frozen baselines (hashOff/hashOn) stay byte-for-byte. ON behavior is a REAL-USER
  // behavior feature (NOT eval-measurable: the eval grid is cold-start — it seeds DP load
  // logs but NOT sessionsHistory → recentSessions empty → null → byte-identical), proven
  // on the new inferFrequency regression suite (mismatch configured-5/logged-3 → inferred
  // 3 → delivered weekly volume drops to the 3-day level), NOT in this determinism stream.
  'dp_auto_infer_frequency_v1',
  // THE FLIP 2026-06-16 (chronic-low-adherence volume) — dp_adherence_volume_v1 defaults
  // ON. It scales a user's WEEKLY volume budget down when their recent-window adherence
  // (computeAdherence score/100, 21d) shows chronic UNDER-EXECUTION (executed << proposed)
  // with no 3-week gap, combined with the inferred-frequency ratio by the MIN (a single
  // discount, never doubled), MEV-floored. The fp cohort logs ADHERENTLY (every scheduled
  // session is executed via persistSessionLogs → executed == proposed → score 100 → ratio
  // 1), so it is INERT in this harness either way — but pinned OFF here (in FLIPPED_FLAGS
  // only, NOT PATH_A_FLAGS) so the adherence ratio is forced to 1 in both A/B arms → the
  // weekly-volume seam is unchanged → BOTH frozen baselines (hashOff/hashOn) stay
  // byte-for-byte even if a journey's adherence ever drifted. ON behavior is a REAL-USER
  // behavior feature (NOT eval-measurable: the eval grid is cold-start — no CDL entries →
  // proposed 0 → null → ratio 1 → byte-identical), proven on the new adherence-volume
  // regression suite, NOT in this determinism stream.
  'dp_adherence_volume_v1',
  // THE FLIP 2026-06-14 (Wave B brain-on) — six composition/path-A flags default ON:
  // behavioral-tier (tier override → session count/volume), tier-compound-floor (T0
  // fresh floor 3->2), fatigue-curve (±1 set; already in ANDURA_ON_FLAGS), smart-
  // selection (lateral-raise guarantee), learned-recovery (per-muscle recovery map),
  // plateau-intervention (rep_shift on stagnation). All move the frozen composition/kg
  // hashes, so pinned OFF here so hashOff/hashOn stay byte-for-byte. ON behavior is
  // validated on the persona-matrix + the final eval-grid judge, NOT in this stream.
  'dp_behavioral_tier_v1', 'dp_tier_compound_floor_v1', 'dp_fatigue_curve_v1',
  'dp_smart_selection_v1', 'dp_learned_recovery_v1', 'dp_plateau_intervention_v1',
  // THE FLIP 2026-06-14 (Wave C/D brain-on) — kg-path + learning + schedule flags default ON;
  // pinned OFF here so hashOff/hashOn stay byte-for-byte (ON is validated on the calibration-sim
  // convergence + persona-matrix + the eval judge, NOT this determinism stream). Note: the §B
  // dark-primitive tests still set #26/#32 ON explicitly for their own behavior assertions.
  'dp_ego_cap_v1', 'dp_temperament_v1', 'dp_trend_signal_v1', 'dp_load_transition_v1',
  // dp_ego_cap_easy_exempt_v1 (easy-exempt refinement of #6/B) → pinned OFF here so
  // both A/B arms pass wasEasy:false → isEgoJump is byte-identical legacy → the frozen
  // full-path hashes (hashOff/hashOn) stay byte-for-byte.
  'dp_ego_cap_easy_exempt_v1',
  'dp_log_outlier_v1', 'dp_behavior_distill_v1', 'dp_subrecovery_drift_v1', 'dp_dip_classifier_v1',
  'dp_nof1_v1', 'dp_library_chains_v1', 'dp_strength_bw_ratio_v1', 'dp_maintenance_freq_reshape_v1',
  // THE FLIP 2026-06-14 (low-capacity effective-frequency cap) — extends the maintenance/older
  // day-cap to INJURED (3) / BEGINNER (4) trainees so a high requested freq isn't honored for a
  // low-capacity trainee. The fp cohort includes incepator journeys (resolveExperienceId reads
  // user.experience), so the ON beginner cap WOULD reshape their week → move the frozen hashes —
  // pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so lowCapacityMaxDays is never
  // consulted in either A/B arm → BOTH frozen baselines stay byte-for-byte. ON is proven on the
  // eval grid (p6 freq 6/7 → 3 spaced days) + the lowCapacityMaxDays regression test, NOT here.
  'dp_lowcap_effective_freq_v1',
  // THE FLIP 2026-06-15 (LIFE_DIP real inputs) — dp_lifedip_inputs_v1 defaults ON. It
  // feeds the #32 dip classifier the REAL closedDaysRecent (computeAdherence skipped
  // count) + kcalShortfall (a CUT-with-deficit flag) instead of the hard-coded zeros.
  // The fp cohort logs adherently (every scheduled session is executed via
  // persistSessionLogs → skipped is normally 0), so closedDaysRecent stays inert, but a
  // CUT journey under a real deficit COULD set kcalShortfall=true and move a hash via the
  // LIFE_DIP suppress path. Pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so
  // the builder threads EXACTLY { closedDaysRecent: 0, kcalShortfall: false } in both A/B
  // arms → the classifier sees today's blind inputs → BOTH frozen baselines (hashOff/
  // hashOn) stay byte-for-byte. ON behavior is proven on the dipClassifier unit suite
  // (real skipped/CUT-deficit inputs thread a LIFE_DIP), NOT in this determinism stream.
  'dp_lifedip_inputs_v1',
  // THE FLIP 2026-06-15 (single-day focus concentration) — dp_single_day_focus_v1 defaults ON.
  // On a freq=1 (one active training day) week with a non-balanced focus, it trims the non-focus
  // accessories toward maintenance and reallocates the freed budget into the focus group so the
  // single full-body day reads as a focused session. This harness's EMPHASIS_PRESETS focuses
  // (arms/v-taper/lower) + any freq=1 journey in the cohort WOULD have their freq=1 sessions
  // concentrated → move the frozen prescription hashes. Pinned OFF here (in FLIPPED_FLAGS only,
  // NOT PATH_A_FLAGS) so ctx.singleDayFocus is null in both A/B arms → the concentration pass
  // never runs → BOTH frozen baselines (hashOff/hashOn) stay byte-for-byte. CONTAINED to
  // activeDays === 1: at freq >= 2 the seam resolves singleDayFocus to null regardless of the
  // flag, so every freq >= 2 config is byte-identical even with the flag ON. ON behavior is
  // proven on the eval grid (freq=1 focus configs lift toward 6-7, focus leads at a real dose;
  // 0 freq>=2 configs changed) + the new single-day-focus regression test, NOT in this stream.
  'dp_single_day_focus_v1',
  // THE FLIP 2026-06-16 (safety-cap re-enforce) — dp_cap_after_calib_v1 defaults ON. It re-
  // clamps a calibration-inflated over-cap kg back to the exercise safety ceiling AFTER the
  // calibration step (the CAP-over note quoted maxKg but the prescribed kg silently exceeded
  // it). INERT in this harness either way (resetWorld clears localStorage → empty dp-cal-factors
  // → calibration is identity → result.kg never exceeds the cap → the re-clamp never fires),
  // pinned OFF anyway (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) for the all-off-world guarantee
  // so BOTH frozen baselines (hashOff/hashOn) stay byte-for-byte. ON is proven on the
  // dp.calibration safety-cap regression test, NOT in this determinism stream.
  'dp_cap_after_calib_v1',
  // THE FLIP 2026-06-16 (M1 fatigued-drop guarantee-awareness) — dp_fatigue_drop_guarantee_aware_v1
  // defaults ON. buildSession's M1 fatigued exercise-drop removed a fatigued group's LAST slot, but
  // the focus guarantees inject their SIGNATURE movement (lateral / 2nd-arm) as that last slot — so
  // a fatigued focus user lost the guarantee. When ON (threaded as ctx.fatigueDropGuaranteeAware) the
  // drop protects the signature slot (drops a redundant occurrence or shaves sets). The fp cohort
  // hits the fatigued-drop WITH a focus context (EMPHASIS_PRESETS), so the guarantee-aware victim
  // redirect MOVES a dropped slot → both frozen hashes shift. Pinned OFF here (in FLIPPED_FLAGS only,
  // NOT PATH_A_FLAGS) so ctx.fatigueDropGuaranteeAware is false in both A/B arms → the old blind
  // last-occurrence drop runs → BOTH frozen baselines (hashOff/hashOn) stay byte-for-byte. ON is
  // proven on the lateralDeltGuarantee fatigue-survival regression test, NOT in this stream.
  'dp_fatigue_drop_guarantee_aware_v1',
  // THE FLIP 2026-06-16 (ACWR uncoupling) — dp_acwr_uncoupled_v1 defaults ON. It
  // uncouples computeACWR's chronic denominator (pre-acute band [7,28] scaled to a
  // 7-day window) + a real cold-start guard. The simulated-date cohort never reaches
  // readiness (readiness.js resolves the WALL clock), so the frozen §A hashes are
  // unaffected either way; the ACWR path is exercised by acwrRealClockFullPath (§B).
  // Pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so BOTH A/B arms force
  // the LEGACY coupled ACWR math explicitly → the frozen baselines (hashOff/hashOn)
  // are guaranteed byte-for-byte regardless of how the cohort exercises ACWR, and the
  // §B real-clock spike test rides the legacy denominator. ON behavior (returning/
  // week-1 users no longer pinned to 4.0, steady 2-3wk users no false spike) is proven
  // on the acwrReadiness cluster-9 regression suite, NOT in this determinism stream.
  'dp_acwr_uncoupled_v1',
  // THE FLIP 2026-06-16 (learned-volume inversion fix) — dp_learned_volume_fix_v1
  // defaults ON. It corrects three coupled defects INSIDE the dp_learned_volume_v1
  // response curve (LV-3 deload exclusion, LV-1 low-dose-only MEV, LV-2 true-plateau
  // MAV). dp_learned_volume_v1 IS in PATH_A_FLAGS (the hashOn arm turns it ON), so the
  // corrected landmark math WOULD move the frozen full-path hashOn — pinned OFF here (in
  // FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so the persistSessionLogs call site threads
  // fixInversions:false in both A/B arms → the original learned-volume math runs → BOTH
  // frozen baselines (hashOff/hashOn) stay byte-for-byte. ON behavior is proven on the
  // learnedVolume cluster-9 regression suite (deload-insertion invariant + LV-1/LV-2),
  // NOT in this determinism stream.
  'dp_learned_volume_fix_v1',
  // THE FLIP 2026-06-16 (no PR-day set boost in a CUT) — dp_readiness_cut_no_prboost_v1
  // defaults ON. scaleSetsByReadiness threaded isInCut into getReadinessVerdict so a high-
  // readiness user in an active CUT no longer gets the PR_DAY ×1.1 SET boost (+~10% volume in a
  // deficit). A fp journey that is BOTH in a CUT AND at PR readiness would drop that ×1.1 set
  // boost → move a frozen prescription hash. Pinned OFF here (in FLIPPED_FLAGS only, NOT
  // PATH_A_FLAGS) so readinessInCut is forced false in both A/B arms → the old boost-in-cut runs
  // → BOTH frozen baselines (hashOff/hashOn) stay byte-for-byte. ON is proven on the
  // scaleSetsByReadiness cut-aware regression test, NOT in this determinism stream.
  'dp_readiness_cut_no_prboost_v1',
  // THE FLIP 2026-06-16 (reactive-deload volume cut) — dp_deload_volume_depth_v1
  // defaults ON. getDailyWorkout now folds the Deload engine's depth_pct (a REACTIVE
  // deload's volume-cut depth, previously DEAD: no live consumer) into the MEV-floored
  // weekly-volume scaler, so a reactive-deload week's SET counts drop alongside the kg
  // cut. A fp journey carrying a REACTIVE deload (REACTIVE_AA / REACTIVE_COMPOSITE /
  // EXTENSION_FLAGGED while mesocycle_phase !== 'DELOAD') would drop set counts → move
  // a frozen prescription hash. Pinned OFF here (in FLIPPED_FLAGS only, NOT
  // PATH_A_FLAGS) so deloadVolRatio is forced to 1 in both A/B arms → the old load-only
  // deload runs → BOTH frozen baselines (hashOff/hashOn) stay byte-for-byte. ON is
  // proven on the getDailyWorkout deload-volume regression test, NOT in this stream.
  'dp_deload_volume_depth_v1',
  // THE FLIP 2026-06-17 (deload weakness-amp suppression) — dp_deload_suppress_amp_v1
  // defaults ON. A reactive deload lowered the weekly-volume budget but the M2/M3
  // amplification ran with NO deload gate and pushed a lagging group toward its
  // (unchanged) MRV — landing a deload-cut group ABOVE its pre-deload baseline (the
  // deload INVERTED for that group), while the coach emitted both a deload AND a
  // weakness-amp token. When ON, getDailyWorkout clamps each amplified/imbalance-
  // corrected/redistributed group to min(result, preDeloadBaseline) and suppresses the
  // weakness-amp + imbalance-fix narration during the deload. A fp journey carrying a
  // REACTIVE deload WITH a lagging group would clamp the amplified budget → move a
  // frozen prescription hash. Pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS)
  // so suppressDeloadAmp is false in both A/B arms → the legacy un-gated amplification +
  // narration runs → BOTH frozen baselines (hashOff/hashOn) stay byte-for-byte. ON is
  // proven on the getDailyWorkout deload-suppress-amp regression test + the
  // coachAdaptations narration test, NOT in this determinism stream.
  'dp_deload_suppress_amp_v1',
  // THE FLIP 2026-06-17 (aerobic upper-body false-ease) — dp_aerobic_load_cap_v1
  // defaults ON. getAerobicRecoveryContribution over-fired the upper-body aerobic
  // classification (a generic class's gradient umeri=0.35 sat AT the ease threshold)
  // AND accumulated across stacked classes (load[g] += ...) so N classes pushed upper
  // groups into 'partial', cutting a both-user's push/pull resistance volume ~20%. When
  // ON, a generic class eases only legs+core and each group's aerobic load is capped at
  // the single-class max (Math.max). This changes the recovery state → the compose-time
  // volume cut. The fp cohort seeds aerobic sessions on 'both' journeys, so the ON
  // behavior WOULD change which groups read 'partial' → move the frozen prescription
  // hashes — pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so the legacy
  // additive full-gradient accumulation runs in both A/B arms → BOTH frozen baselines
  // (hashOff/hashOn) stay byte-for-byte. ON is proven on the muscleRecovery aerobic-cap
  // regression test, NOT in this determinism stream.
  'dp_aerobic_load_cap_v1',
  // THE FLIP 2026-06-17 (readiness×energy MIN-compose) — dp_readiness_energy_min_v1
  // defaults ON. The compose seam composed the readiness volumeMultiplier + the energy
  // volumeFactor with a single MIN (applied ONCE) instead of running the two scalers
  // back-to-back (which MULTIPLIED the cuts, ~40% vs the documented ~30% floor). The fp
  // cohort logs no energy-check survey (readinessScoreForUser → null → volumeMultiplier
  // 1.0), so minCompose's `readinessVolMult < 1` guard is never met → the seam is INERT
  // in this harness either way. Pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS)
  // anyway for the all-off-world guarantee, so even if a future journey ever logged BOTH
  // a readiness cut AND an energy cut the seam is forced OFF in both A/B arms → the old
  // back-to-back multiply runs → BOTH frozen baselines (hashOff/hashOn) stay byte-for-
  // byte. ON behavior (the deeper of the two stressors governs, never their product) is
  // proven on the compose readiness×energy MIN regression test, NOT in this stream.
  'dp_readiness_energy_min_v1',
  // THE FLIP 2026-06-17 (calf delivery floor) — dp_calf_delivery_floor_v1 defaults ON. It
  // honors the MEV-floored calf budget at DELIVERY on a leg-training cluster (full/lower/legs):
  // >=1 calf slot whenever the floored calf budget>0, a 2nd calf slot when the single-slot weekly
  // projection (calfFreq x the iso ceiling) falls below MEV — each via a length-stable SWAP of a
  // redundant quad/glute/ham iso (total slots unchanged), plus a compose-seam drop-guard that
  // holds the calf through the time-trim + a symmetric de-balloon for the floored small major.
  // The fp cohort DOES include forta/masa balanced leg-training journeys, so the ON swap WOULD
  // move their frozen prescription hashes — pinned OFF here (in FLIPPED_FLAGS only, NOT
  // PATH_A_FLAGS) so ctx.calfDeliveryFloor is false in both A/B arms → the new block + the calf
  // drop-guard + the symmetric de-balloon never run → BOTH frozen baselines (hashOff/hashOn) stay
  // byte-for-byte. ON behavior is proven on the eval grid (forta calves 0 → ~MEV at all freq, mass
  // calves >= MEV + monotonic vs freq-3, total slots unchanged) + the new calf-delivery-floor
  // regression test, NOT in this determinism stream. Selection/slot-side (no dp.js load math) →
  // no sim-config pin.
  'dp_calf_delivery_floor_v1',
  // THE FLIP 2026-06-17 (posterior maintenance floor on masa/forta) — dp_posterior_maint_floor_v1
  // defaults ON. On a masa/forta UPPER-biased full-body day the only surplus is a 2nd focus
  // COMPOUND, which the hamstring + posterior victim searches refuse to displace → BOTH hams AND
  // glutes land at 0. When ON, the posterior floor requires a GLUTE slot AND a HAMSTRING slot
  // separately, and both floors add a final pass that displaces a REDUNDANT same-group compound
  // (keeping that group >=1 slot) to seat the leg maintenance slot. The fp cohort DOES include
  // masa/forta journeys on full/lower/legs clusters, so the ON behavior WOULD move the frozen
  // composition hashes — pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so
  // ctx.posteriorMaintFloor is false in both A/B arms → the new requirement + the redundant-
  // compound pass never run → BOTH frozen baselines (hashOff/hashOn) stay byte-for-byte. ON is
  // proven on the eval grid (masa/forta upper hams 0 -> >= MEV, glutes maintained, the upper
  // region still leads, balanced byte-identical) + the new posterior-maint-floor regression test,
  // NOT in this determinism stream. Selection/slot-side (no dp.js load math) → no sim-config pin.
  'dp_posterior_maint_floor_v1',
  // THE FLIP 2026-06-17 (forta posterior balance / hinge) — dp_forta_posterior_balance_v1 defaults
  // ON. A forta balanced full-body freq-3 day has NO hip-hinge (quad-dominant squats + a lone leg-
  // curl); when ON it SWAPS in an RDL/GHR hinge (displacing a redundant 2nd quad squat / upgrading
  // the lone leg-curl / a glute-secondary-covered slot) so the posterior chain anchors on a hinge,
  // the quad:posterior ratio improves, and hams rises — count-neutral. The fp cohort DOES include
  // forta journeys on full/lower/legs clusters, so the ON swap WOULD move their frozen composition
  // hashes — pinned OFF here (in FLIPPED_FLAGS only, NOT PATH_A_FLAGS) so ctx.fortaPosteriorBalance
  // is false in both A/B arms → the new block never runs → BOTH frozen baselines (hashOff/hashOn)
  // stay byte-for-byte. ON is proven on the eval grid (forta f3 hinge present, hams up, glutes not
  // regressed, quads >= MEV, slots unchanged; freq 4-5 + non-forta byte-identical) + the new
  // forta-posterior-balance regression test, NOT in this determinism stream. Selection/slot-side
  // (no dp.js load math) → no sim-config pin.
  'dp_forta_posterior_balance_v1',
  // THE FLIP 2026-06-17 (glute-focus delivery) — dp_glute_focus_delivery_v1 defaults ON. On a
  // LOWER focus fese (glutes) is emphasize[0] with a raised budget but DELIVERY halves it (the
  // region tail) while hams over-deliver; when ON it (1) exempts fese from the hamstring floor's
  // SURPLUS_LEG_PREFERENCE donor walk and (2) swaps a redundant over-slotted hams/quad slot so
  // glutes LEAD the lower region. `lower` IS in this harness's EMPHASIS_PRESETS, so the ON behavior
  // WOULD move the frozen composition hashes — pinned OFF here (in FLIPPED_FLAGS only, NOT
  // PATH_A_FLAGS) so ctx.gluteFocusDelivery is false in both A/B arms → the donor walk keeps the
  // legacy fese-first order + the glute-lead block never runs → BOTH frozen baselines (hashOff/
  // hashOn) stay byte-for-byte. ON is proven on the eval grid (lower focus glutes 6 -> ~16, the
  // lower-region leader, >= raised budget; balanced + v-taper byte-identical) + the new glute-
  // focus-delivery regression test, NOT in this determinism stream. Selection/slot-side (no dp.js
  // load math) → no sim-config pin.
  'dp_glute_focus_delivery_v1',
]);

/** Reset every store + DB the compose path reads, between profiles. Mirrors the
 *  calibration-sim resetStore but covers the full-path store surface. */
export function resetWorld() {
  try { localStorage.clear(); } catch { /* jsdom always has localStorage */ }
  useWorkoutStore.setState({
    exIdx: 0, setIdx: 0, phase: 'idle', prHit: false, prData: null, history: {},
    sessionStart: null, lastRating: null, pausedSnapshot: null, lastSession: null,
    sessionsHistory: [], streak: 0, sessionTimeBudgetMin: null,
  });
  useAerobicStore.setState({ sessions: [] });
}

/**
 * Set the dev-flag override that the real featureFlags.isEnabled honors first.
 * Writes an EXPLICIT map over FLIPPED_FLAGS (registry default is now ON, post
 * 2026-06-08 flip) so the A/B is independent of the registry default:
 *   - `false` → ALL flipped flags forced OFF → the BASELINE (all-off) arm.
 *   - `true`  → exactly PATH_A_FLAGS ON, the rest of the flipped set OFF → the
 *               stacked path-A ON arm (matches the frozen hashOn semantics).
 *   - `{ only: 'flag_id' }` → exactly that ONE flag ON, the rest OFF → per-flag
 *               isolation, so each path-A flag's effect can be attributed end-to-end.
 */
export function setPathAFlags(mode) {
  const obj = {};
  for (const f of FLIPPED_FLAGS) obj[f] = false; // explicit OFF over the flipped set
  if (mode === true) {
    for (const f of PATH_A_FLAGS) obj[f] = true;
  } else if (mode && typeof mode === 'object' && typeof mode.only === 'string') {
    obj[mode.only] = true;
  }
  // mode === false / null → the all-off map above (the baseline arm).
  try { localStorage.setItem(DEV_FLAGS_KEY, JSON.stringify(obj)); } catch { /* ignore */ }
}

// ── deterministic RNG (mulberry32) — identical to the calibration-sim harness ──
export function rng(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
export const gauss = (r, mean, sd) => {
  const u = Math.max(1e-9, r());
  const v = r();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
export const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

/** Engine + store surface the run logic drives — the REAL prod modules. */
export const world = {
  composePlannedWorkoutToday,
  persistSessionLogs,
  useOnboardingStore,
  useWorkoutStore,
  useAerobicStore,
  DB,
  getExerciseMetadata,
};
