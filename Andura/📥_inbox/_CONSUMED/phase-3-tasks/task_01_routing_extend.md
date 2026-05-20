# TASK 01 — Routing Extend (GotoScreen Union + Router Sub-Routes)

**Model:** Opus EXCLUSIVELY
**Phase:** A (solo, blocks Phase B+C)
**Depends on:** none
**Estimated touched files:** 2 (navigation.ts + router.tsx)
**Estimated new tests:** +15-25

---

## §0 Bugatti checklist pre-flight

- [ ] Branch `feature/v3-react-clasic` HEAD verde (vitest 3769 PASS baseline)
- [ ] `git status` clean (no staged/unstaged)
- [ ] Backup tag `pre-phase3-task-01-2026-05-16` push origin
- [ ] `git log --oneline -5` confirm @ `48b0b37` CLAUDE.md gut sau later

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8 (singular briefing)
2. `DECISIONS.md` head 50 + §D015 §D016 §D018 §D020 detail
3. `07-meta/karpathy-skills-ref/CLAUDE.md` §1-§4
4. `src/react/lib/navigation.ts` current state (Phase 2 LANDED)
5. `src/react/routes/router.tsx` current state
6. `04-architecture/mockups/andura-clasic.html` grep pentru toate `goto('<name>')` calls — lista completă screen names

---

## §2 Spec exact

### A) Extend `GotoScreen` union în `src/react/lib/navigation.ts`

Add sub-screens Phase 3 Antrenor scope la union type existent:

```typescript
export type GotoScreen =
  // Top-level (existing Phase 2)
  | 'splash' | 'auth' | 'auth-reactivate'
  | 'onb-1' | 'onb-2' | 'onb-3' | 'onb-4' | 'onb-5' | 'onb-6' | 'onb-7'
  // Tab roots (existing Phase 2)
  | 'antrenor' | 'progres' | 'istoric' | 'cont'
  // NEW Phase 3 Antrenor sub-screens
  | 'energy-check' | 'energy-cause'
  | 'workout-preview' | 'workout'
  | 'ceva-nu-merge' | 'pain-button'
  | 'equipment-swap' | 'aparate-lipsa'
  | 'schedule-override'
  | 'post-rpe' | 'post-summary';
```

### B) Extend `gotoPath()` cu mapping nested per-tab

Toate sub-screens Antrenor → `/app/antrenor/<sub-screen>`:
- `energy-check` → `/app/antrenor/energy-check`
- `energy-cause` → `/app/antrenor/energy-cause`
- `workout-preview` → `/app/antrenor/workout-preview`
- `workout` → `/app/antrenor/workout`
- `ceva-nu-merge` → `/app/antrenor/ceva-nu-merge`
- `pain-button` → `/app/antrenor/pain-button`
- `equipment-swap` → `/app/antrenor/equipment-swap`
- `aparate-lipsa` → `/app/antrenor/aparate-lipsa`
- `schedule-override` → `/app/antrenor/schedule-override`
- `post-rpe` → `/app/antrenor/post-rpe`
- `post-summary` → `/app/antrenor/post-summary`

Preserve TS exhaustive `_exhaustive: never` fallback.

### C) Extend `router.tsx` sub-routes nested

Add la `/app/antrenor` parent route children pentru toate sub-screens. Folosește placeholder components stub (creat în acest task) — task_04+05+06+07+08+09 vor înlocui cu real components.

```typescript
{
  path: 'antrenor',
  children: [
    { index: true, element: <Antrenor /> },
    { path: 'energy-check', element: <EnergyCheckStub /> },
    { path: 'energy-cause', element: <EnergyCauseStub /> },
    { path: 'workout-preview', element: <WorkoutPreviewStub /> },
    { path: 'workout', element: <WorkoutStub /> },
    { path: 'ceva-nu-merge', element: <CevaNuMergeStub /> },
    { path: 'pain-button', element: <PainButtonStub /> },
    { path: 'equipment-swap', element: <EquipmentSwapStub /> },
    { path: 'aparate-lipsa', element: <AparateLipsaStub /> },
    { path: 'schedule-override', element: <ScheduleOverrideStub /> },
    { path: 'post-rpe', element: <PostRpeStub /> },
    { path: 'post-summary', element: <PostSummaryStub /> },
  ],
},
```

### D) Create placeholder stub files

Folder structure NEW:
```
src/react/routes/screens/antrenor/
├── Antrenor.tsx (existing, unchanged)
├── EnergyCheck.tsx (NEW stub)
├── EnergyCause.tsx (NEW stub)
├── WorkoutPreview.tsx (NEW stub)
├── Workout.tsx (NEW stub)
├── CevaNuMerge.tsx (NEW stub)
├── PainButton.tsx (NEW stub)
├── EquipmentSwap.tsx (NEW stub)
├── AparateLipsa.tsx (NEW stub)
├── ScheduleOverride.tsx (NEW stub)
├── PostRpe.tsx (NEW stub)
└── PostSummary.tsx (NEW stub)
```

