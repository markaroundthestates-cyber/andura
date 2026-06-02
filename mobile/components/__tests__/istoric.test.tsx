// ══ ISTORIC WAVE (W5) — store-connected screen + component tests ═══════════
// Proves the ported Istoric tab renders against the SAME web stores (workoutStore
// kv-backed via the MMKV mock) with no native bridge: empty state, populated
// list (FlatList rows + drill-down nav to the original index), PR-wall preview +
// "see all" nav, the CalendarHeatmap month nav, the RatingsStrip90Day buckets +
// empty state, the PrWall screen stats, and the IstoricDetail breakdown + delete.
// expo-router is stubbed (router.push/replace + useLocalSearchParams) — the only
// framework edge; the store/aggregate logic is what these prove.

import { render, screen, fireEvent, act } from '@testing-library/react-native';

let mockSearchParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => mockSearchParams,
}));

// Pull the mocked router so the asserts read the same jest.fn instances the
// screens call. mockSearchParams stays mutable per test (used by the factory's
// useLocalSearchParams closure).
import { router } from 'expo-router';
const push = router.push as jest.Mock;
const replace = router.replace as jest.Mock;

import Istoric from '../../app/app/istoric/index';
import PrWall from '../../app/app/istoric/pr-wall';
import IstoricDetail from '../../app/app/istoric/[sessionId]';
import { computeBuckets } from '../Istoric/RatingsStrip90Day';
import { useWorkoutStore } from '../../../src/react/stores/workoutStore';
import type { SessionRating } from '../../../src/react/lib/sessionRating';

const DAY = 86_400_000;

// A populated session WITH a per-exercise breakdown (drives rating chip + PR +
// the detail table + the PR-wall aggregate). `ts` recent so it lands in the
// 90-day ratings window.
function seededSession(ts: number, rating: SessionRating = 'greu') {
  return {
    title: 'Push A',
    meta: '3 exercitii',
    ts,
    sets: 9,
    durationMin: 52,
    volumeKg: 4200,
    exercises: [
      {
        exerciseId: 'bench',
        exerciseName: 'Impins din piept',
        peakOneRM: 110,
        totalVolume: 3000,
        sets: [
          { kg: 80, reps: 8, rating, timestamp: ts, isPR: true },
          { kg: 80, reps: 6, rating, timestamp: ts, isPR: false },
        ],
      },
    ],
  };
}

beforeEach(() => {
  push.mockClear();
  replace.mockClear();
  mockSearchParams = {};
  act(() => {
    useWorkoutStore.setState({ sessionsHistory: [], streak: 0 });
  });
});

describe('Istoric landing (RN)', () => {
  it('renders the honest empty state with zero sessions', () => {
    render(<Istoric />);
    expect(screen.getByTestId('istoric-home')).toBeTruthy();
    expect(screen.getByTestId('istoric-empty')).toBeTruthy();
    expect(screen.getByTestId('istoric-stats-grid')).toBeTruthy();
    // Stat trio reads 0 with no data.
    expect(screen.getByTestId('stats-total')).toHaveTextContent('0');
  });

  it('renders the session list + drills to the original index on tap', () => {
    const ts = Date.now() - 2 * DAY;
    act(() => {
      useWorkoutStore.setState({ sessionsHistory: [seededSession(ts)], streak: 3 });
    });
    render(<Istoric />);

    expect(screen.getByTestId('istoric-list')).toBeTruthy();
    const row = screen.getByTestId('istoric-session-0');
    expect(row).toBeTruthy();
    // PR trophy present (the seeded set isPR=true).
    expect(screen.getByTestId('istoric-session-0-pr')).toBeTruthy();

    fireEvent.press(row);
    // sorted[0] === sessionsHistory[0] → originalIdx 0.
    expect(push).toHaveBeenCalledWith('/app/istoric/0');
  });

  it('shows the PR-wall preview + navigates to pr-wall on "see all"', () => {
    act(() => {
      useWorkoutStore.setState({ sessionsHistory: [seededSession(Date.now() - DAY)] });
    });
    render(<Istoric />);
    expect(screen.getByTestId('istoric-pr-wall')).toBeTruthy();
    expect(screen.getByTestId('pr-row-0')).toBeTruthy();

    fireEvent.press(screen.getByTestId('istoric-pr-wall-see-all'));
    expect(push).toHaveBeenCalledWith('/app/istoric/pr-wall');
  });

  it('renders the calendar heatmap + steps months via the chevrons', () => {
    render(<Istoric />);
    expect(screen.getByTestId('calendar-heatmap')).toBeTruthy();
    const label = screen.getByTestId('cal-month-label').props.children.join('');
    fireEvent.press(screen.getByTestId('cal-prev'));
    const prevLabel = screen.getByTestId('cal-month-label').props.children.join('');
    expect(prevLabel).not.toBe(label);
    fireEvent.press(screen.getByTestId('cal-next'));
    expect(screen.getByTestId('cal-month-label').props.children.join('')).toBe(label);
  });
});

