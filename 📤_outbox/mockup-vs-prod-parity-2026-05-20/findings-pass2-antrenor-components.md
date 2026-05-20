# Pass 2 — Antrenor sub-components deep-dive (CoachTodayCard + Calendar7Day)

## CoachTodayCard (`src/react/components/Antrenor/CoachTodayCard.tsx` — 45 LOC)

### F-pass2-coachtoday-01 — HARDCODED workout title "Pull (spate & biceps)" (NOT reading planned workout)

- **Severity:** CRIT
- **Mockup:** Dynamic title `coach-today-title` populated from coachDirector.buildSession()
- **Prod:** Hardcoded `Pull (spate & biceps)` literal (line 25) — component comment notes "Phase 3 stub: static title... Phase 5+ va wire din engineWrappers"
- **Mockup ref:** `andura-clasic.html:744`
- **Prod ref:** `CoachTodayCard.tsx:25`
- **Karpathy fix:** Wire actual planned workout via props (workoutTitle + duration + exerciseCount) from getCoachToday aggregate
- **Beta blocker?** YES — every user sees "Pull (spate & biceps)" regardless of actual plan = broken core UX

### F-pass2-coachtoday-02 — HARDCODED coach WHY quote (NOT engine-driven)

- **Severity:** CRIT
- **Mockup:** Dynamic `coach-today-why` populated cu engine reasoning per persona/state
- **Prod:** Hardcoded `Pectoralii recupereaza din marti · spatele e gata.` (line 30)
- **Mockup ref:** `andura-clasic.html:745`
- **Prod ref:** `CoachTodayCard.tsx:27-31`
- **Karpathy fix:** Wire engine reasoning prop from coachStore/aggregate
- **Beta blocker?** YES — generic Romanian quote NOT reflective of actual user state

### F-pass2-coachtoday-03 — HARDCODED duration "~ 48 min" + "5 exercitii" (NOT planned)

- **Severity:** CRIT
- **Mockup:** Dynamic `coach-today-dur` + `coach-today-ex` from PlannedWorkout
- **Prod:** Hardcoded `~ 48 min` + `5 exercitii` (lines 33-34)
- **Karpathy fix:** Wire from getCoachToday aggregate
- **Beta blocker?** YES

### F-pass2-coachtoday-04 — Lagging signal extension (FIX 4 2026-05-11) MISSING

- **Severity:** HIGH
- **Mockup:** Hidden `coach-today-lagging` block extends WHY cu weakness signal (e.g., "spatele sub-volum 2 sapt — focus azi pe randuri")
- **Prod:** ABSENT entirely
- **Mockup ref:** `andura-clasic.html:747`
- **Prod ref:** `CoachTodayCard.tsx` (no lagging extension)
- **Karpathy fix:** Add LaggingSignalExtension conditional read from weaknessDetector engine
- **Beta blocker?** YES — Daniel FIX 4 reglaj 2026-05-11

### F-pass2-coachtoday-05 — Icons (clock + layers) MISSING from chips

- **Severity:** MED
- **Mockup:** Duration + exercise count chips have Lucide icons (clock + layers)
- **Prod:** Plain text only (no icons in span flex)
- **Mockup ref:** `andura-clasic.html:749-750`
- **Prod ref:** `CoachTodayCard.tsx:33-34`
- **Karpathy fix:** Add Clock + Layers icons
- **Beta blocker?** NO (Wave 2)

### F-pass2-coachtoday-06 — "Vrei altceva azi?" override link MISSING

- **Severity:** HIGH
- **Mockup:** Below CTA: `<a>Vrei altceva azi? →</a>` opens scheduleOverride
- **Prod:** ABSENT (no override link below "Incepe sesiunea" CTA)
- **Mockup ref:** `andura-clasic.html:753-755`
- **Prod ref:** `CoachTodayCard.tsx:36-42`
- **Karpathy fix:** Add override link button
- **Beta blocker?** YES — schedule-override discovery affordance

### F-pass2-coachtoday-07 — Radial brick gradient decoration MISSING

- **Severity:** LOW
- **Mockup:** Decorative `position:absolute` 140x140 radial gradient brick top-right corner
- **Prod:** Plain ink card (no decorative gradient)
- **Mockup ref:** `andura-clasic.html:742`
- **Prod ref:** `CoachTodayCard.tsx:17`
- **Karpathy fix:** Surgical add ::before pseudo-element OR div absolute
- **Beta blocker?** NO (Wave 3 polish)

