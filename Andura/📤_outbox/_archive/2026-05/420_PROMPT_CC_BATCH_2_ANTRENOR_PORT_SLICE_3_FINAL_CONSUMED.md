═══════════════════════════════════════════════════════════════════
PROMPT CC — BATCH 2 ANTRENOR PORT closure SLICE 3 (FINAL milestone)
Model: Opus | Branch: feature/v2-vanilla-port | Mode: IMPLEMENT autonomous
═══════════════════════════════════════════════════════════════════

# Task

Execute BATCH 2 closure SLICE 3 (FINAL slice) — `restTimer.js` SVG ring countdown visual extend + smoke E2E playwright 4 taburi (Antrenor/Progres/Istoric/Cont) + vault hub sync §CC.5 FULL atomic BATCH 2 closure milestone. Citation `path:§` mandatory per §CC.4.

## CONTEXT continuation chain (chat ACASĂ 2026-05-12 same session)

**Carry-forward LANDED commits prior this session on `feature/v2-vanilla-port`:**
- `ebd656e` idle.js port + 3 engine gap-uri (STAGE 4 SUB-BATCH 2 prior)
- `041e7f2` rating.js — F13 DROP V1 + F14 EXTEND 20→90 + F11/F12/F15 preserved verbatim
- `324d198` session.js — dead-code cleanup downstream F13
- `8a4c39e` energyCheck.js — 3 states (Excelent/Normal/Obosit) + 4 cauze drill
- `f941fd7` painButton.js — 3 visible + Altceva textarea (mockup overrides ADR EXT-1)
- `a17b0a3` cevaNuMerge.js — 4 preset SUPERSEDE ADR 023 split per CURRENT_STATE 2026-05-10
- `01686c7` vault hub sync slice-level SLICE 1
- [SLICE 2 commits per `📤_outbox/LATEST.md`] equipmentSwap + workout + vault sync slice-level

**Tests current baseline:** 2891 PASS preserved exact (zero regression cumulative).

---

# §0 Pre-flight (FAIL-STOP)

```bash
git status                                    # clean tree MANDATORY
git branch --show-current                     # = feature/v2-vanilla-port
git log --oneline -15                          # verify SLICE 1+2 commits visible
git tag pre-batch-2-closure-slice-3-FINAL-2026-05-12-$(date +%H%M)
git push origin --tags
```

Branch ≠ `feature/v2-vanilla-port` → FAIL-STOP raport + STOP.
Dirty tree → FAIL-STOP raport + STOP.

---

# §1 Layered read mandatory §CC.2

Sequential, NU skip — citation `path:§` post-read:

```bash
cat 00-index/CURRENT_STATE.md | head -300                                # §NOW + §NEXT + §ACTIVE_FLAGS verify
cat src/pages/coach/restTimer.js                                          # current V1 implementation baseline
grep -B 2 -A 80 "rest-timer\|restTimer\|rest_timer\|circle\|svg" 04-architecture/mockups/andura-clasic.html
cat 03-decisions/008-vitest-playwright-testing.md                         # ADR 008 stack LOCK V1
ls -la tests/                                                              # locate e2e folder structure
find tests -type f -name "*.spec.js" | head -20                            # existing playwright patterns reference
cat src/router.js                                                          # 4 taburi routing for smoke spec
cat src/state.js | head -50                                                # router enum + state shape
```

---

# §2 Constraints CEO LOCKED (DERIVED VAULT — NU întreba)

## §2.1 AUDIT PRIMAT universal rule (slip pattern preserved SLICE 1+2)

`V1_FEATURES_AUDIT_V1.md` scope §0 LIMITED renderIdle + rating only — NU acoperă restTimer extend + smoke E2E. Alternate authority chain applied (consistent SLICE 1+2 reconciliation pattern):

