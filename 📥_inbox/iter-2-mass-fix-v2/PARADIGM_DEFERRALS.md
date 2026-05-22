---
title: Iter 2 V2 — Paradigm Deferrals (Daniel CEO Decisions Required)
status: PENDING_DANIEL_CEO_DECISIONS
created: 2026-05-22
authority: post chat 3 MOCKUP-PARITY audit findings + primary-source verification 2026-05-22
parent_plan: ITER_2_PLAN.md
cross_refs:
  - DECISIONS.md §D046 (5 Daniel CEO decisions iter 1 BLOCKED resolved REVERSE 4 + SAME 1 — precedent reverse pattern paradigm decisions)
  - DECISIONS.md §D047 (D046 §3.1 ConfirmModal RIP-OUT correction — precedent Daniel CEO overrides Co-CTO mis-interpretation)
  - 📥_inbox/iter-2-mass-fix-v2/ITER_2_PLAN.md §6 (D-1 through D-7 Daniel decisions checklist)
  - 04-architecture/mockups/andura-clasic.html §screen-ceva-nu-merge + §screen-equipment-swap + §screen-pain-button (mockup DESIGN MASTER paradigm SSOT)
  - src/react/routes/screens/antrenor/CevaNuMerge.tsx + EquipmentSwap.tsx + PainButton.tsx (prod state HEAD verbatim)
---

# Paradigm Deferrals — Daniel CEO Decisions Required Iter 2

## §0 Scope + Precedent

3 paradigm-divergence findings surfaced chat 3 MOCKUP-PARITY audit require **Daniel CEO solely-decides** verdict per D046 + D047 precedent (Co-CTO autonomy LOCKED V1 D-LEGACY-079 covers tactical, NU UX paradigm choices contradicting DESIGN MASTER mockup).

**D046 §3 precedent pattern verbatim:** 5 paradigm/scope decisions surfaced morning 2026-05-21 → Daniel CEO verdict 4 REVERSE + 1 SAME (NU Co-CTO auto-pick) → D047 follow-up correction Daniel mis-interpretation Co-CTO. **Same precedent applies these 3 paradigm findings:** options/labels/mental models = product UX paradigm, Daniel CEO decides, Co-CTO surfaces tradeoffs neutrally.

**Verification protocol applied 2026-05-22:**
- Each finding primary source READ verbatim prod component HEAD
- Mockup screen READ verbatim from `andura-clasic.html` lines cited
- Verdict per finding: real-open (paradigm divergence confirmed) OR false-open (verified false alarm, promote ledger)

---

## §1 §F-ceva-nu-merge-01 — Options Count Paradigm Divergence (VERDICT: REAL-OPEN, inverted scope)

### Status verbatim chat 3 claim
- Chat 3 MOCKUP-PARITY claim: "Options count 1 vs 5 paradigm divergence" (score 0.7 NEAR per audit notes)
- Speculation chat 3 audit: "post §A001 closure may be FALSE OPEN"

### Verified primary source 2026-05-22

**Prod state (`src/react/routes/screens/antrenor/CevaNuMerge.tsx:29-36` HEAD verbatim):**
```typescript
const PROBLEM_OPTIONS: readonly ProblemOption[] = [
  { kind: 'pain', label: 'Ma doare ceva', Icon: Activity, target: 'pain-button' },
  { kind: 'equipment-busy', label: 'Aparate ocupate', Icon: Users, target: 'equipment-swap' },
  { kind: 'equipment-missing', label: 'Aparat lipsa', Icon: PackageX, target: 'aparate-lipsa' },
  { kind: 'override', label: 'Vreau alt antrenament', Icon: Shuffle, target: 'schedule-override' },
  { kind: 'cancel', label: 'Renunt azi', Icon: CircleX, target: 'antrenor' },
];
```
= **5 options total** (pain + equipment-busy + equipment-missing + override + cancel).

**Mockup state (`04-architecture/mockups/andura-clasic.html:1000-1009` verbatim):**
```
#screen-ceva-nu-merge:
  - Ma doare → goto('pain-button')
  - [Comment: "Nu am aparat" option REMOVED 2026-05-12 Slice 1.7 → moved to dedicated screen-aparate-lipsa per Daniel push-back]
  - Anuleaza → back()
```
= **2 options total** (Ma doare + Anuleaza, with REMOVED comment for "Nu am aparat").

