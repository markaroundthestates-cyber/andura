# HANDOVER INPUT — Sesiune Chat Strategic 2026-05-02

**Owner:** Daniel (CEO + Product). Claude Co-CTO chat strategic.
**Status:** SSOT input. Merge în `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` (sau next dated SSOT) per `VAULT_RULES §HANDOVER_PROTOCOL`.
**Data:** 2026-05-02 (post chat strategic safety nutrition pattern + 4 templates programe v1).
**Scope:** Safety nutrition pattern (kcal floor + protein floor + threshold logic + surplus optimization) + 4 templates programe v1 lockate (Slăbire majoră / Slăbire moderată / Tonifiere baseline + 3 sub-variants / Sănătate Generală) + decizii arhitecturale + amendamente backlog Sprint 4.x.

---

## 0. STATUS UPDATE — 2026-05-02

### Decizii product strategice extra (5 LOCKED non-vault dinainte de sesiune)

1. **Launch strategy:** full launch peste tot market-ul, NU hand-pick balene. Bugatti unitar matchează vision "oricine, orice categorie". Reconsider abordare — posibil înlocuit cu launch full + content marketing organic (TikTok aesthetic-glutes Gigica + r/longevity Gigel + FB Mompreneur Slăbire). Decizie finală în sesiune dedicată distribution strategy.
2. **Slăbire majoră safety pattern LOCKED (MFP-style):** source autoritate medicală EXTERNĂ citată (NU "SalaFull recomandă") + threshold gendered conditional pe sex + engine consequence concret + user agency păstrat (soft warning + continue, NU block) + pattern reusable orice safety boundary nutrition.
3. **Legal coverage realitate:** Pattern MFP + ADR 013 SAFETY_TRIPWIRE + ToS + Privacy Policy + onboarding medical conditions = ~80-90%. Restul 10-20% = consultanță legală tech specializată RO/EU pentru ToS final + Privacy Policy specific. Cost real €500-2000 NU optional. Flag pre-launch checklist obligatoriu.
4. **Realist rămas până la launch v1:** ~5-6 sesiuni chat strategic + plan complet ÎNAINTE execuție = unlock velocity beast Opus 24-36×. Confirmat sesiune asta — 19 decizii LOCKED în ~3h.
5. **Anthropic dependency risk ~0.1% acceptat.**

### Decizii LOCKED sesiune asta (19 total)

**Safety patterns nutrition (7):**
1. Surplus-side = Optimization NU Safety. Threshold engine internal >0.5%/săpt bodyweight gain. Wording observativ: "Ritmul de creștere a greutății este mai alert decât cel planificat. Ne asigurăm că progresul rămâne pe dezvoltarea de masă musculară, nu pe acumularea de grăsime."
2. Deficit kcal floor = 1200F / 1500M static. Sources: NIH + EFSA. Pattern: 2 nivele soft warning, ZERO Hard Wall, agency 100%, buton "Înțeleg, merg mai departe"
3. Threshold L2 = 3 zile consecutive. Rationale = pattern detection (1 zi noise / 2 volatile / 3 trend), NU fiziologie speculative
4. Wording L2 dual variant: cu training detected în window vs fără
5. Protein floor = 1.6 g/kg dynamic (user_weight × 1.6). Source: ISSN. Pattern identic 2 nivele soft. Onboarding nudge simplu fără food examples
6. Authority allocation: EFSA + NIH pe kcal / ISSN pe protein. Asymmetry intenționat documentat
7. Hidratare = drop safety pattern, rămâne observational simplu în proactiveEngine ("Nivelul de hidratare de azi e sub țintă...")

**Templates programe v1 (4 lockate, 4 sub-variants Tonifiere = 5 design units):**
8. Slăbire majoră (>15kg) — full V1 spec
9. Slăbire moderată (<15kg) — full V1 spec
10. Tonifiere baseline + 3 sub-variants (Echilibrat / Picioare-Fesieri 70/30 lower / Superior 70/30 upper) — full V1 spec
11. Sănătate Generală — full V1 spec

**Backlog items v2 / Sprint 4.x (5):**
12. Backlog Sprint 4.x: Secondary Check >25% deficit maintenance refinement (deficit kcal pattern fragility static floor)
13. Backlog v2: Seated core override Slăbire majoră (Bird-Dog/Plank → Seated Knee Raises/Wood Chops dacă feedback dificultate tranziție sol)
14. Backlog v2: LISS ramp-down Slăbire majoră (15min → 8-10min săpt 3+, time mutat în Main Work)
15. Backlog Sprint 4.x: Exercise substitution system ADR separat (dynamic slotting Tonifiere — user picks variant, engine progresie comparable)
16. Backlog Sprint 4.x: Tonifiere Advanced Track 5-day (a 5-a sesiune optional weak points)

