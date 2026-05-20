# Findings — `screen-workout-preview` (Wave B.3)

**Mockup ref:** `04-architecture/mockups/andura-clasic.html:913-996`
**Prod ref:** `src/react/routes/screens/antrenor/WorkoutPreview.tsx:1-164`

## Findings

### F-workout-preview-01 — Dark ink Session header card MISSING

- **Severity:** CRIT
- **Category:** Component
- **Mockup:** Dark ink card cu brick kicker "SESIUNEA DE AZI" + h2 "Push · piept & umeri" + 3-chip strip (clock duration / layers exercise-count / trending volume) — heroic anchor
- **Prod:** Plain h1 title + 2-col flex grid (Durata + Tonaj) — flat layout
- **Mockup ref:** `andura-clasic.html:924-932`
- **Prod ref:** `WorkoutPreview.tsx:121, 131-146`
- **Karpathy fix:** Think Before Coding (full session-header card component cu kicker + title + 3 chips în dark variant)
- **Fix effort:** M
- **Beta blocker?** YES — visual hero anchor of screen

### F-workout-preview-02 — Warmup row MISSING

- **Severity:** CRIT
- **Category:** Component
- **Mockup:** Warmup row cu flame icon + italic Lora copy "Incepem cu 5 min incalzire piept & umeri — band pull-apart × 2 · activare scapula" + Why button (help-circle)
- **Prod:** ABSENT entirely
- **Mockup ref:** `andura-clasic.html:935-939`
- **Prod ref:** `WorkoutPreview.tsx` (no warmup)
- **Karpathy fix:** Think Before Coding (FIX 1 Warmup adaptive component per main lift + recovery state engine integration)
- **Fix effort:** M
- **Beta blocker?** YES — FIX 1 Warmup explicit Daniel 2026-05-11 reglaj LANDED în mockup

### F-workout-preview-03 — Exercise list MISSING (5 numbered exercises)

- **Severity:** CRIT
- **Category:** Component
- **Mockup:** "Exercitii" settings-section + 5 numbered exercise rows cu (a) numbered chip 34x34 + (b) name + (c) sets·kg·reps mono font + (d) exercise type icon (dumbbell/cable/timer)
- **Prod:** ABSENT entirely — preview shows ONLY duration + tonaj + coach quote, no exercise details
- **Mockup ref:** `andura-clasic.html:941-985`
- **Prod ref:** `WorkoutPreview.tsx` (no exercise list)
- **Karpathy fix:** Think Before Coding (ExercisePreviewList component reading from PlannedWorkout.exercises)
- **Fix effort:** M
- **Beta blocker?** YES — "Ce urmeaza azi" mockup intent = SHOW exercises before entry; prod misses this entirely

### F-workout-preview-04 — Closing italic note MISSING

- **Severity:** MED
- **Category:** Text
- **Mockup:** `<p>Coach-ul ajusteaza in timpul sesiunii daca apare ceva: durere, oboseala, set greu. Nu trebuie sa stii dinainte tot.</p>` (anti-paternalism reassurance)
- **Prod:** Has different coach quote `coachPick('preview')` but doesn't include this reassurance text
- **Mockup ref:** `andura-clasic.html:991`
- **Prod ref:** `WorkoutPreview.tsx:147-154`
- **Karpathy fix:** Surgical
- **Beta blocker?** NO (Wave 2 — but anti-paternalism positioning)

### F-workout-preview-05 — CTA text + icon divergence ("Confirma, incep" vs "Incepe antrenament")

- **Severity:** MED
- **Category:** Text + Component
- **Mockup:** `<i check-icon /> Confirma, incep` (confirmation framing)
- **Prod:** `Incepe antrenament` (plain action verb)
- **Mockup ref:** `andura-clasic.html:993-995`
- **Prod ref:** `WorkoutPreview.tsx:155-161`
- **Karpathy fix:** Surgical (text + add check icon)
- **Beta blocker?** YES — confirmation framing reduces accidental tap; matches preview screen intent

### F-workout-preview-06 — Sub-header structure (back-btn + "Ce urmeaza azi") MISSING

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** `<sub-header><back-btn /><h2>Ce urmeaza azi</h2></sub-header>`
- **Prod:** `<h1>{title}</h1>` (workout title) — no sub-header, no back-btn, h1 = "Push (piept si umeri)" content not screen-name
- **Mockup ref:** `andura-clasic.html:915`
- **Prod ref:** `WorkoutPreview.tsx:121`
- **Karpathy fix:** Same SubHeader pattern (cross-cutting Pass 2)
- **Beta blocker?** YES — same back-button pattern Wave A.2/B.1/B.2

### F-workout-preview-07 — Intensity banner color tokens close OK

- **Severity:** LOW
- **Category:** Token
- **Mockup:** Intensity banner background hex (`#fdf3df` warm cream)
- **Prod:** Uses `bannerFor(intensityMod)` returning matching hex values + zap icon missing
- **Mockup ref:** `andura-clasic.html:918-921`
- **Prod ref:** `WorkoutPreview.tsx:41-61, 122-130`
- **Karpathy fix:** Verify zap icon presence
- **Beta blocker?** NO (close OK)

**Total: 7 findings on WorkoutPreview. Parity: ~38%** (3 CRIT entire-component-missing + 2 HIGH back-btn + CTA confirmation)
