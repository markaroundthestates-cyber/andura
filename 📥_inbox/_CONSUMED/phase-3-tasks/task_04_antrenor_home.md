# TASK 04 — Antrenor Home Rewrite (F2/F4/F6/F8/F10/F11 Parity Mockup)

**Model:** Opus EXCLUSIVELY
**Phase:** C (paralel cu task_05 task_06 task_07 task_08 task_09)
**Depends on:** task_01 + task_02 + task_03 LANDED
**Estimated touched files:** 1 rewrite (Antrenor.tsx) + N new components (StatsGrid, ResumeCard, ReactivateCard, CoachTodayCard, CoachRestCard, UltimaSesiuneCard)
**Estimated new tests:** +25-40

---

## §0 Bugatti checklist pre-flight

- [ ] task_01 + task_02 + task_03 ALL LANDED
- [ ] Branch HEAD verde
- [ ] Backup tag `pre-phase3-task-04-2026-05-16` push origin

---

## §1 Read order CC autonomous

1. `ANDURA_PRIMER.md` §1-§8
2. `DECISIONS.md` §D-LEGACY-052 §D-LEGACY-065 §D-LEGACY-093 §D-LEGACY-094 §D-LEGACY-095 (F2/F3/F4 features) + §D-LEGACY-098 (LOCK 10 MMI)
3. `04-architecture/mockups/andura-clasic.html` grep pentru:
   - `id="antrenor"` screen section
   - `coach-today-card` + `coach-rest-card` swap logic
   - `resume-session-card` (paused session resume UI)
   - `reactivate-card` (win-back > 14 days)
   - `ultima-sesiune-card-istoric` (F2 Last Session)
   - Stats grid 3-cell layout (F10)
   - F8 streak counter display
   - F11 PR notification banner

---

## §2 Spec exact

### A) Rewrite `src/react/routes/screens/antrenor/Antrenor.tsx`

Antrenor home = single screen cu vertical stack:
1. Status bar + nav header (sticky top)
2. Anonymous user banner (if `!isAuthenticated`) — wire la appStore
3. Resume session card (if `workoutStore.pausedSnapshot !== null`) — wire `resumeSession()` + `discardSession()`
4. Win-back reactivate card (if `lastSession.ts > 14 days ago` && `!coachStore.reactivateDismissed`) — wire `reactivate-start` + `dismiss`
5. Coach today card (workout mode) sau Coach rest card (rest mode) — swap based pe `coachStore.schedContext`
6. F10 Stats grid 3-cell — wire engineWrappers.getReadiness + getFatigueScore + streak from workoutStore
7. F4 Readiness verdict line (emoji + label + kcal/protein delta) — wire engineWrappers.getReadiness
8. Action button "Incepe antrenament" → `gotoPath('energy-check')` sau direct workout-preview based pe persona
9. F11 PR notification banner (if `workoutStore.lastSession` are PRs recent) — query engineWrappers.getPRDeltas
10. F2 Last Session card (mutat în Istoric tab per mockup, dar Antrenor poate avea preview brief)

**Component decomposition** (extract reusable):
- `src/react/components/Antrenor/ResumeSessionCard.tsx`
- `src/react/components/Antrenor/ReactivateCard.tsx`
- `src/react/components/Antrenor/CoachTodayCard.tsx`
- `src/react/components/Antrenor/CoachRestCard.tsx`
- `src/react/components/Antrenor/StatsGrid.tsx`
- `src/react/components/Antrenor/ReadinessVerdict.tsx`
- `src/react/components/Antrenor/PRNotificationBanner.tsx`

Cada componenta = pure presentation, primește props din parent. State management în parent via store hooks.

### B) Persona-aware variants (mockup `.persona-*`)

Tailwind conditional rendering bazat pe `coachStore.persona`:
- `persona === 'maria'` → text-base + transitions lente + lewer info density
- `persona === 'gigel'` → default
- `persona === 'marius'` → text-sm + granular numbers + RPE + tonaj + 1RM est.

