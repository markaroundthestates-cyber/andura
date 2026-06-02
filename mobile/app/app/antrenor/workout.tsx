// Workout (route '/app/antrenor/workout') — the gym session flow. GYM-ONLY gate
// (web router.tsx L144-148 GymOnlyRoute + L175): a pure-aerobic user must never
// reach the gym session (deep-link / bookmark would cold-start a fabricated gym
// session). Read trainingType from the EXISTING onboarding store; 'aerobic' →
// redirect back to the antrenor hub. 'gym'/'both' keep full access.
import { Redirect } from 'expo-router';
import { useOnboardingStore } from '../../../../src/react/stores/onboardingStore';
import { Placeholder } from '../../../components/Placeholder';

export default function Workout() {
  const trainingType = useOnboardingStore((s) => s.data.trainingType ?? 'gym');
  if (trainingType === 'aerobic') return <Redirect href="/app/antrenor" />;
  return <Placeholder name="Workout" route="/app/antrenor/workout" />;
}