**CoachTodayCard verdict: 7 findings, 3 CRIT (hardcoded data), 2 HIGH. Parity: ~30%** (component is essentially placeholder/stub per code comment, NOT wired to engine).

---

## Calendar7Day (`src/react/components/Calendar7Day.tsx` — 126 LOC)

### F-pass2-calendar-01 — Title divergence "Saptamana" vs "Program de antrenament"

- **Severity:** HIGH
- **Mockup:** Title `Program de antrenament` CENTRAT (Daniel 2026-05-12 explicit reglaj "pune si tu ceva gen Program de antrenament. Si centreaza textul")
- **Prod:** Title `Saptamana` (uppercase tracking-wide ink2, NOT centered)
- **Mockup ref:** `andura-clasic.html:836`
- **Prod ref:** `Calendar7Day.tsx:59-61`
- **Karpathy fix:** Surgical (text swap "Program de antrenament" + center + text-base font-semibold)
- **Beta blocker?** YES — Daniel reglaj explicit contradicted

### F-pass2-calendar-02 — Day label "M" for Miercuri (mockup uses "Mi", confused cu Marti)

- **Severity:** MED
- **Mockup:** Day labels: L Ma Mi J V S D (3 distinct: Marti = Ma, Miercuri = Mi visually distinct)
- **Prod:** DAY_LABELS = `['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D']` ✓ matches mockup
- **Wait:** Mockup display showed letters L M M J V S D (lines 847-853) — display strings ARE M / M (not Ma / Mi) per `>L</button>... >M</button>... >M</button>` — actually looking more carefully, mockup uses `data-day="L"` etc but displays text `L`, `M` (Marti), `M` (Miercuri), `J`, `V`, `S`, `D` — ambiguous M usage
- **Prod:** Uses full labels `Ma / Mi` rendered as `Ma` (2 chars) and `Mi` (2 chars) — clearer distinction
- **Karpathy verdict:** Prod IS clearer, mockup ambiguous M/M — flag to Daniel as mockup improvement vs spec
- **Beta blocker?** NO (Daniel decision)

### F-pass2-calendar-03 — Color tokens divergence

- **Severity:** MED
- **Mockup:** Calendar color tokens: training = #3d7a4a green (LOCKED state), edit-mode training = #d4e6cb light green
- **Prod:** Same hex values used (line 96-107) — ✓ aligns
- **Karpathy:** ✓ Compliance preserved
- **Beta blocker?** N/A

### F-pass2-calendar-04 — Edit toggle pencil icon + Save button structure

- **Severity:** OK
- **Mockup:** Pencil edit toggle + Save button (line 837-843, 858) — matches
- **Prod:** Pencil icon + Check (when editing) + Save button (lines 62-74, 114-122) — ✓ matches
- **Karpathy:** Surgical preserved
- **Beta blocker?** N/A

### F-pass2-calendar-05 — Edit hint copy MISSING

- **Severity:** LOW
- **Mockup:** `<p class="calendar-edit-hint" hidden>Modifica zilele de antrenament in care esti disponibil.</p>` (line 856)
- **Prod:** No hint text în edit mode
- **Mockup ref:** `andura-clasic.html:856`
- **Prod ref:** `Calendar7Day.tsx:114-122`
- **Karpathy fix:** Surgical add hint text conditional on editMode
- **Beta blocker?** NO

**Calendar7Day verdict: 5 findings, 1 HIGH (title contradiction Daniel reglaj), MEDs neutral. Parity: ~70%** (structure + tokens preserved well)

---

## Pass 2 sample digest (4 components total: SessionTimer + RestOverlay + CoachTodayCard + Calendar7Day)

| Component | Findings | CRIT | Parity |
|-----------|---------|------|--------|
| SessionTimer | 4 | 1 (menu missing) | ~45% |
| RestOverlay | 3 | 1 (ring missing) | ~30% |
| CoachTodayCard | 7 | 3 (hardcoded data) | ~30% |
| Calendar7Day | 5 | 0 | ~70% |

**Pass 2 sample cumulative: 19 findings, 5 CRIT, mean parity 44%**

**Critical insight:** CoachTodayCard is essentially HARDCODED PLACEHOLDER (per code comment "Phase 3 stub... Phase 5+ va wire") — Phase 5 wiring NEVER landed despite Phase 6+ markers în Antrenor.tsx parent. **3 CRIT** findings collapse to single root issue: component never wired to actual engine data. Single Phase 5 wiring task closes 3 CRIT.

**Remaining Pass 2 estimate:** 14+ more sub-components × 5-7 findings each = ~80-100 additional Pass 2 findings.
