---
title: Medical Safety Disclaimer + T&C Mandatory Accept Onboarding Gate (LOCK V1 2026-05-14)
type: concept
status: locked-v1
locked_date: 2026-05-14
authority: Daniel CEO directive verbatim chat birou → acasă 2026-05-14 LOCK 4 paradigm shift majoră product — first-launch onboarding gate liability shift informed consent standard industry
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[pre-beta-full-scope-lock-v2]]"
  - "[[andura-suflet]]"
  - "[[gigel-test]]"
  - "[[bugatti-craft]]"
  - "[[../entities/adrs/adr-013-auto-aggression-detection]]"
  - "[[../entities/adrs/adr-015-getbf-calibration-only]]"
  - "[[../entities/adrs/adr-017-demographic-prior-database]]"
  - "[[../entities/adrs/adr-009-calibration-tiers]]"
  - "[[../summaries/handover-2026-05-14-chat-birou-acasa-pre-beta-full-scope-lock-v2-plus-safety-disclaimer-t-c-plus-kcal-floor-plus-aggressive-loading-locked]]"
amendments:
  - date: 2026-05-15-chat-current-post-evening
    note: |
      APPEND chat ACASĂ 2026-05-15 chat-current post-evening — **LOCK 4 Medical Safety Disclaimer + T&C Mandatory Accept Onboarding Gate LANDED commit `ecd71a7` pre-onboarding gate first-launch implementation Co-CTO autonomous PROMPT_CC** per wiki/concepts/medical-safety-disclaimer-t-c-mandatory LOCK V1 2026-05-14 + pre-beta-full-scope-lock-v2 LOCK 4 cumulative cu LOCK 1 Pre-Beta FULL strict.

      **Implementation 6 files (4 NEW `src/pages/disclaimer/` module + 2 MODIFY `src/main.js` + `src/state.js:29` enum extend):**
      - NEW `src/pages/disclaimer/index.js` (~190 LOC) — `showMedicalDisclaimerGate(opts)` pure-function render overlay 4-section structure (header + disclaimer text + T&C link + checkbox row + Continui button) + `isMedicalDisclaimerAccepted()` + `clearMedicalDisclaimerAcceptance()` helpers + XSS guard pure `createElement` + `textContent` + idempotent + backdrop tap dismiss BLOCKED + escape key dismiss BLOCKED (mandatory accept invariant)
      - NEW `src/pages/disclaimer/styles.css` (~135 LOC) — overlay full-screen z-index 9999 + card max-width 600px padding 32px border-radius 12px + buton primary #c8412e mockup Clasic V2 theme + T&C secondary modal z-index 10000
      - NEW `src/pages/disclaimer/tcText.js` (~80 LOC) — `T_AND_C_TEXT_RO` long-form 10 sectiuni Bugatti standard industry adapt RO no-diacritics rule LOCK V1 PERMANENT verified test regex
      - MODIFY `src/main.js` (+8 LOC import + wrapped existing dispatch into `proceedToAppEntry()`) — Entry: `isMedicalDisclaimerAccepted() ? proceedToAppEntry() : showMedicalDisclaimerGate({onAccept: proceedToAppEntry})`, ZERO mutation existing router logic post-accept (anti-RE invariant)
      - MODIFY `src/state.js:29` (+1 enum value) — `currentScreen` enum extend `'medical-disclaimer'` valid value
      - NEW `src/pages/disclaimer/__tests__/disclaimer.test.js` (~230 LOC, 24 tests) — render structure + checkbox+button state coupling + accept flow + idempotent+defensive + XSS guard + T&C secondary modal + T_AND_C_TEXT_RO content + helpers

      **Tests baseline 3480 → 3504 PASS preserved EXACT (+24 NEW disclaimer.test.js)** ZERO regression cross-engine.

      **Anti-paternalism preserved invariant ABSOLUTE:** NU blocăm log user (autonomy preserved per F2 Sufletul Andura "AI-ul informează NU impune" cross-13 LOCKs catalysator). Engine intelligence conservative defaults preserved via existing Periodization + Calibration Tiers ADR 009 + RIR Matrix + Demographic Prior ADR 017 cold-start NU medical knowledge layer NEW.

      **Mockup design SoT divergence resolution per §0.2 PROMPT_CC** — andura-clasic.html line 535-536 disclaimer pattern integrated INTO Step 1 of onboarding (`onb1-disclaimer` checkbox în Obiectiv step). PROMPT_CC directive explicit: "pre-onboarding-T0 gate first-launch" + entry router dispatch separate. Daniel verbatim "Disclaimer la inceput... si atat conteaza" = compatible cu ambele interpretări. Authority decision per §0.2 rule "use Daniel verbatim directive ca authority primat over mockup interpretation gap": Implemented SEPARATE pre-onboarding gate (NU integrated-into-Step-1) — ZERO mutation `src/onboarding.js` existing flow (anti-RE preserved) + simpler atomic commit single-concern + cleaner state separation. v2 migration integration-style viable post-LANDED dacă Daniel preferă pattern mockup.

      **§6 flag legitim Daniel review T&C wording legal pre-Beta launch RECOMMENDED** — NU substituere consultant legal. Recomandare strong: Daniel review wording cu un avocat specialist drept consumator + drept medical + GDPR ÎNAINTE Beta launch finalize. Owner Andura placeholder pending legal entity formalization (SRL or PFA decision deferred per chat strategic). Textul curent este "good enough" pentru testing intern + closed Beta, dar NU pentru public launch cu users non-Daniel.

      Cross-link [[pre-beta-full-scope-lock-v2]] amendments 2026-05-15-chat-current-post-evening + [[kcal-floor-1200-engine-filter]] amendments 2026-05-15-chat-current-post-evening + [[../summaries/handover-2026-05-15-chat-acasa-post-evening-triple-landed-c4-8-bayesian-nutrition-plus-lock-4-medical-disclaimer-plus-lock-8-kcal-floor-1200]] §1 NEW summary codify chat-current ACASĂ post-evening cumulative.
