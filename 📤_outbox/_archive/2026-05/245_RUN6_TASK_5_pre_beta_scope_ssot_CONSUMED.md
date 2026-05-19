# Task 5 — Pre-Beta scope SSOT consolidare (verify existing OR create new file)

**Model:** Opus
**Velocity:** ~10-15 min
**Scope:** Vault meta-tooling SSOT clarification. Cumulative LOCKED V1 ~688 PRESERVED unchanged.

## Pre-flight MANDATORY

```bash
git status                                      # clean tree post Task 4 commit
ls -la 08-workflows/ | grep -iE "pre.?beta|launch"   # locate existing pre-Beta scope file if any
grep -rEn "PRE_LAUNCH_CHECKLIST_V1\|pre-Beta launch scope" --include="*.md" --exclude-dir=_archive --exclude-dir=node_modules --exclude-dir=.git . | head -10
```

## Context

Run 2 Task 1 split extracted `08-workflows/PRE_LAUNCH_CHECKLIST_V1.md` standalone file from HANDOVER_MISC. Run 6 Task 5 = verify if existing file already contains pre-Beta scope SSOT consolidat OR create NEW canonical file post Daniel updates 2026-05-08 chat NEW.

**Pre-Beta scope SSOT consolidat (verbatim from Task 1 §NEXT pentru consistency):**

### CC Opus mecanic autonomous
1. Run 6 vault hygiene COMPLETĂ (acest batch Tasks 1-6 elevated)
2. React migration implementation 1-2 săpt CC continuous (post React migration plan tactical chat dedicat Daniel+Claude)
3. Production drift refactor nav root 6→4 (overlap React migration tactical, sequenced post-plan)
4. Faza 3 STRANGLER wiring real (8 adapters thin layer per ADR 030 D2 + Golden-master parity tests + featureFlag rollout 0% default OFF)
5. Theme V1 launch implementation Andura-V2.html → React component impl post React migration LANDED. Theme picker afișează "work in progress" pe celelalte 3 până gata CD Daniel.

### Daniel pre-Beta blockers
1. Faza 4 smoke E-E cont propriu post Faza 3 wiring real LANDED
2. Invite-only grup prieteni recruiting (când CC implementation + theme V1 + Faza 4 ready)

### Claude chat pre-Beta
1. Orchestrate Run 6 (acest batch)
2. React migration plan tactical chat dedicat cu Daniel
3. Scenarios coverage gap reduction ~990-1490 decisions remaining ~5-15 chat-uri Priority 2 strategice
4. Decizii strategice mid-flight + handover §CC.5 generation

### DROPPED entirely pre-Beta
- xlsx Daniel update (personal NU vault)
- 13 wording canonice butoane (deja stabilite)
- cohort 50 testers (superseded → invite-only Daniel grup restrâns)
- Privacy Policy + ToS V1 Beta validate (DROP prieteni only Beta)
- suport@andura.app MX setup (already done gmail forward)
- themes 6 candidate dormant superseded plan: V2 default + 3 themes "când gata CD" + theme picker "work in progress" placeholder

### Post-Beta cu date Beta (Daniel + Claude chat împreună)
- Privacy/ToS validate (dacă scope crește post-prieteni)
- Validation Hibrid simulator R²>0.85 + perceived recovery correlation
- 6 themes candidate dormant Daniel decide post-launch

### v1.5+ deferred (NU pre-Beta)
- Antrenament liber + Filtru/sort + Cleanup C Cloud Function scheduled

## Steps

### Step 5.1 — Verify existing PRE_LAUNCH_CHECKLIST_V1.md content

```bash
view 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md  # full read
```

If file content reflectă Daniel updates 2026-05-08 chat NEW (toate DROPPED items + invite-only + themes V2+3 plan + Validation post-Beta) → **NO ACTION** Step 5.4 update timestamp + cross-ref note only.

If file content STALE (cohort 50 + Privacy/ToS validate + suport@ + 13 wording etc) → **OVERWRITE** Step 5.2 cu scope SSOT consolidat.

