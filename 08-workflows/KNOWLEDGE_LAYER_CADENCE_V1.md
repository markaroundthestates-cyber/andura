# KNOWLEDGE LAYER UPDATE CADENCE V1 LOCKED

**Status:** ACTIVE_SSOT (active rule canonical, knowledge layer maintenance)
**First-source:** `HANDOVER_MISC_2026-04-30_evening.md` §36.103 Knowledge Layer Update Cadence LOCKED V1 (lines 5589-5621, archived 2026-05-07 Capacity A)
**Date split:** 2026-05-07 (Run 2 vault cleanup Task 1)
**Authority:** AUTHORITATIVE_LOCK (operational rule)

**Cross-refs:**
- [[../02-audit/COACHING_TEXTBOOK_SYNTHESIS]] (knowledge synthesis source)
- [[../03-decisions/026-offline-coaching-decision-tree-exhaustive|ADR 026]] §9 ENGINE-LEVEL SPECS (knowledge integration per engine)
- [[../03-decisions/DECISION_LOG]] (entries 2026-05-02+ Knowledge Layer cadence locked context)

---

## §36.103 Knowledge Layer Update Cadence LOCKED V1 — Content Store NU Capability Blocker

**Decision wording verbatim:**

> "Knowledge layer Andura = content store updatable periodic, NU capability blocker arhitectural. Pattern: engines = logic stable (rare changes), knowledge = data periodic refresh. Update cadence LOCKED V1: quarterly (meta-analyses noi + tweaks volume/frequency landmarks) / bi-annual (exercise library extension) / annual (periodization template revisions per literature consensus shift). Mecanism delivery: Claude chat urmărește field research + generează patch specs cu rationale + cross-refs literature → CC Opus implementează patches incremental (~5-15h/quarter) → Feature Flags rollout gradual (10%/50%/100%) safe deployment → CDL audit trail post-deployment metrics check."

**Rationale:**

- **Engines = logic stable** (Schoenfeld volume landmarks nu se schimbă brusc, periodization templates Helms/Israetel evoluează lent)
- **Knowledge = data refresh** (exercise library, threshold values, MEV/MAV/MRV calibration, RPE matrix) tunabil via Remote Config + data files
- **ADR 018 Schema Versioning + Feature Flags ready infrastructure** pentru rollout safe
- **Avantaj competitiv vs Jeff:** Jeff vinde program 2024 încă în 2027 static. Andura updates quarterly automat — user primește latest research findings fără să cumpere program nou
- **Avantaj vs LLM frontier:** LLM-urile au knowledge cutoff fix (training date) — Andura quarterly fresh + structurat verificabil (NU "GPT a citit ceva")

**Knowledge layers extensibile:**

- Exercise library (`src/exercises/`) — ADR 022 V2 prevede ~50-150 exerciții add post-launch
- Decision tree rules — versionate per ADR 018 Schema Versioning
- Periodization templates — Helms/Israetel/Schoenfeld block schemes ca data files NOT cod
- Volume landmarks (MEV/MAV/MRV per muscle) — config tunabil
- Substitution rules — alternativeEngine extensibil (data NU logic refactor)
- RPE/RIR thresholds — Remote Config tunable per profile

**Update cadence detail:**

- **Quarterly** — meta-analyses noi (Schoenfeld lab output ~3-4/an), tweaks volume/frequency landmarks, RPE thresholds calibration
- **Bi-annual** — exercise library extension (variante noi populare community), substitution rules update
- **Annual** — periodization template revisions per literature consensus shift, MEV/MAV/MRV recalibrare

**Cross-refs:** ADR 018 Schema Versioning + Feature Flags + §36.99 ADR 026 offline tree (knowledge ≠ capability) + Exercise library schema §36.36 extension + alternativeEngine.js extensibilitate.

---