### C) F2 Last Session UI (Antrenor hidden preview, Istoric tab vizibil per mockup §JS tail)

Mockup logic:
```javascript
// Legacy hidden card on Antrenor (kept for backward compat; not visible).
document.getElementById('ultima-sesiune-card').style.display = 'none';
```

React: NU render component dacă tab=antrenor. Doar render în Istoric.tsx (task viitor Phase 4).

### D) Wiring stores + engineWrappers

```tsx
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useCoachStore } from '../../../stores/coachStore';
import { useAppStore } from '../../../stores/appStore';
import { getReadiness, getFatigueScore, getPRDeltas } from '../../../lib/engineWrappers';
import { gotoPath } from '../../../lib/navigation';
import { useNavigate } from 'react-router-dom';

export function Antrenor(): JSX.Element {
  const navigate = useNavigate();
  const { pausedSnapshot, lastSession, streak, resumeSession, discardSession } = useWorkoutStore();
  const { schedContext, persona, reactivateDismissed } = useCoachStore();
  const { isAuthenticated } = useAppStore();

  // Derived state
  const userId = 'demo-user'; // Phase 3 hardcoded — Phase 4 wires auth user.uid
  const readiness = getReadiness(userId);
  const fatigue = getFatigueScore(userId);
  const showReactivate = lastSession && (Date.now() - lastSession.ts > 14 * 86400000) && !reactivateDismissed;

  return (
    <section className={`paper-bg persona-${persona}`}>
      {!isAuthenticated && <AnonymousBanner />}
      {pausedSnapshot && <ResumeSessionCard snapshot={pausedSnapshot} onResume={resumeSession} onDiscard={discardSession} />}
      {showReactivate && <ReactivateCard lastSession={lastSession!} />}
      {schedContext === 'workout' ? <CoachTodayCard /> : <CoachRestCard />}
      <StatsGrid streak={streak} fatigue={fatigue} readiness={readiness} />
      <ReadinessVerdict readiness={readiness} />
      <button onClick={() => navigate(gotoPath('energy-check'))} className="btn-primary">
        Incepe antrenament
      </button>
      {/* F11 PR notification banner — render conditional pe PR detection */}
    </section>
  );
}
```

---

## §3 Implementation hints

- Romanian no-diacritics RULE preserved în toate UI strings: "Incepe antrenament", "Reia sesiunea", "Salveaza si iesi", etc.
- Anti-paternalism ABSOLUTE: ZERO motivational language hardcoded. Coach copy doar din `coachVoice.coachPick()`.
- Mockup CSS classes preserved la port (paper-bg, persona-X, body-text, small-text, display-text).
- Lucide icons: install `lucide-react` dacă nu există în package.json. Use `<Icon className="..." />` patterns.
- Tailwind classes mapping mockup CSS variables — verifică `tailwind.config` extend cu cream theme (--paper, --ink, etc.) deja LANDED Phase 1.
- Surgical touch: doar Antrenor.tsx + Antrenor components. NU touch alte tabs (Progres/Istoric/Cont) sau Layout.

---

## §4 Tests vitest + RTL (MemoryRouter jsdom per D020)

### A) `src/react/__tests__/screens/antrenor/Antrenor.test.tsx`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Antrenor } from '../../../routes/screens/antrenor/Antrenor';
import { useWorkoutStore } from '../../../stores/workoutStore';
import { useCoachStore } from '../../../stores/coachStore';

// Mock engineWrappers
vi.mock('../../../lib/engineWrappers', () => ({
  getReadiness: vi.fn(() => ({ emoji: '💪', label: 'Optim', kcalDelta: 0, proteinDelta: 0 })),
  getFatigueScore: vi.fn(() => ({ score: 45, color: 'yellow' })),
  getPRDeltas: vi.fn(() => []),
  getTodayWorkout: vi.fn(() => null),
}));

