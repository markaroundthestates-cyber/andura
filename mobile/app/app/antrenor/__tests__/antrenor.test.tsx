// ══ W3a — ANTRENOR HUB + FLOW screens (store-connected, RNTL) ═════════════
// Proves the ported Antrenor-tab screens render under jest with the MMKV mock
// (kv-backed Zustand persist) + the dual-React moduleNameMapper. expo-router is
// the only framework edge; it is stubbed per-file. The engine aggregates
// (getCoachToday / getTodayWorkout) resolve to null fallbacks under jest with no
// seeded data — the screens must still render their honest baselines.

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false },
  usePathname: () => '/app/antrenor',
  useLocalSearchParams: () => ({}),
}));

import { router } from 'expo-router';
const pushMock = router.push as jest.Mock;

import Antrenor from '../index';
import EnergyCheck from '../energy-check';
import EnergyCause from '../energy-cause';
import WorkoutPreview from '../workout-preview';
import { useWorkoutStore } from '../../../../../src/react/stores/workoutStore';
import { useOnboardingStore } from '../../../../../src/react/stores/onboardingStore';
import { useCoachStore } from '../../../../../src/react/stores/coachStore';
import { t } from '../../../../../src/i18n/index.js';

function resetStores(trainingType: 'gym' | 'aerobic' | 'both' = 'gym'): void {
  useWorkoutStore.setState({
    phase: 'idle',
    sessionStart: null,
    pausedSnapshot: null,
    lastSession: null,
    exIdx: 0,
    prHit: false,
    sessionsHistory: [],
    sessionTimeBudgetMin: null,
  });
  useOnboardingStore.setState((s) => ({ data: { ...s.data, trainingType } }));
  useCoachStore.setState({ schedContext: 'workout', reactivateDismissed: false });
}

describe('Antrenor hub (W3a)', () => {
  beforeEach(() => {
    pushMock.mockClear();
    resetStores('gym');
  });

  it('renders the gym Coach home with the header date + readiness hero', async () => {
    render(<Antrenor />);
    expect(screen.getByTestId('antrenor-home')).toBeTruthy();
    expect(screen.getByTestId('antrenor-header-date')).toBeTruthy();
    // Readiness hero is always present; with no seeded readiness it shows the
    // honest empty microcopy (engine refuses a fabricated score at T0).
    await waitFor(() => expect(screen.getByTestId('readiness-hero')).toBeTruthy());
    expect(screen.getByTestId('readiness-empty-microcopy')).toBeTruthy();
  });

  it('renders the aerobic dashboard when trainingType=aerobic', async () => {
    resetStores('aerobic');
    render(<Antrenor />);
    expect(screen.getByTestId('aerobic-coach')).toBeTruthy();
    expect(screen.getByTestId('aerobic-log-cta')).toBeTruthy();
    expect(screen.queryByTestId('antrenor-home')).toBeNull();
  });

  it('shows the resume-session card when a session is paused', async () => {
    // Paused mode is derived from a non-null pausedSnapshot (phase stays 'idle').
    act(() => {
      useWorkoutStore.setState({
        pausedSnapshot: {
          title: 'Push',
          meta: '',
          exIdx: 1,
          setIdx: 0,
          phase: 'logging',
          history: {},
          sessionStart: Date.now() - 600000,
        },
      });
    });
    render(<Antrenor />);
    await waitFor(() => expect(screen.getByTestId('resume-session-card')).toBeTruthy());
  });
});

describe('EnergyCheck (W3a)', () => {
  beforeEach(() => {
    pushMock.mockClear();
    resetStores('gym');
  });

  it('renders the 5 energy options + time-budget chips', () => {
    render(<EnergyCheck />);
    expect(screen.getByTestId('energy-check')).toBeTruthy();
    expect(screen.getByTestId('energy-time-budget')).toBeTruthy();
    expect(screen.getByTestId('time-chip-30')).toBeTruthy();
    expect(screen.getByTestId('time-chip-nolimit')).toBeTruthy();
  });

  it('routes a "minus" pick to energy-cause and a "normal" pick to workout-preview', () => {
    render(<EnergyCheck />);
    // "Obosit" (tired) → intensity minus → energy-cause.
    fireEvent.press(screen.getByText(t('energyCheck.levels.tired')));
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/app/antrenor/energy-cause' }),
    );
    pushMock.mockClear();
    // "Bine" (good) → intensity normal → workout-preview.
    fireEvent.press(screen.getByText(t('energyCheck.levels.good')));
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/app/antrenor/workout-preview' }),
    );
  });

  it('toggles a time-budget chip into the store', () => {
    render(<EnergyCheck />);
    fireEvent.press(screen.getByTestId('time-chip-45'));
    expect(useWorkoutStore.getState().sessionTimeBudgetMin).toBe(45);
  });
});

describe('EnergyCause (W3a)', () => {
  beforeEach(() => {
    pushMock.mockClear();
    resetStores('gym');
  });

  it('renders the cause options + the mandatory skip', () => {
    render(<EnergyCause />);
    expect(screen.getByTestId('energy-cause')).toBeTruthy();
    expect(screen.getByTestId('energy-cause-skip')).toBeTruthy();
    expect(screen.getByText(t('energyCause.causes.sleep'))).toBeTruthy();
  });

  it('forwards the picked cause to workout-preview', () => {
    render(<EnergyCause />);
    fireEvent.press(screen.getByText(t('energyCause.causes.sleep')));
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/app/antrenor/workout-preview',
        params: expect.objectContaining({ cause: 'Dormit putin' }),
      }),
    );
  });
});

describe('WorkoutPreview (W3a)', () => {
  beforeEach(() => {
    pushMock.mockClear();
    resetStores('gym');
  });

  it('renders the preview hero + exercise list (engine-null → demo fallback)', async () => {
    render(<WorkoutPreview />);
    expect(screen.getByTestId('workout-preview')).toBeTruthy();
    expect(screen.getByTestId('preview-hero')).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId('preview-exercise-list')).toBeTruthy());
    expect(screen.getAllByTestId('preview-exercise-row').length).toBeGreaterThan(0);
  });

  it('starts the session (sets context + routes to workout)', async () => {
    render(<WorkoutPreview />);
    await waitFor(() => expect(screen.getByTestId('preview-start-cta')).toBeTruthy());
    fireEvent.press(screen.getByTestId('preview-start-cta'));
    expect(pushMock).toHaveBeenCalledWith('/app/antrenor/workout');
  });
});
