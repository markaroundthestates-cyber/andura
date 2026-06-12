// ══ TUTORIAL — first-session coach-mark steps (data) ══════════════════════
// The 5-step storyboard for Gigel's first session, adapted from the concept
// mockup (04-architecture/mockups/design-pass-2026-06-12/05-tutorial.html) to
// the REAL current testids. One idea per bubble, short Gigel-friendly copy.
//
// Each step anchors to an EXISTING data-testid. The CoachMarks engine measures
// that element at runtime (getBoundingClientRect) and spotlights it. When an
// anchor is absent on the mounted screen (e.g. the in-session dock/rating cards
// are not present on the Coach home), the step degrades to a CENTERED bubble
// with no spotlight — exactly the mockup's `spot:null` fallback (step 5) — so
// the teaching moment is preserved without a broken cutout. `anchor: null`
// declares an intentionally anchorless step (the closing encouragement).
//
// Real anchor sources (verified 2026-06-12):
//   readiness-energy-check-cta → Antrenor.tsx:358 (energy-check CTA)
//   coach-today-start-cta      → CoachTodayCard.tsx (primary "Incepe sesiunea")
//   log-dock                   → Workout.tsx:1736 (Coach-V2 in-session dock)
//   setrating-feel-card        → SetRatingButtons.tsx:54 (Usor/Potrivit/Greu)

/** Where to place the bubble relative to the spotlighted anchor. */
export type Placement = 'top' | 'bottom';

export interface TutorialStep {
  /** Stable id (test + key namespacing). */
  id: string;
  /** data-testid of the element to spotlight, or null for an anchorless step. */
  anchor: string | null;
  /** i18n key prefix → `${key}.title` + `${key}.body`. */
  key: string;
  /** Preferred bubble side when the anchor is present (engine flips if it would clip). */
  placement?: Placement;
}

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  {
    id: 'energy',
    anchor: 'readiness-energy-check-cta',
    key: 'tutorial.steps.energy',
    placement: 'bottom',
  },
  {
    id: 'start',
    anchor: 'coach-today-start-cta',
    key: 'tutorial.steps.start',
    placement: 'top',
  },
  {
    id: 'log',
    anchor: 'log-dock',
    key: 'tutorial.steps.log',
    placement: 'top',
  },
  {
    id: 'rate',
    anchor: 'setrating-feel-card',
    key: 'tutorial.steps.rate',
    placement: 'top',
  },
  {
    id: 'done',
    anchor: null,
    key: 'tutorial.steps.done',
  },
];
