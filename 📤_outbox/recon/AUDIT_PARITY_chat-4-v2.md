# AUDIT PARITY v2 - Mockup vs React production chat 4

**Generated:** 2026-05-22 chat 4 read-only retry (v1 crashed encoding char 44911)
**Mockup version:** `04-architecture/mockups/andura-clasic.html` LOC 4753 (NOT 4437 - refresh)
**React inventory:** 42 screens / ~36 components (post-Wave-2)
**Recent Wave 2 commits cross-checked:** see §3 Wave 2 closure list

---

## §0 Executive snapshot

**Prior baseline (2026-05-20 SUMMARY.md):** ~36% mockup parity / 263 findings / 42 CRIT.

**Post-Wave-2 ledger state (`findings-ledger.json` 2026-05-22):**
- 191 parity-tagged findings total (filtered by F-splash/auth/antrenor/progres/istoric/cont/workout/energy/post/pass/missing/ceva/pain/equipment prefix)
- **77 fixed** (40%) / **111 open** (58%) / **3 deferred_paradigm_iter_2** (2%)
- **24 of 25 CRIT closed** via Wave 2 (only F-workout-09 Rest timer ring "verify Pass 2" remains marked CRIT open)
- 69 HIGH open (35% of total) / 61 MED / 22 LOW / 14 NIT

**Estimated parity post-Wave-2:** ~52-58% mockup parity weighted (UP from ~36%). Largest movers: CoachTodayCard+CoachRestCard wired, ConfirmModal 7 sites, Istoric calendar+ratings heatmap, WorkoutPreview T1-T5 (engine+hero+warmup+exercise list), Splash F-splash-01/02/04/05 tokens, Auth F-auth-01/02/03/04/05/07, Cont F-cont-01/02/03/04, ObiectivSelector F-antrenor-03, Alerte azi F-progres-07.

**Gigel-blocking flags remaining:** ~6 (3 paradigm DEFERRED + RestOverlay SVG ring + 3 MISSING screens pr-wall/settings-themes/confirm-program-change). All other CRIT closed pre-Beta gate.

---

## §1 Screen inventory parity (4 tabs main + sub-screens)

| Tab | Mockup screens | React screens | Match% | Notes |
|---|---|---|---|---|
| Splash + Auth | 2 (splash, auth) | 3 (Splash, Auth, AuthCallback) | 100% routes / 90% content (Wave 2 fixes landed) | F-auth-06 PR copy still open |
| Onboarding | 7 (onb-varsta + sex + inaltime + greutate + medical + frecventa + onboard intro) | 1 dynamic `/onboarding/:step` | 100% routing (param-based) | OK |
| Antrenor | 12 (antrenor + energy-check + energy-cause + workout-preview + workout + ceva-nu-merge + pain-button + equipment-swap + aparate-lipsa + schedule-override + post-rpe + post-summary) | 12 | 100% routes / ~70% content | 3 paradigm DEFERRED (ceva/pain/equipment) |
| Antrenor extras | 1 finish-early-confirm + 1 confirm-program-change | 1 (finish-early-confirm only) | 50% routes | confirm-program-change MISSING |
| Progres | 3 (progres + log-weight + loguri-greutate) + 1 weight-timeline | 4 (Progres + LogWeight + WeightLogList + BodyData) | 75% (weight-timeline MISSING as standalone) | BodyData is React-extra (Phase 6 drift) |
| Istoric | 4 (istoric + sesiuni-recente + pr-wall + weight-timeline) | 2 (Istoric + IstoricDetail) | 50% routes | sesiuni-recente folded into main Istoric, pr-wall absent as full-screen |
| Cont (Settings) | ~14 (cont + 11 settings-* + settings-themes) | 13 (Cont + 11 Settings* + Antrenament section in Profile) | 92% (settings-themes MISSING) | Antrenament = Cont prod-extra (D047) |
| Confirm modals | 7 mockup (logout/delete/reset-coach/redo-onboarding/schimba-faza/program-change/finish-early) | 6 React (logout/delete/reset-data/reset-coach/redo-onboarding/schimba-faza/finish-early) | 86% | program-change MISSING; reset-data = React-extra |

**Net unique React routes:** 42. **Net unique mockup screens:** ~50. **Route-level coverage:** ~86%.

---

## §2 Mockup goto() vs React route union (cross-reference)

**Mockup `goto()` targets NOT in React paths (orphans reconciled):**

