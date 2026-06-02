// ══ RESET COACH CONFIRM (RN port, W6b) ═══════════════════════════════════
// RN twin of src/react/routes/screens/cont/ResetCoachConfirm.tsx. Wipes coach
// AI learning state (CDL tiers + pattern learning + aa cooldowns) via
// resetCoachState(); training/weight/profile/phase-log intact. Logic + i18n
// keys + testIDs verbatim; markup → ConfirmScreen. Web's `bg-danger` → danger.

import { RefreshCcw } from 'lucide-react-native';
import { resetCoachState } from '../../../../src/util/coachReset.js';
import { t } from '../../../../src/i18n/index.js';
import { ConfirmScreen } from '../../../components/cont/ConfirmScreen';
import { goto } from '../../../lib/nav';
import { dark } from '../../../lib/tokens';

export default function ResetCoachConfirm() {
  function handleConfirm(): void {
    resetCoachState();
    goto('settings-prefs');
  }

  function handleCancel(): void {
    goto('settings-prefs');
  }

  return (
    <ConfirmScreen
      testID="reset-coach-confirm"
      title={t('confirm.resetCoach.title')}
      backTestID="reset-coach-confirm-back"
      onCancel={handleCancel}
      icon={<RefreshCcw size={28} color={dark.ink} />}
      heading={t('confirm.resetCoach.heading')}
      body={[t('confirm.resetCoach.body1'), t('confirm.resetCoach.body2')]}
      acceptLabel={t('confirm.resetCoach.acceptCta')}
      acceptTestID="reset-coach-confirm-accept"
      acceptVariant="danger"
      onAccept={handleConfirm}
      cancelLabel={t('confirm.resetCoach.cancelCta')}
      cancelTestID="reset-coach-confirm-cancel"
    />
  );
}
