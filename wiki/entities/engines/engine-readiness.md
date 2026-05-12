---
title: Engine Readiness — 5-State Pre-Session Gauge + Score Mapping → Engine Energy Adjustment
type: entity-engine
status: landed
last_updated: 2026-05-12
cross_refs:
  - "[[../adrs/adr-027-engine-energy-adjustment]]"
  - "[[../adrs/adr-016-vitality-layer]]"
  - "[[../../../src/engine/readiness.js]]"
  - "[[../../../src/pages/coach/energyCheck.js]]"
---

# Engine Readiness — 5-State Pre-Session Gauge + Score Mapping

## Synthesis

**Engine Readiness** = pre-session readiness gauge cu **5 states emoji** (😴 Epuizat 1 / 😕 Obosit 2 / 😐 Normal 3 / 😊 Bine 4 / 🔥 Excelent 5) + score mapping cu integration kcal/protein delta yesterday. Implementation `src/engine/readiness.js` thresholds canonical: **READINESS_PR 85 / HIGH 70 / MED 55 / LOW 40**. Function `getReadinessScore(readinessInput, kcalYesterday, protYesterday, targetKcal, targetProt)` aplicat formula: `score = 60 + readinessPoints[input] - kcal_deficit_penalty - prot_deficit_penalty`, clamp `[10, 100]`.

**readinessPoints mapping:** 5 → +40 / 4 → +35 / 3 → +25 / 2 → +15 / 1 → 0 (baseline 60). **kcal penalty:** ratio<0.70 → -20 / <0.85 → -10 / <0.95 → -5. **Protein penalty:** ratio<0.70 → -10 / <0.85 → -5.

**BATCH 2 SLICE 1 LANDED commit `8a4c39e`** — energyCheck.js port 3-state pre-session gauge V2 mockup (Excelent / Normal / Obosit) cu cause drill 4 cauze + DB energy-cause-log rolling 90 entries ADR 020 Tier 0 alignment. Cross-engine integration: **Engine Energy Adjustment** (ADR 027) consume readiness score → asymmetric trigger logic Q7=B (UP +15% requires N≥3 conditions cumulative + Periodization phase gate "high_intensity != true" anti "Sarcastic UP" Marius 5:1 săpt 4-5; DOWN -15% single trigger immediate). Tier-aware Q13=B T0=±10% T1+=±15% downstream.

## Verbatim quotes Daniel

Daniel verbatim 5-state emoji labels LOCKED rationale Romanian-first:
> *"😴 Epuizat / 😕 Obosit / 😐 Normal / 😊 Bine / 🔥 Excelent. Romanian-first vernacular. Emoji + label + sub-text 3-line stack per state."*

Daniel verbatim BATCH 2 SLICE 1 energyCheck.js port 3-state simplified V2 mockup rationale:
> *"3 states V2 mockup (Excelent/Normal/Obosit) + cause drill 4 cauze 🔴 only Q15=C anti-Maria-65-friction default. Pre-session gauge integrated cu Energy Adjustment downstream."*

## Bugatti framing notes

**Gigel test relevance:** 5-state emoji surface UI = zero gândire user (recognize emoji instant + label vernacular). Q15=C drill-down strict 🔴 only = anti-Maria-friction default 🟢🟡 no drill. Pattern preserved cross-engine Energy.

**Quality > Speed via integrated kcal/protein delta:** Score NU only emoji input — incorporates kcal/protein deficit yesterday (food intake context). Pattern: readiness = holistic signal multi-input deterministic.

**Anti-RE considerations:** Score clamp [10, 100] = anti-extreme-edge-case (NU negative scores NU overflow). Pattern: bounded output preserved engine output downstream.

**Anti-paternalism notes:** Score informează Engine Energy Adjustment asymmetric trigger (UP cumulative anti-Sarcastic + DOWN immediate recovery imperative). User agency preserved via input choice. Q15=C drill 🔴 only anti-paternalism Maria 65 friction default.

**Voice tone notes:** Daniel-ism "Ready to crush it" Excelent sub-text preserved Romanian-English hybrid (motivational tone). "Sub forma normala" Obosit vernacular preserved.

## Cross-refs raw layer

- [[../../../src/engine/readiness.js]] (READINESS_PR/HIGH/MED/LOW thresholds + getReadinessScore + READINESS_LABELS)
- [[../../../src/pages/coach/energyCheck.js]] (3-state V2 mockup port BATCH 2 SLICE 1 commit `8a4c39e`)
- [[../../../03-decisions/027-engine-energy-adjustment]] §asymmetric trigger Q7=B + Q13=B tier-aware downstream consume readiness score
- [[../../../03-decisions/016-vitality-layer]] (behavioral proxy 6 questions Gigel-friendly opt-in NU bloodwork cross-ref)
- [[../../../03-decisions/020-storage-tiering-strategy]] Tier 0 active rolling 90 energy-cause-log entries
- [[../../../03-decisions/DECISION_LOG]] §2026-05-12 BATCH 2 SLICE 1 energyCheck.js port commit `8a4c39e`
- [[../../../04-architecture/mockups/andura-clasic.html]] §energy-check + §G pre-session gauge V2 SoT line referenced

🦫 **Engine Readiness 5-state emoji pre-session gauge + score mapping kcal/protein delta integrated. Cross-engine Energy Adjustment asymmetric trigger downstream consume. BATCH 2 SLICE 1 energyCheck.js port LANDED 3-state V2 mockup simplified.**
