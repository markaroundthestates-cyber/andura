# Findings — `screen-progres` (Wave A.4)

**Mockup ref:** `04-architecture/mockups/andura-clasic.html:1698-1836`
**Prod ref:** `src/react/routes/screens/progres/Progres.tsx:1-99`
**Audit date:** 2026-05-20

## Findings

### F-progres-01 — Subtitle TEXT divergence

- **Severity:** MED
- **Category:** Text
- **Mockup:** `Body composition · estimari calibrate.` (positions tab purpose as body comp focus)
- **Prod:** `Logheaza periodic - estimari calibrate.` (positions as logging-focused)
- **Mockup ref:** `andura-clasic.html:1701`
- **Prod ref:** `Progres.tsx:33`
- **Karpathy fix:** Surgical (text swap)
- **Beta blocker?** NO (Wave 2 — subtle positioning)

### F-progres-02 — Status TDEE/faza card structure divergence (rich vs strip)

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** Rich white card cu (a) Faza badge "Faza: Auto" cu colored dot + "Sapt. 3 / mesociclu" right + (b) "TDEE estimat 2 640 kcal · tinta 2 600" + (c) italic explainer "Engine calculeaza auto. Loghezi optional pentru calibrare reala."
- **Prod:** `<TDEEStrip />` component — implementation TBD Pass 2 verify; likely simpler strip without faza badge + mesocycle week + explainer
- **Mockup ref:** `andura-clasic.html:1703-1714`
- **Prod ref:** `Progres.tsx:36`
- **Karpathy fix:** Pass 2 TDEEStrip component inspection then enrich vs replace
- **Fix effort:** TBD (likely M — full card structure)
- **Beta blocker?** YES — faza badge + mesocycle week = key periodization signal; explainer = trust copy

### F-progres-03 — F3 Oboseala + F9 BMR 2-column grid strip MISSING

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** 2-col grid white cards: (a) "Oboseala azi 6/10 — Recuperare buna" + (b) "Calorii baza 1 850 kcal/zi — Repaus complet" — single-line key metric strip per Daniel reglaj LOCKED V1 "single number NU visual bar"
- **Prod:** `<FatigueStrip />` component — TBD Pass 2 verify if includes BMR or only fatigue
- **Mockup ref:** `andura-clasic.html:1716-1728`
- **Prod ref:** `Progres.tsx:37`
- **Karpathy fix:** Pass 2 FatigueStrip inspection; likely needs BMR side-by-side
- **Beta blocker?** YES — Mockup LOCKED V1 invariant 2-col strip; drift = visible

### F-progres-04 — Greutate snapshot 7z + mini-chart MISSING

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** Rich card cu (a) "Greutate (7 zile) 81.2 kg" + (b) "↓ 0.4 kg / 7z" green delta + (c) mini-chart 7 bars 32px height (rhythm visualization) + (d) link "Pentru analiza profunda → vezi Istoric › Greutate & BF"
- **Prod:** `<HeatMapWeekly />` component — TBD Pass 2 verify if it serves same purpose. Likely a heatmap NU bar-chart aligned with mockup intent
- **Mockup ref:** `andura-clasic.html:1730-1749`
- **Prod ref:** `Progres.tsx:38`
- **Karpathy fix:** Pass 2 HeatMapWeekly inspection vs mockup mini-chart bars
- **Beta blocker?** YES — weight visualization + delta + drill-down link to Istoric all surface key UX

### F-progres-05 — Greutate tinta card MISSING

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** Target weight card "Greutatea tinta 80.5 kg → estimat septembrie 2026"
- **Prod:** ABSENT
- **Mockup ref:** `andura-clasic.html:1751-1758`
- **Prod ref:** `Progres.tsx` (no equivalent)
- **Karpathy fix:** Surgical (new card component reading from profile store goal weight + ETA estimate)
- **Fix effort:** S
- **Beta blocker?** YES — goal-target visualization = motivation anchor

### F-progres-06 — Plan nutritie text card MISSING

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** Warm cream card "Plan nutritie · azi" + coach quote `"Protein-forward, carbohidrati moderati. La cina: legume + sursa proteica ~30g. Hidrateaza bine."`
- **Prod:** `<NutritionInline />` at bottom — TBD Pass 2 verify if includes daily plan text or just Kcal/Protein chips
- **Mockup ref:** `andura-clasic.html:1760-1764`
- **Prod ref:** `Progres.tsx:96`
- **Karpathy fix:** Pass 2 NutritionInline inspection
- **Beta blocker?** YES — coach voice copy = personality signal

### F-progres-07 — Alerte azi banner 3-rows MISSING

- **Severity:** CRIT
- **Category:** Component
- **Mockup:** Section "Alerte azi" cu 3 alert rows:
  1. calendar-x: "Saptamana asta ai sarit 2 antrenamente · Vrei sa discutam de ce?" — LOW_ADHERENCE
  2. minus: "Greutatile stau pe loc de 3 saptamani · E momentul sa schimbam putin programul" — STAGNATION
  3. trending-down: "Umerii ramasi in urma · Coach-ul adauga +2 seturi laterale" — LAGGING SIGNAL (FIX 4 2026-05-11)
