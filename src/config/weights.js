// ══ EQUIPMENT WEIGHT CONFIGS ══════════════════════════════════
// Per-machine weight stacks based on real gym equipment (Matrix + Bailib + plates)

import { isEnabled } from '../util/featureFlags.js';
import { learnedStep, snapToLadder } from '../engine/dp/equipmentLadder.js';
import { resolveRealStack } from '../engine/dp/realMachineStacks.js';

/** Snap a generic-rounded weight onto the founder's REAL pin-machine stack when one
 *  of his CONFIRMED stations matches (dp_real_ladder_snap_v1). PURE + defensive: no
 *  real stack / flag off / bad input → the generic value UNCHANGED (byte-identical).
 *  Nearest rung; a tie rounds DOWN (the lighter, safer load). The four explicit
 *  founder stacks live in realMachineStacks.js. */
function _snapToRealStack(weight, exerciseName, generic) {
  if (!isEnabled('dp_real_ladder_snap_v1')) return generic;
  const stack = resolveRealStack(exerciseName);
  if (!stack || stack.length < 1 || !Number.isFinite(weight)) return generic;
  let bestRung = stack[0];
  let bestDist = Math.abs(stack[0] - weight);
  for (let i = 1; i < stack.length; i++) {
    const d = Math.abs(stack[i] - weight);
    // strictly-less keeps the FIRST (lower) rung on a tie → round DOWN for safety.
    if (d < bestDist - 1e-9) { bestDist = d; bestRung = stack[i]; }
  }
  return bestRung;
}

export const EQUIPMENT_WEIGHTS = {
  // Matrix Dual Adjustable Pulley (helcometru) — incremente ~4.5kg
  'matrix_cable': [5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59, 63, 68, 72, 77, 81, 86, 90],

  // Bailib Lat Pulldown + Cable Row — incremente 5kg
  'bailib_stack': [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],

  // Pec Deck / Rear Delt (aparat cu selector) — incremente ~4.5kg
  'pec_deck': [18, 23, 27, 32, 36, 41, 45, 50, 54, 59],

  // Leg Extension / Leg Curl (selector stack)
  'leg_machine': [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160],

  // Leg Press cu discuri olimpice (bara ~20kg + discuri per parte)
  'leg_press_plates': [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 260, 280, 300, 320],

  // Gantere fixe cu etichete galbene — incremente 1kg mic, 2.5kg mare
  'dumbbell': [7, 8, 9, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40, 42.5, 45, 47.5, 50],

  // ── TINY ISOLATIONS — light DB ladder (rear-delt fly, lateral raise) ─────────
  // Gigel sim 2026-06-06 (Target 3): rear-delt / lateral-raise true working loads
  // are ~2-8kg, but the CORE_AUTO names (DB Rear Delt Fly / DB Lateral Raise /
  // Leaning Lateral Raise) were UNMAPPED → fell to the bailib_stack default (5kg
  // floor, coarse 5kg steps) — and the sim's legacy 'Rear Delt Fly' hit the 18kg
  // pec_deck floor (+40% to +400% overshoot). A fly priced at a row's load wasted
  // the whole movement for 24-48 sessions. These get a fine DB ladder from 2kg so
  // the (already-correct low 0.06 BW fraction) is not clamped up to a machine floor.
  'light_iso_db': [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22.5, 25],

  // Tiny cable isolations (Cable Rear Delt Fly, Cable Lateral Raise) — fine pulley
  // stack from ~2.5kg. Same intent as light_iso_db, on the finer cable increments.
  'light_iso_cable': [2.5, 3.75, 5, 6.25, 7.5, 8.75, 10, 12.5, 15, 17.5, 20, 22.5, 25, 30, 35],

  // Bara olimpica + discuri (bench/press cu bara) — bara ~20kg, increment 2.5kg
  // pana la 70, apoi pasi de 5/10kg. (CR-01: fara asta Flat Barbell Bench cadea
  // pe bailib_stack si capa orice bench >80kg la 80.)
  'barbell_plates': [20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40, 42.5, 45, 47.5, 50, 52.5, 55, 57.5, 60, 62.5, 65, 67.5, 70, 75, 80, 85, 90, 95, 100, 105, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 250],

  // ── Heavy barbell COMPOUNDS — squat / deadlift / hip-thrust (audit F-1) ─────
  // Empty olympic bar floor (20kg), 2.5/5kg micro-steps low, 5/10kg plate steps
  // high, ceiling 360kg (>= MAX_KG for Barbell Squat 320 / Trap Bar DL 360 / Hip
  // Thrust 360). Without this, squat/DL/hip-thrust were UNMAPPED → bailib_stack
  // (top 80) → any >80kg load eased to the 5kg floor (140kg squat hard -> 5kg).
  'barbell_heavy': [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 240, 260, 280, 300, 320, 340, 360],

  // ── Heavy plate-loaded LEG machines — hack / pendulum / belt squat, leg-press
  // calf raise (audit F-1). Reaches 400kg (== their MAX_KG); plate steps. The
  // 320-top leg_press_plates was too low for these (real loads 360-400 -> floor).
  'leg_machine_heavy': [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400],

  // ── Plate-loaded UPPER machines — chest press / row / shoulder-press machines
  // (Hammer Strength, converging press, T-bar machine, etc.) (audit F-1). Step
  // 5kg, ceiling 250kg (>= their MAX_KG 120-250).
  'machine_plates': [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 250],

  // ── Calf-raise selector / plate machines (standing/seated calf) (audit F-1).
  // Heavy stacks reach 250kg (>= MAX_KG); 5/10kg steps.
  'calf_machine': [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 250],

  // ── Bodyweight ADDED-LOAD ladder — #7 config coverage (2026-06-08) ──────────
  // For bodyweight CORE_AUTO movements (Pull-up / Dip / Push-up / core / etc.)
  // the prescribed `kg` is ADDED weight only (belt plate / dip-belt DB / weight
  // vest), starting at 0 (pure bodyweight). The 24 bodyweight CORE_AUTO were
  // UNMAPPED → fell to bailib_stack (5kg floor) → a user adding a 2.5kg belt
  // plate to a pull-up snapped UP to 5kg, and a pure-bodyweight 0 snapped to the
  // 5kg floor too. A fine belt-plate ladder from 0 (2.5kg micro-plate steps low,
  // 5kg high) so an added-load progression is honest. Ceiling 80kg (>= the
  // Weighted Pull-up / Dip MAX_KG belt caps). The history path snaps the added
  // load on this ladder; toPlannedExercise leaves the cold-start added load raw
  // (0) for bodyweight, so this only ever refines the logged-belt progression.
  'bodyweight_added': [0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 35, 40, 45, 50, 55, 60, 70, 80],
};

