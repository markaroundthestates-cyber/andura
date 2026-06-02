// ══ W6a CONT — store-connected RNTL proof ═════════════════════════════════
// Proves the ported Cont CORE screens render under jest with the MMKV mock +
// kv-backed Zustand stores, and that the wired handlers drive real store state.
// expo-router is the only framework edge (nav shim) — stubbed. These are the
// W6a screens: Cont hub, SettingsProfile, SettingsAppearance, SettingsPrefs,
// SettingsNotifications.

import { render, screen, fireEvent, act } from '@testing-library/react-native';

// Nav shim edge — stub expo-router's imperative router + pathname. The factory
// returns a fresh router object; the test reads its push spy via `router`.
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), canGoBack: () => true, back: jest.fn() },
  usePathname: () => '/app/cont',
}));

import { router } from 'expo-router';
const mockPush = router.push as jest.Mock;

import Cont from '../index';
import SettingsProfile from '../settings-profile';
import SettingsAppearance from '../settings-appearance';
import SettingsPrefs from '../settings-prefs';
import SettingsNotifications from '../settings-notifications';
import { useOnboardingStore } from '../../../../../src/react/stores/onboardingStore';
import { useSettingsStore } from '../../../../../src/react/stores/settingsStore';

describe('W6a Cont core (store-connected)', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('Cont hub renders all sections + rows and navigates on a row press', () => {
    render(<Cont />);
    expect(screen.getByTestId('cont-home')).toBeTruthy();
    expect(screen.getByTestId('cont-section-cont')).toBeTruthy();
    expect(screen.getByTestId('cont-section-danger')).toBeTruthy();
    expect(screen.getByTestId('cont-account-initial')).toBeTruthy();
    expect(screen.getByTestId('cont-version')).toBeTruthy();

    fireEvent.press(screen.getByTestId('cont-row-profile'));
    expect(mockPush).toHaveBeenCalledWith('/app/cont/settings-profile');
  });

  it('SettingsProfile renders the sections + saves edited Big 6 to the store', () => {
    act(() => {
      useOnboardingStore.setState((s) => ({
        data: { ...s.data, age: 30, weight: 80, height: 180, sex: 'm' },
      }));
    });
    render(<SettingsProfile />);
    expect(screen.getByTestId('settings-profile')).toBeTruthy();
    expect(screen.getByTestId('profile-age-input')).toBeTruthy();
    expect(screen.getByTestId('profile-sex-select')).toBeTruthy();

    // Edit age then save → store reflects it.
    fireEvent.changeText(screen.getByTestId('profile-age-input'), '34');
    fireEvent.press(screen.getByTestId('settings-profile-save'));
    expect(useOnboardingStore.getState().data.age).toBe(34);
    expect(screen.getByTestId('settings-profile-saved')).toBeTruthy();
  });

  it('SettingsAppearance accent swatch press writes the settings store', () => {
    render(<SettingsAppearance />);
    expect(screen.getByTestId('settings-appearance')).toBeTruthy();
    fireEvent.press(screen.getByTestId('cont-accent-aqua'));
    expect(useSettingsStore.getState().accent).toBe('aqua');
  });

  it('SettingsPrefs week-start toggle writes the store + advanced row navigates', () => {
    render(<SettingsPrefs />);
    expect(screen.getByTestId('settings-prefs')).toBeTruthy();
    fireEvent.press(screen.getByTestId('week-start-D'));
    expect(useSettingsStore.getState().weekStart).toBe('D');
    fireEvent.press(screen.getByTestId('advanced-reset-coach'));
    expect(mockPush).toHaveBeenCalledWith('/app/cont/reset-coach-confirm');
  });

  it('SettingsNotifications renders the controls (master toggle + day picker + events)', () => {
    render(<SettingsNotifications />);
    expect(screen.getByTestId('settings-notifications')).toBeTruthy();
    expect(screen.getByTestId('notif-master-toggle')).toBeTruthy();
    expect(screen.getByTestId('notif-day-picker')).toBeTruthy();
    expect(screen.getByTestId('notif-events-antrenament')).toBeTruthy();
    expect(screen.getByTestId('notif-time-input')).toBeTruthy();
  });
});
