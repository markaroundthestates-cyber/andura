# Dependencies Audit — 2026-04-26 NIGHT

**Scope:** package.json deps vs actual imports  
**Method:** grep imports per package

---

## package.json Summary

```json
dependencies:   { "@sentry/browser": "^10.49.0" }
devDependencies: {
  "@playwright/test": "^1.59.1",
  "@vitest/ui": "^3.2.4",
  "gh-pages": "^6.1.1",
  "husky": "^9.1.7",
  "jsdom": "^25.0.1",
  "lint-staged": "^16.4.0",
  "vite": "^5.2.0",
  "vitest": "^3.2.4"
}
```

Total declared: 9 deps

---

## Dependency Usage Check

| Package | Type | Used in production? | Used in tests/tools? | Status |
|---|---|---|---|---|
| `@sentry/browser` | prod dep | ✓ main.js, util/sentry.js | NO | USED |
| `@playwright/test` | dev dep | NO | ✓ tests/e2e/**/*.spec.js, helpers/ | USED |
| `@vitest/ui` | dev dep | NO | Via `vitest --ui` script | USED (CLI) |
| `gh-pages` | dev dep | NO | Via `deploy` npm script | USED (CLI) |
| `husky` | dev dep | NO | Via `.husky/` hooks + package.json prepare | USED |
| `jsdom` | dev dep | NO | ✓ vitest.config.js (environment: 'jsdom') | USED |
| `lint-staged` | dev dep | NO | Via husky pre-commit hook + .lintstagedrc | USED |
| `vite` | dev dep | NO | Via build + dev scripts | USED |
| `vitest` | dev dep | NO | ✓ All test files via `from 'vitest'` | USED |

---

## Result: Zero Unused Dependencies

Toate 9 dependențele declarate sunt active și folosite.

---

## Missing Dependencies (imported but not declared)

Nimic de raportat — toate imports sunt:
1. Relative (./file.js, ../util/etc.js) — nu necesită package.json
2. Din stdlib sau browser native
3. Din pachetele declarate

---

## Sentry Usage Pattern

`@sentry/browser` este integrat în:
- `src/util/sentry.js` — wrapper init + captureException helper
- `src/main.js` — Sentry.init() la app start

Pattern corect: single init point + wrapper utility.

---

## Observations

**@vitest/ui** este declarat ca devDependency dar nu e importat în niciun fișier.  
Usage este exclusiv prin CLI (`npx vitest --ui`). OK — tool dep.

**gh-pages** — similar, CLI only. Folosit în `"deploy"` npm script.

---

*Generated: 2026-04-27 NIGHT AUTONOMOUS RUN*
