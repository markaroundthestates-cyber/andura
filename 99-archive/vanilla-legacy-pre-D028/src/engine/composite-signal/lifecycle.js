// ══ COMPOSITE SIGNAL §36.41 — Lifecycle (detection → cooldown → resolution) ══

const COOLDOWN_SESSIONS = 3;       // post-flag, NU re-trigger
const RESOLUTION_CLEAN_SESSIONS = 2; // 2 sesiuni clean → flag cleared

/**
 * @typedef {Object} CompositeSignalState
 * @property {'idle'|'flagged'|'cooldown'|'resolving'} status
 * @property {number} sessionsInState
 */

/**
 * Advance state based on session outcome (clean = no trigger detected).
 * @param {CompositeSignalState} state
 * @param {{ triggerDetected: boolean }} session
 * @returns {CompositeSignalState}
 */
export function advanceLifecycle(state, session) {
  switch (state.status) {
    case 'idle':
      if (session.triggerDetected) return { status: 'flagged', sessionsInState: 0 };
      return state;
    case 'flagged':
      return { status: 'cooldown', sessionsInState: 0 };
    case 'cooldown':
      if (state.sessionsInState + 1 >= COOLDOWN_SESSIONS) return { status: 'resolving', sessionsInState: 0 };
      return { status: 'cooldown', sessionsInState: state.sessionsInState + 1 };
    case 'resolving':
      if (session.triggerDetected) return { status: 'flagged', sessionsInState: 0 };
      if (state.sessionsInState + 1 >= RESOLUTION_CLEAN_SESSIONS) return { status: 'idle', sessionsInState: 0 };
      return { status: 'resolving', sessionsInState: state.sessionsInState + 1 };
    default:
      return state;
  }
}

export const COMPOSITE_SIGNAL_LIFECYCLE = {
  COOLDOWN_SESSIONS,
  RESOLUTION_CLEAN_SESSIONS,
};
