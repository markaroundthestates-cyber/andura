// ══ INACTIVITY PROMPT (RN port) — soft idle re-engage ═════════════════════
// RN twin of src/react/components/Workout/InactivityPrompt.tsx. A NON-blocking
// bottom card shown after >7 min idle (the parent owns the threshold + timer).
// Continui resumes (reset activity); Salveaza si iesi pauses + navigates. Not a
// Modal — it must not block the session (the user can keep working). testIDs
// kept (inactivity-prompt / -title / -body / inactivity-continue /
// inactivity-save-exit).

import { View, Text } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { Clock } from 'lucide-react-native';
import { PressScale } from '../Press';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { accent, dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface InactivityPromptProps {
  open: boolean;
  onContinue: () => void;
  onSaveExit: () => void;
}

export function InactivityPrompt({ open, onContinue, onSaveExit }: InactivityPromptProps): React.JSX.Element | null {
  const reduced = useReducedMotion();
  if (!open) return null;
  return (
    <Animated.View
      entering={reduced ? undefined : SlideInDown.duration(320)}
      testID="inactivity-prompt"
      accessibilityRole="alert"
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 14,
        zIndex: 50,
        backgroundColor: dark.paper2,
        borderWidth: 2,
        borderColor: accent.volt,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Clock size={16} color={accent.volt} />
        <Text testID="inactivity-prompt-title" style={{ fontWeight: '700', color: dark.ink }}>
          {t('inactivity.title')}
        </Text>
      </View>
      <Text testID="inactivity-prompt-body" style={{ fontSize: 14, color: dark.ink2, marginBottom: 10 }}>
        {t('inactivity.body')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <PressScale
          testID="inactivity-continue"
          accessibilityRole="button"
          onPress={onContinue}
          style={{ flex: 1, backgroundColor: accent.volt, borderRadius: 8, paddingVertical: 10 }}
        >
          <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '600', color: dark.onAccent }}>{t('inactivity.continueCta')}</Text>
        </PressScale>
        <PressScale
          testID="inactivity-save-exit"
          accessibilityRole="button"
          onPress={onSaveExit}
          style={{ borderWidth: 1, borderColor: dark.lineStrong, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 }}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink2 }}>{t('inactivity.saveExitCta')}</Text>
        </PressScale>
      </View>
    </Animated.View>
  );
}
