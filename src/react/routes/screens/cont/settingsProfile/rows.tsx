// ══ SETTINGS PROFILE — shared row layout helpers ════════════════════════
// Extracted verbatim from SettingsProfile.tsx (hygiene split — zero behavior
// change). LabelRow + SelectRow are presentational layout wrappers shared by
// the parent screen and its extracted field sections.

import type { JSX } from 'react';

interface LabelRowProps {
  label: string;
  isLast?: boolean;
  children: JSX.Element;
}

export function LabelRow({ label, isLast, children }: LabelRowProps): JSX.Element {
  // §6-M3 audit fix — implicit <label> wrap for INPUT children (WCAG 1.3.1 +
  // 4.1.2). Wrapping <label> binds the row text to the input without needing
  // htmlFor/id pair. Safe for <input> because label click focuses the input
  // (no double-dispatch concerns on Android Chrome).
  return (
    <label
      className={`flex items-center justify-between px-4 py-3 ${
        isLast ? '' : 'border-b border-line'
      }`}
    >
      <span className="text-sm text-ink">{label}</span>
      {children}
    </label>
  );
}

interface SelectRowProps {
  label: string;
  htmlFor: string;
  isLast?: boolean;
  children: JSX.Element;
}

export function SelectRow({ label, htmlFor, isLast, children }: SelectRowProps): JSX.Element {
  // §HIGH-1 audit fix (REVIEW-chat3-fresh-eyes) — explicit htmlFor/id binding
  // pentru SELECT children. NU folosim <label> wrap pentru selects deoarece pe
  // Android Chrome label click se poate re-dispatch la primul labelable
  // descendant — pe rand <select> poate cauza native dropdown sa pulseze
  // open/close (double-toggle). Sibling pattern <label htmlFor> + <select id>
  // pastreaza accessible name (WCAG 1.3.1 + 4.1.2) fara nesting risc.
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${
        isLast ? '' : 'border-b border-line'
      }`}
    >
      <label htmlFor={htmlFor} className="text-sm text-ink">{label}</label>
      {children}
    </div>
  );
}