function renderAntrenor() {
  return render(
    <MemoryRouter initialEntries={['/app/antrenor']}>
      <Routes>
        <Route path="/app/antrenor" element={<Antrenor />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Antrenor home', () => {
  beforeEach(() => {
    useWorkoutStore.getState().reset();
    useCoachStore.setState({ schedContext: 'workout', persona: 'gigel', reactivateDismissed: false });
  });

  it('renders CoachTodayCard cand schedContext=workout', () => {
    renderAntrenor();
    expect(screen.getByText(/Incepe antrenament/i)).toBeInTheDocument();
  });

  it('renders CoachRestCard cand schedContext=rest', () => {
    useCoachStore.getState().setSchedContext('rest');
    renderAntrenor();
    // Verify rest card visible
  });

  it('renders ResumeSessionCard cand pausedSnapshot exists', () => {
    useWorkoutStore.setState({
      pausedSnapshot: { title: 'Push', meta: 'ex 2', exIdx: 1, setIdx: 0, phase: 'logging', history: {}, sessionStart: Date.now() }
    });
    renderAntrenor();
    expect(screen.getByText(/Reia sesiunea/i)).toBeInTheDocument();
  });

  it('renders ReactivateCard cand lastSession > 14 days + NOT dismissed', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '...', ts: Date.now() - 15 * 86400000 }
    });
    renderAntrenor();
    // Verify reactivate visible
  });

  it('hides ReactivateCard cand dismissed', () => {
    useWorkoutStore.setState({
      lastSession: { title: 'Push', meta: '...', ts: Date.now() - 15 * 86400000 }
    });
    useCoachStore.getState().dismissReactivate();
    renderAntrenor();
    // Verify reactivate hidden
  });

  it('StatsGrid shows streak from workoutStore', () => {
    useWorkoutStore.setState({ streak: 12 });
    renderAntrenor();
    expect(screen.getByText(/12/)).toBeInTheDocument();
  });

  it('clicks Incepe antrenament navigates /app/antrenor/energy-check', () => {
    renderAntrenor();
    fireEvent.click(screen.getByText(/Incepe antrenament/i));
    // Verify navigation triggered (use useNavigate mock or expect URL change)
  });

  it('persona-maria class applied cand persona=maria', () => {
    useCoachStore.getState().setPersona('maria');
    const { container } = renderAntrenor();
    expect(container.querySelector('.persona-maria')).toBeInTheDocument();
  });

  // ... +10-15 more tests (F4 readiness + F10 stats + F11 PR banner conditional)
});
```

---

## §5 Acceptance criteria

- [ ] Antrenor.tsx rewrite full features F2(preview)/F4/F6/F8/F10/F11 parity mockup
- [ ] 7+ reusable components în `src/react/components/Antrenor/`
- [ ] Coach today/rest card swap based pe coachStore.schedContext
- [ ] Resume session card conditional pe pausedSnapshot
- [ ] Reactivate card conditional pe lastSession age + dismiss flag
- [ ] Persona-aware CSS classes applied (.persona-maria/.persona-gigel/.persona-marius)
- [ ] Romanian no-diacritics rule preserved (UI strings + tests)
- [ ] vitest count: +25-40 new tests
- [ ] TS strict compile clean

---

## §6 Commit strategy

3-4 commits atomic:
1. `feat(react/components): Antrenor reusable cards (Resume + Reactivate + CoachToday + CoachRest)`
2. `feat(react/components): Antrenor StatsGrid + ReadinessVerdict + PRBanner`
3. `feat(react/antrenor): Antrenor home rewrite F2/F4/F6/F8/F10/F11 parity mockup`
4. `test(react/antrenor): cover Antrenor home conditional renders + persona variants + navigation`

---

## §7 Backup tag

```bash
git tag pre-phase3-task-04-2026-05-16
git push origin pre-phase3-task-04-2026-05-16
```

---

## §8 Report `📤_outbox/LATEST.md` standard envelope.

---

🦫 **task_04 Antrenor home. Phase C paralel. F2/F4/F6/F8/F10/F11 parity. Persona-aware. Pure presentation + store hooks.**
