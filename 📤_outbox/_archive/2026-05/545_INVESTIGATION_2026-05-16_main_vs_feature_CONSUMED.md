# INVESTIGATION — main ↔ feature/v2-vanilla-port divergence 2026-05-16

**Type:** Read-only analysis. ZERO commits, ZERO destructive ops, ZERO checkout, ZERO push.
**Trigger:** Deploy main 2026-05-16 ABORTED at TASK B per `📤_outbox/LATEST.md` (commit 9807e3d). Branch divergence non-trivial → Daniel decision required.
**Merge-base:** `71e6445` (common ancestor)

---

## §1 Commits main NU pe feature (count: 16)

```
80c85f8 chore(vault): LATEST.md prev raport hashes injected post-push accuracy
6785ab6 feat(mockup): 6 fixes sweep LANDED — Warmup + Deload + Tempo Marius + weaknessDetector lagging + PR drill + Mini-player
72d3b09 chore(auto): "📤_outbox/LATEST.md"
c7d8457 docs(vault): prod bugs reconcile verify atomic — P1-FLAG-PROD-AUTO + P1-FLAG-PROD-BF-EDIT status flip RECONCILED RESOLVED
298304b docs(vault): ADR 023 V1 SUPERSEDED Anti-RE rule + ADDENDUM archived + P1-FLAG-1 RESOLVED
82393cd chore(vault): LATEST.md commit hashes injected post-push accuracy
fc40d66 chore(vault): LATEST.md raport §CC.5 ingest audit 22 engines + 6 fixes + Anti-RE rule LOCKED V1 PERMANENT
b143519 chore(vault): §CC.5 ingest handover AUDIT_MOCKUP_22_ENGINES_6_FIXES + Anti-RE rule LOCKED V1 PERMANENT + F13 drop V1 + slip §AR.1 fix
6b5f5b2 chore(vault): LATEST.md commit hashes injected post-push accuracy
8b7728e chore(vault): §CC.5 ingest handover MOCKUP_CLASIC_FINAL_v2 + audit + INSIGHTS_BACKLOG strategic insight training schedule override
7498fd6 chore(mockup): replace andura-clasic.html with v2 (Co-CTO 2026-05-11 ~98% compliant V2 spec) + backup tag pre-replace
4d7923e chore(vault): LATEST.md update commit/pushed status accurate post-ingest
9f73754 chore(vault): update CURRENT_STATE per handover 2026-05-11 mockup clasic final + paradigm adaptive reconfirm
220c95f chore(vault): LATEST.md cycle NN 368 — §CC.5 fast handover ingest chat ACASĂ continuation 3 raport + previous LATEST archived
a379beb docs(vault): §CC.5 fast handover ingest chat ACASĂ continuation 3 — mockup sweep #1 + BATCH 2 SUB-BATCH 1 LANDED — BIROU SETUP next-chat P1
2e51561 chore(auto): 00-index/CURRENT_STATE.md "📤_outbox/_archive/2026-05/367_HANDOVER_..._CONSUMED.md" + "📥_inbox/HANDOVER_..._BATCH_2_SUB_BATCH_1_LANDED_BIROU_SETUP_NEXT.md"
```

**Substance classification:**
- 1 substantive product commit: `6785ab6` (mockup 6 fixes sweep)
- 1 substantive mockup replace: `7498fd6` (v2 ~98% compliant)
- 2 substantive vault doc commits: `c7d8457` (prod bug reconcile), `298304b` (ADR 023 SUPERSEDED + P1-FLAG-1 RESOLVED)
- 1 substantive handover ingest: `b143519` (audit 22 engines + 6 fixes Anti-RE rule)
- Restul (10/16) = LATEST.md hash injects + auto-commits + handover/ingest plumbing

---

## §2 Commits feature NU pe main (count: 239)

