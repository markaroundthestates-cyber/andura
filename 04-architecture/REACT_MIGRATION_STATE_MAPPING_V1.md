# REACT MIGRATION — STATE MAPPING V1

**Status:** ACTIVE_SSOT (canonical migration reference, pre-implementation)
**Date:** 2026-05-08 chat NEW acasă React migration plan tactical chat dedicat
**Authority:** Daniel chat-NEW3 birou 2026-05-07 direction LOCK + chat-current acasă 2026-05-08 tactical scope LOCK Co-CTO scope
**Cumulative LOCKED V1:** ~689 → ~690 (+1 net mapping doc canonical)

**Cross-refs:**
- [[../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-08 (foundation lock)
- [[../03-decisions/030-decision-cluster-strangler]] D2 orchestrator preserved compatible
- [[../03-decisions/018-engine-extensibility-architecture]] §2 Standardized Dimension Contract pure functions
- [[mockups/andura-clasic.html]] + [[mockups/andura-living-body.html]] design tokens canonical SSOT
- [[ROOT_NAV_V2_29_5_7_AMENDMENT]] root nav 4 tabs LOCKED final
- [[../00-index/CURRENT_STATE]] §JUST_DECIDED 2026-05-08 chat NEW acasă entry

---

## §1 — Current state inventory (vanilla JS baseline)

### §1.1 Global session state — `src/state.js`

**Shape (24 fields, single mutable obj ES module export — verified filesystem 2026-05-08):**

```javascript
export const state = {
  // Session lifecycle (8)
  sessActive: false,
  sessStart: null,
  sessTimer: null,        // setInterval ref
  sessLog: [],            // array of set log entries
  currentEx: '',
  currentSet: 1,
  awaitingRPE: false,
  sessType: null,         // PUSH | PULL | LEGS | REST

  // Per-set execution (3)
  sessRepsInput: 10,
  sessionKgOverride: null,
  lastSetRPE: null,

  // Per-session computed (3)
  completedExercises: new Set(),  // exercise names completed >= EX_SETS threshold
  dropSetUsedThisSession: false,
  sessionTotalExercises: 0,

  // Pause/timer (4)
  pauseTimer: null,       // setInterval ref
  pauseTotal: 0,
  pauseLeft: 0,
  lastPauseEndedAt: null,

  // Audio (1)
  isMuted: false,

  // UI ephemeral (2)
  activeNotes: new Set(),
  logDateOffset: 0,

  // Outcome (3)
  sessKcalBurn: 0,
  earlyStopReason: null,
  cdlEntryId: null,
};

export const getState = () => state;
```

**Mutation pattern (current vanilla):** direct property mutation `state.sessActive = true` cross-module post `import { state }`. ES module singleton — every importer shares reference.

### §1.2 Coach page scope — `src/pages/coach/state.js`

**4 distinct concerns (verified filesystem 2026-05-08):**

```javascript
// Director session cache TTL 5 min
export const sessionCache = {
  session: null,
  timestamp: null,
  TTL_MS: 5 * 60 * 1000,
  get() { /* TTL-aware getter */ },
  set(s) { /* setter + timestamp */ },
  invalidate() { /* nuke + log */ },
};
window._directorCache = sessionCache;  // dev console access

// Cached director value (separate from sessionCache — synchronous read access)
let _cachedDirectorValue = null;
export function getCachedDirector() { return _cachedDirectorValue; }
export function setCachedDirector(s) { _cachedDirectorValue = s; }

// Wake Lock API ref
export const wakeLockRef = { current: null };

// UI expand/collapse toggles
export const uiToggleFlags = { exListExpanded: {}, prWallExpanded: false };
```

### §1.3 Storage layer — split tier modules

**Preserved EXACT post-migration (NU touch):**
- `src/db.js` — **Tier 0 localStorage wrapper.** `DB.get(key)` / `DB.set(key, value)` JSON-serializing accessors + `$` DOM helper + date helpers (`tod`, `todTs`, `todDate`, `fmt`, `cleanEx`). Pure framework-agnostic.
- `src/storage/db.js` — **Tier 1 Dexie.js IndexedDB** per-user namespacing `andura_<uid>` (ADR 020 + ADR_MULTI_TENANT_AUTH_v1 §56.1.4). Schema versioning native Dexie.
- `src/storage/tier2Stub.js` — Tier 2 stub (deferred V1+).
- `src/storage/tieringEngine.js` — rotation Tier 0 → Tier 1 → Tier 2 per ADR 020.
- `src/storage/tieredRead.js` — read fall-through Tier 0 → 1 → 2.
- `src/storage/migrateAnonymousToAuth.js` — anonymous → auth namespace migration on signup.
- `src/firebase.js` — Firebase Auth + RTDB sync layer.
- `src/migrations/` — schema versioning ADR 018 §4 + migration runner (`MIGRATIONS.js`, `migrationRunner.js`, dated migrations).

Storage interface = framework-agnostic, NU subject la migration React.

### §1.4 Mutation surfaces (cross-module direct writes)

**Files referențiezez `state.<field> = X` direct:**
- `src/pages/coach/session.js` (≥40 mutations: lifecycle start/end/cancel + pause + per-set + outcome)
- `src/pages/coach/logging.js` (per-set log appends)
- `src/pages/coach/restTimer.js` (pause timer)
- `src/pages/coach/rating.js` (post-session rating)
- `src/pages/coach/util.js` (helpers)
- `src/pages/coach/renderIdle.js` (pre-session reset)
- `src/coach.js` (entry point session orchestration)

**Implications:** ~7 modules collaborate via shared mutable singleton. Migration React = replace direct mutation cu reducer dispatch action. ZERO logic change — same fields, same transitions, dispatch wrapper per mutation site.

---

## §2 — Target Context provider shape (React migration)

### §2.1 AppContext + useReducer (single source-of-truth)

**Shape mirror EXACT current `state.js` global obj** (zero structural divergence — minimize migration friction):

```jsx
// src/state/AppContext.jsx (NEW post-migration)
import { createContext, useReducer, useContext } from 'react';
import { appReducer, INITIAL_STATE } from './appReducer';

const AppStateContext = createContext(null);
const AppDispatchContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);
export const useAppDispatch = () => useContext(AppDispatchContext);
```

**Rationale split state/dispatch contexts:** components care doar dispatch (NU read state) NU re-render la state change. React Hooks pattern recommended pentru perf single-user app low-cost.

### §2.2 Initial state — mirror `state.js` 24 fields

```javascript
// src/state/appReducer.js (NEW post-migration)
export const INITIAL_STATE = {
  // Session lifecycle (8)
  sessActive: false,
  sessStart: null,
  sessTimer: null,
  sessLog: [],
  currentEx: '',
  currentSet: 1,
  awaitingRPE: false,
  sessType: null,

  // Per-set execution (3)
  sessRepsInput: 10,
  sessionKgOverride: null,
  lastSetRPE: null,

  // Per-session computed (3)
  completedExercises: [],          // ⚠️ Set → Array (Context value === comparison + JSON serialization)
  dropSetUsedThisSession: false,
  sessionTotalExercises: 0,

  // Pause/timer (4)
  pauseTimer: null,
  pauseTotal: 0,
  pauseLeft: 0,
  lastPauseEndedAt: null,

  // Audio (1)
  isMuted: false,

  // UI ephemeral (2)
  activeNotes: [],                 // ⚠️ Set → Array (same rationale)
  logDateOffset: 0,

  // Outcome (3)
  sessKcalBurn: 0,
  earlyStopReason: null,
  cdlEntryId: null,
};
```

**⚠️ Set → Array conversion (2 fields):** `completedExercises` + `activeNotes`. Justify: React reducer state convention = serializable + structural equality `===` checks pe primitives/arrays. Set === Set false even cu same content. Dispatch ADD/REMOVE actions immutable spread NEW array. Per-render compute uniqueness via Array.from(new Set()) sau filter.

### §2.3 Action types (reducer dispatch namespace)

```javascript
// src/state/actions.js (NEW post-migration)
export const ACTIONS = Object.freeze({
  // Session lifecycle
  SESSION_START:           'SESSION_START',
  SESSION_END:             'SESSION_END',
  SESSION_CANCEL:          'SESSION_CANCEL',
  SESSION_RESTORE_DRAFT:   'SESSION_RESTORE_DRAFT',
  SESSION_TYPE_SET:        'SESSION_TYPE_SET',

  // Per-set execution
  SET_LOG_APPEND:          'SET_LOG_APPEND',
  CURRENT_EX_SET:          'CURRENT_EX_SET',
  CURRENT_SET_INCREMENT:   'CURRENT_SET_INCREMENT',
  REPS_INPUT_SET:          'REPS_INPUT_SET',
  KG_OVERRIDE_SET:         'KG_OVERRIDE_SET',
  RPE_SET:                 'RPE_SET',
  AWAITING_RPE_SET:        'AWAITING_RPE_SET',

  // Per-exercise
  EX_COMPLETE:             'EX_COMPLETE',          // ADD to completedExercises array uniqueness
  DROP_SET_FLAG:           'DROP_SET_FLAG',

  // Pause/timer
  PAUSE_START:             'PAUSE_START',
  PAUSE_TICK:              'PAUSE_TICK',
  PAUSE_END:               'PAUSE_END',

  // Audio
  MUTE_TOGGLE:             'MUTE_TOGGLE',

  // UI ephemeral
  NOTE_TOGGLE:             'NOTE_TOGGLE',          // ADD/REMOVE activeNotes array
  LOG_DATE_OFFSET_SET:     'LOG_DATE_OFFSET_SET',

  // Outcome
  EARLY_STOP_REASON_SET:   'EARLY_STOP_REASON_SET',
  KCAL_BURN_ADD:           'KCAL_BURN_ADD',
  CDL_ENTRY_ID_SET:        'CDL_ENTRY_ID_SET',
});
```

**Action shape convention:** `{ type: ACTIONS.X, payload: <data> }`. Payload omis pentru toggle actions.

### §2.4 Reducer signature (pure function)

```javascript
// src/state/appReducer.js (continuation)
export function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SESSION_START:
      return {
        ...state,
        sessActive: true,
        sessStart: action.payload.sessStart,
        sessLog: [],
        currentEx: '',
        currentSet: 1,
        completedExercises: [],
        dropSetUsedThisSession: false,
        earlyStopReason: null,
        cdlEntryId: action.payload.cdlEntryId ?? null,
        sessType: action.payload.sessType ?? null,
      };

    case ACTIONS.SET_LOG_APPEND:
      return {
        ...state,
        sessLog: [...state.sessLog, action.payload],
      };

    case ACTIONS.EX_COMPLETE:
      // ADD with uniqueness — Array.from(new Set([...arr, x]))
      if (state.completedExercises.includes(action.payload)) return state;
      return {
        ...state,
        completedExercises: [...state.completedExercises, action.payload],
      };

    case ACTIONS.NOTE_TOGGLE: {
      const has = state.activeNotes.includes(action.payload);
      return {
        ...state,
        activeNotes: has
          ? state.activeNotes.filter(n => n !== action.payload)
          : [...state.activeNotes, action.payload],
      };
    }

    // ... etc per action — straightforward immutable spread per field

    default:
      return state;
  }
}
```

**Pure function invariants:** ZERO side effects. ZERO direct DOM access. ZERO storage writes. Side effects = useEffect în components (post-dispatch persistence). Reducer testable în vacuum vitest unit-test.

---

## §3 — Coach scope state → custom hooks

**Don't extend AppContext cu coach scope.** Coach scope state (sessionCache, wakeLockRef, uiToggleFlags, cachedDirector) = encapsulate în custom hooks scoped la coach pages.

### §3.1 `useDirectorCache(date, deps)` — TTL 5min memoized

```javascript
// src/pages/coach/hooks/useDirectorCache.js (NEW post-migration)
import { useState, useEffect, useRef } from 'react';
import { coachDirector } from '../../../engine/coachDirector';

const TTL_MS = 5 * 60 * 1000;

export function useDirectorCache(ctx) {
  const cacheRef = useRef({ value: null, timestamp: null });
  const [director, setDirector] = useState(null);

  useEffect(() => {
    const cached = cacheRef.current;
    if (cached.value && (Date.now() - cached.timestamp) < TTL_MS) {
      setDirector(cached.value);
      return;
    }
    const fresh = coachDirector(ctx);
    cacheRef.current = { value: fresh, timestamp: Date.now() };
    setDirector(fresh);
  }, [ctx]);  // re-run when context changes (same as cache invalidate)

  const invalidate = () => { cacheRef.current = { value: null, timestamp: null }; };

  return { director, invalidate };
}
```

### §3.2 `useWakeLock()` — Wake Lock API lifecycle

```javascript
// src/pages/coach/hooks/useWakeLock.js (NEW post-migration)
import { useRef, useEffect } from 'react';

export function useWakeLock(active) {
  const lockRef = useRef(null);

  useEffect(() => {
    if (!active) {
      if (lockRef.current) {
        lockRef.current.release();
        lockRef.current = null;
      }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        if ('wakeLock' in navigator) {
          const lock = await navigator.wakeLock.request('screen');
          if (cancelled) lock.release();
          else lockRef.current = lock;
        }
      } catch { /* unsupported — silently ignore */ }
    })();

    return () => {
      cancelled = true;
      if (lockRef.current) {
        lockRef.current.release();
        lockRef.current = null;
      }
    };
  }, [active]);
}
```

### §3.3 `useSessionTimer(active)` — setInterval lifecycle

```javascript
// src/pages/coach/hooks/useSessionTimer.js (NEW post-migration)
import { useEffect } from 'react';

export function useSessionTimer(active, onTick) {
  useEffect(() => {
    if (!active) return;
    const id = setInterval(onTick, 1000);
    return () => clearInterval(id);
  }, [active, onTick]);
}
```

### §3.4 `useDraftPersistence(state)` — debounced auto-save to DB

```javascript
// src/pages/coach/hooks/useDraftPersistence.js (NEW post-migration)
import { useEffect } from 'react';
import { DB, tod } from '../../../db';

const DEBOUNCE_MS = 500;

export function useDraftPersistence(state) {
  useEffect(() => {
    if (!state.sessActive || !state.sessStart) return;
    const id = setTimeout(() => {
      DB.set('session-draft', {
        date: tod(),
        sessStart: state.sessStart,
        sessLog: [...state.sessLog],
        currentEx: state.currentEx,
        currentSet: state.currentSet,
        timestamp: Date.now(),
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [state.sessActive, state.sessStart, state.sessLog, state.currentEx, state.currentSet]);
}
```

### §3.5 `useStorageKey(key)` — DB.get/set wrapper reactive

```javascript
// src/state/hooks/useStorageKey.js (NEW post-migration)
import { useState, useEffect, useCallback } from 'react';
import { DB } from '../../db';

export function useStorageKey(key, defaultValue = null) {
  const [value, setValue] = useState(() => DB.get(key) ?? defaultValue);

  const update = useCallback((newValue) => {
    DB.set(key, newValue);
    setValue(newValue);
  }, [key]);

  // Optional: listen pentru cross-tab storage events
  useEffect(() => {
    const handler = (e) => {
      if (e.key === key) setValue(DB.get(key) ?? defaultValue);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key, defaultValue]);

  return [value, update];
}
```

### §3.6 UI toggle local state — NU în Context

`uiToggleFlags { exListExpanded, prWallExpanded }` = local UI state per-component. Migrate la `useState({})` în component direct. NO global. ZERO impact app-level.

---

## §4 — Component boundaries map

### §4.1 Page-level (4 routes V2 mockup canonical)

```
<App>
└── <AppProvider>
    └── <BrowserRouter>
        └── <Layout>                          # nav bar bottom + container
            ├── <Route path="/antrenor">      # Coach session UI
            │   ├── <CoachIdle>               # pre-session (renderIdle.js → component)
            │   └── <SessionActive>           # in-session
            ├── <Route path="/progres">       # Progres metrics
            ├── <Route path="/istoric">       # Log history (logDateOffset state local)
            └── <Route path="/cont">          # Settings + auth
```

### §4.2 Antrenor sub-tree (most complex)

```
<CoachIdle>                                   # pre-session
├── <ReadinessCard>                           # readiness verdict + score
├── <SessionTypeBanner>                       # PUSH/PULL/LEGS today
├── <ExerciseList expanded={uiLocal}>         # uiToggleFlags.exListExpanded → local
└── <PRWall expanded={uiLocal}>               # uiToggleFlags.prWallExpanded → local

<SessionActive>                               # active session
├── <SessionHeader>                           # timer display + mute toggle
├── <ExerciseCard ex={state.currentEx}>       # per-current-exercise detail
│   └── <SetLogger>                           # set entry form (kg + reps + RPE)
├── <RestTimer pauseLeft={state.pauseLeft}>   # pause display
├── <SessionLog log={state.sessLog}>          # all sets logged
└── <RatingFlow show={state.awaitingRPE}>     # post-session rating modal
```

### §4.3 Onboarding flow (§63.1 5 ecrane T0 reordered LOCKED)

```
<OnboardingRouter>                            # /onboarding/*
├── <OnboardingObiectiv>                      # /obiectiv (1st reordered post-LOCK)
├── <OnboardingVarsta>                        # /varsta
├── <OnboardingSex>                           # /sex
├── <OnboardingMedical>                       # /medical
└── <OnboardingFrecventa>                     # /frecventa
```

**Persistence:** each step → `useStorageKey('onboarding-<key>')` cu `update()` callback la submit. Final step → bootstrap user state + redirect `/antrenor`.

### §4.4 Cont V2 inventar (§NEW2 LOCKED)

```
<ContPage>
├── <AccountSection>                          # Magic Link + Google + delete 2-step
├── <SettingsSection>                         # mute, theme picker, language RO/EN
├── <DataExportSection>                       # GDPR Article 20 defer post-Beta
└── <ThemePicker>                             # Andura Clasic + Living Body + 2 "Curând"
```

---

## §5 — Engines integration (pure functions imports preserved exact)

**Invariant LOCKED V1:** engines pure functions per ADR 018 §2 Standardized Dimension Contract = ZERO React-aware. Components import direct + call în `useMemo`/`useEffect`.

### §5.1 useMemo pentru pure synchronous calls

```javascript
// src/pages/coach/CoachIdle.jsx (post-migration sketch)
import { useMemo } from 'react';
import { useAppState } from '../../state/AppContext';
import { coachDirector } from '../../engine/coachDirector';
import { getTodayReadiness } from '../../engine/readiness';

function CoachIdle() {
  const state = useAppState();

  const readiness = useMemo(() => getTodayReadiness(), []);
  const directorCtx = useMemo(() => buildDirectorContext(state, readiness), [state, readiness]);
  const { director } = useDirectorCache(directorCtx);

  return (/* JSX rendering director output */);
}
```

### §5.2 useEffect pentru side-effect orchestration (CDL writes, telemetry)

```javascript
// Post-session outcome population (replaces session.js endSession orchestration)
useEffect(() => {
  if (!shouldFinalizeSession) return;
  const aaResult = detectAutoAggression({ currentEntry, recentEntries });
  populateOutcome(today, { ...outcome, autoAggression: aaResult });
  dispatch({ type: ACTIONS.SESSION_END });
}, [shouldFinalizeSession]);
```

### §5.3 Engines orchestrator pipeline §42.10 V1 preserved

8/8 engines pure functions Periodization → Goal Adaptation → Energy → Bayesian Nutrition → Tempo → Specialization → Warm-up → Deload preserved exact. ADR 030 D2 STRANGLER orchestrator agnostic la UI framework — pipeline runs identical pre/post-migration.

---

## §6 — DB layer compatibility

**Preserved EXACT (NU touch — verified filesystem 2026-05-08):**
- `src/db.js` — Tier 0 localStorage wrapper (DB.get / DB.set / `$` DOM helper / date helpers `tod`/`todTs`/`todDate`/`fmt`/`cleanEx`).
- `src/storage/db.js` — Tier 1 Dexie.js IndexedDB per-user namespacing `andura_<uid>` (ADR 020 + ADR_MULTI_TENANT_AUTH_v1 §56.1.4 LOCKED V1).
- `src/storage/tieringEngine.js` — ADR 020 rotation Tier 0 → Tier 1 → Tier 2.
- `src/storage/tieredRead.js` — read fall-through Tier 0 → 1 → 2.
- `src/storage/tier2Stub.js` — Tier 2 stub (deferred V1+).
- `src/storage/migrateAnonymousToAuth.js` — anonymous → auth namespace migration.
- `src/util/coachDecisionLog.js` — CDL Tier 0 ephemeral + Tier 1 archived per ADR 011.
- `src/migrations/` — schema versioning ADR 018 §4 + migration runner (`MIGRATIONS.js`, `migrationRunner.js`, dated migrations).
- `src/firebase.js` — Firebase Auth + RTDB sync layer.
- `src/auth.js` + `src/pages/auth.js` + `src/pages/authShell.js` — Auth Phase 2 LANDED preserved (`0880641`).

**Hook wrapper for component reactivity:** `useStorageKey(key)` §3.5. Components NU import DB direct — folosesc hook pentru reactivity.

**Exception:** non-reactive helpers (e.g. `populateOutcome`, `writeProposed`) call DB direct — NU hook (one-shot side effect, NO reactivity needed). Same as current vanilla pattern.

---

## §7 — Migration strategy (per-batch incremental)

**8 batches estimative** per ADR 005 §AMENDMENT 2026-05-08. NU big-bang. Each batch = self-contained commit, tests pass, deploy preview.

| Batch | Scope | Files modified (estimative) | Effort estimative | Tests gate |
|-------|-------|------------------------------|-------------------|------------|
| 1 | Vite+React 19 scaffold + entry | `package.json` + `vite.config.js` + `index.html` + `src/main.jsx` NEW | 0.5 zi | smoke test dev server live |
| 2 | React Router skeleton + routes (4 root nav) | `src/main.jsx` + `src/Layout.jsx` NEW + 4 stub pages | 0.5 zi | navigation smoke test |
| 3 | state.js → AppContext + reducer mapping mecanic | `src/state/AppContext.jsx` + `src/state/appReducer.js` + `src/state/actions.js` NEW + ALL mutation sites refactor (~7 files) | 1-1.5 zi | 2683+ tests preserved + integration coach flow |
| 4 | Top-level page shells | `<AntrenorPage>` + `<ProgresPage>` + `<IstoricPage>` + `<ContPage>` shells | 1 zi | route navigation + render smoke |
| 5 | Onboarding flow components (§63.1 5 ecrane) | `src/pages/onboarding/*.jsx` NEW + storage hooks | 1-1.5 zi | onboarding flow E2E + persist |
| 6 | Coach session UI components | `<CoachIdle>` + `<SessionActive>` + sub-components + custom hooks coach scope | 2-3 zile | coach flow E2E + engines integration + 8 engines pipeline §42.10 |
| 7 | Settings + auth Phase 2 LANDED preserved | `<ContPage>` sub-components + auth flow integration | 0.5-1 zi | auth E2E + settings persist |
| 8 | Theme picker + CSS vars switcher | `<ThemePicker>` + theme tokens hook | 0.5 zi | theme switch smoke |

**Total estimative:** 7-10 zile CC continuous → 1-2 săpt per Daniel chat-NEW3 LOCK.

**Per-batch gate criteria:**
- Tests baseline preserved (2683 PASS minimum, expand cu new component tests)
- Playwright E2E smoke pass
- Manual deploy preview Daniel acceptance check (visual + flow)
- Backup tag pre-batch + commit msg structured + raport LATEST.md

---

## §8 — Out of scope V1 (deferred)

- TypeScript migration (separate ADR future v1.5+ candidate)
- Redux / Zustand / state management library beyond Context+useReducer
- Server components / Next.js / SSR
- Tailwind / CSS-in-JS migration
- Web Components / Shadow DOM
- Storybook / component library extraction
- React Native / mobile-native (PWA preserved exact)
- React Server Functions / RSC

---

## §9 — Cross-refs

- [[../03-decisions/005-vanilla-js-no-framework]] §AMENDMENT 2026-05-08 — foundation lock
- [[../03-decisions/030-decision-cluster-strangler]] D2 — orchestrator preserved compatible
- [[../03-decisions/018-engine-extensibility-architecture]] §2 — engines pure functions invariant
- [[../03-decisions/011-coach-decision-log-architecture]] — CDL Tier 0/1/2 preserved
- [[../03-decisions/020-storage-tiering-strategy]] — IndexedDB rotation preserved
- [[../03-decisions/ADR_MULTI_TENANT_AUTH_v1]] — Auth Phase 2 LANDED preserved
- [[mockups/andura-clasic.html]] + [[mockups/andura-living-body.html]] — design tokens canonical SSOT
- [[ROOT_NAV_V2_29_5_7_AMENDMENT]] — root nav 4 tabs LOCKED final
- [[../00-index/CURRENT_STATE]] §JUST_DECIDED 2026-05-08 chat NEW acasă entry
- [[../03-decisions/DECISION_LOG]] entry top descending cronologic
- [[../08-workflows/PRE_LAUNCH_CHECKLIST_V1]] §CC Opus #2 React migration implementation
