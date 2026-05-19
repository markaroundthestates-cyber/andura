# TASK 03 — Big 6 Hard T0 Wiring · Andura Luxury Mockup

**Model:** Opus
**Velocity:** ~10-15 min CC autonomous
**Cluster:** #1 Auth wiring · Atom 3/4 cross-skin
**Authority:** ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7 Big 6 hard T0
**Precedent:** Tasks 01-02 (replicate logic, Luxury palette `--champagne` Cormorant Garamond specific)

---

## §0 Pre-flight grep MANDATORY

```bash
ls -la 04-architecture/mockups/andura-luxury.html

grep -niE "onboarding|step|bun venit|obiectiv|vârst|sex |înălțim|greutate|frecvenț" 04-architecture/mockups/andura-luxury.html | head -60

grep -niE "skip|sări peste|opțional|mai târziu" 04-architecture/mockups/andura-luxury.html | head -20

grep -niE "required|min=|max=" 04-architecture/mockups/andura-luxury.html | head -30
```

---

## §1 Scope

Identical cu Tasks 01-02, applied Luxury mockup. Theme Parity Invariant V1 — logic 1:1.

**Big 6 hard required T0:** Sex / Vârstă / Înălțime / Greutate / Obiectiv / Frecvență toate required, ZERO skip.

**NU touch:** Istoric medical (skippable preserved) | Mentenanță+Auto rename templates (Task 06)

---

## §2 Files modify

- `04-architecture/mockups/andura-luxury.html` atomic single file

---

## §3 Acceptance criteria

1. ✅ Skip removed Greutate + Înălțime
2. ✅ Înălțime field `required` (100-250 cm)
3. ✅ Greutate field `required` (30-300 kg)
4. ✅ Sex/Vârstă/Frecvență `required` confirmed
5. ✅ Tests 2731 PASS preserved EXACT
6. ✅ Build PASS
7. ✅ Manual smoke `localhost:5173/04-architecture/mockups/andura-luxury.html` — Big 6 flow walk-through
8. ✅ **Diff parity check vs Clasic + Living Body:** logic identical

---

## §4 Backup tag

```bash
git tag pre-task03-big6-luxury-$(date +%Y-%m-%d-%H%M)
git push origin pre-task03-big6-luxury-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(onboarding-luxury): Big 6 hard T0 wiring + skip removal Greutate+Înălțime

Per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7 + Theme Parity Invariant V1.
Logic 1:1 cu Clasic + Living Body (palette champagne + Cormorant Luxury specific).

Cluster #1 Auth wiring · Task 03/16 Phase 1 orchestrator.
Tests 2731 PASS preserved EXACT.
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 03 — Big 6 Hard T0 Luxury Mockup

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings>
- **Modificări:** <atomic diff>
- **Diff parity vs Clasic + Living Body:** Verified identical logic
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | description>
- **Next action:** TASK 04 (Big 6 Hard T0 Brain Coach)
```
