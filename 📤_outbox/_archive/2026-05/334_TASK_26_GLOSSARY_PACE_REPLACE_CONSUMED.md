# TASK 26 — Glossary Pace Jargon Gigel-Replace · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~15-25 min CC autonomous (4 mockup files atomic + glossary apply)
**Cluster:** #7 Glossary jargon LOCK V1 · Atom 3/5
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ noapte Glossary jargon LOCK V1 — Daniel-ism verbatim *"daca eu nu inteleg... ce intelege un regular user"* Gigel test fail trigger Pace observată

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate Pace jargon instances cross-skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin Pace ==="
  grep -niE "pace|pace observată|pace observata|cadent|cadență|tempo.*sesiune|ritm.*sesiune" 04-architecture/mockups/andura-$skin.html | head -15
done

# Verify production code Pace pattern (preserve internal)
grep -rniE "pace|sessionPace|paceObserved|cadenceMetric" src/ --include="*.js" 2>/dev/null | head -10
```

---

## §1 Scope

Replace "Pace observată" / "Pace" jargon UI strings cross-skin × 4 mockup files atomic cu Gigel-friendly wording.

**Replacement spec LOCK V1 candidate:**
- **Option A:** "Ritm sesiune" (universal RO, intuitive)
- **Option B:** "Viteza sesiune" (alternativ — risk confusion cu running pace)
- **Option C:** "Timp între seturi" (hyper-descriptive metric explicit)

**RECOMMENDED Co-CTO scope:** Option A "Ritm sesiune" — Daniel-ism *"daca eu nu inteleg... ce intelege un regular user"* indică confusion semantic. "Ritm" = neutral RO universal, NU jargon EN.

**ATTENTION semantic distinction:**
- "Pace" în fitness EN = adesea running cadence (km/h, /km tempo)
- "Pace observată" Andura context = probabil rest time între seturi sau cadence reps/sec
- **NEED_CONTEXT_DANIEL flag inline:** Verify pre-flight grep producție pentru concrete metric meaning. Dacă rest time → wording "Ritm pauze" mai precis. Dacă cadence reps → "Ritm execuție".

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Identify** toate "Pace" / "Pace observată" string occurrences per skin
2. **Pre-flight grep** production code disambiguate metric meaning
3. **Replace** cu Option A "Ritm sesiune" (default) sau adjust per metric meaning
4. **NU touch** internal code variables (`pace`, `sessionPace` preserved)

**Theme Parity Invariant V1:** Logic 1:1 strict cross-skin.

**NU touch:**
- Engine code `src/` pace variables
- Other jargon terms (Tasks 24-25, 27-28 separate atomic)

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Pre-flight grep production disambiguates metric (rest time / cadence / etc)
2. ✅ ALL "Pace" UI strings replaced (default "Ritm sesiune" sau adjusted per metric)
3. ✅ Internal code variables preserved
4. ✅ Cross-skin × 4 wording identical
5. ✅ **Diff parity verify:** logic identical 4/4
6. ✅ Tests 2731 PASS preserved EXACT
7. ✅ Build PASS
8. ✅ Manual smoke 4 themes — Gigel test pass: regular user înțelege wording
9. ✅ Grep post-fix: ZERO occurrences "Pace" în mockup UI strings

**NEED_CONTEXT_DANIEL flag în raport** dacă pace meaning ambigu post-grep.

---

## §4 Backup tag

```bash
git tag pre-task26-glossary-pace-replace-$(date +%Y-%m-%d-%H%M)
git push origin pre-task26-glossary-pace-replace-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
fix(glossary-jargon): replace Pace with "Ritm sesiune" cross-skin × 4

Per Glossary LOCK V1 + Daniel-ism Gigel test fail:
"daca eu nu inteleg... ce intelege un regular user"

Replacement applied:
- "Pace" / "Pace observată" → "Ritm sesiune" (default)
- Adjusted per metric meaning if disambiguation needed (rest time → "Ritm pauze")

Preserved internal:
- Engine variables `pace`, `sessionPace` (untouched)

Cluster #7 Glossary jargon LOCK V1 · Task 26/N Phase 2 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 Glossary jargon LOCK V1
- Tasks 24-25 precedent pattern
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 26 — Glossary Pace Replace Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings Pace metric disambiguation + occurrences per skin>
- **Modificări per-skin:**
  - Clasic: <count instances replaced>
  - Living Body: <count>
  - Luxury: <count>
  - Brain Coach: <count>
- **Diff parity 4/4:** Verified wording uniform
- **Metric meaning resolved:** <rest time / cadence / other>
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **NEED_CONTEXT_DANIEL flag:** <if pace ambigu, list options>
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 27 (Glossary Mărime jargon replace cross-skin × 4)
```
