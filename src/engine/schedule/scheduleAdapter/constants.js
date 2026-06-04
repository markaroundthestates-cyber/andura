// ══ SCHEDULE ADAPTER — shared storage keys + day labels ═══════════════════
// Split out of scheduleAdapter.js (barrel preserved). Shared constants used
// across the per-topic modules. ZERO behavior change.

export const CALENDAR_OVERRIDE_KEY = 'wv2-calendar-override';
export const MISSING_EQUIPMENT_KEY = 'wv2-missing-equipment';
// The React scheduleStore persists the weekly training/rest pattern the Calendar
// UI DISPLAYS here (zustand persist envelope: { state: { days: [...] } }). The
// engine reads it so its active-day week matches what the user sees even when no
// explicit calendar edit was committed (no override). Keep in sync with
// scheduleStore.ts persist `name`.
export const SCHEDULE_STORE_KEY = 'wv2-schedule-store';

// Day labels — local naming Calendar V1 spec verbatim:
//   L=Monday, M=Tuesday, M2=Wednesday (Miercuri), J=Thursday, V=Friday, S=Saturday, D=Sunday
export const DAY_INDICES = Object.freeze({ L: 0, M: 1, M2: 2, J: 3, V: 4, S: 5, D: 6 });
export const DAY_LABELS = Object.freeze(['L', 'M', 'M2', 'J', 'V', 'S', 'D']);

// User-facing equipment IDs surfaced in screen-aparate-lipsa picker — parity
// mockup S1.7 demo JS APARATE_LIPSA_VALID_IDS constant. 10 entries:
export const VALID_EQUIPMENT_IDS = Object.freeze([
  'banca-inclinata', 'banca-plana', 'bara-halterelor', 'gantere', 'aparat-cablu',
  'power-rack', 'leg-press', 'aparat-extensii', 'aparat-tractiuni', 'banda-elastica'
]);
