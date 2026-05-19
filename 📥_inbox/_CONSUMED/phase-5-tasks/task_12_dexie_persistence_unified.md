# task_12 — IndexedDB Dexie React Unified Persistence Migration

**Phase:** 5 (engine pipeline real wire)
**Type:** Refactor — storage layer unify
**Deps:** task_11 (post all features wired localStorage)
**Backup tag:** `pre-phase5-task-12-2026-05-17`
**Est commits:** 3 atomic (Dexie schema + migrations + store consumers)
**Est tests delta:** +15-25

---

## §1 Scope

Currently React layer uses **Zustand persist middleware → localStorage** scattered:
- `wv2-workout-store` (workout state)
- `wv2-schedule-store` (calendar state)
- `wv2-nutrition-store` (nutrition log)
- `wv2-progres-store` (weight + body data log)
- `wv2-sessions-history` (sessions log)
- `wv2-missing-equipment` (engine context)
- `wv2-calendar-override` (engine override)
- Plus legacy `src/storage/` Dexie integration for engine layer

Per ADR 005 + D-LEGACY-015 + D-LEGACY-005 Three-tier log storage strategy:
- Tier 0 active rolling — last ~90 days
- Tier 1 medium-term — 90 days - 1 year
- Tier 2 archive — 1+ year compressed

Task 12: unified Dexie IndexedDB schema cross all `wv2-*` stores cu Zustand integration via custom storage adapter. Backward compat — auto-migrate from localStorage pe first run.

## §2 Changes

### A. `src/react/storage/dexieAdapter.ts` (NEW)

```tsx
import Dexie, { Table } from 'dexie';

export interface SessionRecord {
  id: string;
  startTime: number;
  endTime: number;
  data: object; // full SessionHistoryEntry
  tier: 0 | 1 | 2;
}

export interface KeyValueRecord {
  key: string;
  value: string;
  updatedAt: number;
  tier: 0 | 1 | 2;
}

class AnduraDB extends Dexie {
  sessions!: Table<SessionRecord, string>;
  kv!: Table<KeyValueRecord, string>;

  constructor() {
    super('andura-wv2');
    this.version(1).stores({
      sessions: 'id, startTime, endTime, tier',
      kv: 'key, updatedAt, tier',
    });
  }
}

export const db = new AnduraDB();
```

### B. `src/react/storage/zustandDexieStorage.ts` (NEW)

```tsx
import { createJSONStorage, StateStorage } from 'zustand/middleware';
import { db } from './dexieAdapter';

const dexieStorage: StateStorage = {
  async getItem(name) {
    const rec = await db.kv.get(name);
    return rec?.value ?? null;
  },
  async setItem(name, value) {
    await db.kv.put({ key: name, value, updatedAt: Date.now(), tier: 0 });
  },
  async removeItem(name) {
    await db.kv.delete(name);
  },
};

export const createDexieStorage = () => createJSONStorage(() => dexieStorage);
```

### C. Migration helper `src/react/storage/migrateFromLocalStorage.ts` (NEW)

```tsx
import { db } from './dexieAdapter';

const LEGACY_KEYS = [
  'wv2-workout-store',
  'wv2-schedule-store',
  'wv2-nutrition-store',
  'wv2-progres-store',
  'wv2-sessions-history',
] as const;

export async function migrateFromLocalStorage(): Promise<void> {
  const MIGRATION_FLAG = 'wv2-migration-v1-done';
  if (localStorage.getItem(MIGRATION_FLAG) === 'true') return;
  try {
    for (const key of LEGACY_KEYS) {
      const value = localStorage.getItem(key);
      if (value != null) {
        await db.kv.put({ key, value, updatedAt: Date.now(), tier: 0 });
      }
    }
    localStorage.setItem(MIGRATION_FLAG, 'true');
    // Keep localStorage backup for 1 release cycle pentru safety
  } catch (e) {
    console.warn('[storage] migration failed:', e);
  }
}
```

Invoked în `App.tsx` root `useEffect` before stores hydrate.

### D. Store consumer updates (5 stores)

