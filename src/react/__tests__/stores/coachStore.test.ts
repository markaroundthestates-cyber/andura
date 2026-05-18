// ══ COACH STORE TESTS — Zustand Coach Context Slice ══════════════════════
// Per spec task_02 §4 B — pure-function actions + persist middleware.

import { describe, it, expect, beforeEach } from 'vitest';
import { useCoachStore } from '../../stores/coachStore';

function resetStore(): void {
  useCoachStore.setState({
    schedContext: 'workout',
    persona: 'gigel',
    reactivateDismissed: false,
  });
  localStorage.clear();
}

describe('coachStore — initial state defaults', () => {
  beforeEach(resetStore);

  it('default schedContext = workout', () => {
    expect(useCoachStore.getState().schedContext).toBe('workout');
  });

  it('default persona = gigel', () => {
    expect(useCoachStore.getState().persona).toBe('gigel');
  });

  it('default reactivateDismissed = false', () => {
    expect(useCoachStore.getState().reactivateDismissed).toBe(false);
  });
});

describe('coachStore — setSchedContext', () => {
  beforeEach(resetStore);

  it('setSchedContext rest', () => {
    useCoachStore.getState().setSchedContext('rest');
    expect(useCoachStore.getState().schedContext).toBe('rest');
  });

  it('setSchedContext workout (toggle back)', () => {
    useCoachStore.getState().setSchedContext('rest');
    useCoachStore.getState().setSchedContext('workout');
    expect(useCoachStore.getState().schedContext).toBe('workout');
  });
});

describe('coachStore — setPersona', () => {
  beforeEach(resetStore);

  it('setPersona maria', () => {
    useCoachStore.getState().setPersona('maria');
    expect(useCoachStore.getState().persona).toBe('maria');
  });

  it('setPersona marius', () => {
    useCoachStore.getState().setPersona('marius');
    expect(useCoachStore.getState().persona).toBe('marius');
  });

  it('setPersona gigel (default reset)', () => {
    useCoachStore.getState().setPersona('marius');
    useCoachStore.getState().setPersona('gigel');
    expect(useCoachStore.getState().persona).toBe('gigel');
  });
});

describe('coachStore — reactivateDismissed', () => {
  beforeEach(resetStore);

  it('dismissReactivate sets flag true', () => {
    useCoachStore.getState().dismissReactivate();
    expect(useCoachStore.getState().reactivateDismissed).toBe(true);
  });

  it('resetDismissReactivate clears flag false', () => {
    useCoachStore.getState().dismissReactivate();
    useCoachStore.getState().resetDismissReactivate();
    expect(useCoachStore.getState().reactivateDismissed).toBe(false);
  });
});

describe('coachStore — persist middleware', () => {
  beforeEach(resetStore);

  it('persist write contains schedContext rest dupa setSchedContext', async () => {
    useCoachStore.getState().setSchedContext('rest');
    await new Promise((r) => setTimeout(r, 20));
    const raw = localStorage.getItem('wv2-coach-store');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.schedContext).toBe('rest');
  });

  it('persist write contains persona marius dupa setPersona', async () => {
    useCoachStore.getState().setPersona('marius');
    await new Promise((r) => setTimeout(r, 20));
    const raw = localStorage.getItem('wv2-coach-store');
    const parsed = JSON.parse(raw!);
    expect(parsed.state.persona).toBe('marius');
  });

  it('persist write contains reactivateDismissed true dupa dismissReactivate', async () => {
    useCoachStore.getState().dismissReactivate();
    await new Promise((r) => setTimeout(r, 20));
    const raw = localStorage.getItem('wv2-coach-store');
    const parsed = JSON.parse(raw!);
    expect(parsed.state.reactivateDismissed).toBe(true);
  });
});
