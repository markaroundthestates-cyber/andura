# Nutrition Brain — Implementation Spec (2026-05-26, Daniel CEO directive)

**Trigger:** Audit nuclear a gasit creierul de nutritie (Bayesian/Kalman TDEE) DORMANT (mereu baseline 2640). Daniel a clarificat modelul dorit pe chat. Acest spec = sursa pt executori.

## Modelul (verbatim Daniel)
- **6 faze:** Auto, Forta, Masa musculara (=hipertrofie), Slabire (=cut), Mentenanta (=maintain), Longevitate.
- **Fiecare faza non-Auto:** tinta kcal = TDEE-ul REAL al userului × multiplicator de faza. TDEE calculat din kg/inaltime/masuratori + istoric greutate + cum a slabit/ingrasat → **se rafineaza in timp** (Kalman) ca sa prinda actual TDEE cat mai precis.
- **Auto = pilot automat:** Andura alege singura faza recomandata (phaseAutoDetection exista deja).
- **Manual:** user logheaza kcal+proteine mancate → alea conteaza ziua aia.

## Bug central de omorat
`engineWrappers.ts` aplica multiplicatorul de faza pe **BASELINE_NUTRITION 2640 flat**. Maria 40kg mentenanta → 2640 (absurd), Marius 110kg/2m bulk → 2851 (absurd). Baza TREBUIE sa fie TDEE-ul real per-user.

## Cele 3 piese
### Piesa 1 — Baza TDEE reala (omoara 2640)
- Baza = BMR per-user × activity factor (folosi calculul existent care alimenteaza BMR strip-ul "1.790 kcal/zi"; verifica functia exacta in impl, NU hardcoda).
- Multiplicatorii de faza pe baza reala: CUT 0.82/0.75 · BULK 1.08/1.15 · MAINTAIN 1.00 · RECOMP ±2% (exista in goalAdaptation/constants.js).
- Proteine = g/kg × greutate (per-user, nu flat). Floor fat hormonal exista.

### Piesa 2 — Observations builder + adaptare (D046 ramane)
- Builder NOU: din `progresStore.weightLog` (trend greutate) + `nutritionStore.dailyLog` (kcal logat) → array de observatii pt `BayesianNutritionContext`.
- Pasa context din cele 2 call-site-uri (`NutritionInline.tsx:66`, `TDEEStrip.tsx:91`) → engine-ul iese din tier 'none'.
- **Cu un gram de sare (Daniel):** cand kcal logat CONTRAZICE trendul de greutate (logheaza deficit dar se ingrasa) → trateaza logul ca sub-raportat, **crede cantarul** (= designul "noise-robust TDEE", energy-balance din delta greutate e adevarul de baza).
- **Floor (Daniel LOCKED 2026-05-26): minim ABSOLUT, nu recomandat — femei 1000 / barbati 1200.** Rol dublu: (a) Andura NU *recomanda* o tinta sub floor (acoperire legala, nu prescrie infometare); (b) filtreaza mis-log-uri evidente din calcul. **NU exclude zile reale de intake mic** — cantarul (trend greutate) ramane adevarul de baza (grain of salt), deci o zi reala 900-1000 confirmata de scadere tot informeaza TDEE prin trend. ZERO blocare logare, ZERO morala (anti-paternalism; Daniel real 900-1000 @ 146kg = date valide). Extinde `KCAL_FLOOR_DAILY_MIN` (azi 1200 flat) pe sexe (1000f/1200b). `filterKcalFloorObservations` exista deja in BN engine.

### Piesa 3 — Import istoric (bootstrap)
- **Nume GENERIC** ("Importa istoric nutritie/greutate"), NU "MFP".
- Parser pt export MFP CSV (greutate + kcal istoric pe ani) → alimenteaza builder-ul de observatii din Piesa 2 → Kalman converge in zile, nu luni.
- UI import NOU in React (lipseste — era doar in vanilla legacy `dashboard.js`/`importMFPNutritionCSV`, NU portat).
- Reuse logica vanilla `importMFPNutritionCSV` ca referinta de format.

## Output nou — Preconizare (Daniel)
- "Daca continui asa, in 3-4 saptamani → X kg, Y% bf." Din TDEE curent vs intake → energy balance → delta greutate proiectata → delta bf (LBM/Navy BF exista). Surface in UI (Progres sau nutrition strip).

## Secventa
1. Piesa 1 (baza reala + multiplicator) — fundatia.
2. Piesa 2 (observations builder + adaptare + floor pe sexe + skeptic).
3. Piesa 3 (import generic) — bootstrap.
4. Preconizare — dupa ce TDEE-ul real curge.

## Constrangeri Bugatti
- Pure-function in engine (zero Date.now/Math.random/mutation). Plumbing la I/O boundary.
- RO no-diacritics in UI strings. Atomic commits single-concern. Pre-commit verde mandatory.
- ZERO regresie pe cele 4271 teste; adauga teste pt builder + floor pe sexe + skeptic + proiectie.