**Decizii arhitecturale colaterale (3):**
17. Onboarding: ZERO întrebări comorbidities/medical screening (Gigel test catastrofal — bloodwork rejected analog). Templates presupun limitări implicit.
18. Engine routing: Slăbire majoră user BMI 30 cu 18kg target = template low-impact aplicat conservative-by-default, R8 voice weights ramp up via standard flow dacă prea ușor
19. Anti-RE strict: pragul 0.5%/săpt + protein 1.6 g/kg + 25% deficit = engine internal, NU exposed user-facing. User vede grame absolute calculate, NU formulele

### Status v1 templates

5/8 templates lockate (62.5%). Rămase: Forță & Dezvoltare + Longevitate + Sănătate Generală sub-variants potențial. Tonifiere counted ca 1 baseline cu 3 sub-variants split.

---

## 1. SAFETY NUTRITION PATTERN — Full Spec

### 1.1 Surplus-side (Optimization, NU Safety)

**Decizie:** drop surplus-side din safety pattern. Mutat în engine optimization layer.

**Rationale:**
- NU există threshold "kcal max peste care periculos" omologat medical. Citarea autoritate "3500 kcal periculoase" = minciună grosolană.
- Risk real surplus = calitate macro + rate of weight gain, NU absolute kcal.
- Forță bulk Gigel test: "user adult vrea masă musculară, mănâncă 3500 kcal, ce-mi spune app cu autoritate medicală că e periculos?". NU. Forțezi narrative safety unde nu există → trust hit + paternalism.

**Implementation engine:**
- Threshold internal: rate of bodyweight gain >0.5%/săpt (sport science consensus Lyle McDonald, Helms et al. — 0.25-0.5% beginners, 0.1-0.25% intermediate)
- NU exposed user-facing — anti-RE strict
- Wording observativ unic (NU presupune logging nutriție):

> "Ritmul de creștere a greutății este mai alert decât cel planificat. Ne asigurăm că progresul rămâne pe dezvoltarea de masă musculară, nu pe acumularea de grăsime."

### 1.2 Deficit-side kcal floor (Safety)

**Threshold:** 1200 kcal/zi femei / 1500 kcal/zi bărbați (static, gendered).

**Sources:**
- NIH (Institute of Medicine) — sursa originară 1200/1500, confirmată Harvard Health, Hackensack Meridian, Healthline
- EFSA — referință juridică UE pentru maintenance + DRV (NU acoperă floor concret, dar relevant juridic)

**Pattern: 2 nivele soft warning, ZERO Hard Wall.**

**Nivelul 1: Soft Warning la Setări / Onboarding**

Declanșator: user încearcă să configureze țintă sub {threshold} kcal.

Wording:
> "O țintă sub {threshold} kcal este sub recomandările EFSA și NIH pentru un adult. Îți susținem decizia, dar te încurajăm să monitorizezi energia și refacerea."

Buton confirmare:
> "Înțeleg, merg mai departe"

**Nivelul 2: Soft Warning în Timpul Utilizării (3 Zile Trend)**

Declanșator: aport caloric înregistrat sub {threshold} kcal timp de 3 zile consecutive.

Threshold rationale = pattern detection (1 zi noise / 2 volatile / 3 trend confirmat), NU fiziologie speculative (drop "glicogen depletion serios" rationale).

Wording dual variant conditional pe training detected în window:

**Varianta A (cu training detectat — planned sau logged):**
> "Aportul caloric înregistrat în ultimele 3 zile este sub {threshold} kcal. Cu antrenament în program, corpul are nevoie de combustibil pentru refacere."

**Varianta B (fără training în window):**
> "Aportul caloric înregistrat în ultimele 3 zile este sub {threshold} kcal. Verifică dacă ai resurse suficiente pentru ziua de azi."

**Reguli implementare:**
- `{threshold}` = 1200 sau 1500, dynamic pe sex biologic onboarding
- Buton "Salvare" rămâne ACTIV în setări (agency 100%, ZERO disabled state)
- Anti-RE: NU expunem percentages deficit, NU formulele matematice, doar valoarea fixă kcal + argumentul medical

