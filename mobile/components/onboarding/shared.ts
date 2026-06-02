// ══ ONBOARDING — shared step types + goal-label helper (RN port) ══════════
// Twin of src/react/routes/screens/onboarding/shared.ts (pure, no markup).
// Shared by the choice steps + the summary so goal copy resolves identically.

import { t } from '../../../src/i18n/index.js';

export interface OptionStepProps<T extends string> {
  value: T | null;
  onChange: (v: T) => void;
}

// Goal labels 5 values: auto (default — engine picks), forta, masa, slabire,
// mentenanta.
export type GoalKey = 'auto' | 'forta' | 'masa' | 'slabire' | 'mentenanta';

export function goalLabel(key: GoalKey): string {
  return t(`onboarding.options.goal.${key}`);
}
