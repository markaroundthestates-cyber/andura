---
title: ADR 033 — Engine Muscle Memory Index (MMI) V1 LOCKED Pre-Beta LANDED
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-05-15
authority: 03-decisions/033-muscle-memory-index.md §32.1-§32.3 SPEC verbatim LOCKED V1 2026-05-02 + LOCK 10 pre-Beta promote directive cross-chat 14 birou 2026-05-14 Daniel CEO "totul pre-Beta" supersede defer v1.5 rationale INVALIDATED
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-018-engine-extensibility-architecture]]"
  - "[[adr-026-offline-coaching-tree]]"
  - "[[adr-009-calibration-tiers]]"
  - "[[adr-013-auto-aggression-detection]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[../../concepts/pre-beta-full-scope-lock-v2]]"
  - "[[../../concepts/medical-safety-disclaimer-t-c-mandatory]]"
  - "[[../../concepts/aggressive-loading-warning-tier-aware]]"
amendments:
  - date: 2026-05-14
    type: promote-directive
    note: APPEND chat-current chat birou → acasă 2026-05-14 sesiune strategic pură — ADR 033 MMI promote SPEC READY V1 pre-Beta scope (LOCK 10 cascade). Rationale defer "Maria post-operație șold gap reputational v1.5 risk" = INVALIDATED post Daniel CEO directive verbatim *"Mi se rupe ca maria a facut sau nu operatie"* + paradigm Medical Safety Disclaimer + T&C Mandatory (LOCK 4) + LOCK 1 Pre-Beta = FULL app strict directive verbatim *"Aplicatia pre-beta o sa fie FULL cu tot. Post beta facem doar bug fixes daca exista, si eventual alte noi features daca constatam ca trebuie"*.
  - date: 2026-05-15
    type: promote
    reason: LOCK 10 implementation LANDED — 4 modules NEW (muscleMemoryIndex.js core + muscleMemoryAdapter.js compose layer + muscleMemoryPrompt.js modal + coachContext.js pauseDetection helper) + main.js entry gate wire + state.js currentScreen enum extend. STUB → V1 LOCKED status promote. Tests +95 NEW PASS, ZERO regression baseline preserved invariant.
---

# ADR 033 — Engine Muscle Memory Index (MMI) V1 LOCKED

## Synthesis

ADR 033 = Engine #9 Muscle Memory Index (MMI) LOCKED V1 LANDED 2026-05-15 per spec §32.1-§32.3 LOCKED V1 2026-05-02 verbatim. Trigger threshold 6+ luni pauză prima deschidere app prompts user accept/refuse cu wording Bugatti tone "Pauza face parte din drum. Incepem treptat — corpul tau isi aminteste." Algorithm Hibrid Lookup + Boost: starting weight = peak_pre_pauză × multiplicator (0.80 / 0.70 / 0.60 per durată 6-12 / 12-24 / 24+ luni) + boost progresie primele 3 săptămâni (1.25× / 1.10× / 1.00×) accelerează re-calibrarea neuromusculară.

**Architecture 4-module Bugatti pure-function compose pipeline:**

1. **`src/engine/muscleMemoryIndex.js`** — pure-function core: `MMI_LOOKUP_TABLE` frozen + `getMmiBucketForPauseMonths` + `computeMmiStartingWeight` + `computeMmiBoostMultiplier` + `shouldShowMmiPrompt` decision.
2. **`src/engine/muscleMemoryAdapter.js`** — compose layer `applyMuscleMemoryUpgrade(rec, ex, mmiContext, dpEngine)` wraps DP → AA → AcceleratedLearning chain ULTIMUL (refunda baseline când user opted-in) + `readMmiState(db)` I/O boundary + `computeWeeksSinceResume(date, current)` pure helper.
3. **`src/pages/coach/muscleMemoryPrompt.js`** — UI modal Romanian no-diacritics + 2-tap override [Reincep treptat] / [De la zero] + refuse banner observable non-blocant per §32.3.
4. **`src/engine/coachContext.js` extended** — `computePauseDuration(sessionDates, currentDate)` + `extractSessionDates(logs)` pure helpers.

