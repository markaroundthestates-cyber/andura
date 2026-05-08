# ROOT NAV V2 — §29.5.7 Tab Bar Navigation amendment LOCK V1 (2026-05-07 chat-NEW1 + chat-NEW2 SUPERSEDE final)

**Type:** UX architecture canonical SSOT — §29.5.7 V2 amendment recovery from archived HANDOVER_MISC source.
**Authority:** Daniel chat-NEW1 acasă 2026-05-07 (UX brainstorm root nav LOCK V1) + chat-NEW2 birou 2026-05-07 (naming pivot SUPERSEDE chat-NEW1 final V2 LOCK).
**Status:** LOCKED V1 — replaces §29.5.7 V1 trio Azi/Istoric/Profil with V2 quad Antrenor/Progres/Istoric/Cont.
**Recovered from archive:** `📤_outbox/_archive/2026-05/223_HANDOVER_MISC_2026-04-30_evening_CAPACITY_A_DEPRECATED.md` line 2488 §29.5.7 V1 content + chat-NEW1+NEW2 LOCK narratives.
**Cross-refs:** [[../00-index/CURRENT_STATE]] §JUST_DECIDED chat-NEW1+NEW2 entries | [[../03-decisions/DECISION_LOG]] 2026-05-07 chat-NEW1+NEW2 entries (Run 6 Task 2 sync) | [[../04-architecture/mockups/andura-v2-2026-05-07.html]] CD V2 mockup canonical (chat-NEW3 LOCKED).

---

## §29.5.7 V1 ORIGINAL (LOCKED V1 baseline — preserved verbatim from archive)

> **Trio minimalist (3 tab-uri):** Azi (antrenament zilei) / Istoric (calendar + progres) / Profil (setări + obiective).
>
> **Sesiune persistentă:** când user începe antrenament, ecran execuție prioritar. Iese accidental → mini-player vizibil top screen, antrenament rămâne activ fundal. Date NU se pierd niciodată.

**Source verbatim:** `📤_outbox/_archive/2026-05/223_HANDOVER_MISC_2026-04-30_evening_CAPACITY_A_DEPRECATED.md:2488-2492`.

---

## §29.5.7 V2 AMENDMENT 2026-05-07 (chat-NEW1 LOCK + chat-NEW2 SUPERSEDE final)

### chat-NEW1 acasă 2026-05-07 (UX brainstorm root nav LOCK V1 step 1)

**SUPERSEDE V1 trio minimalist 3 tab-uri:**
- ❌ V1 trio: Azi / Istoric / Profil (DEPRECATED)
- ✅ chat-NEW1 V2 quad LOCKED step 1: **Sala / Antrenor / Istoric / Cont** (4 taburi distincte non-overlapping)

**Naming evolutions chat-NEW1:**
- "Coach" → "Antrenor" (RO pure, drop Anglicisms inconsistent)
- "Pilot Automat" → "Auto" simplified (concision + scan-friendly)
- Body comp tab = "Antrenor" (IRL holistic argument personal trainer)
- Sport sesiune tab = "Sala" (verdict explicit pending — PENDING TIL chat-NEW2)

### chat-NEW2 birou 2026-05-07 — SUPERSEDE FINAL chat-NEW1 (LOCK V1 step 2)

⚠️ **NAMING SUPERSEDED chat-NEW1 step 1 — Daniel articulate** *"denumirea mi se pare mai umana asa... si in chat 1 asta am vrut sa zic"* — frame natural intuitiv:

- "Sala" (chat-NEW1) → **"Antrenor"** SUPERSEDE V2 LOCK FINAL (cine te ghidează în sală — sport sesiune log seturi/RPE/timer)
- "Antrenor" body comp (chat-NEW1) → **"Progres"** SUPERSEDE V2 LOCK FINAL (body comp + nutriție + Auto + sport plan supervision — măsori NU te antrenezi)
- Istoric + Cont preserved unchanged

**Subtitle xlsx Daniel verbatim:** *"Antrenor = cine te ghidează în sală. Progres = body comp & nutriție. Istoric = trecut. Cont = admin."*

### Root nav primary V2 SUPERSEDE LOCK FINAL 4 taburi

**LOCKED V1 final canonical SSOT:**

| Tab | Scope | Cross-ref |
|-----|-------|-----------|
| **Antrenor** | Cine te ghidează în sală — sport sesiune log seturi/RPE/timer + Programe (5 templates MUTATE Progres→Antrenor sub `📋 PROGRAM` + Programul săptămânii) + Bibliotecă exerciții (drill 2°, NU first-class) + POST-SESIUNE adaugă "RPE / Recovery rating" | chat-NEW2 §2 Antrenor tab restructure |
| **Progres** | Body comp + nutriție + Auto + sport plan supervision — măsori NU te antrenezi | chat-NEW2 §1 Pivot semantic |
| **Istoric** | Trecut — cronologic listă minimalistă §29.5.9 (filtru/sort DROP V1 defer v1.5) | chat-NEW2 §5 (Filtru/sort istoric DROP V1) + V1 §29.5.9 preserved |
| **Cont** | Admin — Cont V2 inventar complet (header avatar+nume+email + CONT/GENERAL/DATE&CONFIDENȚIALITATE/ZONĂ SENSIBILĂ/Footer) | chat-NEW1 §6 Cont V2 inventar LOCKED |

### Drift production 6→4 taburi de implementat

**Production actual (drift):** 6 taburi (Dashboard / Greutate / Program / Plan / Setări / ?)
**Spec V2 LOCKED final:** 4 taburi (Antrenor / Progres / Istoric / Cont) — absorbție logică sub root tabs (Dashboard/Greutate/Program/Plan ca taburi separate ștergere, logica absorbită în Antrenor/Progres).

### Sesiune persistentă pattern (V1 PRESERVED)

**Pattern preserved unchanged from V1:** când user începe antrenament, ecran execuție prioritar. Iese accidental → mini-player vizibil top screen, antrenament rămâne activ fundal. Date NU se pierd niciodată. Implementation phase via Antrenor tab session execution mode.

---

## Cross-refs canonical SSOT

- **DECISION_LOG entries:**
  - 2026-05-07 chat-NEW1 acasă entry #1 Root nav primary V1 LOCKED 4 taburi (Sala/Antrenor/Istoric/Cont SUPERSEDED chat-NEW2)
  - 2026-05-07 chat-NEW2 birou entry #1 Pivot semantic naming SUPERSEDE chat-NEW1 final
- **Mockup canonical:** `04-architecture/mockups/andura-v2-2026-05-07.html` 2126 LOC chat-NEW3 LOCKED ~98-99% spec match (V2 quad implementation faithful)
- **Implementation pending production:** nav root 6→4 refactor (post §NEXT Run 6 → React migration tactical / Faza 3 STRANGLER per Daniel decide ordering)
- **Patterns universal (chat-NEW1 LOCKED):** drill-down universal physical pages ZERO modals/dropdowns/accordion + pattern destructive confirm warning page (icon+text+2 butoane) + SSOT data layer 1-write multi-read + bilingv §29.5 V2 amendment RO+EN + selector limbă text toggle "RO/EN" Apple-style state-flip inline header

---

🦫 **§29.5.7 V2 amendment recovered canonical SSOT — Run 6 Task 3 LANDED 2026-05-08. Cumulative LOCKED V1 ~688 PRESERVED unchanged (recovery from archive NU additive — preserves chat-NEW1+NEW2 LOCK V1 entries already counted in DECISION_LOG sync Task 2).**
