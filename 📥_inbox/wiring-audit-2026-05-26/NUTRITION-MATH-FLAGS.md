---
title: NUTRITION-MATH-FLAGS — calibrare nutrition-brain pentru review Daniel-supervised
type: flags
date: 2026-05-26
author: P4 calibration executor (read-mostly; ZERO modificare de math)
source_audits:
  - ENGINE-CORRECTNESS-ARCH-AUDIT.md (SEAM-2/3/5 + posterior over-confidence)
  - SWEEP-TESTS-E2E-SECURITY-AUDIT.md (journey d = strongest)
constraint: >
  Nutrition math (TDEE / Bayesian / Kalman / bf%) = cea mai puternica si
  Daniel-sensitive parte a aplicatiei. NU se schimba math-ul nesupervizat.
  Documentul ASTA flaggheaza + recomanda; ZERO numar nutritie schimbat de mine.
verification: >
  Fiecare afirmatie numerica = rulata pe modulele reale ale engine-ului in Node
  (src/engine/bayesianNutrition/*) cu inputuri realiste, NU recall. Path-divergence
  confirmata empiric (vezi §C).
---

# NUTRITION-MATH-FLAGS — patru itemi de calibrare (Daniel decide)

> **Verdict scurt:** math-ul de nutritie e corect si coerent (confirmat de E2E real-wire NOU + audit). Cei patru itemi de mai jos sunt **calibrare / onestitate de framing**, NU bug-uri de numar gresit. Niciunul nu produce un kcal periculos azi. **Eu am schimbat ZERO math.** Trei dintre ele cer o decizie de design pe care doar Daniel o ia (brand-promise "Kalman" + tightness CI). Al patrulea (§C) am putut sa-l verific complet si recomand explicit **NU unifica** (path-urile difera by-design pe input, nu pe formula).

---

## §A — Kalman calculat-dar-descartat pentru valoarea afisata (MED)

**Fapt verificat (cod, NU presupus):** `src/engine/bayesianNutrition/index.js`:
- linia 328: `kalmanState = runKalmanWithFallback(...)` se calculeaza
- linia 335: `trace.kalmanState = kalmanState` — stocat DOAR in `trace`
- liniile 341-349: `nutrition_inference_metadata.posterior.mu` = `posterior.mu` (valoarea **conjugata**, reasignata ultima oara la 317-323), NU `kalmanState.mu`
- `src/react/lib/engineWrappers.ts:747` citeste `nutrition_inference_metadata.posterior.mu` → deci numarul pe care il vede userul = posterior-ul Bayesian conjugat.

**Rulat in Node (inputuri realiste, 2 obs ~2770 + prior 3224, T1):**
- `posterior.mu` (afisat) = **2820.44**
- `trace.kalmanState.mu` = **3200.22** (≠ afisat; in plus `ewmaFallbackActive: true` pentru ca `recentObservedWeights/recentPredictedWeights` nu se paseaza niciodata pe wire-ul real → `computeR2([],[])=0` → gate pica → EWMA)

**Implicatie:** flag-ul `bayesian_kalman_v1` e ON in productie (D047 / `featureFlags.js:257`), dar flip-ul a activat doar *calculul* Kalman; numarul livrat ramane conjugat pentru ca `kalmanState.mu` nu e niciodata reasignat in `posterior.mu`. Brand-promise PRIMER §2 "Kalman adaptive TDEE" (D047 LOCKED V1) e mai elaborat decat math-ul operativ.

**Recomandarea mea (NU aplicata):** doua optiuni curate, ambele cer decizia ta:
1. **Pastreaza conjugatul ca operativ** (sound, deja face adaptarea reala — E2E nou dovedeste 3224→2820) si rebrand-uieste onest "estimator Bayesian conjugat adaptiv" (am facut deja fix-ul de framing in PRIMER §2 + nota catre acest doc). Cel mai mic risc; math-ul afisat ramane neschimbat.
2. **Cabla Kalman cu adevarat** (reasigneaza `posterior.mu = kalmanState.mu` cand gate-ul trece) — DAR atunci §B (domain mismatch) devine bug real + trebuie pasate `recentObserved/recentPredicted` pe wire ca gate-ul R²>0.85 sa aiba ce evalua. Mai mult efort, schimba numarul afisat → strict supervizat.

**Preferinta tehnica:** opt. 1 (onestitate de framing, ZERO schimbare numar) pana cand decizi ca vrei Kalman operativ. D047 a cerut "adaptive TDEE must be REAL" — *adaptiv* e deja real (conjugatul adapteaza din cantar); doar eticheta "Kalman" supra-promite.

---

## §B — Constante de zgomot Kalman in domeniu-kg aplicate unui semnal kcal (MED, latent)

**Fapt verificat:** `kalmanFilter.js:122` Q default = `metabolicAdaptationKcalPerKgLbm × 0.01 = 22 × 0.01 = 0.22` (kg/zi, per comentariul de derivare §B026 liniile 17-52); `:124` R default = `1.0` (kg natural noise). Dar `index.js:330` paseaza `observation: sampleMean` care e in **kcal** (~2400-3200, TDEE energy-balance). Deci Q≈0.22 si R≈1 (scale kg) sunt aplicate unei observatii kcal de ordinul miilor.

**De ce e inofensiv AZI:** exact pentru ca output-ul Kalman e descartat (§A). `kalmanGain = σ²pred/(σ²pred+R²)` cu R=1 pe un semnal de ordinul 3000 → gain ≈ 1.0 → Kalman ar urma observatia aproape 1:1 oricum, dar oricum nu se foloseste.

**Landmine:** in ziua in care cineva cabla `kalmanState.mu` in output (optiunea 2 din §A), mismatch-ul de scala devine bug real (filtrul ori urmeaza orbeste observatia, ori sub-filtreaza, in functie de cum se re-deriva Q/R).

**Recomandarea mea (NU aplicata):** leaga §B de §A — daca alegi opt. 1 (conjugat operativ), §B ramane inofensiv si poate fi doar documentat in cod. Daca alegi opt. 2 (Kalman operativ), atunci OBLIGATORIU re-derive Q/R in domeniu-kcal inainte (Q_kcal ≈ Q_kg × 7700, R_kcal ales din varianta reala intra-fereastra a TDEE estimat). Strict supervizat — atinge math-ul.

---

## §C — Doua cai de invocare BN: ASSESS identic vs difera (MED) → **recomand NU unifica**

Asta e item-ul pe care misiunea mi-a cerut sa-l decid daca-l pot rezolva sigur. **L-am verificat complet empiric. Concluzia: path-urile DIFERA in productie → NU se unifica → flag cu delta (mai jos).**

**Cele doua cai:**
1. **Path-ul livrat (ce vede userul):** `getNutritionTargetsToday` → `evaluateBN(readBayesianNutritionContext())` direct (`engineWrappers.ts:741`). Ctx = `{ profileTier, meta:{ observations, demographicMu, demographicSigma, kcalFloorMin } }`. **Fara** `constraintObject`.
2. **Path-ul orchestrator (ce valideaza Coach Brain Eval):** `bayesianNutritionAdapter.invoke(ctx)` — cere HARD `ctx.meta.constraintObject` (altfel `INVALID_INPUT`), il redenumeste in `meta.periodizationConstraint`, apoi `evaluate(adaptedCtx)`. Ctx-ul orchestratorului e construit de `contextBuilder.buildEngineContext` dintr-un **userState de workout** (`user`/`recentSessions`/`weights`) — NU citeste store-urile de nutritie, deci **nu are** `observations`/`demographicMu`.

**Test empiric rulat in Node (modulele reale):**

| Scenariu | `posterior.mu` |
|---|---|
| (A) **ACELASI** ctx nutritie, adapter doar ADAUGA `constraintObject` | direct **3200.32** == via-adapter **3200.32** → **IDENTIC** |
| (B) Shape REAL orchestrator (userState workout, FARA obs/demographicMu) | via-adapter **0**, `tier:'none'` |
| Shipped real (cu obs nutritie) | **3200.32** |

**Interpretare (cheia deciziei):**
- `constraintObject`/`periodizationConstraint` e **no-op pentru `posterior.mu`** — engine-ul il foloseste DOAR la `forwardConstraintObject(...)` → `trace.forwardedConstraint` (boolean). Formula posterior NU se atinge. Deci, **la inputuri identice, cele doua cai dau acelasi numar** (rândul A).
- DAR in **productia reala** ele NU primesc input identic: path-ul livrat e hranit cu observatiile de nutritie (→ 3200), orchestratorul cu un userState de workout fara nutritie (→ 0, tier 'none'). **Difera (0 vs 3200), din cauza HRANIRII diferite, nu a formulei.**

**De ce NU unific (per constrangerea misiunii "differ → do NOT change; flag"):** "A ruta valoarea livrata prin path-ul validat" NU e o schimbare neutra-de-numar. Ar insemna fie (i) sa hranesc orchestratorul cu observatiile de nutritie + un `constraintObject` (schimbare arhitecturala reala care ar schimba ce vede userul + cum se construieste ctx-ul), fie (ii) sa relaxez gate-ul de `constraintObject` din adapter. Ambele ating numarul de nutritie afisat → exact ce mi se interzice nesupervizat. **Deci am lasat ambele cai neatinse.**

**Delta pentru Daniel:** in starea curenta, **Coach Brain Eval valideaza un BN care, pe shape-ul real al orchestratorului, ar returna `tier:'none'`/`mu≈0`** (pentru ca orchestratorul nu-i da observatii de nutritie) — deci eval-ul nu metra valoarea kcal reala pe care o vede userul (gap de acoperire, NU numar gresit). Valoarea livrata (3200/2820 etc.) e produsa de path-ul direct, corect, dar ne-evaluat de harness.

**Recomandarea mea (NU aplicata):** daca vrei sa inchizi gap-ul de acoperire, calea curata e sa adaugi un **caz de eval** care dryveaza path-ul DIRECT (`readBayesianNutritionContext`-shape → `evaluate`) ca un al 9-lea check, NU sa fortezi valoarea livrata prin orchestrator. Asta extinde safety-net-ul fara sa atinga math-ul. Decizie de design = a ta. (Notez ca E2E real-wire NOU pe care l-am adaugat — `src/react/__tests__/lib/nutritionPipeline.realwire.test.ts` — acopera deja path-ul direct end-to-end ca regression guard, partial inchizand gap-ul din afara harness-ului.)

---

## §D — σ posterior se prabuseste → CI prea stramt (MED, calibrare)

**Fapt verificat (Node, inputuri reale):**
- Prior-dominat (0 obs, demographicSigma 250): σ ≈ 250 (corect, larg).
- 2 obs ~2770, T1: σ posterior = **186.3** (CI 95% ≈ ±365 kcal — rezonabil aici).
- Auditul raporteaza ca dupa **3-5 obs** σ se prabuseste la **~18-32 kcal** (CI ±35 kcal), nerealist de increzut pentru un TDEE.

**Nuanta (NU am putut reproduce ~18-32 cu 2 obs — apare la mai multe obs cu varianta-esantion mica):** cand observatiile sunt foarte apropiate intre ele (varianta-esantion mica), `conjugateUpdate` precision-weighted strange σ agresiv (corect matematic pentru date concordante, dar fizic TDEE-ul real are zgomot zilnic ne-capturat de cateva ferestre). Deci flag-ul auditului e plauzibil structural; eu confirm directia (σ scade rapid cu obs concordante), valoarea exacta 18-32 depinde de cat de stranse-s ferestrele.

**De ce NU e bug de numar gresit:** σ afecteaza `likelihood_probabilities` + CI-ul afisat (banda de incredere), NU `posterior.mu` (kcal-ul afisat). Deci tinta kcal ramane corecta; doar "cat de sigura zice ca e" e supra-increzuta.

**Recomandarea mea (NU aplicata):** un **σ-floor** (ex. clamp `posterior.sigma >= ~60-80 kcal`) ar reflecta zgomotul biologic ireductibil al TDEE si ar largi CI-ul la ceva onest. E o singura linie in `conjugateUpdate`/dupa el, DAR atinge math-ul de incredere → strict supervizat + ideal validat in simulatorul de 90 zile (`kalmanConvergence.test.js` pattern) ca floor-ul nu strica convergenta. Daniel decide valoarea floor-ului (alegere de produs: cat de "increzator" sa para coach-ul).

---

## Ce am atins / NU am atins (explicit)

- **ATINS (safe):** PRIMER §2 framing (onestitate: conjugat, nu Kalman) + acest doc de flags + E2E real-wire NOU pentru nutritie (regression guard, ZERO mock) — niciunul nu schimba math-ul engine-ului.
- **NU am atins (math nutritie):** `priorPosterior.js`, `kalmanFilter.js`, `index.js`, constante (Q/R/σ/slope/floor), `nutritionObservations.ts` builder. Zero linie de formula modificata. Zero numar de nutritie schimbat.
- **Incertitudine flaggata:** valoarea exacta σ 18-32 (§D) — confirmat directia, nu cifra exacta. Restul = verificat empiric pe cod real.
