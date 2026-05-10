# TASK 11 — Pain Button Idle Scos (Mid-Session Only Context) · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~15-25 min CC autonomous (4 mockup files atomic context cleanup)
**Cluster:** #3 Workflow + scope cuts · Atom 2/6
**Authority:** Daniel directive 2026-05-10 chat ACASĂ post-noapte: *"Pain Button în Antrenor idle = ce rost are?"* — scope clarify Pain Button mid-session only, NU idle context

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate Pain Button instances per skin context (idle vs mid-session)
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin ==="
  grep -niE "pain.button|durere|Mă doare|pain-modal|painButton" 04-architecture/mockups/andura-$skin.html | head -20
done

# Verify Antrenor idle vs active session structure cross-skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin idle/active ==="
  grep -niE "antrenor.*idle|active.*session|sesiune.*activ|session-active" 04-architecture/mockups/andura-$skin.html | head -10
done
```

---

## §1 Scope

Scoate Pain Button din Antrenor **idle** context (homepage / pre-session / post-session screens) cross-skin × 4 mockup files atomic. Păstrează Pain Button **mid-session only** (Antrenor active session context, sub buton "Ceva nu merge" merge per Task 07).

**Rationale Daniel:** *"ce rost are?"* — Pain Button în idle context = friction fără utilitate (user nu raportează durere când NU se antrenează). Mid-session = Pain Button relevant.

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Identify** Pain Button instances în Antrenor idle context (homepage / pre-session / post-session)
2. **Remove** instances idle context per skin
3. **Preserve** Pain Button mid-session active session context (consolidat sub "Ceva nu merge" Task 07)
4. **NU touch** Engine `src/` Pain modal logic (preserved exact, UI wiring only)

**Theme Parity Invariant V1:** Logic 1:1 strict cross-skin (Pain Button idle context = ZERO toate 4 skin-uri uniform).

**Coordination cu Task 07:** Task 07 already merged Pain mid-session sub "Ceva nu merge" buton. Acest task = cleanup idle context contextual SEPARATE de mid-session merge.

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Pain Button instances Antrenor **idle** context REMOVED cross-skin × 4
2. ✅ Pain Button **mid-session active** preserved (sub "Ceva nu merge" Task 07 deja consolidat)
3. ✅ Engine `src/` Pain modal logic preserved unchanged
4. ✅ **Diff parity verify:** logic identical 4/4 (idle context = ZERO Pain Button cross-skin)
5. ✅ Tests 2731 PASS preserved EXACT
6. ✅ Build PASS
7. ✅ Manual smoke 4 themes — Antrenor idle screen NO Pain Button + Antrenor active session "Ceva nu merge" drill includes Pain functional
8. ✅ Grep post-removal: idle context Pain Button matches = ZERO 4 skin-uri

---

## §4 Backup tag

```bash
git tag pre-task11-pain-idle-remove-$(date +%Y-%m-%d-%H%M)
git push origin pre-task11-pain-idle-remove-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
chore(antrenor-idle): remove Pain Button idle context cross-skin × 4

Per Daniel directive 2026-05-10 chat ACASĂ post-noapte:
"Pain Button în Antrenor idle = ce rost are?"

Removed:
- Pain Button instances Antrenor idle context (homepage / pre-session / post-session)
- 4 mockup files atomic cross-skin uniform

Preserved:
- Pain Button mid-session active context (consolidat sub "Ceva nu merge" Task 07)
- Engine src/ Pain modal logic untouched

Cluster #3 Workflow + scope cuts · Task 11/16 Phase 1 orchestrator.
Theme Parity Invariant V1 — idle context Pain Button = ZERO 4 skin-uri uniform.
Tests 2731 PASS preserved EXACT.

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 scope cut Pain Button idle
- Task 07 "Ceva nu merge" merge mid-session preserved
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 11 — Pain Button Idle Scos Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings Pain Button locations idle vs active per skin>
- **Modificări per-skin:**
  - Clasic: <atomic diff idle context>
  - Living Body: <atomic diff>
  - Luxury: <atomic diff>
  - Brain Coach: <atomic diff>
- **Diff parity 4/4:** Verified idle context Pain Button = ZERO uniform
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 12 (Sport plan supervision DROP complet cross-skin × 4)
```
