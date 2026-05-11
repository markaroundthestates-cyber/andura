═══════════════════════════════════════════════════════════════════
PROMPT CC — BATCH 2 ANTRENOR PORT IMPLEMENT (Step 1 Port-First-Then-React)
Model: Opus | Branch: feature/v2-vanilla-port | Mode: IMPLEMENT autonomous
═══════════════════════════════════════════════════════════════════

# Task

Execute BATCH 2 Antrenor port implement per `📥_inbox/BATCH_1_ANTRENOR_PLAN.md` §3 sequence. Port mockup V2 design (`04-architecture/mockups/andura-clasic.html` single-theme Clasic master) → prod vanilla JS modules `src/`. Restructure prod V1 6 taburi → V2 4 taburi (Antrenor/Progres/Istoric/Cont) cap-coadă. ZERO React introduction (Step 2 mecanic mapping ulterior).

Cumulative LOCKED V1 ~719 — ALL constraints below derived din vault SSOT (citation `path:§` per §CC.4):

---

# §0 — Pre-flight obligatoriu (FAIL-STOP)

```bash
# Verify branch + clean tree
git status
git branch --show-current
# Expect: feature/v2-vanilla-port, clean tree
# If branch ≠ feature/v2-vanilla-port:
git checkout feature/v2-vanilla-port
# If tree dirty: FAIL-STOP raport + STOP

# Backup tag pre-batch (rollback safety per VAULT_RULES §CC.7)
git tag pre-batch-2-antrenor-port-$(date +%Y-%m-%d-%H%M)
git push origin --tags

# Verify BATCH 1 LANDED context
git log --oneline -5
# Expect: commit `2deba60` (BATCH 1 INVENTORY+PLAN) recent în history
```

---

# §1 — Layered read mandatory §CHAT_CONTINUITY_PROTOCOL §CC.2

Sequential, NU skip:

```bash
# Layer 1: CURRENT_STATE full
cat 00-index/CURRENT_STATE.md

# Layer 2: BATCH 1 plan §3 sequence (CRITICAL — source of truth pentru implement)
cat 📥_inbox/BATCH_1_ANTRENOR_PLAN.md
# Find §3 verbatim sequence (port phases + tasks granular)

# Layer 3: ROOT_NAV_V2 canonical (4 taburi spec)
cat 04-architecture/ROOT_NAV_V2_29_5_7_AMENDMENT.md

# Layer 4: Mockup Clasic master (DESIGN MASTER per Memory rule #18)
cat 04-architecture/mockups/andura-clasic.html | head -500
# Antrenor tab sections specific

# Layer 5: ADR 005 §AMENDMENT 2026-05-10 (Port-First constraints)
cat 03-decisions/005-vanilla-js-no-framework.md | grep -A 200 "AMENDMENT 2026-05-10"

# Layer 6: Existing src/pages/coach/ structure (blast radius preserved)
ls -la src/pages/coach/
# 36+ imports references — PRESERVE all
```

---

# §2 — Constraints CEO LOCKED (DERIVED VAULT — NU întreba Daniel)

## §2.1 V1 features audit decision — KEEP ALL V1 features

**Citation:** `DECISION_LOG.md` 2026-05-10 chat ACASĂ post-noapte continuation §Scope clarifications verbatim:
> *"recovery 6 features ratate în inventory ideal — toate PĂSTRĂM existing prod transferat spec V2"*

Plus Daniel chat-current verbatim: *"mock 30% functional nemigrat"* = augment baseline, NU drop target.

**Implications BATCH 2:**
- `renderIdle.js` 465 LOC PRESERVED — keep streak counter + BMR calorie strip (NU 180 LOC strip)
- `rating.js` 150 LOC PRESERVED — keep per-set RPE granularity (NU 70 LOC strip)
- Mockup V2 minimal = visual baseline; V1 features = augment peste mockup design

## §2.2 Workflow antrenament V1 LOCK

**Citation:** `DECISION_LOG.md` Phase 2 Task 23 Cluster #6:
> *"Workflow antrenament V1 LOCK auto-advance pauză + edit manual kg+reps post-set + 3-state ENERGY 🟢🟡🔴 cross-skin × 4 (closure Cluster #6)"*

**Implementation:**
- Auto-advance pauză → next set (rest timer terminate → next set current state)
- Edit manual kg+reps post-set (set logged → editable values post-completion)
- 3-state ENERGY (NU 5 stări production drift) — 🟢 Excelent / 🟡 Normal-Ok / 🔴 Obosit-Slab + drill strict 🔴 only 4 cauze (stres/somn/durere/altul) per `src/engine/energyAdjustment/constants.js` `AGGREGATION_RULES_TABLE` deja 3-state codat

