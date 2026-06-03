// ══ LOADING SKELETON (RN port) — Suspense fallback ════════════════════════
// RN twin of src/react/components/LoadingSkeleton.tsx. A title bar + N tiles on
// the paper surface, each carrying a directional shimmer sweep (reads as
// "fetching", not "frozen"). Same props (lines / testId), same testIDs
// (loading-skeleton / skeleton-line-{i}), same aria (accessibilityState.busy +
// label). The web shimmer is a CSS gradient sweep; here a Reanimated translateX
// gradient band passes over each tile. Reduced motion → static tiles.

import { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { withAlpha } from '../lib/tokens';
import { useTheme } from '../lib/theme';
import { useReducedMotion } from '../lib/useReducedMotion';
import { t } from '../../src/i18n/index.js';

function ShimmerTile({ style, testID }: { style: object; testID?: string }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const x = useSharedValue(-width);

  useEffect(() => {
    if (reduced) {
      x.value = 0;
      return;
    }
    x.value = withRepeat(
      withTiming(width, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [reduced, width, x]);

  const sweep = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      testID={testID}
      className="bg-paper-2"
      style={[{ overflow: 'hidden', backgroundColor: colors.paper2 }, style]}
    >
      <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: width }, sweep]}>
        <LinearGradient
          colors={['transparent', withAlpha(colors.ink, 0.08), 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

interface LoadingSkeletonProps {
  lines?: number;
  testId?: string;
}

export function LoadingSkeleton({ lines = 3, testId = 'loading-skeleton' }: LoadingSkeletonProps) {
  const { colors } = useTheme();
  return (
    <View
      testID={testId}
      accessibilityState={{ busy: true }}
      accessibilityLabel={t('loadingSkeleton.ariaLabel')}
      className="bg-paper"
      style={{ flex: 1, padding: 24, backgroundColor: colors.paper }}
    >
      <ShimmerTile style={{ height: 28, width: 128, borderRadius: 6, marginBottom: 24 }} />
      <View style={{ gap: 12 }}>
        {Array.from({ length: lines }, (_, i) => (
          <ShimmerTile
            key={i}
            testID={`skeleton-line-${i}`}
            style={{ height: 64, borderRadius: 12 }}
          />
        ))}
      </View>
    </View>
  );
}
