// ══ EXERCISE TIER-RANK — Daniel's expert selection tier list (S/A/B/C/D) ═══════
// Founder's hand-ranked exercise-SELECTION quality per muscle, resolved onto the
// library's canonical `nameEn` keys. This is "WHAT to pick" (orthogonal to the
// library `tier`, which is compound/isolation = "HOW to sequence + dose").
//
// SOURCE OF TRUTH (vault SSOT, read-only):
//   - _EXERCISE_TIER_LIST_Daniel_2026-06-09.md  (Daniel's S/A/B/C/D per muscle +
//     the 2026-06-09 ADDENDUM tiering the 8 previously-unranked CORE_AUTO entries)
//   - _TIER_LIST_MAPPING_AUDIT_2026-06-09.md     (forward map Daniel name →
//     library nameEn: the authoritative EXACT + ALIAS tables used to resolve every
//     entry below)
// Bands (Daniel verbatim): S=top · A=foarte bun · B=bun cu minusuri ·
//   C=utilizabil inferior · D=slab / EXCLUDE din auto (anti-pattern blocklist).
//
// SCOPE — Wave 1: ONLY exercises that already exist in the library are banded.
// The ~31 MISSING S/A/B/C movements + the adductor MACHINE group are Wave 2 (NOT
// added here). A library exercise NOT in Daniel's list = UNRANKED (no entry).
//
// When the SAME library nameEn is rated under multiple muscles / Daniel-names, the
// BEST (highest) band wins — so an entry Daniel rates well in one muscle is never
// excluded because another context lists it lower. D-band entries that resolve to a
// real library exercise are KEPT (the selection step hard-excludes them), but the
// numeric rank uses a distinct exclude sentinel (5) so D never sorts as "just worse
// than UNRANKED" — it is removed, not merely demoted.

/**
 * @typedef {'S'|'A'|'B'|'C'|'D'} TierBand
 */

/**
 * Library `nameEn` → Daniel's selection band. Frozen. Entries resolved via the
 * forward audit's EXACT + ALIAS tables (2026-06-09). UNRANKED = absent (no key).
 * @type {Readonly<Record<string, TierBand>>}
 */
