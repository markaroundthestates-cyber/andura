// ══ TRANSITION SCREEN (RN port) — phase='transition' splash ═══════════════
// RN twin of src/react/components/Workout/TransitionScreen.tsx. The 1.5s delay +
// advanceExercise() timer stay in the parent FSM; this is the next-exercise
// reveal splash. The web staggered entrance is approximated with Reanimated
// FadeInUp (reduced motion handled globally by the layout animation). testIDs
// kept (transition-screen / transition-next-name).

import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface TransitionScreenProps {
  nextExerciseName: string | undefined;
  coachLine: string;
}

export function TransitionScreen({ nextExerciseName, coachLine }: TransitionScreenProps): React.JSX.Element {
  return (
    <View
      testID="transition-screen"
      accessibilityRole="alert"
      accessibilityLabel={t('workout.transition.ariaLabel')}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        backgroundColor: dark.paper,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Animated.Text entering={FadeInUp.duration(300)} style={{ fontSize: 24, fontWeight: '600', color: dark.ink, marginBottom: 8 }}>
        {t('workout.transition.next')}
      </Animated.Text>
      <Animated.Text
        entering={FadeInUp.duration(300).delay(120)}
        testID="transition-next-name"
        style={{ fontSize: 16, color: dark.ink2 }}
      >
        {nextExerciseName ?? '—'}
      </Animated.Text>
      <Animated.Text
        entering={FadeInUp.duration(300).delay(240)}
        className="font-serif"
        style={{ fontSize: 14, fontStyle: 'italic', color: dark.ink2, marginTop: 16, textAlign: 'center' }}
      >
        {`“${coachLine}”`}
      </Animated.Text>
    </View>
  );
}
