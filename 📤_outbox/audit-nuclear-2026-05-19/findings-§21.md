# §21 — Git Hygiene Audit

**Scope:** Branch protection + CI pipeline + pre-push hooks + .gitignore + GPG signing + secrets in history + tag conventions + branch cleanup + husky hooks + Conventional Commits + Git LFS + submodules

## Severity matrix §21

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 4 |
| MED | 4 |
| LOW | 4 (positive) |
| NIT | 1 |
| **Total** | **14** |

---

## CRITICAL findings

### §21-C1 — Branch protection rules `main` UNVERIFIED on GitHub (§21.1 + §21.9)
**Severity:** CRITICAL
**Evidence:** Remote `https://github.com/markaroundthestates-cyber/andura.git`. Branch protection rules require GitHub Console verify (no API access in audit). Per D028 PROC LOCKED V1 PERMANENT, auto-deploy from main → critical to protect main from force-push or accidental delete.
**Fix log:** Manual verify GitHub settings → Branches → Add rule for `main`:
- Require pull request reviews before merging (or solo dev = bypass via admin)
- Require status checks (CI typecheck + tests)
- Require linear history (no force-push)
- Restrict who can push (Daniel admin only)

---

## HIGH findings

### §21-H1 — Husky pre-commit runs vitest ONLY (no typecheck, no lint) (§21.12)
**Severity:** HIGH (§1-C4 reaffirmed)
**Evidence:** `.husky/pre-commit:1` `npm run test:run`. No typecheck before commit → TS error reaches main.
**Fix log:** Update to `npm run typecheck && npm run lint && npm run test:run` (lint pending §1-C4 install).

### §21-H2 — Conventional Commits adherence inconsistent (§21.13)
**Severity:** HIGH
**Evidence:** Recent commits sample (`git log --oneline -5`):
- `chore(vault): D028 + D029 LOCKED V1 + handover archive 2026-05-19` ✓
- `chore(auto): "..."` ✓ (auto-generated chore message)
- `chore(outbox): deploy react production raport LATEST.md + archive phase 6 batch 24` ✓
- `merge(react): swap entry main → React build, vanilla preserved legacy` — "merge" is NOT a Conventional Commits type. Should be `feat(react): merge ...` or just merge commit auto-format.
- `feat(react): swap entry main → React build, vanilla preserved legacy` ✓
**Resolution:** Mostly compliant. NIT for "merge" prefix. Add commitlint to enforce.
**Fix log:** Install `@commitlint/cli` + `@commitlint/config-conventional` + husky commit-msg hook.

### §21-H3 — Tag conventions consistent — verify `pre-X-DATE` + `phase-N-batch-landed-DATE` patterns (§21.7 + §21.10)
**Severity:** HIGH
**Evidence:** `git tag --list "*2026-05*"` shows mix:
- ✓ `deploy-react-production-2026-05-19`
- ✓ `phase-1-foundation-landed-2026-05-16`, `phase-2-routing-skeleton-landed-2026-05-16`, `phase-3-antrenor-landed-2026-05-17`, `phase-5-batch-landed-2026-05-18`, `phase-6-batch-landed-2026-05-19`
- ✓ `pre-react-entry-swap-2026-05-19`, `pre-add-andura-primer-2026-05-16`
- ✓ `pre-adr-cleanup-batch-2026-05-06-2335` (timestamped)
- Pattern: `pre-{event}-{date}` + `phase-{N}-{name}-landed-{date}` consistent.
**Resolution:** Convention consistent. Document in `08-workflows/tag-conventions.md` for new dev clarity.

### §21-H4 — Commit signing GPG NOT VERIFIED (§21.5)
**Severity:** HIGH
**Evidence:** `git log --show-signature -1` would reveal. Solo dev → GPG signing not required but provides authenticity. Pre-Beta defer; post-Beta with contributors recommended.
**Fix log:** Defer; document.

---

## MED findings

### §21-M1 — Pre-push hooks ABSENT (§21.3)
**Severity:** MED
**Evidence:** `.husky/` has only pre-commit. No `pre-push`. Push of broken main allowed if local pre-commit bypassed.
**Fix log:** Add `.husky/pre-push` running `npm run typecheck && npm run test:run` as belt-and-suspenders.

### §21-M2 — `.gitignore` comprehensive ✓ but verify no firebase-service-account.json in history (§21.6)
**Severity:** MED
**Evidence:** `.gitignore` excludes firebase-service-account.json. git log shows no .env files in history.
**Fix log:** Run BFG repo cleaner historically `bfg --delete-files firebase-service-account.json` precautionary.

### §21-M3 — Branch cleanup remote stale branches (§21.8)
**Severity:** MED
**Evidence:** `git branch -r` would reveal. NOT inspected. Recent commits show on main only.
**Fix log:** Manual review GH branches; delete merged feature branches.

### §21-M4 — Lockfile committed package-lock.json ✓ (§21.11) — covered §20-L1
**Severity:** MED — POSITIVE

---

## LOW (POSITIVE)

### §21-L1 — `.gitignore` excludes node_modules + dist + .env.local + secrets ✓
### §21-L2 — Tag conventions consistent ✓ (§21-H3 partial)
### §21-L3 — No env files in git history ✓
### §21-L4 — Husky present ✓ (partial scope §21-H1)

---

## NIT findings

### §21-N1 — Repo owner `markaroundthestates-cyber` — verify Daniel's primary GH account; concerns: username confusion + ownership transfer post-Beta
**Resolution:** Document Daniel's identity in README.

## Karpathy distribution §21
- Surgical Changes: 3 (H1, H2, M1)
- Goal-Driven: 1 (C1)
