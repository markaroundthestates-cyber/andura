# Pass 2 — Progres sub-components deep-dive

## TDEEStrip (`src/react/components/Progres/TDEEStrip.tsx` — 58 LOC)

### F-pass2-tdeestrip-01 — Faza badge + mesocycle week MISSING

- **Severity:** HIGH
- **Mockup:** Top row badge "Faza: Auto" cu colored dot + "Sapt. 3 / mesociclu" — periodization context
- **Prod:** Only "Target azi" label — no faza, no mesocycle week
- **Mockup ref:** `andura-clasic.html:1705-1708`
- **Prod ref:** `TDEEStrip.tsx:41-43`
- **Karpathy fix:** Add Faza pill + sapt counter read from periodization engine
- **Beta blocker?** YES — periodization signal anchor

### F-pass2-tdeestrip-02 — Tinta value comparison MISSING

- **Severity:** MED
- **Mockup:** Format "2 640 kcal · tinta 2 600" (current vs target comparison)
- **Prod:** Format "{kcal} kcal · {protein} g proteine" (kcal + protein no tinta delta)
- **Mockup ref:** `andura-clasic.html:1711`
- **Prod ref:** `TDEEStrip.tsx:44-49`
- **Karpathy fix:** Add tinta value vs estimate delta
- **Beta blocker?** MED

### F-pass2-tdeestrip-03 — Italic explainer copy MISSING

- **Severity:** MED
- **Mockup:** Italic explainer `Engine calculeaza auto. Loghezi optional pentru calibrare reala.`
- **Prod:** Only source label tag ("Setat manual" / "Estimare adaptiva" / "Estimare initiala") — less context
- **Beta blocker?** NO (Wave 2)

**TDEEStrip parity: 55%** (engine-wired ✓ but missing faza + tinta + explainer)

---

## FatigueStrip (`src/react/components/Progres/FatigueStrip.tsx` — 45 LOC)

### F-pass2-fatiguestrip-01 — Score scale divergence (0-100 vs 0-10)

- **Severity:** HIGH
- **Mockup:** "Oboseala azi 6/10 — Recuperare buna" (0-10 scale, intuitive)
- **Prod:** "Oboseala azi {score}/100 · {label}" (0-100 scale, technical)
- **Mockup ref:** `andura-clasic.html:1720-1721`
- **Prod ref:** `FatigueStrip.tsx:25-29`
- **Karpathy fix:** Scale convert score/10 OR Daniel decision keep 100-scale + amend mockup
- **Beta blocker?** YES — UX scale convention divergence

### F-pass2-fatiguestrip-02 — Calorii baza BMR side-by-side MISSING

- **Severity:** HIGH
- **Mockup:** 2-col strip — Oboseala + Calorii baza (BMR) "1 850 kcal/zi" side-by-side
- **Prod:** FatigueStrip stands alone, no BMR alongside (FatigueStrip + TDEEStrip stacked vertical)
- **Mockup ref:** `andura-clasic.html:1717, 1723-1727`
- **Prod ref:** Antrenor stack order or separate component needed
- **Karpathy fix:** Add BMRStrip component OR merge BMR into FatigueStrip 2-col layout
- **Beta blocker?** YES — Daniel LOCKED V1 invariant "single number NU visual bar" 2-col pattern

### F-pass2-fatiguestrip-03 — Label divergence ("Recuperare buna" vs label semantics)

- **Severity:** MED
- **Mockup:** Sub-label "Recuperare buna" (descriptive)
- **Prod:** `{label}` from engine (PEAK_FORM/NORMAL/MODERATE_FATIGUE/HIGH_FATIGUE — 4-state)
- **Karpathy fix:** Translate engine labels to Romanian human-friendly
- **Beta blocker?** YES — Romanian no-jargon LOCK V1

**FatigueStrip parity: 45%** (engine-wired ✓ but scale + BMR + Romanian labels divergent)

---

## HeatMapWeekly (`src/react/components/Progres/HeatMapWeekly.tsx` — 60+ LOC)

