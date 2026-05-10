# TASK 32 — showWhyForExercise Scope Clarify Recovery

**Model:** Opus
**Velocity:** ~10-15 min CC autonomous (scope verify recovery, NU additive arch)
**Cluster:** Standalone 6 features recovery · Atom 1/6
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ post-noapte 6 features ratate recovery — *"toate 6 PĂSTRĂM"* (existing prod transferat spec ideal V2)
**Type:** Verify wiring + spec doc ideal V2 (NU additive cumulative)

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify showWhyForExercise existing prod
grep -rniE "showWhyForExercise|De ce facem|de ce.*acest exerciti|why.*exercise" src/ --include="*.js" | head -20

# Verify ADR_MODE_DETECTION_UI EXT-2 Explainability (cross-ref existing spec)
grep -niE "Explainability|De ce|EXT-2|lazy.*generation" 03-decisions/ADR_MODE_DETECTION_UI_v1.md | head -15

# Verify mockup current representation cross-skin
for skin in clasic living-body luxury brain-coach; do
  grep -niE "De ce|why.*exercise|showWhy" 04-architecture/mockups/andura-$skin.html | head -5
done
```

---

## §1 Scope

Verify `showWhyForExercise` feature ("De ce facem ăsta?") existing prod + document spec ideal V2 vault. NU additive code change, scope clarify recovery.

**Existing prod feature (per ADR_MODE_DETECTION_UI EXT-2 Explainability + production code):**
- Card exercițiu cu buton secundar `[De ce?]`
- User tap → engine generează diagnostic on-demand (lazy)
- Engine output 4 elemente: rationale / signal / personalization / progress

**Acțiuni:**
1. Verify `showWhyForExercise` function + UI buton wired prod
2. Verify mockup-uri cross-skin × 4 representation present (sau flag missing → Task 22 Theme Parity follow-up)
3. Spec doc ideal V2 update vault (dacă needed) — confirm scope V1 LOCK
4. NU code modification (scope clarify recovery only)

---

## §2 Files modify

ZERO src changes (verify only). Possibly:
- Mockup files cross-skin × 4 dacă missing (Theme Parity gap fix)
- Vault spec doc dacă scope V2 needs documentation (e.g. ADR EXT-2 status update)

---

## §3 Acceptance criteria

1. ✅ Pre-flight grep showWhyForExercise prod verified existing
2. ✅ Mockup × 4 representation present sau Theme Parity gap flagged
3. ✅ Spec V2 doc updated vault dacă needed
4. ✅ Tests 2731 PASS preserved EXACT
5. ✅ Build PASS

---

## §4 Backup tag

```bash
git tag pre-task32-showwhy-scope-clarify-$(date +%Y-%m-%d-%H%M)
git push origin pre-task32-showwhy-scope-clarify-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message (dacă applicable)

```
docs(features-recovery): showWhyForExercise scope clarify V2 spec

Per CURRENT_STATE §JUST_DECIDED 2026-05-10 6 features recovery:
"toate 6 PĂSTRĂM" — existing prod scope clarify NU additive arch

showWhyForExercise verified existing prod + spec V2 doc updated.
Cross-ref ADR_MODE_DETECTION_UI EXT-2 Explainability lazy generation.

Standalone Task 32/N Phase 2 orchestrator (6 features recovery atom 1/6).
Tests 2731 PASS preserved EXACT.
```

---

## §6 Raport `📤_outbox/LATEST.md`

```
## TASK 32 — showWhyForExercise Scope Clarify Recovery

- **Model:** Opus
- **Status:** Complete (scope verify recovery)
- **Pre-flight:** <prod existing verified + mockup × 4 representation>
- **Mockup × 4 status:** <PARITY / GAP flagged Task 22>
- **Spec V2 doc:** <updated / NU needed>
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA dacă applicable | NU commit dacă pure verify>
- **Next action:** TASK 33 (PR Wall scope clarify recovery)
```
