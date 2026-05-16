---
title: Engine PR Wall — Personal Records Detection + extractAndSavePRs F11 BATCH 2
type: entity-engine
status: landed
last_updated: 2026-05-12
cross_refs:
  - "[[../adrs/adr-009-calibration-tiers]]"
  - "[[../adrs/adr-020-storage-tiering-strategy]]"
  - "[[../../../src/engine/prEngine.js]]"
  - "[[../../../src/pages/coach/rating.js]]"
---

# Engine PR Wall — Personal Records Detection (Forta Foundation 1)

## Synthesis

**PR Engine** = detect personal records at set-logging time. **3 PR types** per Forta Foundation 1 (§29.2.5 LOCKED): (1) `weight` new max weight at any reps for exercise; (2) `reps` matched-or-heavier weight + more reps than any prior set; (3) `volume` new max single-set volume (weight × reps). Implementation `src/engine/prEngine.js` cu function `detectPR(exercise, set, history)` pure deterministic — returns `{type, kg, reps, prevBest}` or null no-PR. Baseline-injected entries ignored per existing `extractAndSavePRs` convention (history filter `!e.baseline`).

**UX contract:** Discrete badge in-set (NOT modal, NOT push notification) — Bugatti factual wording (NU hype + NU emoji-spam). Share Card opt-in trigger only (NU auto-share, deferred §29.5.2 dynamic share cards consumer wiring). **F-NEW-2 progression matrix does NOT block PR detection** — both axes coexist per ADR 009.

**BATCH 2 SLICE 0 carry-forward LANDED 2026-05-12 commit `041e7f2`** — rating.js port preserved F11 PRs (extractAndSavePRs + cleanFakeLogs verbatim) cu F13 rating notes DROP V1 Anti-RE rule LOCKED V1 PERMANENT applied. F14 EXTEND `sRatings.slice(0, 20)` → `sRatings.slice(0, 90)` per ADR 020 Tier 0 active rolling 90 sessions (PR detection needs ≥90 ratings history). LOC delta rating.js 150 → 137 (-13).

## Verbatim quotes Daniel

Daniel verbatim BATCH 2 SLICE 0 F11 PRs preservation rationale verbatim:
> *"F11 PRs (extractAndSavePRs + cleanFakeLogs) + F12 3-button modal (USOARA/NORMALA/GREA) + F15 per-set RPE preserved verbatim. F13 rating notes DROP V1 Anti-RE rule LOCKED V1 PERMANENT applied."*

Daniel verbatim Bugatti factual wording UX contract rationale:
> *"Discrete badge in-set NOT modal NOT push notification — Bugatti factual wording, NU hype, NU emoji-spam. Share Card opt-in trigger only."*

## Bugatti framing notes

**Gigel test relevance:** Discrete badge in-set surface = zero gândire user (vede subtle indicator, NU forced modal blocking workflow). Anti-hype wording (NU "NEW RECORD!!!"). Bugatti factual.

**Quality > Speed via 3 PR types coverage:** Weight + reps + volume = comprehensive PR detection (NU only 1RM max weight). Pattern: detect orice progression axis legitim (max weight at any reps + max reps at matched weight + max volume single-set).

**Anti-RE considerations:** F-NEW-2 progression matrix + PR detection both axes coexist per ADR 009 = anti-recurrence "progression matrix replaces PR detection" misinterpretation. Both signals independent valid.

**Anti-paternalism notes:** Share Card opt-in trigger only NU auto-share = user agency preserved. User decides what shares, NU app pushes notification.

**Voice tone notes:** Daniel-ism "Bugatti factual wording NU hype" recurring pattern (anti-marketing-spam discipline). Preserved cross-engine UX contract.

## Cross-refs raw layer

- [[../../../src/engine/prEngine.js]] (detectPR pure function 3 types + baseline filter)
- [[../../../src/pages/coach/rating.js]] (F11 PRs detection extractAndSavePRs + cleanFakeLogs)
- [[../../../src/pages/coach/pr.js]] (aggregate snapshot — different concern PR Wall persistent)
- [[../../../03-decisions/009-calibration-tiers]] (F-NEW-2 progression matrix coexist axis)
- [[../../../03-decisions/020-storage-tiering-strategy]] §Tier 0 active rolling 90 sessions PR history
- [[../../../03-decisions/DECISION_LOG]] §2026-05-12 BATCH 2 SLICE 0 rating.js port F11 preserved commit `041e7f2`
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §29.2.5 Forta Foundation 1 LOCKED + §29.5.2 dynamic share cards consumer deferred

🦫 **Engine PR Wall personal records detection 3 types (weight/reps/volume). UX contract discrete badge in-set Bugatti factual wording. BATCH 2 SLICE 0 F11 preserved verbatim + F14 EXTEND 20→90 ratings window Tier 0 archive.**
