# PROMPT_CC — Phase 6 task #1.A — deloadAdapter batch 8 ULTIM

**Date:** 2026-05-18
**Branch:** feature/v3-react-clasic
**Model:** Opus EXCLUSIVELY (Sonnet concediat permanent — DO NOT downgrade)
**Status target:** LANDED atomic single-concern commit + parity tests verde

---

## §0 Orchestrator policy compliance MANDATORY

- [ ] Karpathy 4 principii read pre-task: `07-meta/karpathy-skills-ref/CLAUDE.md` §1-§4 (Think Before Coding + Simplicity First + Surgical Changes + Goal-Driven Execution)
- [ ] Atomic single-concern commit (NU bundle alt scope)
- [ ] Pre-commit hook verde mandatory (vitest + typecheck) — ZERO `--no-verify` bypass
- [ ] ZERO `git add -A` (explicit per-file staging per Daniel project memory)
- [ ] ZERO `src/engine/*` mutation per ADR 026 §9 (adapter consumes engine read-only; engine deja LANDED)
- [ ] ZERO mockup `04-architecture/mockups/andura-clasic.html` mutation (read-only verbatim verify)
- [ ] NO_DIACRITICS_RULE preserved (NU aplică here — adapter pur tehnic, NU UI strings)
- [ ] Backup tag pre-task push origin: `pre-phase6-task-1A-deload-adapter-2026-05-18`

---

## §1 Context

Phase 5 BATCH 20-task LANDED 2026-05-18 milestone `phase-5-batch-landed-2026-05-18` pushed origin. 4290 PASS / TS 0 errors / branch `feature/v3-react-clasic` clean foundation.

Phase 6 task #1 = engine pipeline real wire (LATEST §8 top priority carry-forward). Decomposed atomic per orchestrator §1.10 single-concern recovery granular:

- **#1.A** `deloadAdapter` batch 8 ULTIM (ACEST TASK) → completează 8/8 STRANGLER topology Faza 3 LANDED
- **#1.B** `scheduleAdapter.getDailyWorkout(ctx, date)` NEW export — build EngineContext + invoke `runPipeline(ctx, [8 adapters])` aggregate blueprint → WorkoutPlan
- **#1.C** `src/react/lib/scheduleAdapterAggregate.ts` baseline PHASE_5_BASELINE_PUSH → real wire via #1.B

#1.A blocker pentru #1.B+C (pipeline runPipeline needs all 8 adapters wired terminal).

---

## §2 Goal (this task scope strict)

Create `deloadAdapter.js` batch 8 ULTIM **+** `deloadParity.test.js` parity tests **+** barrel export update.

Pipeline §42.10 sequential canonical FINAL position 8/8:
`Periodization → Goal Adaptation → Energy Adjustment → Bayesian Nutrition → Tempo → Specialization → Warm-up → **Deload** ← TERMINAL`

---

## §3 Spec verbatim

### §3.1 NEW file `src/coach/orchestrator/adapters/deloadAdapter.js`

**Pattern parity precedent:** `warmupAdapter.js` (batch 7) — verbatim header convention + import structure + invoke logic + try/catch envelope.

**Adapter contract per ADR 030 D1-D5 LOCKED V1:**
- `id` = `ENGINE_ID` from `src/engine/deload/index.js` (string `'deload'`)
- `invoke(ctx)` async → returns `AdapterResult` envelope `{ ok, output | error }` (NEVER throws — D4 violation insurance)

**Constraint Object prerequisite check (ADR 030 §3.6 + ADR 026 §1.10):**
- Read upstream `ctx.meta.constraintObject` — missing/null/non-object → `err({ code: 'INVALID_INPUT', severity: 'hard' })` halt-strict
- Rationale: Deload engine reads `meta.periodizationConstraint` (Hook D1) — cannot trust output without upstream baseline

**D2 shape mapping:**
- Rename orchestrator-generic `meta.constraintObject` → engine-specific `meta.periodizationConstraint` (parity Specialization/Warmup/Tempo/Bayesian/Goal pattern — NU Energy Adjustment Hook 4 re-emission pattern)
- Freeze adapted ctx + meta

**Engine consume pattern:**
- Deload engine consumes Constraint Object **read-only** Hook D1 (verified `src/engine/deload/index.js` `consumeFrozenConstraint(periodizationConstraint)`)
- Engine output blueprint = 9 fields `{ deload_state, depth_pct, duration_weeks, intensity_modifier, partial_scope, notification_tier, wording, ui_label, signals }`
- Engine NU emits `meta.forward_constraint_object` (terminal V1 — forwardConstraintObject returns null trace-only per `crossEngineHooks.js` Hook D7)
- Adapter NU re-surface `output.constraintObject` (Specialization/Tempo/Bayesian/Goal pattern, NU Energy Adjustment Hook 4 pattern)

