# Phase 3.6 Cluster #1 — Audit Findings Per Bug

**Branch:** `feature/phase-3-orchestrator-final`
**Mode:** Audit-then-fix per spec §1
**Pre-flight HALT triggered:** Phase 3+3.5 ZERO src/ diff vs main → bugs NU regressions, sunt LATENT or non-bugs

---

## Bug 6 — Goal Forța→Mentenanță NU update Progres reactive

**Audit findings:**

1. UI buttons în `index.html:640-644` (Plan tab `#page-plan`):
   - FORȚĂ → `onclick="setPhaseOverride('STRENGTH')"`
   - MENTENANȚĂ → `onclick="setPhaseOverride('MAINTENANCE')"`
   - CUT, BULK, AUTO similar

2. `setPhaseOverride(phase)` plan.js:147-165:
   ```js
   DB.set('phase-change-date', tod());
   DB.set('phase-override', phase);
   // ... phase-log + kcalTarget calc
   toast(`✓ Fază setată: ${phase} · ${kcalTarget} kcal`);
   renderPlan();      // ← updates #phase-name, #kcal-display, #tdee-display, #bf-display
   renderDash();      // ← dashboard refresh
   renderUnifiedHistory();
   ```

3. `SYS.getPhase()` sys.js:69-72:
   ```js
   const override = DB.get('phase-override');
   if (override) return override;  // ← reads override first, wins
   ```

4. `SYS.getKcalTarget()` sys.js:111-137:
   ```js
   const phaseOverride = DB.get('phase-override');
   if (phaseOverride && phaseOverride !== 'AUTO') {
     switch(phaseOverride) {
       case 'CUT':         return Math.round(tdee * 0.82);
       case 'BULK':        return Math.round(tdee * 1.08);
       case 'MAINTENANCE': return tdee;          // ← Mentenanță = TDEE pure ✓
       case 'STRENGTH':    return Math.round(tdee * 1.05);
     }
   }
   ```

5. `renderPlan()` plan.js:11-101 reads SYS.getPhase() + getKcalTarget() + getTDEE + getBF + getLBM → updates all DOM elements în Plan tab.

6. Tab switch `goTo('plan')` în `src/ui/nav.js:8-40` calls `renderPlan()` on tab activation (refresh on switch).

**Root cause assessment:** Observer pattern WIRED CORRECTLY în src/ on main branch. Engine integration setPhaseOverride → DB.set → renderPlan + renderDash → DOM update is functional.

**If Daniel observes "NU update Progres reactive" on prod, possible causes (NU regressions from Phase 3+3.5):**
- Browser cache stale (CDN serving old bundled JS)
- Service Worker cache override (PWA pre-cached old version)
- DB.set silently fails (localStorage quota exceeded or sync conflict)
- User clicks button but doesn't see display change (scroll offscreen, CSS opacity 0, theme color identical)

**Surgical fix proposed:** NONE în src/ (observer pattern already correct). Recommendation: investigate browser cache / SW / DB layer.

---

## Bug 7 — Greutate manual + BF NU propagate engine consume (TDEE recalc + macros refresh)

**Audit findings:**

1. UI: `index.html:323` `#page-weight` page contains weight inputs.
2. `saveW()` weight.js:51-58:
   ```js
   const ws = DB.get('weights') || {};
   ws[getLogDate()] = curW;
   DB.set('weights', ws);
   toast(`✓ Greutate salvată`);
   if (state.logDateOffset === 0) lockWeight(curW);
   renderWeight();
   if (window.renderDash) window.renderDash();   // ← propagates to dashboard
   ```

3. Engine consume — `SYS.getCurrentKg()` sys.js:12-17:
   ```js
   const ws = DB.get('weights') || {};
   const dates = Object.keys(ws).sort();
   if (!dates.length) return this.START_KG;
   return ws[dates[dates.length-1]];   // ← reads latest weight ✓
   ```

4. `SYS.estimateTDEE()` sys.js:39-67 reads weights + computes TDEE Mifflin-St Jeor (BMR × 1.55) + applies real cut signal if 14+ days data.

5. `SYS.getKcalTarget()` calls estimateTDEE() + applies phase multiplier.

6. Tab switch to Plan → `renderPlan()` reads SYS fresh values → updates #tdee-display + #kcal-display + #lbm-display.

**Root cause assessment:** Observer pattern WIRED CORRECTLY. saveW → DB.set('weights') → engine reads fresh on next render call.

**Gap identified:** `saveW` calls `renderWeight()` + `renderDash()` BUT **NOT `renderPlan()`** explicitly. If user is on Plan tab when saveW called, Plan won't auto-refresh (Plan only refreshes on tab activation via goTo).

**Surgical fix candidate (LATENT, NU regression):**
```js
// src/pages/weight.js:51-58 saveW() — add renderPlan import + call
import { renderPlan } from './plan.js';
// ...
export function saveW(){
  // ... existing ...
  renderWeight();
  if (window.renderDash) window.renderDash();
  if (window.renderPlan) window.renderPlan();   // NEW: propagate to Plan tab
}
```

