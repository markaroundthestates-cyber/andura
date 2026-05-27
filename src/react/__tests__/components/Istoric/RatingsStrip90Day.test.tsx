// ══ RATINGS STRIP 90-DAY TESTS — F-istoric-03 ════════════════════════════
// Cases per spec §9.2.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RatingsStrip90Day, computeBuckets } from '../../../components/Istoric/RatingsStrip90Day';
import { useWorkoutStore } from '../../../stores/workoutStore';
import type { LastSessionSummary } from '../../../stores/workoutStore';

const MS_PER_DAY = 86_400_000;

function makeSession(daysAgo: number, rating: 'usor' | 'potrivit' | 'greu'): LastSessionSummary {
  return {
    title: 'Test',
    meta: '',
    ts: Date.now() - daysAgo * MS_PER_DAY,
    exercises: [
      {
        exerciseId: 'ex',
        exerciseName: 'Ex',
        sets: [{ kg: 100, reps: 5, rating, timestamp: 0 }],
        totalVolume: 500,
        peakOneRM: 100,
      },
    ],
  };
}

beforeEach(() => {
  useWorkoutStore.setState({ sessionsHistory: [] });
});

describe('RatingsStrip90Day — render basics', () => {
  it('renders header "Cum au fost sesiunile" + "ultimele 90 zile"', () => {
    render(<RatingsStrip90Day />);
    expect(screen.getByText(/Cum au fost sesiunile/i)).toBeInTheDocument();
    // Header sub-label "ultimele 90 zile" also appears in footer copy; assert at least one match.
    expect(screen.getAllByText(/ultimele 90 zile/i).length).toBeGreaterThan(0);
  });

  it('renders 13 rh-col columns', () => {
    render(<RatingsStrip90Day />);
    for (let i = 0; i < 13; i++) {
      expect(screen.getByTestId(`rh-col-${i}`)).toBeInTheDocument();
    }
  });

  it('container data-testid present', () => {
    render(<RatingsStrip90Day />);
    expect(screen.getByTestId('ratings-strip-90day')).toBeInTheDocument();
  });
});

describe('RatingsStrip90Day — empty + aggregate', () => {
  it('empty sessions → all counts 0 + footer "0 sesiuni"', () => {
    render(<RatingsStrip90Day />);
    expect(screen.getByTestId('count-usor').textContent).toBe('0');
    expect(screen.getByTestId('count-potrivit').textContent).toBe('0');
    expect(screen.getByTestId('count-greu').textContent).toBe('0');
    expect(screen.getByTestId('ratings-footer').textContent).toContain('0 sesiuni');
  });

  it('seeds 3 sessions (usor + potrivit + greu) within 90d → counts {1,1,1} + footer 3 sesiuni', () => {
    useWorkoutStore.setState({
      sessionsHistory: [
        makeSession(5, 'usor'),
        makeSession(20, 'potrivit'),
        makeSession(50, 'greu'),
      ],
    });
    render(<RatingsStrip90Day />);
    expect(screen.getByTestId('count-usor').textContent).toBe('1');
    expect(screen.getByTestId('count-potrivit').textContent).toBe('1');
    expect(screen.getByTestId('count-greu').textContent).toBe('1');
    expect(screen.getByTestId('ratings-footer').textContent).toContain('3 sesiuni');
  });

  it('seeds 1 session within 90d → footer singular "1 sesiune" (NU "sesiuni")', () => {
    useWorkoutStore.setState({ sessionsHistory: [makeSession(5, 'potrivit')] });
    render(<RatingsStrip90Day />);
    const footer = screen.getByTestId('ratings-footer').textContent ?? '';
    expect(footer).toContain('1 sesiune in ultimele');
  });
});

describe('RatingsStrip90Day — bucket logic', () => {
  it('skips sessions outside 90-day window', () => {
    const buckets = computeBuckets([
      { ts: Date.now() - 100 * MS_PER_DAY, exercises: [] }, // outside window
      { ts: Date.now() - 10 * MS_PER_DAY, exercises: [{ sets: [{ rating: 'usor' }] }] },
    ]);
    expect(buckets.counts.total).toBe(1);
    expect(buckets.counts.usor).toBe(1);
  });

  it('reverses bucket order: newest session → col12 (rightmost)', () => {
    const buckets = computeBuckets([
      { ts: Date.now() - 1 * MS_PER_DAY, exercises: [{ sets: [{ rating: 'greu' }] }] }, // ~now, weekIdx=0
    ]);
    // weekIdx 0 → colIdx = 12 (rightmost)
    expect(buckets.weeks[12]?.length).toBe(1);
    expect(buckets.weeks[0]?.length).toBe(0);
  });
});

describe('RatingsStrip90Day — accessibility', () => {
  it('no diacritics in textContent', () => {
    const { container } = render(<RatingsStrip90Day />);
    expect(/[ăâîșțĂÂÎȘȚ]/.test(container.textContent ?? '')).toBe(false);
  });
});

// MED-A-2 CODE-REVIEW chat3: legacy session (exercises:[]) → rating null
// must NOT inflate potrivit count. Honest aggregate + total excludes unrated.
describe('RatingsStrip90Day — unrated attribution (MED-A-2)', () => {
  it('session with rating=null (empty exercises) counted as unrated NOT potrivit', () => {
    // deriveSessionRating returns null when exercises field empty/missing.
    const buckets = computeBuckets([
      { ts: Date.now() - 5 * MS_PER_DAY, exercises: [] },
    ]);
    expect(buckets.counts.potrivit).toBe(0);
    expect(buckets.counts.unrated).toBe(1);
    expect(buckets.counts.total).toBe(0); // total = explicitly rated only
  });

  it('mixed rated + unrated → counts honest (potrivit=1, unrated=2, total=1)', () => {
    const buckets = computeBuckets([
      { ts: Date.now() - 5 * MS_PER_DAY, exercises: [{ sets: [{ rating: 'potrivit' }] }] },
      { ts: Date.now() - 10 * MS_PER_DAY, exercises: [] },
      { ts: Date.now() - 20 * MS_PER_DAY, exercises: [] },
    ]);
    expect(buckets.counts.potrivit).toBe(1);
    expect(buckets.counts.unrated).toBe(2);
    expect(buckets.counts.total).toBe(1);
  });
});