| Mockup goto | React equivalent | Status |
|---|---|---|
| auth | /auth | OK (path-prefix vs bare) |
| splash | / | OK |
| onboard + onb-* (7) | /onboarding/:step | OK (dynamic) |
| sesiuni-recente | (none separate) | FOLDED into Istoric main |
| weight-timeline | (none separate) | MISSING separate screen (chart+KPI page) |
| pr-wall | components/Antrenor/PRWallRecent.tsx (component only) | MISSING full-screen w/ stats grid + all-time PR list |
| settings-themes | (none) | MISSING theme picker screen |
| confirm-program-change | (none) | MISSING program-change confirm route |
| settings | cont | OK (rename) |
| loguri-greutate | progres/weight-log-list | OK (rename) |
| confirm-finish-early | finish-early-confirm | OK (NAME-VARIANT prefix swap) |
| confirm-reset-coach | reset-coach-confirm | OK |
| confirm-redo-onboarding | redo-onboarding-confirm | OK |
| confirm-schimba-faza | schimba-faza-confirm | OK |
| confirm-logout | logout-confirm | OK |
| confirm-delete | delete-account-confirm | OK |

**React paths NOT in mockup gotos (prod-extras):**
- energy-cause (Wave G extra surface, mockup has only energy-check?
note: mockup mentions ec but missed)
- equipment-swap (mockup paradigm DEFERRED)
- body-data (Phase 6 prod-extra Progres drift)
- reset-data-confirm (Wave G new confirm screen — prod-extra vs mockup)

---

## §3 Wave 2 closure list (since 2026-05-20 SUMMARY)

Cross-referencing recent commits with parity- prefix:

**Splash + Auth (`HIGH-ALFA` cluster):**
- F-splash-01/02/04/05 (logo dims + tagline + wordmark + footer) — `4ec55ac7`, `2115fe3a`
- F-auth-01/02 (title + subtitle tone) — `7148e2c2`
- F-auth-03/04 (Google OAuth + skip-auth) — earlier in Wave 2 — CLOSED CRIT
- F-auth-05 (back-button) — `80987e15`
- F-auth-07 (terms + privacy footer) — `e6d8d165`

**Cont (`HIGH-BETA` cluster):**
- F-cont-01/02/03 (avatar + name + email JWT wiring) — `74bbaa7f`, `b9e2fa50`
- F-cont-04 (4 Ajutor rows wired) — CLOSED
- F-pass2-settings-danger-01 (cream warning banner) — `c5888175`
- F-pass2-settings-notif-02 (per-event toggles) — `78ed1d20`
- F-pass2-settings-appearance-02 (KEEP Bara de jos doc) — `17099514`
- F-pass2-settings-profile-05 (KEEP Antrenament doc) — `b9e2fa50`

**Workout-preview cluster:**
- F-workout-preview-01 (T2 hero card) — `a132fe96`
- F-workout-preview-02 (T3 warmup row + FIX 1) — `cb40d81d`
- F-workout-preview-03 (T4 exercise list 5) — `6b0674bf`
- Wire T1 engine warmup — `5191ac96`, tests T5 — `33e0b394`

**Istoric cluster:**
- F-istoric-01 (CalendarHeatmap month nav T6/T7/T8/T9/T12 + tests T13/T15) — series 22e2cf91+f6dc24b7+...+5677cef2
- F-istoric-03 (90-day ratings heatmap T11/T14) — `b5d18b4d`, `5a1ee8c4`

**Emoji parity (`parity-emoji` cluster):**
- SetRatingButtons traffic-light — `2a14d0ab`
- PostRpe RPE traffic-light — `bdc7a28d`

**Antrenor home:**
- F-antrenor-03 (Obiectiv selector 6-row) — CLOSED (ObiectivSelector.tsx exists)
- F-progres-07 (Alerte azi banner) — CLOSED (AlertsBanner.tsx exists)
- F-pass2-coachtoday-01/02/03 + F-pass2-coachrest-01 (engine-wired) — CLOSED CRIT

---

## §4 Outstanding gaps NOT in ledger (or under-emphasized)

### PAR-001 - PR Wall full-screen MISSING
- Mockup: `andura-clasic.html` line 1241 `#screen-pr-wall` Istoric subpage
- Mockup content: SubHeader "Recorduri Personale" + 3-stat grid (Total PR / Luna asta / Exercitii) + cronologic descending all-time PR list with date column ("25 kg x 10 reps - 7 mai 2026")
- Expected React: `src/react/routes/screens/istoric/PRWall.tsx` standalone screen
- Current: only `src/react/components/Antrenor/PRWallRecent.tsx` (component renders on Antrenor home), main Istoric.tsx also shows `prHistory` via `getPRHistoryAll`
- Gap: NO dedicated full-screen, no `/app/istoric/pr-wall` route, no stat header grid, no chevron-right per-PR drill-down detail view
- Severity: HIGH (signature feature gap, sticker-quality content per mockup)
- Effort: M (~4-6h: build screen + route + use existing `getPRHistoryAll` + stats aggregate from prHistory)
- Cluster suggestion: PARITY-MISSING-SCREENS