---

# Medical Safety Disclaimer + T&C Mandatory Accept Onboarding Gate

## Synthesis

**Medical Safety Disclaimer + T&C Mandatory Accept Onboarding Gate LOCK V1 NEW 2026-05-14** = first-launch onboarding screen disclaimer + T&C checkbox mandatory accept, cannot proceed onboarding without accept. Wording strict legal informativ NU medical advisory. Liability shift informed consent standard industry (toate apps fitness fac asta — MyFitnessPal, Strava, Hevy etc).

**Why:** Daniel CEO directive verbatim catalysator *"Mi se rupe ca maria a facut sau nu operatie. Disclaimer la inceput ca nu suntem medici, sa consulte un specialist, antrenamentele sunt pe riscurile proprii etc... si atat conteaza"* + paradigm extensivă explanation cooperative self-check *"Sau gandesc gresit?"* (Maria displazie + copil 14 mint vârsta + Marius cardiac neselectat exemple). Co-CTO confirmation: gândire PERFECT corectă + aliniat 100% paradigm Andura LOCKED V1 existing (ADR 013 §Force-typing ELIMINATED PERMANENT anti-paternalism + ADR 015 Anti-Recommendation principle + Sufletul Andura F2 "AI-ul informează NU impune" + Anti-paternalism ABSOLUTE strategy).

**Distincția critică paradigm Andura:** app NU recomandă accidentări (invariant păstrăm via engine intelligence conservative — Periodization + Calibration Tiers + RIR Matrix conservative defaults age-aware/experience-aware via Demographic Prior ADR 017) **vs** app NU restricționează autonomy user (anti-paternalism — dacă Maria 70 insistă manual Forță, engine routes Forță template cu wording adapt + starting conservative NU "passive mode tripwire" block). Legal protection via Disclaimer + T&C mandatory accept = liability shift informed consent.

**How to apply:**

