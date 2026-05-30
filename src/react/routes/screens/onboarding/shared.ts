// ══ ONBOARDING — shared step types + goal-label helper ════════════════════
// Extracted from Onboarding.tsx (hygiene split, zero behavior change). Shared
// by the choice steps and the summary so goal copy resolves identically.

import { t } from '../../../../i18n/index.js';

export interface OptionStepProps<T extends string> {
  value: T | null;
  onChange: (v: T) => void;
}

// §B003/D-1b + §obiectiv-drop-longevitate 2026-05-28 — Goal labels 5 values
// (post-D080 longevitate dropped, semantic duplicate of mentenanta — ambele
// MAINTENANCE phase). Auto = default (engine alege singur). Slabire (was
// 'definire'). Mentenanta + Auto = NEW (D-1b).
export type GoalKey = 'auto' | 'forta' | 'masa' | 'slabire' | 'mentenanta';

export function goalLabel(key: GoalKey): string {
  return t(`onboarding.options.goal.${key}`);
}
