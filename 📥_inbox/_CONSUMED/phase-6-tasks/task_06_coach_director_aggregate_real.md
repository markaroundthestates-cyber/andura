# task_06 — coachDirectorAggregate Real Wire (Option B Consumer)

**Phase:** 6 (engine pipeline real wire)
**Type:** Refactor — React-side enrich `getCoachToday` cu patterns + PR Wall + alerts
**Deps:** task_05 LANDED (getPatternsBanner + getProactiveAlerts exports)
**Backup tag:** `pre-phase6-task-06-2026-05-18`
**Est commits:** 1-2 atomic
**Est tests delta:** +10-14
**Authority:** Daniel CEO "quality over speed" 2026-05-18 → Option B Bugatti composer separat

---

## §1 Scope

`src/react/lib/coachDirectorAggregate.ts` Phase 5 task_06 = thin data bundle (readiness + fatigue + plannedWorkout + isRestDay). Phase 6 enrich 8 fields aggregate:
- 4 existing preserved: readiness + fatigue + plannedWorkout + isRestDay
- 4 NEW via task_05 composer: patternsBanner + prWallRecent + alerts + source

Plus 3 NEW UI components Antrenor home wire (PatternsBanner + PRWallRecent + AlertsBanner).

Plus dependency on task_02 (`getTodayWorkout` already async per D027 Option C — `getCoachToday` already needs async signature per task_02 §3.C.5).

---

## §2 Primary-source confirmed (NU re-grep — task_05 §2 establish)

- `getPatternsBanner()` → `PatternBanner[]` sync (task_05)
- `getPRHistoryAll()` → `PRRecord[]` sync (Phase 5 task_11 existing)
- `getProactiveAlerts(ctx)` → `ProactiveAlert[]` sync (task_05)
- `getTodayWorkout()` → `Promise<PlannedWorkoutOutput | null>` async (task_02 D027 Option C)

---

## §3 Changes

### A. `src/react/lib/coachDirectorAggregate.ts` (rewrite full)

```ts
// ══ COACH DIRECTOR AGGREGATE — Phase 6 Option B Composer Enrich ═══════════
// Per Daniel CEO "quality over speed" 2026-05-18 → Option B composer
// separat React-side pure-function engines (NU CoachDirector.buildSession
// heavyweight side-effects). 8 fields aggregate ready Antrenor home wire.

import type {
  ReadinessOutput,
  FatigueOutput,
  PlannedWorkoutOutput,
  PatternBanner,
  ProactiveAlert,
} from './engineWrappers';
import {
  getReadiness,
  getFatigue,
  getTodayWorkout,
  getPatternsBanner,
  getProactiveAlerts,
} from './engineWrappers';
import { getPRHistoryAll } from './prHistoryAggregate';
import type { PRRecord } from './prHistoryAggregate';

const PR_WALL_RECENT_LIMIT = 3; // top 3 most recent PRs per Antrenor home

export interface CoachTodayOutput {
  readiness: ReadinessOutput | null;
  fatigue: FatigueOutput | null;
  plannedWorkout: PlannedWorkoutOutput | null;
  isRestDay: boolean;
  patternsBanner: PatternBanner[];
  prWallRecent: PRRecord[];
  alerts: ProactiveAlert[];
  source: 'engine' | 'baseline';
}

/**
 * Phase 6 Option B enrich aggregate. Composes task_02 async planned workout
 * + task_05 sync composer outputs (patterns + alerts) + Phase 5 task_11
 * PR history slice top 3. Async signature ALIGNED cu task_02 (D027 Option
 * C requires getCoachToday async cascade).
 *
 * `source` field: 'engine' cand orice composer returns non-empty, 'baseline'
 * cand all empty (T0 fresh user).
 */
export async function getCoachToday(
  opts: { isInCut?: boolean } = {},
): Promise<CoachTodayOutput> {
  const readiness = getReadiness(opts);
  const fatigue = getFatigue();
  const plannedWorkout = await getTodayWorkout();
  const isRestDay = plannedWorkout === null;
  const patternsBanner = getPatternsBanner();
  const allPRs = getPRHistoryAll();
  const prWallRecent = allPRs
    .slice()
    .sort((a, b) => b.sessionTs - a.sessionTs)
    .slice(0, PR_WALL_RECENT_LIMIT);
  const alerts = getProactiveAlerts({});
  const hasEngineData =
    readiness !== null ||
    fatigue !== null ||
    plannedWorkout !== null ||
    patternsBanner.length > 0 ||
    prWallRecent.length > 0 ||
    alerts.length > 0;
  return {
    readiness,
    fatigue,
    plannedWorkout,
    isRestDay,
    patternsBanner,
    prWallRecent,
    alerts,
    source: hasEngineData ? 'engine' : 'baseline',
  };
}
```

