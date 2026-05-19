# TASK 21 — State Bugs Audit Cross-Skin × 4 (NEED_CONTEXT_DANIEL placeholder)

**Model:** Opus
**Velocity:** ~25-40 min CC autonomous (audit-driven, scope dependent context)
**Cluster:** #6 State bugs · Atom 1/3
**Authority:** CURRENT_STATE §NOW chat ACASĂ noapte feedback "9 clusters smoke" — listă explicită bugs NU complete în vault, audit-driven discovery
**Type:** Audit + scope clarify (NU fix immediate, output raport pentru Daniel decide priority)

---

## ⚠️ NEED_CONTEXT_DANIEL inline

**Status: PARTIAL CONTEXT**

Per CURRENT_STATE §NOW Daniel-isms verbalizate chat noapte: jargon Gigel test fail (RIR / TONAJ / Mărime / Pace / Comportament Familie Luxury / "habar nu am ce e") + Theme Parity Invariant violations smoke test 4 themes — **dar listă explicită 9 clusters bugs NU enumerated în vault**. Audit-driven approach.

**Daniel completează:** Listă concretă 9 clusters smoke bugs identified chat noapte (sau NEED_CONTEXT decizie tactical Co-CTO scope mark task open OPEN_QUESTION).

---

## §0 Pre-flight grep MANDATORY

```bash
# Search vault for any explicit list "9 clusters" smoke bugs
grep -rniE "9 clusters smoke|smoke noapte|state bugs cluster|cluster bug|smoke feedback" \
  06-sessions-log/ 03-decisions/DECISION_LOG.md 00-index/CURRENT_STATE.md 2>/dev/null | head -20

# Theme Parity violations identified candidate
grep -rniE "Theme Parity violation|parity diferă|skin diferit|cross-skin diff" \
  04-architecture/ 03-decisions/ 00-index/ 2>/dev/null | head -15

# Inventory exercițiu Clasic baseline reference (chat ACASĂ post-noapte)
grep -niE "inventory.*Clasic|Clasic baseline|baseline reference cross-skin" 00-index/CURRENT_STATE.md | head -10
```

---

## §1 Scope

Audit cross-skin × 4 mockup files pentru identify state bugs / Theme Parity violations / wiring inconsistencies. Output raport detailed pentru Daniel review + priority decide.

**Audit dimensions:**
1. **Inventory parity** — toate elements present cross-skin × 4 uniform (icons / butoane / labels / sections)
2. **Wiring parity** — onclick handlers / data-action / href consistent cross-skin × 4
3. **State machine parity** — active/inactive states / loading / error states cross-skin × 4
4. **Visual hierarchy parity** — z-index / overlap / positioning cross-skin × 4
5. **Form validation parity** — required attributes / range validators / error display cross-skin × 4
6. **Navigation parity** — root nav 4 tabs (Antrenor / Progres / Istoric / Cont) functional cross-skin × 4
7. **Modal/drill parity** — toate drill-downs functional cross-skin × 4
8. **Toast/notification parity** — feedback patterns consistent cross-skin × 4
9. **Empty states parity** — no-data fallbacks present cross-skin × 4

**Per dimension violation found:**
- Flag în raport explicit: `<dimension> | <skin> | <description>`
- Categorize: HARD (blocking Beta) / SOFT (polish post-Beta) / DEFERRED (V2)
- Fix decizie: Task 22 follow-up (theme parity fix) OR mark TODO inline OR DROP

**Acțiuni audit cross-skin × 4 mockup files (READ-ONLY):**
1. Per skin × per dimension → checklist verify
2. Output raport matrix `9 dimensions × 4 skins = 36 cells` status PARITY / VIOLATION / MISSING
3. Compile NEED_CONTEXT_DANIEL list pentru clarification rapid
4. ZERO modificare mockup files (audit-only)

---

## §2 Files modify

**ZERO files modified** — audit-only task. Output raport doar.

Files **read** (verify, NU modify):
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

---

## §3 Acceptance criteria

1. ✅ Audit complet 9 dimensions × 4 skins matrix (36 cells)
2. ✅ Violations enumerated explicit (skin / dimension / description)
3. ✅ Categorize HARD / SOFT / DEFERRED per violation
4. ✅ NEED_CONTEXT_DANIEL list compiled pentru ambigui
5. ✅ ZERO mockup files modified (audit-only verify)
6. ✅ Tests 2731 PASS preserved EXACT (NU code changes)
7. ✅ Build PASS (NU changes)
8. ✅ Raport detailed în `📤_outbox/LATEST.md` — Task 22 follow-up planning input

---

## §4 Backup tag

**NU needed** (audit-only, ZERO changes). Skip git tag.

---

## §5 Commit message

**NU commit** dacă audit-only ZERO changes. Dacă raport persistat ca documentație:

```
docs(audit): state bugs cross-skin × 4 audit raport — 9 dimensions matrix

Audit-only task. ZERO code changes. Output raport `LATEST.md`.

Per CURRENT_STATE §NOW chat ACASĂ noapte feedback "9 clusters smoke":
- 9 dimensions × 4 skins parity matrix
- Violations enumerated HARD/SOFT/DEFERRED categorize
- NEED_CONTEXT_DANIEL list pentru priority decide

Cluster #6 State bugs · Task 21/N Phase 2 orchestrator.
Theme Parity Invariant V1 — discrepancies = Task 22 follow-up candidates.
Tests 2731 PASS preserved EXACT (audit-only ZERO changes).

Cross-refs:
- CURRENT_STATE §NOW Daniel-isms jargon Gigel test fail
- Task 15 Workflow audit precedent pattern
- Task 22 follow-up theme parity fix planning
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 21 — State Bugs Audit Cross-Skin × 4 (READ-ONLY)

- **Model:** Opus
- **Status:** Complete (audit-only, ZERO changes)
- **Pre-flight:** <vault search 9 clusters smoke + Theme Parity violations enumerated>

### Parity Matrix 9 dimensions × 4 skins

| Dimension | Clasic | Living Body | Luxury | Brain Coach |
|-----------|--------|-------------|--------|-------------|
| Inventory parity | <PARITY/VIOLATION> | ... | ... | ... |
| Wiring parity | ... | ... | ... | ... |
| State machine parity | ... | ... | ... | ... |
| Visual hierarchy parity | ... | ... | ... | ... |
| Form validation parity | ... | ... | ... | ... |
| Navigation parity | ... | ... | ... | ... |
| Modal/drill parity | ... | ... | ... | ... |
| Toast/notification parity | ... | ... | ... | ... |
| Empty states parity | ... | ... | ... | ... |

### Violations enumerated detail

- **HARD (blocking Beta):**
  - <skin / dimension / description>
- **SOFT (polish post-Beta):**
  - <list>
- **DEFERRED (V2):**
  - <list>

### NEED_CONTEXT_DANIEL clarification list

- <Item 1>: <description + Daniel decide options>
- <Item 2>: ...

### Theme Parity Invariant V1 status

- 4/4 themes uniform: <YES / NO>
- HARD violations needing fix Task 22: <count>
- Bugatti gigascalabilă end product perfect target: <gap analysis>

- **Tests:** 2731 PASS preserved (audit-only)
- **Build:** PASS (NU changes)
- **Commit:** <SHA if raport persisted | NU commit if pure stdout>
- **Pushed:** <origin/main if commit | N/A>
- **Issues:** <violations enumerated above>
- **Next action:** TASK 22 (Theme parity violations fix per audit Tasks 15+21)
```
