# task_11 — PR Engine + Streak Counter Wire Istoric + Progres Real

**Phase:** 5 (engine pipeline real wire)
**Type:** Feature — F6 PR Wall + F8 Streak Counter integrate
**Deps:** task_03 (sessions breakdown persist) + task_06 (coachDirector aggregate)
**Backup tag:** `pre-phase5-task-11-2026-05-17`
**Est commits:** 2 atomic (PR Wall + Streak Counter)
**Est tests delta:** +12-18

---

## §1 Scope

F6 PR Wall + F8 Streak Counter declared KEEP verbatim în PRIMER §2 V1 audit. Phase 4 task_06 wires aggregate cu coachDirector output `prWall` + `streak` fields, BUT specific UI surfaces:
- **Antrenor tab** — PR Wall card recent top-3 PRs cu glow (mockup `andura-clasic.html` reference)
- **Istoric tab** — PR Wall dedicated screen all-PRs filterable
- **Antrenor tab** — Streak Counter top corner inline cu emoji + count
- **Progres tab** — Streak history chart (current + longest streak displayed)

Currently Istoric tab Phase 4 task_21 MVP = list + detail only. PR Wall standalone screen + Streak dedicated UI = task_11 scope.

## §2 Changes

### A. `src/react/components/PrWallCard.tsx` (NEW)

Antrenor tab Top-3 recent PRs visual card:
```tsx
export function PrWallCard({ prs }: { prs: CoachTodayOutput['prWall'] }): JSX.Element | null {
  if (!prs.length) return null;
  return (
    <div className="bg-paper border border-line rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-semibold text-ink">PR-uri recente</h3>
      </div>
      {prs.slice(0, 3).map((pr) => (
        <div key={`${pr.exerciseName}-${pr.date}`} className="flex justify-between text-sm py-1">
          <span className="text-ink truncate">{pr.exerciseName}</span>
          <span className="text-ink2 ml-2 whitespace-nowrap">{pr.kg}kg × {pr.reps}</span>
        </div>
      ))}
    </div>
  );
}
```

### B. `src/react/routes/screens/istoric/PrWall.tsx` (NEW)

Dedicated Istoric sub-screen all-PRs filterable per exercise:
```tsx
export function PrWall(): JSX.Element {
  const [filter, setFilter] = useState<string>('');
  const allPRs = useMemo(() => getAllPRsFromHistory(), []);
  const filtered = allPRs.filter((pr) =>
    pr.exerciseName.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <div className="p-4">
      <h2 className="text-base font-bold mb-3">Toate PR-urile</h2>
      <input
        type="text"
        placeholder="Cauta exercitiu"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full px-3 py-2 border border-line rounded-lg mb-3"
      />
      <div role="list">
        {filtered.map((pr, idx) => (
          <div key={idx} role="listitem" className="border-b border-line py-2 flex justify-between">
            <div>
              <div className="text-sm font-semibold">{pr.exerciseName}</div>
              <div className="text-xs text-ink2">{formatDate(pr.date)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-amber-700">{pr.kg}kg × {pr.reps}</div>
              <div className="text-xs text-ink2">{pr.type === 'weight' ? 'PR greutate' : pr.type === 'volume' ? 'PR volum' : 'PR repetari'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### C. `src/react/lib/engineWrappers.ts` (extend)

```tsx
export interface PRRecord {
  exerciseName: string;
  kg: number;
  reps: number;
  date: string;
  type: 'weight' | 'reps' | 'volume';
}

