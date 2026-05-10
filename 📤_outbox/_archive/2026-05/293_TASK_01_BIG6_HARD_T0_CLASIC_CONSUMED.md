# TASK 01 — Big 6 Hard T0 Wiring · Andura Clasic Mockup

**Model:** Opus
**Velocity:** ~10-15 min CC autonomous
**Cluster:** #1 Auth wiring · Atom 1/4 cross-skin
**Authority:** ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7 Big 6 hard T0

---

## §0 Pre-flight grep MANDATORY (anti slip §AR.1)

```bash
# Verify path mockup
ls -la 04-architecture/mockups/andura-clasic.html

# Locate onboarding section + Big 6 fields current state
grep -niE "onboarding|step|bun venit|obiectiv|vârst|sex |înălțim|greutate|frecvenț" 04-architecture/mockups/andura-clasic.html | head -60

# Locate skip buttons / optional flags (must be REMOVED for Greutate+Înălțime if present)
grep -niE "skip|sări peste|opțional|mai târziu" 04-architecture/mockups/andura-clasic.html | head -20

# Verify Big 6 spec source authoritative
grep -niE "Big 6|hard required|hard T0|Mifflin|imutabile" 03-decisions/ADR_MULTI_TENANT_AUTH_v1.md | head -20

# Verify Sex/Vârstă/Frecvență deja hard
grep -niE "required|min=|max=" 04-architecture/mockups/andura-clasic.html | head -30
```

**Pre-flight FAIL conditions:**
- Mockup path nu există → STOP escalate Daniel
- Big 6 fields lipsesc complet (e.g. NU există Înălțime nicăieri) → STOP escalate Daniel scope clarify

---

## §1 Scope

Wire Big 6 hard T0 în Clasic mockup onboarding flow per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7:

**Big 6 hard required T0 (toate obligatoriu, ZERO skip):**
1. Sex (M/F/Altul radio required)
2. Vârstă (16-99 boundary required)
3. **Înălțime (cm input range 100-250 required) — Mifflin-St Jeor BMR/TDEE necesită**
4. **Greutate (kg input range 30-300 required)**
5. Obiectiv (6 templates — DOAR validate `required`, rename Mentenanță+Auto = Task 06 separat)
6. Frecvență (slider 2-6x/săpt required)

**Acțiuni concrete:**
- **Remove skip button/link** de pe ecranele Greutate + Înălțime (dacă există în current state)
- **Add `required` attribute** + validation Înălțime (min=100 max=250 step=1 cm) + Greutate (min=30 max=300 step=0.1 kg)
- Verify Sex/Vârstă/Frecvență deja `required` (V1 spec) — dacă "Sări peste" exists, remove
- **NU touch Istoric medical** (ecran 4 = skippable default "Niciuna" preserved per §50.3 D2)
- **NU rename Mentenanță / NU add Auto** la templates (separate Task 06 cross-skin atomic)

**Theme Parity Invariant V1:** Modificările cosmetice rămân Clasic-specific (palette + fonturi). Logic identical cross-skin pentru Big 6 — Tasks 02-04 aplicate Living Body / Luxury / Brain Coach.

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html` — onboarding section Big 6 wiring atomic single file

**NU touch:**
- Living Body / Luxury / Brain Coach mockups (Tasks 02-04 separat)
- ONBOARDING_SSOT_V1.md doc (Task 05 separat sync)
- `src/` engine code (mockup-only edit)
- Istoric medical ecran 4

---

## §3 Acceptance criteria

1. ✅ Skip removed pe Greutate + Înălțime ecrane (dacă existau)
2. ✅ Înălțime field present (input cm + range 100-250 + `required`)
3. ✅ Greutate field present (input kg + range 30-300 + `required`)
4. ✅ Sex/Vârstă/Frecvență `required` confirmed
5. ✅ Tests `npm run test:run` 2731 PASS preserved EXACT (mockup-only edit)
6. ✅ Build `npm run typecheck && npm run build` PASS
7. ✅ Manual smoke `localhost:5173/04-architecture/mockups/andura-clasic.html` — Big 6 flow walk-through verify zero skip

---

## §4 Backup tag MANDATORY

```bash
git tag pre-task01-big6-clasic-$(date +%Y-%m-%d-%H%M)
git push origin pre-task01-big6-clasic-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(onboarding-clasic): Big 6 hard T0 wiring + skip removal Greutate+Înălțime

Per ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7 Big 6 hard required T0:
- Sex / Vârstă / Înălțime / Greutate / Obiectiv / Frecvență toate obligatoriu
- Skip removed pe Greutate + Înălțime (Mifflin-St Jeor BMR/TDEE necesită)
- Validation rules: Înălțime 100-250 cm, Greutate 30-300 kg

Cluster #1 Auth wiring · Task 01/16 Phase 1 orchestrator.
Tests 2731 PASS preserved EXACT. Theme Parity Invariant V1.

Cross-refs:
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7
- ONBOARDING_SSOT_V1 §1 ECRANE pending sync Task 05
```

---

## §6 Raport format expected `📤_outbox/LATEST.md`

Per VAULT_RULES §AR.16 STRICT_OUTPUT_FILE V1:

```
## TASK 01 — Big 6 Hard T0 Clasic Mockup

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings grep onboarding section + skip buttons + Big 6 spec verify>
- **Modificări:** <line-by-line diff summary atomic — skip removed, validation added>
- **Tests:** 2731 PASS preserved | <regression details if any>
- **Build:** PASS | <error if any>
- **Commit:** <SHA short>
- **Pushed:** origin/main
- **Issues:** <none | description>
- **Next action:** TASK 02 (Big 6 Hard T0 Living Body)
```
