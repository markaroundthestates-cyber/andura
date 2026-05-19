# TASK 5 — Mockup ↔ prod parity audit post triple LANDED 2026-05-15

**Track:** Pre Bugatti Audit Nuclear final preparation.
**Category:** PROC / audit-only (ZERO src/ touched).
**Atomic commit type:** ZERO commit src/. Doar `docs(audit):` dacă raport audit dedicat în vault.

## Intent

Triple LANDED 2026-05-15 (per `ANDURA_PRIMER.md` §5):
- LOCK 9 Aggressive Loading `e44137f` (+69 tests)
- LOCK 9 LOOP CLOSE accelerated learning `892ebca` (+45 tests)
- LOCK 10 ADR 033 MMI Engine #9 `e6fd974` (+95 tests)

Pre Bugatti Audit Nuclear (`D-LEGACY-090` GATE FINAL): verifică că triple LANDED cluster e parity mockup ↔ prod — adică ce e LANDED în prod corespunde semantic cu mockup design intent (NU drift unobserved între design master + implementation).

**Scope strict audit-only.** ZERO fix-uri. Output = listă deviations cu severity (BLOCKER / WARN / OK) pentru Daniel decide priority post-batch.

## Discovery sequence

### 1. Mockup-side state cluster relevant

```bash
# LOCK 9 Aggressive Loading
grep -n "Aggressive\|aggressive\|Volume Creep\|increase.*load.*warn" 04-architecture/mockups/andura-clasic.html

# LOCK 9 LOOP CLOSE
grep -n "accelerated\|learning loop\|coach.*wrong" 04-architecture/mockups/andura-clasic.html

# LOCK 10 MMI Engine #9
grep -n "MMI\|Muscle Memory\|reincep\|de la zero\|return.*after\|hiatus" 04-architecture/mockups/andura-clasic.html
```

### 2. Src prod state cluster relevant

```bash
# LOCK 9
git show e44137f --stat
git show 892ebca --stat

# LOCK 10
git show e6fd974 --stat
grep -rn "MMI\|aggressiveLoading\|accelerated.*learning" src/engines/
```

### 3. Parity matrix per LOCK

Pentru fiecare LOCK (9 + LOOP CLOSE + 10):

| Aspect | Mockup intent | Prod state | Match / Deviation |
|---|---|---|---|
| UI surface | `<mockup location:line>` | `<src location:line>` | OK / WARN / BLOCKER |
| Engine logic | `<mockup data attrs / JS demo>` | `<src engine + tests>` | OK / WARN / BLOCKER |
| Wording user-facing | `<mockup string verbatim>` | `<src string verbatim>` | OK / WARN / BLOCKER |
| Trigger condition | `<mockup demo>` | `<src condition>` | OK / WARN / BLOCKER |

### 4. Cluster cross-refs

Verifică citate spec pentru fiecare LOCK:
- LOCK 9 → `99-archive/wiki-pre-2026-05-15/concepts/aggressive-loading-warning-tier-aware.md`
- LOCK 9 LOOP CLOSE → grep handover narrative 2026-05-15 pentru spec wire
- LOCK 10 MMI → `99-archive/wiki-pre-2026-05-15/entities/features/lock-10-adr-033-mmi-engine-9.md`

Confirmă că prod LANDED match wiki canonical source spec (NU drift între wiki spec + commit).

## Severity definitions

- **BLOCKER:** discrepanță care afectează core semantic engine sau anti-paternalism invariant (`D-LEGACY-061`) — must fix înainte Bugatti Audit Nuclear.
- **WARN:** wording drift, UX micro-deviation, missing safety net non-critical — flag Daniel review post-batch.
- **OK:** parity confirmed verbatim sau semantic equivalent.

## Output format (artefact dedicat vault)

Scrie raport audit în:
`08-workflows/AUDIT_MOCKUP_PROD_PARITY_2026-05-16.md`

Format:
```markdown
# Audit Mockup ↔ Prod Parity — Triple LANDED 2026-05-15

## Summary
- Total aspects audited: <N>
- BLOCKER: <count>
- WARN: <count>
- OK: <count>

## LOCK 9 Aggressive Loading
<parity matrix>

## LOCK 9 LOOP CLOSE Accelerated Learning
<parity matrix>

## LOCK 10 MMI Engine #9
<parity matrix>

## BLOCKERs (action required pre Bugatti Audit)
- <list>

## WARNs (Daniel review post-batch)
- <list>

## OK confirmations
- <summary count, NU enumerate exhaustive — sample 3-5 verbatim>
```

## Acceptance criteria

- [x] Audit raport scris la `08-workflows/AUDIT_MOCKUP_PROD_PARITY_2026-05-16.md`.
- [x] Toate 3 LOCK-uri acoperite cu parity matrix complete.
- [x] Severity assigned per aspect (BLOCKER/WARN/OK).
- [x] Citații `path:line` exacte verbatim (NU memorie).
- [x] ZERO src/ touched (audit-only invariant).
- [x] Commit `docs(audit): mockup-prod parity audit triple LANDED 2026-05-15`.

## Raport per task

```
TASK 5 ✓/✗ — <commit hash>
- Audit file: 08-workflows/AUDIT_MOCKUP_PROD_PARITY_2026-05-16.md
- BLOCKERs: <count + summary>
- WARNs: <count>
- OK: <count>
- Total aspects: <N>
```
