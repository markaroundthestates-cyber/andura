# ADR 005: Vanilla JS + Vite, No UI Framework

**Status:** Accepted  
**Date:** 2026-04-23
**See also:** [[DECISION_LOG]] | STACK_CURRENT | [[008-vitest-playwright-testing]]

> **⚠️ STATUS UPDATE 2026-05-10 §AMENDMENT — Port-First Vanilla Pre-React LOCK V1 (REVERT SUPERSEDE 2026-05-08).**
> §AMENDMENT 2026-05-08 React Migration SUPERSEDE Vanilla = REVERTED. Vanilla JS preserved active stack pre-React migration: Step 1 port mockup V2 → prod vanilla JS modules ~1-2 săpt + Step 2 React migration mecanic mapping ~1-2 săpt cap-coadă.
> §AMENDMENT 2026-05-08 tactical scope (Vite + React 19 + Router v6 + Context+useReducer + CSS vars + engines pure imports + PWA/SW/Firebase preserved) = preserved compatible pentru Step 2 execution post Step 1 validation.
> Original vanilla decision body preserved historical reference below.
> Active stack canonical: see §AMENDMENT 2026-05-10 final fișier.

## Context

The app is a single-user PWA. Frameworks like React/Vue add bundle size, build complexity, and learning overhead.

## Decision

Use vanilla JS with Vite for bundling. UI is rendered via template literals into DOM nodes. State is localStorage (via DB abstraction). No reactive framework.

## Consequences

- **Positive:** Tiny bundle (~50KB). Fast load even on 3G.
- **Positive:** Zero framework churn — no upgrades, no breaking changes.
- **Negative:** Manual DOM updates. No virtual DOM diffing — full re-renders on state change.
- **Negative:** Template literal HTML is not sanitized — XSS risk if user input is ever rendered (currently exercise names from a fixed list, so risk is low).
- **Mitigation:** If user-generated text is ever rendered, HTML-escape via `text.replace(/[&<>"']/g, c => ({...})[c])`.

---

## §AMENDMENT 2026-05-08 — React Migration LOCK V1 SUPERSEDE Vanilla

**Status:** LOCKED V1 (SUPERSEDE original ADR 005 vanilla decision)
**Date:** 2026-05-08
**Authority:**
- Daniel chat-NEW3 birou 2026-05-07 direction LOCK strategic *"pt react mai avem chat strategic? avem totul discutat"* (1-2 săpt CC continuous, NU 3-6 săpt human dev solo)
- Daniel chat NEW acasă 2026-05-08 React migration plan tactical chat dedicat (§NEXT P1 Claude chat) — tactical scope decisions LOCK (Co-CTO scope per Daniel boundary correction chat-NEW3)
**Cumulative LOCKED V1:** ~688 → ~689 (+1 net foundation amendment)

### Context decision (re-aliniat 2026-05-08)

Original ADR 005 (2026-04-23) decision rejected React/Vue pe rationale: bundle size + framework churn + manual DOM low overhead single-user PWA. Re-aliniere 2026-05-08 invalidează 3 din 4 assumptions:

- **Bundle size** — RO broadband top 5 mondial (Speedtest Global Index Q1 2026), bundle null pentru target audience. Maria 65 / Gigica 35 / Marius 28 toate pe broadband decent. Original concern N/A.
- **Framework churn** — React 19 LTS stable, ecosystem mature 11+ ani, churn risk minimal vs vanilla DOM patching custom maintenance.
- **Manual DOM updates** — state.js singleton + template literals + manual re-renders = scaling debt accumulating. 16 zile development = window optim refactor PRE debt accumulation. Velocity reading code irrelevant non-dev workflow (CC + Claude scriu/citesc).
- **state.js architecture** — single mutable obj + engines pure functions + UI separation = mapping mecanic React fără rewrite logic. Decision delayed 6+ months = forced rewrite expensive.

Plus **CD V2 mockup canonical SSOT** (Andura Clasic + Andura Living Body LANDED chat-NEW3 birou + chat-current 2026-05-08 §CC.5 fast ingest) = design reference active implementation phase. React component model = direct mapping mockup → live, NU dual maintain template literals + mockup.

### Decision

**SUPERSEDE original ADR 005 vanilla.** Migrate vanilla JS + Vite + template literals → **React 19 + Vite preserved + JSX**. Engines pure functions preserved exact (zero rewrite logic). Effort 1-2 săpt CC continuous.

### Tactical scope LOCKED V1