export function getAllPRsFromHistory(): PRRecord[] {
  try {
    const sessions = JSON.parse(localStorage.getItem('wv2-sessions-history') ?? '[]');
    const prs: PRRecord[] = [];
    for (const sess of sessions) {
      for (const ex of sess.exercises ?? []) {
        for (const set of ex.sets) {
          if (set.isPR) {
            prs.push({
              exerciseName: ex.exerciseName,
              kg: set.kg,
              reps: set.reps,
              date: new Date(set.timestamp).toISOString().slice(0, 10),
              type: detectPRType(set, ex), // weight/reps/volume
            });
          }
        }
      }
    }
    return prs.sort((a, b) => b.date.localeCompare(a.date));
  } catch (e) {
    console.warn('[engineWrappers] getAllPRsFromHistory failed:', e);
    return [];
  }
}
```

### D. `src/react/components/StreakBadge.tsx` (NEW)

```tsx
export function StreakBadge({ streak }: { streak: { current: number; longest: number } }): JSX.Element | null {
  if (!streak.current) return null;
  return (
    <div className="flex items-center gap-1 text-sm font-semibold text-amber-700" data-testid="streak-badge">
      <Flame className="w-4 h-4" />
      <span>{streak.current}</span>
    </div>
  );
}
```

Visible top-right Antrenor tab header.

### E. `src/react/routes/screens/antrenor/Antrenor.tsx` (integrate)

```tsx
<div className="flex items-center justify-between mb-3">
  <h1 className="text-xl font-bold">Astazi</h1>
  {coachToday?.streak && <StreakBadge streak={coachToday.streak} />}
</div>
{/* ...rest of Antrenor */}
<PrWallCard prs={coachToday?.prWall ?? []} />
```

### F. `src/react/routes/screens/progres/Progres.tsx` (extend)

Add Streak history card:
```tsx
{coachToday?.streak && (
  <div className="bg-paper border border-line rounded-xl p-4 mb-4">
    <div className="flex items-center gap-2 mb-2">
      <Flame className="w-5 h-5 text-amber-600" />
      <h3 className="text-sm font-semibold">Streak</h3>
    </div>
    <div className="flex justify-between text-sm">
      <span>Curent: <strong>{coachToday.streak.current}</strong> zile</span>
      <span>Record: <strong>{coachToday.streak.longest}</strong> zile</span>
    </div>
  </div>
)}
```

### G. `src/react/routes/router.tsx` + `navigation.ts` (extend)

Add `pr-wall` route nested under `istoric`:
```tsx
{
  path: 'pr-wall',
  element: <PrWall />,
}
```

GotoScreen union extend `pr-wall`. Istoric landing CTA "Toate PR-urile →".

## §3 Acceptance criteria

- [ ] PrWallCard renders top-3 recent PRs Antrenor tab
- [ ] PrWall dedicated screen filterable cu search input
- [ ] StreakBadge top-right Antrenor header
- [ ] Streak history card Progres tab
- [ ] PRs sorted by date desc
- [ ] PR type label rendered (greutate/volum/repetari)
- [ ] Empty states handled gracefully (zero PRs / zero streak)
- [ ] Tests +12-18 PASS
- [ ] TS strict 0 errors

## §4 Tests

```bash
src/react/__tests__/PrWallCard.test.tsx
- renders top-3 PRs ordered date desc
- handles empty PRs list (returns null)
- truncates long exercise names

src/react/__tests__/PrWall.test.tsx
- filter input narrows results case-insensitive
- empty filter shows all PRs
- PR type label rendered per record

src/react/__tests__/StreakBadge.test.tsx
- renders flame icon + count
- hides când streak.current = 0

src/react/__tests__/engineWrappers.getAllPRsFromHistory.test.tsx
- aggregates PRs across sessions
- preserves only sets cu isPR=true
- returns empty array când no history
```

## §5 Commits (atomic 2)

```
feat(react/components): PrWallCard + StreakBadge surface F6 + F8

Phase 5 task_11 — Antrenor tab integrates F6 PR Wall card top-3 recent +
F8 StreakBadge top-right header. Mockup parity preserved cumulative.

feat(react/screens): PrWall dedicated Istoric sub-screen + Progres streak

Istoric/pr-wall route filterable search input + PR type labels. Progres
tab Streak history card (current + longest). engineWrappers
getAllPRsFromHistory aggregates from wv2-sessions-history Tier 0.
```

## §6 Raport intermediat

`📤_outbox/_archive/2026-05/NN_TASK_11_pr_streak_engines_wire.md`:
- New components count
- New route pr-wall extending GotoScreen union
- Empty states UX handling
