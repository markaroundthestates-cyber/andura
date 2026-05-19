---
title: TASK_3_STRUCTURE_STORE_TESTS.md
type: cc-autonomous-task
model: Opus EXCLUSIVELY
phase: Phase 1 Foundation
task: 3 of 4
depends-on: TASK_2 complete (Tailwind PostCSS configured, App.tsx smoke verified, build + typecheck clean)
---

# TASK 3 — src/react/ Structure + Zustand Store Skeleton + Foundation Tests

## Goal
Create `src/react/{components,stores,routes,lib}/` subfolder isolation pentru Andura Clasic UI (NU amestec cu `src/pages/*.js` vanilla legacy), add Zustand sample store skeleton, foundation smoke test via React Testing Library, backend integration test verifying `src/engine/` pure function imports work seamlessly în React build.

## Steps

### 3.1 — Create subfolder structure `src/react/`

```bash
mkdir -p src/react/components
mkdir -p src/react/stores
mkdir -p src/react/routes
mkdir -p src/react/lib
mkdir -p src/react/__tests__
```

Add `.gitkeep` markers (empty files) pentru git track empty dirs:

```bash
touch src/react/components/.gitkeep
touch src/react/routes/.gitkeep
touch src/react/lib/.gitkeep
```

### 3.2 — Create sample Zustand store skeleton

`src/react/stores/appStore.ts`:

```typescript
// ══ APP STORE — Zustand Skeleton (Phase 1 Foundation) ═════════════════════
// Per DECISIONS.md §D015 + §D016. Phase 2+ expands cu workout state machine,
// calendar, history, settings slices. Phase 1 = skeleton verify Zustand wire.
// Mockup parity: localStorage persistence pattern (Phase 2 add middleware).
//
// Cross-refs:
//   - DECISIONS.md §D015 STRAT PIVOT React Andura Clasic
//   - Mockup andura-clasic.html state patterns (localStorage keys, persona,
//     onboarding flow) — Phase 2 detailed mapping

import { create } from 'zustand';

export interface AppState {
  /** Current persona variant per mockup .persona-* CSS classes */
  persona: 'maria' | 'gigica' | 'marius';
  /** Phase 1 placeholder flag — Phase 2 replaced cu onboarding step state */
  initialized: boolean;
  /** Mutators */
  setPersona: (p: AppState['persona']) => void;
  setInitialized: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  persona: 'gigica',
  initialized: false,
  setPersona: (persona) => set({ persona }),
  setInitialized: (initialized) => set({ initialized }),
}));
```

### 3.3 — Create vitest setup file (Testing Library matchers)

`src/react/__tests__/setup.ts`:

```typescript
// ══ VITEST SETUP — React Testing Library matchers ═════════════════════════
// Loaded automat per vitest.config.js (Task 3.4 update setupFiles).

import '@testing-library/jest-dom/vitest';
```

### 3.4 — Update `vitest.config.js` root pentru setupFiles + TSX include

Read curent `vitest.config.js`. Existing:
```javascript
include: ['src/**/*.test.{js,ts}'],
```

Update la (add `.tsx` + setupFiles):
```javascript
include: ['src/**/*.test.{js,ts,tsx}'],
setupFiles: ['./src/react/__tests__/setup.ts'],
```

Final `vitest.config.js`:
```javascript
import { defineConfig } from 'vitest/config';

const nodeMajor = parseInt(process.version.slice(1).split('.')[0]);
const execArgv = nodeMajor >= 25 ? ['--no-webstorage'] : [];

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    silent: 'passed-only',
    include: ['src/**/*.test.{js,ts,tsx}'],
    setupFiles: ['./src/react/__tests__/setup.ts'],
    poolOptions: {
      threads: { execArgv },
      forks: { execArgv },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'src/__tests__/**',
        'src/**/*.test.js',
        'src/**/*.spec.js',
        'src/**/__tests__/**',
        'src/**/__snapshots__/**',
        'dist/**',
        'tests/**',
        'coverage/**',
        '**/*.config.js',
      ],
    },
  }
});
```

### 3.5 — Foundation smoke test (React Testing Library)

`src/react/__tests__/foundation.test.tsx`:

```typescript
// ══ FOUNDATION SMOKE — React Andura Clasic Phase 1 verify ═════════════════
// Validates App renders, Tailwind clases applied, Zustand store wires.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../../App';
import { useAppStore } from '../stores/appStore';

describe('Foundation smoke — App render', () => {
  it('renders Andura Clasic heading', () => {
    render(<App />);
    expect(screen.getByText(/Andura Clasic/i)).toBeInTheDocument();
  });

  it('renders Phase 1 Foundation marker', () => {
    render(<App />);
    expect(screen.getByText(/Phase 1 Foundation LANDED/i)).toBeInTheDocument();
  });

  it('applies Tailwind clase bg-paper la main', () => {
    const { container } = render(<App />);
    const mainEl = container.querySelector('main');
    expect(mainEl).not.toBeNull();
    expect(mainEl?.className).toMatch(/bg-paper/);
  });
});

describe('Foundation smoke — Zustand store', () => {
  it('useAppStore initial state correct', () => {
    const state = useAppStore.getState();
    expect(state.persona).toBe('gigica');
    expect(state.initialized).toBe(false);
  });

  it('useAppStore mutator setPersona updates state', () => {
    useAppStore.getState().setPersona('marius');
    expect(useAppStore.getState().persona).toBe('marius');
    // reset pentru izolare tests
    useAppStore.getState().setPersona('gigica');
  });

  it('useAppStore mutator setInitialized updates state', () => {
    useAppStore.getState().setInitialized(true);
    expect(useAppStore.getState().initialized).toBe(true);
    // reset
    useAppStore.getState().setInitialized(false);
  });
});
```

