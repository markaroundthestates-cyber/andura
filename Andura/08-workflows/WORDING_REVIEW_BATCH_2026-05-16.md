# Wording Review Batch — 2026-05-16

**CEO review pending per `DECISIONS.md §D009`.** Toate wording-uri user-facing din triple LANDED 2026-05-15 + TASK 3 TODO(CEO-review) + TASK 6 ambiguity flags + LOCK 9 aaFrictionModal (deferred V1, cod existing).

**ZERO autonomous edit applied (D009 invariant strict).** Verbatim current preserved; alternative drafts NU autonomous applied.

**Authority:** ORCHESTRATOR Pre-Beta Cap-Coadă Batch 2026-05-16 TASK 7 + ANDURA_PRIMER.md §6 Track 3 wording backlog post-smoke + `DECISIONS.md §D-LEGACY-067`.

---

## §1 LOCK 10 MMI Engine #9 wording (PRIMER §6 Track 3 specific flagged)

**Locație SSOT:** `src/pages/coach/muscleMemoryPrompt.js:14-21` `COPY` frozen object.

### 1.1 Modal title

**Current verbatim:**
> "Bine ai revenit"

**Context:** Post-pauza 6+ luni, user opens app — MMI prompt pre-onboarding gate (algorithm hibrid Lookup + Boost cap).

**Daniel review questions:**
- Tonul corect "warm welcome bond" vs "neutral greeting"?
- Alternative ar fi: "Salut" / "Hei, bine ai venit inapoi" / "Te am inapoi"?

**Alternative drafts (NU autonomous applied):**
- (A) Verbatim current "Bine ai revenit"
- (B) "Salut. Bine ai revenit."
- (C) "Te-am asteptat."

---

### 1.2 Modal body

**Current verbatim:**
> "Pauza face parte din drum. Incepem treptat — corpul tau isi aminteste."

**Context:** Body text reassurance anti-paternalism, framing pauza ca normal NU eșec.

**Daniel review questions:**
- "Pauza face parte din drum" → metaforica OK pentru Gigel? Sau prea filosofic?
- "corpul tau isi aminteste" → frază științifică (muscle memory) — Gigel intuiește?
- Lungime acceptabilă (~13 cuvinte)?

**Alternative drafts (NU autonomous applied):**
- (A) Verbatim current
- (B) "Bun. Incepem treptat — corpul tau isi aminteste."
- (C) "Pauza nu sterge progresul. Incepem usor — corpul stie."

---

### 1.3 Modal question

**Current verbatim:**
> "Vrei sa reincepem treptat, de unde ai ramas, sau preferi sa o luam de la zero?"

**Context:** Întrebare 2 opțiuni — gradual ramp (LOCK 10 algorithm refund) vs full reset.

**Daniel review questions:**
- Lungime — întrebare poate prea lunga (~16 cuvinte)?
- "de unde ai ramas" → clar pentru Gigel ca face referire la peak pre-pauza?
- Tonul "preferi sa o luam de la zero" → option deliberatedly highlights both paths equal weight?

**Alternative drafts (NU autonomous applied):**
- (A) Verbatim current
- (B) "Reincep treptat de unde ai ramas, sau o iei de la zero?"
- (C) "Cum vrei sa continui — treptat de unde ai ramas, sau de la zero?"

---

### 1.4 Buttons "Reincep treptat (recomandat)" / "De la zero" — **PRIMER §6 Track 3 EXPLICIT FLAGGED**

**Locație:** `src/pages/coach/muscleMemoryPrompt.js:18-19`
**Current verbatim:**
> Accept button: "Reincep treptat (recomandat)"
> Refuse button: "De la zero"

**Context:** După hiatus user 14+ zile (LOCK 10 spec activate threshold 6+ luni typical), MMI offer two paths return — gradual ramp default recomandat (refund algorithm Lookup + Boost) vs full reset hard.

**Daniel review questions:**
- "Reincep treptat" → coloquial OK pentru Gigel? Sau prefers "Continui usor" / "Iau de la inceput treptat"?
- "(recomandat)" paranteză = stiluri brand voice acceptable? Sau drop paranteză pentru ton mai cleanat? Sau alternative ca "(sugerat)" / "(propus)" mai blând?
- "De la zero" → tonul corect pentru reset hard? Sau prefers "Pornesc proaspat" / "Resetez tot" / "Incep nou"?
- Asymmetry: "Reincep treptat" 18 caractere vs "De la zero" 10 caractere — design intent?

**Alternative drafts (NU autonomous applied):**
- (A) Verbatim current
- (B) "Continui usor" / "Iau de la inceput"
- (C) "Reincep ritmul vechi" / "Schimbam total"
- (D) "Incep treptat (sugerat)" / "Resetez"