- **restTimer SVG ring:** mockup `04-architecture/mockups/andura-clasic.html:§rest-timer` V2 design SoT + V1 existing prod `src/pages/coach/restTimer.js` countdown logic preserved as base (extend NU rewrite)
- **smoke E2E:** `03-decisions/008-vitest-playwright-testing.md` LOCK V1 stack + `src/state.js` V2 4 taburi router enums (line 29) + V2 mockup as visual SoT

## §2.2 HARD constraints preserved (cumulative SLICE 1+2 pattern)

- ZERO main branch touch (feature branch only)
- ZERO React/JSX (Step 2 mecanic ulterior Port-First-Then-React paradigm)
- ZERO `src/engine/` touch (renders read engine output, NU touch logic)
- ZERO `src/storage/` touch
- ZERO `src/coach/orchestrator/` touch
- ZERO `.obsidian/` touch (chat-side Daniel manual)
- ZERO `wiki/` Cluster A SUB-BATCH 1 27 pages touched (frozen post Phase 5 per CLAUDE.md §6.4)
- ZERO §CC.6 violation (raw layer freeze policy per CLAUDE.md §1.1+§6.4+§6.5)
- ZERO `--no-verify` (pre-commit hook vitest gate verde MANDATORY)
- ZERO test regression (baseline ≥2891 PASS preserved)
- PRESERVE `📥_inbox/` files: `PLAN_ANTI_HALUCINATIE_VAULT.md` + `_karpathy_gist_reference.md` + `HANDOVER_2026-05-12_chat_acasa_install_pack_12_LANDED.md` + `claude_desktop_config.json.backup-2026-05-12` (NU touch)

## §2.3 Atomic commits single-concern Bugatti + push origin per commit

3 atomic commits expected SLICE 3:
1. restTimer SVG ring extend
2. Smoke E2E playwright 4 taburi
3. Vault hub sync §CC.5 FULL BATCH 2 closure milestone

---

# §3 Implementation scope SLICE 3

## §3.1 restTimer.js SVG ring countdown visual extend

**Spec source (alternate authority chain audit primat):**
- Mockup `04-architecture/mockups/andura-clasic.html:§rest-timer` — countdown circular SVG ring visual
- V1 existing `src/pages/coach/restTimer.js` — countdown seconds + alarm beep + pause/resume preserved (extend NU rewrite)

**Behavior spec verbatim (citation mockup post-read):**
- SVG circle ring fills inversely (full circumference → empty as time depletes)
- Stroke-dasharray + stroke-dashoffset animation pattern (smooth countdown)
- Color states transitions:
  - 100% → 30% remaining: green normal (`var(--accent)` or mockup hex)
  - 30% → 10% remaining: amber warning
  - <10% remaining: red urgent + pulse animation
- Center text countdown numeric "MM:SS" preserved
- Pause/resume button preserved
- Tap-to-skip preserved (per V1 UX)

**Gigel test PASS criteria:**
- Visual intuitive (zero gândire user — circle empties = time running out, obvious)
- ZERO suspicious behavior (no flashing modals, no surprise UI)

**Skills CC recommended slice §3.1:**
- **Sequential Thinking:** dacă decizie SVG architecture complex (gradient vs solid + animation timing function + state transitions)
- **Impeccable /critique:** post-LANDED UI parity check vs mockup §rest-timer (compare color tokens + spacing + animation speed perception)
- **Context7:** SVG stroke-dashoffset animation best practices dacă uncertain

**Atomic commit message:**
```
feat(batch-2): restTimer.js SVG ring countdown visual extend per mockup §rest-timer V2 design

- SVG circle ring fills inversely with time depletion (stroke-dashoffset animation)
- 3 color states: green normal / amber 30% / red urgent <10% + pulse
- Center text MM:SS preserved + pause/resume + tap-to-skip preserved
- V1 countdown logic + alarm beep preserved (extend NU rewrite)
- Tests new: ring fill calculation + color state transitions + integration cu existing timer logic

Cite: mockup §rest-timer line <N>-<M> + V1 src/pages/coach/restTimer.js base
```

