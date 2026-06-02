// ══ W4 PROGRES SCREEN-WAVE TESTS (RNTL) ══════════════════════════════════
// Store-connected proof that the ported Progres tab + its 4 screens + the body
// map render under jest-expo with the MMKV mock + the dual-React moduleNameMapper
// (both infra invariants from the playbook). expo-router is the framework edge
// (useFocusEffect / router / goto) → stubbed. We seed progresStore weight data
// and assert the zone structure, the editable hero, the weight CTAs, the range
// tabs, and the recovery body map render with their stable testIDs.

import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';

// expo-router edges the ported screens touch: goto/goBack (nav.ts → router),
// useFocusEffect (TDEEStrip recompute bump), router.push (ObiectivGoalCard).
// The mock factory builds the jest.fns inline (no hoist hazard); we read them
// back off the mocked `router` import for assertions.
jest.mock('expo-router', () => ({
  __esModule: true,
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true },
  useFocusEffect: (cb: () => void) => {
    const { useEffect } = require('react');
    useEffect(() => {
      cb();
    }, []);
  },
}));

const mockPush = router.push as jest.Mock;

import Progres from '../index';
import LogWeight from '../log-weight';
import WeightLogList from '../weight-log-list';
import WeightTimeline from '../weight-timeline';
import { MuscleBodyMap } from '../../../../components/Progres/MuscleBodyMap';
import { useProgresStore } from '../../../../../src/react/stores/progresStore';
import { useOnboardingStore } from '../../../../../src/react/stores/onboardingStore';
import { useWorkoutStore } from '../../../../../src/react/stores/workoutStore';

function seedEmpty(): void {
  act(() => {
    useProgresStore.setState({ weightLog: [], bodyData: [], targetObiectiv: { weightKg: null, month: null } });
    useOnboardingStore.setState((s) => ({ data: { ...s.data, trainingType: 'gym', sex: 'm' } }));
    useWorkoutStore.setState({ sessionsHistory: [] });
  });
}

function seedWeights(): void {
  const now = Date.now();
  act(() => {
    useProgresStore.setState({
      weightLog: [
        { kg: 80, date: '2026-05-01', ts: now - 3 * 86400000 },
        { kg: 79.4, date: '2026-05-15', ts: now - 86400000 },
        { kg: 79, date: '2026-06-01', ts: now },
      ],
      bodyData: [],
      targetObiectiv: { weightKg: null, month: null },
    });
  });
}

describe('Progres tab root', () => {
  beforeEach(() => {
    mockPush.mockClear();
    seedEmpty();
  });

  it('renders the zone story with the AZI hero + obiectiv + actiuni zones', async () => {
    render(<Progres />);
    // Settle the async getCoachToday().then(setCoach) state update.
    await act(async () => {});
    expect(screen.getByTestId('progres-home')).toBeTruthy();
    expect(screen.getByTestId('progres-zone-azi')).toBeTruthy();
    expect(screen.getByTestId('tdee-strip')).toBeTruthy();
    expect(screen.getByTestId('progres-zone-obiectiv')).toBeTruthy();
    expect(screen.getByTestId('progres-zone-actiuni')).toBeTruthy();
    expect(screen.getByTestId('cta-log-weight')).toBeTruthy();
  });

  it('hides the TENDINTA trend zone with <2 weight points', async () => {
    render(<Progres />);
    await act(async () => {});
    expect(screen.queryByTestId('progres-zone-tendinta')).toBeNull();
    // No last weight → no timeline CTA.
    expect(screen.queryByTestId('cta-weight-timeline')).toBeNull();
  });

  it('shows the TENDINTA sparkline + timeline CTA once there are >=2 points', async () => {
    seedWeights();
    render(<Progres />);
    await act(async () => {});
    expect(screen.getByTestId('progres-zone-tendinta')).toBeTruthy();
    expect(screen.getByTestId('progres-trend-sparkline')).toBeTruthy();
    expect(screen.getByTestId('cta-weight-timeline')).toBeTruthy();
  });

  it('log-weight CTA navigates to the log screen', async () => {
    render(<Progres />);
    await act(async () => {});
    fireEvent.press(screen.getByTestId('cta-log-weight'));
    expect(mockPush).toHaveBeenCalledWith('/app/progres/log-weight');
  });
});

