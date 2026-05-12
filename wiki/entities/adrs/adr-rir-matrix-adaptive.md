---
title: ADR RIR Matrix Adaptiv v1 (Profile + Exercise Category Aware)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-05-02
authority: 03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1.md LOCKED V1 Chat D ADR Review Process §36.56 — 0 amendments clean LOCK; spec gap hybrid exercises Sprint 4.x mecanic action item
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-017-demographic-prior-database]]"
  - "[[adr-outlier-filter]]"
  - "[[adr-024-goal-driven-program-templates]]"
amendments: []
---

# ADR RIR Matrix Adaptiv v1

## Synthesis

ADR_RIR_MATRIX_ADAPTIVE = matrix adaptiv Verbal → RIR numeric per **Profile Type × Exercise Category**. V1 user verbal feedback layer (Maria 65 + Gigica 35 non-tech) cere *"Cât de greu a fost?"* → 3 opțiuni [Ușor / Potrivit / Foarte greu], NU RPE/RIR explicit. Engine trebuie traducă verbal → RIR numeric pentru consumere downstream (progresie + deload trigger + plateau detection).

Traducere globală single-mapping = drift safety. Marius Advanced cu mișcare compusă grea "Foarte greu" = potențial RIR 0 pe 1RM (legitim) vs Maria 65 cu Sit-to-Stand "Foarte greu" = potential RIR 0 pe lift fundamental survival (regression flag, NU progress).

**Mapping LOCKED V1:**
| Profil | Tip Exercițiu | Verbal | RIR Numeric | Acțiune Engine |
|--------|---------------|--------|-------------|-----------------|
| Maria 65 (Beginner/Longevitate) | Izolare / Greutate corporală | Ușor | 6+ | Păstrează greutate, +2 reps next session |
| | | Potrivit | 3-4 | Optimum, menține |
| | | Foarte greu | 0-1 | **Reduce reps (NU sets)**, păstrează min 2 sets |
| Marius 25 (Advanced/Strategic) | Mișcări compuse grele | Ușor | 4-5 | +2.5 kg next session |
| | | Potrivit | 2-3 | Optimum, +1 kg sau +1 rep |
| | | Foarte greu | 0 (3× consecutive same lift) | **Activează micro-deload** |

**Push-back productive integrate:** (1) Marius single RIR 0 ≠ deload immediate. Doar 3 sesiuni consecutive same exercise → micro-deload. Single RIR 0 e legitim pe 1RM testing day. (2) Maria "Foarte greu" → reduce reps (NU sets). Min 2 sets preserve prag stimulare neuro-musculară.

**Profil intermediate (Gigica 35 / Maria 70 / etc.):** V1 fallback Gigica/Maria 70 routed la Maria 65 matrix conservative-by-default. Marius Beginner (0-10 sesiuni) routed la Maria 65 matrix pe izolare + intermediate-strict pe compound (RIR 5+ Ușor / 3 Potrivit / 1 Foarte greu). V2 reconsider: matrix dedicat Profile Intermediate dacă user-base demands granularity.

## Verbatim quotes Daniel

Daniel verbatim wording UI 3 opțiuni Verbal LOCKED 2026-05-02 SUFLET ingest:
> *"Cât de greu a fost? Ușor / Potrivit / Foarte greu. NU RPE/RIR explicit. Maria 65 + Gigica 35 non-tech can't translate RIR numeric."*

Daniel verbatim Push-back productive Marius single RIR 0 ≠ deload immediate:
> *"Marius single RIR 0 ≠ deload immediate. Doar 3 sesiuni consecutive same exercise → micro-deload. Single RIR 0 e legitim pe 1RM testing day."*

Daniel verbatim Push-back Maria reduce reps NU sets rationale:
> *"Maria 'Foarte greu' → reduce reps (NU sets). Min 2 sets preserve prag stimulare neuro-musculară. NU drop la 1 set survival."*

## Bugatti framing notes

**Gigel test relevance:** Verbal *"Ușor / Potrivit / Foarte greu"* = vernacular vs RPE/RIR jargon. Maria 65 + Gigica 35 non-tech NU pot translate "RIR 2 means..." instant. Gigel test PASS.

**Quality > Speed via Profile × Category matrix:** Maria 65 Izolare/Bodyweight vs Marius 25 Compound = NU same RIR translation. Anti-one-size-fits-all preserved. Pattern: same Verbal input → different engine action per (Profile + Exercise Category).

**Anti-RE considerations:** Marius single RIR 0 = legitim 1RM testing day NU automatic deload trigger (anti-recurrence "1 sesiune greu = trauma response"). Pattern: 3 sesiuni consecutive same exercise signal consistency before action.

**Anti-paternalism notes:** Maria "Foarte greu" → reduce reps NU sets preserves training stimulus (min 2 sets). Engine prevents auto-drop la 1 set "survival mode" = respects user effort, NU over-conservative.

**Voice tone notes:** Daniel-isms "drift safety" + "stimulare neuro-musculară" preserved (technical vernacular natural). Spec gap hybrid exercises = mecanic action item Sprint 4.x (NU LOCK premature pe hybrid edge case).

## Cross-refs raw layer

- [[../../../03-decisions/ADR_RIR_MATRIX_ADAPTIVE_v1]] §Decision Mapping LOCKED V1 verbatim
- [[../../../01-vision/SUFLET_ANDURA]] §3 ADR Pattern 14 No-Inference alignment source
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §36.16 (origin) + §29.2.5 Engine Forță + §29.2.6 Longevitate
- [[../../../03-decisions/017-demographic-prior-database]] anchor personas Maria 65 / Marius 25 / Gigica 35 source
- [[../../../03-decisions/ADR_OUTLIER_FILTER_v1]] §EXT-1 streak counter same direction integration (Marius 3 consecutive RIR 0)
- [[../../../03-decisions/024-goal-driven-program-templates]] Goal Adaptation Engine #2 pipeline cross-ref RIR Matrix consume
- [[../../../03-decisions/DECISION_LOG]] §2026-05-02 Chat D LOCK 0 amendments

🦫 **ADR RIR Matrix Adaptiv LOCKED V1 2026-05-02. Profile × Exercise Category matrix (Maria 65 Izolare / Marius 25 Compound). Verbal Ușor/Potrivit/Foarte greu → RIR numeric translation. Push-back Marius 3 consecutive + Maria reduce reps NU sets preserved.**
