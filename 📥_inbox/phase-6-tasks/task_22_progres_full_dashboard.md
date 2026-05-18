# task_22 — Progres Full Dashboard

**Phase:** 6 (polish pre-Beta)
**Type:** Feature — Progres tab full dashboard mockup parity
**Deps:** task_21 LANDED
**Backup tag:** `pre-phase6-task-22-2026-05-18`
**Est commits:** 1-2 atomic (dashboard sections)
**Est tests delta:** +12-18

---

## §1 Scope

Mockup verbatim source `#screen-progres` (LOC range ~L1698+). Phase 5 task placeholder thin only — Phase 6 full dashboard wire:
- TDEE strip (kcal target adaptive Bayesian)
- Fatigue strip (Big 11 RO score)
- Heat map weekly volume per muscle group
- Charts 1RM Brzycki estimate progression Big 6 exercises
- Weight log entries (Phase 5 task_15 component exists, integrate dashboard)

## §2 Changes

### A. Mockup grep

```bash
grep -n "screen-progres" 04-architecture/mockups/andura-clasic.html
# Extract LOC range complete section
```

### B. NEW `src/react/components/TDEEStrip.tsx`

Consume `getNutritionTargetTodayReal()` async (task_04). Display:
- Target kcal big number
- Protein g secondary
- Source indicator subtle (engine-bn / manual / baseline)
- Trend arrow vs ieri (up/flat/down)

### C. NEW `src/react/components/FatigueStrip.tsx`

Consume `getFatigue()` (engineWrappers existing). Display:
- Fatigue score 0-100
- Icon + label (mockup verbatim 4 states PEAK_FORM / NORMAL / MODERATE / HIGH)
- Recommend pill subtle ("Antrenament normal" / "Reduce volum" / "Deload recomandat")

### D. NEW `src/react/components/HeatMapWeekly.tsx`

7-day grid × 11 muscle groups (Big 11 RO canonical). Cells colored by volume per (day, muscle):
- Empty cell = no volume
- Light green = 1-49% MEV
- Mid green = 50-100% MEV
- Dark green = >100% MEV (toward MAV)
- Red = >MAV (over-stress flag)

Data source: `useWorkoutStore.getState().sessionsHistory` last 7 days aggregate via `prHistoryAggregate` extending Phase 5 task_11.

### E. NEW `src/react/components/OneRMChart.tsx`

Recharts LineChart pentru Big 6 exercises (Bench / Squat / Deadlift / Press / Row / Pull) 1RM Brzycki estimate progression last 12 weeks.

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
```

Data: aggregate session logs Brzycki formula `kg * 36 / (37 - reps)`.

### F. `Progres.tsx` rewrite

```tsx
import { TDEEStrip } from '../components/TDEEStrip';
import { FatigueStrip } from '../components/FatigueStrip';
import { HeatMapWeekly } from '../components/HeatMapWeekly';
import { OneRMChart } from '../components/OneRMChart';

export default function Progres() {
  return (
    <div className="progres-tab">
      <TDEEStrip />
      <FatigueStrip />
      <HeatMapWeekly />
      <OneRMChart />
      <WeightLogList />
    </div>
  );
}
```

### G. Tests `src/react/__tests__/Progres.fullDashboard.test.tsx`

```js
- 4 dashboard sections render in order
- TDEEStrip consumes getNutritionTargetTodayReal async
- FatigueStrip consumes getFatigue
- HeatMapWeekly renders 7×11 grid
- OneRMChart renders Big 6 lines (mock recharts ResponsiveContainer 400×300)
- Empty state graceful (T0 fresh user no sessions)
- Loading skeleton initial paint
```

## §3 Acceptance criteria

- [ ] 4 NEW components (TDEEStrip + FatigueStrip + HeatMapWeekly + OneRMChart) LANDED
- [ ] `Progres.tsx` rewrite mockup parity 4 sections
- [ ] Recharts integration LineChart Big 6
- [ ] Empty state Maria 65 + Gigel fresh graceful
- [ ] Tests +12 minim PASS
- [ ] TS strict 0 errors + NO_DIACRITICS_RULE

## §4 Tests delta target +12-18

## §5 Commit

```
feat(react/progres): full dashboard TDEE + Fatigue + HeatMap + 1RM chart

NEW 4 dashboard sections mockup parity verbatim — TDEEStrip (Bayesian
target) + FatigueStrip (Big 11 RO) + HeatMapWeekly (7×11 grid volume %MEV)
+ OneRMChart (Big 6 Brzycki progression 12 weeks).

Empty state Maria 65 + Gigel fresh graceful (T0 placeholder pre-session
log). Recharts LineChart vendor chunk separated build.
```

## §6 Next

task_23 Istoric full timeline + PR Wall + drill-downs.
