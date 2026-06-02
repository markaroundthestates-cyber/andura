// ══ PR FLASH (RN port) — mid-session PR celebration ═══════════════════════
// RN twin of src/react/components/Workout/PrFlash.tsx. A brief, transient,
// auto-dismissing full-bleed overlay fired the instant the engine detects a PR
// (parent mounts it keyed on the PR payload). Auto-dismisses after ~2.6s; a tap
// closes it early; a short haptic fires on mount (W3b no-op shim → expo-haptics
// at W-Final). ConfettiBurst supplies the spray. It NEVER traps focus / blocks
// the session permanently (it tears itself down). testIDs kept (pr-flash /
// pr-flash-detail). The web radial-gradient backdrop is approximated with an
// ember-tinted translucent fill (RN has no color-mix); glow via shadow.

import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { ConfettiBurst } from '../ConfettiBurst';
import { accent, dark, withAlpha } from '../../lib/tokens';
import { haptic } from '../../lib/motion';
import { t } from '../../../src/i18n/index.js';

interface PrFlashProps {
  exercise: string;
  deltaKg: number;
  onClose: () => void;
  durationMs?: number;
}

export function PrFlash({ exercise, deltaKg, onClose, durationMs = 2600 }: PrFlashProps): React.JSX.Element {
  useEffect(() => {
    haptic(40);
    const tid = setTimeout(onClose, durationMs);
    return () => clearTimeout(tid);
  }, [onClose, durationMs]);

  return (
    <Pressable
      testID="pr-flash"
      accessibilityRole="alert"
      accessibilityLabel={t('workout.prFlash.ariaLabel')}
      onPress={onClose}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 48,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor: withAlpha(dark.paper, 0.94),
      }}
    >
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute' }}>
        <ConfettiBurst count={56} />
      </View>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: withAlpha(accent.ember, 0.16),
            borderWidth: 2,
            borderColor: withAlpha(accent.ember, 0.45),
            shadowColor: accent.ember,
            shadowOpacity: 0.6,
            shadowRadius: 50,
            elevation: 12,
          }}
        >
          <Trophy size={48} color={accent.ember} />
        </View>
        <Text className="font-display" style={{ fontSize: 30, fontWeight: '700', color: accent.ember, marginTop: 16 }}>
          {t('workout.prFlash.title')}
        </Text>
        <Text testID="pr-flash-detail" style={{ fontSize: 16, color: dark.ink, marginTop: 8, textAlign: 'center' }}>
          {t('workout.prFlash.detail', { exercise, deltaKg })}
        </Text>
      </View>
    </Pressable>
  );
}
