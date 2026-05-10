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
  currentScreen: 'antrenor', // Router state — intra-Antrenor sub-page id (antrenor | energy-check | energy-cause | ceva-nu-merge | pain-button | equipment-swap | workout | post-rpe)
  cevaNuMergeReason: null,   // Fan-out routing context — null | 'pain' | 'equipment' | 'altceva'
};

// Convenience destructure helpers (read-only snapshots)
export const getState = () => state;
