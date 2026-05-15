// ══ SESSION STATE ═══════════════════════════════════════════
// Mutable object — ES modules can mutate object properties freely

export const state = {
  sessActive: false,
  sessStart: null,
  sessTimer: null,
  sessLog: [],
  currentEx: '',
  currentSet: 1,
  awaitingRPE: false,
  sessRepsInput: 10,
  sessionKgOverride: null,
  completedExercises: new Set(),
  dropSetUsedThisSession: false,
  pauseTimer: null,
  pauseTotal: 0,
  pauseLeft: 0,
  lastPauseEndedAt: null,
  isMuted: false,
  activeNotes: new Set(),
  logDateOffset: 0,
  sessionTotalExercises: 0,
  sessKcalBurn: 0,
  earlyStopReason: null,
  cdlEntryId: null,
  sessType: null,
  lastSetRPE: null,
  currentScreen: 'antrenor', // Router state — intra-Antrenor sub-page id (antrenor | energy-check | energy-cause | workout-preview | ceva-nu-merge | pain-button | equipment-swap | aparate-lipsa | workout | post-rpe | medical-disclaimer)
  cevaNuMergeReason: null,   // Fan-out routing context — null | 'pain' | 'equipment' | 'altceva'
  previewRefusalsByExercise: {},     // Bundle 4 NEW — ephemeral preview cascade tracking, Map<exerciseName, string[]> reset on workout-preview enter
  midSessionRefusalsByExercise: {},  // Bundle 4 NEW — ephemeral mid-session cascade tracking, Map<exerciseName, string[]> reset on workout enter
};

// Convenience destructure helpers (read-only snapshots)
export const getState = () => state;
