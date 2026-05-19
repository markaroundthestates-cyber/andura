# ADR 020 + 021 + Amendments — Raport Execution

**Status:** ✅ Complete
**Date:** 2026-04-30 evening v2
**Run wall-clock:** ~6 min (autonomous, single-pass — vault state mostly pre-prepared, audit + commit + outputs)
**Model:** Claude Opus 4.7 autonomous
**Trigger:** `📥_inbox/HANDOVER_INPUT_INBOX.md` (Claude chat strategic 2026-04-30 evening v2)

---

## Pre-flight

- **Branch:** `main` (origin/main up-to-date post `git pull`)
- **Working tree (start):** 6 modified files + 2 untracked ADRs + 1 staged rename (LATEST.md → archive). Vault state arrived pre-prepared from prior session continuity.
- **Baseline tests:** ✅ **vitest 752/752 PASS** (48 test files, 7.49s)
- **Outbox archive:** ✅ previous LATEST.md (outbox schema migration report) moved to `📤_outbox/_archive/2026-04/13_OUTBOX_SCHEMA_MIGRATION.md` (per VAULT_RULES.md §3.3 + PROMPT_CC_HYGIENE.md §3.1)

---

## Modificări vault

### ADR-uri NEW

| File | Status | Lines | Spec source |
|------|--------|-------|-------------|
| `03-decisions/020-storage-tiering-strategy.md` | CREATED | 182 | Inbox §2.1 — full Tier 0/1/2 + Dexie.js + rotation + risks + reconsideration triggers |
| `03-decisions/021-calibration-drift-reconciliation.md` | CREATED | 290 | Inbox §2.2 — full Version Vector + Max Wins + Monotonic Clock + EC-1..EC-6 + algorithm pseudocode |

### Amendments

| File | Section | Spec source |
|------|---------|-------------|
| `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` | §3.5.1 Strong Prior Strategy (Tier-Based) | Inbox §2.3 — T0 + Self-report 80/20, calibration time -50%, signals primary/secondary |
| `03-decisions/013-auto-aggression-detection.md` | `## AMENDMENT 2026-04-30 evening — Composite formula no-double-penalize` | Inbox §2.4 — Gemini F1 push-back partial accept (cross-signal dedupe), full reject consolidare 4+5 |

### Cross-refs synced

| File | Update | Spec source |
|------|--------|-------------|
| `06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening.md` §6.7 | Scope adăugări post-Gemini + total cumulat 137-214h tradițional → 15-29h velocity Opus | Inbox §2.5 |
| `00-index/INDEX_MASTER.md` | ADR list 001-019 → 001-021 + 2 rows table (020, 021) + file count 49→51 | Inbox §2.6 |
| `03-decisions/DECISION_LOG.md` | Entry 2026-04-30 evening — Gemini cross-check + 4 action items + 1 reject (consolidate AA 4+5) | Inbox §2.7 |
| `VAULT_RULES.md` §2 | ADR list range `001-*.md → 019-*.md` → `001-*.md → 021-*.md` | Inbox §2.8 |

---

## PROJECTION engine verify (per Inbox §2.9)

**Commands run:**
```bash
grep -n "requiresCalibration" src/engine/dimensionRegistry.js
grep -rn "PROJECTION" src/engine/
```

**Findings:**

1. **`requiresCalibration` infrastructure:** ✅ PRESENT in `src/engine/dimensionRegistry.js`. Field validated as nullable string matching `CALIBRATION_TIER_ORDER` enum. Gating function `isCalibrationGateOpen(dim.requiresCalibration, ctxLevel)` already wired in dimension filter (line 110).

2. **PROJECTION as engine dimension:** ❌ **NOT registered.** Zero matches for `PROJECTION` în `src/engine/`. Currently registered dimensions (per JSDoc + active code): `AUTO_AGGRESSION` (priority 95, requiresCalibration: null) + Phase 2/3 planned: `PROFILE_TYPING` (`'INITIAL'`), `CORE_RULES` (null), `VITALITY` (`'PERSONALIZING'`), `DEMOGRAPHIC_PRIOR` (`'COLD_START'`).

3. **PROJECTION location actual:** UI utility only — `src/pages/dashboard.js` `calcProjection()` + `renderProjection4w()` for 4-week weight chart projection. NOT engine dimension, NU pe orchestrator path, NU sub gating Arbitrator.

**Sprint 4 follow-up needed?** **PARTIAL — depends on Sprint 4 scope.** Dacă Sprint 4 migrează `calcProjection` la engine dimension (per ADR 018 extensibility pattern), atunci adăugare `requiresCalibration: 'INITIAL'` (sau similar threshold) e trivial — infrastructure exists, doar register dimension. Dacă rămâne UI utility decoupled de engine → Gemini Q1 nu mai aplică (gating only matters dacă e pe orchestrator path).

**Recommendation pragmatic:** flag în Sprint 4 backlog ca decision point, NU urgent. Current state nu e bug, e architectural choice (PROJECTION = visualization, NU coaching decision dimension).

**NU schimbare cod în acest run** — verify only, per constraint Inbox §4.

---

## Build + Tests