## §2.3 state.js +2 fields LOCKED tacit

**Citation:** `DECISION_LOG.md` 2026-05-10 secondary ingest §5 escalations CC raport flagged #4:
> *"state.js +2 fields proposed (currentScreen + cevaNuMergeReason) — Co-CTO LOCK tacit"*

**Add la `src/pages/coach/state.js`:**
- `currentScreen` — string, tracks active sub-section în Antrenor tab (idle / session-active / post-session-rating / etc)
- `cevaNuMergeReason` — string|null, captures "Ceva nu merge" 1 buton merge Pain+Equipment unified per Cluster #2 onboarding inputs LOCKED

## §2.4 PRESERVE `src/pages/coach/` (36+ imports blast radius)

**Citation:** `DECISION_LOG.md` 2026-05-10 secondary ingest §5 escalations #3:
> *"V1→V2 naming PRESERVE `src/pages/coach/` (36+ imports blast) — Co-CTO LOCK tacit"*

**NU rename `coach/` → `antrenor/`.** Folder structure preserved. UI strings + nav routes V2 ("Antrenor" user-facing) decoupled de folder naming.

## §2.5 Root nav 6→4 taburi structural shift

**Citation:** `04-architecture/ROOT_NAV_V2_29_5_7_AMENDMENT.md` §Root nav primary V2 SUPERSEDE LOCK FINAL:

| Tab V2 | Scope | Mapping prod V1 |
|--------|-------|-----------------|
| **Antrenor** | Sport sesiune log + Programe (5 templates) + Bibliotecă exerciții drill 2° + POST-SESIUNE RPE/Recovery | Absorbție: Coach + Program + parte Plan |
| **Progres** | Body comp + nutriție + Auto + sport plan supervision | Absorbție: Dashboard + Greutate + parte Plan |
| **Istoric** | Trecut cronologic minimalist | Existing tab preserved (drift cleanup) |
| **Cont** | Admin Cont V2 inventar complet | Setări rename + restructure |

## §2.6 Persona JS render conditional LOCKED

**Citation:** `DECISION_LOG.md` 2026-05-10 secondary ingest BATCH 1 raport:
> *"persona JS render conditional + test target ~2780"*

Per-persona render branches preserved (Maria 65 / Gigica 35 / Marius 28 Gigel-validated).

## §2.7 Engines + storage preserved EXACT

**Citation:** ADR 005 §AMENDMENT 2026-05-10 §Tactical scope preserved compatible:
> *"src/engine/ preserved import direct"*

NU touch `src/engine/` (8 engines V1 LANDED + 2731 PASS tests).
NU touch `src/storage/` / `src/firebase.js` / `src/db.js` (storage layer framework-agnostic).
NU touch `src/coach/orchestrator/` (Faza 3 STRANGLER preserved compatible).

---

# §3 — Implement sequence (CC autonomous per BATCH_1_ANTRENOR_PLAN §3)

CC reads `📥_inbox/BATCH_1_ANTRENOR_PLAN.md` §3 verbatim + executes phases in order:

- Each phase: pre-flight check → implement → smoke verify → commit + push
- Commit message format: `feat(antrenor-port-v2): <phase> — <summary>`
- `--no-verify` NEVER used (pre-commit hook vitest gate verde mandatory)
- Tests target preserve baseline 2731 PASS minimum (expand to ~2780 cu state.js +2 fields tests + 4 taburi nav tests)

**Fail-cluster mode** per Daniel verbatim *"bugatti patern nu ma intereseaza acum... ma intereseaza la final. Si bugatti da erori in executie dar la productie sunt fixed"*: NU fail-stop atomic global; fail-cluster doar pe blocker semantic critical. Continue sequential phases unless dependency hard-broken.

**`/compact` insertion** între phases (fiecare 3-5 phases major) pentru context window management.

---

# §4 — Phase 3+3.5 mockup fixes selective integrate

**Citation:** ADR 005 §AMENDMENT 2026-05-10 §Beneficii:
> *"Phase 3+3.5 mockup polish = real value (port la prod), NU throwaway"*

CC scan `04-architecture/mockups/andura-clasic.html` pentru fixes valuables care portează la prod (component patterns + UI logic + UX flows). Refactor HTML inline JS handlers → module ES (`src/pages/coach/<file>.js`) — NU copy-paste verbatim.

Skip mockup buguri buggy (din 7 mid-flight unresolved P1-FLAG-PORT-FIRST-THEN-REACT item 4 "Phase 3+3.5 fixes selective port"): CC discreet decide care fixes carry value pe baza vault audit.