export const EXERCISE_TIER_RANK = Object.freeze({
  // ── S-band (63) ──
  "45° Hyperextension": 'S',
  "Barbell Back Squat (High Bar)": 'S',
  "Bayesian Curl": 'S',
  "Behind-the-Back Cable Lateral": 'S',
  "Bulgarian Split Squat": 'S',
  "Cable Crunch Kneeling": 'S',
  "Cable Fly": 'S',
  "Cable Lateral Raise": 'S',
  "Cable Overhead Triceps Extension EZ-bar": 'S',
  "Cable Overhead Triceps Extension Rope": 'S',
  "Cable Single-Arm Overhead Triceps Extension": 'S',
  "Cable Rear Delt Fly": 'S',
  "Cable Row": 'S',
  "Cable Triceps Kickback Rope": 'S',
  "Cable Wrist Curl": 'S',
  "Chest-Supported Row": 'S',
  "Copenhagen Plank": 'S',
  "DB Preacher Curl": 'S',
  "DB Shrug": 'S',
  "EZ-bar Preacher Curl": 'S',
  "Flat Chest Press Machine": 'S',
  "Glute Drive Machine": 'S',
  "Glute Walking Lunge": 'S',
  "Hack Squat Machine": 'S',
  "Hammer Curl": 'S',
  "Hammer Strength Row": 'S',
  "Hanging Leg Raise": 'S',
  "Hip Abduction Machine": 'S',
  "Converging Chest Press": 'S',
  "Incline Chest Press Machine": 'S',
  "Incline DB Curl": 'S',
  "Lat Pulldown": 'S',
  "Leg Curl": 'S',
  "Leg Extension": 'S',
  "Leg Extension Single-Leg": 'S',
  "Leg Press Calf Raise": 'S',
  "Machine Lateral Raise": 'S',
  "Machine Preacher Curl": 'S',
  "Machine Shoulder Press": 'S',
  "Machine Shrug": 'S',
  "Neutral-Grip Lat Pulldown": 'S',
  "Pendulum Squat": 'S',
  "Plate-Loaded Hip Thrust Machine": 'S',
  "Reverse Cable Crossover": 'S',
  "Reverse Curl EZ-bar": 'S',
  "Reverse Pec Deck": 'S',
  "Reverse Wrist Curl Cable": 'S',
  "Romanian Deadlift": 'S',
  "Seated Calf Raise Machine": 'S',
  "Seated Leg Curl": 'S',
  "Single-Arm Lat Pulldown": 'S',
  "Smith Incline Bench": 'S',
  "Smith Machine Bench": 'S',
  "Smith Machine Shrug": 'S',
  "Smith Machine Squat": 'S',
  "Smith OHP": 'S',
  "Standing Cable Hip Abduction": 'S',
  "Standing Calf Raise Machine": 'S',
  "V-Bar Cable Row": 'S',
  "V-Bar Lat Pulldown": 'S',
  "Wide-Grip Cable Row": 'S',
  "Wide-Grip Lat Pulldown": 'S',
  "Y Raise": 'S',
  // ── A-band (79) ──
  "45-Degree Leg Press": 'A',
  "Ab Wheel Rollout": 'A',
  "Assisted Dip Machine": 'A',
  "Band-Assisted Pull-up": 'A',
  "Barbell Back Squat (Low Bar)": 'A',
  "BB Shrug": 'A',
  "Belt Squat": 'A',
  "Cable Crossover Standing": 'A',
  "Cable Curl": 'A',
  "Cable Curl Lying on Bench": 'A',
  "Cable Glute Kickback": 'A',
  "Cable Hammer Curl Rope": 'A',
  "Cable Shrug": 'A',
  "Cable Triceps Pushdown Rope": 'A',
  "Cable Triceps Pushdown Single-Arm": 'A',
  "Cable Triceps Pushdown Straight Bar": 'A',
  "Cable Triceps Pushdown V-bar": 'A',
  "Captains Chair Leg Raise": 'A',
  "Chest-Supported DB Row": 'A',
  "Close-Grip Bench Press": 'A',
  "Cossack Squat": 'A',
  "DB Curl Standing": 'A',
  "DB Fly": 'A',
  "DB Hammer Curl Standing": 'A',
  "DB Lying Triceps Extension": 'A',
  "DB Overhead Triceps Extension Two-Hand": 'A',
  "DB Rear Delt Fly": 'A',
  "DB Romanian Deadlift": 'A',
  "DB Row": 'A',
  "DB Sumo Squat": 'A',
  "Decline Sit-up": 'A',
  "Dip": 'A',
  "Donkey Calf Raise": 'A',
  "EZ-bar Curl Standing": 'A',
  "Farmer's Walk DB": 'A',
  "Farmer's Walk Trap Bar": 'A',
  "Flat Barbell Bench": 'A',
  "Flat DB Press": 'A',
  "Front Squat": 'A',
  "Glute-Focus Step-up": 'A',
  "Glute-Ham Raise": 'A',
  "Hack Squat Calf Raise": 'A',
  "Hammer Strength Lateral": 'A',
  "Hip Thrust": 'A',
  "Incline Barbell Bench": 'A',
  "Incline DB Press": 'A',
  "Kroc Row": 'A',
  "Leaning Lateral Raise": 'A',
  "Leg Curl Single-Leg": 'A',
  "Leg Press": 'A',
  "Lying Triceps Extension Barbell": 'A',
  "Lying Triceps Extension EZ-bar": 'A',
  "Machine Pullover": 'A',
  "Machine Seated Curl": 'A',
  "Meadows Row": 'A',
  "Neutral-Grip Pull-up": 'A',
  "Nordic Hamstring Curl": 'A',
  "Pec Deck / Cable Fly": 'A',
  "Pendlay Row": 'A',
  "Pull-up": 'A',
  "Reverse Crunch": 'A',
  "Rope Face Pull": 'A',
  "Seated DB Press": 'A',
  "Seated Rear Delt": 'A',
  "Single-Arm Cable Row": 'A',
  "Single-Arm Rear Delt": 'A',
  "Smith Close-Grip Bench": 'A',
  "Smith Hip Thrust": 'A',
  "Smith Reverse Lunge": 'A',
  "Smith Split Squat": 'A',
  "Smith Standing Calf Raise": 'A',
  "Standing Single-Leg Calf Raise": 'A',
  "Straight-Arm Lat Pulldown": 'A',
  "Triceps Press Machine": 'A',
  "Walking Lunge": 'A',
  "Weighted Pull-up": 'A',
  "Wide-Stance Leg Press": 'A',
  "Wrist Curl DB Seated Palms-Up": 'A',
  "Wrist Roller": 'A',
  // ── B-band (65) ──
  "Arnold Press": 'B',
  "Barbell Curl Standing": 'B',
  "Barbell Curl Strict Wall Support": 'B',
  "Barbell Glute Bridge": 'B',
  "Barbell Good Morning": 'B',
  "Barbell Row": 'B',
  "Bent-Over DB Lateral": 'B',
  "Cable Crossover High-to-Low": 'B',
  "Cable Fly Low-to-High": 'B',
  "Cable Leg Curl": 'B',
  "Cable Pull-Through": 'B',
  "Cable Triceps Pushdown Reverse Grip": 'B',
  "Cable Woodchop High-to-Low": 'B',
  "Cheat Curl Barbell": 'B',
  "Chin-up": 'B',
  "Conventional Deadlift": 'B',
  "Curtsy Lunge": 'B',
  "DB Hip Thrust": 'B',
  "DB Lateral Raise": 'B',
  "DB Lunge": 'B',
  "DB Pullover": 'B',
  "DB Shoulder Press": 'B',
  "DB Single-Leg RDL": 'B',
  "DB Spider Curl": 'B',
  "DB Step-up": 'B',
  "Dead Hang": 'B',
  "Decline Barbell Bench": 'B',
  "Decline DB Press": 'B',
  "Diamond Push-up": 'B',
  "Goblet Squat": 'B',
  "Hanging Knee Raise": 'B',
  "High Cable Row": 'B',
  "Horizontal Leg Press": 'B',
  "JM Press": 'B',
  "Kettlebell Goblet Squat": 'B',
  "Landmine Shoulder Press": 'B',
  "Landmine T-Bar Row": 'B',
  "Lateral Lunge": 'B',
  "Machine Rear Delt": 'B',
  "OHP": 'B',
  "Pallof Press Cable Standing": 'B',
  "Pec Deck Plate-Loaded": 'B',
  "Plank": 'B',
  "Plate Pinch Hold": 'B',
  "Power Clean": 'B',
  "Rack Pull": 'B',
  "Reverse Hyper": 'B',
  "Reverse Lunge": 'B',
  "Reverse Lunge Glute-Focus": 'B',
  "Seated DB Lateral": 'B',
  "Single-Leg Calf Raise Bodyweight": 'B',
  "Single-Leg RDL": 'B',
  "Sissy Squat Machine": 'B',
  "Stability Ball Crunch": 'B',
  "Stair Calf Raise": 'B',
  "Standing DB Calf Raise": 'B',
  "Standing DB Press": 'B',
  "Standing Leg Curl": 'B',
  "Stiff-Leg Deadlift": 'B',
  "Sumo Deadlift": 'B',
  "T-Bar Row Machine": 'B',
  "Tibialis Raise": 'B',
  "Triceps Dip Machine": 'B',
  "Triceps Dip Parallel Bars": 'B',
  "Wrist Curl Barbell Seated Palms-Up": 'B',
  // ── C-band (42) ──
  "21s Curl Barbell": 'C',
  "Alternating Front Raise": 'C',
  "Band Pull-Apart": 'C',
  "Banded Clamshell": 'C',
  "Bench Dip": 'C',
  "Bench Sit-up": 'C',
  "Bicycle Crunch": 'C',
  "Bodyweight Squat": 'C',
  "Cable Front Raise": 'C',
  "Captains of Crush Gripper": 'C',
  "DB Concentration Curl Standing": 'C',
  "DB Front Raise": 'C',
  "DB Kickback Standing": 'C',
  "Dead Bug": 'C',
  "Drag Curl Barbell": 'C',
  "Face Pull": 'C',
  "Fat Grip Hold": 'C',
  "Fire Hydrant": 'C',
  "Floor Press Barbell": 'C',
  "Frog Pump": 'C',
  "Glute Bridge Bodyweight": 'C',
  "Hyperextension Bodyweight": 'C',
  "Incline Push-up": 'C',
  "Inverted Row Bar": 'C',
  "Inverted Row Bar Wide": 'C',
  "Kettlebell Swing": 'C',
  "Knee Push-up": 'C',
  "Partial Lateral": 'C',
  "Pike Push-up": 'C',
  "Pistol Squat": 'C',
  "Plate Front Raise": 'C',
  "Plate Shrug": 'C',
  "Preacher Curl": 'C',
  "Push-up": 'C',
  "Side Plank": 'C',
  "Single-Leg Glute Bridge": 'C',
  "Slider Hamstring Curl": 'C',
  "T-Bar Row": 'C',
  "Towel Hang": 'C',
  "Trap Bar Deadlift": 'C',
  "Wall Sit Static": 'C',
  "Yates Row": 'C',
  // ── D-band (10) — anti-pattern blocklist (selection HARD-excludes these) ──
  "Band Leg Curl": 'D',
  "Behind-Back BB Shrug": 'D',
  "Behind-the-Neck Press": 'D',
  "Cable Russian Twist": 'D',
  "Cable Side Bend": 'D',
  "DB Cross-Body Hammer": 'D',
  "DB Squeeze Press": 'D',
  "Donkey Kick": 'D',
  "Plyometric Push-up": 'D',
  "Single-Arm DB Press": 'D',
});

