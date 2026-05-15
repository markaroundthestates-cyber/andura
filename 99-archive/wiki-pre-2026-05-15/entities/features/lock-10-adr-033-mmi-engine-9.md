---
title: LOCK 10 — ADR 033 Muscle Memory Index Engine #9 V1 LANDED Pre-Beta
type: entity
subtype: feature
status: locked-v1
locked_date: 2026-05-15
authority: ADR 033 §32.1-§32.3 SPEC verbatim LOCKED V1 2026-05-02 + LOCK 10 pre-Beta promote directive cross-chat 14 birou 2026-05-14 + LOCK 10 implementation chat-current 2026-05-15 followup commit e6fd974
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[../adrs/adr-033-muscle-memory-index]]"
  - "[[../adrs/adr-018-engine-extensibility-architecture]]"
  - "[[../adrs/adr-026-offline-coaching-tree]]"
  - "[[../adrs/adr-013-auto-aggression-detection]]"
  - "[[../../concepts/aggressive-loading-warning-tier-aware]]"
  - "[[../../concepts/pre-beta-full-scope-lock-v2]]"
  - "[[../../concepts/wording-backlog-post-smoke]]"
  - "[[../../summaries/handover-2026-05-15-chat-acasa-post-evening-triple-landed-lock-9-lock-10-plus-slip-patterns]]"
amendments: []
---

# LOCK 10 — ADR 033 Muscle Memory Index (MMI) Engine #9 V1 LANDED Pre-Beta

## Synthesis

LOCK 10 = ADR 033 MMI Engine #9 V1 LANDED Pre-Beta — implementation Algorithm Hibrid Lookup + Boost spec §32.1-§32.3 verbatim 2026-05-15 commit `e6fd974`. 6+ luni pauză prima deschidere app prompts user accept/refuse cu wording Bugatti tone *"Pauza face parte din drum. Incepem treptat — corpul tau isi aminteste."* Starting weight = peak_pre_pauză × multiplicator lookup (0.80 / 0.70 / 0.60 per durată 6-12 / 12-24 / 24+ luni) + boost progresie primele 3 săpt (1.25× / 1.10× / 1.00×) accelerează re-calibrarea neuromusculară.

**4 modules NEW pure-function compose pipeline + main.js entry gate + state.js enum extend:**

1. **`src/engine/muscleMemoryIndex.js`** — pure-function core: `MMI_LOOKUP_TABLE` frozen + `getMmiBucketForPauseMonths` + `computeMmiStartingWeight` + `computeMmiBoostMultiplier` + `shouldShowMmiPrompt` decision.
2. **`src/engine/muscleMemoryAdapter.js`** — compose layer `applyMuscleMemoryUpgrade(rec, ex, mmiContext, dpEngine)` wraps DP → AA → AcceleratedLearning chain ULTIMUL (refunda baseline când user opted-in) + `readMmiState(db)` I/O boundary + `computeWeeksSinceResume(date, current)` pure helper.
3. **`src/pages/coach/muscleMemoryPrompt.js`** — UI modal Romanian no-diacritics + 2-tap override [Reincep treptat] / [De la zero] + refuse banner observable non-blocant per §32.3.
4. **`src/engine/coachContext.js` extended** — `computePauseDuration(sessionDates, currentDate)` + `extractSessionDates(logs)` pure helpers.

**Wire `src/main.js`** `proceedThroughMmiGate()` defensive try/catch sits between medical disclaimer + onboarding/coach entry — checks logs → distinct dates → pause months → if ≥6 + no choice yet → showMuscleMemoryPrompt → persist DB `'mmi-state'` `{userChoice, pauseMonths, promptedAt, resumeStartDate, peakPrePauseKgPerExercise}` → continue.

**`src/state.js:29` enum extend** — `currentScreen` adds `'muscle-memory-prompt'` for FSM coherence.

**Compose pipeline order LOCK 10 LAST cumulative cross-LOCK chat-current cumulative:**
`DP.recommend → AA.applyTo → applyAcceleratedLearningUpgrade (LOCK 9 LOOP CLOSE) → applyMuscleMemoryUpgrade (LOCK 10 LAST)`

MMI applied LAST because re-resume starting weight (engine "you've been away") wins on user opt-in; LOCK 9 accelerated learning is no-op when user has paused (no recent CDL signal).