| Concern | Decision V1 | Rationale |
|---------|------------|-----------|
| Build tooling | **Vite preserved** | Already used original ADR 005, ESM native, fast HMR, integrates `@vitejs/plugin-react` standard |
| Routing | **React Router v6** | Mature, declarative, PWA-friendly, file-based-optional |
| State management | **Context API + useReducer** | NO Redux scope creep. Engines deja pure functions. state.js singleton → Context provider = mapping mecanic |
| CSS approach | **Preserve CSS variables existing** | V2 mockup canonical (Andura Clasic + Living Body) folosesc CSS vars deja. Single source design tokens. ZERO migration la Tailwind / CSS-in-JS scope creep. |
| TypeScript | **NU V1 — vanilla JSX** | TS migration = scope creep evident, separate ADR future v1.5+ candidate. Engines deja JSDoc typed. |
| Engine integration | **Pure functions imports preserved exact** | `import { ... } from 'src/engine/...'`. ZERO rewrite logic. Single source-of-truth. ADR 030 D2 STRANGLER orchestrator agnostic compatible. |
| PWA + Service Worker | **Preserved exact** | Via Vite plugin standard (`vite-plugin-pwa`). Manifest + offline cache + auto-update flow conservare. |
| Firebase + IndexedDB sync | **Preserved exact** | Storage layer + sync layer agnostic la UI framework. Auth Phase 2 LANDED (`0880641`) preserved. |

### Migration ordering 8 batches (estimative CC continuous)

1. **Vite scaffold + entry** — install React 19 + ReactDOM + plugin-react + React Router v6, replace `index.html` script tag → `<div id="root">` + `main.jsx` entry. Dev server live.
2. **React Router skeleton + routes** — 4 root nav per V2 mockup canonical (Antrenor / Progres / Istoric / Cont). Layout shell + nav bar component.
3. **state.js → Context provider** — extract singleton mutable obj → Context + useReducer mapping mecanic. ZERO logic change. Hooks `useAppState() / useDispatch()`.
4. **Top-level page shells** — 4 routes scaffold cu CSS vars preserved + breadcrumb + structure mockup-mirrored.
5. **Onboarding flow components** — §63.1 5 ecrane T0 (Obiectiv → Vârstă → Sex → Istoric medical → Frecvență) reordered per LOCKED. Form components + validation + persistence flow.
6. **Coach session UI components** — Antrenor tab restructure (§NEW2 LOCKED). 8 engines pure imports preserved (Periodization + Goal Adaptation + Energy + Bayesian Nutrition + Tempo + Specialization + Warm-up + Deload). Wiring orchestrator pipeline §42.10 V1 preserved.
7. **Settings + auth flow** — Cont V2 inventar (§NEW2 LOCKED) + Auth Phase 2 LANDED preserved (Magic Link + Google + delete 2-step + email change new-only).
8. **Theme picker + CSS vars switcher** — Andura Clasic baseline + Andura Living Body skin 2 LANDED. Theme picker afișează "⋯ Curând" placeholder pentru cele 2 themes "când gata CD" (per PRE_LAUNCH_CHECKLIST_V1 §Daniel updates 2026-05-08).

**Effort:** 1-2 săpt CC continuous (per Daniel chat-NEW3 LOCK). Per-batch prompts CC tactical urmează separate artefacte chat-current React migration plan tactical.

### Out of scope V1 (deferred)

- TypeScript migration → separate ADR future v1.5+ candidate
- Redux / Zustand / state management library
- Server components / Next.js / SSR
- Tailwind / CSS-in-JS migration
- Web Components / Shadow DOM
- Storybook / component library extraction

### Cross-refs

- Original ADR 005 body preserved historical reference (DEPRECATED status flag added top fișier)
- ADR 030 D2 STRANGLER orchestrator preserved compatible (engines pure unchanged)
- ADR 018 Engine Extensibility preserved
- `04-architecture/mockups/andura-clasic.html` + `andura-living-body.html` design tokens canonical SSOT
- `04-architecture/ROOT_NAV_V2_29_5_7_AMENDMENT.md` root nav V2 4 tabs LOCKED
- `00-index/CURRENT_STATE.md` §JUST_DECIDED 2026-05-08 chat NEW acasă entry
- `03-decisions/DECISION_LOG.md` entry top descending cronologic
- `08-workflows/PRE_LAUNCH_CHECKLIST_V1.md` §CC Opus mecanic autonomous #2 React migration implementation

---

## §AMENDMENT 2026-05-10 — Port-First Vanilla Pre-React LOCK V1 (REVERT SUPERSEDE 2026-05-08)

**Status:** LOCKED V1 (REVERT §AMENDMENT 2026-05-08 SUPERSEDE — port-first vanilla preserved active stack pre-React migration)
**Date:** 2026-05-10 chat ACASĂ post Phase 3.6 attempt + mockup vs prod distincție revealed
**Authority:**
- Daniel directive verbatim chat-current ACASĂ 2026-05-10 *"Facem react migration now ca sa avem pe ce lucra"* → re-evaluat post Daniel push-back *"vezi ca e vanila js da a fost facuta cu intentia de a migra la react"* → port-first-then-React paradigm LOCK V1 cap-coadă
- Mockup vs prod distincție revealed (15 chat-uri Phase 1+2+3+3.5 = ~70% degeaba pentru prod app live ZERO src/ diff per `git diff origin/main..HEAD -- src/` chat-current Phase 3.6 attempt audit)
- Memory rule #18 updated permanent (mockup `04-architecture/mockups/` = DESIGN MASTER pre-React migration target, prod `src/` = current state separate layout vechi)

**Cumulative LOCKED V1:** ~718 → ~719 (+1 net Port-First-Then-React substantive)

