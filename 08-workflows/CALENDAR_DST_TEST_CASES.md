# CALENDAR DST TEST CASES

**Owner:** Daniel (CEO + Product) · Co-CTO Claude chat
**Status:** LIVE test-case catalog — pre-Beta required for §11-C1
**Locked:** 2026-05-22 (Iter 1 Mass Fix V2 audit cluster KAPPA §40-H1/H2)
**Cross-ref:** scheduleStore.ts, Calendar7Day.tsx, ADR XXX date-fns
adoption (§41-H1), DECISIONS.md week-start ISO 8601

---

## §1 Scop

Test-case catalog pentru DST (Daylight Saving Time) transitions Romania
(EET ↔ EEST) impacting Calendar7Day week boundaries si scheduleStore
weekStartIso() determinism. Cazuri reglate de adopt date-fns dep
(§41-H1).

NU duplicate cu test runner — este checklist + tabel scenarii. Test runner
implementation in `tests/calendar/dst.test.ts` (TODO post date-fns
adoption).

---

## §2 DST Romania context

- **EET (Eastern European Time)** = UTC+2, winter
- **EEST (Eastern European Summer Time)** = UTC+3, summer
- **Switch dates:**
  - Spring forward: ultimul duminica martie 03:00 → 04:00 (-1h sleep)
  - Fall back: ultimul duminica octombrie 04:00 → 03:00 (+1h sleep)
- **Calendar7Day weekStart:** Monday ISO 8601
- **Daniel locked:** week-start ISO 8601 Monday (NU Sunday US-style)

---

## §3 Test cases — §40-H1 DST week boundary

### §3.1 Test SF-01 — Spring forward at end of week

- **Setup:** sambata 30 martie 23:59 (EET) → 31 martie 03:00→04:00 (EEST).
  Saptamana incepe 25 martie 00:00 (luni).
- **Date math:** sambata `now` = 30 martie 23:59 EET. weekStartIso() =
  ? Expected: 2026-03-25T00:00:00 (luni).
- **Risk:** daca implementare folose `Date - 6 * 86400 * 1000` (raw ms),
  DST-shift produce drift. Result poate fi 24 martie 23:00 (incorect duminica).
- **Expected:** weekStartIso() returneaza Monday 00:00 EXACT, indiferent
  de DST in mid-week.

### §3.2 Test SF-02 — Spring forward on Monday week-start itself

- **Setup:** luni 31 martie 03:00 EET → 04:00 EEST direct la weekStart.
- **Date math:** weekStartIso() at 31 martie 04:30 EEST = ? Expected:
  2026-03-31T00:00:00 EET (NU 31T01:00 din cauza shift).
- **Risk:** raw `Date.getTimezoneOffset()` shift detection.
- **Expected:** weekStart = midnight LOCAL (Romania), regardless DST.

### §3.3 Test FB-01 — Fall back at end of week

- **Setup:** sambata 25 octombrie 23:59 EEST → 26 octombrie 04:00→03:00 EET.
- **Date math:** sambata `now` = 25 oct 23:59 EEST. weekStartIso() =
  ? Expected: 2026-10-20T00:00:00 (luni). 
- **Risk:** ambiguous time 03:00-04:00 duminica (apare de 2 ori).
- **Expected:** weekStart NU afectat — luni 20 oct 00:00 unambiguous.

### §3.4 Test FB-02 — Calendar shows correct 7 days across DST

- **Setup:** vineri 24 oct 12:00 EEST. Display Calendar7Day saptamana.
- **Expected:** 7 zile afisate (luni 20 → duminica 26), fiecare cu data
  corecta + day-of-week corect. Sambata 25 + duminica 26 NOT skipped.
- **Risk:** if loop folose `day++` raw, DST-shift poate skip o zi.

### §3.5 Test CRD-01 — Cross-DST diff in days

- **Setup:** session log 28 martie 2026 EET; check 5 zile mai tarziu.
- **Date math:** `differenceInCalendarDays(2 aprilie EEST, 28 martie EET)` =
  5. NU 4 (raw ms ar fi 4 zile + 23h).
- **Risk:** Tier 0 24h expiry / Tier 1 90d rolling — DST-shift poate
  produce off-by-one.
