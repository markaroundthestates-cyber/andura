# TASK 08 — BF Auto US Navy + Override Manual UI · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~25-35 min CC autonomous (4 mockup files atomic + Profile section UI)
**Cluster:** #2 Onboarding inputs UI · Atom 3/4
**Authority:** CURRENT_STATE §JUST_DECIDED 2026-05-10 chat ACASĂ post-noapte LOCK V1 (+1 net additive) — BF auto US Navy waist+neck+înălțime+sex method + override manual mereu disponibil

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify state curent BF input cross-skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin ==="
  grep -niE "BF|body fat|grăsime|waist|talie|neck|gât|US Navy" 04-architecture/mockups/andura-$skin.html | head -15
done

# Verify spec authoritative LOCK V1
grep -niE "BF auto|US Navy|waist+neck|Demographic Prior fallback" 00-index/CURRENT_STATE.md | head -10

# Verify Demographic Prior fallback ADR 017
grep -niE "Demographic Prior|K-NN|K=10|fallback BF" 03-decisions/017-demographic-prior-knn.md 2>/dev/null | head -10
```

---

## §1 Scope

Add BF auto US Navy method + override manual UI cross-skin × 4 mockup files atomic în Profile section post-onboarding (Setări / Cont / Profil context).

**LOCK V1 spec:**
- **Method:** US Navy formula = waist + neck + înălțime + sex (deja Big 6 hard T0 din Tasks 01-04)
- **Fallback:** Demographic Prior K-NN K=10 dacă lipsește waist (per ADR 017)
- **Override manual:** mereu disponibil — user input direct BF % manual

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Add Profile section UI** (post-onboarding Setări sau Cont) cu:
   - Talie (waist) input cm — required pentru US Navy auto
   - Gât (neck) input cm — required pentru US Navy auto
   - Calculated BF auto display (read-only, derive from waist+neck+înălțime+sex)
   - **Toggle "Editez manual"** → unlock manual BF % input (override)
   - Help text scurt: *"Calculat automat (US Navy) sau editat manual"*
2. **Visual indicator** sursă BF current (auto / manual / Demographic fallback)
3. **NU touch** Big 6 hard T0 onboarding flow (Tasks 01-04 separat) — Profile section = post-onboarding only

**Theme Parity Invariant V1:** Logic 1:1 strict (label text identic, palette/font diferă).

**NU touch:**
- Engine code (`src/`) — UI wiring only V1, engine BF compute follow-up later post-mockup
- Big 6 onboarding flow (Tasks 01-04)
- Other Profile fields out-of-scope

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Profile section UI added post-onboarding context cross-skin × 4
2. ✅ Talie + Gât inputs cm prezenți cu range valid (talie 50-200, gât 25-60)
3. ✅ BF auto display calculated read-only (NU input)
4. ✅ Toggle "Editez manual" unlock manual BF % input
5. ✅ Visual indicator sursă BF (auto / manual / fallback)
6. ✅ Help text *"Calculat automat (US Navy) sau editat manual"* prezent
7. ✅ **Diff parity verify:** logic identical 4/4
8. ✅ Tests 2731 PASS preserved EXACT
9. ✅ Build PASS
10. ✅ Manual smoke 4 themes — Profile flow walk-through, toggle override functional

---

## §4 Backup tag

```bash
git tag pre-task08-bf-auto-usnavy-$(date +%Y-%m-%d-%H%M)
git push origin pre-task08-bf-auto-usnavy-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(profile-bf): BF auto US Navy + override manual UI cross-skin × 4

Per CURRENT_STATE §JUST_DECIDED 2026-05-10 LOCK V1 (+1 net additive):
- Method US Navy: waist+neck+înălțime+sex auto-calculate BF %
- Inputs Talie + Gât cm (range valid 50-200 / 25-60)
- Toggle "Editez manual" override unlock manual BF % input
- Fallback Demographic Prior K-NN K=10 dacă lipsește waist (ADR 017)

Cluster #2 Onboarding inputs · Task 08/16 Phase 1 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT (UI mockup only, engine BF compute follow-up).

Cross-refs:
- CURRENT_STATE §JUST_DECIDED 2026-05-10 LOCK V1 BF auto
- ADR 017 Demographic Prior K-NN fallback
- Big 6 hard T0 Tasks 01-04 (Înălțime + Sex prerequisites)
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 08 — BF Auto US Navy + Override Manual Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings BF state per skin + Demographic fallback verified>
- **Modificări:**
  - Clasic: <atomic diff Profile section>
  - Living Body: <atomic diff>
  - Luxury: <atomic diff>
  - Brain Coach: <atomic diff>
- **Diff parity 4/4:** Verified identical logic
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 09 (Loghează kcal+proteine auto-fill rule + UI cross-skin × 4)
```