### VERDICT: REAL-OPEN paradigm divergence (inverted direction)

**Chat 3 score 0.7 NEAR claim PARTIAL-CORRECT direction-inverted:**
- NU prod=1 vs mockup=5 (chat 3 implied prod lacking).
- Actual prod=5 vs mockup=2 = **PROD HAS MORE options than mockup**.
- Prod adds: equipment-busy + equipment-missing + override + cancel (with "Renunt azi" cancel label rather than mockup "Anuleaza").
- Mockup minimalist 2026-05-12 reduction (Daniel push-back: "aparat lipsa direct in exercitiu...butonul ala trebuie scos").

### Paradigm options Daniel CEO decides

**Option A — Align prod to mockup minimalist (drop 3 prod options):**
- Cost: ~30-60 min dev — strip 3 PROBLEM_OPTIONS entries + delete corresponding navigation routes (equipment-swap + aparate-lipsa + schedule-override entries from picker, screens themselves remain accessible via other paths if any) + update CevaNuMerge.test.tsx assertions.
- Benefit: respects mockup Daniel push-back history (Slice 1.7 minimalism principle). Pain-focused triage screen cleaner.
- Risk: dead-paths if equipment-swap + schedule-override + aparate-lipsa unreachable from any other UI → orphaned screens. Audit needed pentru entry-points pre-strip.

**Option B — Keep prod 5 options, update mockup (5 options = current Bugatti decision):**
- Cost: ~10-15 min mockup edit — restore 4 options in `screen-ceva-nu-merge` + add comment "post-§F-ceva-nu-merge-01 Daniel CEO REVERSE 2026-05-22 keep 5 options access multiple problem types triage primary navigation".
- Benefit: prod stays current behavior. Triage screen serves multi-problem-type entry point Bugatti consistency cu mental model "ceva nu merge → 5 ways things break".
- Risk: contradicts Slice 1.7 push-back precedent ("aparat lipsa direct in exercitiu"). Mockup DESIGN MASTER deviation requires explicit reverse decision.

**Option C — Hybrid: pain + override + cancel (3 options, drop equipment branches as Daniel push-back implied):**
- Cost: ~20-30 min dev — strip equipment-busy + equipment-missing entries (Daniel push-back semantic: equipment problems handled different surface NU triage), keep override (Daniel may want via triage) + pain + cancel.
- Benefit: respects Slice 1.7 push-back for equipment problems specifically + preserves prod-multi-problem-type entry intent for non-equipment.

### Bugatti recommendation Co-CTO

**Option B preserve prod 5 options + update mockup** — rationale:
1. Prod current behavior LANDED stable. Strip risks orphan screens audit cost > benefit.
2. Triage screen primary navigation entry-point Gigel mental model: "azi ceva nu merge → ce nu merge?" = multi-option natural.
3. Slice 1.7 push-back specifically excluded "Nu am aparat" (permanent state list separate semantic) NU all equipment problems. equipment-busy + equipment-missing temporary-state Bugatti distinct from aparate-lipsa permanent-state.
4. Mockup correction inexpensive (~10-15 min) vs strip-prod expensive (~30-60 min + orphan-audit + test re-write).

### Deferral reason

Mental model paradigm = product UX Daniel CEO decides. Slice 1.7 push-back history relevant. NU tactical Co-CTO autonomy scope per D-LEGACY-079.

---

## §2 §F-equipment-swap-01 — Per-Exercise Swap vs Global Toggle Paradigm (VERDICT: REAL-OPEN)

### Status verbatim chat 3 claim
- Chat 3 MOCKUP-PARITY claim: "4 alternatives per ex vs 5-item toggle paradigm" + "DIFFERENT mental models = paradigm CEO decision"

### Verified primary source 2026-05-22