**Backlog Sprint 4.x: Secondary Check >25% deficit maintenance** (refinement floor static fragility — femeie 95kg cu floor 1200 = deficit 40% maintenance, periculos chiar dacă peste floor. Engine flag suplimentar dincolo de floor static).

### 1.3 Deficit-side protein floor (Safety)

**Threshold:** 1.6 g/kg bodyweight, dynamic (user_weight × 1.6, rotunjit întreg).

**Source:** ISSN (International Society of Sports Nutrition) Position Stand on Protein. Match perfect contextul sport + deficit (range 1.4-2.0 g/kg). NU EFSA (RDA 0.83 g/kg = sedentar maintenance, nu se aplică deficit context). NU ACSM (limita inferioară 1.2 prea mică).

**Pattern: identic 2 nivele soft warning kcal.**

**Onboarding nudge (simplificat, fără food examples):**

Apare o singură dată în onboarding la configurare obiective Slăbire/Tonifiere:

> "Pentru a-ți păstra masa musculară în timpul procesului, recomandăm minimum {protein_threshold}g de proteine pe zi."

NU listăm surse alimentare (carne/ouă/lactate) — scope creep nutrition coaching + cultural friction RO (vegetarian/vegan signal app NU pentru ei). User deduce singur sursele.

**Nivelul 1: Soft Warning la Setări / Schimbare Obiectiv**

Declanșator: user vrea să configureze țintă proteine sub 1.6 g/kg.

Wording:
> "O țintă sub {protein_threshold}g de proteine pe zi este sub recomandările ISSN (International Society of Sports Nutrition) pentru sportivi în deficit caloric. Îți susținem decizia, dar te încurajăm să monitorizezi energia și refacerea."

Buton: "Înțeleg, merg mai departe"

**Nivelul 2: Alertă Trend 3 Zile**

Declanșator: aport proteine sub {protein_threshold}g timp de 3 zile consecutive.

Wording:
> "Aportul de proteine a fost sub {protein_threshold}g în ultimele 3 zile. Corpul are nevoie de aminoacizi pentru a repara și a menține masa musculară după efort."

**Reguli implementare:**
- `{protein_threshold} = user_weight * 1.6` (rotunjit întreg)
- Buton "Salvare" ACTIV (agency totală)
- Anti-RE: NU expunem formula 1.6 g/kg în UI, doar valoarea calculată în grame

### 1.4 Hidratare — Drop Safety Pattern

**Decizie:** hidratarea NU primește safety pattern dedicat. Rămâne observational simplu în `proactiveEngine.js` per Batch 3 evening §27.3:

> "Nivelul de hidratare de azi e sub țintă. Un pahar de apă înainte de antrenament ajută."

**Rationale:** zero threshold dehydration cu literature solid pentru fitness app context (variabilitate masivă greutate/clima/efort/dietă). Nu există autoritate citabilă pentru "minimum apă/zi safety". Forțezi pattern unde nu există → noise + trust hit.

### 1.5 Authority Allocation Summary

| Domeniu | Autorități citate | Threshold |
|---------|-------------------|-----------|
| Kcal floor (deficit) | NIH + EFSA | 1200F / 1500M static |
| Protein floor (deficit) | ISSN | 1.6 g/kg dynamic |
| Surplus rate | (engine internal) | >0.5%/săpt bodyweight |
| Hidratare | (NU safety pattern) | Observational only |

Asymmetry NIH+EFSA pe kcal vs ISSN pe protein = INTENȚIONAT. Fiecare autoritate aplicată unde acoperă concret contextul. Forțarea aceleiași autorități cross-domain = semantic noise + legal coverage slab.

---

## 2. TEMPLATES PROGRAME V1 — Full Spec

### 2.1 Template: Slăbire Majoră (>15kg target)

**User profile target:**
- Routing per §26.3 = >15kg target slăbire (NU BMI-based — BMI variabil 28-45+)
- Vârstă: 25-65 ani (plajă largă, adaptări volum implicit)
- Background: sedentar 3-5+ ani (capacity efort scăzută, țesuturi conjunctive necondiționate)
- Comorbidități typical (NU întrebate user-facing): dureri articulare, toleranță scăzută căldură, tensiune oscilantă
- Template construit conservative-by-default presupunând aceste limitări

