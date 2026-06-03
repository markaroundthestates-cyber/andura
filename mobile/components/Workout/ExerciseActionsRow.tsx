// ══ EXERCISE ACTIONS ROW (RN port) — in-session substitution row ══════════
// RN twin of src/react/components/Workout/ExerciseActionsRow.tsx. Three buttons
// (Aparat ocupat / Aparat lipsa / Nu vreau) that fire the three parent handlers
// — all swap logic stays in the parent. testIDs kept verbatim (wv2-ex-actions
// root + wv2-ex-action-ocupat / -lipsa / -nuvreau).

import { View, Text } from 'react-native';
import { Users, Hand, PackageX } from 'lucide-react-native';
import { PulseCard } from '../pulse/PulseCard';
import { PressScale } from '../Press';
import { dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface ExerciseActionsRowProps {
  onOcupat: () => void;
  onLipsa: () => void;
  onNuVreau: () => void;
}

interface ActionProps {
  icon: React.JSX.Element;
  label: string;
  onPress: () => void;
  testID: string;
}

function Action({ icon, label, onPress, testID }: ActionProps): React.JSX.Element {
  return (
    <PressScale testID={testID} accessibilityRole="button" onPress={onPress} style={{ flex: 1 }}>
      <PulseCard tight style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, minHeight: 44 }}>
        {icon}
        <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink2 }}>{label}</Text>
      </PulseCard>
    </PressScale>
  );
}

export function ExerciseActionsRow({ onOcupat, onLipsa, onNuVreau }: ExerciseActionsRowProps): React.JSX.Element {
  return (
    <View testID="wv2-ex-actions" style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
      <Action testID="wv2-ex-action-ocupat" icon={<Users size={16} color={dark.ink2} />} label={t('workout.actions.busy')} onPress={onOcupat} />
      <Action testID="wv2-ex-action-lipsa" icon={<PackageX size={16} color={dark.ink2} />} label={t('workout.actions.missing')} onPress={onLipsa} />
      <Action testID="wv2-ex-action-nuvreau" icon={<Hand size={16} color={dark.ink2} />} label={t('workout.actions.refuse')} onPress={onNuVreau} />
    </View>
  );
}
