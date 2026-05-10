# TASK 15 — Workflow Antrenament V1 Audit Prod Parity · Cross-Skin × 4 (Read-Only)

**Model:** Opus
**Velocity:** ~15-25 min CC autonomous (4 mockup files audit-only + production state verify)
**Cluster:** #3 Workflow + scope cuts · Atom 6/6 (closure Cluster #3 + Phase 1 final task)
**Authority:** Daniel directive 2026-05-10 chat ACASĂ post-noapte: *"Workflow antrenament V1 LOCK = exact ca prod"* (auto-advance pauză + edit manual kg+reps post-set deja există) — scope clarify NU additive cumulative

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify production code workflow active session
grep -rniE "auto.advance|advance.*pauza|pauseTimer|sessTimer|setLog|completeSet" src/ --include="*.js" | head -30

# Verify edit manual kg+reps post-set (production existing pattern)
grep -rniE "edit.*kg|edit.*reps|sessionKgOverride|lastSetRPE|sessRepsInput" src/ --include="*.js" | head -20

# Audit mockup files cross-skin pentru workflow representation
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin workflow elements ==="
  grep -niE "auto.advance|pauz[ăa]|odihn[ăa]|edit.*kg|edit.*reps|completare set|sesiune activ" 04-architecture/mockups/andura-$skin.html | head -15
done
```

---

## §1 Scope

**Audit READ-ONLY** (NU modificare) workflow antrenament V1 representation cross-skin × 4 mockup files vs production existing pattern. Verify "exact ca prod" parity per Daniel LOCK V1.

**Production workflow V1 features (Daniel confirmed already exist):**
- **Auto-advance pauză** — post-set complete → pauseTimer auto-start countdown → next set ready transition
- **Edit manual kg+reps post-set** — user override values after set logged
- **Set complete UI flow** — `completeSet()` + `sessLog` append + RPE prompt
- **Session active state** — `sessActive: true` + timer running + exercise navigation

**Audit acțiuni cross-skin × 4 mockup files (read-only, output raport):**
1. **Per skin:** identify workflow active session UI elements representation
2. **Compare vs production existing pattern** (`src/state.js` + `src/pages/coach.js` etc.)
3. **Flag discrepancies** per skin:
   - Missing prod feature representation (e.g. NU auto-advance pauză visible)
   - Extra additions NU în prod (drift documentar candidate)
   - Theme Parity violations (e.g. Living Body diferă de Clasic non-cosmetic)
4. **NU modify** mockup files (audit-only, read-only)
5. **Output raport** raport detaliat parity matrix per skin × workflow feature

**NU touch:**
- ZERO modificare mockup files (read-only audit task)
- ZERO modificare production code
- Theme Parity Invariant V1 reaffirm — discrepancies = candidate fix follow-up tasks Phase 2 (NU acest task)

---

## §2 Files modify

**ZERO files modified** — audit-only task. Output raport doar.

Files **read** (verify, NU modify):
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`
- `src/state.js` (session state shape)
- `src/pages/coach.js` (workflow active session orchestration)
- `src/engine/*` related session flow

---

## §3 Acceptance criteria

1. ✅ Pre-flight grep production workflow features enumerated
2. ✅ Audit per-skin × 4 workflow features representation captured
3. ✅ Parity matrix output (skin × feature × status: PARITY / MISSING / DRIFT)
4. ✅ Discrepancies flagged per skin (NU fix, doar raport)
5. ✅ ZERO mockup files modified (audit-only verify)
6. ✅ Tests 2731 PASS preserved EXACT (NU code changes)
7. ✅ Build PASS (NU changes)
8. ✅ Raport output detaliat în `📤_outbox/LATEST.md` — Phase 2 follow-up planning input

---

## §4 Backup tag

**NU needed** (audit-only, ZERO changes). Skip git tag pentru acest task.

---

## §5 Commit message

**NU commit** dacă audit-only ZERO changes. Dacă raport trebuie persistat:

```
docs(audit): workflow antrenament V1 prod parity cross-skin × 4 audit raport

Audit-only readonly task. ZERO code changes. Output raport `LATEST.md`.

Per Daniel directive 2026-05-10: Workflow antrenament V1 LOCK = "exact ca prod".
Audit parity cross-skin × 4 mockup files vs production existing pattern.

Findings:
- <enumerate parity matrix per skin × feature>
- <flag discrepancies per skin (drift / missing / extra)>

Cluster #3 Workflow + scope cuts · Task 15/16 Phase 1 orchestrator (closure Cluster #3).
Theme Parity Invariant V1 — discrepancies = Phase 2 follow-up candidates.
Tests 2731 PASS preserved EXACT (audit-only ZERO changes).

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 Workflow antrenament V1 LOCK exact ca prod
- src/state.js + src/pages/coach.js production workflow source
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 15 — Workflow Antrenament V1 Audit Prod Parity Cross-Skin × 4 (READ-ONLY)

- **Model:** Opus
- **Status:** Complete (audit-only, ZERO changes)
- **Pre-flight:** <production workflow features enumerated src/state.js + src/pages/coach.js>

### Parity Matrix per Skin × Feature

| Feature | Clasic | Living Body | Luxury | Brain Coach |
|---------|--------|-------------|--------|-------------|
| Auto-advance pauză | <PARITY/MISSING/DRIFT> | <...> | <...> | <...> |
| Edit manual kg post-set | <...> | <...> | <...> | <...> |
| Edit manual reps post-set | <...> | <...> | <...> | <...> |
| Set complete UI flow | <...> | <...> | <...> | <...> |
| Session active state visual | <...> | <...> | <...> | <...> |
| Pause timer countdown UI | <...> | <...> | <...> | <...> |
| RPE prompt post-set | <...> | <...> | <...> | <...> |

### Discrepancies flagged (Phase 2 follow-up candidates)

- **Clasic:** <list discrepancies>
- **Living Body:** <list>
- **Luxury:** <list>
- **Brain Coach:** <list>

### Theme Parity Invariant V1 status

- 4/4 themes uniform: <YES/NO>
- Violations needing fix Phase 2: <count>
- Bugatti gigascalabilă end product perfect target: <gap analysis>

- **Tests:** 2731 PASS preserved (audit-only)
- **Build:** PASS (NU changes)
- **Commit:** <SHA if raport persisted | NU commit if pure raport stdout>
- **Pushed:** <origin/main if commit | N/A>
- **Issues:** <none | discrepancies enumerated above>
- **Next action:** Phase 1 COMPLETE (Tasks 01-15 done) — Phase 2 chat-2 pickup remaining clusters #4-#9 + standalone + mini orchestrator FINAL coordonator
```