**Prod state (`src/react/routes/screens/antrenor/EquipmentSwap.tsx:28-34` HEAD verbatim):**
```typescript
const INITIAL_EQUIPMENT: readonly EquipmentItem[] = [
  { id: 'bench', name: 'Bench press', status: 'available' },
  { id: 'smith', name: 'Smith machine', status: 'available' },
  { id: 'lat-pulldown', name: 'Lat pulldown', status: 'available' },
  { id: 'cable-row', name: 'Cable row', status: 'available' },
  { id: 'leg-press', name: 'Leg press', status: 'available' },
];
```
+ toggle UI marcheaza busy/available + handleContinue → workout-preview cu `equipmentContext: { busy }`.

= **Global 5-item equipment-status toggle list** ("Marcheaza ce e ocupat. Coach gaseste alternative.")

**Mockup state (`04-architecture/mockups/andura-clasic.html:1025-1041` verbatim):**
```html
#screen-equipment-swap:
  - Header "Schimba echipament"
  - Caption "Coach-ul propune un swap echivalent. Spune ce ai la indemana"
  - Display CURRENT exercise: "Impins inclinat haltera"
  - 4 ALTERNATIVES (per-exercise context):
    - Gantere → "Impins inclinat cu gantere"
    - Cablu / scripete → "Impins la cablu jos"
    - Banda elastica → "Extensii piept cu banda"
    - Doar greutate corp → "Flotari la inclinatie"
```
= **Per-exercise alternative swap** with current-exercise context displayed + 4 equipment-category alternatives proposing specific substitute movements.

### VERDICT: REAL-OPEN paradigm divergence

**Confirmed DIFFERENT mental models:**
- **Prod (global toggle):** "marcheaza ce APARATE OCUPATE sunt în sala" → coach scans entire session reroutes any exercise hitting marked aparate. Session-level adaptation.
- **Mockup (per-exercise swap):** "TU AI fix ASTA, propune swap pentru CURRENT exercise" → per-exercise alternative selection in moment. Exercise-level adaptation.

### Paradigm options Daniel CEO decides

**Option A — Align prod to mockup per-exercise swap paradigm:**
- Cost: ~3-6h dev — pivot EquipmentSwap.tsx complete:
  - Receive current-exercise context via `location.state` (entry-point: workout exercise card "Swap aparat" button NU Antrenor menu).
  - Display current-exercise name + image.
  - 4 alternatives per current-exercise equipment-category lookup engine.
  - handleSelect navigates back to workout cu replaced exercise.
  - Engine wire: alternatives engine cascade (D-LEGACY-038 Smart Routing Equipment v2 already supports).
- Benefit: mockup paradigm respected. Per-exercise mental model = clearer Gigel ("acum am ASTA, propune ALT"). Better matches Coach Engine #2 buildSession() alternative cascade design intent.
- Risk: removes session-level "aparate-ocupate-toata-sala" use case. Maria 65 may need session-level (NU per-exercise switch all session).

**Option B — Keep prod global-toggle paradigm + update mockup:**
- Cost: ~30-45 min mockup edit — pivot `screen-equipment-swap` to 5-item toggle list paradigm + add comment "Bugatti session-level paradigm REVERSE 2026-05-22 Daniel CEO — global toggle ce aparate-ocupate session-wide simpler Maria 65 mental model".
- Benefit: prod LANDED + Engine integration already wired equipmentContext path. Lower change cost.
- Risk: mockup DESIGN MASTER deviation. Mockup paradigm "per-exercise context" arguably superior mental model Gigel scenarios.

**Option C — Hybrid: both paradigms accessible (entry-points distinct):**
- Cost: ~6-10h dev — keep prod EquipmentSwap.tsx global-toggle (Antrenor menu entry) + add NEW EquipmentSwapPerExercise screen for in-workout exercise card "Swap" button (per-mockup) + extend Engine cascade pentru both call sites + route + tests.
- Benefit: covers both use cases (session-level prep + per-exercise mid-workout adapt).
- Risk: paradigm complexity. Two screens to maintain. Gigel confusion: "care 'Schimba echipament' ma duce unde?"

### Bugatti recommendation Co-CTO

