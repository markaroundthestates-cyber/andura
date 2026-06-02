// ══ W3c — ANTRENOR FRICTION screens + ScheduleDayPreviewSheet (RNTL) ═══════
// Proves the ported friction screens (ceva-nu-merge / pain-button /
// equipment-swap / aparate-lipsa / schedule-override) and the real engine-backed
// ScheduleDayPreviewSheet render under jest with the MMKV mock + dual-React
// moduleNameMapper, and that the wired handlers drive the real routing + store
// + persistence contracts. expo-router is the only framework edge — stubbed.
// The engine aggregates resolve to null fallbacks under jest with no seeded
// data, so the screens render their honest baselines.

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false },
  usePathname: () => '/app/antrenor',
  useLocalSearchParams: () => ({}),
}));

import { router } from 'expo-router';
const pushMock = router.push as jest.Mock;
const backMock = router.back as jest.Mock;

import CevaNuMerge from '../ceva-nu-merge';
import PainButton from '../pain-button';
import EquipmentSwap from '../equipment-swap';
import AparateLipsa from '../aparate-lipsa';
import ScheduleOverride from '../schedule-override';
import { ScheduleDayPreviewSheet } from '../../../../components/Calendar/ScheduleDayPreviewSheet';
import { useWorkoutStore } from '../../../../../src/react/stores/workoutStore';
import { t } from '../../../../../src/i18n/index.js';

beforeEach(() => {
  pushMock.mockClear();
  backMock.mockClear();
});

describe('CevaNuMerge (W3c)', () => {
  it('renders the problem picker with all 5 options', () => {
    render(<CevaNuMerge />);
    expect(screen.getByTestId('ceva-nu-merge')).toBeTruthy();
    expect(screen.getByTestId('ceva-nu-merge-option-pain')).toBeTruthy();
    expect(screen.getByTestId('ceva-nu-merge-option-equipment-busy')).toBeTruthy();
    expect(screen.getByTestId('ceva-nu-merge-option-equipment-missing')).toBeTruthy();
    expect(screen.getByTestId('ceva-nu-merge-option-override')).toBeTruthy();
    expect(screen.getByTestId('ceva-nu-merge-option-cancel')).toBeTruthy();
  });

  it('routes pain → pain-button (plain path)', () => {
    render(<CevaNuMerge />);
    fireEvent.press(screen.getByTestId('ceva-nu-merge-option-pain'));
    expect(pushMock).toHaveBeenCalledWith('/app/antrenor/pain-button');
  });

  it('routes aparate-lipsa with the from:workout origin tag', () => {
    render(<CevaNuMerge />);
    fireEvent.press(screen.getByTestId('ceva-nu-merge-option-equipment-missing'));
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/app/antrenor/aparate-lipsa',
        params: { from: 'workout' },
      }),
    );
  });
});

describe('PainButton (W3c)', () => {
  beforeEach(() => {
    act(() => {
      useWorkoutStore.setState({ sessionStart: null });
    });
  });

  it('renders the region grid + intensity + closing medical cue', () => {
    render(<PainButton />);
    expect(screen.getByTestId('pain-button')).toBeTruthy();
    expect(screen.getByTestId('pain-region-gat')).toBeTruthy();
    expect(screen.getByTestId('pain-intensity-1')).toBeTruthy();
    expect(screen.getByTestId('pain-medical-cue')).toBeTruthy();
  });

  it('keeps Continue inert until a region is picked, then routes to workout-preview pre-session', () => {
    render(<PainButton />);
    // No region picked → Continue does nothing.
    fireEvent.press(screen.getByTestId('pain-continue'));
    expect(pushMock).not.toHaveBeenCalled();
    // Pick a region → Continue forwards painContext + intensityMod to preview.
    fireEvent.press(screen.getByTestId('pain-region-spate'));
    fireEvent.press(screen.getByTestId('pain-continue'));
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/app/antrenor/workout-preview',
        params: expect.objectContaining({ intensityMod: 'minus' }),
      }),
    );
  });

  it('routes back to /workout when a live session is active (in-session adapt)', () => {
    act(() => {
      useWorkoutStore.setState({ sessionStart: Date.now() });
    });
    render(<PainButton />);
    fireEvent.press(screen.getByTestId('pain-region-spate'));
    fireEvent.press(screen.getByTestId('pain-continue'));
    expect(pushMock).toHaveBeenCalledWith('/app/antrenor/workout');
    expect(useWorkoutStore.getState().sessionContext?.intensityMod).toBe('minus');
  });
});

