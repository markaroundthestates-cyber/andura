// ══ PULSE · PILL — compact status / tag chip ══════════════════════════════
// Ported from the Pulse mockup (interfata-noua/ui.jsx Pill ~277-288). A small
// rounded mono-uppercase chip for statuses + tags (e.g. "PRIMED FOR A PR",
// muscle group, phase). Two variants:
//   - ghost (default): tinted bg + tinted border + colored text
//   - solid: filled with the color token, text uses --on-accent
//
// Token-based: `color` defaults to the primary accent (--brick); the tint +
// border derive via color-mix on that token so every theme reads native.
// The solid text uses --on-accent (the foundation's dark-on-accent token, the
// same the mockup used) so it reads on the electric-lime fill — never raw hex.
//
// i18n: `children` comes from the caller (t('…') output). A11y: plain inline
// text; no motion.
//
// Usage:
//   <Pill>{t('antrenor.primedForPr')}</Pill>
//   <Pill color="var(--ember)" solid>{label}</Pill>

import type { CSSProperties, ReactNode, JSX } from 'react';

interface PillProps {
  children: ReactNode;
  /** Accent token for tint/border/fill. Defaults to the primary accent. */
  color?: string;
  /** Filled variant (uses --paper as the on-accent text color). */
  solid?: boolean;
}

export function Pill({ children, color = 'var(--brick)', solid = false }: PillProps): JSX.Element {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 11px',
    borderRadius: 999,
    fontSize: 10.5,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    background: solid ? color : `color-mix(in oklab, ${color} 16%, transparent)`,
    // --on-accent is the foundation's dark-on-accent text token (#0a0c14):
    // reads on the electric-lime / bright accent fills. No raw hex.
    color: solid ? 'var(--on-accent)' : color,
    border: solid ? 'none' : `1px solid color-mix(in oklab, ${color} 40%, transparent)`,
  };

  return (
    <span className="font-mono" style={style} data-testid="pulse-pill">
      {children}
    </span>
  );
}
