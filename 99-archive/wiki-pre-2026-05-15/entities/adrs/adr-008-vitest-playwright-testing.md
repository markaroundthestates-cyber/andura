---
title: ADR 008 — Vitest + Playwright Testing Baseline
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-30
authority: 03-decisions/008-vitest-playwright-testing.md test stack adoption
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[../../concepts/bugatti-craft]]"
  - "[[adr-005-vanilla-js]]"
amendments: []
---

# ADR 008 — Vitest + Playwright Testing

## Synthesis

ADR 008 = decision test stack Andura. Vitest pentru unit + integration tests (vanilla JS modules + engines + storage). Playwright pentru e2e tests (`tests/e2e/scenarios/`). Tests baseline cumulative 2781 PASS 2026-05-11 (vitest 153 test files + 2781 tests) + 1 e2e skip (`calibration-ui.spec.js:194` SKIP'd post NO_DIACRITICS_RULE strip — F1 LOW_ADHERENCE banner cross-ref P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER, port unblocks re-enable). Pre-commit hook validates baseline preserved zero regression default. Coverage scope: engines (pipeline §42.10 8 engines) + storage (IndexedDB + Firebase backup) + auth (magic link + retry 3x) + components (modals + UI helpers) + simulator + bayesian nutrition + tempo + warmup + deload + specialization + goal adaptation + periodization + cross-engine hooks.

## Verbatim quotes Daniel

Daniel verbatim chat ACASĂ 2026-04-30 ADR 008 rationale:
> *"vitest unit + integration. playwright e2e. tests baseline strict preserved. ZERO regression default."*

Daniel verbatim chat ACASĂ 2026-05-11 tests 2781 baseline reference:
> *"tests 2781 PASS preserved EXACT all commits. doc-only ZERO src/ touched."*

## Bugatti framing notes

**Gigel test relevance:** Tests = engineer-side discipline. Gigel UX surface unaffected.

**Quality > Speed via baseline preserved:** Pre-commit hook enforces tests pass invariant. NU bypass `--no-verify` decât justificat (memory rule). Bugatti craft = tests pass first, push second.

**Anti-RE considerations:** Slip pattern §AR.18 POST_BULK_REPLACE_VERIFICATION — Vitest tests pass + grep counts match NU verify browser CSS var resolution. Anti-recurrence rule: post-bulk-replace mandatory browser smoke OR self-ref grep detection.

**Voice tone notes:** Tests = Bugatti craft enforcement. Faza 2D 2026-05-11 LANDED vault meta-tooling preserved EXACT 2781 PASS all 4 commits doc-only.

## Cross-refs raw layer

- [[../../../03-decisions/008-vitest-playwright-testing]] (test stack ADR baseline)
- [[../../../vitest.config.js]] (Vitest config)
- [[../../../playwright.config.js]] (Playwright config)
- [[../../../tests/e2e/scenarios/calibration-ui.spec.js]] (line 194 SKIP'd post-strip)
- [[../../../DIFF_FLAGS]] §P1-FLAG-QA-CALIBRATION-LOW-ADHERENCE-BANNER (F1 port re-enable)
- [[../../../.husky/pre-commit]] (pre-commit hook tests gate)
- [[../../../00-index/CURRENT_STATE]] §JUST_DECIDED 2026-05-11 tests 2781 baseline reference all commits

🦫 **ADR 008 LOCK V1 2026-04-30. Vitest + Playwright. Tests 2781 PASS baseline 2026-05-11. Pre-commit hook gate Bugatti craft.**
