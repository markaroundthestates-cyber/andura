# PROMPT_CC iter 9 — Track 7 CI fix REAL (ground truth from iter 8 verdict)

**Model:** Opus 4.7 EXCLUSIVELY
**CC startup:** `claude --dangerously-skip-permissions`
**Procedure:** D031/D032 LOCKED V1 — atomic Bugatti commits per fix
**Stop trigger UNIC:** Daniel STOP explicit
**Push:** origin main bypass admin (D035) final după ALL LANDED

---

## CI iter 8 verdict (post revert 7f6a507, ground truth from Daniel screenshots)

### ✅ Progress real iter 8

- Revert f1c79dd + Andura/ gitignore: Andura/src/engine/... erori DISPĂRUTE complet
- Node 24 force functional (informational warnings only)
- Top-level jobs marked GREEN (deploy + lighthouse + checkly + validate)

### ❌ Real fail-uri iter 9 fix needed

---

## FIX 1 — depcheck exit 255 (3 missing + 6 false positive unused)

**Missing deps REAL — adăugare la `package.json` devDependencies:**

```json
{
  "devDependencies": {
    "checkly": "^4.x.x",
    "@browserbasehq/stagehand": "^2.x.x",
    "zod": "^3.x.x"
  }
}
```

Verify versions latest stable:
```bash
npm view checkly version
npm view @browserbasehq/stagehand version
npm view zod version
```

Apoi `npm install --legacy-peer-deps` pentru sync lockfile.

**False positive unused — extinde `--ignores` în package.json `scripts.depcheck`:**

```json
"depcheck": "depcheck --ignores='husky,lint-staged,@stryker-mutator/*,@lhci/cli,size-limit,@size-limit/preset-app,depcheck,madge,jscpd,license-checker,@axe-core/playwright,@nearform/playwright-firebase,fast-check,@eslint/js,@types/eslint,@vitest/coverage-v8,autoprefixer,postcss,tailwindcss'"
```

Rationale per false positive:
- `@eslint/js` — folosit în `eslint.config.js` (flat config import)
- `@types/eslint` — types only (TS resolution)
- `@vitest/coverage-v8` — vitest.config.js coverage provider config
- `autoprefixer`/`postcss`/`tailwindcss` — PostCSS pipeline via postcss.config.js + tailwind.config.js (Vite build)

**Commit:**
```
fix(track-7-iter-9): depcheck false positives ignores + 3 missing devDeps (checkly/stagehand/zod)
```

---

## FIX 2 — madge circular imports exit 1

**Diagnostic step ÎNAINTE de fix:**

```bash
npx madge --circular src/
```

Run local să vezi care fișiere sunt în ciclu. Output va lista importurile circulare exact.

**Fix pattern:** sparge cycle prin (a) extract shared code în modul nou, (b) lazy import (require dinamic), sau (c) restructure types-only imports (`import type`).

