---
title: ORCHESTRATOR_PHASE_1_FOUNDATION_2026-05-16.md
type: cc-autonomous-orchestrator
model: Opus EXCLUSIVELY
phase: Phase 1 Foundation — React Andura Clasic build
authority: DECISIONS.md §D015 STRAT PIVOT + §D016 PROC (codified 2026-05-16)
mode: sequential 1→N fail-stop
created: 2026-05-16
---

# ORCHESTRATOR — Phase 1 Foundation React Andura Clasic

**Model: Opus EXCLUSIVELY.** Quality > Speed strict. Bugatti craft, peak craft zero compromise.

## Context discovery pre-plan

Verificare primary-source (Claude chat 2026-05-16) a relevat infra Batch 1 React Migration LANDED deja peste vanilla legacy:

- `package.json` root: React 19 + Vite 5 + Vitest 3 + TS 6 + RR-DOM 6.28 + husky pre-commit (`npm run test:run`)
- `vite.config.js` multi-page mode: `main: 'index.html'` + `'react-test': 'react-test.html'`
- `vitest.config.js` jsdom env + `include: ['src/**/*.test.{js,ts}']` (TS deja suportat)
- `tsconfig.json` strict + `jsx: react-jsx` + `allowJs: true` + `include: ['src/**/*']`
- `react-test.html` + `src/main.jsx` + `src/App.jsx` = Batch 1 placeholder scaffold LANDED
- Husky pre-commit hook = `npm run test:run` (3743 PASS verde mandatory)
- Mockup `04-architecture/mockups/andura-clasic.html` = DESIGN MASTER, color tokens inline Tailwind config CDN + CSS variables `:root` extensive

**Strategy:** Extend Batch 1 existing pe branch nou. NU duplicăm node_modules, NU folder `src-react/` paralel. Adăugăm strict ce lipsește (Zustand + Tailwind PostCSS + Testing Library + TS migration `.jsx` → `.tsx` + subfolder `src/react/` isolation pentru Andura Clasic UI components).

## Branch

Create `feature/v3-react-clasic` din `main` HEAD (`e8772c9` LATEST: React pivot codify raport finalize per `DECISIONS.md §D015 + §D016` codified).

## Execution

Read sequential 1→N, fail-stop. Each task is self-contained cu success/fail criteria verifiable.

1. `📥_inbox/TASK_1_BRANCH_DEPS_TS_MIGRATION.md` — backup tag, branch nou, npm install Zustand + Tailwind + Testing Library, rename `.jsx` → `.tsx` Batch 1 scaffold
2. `📥_inbox/TASK_2_TAILWIND_CSS_VARIABLES.md` — Tailwind PostCSS config, extract mockup CSS variables verbatim în `src/styles/global.css`, map color tokens în `tailwind.config.js`, update `src/App.tsx` cu basic Tailwind class smoke
3. `📥_inbox/TASK_3_STRUCTURE_STORE_TESTS.md` — `src/react/{components,stores,routes,lib}/` subfolder structure, sample Zustand store placeholder, foundation smoke test RTL + backend integration test import pure function din `src/engine/`
4. `📥_inbox/TASK_4_COMMIT_PUSH_REPORT.md` — atomic commits single-concern Bugatti, push origin branch + backup + milestone tags, write `📤_outbox/LATEST.md` raport standard §0-§5, archive artefactele CONSUMED

## Pre-flight verification (BEFORE Task 1)