### 3.6 — Backend integration test

Identify pure function pentru smoke import test. Pick prima exportable named function pură găsită din `src/engine/`. Suggested candidates (în order):

1. `src/engine/fatigueIndex.js` — fatigue score pure
2. `src/engine/bayesianNutrition.js` — Bayesian nutrition observation
3. `src/engine/specialization/specializationEngine.js` — specialization weakness
4. `src/engine/schedule/scheduleAdapter.js` — Calendar V1 adapter

Verify export pattern:
```bash
grep -E "^export (function|const|default)" src/engine/fatigueIndex.js 2>/dev/null | head -3
grep -E "^export (function|const|default)" src/engine/bayesianNutrition.js 2>/dev/null | head -3
```

Pick first care exportă named pure function. Document choice în Task 4 raport §3.

Create `src/react/__tests__/backendIntegration.test.ts`:

```typescript
// ══ BACKEND INTEGRATION SMOKE — React Andura Clasic verify reuse ══════════
// Validates src/engine/* pure functions importable din React UI build via
// relative path. Per DECISIONS.md §D015 backend LOCK 1 100% reusable React
// migration (library 657, Big 11 8/8, Calendar engine, kcal floor, BATCH 2
// Antrenor, auth, tests 3743 PASS).

import { describe, it, expect } from 'vitest';

describe('Backend integration — src/engine/ reuse', () => {
  it('imports pure function din src/engine/ runtime', async () => {
    // EXACT module path + named export = picked from 3.6 candidates
    // Example dacă alegi fatigueIndex.js:
    // const mod = await import('../../engine/fatigueIndex.js');
    // expect(typeof mod.<pureFunctionName>).toBe('function');
    //
    // CC INSTRUCTION: Replace cu module ales + named export verified
    const mod = await import('../../engine/<PICKED_MODULE>');
    expect(mod).toBeDefined();
    expect(typeof mod.<PICKED_FUNCTION_NAME>).toBe('function');
  });
});
```

**CC instruction:** Replace `<PICKED_MODULE>` + `<PICKED_FUNCTION_NAME>` cu valoarea selectată în 3.6. Verify test passes via `npm run test:run` înainte commit.

### 3.7 — Run tests verify all PASS

```bash
npm run test:run 2>&1 | tail -20
```

Expect output: existing 3743 PASS preserved + new React tests (cca 6 smoke + 1 backend integration = ~7 new) = ~3750 PASS total.

Dacă any test fails → STOP, raport which test + stderr literal.

### 3.8 — Verify typecheck clean (Zustand TS types + RTL types)

```bash
npm run typecheck                                 # expect: 0 errors
```

## Success criteria

- `src/react/{components,stores,routes,lib,__tests__}/` subfolder structure created ✓
- `.gitkeep` markers added empty dirs ✓
- `src/react/stores/appStore.ts` Zustand skeleton cu typed interface ✓
- `src/react/__tests__/setup.ts` jest-dom matchers loaded ✓
- `vitest.config.js` updated cu `.tsx` include + setupFiles path ✓
- `src/react/__tests__/foundation.test.tsx` smoke 6 tests PASS ✓
- `src/react/__tests__/backendIntegration.test.ts` 1 test PASS (pure function imported) ✓
- `npm run test:run` total ~3750 PASS (3743 preserved + ~7 new) ✓
- `npm run typecheck` 0 errors ✓

## Fail conditions

- Test RED any (foundation smoke sau backend integration) → STOP, raport which test + stderr literal
- Vanilla 3743 PASS regression → STOP CRITICAL, rollback consideration via `git checkout pre-phase-1-react-foundation-2026-05-16`
- Backend pure function pick fail (no exportable found) → STOP, raport candidates evaluated
- Typecheck errors (Zustand TS, RTL types) → STOP, raport TS errors literal

## Output

Console raport scurt: "Task 3 DONE. src/react/ structure created. Zustand appStore skeleton. Foundation smoke 6/6 PASS. Backend integration 1/1 PASS (imported <PICKED_FUNCTION_NAME> from src/engine/<PICKED_MODULE>). Total ~3750 PASS (3743 vanilla preserved). Typecheck clean. Continue Task 4."

---

🦫 **Backend reuse verified — LOCK 1 100% preserved invariant. Subfolder isolation `src/react/` evită amestec vanilla legacy `src/pages/*.js`. Zustand TS typed peak craft. RTL matchers loaded standard.**
