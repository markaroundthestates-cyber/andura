# P3 — MOAT Design: Varietate exercitii + Substitutie reala (657 + cascade)

**Autor:** DESIGN agent (read-only, fresh-eyes Opus)
**Data:** 2026-05-26
**Scope:** DOAR design — zero cod scris. Alt agent editeaza concurent `src/` (P0 safety) — eu am citit `src/` + arhiva, am scris doar acest doc.
**Input:** `VERDICT-CONSOLIDATED.md` Cluster 2 (moat = fatada) + arhiva vanilla `99-archive/vanilla-legacy-pre-D028/`.

---

## 0. TL;DR

**Recomandare: REVIVE, nu rebuild.** Biblioteca de 657 e reala, curata, testata (265 cazuri unit, 2569 linii) si — critic — **18/19 nume din motorul activ exista deja verbatim ca chei in ea**. Migrarea identitatii (PR records keyed pe nume EN) e aproape gratis. Rebuild = arunci ~450KB de date curate manual + 265 teste, pentru nimic.

**Gap-ul real NU e datele.** E (a) un **mismatch de vocabular echipament** intre cele doua jumatati ale codului si (b) **substitutia nu e cablata in UI** (butoanele navigheaza away, nu produc swap). Datele sunt OK; firul lipseste.

**Efort realist:** ~2-3 zile cu agenti pe arc complet. Pachetul cel mai greu = harta echipament (engine fine-grained vs lib coarse). Restul = port + cablare chirurgicala.

---

## 1. Ce avem (verificat primary-source)

### 1.1 Biblioteca 657 — `99-archive/.../schema/exerciseMetadata.js`
- **651 intrari** top-level (raportat "657" — diferenta = comentarii/cazuri-limita; substantial corect), **640 cu `fallback_cascade`**, **450KB / 5040 linii**.
- Shape per intrare (`exerciseMetadata.js:44-53`):
  ```
  'Incline Barbell Bench': {
    equipment_type: 'barbell',                    // 6 tipuri coarse
    equipment_alternatives: ['Incline DB Press', 'Smith Incline Bench'],
    force_demand: 'high',                          // low|medium|high
    tier: 1,                                       // 1|2|3
    muscle_target_primary: 'piept',                // 11 grupe canonice RO
    muscle_target_secondary: ['umeri', 'triceps'],
    fallback_cascade: [                            // 5 step types ordonate
      { type: 'easier_machine', exercise_id: 'Smith Incline Bench' },
      { type: 'assisted_variant', exercise_id: 'Incline Chest Press Machine' },
      { type: 'muscle_group_compose', exercise_ids: ['Incline DB Press', 'Incline DB Fly'] },
      { type: 'bodyweight', exercise_id: 'Pike Push-up' },
      { type: 'light_variant', exercise_id: 'Wall Push-up Incline' },
    ]
  }
  ```
- **Taxonomie muscle_target_primary** (11 grupe canonice, distributie reala): spate 110, umeri 96, piept 90, core 57, picioare-quads 55, fese 51, biceps 47, picioare-hamstrings 44, triceps 42, gambe 33, antebrate 32 (+1 'unknown' sentinel).
- **equipment_type** (6 coarse): machine 147, dumbbell 135, bodyweight 131, barbell 127, cable 101, band 18.
- **tier**: T1 272 (compound forta), T2 316 (izolare hipertrofie), T3 71 (accesorii).
- 2 helpere exportate (`exerciseMetadata.js:5008,5026`):
  - `getExerciseMetadata(name)` → meta sau default conservator (`muscle_target_primary:'unknown'` = sentinel "not found").
  - `getValidAlternatives(name)` → alternative filtrate tier-aware: **T1 forta = doar alternative `force_demand:'high'` (strict)**, T2/T3 = toate cu acelasi `muscle_target_primary` (flexibil). Logica buna, anti-paternalism (NU forteaza substitut inferior).

