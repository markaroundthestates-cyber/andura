---
title: ADR 033 — Engine Muscle Memory Index (MMI) STUB Post-Beta v1.5 Candidate
type: entity
subtype: adr
status: stub-placeholder
locked_date: 2026-05-07
authority: 03-decisions/033-muscle-memory-index.md STUB SPEC PLACEHOLDER imported verbatim HANDOVER_MISC §32
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-018-engine-extensibility-architecture]]"
  - "[[adr-026-offline-coaching-tree]]"
  - "[[adr-009-calibration-tiers]]"
amendments: []
---

# ADR 033 — Engine Muscle Memory Index (MMI)

## Synthesis

ADR 033 = STUB SPEC PLACEHOLDER pentru Engine Muscle Memory Index (MMI) — Engine #9 candidate post-Beta v1.5. Content imported verbatim din HANDOVER_MISC §32 (archived 2026-05-07 Capacity A). Promote la SPEC READY V1 când chat strategic dedicat compile §9.9 ADR 026 pattern (post-Beta v1.5 priority window).

**Algorithm Hibrid (Lookup + Boost) LOCKED V1 NEW 2026-05-02:**

Formula: `Greutate Pornire = Peak Pre-Pauză × Multiplicator Lookup`

Tabel multiplicatori + boost progresie:
- **6-12 luni pauză:** 0.80× multiplicator pornire + 1.25× boost progresie primele 3 săpt
- **12-24 luni pauză:** 0.70× multiplicator + 1.10× boost
- **24+ luni pauză:** 0.60× multiplicator + 1.00× start proaspăt (zero boost)

**Rationale:** păstrăm `peak_pre_pause` ca anchor (engine știe unde a ajuns user) + lookup table pentru durată reală pauză. Boost progresie primele 3 săpt accelerează re-calibrarea (corpul își amintește pattern-uri neuromusculare). MMI plausibly T2+ feature gating defer per ADR 009 §AMENDMENT 2026-05-05 Convergence Guard T2 Unlock.

**Numbering convention Additive per [[VAULT_RULES]] §3** (NU re-arrange existing 001-032). ADR 033 next slot post 032 Deload. ADR Numbering Additive §36.95 convention preserved.

## Verbatim quotes Daniel

Daniel verbatim HANDOVER_MISC §32 NEW 2026-05-02 MMI LOCKED V1 rationale:
> *"păstrăm peak_pre_pause ca anchor (engine știe unde a ajuns user) + lookup table pentru durată reală pauză. Boost progresie primele 3 săpt accelerează re-calibrarea (corpul își amintește pattern-uri neuromusculare)."*

Daniel verbatim ADR 033 STUB creation Run 2 vault cleanup 2026-05-07:
> *"033 next slot post 032 Deload. Numbering convention Additive — NU re-arrange existing 001-032. ADR Numbering Additive §36.95."*

## Bugatti framing notes

**Gigel test relevance:** User reintors după pauză 12+ luni — Bugatti craft = engine știe unde a ajuns (peak anchor), NU restart from 0. Visual intuitive *"reia de unde ai rămas, ușurel"*.

**Quality > Speed via lookup table:** ~6 multiplicatori (3 durate × 2 valori) = ship lean. NU complex Bayesian estimation pentru "muscle memory" — observable pattern lookup table primă V1.

**Anti-RE considerations:** STUB SPEC PLACEHOLDER status preserved — NU promote la LOCKED V1 fără chat strategic dedicat. Pattern: stub creation = placeholder reserved slot ADR Numbering Additive, NU forced premature LOCK.

**Anti-paternalism notes:** Boost progresie primele 3 săpt = accelerare conservative (1.25× / 1.10× / 1.00× la 24+ luni = NU push back peak instant). User progresses la peak own pace.

**Voice tone notes:** Pattern "corpul își amintește" = vernacular natural (NU "neuromuscular adaptation residual" jargon).

## Cross-refs raw layer

- [[../../../03-decisions/033-muscle-memory-index]] §1 Source content verbatim HANDOVER_MISC §32
- [[../../../03-decisions/018-engine-extensibility-architecture]] §1 Dimension Registry plug-in additive Open-Closed (MMI = Engine #9 candidate post-Beta)
- [[../../../03-decisions/026-offline-coaching-decision-tree-exhaustive]] §9 ENGINE-LEVEL SPECS pattern §9.X reusable §9.9 MMI când promoted SPEC
- [[../../../03-decisions/009-calibration-tiers]] §AMENDMENT 2026-05-05 Convergence Guard T2 Unlock MMI plausibly T2+ feature gating defer
- [[../../../01-vision/ONBOARDING_SSOT_V1]] §9 Anti-Reflex Protection MMI prompt UX integration touchpoint
- [[../../../06-sessions-log/HANDOVER_MISC_2026-04-30_evening]] §32 verbatim source archived 2026-05-07 Capacity A
- [[../../../VAULT_RULES]] §3 ADR Numbering Additive convention §36.95

🦫 **ADR 033 STUB SPEC PLACEHOLDER. Engine Muscle Memory Index Engine #9 candidate post-Beta v1.5. Algorithm Hibrid Lookup + Boost. Promote la SPEC READY când chat strategic dedicat compile §9.9.**
