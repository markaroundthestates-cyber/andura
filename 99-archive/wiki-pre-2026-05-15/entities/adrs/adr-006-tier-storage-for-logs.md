---
title: ADR 006 — Three-Tier Log Storage
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-23
authority: 03-decisions/006-tier-storage-for-logs.md raw layer §Decision (3-tier Live + Aggregate + Archive)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-001-local-first-storage]]"
  - "[[adr-011-coach-decision-log-architecture]]"
  - "[[adr-020-storage-tiering-strategy]]"
amendments:
  - date: 2026-04-30
    note: Generalized → ADR 020 Tier 0/1/2 + Dexie.js infrastructure (ADR 006 = specific case logs, ADR 020 = arhitectură universală PWA storage)
---

# ADR 006 — Three-Tier Log Storage

## Synthesis

ADR 006 = decision TierStorage 3-tier logs retention: **Live (0-90 days)** full entry-level data DP + all engines + **Aggregate (90d-1yr)** daily summaries compressed (sets, avgWeight, exercises) + **Archive (>1yr)** monthly summaries only (sessions, totalSets, topExercises). Original LOCK V1 2026-04-23. Rationale: localStorage hard limit ~5MB browser-wide → after 1-2 years workout logs accumulation overflow. Compression runs on `saveTiers(logs)` when full log array available. Live tier fast (DP + WhyEngine recent data only). Aggregate/archive lose per-set resolution post 90 days (daily backup system mitigates PRs historical). ADR 006 = specific case logs; ADR 020 §AMENDMENT 2026-04-30 evening generalizes Tier 0/1/2 + Dexie.js + rotation universal PWA storage arhitectură (Tier 0 localStorage 30d + Tier 1 IndexedDB Dexie + Tier 2 Firebase cloud archive).

## Verbatim quotes Daniel

Verbatim quotes Daniel: catalog pending raw-layer text limited — synthesis-only entity per voice policy §1 footnote 6 exception. ADR 006 raw 2026-04-23 foundational technical decision pre daniel-isms density.

Daniel articulation cross-ref chat strategic 2026-04-30 evening Gemini 3 Pro Q10 BLIND SPOT #1 storage exhaustion blocker (cross-ref [[adr-020-storage-tiering-strategy]]):

> *"Storage Exhaustion PWA Limit ~5MB — CDL Tier 1 + logs + cache pot atinge 80% rapid pe useri activi 6-12 luni. Showstopper tehnic dacă nu rezolvăm pre-launch."*

(Verbatim Gemini 3 Pro relay Daniel chat strategic ground-truth confirmation — Daniel accepted blocker classification.)

## Bugatti framing notes

**Quality > Speed via bounded storage:** 3-tier compression = storage stays bounded regardless training duration. Live tier fast (DP + WhyEngine cheap), historical accessible reduced fidelity.

**Anti-RE considerations:** Tier boundaries internal implementation detail (90d / 1yr cutoffs), NU user-facing. User sees seamless data continuity (engines query appropriate tier transparent).

**Voice tone notes:** ADR 006 foundational pre verbatim accumulation. Generalized ADR 020 §AMENDMENT 2026-04-30 evening = catalysator daniel-isms catalog dense post-Gemini cross-check.

## Cross-refs raw layer

- [[../../../03-decisions/006-tier-storage-for-logs]] §Decision (3-tier Live + Aggregate + Archive)
- [[../../../03-decisions/001-local-first-storage]] §Decision (foundation principle)
- [[../../../03-decisions/011-coach-decision-log-architecture]] §Storage (CDL TierStorage alignment Tier 1=180d locked responseProfile rolling window)
- [[../../../03-decisions/020-storage-tiering-strategy]] §Decision SSOT (Tier 0/1/2 + Dexie.js generalized universal PWA — ADR 006 specific case absorbed)
- [[../../../03-decisions/DECISION_LOG]] §2026-04-30 evening Gemini 3 Pro cross-check Q10 BLIND SPOT #1

🦫 **ADR 006 TierStorage 3-tier logs LOCK V1 2026-04-23. ADR 020 §AMENDMENT 2026-04-30 generalizes Tier 0/1/2 + Dexie.js universal PWA arhitectură. Storage exhaustion pre-launch blocker resolved.**
