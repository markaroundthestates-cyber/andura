# ADR 026 — Andura Offline Coaching Decision Tree Exhaustive

**Status:** 🟡 **CANDIDATE / STUB** (file create per Vault Hygiene Sprint Faza 3, 2026-05-04 — full spec PENDING dedicated chat strategic NEW post Auth Flow §36.80 + 7 engines spec)
**Date:** 2026-05-04 (stub creation per §36.99 ADR 026 candidate decision + §36.95 ADR Numbering Additive)
**See also:** [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.99 (ADR 026 candidate decision wording verbatim) + §36.100 (7 Engines Prescriptive NEW roadmap) + §36.105 (Pivot "More Engine Less LLM Runtime") + [[023-llm-intent-interpretation]] (LLM scope strict preserved) + [[018-engine-extensibility-architecture]] (Dimension Registry foundation) + [[025-andura-gandeste-pentru-user]] (graceful degradation per branch)

---

## ⚠️ STATUS — CANDIDATE

**Acest stub = placeholder pentru spec full PENDING.** §36.99 a LOCKED candidate V1 cu paritate target ~90-95% pe input structurat tipic Maria/Gigica/Marius. Full spec generation = chat strategic dedicat NEW post Vault Hygiene + Auth Flow §36.80 + 7 engines spec ordering decision.

**Status: PRE-BETA BLOCKER** per §36.57 Prebeta Scope Rule (coach intelligence core = mandatory pre-Beta non-negotiable).

---

## Decision wording verbatim (per §36.99)

> **"Andura V1 Beta = offline pure coaching pe input structurat. Decision tree exhaustiv 1500-2000 ramuri pre-mapped de Claude (chat strategic) implementate de CC Opus în engine modules. Paritate target ~90-95% cu Claude pe input structurat tipic Maria/Gigica/Marius. ZERO LLM runtime pentru core coaching paths. ADR 023 LLM scope strict (Pain text + Equipment text) PRESERVED unchanged. Aplicabilitate: pre-Beta blocker per §36.57 Prebeta Scope Rule (coach intelligence core = mandatory prebeta non-negotiable)."**

---

## Scope summary (stub level)

**Decision domain:** Decision tree exhaustiv pre-mapped (1500-2000 ramuri) pentru coaching core paths offline, ZERO LLM runtime, ZERO API call core engine. Implementat în engine modules per ADR 018 plug-in pattern.

**Paritate target detail:**

| Input type | Paritate vs Claude | Note |
|------------|---------------------|------|
| Input pur structurat (vârstă/kg/BF%/PRs/equipment/schedule/history/recovery markers) | ~90-95% | Maria/Gigica/Marius tipic |
| Combinații rare multidimensionale (67 ani + post-COVID + ankle limitat + diabet) | ~60-70% | Edge cases Jeff oricum NU gestionează |
| Language ambiguous text input | ~40-60% | NU în scope offline — fallback ADR 023 LLM scope strict |

**5-10% degradare grațioasă** pe combinații rare cu twist multidimensional unde Claude face inference probabilistic cross-domain. Decision tree degradează la "best fit branch" cu output decent dar sub-optimal vs Claude. **Acceptabil** pentru că restul 5-10% reprezintă scenarii pe care Jeff NU le gestionează deloc.

**Aliniat ADR 023 (NU contradicție):**
- ADR 023 LLM intent acoperă **interpretation language ambiguous** (Pain text + Equipment text) — Tier 1 + Tier 2
- ADR 026 offline tree acoperă **reasoning structurat coaching** (volume, intensity, periodization, deload, substitution, nutrition)
- Hybrid clean: input STRUCTURAT (forms, buttons, sliders) → decision tree offline + input AMBIGUOUS (free-text Pain/Equipment) → LLM intent classification scope strict + coaching reasoning = offline pure deterministic

**Cost zero scale:** 50 useri × 4 sesiuni × ZERO LLM call core = €0/lună core coaching (vs ADR 023 scope strict ~0.4% Groq free tier pentru Pain/Equipment text doar).

---

## Engines coverage (per §36.100 — 7 prescriptive NEW + 14 reactive existing)

**14 reactive engines existing (preserved unchanged):** dp / aa / ruleEngine / alternativeEngine / patternLearning / adherence / calibration / weaknessDetector / stagnationDetector / predictionEngine / plateauInterventions / proactiveEngine / whyEngine / sessionBuilder.

**7 prescriptive engines NEW (roadmap pre-Beta per §36.100) — status post 2026-05-05 birou after:**
1. ✅ Periodization Engine SPEC COMPLETE (~32 decisions, 2026-05-04 evening late)
2. ✅ Goal Adaptation Engine SPEC COMPLETE (~30 decisions, 2026-05-04 evening late) ([[024-goal-driven-program-templates]])
3. ✅ Bayesian Nutrition Engine SPEC COMPLETE (~32-35 decisions Cluster A-E, 2026-05-05 birou after) ([[022-bayesian-nutrition-inference]] SPEC READY V1) — Convergence Guard "T2 Unlock" architectural extension cross-cutting [[009-calibration-tiers]] §AMENDMENT 2026-05-05 birou after
4. ✅ Deload Protocol Engine SPEC COMPLETE (~30-32 decisions, 2026-05-05 birou after)
5. ✅ Energy Adjustment Engine SPEC COMPLETE (~28-30 decisions, 2026-05-05 birou after)
6. ⏳ Tempo/Form Cues Engine PENDING (chat NEW dedicated, ~30 decisions estimate)
7. ⏳ Specialization Engine PENDING (chat NEW dedicated, ~30 decisions estimate)

**Cumulative engines spec decisions consumate ~155 (post 5/7 SPEC COMPLETE):** Periodization ~32 + Goal Adaptation ~30 + Bayesian Nutrition ~32-35 + Deload ~30-32 + Energy ~28-30 ≈ ~152-159 cumulative cross-engine integrations + Convergence Guard "T2 Unlock" cross-cutting ADR 009 amendment. Aceste decisions sunt **engine spec-uri**, NU branches enumeration ADR 026 (1500-2000 ramuri pre-mapped tree separate scope).

**Total = 21 engines** post 7-engine roadmap implementation. Decision tree branches consume engine outputs prin Dimension Registry ADR 018.

---

## Open Questions (PENDING chat strategic NEW)

1. **Branch enumeration methodology:** Claude generates 1500-2000 branches in chat strategic — input format YAML / JSON / Markdown decision-tree format / pseudo-code? Validation methodology (peer review Daniel + auto-test fixtures)?
2. **Coverage matrix:** all combinations Maria/Gigica/Marius × {goals × experience × equipment × schedule × history × recovery markers} = how many branches per persona pre-coverage threshold?
3. **Branch fallback chain:** when input doesn't match any branch exact → "best fit" similarity ranking → degraded output. Algorithmic similarity metric?
4. **Engine integration topology:** decision tree at top-level, engines as leaves contributing verdicts? Or engines first-class, tree as orchestration layer?
5. **CDL audit trail:** each branch traversal logged in CDL? Schema extension `decision_tree_metadata` (branch_id + match_confidence + fallback_used)?
6. **Update cadence (per §36.103 Knowledge cadence):** tree updates quarterly cu meta-analyses noi? Bi-annual? Annual? Versioning schema?
7. **Test suite:** Golden Master tests pentru decision tree (input fixture → expected branch → expected output)? Coverage target % branches tested?
8. **Performance budget:** decision tree traversal < N ms per session build? CPU budget per session × scale projection (500 users V1 → 5000 V2)?
9. **i18n localization:** decision tree text outputs RO + EN? Wording Phase A/B/C extension? §22 F-NEW LOCKED V1 OBLIGATORIU regula UI Default RO + Toggle EN OFF aliniere.
10. **Versioning + rollback:** Feature Flags rollout per §36.103? 10%/50%/100% gradual? CDL post-deployment metrics check?

---

## Cross-references

- [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §36.99 (ADR 026 candidate decision) + §36.100 (7 Engines roadmap) + §36.101 (5 voices CONFIRMED) + §36.102 (Goal lifecycle first-class) + §36.103 (Knowledge cadence) + §36.105 (Pivot reconfirmed)
- [[023-llm-intent-interpretation]] (LLM scope strict preserved — NU contradicție)
- [[018-engine-extensibility-architecture]] (Dimension Registry plug-in foundation — engines speak through voices)
- [[022-bayesian-nutrition-inference]] (Engine #3 cross-engine integration)
- [[024-goal-driven-program-templates]] (Engine #2 cross-engine integration)
- [[025-andura-gandeste-pentru-user]] (graceful degradation per branch)
- [[../01-vision/SUFLET_ANDURA|SUFLET ANDURA]] §1.1 (~75% replicabil V1 engine deterministic — F1 Triangulation + F2 Bias + F3+F4 Mode UI + F5 Push-back proporțional + F6 Adaptive output no inference = enumerable principles)
- [[../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE_SPEC]] Q4 ZERO LLM runtime original intent honored core paths

---

🦫 **Stub created Faza 3. Candidate status preserved (LOCKED V1 candidate — file PENDING full spec). PRE-BETA BLOCKER per §36.57 Prebeta Scope Rule. ZERO fabrication. Bugatti paradigm: peak craft, ZERO compromise, "more engine, less LLM runtime" pivot reconfirmed. Andura gândește pentru user offline pure pe input structurat.**
