# TASK 02 — Big 6 Hard T0 Wiring · Andura Living Body Mockup

**Model:** Opus
**Velocity:** ~10-15 min CC autonomous
**Cluster:** #1 Auth wiring · Atom 2/4 cross-skin
**Authority:** ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7 Big 6 hard T0
**Precedent:** Task 01 Clasic (replicate same logic, Living Body palette/fonturi specific)

---

## §0 Pre-flight grep MANDATORY

```bash
ls -la 04-architecture/mockups/andura-living-body.html

grep -niE "onboarding|step|bun venit|obiectiv|vârst|sex |înălțim|greutate|frecvenț" 04-architecture/mockups/andura-living-body.html | head -60

grep -niE "skip|sări peste|opțional|mai târziu" 04-architecture/mockups/andura-living-body.html | head -20

grep -niE "required|min=|max=" 04-architecture/mockups/andura-living-body.html | head -30
```

---

## §1 Scope

Identical cu Task 01 Clasic, applied Living Body mockup. **Theme Parity Invariant V1 — logic 1:1 strict cu Task 01.**

**Big 6 hard required T0:**
1. Sex required
2. Vârstă required (16-99)
3. **Înălțime required (100-250 cm) — skip REMOVED**
4. **Greutate required (30-300 kg) — skip REMOVED**
5. Obiectiv required (6 templates rename Mentenanță+Auto = Task 06)
6. Frecvență required (2-6x/săpt)

**NU touch:** Istoric medical (skippable preserved) | omulețul muscular Progres (Living Body specific FEATURE preserved per Theme Parity exception) | Mentenanță+Auto rename templates (Task 06)

---

## §2 Files modify

- `04-architecture/mockups/andura-living-body.html` atomic single file

---

## §3 Acceptance criteria

1. ✅ Skip removed Greutate + Înălțime
2. ✅ Înălțime field `required` (range 100-250 cm)
3. ✅ Greutate field `required` (range 30-300 kg)
4. ✅ Sex/Vârstă/Frecvență `required` confirmed
5. ✅ Tests 2731 PASS preserved EXACT
6. ✅ Build PASS
7. ✅ Manual smoke `localhost:5173/04-architecture/mockups/andura-living-body.html` — Big 6 flow + omulețul muscular Progres preserved
8. ✅ **Diff parity check vs Clasic:** logic identical (different palette/fonturi only)

---

## §4 Backup tag

```bash
git tag pre-task02-big6-livingbody-$(date +%Y-%m-%d-%H%M)
git push origin pre-task02-big6-livingbody-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(onboarding-livingbody): Big 6 hard T0 wiring + skip removal Greutate+Înălțime

Per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7 + Theme Parity Invariant V1.
Logic 1:1 cu Clasic Task 01 (palette/fonturi Living Body specific).

Cluster #1 Auth wiring · Task 02/16 Phase 1 orchestrator.
Tests 2731 PASS preserved EXACT.
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 02 — Big 6 Hard T0 Living Body Mockup

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings>
- **Modificări:** <atomic diff>
- **Diff parity vs Clasic:** Verified identical logic
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | description>
- **Next action:** TASK 03 (Big 6 Hard T0 Luxury)
```
