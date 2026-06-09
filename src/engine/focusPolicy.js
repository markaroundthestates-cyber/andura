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
