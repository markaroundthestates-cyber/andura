# TASK 30 — "Altceva" Textbox Wiring Verify Sub Task 07 Merge · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~10-20 min CC autonomous (4 mockup files atomic verify wiring)
**Cluster:** #9 Text liber re-fix · Atom 2/2 (closure Cluster #9)
**Authority:** Task 07 "Ceva nu merge" merge drill preserved "Altceva" textbox liber Marius power user — verify wiring functional cross-skin × 4

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify Task 07 "Ceva nu merge" drill structure cross-skin (post Task 07 LANDED prerequisite)
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin Ceva nu merge drill ==="
  grep -niEB 2 -A 10 "Ceva nu merge|altceva" 04-architecture/mockups/andura-$skin.html | head -25
done

# Verify Task 29 edge cases polish applied (prerequisite)
ls -la 📤_outbox/_archive/2026-05/ | grep -E "TASK_29|textliber_edge"

# Verify Marius power user pattern preserved (free text 3+ predefined)
grep -niE "Marius power user|toggle Altceva|free text|3 opțiuni predefined" 00-index/CURRENT_STATE.md 2>/dev/null | head -10
```

---

## §1 Scope

Verify "Altceva" textbox wiring functional cross-skin × 4 mockup files atomic post Task 07 "Ceva nu merge" merge + Task 29 edge cases polish applied.

**Spec verify per Task 07 merge structure:**
- **Drill 4 opțiuni** sub buton "Ceva nu merge":
  1. "Mă doare" → Pain modal flow
  2. "Nu am aparat" → alternativeEngine.js substitution flow
  3. "Altceva" → free text textbox liber Marius
  4. "Anulează" (optional UX)
- **"Altceva" tap** → reveal textbox cu placeholder + char counter (Task 29 polish applied)
- **Submit Altceva** → save entry CDL `pain_other_text` sau `equipment_swap_other_text` per context

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Verify** "Altceva" present sub "Ceva nu merge" drill cross-skin × 4
2. **Verify** textbox reveals on tap "Altceva" (toggle pattern)
3. **Verify** edge cases polish applied (Task 29) — char limit / counter / placeholder / disabled state
4. **Verify** submit button wired la save handler placeholder
5. **Fix gaps** identified per skin (atomic per gap)

**Theme Parity Invariant V1:** Logic 1:1 strict cross-skin (4 opțiuni identic, "Altceva" toggle identic, palette/font diferă).

**NU touch:**
- Engine code `src/` Pain modal + alternativeEngine.js (preserved exact)
- Tasks 07 + 29 already LANDED — verify only, NU re-do
- Other clusters

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform (DOAR fix-uri necesare).

---

## §3 Acceptance criteria

1. ✅ "Altceva" present cross-skin × 4 sub "Ceva nu merge" drill
2. ✅ Textbox reveals on tap "Altceva" toggle pattern
3. ✅ Edge cases polish applied (Task 29) functional cross-skin × 4
4. ✅ Submit handler placeholder wired (CDL save destination correct context)
5. ✅ **Diff parity verify:** logic identical 4/4
6. ✅ Tests 2731 PASS preserved EXACT
7. ✅ Build PASS
8. ✅ Manual smoke 4 themes — full flow walk-through "Ceva nu merge" → "Altceva" → textbox → submit

**Fail-cluster mode:** Per skin gap fix atomic, log fail + continue restul.

---

## §4 Backup tag

```bash
git tag pre-task30-altceva-wiring-verify-$(date +%Y-%m-%d-%H%M)
git push origin pre-task30-altceva-wiring-verify-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
fix(altceva-wiring): verify + fix gaps cross-skin × 4 sub Task 07 merge (closure Cluster #9)

Per Task 07 "Ceva nu merge" merge drill preserved "Altceva" textbox Marius +
Task 29 edge cases polish prerequisites.

Verify + fix:
- "Altceva" present cross-skin × 4 sub drill
- Toggle pattern reveal textbox on tap
- Edge cases polish functional (Task 29)
- Submit handler wired CDL save context-specific

Cluster #9 Text liber re-fix · Task 30/N (closure Cluster #9) Phase 2 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- Task 07 "Ceva nu merge" merge prerequisite
- Task 29 textbox edge cases polish prerequisite
- ADR 023 pain text + equipment text preserved
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 30 — "Altceva" Wiring Verify Cross-Skin × 4 (closure Cluster #9)

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <Altceva instances + Tasks 07+29 prerequisites verified>
- **Gaps fixed per-skin:**
  - Clasic: <atomic diff fix-uri>
  - Living Body: <atomic diff>
  - Luxury: <atomic diff>
  - Brain Coach: <atomic diff>
- **Diff parity 4/4:** Verified identical wiring
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures>
- **Next action:** TASK 31 (Q1 engine aggregator V2 19→7 grupes refactor — Standalone start)
```