---

## §3.2 Smoke E2E playwright 4 taburi (Antrenor/Progres/Istoric/Cont)

**Spec source:**
- ADR `03-decisions/008-vitest-playwright-testing.md` LOCK V1 — playwright stack pattern
- `src/router.js` — V2 4 taburi routing implementation
- `src/state.js:29` — router enum allowed values
- Mockup `andura-clasic.html` — visual SoT pentru key elements assert per tab

**Suite scope:**
- File NEW: `tests/e2e/v2-4-taburi-smoke.spec.js` (sau path equivalent per ls structure §1 discovery)
- Min 5 tests:
  1. **Antrenor tab smoke** — navigate → assert idleText visible → assert energyCheck button visible → state.currentScreen === 'antrenor'
  2. **Progres tab smoke** — navigate → assert chart container visible → state correct
  3. **Istoric tab smoke** — navigate → assert session list visible → state correct
  4. **Cont tab smoke** — navigate → assert profile section visible → state correct
  5. **Cross-tab persistence** — set workout state Antrenor → navigate Progres → back Antrenor → assert workout state preserved

**Per-test pattern:**
- Page navigation via router (NU URL direct manual)
- `page.waitForLoadState('networkidle')` before assertions
- `expect(page.locator(<selector>)).toBeVisible({ timeout: 5000 })`
- Console errors assertion: `page.on('console')` capture + assert ZERO `'error'` level emissions
- ZERO flaky waits (NU `page.waitForTimeout(N)` arbitrary)

**Run target:**
```bash
npm run test:e2e             # green MANDATORY pre-commit
# OR equivalent npm script pattern existing per package.json
```

**Skills CC recommended slice §3.2:**
- **Context7:** lookup latest playwright best practices (waitForLoadState, expect.toBeVisible auto-retry, page.evaluate patterns) docs real-time
- **Sequential Thinking:** test architecture decision (page object pattern vs flat assertions for 4 taburi smoke — recommend flat for smoke, page object pentru complex E2E later)
- **gstack /qa:** post-LANDED full suite verification cumulative

**Atomic commit message:**
```
test(batch-2): smoke E2E playwright 4 taburi V2 (Antrenor/Progres/Istoric/Cont) per ADR 008

- 5 tests minimum: 4 tab navigation smoke + 1 cross-tab persistence
- Console errors assertion zero emissions per test
- ZERO arbitrary timeouts (waitForLoadState + auto-retry expect)
- Cite: ADR 03-decisions/008-vitest-playwright-testing.md + src/state.js:29 enums + src/router.js V2 4 taburi
```

---

# §4 Vault hub sync §CC.5 FULL — BATCH 2 closure milestone

Post §3.1 + §3.2 LANDED, execute FULL atomic vault hub sync (NU brief slice-level pattern SLICE 1+2 anterior — acum closure milestone deserves §CC.5 full atomic):

## §4.1 CURRENT_STATE.md atomic move-then-replace

1. **§NOW** current entry (Install Pack 12 LANDED 2026-05-12) → move to §RECENT shift block
2. **§NOW** NEW entry BATCH 2 closure FULL milestone narrative (~80-120 LOC cu structure: chat-current scope + 3 atomic commits SLICE 3 + cumulative BATCH 2 totals + slips captured + path forward §NEXT)
3. **§JUST_DECIDED** top entry NEW BATCH 2 closure milestone (above Install Pack 12 entry)
4. **§NEXT** overwrite P1-P5 progression — P1 next options (3 paths):
   - Option A: Phase 3 SUB-BATCH 3 wiki populate (~95-120 pages projected) multi-session overnight via GSD `/gsd-execute-phase` subagent orchestration
   - Option B: Calendar feature implement LOCK V1 STRATEGIC (~1000-1500 LOC + 80-120 tests; scheduleAdapter.js + deviationMemory.js + UX vanilla 7-day strip)
   - Option C: Daniel Gates manual smoke prod andura.app post-deploy `feature/v2-vanilla-port` → `main` pre-production decision (separate strategic discussion)