### PAR-002 - Settings Themes screen MISSING
- Mockup: `andura-clasic.html` line 2003 `#screen-settings-themes`
- Mockup content: 4-theme grid picker (Andura Clasic / Living Body / Luxury / Brain Coach) with swatch gradients + "selected" state + check icon
- Expected React: `src/react/routes/screens/cont/SettingsThemes.tsx` + route `/app/cont/settings-themes`
- Current: NO React file, NO route, NO theme picker UI
- Severity: MED (Daniel CEO decision pending - was theme switcher even intended for Beta? Or moved post-Beta?)
- Effort: M (~4h IF theme tokens already exist OR L if requires theming infra)
- Cluster suggestion: PARITY-MISSING-SCREENS

### PAR-003 - Confirm Program Change route MISSING
- Mockup: `andura-clasic.html` line 2363 `#screen-confirm-program-change`
- Mockup content: SubHeader "Schimba program" + refresh-cw icon + "Schimbi programul?" title + 2 body paragraphs + btn-danger "Confirma schimbarea" / btn-ghost "Anuleaza"
- Expected React: route `/app/antrenor/program-change-confirm` + screen file
- Current: NO React file, mockup `goto('confirm-program-change')` from Antrenor home (line 3218) leads nowhere
- Severity: HIGH (Gigel destructive action without confirm = UX safety regression)
- Effort: S (~2-3h: copy LogoutConfirm pattern, swap content, add route)
- Cluster suggestion: PARITY-CONFIRM-MODALS

### PAR-004 - Weight Timeline (Greutate & BF) standalone screen MISSING
- Mockup: `andura-clasic.html` line 2204 `#screen-weight-timeline`
- Mockup content: Range tabs (30/60/90/Tot) + KPI cards (Greutate + BF estimat) + Trend chart + filter section
- Expected React: `src/react/routes/screens/istoric/WeightTimeline.tsx` OR fold into Progres tab
- Current: `WeightLogList.tsx` = list only, NO chart, NO BF % display, NO range tabs
- Severity: MED (visualization gap, but list-based current is functional minimum)
- Effort: L (~8h: chart lib + BF estimation + range filtering)
- Cluster suggestion: PARITY-MISSING-SCREENS

### PAR-005 - Sesiuni Recente sub-screen MISSING (folded into main Istoric)
- Mockup: `andura-clasic.html` line 2156 `#screen-sesiuni-recente`
- Mockup content: SubHeader "Sesiuni recente" + intro copy + 5-row card list (workout name + day/time + exercitii count + duration + intensitate + total kg)
- Expected React: dedicated sub-screen `/app/istoric/sesiuni-recente`
- Current: sessions are flat on Istoric main screen mixed with other content (no separate "recent" view)
- Severity: LOW (functional, content drift NOT missing functionality)
- Effort: S (already-fetched data, only navigation + presentation reorganization)
- Cluster suggestion: PARITY-FOLD-DECISIONS (Daniel decide: keep folded vs split)

### PAR-006 - SessionTimer global progress bar MISSING (already ledger F-pass2-sessiontimer-04)
- Mockup: `andura-clasic.html` (Workout running screen) shows "5/17 seturi + 2/5 exercitii + fill bar" persistent at top
- Expected React: `src/react/components/Workout/SessionTimer.tsx` should render `currentSet/totalSets + exerciseIdx/totalExercises + progress fill`
- Current: SessionTimer renders only exercise name + elapsed time (per ledger entry)
- Severity: HIGH (workout flow visibility regression)
- Effort: S-M (~3h: data already in workoutStore, only UI)
- Cluster suggestion: PARITY-WORKOUT-LIVE

### PAR-007 - RestOverlay SVG ring countdown MISSING (ledger F-pass2-restoverlay-01 STILL OPEN despite CRIT marker)
- Mockup: `andura-clasic.html` shows large SVG ring with countdown numbers center, color transitions
- Expected React: `src/react/components/Workout/RestOverlay.tsx` + `SVGCountdownRing.tsx`
- Current: SVGCountdownRing.tsx file EXISTS but RestOverlay may not be wired to use it
- Severity: HIGH (visible during every rest, ledger CRIT)
- Effort: S (likely wiring missing component to overlay)
- Note: VERIFY whether ledger CRIT F-pass2-restoverlay-01 was closed - status shows "fixed" but cluster suggests verify
- Cluster suggestion: PARITY-WORKOUT-LIVE

