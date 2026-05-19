# Phase 3.6 Cluster #1 — Engine Integration Regresie

- **Task:** Phase 3.6 Cluster #1 audit-then-fix engine integration regresie (Bug 6+7+11)
- **Model:** Opus
- **Status:** ⚠️ **AUDIT — HALT per spec §0** (Hypothesis Phase 3+3.5 src/ regression FALSIFIED — ZERO src/ diff main vs feature)
- **Branch:** feature/phase-3-orchestrator-final
- **Scope:** Single-theme Clasic master (post STRATEGIC SHIFT LOCK V1). src/ only, NU mockups.

## Pre-flight grep

Output verbatim → `📤_outbox/PHASE_3_6_CLUSTER_1_PREFLIGHT.md`

**(a) Engine handlers + emit + listen — WIRED CORRECTLY:**
- `setPhaseOverride` plan.js:147 → DB.set + renderPlan + renderDash + renderUnifiedHistory
- `clearPhaseOverride` plan.js:174 → same chain
- `SYS.getPhase` sys.js:69 → reads phase-override first, returns if set ✓
- `SYS.getKcalTarget` sys.js:111 → switch phase-override → multiplier (CUT 0.82, BULK 1.08, MAINTENANCE 1.0, STRENGTH 1.05) ✓
- `saveW` weight.js:51 → DB.set('weights') + renderWeight + window.renderDash ✓
- `setBFOverride` weight.js:561 → DB.set('bf-override') + dispatchEvent StorageEvent + toast ✓
- `clearBFOverride` weight.js:570 → same pattern
- `window.addEventListener('storage')` plan.js:168 → renderPlan() on bf-override key ✓

**(b) DB.set/get pattern:** Standard layer (db.js abstraction over localStorage), no irregularities found.

**(c) Diff main vs feature primary suspect files:**

```bash
git diff origin/main..HEAD -- src/  →  ZERO LINES
```

**🚨 CRITICAL FINDING:** ZERO src/ diff between origin/main and feature/phase-3-orchestrator-final. Phase 3+3.5 work was 100% mockup files (`04-architecture/mockups/`) + vault docs.

**(d) Suspect lines diff:** 0 handler-related diff lines.

**(e) Tests handlers:** sys.test.js:35-47 + 116 cover bf-override + getPhase. 2731 PASS preserved.

**(f) BF UI:** index.html:617 input + SET/RESET buttons → setBFOverride/clearBFOverride wired correctly.

**Suspect lines diff main vs feature:** **0 lines** în /tmp/cluster_1_suspect.txt → **HALT condition triggered per spec §0**.

## Audit findings per bug → `📤_outbox/PHASE_3_6_CLUSTER_1_AUDIT.md`

**Bug 6 (goal Forța→Mentenanță NU update Progres):**
- Root cause: NONE în src/ — observer pattern WIRED CORRECTLY
- Engine chain: setPhaseOverride → DB.set('phase-override') → renderPlan + renderDash + renderUnifiedHistory ✓
- SYS.getPhase reads override first (sys.js:69-72) ✓
- SYS.getKcalTarget switch phase-override returns TDEE × multiplier (MAINTENANCE = TDEE pure) ✓
- Tab switch goTo('plan') re-renders Plan tab on activation ✓
- **Surgical fix:** NONE în src/ — investigate browser cache / SW PWA / DB layer

