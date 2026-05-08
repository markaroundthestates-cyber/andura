# ADR 005: Vanilla JS + Vite, No UI Framework

**Status:** Accepted  
**Date:** 2026-04-23
**See also:** [[DECISION_LOG]] | STACK_CURRENT | [[008-vitest-playwright-testing]]

> **⚠️ SUPERSEDED 2026-05-08 §AMENDMENT — React Migration LOCK V1.**
> Original vanilla decision body preserved historical reference below.
> Active stack canonical: see §AMENDMENT 2026-05-08 final fișier.

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
