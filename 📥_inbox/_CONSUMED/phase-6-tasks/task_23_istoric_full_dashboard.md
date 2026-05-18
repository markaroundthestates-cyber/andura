# task_23 — Istoric Full Timeline + PR Wall + Drill-Downs

**Phase:** 6 (polish pre-Beta)
**Type:** Feature — Istoric tab full timeline + PR Wall drill-downs
**Deps:** task_22 LANDED
**Backup tag:** `pre-phase6-task-23-2026-05-18`
**Est commits:** 1-2 atomic
**Est tests delta:** +10-15

---

## §1 Scope

Mockup verbatim source `#screen-istoric` (LOC range ~L1155+). Phase 3 task `Istoric.tsx` thin placeholder cu sessions list. Phase 6 full timeline + PR Wall + per-session drill-down detail.

Phase 5 task_03 sessionsHistory exercises breakdown LANDED — leverage breakdown rich render.

## §2 Changes

### A. Mockup grep

```bash
grep -n "screen-istoric" 04-architecture/mockups/andura-clasic.html
grep -n "pr-wall\|PR Wall" 04-architecture/mockups/andura-clasic.html | head -10
```

### B. NEW `src/react/components/IstoricTimeline.tsx`

Vertical timeline cu sessions group per week:
- Week header "Saptamana X (date range)"
- Session card per session: workout title + duration + total volume + RPE average + PR flag if any
- Tap session card → navigate `/istoric/session/:sessionId` (drill-down IstoricDetail Phase 5 task_03 component)

Empty state Maria 65 fresh: "Nu ai antrenamente inca. Prima sesiune apare aici dupa ce o termini."

### C. NEW `src/react/components/PRWallFull.tsx`

Full PR Wall (vs PRWallRecent task_06 = top 3). Display:
- Tabs/filter: All / Weight / Reps / Volume
- Sorted descending by date
- PR entry row: exercise + type badge + kg/reps/volume + deltaKg vs prev + 1RM Brzycki estimate
- Search filter exercise name

Data source `prHistoryAggregate` Phase 5 task_11.

### D. NEW `src/react/components/IstoricFilters.tsx`

Filter bar:
- Date range picker (last 7d / 30d / 90d / all)
- Muscle group multi-select (Big 11 RO)
- Workout type filter (Push / Pull / Legs / Full / Custom)
- Reset filters

### E. `Istoric.tsx` rewrite

```tsx
import { IstoricFilters } from '../components/IstoricFilters';
import { PRWallFull } from '../components/PRWallFull';
import { IstoricTimeline } from '../components/IstoricTimeline';

export default function Istoric() {
  return (
    <div className="istoric-tab">
      <IstoricFilters />
      <PRWallFull />
      <IstoricTimeline />
    </div>
  );
}
```

### F. Tests `src/react/__tests__/Istoric.fullTimeline.test.tsx`

```js
- 3 sections render in order (Filters + PRWall + Timeline)
- timeline groups sessions per week
- session card tap navigates /istoric/session/:sessionId
- PRWall tabs filter type (all/weight/reps/volume)
- IstoricFilters date range + muscle group + workout type
- empty state graceful T0 fresh
- search filter exercise name
- ZERO regression IstoricDetail drill-down Phase 5 task_03
```

## §3 Acceptance criteria

- [ ] 3 NEW components (IstoricTimeline + PRWallFull + IstoricFilters) LANDED
- [ ] `Istoric.tsx` rewrite mockup parity 3 sections
- [ ] Timeline week grouping
- [ ] PR Wall full cu tabs filter
- [ ] Drill-down `/istoric/session/:sessionId` preserved Phase 5 task_03
- [ ] Tests +10 minim PASS
- [ ] TS strict 0 errors + NO_DIACRITICS_RULE

## §4 Tests delta target +10-15

## §5 Commit

```
feat(react/istoric): full timeline + PR Wall + filters + drill-downs

NEW 3 components Istoric mockup parity verbatim — IstoricTimeline (sessions
grouped per week) + PRWallFull (tabs filter weight/reps/volume + search) +
IstoricFilters (date range + muscle group + workout type).

Drill-down session detail Phase 5 task_03 IstoricDetail preserved. Empty
state Maria 65 fresh graceful. Search filter exercise name realtime.
```

## §6 Next

task_24 DECISIONS.md D026 STRATEGY closure + milestone tag push origin.