### 1.2 Motoare substitutie (arhiva)
Doua generatii coexista in arhiva:
- **v1 `alternativeEngine.js`** (90 linii): hardcoded `ALTERNATIVES` map (~18 exercitii) + `REQUIRES_EQUIPMENT` + `getAlternatives()` + `resolveExercise()`. Mecanism vechi, INDEPENDENT de biblioteca 657 — propriul lui mini-dataset. **Nu merita reinviat** (datele lui sunt subset al celor 657).
- **v2 `smart-routing/alternative-finder.js`** (32 linii): `findAlternatives(name)` — citeste `EXERCISE_METADATA`, ranking pe similaritate (muscle_target_primary +3, equipment_type +1, force_demand +2), `shouldSkip:true` cand zero alternative valide. **ASTA e motorul de reinviat** — e cuplat la 657.
- Diferenta cheie de design (din comentarii): exista DOUA cai de substitutie in arhiva — (1) **ranking-based** (`findAlternatives`, fallback v1) si (2) **`fallback_cascade` ordonat per-exercitiu** (cascade v2, ADR v2 §3). Cand `fallback_cascade` exista → traverseaza cascada; altfel → degradeaza la `findAlternatives` ranking. **Reinviem AMBELE** (cascade = primar, ranking = degradare gratioasa).

### 1.3 Teste arhivate (calitate REALA, nu fatada)
- `exerciseMetadata.test.js`: **2569 linii / 265 cazuri** — invariante schema serioase (force_demand calibration, tier coherence, muscle_target accuracy, equipment_type singular, cascade well-formed). Port direct = mare parte din QA-ul datelor e deja scris.
- `alternativeEngine.test.js`: 67 linii / 10 cazuri (v1 — relevant doar daca pastram resolveExercise shape).
- `smartRouting.test.js`: 27 linii / 4 cazuri (v2 finder).

### 1.4 Motorul activ (`src/engine/`)
- **`sessionBuilder.js`** = vocabular hardcodat ~22 nume in 3 tabele (`EXERCISES_BY_TYPE` 5 sesiuni, `EQUIP_MAP`, `MUSCLE_GROUP_EXERCISES` 10 grupe). `buildSession()` **filtreaza** dupa echipament (`names.filter(n => available.includes(equipMap[n]))`) — **NU substituie**. Exact gap-ul: echipament lipsa → exercitiul DISPARE.
- **`scheduleAdapter.getDailyWorkout()`** = ruleaza pipeline 8-adapter, deriveaza `availableEngineIds` (scade missing din `ENGINE_EQUIPMENT_DOMAIN`), deleaga la `buildSession`. Aici se plug-uieste substitutia.
- **`scheduleAdapterAggregate.toPlannedExercise()`** (`:495`) = bridge React. Mapeaza `{name, sets}` → `PlannedExercise` cu `targetKg/targetReps` din `DP.recommend(name)` (keyed pe nume EN) + display RO via `toExerciseDisplay`.
- **`exerciseDisplay.ts`** = harta EN→RO, ~30 intrari (acopera doar vocabularul ~22 + cateva dormante). Fallback: `{ name: engineName }` (nume EN crud).

### 1.5 Suprafetele UI care au nevoie de substitutie
| Surface | Stare azi | Ce-i lipseste |
|---|---|---|
| `EquipmentSwap.tsx` | STUB — lista hardcoded 5 aparate, copy "Coach gaseste alternative" aspirational. `handleContinue` paseaza `busy[]` la workout-preview dar **nimeni nu-l consuma** | Trebuie sa produca swap NUMIT vizibil |
| `AparateLipsa.tsx` | Partial — persista `wv2-missing-equipment` (A2 H-4 fix), 10 itemuri. Dar 5/10 itemuri mapeaza la `[]` engine (`scheduleAdapter.js:340-345`) → no-op | Itemuri moarte + filtru→DROP nu substituie |
| `CevaNuMerge.tsx` | Routing only — "Nu vreau" → picker. Nu produce alternativa | Flow "don't want" → cascade → swap |
| `Workout.tsx` | Butoane in-sesiune `wv2-ex-action-ocupat` + `-nuvreau` (`:612-631`) navigheaza la EquipmentSwap/CevaNuMerge | Navigheaza AWAY; nu inlocuiesc exercitiul curent in sesiune |
| `WorkoutPreview.tsx` | Afiseaza lista; are deja `sub` slot pentru "(inlocuit)" | Marker vizual swap |

---

## 2. DECIZIE: Revive vs Rebuild

