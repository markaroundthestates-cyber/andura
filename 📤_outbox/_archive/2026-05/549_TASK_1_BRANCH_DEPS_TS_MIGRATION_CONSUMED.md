---
title: TASK_1_BRANCH_DEPS_TS_MIGRATION.md
type: cc-autonomous-task
model: Opus EXCLUSIVELY
phase: Phase 1 Foundation
task: 1 of 4
depends-on: pre-flight verification ORCHESTRATOR passed (clean tree, main HEAD e8772c9, 3743 PASS baseline)
---

# TASK 1 — Backup + Branch + Deps Install + TypeScript Migration Batch 1 Scaffold

## Goal
Create backup tag, new branch `feature/v3-react-clasic` din `main` HEAD, install Zustand + Tailwind + Testing Library deps (Tailwind PostCSS NU CDN), migrate Batch 1 React scaffold `.jsx` → `.tsx` (preserve git history via `git mv`), update `react-test.html` script src path.

## Steps

### 1.1 — Backup tag main HEAD pre-Phase-1

```bash
git tag pre-phase-1-react-foundation-2026-05-16
git push origin pre-phase-1-react-foundation-2026-05-16
```

Verify pushed:
```bash
git ls-remote --tags origin | grep pre-phase-1-react-foundation
```

### 1.2 — Create branch nou

```bash
git checkout main
git pull origin main                              # sync with remote
git checkout -b feature/v3-react-clasic
git push -u origin feature/v3-react-clasic
```

Verify branch:
```bash
git branch --show-current                         # expect: feature/v3-react-clasic
```

### 1.3 — Install deps Zustand + Tailwind + Testing Library

```bash
npm install --save zustand
npm install --save-dev tailwindcss postcss autoprefixer @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Verify install success exit 0. Verify `package.json` updated cu noile entries:

```bash
node -e "const p = require('./package.json'); console.log('zustand:', p.dependencies.zustand); console.log('tailwindcss:', p.devDependencies.tailwindcss); console.log('@testing-library/react:', p.devDependencies['@testing-library/react'])"
```

Expect: toate 3 returnează versiuni valid (NU `undefined`).

### 1.4 — Verify package.json + package-lock.json updated

```bash
git status --short                                # expect: M package.json, M package-lock.json
```

NU commit acum — accumulez în Task 4.

### 1.5 — Rename `.jsx` → `.tsx` (preserve git history)

```bash
git mv src/main.jsx src/main.tsx
git mv src/App.jsx src/App.tsx
```

Verify rename:
```bash
git status --short                                # expect: R src/main.jsx -> src/main.tsx, R src/App.jsx -> src/App.tsx
```

### 1.6 — Update `src/main.tsx` content (TypeScript syntax)

Read curent content `src/main.tsx` (post-rename). Existing content:

```typescript
// ══ REACT ENTRY POINT — Batch 1 Scaffold (parallel) ═══════════════════════
// Active doar pentru `react-test.html` parallel entry. Existing vanilla app
// `src/main.js` preserved unchanged. Migration progresses Batch 2-8 sequential.
//
// Cross-refs:
//   - 03-decisions/_FROZEN/005-vanilla-js-no-framework.md §AMENDMENT 2026-05-08 React Migration LOCK
//   - 04-architecture/REACT_MIGRATION_STATE_MAPPING_V1.md §7 8-batch strategy

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in react-test.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Replace content cu (update import + add CSS global + TS typing):

```typescript
// ══ REACT ENTRY POINT — Andura Clasic Build (Phase 1 Foundation LANDED) ═══
// Per DECISIONS.md §D015 STRAT PIVOT + §D016 PROC: lansăm Andura Clasic pe
// React folosind mockup 04-architecture/mockups/andura-clasic.html DESIGN
// MASTER direct. Vanilla src/main.js + index.html = LEGACY preserved live
// andura.app până React LANDED.
//
// Cross-refs:
//   - DECISIONS.md §D015 STRAT PIVOT Pre-Beta React Andura Clasic
//   - DECISIONS.md §D016 PROC nav 6→4 + screens 50+ în React build only

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in react-test.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### 1.7 — Update `src/App.tsx` content (TypeScript export named)

Existing content post-rename:
```typescript
// ══ REACT APP ROOT — Batch 1 Scaffold Placeholder ═════════════════════════
// Validates React deps + Vite plugin + JSX transform end-to-end. Batch 2
// adds React Router skeleton + 4 root nav routes. Batch 3 adds AppContext
// state mapping per REACT_MIGRATION_STATE_MAPPING_V1.md §2.

