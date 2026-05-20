---
title: ADR 021 — Calibration Drift Reconciliation (Version Vector + Max-Merge)
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-30
authority: 03-decisions/021-calibration-drift-reconciliation.md Multi-device sync version vector + max-merge reconciliation
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-009-calibration-tiers]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[adr-014-onboarding-profile-typing]]"
  - "[[adr-multi-tenant-auth]]"
amendments: []
---

# ADR 021 — Calibration Drift Reconciliation

## Synthesis

ADR 021 = Multi-device sync reconciliation pentru `calibration_state` Cu Version Vector + Max-Merge strategy. **Axa engine_tier** (T0/T1/T2 cantitate) = Max Wins Monotonic (device cu mai multe `unique_session_count` câștigă, session count e fizic imposibil să scadă). **Axa calibration_confidence** (COLD_START → OPTIMIZED, 6 nivele post D1) = Monotonic Clock — observații negative (yo-yo detected, AA HIGH events, plateau >2 săpt) **persistă** chiar dacă device offline lung, max-progress wins per ordering enum. Version Vector element-wise pe object, sync conflict resolution = canonical state cu integration totală (no-loss merge).

Scenario blocker pentru Faza 2 T&B: Device A PC active T1 PERSONALIZING (24 sesiuni) + Device B phone offline 35 zile la INITIAL. Naive LWW = REGRESS catastrofal; naive merge = split ambiguu; pierdere observații negative = liability gap. ADR 011 amendment LWW deprecated, T&B mandatory pre-launch + reconciliation = prerequisite spec. Algorithm core `src/engine/calibrationReconciliation.js` LIVE 2026-05-01 (pure function `reconcile`, idempotent, deterministic) + 37 Golden Master tests covering EC-1..EC-6.

## Verbatim quotes Daniel

Daniel verbatim Gemini 3 Pro cross-check 2026-04-30 evening Q10 BLIND SPOT #2:
> *"Calibration Drift offline lung — fără mecanism reconciliere între devices. Device B offline 30+ zile la INITIAL tier, device A active la PERSONALIZED. Sync reconnect → drift cum se rezolvă fără pierdere progres?"*

Daniel verbatim chat ACASĂ pre-launch testing scenario rationale:
> *"folosesc 2 anonymous accounts pre-launch (phone + PC) — testez deja scenariu. Anonymous → Auth migration smooth (D12 routing)."*

## Bugatti framing notes

**Gigel test relevance:** Reconciliation = engineer-side complexity invisible la user. Surface UI = silent default (cu opțional toast post-launch *"Datele de pe phone + PC au fost combinate"*). User NU vede tier "salt" T0→T1 ca surprize (acceptable positive event).

**Quality > Speed via Version Vector battle-tested:** Riak + Cassandra + Voldemort pattern → zero invention risk. Effort 8-12h spec → impl Sprint 3 full = acceptable pentru multi-device foundation.

**Anti-RE considerations:** Observații negative monotonic NU pot fi șterse — pierderea unei detection negative = liability gap (Gemini Q10 BLIND SPOT #3 cross-link). Audit trail complete pentru injury liability case per ADR 013 Liability Flag pattern.

**Anti-paternalism notes:** Version Vector cap N=10 devices = realistic limit (useri reali NU au 50 devices), NU restricție artificial. Garbage collect older entries cu `last_seen > 1 year`.

## Cross-refs raw layer

- [[../../../03-decisions/021-calibration-drift-reconciliation]] §Decision Max Wins + Monotonic Clock + Version Vector
- [[../../../03-decisions/009-calibration-tiers]] §AMENDMENT 2026-04-30 2 axe ortogonale + 6 nivele
- [[../../../03-decisions/011-coach-decision-log-architecture]] §T&B foundation reconciliation events audit trail
- [[../../../03-decisions/014-onboarding-profile-typing]] Profile Typing reconciliation pattern separate axis
- [[../../../03-decisions/020-storage-tiering-strategy]] Tier 2 Firebase archive pentru calibration_state EC-4 restore
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §6.7 effort total update
- [[../../../src/engine/calibrationReconciliation.js]] (pure functions reconcile + bumpVersion + 37 Golden Master tests)

🦫 **ADR 021 — Calibration Drift Reconciliation. Multi-device robust, zero progress loss. Standard distributed systems pattern.**
