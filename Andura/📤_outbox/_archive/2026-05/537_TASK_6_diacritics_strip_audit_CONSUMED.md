# TASK 6 — Diacritics strip audit cross-codebase NO_DIACRITICS_RULE compliance

**Track:** Pre Bugatti Audit Nuclear final preparation.
**Category:** PROC / audit-only.
**Atomic commit type:** ZERO src/ commit dacă doar audit. `fix(i18n):` cluster dacă cleanup violations found.

## Intent

Per `DECISIONS.md §D-LEGACY-064` Romanian no-diacritics LOCK V1 PERMANENT (2026-05-10):

> Strip diacritice (ă, â, î, ș, ț, Ă, Â, Î, Ș, Ț) din TOATE:
> - UI strings user-facing (src/pages/, src/components/)
> - Tests assertions strings
> - Mockups (04-architecture/mockups/)
>
> Diacritice **PRESERVED** doar în:
> - Vault docs internal (07-meta/, 03-decisions/, etc.)
> - Code comments (NU strings runtime)
> - User-input fields content (NU UI display, NU validation messages)

Pre Bugatti Audit Nuclear: audit cross-codebase pentru diacritice **rămase neintenționat** în zone UI/tests/mockups. Cluster recent triple LANDED 2026-05-15 (LOCK 9 + LOCK 10 + LOOP CLOSE) suspect — audit specific acel cluster + general sweep.

## Discovery sequence

### 1. Grep diacritice în zone violation

```bash
# UI strings violation candidates
grep -rn "[ăâîșțĂÂÎȘȚ]" src/pages/ src/components/ src/coach/ 2>/dev/null | head -100

# Tests assertions violation candidates
grep -rn "[ăâîșțĂÂÎȘȚ]" src/**/*.test.js src/__tests__/ 2>/dev/null | head -50

# Mockup violation candidates
grep -rn "[ăâîșțĂÂÎȘȚ]" 04-architecture/mockups/ 2>/dev/null | head -50
```

### 2. Cluster focus: triple LANDED 2026-05-15

Specific verifică:
- `e44137f` LOCK 9 commit diff diacritice introduse: `git show e44137f -- "*.js" "*.html" | grep -E "[ăâîșțĂÂÎȘȚ]"`
- `892ebca` LOCK 9 LOOP CLOSE: idem
- `e6fd974` LOCK 10 MMI: idem
- Specific wording cluster MMI buttons "Reincep treptat (recomandat)" / "De la zero" — PRIMER §6 Track 3 flag explicit "diacritics strip decision".

### 3. Classify each violation

| Categorie | Action |
|---|---|
| UI string user-facing src/ | FIX (strip diacritice — autonomous OK ENG tactical) |
| Test assertion string (compares UI) | FIX (must match stripped UI strings) |
| Mockup HTML user-facing text | FIX (parity with prod stripped) |
| Code comment src/ | OK (preserve) |
| Vault doc internal | OK (preserve) |
| User input placeholder (`placeholder="..."`) | FIX (user-facing display strip) |
| Variable name în cod (`const obiectiv`) | OK (ASCII anyway, NU diacritice) |

### 4. Wording user-facing strict (D009 boundary)

Per `DECISIONS.md §D009` CEO scope strict UI wording autonomous compose = SLIP DEFAULT:

**STRIP diacritice = engineering normalization** (autonomous OK, NU "compose wording").
**REWRITE / REPHRASE = wording change** (CEO scope, flag TASK 7).

Edge case: dacă strip diacritice creează ambiguity sau ugliness (ex: "tine" în loc de "ține" devine "tine" — ambiguu cu "tine" pronume) → flag pentru CEO review (TASK 7) NU autonomous rewrite.

## Fix strategy (autonomous)

Pentru fiecare violation classified FIX:
- Replace diacritice with ASCII equivalent (ă→a, â→a, î→i, ș→s, ț→t).
- Verify replace NU sparge variable references sau JSON keys.
- Re-run tests post-strip per cluster (incremental, NU mass replace 100% înainte test).

**Commit granularity:**
- src/pages/*.js cluster → 1 commit `fix(i18n): strip diacritice src/pages user-facing strings`.
- mockup-clasic.html cluster → 1 commit `fix(mockup): strip diacritice 04-architecture user-facing parity NO_DIACRITICS_RULE`.
- tests cluster → 1 commit `fix(tests): strip diacritice test assertions match stripped UI`.

Maximum 3 atomic commits TASK 6 (NU per-line commits).

## Acceptance criteria

- [x] Audit grep results raportat (count violations per categorie).
- [x] Fix-uri LANDED pentru categoriile autonomous (UI strings, tests, mockup).
- [x] Edge cases ambiguity flagged TASK 7 (CEO review).
- [x] Vault docs + code comments preserved (NU touched).
- [x] Tests baseline 3734 PASS preserved post-strip (re-run mandatory).
- [x] Smoke E2E playwright vs live andura.app 4 taburi (verify UI render post-strip).
- [x] Audit raport cu fix summary la `📤_outbox/LATEST.md §TASK6`.

## Files atinse (probabil)

- `src/pages/*.js` (user-facing strings).
- `src/components/*.js` (idem).
- `src/coach/*.js` (coach voice strings, dacă diacritice prezent).
- `src/**/*.test.js` (assertion strings parity).
- `04-architecture/mockups/andura-clasic.html` (mockup user-facing).

## Raport per task

```
TASK 6 ✓/✗ — <commit hashes>
- Violations found: <count per categorie>
- Fixed autonomous: <count>
- Flagged TASK 7 ambiguity: <count + list>
- Tests post-strip: 3734 PASS preserved ✓
- Smoke E2E: 5/5 PASS ✓
```
