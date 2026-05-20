# Findings — `screen-istoric` (Wave A.5)

**Mockup ref:** `04-architecture/mockups/andura-clasic.html:1155-1238`
**Prod ref:** `src/react/routes/screens/istoric/Istoric.tsx:1-137`
**Audit date:** 2026-05-20

## Findings

### F-istoric-01 — Calendar heatmap month navigator MISSING (CRIT)

- **Severity:** CRIT
- **Category:** Component
- **Mockup:** Month-navigable calendar heatmap cu (a) month label "Mai 2026" + chevrons L/R navigate + (b) 7-col grid L Ma Mi J V S D headers + (c) heatmap cells color-coded per session intensity (Greu/Normal/Usor/Recuperare/Zi libera) + (d) 5-tier legend
- **Prod:** ABSENT entirely — no calendar, no heatmap, no month navigator
- **Mockup ref:** `andura-clasic.html:1177-1196`
- **Prod ref:** `Istoric.tsx` (no equivalent)
- **Karpathy fix:** Think Before Coding (component design — grid + cell intensity scale + month nav state) + Goal-Driven (calendar visualization = key Istoric value proposition)
- **Fix effort:** L (multi-file: HeatmapMonth component + month nav state + cell intensity mapping from sessionsHistory)
- **Beta blocker?** YES — calendar heatmap = signature Istoric feature, anchor of "see your consistency"

### F-istoric-02 — Quick stats 3-cell grid: TEXT divergence + missing "Zile consecutive"

- **Severity:** MED
- **Category:** Text + Component
- **Mockup:** 3-col stats grid: `12 Zile consecutive` + `68 Sesiuni total` + `14 Recorduri`
- **Prod:** 3-col grid: `Streak` (icon flame) + `Sesiuni` (icon history) + `PR-uri` (icon trophy) — labels differ ("Streak" vs "Zile consecutive", "Sesiuni" vs "Sesiuni total", "PR-uri" vs "Recorduri")
- **Mockup ref:** `andura-clasic.html:1170-1175`
- **Prod ref:** `Istoric.tsx:42-67`
- **Karpathy fix:** Surgical (text swap labels — Romanian no-jargon: "Zile consecutive" + "Sesiuni total" + "Recorduri")
- **Fix effort:** S
- **Beta blocker?** YES per Daniel Romanian no-diacritics no-jargon LOCK ("Streak" = English jargon vs "Zile consecutive" Romanian)

### F-istoric-03 — "Cum au fost sesiunile" 90-day ratings heatmap MISSING

- **Severity:** CRIT
- **Category:** Component
- **Mockup:** "Cum au fost sesiunile · ultimele 90 zile" section cu (a) 13-col mini-heatmap (90 zile / 7) intensity-coded (usor/potrivit/greu) + (b) 3-col counter grid (Usor 12 / Potrivit 38 / Greu 7) + (c) explainer "Coach-ul foloseste evaluarile tale ca sa ajusteze intensitatea. 57 sesiuni in ultimele 90 zile."
- **Prod:** ABSENT entirely
- **Mockup ref:** `andura-clasic.html:1203-1228`
- **Prod ref:** `Istoric.tsx` (no equivalent)
- **Karpathy fix:** Think Before Coding (F14 V1 ratings window engine integration — needs sessionsHistory ratings aggregation + heatmap component)
- **Fix effort:** L
- **Beta blocker?** YES — F14 V1 feedback loop = coach calibration explainer, anchor of "engine learns from you"

### F-istoric-04 — "Ultima sesiune" card MISSING (relocated from Antrenor per Daniel 2026-05-12)

