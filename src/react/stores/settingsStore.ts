// ══ SETTINGS STORE — Theme + User Preferences Phase 5 task_18 ════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'auto';
export type NotificationFrequency = 'zilnic' | 'saptamanal' | 'off';
export type WeekStart = 'L' | 'D'; // L=Luni (Mon), D=Duminica (Sun)

// L=0, Ma=1, Mi=2, J=3, V=4, S=5, D=6 — array boolean per day
export type WeekDayFlags = readonly [boolean, boolean, boolean, boolean, boolean, boolean, boolean];

interface SettingsState {
  theme: Theme;
  notificationsEnabled: boolean;
  notificationFrequency: NotificationFrequency;
  notificationDays: WeekDayFlags; // active days
  notificationTime: string; // HH:MM 24h
  unitSystem: 'kg' | 'lb';
  weekStart: WeekStart;
  telemetryOptIn: boolean;
  dataExportConsent: boolean;
  bottomNavStyle: 'compact' | 'comfortable';
  acceptedDisclaimer: boolean;
  acceptedDisclaimerAt: number | null;
}

interface SettingsActions {
  setTheme: (t: Theme) => void;
  toggleNotifications: () => void;
  setNotificationFrequency: (f: NotificationFrequency) => void;
  toggleNotificationDay: (dayIdx: number) => void;
  setNotificationTime: (hhmm: string) => void;
  setUnitSystem: (u: 'kg' | 'lb') => void;
  setWeekStart: (w: WeekStart) => void;
  setTelemetryOptIn: (v: boolean) => void;
  setDataExportConsent: (v: boolean) => void;
  setBottomNavStyle: (s: 'compact' | 'comfortable') => void;
  acceptDisclaimer: () => void;
  reset: () => void;
}

const DEFAULTS: SettingsState = {
  // Default = Brain Coach mov dark look (CEO pick 2026-05-27). Light cream
  // theme stays available via the Aspect toggle (setTheme).
  theme: 'dark',
  notificationsEnabled: true,
  notificationFrequency: 'zilnic',
  notificationDays: [true, true, true, true, true, false, false], // L-V active
  notificationTime: '18:00',
  unitSystem: 'kg',
  weekStart: 'L',
  telemetryOptIn: false,
  dataExportConsent: true,
  bottomNavStyle: 'comfortable',
  acceptedDisclaimer: false,
  acceptedDisclaimerAt: null,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setTheme: (theme) => set({ theme }),
      toggleNotifications: () =>
        set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
      setNotificationFrequency: (notificationFrequency) => set({ notificationFrequency }),
      toggleNotificationDay: (dayIdx) =>
        set((s) => {
          if (dayIdx < 0 || dayIdx > 6) return s;
          const next = [...s.notificationDays] as boolean[];
          next[dayIdx] = !next[dayIdx];
          return { notificationDays: next as unknown as WeekDayFlags };
        }),
      setNotificationTime: (hhmm) => set({ notificationTime: hhmm }),
      setUnitSystem: (unitSystem) => set({ unitSystem }),
      setWeekStart: (weekStart) => set({ weekStart }),
      setTelemetryOptIn: (telemetryOptIn) => set({ telemetryOptIn }),
      setDataExportConsent: (dataExportConsent) => set({ dataExportConsent }),
      setBottomNavStyle: (bottomNavStyle) => set({ bottomNavStyle }),
      acceptDisclaimer: () =>
        set({ acceptedDisclaimer: true, acceptedDisclaimerAt: Date.now() }),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'wv2-settings-store',
      storage: createJSONStorage(() => localStorage),
      // SUB-CHAT5-004 blueprint consistency — explicit partialize doar data
      // fields (NU actions). Match appStore + scheduleStore + workoutStore
      // existing pattern. Toate user preferences persistate; actions
      // excluded pentru defense-in-depth.
      partialize: (state) => ({
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
        notificationFrequency: state.notificationFrequency,
        notificationDays: state.notificationDays,
        notificationTime: state.notificationTime,
        unitSystem: state.unitSystem,
        weekStart: state.weekStart,
        telemetryOptIn: state.telemetryOptIn,
        dataExportConsent: state.dataExportConsent,
        bottomNavStyle: state.bottomNavStyle,
        acceptedDisclaimer: state.acceptedDisclaimer,
        acceptedDisclaimerAt: state.acceptedDisclaimerAt,
      }) as Partial<SettingsState & SettingsActions>,
    },
  ),
);