describe('EquipmentSwap (W3c)', () => {
  it('renders the equipment list + continue forwards busyCoarseTypes', async () => {
    render(<EquipmentSwap />);
    expect(screen.getByTestId('equipment-swap')).toBeTruthy();
    expect(screen.getByTestId('equipment-item-bench')).toBeTruthy();
    // Mark a station busy → continue forwards an equipmentContext param.
    fireEvent.press(screen.getByTestId('equipment-item-bench'));
    fireEvent.press(screen.getByTestId('equipment-continue'));
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/app/antrenor/workout-preview',
        params: expect.objectContaining({ equipmentContext: expect.any(String) }),
      }),
    );
    const arg = pushMock.mock.calls[0]![0] as { params: { equipmentContext: string } };
    const ctx = JSON.parse(arg.params.equipmentContext);
    expect(ctx.busyCoarseTypes).toContain('barbell');
    // Flush the async getTodayWorkout().then setExercises so its state update
    // settles inside act() (the list is static; this only quiets the warning).
    await waitFor(() => expect(screen.getByTestId('equipment-item-bench')).toBeTruthy());
  });
});

describe('AparateLipsa (W3c)', () => {
  it('renders the 10-item checklist + saves to Cont (no workout origin)', () => {
    render(<AparateLipsa />);
    expect(screen.getByTestId('aparate-lipsa')).toBeTruthy();
    expect(screen.getByTestId('aparate-lipsa-item-gantere')).toBeTruthy();
    fireEvent.press(screen.getByTestId('aparate-lipsa-item-gantere'));
    fireEvent.press(screen.getByTestId('aparate-save'));
    // No from:workout origin → returns to Cont.
    expect(pushMock).toHaveBeenCalledWith('/app/cont');
  });
});

describe('ScheduleOverride (W3c)', () => {
  it('renders the 3 override options + routes a pick to workout-preview', () => {
    render(<ScheduleOverride />);
    expect(screen.getByTestId('schedule-override')).toBeTruthy();
    expect(screen.getByTestId('schedule-override-option-easier')).toBeTruthy();
    expect(screen.getByTestId('schedule-override-option-harder')).toBeTruthy();
    expect(screen.getByTestId('schedule-override-option-different-muscle')).toBeTruthy();
    fireEvent.press(screen.getByTestId('schedule-override-option-easier'));
    expect(pushMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/app/antrenor/workout-preview',
        params: { overrideKind: 'easier', intensityMod: 'minus' },
      }),
    );
  });
});

describe('ScheduleDayPreviewSheet (W3c)', () => {
  it('renders nothing when closed', () => {
    render(
      <ScheduleDayPreviewSheet open={false} dayIdx={null} dayKind="rest" dayLabel="L" onClose={() => {}} />,
    );
    expect(screen.queryByTestId('schedule-day-preview-sheet')).toBeNull();
  });

  it('shows the honest rest copy for a rest day (engine not invoked)', () => {
    render(
      <ScheduleDayPreviewSheet open dayIdx={2} dayKind="rest" dayLabel="Mie" onClose={() => {}} />,
    );
    expect(screen.getByTestId('schedule-day-preview-sheet')).toBeTruthy();
    expect(screen.getByTestId('schedule-day-preview-rest')).toBeTruthy();
    expect(screen.getByText(t('calendar.dayPreview.restBody'))).toBeTruthy();
  });

  it('reaches an honest state on a training day (loading → empty/list, engine-null safe)', async () => {
    const onClose = jest.fn();
    render(
      <ScheduleDayPreviewSheet open dayIdx={0} dayKind="training" dayLabel="L" onClose={onClose} />,
    );
    expect(screen.getByTestId('schedule-day-preview-sheet')).toBeTruthy();
    // Engine resolves async; under jest with no seeded data it settles to the
    // honest empty state (no fabricated session) — never throws.
    await waitFor(() =>
      expect(
        screen.queryByTestId('schedule-day-preview-empty') ||
          screen.queryByTestId('schedule-day-preview-list'),
      ).toBeTruthy(),
    );
    fireEvent.press(screen.getByTestId('schedule-day-preview-close'));
    expect(onClose).toHaveBeenCalled();
  });
});
