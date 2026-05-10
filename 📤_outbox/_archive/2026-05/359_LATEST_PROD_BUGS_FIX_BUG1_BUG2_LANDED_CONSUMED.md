# P1 Prod Bugs Atomic Fix — Auto Template Phase + BF Edit Recalc Kcal — 2026-05-10

**Task:** FIX 2 prod bugs atomic single batch — both touch src/engine/sys.js. Pre-flight + implement + tests + commit + push.
**Model:** claude-opus-4-7
**Status:** Complete ✅
**Branch:** main

## Pre-flight ✅
- Working tree clean pre-execution verified
- Backup tag `pre-prod-bugs-fix-2026-05-10-1802` pushed origin (rollback safety per VAULT_RULES §CC.7 Layer 5)
- Read sys.js full + sys.test.js full + dependent callsites (weight.js, dashboard.js)
- Constants verified verbatim: `KCAL_TARGET=2000`, `TARGET_DATE=new Date('2026-07-20')`
- Baseline captured: 2731 tests passing pre-fix

## Modificări (atomic batch — 4 files)

| File | LOC delta | Change |
|------|-----------|--------|
| `src/engine/sys.js` | +12 / -10 | Bug 1 + Bug 2 core fix |
| `src/engine/__tests__/sys.test.js` | +45 / -8 | T4 split + T8 update + 2 regression tests |
| `src/pages/weight.js` | +3 / -11 | initKcal pilotActive gate dropped + UX text aligned |
| `src/pages/dashboard.js` | +6 / -8 | renderDash kpib + getAlerts MAINTENANCE warning + UX banner aligned |

## Bug 1 fix — getKcalTarget AUTO + getPhase pre-pilot gate dropped

**Verbatim diff key lines (`src/engine/sys.js`):**

`getPhase()` lines 76-86 (was 76-93):
```js
// REMOVED: pilotActive computation + early return 'CUT' pre-TARGET_DATE
// Now: BF + season decide phase always
const summerEnd = new Date(now.getFullYear(), 7, 31);
const isSummer = now <= summerEnd;
const isWinter = now.getMonth() >= 9 || now.getMonth() <= 1;
if (bf > 18) return 'CUT';
// ...continues with existing BF-tiered logic
```

`getKcalTarget()` lines 124-132 (was 125-136):
```js
// REMOVED: const pilotActive = new Date() >= TARGET_DATE;
// REMOVED: if (!pilotActive) return KCAL_TARGET;
// AUTO: derive faza din BF + sezon, apoi aplică multiplicator pe TDEE
const phase = this.getPhase();
switch(phase) {
  case 'CUT':         return Math.round(tdee * 0.82);
  case 'BULK':        return Math.round(tdee * 1.08);
  case 'MAINTENANCE': return tdee;
  case 'STRENGTH':    return Math.round(tdee * 1.05);
  default:            return KCAL_TARGET;
}
```

## Bug 2 fix — Katch-McArdle BMR (lean-mass-based) when BF finite

**Verbatim diff key lines (`src/engine/sys.js` lines 54-66):**

```js
if (dates.length < 4) {
  // Katch-McArdle BF-aware preferred when LBM known; Mifflin fallback when BF unknown
  const kg = this.getCurrentKg();
  const bf = this.getBF();
  let bmr;
  if (Number.isFinite(bf)) {
    const lbm = this.getLBM();
    bmr = 370 + 21.6 * lbm;
  } else {
    bmr = 10*kg + 6.25*this.HEIGHT - 5*this.AGE + 5;
  }
  return Math.round(bmr * 1.55);
}
```

**Math impact verification:** at 100kg same weight, BF 30% (lbm=70) vs BF 5% (lbm=95):
- BF 30%: bmr = 370 + 21.6×70 = 1882 → tdee ≈ 2917 kcal
- BF 5%:  bmr = 370 + 21.6×95 = 2422 → tdee ≈ 3754 kcal
- Delta: **~837 kcal** (was 0 kcal pre-fix — Mifflin BF-agnostic on same kg)

## Propagation (consistent gate removal)