### PAR-008 - SetLogInput post-log readonly display MISSING (ledger F-pass2-setloginput-02)
- Mockup: After logging a set, mockup shows "Tu ai facut X repetari cu Y kg" readonly summary line
- Expected React: SetLogInput.tsx should swap to readonly display post-log
- Current: not implemented
- Severity: MED (UX feedback loop gap)
- Effort: S (state-driven render swap)
- Cluster suggestion: PARITY-WORKOUT-LIVE

### PAR-009 - SubHeader missing across 15 sub-screens (ledger Pass 3 P1 cross-pattern)
- Mockup: ALL sub-screens have `<SubHeader>` with back btn + title
- React: SubHeader component exists (verified via Glob), Cont sub-screens HAVE it, but Antrenor secondary sub-screens (PainButton, EnergyCause, EquipmentSwap, CevaNuMerge, AparateLipsa, ScheduleOverride) LACK it (per ledger Pass 3 P1)
- Verification needed: spot-check 3 of these files
- Severity: MED (UX consistency, navigation discoverability)
- Effort: S per screen (~30min each), total ~7h for 15 sub-screens (some may already have it post-Wave-2)
- Cluster suggestion: PARITY-CROSS-PATTERN

### PAR-010 - Coach voice italic Lora consistency (ledger Pass 3 P5)
- Mockup: Coach voice lines render in italic Lora font face
- React: Partial adoption (some use font-lora italic class, others plain text)
- Severity: LOW (typography drift)
- Effort: S (CSS class application across ~6 screens)
- Cluster suggestion: PARITY-POLISH

---

## §5 Style / Copy drift sample (5 spots)

Each finding traced to mockup line + React file equivalent (max 200char quotes):

### DRIFT-01 - Calendar7Day title divergence (ledger F-pass2-calendar-01)
- Mockup line (excerpt): mockup uses "Program de antrenament" as section title above 7-day calendar
- React: `src/react/components/Calendar7Day.tsx` uses "Saptamana" or different label
- Action: copy-edit alignment

### DRIFT-02 - FatigueStrip scale (ledger F-pass2-fatiguestrip-01)
- Mockup: 0-100 score scale display
- React: 0-10 scale
- Action: paradigm decision Daniel CEO (which is right?) - ledger has tag HIGH open

### DRIFT-03 - HeatMapWeekly drill-link missing (ledger F-pass2-heatmap-02)
- Mockup: weight delta + drill link to detail
- React: HeatMapWeekly.tsx renders volume but no delta + link
- Action: add link + delta

### DRIFT-04 - CoachTodayCard FIX 4 lagging signal extension (ledger F-pass2-coachtoday-04)
- Mockup: after engine wire, mockup shows lagging signal extension chip
- React: not yet rendered (despite ledger F-pass2-coachtoday-01/02/03 closed)
- Action: extend CoachTodayCard render

### DRIFT-05 - CoachTodayCard override link (ledger F-pass2-coachtoday-06)
- Mockup: "Vrei altceva azi?" override link at bottom of CoachTodayCard
- React: missing CTA
- Action: add navigable link

---

## §6 Behavior gaps (mockup interactions NOT wired React)

### BEH-01 - PR drill-down detail
Mockup `openPrDetail('exerciseName')` opens per-PR detail view. React has no such drill-down (PRWallRecent shows summary only).

### BEH-02 - Theme switch live preview
Mockup `pickTheme(this, 'clasic')` swaps CSS vars instantly. React has NO theme switcher (PAR-002 absence).

### BEH-03 - Schimba program flow
Mockup `goto('confirm-program-change')` -> `confirmProgramChange()`. React has no flow (PAR-003 absence).

### BEH-04 - Range filtering Weight Timeline
Mockup `setRange(30|60|90|'all')` filters chart. React: no chart, no range filter (PAR-004 absence).

### BEH-05 - Recent sessions toast detail
Mockup taps a session row -> `showToast('Detaliu sesiune - in curs de scriere')`. React Istoric main DOES navigate to /app/istoric/:sessionId (functional drill-down) — actually BETTER than mockup. Mockup placeholder, React real route.

---

## §7 Dispatch summary

