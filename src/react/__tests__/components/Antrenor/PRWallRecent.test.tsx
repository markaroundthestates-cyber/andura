// Phase 6 task_06 — PRWallRecent UI smoke tests.
// Wave E3 i18n: heading flipped to EN default ("Recent PRs"); RO opt-in
// covered by a dedicated block at the bottom.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PRWallRecent } from '../../../components/Antrenor/PRWallRecent';
import type { PRRecord } from '../../../lib/prHistoryAggregate';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

const SAMPLE_RECORDS: PRRecord[] = [
  { exerciseId: 'bench-press', exerciseName: 'Bench Press', kg: 100, reps: 5, oneRMEstimate: 117, sessionTs: 3000, sessionTitle: 'Push' },
  { exerciseId: 'squat',       exerciseName: 'Squat',       kg: 140, reps: 5, oneRMEstimate: 163, sessionTs: 2000, sessionTitle: 'Legs' },
  { exerciseId: 'deadlift',    exerciseName: 'Deadlift',    kg: 180, reps: 3, oneRMEstimate: 198, sessionTs: 1000, sessionTitle: 'Pull' },
];

beforeEach(() => {
  setLocale('en');
  _resetI18nCache();
  setLocale('en');
});

afterEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
});

describe('PRWallRecent — render (EN default)', () => {
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

  it('renders heading "Recent PRs" under EN default', () => {
    render(<PRWallRecent records={SAMPLE_RECORDS} />);
    expect(screen.getByRole('heading', { name: /Recent PRs/i, level: 2 })).toBeInTheDocument();
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

  it('no diacritics under EN default', () => {
    const { container } = render(<PRWallRecent records={SAMPLE_RECORDS} />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});

describe('PRWallRecent — RO locale opt-in', () => {
  beforeEach(() => {
    setLocale('ro');
    _resetI18nCache();
    setLocale('ro');
  });

  it('renders heading "Recorduri recente" under RO locale', () => {
    render(<PRWallRecent records={SAMPLE_RECORDS} />);
    expect(screen.getByRole('heading', { name: /Recorduri recente/i, level: 2 })).toBeInTheDocument();
  });

  it('no diacritics in RO copy (D-LEGACY-064)', () => {
    const { container } = render(<PRWallRecent records={SAMPLE_RECORDS} />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});
