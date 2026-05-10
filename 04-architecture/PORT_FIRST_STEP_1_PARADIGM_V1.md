# Port-First Step 1 Paradigm — LOCKED V1 2026-05-10

**Status:** LOCKED V1 2026-05-10 chat ACASĂ continuation 2 (Claude chat autonomous Co-CTO scope per Daniel autonomy lock EXTINS verbatim *"CEO nu are nici un review de facut. Esti CTO figure it out fara sa ma deranjezi. Run autonomous. O sa fac review inainte de launch beta a-z."*). All 7 sub-decisions LOCK V1 Co-CTO bias preserved. Predecessor `SPEC DRAFT V1` (Co-CTO recommendations pe 5 tactical + 2 flagged Daniel-decide strategic) superseded. Execute Step 1 Port-First-Then-React paradigm per [[../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-10.
**Date:** 2026-05-10 chat ACASĂ continuation MCP filesystem (Co-CTO autonomous draft per Daniel directive *"continuă autonomy până Beta"*)
**Owner:** Daniel (CEO + Product, final LOCK V1) + Claude chat (Co-CTO Reviewer scope tactical)
**Cumulative LOCKED V1:** ~719 PRESERVED unchanged pre-LOCK. Post-LOCK V1: TBD (+5-7 net depending Daniel sign-off).
**See also:** [[../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-10 Port-First Pre-React | [[../DIFF_FLAGS]] P1-FLAG-PORT-FIRST-THEN-REACT (7 sub-decisions verbatim) + P1-FLAG-STRATEGIC-SHIFT-CLASIC-MASTER (single-theme Clasic master FIRST) | [[mockups/andura-clasic.html]] design SoT canonical | [[REACT_MIGRATION_STATE_MAPPING_V1]] Step 2 React migration mapping reference

---

## Context

Per [[../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-10 Port-First-Then-React LOCKED V1: prod `src/` vanilla JS layout vechi (6 taburi V1 Coach/Dashboard/Greutate/Program/Plan/Setări) → port mockup V2 design (4 taburi Antrenor/Progres/Istoric/Cont) → Step 2 React migration mecanic mapping post Step 1 validation Daniel Gates smoke.

7 mid-flight sub-decisions Step 1 scope clarification pending. Co-CTO scope tactical = sub-decisions 1, 2, 5, 6 (engineering paradigm). CEO scope strategic = sub-decisions 3 (UX restructure), 4 (Phase 3+3.5 fixes selectivity — UX behavior choices), 7 (mockup post-port paradigm — design preservation strategy). Sub-decisions 4 + 7 mixed = Daniel-decide cu Co-CTO context provided.

---

## Sub-decisions Co-CTO recommended (5 tactical)

### #1 Pre-port mockup buguri fix decision

**Recommended Co-CTO:** **Clean state mockup ÎNTÂI** — fix all known mockup bugs before port begins.

**Rationale Bugatti:** Port = mecanic mapping mockup → vanilla JS modules. Carrying mockup debt forward = anti-Bugatti (introduces buggy patterns la prod, contaminate fresh port). Quality > Speed default. Fix once în mockup (single SoT), port clean once. Alternative "fix forward în vanilla" duplicates work + risks divergence între mockup design + prod implementation.

**Counter rejected:** "Direct port + fix vanilla forward" = velocity short-term, but introduces 2-stage debt (mockup buggy + vanilla port broken patterns). Quality cost compounds.

**Estimated:** ~30-60 min mockup buguri sweep pre-port (depends list buguri actual — Daniel audit pre-LOCK).

---

### #2 Step 1 port paradigm

**Recommended Co-CTO:** **Structural restructure cap-coadă** — port mockup V2 4 taburi structurally complete, NU incremental tab-by-tab.

**Rationale Bugatti:** Mockup V2 design = clean SoT. Tab-by-tab incremental accumulates intermediate state (3 V2 taburi nou + 6 V1 taburi vechi = 9 taburi mid-port, broken UX user-facing). Structural cap-coadă = single port pass clean → V2 4 taburi complete. Port-once cleaner architecture, NU stratificat.

**Counter rejected:** "Incremental tab-by-tab" = lower risk per-step but accumulated debt (mid-port app contradictoriu user-facing) + double maintenance window (V1 + V2 simultan câteva săptămâni). Plus per Daniel directive *"prod în development per Daniel verbatim 'putem lucra pe ea si testa real time'"* — Daniel-only environment, NU users active = zero downtime cost structural restructure.

**Estimated:** ~1-2 săpt CC continuous post mockup clean state (#1) + Daniel CEO sub-decisions #3 + #4 LOCKED.

---

### #5 Branch strategy

**Recommended Co-CTO:** **NEW branch `feature/v2-vanilla-port`** — Step 1 port code work isolated. `feature/phase-3-orchestrator-final` archived (NU merged main, audit raports preserved per chat-current 2026-05-10 archived NN 350-352).

**Rationale Bugatti:** Per memory rule "Step 1 vanilla port code work `src/` → `feature/v2-vanilla-port` separat (NU vizibil KB direct, rollback safety). Post Step 1 validation 100% Daniel Gates smoke → merge feature → main → KB sync code state actualizat." Already partial-LOCKED V1 in [[../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-10 §Branch strategy. Reaffirm explicit pre-execute.

**Counter rejected:** "Continue feature/phase-3-orchestrator-final" = polluted branch (Phase 3+3.5 mockup polish work + audit raports + ZERO src/ changes confirmed via `git diff origin/main..HEAD -- src/` chat-current 2026-05-10). New branch = clean slate.

**Step 2 React migration:** Same pattern — new feature branch (`feature/react-migration` ex) post Step 1 validation merged main.

---

### #6 Testing strategy Step 1

**Recommended Co-CTO:** **Vitest 2734 PASS preserved + extend pentru noi prod paths** — NU test rewrites.

**Rationale Bugatti:** Test suite 2734 PASS = engineering capital cumulative (engines pure functions ADR 018 §2 contract preserved). Step 1 port = UI layer + state.js → reorganize, engines unchanged (per [[../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-10 §Tactical scope §Engine integration "Pure functions imports preserved exact"). Tests existente continue valide. Extend cu integration tests pentru noi UI paths (4 taburi V2 router + state Context, eventual). Quality continuity > rewrite-from-scratch loss.

**Counter rejected:** "Test rewrites" = throwaway 2734 PASS coverage + reintroduce regression risk. Anti-Bugatti.

**Validation:** Pre-commit hook vitest gate verde mandatory. CI/CD typecheck + unit + build mandatory pre-merge feature branch.

---

## Sub-decisions flagged Daniel-decide CEO (2 strategic)

### #3 UI restructure scope: 6 taburi V1 → 4 taburi V2

**Co-CTO context:** Mapping options:
- **Option A: Rename + merge + drop** — V1 Coach + Program + Plan → V2 Antrenor (3→1 merge); V1 Dashboard + Greutate → V2 Progres (2→1 merge); V1 Setări → V2 Cont (1→1 rename); NEW V2 Istoric (drop or new from V1 Plan history).
- **Option B: Structural rewrite** — V2 4 taburi de la zero per mockup design; ZERO carry V1 structure assumption.

**Trade-off:**
- A preservă V1 muscle memory (Daniel-only user mid-Beta) + carry forward V1 features cunoscute. Risk: V1 mental model leaks în V2 architecture.
- B clean slate per mockup SoT. Risk: V1 features valoroase pierdute neintenționat (ex: streak counter, BMR strip, per-set RPE granularity per [[../DIFF_FLAGS]] P1-FLAG-PORT-FIRST-THEN-REACT carry-forward note).

**Recommended Co-CTO bias:** B (structural rewrite per mockup) **DAR** cu V1 features audit explicit pre-port (sub-decision #4) ca să garantez ZERO valoare pierdută.

**Daniel CEO LOCK pending:** A vs B decizie. Plus dacă B → pre-port V1 features audit cu Daniel review keep/drop per feature.

---

### #4 Phase 3+3.5 fixes selective port (carry value vs throwaway)

**Co-CTO context:** Phase 3+3.5 work LANDED chat-uri 2026-05-09 + 2026-05-10 = mockup polish (NU prod src/ changes per `git diff` audit). Fixes value mixed:
- **Carry value (recommend port):** WCAG accessibility fixes 7/7 LANDED, Theme Parity Invariant LOCK V1, Glossary jargon LOCK V1, Actions cost optimization 5 fixes — toate UX universale aplicabile prod.
- **Throwaway (recommend skip):** Mockup-specific HTML inline JS handlers + temporary patches pentru mockup standalone testing — irelevante prod ES modules architecture.
- **Conditional (Daniel decide):** UI behavior choices per Phase 3+3.5 cluster (#1 Coach Setări split, #4 Istoric layout, #6 Workflow V1) — UX strategic, NU engineering paradigm.

**Recommended Co-CTO bias:** Daniel review per-cluster Phase 3+3.5 fix list + decide keep/drop. Co-CTO can prepare detailed audit list cu per-fix recommendation Bugatti perspective post #3 LOCK V1 (depends UI restructure scope decided).

**Daniel CEO LOCK pending:** Per-cluster fix selection. Co-CTO handles audit list generation tactical post #3 LOCK.

---

### #7 Mockup paradigm post-port

**Co-CTO context:** Two paradigms post Step 1 port complete:
- **Option A: Archive mockup historic** — `04-architecture/mockups/` move to `06-sessions-log/_archive/mockups-pre-port/` (or similar). Mockup served purpose, port-once done.
- **Option B: Preserve mockup as design reference** — mockup stays active SoT design tokens + visual reference for Step 2 React migration mecanic mapping + future themes Lux/BC ports.

**Trade-off:**
- A reduces vault clutter (post-port mockup obsolete). Risk: Step 2 React migration loses design SoT (need recreate from prod state, lossy).
- B preserves SoT continuity Step 1 → Step 2 → future themes. Cost: ongoing mockup maintenance question (Daniel update mockup când design evolves, sau frozen post Step 1 port?).

**Recommended Co-CTO bias:** B (preserve as design reference) **CU** explicit "frozen pre-React" status — mockup post-port = historical design SoT, NU updated forward. Step 2 React = mecanic mapping din mockup snapshot Step 1 LANDED. Future themes = port from frozen mockup or new design files separate.

**Daniel CEO LOCK pending:** Archive vs preserve + dacă preserve → frozen vs maintained.

---

## Recommended LOCK V1 sequence

1. Daniel review SPEC DRAFT V1 (this file) — ~10-15 min CEO scope
2. Daniel CEO LOCK V1 sub-decisions #3 + #4 + #7 (strategic UX scope)
3. Co-CTO LOCK V1 sub-decisions #1 + #2 + #5 + #6 (tactical engineering scope) — pre-execution, post Daniel sign-off pe SPEC DRAFT V1 entire
4. Pre-port: mockup buguri sweep (#1) + V1 features audit per #4 cluster scope
5. Execute Step 1: structural restructure cap-coadă (#2) cu mockup V2 design SoT (#3) → prod `src/` vanilla JS modules pe `feature/v2-vanilla-port` (#5) cu test suite preserved + extended (#6)
6. Smoke validation Daniel Gates andura.app live → merge feature → main
7. Step 2 React migration mecanic mapping (separate planning post Step 1 LANDED)

---

## Cross-refs

- [[../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-10 — Port-First Pre-React LOCK V1 foundation
- [[../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-08 — React Migration tactical scope Step 2 preserved compatible
- [[../DIFF_FLAGS]] P1-FLAG-PORT-FIRST-THEN-REACT — 7 sub-decisions verbatim source
- [[../DIFF_FLAGS]] P1-FLAG-STRATEGIC-SHIFT-CLASIC-MASTER — single-theme Clasic master FIRST cap-coadă LOCK V1 (compatibil port-first paradigm)
- [[../00-index/CURRENT_STATE]] §JUST_DECIDED 2026-05-10 chat ACASĂ continuation auto-watcher race P3 RESOLVED + chat ACASĂ MCP filesystem direct paradigm vault hygiene + §AR.19 + prod bugs fix triple atomic LANDED
- [[mockups/andura-clasic.html]] — V2 mockup design SoT canonical (single-theme master per STRATEGIC SHIFT 2026-05-10)
- [[REACT_MIGRATION_STATE_MAPPING_V1]] — Step 2 React migration mapping reference (state.js → Context+useReducer mecanic mapping)
- [[ROOT_NAV_V2_29_5_7_AMENDMENT]] — root nav V2 4 taburi LOCKED (Antrenor/Progres/Istoric/Cont)
- Phase 3.6 cluster #1 attempt CC autonomous HALT raports archived NN 350-352 (PREFLIGHT + AUDIT + LATEST_HALT) — historical context port-first pivot trigger

---

## §LOCK V1 2026-05-10 Co-CTO Autonomous (Daniel autonomy lock EXTINS)

**Authority:** Daniel autonomy lock EXTINS verbatim chat-current 2026-05-10 *"CEO nu are nici un review de facut. Esti CTO figure it out fara sa ma deranjezi. Run autonomous. O sa fac review inainte de launch beta a-z."* — Claude chat strategic autonomous scope EXTENDED (NU doar Co-CTO Reviewer tactical, ci CTO figure-it-out paradigm complete UX scope mine until Beta launch). Tactical + strategic sub-decisions toate Co-CTO autonomous LOCK V1.

**Verdict 7/7 sub-decisions Co-CTO bias preserved verbatim per recommendations §#1-§#7:**

- **#1 LOCK V1: Clean state mockup ÎNTÂI** — Bugatti single SoT clean port. Mockup buguri sweep pre-port (~30-60 min) prerequisite execution BATCH 2 Antrenor. Carry mockup debt forward = anti-Bugatti rejected.
- **#2 LOCK V1: Structural restructure cap-coadă** — port-once paradigm, Daniel-only env zero downtime cost. Tab-by-tab incremental rejected (mid-port app contradictoriu user-facing + double maintenance window).
- **#3 LOCK V1: Option B Structural rewrite per mockup** — Bugatti SoT V2 design canonical. Gated by #4 audit V1_FEATURES_AUDIT_V1 LOCK V1 — carry value subset preserved (WCAG + Theme Parity + Glossary + Actions cost). Conditional clusters: Coach Setări split = port (V2 4-tab paradigm), Istoric layout = port from mockup, Workflow V1 (auto-advance pauză + edit manual kg+reps post-set) = port mandatory pre-Beta SUFLET ANDURA scope per §36.57.
- **#4 LOCK V1: Selective port driven by V1_FEATURES_AUDIT_V1 LOCK V1** — 10 keep + 4 modify + 1 drop V2-deferred (per V1_FEATURES_AUDIT_V1 §LOCK V1 2026-05-10 Co-CTO Autonomous companion document).
- **#5 LOCK V1: NEW branch `feature/v2-vanilla-port`** — clean slate isolated rollback safety. `feature/phase-3-orchestrator-final` archived NU merged main (audit raports preserved NN 350-352).
- **#6 LOCK V1: Vitest 2732 PASS preserved (post-strip baseline) + extend** — engineering capital cumulative preserved (engines pure functions ADR 018 §2 contract preserved). Test rewrites rejected (anti-Bugatti).
- **#7 LOCK V1: Option B Preserve frozen mockup post-port** — design SoT continuity Step 1 → Step 2 React → future themes Lux/BC. Mockup frozen pre-React (NU updated forward post-port). Step 2 React = mecanic mapping din mockup snapshot Step 1 LANDED.

**Cumulative impact:** +7 net LOCK V1 (cumulative ~719 PRESERVED → +7 = ~726, partial pre-companion V1_FEATURES_AUDIT_V1 +15).

**Cross-refs:**
- [[V1_FEATURES_AUDIT_V1]] §LOCK V1 2026-05-10 Co-CTO Autonomous (companion document, gates #4 selective port scope)
- [[../00-index/CURRENT_STATE]] §JUST_DECIDED top entry chat-current 2026-05-10 chat ACASĂ continuation 2
- [[../03-decisions/DECISION_LOG]] entry top descending cronologic 2026-05-10 chat ACASĂ continuation 2
- [[../DIFF_FLAGS]] P1-FLAG-PORT-FIRST-THEN-REACT 🟢 LOCKED V1 SUBSTANTIVE → 🟢 LOCKED V1 EXECUTION-READY (sub-decisions all LOCK V1 autonomous)

---

🦫 **Bugatti craft. LOCKED V1 2026-05-10 Co-CTO Autonomous Daniel autonomy lock EXTINS scope (CTO figure-it-out paradigm). 7/7 sub-decisions LOCK V1 bias preserved. Execute Step 1 Port-First paradigm BATCH 2 Antrenor port unblocked pending mockup buguri sweep prerequisite (#1). Path către Beta cel mai high-leverage unblock LANDED autonomous.**