**Option A pivot to per-exercise paradigm** — rationale:
1. Mockup DESIGN MASTER explicit paradigm choice 2026-05-11 (Bugatti: "presets > liber. Force coach-driven taxonomy clear" comment line 1011 PainButton scope but principle aplicabil equipment).
2. Mockup paradigm aligns Coach Engine #2 buildSession() alternative cascade design intent — engine outputs per-exercise alternatives natural, NU session-level filter.
3. Per-exercise mental model Gigel clearer: when "Impins inclinat haltera" appears și e ocupat → swap button → ALTERNATIVES propose immediate.
4. Global toggle paradigm prod redundant cu "aparate-lipsa" permanent-state list (D-LEGACY-038 Smart Routing). Two surfaces same intent NU Bugatti consistency.
5. Cost ~3-6h justifiable pre-Beta Bugatti substrate clean ("Refactor later NEVER happens" D-LEGACY-079 spirit applies UX too).

### Deferral reason

Mental model paradigm = product UX Daniel CEO decides. Engine integration impact pivot. Mockup DESIGN MASTER paradigm explicit (per-exercise) prod diverged (global toggle) — reverse decision required pre Bugatti substrate clean.

---

## §3 §F-pain-button-01 — 15 Regions + Intensity vs 3 Pain Types Paradigm (VERDICT: REAL-OPEN)

### Status verbatim chat 3 claim
- Chat 3 MOCKUP-PARITY claim: "3 types vs 15 regions + intensity paradigm" + "Daniel reglaj unresolved per chat 3 audit notes"

### Verified primary source 2026-05-22

**Prod state (`src/react/routes/screens/antrenor/PainButton.tsx:48-70` HEAD verbatim):**
- 15 BodyRegion union (gat / umar-stang / umar-drept / spate / lombar / piept / cot-stang / cot-drept / incheietura-stanga / incheietura-dreapta / sold / genunchi-stang / genunchi-drept / glezna-stanga / glezna-dreapta)
- 3-level intensity (1 Usor / 2 Mediu / 3 Sever)
- 2-step UI: grid 2-cols region picker + intensity row + "Continui adaptat" + "Salveaza si iesi" escape
- propagation: `painContext: { region, intensity }, intensityMod: 'minus'` via location.state → workout-preview

= **15-region body picker + 3-intensity level taxonomic dimensional approach** (region × intensity = 45-cell semantic).

**Mockup state (`04-architecture/mockups/andura-clasic.html:1011-1023` verbatim):**
```html
#screen-pain-button:
  - Header "Ma doare ceva"
  - Caption "Coach-ul reduce intensitatea sau schimba exercitiul. Spune ce simti:"
  - 3 PAIN TYPES (functional taxonomy):
    - Durere acuta → "Stop imediat exercitiu, swap sigur" (icon: zap, color: brick)
    - Disconfort articulatie → "Reducem amplitudine + greutate" (icon: bone)
    - Oboseala extrema → "Taiem volum 30% astazi" (icon: battery-low)
  - Italics footer "Daca nu se potriveste niciuna, opreste sesiunea si consulta un medic."
  - [Comment line 1011: "3 predefined — free text Altceva REMOVED 2026-05-11 (Bugatti: presets > liber. Force coach-driven taxonomy clear)"]
```
= **3 pain-type functional taxonomy** (descriptive symptoms + coach-driven adaptation explained).

### VERDICT: REAL-OPEN paradigm divergence

**Confirmed DIFFERENT mental models:**
- **Prod (15 regions + 3 intensity):** anatomical-coordinate model "WHERE on body + HOW SEVERE" → engine computes adaptation per region+intensity matrix. Dimensional precision approach.
- **Mockup (3 functional types):** symptomatic-functional model "WHAT KIND of pain" → predetermined adaptation per type (acuta=stop, articulatie=reduce, oboseala=cut volume). Coach-driven taxonomy approach.

Cross-ref D-LEGACY-035 Pain/Discomfort Button architecture CDL override pattern: ADR original intent NU specified region vs type paradigm explicit — Phase 3 prod implementation chose dimensional, mockup chose functional 2026-05-11 Bugatti push-back.

### Paradigm options Daniel CEO decides

**Option A — Align prod to mockup 3-type functional paradigm:**
- Cost: ~2-4h dev — pivot PainButton.tsx complete:
  - Remove 15-region body picker + intensity selector
  - Replace cu 3-type list (Durere acuta / Disconfort articulatie / Oboseala extrema) cu icons + adaptation labels
  - propagation: `painContext: { type: 'acuta' | 'articulatie' | 'oboseala' }` via location.state
  - Engine wire pivot: CDL override switch on type (acuta = stop swap-sigur, articulatie = reduce amplitude+weight, oboseala = cut volume 30%)
  - Update PainButton.test.tsx assertions
