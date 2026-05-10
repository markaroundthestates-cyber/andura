# TASK 22 — Theme Parity Violations Fix Per Audits · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~30-50 min CC autonomous (atomic per-violation fix, scope-dependent count)
**Cluster:** #6 State bugs · Atom 2/3
**Authority:** Theme Parity Invariant V1 LOCK (CURRENT_STATE §JUST_DECIDED 2026-05-10) + Audit findings Tasks 15 (Workflow audit) + 21 (State bugs audit) — fix HARD violations identified
**Type:** Atomic fixes per violation (scope determined post Tasks 15+21 raports)

---

## ⚠️ DEPENDENCY: Tasks 15 + 21 raports MUST be complete before this task

**Pre-execution gate:** Verify Tasks 15 (Workflow audit) + Task 21 (State bugs audit) raports exist în `📤_outbox/_archive/<YYYY-MM>/` cu HARD violations enumerated. Dacă raports lipsesc → STOP escalate Daniel.

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify Tasks 15 + 21 raports exist
ls -la 📤_outbox/_archive/2026-05/ | grep -E "TASK_15|TASK_21|workflow_audit|state_bugs_audit"

# Read raports HARD violations enumerated
cat 📤_outbox/_archive/2026-05/<NN_TASK_15_*>_CONSUMED.md | grep -A 5 "HARD"
cat 📤_outbox/_archive/2026-05/<NN_TASK_21_*>_CONSUMED.md | grep -A 5 "HARD"

# Theme Parity Invariant V1 spec authoritative
grep -niE "Theme Parity Invariant V1|1 app 4 skin-uri 1:1 strict|diferă DOAR cosmetic" 00-index/CURRENT_STATE.md | head -10

# Excepție singură (omulețul muscular Living Body)
grep -niE "omulețul muscular|Living Body.*Progres.*lipsește" 00-index/CURRENT_STATE.md | head -5
```

---

## §1 Scope

Fix HARD violations Theme Parity Invariant V1 identified per Tasks 15 + 21 audit raports. Atomic per-violation fix cross-skin × 4 mockup files.

**Theme Parity Invariant V1 reaffirm:**
- 1 app, 4 skin-uri 1:1 strict
- Logic identical cross-skin
- Diferă DOAR cosmetic (palette + fonturi)
- **Singură excepție LOCKED:** omulețul muscular Living Body în Progres tab (lipsește complet pe Clasic / Luxury / Brain Coach — feature-specific Living Body theme)

**Acțiuni atomic per violation HARD identified Tasks 15+21:**

Per fiecare violation HARD:
1. **Identify root cause** — care skin diferă vs reference baseline (Clasic = primary baseline reference per CURRENT_STATE Daniel-ism)
2. **Determine fix direction:**
   - Align deviating skin la baseline (most common)
   - Update baseline dacă deviating skin = better pattern (rare, requires Daniel approval)
3. **Apply atomic fix** mockup file deviating
4. **Verify parity** post-fix (diff check vs baseline)
5. **Document fix** în commit per violation atomic

**Fail-cluster mode acceptable:** Dacă 1 fix breaks layout altă section, log + continue restul violations. Per Bugatti reset definition: end product perfect, NU process zero-error.

**NU touch:**
- SOFT violations (polish post-Beta — backlog separate)
- DEFERRED violations (V2 — explicit defer)
- Omulețul muscular Living Body Progres (LOCKED exception preserved)
- Engine code (`src/`) — UI mockup only

---

## §2 Files modify

Determined post Tasks 15+21 raports — atomic per violation fixed.

Possible files:
- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic per-violation fixes (NU monolith) — granular recovery dacă o violation breaks.

---

## §3 Acceptance criteria

1. ✅ Tasks 15 + 21 raports HARD violations enumerated extracted
2. ✅ Per violation HARD: atomic fix applied + diff parity verify
3. ✅ Theme Parity Invariant V1 restored (logic 1:1 cross-skin × 4)
4. ✅ Omulețul muscular Living Body Progres exception preserved unchanged
5. ✅ **Diff parity verify cumulative:** logic identical 4/4 post all fixes
6. ✅ Tests 2731 PASS preserved EXACT (UI mockup only)
7. ✅ Build PASS
8. ✅ Manual smoke 4 themes — re-verify violations resolved
9. ✅ Raport per violation fix detail commit by commit

**Fail-cluster mode:** Per-violation atomic, log fail + continue.

---

## §4 Backup tag

```bash
git tag pre-task22-theme-parity-fix-$(date +%Y-%m-%d-%H%M)
git push origin pre-task22-theme-parity-fix-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message (per violation atomic)

Format per atomic commit:

```
fix(theme-parity): <skin> <violation_description> align baseline

Per Tasks 15+21 audit HARD violation:
- Skin: <which deviating>
- Description: <what diferă vs baseline>
- Root cause: <why diverged>
- Fix: <atomic change applied>

Theme Parity Invariant V1 restored — logic identical 4/4 cross-skin.
Cluster #6 State bugs · Task 22/N Phase 2 orchestrator (per-violation atomic).
Tests 2731 PASS preserved EXACT.

Cross-refs:
- Task 15 Workflow audit raport
- Task 21 State bugs audit raport
- CURRENT_STATE §JUST_DECIDED 2026-05-10 Theme Parity Invariant V1
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 22 — Theme Parity Violations Fix Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <Tasks 15+21 raports HARD violations extracted, count N>

### Per-violation atomic fixes applied

| # | Skin | Dimension | Description | Fix applied | Commit SHA |
|---|------|-----------|-------------|-------------|------------|
| 1 | <skin> | <dim> | <desc> | <fix> | <SHA> |
| 2 | ... | ... | ... | ... | ... |
| ... | ... | ... | ... | ... | ... |

### Diff parity post-fixes verify

- 4/4 themes parity restored: <YES / NO>
- Omulețul Living Body Progres exception preserved: <YES verified>
- Bugatti craft target: <gap analysis post-fixes>

### Failures (fail-cluster mode)

- <Violation X failed: reason + skip rationale>

- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commits:** <list per-violation atomic SHAs>
- **Pushed:** origin/main
- **Issues:** <none | failed violations enumerated>
- **Next action:** TASK 23 (Workflow antrenament V1 LOCK auto-advance + edit manual cross-skin × 4)
```
