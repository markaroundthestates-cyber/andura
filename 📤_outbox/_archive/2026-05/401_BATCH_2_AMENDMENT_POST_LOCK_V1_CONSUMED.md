# BATCH 2 — Amendment post-LOCK V1 (§4 checklist 7/7 RESOLVED)

**Task:** BATCH 1 PLAN §4 checklist post-LOCK V1 reconciliation — 7 items resolved before BATCH 2 execution unblocks.
**Date:** 2026-05-10
**Branch:** `feature/v2-vanilla-port`
**Model:** Opus 4.7
**Authority:** Daniel autonomy lock EXTINS verbatim *"CEO nu are nici un review de facut. Esti CTO figure it out fara sa ma deranjezi. Run autonomous. O sa fac review inainte de launch beta a-z."* — Co-CTO autonomous scope CTO figure-it-out paradigm complete UX scope mine until Beta launch.

---

## Resolution per §4 checklist item

### 1. ADR 005 reconciliation — RESOLVED

§AMENDMENT 2026-05-10 Port-First Vanilla Pre-React LOCK V1 LANDED in `03-decisions/005-vanilla-js-no-framework.md`. REVERTS + SUPERSEDES §AMENDMENT 2026-05-08 (React migration tactical scope). Vanilla preserved active stack Step 1 + React Step 2 mecanic mapping post Step 1 validation Daniel Gates smoke.

### 2. Bug §1.4 source clarified — RESOLVED

4/5 buguri cited în prompt BATCH 1 §1.4 NOT VERIFIABLE post mockup buguri sweep #1 LANDED commit `42c4108`. Post-sweep mockup `04-architecture/mockups/andura-clasic.html` 2144 LOC clean baseline established:
- KG_INCREMENTS 26.6/25.4 = 0 matches grep mockup
- Single setTimeout splash boot benign (guard în place line 2314 area)
- 5-th "Altceva" duplicate NU în mockup state machine

Out-of-scope buguri = (a) Istoric chart range incomplete (lines 1656–1697, Istoric tab NOT Antrenor); (b) splash app shell edge cases (NOT Antrenor tab); (c) Bug 13 Settings reload Refă onboarding (Settings tab NOT Antrenor). DEFERRED to separate post-Beta scope per priority.

### 3. V1 → V2 naming — RESOLVED Co-CTO Autonomous

PRESERVE `src/pages/coach/` directory internal naming. Rationale: 36+ engine cross-file imports stable, rename churn = anti-Bugatti zero value. UI tab id `antrenor` lives în router/UI layer only per BATCH 1 PLAN §2.1 recommendation. Internal "coach" naming + external "Antrenor" branding consistent V1 pattern Daniel-only mid-Beta env (zero user-facing impact rename internal).

### 4. state.js +2 fields — RESOLVED Co-CTO Autonomous

ACCEPT BATCH 1 PLAN §2.2 proposal:
- `currentScreen: string` (default `'antrenor'` tab landing) — router state for back() handling intra-Antrenor sub-pages (energy-check, cause, ceva-nu-merge, pain-button, equipment-swap, workout, post-rpe)
- `cevaNuMergeReason: string|null` (null | 'pain' | 'equipment' | 'altceva') — fan-out routing context Ceva nu merge unified drill

Total fields: 24 → 26 (+2 minimum). Global state.js singleton consistent V1 pattern Bugatti craft. ALTERNATIVE router context object rejected — mixing patterns adds cognitive load.

### 5. Persona conditional pattern — RESOLVED Co-CTO Autonomous

ACCEPT BATCH 1 PLAN §2.6 risk #2 mitigation: **JS render conditional based on `state.profile.persona` snapshot at mount + re-render on persona-change event**. NOT CSS `.marius-only` / `.persona-maria-only` class direct (mockup paradigm V2 = JS-driven render în vanilla port). Snapshot at mount + dispatch listener prevents async race între profile detection + screen render.

### 6. V1 features audit — RESOLVED via V1_FEATURES_AUDIT_V1 §LOCK V1

15 features mapped (10 keep verbatim + 4 modify simplified + 1 drop V2-deferred):
- **Keep 10:** F2 last session memory + F4 readiness verdict + F6 PR wall + F7 coach director + F8 streak counter + F10 stats grid + F11 PRs notification + F12 rating buttons + F13 rating notes auto-apply + F15 per-set RPE granularity
- **Modify 4:** F1 patterns 5→2 (LOW_ADHERENCE + STAGNATION keep; drop HIGH_DEVIATION + EARLY_END + PEAK_HOURS gimmick) + F3 fatigue (drop visual bar, single number + culoare) + F9 BMR strip (drop strip, single line summary) + F14 ratings window (extend 20→90 cu Tier archive ADR 020)
- **Drop 1:** F5 AA friction modal (defer v1.5 inline UX flow non-blocking)

LOC targets adjusted: `renderIdle.js` 465 LOC → `idle.js` LOC TBD post-port (Bugatti quality > arbitrary 180 LOC limit per BATCH 1; F2+F4+F6+F7+F8+F10+F11 carry weight). `rating.js` 150 LOC → `postRpe.js` LOC TBD (F12+F13 keep + F14 extend window + F15 per-set RPE inline). F3 fatigue visual bar drop + F9 BMR strip drop simplifies idle.js footprint.

### 7. Test coverage target — RESOLVED Co-CTO Autonomous

BATCH 1 PLAN §2.7 ~2780 target ACCEPT base. Adjust upward per F14 ratings window extend + F15 per-set RPE granularity preserve = **~2790-2810 final target**. Tests baseline 2732 PASS preserved EXACT mandatory per PORT_FIRST_STEP_1_PARADIGM_V1 sub-decision #6 LOCK V1 (engines pure functions ADR 018 §2 contract preserved, NU test rewrites).

---

## Status

All 7 §4 checklist items RESOLVED. BATCH 2 execution unblocked. Proceed Step 0 pre-flight verify + Step 1 router/state extension.

🦫 Bugatti craft. Co-CTO Autonomous LOCK V1 paradigm preserved. Path către Beta unblocked.