---

### 1.5 Refuse banner wording — **PRIMER §6 Track 3 EXPLICIT FLAGGED**

**Locație:** `src/pages/coach/muscleMemoryPrompt.js:20`
**Current verbatim:**
> "Atentie — incarci direct greutatile maxime. Risc accidentare la setul de pornire. Recomandare: incepi cu 70% si urci."

**Context:** Banner post-refuse non-blocking (§32.3 spec) — alertează risc dar NU blochează user (anti-paternalism preserved). 8s auto-dismiss.

**Daniel review questions:**
- "Atentie" → ton corect (non-paternalism), sau prefers "Heads-up" / "Nota" / "Stiai ca..."?
- "Risc accidentare" → ton clinic OK pentru Gigel? Sau prefers "Risc sa te lovesti" / "Sansa accident"?
- "incepi cu 70% si urci" → instructiv corect? Sau prefers explicit "Incepi cu 70% din greutatea maximă si cresti progresiv"?
- Lungime (~22 cuvinte) — banner 8s read time acceptable?

**Alternative drafts (NU autonomous applied):**
- (A) Verbatim current
- (B) "Heads-up — sari direct la maxim. Risc accidentare. Recomandare: incepi cu 70% si urci."
- (C) "Atentie — corpul s-a dezobisnuit. Incepi cu 70% e mai sigur."

---

## §2 LOCK 9 Aggressive Loading wording

**Locație SSOT:** `src/pages/coach/aggressiveLoadingModal.js:13-18` `WORDING_BY_TIER` + line 62-66 modal UI.

### 2.1 WORDING_BY_TIER templates (T0/T1 vs T2/T3)

**Locație:** lines 14-17
**Current verbatim:**
> T0/T1: "Suntem inca in calibrare — recomandarea poate fi conservativa vs realitatea ta. Ai introdus {actualKg} kg. Confirma greutatea cu care te simti pregatit."
> T2/T3: "Ai introdus {actualKg} kg. Recomandarea pentru azi era {recommendedKg} kg (+{deviationPct}%). Confirma daca te simti pregatit sau revino la baseline."

**Context:** Modal pre-set tier-aware. T0/T1 = early calibration (acknowledge engine NU stie inca user-ul); T2/T3 = engine knows, surface explicit deviation cu data.

**Daniel review questions:**
- T0/T1: "Suntem inca in calibrare" → "we" voice — Andura ca team-member? Sau preferas "Coach-ul invata inca" (pe baza "Coach" persona predominant)?
- T0/T1: "vs realitatea ta" → tonul corect, sau prefers "fata de ce poti"?
- T2/T3: "(+{deviationPct}%)" → afișare numerică acceptable Gigel? Sau prefers descriere ("mult mai mare" / "considerabil mai mult")?
- "Confirma daca te simti pregatit sau revino la baseline" → "baseline" = jargon? Sau prefers "valoarea sugerata" / "recomandare"?

**Alternative drafts (NU autonomous applied):**
- (A) Verbatim current
- (B) T0/T1: "Coach-ul invata inca cum sa-ti propuna greutatea. Ai introdus {actualKg} kg — confirma daca te simti pregatit."
- (C) T2/T3: "Ai introdus {actualKg} kg, considerabil peste recomandare {recommendedKg} kg. Confirma sau revii la recomandare?"

---

### 2.2 Buttons aggressive loading modal

**Locație:** lines 65-66
**Current verbatim:**
> Continue button: "Continui cu greutatea introdusa"
> Revert button: "Revin la baseline"

**Daniel review questions:**
- "Continui cu greutatea introdusa" → 30 caractere, prefers short "Continui" / "Ramane asa"?
- "Revin la baseline" → "baseline" jargon? Sau prefers "Revin la recomandare" / "Revin la sugerata"?

**Alternative drafts (NU autonomous applied):**
- (A) Verbatim current
- (B) "Continui" / "Revin la recomandare"
- (C) "Tin greutatea" / "Folosesc sugerata"

---

### 2.3 Modal title micro-label

**Locație:** line 62
**Current verbatim:**
> "Greutate aleasa" (uppercase letter-spacing 2px label-style)

**Daniel review questions:**
- "Greutate aleasa" → corect, sau prefers "Greutate noua" / "Selectie greutate"?

**Alternative drafts (NU autonomous applied):**
- (A) Verbatim current
- (B) "Greutate selectata"
- (C) "Confirma greutate"

---

## §3 LOCK 9 LOOP CLOSE — N/A user-facing wording

