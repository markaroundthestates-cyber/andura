# TASK 04 — Big 6 Hard T0 Wiring · Andura Brain Coach Mockup

**Model:** Opus
**Velocity:** ~10-15 min CC autonomous
**Cluster:** #1 Auth wiring · Atom 4/4 cross-skin (FINAL atom Cluster #1 mockup edits)
**Authority:** ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7 Big 6 hard T0
**Precedent:** Tasks 01-03 (replicate logic, Brain Coach palette/fonturi specific)

---

## §0 Pre-flight grep MANDATORY

```bash
ls -la 04-architecture/mockups/andura-brain-coach.html

grep -niE "onboarding|step|bun venit|obiectiv|vârst|sex |înălțim|greutate|frecvenț" 04-architecture/mockups/andura-brain-coach.html | head -60

grep -niE "skip|sări peste|opțional|mai târziu" 04-architecture/mockups/andura-brain-coach.html | head -20

grep -niE "required|min=|max=" 04-architecture/mockups/andura-brain-coach.html | head -30
```

---

## §1 Scope

Identical cu Tasks 01-03, applied Brain Coach mockup. Theme Parity Invariant V1.

**Big 6 hard required T0:** Sex / Vârstă / Înălțime / Greutate / Obiectiv / Frecvență toate required, ZERO skip.

**NU touch:** Istoric medical (skippable preserved) | Mentenanță+Auto rename (Task 06)

---

## §2 Files modify

- `04-architecture/mockups/andura-brain-coach.html` atomic single file

---

## §3 Acceptance criteria

1. ✅ Skip removed Greutate + Înălțime
2. ✅ Înălțime field `required` (100-250 cm)
3. ✅ Greutate field `required` (30-300 kg)
4. ✅ Sex/Vârstă/Frecvență `required` confirmed
5. ✅ Tests 2731 PASS preserved EXACT
6. ✅ Build PASS
7. ✅ Manual smoke `localhost:5173/04-architecture/mockups/andura-brain-coach.html`
8. ✅ **Diff parity check final vs Clasic + Living Body + Luxury:** logic identical 4/4

---

## §4 Backup tag

```bash
git tag pre-task04-big6-braincoach-$(date +%Y-%m-%d-%H%M)
git push origin pre-task04-big6-braincoach-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(onboarding-braincoach): Big 6 hard T0 wiring + skip removal Greutate+Înălțime

Per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7 + Theme Parity Invariant V1.
Logic 1:1 cu Clasic + Living Body + Luxury (Brain Coach palette specific).

Cluster #1 Auth wiring · Task 04/16 Phase 1 orchestrator.
Cross-skin × 4 themes Big 6 hard T0 wiring COMPLETE 4/4 mockup atoms.
Tests 2731 PASS preserved EXACT.
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 04 — Big 6 Hard T0 Brain Coach Mockup (FINAL atom Cluster #1 mockup edits)

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings>
- **Modificări:** <atomic diff>
- **Diff parity vs Clasic + Living Body + Luxury:** Verified identical logic 4/4
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | description>
- **Next action:** TASK 05 (ONBOARDING_SSOT_V1.md §1 ECRANE doc sync)
```
