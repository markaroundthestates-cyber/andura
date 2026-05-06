## Task: ADR 026 §9.6 Engine Specialization Module-Level Spec V1 compile (pre-Faza 2.5 batch 6)
**Model:** Opus
**Status:** Complete

### Pre-flight
- Backup tag: `pre-adr026-section9.6-specialization-compile-2026-05-06-1626` ✅ pushed origin
- Clean tree pre-execution: yes (post Tempo V1 batch 5 commit `d82d118` + LATEST sync `1401c54`)
- Branch: `main` ✅
- Last commits include `d82d118` (Tempo V1 batch 5) ✅
- Source 1 archive: `📤_outbox/_archive/2026-05/149_HANDOVER_2026-05-05_birou_late_engines5-6-7_spec_sessions_CONSUMED.md` ✅ (9161 bytes, Engine #7 Specialization section lines 50-72, 22 substantive bullet decisions Q1-Q20 + cross-cutting note)
- Source 2 cross-check: `00-index/CURRENT_STATE.md` §RECENT 2026-05-05 birou late Engine #7 Specialization partition lines 557-579 (22 bullets identical content) ✅
- Source 3 ADR 029 status: **STUB legacy** (83 LOC `🟡 STUB / PENDING SPEC` per Vault Hygiene 2026-05-05 overnight CC TASK 4) — precedent §9.3 Energy ADR 027 + §9.5 Tempo ADR 028 stub pattern (NU §9.4 Bayesian ADR 022 SPEC READY V1 case)
- ADR 026 LOC pre-execution: 1282 (last section §9.5.7 line 1260) ✅
- `weaknessDetector.js` orfan `src/engine/weaknessDetector.js` exists ✅ (§36.84 Gap #1 reuse candidate pentru batch 6 V1 implement)
- Tooling: node v24.14.0 + npm 11.9.0 + vitest 3.2.4 ✅
- **2-WAY parity check Source 1 ↔ Source 2 verbatim: ✅ ZERO substantive divergence flagged** — Q1-Q20 bullets identical entre 149_HANDOVER lines 50-72 și CURRENT_STATE §RECENT lines 557-579

### Modificări

**`03-decisions/026-offline-coaching-decision-tree-exhaustive.md`** — append §9.6 NEW (+224 LOC, 1282 → 1506):

- **§9.6 Engine Specialization Module-Level Spec V1 header** (line 1286) — Status SPEC READY V1 + provenance chain (Source 1 verbatim 149_HANDOVER Engine #7 Specialization lines 50-72 + Source 2 cristalizate CURRENT_STATE §RECENT 2026-05-05 birou late lines 557-579 + parity check ✅) + Source 3 ADR 029 STUB legacy precedent §9.3 + §9.5 stub pattern + cross-refs bidirectional ~12 ADR-uri
- **§9.6.1 Cluster A — I/O Contract & Pipeline Placement** (~5 decisions, line 1301): pure function evaluate(ctx) → SpecializationResult + pipeline §42.10 position 6th canonical (clarify ADR 029 "Engine #7" naming legacy chat strategic spec session ordering ULTIMUL prescriptive engine §36.100 100% milestone ≠ pipeline 6th) + activation gating LOCKED V1 strict (Marius Advanced AND lagging + Bulk/Recomp ONLY Q5=D Cut DISABLE + Q12 §45.3 Maria/Gigica NU eligible + Q13=A dual safety gate + 4-week mesocycle Q6=A) + Hook 1 input frozen Periodization read-only + 6-field output blueprint emit + engine purity preserved §1.10 anti-cascade
- **§9.6.2 Cluster B — Detection Logic + Reconciliation + Cooldown** (~7 decisions, line 1333): B1 Hibrid 1RM ratio<0.8 weaknessDetector reuse + visual/photo subjective override Q1=C SUFLET_ANDURA dual-source + B2 Consensus last-12-sessions + lifetime aggregate Q2=C anti-noise volatil + B3 Top-1 discipline V1 Q3=A simplicity + B4 Hibrid reconciliere engine objective + user adjusts CDL Q4=C Bugatti craft transparency + B5 Cooldown N=12 weeks same group anti-obsession Q10=B + B6 Hard reject 12 weeks cooldown anti-nagging Q16=A match Q10 + B7 Proposal mechanism Q15=B propose user accept/reject NU auto-activate
- **§9.6.3 Cluster C — Application Strategy + Volume/Frequency + Exit** (~5 decisions, line 1372): C1 Hibrid Volume + Frequency under MRV §42.9 invariant 1 immutable Q7=C + C2 Partial -25% reduction other groups maintenance Q8=B + C3 Fixed 4 weeks exit Q9=A simplicity + C4 "Bloc focus [Grupă]" Bugatti craft RO terminology Q17=C + C5 Volume/Frequency modifier targeting accumulation phases ONLY (per Q11=B PARALLEL modifier preserve §1.10 anti-cascade)
- **§9.6.4 Cluster D — Cross-Engine Integration** (~5 decisions, line 1404): D1 PARALLEL modifier Engine #1 Periodization NU REPLACE Q11=B + D2 Engine #4 Deload standard week 4 preserved non-negotiable Q12=A + D3 Cut DISABLE Q5+Q13 dual safety gate (Engine #2 Goal Adaptation phase) + D4 Injury weak group → auto-disable Safety Override §42.9 invariant 5 Q14=A (PainButton signal) + D5 Light coupling Engine #5 Energy + Engine #6 Tempo cross-engine context (consistent Q18=C silent telemetry pattern engines #5+#6)
- **§9.6.5 Cluster E — Edge Cases + Telemetry + V1.5+ Deferrals** (~5 decisions, line 1433): E1 WhyEngine integration silent + "De ce ăsta?" Q18=C engines #5+#6 consistent + E2 Q19=B push-back hibrid simulator + Beta cohort 50 testers ground truth (anti-overconfidence Mensa-grade) + E3 Bayesian latent state v1.5 ecosystem alignment Q20=D + E4 weaknessDetector.js orfan reuse §36.84 Gap #1 (zero new code engine logic, wiring detector → session builder action layer) + E5 Cut DISABLE recovery risk universal rationale (3-layer defense-in-depth Q5+Q13+Q14)
- **§9.6.6 Reconsideration Triggers** (line 1462) — 7 triggers documented (Q15 tier-aware T2+ auto-activate confidence threshold + Q19 hibrid simulator + Beta cohort post-Beta corroboration + Q9 adaptive early exit non-responders + Q14 alternative top-2 weak group fallback + Q3 Top-N parallel multi-weakness expansion + Bayesian latent state v1.5 ecosystem timing + activation gating Maria/Gigica eligibility post-Beta); re-evaluation cadence post-Beta
- **§9.6.7 Cross-refs Bidirectional ADR** (line 1484) — ADR 018/026/029/009/022/Pain Button/025/017/030 + HANDOVER_GLOBAL §36.84 Gap #1 + §45.2 Q10 + §45.3 Q12 + §9.1 Periodization PARALLEL modifier + §9.2 Goal Adaptation phase context + §9.3 Energy + §9.4 Bayesian + §9.5 Tempo + §9.7 Warm-up forward + §9.8 Deload Engine #4 Hook
- **Footer 🦫 marker** (line 1506) — compile timestamp 2026-05-06 afternoon chat-6 acasă + ZERO net new substantive + 28 cumulative decisions Cluster A-E (5+7+5+5+5+1 cross-cutting) + Pattern §9.1+§9.2+§9.3+§9.4+§9.5 honored Bugatti SSOT consistent + 2-way parity check ✅ + Source 3 ADR 029 stub flip recommend post-CC + weaknessDetector.js reuse note batch 6

**Decision count Cluster A-E sum check:** 5 (Cluster A) + 7 (Cluster B) + 5 (Cluster C) + 5 (Cluster D) + 5 (Cluster E) + 1 (cross-cutting weaknessDetector reuse note) = **28 cumulative decisions** ✅ within target 28-30.

### Build + Tests
- N/A spec compile only — zero src/ touched, ZERO regression possible
- Pre-commit hook ran `npm run test:run` → **2192 PASS / 0 FAIL** preserved exact (post Tempo V1 batch 5 baseline unchanged)

### Commits (1)
- `92a69fd` docs(adr-026): §9.6 Engine Specialization Module-Level Spec V1 compile — append §9.6.1-§9.6.7 post §9.5 Tempo (LOC 1282 → 1506, +224 LOC); ~28 decisions Cluster A-E verbatim aggregation chat strategic 2026-05-05 birou late sources (Q1-Q20 + cross-cutting note); 2-way parity check ✅ ZERO substantive divergence (149_HANDOVER Engine #7 Specialization lines 50-72 + CURRENT_STATE §RECENT lines 557-579); Source 3 ADR 029 STUB legacy NU disponibil (precedent §9.3 ADR 027 + §9.5 ADR 028 stub pattern); pipeline §42.10 position 6th canonical (NU "Engine #7" naming legacy ULTIMUL prescriptive engine §36.100); §9.6.1-§9.6.7 sub-sections complete; ADR 029 stub flip recommend post §9.6 LOCKED low priority post-CC; weaknessDetector.js orfan §36.84 Gap #1 reuse note pentru batch 6 V1 implement NEXT (zero new code engine logic); pattern §9.1+§9.2+§9.3+§9.4+§9.5 commits cd6d9a4+6be84f8+2f9aa79+685fdd4+a9b7cbd honored Bugatti SSOT consistent; cumulative LOCKED V1 ~659 PRESERVED unchanged

### Pushed
- origin/main: yes (`1401c54..92a69fd main -> main`)

### Issues
- **2-WAY verbatim parity check Source 1 ↔ Source 2: ✅ ZERO substantive divergence flagged** — 22 bullet decisions Q1-Q20 + cross-cutting note identical entre `149_HANDOVER` Engine #7 Specialization section lines 50-72 și `CURRENT_STATE` §RECENT 2026-05-05 birou late lines 557-579
- **ADR 029 stub flip recommendation post §9.6 LOCKED** — `03-decisions/029-engine-specialization.md` STUB legacy 83 LOC (`🟡 STUB / PENDING SPEC` per Vault Hygiene 2026-05-05 overnight CC TASK 4). Note: ADR 029 stub does include scope summary aggregating Q1-Q20 mirror Source 1 — but flagged STATUS = STUB / PENDING SPEC, NU SPEC READY V1 file flip. Post §9.6 LANDED → recommend separate task post-CC: ADR 029 stub flip → SPEC REFERENCE redirect §9.6 SSOT canonical (pattern ADR 027 + ADR 028 precedent §9.3 + §9.5 stub flip flow, low priority).
- **Pipeline canonical position 6th clarified header** — §9.6 main header + §9.6.1 Cluster A explicitly cite §42.10 position 6th canonical (post §9.5 Tempo 5th LANDED commit `a9b7cbd` precedent) + clarify ADR 029 "Engine #7" naming legacy chat strategic spec session ordering 2026-05-05 birou late (ULTIMUL prescriptive engine §36.100 100% milestone, 3-engine cluster #5+#6+#7) ≠ pipeline 6th canonical position. Anti-recurrence numbering ambiguity batches 7-8 references reinforced.
- **Decision count granularity 28 vs 22 Source 1 raw bullets** — Source 1 has 22 substantive bullets Q1-Q20 + cross-cutting note. Compile §9.6 sub-decomposes into 28 cumulative decisions across 5 clusters (5+7+5+5+5+1) per granularity match §9.5 Tempo precedent commit `a9b7cbd` (sub-decomposition pattern: each Q-decision rendered cu 1-2 sub-decisions reflecting cluster scope structure). Sum check ✅ within target 28-30.
- **LOC delta +224 slightly over target +180-220** — variance acceptable per scope decisions count (28 cumulative Cluster A-E + cross-refs bidirectional ~12 ADR-uri populated extensively + 7 Reconsideration Triggers documented detailed). Precedent comparison: §9.4 Bayesian +208 LOC + §9.5 Tempo +197 LOC.
- **weaknessDetector.js orfan §36.84 Gap #1 reuse note** — `src/engine/weaknessDetector.js` confirmed exists (orfan candidate identified pre-Faza 2.5). Engine #7 Specialization V1 implement batch 6 NEXT = wiring detector → session builder action layer (NU rewriting detection logic) per §36.84 Gap #1 + Source 1 line 117 + 587 ("the cleanest spec session pas 1 → fix Q19 → final"). NU implement code în compile commit (doc-only spec).
- **Cumulative LOCKED V1 ~659 PRESERVED unchanged** (compile aggregation only verbatim §9.6 spec, ZERO net new substantive decisions).
- **Pre-flight grep SOURCES 2-way + ADR 029 stub status verified ✅** — anti-Slip 2 source-of-truth + Slip 5 grep PATHS recidivă reinforced (memory rule `feedback_grep_before_prompt_cc.md` honored).

### Next action — chat NEW pickup priority

**P1.2.5 batch 6 Faza 2.5 Engine Specialization V1 implement** (NEXT chat strategic recomandat):
- Pre-compile §9.6 LANDED single source of truth canonical 28 decisions Cluster A-E verbatim (commit `92a69fd`)
- Pure-function module în `src/engine/specialization/` per ADR 018 §2 Standardized Contract + ADR 026 §9.6 spec
- Pattern Tempo V1 batch 5 (commit `d82d118`): ~7 source modules + ~5 test files
- **Critical scope note:** Engine #7 = wiring layer per §36.84 Gap #1 — `import weaknessDetector from '../weaknessDetector.js'` reuse zero new code engine logic. V1 implement focus = activation gating (Marius Advanced AND lagging + Bulk/Recomp ONLY) + Cluster B detection consume detector signal + Cluster C application strategy emit volume/frequency modifier signal + Cluster D cross-engine hooks (PARALLEL modifier Engine #1, Engine #4 Deload preserve, Cut DISABLE Q5+Q13, Injury auto-disable Q14, Light coupling #5+#6) + 6-field blueprint emit
- Estimate ~50-83 min real velocity X×3 rule precedent batches 1+2+3+4+5 actual reference (Engine #7 cleanest spec session per Source 1 — possibly faster execution if wiring layer scope minimizes complexity)

**Faza 2.5 batches 7-8 sequential per pipeline §42.10** (post Specialization V1 LANDED batch 6):
- Pre-implement compile §9.7 Warm-up + §9.8 Deload ADR 026 pattern Bugatti SSOT consistent §9.1+§9.2+§9.3+§9.4+§9.5+§9.6
- Pipeline §42.10 sequential canonical: Periodization → Goal Adaptation → **Energy** (3rd LANDED) → **Bayesian** (4th LANDED) → **Tempo** (5th LANDED batch 5) → **Specialization** (6th LANDED batch 6 NEXT) → **Warm-up** (7th) → **Deload** (8th — last gate Hook §9.1 Cluster 5 owns)

**ADR 027 + ADR 028 + ADR 029 stub flip task** (post §9.6 LOCKED + V1 LANDED, low priority post-CC):
- Redirect ADR 027 (Energy) + ADR 028 (Tempo) + ADR 029 (Specialization) STUB → SPEC REFERENCE → §9.3 + §9.5 + §9.6 single source of truth canonical (pattern follow-up Bugatti SSOT consolidation)

**Cumulative LOCKED V1 ~659 PRESERVED unchanged** — toate batch implements + §9.X compile aggregations = verbatim spec sources, ZERO net new substantive product/architecture cumulative.
