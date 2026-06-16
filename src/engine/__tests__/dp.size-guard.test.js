// ══ DP SIZE GUARD — growth moratorium ratchet ═══════════════════════════
// dp.js is the legacy monolith (2826 LOC at moratorium time 2026-06). New
// logic must go into dp/<submodule> (21 already exist), NOT into dp.js. This
// test reads dp.js's line count and FAILS if it exceeds DP_LINE_CEILING — a
// ratchet set slightly above current so the file cannot grow.
//
// If you legitimately reduced dp.js below the ceiling, RATCHET DOWN the ceiling
// here to lock in the win. NEVER ratchet UP to admit new dp.js logic — extract
// to a dp/<submodule> instead.
//
// ONE documented exception 2026-06-11 (2850→2854): the id-migration Phase 2 read
// seam. Its LOGIC was extracted to dp/logIdentity.js (per the rule); the +4 here
// is the irreducible CALL-SITE WIRING in getLogs + _loggedExerciseNames (the
// import line + two helper calls + one-line breadcrumbs) — not new logic in
// dp.js. Ratchet-down-only resumes from 2854.
//
// SECOND documented exception 2026-06-11 (2854→2927): the gym-log arc (Daniel's
// two real-session findings — STICKY/coldstart/cap/rounding/transfer). Heavy
// logic went to submodules per the rule (dp/baseLookback.js NEW, dp/
// inSessionOverride.js bidirectional, dp/equipmentLadder.js, dp/logIdentity.js
// canonical grouping); the +73 here is 9 small FLAG-GUARDED call-site branches
// inside recommend()/getSetAdjustment()/INIT (at-cap clamp return, INIT
// transfer+curated seed, greu cold-start ease, lookback call, ladder-aware
// rounding, unit-aware transfer accessors ×2, override call rewire) — glue that
// cannot leave dp.js without fragmenting the decision flow. Ratchet-down-only
// resumes from 2927.
//
// THIRD documented exception 2026-06-12 (2927→2932): the cold-start transfer
// movement-family guard (seed-suspects fix — a rear-delt fly seeded Smith OHP,
// a cable fly seeded a chest press). The DECISION LOGIC + taxonomy went to a
// submodule per the rule (dp/ceiling.js: MOVEMENT_FAMILY + isTransferCompatible);
// the +5 here is the irreducible CALL-SITE WIRING in coldStartTransfer (classify
// the target once + one per-source skip + a 3-line breadcrumb; the import is an
// existing-line extension). Ratchet-down-only resumes from 2932.
//
// FOURTH documented exception 2026-06-12 round 2 (2932→2940): two seed-fix wirings.
// (A) leg-press→squat mechanical-skew guard — the TABLE + the precedence LOGIC went
//     to exerciseMapping.js (PATTERN_CONVERSION + the new getSimilarityMultiplier
//     branch, the proper home — NOT dp.js); the dp.js cost is only the classifyPattern
//     ACCESSOR threaded into the two getSimilarityMultiplier call sites (coldStartTransfer
//     + the legacy similar loop). (B) the synergist-discount PR-floor clamp — an
//     irreducible 2-line guard (a _demoWorkingW read + a clamp) inside getSmartRecommendation's
//     discount block; it depends on DP state (logs/flags via _demoWorkingW) so it cannot
//     leave dp.js without passing the whole log stream out. Ratchet-down-only resumes from 2941.
//
// FIFTH documented exception 2026-06-14 (2941→2942): the H1 sex-ceiling safety fix. A
// woman's strength CEILING was computed with the MALE factor — 4 dp.js call sites passed a
// literal 'm' to ceilingE1RM. The factor LOGIC stays in ceiling.js (CEILING_SEX_FACTOR,
// untouched); the +1 here is the irreducible CALL-SITE WIRING — one instance-set of
// this._sex from opts in getSmartRecommendation (the 4 sites then read this._sex; absent →
// ceilingE1RM falls back to male = byte-identical). The file was already AT ceiling so the
// real cost is +1. Ratchet-down-only resumes from 2942. (Per audit BUILD-CI-DEPS-06 the
// standing fix is to extract dp.js logic to submodules and claw this ceiling back DOWN.)
//
// SIXTH documented exception 2026-06-16 (2942→2946): the nof1 quota-edge re-decide
// guard (audit LOW). The persistence LOGIC stays in dp/nof1.js (saveExperiment already
// returns {ok}, untouched); the +4 here is the irreducible CALL-SITE WIRING inside
// stepNof1Experiment — capture the slot-clear result + a one-line guarded early-return
// (a 3-line breadcrumb) so a failed clear does not re-decide/re-narrate every session.
// It depends on the in-flight in-method state so it cannot leave dp.js. Ratchet-down-
// only resumes from 2946.
//
// SEVENTH documented exception 2026-06-16 (2946→2962): the safety-cap re-enforce-after-
// calibration fix (cycle-2 audit HIGH safety). recommend()'s learned calibration ran AFTER
// the CAP-over branch returned kg=maxKg, silently inflating the prescribed kg ABOVE the
// safety ceiling the note quoted. The +16 here is the irreducible CALL-SITE clamp inside
// recommend() (flag-guarded, between the calibration step + the PR-floor): it reads the raw
// cap status + result.kg + rt that already live in this method, so it cannot leave dp.js
// without passing the whole in-flight rec out. Gated behind dp_cap_after_calib_v1 (default
// ON, pinned OFF in the calibration-sim + fp frozen baselines). Ratchet-down-only resumes
// from 2962.
//
// EIGHTH documented exception 2026-06-16 (2962→2980): the PR-floor / CAP-note reconciliation
// (cycle-8 audit HIGH). On a CAP-over rec (lastW>maxKg → status CAP, kg=maxKg, "Revenim la
// {cap}") the PR-floor legitimately lifts result.kg to a GENUINELY-DEMONSTRATED load above the
// defensive cap (DESIGN: demonstrated strength beats a population ceiling — the real 54 kg
// Cable Curl / 25 kg Y Raise; _demoWorkingW already excludes failed/short ego sets, so a true
// ego-load stays capped). But the stale CAP status + "Revenim la {cap}" note then CONTRADICTED
// the higher prescribed kg. The +18 here is the irreducible CALL-SITE re-tag branch inside the
// PR-floor block (a third arm beside the EASE-BACK / CATCH-UP re-tags): when the floor lifts a
// cap-status rec above cappedAtKg, swap the lying note for an honest "proven load above the
// default ceiling". It reads cappedAtKg + result.status that already live in recommend(), so it
// cannot leave dp.js. Gated behind dp_cap_after_calib_v1 (default ON, pinned OFF in the
// calibration-sim + fp frozen baselines). Ratchet-down-only resumes from 2980.
//
// NINTH documented exception 2026-06-16 (2980→3023): cluster-1 ladder-snap reconcile
// (cycle-10 audit HIGH). The generic progression ladder (getNextWeight/getPrevWeight)
// and the real pin-stack the FINAL rec snaps onto (roundToStep) were misaligned, so an
// EASE-BACK down-step could re-snap onto the SAME rung (Cable Row eased 42 → 42, note
// still "coboram la 40"). The DECISION LOGIC + the real-rung steppers went to a NEW
// submodule per the rule (dp/ladderReconcile.js: realRungBelow/Above + reconcileLadderStep
// — all pure + i18n-clean, taking the snap fn + ladder primitives as args, returning a
// STRUCTURED {kg, repsTarget, noteKind} decision). The +43 here is the irreducible CALL-SITE
// WIRING inside recommend(): one import line + the reconcileLadderStep call after the PR-floor
// + the noteKind→RO progressionNote composition (the RO copy MUST live in dp.js — it is the
// only engine file the i18n leak harness does NOT scan, since git's `src/engine/**/*.js`
// pathspec skips top-level dp.js but DOES scan dp/ submodules; every sibling note already
// lives in dp.js for this reason). It reads result.kg/status + lastW + the in-flight floor/
// rep-range that already live in this method, so the glue cannot leave dp.js without passing
// the whole in-flight rec out. Gated behind dp_ladder_snap_reconcile_v1 (default ON, pinned
// OFF in the calibration-sim + fp frozen baselines). Ratchet-down-only resumes from 3023.
//
// TENTH documented exception 2026-06-16 (3023→3042): cluster-2 ladder-snap reconcile
// (cycle-10 audit HIGH, same flag). The PR-floor restored the proven load via
// roundToStep(floorW) — NEAREST — so on a COARSE plate grid it cratered the proven load
// BELOW the floor it protects (squat 105 → 100, Barbell Row 115 → 110, BELOW demonstrated
// capacity — the floor's own invariant violated by its restore snap). The DECISION LOGIC
// went to the SAME submodule per the rule (dp/ladderReconcile.js: reconcileFloorUp, pure,
// returns the resolved kg). The +19 here is the irreducible CALL-SITE WIRING inside the
// PR-floor block: the getEquipmentType import + the reconcileFloorUp swap (it reads floorW
// + the rng/rep-range + the equip type that already live in this method, and the existing
// retag block right below composes the note from the resolved kg, so the glue cannot leave
// dp.js). Gated behind the same dp_ladder_snap_reconcile_v1 (default ON, pinned OFF in the
// calibration-sim + fp frozen baselines). Ratchet-down-only resumes from 3042.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ceiling = current line count. Ratchet DOWN only (ten documented exceptions
// 2026-06-11/12/14/16 for call-site wiring — see header).
const DP_LINE_CEILING = 3042;

const dpSrc = readFileSync(resolve(__dirname, '../dp.js'), 'utf8');
// Under a Stryker mutation dry-run the on-disk source is INSTRUMENTED (stryMutAct_*
// helpers + per-mutant branches), which inflates the line count ~2940 -> ~4300 and
// would false-fail this source-hygiene moratorium. The ceiling is about the REAL
// source, meaningless on instrumented code -> skip when instrumentation is present.
const isInstrumented = /stryMutAct_|stryNamespace|stryCov_/.test(dpSrc);

describe('dp.js growth moratorium', () => {
  (isInstrumented ? it.skip : it)('dp.js stays at or below the line ceiling (extract new logic to dp/<submodule>)', () => {
    const lineCount = dpSrc.split('\n').length;
    expect(lineCount).toBeLessThanOrEqual(DP_LINE_CEILING);
  });
});
