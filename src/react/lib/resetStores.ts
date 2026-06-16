// ══ RESET IN-MEMORY STORES — shared store-wipe helper ══════════════════════
// The in-memory half of a clean-slate user-data wipe: resets every wv2 Zustand
// store to its empty/default state. Extracted so it can be reused by BOTH:
//
//   - LogoutConfirm.wipeLocalUserDataOnLogout (UI shows empty state instantly;
//     it pairs this with the localStorage + IndexedDB wipe).
//   - runPostAuthSync on a detected account switch (a different account
//     authenticated on a still-authed browser with NO page reload) — the
//     in-memory stores still hold the PRIOR user's state. enforceDataOwner
//     already wiped localStorage + IndexedDB, but NOT the in-memory stores, so
//     the subsequent hydrateStoresFromCloud would mergeArrayUnion the prior
//     user's in-memory data with the new user's cloud → A's sessions leak into
//     B's UI AND get pushed to B's cloud (permanent contamination). Calling this
//     BEFORE the hydrate makes the merge land on an EMPTY local baseline.
//
// This is the IN-MEMORY portion only — it deliberately does NOT touch
// localStorage / IndexedDB (the switch path's enforceDataOwner owns that, and
// re-recording the new data-owner; the logout path owns its own
// wipeUserDataOnLogout call). Keep this set in sync with any new wv2 store.

import { useWorkoutStore } from '../stores/workoutStore';
import { useNutritionStore } from '../stores/nutritionStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useScheduleStore } from '../stores/scheduleStore';
import { useProgresStore } from '../stores/progresStore';
import { useAerobicStore } from '../stores/aerobicStore';
import { useCoachStore } from '../stores/coachStore';

/**
 * Reset every wv2 Zustand store to its empty/default in-memory state. Best-
 * effort — wrapped so a single store's reset throwing never aborts the rest (or
 * the caller's flow). Does NOT touch localStorage / IndexedDB.
 */
export function resetInMemoryStores(): void {
  try {
    useWorkoutStore.getState().reset();
    useWorkoutStore.getState().resetStreak();
    useWorkoutStore.setState({ lastSession: null, sessionsHistory: [] });
    useNutritionStore.getState().reset();
    useOnboardingStore.getState().reset();
    useSettingsStore.getState().reset();
    useScheduleStore.getState().resetWeekly();
    useProgresStore.getState().reset();
    useAerobicStore.getState().reset();
    useCoachStore.setState({ schedContext: 'workout', persona: 'gigica', reactivateDismissed: false });
  } catch {
    // Non-fatal — never block the caller (logout navigate / post-auth sync).
  }
}
