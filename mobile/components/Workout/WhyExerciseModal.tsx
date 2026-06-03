// ══ WHY EXERCISE MODAL (RN port) — "why this exercise?" explainer ═════════
// RN twin of src/react/components/Workout/WhyExerciseModal.tsx. A bottom sheet
// (RN Modal) showing the whyEngine categorical summary; backdrop tap, Android
// back, or "Am inteles" closes. The web threaded a dismissRef for a DOM focus
// effect; native uses the Modal's own focus contract, so no ref is needed.
// testIDs kept (why-modal-backdrop / why-modal / why-modal-text / -dismiss).

import { Text, Pressable, Modal } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { PressScale } from '../Press';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { accent, dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface WhyExerciseModalProps {
  whyText: string;
  exerciseName: string;
  onClose: () => void;
}

export function WhyExerciseModal({ whyText, exerciseName, onClose }: WhyExerciseModalProps): React.JSX.Element {
  const reduced = useReducedMotion();
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        testID="why-modal-backdrop"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
      >
        <Animated.View entering={reduced ? undefined : SlideInDown.duration(280)}>
        <Pressable
          testID="why-modal"
          accessibilityViewIsModal
          accessibilityLabel={t('workout.whyAriaLabel')}
          onPress={() => {}}
          style={{ backgroundColor: dark.paper, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: dark.ink, marginBottom: 12 }}>
            {t('workout.whyTitle', { exercise: exerciseName })}
          </Text>
          <Text testID="why-modal-text" style={{ fontSize: 14, color: dark.ink2, lineHeight: 22, marginBottom: 20 }}>
            {whyText}
          </Text>
          <PressScale
            testID="why-modal-dismiss"
            accessibilityRole="button"
            onPress={onClose}
            style={{ padding: 12, backgroundColor: accent.volt, borderRadius: 14, minHeight: 44, justifyContent: 'center' }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('workout.whyDismiss')}</Text>
          </PressScale>
        </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
