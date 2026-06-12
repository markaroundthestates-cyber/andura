// ══ HUB SEGMENTED CONTROL — Account regroup 2026-06-12 ════════════════════
// Shared 2-way segmented control for the grouped Account hubs (Exercitii &
// echipament / Datele mele / Confidentialitate & termeni). Mirrors the History
// tab's Records|Sessions segmented control verbatim (Istoric.tsx:132-157, the
// precedent the founder approved): --surface-2 pill track, active half fills
// with --volt + --on-accent ink. Pure Tailwind + design tokens — ZERO global.css.
//
// Founder directive (2026-06-12): "ar trebui sa fie mai putine butoane si
// grupate". Each hub merges two former Account rows into one screen + this
// control, halving the visible row count.

import type { JSX } from 'react';

export interface HubSegment<K extends string> {
  key: K;
  label: string;
}

interface HubSegmentedProps<K extends string> {
  segments: readonly [HubSegment<K>, HubSegment<K>];
  active: K;
  onChange: (key: K) => void;
  /** aria-label for the tablist (localized by the caller). */
  ariaLabel: string;
  /** testid prefix; buttons get `${testIdPrefix}-${key}`, the group gets it bare. */
  testIdPrefix: string;
}

export function HubSegmented<K extends string>({
  segments,
  active,
  onChange,
  ariaLabel,
  testIdPrefix,
}: HubSegmentedProps<K>): JSX.Element {
  return (
    <div
      className="flex gap-1 p-1 rounded-full border border-line bg-[var(--surface-2)] mb-4"
      role="tablist"
      aria-label={ariaLabel}
      data-testid={testIdPrefix}
    >
      {segments.map((seg) => {
        const isActive = active === seg.key;
        return (
          <button
            key={seg.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-testid={`${testIdPrefix}-${seg.key}`}
            onClick={() => onChange(seg.key)}
            className={`flex-1 py-2 rounded-full text-xs font-semibold font-mono transition-colors ${
              isActive ? 'text-[var(--on-accent)]' : 'text-ink2'
            }`}
            style={isActive ? { background: 'var(--volt)' } : undefined}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
