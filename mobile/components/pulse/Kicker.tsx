// ══ PULSE · KICKER (RN port) — small uppercase section eyebrow ════════════
// RN twin of src/react/components/pulse/Kicker.tsx. A tiny wide-tracked mono
// label above a section title. Same `children` + `color` props; default color
// is the primary accent (dark.brick — RN has no CSS var so the token resolves
// statically). testID preserved.

import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { dark } from '../../lib/tokens';

interface KickerProps {
  children: ReactNode;
  /** Text color. Defaults to the primary accent. */
  color?: string;
}

export function Kicker({ children, color = dark.brick }: KickerProps) {
  return (
    <Text
      testID="pulse-kicker"
      className="font-mono uppercase"
      style={{ color, fontSize: 10.5, letterSpacing: 1.9 }}
    >
      {children}
    </Text>
  );
}
