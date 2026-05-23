// ══ TOGGLE — Pass 9 Shared Switch Component ═════════════════════════════
// Mockup ref: andura-clasic.html L2973-2976 .sw class (track 36x22, thumb
// 18x18 white, brick #c8412e ON / line-strong OFF). React canonical: w-12
// h-6 (48x24) thumb w-5 h-5 (20x20) — bigger than mockup track, intentional
// for 44x44 tap target via before:-inset-2.5 hit area expand (Maria 65
// a11y SC 2.5.5 §B036 audit fix). Mockup is design-only ref, NU production
// a11y constraint.
//
// Extracts 3 inline duplicate switch implementations:
//   - SettingsPrivacy.tsx ToggleRow (single source pattern leader)
//   - SettingsNotifications.tsx master toggle (L149-164 inline)
//   - SettingsNotifications.tsx NotifEventRow (L328-353 inline duplicate)
//
// Visual parity preserved verbatim — same Tailwind classes, same a11y
// contract (role=switch + aria-checked + aria-label).
//
// Cross-refs:
//   - mockup andura-clasic.html#L2973-2976 .sw canonical switch CSS
//   - DECISIONS.md §B036 audit fix tap target 44x44 (before:-inset-2.5)

import type { JSX } from 'react';

export interface ToggleProps {
  /** Controlled checked state */
  checked: boolean;
  /** Click handler — flips checked */
  onToggle: () => void;
  /** Accessible label (required — aria-label or aria-labelledby alt) */
  ariaLabel: string;
  /** data-testid hook for tests */
  testId?: string;
  /** Disabled state — applies opacity + disabled cursor */
  disabled?: boolean;
}

export function Toggle({
  checked,
  onToggle,
  ariaLabel,
  testId,
  disabled = false,
}: ToggleProps): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-testid={testId}
      disabled={disabled}
      onClick={onToggle}
      className={`flex-shrink-0 w-12 h-6 rounded-full transition relative before:absolute before:-inset-2.5 before:content-[''] disabled:cursor-not-allowed ${checked ? 'bg-brick' : 'bg-line'}`}
    >
      {/* §B036 audit fix (UI-REVIEW #3) — invisible hit area expand via
          before: pseudo (-inset-2.5 = +10px ALL sides → 68×44px tap target
          ≥44 Maria 65 SC 2.5.5). */}
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-paper transition ${checked ? 'left-6' : 'left-0.5'}`}
      />
    </button>
  );
}
