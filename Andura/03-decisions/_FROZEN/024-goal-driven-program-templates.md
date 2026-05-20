# ADR 024 — Goal-Driven Program Templates

**Status:** 🟢 **SPEC READY V1 — COMPILE DRAFT FULL** (compiled 2026-05-06 morning acasă from §26 base + chat strategic 2026-05-04 evening late Goal Adaptation Engine #2 spec ~30 decisions + chat strategic 2026-05-06 morning acasă Q6 LOCK V1 D Hybrid sources)
**Date:** 2026-05-04 stub creation (Vault Hygiene Sprint Faza 3) → 2026-05-04 evening late Q1-Q5 + Q7-Q8 LOCKED V1 (chat strategic Periodization + Goal Adaptation engines spec) → 2026-05-06 morning acasă Q6 LOCKED V1 D Hybrid → compile draft full 2026-05-06 morning acasă (CC tactical task)
**Cumulative LOCKED:** Q1-Q8 toate RESOLVED LOCKED V1 (8 OpenQ stub → SPEC READY V1 file flip; ~30 substantive Goal Adaptation Engine #2 decisions aggregate from §26 + Cluster 1-5 evening late + Q6 D Hybrid morning).
**See also:** [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §26 (Goal-ca-setting + 8 templates V1 LOCKED 2026-05-01 evening) + §26.5 (Re-prompt 4-6 săpt) + §36.35 (Goal Shift Event Handler V1) + §36.92 D4 (Goal Taxonomy hybrid C) + §36.95 (ADR Numbering Additive split) + §36.100 Engine #2 Goal Adaptation + §36.102 (Goal lifecycle first-class) | [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline §42.10 (Periodization → Goal Adaptation → Energy → Bayesian → Tempo → Specialization → Warm-up → Deload) | [[018-engine-extensibility-architecture|ADR 018]] Dimension Registry — Goal Adaptation Engine = new dimension via Constraint Object | [[022-bayesian-nutrition-inference|ADR 022]] cross-engine integration kcal differential per goal phase | [[025-andura-gandeste-pentru-user|ADR 025]] graceful degradation engine pre-fills default | [[027-engine-energy-adjustment|ADR 027]] Engine #5 Energy Adjustment (session-level only, NU touch phase) | [[028-engine-tempo-form-cues|ADR 028]] Engine #6 Tempo Form Cues (light coupling) | [[029-engine-specialization|ADR 029]] Engine #7 Specialization (light coupling) | [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard T2 Unlock | [[ADR_OUTLIER_FILTER_v1]] §EXT-1 Streak Counter Same Direction + §EXT-2 Goal Shift Event Handler Streak Reset + Conversion Interval | [[017-demographic-prior-database|ADR 017]] anchor personas Maria/Gigica/Marius for template-persona fit testing | [[../01-vision/PRODUCT_STRATEGY_SPEC_v1|PRODUCT_STRATEGY_SPEC]] (templates as core product features) | [[../04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1|COGNITIVE_ARCHITECTURE_SPEC]] (PROJECTION voice + ARBITRATOR consume goal-template signals)

---

## Status Summary

Goal-Driven Program Templates Engine #2 (Goal Adaptation) spec ready production V1. **Decision domain:** Differential logic CUT / BULK / MAINTAIN / RECOMP applied la 5 program templates V1 cu modifiers per goal × experience × frequency × age × phase. Engine = pure function `goalAdaptationEngine.evaluate(ctx) → GoalAdaptationResult` extending DimensionResult per ADR 018 Dimension Registry.

**Provenance chain Q1-Q8 LOCKED V1:**

1. **§26 base (2026-05-01 evening, HANDOVER_GLOBAL):** Goal-ca-setting + 5 templates V1 enumerare (Forță & Dezvoltare / Tonifiere & Definire / Slăbire / Longevitate / Sănătate Generală) + Re-prompt §26.5 4-6 săpt + §36.35 Goal Shift Event Handler V1 + §36.92 D4 Goal Taxonomy hybrid C
2. **2026-05-04 evening late chat strategic acasă (handover archive `142_HANDOVER_2026-05-04_evening_late_periodization_goal_adaptation_CONSUMED.md`):** Goal Adaptation Engine #2 spec COMPLETE Cluster 1-5 ~30 decisions cumulative — Q1-Q5 + Q7-Q8 RESOLVED. Q6 calibration tier post-shift PENDING explicit
3. **2026-05-06 morning acasă chat strategic (handover archive `177_HANDOVER_2026-05-06_morning_SMTP_COMPLETE_SETTINGS_UX_Q6_LOCK_CONSUMED.md`):** Q6 calibration tier post-shift LOCKED V1 D Hybrid (tier global preserve + template-specific signals soft-reset + 2-session calibration window + streak RESET + phase re-derive runtime). Reversibil amendment când useri reali post-Beta dau signal contradictoriu

**Architectural integration:** Goal Adaptation = 2nd engine în pipeline runtime per ADR 026 §42.10 sequential. Periodization (§1) generează coridor Floor + Ceiling baseline → Goal Adaptation (§2) redistribuie volume în interiorul coridorului per phase auto-detected, NU trece peste Ceiling NU sub Floor → Energy Adjustment (§3 / ADR 027) fluctuează ±15% session-level. Constraint Object immutable propagat per pipeline ADR 026.

---

## §1 Context

### §1.1 Pivot SUFLET F2 — "AI-ul informează, nu impune"

Goal-Driven Templates onorează SUFLET ANDURA F2 axis prin push-back proporțional cu risc — engine NU blochează absolute user choice (e.g., "Forță" picked dar BF% high + age 60+ + recent injury), ci aplică modificatori conservative + banner discret + opt-in modal blocking (Tier 3) doar la risc real cu cale escape. ZERO refuz absolute (preserved §36.99 ZERO LLM runtime core paths).

### §1.2 5 templates V1 LOCKED (per §26 + Cluster 2 evening late resolve)

1. **Forță & Dezvoltare** (compound focus, RIR 1-3, rep 3-8, rest 2-4 min)
2. **Tonifiere & Definire** (hibrid hipertrofie + cut emphasis, RIR 0-2, rep 8-12)
3. **Slăbire** (cut-focused, RIR 1-2, rep 10-15, conditioning add-on)
4. **Longevitate** (mobility + sustainable load, RIR 2-3, rep 8-12, recovery emphasis)
5. **Sănătate Generală** (balanced cu intensity controlled, RIR 2-3, rep 8-12, lifestyle integration)

**Mode modifier (Estetică ↔ Forță) cross-template overlay = 10 perceived configs UI dar 5 logic core.** Distincție RECOMP NU template separate — sub-phase auto-detected în Tonifiere/Slăbire (newbie effect / detrained return >6w / fat-rich profile first 12 weeks). UI shows MAINTAIN; distinction logged CDL only (per Cluster 2 evening late).

### §1.3 Big 6 lifecycle Imutabile/Editabile

Goal = setting strategic user (5 template choice, EDITABIL via Goal Shift §36.35 cu calibration cost). Phase = automated CUT/BULK/MAINTAIN/RECOMP sub-state (sys.js calculează BF% + sezon, IMUTABIL user — read-only). Mode = Estetică ↔ Forță sub-modificator (EDITABIL toggle UI fără calibration cost). Big 6 lifecycle first-class supported per §36.102.

### §1.4 Integration ADR 018 Dimension Registry plug-in

Goal Adaptation Engine = new dimension contributor via Dimension Registry. Output blueprint emit phase + kcal_target_delta_pct + macro_split + rep_range_modifier + rir_target_modifier + rest_time_modifier — verdictele agregate intră Arbitrator 5-level Precedence + 27 reguli unchanged (ZERO change Arbitrator, ZERO voce nouă, 5 voices LOCKED preserved per ADR 026 §1.3).

---

## §2 Decision Q1-Q8 verbatim LOCKED V1

### §2.1 Q1 — 5 vs 8 templates resolve (LOCKED V1 evening late 2026-05-04)

**Question (verbatim stub Open Questions §1):** *"§26 menționează '8 templates V1 LOCKED' dar enumerare clar = 5 (Forță / Tonifiere / Slăbire / Longevitate / Sănătate Generală). Verifică în chat NEW dacă există 3 sub-templates ascunse (e.g., Hibrid Estetică-Forță separate)?"*

**LOCKED choice:** **5 templates primary, NU 8.** "8 templates" în §26 = misnumber legacy; ADR 024 = source of truth canonical. Mode modifier (Estetică ↔ Forță) cross-template overlay = 10 perceived configs UI dar 5 logic core.

**Rationale Bugatti craft transparency:** SSOT consolidation — discrepanță legacy notation §26 ("8 templates") rezolvată în favor enumerare verbatim (Forță / Tonifiere / Slăbire / Longevitate / Sănătate Generală = 5). Mode overlay multiplicativ post-template×phase preserves UX flexibility ZERO logic duplication.

**Source:** Cluster 2 Goal Adaptation Engine #2 spec evening late 2026-05-04 (handover `142_*_CONSUMED.md` line 44).

### §2.2 Q2 — Template variant matrix algorithmic generation (LOCKED V1 evening late 2026-05-04)

**Question (verbatim stub §2):** *"Fiecare template × Experience tier (Beginner/Intermediate/Advanced) × Frequency (2-3-4-5x/săpt) × Age bracket (18-35/35-55/55+) = 5 × 3 × 4 × 3 = 180 combinații — toate generate algorithmic sau picked from curated subset?"*

**LOCKED choice:** **Algorithmic generation runtime — NU 180 hardcoded.** ~25 base config entries în `<engine-name>.tree.ts` data file (per ADR 026 §1.6 storage format) + modifiers permutation runtime per persona signals.

**Rationale Bugatti craft:** 180 hardcoded = ship NEVER + hallucination risk femeie 75+ Forță advanced ZERO literature. Algorithmic compose ~25 base × persona modifiers (Maria 0.50 / Gigica 0.70 / Marius 1.00 + 10-15% bonus dacă recovery green) × goal modifiers (Hipertrofie 1.00 / Forță 0.70 / Recompoziție 0.85 / Longevitate 0.60 / Sănătate Generală 0.50) preserves Bugatti craft *unde contează*, smart trade-offs unde NU. Cross-ref ADR 026 §1.2 granularitate Hybrid B+C.

**Source:** Cluster 2 + Cluster 3 Goal Adaptation evening late 2026-05-04 (handover `142_*_CONSUMED.md` line 44 + Volume Landmarks Cluster 3 Periodization §45.3 Q19 Maria 65 Dual-Layer functional → Israetel mapping).

### §2.3 Q3 — Cross-engine integration topology (LOCKED V1 evening late 2026-05-04)

**Question (verbatim stub §3):** *"Goal Adaptation Engine ↔ Bayesian Nutrition Engine ([[022-bayesian-nutrition-inference]]) ↔ Periodization Engine (§36.100 Engine #1) ↔ Specialization Engine (§36.100 Engine #7)?"*

**LOCKED choice:** **HYBRID per ADR 026 §1.10 pipeline §42.10 sequential.** Goal Adaptation = 2nd în pipeline. Cross-engine hooks:
- **Hook 1 → Engine #3 Bayesian Nutrition (ADR 022):** kcal/macro modulate, NU override phase
- **Hook 2 → Engine #1 Periodization (ADR 026 §1.10):** consume Constraint Object Floor/Ceiling Range — redistribuie volume în interiorul coridorului
- **Hook 3 → Engine #5 Energy Adjustment (ADR 027):** session-level fluctuație ±15% baseline coridorului, NU touch mesocycle phase
- **Hook 4 → Engine #6 Tempo (ADR 028) + #7 Specialization (ADR 029):** light coupling, modifiers post-template×phase

**Rationale:** Pipeline §42.10 ordering preserves single source of truth phase auto-derived (Goal Adaptation Cluster 3) — downstream engines consume phase signal, NU override.

**Source:** Cluster 1 Goal Adaptation I/O contract evening late 2026-05-04 + Cluster 5 Periodization Cross-engine hooks (handover `142_*_CONSUMED.md` line 39 + line 43).

### §2.4 Q4 — Cut-Bulk-Maintain phase transitions auto vs manual (LOCKED V1 evening late 2026-05-04)

**Question (verbatim stub §4):** *"Auto-detect via BF% + weight delta + sezon + adherence, sau user manual override? §36.102 confirmed lifecycle change first-class supported."*

**LOCKED choice:** **Phase auto-detection NU user pick.** Engine derives runtime din persona signals + goal + sezon. UI shows phase ca read-only status (consistency Big 6 lifecycle Imutabile category §1.3 above).

**Phase auto-detection thresholds (per Cluster 3 Goal Adaptation):**
- **CUT conservative:** TDEE × 0.82 baseline
- **CUT aggressive:** TDEE × 0.75 (Marius advanced 4-6 săpt max — anti-burnout cap)
- **BULK conservative:** TDEE × 1.08
- **BULK aggressive:** TDEE × 1.15 (newbie + Forță template combo)
- **MAINTAIN:** TDEE × 1.00
- **RECOMP:** TDEE ± 2% (newbie effect / detrained return >6w / fat-rich first 12 weeks)
- **DELOAD week override:** kcal +3-5% chiar dacă phase=CUT (recovery imperative)

**Macro split:** protein 1.6-2.2 g/kg LBM, fat 0.8-1.0 g/kg floor hormonal, carb remainder template-variable.

**Rationale:** Phase auto-detection prevents user gaming (e.g., aggressive CUT permanent) + preserves SUFLET F2 push-back proporțional. Lifecycle change per §36.102 first-class supported via Goal Shift Event Handler §36.35 (separate concern Q6).

**Source:** Cluster 3 Goal Adaptation nutrition logic phase auto-detection evening late 2026-05-04 (handover `142_*_CONSUMED.md` line 45).

### §2.5 Q5 — RECOMP scope (LOCKED V1 evening late 2026-05-04)

**Question (verbatim stub §5):** *"RECOMP = simultaneous cut+gain (newbie effect / detrained / fat-rich) — sub-state per goal sau separate template? Prevalence in Maria/Gigica/Marius personas?"*

**LOCKED choice:** **RECOMP NU template separate. Sub-phase auto-detected în Tonifiere/Slăbire** (newbie effect / detrained return >6w / fat-rich profile first 12 weeks). UI shows MAINTAIN; distinction CDL only.

**Rationale:** Adding 6th template "Recomp" creates user confusion + duplicates logic deja existent în Tonifiere phase=RECOMP sub-state. Prevalence: high în Maria 65 Dual-Layer functional + Gigica detrained return scenarios + Marius first 12 weeks newbie advanced trainee return — all 3 personas covered prin Tonifiere/Slăbire sub-phase logic.

**Source:** Cluster 2 Goal Adaptation evening late 2026-05-04 (handover `142_*_CONSUMED.md` line 44).

### §2.6 Q6 — Goal Shift conservare date / tier calibration post-shift (LOCKED V1 morning 2026-05-06 acasă)

**Question (verbatim stub §6):** *"PR records + CDL logs + istoric forță = INTACT post-shift confirmed §36.35. Cum e re-evaluat tier-ul calibration post-shift?"*

**LOCKED choice — D Hybrid:**

- **Tier global preserve** (recovery / vitality / stress / weakness map cross-template valid — biological signals NU schimbă cu Goal Shift)
- **Template-specific signals soft-reset** (rep progression / RIR matrix / rest time fresh — context fizic rep range schimbat = signal nou independent)
- **2-session calibration window** §EXT-2 LOCKED (consistent cu Goal Shift Event Handler ADR_OUTLIER_FILTER_v1 §EXT-2)
- **Streak counter RESET la 0** §36.26 + EXT-1 LOCKED (consistent cu rule "context fizic schimbat = signal nou independent" per ADR_OUTLIER_FILTER §EXT-1 + EXT-2)
- **Phase re-derive runtime** §36.35 LOCKED (auto-detection Q4 logic re-evaluated post-shift cu signals fresh)

**Rationale Bugatti reality check (Daniel push-back 2026-05-06 morning acasă):** Q6 = decizie arhitecturală future-proofing post-Beta useri reali, NU urgent acum (app NU are useri, "3 sesiuni de ale mele logate" — Daniel direct). D Hybrid balansează preservare biological signals trans-template (recovery/vitality NU dependente de goal choice) cu reset rep/RIR/rest specific template (matrix new). 2-session calibration window = consistent cu §EXT-2 already LOCKED, NU additive.

**Reversibility note:** Reversibil amendment când useri reali post-Beta dau signal contradictoriu (e.g., 2-session window prea scurt pentru convergence sau prea lung pentru UX). Bugatti craft transparency = ship V1 cu D Hybrid LOCKED + monitor post-Beta signal.

**Source:** chat strategic 2026-05-06 morning acasă (handover `177_*_CONSUMED.md` lines 38-46 + CURRENT_STATE §JUST_DECIDED line 86).

### §2.7 Q7 — 5-template aspect mapping vs SUFLET F2 push-back proporțional (LOCKED V1 evening late 2026-05-04)

**Question (verbatim stub §7):** *"Push-back proporțional cu risc — ce face engine-ul când user picks 'Forță' dar BF% high + age 60+ + recent injury?"*

**LOCKED choice:** **3 tiers push-back proporțional:**

- **Tier 1 silent** (no UI signal — engine internal modifier conservative aplicat, user NU notificat)
- **Tier 2 banner discret** (in-app banner 1-2 lines explanation modificator aplicat — user info, NU consimțământ explicit)
- **Tier 3 modal blocking opt-in** (modal full screen warning concrete + opt-in confirmare explicit cu max conservative modifiers aplicat — user agrees informed consent path)

**Rationale SUFLET F2 alignment:** "AI-ul informează, nu impune" → Tier 3 = max conservative modifiers, NU absolute refuse. User keeps autonomy. Risk-tier mapping example Forță + BF% high + age 60+ + recent injury → Tier 3 modal cu volume cap MEV-50% + intensity cap 75% 1RM Layer C sanity bound + warning "te-am observat pattern X, recomand path Y, dar tu decizi". Cross-ref ADR 025 graceful degradation engine pre-fills default.

**Source:** Cluster 5 Goal Adaptation push-back evening late 2026-05-04 (handover `142_*_CONSUMED.md` line 47).

### §2.8 Q8 — Re-prompt periodic anti-spam logic (LOCKED V1 evening late 2026-05-04)

**Question (verbatim stub §8):** *"Modal in-app 'Obiectivul tău e încă X?' — frequency optim 4-6 săpt confirmed; cooldown 21 zile post-confirm. Anti-spam logic detail?"*

**LOCKED choice — anti-spam logic full:**

- **Trigger 28 zile rolling** (rolling window din ultima interacțiune Re-prompt sau Goal Shift, NU calendar fix)
- **Cooldown 21 zile post-confirm** (user răspuns "Da, încă X" → 21 zile NU re-prompt indiferent de signal)
- **Cooldown 60 zile post Goal Shift** (user făcut shift activ → 60 zile NU re-prompt — preserve calibration window §36.35 + 2-session window evening late + reduce noise post-shift)
- **Cap absolut max 4 re-prompts/an** (anti-spam hardcap chiar dacă rolling triggers exceed)

**Rationale:** Re-prompt cadence §26.5 LOCKED 4-6 săpt confirmed, dar fără anti-spam structured logic = Re-prompt fatigue risk. Combined cooldowns (21d post-confirm + 60d post Goal Shift + cap 4/an) preserves Bugatti craft "smart trade-offs unde NU contează".

**Source:** Cluster 5 Goal Adaptation push-back + re-prompt evening late 2026-05-04 (handover `142_*_CONSUMED.md` line 47).

---

## §3 Cross-references

### Bidirectional ADR cross-refs

- [[026-offline-coaching-decision-tree-exhaustive|ADR 026]] §1.10 Pipeline §42.10 sequential — Goal Adaptation = 2nd engine (after Periodization §1) → Energy §3 (ADR 027) → Bayesian §4 (ADR 022) → Tempo §5 (ADR 028) → Specialization §6 (ADR 029) → Warm-up §7 → Deload §8. Constraint Object immutable propagated.
- [[018-engine-extensibility-architecture|ADR 018]] Dimension Registry — Goal Adaptation contributes verdicte via Dimension Registry către voices temporale existing (HISTORICAL + REALTIME + PROJECTION). ZERO change Arbitrator preserved.
- [[022-bayesian-nutrition-inference|ADR 022]] Bayesian Nutrition Engine #3 — Hook 1 cross-engine kcal/macro modulate, NU override phase Goal Adaptation auto-derived.
- [[025-andura-gandeste-pentru-user|ADR 025]] graceful degradation engine pre-fills default — referenced în Tier 3 push-back path SUFLET F2.
- [[027-engine-energy-adjustment|ADR 027]] Engine #5 Energy Adjustment session-level only, NU touch mesocycle phase Goal Adaptation owns.
- [[028-engine-tempo-form-cues|ADR 028]] Engine #6 Tempo Form Cues — light coupling, modifiers post-template×phase.
- [[029-engine-specialization|ADR 029]] Engine #7 Specialization — light coupling, modifiers post-template×phase.
- [[009-calibration-tiers|ADR 009]] §AMENDMENT 2026-05-05 birou after Convergence Guard T2 Unlock — interaction cu 2-session calibration window §EXT-2 (Q6 D Hybrid).
- [[ADR_OUTLIER_FILTER_v1]] §EXT-1 Streak Counter Same Direction (§36.30) + §EXT-2 Goal Shift Event Handler — Streak Reset + Conversion Interval (§36.35) — direct foundation Q6 D Hybrid streak RESET + 2-session calibration.
- [[017-demographic-prior-database|ADR 017]] anchor personas Maria 65 / Gigica 35 / Marius 25 — template-persona fit testing matrix (Q2 algorithmic generation modifiers persona-specific).
- [[../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening|HANDOVER_GLOBAL]] §26 (Goal-ca-setting + 5 templates V1 base) + §26.5 (Re-prompt 4-6 săpt) + §36.35 (Goal Shift Event Handler V1) + §36.92 D4 (Goal Taxonomy hybrid C) + §36.95 (ADR Numbering Additive split, ORPHAN-1 resolution) + §36.100 Engine #2 (Goal Adaptation Engine roadmap) + §36.102 (Goal lifecycle first-class supported).
- [[../06-sessions-log/HANDOVER_ENGINES_SPEC_2026-04-30_evening|HANDOVER_ENGINES_SPEC]] (theme split atomic 2026-05-05 birou — ADR 022/024/025 spec generation roadmap referenced post Periodization spec).

### Source archives Q1-Q8 verbatim

- `📤_outbox/_archive/2026-05/142_HANDOVER_2026-05-04_evening_late_periodization_goal_adaptation_CONSUMED.md` — Q1-Q5 + Q7-Q8 LOCKED V1 (Goal Adaptation Engine #2 Cluster 1-5 ~30 decisions cumulative)
- `📤_outbox/_archive/2026-05/177_HANDOVER_2026-05-06_morning_SMTP_COMPLETE_SETTINGS_UX_Q6_LOCK_CONSUMED.md` — Q6 LOCKED V1 D Hybrid (chat strategic 2026-05-06 morning acasă)
- `00-index/CURRENT_STATE.md` §JUST_DECIDED 2026-05-06 morning acasă — Q6 D Hybrid full content cross-verification

---

## §4 Open Questions PENDING — NONE

**All Q1-Q8 RESOLVED LOCKED V1 as of 2026-05-06 morning acasă.** ADR 024 status flip 🟡 STUB → 🟢 SPEC READY V1. Ready for Engine #2 wiring multi-batch CC (P1.3 sequence pragmatic post Adapter Design Pattern P1.2 chat strategic NEW).

**Implementation gap (NU Open Question — implementation concern):** ADR 024 SPEC READY V1 ≠ engine wired în coach decision flow live. Daniel "vizor fără ușă" reframe LOCKED 2026-05-06 morning — engine wiring real (multi-batch CC pipeline §42.10 sequential 4-6 batches) = priority pivot post Adapter Design Pattern (chat strategic NEW, probabil ADR 030 NEW).

---

## §5 Reconsideration triggers

Revisit ADR 024 SPEC READY V1 → V2 candidate dacă:

1. **Q6 D Hybrid signal contradictoriu post-Beta useri reali** — 2-session calibration window prea scurt pentru convergence (rate fallback >5% Circuit Breaker per ADR 026 §42.7) sau prea lung pentru UX (user feedback abandonare post-shift). Reversibility note Q6 §2.6 above.
2. **5 templates V1 expansion** — useri reali post-Beta cer 6th template (e.g., "Performance Atletic" / "Reabilitare specifică") cu prevalence ≥5% target population. Mode overlay extension preferred over new template (preserve 5 logic core).
3. **Phase auto-detection thresholds drift** — TDEE × 0.82 / 0.75 / 1.08 / 1.15 / 1.00 / ±2% baseline shows systematic bias (e.g., Maria 65 conservative CUT 0.82 = under-eating signal vitality drop). Re-evaluate cu Bayesian Nutrition cross-engine signal Hook 1.
4. **Push-back Tier 3 modal blocking opt-in** — opt-in rate <50% useri Tier 3 trigger → SUFLET F2 alignment compromise. Re-evaluate Tier 2 banner upgrade vs Tier 3 modal threshold.
5. **Re-prompt anti-spam cap 4/an** — useri raportează re-prompt fatigue chiar sub cap 4/an → reduce 3/an sau extend cooldown 28d→35d.
6. **Cross-engine hook ordering pipeline §42.10** — Periodization → Goal Adaptation → Energy ordering shows cascade artifact (e.g., Goal Adaptation override Energy ±15% session-level). Re-evaluate constraint object propagation immutability per ADR 026 §1.10.
7. **ADR 022 Bayesian Nutrition spec full LOCKED** — Hook 1 kcal/macro modulate cross-engine integration tested live → re-validate phase auto-detection thresholds Q4 §2.4 above.

**Re-evaluation cadence:** quarterly post-Beta (Q1+Q3 schedule per ADR 026 §1.8 Versioning Additive 18 luni deprecation window) sau on-demand Circuit Breaker §42.7 trigger fallback rate >5% segment Maria/Gigica/Marius.

---

🦫 **ADR 024 SPEC READY V1 LOCKED 2026-05-06 morning acasă.** Q1-Q8 toate RESOLVED. Ready pentru Engine #2 (Goal Adaptation) wiring multi-batch CC post Adapter Design Pattern (chat strategic NEW). ZERO fabrication, ZERO scope creep — verbatim aggregation din §26 base + chat strategic 2026-05-04 evening late Cluster 1-5 + chat strategic 2026-05-06 morning Q6 D Hybrid. Reversibil amendment when useri reali post-Beta contradictory signal.