**Bug 7 (greutate/BF NU propagate engine):**
- Root cause partial: saveW propagates renderDash dar **NU renderPlan** explicit
- LATENT gap (NU regression — exists pe main TOO)
- SYS.getCurrentKg reads weights fresh, estimateTDEE recalcs Mifflin-St Jeor
- **Surgical fix candidate (LATENT):** add `if (window.renderPlan) window.renderPlan();` în saveW weight.js:57 — propagate Plan tab refresh
- **NU implement orb fără Daniel approval** (Slip #2 anti-recurrence rule LOCKED V1)

**Bug 11 (BF manual checkmark only NU funcțional):**
- Root cause: NONE în src/ — observer pattern WIRED CORRECTLY
- setBFOverride: DB.set + dispatchEvent StorageEvent + toast ✓
- Storage listener plan.js:168 fires renderPlan ✓
- SYS.getBF reads bf-override first (sys.js:19-21) ✓
- Caveat: dispatchEvent('storage') manual same-tab non-standard pattern (works modern browsers)
- **Surgical fix:** NONE — pattern functional. Investigate browser console errors când Daniel clicks SET.

## Modificări (post §2 fix)

**ZERO src/ changes per HALT condition spec §0.**

Reasoning: Hypothesis Phase 3+3.5 broke observer pattern în src/ FALSIFIED by ZERO src/ diff main vs feature. NU "fix orb" per Slip #2 anti-recurrence rule LOCKED V1.

Files added (raports only):
- `📤_outbox/PHASE_3_6_CLUSTER_1_PREFLIGHT.md` (grep output verbatim)
- `📤_outbox/PHASE_3_6_CLUSTER_1_AUDIT.md` (per-bug audit findings + recommendation)

## Build + Tests

- `npm test --run`: NU rerun (zero src/ changes — tests preserved 2731 PASS implicit). Last verified at Phase 3.5 closure commit `3ff5726`.
- Build: zero src/ changes → no impact

## Commits

- Backup tag: pre-phase-3-6-cluster-1-engine-regresie-2026-05-10-1330
- Audit raports commit pending (raports + archive only, NU src/)

## Pushed

origin/feature/phase-3-orchestrator-final pending (raports commit)

## Issues + NEED_CONTEXT_DANIEL

🚨 **HALT per spec §0** — Hypothesis primary FAIL. Phase 3+3.5 NU broke observer pattern în src/.

**3 NEED_CONTEXT_DANIEL flags:**

1. **Daniel verify on main pre-Phase 3.6:** load andura.app prod în browser cu hard reload (Ctrl+Shift+R) → reproduce bugs 6+7+11. If reproduced on main → bugs PRE-EXISTENT, NU Phase 3+3.5 regressions. If NOT reproduced → false alarm.

2. **Bug 7 LATENT fix decision:** add `renderPlan` call în saveW (weight.js:57)? Daniel decide:
   - YES = parity expectation "saveW should refresh Plan tab too" (NEW behavior)
   - NO = current behavior "Plan tab refreshes only on tab switch" preserved

3. **Bug 6+11 investigation axes (post Daniel verify):**
   - Browser cache / SW PWA pre-cache override → hard reload + clear SW
   - DB.set silently fails (localStorage quota / sync conflict) → DevTools Application tab inspect
   - DOM update happens but display offscreen / CSS hidden → DevTools Elements inspect

## Next action

**Daniel Gates pre-fix verification:**

1. Hard reload andura.app prod (Ctrl+Shift+R) — clear browser cache + SW
2. Reproduce bugs 6+7+11 sequence:
   - Bug 6: click MENTENANȚĂ button în Plan tab → does #phase-name update to "MAINTENANCE" + #kcal-display change to TDEE value?
   - Bug 7: log greutate 78kg în Weight tab → switch to Plan tab → does #tdee-display + #kcal-display reflect new weight?
   - Bug 11: input BF 18 în BF override + click SET → does #bf-display change to 18 + toast appear?
3. **If bugs reproduce on main:** confirm LATENT bugs (NU Phase 3+3.5 regressions) → Daniel decide pe Bug 7 fix candidate (renderPlan call)
4. **If bugs NU reproduce on main:** false alarm — Phase 3+3.5 work confirmed clean, no action needed

**Anti-recurrence rule reinforced (Slip #2 LOCKED V1):**
- LOCAL vitest CC = 2731 PASS preserved
- e2e Playwright CI/CD = NU run for cluster #1 (zero src/ changes)
- Daniel Gates prod smoke = MANDATORY before any src/ fix considered

🦫 Cluster #1 / 4 sequential — **HALT per spec §0 verified.** Trust = engine NU minte user, dar engine NU also NU regressed. Investigate browser layer + Daniel verify pre-fix.
