# TASK 37 — Schimbă Fază Manual Override Scope Clarify (Closure 6 Features)

**Model:** Opus
**Velocity:** ~10-15 min CC autonomous (scope verify cross-ref Task 20)
**Cluster:** Standalone 6 features recovery · Atom 6/6 (closure)
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 6 features recovery — `setPhaseOverride()` / `clearPhaseOverride()` existing `src/pages/plan.js` (CUT/BULK/MAINTENANCE/STRENGTH/AUTO)

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify setPhaseOverride existing prod
grep -niE "setPhaseOverride|clearPhaseOverride|phaseOverride|CUT.*BULK.*MAINTENANCE" src/pages/plan.js | head -25

# Verify Auto template revert pattern (Task 06 cross-ref)
grep -niE "Auto.*engine.*decide|clearPhaseOverride.*revert" src/pages/plan.js | head -10

# Verify Task 20 destructive confirm pattern V2 universal applied
ls -la 📤_outbox/_archive/2026-05/ | grep -E "TASK_20|goalshift_destructive"
```

---

## §1 Scope

Verify Schimbă fază manual override feature existing prod + cross-ref Task 20 destructive confirm pattern V2 universal applied. NU additive, scope clarify recovery (closure 6 features).

**Existing prod feature:**
- `setPhaseOverride(phase)` — set CUT/BULK/MAINTENANCE/STRENGTH manual override
- `clearPhaseOverride()` — revert engine decide (AUTO template Task 06 cross-ref)
- 5 opțiuni: CUT / BULK / MAINTENANCE / STRENGTH / AUTO

**Cross-ref applied:**
- **Task 06:** AUTO al 6-lea opțiune templates production-aligned
- **Task 20:** Destructive confirm pattern V2 universal applied UI flow Schimbă fază
- **6 templates V2 LOCK:** Forță / Tonifiere / Slăbire / Longevitate / Mentenanță / Auto mapping internal → setPhaseOverride/clearPhaseOverride

**Acțiuni:**
1. Verify prod scope + Task 20 destructive confirm UI applied
2. Cross-ref consistency 6 templates V2 mapping (Task 06) + override flow (Task 20)
3. Spec V2 doc consolidat — 6 features recovery COMPLETE 6/6 documentat

---

## §2 Files modify

ZERO src changes. Mockup × 4 already addressed Task 20 destructive confirm.

---

## §3 Acceptance criteria

1. ✅ Prod setPhaseOverride/clearPhaseOverride verified
2. ✅ Task 20 destructive confirm cross-ref applied
3. ✅ Task 06 6 templates V2 mapping consistent
4. ✅ 6 features recovery COMPLETE 6/6 documented vault
5. ✅ Tests 2731 PASS preserved EXACT
6. ✅ Build PASS

---

## §4 Backup tag

```bash
git tag pre-task37-phaseoverride-scope-$(date +%Y-%m-%d-%H%M)
git push origin pre-task37-phaseoverride-scope-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message (dacă applicable)

```
docs(features-recovery): Schimbă fază manual override scope clarify V2 spec (closure 6/6)

Per CURRENT_STATE §JUST_DECIDED 2026-05-10 6 features recovery preserved.

setPhaseOverride/clearPhaseOverride verified existing prod src/pages/plan.js.
Cross-refs:
- Task 20 destructive confirm V2 universal pattern applied
- Task 06 6 templates V2 mapping internal Forță/Tonifiere/Slăbire/Longevitate/Mentenanță/Auto

Standalone Task 37/N Phase 2 orchestrator (atom 6/6 closure features recovery).
6 features recovery COMPLETE 6/6 documented vault.
Tests 2731 PASS preserved EXACT.
```

---

## §6 Raport `📤_outbox/LATEST.md`

```
## TASK 37 — Schimbă Fază Manual Override Scope Clarify (Closure 6 Features)

- **Model:** Opus
- **Status:** Complete (scope verify)
- **Pre-flight:** <prod verified + Task 20 cross-ref + Task 06 mapping>
- **6 features recovery:** COMPLETE 6/6 documented vault
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Next action:** TASK 38 (mini orchestrator FINAL coordonator — Phase 2 closure)
```
