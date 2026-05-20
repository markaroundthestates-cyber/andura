# Findings — `screen-energy-check` (Wave B.1)

**Mockup ref:** `04-architecture/mockups/andura-clasic.html:878-897`
**Prod ref:** `src/react/routes/screens/antrenor/EnergyCheck.tsx:1-71`

## Findings

### F-energy-check-01 — Energy states count divergence (3 → 5)

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** 3 states explicit (Excelent / Normal · OK / Obosit · slab) — Daniel LOCKED simple "3 stari simple"
- **Prod:** 5 states (Excelent / Bine / Normal / Slabit / Obosit) — comment notes "spec extends la 5-option"
- **Mockup ref:** `andura-clasic.html:881, 883-894`
- **Prod ref:** `EnergyCheck.tsx:29-35`
- **Karpathy fix:** Daniel reglaj decision — keep prod 5 (more granularity) + amend mockup OR collapse prod to 3 mockup-aligned
- **Beta blocker?** YES — explicit mockup contract "3 stari simple"; prod drift to 5

### F-energy-check-02 — Emoji choices DIVERGENT (🟢🟡🔴 → 💪⚡😊🌱😴)

- **Severity:** HIGH
- **Category:** Token
- **Mockup:** Universal 🟢 🟡 🔴 (traffic-light intensity coding — instant scan)
- **Prod:** 💪 ⚡ 😊 🌱 😴 (5 distinct emojis, varied semantic)
- **Mockup ref:** `andura-clasic.html:884, 888, 892`
- **Prod ref:** `EnergyCheck.tsx:30-34`
- **Karpathy fix:** Surgical — align emojis to traffic-light cu 3-state collapse OR document drift
- **Beta blocker?** YES — visual scan-ability mockup pattern

### F-energy-check-03 — Sub-text per state MISSING

- **Severity:** HIGH
- **Category:** Text
- **Mockup:** Each button has sub-text explainer:
  - 🟢 Excelent — "Coach urca intensitatea +15%"
  - 🟡 Normal · OK — "Sesiune normala — baseline"
  - 🔴 Obosit / slab — "Coach reduce sesiunea imediat"
- **Prod:** Only labels, NO sub-text explainers (just `<span>{opt.label}</span>` line 65)
- **Mockup ref:** `andura-clasic.html:885, 889, 893`
- **Prod ref:** `EnergyCheck.tsx:62-66`
- **Karpathy fix:** Surgical (add sub-text per option object cu engine semantic)
- **Beta blocker?** YES — transparency about coach behavior is product personality

### F-energy-check-04 — Body intro "Coach-ul ajusteaza..." MISSING

- **Severity:** MED
- **Category:** Text
- **Mockup:** `<p>Coach-ul ajusteaza intensitatea pe baza energiei tale. <b>3 stari simple.</b></p>`
- **Prod:** ABSENT (no body intro)
- **Mockup ref:** `andura-clasic.html:881`
- **Prod ref:** `EnergyCheck.tsx:51`
- **Karpathy fix:** Surgical
- **Beta blocker?** NO (Wave 2 — explainer copy)

### F-energy-check-05 — Sub-header structure divergence (back-btn + h2 vs h1)

- **Severity:** MED
- **Category:** Component
- **Mockup:** `<div class="sub-header"><back-btn /><h2>Cum te simti?</h2></div>` — anchored top cu back navigation
- **Prod:** `<h1>Cum te simti azi?</h1>` — no back button, relies on browser back
- **Mockup ref:** `andura-clasic.html:879`
- **Prod ref:** `EnergyCheck.tsx:51`
- **Karpathy fix:** Surgical (add SubHeader component cu back-btn + h2)
- **Beta blocker?** YES — back button explicit UX expectation (matches Auth-05 cross-screen pattern)

**Total: 5 findings on EnergyCheck. Parity: ~50%**