**Parametri high-level:**
- Frecvență: 3 sesiuni/săpt cu min 24h pauză (flexibil zile: L-Mie-V, Ma-Jo-Sâ, M-V-D)
- Durată: 40-45 min
- RPE: 5-6 (săpt 1-2) → 6-7 (săpt 3+)
- Obiectiv: stimularea cheltuielilor calorice + protecția articulațiilor + adaptare anatomică treptată

**Structura sesiune (40-45 min):**
```
[00-08 min] Warm-up: Mobilitate articulară ușoară din șezut / Quadrupedie
[08-30 min] Main Work: 4 Exerciții forță low-impact
[30-45 min] Cool-down & LISS: Bicicletă orizontală (Recumbent bike) cu rezistență mică
```

**Pool exerciții:**

🚫 Interzise (eliminate complet):
- Impact articular: Sărituri (Box jumps, Burpees, Jumping jacks), alergare sau mers prelungit pe bandă
- Setup-uri dificile / risc dezechilibru: Hip thrust cu spatele pe bancă, Genuflexiuni bulgărești
- Compuse grele libere: Genuflexiuni sau îndreptări convenționale cu haltera

✅ Permise & Recomandate:

*Partea inferioară (Picioare/Fesieri):*
- Presă picioare la aparat (Seated Leg Press) — stabilitate lombară maximă
- Glute Bridge pe sol (saltea) — opțional cu bandă elastică deasupra genunchilor
- Flexii și extensii la aparate (Seated Leg Extensions / Seated Leg Curls)

*Partea superioară (Spate/Piept/Umeri):*
- Tracțiuni la helcometru (Lat Pulldown) — din șezut
- Împins la aparat pentru piept (Seated Chest Press)
- Ridicări laterale din șezut (Seated Lateral Raises) cu gantere mici

*Zona Core (Stabilitate):*
- Bird-Dog (genunchi și palme)
- Modified Plank (sprijin antebrațe + genunchi)

**Progresie 4 săptămâni:**

| Săptămâni | Structură | RPE | Obiectiv |
|-----------|-----------|-----|----------|
| 1-2 | 2 seturi × 10 reps | 5-6 | Învățare mișcare, adaptare tendoane, zero febră invalidantă |
| 3-4 | 3 seturi × 10-12 reps | 6-7 | Creștere ușoară volum. Tehnică excelentă → +1 treaptă rezistență aparat |

**Backlog v2 refinements:**
- Seated core override (dacă feedback dificultate tranziție sol): Bird-Dog/Plank → Seated Knee Raises + Seated Cable Wood Chops
- LISS ramp-down: 12-15min săpt 1-2 → 8-10min săpt 3+, 5min economisite mutate în Main Work

### 2.2 Template: Slăbire Moderată (<15kg target)

**User profile target:**
- Routing: <15kg target slăbire
- BMI: 25-32 typical (overweight / obezitate gradul 1)
- Background: variabil (sedentar 1-3 ani sau ex-activ recent)
- Capacity efort: moderată, articulații tolerabile
- Comorbidități typical: minime sau absente

**Parametri high-level:**
- Frecvență: 4 sesiuni/săpt cu min 24h pauză
- Durată: 45-55 min
- RPE: 6-7 (săpt 1-2) → 7-8 (săpt 3+)
- Obiectiv: deficit caloric controlat + masă musculară preservation + îmbunătățire condiție cardiovasculară

**Structura sesiune (50 min):**
```
[00-05 min] Warm-up dinamic: Cercuri brațe, fandări loc, mobilitate șold
[05-40 min] Main Work: 5 Exerciții (1 Compus bază + 4 Accesorii)
[40-50 min] Cool-down & MISS/LISS: 10 min mers alert pe bandă înclinată / Eliptică
```

**Split sesiuni (Push/Pull alternation Ziua A / Ziua B):**

Rationale: Goblet Squat + RDL în aceeași sesiune = erectorii spinali tensiune continuă → oboseală sistemică în deficit. Split alternation protejează spatele.

*Sesiunea 1 & 3 (Ziua A — Focus Genuflexiuni / Împins):*
- Compus principal: Goblet Squat cu gantera sau KB
- Accesorii upper: DB Shoulder Press (șezut), Flotări (normale sau pe genunchi)
- Accesorii picioare: Leg Extensions
- Core: Plank standard / Plank Shoulder Taps

*Sesiunea 2 & 4 (Ziua B — Focus Îndreptări / Tracțiuni):*
- Compus principal: Romanian Deadlift (RDL) cu gantere
- Accesorii upper: Dumbbell Row pe bancă, Flexii biceps
- Accesorii picioare: Seated Leg Curls
- Core: Bird-Dog (tempo lent) sau Pallof Press