### REVIVE. Rationale (Bugatti — Quality > Speed, dar aici Revive castiga si la calitate SI la viteza):

1. **Identitate aproape gratis.** Verificat: din 19 nume curente motor, **18 exista verbatim ca chei in 657** (doar `Pec Deck` diverge — in lib e `Pec Deck / Cable Fly`). PR records (`DP.getLogs` keyed pe `l.ex === name`, `dp.js:120-123`) raman valide fara migrare pentru 18/19. Rebuild = risti sa rupi fiecare cheie.
2. **Date curate manual = ireproductibile ieftin.** 657 intrari cu cascade ordonat, force_demand calibrat, tier coherent, 5 bundle-uri auditate (chest/back/shoulders/quads/hamstrings). A reconstrui dataset-ul = saptamani de munca + recurenta erori. Reglajul Daniel "10x timpul acum sa-l facem bine" favorizeaza pastrarea muncii deja-bune.
3. **265 teste port direct.** QA-ul datelor e deja scris.
4. **Filozofia anti-paternalism deja codificata** (`shouldSkip` cand zero alternative, T1 strict force-demand). Rebuild ar trebui sa re-descopere aceleasi reguli.

### Ce NU reinviem:
- **v1 `alternativeEngine.js`** (`ALTERNATIVES`/`resolveExercise` cu mini-dataset propriu) — redundant, subset al 657. Reinviem doar v2 `findAlternatives` + cascade traversal.
- **`coachDirector`** (mort in arhiva) — out of scope P3; selectia merge prin sessionBuilder existent extins.

### Risc revive (onest): biblioteca a fost scrisa pentru motorul VANILLA, nu pentru pipeline-ul React. `equipment_type` e COARSE (barbell/dumbbell/...) iar motorul activ foloseste IDs FINE (`matrix_cable`/`bailib_stack`/`leg_press_plates`). **Acesta e singurul gap de date real** — vezi §3.2.

---

## 3. Data Layer — cum aterizeaza 657 in src/ activ

### 3.1 Locatie + shape + load
- **Locatie:** `src/engine/exerciseLibrary.js` (nou). Pure-data + 2 helpere pure (`getExerciseMetadata`, `getValidAlternatives`) + nou `getFallbackCascade`. Respecta ADR pure-function (zero import din app state) — biblioteca e deja pura.
- **Shape:** identic cu arhiva (zero remodelare — toate cele 265 teste raman valide). Adaugam DOAR doua campuri noi per intrare (vezi §5 naming): `nameRo`, `nameEn` — optional, additive.
- **Bundle-size strategy (decizie):**
  - 450KB raw sursa → ~**120-160KB minified, ~30-45KB gzipped** (data JSON-like comprima excelent). Nu e catastrofal, dar nici neglijabil pentru un PWA.
  - **Recomand: lazy via dynamic `import()`.** Precedent exista in cod (`router.tsx` React.lazy, `pushNotifications.ts` `await import('firebase/...')`, `coachVoice.ts` `import('../../util/sentry.js')`). Biblioteca se incarca DOAR cand pipeline-ul compune un workout (`getDailyWorkout`) sau cand se cere o alternativa — NU pe splash/auth/onboarding.
  - **Caveat purity:** `getDailyWorkout` e deja `async` (`scheduleAdapter.js:421`), deci un `await import()` se incadreaza natural fara a schimba semnatura. Helperele substitutiei (apelate din UI) devin async SAU pre-incarca biblioteca la intrarea in tab Antrenor.
  - **Alternativa (daca lazy complica):** bundle eager dar split intr-un chunk separat Vite (`manualChunks`) — tot nu intra pe critical path. Decizie tactica la executie; lazy preferat.

### 3.2 Harta echipament — GAP-UL REAL (Daniel-decision-adjacent)
Doua vocabulare diferite:
- **Lib 657 `equipment_type`:** `barbell | dumbbell | machine | cable | bodyweight | band` (6 coarse, despre CE FEL de echipament).
- **Motor activ `ENGINE_EQUIPMENT_DOMAIN`:** `matrix_cable | bailib_stack | pec_deck | leg_machine | leg_press_plates | dumbbell` (6 fine, despre APARATE SPECIFICE din sala-pilot).
- **User-facing (AparateLipsa picker):** 10 IDs (`gantere`, `aparat-cablu`, `power-rack`, `banca-inclinata`...).

