# Findings — `screen-energy-cause` (Wave B.2)

**Mockup ref:** `04-architecture/mockups/andura-clasic.html:899-911`
**Prod ref:** `src/react/routes/screens/antrenor/EnergyCause.tsx:1-81`

## Findings

### F-energy-cause-01 — Cause options DIVERGENT (count 4 → 6 + text divergent)

- **Severity:** HIGH
- **Category:** Component + Text
- **Mockup:** 4 causes: Stres / Somn slab / Durere musculara · articulatie / Altul — cu Lucide icons (wind/moon/alert-circle/more-horizontal)
- **Prod:** 6 causes: Dormit putin / Mancat putin / Stres mental / Antrenament greu ieri / Boala sau racit / Altceva — NO icons
- **Mockup ref:** `andura-clasic.html:905-908`
- **Prod ref:** `EnergyCause.tsx:20-27`
- **Karpathy fix:** Daniel decision — keep prod 6 cu finer granularity OR converge mockup 4 simple
- **Beta blocker?** YES — drift în taxonomy mockup vs prod

### F-energy-cause-02 — Icons MISSING per cause

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** Each cause button has Lucide icon (wind, moon, alert-circle, more-horizontal)
- **Prod:** Text-only buttons, ZERO icons
- **Mockup ref:** `andura-clasic.html:905-908`
- **Prod ref:** `EnergyCause.tsx:60-69`
- **Karpathy fix:** Surgical (add icon mapping per cause object)
- **Beta blocker?** YES — visual scan pattern lost

### F-energy-cause-03 — Layout divergence (vertical stack vs 2-col grid)

- **Severity:** MED
- **Category:** Layout
- **Mockup:** Vertical stack `flex-direction:column; gap:10px;` — full-width buttons
- **Prod:** `grid grid-cols-2 gap-3` — 2-col grid
- **Mockup ref:** `andura-clasic.html:904`
- **Prod ref:** `EnergyCause.tsx:58`
- **Karpathy fix:** Surgical (flex-col)
- **Beta blocker?** MED — UX scan pattern

### F-energy-cause-04 — Header text divergence ("Ce e mai greu azi?" → "De ce te simti asa?")

- **Severity:** MED
- **Category:** Text
- **Mockup:** `Ce e mai greu azi?` (specific contextual)
- **Prod:** `De ce te simti asa?` (generic)
- **Mockup ref:** `andura-clasic.html:901`
- **Prod ref:** `EnergyCause.tsx:54`
- **Karpathy fix:** Surgical (text swap)
- **Beta blocker?** NO (Wave 2)

### F-energy-cause-05 — Body intro divergence

- **Severity:** MED
- **Category:** Text
- **Mockup:** `Alege una. Coach-ul foloseste raspunsul ca sa adapteze sesiunea.`
- **Prod:** `Optional. Coach ajusteaza in functie de cauza.`
- **Mockup ref:** `andura-clasic.html:903`
- **Prod ref:** `EnergyCause.tsx:55-57`
- **Karpathy fix:** Surgical
- **Beta blocker?** NO (Wave 2)

### F-energy-cause-06 — "Sari peste" Skip button — prod-extra (D-LEGACY-010 anti-force-typing OK)

- **Severity:** OK (positive)
- **Mockup:** No Skip — forced choice
- **Prod:** Skip "Sari peste" button per D-LEGACY-010 anti-force-typing AMENDMENT
- **Karpathy fix:** N/A (Daniel-approved deviation cited în code comment)
- **Beta blocker?** N/A — this is intentional, mockup follow-up Daniel review

### F-energy-cause-07 — Sub-header back button MISSING (same pattern Auth + EnergyCheck)

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** `<sub-header><back-btn /><h2></h2></sub-header>`
- **Prod:** h1 + p, no back navigation
- **Mockup ref:** `andura-clasic.html:901`
- **Prod ref:** `EnergyCause.tsx:53-57`
- **Karpathy fix:** Cross-cutting SubHeader component (Pass 2 pattern extraction)
- **Beta blocker?** YES

**Total: 7 findings on EnergyCause. Parity: ~55%**
