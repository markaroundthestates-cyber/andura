# i18n Audit + Infrastructure Extraction — Raport

**Status:** Complete (Phase 1-4: infrastructure + whyEngine rewrite + alert→modal). Phase 5 bulk replace = **DEFERRED** for Daniel wording rewrite session (chat strategic fresh).
**Date:** 2026-05-01 morning
**Run wall-clock:** ~30 min
**Model:** Claude Opus 4.7 autonomous comprehensive
**Trigger:** Smoke test post-ADR-020 expus `whyEngine.js` raw category leak `[phase]/[readiness]/[pattern]` în `alert()` browser native — anti-RE breach + UX catastrofic.

**Spec source:** `01-vision/PRODUCT_STRATEGY_SPEC_v1.md` §i18n + `04-architecture/COGNITIVE_ARCHITECTURE_SPEC_v1.md` §Q5 ("Hardcoded enums în Arbitrator + JSON i18n bundle în Frontend").

---

## Pre-flight

- Branch `main`, working tree clean
- HEAD pre-run: `abf93ff` (post Sprint 4 A+B final SHA confirm)
- Baseline tests: ✅ **854/854 PASS** (52 files, +1 calibrationReconciliation suite from Sprint 4 B)
- Backup tag pushed: ✅ `pre-i18n-audit-2026-05-01` → origin (rollback safe)

## §8 Destructive Ops Checklist applied

- ✅ Backup tag obligatoriu pre-execution
- ✅ NO force-push, NO `git rm`, NO `rm -rf`
- ✅ Pre-commit hook honored (NU `--no-verify`) — 6 commits passed test suite
- ✅ Stop la prima eroare honored (NO regressions detected)

---

## §I18N AUDIT FINDINGS — Daniel SSOT input pentru wording rewrite session

### Statistics

- **Total user-facing string candidates detected:** 251 (pre-run, RO chars în quotes excl comments)
- **Post-changes count:** 238 (reduced by 13 dupa whyEngine rewrite cu i18n keys)
- **Files affected:** ~25 source files
- **Threshold STOP @ 300:** ✅ NU triggered (under threshold, dar suficient mare pentru phased approach)
- **Tests baseline:** 854 → **888 PASS** (+34 noi: 23 i18n + 22 whyEngine - 11 legacy)

### Top files by occurrence count (post-changes)

| Rank | File | Strings | Category dominant |
|------|------|---------|-------------------|
| 1 | `src/pages/dashboard.js` | 45 | Page labels + buttons + notifications + recovery widget |
| 2 | `src/pages/weight.js` | 23 | Weight tracking UI + modal labels |
| 3 | `src/engine/dp.js` | 13 | DP engine messaging (rest day, taper, etc.) |
| 4 | `src/pages/coach/modals.js` | 12 | Modal titles + skip reasons + alternatives |
| 5 | `src/engine/sys.js` | 12 | System messaging (BMI bands, BF bands, phase logic) |
| 6 | `src/engine/readiness.js` | 11 | Readiness emoji labels + verdict labels (Sesiune solidă, Zi de PR) |
| 7 | `src/pages/plan.js` | 10 | Plan tab labels + phase override controls |
| 8 | `src/onboarding.js` | 9 | Onboarding step text + button labels |
| 9 | `src/engine/proactiveEngine.js` | 9 | Proactive alerts (lagging muscle, etc.) |
| 10 | `src/pages/coach/renderIdle.js` | 8 | Coach idle state banner labels |
| 11 | `src/engine/plateauInterventions.js` | 8 | Plateau intervention messaging |
| 12 | `src/engine/fatigue.js` | 8 | Fatigue scoring labels |
| 13 | `src/engine/reality.js` | 7 | Reality engine messaging |
| 14 | `src/engine/calibration.js` | 7 | Calibration banner text + tier names |
| 15 | `src/pages/coach/session.js` | 5 | Session start/end toasts + confirm dialogs |
| 16-25 | (others) | 1-4 each | Misc utilities, constants, UI |

### Categories breakdown