// UNRANKED = BUG guard. Every CORE_AUTO library nameEn MUST carry an explicit
// band (enforced by the unrankedCount===0 invariant test) — a missing band is a
// MAP GAP (the alias-gap bug class: e.g. "Lat Pulldown"/"Leg Press" once had NO
// band, so flag-ON they ranked UNRANKED = below C-band and were almost never
// picked). The TEST catches that gap loudly. But PRODUCTION must never SINK a
// surprise unranked lift below C in a live session — so a library entry with no
// band resolves to this safe middle band (B) instead of an UNRANKED-below-C rank.
// This is a fail-SAFE fallback, not a license to leave gaps (the test is the gate).
export const DEFAULT_UNRANKED_TIER = 'B';

/**
 * Numeric rank for a library nameEn under Daniel's selection bands.
 *   S=0 · A=1 · B=2 · C=3 · D=5 (exclude sentinel)
 * Lower = more preferred. An UNRANKED name (no explicit band — a MAP GAP the
 * unrankedCount===0 test forbids for CORE_AUTO) falls back to DEFAULT_UNRANKED_TIER
 * (B → 2) so a surprise gap in production ranks as a safe middle option rather than
 * sinking below C. A D anti-pattern is the worst (and is hard-removed upstream).
 * @param {string} nameEn - library canonical English exercise name
 * @returns {0|1|2|3|5}
 */
