---
title: Tier Storage 0/1/2 Architecture (User-Facing Feature + Dexie.js Q10 BLIND SPOT #1 BLOCKER Resolved)
type: entity-feature
status: locked-v1
last_updated: 2026-05-12
audit_verdict: keep-verbatim
cross_refs:
  - "[[../adrs/adr-020-storage-tiering-strategy]]"
  - "[[../adrs/adr-021-calibration-drift-reconciliation]]"
  - "[[../adrs/adr-006-tier-storage-for-logs]]"
---

# Tier Storage Feature

## Synthesis

**Tier Storage 0/1/2 Architecture feature** = user-facing storage tiering strategy per ADR 020 Storage Tiering Strategy + Dexie.js Q10 BLIND SPOT #1 BLOCKER pre-launch RESOLVED. **3 tiers:** Tier 0 active rolling (90 sessions) + Tier 1 aggregate (post-90 sessions consolidate weekly) + Tier 2 Firebase archive deep history (multi-device sync + Anonymous → Auth migration smooth). ADR 006 §Tier Storage for logs generalized ADR 020 universal PWA invariant.

**UX surface mockup V2:** Setări tab "Stocare" sub-page — Tier indicators (🟢 Active 90 sesiuni / 🟡 Arhivă consolidată / 📦 Cloud deep history) + storage usage display + manual archive trigger optional (NU mandatory). Pattern preserved cross-feature single signal communication concise (3 tier indicators). Tier 2 cloud archive integration Firebase REST API direct (per ADR 002 firebase-rest-not-sdk) — bundle 50KB vs 200KB SDK.

**Engine integration:** Cross-engine pattern preserved — Tier 0 active rolling 90 sessions input pentru engine adaptation period 4-12 weeks (Periodization ADR 026 §1.10 mesocycle 4 săpt + macrocycle 12-16 săpt). Tier 1 aggregate consum [[../adrs/adr-021-calibration-drift-reconciliation]] Version Vector Max-Merge multi-device reconciliation. Tier 2 Firebase archive EC-4 restore canonical state din cloud post user clear localStorage device (NU re-baseline from 0).

## Verbatim quotes Daniel

Daniel verbatim ADR 020 Storage Tiering Strategy Gemini Q10 BLIND SPOT #1 BLOCKER pre-launch:
> *"Tier 0/1/2 + Dexie.js Gemini Q10 BLIND SPOT #1 BLOCKER pre-launch resolved. Universal PWA pattern. 3 tiers active + aggregate + Firebase archive deep history."*

Daniel verbatim Tier 0 active rolling 90 sessions ADR 020 §1.4 rationale:
> *"Tier 0 active rolling 90 sessions = engine adaptation period 4-12 weeks Periodization (mesocycle 4 săpt + macrocycle 12-16 săpt) needs longer history. ≥90 ratings + logs alignment."*

Daniel verbatim ADR 006 §Tier Storage for logs generalized:
> *"3-tier logs Live+Aggregate+Archive (generalized ADR 020 universal PWA). Tier Storage for logs generalized universal pattern cross-data-type."*

## Bugatti framing notes

**Gigel test relevance:** Setări "Stocare" sub-page Tier indicators 3 emoji + label vernacular = zero gândire user (recognize storage tier pattern instant). NU technical jargon "IndexedDB + Firebase Firestore tier". Gigel test PASS.

**Quality > Speed via universal PWA pattern:** ADR 006 + ADR 020 generalized invariant cross-data-type (logs + ratings + sessions + calibration). Pattern: 3-tier active + aggregate + archive universal applicable.

**Anti-RE considerations:** Q10 BLIND SPOT #1 BLOCKER pre-launch RESOLVED = anti-recurrence "storage 2GB IndexedDB limit hits + Firebase quota explode launch". Pattern: tier strategy mandatory pre-launch + Dexie.js index-based query optimization.

**Anti-paternalism notes:** Manual archive trigger optional (NU mandatory) = anti-paternalism. User decides archive timing. Tier indicators inform NU forced storage action.

**Voice tone notes:** Daniel-ism "BLIND SPOT" recurring pattern (Gemini cross-check methodology preserved). Anti-storage-fatigue UX discipline cross-feature.

## Cross-refs raw layer

- [[../../../03-decisions/020-storage-tiering-strategy]] §1.4 Tier 0 active rolling 90 sessions + Dexie.js Q10 BLIND SPOT #1 BLOCKER RESOLVED
- [[../../../03-decisions/021-calibration-drift-reconciliation]] Version Vector Max-Merge multi-device + EC-4 Tier 2 Firebase archive restore
- [[../../../03-decisions/006-tier-storage-for-logs]] 3-tier logs Live+Aggregate+Archive generalized ADR 020 universal PWA
- [[../../../03-decisions/002-firebase-rest-not-sdk]] Firebase REST API direct NU SDK bundle 50KB Tier 2 cloud integration
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §Q10 BLIND SPOT #1 Gemini 3 Pro cross-check origin
- [[../adrs/adr-020-storage-tiering-strategy]] (wiki entity SUB-BATCH 2 cross-ref)
- [[../adrs/adr-021-calibration-drift-reconciliation]] (wiki entity SUB-BATCH 3 multi-device sync cross-ref)

🦫 **Tier Storage 0/1/2 Architecture feature LOCK V1. Tier 0 active rolling 90 sessions + Tier 1 aggregate + Tier 2 Firebase archive deep history. ADR 020 Universal PWA pattern + Dexie.js Q10 BLIND SPOT #1 BLOCKER pre-launch RESOLVED. Cross-engine adaptation period 4-12 weeks alignment.**
