# INSIGHTS BACKLOG

Entries care NU intră în v1 dar trebuie documentate pentru future design.

---

## ADR 018 — Engine Extensibility Architecture (PRIORITY 1, Sesiunea NEXT)

**Status:** Spec NEXT priority, NU built încă.
**Source:** Daniel insight 27 apr 2026 sesiune END — "la fel cum acum am avut discutia asta... pe parcurs o sa mai tot avem, si ne trebuie un plan ca sa implementam si restul si sa nu rupem engine daca ne mai vine o idee... posibilitatea de imbunatatire in orice etapa fara sa moara."

**Concept:** Engine extensibil prin natura lui = orice idee viitoare devine layer adăugabil, NU rewrite. Open-Closed Principle + Hexagonal Architecture + Strategy Pattern.

**Spec componente:**
1. **Dimension Registry** — registry central declarativ unde dimensiuni se înregistrează. Coach Director iterează registry, NU hard-coded list.
2. **Standardized Dimension Contract** — fiecare dimension implementează `analyze(input) → {tier, confidence, signals[], recommendations[]}`. Tooling testabil identic.
3. **Decision Cluster Engine** — primește toate dimensiunile + reguli prioritate, computes final session adjustments. Adaugi dimensiune = înregistrează în cluster, NU edit cluster.
4. **Schema Migration Strategy** — versioned schema + migration runner. Schema v3 → v4 = migration automatic, backward compat.
5. **Feature Flags Infrastructure** — runtime feature flags → poți rola dimensiune nouă 10% useri → 50% → 100% bazat pe metrics.

**Effort:** ~1-2 zile spec design (Opus task — audit = exclusiv Opus).

**Why critical:** TOATE features viitoare (Vitality, synthetic, parametric programs, injury, nutrition, mood, etc.) build pe această fundație. Spec înainte de orice build feature previne refactor forțat later.

---

## ADR 016 — Vitality Layer (PRIORITY 2, depends ADR 018)

**Status:** Concept articulat, ADR pending spec.
**Source:** Daniel insight 27 apr 2026 — înlocuim bloodwork (Gigel test fail) cu întrebări behavioral proxy.

**Concept Daniel:** "intrebari scurte despre user — cum te simti, energic/normal, temperamental, dormi bine, etc. Combinat cu age+kg+height+BMI ne indica direcția approximativ. Behavioral proxy questions = signal puternic, friction zero."

**Întrebări candidate brainstorm:**
- Energie/Vitalitate: "Cum te simți în general?" / "Cum dormi?"
- Stres/Reactivitate: "Te-ai descrie ca temperamental?" / "Recovery post-antrenament?"
- Sleep quality: "Te trezești odihnit?"
- Motivație: "Cum te simți cu motivația în general?"
- Inflamație: "Cât de des te simți cu dureri?"

**NU includem (Gigel test fail):** întrebări directe libido, erecție, etc.

**Implementation pattern:**
- Opt-in post-onboarding, NU mandatory
- User decide când completează (sesiune 5, 10, 30, niciodată = OK)
- Engine inferă behavioral aproximativ după 20-30 sesiuni dacă user skip

**Working title:** "Vitality Layer". Posibili alternative: "State Signals", "Lifestyle Layer", "Recovery Profile". Decisive la spec time.

**Effort:** ~1 zi spec după ADR 018 done.

---

## ADR 017 — Demographic Prior Database (PRIORITY 3, depends ADR 018)

**Status:** Concept articulat, ADR pending spec.
**Source:** Daniel insight 27 apr 2026 — synthetic profiles diverse calibrate engine cross-demographic.

**Concept:** 500 profile diverse × 90 zile sesiuni synthetic = Demographic Prior Database = production infrastructure (NU test fixture). Engine la cold start consultă profile similar → personalizat aproximativ încă din sesiunea 1. Real sesiuni corectează prior pe parcurs.

**Profile mix 500 total:**
- ~50 manually crafted edge cases (Daniel HR 36, Gigel mecanic 45, Ana educatoare 55, Iasmina OF 18, Marius office 28, Elena mama 35, etc.)
- ~450 algorithmic generated cu variație controlată

**Storage:** local fixtures `tests/fixtures/syntheticProfiles.js`. Generated runtime memory pentru test runs. NU persist permanent. **Zero impact pe Firebase production cost.**

**Sweet spot 500:** dev workflow speed vs coverage density. Scale-able prin generator parametrizat.

**Effort:** ~1 zi spec + ~2-3 zile build după ADR 018 done.

---

## Engagement drop signal (v1.5/v2 candidate)

**Pattern:** 0 rated sets pe ≥3 sesiuni consecutive = engagement disengagement signal.

**Source:** AA design discussion 2026-04-26.

**Why backlog (NOT v1):**
- Re-engagement intervention requires separate ADR design
- Different from AA detection (auto-aggression) — opposite signal
- Needs UX flow (re-engagement prompt timing, wording)