**Probably suspected:**
- `src/engine/coachDirector.js` ↔ `src/engine/coachContext.js` (mutual deps?)
- `src/engine/ruleEngine.js` ↔ `src/engine/dimensionRegistry.js`
- `src/coach/orchestrator/index.js` ↔ adapters/*

**Commit (per cycle resolved):**
```
fix(src-iter-9): break circular import <module-a> ↔ <module-b>
```

---

## FIX 3 — 10 ESLint unused-vars NEW

**Function args (prefix `_`):**

| File | Line | Symbol | Action |
|------|------|--------|--------|
| `src/engine/goalAdaptation/trainingModifiers.js` | 80 | `phase` arg | `_phase` |
| `src/engine/goalAdaptation/trainingModifiers.js` | 134 | `phase` arg | `_phase` |
| `src/engine/goalAdaptation/phaseAutoDetection.js` | 148 | `goalId` arg | `_goalId` |
| `src/engine/dp.js` | 328 | `muscleState` arg | `_muscleState` |

**Top-level imports/vars (prefix `_` sau delete dacă truly dead):**

| File | Line | Symbol | Action |
|------|------|--------|--------|
| `src/engine/goalAdaptation/tests/index.test.js` | 3 | `PUSHBACK_TIERS` import | `_PUSHBACK_TIERS` (test file safe) |
| `src/engine/goalAdaptation/phaseAutoDetection.js` | 23 | `SEX` | audit: dead? → DELETE. forward-use? → `_SEX` |
| `src/engine/energyAdjustment/tests/index.test.js` | 3 | `EMOJI_STATE` | `_EMOJI_STATE` |
| `src/engine/dp.js` | 156 | `capStrategy` assigned never used | audit + DELETE OR `_capStrategy` |
| `src/engine/dp.js` | 3 | `EX_REPS` | audit + DELETE OR `_EX_REPS` |
| `src/engine/deload/tests/index.test.js` | 8 | `SCHEMA_CONSTANTS` | `_SCHEMA_CONSTANTS` |

**Pre-commit verify:**
```bash
npm run lint   # expect 0 unused-vars warnings
npm test       # expect 4547 PASS preserved
npm run build  # expect clean
```

**Commit:**
```
fix(src/engine-iter-9): 10 unused-vars NEW cleanup — _ prefix + audit dead code
```

---

## FIX 4 (optional, DEFERRED if time) — git 128 Post Run cleanup warning

**Status: NOT BLOCKING.** Top-level jobs PASS. Acest exit 128 happens în `Post Run actions/checkout@v5` cleanup step, AFTER main steps done.

**Root cause hypothesis:** `actions/checkout@v5` post-run runs `git config unset` pentru auth helper cleanup. Cu `peaceiris/actions-gh-pages@v4` care modifică git state, sau cu `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` care forțează Node 24 runtime, post-run git cleanup fail.

**Investigate (deferred to iter 10):**
- Pin `actions/checkout@v4` (stable Node 20 native, NU forced Node 24) în affected jobs
- Sau add `persist-credentials: false` la checkout step (bypass post-run git config touch)

**Cosmetic warning, can ignore for §7.10 launch.**

---

## Verify post-fix sequence

1. Local pre-commit GREEN: `npm run lint` + `npm run depcheck` + `npm test` + `npm run build` + `npx madge --circular src/` (zero output expected)
2. Push origin main bypass admin (D035)
3. CI Actions UI verify run pe latest SHA:
   - ✅ Validate (typecheck + unit + build) GREEN — depcheck pass + madge pass + ESLint clean
   - ✅ E2E Smoke Tests RUNS (no longer skipped because Validate passes)
   - ✅ deploy + lighthouse-live + checkly-deploy GREEN
   - ⚠️ Post Run git 128 warning may persist — IGNORE (cosmetic, FIX 4 deferred)
4. Write report `📤_outbox/LATEST.md` append `## §7.6 iter 9 LANDED` cu:
   - 3 commits SHA atomic (FIX 1 + FIX 2 + FIX 3)
   - CI verdict (GREEN/FAIL per job)
   - Production readiness % refresh (target ≥98%)
   - Next P1 = §7.10 Daniel mobile smoke (final 2%)

---

## Stop conditions

- ✅ Continue autonom FIX 1 + FIX 2 + FIX 3 + verify GREEN
- ❌ STOP dacă FIX 2 madge circular reveal architecture refactor > 50 LOC → escalate Daniel
- ❌ STOP dacă FIX 3 audit reveal dead code semnificativ > 30 LOC → escalate Daniel decision delete vs preserve
- ❌ STOP dacă post-push iter 9 CI run NU pass Validate green → next iter 10 cu diagnostic mai adânc

---

## Anti-recurrence enforce (din iter 8 lessons learned)

- D023: vault writes `filesystem:write_file` MANDATORY
- D030: ZERO modification `.obsidian/` files
- f40ebbc Stop hook = remains disabled (`.claude/settings.json` `disableAllHooks: true` preserved)
- ZERO false reports — every commit message must match actual `git show --stat <SHA>` output
- Pre-action verify: rulează LOCAL `npm run depcheck` + `npx madge --circular src/` ÎNAINTE de propunere fix patterns (NU teoretiza din memorie)
- Per FIX commit: pre-commit hook GREEN mandatory, ZERO `--no-verify` bypass

🦫 Bugatti craft. Iter 9 = ground truth ONLY, ZERO halucinare. Opus 4.7 exclusively.