### B. NEW 3 components Antrenor home

**B.1 `src/react/components/Antrenor/PatternsBanner.tsx`**

```tsx
import type { JSX } from 'react';
import type { PatternBanner } from '../../lib/engineWrappers';
import { AlertCircle, Info } from 'lucide-react';

interface PatternsBannerProps {
  banners: PatternBanner[];
}

export function PatternsBanner({ banners }: PatternsBannerProps): JSX.Element | null {
  if (banners.length === 0) return null;
  return (
    <div data-testid="patterns-banner" className="flex flex-col gap-2 mb-4">
      {banners.map((b) => (
        <div
          key={b.id}
          data-pattern-id={b.id}
          data-severity={b.severity}
          role="status"
          className={`flex items-start gap-2.5 p-3 rounded-xl border ${
            b.severity === 'warn'
              ? 'bg-[#fdf3df] border-[#e8d59a]'
              : 'bg-paper2 border-line'
          }`}
        >
          {b.severity === 'warn' ? (
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-ink" aria-hidden="true" />
          ) : (
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-ink2" aria-hidden="true" />
          )}
          <p className="text-sm text-ink leading-snug">{b.text}</p>
        </div>
      ))}
    </div>
  );
}
```

**B.2 `src/react/components/Antrenor/PRWallRecent.tsx`**

```tsx
import type { JSX } from 'react';
import type { PRRecord } from '../../lib/prHistoryAggregate';
import { Trophy } from 'lucide-react';

interface PRWallRecentProps {
  records: PRRecord[];
}

export function PRWallRecent({ records }: PRWallRecentProps): JSX.Element | null {
  if (records.length === 0) return null;
  return (
    <section data-testid="pr-wall-recent" className="mb-4">
      <h2 className="text-base font-semibold text-ink mb-2 flex items-center gap-2">
        <Trophy className="w-4 h-4" aria-hidden="true" />
        Recorduri recente
      </h2>
      <ul className="flex flex-col gap-2">
        {records.map((pr, idx) => (
          <li
            key={`${pr.exerciseId}-${pr.sessionTs}-${idx}`}
            data-testid={`pr-record-${idx}`}
            className="flex justify-between items-center p-3 rounded-xl bg-paper2 border border-line"
          >
            <span className="text-sm font-medium text-ink">{pr.exerciseName}</span>
            <span className="text-sm text-ink2">
              {pr.kg} kg x {pr.reps} (~{pr.oneRMEstimate} kg 1RM)
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

**B.3 `src/react/components/Antrenor/AlertsBanner.tsx`**

```tsx
import type { JSX } from 'react';
import type { ProactiveAlert } from '../../lib/engineWrappers';
import { AlertTriangle, Info } from 'lucide-react';

interface AlertsBannerProps {
  alerts: ProactiveAlert[];
}

export function AlertsBanner({ alerts }: AlertsBannerProps): JSX.Element | null {
  if (alerts.length === 0) return null;
  // Severity ordering: urgent > warn > info (already engine-sorted, preserve)
  return (
    <div data-testid="alerts-banner" className="flex flex-col gap-2 mb-4">
      {alerts.map((a) => (
        <div
          key={a.id}
          data-severity={a.severity}
          role={a.severity === 'urgent' ? 'alert' : 'status'}
          className={`flex items-start gap-2.5 p-3 rounded-xl border ${
            a.severity === 'urgent'
              ? 'bg-[#fbe3df] border-[#e8b2a8]'
              : a.severity === 'warn'
              ? 'bg-[#fdf3df] border-[#e8d59a]'
              : 'bg-paper2 border-line'
          }`}
        >
          {a.severity === 'urgent' || a.severity === 'warn' ? (
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-ink" aria-hidden="true" />
          ) : (
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-ink2" aria-hidden="true" />
          )}
          <p className="text-sm text-ink leading-snug">{a.text}</p>
        </div>
      ))}
    </div>
  );
}
```

### C. `src/react/routes/screens/antrenor/Antrenor.tsx` consume async

```tsx
import { useEffect, useState } from 'react';
import { getCoachToday } from '../../../lib/coachDirectorAggregate';
import type { CoachTodayOutput } from '../../../lib/coachDirectorAggregate';
import { PatternsBanner } from '../../../components/Antrenor/PatternsBanner';
import { PRWallRecent } from '../../../components/Antrenor/PRWallRecent';
import { AlertsBanner } from '../../../components/Antrenor/AlertsBanner';

