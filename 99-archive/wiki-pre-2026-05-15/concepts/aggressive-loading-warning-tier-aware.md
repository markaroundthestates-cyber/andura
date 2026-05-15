---
title: Aggressive Loading Warning Tier-Aware (ADR_BIAS_DETECTION_OBSERVABLE §EXT-2 LOCK V1 2026-05-14)
type: concept
status: locked-v1
locked_date: 2026-05-14
authority: Daniel CEO push-back productive catalysator design chat birou → acasă 2026-05-14 LOCK 9 product safety condition NEW — tier-aware threshold dynamic + behavior pre-set modal observable + CDL log + engine learning accelerated T0/T1
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[pre-beta-full-scope-lock-v2]]"
  - "[[medical-safety-disclaimer-t-c-mandatory]]"
  - "[[kcal-floor-1200-engine-filter]]"
  - "[[../entities/adrs/adr-013-auto-aggression-detection]]"
  - "[[../entities/adrs/adr-009-calibration-tiers]]"
  - "[[../entities/adrs/adr-003-double-progression-engine]]"
  - "[[../entities/adrs/adr-017-demographic-prior-database]]"
  - "[[../summaries/handover-2026-05-14-chat-birou-acasa-pre-beta-full-scope-lock-v2-plus-safety-disclaimer-t-c-plus-kcal-floor-plus-aggressive-loading-locked]]"
amendments:
  - date: 2026-05-15-chat-current-followup
    type: implementation-landed
    note: |
      LOCK 9 implementation LANDED chat-current 2026-05-15 followup double-commit cumulative pre-Beta:
      - **LOCK 9 Aggressive Loading Tier-Aware Warning DETECTION LANDED** commit `e44137f` — 4 modules NEW pure-function (`src/engine/aggressiveLoadingThreshold.js` + `src/pages/coach/aggressiveLoadingModal.js` + `src/pages/coach/session.js` handler wiring + CDL log `'aggressive-loading-log'` dedicated key Pain Button precedent pattern). Tests 3525 → 3594 PASS (+69 NEW). Architectural choice: Option B compose layer wrap preserve DP pure; ZERO mutation engine detection algorithm; user-override forensic flags 2-stage logging (edit-time + enrichment post-set).
      - **LOCK 9 LOOP CLOSE Accelerated Learning Wired Into Engine LANDED** commit `892ebca` — closed end-to-end loop "engine I'm wrong se vindeca in 2-3 sesiuni" promise FULFILLED. `src/engine/acceleratedLearningAdapter.js` NEW + `computeEngineTierWithAccelerated` NEW + wired into `_recommendForUser` 4 user-facing sites in `src/pages/coach/logging.js`. Tests 3594 → 3639 PASS (+45 NEW). Compose pipeline: DP → AA → AcceleratedLearning → (MMI later via LOCK 10 LAST chat-current followup).
      - **Forensic flags catalog `_acceleratedLearningApplied` + `_originalKg` + `_upgradePct` + `_samplesUsed` emit per recommendation object** — audit trail visible pre-execute set per ADR 011 §append-only invariant.
      - **Compose pipeline order chat-current followup cumulative cross-LOCK:** `DP.recommend → AA.applyTo → applyAcceleratedLearningUpgrade (LOCK 9 LOOP CLOSE) → applyMuscleMemoryUpgrade (LOCK 10 LAST per chat-current followup)`.
      - **Display-only sites left baseline minimum surface Bugatti:** `renderIdle/workout/restTimer` NU touched — minimum surface principle preserved invariant.
      - **Backlog wording post-smoke potential review:** `aggressiveLoadingModal.js` wording Romanian no-diacritics pending tactical audit cross-link [[wording-backlog-post-smoke]] entry B4 potential.
---

# Aggressive Loading Warning Tier-Aware

## Synthesis

**Aggressive Loading Warning ADR_BIAS_DETECTION_OBSERVABLE_v1 §EXT-2 NEW LOCK V1 2026-05-14** = tier-aware threshold dynamic per exercise type + behavior pre-set modal observable la edit greutate ÎNAINTE confirmare set + CDL log silent forensic + engine learning accelerated T0/T1 calibration tier advance accelerated. Cross-link 3 patterns observable behavioral safety V1 = Volume Creep (§36.18) + Auto-pedeapsă (§36.19) + AGGRESSIVE_LOADING §EXT-2 NEW.