export function tierRankOf(nameEn) {
  const band = EXERCISE_TIER_RANK[nameEn] ?? DEFAULT_UNRANKED_TIER;
  switch (band) {
    case 'S': return 0;
    case 'A': return 1;
    case 'B': return 2;
    case 'C': return 3;
    case 'D': return 5; // exclude sentinel
    default:  return 2; // defensive: DEFAULT_UNRANKED_TIER fallback (B)
  }
}

/** Sentinel numeric rank for a D-band (excluded) exercise. */
export const TIER_RANK_EXCLUDE = 5;

// ── hasLog = BOUNDED BONUS, not absolute override (Wave 1.1, dp_daniel_tier_select_v1)
// The OLD tier-select pool put PR-history as an ABSOLUTE band-0: a logged lift beat
// ANYTHING (so a logged mediocre C lift outranked a much-higher unlogged S). Wave 1.1
// makes the log a BOUNDED bonus on top of Daniel's selection band, so quality leads:
//   tierScore = { S:100, A:80, B:60, C:35 }   (D excluded upstream, never scored)
//   score(e)  = tierScore[band] + hasLogBonus(+10) + recentProgressBonus(+5)
//                                 − stalenessPenalty(−5)
// Worked examples (the founder's intent): logged-C (45) < unlogged-S (100);
// logged-A (90) competitive with unlogged-S (100); logged-B (70) < unlogged-A (80)
// but not absurdly. Higher score = picked first. progress / staleness / userPreference
// are HOOKS (default 0 — no live source threaded yet) so the model is correct +
// extensible without fabricating signal. Used ONLY on the tier-select path.
/** @type {Readonly<Record<'S'|'A'|'B'|'C', number>>} */
export const TIER_SELECT_SCORE = Object.freeze({ S: 100, A: 80, B: 60, C: 35 });
/** hasLog bounded bonus (a logged lift is preferred, but never an absolute override). */
export const HAS_LOG_BONUS = 10;
/** recent-progress bonus (the lift is moving up) — hook, no live source yet. */
export const RECENT_PROGRESS_BONUS = 5;
/** staleness penalty (the lift has been unused a long time) — hook, no live source yet. */
export const STALENESS_PENALTY = 5;

