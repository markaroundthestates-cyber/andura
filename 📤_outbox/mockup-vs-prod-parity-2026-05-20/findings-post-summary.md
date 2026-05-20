# Findings — `screen-post-summary` (Wave B.6)

**Mockup ref:** `04-architecture/mockups/andura-clasic.html:1629-1700+`
**Prod ref:** `src/react/routes/screens/antrenor/PostSummary.tsx:1-207`

## Findings

### F-post-summary-01 — Sub-header "Sesiune terminata" MISSING (workout title used instead)

- **Severity:** HIGH
- **Category:** Component + Text
- **Mockup:** `<sub-header><back-btn /><h2>Sesiune terminata</h2></sub-header>` — clear closure framing
- **Prod:** h1 = `{lastSession?.title}` (workout name, e.g. "Push (piept si umeri)") — context confusion (looks like preview screen)
- **Mockup ref:** `andura-clasic.html:1630`
- **Prod ref:** `PostSummary.tsx:109-111`
- **Karpathy fix:** Surgical (h1 = "Sesiune terminata", workout title moved to subtitle)
- **Beta blocker?** YES — closure framing important post-session

### F-post-summary-02 — Streak format divergence (mockup inline emoji row vs prod card)

- **Severity:** MED
- **Category:** Component + Text
- **Mockup:** Inline row `🔥 12 zile consecutive — mentine ritmul!` — compact celebratory
- **Prod:** Separate card with label "Streak" + count + "sesiune / sesiuni" singular/plural — verbose
- **Mockup ref:** `andura-clasic.html:1645-1650`
- **Prod ref:** `PostSummary.tsx:186-195`
- **Karpathy fix:** Surgical (inline row pattern cu emoji + "zile consecutive — mentine ritmul!" Romanian copy)
- **Beta blocker?** MED — mockup celebratory inline pattern lost

### F-post-summary-03 — Grupe musculare pills MISSING

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** "Grupe musculare" section cu pill rows (Piept / Umeri / Triceps / Abs) cu color dot + label (brick = primary worked, ink-3 = secondary)
- **Prod:** ABSENT entirely
- **Mockup ref:** `andura-clasic.html:1673-1680`
- **Prod ref:** `PostSummary.tsx` (no muscle groups section)
- **Karpathy fix:** Add MuscleGroupsTouchedPills component (read from sessionExercisesBreakdown muscle mapping)
- **Fix effort:** M (needs muscle mapping per exercise)
- **Beta blocker?** YES — body composition feedback = motivation anchor

### F-post-summary-04 — Marius-only granular details MISSING

- **Severity:** MED
- **Category:** Component
- **Mockup:** Persona-aware card "Detaliu Marius" cu 4-grid stats (Tonaj sesiune / 1RM Impins est cu +0.6 delta / RPE mediu / Densitate kg/min) — JetBrains Mono numerics
- **Prod:** ABSENT (general 4-stat grid serves all personas, no Marius-specific data depth)
- **Mockup ref:** `andura-clasic.html:1682-1691`
- **Prod ref:** `PostSummary.tsx` (no persona variants)
- **Karpathy fix:** Conditional component based on persona-aware coachStore
- **Beta blocker?** NO (Wave 2 — Marius-specific depth)

### F-post-summary-05 — PR banner ENRICHED vs simpler mockup

- **Severity:** NIT (prod-extra)
- **Category:** Component
- **Mockup:** PR banner simple: trophy + "Record nou!" + "Impins inclinat 25 kg × 10" + "Vezi toate →" link
- **Prod:** PR banner enriched: trophy + "PR nou!" + exercise+deltaKg + chips (PR type label / delta% / 1RM estimate)
- **Mockup ref:** `andura-clasic.html:1635-1643`
- **Prod ref:** `PostSummary.tsx:126-176`
- **Karpathy fix:** Daniel decision — keep prod richer + amend mockup OR simplify
- **Beta blocker?** NO — drift în direction of MORE info (positive)

### F-post-summary-06 — Stats grid order + labels divergent

- **Severity:** LOW
- **Category:** Text
- **Mockup:** Order: Durata / Seturi logate (X/Y format!) / Volum total / Kcal estimate
- **Prod:** Order: Seturi / Durata / Tonaj / Kcal — different order + missing X/Y for Seturi
- **Mockup ref:** `andura-clasic.html:1654-1671`
- **Prod ref:** `PostSummary.tsx:179-184`
- **Karpathy fix:** Surgical (reorder + add "/ Y" for sets logged X out of Y planned)
- **Beta blocker?** NO (Wave 3 polish)

### F-post-summary-07 — Bottom CTA "Terminat" vs mockup back-button finishSession()

- **Severity:** LOW
- **Category:** Behavior
- **Mockup:** Back-button în sub-header calls `finishSession()` — back = finalize
- **Prod:** Separate "Terminat" CTA bottom calls `handleFinish` (reset + navigate)
- **Mockup ref:** `andura-clasic.html:1630`
- **Prod ref:** `PostSummary.tsx:197-204`
- **Karpathy fix:** Either OK, prod more explicit; could keep
- **Beta blocker?** NO

**Total: 7 findings on PostSummary. Parity: ~60%**