**Top 30 most recent:**
```
9807e3d chore(outbox): LATEST.md raport deploy main 2026-05-16 ABORTED at TASK B — branch divergence main ↔ feature non-trivial, Daniel decision required
e45b736 chore(vault): LATEST.md update handover ingest 2026-05-16 post slip cluster + archive predecessor
875f9c5 chore(vault): archive consumed handover artefacte 2026-05-16 slip cluster
cb3391a docs(primer): §5 smoke claim correcție + §3 deploy on-demand operational state per D010 D011
12523b8 docs(decisions): D010 + D011 + D012 codify operational state + autonomy reinforcement post slip cluster 2026-05-16
e82edb5 chore(vault): cleanup post pre-beta cap-coada batch 2026-05-16 + PRIMER drift fix
2c450f7 chore(vault): LATEST.md update Pre-Beta Cap-Coadă Batch 2026-05-16 COMPLETE + archive predecessor
0dbc8d2 docs(wording-review): wording inventory batch 2026-05-16 pentru Daniel CEO review
bbffa50 fix(i18n): strip diacritice src/pages/coach UI strings + tests parity per NO_DIACRITICS_RULE
b9ef091 docs(audit): mockup-prod parity audit triple LANDED 2026-05-15
3791d78 test(import-nutritie): add coverage for LOCK 8 kcal floor import wording
7a6d21d feat(import-nutritie): wire LOCK 8 kcal floor informative toast (anti-paternalism preserved)
219f0fa chore(vault): LATEST.md COMMIT 3 SHA placeholder swap audit trail accuracy
dadcf3f chore(vault): archive consumed inbox handover narrative 2026-05-16 FULL ORDER
fbed6a7 docs(vision): add PROJECT_INSTRUCTIONS_V6.md reference post radical archive
35e3e16 feat(decisions): D007 + D008 + D009 codify PROC LOCKED V1 + D-LEGACY-085/086 DEPRECATED
7b3ceb8 chore(vault): archive Bundle FULL ORDER 4 PROMPT_CC artefacte CONSUMED 2026-05-16
7f0a14d chore(vault): cross-refs sweep wiki/* → 99-archive/wiki-pre-2026-05-15/* post radical archive
9258260 chore(vault): radical archive wiki → 99-archive/wiki-pre-2026-05-15
2f71f16 feat(vault): add ANDURA_PRIMER.md SSOT singular briefing fresh chat onboard
9065f4f chore(vault): LATEST.md raport wave 4 P1 STOP banner INDEX_MASTER LANDED
f595d54 fix(reglaj): wave 4 P1 STOP banner INDEX_MASTER.md
d3adfb1 chore(vault): LATEST.md raport wave 3 STOP banners LANDED
8955dd6 fix(reglaj): wave 3 STOP banners workflow files + wiki/index FROZEN signal
5fd1ef3 chore(auto): .smart-env/event_logs/event_logs.ajson .smart-env/multi/06-sessions-log_README_md.ajson ...
6aea337 chore(vault): LATEST.md raport T1+T2+T3 cleanup wave 2 LANDED
cdcc864 fix(reglaj): T1+T2+T3 cleanup STOP banners + folder freeze + D007 explicit amendment
b53fda6 chore(auto): .smart-env/event_logs/event_logs.ajson .smart-env/multi/DECISIONS_md.ajson "📤_outbox/LATEST_md.ajson" DECISIONS.md
a8e1dcd chore(auto): .smart-env/event_logs/event_logs.ajson .smart-env/multi/CLAUDE_md.ajson .smart-env/multi/VAULT_RULES_md.ajson .smart-env/multi/wiki_log_md.ajson "📤_outbox/LATEST.md"
dd3ecaf fix(reglaj): post-audit cleanup STOP banners + orphan cross-refs + ADR-029 dedupe
```

(Restul de 209 commits — full list în `tool-results/b8d0pdnm7.txt` ~31KB)

**Note:** Feature branch includes radical archive `wiki → 99-archive/wiki-pre-2026-05-15` (commit `9258260`), DECISIONS.md D001-D012 codification, ANDURA_PRIMER.md SSOT, PROJECT_INSTRUCTIONS_V6, src/pages/coach i18n diacritice strip, import-nutritie LOCK 8 kcal floor — none of which are on main.

---

## §3 Conflict files comparison