Wire: `src/main.js` `proceedThroughMmiGate()` sits between medical disclaimer + onboarding/coach entry — checks logs → distinct dates → pause months → if ≥6 + no choice yet → showMuscleMemoryPrompt → persist DB `'mmi-state'` `{userChoice, pauseMonths, promptedAt, resumeStartDate, peakPrePauseKgPerExercise}` → continue.

Pipeline compose order LOCK 10 LAST: `DP.recommend → AA.applyTo → applyAcceleratedLearningUpgrade → applyMuscleMemoryUpgrade`. MMI applied last because re-resume starting weight (engine "you've been away") wins on user opt-in; LOCK 9 accelerated learning is no-op when user has paused (no recent CDL signal).

## Verbatim quotes Daniel

Daniel verbatim HANDOVER_MISC §32 NEW 2026-05-02 MMI LOCKED V1 rationale source-of-truth:
> *"păstrăm peak_pre_pause ca anchor (engine știe unde a ajuns user) + lookup table pentru durată reală pauză. Boost progresie primele 3 săpt accelerează re-calibrarea (corpul își amintește pattern-uri neuromusculare)."*

Daniel verbatim spec §32.3 wording Bugatti tone LOCKED V1:
> *"Pauza face parte din drum. Începem treptat — corpul tău își amintește."*

Daniel verbatim spec §32.2 anti-paternalism question LOCKED V1:
> *"Vrei să reîncepem treptat, de unde ai rămas, sau preferi să o luăm de la zero?"*

Daniel verbatim chat birou → acasă 2026-05-14 LOCK 10 promote directive — supersede defer v1.5 rationale INVALIDATED:
> *"Mi se rupe ca maria a facut sau nu operatie"* (anti-paternalism cross-link LOCK 4 Medical Safety Disclaimer paradigm — engine = generic invariant NU user-specific reasoning hard-coded)

Daniel verbatim LOCK 1 Pre-Beta FULL strict directive cross-chat 14 birou:
> *"Aplicatia pre-beta o sa fie FULL cu tot. Post beta facem doar bug fixes daca exista, si eventual alte noi features daca constatam ca trebuie"*

Daniel verbatim cumulative Co-CTO autonomy MAXIMUM 14th consecutive cross-chat trust delegation paradigm preserved invariant pre-Beta launch a-z review.

## Bugatti framing notes

### Gigel test relevance
User Gigel re-intors după pauză 12+ luni — Bugatti craft = engine știe unde a ajuns (peak anchor preserved), NU restart from 0 paternalist. UX intuitivă "Reincep treptat (recomandat)" / "De la zero" = 2 alegeri evidente. Pause duration estimat ("Ai luat o pauza de aproximativ 8 luni.") face contextul transparent NU mistificat.

### Quality > Speed via lookup table
~6 multiplicatori (3 durate × 2 valori start + boost) = ship lean. NU complex Bayesian estimation pentru "muscle memory" — observable pattern lookup table primă V1 Bugatti craft NU over-engineering. Lookup `Object.freeze` immutability invariant — table fix NU LLM dinamic. Toate constants frozen deeply (buckets + thresholdMonthsMin + per-bucket fields).

### Anti-acoperiș-pereți
Engine #9 slot per ADR 018 §1 Dimension Registry plug-in additive Open-Closed — MMI integrare = INPUT signal nou pentru infrastructură compose pipeline existing (DP → AA → AcceleratedLearning chain LOCK 9), NU engine separat. 4 module NEW pure-function = minimum surface; main.js entry gate single sequential addition between LOCK 4 disclaimer + onboarding/coach (mirror pattern precedent).

### Anti-RE considerations
Override 1-tap [Reincep treptat] / [De la zero] — **NO forced typing per ADR 013 §AMENDMENT 2026-04-30 invariant preserved**. Modal DOM zero input/textarea verify regex test. Refuse path observable non-blocking banner per §32.3 spec ("Atentie — incarci direct greutatile maxime. Risc accidentare la setul de pornire. Recomandare: incepi cu 70% si urci.") — NU modal blocant, NU forced acknowledgment.