- **Prod:** ABSENT (these alerts may exist in Antrenor as AlertsBanner / PatternsBanner — but mockup intent had them in Progres tab too)
- **Mockup ref:** `andura-clasic.html:1768-1774`
- **Prod ref:** `Progres.tsx` (no Alerte azi section)
- **Karpathy fix:** Think Before Coding (decide: dual-rendering în Antrenor + Progres OR consolidate Antrenor only?)
- **Fix effort:** M
- **Beta blocker?** YES — mockup explicit Daniel reglaj — F1 V1 alerts surface in Progres for body-comp context

### F-progres-08 — Logheaza greutate state-machine (unlogged/logged) PARTIAL

- **Severity:** MED
- **Category:** Component + Behavior
- **Mockup:** State machine 2-state: (a) NOT LOGGED = brick CTA "Logheaza greutate azi" + (b) LOGGED = white read-only card cu scale icon + value + Edit pencil button → goto('log-weight') pre-populated
- **Prod:** Only state A present — CTA always shows. Last weight shown as `last-weight-card` BELOW CTA but doesn't replace CTA + no Edit pencil reopen flow
- **Mockup ref:** `andura-clasic.html:1776-1797`
- **Prod ref:** `Progres.tsx:41-64`
- **Karpathy fix:** Surgical (state machine: if today's log exists → show logged card with Edit, else CTA)
- **Fix effort:** S
- **Beta blocker?** YES — Daniel review 2026-05-11 explicit state machine — current prod doesn't honor

### F-progres-09 — Nutrition chips (Kcal + Proteine) PARTIAL

- **Severity:** HIGH
- **Category:** Component
- **Mockup:** Nutrition chips Kcal + Proteine 2-col cu (a) LOCKED read-only chip + pencil edit + (b) tap pencil → input editable + Salveaza button appears + (c) "Auto din engine" tagline + footer copy "Auto target din engine. Apasa ✎ daca vrei sa loghezi manual."
- **Prod:** `<NutritionInline />` Pass 2 verify; likely similar but tests needed
- **Mockup ref:** `andura-clasic.html:1799-1834`
- **Prod ref:** `Progres.tsx:96`
- **Karpathy fix:** Pass 2 NutritionInline component inspection
- **Beta blocker?** YES — Daniel review 2026-05-11 LOCKED V1 chip pattern + Edit ✎ + Salveaza state machine

### F-progres-10 — Body data ("Masuratori corp") section is PROD-EXTRA NOT în mockup

- **Severity:** HIGH (drift)
- **Category:** Component
- **Mockup:** No body measurements section (waist/chest/hips/biceps/thigh) on Progres tab
- **Prod:** "Masuratori corp" CTA + sub-route `/app/progres/body-data` + last body data card display (Talie/Piept/Sold/Biceps/Coapsa cm)
- **Mockup ref:** N/A (intentional absence per mockup scope)
- **Prod ref:** `Progres.tsx:67-94`
- **Karpathy fix:** Daniel decision — keep prod (motivation source for some users) or remove to converge mockup
- **Fix effort:** S (remove) OR add to mockup as v1.1 spec
- **Beta blocker?** YES — feature drift visible to Daniel

### F-progres-11 — Footer line "Auto target engine + manual log optional + CSV batch import" MISSING

- **Severity:** MED
- **Category:** Text
- **Mockup:** Footer text below nutrition chips "Auto target engine + manual log optional + CSV batch import. Engine calibreaza din date reale."
- **Prod:** ABSENT
- **Mockup ref:** `andura-clasic.html:1834`
- **Prod ref:** `Progres.tsx` (no footer)
- **Karpathy fix:** Pass 2 NutritionInline (may be inside) OR surgical add
- **Beta blocker?** NO (Wave 2 — explainer copy)

## Severity totals

| Severity | Count |
|----------|-------|
| CRIT | 1 (F-07 Alerte azi 3-row banner missing) |
| HIGH | 7 (F-02 TDEE faza badge, F-03 fatigue+BMR strip, F-04 weight chart, F-05 target weight, F-06 nutrition plan card, F-09 nutrition chips state machine, F-10 body data drift) |
| MED | 3 (F-01 subtitle, F-08 weight state machine, F-11 footer) |
| LOW | 0 |
| NIT | 0 |

**Total: 11 findings on Progres screen.**

## Parity weighted score

- Layout: 50% (component stack mostly present but missing target weight + alerts banner; body-data drift)
- Text: 55% (subtitle off + plan nutritie quote missing + footer missing)
- Components: 35% (TDEEStrip + FatigueStrip + HeatMapWeekly + NutritionInline all need Pass 2 verify; AlertsAzi entirely missing; greutate tinta missing; weight state machine partial)
- Tokens: 70% (assuming components use brick + paper2 + line tokens per pattern)
- Behavior: 50% (log-weight CTA works; state machine NOT, Edit pencil flow missing; alerts CTA missing)

**Progres weighted parity:** 0.50 × 0.20 + 0.55 × 0.25 + 0.35 × 0.30 + 0.70 × 0.15 + 0.50 × 0.10
- = 0.10 + 0.1375 + 0.105 + 0.105 + 0.05
- **= 49.75% Progres parity**

## Verify pending (Pass 2 component-level)

- `components/Progres/TDEEStrip.tsx` — faza badge + mesocycle week + explainer
- `components/Progres/FatigueStrip.tsx` — 2-col strip cu BMR side-by-side
- `components/Progres/HeatMapWeekly.tsx` — bar chart vs heatmap divergence + weight delta + drill-down link
- `components/NutritionInline.tsx` — Kcal + Proteine chips state machine LOCKED/edit/save + plan nutritie text card
