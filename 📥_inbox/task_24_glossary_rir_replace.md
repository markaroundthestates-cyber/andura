# TASK 24 — Glossary RIR (Reps in Reserve) Jargon Gigel-Replace · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~15-25 min CC autonomous (4 mockup files atomic + glossary apply)
**Cluster:** #7 Glossary jargon LOCK V1 · Atom 1/5
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ noapte Glossary jargon LOCK V1 — Daniel-ism verbatim *"daca imi zici reps in reserve ma supar"* Gigel test fail trigger

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate RIR jargon instances cross-skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin RIR ==="
  grep -niE "RIR|Reps in Reserve|reps.*reserve|în rezervă|rezerve" 04-architecture/mockups/andura-$skin.html | head -15
done

# Locate RIR în production code (preserve internal logic, replace UI strings)
grep -rniE "RIR|repsInReserve|rir.*field|RIR_" src/ --include="*.js" --include="*.html" | head -20

# Verify Gigel-friendly replacement candidates în vault
grep -niE "RIR.*replace|reps in reserve.*Gigel|cât mai poți|încă cât" 00-index/CURRENT_STATE.md 03-decisions/DECISION_LOG.md 2>/dev/null | head -10
```

---

## §1 Scope

Replace RIR jargon UI strings cross-skin × 4 mockup files atomic cu Gigel-friendly wording per Glossary LOCK V1 + Daniel-ism trigger.

**Replacement spec LOCK V1 candidate (Daniel decide între opțiuni dacă ambigui):**
- **Option A:** "Cât mai poți la final" / "Mai puteam încă X" (intuitive, conversational)
- **Option B:** "Energie rămasă set" / "Rezervă final set" (semi-tehnic dar accesibil)
- **Option C:** Tooltip inline cu termen tehnic + explanation hover (preserves jargon for power users)

**RECOMMENDED Co-CTO scope:** Option A "Cât mai poți la final" — Daniel-ism direct *"daca imi zici reps in reserve ma supar"* indică preferință zero-jargon clear. Option C tooltip post-Beta scope (power user only).

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Identify** toate "RIR" / "Reps in Reserve" / "reps în rezervă" string occurrences per skin
2. **Replace** cu wording Option A (Co-CTO recommend) — ALL instances UI labels / tooltips / placeholders
3. **NU touch** internal code variables / functions (`rir`, `repsInReserve` etc preserved logic)
4. **Internal data attribute** preserved pentru engine wiring (e.g. `data-metric="rir"` OK, doar UI string visible vizat)
5. **Tooltip optional** explanation termen tehnic dacă spațiu permite (Maria 65 NU citește tooltips, Marius IQ 139 ar putea aprecia)

**Theme Parity Invariant V1:** Logic 1:1 strict cross-skin (wording identical, palette/font diferă).

**NU touch:**
- Engine code `src/` RIR variables / functions (preserved exact)
- Other jargon terms (Tasks 25-28 separate atomic)

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ ALL "RIR" / "Reps in Reserve" UI strings replaced cu "Cât mai poți la final" (Option A)
2. ✅ Internal code variables preserved (`rir`, `repsInReserve` engine logic untouched)
3. ✅ data-metric / data-attribute internal preserved
4. ✅ Cross-skin × 4 wording identical
5. ✅ **Diff parity verify:** logic identical 4/4
6. ✅ Tests 2731 PASS preserved EXACT
7. ✅ Build PASS
8. ✅ Manual smoke 4 themes — Gigel test pass: Maria 65 înțelege "Cât mai poți la final" (acțiune concretă)
9. ✅ Grep post-fix: ZERO occurrences "RIR" sau "Reps in Reserve" în mockup UI strings (preserved doar internal data-attrs)

---

## §4 Backup tag

```bash
git tag pre-task24-glossary-rir-replace-$(date +%Y-%m-%d-%H%M)
git push origin pre-task24-glossary-rir-replace-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
fix(glossary-jargon): replace RIR with "Cât mai poți la final" cross-skin × 4

Per Glossary LOCK V1 (CURRENT_STATE §JUST_DECIDED 2026-05-10 chat noapte) +
Daniel-ism trigger Gigel test fail: "daca imi zici reps in reserve ma supar".

Replacement applied UI strings:
- "RIR" → "Cât mai poți la final"
- "Reps in Reserve" → "Cât mai poți la final"
- "reps în rezervă" → idem

Preserved internal:
- Engine variables `rir`, `repsInReserve` (untouched logic)
- data-metric attributes preserved engine wiring

Cluster #7 Glossary jargon LOCK V1 · Task 24/N Phase 2 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT.
Gigel test pass: Maria 65 înțelege wording acțiune concretă.

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 Glossary jargon LOCK V1
- ADR_MODE_DETECTION_UI EXT-7 Gigel test pattern wording funcțional
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 24 — Glossary RIR Replace Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings RIR occurrences per skin: N1/N2/N3/N4>
- **Modificări per-skin:**
  - Clasic: <count instances replaced>
  - Living Body: <count>
  - Luxury: <count>
  - Brain Coach: <count>
- **Diff parity 4/4:** Verified wording uniform "Cât mai poți la final"
- **Internal preserved:** Engine variables + data-attrs untouched
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 25 (Glossary TONAJ jargon replace cross-skin × 4)
```