LOCK 9 LOOP CLOSE accelerated learning wire-up este **pure engine-side** (acceleratedLearningAdapter.js + calibrationReconciliation.js extension + logging.js wire). ZERO new user-facing strings introduce.

CDL forensic flags `_acceleratedLearningApplied` + `_originalKg` + `_upgradePct` + `_samplesUsed` sunt internal audit trail (ADR 011 §append-only), NU UI display.

**Verdict §3:** NO wording review needed for LOOP CLOSE.

---

## §4 TASK 3 TODO(CEO-review) — KCAL_FLOOR import informative toast

**Locație SSOT:** `src/engine/bayesianNutrition/observationFilter.js:95-104` (canonical engine wording) + `src/engine/bayesianNutrition/observationFilter.js:122-129` (NEW count-aware wording TASK 3).

### 4.1 Engine canonical wording (existing, LANDED commit 51728bc)

**Current verbatim:**
> "Minimul recomandat de WHO (Organizatia Mondiala a Sanatatii) este 1200 kcal/zi. Andura NU include loguri sub acest prag pentru calcul obiective + preconizari viitoare."

**Context:** Forward-going UI trigger consumer wording — pentru când user adaugă MANUAL log <1200 kcal (single entry trigger, NU batch import).

**Daniel review questions:**
- "WHO (Organizatia Mondiala a Sanatatii)" → tonul autoritar OK? Sau prefers "experti nutritie" / "ghiduri medicale" mai blând?
- "NU include loguri sub acest prag" → tonul tehnic clar? Sau prefers "nu foloseste acele zile" mai conversational?
- Lungime (~22 cuvinte) — toast 4-5s read time acceptable?
- "preconizari viitoare" → jargon? Sau prefers "predictii" / "proiectii"?

**Alternative drafts (NU autonomous applied):**
- (A) Verbatim current
- (B) "Minimum recomandat institutii medicale 1200 kcal/zi. Andura nu foloseste zile sub pentru calcul obiective."
- (C) "Experti nutritie recomanda 1200+ kcal/zi minim. Zilele sub acest prag nu intra in calculele coach-ului."

---

### 4.2 NEW import context wording (NEW TASK 3 batch 2026-05-16)

**Locație:** `src/engine/bayesianNutrition/observationFilter.js:122-129`
**Current verbatim (TODO marker en place):**
> "Am detectat {count} zile cu sub 1200 kcal. Coach exclude acele zile din calibrare (posibil underreport). Datele raman salvate."

**Context:** Import CSV/JSON cu N zile <1200 → toast informativ post-success (NU block save). Anti-paternalism preserved per `DECISIONS.md §D-LEGACY-061`. Wording compose Co-CTO autonomous = SLIP DEFAULT D009 — pending Daniel review.

**Daniel review questions:**
- "underreport" → tech jargon? Gigel-friendly alternative: "raportate gresit" / "incomplete" / "subestimate"?
- "Coach exclude acele zile din calibrare" → ton tehnic OK? Sau prefers "Coach nu invata din acele zile" / "Coach ignoră acele zile pentru sugerari"?
- "(posibil underreport)" — paranteză spune "posibil" gentle, dar termen tech — alternative phrasing?
- Lungime (~17 cuvinte) — toast 5s read time acceptable?
- "Datele raman salvate" → reassurance gentle preserved corect?

**Alternative drafts (NU autonomous applied):**
- (A) Verbatim current
- (B) "Am detectat {count} zile sub 1200 kcal. Coach nu invata din ele (poate fi raportare incompleta). Datele raman salvate."
- (C) "Atentie: {count} zile sub 1200 kcal in import. Coach le ignora pentru calibrare. Loguri preserved."
- (D) "{count} zile in import au sub 1200 kcal. Coach le exclude din invatare. Logul ramane intact."

---

## §5 TASK 6 diacritics ambiguity flags — N/A

TASK 6 strip diacritice src/pages/coach/ a fost executat fără edge cases ambiguity. Toate 6 UI strings stripped sunt:
- "exercițiu" → "exercitiu" (ZERO ambiguity)
- "Poți" → "Poti" (ZERO ambiguity)
- "Exerciții" → "Exercitii" (ZERO ambiguity)
- "exerciții" → "exercitii" (ZERO ambiguity)
- "să" → "sa" (verb auxiliary, ZERO ambiguity context-dependent)
- "elimină" → "elimina" (imperativ verb, ZERO ambiguity)
- "această" → "aceasta" (demonstrativ feminin, ZERO ambiguity)