**Tests +95 NEW PASS** (3639 → 3734 baseline cumulative chat-current cross-LOCK +209 NEW). ZERO regression preserved EXACT. Tests cover: MMI lookup table integrity (frozen Object.freeze + buckets monotonic decrease) + bucket selection (boundary cases 6/12/24 months) + starting weight computation + boost multiplier (week-1 / week-2 / week-3+) + shouldShowMmiPrompt decision (logs empty + recent activity + pause ≥6 months no choice) + pure helpers (computePauseDuration + extractSessionDates) + adapter compose order + Romanian no-diacritics regex sentinel + refuse path baseline preserved invariant + forensic flags emit verify.

**Forensic flags emit per recommendation object:** `_muscleMemoryApplied + _mmiOriginalKg + _mmiPeakPrePauseKg + _mmiStartMultiplier + _mmiBoostMultiplier + _mmiBucket`.

## Verbatim quotes Daniel

Daniel verbatim chat-current 2026-05-15 followup Category DC + DE MFP import directive simple clarify cross-context cu LOCK 10 LANDED + reaffirm scope Co-CTO autonomy MAXIMUM 14th consecutive:
> *"import de nutrition din mfp e prebeta... nutritie ca mfp e out de tot"* (clarify MFP scope existing wiki + raw layer = simplicity insist primary-source verify)

Daniel verbatim chat-current 2026-05-15 followup Category DE simplicity insist primary-source authority:
> *"deci tu intelegi ce vrei am impresia. Importa nutritie ramane, ca wording cat sa nu folosim mfp for legal pourpouses. Trebuie si la beta si post beta sa existe. Nu am idee ce nu intelegi, ca e simplu"* (CEO directive insist simplicity primary-source vault state existing)

Daniel verbatim spec §32.3 wording Bugatti tone LOCKED V1 implementation faithful:
> *"Pauza face parte din drum. Începem treptat — corpul tău își amintește."* (implementation strip diacritics per Romanian no-diacritics LOCK V1 PERMANENT 2026-05-10 authority — pending post-smoke CEO review per Category DB pattern)

Daniel verbatim spec §32.2 anti-paternalism question LOCKED V1 implementation faithful:
> *"Vrei să reîncepem treptat, de unde ai rămas, sau preferi să o luăm de la zero?"* (implementation strip diacritics — pending post-smoke CEO review per Category DB pattern)

Daniel verbatim chat birou → acasă 2026-05-14 LOCK 10 promote directive — supersede defer v1.5 rationale INVALIDATED:
> *"Mi se rupe ca maria a facut sau nu operatie"* (anti-paternalism cross-link LOCK 4 Medical Safety Disclaimer paradigm — engine = generic invariant NU user-specific reasoning hard-coded)

Daniel verbatim LOCK 1 Pre-Beta FULL strict directive cross-chat 14 birou cumulative:
> *"Aplicatia pre-beta o sa fie FULL cu tot. Post beta facem doar bug fixes daca exista, si eventual alte noi features daca constatam ca trebuie"*

## Bugatti framing notes

### Compose pipeline order MMI LAST rationale

MMI applied LAST in compose pipeline (DP → AA → AcceleratedLearning → MMI) because:
- LOCK 9 LOOP CLOSE accelerated learning wins for *recent* CDL signal (user just override aggressive +20%/+50% 2 sessions consecutive) — engine "I'm wrong" se vindecă 2-3 sesiuni. MMI is irrelevant when no pause.
- MMI wins for *pause re-resume* (6+ months no activity) — engine "you've been away" refunda baseline cu peak_pre_pauză × multiplicator opted-in. AcceleratedLearning is no-op when no recent CDL signal (just resumed).
- Two mechanisms targeting orthogonal user states (recent override pattern vs pause re-resume) — no conflict, just ordering for "last writer wins" semantics on opt-in scenarios.

Single-concern atomic commit Bugatti craft preserved invariant LOCK 10 LANDED `e6fd974` single-commit cu wiki entity STUB → V1 LOCKED promote single artefact ALL src/ + tests + wiki cumulative.

### Anti-paternalism refuse path baseline preserved

User decide accept/refuse explicit (§32.2 anti-paternalism + agency 100% per spec). Refuse path respected: `userChoice='refused'` → `applyMuscleMemoryUpgrade` returns recommendation unchanged → baseline DP+AA+AcceleratedLearning chain wins (engine încarcă greutățile maxime istorice per §32.3 refuse banner observable non-blocant). Banner observable NU rule enforcement. Cross-link Daniel verbatim 14 birou *"Mi se rupe ca maria a facut sau nu operatie"* paradigm preserved invariant: engine = invariant generic care funcționează pentru toți useri NU hard-coded special cases.

### Force-typing ELIMINATED PERMANENT preserved