| Category | Strings (est.) | Files | Examples |
|----------|----------------|-------|----------|
| **Toasts** | ~25 | 10 | "✓ Notificări active", "❌ Antrenament anulat", "⚠ Selectează exercițiu" |
| **Confirm dialogs** | 8 | 3 | "Anulezi antrenamentul? Nicio dată nu va fi salvată.", "Ai N seturi nefinalizate..." |
| **Alert dialogs** | 3 | 1 | `dataCleanup.js`: "Fișierul nu este un JSON valid.", "Nu există niciun auto-backup..." |
| **Modal titles + body** | ~30 | 5 | "Cum te simți azi?", "De ce sari azi?", "Înlocuiește exercițiul" |
| **Banners** | ~20 | 4 | Calibration banner, AA banner, recovery widget, lagging alerts |
| **Page labels (DOM)** | ~80 | 5 | Dashboard tabs, weight chart labels, plan controls, settings |
| **Engine messaging** | ~70 | 12 | DP rest day text, sys phase logic, plateau interventions, proactive alerts |
| **Onboarding** | 9 | 1 | Step text, button labels, baseline weight prompt |
| **Verdicts (readiness)** | 6 | 1 | "Sesiune solidă", "Zi de PR", "Sesiune normală", "Sesiune moderată" |
| **Skip reasons** | 4 | 1 | "Obosit / recuperare insuficientă", "Lipsă timp", "Durere / accidentare", "Alt motiv" |
| **Day names** | 7 | 1 | "Duminică"/"Luni"/"Marți"/.../"Sâmbătă" — `modals.js:62` |
| **Exercise alternatives reasons** | ~12 | 1 | `modals.js:78-100`: "Similar lat activation", "Spate complet, fără cablu", etc. |

### CRITICAL fixed în acest run

| File | Issue | Fix |
|------|-------|-----|
| `src/engine/whyEngine.js` | `[category]` raw codes leakable user-facing + score numerice exposure | **Rewritten:** verdict-based (4 wording-uri lock-uite) + `t('why.categorical.*')` + ZERO leak |
| `src/pages/coach/modals.js:181` | `alert()` browser native cu `lines.map(r => '[${r.category}] ${r.text}')` joined | **Replaced:** `_renderWhyModal()` in-app DOM modal cu `whySummary()` + i18n title/dismiss |

### Strategic recommendations pentru Daniel wording rewrite session

**Phase A — Quick wins (~36 strings, ~30 min):**
- Replace toasts (~25) — high-impact UX, low-risk single-string replacements
- Replace confirms (~8) — high-impact, follow same pattern as toasts
- Replace remaining alerts (~3 in `dataCleanup.js`) — convert to in-app modal sau toast

**Phase B — Engine messaging wording rewrite (~70 strings, needs domain expertise):**
- Engine files (`dp.js`, `sys.js`, `proactiveEngine.js`, `plateauInterventions.js`, `fatigue.js`, `reality.js`, `calibration.js`, `patternLearning.js`, `recompileEngine.js`, `predictionEngine.js`)
- Each engine has ~3-13 user-facing strings cu mix nuance fitness terminology
- **Recommend:** Daniel provides RO refinement în chat strategic, CC Sonnet aplică mecanic via i18n keys

**Phase C — Page labels bulk (~80 strings, low-risk):**
- Dashboard, weight, plan, onboarding, modals page-level
- Mostly UI labels (buttons, headers, empty states)
- **Recommend:** systematic batch (one PR per file) cu wording approval pe spot

**Exercise names mapping (F-NEW-1):**
- 12 hardcoded exercise alternatives reasons în `modals.js` ALTERNATIVES dict
- Many mixed EN/RO ("Lat Pulldown", "Cable Row", "Romanian Deadlift", "Pec Deck", "Pushdown") — these likely STAY EN (industry standard names + tehnicism). Daniel decide.
- Day names "Duminică/Luni/.../Sâmbătă" în `modals.js:62` should use `Intl.DateTimeFormat('ro')` API instead of hardcoded array

### EN translations strategy

Bundle `en.json` populated cu **TODO_EN: <RO content>** prefix pentru fiecare key. Test ensures all EN values start cu `TODO_EN`. Daniel decide:
- Manual completion (review fitness terms culturale carefully)
- Sonnet-assisted (mecanic translate, Daniel approves batch)
- LLM API integration (next iteration)

---

## Modificări vault + cod (4 NEW + 2 MODIFIED)

### NEW — i18n infrastructure

