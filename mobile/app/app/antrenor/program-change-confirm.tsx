// ══ PROGRAM CHANGE CONFIRM (RN port) — D047 drill-down ════════════════════
// RN twin of src/react/routes/screens/antrenor/ProgramChangeConfirm.tsx.
// Destructive goal-change drill-down. The web read the pending goal from
// react-router location.state; on RN the producer (Progres ObiectivGoalCard,
// W4) passes the same fields as expo-router params (pendingGoal / pendingLabel /
// pendingSub / returnTo). Accept commits the goal on onboardingStore + syncs the
// phase-override (phaseForGoal + per-user TDEE), then routes to returnTo. ALL
// engine/store logic kept 1:1. testIDs kept (program-change-confirm / -back /
// -name / -sub / -accept / -cancel).

import { View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { RefreshCw } from 'lucide-react-native';
import { gotoPath } from '../../../lib/nav';
import { SubHeader } from '../../../components/SubHeader';
import { PressScale } from '../../../components/Press';
import { PulseCard } from '../../../components/pulse/PulseCard';
import { useOnboardingStore } from '../../../../src/react/stores/onboardingStore';
import type { Goal } from '../../../../src/react/stores/onboardingStore';
import { phaseForGoal } from '../../../../src/react/lib/goalPhaseModel';
import { readUserMaintenanceTDEE } from '../../../../src/react/lib/userTdee';
import { setPhaseOverride } from '../../../../src/util/phaseOverride.js';
import { SYS } from '../../../../src/engine/sys.js';
import { accent, dark } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

export default function ProgramChangeConfirm(): React.JSX.Element {
  const setField = useOnboardingStore((s) => s.setField);
  const params = useLocalSearchParams<{
    pendingGoal?: string;
    pendingLabel?: string;
    pendingSub?: string;
    returnTo?: string;
  }>();

  const pendingGoal = (params.pendingGoal as Goal | undefined) ?? null;
  const pendingLabel = params.pendingLabel ?? '-';
  const pendingSub = params.pendingSub ?? '';
  const returnTo = (params.returnTo as 'antrenor' | 'progres' | undefined) ?? 'antrenor';

  function handleConfirm(): void {
    if (pendingGoal) {
      setField('goal', pendingGoal);
      const tdee =
        readUserMaintenanceTDEE() ??
        (typeof SYS?.estimateTDEE === 'function' ? SYS.estimateTDEE() : 2000);
      setPhaseOverride(phaseForGoal(pendingGoal), tdee);
    }
    router.push(gotoPath(returnTo) as never);
  }

  function handleCancel(): void {
    router.push(gotoPath(returnTo) as never);
  }

  return (
    <View testID="program-change-confirm" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader title={t('confirm.programChange.title')} onBack={handleCancel} testIdBack="program-change-confirm-back" />

      <View style={{ flex: 1, paddingTop: 8, paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center' }}>
        <PulseCard style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <RefreshCw size={28} color={dark.ink} />
        </PulseCard>
        <Text style={{ fontSize: 24, fontWeight: '600', color: dark.ink, marginBottom: 12, textAlign: 'center' }}>{t('confirm.programChange.heading')}</Text>
        <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 22, marginBottom: 8, textAlign: 'center', maxWidth: 360 }}>
          {t('confirm.programChange.body1Prefix')}
          <Text testID="program-change-confirm-name" style={{ fontWeight: '700' }}>{pendingLabel}</Text>
          {pendingSub ? (
            <>
              {' ('}
              <Text testID="program-change-confirm-sub">{pendingSub}</Text>
              {')'}
            </>
          ) : null}
          {t('confirm.programChange.body1Suffix')}
        </Text>
        <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 22, marginBottom: 8, textAlign: 'center', maxWidth: 360 }}>
          {t('confirm.programChange.body2')}
        </Text>

        <View style={{ width: '100%', maxWidth: 360, marginTop: 32, gap: 12 }}>
          <PressScale
            testID="program-change-confirm-accept"
            accessibilityRole="button"
            onPress={handleConfirm}
            style={{ paddingVertical: 16, backgroundColor: accent.volt, borderRadius: 14 }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('confirm.programChange.acceptCta')}</Text>
          </PressScale>
          <PressScale
            testID="program-change-confirm-cancel"
            accessibilityRole="button"
            onPress={handleCancel}
            style={{ paddingVertical: 16, borderWidth: 1, borderColor: dark.lineStrong, borderRadius: 14 }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '500', color: dark.ink2 }}>{t('confirm.programChange.cancelCta')}</Text>
          </PressScale>
        </View>
      </View>
    </View>
  );
}
