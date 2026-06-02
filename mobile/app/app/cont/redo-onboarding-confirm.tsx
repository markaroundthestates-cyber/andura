// ══ REDO ONBOARDING CONFIRM (RN port, W6b) ═══════════════════════════════
// RN twin of src/react/routes/screens/cont/RedoOnboardingConfirm.tsx. Resets
// onboardingStore data + routes to /onboarding/1 (cont/auth profile preserved —
// Tier 0 only). Reversibil per mockup. Logic + i18n keys + testIDs verbatim;
// markup → ConfirmScreen. The web's `btn-grad` accept → gradient variant.

import { RotateCcw } from 'lucide-react-native';
import { useOnboardingStore } from '../../../../src/react/stores/onboardingStore';
import { t } from '../../../../src/i18n/index.js';
import { ConfirmScreen } from '../../../components/cont/ConfirmScreen';
import { goto, gotoReplace } from '../../../lib/nav';
import { dark } from '../../../lib/tokens';

export default function RedoOnboardingConfirm() {
  function handleConfirm(): void {
    useOnboardingStore.getState().reset();
    gotoReplace('onb-1');
  }

  function handleCancel(): void {
    goto('settings-prefs');
  }

  return (
    <ConfirmScreen
      testID="redo-onboarding-confirm"
      title={t('confirm.redoOnboarding.title')}
      backTestID="redo-onboarding-confirm-back"
      onCancel={handleCancel}
      icon={<RotateCcw size={28} color={dark.ink} />}
      heading={t('confirm.redoOnboarding.heading')}
      body={[t('confirm.redoOnboarding.body1'), t('confirm.redoOnboarding.body2')]}
      acceptLabel={t('confirm.redoOnboarding.acceptCta')}
      acceptTestID="redo-onboarding-confirm-accept"
      acceptVariant="gradient"
      onAccept={handleConfirm}
      cancelLabel={t('confirm.redoOnboarding.cancelCta')}
      cancelTestID="redo-onboarding-confirm-cancel"
    />
  );
}
