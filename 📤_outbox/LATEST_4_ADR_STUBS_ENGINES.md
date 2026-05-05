## Task 4 — ADR Stubs Engine #5 / #6 / #7
**Model:** Opus
**Status:** Complete

### Pre-flight per task
- Backup tag global: `pre-batch-overnight-2026-05-05-evening` ✅
- Clean tree pre-task: yes (post TASK 3 commits clean)
- Hooks: normal — full `npm run test:run` PASS

### Engine number correction (vault SSOT integrity preserved)

**Master prompt referenced "ADR 027 = Engine #5 Deload"** — but vault SSOT confirms:
- Engine #4 = Deload Protocol
- Engine #5 = Energy Adjustment (formal full Gemini pas 1+2+3 lock confirm 2026-05-05 birou late, ~26-28 decisions LOCKED V1)

Per master prompt §STEP 5 push-back productive rule + VAULT_RULES anti-fabrication: ADR 027 created as **Engine #5 Energy Adjustment** (vault SSOT preserved). Documented în report + DECISION_LOG entry explicit.

### Modificări

**Files created (3):**
- `03-decisions/027-engine-energy-adjustment.md` (~115 LOC) — STUB cu spec dispersed listed verbatim from CURRENT_STATE 2026-05-05 birou late JUST_DECIDED entry. Pipeline placement §42.10 sequential 3rd. Cross-engine hooks: Engine #1 Periodization Floor/Ceiling + Engine #3 Bayesian σ variance modifier (Q12=C) + Engine #4 Deload soft override sub-Floor max 2 consecutive (Q9 anti-drift). Open Q-uri: 5 PENDING.
- `03-decisions/028-engine-tempo-form-cues.md` (~90 LOC) — STUB. Pipeline placement Execution overlay (parallel cu Engine #7). Cross-engine hooks: Periodization high intensity → form-conservative amplification (Q11=B), Deload week → mind-muscle unlock (Q12=D), Energy DOWN → slow eccentric universal (Q13=B), RIR Matrix breakdown → +1 auto-bump (Q14=B). Open Q-uri: 5 PENDING.
- `03-decisions/029-engine-specialization.md` (~115 LOC) — STUB ULTIMUL prescriptive engine (8/8 milestone). Activation gating LOCKED V1 strict: Marius Advanced AND lagging + Bulk/Recomp ONLY (Cut DISABLE). PARALLEL modifier Engine #1 Periodization NU REPLACE (Q11=B). Wires `weaknessDetector.js` orfan reuse per §36.84 Gap #1 (zero new code). Open Q-uri: 6 PENDING.

**Files updated (2):**
- `00-index/INDEX_MASTER.md` — 3 rows added la § ADRs Numbered table (027/028/029) cu status 🟡 STUB / PENDING SPEC + decisions count + Engine #N reference + ULTIMUL prescriptive 8/8 milestone for 029
- `03-decisions/DECISION_LOG.md` — entry top descending cronologic "2026-05-05 overnight — ADR 027/028/029 Stubs Engines #5/#6/#7" cu engine number correction note + decisions count discovery + cross-refs + files created

### Decisions count discovery per engine (NU fabricated, sourced from CURRENT_STATE 2026-05-05 birou late JUST_DECIDED entry)

| Engine | ADR | Decisions count (estimate) | Source citation |
|--------|-----|----------------------------|-----------------|
| Engine #5 Energy Adjustment | 027 | ~26-28 | CURRENT_STATE §JUST_DECIDED 2026-05-05 birou late |
| Engine #6 Tempo/Form Cues | 028 | ~28-30 | CURRENT_STATE §JUST_DECIDED 2026-05-05 birou late |
| Engine #7 Specialization | 029 | ~28-30 | CURRENT_STATE §JUST_DECIDED 2026-05-05 birou late |

Counts marked as estimate — exact verification deferred to chat strategic NEW dedicat consolidation per master prompt rule "if exact count NU explicit found în HANDOVER → flag în Open Questions PENDING (NU fabricate count)".

### Build + Tests
- N/A — vault docs only, zero src/ touched
- Pre-commit hook: full `npm run test:run` PASS (1298 tests baseline preserved)

### Commits
- `7a86343` feat(adr-stubs): ADR 027 Engine #5 Energy Adjustment + ADR 028 Engine #6 Tempo/Form Cues + ADR 029 Engine #7 Specialization — 3 stubs format pattern reuse ADR 024, spec dispersed HANDOVER §45.x consolidation PENDING chat strategic NEW

### Pushed
- origin/main: deferred until end-of-batch

### Issues
- Master prompt engine number error (Engine #5 = "Deload") corrected to vault SSOT (Engine #5 = Energy Adjustment, Engine #4 = Deload Protocol). Per VAULT_RULES anti-fabrication preserved.
- ADR 026 compile draft full forward refs to ADR 027/028/029 now resolve cleanly (3 forward refs from TASK 3 satisfied).

### Next action (TASK 5 starts immediately — last task, minimize blast radius scope)

- TASK 5 — HANDOVER_GLOBAL thematic split (~7673 LOC > 7000 threshold §VAULT_HYGIENE_PASS STEP 13)
- Daniel post-batch: review 3 stubs + decide priority chat strategic NEW dedicat consolidation Engine #5/#6/#7 spec full from HANDOVER §45.x dispersed
