# Pass 2 — Workout sub-components deep-dive (SessionTimer + RestOverlay sample)

**Pass 1 findings flagged:** F-workout-01 chrome bar TBD + F-workout-09 rest timer ring TBD
**Pass 2 verdict:** Both confirmed CRIT divergence — components LANDED but functionally incomplete vs mockup intent

---

## SessionTimer (`src/react/components/Workout/SessionTimer.tsx` — 54 LOC)

### F-pass2-sessiontimer-01 — Menu button (⋯) ENTIRELY MISSING

- **Severity:** CRIT
- **Mockup:** Chrome bar has 3-element flex: `<X close-btn><center: title+timer><⋯ menu-btn>` — menu opens workout-menu modal cu pain-button + confirm-finish-early options
- **Prod:** Chrome bar has only `<title block><X close-btn>` — NO menu button, NO menu modal
- **Mockup ref:** `andura-clasic.html:1348`
- **Prod ref:** `SessionTimer.tsx:32-52`
- **Karpathy fix:** Surgical (add menu button + connect to modal) + Think Before Coding (workout menu component must be built)
- **Fix effort:** M (new WorkoutMenu component + 2 menu items: pain trigger + finish-early confirm)
- **Beta blocker?** YES — during active session, user can't trigger pain flow OR finish-early without exit, breaking mockup UX flow

### F-pass2-sessiontimer-02 — Title shows EXERCISE name not WORKOUT name

- **Severity:** HIGH
- **Mockup:** Center label = workout name "Push · piept & umeri" (consistent context throughout session)
- **Prod:** Title = `exerciseName` prop (current exercise — changes each exercise)
- **Mockup ref:** `andura-clasic.html:1345` (`Push · piept & umeri` label fixed)
- **Prod ref:** `SessionTimer.tsx:35-37` (`{exerciseName}` dynamic)
- **Karpathy fix:** Pass workoutTitle (from PlannedWorkout) instead of exerciseName
- **Beta blocker?** YES — context confusion (each exercise change reframes screen)

### F-pass2-sessiontimer-03 — Layout 3-col vs 2-col

- **Severity:** MED
- **Mockup:** 3-column flex (left X / center info / right ⋯)
- **Prod:** 2-column flex (left info / right X)
- **Karpathy fix:** Align to 3-col w/ menu button (cumulative cu F-01)
- **Beta blocker?** Cumulative cu F-01

### F-pass2-sessiontimer-04 — Global progress bar (5/17 seturi + 2/5 exercitii + fill bar) MISSING from SessionTimer

- **Severity:** HIGH
- **Mockup:** Below chrome bar, separate `wv2-progress` block cu sets/exercise counters + progress fill bar 29%
- **Prod:** Inline "Ex N/M" în SessionTimer subtitle + no separate sets counter + no progress fill bar
- **Mockup ref:** `andura-clasic.html:1351-1358`
- **Prod ref:** `SessionTimer.tsx:38-40` (only Ex N/M)
- **Karpathy fix:** Add ProgressBar component + sets counter + visual fill
- **Beta blocker?** YES — progress visibility key UX

---

## RestOverlay (`src/react/components/Workout/RestOverlay.tsx` — 47 LOC)

### F-pass2-restoverlay-01 — SVG countdown ring ENTIRELY MISSING

- **Severity:** CRIT
- **Mockup:** SVG ring countdown cu (a) stroke circumference 188.5 (r=30) + (b) stroke-dashoffset progress + (c) 3 color states (normal #c8412e brick / warning #f5b942 amber / urgent #ff4757 red @ <10% remaining) + (d) urgent-pulse CSS animation
- **Prod:** Plain text MM:SS countdown 6xl font — NO ring, NO color states, NO animation
- **Mockup ref:** `restTimer.js:30-60+` (separate JS file controlling SVG ring) referenced in screen-workout pause overlay (line 1340+ context)
- **Prod ref:** `RestOverlay.tsx:21-46` (no SVG ring)
- **Karpathy fix:** Think Before Coding (full SVG ring component cu animated stroke-dashoffset + color state machine + pulse animation)
- **Fix effort:** M (~60 LOC new RestRing component)
- **Beta blocker?** YES — REST TIMER VISUALIZATION = signature mockup feature, central UX during workout

### F-pass2-restoverlay-02 — Background opacity divergence

- **Severity:** LOW
- **Mockup:** Pause overlay screen-level (showPauseScreen() hides workout cards below)
- **Prod:** `fixed inset-0 bg-paper/95` (95% opacity paper) — close OK
- **Karpathy fix:** N/A
- **Beta blocker?** NO

### F-pass2-restoverlay-03 — "Pauza" label only, no contextual info

- **Severity:** MED
- **Mockup:** Pause screen likely shows next-exercise context + rest reasoning ("Pauza 90 sec · biceps recovers")
- **Prod:** Only "Pauza" + countdown + "Sari pauza" button
- **Karpathy fix:** Pass next-exercise + rest-reasoning props
- **Beta blocker?** MED — context cue useful but secondary

---

## Pass 2 sample verdict

**2 sub-components audited deep:**
- SessionTimer: 4 findings (1 CRIT menu missing + 1 HIGH wrong title + 1 HIGH progress bar absent + 1 MED layout)
- RestOverlay: 3 findings (1 CRIT ring missing + 1 MED context + 1 LOW polish)

**Cumulative Pass 2 sample: 7 findings, 2 CRIT**

**Pass 2 estimate for remaining Workout sub-components:**
- SetLogInput (~80 LOC) — TBD
- SetRatingButtons (~50 LOC) — likely emoji + label fidelity findings
- ExitConfirmSheet (~40 LOC) — TBD
- InactivityPrompt (~50 LOC) — TBD

Plus Antrenor sub-components (CoachTodayCard, Calendar7Day, Phase 6 additions) + Progres sub-components (TDEEStrip, FatigueStrip, HeatMapWeekly, NutritionInline) = ~14 more sub-components × ~5-10 findings each = ~75-140 more Pass 2 findings.

**Conservative full Pass 2 estimate: ~100-150 additional findings.**

**Aggregate Pass 1 + Pass 2 projected: ~270-320 total findings full audit.**