5. **§ACTIVE_FLAGS** updates:
   - `P1-FLAG-BATCH-2-ANTRENOR-PORT-INTERRUPTED-RELUARE` 🟡 PROMOTED → 🟢 **RESOLVED LANDED** flip
   - Add NEW `P1-FLAG-BATCH-2-CLOSURE-MILESTONE-LANDED` 🟢 RESOLVED entry
6. **§RECENT** shift entry SLICE 1+2+3 aggregate
7. **Header `**Updated:**`** flip timestamp 2026-05-12 chat ACASĂ BATCH 2 closure milestone

## §4.2 DECISION_LOG.md entry append top

Entry top:
```
## 2026-05-12 chat ACASĂ Co-CTO autonomous BATCH 2 Antrenor port closure FULL milestone LANDED `feature/v2-vanilla-port`

[narrative ~30-50 LOC: 11 atomic commits cumulative BATCH 2 chain + audit primat reconciliation pattern preserved 3 slices + slips captured non-blocker + tests baseline preserved 2891+ → 2891+SLICE_3 PASS + cumulative LOCKED V1 preserved unchanged ~742]
```

## §4.3 INDEX_MASTER.md flip

Last updated 2026-05-12 chat ACASĂ BATCH 2 closure milestone + cross-refs append dacă need NEW entries per slice 3 modules.

## §4.4 DIFF_FLAGS.md entries

- Flip flag BATCH 2 RESOLVED entry
- Add new milestone closure entry timestamp 2026-05-12

## §4.5 wiki/log.md append chronological

Append entry (Karpathy log signature `## [YYYY-MM-DD] <type> | <title>`):
```
## [2026-05-12] BATCH 2 closure | Antrenor port FULL milestone LANDED

11 atomic commits cumulative `feature/v2-vanilla-port`: idle.js + rating.js + session.js + energyCheck.js + painButton.js + cevaNuMerge.js + equipmentSwap.js + workout.js + restTimer.js SVG ring extend + smoke E2E playwright 4 taburi V2 + vault hub sync §CC.5 atomic. Tests 2891+ PASS preserved (zero regression cumulative). Audit primat reconciliation pattern applied 3 slices (V1_FEATURES_AUDIT scope LIMITED renderIdle + rating; alternate authority chain mockup V2 SoT + ADRs + state.js pre-stubbed enums). Path forward P1 fork (wiki SUB-BATCH 3 / Calendar feature / Daniel Gates deploy `main`).
```

## §4.6 LATEST.md raport cycle

Previous SLICE 2 `📤_outbox/LATEST.md` → archive `📤_outbox/_archive/2026-05/<NN>_LATEST_SLICE_2_CONSUMED.md` (auto-increment NN).
Write new `📤_outbox/LATEST.md` BATCH 2 closure milestone raport (~150-200 LOC structured §0-§7).

## §4.7 Final commit + push

```bash
git add -A
git commit -m "chore(vault): BATCH 2 Antrenor port closure milestone LANDED — vault hub sync §CC.5 atomic"
git push origin feature/v2-vanilla-port
git push origin --tags
```

Pre-commit hook gate verde mandatory (vitest ≥2891 PASS).

---

# §5 Acceptance criteria (all mandatory pass)