export function App() {
  return (
    <main style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>
        🦫 Andura React Scaffold
      </h1>
      ...
    </main>
  );
}
```

Replace cu (preserve placeholder, Tailwind clases added în Task 2 după CSS extract):

```typescript
// ══ REACT APP ROOT — Andura Clasic Build (Phase 1 Foundation) ═════════════
// Per DECISIONS.md §D015 + §D016. Tailwind clases adăugate Task 2 post
// CSS variables extract mockup. Routing + 4 root nav (Antrenor/Progres/
// Istoric/Cont) adăugat Phase 2.

export function App(): JSX.Element {
  return (
    <main style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>
        🦫 Andura Clasic
      </h1>
      <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>
        Phase 1 Foundation LANDED — Vite + React 19 + TypeScript + Zustand + Tailwind.
      </p>
      <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>
        Vanilla legacy preserved exact la <code>/</code>.
      </p>
      <p style={{ fontSize: '14px', color: '#888', marginTop: '24px' }}>
        Next: Phase 2 React Router skeleton + 50+ screens mockup goto() migration.
      </p>
    </main>
  );
}
```

### 1.8 — Update `react-test.html` import path

Read curent content `react-test.html` line 32:
```html
<script type="module" src="/src/main.jsx"></script>
```

Replace cu:
```html
<script type="module" src="/src/main.tsx"></script>
```

Update title meta line 6:
```html
<title>Andura — Clasic (React build Phase 1)</title>
```

### 1.9 — Verify build pipeline

```bash
npm run build                                     # expect: dist/ generated 0 errors
ls dist/                                          # expect: index.html + react-test.html + assets/
```

Verify build dist outputs both entries.

### 1.10 — Verify typecheck clean

```bash
npm run typecheck                                 # expect: 0 errors
```

Dacă typecheck fail → STOP, raport TypeScript errors literal.

## Success criteria

- Backup tag `pre-phase-1-react-foundation-2026-05-16` pushed origin ✓
- Branch `feature/v3-react-clasic` created + pushed origin ✓
- Zustand + Tailwind + PostCSS + Autoprefixer + @testing-library × 3 installed ✓
- `src/main.jsx` → `src/main.tsx` rename via `git mv` (history preserved) ✓
- `src/App.jsx` → `src/App.tsx` rename via `git mv` (history preserved) ✓
- `src/main.tsx` content updated cu import global.css + import `./App` (no extension TS) + DECISIONS.md cross-refs ✓
- `src/App.tsx` content updated cu return type `JSX.Element` + "Andura Clasic" branding + Phase 1 messaging ✓
- `react-test.html` script src `/src/main.tsx` + title updated ✓
- `npm run build` 0 errors ✓
- `npm run typecheck` 0 errors ✓
- ZERO commits acum (accumulez Task 4) ✓

## Fail conditions

- `npm install` network/conflict failure → STOP, raport stderr literal
- `git mv` permission denied sau target exists → STOP, raport
- `npm run build` fails → STOP, raport build error literal
- `npm run typecheck` errors → STOP, raport TS errors literal

## Output

Console raport scurt: "Task 1 DONE. Backup tag X + branch Y pushed. Deps installed (zustand + tailwind + testing-library). Batch 1 scaffold migrated .jsx → .tsx (git mv preserved history). Build + typecheck clean. Continue Task 2."

---

🦫 **Surgical touch — modificate doar Batch 1 scaffold files (main.tsx, App.tsx, react-test.html), package.json + lock pentru deps. ZERO vanilla legacy code modificat (`src/main.js`, `src/pages/*.js`, `src/engine/*.js` invariante).**
