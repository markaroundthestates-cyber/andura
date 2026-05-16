# ADR 008: Vitest for Unit Tests, Playwright for E2E

**Status:** Accepted  
**Date:** 2026-04-23
**See also:** [[DECISION_LOG]] | FAZA_1_FINAL_REPORT (closed, history în git) | [[005-vanilla-js-no-framework]]

## Context

The app needs both unit tests (pure logic engines) and E2E tests (real browser behavior, localStorage interactions).

## Decision

- **Vitest** for all unit tests (`src/**/__tests__/*.test.js`). Fast, ESM-native, jsdom environment.
- **Playwright** for E2E tests (`tests/e2e/**/*.spec.js`). Tests run against GitHub Pages deployment.
- E2E fixtures use `page.addInitScript` (persistent across reloads) to set localStorage state before page load.
- Firebase sync suppressed in all E2E tests via `window._suppressFirebaseSync = true`.

## Consequences

- **Positive:** Unit tests run in <15s. E2E tests verify real browser behavior including localStorage, navigation, and CSS.
- **Positive:** `page.addInitScript` correctly handles tests that require state persistence across reloads (e.g., onboarding re-run test).
- **Negative:** E2E tests depend on GitHub Pages deployment being live — CI must run build before E2E.
- **Negative:** No integration tests between engines and real DOM (gap between unit and E2E). Acceptable for current scale.
- **Test reliability:** E2E tests use `test.skip()` (not fail) for optional UI elements not present in all environments.