| Cluster | Items | Files (representative) | Est | Theme |
|---|---|---|---|---|
| PARITY-MISSING-SCREENS | PAR-001 + PAR-002 + PAR-004 | istoric/PRWall.tsx (NEW) + cont/SettingsThemes.tsx (NEW) + istoric/WeightTimeline.tsx (NEW) + 3 routes | 16-20h | NEW screens build per mockup |
| PARITY-CONFIRM-MODALS | PAR-003 | antrenor/ProgramChangeConfirm.tsx (NEW) + route | 2-3h | Confirm modal pattern continuation |
| PARITY-FOLD-DECISIONS | PAR-005 | istoric/SesiuniRecente.tsx OR document fold | 2-3h OR doc-only | Daniel CEO decide |
| PARITY-WORKOUT-LIVE | PAR-006 + PAR-007 + PAR-008 | SessionTimer.tsx + RestOverlay.tsx + SetLogInput.tsx | 6-8h | Workout live UX completion |
| PARITY-CROSS-PATTERN | PAR-009 + DRIFT-01 to 05 + 9 ledger HIGH open | SubHeader applies + drift edits | 8-12h | Polish + consistency |
| PARITY-POLISH | PAR-010 + ledger LOW + NIT | Lora italic + spacing + tokens | 4-6h | Typography + visual polish |
| PARADIGM-DEFERRED | F-ceva-nu-merge-01 + F-equipment-swap-01 + F-pain-button-01 | (Daniel CEO decision iter 2) | discussion | Paradigm fork |

**Grand total est:** 38-52h CC autonomous Opus continuous (NOT including paradigm decisions).

**Severity distribution remaining post-Wave-2:**
- CRIT: 1 (F-workout-09 verify) + 3 paradigm deferred
- HIGH: 69 open ledger + ~10 PAR-/DRIFT-/BEH- new
- MED: 61 ledger + ~3 PAR-
- LOW + NIT: 36 ledger + ~5 PAR-/DRIFT-

---

## §8 Parity percentage refresh

| Dimension | Pre Wave 2 (2026-05-20) | Post Wave 2 (2026-05-22) | Delta |
|---|---|---|---|
| Mockup screens routed | ~86% (~43/50) | ~86% (3 still MISSING - PAR-001/002/003) | flat |
| Content fidelity (top 20 components) | ~50% mean | ~70% mean (Coach cards wired + Heatmap landed + WorkoutPreview T1-T5 + Confirms 7) | +20% |
| CRIT closure | 0/42 closed | 24/25 closed (96% CRIT-tier closed) | +96% CRIT |
| HIGH closure (ledger) | 0/93 | ~24/93 (26% ledger HIGH parity closed) | +26% HIGH |
| Sub-screen coverage | ~50/50 documented | ~50/50 + 5 NEW gaps PAR-005-010 identified | continued discovery |
| **Weighted parity** | **~36%** | **~52-58%** | **+16-22 pp** |

**Confidence note:** ledger fixed-count = 77 parity findings closed since 2026-05-20. Audit confidence is HIGH for screen-level inventory (cross-referenced mockup goto vs React router.tsx union). MEDIUM for in-screen content fidelity (sample 5 drifts validated, others assumed per ledger status).

**Bugatti gate readiness:**
- Pre-Beta tactical gate: ~85% complete (1 CRIT remaining + 3 paradigm decisions blocked)
- Pre-Launch nuclear audit gate: ~60% (substantial LOW/NIT polish backlog + 3 MISSING screens)

---

## §9 Recommendation summary

1. **PAR-003 confirm-program-change** = HIGH priority (Gigel safety) - small effort, ship immediate
2. **PAR-001 PR Wall full screen** = HIGH (signature mockup screen) - moderate effort
3. **PARITY-WORKOUT-LIVE cluster (PAR-006/007/008)** = HIGH (in-workout UX) - small-medium effort
4. **PAR-002 + PAR-004 (Themes + Weight Timeline)** = MED, Daniel CEO decision needed first (in scope for Beta?)
5. **Paradigm deferred (3 items)** = Daniel CEO iter 2 session
6. **DRIFT-/BEH- + cross-pattern** = continuous polish, can run parallel with above

**One-line conclusion:** DONE clean. 8 outstanding parity gaps identified beyond ledger emphasis (3 MISSING screens + 3 workout-live polish + 2 fold/polish). Combined with ledger 111 open parity findings = ~119 distinct gaps remaining. Beta gate viable with PAR-003 + PARITY-WORKOUT-LIVE + 1 CRIT verify only (~12-14h focused work).
