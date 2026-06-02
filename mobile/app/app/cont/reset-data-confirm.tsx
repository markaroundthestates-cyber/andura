// reset-data-confirm (route '/app/cont/reset-data-confirm') — real body ported in W6b.
// Placeholder leaf so W6a navigation targets (Cont hub rows + SettingsPrefs
// advanced drill-downs) do not dead-end (mirror restore-account.tsx pattern).
import { Placeholder } from '../../../components/Placeholder';
export default function ResetDataConfirm() {
  return <Placeholder name="Reseteaza datele" route="/app/cont/reset-data-confirm" />;
}
