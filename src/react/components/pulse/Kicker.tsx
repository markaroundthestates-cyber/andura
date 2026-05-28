// ══ PULSE · KICKER — small uppercase section eyebrow ══════════════════════
// Ported from the Pulse mockup (interfata-noua/ui.jsx Kicker ~271-275). A tiny
// wide-tracked mono label that sits above a section title (e.g. "TODAY'S
// SESSION"). Token-based color (defaults to the primary accent --brick).
//
// i18n: `children` is whatever the caller passes — reskinned screens pass
// t('…') output, never a hardcoded string.
//
// A11y: plain text, no role. No motion.
//
// Usage:  <Kicker>{t('workout.preview.kicker')}</Kicker>

import type { ReactNode, JSX } from 'react';

interface KickerProps {
  children: ReactNode;
  /** Text color token. Defaults to the primary accent. */
  color?: string;
}

export function Kicker({ children, color = 'var(--brick)' }: KickerProps): JSX.Element {
  return (
    <div
      className="font-mono"
      style={{
        color,
        fontSize: 10.5,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}
      data-testid="pulse-kicker"
    >
      {children}
    </div>
  );
}
