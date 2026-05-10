# TASK 01 — Big 6 Hard T0 Clasic Mockup

- **Model:** Opus 4.7
- **Status:** ✅ Complete
- **Date:** 2026-05-10 0625
- **Backup tag:** `pre-task01-big6-clasic-2026-05-10-0621` (pushed origin)
- **Commit:** `c6b1204` pushed origin/main

## Pre-flight findings

- Mockup path verified: `04-architecture/mockups/andura-clasic.html` (160169 bytes)
- Onboarding section current state = **5 ecrane** (Obiectiv / Vârstă / Sex / Istoric medical / Frecvență) — NU 7 cum ar fi spec Big 6
- **Înălțime + Greutate fields MISSING from onboarding flow** (existau doar în Settings → Profile section per stale §AMENDMENT 2026-05-04 evening "move post-onboarding" SUPERSEDED de §AMENDMENT 2026-05-05.7 Big 6 hard T0)
- ADR_MULTI_TENANT_AUTH_v1 §AMENDMENT 2026-05-05.7 verified authoritative: Big 6 = Sex / Vârstă / Înălțime / Greutate / Obiectiv / Frecvență toate hard required T0
- Skip flag found: `data-action="skip-auth"` (line 437) = auth skip "Continuă fără cont" per Q6 LOCK (NU Big 6 skip — preserved)
- Sex current state = M/F only (NU M/F/Altul cum ar fi spec ONBOARDING_SSOT_V1 §1 ECRAN 3)

## Modificări (8 edits + scope expansion documented)

| Edit | Line | Change |
|------|------|--------|
| Comment | 463 | "5 ecrane <45 sec" → "7 ecrane V2 Big 6 hard T0 per ADR_MULTI_TENANT_AUTH §AMENDMENT 2026-05-05.7" |
| Ecran 1 Obiectiv | 468-477 | Progress dots 5→7 + "1 din 5" → "1 din 7" |
| Ecran 2 Vârstă | 517-528 | Progress dots 5→7 + "2 din 5" → "2 din 7" + add `required` attr la age input |
| Ecran 3 Sex | 542-568 | Progress dots 5→7 + "3 din 5" → "3 din 7" + ADD Altul 3rd option (M/F/Altul per spec) + change goto `onb-medical` → `onb-inaltime` |
| **NEW Înălțime ecran** | 571-596 | Insert ecran 4 of 7 — input cm range 100-250 step=1 + `required` + Mifflin-St Jeor BMR rationale + goto `onb-greutate` |
| **NEW Greutate ecran** | 598-623 | Insert ecran 5 of 7 — input kg range 30-300 step=0.1 + `required` + baseline calibrare wording + goto `onb-medical` |
| Ecran (was 4) Istoric medical | 626-641 | Progress dots 5→7 + "4 din 5" → "6 din 7" + Pasul 4 → Pasul 6 + comment update "skippable default Niciuna per §50.3 D2" |
| Ecran (was 5) Frecvență | 663-680 | Progress dots 5→7 + "5 din 5" → "7 din 7" + Pasul 5 → Pasul 7 + final button "sub 45 sec" → "sub 60 sec" |
| JS comment | 2110 | "5 ecrane §63.1" → "7 ecrane V2 §63.1 + Big 6 hard T0" |

**Scope expansion (DECISION ApprovedDaniel mid-flight):** Task spec assumed skip removal + required attr on existing fields. Pre-flight found fields don't exist in onboarding. Daniel approved Option A: add 2 new ecrane between Sex and Istoric medical per Task 05 spec ("7 ecrane V2 logic structure"). Realistic Task 01 scope = ~30-45 min not 10-15 min.

## Tests + Build

```
$ npm run test:run
Test Files  148 passed (148)
     Tests  2731 passed (2731)
  Duration  ~26-27s
```

✅ **2731 PASS preserved EXACT** (mockup-only edit, ZERO src impact). Pre-commit hook validated.

## Commits + push

- Backup tag: `pre-task01-big6-clasic-2026-05-10-0621` pushed origin
- Commit: `c6b1204` pushed origin/main
- LATEST cycle commit + task_01 archive: pending

## Issues

None functional. **Open for Tasks 02-04 cross-skin same pattern:** Living Body / Luxury / Brain Coach mockups need same Big 6 ecrane addition (insert Înălțime + Greutate between Sex and Istoric medical, progress dots 5→7, navigation chain rewire, skin-specific styling preserved per Theme Parity Invariant V1).

**Theme Parity Invariant V1 implication:** Visual character (palette/fonts/spacing) per skin will differ, but ecrane structure + count + order + field types must match cross-skin × 4.

## Next action

**TASK 02** (Big 6 Hard T0 Living Body mockup) — same pattern as Task 01 cu Living Body design tokens (dark navy + auriu cald palette).
