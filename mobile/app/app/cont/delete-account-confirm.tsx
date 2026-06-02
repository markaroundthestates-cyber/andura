// delete-account-confirm (route '/app/cont/delete-account-confirm') — real body ported in W6b.
// Placeholder leaf so W6a navigation targets (Cont hub rows + SettingsPrefs
// advanced drill-downs) do not dead-end (mirror restore-account.tsx pattern).
import { Placeholder } from '../../../components/Placeholder';
export default function DeleteAccountConfirm() {
  return <Placeholder name="Stergere cont" route="/app/cont/delete-account-confirm" />;
}
