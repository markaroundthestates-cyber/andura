// ══ FOCUS-POLICY — per-focus PATTERN policy table (Wave 1.3 DATA, UNWIRED) ════════
// Focus presets (focus.js FOCUS_PRESETS) today scale only VOLUME (applyFocusBias).
// Daniel's Wave 1.3 design adds a per-focus PATTERN policy: in-session caps, per-
// session requirements, cross-day weekly minimums + frequency caps. THIS FILE IS
// DATA ONLY — a frozen FOCUS_RULES table. The constraint RESOLVER that READS it is
// a LATER Wave 1.3 step; nothing imports FOCUS_RULES yet (no sessionBuilder/compose
// wiring this step). The table is inert until dp_focus_policy_v1 (featureFlags.js,
// OFF) gates that resolver on.
//
// FOCUS IDS — keyed to the EXACT live preset ids in focus.js FOCUS_PRESETS:
//   balanced, v-taper, arms, chest, shoulders, back, lower, upper.
//   NOTE: `lose_fat` is a GOAL (slabire — goal/phase enum), NOT a focus look —
//   there is no `lose_fat` in FOCUS_PRESETS, so it is intentionally NOT a key here.
//   The id is the HYPHEN form `v-taper` (matches FOCUS_PRESETS), not `v_taper`.
//
// TAG VOCABULARY — `matchingTags` are the resolver's match signals. The library
// has NO sub-muscle tag (exercises.json fields: muscle_target_primary [coarse:
// umeri/spate/piept/...], muscle_target_secondary[], tier, equipment_type,
// skill_level, status). So a tag is matched by the resolver via the SAME signals
// sessionBuilder already uses: muscle_target_primary + movementKey() token. Tags
// that have NO such signal in the ACTIVE (CORE_AUTO) pool are flagged
// `// TAG NOT YET AVAILABLE — needs Wave 2 sub-muscle tagging` so the resolver
// skips them gracefully (see the Wave 1.3 tag-availability report for the full
// derivation). DERIVABLE tags (matched via group::token) carry no such comment.
//
// CLUSTERS — `applicableClusters` use the Big-6 cluster vocab (PHASE_CLUSTERS_BIG6
// in periodization/constants.js): push|pull|legs|upper|lower|full. The spec also
// names shoulders|back|chest|arms|fullbody — those are FOCUS-derived day labels the
// resolver may map; kept as-given so the resolver owns the cluster→label mapping.

/**
 * @typedef {'balanced'|'v-taper'|'arms'|'chest'|'shoulders'|'back'|'lower'|'upper'} FocusId
 */

/**
 * @typedef {'push'|'pull'|'legs'|'upper'|'lower'|'shoulders'|'back'|'chest'|'arms'|'fullbody'|'full'} DayCluster
 */

/**
 * Per-day-band target counts. `days1to2` = training 1-2 days/week, `days3to4` =
 * 3-4 days/week, `days5plus` = 5+ days/week. Higher frequency → more cross-day
 * room → higher minimums.
 * @typedef {{ days1to2: number, days3to4: number, days5plus: number }} ByDays
 */

/**
 * One cross-day weekly minimum a focus wants met across the training week.
 * @typedef {Object} WeeklyFocusTarget
 * @property {string} key - stable identifier (e.g. 'side_delt_slots').
 * @property {ByDays} targetByDays - minimum matching slots per week, by day-band.
 * @property {DayCluster[]} applicableClusters - clusters whose days count toward it.
 * @property {string[]} matchingTags - resolver match signals (group::token or name).
 * @property {'high'|'medium'|'low'} priority - relax order (low relaxed first).
 * @property {boolean} relaxable - may be dropped under a tight time/volume budget.
 */

/**
 * Per-focus PATTERN policy.
 * @typedef {Object} FocusRule
 * @property {FocusId} id
 * @property {Object} [sessionCaps] - max instances of a pattern WITHIN one session.
 * @property {number} [sessionCaps.maxVerticalPress]
 * @property {number} [sessionCaps.maxChestPressPatterns]
 * @property {number} [sessionCaps.maxTotalPressPatterns]
 * @property {number} [sessionCaps.maxVerticalPulls]
 * @property {number} [sessionCaps.maxHorizontalRows]
 * @property {number} [sessionCaps.maxHeavyLowerCompounds]
 * @property {number} [sessionCaps.maxDirectBicepsExercises]
 * @property {number} [sessionCaps.maxDirectTricepsExercises]
 * @property {number} [sessionCaps.maxDirectArmExercises]
 * @property {Object} [sessionRequirements] - per-session minimums / booleans.
 * @property {number} [sessionRequirements.minSideDeltSlots]
 * @property {number} [sessionRequirements.minRearDeltSlots]
 * @property {number} [sessionRequirements.minVerticalPullSlots]
 * @property {number} [sessionRequirements.minHorizontalRowSlots]
 * @property {boolean} [sessionRequirements.requireLatIsolationIfBackDay]
 * @property {boolean} [sessionRequirements.requireFlyeIfChestDay]
 * @property {boolean} [sessionRequirements.requireOverheadTricepsIfArmsOrPush]
 * @property {boolean} [sessionRequirements.requireStretchCurlIfArmsOrPull]
 * @property {WeeklyFocusTarget[]} [weeklyMinimums] - cross-day weekly minimums.
 * @property {ByDays} [frequencyCap] - max times/week the focus region is trained.
 */