| File | main LOC | main bytes | feature LOC | feature bytes | Delta LOC | Delta bytes |
|------|----------|------------|-------------|---------------|-----------|-------------|
| `04-architecture/mockups/andura-clasic.html` | 4437 | 325,709 | 4753 | 347,063 | +316 | +21,354 |
| `00-index/CURRENT_STATE.md` | 365 | 55,535 | 1314 | 246,526 | +949 | +190,991 |
| `DIFF_FLAGS.md` | 735 | 78,002 | 986 | 126,393 | +251 | +48,391 |
| `📤_outbox/LATEST.md` | 135 | 8,880 | 107 | 8,216 | -28 | -664 |

**Observation:** Feature has more content în 3/4 conflict files (mockup + CURRENT_STATE + DIFF_FLAGS). LATEST.md naturally diverges (each branch overwrites cu propriul raport).

---

## §4 Diff stats summary (git diff --stat verbatim)

```
 00-index/CURRENT_STATE.md                  | 1365 +++++++++++++++++++++++-----
 04-architecture/mockups/andura-clasic.html |  358 +++++++-
 DIFF_FLAGS.md                              |  471 +++++++---
 "\360\237\223\244_outbox/LATEST.md"        |  176 ++--
 4 files changed, 1929 insertions(+), 441 deletions(-)
```

**Interpretation:** 4.4× more insertions than deletions → divergence is overwhelmingly additive (feature added content) NU rewrite cross-purpose.

---

## §5 Mockup 6 fixes markers presence

| Marker | feature/v2-vanilla-port | main |
|--------|-------------------------|------|
| `warmup-row` | 1 | 1 |
| `coach-deload-card` | 2 | 2 |
| `wv2-cue-body` | 2 | 2 |
| `coach-today-lagging` | 1 | 1 |
| `screen-pr-wall` | 1 | 1 |
| `session-pill` | 6 | 6 |

- feature/v2-vanilla-port: **6/6 markers present**
- main: **6/6 markers present**
- **Conclusion: feature INCLUDES the 6 fixes substance** — present via different commit lineage NU `6785ab6`.

**Mockup commit lineage divergence since merge-base `71e6445`:**

*Main mockup commits (2):*
```
7498fd6 chore(mockup): replace andura-clasic.html with v2 (Co-CTO ~98% compliant V2 spec)
6785ab6 feat(mockup): 6 fixes sweep LANDED — Warmup + Deload + Tempo Marius + weaknessDetector lagging + PR drill + Mini-player
```

*Feature mockup commits (7):*
```
52be5f6 chore(mockup-clasic): replace cu iteration newer uploaded by Daniel 2026-05-12
6ec01e8 feat(mockup): Calendar V1 design master Slice 1 — L-D 7 cells + 4 UX states + colors SSOT
afc74a5 fix(mockup): Calendar V1 S1.5 — pencil edit parity proteine + compact + title centered + demo toggle
bc5be41 fix(mockup): Calendar V1 S1.6 — show current selection in EDIT state (delete buggy CSS rule)
de761f5 fix(mockup): Calendar V1 S1.7 — UX reframe feedback + missing equipment lifecycle
dd79fd9 chore(mockup): Bundle 3B cleanup L987-991 single-button "Nu am aparat" preview
bd74a39 chore(mockup): Bundle 3 follow-up — stale workout-preview drill refs reconcile
```

**Critical insight:** Feature's `52be5f6` "newer iteration uploaded by Daniel 2026-05-12" (post-merge-base) likely already contains the 6 fixes substance via Daniel's direct upload, then feature added Calendar V1 + Bundle 3 work on top. Feature mockup is LONGER (4753 vs 4437 LOC) and is functionally superior superset.

---

## §6 Recent feature commits (last 30 — already in §2)