---

# §5 — Acceptance gate per phase

Per phase commit:
- ✅ pre-flight clean tree + branch confirm
- ✅ tests preserved baseline (NU regression net negative)
- ✅ smoke verify (functional UI restructure, navigation 4 taburi, sesiune session lifecycle preserved)
- ✅ commit + push origin feature/v2-vanilla-port
- ✅ raport phase în `📤_outbox/LATEST.md` (cycle previous → archive)

Per total BATCH 2 LANDED:
- ✅ Tests ≥2731 PASS (target ~2780 cu state.js +2 fields)
- ✅ 4 taburi nav functional (Antrenor/Progres/Istoric/Cont)
- ✅ V1 features preserved (streak counter + BMR strip + RPE granularity + 6 recovery features per §2.1)
- ✅ Workflow antrenament V1 LOCK functional (auto-advance + manual edit + 3-state energy)
- ✅ state.js +2 fields tests pass
- ✅ persona render conditional preserved
- ✅ Engines + storage UNTOUCHED (`git diff main..HEAD -- src/engine/ src/storage/` = empty)
- ✅ Final raport consolidated `📤_outbox/LATEST_BATCH_2_CONSOLIDATED.md`

---

# §6 — Hard constraints (FAIL-STOP if violated)

- ❌ **NU touch `main` branch** — toate commit-uri pe `feature/v2-vanilla-port`
- ❌ **NU touch `src/engine/`** — engines preserved import direct
- ❌ **NU touch `src/storage/`** / `src/firebase.js` / `src/db.js`
- ❌ **NU touch `src/coach/orchestrator/`** — Faza 3 STRANGLER preserved
- ❌ **NU rename `src/pages/coach/`** folder — blast radius 36+ imports
- ❌ **NU introduce React/JSX** — Step 2 ulterior post Step 1 validation Daniel Gates smoke
- ❌ **NU `--no-verify`** pe pre-commit hook
- ❌ **NU paraphrase wording verbatim** energy 3-state / Schimbă fază destructive confirm / Workflow antrenament
- ❌ **NU `📥_inbox/` writes** — inbox strict input Daniel/Claude chat, NU CC autonomous
- ❌ Tests baseline regression (<2731 PASS) = FAIL-STOP investigation + raport
- ❌ Dacă BATCH_1_ANTRENOR_PLAN §3 sequence NU găsit în `📥_inbox/` → FAIL-STOP raport "plan missing" + STOP

---

# §7 — Fail-stop escalation conditions

Dacă întâlnești:
- Blast radius unexpected > 50+ files modified (vs expected ~10-20) → HALT phase + raport investigate
- Engine import broken post-restructure (unexpected) → HALT + raport circular dependency analysis
- Mockup `04-architecture/mockups/andura-clasic.html` ambiguous pe section → preferă pattern existing prod (V1 preserve principle §2.1)
- Tests regression neaccountable → bisect commit + raport root cause
- 7 mid-flight unresolved items P1-FLAG-PORT-FIRST-THEN-REACT clarification needed → CC raport ipoteze + Daniel decide ulterior (NU block phase, document only)

Toate fail-stop → raport `📤_outbox/LATEST.md` cu status `⚠️ Issue` + detalii + STOP. NU continua execuție phase ulterior.

---

# §8 — Output raport format (per phase + final consolidated)

## Per phase raport `📤_outbox/LATEST.md` (cycle previous → archive)

```markdown
# Raport CC — BATCH 2 Antrenor Port Phase <N>

**Task:** BATCH 2 Phase <N> — <name>
**Model:** Opus
**Branch:** feature/v2-vanilla-port
**Status:** ✅ Complete | ⚠️ Issue + reason
**Started:** <timestamp>
**Completed:** <timestamp>

## Pre-flight
- git status: clean
- branch: feature/v2-vanilla-port confirmed
- backup tag: <tag name>

## Modificări
<verbatim list files + LOC delta>

## Build + Tests
- `npm run build` + status
- `npm run test:run` + tests count + PASS/FAIL

## Commits
- <commit hash> — <message>

## Pushed
- origin feature/v2-vanilla-port

## Issues
<any encountered, or "none">

## Next action
<next phase OR "BATCH 2 COMPLETE — see LATEST_BATCH_2_CONSOLIDATED.md">
```

## Final consolidated `📤_outbox/LATEST_BATCH_2_CONSOLIDATED.md`

Aggregate end ~200-300 LOC summary toate phases + final acceptance gate verify + Daniel Gates smoke andura.app pending next.

═══════════════════════════════════════════════════════════════════
END PROMPT
═══════════════════════════════════════════════════════════════════
