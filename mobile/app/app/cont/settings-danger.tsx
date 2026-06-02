// settings-danger (route '/app/cont/settings-danger') — real body ported in W6b.
// Placeholder leaf so W6a navigation targets (Cont hub rows + SettingsPrefs
// advanced drill-downs) do not dead-end (mirror restore-account.tsx pattern).
import { Placeholder } from '../../../components/Placeholder';
export default function SettingsDanger() {
  return <Placeholder name="Deconectare si stergere" route="/app/cont/settings-danger" />;
}
