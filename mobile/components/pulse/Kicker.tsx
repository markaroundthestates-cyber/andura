// ══ PULSE · KICKER (RN port) — small uppercase section eyebrow ════════════
// RN twin of src/react/components/pulse/Kicker.tsx. A tiny wide-tracked mono
// label above a section title. Same `children` + `color` props; default color
// is the primary accent (dark.brick — RN has no CSS var so the token resolves
// statically). testID preserved.

import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../lib/theme';

interface KickerProps {
  children: ReactNode;
  /** Text color. Defaults to the primary accent. */
  color?: string;
}

export function Kicker({ children, color }: KickerProps) {
  const { colors } = useTheme();
  return (
    <Text
      testID="pulse-kicker"
      className="font-mono uppercase"
      style={{ color: color ?? colors.brick, fontSize: 10.5, letterSpacing: 1.9 }}
    >
      {children}
    </Text>
  );
}
