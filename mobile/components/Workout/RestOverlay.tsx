// ══ REST OVERLAY (RN port) — phase=rest bottom card ═══════════════════════
// RN twin of src/react/components/Workout/RestOverlay.tsx. A NON-modal card
// pinned to the bottom band (web BUG #7+#8: it must NOT cover the header X / ⋯
// so they stay tappable during rest). SVGCountdownRing + contextual cue +
// "Sari pauza" skip. The web card is a DARK surface in both themes (Pulse dark
// is the app default) — here it is the dark surface token with the brick accent
// border. testIDs kept: rest-overlay / rest-skip / rest-context-line; the ring
// carries rest-countdown internally.
//
// NOTE (W-Final): the parent owns the in-app JS countdown that feeds
// countdownSec; the OS-level background rest notification (expo-notifications
// firing over a backgrounded app) is W-Final, NOT here.

import { View, Text } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { SkipForward } from 'lucide-react-native';
import { SVGCountdownRing } from './SVGCountdownRing';
import { PressScale } from '../Press';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { accent, dark, surface } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface RestOverlayProps {
  countdownSec: number;
  initialRestSec: number;
  onSkip: () => void;
  /** Optional current-exercise context — renders the "{name} recupereaza" cue
   *  when non-empty. */
  currentExerciseName?: string;
}

export function RestOverlay({
  countdownSec,
  initialRestSec,
  onSkip,
  currentExerciseName,
}: RestOverlayProps): React.JSX.Element {
  const reduced = useReducedMotion();
  return (
    <Animated.View
      entering={reduced ? undefined : SlideInDown.duration(300)}
      testID="rest-overlay"
      accessibilityRole="alert"
      accessibilityLabel={t('restOverlay.ariaLabel')}
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 78,
        zIndex: 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: surface.s2,
        borderWidth: 1,
        borderColor: accent.volt,
        shadowColor: '#000',
        shadowOpacity: 0.22,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      <SVGCountdownRing
        totalSec={initialRestSec}
        remainingSec={countdownSec}
        diameter={84}
        strokeWidth={6}
        timeColor={dark.ink}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          className="font-mono uppercase"
          style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, color: accent.volt }}
        >
          {t('restOverlay.kicker')}
        </Text>
        {currentExerciseName ? (
          <Text
            testID="rest-context-line"
            className="font-serif"
            style={{ fontStyle: 'italic', fontSize: 13, lineHeight: 18, marginTop: 2, color: dark.ink }}
          >
            {t('restOverlay.recovering', { name: currentExerciseName })}
          </Text>
        ) : null}
      </View>
      <PressScale
        testID="rest-skip"
        accessibilityRole="button"
        onPress={onSkip}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.35)',
        }}
      >
        <SkipForward size={14} color={dark.ink} />
        <Text style={{ fontSize: 12, fontWeight: '600', color: dark.ink }}>
          {t('restOverlay.skipCta')}
        </Text>
      </PressScale>
    </Animated.View>
  );
}