**Implementation gate first-launch onboarding screen:**
- Disclaimer screen prima launch după install/signup, ÎNAINTE Big 6 hard T0 questions
- T&C checkbox mandatory accept, cannot proceed onboarding without accept
- Wording strict legal: *"Andura informativă NU medical advisory + antrenamente risc propriu + consultă medic înainte program + ZERO responsabilitate accidentări sau probleme medicale"*
- Re-prompt periodic post major updates TBD (timing scheme la implementation)

**Engine behavior cascade (LOCK 5 + 6 + 7 chat-current):**
- LOCK 5 — Hard medical tripwire Passive Mode = RELAXED (SCENARIOS_SIMULATOR §3.2 Pruning A Maria 65 + Forță / >75 + Cut deficit / Pregnant Cut/BULK = soft engine conservative defaults NU hard block; combinațiile rămân valid scenarios, engine route correct template cu wording adapt vârstă + context + conservative starting weights, NU passive mode tripwire automatic)
- LOCK 6 — Anti-recommendation invariant păstrăm (engine NU produce output care provoacă accidentări = core Bugatti differentiator vs apps care reward volume orbește; implementarea via Periodization + Calibration Tiers ADR 009 + RIR Matrix conservative + Demographic Prior ADR 017 baseline cold-start; NU medical knowledge layer, behavioral intelligence pure)
- LOCK 7 — Behavioral safety AA Detection ADR 013 KEEP CORE pre-Beta (Volume Creep + Auto-pedeapsă observable + warning intervention 1-tap "Continui" + CDL log silent forensic = NU medical, e behavioral pattern recognition core Bugatti differentiator pre-Beta core feature; friction-typing rămâne ELIMINATED PERMANENT 2026-04-30 amendment invariant preserved)

**Trade-off ADR 013 §5 "HIGH tier behavioral-only lipsește signals fizice RHR/HRV/sleep" = NU mai e problem** (NU implementăm health export integration — medical territory disclaimer covers).

## Verbatim quotes Daniel

Daniel verbatim chat birou → acasă 2026-05-14 LOCK 4 catalysator ultra-clear:
> *"Mi se rupe ca maria a facut sau nu operatie. Disclaimer la inceput ca nu suntem medici, sa consulte un specialist, antrenamentele sunt pe riscurile proprii etc... si atat conteaza"*

Daniel verbatim chat birou → acasă 2026-05-14 LOCK 4 paradigm explanation extensivă self-check cooperative pattern ultra-major:
> *"Disclaimer ca nu suntem medici, si nu ne asumam responsabilitatea, ca programele sunt informative, cu un t&C mandatory accept. Dupa daca maria de 70 ani cu displazie de sold vrea sa faca forta... e binevenita... nu ii dam recomandari de 200 kg... dar fizic nu o poti oprii sa nu faca... (sau daca ea minte aplicatia tu cum o verifici?). Ideea e simpla, utilizatorul face ce vrea, dar aplicatia nu recomanda accidentari. Ex 2. Un copil de 14 ani minte si zice ca are 18 ca sa intre pe aplicatie. Poti sa il opresti sa nu faca asta? Realist nu. Ex 3: Marius e cardiac, si nu selecteaza ca e cardiac... se uita si face antrenamentul, si moare pe banda... e andura responsabila? Ideea e simpla, nu suntem medici, ne protejam legal si informam oamenii ca inainte sa inceapa sa consulte un medic, le zicem ca programele sunt informative si au nevoie de indicatii medicale precise inainte sa inceapa... si drum bun. Sau gandesc gresit?"*

Daniel verbatim self-check cooperative pattern preserved:
> *"Sau gandesc gresit?"* (catalysator confirmation Co-CTO 100% aligned existing Andura LOCKED principles — ADR 013 + ADR 015 + Sufletul Andura F2 + Anti-paternalism ABSOLUTE strategy preserved invariant cross-cluster)

## Bugatti framing notes