**Pool exerciții:**

🚫 Interzise:
- Impact articular extrem: Box jumps, Burpees explozive
- Tehnică complexă: Snatch, Clean & Jerk, Genuflexiuni deasupra capului

✅ Permise: per split-ul Ziua A / Ziua B mai sus.

**Russian Twists EXCLUS:** flexie lombară + rotație sub sarcină = risc disc intervertebral, evitat de medicina sportivă modernă. Înlocuit cu Pallof Press / Plank Shoulder Taps (aceeași activare oblici/core, zero rotație lombară).

**Progresie 4 săptămâni:**

| Săptămâni | Structură | RPE | Obiectiv |
|-----------|-----------|-----|----------|
| 1-2 | 3 seturi × 10-12 reps | 6-7 | Învățare compound, adaptare neuromusculară |
| 3-4 | 3-4 seturi × 8-12 reps | 7-8 | Progressive overload: +1-2kg gantere SAU +1 set compound |

### 2.3 Template: Tonifiere & Definire — Baseline + 3 Sub-variants

**User profile target:**
- BMI: 22-28 (greutate normală sau ușor supraponderal)
- Background: activ recent, frecventare intermitentă sală 6-12 luni, cunoaște mișcări bază
- Capacity efort: bună, articulații stabile, toleranță oboseală ridicată
- Context nutrițional: Body Recomposition. Maintenance default (±5-10%). NU forțăm deficit. Aport proteic 1.6 g/kg (ISSN) pentru susținere masă musculară.

**Approach 3 sub-variants:** 1 template baseline + 3 volume splits/modifiers (DRY, simplifică engine routing). Splits agresive 70/30 pentru self-selected specialization (NU 60/40 soft).

**Parametri high-level (toate 3 sub-variants):**
- Frecvență: 4 sesiuni/săpt cu min 24h pauză
- Durată: 50-60 min
- RPE: 7-8 (săpt 1-2) → 7-9 (săpt 3+)
- Obiectiv: hipertrofie estetică + recompoziție corporală

**Structură sesiune (55 min baseline):**
```
[00-05 min] Warm-up dinamic: Activare specifică grupă musculară zilei
[05-50 min] Main Work: 5 Exerciții (split volum per sub-variantă)
[50-55 min] Cool-down: Stretching static + respirație controlată (NU LISS/MISS — focus hipertrofie)
```

**Split sesiuni per sub-variantă:**

*A. Echilibrat (50/50 Lower/Upper):*
- Ziua A: Lower Body 1 (Quad dominant — Squat focus)
- Ziua B: Upper Body 1 (Push — Piept/Umeri/Triceps)
- Ziua C: Lower Body 2 (Glute/Hamstring dominant — Hinge focus)
- Ziua D: Upper Body 2 (Pull — Spate/Biceps)

*B. Focus Picioare & Fesieri (70/30 Lower-dominant — Gigica):*
- Ziua A: Lower Body (Focus Fesieri & Hinge — Hip Thrust / RDL)
- Ziua B: Mixed Session (1 ex Upper + 4 ex Lower — Focus Quads)
- Ziua C: Upper Body Full (sesiune completă spate/piept/umeri — recovery picioare)
- Ziua D: Lower Body (Focus Fesieri & Izolare — Kickbacks / Abductions)

*C. Focus Partea Superioară (70/30 Upper-dominant — Marius):*
- Ziua A: Upper Body (Push emphasis)
- Ziua B: Upper Body (Pull emphasis)
- Ziua C: Lower Body (sesiune picioare completă — Squat & Hinge combo)
- Ziua D: Upper Body (Weak points focus — Umeri/Brațe)

**Pool exerciții (Full Freedom moderat, BBS + BBP eliminate):**

🚫 Interzise V1:
- Barbell Back Squat (siguranță lombară fără spotter, fără supervision)
- Barbell Bench Press (siguranță fail-safe — pin sub piept fără ajutor)
- Olympic lifts (Snatch, Clean & Jerk)
- 1RM testing

✅ Permise:

