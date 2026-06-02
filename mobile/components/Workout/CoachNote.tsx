// ══ COACH NOTE (RN port) — in-session brain note (volt card) ══════════════
// RN twin of src/react/components/Workout/CoachNote.tsx. The shared volt-tinted
// "Brain" note shell used by the insession-adjust-notice + baseline-note in the
// log zone. The parent decides WHICH note to show (mutually-exclusive gating);
// this is the shell. testID passed through verbatim.

import { View, Text } from 'react-native';
import { Brain } from 'lucide-react-native';
import { accent, dark, surface, withAlpha } from '../../lib/tokens';

interface CoachNoteProps {
  testID: string;
  message: string;
}

export function CoachNote({ testID, message }: CoachNoteProps): React.JSX.Element {
  return (
    <View
      testID={testID}
      accessibilityRole="text"
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 12,
        marginBottom: 12,
        borderRadius: 16,
        backgroundColor: surface.base,
        borderWidth: 1,
        borderColor: withAlpha(accent.volt, 0.32),
      }}
    >
      <Brain size={16} color={accent.voltDeep} style={{ marginTop: 2 }} />
      <Text className="font-serif" style={{ flex: 1, fontStyle: 'italic', fontSize: 14, color: dark.ink }}>
        {message}
      </Text>
    </View>
  );
}