Run în repo root `C:\Users\Daniel\Documents\salafull\`:

```bash
git status                            # expect: clean (except .smart-env/ idle drift acceptable)
git branch --show-current             # expect: main
git log --oneline -1                  # expect: e8772c9 LATEST: React pivot codify raport finalize
npm run test:run -- --silent 2>&1 | tail -10   # expect: 3743 PASS baseline
```

Dacă any check fail → STOP, raport în `📤_outbox/LATEST.md` §"Pre-flight failure" cu output literal.

## Fail-stop rules invariante

- Any task fails (build error, test red, command nonzero exit, pre-commit hook RED) → STOP imediat
- ZERO continue after failure
- **ZERO `--no-verify` bypass pre-commit hook** — Bugatti craft strict
- ZERO modificări la `src/` vanilla legacy code (`src/main.js`, `src/pages/*.js`, `src/engine/*.js`, `src/coach/*.js`, etc.) — Andura Clasic React build adițional, vanilla preserved
- ZERO modificări la `index.html` root vanilla entry (preserve live andura.app paradigm)
- Vanilla legacy tests 3743 PASS preserved invariant pe FIECARE commit (verified via pre-commit hook automatic)
- Write partial state to `📤_outbox/LATEST.md` §"Failure point" cu task ID + error literal stderr + last successful commit SHA
- Daniel intervenes manual post-failure

## Bugatti standards invariante

- Peak craft, zero compromise — "Ar fi mândru un Bugatti engineer?"
- Atomic commits single-concern (3-5 commits planned: deps install, scaffold migration, configs, structure+tests, archive)
- Pre-commit hook verde mandatory pe FIECARE commit (3743 PASS preservat + nou React tests add cumulative)
- TypeScript strict mode invariant (NU loose, NU `any` unjustified)
- Mockup CSS variables = VERBATIM parity (peak craft fidelity, NU aproximări)
- Surgical touch — ZERO refactor adjacent neimplicat în spec
- Romanian-first NO_DIACRITICS_RULE preserved (UI strings RO fără diacritice)

## Final raport (post Task 4 complete)

Write `📤_outbox/LATEST.md` (overwrite previous react-pivot-codify raport) cu structure standard:

- **§0** Bugatti Verification Checklist (toate ✓ explicit)
- **§1** Commits sequence (SHA + subject table)
- **§2** Tags pushed origin (backup + milestone)
- **§3** Files created/modified (path + change summary table)
- **§4** Issues / caveats / observations (anti-halucinație notes)
- **§5** Next action (Phase 2 routing skeleton 50+ screens mockup `goto()` → React Router v6)

## Archive CONSUMED post-success

Scan `📤_outbox/_archive/2026-05/` ultim NN counter (`ls 📤_outbox/_archive/2026-05/ | sort -t_ -k1 -n | tail -1` sau echivalent). Increment per file.

Move via `mv` shell + `git add` la new location (artefactele sunt untracked în `📥_inbox/`, deci NO git history loss):

- `📥_inbox/ORCHESTRATOR_PHASE_1_FOUNDATION_2026-05-16.md` → `📤_outbox/_archive/2026-05/<NN>_ORCHESTRATOR_PHASE_1_FOUNDATION_2026-05-16_CONSUMED.md`
- `📥_inbox/TASK_1_BRANCH_DEPS_TS_MIGRATION.md` → `📤_outbox/_archive/2026-05/<NN+1>_TASK_1_BRANCH_DEPS_TS_MIGRATION_CONSUMED.md`
- `📥_inbox/TASK_2_TAILWIND_CSS_VARIABLES.md` → `📤_outbox/_archive/2026-05/<NN+2>_TASK_2_TAILWIND_CSS_VARIABLES_CONSUMED.md`
- `📥_inbox/TASK_3_STRUCTURE_STORE_TESTS.md` → `📤_outbox/_archive/2026-05/<NN+3>_TASK_3_STRUCTURE_STORE_TESTS_CONSUMED.md`
- `📥_inbox/TASK_4_COMMIT_PUSH_REPORT.md` → `📤_outbox/_archive/2026-05/<NN+4>_TASK_4_COMMIT_PUSH_REPORT_CONSUMED.md`

Archive commit single-concern:
```bash
git add 📤_outbox/_archive/2026-05/
git commit -m "Archive: Phase 1 Foundation orchestrator + 4 tasks CONSUMED"
git push origin feature/v3-react-clasic
```

## Daniel-side post-CC

Daniel verifies via reading `📤_outbox/LATEST.md` §0-§5. Dacă Status=Complete + §0 toate ✓ → Phase 2 planning next chat. Dacă §4 Issue → Daniel review + intervention manual.

---

🦫 **Phase 1 Foundation = scaffold reusable React Andura Clasic build base PESTE Batch 1 existing. Sequential fail-stop. Bugatti craft. Backend reuse via relative path `src/engine/*` (NO alias needed, in-repo). Vanilla legacy preserved invariant. ZERO duplication.**