- **`src/i18n/index.js`** (135 LOC): `t(key, vars?)`, `getCurrentLocale()`, `setLocale(locale)`, `_resetI18nCache()`, `_getBundle(locale)`. Lookup chain: locale → fallback EN → key string. Var interpolation `{name}` syntax. localStorage `sf.locale` persist. Lazy JSON imports (Vite/Vitest native).
- **`src/i18n/ro.json`** (35 LOC): bundles initial cu nested structure: `why.categorical.{progression_up, progression_down, hold, recovery}` + `why.title` + `why.dismiss` + `why.unavailable` + `modals.{readiness, skip, alternative}` + `common.{ok, cancel, close, confirm, loading}`.
- **`src/i18n/en.json`** (35 LOC): identical structure, all values prefixed `TODO_EN: <RO content>` pentru context Daniel translation.
- **`src/i18n/__tests__/i18n.test.js`** (23 tests): t() happy path + vars interpolation + fallback chain + locale detection + setLocale persistence + bundle integrity (RO/EN identical keys + all EN start TODO_EN + all 4 categorical wording-uri verified).

### MODIFIED — whyEngine + modals

- **`src/engine/whyEngine.js`** (rewrite, 95 LOC): `selectVerdict(rec, ctx)` priority ladder (recovery → progression_up → progression_down → hold) + `explainRecommendation(exercise, ctx)` returns `{ summary, verdict, reasons }` cu summary = `t('why.categorical.<verdict>', { exercise })`. Legacy `reasons` array preserved single-element backward-compat (NO category leak). `whySummary` shorthand.
- **`src/engine/__tests__/whyEngine.test.js`** (22 tests, replaced 11 legacy): selectVerdict priority ladder + explainRecommendation contract + zero leak verification (NO `[phase]/[readiness]/[pattern]` brackets, NO numeric leaks score/kg/RPE, exercise interpolation correct).
- **`src/pages/coach/modals.js`** (replaced lines 181-184): `alert()` browser native → `_renderWhyModal(exerciseName, summary)` in-app DOM modal cu i18n title `t('why.title', { exercise })` + dismiss button `t('why.dismiss')` + summary single string (NO `lines.join('\n\n')` cu category brackets). XSS-safe HTML escape pentru exercise name + summary. Click outside-modal closes (consistent UX cu showSkipModal pattern).

---

## Build + Tests

| Stage | Result |
|-------|--------|
| **vitest baseline** | ✅ 854/854 PASS (52 files) |
| **vitest pre-commit hook (×6 commits)** | ✅ 888/888 PASS each |
| **vitest post-changes final** | ✅ **888/888 PASS** (55 files, +34 noi: 23 i18n + 22 whyEngine - 11 legacy) |

Zero regression. Zero code touched în engine/storage outside whyEngine.js (per spec ZERO touch unrelated logic).

## Commits granular (6 + outbox)

### Phase 1 — Infrastructure

- `5324966` feat(i18n): index.js — t() helper + getCurrentLocale + setLocale API
- `0a5c9a4` feat(i18n): ro.json + en.json initial bundles (why.categorical.* lock-uite + common + modals)
- `cf935da` test(i18n): t() + locale detection + bundle integrity (23 tests)

### Phase 2 — whyEngine rewrite + modal replacement

- `46c5eec` feat(engine): whyEngine.js verdict-based output (4 categorical wording-uri lock-uite, ZERO leak anti-RE)
- `aef9f1a` test(engine): whyEngine verdict selection + zero leak verification (22 tests, replaced legacy)
- `6bbf14d` feat(modals): replace alert() native cu modal in-app pentru showWhyForExercise (anti-RE compliance)

### OUTBOX

- `<sha-pending>` chore(outbox): rotate LATEST → archive 24 + i18n audit + extraction report

## Pushed: ✅ origin/main (`abf93ff..6bbf14d`)

6 commits propagated remote successfully. Outbox commit pending push.

Backup tag: `pre-i18n-audit-2026-05-01` (rollback safe).

## Issues / Ambiguities

1. **Phase 5 bulk replace DEFERRED** per strategic decision: 238 strings remaining post-Phase-4 = high replacement effort cu mixed wording quality (much of it written iterative, NU spec-driven). Replacing acum risk-uri:
   - Wording inconsistency (auto-extracted vs spec-driven)
   - Bug surface în 25 files cu fragile UI logic (dashboard, weight, etc.)
   - Daniel review burden gigantic dacă apply-uite în run autonomous
   - **Recommendation:** chat strategic wording rewrite session — Daniel reviewing acest raport (audit findings full inventory) + decide phased approach (Phase A toasts/confirms first, Phase B engine messaging cu domain expertise, Phase C page labels bulk).

2. **Day names mismatch** `src/pages/coach/modals.js:62` cu `['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă']` hardcoded array. Recommend `Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date)` pentru locale-aware native API. Out of scope acum — flag pentru wording session.