Azi exista `USER_TO_ENGINE_EQUIPMENT` (`scheduleAdapter.js:331-345`) dar **5/10 user-IDs mapeaza la `[]`** (banca/bara/power-rack/banda nemodelate in domeniul engine). Asta e cauza "itemuri moarte" din audit.

**Design:** introducem o **mapare canonica unica** intre cele trei vocabulare. Recomand sa devina `equipment_type` (coarse, din 657) **sursa de adevar** pentru selectie/substitutie, pentru ca:
- E generala (merge pentru orice sala, nu doar pilotul cu `bailib_stack`).
- Cele 10 user-IDs mapeaza natural la tipuri coarse (`gantere`→dumbbell, `bara-halterelor`→barbell, `aparat-cablu`→cable, `power-rack`→barbell+machine, `banda-elastica`→band, etc.) — **toate 10 capata sens, zero itemuri moarte**.
- Selectia filtreaza pe `equipment_type ∈ available_coarse_types` in loc de `equipMap[name] ∈ availableEngineIds`.

**Daniel-decision needed:** abandonam vocabularul fine `matrix_cable/bailib_stack` (specific sala-pilot) in favoarea `equipment_type` coarse? **Recomand DA** — fine-grained a fost o presupunere a unei singure sali; coarse = generalizeaza la orice user (moat-ul "se adapteaza la sala TA" cere generalitate). Migrarea: `EQUIP_MAP` din sessionBuilder se inlocuieste cu lookup `getExerciseMetadata(name).equipment_type`.

---

## 4. Selection Wiring — cum trage sessionBuilder din 657

### 4.1 Principiu
Inlocuim vocabularul hardcodat ~22 din `sessionBuilder.js` cu **selectie din 657 prin filtre**: muscle group (sesiune) × equipment disponibil × tier (persona/experienta) × goal/specialization.

### 4.2 Mecanism propus (chirurgical, NU rescriere pipeline)
`buildSession(sessionType, ctx)` ramane semnatura identica. Schimbam INTERNALELE:
1. **Maparea sesiune → grupe muschi** (azi `EXERCISES_BY_TYPE` hardcoded). Devine: `SESSION_TYPE_MUSCLE_TARGETS` (PUSH → ['piept','umeri','triceps'], PULL → ['spate','biceps'], etc. — folosind cele 11 grupe canonice).
2. **Pool candidati** = toate intrarile 657 cu `muscle_target_primary ∈ target_groups`.
3. **Filtru echipament** = `equipment_type ∈ available_coarse_types` (din §3.2). Aici NU mai e DROP — daca pool ramane gol pentru o grupa, cade pe substitutie/bodyweight (§4.3).
4. **Filtru tier (persona/experienta)** = T0/incepator → prefera T1 compound + T2 simplu; avansat → permite T2/T3 izolare. Reutilizeaza `profileTier` deja in `buildUserStateForPipeline` (`scheduleAdapterAggregate.ts:435`).
5. **Selectie N per sesiune** = 1-2 compound (T1) pe grupa primara + izolari (T2/T3) pe restul, ~5-6 exercitii. Determinist (seeded pe user+zi) ca sa nu fluctueze random la fiecare render — **important pentru identitate PR + incredere user**.
6. **Weakness/specialization** = `prioritizeWeakGroups` existent ramane (reordoneaza), acum cu pool mai bogat.

### 4.3 Identitate PR — migrare fara rupere
- **18/19 nume curente = chei verbatim in 657** → PR records (`DP.getLogs(name)`) raman valide automat. Zero migrare pentru ele.
- **`Pec Deck` → `Pec Deck / Cable Fly`** (singura divergenta): mic alias map sau o intrare `Pec Deck` adaugata in lib (additive). Decizie tactica.
- **Nume NOI din 657 care apar in sesiuni** (ex: `Incline Barbell Bench`): nu au PR istoric → cold-start via `suggestStartWeight(name, exp)` (deja existent, `scheduleAdapterAggregate.ts:513`). Functioneaza natural — un exercitiu nou e tratat ca cold-start, exact ca azi.
- **Risc rezidual:** daca selectia incepe sa propuna nume noi in loc de cele 18 vechi pentru useri existenti, ei "pierd" continuitatea PR vizibila (desi datele exista). **Mitigare:** selectia determinista ANCOREAZA pe cele 18 nume cunoscute cand sunt valide pentru grupa+echipament (preferinta pentru nume cu istoric PR). Substitutie/variatie doar cand echipament lipsa SAU user cere explicit.