export function Antrenor(): JSX.Element {
  // ... existing store subscriptions
  const [coach, setCoach] = useState<CoachTodayOutput | null>(null);
  useEffect(() => {
    let cancelled = false;
    getCoachToday().then((c) => { if (!cancelled) setCoach(c); });
    return () => { cancelled = true; };
  }, []);

  // Existing readiness/fatigue: replace direct getReadiness/getFatigue calls
  // cu `coach?.readiness` + `coach?.fatigue` (single source aggregate).
  const readiness = coach?.readiness ?? null;
  const fatigue = coach?.fatigue ?? null;

  // ... existing layout cards
  return (
    <section ...>
      <h1>Antrenor</h1>
      {pausedSnapshot && <ResumeSessionCard ... />}
      {showReactivate && <ReactivateCard ... />}
      <PatternsBanner banners={coach?.patternsBanner ?? []} />
      <AlertsBanner alerts={coach?.alerts ?? []} />
      {/* existing CoachTodayCard / CoachRestCard / StatsGrid / ReadinessVerdict ... */}
      <PRWallRecent records={coach?.prWallRecent ?? []} />
      {/* existing PRNotificationBanner / Calendar7Day / start CTA */}
    </section>
  );
}
```

NOTĂ: Antrenor.tsx existing direct calls `getReadiness()` + `getFatigue()` line 30-31 — replace cu coach aggregate consume single source. Cleanup pe drum.

### D. Tests `src/react/__tests__/lib/coachDirectorAggregate.realwire.test.ts`

```ts
- getCoachToday returns 8 fields shape complete
- readiness propagates din getReadiness wrapper
- fatigue propagates din getFatigue wrapper
- plannedWorkout async awaits getTodayWorkout
- isRestDay=true cand plannedWorkout=null
- patternsBanner propagates din getPatternsBanner
- prWallRecent slice top 3 sorted desc by sessionTs
- prWallRecent empty cand getPRHistoryAll returns []
- alerts propagates din getProactiveAlerts
- source='engine' cand orice composer non-empty
- source='baseline' cand all composers empty (T0 fresh)
- async signature await all consumers
```

### E. Tests `src/react/__tests__/components/Antrenor/PatternsBanner.test.tsx` + `PRWallRecent.test.tsx` + `AlertsBanner.test.tsx`

Smoke tests fiecare component:
- Empty array → returns null (NU render container)
- Non-empty → renders all items
- data-severity / data-pattern-id attributes correct
- Icon variant per severity
- RO wording NO_DIACRITICS_RULE

---

## §4 Acceptance criteria

- [ ] `getCoachToday()` async signature 8-field output LANDED
- [ ] 3 NEW components LANDED (PatternsBanner + PRWallRecent + AlertsBanner)
- [ ] Antrenor.tsx consume aggregate pattern useEffect loading
- [ ] Existing `getReadiness` + `getFatigue` direct calls în Antrenor.tsx replaced cu coach aggregate (single source)
- [ ] Tests +10 minim PASS (4 aggregate + 3×2 components = 10+)
- [ ] TS strict 0 errors
- [ ] NO_DIACRITICS_RULE wording compliance
- [ ] ZERO `CoachDirector.buildSession` invocation din React aggregator

---

## §5 Commit message (split 2 atomic commits possible per ORCHESTRATOR §2)

**Commit 1:** `refactor(react/lib): coachDirectorAggregate Option B enrich 8-field aggregate`
- coachDirectorAggregate.ts rewrite §3.A
- Tests realwire.test.ts §3.D

**Commit 2:** `feat(react/components): Antrenor PatternsBanner + PRWallRecent + AlertsBanner`
- 3 NEW components §3.B
- Antrenor.tsx consume async §3.C
- 3 component test files §3.E

```
refactor(react/lib): coachDirectorAggregate Option B enrich 8-field aggregate

Per Daniel CEO "quality over speed" 2026-05-18 directive Option B Bugatti.
Phase 5 task_06 thin 4-field bundle (readiness + fatigue + plannedWorkout +
isRestDay) enriched cu 4 NEW fields composer pure-function engines:
- patternsBanner via getPatternsBanner (STAGNATION + LOW_ADHERENCE V1 LOCK)
- prWallRecent slice top 3 sorted desc din getPRHistoryAll Phase 5 task_11
- alerts via getProactiveAlerts wraps runProactiveChecks severity 3-tier
- source field 'engine'|'baseline' aggregate flag

Async signature aligned cu task_02 D027 Option C cascade. ZERO
CoachDirector.buildSession invocation (side-effects pollution prevented).

Unlocks Antrenor home 3 NEW UI components commit 2.
```

---

## §6 Next

task_07 aaFriction Vitality/Adherence signals wire (cu store fields halucinare quick fix per next-rewrite parallel).