- **Expected:** use `differenceInCalendarDays` din date-fns, NU raw ms.

### §3.6 Test CRD-02 — Tier 1 expiry exact 90 days across DST

- **Setup:** session log 1 ianuarie 2026 (EET, winter). Expire at 90
  zile = 1 aprilie 2026 (EEST, summer).
- **Date math:** 90 zile pure calendar, NU 90 * 86400 * 1000 ms.
- **Risk:** 1 aprilie ar fi 89 zile + 23h daca raw ms (DST loss 1h
  spring forward).
- **Expected:** expiry-check via `differenceInCalendarDays >= 90`
  returneaza true pentru 1 aprilie 00:00 (incl).

---

## §4 Test cases — §40-H2 Mid-week edits forward-only vs full-week

### §4.1 Decizie LOCKED V1 (Co-CTO 2026-05-22)

**MVP default = full-week edits allowed.**

Calendar7Day permite user edit orice zi a saptamanii curente (luni-duminica),
indiferent de "today". Justification:
- Marius (perf) vrea retroactive log seara dupa workout dimineata
- Gigel (Beta default) wants flexibility "am uitat sa loghez marti, dau
  acum miercuri"
- Maria 65 wants forgiveness "am gresit data, sa pot corecta"

Forward-only mode (lock past days) considerat OVER-PATERNALISTIC pre-Beta.
Possible post-Beta toggle per user preference.

### §4.2 Test cases mid-week edit

- **EDT-01:** Today = miercuri. User opens Calendar7Day, edits luni
  workout intensity. Expected: PASS, edit acceptat, log update Tier 0/1.
- **EDT-02:** Today = miercuri. User opens Calendar7Day, edits vineri
  (forward). Expected: PASS, edit acceptat ca future-plan modification.
- **EDT-03:** Today = duminica. User edits sambata's completed workout
  retroactive note. Expected: PASS.
- **EDT-04:** Today = luni saptamana NOUA. User opens previous-week
  Calendar (back-nav). Expected: PASS view-only OR edit-allowed (TBD
  Daniel — pre-Beta default = view-only; toggle post-Beta).

---

## §5 Implementation status

| Test ID | Status pre-Beta | Owner |
|---------|-----------------|-------|
| SF-01 | TODO post date-fns adoption | scheduleStore.test.ts |
| SF-02 | TODO post date-fns | scheduleStore.test.ts |
| FB-01 | TODO post date-fns | scheduleStore.test.ts |
| FB-02 | TODO post date-fns | Calendar7Day.test.tsx |
| CRD-01 | TODO post date-fns | dateUtils.test.ts |
| CRD-02 | TODO post date-fns | tierStorage.test.ts |
| EDT-01 | TODO E2E | tests/e2e/calendar-edit.spec.ts |
| EDT-02 | TODO E2E | tests/e2e/calendar-edit.spec.ts |
| EDT-03 | TODO E2E | tests/e2e/calendar-edit.spec.ts |
| EDT-04 | TODO post Daniel toggle decision | tests/e2e/calendar-back-nav.spec.ts |

**Blocker:** date-fns adoption §41-H1 (LOCKED V1 in this cluster) → 
add `date-fns` dep + refactor scheduleStore.weekStartIso() to use
`startOfWeek({ weekStartsOn: 1 })` instead of raw Date math.

---

## §6 Cross-ref

- **§11-C1 audit:** week-start ISO 8601 CRIT wave — depends on this doc.
- **§40-H1 audit:** test cases catalog SOURCE — this doc.
- **§41-H1 audit:** date-fns adoption rationale — DEPENDENCY_AUDIT.md.
- **scheduleStore.ts:** primary implementation refactor target post
  date-fns landing.
- **Calendar7Day.tsx:** UI render verify 7-day display across DST.

---

## §7 Audit chain

- date-fns adopted in package.json → refactor scheduleStore +
  Calendar7Day → all SF/FB/CRD tests pass → §40-H1 closed
- Mid-week edit toggle post-Beta → new ADR + EDT-04 update
- DST policy Romania-specific → if multi-locale post-Beta, expand to
  Luxon or per-region locale handling (separate ADR)