- Benefit: mockup paradigm Bugatti push-back 2026-05-11 explicit "presets > liber. Force coach-driven taxonomy clear" respected. Simpler Gigel mental model (3 options vs 45-cell matrix). Adaptation explained per option (educational + transparent NU black-box).
- Risk: loses anatomical-coordinate precision data. Engine #N future expansion (specific exercise avoidance per region) requires re-collection. Marius performant la sala may want region-specific (umar stang vs drept).

**Option B — Keep prod 15-region + intensity paradigm + update mockup:**
- Cost: ~45-90 min mockup edit — pivot `screen-pain-button` to 15-region grid + 3-intensity paradigm + add comment "Bugatti anatomical-coordinate paradigm REVERSE 2026-05-22 Daniel CEO — region precision pentru Engine #N exercise avoidance future expansion + Marius performant la sala region-specific need".
- Benefit: prod LANDED + Engine #N future-proof dimensional precision. Better matches D-LEGACY-035 ADR CDL override semantic (region-specific exercise avoidance).
- Risk: contradicts 2026-05-11 Bugatti push-back ("presets > liber. Force coach-driven taxonomy clear"). Mockup DESIGN MASTER deviation. Gigel mental model 45-cell complex.

**Option C — Hybrid: 3-type primary + region/intensity drill optional:**
- Cost: ~4-6h dev — keep mockup 3-type primary picker as PainButton.tsx default + drill-down secondary screen PainRegionDetail.tsx pentru optional region+intensity post type-selection (only "Disconfort articulatie" drills region; "Durere acuta" + "Oboseala extrema" skip region).
- Benefit: Gigel simple path (3 types). Marius advanced path (drill region). Adaptation transparent + future-proof.
- Risk: paradigm complexity 2-screen flow. Drill optional adds friction. Gigel may skip drill miss region data engine needs.

### Bugatti recommendation Co-CTO

**Option A pivot to 3-type functional paradigm** — rationale:
1. Mockup DESIGN MASTER 2026-05-11 explicit Bugatti push-back comment line 1011: "presets > liber. Force coach-driven taxonomy clear" — paradigm intent codified.
2. D-LEGACY-061 anti-paternalism absolute: 3-type cu explanation ("Reducem amplitudine + greutate") = transparent NU paternalistic black-box adapt.
3. Gigel mental model 3 options >> 45-cell anatomical matrix. Maria 65 ageing UX 15-region grid touch-target dense.
4. Engine #N region-specific exercise avoidance speculation post-Beta — NU pre-Beta scope per D-LEGACY-051 Pre-Beta FULL Scope LOCK V2 actual scope. Anatomical precision premature optimization.
5. D-LEGACY-035 ADR CDL override pattern semantic preserved with type-driven override (acuta=stop-sigur, articulatie=reduce-amplitude, oboseala=cut-volume) — engine layer maps type → adaptation rule (NU region+intensity → adaptation matrix).
6. Cost ~2-4h moderate pre-Beta Bugatti substrate clean acceptable.

### Deferral reason

Pain UX paradigm = product UX Daniel CEO decides. Safety-critical surface (medical adjacent) Daniel CEO accountability. D-LEGACY-035 CDL override pattern semantic preserved either paradigm but UX surface diverged 2026-05-11 mockup vs Phase 3 prod implementation. Reverse decision required pre Bugatti substrate clean.

---

## §4 Cross-cutting precedent + Daniel decision protocol

### D046 + D047 pattern verbatim 2026-05-21

5 paradigm/scope decisions surfaced morning → Daniel CEO single review session → 4 REVERSE (OAuth Cluster E + Kalman + LARGE refactor + Bundle ASAP) + 1 SAME (ConfirmModal — subsequently CORRECTED D047 RIP-OUT post mis-interpretation Co-CTO). Pattern:
1. Co-CTO surface tradeoffs neutral, NU pick silently.
2. Daniel CEO reads options, decides per Bugatti + Gigel-test + Marius/Maria filter + product brand-promise (e.g., D046 Kalman "PRIMER §2 brand-promise must be REAL working").
3. Decisions LOCKED V1 DECISIONS.md append. Tasks unblock per decision domain.

