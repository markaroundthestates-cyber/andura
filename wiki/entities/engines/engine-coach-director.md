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
  - date: 2026-05-13b
    note: S2 Production Wiring LANDED chain 3 atomic commits clean (S2.A `7c2f520` scheduleAdapter UI-side adapter + S2.B `fce846a` coachContext integrate aparate-lipsa filter + calendar override + S2.C `a77587c` aparateLipsa.js page port + state.currentScreen enum extend) — Adapt + execute Co-CTO tactical decision Daniel verbatim *"asta e decizia ta nu a mea"* post CC pre-flight grep detected slip §AR.20 candidate spec PROMPT_CC referenced `goalAdaptation.recomputeWeekSchedule()` procedural method add violating ADR 026 §9 pure-function engines invariant. Option 1 reinterpret S2 plan UI-side adapter + buildCoachContext extend + engines UNCHANGED. ZERO engine module mutation. Engine pipeline §42.10 8 prescriptive engines pure-function discipline preserved invariant. `buildCoachContext()` extend prin `safeCtx.meta` defensive-read pattern absorb `wv2-missing-equipment` filter Tier 0 localStorage + `ctx.meta.calendarOverride` mid-week edit ephemeral propagate Big 6 invariant downstream Engine #2 Goal Adaptation absorbe Constraint Object immutable per ADR 026 §1.10. Tests 2914 → 2984 PASS (+70 net new) vitest cluster scheduleAdapter + coachContext aparate-lipsa filter + missing equipment auto-swap. Implementation distinct: `src/engine/scheduleAdapter.js` NEW UI-side pure-function adapter ADR 030 D2 thin scope + `src/engine/coachContext.js` extend SSOT merge + `src/ui/screens/aparateLipsa.js` NEW modal overlay parity src/ convention
---

# Engine Coach Director — Orchestrator Central Pipeline §42.10

## Synthesis

**Coach Director = orchestrator central** consum `buildCoachContext()` + dispatch sequential la 8 prescriptive engines pipeline §42.10 (Periodization → Goal Adaptation → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload). Implementation `src/engine/coachDirector.js` clasa `CoachDirector` cu method principal `buildSession(sessionType)` invocat de UI după readiness input set. Coordinează: calibration tier detection (T0/T1/T2 per ADR 009) + patterns CDL gating (per calibration tier) + dimension registry plug-in additive (per ADR 018) + decision cluster trace (per ADR 030 §3) + auto-aggression dimension adapter legacy shape.

**3 methods NEW LANDED STAGE 4 SUB-BATCH 2 commit chain 2026-05-11** (`ebd656e + ce30efe + dab7247`):
1. `buildLightMobility()` — fallback session light mobility când recovery state insufficient pentru full workout (per ADR 031 Engine Warm-up & Mobility cross-engine hook)
2. `rebalanceWeekAfterSkip()` — săptămână re-distribute volume post-skip session (per ADR 024 phase auto-detection)
3. `generateSafeSessionForRestDay()` — minimal session structure pentru rest day override (anti-burnout cap)

Cross-ref Hexagonal foundation per ADR 030 D1-D5 LOCKED V1 — Coach Director = `src/coach/orchestrator/` core ports + adapters pattern (orchestrator commit `5a16550` Phase 1-2 LANDED).

