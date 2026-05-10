# TASK 35 — Inactivity Auto-Pause Scope Clarify Recovery

**Model:** Opus
**Velocity:** ~10-15 min CC autonomous (scope verify)
**Cluster:** Standalone 6 features recovery · Atom 4/6
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 6 features recovery — `setupInactivity()` existing `src/pages/coach/session.js`

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify Inactivity auto-pause existing prod
grep -rniE "setupInactivity|inactivity.*pause|inactivityTimer|auto.pause" src/ --include="*.js" | head -20

# Verify cross-ref ADR Cascade Defense / Energy Adjustment
grep -niE "inactivity|timeout|auto.pause" 03-decisions/ADR_CASCADE_DEFENSE_v1.md 2>/dev/null | head -10

# Mockup × 4 representation
for skin in clasic living-body luxury brain-coach; do
  grep -niE "inactiv|auto.pause|inactivitate" 04-architecture/mockups/andura-$skin.html | head -3
done
```

---

## §1 Scope

Verify Inactivity auto-pause feature existing prod (`setupInactivity()` `src/pages/coach/session.js`). NU additive, scope clarify recovery.

**Existing prod feature (verify):**
- `setupInactivity()` invoked startSession + restore session
- Timer detect inactivity (no taps / no input) → auto-pause sesiune
- Threshold ~Xmin (verify exact value pre-flight)
- User resume tap → reactivate session timer

**Acțiuni:**
1. Verify prod scope + threshold value
2. Mockup × 4 representation pause UI flag (sau Theme Parity gap)
3. Spec V2 doc threshold + UX flow

---

## §2 Files modify

ZERO src changes. Possibly mockup × 4 dacă missing pause UI.

---

## §3 Acceptance criteria

1. ✅ Prod inactivity verified existing + threshold documented
2. ✅ Mockup × 4 pause UI status flagged
3. ✅ Tests 2731 PASS preserved EXACT
4. ✅ Build PASS

---

## §4 Backup tag

```bash
git tag pre-task35-inactivity-scope-$(date +%Y-%m-%d-%H%M)
git push origin pre-task35-inactivity-scope-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message (dacă applicable)

```
docs(features-recovery): Inactivity auto-pause scope clarify V2 spec

Per CURRENT_STATE §JUST_DECIDED 2026-05-10 6 features recovery preserved.

Inactivity auto-pause verified existing prod (setupInactivity src/pages/coach/session.js).
Threshold + UX flow documented vault V2 spec.

Standalone Task 35/N Phase 2 orchestrator (atom 4/6 features recovery).
Tests 2731 PASS preserved EXACT.
```

---

## §6 Raport `📤_outbox/LATEST.md`

```
## TASK 35 — Inactivity Auto-Pause Scope Clarify

- **Model:** Opus
- **Status:** Complete (scope verify)
- **Pre-flight:** <prod verified + threshold value>
- **Mockup × 4:** <PARITY / GAP>
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Next action:** TASK 36 (Wake lock scope clarify recovery)
```
