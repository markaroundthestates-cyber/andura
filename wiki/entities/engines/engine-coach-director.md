---
title: Engine Coach Director — Orchestrator Central Pipeline §42.10
type: entity-engine
status: landed
last_updated: 2026-05-13
cross_refs:
  - "[[../adrs/adr-026-offline-coaching-tree]]"
  - "[[../adrs/adr-024-goal-driven-program-templates]]"
  - "[[../adrs/adr-030-adapter-design-pattern]]"
  - "[[../adrs/adr-020-storage-tiering-strategy]]"
  - "[[../../concepts/calendar-feature-v1-spec]]"
  - "[[../../03-decisions/DECISION_LOG]] §2026-05-11 STAGE 4 SUB-BATCH 2"
  - "[[../../../src/engine/coachDirector.js]]"
amendments:
  - date: 2026-05-13
    note: buildSession() S2 path forward consume wv2-missing-equipment localStorage filter (Calendar V1 S1.7 LANDED missing equipment lifecycle) — pre-build filtrează exerciții care folosesc aparate marcate lipsa din lista, propune alternative parity equipment-swap logic fără user input. Multi-week constraint propagate Engine #1 Periodization mesocycle phase per clarification augmentat #4 LOCK 2026-05-12 Calendar Engine #2 Goal Adaptation NU săptămâna izolată
---

# Engine Coach Director — Orchestrator Central Pipeline §42.10

## Synthesis

**Coach Director = orchestrator central** consum `buildCoachContext()` + dispatch sequential la 8 prescriptive engines pipeline §42.10 (Periodization → Goal Adaptation → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload). Implementation `src/engine/coachDirector.js` clasa `CoachDirector` cu method principal `buildSession(sessionType)` invocat de UI după readiness input set. Coordinează: calibration tier detection (T0/T1/T2 per ADR 009) + patterns CDL gating (per calibration tier) + dimension registry plug-in additive (per ADR 018) + decision cluster trace (per ADR 030 §3) + auto-aggression dimension adapter legacy shape.

**3 methods NEW LANDED STAGE 4 SUB-BATCH 2 commit chain 2026-05-11** (`ebd656e + ce30efe + dab7247`):
1. `buildLightMobility()` — fallback session light mobility când recovery state insufficient pentru full workout (per ADR 031 Engine Warm-up & Mobility cross-engine hook)
2. `rebalanceWeekAfterSkip()` — săptămână re-distribute volume post-skip session (per ADR 024 phase auto-detection)
3. `generateSafeSessionForRestDay()` — minimal session structure pentru rest day override (anti-burnout cap)

Cross-ref Hexagonal foundation per ADR 030 D1-D5 LOCKED V1 — Coach Director = `src/coach/orchestrator/` core ports + adapters pattern (orchestrator commit `5a16550` Phase 1-2 LANDED).

**S2 path forward Calendar V1 wiring (mockup-only S1.0→S1.7 LANDED 2026-05-13, chat NEW dedicated):**
- `buildSession(sessionType)` MUST consume `wv2-missing-equipment` localStorage Tier 0 list (per ADR 020 §1.4 parity pattern) pre-build → filtrează exerciții care folosesc aparate marcate lipsa, propune alternative parity equipment-swap logic fără user input (Calendar S1.7 LANDED commit `de761f5` dedicated picker `screen-aparate-lipsa` + drill entries Cont/General + workout-preview "Nu am aparat" btn-ghost replace removed workout chip "Aparat lipsa")
- `goalAdaptation.recomputeWeekSchedule(selectedDays, currentMesocyclePhase, big6Priorities)` invocation post Save commit Calendar V1 (compositional re-programming preserving Big 6 + compound priorities NU simple shift)
- **Multi-week mesocycle phase constraint propagate downstream Engine #1 Periodization** per clarification augmentat #4 LOCK 2026-05-12 — Coach NU săptămâna izolată, week current adjustment = local layer, macro periodizare absoarbe impactul (recalibrare downstream weeks dacă necesar). Constraint Object immutable propagated per ADR 026 §1.10
- Mid-week edge case preserve trecut invariant + recompute rest J-D per Calendar spec clarification 2 LOCK 2026-05-12 ("zilele trecute raman bifate si se recalibreaza restul")
- `scheduleAdapter.js` NEW S2 — bridge Calendar `data-state` ↔ Coach Engine #2 Goal Adaptation `currentTemplate` ↔ Engine #1 Periodization mesocycle phase
- Tests new vitest cluster scheduleAdapter + missing equipment filter (80-120 estimated)

## Verbatim quotes Daniel

Daniel verbatim "vizor fără ușă" reframe LOCKED 2026-05-06 morning post audit engine wiring gap:
> *"vizor fără ușă — ADRs SPEC READY V1 ≠ engine wired în coach decision flow live. Engine wiring real (multi-batch CC pipeline §42.10 sequential 4-6 batches) = priority pivot post Adapter Design Pattern."*

Daniel verbatim §36.84 Gap #1 weaknessDetector orfan reuse rationale:
> *"weaknessDetector.js orfan — reuse Specialization Engine #7 PARALLEL modifier. Zero new code engine logic detection — pure session builder action layer reuse. Anti-duplication pattern."*

