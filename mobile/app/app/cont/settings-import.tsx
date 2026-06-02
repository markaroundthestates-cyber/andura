// settings-import (route '/app/cont/settings-import') — real body ported in W6b.
// Placeholder leaf so W6a navigation targets (Cont hub rows + SettingsPrefs
// advanced drill-downs) do not dead-end (mirror restore-account.tsx pattern).
import { Placeholder } from '../../../components/Placeholder';
export default function SettingsImport() {
  return <Placeholder name="Import date" route="/app/cont/settings-import" />;
}
