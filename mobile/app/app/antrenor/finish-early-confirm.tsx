// ══ FINISH EARLY CONFIRM (RN port) — drill-down screen ════════════════════
// RN twin of src/react/routes/screens/antrenor/FinishEarlyConfirm.tsx.
// Destructive drill-down: Confirm → route to post-rpe (partial summary built
// from the sets logged so far — NO progress lost). Cancel → back to /workout.
// testIDs kept (finish-early-confirm / -back / -accept / -cancel).

import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Flag } from 'lucide-react-native';
import { gotoPath } from '../../../lib/nav';
import { SubHeader } from '../../../components/SubHeader';
import { PulseCard } from '../../../components/pulse/PulseCard';
import { accent, dark } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

export default function FinishEarlyConfirm(): React.JSX.Element {
  function handleConfirm(): void {
    router.push(gotoPath('post-rpe') as never);
  }

  function handleCancel(): void {
    router.push(gotoPath('workout') as never);
  }

  return (
    <View testID="finish-early-confirm" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader title={t('confirm.finishEarly.title')} onBack={handleCancel} testIdBack="finish-early-confirm-back" />

      <View style={{ flex: 1, paddingTop: 8, paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center' }}>
        <PulseCard style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Flag size={28} color={dark.ink} />
        </PulseCard>
        <Text style={{ fontSize: 24, fontWeight: '600', color: dark.ink, marginBottom: 12, textAlign: 'center' }}>{t('confirm.finishEarly.heading')}</Text>
        <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 22, marginBottom: 8, textAlign: 'center', maxWidth: 360 }}>
          {t('confirm.finishEarly.body1')}
        </Text>
        <Text style={{ fontSize: 14, color: dark.ink2, lineHeight: 22, marginBottom: 8, textAlign: 'center', maxWidth: 360 }}>
          {t('confirm.finishEarly.body2')}
        </Text>

        <View style={{ width: '100%', maxWidth: 360, marginTop: 32, gap: 12 }}>
          <Pressable
            testID="finish-early-confirm-accept"
            accessibilityRole="button"
            onPress={handleConfirm}
            style={{ paddingVertical: 16, backgroundColor: accent.volt, borderRadius: 14 }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('confirm.finishEarly.acceptCta')}</Text>
          </Pressable>
          <Pressable
            testID="finish-early-confirm-cancel"
            accessibilityRole="button"
            onPress={handleCancel}
            style={{ paddingVertical: 16, borderWidth: 1, borderColor: dark.lineStrong, borderRadius: 14 }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '500', color: dark.ink2 }}>{t('confirm.finishEarly.cancelCta')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
