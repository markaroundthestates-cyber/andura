# TASK 16 — Istoric Calendar Layout Audit + Fix · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~20-30 min CC autonomous (4 mockup files atomic)
**Cluster:** #4 Istoric calendar · Atom 1/3
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ "Progres↔Istoric distincție UX" + ROOT_NAV_V2 4 tabs (Antrenor / Progres / Istoric / Cont)

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate Istoric tab + calendar elements per skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin Istoric ==="
  grep -niE "istoric|calendar|date.*selector|range.*30|range.*60|range.*90|timeline|cronolog" 04-architecture/mockups/andura-$skin.html | head -20
done

# Verify ROOT_NAV_V2 4 tabs spec authoritative
grep -niE "Istoric|root.nav|4 tabs|Antrenor.*Progres.*Istoric.*Cont" 04-architecture/ROOT_NAV_V2_29_5_7_AMENDMENT.md 2>/dev/null | head -15

# Verify Progres↔Istoric distincție LOCK
grep -niE "Progres.*Istoric|Greutate trend 7z snapshot|Greutate.*BF full timeline|drill range" 00-index/CURRENT_STATE.md | head -10

# Verify production existing pattern Istoric
grep -rniE "renderHistory|histList|histEntry|cronolog" src/pages/ --include="*.js" | head -15
```

---

## §1 Scope

Audit + fix Istoric tab calendar layout cross-skin × 4 mockup files atomic per Progres↔Istoric distincție UX LOCK V1.

**Spec LOCK V1 (CURRENT_STATE §JUST_DECIDED 2026-05-10):**
- **Progres tab:** "Greutate trend 7z snapshot" mini-chart spark inline static, NO tap drill (quick glance)
- **Istoric tab:** "Greutate & BF full timeline" drill range selector 30/60/90/Tot + photo progress + BF tracking (deep analysis)

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Audit per skin** Istoric tab structure curent (calendar / list / timeline)
2. **Verify** lista cronologică minimalistă §29.5.9 LOCKED (filtru/sort DROP V1 — power user only post-luni)
3. **Fix** layout calendar inconsistencies cross-skin (Theme Parity Invariant V1)
4. **Calendar entries** = sesiuni antrenament + greutate logs + photo entries (timeline unified)
5. Date format consistent cross-skin: `DD/MM/YY` sau `D MMM` (verify existing prod pattern)

**NU touch:**
- Progres tab "Greutate trend 7z snapshot" (Task separat dacă needed, scope distinct)
- Drill range selector (Task 17 separat)
- Photo progress body integration (Task 18 separat)
- Filtru/sort dropdown (DROP V1 confirmat per §JUST_DECIDED 2026-05-10)
- Engine code (`src/`) — UI mockup only

**Theme Parity Invariant V1:** Logic 1:1 strict cross-skin (calendar layout structure identic, date format identic, palette/font diferă).

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Istoric tab present cross-skin × 4 (4 root nav `Antrenor / Progres / Istoric / Cont`)
2. ✅ Calendar/timeline layout uniform structure cross-skin × 4
3. ✅ Lista cronologică minimalistă §29.5.9 (NU filtru/sort dropdown)
4. ✅ Date format consistent cross-skin
5. ✅ Entries types: sesiuni + greutate + photos (timeline unified)
6. ✅ **Diff parity verify:** logic identical 4/4
7. ✅ Tests 2731 PASS preserved EXACT
8. ✅ Build PASS
9. ✅ Manual smoke 4 themes — Istoric tab walk-through layout consistent

**Fail-cluster mode:** Dacă 1 skin breaks layout, log + continue restul 3.

---

## §4 Backup tag

```bash
git tag pre-task16-istoric-calendar-layout-$(date +%Y-%m-%d-%H%M)
git push origin pre-task16-istoric-calendar-layout-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(istoric-calendar): layout audit + fix cross-skin × 4 themes uniform

Per CURRENT_STATE §JUST_DECIDED 2026-05-10 Progres↔Istoric distincție LOCK V1:
- Istoric tab "Greutate & BF full timeline" deep analysis context
- Lista cronologică minimalistă §29.5.9 (filtru/sort DROP V1)
- Calendar/timeline layout uniform Theme Parity Invariant V1

Cluster #4 Istoric calendar · Task 16/N Phase 2 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 Progres↔Istoric distincție UX
- §29.5.9 lista cronologică minimalistă LOCKED
- ROOT_NAV_V2 4 tabs (Antrenor / Progres / Istoric / Cont)
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 16 — Istoric Calendar Layout Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings Istoric structure per skin + spec verified>
- **Modificări per-skin:**
  - Clasic: <atomic diff calendar layout>
  - Living Body: <atomic diff>
  - Luxury: <atomic diff>
  - Brain Coach: <atomic diff>
- **Diff parity 4/4:** Verified identical logic
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 17 (Istoric drill range selector 30/60/90/Tot cross-skin × 4)
```
