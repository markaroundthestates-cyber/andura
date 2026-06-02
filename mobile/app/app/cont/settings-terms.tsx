// settings-terms (route '/app/cont/settings-terms') — real body ported in W6b.
// Placeholder leaf so W6a navigation targets (Cont hub rows + SettingsPrefs
// advanced drill-downs) do not dead-end (mirror restore-account.tsx pattern).
import { Placeholder } from '../../../components/Placeholder';
export default function SettingsTerms() {
  return <Placeholder name="Termeni" route="/app/cont/settings-terms" />;
}