- ✅ Pre-flight clean + backup tag pushed origin pre-execute
- ✅ restTimer SVG ring extend LANDED + mockup parity verified (Impeccable /critique OK or skip dacă marginal value)
- ✅ Smoke E2E playwright 4 taburi LANDED + green `npm run test:e2e`
- ✅ Tests baseline preserved + extended (≥2891 PASS unit/integration + smoke E2E green)
- ✅ Build clean vite (`npm run build`)
- ✅ Vault hub sync §CC.5 FULL atomic LANDED per §4.1-§4.7
- ✅ 3 atomic commits SLICE 3 (restTimer + smoke + vault sync) + push origin all
- ✅ HARD CONSTRAINTS all preserved (ZERO main + ZERO engine + ZERO React + ZERO .obsidian + ZERO wiki frozen + ZERO --no-verify + ZERO §CC.6 violation + ZERO `📥_inbox/` writes outside expected)
- ✅ §CC.4 citation format applied în CURRENT_STATE/DECISION_LOG/wiki/log entries (`path:§` verbatim)
- ✅ Raport `📤_outbox/LATEST.md` final BATCH 2 CLOSURE FULL milestone — Daniel trigger "latest" în chat NEW pattern operational

---

# §6 Skills CC ecosystem (Pack 12 LANDED 2026-05-12, decision tactic CC per task)

Recommended fit per slice section:

| Task | Skill | Rationale |
|------|-------|-----------|
| §3.1 SVG architecture decisions | Sequential Thinking | Complex visual state transitions |
| §3.1 mockup parity check | Impeccable /critique | UI design parity verification |
| §3.1 SVG animation patterns | Context7 | Real-time docs lookup |
| §3.2 playwright best practices | Context7 | Latest API patterns |
| §3.2 test architecture | Sequential Thinking | Page object vs flat assertions |
| §3.2 post-LANDED full suite | gstack /qa | Cumulative verification |
| Pre-final commit | gstack /review | Quality gate |

GSD `/gsd-execute-phase` parallelization **NU recommended** aici (restTimer + smoke + vault sync sequential dependent — vault sync follows after both LANDED).

---

# §7 Raport `📤_outbox/LATEST.md` format mandatory final

Structure pattern (preserve SLICE 1+2 raports format):

```markdown
**Task:** BATCH 2 Antrenor Port CLOSURE FULL milestone — SLICE 3 final (restTimer SVG ring + smoke E2E playwright 4 taburi + vault hub sync §CC.5 atomic)
**Model:** Opus
**Status:** ✅ Complete — 3 atomic commits + tests ≥2891 PASS preserved + smoke E2E green + vault hub sync §CC.5 full atomic + BATCH 2 closure milestone
**Branch:** `feature/v2-vanilla-port`
**Date:** 2026-05-12 chat ACASĂ Co-CTO autonomous BATCH 2 closure milestone

# Raport: BATCH 2 closure FULL milestone — 2026-05-12

## §0 Pre-flight status
## §1 Audit primat reconciliation (V1_FEATURES_AUDIT scope absence vs alternate chain — pattern preserved SLICE 1+2+3)
## §2 Modificări LANDED (per slice 3 module + vault sync)
## §3 Build + Tests
## §4 Commits + Push (cumulative BATCH 2 chain summary)
## §5 Issues (blockers / non-blockers / slips)
## §6 Cumulative BATCH 2 totals (11 atomic commits + tests trajectory + LOC stats)
## §7 Next action P1 fork (Option A / B / C per §NEXT vault)

🦫 **Bugatti craft. BATCH 2 Antrenor Port closure FULL milestone LANDED 2026-05-12 chat ACASĂ Co-CTO autonomous.**
```

---

# §8 Workflow operațional pattern nou (post-LANDED Daniel trigger)

Post BATCH 2 closure LANDED + raport `📤_outbox/LATEST.md` scris:
- Daniel scrie "latest" în chat
- Claude chat read `📤_outbox/LATEST.md` via filesystem MCP + raport factual Daniel + decizie P1 next fork (wiki SUB-BATCH 3 / Calendar / handover prudent dacă bandwidth saturat)

ZERO recap din chat anterior — Daniel verifică direct în terminal CC LIVE output. Chat = decision layer + artefacte generation + handover via MCP cap-coadă singular.

---

GO Bugatti craft. BATCH 2 closure milestone.