Override 1-tap [Reincep treptat] / [De la zero] — **NO forced typing per ADR 013 §AMENDMENT 2026-04-30 invariant preserved**. Modal DOM zero input/textarea verify regex test. Refuse path observable non-blocking banner per §32.3 spec NU modal blocant, NU forced acknowledgment.

### Romanian no-diacritics LOCK V1 PERMANENT verified

ADR 033 source has legacy diacritics (`Începem` / `corpul tău își amintește` / `Vrei să reîncepem` / `unde ai rămas` / `preferi să o luăm`) — implementation strip per invariant LOCK V1 PERMANENT 2026-05-10 authority verify regex test on UI modal output. **§AR.31 candidate scribe-mode marked:** wording autonomous compose în PROMPT_CC LOCK 10 = SLIP §AR.26 violation (button labels "Reincep treptat (recomandat)" / "De la zero" + refuse banner full text + diacritics strip decision invocation LOCK V1 PERMANENT authority Co-CTO autonomous = CEO UX scope) — pending post-smoke CEO review per Category DB pattern verbatim *"tinele minte si cand e smoke de beta le schimbam daca nu imi plac"*.

### Forensic transparency ADR 011 §append-only invariant

MMI upgrade emits forensic flags pe recommendation object: `_muscleMemoryApplied + _mmiOriginalKg + _mmiPeakPrePauseKg + _mmiStartMultiplier + _mmiBoostMultiplier + _mmiBucket`. Audit trail visible pre-execute set (UI surface poate display indicator future iteration). DB persisted state preserves `promptedAt` ISO timestamp + `resumeStartDate` per session continuity.

### Anti-acoperiș-pereți

Engine #9 slot per ADR 018 §1 Dimension Registry plug-in additive Open-Closed — MMI integrare = INPUT signal nou pentru infrastructură compose pipeline existing (DP → AA → AcceleratedLearning chain LOCK 9), NU engine separat. 4 module NEW pure-function = minimum surface; main.js entry gate single sequential addition between LOCK 4 disclaimer + onboarding/coach (mirror pattern precedent).

## Cross-refs raw layer

- [[../adrs/adr-033-muscle-memory-index]] §32.1-§32.3 SPEC verbatim STUB → V1 LOCKED promote post LOCK 10 LANDED
- [[../../03-decisions/033-muscle-memory-index]] §32 source content verbatim LOCKED V1 2026-05-02 Daniel CEO spec authority
- [[../adrs/adr-018-engine-extensibility-architecture]] §1 Dimension Registry Engine #9 slot additive Open-Closed
- [[../adrs/adr-026-offline-coaching-tree]] §9 pure-function paradigm ADR 026 invariant preserved
- [[../adrs/adr-013-auto-aggression-detection]] §AMENDMENT 2026-04-30 Force-typing ELIMINATED PERMANENT invariant cross-link
- [[../adrs/adr-009-calibration-tiers]] §AMENDMENT 2026-05-05 Convergence Guard T2 Unlock cross-link tier advance natural
- [[../adrs/adr-011-coach-decision-log-architecture]] §append-only forensic transparency invariant cross-link
- [[../../concepts/aggressive-loading-warning-tier-aware]] LOCK 9 + LOOP CLOSE precedent compose pipeline adapter pattern uniformity cross-link
- [[../../concepts/pre-beta-full-scope-lock-v2]] LOCK 1 directive "totul pre-Beta" supersede defer v1.5 rationale invariant
- [[../../concepts/wording-backlog-post-smoke]] backlog wording autonom slip pending Daniel CEO review iteration window post-smoke beta — LOCK 10 MMI buttons + refuse banner + diacritics strip decision entries
- [[../../summaries/handover-2026-05-15-chat-acasa-post-evening-triple-landed-lock-9-lock-10-plus-slip-patterns]] handover narrative source synthesis chat-current followup Triple-LANDED cumulative

---

🦫 **LOCK 10 ADR 033 MMI Engine #9 V1 LOCKED LANDED 2026-05-15 commit `e6fd974` chat-current followup. Algorithm Hibrid Lookup + Boost spec §32.1-§32.3 verbatim implementation 4 modules NEW pure-function compose pipeline post-AA + post-AcceleratedLearning LOCK 10 LAST. Anti-paternalism ABSOLUTE preserved. Force-typing ELIMINATED PERMANENT preserved. Romanian no-diacritics LOCK V1 PERMANENT verified (wording compose autonom slip §AR.31 candidate pending post-smoke CEO review iteration). Forensic transparency ADR 011 §append-only invariant. Tests +95 NEW PASS (3639 → 3734 cumulative chat-current cross-LOCK +209). Daniel CEO autonomy MAXIMUM 14th consecutive cross-chat trust delegation preserved.**
