# TASK 19 — Setări BC Dead Links Audit + Fix · Cross-Skin × 4

**Model:** Opus
**Velocity:** ~20-30 min CC autonomous (audit + atomic fixes 4 mockup files)
**Cluster:** #5 Setări BC dead · Atom 1/2
**Authority:** Daniel directive 2026-05-10 chat ACASĂ post-noapte: "Setări Brain Coach nemerendend fix" (dead links / butoane fără handler / opțiuni placeholder unwired)
**Type:** Bug audit + fix cross-skin × 4 atomic

---

## §0 Pre-flight grep MANDATORY

```bash
# Locate Setări tab + linkuri/butoane per skin
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin Setări ==="
  grep -niE "setări|setari|settings|opțiuni|cont.*setting|profile.*setting" 04-architecture/mockups/andura-$skin.html | head -25
done

# Identify potential dead links (onclick handlers + href="#" candidates)
for skin in clasic living-body luxury brain-coach; do
  echo "=== $skin dead candidates ==="
  grep -nE 'onclick="[^"]*"|href="#[^"]*"|data-action="[^"]*"' 04-architecture/mockups/andura-$skin.html | head -30
done

# Verify production existing Setări patterns (live wiring)
grep -rniE "renderSettings|settingsPage|onSettings" src/pages/ --include="*.js" 2>/dev/null | head -15
```

---

## §1 Scope

**AUDIT phase:** Identify dead links / butoane fără handler / opțiuni placeholder unwired în Setări tab cross-skin × 4 mockup files.

**FIX phase:** Per dead link identified, decide acțiune:
- **Wire la handler existing prod** (dacă feature live pe production)
- **Remove** (dacă feature DROP scope per Cluster #3 — Antrenament liber / Sport plan / saveStepsQuick)
- **Mark TODO drilldown** (dacă feature deferred V2 — flag explicit `data-defer="v2"` attribute)

**Acțiuni atomic cross-skin × 4 mockup files:**
1. **Audit per skin** Setări tab — listă completă linkuri/butoane (output count + dead vs live ratio)
2. **Cross-reference cu production** `src/pages/*.js` Setări patterns — verify wiring real
3. **Fix dead links** per decizie above (wire / remove / TODO mark)
4. **Verify Goal Shift wording destructive confirm pattern** preserved per CURRENT_STATE §JUST_DECIDED 2026-05-10 (Task 20 separat covers detail)
5. **Theme Parity Invariant V1** — fix cross-skin uniform (toate 4 skin-uri same dead links resolved same way)

**NU touch:**
- Goal Shift wording detail (Task 20 separat)
- Engine code production (`src/`) — UI mockup audit only
- Other tabs (Antrenor / Progres / Istoric / Cont) out-of-scope
- Live links (NU break working features)

**NEED_CONTEXT_DANIEL inline if found:** Dacă pre-flight identifică dead link ambiguous (e.g. "Notificări" buton nu mai sunt în prod dar nu confirm DROP), flag în raport cu listă explicită pentru Daniel decide.

---

## §2 Files modify

- `04-architecture/mockups/andura-clasic.html`
- `04-architecture/mockups/andura-living-body.html`
- `04-architecture/mockups/andura-luxury.html`
- `04-architecture/mockups/andura-brain-coach.html`

Atomic single commit cross-skin × 4 themes uniform.

---

## §3 Acceptance criteria

1. ✅ Audit complet Setări tab dead links cross-skin × 4 (listă explicită în raport)
2. ✅ Per dead link: wire / remove / TODO mark decision applied
3. ✅ Cross-reference production wiring verified
4. ✅ **Diff parity verify:** dead links resolved uniform 4/4 cross-skin
5. ✅ Tests 2731 PASS preserved EXACT
6. ✅ Build PASS
7. ✅ Manual smoke 4 themes — Setări tab tap-through toate butoane functional sau marked TODO
8. ✅ Raport explicit listă dead links + decizie per item per skin

**Fail-cluster mode:** Dacă 1 skin breaks layout, log + continue restul 3.

**NEED_CONTEXT_DANIEL flag:** Inline în raport pentru decizii ambigue.

---

## §4 Backup tag

```bash
git tag pre-task19-setari-bc-dead-audit-$(date +%Y-%m-%d-%H%M)
git push origin pre-task19-setari-bc-dead-audit-$(date +%Y-%m-%d-%H%M)
```

---

## §5 Commit message

```
fix(setari-dead-links): audit + fix BC Settings cross-skin × 4

Per Daniel directive 2026-05-10 chat ACASĂ post-noapte:
"Setări Brain Coach nemerendend fix" — dead links / butoane fără handler

Audit findings:
- <enumerate dead links per skin pre-fix>

Resolution per item:
- WIRED: <list links wired la handlers existing prod>
- REMOVED: <list links removed per Cluster #3 scope cuts>
- TODO: <list links marked data-defer="v2">

Cluster #5 Setări BC dead · Task 19/N Phase 2 orchestrator.
Theme Parity Invariant V1 — 4 mockup files atomic cross-skin uniform.
Tests 2731 PASS preserved EXACT (UI mockup audit + fix).

Cross-refs:
- CURRENT_STATE Daniel directive 2026-05-10 BC dead links
- Task 20 Goal Shift wording destructive confirm pattern follow-up
```

---

## §6 Raport format `📤_outbox/LATEST.md`

```
## TASK 19 — Setări BC Dead Links Audit + Fix Cross-Skin × 4

- **Model:** Opus
- **Status:** Complete | Issue: <details>
- **Pre-flight:** <findings count dead vs live per skin>

### Dead links audit per skin

| Skin | Dead links count | Live links count | Decisions |
|------|------------------|------------------|-----------|
| Clasic | <N> | <M> | <wired:X / removed:Y / TODO:Z> |
| Living Body | <N> | <M> | <wired / removed / TODO> |
| Luxury | <N> | <M> | <wired / removed / TODO> |
| Brain Coach | <N> | <M> | <wired / removed / TODO> |

### Resolution per item enumerated

- <Link 1>: <decision + rationale>
- <Link 2>: ...

### NEED_CONTEXT_DANIEL flag

- <Ambiguous item 1>: <description + Daniel decide options>
- <Ambiguous item 2>: ...

- **Diff parity 4/4:** Verified uniform resolution
- **Tests:** 2731 PASS preserved
- **Build:** PASS
- **Commit:** <SHA>
- **Pushed:** origin/main
- **Issues:** <none | per-skin failures fail-cluster mode>
- **Next action:** TASK 20 (Setări Goal Shift wording destructive confirm cross-skin × 4)
```