**However per spec §0 HALT:** NU implement fix orb because hypothesis Phase 3+3.5 regression is FALSIFIED. This gap exists on main too — NU fix without explicit Daniel approval (avoids slip Co-CTO #2 confirmation theater).

---

## Bug 11 — BF manual checkmark only NU funcțional

**Audit findings:**

1. UI: `index.html:614-622` "Corectare manuală BF" section în Plan tab:
   ```html
   <input type="number" id="bf-override-input" placeholder="ex: 22" step="0.5"/>
   <button onclick="setBFOverride()">SET</button>
   <button onclick="clearBFOverride()">RESET</button>
   ```

2. `setBFOverride()` weight.js:561-568:
   ```js
   const v = parseFloat(document.getElementById('bf-override-input')?.value);
   if (!isNaN(v) && v > 3 && v < 50) {
     DB.set('bf-override', v);
     window.dispatchEvent(new StorageEvent('storage', { key: 'bf-override', newValue: String(v) }));
     toast('✓ BF% setat: ' + v + '%', 'var(--green)');
   }
   ```

3. Storage listener `plan.js:168-172`:
   ```js
   window.addEventListener('storage', (e) => {
     if (e.key === 'bf-override') {
       renderPlan();   // ← re-renders Plan tab
     }
   });
   ```

4. `SYS.getBF()` sys.js:19-31:
   ```js
   const override = DB.get('bf-override');
   if (override !== null && override !== undefined) return parseFloat(override);
   // ... else calculate from weight loss heuristic
   ```

5. Engine consume: `SYS.getLBM()` reads getBF() + computes lean mass; `renderPlan()` reads getBF + getLBM + getTDEE + updates DOM.

**Root cause assessment:** Observer pattern WIRED CORRECTLY. setBFOverride → DB.set + dispatchEvent → listener → renderPlan().

**Critical caveat — `dispatchEvent(new StorageEvent('storage'))`:**

Standard `storage` events fire **only on OTHER tabs/windows** when localStorage changes (cross-tab sync mechanism). Manually dispatching `new StorageEvent('storage', {...})` în same tab triggers the listener, but this is a non-standard pattern (works în modern browsers, may have race conditions).

The fact that DB.set + manual dispatch + listener is wired suggests Phase 1+2 implementation. NU regression from Phase 3+3.5.

**About "checkmark only" Daniel feedback:** SET button shows toast "✓ BF% setat: X%" (visual checkmark). User might interpret toast checkmark as ONLY thing happening. Engine DOES consume but display update happens after dispatchEvent → listener → renderPlan → Plan DOM update.

**Possible issue:** If user is on a DIFFERENT tab when clicking SET (e.g. Settings page), renderPlan() updates DOM în hidden Plan page. User switches to Plan → SHOULD see update via goTo→renderPlan re-render. But if cache stale or renderPlan throws error silently, update blocked.

**Surgical fix proposed:** NONE în src/ (observer pattern already correct). If Daniel observes "checkmark only", recommend investigate:
- Browser console errors when click SET
- DOM inspector check #bf-display value before/after SET
- Network tab check no failed requests breaking JS

---

## Audit Summary + Recommendation per Spec HALT

**Hypothesis Phase 3+3.5 broke observer pattern în src/:** FALSIFIED.

- ZERO src/ diff main vs feature
- Observer pattern WIRED CORRECTLY pe main src/ pentru toate 3 buguri
- Bugs 6+7+11 NU sunt regressions Phase 3+3.5

**Possible LATENT bugs identified during audit:**

| Bug | Latent gap (NU regression) | Surgical fix candidate |
|-----|----------------------------|------------------------|
| 6 | Engine wired correct, no actionable gap în src/ | None — investigate browser cache / SW / DB |
| 7 | saveW propagates renderDash dar NU renderPlan explicit | Add `if (window.renderPlan) window.renderPlan()` în saveW (LATENT, exists on main) |
| 11 | dispatchEvent('storage') non-standard pattern (works modern browsers) + listener correct | None — pattern functional |

**Per spec §0 HALT decision:** **NU proceed blind la §2 fix phase.**

Reasoning:
1. Hypothesis FALSIFIED — observer pattern în src/ NOT broken by Phase 3+3.5
2. Bugs reported potentially BROWSER-side (cache / SW / specific edge case)
3. Bug 7 latent gap (saveW NU calls renderPlan) exists pe main TOO — fix would change main behavior, NOT restore parity
4. Per Slip Co-CTO #2 anti-recurrence rule LOCKED V1: NU "fix orb" without Daniel Gates verification first

**Recommendation Daniel:**

1. **Smoke verify on main pre-Phase 3.6:** load andura.app prod în browser cu hard reload (Ctrl+Shift+R) → reproduce bugs 6+7+11. If reproduced on main → bugs are PRE-EXISTENT, NU Phase 3+3.5 regressions.

2. **If bugs reproduce on main:**
   - Bug 6: investigate browser cache + DB.set('phase-override') raw localStorage value
   - Bug 7: confirm whether saveW SHOULD trigger renderPlan (NEW LOCK V1 decision needed)
   - Bug 11: open DevTools console + click SET → check for JS errors + verify #bf-display value updates

3. **If bugs DO NOT reproduce on main:** false alarm OR only manifest on feature branch deploy (unlikely given ZERO src/ diff).

4. **Phase 3.6 atomic action:** PROPOSE Daniel approval pentru singur fix surgical (Bug 7 add renderPlan call în saveW) dacă confirm desired behavior. Bug 6+11 = no actionable fix.
