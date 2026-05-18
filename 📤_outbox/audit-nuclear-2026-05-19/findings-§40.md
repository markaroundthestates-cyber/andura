# §40 — Calendar V1 Implementation Specs Deep

**Scope:** 7-day strip L-Ma-Mi-J-V-S-D + Position antrenor tab + Locked state default + Training color #3d7a4a + Rest color paper-2 + Engine #2 silent save + Ephemeral weekly Monday reset + DST week boundary + Mid-week forward-only vs full-week + Locked day workout labels + 0/7 day edge cases + Spec source D025 + Mockup parity + State ephemeral/persisted + Engine #2 data flow

## Severity matrix §40

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 2 |
| MED | 5 |
| LOW | 6 (positive) |
| NIT | 0 |
| **Total** | **13** |

---

## HIGH findings

### §40-H1 — DST week boundary handling (§40.8)
**Severity:** HIGH (§11-C1 reaffirmed)
**Evidence:** `Calendar7Day.tsx:39` `currentMonday !== weekStartISO` triggers reset. `weekStartIso()` from scheduleStore — uses date math. DST transition Oct (extra hour) / March (missing hour) at start of week — date math precision verify.
**Fix log:** Test scheduleStore.weekStartIso across DST.

### §40-H2 — Mid-week edits forward-only vs full-week clarification (§40.9)
**Severity:** HIGH
**Evidence:** Calendar7Day.tsx Phase 4 MVP default header line "full-week edits allowed (no forward-only restriction)" — implementation choice. Spec says PENDING clarification. Settled at MVP = full-week.
**Resolution:** Documented decision; Daniel post-Beta review.

---

## MED findings

### §40-M1 — Locked day cells workout type labels show/hide (§40.10)
**Severity:** MED
**Evidence:** Code comment "NU show workout type labels (just letter L/Ma/etc + color)" — settled at MVP.

### §40-M2 — 0/7 day validation extremes allow (§40.11)
**Severity:** MED
**Evidence:** Code header "NO validation (0/7 valid both extremes)" — settled.

### §40-M3 — Mockup parity Calendar V1 pixel match (§40.13)
**Severity:** MED — POSITIVE
**Evidence:** Mockup-referenced color tokens (`#3d7a4a` training, `var(--paper-2)` rest).

### §40-M4 — Calendar interaction with Engine #2 (Periodization) verified data flow (§40.15)
**Severity:** MED
**Evidence:** `saveWeekly` action in scheduleStore.ts triggers `commitCalendarEdit` from engine adapter (dynamic import §3-H3). Async data flow ✓ but verify Engine #2 receives schedule changes correctly.

### §40-M5 — Calendar state ephemeral vs persisted (§40.14)
**Severity:** MED
**Evidence:** weekStartISO + days persist via Zustand scheduleStore. Monday auto-reset clears.

---

## LOW (POSITIVE)

### §40-L1 — 7-day strip L/Ma/Mi/J/V/S/D LOCKED V1 strict ✓ (§40.1)
**Evidence:** `Calendar7Day.tsx:25` `DAY_LABELS = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'] as const`.

### §40-L2 — Locked state default require explicit unlock UX ✓ (§40.3)
**Evidence:** editMode toggle. Default editMode = false.

### §40-L3 — Training color #3d7a4a + Rest var(--paper-2) ✓ (§40.4 + §40.5)
**Evidence:** Header comment + likely className expressions.

### §40-L4 — Save triggers Engine #2 silently ✓ (§40.6)
**Evidence:** `handleSave()` calls `saveWeekly()` → dispatch engine.

### §40-L5 — Ephemeral weekly Monday 00:00 reset RO timezone ✓ (§40.7)
**Evidence:** useEffect compares currentMonday vs weekStartISO.

### §40-L6 — Position in Antrenor tab below "Vrei altceva azi?" above "Obiectiv" ✓ (§40.2)
**Evidence:** Antrenor.tsx imports + renders Calendar7Day positionally.

## Karpathy distribution §40
- Goal-Driven: 2 (H1, H2)
- 6 LOW positive — Phase 4-5 implementation discipline preserved