- **Severity:** MED
- **Category:** Component
- **Mockup:** `ultima-sesiune-card-istoric` clickable card cu icon + kicker "Ultima sesiune" + title "Joi · Push (piept & umeri)" + meta "5 ex · 52 min · 12 845 kg" + chevron → goto('sesiuni-recente')
- **Prod:** ABSENT (relocated logic from Antrenor → Istoric per Daniel reglaj, but Istoric doesn't render it either)
- **Mockup ref:** `andura-clasic.html:1159-1168`
- **Prod ref:** `Istoric.tsx` (no equivalent)
- **Karpathy fix:** Surgical (add LastSessionCard component reading from workoutStore lastSession)
- **Beta blocker?** YES — Daniel reglaj explicit relocation honored în mockup BUT prod doesn't have it în any tab

### F-istoric-05 — "Sesiuni recente" button row MISSING

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** Bordered button row cu icon + "Sesiuni recente" + "3 noi" badge + chevron → goto('sesiuni-recente') sub-screen
- **Prod:** ABSENT (Istoric.tsx renders sessions list inline, no dedicated "Sesiuni recente" sub-route)
- **Mockup ref:** `andura-clasic.html:1198-1201`
- **Prod ref:** `Istoric.tsx:93-134`
- **Karpathy fix:** Daniel decision — keep inline list (prod simpler) OR add sub-route + summary badge
- **Beta blocker?** MED — sub-route discovery affordance; could keep inline if list-on-istoric satisfies use case

### F-istoric-06 — "Vezi mai mult" drill-down stack MISSING

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** "Vezi mai mult" section cu 3 settings-row drill-downs:
  1. `Greutate & BF` (line-chart icon) → goto('weight-timeline')
  2. `Import Nutritie (JSON)` (file-json icon) → showToast (placeholder)
  3. `Recorduri Personale` (award icon) → goto('pr-wall')
- **Prod:** ABSENT — no drill-down stack. PR Wall is INLINE within Istoric.tsx instead of dedicated sub-screen
- **Mockup ref:** `andura-clasic.html:1230-1236`
- **Prod ref:** `Istoric.tsx:69-91` (PR inline)
- **Karpathy fix:** Add 3 sub-routes + drill-down stack (matches mockup `_screen-mapping-matrix.md` MISSING surfaces — weight-timeline, pr-wall both flagged absent)
- **Fix effort:** L (3 sub-screens + routing + components)
- **Beta blocker?** YES — drill-down architecture mockup-intended

### F-istoric-07 — PR Wall section: prod-inline vs mockup-sub-route divergence

- **Severity:** MED
- **Category:** Component / Architecture
- **Mockup:** PR Wall = dedicated sub-screen `screen-pr-wall` (line 1241), Istoric only has "Recorduri Personale" drill-down link
- **Prod:** PR full list INLINE on Istoric.tsx (line 69-91)
- **Mockup ref:** `andura-clasic.html:1235` (link only) + `1241` (sub-screen)
- **Prod ref:** `Istoric.tsx:69-91`
- **Karpathy fix:** Daniel decision — keep inline (faster discovery) OR move to sub-route (mockup-aligned reduces Istoric scroll)
- **Beta blocker?** MED — affects info architecture; depends on Daniel review

### F-istoric-08 — Date format divergence

- **Severity:** LOW
- **Category:** Text
- **Mockup:** Format "Joi · Push (piept & umeri)" (Romanian weekday + name)
- **Prod:** `formatDate` returns `DD.MM.YYYY` (numeric only)
- **Mockup ref:** `andura-clasic.html:1164`
- **Prod ref:** `Istoric.tsx:13-19, 121`
- **Karpathy fix:** Surgical (rewrite formatDate using `Intl.DateTimeFormat('ro-RO', { weekday: 'long', day: 'numeric', month: 'short' })`)
- **Fix effort:** S
- **Beta blocker?** NO (Wave 2 — but Romanian locale honors product personality)

## Severity totals

| Severity | Count |
|----------|-------|
| CRIT | 2 (F-01 calendar heatmap absent, F-03 90-day ratings heatmap absent) |
| HIGH | 2 (F-05 sesiuni recente button, F-06 drill-down stack) |
| MED | 3 (F-02 labels jargon, F-04 ultima sesiune card, F-07 PR inline vs sub-route) |
| LOW | 1 (F-08 date format) |
| NIT | 0 |

**Total: 8 findings on Istoric screen.**

## Parity weighted score

- Layout: 30% (entire calendar heatmap missing + ratings heatmap missing + drill-down stack missing = 3 main sections absent out of ~5)
- Text: 60% (labels jargon + some text divergences)
- Components: 25% (calendar + ratings heatmap + drill-down stack + ultima sesiune card + recente button = 5 absent components; only stats grid + sessions list present — but stats grid labels wrong)
- Tokens: 75% (assuming bg-paper2 + border-line tokens used per pattern)
- Behavior: 60% (sessions list works + navigate to detail; calendar nav + heatmap nav absent)

**Istoric weighted parity:** 0.30 × 0.20 + 0.60 × 0.25 + 0.25 × 0.30 + 0.75 × 0.15 + 0.60 × 0.10
- = 0.06 + 0.15 + 0.075 + 0.1125 + 0.06
- **= 45.75% Istoric parity** (lowest so far — 2 CRIT entire-section-missing findings)