// Mapare exercitiu → tipul de echipament din sala
export const EXERCISE_EQUIPMENT_MAP = {
  'Lat Pulldown':          'bailib_stack',
  'Cable Row':             'bailib_stack',
  'Face Pulls':            'matrix_cable',
  'Bayesian Curl':         'matrix_cable',
  'Cable Curl':            'matrix_cable',
  'Overhead Triceps':      'matrix_cable',
  'Pushdown':              'matrix_cable',
  'Cable Fly':             'matrix_cable',
  'Lateral Raises (cable)':'matrix_cable',
  'Rear Delt Cable':       'matrix_cable',
  'Pec Deck / Cable Fly':  'pec_deck',
  // Bare canonical 'Rear Delt Fly' (ANCHOR_NAME + library key — the composer still
  // emits it for users with PR history, and the diary cohort drives it). A rear-delt
  // fly is a TINY isolation (true ~3-8kg); routing it to pec_deck floored the 5kg
  // prior up to the 18kg minimum plate (+40% to +400% overshoot, movement wasted
  // 24-48 sessions — Gigel sim 2026-06-06 Target 3, frozen +0.745 cold-start bias).
  // A free rear-delt fly is a dumbbell movement → light DB ladder (floor 2kg). This
  // does NOT touch any machine PRESS (Pec Deck/Leg Press/DB & machine presses keep
  // their stacks); only this fly isolation moves off the 18kg plate floor.
  'Rear Delt Fly':         'light_iso_db',
  // ── Tiny rear-delt / lateral-raise ISOLATIONS (Gigel sim Target 3) ──────────
  // The CANONICAL CORE_AUTO names the composer actually emits — route them to the
  // light isolation ladders so their ~2-8kg true loads are not clamped to the 5kg
  // bailib default or the 18kg pec_deck floor. DB variants → light DB ladder; cable
  // variants → fine cable ladder; machine selector variants → fine cable ladder too
  // (machine rear-delt/lateral selectors start light, not at an 18kg plate).
  'DB Rear Delt Fly':      'light_iso_db',
  'Cable Rear Delt Fly':   'light_iso_cable',
  'Reverse Pec Deck':      'light_iso_cable',
  'DB Lateral Raise':      'light_iso_db',
  'Leaning Lateral Raise': 'light_iso_db',
  'Cable Lateral Raise':   'light_iso_cable',
  'Machine Lateral Raise': 'light_iso_cable',
  'Leg Extension':         'leg_machine',
  'Leg Curl':              'leg_machine',
  'Leg Press':             'leg_press_plates',
  'Incline DB Press':      'dumbbell',
  'Incline DB Press pump': 'dumbbell',
  'DB Shoulder Press':     'dumbbell',
  'Flat DB Press':         'dumbbell',
  'Flat Barbell Bench':    'barbell_plates',
  'Lateral Raises':        'dumbbell',
  'Incline DB Curl':       'dumbbell',
  'Hammer Curl':           'dumbbell',
  'Preacher Curl':         'dumbbell',
  // Barbell RDL is a heavy posterior-chain hinge — it belongs on the heavy
  // barbell ladder (reaches 360kg), NOT the dumbbell ladder (top 50kg). The bare
  // 'Romanian Deadlift' is the BARBELL variant (library equipment_type=barbell);
  // the dumbbell variant has its own 'DB Romanian Deadlift' entry below. (Fresh-
  // eyes 2026-06-08: an advanced lifter's RDL back-solved to ~140kg snapped to the
  // 50kg dumbbell-ladder ceiling — pinned flat-50 for everyone regardless of
  // strength/training-age. Routing to barbell_heavy lets the population prior +
  // demonstrated load scale it, while a beginner's lighter prior stays low.)
  'Romanian Deadlift':     'barbell_heavy',
  'Calf Raises':           'dumbbell',

  // ── Heavy CORE_AUTO compounds — previously UNMAPPED → bailib_stack (top 80) →
  // any load >80kg eased/deloaded to the 5kg floor (audit F-1, 2026-06-07). Each
  // routed to a ladder whose top exceeds its real working load + MAX_KG cap.
  // Heavy barbell hinge/squat/thrust (ladder reaches 360kg):
  'Barbell Back Squat (High Bar)': 'barbell_heavy',
  'Front Squat':           'barbell_heavy',
  'Trap Bar Deadlift':     'barbell_heavy',
  'Hip Thrust':            'barbell_heavy',
  "Farmer's Walk Trap Bar":'barbell_heavy',
  // Barbell presses / rows / OHP / barbell+EZ curls & extensions (reaches 250kg):
  'Incline Barbell Bench': 'barbell_plates',
  'Close-Grip Bench Press':'barbell_plates',
  'Floor Press Barbell':   'barbell_plates',
  'Barbell Row':           'barbell_plates',
  'Pendlay Row':           'barbell_plates',
  'Landmine T-Bar Row':    'barbell_plates',
  'BB Shrug':              'barbell_plates',
  'OHP':                   'barbell_plates',
  'Landmine Shoulder Press':'barbell_plates',
  'Barbell Curl Standing': 'barbell_plates',
  'EZ-bar Curl Standing':  'barbell_plates',
  'EZ-bar Preacher Curl':  'barbell_plates',
  'Lying Triceps Extension EZ-bar': 'barbell_plates',
  'Reverse Curl EZ-bar':   'barbell_plates',
  // Heavy plate-loaded leg / glute machines (reaches 400kg):
  'Hack Squat Machine':    'leg_machine_heavy',
  'Pendulum Squat':        'leg_machine_heavy',
  'Belt Squat':            'leg_machine_heavy',
  'Smith Machine Squat':   'leg_machine_heavy',
  'Leg Press Calf Raise':  'leg_machine_heavy',
  'Smith Hip Thrust':      'leg_machine_heavy',
  'Glute Drive Machine':   'leg_machine_heavy',
  'Plate-Loaded Hip Thrust Machine': 'leg_machine_heavy',
  // Plate-loaded upper / Smith / misc machines (reaches 250kg):
  'Smith Machine Bench':   'machine_plates',
  'Smith Incline Bench':   'machine_plates',
  'Smith Close-Grip Bench':'machine_plates',
  'Smith OHP':             'machine_plates',
  'Flat Chest Press Machine':'machine_plates',
  'Incline Chest Press Machine':'machine_plates',
  'Converging Chest Press':'machine_plates',
  'Assisted Dip Machine':  'machine_plates',
  'Triceps Press Machine': 'machine_plates',
  'Hammer Strength Row':   'machine_plates',
  'T-Bar Row Machine':     'machine_plates',
  'Chest-Supported Row':   'machine_plates',
  'Machine Pullover':      'machine_plates',
  'Machine Shoulder Press':'machine_plates',
  'Glute-Ham Raise':       'machine_plates',
  'Reverse Hyper':         'machine_plates',
  'Hip Abduction Machine': 'machine_plates',
  'Captains Chair Leg Raise':'machine_plates',
  'Ab Wheel Rollout':      'machine_plates',
  'Plate Pinch Hold':      'machine_plates',
  'Wrist Roller':          'machine_plates',
  'Machine Seated Curl':   'machine_plates',
  // Calf-raise machines (reaches 250kg):
  'Standing Calf Raise Machine':'calf_machine',
  'Smith Standing Calf Raise':  'calf_machine',
  'Seated Calf Raise Machine':  'calf_machine',
  // Selector leg-curl / single-leg extension (existing leg_machine, top 160):
  'Seated Leg Curl':       'leg_machine',
  'Standing Leg Curl':     'leg_machine',
  'Leg Extension Single-Leg':'leg_machine',

  // ══ #7 CONFIG COVERAGE — the remaining 66 CORE_AUTO that were UNMAPPED ══════
  // (2026-06-08). Every one fell to the bailib_stack DEFAULT (5kg floor, coarse
  // 5kg steps, top 80) → the chest-fly-32kg / odd-DB bug class (task-list #35):
  // a DB Fly / Cable Crossover priced at a ROW's load (an 8kg fly snapped UP to
  // 10kg on the 5kg row grid), a light isolation floored at 5kg, a bodyweight
  // belt-plate snapped to the 5kg floor. Each routed to a ladder whose
  // floor/ceiling/granularity match its REAL working load.

  // ── Chest FLY isolations (the headline bug class) — light fine ladders, NOT a
  // row stack. A free DB fly is a light DB movement; a cable crossover a fine
  // cable. (Cable Fly + Pec Deck already mapped; these were the gaps.)
  'DB Fly':                'light_iso_db',
  'Cable Crossover High-to-Low': 'light_iso_cable',

  // ── Cable PULLDOWN / ROW variants — the heavy lat/row stack (same as the base
  // Lat Pulldown / Cable Row that were mapped to bailib_stack): real working
  // loads 30-80kg, the bailib stack is CORRECT for these (it was only wrong as a
  // silent DEFAULT for light isolations).
  'Wide-Grip Lat Pulldown':    'bailib_stack',
  'Neutral-Grip Lat Pulldown': 'bailib_stack',
  'V-Bar Lat Pulldown':        'bailib_stack',
  'Straight-Arm Lat Pulldown': 'matrix_cable', // lat ISOLATION — finer/lighter than a pulldown
  'V-Bar Cable Row':           'bailib_stack',
  'Single-Arm Cable Row':      'matrix_cable', // single-arm = per-side lighter, finer pulley

  // ── Cable arms / pushdowns / overhead — the fine Matrix pulley (2.5kg-ish),
  // matching the existing 'Pushdown'/'Overhead Triceps'/'Cable Curl' family.
  'Cable Hammer Curl Rope':                     'matrix_cable',
  'Cable Triceps Pushdown Straight Bar':        'matrix_cable',
  'Cable Triceps Pushdown V-bar':               'matrix_cable',
  'Cable Triceps Pushdown Rope':                'matrix_cable',
  'Cable Triceps Pushdown Single-Arm':          'matrix_cable',
  'Cable Overhead Triceps Extension Rope':      'matrix_cable',
  'Cable Single-Arm Overhead Triceps Extension':'matrix_cable',

  // ── Cable glutes / core — Matrix pulley (mid loads, fine steps).
  'Cable Pull-Through':        'matrix_cable',
  'Cable Glute Kickback':      'light_iso_cable', // tiny per-leg isolation
  'Pallof Press Cable Standing':'light_iso_cable', // anti-rotation, light
  'Cable Woodchop High-to-Low':'matrix_cable',
  'Cable Crunch Kneeling':     'matrix_cable',

  // ── Rear-delt cable already light_iso_cable above; Face Pull is a light rear-
  // delt/ext-rotation cable → fine light ladder (not the heavy lat stack).
  'Face Pull':                 'matrix_cable',

  // ── DUMBBELL compounds / mid lifts — the standard fixed-DB rack (7-50kg, 2.5
  // steps). These are real DB loads, not tiny isolations.
  'DB Row':                    'dumbbell',
  'Chest-Supported DB Row':    'dumbbell',
  'DB Shrug':                  'dumbbell',
  'Seated DB Press':           'dumbbell',
  'Goblet Squat':              'dumbbell',
  'Bulgarian Split Squat':     'dumbbell',
  'DB Lunge':                  'dumbbell',
  'Walking Lunge':             'dumbbell',
  'Reverse Lunge':             'dumbbell',
  'DB Romanian Deadlift':      'dumbbell',
  'DB Single-Leg RDL':         'dumbbell',
  'DB Hip Thrust':             'dumbbell',
  'Standing DB Calf Raise':    'dumbbell',
  'DB Curl Standing':          'dumbbell',
  'DB Hammer Curl Standing':   'dumbbell',
  'DB Overhead Triceps Extension Two-Hand': 'dumbbell',
  "Farmer's Walk DB":          'dumbbell', // carry load IS a DB pair load

  // ── Tiny DB rear/lower-trap raise — light DB ladder (floor 2kg), like the
  // lateral/rear-delt isolations (a Y raise true load is ~2-6kg).
  'Y Raise':                   'light_iso_db',

  // ── BAND resistance — no stack; a fine light ladder is the closest proxy for
  // the band-tension "kg" the user logs (band-assisted pull-up assist, pull-apart
  // tension, band leg curl). Light fine cable ladder (2.5kg floor).
  'Band-Assisted Pull-up':     'light_iso_cable',
  'Band Pull-Apart':           'light_iso_cable',
  'Band Leg Curl':             'light_iso_cable',

  // ── BODYWEIGHT movements — the prescribed kg is ADDED load only (belt/vest),
  // starting at 0. Fine belt-plate ladder so a 2.5kg add isn't snapped to a 5kg
  // floor and a pure-bodyweight 0 stays 0 (the history path snaps added load on
  // this; cold-start added stays raw 0 in toPlannedExercise's isBw branch).
  'Dip':                       'bodyweight_added',
  'Push-up':                   'bodyweight_added',
  'Knee Push-up':              'bodyweight_added',
  'Diamond Push-up':           'bodyweight_added',
  'Incline Push-up':           'bodyweight_added',
  'Pike Push-up':              'bodyweight_added',
  'Pull-up':                   'bodyweight_added',
  'Weighted Pull-up':          'bodyweight_added',
  'Chin-up':                   'bodyweight_added',
  'Inverted Row Bar':          'bodyweight_added',
  'Bodyweight Squat':          'bodyweight_added',
  'Hyperextension Bodyweight': 'bodyweight_added',
  'Single-Leg Glute Bridge':   'bodyweight_added',
  'Glute Bridge Bodyweight':   'bodyweight_added',
  'Tibialis Raise':            'bodyweight_added',
  'Single-Leg Calf Raise Bodyweight': 'bodyweight_added',
  'Dead Hang':                 'bodyweight_added',
  'Plank':                     'bodyweight_added',
  'Side Plank':                'bodyweight_added',
  'Dead Bug':                  'bodyweight_added',
  'Reverse Crunch':            'bodyweight_added',
  'Hanging Leg Raise':         'bodyweight_added',
  'Hanging Knee Raise':        'bodyweight_added',
  'Bicycle Crunch':            'bodyweight_added',
};

