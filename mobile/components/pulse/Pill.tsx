// ══ PULSE · PILL (RN port) — compact status / tag chip ════════════════════
// RN twin of src/react/components/pulse/Pill.tsx. Same props (children / color
// / solid). ghost = tinted bg (16%) + tinted border (40%) + colored text;
// solid = filled with the color + dark.onAccent text. The web derived the tint
// via color-mix on a dynamic token, so here `withAlpha` reproduces it at
// runtime. Default color = primary accent. testID preserved.

import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { dark, withAlpha } from '../../lib/tokens';

interface PillProps {
  children: ReactNode;
  /** Accent color for tint/border/fill. Defaults to the primary accent. */
  color?: string;
  /** Filled variant (uses on-accent text color). */
  solid?: boolean;
}

export function Pill({ children, color = dark.brick, solid = false }: PillProps) {
  return (
    <View
      testID="pulse-pill"
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 11,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: solid ? color : withAlpha(color, 0.16),
        borderWidth: solid ? 0 : 1,
        borderColor: solid ? 'transparent' : withAlpha(color, 0.4),
      }}
    >
      <Text
        className="font-mono uppercase"
        style={{
          color: solid ? dark.onAccent : color,
          fontSize: 10.5,
          letterSpacing: 0.6,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