---

## 5. Substitution Wiring — echipament lipsa + "nu vreau" → alternativa NUMITA

### 5.1 Motorul (port din arhiva → src/ activ)
Nou `src/engine/alternativeFinder.js` (port `smart-routing/alternative-finder.js`), expune:
```
findAlternatives(name) → { alternatives: [{name, similarity}], shouldSkip }   // ranking
getFallbackCascade(name, availableTypes) → { exercise, isAlternative, cascadeStep, original, noAlt }
```
Logica `getFallbackCascade`:
1. Daca `name` nu cere echipament indisponibil → return `{exercise: name, isAlternative: false}`.
2. Altfel traverseaza `fallback_cascade` ordonat (easier_machine → assisted_variant → muscle_group_compose → bodyweight → light_variant), returneaza PRIMUL step al carui exercitiu e disponibil cu `availableTypes`.
3. Daca `fallback_cascade` absent (11 intrari) SAU niciun step valid → degradeaza la `findAlternatives` ranking → prima alternativa valida.
4. Daca tot zero → `{noAlt: true}` (anti-paternalism: NU forteaza inferior; UI spune onest "fara alternativa buna, sari-l").

### 5.2 Call sites (exact)
| Trigger | Functie apelata | Unde se afiseaza |
|---|---|---|
| **AparateLipsa save** (echipament permanent lipsa) | `getDailyWorkout` → in `buildSession`, fiecare exercitiu blocat trece prin `getFallbackCascade(name, availableTypes)` inainte de a fi adaugat | WorkoutPreview lista + Workout sesiune. Exercitiul e INLOCUIT, nu DROP. |
| **EquipmentSwap continue** (ocupat temporar) | `handleContinue` paseaza `busy[]` → workout-preview recompune cu `busy` ca echipament indisponibil temporar → cascade | WorkoutPreview: exercitiile afectate arata `{name: alternativa, sub: 'Inlocuit · {original} ocupat'}` |
| **Workout in-sesiune "Aparat ocupat"** (`wv2-ex-action-ocupat`) | NU mai navighea away. Apeleaza `getFallbackCascade(currentExercise, available∖{thisEquip})` → inlocuieste exercitiul curent IN-PLACE in store (workoutStore) | Acelasi ecran Workout, exercitiul curent se schimba + toast "Inlocuit cu {nume}" |
| **Workout in-sesiune "Nu vreau"** (`wv2-ex-action-nuvreau`) | `findAlternatives(currentExercise)` (ignora echipament — e preferinta, nu blocaj) → prima alternativa cu acelasi muscle target | In-place swap + `incrementRefusal` existent (`scheduleAdapter.js:303`) pentru "permanent?" la threshold |
| **CevaNuMerge "Aparat lipsa"/"don't want"** | routeaza la AparateLipsa/in-workout swap de mai sus | — |

### 5.3 Surfacing NUMIT (cheia moat-ului)
Azi butoanele navigheaza away si user-ul nu vede NICIODATA un nume de alternativa. Fix:
- **In-sesiune (Workout.tsx):** swap in-place. `currentExercise` se schimba la alternativa; un toast/banner scurt "Am inlocuit {original} cu {alternativa} — acelasi muschi". Foloseste `toExerciseDisplay` pentru nume RO.
- **Preview (WorkoutPreview.tsx):** slot `sub` deja exista (`:303-307`); pune "Inlocuit · {motiv}".
- **EquipmentSwap (EquipmentSwap.tsx):** dupa toggle busy, afiseaza inline sub fiecare aparat ocupat: "→ vei face {alternativa} in loc de {original}". Transforma copy-ul aspirational "Coach gaseste alternative" in alternativa REALA vizibila inainte de a confirma.

---

## 6. Naming la scara — strategia pentru 657 nume