/** @param {string} exerciseName */
function getList(exerciseName) {
  const exMap = /** @type {Record<string, string>} */ (EXERCISE_EQUIPMENT_MAP);
  const equipWeights = /** @type {Record<string, number[]>} */ (EQUIPMENT_WEIGHTS);
  const equipType = exMap[exerciseName] || 'bailib_stack';
  const hardCoded = equipWeights[equipType] || equipWeights['bailib_stack'] || [];
  // F4 #10 learned per-gym ladder (dp_learned_ladder_v1, default OFF → hardCoded →
  // byte-identical). When ON + a learned step exists for this exercise, refine the
  // ladder GRANULARITY: keep the hard-coded floor/ceiling (the safe bounds) but
  // walk the rungs at the user's REAL gym increment. With no learned step (the
  // common case + flag off) this is a no-op.
  if (isEnabled('dp_learned_ladder_v1') && hardCoded.length >= 2) {
    const step = learnedStep(exerciseName);
    if (step > 0) {
      const lo = hardCoded[0];
      const hi = hardCoded[hardCoded.length - 1];
      // Only refine when the learned step is FINER than the hard-coded spacing
      // (never coarsen below the equipment table — a coarser learned step would
      // throw away rungs the gym actually has). Span lo→hi at the learned step.
      const hardSpan = (hi - lo) / (hardCoded.length - 1);
      if (step < hardSpan) {
        const ladder = [];
        for (let w = lo; w <= hi + 1e-9; w += step) ladder.push(Math.round(w * 100) / 100);
        if (ladder.length >= 2) return ladder;
      }
    }
  }
  return hardCoded;
}