See §2 above (top 30 most recent on feature). Key product work since merge-base on feature:
- `bbffa50` fix(i18n) strip diacritice src/pages/coach
- `7a6d21d` feat(import-nutritie) LOCK 8 kcal floor toast
- `3791d78` test(import-nutritie) LOCK 8 coverage
- `9258260` chore radical archive wiki → 99-archive
- `35e3e16` feat(decisions) D007+D008+D009 codify
- `12523b8` docs(decisions) D010+D011+D012 codify
- `2f71f16` feat(vault) ANDURA_PRIMER.md SSOT
- `6ec01e8` + `afc74a5` + `bc5be41` + `de761f5` Calendar V1 mockup
- `b9ef091` docs(audit) mockup-prod parity triple

---

## §7 Recommendation (analysis only — Daniel decides)

### Picture (factual)

- Feature is **far ahead** (239 commits vs main's 16) și contains the **substance** of main's only product commit (`6785ab6` 6 fixes — markers prezenti în feature mockup via `52be5f6`+Calendar work).
- Main's 16 commits are **predominantly vault plumbing** (10/16 = LATEST.md/auto-commits/handover ingest). Only ~5/16 carry independent product/doc substance:
  - `6785ab6` 6 fixes sweep — **functionally present în feature already** (markers verified §5)
  - `7498fd6` v2 mockup replace — **superseded by feature `52be5f6` newer iteration**
  - `c7d8457` P1-FLAG prod bugs RECONCILED RESOLVED — **possibly orphan** if feature DIFF_FLAGS.md already resolved
  - `298304b` ADR 023 SUPERSEDED + P1-FLAG-1 RESOLVED — **possibly orphan** dacă feature DECISIONS.md D-LEGACY supersedes
  - `b143519` AUDIT 22 engines handover ingest — **possibly orphan** dacă feature wiki radical archive supersedes

### Strategy options (decision pending)

**Option A — Feature wins (recommended baseline):** Merge `main` → `feature/v2-vanilla-port` cu `--strategy-option theirs` pe conflict files, then PR `feature` → `main`. Rationale: feature is canonical (radical archive D001-D012 + PRIMER + Calendar V1 + i18n diacritice + import-nutritie LOCK 8). Risk: lose any UNIQUE substance în main's 5 substantive commits not yet în feature.

**Option B — Cherry-pick verify:** Before A, manually verify the 5 main substantive commits substance:
- `6785ab6` markers ✅ verified prezent feature §5
- `7498fd6` ✅ superseded by `52be5f6`
- `c7d8457` need verify P1-FLAG-PROD-AUTO + P1-FLAG-PROD-BF-EDIT status in feature DIFF_FLAGS
- `298304b` need verify ADR 023 status în feature DECISIONS/wiki
- `b143519` need verify Anti-RE rule + F13 drop V1 în feature DECISIONS/wiki

Dacă toate 5 verified-present feature → Option A safe. Dacă vreuna lipsește → cherry-pick acea specifică pe feature pre-merge.

**Option C — Reset main to feature (destructive, NU recomandat unilateral):** Force-push `main` to match `feature/v2-vanilla-port`. **NEVER without explicit Daniel approval per §AR.4 + Git Safety Protocol.** Atomic + clean dar destroys main history including commits cu hash injects în LATEST.md raports historical.

### Risk minimization path

1. **NEXT:** Investigate the 4 outstanding "possibly orphan" main substance items (Option B verify list) — read feature DIFF_FLAGS.md + DECISIONS.md + wiki-archive content vs main's 5 substantive commits content.
2. After verify-orphan analysis → decide A vs cherry-pick subset vs C.
3. Backup tag pre-merge MANDATORY: `pre-main-feature-merge-2026-05-16-<HHMM>` pushed origin (per §AR rule backup tag pre-execute).
4. Deploy on-demand stays on-hold până post-merge clean state.

### Bottom line

Feature is the truth state cumulative. Main's 16 commits are **mostly stale plumbing**; the substantive 5 are **largely superseded** by feature's later work. Lowest-risk path = Option A cu pre-step Option B verify orphan list (4 items, ~15 min read). NU recomanda Option C unilateral.

---

🦫 **Investigation read-only complete. ZERO commits, ZERO destructive ops. Daniel decision required pre re-attempt deploy / merge strategy. File: `📤_outbox/INVESTIGATION_2026-05-16_main_vs_feature.md`.**
