// settings-privacy (route '/app/cont/settings-privacy') — real body ported in W6b.
// Placeholder leaf so W6a navigation targets (Cont hub rows + SettingsPrefs
// advanced drill-downs) do not dead-end (mirror restore-account.tsx pattern).
import { Placeholder } from '../../../components/Placeholder';
export default function SettingsPrivacy() {
  return <Placeholder name="Confidentialitate" route="/app/cont/settings-privacy" />;
}