**Why:** Daniel push-back productive MAJOR catalysator design verbatim *"vezi ca exista posibilitatea si ca chiar sa fie cu 20% mai mult real... poate engine nu s-a adaptat ok la onboarding"* — point excellent că engine T0 calibration poate fi OFF (user intermediate declared beginner, Demographic Prior cold-start atipic, etc). Naive static +20%/+50% threshold ar fi false positive rate mare T0 users underestimated la onboarding. Tier-aware threshold dynamic = engine confidence-aware: low confidence → tolerate deviații mari; high confidence → flag aggressive justified.

**How to apply:**

**Tier-aware threshold dynamic per exercise type:**
- **T0 (0-30 zile calibrare):** Compound +50% / Isolation +100% — engine confidence low, tolerate deviații mari
- **T1 (30-90 zile active):** Compound +30% / Isolation +75% — engine still learning
- **T2/T3 (90+ zile mature):** Compound +20% / Isolation +50% — engine confident, flag aggressive justified

**Behavior pre-set (la edit greutate ÎNAINTE confirmare set):**

Modal observable + wording adapt pe tier:
- **T0/T1 wording:** *"Suntem încă în calibrare — recomandarea poate fi conservativă vs realitatea ta. Ai introdus X kg. Confirmă greutatea cu care te simți pregătit"*
- **T2/T3 wording:** *"Ai introdus X kg. Recomandarea pentru azi era Y kg (+Z%). Confirmă dacă te simți pregătit sau revino la baseline"*

Override 1-tap [Continui cu greutatea introdusă] / [Revin la baseline] — **NO forced typing per ADR 013 §AMENDMENT 2026-04-30 invariant preserved**. Pattern identic cu ADR 013 EXT-1 Pain Button Override CDL log infrastructure existing.

**CDL log silent type `user_override_weight_high`:**

Payload:
```json
{
  "exerciseId": "<id>",
  "recommended": <kg>,
  "actual": <kg>,
  "deviation_pct": <number>,
  "tier": "T0|T1|T2|T3",
  "repsAchieved": <number>,
  "RPE": <1-10>,
  "timestamp": "<ISO8601>"
}
```

**Engine learning accelerated T0/T1:**
Pattern user override aggressive + reps achieved 100% + RPE acceptable ≤8 + **2 sesiuni consecutive same exercise** = engine UPGRADE baseline recommendation cu deviation magnitude observed + trigger T0→T1 calibration tier advance accelerated dacă pattern persists peste 3 exerciții diferite.

Integrare ADR 009 Calibration Tiers §AMENDMENT 2026-05-05 Convergence Guard "T2 Unlock" mechanism + ADR 003 Double Progression Engine increment per session — Aggressive Loading override CDL log = INPUT signal nou pentru această infrastructură existing, NU engine separat. So engine "I'm wrong" se vindecă în 2-3 sesiuni, NU user paternal stuck pe recomandare conservativă greșită.

## Verbatim quotes Daniel

Daniel verbatim chat birou → acasă 2026-05-14 LOCK 9 push-back productive MAJOR catalysator tier-aware design:
> *"vezi ca exista posibilitatea si ca chiar sa fie cu 20% mai mult real... poate engine nu s-a adaptat ok la onboarding"*

Daniel verbatim chat birou → acasă 2026-05-14 LOCK 8 + LOCK 9 initiation 2 safety conditions catalysator:
> *"Bun mai e ceva. Punem simplu si urmatoarele conditii"* (initiation 2 safety conditions LOCK V1 — LOCK 8 Kcal Floor 1200 + LOCK 9 Aggressive Loading Warning)

Daniel-ism cross-cluster cooperative push-back productive design pattern verbatim 2026-05-14:
> *"poate engine nu s-a adaptat ok la onboarding"* (Daniel CEO point excellent design feedback ANSWER engine confidence-aware tier-aware threshold NU naive static — push-back productive catalysator design tier-aware threshold dynamic per exercise type)

## Bugatti framing notes