- **`src/pages/weight.js:74-89` (initKcal):** dropped `pilotActive ? SYS.getKcalTarget() : KCAL_TARGET` ternary → `SYS.getKcalTarget()`. noteEl text always shows pilot active TDEE/phase (was: pre-pilot "Target fix: 2000 kcal" stale copy). `TARGET_DATE` import removed (no longer referenced).
- **`src/pages/dashboard.js:13` (module-level):** removed unused `TD2 = TARGET_DATE` alias.
- **`src/pages/dashboard.js:93` (renderDash):** removed unused `pilotActive` declaration.
- **`src/pages/dashboard.js:191-195` (kpib KPI box):** unconditional "TDEE Real / X / kcal mentenanță" display (was: pre-pilot "Zile rămase / 26 / până 20 iulie", post-pilot "TDEE Real").
- **`src/pages/dashboard.js:207-208` (decision banner):** dropped `_autoFixed=!pilotActive` gate; now AUTO phase note "Faza auto: X · Schimbă manual" shows whenever no override (was: only pre-pilot).
- **`src/pages/dashboard.js:533-534` (getAlerts MAINTENANCE warning):** dropped `pilotActive&&` gate so BF >15% mentenanță warning fires now (was: dormant pre-pilot).
- **Kept (pure UX countdown copy):** `dashboard.js:528-531` "CHECKPOINT ÎN X ZILE" alert + `dashboard.js:532-533` "PILOT AUTOMAT ACTIV" milestone — informational only, no computation gate.

## Build + Tests ✅

- `npm run test:run`: **2734 PASS / 0 FAIL** (baseline 2731 → +3 new = 2734 exact)
- Pre-commit hook vitest gate ran (visible in commit output)
- ZERO regression on existing tests

**New tests (`src/engine/__tests__/sys.test.js`):**

| Test | Assertion |
|------|-----------|
| `T4a: Katch-McArdle BF-aware` | weights={1 entry 100kg} + bf-override=20% → tdee≈3252 (lbm=80, bmr=2098×1.55) |
| `T4b: Mifflin fallback when getBF NaN` | bf-override='invalid' → parseFloat→NaN → !isFinite → Mifflin path tdee≈3098 |
| `T_AUTO_pre_pilot` (Bug 1 regression) | 2026-06-01 (before TARGET_DATE) + auto BF 17.1 + summer → kcal === estimateTDEE() (MAINT mult 1.0), NOT hardcoded 2000 |
| `T_BF_edit_recalc` (Bug 2 regression) | same 100kg, bf-override 30% vs 5%, MAINTENANCE pinned → kcal delta >300 (~837 actual) |

**Tests modified:**
- `T4` → split into `T4a` (Katch) + `T4b` (Mifflin)
- `T8` → asserts MAINTENANCE auto-derive (BF 17 + summer) instead of pre-pilot CUT short-circuit (Bug 1 reflected)

## Commits

- `05ba372` (effective net commit) — files: sys.js + sys.test.js + weight.js + dashboard.js (4 files, +66/-39 LOC)

**Atomic commit caveat:** Auto-watcher race intercepted my staged batch and pushed `chore(auto): src/engine/__tests__/sys.test.js src/engine/sys.js src/pages/dashboard.js src/pages/weight.js` BEFORE my crafted `fix(prod): ...` commit message could land. The 4 file changes are preserved verbatim in `05ba372`. Net result: correct content delivered, but commit message format = generic auto-watcher format instead of structured fix message with `Resolves: P1-FLAG-PROD-...` tags. This is the existing `Auto-commit watcher race P3` flag manifesting AGAIN (third instance documented — chat 2026-05-07 vault hygiene + chat 2026-05-10 vault cleanup + this chat). Body of intended fix message preserved in this raport for traceability.

## Pushed ✅

- origin/main ✅ (`05ba372` synced via auto-hook)
- backup tag `pre-prod-bugs-fix-2026-05-10-1802` pushed pre-fix

## Issues

- ⚠️ **Auto-commit watcher race P3 flag** recurred — generic `chore(auto):` commit message instead of `fix(prod):` structured message with Resolves tags. Content correct, message format suboptimal. Recommend Daniel review/escalate auto-watcher hook config to defer when CC has `git commit -m "fix(...)` in flight (or whitelist by stage timing).

## Next action

- ✅ Bug 1 + Bug 2 prod bugs RESOLVED. AUTO template now produces TDEE-based kcal phase NOW (no longer waits TARGET_DATE 2026-07-20). BF edit on same weight produces real kcal delta via Katch-McArdle.
- 🔍 **User validation recommended:** open weight tab + verify kcal display reflects phase + estimateTDEE; toggle bf-override 25% → 18% on same weight, verify kcal target shifts visibly.
- 📋 **Defer scope (per audit, NOT this batch):**
  - Energy-balance-path BF-awareness (estimateTDEE 4+ entries branch — needs delta-LBM model + state tracking, layer b complex)
  - goalAdaptation→UI migration (Faza 2.5 scope — engine impl gap "vizor fără ușă" 0/8 engines în src/)
- 🏷️ **Suggested flag close:** P1-FLAG-PROD-AUTO-FAZA-2026-05-10 + P1-FLAG-PROD-BF-EDIT-KCAL-2026-05-10 (subject to user validation success)
- 🧊 Cumulative LOCKED V1 ~659 PRESERVED (this fix corriges existing intent — NOT product/architecture additive).
