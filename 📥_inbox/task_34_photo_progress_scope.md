# TASK 34 — Photo Progress Body Scope Clarify Recovery

**Model:** Opus
**Velocity:** ~10-15 min CC autonomous (scope verify)
**Cluster:** Standalone 6 features recovery · Atom 3/6
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 6 features recovery — Photo progress body existing prod (cross-ref Task 18 Istoric integration)

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify Photo progress existing prod
grep -rniE "photoProgress|photo.*progress|uploadPhoto|photoEntry|photoTimeline|photo.*body" src/ --include="*.js" | head -20

# Verify mockup × 4 photo gallery representation
for skin in clasic living-body luxury brain-coach; do
  grep -niE "photo|fotografi|gallery|adaugă foto" 04-architecture/mockups/andura-$skin.html | head -5
done
```

---

## §1 Scope

Verify Photo progress body feature existing prod + mockup × 4 (cross-ref Task 18 Istoric integration). NU additive, scope clarify recovery.

**Existing prod feature (verify):**
- Photo upload + gallery storage IndexedDB / localStorage
- Timeline cronologic per range selected (Task 17 cross-ref)
- Tap thumbnail → fullscreen viewer
- Buton "Adaugă foto" empty state

**Acțiuni:**
1. Verify prod feature scope existing
2. Mockup × 4 representation Task 18 cross-ref (gallery section integrated Istoric)
3. Spec V2 doc privacy considerations (local-first preserved)

---

## §2 Files modify

ZERO src changes. Mockup × 4 already addressed Task 18.

---

## §3 Acceptance criteria

1. ✅ Prod Photo progress verified
2. ✅ Mockup × 4 cross-ref Task 18 Istoric integration
3. ✅ Privacy spec V2 (local-first preserved)
4. ✅ Tests 2731 PASS preserved EXACT
5. ✅ Build PASS

---

## §4 Backup tag

```bash
git tag pre-task34-photo-progress-scope-$(date +%Y-%m-%d-%H%M)
git push origin pre-task34-photo-progress-scope-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message (dacă applicable)

```
docs(features-recovery): Photo progress body scope clarify V2 spec

Per CURRENT_STATE §JUST_DECIDED 2026-05-10 6 features recovery preserved.

Photo progress verified existing prod + Task 18 Istoric integration cross-ref.
Privacy spec V2 local-first preserved (NU cloud sync V1).

Standalone Task 34/N Phase 2 orchestrator (atom 3/6 features recovery).
Tests 2731 PASS preserved EXACT.
```

---

## §6 Raport `📤_outbox/LATEST.md`

```
## TASK 34 — Photo Progress Body Scope Clarify Recovery

- **Model:** Opus
- **Status:** Complete (scope verify)
- **Pre-flight:** <prod verified + Task 18 cross-ref>
- **Mockup × 4 status:** Task 18 Istoric integration applied
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Next action:** TASK 35 (Inactivity auto-pause scope clarify recovery)
```