### Quality > Speed (Tier-aware design Bugatti craft NU naive static)
Daniel push-back productive MAJOR catalysator tier-aware threshold dynamic design Bugatti craft NU naive static +20%/+50%. T0 confidence low → tolerate deviații mari (+50%/+100%); T2/T3 confidence high → flag aggressive justified (+20%/+50%). Engine "I'm wrong" se vindecă în 2-3 sesiuni accelerated learning = Bugatti pur NU user paternal stuck pe recomandare conservativă greșită. Cross-link Bugatti FULL QUALITY no EXCUSES Daniel CEO directive 13j LOCK reinforced — tier-aware design = manifestation directă paradigm "Refactor later NEVER happens" preserved invariant.

### Anti-acoperiș-pereți
LOCK 9 implementation pre-Beta core scope (LOCK 1 directive "totul pre-Beta") — Aggressive Loading override CDL log = INPUT signal nou pentru infrastructură existing (ADR 009 Calibration Tiers §AMENDMENT 2026-05-05 Convergence Guard T2 Unlock + ADR 003 Double Progression Engine increment per session), NU engine separat. Anti-acoperiș-pereți filter validates reuse infrastructură existing NU layer engine nou.

### Anti-RE considerations
Override 1-tap [Continui cu greutatea introdusă] / [Revin la baseline] — **NO forced typing per ADR 013 §AMENDMENT 2026-04-30 invariant preserved**. Anti-RE protection categorical preserved cross-link Anti-RE rule LOCKED V1 PERMANENT scope universal — force-typing ELIMINATED PERMANENT 2026-04-30 amendment ADR 013 invariant. Pattern identic cu ADR 013 EXT-1 Pain Button Override CDL log infrastructure (NU layer nou).

### Anti-paternalism
NU restricționează autonomy user (override 1-tap permitido) + informează scientific anchored (modal observable + wording adapt pe tier). Pattern: warning observable + override 1-tap, NU restrict user autonomy. Engine learning accelerated T0/T1 = engine "I'm wrong" se vindecă în 2-3 sesiuni, NU user paternal stuck pe recomandare conservativă greșită = anti-paternalism ABSOLUTE strategy preserved cross-link Medical Safety Disclaimer paradigm (LOCK 4) + Sufletul Andura F2 "AI-ul informează NU impune" invariant.

### Voice tone notes — Bugatti craft framing
Wording adapt pe tier (T0/T1 calibrare honest acknowledgment vs T2/T3 confidence-based comparison) + Romanian-first + Gigel-friendly default cross-link [[gigel-test]] paradigm Marius la sala accesibil. CDL log silent forensic NU paranoid surveillance Gigel-suspect — payload structured technical pattern Andura coach intelligence NU spy. Cross-link 3 patterns observable behavioral safety V1 = Volume Creep + Auto-pedeapsă + AGGRESSIVE_LOADING NEW = behavioral pattern recognition core Bugatti differentiator pre-Beta core feature.

## Cross-refs raw layer

- [[../../03-decisions/ADR_BIAS_DETECTION_OBSERVABLE_v1]] §EXT-2 NEW Aggressive Loading append — tier-aware threshold dynamic + behavior pre-set modal observable + CDL log + engine learning accelerated (LOCK 9 implementation pre-Beta core scope chat-current 2026-05-14)
- [[../../03-decisions/013-auto-aggression-detection]] §AMENDMENT 2026-04-30 — Force-typing ELIMINATED PERMANENT anti-paternalism ABSOLUTE preserved invariant + EXT-1 Pain Button Override CDL log infrastructure precedent identic pattern + behavioral safety AA Detection KEEP CORE pre-Beta (LOCK 7 chat-current)
- [[../../03-decisions/009-calibration-tiers]] §AMENDMENT 2026-05-05 Convergence Guard "T2 Unlock" mechanism — engine learning accelerated T0/T1 calibration tier advance trigger Aggressive Loading override CDL feed
- [[../../03-decisions/003-double-progression-engine]] — increment per session signals Aggressive Loading override CDL feed cross-link existing infrastructure (NU engine separat)
- [[../../03-decisions/017-demographic-prior-database]] — baseline cold-start age-aware/experience-aware Anti-recommendation invariant preserved cross-link engine T0 calibration confidence concern (LOCK 6 cascade)
- [[../../03-decisions/011-coach-decision-log-architecture]] — CDL append-only persistent + §AMENDMENT 2026-05-08 pipeline_event schema infrastructure preserved invariant
- [[../../📤_outbox/_archive/2026-05/490_HANDOVER_2026-05-14_pre_beta_full_scope_safety_locks_CONSUMED]] handover source archived chat-current LOCK V1 directive