### F-pass2-heatmap-01 — Paradigm divergence (mockup = WEIGHT 7-bar chart, prod = VOLUME 7-day heatmap)

- **Severity:** CRIT
- **Mockup:** Greutate snapshot 7-day mini-chart cu vertical bars showing daily weight + delta `↓ 0.4 kg / 7z` green + drill-down link to "Istoric › Greutate & BF"
- **Prod:** Volume heatmap 7-day cu brick intensity buckets (0/33/66/100%) showing workout volume per day — different metric, different visualization
- **Mockup ref:** `andura-clasic.html:1731-1749`
- **Prod ref:** `HeatMapWeekly.tsx:1-60+`
- **Karpathy fix:** Daniel decision — replace HeatMapWeekly cu WeightChartWeekly OR amend mockup to volume-heatmap (workout-volume might be more actionable signal anyway). Plus weight chart can be NEW component.
- **Beta blocker?** YES — paradigm divergence; weight chart was mockup intent for Progres tab

### F-pass2-heatmap-02 — Weight delta + drill link MISSING

- **Severity:** HIGH
- **Mockup:** Green delta "↓ 0.4 kg / 7z" + drill link "Pentru analiza profunda → vezi Istoric › Greutate & BF"
- **Prod:** No delta, no drill link
- **Karpathy fix:** Cumulative cu F-pass2-heatmap-01
- **Beta blocker?** YES

**HeatMapWeekly parity: 30%** (paradigm-level mismatch — different metric measured)

---

## NutritionInline (`src/react/components/NutritionInline.tsx` — 80+ LOC sampled)

### F-pass2-nutrition-01 — Mockup verbatim COMMITMENT (positive finding)

- **Severity:** OK
- **Mockup:** Comprehensive section "Nutritie · azi" cu 2 chips Kcal + Proteine LOCKED/edit/Salveaza state machine + Auto din engine sub-labels + helper copy + footer
- **Prod:** Code comment explicit "WORDING all mockup verbatim" cu listed copy preservation. Engine wired `getNutritionTargetTodayReal` + manual override via `useNutritionStore`. State machine kcalEdit/proteinEdit + drafts
- **Karpathy:** Highest-fidelity component sampled — mockup verbatim commitment + engine wire + state machine all present
- **Beta blocker?** N/A — compliance verified

### F-pass2-nutrition-02 — Section header position MISSING (verify Pass 2 deeper)

- **Severity:** LOW
- **Mockup:** `Nutritie · azi` section heading above chips
- **Prod:** TBD verify section heading în NutritionInline rendered or external to component
- **Beta blocker?** NO

**NutritionInline parity: 80% est** (highest among Progres components — explicit mockup verbatim commitment)

---

## Pass 2 Progres sub-components summary

| Component | Engine wire? | Parity | CRIT |
|-----------|--------------|--------|------|
| TDEEStrip | ✓ real | 55% | 0 |
| FatigueStrip | ✓ real | 45% | 0 |
| HeatMapWeekly | ✓ real but paradigm mismatch | 30% | 1 (paradigm) |
| NutritionInline | ✓ real cu mockup verbatim | 80% | 0 |

**Progres Pass 2 4 components: ~52.5% mean parity** (NutritionInline saves average; HeatMapWeekly drops it).

**Key insight:** Unlike CoachTodayCard (HARDCODED placeholder), ALL 4 Progres components ARE engine-wired cu real data. Issues are LAYOUT/COPY/PARADIGM rather than missing data. Different fix profile — surgical text/layout changes vs full component build.

**Combined Pass 2 sample (8 components):**

| Component | Parity |
|-----------|--------|
| SessionTimer | 45% |
| RestOverlay | 30% |
| CoachTodayCard | 30% |
| Calendar7Day | 70% |
| TDEEStrip | 55% |
| FatigueStrip | 45% |
| HeatMapWeekly | 30% |
| NutritionInline | 80% |

**Mean Pass 2 sample: 48.1% parity** (close to Pass 1 mean 49.6% — consistent verdict).