### Anti-paternalism ABSOLUTE
User decide accept/refuse explicit (§32.2 anti-paternalism + agency 100% per spec). Refuse path respected: `userChoice='refused'` → `applyMuscleMemoryUpgrade` returns recommendation unchanged → baseline DP+AA+AcceleratedLearning chain wins (engine încarcă greutățile maxime istorice per §32.3). Banner observable NU rule enforcement. Cross-link Daniel verbatim 14 birou *"Mi se rupe ca maria a facut sau nu operatie"* paradigm preserved invariant: engine = invariant generic care funcționează pentru toți useri NU hard-coded special cases.

### Voice tone notes — Bugatti craft framing
Wording adapt pe pauseMonths (subtitle "Ai luat o pauza de aproximativ N luni." = transparency factual). Peak summary top-5 exerciții = context visible (NU mistificat). Romanian-first no-diacritics LOCK V1 PERMANENT 2026-05-10 respect (ADR 033 source has legacy diacritics — implementation strip per invariant verify regex test). Bugatti craft authentic NU lobotomy LLM impersonal — Daniel verbatim chat strategic preserved.

### Forensic transparency ADR 011 §append-only
MMI upgrade emits forensic flags pe recommendation object: `_muscleMemoryApplied + _mmiOriginalKg + _mmiPeakPrePauseKg + _mmiStartMultiplier + _mmiBoostMultiplier + _mmiBucket`. Audit trail visible pre-execute set (UI surface poate display indicator future iteration). DB persisted state preserves `promptedAt` ISO timestamp + `resumeStartDate` per session continuity.

## Cross-refs raw layer

- [[../../../03-decisions/033-muscle-memory-index]] §32.1-§32.3 SPEC verbatim LOCKED V1 source-of-truth 2026-05-02
- [[../../../03-decisions/018-engine-extensibility-architecture]] §1 Dimension Registry Engine #9 plug-in additive Open-Closed slot canonical
- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §9 pure-function paradigm invariant
- [[../../../03-decisions/009-calibration-tiers]] §AMENDMENT 2026-05-05 Convergence Guard T2 Unlock cross-link tier mature feature gating
- [[../../../03-decisions/013-auto-aggression-detection]] §AMENDMENT 2026-04-30 Force-typing ELIMINATED PERMANENT anti-paternalism ABSOLUTE preserved invariant cross-link
- [[../../../03-decisions/011-coach-decision-log-architecture]] §append-only forensic transparency invariant cross-link
- [[../../../03-decisions/014-onboarding-profile-typing]] §9 Anti-Reflex Protection UX touchpoint
- [[../../../01-vision/ONBOARDING_SSOT_V1]] §9 Anti-Reflex Protection MMI prompt integration touchpoint
- [[../../../06-sessions-log/HANDOVER_MISC_2026-04-30_evening]] §32 verbatim source archived 2026-05-07 Capacity A
- [[../../../VAULT_RULES]] §3 ADR Numbering Additive convention §36.95
- [[../../concepts/pre-beta-full-scope-lock-v2]] LOCK 1 directive "totul pre-Beta" supersede defer v1.5 rationale invariant
- [[../../concepts/medical-safety-disclaimer-t-c-mandatory]] LOCK 4 anti-paternalism cross-link "Mi se rupe ca maria" paradigm engine = generic invariant
- [[../../concepts/aggressive-loading-warning-tier-aware]] LOCK 9 precedent compose pipeline adapter pattern uniformity

🦫 **ADR 033 MMI Engine #9 LOCKED V1 LANDED 2026-05-15. Algorithm Hibrid Lookup + Boost spec verbatim §32.1-§32.3 implementation 4 modules NEW pure-function compose pipeline post-AA.applyTo LOCK 10 LAST. Anti-paternalism ABSOLUTE preserved. Force-typing ELIMINATED PERMANENT preserved. Romanian no-diacritics LOCK V1 PERMANENT verified. Forensic transparency ADR 011 §append-only invariant. Daniel CEO autonomy MAXIMUM 14th consecutive cross-chat trust delegation preserved.**
