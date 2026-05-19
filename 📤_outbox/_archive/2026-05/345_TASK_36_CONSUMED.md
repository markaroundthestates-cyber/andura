# TASK 36 — Wake Lock Scope Clarify Recovery

**Model:** Opus
**Velocity:** ~10-15 min CC autonomous (scope verify)
**Cluster:** Standalone 6 features recovery · Atom 5/6
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 6 features recovery — `requestWakeLock()` existing `src/pages/coach/session.js`

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify Wake lock existing prod
grep -rniE "requestWakeLock|wakeLock|releaseWakeLock|screen.*lock" src/ --include="*.js" | head -20

# Mockup × 4 representation (likely silent backend, NU UI explicit)
for skin in clasic living-body luxury brain-coach; do
  grep -niE "wake.lock|screen.*on|ecran.*aprins" 04-architecture/mockups/andura-$skin.html | head -3
done
```

---

## §1 Scope

Verify Wake Lock feature existing prod (`requestWakeLock()` `src/pages/coach/session.js`). NU additive, scope clarify recovery.

**Existing prod feature (verify):**
- `requestWakeLock()` invoked startSession
- Browser Screen Wake Lock API → ecran rămâne aprins în timpul sesiunii
- Auto-release end session sau visibility change
- Browser compat fallback graceful (Safari / older)

**Acțiuni:**
1. Verify prod scope + browser compat fallback
2. Mockup × 4 — silent backend, NU UI representation expected (verify)
3. Spec V2 doc browser compat + permission flow

---

## §2 Files modify

ZERO src changes. ZERO mockup changes (silent backend feature).

---

## §3 Acceptance criteria

1. ✅ Prod Wake Lock verified existing
2. ✅ Browser compat fallback documented
3. ✅ Mockup × 4 silent backend confirmed (NU UI expected)
4. ✅ Tests 2731 PASS preserved EXACT
5. ✅ Build PASS

---

## §4 Backup tag

```bash
git tag pre-task36-wakelock-scope-$(date +%Y-%m-%d-%H%M)
git push origin pre-task36-wakelock-scope-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message (dacă applicable)

```
docs(features-recovery): Wake Lock scope clarify V2 spec

Per CURRENT_STATE §JUST_DECIDED 2026-05-10 6 features recovery preserved.

Wake Lock verified existing prod (requestWakeLock src/pages/coach/session.js).
Browser Screen Wake Lock API + fallback graceful documented V2 spec.

Standalone Task 36/N Phase 2 orchestrator (atom 5/6 features recovery).
Tests 2731 PASS preserved EXACT.
```

---

## §6 Raport `📤_outbox/LATEST.md`

```
## TASK 36 — Wake Lock Scope Clarify

- **Model:** Opus
- **Status:** Complete (scope verify)
- **Pre-flight:** <prod verified + browser compat>
- **Mockup × 4:** Silent backend confirmed
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Next action:** TASK 37 (Schimbă fază manual override scope clarify — closure 6 features)
```
