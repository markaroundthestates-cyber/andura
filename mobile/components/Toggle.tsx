// ══ TOGGLE (RN port) — shared switch ══════════════════════════════════════
// RN twin of src/react/components/Toggle.tsx. Same props contract (checked /
// onToggle / ariaLabel / testId / disabled), same a11y (role switch +
// accessibilityState.checked). Track 48x24, thumb 20x20, brick ON / line OFF —
// the React canonical sizing (44x44 tap target met natively via the 48-wide
// track + padding hitSlop). testId passthrough preserved.

import { Pressable, View } from 'react-native';
import { dark } from '../lib/tokens';

export interface ToggleProps {
  checked: boolean;
  onToggle: () => void;
  ariaLabel: string;
  testId?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onToggle, ariaLabel, testId, disabled = false }: ToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={ariaLabel}
      testID={testId}
      disabled={disabled}
      onPress={onToggle}
      hitSlop={10}
      style={{
        width: 48,
        height: 24,
        borderRadius: 999,
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
        backgroundColor: checked ? dark.brick : dark.lineStrong,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 26 : 2,
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: dark.paper,
        }}
      />
    </Pressable>
  );
}
