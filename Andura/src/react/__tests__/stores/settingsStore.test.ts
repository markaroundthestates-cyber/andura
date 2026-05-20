import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../../stores/settingsStore';

beforeEach(() => {
  useSettingsStore.getState().reset();
  localStorage.clear();
});

describe('settingsStore — task_18', () => {
  it('defaults light theme + notifications on + kg units + disclaimer false', () => {
    const s = useSettingsStore.getState();
    expect(s.theme).toBe('light');
    expect(s.notificationsEnabled).toBe(true);
    expect(s.unitSystem).toBe('kg');
    expect(s.acceptedDisclaimer).toBe(false);
  });

  it('setTheme persists', () => {
    useSettingsStore.getState().setTheme('dark');
    expect(useSettingsStore.getState().theme).toBe('dark');
    useSettingsStore.getState().setTheme('auto');
    expect(useSettingsStore.getState().theme).toBe('auto');
  });

  it('toggleNotifications flips', () => {
    expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
    useSettingsStore.getState().toggleNotifications();
    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
    useSettingsStore.getState().toggleNotifications();
    expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
  });

  it('setUnitSystem switches', () => {
    useSettingsStore.getState().setUnitSystem('lb');
    expect(useSettingsStore.getState().unitSystem).toBe('lb');
  });

  it('acceptDisclaimer sets flag + timestamp', () => {
    useSettingsStore.getState().acceptDisclaimer();
    expect(useSettingsStore.getState().acceptedDisclaimer).toBe(true);
    expect(typeof useSettingsStore.getState().acceptedDisclaimerAt).toBe('number');
  });

  it('reset restores defaults', () => {
    useSettingsStore.getState().setTheme('dark');
    useSettingsStore.getState().acceptDisclaimer();
    useSettingsStore.getState().reset();
    expect(useSettingsStore.getState().theme).toBe('light');
    expect(useSettingsStore.getState().acceptedDisclaimer).toBe(false);
  });
});
