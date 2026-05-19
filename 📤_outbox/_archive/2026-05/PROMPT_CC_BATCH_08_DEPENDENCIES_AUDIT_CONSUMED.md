# PROMPT_CC_BATCH_08_DEPENDENCIES_AUDIT

**Model:** Opus
**Order:** 8/10
**Dependencies:** none (independent npm scope)
**Scope:** npm outdated + security audit + raport în outbox
**Estimate:** ~30min

---

## CONTEXT

Periodic dependency hygiene. Daniel non-dev — raport informativ NOT immediate action. Baseline pentru future security tracking + outdated package strategy.

---

## TASKS

### Task 8.1 — npm outdated

```bash
npm outdated --json > /tmp/npm_outdated.json 2>/dev/null || echo "{}" > /tmp/npm_outdated.json
```

Parse output. Categorize:
- **Major version updates available:** breaking changes likely, defer
- **Minor version updates available:** new features, low risk
- **Patch version updates available:** bug fixes, recommended
- **Up to date:** no action

---

### Task 8.2 — npm audit

```bash
npm audit --json > /tmp/npm_audit.json 2>/dev/null || echo "{}" > /tmp/npm_audit.json
```

Parse output. Categorize:
- **Critical:** immediate action, exploit available
- **High:** action ASAP
- **Moderate:** action în reasonable timeframe
- **Low:** acceptable defer
- **Info:** awareness only

---

### Task 8.3 — Generate report

**Create file:** `📤_outbox/_archive/2026-05/BATCH_08_DEPENDENCIES_AUDIT.md`

```markdown
# Dependencies Audit — Baseline (BATCH_08)

**Date:** 2026-05-02
**Tools:** `npm outdated` + `npm audit`

## Outdated packages

### Major updates available (defer — breaking changes)

| Package | Current | Latest | Wanted | Notes |
|---------|---------|--------|--------|-------|
| <pkg> | X.Y.Z | A.B.C | X.Y.Z | breaking changes likely |
<repeat>

**Total major outdated:** <N>

### Minor updates available (low risk)

<table>

**Total minor outdated:** <N>

### Patch updates available (recommended)

<table>

**Total patch outdated:** <N>

## Security audit

### Critical vulnerabilities
<list — adresare imediată recommended>

### High vulnerabilities
<list>

### Moderate vulnerabilities
<list>

### Low / Info
<count summary>

**Total vulnerabilities:** <N> across severity tiers

## Recommendations

**Immediate action:**
- Critical/High vulnerabilities: <list specific packages>

**Pre-Beta launch:**
- Patch updates safe: `npm update` (run în separate batch dacă acceptable)

**Post-Beta backlog:**
- Major updates strategy: `<pkg> X.Y.Z → A.B.C` requires testing + manual review
- <list specific majors with notes>

**Acceptable defer:**
- Low/Info vulnerabilities NOT exploitable în context SalaFull frontend-only PWA

## Baseline locked

This report = baseline 2026-05-02 reference. Future audits:
```
npm outdated
npm audit
```
Compare against this baseline.
```

---

### Task 8.4 — Cross-ref HANDOVER_GLOBAL

**File:** `06-sessions-log/HANDOVER_GLOBAL.md`

Append entry:

```markdown
### §36.69 DEPENDENCIES AUDIT BASELINE 2026-05-02

Periodic dependency hygiene baseline:
- **Outdated:** <N major> + <N minor> + <N patch>
- **Vulnerabilities:** <N critical> + <N high> + <N moderate> + <N low>

Critical/High actionable items flagged în `BATCH_08_DEPENDENCIES_AUDIT.md`. Major updates strategy = post-Beta backlog.

**Cumulative LOCKED count:** 60 → 60 (measurement hygiene, NU decizie nouă)
```

---

## VERIFICATION GATE

Pre-commit:
1. `ls 📤_outbox/_archive/2026-05/BATCH_08_DEPENDENCIES_AUDIT.md` → file exists
2. `grep "§36.69 DEPENDENCIES AUDIT BASELINE" 06-sessions-log/HANDOVER_GLOBAL.md` → 1 match
3. `npm test` → all pass (no changes to package.json în acest batch — read-only audit)
4. Report has actual data (NOT placeholders)

---

## COMMIT

```
git add 📤_outbox/_archive/2026-05/BATCH_08_DEPENDENCIES_AUDIT.md 06-sessions-log/HANDOVER_GLOBAL.md
git commit -m "feat(batch-08): dependencies audit baseline 2026-05-02

- npm outdated: <N major> + <N minor> + <N patch>
- npm audit: <N critical> + <N high> + <N moderate> + <N low>
- BATCH_08_DEPENDENCIES_AUDIT.md detailed report + recommendations
- HANDOVER_GLOBAL §36.69 entry"
git push
```

---

## OUTPUT

Generate report `📤_outbox/_archive/2026-05/BATCH_08_REPORT.md`:

```markdown
# BATCH_08_DEPENDENCIES_AUDIT — Report

**Status:** Complete | Issue
**Model:** Opus
**Duration:** ~Xh
**Commit:** <hash>

## Modificări
- BATCH_08_DEPENDENCIES_AUDIT.md baseline
- HANDOVER_GLOBAL §36.69 entry

## Audit results
- Outdated: <N major> + <N minor> + <N patch>
- Vulnerabilities: <N critical> + <N high> + <N moderate> + <N low>

## Critical actionable items
<list pentru Daniel awareness>

## Verification gate
- [✅/❌] BATCH_08_DEPENDENCIES_AUDIT.md exists with real data
- [✅/❌] grep §36.69: 1 match
- [✅/❌] npm test: all pass

## Issues
<none / lista>

## Next batch
BATCH_09_BUILD_PERF_BASELINE
```

Stop. Trigger BATCH_09.