Daniel verbatim chat ACASĂ 2026-05-12 4-strategic LOCK Calendar V1 augmentat #4 Coach multi-week bigger picture (single message confirmation post 3 Q-uri eu surfaced):
> *"1. color only 2. zilele trecute raman bifate si se recalibreaza restul 3. ok. si vezi la 2, ca desi coach ii face antrenament pe saptamana, coach vede bigger picture nu doar o saptamana"*

Daniel verbatim chat ACASĂ 2026-05-12 S1.7 missing equipment lifecycle wiring path forward (post-port Coach Engine #2 buildSession consume filter):
> *"cand apesi pe el, coach sa se adapteze si sa tina minte in sesiunile viitoare ca nu ai aparatul ala... La cont trebuie o sectiune de aparate lipsa, unde sa apara tot ce ai selectat in trecut ca nu ai, si cu optiunea de edit, sa poti sa si scoti aparatele pe care anterior le-ai selectat ca nu e ai, in cazul in care acum le ai."*

## Bugatti framing notes

**Gigel test relevance:** Coach Director invisible la user — surface UI = workout recommendation single. Engine complexity orchestration hidden. Pattern: deterministic engine pipeline NU NLP/LLM runtime per CLAUDE.md §0 + SUFLET ANDURA §1.1.

**Quality > Speed via sequential pipeline §42.10:** 8 engines în ordering canonical preserves single source of truth phase auto-derived (Goal Adaptation Cluster 3) — downstream engines consume phase signal NU override. Constraint Object immutable propagated per ADR 026 §1.10.

**Anti-RE considerations:** 3 methods NEW STAGE 4 SUB-BATCH 2 LANDED filled engine gap-uri pre-port (anti-recurrence "engines spec dar nu wired în live flow" pattern Daniel push-back). Pattern: bridge spec → implementation via Coach Director method add. **Calendar V1 S1.7 anti-recurrence multi-week propagation** — Engine #2 Goal Adaptation NU săptămâna izolată (slip 5 chat-current ratat initial — Daniel verbatim correction *"coach ii face antrenament pe saptamana, coach vede bigger picture nu doar o saptamana"*). Constraint Object propagated downstream Engine #1 Periodization mesocycle phase. **Calendar V1 S1.7 anti-recurrence missing equipment lifecycle** — semantic state permanent picker delegate (NU workout chip transient) — `wv2-missing-equipment` localStorage parity equipment-swap logic distinct semantic ("Aparat ocupat" temporary vs "Aparat lipsa" permanent).

**Anti-paternalism notes:** Coach Director respects calibration tier (T0 conservative defaults / T1+ trust earned) + readiness input mandatory (NU silent default). User agency preserved via `requiresReadinessInput` gate (NU silent assumption).

**Voice tone notes:** Daniel-ism "vizor fără ușă" recurring metaphor (spec without implementation = useless). Pattern preserved cross-engine bridge work.

## Cross-refs raw layer

- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §1.10 Pipeline §42.10 + 8 engines ordering canonical + Constraint Object immutable propagated downstream
- [[../../../03-decisions/024-goal-driven-program-templates]] Engine #2 Goal Adaptation + phase auto-detection Q4 + Calendar V1 compositional re-programming `goalAdaptation.recomputeWeekSchedule()` invocation post Save
- [[../../../03-decisions/030-adapter-design-pattern]] D1-D5 LOCKED V1 Hexagonal foundation + ports/adapters
- [[../../../03-decisions/020-storage-tiering-strategy]] §1.4 Tier 0 active rolling (`wv2-missing-equipment` localStorage parity pattern S1.7 Calendar V1 missing equipment lifecycle picker permanent)
- [[../../../03-decisions/DECISION_LOG]] §2026-05-11 STAGE 4 SUB-BATCH 2 Coach Director +3 methods landed commits chain
- [[../../../04-architecture/mockups/andura-clasic.html]] §screen-aparate-lipsa NEW S1.7 + §workout-preview "Nu am aparat" btn-ghost NEW S1.7 + §calendar-week S1.0→S1.7 cumulative
- [[../../../src/engine/coachDirector.js]] (clasa CoachDirector + buildSession + 3 methods NEW + S2 path forward consume `wv2-missing-equipment` filter)
- [[../../../src/engine/coachContext.js]] (buildCoachContext input pipeline)
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.84 Gap #1 weaknessDetector orfan reuse Specialization
- [[../../../📥_inbox/HANDOVER_2026-05-13_CALENDAR_V1_S1_TO_S1_7_PLUS_STATUSLINE]] §1-§7 cumulative S1.0→S1.7 + path forward Slice 2 chat NEW dedicated `scheduleAdapter.js` engine + `buildSession()` consume `wv2-missing-equipment` filter + multi-week constraint propagate

🦫 **Engine Coach Director orchestrator central pipeline §42.10. 3 methods NEW LANDED STAGE 4 SUB-BATCH 2 commit chain `ebd656e`. Bridge spec → implementation pattern preserved cross-engine. S2 path forward Calendar V1 wiring: `buildSession()` consume `wv2-missing-equipment` filter + `goalAdaptation.recomputeWeekSchedule()` invocation post Save + multi-week mesocycle constraint propagate Engine #1 Periodization (clarification augmentat #4 LOCK 2026-05-12).**
