## Task: ADR 026 §9.7 Engine Warm-up Module-Level Spec V1 compile (pre-Faza 2.5 batch 7)
**Model:** Opus
**Status:** Complete

### Pre-flight
- Backup tag: `pre-adr026-section9.7-warmup-compile-2026-05-06-2049` ✅ pushed origin
- Clean tree pre-execution: yes (post sync to origin/main `51428dc`)
- Baseline tests: **2382 PASS / 0 FAIL** ✅
- §9.6 LANDED line 1286 confirmed + §9.7 main header ABSENT (anti-collision append safe)
- Tooling availability: `test:run` (vitest 3.2.4) + `typecheck` (tsc) ✅; **NO `lint`** (anti-Slip 4 transparent skip)

### Sources discovery transparency (path:linii + Source mapping)

- **Source 1** (PRIMARY) `📤_outbox/_archive/2026-05/131_HANDOVER_INPUT_2026-05-04_AUTH_FLOW_BATCH_1_6_63_LOCKED_CONSUMED.md` lines 157-198 — BATCH 4 §65.1-§65.4 Warm-up scope (4 decisions: §65.1 duration 5-10 min Override Q1 + §65.2 Hybrid 1-2 general + 2-3 specific + §65.3 skip buton vizibil + §65.4 Cool-down OVERRIDE Q4 optional 2 min stretch). NOTE §65.5-§65.10 Periodization/Exercise scope NU Warm-up.
- **Source 2** (SECONDARY) `06-sessions-log/HANDOVER_ENGINES_SPEC_2026-04-30_evening.md` §45.6 Engine #8 lines 324-345 — 5 sub-decisions (scope strict pre-Beta + pipeline §42.10 + persona thresholds Maria/Gigica/Marius + Pre-Beta MANDATORY + Instant Skip principle T0 default + T1+ opt-in + in-session toggle) + Cooldown Q-final "C Defer post-Beta v1.5" (superseded reconciled).
- **Source 3** (CROSS-CHECK) `00-index/CURRENT_STATE.md` §RECENT references confirm Engine #8 LOCKED §45.6 line 924 + BATCH 4 §65 summary line 766 + META §36.100 amendment 7→8 line 997.
- **Source 4 ABSENT** — `ls 03-decisions/` shows NO `023-engine-warmup*` sau `*warmup*` sau `*warm-up*` (only unrelated `023-llm-intent-interpretation.md`). NEW ADR Warm-up file recommend post §9.7 LOCKED (suggested `031-engine-warmup-mobility.md` next ADR §36.95 Additive convention) cu SPEC REFERENCE direct (NU intermediate STUB pattern).

### Parity check result

