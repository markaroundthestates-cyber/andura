---
title: ADR 007 — Firebase RTDB Open Rules (Single-User Personal App)
type: entity
subtype: adr
status: amended
locked_date: 2026-04-23
authority: 03-decisions/007-firebase-open-rules.md raw layer §Decision (open rules) + §AMENDMENT 2026-05-02 (database.rules.json locked schema + activation prerequisites)
voice_preservation: synthesis + verbatim + bugatti + crossrefs
cross_refs:
  - "[[adr-002-firebase-rest-not-sdk]]"
  - "[[adr-001-local-first-storage]]"
  - "[[adr-multi-tenant-auth]]"
amendments:
  - date: 2026-05-02
    note: database.rules.json target schema LANDED repo root + activation gated Auth migration completion (Firebase Auth integration + path migration users/daniel → users/$uid + cross-ref ADR_MULTI_TENANT_AUTH_v1)
---

# ADR 007 — Firebase RTDB Open Rules

## Synthesis

ADR 007 = decision open rules (`".read": true, ".write": true`) Firebase RTDB single-user personal app phase. Original LOCK V1 2026-04-23. Database path `users/daniel` non-sensitive personal fitness data (body weight + workout history, no PII beyond). Zero auth complexity, NU login flow personal device. Accepted risk: data technically world-readable/writable to anyone cu URL (NOT publicly shared). §AMENDMENT 2026-05-02 = `database.rules.json` LANDED repo root cu **locked target schema** per-uid scoped (`auth !== null && auth.uid === $uid`) — **activation GATED pe Auth migration completion**. Prerequisites 3: (1) Firebase Auth integration token query string `?auth=<idToken>` OR upgrade Firebase JS SDK implicit auth, (2) Path migration `users/daniel` → `users/<uid>` `firebase.auth().currentUser.uid` + one-shot RTDB copy preserving existing data, (3) Cross-ref ADR_MULTI_TENANT_AUTH_v1 Magic Link Auth gating dependency. Mis-publication blast radius documented: existing `users/daniel/*` unreadable → app reads null → silent fail writes lost.

## Verbatim quotes Daniel

Daniel verbatim chat strategic 2026-04-30 → 2026-05-02 Auth migration gating prerequisite (cross-ref [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §34.2 Blocker 2 spec):

> *"NU publish rules pre Auth migration. Production app brick instant."*

(Synthesis paraphrase Daniel chat strategic context Auth migration prerequisite — verbatim catalog dense în HANDOVER raw layer §34.2.)

Daniel articulation cross-ref Auth scope deferred chat strategic 2026-04-30 → 2026-05-04 Multi-tenant Auth Phase 2 RESOLVED 2026-05-06 Magic Link SMTP (cross-ref [[adr-multi-tenant-auth]]):

> *"single-user personal Daniel scope acum. Multi-tenant Auth real Magic Link SMTP Phase 2 cand reach scope user real."*

(Paraphrased synthesis universal scope chat strategic 2026-04-30+ Auth migration timeline.)

## Bugatti framing notes

**Quality > Speed via activation gating:** Schema file LANDED git audit trail + emulator-ready, dar Firebase Console publication blocked Auth migration completion. NU push prematur risk silent production brick. Bugatti craft = preservation safety + audit trail.

**Anti-RE considerations:** Open rules current = NO obfuscation (transparent infrastructure decision documented ADR). Target schema per-uid auth = standard pattern, NU proprietary.

**Voice tone notes:** Daniel autonomy lock chat strategic 2026-04-30+ delegate Co-CTO autonomous Auth Phase 2 decisions — NU paternalism review required.

**Anti-paternalism notes:** ADR 007 = transparent risk disclosure user (Daniel) accepted personal app phase. NU vault forces "Auth right now" prescriptive — context-aware single-user prudent decision documented.

## Cross-refs raw layer

- [[../../../03-decisions/007-firebase-open-rules]] §Decision (open rules) + §AMENDMENT 2026-05-02 (target schema + activation prerequisites + blast radius)
- [[../../../03-decisions/002-firebase-rest-not-sdk]] §Decision (REST API cross-dependency Auth token query string requirement)
- [[../../../03-decisions/ADR_MULTI_TENANT_AUTH_v1]] §Implementation Sprint (Auth Magic Link gating dependency)
- [[../../../06-sessions-log/HANDOVER_GLOBAL_2026-04-30_evening]] §34.2 (Blocker 2 Firebase Rules RTDB Lock pre-launch spec)
- [[../../../database.rules.json]] (target locked schema file LANDED repo root 2026-05-02)
- [[../../../03-decisions/DECISION_LOG]] §2026-05-02 entry

🦫 **ADR 007 Firebase Open Rules LOCK V1 2026-04-23 + §AMENDMENT 2026-05-02 database.rules.json target schema LANDED + activation gated Auth migration. Single-user personal phase prudent, multi-tenant Auth Phase 2 RESOLVED 2026-05-06 Magic Link SMTP transition.**
