// Onboarding (route '/onboarding/:step') — top-level (web router.tsx L155).
// The :step param drives the wizard step; later waves port the real 9-step flow.
import { useLocalSearchParams } from 'expo-router';
import { Placeholder } from '../../components/Placeholder';

export default function OnboardingStep() {
  const { step } = useLocalSearchParams<{ step: string }>();
  return <Placeholder name={`Onboarding — pas ${step ?? '?'}`} route={`/onboarding/${step ?? ''}`} />;
}