### Step 5.2 — OVERWRITE existing file OR CREATE new

If overwrite needed:

Edit `08-workflows/PRE_LAUNCH_CHECKLIST_V1.md` complete content (preserve frontmatter if exists, add `Updated: 2026-05-08 chat NEW birou Run 6 elevated Task 5`):

```markdown
# Pre-Beta Launch Checklist V1 — SSOT consolidat post Daniel updates 2026-05-08 chat NEW

**Status:** SSOT live updated post Run 6 elevated Task 5 (vault hygiene reconciliation 2026-05-08 chat NEW birou)
**Authority:** Daniel chat NEW birou updates + Run 6 elevated reconciliation
**Cumulative LOCKED V1 baseline:** ~688 product/architecture additive PRESERVED
**Cross-refs:** [[../00-index/CURRENT_STATE]] §NEXT (live SSOT canonical) | [[../03-decisions/DECISION_LOG]] 2026-05-08 chat NEW birou entries

---

## CC Opus mecanic autonomous

[paste verbatim from Context section above — items 1-5]

## Daniel pre-Beta blockers

[paste verbatim — items 1-2]

## Claude chat pre-Beta

[paste verbatim — items 1-4]

## DROPPED entirely pre-Beta (post Daniel updates 2026-05-08 chat NEW)

[paste verbatim — 6 DROPPED items]

## Post-Beta cu date Beta (Daniel + Claude chat împreună)

[paste verbatim — 3 items post-Beta]

## v1.5+ deferred (NU pre-Beta)

[paste verbatim — items v1.5+]

---

**Note:** This file is SSOT canonical pentru pre-Beta scope. Updates require: (1) DECISION_LOG.md entry append, (2) CURRENT_STATE.md §NEXT sync, (3) this file update. Drift between these 3 sources = §CC.7 Layer 3 timestamp mismatch flag.
```

### Step 5.3 — Update INDEX_MASTER.md NAVIGARE row if file new (NU update)

If file pre-existing post Run 2 Task 1 split → NO INDEX_MASTER update needed (row already exists).

If file CREATED new (rare scenario) → ADD row în INDEX_MASTER NAVIGARE 08-workflows section.

### Step 5.4 — Update CURRENT_STATE §JUST_DECIDED Task 1 entry append

Edit `00-index/CURRENT_STATE.md` `## JUST_DECIDED` Task 1 entry append section "Tasks Run 6 elevated cumulative":

REPLACE line `Task 5 Pre-Beta scope SSOT consolidare verify file existing OR create new`
WITH:
- If updated existing: `Task 5 Pre-Beta scope SSOT ✅ updated 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md post Daniel updates 2026-05-08 chat NEW`
- If preserved unchanged: `Task 5 Pre-Beta scope SSOT ✅ verified 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md content current (no update needed)`

## Validation

- ✅ Pre-Beta scope SSOT canonical file synchronized cu Daniel updates 2026-05-08 chat NEW
- ✅ Cross-refs valid CURRENT_STATE §NEXT + DECISION_LOG entries
- ✅ Wikilinks resolve correct (no orphaned references)
- ✅ Drift between 3 sources (file + CURRENT_STATE + DECISION_LOG) = ZERO

## Report format `📤_outbox/LATEST.md` Task 5 section

```
### Task 5 — Pre-Beta scope SSOT consolidare
- Status: Complete
- Pre-flight: 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md located + content current/stale assessed
- Modificări:
  - 08-workflows/PRE_LAUNCH_CHECKLIST_V1.md: <updated/preserved>
  - 00-index/CURRENT_STATE.md §JUST_DECIDED Task 1 entry: status updated
- Commits: <SHA> "feat(vault-hygiene): Run 6 Task 5 pre-Beta scope SSOT consolidare"
- Pushed: origin/main
- Issues: none
- Next: Task 6 §CC.9 mandatory file updates
```

**STOP. Continue Task 6 only after Task 5 success report verified.**