### Re-evaluare context decision (2026-05-10)

§AMENDMENT 2026-05-08 LOCKED React Migration LOCK V1 SUPERSEDE Vanilla. Re-evaluat 2026-05-10 chat ACASĂ post Phase 3.6 cluster #1 attempt CC autonomous HALT (audit raports ZERO src/ changes, hypothesis "Phase 3+3.5 broke observer pattern în src/" FALSIFIED).

Daniel critical context preserved: prod `src/` = vanilla JS arhitectat React-friendly (state.js single mutable obj + engines pure functions + UI separation = mapping mecanic post-migration). Memory cumulative chat-NEW3 birou ~688 LOCKED reaffirmed.

Daniel push-back fundamental: *"daca toate fixurile pe care le avem pana acum le-am face push in prod... si dupa ce ne asiguram ca functioneaza tot, am face migrarea la react si la noul clasic theme... nu ar fi mai usor?"*. Eu inițial gravitat React migration NOW direct = throwaway mockup paradigm. Daniel push-back corrected paradigm.

### Decision REVERT SUPERSEDE → Port-First-Then-React

**Vanilla JS preserved active stack pre-React migration.** Sequence productiv real:

**Step 1 (~1-2 săpt CC continuous):** Port mockup V2 design + Phase 3+3.5 fixes → prod vanilla JS modules `src/`. UI restructure prod V1 6 taburi → V2 4 taburi cap-coadă mockup design (single-theme Clasic master per STRATEGIC SHIFT 2026-05-10). Phase 3+3.5 HTML inline JS handlers → module ES refactor (NU copy-paste). Daniel obține app funcțional V2 pe andura.app live (prod în development per Daniel verbatim "putem lucra pe ea si testa real time"). Smoke real-time per commit.

**Step 2 (~1-2 săpt CC continuous):** React migration mecanic mapping post-Step 1 validation. state.js → Context+useReducer, src/pages/ → components/, src/engine/ preserved import direct. Clean port post-validation Step 1 functional. Themes restul (LB → Lux → BC) mecanic mapped pe Clasic baseline post 100% functional confirmed Daniel Gates smoke.

### Beneficii vs React migration NOW direct

- App funcțional interim NU 2-3 săpt black hole așteptare (prod în development, niciun user activ — zero downtime cost)
- Phase 3+3.5 mockup polish = real value (port la prod), NU throwaway
- Migration React = mecanic mapping (preserve structure), NU greenfield rewrite
- Risk-averse: validate vanilla JS port → migration React clean
- Mockup design SoT preserved pentru ambele steps (Clasic single-theme master)

### Tactical scope §AMENDMENT 2026-05-08 preserved compatible

Step 2 React migration tactical scope rămâne preserved unchanged from §AMENDMENT 2026-05-08:
- Vite preserved + React 19 + JSX + React Router v6 + Context+useReducer + CSS vars preserved + engines pure imports + PWA/SW/Firebase/IndexedDB preserved
- Migration ordering 8 batches per §AMENDMENT 2026-05-08 §Migration ordering preserved (Step 2 execution post Step 1 validation Daniel Gates smoke)
- React migration paradigm = CC autonomous mecanic mapping (NU strategic chat dedicat lung) per chat-current 2026-05-10 LOCK V1 clarificare #2

### Branch strategy LOCK V1 (clarificare #1 chat-current 2026-05-10)

- **Vault docs** (CURRENT_STATE + DECISION_LOG + INDEX_MASTER + DIFF_FLAGS + ADR-uri + handovers archived + LATEST.md) → push `main` (KB sync visibility, anti-recurrence rule)
- **Step 1 vanilla port code work** `src/` → `feature/v2-vanilla-port` separat (NU vizibil KB direct, rollback safety). Post Step 1 validation 100% Daniel Gates smoke → merge feature → main → KB sync code state actualizat.
- **Step 2 React migration code work** → new feature branch (`feature/react-migration` ex) — same pattern.
- **`feature/phase-3-orchestrator-final`** archived (NU merged main, audit raports preserved).

### Out of scope V1 (preserved §AMENDMENT 2026-05-08)

Toate punctele Out of scope V1 din §AMENDMENT 2026-05-08 preserved exact (TypeScript / Redux / Server components / Tailwind / Web Components / Storybook).

### Cross-refs

- §AMENDMENT 2026-05-08 React Migration LOCK V1 SUPERSEDE Vanilla — REVERTED de §AMENDMENT 2026-05-10, dar tactical scope Step 2 preserved compatible
- `00-index/CURRENT_STATE.md` §JUST_DECIDED 2026-05-10 chat ACASĂ entry Port-First-Then-React pivot
- `03-decisions/DECISION_LOG.md` entry top descending cronologic
- Memory rule #18 updated permanent (mockup vs prod distincție)
- Phase 3.6 cluster #1 attempt CC autonomous HALT (commit `4b5ba20` pe `feature/phase-3-orchestrator-final` archived raports)
- Strategic shift single-theme Clasic master 2026-05-10 (preserved valid + compatibil port-first paradigm)