### 6.1 Problema
657 chei EN canonice (`Incline Barbell Bench`, `Cable Crossover High-to-Low`, `Frog Pump`, `Scaption`, `DB Cross-Body Hammer`...). `exerciseDisplay.ts` acopera ~30. Restul ar cadea pe fallback `{name: engineName}` = **nume EN crude in UI RO** → esueaza filtrul Maria/Gigel (ex: "Scaption", "Frog Pump" sunt opace pentru un user RO mediu).

### 6.2 Strategia recomandata: `nameRo` + `nameEn` campuri pe biblioteca (NU harta exterioara extinsa)
**De ce pe biblioteca, nu in `exerciseDisplay`:** harta exterioara (azi) decupleaza datele de afisare → drift garantat la 657 intrari. Numele apartine exercitiului. Pune-l pe intrare.

Pe fiecare din cele 651 intrari adaugam (additive, optional):
```
'Incline Barbell Bench': { ..., nameRo: 'Impins inclinat cu bara', nameEn: 'Incline Barbell Bench' }
```
- **`exerciseDisplay.toExerciseDisplay` devine:** intai cauta `nameRo` pe intrarea din biblioteca; fallback la harta curata existenta (cele ~30 verbatim mockup pastrate); fallback final la nume EN. Astfel cele ~30 nume reglate-de-Daniel din mockup raman intacte (sursa de adevar pentru ele), iar restul de 627 capata `nameRo` din biblioteca.
- `sub` (echipament/setup) ramane in `exerciseDisplay` pentru cele afisate frecvent SAU se genereaza din `equipment_type` (ex: barbell→"Cu bara", dumbbell→"Cu gantere", cable→"La cablu").

### 6.3 Regula de denumire codificata (per Daniel)
1. **EN cand e termenul standard de sala RO:** Bench Press, Deadlift, Romanian Deadlift, Face Pull, Hip Thrust, Lat Pulldown, Pec Deck, Hammer Curl, Push Press, Good Morning. (RO-ul vorbeste asa.)
2. **RO bun cand exista termen natural:** Ridicari laterale, Ramat (la cablu/cu bara/cu gantera), Presa de picioare, Extensii cvadriceps, Flexii femurale, Flexii biceps, Fluturari, Genuflexiuni, Impins (din piept/inclinat/militar), Ridicari pe varfuri.
3. **ZERO traduceri literale dezastru:** "Face Pull" NU "Trageri la fata" (citit ca palma). "Frog Pump" → "Punte fese cu picioarele departate" sau pastreaza descriptiv. "Scaption" → "Ridicari frontale-laterale 45°". Filtru: *"Gigel/Maria intelege ce misca?"*
4. **ZERO abrevieri in display:** "DB" → "cu gantere", "RDL" → "Romanian Deadlift", "OHP" → "Impins militar"/"Overhead Press". (Cheia EN pastreaza DB/RDL ca IDENTITATE; doar `nameRo` se curata.)
5. **Fara diacritice** (D-LEGACY-064): nameRo respecta regula (Impins, nu Împins).

### 6.4 Cum se GENEREAZA + QA cele 627 nume noi (realist)
- **NU manual 627 unul cate unul** = lent + inconsistent. **NU LLM-autogen necontrolat in productie** = risc "literal disasters" exact ce interzice regula.
- **Recomand: generare semi-automata + review uman batch pe grupe.** Numele EN au structura compozabila: `{Setup}{Equipment}{Movement}{Variant}`. Un mic dictionar de tokeni (`Incline→Inclinat`, `Barbell→cu bara`, `Bench→Impins din piept`, `DB→cu gantere`, `Cable→la cablu`, `Fly→Fluturari`, `Row→Ramat`, `Press→Impins`, `Curl→Flexii`, `Pull-up→Tractiuni`...) genereaza un draft `nameRo` pentru fiecare, apoi review uman pe ~11 batch-uri (per grupa muschi, 30-110 fiecare) cu filtrul Maria/Gigel.
- **QA gate (anti-recurenta "fatada"):** un test (port din spiritul `exerciseMetadata.test.js`) care asigura: (a) fiecare intrare are `nameRo` non-gol; (b) zero diacritice; (c) zero tokeni EN reziduali interzisi in nameRo (lista neagra: "Press" netradus, "Curl", "Fly", "DB", "Pull"...) EXCEPTAND lista alba de termeni-standard-RO (Bench Press, Deadlift, Face Pull...); (d) lungime rezonabila (< ~40 char, sa nu sparga UI). Daniel face un pass de gust final pe batch-uri (e CEO+Product, deciziile de nume sunt UX — exact rolul lui).