describe('LogWeight screen', () => {
  beforeEach(() => {
    mockPush.mockClear();
    seedEmpty();
  });

  it('renders fields + blocks save until a valid weight is entered', () => {
    render(<LogWeight />);
    expect(screen.getByTestId('log-weight')).toBeTruthy();
    const save = screen.getByTestId('weight-save');
    // Empty → invalid → noop on press (no navigation).
    fireEvent.press(save);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('surfaces a range error for an out-of-range weight', () => {
    render(<LogWeight />);
    fireEvent.changeText(screen.getByTestId('weight-kg-input'), '12');
    expect(screen.getByTestId('weight-kg-error')).toBeTruthy();
  });

  it('saves a valid entry to the store and navigates back to progres', () => {
    render(<LogWeight />);
    fireEvent.changeText(screen.getByTestId('weight-kg-input'), '78.5');
    fireEvent.press(screen.getByTestId('weight-save'));
    expect(useProgresStore.getState().weightLog.some((w) => w.kg === 78.5)).toBe(true);
    expect(mockPush).toHaveBeenCalledWith('/app/progres');
  });
});

describe('WeightLogList screen', () => {
  beforeEach(() => seedEmpty());

  it('shows the empty state with no entries', () => {
    render(<WeightLogList />);
    expect(screen.getByTestId('weight-log-list')).toBeTruthy();
    expect(screen.getByTestId('weight-log-empty')).toBeTruthy();
  });

  it('lists entries reverse-chrono when weights exist', () => {
    seedWeights();
    render(<WeightLogList />);
    expect(screen.queryByTestId('weight-log-empty')).toBeNull();
    // Newest first → row 0 = the most recent ts (79 kg).
    expect(screen.getByTestId('weight-log-row-0')).toBeTruthy();
    expect(screen.getByTestId('weight-log-row-2')).toBeTruthy();
  });
});

describe('WeightTimeline screen', () => {
  beforeEach(() => {
    mockPush.mockClear();
    seedEmpty();
  });

  it('renders range tabs + an empty KPI when there is no data', () => {
    render(<WeightTimeline />);
    expect(screen.getByTestId('weight-timeline')).toBeTruthy();
    expect(screen.getByTestId('weight-timeline-range-tabs')).toBeTruthy();
    expect(screen.getByTestId('weight-timeline-kpi-empty')).toBeTruthy();
  });

  it('renders the chart + KPI value once weights exist and switches range', () => {
    seedWeights();
    render(<WeightTimeline />);
    expect(screen.getByTestId('weight-timeline-kpi-value')).toBeTruthy();
    // Switch to "all" so all 3 seeded points are in-window regardless of clock.
    fireEvent.press(screen.getByTestId('weight-timeline-range-all'));
    expect(screen.getByTestId('weight-timeline-chart-svg')).toBeTruthy();
  });
});

describe('MuscleBodyMap', () => {
  beforeEach(() => {
    act(() => {
      useOnboardingStore.setState((s) => ({ data: { ...s.data, sex: 'm', trainingType: 'gym' } }));
      useWorkoutStore.setState({ sessionsHistory: [] });
    });
  });

  it('renders the photoreal body + legend + readout, and toggles front/back', () => {
    render(<MuscleBodyMap />);
    expect(screen.getByTestId('muscle-body-map')).toBeTruthy();
    expect(screen.getByTestId('body-map-image')).toBeTruthy();
    expect(screen.getByTestId('body-map-legend')).toBeTruthy();
    expect(screen.getByTestId('body-map-readout')).toBeTruthy();
    // Cold (no sessions) → empty note present.
    expect(screen.getByTestId('body-map-empty')).toBeTruthy();
    // View toggle flips to back.
    fireEvent.press(screen.getByTestId('body-map-view-back'));
    expect(screen.getByTestId('body-map-image')).toBeTruthy();
  });
});