/**
 * Tier-select SELECTION SCORE for a library nameEn (higher = picked first). The
 * band quality dominates; a log is a bounded bonus, not an override (Wave 1.1).
 * D-band is excluded from the pool upstream so it is never scored here; an UNRANKED
 * name falls back to DEFAULT_UNRANKED_TIER (B). progress/staleness/preference are
 * optional bonuses (default 0) so a caller without those signals scores on band+log.
 *
 * @param {string} nameEn - library canonical English exercise name
 * @param {{hasLog?: boolean, progressing?: boolean, stale?: boolean}} [signals]
 * @returns {number} selection score (higher preferred)
 */
export function tierSelectScore(nameEn, signals) {
  const band = EXERCISE_TIER_RANK[nameEn] ?? DEFAULT_UNRANKED_TIER;
  // D should be excluded before scoring; if it slips through, score it at the floor.
  const base = TIER_SELECT_SCORE[/** @type {'S'|'A'|'B'|'C'} */ (band)] ?? 0;
  let score = base;
  if (signals?.hasLog) score += HAS_LOG_BONUS;
  if (signals?.progressing) score += RECENT_PROGRESS_BONUS;
  if (signals?.stale) score -= STALENESS_PENALTY;
  return score;
}

// ── FLAG-GATED auto-selectability (dp_daniel_tier_select_v1) ─────────────────
// PART B intent: Daniel's S/A picks must be REACHABLE by auto-selection. The
// forward audit flagged ~44 distinct S/A library entries that are NOT currently
// CORE_AUTO (e.g. Machine/Smith/Cable Shrug, Cable Wrist Curl, Reverse Cable
// Crossover, the cable overhead triceps bar, Machine/DB Preacher Curl) — top picks
// the active-gate cannot surface today. Rather than STATICALLY flipping their
// exercises.json `status` (which would change the auto-pool globally → break the
// flag-OFF byte-identical kill-switch invariant + the frozen full-path-sim baseline),
// these are made auto-selectable ONLY when the flag is ON: poolForGroup's active gate
// admits a TIER_SELECTABLE_SA entry as if it were CORE_AUTO when danielTierSelect is
// true. Flag OFF → the data + the active gate are byte-identical to today. The list
// is exactly the S/A-band entries whose library status is not CORE_AUTO (verified
// 2026-06-09 against exercises.json).

/**
 * S/A-band library entries that are NOT currently `status: CORE_AUTO`. Auto-
 * selection admits these ONLY when dp_daniel_tier_select_v1 is ON (poolForGroup) so
 * Daniel's top picks become reachable without a global status flip. Frozen Set.
 * @type {ReadonlySet<string>}
 */
export const TIER_SELECTABLE_SA = Object.freeze(new Set([
  '45-Degree Leg Press',
  '45° Hyperextension',
  'Barbell Back Squat (Low Bar)',
  'Behind-the-Back Cable Lateral',
  'Cable Crossover Standing',
  'Cable Curl Lying on Bench',
  'Cable Overhead Triceps Extension EZ-bar',
  'Cable Shrug',
  'Cable Triceps Kickback Rope',
  'Cable Wrist Curl',
  'Copenhagen Plank',
  'Cossack Squat',
  'DB Lying Triceps Extension',
  'DB Preacher Curl',
  'DB Sumo Squat',
  'Decline Sit-up',
  'Donkey Calf Raise',
  'Glute Walking Lunge',
  'Glute-Focus Step-up',
  'Hack Squat Calf Raise',
  'Hammer Curl',
  'Hammer Strength Lateral',
  'Kroc Row',
  'Leg Curl Single-Leg',
  'Lying Triceps Extension Barbell',
  'Machine Preacher Curl',
  'Machine Shrug',
  'Meadows Row',
  'Neutral-Grip Pull-up',
  'Nordic Hamstring Curl',
  'Reverse Cable Crossover',
  'Reverse Wrist Curl Cable',
  'Rope Face Pull',
  'Seated Rear Delt',
  'Single-Arm Lat Pulldown',
  'Single-Arm Rear Delt',
  'Smith Machine Shrug',
  'Smith Reverse Lunge',
  'Smith Split Squat',
  'Standing Cable Hip Abduction',
  'Standing Single-Leg Calf Raise',
  'Wide-Grip Cable Row',
  'Wide-Stance Leg Press',
  'Wrist Curl DB Seated Palms-Up',
]));
