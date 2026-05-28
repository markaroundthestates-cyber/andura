// ══ RATINGS STRIP 90-DAY TESTS — F-istoric-03 ════════════════════════════
// Wave E3 i18n: flipped to EN default (Daniel mandate 2026-05-28). RO opt-in
// behaviour covered in its own block at the bottom.
// Cases per spec §9.2.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RatingsStrip90Day, computeBuckets } from '../../../components/Istoric/RatingsStrip90Day';
import { useWorkoutStore } from '../../../stores/workoutStore';
import type { LastSessionSummary } from '../../../stores/workoutStore';
import { setLocale, _resetI18nCache } from '../../../../i18n/index.js';

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
  setLocale('en');
  _resetI18nCache();
  setLocale('en');
});

afterEach(() => {
  try { localStorage.removeItem('sf.locale'); } catch { /* noop */ }
  _resetI18nCache();
});

describe('RatingsStrip90Day — render basics (EN default)', () => {
  it('renders header "How your sessions felt" + "last 90 days"', () => {
    render(<RatingsStrip90Day />);
    expect(screen.getByText(/How your sessions felt/i)).toBeInTheDocument();
    // Header sub-label "last 90 days" also appears in footer copy; assert at least one match.
    expect(screen.getAllByText(/last 90 days/i).length).toBeGreaterThan(0);
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

describe('RatingsStrip90Day — empty + aggregate (EN default)', () => {
  it('empty sessions → all counts 0 + footer "0 sessions"', () => {
    render(<RatingsStrip90Day />);
    expect(screen.getByTestId('count-usor').textContent).toBe('0');
    expect(screen.getByTestId('count-potrivit').textContent).toBe('0');
    expect(screen.getByTestId('count-greu').textContent).toBe('0');
    expect(screen.getByTestId('ratings-footer').textContent).toContain('0 sessions');
  });

  it('seeds 3 sessions (usor + potrivit + greu) within 90d → counts {1,1,1} + footer 3 sessions', () => {
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
    expect(screen.getByTestId('ratings-footer').textContent).toContain('3 sessions');
  });

  it('seeds 1 session within 90d → footer singular "1 session" (NU "sessions")', () => {
    useWorkoutStore.setState({ sessionsHistory: [makeSession(5, 'potrivit')] });
    render(<RatingsStrip90Day />);
    const footer = screen.getByTestId('ratings-footer').textContent ?? '';
    expect(footer).toContain('1 session in the last');
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

describe('RatingsStrip90Day — RO locale opt-in (preserves pluralRo "de" rule)', () => {
  beforeEach(() => {
    setLocale('ro');
    _resetI18nCache();
    setLocale('ro');
  });

  it('RO header copy surfaces "Cum au fost sesiunile"', () => {
    render(<RatingsStrip90Day />);
    expect(screen.getByText(/Cum au fost sesiunile/i)).toBeInTheDocument();
  });

  it('RO footer pluralizes via pluralRo — singular "1 sesiune"', () => {
    useWorkoutStore.setState({ sessionsHistory: [makeSession(5, 'potrivit')] });
    render(<RatingsStrip90Day />);
    expect(screen.getByTestId('ratings-footer').textContent).toContain('1 sesiune in ultimele 90 zile');
  });

  it('RO footer pluralizes via pluralRo — plural "3 sesiuni" (NU 3 de sesiuni)', () => {
    useWorkoutStore.setState({
      sessionsHistory: [
        makeSession(5, 'usor'),
        makeSession(10, 'potrivit'),
        makeSession(15, 'greu'),
      ],
    });
    render(<RatingsStrip90Day />);
    expect(screen.getByTestId('ratings-footer').textContent).toContain('3 sesiuni in ultimele');
  });
});
