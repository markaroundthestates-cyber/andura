# Findings — `screen-workout` (Wave B.4)

**Mockup ref:** `04-architecture/mockups/andura-clasic.html:1340-1592` (252 lines, central session screen)
**Prod ref:** `src/react/routes/screens/antrenor/Workout.tsx:1-487` (487 lines, references 7+ sub-components)
**Audit date:** 2026-05-20

**Pass 1 scope:** architectural-level diff only. Component-level deep-dive (SessionTimer / RestOverlay / SetLogInput / SetRatingButtons / ExitConfirmSheet / AaFrictionModal / InactivityPrompt) DEFERRED to Pass 2.

## Architectural findings

### F-workout-01 — Chrome bar structure DIVERGENT

- **Severity:** HIGH
- **Category:** Component
- **Mockup chrome:** `<X close-btn><center: label + timer><⋯ menu-btn>` — minimal top bar
- **Prod:** Uses `<SessionTimer />` component — needs Pass 2 inspect to verify chrome structure (X + title + timer + menu) matches mockup wv2-chrome class
- **Mockup ref:** `andura-clasic.html:1341-1349`
- **Prod ref:** `Workout.tsx:36` (imports SessionTimer)
- **Karpathy fix:** Pass 2 SessionTimer component verify
- **Beta blocker?** TBD Pass 2

### F-workout-02 — Global progress bar (5/17 seturi + 2/5 exercitii) — verify Pass 2

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** Sub-bar cu meta "X/Y seturi · A/B exercitii" + progress fill bar 29%
- **Prod:** TBD Pass 2 verify — likely în SessionTimer or sub-section
- **Mockup ref:** `andura-clasic.html:1351-1358`
- **Prod ref:** `Workout.tsx` (need full read to confirm)
- **Beta blocker?** TBD

### F-workout-03 — Exercise actions "Aparat ocupat" + "Nu vreau" verify Pass 2

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** 2-button row top of exercise (Daniel 2026-05-12 Slice 1.7): users icon "Aparat ocupat" + hand icon "Nu vreau" — substitution affordances
- **Prod:** TBD Pass 2 (may be inline OR în SetLogInput component)
- **Mockup ref:** `andura-clasic.html:1372-1375`
- **Karpathy:** Daniel reglaj LANDED în mockup — needs prod confirmation
- **Beta blocker?** TBD

### F-workout-04 — Target simple zone vs Post-log zone state machine

- **Severity:** HIGH
- **Category:** Behavior + Component
- **Mockup:** Simplified 2026-05-12 Daniel directive — only "Tinta" reps × kg + "Logheaza setul" CTA initially; everything else (rating / continua) hidden until post-log
- **Prod:** State machine via `phase: 'logging' | 'rating' | 'rest' | 'transition' | 'idle'` — likely matches concept but verify per-phase UI alignment cu mockup wv2-target-simple + wv2-postlog blocks
- **Mockup ref:** `andura-clasic.html:1377-1400`
- **Prod ref:** `Workout.tsx:60` (uses phase from store)
- **Karpathy fix:** Pass 2 per-phase UI verify
- **Beta blocker?** TBD

### F-workout-05 — Why exercise button MISSING — verify Pass 2

- **Severity:** MED
- **Category:** Component
- **Mockup:** Help-circle button next to exercise name `openWhyExercise()` — coach explainer modal
- **Prod:** TBD Pass 2
- **Mockup ref:** `andura-clasic.html:1364`
- **Beta blocker?** TBD

### F-workout-06 — Marius-only tempo prescription cue (Lora italic) verify Pass 2

- **Severity:** MED
- **Category:** Component
- **Mockup:** `wv2-marius-only` block cu "Cobori 3 sec · pauza 1 sec jos · explozie sus" — persona-aware tempo cue
- **Prod:** TBD Pass 2 (likely persona-conditional render somewhere)
- **Mockup ref:** `andura-clasic.html:1393`
- **Beta blocker?** TBD

### F-workout-07 — Inline rating row (🟢🟡🔴 emoji) verify Pass 2

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** Post-log rating row 3-button cu emoji dots (🟢🟡🔴) + labels Usor/Potrivit/Greu
- **Prod:** Uses `<SetRatingButtons />` component — Pass 2 verify emoji presence + labels
- **Mockup ref:** `andura-clasic.html:1394-1398`
- **Prod ref:** `Workout.tsx:39`
- **Beta blocker?** TBD

### F-workout-08 — Workout menu modal options verify Pass 2

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** `⋯ menu` opens modal cu options (pain-button / confirm-finish-early per mockup goto refs at lines 1553+ 1562+)
- **Prod:** TBD Pass 2 — likely in workout chrome menu
- **Beta blocker?** TBD

### F-workout-09 — Rest timer ring + countdown verify Pass 2

- **Severity:** CRIT (mockup has restTimer.js logic — core UX)
- **Category:** Component
- **Mockup:** SVG ring countdown cu color states (normal #c8412e / warning #f5b942 / urgent #ff4757) + pulse animation last 10%
- **Prod:** Uses `<RestOverlay />` component — Pass 2 verify ring + countdown + colors
- **Mockup ref:** Referenced via `restTimer.js` external file (lines 30-60+ pe restTimer.js)
- **Beta blocker?** YES — central rest timer UX

### F-workout-10 — Inactivity prompt cross-screen wired prod ✓

- **Severity:** OK
- **Mockup:** wv2 verbatim L4401 INACTIVITY_THRESHOLD 7 min + check interval 30s
- **Prod:** `Workout.tsx:47-48` constants match exactly cu mockup wv2 verbatim comment
- **Karpathy:** Surgical preserved Daniel reglaj
- **Beta blocker?** N/A — compliance

### F-workout-11 — AaFrictionModal (LOCK 9 Aggressive Loading) wired prod ✓

- **Severity:** OK
- **Mockup:** LOCK 9 Aggressive Loading detection sub-flow
- **Prod:** `Workout.tsx:41-43` imports AaFrictionModal + detectAggressiveLoad — wire present
- **Karpathy:** D-LEGACY engine LANDED
- **Beta blocker?** N/A

**Total: 11 findings on Workout (most TBD Pass 2). Parity estimate: 55% Pass-1 architectural-only.**

**Note:** Workout is highest-complexity screen în app (487 LOC + 7 sub-components vs 252 LOC mockup). Full parity verification requires Pass 2 sub-component-by-sub-component audit:
- `components/Workout/SessionTimer.tsx` — chrome bar verify
- `components/Workout/RestOverlay.tsx` — rest ring + countdown + colors
- `components/Workout/SetLogInput.tsx` — Tinta + Logheaza state machine
- `components/Workout/SetRatingButtons.tsx` — emoji + labels
- `components/Workout/ExitConfirmSheet.tsx` — confirm exit flow
- `components/Workout/InactivityPrompt.tsx` — inactivity dialog
- `components/AaFrictionModal.tsx` — LOCK 9 friction sub-flow

Pass 2 estimated: ~2h dedicated Workout sub-component audit.
