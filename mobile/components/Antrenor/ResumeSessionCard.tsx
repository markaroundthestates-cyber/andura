// ══ RESUME SESSION CARD (RN port) — Mid-Session Recovery ══════════════════
// RN twin of src/react/components/Antrenor/ResumeSessionCard.tsx. Rendered when
// workoutStore.pausedSnapshot !== null. Tapping the card resumes; the two
// buttons stop-propagate to resume/discard explicitly. Same testIDs
// (resume-session-card / resume-session-icon) + i18n keys + brick accent border.
// The web radial-gradient corner glow is dropped (FIDELITY FLAG — decorative).

import { View, Text, Pressable } from 'react-native';
import { PlayCircle } from 'lucide-react-native';
import type { PausedSession } from '../../../src/react/stores/workoutStore';
import { PAUSED_SESSION_UNTITLED } from '../../../src/react/stores/workoutStore';
import { PulseCard } from '../pulse/PulseCard';
import { dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface Props {
  snapshot: PausedSession;
  onResume: () => void;
  onDiscard: () => void;
}

export function ResumeSessionCard({ snapshot, onResume, onDiscard }: Props): React.JSX.Element {
  const minutesAgo = Math.max(1, Math.floor((Date.now() - snapshot.sessionStart) / 60000));
  const displayTitle =
    snapshot.title === PAUSED_SESSION_UNTITLED ? t('resumeSession.untitledMarker') : snapshot.title;
  return (
    <Pressable
      onPress={onResume}
      accessibilityRole="button"
      accessibilityLabel={t('resumeSession.title')}
      testID="resume-session-card"
    >
      <PulseCard style={{ padding: 16, marginBottom: 16, borderWidth: 1.5, borderColor: dark.brick }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <PlayCircle size={24} color={dark.brick} testID="resume-session-icon" />
          <View style={{ flex: 1 }}>
            <Text
              className="font-mono uppercase"
              style={{ fontSize: 11, letterSpacing: 1, color: dark.brick }}
            >
              {t('resumeSession.title')}
            </Text>
            <Text className="font-display" style={{ fontSize: 16, fontWeight: '700', color: dark.ink, marginTop: 2 }}>
              {displayTitle}
            </Text>
            <Text style={{ fontSize: 14, color: dark.ink2, marginTop: 2 }}>
              {t('resumeSession.metaLine', { n: snapshot.exIdx + 1, min: minutesAgo })}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: dark.line,
          }}
        >
          <Pressable
            onPress={onResume}
            style={{
              flex: 1,
              backgroundColor: dark.brick,
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: dark.paper }}>
              {t('resumeSession.resumeCta')}
            </Text>
          </Pressable>
          <Pressable
            onPress={onDiscard}
            style={{
              borderWidth: 1,
              borderColor: dark.line,
              borderRadius: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink2 }}>
              {t('resumeSession.discardCta')}
            </Text>
          </Pressable>
        </View>
      </PulseCard>
    </Pressable>
  );
}
