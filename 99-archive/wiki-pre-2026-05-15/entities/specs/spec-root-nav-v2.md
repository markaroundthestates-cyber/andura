---
title: Spec Root Nav V2 — §29.5.7 V2 Quad Antrenor/Progres/Istoric/Cont SUPERSEDE V1 Trio
type: entity-spec
status: locked-v1
last_updated: 2026-05-12
cross_refs:
  - "[[../../../04-architecture/ROOT_NAV_V2_29_5_7_AMENDMENT]]"
  - "[[../adrs/adr-005-vanilla-js]]"
  - "[[../features/feature-mode-detection]]"
---

# Spec Root Nav V2

## Synthesis

**ROOT_NAV_V2_29_5_7_AMENDMENT** = UX architecture canonical SSOT §29.5.7 V2 amendment recovery from archived HANDOVER_MISC source. **Authority:** Daniel chat-NEW1 ACASĂ 2026-05-07 (UX brainstorm root nav LOCK V1) + chat-NEW2 birou 2026-05-07 (naming pivot SUPERSEDE chat-NEW1 final V2 LOCK). **Status LOCKED V1** replaces §29.5.7 V1 trio Azi/Istoric/Profil with V2 quad Antrenor/Progres/Istoric/Cont.

**§29.5.7 V1 ORIGINAL LOCKED V1 baseline preserved verbatim from archive:** Trio minimalist (3 tab-uri): Azi (antrenament zilei) / Istoric (calendar + progres) / Profil (setări + obiective). Sesiune persistentă pattern (user începe antrenament → ecran execuție prioritar → iese accidental → mini-player vizibil top screen → antrenament rămâne activ fundal → date NU se pierd niciodată).

**§29.5.7 V2 AMENDMENT 2026-05-07 chat-NEW1 LOCK + chat-NEW2 SUPERSEDE final:** SUPERSEDE V1 trio minimalist 3 tab-uri → V2 quad 4 taburi distincte non-overlapping. chat-NEW1 step 1: "Sala / Antrenor / Istoric / Cont" → chat-NEW2 SUPERSEDE final naming pivot: **"Antrenor / Progres / Istoric / Cont"**. Naming evolutions chat-NEW1: "Coach" → "Antrenor" (RO pure, drop Anglicisms inconsistent).

**Recovered from archive:** `📤_outbox/_archive/2026-05/223_HANDOVER_MISC_2026-04-30_evening_CAPACITY_A_DEPRECATED.md` line 2488 §29.5.7 V1 content + chat-NEW1+NEW2 LOCK narratives. Cross-ref [[../features/feature-mode-detection]] 5 moduri pure event listeners deterministic + Root Nav V2 quad design.

## Verbatim quotes Daniel

Daniel verbatim chat-NEW1 ACASĂ 2026-05-07 UX brainstorm root nav LOCK V1 step 1:
> *"V2 quad LOCKED step 1: Sala / Antrenor / Istoric / Cont (4 taburi distincte non-overlapping)."*

Daniel verbatim naming evolutions chat-NEW1 RO pure preserved:
> *"'Coach' → 'Antrenor' (RO pure, drop Anglicisms inconsistent)."*

Daniel verbatim chat-NEW2 birou 2026-05-07 SUPERSEDE final naming pivot:
> *"SUPERSEDE chat-NEW1 final V2 LOCK — Antrenor / Progres / Istoric / Cont. Naming pivot final."*

Daniel verbatim §29.5.7 V1 sesiune persistentă pattern preserved baseline:
> *"Sesiune persistentă: când user începe antrenament, ecran execuție prioritar. Iese accidental → mini-player vizibil top screen, antrenament rămâne activ fundal. Date NU se pierd niciodată."*

## Bugatti framing notes

**Gigel test relevance:** Quad 4 taburi distincte non-overlapping = zero gândire user (recognize 4 tabs instant + each tab distinct purpose). RO pure naming (NU "Coach") = cultural alignment Gigel-friendly.

**Quality > Speed via Anti-Anglicism RO pure naming pivot:** chat-NEW1 → chat-NEW2 evolution pattern "Coach" → "Antrenor" reflects RO cultural language discipline (anti-Anglicisms inconsistent). Pattern: vernacular preservation cross-feature.

**Anti-RE considerations:** V1 trio "Azi/Istoric/Profil" → V2 quad "Antrenor/Progres/Istoric/Cont" SUPERSEDE = anti-recurrence "minimalist trio insufficient distinct purposes". Pattern: 4 taburi distincte non-overlapping better than 3 overlapping (Profil/Cont distinction + Antrenor/Progres distinction).

**Anti-paternalism notes:** Sesiune persistentă pattern + mini-player vizibil top screen = user agency preserved (NU forced data loss "iese accidental"). Pattern: durability invariant zero data loss prag UX critical.

**Voice tone notes:** Daniel-isms "RO pure drop Anglicisms inconsistent" + "4 taburi distincte non-overlapping" recurring patterns (RO cultural + UX clarity discipline preserved). Naming evolution craft.

## Cross-refs raw layer

- [[../../../04-architecture/ROOT_NAV_V2_29_5_7_AMENDMENT]] §29.5.7 V1 ORIGINAL + V2 AMENDMENT chat-NEW1+NEW2 LOCK verbatim
- [[../../../04-architecture/mockups/andura-v2-2026-05-07.html]] CD V2 mockup canonical chat-NEW3 LOCKED
- [[../../../04-architecture/mockups/andura-clasic.html]] §bottom-nav line 1701-1715 V2 SoT 4 taburi LANDED
- [[../../../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-10 Port-First-Then-React paradigm Step 1 vanilla port mockup V2 → prod
- [[../../../00-index/CURRENT_STATE]] §JUST_DECIDED chat-NEW1+NEW2 entries 2026-05-07
- [[../../../03-decisions/DECISION_LOG]] §2026-05-07 chat-NEW1+NEW2 entries (Run 6 Task 2 sync)
- [[../../../📤_outbox/_archive/2026-05/223_HANDOVER_MISC_2026-04-30_evening_CAPACITY_A_DEPRECATED]] line 2488 §29.5.7 V1 verbatim source
- [[../features/feature-mode-detection]] (5 moduri pure event listeners deterministic + Root Nav V2 quad design integration)

🦫 **Spec Root Nav V2 §29.5.7 V2 AMENDMENT LOCKED V1 2026-05-07. SUPERSEDE V1 trio Azi/Istoric/Profil → V2 quad Antrenor/Progres/Istoric/Cont 4 taburi distincte non-overlapping. RO pure naming anti-Anglicisms inconsistent. Sesiune persistentă pattern preserved baseline durability invariant.**