### Quality > Speed (Medical paradigm shift = Bugatti differentiator confirmation cross-cluster)
LOCK 4 + 5 + 6 + 7 cascade Medical Safety Disclaimer + T&C Mandatory + Hard tripwire RELAXED + Anti-recommendation invariant + Behavioral safety AA Detection KEEP CORE = paradigm shift Daniel verbatim *"utilizatorul face ce vrea, dar aplicatia nu recomanda accidentari"* aliniat 100% existing Andura LOCKED principles. NU medical knowledge layer, behavioral intelligence pure preserved Bugatti differentiator cross-cluster. Single comprehensive solution Bugatti pur — disclaimer + T&C mandatory + engine intelligence conservative defaults via existing infrastructure (Periodization + Calibration Tiers + RIR Matrix + Demographic Prior cold-start age-aware/experience-aware) = ZERO medical knowledge layer needed.

### Anti-acoperiș-pereți
LOCK 4 implementation pre-Beta core scope (LOCK 1 directive "totul pre-Beta") — first-launch onboarding gate Daniel directive simple *"Disclaimer la inceput... si atat conteaza"* ultra-clear scope NU complex medical knowledge layer. Anti-acoperiș-pereți filter validates simple solution Bugatti pur.

### Anti-RE considerations
Engine intelligence conservative defaults preserved via Periodization + Calibration Tiers ADR 009 + RIR Matrix + Demographic Prior ADR 017 baseline cold-start = NU medical knowledge layer, behavioral intelligence pure. Anti-RE protection categorical preserved via existing infrastructure NU layer nou.

### Anti-paternalism
Distincția critică Daniel paradigm: app NU recomandă accidentări (engine intelligence conservative) **vs** app NU restricționează autonomy user (anti-paternalism ABSOLUTE — dacă Maria 70 insistă manual Forță, engine routes Forță template cu wording adapt + starting conservative NU passive mode tripwire block). Hard medical tripwire Passive Mode RELAXED (LOCK 5) — combinațiile rămân valid scenarios, engine route correct template cu wording adapt vârstă + context + conservative starting weights. Anti-paternalism ABSOLUTE strategy preserved cross-link ADR 013 §Force-typing ELIMINATED PERMANENT 2026-04-30 amendment invariant.

### Voice tone notes — Bugatti craft framing
F2 Sufletul Andura "AI-ul informează NU impune" invariant preserved cross-13 LOCKs catalysator. Wording strict legal informativ NU medical advisory + Romanian-first + Gigel-friendly default cross-link [[gigel-test]] paradigm Marius la sala accesibil. Disclaimer + T&C mandatory accept = standard industry (MyFitnessPal, Strava, Hevy etc) NU Andura-specific over-engineering — anti-paternalism + legal protection liability shift informed consent.

## Cross-refs raw layer

- [[../../01-vision/SUFLET_ANDURA]] §1.1 F2 "AI-ul informează, NU impune" — invariant preserved cross-13 LOCKs anti-paternalism ABSOLUTE catalysator chat-current 2026-05-14
- [[../../03-decisions/013-auto-aggression-detection]] §AMENDMENT 2026-04-30 — Force-typing ELIMINATED PERMANENT anti-paternalism ABSOLUTE preserved invariant + behavioral safety AA Detection KEEP CORE pre-Beta (LOCK 7 chat-current)
- [[../../03-decisions/015-getbf-calibration-only]] — Anti-Recommendation principle invariant păstrăm (Option B Formula B preserved single path NU hybrid Option C fudge factors) cross-link engine intelligence conservative defaults
- [[../../03-decisions/017-demographic-prior-database]] — baseline cold-start age-aware/experience-aware Anti-recommendation invariant preserved cross-13 LOCKs (LOCK 6 implementation cascade)
- [[../../03-decisions/009-calibration-tiers]] §AMENDMENT 2026-05-05 Convergence Guard T2 Unlock — engine intelligence conservative defaults infrastructure preserved invariant
- [[../../04-architecture/SCENARIOS_SIMULATOR_DESIGN_V1]] §3.2 Pruning A — RELAX medical hard tripwire Passive Mode → soft engine conservative defaults (LOCK 5 cascade chat-current)
- [[../../📤_outbox/_archive/2026-05/490_HANDOVER_2026-05-14_pre_beta_full_scope_safety_locks_CONSUMED]] handover source archived chat-current LOCK V1 directive
