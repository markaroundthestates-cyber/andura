// ══ SETTINGS STORE — Theme + User Preferences Phase 5 task_18 ════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'auto';
// Pulse accent picker (Cont > Appearance). Swaps the primary accent (--brick)
// at runtime among the four Pulse hues. 'volt' = the default app accent.
export type Accent = 'volt' | 'aqua' | 'ember' | 'violet';
export type NotificationFrequency = 'zilnic' | 'saptamanal' | 'off';
export type WeekStart = 'L' | 'D'; // L=Luni (Mon), D=Duminica (Sun)

// L=0, Ma=1, Mi=2, J=3, V=4, S=5, D=6 — array boolean per day
export type WeekDayFlags = readonly [boolean, boolean, boolean, boolean, boolean, boolean, boolean];

interface SettingsState {
  theme: Theme;
  accent: Accent;
  // Account avatar — the picked preset id from the illustrated set
  // (Avatar/registry.ts), or null = initials fallback. A user preference like
  // accent/theme; synced per-UID via the storeSync settings node (LWW).
  avatarId: string | null;
  // First-session coach-marks tutorial — true once the user has finished or
  // skipped the guided bubbles (founder pick 2026-06-12). A user preference like
  // avatarId/accent: persisted + synced per-UID via storeSync. Default false →
  // the overlay shows once for a user who has never trained; never re-shows.
  tutorialSeen: boolean;
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
  setAccent: (a: Accent) => void;
  setAvatar: (id: string | null) => void;
  setTutorialSeen: (v: boolean) => void;
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
  // Pulse primary accent — default Volt (the signature electric lime / --brick).
  accent: 'volt',
  // No preset chosen by default → initials fallback (UserAvatar).
  avatarId: null,
  // Tutorial unseen by default — a fresh user gets the first-session coach-marks.
  tutorialSeen: false,
  notificationsEnabled: true,
  notificationFrequency: 'zilnic',
  notificationDays: [true, true, true, true, true, false, false], // L-V active
  notificationTime: '18:00',
  unitSystem: 'kg',
  weekStart: 'L',
  // Crash reporting DEFAULT-ON (founder pick 2026-06-12) — always-on Sentry
  // crash/error reporting; the user opts OUT via the Privacy toggle. Persisted
  // (partialize below) so a cold/PWA-updated bundle reads the stored value
  // instead of resetting to off. PII is stripped before any envelope is sent
  // (sentry.js beforeSend). Field name kept (`telemetryOptIn`) to avoid a
  // store/sync migration; the user-facing label is "Crash reporting".
  telemetryOptIn: true,
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
      setAccent: (accent) => set({ accent }),
      setAvatar: (avatarId) => set({ avatarId }),
      setTutorialSeen: (tutorialSeen) => set({ tutorialSeen }),
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
        accent: state.accent,
        avatarId: state.avatarId,
        tutorialSeen: state.tutorialSeen,
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
