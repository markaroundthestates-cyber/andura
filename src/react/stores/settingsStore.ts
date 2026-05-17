// ══ SETTINGS STORE — Theme + User Preferences Phase 5 task_18 ════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'auto';

interface SettingsState {
  theme: Theme;
  notificationsEnabled: boolean;
  unitSystem: 'kg' | 'lb';
  acceptedDisclaimer: boolean;
  acceptedDisclaimerAt: number | null;
}

interface SettingsActions {
  setTheme: (t: Theme) => void;
  toggleNotifications: () => void;
  setUnitSystem: (u: 'kg' | 'lb') => void;
  acceptDisclaimer: () => void;
  reset: () => void;
}

const DEFAULTS: SettingsState = {
  theme: 'light',
  notificationsEnabled: true,
  unitSystem: 'kg',
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
      setUnitSystem: (unitSystem) => set({ unitSystem }),
      acceptDisclaimer: () =>
        set({ acceptedDisclaimer: true, acceptedDisclaimerAt: Date.now() }),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'wv2-settings-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
