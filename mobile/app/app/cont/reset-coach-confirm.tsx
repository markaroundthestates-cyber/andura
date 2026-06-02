// reset-coach-confirm (route '/app/cont/reset-coach-confirm') — real body ported in W6b.
// Placeholder leaf so W6a navigation targets (Cont hub rows + SettingsPrefs
// advanced drill-downs) do not dead-end (mirror restore-account.tsx pattern).
import { Placeholder } from '../../../components/Placeholder';
export default function ResetCoachConfirm() {
  return <Placeholder name="Reseteaza Coach" route="/app/cont/reset-coach-confirm" />;
}