### Decision dependencies + scope impact

**§F-ceva-nu-merge-01 decision** → directly affects:
- `src/react/routes/screens/antrenor/CevaNuMerge.tsx` 5 PROBLEM_OPTIONS scope (strip-3 vs keep-5 vs hybrid-3)
- Mockup `04-architecture/mockups/andura-clasic.html:1000-1009` (update if Option B chosen)
- CevaNuMerge.test.tsx assertions
- Possible orphan-screens audit (equipment-swap + schedule-override + aparate-lipsa entry-points)

**§F-equipment-swap-01 decision** → directly affects:
- `src/react/routes/screens/antrenor/EquipmentSwap.tsx` complete paradigm pivot if Option A or C
- Engine Coach #2 buildSession() alternative cascade wiring (D-LEGACY-038)
- workout-preview consumer signature
- Entry-point: workout exercise card "Swap" button (NEW if Option A or C)
- EquipmentSwap.test.tsx complete re-write

**§F-pain-button-01 decision** → directly affects:
- `src/react/routes/screens/antrenor/PainButton.tsx` complete paradigm pivot if Option A or C
- Engine CDL override pattern semantic (type vs region+intensity matrix)
- workout-preview consumer signature (painContext shape change)
- PainButton.test.tsx complete re-write
- Safety-critical implications (medical-adjacent surface)

### Recommended execution timing

**ZERO unblock pre Daniel CEO 3-decision-batch verdict.** Per D046 precedent pattern: Daniel CEO reviews `PARADIGM_DEFERRALS.md` single session (~30-45 min reading + 3 decisions) → ITER_2_PLAN.md §6 D-X entries appended with verdicts → DECISIONS.md append D050 (or next number) LOCKED V1 "3 paradigm-divergence findings iter 2 resolved REVERSE/SAME" → tasks pour into Wave B-1 execution batch per decision.

### Anti-overreach guard

Co-CTO NU pick silently. Per CLAUDE.md regula #5 SURFACE TRADEOFFS + D-LEGACY-079 Co-CTO autonomy LOCKED V1 PERMANENT scope tactical NU UX paradigm. Recommendation surfaced (Bugatti Co-CTO reasoning) BUT Daniel CEO solely decides per D046 + D047 precedent.

---

## §5 Verification audit trail

| Finding | Chat 3 claim | Primary source verified 2026-05-22 | Verdict |
|---------|--------------|-------------------------------------|---------|
| §F-ceva-nu-merge-01 | 1 vs 5 paradigm (score 0.7 NEAR) | Prod 5 options vs mockup 2 options | REAL-OPEN (direction inverted) |
| §F-equipment-swap-01 | 4 alternatives per-ex vs 5-item toggle | Prod 5-item global toggle vs mockup 4 per-exercise alternatives | REAL-OPEN |
| §F-pain-button-01 | 3 types vs 15 regions + intensity | Prod 15 regions × 3 intensity vs mockup 3 functional pain types | REAL-OPEN |

**Sources cited verbatim:**
- `src/react/routes/screens/antrenor/CevaNuMerge.tsx:29-36`
- `src/react/routes/screens/antrenor/EquipmentSwap.tsx:28-34`
- `src/react/routes/screens/antrenor/PainButton.tsx:48-70`
- `04-architecture/mockups/andura-clasic.html:1000-1009` (ceva-nu-merge)
- `04-architecture/mockups/andura-clasic.html:1011-1023` (pain-button)
- `04-architecture/mockups/andura-clasic.html:1025-1041` (equipment-swap)

**Anti-hallucination:** All claims grep-verified primary source HEAD 2026-05-22. NU recall NU speculation. Per CLAUDE.md regula #1 THINK BEFORE CLAIMING + D008 anti-stale-baseline + D049 Karpathy TBC commit subject diff alignment.

---

**Awaiting Daniel CEO 3-paradigm-decision batch review per D046 precedent. Tasks Iter 2 Wave B-1 blocked pe verdicts until single-session decisions captured DECISIONS.md append.**
