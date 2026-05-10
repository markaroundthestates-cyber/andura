# TASK 28 — Glossary "Comportament Familie" Luxury Jargon Gigel-Replace · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~15-25 min CC autonomous (4 mockup files atomic + glossary apply)
**Cluster:** #7 Glossary jargon LOCK V1 · Atom 5/5 (closure Cluster #7)
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ noapte Glossary jargon LOCK V1 — Daniel-ism verbatim *"habar nu am ce e"* Gigel test fail trigger Comportament Familie Luxury

---

## ⚠️ NEED_CONTEXT_DANIEL inline

**Status: AMBIGUITATE FUNCȚIONALĂ**

"Comportament Familie" e Luxury-specific section/feature identified Daniel smoke test 4 themes. Posibil candidate:
- **Bayesian inference family** (categorii comportament user — Executor / Strategic / Frustrat etc per ADR_MODE_DETECTION_UI_v1)
- **Pattern detection family** (consistency patterns — workout adherence, recovery)
- **Profile typing family** (T0/T1/T2 progression behavioral)
- **Other Luxury-only positioning copy** (marketing-style phrasing for "premium" feel)

Daniel-ism *"habar nu am ce e"* indică wording opaque, NU funcționalitate broken — așadar replace UI string suficient, NU refactor feature.

**Daniel completează:** Listă concretă instances "Comportament Familie" Luxury + intended meaning. Sau Co-CTO scope decide post pre-flight grep + raport propose.

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate "Comportament Familie" Luxury-specific
grep -niEB 3 -A 3 "comportament.*familie|Comportament Familie|behavior.*family" 04-architecture/mockups/andura-luxury.html | head -30

# Verify if exists also în alte skin-uri (potential parity violation Task 22)
for skin in clasic living-body brain-coach; do
  echo "=== $skin (NU expect) ==="
  grep -niE "comportament.*familie|Comportament Familie" 04-architecture/mockups/andura-$skin.html | head -5
done

# Verify production code behavior family pattern
grep -rniE "behaviorFamily|behaviorClass|profileBehavior|FAMILY_" src/ --include="*.js" 2>/dev/null | head -10
```

---

## §1 Scope

Disambiguate + replace "Comportament Familie" Luxury-specific jargon cu Gigel-friendly wording. Verify parity violation candidate (dacă există în Luxury dar NU în alte 3 skin-uri = Theme Parity Invariant V1 issue).

**Replacement spec LOCK V1 candidate (post-disambiguation):**
- **Option A:** "Tipare comportament" (descriptive RO)
- **Option B:** "Stilul tău" (personal, Gigel-friendly direct address)
- **Option C:** "Cum te antrenezi" (acțiune concretă)
- **Option D:** REMOVE complet dacă wording = marketing fluff Luxury-only fără funcționalitate

**RECOMMENDED Co-CTO scope:** Option B "Stilul tău" sau Option C "Cum te antrenezi" — direct address Gigel test friendly. Option D dacă pre-flight reveal pure marketing copy NU mapped la engine feature.

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Pre-flight grep** + Luxury-only verify (parity violation candidate)
2. **If Luxury-only NU în alte skin-uri:** Theme Parity Invariant V1 violation flag — Task 22 follow-up scope (this task DOAR replace wording dacă applicable)
3. **Replace wording** Option B/C/D per disambiguation
4. **NU touch** alte skin-uri dacă wording NU exist them
5. **NEED_CONTEXT_DANIEL flag** dacă funcționalitate ambiguă

**Theme Parity Invariant V1:** Dacă Luxury are feature/section absent altele = HARD violation flag pentru Task 22.

**NU touch:**
- Engine code `src/`
- Other jargon terms (Tasks 24-27 separate atomic)

---

## §2 Files modify

- `04-architecture/mockups/andura-luxury.html` (primary, dacă feature Luxury-only)
- Possibly altele dacă wording exist + needs uniform replace per Theme Parity

Atomic single commit cu detail per skin.

---

## §3 Acceptance criteria

1. ✅ Pre-flight grep disambiguates feature meaning
2. ✅ Parity violation flag dacă Luxury-only (Task 22 follow-up)
3. ✅ "Comportament Familie" replaced cu wording Gigel-friendly per Option selected
4. ✅ NEED_CONTEXT_DANIEL flag inline raport dacă ambigu
5. ✅ Cross-skin × 4 wording uniform DOAR dacă feature exist all 4 (per Theme Parity)
6. ✅ Tests 2731 PASS preserved EXACT
7. ✅ Build PASS
8. ✅ Manual smoke Luxury — Gigel test pass: wording new înțeles regular user
9. ✅ Grep post-fix: ZERO ambiguous "Comportament Familie" în UI strings

---

## §4 Backup tag

```bash
git tag pre-task28-glossary-comportament-familie-$(date +%Y-%m-%d-%H%M)
git push origin pre-task28-glossary-comportament-familie-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
fix(glossary-jargon): replace "Comportament Familie" Luxury cross-skin

Per Glossary LOCK V1 + Daniel-ism Gigel test fail: "habar nu am ce e"

Disambiguation post-grep:
- Feature meaning: <enumerated post-pre-flight>
- Replacement: "Comportament Familie" → "<wording new Gigel-friendly>"

Theme Parity Invariant V1 status:
- <Luxury-only flag if applicable → Task 22 follow-up>
- <or cross-skin uniform if exist all 4>

Preserved internal:
- Engine variables (untouched)

Cluster #7 Glossary jargon LOCK V1 · Task 28/N (closure Cluster #7) Phase 2 orchestrator.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 Glossary jargon LOCK V1
- Tasks 24-27 precedent pattern
- Task 22 Theme parity violations follow-up dacă Luxury-only
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 28 — Glossary "Comportament Familie" Luxury Replace (closure Cluster #7)

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <feature meaning disambiguation + Luxury-only verify>

### Theme Parity Invariant V1 status

- **Luxury-only feature:** <YES → Task 22 HARD violation flag | NO uniform cross-skin>
- **Wording replaced:** "Comportament Familie" → "<new wording Option B/C/D>"

### NEED_CONTEXT_DANIEL flag

- <Functional meaning still ambiguous if not resolved>

- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | parity violation flag for Task 22>
- **Next action:** TASK 29 (Cluster #9 Text liber edge cases re-fix start)
```
