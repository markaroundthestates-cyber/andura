# TASK 23 — Workflow Antrenament V1 LOCK Auto-Advance + Edit Manual · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~25-40 min CC autonomous (4 mockup files atomic + workflow wiring)
**Cluster:** #6 State bugs · Atom 3/3 (closure Cluster #6)
**Authority:** Daniel directive 2026-05-10 chat ACASĂ post-noapte: "Workflow antrenament V1 LOCK = exact ca prod" — auto-advance pauză + edit manual kg+reps post-set deja există → ensure mockup parity vs prod

---

## §0 Pre-flight grep MANDATORY

```bash
# Verify production existing workflow patterns
grep -rniE "auto.advance|advance.*pauz|pauseTimer|sessTimer.*tick|completeSet|setComplete" src/ --include="*.js" | head -25

# Verify edit manual kg+reps post-set production pattern
grep -rniE "edit.*kg.*post|edit.*reps.*post|sessionKgOverride|lastSetRPE|sessRepsInput|editSetEntry" src/ --include="*.js" | head -20

# Audit mockup files cross-skin pentru workflow representation
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin workflow auto-advance + edit manual ==="
  grep -niE "auto.advance|pauz[ăa].*next|odihn[ăa]|edit.*kg|edit.*reps|✏️|tap edit|set complete" 04-architecture/mockups/andura-$skin.html | head -15
done

# Verify Task 15 audit raport (workflow parity matrix prerequisite)
ls -la 📤_outbox/_archive/2026-05/ | grep -E "TASK_15|workflow_audit"
```

---

## §1 Scope

Ensure Workflow antrenament V1 LOCK V1 representation cross-skin × 4 mockup files atomic = "exact ca prod" per Daniel directive. Fix gaps identified Task 15 audit (dacă există).

**Production workflow V1 features (Daniel confirmed already exist `src/state.js` + `src/pages/coach/session.js`):**
- **Auto-advance pauză** post-set complete:
  - `completeSet()` triggered → `pauseTimer = setInterval(tickPause, 1000)` countdown 90 sec default
  - User vizibil: rest timer modal/section + countdown
  - Pauza done → next set ready transition automat (sau manual tap "Skip pauză")
- **Edit manual kg+reps post-set:**
  - Set logged → user tap entry log line → modal/inline edit `kg` + `reps`
  - Save updates `sessLog[idx]` + persistă DB
- **Set complete UI flow:**
  - Tap "Set terminat" + `kg` + `reps` actual → `completeSet()` invoked
  - `sessLog.push({kg, reps, ex, ts})` append
  - RPE prompt post-set (3-state ENERGY 🟢🟡🔴 LOCKED V1)
- **Session active state visual:**
  - `sessActive: true` highlight + timer running cu format `MM:SS`
  - Exercise navigation buttons (next / prev / skip)

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Per skin verify** workflow features representation vs prod baseline (Task 15 audit findings input)
2. **Fix gaps** identified Task 15 raport HARD/SOFT pentru workflow workflow features
3. **Auto-advance pauză** UI prezent + countdown timer animation cross-skin × 4
4. **Edit manual kg+reps** post-set inline edit / modal pattern cross-skin × 4
5. **3-state ENERGY** RPE prompt 🟢🟡🔴 (NU 5 stări production drift) cross-skin × 4 — per CURRENT_STATE §NOW LOCK V1
6. **Session active state visual** consistent cross-skin × 4

**NU touch:**
- Engine code `src/state.js` + `src/pages/coach/session.js` (existing prod preserved exact, UI mockup parity only)
- Pain Button mid-session (Task 07 already merged sub "Ceva nu merge")
- Pain Button idle (Task 11 already removed)
- Other tabs out-of-scope

**Theme Parity Invariant V1:** Logic 1:1 strict cross-skin (workflow features identical structure, palette/font diferă).

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Auto-advance pauză UI cross-skin × 4 (rest timer + countdown animation)
2. ✅ Edit manual kg+reps post-set cross-skin × 4 (inline edit / modal pattern)
3. ✅ 3-state ENERGY RPE prompt 🟢🟡🔴 cross-skin × 4 (NU 5 stări production drift)
4. ✅ Drill 🔴 only 4 cauze (stres / somn / durere / altul) per §36.82.1
5. ✅ Session active state visual consistent cross-skin × 4
6. ✅ Set complete flow tap → log → RPE prompt → auto-advance pauză functional
7. ✅ **Diff parity verify:** logic identical 4/4
8. ✅ Tests 2731 PASS preserved EXACT (UI mockup only)
9. ✅ Build PASS
10. ✅ Manual smoke 4 themes — full workout session flow walk-through

---

## §4 Backup tag

```bash
git tag pre-task23-workflow-v1-lock-$(date +%Y-%m-%d-%H%M)
git push origin pre-task23-workflow-v1-lock-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
feat(workflow-antrenament-v1): auto-advance + edit manual + 3-state RPE cross-skin × 4

Per Daniel directive 2026-05-10 chat ACASĂ post-noapte:
"Workflow antrenament V1 LOCK = exact ca prod"

Features represented uniform:
- Auto-advance pauză post-set (rest timer countdown 90sec default)
- Edit manual kg+reps post-set (inline edit / modal pattern)
- 3-state ENERGY RPE 🟢 Excelent / 🟡 Normal-Ok / 🔴 Obosit-Slab
- Drill 🔴 only 4 cauze (stres / somn / durere / altul)
- Session active state visual consistent

Cluster #6 State bugs · Task 23/N (closure Cluster #6) Phase 2 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT (UI mockup, prod engine preserved).

Cross-refs:
- src/state.js + src/pages/coach/session.js production workflow
- §36.82.1 + ADR 027 3-state energy LOCK V1 (NU 5 stări production drift)
- Task 15 Workflow audit raport prerequisite
- Task 22 Theme parity violations fix coordination
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 23 — Workflow Antrenament V1 LOCK Cross-Skin × 4 (closure Cluster #6)

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings prod workflow + Task 15 raport gaps>
- **Modificări per-skin:**
  - Clasic: <atomic diff workflow features>
  - Living Body: <atomic diff>
  - Luxury: <atomic diff>
  - Brain Coach: <atomic diff>
- **Diff parity 4/4:** Verified identical workflow logic
- **3-state ENERGY:** 🟢🟡🔴 verified cross-skin (NU 5 stări production drift fix)
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 24 (Glossary RIR jargon Gigel-replace cross-skin × 4 — Cluster #7 start)
```