**S2 Production Wiring LANDED 2026-05-13b — 3 atomic commits clean adapt + execute Co-CTO tactical:**
- **`src/engine/scheduleAdapter.js` S2.A `7c2f520` NEW** — UI-side pure-function adapter ADR 030 D2 thin scope (NU engine module, NU side effects, NU Date.now/Math.random) cu funcții bridge Calendar `data-state` ↔ Coach Engine #2 Goal Adaptation `currentTemplate` ↔ Engine #1 Periodization mesocycle phase + missing equipment filter consume `wv2-missing-equipment` localStorage (per ADR 020 §1.4 Tier 0 parity pattern)
- **`src/engine/coachContext.js` S2.B `fce846a` extend** — SSOT merge `wv2-missing-equipment` Tier 0 filter prin `safeCtx.meta` defensive-read pattern (engines absorb context, NU mutate) + inject `ctx.meta.calendarOverride` Calendar mid-week edit ephemeral propagate Big 6 invariant downstream Engine #2 Goal Adaptation absorbe Constraint Object immutable per ADR 026 §1.10
- **`src/ui/screens/aparateLipsa.js` S2.C `a77587c` NEW** — modal overlay page src/ convention parity (post `state.currentScreen` enum extend + `goto('aparate-lipsa')` wrapper + hydrate post-render legacy RO normalize via `validIds` filter, mockup S1.7 `screen-aparate-lipsa` 10 echipamente standard gym toggle pattern parity onb-medical preserved EXACT)
- **ZERO engine module mutation** — Adapt + execute Co-CTO call Daniel verbatim *"asta e decizia ta nu a mea"* post CC pre-flight grep detected slip §AR.20 candidate (spec PROMPT_CC referenced `goalAdaptation.recomputeWeekSchedule()` procedural method add violating ADR 026 §9 pure-function engines invariant). Option 1 LOCKED reinterpret UI-side adapter + buildCoachContext extend, engines preserved pure-function discipline invariant
- **Tests 2914 → 2984 PASS (+70 net new)** vitest cluster scheduleAdapter + coachContext aparate-lipsa filter + missing equipment auto-swap

**S3 Path forward chat NEW recommended** (4 LOCKs strategic chat-current aligned post-handover):
- Drill destination wiring `Cont > General > Aparate lipsa` entry button (UI debifare-only restrânge bulk picker per missing equipment combo LOCKED V1) + `workout-preview` per-exercise inline button per fiecare exercițiu din lista preview + REMOVE S1.7 single button full-width preview (combo LOCKED V1 chat-current 2026-05-13b)
- Calendar UI commit handler: connect mockup pencil-tap → `commitCalendarEdit()` în actual src/ calendar rendering invocation post Save commit
- Session guard double-start Start Sesiune: check `state.activeSession` pre-Start → block + redirect direct sesiune curentă zero prompt Gigel-smooth (LOCKED V1 chat-current Sub-Q1 A)
- Bottom-nav hide-in-session: workout overlay z-index 7500 → HIDE bottom-nav cap-coadă cu CSS conditional `body.in-session` class toggle focus full-screen pur anti-missclick (LOCKED V1 chat-current Sub-Q2 A)
- P2 chat NEW dedicate alternative exhaustion + freeweight fallback smart-routing ADR amendment strategic engine pivot (Daniel verbatim *"vreau alternative pana la epuizare... daca continui sa iti dea un freeweight ceva"* anti-paternalism)

## Verbatim quotes Daniel

Daniel verbatim "vizor fără ușă" reframe LOCKED 2026-05-06 morning post audit engine wiring gap:
> *"vizor fără ușă — ADRs SPEC READY V1 ≠ engine wired în coach decision flow live. Engine wiring real (multi-batch CC pipeline §42.10 sequential 4-6 batches) = priority pivot post Adapter Design Pattern."*

Daniel verbatim §36.84 Gap #1 weaknessDetector orfan reuse rationale:
> *"weaknessDetector.js orfan — reuse Specialization Engine #7 PARALLEL modifier. Zero new code engine logic detection — pure session builder action layer reuse. Anti-duplication pattern."*

Daniel verbatim chat ACASĂ 2026-05-12 4-strategic LOCK Calendar V1 augmentat #4 Coach multi-week bigger picture (single message confirmation post 3 Q-uri eu surfaced):
> *"1. color only 2. zilele trecute raman bifate si se recalibreaza restul 3. ok. si vezi la 2, ca desi coach ii face antrenament pe saptamana, coach vede bigger picture nu doar o saptamana"*