/**
 * @param {number} current
 * @param {string} exerciseName
 */
export function getNextWeight(current, exerciseName) {
  const list = getList(exerciseName);
  const idx = list.findIndex((w) => w >= current);
  if (idx === -1) return list[list.length - 1] ?? current;
  if (list[idx] === current) return list[Math.min(idx + 1, list.length - 1)] ?? current;
  return list[idx] ?? current;
}

/**
 * @param {number} current
 * @param {string} exerciseName
 */
export function getPrevWeight(current, exerciseName) {
  const list = getList(exerciseName);
  const idx = list.findIndex((w) => w >= current);
  // ── above-the-top (audit F-1b) ──────────────────────────────────────────────
  // current exceeds EVERY rung → findIndex returns -1. The old code fell into the
  // idx<=0 branch and returned list[0] = the FLOOR, cratering a heavy lift to its
  // minimum (140kg squat eased -> 5kg). Instead step DOWN one ladder-step from the
  // logged load itself (extrapolating the ladder's top increment), so the result is
  // just below current — a sane one-step deload — never the floor.
  if (idx === -1) {
    const n = list.length;
    const topStep = n >= 2 ? list[n - 1] - list[n - 2] : 0;
    if (topStep > 0) return Math.max(list[n - 1] ?? current, current - topStep);
    return list[n - 1] ?? current;
  }
  if (idx <= 0) return list[0] ?? current;
  return list[idx - 1] ?? current;
}

