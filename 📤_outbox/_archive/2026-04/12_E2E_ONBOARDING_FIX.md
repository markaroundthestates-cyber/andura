# E2E Onboarding Overlay Fix — Raport

**Task:** Fix 11 E2E tests blocked by `<div id="onboarding-overlay">` intercepting pointer events
**Model:** Sonnet autonomous (Co-CTO mode)
**Status:** Complete
**Date:** 2026-04-30
**Run wall-clock:** ~14 min

## Pre-flight

- Branch: `main`, working tree clean before start, up to date with origin/main
- Baseline vitest: **752/752 PASS** (48 test files)
- Pattern verified: `_suppressAAFrictionModal` exists at `src/components/modalManager.js:118-126` — early-return guard at the top of `show(config)` after `typeof window` check + `=== true` strict comparison. No env-flag, no build-time elision; replicated literally.
- Onboarding overlay injection at: `src/onboarding.js:33-78` — `showOnboarding()` builds `<div id="onboarding-overlay">` and `document.body.appendChild(overlay)` at line 77. Single injection site (no duplicates in `src/`).

## Modificări

### Cod sursă
- `src/onboarding.js:33-38` — early-return guard added at the very top of `showOnboarding()`:
  ```js
  if (typeof window !== 'undefined' && window._suppressOnboardingOverlay === true) return;
  ```
  Pattern is byte-for-byte parallel to `_suppressAAFrictionModal` (modulo the id check, since `showOnboarding` is single-purpose vs. modalManager's generic `show(config)`).

### Teste — listă cerută în spec
- `tests/regression.spec.js` — 4× `beforeEach` extinse (linii ~9, 40, 94, 228) cu `window._suppressOnboardingOverlay = true` lângă flag-ul AA existent.
- `tests/visual.spec.js` — `beforeEach` (linia ~4) extins cu noul flag.

### Teste — preventive parity (per stop-condition #3 din spec)
Spec-ul cerea: "DACĂ găsim alte E2E tests care folosesc `_suppressAAFrictionModal` și NU sunt în lista 11 picate → adaugă și acolo `_suppressOnboardingOverlay` (preventiv parity, evită surpriză viitoare)."
- `tests/smoke.spec.js` — `beforeEach` (linia ~4) extins cu noul flag.
- `tests/e2e/helpers/setup.js` — `setupUser()` și `resetBetweenTests()` extinse cu default-suppress + override key (`_suppressOnboardingOverlay`) simetric cu mecanismul AA existent.

## Build + Tests

### Vitest
- Pre-fix baseline: **752/752 PASS**
- Post-source-edit: **752/752 PASS**
- Pre-commit hook (rulat de două ori în commit): **752/752 PASS** ambele

### Playwright (regression + visual, 28 teste)
Configul oficial folosește `baseURL: https://markaroundthestates-cyber.github.io` (GitHub Pages). Pentru a verifica fix-ul ÎNAINTE de deploy, am creat un config local de override (deja șters post-verificare) și am rulat tests against `vite dev` local.

| Run | Config | Pass | Fail | Note |
|-----|--------|------|------|------|
| Pre-fix, against deployed GH Pages | default | 17 | **11** | reproduce bug cu mesaj exact `<div id="onboarding-overlay"> ... intercepts pointer events` |
| Post-fix, against `localhost:5173` | local override | **28** | 0 | toate cele 11 anterior picate → PASS, zero regresii |
| Post-push, against deployed GH Pages | default | (TBD) | (TBD) | va fi verificat după ce GitHub Pages rebuild-uiește (CI auto-deploy) |

**Cele 11 teste anterior picate (toate PASS local post-fix):**
- regression.spec.js — Navigație: DASH, WEIGHT, PROG, PLAN, navigând înapoi la COACH (5)
- regression.spec.js — Theme system: theme menu deschide, ZEN, ANIME, data-theme attribute (4)
- visual.spec.js — clicking theme switcher, selecting ZEN theme (2)

## Commits

- `3d89464` feat(onboarding): add _suppressOnboardingOverlay test flag (parity with _suppressAAFrictionModal)
- `0232599` test(e2e): suppress onboarding overlay in regression + visual specs (fixes 11 timeout failures)

## Pushed: ✅ origin/main

`git push origin main` → `3bbf821..0232599  main -> main`

## Issues / Ambiguities

**Niciuna ambiguitate de logică.** Pattern-ul AA era simplu (early-return), o singură injectare a overlay-ului în src/ (`src/onboarding.js:33`), zero conflicte. Câteva note operaționale:

- **Acceptance final = post-deploy.** Configul Playwright oficial (`playwright.config.js`) țintește GH Pages, nu localhost. Deci `npx playwright test` direct rulează împotriva site-ului LIVE (pre-deploy state). Verificarea locală a necesitat un override config — dar acceptance-ul real va fi vizibil doar după ce GitHub Pages rebuilds (CI auto-deploy după push). Acest lucru e structural, nu ceva de "fixat".
- **Pre-commit hook flake.** Hook-ul rulează `vitest run` pe fiecare commit (~57s). A trecut de două ori curat — fără flake observat în această sesiune.
- **`_suppressFirebaseSync` în setup.js helpers.** Helper-ul `setupUser` setează deja firebase-sync = false implicit, dar nu apare în spec-urile top-level (`regression`, `visual`, `smoke`). Spec-urile de top folosesc `addInitScript` direct, nu helper-ul. Am tratat helper-ul ca un mecanism paralel și am adăugat flag-ul nou în paralel cu cel AA — same shape, override-prin-userData identic.

## Next action Daniel

- Verifică GitHub Actions QA run următor — toate cele 11 teste e2e ar trebui PASS post-deploy.
- Dacă GH Pages durează să redeploy-uiască și CI rulează prea repede → re-run job-ul manual.
- Dacă alte teste rup post-fix → ping (dar zero motive plauzibile, source-change-ul e un early-return izolat strict guarded de un flag de test).
