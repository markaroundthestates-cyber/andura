# TASK 17 — Istoric Drill Range Selector 30/60/90/Tot · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~15-25 min CC autonomous (4 mockup files atomic)
**Cluster:** #4 Istoric calendar · Atom 2/3
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ "Progres↔Istoric distincție UX" — Istoric drill range selector 30/60/90/Tot

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate range selector elements per skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin range selector ==="
  grep -niE "range.*selector|30 zile|60 zile|90 zile|Tot|toate datele|filter.*range" 04-architecture/mockups/andura-$skin.html | head -15
done

# Verify spec authoritative
grep -niE "drill range selector|30/60/90|Greutate.*BF full timeline" 00-index/CURRENT_STATE.md | head -10

# Verify production existing range pattern
grep -rniE "rangeSelector|histRange|timeRange|days.*30|days.*60|days.*90" src/ --include="*.js" 2>/dev/null | head -15
```

---

## §1 Scope

Add drill range selector 30/60/90/Tot cross-skin × 4 mockup files atomic în Istoric tab per Progres↔Istoric distincție LOCK V1.

**Spec LOCK V1:**
- **Range buttons:** `[30z] [60z] [90z] [Tot]` (4 segmented buttons sau pill toggle)
- **Default:** 30 zile (most recent context)
- **Behavior:** tap range button → filter timeline + greutate chart + BF chart la range selected
- **Visual feedback:** active state pill highlight cross-skin (palette diferă, structure identic)

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Add range selector UI** Istoric tab top section (above calendar/timeline)
2. **4 buttons** uniform cross-skin: `30z` / `60z` / `90z` / `Tot`
3. **Active state visual** (highlight pill / underline / accent border)
4. **Default selection:** `30z` (active state initial)
5. **Filter behavior** placeholder/wiring (UI only — engine filter implementation follow-up)

**NU touch:**
- Photo progress integration (Task 18 separat)
- Calendar layout structure (Task 16 already audited)
- Engine code filtering logic (`src/`) — UI mockup only V1
- Progres tab "Greutate trend 7z snapshot" (scope distinct)

**Theme Parity Invariant V1:** Logic 1:1 strict (4 buttons label identic, active state pattern identic, palette/font diferă).

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Range selector UI present Istoric tab cross-skin × 4
2. ✅ 4 buttons label uniform: `30z` / `60z` / `90z` / `Tot`
3. ✅ Default `30z` active state initial
4. ✅ Active state visual feedback (pill / accent / underline) cross-skin uniform pattern
5. ✅ **Diff parity verify:** logic identical 4/4
6. ✅ Tests 2731 PASS preserved EXACT
7. ✅ Build PASS
8. ✅ Manual smoke 4 themes — range selector tap walk-through visual feedback

---

## §4 Backup tag

```bash
git tag pre-task17-istoric-range-selector-$(date +%Y-%m-%d-%H%M)
git push origin pre-task17-istoric-range-selector-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(istoric-range): drill range selector 30/60/90/Tot cross-skin × 4

Per CURRENT_STATE §JUST_DECIDED 2026-05-10 Progres↔Istoric distincție LOCK V1:
- Range buttons [30z] [60z] [90z] [Tot] segmented Istoric top
- Default 30z active state initial
- Filter behavior placeholder UI only (engine wiring follow-up)

Cluster #4 Istoric calendar · Task 17/N Phase 2 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 drill range selector
- Task 16 calendar layout precedent
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 17 — Istoric Drill Range Selector Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings range elements per skin>
- **Modificări per-skin:**
  - Clasic: <atomic diff range selector>
  - Living Body: <atomic diff>
  - Luxury: <atomic diff>
  - Brain Coach: <atomic diff>
- **Diff parity 4/4:** Verified identical logic
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 18 (Istoric Greutate+BF timeline + photo progress cross-skin × 4)
```