describe('RatingsStrip90Day (RN)', () => {
  it('renders the empty card when no sessions fall in the window', () => {
    render(<Istoric />);
    expect(screen.getByTestId('ratings-empty')).toBeTruthy();
  });

  it('renders bucket bars + counts when sessions land in the window', () => {
    act(() => {
      useWorkoutStore.setState({ sessionsHistory: [seededSession(Date.now() - DAY, 'greu')] });
    });
    render(<Istoric />);
    expect(screen.getByTestId('rh-strip')).toBeTruthy();
    // One 'greu' session → count-greu === 1.
    expect(screen.getByTestId('count-greu')).toHaveTextContent('1');
  });

  it('computeBuckets places a session into the newest column + counts it', () => {
    const now = 1_700_000_000_000;
    const { weeks, counts } = computeBuckets([{ ts: now - DAY, exercises: [{ sets: [{ rating: 'usor' }] }] }], now);
    expect(counts.usor).toBe(1);
    expect(counts.total).toBe(1);
    // Newest week = last column (index 12).
    expect(weeks[12]).toHaveLength(1);
  });
});

describe('PrWall (RN)', () => {
  it('renders the empty state with no PRs', () => {
    render(<PrWall />);
    expect(screen.getByTestId('pr-wall')).toBeTruthy();
    expect(screen.getByTestId('pr-wall-empty')).toBeTruthy();
    expect(screen.getByTestId('pr-wall-stat-total')).toHaveTextContent('0');
  });

  it('renders the PR list + stats from a session with PR sets', () => {
    act(() => {
      useWorkoutStore.setState({ sessionsHistory: [seededSession(Date.now() - DAY)] });
    });
    render(<PrWall />);
    expect(screen.getByTestId('pr-wall-list')).toBeTruthy();
    expect(screen.getByTestId('pr-wall-row-0')).toBeTruthy();
    expect(screen.getByTestId('pr-wall-stat-total')).toHaveTextContent('1');
    expect(screen.getByTestId('pr-wall-stat-exercises')).toHaveTextContent('1');
  });

  it('navigates back to the istoric tab', () => {
    render(<PrWall />);
    fireEvent.press(screen.getByTestId('pr-wall-back'));
    expect(replace).toHaveBeenCalledWith('/app/istoric');
  });
});

describe('IstoricDetail (RN)', () => {
  it('renders the missing state for an out-of-range id', () => {
    mockSearchParams = { sessionId: '99' };
    render(<IstoricDetail />);
    expect(screen.getByTestId('istoric-detail-missing')).toBeTruthy();
  });

  it('renders the session detail + breakdown table for a valid id', () => {
    act(() => {
      useWorkoutStore.setState({ sessionsHistory: [seededSession(Date.now() - DAY)] });
    });
    mockSearchParams = { sessionId: '0' };
    render(<IstoricDetail />);
    expect(screen.getByTestId('istoric-detail')).toBeTruthy();
    expect(screen.getByTestId('istoric-detail-breakdown')).toBeTruthy();
    expect(screen.getByTestId('detail-ex-bench')).toBeTruthy();
    expect(screen.getByTestId('detail-set-bench-0')).toBeTruthy();
    expect(screen.getByTestId('detail-sets')).toBeTruthy();
  });

  it('deletes the session via the two-tap confirm + returns to the tab', () => {
    const ts = Date.now() - DAY;
    act(() => {
      useWorkoutStore.setState({ sessionsHistory: [seededSession(ts)] });
    });
    mockSearchParams = { sessionId: '0' };
    render(<IstoricDetail />);

    fireEvent.press(screen.getByTestId('istoric-detail-delete-cta'));
    expect(screen.getByTestId('istoric-detail-delete-question')).toBeTruthy();
    fireEvent.press(screen.getByTestId('istoric-detail-delete-accept'));

    expect(replace).toHaveBeenCalledWith('/app/istoric');
    expect(useWorkoutStore.getState().sessionsHistory).toHaveLength(0);
  });
});