/**
 * Frozen per-focus policy table keyed by the live FOCUS_PRESETS focus id.
 * DATA ONLY — inert until the Wave 1.3 resolver (dp_focus_policy_v1) reads it.
 * @type {Readonly<Record<FocusId, FocusRule>>}
 */
export const FOCUS_RULES = Object.freeze({
  // DEFAULT — no pattern policy (mirrors balanced's empty volume preset). Light/
  // empty caps so the resolver is a no-op for the default user (byte-identical).
  balanced: Object.freeze({
    id: 'balanced',
    sessionCaps: Object.freeze({}),
    sessionRequirements: Object.freeze({}),
    weeklyMinimums: Object.freeze([]),
  }),

  // V-TAPER — Daniel's worked example (shoulders + back UP for the V; lower relaxed).
  // Cap a single vertical press so a push/upper day doesn't blow its slots on two
  // overhead presses (the bug Task 2 fixed makes this cap MEANINGFUL — two presses
  // now dedup to one movementKey, so the cap is mostly already-satisfied, but stays
  // as the explicit policy). Require width work (side + rear delt) per shoulder day.
  'v-taper': Object.freeze({
    id: 'v-taper',
    sessionCaps: Object.freeze({
      maxVerticalPress: 1,        // umeri::press — one overhead press per session
      maxTotalPressPatterns: 2,   // press budget redirected toward width isolation
    }),
    sessionRequirements: Object.freeze({
      minSideDeltSlots: 1,        // umeri::lateral-raise — the #1 width movement
      minRearDeltSlots: 1,        // umeri::rear-delt|face-pull|fly (rear)
    }),
    weeklyMinimums: Object.freeze([
      Object.freeze({
        key: 'side_delt_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 3 }),
        applicableClusters: Object.freeze(['push', 'upper', 'shoulders']),
        // DERIVABLE: umeri + movementKey 'lateral-raise' (4 CORE_AUTO: DB/Cable/
        // Machine/Leaning Lateral Raise). 'side_delt' is a label, not a metadata tag.
        matchingTags: Object.freeze(['side_delt', 'lateral_raise']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'rear_delt_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 2 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'shoulders']),
        // DERIVABLE: umeri + movementKey 'rear-delt'|'face-pull'|'fly' (4 CORE_AUTO:
        // Cable/DB Rear Delt Fly, Face Pull, Reverse Pec Deck).
        matchingTags: Object.freeze(['rear_delt']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'lat_isolation',
        targetByDays: Object.freeze({ days1to2: 0, days3to4: 1, days5plus: 1 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'back']),
        // DERIVABLE (thin): spate + 'pullover' (Machine Pullover) or name
        // 'straight-arm' (Straight-Arm Lat Pulldown) — only 2 CORE_AUTO. The
        // 'lat_isolation'/'straight_arm_pulldown'/'pullover' label set maps onto
        // those two; a true lat-isolation sub-tag is Wave 2.
        matchingTags: Object.freeze(['lat_isolation', 'straight_arm_pulldown', 'pullover']),
        priority: 'medium',
        relaxable: true,
      }),
    ]),
    frequencyCap: Object.freeze({ days1to2: 2, days3to4: 3, days5plus: 4 }),
  }),

  // ARMS — biceps + triceps direct work UP (umeri secondary per focus.js).
  arms: Object.freeze({
    id: 'arms',
    sessionCaps: Object.freeze({
      maxDirectArmExercises: 6,   // a dedicated arm day can stack arm work
    }),
    sessionRequirements: Object.freeze({
      requireOverheadTricepsIfArmsOrPush: true, // long-head stretch (triceps overhead ext)
      requireStretchCurlIfArmsOrPull: true,     // stretched-position curl (preacher/incline)
    }),
    weeklyMinimums: Object.freeze([
      Object.freeze({
        key: 'direct_biceps_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 3 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'arms']),
        // DERIVABLE: biceps + movementKey 'curl'|'hammer-curl' (10 CORE_AUTO).
        matchingTags: Object.freeze(['direct_biceps']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'direct_triceps_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 3 }),
        applicableClusters: Object.freeze(['push', 'upper', 'arms']),
        // DERIVABLE: muscle_target_primary 'triceps' (12 CORE_AUTO: pushdown/
        // extension/press/dip variants).
        matchingTags: Object.freeze(['direct_triceps']),
        priority: 'high',
        relaxable: true,
      }),
    ]),
    frequencyCap: Object.freeze({ days1to2: 2, days3to4: 3, days5plus: 4 }),
  }),

  // CHEST — piept UP (triceps secondary). Require a flye stretch on a chest day;
  // allow up to 2 chest-press patterns (flat + incline, kept distinct by movementKey).
  chest: Object.freeze({
    id: 'chest',
    sessionCaps: Object.freeze({
      maxChestPressPatterns: 2,   // flat + incline (incline-press is a distinct key)
    }),
    sessionRequirements: Object.freeze({
      requireFlyeIfChestDay: true, // piept + 'fly' token (3 CORE_AUTO)
    }),
    weeklyMinimums: Object.freeze([
      Object.freeze({
        key: 'chest_flye_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 1, days5plus: 2 }),
        applicableClusters: Object.freeze(['push', 'upper', 'chest']),
        // DERIVABLE: piept + movementKey 'fly' (3 CORE_AUTO: Pec Deck/Cable Fly,
        // Cable Fly, DB Fly).
        matchingTags: Object.freeze(['flye']),
        priority: 'medium',
        relaxable: true,
      }),
    ]),
    frequencyCap: Object.freeze({ days1to2: 2, days3to4: 3, days5plus: 4 }),
  }),

  // SHOULDERS — umeri UP (lateral + rear for width). Same width requirements as
  // v-taper's shoulder side, but a standalone bias (no lower-region trade).
  shoulders: Object.freeze({
    id: 'shoulders',
    sessionCaps: Object.freeze({
      maxVerticalPress: 1,
    }),
    sessionRequirements: Object.freeze({
      minSideDeltSlots: 1,
      minRearDeltSlots: 1,
    }),
    weeklyMinimums: Object.freeze([
      Object.freeze({
        key: 'side_delt_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 3 }),
        applicableClusters: Object.freeze(['push', 'upper', 'shoulders']),
        matchingTags: Object.freeze(['side_delt', 'lateral_raise']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'rear_delt_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 1, days5plus: 2 }),
        applicableClusters: Object.freeze(['push', 'pull', 'upper', 'shoulders']),
        matchingTags: Object.freeze(['rear_delt']),
        priority: 'high',
        relaxable: true,
      }),
      // front_delt width is NOT auto-coverable today (front-raise variants exist in
      // the library but NONE are CORE_AUTO → never auto-offered). The resolver must
      // skip this minimum gracefully until Wave 2 promotes a front-raise variant.
      Object.freeze({
        key: 'front_delt_slots',
        targetByDays: Object.freeze({ days1to2: 0, days3to4: 0, days5plus: 1 }),
        applicableClusters: Object.freeze(['push', 'upper', 'shoulders']),
        // TAG NOT YET AVAILABLE — needs Wave 2 sub-muscle tagging
        matchingTags: Object.freeze(['front_delt', 'front_raise']),
        priority: 'low',
        relaxable: true,
      }),
    ]),
    frequencyCap: Object.freeze({ days1to2: 2, days3to4: 3, days5plus: 4 }),
  }),

  // BACK — spate UP (lats / upper back for width). Require a lat-isolation on a
  // back day; bias vertical pull + horizontal row presence across the week.
  back: Object.freeze({
    id: 'back',
    sessionCaps: Object.freeze({
      maxVerticalPulls: 2,
      maxHorizontalRows: 2,
    }),
    sessionRequirements: Object.freeze({
      minVerticalPullSlots: 1,
      minHorizontalRowSlots: 1,
      requireLatIsolationIfBackDay: true, // thin pool — resolver relaxes if unmet
    }),
    weeklyMinimums: Object.freeze([
      Object.freeze({
        key: 'vertical_pull_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 2 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'back']),
        // DERIVABLE: spate + movementKey 'pulldown'|'pull-up'|'chin-up' (9 CORE_AUTO).
        matchingTags: Object.freeze(['vertical_pull']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'horizontal_row_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 2 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'back']),
        // DERIVABLE: spate + movementKey 'row' (12 CORE_AUTO).
        matchingTags: Object.freeze(['horizontal_row']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'lat_isolation',
        targetByDays: Object.freeze({ days1to2: 0, days3to4: 1, days5plus: 1 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'back']),
        // DERIVABLE (thin, 2 CORE_AUTO): spate + 'pullover' or name 'straight-arm'.
        matchingTags: Object.freeze(['lat_isolation', 'straight_arm_pulldown', 'pullover']),
        priority: 'medium',
        relaxable: true,
      }),
    ]),
    frequencyCap: Object.freeze({ days1to2: 2, days3to4: 3, days5plus: 4 }),
  }),

  // LOWER — fese + quads/hams UP (gambe secondary). Cap heavy lower compounds per
  // session so a leg day isn't 3 maximal squats/deadlifts (recovery + time budget).
  lower: Object.freeze({
    id: 'lower',
    sessionCaps: Object.freeze({
      maxHeavyLowerCompounds: 2,  // squat|deadlift|leg-press|hip-thrust T1 (16 CORE_AUTO)
    }),
    sessionRequirements: Object.freeze({}),
    weeklyMinimums: Object.freeze([
      Object.freeze({
        key: 'heavy_lower_compound_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 3 }),
        applicableClusters: Object.freeze(['legs', 'lower', 'full', 'fullbody']),
        // DERIVABLE: (picioare-quads|picioare-hamstrings|fese) + movementKey
        // 'squat'|'deadlift'|'leg-press'|'hip-thrust' tier 1 (16 CORE_AUTO).
        matchingTags: Object.freeze(['heavy_lower_compound']),
        priority: 'high',
        relaxable: false,
      }),
    ]),
    frequencyCap: Object.freeze({ days1to2: 2, days3to4: 3, days5plus: 4 }),
  }),

  // UPPER — the mirror of v-taper (piept/spate/umeri UP, same lower relaxed).
  // Caps total press patterns + bias width + back coverage across upper days.
  upper: Object.freeze({
    id: 'upper',
    sessionCaps: Object.freeze({
      maxVerticalPress: 1,
      maxTotalPressPatterns: 3,   // chest press(es) + one overhead press on an upper day
    }),
    sessionRequirements: Object.freeze({
      minSideDeltSlots: 1,
      minVerticalPullSlots: 1,
      minHorizontalRowSlots: 1,
    }),
    weeklyMinimums: Object.freeze([
      Object.freeze({
        key: 'side_delt_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 2 }),
        applicableClusters: Object.freeze(['push', 'upper', 'shoulders']),
        matchingTags: Object.freeze(['side_delt', 'lateral_raise']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'vertical_pull_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 2 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'back']),
        matchingTags: Object.freeze(['vertical_pull']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'horizontal_row_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 1, days5plus: 2 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'back']),
        matchingTags: Object.freeze(['horizontal_row']),
        priority: 'medium',
        relaxable: true,
      }),
    ]),
    frequencyCap: Object.freeze({ days1to2: 2, days3to4: 4, days5plus: 5 }),
  }),
});

/** Valid focus ids (the keys of FOCUS_RULES — mirrors FOCUS_PRESETS). */
export const FOCUS_RULE_IDS = Object.freeze(Object.keys(FOCUS_RULES));

// ══ TAG DERIVER (Wave 1.3-B) ════════════════════════════════════════════════
// The library has NO sub-muscle tag (1.3-A investigation). The ONLY grounded
// signals are muscle_target_primary (coarse), the movementKey() token, and the
// exercise name. deriveExerciseTags maps ONE exercise → the Set of POLICY tags
// FOCUS_RULES actually references, using exactly those signals (mirrors how 1.3-A
// classified the CORE_AUTO pool). A tag 1.3-A marked MISSING (front_delt /
// front_raise — no CORE_AUTO front-raise variant) is simply NEVER emitted → any
// requirement/cap keyed on it is a graceful no-op, NOT an error.
//
// The token comes from movementKey(name, meta) → '<group>::<token>'. The resolver
// passes its own movementKey in (threaded, so focusPolicy stays decoupled from
// sessionBuilder — no import cycle).

/** muscle_target_primary values that count as "lower body" for heavy compounds. */
const LOWER_GROUPS = new Set(['picioare-quads', 'picioare-hamstrings', 'fese']);
/** movement tokens that are a HEAVY lower compound (tier-1 only). */
const HEAVY_LOWER_TOKENS = new Set(['squat', 'deadlift', 'leg-press', 'hip-thrust']);

/**
 * Extract the bare movement token from a movementKey ('umeri::lateral-raise' →
 * 'lateral-raise'; 'piept::name:foo' → 'name:foo'; 'piept::incline-press' →
 * 'incline-press'). Returns '' when no token segment.
 * @param {string} mk
 * @returns {string}
 */
function tokenOf(mk) {
  const i = mk.indexOf('::');
  return i >= 0 ? mk.slice(i + 2) : '';
}

/**
 * Derive the Set of POLICY tags for ONE exercise, from ONLY muscle_target_primary
 * + the movementKey token + the name. Grounded against the 143 CORE_AUTO entries
 * (Wave 1.3-A). Covers exactly the tags FOCUS_RULES references; MISSING tags
 * (front_delt/front_raise) are never emitted (graceful no-op downstream).
 *
 * @param {string} name - library/engine exercise name
 * @param {{muscle_target_primary?: string, tier?: number}} meta
 * @param {(name: string, meta: object) => string} movementKey - threaded tokenizer
 * @returns {Set<string>} policy tags
 */
export function deriveExerciseTags(name, meta, movementKey) {
  const tags = new Set();
  const group = meta?.muscle_target_primary ?? '';
  const lower = String(name).toLowerCase();
  const mk = typeof movementKey === 'function' ? movementKey(name, meta) : `${group}::`;
  const token = tokenOf(mk);
  const tier = meta?.tier;

  // ── Shoulders (umeri) ──
  if (group === 'umeri') {
    if (token === 'lateral-raise') {
      tags.add('side_delt');
      tags.add('lateral_raise');
    }
    // Rear delt = the rear-delt / face-pull tokens, OR a 'fly' on umeri (reverse
    // pec deck keys umeri::fly). Cable/DB Rear Delt Fly → rear-delt; Face Pull →
    // face-pull.
    if (token === 'rear-delt' || token === 'face-pull' || token === 'fly') {
      tags.add('rear_delt');
    }
    // Overhead press on shoulders = the vertical (overhead) press. The press
    // token on umeri is always an overhead press (Shoulder/Landmine Press); an
    // incline/decline-press key is a chest angle, not an umeri pattern.
    if (token === 'press') {
      tags.add('vertical_press');
    }
    // front_delt / front_raise — NO CORE_AUTO front-raise variant (1.3-A MISSING).
    // Intentionally NOT emitted → shoulders' front_delt minimum is a graceful no-op.
  }

  // ── Chest (piept) ──
  if (group === 'piept') {
    // Chest press = a press (flat/incline/decline) or a dip (Dip keys piept::dip).
    if (token === 'press' || token === 'incline-press' || token === 'decline-press' || token === 'dip') {
      tags.add('chest_press');
    }
    if (token === 'fly') tags.add('flye');
  }

  // ── Back (spate) ──
  if (group === 'spate') {
    if (token === 'pulldown' || token === 'pull-up' || token === 'chin-up') {
      tags.add('vertical_pull');
    }
    if (token === 'row') tags.add('horizontal_row');
    // Lat isolation = Machine Pullover (spate::pullover) OR Straight-Arm Lat
    // Pulldown (keys spate::pulldown since 'pulldown' matches first → name-match).
    if (token === 'pullover' || /straight[-\s]?arm/.test(lower)) {
      tags.add('lat_isolation');
      tags.add('pullover');
      tags.add('straight_arm_pulldown');
    }
  }

  // ── Triceps ──
  if (group === 'triceps') {
    tags.add('direct_triceps');
    // Overhead (long-head) triceps = name contains 'overhead' (Cable/DB Overhead
    // Triceps Extension). The token is 'extension'/'press' so name-match is the
    // grounded signal.
    if (/overhead/.test(lower)) tags.add('overhead_triceps');
  }

  // ── Biceps ──
  if (group === 'biceps') {
    tags.add('direct_biceps');
    // Stretched-position curl = preacher OR incline (EZ-bar/DB Preacher Curl,
    // Incline DB Curl) — the long-head-stretch curls.
    if (/preacher/.test(lower) || /incline/.test(lower)) {
      tags.add('stretch_curl');
      tags.add('preacher');
    }
  }

  // ── Heavy lower compound (across the three lower groups, tier-1 only) ──
  if (LOWER_GROUPS.has(group) && tier === 1 && HEAVY_LOWER_TOKENS.has(token)) {
    tags.add('heavy_lower_compound');
  }

  return tags;
}

// ══ THE RESOLVER (Wave 1.3-B) ═══════════════════════════════════════════════
// applyFocusPolicy is the LOCAL (per-session) constraint resolver. It reads the
// focus's sessionCaps + sessionRequirements from FOCUS_RULES and adjusts the
// already-selected `chosen` list. It is FLAG-GATED at the call site
// (dp_focus_policy_v1) — flag OFF → never called → output byte-identical.
//
// PRECEDENCE (Daniel-locked, highest first):
//   safety/equipment/refusal   — enforced UPSTREAM (poolForGroup HARD excludes);
//                                NEVER touched/overridden here. The pool the
//                                resolver injects from has already passed them.
//   > recovery                 — applied UPSTREAM (M1 fatigued-drop); NEVER undone.
//   > movement coverage        — never strand a movement pattern empty (a prune is
//                                refused if it removes the LAST exercise carrying a
//                                required tag / movement).
//   > weekly focus targets     — 1.3-C: each WeeklyFocusTarget is TRANSLATED into a
//                                per-session requirement (one matching exposure on a
//                                qualifying cluster day) and MAX-merged into the
//                                effective requirement set below — NOT a cross-day
//                                ledger (the app composes per-day, no composeWeek).
//   > sessionRequirements      — inject a required slot if available & missing
//                                (the effective set = explicit reqs MAX weekly).
//   > sessionCaps              — prune the lowest-value excess over a cap.
//   > score bias / tier / hist — the existing ranking (lowest precedence; the
//                                tiebreak for WHICH excess to prune / WHICH
//                                candidate to inject).
//
// GRACEFUL RELAXATION (when over-constrained / requirements conflict):
//   (1) caps + score bias relax FIRST (a cap never removes a logged PR lift, never
//       empties a required movement);
//   (2) then LOW/MEDIUM-priority relaxable requirements drop (priority 'low' before
//       'medium'); a HIGH/non-relaxable requirement is still only met if a real
//       candidate exists — it NEVER invents/forces an excluded exercise;
//   (3) NEVER relax safety/equipment/refusal (upstream) and NEVER inject an
//       unavailable exercise. PREFER returning FEWER good exercises over padding
//       with bad/excluded ones.
//
// DETERMINISM: all tie-breaks use the threaded seeded score (ctx.scoreOf) + the
// existing `chosen` order — NO Math.random / Date.now. Same seed → same output.

// ── 1.3-C: weeklyMinimums → per-session requirements ──────────────────────────
// The app composes PER-DAY on demand (no composeWeek), so there is NO cross-day
// state to spread a weekly count across. We translate each WeeklyFocusTarget into
// a PER-SESSION minimum on its QUALIFYING cluster day: ONE matching exposure per
// qualifying day. The split's frequency (this cluster recurs N×/week) then delivers
// the weekly count emergently — we do NOT divide/spread. clusterFrequency is NOT
// cleanly threaded into this resolver's ctx (only daysPerWeek + the day's cluster
// are — see sessionBuilder applyFocusPolicy call), so we take the SIMPLE + SAFE
// branch: per-session min = 1 (never ceil(weeklyTarget/clusterFrequency)).
//
// The set of canonical tags the deriver actually emits. A weekly target whose
// matchingTags do not intersect this set (e.g. front_delt/front_raise — no
// CORE_AUTO variant, 1.3-A MISSING) yields NO requirement → graceful no-op, never
// forced/invented (exactly like the explicit-requirement path).
const DERIVABLE_TAGS = new Set([
  'side_delt', 'lateral_raise', 'rear_delt', 'vertical_press',
  'chest_press', 'flye', 'vertical_pull', 'horizontal_row',
  'lat_isolation', 'pullover', 'straight_arm_pulldown',
  'direct_triceps', 'overhead_triceps', 'direct_biceps', 'stretch_curl',
  'heavy_lower_compound',
]);

/** Pick the day-band key for a weekly target from the user's training days/week. */
function dayBandKey(daysPerWeek) {
  const d = Number(daysPerWeek);
  if (!Number.isFinite(d) || d <= 2) return 'days1to2';
  if (d <= 4) return 'days3to4';
  return 'days5plus';
}

/**
 * The canonical (derivable) tag a weekly target maps onto — the FIRST of its
 * matchingTags the deriver can emit. Chosen so it aligns with the explicit
 * sessionRequirements tag for the same concept (e.g. 'side_delt'), enabling a clean
 * MAX-merge (never a sum). Returns '' when none of the tags is derivable → no-op.
 * @param {string[]} matchingTags
 * @returns {string}
 */
function canonicalWeeklyTag(matchingTags) {
  for (const t of matchingTags || []) {
    if (DERIVABLE_TAGS.has(t)) return t;
  }
  return '';
}

/**
 * Resolve the EFFECTIVE per-session requirements, as {tag, count, priority,
 * relaxable}: the explicit sessionRequirements AND the translated weeklyMinimums,
 * MAX-merged by tag (never summed — a tag carried by both an explicit min and a
 * weekly target counts ONCE, at the larger count + higher priority + stricter
 * relaxable). daysPerWeek selects the weekly target's day-band.
 */
function requirementsFor(rule, cluster, daysPerWeek) {
  // Build into a by-tag map so the explicit + weekly passes MAX-merge cleanly.
  /** @type {Map<string, {tag: string, count: number, priority: string, relaxable: boolean}>} */
  const byTag = new Map();
  const PRI_RANK = { high: 0, medium: 1, low: 2 };
  const merge = (tag, count, priority, relaxable) => {
    if (!tag || !(count > 0)) return;
    const prev = byTag.get(tag);
    if (!prev) { byTag.set(tag, { tag, count, priority, relaxable }); return; }
    // MAX-merge: larger count, higher priority (lower rank), stricter relaxable.
    prev.count = Math.max(prev.count, count);
    if (PRI_RANK[priority] < PRI_RANK[prev.priority]) prev.priority = priority;
    prev.relaxable = prev.relaxable && relaxable;
  };

  // ── Explicit sessionRequirements (always per-session) ──
  const reqs = rule.sessionRequirements || {};
  if (typeof reqs.minSideDeltSlots === 'number')
    merge('side_delt', reqs.minSideDeltSlots, 'high', true);
  if (typeof reqs.minRearDeltSlots === 'number')
    merge('rear_delt', reqs.minRearDeltSlots, 'high', true);
  if (typeof reqs.minVerticalPullSlots === 'number')
    merge('vertical_pull', reqs.minVerticalPullSlots, 'high', true);
  if (typeof reqs.minHorizontalRowSlots === 'number')
    merge('horizontal_row', reqs.minHorizontalRowSlots, 'high', true);

  // Conditional booleans — gated on the day's cluster (the "IfChestDay" etc.). The
  // resolver owns the cluster→condition mapping; an unmet condition → not applicable.
  const isPush = cluster === 'push' || cluster === 'upper';
  const isPull = cluster === 'pull' || cluster === 'upper';
  const isChest = cluster === 'chest' || cluster === 'push' || cluster === 'upper';
  const isBack = cluster === 'back' || cluster === 'pull' || cluster === 'upper';
  const isArms = cluster === 'arms';

  if (reqs.requireFlyeIfChestDay && isChest)
    merge('flye', 1, 'medium', true);
  if (reqs.requireLatIsolationIfBackDay && isBack)
    merge('lat_isolation', 1, 'medium', true); // thin pool — relaxable
  if (reqs.requireOverheadTricepsIfArmsOrPush && (isArms || isPush))
    merge('overhead_triceps', 1, 'medium', true);
  if (reqs.requireStretchCurlIfArmsOrPull && (isArms || isPull))
    merge('stretch_curl', 1, 'medium', true);

  // ── 1.3-C: translated weeklyMinimums (one per-session exposure on a qualifying
  // cluster day; MAX-merged with any explicit min above, NEVER summed) ──
  const band = dayBandKey(daysPerWeek);
  for (const wt of rule.weeklyMinimums || []) {
    // (1) cluster not applicable → graceful no-op.
    if (!Array.isArray(wt.applicableClusters) || !wt.applicableClusters.includes(cluster)) continue;
    // (2) weekly target for this band is 0 → no-op.
    const weeklyTarget = wt.targetByDays?.[band];
    if (!(weeklyTarget > 0)) continue;
    // (4) the canonical derivable tag; underivable (front_delt) → graceful no-op.
    const tag = canonicalWeeklyTag(wt.matchingTags);
    if (!tag) continue;
    // (3) per-session min = 1 (simple + safe; clusterFrequency not in ctx).
    // (5)/(6) MAX-merge carries priority + relaxable so relaxation treats a low/
    // medium weekly target as relaxable before a high explicit requirement.
    merge(tag, 1, wt.priority, wt.relaxable);
  }

  return [...byTag.values()];
}

/** Map a sessionCaps key → the predicate that detects an offending exercise. */
function capMatchers() {
  // Each returns true when an exercise's tagset/movement matches the cap's pattern.
  return {
    maxVerticalPress: (tags) => tags.has('vertical_press'),
    maxChestPressPatterns: (tags) => tags.has('chest_press'),
    maxTotalPressPatterns: (tags) => tags.has('vertical_press') || tags.has('chest_press'),
    maxVerticalPulls: (tags) => tags.has('vertical_pull'),
    maxHorizontalRows: (tags) => tags.has('horizontal_row'),
    maxHeavyLowerCompounds: (tags) => tags.has('heavy_lower_compound'),
    maxDirectBicepsExercises: (tags) => tags.has('direct_biceps'),
    maxDirectTricepsExercises: (tags) => tags.has('direct_triceps'),
    maxDirectArmExercises: (tags) => tags.has('direct_biceps') || tags.has('direct_triceps'),
  };
}

/**
 * Apply the per-focus LOCAL constraint policy to an already-selected session.
 *
 * @param {Array<{name: string, sets: number}>} chosen - the selected exercises (in order)
 * @param {Object} ctx - resolver context (threaded from the call site)
 * @param {string} ctx.focusId - FOCUS_RULES key (e.g. 'v-taper')
 * @param {number} [ctx.daysPerWeek] - training days/week (for the 1.3-C hook only)
 * @param {string} [ctx.cluster] - the day's cluster (push/pull/legs/upper/lower/...)
 * @param {Array<{name: string, meta: object}>} [ctx.pool] - remaining available candidates
 *        (already past ALL upstream HARD excludes — injuries/refusal/equipment/D-band)
 * @param {Set<string>} [ctx.prNames] - logged-PR names (NEVER pruned — continuity)
 * @param {(name: string, meta: object) => string} ctx.movementKey - tokenizer
 * @param {(name: string) => object} ctx.getMeta - metadata lookup
 * @param {(name: string) => number} [ctx.scoreOf] - selection score (higher = keep);
 *        the deterministic tiebreak for prune/inject. Defaults to 0 (order-only).
 * @param {number} [ctx.sessionSizeCap] - per-session slot ceiling (default chosen.length)
 * @param {Object} [ctx.weeklyLedger] - 1.3-C cross-day ledger HOOK (read, not enforced)
 * @returns {Array<{name: string, sets: number}>} the adjusted session
 */
export function applyFocusPolicy(chosen, ctx) {
  if (!Array.isArray(chosen) || chosen.length === 0) return chosen;
  const rule = FOCUS_RULES[ctx?.focusId];
  if (!rule) return chosen; // unknown / balanced-with-no-policy → no-op
  const movementKey = ctx?.movementKey;
  const getMeta = ctx?.getMeta;
  if (typeof movementKey !== 'function' || typeof getMeta !== 'function') return chosen;
  const scoreOf = typeof ctx?.scoreOf === 'function' ? ctx.scoreOf : () => 0;
  const prNames = ctx?.prNames instanceof Set ? ctx.prNames : new Set();
  const cluster = ctx?.cluster ?? '';

  // Work on a mutable copy of the selected list, enriched with derived tags. Order
  // is the selection order = the priority order (earlier = higher value).
  /** @type {Array<{name: string, sets: number, tags: Set<string>, idx: number}>} */
  let session = chosen.map((e, idx) => ({
    name: e.name,
    sets: e.sets,
    tags: deriveExerciseTags(e.name, getMeta(e.name), movementKey),
    idx,
  }));

  const sessionSizeCap = typeof ctx?.sessionSizeCap === 'number' ? ctx.sessionSizeCap : chosen.length;

  // Count helpers over the current session.
  const tagCount = (tag) => session.reduce((n, e) => n + (e.tags.has(tag) ? 1 : 0), 0);
  // Movement key of an exercise (the dedup unit). MOVEMENT COVERAGE here means
  // REQUIRED coverage: the precedence rule "don't strand a movement pattern that
  // required coverage needs" is enforced via isRequirementCarrier (the sole carrier
  // of a still-needed required tag is never pruned/displaced). A non-required
  // accessory that happens to be the only holder of its key is NOT protected — a
  // cap's job is to thin a pattern, and an inject may displace a low-value accessory.
  const mkOf = (e) => movementKey(e.name, getMeta(e.name));

  // ── 1.3-C: weekly focus targets are TRANSLATED into per-session requirements
  // inside requirementsFor() (one exposure per qualifying cluster day, MAX-merged
  // with explicit sessionRequirements). The resolver stays LOCAL — no cross-day
  // state — and the split's frequency delivers the weekly count emergently. ──

  // ── sessionRequirements: INJECT a missing required slot when a candidate exists ──
  // Sort requirements so HIGH (least relaxable) is satisfied first; MEDIUM next;
  // LOW last. Within a priority, a stable order (declaration order) — deterministic.
  const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
  const reqs = requirementsFor(rule, cluster, ctx?.daysPerWeek).sort(
    (a, b) => (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]),
  );

  // The pool of injection candidates (already past every upstream HARD exclude),
  // not already in the session, each enriched with derived tags + a score. Ordered
  // best-first (score desc, then stable by name for determinism).
  const inSession = new Set(session.map((e) => e.name));
  const inMovement = new Set(session.map((e) => mkOf(e)));
  const candidates = (Array.isArray(ctx?.pool) ? ctx.pool : [])
    .filter((c) => c && c.name && !inSession.has(c.name))
    .map((c) => ({
      name: c.name,
      meta: c.meta ?? getMeta(c.name),
      tags: deriveExerciseTags(c.name, c.meta ?? getMeta(c.name), movementKey),
      score: scoreOf(c.name),
    }))
    .sort((a, b) => (b.score - a.score) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  for (const req of reqs) {
    let have = tagCount(req.tag);
    if (have >= req.count) continue;
    // Find the best-ranked candidate that carries the tag AND does not duplicate a
    // movement already present (avoid two of the same movement key).
    while (have < req.count) {
      const pick = candidates.find(
        (c) => c.tags.has(req.tag) && !inSession.has(c.name) && !inMovement.has(mkOf({ name: c.name, meta: c.meta })),
      );
      if (!pick) break; // NO qualifying candidate → graceful no-op (never invent/force)

      if (session.length < sessionSizeCap) {
        // Room: simply ADD the required slot.
        session.push({ name: pick.name, sets: defaultSetsOf(session), tags: pick.tags, idx: session.length });
      } else {
        // At ceiling: REPLACE the lowest-value NON-required exercise. "Non-required"
        // = does not itself satisfy a still-needed requirement (required coverage)
        // and is not a logged PR (continuity).
        const replaceIdx = lowestValueReplaceable(session, reqs, prNames, scoreOf);
        if (replaceIdx < 0) break; // nothing safe to displace → graceful no-op
        const removed = session[replaceIdx];
        inMovement.delete(mkOf(removed));
        session[replaceIdx] = { name: pick.name, sets: removed.sets, tags: pick.tags, idx: removed.idx };
      }
      inSession.add(pick.name);
      inMovement.add(mkOf({ name: pick.name, meta: pick.meta }));
      have++;
    }
  }

  // ── sessionCaps: PRUNE the lowest-value excess over each cap ──
  // Lowest-value = lowest selection score, then LAST in selection order (latest idx)
  // — the deterministic tiebreak. NEVER prune a logged-PR lift (continuity). NEVER
  // prune an exercise that is the SOLE carrier of a still-needed session requirement
  // (required movement coverage — the precedence rule "don't strand a movement
  // pattern that required coverage needs"). A cap's whole job is to thin a PATTERN,
  // so reducing a pattern to its cap — even when each offender is a distinct
  // movement key — is the intended behavior (only REQUIRED coverage is protected,
  // not every uniquely-keyed accessory).
  const caps = rule.sessionCaps || {};
  const matchers = capMatchers();
  const requiredTags = new Set(reqs.map((r) => r.tag));
  for (const [capKey, capVal] of Object.entries(caps)) {
    const match = matchers[capKey];
    if (!match || typeof capVal !== 'number') continue;
    let offenders = session.filter((e) => match(e.tags));
    if (offenders.length <= capVal) continue;
    // Removal order: lowest score first, then latest idx (lowest priority) first.
    const removable = offenders
      .filter((e) => !prNames.has(e.name) && !isRequirementCarrier(e, requiredTags, session))
      .sort((a, b) => (scoreOf(a.name) - scoreOf(b.name)) || (b.idx - a.idx));
    let excess = offenders.length - capVal;
    const toRemove = new Set();
    for (const e of removable) {
      if (excess <= 0) break;
      toRemove.add(e.name);
      excess--;
    }
    // GRACEFUL RELAXATION: if protections (PR/coverage/requirement) leave the cap
    // un-meetable, we PREFER honoring those protections over forcing the cap — the
    // cap is a SOFT preference below safety/recovery/coverage. (excess may stay > 0.)
    if (toRemove.size > 0) {
      session = session.filter((e) => !toRemove.has(e.name));
    }
  }

  return session.map((e) => ({ name: e.name, sets: e.sets }));
}

/** A reasonable default set count for an injected exercise = the modal/most-common
 * sets among the current session (so an injection matches the session's dosing),
 * falling back to 3 when empty. */
function defaultSetsOf(session) {
  if (!session.length) return 3;
  const counts = {};
  for (const e of session) counts[e.sets] = (counts[e.sets] || 0) + 1;
  let best = 3, bestN = -1;
  for (const [s, n] of Object.entries(counts)) {
    if (n > bestN) { bestN = n; best = Number(s); }
  }
  return best;
}

/** True when `e` is the sole/needed carrier of a still-required tag in the session. */
function isRequirementCarrier(e, requiredTags, session) {
  for (const tag of e.tags) {
    if (!requiredTags.has(tag)) continue;
    // sole carrier of this required tag → protected.
    const carriers = session.filter((o) => o.tags.has(tag)).length;
    if (carriers <= 1) return true;
  }
  return false;
}

/** Index of the lowest-value session entry safe to displace for a required inject,
 * or -1 if none. Safe = not a logged PR (continuity) and not a still-needed
 * requirement carrier (required coverage). A non-critical singleton MAY be
 * displaced — the only coverage that matters at the inject step is REQUIRED
 * coverage (isRequirementCarrier), not every uniquely-keyed accessory. Lowest
 * score + latest idx (lowest priority) wins. */
function lowestValueReplaceable(session, reqs, prNames, scoreOf) {
  const requiredTags = new Set(reqs.map((r) => r.tag));
  const candidates = session
    .map((e, i) => ({ e, i }))
    .filter(({ e }) =>
      !prNames.has(e.name) &&
      !isRequirementCarrier(e, requiredTags, session),
    )
    .sort((a, b) => (scoreOf(a.e.name) - scoreOf(b.e.name)) || (b.e.idx - a.e.idx));
  return candidates.length ? candidates[0].i : -1;
}
