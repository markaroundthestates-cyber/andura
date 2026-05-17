# TASK 09 — Post-RPE + Post-Summary (Session Closure Flow)

**Model:** Opus EXCLUSIVELY
**Phase:** C (paralel cu task_04 task_05 task_06 task_07 task_08)
**Depends on:** task_01 + task_02 + task_03 LANDED
**Estimated touched files:** 2 rewrite stubs → real components
**Estimated new tests:** +20-30

---

## §0 Bugatti checklist pre-flight

- [ ] task_01 + task_02 + task_03 LANDED
- [ ] Branch HEAD verde
- [ ] Backup tag `pre-phase3-task-09-2026-05-16` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `DECISIONS.md` §D-LEGACY-027 (Engine Energy Adjustment) §D-LEGACY-029 (Specialization Engine) §D-LEGACY-052 (Andura Suflet brand)
3. `04-architecture/mockups/andura-clasic.html` grep:
   - `submitPostRpeV2(level)` function definition
   - `id="post-summary"` screen + summary stats grid
   - `summary-sets` + `summary-volume` + `summary-duration` + `summary-kcal` cells
   - `summary-pr-banner` (F11 PR notification) conditional pe wv2.prHit
   - `summary-streak` F8 counter increment
   - `summary-coach-line` (coachPick endSession by rating)

---

## §2 Spec exact

### A) `PostRpe.tsx` rewrite stub → real

Post-set RPE rating 3-button RO (la finalul ultimului exercițiu, before summary):
- Usoara → lastRating='usoara'
- Normala → lastRating='normala'
- Grea → lastRating='grea'

Pe submit:
1. `workoutStore.setLastRating(rating)`
2. Compute session summary (sets done, total volume, duration min, kcal estimate)
3. `workoutStore.finishSession(summary)` + increment streak
4. Navigate `gotoPath('post-summary')`

```tsx
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { gotoPath } from '../../../lib/navigation';

type SessionRating = 'usoara' | 'normala' | 'grea';

const RATING_OPTIONS: Array<{ rating: SessionRating; label: string; description: string }> = [
  { rating: 'usoara', label: 'Usoara', description: 'Aveam mai mult in rezerva' },
  { rating: 'normala', label: 'Normala', description: 'Solid, echilibrat' },
  { rating: 'grea', label: 'Grea', description: 'M-am dus la limita' },
];

export function PostRpe(): JSX.Element {
  const navigate = useNavigate();
  const { history, sessionStart, setLastRating, finishSession, incrementStreak } = useWorkoutStore();

  function handleSubmit(rating: SessionRating) {
    setLastRating(rating);

    // Compute summary
    const setsDone = Object.values(history).reduce((a, arr) => a + arr.length, 0);
    let volume = 0;
    Object.values(history).forEach((arr) => arr.forEach((h) => { volume += h.kg * h.reps; }));
    const dur = sessionStart ? Math.max(1, Math.floor((Date.now() - sessionStart) / 60000)) : 0;
    const title = 'Push (piept si umeri)'; // Phase 4+ derive din engineWrappers
    const meta = `${setsDone} seturi · ${dur} min · ${volume.toLocaleString('ro-RO').replace(/,/g, ' ')} kg`;

    finishSession({ title, meta, ts: Date.now() });
    incrementStreak();

    navigate(gotoPath('post-summary'));
  }

  return (
    <section className="p-6 paper-bg">
      <h1 className="display-text font-semibold text-ink mb-2">Cum a fost sesiunea?</h1>
      <p className="body-text text-ink2 mb-6">Coach calibreaza pentru data viitoare.</p>
      <div className="flex flex-col gap-3">
        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.rating}
            onClick={() => handleSubmit(opt.rating)}
            className="flex flex-col items-start gap-1 p-4 rounded-xl border border-line-strong bg-paper2 hover:bg-paper transition text-left"
          >
            <span className="body-text font-medium text-ink">{opt.label}</span>
            <span className="small-text text-ink3">{opt.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
```

### B) `PostSummary.tsx` rewrite stub → real

Summary screen cu stats grid (sets / volume / duration / kcal) + F11 PR banner conditional + F8 streak counter + coach felicitare line (coachPick endSession by rating) + Finish button.