**Reconsider trigger:** post-launch alpha, after seeing real disengagement patterns la users.

---

## Recommendation engine personalizat (Faza C profile, v1.5/v2)

**Open research:** profile-driven recommendations.

**Starting points (NU spec, ANCORE pentru future design):**
- Sprinter — planuri cu varietate (rotație exerciții, periodization?)
- Marathon — progresie graduală (increment kg mai mic, mai multe maintenance?)
- Yo-yo — TBD (probabil planuri scurte cu deload frecvent)
- Strategic — TBD (probabil maximum customization)

**Source:** AA design discussion 2026-04-26.

**Why backlog:**
- Faza B (post 50-100 useri) = wording personalizat per profile
- Faza C (v1.5/v2) = recommendation engine personalizat
- Ambele depind de validation comportamentală pe user data real

**Reconsider trigger:** post-50+ users behavioral data + Faza B done.

---

## Memory-aware questions (v1.5)

**Concept:** engine-ul nu pune aceleași întrebări de fiecare dată.

**Examples:**
- Sesiunea 1: "Cum a fost antrenamentul?"
- Sesiunea 2 (după "umărul m-a deranjat"): "Cum e umărul azi?"
- Sesiunea 3 (umăr ok 2 sesiuni la rând): nu mai întreabă, monitorizează silent

**Source:** Coaching textbook synthesis 25 apr 2026.

**Why backlog:** Necesită storage pe topics deschise + logic follow-up vs new question + resolved threshold. Effort ~1 săpt build. NU MVP launch priority.

**Reconsider trigger:** post-beta validation core engine.

---

## Self-audit weekly (v1.5)

**Concept:** engine self-check predictions vs realitate. "Recomandările mele de săpt trecută au funcționat? RPE actual vs predicted? Ce greșeam?"

**Source:** Coaching textbook synthesis 25 apr 2026.

**Why critical long-term:** asta e ce face engine-ul smart cu timpul, NU doar accumulator de date. Diferentiator real vs Fitbod/Strong (care nu fac asta).

**Why backlog now:** necesită storage pe predicții vechi vs realitate + comparare automată + feedback loop. Effort ~1-2 săpt build. NU MVP launch priority.

**Reconsider trigger:** post-beta + 50+ useri data.

---

## Calorii dinamic pe context (v1.5)

**Concept:** Calorii NU setting fix. Engine ajustează:
- Somn slab 3 nopți la rând → +200 kcal pentru recovery
- Stres ridicat → suspendă cut, propune maintenance
- Greutate scade > 1.5 kg/săpt → flag "prea agresiv", recomandă +150 kcal

**Source:** Coaching textbook synthesis 25 apr 2026.

**Why backlog:** Necesită sleep tracking integration + threshold thresholds noi în RuleEngine. Activate la PERSONALIZING+ (Tier 3+). Effort ~3-5 zile.

**Reconsider trigger:** post-Profile Typing + Vitality LIVE.

---

## Calibration recalibrare protocol (workflow doc, NU ADR)

**Status:** Daniel mention path `09-workflows/AA_RECALIBRATION_PROTOCOL.md`, NU built încă.
**Concept:** proces lunar review CDL vs experience reală, prima review luna 3.

**De ce workflow doc, NU ADR:** procedural process, NU architectural decision.

**Effort:** ~30-45 min draft.

**Reconsider trigger:** post-beta launch, prima review luna 3 calendar.

---

## Deload invizibil (post-launch sprint 9+)

**Concept:** engine detectează nevoia de deload, NU anunță explicit. Reduce volum 20-30%, păstrează greutățile la 80%, dacă user întreabă explică.

**Source:** Coaching textbook synthesis.

**Trade-off conceptual:** transparency vs UX. Argument PRO: user real nu vrea jargon "deload week". Argument CONTRA: SalaFull = trust-builders, NU manipulatori.

**Reconsider trigger:** A/B test cu useri reali post-launch.

---

## Mid-session intervention (post-launch sprint 9+)

**Concept:** dacă user raportează RPE 9 la set 2 din 4 (expected 7-8), engine întrerupe seria recomandată și propune scădere greutate.

**Source:** Coaching textbook synthesis.

**Why backlog:** mutare îndrăzneață care poate enerva user. Necesită UX testing serios. Activarea = candidate FAZA 4 sau 5, NU MVP.

**Reconsider trigger:** post-launch beta, după AA pipeline real-world calibrated.

---

## Skip / Not now (deferred indefinit)

- **Bloodwork** — DEFINITIV OUT (Memory permanent + DECISION_LOG entry 27 apr). NU readuce fără trigger explicit Daniel.
- **Sentiment analysis live** — LLM runtime cost prohibitiv pentru freemium model
- **Emotional voice detection** — voice input NU în roadmap, ML model dedicated
- **Hard refuse pe sănătate** — liability legal medical decision

---
