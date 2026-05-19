# TASK 27 — Glossary Mărime Jargon Gigel-Replace · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~15-25 min CC autonomous (4 mockup files atomic + glossary apply)
**Cluster:** #7 Glossary jargon LOCK V1 · Atom 4/5
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ noapte Glossary jargon LOCK V1 — Daniel-ism verbatim *"marimea cui?"* Gigel test fail trigger Mărime ambigu

---

## ⚠️ NEED_CONTEXT_DANIEL inline

**Status: AMBIGUITATE SEMANTICĂ**

Daniel-ism *"marimea cui?"* indică context-dependence — "Mărime" în Andura UI poate referi la:
- **Mărime încălțăminte** (running shoes pentru cardio plan?)
- **Mărime pas** (lungime pas walking pentru kcal compute?)
- **Mărime echipament** (kg dumbbells available?)
- **Mărime grupe musculare** (small/medium/large groups Q1 aggregator?)
- **Mărime sesiune** (count sets / volume?)

**Daniel completează:** Listă exact instances "Mărime" în mockups + intended meaning. Sau Co-CTO scope decide: pre-flight grep identifies + raport propose Option per instance + Daniel confirm rapid.

---

## §0 Pre-flight grep MANDATORY (disambiguation primary)

```bash
# Locate Mărime occurrences cross-skin cu context lines
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin Mărime context ==="
  grep -niEB 2 -A 2 "mărime|Marime|MARIME" 04-architecture/mockups/andura-$skin.html | head -40
done

# Verify production code Mărime references
grep -rniE "marime|Mărime|size.*shoe|stride.*length|equipment.*size" src/ --include="*.js" --include="*.html" 2>/dev/null | head -15
```

---

## §1 Scope

Disambiguate + replace "Mărime" jargon UI strings cross-skin × 4 mockup files atomic per context-specific meaning identified pre-flight grep.

**Replacement spec context-specific (post-disambiguation):**
- Mărime încălțăminte → "Mărime pantofi" (explicit)
- Mărime pas → "Lungime pas (cm)" (Mifflin-St Jeor walking compute helper)
- Mărime echipament → "Greutate echipament" sau "kg dumbbells"
- Mărime grupe musculare → "Grupe mari/medii/mici" (anatomic descriptor)
- Mărime sesiune → "Volum sesiune" sau "Durată sesiune"

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Pre-flight grep** + context analysis identifies meaning per instance
2. **Per instance:** apply context-specific replacement
3. **Raport detail per instance:** original wording / context / replacement / rationale
4. **NEED_CONTEXT_DANIEL flag** dacă instance ambigu post-grep
5. **NU touch** internal code variables

**Theme Parity Invariant V1:** Logic 1:1 strict cross-skin.

**NU touch:**
- Engine code `src/`
- Other jargon terms (Tasks 24-26, 28 separate atomic)

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Pre-flight grep + context analysis per instance
2. ✅ ALL "Mărime" UI strings replaced cu context-specific wording
3. ✅ Internal code variables preserved
4. ✅ Cross-skin × 4 wording uniform per same context
5. ✅ NEED_CONTEXT_DANIEL flag inline raport pentru ambigui
6. ✅ **Diff parity verify:** logic identical 4/4
7. ✅ Tests 2731 PASS preserved EXACT
8. ✅ Build PASS
9. ✅ Manual smoke 4 themes — Gigel test pass: NU "marimea cui?" confusion
10. ✅ Grep post-fix: ZERO ambiguous "Mărime" în UI strings

---

## §4 Backup tag

```bash
git tag pre-task27-glossary-marime-replace-$(date +%Y-%m-%d-%H%M)
git push origin pre-task27-glossary-marime-replace-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
fix(glossary-jargon): disambiguate + replace Mărime cross-skin × 4

Per Glossary LOCK V1 + Daniel-ism Gigel test fail: "marimea cui?"

Disambiguation per context applied:
- Mărime <context_1> → "<replacement_1>"
- Mărime <context_2> → "<replacement_2>"
- ... (enumerate per instance)

Preserved internal:
- Engine variables (untouched)

Cluster #7 Glossary jargon LOCK V1 · Task 27/N Phase 2 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 Glossary jargon LOCK V1
- Tasks 24-26 precedent pattern
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 27 — Glossary Mărime Disambiguate + Replace Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <Mărime occurrences enumerated cu context per instance>

### Disambiguation per instance

| # | Skin | Context | Original | Replacement | Rationale |
|---|------|---------|----------|-------------|-----------|
| 1 | <skin> | <context> | "Mărime" | "<new>" | <why> |
| 2 | ... | ... | ... | ... | ... |

### NEED_CONTEXT_DANIEL flag

- <Ambiguous instance>: <description + Daniel decide options>

- **Diff parity 4/4:** Verified uniform per same context
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 28 (Glossary Comportament Familie Luxury jargon replace cross-skin × 4)
```
