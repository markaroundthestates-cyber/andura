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
 * @property {number} [sessionRequirements.minChestPressSlots] - chest-capable days only (push/upper/chest)
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
  // DEFAULT — minimal pattern policy (mirrors balanced's empty volume preset).
  // Daniel focus-sweep review 2026-06-11: ONE structural requirement applies to
  // EVERY focus, balanced included — a chest-capable day (push/upper/chest) must
  // anchor at least one chest press. The sweep's balanced 4d Upper composed with
  // Close-Grip Bench (triceps-primary) + a light fly as the only "chest" work —
  // the same fly-only-upper bug his live v-taper week surfaced. isChest-gated in
  // the resolver, so full/pull/leg days are untouched.
  balanced: Object.freeze({
    id: 'balanced',
    sessionCaps: Object.freeze({}),
    sessionRequirements: Object.freeze({
      minChestPressSlots: 1,
    }),
    weeklyMinimums: Object.freeze([
      // CONTRACT (dp_focus_contracts_v1, 2026-06-12): a side-delt slot on a balanced
      // push/upper/full day. balanced front-loads chest/back/legs and trains the side
      // delt only via cluster weight (~1 thin slot/day → shldr 4/wk @4d) — below the
      // ≥6/wk @4d+ balance promise. The cross-day minimum injects a lateral on each
      // qualifying day; the shoulder volume floor (focusVolumeContracts balanced) sizes
      // the dose. _contract-gated (balanced is byte-identical pre-arc when off).
      Object.freeze({
        key: 'side_delt_slots',
        _contract: true,
        targetByDays: Object.freeze({ days1to2: 0, days3to4: 1, days5plus: 1 }),
        applicableClusters: Object.freeze(['push', 'upper', 'shoulders', 'full', 'fullbody']),
        matchingTags: Object.freeze(['side_delt', 'lateral_raise']),
        priority: 'medium',
        relaxable: true,
      }),
    ]),
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
      // Daniel live coach-review 2026-06-11: his v-taper Saturday stacked Smith
      // Squat + RDL + Hip Thrust (3 heavy lower compounds) — the de-emphasized
      // lower region is MAINTENANCE, so one squat + ONE hinge/thrust is the day.
      maxHeavyLowerCompounds: 2,
      // CONTRACT (dp_focus_contracts_v1, 2026-06-12): shrug ≤2-3 sets/wk — a shrug is
      // NEVER a v-taper focus-filler (it builds traps UP, narrowing the V illusion).
      // One shrug/session × the pull days stays ≤3; the freed slots carry the width
      // (lateral/rear/lat-iso) the focus demands. lower-back stays in the existing
      // lumbar channel (lumbarDedup) — not capped here. _contract-gated.
      maxShrug: 1,
      // CONTRACT (dp_focus_contracts_v1): ONE vertical pull per session — a pull-heavy
      // v-taper week (3 pull days at 6-7d) otherwise stacks Lat Pulldown + Pull-up
      // (both vertical_pull) + Row + Pullover = 4 back exercises/day → back 35/wk. One
      // vertical pull keeps the day to ~3 back exercises (Pulldown OR Pull-up, + Row +
      // Pullover) → back lands ≤28, the freed slot carries rear-delt width. Distinct
      // contract key (NOT the back-focus maxVerticalPulls) so the gate is clean.
      maxFocusVerticalPull: 1,
    }),
    sessionRequirements: Object.freeze({
      minSideDeltSlots: 1,        // umeri::lateral-raise — the #1 width movement
      minRearDeltSlots: 1,        // umeri::rear-delt|face-pull|fly (rear)
      // Daniel live coach-review 2026-06-11: his Upper day had ZERO chest press
      // (only a 2x18 fly) — an upper/push day must anchor at least one press.
      // Chest-capable days only (the resolver gates on push/upper/chest).
      minChestPressSlots: 1,
    }),
    weeklyMinimums: Object.freeze([
      Object.freeze({
        key: 'side_delt_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 3 }),
        // 'full'/'fullbody' added 2026-06-11 (Daniel sweep review): a 1-3-day week
        // is ALL full-body days — v-taper width work (the WHOLE point of the focus)
        // never qualified there, so his 1-3d programs had zero direct lateral/rear.
        applicableClusters: Object.freeze(['push', 'upper', 'shoulders', 'full', 'fullbody']),
        // DERIVABLE: umeri + movementKey 'lateral-raise' (4 CORE_AUTO: DB/Cable/
        // Machine/Leaning Lateral Raise). 'side_delt' is a label, not a metadata tag.
        matchingTags: Object.freeze(['side_delt', 'lateral_raise']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'rear_delt_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 2 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'shoulders', 'full', 'fullbody']),
        // DERIVABLE: umeri + movementKey 'rear-delt'|'face-pull'|'fly' (4 CORE_AUTO:
        // Cable/DB Rear Delt Fly, Face Pull, Reverse Pec Deck).
        matchingTags: Object.freeze(['rear_delt']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'lat_isolation',
        targetByDays: Object.freeze({ days1to2: 0, days3to4: 1, days5plus: 1 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'back', 'full', 'fullbody']),
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
      // CONTRACT (dp_focus_contracts_v1, 2026-06-12): vertical-press (OHP family) cap
      // ≤8 sets/wk on an arms focus (the sweep ran Smith OHP 4×2 days). One overhead
      // press per session × the arms split's push days stays ≤8; this hard-stops a
      // 2nd OHP from stealing a curl/extension slot. Distinct key (maxArmVerticalPress)
      // — NOT the pre-arc maxVerticalPress — so the contract gate is clean (arms had no
      // press cap before this arc). _contract → gated by the flag.
      maxArmVerticalPress: 1,
      // CONTRACT (dp_week_ledger_v1, 2026-06-12): Close-Grip Bench ≤1/session AND — via
      // the cross-day ledger — ZERO on a LATER triceps day once the week already carried
      // one. Triceps owns the Close-Grip COMPOUND (~4 sets/exposure); 2 exposures (upper +
      // push) push delivered triceps to ~16 and break the biceps≥0.85×triceps parity that
      // the curl-pool taxonomy caps at ~12 (only 2 distinct biceps movement keys). Thinning
      // the 2nd close-grip drops triceps toward parity (the direct extensions still carry
      // the triceps focus). The per-session cap (1) holds the count; the ledger override
      // (ledgerContractAdjust → maxCloseGrip 0 on a later day) closes the WEEK. _contract.
      maxCloseGrip: 1,
    }),
    sessionRequirements: Object.freeze({
      requireOverheadTricepsIfArmsOrPush: true, // long-head stretch (triceps overhead ext)
      requireStretchCurlIfArmsOrPull: true,     // stretched-position curl (preacher/incline)
      minChestPressSlots: 1, // 2026-06-11 sweep review: every focus's push/upper day anchors a press
    }),
    weeklyMinimums: Object.freeze([
      Object.freeze({
        key: 'direct_biceps_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 3 }),
        // 'full'/'fullbody' added 2026-06-11 (Daniel sweep review): his ARMS-focus
        // 1-day program composed with ZERO direct curls (the full-body day never
        // qualified for this minimum) — an arms focus with no curl is broken.
        applicableClusters: Object.freeze(['pull', 'upper', 'arms', 'full', 'fullbody']),
        // DERIVABLE: biceps + movementKey 'curl'|'hammer-curl' (10 CORE_AUTO).
        matchingTags: Object.freeze(['direct_biceps']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'direct_triceps_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 3 }),
        applicableClusters: Object.freeze(['push', 'upper', 'arms', 'full', 'fullbody']),
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
      // CONTRACT (dp_focus_contracts_v1, 2026-06-12): Close-Grip family ≤4 sets/wk on a
      // chest focus AND never the largest pressing block. One Close-Grip/session × the
      // push days stays ≤4; the chest_press patterns (flat/incline, not Close-Grip)
      // remain the bigger block. _contract-gated.
      maxCloseGrip: 1,
      // CONTRACT: thin the NON-FOCUS back work so the DELIVERED chest leads back (the
      // chest split's pull/upper days otherwise stack a row + a vertical pull → back
      // 19-22 > chest @6-7d). maxBackLatWork caps the COMBINED lat work (row OR vertical
      // pull) to ONE exercise per session on a chest focus — back is maintenance here,
      // one lat anchor/day is plenty — so the delivered back stays below the emphasized
      // chest. The lumbar + shrug demote (focusContractDemotions) clears the trap/erector
      // junk on top. _contract-gated.
      maxBackLatWork: 1,
      maxShrug: 1,
    }),
    sessionRequirements: Object.freeze({
      requireFlyeIfChestDay: true, // piept + 'fly' token (3 CORE_AUTO)
      minChestPressSlots: 1, // 2026-06-11 sweep review: a CHEST focus of all focuses anchors a press
    }),
    weeklyMinimums: Object.freeze([
      Object.freeze({
        key: 'chest_flye_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 1, days5plus: 2 }),
        // 'full'/'fullbody' added 2026-06-11 (Daniel sweep review): chest-focus
        // 1-3d weeks are full-body days — the flye stretch must qualify there.
        applicableClusters: Object.freeze(['push', 'upper', 'chest', 'full', 'fullbody']),
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
      minChestPressSlots: 1, // 2026-06-11 sweep review: shoulders' upper days composed press-less
    }),
    weeklyMinimums: Object.freeze([
      Object.freeze({
        key: 'side_delt_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 3 }),
        // 'full'/'fullbody' added 2026-06-11 (Daniel sweep review): at 1-3 days
        // the week is ALL full-body days, so width work must qualify there too —
        // his shoulders 1-3d programs were OHP-only with zero direct lateral/rear.
        applicableClusters: Object.freeze(['push', 'upper', 'shoulders', 'full', 'fullbody']),
        matchingTags: Object.freeze(['side_delt', 'lateral_raise']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'rear_delt_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 1, days5plus: 2 }),
        applicableClusters: Object.freeze(['push', 'pull', 'upper', 'shoulders', 'full', 'fullbody']),
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
      // CONTRACT (dp_focus_contracts_v1, 2026-06-12): shrug ≤3 sets/wk — a back focus
      // is lats/upper-back WIDTH, not traps. One shrug/session × the pull days stays
      // ≤3; this stops a 2nd shrug stacking trap junk over a row. _contract-gated.
      maxShrug: 1,
    }),
    sessionRequirements: Object.freeze({
      minVerticalPullSlots: 1,
      minHorizontalRowSlots: 1,
      requireLatIsolationIfBackDay: true, // thin pool — resolver relaxes if unmet
      minChestPressSlots: 1, // 2026-06-11 sweep review: every focus's push/upper day anchors a press
      // CONTRACT (dp_focus_contracts_v1, 2026-06-12): direct biceps on a back-focus
      // pull/back day — back trains the biceps heavily; a back focus with bi 4-6/wk
      // (the sweep) under-serves them. TWO curls on the qualifying days: the biceps is
      // NOT in emphSet (no per-exercise dose boost), so a single 2-set curl × 2 days
      // delivers only ~4/wk — a 2nd curl slot doubles it to ≥8/wk @4d+. (The biceps is
      // genuine pull-day work on a back focus, not crowding.) The volume floor
      // (focusVolumeContracts back→biceps) backs the dose.
      minDirectBicepsSlots: 2,
    }),
    weeklyMinimums: Object.freeze([
      Object.freeze({
        key: 'vertical_pull_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 2 }),
        // 'full'/'fullbody' added 2026-06-11 (Daniel sweep review): back-focus 1-2d
        // full-body days carried a SINGLE back anchor — both pull patterns must
        // qualify on full days so vertical + row coexist at low frequency.
        applicableClusters: Object.freeze(['pull', 'upper', 'back', 'full', 'fullbody']),
        // DERIVABLE: spate + movementKey 'pulldown'|'pull-up'|'chin-up' (9 CORE_AUTO).
        matchingTags: Object.freeze(['vertical_pull']),
        priority: 'high',
        relaxable: true,
      }),
      // CONTRACT (dp_focus_contracts_v1): direct biceps ≥8/wk @4d+ — the cross-day
      // weekly minimum the per-session minDirectBicepsSlots delivers on each pull/back
      // day. _contract-gated (requirementsFor skips _contract minimums when off).
      Object.freeze({
        key: 'direct_biceps_slots',
        _contract: true,
        targetByDays: Object.freeze({ days1to2: 0, days3to4: 1, days5plus: 1 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'back', 'full', 'fullbody']),
        matchingTags: Object.freeze(['direct_biceps']),
        priority: 'medium',
        relaxable: true,
      }),
      Object.freeze({
        key: 'horizontal_row_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 2 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'back', 'full', 'fullbody']),
        // DERIVABLE: spate + movementKey 'row' (12 CORE_AUTO).
        matchingTags: Object.freeze(['horizontal_row']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'lat_isolation',
        targetByDays: Object.freeze({ days1to2: 0, days3to4: 1, days5plus: 1 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'back', 'full', 'fullbody']),
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
      // NOTE: the LOWER back-lat maintenance cap (≤1 lat/session on the upper/pull days)
      // is NOT a static cap here — it is injected by the cross-day LEDGER override
      // (ledgerContractAdjust → maxBackLatWork:1) only when the week ledger projects the
      // back above the founder's ≤0.65×max-lower cap, so it rides dp_week_ledger_v1 (NOT
      // the already-landed dp_focus_contracts_v1). See ledgerContractAdjust gap 4.
    }),
    sessionRequirements: Object.freeze({
      minChestPressSlots: 1, // 2026-06-11 sweep review: every focus's push/upper day anchors a press
    }),
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
      // Mirror of v-taper (2026-06-11): the de-emphasized lower region is
      // maintenance — one squat + ONE hinge/thrust per leg day, never three.
      maxHeavyLowerCompounds: 2,
      // CONTRACT (dp_focus_contracts_v1, 2026-06-12): ONE vertical pull per session —
      // the pull-heavy upper week (back 33-36/wk @6-7d) otherwise stacks two vertical
      // pulls + row + pullover. One vertical pull keeps back ≤1.5×shoulders, the freed
      // slot carries chest/shoulder width. _contract-gated (distinct key).
      maxFocusVerticalPull: 1,
      // CONTRACT: shrug ≤3/wk on upper too (traps are not the upper-body width signal).
      maxShrug: 1,
    }),
    sessionRequirements: Object.freeze({
      minSideDeltSlots: 1,
      minVerticalPullSlots: 1,
      minHorizontalRowSlots: 1,
      // 2026-06-11: an upper day must anchor at least one chest press (the
      // Daniel live week composed an Upper with only a light fly for chest).
      minChestPressSlots: 1,
      // CONTRACT (dp_focus_contracts_v1, 2026-06-12): direct triceps + biceps on an
      // upper-focus push/pull/upper day — the sweep ran tri 4-6/wk. TWO of each on the
      // qualifying days (arms not in emphSet → no per-exercise dose boost, one 2-set
      // slot under-delivers); the volume floors (focusVolumeContracts upper) back the
      // dose so each lands ≥8/wk @4d+. _contract-gated.
      minDirectTricepsSlots: 2,
      minDirectBicepsSlots: 2,
    }),
    weeklyMinimums: Object.freeze([
      Object.freeze({
        key: 'side_delt_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 2 }),
        // 'full'/'fullbody' added 2026-06-11 (Daniel sweep review) — see v-taper.
        applicableClusters: Object.freeze(['push', 'upper', 'shoulders', 'full', 'fullbody']),
        matchingTags: Object.freeze(['side_delt', 'lateral_raise']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'vertical_pull_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 2, days5plus: 2 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'back', 'full', 'fullbody']),
        matchingTags: Object.freeze(['vertical_pull']),
        priority: 'high',
        relaxable: true,
      }),
      Object.freeze({
        key: 'horizontal_row_slots',
        targetByDays: Object.freeze({ days1to2: 1, days3to4: 1, days5plus: 2 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'back', 'full', 'fullbody']),
        matchingTags: Object.freeze(['horizontal_row']),
        priority: 'medium',
        relaxable: true,
      }),
      // CONTRACT (dp_focus_contracts_v1): direct triceps + biceps ≥8/wk @4d+ — the
      // cross-day minimums the per-session reqs deliver on each push/pull/upper day.
      Object.freeze({
        key: 'direct_triceps_slots',
        _contract: true,
        targetByDays: Object.freeze({ days1to2: 0, days3to4: 1, days5plus: 1 }),
        applicableClusters: Object.freeze(['push', 'upper', 'arms', 'full', 'fullbody']),
        matchingTags: Object.freeze(['direct_triceps']),
        priority: 'medium',
        relaxable: true,
      }),
      Object.freeze({
        key: 'direct_biceps_slots',
        _contract: true,
        targetByDays: Object.freeze({ days1to2: 0, days3to4: 1, days5plus: 1 }),
        applicableClusters: Object.freeze(['pull', 'upper', 'arms', 'full', 'fullbody']),
        matchingTags: Object.freeze(['direct_biceps']),
        priority: 'medium',
        relaxable: true,
      }),
    ]),
    frequencyCap: Object.freeze({ days1to2: 2, days3to4: 4, days5plus: 5 }),
  }),
});

/** Valid focus ids (the keys of FOCUS_RULES — mirrors FOCUS_PRESETS). */
export const FOCUS_RULE_IDS = Object.freeze(Object.keys(FOCUS_RULES));

// Map each explicit sessionRequirements key → the policy tag(s) it is ABOUT, so
// the focus-relevant tag set is derived from the SAME data the resolver enforces
// (no second source of truth). Keyed on the requirement field name.
const REQ_KEY_TAGS = Object.freeze({
  minSideDeltSlots: ['side_delt', 'lateral_raise'],
  minRearDeltSlots: ['rear_delt'],
  minVerticalPullSlots: ['vertical_pull'],
  minHorizontalRowSlots: ['horizontal_row'],
  minChestPressSlots: ['chest_press'],
  minDirectBicepsSlots: ['direct_biceps'],   // CONTRACT (dp_focus_contracts_v1)
  minDirectTricepsSlots: ['direct_triceps'], // CONTRACT (dp_focus_contracts_v1)
  requireFlyeIfChestDay: ['flye'],
  requireLatIsolationIfBackDay: ['lat_isolation', 'pullover', 'straight_arm_pulldown'],
  requireOverheadTricepsIfArmsOrPush: ['overhead_triceps'],
  requireStretchCurlIfArmsOrPull: ['stretch_curl', 'preacher'],
});

/** sessionCaps keys that exist ONLY for the focus-contracts arc — applied by the
 *  resolver only when ctx.contractsOn (dp_focus_contracts_v1). The pre-arc caps
 *  (maxVerticalPress on v-taper/shoulders/upper, etc.) are NOT here, so the
 *  dp_focus_policy_v1-only path is byte-identical to before this arc. NOTE: arms'
 *  maxVerticalPress IS contract-only (arms had no press cap pre-arc) but the key name
 *  collides with the pre-arc cap on other focuses — so the gate is per-RULE below
 *  (a rule's _contract caps are listed in its own contractCapKeys), not a global set
 *  by key name. This set is the union for the cap-loop's quick membership test, used
 *  together with the rule-level whitelist. */
const CONTRACT_CAP_KEYS = Object.freeze(new Set([
  'maxShrug', 'maxCloseGrip', 'maxArmVerticalPress', 'maxFocusVerticalPull', 'maxBackLatWork',
]));

/**
 * F6 (Daniel coach audit 2026-06-10) — the Set of policy tags a focus CARES about,
 * derived from its FOCUS_RULES (sessionRequirements field names + every weekly
 * minimum's matchingTags). An ACCESSORY carrying one of these tags is "focus-
 * relevant" and should order ahead of a non-focus accessory (e.g. v-taper: a lat-
 * isolation Pullover before Shrug/Hyperextension). Derived from the SAME data the
 * resolver reads, so the two never drift. Unknown / balanced focus → empty Set →
 * the caller's ordering is byte-identical.
 *
 * @param {string} focusId - FOCUS_RULES key (e.g. 'v-taper')
 * @returns {Set<string>} policy tags the focus references
 */
export function focusRelevantTags(focusId) {
  const rule = FOCUS_RULES[focusId];
  const out = new Set();
  if (!rule) return out;
  for (const key of Object.keys(rule.sessionRequirements || {})) {
    for (const tag of REQ_KEY_TAGS[key] || []) out.add(tag);
  }
  for (const wt of rule.weeklyMinimums || []) {
    for (const tag of wt.matchingTags || []) out.add(tag);
  }
  return out;
}

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
    // SUB-BUCKET awareness (focus-contracts arc 2026-06-12): the spate group bundles
    // lat-width/row work WITH the traps (shrugs) and the lower-back family
    // (hyperextension / back extension / good-morning). A FOCUS signature minimum
    // (back-focus "vertical_pull + horizontal_row", v-taper "the V frame") must NOT be
    // satisfiable by a trap shrug or a lower-back hyperext — those are NOT the lats.
    // Name-matched (all spate-primary): Shrug → traps; Hyperextension / Back Extension /
    // Good Morning → lower-back. The contract layer demotes/caps these via the EXISTING
    // selection penalty + sessionCaps channels (never a hard delete from the pool).
    if (/\bshrug\b/.test(lower)) tags.add('shrug');
    if (/hyperext|back extension|good[-\s]?morning/.test(lower)) tags.add('lower_back');
  }

  // ── Triceps ──
  if (group === 'triceps') {
    tags.add('direct_triceps');
    // Overhead (long-head) triceps = name contains 'overhead' (Cable/DB Overhead
    // Triceps Extension). The token is 'extension'/'press' so name-match is the
    // grounded signal.
    if (/overhead/.test(lower)) tags.add('overhead_triceps');
    // Close-Grip family (triceps-primary, NOT a chest press — kept off chest_press
    // by design). Tagged so a CHEST focus can CAP it (≤4/wk) and keep it off the
    // largest-pressing-block role. Name-match (Close-Grip Bench / Smith Close-Grip).
    if (/close[-\s]?grip/.test(lower)) tags.add('close_grip');
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
  // CONTRACT (dp_focus_contracts_v1, 2026-06-12) sub-buckets.
  'shrug', 'lower_back', 'close_grip',
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
 *
 * weekClusters (F5 dp_latiso_dedup_v1, 2026-06-10): the active week's derived
 * cluster list. On the GENERALIST 'upper' day, a weekly target whose SPECIALIST
 * qualifying days this week (its applicableClusters minus 'upper') can deliver
 * the weekly count BY THEMSELVES is deferred to those days — Daniel's real case:
 * v-taper lat_isolation (1/wk) injected Machine Pullover on BOTH Pull and Upper
 * (cross-day redundancy, Upper stuck at 8). With a Pull day in the week, Upper
 * defers the lat-iso → 7 lifts; rear_delt (2/wk > 1 specialist day) keeps its
 * Upper exposure; a pure Upper/Lower split (0 specialist days) keeps everything
 * — the exact regression the blanket drop would have caused. Null/absent → no
 * deferral (byte-identical legacy).
 */
function requirementsFor(rule, cluster, daysPerWeek, weekClusters, contractsOn) {
  // F5 deferral set — computed from the weekly targets BEFORE the merge loop.
  /** @type {Set<string>} */
  const deferToSpecialist = new Set();
  if (cluster === 'upper' && Array.isArray(weekClusters) && weekClusters.length > 0) {
    const bandKey = dayBandKey(daysPerWeek);
    for (const wt of rule.weeklyMinimums || []) {
      if (wt._contract && !contractsOn) continue; // contract-only minimum, flag off
      const tag = canonicalWeeklyTag(wt.matchingTags);
      if (!tag) continue;
      const weeklyTarget = wt.targetByDays?.[bandKey];
      if (!(weeklyTarget > 0)) continue;
      const specialist = (wt.applicableClusters || []).filter((c) => c !== 'upper');
      if (specialist.length === 0) continue;
      const specialistDays = weekClusters.filter((c) => specialist.includes(c)).length;
      if (specialistDays >= weeklyTarget) deferToSpecialist.add(tag);
    }
  }
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
  const isFull = cluster === 'full' || cluster === 'fullbody';
  // A CHEST-focus full-body day is chest-capable too (gates finding 2026-06-11:
  // minChestPressSlots skipped 'full', so a chest-focus 1-3d week had NO press
  // guarantee — it relied on natural selection). Other focuses keep full days
  // ungated (v-taper/upper CAP presses; balanced full days select a press naturally).
  const isChest = cluster === 'chest' || cluster === 'push' || cluster === 'upper'
    || (isFull && rule.id === 'chest');
  const isBack = cluster === 'back' || cluster === 'pull' || cluster === 'upper';
  const isArms = cluster === 'arms';

  // minChestPressSlots (2026-06-11) — chest-capable days only: an upper/push day
  // anchors >=1 chest press (HIGH: a press is structural, not an accessory). A
  // pull/legs day never demands one (no piept pool there → graceful no-op anyway).
  if (typeof reqs.minChestPressSlots === 'number' && isChest)
    merge('chest_press', reqs.minChestPressSlots, 'high', true);

  if (reqs.requireFlyeIfChestDay && isChest)
    merge('flye', 1, 'medium', true);
  if (reqs.requireLatIsolationIfBackDay && isBack)
    merge('lat_isolation', 1, 'medium', true); // thin pool — relaxable
  if (reqs.requireOverheadTricepsIfArmsOrPush && (isArms || isPush))
    merge('overhead_triceps', 1, 'medium', true);
  if (reqs.requireStretchCurlIfArmsOrPull && (isArms || isPull))
    merge('stretch_curl', 1, 'medium', true);

  // CONTRACT (dp_focus_contracts_v1) — direct arm-work injection on the qualifying
  // cluster (biceps on a pull/upper/arms/full day; triceps on a push/upper/arms/full
  // day). MEDIUM/relaxable: a curl/extension is structural for a back/upper/arms focus
  // but yields before a HIGH width/press requirement. Only when contracts are ON
  // (off → these keys never existed in the pre-arc path → byte-identical).
  if (contractsOn) {
    if (typeof reqs.minDirectBicepsSlots === 'number' && (isPull || isArms || isFull))
      merge('direct_biceps', reqs.minDirectBicepsSlots, 'medium', true);
    if (typeof reqs.minDirectTricepsSlots === 'number' && (isPush || isArms || isFull))
      merge('direct_triceps', reqs.minDirectTricepsSlots, 'medium', true);
  }

  // ── 1.3-C: translated weeklyMinimums (one per-session exposure on a qualifying
  // cluster day; MAX-merged with any explicit min above, NEVER summed) ──
  const band = dayBandKey(daysPerWeek);
  for (const wt of rule.weeklyMinimums || []) {
    // CONTRACT-only weekly minimum (focus-contracts arc) → skipped unless the flag is
    // ON, so the dp_focus_policy_v1-only path is byte-identical to the pre-arc table.
    if (wt._contract && !contractsOn) continue;
    // (1) cluster not applicable → graceful no-op.
    if (!Array.isArray(wt.applicableClusters) || !wt.applicableClusters.includes(cluster)) continue;
    // (2) weekly target for this band is 0 → no-op.
    const weeklyTarget = wt.targetByDays?.[band];
    if (!(weeklyTarget > 0)) continue;
    // (4) the canonical derivable tag; underivable (front_delt) → graceful no-op.
    const tag = canonicalWeeklyTag(wt.matchingTags);
    if (!tag) continue;
    // (F5) deferred to this week's specialist days → no-op on the generalist day.
    if (deferToSpecialist.has(tag)) continue;
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
    // CONTRACT (dp_focus_contracts_v1) sub-bucket caps.
    maxShrug: (tags) => tags.has('shrug'),
    maxCloseGrip: (tags) => tags.has('close_grip'),
    maxArmVerticalPress: (tags) => tags.has('vertical_press'),
    maxFocusVerticalPull: (tags) => tags.has('vertical_pull'),
    // ALL direct back-width work — vertical pull, row, AND the lat-isolation pullover/
    // straight-arm. The lower-focus maintenance cap thins the back accessory STACK
    // (pulldown+row+pullover) on its upper/pull days; counting the pullover too lets the
    // cap reach the founder's back ceiling instead of leaving a 3rd lat lift uncapped.
    maxBackLatWork: (tags) => tags.has('vertical_pull') || tags.has('horizontal_row')
      || tags.has('lat_isolation') || tags.has('pullover') || tags.has('straight_arm_pulldown'),
    maxHeavyLowerCompounds: (tags) => tags.has('heavy_lower_compound'),
    maxDirectBicepsExercises: (tags) => tags.has('direct_biceps'),
    maxDirectTricepsExercises: (tags) => tags.has('direct_triceps'),
    maxDirectArmExercises: (tags) => tags.has('direct_biceps') || tags.has('direct_triceps'),
  };
}

// ══ CROSS-DAY LEDGER CONTRACT ADJUSTMENTS (dp_week_ledger_v1, 2026-06-12) ════════════
// The four founder contracts a per-day pass cannot reach (the gate's `// GAP:` notes)
// become reachable once the resolver can read the week LEDGER (computeWeekLedger) — the
// deterministic projection of what the week's PRIOR days delivered. This helper turns
// that projection into two day-level levers the existing resolver already applies:
//   • requirement-COUNT bumps  (inject a SECOND slot today when the week still OWES a
//     weekly SET quota the per-exercise dose cannot reach in one slot/day) — gaps 1+3;
//   • effective-CAP overrides   (tighten a per-session cap to 0 on a LATER qualifying
//     day once the week's prior days already projected the quota) — gap 2.
// Pure: reads only the ledger's numbers + the focus rule. Returns inert ({} / no bump)
// when the ledger is absent or the focus has no cross-day contract → byte-identical to
// the per-day-only resolver.

/** Founder weekly SET quotas the ledger unlocks, per focus. Keyed by the per-session
 *  requirement TAG the resolver injects. `weeklySets` = the founder's ≥N sets/week;
 *  `exposureCeiling` = the max per-EXERCISE sets the carrier isolation can take (the
 *  junk-volume guard — 3 for a delt). The ledger lifts the delivered total to the quota
 *  by (a) ensuring ≥2 carrier SLOTS across the qualifying days and (b) flooring each
 *  carrier's dose toward exposureCeiling (ledgerSetFloors). Fires only at ≥4 days — at
 *  ≤3d the full-body week meets these naturally and a 2nd same-pattern slot is junk. */
const LEDGER_SET_QUOTAS = Object.freeze({
  shoulders: Object.freeze([
    { tag: 'side_delt', weeklySets: 6, exposureCeiling: 3 },
    { tag: 'rear_delt', weeklySets: 6, exposureCeiling: 3 },
  ]),
  'v-taper': Object.freeze([
    { tag: 'side_delt', weeklySets: 6, exposureCeiling: 3 },
  ]),
});

/** Sets a single direct-arm isolation (curl) exposure delivers — the per-curl dose the
 *  bi:tri parity bump uses to size how many extra curls clear the weekly floor. */
const DIRECT_ARM_ISO_DOSE = 3;

/** The ledger sub-bucket key a requirement tag maps onto (the projection's vocabulary). */
const TAG_TO_LEDGER_SUB = Object.freeze({
  side_delt: 'lateral',
  rear_delt: 'rear',
  direct_biceps: 'direct_biceps',
  direct_triceps: 'direct_triceps',
  close_grip: 'close_grip',
});

/**
 * Compute the ledger-driven contract adjustments for the day being composed.
 *
 * @param {string} focusId - FOCUS_RULES key
 * @param {string} cluster - the day's cluster id
 * @param {number} daysPerWeek - training days/week (band gate)
 * @param {import('../schedule/scheduleAdapter/weekLedger.js').WeekLedger|null|undefined} ledger
 * @returns {{ reqBumps: Map<string, number>, capOverrides: Map<string, number> }}
 *   reqBumps: tag → MINIMUM per-session count to enforce today (≥ the rule's own min);
 *   capOverrides: sessionCaps key → tightened cap value (e.g. maxCloseGrip → 0).
 */
function ledgerContractAdjust(focusId, cluster, daysPerWeek, ledger) {
  /** @type {{ reqBumps: Map<string, number>, capOverrides: Map<string, number> }} */
  const out = { reqBumps: new Map(), capOverrides: new Map() };
  if (!ledger || typeof ledger !== 'object') return out;
  if (!(Number(daysPerWeek) >= 4)) return out; // the cross-day contracts bite at ≥4 days

  // ── gap 3 (SHOULDERS / V-TAPER lateral & rear ≥6 sets/wk): when the week's PROJECTED
  // delivery for a delt sub-bucket trails the founder quota, bump TODAY's per-session
  // requirement to 2 SLOTS. A delt week has multiple DISTINCT delt isolations (lateral +
  // rear-fly + reverse-pec-deck — different movement keys), so a second slot can land
  // (unlike a duplicate same-key lateral). The slot ADD here, combined with the per-
  // exercise dose floor (ledgerSetFloors below, applied post-distribution), lifts the
  // delivered total to the quota. Only while the projection is short → never over-injects.
  const quotas = LEDGER_SET_QUOTAS[focusId] || [];
  for (const q of quotas) {
    const sub = TAG_TO_LEDGER_SUB[q.tag];
    const projectedWeekSets = ledger.weekSubSets?.[sub] || 0;
    if (projectedWeekSets < q.weeklySets && (ledger.weekSlotDays?.[sub] || 0) > 0) {
      out.reqBumps.set(q.tag, 2);
    }
  }

  // ── gap 1 (ARMS biceps ≥ 0.85×triceps over the WEEK): triceps owns the protected
  // tier-1 Close-Grip compound, so per-day parity loses. Read the delivery-aware
  // PROJECTION (weekSubSets — triceps carries the compound dose) and, when projected
  // biceps trails 0.85×triceps, inject a 2nd direct-biceps slot today (a DISTINCT curl
  // movementKey is available, so it lands). Close-grip stays protected — we ADD biceps,
  // never cut triceps.
  if (focusId === 'arms') {
    const sub = ledger.weekSubSets || {};
    const bi = sub.direct_biceps || 0;
    const tri = sub.direct_triceps || 0;
    const need = 0.85 * tri;
    // Raise the per-session direct-biceps minimum on EVERY biceps-capable day. The inject
    // loop then ADDS extra curls (a distinct movementKey) on whichever days have slot
    // HEADROOM (a dedicated pull/arms day, a full-body day) and gracefully no-ops on a
    // packed upper day — it never displaces a focus press for a MEDIUM curl. Close-grip
    // stays protected (we ADD biceps, never cut triceps). The count tops a day up by the
    // curls needed to clear the weekly parity (~3 sets/curl), capped at 3 (never curl-only).
    const isBicepsDay = cluster === 'pull' || cluster === 'upper' || cluster === 'arms'
      || cluster === 'full' || cluster === 'fullbody';
    if (tri > 0 && bi < need && isBicepsDay) {
      const extraCurls = Math.ceil((need - bi) / DIRECT_ARM_ISO_DOSE);
      out.reqBumps.set('direct_biceps', Math.min(3, 2 + extraCurls));
    }
  }

  // ── gap 2 (CHEST Close-Grip ≤4 SETS/week) + the ARMS bi:tri denominator: a close-grip
  // exposure carries ~4 sets, so the FIRST push day's exposure already projects the whole
  // 4-set quota; every SUBSEQUENT close-grip-capable day must carry ZERO close-grip.
  // Tighten maxCloseGrip → 0 once the week's PRIOR days already projected ≥4 close-grip
  // sets (the per-session maxCloseGrip:1 still holds the first day's count). On CHEST this
  // caps the weekly close-grip set total; on ARMS it thins the 2nd triceps compound so
  // delivered triceps falls toward the curl-capped biceps (closing biceps≥0.85×triceps).
  if (focusId === 'chest' || focusId === 'arms') {
    const priorCloseGripSets = ledger.priorSubSets?.close_grip || 0;
    if (priorCloseGripSets >= 4) out.capOverrides.set('maxCloseGrip', 0);
  }

  // ── gap 4 (LOWER back ≤0.65×max-lower @4d+, slot side): on a lower focus the upper/pull
  // days otherwise stack 3 back lifts (pulldown + row + pullover ≈ 8 sets/day → back ~16),
  // above the founder cap. When the week ledger projects the back over the cap, thin the
  // back lat STACK on a back-capable maintenance day to ONE lat (maxBackLatWork:1) — the
  // upper/pull days of a lower focus carry NO required back PATTERN (only a chest press),
  // so the stack thins without stranding a requirement. Paired with the BACK-BUDGET shave
  // (applyLedgerLowerBackCap) this lands delivered back ~6 ≤ 0.65×max-lower. The MEV floor
  // still guarantees back coverage (the single retained lat is the maintenance dose).
  if (focusId === 'lower') {
    const wk = ledger.weekSetsByGroup || {};
    const lowerMax = Math.max(wk.quads || 0, wk.hamstrings || 0, wk.glutes || 0);
    const back = wk.back || 0;
    const isBackCapable = cluster === 'pull' || cluster === 'upper' || cluster === 'back'
      || cluster === 'full' || cluster === 'fullbody';
    if (lowerMax > 0 && back > 0.65 * lowerMax && isBackCapable) {
      out.capOverrides.set('maxBackLatWork', 1);
    }
  }

  return out;
}

/**
 * Per-exercise SET FLOORS the week ledger requires today (gap 3): when the week's
 * projected delivery for a delt sub-bucket trails the founder quota, the carrier
 * isolation must train at its full per-exercise ceiling (not the thin 2-set default) so
 * the slots that DO exist add up to the quota. Returns a tag → minSets map the
 * distributor applies as a post-pass floor (bounded by the isolation ceiling there).
 * Empty when the ledger is absent / no delt contract / quota already met.
 *
 * @param {string} focusId
 * @param {number} daysPerWeek
 * @param {import('../schedule/scheduleAdapter/weekLedger.js').WeekLedger|null|undefined} ledger
 * @returns {Record<string, number>} sub-bucket tag → minimum per-exercise sets
 */
export function ledgerSetFloors(focusId, daysPerWeek, ledger) {
  /** @type {Record<string, number>} */
  const out = {};
  if (!ledger || typeof ledger !== 'object') return out;
  if (!(Number(daysPerWeek) >= 4)) return out;
  const quotas = LEDGER_SET_QUOTAS[focusId] || [];
  for (const q of quotas) {
    const sub = TAG_TO_LEDGER_SUB[q.tag];
    const projectedWeekSets = ledger.weekSubSets?.[sub] || 0;
    const exposureDays = ledger.weekSlotDays?.[sub] || 0;
    if (projectedWeekSets < q.weeklySets && exposureDays > 0) {
      // Floor each carrier to the dose that, summed over the week's exposure days, meets
      // the quota — capped at the per-exercise ceiling (3 for delts, junk-volume guard).
      const needPerDay = Math.ceil(q.weeklySets / exposureDays);
      out[q.tag] = Math.min(q.exposureCeiling, needPerDay);
    }
  }
  return out;
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
  // De-emphasized Big-11 RO groups (Daniel sweep review 2026-06-11). On a
  // slot-starved full-body FOCUS day a de-emphasized region (v-taper: legs) is
  // MAINTENANCE — its SURPLUS compound (a 2nd/3rd leg compound) may yield to a
  // HIGH focus requirement, keeping >=1. Empty (balanced / dedicated split with
  // room) → the displacement rule is the pre-2026-06-11 accessory-only behavior.
  const deEmph = new Set(
    Array.isArray(ctx?.deEmphasizedGroups) ? ctx.deEmphasizedGroups : [],
  );
  // Region floor for the yield region (2026-06-11 eve, 2-3-day extension): the
  // de-emphasized region keeps at least this many slots per session (1 on a
  // 1-day week, 2 at 2-3 days). Absent → 1 (the original 1-day behavior).
  const deEmphFloor = Math.max(1, Number(ctx?.deEmphRegionFloor) || 1);

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
  // CONTRACT GATE (dp_focus_contracts_v1) — the focus-contracts arc's NEW per-session
  // requirements (direct arm-work injection) + caps (shrug/close-grip/arm-OHP) are
  // honored only when ctx.contractsOn. Off → byte-identical to the pre-arc resolver.
  const contractsOn = ctx?.contractsOn === true;
  const reqs = requirementsFor(rule, cluster, ctx?.daysPerWeek, ctx?.weekClusters, contractsOn).sort(
    (a, b) => (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]),
  );

  // CROSS-DAY LEDGER ADJUSTMENTS (dp_week_ledger_v1) — when the week ledger is threaded
  // (contracts ON), translate the projection into requirement-count bumps + tightened
  // cap overrides that close the 4 GAP contracts a per-day pass cannot reach. A bump
  // RAISES an existing requirement's count (e.g. side_delt 1→2 to inject a second
  // lateral on a later shoulder day that still owes the ≥6-set quota) or ADDS the
  // requirement when the day qualifies but the rule listed none for this cluster. The
  // cap overrides tighten a per-session cap (e.g. maxCloseGrip→0 on a later push day once
  // the week's prior days projected the ≤4-set quota). Ledger absent / no contract for
  // this focus → empty maps → byte-identical to the per-day-only resolver. Bumps respect
  // the SAME inject machinery below (graceful no-op when no candidate, never displaces a
  // logged PR unless the displaceable rules allow it — identical precedence).
  const ledgerAdj = contractsOn
    ? ledgerContractAdjust(ctx?.focusId, cluster, ctx?.daysPerWeek, ctx?.weeklyLedger)
    : { reqBumps: new Map(), capOverrides: new Map() };
  if (ledgerAdj.reqBumps.size > 0) {
    for (const [tag, count] of ledgerAdj.reqBumps) {
      const existing = reqs.find((r) => r.tag === tag);
      if (existing) {
        existing.count = Math.max(existing.count, count);
      } else {
        // The day qualifies for the tag but the rule had no per-session min for this
        // cluster — add a MEDIUM/relaxable req so it yields before a HIGH width/press
        // need and never strands (the inject loop's graceful no-op still applies).
        reqs.push({ tag, count, priority: 'medium', relaxable: true });
      }
    }
    // Re-sort: a freshly-added medium req must slot into the priority order.
    reqs.sort((a, b) => (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]));
  }

  // The pool of injection candidates (already past every upstream HARD exclude),
  // not already in the session, each enriched with derived tags + a score. Ordered
  // best-first (score desc). The EQUAL-SCORE tiebreak preserves the POOL ORDER (the
  // candidate's index in ctx.pool) rather than an alphabetical name compare, so the
  // selection levers already baked into that order survive the inject step — in
  // particular the intra-week (dp_rotation_intraweek_v1) + cross-week
  // (dp_accessory_rotation_v1) accessory ROTATIONS, which reorder equal-score
  // unlogged/logged isolation siblings in the pool. With an alphabetical tiebreak a
  // REQUIRED-slot inject (e.g. the v-taper / shoulders side-delt lateral) always
  // re-picked the same name (Behind-the-Back < Cable < Machine), masking the rotation
  // on every resolver-injected slot; honoring pool order lets the rotated variant lead.
  // Deterministic (the pool order is itself deterministic) and gate-neutral: the score
  // band is unchanged, so the tag still gets a carrier — only WHICH equal-score variant
  // is injected follows the pool. ctx.poolOrder maps name → its first pool index.
  const inSession = new Set(session.map((e) => e.name));
  const inMovement = new Set(session.map((e) => mkOf(e)));
  const poolArr = Array.isArray(ctx?.pool) ? ctx.pool : [];
  /** name → first index in the pool (stable equal-score tiebreak = pool order). */
  const poolOrder = new Map();
  for (let i = 0; i < poolArr.length; i++) {
    const nm = poolArr[i] && poolArr[i].name;
    if (typeof nm === 'string' && !poolOrder.has(nm)) poolOrder.set(nm, i);
  }
  const orderOf = (name) => (poolOrder.has(name) ? poolOrder.get(name) : Number.MAX_SAFE_INTEGER);
  const candidates = poolArr
    .filter((c) => c && c.name && !inSession.has(c.name))
    .map((c) => ({
      name: c.name,
      meta: c.meta ?? getMeta(c.name),
      tags: deriveExerciseTags(c.name, c.meta ?? getMeta(c.name), movementKey),
      score: scoreOf(c.name),
    }))
    .sort((a, b) => (b.score - a.score) || (orderOf(a.name) - orderOf(b.name)));

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
        // PASS 1 — displace the lowest-value NON-PR exercise under coverage rules
        // (accessory whose group stays covered, OR a de-emphasized region's surplus
        // compound). PASS 2 (HIGH reqs only) — PR-CONTINUITY FALLBACK: a seasoned
        // user's full-body day can be 100% logged-PR lifts (his real account: all
        // 8 slots), so pass 1 finds nothing and a HIGH focus requirement used to
        // die silently. Pass 2 may displace a logged-PR victim under the SAME
        // coverage rules (Daniel sweep review 2026-06-11 — "focus dies at low freq").
        let replaceIdx = displaceableIndex(session, reqs, scoreOf, getMeta, deEmph, deEmphFloor, prNames, false);
        if (replaceIdx < 0 && req.priority === 'high') {
          replaceIdx = displaceableIndex(session, reqs, scoreOf, getMeta, deEmph, deEmphFloor, prNames, true);
        }
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
  // Iterate the UNION of the rule's static caps AND any LEDGER-injected cap key (gap 4's
  // maxBackLatWork on a lower focus is ledger-only — not a static rule cap — so it must be
  // visited here even though `caps` does not list it).
  const capKeys = new Set([...Object.keys(caps), ...ledgerAdj.capOverrides.keys()]);
  for (const capKey of capKeys) {
    const ruleCapVal = caps[capKey];
    const hasOverride = ledgerAdj.capOverrides.has(capKey);
    // CONTRACT GATE — a focus-contracts-arc cap (shrug/close-grip/arm-OHP) is applied
    // only when the flag is ON. Pre-arc caps are untouched → byte-identical when off.
    if (CONTRACT_CAP_KEYS.has(capKey) && !contractsOn) continue;
    // CROSS-DAY LEDGER override (dp_week_ledger_v1) — a tightened cap (e.g. maxCloseGrip
    // → 0 on a later push day; maxBackLatWork → 1 on a lower-focus maintenance day). Only
    // ever LOWERS (the min of the rule cap + override), so it can only prune MORE, never
    // less. A ledger-ONLY key (no static rule cap) uses the override value directly.
    const capVal = hasOverride
      ? (typeof ruleCapVal === 'number' ? Math.min(ruleCapVal, ledgerAdj.capOverrides.get(capKey)) : ledgerAdj.capOverrides.get(capKey))
      : ruleCapVal;
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

/**
 * Index of the lowest-value session entry safe to displace for a required inject,
 * or -1 if none (Daniel sweep review 2026-06-11 — unified pass 1 + PR fallback).
 *
 * A victim is eligible when ALL hold:
 *   (1) not a still-needed requirement carrier (REQUIRED coverage — never strand
 *       a movement the focus itself needs);
 *   (2) not a logged PR, UNLESS `allowPR` (pass 2, HIGH reqs only — a full-body
 *       day can be 100% PR lifts, which used to mute the focus permanently);
 *   (3) COVERAGE preserved — for a NON-yield group, its muscle_target_primary keeps
 *       >= 2 slots OR another chosen exercise lists it as a SECONDARY (the SAME rule
 *       maintenanceFloorGuarantee uses, so inject + floor never tug-of-war). For a
 *       YIELD group (`deEmph` — the collapsed leg region), coverage is REGION-level:
 *       the de-emphasized region keeps >= 1 slot after removal (region holds >= 2
 *       now), so the 2nd/3rd leg compound yields while ONE stays — a per-group check
 *       would wrongly protect a single-hams RDL even when a squat already covers legs.
 *   (4) TIER rule — an ACCESSORY (tier > 1) is displaceable; a COMPOUND anchor
 *       (tier <= 1) is PROTECTED, EXCEPT a YIELD-region compound (region-covered).
 *
 * Lowest score, then latest selection order (lowest priority) — deterministic.
 */
function displaceableIndex(session, reqs, scoreOf, getMeta, deEmph, deEmphFloor, prNames, allowPR) {
  const requiredTags = new Set(reqs.map((r) => r.tag));
  const groupCount = {};
  for (const e of session) {
    const g = getMeta(e.name)?.muscle_target_primary;
    if (g) groupCount[g] = (groupCount[g] || 0) + 1;
  }
  // Total slots across the YIELD region (the collapsed leg region) — region-level
  // coverage: the surplus leg slot yields while the region keeps >= deEmphFloor
  // (1 on a 1-day week, 2 at 2-3 days — the 2026-06-11 eve extension).
  const yieldRegionSlots = [...deEmph].reduce((n, g) => n + (groupCount[g] || 0), 0);
  const coveredBySecondary = (group, exceptName) =>
    session.some((o) => {
      if (o.name === exceptName) return false;
      const sec = getMeta(o.name)?.muscle_target_secondary;
      return Array.isArray(sec) && sec.includes(group);
    });
  const candidates = session
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => {
      if (!allowPR && prNames.has(e.name)) return false;
      if (isRequirementCarrier(e, requiredTags, session)) return false;
      const meta = getMeta(e.name) || {};
      const g = meta.muscle_target_primary;
      const inYield = !!g && deEmph.has(g);
      const covered = !g
        ? true
        : inYield
          ? yieldRegionSlots >= deEmphFloor + 1 // region keeps >= floor after removal
          : (groupCount[g] || 0) >= 2 || coveredBySecondary(g, e.name);
      if (!covered) return false; // never strand a group / region with no maintenance
      const isCompound = (meta.tier ?? 2) <= 1;
      if (!isCompound) return true; // accessory — free to displace (covered above)
      // Compound: protected, unless a de-emphasized region's SURPLUS (covered ⇒ ≥1 stays).
      return !!g && deEmph.has(g);
    })
    .sort((a, b) => (scoreOf(a.e.name) - scoreOf(b.e.name)) || (b.e.idx - a.e.idx));
  return candidates.length ? candidates[0].i : -1;
}
