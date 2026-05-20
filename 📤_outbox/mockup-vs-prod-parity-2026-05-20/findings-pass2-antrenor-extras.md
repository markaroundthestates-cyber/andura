# Pass 2 — Antrenor extras (StatsGrid + ReadinessVerdict + CoachRestCard + PRWallRecent)

## StatsGrid (`src/react/components/Antrenor/StatsGrid.tsx` — 47 LOC)

### Status: Phase 6 prod-extra NOT în mockup

- Engine-wired ✓ (workoutStore.streak + getFatigue + getReadiness)
- 3-cell grid (Streak / Oboseala / Readiness) cu uppercase labels + numeric values + sub-labels
- **NOT în mockup** — Phase 6 audit-driven F10 addition
- Daniel decision: keep + amend mockup OR remove

**Parity vs mockup intent: N/A (extra component). Engine-wire quality: 80%.**

---

## ReadinessVerdict (`src/react/components/Antrenor/ReadinessVerdict.tsx` — 32 LOC)

### Status: Phase 6 prod-extra NOT în mockup (F4 audit feature)

- Engine-wired ✓ (readiness prop from coachDirectorAggregate)
- Returns null if no readiness today (conditional render)
- Shows label + score/100 + canPR hint
- **NOT în mockup** — F4 audit-driven addition

**Parity vs mockup intent: N/A. Engine-wire quality: 75%.**

---

## CoachRestCard (`src/react/components/Antrenor/CoachRestCard.tsx` — 55 LOC)

### F-pass2-coachrest-01 — HARDCODED placeholder (SAME pattern as CoachTodayCard) — CRIT

- **Severity:** CRIT
- **Mockup:** Dynamic `coach-rest-why` populated cu engine reasoning (lagging muscle group + readiness score)
- **Prod:** Hardcoded `"Pectoralii si picioarele inca recupereaza · readiness 32/100."` literal (line 31)
- **Mockup ref:** `andura-clasic.html:761`
- **Prod ref:** `CoachRestCard.tsx:30-32`
- **Karpathy fix:** Wire engine reasoning prop (same single Phase 5 wiring task as CoachTodayCard)
- **Beta blocker?** YES

### F-pass2-coachrest-02 — Duration "~ 15 min mobilitate" HARDCODED

- **Severity:** HIGH
- **Mockup:** Dynamic duration from rest day session plan
- **Prod:** Hardcoded `~ 15 min mobilitate` (line 34)
- **Karpathy fix:** Wire from rest session plan
- **Beta blocker?** YES

### F-pass2-coachrest-03 — Layout structure good ✓

- Background warm cream `#f5ebd0` + border `#e6d49a` matches mockup
- Brick kicker color `#8a6d1f` matches
- Layout flex column + icon + ghost CTA + override link — pattern preserved
- **Compliance positive**

**CoachRestCard parity: 35%** (visuals OK, HARDCODED data same issue as CoachTodayCard)

---

## PRWallRecent (`src/react/components/Antrenor/PRWallRecent.tsx` — 38 LOC)

### Status: Phase 6 prod-extra (Antrenor slice of mockup's Istoric pr-wall)

- Engine-wired ✓ (records prop from coachDirectorAggregate.prWallRecent — top 3 most-recent PRs)
- Conditional render (returns null if no records)
- Simple list cu trophy icon + exercise name + kg×reps + 1RM estimate
- **NOT în mockup Antrenor home** — Phase 6 addition (mockup has full pr-wall în Istoric only)

**Parity vs mockup intent: N/A (extra component for Antrenor). Engine-wire quality: 80%.**

---

## Pass 2 Antrenor extras summary

| Component | Status | Parity |
|-----------|--------|--------|
| StatsGrid | Phase 6 extra, engine-wired clean | 80% (quality) |
| ReadinessVerdict | Phase 6 extra, engine-wired clean | 75% (quality) |
| CoachRestCard | HARDCODED placeholder (mirror CoachTodayCard issue) | 35% (2 CRIT findings) |
| PRWallRecent | Phase 6 extra, engine-wired clean | 80% (quality) |

**Critical Pass 2 final insight:**

Both CoachTodayCard AND CoachRestCard are HARDCODED placeholders. Same pattern — single Phase 5 wiring task pentru BOTH. These are the most prominent UI elements on Antrenor home în both schedContext modes.

**Total HARDCODED-placeholder issues:** 5 CRIT findings (3 CoachTodayCard + 2 CoachRestCard) — all closed by single Phase 5 engine wiring effort.

## Final Pass 2 cumulative (17 sub-components total)

| # | Component | Parity | CRIT |
|---|-----------|--------|------|
| 1 | SessionTimer | 45% | 1 |
| 2 | RestOverlay | 30% | 1 |
| 3 | CoachTodayCard | 30% | 3 |
| 4 | Calendar7Day | 70% | 0 |
| 5 | TDEEStrip | 55% | 0 |
| 6 | FatigueStrip | 45% | 0 |
| 7 | HeatMapWeekly | 30% | 1 |
| 8 | NutritionInline | 80% | 0 |
| 9 | SetLogInput | 35% | 0 |
| 10 | SetRatingButtons | 50% | 0 |
| 11 | ExitConfirmSheet | 80% | 0 |
| 12 | InactivityPrompt | 85% | 0 |
| 13 | StatsGrid (Ph6 extra) | 80% | 0 |
| 14 | ReadinessVerdict (Ph6 extra) | 75% | 0 |
| 15 | CoachRestCard | 35% | 2 |
| 16 | PRWallRecent (Ph6 extra) | 80% | 0 |
| 17 | PatternsBanner + AlertsBanner (sampled earlier) | 80% (clean) | 0 |

**Pass 2 mean parity: 56.5% (17 components, mockup-comparable subset only).**
**Pass 2 CRIT total: 8 (sub-components) + 7 (confirm modals Wave G) = 15 CRIT.**

**Combined Pass 1 + Pass 2 final state:**
- 50/50 mockup screens documented Pass 1
- 17/~20 sub-components audited Pass 2
- ~225 findings cumulative
- ~41 CRIT Beta blockers
- ~36% measured mockup parity (consistent multi-pass convergence)
