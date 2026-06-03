// ══ CEVA NU MERGE (RN port, route '/app/antrenor/ceva-nu-merge') ══════════
// RN twin of src/react/routes/screens/antrenor/CevaNuMerge.tsx. A problem
// picker: durere / aparate ocupate / aparate lipsa / override / renunt. Each
// option routes to a distinct adaptation flow. ALL routing logic kept 1:1: the
// aparate-lipsa option tags origin `from: 'workout'` so the save returns to
// workout-preview (web passed react-router location.state → RN passes an
// expo-router param). testIDs kept (ceva-nu-merge / -back + data-problem-kind →
// per-option testID).

import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { Activity, Users, PackageX, Shuffle, CircleX } from 'lucide-react-native';
import { gotoPath, type GotoScreen } from '../../../lib/nav';
import { SubHeader } from '../../../components/SubHeader';
import { PressScale } from '../../../components/Press';
import { useEntrance } from '../../../lib/motion';
import { surface, dark, radius } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

export type ProblemKind = 'pain' | 'equipment-busy' | 'equipment-missing' | 'override' | 'cancel';

interface ProblemOption {
  kind: ProblemKind;
  labelKey: string;
  Icon: typeof Activity;
  target: GotoScreen;
}

const PROBLEM_OPTIONS: readonly ProblemOption[] = [
  { kind: 'pain', labelKey: 'cevaNuMerge.options.pain', Icon: Activity, target: 'pain-button' },
  { kind: 'equipment-busy', labelKey: 'cevaNuMerge.options.equipmentBusy', Icon: Users, target: 'equipment-swap' },
  { kind: 'equipment-missing', labelKey: 'cevaNuMerge.options.equipmentMissing', Icon: PackageX, target: 'aparate-lipsa' },
  { kind: 'override', labelKey: 'cevaNuMerge.options.override', Icon: Shuffle, target: 'schedule-override' },
  { kind: 'cancel', labelKey: 'cevaNuMerge.options.cancel', Icon: CircleX, target: 'antrenor' },
];

// Problem option card — staggered entrance + press-scale feedback.
function ProblemRow({
  index,
  testID,
  label,
  Icon,
  onPress,
}: {
  index: number;
  testID: string;
  label: string;
  Icon: typeof Activity;
  onPress: () => void;
}): React.JSX.Element {
  const entering = useEntrance(index);
  return (
    <Animated.View entering={entering}>
      <PressScale
        testID={testID}
        accessibilityRole="button"
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          padding: 16,
          backgroundColor: surface.base,
          borderWidth: 1,
          borderColor: dark.line,
          borderRadius: radius.sm,
        }}
      >
        <Icon size={20} color={dark.ink2} />
        <Text style={{ fontSize: 16, fontWeight: '500', color: dark.ink }}>{label}</Text>
      </PressScale>
    </Animated.View>
  );
}

export default function CevaNuMerge(): React.JSX.Element {
  function handleSelect(option: ProblemOption): void {
    // aparate-lipsa reached from the workout flow → tag origin so the save
    // returns to workout-preview (adapts the session immediately). From Cont no
    // origin is passed → save returns to Cont.
    if (option.target === 'aparate-lipsa') {
      router.push({ pathname: gotoPath(option.target), params: { from: 'workout' } } as never);
      return;
    }
    router.push(gotoPath(option.target) as never);
  }

  function handleBack(): void {
    router.back();
  }

  return (
    <View testID="ceva-nu-merge" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader title={t('cevaNuMerge.subHeaderTitle')} onBack={handleBack} testIdBack="ceva-nu-merge-back" />
      <View style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 16, color: dark.ink2, marginBottom: 24 }}>{t('cevaNuMerge.body')}</Text>
        <View style={{ gap: 12 }}>
          {PROBLEM_OPTIONS.map((opt, i) => (
            <ProblemRow
              key={opt.kind}
              index={i}
              testID={`ceva-nu-merge-option-${opt.kind}`}
              label={t(opt.labelKey)}
              Icon={opt.Icon}
              onPress={() => handleSelect(opt)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
