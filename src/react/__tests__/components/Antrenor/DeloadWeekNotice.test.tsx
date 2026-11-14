// Founder 2026-11-14: "fa sa imi dea si mesaj la inceput de saptamana... asa daca ma
// anunta ca e saptamana de deload, nu fortez eu greutati".
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeloadWeekNotice, DELOAD_NOTICE_KEY } from '../../../components/Antrenor/DeloadWeekNotice';
import { weekStartIso } from '../../../stores/scheduleStore';
import type { PlannedWorkoutOutput } from '../../../lib/engineWrappers';

const plan = (over: Partial<PlannedWorkoutOutput>): PlannedWorkoutOutput => ({
  workoutTitle: 'Lower',
  exerciseCount: 6,
  estimatedDuration: 50,
  intensityMod: 'minus',
  deloadPctDecrement: 12.5,
  deloadKind: 'scheduled',
  exercises: [],
  volumeKg: 0,
  ...over,
} as PlannedWorkoutOutput);

beforeEach(() => { localStorage.clear(); });

describe('DeloadWeekNotice', () => {
  it('announces the planned deload week once: how much lighter, how long, do not force', () => {
    const { unmount } = render(<DeloadWeekNotice workout={plan({})} />);
    expect(screen.getByTestId('deload-notice')).toBeTruthy();
    const body = screen.getByTestId('deload-notice-body').textContent ?? '';
    expect(body).toContain('~13%');
    expect(body).toContain("Don't force the weights");
    expect(body).toContain('It lasts one week');
    fireEvent.click(screen.getByTestId('deload-notice-ok'));
    expect(screen.queryByTestId('deload-notice')).toBeNull();
    expect(localStorage.getItem(DELOAD_NOTICE_KEY)).toBe(weekStartIso());
    unmount();
    render(<DeloadWeekNotice workout={plan({})} />);
    expect(screen.queryByTestId('deload-notice')).toBeNull();
  });

  it('a new deload week announces again', () => {
    localStorage.setItem(DELOAD_NOTICE_KEY, '2026-10-12');
    render(<DeloadWeekNotice workout={plan({})} />);
    expect(screen.getByTestId('deload-notice')).toBeTruthy();
  });

  it('a reactive deload says it comes from fatigue and ends when it clears', () => {
    render(<DeloadWeekNotice workout={plan({ deloadKind: 'reactive' })} />);
    const body = screen.getByTestId('deload-notice-body').textContent ?? '';
    expect(body).toContain('accumulated fatigue');
    expect(body).not.toContain('It lasts one week');
  });

  it('stays hidden on a normal week or without a plan', () => {
    const { rerender } = render(<DeloadWeekNotice workout={plan({ intensityMod: 'normal', deloadPctDecrement: null, deloadKind: null })} />);
    expect(screen.queryByTestId('deload-notice')).toBeNull();
    rerender(<DeloadWeekNotice workout={null} />);
    expect(screen.queryByTestId('deload-notice')).toBeNull();
  });
});
