---
title: F6 — PR Wall UX Surface (Personal Records Achievements List Visual Badges)
type: entity-feature
status: landed
last_updated: 2026-05-12
audit_verdict: keep-verbatim
cross_refs:
  - "[[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F6"
  - "[[../engines/engine-pr-wall]]"
  - "[[feature-f11-prs-notification]]"
---

# F6 — PR Wall

## Synthesis

**F6 PR Wall** = personal records achievements list visual badges Antrenor idle surface. V1 prod `renderPRWall` function display PR aggregate snapshot. V1_AUDIT verdict **KEEP verbatim** — PR-uri motivație core gym, "🏆 Squat 100kg achievement" high engagement Gigel cultural RO (gym pride). Direct port verbatim, implementation tractable LOC.

**UX surface mockup V2:** Card prominent Antrenor idle "🏆 PRs Recent" listă top 3-5 PR achievements badge format (emoji + exercise + kg/reps + date). Complementary [[feature-f11-prs-notification]] post-session notification + cross-engine [[../engines/engine-pr-wall]] detectPR 3 types (weight/reps/volume) integration.

**Engine integration:** PR Wall consum data din `extractAndSavePRs` (commit `041e7f2` BATCH 2 SLICE 0 rating.js port F11 preserved verbatim) + aggregate snapshot `src/pages/coach/pr.js` (separate concern from prEngine.js detection layer). Share Card opt-in trigger only NU auto-share deferred §29.5.2 dynamic share cards consumer wiring (UX contract per ADR 027 Forta Foundation 1 §29.2.5).

## Verbatim quotes Daniel

Daniel verbatim §F6 keep verbatim audit rationale Gigel cultural RO gym pride:
> *"PR-uri = motivație core gym. '🏆 Squat 100kg achievement' = high engagement Gigel cultural RO (gym pride). Direct port. Implementation probabil tractable LOC."*

Daniel verbatim UX contract Bugatti factual wording anti-hype:
> *"Discrete badge in-set NOT modal NOT push notification — Bugatti factual wording, NU hype, NU emoji-spam. Share Card opt-in trigger only."*

## Bugatti framing notes

**Gigel test relevance:** PR badges visual concise "🏆 Squat 100kg" = zero gândire user (instant recognize gym achievement). Cultural RO gym pride alignment. Gigel test PASS.

**Quality > Speed via discrete badges in-set:** Anti-modal-blocking + anti-push-notification UX contract preserved (per ADR 027 Forta Foundation 1 §29.2.5 LOCKED). Pattern: badge surface NU forced modal.

**Anti-RE considerations:** BATCH 2 SLICE 0 commit `041e7f2` F11 PRs preserved verbatim invariant — extractAndSavePRs + cleanFakeLogs preserved logic. NU re-design F11/F6 split.

**Anti-paternalism notes:** Share Card opt-in trigger only NU auto-share = user agency preserved. User decides what shares NU app pushes (anti-engagement-spam pattern).

**Voice tone notes:** Daniel-ism "Bugatti factual wording NU hype" recurring pattern (anti-marketing-spam discipline). Cultural RO gym pride preserved.

## Cross-refs raw layer

- [[../../../04-architecture/V1_FEATURES_AUDIT_V1]] §F6 verdict KEEP verbatim
- [[../../../src/engine/prEngine.js]] detectPR 3 types weight/reps/volume detection layer
- [[../../../src/pages/coach/pr.js]] aggregate snapshot persistent layer separate from prEngine
- [[../../../src/pages/coach/rating.js]] (F11 extractAndSavePRs preserved BATCH 2 SLICE 0 commit `041e7f2`)
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §29.2.5 Forta Foundation 1 LOCKED + §29.5.2 share cards consumer deferred
- [[../engines/engine-pr-wall]] (3 PR types detection cross-engine integration)
- [[feature-f11-prs-notification]] (post-session notification complementary surface)

🦫 **F6 PR Wall KEEP verbatim. Personal records achievements visual badges Antrenor idle. Cultural RO gym pride alignment Gigel test PASS. Complementary F11 post-session notification + cross-engine prEngine.js 3 types detection.**