Fiecare stub minimal:
```tsx
import type { JSX } from 'react';

export function EnergyCheck(): JSX.Element {
  return (
    <section className="p-6">
      <h1 className="text-xl font-semibold text-ink mb-3">Energy Check</h1>
      <p className="text-sm text-ink2">Phase 3 task_05 placeholder.</p>
    </section>
  );
}
```

(Adaptează nume + task number la fiecare stub).

---

## §3 Implementation hints

- Mockup grep landmark pentru screen names canonical:
  ```bash
  grep -oE "goto\('[a-z-]+'" 04-architecture/mockups/andura-clasic.html | sort -u
  ```
- Verifică că nu există conflict cu existing routes Phase 2.
- Romanian no-diacritics RULE (D-LEGACY-064) preserved în stub strings.
- TS strict mode: `_exhaustive: never` fallback patters preserved.

---

## §4 Tests vitest (MemoryRouter jsdom per D020)

### A) `src/react/__tests__/lib/navigation.test.ts` (extend existing or NEW)

```typescript
import { describe, it, expect } from 'vitest';
import { gotoPath } from '../../lib/navigation';

describe('gotoPath Phase 3 Antrenor sub-screens', () => {
  it('maps energy-check la /app/antrenor/energy-check', () => {
    expect(gotoPath('energy-check')).toBe('/app/antrenor/energy-check');
  });
  it('maps workout-preview la /app/antrenor/workout-preview', () => {
    expect(gotoPath('workout-preview')).toBe('/app/antrenor/workout-preview');
  });
  // ... toate 11 sub-screens
  it('throws pentru unknown screen', () => {
    // @ts-expect-error testing runtime fallback
    expect(() => gotoPath('unknown-fake')).toThrow();
  });
});
```

### B) `src/react/__tests__/routes/router.test.tsx` (extend existing or NEW)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EnergyCheck } from '../../routes/screens/antrenor/EnergyCheck';
// ... import all stubs

describe('Antrenor sub-routes rendering Phase 3 stubs', () => {
  it('renders EnergyCheck stub la /app/antrenor/energy-check', () => {
    render(
      <MemoryRouter initialEntries={['/app/antrenor/energy-check']}>
        <Routes>
          <Route path="/app/antrenor/energy-check" element={<EnergyCheck />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Energy Check/i)).toBeInTheDocument();
  });
  // ... fiecare sub-screen stub
});
```

---

## §5 Acceptance criteria

- [ ] `GotoScreen` union extends cu 11 sub-screens NEW
- [ ] `gotoPath()` exhaustive maps toate sub-screens la `/app/antrenor/<name>`
- [ ] `router.tsx` sub-routes nested sub `/app/antrenor` children
- [ ] 11 stub files NEW în `src/react/routes/screens/antrenor/`
- [ ] vitest count: 3769 → ~3784-3794 (+15-25 new tests)
- [ ] TS compile clean (exhaustive check passes)
- [ ] Pre-commit hook verde per commit (ZERO `--no-verify`)
- [ ] Romanian no-diacritics rule preserved

---

## §6 Commit strategy

Atomic single-concern, 2-3 commits max:
1. `feat(routing): extend GotoScreen union + gotoPath cu Phase 3 Antrenor sub-screens`
2. `feat(routing): nested sub-routes /app/antrenor/* + 11 placeholder stubs`
3. `test(routing): cover Phase 3 sub-routes navigation + stub render`

---

## §7 Backup tag

```bash
git tag pre-phase3-task-01-2026-05-16
git push origin pre-phase3-task-01-2026-05-16
```

---

## §8 Report format `📤_outbox/LATEST.md`

```markdown
# LATEST CC — task_01 Routing Extend Phase 3

**Date:** 2026-05-16
**Task:** task_01 Routing Extend (GotoScreen + router sub-routes + stubs)
**Model:** Opus
**Branch:** feature/v3-react-clasic
**Status:** Complete | <X> commits | <Y> tests added | Push origin DONE

## §0 Bugatti checklist
- [✓] Pre-flight verde 3769 PASS baseline
- [✓] Backup tag pre-phase3-task-01-2026-05-16 pushed origin
- [✓] Atomic commits single-concern
- [✓] Pre-commit hook verde per commit
- [✓] TS exhaustive check passes
- [✓] Romanian no-diacritics preserved

## §1 Commits
| SHA | Subject |
|-----|---------|
| ... | ...     |

## §2 Tests
- vitest: 3769 → <new>

## §3 Issues
[none / list]

## §4 Next action
task_02 (workoutStore + coachStore) sau task_03 (engineWrappers + coachVoice) — Phase B paralel ready.
```

---

🦫 **task_01 Routing Extend. Blocks Phase B+C. Surgical touch. Pure-function paradigm preserved.**
