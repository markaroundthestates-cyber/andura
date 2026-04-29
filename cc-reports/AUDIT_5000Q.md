# AUDIT 5000Q — SalaFull comprehensive audit

**Generated:** 2026-04-29 (Daniel home Windows + CC + Opus 4.7 autonomous run)
**Model:** Opus 4.7
**Scope:** 15 domains, target 5000 questions, all major architectural / product / UX / monetization / GDPR / MOAT / edge case / failure decisions
**Format per Q:** DECIZIE / RAȚIONAL / IMPACT / SURSA / PUSH-BACK / STATUS (pending review Daniel)

## Index domenii

- DOMAIN 1 — ENGINE ARCHITECTURE (Q0001-Q0600)
  - 1.1 5-Engine pattern (HISTORICAL/REALTIME/PROJECTION/ARBITRATOR/ACTION)
  - 1.2 Dimension Registry + plugins
  - 1.3 Decision Cluster orchestration (GATE/ADJUSTMENT/ENHANCEMENT)
  - 1.4 CDL (Coach Decision Log) schema + idempotency + Tombstone & Branching
  - 1.5 Calibration tiers
  - 1.6 Pattern learning (adherence, deviation, suppression gates)
  - 1.7 Reality Engine validation
  - 1.8 Auto-Aggression Detection (5 signals + composite fatigue + tier logic)
- DOMAIN 2 — STORAGE & SYNC (Q0601-Q0800)
- DOMAIN 3 — USER INPUT & FRICTION (Q0801-Q1000)
- DOMAIN 4 — PRODUCT STRATEGY & MONETIZATION (Q1001-Q1400)
- DOMAIN 5 — GDPR & COMPLIANCE (Q1401-Q1600)
- DOMAIN 6 — UX & ONBOARDING (Q1601-Q2000)
- DOMAIN 7 — MOAT & ANTI-REVERSE-ENGINEERING (Q2001-Q2400)
- DOMAIN 8 — COGNITIVE ARCHITECTURE V1 (Q2401-Q3000)
- DOMAIN 9 — NUTRITION & BAYESIAN (Q3001-Q3300)
- DOMAIN 10 — MULTI-GYM ARCHITECTURE (Q3301-Q3500)
- DOMAIN 11 — EDGE CASES (Q3501-Q4000)
- DOMAIN 12 — FAILURE MODES (Q4001-Q4400)
- DOMAIN 13 — FUTURE SCALABILITY (Q4401-Q5000)

---

## BATCH 1 — Engine + Storage + User Input (Q0001-Q1000)

### DOMAIN 1: ENGINE ARCHITECTURE

#### 1.1 5-Engine pattern (HISTORICAL / REALTIME / PROJECTION / ARBITRATOR / ACTION)

Q-0001 [Domain 1.1 — 5-engine separation]
DECIZIE: Engine-ul cognitiv se separă în 5 componente — 3 voices temporale (HISTORICAL, REALTIME, PROJECTION), un ARBITRATOR pure-function și un ACTION engine cu rol de mutator unic.
RAȚIONAL: Match cognitive science (memorie + percepție prezent + anticipație + arbitraj + execuție); previne God Object pattern flagged Opus Nuclear Audit; Bugatti standard "antrenor olimpic care gândește ca un om".
IMPACT dacă greșită: SEVERE — întreaga MOAT story "Cognitive AI Coach" depinde de această separare. Monolit = parity cu Fitbod, lose differentiation.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §"5-engine cognitive architecture" line 30-65; DECISIONS LOCKED §1.
PUSH-BACK: 5 engines pentru 1 user (Daniel) e overengineering la N=1; 3 voices ar fi achievable cu ~30% mai puțin cost dev fără pierdere expressiveness; complexitate adaugă debugging cost cumulat.
STATUS: pending review Daniel

Q-0002 [Domain 1.1 — sequential vs parallel execution]
DECIZIE: Voices temporale rulează SEQUENTIAL (HISTORICAL → REALTIME → PROJECTION), NU paralel.
RAȚIONAL: Simpler, debuggable, no race conditions; cost ~150ms total acceptable; PROJECTION poate consuma output HISTORICAL+REALTIME ca input. R27 marked CORRECTED v2 după push-back (anterior era parallel).
IMPACT dacă greșită: MODERATE — paralelizarea ar reduce p99 latency cu 50-100ms, dar adaugă race conditions hard de debugged.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R27 line 162; PARTEA 9 §Q11 line 370.
PUSH-BACK: La N>10000 useri/zi cu cold-start workloads concurrent, sequential 150ms × N requests poate satura un single Cloud Function instance; merită measurement la 1000+ users înainte de lock-in.
STATUS: pending review Daniel

Q-0003 [Domain 1.1 — ARBITRATOR ca pure function]
DECIZIE: ARBITRATOR e pure function `f(VoiceVerdict[], UserTier, Context) → FinalDecision`, fără side effects, fără storage writes, fără I/O.
RAȚIONAL: 100% unit testable, deterministic, debuggable; matches R-categoria 8 performance + R27 sequential; CDL append-only doar prin ACTION engine.
IMPACT dacă greșită: SEVERE — pure function violation = state leak în ARBITRATOR = decizii non-reproductibile, debugging imposibil.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 9 §Q8 "State Mutation Discipline" line 351-356; §Q10 testing 100% line 364.
PUSH-BACK: Pure function rigid blocks legitimate caching optimizations (memoize per session_id) — ar putea fi acceptabilă dacă cache e externalizat în decorator.
STATUS: pending review Daniel

Q-0004 [Domain 1.1 — ACTION engine ca singurul mutator]
DECIZIE: ACTION engine e singurul cu mutation rights (CDL writes, session persist, event emission); voices + ARBITRATOR sunt read-only.
RAȚIONAL: Redux-style flow simpler să raționezi; Event Sourcing append-only; previne data corruption din race conditions cross-engine.
IMPACT dacă greșită: SEVERE — mutation leak în voice = corruption CDL + debugging coșmar; Tombstone & Branching pattern (planned) presupune append-only strict.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 9 §Q8 line 352 "ACTION Engine = singurul mutator (Redux flow)".
PUSH-BACK: Singura cale write = bottleneck dacă ACTION crashează; nu există fallback path. Failure în ACTION = nimic nu se persistă, dar voices pot rula degeaba.
STATUS: pending review Daniel

Q-0005 [Domain 1.1 — voice priority dynamic per Tier]
DECIZIE: Voice weights variază pe tier: T0=REALTIME 100%, T1=70/25/5, T2=60/30/10 (REAL/HIST/PROJ), marked INITIAL_V1_GUESSWORK.
RAȚIONAL: Cold start nu are istoric = REALTIME singura sursă semnal; cu sesiuni acumulate, HISTORICAL câștigă teren; recalibrate post 1000+ sessions data via Remote Config.
IMPACT dacă greșită: MODERATE — weights greșite produce decisions diluate dar non-catastrofic; recalibrabile post-data.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R8 line 92-96; §R9 INITIAL_V1_GUESSWORK marker.
PUSH-BACK: Tier transitions hard-coded (T0=0-4 sesiuni, T1=5-20, T2=21+) sunt arbitrary; user cu 21 sesiuni perfect logate vs user cu 21 sesiuni dezordonate primesc același tier — cantitate ≠ calitate.
STATUS: pending review Daniel cross-ref Q-0006

Q-0006 [Domain 1.1 — tier transitions data-driven]
DECIZIE: Tier transitions: T0=0-4 sesiuni, T1=5-20 sesiuni, T2=21+ sesiuni; calibration levels separate (COLD_START → INITIAL → DEVELOPING → PERSONALIZING → PERSONALIZED → OPTIMIZED).
RAȚIONAL: Threshold-uri count-based simple, predictible; fiecare tier un set diferit de minim sesiuni înainte de a unlock features.
IMPACT dacă greșită: MODERATE — user blocat în tier inferior primește experiență diluată; user promovat prematur primește decizii pe data insuficient.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q15 Cold Start UX line 401-404; ADR 009 calibration tiers.
PUSH-BACK: Sesiuni count nu reflectă span temporal — user cu 20 sesiuni în 1 lună (overtraining) vs 20 sesiuni în 1 an (sporadic) primesc același tier; ar trebui combinație count × span.
STATUS: pending review Daniel cross-ref Q-0005

Q-0007 [Domain 1.1 — Confidence weighting Additive Normalized]
DECIZIE: Score = Σ(Verdict_i × Weight_i × Confidence_i) / Σ(Weight_i) — Additive Normalized Weighted Sum, NU multiplicative.
RAȚIONAL: Confidence 0 NU anulează voice complet (multiplication trap evitat); CORRECTED v2 după push-back că multiplicative anulează semnal real cu confidence low dar weight high.
IMPACT dacă greșită: SEVERE — multiplicative reverteală subtle ar produce decisions blocate când o voice e momentan low-confidence dar critică.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R10 CORRECTED v2 line 103-107.
PUSH-BACK: Additive normalize permite voice cu high weight + low confidence să influențeze peste limit — ex: HISTORICAL weight 60% + confidence 20% = 12 puncte care diluează REALTIME 30% × 95% = 28.5 puncte, dar voice low-confidence still affects rezultat.
STATUS: pending review Daniel cross-ref Q-0008

Q-0008 [Domain 1.1 — confidence < 30% = ignored]
DECIZIE: Voice cu confidence < 30% e ignored automat + flag "Low Data Quality" → declanșează "Ask User" prompt pentru data quality improvement.
RAȚIONAL: Threshold disciplinar — voice fără date suficiente NU trebuie să polueze arbitraj; flag honest ("nu știm încă").
IMPACT dacă greșită: MODERATE — threshold prea high (30%) ignoră semnal valid; threshold prea low admite zgomot.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R11 line 109-110.
PUSH-BACK: 30% e arbitrary număr fără justificare empirică; ar putea fi 25% sau 35% — diferența e care voice ignored când. Trebuie testat empiric pe Golden Master Suite.
STATUS: pending review Daniel cross-ref Q-0007

Q-0009 [Domain 1.1 — Event Anchor pentru REALTIME boundary]
DECIZIE: REALTIME = data colectată strict după ultimul ciclu de somn înregistrat SAU de la ultima sesiune de antrenament logată (oricare e mai recentă).
RAȚIONAL: Boundary deterministic, zero fuzzy zones; CORRECTED v2 după push-back că "ultimele 12 ore" era arbitrar; previne silent coupling sleep cycle.
IMPACT dacă greșită: SEVERE — fuzzy boundary = REALTIME pollution cu HISTORICAL data = decizii bazate pe context greșit.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R22 CORRECTED v2 line 137-140.
PUSH-BACK: User care nu loghează somnul + nu loghează sesiuni 5+ zile → Event Anchor regresează arbitrar la prima dată cu signal; comportamentul edge case nu e specificat.
STATUS: pending review Daniel

Q-0010 [Domain 1.1 — PROJECTION 2 instanțe Tactical/Strategic]
DECIZIE: PROJECTION are 2 instanțe — "Next Session" (tactical, weight mare arbitraj) și "Next Mesocycle" (strategic, weight mic). Daily arbitration folosește exclusiv tactical.
RAȚIONAL: Strategic decisions (12-week plan) NU trebuie să afecteze decizia de azi (overcorrection risk); tactical e immediate-actionable.
IMPACT dacă greșită: MODERATE — confuzia tactical/strategic = decizii zilnice subordonate la goal de 3 luni = paralizia user (face nimic specific azi).
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R23 line 142-143.
PUSH-BACK: 2 instanțe duplicates compute cost; o instanță unică cu 2 outputs (tactical_action + strategic_advice) ar fi mai DRY.
STATUS: pending review Daniel

Q-0011 [Domain 1.1 — Time Decay Factor pondere]
DECIZIE: Recent past (7 zile) = 80% pondere, distant past (3+ luni) = 20% doar pentru macro-trends/safety flags. Marked INITIAL_V1_GUESSWORK.
RAȚIONAL: Recency bias sănătos — context curent prevalează; safety flags (injury history) păstrează relevance forever; recalibrate empirical.
IMPACT dacă greșită: MODERATE — decay greșit ignoră istoric relevant SAU supraponderează zgomot recent.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R21 line 134-136.
PUSH-BACK: Linear decay 7d/3mo nu reflectă realitatea biologică — adaptare hipertrofică se acumulează în luni, NU săptămâni; decay exponențial cu half-life 30 zile ar fi mai aproape de realitate.
STATUS: pending review Daniel

Q-0012 [Domain 1.1 — Single voice valid = decide direct]
DECIZIE: Când o singură voce e valid (others N/A) = decide direct + meta flag "Low Global System Confidence" silent backend, NU exposed user.
RAȚIONAL: Cold start cu doar REALTIME activ trebuie să producă decizie; flag-ul intern alertează că arbitrajul e degradat fără să sperie user-ul.
IMPACT dacă greșită: MODERATE — exposing flag user-ului = "AI nu știe ce face" = pierdere trust; ascunderea totală = AI uniform de încrezător chiar și când nu are date.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R15 line 121-122.
PUSH-BACK: "Silent backend" violates user agency principle — user are dreptul să știe când AI-ul lucrează cu date insuficient. Disclosure proporțional cu severity ar fi mai onest.
STATUS: pending review Daniel cross-ref Q-0008

Q-0013 [Domain 1.1 — Engine crash → Graceful Degradation]
DECIZIE: Engine crash = continue cu 2/3 voices ca cold-start partial. Silent error log.
RAȚIONAL: Resilience peste perfecționism; user nu trebuie să vadă "Coach offline" când o voce a picat; log silent permite debugging post-mortem.
IMPACT dacă greșită: SEVERE — silent log poate ascunde bug systemic; 2/3 voices în mod permanent pot produce decisions greșite consistent fără ca cineva să observe.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R19 line 130-131; §Q9 Failure Modes line 358-362.
PUSH-BACK: "Silent" nu rezolvă problema — Sentry alert critical pentru orice voice crash + degraded mode banner subtil în UI ar fi mai onest.
STATUS: pending review Daniel cross-ref Q-0012

Q-0014 [Domain 1.1 — REALTIME timeout 1.5s]
DECIZIE: REALTIME timeout 1.5s → empty verdict cu confidence 0 + graceful degradation.
RAȚIONAL: Hard timeout previne UI freeze; empty verdict + low confidence permite restul arbitrajului să continue cu HISTORICAL+PROJECTION.
IMPACT dacă greșită: MODERATE — 1.5s e arbitrary; prea low = false timeout pe rețea slabă; prea high = UI lag perceptible.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q9 Failure Modes line 360.
PUSH-BACK: 1.5s e long pentru REALTIME (definition: data colectată recent, deja local); dacă timeout e frecvent înseamnă că REALTIME face I/O care nu ar trebui — symptom de design flaw, NU value de tunat.
STATUS: pending review Daniel

Q-0015 [Domain 1.1 — first session zero history → ARBITRATION skip total]
DECIZIE: First session zero history = ARBITRATION skip total. Direct la Cold Start Logic (~3-5 sesiuni minimum pentru HISTORICAL/PROJECTION basic).
RAȚIONAL: ARBITRATION fără date = cycle de zero; bypass direct e cleaner; demographic prior database (ADR 017) fills gap until istoric real.
IMPACT dacă greșită: SEVERE — without bypass, first user session crashează arbitraj; without demographic prior fallback, decision = static template = zero personalization.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R20 line 132-133; ADR 017 Demographic Prior backlog.
PUSH-BACK: 3-5 sesiuni e arbitrary; user power cu 3 sesiuni serioase poate avea mai mult context util decât user beginner cu 10 sesiuni dezorganizate.
STATUS: pending review Daniel cross-ref Q-0006

Q-0016 [Domain 1.1 — HISTORICAL Safety Flag absolute override]
DECIZIE: HISTORICAL Safety Flag (injury history, force drop + pain) = absolute override asupra PROJECTION și REALTIME.
RAȚIONAL: Siguranța biologică non-negotiable; injury repetate cost luni de antrenamente vs progress de săptămâni; asymmetric risk justifies override.
IMPACT dacă greșită: CATASTROFIC — fără override, AI poate recomanda exercițiu care re-injury → user lawsuit + brand damage; risk asymmetric.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R6 line 86-87; §R16 conservative override line 124-126.
PUSH-BACK: "Injury history forever" poate produce false positives 5 ani mai târziu — user vindecat complet primește ban permanent pe exercițiu; trebuie expiry sau user-confirmed clearance.
STATUS: pending review Daniel cross-ref Q-0017

Q-0017 [Domain 1.1 — User Agency > Paternalism AI]
DECIZIE: User explicit override accepted, dar internal "Liability Flag" salvat backend. Warning friendly + safest config.
RAȚIONAL: User adult; final decision e user's; AI = advisor, NU dictator; liability flag protejează firmă legal.
IMPACT dacă greșită: SEVERE — override prea permisiv ignoră safety net; override prea restrictiv = paternalism = churn.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R17 line 127-128; PRODUCT_STRATEGY §5.11 SAFETY ASYMMETRIC PRINCIPLE line 215-225.
PUSH-BACK: "Liability flag silent backend" e legal-ese — disclosure transparent în settings ("ai ales overriding pe X data") ar fi mai user-friendly fără pierdere protecție legală.
STATUS: pending review Daniel cross-ref Q-0016

Q-0018 [Domain 1.1 — Data inconsistency → Fail-safe Rule Engine]
DECIZIE: HISTORICAL says A, raw log says NOT A = Fail-safe Rule Engine. Generic template livrat user, alert critic backend pentru debug.
RAȚIONAL: Inconsistency = bug undetected = AI nu trebuie să decidă pe data corupt; safe template = path conservatoare.
IMPACT dacă greșită: SEVERE — fail-safe trigger silent permite bug să persiste; alert critical backend asigură detection rapid.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R18 line 129.
PUSH-BACK: "Generic template" definește ce — template per phase (CUT/BULK)? template per experience tier? lipsă precizie aici = implementation ambiguity.
STATUS: pending review Daniel

Q-0019 [Domain 1.1 — Tie-breaking Safe Action]
DECIZIE: Default "Safe Action" (Minimum Effective Dose) când confidence diffuse. Rule Engine static fallback.
RAȚIONAL: Cu confidence împărțit, AI nu are signal clar — better safe than over-aggressive; MED principle = minimum risk for likely benefit.
IMPACT dacă greșită: MODERATE — overly conservative tie-break = progress sub-optim cumulativ; missed PR opportunities.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R13 line 116; §Categoria 4 tie-breaking.
PUSH-BACK: "Safe Action" definiția e vagă — minimum sets? minimum weight? minimum exercises? Ambiguity = inconsistent application.
STATUS: pending review Daniel

Q-0020 [Domain 1.1 — Consensus 100% high-confidence = Fast-Path]
DECIZIE: Consensus 100% high-confidence = Fast-Path Execution. Bypass arbitration overhead.
RAȚIONAL: 3 voices unanimous + high confidence = arbitraj redundant; skip salvează ~50ms latency.
IMPACT dacă greșită: MINOR — fast-path bypass păstrează corectness doar accelerează; risc maxim e dacă "high confidence" e mis-defined.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R14 line 119.
PUSH-BACK: 50ms savings nu justifică complexitate fast-path branch — debugging path dual harder; clean uniform path ar fi mai mentenabil pentru pierderi minore performance.
STATUS: pending review Daniel cross-ref Q-0014

Q-0021 [Domain 1.1 — Cached între sessions cu 6 invalidation triggers]
DECIZIE: Cached între sessions cu 6 invalidation triggers explicit: Readiness < 4, Failed_Set, User_Substitutes, Missed > 2, Injury_Reported, Macro_Change.
RAȚIONAL: Caching reduce cost compute; 6 triggers acoperă majoritatea schimbărilor relevante; modificări greutate minore (±2.5kg) NU invalidează (handled local PROJECTION).
IMPACT dacă greșită: MODERATE — invalidation incomplete = decisions stale; over-invalidation = no caching benefit.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R26 line 152-160.
PUSH-BACK: 6 triggers e listă închisă; user adaugă goal nou (ex: hypertrophy + powerlifting hybrid) — există un trigger pentru asta? Trebuie extensible pattern.
STATUS: pending review Daniel

Q-0022 [Domain 1.1 — VoiceVerdict standardized schema]
DECIZIE: Toate voices return shape uniform: { voice_id, action_intent (DELOAD|PUSH|MAINTAIN|MODIFY|SKIP), magnitude 0-1, confidence 0-1, action_type (SAFETY|PREFERENCE|OPTIMIZATION), safety_flag, rationale_codes[], metadata }.
RAȚIONAL: ARBITRATOR voice-agnostic = procesare uniformă; tooling generic; testing 100% acoperit cu mock voices.
IMPACT dacă greșită: SEVERE — schema breaking change forțează refactor toate voices simultane; schema incomplete = workarounds în voices.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 2 line 167-188.
PUSH-BACK: 5 action_intent enum prea restrictiv — "MODIFY" catch-all pentru ce? Schimbare exercițiu? Schimbare ordine? Schimbare grup mușchi? Granularitate insuficientă.
STATUS: pending review Daniel cross-ref Q-0023

Q-0023 [Domain 1.1 — magnitude 0.0-1.0 normalized]
DECIZIE: magnitude e număr 0.0-1.0; ex: DELOAD 0.2 = -20% volum.
RAȚIONAL: Normalizat = compoziție multiplicativă în ADJUSTMENT stage simple; UI poate map la procente lizibile.
IMPACT dacă greșită: MODERATE — non-normalized magnitude (ex: 20 = -20%) ar fi ambiguu vs 20 = 20% increase.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 line 178.
PUSH-BACK: 0-1 range pierde semn; PUSH cu magnitude 0.3 = +30% sau -30%? Action_intent rezolvă semantic dar la math layer ambiguitate persistă.
STATUS: pending review Daniel cross-ref Q-0022

Q-0024 [Domain 1.1 — action_type enum SAFETY/PREFERENCE/OPTIMIZATION]
DECIZIE: action_type ∈ {SAFETY, PREFERENCE, OPTIMIZATION}. Hardcoded enum schema-level, NU runtime classification.
RAȚIONAL: Enum imuabil = no surprise classifications; routing pe Action Type Matrix simplu.
IMPACT dacă greșită: MODERATE — categorie nouă necesară (ex: HEALTH_OBSERVATION) blocked de schema rigidity.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 4 line 215-235.
PUSH-BACK: 3 categorii prea coarse — "SAFETY" mixează injury risk cu eating disorder cu medical clearance; should split SAFETY_PHYSICAL/SAFETY_PSYCHOLOGICAL/SAFETY_MEDICAL.
STATUS: pending review Daniel

Q-0025 [Domain 1.1 — rationale_codes 100-150+]
DECIZIE: Rationale codes total 100-150+ codes cu naming convention [DOMAIN]_[INTENT]_[REASON]. Tiered: SAFETY/PREFERENCE always-on, OPTIMIZATION fallback aggregate.
RAȚIONAL: Granularitate suficientă pentru explicabilitate ("Why?" button); naming convention permite codification programmatic; tiered = nu spam user cu aggregate la fiecare decizie.
IMPACT dacă greșită: MODERATE — codes prea puțin = explanations vagi; codes prea multe = entropy în i18n bundle.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Push-back #5 line 451; PARTEA 8 §Q5 line 327-330.
PUSH-BACK: 100-150 codes generează 100-150 string-uri × 2 limbi (RO+EN) × multiple variations = 600+ translation entries; maintenance burden la scale.
STATUS: pending review Daniel cross-ref Q-0026

Q-0026 [Domain 1.1 — i18n bundle decoupled din Arbitrator]
DECIZIE: Rationale codes hardcoded enums în Arbitrator + JSON i18n bundle în Frontend. Auto-detect locale + user override dropdown.
RAȚIONAL: Arbitrator pure = fără I/O dependencies; presentation layer ownership translation = i18n update fără engine deploy.
IMPACT dacă greșită: MODERATE — coupling i18n în Arbitrator = engine deploy needed pentru language fix; cluttering arbitration logic cu strings.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 8 §Q5 line 327-330.
PUSH-BACK: Hardcoded enum în Arbitrator + JSON în frontend = 2 sources of truth; rename code în Arbitrator without sync JSON = key not found errors silent.
STATUS: pending review Daniel cross-ref Q-0025

Q-0027 [Domain 1.1 — Precedence Rule 5 nivele]
DECIZIE: Arbitration precedence strict 5 nivele: 1) Safety_Flag, 2) User_Explicit_Override, 3) Action Type routing, 4) Consensus 2/3 + avg conf > 65%, 5) Math Fallback (Additive Normalized).
RAȚIONAL: Lanț de comandă explicit elimină ambiguity; prima condiție îndeplinită câștigă; debugging clear ("decision came from level X").
IMPACT dacă greșită: SEVERE — precedence neclar = decisions inconsistent în same context; debugging coșmar.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 3 line 192-213.
PUSH-BACK: User_Explicit_Override e Level 2 deasupra Action Type — dar override poate fi pe SAFETY (level 3 routing trebuia să bypass HISTORICAL); ordine creates conflict când safety SI override coexistă.
STATUS: pending review Daniel

Q-0028 [Domain 1.1 — Consensus rule confidence > 65%]
DECIZIE: 2/3 voices same action_intent + avg confidence > 65% → override 3rd voice (UNLESS 3rd has safety_flag).
RAȚIONAL: Majority cu confidence rezonabil = signal solid; safety flag exception păstrează override pentru risc real.
IMPACT dacă greșită: MODERATE — threshold 65% arbitrary; prea low = false consensus; prea high = nicicând trigger.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 3 Nivel 4 line 207-209.
PUSH-BACK: 65% e magic number fără justificare; trebuie testat pe Golden Master Suite (250+ profile sintetic) pentru calibrare.
STATUS: pending review Daniel cross-ref Q-0008

Q-0029 [Domain 1.1 — Math Fallback exclusively OPTIMIZATION]
DECIZIE: Additive Normalized Weighted Sum (R10) folosit exclusiv pentru OPTIMIZATION. Fine-tuning subtle.
RAȚIONAL: Math fallback pentru schemă progresie / range repetări / timp odihnă — aspecte unde nuance contează; SAFETY și PREFERENCE rezolvate prin precedence rules.
IMPACT dacă greșită: MODERATE — math aplicat la SAFETY = average safety + non-safety = decizie unsafe; restricția la OPTIMIZATION e safety guard.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 3 Nivel 5 line 211-213.
PUSH-BACK: Math fallback rezolvă NUMAI cazul unde toate 3 voices au action_type OPTIMIZATION; mixed PREFERENCE+OPTIMIZATION nu are decizie clară.
STATUS: pending review Daniel

Q-0030 [Domain 1.1 — Action Type Matrix routing]
DECIZIE: SAFETY → bypass HISTORICAL/Rule Engine safe; PREFERENCE → "Ask User" UI prompt când conflict; OPTIMIZATION → continue la Math Fallback.
RAȚIONAL: Routing per action type asigură UX corect — user-ul nu primește prompt pentru SAFETY (bypass), nu primește auto-decision pentru PREFERENCE (Ask).
IMPACT dacă greșită: SEVERE — SAFETY routed prin Math = average + dilute = unsafe; PREFERENCE auto = paternalism.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 3 Nivel 3 line 202-205.
PUSH-BACK: "Ask User" interrupts flow — în mid-session, prompts pentru PREFERENCE = friction inacceptabil; trebuie batch sau end-of-session.
STATUS: pending review Daniel cross-ref Q-0017

Q-0031 [Domain 1.1 — escalation_tracker în Mesocycle Context]
DECIZIE: State Tracker pentru escalation R5 stocat în Mesocycle Context (CDL extension), NU în engine.
RAȚIONAL: PROJECTION rămâne pure function f(data, tracker)→verdict; tracker mutated exclusively de ARBITRATOR/CDL post-decisie.
IMPACT dacă greșită: SEVERE — engine state mutable = pure function violation = decisions non-reproductible; testing imposibil.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 6 line 251-285.
PUSH-BACK: Tracker în Mesocycle Context creates coupling — CDL extension trebuie sync cu PROJECTION expectations; schema drift inevitable.
STATUS: pending review Daniel cross-ref Q-0003

Q-0032 [Domain 1.1 — escalation counter reset rules]
DECIZIE: ARBITRATOR ascultat (volum tăiat) → counter reset 0; problem rezolvat natural → counter reset 0; user override + ignore PROJECTION → count incrementat → boost massive next session.
RAȚIONAL: Reset rules disting între escalation legitimă (PROJECTION ignored repetat) vs rezolvare; boost gradual previne spam warnings.
IMPACT dacă greșită: SEVERE — reset prea agresiv = no escalation possible; reset insuficient = warnings permanente după rezolvare.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 6 line 277-285.
PUSH-BACK: "Ascultat" semantic — ce dacă user a ascultat parțial (50% volume cut în loc de 70% recomandat)? Counter increment, decrement sau hold?
STATUS: pending review Daniel

Q-0033 [Domain 1.1 — performance budget sub 300ms]
DECIZIE: Total user-perceived budget: sub 300ms (50ms DB + 150ms Voices+Arbitrator + 100ms UI).
RAȚIONAL: Sub 300ms = perceived instant; 150ms voices acoperă HISTORICAL+REALTIME+PROJECTION sequential; 50ms DB pentru read CDL active entries.
IMPACT dacă greșită: MODERATE — peste 300ms = UI lag perceptible; user pleacă din coach screen înainte de decision.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q11 Performance line 367-371.
PUSH-BACK: 300ms total e ambitious — cu Cloud Function cold start, Firebase round-trip RO timezone, p99 latency real probabil 500-800ms.
STATUS: pending review Daniel cross-ref Q-0034

Q-0034 [Domain 1.1 — HISTORICAL pre-computed sliding windows]
DECIZIE: HISTORICAL scale pe Pre-computed Sliding Windows via Firebase Cloud Function (NU client-side). Incremental O(diff) NU full O(N). Last 14 zile raw + aggregate profile.
RAȚIONAL: Client-side full scan O(N) la 250+ entries (180 zile) = 50-200ms; Cloud Function pre-compute = O(1) read; aggregate cached.
IMPACT dacă greșită: SEVERE — client full scan pe device slab (Android entry-level) = 1-3s freeze; UX inacceptabil.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q11 CORRECTED v2 line 369-371.
PUSH-BACK: Cloud Functions = vendor lock-in Firebase; cost recurring; latency cold-start pe RO. Self-hosted aggregation worker-node ar fi mai cost-flexible la scale.
STATUS: pending review Daniel

Q-0035 [Domain 1.1 — Cold start sub 500ms]
DECIZIE: Cold start engine sub 500ms.
RAȚIONAL: Aplicație instalată recent + first session = perceived instant; depășire = "PWA-ul ăsta e lent" first impression.
IMPACT dacă greșită: SEVERE — first impression la PWA = decizie keep/uninstall; > 500ms = high churn.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q11 line 371.
PUSH-BACK: Cold start include service worker registration, IndexedDB init, demographic prior load — 500ms ambitious pe device entry-level.
STATUS: pending review Daniel cross-ref Q-0033

Q-0036 [Domain 1.1 — Schema Matrix Rule ADD/CHANGE/INTRODUCE]
DECIZIE: ADD (optional fields) silent backward-compatible; CHANGE/REMOVE (renames, structural) Mandatory Migration Runner script; INTRODUCE (voce nouă) Cold Start Explicit (NU Backfill), pondere 0% inițial → calibrare 7-14 zile → weight.
RAȚIONAL: ADD safe pentru evoluție organică; CHANGE necesită migration explicit pentru consistency; INTRODUCE cold start previne data invention pe entries vechi.
IMPACT dacă greșită: SEVERE — voce nouă cu backfill = AI invents history = decisions on fabricated data = invalidates entire trust story.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q12 Schema Matrix line 374-379.
PUSH-BACK: "Listening mode 7-14 zile" subiectiv — 7 zile pe user activ vs 14 zile pe user sporadic = vastly different actual session counts; mai bine threshold pe sesiuni count.
STATUS: pending review Daniel cross-ref Q-0037

Q-0037 [Domain 1.1 — voce nouă listening mode 7-14 zile]
DECIZIE: Voce nouă intră cu pondere 0% (listening mode 7-14 zile) → calibrare → capătă weight gradually.
RAȚIONAL: Listening mode permite empirical observation diff voice predictions vs final decision; calibrare bazată pe agreement rate.
IMPACT dacă greșită: MODERATE — voce activată instant cu weight high = decisions instable; listening prea long = feature delivery lentă.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q12 line 378-379.
PUSH-BACK: "Calibrare empirical" lipsește algoritm specific — cum se decide weight? agreement rate? prediction accuracy retrospective? Open question cum se face graduality.
STATUS: pending review Daniel cross-ref Q-0036

Q-0038 [Domain 1.1 — DI Service Locator pattern]
DECIZIE: Engine boundary enforcement via Dependency Injection (DI) Container pattern. Mocking facile (JSON statice, NU engines reali). Plugin (VITALITY) = engine independent implementing IVoiceEngine, registered în Voices Array.
RAȚIONAL: Testability + extensibility; voce nouă registrabilă fără edit core; mock data substitution pentru regression.
IMPACT dacă greșită: SEVERE — DI omis = direct imports = circular deps possible; testing forced cu real engines = slow + flaky.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q13 line 380-383.
PUSH-BACK: DI container in vanilla JS (NO framework) e DIY hand-rolled = bug surface; framework (InversifyJS) ar simplifica dar adaugă dep.
STATUS: pending review Daniel cross-ref Q-0039

Q-0039 [Domain 1.1 — TypeScript pe engine, vanilla JS pe UI]
DECIZIE: Engine Core = TypeScript (Arbitrator, Voices, Dimensions); Frontend/UI = Vanilla JS + Web Components (sau JSDoc TypeScript).
RAȚIONAL: Engine cu complexitate matematică + interfețe necesită type safety; UI dumb client = randează state TS, vanilla suficient.
IMPACT dacă greșită: SEVERE — fully TS = build complexity unnecesar pentru UI dumb; fully JS = type errors în engine subtle silent.
SURSA: PRODUCT_STRATEGY §7.1 POST PUSH-BACK #3 line 267-269; ADR 005.
PUSH-BACK: Mixed TS/JS = 2 toolchains (tsc + JSDoc validator) = developer overhead; full TS migration ar fi consolidation eventual mai bună.
STATUS: pending review Daniel

Q-0040 [Domain 1.1 — Open/Closed Principle pentru voice additions]
DECIZIE: Voice additions follow Open/Closed Principle (SOLID) — open for extension via registry, closed for modification în Arbitrator core.
RAȚIONAL: Adăugarea voce nouă = nou modul + register în registry, NU edit Arbitrator; previne regression cross-voice.
IMPACT dacă greșită: SEVERE — Closed violated = each voice add edits Arbitrator = regression risk multiplicat.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q10 Testing line 365.
PUSH-BACK: SOLID principles aspirational — în practică Arbitrator may need extension când signal nou (cross-voice dependencies) emerge; OCP teoretic > pragmatic.
STATUS: pending review Daniel cross-ref Q-0038

Q-0041 [Domain 1.1 — Golden Master Suite 250+ profile sintetice]
DECIZIE: Golden Master Suite cu 250+ profile sintetice (NU 50). Mix demographic + experience + edge cases.
RAȚIONAL: Regression testing pe diverse profile = cover decisions în multiple contexte; 250 minimum pentru meaningful coverage.
IMPACT dacă greșită: SEVERE — 50 prea puțin = blind spots largi; 1000 prea multe = test runtime imposibil.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q10 line 365; ADR 017 Demographic Prior 500 profile total.
PUSH-BACK: 250 sintetice generated ar putea avea bias sistemic în generator — variația controlată = same blind spot replicat 250×; manual crafted edge cases mai valuable cantitativ.
STATUS: pending review Daniel cross-ref Q-0042

Q-0042 [Domain 1.1 — testing coverage targets per layer]
DECIZIE: Voices 90%+ unit; ARBITRATOR 100% unit; Integration Layer 70%+; e2e via Golden Master Suite.
RAȚIONAL: Voices = pure functions ușor de unit-test; ARBITRATOR = math + IF-ELSE perfect testable; integration = setup-heavy.
IMPACT dacă greșită: SEVERE — coverage low pe ARBITRATOR = bugs în precedence rules silenț; coverage low pe voices = false outputs.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q10 line 363-365.
PUSH-BACK: "100% ARBITRATOR" mathematic posibil dar e measure of confidence false — covered ≠ correct; mutation testing ar fi mai informativ.
STATUS: pending review Daniel cross-ref Q-0041

Q-0043 [Domain 1.1 — Cloud Functions confirmat necesare]
DECIZIE: Cloud Functions confirmat necesare pentru aggregation (HISTORICAL pre-computed sliding windows). Cost ~cents/lună. Separate ADR needed.
RAȚIONAL: Client-side aggregation O(N) pe entries vechi = perfomance fail; Firebase Cloud Function eliminate race conditions Phone A/B aggregation.
IMPACT dacă greșită: SEVERE — fără Cloud Functions, aggregation client-side la 1000+ users = battery drain device + UI lag.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §"Cloud Functions ADR" open issue line 434-436; PRODUCT_STRATEGY §"Open Items" line 487.
PUSH-BACK: Cloud Functions = vendor dependency Firebase; cost minor azi dar la 100K users + writes per day = $$$; alt path ar fi DynamoDB + Lambda în AWS.
STATUS: pending review Daniel cross-ref Q-0034

Q-0044 [Domain 1.1 — Strangler Fig pattern pentru migration]
DECIZIE: Migration coachDirector → 5-engine architecture follows Strangler Fig pattern — build new parallel cu old, flag ON Daniel first dogfooding, gradual cutover post-validation.
RAȚIONAL: Big-bang refactor pe core engine = brick risk; parallel run permite validation + rollback path.
IMPACT dacă greșită: CATASTROFIC — big-bang fail = entire engine offline = aplicația nu poate genera sesiuni.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §"Build prototype Shadow Run" line 460-461; ADR 018 Faza 1-3 strangler.
PUSH-BACK: Parallel paths consume 2× engineering time; complexitate dual-path debugging; "temporary" strangler poate persista peste 1 an dacă pressuri product.
STATUS: pending review Daniel cross-ref Q-0045

Q-0045 [Domain 1.1 — Shadow Run NU rollout gradual]
DECIZIE: Shadow Run NU rollout gradual pe % users; NEW engine rulează parallel pe 100% users dar output vechi = served, NEW = compared.
RAȚIONAL: 100% comparison data = catch all divergences; 0% risk users (vechi served); Strangler Fig superior pattern.
IMPACT dacă greșită: MODERATE — shadow run cu performance overhead 2× pentru toți users; dacă NEW crashează silent, no impact dar log spam.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q4 Shadow Run line 318-323.
PUSH-BACK: 2× compute pe toți users = 2× cost Firebase reads; la N=1000+ users devine perceptible în budget.
STATUS: pending review Daniel cross-ref Q-0044

Q-0046 [Domain 1.1 — divergence target 0% Unexplained Structural]
DECIZIE: Target = 0% Unexplained Structural Divergence (NU 100% match — vechi imperfect). Cantitative diff (OPTIMIZATION) Log & Ignore; Structural diff (SAFETY/PREFERENCE) Alert Trigger.
RAȚIONAL: Vechi engine are bugs cunoscute — match perfect ar însemna replicare bugs; "Structural" = action_intent / safety classification, NU magnitudes.
IMPACT dacă greșită: SEVERE — confounding "improvement" cu "regression" = NEW engine ship cu degradare ascunsă.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q4 line 320-323.
PUSH-BACK: "Structural" definiție ambiguă — change exercițiu (PUSH→PULL) e structural, dar +5kg vs +2.5kg progression e ce? Granițele neclare = arguments fiecare divergence.
STATUS: pending review Daniel

Q-0047 [Domain 1.1 — Sonnet clustering automated divergence]
DECIZIE: Discrepanțe sistematice = "Baseline Behavior Shift" documented; Sonnet clustering automated → Daniel review per cluster (NU per case).
RAȚIONAL: Per-case review imposibil la 1000+ users × 250+ sessions/day; clustering identifică pattern-uri (ex: "in tier T0 cu cut, NEW e mai conservative").
IMPACT dacă greșită: SEVERE — clustering eșec = divergence flood inundă review backlog; Daniel cognitive fatigue + missed real bugs.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q4 line 322.
PUSH-BACK: Sonnet clustering = LLM dependency în pipeline; clustering quality variable; alternative = simple statistical clustering (k-means pe feature vectors).
STATUS: pending review Daniel cross-ref Q-0046

Q-0048 [Domain 1.1 — Hot Storage 30-60 zile Telemetry]
DECIZIE: Telemetry Hot Storage 30-60 zile (debugging, support, dashboards). Cold Storage Permanent (Data Lake — viitor ML v2.x).
RAȚIONAL: Hot 30-60d = recent issues debug; Cold permanent = future ML training when scale demands; tiered storage = cost optimal.
IMPACT dacă greșită: MODERATE — Hot prea scurt = debug imposibil pe issues > 60d; Hot prea lung = cost + GDPR retention concerns.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q6 Telemetry line 332-339.
PUSH-BACK: 30-60 zile e range largă — care e default? 30 = aggressive cleanup, 60 = balance; lipsă specific.
STATUS: pending review Daniel cross-ref Q-0049

Q-0049 [Domain 1.1 — GDPR Anonymize NU delete]
DECIZIE: GDPR pentru telemetry = Anonymize NU delete (păstrează math/confidence pentru research); UUID → DELETED_USER, păstrăm age/decision/math.
RAȚIONAL: Anonymized data = ML training value preserved; user-rights respected; arbitration_log payload pierde PII.
IMPACT dacă greșită: CATASTROFIC dacă anonymization incompletă = re-identification = GDPR fine + brand damage; CATASTROFIC dacă delete = pierdere training data permanent.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q6 GDPR line 335; §Q14 line 391-393.
PUSH-BACK: "Păstrăm age/decision/math" — combinația age + decision pattern + timestamps poate re-identifica user în small-N dataset; k-anonymity validation needed.
STATUS: pending review Daniel cross-ref Q-0050

Q-0050 [Domain 1.1 — sampling 100% phase 1 + degradare progresivă]
DECIZIE: Sampling 100% Phase 1 (alpha) + 3 luni live → 100% SAFETY/Override + 10% OPTIMIZATION boring.
RAȚIONAL: Fully sampled = catch bugs early; reducere progresivă pe events care nu schimbă pattern (OPTIMIZATION boring); SAFETY rămâne 100% forever.
IMPACT dacă greșită: MODERATE — sampling redus prea repede = miss late bugs; sampling prea mare la scale = cost.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q6 line 337.
PUSH-BACK: "Boring" = subjective; care e pragul ca un OPTIMIZATION devine "boring" și down-sampled? Lipsă specific.
STATUS: pending review Daniel cross-ref Q-0048

Q-0051 [Domain 1.1 — real-time dashboard mandatory 3 graphics]
DECIZIE: Real-time dashboard MANDATORY cu 3 graphics: Divergence Rate, Low Confidence Fallbacks, User Override Rate.
RAȚIONAL: Dashboard live = early warning system; 3 metrice acoperă health engine fără overload visual.
IMPACT dacă greșită: SEVERE — dashboard absent = bugs descoperite via user complaint; reactive vs proactive.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q6 line 339.
PUSH-BACK: 3 graphics minimal — lipsesc latency p99, error rate, success rate by tier; vor fi adăugate v2 sau dashboard rămâne minimalist.
STATUS: pending review Daniel cross-ref Q-0048

Q-0052 [Domain 1.1 — low_confidence_fallback warning 3% rolling 3 zile]
DECIZIE: Threshold Warning 3% rolling 3 zile → Slack report la Data team. Probable cause: API 3rd party (Apple Health) picat silent → REALTIME context lipsă.
RAȚIONAL: 3% rolling 3 zile = signal stable nu spike-uri tranziente; Slack = visibility echipă.
IMPACT dacă greșită: MODERATE — threshold prea low = false alerts; prea high = miss real degradation.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 5 line 240-243.
PUSH-BACK: 3% e arbitrary fără baseline measurement; first 3 luni real production data ar trebui să stabilească baseline înainte de threshold tuning.
STATUS: pending review Daniel cross-ref Q-0053

Q-0053 [Domain 1.1 — low_confidence_fallback critical 5% rolling 24h]
DECIZIE: Threshold Critical 5% rolling 24h → Trigger investigation sistemică. Probable cause: Bug Engine → voice constant confidence 0 → fallback permanent.
RAȚIONAL: 5%/24h = acute degradation; trigger investigation = engineering paged.
IMPACT dacă greșită: SEVERE — threshold prea high = bugs persist; prea low = false positive paging fatigue.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 5 line 245-247.
PUSH-BACK: 5% sounds low pe scale — la 1000 users × 5 sessions/zi = 250 incidents/zi tolerated; absolute counts ar fi mai actionable.
STATUS: pending review Daniel cross-ref Q-0052

Q-0054 [Domain 1.1 — low_confidence_fallback Health Metric NU cimitir]
DECIZIE: low_confidence_fallback_used = Health Metric activă, NU cimitir date.
RAȚIONAL: Metric activ = monitor live; "cimitir" = log fără action = waste; presence forces engineering attention.
IMPACT dacă greșită: MINOR — metric definition philosophy; impact concret e how metric e consumat downstream.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 5 line 239.
PUSH-BACK: "Health Metric" e bumper-sticker — concrete = on-call rotation cu paging on Critical threshold; vague philosophy = nimeni reacționează.
STATUS: pending review Daniel

Q-0055 [Domain 1.1 — Quarterly Review automated 90 zile]
DECIZIE: Automated check 90 zile. Rules/codes nu declanșate 3 luni → [DEPRECATION_WARNING] automat. Propuse pentru ștergere.
RAȚIONAL: Code rot prevention; rules/codes orphan = mental load engineering = cleanup automat.
IMPACT dacă greșită: MODERATE — auto-deprecation prea agresivă = legitimate edge case rules șterse; prea pasivă = code bloat.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Quarterly Review line 305-307.
PUSH-BACK: 3 luni inactivity = false positive pe edge cases — ex: pregnancy mode trigger doar la users gravide; trigger natural rate < 1%/an dar legitimate.
STATUS: pending review Daniel cross-ref Q-0056

Q-0056 [Domain 1.1 — JSON Meta-Data Requirement no magic numbers]
DECIZIE: Niciun magic number raw în config. Wrapped object cu rationale, owner, last_reviewed.
RAȚIONAL: Documentation discipline; debugging facil ("de ce e 1.5?"); ownership clear.
IMPACT dacă greșită: SEVERE — magic numbers proliferate = onboarding eng nightmare = "ce e 0.3 aici?"
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §A line 291-303.
PUSH-BACK: Verbosity adds friction la edit configs — every value needs metadata = 5× LOC; balance discipline cu pragmatism.
STATUS: pending review Daniel cross-ref Q-0057

Q-0057 [Domain 1.1 — ADR Amendments require micro-document]
DECIZIE: Modificarea weights NU prin "adjusted weights" PR. Necesită micro-document (10 rânduri ADR Amendment) cu justificare empirical metrics.
RAȚIONAL: Weights = decisions architecturale; PR silent = decisions invisible; micro-doc = audit trail + intentionality forced.
IMPACT dacă greșită: SEVERE — silent weight changes = drift continuu de la design intent = engine devine pile of magic numbers.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §C ADR Amendments line 308-310.
PUSH-BACK: Bureaucratic overhead pentru tweaks small — care e threshold (>5% change weight = ADR? <5% = OK)?
STATUS: pending review Daniel cross-ref Q-0056

Q-0058 [Domain 1.1 — Sequential execution latency cost 150ms]
DECIZIE: Sequential execution voices: HISTORICAL → REALTIME → PROJECTION. Total ~150ms.
RAȚIONAL: 50ms per voice realistic budget; HISTORICAL pre-aggregat (Cloud Function) reduce dramatically; sequential simplificat debugging.
IMPACT dacă greșită: MODERATE — latency creep peste 150ms = UI lag; sequential bottleneck pe HISTORICAL slow = cascade.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R27 + §Q11 line 367.
PUSH-BACK: 150ms = budget total voices; ARBITRATOR + UI render 150ms additional = 300ms; cu Cloud Function cold start RO + p99 latency = realistic 500-800ms.
STATUS: pending review Daniel cross-ref Q-0033

Q-0059 [Domain 1.1 — voices vs dimensions terminology]
DECIZIE: "Voices" = layered temporal (HISTORICAL/REALTIME/PROJECTION) cu standardized contract; "Dimensions" (ADR 018) = plug-uri ortogonale (AA, Profile Typing, Vitality, Demographic Prior).
RAȚIONAL: Conceptual separation: temporal axis (voices) vs analytical axis (dimensions); voices in cognitive architecture, dimensions in extensibility architecture.
IMPACT dacă greșită: MODERATE — terminology confusion = engineers misuse abstractions = wrong layer for new feature.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 + ADR 018 §"Dimension Contract" line 60-90.
PUSH-BACK: "Voices" și "Dimensions" cu contracte diferite (VoiceVerdict vs DimensionResult) = duplicate layers; could unify sau articulate clearer separation.
STATUS: pending review Daniel cross-ref Q-0061

Q-0060 [Domain 1.1 — Schema Versioning explicit per entry]
DECIZIE: Per-entry schemaVersion field + Migration Runner location src/migrations/ cu fișier per migration (vN-to-vN+1.js).
RAȚIONAL: Versioning explicit elimină ambiguity "ce schema are entry-ul ăsta"; migration code separate = readable.
IMPACT dacă greșită: SEVERE — implicit versioning = drift detectabil doar empirical via bugs.
SURSA: ADR 018 §4 Schema Versioning + Migration Runner line 211-264.
PUSH-BACK: schemaVersion field per entry = 4 bytes × 250 entries = 1KB overhead per user; trivial; non-issue.
STATUS: pending review Daniel cross-ref Q-0061

Q-0061 [Domain 1.2 — Dimension Registry static array]
DECIZIE: Dimension Registry = static `export const DIMENSIONS = [...]` build-time array. Adăugare dimensiune = edit registry file.
RAȚIONAL: Simple, predictable, zero runtime mutation, easy code-search; YAGNI dynamic registration la N=1 user.
IMPACT dacă greșită: MINOR — static decizie reversible; dynamic API addable later non-breaking.
SURSA: ADR 018 DP-1 line 421-433; Sign-Off APPROVED line 540-547.
PUSH-BACK: Static array blocks plugin marketplace future (third-party dimensions); dacă SalaFull deschide ecosystem → refactor needed.
STATUS: pending review Daniel cross-ref Q-0062

Q-0062 [Domain 1.2 — DIMENSIONS metadata fields]
DECIZIE: Per-dimension metadata: id, module, stage, priority, enabledFlag, requiresCalibration, schemaVersion.
RAȚIONAL: Metadata explicită = registry self-documenting; helper getActiveDimensions(ctx) filtrează pe flag + calibration.
IMPACT dacă greșită: MODERATE — metadata schema rigid = features noi blocate; flexible-by-design = chaos.
SURSA: ADR 018 §1 example registry line 60-88.
PUSH-BACK: 7 fields adequate pentru azi — adaugă "owner" / "version_added" / "deprecation_target" pentru evolution tracking?
STATUS: pending review Daniel cross-ref Q-0061

Q-0063 [Domain 1.2 — Dimension contract analyze(input) → DimensionResult]
DECIZIE: Fiecare dimension EXPORTĂ funcția `analyze(input) → DimensionResult` cu signature uniformă.
RAȚIONAL: Single-method contract = simplitate; uniformitate cross-dimensions = tooling generic; testing standardized.
IMPACT dacă greșită: SEVERE — contract violation = pipeline crash; non-uniform = tooling fragmented.
SURSA: ADR 018 §2 Standardized Dimension Contract line 113-159.
PUSH-BACK: Single function = no lifecycle hooks (init, teardown, warmup); dimensions cu state preload (Demographic Prior 500 profiles) need warmup hook.
STATUS: pending review Daniel cross-ref Q-0064

Q-0064 [Domain 1.2 — DimensionResult shape]
DECIZIE: DimensionResult = { id, tier, confidence, signals[], recommendations[], trace, meta }.
RAȚIONAL: tier+confidence pentru gate; signals[] pentru transparență; recommendations[] pentru downstream cluster; trace+meta pentru debug.
IMPACT dacă greșită: MODERATE — shape too rigid blocks features; too permissive = chaos cross-dimensions.
SURSA: ADR 018 §2 line 130-138.
PUSH-BACK: tier enum 'none'|'LOW'|'MED'|'HIGH'|string — open string permite anything = breaking uniform tooling; strict enum better.
STATUS: pending review Daniel cross-ref Q-0063

Q-0065 [Domain 1.2 — Pure function contract guarantees]
DECIZIE: Contract guarantees: Pure function (no side effects), Deterministic (no Date.now/Math.random), Total function (always returns, never throws).
RAȚIONAL: Pure = testable + cacheable; Deterministic = reproducible; Total = no exception handling în cluster.
IMPACT dacă greșită: SEVERE — violations = pipeline brittleness; throws unchecked = entire session generation fails.
SURSA: ADR 018 §2 Contract guarantees line 141-145.
PUSH-BACK: Pure function rigid blocks legitimate I/O — Demographic Prior database lookup poate fi async I/O; rezolvat prin DP-2 async-capable.
STATUS: pending review Daniel cross-ref Q-0066

Q-0066 [Domain 1.2 — async-capable contract via Promise.resolve wrap]
DECIZIE: Cluster execute via Promise.all(activeDimensions.map(d => Promise.resolve(d.analyze(input)))). Sync dimensions cost ~zero overhead.
RAȚIONAL: Future-proof pentru I/O dimensions (Demographic Prior, future LLM-backed); zero cost when unused.
IMPACT dacă greșită: MODERATE — async unused = wrap overhead minimal; async used cu I/O slow = cluster latency creep.
SURSA: ADR 018 DP-2 APPROVED line 437-449.
PUSH-BACK: Promise.all = fail-fast pe first reject; one dimension throwing = cluster execution stop; alternative Promise.allSettled() ar permite graceful degradation per dimension.
STATUS: pending review Daniel cross-ref Q-0065

Q-0067 [Domain 1.2 — Recommendation shape]
DECIZIE: Recommendation = { action: string, priority: 0-100, payload: object, rationale: string }.
RAȚIONAL: action = enum-like string ('gate_session', 'reduce_volume', 'inject_warning'); priority = ADR 004 numeric scale; payload action-specific; rationale human-readable.
IMPACT dacă greșită: MODERATE — action enum nestandardizat = mismatch în cluster handlers; priority arbitrary = winner inconsistent.
SURSA: ADR 018 §2 Recommendation line 137-142.
PUSH-BACK: action e free-form string — typo în one dimension ('reduce_volum' lipsă 'e') = silent skip în cluster handler; should be enum + lint check.
STATUS: pending review Daniel cross-ref Q-0064

Q-0068 [Domain 1.2 — JSDoc typedefs vs TypeScript]
DECIZIE: Contract pinned în src/engine/dimensionContract.js ca JSDoc typedefs (ADR 005 vanilla JS, no TypeScript).
RAȚIONAL: ADR 005 vanilla JS no framework; JSDoc typedefs validate via test helper assertValidDimensionResult; no build complexity TypeScript.
IMPACT dacă greșită: MODERATE — JSDoc weaker than TS strict; typos slip; runtime checks compensate.
SURSA: ADR 018 §2 Implementation notes line 156-158.
PUSH-BACK: JSDoc + runtime check = 2 mechanisms incomplete vs TS compile-time check; PRODUCT_STRATEGY §7.1 says engine = TS, why JSDoc here?
STATUS: pending review Daniel cross-ref Q-0039

Q-0069 [Domain 1.2 — signals[] standardized within dimension]
DECIZIE: signals[] strings standardizate within each dimension (AA: 'volume_creep', 'frustration_markers'). Cross-dimension overlap permis.
RAȚIONAL: Within-dimension uniformity = tooling clean; cross-dimension same string ('fatigue') OK = multiple sources vary on same signal.
IMPACT dacă greșită: MINOR — same string different meaning cross-dimension = trace ambiguity; prefixing cu dim id rezolvă.
SURSA: ADR 018 §2 line 158-159.
PUSH-BACK: 'fatigue' din AA vs Vitality vs Stagnation = same word, different signals; prefixing nu e enforced = bug surface.
STATUS: pending review Daniel cross-ref Q-0070

Q-0070 [Domain 1.2 — Plugin lifecycle modul în src/engine/dimensions/]
DECIZIE: Each dimension lives în src/engine/dimensions/<id>.js. Convenție de naming + locație fixed.
RAȚIONAL: Convention over configuration; code search facil; auto-discovery posibil future.
IMPACT dacă greșită: MINOR — convention violated = developers confused; not architectural.
SURSA: ADR 018 §1 line 102.
PUSH-BACK: Folder convention nu enforced via lint; new dev poate plasa în /src/dimensions/ fără să observe; needs eslint plugin.
STATUS: pending review Daniel

Q-0071 [Domain 1.3 — Decision Cluster 3-stage pipeline]
DECIZIE: Decision Cluster pipeline staged: Stage 1 GATE → Stage 2 ADJUSTMENT → Stage 3 ENHANCEMENT.
RAȚIONAL: Match arhitectura existing (coachDirector hard-coded gate-then-adjust-then-enhance); formalizes pattern + makes stages explicit metadata.
IMPACT dacă greșită: SEVERE — stage assignment greșit = recommendation aplicată la stage greșit = session corrupt.
SURSA: ADR 018 §3 Decision Cluster Engine line 167-205; DP-4 APPROVED.
PUSH-BACK: 3 stages forced = unele dimensiuni se mapează prost (Profile Typing = informational, no recommendations); ce stage primesc?
STATUS: pending review Daniel cross-ref Q-0072

Q-0072 [Domain 1.3 — GATE stage short-circuit]
DECIZIE: Stage 1 GATE: dacă orice dimensiune cu stage='GATE' întoarce action='gate_session', pipeline scurt-circuitează → return rest/blocker session immediate. Multiple gates = highest priority wins (ADR 004).
RAȚIONAL: Hard short-circuit = early exit pe blockers (REST_DAY, AA HIGH, calibration INITIAL); evită compute waste downstream.
IMPACT dacă greșită: SEVERE — short-circuit miss = session generated cu blocker ignored = unsafe.
SURSA: ADR 018 §3 Stage 1 line 184-188.
PUSH-BACK: Multiple gates same priority = nondeterministic winner; tie-breaking neclar (registration order? alfabetic id?).
STATUS: pending review Daniel cross-ref Q-0071

Q-0073 [Domain 1.3 — ADJUSTMENT stage cumulativ multiplicativ]
DECIZIE: Stage 2 ADJUSTMENT: toate dimensiunile cu stage='ADJUSTMENT' aplică recommendations sequential. Volume multipliers compose multiplicativ (0.9 * 0.7 = 0.63). Sets reduction caps acumulează.
RAȚIONAL: Multiplicativ = coherent stacking (deload + cut + AA MED toate aplică); caps acumulate = upper bound respected.
IMPACT dacă greșită: SEVERE — additive în loc de multiplicativ = volume reduction de 200% = negative volume = bug; cap absent = volume=0.
SURSA: ADR 018 §3 Stage 2 line 190-193.
PUSH-BACK: Multiplicative compose ignores semantic — deload (planned) + AA MED (corrective) = 2 reductions cumulate cu intent diferit; merită separate handling.
STATUS: pending review Daniel cross-ref Q-0074

Q-0074 [Domain 1.3 — ADJUSTMENT order]
DECIZIE: Within ADJUSTMENT, recommendations applied sequential by priority desc.
RAȚIONAL: Higher priority first = mai impactful changes applied; lower priority cumulează pe rezultatul anterior.
IMPACT dacă greșită: MODERATE — order changes outcome (multiplicativ commutative pentru numbers, dar nu pentru caps care apply asymmetric).
SURSA: ADR 018 §3 Stage 2 line 191; ADR 004 priority numeric.
PUSH-BACK: Multiplicative ops commutative pentru pure scaling; ne-commutative cu caps/clamps; order matters here = subtle bug surface.
STATUS: pending review Daniel cross-ref Q-0073

Q-0075 [Domain 1.3 — ENHANCEMENT stage UX layer]
DECIZIE: Stage 3 ENHANCEMENT: aplicat sequential pe session pre-return. Modify session.exercises, attach UI metadata (session.aaWarning, session.calibrationBanner).
RAȚIONAL: Separa adjustments matematice de UX presentation; ENHANCEMENT poate inject banners, friction modals, alternative exercises.
IMPACT dacă greșită: MODERATE — banners/prompts în ADJUSTMENT = mixing UX cu logic; ENHANCEMENT pure = clean separation.
SURSA: ADR 018 §3 Stage 3 line 195-198.
PUSH-BACK: Banner injection în ENHANCEMENT modify session shape — downstream consumer (UI render) trebuie să tolereze missing fields graceful; risk regression.
STATUS: pending review Daniel cross-ref Q-0076

Q-0076 [Domain 1.3 — Stage assignment per dimension explicit]
DECIZIE: Each dimension declares stage în registry. Mismatch (GATE producing 'inject_warning') detected → throw în testing, log warning în prod.
RAȚIONAL: Explicit declaration = registry self-documenting; mismatch = developer error caught early.
IMPACT dacă greșită: MODERATE — silent mismatch = recommendation drops la stage greșit = behavior bug.
SURSA: ADR 018 §3 line 200.
PUSH-BACK: Test catches dev mismatch; prod log = non-actionable noise; should fail-fast în prod too dacă mismatch detected.
STATUS: pending review Daniel

Q-0077 [Domain 1.3 — coachDirector subțire post-cluster]
DECIZIE: Director devine subțire: build ctx → analyze all dimensions → cluster.execute(results) → write CDL → return. ~50 LOC.
RAȚIONAL: Single Responsibility — director = orchestration; logic în dimensions + cluster; testabil în izolație.
IMPACT dacă greșită: SEVERE — director rămâne God Object = ADR 018 entire premise undelivered.
SURSA: ADR 018 §3 Implementation line 206-209; Faza 3 line 343-345.
PUSH-BACK: 50 LOC ambitious — orchestration cu error handling, telemetry, logging adaugă weight realistic 100-150 LOC.
STATUS: pending review Daniel cross-ref Q-0044

Q-0078 [Domain 1.3 — cluster.execute returnează {session, trace}]
DECIZIE: cluster.execute(results, baseSession) returnează { session, trace } unde trace = structured log al tuturor recommendations + which fired + which were overridden.
RAȚIONAL: Trace = audit trail pentru CDL rationale; permite "Why?" button să arate decision path complet.
IMPACT dacă greșită: SEVERE — trace lipsă = decisions opaque = MOAT story "decizii verificabile" undelivered.
SURSA: ADR 018 §3 Implementation line 207.
PUSH-BACK: Trace structure detailed = mare CDL size; aggregated trace summary ar fi mai compact pentru long-term storage.
STATUS: pending review Daniel cross-ref Q-0079

Q-0079 [Domain 1.3 — Rule Engine ca dimensiune CORE_RULES]
DECIZIE: Rule Engine devine dimensiune cu id='CORE_RULES'. Multiple recommendations output (one per fired rule). Cluster handle composition.
RAȚIONAL: Existing rule engine fits dimension contract; preservare ADR 004; migration lossless.
IMPACT dacă greșită: SEVERE — rule engine port broken = engine entry-level decisions broken.
SURSA: ADR 018 §3 line 207-209; Faza 3 line 343-345.
PUSH-BACK: Single dimension cu multiple recommendations = stage mismatch potential (REST_DAY = GATE; CUT_CONSERVATIVE = ADJUSTMENT) — split în 2 dimensiuni mai clean.
STATUS: pending review Daniel cross-ref Q-0078

Q-0080 [Domain 1.3 — clusterTrace → ADR 011 rationale shape adapter]
DECIZIE: HIGH-1 deferred — adapter clusterTraceToADR011Rationale(trace) explicit la strangler integration; gate-branch (shortCircuited) și non-gate branch (highest-priority ADJUSTMENT = winner).
RAȚIONAL: Mapping implicit în trace; adapter explicit necesar doar la port coachDirector CDL write.
IMPACT dacă greșită: MODERATE — adapter buggy = CDL rationale corrupt = pattern learning corrupt; deferred status = not blocking but tracked.
SURSA: INSIGHTS_BACKLOG HIGH-1 line 12-15; AUDIT_5000Q handover.
PUSH-BACK: Implicit mapping în trace = bug-prone; explicit adapter needed sooner-rather-later; defer status risk.
STATUS: pending review Daniel cross-ref Q-0078

Q-0081 [Domain 1.3 — compound shorten_session originalCount fals]
DECIZIE: MED-1 deferred — Winner-takes-all pe shorten_session (lowest count wins) pre-pipeline, sau capture baseExercisesLength la intrarea în _runEnhancementStage.
RAȚIONAL: Bug surface: 2 ENHANCEMENT shorten consecutive citesc lungime deja-trunchiat → trace CDL corrupt ("shortened from 3 to 2" în loc de "from 5 to 2").
IMPACT dacă greșită: MODERATE — trace corrupt = misleading audit trail; logic outcome correct.
SURSA: INSIGHTS_BACKLOG MED-1 line 17-20.
PUSH-BACK: Winner-takes-all override Stage 3 design (sequential cumulative); special-casing un action type fragmentează model.
STATUS: pending review Daniel cross-ref Q-0075

Q-0082 [Domain 1.3 — Contract guarantees enforcement runtime]
DECIZIE: MED-4 deferred — runDimensionConformanceCheck(module) helper în tests/. Run analyze() × 2 cu input identic + spy pe globals.
RAȚIONAL: Test-time check dacă dimension violates pure/deterministic contract; spy pe Date.now/Math.random catches non-determinism.
IMPACT dacă greșită: MODERATE — non-deterministic dimension = tests flaky + decisions non-reproducible în prod.
SURSA: INSIGHTS_BACKLOG MED-4 line 22-26.
PUSH-BACK: Runtime check expensive; should be CI-only, NU prod assert; performance impact prod unacceptable.
STATUS: pending review Daniel cross-ref Q-0065

Q-0083 [Domain 1.3 — Decision Cluster execution log format]
DECIZIE: Trace structure: { stage_outputs: [{stage, dimension_id, recommendation, applied: bool, override_reason?}], final_session, applied_recommendations[], overridden_recommendations[] }.
RAȚIONAL: Per-dimension per-stage visibility; applied/overridden bifurcate = audit clear; final session = comparable cu CDL.
IMPACT dacă greșită: MODERATE — trace shape change = backward compat issue downstream; overridden missing = audit incomplete.
SURSA: ADR 018 §3 line 207; ADR 011 §rationale.overridden.
PUSH-BACK: Detailed trace per dimension at scale (10+ dimensions × 5 recommendations each) = ~50 lines per session × 250 sessions/year = 12500 lines storage.
STATUS: pending review Daniel cross-ref Q-0079

Q-0084 [Domain 1.3 — Cross-dimension dependency declaration]
DECIZIE: Reconsideration trigger #5 — cross-dimension dependencies emerge (Vitality result feeds AA detection thresholds) → contract necesită extension pentru declared dependencies + topological ordering în cluster.
RAȚIONAL: V1 dimensions independent; V2 dependencies natural (Profile Typing → AA threshold calibration); contract evolves cu reconsideration trigger.
IMPACT dacă greșită: SEVERE — implicit dependencies = cluster non-deterministic order; bugs subtle.
SURSA: ADR 018 Reconsideration Trigger #5 line 388-389.
PUSH-BACK: V1 fără dependencies = artificial constraint; Profile Typing influences AA already documented; should architect dependencies din V1.
STATUS: pending review Daniel

Q-0085 [Domain 1.3 — STAGES enum vs string literals]
DECIZIE: LOW-1 deferred — STAGES importat dar nefolosit în decisionCluster.test.js. Înlocuiește string literals 'GATE' cu STAGES.GATE.
RAȚIONAL: Enum usage prevents typos; codebase consistency; refactor-safe.
IMPACT dacă greșită: MINOR — string literals work today; refactor risk low; cosmetic.
SURSA: INSIGHTS_BACKLOG LOW-1 line 27-28.
PUSH-BACK: Cosmetic LOW = noise în backlog; might not need tracking.
STATUS: pending review Daniel

Q-0086 [Domain 1.3 — assertValidRegistry dev-mode bootstrap]
DECIZIE: LOW-3 deferred — Dev-mode bootstrap în dimensionRegistry.js: if NODE_ENV !== 'production', assertValidRegistry().
RAȚIONAL: Catch malformed registry early în dev; production skip = no perf impact.
IMPACT dacă greșită: MINOR — malformed registry = runtime error obvious oricum.
SURSA: INSIGHTS_BACKLOG LOW-3 line 31-36.
PUSH-BACK: assertValidRegistry runtime cost on every dev start = slow dev experience; debounce sau lazy?
STATUS: pending review Daniel

Q-0087 [Domain 1.3 — shorten_session newCount clamp]
DECIZIE: LOW-4 deferred — shorten_session newCount clampat la exercises.length: Math.min(Math.max(0, count), session.exercises.length).
RAȚIONAL: Defensive coding; prevents negative count or count > exercises.
IMPACT dacă greșită: MINOR — bug surface low; clamp simple guard.
SURSA: INSIGHTS_BACKLOG LOW-4 line 37-38.
PUSH-BACK: Defensive clamp masquerades caller bug; better fail-fast cu assert.
STATUS: pending review Daniel

Q-0088 [Domain 1.3 — REDUCE_VOLUME multiplier > 1 unclamped]
DECIZIE: LOW-5 — REDUCE_VOLUME multiplier > 1 NU clamped (caller responsibility).
RAȚIONAL: Caller knows intent (BOOST_VOLUME action ≠ REDUCE_VOLUME); cluster trusts contract.
IMPACT dacă greșită: MINOR — multiplier 1.5 cu intent REDUCE = bug în caller; cluster respects literal.
SURSA: INSIGHTS_BACKLOG LOW-5 line 45-46.
PUSH-BACK: Trust caller = bug surface; defensive validation cheap.
STATUS: pending review Daniel cross-ref Q-0089

Q-0089 [Domain 1.3 — multiplier validation Number.isFinite]
DECIZIE: LOW-6 — assertValidRecommendation: multiplier 0/negative/NaN nevalidat. Adaugă Number.isFinite && >= 0 check.
RAȚIONAL: NaN propagation through compose = corrupt session; explicit check at boundary.
IMPACT dacă greșită: MODERATE — NaN compose = volume_multiplier NaN = session.totalSets NaN = UI display broken.
SURSA: INSIGHTS_BACKLOG LOW-6 line 46-47.
PUSH-BACK: Boundary check expensive at every call; should rely pe TypeScript type system (but vanilla JS).
STATUS: pending review Daniel cross-ref Q-0088

Q-0090 [Domain 1.3 — registry path convention enforcement]
DECIZIE: LOW-8 — Registry NU verifică path convention src/engine/dimensions/<id>.js. Out of scope foundation.
RAȚIONAL: Convention enforced via code review; lint rule possible viitor.
IMPACT dacă greșită: MINOR — devs put files odd locations = code search fragmented.
SURSA: INSIGHTS_BACKLOG LOW-8 line 48.
PUSH-BACK: Lint plugin custom = engineering cost; convention în README + reviews suficient.
STATUS: pending review Daniel cross-ref Q-0070

Q-0091 [Domain 1.3 — DimensionResult tier+confidence ignorate cluster]
DECIZIE: LOW-9 — tier și confidence fields din DimensionResult ignorate de cluster. By design (informational only).
RAȚIONAL: Cluster operates pe recommendations[]; tier+confidence pentru consumers external (UI, downstream dimensions).
IMPACT dacă greșită: MINOR — informational fields can be wrong fără să afecteze cluster output.
SURSA: INSIGHTS_BACKLOG LOW-9 line 48.
PUSH-BACK: tier/confidence ar putea informa cluster decisions (ex: tier='HIGH' AA = priority boost recommendations); deliberate ignore = wasted signal.
STATUS: pending review Daniel cross-ref Q-0064

Q-0092 [Domain 1.3 — findDimension exported but unused]
DECIZIE: LOW-2 — findDimension exported but unused. OK, documented future use.
RAȚIONAL: API surface for future consumers; doc says "find dimension by id".
IMPACT dacă greșită: MINOR — dead code; ESLint no-unused warns suppressible.
SURSA: INSIGHTS_BACKLOG LOW-2 line 44.
PUSH-BACK: Dead code = future obstacle; YAGNI says delete; export later when needed.
STATUS: pending review Daniel

Q-0093 [Domain 1.3 — CDLEntry typedef property list]
DECIZIE: LOW-7 deferred — CDLEntry typedef fără property list. Adaugă proprietăți ADR 011 schema (id, ts, date, context, proposed, outcome).
RAȚIONAL: Typedef complet = JSDoc useful; consumers see structure; runtime check possible.
IMPACT dacă greșită: MINOR — current typedef "any-shape"; type assistance lipsă.
SURSA: INSIGHTS_BACKLOG LOW-7 line 41.
PUSH-BACK: ADR 011 schema 50+ fields nested = JSDoc unwieldy; better external doc reference.
STATUS: pending review Daniel cross-ref Q-0068

Q-0094 [Domain 1.3 — _safeSentry pattern shared util]
DECIZIE: LOW-1 (Batch 2) deferred — _safeSentry pattern nu e shared între decisionCluster.js și migrationRunner.js. Extrage într-un shared util src/util/safeSentry.js.
RAȚIONAL: DRY; consistent error handling; one-place fix bugs.
IMPACT dacă greșită: MINOR — duplicate code, occasional drift between copies.
SURSA: INSIGHTS_BACKLOG LOW-1 (Batch 2) line 73-75.
PUSH-BACK: Util extraction trivial; should be done now NU deferred.
STATUS: pending review Daniel

Q-0095 [Domain 1.3 — initSentry ordering risk before migrations]
DECIZIE: MED-3 deferred — await initSentry() înainte de runMigrations() în app init sequence. Document ordering în initSentry JSDoc.
RAȚIONAL: Migrations may emit Sentry alerts on errors; Sentry not initialized = silent failure.
IMPACT dacă greșită: MODERATE — migration errors invisible în prod prima 30 zile post-launch; bugs miss alerting.
SURSA: INSIGHTS_BACKLOG MED-3 line 64-66.
PUSH-BACK: Migrations array empty în Batch 2 = zero current Sentry calls; deferred low-risk azi but risk grows fast.
STATUS: pending review Daniel cross-ref Q-0094

Q-0096 [Domain 1.3 — assertValidMigration validator]
DECIZIE: MED-2 deferred — assertValidMigration(m) helper (verifică fromVersion, toVersion, storageKeys, migrate() signature) + apelat la module init în dev mode.
RAȚIONAL: Catch malformed migration objects early; runtime issues prevented.
IMPACT dacă greșită: MODERATE — malformed migration = pipeline crash on run; data potentially corrupt.
SURSA: INSIGHTS_BACKLOG MED-2 line 58-61.
PUSH-BACK: Defer until first migration = increases risk first migration = chicken-egg; should pre-validate.
STATUS: pending review Daniel cross-ref Q-0095

Q-0097 [Domain 1.3 — hasActiveDevFlags() util public API]
DECIZIE: MED-4 (Batch 2) deferred — export function hasActiveDevFlags() → readDevFlags() !== null. Util pentru dev overlay / warning banner.
RAȚIONAL: Dev UX nicety; show banner if dev overrides active.
IMPACT dacă greșită: MINOR — dev UX gap, no prod impact.
SURSA: INSIGHTS_BACKLOG MED-4 (Batch 2) line 67-70.
PUSH-BACK: Dev-only function = not high priority; OK deferred.
STATUS: pending review Daniel

Q-0098 [Domain 1.3 — dimension stage recommendations consistency]
DECIZIE: Dimension cu stage='GATE' NU poate produce recommendation cu action='inject_warning' (mismatch detected → throw în testing, log warning în prod).
RAȚIONAL: Stage assignment per dim should match action types produced; mismatch = developer error.
IMPACT dacă greșită: MODERATE — silent mismatch în prod = bug propagation.
SURSA: ADR 018 §3 line 200.
PUSH-BACK: Strict per-stage allowed actions = inflexibility; future dim might legitimately produce mixed actions; warning_inject la GATE could surface bigger problem.
STATUS: pending review Daniel cross-ref Q-0076

Q-0099 [Domain 1.3 — Backward compat stage semantics evolution]
DECIZIE: Decision Cluster stages stable contract — adding new stage = breaking change; reordering = breaking change.
RAȚIONAL: Contract stability = consumer confidence; stages immutable post-launch.
IMPACT dacă greșită: SEVERE — stage rename mid-flight = registry broken cross-dimensions.
SURSA: ADR 018 §Reconsideration Trigger #5 (cross-dim dep) implicit rule.
PUSH-BACK: V2 stages possible (PRE_GATE, POST_GATE) for advanced flows; should design contract pentru forward compat.
STATUS: pending review Daniel

Q-0100 [Domain 1.3 — ADR 011 rationale extension cu stage trace]
DECIZIE: CDL `proposed.rationale` extension cu cluster trace stage info: { winnerId, winnerPriority, stage, overridden[] }.
RAȚIONAL: Audit trail per stage; debugging "decision came from GATE level X"; ADR 011 §rationale already supports overridden.
IMPACT dacă greșită: MODERATE — stage info absent = debugging coșmar; trace bloat = storage cost.
SURSA: ADR 018 Negative consequences line 369-372 "extension la proposed.rationale"; ADR 011 §schema.
PUSH-BACK: Stage trace în CDL = duplication cu cluster trace standalone; should reference NU duplicate.
STATUS: pending review Daniel cross-ref Q-0083

#### 1.4 CDL (Coach Decision Log) — schema + idempotency + Tombstone & Branching

Q-0101 [Domain 1.4 — CDL primitive arhitectural append-only]
DECIZIE: CDL = first-class architectural primitive, append-only persistent log every session-level decision, full context snapshot + proposed action + rationale + outcome.
RAȚIONAL: Solves H30c pattern false positives + adherence signal lipsă + learning loop closed; foundation pentru "decizii verificabile" MOAT.
IMPACT dacă greșită: CATASTROFIC — without CDL, coaching = stateless = no learning, no audit, no trust.
SURSA: ADR 011 Decision line 38-42; PROJECT_VISION moat foundation.
PUSH-BACK: CDL adds 125KB Tier 1 / active user (250 sessions × 0.5KB); 2.5% localStorage budget pe user free tier; growth concern at scale.
STATUS: pending review Daniel cross-ref Q-0102

Q-0102 [Domain 1.4 — CDL Tier 1 retention 180 zile]
DECIZIE: Tier 1 = 180 days locked la responseProfile rolling window OPTIMIZED tier (ADR 009).
RAȚIONAL: Zero data loss la boundary unde responseProfile reads; consistent retention story.
IMPACT dacă greșită: SEVERE — boundary mismatch = responseProfile reads from Tier 2 aggregate = lost detail = pattern detection corrupted.
SURSA: ADR 011 Storage TierStorage line 224-227; ADR 009 OPTIMIZED rolling window.
PUSH-BACK: 180 zile locked = ADR 009 modificare cascade ADR 011; coupling cross-ADR risk.
STATUS: pending review Daniel cross-ref Q-0103

Q-0103 [Domain 1.4 — CDL Tier 2 aggregate 180-365 zile]
DECIZIE: Tier 2 = 180 days to 1 year. Drop full context, exercises list, overridden rules. Keep sessionType, calibrationLevel, rationale.winnerId, outcome.executed, outcome.matchScore, outcome.deviation.
RAȚIONAL: 50%+ size reduction at boundary; informa pattern long-term fără context detailed; cost-effective.
IMPACT dacă greșită: MODERATE — Tier 2 prea aggressive = pattern detection blind on year-old data; insuficient drop = storage bloat.
SURSA: ADR 011 §Storage TierStorage line 230-231.
PUSH-BACK: Drop "overridden rules" = lose context cum AI learn — ar trebui keep aggregate ("REST_DAY suppressed N times by CUT_CONSERVATIVE").
STATUS: pending review Daniel cross-ref Q-0102

Q-0104 [Domain 1.4 — CDL Tier 3 archive forever monthly metrics]
DECIZIE: Tier 3 = beyond 1 year. Monthly metrics: count per (sessionType × month), executedRate, avgMatchScore, deviationRate.
RAȚIONAL: Archive forever for moat ("memory pe ani"); monthly granularity sufficient pentru long-term trends.
IMPACT dacă greșită: MODERATE — Tier 3 too coarse = year-over-year comparison weak; detail keeping = storage explodes.
SURSA: ADR 011 §Storage line 232.
PUSH-BACK: Monthly = 12 entries/an × 5 sessionTypes = 60 records/an = 100KB after 5 years; trivial; could keep weekly granularity at marginal cost.
STATUS: pending review Daniel cross-ref Q-0103

Q-0105 [Domain 1.4 — CDL daily idempotency 4h+key context]
DECIZIE: Daily idempotency: existing entry cu age <4h AND key context unchanged → return existing proposed unchanged. NO new entry.
RAȚIONAL: Multiple buildSession() invocations within day NOT produce duplicates; rate-limit chaos.
IMPACT dacă greșită: SEVERE — duplicate entries = pattern aggregation incorrect; idempotency violation = chaos.
SURSA: ADR 011 §Idempotency line 199-211.
PUSH-BACK: 4h hardcoded = arbitrary; user trains 5h → second session within same day NU triggers supersede; should be tied to session boundaries NU clock.
STATUS: pending review Daniel cross-ref Q-0106

Q-0106 [Domain 1.4 — significant context change definition]
DECIZIE: Significant context change = readinessScore delta > 20, weakGroups set changed, calibrationLevel changed, isInCut changed, predictionToday.isHighRisk flipped.
RAȚIONAL: Trigger supersede only on substantive context shift; arbitrary fluctuations don't supersede.
IMPACT dacă greșită: MODERATE — too broad = supersede chains explode; too narrow = stale entries.
SURSA: ADR 011 §Idempotency rule 2 line 212-217.
PUSH-BACK: Lista 5 fields hardcoded — viitor field nou (mood, fatigueLevel) nu e listat = no supersede when relevant; rigid.
STATUS: pending review Daniel cross-ref Q-0105

Q-0107 [Domain 1.4 — superseded vs supersedes chain audit]
DECIZIE: Old entry marked superseded:true, new entry has supersedes:<old_id>. Old entry remains for audit, filtered "active" queries.
RAȚIONAL: Audit trail complet; reconstructive analysis possible; no data loss.
IMPACT dacă greșită: SEVERE — supersede mid-flight bug = entries lost or duplicate active.
SURSA: ADR 011 §Idempotency line 207-210; line 218-219.
PUSH-BACK: Long supersede chains (5+ supersedes within day) = storage waste; cleanup policy lipsă.
STATUS: pending review Daniel

Q-0108 [Domain 1.4 — Outcome population most-recent non-superseded]
DECIZIE: endSession/cancelWorkout populate outcome on most-recent non-superseded entry for today. If no entry, create synthetic outcome-only entry rationale.winnerId='NO_PROPOSED'.
RAȚIONAL: Single source truth for outcome; synthetic NO_PROPOSED audit unusual case.
IMPACT dacă greșită: SEVERE — outcome on wrong entry = pattern learning corrupt; missing entry handling = silent loss.
SURSA: ADR 011 §Idempotency rule 3 line 219-220.
PUSH-BACK: NO_PROPOSED entry = anomaly indicator; should trigger Sentry alert NU silent log.
STATUS: pending review Daniel cross-ref Q-0107

Q-0109 [Domain 1.4 — append-only no delete]
DECIZIE: No CDL entry ever deleted (within tier). Updates only: superseded false→true (one-way), outcome null→populated (one-way write).
RAȚIONAL: Audit trail forever; immutability = trust foundation; reasoning preserved.
IMPACT dacă greșită: SEVERE — delete enabled = data loss possible (accidental or malicious); audit broken.
SURSA: ADR 011 §Idempotency rule 5 line 221-223.
PUSH-BACK: GDPR right to erasure conflicts cu append-only; resolved via anonymize NOT delete (Cognitive Arch §Q14).
STATUS: pending review Daniel cross-ref Q-0049

Q-0110 [Domain 1.4 — Active queries filter superseded:true]
DECIZIE: Active queries (patternLearning, adherence, responseProfile) filter superseded:true entries by default. Superseded chain reachable for audit/transparency only.
RAȚIONAL: Default filter = consumers see clean view; opt-in to chain for debugging.
IMPACT dacă greșită: SEVERE — filter omis = aggregate counts double from superseded + new = pattern false positives.
SURSA: ADR 011 §Idempotency rule 4 line 218-219.
PUSH-BACK: Default filter convenient but engineers may forget; should be opt-IN to skip filter NU opt-OUT.
STATUS: pending review Daniel cross-ref Q-0107

Q-0111 [Domain 1.4 — Stable Rule IDs RULES const]
DECIZIE: rationale.winnerId references stable rule ID din RULES const în ruleEngine.js. Rename = explicit migration. New rules non-breaking. Removal = sentinel DEPRECATED_<original_id>.
RAȚIONAL: Rule ID = contract; rename without migration = winnerId orphan în CDL; migration explicit = audit trail.
IMPACT dacă greșită: SEVERE — orphan winnerId = pattern learning unable categorize past decisions.
SURSA: ADR 011 §Stable Rule IDs line 100-108.
PUSH-BACK: Migration + sentinel pattern complex pentru schimbare simplă rule rename; UUID-based ID-uri ar fi forever-stable dar lose human-readable.
STATUS: pending review Daniel cross-ref Q-0112

Q-0112 [Domain 1.4 — Reserved ID SYNTHETIC_BACKFILL]
DECIZIE: Reserved winnerId 'SYNTHETIC_BACKFILL' for entries created by backfill script. Never assigned real rule.
RAȚIONAL: Distinguishes synthetic from real entries; aggregation can weight differently (0.5×).
IMPACT dacă greșită: SEVERE — non-reserved rule named SYNTHETIC_BACKFILL = false synthetic flagging = corrupt aggregation.
SURSA: ADR 011 §Stable Rule IDs line 108.
PUSH-BACK: Magic string convention works; should be enforced via ESLint rule că no real rule uses prefix SYNTHETIC_.
STATUS: pending review Daniel cross-ref Q-0111

Q-0113 [Domain 1.4 — matchScore gate not weighted]
DECIZIE: outcome.actualSessionType !== proposed.sessionType → matchScore=null și deviation=true. Mixing as numeric average pollutes adherence rate.
RAȚIONAL: Deviation = categorical signal; partial execution = continuous; numeric average lose categorical info.
IMPACT dacă greșită: SEVERE — averaging deviation cu partial = adherence rate lies = engine learns wrong.
SURSA: ADR 011 §matchScore line 110-114.
PUSH-BACK: Null matchScore propagates downstream — every consumer trebuie null-aware; alternative = matchScore=0 explicit "deviated".
STATUS: pending review Daniel cross-ref Q-0114

Q-0114 [Domain 1.4 — matchScore formula 0.6×volumeRatio + 0.4×exerciseOverlap]
DECIZIE: matchScore = 0.6 × volumeRatio + 0.4 × exerciseOverlap. volumeRatio = clamp(actualSets/proposedSets, 0, 1.5). exerciseOverlap = jaccard.
RAȚIONAL: Volume more important than exercise selection; clamp 1.5 prevents over-volume gaming; jaccard = standard set overlap.
IMPACT dacă greșită: MODERATE — wrong weights = matchScore biased; high volumeRatio compensates poor selection = false high score.
SURSA: ADR 011 §matchScore formula line 115-122.
PUSH-BACK: 0.6/0.4 weights arbitrary fără calibrare empirică; clamp 1.5 = +50% volume tolerated dar +51% would be cap = arbitrary.
STATUS: pending review Daniel cross-ref Q-0113

Q-0115 [Domain 1.4 — adherenceRate vs deviationRate distinct metrics]
DECIZIE: patternLearning expune 2 metrice distinct: adherenceRate = entries.where(executed && !deviation) / entries.where(proposed); deviationRate = entries.where(deviation) / entries.where(proposed).
RAȚIONAL: Distinct categorically — low adherence + zero deviation = volume issue; high deviation = UX issue or coach misreads.
IMPACT dacă greșită: SEVERE — confused metrics = wrong intervention (force more deload când actually UX issue).
SURSA: ADR 011 §matchScore line 123-129.
PUSH-BACK: 2 metrice = 2 dashboards = engineering load; alternative single "fitness score" composite simpler.
STATUS: pending review Daniel cross-ref Q-0114

Q-0116 [Domain 1.4 — outcome.autoAggression nullable post-extension]
DECIZIE: outcome.autoAggression nullable object (per ADR 013). Null = AA detection not yet computed; tier:'none' = evaluated, no signals; tier:LOW/MED/HIGH = signals fired.
RAȚIONAL: Honest semantics — null ≠ none; backward compat preserved (existing entries null).
IMPACT dacă greșită: SEVERE — null=none confusion = aggregation ignores valid AA detection on synthetic; false adherence rates.
SURSA: ADR 011 §outcome.autoAggression line 134-160.
PUSH-BACK: Tri-state nullability adds complexity for every consumer; force tier='unknown' default may be cleaner.
STATUS: pending review Daniel cross-ref Q-0117

Q-0117 [Domain 1.4 — outcome.rest_marked nullable 3-state]
DECIZIE: outcome.rest_marked: true | false | null. Null = no prompt; true = legitimate rest; false = explicit decline.
RAȚIONAL: Distinguishes "no prompt" from "explicit decline" — collapsing to boolean loses signal.
IMPACT dacă greșită: SEVERE — Recovery debt signal #5 in AA detection misses semantic distinction.
SURSA: ADR 011 §outcome.rest_marked line 162-188.
PUSH-BACK: Tri-state semantics complicat for UI rendering — null=show prompt, true=show "rested", false=show "skipped"; could conflate UI vs semantic.
STATUS: pending review Daniel cross-ref Q-0118

Q-0118 [Domain 1.4 — Rest day semantic 4 cases table]
DECIZIE: Rest day semantic: executed=true → workout day; executed=false + null → SKIPPED no prompt; executed=false + false → SKIPPED user decline; executed=false + true → REST legit; no CDL entry → REST legit (PROG didn't plan).
RAȚIONAL: All 4 cases distinct in AA detection signal #5 logic; no semantic drift.
IMPACT dacă greșită: SEVERE — semantic drift = AA detection false positives/negatives.
SURSA: ADR 011 §Rest day semantic line 180-188; ADR 013 Recovery debt signal.
PUSH-BACK: 4-case table = consumer must implement all branches; bug surface high.
STATUS: pending review Daniel cross-ref Q-0117

Q-0119 [Domain 1.4 — Synthetic backfill from existing logs]
DECIZIE: Synthetic backfill from existing logs (Daniel 80+ pre-CDL). Reverse-infer proposed.sessionType from exercise muscle groups; partial context (null fields) for non-reconstructable.
RAȚIONAL: Empty CDL post-cutover = coach forgets user 1-3 luni; unacceptable; synthetic preserves continuity.
IMPACT dacă greșită: CATASTROFIC — synthetic with 0.5× weight = pattern continuity; without = forced cold-start = user churn.
SURSA: ADR 011 §Backfill line 247-271.
PUSH-BACK: Reverse-inference = best-effort; bugs in inference logic = corrupt baseline; mitigation 10-sample manual gate.
STATUS: pending review Daniel cross-ref Q-0120

Q-0120 [Domain 1.4 — Synthetic 0.5× weight in aggregation]
DECIZIE: Synthetic entries usable patternLearning + responseProfile cu reduced weight (0.5×) în aggregation.
RAȚIONAL: Recognition that synthetic is reconstructed not observed; provides continuity without dominance.
IMPACT dacă greșită: SEVERE — synthetic = real weight 1.0 → dominates real signal early days; weight 0 → ignored → cold start unsolved.
SURSA: ADR 011 §Backfill line 261-263.
PUSH-BACK: 0.5× hardcoded judgment-call; should be tunable per aggregation engine; some signals worth full weight even synthetic (weak group inference).
STATUS: pending review Daniel cross-ref Q-0119

Q-0121 [Domain 1.4 — Backfill validation gate 10 samples]
DECIZIE: Daniel manual review 10 random samples before subtask 4 unblocks. Per entry verified: proposed.sessionType inference, exercises list match, outcome fields match.
RAȚIONAL: Trust-but-verify gate; small sample sufficient for systematic bug detection; signed off in EXEC_RESULTS.md.
IMPACT dacă greșită: SEVERE — gate skipped + buggy backfill = 80+ corrupt entries = corrupt baseline forever.
SURSA: ADR 011 §Backfill validation gate line 263-267.
PUSH-BACK: 10/80 = 12.5% sample; statistically minimal coverage; should be 25%+ for confidence.
STATUS: pending review Daniel cross-ref Q-0119

Q-0122 [Domain 1.4 — Decommission applied-patterns trigger-based]
DECIZIE: Trigger-based parallel run, not time-based. Triggers: ≥30 entries with outcome.executed != null real, zero detected mismatches, manual validation Daniel.
RAȚIONAL: 2-week rule rejected (depends on training cadence variable); trigger-based ground truth.
IMPACT dacă greșită: SEVERE — premature decommission = applied-patterns orphan but CDL incomplete = engine blind.
SURSA: ADR 011 §Decommissioning line 273-285.
PUSH-BACK: 30 entries low bar = ~6 weeks Daniel; fine for solo; with N users = hold last user trigger = synchronization issue.
STATUS: pending review Daniel cross-ref Q-0123

Q-0123 [Domain 1.4 — Pre-decommission 7-day diff audit]
DECIZIE: When all 3 triggers fire, run 7-day diff audit comparing CDL-derived patterns vs legacy applied-patterns output. Daniel reviews diff. Equivalent → decommission. Divergence unexplained → hold + investigate.
RAȚIONAL: Last gate — empirical pattern match required before clean break; no silent regression.
IMPACT dacă greșită: SEVERE — skipping audit = silent CDL bug introduces regression; audit catches.
SURSA: ADR 011 §Decommissioning line 282-285.
PUSH-BACK: 7-day window short; may miss bi-weekly rare patterns; 14-day stronger.
STATUS: pending review Daniel cross-ref Q-0122

Q-0124 [Domain 1.4 — Banner suppression CDL real entries < 3]
DECIZIE: renderIdle.js banner suppressed when CDL real entries (executed=true && synthetic=false) below CALIBRATION_LEVELS.INITIAL.minSessions (3). No pattern claims insufficient real data.
RAȚIONAL: Pattern claims need real data; synthetic alone insufficient; deliberate strictness.
IMPACT dacă greșită: SEVERE — banner shown on synthetic = false claims = trust erosion.
SURSA: ADR 011 §Banner suppression line 287-292; ADR 009 INITIAL minSessions.
PUSH-BACK: 3 sesiuni real arbitrary minimum; could be 5 or 10; reuse ADR 009 threshold = coupling but consistent.
STATUS: pending review Daniel cross-ref Q-0119

Q-0125 [Domain 1.4 — CDL Firebase sync via SYNC_KEYS]
DECIZIE: CDL syncs Firebase RTDB at users/{uid}/coach-decisions, coach-decisions-aggregate, coach-decisions-archive. CDL keys added to SYNC_KEYS în firebase.js.
RAȚIONAL: Same pattern as logs (ADR 001/002); local-first eventual consistent.
IMPACT dacă greșită: SEVERE — sync omis = device divergence; CDL device A ≠ device B.
SURSA: ADR 011 §Firebase sync line 242-246.
PUSH-BACK: LWW (last-write-wins) sync conflict resolution accepted by ADR 011 dar Cognitive Arch §Q9 says CORRECTED v2 — Tombstone & Branching (NOT LWW); contradiction.
STATUS: pending review Daniel cross-ref Q-0126

Q-0126 [Domain 1.4 — CDL append-only LWW acceptable for sync conflicts]
DECIZIE (ADR 011): Append-only semantics + immutable outcome + monotonic superseded transition make last-write-wins acceptable for sync conflicts.
DECIZIE (Cognitive Arch v1): Event Sourcing Append-Only Log + Tombstone & Branching (NU LWW). Conflict ireconciliable → UI prompt zero data loss.
RAȚIONAL conflict: ADR 011 says LWW OK due append-only; Cognitive Arch says T&B; resolution pending.
IMPACT dacă greșită: SEVERE — LWW pe entries care arrive simultan from different devices = arbitrary winner = lose user intent.
SURSA: ADR 011 line 246; Cognitive Arch §Q9 line 358-360.
PUSH-BACK: ADR 011 contradicts Cognitive Arch v1; needs ADR amendment to align cu T&B; current LWW = bug în sync logic future.
STATUS: pending review Daniel — CRITICAL CONTRADICTION cross-ref Q-0125

Q-0127 [Domain 1.4 — CDL demotion daily tick transactional]
DECIZIE: Demotion runs initAutoBackup daily tick. Transactional: failed demotion preserves Tier 1 entry until success.
RAȚIONAL: No entry lost mid-demotion; consistency over performance.
IMPACT dacă greșită: SEVERE — non-transactional demotion + crash = entry lost between Tier 1 and 2.
SURSA: ADR 011 §Storage line 238-239.
PUSH-BACK: Daily tick = up to 24h delay between threshold + demotion; user device offline = demotion miss; cron job.
STATUS: pending review Daniel cross-ref Q-0128

Q-0128 [Domain 1.4 — CDL keys kebab-case convention]
DECIZIE: Storage keys: coach-decisions, coach-decisions-aggregate, coach-decisions-archive (kebab-case, consistent existing applied-patterns, pattern-learning-cache).
RAȚIONAL: Convention consistency; no surprise naming.
IMPACT dacă greșită: MINOR — naming inconsistent = developer surprise; not architectural.
SURSA: ADR 011 §Storage line 234-237.
PUSH-BACK: kebab-case for storage keys but camelCase for object fields = mixed convention; choose one for consistency.
STATUS: pending review Daniel

Q-0129 [Domain 1.4 — CDL schema reconciliation post-implementation]
DECIZIE: Schema additions 26 Apr 2026 post-implementation: proposedSets, actualExercises, actualDurationMins. ADR updated to reflect deployed schema. Schema Reconsideration Trigger #8 covers as normal evolution.
RAȚIONAL: Implementation surfaces needs ADR couldn't anticipate; sync ADR cu code = source truth.
IMPACT dacă greșită: SEVERE — drift unaddressed = ADR document outdated = future eng works on wrong schema.
SURSA: ADR 011 schema additions line 98; Trigger #8 line 364-367.
PUSH-BACK: ADR amendments mid-flight = normalize practice but high friction; should batch ADR updates quarterly.
STATUS: pending review Daniel cross-ref Q-0060

Q-0130 [Domain 1.4 — CDL idempotency conflict reconsideration trigger]
DECIZIE: Reconsideration Trigger #7 — Duplicate entries appear for same date despite 4h + context-change rules → policy revision needed (shorter window, additional context fields).
RAȚIONAL: Empirical observation drives policy; not pre-optimize.
IMPACT dacă greșită: SEVERE — bug observed without trigger update = policy frozen incorrect.
SURSA: ADR 011 Trigger #7 line 360-362.
PUSH-BACK: Trigger reactive — bug må occur first; proactive testing pe Golden Master Suite catches earlier.
STATUS: pending review Daniel cross-ref Q-0105

Q-0131 [Domain 1.4 — CDL multi-tenant migration per Trigger #6]
DECIZIE: Multi-tenancy real auth deployed → CDL path users/{authUid}/coach-decisions. Schema unchanged but migration step required.
RAȚIONAL: User identifier change (anonymous → auth) requires entry remap; schema preserved.
IMPACT dacă greșită: SEVERE — botched migration = entries orphan or duplicated; user data loss.
SURSA: ADR 011 Trigger #6 line 358-359.
PUSH-BACK: "Multi-tenancy real auth" deployment = breaking change; migration script complex; pre-launch testing minim.
STATUS: pending review Daniel

Q-0132 [Domain 1.4 — CDL storage budget 80% threshold]
DECIZIE: Reconsideration Trigger #3 — storage 80% localStorage budget cu TierStorage → drop more fields Tier 2, shorten Tier 1.
RAȚIONAL: Threshold-based reaction; not pre-optimize before evidence.
IMPACT dacă greșită: SEVERE — no monitoring = silent fill; threshold trip late = forced cleanup loss data.
SURSA: ADR 011 Trigger #3 line 354.
PUSH-BACK: 80% reactive; should be alarm at 60%, action at 80%; current single threshold reactive only.
STATUS: pending review Daniel cross-ref Q-0102

Q-0133 [Domain 1.4 — CDL portable schema for backend migration]
DECIZIE: Reconsideration Trigger #4 — backend migration triggered (Firestore, Postgres, custom API) → CDL schema must be portable. Document explicit migration path before launch.
RAȚIONAL: Forward-compat; backend swap inevitable at scale.
IMPACT dacă greșită: SEVERE — schema localStorage-coupled = backend migration = full rewrite.
SURSA: ADR 011 Trigger #4 line 355-356.
PUSH-BACK: "Portable schema" loose definition; relational vs document model = vastly different schemas; need explicit normalization plan.
STATUS: pending review Daniel cross-ref Q-0131

Q-0134 [Domain 1.4 — CDL responseProfile rolling window dependency]
DECIZIE: Reconsideration Trigger #5 — responseProfile rolling window in ADR 009 changes → Tier 1 retention follows.
RAȚIONAL: Boundary lock dependency cross-ADR; consistency.
IMPACT dacă greșită: SEVERE — ADR 009 amendment without ADR 011 follow = boundary mismatch = data loss.
SURSA: ADR 011 Trigger #5 line 357.
PUSH-BACK: Cross-ADR coupling fragile; should be derived not duplicated; computed cu single source ADR 009 const.
STATUS: pending review Daniel cross-ref Q-0102

Q-0135 [Domain 1.4 — CDL pattern false positive trigger]
DECIZIE: Reconsideration Trigger #1 — pattern detection systematically wrong after 60+ real CDL entries → schema missing signal sau synthetic weight 0.5× mis-calibrated.
RAȚIONAL: Empirical signal-based reconsideration; data-driven.
IMPACT dacă greșită: SEVERE — pattern false positive ignored = engine learns wrong pe basis pattern errors.
SURSA: ADR 011 Trigger #1 line 351-353.
PUSH-BACK: 60 entries threshold = ~6 luni Daniel; lung; should observe ealier.
STATUS: pending review Daniel cross-ref Q-0119

Q-0136 [Domain 1.4 — CDL responseProfile contradicts physical intuition]
DECIZIE: Reconsideration Trigger #2 — responseProfile produces results contradicting physical intuition after 6 months → CDL context snapshot missing relevant fields (sleep, stress, nutrition deviation).
RAȚIONAL: Empirical contradiction = CDL incomplete; expand context fields.
IMPACT dacă greșită: SEVERE — incomplete CDL = responseProfile output trusted but wrong = bad recommendations.
SURSA: ADR 011 Trigger #2 line 353-354.
PUSH-BACK: "Contradicts physical intuition" = subjective Daniel observation; should formalize via Golden Master.
STATUS: pending review Daniel cross-ref Q-0135

Q-0137 [Domain 1.4 — CDL context.partial flag for synthetic]
DECIZIE: Synthetic entries: context.partial=true. Fields not reconstructable (readiness, weakGroups against then-current logs) = null.
RAȚIONAL: Flag honest about reconstruction quality; consumers can opt to skip partial entries for high-precision aggregation.
IMPACT dacă greșită: MODERATE — partial flag missing = consumers treat reconstructed fields as observed = false confidence.
SURSA: ADR 011 §Backfill line 254-258.
PUSH-BACK: Boolean partial too coarse; per-field nullability already exists; flag may be redundant.
STATUS: pending review Daniel cross-ref Q-0119

Q-0138 [Domain 1.4 — CDL outcome.executed tri-state plus 'partial']
DECIZIE: outcome.executed: true | false | 'partial' | null. Tri-state + null = pre-population.
RAȚIONAL: Partial execution distinct from full + skip; null = pending; granularity informa AA detection.
IMPACT dacă greșită: MODERATE — boolean only loses partial signal; AA detection can't distinguish.
SURSA: ADR 011 schema line 81.
PUSH-BACK: 'partial' string mixed cu booleans = type ugly; 4 distinct enum values better OOP.
STATUS: pending review Daniel cross-ref Q-0117

Q-0139 [Domain 1.4 — CDL completedExercises vs totalProposedExercises]
DECIZIE: outcome.completedExercises (number) și outcome.totalProposedExercises (number) tracked separately. Compute ratio downstream.
RAȚIONAL: Raw counts preserve audit; ratio derivable; flexibility consumer.
IMPACT dacă greșită: MINOR — ratio only = lose original counts; not audit-friendly.
SURSA: ADR 011 schema line 87-88.
PUSH-BACK: Raw counts redundant cu actualExercises[] length; could derive instead of storing.
STATUS: pending review Daniel

Q-0140 [Domain 1.4 — CDL volumeMultiplier proposed]
DECIZIE: proposed.volumeMultiplier number tracked.
RAȚIONAL: Multiplier explicit la propose time = audit "AI wanted 0.9× volume aici"; downstream comparison.
IMPACT dacă greșită: MINOR — multiplier missing = derive needed but possible from sets ratio.
SURSA: ADR 011 schema line 76.
PUSH-BACK: proposedSets already captures total; multiplier = derivative; storage redundant.
STATUS: pending review Daniel cross-ref Q-0114

Q-0141 [Domain 1.4 — CDL notes free-text]
DECIZIE: proposed.notes free-text string; ex "shoulders weak but PUSH day; face pulls included as compensation".
RAȚIONAL: Human-readable rationale; debugging useful; user-facing if exposed.
IMPACT dacă greșită: MINOR — free-text inconsistent format = parsing impossible; supplementary only.
SURSA: ADR 011 schema line 78.
PUSH-BACK: Free-text NOT machine-parsable = future analytics blocked; structured fields preferred.
STATUS: pending review Daniel cross-ref Q-0142

Q-0142 [Domain 1.4 — CDL rationale.overridden array]
DECIZIE: proposed.rationale.overridden = string[] of stable rule IDs that were considered but lost arbitration.
RAȚIONAL: Decision trace explicit — "WEAK_GROUP_PRIORITY considered but lost to CUT_CONSERVATIVE"; debugging audit.
IMPACT dacă greșită: SEVERE — overridden lipsă = decision opaque = "Why?" button useless.
SURSA: ADR 011 schema line 73; ADR 018 trace pattern.
PUSH-BACK: Overridden array stored per entry = storage; aggregate overridden = waste; only relevant for current decision audit.
STATUS: pending review Daniel cross-ref Q-0078

Q-0143 [Domain 1.4 — CDL context snapshot at decision time]
DECIZIE: context = ctx snapshot at decision time: calibrationLevel, readinessScore, fatigueIndex, daysSinceLastSession, lastSessionType, isInCut, weakGroups[], stagnationWeeks, predictionToday{}, partial.
RAȚIONAL: Reconstruct decision context for audit; pattern learning correlates outcome to context.
IMPACT dacă greșită: SEVERE — incomplete context = pattern learning blind to relevant factors.
SURSA: ADR 011 schema line 53-65.
PUSH-BACK: Snapshot duplicate Tier 2 aggregate context (drop full); should normalize NOT duplicate.
STATUS: pending review Daniel cross-ref Q-0103

Q-0144 [Domain 1.4 — CDL readinessScore 0-100 numeric]
DECIZIE: context.readinessScore numeric (e.g., 75); delta > 20 absolute trigger supersede.
RAȚIONAL: Numeric scale 0-100 standardized; 20 absolute = significant cognitive shift.
IMPACT dacă greșită: MODERATE — % delta > 20 cu absolute readinessScore would be 4 (75→71) trivial; absolute > 20 = 75→55 substantive.
SURSA: ADR 011 schema line 56; idempotency rule line 213.
PUSH-BACK: 0-100 scale arbitrary; could be 0-10 (Likert) or 1-5 (simpler); precision excessive.
STATUS: pending review Daniel cross-ref Q-0106

Q-0145 [Domain 1.4 — CDL fatigueIndex 0-1]
DECIZIE: context.fatigueIndex numeric 0-1 (e.g., 0.3).
RAȚIONAL: Normalized 0-1 = composable cu other multipliers; standard scale.
IMPACT dacă greșită: MINOR — scale arbitrary; consistent usage acceptable.
SURSA: ADR 011 schema line 57.
PUSH-BACK: 0-1 abstract; user interpretation 0.3 = "low fatigue" or "30% fatigued"? Display layer decides.
STATUS: pending review Daniel

Q-0146 [Domain 1.4 — CDL weakGroups array set semantics]
DECIZIE: context.weakGroups = string[] (e.g., ['shoulders']); set semantics for idempotency comparison.
RAȚIONAL: Array represents set; set diff = significant change.
IMPACT dacă greșită: MODERATE — array order shouldn't matter; comparison must be set-aware NOT positional.
SURSA: ADR 011 schema line 60; idempotency line 213.
PUSH-BACK: JSON array order may differ across writes; comparison should sort or use Set; bug surface.
STATUS: pending review Daniel cross-ref Q-0106

Q-0147 [Domain 1.4 — CDL daysSinceLastSession]
DECIZIE: context.daysSinceLastSession numeric.
RAȚIONAL: Recovery context; reactivation flag indirect; pattern signal.
IMPACT dacă greșită: MINOR — derivable from logs ts; storage redundant.
SURSA: ADR 011 schema line 58.
PUSH-BACK: Computed on-the-fly cheap; storage = denormalized cache; staleness if logs change.
STATUS: pending review Daniel

Q-0148 [Domain 1.4 — CDL predictionToday isHighRisk]
DECIZIE: context.predictionToday: { isHighRisk: bool, probability: number 0-1 }.
RAȚIONAL: Prediction model output preserved at decision time; flip triggers supersede.
IMPACT dacă greșită: MODERATE — prediction lost = no way to validate prediction accuracy retrospectively.
SURSA: ADR 011 schema line 63-65.
PUSH-BACK: predictionToday couples CDL to prediction model; model rev = schema migrate? Decoupling preferable.
STATUS: pending review Daniel cross-ref Q-0143

Q-0149 [Domain 1.4 — CDL ts vs date fields]
DECIZIE: Both ts (decision creation timestamp ms) și date ('YYYY-MM-DD' local) tracked.
RAȚIONAL: ts = sortable unique; date = day key for idempotency; both useful.
IMPACT dacă greșită: MINOR — derivable from each other; redundancy ok.
SURSA: ADR 011 schema line 47-49.
PUSH-BACK: Timezone shift = date inconsistent across days; ts in UTC + local_offset preferable Cognitive Arch §Q20 says.
STATUS: pending review Daniel cross-ref Q-0150

Q-0150 [Domain 1.4 — CDL id format human-readable]
DECIZIE: id format 'cd_2026-04-25_18:42' — human readable, sortable.
RAȚIONAL: Debug-friendly; lexicographic sort = chronological; concise.
IMPACT dacă greșită: MINOR — UUID also works; format choice cosmetic.
SURSA: ADR 011 schema line 46.
PUSH-BACK: Same minute conflict possible — 2 buildSession calls in same minute = same id; collision; need second precision.
STATUS: pending review Daniel cross-ref Q-0149

Q-0151 [Domain 1.4 — CDL synthetic boolean explicit field]
DECIZIE: synthetic: boolean entry-level field. Default false; true for backfilled.
RAȚIONAL: Distinguishes synthetic from real în every consumer; weight differently 0.5×.
IMPACT dacă greșită: SEVERE — synthetic entries treated as real = aggregation skewed.
SURSA: ADR 011 schema line 49.
PUSH-BACK: Boolean = bivalent; could be source enum ('real' | 'backfill' | 'imported') for future imports (Strong/Hevy migration).
STATUS: pending review Daniel cross-ref Q-0119

Q-0152 [Domain 1.4 — CDL completedAt timestamp]
DECIZIE: outcome.completedAt = ms timestamp execution finished.
RAȚIONAL: Wall-clock end; duration computable; pattern learning hour-of-day.
IMPACT dacă greșită: MINOR — derivable from logs[ts].max within session group.
SURSA: ADR 011 schema line 93.
PUSH-BACK: Redundant cu logs end timestamp; duplicate storage.
STATUS: pending review Daniel cross-ref Q-0152

Q-0153 [Domain 1.4 — CDL actualDurationMins wall-clock]
DECIZIE: outcome.actualDurationMins = max(log.ts) - min(log.ts) când ≥2 logs; null pe synthetic.
RAȚIONAL: Wall-clock duration for future recovery/fatigue engines; reconstructable from logs.
IMPACT dacă greșită: MINOR — null tolerated; future engines defensive.
SURSA: ADR 011 schema additions line 98.
PUSH-BACK: First-set-to-last-set excludes warm-up; user wall-clock includes pre-session prep; underestimate intentional.
STATUS: pending review Daniel cross-ref Q-0152

Q-0154 [Domain 1.4 — CDL earlyStop boolean]
DECIZIE: outcome.earlyStop boolean. True if session ended before all proposed exercises completed.
RAȚIONAL: Pattern detection signal for abandonment; AA Detection signal candidate.
IMPACT dacă greșită: MODERATE — earlyStop missing = AA pattern detection blind on signal.
SURSA: ADR 011 schema line 91.
PUSH-BACK: Boolean coarse; "early" = how much early (5 sets vs 50%)? Granular better.
STATUS: pending review Daniel cross-ref Q-0118

Q-0155 [Domain 1.4 — CDL rating user post-session]
DECIZIE: outcome.rating string ('normal', 'easy', 'hard', etc).
RAȚIONAL: User self-report = ground truth signal RPE-adjacent; AA detection #3 frustration markers.
IMPACT dacă greșită: SEVERE — rating absent = AA detection signal missing; engine blind.
SURSA: ADR 011 schema line 92.
PUSH-BACK: Free-text rating = parsing inconsistent; should be enum or numeric scale.
STATUS: pending review Daniel cross-ref Q-0156

Q-0156 [Domain 1.4 — CDL rating ≤2/5 proxy until RPE per-set]
DECIZIE: rating ≤2/5 = AA proxy until RPE per-set fix DONE; revisit when RPE granular available.
RAȚIONAL: Best signal currently available; proxy temporary; explicit reconsideration trigger.
IMPACT dacă greșită: MODERATE — proxy = noise relative la RPE; false positives/negatives elevated.
SURSA: ADR 013 Trigger #5 line 249; AA Detection composite fatigue.
PUSH-BACK: Rating 1-5 from user vs RPE = different signals; proxy pe rating may not generalize când RPE arrives.
STATUS: pending review Daniel cross-ref Q-0155

Q-0157 [Domain 1.4 — CDL actualSets aggregate count]
DECIZIE: outcome.actualSets = number of sets executed across all exercises in session.
RAȚIONAL: Volume metric sumat; matchScore volumeRatio component.
IMPACT dacă greșită: MODERATE — actualSets from logs aggregate; if mismatch logs vs CDL = adherence inconsistent.
SURSA: ADR 011 schema line 89.
PUSH-BACK: Set count granular metric; reps + weight = volume more accurate; sets count alone simplistic.
STATUS: pending review Daniel cross-ref Q-0114

Q-0158 [Domain 1.4 — CDL proposedSets stored avoid recompute]
DECIZIE: proposedSets stored on entry creation to avoid recomputing total sets at outcome time.
RAȚIONAL: Performance — outcome population doesn't re-traverse exercises array; pre-computed.
IMPACT dacă greșită: MINOR — recompute trivially cheap; storage cost minor.
SURSA: ADR 011 schema additions line 76, 98.
PUSH-BACK: Denormalized = drift risk if exercises edited post-creation; canonical recompute safer.
STATUS: pending review Daniel cross-ref Q-0157

Q-0159 [Domain 1.4 — CDL actualExercises array Jaccard]
DECIZIE: outcome.actualExercises = array string names for Jaccard overlap în matchScore.
RAȚIONAL: Set overlap formula; required for matchScore exerciseOverlap component.
IMPACT dacă greșită: SEVERE — actualExercises absent = matchScore unable compute exerciseOverlap = matchScore breaks.
SURSA: ADR 011 schema additions line 89.
PUSH-BACK: Exercise name strings = synonymy issues ("Incline DB Press" vs "Incline Dumbbell Press"); ID-based safer.
STATUS: pending review Daniel cross-ref Q-0114

Q-0160 [Domain 1.4 — CDL deviation flag categorical]
DECIZIE: outcome.deviation = boolean. True if actualSessionType !== proposed.sessionType.
RAȚIONAL: Categorical signal; gate matchScore=null when deviation=true.
IMPACT dacă greșită: SEVERE — false deviation = matchScore=null wrong = adherence signal lost.
SURSA: ADR 011 schema line 84.
PUSH-BACK: Boolean coarse — sessionType swap (PUSH→PULL) very different from minor type modification (PUSH→PUSH+legs); granularity needed.
STATUS: pending review Daniel cross-ref Q-0113

Q-0161 [Domain 1.4 — CDL actualSessionType inferred from logs]
DECIZIE: outcome.actualSessionType inferred from logs at endSession time. Same inference logic as backfill (muscle group majority).
RAȚIONAL: Consistency cu synthetic backfill; deterministic from logs.
IMPACT dacă greșită: SEVERE — inference bug = false deviation = adherence corrupt.
SURSA: ADR 011 §Backfill line 251 + §Integration line 297.
PUSH-BACK: Inference complex (mixed exercise sessions e ambiguous); user might call it PUSH but logs say PULL = inference disagrees.
STATUS: pending review Daniel cross-ref Q-0160

Q-0162 [Domain 1.4 — CDL exercise list matching synthetic]
DECIZIE: Synthetic backfill: proposed.exercises = list unique exercises in session. NOT inferred from "ideal" PUSH session.
RAȚIONAL: Match to logs; matchScore on synthetic = trivially 1.0 (synthetic by construction).
IMPACT dacă greșită: MODERATE — synthetic matchScore inflated = aggregation biased toward perfect; 0.5× weight mitigates.
SURSA: ADR 011 §Backfill line 252-258.
PUSH-BACK: Synthetic matchScore artificially perfect = synthetic entries dominate "high adherence" bucket.
STATUS: pending review Daniel cross-ref Q-0119

Q-0163 [Domain 1.4 — CDL outcome populated post-execution]
DECIZIE: outcome populated post-execution (endSession, cancelWorkout). Null until then.
RAȚIONAL: One-way write; immutable post-population; no edits.
IMPACT dacă greșită: SEVERE — pre-population reads = wrong data; null check requirement everywhere.
SURSA: ADR 011 schema line 80; idempotency rule 5.
PUSH-BACK: Outcome edits prohibited = user can't fix typo (logged 5×8kg meant 5×80kg); should allow correction window.
STATUS: pending review Daniel cross-ref Q-0164

Q-0164 [Domain 1.4 — User edit history allowed via Cloud Function diff]
DECIZIE: Cognitive Arch §Q16 — user edit history allowed (typo correction). ARBITRATOR past = IMUABIL. Edit triggers Cloud Function Incremental Diff pe Historical_Profile. Mâine AI uses corrected.
RAȚIONAL: Anti-gaming preserved (past decision frozen); future decision uses correct data.
IMPACT dacă greșită: SEVERE — full edit history = user gaming retro; immutable past = blocked typo fix.
SURSA: Cognitive Arch §Q16 Recovery line 405-407.
PUSH-BACK: Conflicts cu ADR 011 outcome immutability; need ADR amendment to align — what fields can user edit post-population?
STATUS: pending review Daniel cross-ref Q-0163

Q-0165 [Domain 1.4 — CDL sessionType enum 'PUSH'/'PULL'/'LEGS'/etc]
DECIZIE: sessionType enum {PUSH, PULL, LEGS, FULL, OFF, ...} — extensible string, hardcoded check în deviation logic.
RAȚIONAL: Standard hipertrofie split; OFF distinguishes rest day proposal.
IMPACT dacă greșită: MODERATE — non-enum check = typo bugs; enum strict = future split (UPPER/LOWER) blocked.
SURSA: ADR 011 implicit; PROG template structure.
PUSH-BACK: Sessions cu split nestandard (ex: arms-only) = mismatch enum; user-defined templates blocked.
STATUS: pending review Daniel

Q-0166 [Domain 1.4 — CDL cd_ prefix convention]
DECIZIE: id prefix 'cd_' for coach-decision entries; distinguishable from logs ('lg_'?), profile-history ('ph_'?).
RAȚIONAL: Visual distinction in storage browse; debug clarity.
IMPACT dacă greșită: MINOR — collision unlikely; prefix cosmetic.
SURSA: ADR 011 schema line 46 example.
PUSH-BACK: Prefix waste 3 chars × N entries; UUID prefixed adds metadata for free.
STATUS: pending review Daniel cross-ref Q-0150

Q-0167 [Domain 1.4 — CDL Tier transitions implicit on demotion]
DECIZIE: Tier 1 → Tier 2 demotion drops fields per Tier 2 schema. Tier 2 → Tier 3 monthly rollup aggregates.
RAȚIONAL: Sequential demotion; each tier read-only post-demotion.
IMPACT dacă greșită: SEVERE — demotion bug = fields preserved when shouldn't = budget overflow.
SURSA: ADR 011 §Storage line 230-237.
PUSH-BACK: Tier 2/3 read-only assumption fragile; data corruption Tier 2 = no recovery.
STATUS: pending review Daniel cross-ref Q-0127

Q-0168 [Domain 1.4 — CDL serialization JSON.stringify]
DECIZIE: CDL entries serialized JSON.stringify in localStorage key.
RAȚIONAL: localStorage primitive only string; JSON standard; restore JSON.parse.
IMPACT dacă greșită: SEVERE — JSON parse fail = entire CDL inaccessible; corruption = full backup loss.
SURSA: ADR 011 implicit; ADR 001 local-first.
PUSH-BACK: JSON serialization for 250 entries × 1KB = 250KB single string; parse spike user device freeze.
STATUS: pending review Daniel cross-ref Q-0132

Q-0169 [Domain 1.4 — CDL Firebase RTDB users/{uid}/coach-decisions path]
DECIZIE: Firebase path users/{uid}/coach-decisions, /coach-decisions-aggregate, /coach-decisions-archive.
RAȚIONAL: User-scoped private; per-tier separate node = sync efficiency.
IMPACT dacă greșită: SEVERE — wrong path = sync to /global = privacy leak; permission model broken.
SURSA: ADR 011 §Firebase sync line 242-243.
PUSH-BACK: 3 separate nodes = 3 listeners = sync overhead; nested object users/{uid}/cdl/{tier1,tier2,tier3} more efficient.
STATUS: pending review Daniel cross-ref Q-0125

Q-0170 [Domain 1.4 — CDL _suppressFirebaseSync flag honored]
DECIZIE: Same _suppressFirebaseSync flag honored as logs; opt-out sync per write.
RAȚIONAL: Existing pattern; no special-case CDL.
IMPACT dacă greșită: SEVERE — flag bypass = sync writes when user paused; rate limit hit.
SURSA: ADR 011 §Firebase sync line 245.
PUSH-BACK: Flag in-memory pre-reload lost; HANDOVER flagged Firebase Sync Re-Pull bug pe asta — pattern fragil documented critical pre-launch.
STATUS: pending review Daniel cross-ref Q-0171

Q-0171 [Domain 1.4 — Firebase Sync Re-Pull memory paradox CRITICAL]
DECIZIE: Pattern observat 2 ori: _suppressFirebaseSync=true setat memory pre-reload SE PIERDE la reload. Pe page reload, Firebase pull re-introduce entries deleted local. Solution: Tombstone & Branching pattern (deja locked Cognitive Arch v1, NU implementat). Trigger: pre-launch obligatoriu.
RAȚIONAL: Memory state lost on reload = sync bypass nu persistă; entries reaparelnte = "memory paradox"; T&B append-only invariant rezolvă.
IMPACT dacă greșită: CATASTROFIC — production bug; user delete entries → reload → entries return = data integrity broken.
SURSA: HANDOVER_2026-04-29 §Firebase Sync Re-Pull CRITICAL pre-launch line 158-162.
PUSH-BACK: T&B implementation = ADR 011 amendment; cross-ADR coordination needed; effort 1-2 sprints.
STATUS: pending review Daniel — CRITICAL pre-launch cross-ref Q-0125 Q-0126

Q-0172 [Domain 1.4 — Tombstone & Branching pattern locked Cognitive Arch v1]
DECIZIE: Tombstone & Branching pattern: Event Sourcing append-only log. Conflict ireconciliable → UI prompt "varianta A sau B?". Zero data loss.
RAȚIONAL: Append-only invariant + branch on irreconcilable = preserve all writes; user resolves; CRDTs alternative considered + rejected (complexity vs scenario rare).
IMPACT dacă greșită: CATASTROFIC — without T&B, conflicts LWW-style = silent data loss; user trust eroded.
SURSA: Cognitive Arch §Q9 CORRECTED v2 line 358-362.
PUSH-BACK: T&B complex; UI prompt friction; user "varianta A sau B?" decision fatigue at scale.
STATUS: pending review Daniel cross-ref Q-0171

Q-0173 [Domain 1.4 — CDL impact on patternLearning rewrite]
DECIZIE: patternLearning reads CDL instead applied-patterns (after decommission gate).
RAȚIONAL: Decision-bounded patterns NU calendar-bounded; H30c resolution.
IMPACT dacă greșită: SEVERE — pre-decommission read CDL while applied-patterns still authoritative = race; post-decommission migrate gracefully.
SURSA: ADR 011 §Integration line 296.
PUSH-BACK: Migration parallel run cost; engineer load.
STATUS: pending review Daniel cross-ref Q-0122

Q-0174 [Domain 1.4 — CDL impact on adherence rewrite]
DECIZIE: adherence.js rewritten read CDL instead counting raw logs against PROG static.
RAȚIONAL: "User ignored proposal" vs "coach proposed rest, user rested" distinguishable now; adherence semantic.
IMPACT dacă greșită: SEVERE — adherence numeric correct but semantic wrong = user thinks executing perfectly when actually deviating from proposals.
SURSA: ADR 011 §Integration line 299; Context line 32.
PUSH-BACK: Rewrite scope; behavioral change adherence numeric pre/post = user-visible discrepancy.
STATUS: pending review Daniel cross-ref Q-0173

Q-0175 [Domain 1.4 — CDL renderIdle banner sourced ctx.patterns]
DECIZIE: renderIdle.js banner sourced ctx.patterns (filtered by director, sourced CDL); suppressed if insufficient real entries.
RAȚIONAL: Single source truth director → ctx → UI; suppression integrated.
IMPACT dacă greșită: SEVERE — banner from legacy applied-patterns post-decommission = orphan reads = empty banner.
SURSA: ADR 011 §Integration line 300.
PUSH-BACK: ctx.patterns coupling renderIdle to director shape; if ctx changes shape, renderIdle breaks; refactor pressure.
STATUS: pending review Daniel cross-ref Q-0124

#### 1.5 Calibration Tiers (COLD_START → INITIAL → DEVELOPING → PERSONALIZING → PERSONALIZED → OPTIMIZED)

Q-0176 [Domain 1.5 — 6-tier calibration progression]
DECIZIE: 6 tiers: COLD_START → INITIAL → DEVELOPING → PERSONALIZING → PERSONALIZED → OPTIMIZED.
RAȚIONAL: Progressive AI confidence tiers; each unlocks new features; user trust + engine learning aligned.
IMPACT dacă greșită: SEVERE — tier confusion = user gets wrong feature gating; engine acts on insufficient data.
SURSA: ADR 009 calibration tiers; HANDOVER §Aware system tier table line 96-100.
PUSH-BACK: 6 tiers complex for users to understand; consolidation to 3 tiers (BEGINNER/MID/ADVANCED) cleaner UX.
STATUS: pending review Daniel cross-ref Q-0177

Q-0177 [Domain 1.5 — INITIAL minSessions threshold]
DECIZIE: CALIBRATION_LEVELS.INITIAL.minSessions = 3 (current).
RAȚIONAL: Banner suppression gate; 3 sesiuni real minimum for pattern claims; deliberate strictness.
IMPACT dacă greșită: SEVERE — too low (1) = false patterns claimed; too high (10) = banner silent for first month.
SURSA: ADR 009 INITIAL minSessions; ADR 011 §Banner suppression line 287.
PUSH-BACK: 3 arbitrary; pattern detection algoritmic confidence depinde de variance NU count; pure count threshold simplistic.
STATUS: pending review Daniel cross-ref Q-0124

Q-0178 [Domain 1.5 — Tier transitions count-based vs time-based]
DECIZIE: Tier transitions count sessions completed (data-driven), NU calendar time.
RAȚIONAL: User cu 21 sesiuni în 1 lună vs în 1 an = same engine confidence; count = real signal.
IMPACT dacă greșită: MODERATE — calendar-time = sporadic user blocked în T0 forever; count-based = quick T2 promotion possible.
SURSA: Cognitive Arch §Q15 line 401-404 + ADR 009.
PUSH-BACK: Count alone ignores quality — 21 stress-skipped sesiuni vs 21 fully-logged sesiuni = vastly different engine value.
STATUS: pending review Daniel cross-ref Q-0006

Q-0179 [Domain 1.5 — T0 0-4 sesiuni REALTIME 100%]
DECIZIE: T0 (Cold Start) = 0-4 sesiuni; REALTIME 100% pondere voice.
RAȚIONAL: Zero history = HISTORICAL irrelevant; PROJECTION needs history for trend; REALTIME via slider sufficient.
IMPACT dacă greșită: SEVERE — T0 cu HISTORICAL active = decisions on noise; PROJECTION = prediction on N=0.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R8 + §Q15 line 401-403.
PUSH-BACK: Demographic Prior (ADR 017) provides "synthetic history" for cold start = HISTORICAL could activate cu lower weight; current 0% wastes resource.
STATUS: pending review Daniel cross-ref Q-0180

Q-0180 [Domain 1.5 — T1 5-20 sesiuni voice weights]
DECIZIE: T1 (Warming) = 5-20 sesiuni; weights REALTIME 70%, HISTORICAL 25%, PROJECTION 5%.
RAȚIONAL: Building history; REALTIME still primary; HISTORICAL adding signal; PROJECTION limited until pattern stable.
IMPACT dacă greșită: MODERATE — wrong weights = decisions diluted; recalibrabile.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R8 line 92-96.
PUSH-BACK: 5/25/70 fixed = magic numbers; should anneal smoothly NU step jumps T0→T1.
STATUS: pending review Daniel cross-ref Q-0009

Q-0181 [Domain 1.5 — T2 21+ sesiuni voice weights]
DECIZIE: T2 (Calibrated) = 21+ sesiuni; weights HISTORICAL 60%, REALTIME 30%, PROJECTION 10%.
RAȚIONAL: Substantial history; HISTORICAL primary; REALTIME modulator; PROJECTION emerging.
IMPACT dacă greșită: MODERATE — over-historical = ignore today's reality; under-historical = no learning value.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R8 line 92-96.
PUSH-BACK: T2 forever or evolve to T3? OPTIMIZED tier in 6-tier model implies more states; weights table for OPTIMIZED missing.
STATUS: pending review Daniel cross-ref Q-0182

Q-0182 [Domain 1.5 — T2 vs OPTIMIZED voice weights]
DECIZIE: COGNITIVE_ARCHITECTURE 3-tier (T0/T1/T2); ADR 009 6-tier (COLD_START → OPTIMIZED). Mismatch — tier mapping unclear.
RAȚIONAL conflict: COGNITIVE_ARCH simplifies; ADR 009 granular; reconciliation pending.
IMPACT dacă greșită: SEVERE — tier mismatch cross-ADR = engine logic confused tiers; bugs subtle.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R8; ADR 009.
PUSH-BACK: Documentation drift; need amendment ADR 009 to align cu Cognitive Arch sau update Cognitive Arch.
STATUS: pending review Daniel — DOCUMENTATION CONFLICT cross-ref Q-0181

Q-0183 [Domain 1.5 — Tier decay on inactivity ADR 012]
DECIZIE: Tier decays after inactivity period (ADR 012). User regress tier after extended pause.
RAȚIONAL: 6 luni pause → engine confidence stale; restart with 2 weeks deload re-calibration.
IMPACT dacă greșită: SEVERE — no decay = engine confident on stale signal; aggressive decay = punish vacation.
SURSA: ADR 012 tier decay; PRODUCT_STRATEGY §9.7 line 360-362.
PUSH-BACK: "Stale signal" ambiguous — body adapts during pause; engine should INCREASE conservativeness, not full reset.
STATUS: pending review Daniel cross-ref Q-0184

Q-0184 [Domain 1.5 — 6 luni reactivate Restart re-calibrare]
DECIZIE: 6 luni reactivate → HISTORICAL decay → 1RM scăzut. Engine propune Restart re-calibrare (2 săpt ușoare).
RAȚIONAL: Realistic body decay over 6 months; conservative re-entry safety.
IMPACT dacă greșită: SEVERE — over-aggressive return = injury risk first sessions; under-conservative = waste 4 weeks of body memory.
SURSA: PRODUCT_STRATEGY §9.7 line 360-362.
PUSH-BACK: 6 luni hardcoded; user's last week pre-pause matters (heavy lift vs deload); should use pre-pause peak NU just timestamp.
STATUS: pending review Daniel cross-ref Q-0183

Q-0185 [Domain 1.5 — Re-onboarding Archive & Start Fresh]
DECIZIE: Re-onboarding (6 luni pause): Archive & Start Fresh. Raw data păstrat background. Historical_Profile hard reset. Old istoric contribuie doar la muscle_memory_index.
RAȚIONAL: Clean slate fresh signal; muscle memory accelerated re-calibration; raw data preserved for debug.
IMPACT dacă greșită: SEVERE — full archive purge = future analysis blocked; no archive = pollution Historical_Profile.
SURSA: Cognitive Arch §Q17 line 410-412.
PUSH-BACK: muscle_memory_index spec missing — algorithm? lookup table? Open item flagged in PRODUCT_STRATEGY §"Open Items".
STATUS: pending review Daniel cross-ref Q-0184

Q-0186 [Domain 1.5 — Modul Tracker T0 onboarding skip]
DECIZIE: Onboarding skip allowed permanent (Modul Tracker — T0). Banner: "Pentru recomandări AI, completează profilul sau loghează 5 antrenamente."
RAȚIONAL: User control respected; AI features locked behind data; honest gating.
IMPACT dacă greșită: MODERATE — skip permanent = user never unlock value; aggressive prompts = user hates app.
SURSA: PRODUCT_STRATEGY §2.2 line 78; §11 Tracker Mode.
PUSH-BACK: 5 antrenamente threshold low; Tracker Mode user productive but no AI = "what's the value?" question valid.
STATUS: pending review Daniel cross-ref Q-0177

Q-0187 [Domain 1.5 — Tier-specific aware system thresholds]
DECIZIE: Aware system thresholds per tier — COLD_START/INITIAL: 50% reduce 3×, 7d suppress 7×, off perm 15×; DEVELOPING: 2/5/10×; PERSONALIZING+: 1/3/5×.
RAȚIONAL: Newer users tolerate more pushback; experienced = single nudge enough.
IMPACT dacă greșită: SEVERE — thresholds reversed (newer = strict) = abandon early; advanced users spammed = churn.
SURSA: HANDOVER §Aware system table line 96-101.
PUSH-BACK: Tier-based thresholds rigid; user-personality variance > tier; should be Profile Typing-driven NOT tier.
STATUS: pending review Daniel cross-ref Q-0188

Q-0188 [Domain 1.5 — Counter reset 30 zile fără skip]
DECIZIE: Reset signal: accept = counter reset. 30 zile fără skip = reset.
RAȚIONAL: Behavior change rewarded; long-stable behavior re-evaluated fresh.
IMPACT dacă greșită: MODERATE — reset prea agresiv = no learning; reset niciodată = old user-friction stays forever.
SURSA: HANDOVER §Aware system reset line 102.
PUSH-BACK: 30 zile arbitrar; should be tied to calibration tier transitions or major life events (vacation, injury).
STATUS: pending review Daniel cross-ref Q-0187

Q-0189 [Domain 1.5 — Calibration tier presented user-facing]
DECIZIE: Tier presented user-facing (informational): "Cold Start" / "Personalizing" / etc. NOT exposed: weights, thresholds.
RAȚIONAL: Honest progress signal; transparency moderate; engine internals MOAT-protected.
IMPACT dacă greșită: SEVERE — exposing weights = reverse-engineering; hiding tier = "AI black box" anti-pattern trust.
SURSA: MOAT_STRATEGY §3 verifiable decisions; PRODUCT_STRATEGY §4.7 explain decisions ALWAYS ON.
PUSH-BACK: "Personalizing" pe label vs "PERSONALIZING" caps internal; UX tone vs engineering enum gap.
STATUS: pending review Daniel cross-ref Q-0006

Q-0190 [Domain 1.5 — getBF calibration only ADR 015]
DECIZIE: BF% function for calibration only (ADR 015), NOT user-facing display. BF% used internally for LBM calculation, protein/kcal targets.
RAȚIONAL: Avoid user obsession over BF estimate accuracy; internal use justified for engine math.
IMPACT dacă greșită: SEVERE — BF% display + naive estimate = user mistrust ("12%? I'm clearly 18%"); calibration only avoids friction.
SURSA: ADR 015 getBF calibration only.
PUSH-BACK: User wants BF% display (motivation); hiding completely = product gap; could expose with disclaimer.
STATUS: pending review Daniel cross-ref Q-0191

Q-0191 [Domain 1.5 — getBF dead code finding 2026-04-27]
DECIZIE: getBF dead code finding (FINDINGS_MASTER) — function not used in current engine paths; pending cleanup.
RAȚIONAL: Code rot; cleanup scheduled or removed.
IMPACT dacă greșită: MINOR — dead code present = bundle size minor + cognitive overhead; cleanup low-stakes.
SURSA: GETBF_DEAD_CODE_FINDING_2026-04-27.md.
PUSH-BACK: Dead code today != dead forever; if planned reactivation = keep with TODO.
STATUS: pending review Daniel cross-ref Q-0190

Q-0192 [Domain 1.5 — Tier T0 dimensions filter requiresCalibration]
DECIZIE: Dimensions filter via requiresCalibration field în registry: 'PERSONALIZING' = skipped if user tier < PERSONALIZING.
RAȚIONAL: Some dimensions need substantial history (e.g., responseProfile); gate at registry level.
IMPACT dacă greșită: SEVERE — gate omis = dimension active T0 cu insufficient data = noise; gate too high = late activation.
SURSA: ADR 018 §1 registry example line 60-87.
PUSH-BACK: Hardcoded 'PERSONALIZING' = single threshold per dimension; some dimensions could activate gradual T0→T1 cu lower weight.
STATUS: pending review Daniel cross-ref Q-0061

Q-0193 [Domain 1.5 — Calibration tier reset on goal switch]
DECIZIE: Macro_Change (goal switch Cut/Bulk) = invalidate cached engine state. Tier preserved; cache invalidated.
RAȚIONAL: New phase = different load patterns; cache stale; tier reflects experience NOT phase.
IMPACT dacă greșită: SEVERE — tier reset on goal switch = punish phase change; cache preserved = stale recommendations.
SURSA: Cognitive Arch §R26 invalidation triggers line 152-160.
PUSH-BACK: Some patterns are cross-phase (recovery quality, technique), others phase-specific; full invalidation throws baby with bathwater.
STATUS: pending review Daniel cross-ref Q-0021

Q-0194 [Domain 1.5 — Calibration progression display]
DECIZIE: Tier display in profile/settings; current tier label (RO: "În cunoaștere" / "Calibrat" / etc).
RAȚIONAL: Honest progress; user understands AI confidence level.
IMPACT dacă greșită: MINOR — label tone choice; not architectural.
SURSA: Cognitive Arch §Q15 + UX implicit.
PUSH-BACK: RO label "În cunoaștere" patronizing; alternatives: "Învățăm" / "Pregătire" / "Activ".
STATUS: pending review Daniel cross-ref Q-0189

Q-0195 [Domain 1.5 — Aware system off permanent threshold]
DECIZIE: Aware system off permanent triggered after N skips per tier (15 COLD/INITIAL, 10 DEVELOPING, 5 PERSONALIZING+).
RAȚIONAL: Accept user's persistent decline; re-prompt = harassment.
IMPACT dacă greșită: SEVERE — off permanent = forever lose chance to re-engage user; should expire.
SURSA: HANDOVER §Aware system table line 96-101.
PUSH-BACK: "Off permanent" too final; should re-trigger if context dramatically changes (new injury, new goal, new phase).
STATUS: pending review Daniel cross-ref Q-0188

Q-0196 [Domain 1.5 — Tier promotion not auto-demote]
DECIZIE: Tier auto-promotes on session count thresholds; auto-demotes ONLY on inactivity (ADR 012); not on quality drop.
RAȚIONAL: Quality drop within active = body fluctuation, not engine confidence drop; promotion irreversible mid-active.
IMPACT dacă greșită: SEVERE — auto-demote on quality = punish bad weeks; never demote = stale tier on long disengagement.
SURSA: ADR 012 inactivity decay; ADR 009 progression.
PUSH-BACK: Drop quality = engine signal corrupt; ignoring = AI keeps confident on noisy data.
STATUS: pending review Daniel cross-ref Q-0183

Q-0197 [Domain 1.5 — User override tier decision]
DECIZIE: User cannot override tier (auto-derived from session count); presented as informational.
RAȚIONAL: User can't game tier for unlock features; engine-controlled.
IMPACT dacă greșită: MODERATE — gameable tier = users skip beginner content; locked tier = cannot skip user already-experienced.
SURSA: implicit ADR 009 + Cognitive Arch §Q15.
PUSH-BACK: Returning user from another fitness app may have 5 years experience but tier T0; should support "Experienced" onboarding flag with skip-ahead.
STATUS: pending review Daniel cross-ref Q-0186

Q-0198 [Domain 1.5 — Tier in CDL context snapshot]
DECIZIE: CDL context.calibrationLevel snapshot stored; preserve tier at decision time.
RAȚIONAL: Decision audit needs tier context; pattern learning correlates outcome to tier.
IMPACT dacă greșită: SEVERE — tier change between proposed and outcome = audit confused.
SURSA: ADR 011 schema line 55.
PUSH-BACK: Tier transition mid-session unlikely; storage redundant; on-demand lookup possible.
STATUS: pending review Daniel cross-ref Q-0143

Q-0199 [Domain 1.5 — Onboarding fields drive Tier 0 baseline]
DECIZIE: Onboarding minimum: Age, Gender, Weight, Goal, Experience. Statistical baseline temporary.
RAȚIONAL: PROJECTION needs these for safety caps; minimal friction.
IMPACT dacă greșită: SEVERE — incomplete onboarding = cannot infer baseline = unsafe propositions.
SURSA: Cognitive Arch §Q15 line 396-398.
PUSH-BACK: 5 fields meets safety cap minimum; for Bayesian Nutrition + BF estimation more fields useful (height, BF estimate); should expand opt-in.
STATUS: pending review Daniel cross-ref Q-0186

Q-0200 [Domain 1.5 — REALTIME slider Cold Start UX]
DECIZIE: REALTIME zero data: UI Slider "Câtă energie ai azi? 1-10". Singura voce activă T0.
RAȚIONAL: Manual proxy for fatigue/readiness; user-controlled signal until data accumulates.
IMPACT dacă greșită: MODERATE — slider missing = no REALTIME signal; user spam slider = reliability low.
SURSA: Cognitive Arch §Q15 line 399-400.
PUSH-BACK: 1-10 scale Likert preference; some users always pick 5 ("don't know"); 3-point (low/normal/high) cleaner.
STATUS: pending review Daniel cross-ref Q-0179

#### 1.6 Pattern Learning (adherence, deviation, early-stop, stagnation, suppression gates)

Q-0201 [Domain 1.6 — Pattern learning sources CDL post-decommission]
DECIZIE: patternLearning sources CDL active entries (non-superseded). Filter synthetic 0.5× weight.
RAȚIONAL: Single source truth; decision-bounded patterns; H30c resolution.
IMPACT dacă greșită: SEVERE — multi-source = pattern false positives; synthetic over-weighted = bias.
SURSA: ADR 011 §Integration line 296.
PUSH-BACK: Single source rigid; what if Vitality dimension introduces independent pattern source = needs cross-source aggregation.
STATUS: pending review Daniel cross-ref Q-0173

Q-0202 [Domain 1.6 — adherenceRate per CDL formula]
DECIZIE: adherenceRate = entries.where(executed && !deviation) / entries.where(proposed).
RAȚIONAL: Strict definition — executed AND no deviation = adherence; partial or deviation excluded.
IMPACT dacă greșită: SEVERE — adherenceRate inflated by counting partial as adherent = false confidence engine.
SURSA: ADR 011 §matchScore line 124.
PUSH-BACK: Boolean adherence loses partial signal; adherence + matchScore both = composite signal more accurate.
STATUS: pending review Daniel cross-ref Q-0115

Q-0203 [Domain 1.6 — deviationRate distinct metric]
DECIZIE: deviationRate = entries.where(deviation) / entries.where(proposed).
RAȚIONAL: Deviation as separate signal; UX issue / coach misread distinguishable from execution issue.
IMPACT dacă greșită: SEVERE — combined adherence + deviation = wrong intervention.
SURSA: ADR 011 §matchScore line 125.
PUSH-BACK: adherenceRate + deviationRate may not sum 100% (partial executions not in either) — need third "partialRate".
STATUS: pending review Daniel cross-ref Q-0202

Q-0204 [Domain 1.6 — early-stop pattern detection]
DECIZIE: outcome.earlyStop boolean tracked per CDL entry; pattern detected via N consecutive early stops.
RAȚIONAL: Early stop = fatigue/disengagement signal; AA Detection trigger candidate.
IMPACT dacă greșită: MODERATE — earlyStop noise on isolated case; pattern threshold avoids false positive.
SURSA: ADR 011 schema line 91.
PUSH-BACK: Early stop reason ambiguous — schedule conflict vs fatigue vs boredom; signal alone too coarse.
STATUS: pending review Daniel cross-ref Q-0154

Q-0205 [Domain 1.6 — stagnation detector StageStateWeeks]
DECIZIE: stagnationDetector.js tracks consecutive weeks with no progress per exercise/group; STAGNATION_WEEK_4/6/8 rules.
RAȚIONAL: Flag plateaus; trigger interventions deload, exercise variation.
IMPACT dacă greșită: SEVERE — stagnation undetected = user spinning wheels; over-detected = constant deloads = no progress.
SURSA: existing engine src/engine/stagnationDetector.js; ADR 011 schema line 60.
PUSH-BACK: Week-based granularity may miss intra-week patterns; daily progressive overload tracking finer.
STATUS: pending review Daniel cross-ref Q-0205

Q-0206 [Domain 1.6 — Suppression gate < 3 real entries]
DECIZIE: Pattern banner suppressed when CDL real entries < 3.
RAȚIONAL: Insufficient data = no claims; integrity over engagement.
IMPACT dacă greșită: SEVERE — false claims = trust erosion; deliberate strictness.
SURSA: ADR 011 §Banner suppression line 287-292.
PUSH-BACK: 3 = arbitrary; pattern confidence depinde de signal-to-noise NU count alone; statistical confidence approach.
STATUS: pending review Daniel cross-ref Q-0124

Q-0207 [Domain 1.6 — Stagnation trigger volume reduction]
DECIZIE: Stagnation 3 săpt + fatigue ridicată + projection "not deload, exercise problem" = PROJECTION + REALTIME team up. Schimbare exercițiu + intensitate redusă strict.
RAȚIONAL: Pattern + fatigue + projection coordinate → exercise rotation + intensity drop.
IMPACT dacă greșită: SEVERE — stagnation handled wrong = continued plateau; excess deload = lose adaptation.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R3 line 81-82.
PUSH-BACK: 3 weeks hardcoded; some lifts plateau over 6 weeks normally; threshold variable per lift type.
STATUS: pending review Daniel cross-ref Q-0205

Q-0208 [Domain 1.6 — Volume creep AA signal]
DECIZIE: AA Detection signal #1: outcome.deviated == true cu actualVolume > proposedVolume pentru 3+ sesiuni consecutive.
RAȚIONAL: Volume creep neprovocat = auto-aggression marker; pattern requirement (3+) avoids noise.
IMPACT dacă greșită: SEVERE — false positive = warning legit user; false negative = miss self-sabotage.
SURSA: ADR 013 §Detection signals line 50.
PUSH-BACK: 3+ consecutive may miss every-other-week pattern; window-based (X out of Y) more robust.
STATUS: pending review Daniel cross-ref Q-0209

Q-0209 [Domain 1.6 — Pattern learning windows ISO 8601]
DECIZIE: Week boundary ISO 8601 (Monday-Sunday, Thursday rule) — consistent cu responseProfile.js, stagnationDetector.js.
RAȚIONAL: Standard week semantic; consistent across engines; deterministic boundaries.
IMPACT dacă greșită: SEVERE — non-ISO inconsistent = patterns split across calculations; bugs.
SURSA: ADR 013 §Window line 67-72.
PUSH-BACK: Sunday-Saturday for US users; locale issue future i18n; should respect locale.
STATUS: pending review Daniel cross-ref Q-0073

Q-0210 [Domain 1.6 — Composite fatigue score 2+ markers din 3]
DECIZIE: Composite fatigue marker = 2+ din 3 într-o săptămână: reps achieved <60% pe 2+ exerciții, rating ≤2/5, volume scădere voluntară >20%.
RAȚIONAL: Single signal noisy; composite rule reduces false positives.
IMPACT dacă greșită: SEVERE — too lax = miss fatigue; too strict = no detection.
SURSA: ADR 013 §Composite fatigue line 74-83.
PUSH-BACK: 3 markers fixed list; missing signals (sleep, RHR, mood) limit detection power; v1 acceptable but reconsider trigger.
STATUS: pending review Daniel cross-ref Q-0211

Q-0211 [Domain 1.6 — Reps achieved <60% pe 2+ exerciții]
DECIZIE: Fatigue marker #1: reps achieved <60% pe 2+ exerciții consecutive în aceeași sesiune.
RAȚIONAL: Single exercise = bias load greșit; 2+ consecutive = fatigue real cross-exercise.
IMPACT dacă greșită: MODERATE — 60% threshold arbitrary; 2+ may miss single bad exercise pattern.
SURSA: ADR 013 §Composite fatigue line 78.
PUSH-BACK: 60% pe 2 exerciții = rare event = false negative likely; 70%/3 exerciții ar fi mai loose dar mai sensibil.
STATUS: pending review Daniel cross-ref Q-0210

Q-0212 [Domain 1.6 — Volume scădere voluntară >20% fără reason]
DECIZIE: Fatigue marker #3: volume scădere voluntară >20% vs ultima sesiune similară fără reason logged în CDL. Cu reason = self-regulation, NU fatigue marker.
RAȚIONAL: Voluntary cut without reason = fatigue indicator; with reason = sane adjustment.
IMPACT dacă greșită: SEVERE — reason field missing = false fatigue flag; user habituated to NOT log reason.
SURSA: ADR 013 §Composite fatigue line 80-82.
PUSH-BACK: "Reason" requires user input field UX; friction; many users skip = false fatigue flags.
STATUS: pending review Daniel cross-ref Q-0210

Q-0213 [Domain 1.6 — Pattern learning false positives mitigation]
DECIZIE: Pattern detection systematically wrong after 60+ real CDL entries → reconsideration trigger ADR 011 #1.
RAȚIONAL: Empirical data drives calibration; reactive trigger.
IMPACT dacă greșită: SEVERE — pattern wrong propagates engine learning; unaddressed = systemic error.
SURSA: ADR 011 Trigger #1 line 351-353.
PUSH-BACK: Reactive trigger requires ground truth oracle (Daniel observation); systematic without manual = blind.
STATUS: pending review Daniel cross-ref Q-0135

Q-0214 [Domain 1.6 — Pattern banner wording neutral]
DECIZIE: Banner wording "Coach-ul observă..." NU "5 signals detectate". Anti-RE neutral language.
RAȚIONAL: Hide engine internals; presentation-layer abstraction.
IMPACT dacă greșită: SEVERE — exposing signals = reverse engineering; specific wording catches user's attention without leak.
SURSA: HANDOVER §6 categorical display + AA modal anti-RE rewrite line 57.
PUSH-BACK: Vague language reduces transparency; users want to know WHY; balance hide-vs-explain.
STATUS: pending review Daniel cross-ref Q-0215

Q-0215 [Domain 1.6 — Modal AA friction anti-RE rewrite]
DECIZIE: AA Friction Modal rewrite eliminat signal exposure, force-typing, escalation logic. Tests 752/752 PASS.
RAȚIONAL: Modal previously exposed engine signals + escalation + force-typing = anti-RE risk + UX hostile.
IMPACT dacă greșită: SEVERE — exposed engine = competitor copies signals; force-typing = user friction unacceptable.
SURSA: HANDOVER §1.95 AA Friction modal line 46-48; commits bdb0be6, b24aaae.
PUSH-BACK: Eliminated escalation = HIGH tier intervention reduces; trade-off: anti-RE vs intervention strength.
STATUS: pending review Daniel cross-ref Q-0214

Q-0216 [Domain 1.6 — Stagnation rule numeric prioritate]
DECIZIE: STAGNATION_WEEK_8 priority 80, _6 priority 70, _4 priority 60 (numeric per ADR 004).
RAȚIONAL: Longer stagnation = higher priority intervention; numeric scale arbitrable.
IMPACT dacă greșită: MODERATE — priorities inverted = short stagnation overrides long; no prioritization.
SURSA: ADR 004 numeric; ADR 011 §Stable Rule IDs line 102.
PUSH-BACK: 80/70/60 wide spacing; could be 80/85/90 monotonically; 10-point gaps room for future rules.
STATUS: pending review Daniel cross-ref Q-0079

Q-0217 [Domain 1.6 — PATTERN_EARLY_END rule]
DECIZIE: PATTERN_EARLY_END rule fires when consecutive early stops detected; triggers session shortening enhancement.
RAȚIONAL: Adaptive plan to user's actual capacity; reduce future early stops.
IMPACT dacă greșită: SEVERE — pattern false positive = chronic short sessions; missed = continued early stops.
SURSA: ADR 011 §Stable Rule IDs line 102-103.
PUSH-BACK: Shortened session may underdose growth stimulus; better address root cause (volume too high).
STATUS: pending review Daniel cross-ref Q-0204

Q-0218 [Domain 1.6 — VOLUME_COMPENSATION rule]
DECIZIE: VOLUME_COMPENSATION rule for compensating muscle group missed previous session; weak group priority.
RAȚIONAL: Body-following: detect missed group, compensate next session.
IMPACT dacă greșită: SEVERE — compensation excessive = double-volume injury risk; under-compensation = chronic neglect.
SURSA: ADR 011 §Stable Rule IDs line 102.
PUSH-BACK: "Compensation" semantic — full volume catchup vs partial? rules + weights need clarity.
STATUS: pending review Daniel cross-ref Q-0143

Q-0219 [Domain 1.6 — WEAK_GROUP_PRIORITY rule]
DECIZIE: WEAK_GROUP_PRIORITY rule increases volume/frequency for ctx.weakGroups detected.
RAȚIONAL: Hypertrophy specialization; weak point bias.
IMPACT dacă greșită: SEVERE — over-specialization = imbalance worsens; under-specialization = no improvement.
SURSA: ADR 011 §Stable Rule IDs line 102.
PUSH-BACK: "Weak group" detection = compared to what baseline? Comparing to user's average vs population norm = different signals.
STATUS: pending review Daniel cross-ref Q-0143

Q-0220 [Domain 1.6 — REST_DAY rule readiness < threshold]
DECIZIE: REST_DAY rule fires when readiness < threshold; gate-stage short-circuit; default safe action.
RAȚIONAL: Body protection; safety override; conservative when uncertain.
IMPACT dacă greșită: SEVERE — over-rest = lost progress; under-rest = injury risk.
SURSA: ADR 011 §Stable Rule IDs line 102; ADR 018 stages.
PUSH-BACK: Single readiness threshold = oversimplification; combined cu fatigue, sleep, stress more robust.
STATUS: pending review Daniel cross-ref Q-0072

Q-0221 [Domain 1.6 — DELOAD rule]
DECIZIE: DELOAD rule fires after consecutive heavy weeks; reduce volume + intensity for recovery.
RAȚIONAL: Periodization principle; planned recovery.
IMPACT dacă greșită: SEVERE — wrong timing = mid-progress drop; too rare = burnout.
SURSA: ADR 011 §Stable Rule IDs line 102.
PUSH-BACK: Deload triggers cu fixed cycle (every 4 weeks) vs adaptive (fatigue-driven) = different philosophies; current = mixed.
STATUS: pending review Daniel cross-ref Q-0207

Q-0222 [Domain 1.6 — CUT_CONSERVATIVE rule]
DECIZIE: CUT_CONSERVATIVE rule when isInCut=true; reduce volume slight, maintain intensity.
RAȚIONAL: Cut phase = capacity reduced; preserve intensity to maintain strength under deficit.
IMPACT dacă greșită: SEVERE — full volume on cut = catabolism + injury; no adjustment = ignore deficit reality.
SURSA: ADR 011 §Stable Rule IDs line 102.
PUSH-BACK: "Conservative" magnitude — 0.9× volume vs 0.7× = different; needs spec calibration parameter.
STATUS: pending review Daniel cross-ref Q-0143

Q-0223 [Domain 1.6 — Pattern learning weighted aggregation real vs synthetic]
DECIZIE: Aggregation weighted: real entries 1.0×, synthetic 0.5×.
RAȚIONAL: Synthetic = reconstructed inferior signal; weight reflects confidence.
IMPACT dacă greșită: SEVERE — equal weight = synthetic dominates early days = misleading; zero weight = synthetic useless.
SURSA: ADR 011 §Backfill line 261-263.
PUSH-BACK: 0.5 fixed; should be tunable per pattern type; some patterns unaffected by synthetic (date pattern), others heavily (matchScore aggregate).
STATUS: pending review Daniel cross-ref Q-0120

Q-0224 [Domain 1.6 — Pattern alarm fatigue prevention]
DECIZIE: Dismissed pattern banner 3× consecutive → escalează formularea sau silent track.
RAȚIONAL: Anti alarm fatigue; banner becomes wallpaper otherwise.
IMPACT dacă greșită: SEVERE — alarm fatigue = intervention rate → 0; too aggressive escalation = user hostile.
SURSA: ADR 013 §Dismiss memory line 151-157.
PUSH-BACK: "Escalate formularea" vague; what does escalation mean — louder warning? mandatory ack? unclear.
STATUS: pending review Daniel cross-ref Q-0215

Q-0225 [Domain 1.6 — Soft warning frequency cap 1 unic/săpt]
DECIZIE: Max 1 warning unic per săptămână. Same warning repetat în aceeași săpt = blocked. Diferite warnings = OK chiar aceeași zi.
RAȚIONAL: Cap pe warning unic anti alarm fatigue real; multiple distinct warnings legitime simultane permise.
IMPACT dacă greșită: SEVERE — uniform cap (1 total/săpt) = miss legitimate multi-pattern; no cap = wallpaper.
SURSA: ADR 013 §Soft warning frequency cap line 322-325.
PUSH-BACK: "Same warning" definition — same exact code? same category? if user has 3 patterns all "fatigue-related" cu different codes = 3 warnings = noisy.
STATUS: pending review Daniel cross-ref Q-0224

Q-0226 [Domain 1.6 — Pattern learning rolling windows per detector]
DECIZIE: Each detector own window: Volume creep 3+ consecutive ≤21 zile; Calorie 7-day; Frustration 14-day; Recovery 3+ săpt ISO; Composite fatigue 1 săpt ISO.
RAȚIONAL: Per-signal window optimal; uniform window = trade-off across signals.
IMPACT dacă greșită: MODERATE — per-signal complexity; uniform simpler but less optimal.
SURSA: ADR 013 §Detection signals tracked windows line 64-72.
PUSH-BACK: Mixed windows (event-based vs rolling vs ISO weekly) = mental model fragmentat; debugging hard.
STATUS: pending review Daniel cross-ref Q-0210

Q-0227 [Domain 1.6 — Streak break logic recovery debt]
DECIZIE: Recovery debt streak resetează la prima săpt complete cu ≥2 rest days. Anti-noise + anti-paranoia.
RAȚIONAL: Recovery legitimă recunoscută; streak NOT permanent debt.
IMPACT dacă greșită: SEVERE — never-reset streak = forever debt accumulating; instant-reset = no streak signal.
SURSA: ADR 013 §Streak break logic line 73-75.
PUSH-BACK: "≥2 rest days" arbitrary; user with 1 rest + 1 light day = de facto recovery but streak continues.
STATUS: pending review Daniel cross-ref Q-0118

Q-0228 [Domain 1.6 — Hyperfocus calibration amplifier]
DECIZIE: Hyperfocus pattern (8h+/zi 4+ zile/săpt) NU detection signal în sine. Factor de calibrare thresholds — mai stricte pe celelalte 5 signals.
RAȚIONAL: Hyperfocus correlated cu auto-aggression; modulator NU trigger; profile-specific thresholds.
IMPACT dacă greșită: SEVERE — without modulation = miss hyperfocus auto-aggression; over-modulation = false positives.
SURSA: ADR 013 §Hyperfocus override line 56-58.
PUSH-BACK: 8h+/zi 4+ zile/săpt thresholds ad-hoc; "in app" includes idle time vs active; tracking unclear.
STATUS: pending review Daniel cross-ref Q-0210

Q-0229 [Domain 1.6 — Pattern reconciliation ambiguous detection]
DECIZIE: Pattern detection produces tier ('LOW'/'MED'/'HIGH'/'none') + signals[]; downstream cluster decides intervention.
RAȚIONAL: Detection pure function; intervention decision = cluster orchestration.
IMPACT dacă greșită: SEVERE — detection mixing intervention = engine logic muddled; pure separation = clean.
SURSA: ADR 013 §Severity tiers line 113-119; ADR 018 §3 cluster.
PUSH-BACK: Pure detection = re-deciding intervention every session = waste compute; cache decision possible.
STATUS: pending review Daniel cross-ref Q-0073

Q-0230 [Domain 1.6 — Pattern learning suppression on insufficient data]
DECIZIE: Pattern claims suppressed on < 3 real CDL entries. Banner empty until threshold.
RAȚIONAL: Avoid false claims; integrity protection.
IMPACT dacă greșită: SEVERE — false claims early on = trust eroded permanent.
SURSA: ADR 011 §Banner suppression line 287-292.
PUSH-BACK: Threshold by count; should be by signal-to-noise ratio confidence; statistical rigor missing.
STATUS: pending review Daniel cross-ref Q-0177

Q-0231 [Domain 1.6 — Profile typing influences detection thresholds]
DECIZIE: Profile types (Sprinter/Marathon/Yo-yo/Strategic) calibrate AA thresholds per-profile. Sprinter = stricter on volume creep; Marathon = relaxed.
RAȚIONAL: Per-profile calibration matches behavioral signature; one-size threshold mis-fits diverse users.
IMPACT dacă greșită: SEVERE — uniform thresholds = false positives Sprinters / false negatives Marathon.
SURSA: ADR 013 §Profile typing line 86-110.
PUSH-BACK: 4 profiles cover 90% of users; outliers (true edge case) get wrong thresholds; need 5+ profiles or continuous spectrum.
STATUS: pending review Daniel cross-ref Q-0232

Q-0232 [Domain 1.6 — Profile self-report + behavioral inference hybrid]
DECIZIE: Onboarding hybrid — self-report inițial 3-4 întrebări + 1 post-prima sesiune + behavioral inference 4-6 săpt + reconciliation prompt at 4-6 săpt.
RAȚIONAL: Self-report alone broken (toți zic "Strategic"); pure behavioral cold start; hybrid = robust.
IMPACT dacă greșită: SEVERE — pure self-report = misclassification = wrong interventions; pure behavioral = late classification.
SURSA: ADR 013 §Profile typing onboarding hybrid line 96-99.
PUSH-BACK: Reconciliation prompt friction; "behavioral inference 4-6 săpt" = user 1.5 luni in cu wrong profile = bad interventions.
STATUS: pending review Daniel cross-ref Q-0231

Q-0233 [Domain 1.6 — Reconciliation prompt 1-click]
DECIZIE: Reconciliation prompt: rationale + data points + 1-click accept/decline + drill-down opțional. Wording: "Pattern observat te apropie de Sprinter: [data points]. Update profil? [Da] [Nu] [Detalii]"
RAȚIONAL: Recommendation cu evidență, NU verdict; decizie rapidă + drill-down opțional.
IMPACT dacă greșită: SEVERE — too much friction = dismissed; too automatic = user feels labeled.
SURSA: ADR 013 §Wording reconciliation prompt line 104-110.
PUSH-BACK: Reconciliation timing 4-6 săpt = user already invested = reluctant to "change identity"; engagement risk.
STATUS: pending review Daniel cross-ref Q-0232

Q-0234 [Domain 1.6 — AA detection LOW tier log silent]
DECIZIE: LOW tier (1 signal isolated) = log în CDL, NO notify user.
RAȚIONAL: Single signal = noise; below threshold for action.
IMPACT dacă greșită: MODERATE — silent log = future analytic; user oblivious to potential issue.
SURSA: ADR 013 §Severity tiers line 115.
PUSH-BACK: Silent log accumulates; user surprised when MED tier triggers; "How long has this been going?" question.
STATUS: pending review Daniel

Q-0235 [Domain 1.6 — AA detection MED tier soft warning banner]
DECIZIE: MED tier (2-3 signals în 2 săpt) = soft warning banner cu metrica observabilă, dismissible.
RAȚIONAL: Recognizable signal cluster; soft warning preserves agency.
IMPACT dacă greșită: SEVERE — too lenient = miss intervention window; too aggressive = warning fatigue.
SURSA: ADR 013 §Severity tiers line 116.
PUSH-BACK: "Dismissible" = user override = warning theatrical; should escalate after dismisses.
STATUS: pending review Daniel cross-ref Q-0224

Q-0236 [Domain 1.6 — AA detection HIGH tier hard intervention]
DECIZIE: HIGH tier (3+ signals în 1 săpt + escalation 2+ săpt MED fără ameliorare) = Intervention C: refuză plan agresiv inițial. Override flow cu friction.
RAȚIONAL: Severe pattern needs strong intervention; user can override BUT cu friction; not block.
IMPACT dacă greșită: CATASTROFIC — paternalism = user revolt; under-intervention = real harm.
SURSA: ADR 013 §Severity tiers line 117-119; §Intervention model C line 142-148.
PUSH-BACK: HIGH tier behavioral-only until health export = signal incomplete; physical health markers (RHR, HRV, sleep) gap.
STATUS: pending review Daniel cross-ref Q-0237

Q-0237 [Domain 1.6 — HIGH tier deferred until health export]
DECIZIE: HIGH tier folosește only signals comportamentale until health export (FAZA 4 — bloodwork manual input, Apple Health/Google Fit). Signal "RHR +15bpm" + alți markeri fizici deferred.
RAȚIONAL: Physical signals not yet integrated; behavioral suficient for v1.
IMPACT dacă greșită: SEVERE — behavioral alone misses physiological auto-aggression; can't detect metabolic deficit silent.
SURSA: ADR 013 §Severity tiers line 120; §Trade-offs line 215.
PUSH-BACK: Deferring physical = "AA detection" claim feeling weak; should hold release until phasing physical signals.
STATUS: pending review Daniel cross-ref Q-0236

Q-0238 [Domain 1.6 — Soft warning wording template]
DECIZIE: Wording: observation → pattern → return decision to user. Exemplu "În ultimele 2 săpt: [data points]. Continui același plan sau ajustăm?"
RAȚIONAL: Anti judgmental wording; user agency final.
IMPACT dacă greșită: SEVERE — judgmental wording = user defensive = ignored; vague = confusing.
SURSA: ADR 013 §Soft warning wording line 124-138.
PUSH-BACK: "Decizia ta?" = burden user; some users want AI to recommend not delegate.
STATUS: pending review Daniel cross-ref Q-0235

Q-0239 [Domain 1.6 — AA wording forbidden phrases]
DECIZIE: NU "te auto-sabotezi" (judgmental), NU "ai grijă" (vag), NU "ești sigur că vrei?" (passive-aggressive). DA "metric X arată Y. Pattern observat: Z. Decizia ta?"
RAȚIONAL: Wording rules clear forbid traps; data-driven non-judgmental.
IMPACT dacă greșită: SEVERE — forbidden phrases creep in = trust erosion.
SURSA: ADR 013 §Soft warning rules line 130-134.
PUSH-BACK: Wording library curation effort; localized RO+EN versions = double work; maintenance burden.
STATUS: pending review Daniel cross-ref Q-0238

Q-0240 [Domain 1.6 — Override flow wording natural NU legal-defensiv]
DECIZIE: Wording final NU pinned ADR. Spec EXEC_QUEUE va folosi wording natural, NU legal-defensiv. Direcție: "continui în ciuda recomandării" sau "decid să push prin pattern".
RAȚIONAL: Legal-defensiv hostile UX; natural wording user-friendly without losing protection.
IMPACT dacă greșită: SEVERE — legal-defensiv = users feel insulted; over-natural = no protection.
SURSA: ADR 013 §Resolved Open Questions #3 line 313-318.
PUSH-BACK: "Natural" subjective; legal team approval needed; balance.
STATUS: pending review Daniel cross-ref Q-0236

Q-0241 [Domain 1.6 — Profile change history tracked CDL extension]
DECIZIE: Profile change history păstrat (CDL extension sau ProfileLog). Storage decision spec NOT ADR.
RAȚIONAL: Util pentru debugging, reconciliation context, audit trail.
IMPACT dacă greșită: MODERATE — without history = debugging blind; storage cost minor.
SURSA: ADR 013 §Resolved Open Questions #5 line 327-330.
PUSH-BACK: Privacy concern minimal — local-first; if Firebase sync, change history accessible cloud = profile inference = sensitive.
STATUS: pending review Daniel cross-ref Q-0233

Q-0242 [Domain 1.6 — Pattern detection deferred ML]
DECIZIE: Alternative C ML detection rejected v1. Reconsiderare la 1000+ users + 6+ months agregate behavioral data.
RAȚIONAL: Cold start problem; black-box hard explain; rule-based interpretable v1.
IMPACT dacă greșită: SEVERE — ML deferred = miss adaptive detection; rule-based stagnates accuracy.
SURSA: ADR 013 §Alternatives C ML line 178-182; Trigger #6 line 250.
PUSH-BACK: 1000+ users high bar; ML simpler classifier viable at 100 users; deferring too far.
STATUS: pending review Daniel cross-ref Q-0231

Q-0243 [Domain 1.6 — Calorie threshold 300 kcal/săpt starting guess]
DECIZIE: Calorie restriction acceleration >300 kcal/săpt rolling 7-day window threshold.
RAȚIONAL: Starting threshold absent empirical data; reconsider after 50+ users.
IMPACT dacă greșită: MODERATE — threshold off = false positives/negatives; tunable post-data.
SURSA: ADR 013 §Detection signals line 51; §Empirical Calibration line 226.
PUSH-BACK: 300 kcal/săpt = ~43 kcal/zi reduction; trivial in real practice; threshold likely too low.
STATUS: pending review Daniel cross-ref Q-0244

Q-0244 [Domain 1.6 — Volume creep 3+ sesiuni consecutive starting]
DECIZIE: Volume creep 3+ sesiuni consecutive AND ≤21 zile. Starting threshold heuristic.
RAȚIONAL: Event-based + temporal cap; avoid false positive on user sporadic.
IMPACT dacă greșită: MODERATE — too strict = miss every-other-week pattern; too loose = noise.
SURSA: ADR 013 §Detection signals line 50; §Empirical line 228.
PUSH-BACK: Specific phenotype users (powerlifters cycle) cu 21+ days between sessions = miss creep; window dependent on training frequency.
STATUS: pending review Daniel cross-ref Q-0208

Q-0245 [Domain 1.6 — Recovery debt <2 rest days/săpt 3+ săpt]
DECIZIE: Recovery debt <2 rest days/săpt for 3+ săpt consecutive + cel puțin 1 alt signal.
RAȚIONAL: Recovery debt singular = noise pentru profile aggressive; combinat cu alt signal robust.
IMPACT dacă greșită: SEVERE — singular signal = false positive Sprinter; combined = balance.
SURSA: ADR 013 §Detection signals line 54; §Empirical line 230.
PUSH-BACK: <2 rest days = aggressive baseline; some researchers suggest 1 day off acceptable; threshold subjective.
STATUS: pending review Daniel cross-ref Q-0227

Q-0246 [Domain 1.6 — Frustration markers rating ≤2/5]
DECIZIE: Frustration markers rating ≤2/5 (proxy temporar AA fix) + add volume same/next session.
RAȚIONAL: Rating proxy until RPE per-set; combined with volume add = self-sabotage signal.
IMPACT dacă greșită: SEVERE — rating signal noise pe scale 5-point; conflated with mood.
SURSA: ADR 013 §Detection signals line 52; §Empirical line 230.
PUSH-BACK: Rating ≤2/5 user with high standards = false positive; relativized rating per-user baseline more accurate.
STATUS: pending review Daniel cross-ref Q-0156

Q-0247 [Domain 1.6 — Ignore recovery composite fatigue + zero early-stops]
DECIZIE: Ignore recovery signal: composite fatigue ≥2 markers din 3 într-o săpt + zero early-stops + continue volume.
RAȚIONAL: Continue training despite fatigue = ignoring body; combined with no early-stop = systematic ignore.
IMPACT dacă greșită: SEVERE — under-detect = harm; over-detect = false flag legitimate push.
SURSA: ADR 013 §Detection signals line 53.
PUSH-BACK: Zero early-stops requirement edge case — 1 isolated early-stop excludes detection.
STATUS: pending review Daniel cross-ref Q-0210

Q-0248 [Domain 1.6 — AA tier reconsideration after 6 months]
DECIZIE: Severity tier thresholds (LOW/MED/HIGH) reconsider after 6 months production data; cazuri reale false positive/negative analyzed.
RAȚIONAL: Empirical recalibration; v1 starting guesses.
IMPACT dacă greșită: SEVERE — thresholds frozen wrong = systematic mis-detection.
SURSA: ADR 013 Trigger #3 line 247-248.
PUSH-BACK: 6 months long; users harmed in interim if too lax; should monitor monthly with alerting.
STATUS: pending review Daniel cross-ref Q-0231

Q-0249 [Domain 1.6 — Pattern learning hyperfocus calibration]
DECIZIE: Hyperfocus thresholds tracked în Empirical Calibration Parameters. NOT prerequisite ADR. Reconsideration Trigger #7 inversare amplificator.
RAȚIONAL: V1 heuristic; reconsider if data shows hyperfocus correlates negativ cu auto-aggression (sustainability).
IMPACT dacă greșită: SEVERE — wrong-direction amplifier = false detections systematically.
SURSA: ADR 013 §Resolved Open Questions #2 line 309-311; Trigger #7 line 251.
PUSH-BACK: 8h/zi tracked = how? screen-time API requires permission; estimate via session counts inaccurate.
STATUS: pending review Daniel cross-ref Q-0228

Q-0250 [Domain 1.6 — Pattern learning composite fatigue effectiveness Trigger]
DECIZIE: Trigger #8 composite fatigue effectiveness — if 2+ markers din 3 produces too many false positives sau too many miss-uri, raise/lower threshold or change individual signal definitions.
RAȚIONAL: Empirical, reactive trigger; v1 starting guess.
IMPACT dacă greșită: SEVERE — frozen wrong threshold = systematic mis-detection.
SURSA: ADR 013 Trigger #8 line 252-253.
PUSH-BACK: "Too many" subjective; needs metric (precision/recall, F1) tracked for reactive trigger.
STATUS: pending review Daniel cross-ref Q-0210

Q-0251 [Domain 1.6 — Engagement drop signal v1.5/v2 candidate]
DECIZIE: Engagement drop signal: 0 rated sets pe ≥3 sesiuni consecutive = engagement disengagement signal. v1.5/v2 candidate, NU v1.
RAȚIONAL: Different from AA (auto-aggression) — opposite signal; needs separate UX flow.
IMPACT dacă greșită: MODERATE — backlog; deferred without harm.
SURSA: INSIGHTS_BACKLOG §Engagement drop signal line 178-187.
PUSH-BACK: Disengagement vs auto-aggression both important pre-launch; deferring miss critical signal.
STATUS: pending review Daniel cross-ref Q-0204

Q-0252 [Domain 1.6 — Sprinter intervention style frustration → push harder]
DECIZIE: Sprinter profile intervention: frustration → push harder. High intensity short bursts + low consistency = profile signature.
RAȚIONAL: Match user behavioral baseline; intervention works WITH personality NOT against.
IMPACT dacă greșită: SEVERE — wrong intervention style = ignored or counterproductive.
SURSA: ADR 013 §Profile typing line 88-91.
PUSH-BACK: "Push harder" risk = double-down on auto-aggression for Sprinter; need careful balance.
STATUS: pending review Daniel cross-ref Q-0231

Q-0253 [Domain 1.6 — Marathon intervention style frustration → maintain]
DECIZIE: Marathon profile: steady consistency + low variance; frustration → maintain (not change anything).
RAȚIONAL: Match steadiness; small adjustments preserve flow.
IMPACT dacă greșită: SEVERE — Marathon receiving "push harder" advice = disrupt rhythm.
SURSA: ADR 013 §Profile typing line 89-90.
PUSH-BACK: Maintenance face of frustration may be denial; should validate when frustration is signal of real issue.
STATUS: pending review Daniel cross-ref Q-0252

Q-0254 [Domain 1.6 — Yo-yo intervention style frustration → drop]
DECIZIE: Yo-yo profile: alternance high commitment / total drop; frustration → drop (planned recovery).
RAȚIONAL: Match cycle; planned drop avoid burnout total drop.
IMPACT dacă greșită: SEVERE — Yo-yo expects drop; refusing = trigger total drop unplanned.
SURSA: ADR 013 §Profile typing line 90-91.
PUSH-BACK: Suggesting "drop" reinforces yo-yo cycle; should suggest gradual reduction NU encourage drop.
STATUS: pending review Daniel cross-ref Q-0253

Q-0255 [Domain 1.6 — Strategic intervention measured response]
DECIZIE: Strategic profile: measured response to data; adjusts based on trends; low impulsivity. Intervention = data-driven NU emotional.
RAȚIONAL: Match user analytical style; provide data NU empathy.
IMPACT dacă greșită: SEVERE — emotional intervention to Strategic = condescending; user dismissed.
SURSA: ADR 013 §Profile typing line 91-92.
PUSH-BACK: "Strategic" risk = self-perception bias; everyone thinks they're strategic; calibrate behavioral inference.
STATUS: pending review Daniel cross-ref Q-0252

Q-0256 [Domain 1.6 — Pattern learning behavioral inference 4-6 săpt]
DECIZIE: Behavioral inference primele 4-6 săpt observate; profile actualizat tăcut bazat pe pattern real.
RAȚIONAL: Sufficient data for behavioral signature; silent update preserves user dignity.
IMPACT dacă greșită: SEVERE — too short window = noise classification; too long = wrong profile interventions for 1+ luni.
SURSA: ADR 013 §Profile typing onboarding hybrid line 98.
PUSH-BACK: Silent update = user surprised at reconciliation prompt 4-6 săpt later; should informer in advance.
STATUS: pending review Daniel cross-ref Q-0233

Q-0257 [Domain 1.6 — Pattern learning override session detect]
DECIZIE: User override + ignore PROJECTION → escalation_tracker count incremented → boost massive next session.
RAȚIONAL: Repeated ignore = signal stronger; boost weight escalates.
IMPACT dacă greșită: SEVERE — escalation infinite = paralysis at extreme; no escalation = warning theater.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 6 line 281-285.
PUSH-BACK: "Massive boost" undefined; what magnitude? +50% weight? +200%? spec ambiguity.
STATUS: pending review Daniel cross-ref Q-0032

Q-0258 [Domain 1.6 — Pattern learning rest day signal #5 cu rest_marked]
DECIZIE: Recovery debt signal #5 leverages CDL outcome.rest_marked tri-state. Distinguishes "no prompt" from "explicit decline" from "rest legit".
RAȚIONAL: Granular semantic; AA Detection accurate; tri-state from ADR 011 schema extension.
IMPACT dacă greșită: SEVERE — boolean rest_marked = collapse rest semantic = AA Detection wrong.
SURSA: ADR 013 §Recovery debt signal; ADR 011 §Rest day semantic line 180-188.
PUSH-BACK: Tri-state UX complex; users prompted multiple times = friction; balance signal vs friction.
STATUS: pending review Daniel cross-ref Q-0117

Q-0259 [Domain 1.6 — Pattern learning false negatives Sprinter]
DECIZIE: False positives la profile aggressive legitime (Sprinter cu push planificat) acceptat trade-off. Soft warning dismissible + dismiss memory limit damage.
RAȚIONAL: Better than missing real auto-aggression on non-Sprinter.
IMPACT dacă greșită: MODERATE — Sprinter false positive = banner annoyance; missing real auto-aggression = harm.
SURSA: ADR 013 §Trade-offs line 202-204.
PUSH-BACK: Sprinter chronic false positives = banner becomes wallpaper = real signal missed.
STATUS: pending review Daniel cross-ref Q-0224

Q-0260 [Domain 1.6 — Pattern learning early-stop pattern PATTERN_EARLY_END]
DECIZIE: Pattern PATTERN_EARLY_END tracked rule; CDL outcome.earlyStop = true repeated triggers session shortening.
RAȚIONAL: Adaptive plan match user capacity; shorten future sessions to expected duration.
IMPACT dacă greșită: SEVERE — chronic shortening = plan undertrained; no shortening = early stops persist.
SURSA: ADR 011 §Stable Rule IDs line 102; ADR 018 ENHANCEMENT stage shorten_session.
PUSH-BACK: Shortening matches symptom not cause; user stops early due fatigue, not session too long necessarily.
STATUS: pending review Daniel cross-ref Q-0204

#### 1.7 Reality Engine validation

Q-0261 [Domain 1.7 — Reality Engine post-session validation]
DECIZIE: Reality Engine validates session post-creation: round equipment availability + hold weights low readiness + sanity checks.
RAȚIONAL: Catch session generation bugs (impossible weights, missing equipment); user-side safety net.
IMPACT dacă greșită: SEVERE — invalid session served = user confused or hurt; catches engine bugs late.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 implicit + src/engine/reality.js.
PUSH-BACK: Reality Engine duplicates validation that should happen earlier in pipeline; defense-in-depth pattern but at cost.
STATUS: pending review Daniel cross-ref Q-0262

Q-0262 [Domain 1.7 — Reality validation 3 layers post-session]
DECIZIE: Post-session END Reality validation layers: <2min+0sets auto-delete silent; <5min sau <30% volum modal "Test sau real?" default delete; 5-15min+30-70% "Sesiune scurtă, păstrăm?" default Yes; >15min+>70% log normal.
RAȚIONAL: Differentiate test sessions, abandoned, short-but-real, full sessions; appropriate UX per case.
IMPACT dacă greșită: SEVERE — auto-delete real session = data loss; no delete junk session = pollute CDL.
SURSA: HANDOVER §1 Reality validation line 65-70.
PUSH-BACK: 4 thresholds (2/5/15min × 30/70% volum) = decision matrix complex; user confusion possible.
STATUS: pending review Daniel cross-ref Q-0261

Q-0263 [Domain 1.7 — Reality round equipment availability check]
DECIZIE: Reality Engine filters exercises pe equipment_unavailable per gym activ. Click "Lipsă aparat" mid-session → append + persist per-gym.
RAȚIONAL: Ne-existing equipment in session = unfeasible plan; learn user's gym layout incrementally.
IMPACT dacă greșită: SEVERE — impossible exercises in session = user blocked or improvises poorly.
SURSA: HANDOVER §7 Multi-Gym Q2 line 113-114.
PUSH-BACK: User says "Lipsă" once → blocked forever; what if equipment fixed week later? need expiry or recheck mechanism.
STATUS: pending review Daniel cross-ref Q-0264

Q-0264 [Domain 1.7 — Reality hold weights low readiness]
DECIZIE: Reality Engine holds weights low when readiness sub threshold. Don't push max effort on low-readiness day.
RAȚIONAL: Safety net; prevents pushing user past capacity on bad day.
IMPACT dacă greșită: SEVERE — push max on readiness 30/100 = injury risk; over-conservative = no progress.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R6 safety override + reality.js implementation.
PUSH-BACK: "Hold weight" magnitude? -10%? -20%? -50%? spec absent; implementation arbitrary.
STATUS: pending review Daniel cross-ref Q-0220

Q-0265 [Domain 1.7 — Reality auto-delete <2min+0sets silent]
DECIZIE: <2min + 0sets = auto-delete silent. No prompt user.
RAȚIONAL: Test session / accidental tap = no signal value; silent delete avoids friction.
IMPACT dacă greșită: SEVERE — legit short check-in deleted = user unable record minimal session.
SURSA: HANDOVER §1 line 67.
PUSH-BACK: 2min threshold edge case — user with very fast session (1 set explosive) at <2min legitimately falls in delete zone.
STATUS: pending review Daniel cross-ref Q-0262

Q-0266 [Domain 1.7 — Reality test-or-real prompt default delete]
DECIZIE: <5min sau <30% volum → modal "Test sau real?" default delete.
RAȚIONAL: Likely test/abandoned; user explicit confirm if real.
IMPACT dacă greșită: SEVERE — default delete = user forgets confirm = real session lost.
SURSA: HANDOVER §1 line 68.
PUSH-BACK: Default delete biased toward data loss; default keep + opt-in delete safer.
STATUS: pending review Daniel cross-ref Q-0265

Q-0267 [Domain 1.7 — Reality short session keep prompt]
DECIZIE: 5-15min + 30-70% volum → "Sesiune scurtă, păstrăm?" default Yes.
RAȚIONAL: Likely real but cut short; default keep = preserve data.
IMPACT dacă greșită: SEVERE — default Yes saves likely-junk; default No loses real short sessions.
SURSA: HANDOVER §1 line 69.
PUSH-BACK: Asymmetric default (delete vs keep) per threshold = inconsistent UX; clear pattern needed.
STATUS: pending review Daniel cross-ref Q-0266

Q-0268 [Domain 1.7 — Reality normal session log]
DECIZIE: >15min + >70% volum → log normal. No prompt.
RAȚIONAL: Likely real complete session; trust user log.
IMPACT dacă greșită: MINOR — false log of "real" session = pollution; threshold catches.
SURSA: HANDOVER §1 line 70.
PUSH-BACK: 15min threshold fast-twitch session legitimate (HIIT, EMOM) cu 12min full effort = wrongly thrown to "short" prompt.
STATUS: pending review Daniel cross-ref Q-0267

Q-0269 [Domain 1.7 — Reality data inconsistency Fail-safe]
DECIZIE: Data inconsistency (HISTORICAL says A, raw log says NOT A) = Fail-safe Rule Engine. Generic template livrat user, alert critic backend.
RAȚIONAL: Inconsistency = bug; safe template path; alert backend for fix.
IMPACT dacă greșită: SEVERE — fail-safe trigger silent permits bug persist; alert critical ensures detection.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §R18 line 129.
PUSH-BACK: "Generic template" definition — per phase? per experience? Spec ambiguity.
STATUS: pending review Daniel cross-ref Q-0018

Q-0270 [Domain 1.7 — Reality Engine pure validator NU mutator]
DECIZIE: Reality Engine validates session, returns issues; cluster ENHANCEMENT stage applies fixes.
RAȚIONAL: Separation of concerns — validation pure; mutation in ACTION engine only.
IMPACT dacă greșită: SEVERE — Reality directly mutating session = side effects = pure function violations.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 9 §Q8 ACTION mutator only line 351-354.
PUSH-BACK: Validation + auto-fix common pattern; separating adds latency for simple cases.
STATUS: pending review Daniel cross-ref Q-0004

Q-0271 [Domain 1.7 — Reality ENHANCEMENT stage in cluster]
DECIZIE: Reality validation results enter cluster Stage 3 ENHANCEMENT — modifies session.exercises, attaches UI metadata.
RAȚIONAL: ENHANCEMENT stage owns presentation/correction layer; Reality fits naturally.
IMPACT dacă greșită: MODERATE — wrong stage assignment = corrections too early or late.
SURSA: ADR 018 §3 ENHANCEMENT stage line 195-198.
PUSH-BACK: Reality may need GATE rights (impossible session = block start); ENHANCEMENT-only insufficient.
STATUS: pending review Daniel cross-ref Q-0075

Q-0272 [Domain 1.7 — Reality Engine pre-session validation hook]
DECIZIE: Reality validates pre-session start (impossible weights, missing exercises) AND post-session (test session detection).
RAȚIONAL: Two-phase validation — prevent invalid plan + filter junk data.
IMPACT dacă greșită: SEVERE — only post = invalid sessions served; only pre = garbage logs accepted.
SURSA: implicit src/engine/reality.js + HANDOVER §1.
PUSH-BACK: Two phases = two validation paths to maintain; consolidation possible.
STATUS: pending review Daniel cross-ref Q-0270

Q-0273 [Domain 1.7 — Reality alternative engine click "Aparat ocupat"]
DECIZIE: Click "Aparat ocupat" mid-session → alternative engine substitute exercise. Ephemeral, not persistent across sessions.
RAȚIONAL: Real-world friction (gym crowded); preserve session continuity.
IMPACT dacă greșită: SEVERE — no alternative = user abandons; permanent persist = wrong learning ("never available").
SURSA: HANDOVER §11 user input friction P3 line 148; src/engine/alternativeEngine.js.
PUSH-BACK: Alternative selection algorithm — same muscle group? same equipment? unclear; bug surface.
STATUS: pending review Daniel cross-ref Q-0274

Q-0274 [Domain 1.7 — "Lipsă aparat" persistent per-gym]
DECIZIE: "Lipsă aparat" persistent per-gym (Multi-Gym), differentiated from "Aparat ocupat" ephemeral.
RAȚIONAL: Lipsă = structural gym property; Ocupat = transient.
IMPACT dacă greșită: SEVERE — confusing semantics = wrong persistence = engine confused.
SURSA: HANDOVER §11 P3 line 148; §7 Multi-Gym Q2 line 113-114.
PUSH-BACK: User confusion between "Lipsă" vs "Ocupat" UX; clear distinction labels needed.
STATUS: pending review Daniel cross-ref Q-0273

Q-0275 [Domain 1.7 — Reality Engine log impossible numbers warning]
DECIZIE: Impossible numbers (1000kg bench) = soft warning "1000kg? Dacă ești Eddie Hall, dă-i înainte..." User agency cu safety net.
RAȚIONAL: Cross-ref Safety Asymmetric Principle — data quality issue = soft warning NOT block.
IMPACT dacă greșită: MODERATE — block = paternalism friction; no warning = silent corruption.
SURSA: PRODUCT_STRATEGY §9.1 line 341-343; §5.11 SAFETY ASYMMETRIC line 215-225.
PUSH-BACK: 1000kg = clearly impossible; block reasonable; soft warning may be overcompensation.
STATUS: pending review Daniel cross-ref Q-0017

Q-0276 [Domain 1.7 — Reality outlier kcal protein detection]
DECIZIE: Outlier rejection nutrition Layer 3: >400g protein/day or <30g/day = silent reject + toast. Schimbare >100g/day vs avg = soft warning.
RAȚIONAL: Bayesian nutrition Layer 3 outlier filter; impossible inputs filtered; substantial change flagged.
IMPACT dacă greșită: SEVERE — accept outliers = corrupt nutrition baseline; reject everything = paranoid.
SURSA: HANDOVER §2 Layer 3 line 78.
PUSH-BACK: 400g protein/day = elite athlete possible; rejection misses real signal; thresholds need calibration.
STATUS: pending review Daniel cross-ref Q-0277

Q-0277 [Domain 1.7 — Reality outlier weight detection 2kg/24h]
DECIZIE: Outlier weight >2kg/24h soft warning. Engine reduces confidence.
RAȚIONAL: Daily weight fluctuation typical 1-2kg (water/glycogen); >2kg = likely typo or measurement error.
IMPACT dacă greșită: MODERATE — accept = corrupt LBM/BF; reject all = miss legit shifts (post-binge).
SURSA: HANDOVER §11 Greutate corp line 152; PRODUCT_STRATEGY §9.1.
PUSH-BACK: 2kg/24h occasionally legit (post-flight dehydration, post-meal); soft warning maintains agency.
STATUS: pending review Daniel cross-ref Q-0276

Q-0278 [Domain 1.7 — Reality stale awareness 7/14/30 zile thresholds]
DECIZIE: Greutate corp stale: 7/14/30 zile thresholds. Engine reduce confidence pe weight-driven recommendations după 14+ zile.
RAȚIONAL: Stale data = engine should know; confidence decay reflects reality.
IMPACT dacă greșită: SEVERE — no decay = engine confident on month-old data; aggressive decay = lose continuity.
SURSA: HANDOVER §11 Greutate corp line 152.
PUSH-BACK: Linear decay 14/30 zile arbitrary; should anneal smooth, not step.
STATUS: pending review Daniel cross-ref Q-0011

Q-0279 [Domain 1.7 — Reality Engine session deletion idempotent]
DECIZIE: Reality auto-delete operates on most-recent session entry; idempotent (re-trigger no-op if already deleted).
RAȚIONAL: Safety against double-deletion; concurrent triggers safe.
IMPACT dacă greșită: SEVERE — non-idempotent = wrong session deleted on retrigger; data loss.
SURSA: implicit src/engine/reality.js + ADR 011 idempotency line 199.
PUSH-BACK: Idempotency by session ID; if ID drift, idempotency violated.
STATUS: pending review Daniel cross-ref Q-0105

Q-0280 [Domain 1.7 — Reality validation undo allowed]
DECIZIE: Auto-deleted session recoverable within 30 zile (Tombstone soft delete pattern).
RAȚIONAL: User mistake → recovery; Tombstone & Branching pattern alignment.
IMPACT dacă greșită: SEVERE — no recovery = legitimate auto-delete loss permanent; UX hostile.
SURSA: PRODUCT_STRATEGY §9.9 line 366-367; Cognitive Arch §Q9 T&B.
PUSH-BACK: 30 zile retention = storage cost; clean delete simpler but inflexible.
STATUS: pending review Daniel cross-ref Q-0172

#### 1.8 Auto-Aggression Detection (5 signals + composite fatigue + tier logic)

Q-0281 [Domain 1.8 — AA Detection foundational diferențiator]
DECIZIE: AA Detection = pattern recognition + intervention; user self-sabotage spirale identificate.
RAȚIONAL: 95% fitness apps reward volume blindly; SalaFull AI detects + intervenes = core MOAT differentiator.
IMPACT dacă greșită: CATASTROFIC — AA broken = engine learns on corrupt data (overreaching = "performant"); story "Cognitive AI" undelivered.
SURSA: ADR 013 §Context line 9-37; PROJECT_VISION moat foundation.
PUSH-BACK: Differentiation premium feature in marketing but invisible to user (silent log LOW); sales pitch hard.
STATUS: pending review Daniel cross-ref Q-0282

Q-0282 [Domain 1.8 — AA passive observe rejected v1]
DECIZIE: Alternative A (passive observe only, log no intervention) REJECTED. Communication owed when seeing pattern.
RAȚIONAL: Apps existing log + zero intervention; SalaFull moat = act on observation.
IMPACT dacă greșită: SEVERE — passive = parity competitors; intervention = differentiation.
SURSA: ADR 013 §Alternatives A line 162-167.
PUSH-BACK: Liability — actively intervening on health pattern raises responsibility bar; passive lower legal risk.
STATUS: pending review Daniel cross-ref Q-0281

Q-0283 [Domain 1.8 — AA hard intervention only rejected]
DECIZIE: Alternative B (hard intervention only, refuse aggressive plans, no soft warnings) REJECTED.
RAȚIONAL: Paternalism agresiv; user 1-2 signals isolated → block → resentment, churn.
IMPACT dacă greșită: SEVERE — over-paternal = user revolt; balanced soft+hard = nuanced.
SURSA: ADR 013 §Alternatives B line 169-173.
PUSH-BACK: Hard intervention simpler implement; soft warnings + escalation more complex code.
STATUS: pending review Daniel cross-ref Q-0282

Q-0284 [Domain 1.8 — AA pure self-report rejected]
DECIZIE: Alternative D (chestionar 10+ întrebări, no behavioral inference) REJECTED. Self-perception bias = false categorization.
RAȚIONAL: Toți zic "Strategic"; without behavioral validation, profile useless.
IMPACT dacă greșită: SEVERE — pure self-report = systematic mis-classification; interventions wrong.
SURSA: ADR 013 §Alternatives D line 184-189.
PUSH-BACK: Self-report cheap data; combined with periodic re-assessment may improve.
STATUS: pending review Daniel cross-ref Q-0232

Q-0285 [Domain 1.8 — AA severity continuum rejected]
DECIZIE: Alternative E (severity continuum no discrete tiers) REJECTED.
RAȚIONAL: Hard to operationalize UI + reguli; thresholds hand-wavy; debugging nightmare.
IMPACT dacă greșită: MODERATE — discrete tiers provide clarity; continuum nuanced but unwieldy.
SURSA: ADR 013 §Alternatives E line 191-196.
PUSH-BACK: Continuum more accurate to reality; discretization arbitrary boundaries; maybe hybrid.
STATUS: pending review Daniel cross-ref Q-0231

Q-0286 [Domain 1.8 — AA detection on CDL outcome write]
DECIZIE: AA detection populates outcome.autoAggression on populateOutcome write. Default null until module active.
RAȚIONAL: Detection at outcome time = post-execution data complete; null pre-implementation = explicit unknown.
IMPACT dacă greșită: SEVERE — detection at proposed time = no actual outcome data; null absent = consumers crash.
SURSA: ADR 011 §outcome.autoAggression line 134-138.
PUSH-BACK: Per-session detection ignores cross-session window patterns (volume creep 3+ sesiuni); needs aggregation across recent CDL entries.
STATUS: pending review Daniel cross-ref Q-0116

Q-0287 [Domain 1.8 — AA dimension stage GATE + ADJUSTMENT]
DECIZIE: AA dimension stages: GATE (HIGH tier blocker) + ADJUSTMENT (MED tier volume reduction). Split în 2 entries dacă necesar sau single cu multiple recommendations.
RAȚIONAL: HIGH tier short-circuits pipeline (gate); MED tier modifies volume (adjustment); aligned ADR 018.
IMPACT dacă greșită: SEVERE — GATE only = miss MED tier intervention; ADJUSTMENT only = HIGH not blocking.
SURSA: ADR 018 Faza 1 Strangler line 326-331.
PUSH-BACK: Single dimension multi-stage = stage assignment confusion; split clearer but registry verbose.
STATUS: pending review Daniel cross-ref Q-0079

Q-0288 [Domain 1.8 — AA enabled flag aa_detection_v1 rollout 1.0]
DECIZIE: aa_detection_v1 enabledFlag rollout 1.0 (already live functionally).
RAȚIONAL: Functionally deployed; flag = rollback path future.
IMPACT dacă greșită: MODERATE — flag missing = no rollback path; flag misconfigured = false off.
SURSA: ADR 018 §1 Registry example + Faza 1 line 329; FLAGS spec.
PUSH-BACK: Rollback flag = 1.0 always; provides no real rollout safety; rollback would be code revert anyway.
STATUS: pending review Daniel cross-ref Q-0289

Q-0289 [Domain 1.8 — AA dimension migration fallback path]
DECIZIE: coachDirector skip apel direct applyAAAdjustments când dimension activ. Rollback path: flag false → director cade pe code path vechi.
RAȚIONAL: Strangler pattern; rollback safety; parallel run period.
IMPACT dacă greșită: SEVERE — rollback broken = stuck on broken NEW; parallel paths divergent.
SURSA: ADR 018 Faza 1 line 330-331.
PUSH-BACK: Two paths = 2× testing; "temporary" parallel may persist > planned.
STATUS: pending review Daniel cross-ref Q-0044

Q-0290 [Domain 1.8 — AA detection golden-master parallel run]
DECIZIE: Testing parallel run pe sample sessions, compare output direct call vs cluster output. Zero divergence requirement.
RAȚIONAL: Strangler validation gate; equivalent behavior before legacy removal.
IMPACT dacă greșită: SEVERE — divergence missed = NEW ship cu regression; user-visible bugs.
SURSA: ADR 018 Faza 1 line 331.
PUSH-BACK: "Zero divergence" strict; even rounding differences = false positive divergence; needs tolerance epsilon.
STATUS: pending review Daniel cross-ref Q-0046

Q-0291 [Domain 1.8 — AA detection 5 signals + 1 amplifier]
DECIZIE: 5 detection signals primare + 1 amplifier hyperfocus. Volume creep, calorie restriction, frustration, ignore recovery, recovery debt + hyperfocus.
RAȚIONAL: Behavior pattern coverage; amplifier modulates thresholds.
IMPACT dacă greșită: SEVERE — fewer signals = miss patterns; more = noise.
SURSA: ADR 013 §Detection signals line 46-58.
PUSH-BACK: 5 signals discrete vs continuous severity score; could collapse to single composite.
STATUS: pending review Daniel cross-ref Q-0210

Q-0292 [Domain 1.8 — AA Sentry alert critical]
DECIZIE: Sentry alert critical migration runner failure > 100 entries; AA detection silent in v1 baseline.
RAȚIONAL: Production monitoring; cap on threshold to avoid noise.
IMPACT dacă greșită: SEVERE — Sentry quiet on real errors = silent failure persist.
SURSA: ADR 018 §4 line 251-253.
PUSH-BACK: 100 entries threshold arbitrary; should be relative to total entry count (% threshold).
STATUS: pending review Daniel cross-ref Q-0095

Q-0293 [Domain 1.8 — AA detection signals visible LOW silent]
DECIZIE: LOW tier (1 signal) silent log, NU notify user. Internal counter signals.
RAȚIONAL: 1 signal = noise; below intervention threshold.
IMPACT dacă greșită: MODERATE — silent log accumulates pattern; user surprise on MED escalation.
SURSA: ADR 013 §Severity tiers line 115; §Trade-offs line 207.
PUSH-BACK: Cumulative signals tracked but not shared = user uncertain why MED triggered later; transparency gap.
STATUS: pending review Daniel cross-ref Q-0234

Q-0294 [Domain 1.8 — AA detection 14-day frustration window]
DECIZIE: Frustration markers 14-day rolling. Anti-reactive (<14d noise) și anti-stale (>14d).
RAȚIONAL: Window balance; immediate signal vs long-term pattern.
IMPACT dacă greșită: MODERATE — window short = false positives; long = miss pattern.
SURSA: ADR 013 §Detection signals tracked windows line 67.
PUSH-BACK: 14-day fixed; user with bi-weekly cycle (split) may show pattern only on alternate weeks.
STATUS: pending review Daniel cross-ref Q-0246

Q-0295 [Domain 1.8 — AA detection 3+ săpt ISO consecutive recovery]
DECIZIE: Recovery debt 3+ săpt ISO consecutive (Mon-Sun). Streak BREAKS la prima săpt ≥2 rest days.
RAȚIONAL: Sustained debt criterion; legitimate recovery breaks streak.
IMPACT dacă greșită: SEVERE — break logic too aggressive = no streak; too restrictive = false debt.
SURSA: ADR 013 §Detection signals line 68-72.
PUSH-BACK: ISO week (Mon-Sun) week-by-week; user with rest day Sunday + workout Monday = no rest in either ISO week = false debt.
STATUS: pending review Daniel cross-ref Q-0227

Q-0296 [Domain 1.8 — AA composite fatigue 1 săpt ISO ≥50%]
DECIZIE: Composite fatigue 1 săpt ISO. ≥50% sesiuni cu fatigue marker.
RAȚIONAL: Aggregate signal across sessions in week; majority criteria.
IMPACT dacă greșită: SEVERE — 50% with 2 sessions/săpt = 1 session triggers; should weight by session count.
SURSA: ADR 013 §Window line 70.
PUSH-BACK: 1 session/săpt user (sporadic) = always 100% on 1; over-trigger.
STATUS: pending review Daniel cross-ref Q-0210

Q-0297 [Domain 1.8 — AA detection HIGH tier escalation]
DECIZIE: HIGH tier = 3+ signals în 1 săpt + escalation pattern (consecutive MED tier 2+ săpt fără ameliorare).
RAȚIONAL: HIGH = severe, escalated pattern; consecutive MED = no improvement.
IMPACT dacă greșită: SEVERE — too lax = user reaches HIGH tier slowly; too strict = forever stuck MED.
SURSA: ADR 013 §Severity tiers line 117.
PUSH-BACK: "Consecutive MED" requires temporal tracking; cross-week aggregation complex.
STATUS: pending review Daniel cross-ref Q-0236

Q-0298 [Domain 1.8 — AA Intervention C HIGH tier friction modal]
DECIZIE: HIGH tier override flow cu friction modal: Read warning complet (no scroll-skip), Type "continui pe propria răspundere" sau echivalent, Confirm explicit.
RAȚIONAL: Filter impulsive vs informed decisions; user adult final decision; friction proportional severity.
IMPACT dacă greșită: SEVERE — too easy override = no friction value; too hard = paternal.
SURSA: ADR 013 §Intervention C line 142-148; HANDOVER §1.95 modal anti-RE rewrite eliminat force-typing.
PUSH-BACK: Force-typing eliminat (HANDOVER) = friction reduced; gap Intervention C spec vs implementation.
STATUS: pending review Daniel cross-ref Q-0240

Q-0299 [Domain 1.8 — AA detection profile typing reconciliation 4-6 săpt fixed]
DECIZIE: Profile reconciliation timing fixă 4-6 săpt for v1. Adaptive considered post 1000+ users.
RAȚIONAL: Operationalizable, predictible, debug-friendly; adaptive scope creep v1.
IMPACT dacă greșită: MODERATE — fixed window suboptimal per-user; adaptive better but complex.
SURSA: ADR 013 §Resolved Open Questions #1 line 303-307.
PUSH-BACK: 4-6 săpt range = 50% variance window; should pin specific (4 sau 5 sau 6).
STATUS: pending review Daniel cross-ref Q-0233

Q-0300 [Domain 1.8 — AA detection wording final spec time]
DECIZIE: Wording final NOT pinned ADR. Spec EXEC_QUEUE va folosi wording natural NOT legal-defensiv.
RAȚIONAL: UX-critical implementation detail; iterative.
IMPACT dacă greșită: SEVERE — bad wording = user trust erosion; legal-defensiv = hostile.
SURSA: ADR 013 §Resolved Open Questions #3 line 313-318.
PUSH-BACK: Deferring to spec time = wording revision after testing; standard practice but adds risk.
STATUS: pending review Daniel cross-ref Q-0240

Q-0301 [Domain 1.8 — AA spec implementation order]
DECIZIE: Order: AA fix design (RPE per-set vs sintetic vs eliminate); 30.9 cleanup; AA detection layer pure functions; Profile typing onboarding UI; Severity + intervention UI; Dismiss memory.
RAȚIONAL: Dependencies sequential; pure functions first independent UI.
IMPACT dacă greșită: SEVERE — out-of-order = blocked work or rework.
SURSA: ADR 013 §Implementation Notes line 275-282.
PUSH-BACK: 6 sub-steps over multiple sprints = scope creep risk; could parallelize some.
STATUS: pending review Daniel cross-ref Q-0287

Q-0302 [Domain 1.8 — AA scope EXCLUDE Sleep/Stress/Hidratare daily quest]
DECIZIE: Layer 4 indirect signal (Bayesian Nutrition) — 4 signals confirmed: greutate trend + force progression + mood post-session + adherence training compliance. Sleep/Stress/Hidratare EXCLUDED (friction = daily quest).
RAȚIONAL: Friction reduction; signals via behavioral proxy (Vitality Layer future).
IMPACT dacă greșită: SEVERE — losing physiological signals = AA detection blind on key markers.
SURSA: HANDOVER §2 Layer 4 line 79-80.
PUSH-BACK: Sleep/Stress major fatigue contributors; excluding = mis-detection physiological burnout; Vitality Layer mitigates but delays.
STATUS: pending review Daniel cross-ref Q-0237

Q-0303 [Domain 1.8 — AA detection real-time vs deferred]
DECIZIE: AA detection runs on outcome write (post-session). Not real-time mid-session.
RAȚIONAL: Outcome data needed for detection; mid-session intervention different feature.
IMPACT dacă greșită: SEVERE — real-time detection without complete data = false; post-session miss intra-session crisis.
SURSA: ADR 011 §outcome.autoAggression line 134-160; ADR 013 §Implementation pure functions.
PUSH-BACK: Mid-session intervention prevented while user pushing; valuable signal lost.
STATUS: pending review Daniel cross-ref Q-0286

Q-0304 [Domain 1.8 — AA detection storage signals[]]
DECIZIE: outcome.autoAggression.signals[] = list of signal IDs fired (e.g., 'volume_creep', 'frustration', 'recovery_debt'). Empty array if tier 'none'.
RAȚIONAL: Granular trace per detection; downstream consumers can filter by signal.
IMPACT dacă greșită: SEVERE — signals lost = aggregate analysis blind; tier alone insufficient.
SURSA: ADR 011 §outcome.autoAggression line 140-148.
PUSH-BACK: signals[] exposed in CDL = anti-RE leak future if Firebase reads exposed; protect.
STATUS: pending review Daniel cross-ref Q-0214

Q-0305 [Domain 1.8 — AA detection escalating boolean]
DECIZIE: outcome.autoAggression.escalating: bool — true if MED tier persisted 2+ consecutive săpt.
RAȚIONAL: Escalation flag tracked at outcome write; inform HIGH tier transition.
IMPACT dacă greșită: SEVERE — escalating false on MED persist = HIGH never triggered.
SURSA: ADR 011 §outcome.autoAggression line 145.
PUSH-BACK: Boolean escalating coarse; "near-HIGH" granularity lost.
STATUS: pending review Daniel cross-ref Q-0297

Q-0306 [Domain 1.8 — AA detection amplified hyperfocus]
DECIZIE: outcome.autoAggression.amplified: bool — true if hyperfocus pattern detected. amplifierReason: string | null — e.g., 'hyperfocus_pattern_8h_4days_per_week'.
RAȚIONAL: Hyperfocus modulates thresholds; flag for downstream calibration.
IMPACT dacă greșită: SEVERE — amplified omis = no hyperfocus modulation; thresholds uniform.
SURSA: ADR 011 §outcome.autoAggression line 146-148.
PUSH-BACK: amplifierReason free-text vs enum; consistency cross-entries fragile.
STATUS: pending review Daniel cross-ref Q-0228

Q-0307 [Domain 1.8 — AA aggregation rule null = no data]
DECIZIE: Any module reading outcome.autoAggression must treat null as "no data" and exclude from rate calculations.
RAȚIONAL: Honest semantics; null ≠ none; preserve aggregate accuracy.
IMPACT dacă greșită: SEVERE — null treated as 'none' = false healthy aggregate.
SURSA: ADR 011 §Aggregation rule line 163.
PUSH-BACK: Every consumer must implement null-handling = bug surface; default-to-exclude policy enforced via lint.
STATUS: pending review Daniel cross-ref Q-0116

Q-0308 [Domain 1.8 — AA proxy rating ≤2/5 until RPE]
DECIZIE: Rating ≤2/5 proxy temporar pentru frustration markers și composite fatigue marker #2 până AA fix DONE → RPE ≥9.
RAȚIONAL: Best signal currently; proxy explicit; reconsider trigger documented.
IMPACT dacă greșită: MODERATE — proxy noisy; RPE granular better; transition planned.
SURSA: ADR 013 §Composite fatigue line 79; Trigger #5 line 249.
PUSH-BACK: Rating + RPE different signals; proxy may not generalize.
STATUS: pending review Daniel cross-ref Q-0156

Q-0309 [Domain 1.8 — AA Profile Typing Q1-Q5 + spot-check Q6]
DECIZIE: Profile Typing 5 întrebări core onboarding + 1 spot-check Q6 post-sesiunea 3.
RAȚIONAL: Self-report initial 3-4 + 1 behavioral; sensible window size.
IMPACT dacă greșită: SEVERE — too many questions = onboarding friction; too few = thin signal.
SURSA: HANDOVER §6.2 Profile Typing line 130; ADR 013 §Profile typing 3-4 + 1 line 96-98.
PUSH-BACK: Q1-Q5 specific spec missing; vague.
STATUS: pending review Daniel cross-ref Q-0232

Q-0310 [Domain 1.8 — AA Profile Tier-based personalization]
DECIZIE: T0 skip behavioral inference → demographic prior; T1+ → real signal accumulating.
RAȚIONAL: Cold start fallback; behavioral inference once data sufficient.
IMPACT dacă greșită: SEVERE — T0 demographic absent = profile blind; T1+ ignoring real signal = stuck demographic.
SURSA: HANDOVER §6.3 line 131; ADR 017 Demographic Prior.
PUSH-BACK: Demographic prior calibration empirical only at scale; T0 reliability uncertain v1.
STATUS: pending review Daniel cross-ref Q-0179

Q-0311 [Domain 1.8 — AA detection real-time engagement banner]
DECIZIE: AA banner shown coach idle screen on detection; banner copy neutral "Coach-ul observă...".
RAȚIONAL: Idle screen visibility; not interrupt mid-session; subtle.
IMPACT dacă greșită: SEVERE — too subtle = ignored; too prominent = banner fatigue.
SURSA: HANDOVER §1.95 modal anti-RE; HANDOVER §6 categorical display line 105-107.
PUSH-BACK: Banner location consistency — same banner all patterns or per-pattern? UI fragmentation.
STATUS: pending review Daniel cross-ref Q-0214

Q-0312 [Domain 1.8 — AA detection signal-exposure backlog HIGH]
DECIZIE: Signal exposure în banners ("Adherence 0%", "Deviation 100%") = signal exposure similar cu modal AA pre-fix. Opus flagged backlog urgent: sweep volume_creep|frustration|recovery_debt|ignore_recovery|calorie_acceleration în src/pages/, src/styles/.
RAȚIONAL: Anti-RE moat protection extends to all banners; same patterns RE leak în alte module.
IMPACT dacă greșită: SEVERE — signal exposure = competitor reverse-engineers detection logic.
SURSA: HANDOVER §Signal Exposure HIGH backlog line 164-167.
PUSH-BACK: Sweep multiple files = scope creep; risk regression in cleanup.
STATUS: pending review Daniel cross-ref Q-0214

Q-0313 [Domain 1.8 — AA detection feature flag rollout 1.0 implicit]
DECIZIE: aa_detection_v1 flag rollout 1.0 (already live); rollback path = flag false → director cade pe code path vechi.
RAȚIONAL: Live functionally; flag = rollback insurance.
IMPACT dacă greșită: MODERATE — rollback flag absent = stuck on broken; rollback by code revert slow.
SURSA: ADR 018 §1 + Faza 1 line 326-331.
PUSH-BACK: Rollout 1.0 = no actual rollout safety; should test with 10% bucket first.
STATUS: pending review Daniel cross-ref Q-0288

Q-0314 [Domain 1.8 — AA detection pattern strict empirical recalibration]
DECIZIE: Toți parametrii AA detection ADR 013 = starting guesses fără data empirică. Listă explicită Empirical Calibration Parameters.
RAȚIONAL: Honest disclaimer; recalibration triggers explicit.
IMPACT dacă greșită: SEVERE — frozen parameters wrong = systematic mis-detection ad infinitum.
SURSA: ADR 013 §Empirical Calibration Parameters line 222-239.
PUSH-BACK: Documentation good; reactive triggers slow; should be quarterly review tied to ADR amendment workflow.
STATUS: pending review Daniel cross-ref Q-0057

Q-0315 [Domain 1.8 — AA detection ML viability trigger]
DECIZIE: Reconsideration Trigger #6 ML viability — at 1000+ users + 6+ months agregate behavioral data.
RAȚIONAL: Cold start ML problem solved at scale; black-box concerns offset by accuracy.
IMPACT dacă greșită: SEVERE — too early ML = bad classifier; too late = stagnation rule-based.
SURSA: ADR 013 Trigger #6 line 250.
PUSH-BACK: 1000 users far horizon (per PRODUCT_STRATEGY 1000 MAU 12-18 luni); ML deferred = competitor advantage.
STATUS: pending review Daniel cross-ref Q-0242

Q-0316 [Domain 1.8 — AA hyperfocus inversion trigger]
DECIZIE: Reconsideration Trigger #7 — if observed pattern shows hyperfocus correlates negative cu auto-aggression (sustainability), inversare amplificator.
RAȚIONAL: Empirical revision possibility; hyperfocus = sustainability proxy possible.
IMPACT dacă greșită: SEVERE — frozen wrong-direction = systematic mis-detection.
SURSA: ADR 013 Trigger #7 line 251.
PUSH-BACK: Inversion = full re-architect amplifier logic; not trivial reactive fix.
STATUS: pending review Daniel cross-ref Q-0228

Q-0317 [Domain 1.8 — AA detection deferred RPE per-set fix DONE]
DECIZIE: AA fix design discussion separat — RPE per-set vs sintetic vs eliminate. Pending; proxy rating ≤2/5 acceptabil temporar.
RAȚIONAL: RPE granular ideal but UX friction; design iteration needed.
IMPACT dacă greșită: SEVERE — RPE never fixed = AA detection rating-proxy forever; accuracy capped.
SURSA: ADR 013 §Implementation Notes Dependencies line 268-273.
PUSH-BACK: RPE per-set vs sintetic decision pending = AA ADR partial spec; user-facing changes blocked.
STATUS: pending review Daniel cross-ref Q-0156

Q-0318 [Domain 1.8 — AA dismiss memory escalation]
DECIZIE: Soft warnings memorie. User dismiss același warning 3× consecutiv → sistemul NU repetă același exact warning. Escalează formularea SAU silent track + log în profile pentru calibrare viitoare.
RAȚIONAL: Anti-alarm fatigue; persistent dismiss = signal of "user disagrees consistent" = adapt.
IMPACT dacă greșită: SEVERE — repeating identical warning = wallpaper; intervention 0.
SURSA: ADR 013 §Dismiss memory line 151-158.
PUSH-BACK: "Escalate formularea" or "silent track" = 2 paths unclear; spec ambiguity.
STATUS: pending review Daniel cross-ref Q-0224

Q-0319 [Domain 1.8 — AA detection composite fatigue noise reduction]
DECIZIE: Composite fatigue (2+ markers din 3) reduces single-signal noise; v1 starting threshold.
RAȚIONAL: Composite robustness > individual signal; reduces false positives.
IMPACT dacă greșită: SEVERE — composite too strict = miss; too lax = noise.
SURSA: ADR 013 §Composite fatigue line 84.
PUSH-BACK: 2/3 = supermajority; 3/3 stricter; decisions empirical.
STATUS: pending review Daniel cross-ref Q-0210

Q-0320 [Domain 1.8 — AA fatigue score depend stable definitions]
DECIZIE: Composite fatigue score depinde de definiții stable. Reps achieved, rating, volume — all noise în logging. Composite (2+ din 3) reduces noise dar nu elimină.
RAȚIONAL: Acceptable for v1; iterative refinement.
IMPACT dacă greșită: SEVERE — definitions drift = composite scores incomparable cross-versions.
SURSA: ADR 013 §Trade-offs line 211-213.
PUSH-BACK: Logging noise inherent; composite mitigates partially; signal verification needed.
STATUS: pending review Daniel cross-ref Q-0319

### DOMAIN 2: STORAGE & SYNC

#### 2.1 localStorage schema + migrations

Q-0321 [Domain 2.1 — localStorage primary local-first ADR 001]
DECIZIE: SalaFull local-first storage; localStorage primary; Firebase sync secondary.
RAȚIONAL: Sala WiFi mort = Arbitrator funcționează perfect local; offline-first PWA.
IMPACT dacă greșită: CATASTROFIC — fully online = sala without WiFi = app unusable.
SURSA: ADR 001 local-first; PRODUCT_STRATEGY §7.4 line 278-279.
PUSH-BACK: localStorage 5MB cap = scale issue at 1000+ sessions; IndexedDB graduation needed.
STATUS: pending review Daniel cross-ref Q-0322

Q-0322 [Domain 2.1 — localStorage 5MB budget per user]
DECIZIE: localStorage budget 5MB total per user. CDL Tier 1 ~125KB = 2.5%.
RAȚIONAL: Browser limit; CDL controlled growth via tiered demotion.
IMPACT dacă greșită: SEVERE — budget exceeded = quota exception = silent data loss.
SURSA: ADR 011 §Negative consequences line 386.
PUSH-BACK: 5MB browser-dependent (some 10MB); cross-browser inconsistency; IndexedDB unlimited better.
STATUS: pending review Daniel cross-ref Q-0321

Q-0323 [Domain 2.1 — Storage keys kebab-case]
DECIZIE: Storage keys kebab-case: coach-decisions, applied-patterns, pattern-learning-cache.
RAȚIONAL: Convention consistency; visual search facil în devtools.
IMPACT dacă greșită: MINOR — naming inconsistent = developer surprise.
SURSA: ADR 011 §Storage line 234-237.
PUSH-BACK: Mixed cu camelCase fields; unify across codebase.
STATUS: pending review Daniel cross-ref Q-0128

Q-0324 [Domain 2.1 — Storage migration runner eager app init]
DECIZIE: Migration runner eager pe app load. Single batch pass before any engine read.
RAȚIONAL: Simpler downstream; readers assume current schema; fail-loud.
IMPACT dacă greșită: SEVERE — partial migration mid-app = inconsistent reads; lazy migration = readers complex.
SURSA: ADR 018 §4 + DP-5 APPROVED line 488-500.
PUSH-BACK: Startup latency proportional entries; user 1000+ entries × migration cost = freeze.
STATUS: pending review Daniel cross-ref Q-0095

Q-0325 [Domain 2.1 — Migration failsafe partial preserve]
DECIZIE: If migration throws on any entry, runner persist entries deja migrate + lasă restul în vechi format + raises Sentry critical. App continue (graceful degradation).
RAȚIONAL: Fail open over fail closed; aggregation engines null-safe.
IMPACT dacă greșită: SEVERE — fail-closed = app unusable on migration bug; fail-open = inconsistent state but functional.
SURSA: ADR 018 §4 line 252-253.
PUSH-BACK: Mixed schema state confusing; users with mixed entries debugging hard.
STATUS: pending review Daniel cross-ref Q-0324

Q-0326 [Domain 2.1 — Migration version field per-entry]
DECIZIE: Per-entry schemaVersion field. Bumped on each schema change. CURRENT_VERSION constant per storage key.
RAȚIONAL: Versioning explicit elimină ambiguity; migration code knows from/to.
IMPACT dacă greșită: SEVERE — implicit version = drift detectabil doar via bug.
SURSA: ADR 018 §4 line 222-228.
PUSH-BACK: schemaVersion field per entry = 4 bytes × N entries = trivial; non-issue.
STATUS: pending review Daniel cross-ref Q-0060

Q-0327 [Domain 2.1 — Migration entries fără schemaVersion = v1 implicit]
DECIZIE: Existing entries fără schemaVersion field tratate ca version: 1 implicit la prima migration.
RAȚIONAL: Backward compat; pre-versioning entries default v1.
IMPACT dacă greșită: SEVERE — assumed v1 wrong = migration applies wrong logic.
SURSA: ADR 018 §4 line 261-262.
PUSH-BACK: Implicit assumption fragile; explicit migration to add version field cleaner.
STATUS: pending review Daniel cross-ref Q-0326

Q-0328 [Domain 2.1 — Migration storageKeys per migration]
DECIZIE: Each migration declares storageKeys[] field; runner applies only to listed keys.
RAȚIONAL: Migration scoped to relevant storage; avoid cross-key effects.
IMPACT dacă greșită: SEVERE — wide storageKeys = unrelated data mutated; narrow = miss relevant.
SURSA: ADR 018 §4 example line 235-249.
PUSH-BACK: Granular control good; risk forgetting key in storageKeys for new related store.
STATUS: pending review Daniel cross-ref Q-0096

Q-0329 [Domain 2.1 — Migration sequential chain]
DECIZIE: Migrations applied chain sequential — entry from v2 to v5 = apply v2→v3, v3→v4, v4→v5 in order.
RAȚIONAL: Sequential = deterministic; each migration self-contained.
IMPACT dacă greșită: SEVERE — skip migration = schema corrupt; out-of-order = fields missing.
SURSA: ADR 018 §4 implicit; standard migration pattern.
PUSH-BACK: Chain length grows; v2 user upgrading after 5 versions = 5× compute; squash old migrations periodic.
STATUS: pending review Daniel cross-ref Q-0324

Q-0330 [Domain 2.1 — Storage versioning across stores]
DECIZIE: Versioning aplicat NU doar la CDL — și la profile-history, vitality-responses, coach-decisions-aggregate. Each storage key own current version constant.
RAȚIONAL: Per-store versioning; independent evolution.
IMPACT dacă greșită: MODERATE — single global version = cross-store coupling; per-store independent.
SURSA: ADR 018 §4 Implementation notes line 261-263.
PUSH-BACK: N versions across stores = N migration paths; complexity grows N²?
STATUS: pending review Daniel cross-ref Q-0326

Q-0331 [Domain 2.1 — readDevFlags localStorage override]
DECIZIE: localStorage._devFlags override pentru feature flags dev-only. JSON object {flagId: bool}.
RAȚIONAL: Dev testing forced enable; production strip.
IMPACT dacă greșită: SEVERE — _devFlags leak production = unrestricted enable; visible UI banner if active prod build.
SURSA: ADR 018 §5 line 296-298.
PUSH-BACK: localStorage tampering = users enable dev flags themselves; should be signed/encrypted.
STATUS: pending review Daniel cross-ref Q-0332

Q-0332 [Domain 2.1 — User-id vs Device-id distinction]
DECIZIE: 'user-id' rezervat multi-tenant (post-auth); 'device-id' = UUID anon. featureFlags.js JSDoc documentat.
RAȚIONAL: Anonymous device → authenticated user transition; preserve flag bucket.
IMPACT dacă greșită: SEVERE — device-id reset on logout = user re-bucketed = inconsistent flag.
SURSA: INSIGHTS_BACKLOG LOW-5 line 88-90.
PUSH-BACK: Should be note în ADR 011 (LOW-5 deferred); doc gap.
STATUS: pending review Daniel cross-ref Q-0331

Q-0333 [Domain 2.1 — Storage corruption JSON.parse fail handling]
DECIZIE: localStorage corruption (JSON.parse fail) → recovery: log Sentry critical + restart from defaults; preserve raw corrupted data în corruption-backup key for forensics.
RAȚIONAL: Graceful degradation; forensic preservation; user not stuck.
IMPACT dacă greșită: CATASTROFIC — JSON parse fail unhandled = entire app crashed; reset destroys data.
SURSA: ADR 011 implicit + Cognitive Arch §Q9 Recovery from corruption line 361.
PUSH-BACK: Backup key consumes more space; cleanup needed.
STATUS: pending review Daniel cross-ref Q-0168

Q-0334 [Domain 2.1 — Storage tier demotion daily tick transactional]
DECIZIE: Demotion runs daily tick (initAutoBackup). Transactional: failed demotion preserves Tier 1 entry until success.
RAȚIONAL: Consistency over performance; no entry lost mid-demotion.
IMPACT dacă greșită: SEVERE — non-transactional + crash = entry between Tier 1 and 2 = lost.
SURSA: ADR 011 §Storage line 238-239.
PUSH-BACK: Daily delay up to 24h; offline device = miss demotion.
STATUS: pending review Daniel cross-ref Q-0127

Q-0335 [Domain 2.1 — Storage budget monitoring 60% / 80%]
DECIZIE: Budget monitoring needed; ADR 011 reactive trigger 80%. Recommendation: 60% alarm, 80% action.
RAȚIONAL: Proactive vs reactive; early warning preserves cleanup options.
IMPACT dacă greșită: SEVERE — only 80% reactive = late notice; user may already lose data.
SURSA: ADR 011 Trigger #3 line 354.
PUSH-BACK: Threshold pair adds monitoring complexity; single threshold simpler.
STATUS: pending review Daniel cross-ref Q-0132

Q-0336 [Domain 2.1 — Storage cleanup demotion order]
DECIZIE: Tier 1 → Tier 2 demotion: oldest entries first; exclude superseded chain (already filtered).
RAȚIONAL: Maintain chronological boundary; superseded already non-active.
IMPACT dacă greșită: SEVERE — newest demoted = lose recent data Tier 1; superseded keeping = waste.
SURSA: ADR 011 §Idempotency superseded filter + §Storage demotion.
PUSH-BACK: Superseded chain in Tier 2/3 = lose audit trail; preservation needs explicit decision.
STATUS: pending review Daniel cross-ref Q-0167

Q-0337 [Domain 2.1 — Storage ID convention sortable]
DECIZIE: Entry ID sortable lexicographically — 'cd_2026-04-25_18:42'. Allows sorted queries without timestamp parse.
RAȚIONAL: Performance; chronological sort = string sort.
IMPACT dacă greșită: MINOR — non-sortable ID = parse cost.
SURSA: ADR 011 schema line 46.
PUSH-BACK: Same-minute collision possible; second precision needed.
STATUS: pending review Daniel cross-ref Q-0150

Q-0338 [Domain 2.1 — Storage write batch on session end]
DECIZIE: Session end triggers batch write: CDL outcome populate + logs append + patterns recompute. Single transaction conceptually.
RAȚIONAL: Atomic state advance; no partial state visible.
IMPACT dacă greșită: SEVERE — partial write = inconsistent state across stores; CDL has outcome but logs not updated.
SURSA: ADR 011 §Integration line 295-297.
PUSH-BACK: localStorage no transactions; emulated via try/catch + rollback complex.
STATUS: pending review Daniel cross-ref Q-0334

Q-0339 [Domain 2.1 — Storage IndexedDB future graduation]
DECIZIE: IndexedDB future ([Cognitive Arch §Q11 Performance line 369]) for HISTORICAL pre-aggregation; localStorage primary v1.
RAȚIONAL: localStorage 5MB cap eventually breached; IndexedDB unlimited; future migration planned.
IMPACT dacă greșită: SEVERE — IndexedDB never adopted = scale ceiling.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q11 implicit.
PUSH-BACK: IndexedDB API verbose; localStorage simpler; migration later cost.
STATUS: pending review Daniel cross-ref Q-0322

Q-0340 [Domain 2.1 — Storage encryption opt-in]
DECIZIE: localStorage data NOT encrypted; user device trust assumed. Future: opt-in encryption sensitive fields (medical, profile).
RAȚIONAL: Encryption complexity; user device shared = risk; opt-in advanced.
IMPACT dacă greșită: SEVERE — shared device = data leak; encryption mandatory might be needed.
SURSA: implicit ADR 001 local-first; not explicit ADR yet.
PUSH-BACK: GDPR may require encryption at rest; check legal.
STATUS: pending review Daniel cross-ref Q-0341

Q-0341 [Domain 2.1 — Storage Firebase Realtime DB path users/{uid}]
DECIZIE: Firebase RTDB path users/{uid}/<store-key>. UID = anon UUID v1, post-auth firebase.uid.
RAȚIONAL: User-scoped private; standard pattern.
IMPACT dacă greșită: CATASTROFIC — wrong path = users/global = privacy leak; permission rules block.
SURSA: ADR 001 + ADR 002 firebase REST not SDK + ADR 011 sync path.
PUSH-BACK: REST not SDK = manual path construction; path bugs harder to catch than SDK type-safe.
STATUS: pending review Daniel cross-ref Q-0125

Q-0342 [Domain 2.1 — Storage sync interval 5-min idle]
DECIZIE: Firebase sync runs 5-min idle window OR on critical events (session end, profile edit).
RAȚIONAL: Battery + bandwidth efficient; critical = immediate.
IMPACT dacă greșită: MODERATE — too frequent = battery drain; too infrequent = sync lag.
SURSA: implicit ADR 001 + ADR 002.
PUSH-BACK: 5-min hardcoded; should be adaptive on connection type (WiFi vs cellular).
STATUS: pending review Daniel cross-ref Q-0343

Q-0343 [Domain 2.1 — Storage SYNC_KEYS list explicit]
DECIZIE: SYNC_KEYS const în firebase.js explicit list of keys synced. CDL 3 keys added explicit.
RAȚIONAL: Explicit > implicit; new keys must be added consciously.
IMPACT dacă greșită: SEVERE — key omis = no sync = device divergence.
SURSA: ADR 011 §Firebase sync line 245.
PUSH-BACK: Maintenance; new key = update SYNC_KEYS + tests.
STATUS: pending review Daniel cross-ref Q-0125

Q-0344 [Domain 2.1 — Storage _suppressFirebaseSync flag fragile]
DECIZIE: _suppressFirebaseSync flag honored; in-memory pre-reload lost.
RAȚIONAL: Per-write opt-out; existing pattern.
IMPACT dacă greșită: CATASTROFIC — flag lost on reload = sync re-introduces deleted entries (memory paradox bug).
SURSA: HANDOVER §Firebase Sync Re-Pull CRITICAL line 158-162.
PUSH-BACK: Persistent flag (localStorage) fragile but better; T&B pattern definitive solution.
STATUS: pending review Daniel cross-ref Q-0171

Q-0345 [Domain 2.1 — Storage offline write queue]
DECIZIE: Offline writes queued localStorage; sync resumes on reconnect; queue replay order-preserved.
RAȚIONAL: Offline-first; eventual consistency.
IMPACT dacă greșită: SEVERE — queue lost = offline writes evaporate; out-of-order replay = inconsistent state.
SURSA: ADR 001 + Cognitive Arch §Q9 Resilience line 358-362.
PUSH-BACK: Queue grows on extended offline; eventual quota issue.
STATUS: pending review Daniel cross-ref Q-0322

Q-0346 [Domain 2.1 — Storage data registry centralized]
DECIZIE: src/util/dataRegistry.js maintains list of localStorage keys + cleanup utilities. Tracked via FINDINGS_MASTER.
RAȚIONAL: Discoverability; cleanup centralized; auditable.
IMPACT dacă greșită: SEVERE — orphan keys (deprecated features) accumulate; storage waste.
SURSA: implicit src/util/dataRegistry.js + ADR 011 §Decommissioning line 284-285.
PUSH-BACK: Centralized registry vs per-feature ownership; central simpler but coupling.
STATUS: pending review Daniel cross-ref Q-0123

Q-0347 [Domain 2.1 — Storage profile-history schema]
DECIZIE: profile-history separate localStorage key; profile changes log; versioning per ADR 018.
RAȚIONAL: Audit trail; reconciliation context.
IMPACT dacă greșită: SEVERE — profile changes lost = audit broken; reconciliation prompt missing context.
SURSA: ADR 013 §Resolved Open Questions #5 line 327-330; ADR 018 §4 versioning.
PUSH-BACK: Profile-history schema not yet defined; spec ambiguity.
STATUS: pending review Daniel cross-ref Q-0241

Q-0348 [Domain 2.1 — Storage logs raw existing format preserved]
DECIZIE: logs[] format preserved (existing). CDL synthetic backfill reads logs; CDL real entries paralel.
RAȚIONAL: Backward compat; existing data not lost; CDL = new layer.
IMPACT dacă greșită: CATASTROFIC — logs format change = breaks existing user data.
SURSA: ADR 011 §Backfill line 248-271; ADR 001 local-first.
PUSH-BACK: Long-term logs duplicate cu CDL = waste; consolidation eventual.
STATUS: pending review Daniel cross-ref Q-0173

Q-0349 [Domain 2.1 — Storage applied-patterns decommission]
DECIZIE: applied-patterns decommissioned post triggers + 7-day diff audit. Reads CDL post.
RAȚIONAL: Single source truth; H30c resolution.
IMPACT dacă greșită: SEVERE — premature decommission = engine blind during cutover.
SURSA: ADR 011 §Decommissioning line 273-285.
PUSH-BACK: Trigger-based slow; coordinated cutover possibly faster.
STATUS: pending review Daniel cross-ref Q-0122

Q-0350 [Domain 2.1 — Storage sentinel for unknown rule IDs]
DECIZIE: Removing rule = sentinel DEPRECATED_<original_id> preserved for historical entries. Never reused.
RAȚIONAL: Audit trail preserved; forward compat readers.
IMPACT dacă greșită: SEVERE — reused id = false alignment historical decisions; audit corrupt.
SURSA: ADR 011 §Stable Rule IDs line 105-108.
PUSH-BACK: DEPRECATED_ prefix verbose; UUID-based ID-uri immutable simpler.
STATUS: pending review Daniel cross-ref Q-0111

#### 2.2 Firebase sync — current LWW vs Tombstone & Branching planned

Q-0351 [Domain 2.2 — Firebase REST not SDK ADR 002]
DECIZIE: Firebase REST API NOT SDK. Vanilla JS no framework. Bundle size minimal.
RAȚIONAL: ADR 005 vanilla; SDK adds 200KB+ bundle; REST direct fetch.
IMPACT dacă greșită: SEVERE — SDK bundle size = page load slow; REST = manual auth + retry.
SURSA: ADR 002 firebase REST not SDK.
PUSH-BACK: SDK has retry/offline/sync built-in; REST = reinvent wheel.
STATUS: pending review Daniel cross-ref Q-0341

Q-0352 [Domain 2.2 — Firebase open rules ADR 007]
DECIZIE: Firebase rules currently OPEN (read+write) for v1. Locked auth post-launch.
RAȚIONAL: Onboarding friction zero; auth post-launch.
IMPACT dacă greșită: CATASTROFIC — open rules production = data theft; security audit fails.
SURSA: ADR 007 firebase open rules.
PUSH-BACK: Open rules = anyone can write users/{anyUid}/coach-decisions; mass corruption possible; needs rate limit minimum.
STATUS: pending review Daniel cross-ref Q-0353

Q-0353 [Domain 2.2 — Firebase auth Anonymous lift]
DECIZIE: Auth Anonymous v1 (Firebase auth.signInAnonymously). Multi-tenant real auth post-launch.
RAȚIONAL: Friction-free signup; UUID per device persistent.
IMPACT dacă greșită: SEVERE — anonymous lost on device reset = account loss without recovery.
SURSA: Cognitive Arch §Q14 Identity & Auth line 388-392.
PUSH-BACK: Anonymous = no recovery email/phone; user reset device = user gone permanent; bad UX for retention.
STATUS: pending review Daniel cross-ref Q-0352

Q-0354 [Domain 2.2 — Firebase 1 user N devices]
DECIZIE: 1 User = N devices supported via Firebase UUID = Canonical ID.
RAȚIONAL: Cross-device sync; mobile + desktop.
IMPACT dacă greșită: MODERATE — without N devices = phone-only or desktop-only lock.
SURSA: Cognitive Arch §Q14 line 388-389.
PUSH-BACK: 1 user N devices conflict resolution = sync logic complex; T&B pattern critical.
STATUS: pending review Daniel cross-ref Q-0355

Q-0355 [Domain 2.2 — Account merge OUT_OF_SCOPE_v1.0]
DECIZIE: Account merge OUT_OF_SCOPE v1.0.
RAȚIONAL: Complex; rare case; deferred.
IMPACT dacă greșită: SEVERE — user with 2 anonymous accounts (1 phone + 1 desktop) = no path consolidate.
SURSA: Cognitive Arch §Q14 line 391.
PUSH-BACK: Real-world frequency — user installs on phone + later desktop without realizing same; merge needed.
STATUS: pending review Daniel cross-ref Q-0354

Q-0356 [Domain 2.2 — Firebase EU data residency]
DECIZIE: Firebase EU server region (europe-west1 sau eu-central1).
RAȚIONAL: GDPR compliance EU data residency; latency RO acceptable.
IMPACT dacă greșită: CATASTROFIC — non-EU = GDPR violation = fines.
SURSA: implicit GDPR §Cognitive Arch §Q14 line 393; PRODUCT_STRATEGY §5.10 line 214-217.
PUSH-BACK: EU region selection at project create; not changeable later; lock-in.
STATUS: pending review Daniel cross-ref Q-0049

Q-0357 [Domain 2.2 — Firebase deleteAccount Cloud Function]
DECIZIE: GDPR deleteAccount: Cloud Function purges user_profile/mesocycles/sessions wiped + arbitration_log anonymized.
RAȚIONAL: Right to erasure; anonymize preserves training data.
IMPACT dacă greșită: CATASTROFIC — incomplete delete = GDPR fine; over-delete = lose ML training data.
SURSA: Cognitive Arch §Q14 line 392-393.
PUSH-BACK: Manual Cloud Function script; should be automated test ensuring all paths purged.
STATUS: pending review Daniel cross-ref Q-0049

Q-0358 [Domain 2.2 — Firebase sync conflict UX prompt]
DECIZIE: Sync conflict UX: Invisible pe merge-uri OK. Conflict hard → UI prompt "Avem 2 salvări. Alegi pe asta de azi sau pe cea de ieri?" (Tombstone pattern).
RAȚIONAL: Auto-merge soft; user resolves hard conflicts.
IMPACT dacă greșită: SEVERE — auto-merge wrong = data loss; always-prompt = friction.
SURSA: PRODUCT_STRATEGY §7.6 line 285; Cognitive Arch §Q9.
PUSH-BACK: Definition "merge-uri OK" vs "hard conflict" subjective; merge logic spec needed.
STATUS: pending review Daniel cross-ref Q-0172

Q-0359 [Domain 2.2 — Firebase listener real-time vs polling]
DECIZIE: Firebase RTDB on() listeners for real-time sync; polling fallback if listener fails.
RAȚIONAL: Push notification cross-device; immediate consistency.
IMPACT dacă greșită: MODERATE — polling only = latency; listener with reconnect needed.
SURSA: implicit Firebase RTDB pattern.
PUSH-BACK: Listeners persistent connection = battery drain mobile; should detach background tabs.
STATUS: pending review Daniel cross-ref Q-0342

Q-0360 [Domain 2.2 — Firebase offline writes queued]
DECIZIE: Firebase REST not SDK = manual offline queue în localStorage; replay on reconnect.
RAȚIONAL: ADR 002 REST manual; SDK offline support not used.
IMPACT dacă greșită: SEVERE — offline writes lost without queue.
SURSA: ADR 002 + ADR 001.
PUSH-BACK: SDK provides offline cache automatic; REST manual = bug surface.
STATUS: pending review Daniel cross-ref Q-0345

Q-0361 [Domain 2.2 — Firebase pricing tier breakpoint 10K users]
DECIZIE: Scale breakpoint 10,000 users. Acolo Firebase scump + greu agregat → migrate Postgres + GraphQL.
RAȚIONAL: Cost ramp; Firebase economical small scale; alternative scale.
IMPACT dacă greșită: SEVERE — Firebase locked above 10K = monthly cost prohibitive; migration needed.
SURSA: PRODUCT_STRATEGY §10.2 line 380-382.
PUSH-BACK: 10K threshold subjective; cost depends on read/write pattern; need actual measurement.
STATUS: pending review Daniel cross-ref Q-0362

Q-0362 [Domain 2.2 — Firebase RTDB vs Firestore choice]
DECIZIE: RTDB used (per ADR 011 §Firebase sync line 242). NOT Firestore.
RAȚIONAL: Existing pattern; RTDB simpler hierarchical; Firestore querying not needed v1.
IMPACT dacă greșită: MODERATE — RTDB scaling limits; Firestore better at scale.
SURSA: ADR 011 §Firebase sync line 242.
PUSH-BACK: Firestore better querying + offline support; should reconsider before scale.
STATUS: pending review Daniel cross-ref Q-0361

Q-0363 [Domain 2.2 — Sync write throttling]
DECIZIE: Firebase writes throttled; multiple writes within 5s coalesced (single PUT).
RAȚIONAL: Bandwidth + cost reduction; rapid edits debounced.
IMPACT dacă greșită: MODERATE — no throttle = expensive ops; over-throttle = sync lag.
SURSA: implicit ADR 002 REST + battery considerations.
PUSH-BACK: Throttle = lost intermediate state if device crashes mid-debounce.
STATUS: pending review Daniel cross-ref Q-0342

Q-0364 [Domain 2.2 — Sync conflict LWW v1 baseline]
DECIZIE: V1 sync conflict resolution = LWW (last-write-wins) implicit per Firebase RTDB nature.
RAȚIONAL: Simplest; ADR 011 §Firebase sync says "monotonic superseded transition make LWW acceptable".
IMPACT dacă greșită: CATASTROFIC — concurrent writes lose data; "memory paradox" bug exemplifică.
SURSA: ADR 011 §Firebase sync line 246.
PUSH-BACK: LWW conflicts with Cognitive Arch §Q9 T&B pattern; needs alignment.
STATUS: pending review Daniel cross-ref Q-0126

Q-0365 [Domain 2.2 — Sync planned T&B post-launch CRITICAL]
DECIZIE: Tombstone & Branching pattern locked Cognitive Arch v1 BUT NU implementat v1. Trigger pre-launch obligatoriu.
RAȚIONAL: Memory paradox bug (HANDOVER) requires T&B; deferred = blocking pre-launch.
IMPACT dacă greșită: CATASTROFIC — without T&B, sync conflicts silent data loss.
SURSA: HANDOVER §Firebase Sync Re-Pull CRITICAL line 158-162; Cognitive Arch §Q9.
PUSH-BACK: T&B implementation effort 1-2 sprints; resource allocation pre-launch.
STATUS: pending review Daniel cross-ref Q-0171

Q-0366 [Domain 2.2 — Sync Cloud Function aggregation]
DECIZIE: Cloud Function aggregation eliminates client-side race conditions Phone A/B aggregation.
RAȚIONAL: Single source of truth pre-aggregated; clients consume; race conditions impossible.
IMPACT dacă greșită: SEVERE — client aggregation race = inconsistent rolling windows cross-device.
SURSA: Cognitive Arch §Q11 CORRECTED v2 line 369-371; §"Multi-device aggregation race" line 437.
PUSH-BACK: Cloud Function dependency cost; latency cold-start.
STATUS: pending review Daniel cross-ref Q-0043

Q-0367 [Domain 2.2 — Sync UTC + local_offset timestamps]
DECIZIE: Timestamps UTC + local_offset salvat. Orchestrator calculează now(UTC) - offset.
RAȚIONAL: Timezone-safe; deterministic boundaries.
IMPACT dacă greșită: SEVERE — local time only = day boundary bugs cross-timezone; user travels = day shift.
SURSA: Cognitive Arch §Q20 Timezones line 425.
PUSH-BACK: Two fields per timestamp = storage; daylight saving complications.
STATUS: pending review Daniel cross-ref Q-0149

Q-0368 [Domain 2.2 — Sync metric/imperial CDL strict SI]
DECIZIE: CDL + Arbitrator strict SI (kg, cm). Conversion EXCLUSIVELY în Presentation Layer.
RAȚIONAL: Single source truth math; UI converts; cross-locale consistency.
IMPACT dacă greșită: CATASTROFIC — mixed units storage = math errors propagate; bug nightmare.
SURSA: Cognitive Arch §Q20 line 423-424; HANDOVER §4 Kg/Lbs line 90-92.
PUSH-BACK: Conversion at presentation = N conversions; cache layer needed.
STATUS: pending review Daniel cross-ref Q-0367

Q-0369 [Domain 2.2 — Sync Fasting Mode setting]
DECIZIE: Fasting Mode setting temporary; Voice specială sau REALTIME modifier; RPE max cap (e.g., 8) durata.
RAȚIONAL: Religious fasting accommodation; safety cap during; temporary toggle.
IMPACT dacă greșită: SEVERE — without mode = ramadan period users push max = injury during fasting.
SURSA: Cognitive Arch §Q20 Fasting line 427-429.
PUSH-BACK: Fasting Mode UX — auto-enable based on calendar Ramadan? Manual toggle? Decision.
STATUS: pending review Daniel cross-ref Q-0356

Q-0370 [Domain 2.2 — Sync data export user-facing JSON]
DECIZIE: "Export my data (JSON)" în cont. Transparență totală.
RAȚIONAL: GDPR right; user trust; competitor migration option.
IMPACT dacă greșită: CATASTROFIC GDPR — export missing = compliance fail.
SURSA: PRODUCT_STRATEGY §7.5 line 282.
PUSH-BACK: JSON export usable by competitor for migration; brand risk; but obligatoriu legal.
STATUS: pending review Daniel cross-ref Q-0049

#### 2.3 Cross-device sync (telefon ↔ PC)

Q-0371 [Domain 2.3 — Cross-device PWA same login]
DECIZIE: PWA = doar login. Magic. Cross-device via firebase auth UID.
RAȚIONAL: PWA cross-platform; no app store; single account.
IMPACT dacă greșită: SEVERE — broken cross-device = users lose data switching devices.
SURSA: PRODUCT_STRATEGY §9.8 line 363-364; §7.3 line 274-276.
PUSH-BACK: Anonymous auth = no recovery; user must remember UUID or login bound to device.
STATUS: pending review Daniel cross-ref Q-0353

Q-0372 [Domain 2.3 — Cross-device readiness same day shared]
DECIZIE: Readiness logged single device shared cross-device for same date. Engine state synced.
RAȚIONAL: Single user-state; phone log seen on desktop.
IMPACT dacă greșită: SEVERE — divergence per device = user confused which is canonical.
SURSA: implicit ADR 011 sync; HANDOVER §1 Readiness MOVE.
PUSH-BACK: Phone readiness 8/10 after sleep, desktop check at evening 4/10 — which is canonical?
STATUS: pending review Daniel cross-ref Q-0373

Q-0373 [Domain 2.3 — Cross-device session in progress lock]
DECIZIE: Active session locked single device; switch device = warning "Sesiune activă pe X. Continui aici?".
RAȚIONAL: Avoid concurrent edits same session; lock device active.
IMPACT dacă greșită: SEVERE — concurrent edits = lost sets; user frustrated.
SURSA: implicit; HANDOVER not specific but pattern logical.
PUSH-BACK: Lock fragile if device offline; release timer needed.
STATUS: pending review Daniel cross-ref Q-0374

Q-0374 [Domain 2.3 — Cross-device offline writes converge]
DECIZIE: Offline writes converge via Cloud Function aggregation post-reconnect.
RAȚIONAL: Append-only logs deterministic; aggregation Cloud Function single-pass.
IMPACT dacă greșită: SEVERE — divergent aggregations cross-device = inconsistent learning.
SURSA: Cognitive Arch §"Multi-device aggregation race" line 437; CF aggregation.
PUSH-BACK: CF cold-start latency; offline-to-online delay perceived.
STATUS: pending review Daniel cross-ref Q-0366

Q-0375 [Domain 2.3 — Cross-device CDL eventual consistency]
DECIZIE: CDL eventual consistency cross-device. Local-first writes; sync eventual.
RAȚIONAL: Offline-first PWA; immediate local action; sync background.
IMPACT dacă greșită: SEVERE — strong consistency = blocked offline; eventual = brief divergence.
SURSA: ADR 011 §Firebase sync line 244.
PUSH-BACK: Eventual = "I deleted on phone, still see desktop"; user model strong consistency expected.
STATUS: pending review Daniel cross-ref Q-0125

Q-0376 [Domain 2.3 — Cross-device export JSON includes everything]
DECIZIE: Export JSON includes CDL + logs + profile + settings + multi-gym configs.
RAȚIONAL: Comprehensive export; user takes data.
IMPACT dacă greșită: CATASTROFIC GDPR — incomplete export = compliance fail.
SURSA: PRODUCT_STRATEGY §7.5 line 282.
PUSH-BACK: Large export size on user with 2+ years history; compress (gzip) needed.
STATUS: pending review Daniel cross-ref Q-0370

Q-0377 [Domain 2.3 — Cross-device sync key whitelist explicit]
DECIZIE: SYNC_KEYS whitelist explicit. Keys NOT in list = local-only.
RAȚIONAL: Explicit > implicit; new keys default local until promoted.
IMPACT dacă greșită: SEVERE — sensitive ephemeral keys synced unintended = privacy leak.
SURSA: ADR 011 §Firebase sync line 245.
PUSH-BACK: Maintenance burden; new feature must add to SYNC_KEYS.
STATUS: pending review Daniel cross-ref Q-0343

Q-0378 [Domain 2.3 — Cross-device active gym preserved]
DECIZIE: active_gym_id synced cross-device. User switches phone → desktop = same active gym.
RAȚIONAL: Multi-Gym continuity cross-device.
IMPACT dacă greșită: SEVERE — gym divergence = engine sees different equipment availability per device.
SURSA: HANDOVER §7 Multi-Gym Q4 line 116.
PUSH-BACK: Last-write-wins for active_gym = phone switches gym, desktop reads stale.
STATUS: pending review Daniel cross-ref Q-0364

Q-0379 [Domain 2.3 — Cross-device readiness session per-day single]
DECIZIE: readiness-session[date] per-day single value across devices. LWW or T&B pattern.
RAȚIONAL: Readiness per-day single canonical; cross-device.
IMPACT dacă greșită: SEVERE — duplicate readiness writes per day cross-device = inconsistent engine state.
SURSA: HANDOVER §1 readiness session line 64.
PUSH-BACK: User logs morning readiness phone, evening desktop — which?
STATUS: pending review Daniel cross-ref Q-0372

Q-0380 [Domain 2.3 — Cross-device Aware system state sync]
DECIZIE: Aware system counters synced cross-device. Skip count phone counts on desktop.
RAȚIONAL: Single user state; counters per-user not per-device.
IMPACT dacă greșită: SEVERE — counter divergence = aware thresholds inconsistent.
SURSA: HANDOVER §5 Aware system; ADR 011 sync pattern.
PUSH-BACK: Concurrent skip across devices = double-count? deduplication needed.
STATUS: pending review Daniel cross-ref Q-0188

#### 2.4 Data loss vectors

Q-0381 [Domain 2.4 — injectBaseline pattern eliminat]
DECIZIE: injectBaseline pattern eliminated. Previous data loss vector closed.
RAȚIONAL: Audit identified pattern caused phantom v0 entries; refactor removed.
IMPACT dacă greșită: CATASTROFIC — re-introduction = data corruption pattern.
SURSA: HANDOVER §Wave 1 Step 2 Q020 + Memory Paradox line 53; PRODUCT_STRATEGY implicit.
PUSH-BACK: Pattern's intent (cold-start fallback) needed solution; replacement = Demographic Prior ADR 017.
STATUS: pending review Daniel cross-ref Q-0382

Q-0382 [Domain 2.4 — Memory Paradox v0 ghost verify]
DECIZIE: Wave 1 Step 2 Q020 + Memory Paradox Firebase verify zero v0 ghosts production. Read-only investigation Opus.
RAȚIONAL: Verify production data clean post-fix; pre-launch readiness.
IMPACT dacă greșită: SEVERE — v0 ghosts persist = data corruption silent.
SURSA: HANDOVER §URMĂTOAREA SESIUNE IMMEDIATE NEXT line 207.
PUSH-BACK: Read-only investigation = no fix path if found; should plan remediation if non-zero.
STATUS: pending review Daniel cross-ref Q-0381

Q-0383 [Domain 2.4 — JSON parse failure recovery]
DECIZIE: JSON.parse failure → log Sentry critical + restart from defaults; preserve raw corrupted in corruption-backup key.
RAȚIONAL: Forensic preservation; user not stuck.
IMPACT dacă greșită: CATASTROFIC — unhandled = app crashed; reset destroys data.
SURSA: implicit; Cognitive Arch §Q9 Recovery line 361.
PUSH-BACK: Backup key consumes space; cleanup needed.
STATUS: pending review Daniel cross-ref Q-0333

Q-0384 [Domain 2.4 — localStorage clear by user]
DECIZIE: User clear localStorage = data loss; Firebase sync recovery on reload.
RAȚIONAL: Local-first means local-only after clear; sync re-fetches.
IMPACT dacă greșită: SEVERE — clear without sync = permanent loss; sync race condition.
SURSA: ADR 001 local-first.
PUSH-BACK: User accidental clear = data loss inevitable; warning impossible browser-level.
STATUS: pending review Daniel cross-ref Q-0321

Q-0385 [Domain 2.4 — Browser quota exceeded handling]
DECIZIE: localStorage QuotaExceededError → demote oldest entries Tier 1→2 emergency; alert user low space.
RAȚIONAL: Graceful response; user informed.
IMPACT dacă greșită: SEVERE — silent quota = silent data loss; emergency demote = aggressive.
SURSA: implicit ADR 011 Trigger #3.
PUSH-BACK: Emergency demote = pattern detection blind on demoted; loss tradeoff.
STATUS: pending review Daniel cross-ref Q-0335

Q-0386 [Domain 2.4 — Firebase quota exceeded backoff]
DECIZIE: Firebase 429 rate limit → exponential backoff + Sentry log.
RAȚIONAL: Standard pattern; service recovery.
IMPACT dacă greșită: MODERATE — no backoff = thrashing; over-backoff = sync lag.
SURSA: implicit ADR 002 + Cognitive Arch §Q9 Failure Modes.
PUSH-BACK: User offline + Firebase 429 = double failure mode; queue + backoff.
STATUS: pending review Daniel cross-ref Q-0345

Q-0387 [Domain 2.4 — Service worker cache stale]
DECIZIE: PWA service worker cache stale → force-reload via cache-busting (versioned URL).
RAȚIONAL: PWA update mechanism; deterministic cache invalidation.
IMPACT dacă greșită: CATASTROFIC — cached old version forever = users stuck on bad code.
SURSA: implicit PWA pattern.
PUSH-BACK: Force-reload = lost in-progress session; should warn user.
STATUS: pending review Daniel cross-ref Q-0388

Q-0388 [Domain 2.4 — Service worker version pinned]
DECIZIE: Service worker version pinned in manifest; bump on deploy = cache bust.
RAȚIONAL: Standard PWA; controlled invalidation.
IMPACT dacă greșită: SEVERE — version not bumped = users stuck old code; cache bug.
SURSA: implicit PWA setup.
PUSH-BACK: Manual bump prone to error; should be CI auto-bump.
STATUS: pending review Daniel cross-ref Q-0387

Q-0389 [Domain 2.4 — Concurrent edits 2 devices same user]
DECIZIE: Concurrent edits 2 devices = T&B pattern resolves; UI prompt user choice if irreconcilable.
RAȚIONAL: Cognitive Arch §Q9 T&B; zero data loss.
IMPACT dacă greșită: CATASTROFIC — naive merge = data loss; T&B preserves both branches.
SURSA: Cognitive Arch §Q9 line 358-362.
PUSH-BACK: User confused by "varianta A sau B?" prompt mid-flow.
STATUS: pending review Daniel cross-ref Q-0172

Q-0390 [Domain 2.4 — Network timeout Firebase fallback localStorage]
DECIZIE: Firebase timeout → fallback localStorage only; user notified soft "Offline mode".
RAȚIONAL: Local-first ensures functionality; banner for transparency.
IMPACT dacă greșită: SEVERE — silent fallback = user thinks synced but isn't; data loss on device reset.
SURSA: implicit ADR 001.
PUSH-BACK: Banner intrusive; subtle indicator preferable.
STATUS: pending review Daniel cross-ref Q-0345

#### 2.5 Schema versioning ADR 018 §4

Q-0391 [Domain 2.5 — Schema versioning per-store independent]
DECIZIE: Versioning per storage key independent. CDL has v1, v2, v3; profile-history has v1; vitality-responses has v1.
RAȚIONAL: Per-store evolution independent; coupling avoided.
IMPACT dacă greșită: MODERATE — coupling = cross-store cascade migrations.
SURSA: ADR 018 §4 line 261-263.
PUSH-BACK: N versions = N constants + N migration files; growth proliferates.
STATUS: pending review Daniel cross-ref Q-0330

Q-0392 [Domain 2.5 — Schema migration runner failsafe]
DECIZIE: Migration throws → persist deja migrate, leave rest, Sentry critical, app continue graceful degradation.
RAȚIONAL: Fail-open; aggregation null-safe.
IMPACT dacă greșită: SEVERE — fail-closed = app unusable; mixed schema confusing.
SURSA: ADR 018 §4 line 252-253.
PUSH-BACK: Mixed schema state debugging hard; force-finish migration on next boot or accept perpetual mixed.
STATUS: pending review Daniel cross-ref Q-0325

Q-0393 [Domain 2.5 — Schema reconciliation Trigger #8 ADR 011]
DECIZIE: Schema drift detected post-implementation = trigger ADR review. Drift normal as concrete implementation surfaces needs ADR couldn't anticipate.
RAȚIONAL: Pragmatic; ADR-code sync goal not absolute.
IMPACT dacă greșită: SEVERE — drift accumulates = ADR docs stale = future eng confused.
SURSA: ADR 011 Trigger #8 line 364-367.
PUSH-BACK: Reactive trigger; should be quarterly proactive sync.
STATUS: pending review Daniel cross-ref Q-0129

Q-0394 [Domain 2.5 — Schema additions nullable for backward compat]
DECIZIE: Schema additions = nullable optional fields. Existing entries get null. Aggregation engines handle null gracefully.
RAȚIONAL: ADD silent, backward-compatible per Schema Matrix Rule.
IMPACT dacă greșită: SEVERE — new field non-nullable = existing entries break.
SURSA: ADR 011 §outcome.autoAggression nullable line 134-160; ADR 018 §Q12 line 374.
PUSH-BACK: Null fields proliferate; consumer code becomes null-checking heavy.
STATUS: pending review Daniel cross-ref Q-0307

Q-0395 [Domain 2.5 — Schema CHANGE/REMOVE migration runner mandatory]
DECIZIE: CHANGE/REMOVE (renames, structural) Mandatory Migration Runner script la primul boot.
RAȚIONAL: Backward incompat changes need migration; cannot leave drift.
IMPACT dacă greșită: SEVERE — no migration = entries broken; consumer assumptions invalid.
SURSA: ADR 018 §Q12 Schema Matrix line 376-377; §4 implementation.
PUSH-BACK: Migration script bug = corruption; testing critical.
STATUS: pending review Daniel cross-ref Q-0324

Q-0396 [Domain 2.5 — Schema INTRODUCE Cold Start Explicit not Backfill]
DECIZIE: INTRODUCE (voice nouă) Cold Start Explicit, NOT Backfill. New voice intră cu pondere 0% (listening mode 7-14 zile) → calibrare → weight.
RAȚIONAL: Backfill = data invention; cold start preserves data integrity.
IMPACT dacă greșită: SEVERE — backfill new voice = invented history pollutes engine.
SURSA: ADR 018 §Q12 line 378-379.
PUSH-BACK: 7-14 zile listening = user experience without new voice; UX trade-off.
STATUS: pending review Daniel cross-ref Q-0036

Q-0397 [Domain 2.5 — Schema migration test on Daniel actual history]
DECIZIE: Backfill script test on Daniel's actual history (80+ sesiuni). Validation gate 10 random samples.
RAȚIONAL: Real-data testing > synthetic; gate ensures correctness.
IMPACT dacă greșită: CATASTROFIC — buggy backfill on real data = corrupt baseline.
SURSA: ADR 011 §Backfill validation gate line 263-267; subtask 3.
PUSH-BACK: 10 samples small; statistical confidence low; should be 25%+.
STATUS: pending review Daniel cross-ref Q-0121

Q-0398 [Domain 2.5 — Schema deprecation warning automated 90 zile]
DECIZIE: Quarterly Review Process automated 90 zile. Rules/codes nu declanșate 3 luni → [DEPRECATION_WARNING] automat.
RAȚIONAL: Code rot prevention; automated discovery.
IMPACT dacă greșită: SEVERE — false positive deprecation = legitimate edge case lost.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Quarterly Review line 305-307.
PUSH-BACK: 3 luni rare events (pregnancy mode, injury) trigger natural rate < 1%/an = false positive.
STATUS: pending review Daniel cross-ref Q-0055

Q-0399 [Domain 2.5 — Schema ADR amendment tracking]
DECIZIE: Modificarea weights necesită micro-document (10 rânduri ADR Amendment) cu justificare empirical metrics. NU "adjusted weights" PR.
RAȚIONAL: Weights = decisions architectural; PR silent invisible.
IMPACT dacă greșită: SEVERE — silent drift continuous = engine pile of magic numbers.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §C ADR Amendments line 308-310.
PUSH-BACK: Bureaucratic; threshold (>5% change = ADR?) lipsă.
STATUS: pending review Daniel cross-ref Q-0057

Q-0400 [Domain 2.5 — Schema subtask 4 director integration unblocks]
DECIZIE: Backfill validation gate manual review 10 samples Daniel sign-off în EXEC_RESULTS.md unblocks subtask 4 (director integration).
RAȚIONAL: Quality gate before integration; explicit sign-off.
IMPACT dacă greșită: CATASTROFIC — gate skip = potential corrupt baseline cascades.
SURSA: ADR 011 §Backfill validation gate line 263-268; §Implementation Order line 408.
PUSH-BACK: Sign-off process slow; risk velocity; needed for safety.
STATUS: pending review Daniel cross-ref Q-0397

### DOMAIN 3: USER INPUT & FRICTION

#### 3.1 Daily inputs (greutate, kcal, protein) — frequency, lock-in, stale awareness

Q-0401 [Domain 3.1 — Daily inputs frequency optional]
DECIZIE: Greutate, kcal, protein inputs daily optional. Engine reduces confidence pe weight-driven recommendations după 14+ zile fără input.
RAȚIONAL: Honest signal degradation; user not forced; engine adapts.
IMPACT dacă greșită: SEVERE — mandatory = friction churn; never-required = stale data forever.
SURSA: HANDOVER §11 Greutate corp stale awareness line 152.
PUSH-BACK: 14 zile threshold arbitrary; should anneal smoothly.
STATUS: pending review Daniel cross-ref Q-0278

Q-0402 [Domain 3.1 — Greutate input rolling avg 7 zile]
DECIZIE: Greutate input rolling avg 7 zile cu confidence weighting. 0 inputs = prior; 1 input = 50/50; 3+ = 100% input.
RAȚIONAL: Smooth daily fluctuations (water, glycogen); progressive confidence buildup.
IMPACT dacă greșită: SEVERE — single-input override = noise; permanent prior = ignore signal.
SURSA: HANDOVER §2 Layer 2 line 76.
PUSH-BACK: 7 zile + 3 inputs threshold tied; user with 1 weigh-in/săpt gets perpetual 50/50.
STATUS: pending review Daniel cross-ref Q-0403

Q-0403 [Domain 3.1 — Greutate outlier >2kg/24h soft warning]
DECIZIE: Outlier weight >2kg/24h = soft warning. Engine reduces confidence.
RAȚIONAL: Daily fluctuation 1-2kg typical; >2kg = likely typo.
IMPACT dacă greșită: MODERATE — accept outliers = corrupt; reject all = miss legit shifts.
SURSA: HANDOVER §11 Greutate corp line 152; PRODUCT_STRATEGY §9.1.
PUSH-BACK: 2kg occasionally legit (post-flight, post-binge); soft warning maintains agency.
STATUS: pending review Daniel cross-ref Q-0277

Q-0404 [Domain 3.1 — Greutate Stale awareness 7/14/30 thresholds]
DECIZIE: Stale awareness 7/14/30 zile thresholds. Engine confidence decay post-14 zile.
RAȚIONAL: Honest signal staleness signal; 30+ zile = no recent data.
IMPACT dacă greșită: SEVERE — no decay = stale data confident; aggressive decay = punish vacation.
SURSA: HANDOVER §11 line 152.
PUSH-BACK: Threshold-based step-function; smooth decay (exponential) more accurate.
STATUS: pending review Daniel cross-ref Q-0278

Q-0405 [Domain 3.1 — Kcal input Bayesian similar protein]
DECIZIE: Kcal Bayesian similar protein. 5-layer inference; outlier rejection.
RAȚIONAL: Same Bayesian framework; consistency.
IMPACT dacă greșită: MODERATE — different framework = inconsistency.
SURSA: HANDOVER §9 Bayesian Nutrition line 74-81.
PUSH-BACK: Kcal estimation users harder than protein (more sources); accuracy lower.
STATUS: pending review Daniel cross-ref Q-0406

Q-0406 [Domain 3.1 — Protein Layer 1 prior kg × multiplier]
DECIZIE: Layer 1 prior: kg × multiplier per phase (CUT 2.2g/kg LBM, BULK 1.8, MAINT 2.0, STRENGTH 1.8). LBM din Boer formula.
RAȚIONAL: Standard sport nutrition multipliers; LBM Boer well-established.
IMPACT dacă greșită: SEVERE — wrong multiplier = under/over protein target.
SURSA: HANDOVER §2 Layer 1 line 75.
PUSH-BACK: 2.2 g/kg LBM CUT high (research suggests 1.8-2.4); choice empirical.
STATUS: pending review Daniel cross-ref Q-0407

Q-0407 [Domain 3.1 — LBM Boer formula]
DECIZIE: LBM = Boer formula. Standard.
RAȚIONAL: Validated formula; standard.
IMPACT dacă greșită: MODERATE — Boer ±5% accuracy; alternative formulas (Hume, James) similar.
SURSA: HANDOVER §2 Layer 1 line 75.
PUSH-BACK: Boer for males/females separately; gender-specific; bug surface if reversed.
STATUS: pending review Daniel cross-ref Q-0406

Q-0408 [Domain 3.1 — Protein outlier >400g <30g rejection]
DECIZIE: Layer 3 outlier rejection: >400g/day or <30g/day = silent reject + toast. Schimbare >100g/day vs avg = soft warning.
RAȚIONAL: Impossible inputs filtered; substantial change flagged.
IMPACT dacă greșită: SEVERE — accept = corrupt baseline; reject all = paranoia.
SURSA: HANDOVER §2 Layer 3 line 78.
PUSH-BACK: 400g/day = elite athlete possible; rejection misses real signal.
STATUS: pending review Daniel cross-ref Q-0276

Q-0409 [Domain 3.1 — Protein Layer 4 indirect signal 4 confirmed]
DECIZIE: Layer 4 indirect signal — 4 signals: greutate trend + force progression + mood post-session + adherence training compliance. Tabel 5×5. Sleep/Stress/Hidratare EXCLUDED (friction = daily quest).
RAȚIONAL: Behavioral proxy; friction reduction.
IMPACT dacă greșită: SEVERE — losing physiological signals = nutrition inference incomplete.
SURSA: HANDOVER §2 Layer 4 line 79-80.
PUSH-BACK: Sleep/Stress major nutrition response factors; excluding = miss; Vitality Layer mitigates.
STATUS: pending review Daniel cross-ref Q-0302

Q-0410 [Domain 3.1 — Layer 5 reconciliation Caz A/B/C]
DECIZIE: Layer 5: Caz A concordanță, Caz B discordanță (input claim vs reality), Caz C reverse discordanță. Banner wording "Verificăm contextul..."
RAȚIONAL: Cross-pillar reconciliation; honest UI when input vs reality conflict.
IMPACT dacă greșită: SEVERE — silent reconciliation = user confused result; no reconciliation = trust input always wrong.
SURSA: HANDOVER §2 Layer 5 line 81.
PUSH-BACK: 3-case logic complex; wording "Verificăm contextul..." vague — what cases produce what message?
STATUS: pending review Daniel cross-ref Q-0411

Q-0411 [Domain 3.1 — BF estimation combo (a)+(b)+(c)]
DECIZIE: BF% combo: (a) Photo-based primary 6-8 poze 3D anatomical click selecție; (b) Optional buton talie/gât → Navy formula; (c) Skip "Sari peste" → Boer simple kg+height+age+sex.
RAȚIONAL: User decide friction acceptable; gradient of effort vs accuracy.
IMPACT dacă greșită: SEVERE — single rigid path = friction; multi-path = consistent calibration challenge.
SURSA: HANDOVER §3 BF estimation line 84-87.
PUSH-BACK: 3 paths = 3 calibration sets; LBM derived = N variants; complexity downstream.
STATUS: pending review Daniel cross-ref Q-0412

Q-0412 [Domain 3.1 — BF Navy formula talie/gât optional]
DECIZIE: (b) Navy formula optional buton; user adds talie/gât for precision.
RAȚIONAL: Validated formula; reasonable accuracy with effort.
IMPACT dacă greșită: MODERATE — Navy ±5%; vs photo ±10%; vs Boer ±15%.
SURSA: HANDOVER §3 line 86.
PUSH-BACK: Talie/gât measurement requires tape; user without = skip path (c).
STATUS: pending review Daniel cross-ref Q-0411

Q-0413 [Domain 3.1 — Kg/lbs unit selector navigator.language default]
DECIZIE: Onboarding "Sistem metric (kg/cm) sau imperial (lbs/inches)?" default kg pentru RO, lbs pentru EN audience (din navigator.language). Storage internal mereu kg.
RAȚIONAL: Auto-detect default; user override; SI internal.
IMPACT dacă greșită: SEVERE — internal lbs = math errors propagate; auto-detect wrong = user friction.
SURSA: HANDOVER §4 Kg/Lbs line 90-92.
PUSH-BACK: navigator.language unreliable; user RO laptop English language → default lbs wrong.
STATUS: pending review Daniel cross-ref Q-0368

Q-0414 [Domain 3.1 — Voice input REJECTED v1]
DECIZIE: Voice input REJECTED v1. "cine drq vrea sa urle in sala la telefon" — Daniel quote.
RAȚIONAL: Friction enormous; sala loud; voice-to-text inaccurate.
IMPACT dacă greșită: MINOR — feature gap but no harm; competitors may add later.
SURSA: HANDOVER §11 P6 line 149; PRODUCT_STRATEGY §2.9 line 96-98.
PUSH-BACK: Some users want hands-free during chalked hands; niche use case.
STATUS: pending review Daniel cross-ref Q-0415

Q-0415 [Domain 3.1 — Auto-dismiss summary modal 5 sec]
DECIZIE: Auto-dismiss summary modal 5 sec (P2 friction reduction).
RAȚIONAL: Reduce taps; user already saw outcome; auto-close.
IMPACT dacă greșită: MODERATE — too fast = miss info; too slow = wait friction.
SURSA: HANDOVER §11 P2 line 147.
PUSH-BACK: 5s same for all users; some read slower; should be configurable.
STATUS: pending review Daniel cross-ref Q-0414

Q-0416 [Domain 3.1 — RPE per-set combo smart inference]
DECIZIE: RPE per-set = (d) combo: smart inference reps actual + selective prompt RPE 4-tap doar la outlier sets. Reduce 75% friction.
RAȚIONAL: Inference cheap signal; prompt only when needed; targeted friction.
IMPACT dacă greșită: SEVERE — full prompt every set = friction; pure inference = signal noise.
SURSA: HANDOVER §11 P1 line 145.
PUSH-BACK: "Outlier" definition empirical; tuning needed; first sessions noisy.
STATUS: pending review Daniel cross-ref Q-0317

Q-0417 [Domain 3.1 — Weight greutate corp lock-in]
DECIZIE: No lock-in; user can edit past weight entries (typo correction).
RAȚIONAL: Correction allowed; ARBITRATOR past immuabil but raw data editable.
IMPACT dacă greșită: SEVERE — no edit = typo permanent; full edit = retro-gaming.
SURSA: Cognitive Arch §Q16 line 405-407.
PUSH-BACK: Edit triggers Cloud Function diff Historical_Profile; expensive op.
STATUS: pending review Daniel cross-ref Q-0164

Q-0418 [Domain 3.1 — Identical 5x/day logs deduplication]
DECIZIE: Identical 5x/day logs detected; bug detection / Deduplication frontend; logs accepted but merged on sync.
RAȚIONAL: User mash-key bug-prone; dedup behind scenes.
IMPACT dacă greșită: MODERATE — dedup wrong = real legit identical sets lost; over-keep = pattern false positives.
SURSA: PRODUCT_STRATEGY §9.3 line 348-350.
PUSH-BACK: Identical logs ARE possible (same exercise twice in workout); how distinguish from accidental?
STATUS: pending review Daniel cross-ref Q-0419

Q-0419 [Domain 3.1 — Inputs context-aware tier thresholds]
DECIZIE: Aware system thresholds context-aware per calibration tier (50% reduce 3×, 7d suppress 7×, off perm 15× on COLD/INITIAL; tighter on PERSONALIZING+).
RAȚIONAL: New users tolerate more pushback; experienced single nudge enough.
IMPACT dacă greșită: SEVERE — reversed = abandon early; too aggressive on advanced = churn.
SURSA: HANDOVER §5 Aware system line 96-101.
PUSH-BACK: Tier-based rigid; user-personality variance > tier; Profile Typing-driven preferred.
STATUS: pending review Daniel cross-ref Q-0187

Q-0420 [Domain 3.1 — Kcal input Bayesian similar to protein]
DECIZIE: Kcal Bayesian similar protein 5-layer; layer 1 prior = TDEE estimate; layer 2 input rolling; layer 3 outlier rejection (impossible kcal); layer 4 indirect signal; layer 5 reconciliation.
RAȚIONAL: Consistency; framework reusable.
IMPACT dacă greșită: SEVERE — diverge from protein = inconsistency; overload single framework = forced fits.
SURSA: HANDOVER §9.6 line 405.
PUSH-BACK: Kcal estimation harder than protein (multi-source error); should have tighter outlier thresholds.
STATUS: pending review Daniel cross-ref Q-0405

#### 3.2 Per-session inputs (readiness, RPE per-set, rating end, "Aparat ocupat"/"Lipsă")

Q-0421 [Domain 3.2 — Readiness MOVE la START antrenament]
DECIZIE: Click START → modal readiness obligatoriu cu Skip (default neutru 3). Stocat ca readiness-session[date]. Engine recalculează instant.
RAȚIONAL: User flow: vestiar → click START → "Cum te simți?" → engine recalibrare → sesiune începe cu plan.
IMPACT dacă greșită: SEVERE — readiness pre-START = user already in flow disrupted; post = too late.
SURSA: HANDOVER §1 Readiness MOVE la START line 60-72.
PUSH-BACK: Modal at START = friction during pump-up moment; default 3 lazy = no signal.
STATUS: pending review Daniel cross-ref Q-0422

Q-0422 [Domain 3.2 — Readiness Skip default neutru 3]
DECIZIE: Readiness Skip default neutru 3 (mid-scale).
RAȚIONAL: User can skip; default = no bias either direction.
IMPACT dacă greșită: SEVERE — default 5 (high) = engine thinks user fresh; default 1 (low) = engine over-conservative.
SURSA: HANDOVER §1 line 64.
PUSH-BACK: Default 3 = "neither here nor there"; user habit defaults = no real signal.
STATUS: pending review Daniel cross-ref Q-0421

Q-0423 [Domain 3.2 — Readiness mood history coach idle SUBTLE]
DECIZIE: Coach idle: plan baseline FĂRĂ readiness gate. Readiness card SUBTLE pentru mood history (pattern learning). Stocat ca readiness-mood[date]. NU schimbă plan vizibil.
RAȚIONAL: Pattern signal collection without disrupting flow; reverse engineering blocked (no visible plan change).
IMPACT dacă greșită: SEVERE — visible plan change pre-START = RE leak; no signal = pattern blind.
SURSA: HANDOVER §1 Coach idle line 62.
PUSH-BACK: 2 readiness signals (mood + session) per day = duplicate friction.
STATUS: pending review Daniel cross-ref Q-0421

Q-0424 [Domain 3.2 — RPE per-set 4-tap selective]
DECIZIE: RPE 4-tap selective doar la outlier sets (reps deviation mare SAU primul set exercițiu). Reduce 75% friction.
RAȚIONAL: Targeted friction; signal where matters.
IMPACT dacă greșită: SEVERE — too lax = miss key RPE; too strict = friction; outlier definition critical.
SURSA: HANDOVER §11 P1 line 145.
PUSH-BACK: 4-tap quick but interrupts flow mid-session; 1-tap (slider) faster.
STATUS: pending review Daniel cross-ref Q-0416

Q-0425 [Domain 3.2 — Rating end of session 5-point scale]
DECIZIE: Rating end of session 5-point scale ('easy', 'normal', 'hard', etc).
RAȚIONAL: User self-report; CDL outcome.rating; AA detection signal.
IMPACT dacă greșită: SEVERE — coarse scale = noisy; fine scale = friction.
SURSA: ADR 011 schema outcome.rating line 92; ADR 013 fatigue marker.
PUSH-BACK: 5-point Likert subject scaling; user always picks middle.
STATUS: pending review Daniel cross-ref Q-0156

Q-0426 [Domain 3.2 — "Aparat ocupat" ephemeral context]
DECIZIE: "Aparat ocupat" remains ephemeral context. Substitute exercise; not persistent.
RAȚIONAL: Real-world friction (gym crowded); preserve session continuity.
IMPACT dacă greșită: SEVERE — persistent = wrong learning; ephemeral = re-encounter handled fresh.
SURSA: HANDOVER §11 P3 line 148.
PUSH-BACK: Repeated "Aparat ocupat" same exercise = pattern; ephemeral misses pattern.
STATUS: pending review Daniel cross-ref Q-0273

Q-0427 [Domain 3.2 — "Lipsă aparat" persistent per-gym]
DECIZIE: "Lipsă aparat" persistent per-gym (Multi-Gym). Engine filters exercises pe equipment_unavailable per gym activ.
RAȚIONAL: Structural gym property; learn equipment availability incrementally.
IMPACT dacă greșită: SEVERE — confused with ephemeral = wrong persist; non-persistent = re-prompt forever.
SURSA: HANDOVER §7 Multi-Gym line 113-121.
PUSH-BACK: User says "Lipsă" once → blocked forever; equipment fixed week later = no reprompt.
STATUS: pending review Daniel cross-ref Q-0274

Q-0428 [Domain 3.2 — Per-session inputs minimal friction goal]
DECIZIE: Per-session inputs minimum: readiness (1 prompt), RPE per-set (selective), rating end (1 prompt).
RAȚIONAL: Reduce friction; signal preserved; user trust.
IMPACT dacă greșită: SEVERE — too many prompts = abandonment; too few = engine blind.
SURSA: HANDOVER §11 friction analysis.
PUSH-BACK: Minimum still feels high to lazy user; should be progressive (more prompts unlock with tier).
STATUS: pending review Daniel cross-ref Q-0421

Q-0429 [Domain 3.2 — RPE inference reps actual]
DECIZIE: RPE inferred from reps actual vs target. If reps achieved 100% target = RPE 7-8; if <80% = RPE 9-10; etc.
RAȚIONAL: Infer cheap signal; explicit prompt only outlier.
IMPACT dacă greșită: SEVERE — bad inference = wrong RPE → wrong fatigue/AA detection.
SURSA: HANDOVER §11 P1 line 145.
PUSH-BACK: Inference assumes reps target accurate = wrong if user adjusts mid-session.
STATUS: pending review Daniel cross-ref Q-0416

Q-0430 [Domain 3.2 — Per-set input weight + reps mandatory]
DECIZIE: Weight + reps per set mandatory. RPE selective. Time per set inferred timestamp.
RAȚIONAL: Volume = weight × reps × sets; minimum data.
IMPACT dacă greșită: SEVERE — missing weight or reps = volume calc broken.
SURSA: PRODUCT_STRATEGY §2.4 In-set logging mandatory line 81-83.
PUSH-BACK: In-set logging friction; time per set inferred = noisy on phone-down sets.
STATUS: pending review Daniel cross-ref Q-0431

Q-0431 [Domain 3.2 — Rest timer auto-start]
DECIZIE: Rest timer auto-start după logarea setului. Reduce tap count.
RAȚIONAL: Reduce friction; auto-track.
IMPACT dacă greșită: MINOR — manual timer = extra tap; auto = always on (user might not need).
SURSA: PRODUCT_STRATEGY §2.6 line 89-90.
PUSH-BACK: Auto-start = user dropping phone mid-set = timer running; need pause/cancel.
STATUS: pending review Daniel cross-ref Q-0432

Q-0432 [Domain 3.2 — Plate calculator FREE]
DECIZIE: Plate calculator FREE (Strong paywallează).
RAȚIONAL: Quality of life massiv; competitive differentiation; free tier value.
IMPACT dacă greșită: MINOR — paywall plate calc = small revenue; free = goodwill + Strong differentiation.
SURSA: PRODUCT_STRATEGY §2.7 line 92-94.
PUSH-BACK: Free features valuable but cumulative free = no Pro tier value.
STATUS: pending review Daniel cross-ref Q-0431

Q-0433 [Domain 3.2 — Demo videos licensed externally NU filmare]
DECIZIE: Demo videos licensed externally (MuscleWiki API/GIFs sau stock 2D). NU filma 300 clipuri în v1.0.
RAȚIONAL: Cost prohibitive in-house; licensed sufficient v1.
IMPACT dacă greșită: MODERATE — no demos = beginner gap; full filming = budget blow.
SURSA: PRODUCT_STRATEGY §2.8 line 95-97.
PUSH-BACK: Licensed quality variable; brand consistency lost.
STATUS: pending review Daniel cross-ref Q-0434

Q-0434 [Domain 3.2 — Exercise visual demo 3D anatomical illustrations]
DECIZIE: Generate prin Claude Design (bucket separat). Style: illustration anatomical 3D side-by-side START/END (gen aparate sală). Daniel NU în poză. ~200 exerciții × 2 illustrations. Pilot 1 exercițiu cu 3-5 style variante înainte scale.
RAȚIONAL: Anti-RE pattern (Daniel persoana absentă); brand neutral; scalable AI generated.
IMPACT dacă greșită: SEVERE — style fragmentat = brand identity confused; pilot reveals issues early.
SURSA: HANDOVER §10 line 142-144.
PUSH-BACK: AI-generated illustrations = potential "uncanny valley"; quality variable; rights questions LLM training.
STATUS: pending review Daniel cross-ref Q-0433

Q-0435 [Domain 3.2 — Custom exercises INTERZIS v1.0]
DECIZIE: Custom exercises INTERZIS v1.0. "Flexii Biceps pe minge" = rupe maparea muscular din PROJECTION engine.
RAȚIONAL: Engine accuracy depends on standard exercise library; custom = unmapped.
IMPACT dacă greșită: SEVERE — custom enabled = engine learning corrupt; restricted = power user friction.
SURSA: PRODUCT_STRATEGY §3.2 line 113-115.
PUSH-BACK: Power users custom exercises common; alienation = lost segment.
STATUS: pending review Daniel cross-ref Q-0436

Q-0436 [Domain 3.2 — Exercise library MAX 200]
DECIZIE: MAX 200 exerciții. Strict compuși + accesorii valide. NU 10.000 variații inutile.
RAȚIONAL: Curated quality > quantity; engine maps muscle groups reliably.
IMPACT dacă greșită: MODERATE — too few = power user gap; too many = engine bloat.
SURSA: PRODUCT_STRATEGY §3.1 line 110-112.
PUSH-BACK: 200 may exclude legitimate variations (front squat vs back squat both valid); needs case-by-case.
STATUS: pending review Daniel cross-ref Q-0435

Q-0437 [Domain 3.2 — Body measurements opționale 3-4]
DECIZIE: Greutate + 3-4 măsuri opționale. Fără bloatware.
RAȚIONAL: Bayesian Nutrition + BF estimation use; minimal beyond.
IMPACT dacă greșită: MODERATE — too few = engine signal limited; too many = friction.
SURSA: PRODUCT_STRATEGY §3.3 line 116-118.
PUSH-BACK: 3-4 ambiguous; talie/gât (Navy) + brat/coapsa = 4; specify exactly.
STATUS: pending review Daniel cross-ref Q-0412

Q-0438 [Domain 3.2 — Progress photos OUT_OF_SCOPE_v1.0]
DECIZIE: Progress photos OUT_OF_SCOPE_v1.0. Storage masiv (S3 costs) + complică GDPR la lansare.
RAȚIONAL: Cost + compliance; deferred.
IMPACT dacă greșită: MINOR — feature gap; competitors offer; not core.
SURSA: PRODUCT_STRATEGY §3.4 line 119-121.
PUSH-BACK: BF estimation Path (a) needs photos; conflict — photos uploaded for BF still need storage.
STATUS: pending review Daniel cross-ref Q-0411

Q-0439 [Domain 3.2 — Nutrition logging OUT_OF_SCOPE_v1.0 vs new Bayesian]
DECIZIE: PRODUCT_STRATEGY §3.5 line 122-124 says nutrition logging OUT_OF_SCOPE. HANDOVER §2 introduces Bayesian Nutrition Inference.
RAȚIONAL conflict: Strategy says no nutrition; Handover says yes Bayesian.
IMPACT dacă greșită: CRITICAL CONTRADICTION — strategy ADR-amendment needed.
SURSA: PRODUCT_STRATEGY §3.5 vs HANDOVER §2.
PUSH-BACK: Documentation drift; ADR amendment urgent; aligned spec needed.
STATUS: pending review Daniel — DOCUMENTATION CONFLICT cross-ref Q-0405

Q-0440 [Domain 3.2 — Cardio engine separat ignored Arbitrator hipertrofie v1.0]
DECIZIE: Cardio engine separat (basic logging). Ignorat din Arbitrator hipertrofie v1.0.
RAȚIONAL: Hipertrofie focus; cardio separate goals.
IMPACT dacă greșită: MODERATE — cardio user invisible to engine = mis-recommendation.
SURSA: PRODUCT_STRATEGY §3.6 line 125-127.
PUSH-BACK: Cardio impacts recovery; ignoring = engine blind on full picture.
STATUS: pending review Daniel cross-ref Q-0439

Q-0441 [Domain 3.2 — Sleep manual input check-in start "Cum ai dormit? 1-5"]
DECIZIE: Sleep data manual input la check-in start ("Cum ai dormit? 1-5"). Apple Health = v1.x.
RAȚIONAL: Manual sufficient v1; Apple Health expensive dev.
IMPACT dacă greșită: SEVERE — sleep blind = engine miss recovery signal; manual prompt friction.
SURSA: PRODUCT_STRATEGY §3.8 line 131-133.
PUSH-BACK: Conflict cu HANDOVER §2 Sleep EXCLUDED daily quest; ADR amendment needed.
STATUS: pending review Daniel — DOCUMENTATION CONFLICT cross-ref Q-0302

Q-0442 [Domain 3.2 — Heart rate ignorat v1.0]
DECIZIE: Heart rate ignorat v1.0. Nu ajută antrenament forță decât la fatigue recovery.
RAȚIONAL: Force training HR less informative than recovery HR; complex MVP.
IMPACT dacă greșită: MODERATE — recovery signal lost; competitors include.
SURSA: PRODUCT_STRATEGY §3.9 line 134-136.
PUSH-BACK: Wearables (Apple Watch, Garmin, Fitbit) common; HR data accessible; should integrate eventual.
STATUS: pending review Daniel cross-ref Q-0441

Q-0443 [Domain 3.2 — Female-specific cycle warning v1.0]
DECIZIE: Warning onest la onboarding: "v1.0 nu optimizează pentru ciclul menstrual, adăugăm în curând." Honest acknowledgment.
RAȚIONAL: Honest > hide; shows respect for user; future commitment.
IMPACT dacă greșită: SEVERE — female users feel ignored; brand damage; vs competitors with cycle tracking.
SURSA: PRODUCT_STRATEGY §3.10 line 137-139.
PUSH-BACK: "În curând" loose promise; specific timeline (v1.x, 6 months) better.
STATUS: pending review Daniel cross-ref Q-0444

Q-0444 [Domain 3.2 — Pregnancy Câmp manual Setări]
DECIZIE: Pregnancy câmp manual în Setări. ON → Arbitrator taie intensitate / Passive Mode.
RAȚIONAL: Safety override; passive mode sensible during pregnancy.
IMPACT dacă greșită: CATASTROFIC — push during pregnancy = harm; lawsuit + brand damage.
SURSA: PRODUCT_STRATEGY §5.4 line 188-190.
PUSH-BACK: User forgets to turn on; should detect via biometric (weight gain pattern)? Privacy concern.
STATUS: pending review Daniel cross-ref Q-0443

Q-0445 [Domain 3.2 — Heart condition Red disclaimer NOT block]
DECIZIE: Heart condition checkbox → Passive Mode + Red disclaimer screen + scroll until bottom + tap "Confirm că am clearance medical". NO nuclear block.
RAȚIONAL: Push-back #2 resolved; zero churn legitim + full liability covered.
IMPACT dacă greșită: CATASTROFIC — block legit users = churn; no friction = liability open.
SURSA: PRODUCT_STRATEGY §5.8 POST PUSH-BACK #2 line 200-206.
PUSH-BACK: Red disclaimer scroll = friction; user lies on checkbox = liability still risk.
STATUS: pending review Daniel cross-ref Q-0017

Q-0446 [Domain 3.2 — Eating disorder pattern detection FLAG + Passive Mode]
DECIZIE: Algoritm: weight drop brutal N săpt + volum maxim → FLAG + Passive Mode + "Pauză recomandată".
RAȚIONAL: Refuzăm să fim complici; safety asymmetric principle.
IMPACT dacă greșită: CATASTROFIC — silent permission = enable harm; over-aggressive flag = false positive resentment.
SURSA: PRODUCT_STRATEGY §5.5 line 191-194.
PUSH-BACK: "Brutal" undefined; specific threshold needed (e.g., -2kg/săpt × 3 săpt + max volume).
STATUS: pending review Daniel cross-ref Q-0447

Q-0447 [Domain 3.2 — Safety Asymmetric Principle health-threatening]
DECIZIE: Health-threatening (eating disorder, severe overtraining, declining strength + weight drop) → Forțează Passive Mode (AI override, NU user agency).
RAȚIONAL: Asymmetric risk; safety override > agency în health-threatening.
IMPACT dacă greșită: SEVERE — agency-respect = enable harm; over-override = paternalism.
SURSA: PRODUCT_STRATEGY §5.11 line 215-225.
PUSH-BACK: "Health-threatening" subjective; threshold articulation needed per case.
STATUS: pending review Daniel cross-ref Q-0446

Q-0448 [Domain 3.2 — Safety Asymmetric data quality issues soft warning]
DECIZIE: Data quality issues (1000kg bench, impossible numbers) → Soft warning (user agency, "Yes, sunt tanc").
RAȚIONAL: Asymmetric — data quality ≠ health-threatening; user agency preserved.
IMPACT dacă greșită: MODERATE — block on data = friction; no warning = silent corruption.
SURSA: PRODUCT_STRATEGY §5.11 line 219-221.
PUSH-BACK: 1000kg = clearly impossible; soft warning may overcompensate.
STATUS: pending review Daniel cross-ref Q-0275

Q-0449 [Domain 3.2 — Injury declared blocks group muscular]
DECIZIE: Injury declared → Arbitrator blochează acel grup muscular în PROJECTION până user scoate manual.
RAȚIONAL: Safety; user manual control resume.
IMPACT dacă greșită: SEVERE — auto-resume = re-injury; permanent block = user stuck if forgot.
SURSA: PRODUCT_STRATEGY §5.6 line 195-197.
PUSH-BACK: User forgets to remove block = chronic gap; suggest expiry / re-prompt.
STATUS: pending review Daniel cross-ref Q-0016

Q-0450 [Domain 3.2 — Medical disclaimer obligatoriu checkbox]
DECIZIE: Obligatoriu checkbox la creare cont. "SalaFull este software, nu sfat medical. Te antrenezi pe propriul risc."
RAȚIONAL: Liability shield mandatory; standard SaaS legal.
IMPACT dacă greșită: CATASTROFIC — no disclaimer = full liability; lawsuit.
SURSA: PRODUCT_STRATEGY §5.1 line 179-181.
PUSH-BACK: Checkbox tick-without-read pattern; legally weak; user may claim "didn't understand".
STATUS: pending review Daniel cross-ref Q-0451

Q-0451 [Domain 3.2 — Age 16+ minimum]
DECIZIE: Age 16+ minimum. Sub 16 = creștere osoasă, necesită antrenor fizic verificare tehnică.
RAȚIONAL: Minor safety; technical verification need beyond AI.
IMPACT dacă greșită: SEVERE — under 16 enabled = injury risk + legal; over-restrictive = lose teen segment.
SURSA: PRODUCT_STRATEGY §5.2 line 183-185.
PUSH-BACK: 16+ honor system; checkbox lies; alternate verification weak.
STATUS: pending review Daniel cross-ref Q-0452

Q-0452 [Domain 3.2 — Underage detection honor system]
DECIZIE: Honor system (checkbox). NU buletin (GDPR nightmare).
RAȚIONAL: GDPR data minimization; verification cost prohibitive.
IMPACT dacă greșită: SEVERE — false 16+ = liability; verification = privacy concern.
SURSA: PRODUCT_STRATEGY §5.3 line 186-188.
PUSH-BACK: Honor system = liability shield weak; legal review needed.
STATUS: pending review Daniel cross-ref Q-0451

Q-0453 [Domain 3.2 — Medication impact OUT_OF_SCOPE_v1.0]
DECIZIE: Medication impact OUT_OF_SCOPE_v1.0. "Prea complex legal."
RAȚIONAL: Drug interactions = medical advice; legal risk.
IMPACT dacă greșită: MINOR — feature gap; users with meds get generic recommendations.
SURSA: PRODUCT_STRATEGY §5.7 line 198-200.
PUSH-BACK: User on meds (steroids, beta-blockers, etc.) = different recovery; AI blind.
STATUS: pending review Daniel cross-ref Q-0454

Q-0454 [Domain 3.2 — Emergency contact OUT_OF_SCOPE]
DECIZIE: Emergency contact OUT_OF_SCOPE. NU sunăm noi ambulanța.
RAȚIONAL: Beyond app responsibility; user's gym responsibility.
IMPACT dacă greșită: MINOR — accident at sala = user responsibility; not app.
SURSA: PRODUCT_STRATEGY §5.9 line 207-209.
PUSH-BACK: Apple Watch fall detection precedent; users may expect; differentiation gap.
STATUS: pending review Daniel cross-ref Q-0453

#### 3.3 Onboarding flow (target 120s, multi-gym opt-in, BF estimation combo)

Q-0455 [Domain 3.3 — Onboarding target <120s]
DECIZIE: Onboarding target <120s. Minimal friction.
RAȚIONAL: First-impression critical; longer = drop-off.
IMPACT dacă greșită: SEVERE — >120s = high drop-off; <60s = info insufficient.
SURSA: HANDOVER §6.1 line 127.
PUSH-BACK: 120s ambitious considering 5-7 fields + GDPR consent + multi-gym opt-in + BF estimation; realistic 180s.
STATUS: pending review Daniel cross-ref Q-0456

Q-0456 [Domain 3.3 — Onboarding 5-7 fields max]
DECIZIE: 5-7 câmpuri MAX. Vârstă, sex, greutate, experiență, obiectiv, frecvență. Restul deducem din REALTIME.
RAȚIONAL: Minimum signal for safety caps + initial recommendation; reduce friction.
IMPACT dacă greșită: SEVERE — too few = engine blind cold start; too many = drop-off.
SURSA: PRODUCT_STRATEGY §2.1 line 75-77.
PUSH-BACK: 5-7 vague; pin exact list (5 vs 7); BF estimation combo adds 1+ field.
STATUS: pending review Daniel cross-ref Q-0455

Q-0457 [Domain 3.3 — Onboarding multi-gym opt-in]
DECIZIE: Q1 multi-gym = (b) opt-in onboarding (default 1 sală, banner subtle adăugare).
RAȚIONAL: Default simple; advanced users opt-in; minimize onboarding friction.
IMPACT dacă greșită: SEVERE — mandatory multi-gym = friction; never opt-in = power user gap.
SURSA: HANDOVER §7 Multi-Gym Q1 line 113.
PUSH-BACK: Opt-in burdens user with discovery; banner subtle may miss.
STATUS: pending review Daniel cross-ref Q-0458

Q-0458 [Domain 3.3 — BF estimation combo (a)+(b)+(c) onboarding]
DECIZIE: BF estimation combo: photo primary + optional talie/gât + skip Boer simple.
RAȚIONAL: User chooses friction vs accuracy; flexible.
IMPACT dacă greșită: SEVERE — single forced path = friction; multi-path = consistency challenge.
SURSA: HANDOVER §3 line 84-87.
PUSH-BACK: 3 paths = 3 calibration sets; downstream complexity.
STATUS: pending review Daniel cross-ref Q-0411

Q-0459 [Domain 3.3 — Onboarding Profile Typing 3-4 self-report + 1 spot-check]
DECIZIE: Self-report inițial 3-4 întrebări core în onboarding (NU 5-7) + 1 întrebare comportamentală post-prima sesiune.
RAȚIONAL: Self-report initial broad; 1 behavioral probe after session 1.
IMPACT dacă greșită: SEVERE — too many onboarding = friction; too few = thin signal.
SURSA: ADR 013 §Profile typing onboarding hybrid line 96-99.
PUSH-BACK: 3-4 vs 5-7 imprecision; should pin exact.
STATUS: pending review Daniel cross-ref Q-0309

Q-0460 [Domain 3.3 — Onboarding GDPR 3 checkboxes granular]
DECIZIE: Granular consent 3 checkboxes onboarding. Cookies/analytics/personalization.
RAȚIONAL: GDPR granular consent; respect autonomy.
IMPACT dacă greșită: CATASTROFIC — non-granular = GDPR fine; over-many = user fatigue.
SURSA: HANDOVER §5 GDPR section.
PUSH-BACK: 3 checkboxes = friction; bundle if legal allows.
STATUS: pending review Daniel cross-ref Q-0461

Q-0461 [Domain 3.3 — Onboarding skip allowed Tracker Mode]
DECIZIE: Onboarding skip allowed permanent (Modul Tracker — T0). Banner: "Pentru recomandări AI, completează profilul sau loghează 5 antrenamente."
RAȚIONAL: User control; AI features locked behind data.
IMPACT dacă greșită: MODERATE — skip permanent = user never unlocks value; aggressive prompts = user hates app.
SURSA: PRODUCT_STRATEGY §2.2 line 78; Cognitive Arch §Q17.
PUSH-BACK: "5 antrenamente" arbitrary; alternative path explicit needed.
STATUS: pending review Daniel cross-ref Q-0186

Q-0462 [Domain 3.3 — Onboarding goal Cut/Bulk/Maintain options]
DECIZIE: Goal field options: Cut, Bulk, Maintain (Strength implicit at high experience).
RAȚIONAL: Standard hipertrofie phases; cover majority cases.
IMPACT dacă greșită: SEVERE — missing Strength = power lifters mis-classified; over-options = user paralysis.
SURSA: PRODUCT_STRATEGY §2.1 line 75; Cognitive Arch §Q15 line 396.
PUSH-BACK: Hybrid users (recomp) = no option; rigid choice.
STATUS: pending review Daniel cross-ref Q-0463

Q-0463 [Domain 3.3 — Onboarding Experience tier 0/1-3y/3+y]
DECIZIE: Experience options: 0 (beginner), 1-3y (intermediate), 3+y (advanced).
RAȚIONAL: Experience-based tier mapping; cold start hint.
IMPACT dacă greșită: SEVERE — wrong tier = wrong difficulty.
SURSA: Cognitive Arch §Q15 line 397.
PUSH-BACK: Self-report experience inflated; behavioral inference better but post-N sessions.
STATUS: pending review Daniel cross-ref Q-0006

Q-0464 [Domain 3.3 — Onboarding frequency target sessions/săpt]
DECIZIE: Frequency goal field (3, 4, 5, 6 sessions/săpt). Used as PROG split template.
RAȚIONAL: User intent baseline; PROG template selection.
IMPACT dacă greșită: SEVERE — wrong template = mismatch user reality; user adapts manual.
SURSA: PRODUCT_STRATEGY §2.1 + parametric programs design.
PUSH-BACK: Beginner reports 5x/săpt = unrealistic; AI should down-weight.
STATUS: pending review Daniel cross-ref Q-0463

Q-0465 [Domain 3.3 — Onboarding sex Male/Female]
DECIZIE: Sex field Male/Female (binary, biological).
RAȚIONAL: LBM Boer formula gender-specific; physical biology relevant.
IMPACT dacă greșită: SEVERE — wrong sex = wrong LBM = wrong protein/kcal targets.
SURSA: Cognitive Arch §Q15 line 396.
PUSH-BACK: Non-binary users excluded; should support "Other" cu note + Boer fallback (avg male/female).
STATUS: pending review Daniel cross-ref Q-0407

#### 3.4 Bayesian Nutrition Inference (5 layers)

Q-0466 [Domain 3.4 — Bayesian Nutrition 5 layers comprehensive]
DECIZIE: Bayesian Nutrition Inference: Layer 1 prior, Layer 2 input, Layer 3 outlier, Layer 4 indirect signal, Layer 5 reconciliation.
RAȚIONAL: Combinazione prior + input + filter + cross-check + final.
IMPACT dacă greșită: SEVERE — single layer = noise; Bayesian rigor reduces error.
SURSA: HANDOVER §2 Bayesian Nutrition line 74-81.
PUSH-BACK: 5-layer = complex; debugging hard; alternative simpler.
STATUS: pending review Daniel cross-ref Q-0467

Q-0467 [Domain 3.4 — Bayesian Layer 5 cross-pillar reconciliation MOAT]
DECIZIE: Layer 5 reconciliation cross-pillar = MOAT (Caz A/B/C). Banner wording neutral "Verificăm contextul...".
RAȚIONAL: Cross-pillar logic = differentiator; competitor copy difficult.
IMPACT dacă greșită: SEVERE — exposing logic = anti-RE breach; honest UI when input vs reality conflict.
SURSA: HANDOVER §6 categorical display + §2 Layer 5.
PUSH-BACK: "Verificăm contextul..." vague; user may not understand discrepancy.
STATUS: pending review Daniel cross-ref Q-0410

Q-0468 [Domain 3.4 — Bayesian Caz A concordanță]
DECIZIE: Caz A: input concordant cu reality (greutate trend matches kcal claimed). High confidence; engine accepts.
RAȚIONAL: Multi-signal agreement = trust signal.
IMPACT dacă greșită: MODERATE — mis-classified = unjustified discount real signal.
SURSA: HANDOVER §2 Layer 5 Caz A line 81.
PUSH-BACK: Concordanță definition spec needed (within X% threshold?).
STATUS: pending review Daniel cross-ref Q-0469

Q-0469 [Domain 3.4 — Bayesian Caz B input claim vs reality discord]
DECIZIE: Caz B: input claim ("eat 2500 kcal") vs reality (weight gain suggests 3000 kcal). Engine adjusts internal estimate up; user confidence reduced.
RAȚIONAL: Real outcome trumps stated input; trust mathematical reality.
IMPACT dacă greșită: SEVERE — accept stated input over reality = perpetuate misperception.
SURSA: HANDOVER §2 Layer 5 Caz B line 81.
PUSH-BACK: User feels "called out" implicitly; may dismiss app.
STATUS: pending review Daniel cross-ref Q-0468

Q-0470 [Domain 3.4 — Bayesian Caz C reverse discordanță]
DECIZIE: Caz C: reverse discordanță (input low kcal but weight stable suggesting maintenance) — user under-reporting.
RAȚIONAL: Capture under-report (vs Caz B over-report); equally important.
IMPACT dacă greșită: SEVERE — miss under-report = engine thinks deficit but isn't.
SURSA: HANDOVER §2 Layer 5 Caz C line 81.
PUSH-BACK: Under-report is common pattern; hard differentiate from real maintenance.
STATUS: pending review Daniel cross-ref Q-0469

#### 3.5 Aware system thresholds (skip prompts context-aware per calibration tier)

Q-0471 [Domain 3.5 — Aware reduce 50% on N skips]
DECIZIE: 50% reduce frequency după 3× skips (COLD/INITIAL), 2× (DEVELOPING), 1× (PERSONALIZING+).
RAȚIONAL: Tiered tolerance; new user noisy skips ≠ experienced user definitive.
IMPACT dacă greșită: SEVERE — uniform = abandon early or churn; tiered = balance.
SURSA: HANDOVER §5 Aware system table line 96-101.
PUSH-BACK: Tier-based rigid; should adapt per-user.
STATUS: pending review Daniel cross-ref Q-0419

Q-0472 [Domain 3.5 — Aware suppress 7d on N skips]
DECIZIE: 7d suppress after 7× (COLD/INITIAL), 5× (DEVELOPING), 3× (PERSONALIZING+).
RAȚIONAL: Total break — week off prompts after persistent skip.
IMPACT dacă greșită: SEVERE — too lax = harassment; too strict = no signal.
SURSA: HANDOVER §5 line 99.
PUSH-BACK: 7d break may miss critical signal mid-window.
STATUS: pending review Daniel cross-ref Q-0471

Q-0473 [Domain 3.5 — Aware off permanent on N skips]
DECIZIE: Off permanent after 15× (COLD/INITIAL), 10× (DEVELOPING), 5× (PERSONALIZING+).
RAȚIONAL: Accept persistent decline; respect user agency.
IMPACT dacă greșită: SEVERE — never re-prompt = miss future opportunity; should auto-expire.
SURSA: HANDOVER §5 line 100.
PUSH-BACK: "Permanent" final; expire on context change (new injury, new goal).
STATUS: pending review Daniel cross-ref Q-0195

Q-0474 [Domain 3.5 — Aware reset 30 zile fără skip]
DECIZIE: 30 zile fără skip = counter reset.
RAȚIONAL: Behavior change rewarded; long-stable behavior re-evaluated fresh.
IMPACT dacă greșită: MODERATE — too aggressive = no learning; never = old friction stays.
SURSA: HANDOVER §5 line 102.
PUSH-BACK: 30 zile arbitrary; should tie to calibration tier transitions or major life events.
STATUS: pending review Daniel cross-ref Q-0188

#### 3.6 Voice input — REJECTED, why?

Q-0475 [Domain 3.6 — Voice input "cine drq vrea sa urle"]
DECIZIE: Voice input REJECTED. Daniel quote.
RAȚIONAL: Sala loud; voice-to-text inaccurate; UX hostile.
IMPACT dacă greșită: MINOR — feature gap; competitors may add later.
SURSA: HANDOVER §11 P6 line 149; PRODUCT_STRATEGY §2.9 line 96-98.
PUSH-BACK: Some hands-free use cases legit (chalked hands); niche but real.
STATUS: pending review Daniel cross-ref Q-0414

Q-0476 [Domain 3.6 — Voice "Never" until LLM multimodal zero latency]
DECIZIE: Voice "Never" pana LLM-uri devin nativ multimodal cu zero latency mobil.
RAȚIONAL: Tech maturity dependency; quality bar high.
IMPACT dacă greșită: MINOR — perpetual deferral; never deliver.
SURSA: PRODUCT_STRATEGY §10.8 line 397-399.
PUSH-BACK: "Never" word strong; feature parity competitors may force adoption.
STATUS: pending review Daniel cross-ref Q-0475

Q-0477 [Domain 3.6 — Voice input gimmick rejected]
DECIZIE: Voice = gimmick. Lumea ascultă muzică, e zgomot, voice-to-text e hell.
RAȚIONAL: Real-world friction; gym environment hostile to voice.
IMPACT dacă greșită: MODERATE — niche users want; gym noise reality.
SURSA: PRODUCT_STRATEGY §2.9 line 97-98.
PUSH-BACK: Headset Bluetooth STT improving; accessibility considerations.
STATUS: pending review Daniel cross-ref Q-0475

Q-0478 [Domain 3.6 — RPE 4-tap as voice replacement]
DECIZIE: RPE 4-tap selective replaces voice need; quick tap interaction.
RAȚIONAL: Tap faster than voice; 4-options chosen via single tap each.
IMPACT dacă greșită: MODERATE — 4-tap acceptable; 1-slider faster.
SURSA: HANDOVER §11 P1 line 145.
PUSH-BACK: 4-tap = 4 visual targets in flow; mid-set distraction.
STATUS: pending review Daniel cross-ref Q-0424

Q-0479 [Domain 3.6 — Streak tracking ANTI-PATTERN]
DECIZIE: Streak tracking ANTI-PATTERN. Nu vrem user la sală dacă REALTIME zice "obosit". Recompensăm consistență pe program, NU zile consecutive.
RAȚIONAL: Health > engagement metrics; streak gamification = injury risk.
IMPACT dacă greșită: SEVERE — streaks feed gamification ego = overtraining; abandoning streak feature = lose engagement.
SURSA: PRODUCT_STRATEGY §4.5 line 156-159.
PUSH-BACK: Streak tracking common motivator; absence = engagement gap; "consistency on program" abstract.
STATUS: pending review Daniel cross-ref Q-0480

Q-0480 [Domain 3.6 — Comparison exclusiv with self]
DECIZIE: Comparison exclusiv with self. Leaderboards = ego-lifting + accidentări.
RAȚIONAL: Health > competition; vs-self motivation safer.
IMPACT dacă greșită: SEVERE — leaderboards = ego push = injury; absence = engagement gap.
SURSA: PRODUCT_STRATEGY §4.6 line 160-162.
PUSH-BACK: Leaderboards engagement strong; competitor advantage.
STATUS: pending review Daniel cross-ref Q-0479

Q-0481 [Domain 3.6 — Achievement badges doar praguri fizice]
DECIZIE: Achievement badges doar praguri fizice reale (1× Bodyweight Bench, 2× Bodyweight Deadlift). Fără badges "ai deschis app 3 zile la rând".
RAȚIONAL: Real milestones; no engagement-bait gamification.
IMPACT dacă greșită: SEVERE — engagement-bait = brand damage; real milestones = motivating.
SURSA: PRODUCT_STRATEGY §6.5 line 242-244.
PUSH-BACK: Bodyweight ratios = beginner exclusion; need progressive milestones.
STATUS: pending review Daniel cross-ref Q-0480

Q-0482 [Domain 3.6 — Social sharing IG Workout Card scoatem]
DECIZIE: SCOATEM IG Workout Card. Lux discret + IG Share = mutual exclusive. "Dark horse fitness apps."
RAȚIONAL: Brand identity preservation; word-of-mouth via email digest.
IMPACT dacă greșită: SEVERE — IG share viral marketing; absence = growth slow; brand alignment.
SURSA: PRODUCT_STRATEGY §6.6 POST PUSH-BACK #4 line 246-248.
PUSH-BACK: Viral growth strong on IG; "dark horse" niche may limit.
STATUS: pending review Daniel cross-ref Q-0483

Q-0483 [Domain 3.6 — Buddy system OUT_OF_SCOPE_v1.0]
DECIZIE: Buddy system OUT_OF_SCOPE_v1.0.
RAȚIONAL: Social complexity; not core; deferred.
IMPACT dacă greșită: MINOR — feature gap; competitors offer.
SURSA: PRODUCT_STRATEGY §6.7 line 251.
PUSH-BACK: Buddy system retention strong; absence = retention loss.
STATUS: pending review Daniel cross-ref Q-0482

Q-0484 [Domain 3.6 — Coach availability 2AM warning soft]
DECIZIE: User începe antrenament 2 AM → REALTIME warning soft: "Antrenament târziu. Poate afecta somnul." DAR îl lasă.
RAȚIONAL: User agency; advisory NOT block.
IMPACT dacă greșită: SEVERE — block = paternal; no warning = silent enable.
SURSA: PRODUCT_STRATEGY §6.8 line 253-254.
PUSH-BACK: "Soft" subjective; what trigger time exactly (10pm?, 2am only?).
STATUS: pending review Daniel cross-ref Q-0485

Q-0485 [Domain 3.6 — Vacation mode toggle Setări]
DECIZIE: Vacation mode toggle setări "Pause adaptation". HISTORICAL ignoră fereastra (NU pedepsește decay artificial).
RAȚIONAL: Honest acknowledgment vacation; no penalty.
IMPACT dacă greșită: SEVERE — auto-decay during vacation = punishment; no toggle = forced manual reset.
SURSA: PRODUCT_STRATEGY §6.9 line 256-257.
PUSH-BACK: User forgets to disable on return = engine pretends nothing happened.
STATUS: pending review Daniel cross-ref Q-0184

Q-0486 [Domain 3.6 — Re-engagement 14 zile pause email onest]
DECIZIE: După 14 zile pauză → 1 mail onest: "Săptămâna deload/pauză s-a terminat. Reconfigurăm de la nivel mai jos?"
RAȚIONAL: Honest re-entry; no guilt-tripping.
IMPACT dacă greșită: MODERATE — silence = lose user; spam = brand damage.
SURSA: PRODUCT_STRATEGY §6.10 line 259-260.
PUSH-BACK: 14 zile threshold arbitrary; user may want longer pause.
STATUS: pending review Daniel cross-ref Q-0485

Q-0487 [Domain 3.6 — PR celebration subtle confetti haptic]
DECIZIE: Subtle confetti + haptic feedback. Bugatti = lux discret, NU lasere și sunete cazino.
RAȚIONAL: Aesthetic alignment; reward without overwhelm.
IMPACT dacă greșită: MINOR — over-celebration = cringe; under = no recognition.
SURSA: PRODUCT_STRATEGY §2.11 line 103-105.
PUSH-BACK: "Subtle" subjective; spec needed (confetti duration, count, haptic strength).
STATUS: pending review Daniel cross-ref Q-0481

Q-0488 [Domain 3.6 — Notifications 1 contextual permitted]
DECIZIE: 1 push notification permis, contextuală. "Engine-ul a pregătit sesiunea ta de Push. O începem?"
RAȚIONAL: Marketing Spam vs Actionable Utility distinction.
IMPACT dacă greșită: SEVERE — spam = brand damage; no notification = engagement loss.
SURSA: PRODUCT_STRATEGY §11.4 line 432-436.
PUSH-BACK: 1 notification limit may starve engagement; should be context-driven not count-capped.
STATUS: pending review Daniel cross-ref Q-0489

Q-0489 [Domain 3.6 — Email digest weekly Mesocycle Review]
DECIZIE: Săptămânal "Mesocycle Review". Bugatti engagement: analiză date frumos formatată, trimisă pe mail duminică.
RAȚIONAL: Recurring email retention; weekly cadence reasonable.
IMPACT dacă greșită: MODERATE — weekly heavy = unsubscribe; less frequent = miss engagement.
SURSA: PRODUCT_STRATEGY §6.3 line 235-237.
PUSH-BACK: Sunday timing may miss; user-configurable better.
STATUS: pending review Daniel cross-ref Q-0488

Q-0490 [Domain 3.6 — Challenges OUT_OF_SCOPE]
DECIZIE: Challenges OUT_OF_SCOPE. Gimmick gamificare ieftină.
RAȚIONAL: Brand alignment; quality > gimmicks.
IMPACT dacă greșită: MINOR — engagement gap; competitor advantage.
SURSA: PRODUCT_STRATEGY §6.4 line 240-241.
PUSH-BACK: Challenges resonant motivator; absence = retention gap.
STATUS: pending review Daniel cross-ref Q-0491

Q-0491 [Domain 3.6 — Humor EXCLUS]
DECIZIE: Humor EXCLUS. Într-o aplicație de lux, umorul devine cringe la a treia citire.
RAȚIONAL: Bugatti tonal alignment.
IMPACT dacă greșită: MINOR — humor adds personality; absence = clinical.
SURSA: PRODUCT_STRATEGY §4.9 line 169-170.
PUSH-BACK: Humor differentiator; brand voice opportunity.
STATUS: pending review Daniel cross-ref Q-0492

Q-0492 [Domain 3.6 — Cultural norms neutru global]
DECIZIE: Neutru global. Traducere pe sens matematic/sportiv, NU slang.
RAȚIONAL: i18n consistency; avoid cultural drift.
IMPACT dacă greșită: MINOR — too neutral = bland; too cultural = exclusion.
SURSA: PRODUCT_STRATEGY §4.10 line 172-173.
PUSH-BACK: RO + EN already; cultural nuance differs; "neutral" hard.
STATUS: pending review Daniel cross-ref Q-0491

Q-0493 [Domain 3.6 — Coach personality Neutral concis analitic]
DECIZIE: Personalitate Neutral, concis, analitic. Antrenor olimpic, NU cheerleader de aerobic.
RAȚIONAL: Quality alignment; user trust serious.
IMPACT dacă greșită: SEVERE — too neutral = cold; too friendly = unprofessional.
SURSA: PRODUCT_STRATEGY §4.1 line 144-145.
PUSH-BACK: "Olimpic" subjective; spec voice library needed.
STATUS: pending review Daniel cross-ref Q-0494

Q-0494 [Domain 3.6 — Coach tonalitate profesional dar nu corporatist]
DECIZIE: Profesional dar nu corporatist. Direct. Exemplu: "Rămâi la 80kg azi."
RAȚIONAL: Direct = clarity; not robotic.
IMPACT dacă greșită: MODERATE — too formal = stiff; too casual = unprofessional.
SURSA: PRODUCT_STRATEGY §4.2 line 147-148.
PUSH-BACK: Examples specific; tone library scaling.
STATUS: pending review Daniel cross-ref Q-0493

Q-0495 [Domain 3.6 — Motivational messages niciodată prefabricat]
DECIZIE: Niciodată prefabricat. Doar la milestones reali. "Ai spart bariera de 100kg. Excelent."
RAȚIONAL: Milestone-based; avoid generic.
IMPACT dacă greșită: SEVERE — generic motivation = noise; absence = cold.
SURSA: PRODUCT_STRATEGY §4.3 line 150-151.
PUSH-BACK: Milestones rare events; engagement window narrow.
STATUS: pending review Daniel cross-ref Q-0481

Q-0496 [Domain 3.6 — Coach negative feedback analitic]
DECIZIE: Analitic. Cedezi squat? "Am notat RPE 10 și failure. Ajustăm greutatea la 75kg pt următorul set."
RAȚIONAL: Data-driven response; no shame.
IMPACT dacă greșită: SEVERE — emotional response = ego damage; analytical = trust building.
SURSA: PRODUCT_STRATEGY §4.4 line 153-155.
PUSH-BACK: Analytical voice cold; some users want validation; balance.
STATUS: pending review Daniel cross-ref Q-0494

Q-0497 [Domain 3.6 — Question-based check-ins 3 sesiuni scădere]
DECIZIE: Doar dacă HISTORICAL detectează 3 sesiuni scădere pe același mușchi → "Ai dureri articulare aici?"
RAȚIONAL: Targeted check-in; signal-driven; safety query.
IMPACT dacă greșită: SEVERE — too many = friction; too few = miss injury.
SURSA: PRODUCT_STRATEGY §4.8 line 166-167.
PUSH-BACK: 3 sesiuni threshold arbitrary; per-user context different.
STATUS: pending review Daniel cross-ref Q-0498

Q-0498 [Domain 3.6 — Explain decision ALWAYS ON [i] button]
DECIZIE: ALWAYS ON. Buton [i] sub fiecare decizie. Mapăm rationale_codes la text clar.
RAȚIONAL: Generează trust massiv; transparency.
IMPACT dacă greșită: SEVERE — opaque = trust erosion; too explain = clutter.
SURSA: PRODUCT_STRATEGY §4.7 line 162-165.
PUSH-BACK: 100-150+ rationale codes × 2 limbi = maintenance burden.
STATUS: pending review Daniel cross-ref Q-0025

Q-0499 [Domain 3.6 — Onboarding RPE optional Default blank]
DECIZIE: RPE Optional dar heavily encouraged. Default blank (NU confirm orb).
RAȚIONAL: Honest blank > false confirmation; PROJECTION uses math fallback if blank.
IMPACT dacă greșită: SEVERE — auto-confirm = false data; blank = no signal.
SURSA: PRODUCT_STRATEGY §2.5 line 84-86.
PUSH-BACK: Encouraged optional = mostly skipped; signal weak.
STATUS: pending review Daniel cross-ref Q-0429

Q-0500 [Domain 3.6 — Session abandon recovery 2h prompt]
DECIZIE: Peste 2h → UI prompt "Ai lăsat sesiunea deschisă. Închidem retroactiv sau continui?"
RAȚIONAL: Abandoned session detection; user option.
IMPACT dacă greșită: SEVERE — auto-close = lost data; never close = open forever.
SURSA: PRODUCT_STRATEGY §2.10 line 100-101.
PUSH-BACK: 2h hardcoded; gym session legit 90min + commute = >2h sometimes.
STATUS: pending review Daniel cross-ref Q-0265

---

**BATCH 1 PARTIAL — Q0001-Q0500 COMPLETE** (target was Q1000; quality > quantity per prompt directive)

Note pacing: Domain 1 (Engine) Q1-Q320 detailed; Domain 2 (Storage) Q321-Q400; Domain 3 (User Input) Q401-Q500. Per directive "4200 quality > 5000 junk", Batch 1 yields ~500 high-quality Q.

---

## BATCH 2 — Strategy + GDPR + UX (Q0501-Q1000)

### DOMAIN 4: PRODUCT STRATEGY & MONETIZATION

#### 4.1 Target audience (beginner până la avansat 10 ani — single product)

Q-0501 [Domain 4.1 — Single product spans beginner-advanced]
DECIZIE: Single product covers beginner to advanced (10+ ani exp). NOT separate apps per tier.
RAȚIONAL: Calibration tiers + dimensions adapt; reduce SKU complexity.
IMPACT dacă greșită: SEVERE — fragmentation = 3 products to maintain; single = "jack of all" risk.
SURSA: HANDOVER §6 UI Tabs implicit; ADR 009 calibration tiers.
PUSH-BACK: Beginner needs different UX than advanced; single risks alienating both.
STATUS: pending review Daniel cross-ref Q-0502

Q-0502 [Domain 4.1 — RO+EN simultaneous launch]
DECIZIE: RO + EN simultaneously. i18n decoupled from Arbitrator.
RAȚIONAL: RO feedback loop rapid; EN piața globală.
IMPACT dacă greșită: SEVERE — RO only = limited; EN only = lose home market.
SURSA: PRODUCT_STRATEGY §1.1 line 25-26; §10.10 RO+EN exclusive v1.0.
PUSH-BACK: Dual launch = double translation maintenance; RO market < 5M; EN market 1B+.
STATUS: pending review Daniel cross-ref Q-0503

Q-0503 [Domain 4.1 — Tech-lifter primii adopters natural]
DECIZIE: First 100 users: Daniel + rețea + forumuri lifters unde explici arhitectura aplicației, NU UI-ul.
RAȚIONAL: Tech-lifters appreciate engine depth; differentiation message resonates.
IMPACT dacă greșită: SEVERE — wrong audience = no traction; right audience = evangelists.
SURSA: PRODUCT_STRATEGY §1.10 line 66-68.
PUSH-BACK: Niche audience small; generalize later harder.
STATUS: pending review Daniel cross-ref Q-0504

Q-0504 [Domain 4.1 — Founding Members lifetime Pro 100-500]
DECIZIE: Lifetime Pro pentru primii 100-500 useri. Mișcare șah-mat.
RAȚIONAL: Loyalty engineering; armată evangheliști loiali; iartă bug-uri v1.0.
IMPACT dacă greșită: SEVERE — too few = no community; too many = revenue cannibalize.
SURSA: PRODUCT_STRATEGY §11.2 line 421-424.
PUSH-BACK: 100-500 range wide; cutoff criterion needed (date-based? quality-based?).
STATUS: pending review Daniel cross-ref Q-0505

Q-0505 [Domain 4.1 — Vânăm balene 10-20 antrenori]
DECIZIE: 10-20 antrenori respectați / powerlifteri geeks. Conturi Pro lifetime gratuite. NU promo cerută. "Just use the Arbitrator."
RAȚIONAL: Tech-lifter influencer = inflection point; engineer-to-engineer language.
IMPACT dacă greșită: SEVERE — wrong balene = no resonance; right = cult following.
SURSA: PRODUCT_STRATEGY §11.1 line 411-417; §11.3 line 425-431.
PUSH-BACK: 10-20 specific list lipsă; "respectați" subjective; hand-pick risk.
STATUS: pending review Daniel cross-ref Q-0504

#### 4.2 Pricing tier strategy

Q-0506 [Domain 4.2 — Free + 1 Pro tier NOT 3 tiere]
DECIZIE: Free + Pro (1 paid). NU 3 tiere (paralizează decizia user).
RAȚIONAL: Decision simplicity > tier complexity.
IMPACT dacă greșită: SEVERE — 3 tiere = decision paralysis; single = mid-market trap.
SURSA: PRODUCT_STRATEGY §1.2 line 28-30.
PUSH-BACK: 3-tier (Basic/Pro/Premium) industry standard; Pro mid-pricing tap.
STATUS: pending review Daniel cross-ref Q-0507

Q-0507 [Domain 4.2 — Pricing 10-12€/lună sau 100€/an]
DECIZIE: ~10-12€/lună sau 100€/an. Sub 10€ = "pare ieftin"; peste 15€ = competiție directă antrenori.
RAȚIONAL: Mid-market positioning; sweet spot.
IMPACT dacă greșită: SEVERE — too low = brand cheap; too high = churn.
SURSA: PRODUCT_STRATEGY §1.3 line 32-35.
PUSH-BACK: 10-12€ vs 100€/an = 17% annual discount; standard 20%.
STATUS: pending review Daniel cross-ref Q-0508

Q-0508 [Domain 4.2 — Annual prepay discount 20% off]
DECIZIE: 20% off annual. Cash flow upfront.
RAȚIONAL: Lock-in retention; cash flow.
IMPACT dacă greșită: MODERATE — too aggressive = monthly users feel cheated; too small = no incentive.
SURSA: PRODUCT_STRATEGY §8.5 line 320-321.
PUSH-BACK: 100€/an = ~17% off 12€×12=144€; spec inconsistent.
STATUS: pending review Daniel cross-ref Q-0507

Q-0509 [Domain 4.2 — Freemium permanent NU trial]
DECIZIE: Freemium permanent cu caps (paywall pe modulele avansate VITALITY/PROJECTION advanced). NU time-gated trial.
RAȚIONAL: Lower barrier; paywall on value depth.
IMPACT dacă greșită: SEVERE — trial = users churn at expiry; freemium = no urgency convert.
SURSA: PRODUCT_STRATEGY §1.4 line 36-37.
PUSH-BACK: Freemium = many free riders; trial converts faster.
STATUS: pending review Daniel cross-ref Q-0510

Q-0510 [Domain 4.2 — Paywall pe data sources NU pe quality decision]
DECIZIE: Core arhitectură SAME pentru toți. Paywall pe data sources (Apple Health, Wearables) și UI insights (4-week projection). Useri free NU sabotați.
RAȚIONAL: Ethical paywall; engine quality not gated.
IMPACT dacă greșită: SEVERE — gating engine = users feel sabotaged; gating only luxury = no incentive.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q19 line 419-422.
PUSH-BACK: Paywall on data sources = Apple Health users gated; mobile-first contradiction.
STATUS: pending review Daniel cross-ref Q-0509

Q-0511 [Domain 4.2 — Refund 14 zile no questions]
DECIZIE: 14 zile, no questions asked. Elimină frica plată anuală.
RAȚIONAL: Trust signal; reduces purchase friction.
IMPACT dacă greșită: SEVERE — no refund = legal issues + brand damage; too generous = abuse.
SURSA: PRODUCT_STRATEGY §8.3 line 314-315.
PUSH-BACK: 14 zile insufficient pe annual (full plan unfolding); 30 days standard.
STATUS: pending review Daniel cross-ref Q-0512

Q-0512 [Domain 4.2 — Cancellation 1-click in app]
DECIZIE: 1-click în aplicație (Stripe portal). Fricțiunea cancelare = Dacie ruginită.
RAȚIONAL: Brand trust; user agency.
IMPACT dacă greșită: SEVERE — friction = legal issues (EU consumer protection); 1-click = high churn risk.
SURSA: PRODUCT_STRATEGY §8.4 line 317-318.
PUSH-BACK: Stripe portal external = brand inconsistency.
STATUS: pending review Daniel cross-ref Q-0511

Q-0513 [Domain 4.2 — No student/military discount]
DECIZIE: Fără discount student/military. "Softul ori merită banii, ori e free tier."
RAȚIONAL: Pricing simplicity; freemium covers.
IMPACT dacă greșită: MINOR — small audience exclusion; brand position.
SURSA: PRODUCT_STRATEGY §8.6 line 322-323.
PUSH-BACK: Student/military discounts goodwill; competitor advantage.
STATUS: pending review Daniel cross-ref Q-0514

Q-0514 [Domain 4.2 — Affiliate program none v1.0]
DECIZIE: Fără v1.0. Influencer outreach = "ia și folosește, dacă-ți place arată-l", NU 30% comision.
RAȚIONAL: Avoid pay-to-play; organic word-of-mouth.
IMPACT dacă greșită: MODERATE — no affiliate = slower growth; affiliate = scale viral.
SURSA: PRODUCT_STRATEGY §8.7 line 325-326.
PUSH-BACK: Affiliate scale common; absence growth gap.
STATUS: pending review Daniel cross-ref Q-0513

Q-0515 [Domain 4.2 — Pro pause graceful downgrade]
DECIZIE: Pro pause downgrade Free graceful. Date avansate înghețate, NU șterse. Arbitrator folosește doar module Free.
RAȚIONAL: User option preserved; data retention.
IMPACT dacă greșită: SEVERE — data lost = user fury; preserved = re-upgrade easier.
SURSA: PRODUCT_STRATEGY §9.6 line 357-359.
PUSH-BACK: "Înghețat dar nu șters" spec needed (timeline? GDPR delete trigger?).
STATUS: pending review Daniel cross-ref Q-0511

#### 4.3 RO vs EN audience priority

Q-0516 [Domain 4.3 — RO feedback loop rapid prim]
DECIZIE: RO = feedback loop rapid (Daniel rețea); EN = piața globală.
RAȚIONAL: RO testers accessible; EN scale.
IMPACT dacă greșită: SEVERE — RO only = limited; EN only = no immediate testers.
SURSA: PRODUCT_STRATEGY §1.1 line 25-26.
PUSH-BACK: Both languages launch = double effort minimal users.
STATUS: pending review Daniel cross-ref Q-0502

Q-0517 [Domain 4.3 — i18n architecture decoupled]
DECIZIE: i18n bundle decoupled from Arbitrator. JSON resources Frontend.
RAȚIONAL: Engine pure; UI translates.
IMPACT dacă greșită: SEVERE — coupling = engine deploy for translation fix; clutter logic.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 PARTEA 8 §Q5 line 327-330.
PUSH-BACK: Hardcoded enums + JSON = 2 sources truth; sync risk.
STATUS: pending review Daniel cross-ref Q-0026

Q-0518 [Domain 4.3 — Locale auto-detect + override dropdown]
DECIZIE: Auto-detect locale (navigator.language) + user override dropdown.
RAȚIONAL: Default sensible; user agency.
IMPACT dacă greșită: MINOR — wrong default = quick fix override.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q5 line 329; HANDOVER §4 Kg/Lbs default detection.
PUSH-BACK: navigator.language unreliable on some browsers.
STATUS: pending review Daniel cross-ref Q-0413

Q-0519 [Domain 4.3 — RO base language no slang]
DECIZIE: RO = neutru, mathematic/sportiv. NU slang.
RAȚIONAL: i18n consistency cross-locale; brand professional.
IMPACT dacă greșită: MINOR — too formal = stiff; slang = exclusion.
SURSA: PRODUCT_STRATEGY §4.10 line 172-173.
PUSH-BACK: Slang relatable; trade-off.
STATUS: pending review Daniel cross-ref Q-0492

Q-0520 [Domain 4.3 — EN = international English NU US slang]
DECIZIE: EN = international English; avoid US-specific terms.
RAȚIONAL: Global audience; cultural neutral.
IMPACT dacă greșită: MINOR — US-specific = exclusion globally; international = bland.
SURSA: implicit PRODUCT_STRATEGY §4.10.
PUSH-BACK: International EN bland; differentiation hard.
STATUS: pending review Daniel cross-ref Q-0519

#### 4.4 Bootstrap fără VC — sustainability

Q-0521 [Domain 4.4 — Bootstrap NU VC]
DECIZIE: Bootstrap fără VC. Sustainability over speed.
RAȚIONAL: Quality > velocity; Bugatti standard preserved; ownership.
IMPACT dacă greșită: SEVERE — VC pressure = compromise quality; bootstrap = slow growth.
SURSA: PRODUCT_STRATEGY implicit §1.1; HANDOVER product strategy.
PUSH-BACK: VC funding accelerates 5×; bootstrap = limit infrastructure / hires.
STATUS: pending review Daniel cross-ref Q-0522

Q-0522 [Domain 4.4 — Plan B 18-24 luni 1000 MAU acceptabil]
DECIZIE: Plan B 18-24 luni la 1,000 MAU acceptabil (NU compromite Bugatti pentru velocity).
RAȚIONAL: Quality > speed permanent rule.
IMPACT dacă greșită: SEVERE — pressure compromise = lose differentiation; tolerance = sustainable.
SURSA: PRODUCT_STRATEGY §10.1 line 376-378.
PUSH-BACK: 18-24 luni runway = personal financial; varies per founder.
STATUS: pending review Daniel cross-ref Q-0521

Q-0523 [Domain 4.4 — NO paid ads corrupt ML training]
DECIZIE: NU paid ads (high-churn users → corrupt ML training data).
RAȚIONAL: Long-term ML training value > short-term acquisition.
IMPACT dacă greșită: SEVERE — paid ads = quick scale BUT corrupt baseline; organic = slow but clean.
SURSA: PRODUCT_STRATEGY §1.9 line 60-65.
PUSH-BACK: Targeted ads to quality audience minimize churn; blanket avoidance overgeneralized.
STATUS: pending review Daniel cross-ref Q-0524

Q-0524 [Domain 4.4 — Organic word-of-mouth principal]
DECIZIE: Organic word-of-mouth (din rezultate reale). Content fitness foarte nișat.
RAȚIONAL: Real users = real testimonials; niche resonates strong.
IMPACT dacă greșită: MODERATE — organic slow; differentiation strong.
SURSA: PRODUCT_STRATEGY §1.9 line 60-64.
PUSH-BACK: Word-of-mouth slow; needs critical mass first.
STATUS: pending review Daniel cross-ref Q-0523

Q-0525 [Domain 4.4 — Content niche tech-lifters]
DECIZIE: Content fitness foarte nișat pe mecanica antrenamentului inteligent.
RAȚIONAL: Tech-lifters audience matches; niche depth.
IMPACT dacă greșită: SEVERE — too generic = no resonance; niche = right adopters.
SURSA: PRODUCT_STRATEGY §1.9 line 62-63.
PUSH-BACK: Niche limits mass appeal; later expansion challenge.
STATUS: pending review Daniel cross-ref Q-0524

#### 4.5 Orizont 2-3 ani milestone product-market fit

Q-0526 [Domain 4.5 — Timeline 2-3 ani]
DECIZIE: Timeline 2-3 ani. Bugatti permanent rule.
RAȚIONAL: Quality > velocity; sustainable bootstrap.
IMPACT dacă greșită: SEVERE — accelerate = compromise; over-conservative = miss market window.
SURSA: PRODUCT_STRATEGY §1.1 implicit + §10.1 line 378.
PUSH-BACK: Fitness app market crowded; 2-3 ani = competitor catches up.
STATUS: pending review Daniel cross-ref Q-0521

Q-0527 [Domain 4.5 — Soft launch RO friends 30-50]
DECIZIE: Soft launch RO friends/beta testers (30-50 oameni).
RAȚIONAL: Phase 1 testing; manageable feedback.
IMPACT dacă greșită: SEVERE — too few = limited signal; too many = noise.
SURSA: PRODUCT_STRATEGY §1.8 line 55-58.
PUSH-BACK: 30-50 small dataset; pattern detection limited.
STATUS: pending review Daniel cross-ref Q-0528

Q-0528 [Domain 4.5 — Shadow Run cognitive parallel vechi]
DECIZIE: Shadow Run (cognitive architecture parallel cu vechi). Phase 2.
RAȚIONAL: Verify NEW engine without risking users on vechi engine.
IMPACT dacă greșită: SEVERE — without shadow = NEW ship blind; with = compute 2× temporarily.
SURSA: PRODUCT_STRATEGY §1.8 line 56-57; Cognitive Arch §Q4.
PUSH-BACK: 2× compute during transition; cost.
STATUS: pending review Daniel cross-ref Q-0045

Q-0529 [Domain 4.5 — Bug fix polish Product Hunt global]
DECIZIE: Bug fix + polish → Product Hunt global. Phase 3.
RAȚIONAL: Big public launch when polished; global reach via Product Hunt.
IMPACT dacă greșită: SEVERE — premature launch = bad reviews; perfectionism = miss window.
SURSA: PRODUCT_STRATEGY §1.8 line 56-58.
PUSH-BACK: Product Hunt single day visibility; sustainable growth needs more.
STATUS: pending review Daniel cross-ref Q-0527

Q-0530 [Domain 4.5 — ML training threshold 50000 sessions]
DECIZIE: 50,000 sessions logate complete (end-to-end). Până atunci = Rule-Based strict.
RAȚIONAL: ML needs scale; rule-based interpretable now.
IMPACT dacă greșită: SEVERE — premature ML = bad classifier; deferred too far = stagnation.
SURSA: PRODUCT_STRATEGY §10.4 line 386-388.
PUSH-BACK: 50K sessions = ~250 active users × 200 sesiuni/an; far horizon.
STATUS: pending review Daniel cross-ref Q-0242

#### 4.6 Daniel CEO + Product, Claude Co-CTO division of labor

Q-0531 [Domain 4.6 — Daniel CEO + Product role]
DECIZIE: Daniel = CEO + Product. Claude = Co-CTO via stress test session.
RAȚIONAL: Daniel architecture mature thinker; Claude technical depth.
IMPACT dacă greșită: SEVERE — role confusion = decision drift; clear = aligned execution.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 metadata line 7; PRODUCT_STRATEGY metadata line 5.
PUSH-BACK: Co-CTO partnership informal; ownership ambiguity legal.
STATUS: pending review Daniel cross-ref Q-0532

Q-0532 [Domain 4.6 — Daniel cognitive state IQ 139 ADHD 2e]
DECIZIE: Daniel cognitive output documented: IQ 139 + ADHD 2e Disruptive Innovator profile. Hyperfocus 2× normal arhitect senior productivity.
RAȚIONAL: Self-awareness; productivity ratio realistic; hyperfocus respected.
IMPACT dacă greșită: MINOR — internal documentation; affects time estimation.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 metadata line 472-477.
PUSH-BACK: Self-disclosed profile; verification not relevant.
STATUS: pending review Daniel cross-ref Q-0533

Q-0533 [Domain 4.6 — Customer support Discord gated paid]
DECIZIE: Discord GATED (Premium Perk) + Email pentru billing. Phase 0-500 users open; Phase 500+ paid + voluntary mods.
RAȚIONAL: Daniel time = code, NU customer support; gated filter zgomot.
IMPACT dacă greșită: SEVERE — open Discord = Daniel time sink; gated = paid value.
SURSA: PRODUCT_STRATEGY §8.1 line 304-309.
PUSH-BACK: Discord Premium Perk = entry-level user no support; refunds question.
STATUS: pending review Daniel cross-ref Q-0534

Q-0534 [Domain 4.6 — Daniel role "The Architect" Discord]
DECIZIE: Daniel role = "The Architect". Răspunde #announcements + Q&A lunar.
RAȚIONAL: Brand voice; founder presence; not customer support.
IMPACT dacă greșită: MINOR — Daniel availability variable.
SURSA: PRODUCT_STRATEGY §8.1 line 308-309.
PUSH-BACK: "Lunar Q&A" sets expectations; missed = brand damage.
STATUS: pending review Daniel cross-ref Q-0533

Q-0535 [Domain 4.6 — Response SLA <48h business days]
DECIZIE: <48h business days. "Ești om, nu corporație call center India."
RAȚIONAL: Realistic; founder bandwidth; quality response.
IMPACT dacă greșită: MODERATE — slower = brand damage; faster = founder burnout.
SURSA: PRODUCT_STRATEGY §8.2 line 311-312.
PUSH-BACK: 48h on weekend / vacation = unpredictable; auto-acknowledgment needed.
STATUS: pending review Daniel cross-ref Q-0533

Q-0536 [Domain 4.6 — Press kit Drive folder HD assets]
DECIZIE: Folder Drive / micro-site cu assets HD pentru media.
RAȚIONAL: Media-ready when needed; minimal effort upfront.
IMPACT dacă greșită: MINOR — no kit = miss press opportunity.
SURSA: PRODUCT_STRATEGY §8.8 line 328-329.
PUSH-BACK: Press kit assets need updating; maintenance.
STATUS: pending review Daniel cross-ref Q-0537

Q-0537 [Domain 4.6 — Analytics Plausible no cookies]
DECIZIE: Plausible. Lightweight, no cookies, no personal data, ethic Bugatti.
RAȚIONAL: Privacy-respecting; aligns brand; GDPR friendly.
IMPACT dacă greșită: MINOR — Plausible vs Google Analytics = depth tradeoff.
SURSA: PRODUCT_STRATEGY §8.9 line 331-333.
PUSH-BACK: Plausible less feature-rich than Google; data-driven decisions weaker.
STATUS: pending review Daniel cross-ref Q-0538

Q-0538 [Domain 4.6 — Sentry crash reporting must-have]
DECIZIE: Sentry (already setup). Must-have ca să vezi de ce a murit Arbitratorul.
RAȚIONAL: Production observability; debugging.
IMPACT dacă greșită: SEVERE — no crash reporting = blind to production bugs.
SURSA: PRODUCT_STRATEGY §8.10 line 335-336.
PUSH-BACK: Sentry costs at scale; budget.
STATUS: pending review Daniel cross-ref Q-0292

Q-0539 [Domain 4.6 — Exit strategy "Build forever, sell if life-changing"]
DECIZIE: "Build it like you'll own it forever, sell it if Whoop or Strava offers life-changing money for your ML Arbitrator engine."
RAȚIONAL: Long-term mindset; sale opportunity if offered.
IMPACT dacă greșită: MINOR — philosophy; affects culture.
SURSA: PRODUCT_STRATEGY §10.10 line 404-406.
PUSH-BACK: ML Arbitrator value depends on training data; sale price uncertain.
STATUS: pending review Daniel cross-ref Q-0540

Q-0540 [Domain 4.6 — Open source EXCLUS proprietary MOAT]
DECIZIE: Open source EXCLUS. Arhitectura Cognitivă / Arbitrator = proprietary (MOAT-ul tău).
RAȚIONAL: Competitive moat preservation.
IMPACT dacă greșită: SEVERE — open source = competitor copies; closed = lose community goodwill.
SURSA: PRODUCT_STRATEGY §10.5 line 388-390.
PUSH-BACK: Open source community trust; closed = corporate signal.
STATUS: pending review Daniel cross-ref Q-0539

Q-0541 [Domain 4.6 — API public v2.0 sau niciodată]
DECIZIE: API public v2.0 sau niciodată. Nu vrei alții să polueze baza cu sync-uri dubioase.
RAȚIONAL: Data integrity; ML training value preserved.
IMPACT dacă greșită: SEVERE — open API = pollution; closed = no ecosystem.
SURSA: PRODUCT_STRATEGY §10.6 line 392-394.
PUSH-BACK: Closed API blocks integrations (smart scale, MFP); user value gap.
STATUS: pending review Daniel cross-ref Q-0540

Q-0542 [Domain 4.6 — Wearables roadmap Apple Health v1.x]
DECIZIE: Apple Health read-only (Sleep, Weight) v1.x.
RAȚIONAL: Premium feature; cost dev acceptable post-launch.
IMPACT dacă greșită: SEVERE — Apple Health absent = mobile-first contradiction.
SURSA: PRODUCT_STRATEGY §10.7 line 395-396; §3.8 line 132.
PUSH-BACK: Apple Health iOS-only; Android users gap; Google Fit needed.
STATUS: pending review Daniel cross-ref Q-0541

Q-0543 [Domain 4.6 — Mobile native PWA exclusiv v1.0]
DECIZIE: PWA exclusiv v1.0. Ocolești 30% Apple Tax + publici update-uri instant.
RAȚIONAL: Apple Tax bypass; instant updates; cross-platform.
IMPACT dacă greșită: SEVERE — native = 30% revenue + delays; PWA = some iOS UX gaps.
SURSA: PRODUCT_STRATEGY §7.3 line 274-276.
PUSH-BACK: PWA on iOS limitations (notifications, install prompts); native better UX.
STATUS: pending review Daniel cross-ref Q-0544

Q-0544 [Domain 4.6 — App Store presence v1.x evaluation]
DECIZIE: Future flag — v1.x might add Capacitor/React Native wrapper pentru App Store presence (EN audience iOS users).
RAȚIONAL: PWA-only iOS = strategic risk; App Store required for some users.
IMPACT dacă greșită: SEVERE — App Store gap = lose iOS power users; wrapper = complexity.
SURSA: PRODUCT_STRATEGY §7.3 line 275-276; §"Open Items" #5.
PUSH-BACK: Capacitor wrapper poor performance vs native; UX compromise.
STATUS: pending review Daniel cross-ref Q-0543

Q-0545 [Domain 4.6 — Offline-first Event Sourcing]
DECIZIE: Event Sourcing local (IndexedDB) → Sync rețea. Sala WiFi mort = Arbitrator funcționează perfect local.
RAȚIONAL: Real-world reliability; gym connectivity.
IMPACT dacă greșită: CATASTROFIC — online-only = no signal at gym.
SURSA: PRODUCT_STRATEGY §7.4 line 278-279.
PUSH-BACK: IndexedDB API verbose; localStorage simpler v1.
STATUS: pending review Daniel cross-ref Q-0339

Q-0546 [Domain 4.6 — Search exercises only v1.0]
DECIZIE: Doar exercises v1.0. Full-text history = indexare complexă = OUT_OF_SCOPE.
RAȚIONAL: Scope discipline; minimal search.
IMPACT dacă greșită: MODERATE — limited search = user friction; full = complex.
SURSA: PRODUCT_STRATEGY §7.7 line 287-288.
PUSH-BACK: Search history common feature; absence gap.
STATUS: pending review Daniel cross-ref Q-0547

Q-0547 [Domain 4.6 — Dark mode default + EXCLUSIV]
DECIZIE: Default + EXCLUSIV. Bugatti = ecrane negre/OLED, text curat.
RAȚIONAL: Brand aesthetic; OLED battery; gym lighting.
IMPACT dacă greșită: SEVERE — light mode preference users excluded; over-aesthetic = friction.
SURSA: PRODUCT_STRATEGY §7.8 line 290-291.
PUSH-BACK: Light mode some users prefer; accessibility gap; should support both.
STATUS: pending review Daniel cross-ref Q-0548

Q-0548 [Domain 4.6 — Accessibility native browser standards]
DECIZIE: Native browser standards (fonturi lizibile, contrast bun pe dark mode).
RAȚIONAL: Free accessibility win; standard compliance.
IMPACT dacă greșită: SEVERE — accessibility violations = legal + brand damage.
SURSA: PRODUCT_STRATEGY §7.9 line 293-294.
PUSH-BACK: "Native" minimum; explicit WCAG AA testing needed.
STATUS: pending review Daniel cross-ref Q-0547

Q-0549 [Domain 4.6 — i18n priority RO+EN exclusiv v1.0]
DECIZIE: RO + EN exclusiv v1.0.
RAȚIONAL: Scope discipline; expansion later.
IMPACT dacă greșită: MODERATE — limit market; multi-lang = effort.
SURSA: PRODUCT_STRATEGY §7.10 line 296-297.
PUSH-BACK: Spanish/German large markets; absence opportunity cost.
STATUS: pending review Daniel cross-ref Q-0502

Q-0550 [Domain 4.6 — DMCA respond + remove]
DECIZIE: Răspunzi prompt + scoți GIF dacă drepturi. Zero stres.
RAȚIONAL: DMCA standard; comply.
IMPACT dacă greșită: SEVERE — ignore DMCA = legal action.
SURSA: PRODUCT_STRATEGY §9.10 line 369-370.
PUSH-BACK: DMCA process; response time tracking.
STATUS: pending review Daniel cross-ref Q-0357

### DOMAIN 5: GDPR & COMPLIANCE

#### 5.1 Granular consent (3 checkboxes onboarding)

Q-0551 [Domain 5.1 — 3 checkboxes granular consent]
DECIZIE: Granular consent 3 checkboxes onboarding.
RAȚIONAL: GDPR granular consent; respect autonomy.
IMPACT dacă greșită: CATASTROFIC — non-granular = GDPR fine.
SURSA: HANDOVER §5 GDPR section.
PUSH-BACK: 3 checkboxes = friction; unclear what each covers.
STATUS: pending review Daniel cross-ref Q-0552

Q-0552 [Domain 5.1 — Consent categories ToS / Analytics / Personalization]
DECIZIE: 3 consent categories: Terms of Service (mandatory), Analytics (optional), Personalization (optional).
RAȚIONAL: Standard categories; legal compliance.
IMPACT dacă greșită: SEVERE — wrong categories = invalid consent.
SURSA: implicit GDPR best practice.
PUSH-BACK: Personalization opt-in = engine signal degraded; legal but business cost.
STATUS: pending review Daniel cross-ref Q-0551

Q-0553 [Domain 5.1 — Medical disclaimer mandatory]
DECIZIE: Medical disclaimer obligatoriu checkbox la creare cont.
RAȚIONAL: Liability shield; standard SaaS.
IMPACT dacă greșită: CATASTROFIC — no disclaimer = full liability.
SURSA: PRODUCT_STRATEGY §5.1 line 179-181.
PUSH-BACK: Tick-without-read pattern; legally weak.
STATUS: pending review Daniel cross-ref Q-0450

Q-0554 [Domain 5.1 — Consent revocation in settings]
DECIZIE: User can revoke any consent in settings post-onboarding.
RAȚIONAL: GDPR right; no lock-in.
IMPACT dacă greșită: CATASTROFIC GDPR — no revocation = fine.
SURSA: implicit GDPR Article 7.
PUSH-BACK: Revoke Analytics = lose signal; engine adapts gracefully.
STATUS: pending review Daniel cross-ref Q-0555

Q-0555 [Domain 5.1 — Consent timestamps logged]
DECIZIE: Consent timestamps logged per consent category. Audit trail.
RAȚIONAL: Compliance evidence; GDPR audit.
IMPACT dacă greșită: CATASTROFIC — no log = compliance gap; audit fail.
SURSA: implicit GDPR Article 7.
PUSH-BACK: Log = storage; minimal cost.
STATUS: pending review Daniel cross-ref Q-0554

#### 5.2 Sensitive category handling

Q-0556 [Domain 5.2 — Location GPS REJECTED]
DECIZIE: Location GPS REJECTED. Privacy + Gigel test fail (tracking concerns).
RAȚIONAL: Sensitive category; reverse engineering ("which gym is user at"); friction.
IMPACT dacă greșită: SEVERE — GPS = privacy fine + brand damage; absence = manual gym selection.
SURSA: HANDOVER §7 Multi-Gym Q4 line 116; PRODUCT_STRATEGY implicit.
PUSH-BACK: GPS auto-detect gym would be UX win; manual switch friction.
STATUS: pending review Daniel cross-ref Q-0557

Q-0557 [Domain 5.2 — Bloodwork REJECTED forever]
DECIZIE: Bloodwork REJECTED forever (Gigel test fail).
RAȚIONAL: Sensitive medical data; legal nightmare; friction enormous.
IMPACT dacă greșită: SEVERE — bloodwork = HIPAA-equivalent compliance; absence = signal gap.
SURSA: ADR 013 §Severity tiers HIGH defer line 120-122; INSIGHTS_BACKLOG Vitality Layer alternate.
PUSH-BACK: Bloodwork = comprehensive health signal; alternative behavioral proxy weaker.
STATUS: pending review Daniel cross-ref Q-0556

Q-0558 [Domain 5.2 — Vitality Layer as bloodwork replacement]
DECIZIE: Vitality Layer behavioral proxy replaces bloodwork. ADR 016 backlog.
RAȚIONAL: Friction zero behavioral questions; signal puternic + privacy preserved.
IMPACT dacă greșită: SEVERE — too weak proxy = miss signal; rejected bloodwork irreplaceable.
SURSA: INSIGHTS_BACKLOG ADR 016 line 131-156.
PUSH-BACK: Behavioral proxy weaker than bloodwork; calibration uncertain.
STATUS: pending review Daniel cross-ref Q-0559

Q-0559 [Domain 5.2 — Photo BF estimation sensitive consent]
DECIZIE: BF estimation Path (a) = photo. Storage + upload = sensitive PII; explicit consent needed.
RAȚIONAL: Body photo = sensitive; user awareness.
IMPACT dacă greșită: CATASTROFIC GDPR — photo without consent = fine; compliance.
SURSA: HANDOVER §3 BF estimation line 84-87.
PUSH-BACK: Photo on-device only (no upload) reduces concern; if uploaded, encryption.
STATUS: pending review Daniel cross-ref Q-0411

Q-0560 [Domain 5.2 — Pregnancy field sensitive]
DECIZIE: Pregnancy field în Setări manual; sensitive category; explicit consent.
RAȚIONAL: Health data; passive mode trigger.
IMPACT dacă greșită: CATASTROFIC — pregnancy data leak = compliance + brand.
SURSA: PRODUCT_STRATEGY §5.4 line 188-190.
PUSH-BACK: User toggles forget; auto-detection invasive.
STATUS: pending review Daniel cross-ref Q-0444

Q-0561 [Domain 5.2 — Heart condition flag sensitive]
DECIZIE: Heart condition checkbox sensitive; Red disclaimer; Passive Mode.
RAȚIONAL: Medical data; safety override.
IMPACT dacă greșită: CATASTROFIC — heart condition handled wrong = injury or compliance.
SURSA: PRODUCT_STRATEGY §5.8 line 200-206.
PUSH-BACK: Self-report unverifiable; legal review.
STATUS: pending review Daniel cross-ref Q-0445

Q-0562 [Domain 5.2 — Eating disorder pattern detection sensitive]
DECIZIE: Eating disorder algorithm: weight drop + max volum → FLAG + Passive Mode + "Pauză recomandată". Refuzăm să fim complici.
RAȚIONAL: Safety asymmetric; refuse to enable harm.
IMPACT dacă greșită: CATASTROFIC — silent enable = harm + compliance; over-flag = false positive distress.
SURSA: PRODUCT_STRATEGY §5.5 line 191-194.
PUSH-BACK: Algorithm threshold detection; subjective.
STATUS: pending review Daniel cross-ref Q-0446

#### 5.3 Data export (user can download)

Q-0563 [Domain 5.3 — Export JSON cont opțiune]
DECIZIE: "Export my data (JSON)" în cont. Transparență totală.
RAȚIONAL: GDPR right; user trust; portability.
IMPACT dacă greșită: CATASTROFIC GDPR — export missing = compliance fail.
SURSA: PRODUCT_STRATEGY §7.5 line 282.
PUSH-BACK: JSON usable by competitor; brand risk; obligatoriu legal.
STATUS: pending review Daniel cross-ref Q-0564

Q-0564 [Domain 5.3 — Export comprehensive all stores]
DECIZIE: Export includes: CDL + logs + profile + settings + multi-gym + biometric measurements.
RAȚIONAL: Complete data; user takes everything.
IMPACT dacă greșită: CATASTROFIC GDPR — incomplete = compliance fail.
SURSA: PRODUCT_STRATEGY §7.5 + GDPR Article 20.
PUSH-BACK: Large export; compress (gzip).
STATUS: pending review Daniel cross-ref Q-0376

Q-0565 [Domain 5.3 — Export format machine-readable]
DECIZIE: JSON format, machine-readable, structured.
RAȚIONAL: Standard format; portable.
IMPACT dacă greșită: SEVERE — proprietary format = locked-in; user can't migrate.
SURSA: implicit PRODUCT_STRATEGY §7.5.
PUSH-BACK: JSON not user-readable; CSV alternate for greutate logs.
STATUS: pending review Daniel cross-ref Q-0563

Q-0566 [Domain 5.3 — Export user-initiated NOT auto]
DECIZIE: Export user-initiated via button "Export my data". NOT auto-emailed.
RAȚIONAL: User control timing; manual download.
IMPACT dacă greșită: MODERATE — auto-email = compliance overstep; manual = friction.
SURSA: implicit PRODUCT_STRATEGY §7.5.
PUSH-BACK: Some users want auto-backup email; option toggle.
STATUS: pending review Daniel cross-ref Q-0567

Q-0567 [Domain 5.3 — Export response time SLA]
DECIZIE: Export response time <30 zile per GDPR Article 12. Aim instant download in-app.
RAȚIONAL: GDPR compliance; user expectation.
IMPACT dacă greșită: CATASTROFIC GDPR — > 30 zile = fine.
SURSA: GDPR Article 12 + PRODUCT_STRATEGY §7.5.
PUSH-BACK: Instant possible cu local-first storage; export = read + zip.
STATUS: pending review Daniel cross-ref Q-0563

#### 5.4 Right to be forgotten (account deletion → data purge)

Q-0568 [Domain 5.4 — Account deletion soft delete 30 zile]
DECIZIE: Soft delete 30 zile (Tombstone). Apoi nuke total (GDPR).
RAȚIONAL: User mistake recovery + compliance.
IMPACT dacă greșită: SEVERE — instant delete = no recovery; never delete = GDPR violation.
SURSA: PRODUCT_STRATEGY §9.9 line 366-367.
PUSH-BACK: 30 zile arbitrary; GDPR requires "without undue delay"; could be aggressive.
STATUS: pending review Daniel cross-ref Q-0569

Q-0569 [Domain 5.4 — deleteAccount Cloud Function]
DECIZIE: Cloud Function deleteAccount: user_profile/mesocycles/sessions wiped + arbitration_log anonymized.
RAȚIONAL: Atomic cloud-side delete; partial fail prevention.
IMPACT dacă greșită: CATASTROFIC — incomplete delete = GDPR fine; partial = state inconsistent.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q14 line 391-392.
PUSH-BACK: Cloud Function single-point-of-failure; verification needed.
STATUS: pending review Daniel cross-ref Q-0357

Q-0570 [Domain 5.4 — Anonymize arbitration_log preserve ML]
DECIZIE: arbitration_log anonymized (UUID → DELETED_USER, păstrăm age/decision/math).
RAȚIONAL: Anonymize NU delete preserves training data; user-rights respected.
IMPACT dacă greșită: CATASTROFIC dacă incomplete anonymization = re-identification possible.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q6 GDPR line 335-336; §Q14 line 392.
PUSH-BACK: Combined age + decision pattern + timestamps may re-identify în small-N.
STATUS: pending review Daniel cross-ref Q-0049

Q-0571 [Domain 5.4 — Local data clear on delete]
DECIZIE: Account delete = local localStorage clear + Firebase wipe.
RAȚIONAL: Complete delete; both local + cloud.
IMPACT dacă greșită: CATASTROFIC GDPR — local data persists post-delete = fine.
SURSA: implicit ADR 001 + GDPR.
PUSH-BACK: Local clear may leave service worker cache; need full wipe.
STATUS: pending review Daniel cross-ref Q-0568

Q-0572 [Domain 5.4 — Delete confirmation explicit prompt]
DECIZIE: Delete account = explicit confirmation prompt; type "DELETE" or similar.
RAȚIONAL: Avoid accidental delete; deliberate action.
IMPACT dacă greșită: SEVERE — easy delete = user mistake = data loss.
SURSA: implicit best practice.
PUSH-BACK: Friction may anger legitimate deletes; balance.
STATUS: pending review Daniel cross-ref Q-0568

Q-0573 [Domain 5.4 — Delete propagation cross-services]
DECIZIE: Delete propagates: Firebase, Sentry user logs, Plausible (no user link), Stripe (subscription).
RAȚIONAL: All third-party services purged.
IMPACT dacă greșită: CATASTROFIC GDPR — propagation incomplete = data persist external.
SURSA: implicit GDPR Article 17 + service integration.
PUSH-BACK: Stripe retains records for tax compliance; mandatory legal exception.
STATUS: pending review Daniel cross-ref Q-0571

#### 5.5 Sentry tracking

Q-0574 [Domain 5.5 — Sentry tracks crashes NOT PII]
DECIZIE: Sentry tracks crashes, errors. NU PII (no email, no name, no specific session content).
RAȚIONAL: Privacy minimal; crash visibility sufficient.
IMPACT dacă greșită: CATASTROFIC GDPR — PII în Sentry = fine.
SURSA: PRODUCT_STRATEGY §8.10 line 335-336; implicit Sentry config.
PUSH-BACK: Anonymous user-id needed for crash dedup; not full PII but identifier.
STATUS: pending review Daniel cross-ref Q-0575

Q-0575 [Domain 5.5 — Sentry user_id anonymous UUID]
DECIZIE: Sentry user_id = anon UUID localStorage. Match cu account UUID.
RAȚIONAL: Crash dedup; no PII; aligned cu local-first.
IMPACT dacă greșită: SEVERE — incorrect = duplicates; PII leak = compliance.
SURSA: implicit Sentry config.
PUSH-BACK: UUID stable but on device reset = new UUID; multi-device crashes hard correlate.
STATUS: pending review Daniel cross-ref Q-0574

Q-0576 [Domain 5.5 — Sentry breadcrumbs filter sensitive]
DECIZIE: Sentry breadcrumbs filter: weight/measurement values redacted; only flow/state preserved.
RAȚIONAL: PII protection; debug context preserved.
IMPACT dacă greșită: SEVERE — sensitive data în breadcrumbs = leak.
SURSA: implicit Sentry config + GDPR.
PUSH-BACK: Filter rules complex; gaps possible.
STATUS: pending review Daniel cross-ref Q-0574

Q-0577 [Domain 5.5 — Sentry retention 30-90 zile]
DECIZIE: Sentry retention 30-90 zile per Sentry plan default. Extended via paid tier.
RAȚIONAL: Recent debug; older crashes mostly resolved.
IMPACT dacă greșită: MODERATE — short retention = old bugs invisible; long = cost.
SURSA: implicit Sentry plan; PRODUCT_STRATEGY §8.10.
PUSH-BACK: 30 zile may miss low-frequency bugs; 90 zile better.
STATUS: pending review Daniel cross-ref Q-0048

Q-0578 [Domain 5.5 — Sentry Cookies / DNT respect]
DECIZIE: Sentry respects Do-Not-Track header. Optional disable per user.
RAȚIONAL: User agency; privacy.
IMPACT dacă greșită: MINOR — DNT non-compliant brand image; minor compliance.
SURSA: implicit Sentry + privacy norms.
PUSH-BACK: DNT disabled = lose crash data; user choice.
STATUS: pending review Daniel cross-ref Q-0537

#### 5.6 Firebase data residency (servers EU?)

Q-0579 [Domain 5.6 — Firebase EU region selected]
DECIZIE: Firebase EU server region (europe-west1 sau eu-central1).
RAȚIONAL: GDPR EU data residency; latency RO acceptable.
IMPACT dacă greșită: CATASTROFIC GDPR — non-EU data = fine.
SURSA: implicit Cognitive Arch §Q14 + PRODUCT_STRATEGY §5.10.
PUSH-BACK: EU region selection at project create; not changeable; lock-in.
STATUS: pending review Daniel cross-ref Q-0580

Q-0580 [Domain 5.6 — Firebase non-EU adjacent services]
DECIZIE: Cloud Functions EU region; Sentry EU region; Plausible self-hosted EU optional.
RAȚIONAL: Comprehensive EU residency.
IMPACT dacă greșită: CATASTROFIC GDPR — third-party non-EU = fine.
SURSA: implicit GDPR + service config.
PUSH-BACK: Plausible self-hosted infrastructure cost; managed EU host alternative.
STATUS: pending review Daniel cross-ref Q-0579

#### 5.7 Cookie consent / tracking pixels

Q-0581 [Domain 5.7 — Plausible cookieless analytics]
DECIZIE: Plausible no cookies; lightweight anonymous.
RAȚIONAL: GDPR cookie consent banner not needed; ethic.
IMPACT dacă greșită: MINOR — cookie banner = friction; cookieless = brand alignment.
SURSA: PRODUCT_STRATEGY §8.9 line 331-333.
PUSH-BACK: Cookieless analytics weaker data quality; tradeoff.
STATUS: pending review Daniel cross-ref Q-0537

Q-0582 [Domain 5.7 — No tracking pixels third-party]
DECIZIE: No tracking pixels third-party (Facebook, Google Ads). Brand alignment.
RAȚIONAL: Privacy-first brand; no surveillance.
IMPACT dacă greșită: MINOR — marketing analytics weaker; brand alignment strong.
SURSA: implicit PRODUCT_STRATEGY §1.9 NO paid ads + §8.9.
PUSH-BACK: Marketing measurement harder without pixels.
STATUS: pending review Daniel cross-ref Q-0581

Q-0583 [Domain 5.7 — Necessary cookies session-only]
DECIZIE: Necessary cookies session-only (auth token). No persistent tracking cookies.
RAȚIONAL: Minimum necessary; GDPR essential exception.
IMPACT dacă greșită: SEVERE — persistent cookies = consent banner needed.
SURSA: implicit GDPR ePrivacy.
PUSH-BACK: Session cookies user re-login each session; UX friction.
STATUS: pending review Daniel cross-ref Q-0582

Q-0584 [Domain 5.7 — localStorage exempt from cookie banner]
DECIZIE: localStorage technically exempt from cookie banner if used for app function (not tracking).
RAȚIONAL: GDPR ePrivacy distinguishes tracking from functional storage.
IMPACT dacă greșită: SEVERE — incorrect classification = banner needed; correct = no banner.
SURSA: implicit GDPR ePrivacy.
PUSH-BACK: Legal interpretation varies country; legal review.
STATUS: pending review Daniel cross-ref Q-0583

Q-0585 [Domain 5.7 — Anonymized analytics aggregate]
DECIZIE: Plausible analytics anonymized aggregate metrics (page views, referrers); no individual user tracking.
RAȚIONAL: Insights without privacy invasion.
IMPACT dacă greșită: MODERATE — limited insights; privacy-aligned.
SURSA: PRODUCT_STRATEGY §8.9 line 331-333.
PUSH-BACK: Aggregate misses funnel analysis; conversion tracking weak.
STATUS: pending review Daniel cross-ref Q-0581

### DOMAIN 6: UX & ONBOARDING

#### 6.1 Onboarding flow steps (target <120s)

Q-0586 [Domain 6.1 — Onboarding 7-step max]
DECIZIE: Onboarding 7 steps max (5-7 fields + multi-gym opt-in + BF estimation + GDPR + skip option).
RAȚIONAL: Target <120s; minimum friction.
IMPACT dacă greșită: SEVERE — too long = drop-off; too short = engine blind.
SURSA: HANDOVER §6.1 line 127; PRODUCT_STRATEGY §2.1.
PUSH-BACK: 7 steps tight; realistic 9-10 with all considerations.
STATUS: pending review Daniel cross-ref Q-0587

Q-0587 [Domain 6.1 — Onboarding skip allowed Tracker Mode]
DECIZIE: Skip allowed permanent → Tracker Mode T0. Banner non-intruziv.
RAȚIONAL: User control; AI features locked.
IMPACT dacă greșită: MODERATE — skip permanent = user never unlocks; aggressive prompts = annoying.
SURSA: PRODUCT_STRATEGY §2.2 line 78; Cognitive Arch §Q17.
PUSH-BACK: 5 antrenamente threshold low; alternative explicit needed.
STATUS: pending review Daniel cross-ref Q-0461

Q-0588 [Domain 6.1 — Onboarding minimum: Age, Gender, Weight, Goal, Experience]
DECIZIE: Minimum mandatory: Age, Gender, Weight, Goal, Experience.
RAȚIONAL: PROJECTION needs for safety caps; minimal.
IMPACT dacă greșită: SEVERE — incomplete = unsafe propositions cold start.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q15 line 396-398.
PUSH-BACK: 5 fields meets minimum; height, BF estimate added valuable.
STATUS: pending review Daniel cross-ref Q-0199

Q-0589 [Domain 6.1 — Coach gives direct program with Override]
DECIZIE: First session: Coach îi dă direct un program sugerat, DAR cu buton mare "Override/Edit". Paternalism zero.
RAȚIONAL: User agency preserved; coach as advisor.
IMPACT dacă greșită: SEVERE — no override = paternalism; auto-override = no signal.
SURSA: PRODUCT_STRATEGY §2.3 line 80-81.
PUSH-BACK: "Mare" button = real estate; design decision.
STATUS: pending review Daniel cross-ref Q-0590

Q-0590 [Domain 6.1 — Onboarding skip flow Tracker Mode banner]
DECIZIE: Banner: "Pentru recomandări AI, completează profilul sau loghează 5 antrenamente."
RAȚIONAL: Honest gating; clear path forward.
IMPACT dacă greșită: MODERATE — skip permanent = no value; aggressive prompts = hostile.
SURSA: PRODUCT_STRATEGY §2.2 line 78.
PUSH-BACK: 5 antrenamente threshold low; user logs trash data fast.
STATUS: pending review Daniel cross-ref Q-0586

#### 6.2 Profile Typing Q1-Q5 + spot-check Q6

Q-0591 [Domain 6.2 — Profile Typing Q1-Q5 + Q6]
DECIZIE: Q1-Q5 onboarding (3-4 self-report core) + Q6 spot-check post-sesiunea 3 behavioral.
RAȚIONAL: Self-report + behavioral hybrid; inference 4-6 săpt.
IMPACT dacă greșită: SEVERE — too many = friction; too few = thin signal.
SURSA: HANDOVER §6.2 line 130; ADR 013 §Profile typing.
PUSH-BACK: 3-4 vs 5 ambiguity; spec.
STATUS: pending review Daniel cross-ref Q-0309

Q-0592 [Domain 6.2 — Q1 example "Cum reacționezi la frustrare?"]
DECIZIE: Q1 candidate: "Cum reacționezi când nu progresezi?" — Yes push harder / Maintain / Drop / Adjust based on data.
RAȚIONAL: Direct profile-mapping question; 4 options mapped 4 profiles.
IMPACT dacă greșită: SEVERE — leading question = self-perception bias confirmation.
SURSA: ADR 013 §Profile typing 4 profiles line 88-92.
PUSH-BACK: Q1 specific spec lipsă în ADR; needs design iteration.
STATUS: pending review Daniel cross-ref Q-0593

Q-0593 [Domain 6.2 — Behavioral inference 4-6 săpt fereastra fixă]
DECIZIE: Behavioral inference 4-6 săpt fereastra fixă v1. Adaptive considered post 1000+ users.
RAȚIONAL: Operationalizable; predictable; debug-friendly.
IMPACT dacă greșită: MODERATE — fixed = suboptimal per-user; adaptive complex.
SURSA: ADR 013 §Resolved Open Questions #1 line 303-307.
PUSH-BACK: 4-6 range = 50% variance; should pin (4 or 5 or 6).
STATUS: pending review Daniel cross-ref Q-0299

Q-0594 [Domain 6.2 — Reconciliation prompt 1-click]
DECIZIE: Reconciliation prompt: 1-click accept/decline + drill-down opțional.
RAȚIONAL: Recommendation cu evidență; decizie rapidă.
IMPACT dacă greșită: SEVERE — too friction = dismissed; too automatic = labelled.
SURSA: ADR 013 §Wording reconciliation prompt line 104-110.
PUSH-BACK: User invested by 4-6 săpt; reluctant to "change identity".
STATUS: pending review Daniel cross-ref Q-0233

Q-0595 [Domain 6.2 — Profile change history preserved]
DECIZIE: Profile change history preserved (CDL extension or ProfileLog).
RAȚIONAL: Debug + audit + reconciliation context.
IMPACT dacă greșită: MODERATE — history lost = debugging blind.
SURSA: ADR 013 §Resolved Open Questions #5 line 327-330.
PUSH-BACK: Privacy concern minimal local-first; cloud sync = inferable.
STATUS: pending review Daniel cross-ref Q-0241

#### 6.3 Tier-based personalization (T0 → demographic prior, T1+ → real signal)

Q-0596 [Domain 6.3 — T0 demographic prior cold start]
DECIZIE: T0 cold start uses Demographic Prior Database (ADR 017) for synthetic personalization.
RAȚIONAL: First session personalized aproximativ; real sessions corectează prior.
IMPACT dacă greșită: SEVERE — T0 demographic absent = profile blind = generic; calibration wrong.
SURSA: HANDOVER §6.3 line 131; INSIGHTS_BACKLOG ADR 017 line 158-173.
PUSH-BACK: Demographic prior 500 profiles fixture; calibration empirical only at scale.
STATUS: pending review Daniel cross-ref Q-0597

Q-0597 [Domain 6.3 — T1+ real signal accumulating]
DECIZIE: T1+ shifts to real signal as data accumulates. Demographic prior decays 1.0 → 0.0 post-T1.
RAȚIONAL: Real > synthetic when sufficient.
IMPACT dacă greșită: SEVERE — stuck demographic = ignore real signal; instant transition = noisy early.
SURSA: ADR 018 §5 feature flags lifecycle decay; ADR 017.
PUSH-BACK: Decay function (linear, exponential?) spec needed.
STATUS: pending review Daniel cross-ref Q-0596

Q-0598 [Domain 6.3 — Demographic Prior 500 profiles total]
DECIZIE: Demographic Prior Database 500 profile total: ~50 manually crafted edge cases + ~450 algorithmic generated.
RAȚIONAL: Sweet spot dev workflow speed vs coverage density.
IMPACT dacă greșită: SEVERE — too few = blind spots; too many = generation cost.
SURSA: INSIGHTS_BACKLOG ADR 017 line 165-167.
PUSH-BACK: 50/450 split; manual quality > generated; ratio reflects.
STATUS: pending review Daniel cross-ref Q-0599

Q-0599 [Domain 6.3 — Demographic Prior storage local fixtures]
DECIZIE: Storage local fixtures tests/fixtures/syntheticProfiles.js. Generated runtime memory pentru test runs. NU persist permanent.
RAȚIONAL: Zero impact pe Firebase production cost.
IMPACT dacă greșită: SEVERE — Firebase synthetic = cost; local = no cost.
SURSA: INSIGHTS_BACKLOG ADR 017 line 168-170.
PUSH-BACK: Runtime generation = compute on every cold start; cache needed.
STATUS: pending review Daniel cross-ref Q-0598

Q-0600 [Domain 6.3 — Demographic Prior generator parametrizat]
DECIZIE: Algorithmic generator parametrizat; scale-able prin generator.
RAȚIONAL: Easy to extend; control variation.
IMPACT dacă greșită: SEVERE — unparameterized = manual generation; parameterized = quality control.
SURSA: INSIGHTS_BACKLOG ADR 017 line 169-170.
PUSH-BACK: Parametrization complexity; bug surface in generator.
STATUS: pending review Daniel cross-ref Q-0598

#### 6.4 Coach idle screen layout (info-only curat)

Q-0601 [Domain 6.4 — Coach idle plan baseline FĂRĂ readiness gate]
DECIZIE: Coach idle: plan baseline FĂRĂ readiness gate. Readiness card SUBTLE pentru mood history.
RAȚIONAL: Reverse engineering blocked; mood signal collected silent.
IMPACT dacă greșită: SEVERE — visible plan change = RE leak; no signal = pattern blind.
SURSA: HANDOVER §1 Coach idle line 62.
PUSH-BACK: Subtle = miss user; transparency tradeoff.
STATUS: pending review Daniel cross-ref Q-0423

Q-0602 [Domain 6.4 — Coach idle info-only curat NU clutter]
DECIZIE: Coach idle info-only curat, NU clutter.
RAȚIONAL: Bugatti aesthetic; quality over feature density.
IMPACT dacă greșită: MODERATE — too sparse = "where's the value"; too dense = overwhelm.
SURSA: HANDOVER §6.4 implicit; PRODUCT_STRATEGY §2.11 lux discret.
PUSH-BACK: "Curat" subjective; component count needed.
STATUS: pending review Daniel cross-ref Q-0603

Q-0603 [Domain 6.4 — Coach idle today + START + săptămâna]
DECIZIE: Coach tab structure: today + START sesiune + săptămâna informativă scroll-down.
RAȚIONAL: Action-first hierarchy; predictive view scroll.
IMPACT dacă greșită: SEVERE — wrong hierarchy = user confusion; right = clear flow.
SURSA: HANDOVER §8 UI Tabs line 124-130.
PUSH-BACK: "Săptămâna" overlap cu Statistici; redundancy.
STATUS: pending review Daniel cross-ref Q-0604

Q-0604 [Domain 6.4 — UI Tabs 3-tab structure final]
DECIZIE: 3 tabs final: Coach (action) / Statistici (display) / Profil (settings).
RAȚIONAL: Coach = action layer; Statistici = display layer; Profil = control.
IMPACT dacă greșită: SEVERE — wrong split = user confusion; right = clear philosophy.
SURSA: HANDOVER §8 line 124-132.
PUSH-BACK: 3 tabs may not scale; future features tab fragmentation.
STATUS: pending review Daniel cross-ref Q-0603

Q-0605 [Domain 6.4 — Eliminate Dashboard/Program/Plan tabs]
DECIZIE: Eliminate Dashboard tab (duplicate), Program tab (anti-RE risk), Plan tab (nume nasol + content fragmentat).
RAȚIONAL: Consolidation; brand alignment.
IMPACT dacă greșită: SEVERE — removed tabs = features lost path; consolidated = cleaner.
SURSA: HANDOVER §8 line 130-132.
PUSH-BACK: Existing users habituated; migration UX.
STATUS: pending review Daniel cross-ref Q-0604

Q-0606 [Domain 6.4 — Visual language Q1 Coach default]
DECIZIE: Coach default + smart prompts non-invasive.
RAȚIONAL: Action-first; smart prompts contextual.
IMPACT dacă greșită: MODERATE — default tab choice; intuitive.
SURSA: HANDOVER §9 Visual language Q1 line 136-137.
PUSH-BACK: New users default Coach without context = confusion; should onboard.
STATUS: pending review Daniel cross-ref Q-0607

Q-0607 [Domain 6.4 — Single scrollable + prompts contextuale]
DECIZIE: Single scrollable + prompts contextuale.
RAȚIONAL: Linear flow; natural scroll behavior; prompts inline.
IMPACT dacă greșită: MODERATE — fragmentation = cluttered; single = scroll length issue.
SURSA: HANDOVER §9 Q2 line 137-138.
PUSH-BACK: Scroll length on long history may overwhelm; pagination alternative.
STATUS: pending review Daniel cross-ref Q-0606

Q-0608 [Domain 6.4 — Engine-driven curation 3-5 cards always]
DECIZIE: Engine-driven curation, 3-5 cards always (echilibru cognitiv).
RAȚIONAL: Cognitive load balance; engine prioritizes; predictable count.
IMPACT dacă greșită: SEVERE — too many = overwhelm; too few = sparse; 3-5 sweet.
SURSA: HANDOVER §9 Q3 line 138.
PUSH-BACK: Engine curation logic critical; fallback if engine fails = empty Coach.
STATUS: pending review Daniel cross-ref Q-0607

Q-0609 [Domain 6.4 — Color palette + typography deferred Claude Design]
DECIZIE: Q4-Q5 final color palette + typography decision DEFERRED post-mockup Claude Design.
RAȚIONAL: Visual design iteration via dedicated Design bucket separat.
IMPACT dacă greșită: MODERATE — deferral = launch with placeholder; iterate later.
SURSA: HANDOVER §9 Q4-Q5 line 139.
PUSH-BACK: Visual design = brand; deferral may delay polish.
STATUS: pending review Daniel cross-ref Q-0610

Q-0610 [Domain 6.4 — Coach idle banner contextual neutral]
DECIZIE: Coach idle banner contextual neutru ("Coach-ul observă..." NU "5 signals detected").
RAȚIONAL: Anti-RE; user-friendly; non-judgmental.
IMPACT dacă greșită: SEVERE — exposing engine = anti-RE leak; vague = no transparency.
SURSA: HANDOVER §6 categorical display line 105-106.
PUSH-BACK: Vague reduces transparency; balance.
STATUS: pending review Daniel cross-ref Q-0214

#### 6.5 START antrenament flow (readiness modal la START)

Q-0611 [Domain 6.5 — START click triggers readiness modal]
DECIZIE: Click START → modal readiness obligatoriu cu Skip (default neutru 3).
RAȚIONAL: Capture readiness pre-session; engine recalibrate; user flow natural.
IMPACT dacă greșită: SEVERE — pre-START = user disrupted; post = too late; at START = correct timing.
SURSA: HANDOVER §1 Readiness MOVE line 64.
PUSH-BACK: Modal at pump-up moment = friction.
STATUS: pending review Daniel cross-ref Q-0421

Q-0612 [Domain 6.5 — readiness-session[date] storage]
DECIZIE: Readiness stored as readiness-session[date]. Distinct from readiness-mood[date].
RAȚIONAL: Two different signals; separate storage.
IMPACT dacă greșită: SEVERE — collapsed = signal mixed; separate = clean separation.
SURSA: HANDOVER §1 line 63-64.
PUSH-BACK: 2 keys per day = signal redundancy if user logs both.
STATUS: pending review Daniel cross-ref Q-0379

Q-0613 [Domain 6.5 — Readiness 1-10 scale]
DECIZIE: Readiness 1-10 scale.
RAȚIONAL: Granular; user can express nuance.
IMPACT dacă greșită: MODERATE — too granular = friction; coarse = noise.
SURSA: COGNITIVE_ARCHITECTURE_SPEC_v1 §Q15 line 399.
PUSH-BACK: 1-10 abstract; many users default 5; 3-point easier.
STATUS: pending review Daniel cross-ref Q-0200

Q-0614 [Domain 6.5 — Engine recalculează instant on readiness]
DECIZIE: Engine recalculează instant on readiness submit. Plan adapts.
RAȚIONAL: Real-time response; user sees plan adjust.
IMPACT dacă greșită: SEVERE — slow recalc = friction; not visible = no signal trust.
SURSA: HANDOVER §1 line 64.
PUSH-BACK: Instant = compute pe device; perceptible delay possible cu Cloud Function.
STATUS: pending review Daniel cross-ref Q-0033

Q-0615 [Domain 6.5 — Skip default neutral 3 of 10]
DECIZIE: Skip default neutru 3 (mid-low scale).
RAȚIONAL: Skip = no signal; default low-mid.
IMPACT dacă greșită: MODERATE — default 5 = engine thinks fresh; default 3 = engine over-conservative.
SURSA: HANDOVER §1 line 64.
PUSH-BACK: Asymmetric default (3 not 5) introduces bias; should be central (5).
STATUS: pending review Daniel cross-ref Q-0613

#### 6.6 In-session UI

Q-0616 [Domain 6.6 — In-set logging mandatory pacing]
DECIZIE: In-set logging mandatory pentru pacing. REALTIME engine pierde "durată per set" + fatigue intra-workout altfel.
RAȚIONAL: Per-set timestamp captured; pacing signal.
IMPACT dacă greșită: SEVERE — pacing lost = REALTIME signal degraded.
SURSA: PRODUCT_STRATEGY §2.4 line 81-83.
PUSH-BACK: Friction high; user prefers post-set logging.
STATUS: pending review Daniel cross-ref Q-0430

Q-0617 [Domain 6.6 — Pauze auto-start după log]
DECIZIE: Rest timer auto-start după logarea setului.
RAȚIONAL: Reduce tap; auto-track.
IMPACT dacă greșită: MINOR — manual = extra tap; auto = always running.
SURSA: PRODUCT_STRATEGY §2.6 line 89-90.
PUSH-BACK: Auto-start during phone-down = timer running while user actively resting.
STATUS: pending review Daniel cross-ref Q-0431

Q-0618 [Domain 6.6 — RPE inference smart + selective prompt]
DECIZIE: RPE = (d) combo: smart inference reps actual + selective prompt 4-tap doar la outlier sets.
RAȚIONAL: 75% friction reduction.
IMPACT dacă greșită: SEVERE — full prompt every set = friction; pure inference = noise.
SURSA: HANDOVER §11 P1 line 145.
PUSH-BACK: "Outlier" definition empirical.
STATUS: pending review Daniel cross-ref Q-0416

Q-0619 [Domain 6.6 — Alternative engine click "Aparat ocupat"]
DECIZIE: Click "Aparat ocupat" → alternative exercise; ephemeral, not persisted.
RAȚIONAL: Real-world friction; preserve session continuity.
IMPACT dacă greșită: SEVERE — no alternative = abandon; persistent = wrong learning.
SURSA: HANDOVER §11 P3 line 148; src/engine/alternativeEngine.js.
PUSH-BACK: Alternative selection algorithm spec ambiguous.
STATUS: pending review Daniel cross-ref Q-0273

Q-0620 [Domain 6.6 — Click "Lipsă aparat" persistent per-gym]
DECIZIE: "Lipsă aparat" persistent per-gym (Multi-Gym). NU global.
RAȚIONAL: Structural property; learn equipment.
IMPACT dacă greșită: SEVERE — global = wrong cross-gym; per-gym = correct.
SURSA: HANDOVER §7 Multi-Gym line 113-121.
PUSH-BACK: User says "Lipsă" once = blocked forever; expiry/recheck needed.
STATUS: pending review Daniel cross-ref Q-0274

#### 6.7 End-of-session summary

Q-0621 [Domain 6.7 — Summary auto-dismiss 5 sec]
DECIZIE: Summary modal auto-dismiss 5 sec.
RAȚIONAL: Reduce taps; user already saw outcome.
IMPACT dacă greșită: MODERATE — too fast = miss info; too slow = wait.
SURSA: HANDOVER §11 P2 line 147.
PUSH-BACK: Same for all users; should be configurable.
STATUS: pending review Daniel cross-ref Q-0415

Q-0622 [Domain 6.7 — Summary content sets / volume / PR]
DECIZIE: Summary: completed sets, total volume, PRs hit, time elapsed.
RAȚIONAL: Key metrics; minimal cognitive load.
IMPACT dacă greșită: MINOR — content choice; can iterate.
SURSA: implicit; PRODUCT_STRATEGY §2.11 PR celebration.
PUSH-BACK: Time elapsed less interesting; muscle group volume more.
STATUS: pending review Daniel cross-ref Q-0623

Q-0623 [Domain 6.7 — End rating prompt 5-point]
DECIZIE: End rating prompt 5-point Likert.
RAȚIONAL: User self-report; CDL outcome.rating.
IMPACT dacă greșită: SEVERE — coarse = noise; fine = friction.
SURSA: ADR 011 schema outcome.rating line 92.
PUSH-BACK: 5-point arbitrary; alternatives (3-point, slider).
STATUS: pending review Daniel cross-ref Q-0425

Q-0624 [Domain 6.7 — PR celebration subtle confetti]
DECIZIE: Subtle confetti + haptic. Bugatti = lux discret.
RAȚIONAL: Aesthetic alignment.
IMPACT dacă greșită: MINOR — over = cringe; under = no recognition.
SURSA: PRODUCT_STRATEGY §2.11 line 103-105.
PUSH-BACK: "Subtle" subjective; spec needed.
STATUS: pending review Daniel cross-ref Q-0487

#### 6.8 Reality validation post-session (auto-delete <2min, prompt <5/15min)

Q-0625 [Domain 6.8 — <2min+0sets auto-delete silent]
DECIZIE: <2min + 0sets = auto-delete silent.
RAȚIONAL: Test/accidental; no friction.
IMPACT dacă greșită: SEVERE — legitimate short check-in deleted; UX hostile.
SURSA: HANDOVER §1 line 67.
PUSH-BACK: 2min edge case fast session legit.
STATUS: pending review Daniel cross-ref Q-0265

Q-0626 [Domain 6.8 — <5min OR <30% volum default delete prompt]
DECIZIE: <5min sau <30% volum → modal "Test sau real?" default delete.
RAȚIONAL: Likely test; user explicit confirm.
IMPACT dacă greșită: SEVERE — default delete = real session lost on miss-tap.
SURSA: HANDOVER §1 line 68.
PUSH-BACK: Default delete biased data loss; default keep + opt-in delete safer.
STATUS: pending review Daniel cross-ref Q-0266

Q-0627 [Domain 6.8 — 5-15min + 30-70% short keep prompt]
DECIZIE: 5-15min + 30-70% volum → "Sesiune scurtă, păstrăm?" default Yes.
RAȚIONAL: Likely real but cut short; default keep.
IMPACT dacă greșită: SEVERE — default Yes saves likely-junk; default No loses real.
SURSA: HANDOVER §1 line 69.
PUSH-BACK: Asymmetric defaults inconsistent UX.
STATUS: pending review Daniel cross-ref Q-0267

Q-0628 [Domain 6.8 — >15min + >70% normal log no prompt]
DECIZIE: >15min + >70% volum → log normal. No prompt.
RAȚIONAL: Likely complete; trust.
IMPACT dacă greșită: MINOR — false log of "real" session = pollution.
SURSA: HANDOVER §1 line 70.
PUSH-BACK: 15min HIIT/EMOM cut at 12min legitimately = wrong category.
STATUS: pending review Daniel cross-ref Q-0268

#### 6.9 UI tabs structure (3 tabs)

Q-0629 [Domain 6.9 — Coach tab action layer]
DECIZIE: Coach tab = action layer (today + START + săptămâna).
RAȚIONAL: Primary action; daily focus.
IMPACT dacă greșită: SEVERE — wrong tab content = user lost.
SURSA: HANDOVER §8 line 126-128.
PUSH-BACK: Action + Schedule mix; could split.
STATUS: pending review Daniel cross-ref Q-0604

Q-0630 [Domain 6.9 — Statistici tab display layer]
DECIZIE: Statistici tab = display layer (charts, projection, goal weight + ETA, fatigue, adherence, calendar, BF%, TDEE, LBM, PR Wall mutat aici).
RAȚIONAL: Read-only data; deep dive.
IMPACT dacă greșită: SEVERE — display + action mix = user confusion.
SURSA: HANDOVER §8 line 128-129.
PUSH-BACK: Many features in one tab = scroll-overload; may need sub-tabs.
STATUS: pending review Daniel cross-ref Q-0631

Q-0631 [Domain 6.9 — Profil tab onboarding edit + biometrie + GDPR]
DECIZIE: Profil tab = onboarding edit, biometrie, phase override, settings, GDPR export, payment, account deletion.
RAȚIONAL: Control + admin; less frequent access.
IMPACT dacă greșită: SEVERE — settings hidden = user can't manage; over-prominent = clutter.
SURSA: HANDOVER §8 line 130.
PUSH-BACK: Many functions in Profil = sub-tabs needed.
STATUS: pending review Daniel cross-ref Q-0630

Q-0632 [Domain 6.9 — Statistici read-only data]
DECIZIE: Statistici purely read-only data layer. No editing.
RAȚIONAL: Display only; clear separation Coach (action) vs Statistici (view).
IMPACT dacă greșită: MODERATE — edit in display = confusion; pure separation = clean.
SURSA: HANDOVER §8 line 129.
PUSH-BACK: Some edit (typo correct) needed; restricted.
STATUS: pending review Daniel cross-ref Q-0630

Q-0633 [Domain 6.9 — Statistici input rapid greutate/kcal/protein]
DECIZIE: Statistici input rapid greutate/kcal/protein.
RAȚIONAL: Daily input frequent location; quick action.
IMPACT dacă greșită: MODERATE — input în Coach = action layer mix; în Statistici = aligned with display nutrition data.
SURSA: HANDOVER §8 line 128.
PUSH-BACK: Input = action; should be Coach? UX debate.
STATUS: pending review Daniel cross-ref Q-0630

#### 6.10 Exercise visual demo (illustrations 3D anatomical)

Q-0634 [Domain 6.10 — Illustrations 3D anatomical START/END side-by-side]
DECIZIE: Illustration anatomical 3D side-by-side START/END (gen aparate sală).
RAȚIONAL: Visual clarity exercise execution; brand neutral.
IMPACT dacă greșită: SEVERE — wrong style = brand fragmentation; right = clear.
SURSA: HANDOVER §10 line 142-143.
PUSH-BACK: 3D rendering quality at scale; AI-generated may have uncanny valley.
STATUS: pending review Daniel cross-ref Q-0635

Q-0635 [Domain 6.10 — Daniel NU în poză anti-RE]
DECIZIE: Daniel NU în poză. Brand neutral; anti-personality cult.
RAȚIONAL: Persoana absentă pattern; brand > founder.
IMPACT dacă greșită: MODERATE — Daniel persona = personal brand; absent = neutral.
SURSA: HANDOVER §10 line 142-143.
PUSH-BACK: Founder-led brand opportunity; absent = generic.
STATUS: pending review Daniel cross-ref Q-0634

Q-0636 [Domain 6.10 — 200 exerciții × 2 illustrations = 400 total]
DECIZIE: ~200 exerciții × 2 illustrations (START + END) = 400 illustrations total.
RAȚIONAL: Library scope; manageable.
IMPACT dacă greșită: SEVERE — too few = visual gap; too many = generation cost.
SURSA: HANDOVER §10 line 143; PRODUCT_STRATEGY §3.1 200 exerciții.
PUSH-BACK: Some exercises need video, not just static; gap.
STATUS: pending review Daniel cross-ref Q-0637

Q-0637 [Domain 6.10 — Pilot 1 exercițiu 3-5 style variante înainte scale]
DECIZIE: Pilot 1 exercițiu cu 3-5 style variante înainte scale.
RAȚIONAL: Quality control; iterate before commit 400.
IMPACT dacă greșită: SEVERE — scale before pilot = 400 wasted; pilot = quality controlled.
SURSA: HANDOVER §10 line 143.
PUSH-BACK: Pilot 1 thin sample; needs 5+ exercises diverse for representative.
STATUS: pending review Daniel cross-ref Q-0636

Q-0638 [Domain 6.10 — Claude Design bucket separat zero cost main]
DECIZIE: Generate prin Claude Design (bucket separat 0% used, zero cost main bucket).
RAȚIONAL: Compute budget separate; main bucket preserved.
IMPACT dacă greșită: MODERATE — main bucket consumed = work blocked; separate = isolated.
SURSA: HANDOVER §10 line 142.
PUSH-BACK: Bucket separation Claude Code feature; quota.
STATUS: pending review Daniel cross-ref Q-0637

#### 6.11 Multi-gym UI

Q-0639 [Domain 6.11 — Gym indicator header always visible]
DECIZIE: Gym indicator header always visible. Switch dropdown.
RAȚIONAL: Constant context; user knows which gym active.
IMPACT dacă greșită: SEVERE — invisible = user confused which gym; visible = clarity.
SURSA: HANDOVER §7 Multi-Gym Q4 manual switch line 116.
PUSH-BACK: Header real estate; balance.
STATUS: pending review Daniel cross-ref Q-0640

Q-0640 [Domain 6.11 — Settings management săli per-user]
DECIZIE: Settings management săli per-user (Profil tab); add/rename/delete gym.
RAȚIONAL: User control over gyms; multi-gym configuration.
IMPACT dacă greșită: SEVERE — can't add = limit; uncontrolled = spam gyms.
SURSA: HANDOVER §7 Multi-Gym Q10 free-text naming line 119.
PUSH-BACK: Free-text naming = inconsistent ("Gym 1" vs "World Class"); standardize?
STATUS: pending review Daniel cross-ref Q-0641

Q-0641 [Domain 6.11 — Max 5 săli limit]
DECIZIE: Max 5 săli per user.
RAȚIONAL: Reasonable cap; 7-card user (5 săli) covers.
IMPACT dacă greșită: MODERATE — too few = limit; too many = configuration sprawl.
SURSA: HANDOVER §7 Multi-Gym Q7 line 117.
PUSH-BACK: Power user 7+ săli edge case; rigid limit.
STATUS: pending review Daniel cross-ref Q-0640

Q-0642 [Domain 6.11 — Last active gym default]
DECIZIE: Last active gym default on app open.
RAȚIONAL: Most likely current; reduce friction.
IMPACT dacă greșită: SEVERE — wrong gym default = wrong equipment filter; user adjust manual.
SURSA: HANDOVER §7 Multi-Gym Q6 line 117.
PUSH-BACK: User changing gyms recent past = wrong default.
STATUS: pending review Daniel cross-ref Q-0639

Q-0643 [Domain 6.11 — Manual switch only NU GPS]
DECIZIE: Manual switch only, learn frequency pattern (NU GPS — privacy + Gigel test fail).
RAȚIONAL: Privacy first; manual reliable.
IMPACT dacă greșită: SEVERE — GPS = privacy leak; manual = friction.
SURSA: HANDOVER §7 Multi-Gym Q4 line 116.
PUSH-BACK: GPS auto-detect = UX win; manual switch = friction.
STATUS: pending review Daniel cross-ref Q-0556

Q-0644 [Domain 6.11 — Subtle banner add multi-gym onboarding]
DECIZIE: Default 1 sală onboarding, banner subtle adăugare multi-gym.
RAȚIONAL: Reduce onboarding friction; advanced users discover.
IMPACT dacă greșită: SEVERE — mandatory multi-gym = friction; never opt-in = power gap.
SURSA: HANDOVER §7 Multi-Gym Q1 line 113.
PUSH-BACK: Subtle = miss user; balance.
STATUS: pending review Daniel cross-ref Q-0457

Q-0645 [Domain 6.11 — Schema gyms[] + active_gym_id]
DECIZIE: Schema: gyms: [{id, name, equipment_unavailable[]}], active_gym_id.
RAȚIONAL: Standard array of objects + pointer; flexible.
IMPACT dacă greșită: SEVERE — wrong schema = engine confusion; right = clean.
SURSA: HANDOVER §7 line 121-122.
PUSH-BACK: equipment_unavailable[] grows; cleanup needed.
STATUS: pending review Daniel cross-ref Q-0646

Q-0646 [Domain 6.11 — Engine query filtru pe equipment_unavailable]
DECIZIE: Engine query filtrează exerciții pe equipment_unavailable per gym activ.
RAȚIONAL: Per-gym equipment filter; learns incrementally.
IMPACT dacă greșită: SEVERE — wrong filter = impossible exercise; right = feasible plan.
SURSA: HANDOVER §7 line 121-122.
PUSH-BACK: Filter overhead per query; cache.
STATUS: pending review Daniel cross-ref Q-0263

Q-0647 [Domain 6.11 — Switch gym = NU re-prompt config]
DECIZIE: Switch gym = NU re-prompt; configurația persistă independent per gym.
RAȚIONAL: Per-gym persistence; smooth switch.
IMPACT dacă greșită: SEVERE — re-prompt every switch = friction.
SURSA: HANDOVER §7 line 122.
PUSH-BACK: Persisting per gym = configuration sprawl over time.
STATUS: pending review Daniel cross-ref Q-0645

Q-0648 [Domain 6.11 — 60 zile re-validation prompt]
DECIZIE: Q3 = (a) prompt 60 zile re-validation. "Mai folosești sala X?"
RAȚIONAL: Periodic verification; clean stale gyms.
IMPACT dacă greșită: SEVERE — too frequent = friction; too rare = stale gyms accumulate.
SURSA: HANDOVER §7 Multi-Gym Q3 line 115.
PUSH-BACK: 60 zile arbitrary; should be tied to last-use.
STATUS: pending review Daniel cross-ref Q-0639

Q-0649 [Domain 6.11 — Sală nouă asume FULL echipament]
DECIZIE: Q2 = (a) sală nouă asume FULL echipament, learn on-the-go via "Lipsă aparat" mid-session. NU prompt cross-gym.
RAȚIONAL: Optimistic default; learn incrementally.
IMPACT dacă greșită: SEVERE — pessimistic = exhaustive checklist friction; optimistic = wrong filter.
SURSA: HANDOVER §7 Multi-Gym Q2 line 113-114.
PUSH-BACK: First sessions in new gym = many "Lipsă aparat" clicks.
STATUS: pending review Daniel cross-ref Q-0650

Q-0650 [Domain 6.11 — Global merged + opt-in calibrare per echipament]
DECIZIE: Q5 = (b) global merged progresie + opt-in calibrare per echipament.
RAȚIONAL: Default global progression; advanced users calibrate per equipment.
IMPACT dacă greșită: SEVERE — full per-equipment = data sparsity; full global = ignore equipment variance.
SURSA: HANDOVER §7 Multi-Gym Q5 line 116-117.
PUSH-BACK: Opt-in calibrare = advanced feature; user friction.
STATUS: pending review Daniel cross-ref Q-0649

Q-0651 [Domain 6.11 — Silent automated migration users existing]
DECIZIE: Q8 = (a) silent automated migration users existing → multi-gym schema.
RAȚIONAL: No user friction; automatic backfill.
IMPACT dacă greșită: SEVERE — manual migration = friction; broken auto = data loss.
SURSA: HANDOVER §7 Multi-Gym Q8 line 118.
PUSH-BACK: Silent migration = user surprised; should notify.
STATUS: pending review Daniel cross-ref Q-0652

Q-0652 [Domain 6.11 — Auto-substitute alternativă pe lipsă]
DECIZIE: Q9 = (c) auto-substitute alternativă pe lipsă echipament.
RAȚIONAL: Smooth flow; alternative engine handles.
IMPACT dacă greșită: SEVERE — no auto = user picks; auto wrong = mismatch.
SURSA: HANDOVER §7 Multi-Gym Q9 line 118.
PUSH-BACK: Alternative engine spec ambiguous; bug surface.
STATUS: pending review Daniel cross-ref Q-0273

Q-0653 [Domain 6.11 — Free-text naming săli]
DECIZIE: Q10 = free-text naming săli.
RAȚIONAL: User flexibility; user knows their gyms.
IMPACT dacă greșită: MINOR — inconsistent naming; user concern not engine.
SURSA: HANDOVER §7 Multi-Gym Q10 line 119.
PUSH-BACK: Free-text uniqueness not enforced; "Gym 1" vs "Gym 1 " = different.
STATUS: pending review Daniel cross-ref Q-0640

Q-0654 [Domain 6.11 — Rename rules backward compat]
DECIZIE: Renaming = explicit migration step; rationale.winnerId rewrite for affected entries.
RAȚIONAL: Rename without migration = orphan IDs.
IMPACT dacă greșită: SEVERE — orphan = pattern learning blind on past entries.
SURSA: ADR 011 §Stable Rule IDs line 105-107.
PUSH-BACK: Migration cost; should be rare.
STATUS: pending review Daniel cross-ref Q-0111

Q-0655 [Domain 6.11 — Deletion = sentinel DEPRECATED preserved]
DECIZIE: Removing rules = sentinel DEPRECATED_<original_id> preserved for historical entries.
RAȚIONAL: Forward compat readers; audit trail.
IMPACT dacă greșită: SEVERE — full delete = past entries orphan.
SURSA: ADR 011 §Stable Rule IDs line 105-108.
PUSH-BACK: Sentinel proliferates; cleanup later.
STATUS: pending review Daniel cross-ref Q-0350

#### 6.12 Visual language fundațional

Q-0656 [Domain 6.12 — Bugatti aesthetic permanent rule]
DECIZIE: Bugatti aesthetic ABSOLUTE. Lux discret, antrenor olimpic.
RAȚIONAL: Brand differentiation; quality signal.
IMPACT dacă greșită: SEVERE — drift = brand dilution.
SURSA: PRODUCT_STRATEGY §1 implicit; multiple references.
PUSH-BACK: "Bugatti" subjective; spec needed.
STATUS: pending review Daniel cross-ref Q-0657

Q-0657 [Domain 6.12 — Anti-pattern social network]
DECIZIE: NU rețea socială. Fără feed, like-uri, peer-pressure. "Doar tu cu fierul și antrenorul."
RAȚIONAL: Brand identity; user wellbeing > engagement metrics.
IMPACT dacă greșită: SEVERE — adding social = brand damage; absence = retention gap.
SURSA: PRODUCT_STRATEGY §1.7 line 47-52.
PUSH-BACK: Social retention strong; absence cost.
STATUS: pending review Daniel cross-ref Q-0656

Q-0658 [Domain 6.12 — Anti-gimmick gamification ieftină]
DECIZIE: Fără gimmick gamification (NU streaks, NU challenges, NU IG share, NU badges engagement).
RAȚIONAL: Quality > gimmicks; brand alignment.
IMPACT dacă greșită: SEVERE — gimmicks = brand damage; absence = engagement gap.
SURSA: PRODUCT_STRATEGY §6 multiple sections.
PUSH-BACK: Gamification proven retention; absence cost.
STATUS: pending review Daniel cross-ref Q-0659

Q-0659 [Domain 6.12 — Marketing spam vs Actionable Utility distinction]
DECIZIE: Notification = output PROJECTION engine, NU output marketing team. Marketing Spam vs Actionable Utility.
RAȚIONAL: Brand alignment; notifications are useful not spam.
IMPACT dacă greșită: SEVERE — marketing = trust erosion; utility = value.
SURSA: PRODUCT_STRATEGY §11.4 line 432-436.
PUSH-BACK: Distinction subjective; "We miss you" can be useful for some.
STATUS: pending review Daniel cross-ref Q-0488

Q-0660 [Domain 6.12 — Personalitate "Antrenor olimpic"]
DECIZIE: Personalitate Antrenor olimpic, NU cheerleader.
RAȚIONAL: Quality alignment.
IMPACT dacă greșită: SEVERE — cheerleader = unprofessional; olympic = serious.
SURSA: PRODUCT_STRATEGY §4.1 line 144-145.
PUSH-BACK: "Olimpic" vs "friendly" tone debate.
STATUS: pending review Daniel cross-ref Q-0493

---

**BATCH 2 PARTIAL — Q0501-Q0660 COMPLETE** (target was Q1000-Q2000; quality > quantity per directive)

Domain 4 Strategy Q501-Q550, Domain 5 GDPR Q551-Q585, Domain 6 UX Q586-Q660.