**Try/catch envelope:**
- Engine spec NEVER throws (`evaluate(ctx)` total function async per ADR 018 §2)
- D4 violation insurance: try/catch with `code: 'ENGINE_THREW', severity: 'hard'` per §3.6 taxonomy

**Header comment scope:**
- Batch 8 ULTIM context (pipeline 8/8 V1 prescriptive engines complete post LANDED)
- ADR 030 D1-D5 contract verbatim
- Hook D1 read-only consume pattern (parity batches 4-7, NU Energy Hook 4)
- Constraint Object terminal V1 (forwardConstraintObject returns null — Deload last)
- Engine output 9-field blueprint enumerated
- See: refs `030-adapter-design-pattern.md` §3 + `026-...-exhaustive.md` §9.8 + `001-...periodization` (Hook D1) + `src/engine/deload/index.js` (engine LANDED) + `src/coach/orchestrator/adapters/warmupAdapter.js` (batch 7 precedent)

### §3.2 NEW file `src/coach/orchestrator/__tests__/deloadParity.test.js`

**Pattern parity precedent:** `warmupParity.test.js` (batch 7) — verbatim test structure + fixture composition + expect assertions.

**Test scope mandatory ~12 tests minim:**

**3 fixture cases (Cluster A-E semantics ADR 026 §9.8):**
1. T0 fresh user no triggers → DELOAD_STATE.IDLE, tier 'LOW', depth_pct 0, duration_weeks 0
2. T1 Marius scheduled DELOAD week (Periodization phase=DELOAD) → DELOAD_STATE.SCHEDULED_LINEAR, depth_pct ~45, duration_weeks 1, notification_tier BANNER_DETAILED
3. T2 Marius composite trigger (performance drop ≥10% + rest time ≥1.5x + RIR mismatch) → DELOAD_STATE.REACTIVE_COMPOSITE, depth_pct ≥45, intensity_modifier obligatoriu `{rir_increment:1, intensity_pct_decrement:12.5}`

**5 edge cases (parity warmupParity precedent):**
- MISSING `constraintObject` → INVALID_INPUT 'hard' severity halt per §3.6 fail-safe
- Engine throws (mock `vi.spyOn(engine, 'evaluate').mockRejectedValue(new Error('boom'))`) → ENGINE_THREW 'hard' severity
- BUDGET_EXCEEDED simulated → 'soft' continue (Q-OPEN-2 + §3.6)
- Sub-span telemetry fires cu `adapterId='deload'`
- Sub-span captures err code + severity on hard halt