/**
 * @param {number} weight
 * @param {string} exerciseName
 * @param {{ladderAware?:boolean, curatedSteps?:ReadonlyArray<number>}} [ctx]
 *   OPTIONAL ladder-aware path. OMITTED → byte-identical legacy (the generic
 *   reduce below) — every existing caller + test is unaffected. When provided AND
 *   the dp_equipment_ladder_v1 flag is on, the weight is snapped to the user's
 *   LEARNED per-machine template (matched from their logged loads) — or a photo-
 *   curated ladder (ctx.curatedSteps, future seam, wins) — with this generic
 *   rounding as the GUARANTEED fallback (curated > matched > generic, never
 *   regresses). With no learned/curated ladder this returns the generic result
 *   too, so it is safe to always pass ctx once wired.
 */
export function roundToEquipmentWeight(weight, exerciseName, ctx) {
  const list = getList(exerciseName);
  const generic = () => list.reduce((prev, curr) =>
    Math.abs(curr - weight) < Math.abs(prev - weight) ? curr : prev
  , list[0] ?? weight);
  // Back-compat: no ctx → legacy generic rounding. dp_real_ladder_snap_v1 then snaps
  // the result onto the founder's REAL pin-machine stack (Cable Row / Reverse Pec
  // Deck / Shoulder Press machine / Leg Curl / Pec Deck) so a cold-start AND a
  // history rec land on a rung the machine actually has — flag OFF → byte-identical.
  if (!ctx || !ctx.ladderAware || !isEnabled('dp_equipment_ladder_v1')) {
    return _snapToRealStack(weight, exerciseName, generic());
  }
  // Ladder-aware: snapToLadder applies curated > matched-template precedence and
  // falls back to `generic` itself when the user has no learned/curated ladder. The
  // founder's measured real stack is the AUTHORITATIVE source, so it snaps last
  // (over the matched template too) — flag OFF → snapToLadder result unchanged.
  return _snapToRealStack(weight, exerciseName, snapToLadder(exerciseName, weight, generic, ctx.curatedSteps));
}

/** @param {string} exerciseName */
export function getEquipmentType(exerciseName) {
  const exMap = /** @type {Record<string, string>} */ (EXERCISE_EQUIPMENT_MAP);
  return exMap[exerciseName] || 'bailib_stack';
}


// Legacy EXERCISE_EQUIPMENT_TYPE alias (used nowhere currently, kept for safety)
export const EXERCISE_EQUIPMENT_TYPE = Object.fromEntries(
  Object.entries(EXERCISE_EQUIPMENT_MAP).map(([ex, t]) => [ex, t])
);