---

## 7. Phasing — pachete atomice, efort realist

**Anchor pace (din MEMORY, anti-inflatie):** task simplu ~5-8 min; pachet de integrare ore. NU inflatez. Cu agenti paraleli (max 4-5), arcul ~2-3 zile calendar.

| # | Pachet | Continut | Efort | Risc |
|---|---|---|---|---|
| **WP-1** | Port biblioteca | Copiaza `exerciseMetadata.js` → `src/engine/exerciseLibrary.js` + cele 2 helpere. Port 265 teste → `src/engine/__tests__/`. Adapteaza importuri/extensii. Verifica pure. | ~1-2h (mare parte mecanic) | SCAZUT — date deja testate. Risc: extensii .js/.ts, path-uri import. |
| **WP-2** | Port alternative finder | `src/engine/alternativeFinder.js` (din `smart-routing/alternative-finder.js`) + `getFallbackCascade` (cascade traversal NOU, ~40 linii). Port `smartRouting.test.js` + teste cascade noi. | ~1-2h | SCAZUT — logica mica, bine definita. |
| **WP-3** | Harta echipament canonica | Unifica vocabular: `equipment_type` coarse = sursa adevar. Mapare 10 user-IDs → coarse types (toate 10 capata sens). Inlocuieste `EQUIP_MAP`/`ENGINE_EQUIPMENT_DOMAIN`. | ~2-4h | **RIDICAT** — atinge selectia + Daniel-decision (abandon fine-grained). Atinge `scheduleAdapter.translateToEngineEquipment`. |
| **WP-4** | Rewire selectie sessionBuilder | `SESSION_TYPE_MUSCLE_TARGETS` + pool-from-657 + filtre (muscle×equip×tier×goal) + selectie determinista N. Pastreaza `buildSession` semnatura + `prioritizeWeakGroups`. Ancoreaza pe cele 18 nume cu PR cand valide. | ~3-5h | **RIDICAT** — identitate PR + schimba ce vede user-ul. Necesita teste noi solide. |
| **WP-5** | Cablare substitutie UI | AparateLipsa→cascade in getDailyWorkout; EquipmentSwap inline alt; Workout in-place swap (`wv2-ex-action-*`) + workoutStore swap action + toast; WorkoutPreview marker `sub`. | ~4-6h (5 surse + store) | MEDIU — atinge workoutStore (mutatie sesiune live) + UX swap. |
| **WP-6** | Naming 627 | Dictionar tokeni → draft `nameRo` generat → review batch pe 11 grupe + Daniel gust → `nameRo`/`nameEn` pe intrari + `toExerciseDisplay` citeste din lib. QA-test gate. | ~4-8h (review uman e gatul) | MEDIU — volum + risc literal-disaster (mitigat de QA gate + Daniel pass). |
| **WP-7** | Lazy-load + bundle | Dynamic `import()` pentru biblioteca in getDailyWorkout + helperele substitutiei (sau Vite manualChunks). Verifica bundle nu intra pe critical path. Lighthouse check. | ~1-2h | MEDIU — async propagare prin helpere UI; precedent exista. |
| **WP-8** | Teste E2E pipeline real + onestitate fatada | Test real: missing equipment → alternativa NUMITA aterizeaza in workout (anti-recurenta "verde pe gol"). Fix copy aspirational. Fix 5 itemuri moarte AparateLipsa (rezolvat de WP-3). | ~2-3h | SCAZUT — dar CRITIC pentru a nu repeta gap-ul auditului. |

**Ordine recomandata:** WP-1 → WP-2 (paralel posibil) → **WP-3 (gat, Daniel-decision)** → WP-4 → WP-5 → WP-6 (paralel cu WP-5 dupa WP-1) → WP-7 → WP-8 (ultim, gate).

---

## 8. Riscuri (ranked)