```tsx
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { gotoPath } from '../../../lib/navigation';
import { coachPick } from '../../../lib/coachVoice';

export function PostSummary(): JSX.Element {
  const navigate = useNavigate();
  const { lastSession, lastRating, streak, prHit, reset } = useWorkoutStore();

  // Parse last session meta back (sets · min · kg)
  // Phase 3 simple — Phase 4 store separate numeric fields în lastSession structure
  const setsMatch = lastSession?.meta.match(/(\d+) seturi/);
  const durMatch = lastSession?.meta.match(/(\d+) min/);
  const volMatch = lastSession?.meta.match(/([\d\s]+) kg$/);
  const sets = setsMatch ? Number(setsMatch[1]) : 0;
  const dur = durMatch ? Number(durMatch[1]) : 0;
  const volume = volMatch ? Number(volMatch[1].replace(/\s/g, '')) : 0;
  const kcal = Math.round(volume * 0.03);

  const coachLine = lastRating ? coachPick('endSession', lastRating, 0) : '';

  function handleFinish() {
    reset();
    navigate(gotoPath('antrenor'));
  }

  return (
    <section className="p-6 paper-bg min-h-screen flex flex-col">
      <h1 className="display-text font-semibold text-ink mb-2">{lastSession?.title}</h1>
      <p className="coach-quote body-text text-ink2 italic mb-6">„{coachLine}"</p>

      {/* F11 PR banner conditional */}
      {prHit && (
        <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-succ/10 border border-succ">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="body-text font-semibold text-succ">PR nou!</p>
            <p className="small-text text-ink2">Cel mai bun set la {lastSession?.title}</p>
          </div>
        </div>
      )}

      {/* Stats grid 4-cell */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCell label="Seturi" value={sets.toString()} />
        <StatCell label="Durata" value={`${dur} min`} />
        <StatCell label="Tonaj" value={`${volume.toLocaleString('ro-RO').replace(/,/g, ' ')} kg`} />
        <StatCell label="Kcal" value={kcal.toString()} />
      </div>

      {/* F8 Streak counter */}
      <div className="p-4 mb-6 rounded-xl bg-paper2 border border-line text-center">
        <p className="small-text text-ink3 mb-1">Streak</p>
        <p className="display-text font-bold text-brick">{streak} {streak === 1 ? 'sesiune' : 'sesiuni'}</p>
      </div>

      <button
        onClick={handleFinish}
        className="mt-auto w-full py-4 bg-brick text-white rounded-xl body-text font-semibold"
      >
        Terminat
      </button>
    </section>
  );
}

function StatCell({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="p-4 rounded-xl bg-paper2 border border-line">
      <p className="small-text text-ink3 mb-1">{label}</p>
      <p className="body-text font-semibold text-ink">{value}</p>
    </div>
  );
}
```

---

## §3 Implementation hints

- Phase 3 demo data: `lastSession.title` hardcoded "Push (piept si umeri)". Phase 4+ derive din `engineWrappers.getTodayWorkout`.
- PR detection (F11): Phase 3 uses `workoutStore.prHit` flag (default false, manually toggled în Phase 4 via engineWrappers.getPRDeltas pe submit).
- F8 streak: increment în `PostRpe.handleSubmit` (NU în PostSummary — avoid double-increment dacă user navigates back).
- coachPick: import from `coachVoice.ts` task_03. Phase 3 seed=0 deterministic (real prod uses Math.random).
- Romanian no-diacritics rule preserved.
- ZERO motivational language hardcoded (anti-paternalism). Doar coach copy from coachPick.

---

## §4 Tests vitest + RTL (MemoryRouter per D020)

### A) `PostRpe.test.tsx`

```typescript
describe('PostRpe screen', () => {
  beforeEach(() => {
    useWorkoutStore.setState({
      history: { 0: [{ kg: 22.5, reps: 10, rating: 'potrivit' }, { kg: 22.5, reps: 10, rating: 'potrivit' }] },
      sessionStart: Date.now() - 30 * 60000,
    });
  });

  it('renders 3 rating options (Usoara/Normala/Grea)', () => { /* ... */ });
  it('Usoara click → setLastRating + finishSession + incrementStreak + navigate post-summary', () => { /* ... */ });
  it('Normala click → setLastRating=normala', () => { /* ... */ });
  it('Grea click → setLastRating=grea', () => { /* ... */ });
  it('Computes summary correctly (sets, volume, duration)', () => { /* ... */ });
  // ... 6-8 tests
});
```

### B) `PostSummary.test.tsx`

```typescript
describe('PostSummary screen', () => {
  beforeEach(() => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push (piept si umeri)', meta: '5 seturi · 52 min · 12 450 kg', ts: Date.now() },
      lastRating: 'normala',
      streak: 12,
      prHit: false,
    });
  });

  it('renders title from lastSession', () => { /* ... */ });
  it('renders stats grid (5 seturi, 52 min, 12 450 kg, kcal)', () => { /* ... */ });
  it('renders streak 12 sesiuni', () => { /* ... */ });
  it('renders coach line from coachPick endSession.normala', () => { /* ... */ });
  it('PR banner HIDDEN cand prHit=false', () => { /* ... */ });
  it('PR banner VISIBLE cand prHit=true', () => {
    useWorkoutStore.setState({ prHit: true });
    /* ... */
  });
  it('Terminat button resets store + navigates antrenor', () => { /* ... */ });
  // ... 8-12 tests
});
```

---

## §5 Acceptance criteria

- [ ] PostRpe + PostSummary real components (NU stubs)
- [ ] Submit RPE → finishSession + incrementStreak + navigate post-summary
- [ ] PostSummary renders stats grid + streak counter + coach felicitare + Terminat button
- [ ] F11 PR banner conditional pe prHit
- [ ] F8 streak counter visible
- [ ] Terminat resets store + navigates antrenor (full session closure)
- [ ] Romanian no-diacritics rule preserved
- [ ] vitest count: +20-30 new tests

---

## §6 Commit strategy

2 commits atomic:
1. `feat(react/antrenor): PostRpe 3-button RPE rating + submitPostRpeV2 finishSession + streak`
2. `feat(react/antrenor): PostSummary stats grid + PR banner + streak + coach felicitare`

---

## §7 Backup tag

```bash
git tag pre-phase3-task-09-2026-05-16
git push origin pre-phase3-task-09-2026-05-16
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope.

Phase 3 CLOSURE post task_09 LANDED:
- Backup tag final: `phase-3-antrenor-landed-2026-05-16`
- Milestone tag: `phase-3-antrenor-landed-2026-05-16`
- `DECISIONS.md` D021 append Phase 3 LANDED
- `📤_outbox/LATEST.md` final summary Phase 3 complete

---

🦫 **task_09 PostRpe + PostSummary. Phase C paralel. Session closure flow complete. F8 streak + F11 PR banner. Phase 3 capstone task.**