Replace `createJSONStorage(() => localStorage)` cu `createDexieStorage()`:
```tsx
// Before:
storage: createJSONStorage(() => localStorage),

// After:
storage: createDexieStorage(),
```

Files affected:
- `src/react/stores/workoutStore.ts`
- `src/react/stores/scheduleStore.ts`
- `src/react/stores/nutritionStore.ts`
- `src/react/stores/progresStore.ts`
- `src/react/stores/appStore.ts`

NOT migrated immediately (left as localStorage):
- `wv2-missing-equipment` (engine context absorbed via legacy `src/engine/coachContext.js` — must coordinate engine-side migration future)
- `wv2-calendar-override` (engine context same as above)

Engine-side `src/engine/*` localStorage reads preserved invariant Tier 0 rolling pattern (ADR 020 §1.4) — task_12 React-side only.

### E. Tier rotation cron helper `src/react/storage/tierRotation.ts` (NEW)

```tsx
const TIER_0_DAYS = 90;
const TIER_1_DAYS = 365;

export async function rotateTiers(): Promise<void> {
  const now = Date.now();
  const tier0Threshold = now - TIER_0_DAYS * 86400000;
  const tier1Threshold = now - TIER_1_DAYS * 86400000;

  // T0 → T1 migration
  await db.sessions.where('endTime').below(tier0Threshold).modify({ tier: 1 });
  // T1 → T2 compress migration (basic — placeholder for real compression Phase 6+)
  await db.sessions.where('endTime').below(tier1Threshold).modify({ tier: 2 });
}
```

Invoked on app startup (NU recurring cron — simple lazy check).

## §3 Acceptance criteria

- [ ] AnduraDB Dexie schema versioned (sessions + kv tables)
- [ ] dexieStorage adapter Zustand persist compatible
- [ ] Migration localStorage → Dexie auto-runs once (flag persisted)
- [ ] All 5 stores use createDexieStorage()
- [ ] Engine context `wv2-missing-equipment` + `wv2-calendar-override` NU migrated (coordinate engine-side future)
- [ ] Tier rotation T0→T1→T2 helper on startup
- [ ] localStorage backup kept 1 release cycle (defensive rollback safety)
- [ ] Tests +15-25 PASS (Dexie adapter + migration helper + tier rotation)
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/storage.dexieAdapter.test.ts
- Dexie schema v1 sessions + kv tables exist
- put/get/delete kv records
- tier filter query sessions

src/react/__tests__/storage.zustandDexieStorage.test.ts
- getItem async returns null when key absent
- setItem persists to Dexie + retrievable
- removeItem deletes record

src/react/__tests__/storage.migration.test.ts
- migrateFromLocalStorage copies localStorage keys to Dexie kv
- migration flag prevents re-run
- preserves localStorage for backup

src/react/__tests__/storage.tierRotation.test.ts
- sessions older than 90 days promoted T0 → T1
- sessions older than 365 days promoted T1 → T2
- sessions within 90 days stay T0
```

## §5 Commits (atomic 3)

```
feat(react/storage): Dexie IndexedDB schema v1 + Zustand storage adapter

AnduraDB Dexie schema (sessions + kv tables) versioned via Dexie.version(1).
createDexieStorage() Zustand persist compatible adapter — async getItem/
setItem/removeItem. ZERO localStorage destructive change — additive layer.

feat(react/storage): localStorage migration helper + tier rotation

migrateFromLocalStorage one-time auto-copy 5 legacy wv2-* keys → Dexie kv.
Migration flag wv2-migration-v1-done persists. localStorage retained 1
release cycle defensive rollback safety. Tier rotation helper T0 (90d) →
T1 (365d) → T2 archive ADR 005 §1.4.

refactor(react/stores): 5 stores consume createDexieStorage Zustand persist

workoutStore + scheduleStore + nutritionStore + progresStore + appStore
all use Dexie adapter persist. Engine context wv2-missing-equipment +
wv2-calendar-override preserved localStorage (engine-side coordination
future Phase 6+).
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_12_dexie_persistence_unified.md`:
- Schema versioned approach (v1 baseline)
- Migration strategy localStorage → Dexie (additive NU destructive)
- Tier rotation lazy startup invariant
- Engine context coordination defer note