1. **[RIDICAT] Identitate PR la rewire selectie (WP-4).** Daca selectia propune nume noi useri existenti → istoric PR "dispare" vizual. *Mitigare:* selectie determinista + ancorare pe cele 18 nume cu PR valid; variatie doar la echipament-lipsa/cerere. Verificat: 18/19 nume = chei verbatim, deci datele NU se pierd, doar afisarea.
2. **[RIDICAT] Vocabular echipament — Daniel-decision (WP-3).** Abandon `matrix_cable/bailib_stack` (specific sala-pilot) → `equipment_type` coarse (generic). Necesar pentru moat generic, dar atinge selectia + maparea user-IDs. *Mitigare:* mapare canonica unica + teste pe toate 10 user-IDs.
3. **[MEDIU] Bundle size (WP-7).** 450KB raw → ~30-45KB gzip. *Mitigare:* lazy `import()` (precedent in cod) → zero impact critical path. Verificare Lighthouse.
4. **[MEDIU] Naming literal-disaster la scara (WP-6).** Autogen necontrolat → "Trageri la fata". *Mitigare:* dictionar tokeni + QA-test gate (lista neagra/alba) + Daniel pass batch.
5. **[MEDIU] Mutatie sesiune live la in-place swap (WP-5).** workoutStore nu are azi action de swap exercitiu mid-sesiune; atentie sa nu corupa `history`/`exIdx`/PR-in-progress. *Mitigare:* swap doar exercitiu NEINCEPUT (set 0) sau confirma resetare seturi.
6. **[SCAZUT] Rupere flow ~22 existent.** *Mitigare:* `buildSession` pastreaza semnatura; teste existente raman verzi; WP-8 E2E confirma paritate + extindere.
7. **[SCAZUT-recurenta] "Teste verzi pe feature gol".** Exact capcana din audit. *Mitigare:* WP-8 = test E2E care conduce pipeline REAL si verifica alternativa NUMITA aterizeaza la user, nu doar shape.

---

## 9. Daniel-decisions needed (strategice — pentru CEO+Product)

1. **Vocabular echipament (WP-3):** OK sa abandonam IDs fine-grained (`matrix_cable/bailib_stack`, presupunere sala-pilot) in favoarea `equipment_type` coarse (barbell/dumbbell/machine/cable/bodyweight/band) ca sursa de adevar? *Recomand DA* — moat-ul "se adapteaza la sala TA" cere generalitate, nu o singura sala.
2. **Naming pass (WP-6):** Daniel face pass-ul de gust pe 11 batch-uri nameRo (UX call, rolul lui)? Sau delega complet la QA-gate + agent cu filtrul Maria/Gigel? *Recomand:* agent genereaza draft + QA gate, Daniel review batch (nu 627 individual).
3. **Variatie vs continuitate (WP-4):** cat de agresiv variem exercitiile pentru useri existenti? Default propus = conservator (ancoreaza pe cele cu PR, variaza la echipament-lipsa/cerere). Confirma daca vrei mai multa variatie auto (anti-plictiseala) cu riscul continuitatii PR.
4. **Timing P3 (per VERDICT §5):** pre-Beta (Beta intarzie, moat real) SAU Beta cu ~22 onest declarate + 657 milestone post-Beta? Per decizia ta deja exprimata in brief ("moat must be REAL before Beta"), presupun **pre-Beta** — confirm.

---

## 10. Incertitudini (flag onest)
- **Conteaza exact 651 vs 657** — n-am numarat cazurile-limita (cheie pe mai multe linii); diferenta = comentarii/whitespace, substantial 657. Verificabil la WP-1.
- **`muscle_group_compose` cascade step** (1-2 exercitii in loc de 1) — UI-ul trebuie sa decida cum afiseaza "2 exercitii in loc de 1"; n-am proiectat acel detaliu UX (e edge al cascadei). Flag pentru WP-5.
- **Gzip exact** (~30-45KB) = estimare pe densitatea datelor; masurabil real abia post-WP-1 cu build.
- **workoutStore swap action** — n-am citit workoutStore complet (alt agent il poate atinge in P0); WP-5 trebuie sa verifice shape-ul `history`/`exIdx` inainte de a adauga swap.
