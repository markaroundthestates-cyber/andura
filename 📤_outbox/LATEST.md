# BATCH 1 — ANTRENOR PORT INVENTORY + PLAN ✅

- **Task:** BATCH 1 Antrenor port — INVENTORY + PLAN ONLY (mockup V2 → src/ vanilla JS)
- **Model:** Opus 4.7
- **Branch:** `feature/v2-vanilla-port` (created from `main` HEAD `fa43d9c`)
- **Status:** ✅ Complete + ⚠️ ESCALATION 4/5 bug §1.4 prompt slip flagged
- **Pre-flight:**
  - ✅ ADR 005 §AMENDMENT 2026-05-08 read (vanilla SUPERSEDED → reverted port-first pivot 2026-05-10 confirmed by commit `fa43d9c`)
  - ⚠️ ADR_MULTI_TENANT_AUTH path slip: prompt cited `.md`, actual `_v1.md`. Non-blocking.
  - ✅ Big 6 / onboarding / T0 found în auth ADR (lines 597, 599)
  - ✅ src/ V1 antrenor module = `src/pages/coach/` (10 files, ~1930 LOC)
  - ✅ Mockup `andura-clasic.html` 2351 LOC, Antrenor cluster 748–1170 (~423 LOC, 8 screens)
- **Modificări:** ZERO src/ (Task 1 = read + plan only). Only docs added în `📤_outbox/`.
- **Build:** N/A
- **Tests:** 2731 baseline preserved EXACT (no src/ touched)
- **Commits:** 1 (docs only on `feature/v2-vanilla-port`)
- **Pushed:** branch initial push origin
- **Issues / ESCALATION pentru Daniel:**
  1. **ADR 005 reconciliation:** §AMENDMENT 2026-05-08 still says vanilla SUPERSEDED by React. Port-first 2026-05-10 pivot NOT documented as §AMENDMENT. Recommend Daniel write §AMENDMENT 2026-05-10 entry pre-BATCH 2.
  2. **Bug §1.4 prompt slip — 4/5 NOT verifiable verbatim:**
     - KG_INCREMENTS 26.6/25.4 — **0 matches** în mockup. Prod truth `weights.js` = 1/2.5/4.5/5 kg.
     - "Altceva" 5-th repeat — 2 instances găsite (single-shot pain-button), NU "5-th iteration".
     - Task S chart range — chart e în Istoric (1656–1697), NOT Antrenor. Out of scope.
     - Task L splash setTimeout — 1 setTimeout cu guard (line 2312), NU race conditions multi-trigger.
     - Bug 13 reload Refă onboarding — Settings flow clean (1594, 1730), NOT Antrenor.
     - **Daniel clarifies bug source (chat-strategic chat-N? vault doc path?) sau confirmă "ZERO Antrenor blocker bugs" → port proceeds clean.**
  3. **V1 → V2 naming:** Recommend PRESERVE `src/pages/coach/` (V1 internal naming, 36+ cross-imports stable). UI tab id `antrenor` only. Daniel LOCK?
  4. **state.js extension:** +2 fields (`currentScreen`, `cevaNuMergeReason`) propus. Daniel accept OR alt approach (router context obj)?
  5. **V1 features audit:** `renderIdle.js` 465→180 LOC + `rating.js` 150→70 LOC trim — risc pierdere streak/BMR strip/per-set RPE. Daniel review pre-BATCH 2.
- **Deliverables:**
  - `📤_outbox/BATCH_1_ANTRENOR_INVENTORY.md` ~360 LOC (§0 pre-flight + §1.1 V1 src/ + §1.2 mockup V2 + §1.3 diff + §1.4 bugs honest audit + §1.5 open questions)
  - `📤_outbox/BATCH_1_ANTRENOR_PLAN.md` ~280 LOC (§2.1 file structure + §2.2 state.js + §2.3 engine + §2.4 components + §2.5 bugs fixes conditional + §2.6 risks + §2.7 tests + §3 BATCH 2 sequence + §4 LOCK paradigm checklist)
- **Next action:** Daniel review inventory + plan + answer 5 escalation items + LOCK paradigm checklist §4 → BATCH 2 implement (separate prompt CC).
