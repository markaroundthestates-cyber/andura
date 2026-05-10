# TASK 18 — Istoric Greutate+BF Timeline + Photo Progress Body · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~25-35 min CC autonomous (4 mockup files atomic + chart + photo gallery wiring)
**Cluster:** #4 Istoric calendar · Atom 3/3 (closure Cluster #4)
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ "Greutate & BF full timeline + photo progress + BF tracking deep analysis" + 6 features recovery scope clarify (Photo progress body existing prod preserved)

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate Greutate + BF chart elements per skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin Greutate BF chart ==="
  grep -niE "greutate.*chart|BF.*chart|body.fat|timeline|progress.*photo|fotografi|photo.*upload" 04-architecture/mockups/andura-$skin.html | head -20
done

# Verify production existing Photo progress (existing prod recovery)
grep -rniE "photo.*progress|photoEntry|uploadPhoto|photoTimeline|photo.*body" src/ --include="*.js" 2>/dev/null | head -15

# Verify production weight chart pattern
grep -rniE "weightChart|weightTrend|histWeight|chartGreutate" src/ --include="*.js" 2>/dev/null | head -10

# Verify BF auto US Navy LOCK V1 (Task 08 cross-ref)
grep -niE "BF auto|US Navy|waist.*neck" 00-index/CURRENT_STATE.md | head -5
```

---

## §1 Scope

Add Greutate timeline + BF tracking timeline + Photo progress body integration cross-skin × 4 mockup files atomic în Istoric tab per Progres↔Istoric distincție LOCK V1 + 6 features recovery (Photo progress body existing prod preserved).

**Spec LOCK V1:**
- **Greutate full timeline:** chart deep analysis (line chart sau area chart) cu range selected (Task 17)
- **BF tracking timeline:** chart paralel cu Greutate (BF % over time) — sursă US Navy auto sau manual override (Task 08 cross-ref)
- **Photo progress body:** gallery thumbnails timeline cronologic + tap → fullscreen viewer + buton "Adaugă foto" (existing prod preserved)
- **Layout:** 3 sections vertical stack — Greutate chart / BF chart / Photo gallery

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Add Greutate timeline section** Istoric tab — line/area chart placeholder
2. **Add BF timeline section** sub Greutate — line chart placeholder cu sursă indicator (auto US Navy / manual / Demographic fallback)
3. **Add Photo progress body section** sub BF — gallery grid thumbnails (3-4 col) + buton "Adaugă foto" empty state
4. **Range selector** (Task 17) drives toate 3 sections (filter Greutate + BF + Photos la range selected)
5. **Photo gallery preserved** existing prod pattern (NU additive, scope clarify recovery)

**NU touch:**
- Engine code (`src/`) photo upload backend (existing prod preserved exact)
- Progres tab "Greutate trend 7z snapshot" (scope distinct)
- BF auto US Navy compute logic (Task 08 cross-ref UI only)
- Calendar layout structure (Task 16 already done)

**Theme Parity Invariant V1:** Logic 1:1 strict (3 sections vertical stack identic, gallery grid identic, palette/font diferă).

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Greutate timeline section present cross-skin × 4 (chart placeholder line/area)
2. ✅ BF timeline section present cross-skin × 4 (chart placeholder + sursă indicator)
3. ✅ Photo progress body gallery section present cross-skin × 4 (grid thumbnails + buton add)
4. ✅ Layout vertical stack 3 sections uniform
5. ✅ Range selector (Task 17) wiring placeholder drives toate 3 sections
6. ✅ Empty states present per section (no data fallback)
7. ✅ **Diff parity verify:** logic identical 4/4
8. ✅ Tests 2731 PASS preserved EXACT
9. ✅ Build PASS
10. ✅ Manual smoke 4 themes — Istoric drill walk-through Greutate + BF + Photos sections

---

## §4 Backup tag

```bash
git tag pre-task18-istoric-greutate-bf-photos-$(date +%Y-%m-%d-%H%M)
git push origin pre-task18-istoric-greutate-bf-photos-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(istoric-deep): Greutate+BF timeline + photo progress body cross-skin × 4

Per CURRENT_STATE §JUST_DECIDED 2026-05-10 Progres↔Istoric distincție LOCK V1:
- Greutate full timeline chart deep analysis
- BF tracking timeline + sursă indicator (auto US Navy / manual / Demographic)
- Photo progress body gallery existing prod preserved (6 features recovery scope)
- Layout vertical stack 3 sections uniform Theme Parity Invariant V1

Cluster #4 Istoric calendar · Task 18/N (closure Cluster #4) Phase 2 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT (UI mockup only).

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 deep analysis Istoric
- Task 08 BF auto US Navy cross-ref UI source
- Task 17 range selector drives filter
- 6 features recovery scope clarify (Photo progress preserved)
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 18 — Istoric Greutate+BF Timeline + Photo Cross-Skin × 4 (closure Cluster #4)

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings chart elements + photo prod patterns>
- **Modificări per-skin:**
  - Clasic: <atomic diff>
  - Living Body: <atomic diff>
  - Luxury: <atomic diff>
  - Brain Coach: <atomic diff>
- **Diff parity 4/4:** Verified identical logic 3 sections vertical stack
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 19 (Setări Brain Coach Settings dead links audit cross-skin × 4)
```