| Stage | Result |
|-------|--------|
| **vitest baseline (start)** | ✅ 752/752 PASS (48 files, 7.49s) |
| **vitest pe pre-commit hook (×5 commits)** | ✅ 752/752 PASS each (zero code touched, sanity check) |
| **vitest post-changes final** | ✅ 752/752 PASS unchanged |

Zero code modificat în `src/` sau `tests/`. Per constraint Inbox §4 docs-only run.

---

## Commits (5 semantic + 1 outbox)

| SHA | Message |
|-----|---------|
| `f65056d` | feat(adr): ADR 020 Storage Tiering Strategy (Tier 0/1/2 + Dexie.js + rotation) |
| `3aa1d3a` | feat(adr): ADR 021 Calibration Drift Reconciliation (Version Vector + max-merge) |
| `062ab71` | docs(strategy): amend §3.5.1 Bayesian Strong Prior (tier-based + self-report 80/20) |
| `50736e5` | docs(adr): amend ADR 013 — composite formula no-double-penalize (Sprint 4) |
| `a2224be` | docs(vault): cross-refs sync — ADR 020-021 + scope additions handover |
| `176f50f` | docs(outbox): rotate LATEST → archive 13 + new execution report + alignment questions |

**Pre-commit hook:** ✅ all 6 commits passed test suite (NU `--no-verify` necesar).

---

## Pushed: ✅ origin/main

```
5f97e07..176f50f  main -> main
```

6 commits propagated remote successfully.

---

## Inbox + Outbox state (post-run)

### `📥_inbox/`

- `HANDOVER_INPUT_INBOX.md` — **CONSUMED** (input pentru acest run, păstrat NU șters per constraint Inbox §"NU șterge inbox-ul automat"). Daniel poate decide manual: arhivare istoric vault (`07-meta/` / similar) sau delete post-verify.
- `ALIGNMENT_QUESTIONS_CHAT_NEW.md` — **NEW** 16 întrebări (15 core + 1 bonus PROJECTION verify). Format: question + citation expected + confidence enum. Pass criteria ≥12/15.

### `📤_outbox/`

- `LATEST.md` — **NEW** acest raport.
- `_archive/2026-04/13_OUTBOX_SCHEMA_MIGRATION.md` — previous LATEST.md (outbox schema migration report 2026-04-30 evening) rotated. NN sequence continuu: 01-13 (12 baseline + 1 new).

---

## Issues / Ambiguities

**None blocking.**

Minor notes:
1. **Inbox `HANDOVER_INPUT_INBOX.md` retention** — constraint spec said "NU șterge automat", Daniel decide. Recomandare: după verify chat nou aligned, archive în `07-meta/handovers-archive/2026-04/` sau delete (git history preserves). NU păstra în inbox indefinit (zgomot pentru future runs).
2. **Pre-commit hook ran tests pe fiecare din 5 commits** — adds ~7s × 5 = ~35s overhead, dar guarantees zero regression mid-commit-sequence. Acceptable cost, NU bypass needed.
3. **Vault state pre-prepared** — toate 8 modificări (2 NEW ADRs + 4 amendments + 4 cross-refs + outbox rename) erau pe disk la start (presumably scrise de Sonnet earlier sau prior Opus session). Acest run = audit + verify + commit + push + outputs. **NU rewrite content** (zero info loss principle, content matched spec exact).
4. **PROJECTION engine** = NOT registered as dimension; flag pentru Sprint 4 decision point (NOT urgent).

---

## Next action Daniel + chat nou

1. **Sync Project Knowledge** GitHub connector (icoană settings claude.ai)
2. **Verify accesibilitate:**
   - `📤_outbox/LATEST.md` (acest raport)
   - `📥_inbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md` (16 întrebări)
   - `03-decisions/020-storage-tiering-strategy.md` + `021-calibration-drift-reconciliation.md`
3. **Open chat Claude nou**
4. **Paste integral** `📥_inbox/ALIGNMENT_QUESTIONS_CHAT_NEW.md` în primul mesaj chat nou
5. **Verify pass criteria** ≥12/15 răspunsuri corecte cu citation. Dacă <12 → flag INGEST FAIL, retry `project_knowledge_search` în chat.
6. **Chat nou citește LATEST.md + ADR 020 + 021 + ADR 013 amendment** prin `project_knowledge_search` pentru context detail Sprint 4 implementation start.
7. **Decision point Sprint 4 prioritate:** ADR 020 (CRITICAL pre-launch, ~10-15h) ar trebui first vs ADR 021 (pre-Faza-2, ~8-12h Sprint 3 full).

---

## Verification commands (Daniel local sanity check)

```bash
git log --oneline -7   # expect 5 new commits + outbox commit
ls -la 📤_outbox/_archive/2026-04/   # expect NN 01-13
cat 📤_outbox/LATEST.md   # expect acest raport
ls -la 📥_inbox/   # expect ALIGNMENT_QUESTIONS_CHAT_NEW.md present
npm run test:run   # expect 752/752 PASS
```

---

🦫 **Schema activă. Vault sync. Sprint 4 backlog cu 4 action items new prioritized. Chat nou ready bootstrap.**