**Verdict §5:** NO ambiguity flags for CEO review. Strip a fost strict engineering normalization per D-LEGACY-064 NO_DIACRITICS_RULE, autonomous OK boundary.

---

## §6 LOCK 9 aaFrictionModal (DROPPED V1 deferred — cod existing src/, review pre-V1.5 prevention)

**Status feature per V1_FEATURES_AUDIT_V1 + DECISIONS.md:** F5 AA Friction Modal DROPPED V1 (Gigel-suspect paranoid surveillance — deferred V1.5/V2). Cod existing în `src/pages/coach/aaFrictionModal.js` 200+ LOC — review wording pentru prevent surprize post-Beta dacă feature re-evaluat post-smoke.

**Locație SSOT:** `src/pages/coach/aaFrictionModal.js:129-154` `innerHTML` template.

### 6.1 Title + context

**Current verbatim:**
> Title: "Plan ajustat — recovery"
> Context: "Coach-ul observa oboseala acumulata. Plan redus 30% astazi pentru recovery."

**Daniel review (preventiv) questions:**
- "Plan ajustat — recovery" → "recovery" anglicism OK pentru Gigel? Sau prefers "Plan ajustat — pentru recuperare" / "Plan redus — odihna"?
- "Coach-ul observa oboseala acumulata" → tonul surveillance-y? F5 was dropped per Gigel-paranoid suspicion exactly — wording must NU sugereze "AI te urmareste"?
- "Plan redus 30% astazi" → percent specific clar?

**Alternative drafts (NU autonomous applied) — IF re-evaluated:**
- (A) Verbatim current
- (B) "Azi e zi mai usoara — plan redus 30% pentru recuperare."
- (C) "Plan redus 30% — corpul are nevoie de odihna azi."

---

### 6.2 Buttons aaFrictionModal

**Current verbatim:**
> Accept: "Accepta plan redus"
> Override: "Override (inteleg riscurile)"

**Daniel review questions:**
- "Accepta plan redus" → tonul corect, sau prefers "Ok, plan redus" / "Sunt de acord"?
- "Override (inteleg riscurile)" → "Override" anglicism + paranteză "inteleg riscurile" combine = paranoid Gigel-suspect tone (de aceea F5 a fost DROPPED V1)?
- IF re-evaluated post-Beta: wording trebuie revizuit fundamental anti-paternalism strict?

**Alternative drafts (NU autonomous applied) — IF re-evaluated:**
- (A) Verbatim current
- (B) "Bine, plan redus" / "Fac planul intreg" (anti-paranoid: NO "risk" wording)
- (C) "Accept" / "Vreau plan intreg"

---

### 6.3 Details expandable section

**Current verbatim:**
> Summary: "Mai multe?"
> Body: "Coach-ul ajusteaza automat cand vede pattern-uri de oboseala. Te ajuta sa eviti accidentari."

**Daniel review questions:**
- "Mai multe?" → minimalist OK, sau prefers "Vrei sa stii mai mult?" / "De ce?"?
- "pattern-uri de oboseala" → tech jargon? Sau prefers "semne ca esti obosit"?

**Alternative drafts (NU autonomous applied) — IF re-evaluated:**
- (A) Verbatim current
- (B) Summary: "De ce?" / Body: "Coach-ul vede ca esti obosit si te ajuta sa eviti accidentari."
- (C) Summary: "Detalii" / Body: "Cand pattern-urile arata oboseala, coach-ul reduce automat pentru protectie."

---

## §7 Cross-refs authority

- **`DECISIONS.md`** §D009 (CEO scope strict UI wording autonomous compose = SLIP DEFAULT) + §D-LEGACY-061 (anti-paternalism invariant ABSOLUTE) + §D-LEGACY-064 (NO_DIACRITICS_RULE) + §D-LEGACY-067
- **`ANDURA_PRIMER.md`** §6 Track 3 (wording backlog post-smoke CEO review)
- **`08-workflows/AUDIT_MOCKUP_PROD_PARITY_2026-05-16.md`** §5 WARNs (2 wording flags surfaced TASK 5 audit raport)
- **`03-decisions/_FROZEN/033-muscle-memory-index.md`** §32.2-§32.3 (LOCK 10 MMI spec authority)
- **`99-archive/wiki-pre-2026-05-15/concepts/aggressive-loading-warning-tier-aware.md`** (LOCK 9 spec authority)

---

🦫 **Wording inventory complete. Daniel CEO review batch ulterior post Bugatti Audit Nuclear. ZERO autonomous edit applied (D009 invariant). 5 wording sections × N strings inventory verbatim. Alternative drafts surfaced 2-4 per string Gigel test mental aplicat — Daniel decide post-extract.**
