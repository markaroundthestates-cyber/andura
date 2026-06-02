// settings-export (route '/app/cont/settings-export') — real body ported in W6b.
// Placeholder leaf so W6a navigation targets (Cont hub rows + SettingsPrefs
// advanced drill-downs) do not dead-end (mirror restore-account.tsx pattern).
import { Placeholder } from '../../../components/Placeholder';
export default function SettingsExport() {
  return <Placeholder name="Export date" route="/app/cont/settings-export" />;
}
