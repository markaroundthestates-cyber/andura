---
title: ADR 002 — Firebase REST API Not SDK
type: entity
subtype: adr
status: locked-v1
locked_date: 2026-04-23
authority: 03-decisions/002-firebase-rest-not-sdk.md raw layer §Decision (REST .json endpoints NU Firebase JS SDK)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-001-local-first-storage]]"
  - "[[adr-007-firebase-open-rules]]"
  - "[[adr-multi-tenant-auth]]"
  - "[[../../concepts/bugatti-craft]]"
amendments:
  - date: 2026-05-02
    note: AMENDMENT cross-ref ADR 007 — REST `fetch()` calls unauthenticated în current code, Auth migration prerequisite pentru per-uid rules activation
---

# ADR 002 — Firebase REST API Not SDK

## Synthesis

ADR 002 = decision uses Firebase RTDB REST API directly (`fetch` la `.json` endpoints) instead Firebase JS SDK. Original LOCK V1 2026-04-23. Rationale: Firebase SDK ~150KB gzipped overhead → bundle inflate. REST API minimal cost (~50KB total vs ~200KB cu SDK), zero auth complexity single-user personal app phase. Trade-off accepted: no real-time listeners — sync pull-based (app start) + push-based debounced 3s post-write. Connection cu ADR 001 (local-first storage primary IndexedDB + Firebase backup tier) + ADR 007 (open rules single-user, future migration `users/$uid` Auth gated). Cross-ref ADR_MULTI_TENANT_AUTH v1 Auth Magic Link future SDK requirement evaluated post-Beta.

## Verbatim quotes Daniel

Verbatim quotes Daniel: catalog pending raw-layer text limited — synthesis-only entity per voice policy §1 footnote 6 exception. ADR 002 raw `03-decisions/002-firebase-rest-not-sdk.md` = pure technical decision early Andura phase 2026-04-23 fără chat verbatim push-backs documented. Future amendment dacă apare daniel-ism context (e.g., Auth migration trigger SDK switch debate) → append catalog.

## Bugatti framing notes

**Bundle weight discipline:** ~50KB total prod stack (vanilla JS per ADR 005 + Firebase REST) vs ~200KB SDK alternative = Quality > Speed via simplicity. Stripe analogy implicit — vendor relationships = implementation detail, NU public-facing brand.

**Anti-RE considerations:** REST endpoints `users/daniel/*` direct `.json` access = transparent infrastructure, NU obfuscated SDK abstraction. Audit-friendly (network tab visible plain JSON).

**Voice tone notes:** Decision pre-dates daniel-isms catalog accumulation (chat strategic 2026-04-30 → 2026-05-11 dense push-back history). ADR neutral technical baseline = OK voice fidelity §1 footnote 6 exception.

## Cross-refs raw layer

- [[../../../03-decisions/002-firebase-rest-not-sdk]] §Decision (REST API direct) + §Consequences (bundle 50KB vs 200KB SDK)
- [[../../../03-decisions/001-local-first-storage]] §Decision (IndexedDB primary, Firebase backup tier)
- [[../../../03-decisions/007-firebase-open-rules]] §AMENDMENT 2026-05-02 (Auth migration prerequisite for per-uid rules)
- [[../../../03-decisions/ADR_MULTI_TENANT_AUTH_v1]] §Implementation Sprint (Auth Magic Link future gate)
- [[../../../03-decisions/DECISION_LOG]] §2026-04-23 entry

🦫 **ADR 002 Firebase REST API LOCK V1 2026-04-23. Bundle weight discipline Bugatti simplicity stack. AMENDMENT cross-ref 2026-05-02 Auth migration prerequisite per-uid rules activation gated.**
