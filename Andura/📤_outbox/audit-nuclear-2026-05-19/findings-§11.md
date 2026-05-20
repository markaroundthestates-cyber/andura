# §11 — i18n / Localization Audit

**Scope:** RO date/decimal/weekday/timezone/DST/midnight/leap-year/glyphs/parsing/plural rules

## Severity matrix §11

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 3 |
| MED | 4 |
| LOW | 2 (positive) |
| NIT | 0 |
| **Total** | **10** |

---

## CRITICAL findings

### §11-C1 — DST transition (last Sunday March +1h / last Sunday October -1h) — NOT VERIFIED in tests for streak counter day boundary OR calendar week boundary
**Severity:** CRITICAL (§11.8 + §38.18)
**Evidence:** Grep `Europe/Bucharest|isoWeek|tz` returns hits in src/util/isoWeek.js, src/engine/calibration.js, etc. Implementation present. BUT test files for `vi.setSystemTime` covering DST transitions: 11 files use fake timers (§2-M1), unclear which test DST specifically. Streak counter math `Date.now() - lastSession.ts > 14*86400000` (Antrenor.tsx:80) uses fixed 86,400,000 ms = wall-clock day — DST 25h or 23h day BREAKS this exact arithmetic at boundary.
**Karpathy:** Goal-Driven — RO users on DST cross will see wrong streak after Oct/March transition.
**Fix log:** Add DST transition tests:
- Test `streakCounter` across Oct DST boundary (23h day): session at 2025-10-25 22:00 RO, next at 2025-10-26 22:00 RO → wall-clock delta < 86400000 ms but calendar day +1 → streak should increment.
- Test `streakCounter` across March DST boundary (25h day): similar inverse.
- Use `vi.setSystemTime` with explicit DST timestamps.

---

## HIGH findings

### §11-H1 — Antrenor.tsx FOURTEEN_DAYS_MS = 14 × 86400000 — wall-clock math fails near DST
**Severity:** HIGH (§11.10 leap year + DST adjacent)
**Evidence:** `Antrenor.tsx:48` `const FOURTEEN_DAYS_MS = 14 * 86400000;`. Used in `showReactivate = lastSession !== null && Date.now() - lastSession.ts > FOURTEEN_DAYS_MS && !reactivateDismissed && pausedSnapshot === null`. Strictly wall-clock difference; near DST, 14 days = either 14×24+1 OR 14×24-1 hours. Off-by-1-hour edge case for "reactivate" UX prompt.
**Karpathy:** Surgical Changes.
**Reasoning:** User dormant 14 days exactly across DST → prompt either shows 1h early or 1h late. Minor UX impact but cumulative.
**Fix log:** Use date-fns `differenceInCalendarDays(now, lastSession.ts) > 14` (date-fns deps missing — need add) OR custom calendar-aware diff.

### §11-H2 — date-fns NOT in dependencies — date arithmetic relies on Date math + manual conversions
**Severity:** HIGH (§11.10 + §11.16 plural rules)
**Evidence:** `package.json` deps: no `date-fns`, no `dayjs`, no `luxon`. Custom isoWeek.js exists in src/util. Risk: each ad-hoc Date math impl varies.
**Fix log:** Install `date-fns@^3` (smaller than luxon, tree-shake friendly). Migrate Date math to date-fns helpers. ETA: M.

### §11-H3 — Romanian plural rules (1/2-19/20+) NOT IMPLEMENTED
**Severity:** HIGH (§11.16)
**Evidence:** Grep `Intl.PluralRules\|pluralize` → ZERO hits. UI strings sample: "Pasul 1 din 7" (Onboarding.tsx) — no plural variant for "Pași". `Streak 3` vs `Streak 1 zi` vs `Streak 5 zile` — RO plurals 1 zi / 2-19 zile / 20+ de zile.
**Fix log:** Implement `pluralRo(n, 'zi', 'zile', 'de zile')` helper. Wire in StatsGrid + relevant strings.

---

## MED findings

### §11-M1 — Number formatting locale-aware (Intl.NumberFormat('ro-RO')) NOT VERIFIED in production UI
**Severity:** MED (§11.5)
**Evidence:** Sample components display values (`<div>{streak}</div>`, `{kcalTarget} kcal`) without explicit locale formatting. RO convention: virgulă decimal `1,5` not `1.5`. Engine outputs likely integer (kcal, kg, reps); float values (BMR, 1RM estimate) may show without locale.
**Fix log:** Centralize `formatNumber(value, options)` helper using `new Intl.NumberFormat('ro-RO', options)`. Apply at UI render boundary.

### §11-M2 — Decimal separator parsing: input "85,5" RO vs "85.5" EN NOT VERIFIED handle both
**Severity:** MED (§11.14)
**Evidence:** Onboarding Step6 weight numeric input — verify input parser accepts both formats.
**Fix log:** Audit numeric input fields; add `parseLocaleNumber(s, 'ro-RO')` utility.

### §11-M3 — "Today" / "Yesterday" / "Acum o săptămână" — consistency NOT verified across app
**Severity:** MED (§11.12)
**Evidence:** No grep hits for "Azi" / "Ieri" / "Acum" relative-date strings — likely engine SoT emits these; verify §47 + secondary.

### §11-M4 — RO glyphs in UI text (ș/ț/â/î/ă) RESERVED for vault docs only — strip in UI verified ✓
**Severity:** MED — POSITIVE (§11.13)
**Evidence:** Per §9-L1 ZERO RO diacritics in JSX strings. Compliant.

---

## LOW (POSITIVE) findings

### §11-L1 — `<html lang="ro">` ✓
**Resolution:** OK per §6-L1.

### §11-L2 — Weekday names L/Ma/Mi/J/V/S/D LOCKED V1 strict — Calendar7Day.tsx implementation TBD (covered §40)
**Resolution:** Covered §40.

---

## Coverage map §11.x

| Sub | Title | Severity |
|-----|-------|----------|
| 11.1 | Date format dd.MM.yyyy | NOT VERIFIED audit |
| 11.2 | Decimal separator | §11-M2 MED |
| 11.3 | Weekday L/Ma/Mi/J/V/S/D | covered §40 |
| 11.4 | Currency RON | N/A no payment yet |
| 11.5 | Intl.NumberFormat ro-RO | §11-M1 MED |
| 11.6 | Time 24h | OK implicit |
| 11.7 | Timezone Europe/Bucharest | §11-C1 |
| 11.8 | DST transitions | §11-C1 CRITICAL |
| 11.9 | Midnight rollover | §11-C1 covered |
| 11.10 | Leap year | §11-H2 — date-fns absent |
| 11.11 | 25h/23h DST day math | §11-C1 + §11-H1 |
| 11.12 | "Today"/"Yesterday"/"Last week" | §11-M3 MED |
| 11.13 | RO glyphs UI strip | §11-M4 ✓ POSITIVE |
| 11.14 | Numeric parsing locale | §11-M2 MED |
| 11.15 | i18n pipeline future-proof | RO-only documented decision OK |
| 11.16 | Plural rules RO 1/2-19/20+ | §11-H3 HIGH |

## Karpathy distribution §11
- Goal-Driven: 4 (C1, H1, H2, H3)
- Surgical Changes: 2 (H1, M2)