*Lower (Squat pattern):* Hack Squat (aparat), Leg Press, Goblet Squat, Bulgarian Split Squat
*Lower (Hinge pattern):* Hip Thrust (halteră sau aparat), Romanian Deadlift cu gantere/halteră, Cable Pull-throughs
*Lower Accessory:* Leg Extensions, Seated Leg Curls, Glute Kickbacks (cablu sau aparat), Hip Abductions
*Upper Push:* Flat Dumbbell Bench Press, Incline Dumbbell Press, Overhead Press cu gantere, Dips, Triceps Pushdowns
*Upper Pull:* Lat Pulldown, Assisted Pull-ups, Dumbbell Row, Face Pulls, Bicep Curls
*Core:* Cable Crunches, Pallof Press, Hanging Leg Raises, Side Plank (NU Russian Twists)

**Progresie 4 săptămâni:**

| Săptămâni | Structură | RPE | Obiectiv |
|-----------|-----------|-----|----------|
| 1-2 | 3 seturi × 10-12 reps | 7-8 | Consolidare execuție + mind-muscle connection |
| 3-4 | 3-4 seturi × 8-12 reps (compound) / 12-15 reps (isolation) | 7-9 | Progressive overload: +1.25-2.5kg sau +1 rep RPE ridicat |

**Backlog Sprint 4.x:**
- Exercise substitution system ADR separat (dynamic slotting pattern — user picks variant per slot, engine progresie comparable cross-exercise)
- Tonifiere Advanced Track 5-day (a 5-a sesiune optional weak points: umeri/brațe sau izolare fesieri)

### 2.4 Template: Sănătate Generală

**User profile target:**
- Vârstă 18-49 (definit explicit §26.3, NU 50+ care intră Longevitate)
- BMI: 18.5-27 typical (normal sau ușor overweight)
- Background: variabil (sedentar 0-3 ani sau ex-activ inconstant)
- Capacity efort: moderată-bună
- Comorbidități typical: minime
- Motivation: "să fiu activ și în formă" — NU aesthetic-driven, NU performance-driven, NU weight loss aggressive
- Context nutrițional: maintenance default, NU deficit, NU surplus

**Parametri high-level:**
- Frecvență: 3 sesiuni/săpt cu min 24h pauză (vs 4 Tonifiere/Slăbire moderată — user SG NU caută hipertrofie/deficit performance, baseline activity)
- Durată: 40-45 min (max 50 min)
- RPE: 6-7 (săpt 1-2) → 7-8 (săpt 3+)
- Obiectiv: longevitate + mobilitate + menținere forță bază + capacitate cardiovasculară

**Structură sesiune (45 min):**
```
[00-08 min] Warm-up: 5 min cardio ușor + 3 min mobilitate dinamică
[08-33 min] Main Work: 4 Exerciții (Full Body pattern: Push / Pull / Legs / Core)
[33-45 min] Cool-down & LISS/MISS: 12 min mers alert pe bandă sau bicicletă orizontală
```

**Split sesiuni (3 zile Full Body NU Split):**

Rationale: 3×/săpt frecvență, split body parts = fiecare grupă hit 1×/săpt → suboptim. Full body 3× = fiecare muscle group hit 3×/săpt = baseline strength + functional fitness optimal.

*Ziua A (Focus Genuflexiuni):*
- Picioare: Goblet Squat sau Leg Press
- Upper Push: Flat Dumbbell Bench Press
- Upper Pull: Lat Pulldown
- Core: Plank standard

*Ziua B (Focus Îndreptări/Hinge):*
- Picioare: RDL cu gantere sau Cable Pull-throughs
- Upper Push: Incline Dumbbell Press
- Upper Pull: Dumbbell Row sau Seated Cable Rows
- Core: Bird-Dog

*Ziua C (Focus Unilateral & Stabilitate):*
- Picioare: Fandări pe loc sau Bulgarian Split Squat (dacă echilibru permite)
- Upper Push: Overhead Press cu gantere (șezut)
- Upper Pull: Assisted Pull-ups sau Face Pulls
- Core: Pallof Press

**Pool exerciții (Balanced Freedom):**

🚫 Interzise (consistency check Tonifiere):
- Barbell Back Squat & Barbell Bench Press
- Olympic lifts
- 1RM testing

✅ Permise:
- *Picioare:* Goblet Squat, Leg Press, Hack Squat, RDL cu gantere, Hip Thrust (aparat), Cable Pull-throughs, Bulgarian Split Squat, Walking Lunges
- *Upper Push:* Flat DB Bench Press, Incline DB Press, Seated DB Overhead Press, Push-ups (normale/genunchi)
- *Upper Pull:* Lat Pulldown, Assisted Pull-ups, DB Row, Seated Cable Rows, Face Pulls
- *Core:* Plank standard, Side Plank, Bird-Dog, Pallof Press, Cable Crunches