**4 pipeline integration tests (8-adapter full chain cumulative — NEW vs Warmup 7-adapter chain):**
- Full pipeline Periodization → GoalAdapt → EnergyAdj → Bayesian → Tempo → Specialization → Warmup → **Deload** end-to-end (8 sub-spans)
- Constraint Object preserved frozen propagated through entire 8-chain via Energy Hook 4 upstream emission (verify final ctx still has constraintObject post-Deload — Deload doesn't strip)
- Periodization fails hard → cascade halt: ALL 7 downstream skipped (Deload NU invoked)
- Warmup fails hard → Deload skipped (downstream halt cascade)

**Import enum `DELOAD_STATE` direct din `src/engine/deload/constants.js`** pentru anti-drift (lesson batch 6+ preserved).

### §3.3 UPDATE `src/coach/orchestrator/adapters/index.js` barrel

Replace pending comment line with active export:

```diff
 export { warmupAdapter } from './warmupAdapter.js';

-// Faza 3 batch 8 PENDING (sequential per ADR 026 §42.10 — ULTIM):
-// export { deloadAdapter } from './deloadAdapter.js';                     // batch 8
+export { deloadAdapter } from './deloadAdapter.js';
```

Update header `V1 status (Faza 3 STRANGLER batch 8 LANDED 2026-05-18 — 8/8 adapters wired COMPLETE)` + add entry `deloadAdapter ✅ LANDED batch 8 ULTIM (commit `<sha>`) — seventh downstream consumer (read-only Hook D1, NU re-emit; pipeline §42.10 TERMINAL post Deload completes 8/8 V1 prescriptive engines wired)`.

Remove "1 remaining adapter PENDING — Faza 3 batch 8 Deload ULTIM per pipeline order" line.

---

## §4 Acceptance criteria

- [ ] `src/coach/orchestrator/adapters/deloadAdapter.js` NEW file LANDED parity warmupAdapter precedent
- [ ] `src/coach/orchestrator/__tests__/deloadParity.test.js` NEW file ~12 tests minim (3 fixture + 5 edge + 4 pipeline integration)
- [ ] `src/coach/orchestrator/adapters/index.js` barrel export `deloadAdapter` added + header updated 8/8 LANDED COMPLETE
- [ ] Tests delta: baseline 4290 PASS → minim 4302 PASS (+12 minim, can be higher if granular sub-tests)
- [ ] TS 0 errors preserved (NU JS-only files in this task — but pre-commit typecheck verde mandatory)
- [ ] Pre-commit hook verde (vitest + typecheck)
- [ ] Backup tag `pre-phase6-task-1A-deload-adapter-2026-05-18` push origin pre-commit
- [ ] Atomic single-concern commit message: `feat(orchestrator): deloadAdapter batch 8 ULTIM completes 8/8 STRANGLER pipeline V1`
- [ ] Push origin feature/v3-react-clasic post-LANDED

---

## §5 Process rules

1. **Pre-flight grep filesystem verify** primary-source înainte design:
   - `src/engine/deload/index.js` — engine ENGINE_ID + evaluate signature + Hook D1 consume pattern
   - `src/engine/deload/constants.js` — DELOAD_STATE + NOTIFICATION_TIER + TRIGGER_SOURCE enums
   - `src/coach/orchestrator/adapters/warmupAdapter.js` — precedent pattern verbatim
   - `src/coach/orchestrator/__tests__/warmupParity.test.js` — test structure parity
   - `src/coach/orchestrator/result.js` — `ok()` + `err()` envelope helpers
   - `src/coach/orchestrator/types.js` — EngineAdapter + EngineContext + AdapterResult types

2. **Atomic discipline:** single commit toate 3 file changes (adapter + test + barrel) — DAR explicit per-file staging:
   ```
   git add src/coach/orchestrator/adapters/deloadAdapter.js
   git add src/coach/orchestrator/__tests__/deloadParity.test.js
   git add src/coach/orchestrator/adapters/index.js
   git commit -m "feat(orchestrator): deloadAdapter batch 8 ULTIM completes 8/8 STRANGLER pipeline V1"
   ```

3. **Backup tag pre-commit push origin** (recovery safety net):
   ```
   git tag pre-phase6-task-1A-deload-adapter-2026-05-18
   git push origin pre-phase6-task-1A-deload-adapter-2026-05-18
   ```

4. **Tests verde mandatory** — daca falează pre-commit hook, ROLLBACK + diagnose + retry. NU `--no-verify` bypass sub nici un motiv.

5. **Karpathy Simplicity First:** parity warmupAdapter LOC count ±10% (adapter ~200 LOC inclusiv header, ~50 LOC actual code). NU adăuga abstractions speculative, NU "improve" while wiring.

6. **Goal-Driven Execution:** scope strict §2 — daca discoveri issues alt scope (e.g., test failing pre-existing pe Deload engine), FLAG în report `📤_outbox/LATEST.md §Issues`, NU fix în acest commit (single-concern).

---

## §6 Report format `📤_outbox/LATEST.md` post-LANDED

Standard format (parity Phase 5 BATCH precedent):

```
# LATEST CC — Phase 6 task #1.A deloadAdapter batch 8 ULTIM LANDED

**Date:** 2026-05-18
**Task:** Phase 6 task #1.A — deloadAdapter batch 8 ULTIM
**Model:** Opus
**Branch:** feature/v3-react-clasic
**Status:** Complete | 1 commit atomic | 4290 → <NEW> PASS (+<DELTA>) | TS 0 errors preserved

## §0 Orchestrator policy compliance ✓ [checkboxes]
## §1 Commit (1 atomic): SHA + subject
## §2 Tests: baseline → final + delta breakdown
## §3 Modificări: 3 files (deloadAdapter.js NEW + deloadParity.test.js NEW + adapters/index.js UPDATE)
## §4 Issues (if any) — else "None"
## §5 Acceptance criteria ✓ [checkboxes]
## §6 Phase 6 task #1.B+C carry-forward (next task scope brief)
```

---

## §7 Anti-recurrence checklist (Co-CTO discipline)

- [ ] Daniel zero touch — autonomous execute end-to-end
- [ ] Karpathy 4 principii read pre-task (Think → Simplicity → Surgical → Goal-Driven)
- [ ] Primary-source verify pre design (NU memorie internă summary)
- [ ] Pattern parity warmupAdapter precedent verbatim (NU reinvent abstractions)
- [ ] Atomic single-concern commit (NU bundle alt scope)
- [ ] Backup tag pre-commit push origin
- [ ] Tests verde + TS 0 errors invariant preserved
- [ ] Report `📤_outbox/LATEST.md` §0-§6 format complete

---

🦫 **Phase 6 task #1.A deloadAdapter batch 8 ULTIM = completează 8/8 STRANGLER topology Faza 3 V1 LANDED. Pipeline §42.10 COMPLETE post commit. Unlocks Phase 6 task #1.B scheduleAdapter.getDailyWorkout consumer + Phase 6 task #1.C React-side real wire. Bugatti craft peak — atomic single-concern + parity precedent + tests verde + backup tag + ZERO bypass.**
