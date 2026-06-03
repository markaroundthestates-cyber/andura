// ══ PULSE · CARD (RN port) — glass surface chrome ════════════════════════
// The web's `.pulse-card` (src/styles/global.css L432-440) is the recurring
// section/hero card surface: elevated --surface glass fill + 14px backdrop
// blur + a hairline --line border + radius 22 (`.pulse-card-tight` → 14). RN
// has no backdrop-filter, so the translucent glass is approximated with the
// opaque `surface.base` token (tokens.ts) — visually the same elevated card on
// the dark paper. The web sheen (::before) + corner wash (.pulse-card-glow
// ::after) are decorative and dropped here (FIDELITY FLAG, design-polish wave).
//
// Used by every Antrenor card so the `className="pulse-card …"` web idiom maps
// to one shared RN primitive (no per-component re-derivation of the chrome).

import type { ReactNode } from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import { radius } from '../../lib/tokens';
import { useTheme } from '../../lib/theme';

interface PulseCardProps {
  children: ReactNode;
  /** Nested/stat tiles use the smaller 14px radius (`.pulse-card-tight`). */
  tight?: boolean;
  /** Extra inline style (padding/margin/border overrides from the web class). */
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: 'none' | 'button' | 'summary' | 'header' | 'image' | 'text';
}

export function PulseCard({
  children,
  tight = false,
  style,
  testID,
  accessibilityLabel,
  accessibilityRole,
}: PulseCardProps) {
  const { colors } = useTheme();
  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      style={[
        {
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: colors.surface.base,
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: tight ? radius.sm : radius.DEFAULT,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