**Progresie 4 săptămâni:**

| Săptămâni | Structură | RPE | Obiectiv |
|-----------|-----------|-----|----------|
| 1-2 | 3 seturi × 10-12 reps | 6-7 | Învățare mișcări, activare fără febră majoră |
| 3-4 | 3 seturi × 8-12 reps | 7-8 | Overload modest: +1-2kg dacă execuție perfectă |

---

## 3. AMENDAMENTE BACKLOG SPRINT 4.x (5 noi)

### 3.1 Secondary Check >25% deficit maintenance

**Problema:** floor static 1200F/1500M ignoră variabilitate masivă greutate/BMR. Femeie 95kg BMR ~1700, maintenance 2000, floor 1200 = deficit 40% periculos. Femeie 50kg BMR ~1300, floor 1200 = deficit 8% suboptim dar safe.

**Soluție:** engine flag suplimentar când deficit setat >25% maintenance, chiar dacă valoarea peste floor static. Soft warning diferit, mai blând.

**Owner:** Sprint 4.x post v1 launch + data reală analytics.

### 3.2 Seated Core Override (Slăbire majoră)

**Problema:** user BMI 36+ — așezare/ridicare pe saltea (Bird-Dog quadrupedie, Modified Plank prone) extrem laborioasă, obositoare, descurajantă.

**Soluție V2:** păstrăm exercițiile sol în V1 (biomecanic excelente). Dacă feedback final-sesiune bifează "tranziții dificile" → engine override automat:
- Bird-Dog → Seated Knee Raises (ridicări genunchi din șezut)
- Modified Plank → Seated Cable Wood Chops (tăieri lemne cablu din șezut)

User pe bancă/picioare, eliminăm coborâre saltea.

**Owner:** Sprint 4.x backlog feedback-driven personalization.

### 3.3 LISS Ramp-down (Slăbire majoră)

**Problema:** 15min recumbent bike din total 45min = 33% timp cardio joasă intensitate. Util săpt 1-2 ca buffer refacere. Săpt 3+ ineficient.

**Soluție V2:**
- Săpt 1-2: păstrăm 12-15min (adaptare cardiovasculară)
- Săpt 3-4+: reducem 8-10min, 5min economisite mutate în Main Work (execuție lentă/controlată sau adăugare al 3-lea set)

**Owner:** Sprint 4.x backlog progresie refinement.

### 3.4 Exercise Substitution System ADR

**Problema:** Tonifiere user vrea opțiune să aleagă variantă din "Squat Pattern slot" (Hack Squat / Goblet / Bulgarian / Leg Press). Implementation V1 = engine alege direct exercițiul pe nivel experiență, NU user picks. Reason — engine progresie nu poate compara loading cross-exercise (Goblet 20kg vs Hack Squat 60kg).

**Soluție backlog:** ADR separat post-v1 — exercise substitution system cu progresie comparable (relative load index, RPE-based equivalence, sau switch confirmation cu engine reset progresie tracker per exercise).

**Owner:** Sprint 4.x ADR + design effort dedicat (8-12h).

### 3.5 Tonifiere Advanced Track 5-day

**Problema:** Tonifiere user advanced (background activ 12+ luni, capacity efort excelentă) merită opțiune frecvență ridicată. V1 baseline 4×/săpt = consistency cu Slăbire moderată (DRY). Risk = under-stimulus pentru advanced.

**Soluție backlog:** flag onboarding "Advanced Track" — a 5-a sesiune opțională săptămânală weak points (umeri/brațe sau izolare fesieri) pentru user motivat. Consistency arhitecturală păstrată cu baseline 4-day default.

**Owner:** Sprint 4.x post v1 launch + analytics user advanced segment size.

---

## 4. NEXT ACTIONS POST-INGEST

### Imediat (priority order)

1. **CC Opus ingest acest handover** în SSOT vault (§29 nou + cross-refs §26-§28).
2. **ADR 022 nou Goal-Driven Program Templates** (deja flag-uit evening 2026-05-01) — extins cu safety nutrition pattern §1 + 4 templates §2.
3. **Sesiune chat strategic dedicată: Forță & Dezvoltare template** (cel mai complex — periodization, PR tracking, deload weeks). Fresh bandwidth obligatoriu.

### Medium term

