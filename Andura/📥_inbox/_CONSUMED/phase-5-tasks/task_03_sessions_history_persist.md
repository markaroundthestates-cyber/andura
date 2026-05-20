# task_03 — sessionsHistory Persist Real + IstoricDetail Per-Exercise Breakdown

**Phase:** 5 (cap-coadă)
**Type:** Feature — completare Phase 4 task_21 gap
**Deps:** task_02 wording (RO labels exercise breakdown)
**Backup tag:** `pre-phase5-task-03-2026-05-17`
**Est commits:** 2 atomic (store schema extend + IstoricDetail render breakdown)
**Est tests delta:** +8-12

---

## §1 Scope

Phase 4 task_21 Istoric Tab MVP scope LANDED list + detail views, BUT IstoricDetail per-exercise breakdown = Phase 6+ deferred din cauza `workoutStore.history` cleared on `finishSession()` (only aggregate `LastSessionSummary` saved la `sessionsHistory`). Per LATEST §4 task_21 architecture flag.

Task: extend `sessionsHistory` schema cu per-exercise sets breakdown + IstoricDetail render granular (exercise list cu set-by-set kg×reps + RPE + volume + 1RM peak).

## §2 Changes

### A. `src/react/stores/workoutStore.ts` (schema extend)

Interface `SessionHistoryEntry` extend:
```tsx
export interface SessionExerciseBreakdown {
  exerciseId: string;
  exerciseName: string;
  sets: Array<{
    kg: number;
    reps: number;
    rpe?: number;
    timestamp: number;
    isPR?: boolean;
  }>;
  totalVolume: number; // sum(kg*reps)
  peakOneRM: number; // max Epley estimate across sets
}

export interface SessionHistoryEntry {
  sessionId: string;
  startTime: number;
  endTime: number;
  durationMin: number;
  rating?: 'USOARA' | 'NORMALA' | 'GREA';
  totalVolume: number;
  prCount: number;
  // NEW Phase 5 task_03
  exercises: SessionExerciseBreakdown[];
}
```

`finishSession()` action — populate `exercises` din `state.history` ÎNAINTE clear:
```tsx
finishSession: () => set((s) => {
  const exerciseMap = new Map<string, SessionExerciseBreakdown>();
  for (const entry of s.history) {
    if (!exerciseMap.has(entry.exerciseId)) {
      exerciseMap.set(entry.exerciseId, {
        exerciseId: entry.exerciseId,
        exerciseName: entry.exerciseName,
        sets: [],
        totalVolume: 0,
        peakOneRM: 0,
      });
    }
    const bd = exerciseMap.get(entry.exerciseId)!;
    bd.sets.push({
      kg: entry.kg,
      reps: entry.reps,
      rpe: entry.rpe,
      timestamp: entry.timestamp,
      isPR: entry.isPR,
    });
    bd.totalVolume += entry.kg * entry.reps;
    const oneRM = entry.kg * (1 + entry.reps / 30);
    if (oneRM > bd.peakOneRM) bd.peakOneRM = Math.round(oneRM * 10) / 10;
  }

  const sessionEntry: SessionHistoryEntry = {
    sessionId: s.sessionId,
    startTime: s.startTime,
    endTime: Date.now(),
    durationMin: Math.round((Date.now() - s.startTime) / 60000),
    rating: s.rating,
    totalVolume: Array.from(exerciseMap.values()).reduce((sum, e) => sum + e.totalVolume, 0),
    prCount: s.history.filter((e) => e.isPR).length,
    exercises: Array.from(exerciseMap.values()),
  };

  return {
    sessionsHistory: [sessionEntry, ...s.sessionsHistory].slice(0, 100),
    // existing clear
    history: [],
    sessionId: '',
    startTime: 0,
    rating: undefined,
  };
}),
```

### B. `src/react/routes/screens/istoric/IstoricDetail.tsx` (render breakdown)

Replace placeholder "Phase 6+ deferred" cu real render:
```tsx
{session.exercises.map((ex) => (
  <div key={ex.exerciseId} className="bg-paper border border-line rounded-xl p-4 mb-3">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-ink">{ex.exerciseName}</h3>
      <span className="text-xs text-ink2">
        1RM est: {ex.peakOneRM}kg
      </span>
    </div>
    <div className="text-xs text-ink2 mb-2">
      Volum: {ex.totalVolume}kg · {ex.sets.length} seturi
    </div>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-ink2 border-b border-line">
          <th className="text-left py-1">Set</th>
          <th className="text-left py-1">Kg</th>
          <th className="text-left py-1">Rep</th>
          <th className="text-left py-1">RPE</th>
        </tr>
      </thead>
      <tbody>
        {ex.sets.map((set, idx) => (
          <tr key={idx} className={set.isPR ? 'text-green-700' : 'text-ink'}>
            <td className="py-1">{idx + 1}{set.isPR ? ' 🏆' : ''}</td>
            <td>{set.kg}</td>
            <td>{set.reps}</td>
            <td>{set.rpe ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
))}
```

NO_DIACRITICS_RULE strict — Volum/Set/Repetari/Seturi/Set ok (RO standard fără diacritice).

## §3 Acceptance criteria

- [ ] `SessionHistoryEntry.exercises` populated pe finishSession
- [ ] IstoricDetail render exercises table cu sets breakdown
- [ ] PR highlight visual (🏆 emoji marker)
- [ ] 1RM peak per exercise displayed
- [ ] Total volume calculated correct (sum kg×reps cross-sets)
- [ ] Backward compat — existing `sessionsHistory` entries fără `exercises` field render gracefully (defensive `?? []`)
- [ ] Vitest +8-12 PASS (store extend + IstoricDetail render breakdown)
- [ ] TS strict 0 errors

## §4 Tests

NEW tests:
```tsx
// workoutStore.test.ts
it('finishSession persists exercises breakdown from history', () => {});
it('exercises totalVolume = sum(kg * reps) across sets', () => {});
it('peakOneRM uses Epley max across sets', () => {});

// IstoricDetail.test.tsx
it('renders exercises table when session has exercises', () => {});
it('handles backward compat session without exercises field', () => {});
it('marks PR sets visually', () => {});
it('shows 1RM peak per exercise', () => {});
```

## §5 Commits (atomic 2)

```
feat(react/store): workoutStore SessionHistoryEntry exercises breakdown persist
feat(react/istoric): IstoricDetail per-exercise breakdown render table

Phase 5 task_03 — closes Phase 4 task_21 deferred Phase 6+ architecture
flag. sessionsHistory schema extended cu exercises array per session
(SessionExerciseBreakdown: exerciseName + sets array + totalVolume +
peakOneRM Epley). IstoricDetail renders exercises table with sets
breakdown, PR highlight 🏆, 1RM peak, total volume per exercise.

Backward compat: existing entries fără exercises field handled gracefully.
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_03_sessions_history_persist.md`:
- Store schema diff (interface extension)
- IstoricDetail render diff (placeholder → real breakdown)
- Tests delta + breakdown
- Backward compat note