Daniel verbatim chat ACASĂ 2026-05-12 S1.7 missing equipment lifecycle wiring path forward (post-port Coach Engine #2 buildSession consume filter):
> *"cand apesi pe el, coach sa se adapteze si sa tina minte in sesiunile viitoare ca nu ai aparatul ala... La cont trebuie o sectiune de aparate lipsa, unde sa apara tot ce ai selectat in trecut ca nu ai, si cu optiunea de edit, sa poti sa si scoti aparatele pe care anterior le-ai selectat ca nu e ai, in cazul in care acum le ai."*

Daniel verbatim chat ACASĂ 2026-05-13b S2 Adapt + execute Co-CTO tactical call post CC AskUserQuestion 3 options surface (Option 1 reinterpret S2 plan UI-side adapter + buildCoachContext extend + engines UNCHANGED preserve ADR 026 §9 pure-function invariant):
> *"asta e decizia ta nu a mea"*

## Bugatti framing notes

**Gigel test relevance:** Coach Director invisible la user — surface UI = workout recommendation single. Engine complexity orchestration hidden. Pattern: deterministic engine pipeline NU NLP/LLM runtime per CLAUDE.md §0 + SUFLET ANDURA §1.1.

**Quality > Speed via sequential pipeline §42.10:** 8 engines în ordering canonical preserves single source of truth phase auto-derived (Goal Adaptation Cluster 3) — downstream engines consume phase signal NU override. Constraint Object immutable propagated per ADR 026 §1.10.

**Anti-RE considerations:** 3 methods NEW STAGE 4 SUB-BATCH 2 LANDED filled engine gap-uri pre-port (anti-recurrence "engines spec dar nu wired în live flow" pattern Daniel push-back). Pattern: bridge spec → implementation via Coach Director method add. **Calendar V1 S1.7 anti-recurrence multi-week propagation** — Engine #2 Goal Adaptation NU săptămâna izolată (slip 5 chat-current ratat initial — Daniel verbatim correction *"coach ii face antrenament pe saptamana, coach vede bigger picture nu doar o saptamana"*). Constraint Object propagated downstream Engine #1 Periodization mesocycle phase. **Calendar V1 S1.7 anti-recurrence missing equipment lifecycle** — semantic state permanent picker delegate (NU workout chip transient) — `wv2-missing-equipment` localStorage parity equipment-swap logic distinct semantic ("Aparat ocupat" temporary vs "Aparat lipsa" permanent). **S2 Production Wiring 2026-05-13b anti-RE slip §AR.20 candidate strong (RECURRENCE post anti-recurrence chat trecut)** — spec PROMPT_CC src/ reference verify ADR primary citation MANDATORY ÎNAINTE spec generation touching engines. Eu trebuia să caut ADR 026 §9 pure-function engines invariant + ADR 026 §1.10 Constraint Object immutable + ADR 030 D2 thin scope ÎNAINTE scrie spec referenced `goalAdaptation.recomputeWeekSchedule()` procedural method add + multi-week constraint propagate via engine method calls. CC autonomous pre-flight grep filesystem detected divergence pe `safeCtx.meta` defensive-read pattern engines absorb context + AskUserQuestion 3 options surface → Daniel tactical call *"asta e decizia ta nu a mea"* Co-CTO decision → Option 1 LOCKED reinterpret UI-side adapter (ADR 030 D2 thin scope) + buildCoachContext extend + engines UNCHANGED. Pattern catch saved 70 tests + ZERO engine module mutation + ZERO HARD CONSTRAINT violation. §AR.20 codification candidate pending Daniel approval explicit chat NEW post-handover read.

**Anti-paternalism notes:** Coach Director respects calibration tier (T0 conservative defaults / T1+ trust earned) + readiness input mandatory (NU silent default). User agency preserved via `requiresReadinessInput` gate (NU silent assumption).

**Voice tone notes:** Daniel-ism "vizor fără ușă" recurring metaphor (spec without implementation = useless). Pattern preserved cross-engine bridge work.

## Cross-refs raw layer

- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §1.10 Pipeline §42.10 + 8 engines ordering canonical + Constraint Object immutable propagated downstream
- [[../../../03-decisions/024-goal-driven-program-templates]] Engine #2 Goal Adaptation + phase auto-detection Q4 + Calendar V1 compositional re-programming `goalAdaptation.recomputeWeekSchedule()` invocation post Save
- [[../../../03-decisions/030-adapter-design-pattern]] D1-D5 LOCKED V1 Hexagonal foundation + ports/adapters + D2 thin scope adapter pattern scheduleAdapter parity
- [[../../../03-decisions/020-storage-tiering-strategy]] §1.4 Tier 0 active rolling (`wv2-missing-equipment` localStorage parity pattern S1.7 Calendar V1 missing equipment lifecycle picker permanent)
- [[../../../03-decisions/DECISION_LOG]] §2026-05-11 STAGE 4 SUB-BATCH 2 Coach Director +3 methods landed commits chain
- [[../../../04-architecture/mockups/andura-clasic.html]] §screen-aparate-lipsa NEW S1.7 + §workout-preview "Nu am aparat" btn-ghost NEW S1.7 + §calendar-week S1.0→S1.7 cumulative
- [[../../../src/engine/coachDirector.js]] (clasa CoachDirector + buildSession + 3 methods NEW STAGE 4 SUB-BATCH 2)
- [[../../../src/engine/scheduleAdapter.js]] S2.A LANDED `7c2f520` NEW UI-side pure-function adapter ADR 030 D2 thin scope
- [[../../../src/engine/coachContext.js]] S2.B LANDED `fce846a` extend SSOT merge `wv2-missing-equipment` filter + `ctx.meta.calendarOverride` inject defensive-read pattern engines absorb
- [[../../../src/ui/screens/aparateLipsa.js]] S2.C LANDED `a77587c` NEW modal overlay page port + `state.currentScreen` enum extend
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.84 Gap #1 weaknessDetector orfan reuse Specialization
- [[../../../📥_inbox/HANDOVER_2026-05-13_chat_acasa_post_s2_landed_strategic_findings]] §1-§13 handover narrative chat-current S2 LANDED + 4 strategic LOCKs + 3 slips + 9 daniel-isms (handover-ingest distribute 2026-05-13b)
- [[../../../📤_outbox/LATEST]] Calendar V1 S2 Production Wiring raport §0-§11 LANDED 3 commits chain (predecessor LATEST cycle via current handover-ingest)
- [[../../../📤_outbox/_archive/2026-05/448_LATEST_PREVIOUS_WIKI_INGEST_2026_05_13_CALENDAR_V1_S1_TO_S1_7_CONSUMED]] (S1.7 wiki-ingest LANDED archive predecessor)

🦫 **Engine Coach Director orchestrator central pipeline §42.10. 3 methods NEW LANDED STAGE 4 SUB-BATCH 2 commit chain `ebd656e`. Bridge spec → implementation pattern preserved cross-engine. S2 Production Wiring LANDED 2026-05-13b chain 3 atomic commits clean (S2.A `7c2f520` scheduleAdapter UI-side adapter + S2.B `fce846a` coachContext integrate aparate-lipsa filter + calendar override + S2.C `a77587c` aparateLipsa.js page port) — Adapt + execute Co-CTO tactical decision Daniel verbatim *"asta e decizia ta nu a mea"* post CC pre-flight grep detected slip §AR.20 candidate spec PROMPT_CC violating ADR 026 §9 pure-function engines invariant. Option 1 LOCKED reinterpret UI-side adapter + buildCoachContext extend + engines UNCHANGED. ZERO engine module mutation. Tests 2914 → 2984 PASS (+70 net new).**
