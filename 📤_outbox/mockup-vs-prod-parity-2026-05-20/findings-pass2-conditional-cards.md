# Pass 2 — Conditional cards (Reactivate + Resume + AaFriction)

## ReactivateCard (`src/react/components/Antrenor/ReactivateCard.tsx` — 47 LOC)

### F-pass2-reactivate-01 — Hand icon brick MISSING

- **Severity:** MED
- **Mockup:** Brick hand icon 20x20 + "Bun venit inapoi" title (visual warmth)
- **Prod:** Title only, no icon
- **Mockup ref:** `andura-clasic.html:813-815`
- **Prod ref:** `ReactivateCard.tsx:22-24`
- **Fix:** Surgical (add Hand from lucide-react)
- **Beta blocker?** NO (Wave 2)

### F-pass2-reactivate-02 — Border color divergence (brick vs line)

- **Severity:** LOW
- **Mockup:** White bg + brick border `var(--line-strong)` (warm accent)
- **Prod:** `bg-paper border border-line` (cool default)
- **Fix:** Surgical (border-brick OR keep)
- **Beta blocker?** NO (Wave 3)

### Compliance positive
- Dynamic daysAgo calculation ✓
- 2 buttons (Incep usor / Mai tarziu) text matches mockup ✓
- Conditional render via parent (>14 zile + NOT dismissed) ✓

**ReactivateCard parity: 70%**

---

## ResumeSessionCard (`src/react/components/Antrenor/ResumeSessionCard.tsx` — 56 LOC)

### F-pass2-resume-01 — Play-circle icon MISSING

- **Severity:** MED
- **Mockup:** Brick play-circle icon 24x24 left of content (visual call-to-action)
- **Prod:** No icon, just text content
- **Mockup ref:** `andura-clasic.html:796`
- **Prod ref:** `ResumeSessionCard.tsx:23-31`
- **Fix:** Surgical (add PlayCircle from lucide-react)
- **Beta blocker?** NO (Wave 2)

### F-pass2-resume-02 — Background color divergence (cream warm vs paper2)

- **Severity:** LOW
- **Mockup:** Background `#fdf6e8` (warm cream, urgent-friendly)
- **Prod:** `bg-paper2` (default neutral)
- **Beta blocker?** NO

### Compliance positive
- Conditional render via pausedSnapshot ✓
- Dynamic title + minutesAgo + ex N ✓
- 2 buttons (Reia / Renunta) cu event.stopPropagation correctly ✓
- Brick border preserved ✓
- Uppercase kicker REIA SESIUNEA brick ✓

**ResumeSessionCard parity: 75%**

---

## AaFrictionModal (`src/react/components/AaFrictionModal.tsx` — 107 LOC)

### Status: LOCK 9 SAFETY GATE — engine wired correctly

- Engine wired ✓ (reason + open props from aaFrictionDetect.detectAggressiveLoad)
- Blocking modal (backdrop NU dismiss) ✓ — LOCK 9 safety strict
- 2 buttons (Pauza 30 sec / Continui oricum) ✓ — anti-paternalism preserved
- Reason label mapping (fast_sets / kg_jump / rep_spike) ✓

### F-pass2-aafriction-01 — Copy "WORDING BACKLOG" Daniel CEO review pending

- **Severity:** META (process)
- **Note:** Code comment explicit: "mockup verbatim absent pentru per-set context wording. Placeholders used pentru Daniel CEO wording review pre-Beta. RAPORT §6 WORDING BACKLOG flag."
- **Mockup ref:** N/A (mockup aaFrictionModal scope = session-level, NOT per-set per code comment)
- **Prod ref:** `AaFrictionModal.tsx:29-44` (autonomous compose D024 LOCKED V1)
- **Karpathy fix:** Daniel CEO wording review pre-Beta
- **Beta blocker?** YES (process) — Daniel must approve wording pre-Beta launch

### Compliance positive
- LOCK 9 safety gate behavior correct (blocking modal, anti-aggressive load detection)
- Anti-paternalism preserved (Continui oricum override)
- Phase 5 task_02 autonomous compose D024

**AaFrictionModal parity: 75%** (engine-wired clean, wording pending review)

---

## Pass 2 FINAL cumulative (20 sub-components — all Pass 2 targets covered)

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
| 17 | PatternsBanner+AlertsBanner | 80% | 0 |
| 18 | ReactivateCard | 70% | 0 |
| 19 | ResumeSessionCard | 75% | 0 |
| 20 | AaFrictionModal | 75% | 0 (process wording flag) |

**Pass 2 FINAL mean parity: 58.5% (20 components).**
**Pass 2 CRIT total: 8 (sub-components) + 7 (Wave G missing confirms) = 15 CRIT.**

**Combined Pass 1 + Pass 2 FINAL:**
- 50/50 mockup screens documented
- 20/20 main sub-components audited
- ~240 findings cumulative
- ~41 CRIT Beta blockers
- ~36% measured mockup parity (weighted)
- ~58.5% sub-component fidelity mean (higher than screen-level due to mockup-verbatim positive findings)

**Pass 1 + Pass 2 = AUDIT SUBSTANTIALLY COMPLETE.** Pass 3-5 deferred — cross-screen pattern aggregation, polish backlog, Playwright screenshots.
