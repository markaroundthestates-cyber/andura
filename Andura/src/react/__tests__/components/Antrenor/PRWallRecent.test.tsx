// Phase 6 task_06 — PRWallRecent UI smoke tests.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PRWallRecent } from '../../../components/Antrenor/PRWallRecent';
import type { PRRecord } from '../../../lib/prHistoryAggregate';

const SAMPLE_RECORDS: PRRecord[] = [
  { exerciseId: 'bench-press', exerciseName: 'Bench Press', kg: 100, reps: 5, oneRMEstimate: 117, sessionTs: 3000, sessionTitle: 'Push' },
  { exerciseId: 'squat',       exerciseName: 'Squat',       kg: 140, reps: 5, oneRMEstimate: 163, sessionTs: 2000, sessionTitle: 'Legs' },
  { exerciseId: 'deadlift',    exerciseName: 'Deadlift',    kg: 180, reps: 3, oneRMEstimate: 198, sessionTs: 1000, sessionTitle: 'Pull' },
];

describe('PRWallRecent — render', () => {
  it('returns null cand empty records', () => {
    const { container } = render(<PRWallRecent records={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all 3 records cu data-testid pr-record-N', () => {
    render(<PRWallRecent records={SAMPLE_RECORDS} />);
    expect(screen.getByTestId('pr-record-0')).toBeInTheDocument();
    expect(screen.getByTestId('pr-record-1')).toBeInTheDocument();
    expect(screen.getByTestId('pr-record-2')).toBeInTheDocument();
  });

  it('renders heading "Recorduri recente"', () => {
    render(<PRWallRecent records={SAMPLE_RECORDS} />);
    expect(screen.getByRole('heading', { name: /Recorduri recente/i, level: 2 })).toBeInTheDocument();
  });

  it('renders exercise names + kg x reps + 1RM estimate format', () => {
    render(<PRWallRecent records={SAMPLE_RECORDS} />);
    expect(screen.getByText(/Bench Press/)).toBeInTheDocument();
    expect(screen.getByText(/100 kg x 5/)).toBeInTheDocument();
    expect(screen.getByText(/117 kg 1RM/)).toBeInTheDocument();
  });

  it('container data-testid pr-wall-recent', () => {
    render(<PRWallRecent records={SAMPLE_RECORDS} />);
    expect(screen.getByTestId('pr-wall-recent')).toBeInTheDocument();
  });

  it('no diacritics in RO copy', () => {
    const { container } = render(<PRWallRecent records={SAMPLE_RECORDS} />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