3. **Exercise alternatives reasons** (`modals.js:78-100`) mix EN/RO inside ALTERNATIVES dict ("Similar lat activation, horizontal pull" + "Spate complet, fără cablu"). Decision needed: keep EN technical names (Lat Pulldown, Cable Row, Romanian Deadlift) + translate RO reasons; OR translate everything. Domain expertise needed.

4. **Console logs intentionally untouched** per spec §2 EXCLUS: `[Cache]`, `[Storage]`, `[Migration]`, `[Calibration]`, `[CoachDirector]`, `[CDL]`, etc. — developer debug audit trail, NU user-facing.

5. **Sentry tags untouched** per spec — observability metadata, locale-independent.

## Constraints respected

- ✅ Backup tag obligatoriu pre-execution (`pre-i18n-audit-2026-05-01` pushed origin)
- ✅ NO `--no-verify` (pre-commit hook honored — 6 commits all passed test suite)
- ✅ Granular commits semantic (6 fix commits + 1 outbox = 7 total)
- ✅ ZERO touch unrelated logic — only `whyEngine.js`, `modals.js` (single function), and NEW `src/i18n/` module
- ✅ Tests 854 → **888 PASS** (+34 new, zero regression)
- ✅ Zero info loss — all old strings preserved în git history + current ro.json bundle (legacy whyEngine logic kept available via verdict mapping)
- ✅ EN translations NOT auto-generated — TODO_EN markers preserve RO content + flag for Daniel review
- ✅ Console logs neattinse — developer debug preserved
- ✅ Sentry tags neattinse

## Next action Daniel + Claude chat

1. **Sync Project Knowledge** GitHub connector
2. **Verify accesibilitate post-push:**
   - `📤_outbox/LATEST.md` (acest raport — full audit findings)
   - `src/i18n/ro.json` + `en.json` (review wording-uri lock-uite în `why.categorical.*`)
   - `src/engine/whyEngine.js` (verdict logic)
   - `src/pages/coach/modals.js` (modal in-app pattern + showWhyForExercise replacement)
3. **Smoke test post-deploy** (after `npm run deploy`):
   - Open https://markaroundthestates-cyber.github.io/salafull/ în Chrome
   - Click "❓ De ce?" pe exercise card → verify in-app modal (NOT `alert()` browser native) → verify wording categorical (NOT `[category]` raw codes)
4. **Chat strategic wording rewrite session** (FRESH session, bandwidth max):
   - Review §I18N AUDIT FINDINGS integral
   - Decide Phase A (~36 strings — toasts + confirms + alerts) — quick wins
   - Decide Phase B (~70 strings — engine messaging) — domain expertise needed
   - Decide Phase C (~80 strings — page labels) — bulk batch
   - Decide exercise names mapping strategy (EN tech names + RO reasons vs full translate)
   - Decide EN translations strategy (manual vs Sonnet-assisted vs LLM API)
5. **Continui priorities Sprint 4.x** post-wording session:
   - **Faza 2 ADR 021 persistence** + integration (D13 logs-first prerequisite)
   - **Phase 2 logs rotation** ADR 020 (coachContext.buildContext async refactor)
   - **D1 DEVELOPING tier code refactor** (~8-12h schema migration runner)
   - **Sprint 4 prompt comprehensive** (Wave 6 + 4 SensAI + 4 JuggernautAI + Chalkboard + Feedback)

## Verification commands (Daniel local sanity check)

```bash
git log --oneline -10
git tag --list | grep i18n   # expect: pre-i18n-audit-2026-05-01
ls src/i18n/                  # expect: index.js, ro.json, en.json, __tests__/
npm run test:run              # expect: 888/888 PASS
grep -c "TODO_EN" src/i18n/en.json   # expect: ~14 (all keys placeholder)
grep -rn "\[phase\]\|\[readiness\]\|\[pattern\]" src/ --include="*.js" | grep -v __tests__ | grep -v whyEngine.js
# expect: ZERO matches (no category brackets în user-facing engine output)
```

## Rollback (dacă needed)

```bash
git reset --hard pre-i18n-audit-2026-05-01
git push origin main --force-with-lease   # only if Daniel explicitly approve "force-push autorizat: YES"
```

---

🦫 **i18n infrastructure LIVE. whyEngine rewritten cu 4 verdict-based wording-uri lock-uite. alert() native replaced cu modal in-app. ZERO leak anti-RE compliance verified. 888/888 tests stable. Phase 5 bulk replace DEFERRED — acest raport = SSOT input pentru Daniel chat strategic wording rewrite session.**
