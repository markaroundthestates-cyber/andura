# Findings — `screen-post-rpe` (Wave B.5)

**Mockup ref:** `04-architecture/mockups/andura-clasic.html:1593-1626`
**Prod ref:** `src/react/routes/screens/antrenor/PostRpe.tsx:1-140`

## Findings

### F-post-rpe-01 — Coach quote intro MISSING

- **Severity:** HIGH
- **Category:** Text
- **Mockup:** Coach quote Lora italic 19px: `„Raspunsul tau calibreaza sesiunea de maine. O singura intrebare."`
- **Prod:** Plain subtitle: `Coach calibreaza pentru data viitoare.` (line 121-123)
- **Mockup ref:** `andura-clasic.html:1596`
- **Prod ref:** `PostRpe.tsx:121-123`
- **Karpathy fix:** Surgical (replace subtitle with italic Lora quote)
- **Beta blocker?** YES — coach voice quote is product personality

### F-post-rpe-02 — Emoji 🟢🟡🔴 MISSING per rating

- **Severity:** HIGH
- **Category:** Token
- **Mockup:** Each rating button has 32px emoji (🟢/🟡/🔴) — traffic-light pattern consistent cu EnergyCheck
- **Prod:** Text-only buttons, no emojis
- **Mockup ref:** `andura-clasic.html:1602, 1609, 1616`
- **Prod ref:** `PostRpe.tsx:126-136`
- **Karpathy fix:** Surgical (add emoji per RATING_OPTIONS object)
- **Beta blocker?** YES — visual scan pattern consistency

### F-post-rpe-03 — Rating sub-text divergent (semantic engine impact vs description)

- **Severity:** MED
- **Category:** Text
- **Mockup:** Sub-text per rating = engine semantic impact:
  - Usor → "Coach urca intensitatea maine"
  - Potrivit → "Continuam pe traiectorie"
  - Greu → "Coach reduce intensitatea"
- **Prod:** Sub-text = personal feeling description:
  - Usoara → "Aveam mai mult in rezerva"
  - Normala → "Solid, echilibrat"
  - Grea → "M-am dus la limita"
- **Mockup ref:** `andura-clasic.html:1605, 1612, 1619`
- **Prod ref:** `PostRpe.tsx:37-39`
- **Karpathy fix:** Daniel decision — mockup engine-transparent vs prod personal-feel; either OK depending on intent
- **Beta blocker?** YES — explicit Daniel anti-paternalism transparency in mockup intent

### F-post-rpe-04 — Footer "Raspunsul tau e singurul input..." MISSING

- **Severity:** MED
- **Category:** Text
- **Mockup:** Footer copy: `Raspunsul tau e singurul input pe care nu-l putem deduce singuri. Multumim.` (gratitude + explainer)
- **Prod:** ABSENT
- **Mockup ref:** `andura-clasic.html:1624`
- **Prod ref:** `PostRpe.tsx` (no footer)
- **Karpathy fix:** Surgical
- **Beta blocker?** NO (Wave 2)

### F-post-rpe-05 — Rating taxonomy divergence ('usor/potrivit/greu' vs 'usoara/normala/grea')

- **Severity:** NIT (mapping bridge exists)
- **Category:** Process
- **Mockup:** `usor/potrivit/greu`
- **Prod:** `usoara/normala/grea` — mapping exists în `PostSummary.tsx:33-37` `mapRatingToCoachKey`
- **Karpathy:** Decision — keep prod cu mapping OR align taxonomy
- **Beta blocker?** NO — mapping bridge handles internally

### F-post-rpe-06 — Sub-header back-btn MISSING (cross-screen pattern)

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** `<sub-header><back-btn /><h2>Cum a fost sesiunea?</h2></sub-header>`
- **Prod:** h1 only, no back navigation
- **Mockup ref:** `andura-clasic.html:1594`
- **Prod ref:** `PostRpe.tsx:120`
- **Karpathy fix:** SubHeader cross-cutting (Pass 2)
- **Beta blocker?** YES (cross-cutting same)

**Total: 6 findings on PostRpe. Parity: ~55%**