**2-way parity check ✅ + 🟡 reconciled override transparency:**
- Cluster A scope + Cluster B persona thresholds + Cluster D Instant Skip + Cluster E Pre-Beta MANDATORY: ZERO substantive divergence Source 1 ↔ Source 2.
- **🟡 Cool-down Q-final OVERRIDE:** Source 2 §45.6 Q-Cooldown 2026-04-30 = "C Defer post-Beta v1.5" (skip pre-Beta entirely); Source 1 §65.4 ~5 days later 2026-05-04 = explicit "OVERRIDE Q4 reconsider" → Option B "optional 2 min stretch" buton text-only (rationale Schoenfeld/Helms research + Maria 65 retention + ZERO complex UI). **Source 1 wins by virtue of being later + explicit OVERRIDE** (Daniel's later decision authority pattern — same precedent as Q1 duration §65.1 Override 8-12 → 5-10). NU substantive blocker; transparent reconciliation documented Cluster C3.

### Modificări

**`03-decisions/026-offline-coaching-decision-tree-exhaustive.md`** — append §9.7 NEW (+190 LOC, 1506 → 1696):

- **§9.7 Engine Warm-up Module-Level Spec V1 header** — Status SPEC READY V1 + provenance chain (Source 1 BATCH 4 §65.1-§65.4 4 Warm-up scope decisions + Source 2 §45.6 6 decisions + Source 3 CURRENT_STATE cross-check + Source 4 ABSENT — recommend NEW ADR `031-engine-warmup-mobility.md`) + reconciled override transparency note + decision count sum check 5+5+3+5+3 = 21 (Bugatti transparency NU fabricate quota) + cross-refs bidirectional 14 ADR-uri/§-uri
- **§9.7.1 Cluster A — I/O Contract & Pipeline Placement** (~5 decisions): A1 pipeline §42.10 position 7th canonical (clarify "Engine #8" legacy META §36.100 amendment 7→8) + A2 scope strict pre-Beta neuromuscular activation universal + mobility general ONLY (NU corrective therapy/biomechanical) + A3 Hook 1 input frozen Periodization+Goal Adaptation+Energy+Bayesian+Tempo+Specialization read-only + A4 5-field output blueprint (warmup_routine + cooldown_routine + skip_available + instant_skip_default + signals) + A5 ZERO side effects per ADR 018 §2
- **§9.7.2 Cluster B — Warm-up Protocol Logic** (~5 decisions): B1 duration 5-10 min adaptive Override Q1 (Maria 3-5 / Gigica 5-7 / Marius 8-10 ramp) + B2 Hybrid 1-2 general + 2-3 specific muscle group Q65.2 Option C + B3 persona thresholds Maria mobility flow / Gigica dynamic + ramp / Marius ramp 50/70/90% + B4 skip buton vizibil from session 1 §65.3 Option A (anti-paternalism + ADR 025 alignment) + B5 Pre-Beta MANDATORY Bugatti injury safety
- **§9.7.3 Cluster C — Cool-down Strategy** (~3 decisions): C1 OVERRIDE Q4 reconsider RECONCILED Source 1 supersedes Source 2 (Schoenfeld/Helms research + Maria 65 retention + ROI cost dev ~30 min) + C2 implementation MINIMAL 2-3 stretch text-only ZERO UI complex (consistent §9.5 Tempo E16 GIF REJECTED precedent) + C3 reconciliation transparency note compile-level disclosure
- **§9.7.4 Cluster D — Cross-Engine Hooks** (~5 decisions): D1 Hook upstream Periodization frozen (DELOAD lighter routine) + D2 Goal Adaptation phase context light coupling (CUT/BULK adaptive) + D3 Energy DOWN auto-shorten upper bound (anti-cascade preserve) + D4 Specialization weak group prioritized în specific muscle exercises (PARALLEL modifier precedent §9.6 Q11=B) + D5 Hook downstream Deload §9.8 forward (Cooldown compatible §65.6 trigger §36.82 readiness)
- **§9.7.5 Cluster E — Edge Cases / Telemetry / V1.5+ Deferrals** (~3 decisions): E1 Instant Skip principle T0 default ramp-up integrated + T1+ opt-in expanded + in-session toggle (ADR 025 graceful degradation) + E2 medical-adjacent boundary NU corrective therapy / NU biomechanical limitations / Pain-Aware NU proactive trigger preserved §9.4.6 Convergence Guard reference (anti-EU AI Act medical scope creep) + E3 V1.5+ deferrals (Cooldown extended Schoenfeld 5-10 min + foam rolling + parasympathetic breathing / personalized warm-up Profile Typing T2+ / mobility tracking longitudinal Bayesian Q20=D ecosystem-wide / AR/video-guided)
- **§9.7.6 Reconsideration Triggers** — 7 triggers documented (Cluster B1 Maria duration insufficient signal + Cluster B2 Hybrid rigidity + Cluster B4 skip overuse paternalism boundary + Cluster C1 cooldown 2 min insufficient signal + Cluster D3 Energy DOWN auto-shorten too aggressive + Cluster E1 Instant Skip T0 ramp-up insufficient + Cluster E3 Bayesian v1.5 ecosystem timing); re-evaluation cadence post-Beta
- **§9.7.7 Cross-refs Bidirectional ADR** — ADR 018/026/017/025/009/030/Pain Button + recommend NEW ADR Warm-up `031-engine-warmup-mobility.md` SPEC REFERENCE direct (NU intermediate STUB) + §9.1-§9.6 upstream Hook + §9.8 Deload forward Hook + HANDOVER_ENGINES_SPEC §45.6
- **Footer 🦫 marker** — compile timestamp 2026-05-06 evening chat-7 acasă + ZERO net new substantive + 21 decisions cumulative + Pattern §9.1-§9.6 honored Bugatti SSOT consistent + 2-way parity ✅ + reconciled override transparency + Source 4 ABSENT recommendation NEW ADR

### Build + Tests
- N/A spec compile only — zero src/ touched, ZERO regression possible
- Pre-commit hook ran `npm run test:run` → **2382 PASS / 0 FAIL** preserved exact

### Commits (1)
- `c15ad0f` docs(adr-026): §9.7 Engine Warm-up Module-Level Spec V1 compile — append §9.7.1-§9.7.7 post §9.6 Specialization (+190 LOC); ~21 decisions Cluster A-E (5+5+3+5+3) Sources 1+2 chat strategic 2026-04-30 evening §45.6 + 2026-05-04 evening BATCH 4 §65.1-§65.4; 2-way parity ✅ + reconciled override (Source 1 §65.4 OVERRIDE Q4 supersedes Source 2 §45.6 Q-Cooldown defer); pipeline §42.10 position 7th canonical (NU 'Engine #8' legacy META §36.100 amendment 7→8); Source 4 ADR Warm-up file ABSENT — recommend NEW ADR `031-engine-warmup-mobility.md` SPEC REFERENCE direct; Bugatti scope transparency: NU fabricate cluster decisions to hit ~28 quota — accept lower 21 count; 2382 PASS preserved

### Pushed
- origin/main: yes (`51428dc..c15ad0f main -> main`)

### Issues
- **2-way parity check ✅ ZERO substantive divergence flagged** (anti-recurrence proof Source 1 + Source 2 alignment Cluster A scope + Cluster B persona thresholds + Cluster D Instant Skip + Cluster E Pre-Beta MANDATORY identical)
- **🟡 Cool-down reconciled override transparency** — Source 1 §65.4 BATCH 4 (2026-05-04 evening, ~5 days later than Source 2) explicit "OVERRIDE Q4 reconsider" supersedes Source 2 §45.6 Q-Cooldown "C Defer post-Beta v1.5". Source 1 wins per Daniel's later decision authority pattern (consistent Q1 duration §65.1 Override 8-12 → 5-10 precedent). NU silent pick — transparency documented Cluster C3 verbatim.
- **Decision count granularity variance flag transparency** — 21 cumulative (5+5+3+5+3) vs prompt expected ~10-28 range = upper-mid bound; lower than §9.4-§9.6 ~28-32 range. Reasoning: BATCH 4 §65 only 4 Warm-up-scope decisions (§65.5-§65.10 = Periodization/Exercise NU Warm-up scope); §45.6 5 decisions + Cooldown reconciled = 6 scope; total 4+6 = 10 source decisions decomposed Cluster A-E + 11 derived A1+A3+A4+A5+D1-D5+E2+E3 standard pattern decomposition = 21. **Bugatti transparency: NU fabricate cluster decisions to hit ~28 quota** consistent prompt anti-recurrence checklist verbatim "accept lower count if sources limited + flag transparency". Engine #8 spec session minimal vs Engines #5+#6+#7 dedicated 3-engine cluster session (149_HANDOVER) — explains lower count.
- **ADR Warm-up file ABSENT recommendation** — `ls 03-decisions/` confirms NO `023-engine-warmup*`. Post §9.7 LOCKED → recommend NEW ADR `031-engine-warmup-mobility.md` (next ADR per §36.95 Additive convention) cu SPEC REFERENCE redirect direct la §9.7 SSOT canonical. **Reverse pattern** vs ADR 027/028/029 stub flip — Warm-up gets fresh ADR direct populated cu SPEC REFERENCE (NU intermediate STUB stage). Separate task post-CC, low priority.
- **Pipeline canonical position 7th clarified header** — §9.7 main header + §9.7.1 Cluster A1 explicitly cite §42.10 position 7th canonical (post §9.6 Specialization 6th LANDED commit `4cf50ab` precedent) + clarify "Engine #8" naming legacy chat strategic spec session ordering 2026-04-30 evening META §36.100 amendment 7→8 prescriptive engines ≠ pipeline 7th canonical position. Anti-recurrence numbering ambiguity batch 8 (§9.8 Deload final) reference reinforced.
- **Cumulative LOCKED V1 ~659 PRESERVED unchanged** (compile aggregation only verbatim §9.7 spec, ZERO net new substantive decisions).
- **Pre-flight grep SOURCES + tooling availability ✅** anti-Slip 2 + Slip 4 + Slip 5 reinforced (memory rule `feedback_grep_before_prompt_cc.md` honored — Source 1 BATCH 4 §65 + Source 2 HANDOVER_ENGINES_SPEC §45.6 confirmed sources NU §45.x stale assumption).

### Next action — chat NEW pickup priority pivot

**P1.2.5 batch 7 Faza 2.5 Engine Warm-up V1 implement** (NEXT chat strategic):
- Pre-compile §9.7 LANDED single source of truth canonical 21 decisions Cluster A-E verbatim (commit `c15ad0f`)
- Pure-function module în `src/engine/warmup/` per ADR 018 §2 Standardized Contract
- Pattern Periodization V1 + Goal Adaptation V1 + Energy V1 + Bayesian V1 + Tempo V1 + Specialization V1 commits `1303b62`+`bf9814e`+`69ec9ce`+`8615ec1`+`d82d118`+`4cf50ab`: ~7 source modules + ~5 test files
- Estimate ~50-83 min real velocity X×3 rule (precedent batches 1+2+3+4+5+6 actual reference; possibly faster — Warm-up scope simpler ~21 decisions vs §9.4 ~32)

**Faza 2.5 batch 8 Final §9.8 Engine Deload Protocol** (post Warm-up V1 LANDED batch 7):
- Pre-implement compile §9.8 ADR 026 pattern Bugatti SSOT consistent §9.1-§9.7
- Final prescriptive engine pipeline §42.10 (Engine Deload Protocol — Q12=A standard deload week 4 preserved non-negotiable Engine #4 Hook + composite signal §36.41 + AA Detection ADR 013 multi-trigger orchestrator unification per Source 1 line 16)
- Pipeline §42.10 sequential canonical complete: Periodization → Goal Adaptation → **Energy** (3rd LANDED) → **Bayesian** (4th LANDED) → **Tempo** (5th LANDED) → **Specialization** (6th LANDED) → **Warm-up** (7th NEXT) → **Deload** (8th batch 8 FINAL)

**ADR Warm-up NEW file recommendation** (post §9.7 LOCKED + V1 LANDED, low priority post-CC):
- Create `03-decisions/031-engine-warmup-mobility.md` cu SPEC REFERENCE direct → §9.7 SSOT canonical (precedent reverse vs ADR 027/028/029 stub flip pattern; suggested filename next ADR §36.95 Additive convention)
