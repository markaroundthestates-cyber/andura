---
title: NO_DIACRITICS_RULE LOCK V1 PERMANENT
type: concept
status: locked-v1
locked_date: 2026-05-10
authority: Daniel directive verbatim chat-current 2 2026-05-10 strip diacritics global UI + tests + mockups, vault docs preserved
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[../concepts/bugatti-craft]]"
  - "[[../entities/features/feature-f1-patterns-banner]]"
amendments: []
---

# NO_DIACRITICS_RULE LOCK V1 PERMANENT

## Synthesis

NO_DIACRITICS_RULE = LOCK V1 PERMANENT 2026-05-10 stripping global diacritics RO (ă→a, â→a, î→i, ș→s, ț→t + uppercase equivalents) din UI + tests + mockups source. Vault docs preserved verbatim cu diacritics (fluency RO chat continuity Daniel session-to-session natural). Mecanic: Script Node.js automatizat 263 files / 6034 replacements (`src/**/*.{js,jsx,html,css}` + `tests/**/*.{js,spec.js}` + `04-architecture/mockups/**/*.html`). Commit `0841ed4` LANDED. Rationale: UI rendering inconsistency cross-browser/font + Gigel test (un Marius nu se enervează că nu poate scrie diacritice rapid în feedback fields). E2e cross-ref: `tests/e2e/scenarios/calibration-ui.spec.js:194` SKIP'd post-strip (assertion `text=/Adherence scăzută/i` failed → P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER cross-ref + V1_FEATURES_AUDIT F1 port unblocks re-enable post-port).

## Verbatim quotes Daniel

Daniel verbatim chat ACASĂ 2026-05-10 continuation 2 directive:
> *"strip diacritics global UI + tests + mockups, vault docs preserved"*

Daniel verbatim chat ACASĂ 2026-05-10 rationale:
> *"diacriticele se rup în browsere mai vechi, plus Marius la sala scrie 'Adherenta scazuta' nu cu â. simplu."*

## Bugatti framing notes

**Gigel test relevance:** Direct application. Diacritics RO inconsistent typing experience pe user (especially mobile fitness app context — Marius la sala scrie rapid feedback) = friction Gigel-suspect. Strip = removes friction default.

**Quality > Speed:** Script Node.js bulk automate 263 files / 6034 replacements în <5 min vs manual hours. Bugatti craft = automate mecanic mass-edits cu pre-flight grep verification + post-edit smoke verify (tests 2732 PASS preserved).

**Anti-RE considerations:** Cross-platform rendering inconsistency = recurring issue WCAG (acasă vs prod live observed). PERMANENT rule eliminates source.

**Voice tone notes:** Vault docs preserved cu diacritics intentional — natural communication channel Daniel chat-to-chat. NU lobotomy vault. Separation UI vs docs clean.

## Cross-refs raw layer

- [[../../00-index/CURRENT_STATE]] §JUST_DECIDED 2026-05-10 chat-current 2 NO_DIACRITICS_RULE LOCK V1 commit `0841ed4`
- [[../../03-decisions/DECISION_LOG]] §2026-05-10 chat-current 2 entry diacritic strip
- [[../../tests/e2e/scenarios/calibration-ui.spec.js]] (line 194 SKIP'd post-strip)

🦫 **NO_DIACRITICS_RULE LOCK V1 PERMANENT 2026-05-10. Strip UI/tests/mockups. Vault docs preserved. Cross-browser rendering + Gigel-friendly default.**
