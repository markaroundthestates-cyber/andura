import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../../stores/settingsStore';

beforeEach(() => {
  useSettingsStore.getState().reset();
  localStorage.clear();
});

describe('settingsStore — task_18', () => {
  it('defaults dark theme + notifications on + kg units + disclaimer false', () => {
    const s = useSettingsStore.getState();
    expect(s.theme).toBe('dark');
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
    useSettingsStore.getState().setTheme('light');
    useSettingsStore.getState().acceptDisclaimer();
    useSettingsStore.getState().reset();
    expect(useSettingsStore.getState().theme).toBe('dark');
    expect(useSettingsStore.getState().acceptedDisclaimer).toBe(false);
  });
});

// #6 fix 2026-06-12 — crash reporting (telemetryOptIn) DEFAULT-ON + opt-out that
// survives reload/PWA-update (persisted, not reset to off on a cold bundle).
describe('settingsStore — crash reporting default-ON + opt-out persistence', () => {
  it('telemetryOptIn defaults to true (crash reporting ON by default)', () => {
    expect(useSettingsStore.getState().telemetryOptIn).toBe(true);
  });

  it('opt-out is persisted to localStorage (survives a cold/updated bundle)', () => {
    useSettingsStore.getState().setTelemetryOptIn(false);
    // The zustand persist payload is what a fresh bundle rehydrates from on the
    // next load. A cold bundle must read this stored `false`, NOT reset to ON.
    const persisted = JSON.parse(localStorage.getItem('wv2-settings-store') ?? '{}');
    expect(persisted.state.telemetryOptIn).toBe(false);
  });

  it('opt-back-in is persisted too (toggle round-trips)', () => {
    useSettingsStore.getState().setTelemetryOptIn(false);
    useSettingsStore.getState().setTelemetryOptIn(true);
    const persisted = JSON.parse(localStorage.getItem('wv2-settings-store') ?? '{}');
    expect(persisted.state.telemetryOptIn).toBe(true);
  });
});