4. **Sesiune chat strategic Longevitate template** (50+ specific — joint protection, cardio focus, mobility priority).
5. **Sesiune chat strategic distribution strategy reconsider** (full launch vs hand-pick balene per decizia LOCKED #1 intro sesiune).
6. **Sesiune chat strategic F-NEW thresholds + muscle_memory_index + storage full UX** (decizia #4 realist intro — pre-launch obligatoriu).
7. **Wording Phase B remaining** (~37 strings dp.js / sys.js / fatigue.js / reality.js / calibration.js) — bulk batch CC Sonnet după plan complet templates.
8. **Wording Phase C UI labels** (~78 strings dashboard / weight / plan) — bulk batch CC Sonnet.

### Long term pre-launch

9. **Consultanță legală tech specializată RO/EU** ToS final + Privacy Policy specific (~€500-2000, NU optional per decizia LOCKED #3 intro sesiune).
10. **Pre-launch checklist obligatoriu** integrare ADR 020 Phase 2 logs rotation + D1 DEVELOPING refactor + smoke test scope.

### Status timeline v1

- 5/8 templates lockate (62.5%)
- ~5-6 sesiuni chat strategic rămase pre-launch (per decizia LOCKED #4 intro + confirmat sesiune asta cu 19 decizii în ~3h)
- Timeline 8-10 luni v1 (per amendment evening 2026-05-01 §1.2)

---

## 5. METRICS SESIUNE

- **Decizii LOCKED total:** 19 (7 safety + 4 templates designate / 5 design units cu Tonifiere sub-variants + 5 backlog v2/Sprint 4.x + 3 arhitecturale)
- **Push-back-uri Claude productive:** 12+ (eliminat surplus-side safety scope creep, drop ACSM citation pe kcal, drop EFSA pe protein, eliminat Hard Wall + buton disabled, eliminat fiziologie speculative threshold 3-day, eliminat Russian Twists, fix Hip Thrust setup Slăbire majoră, fix mers bandă → recumbent bike Slăbire majoră, fix BBS + BBP elimination consistency, fix screening medical onboarding catastrofal, fix BMI-routing inconsistency vs §26.3, fix reps protocol beginners obezi)
- **Tests:** 888/888 PASS unchanged (chat strategic only, zero code touched)
- **Web searches:** 3 (NIH/Harvard floor 1200/1500 + EFSA energy DRV + INSP RO recom adulți)
- **Bandwidth Daniel:** ~15-20% remaining final, handover triggered preventiv

---

## 6. CONSTRAINTS + CROSS-REFS

**Cross-refs vault:**
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §26 Goal-ca-Setting + 8 templates v1 (extins acum cu §29 nou — safety nutrition + 4 templates V1 spec)
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §27 Wording Rewrite Phase B Evening (cross-ref pattern reusable safety nutrition)
- `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §28 Amendamente Backlog Sprint 4.x (extins cu 5 noi §3.1-§3.5)
- `03-decisions/013-auto-aggression-detection.md` §SAFETY_TRIPWIRE (foundation pattern safety boundary)
- `📤_outbox/_archive/2026-05/34_HANDOVER_INPUT_CONSUMED_EVENING.md` §1.2 timeline 8-10 luni amendment + §26.3 routing taxonomy

**ADR-uri pending cross-ref (post-ingest):**
- ADR 022 Goal-Driven Program Templates (NEW — to be drafted post handover ingest, integrating §1 safety + §2 templates)
- ADR pending Exercise Substitution System (§3.4 backlog — Sprint 4.x)

**Constraints anti-RE absolute (preserved):**
- Internal engine thresholds (0.5%/săpt + 1.6 g/kg + 25% deficit) NU expuse user-facing
- Formulele matematice (user_weight × 1.6) NU în UI, doar valoarea calculată grame
- Authority asymmetry (NIH+EFSA kcal / ISSN protein) intentional documented

**Numbering decision §29:** continuation §26-§28 series (chat strategic milestones post morning v2 + evening 2026-05-01). Semantic continuity — sesiune asta = next major chat strategic milestone safety + templates v1.

---

🦫 **Sesiune 2026-05-02 LOCK. Safety nutrition pattern complet (kcal + protein + surplus optimization + hidratare drop) + 4 templates programe V1 lockate full spec + 5 amendamente backlog Sprint 4.x + 3 decizii arhitecturale colaterale. 888/888 unchanged. Next: ADR 022 nou + sesiune Forță & Dezvoltare template (fresh bandwidth obligatoriu).**
