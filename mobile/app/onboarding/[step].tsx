// ══ ONBOARDING (route '/onboarding/[step]') — top-level wizard (RN port) ══
// RN twin of src/react/routes/screens/Onboarding.tsx. The brain is preserved
// VERBATIM: useOnboardingStore setField/finalize + validateOnboardingField, the
// per-step validation gate + Gigel-friendly toast, the finalize()+completed
// guard, the weight-timeline seed (seedFromProfileIfEmpty), and the
// `onboarding-step-N` + per-control testIDs + progress-dot-N (+ accessibility
// selected) markers. Step bodies + BigNumberField come from
// mobile/components/onboarding/* (presentational). Navigation via expo-router
// router.push/replace (the web's react-router navigate). The :step param drives
// the step; step completion sets the SAME onboardingStore.completed flag the
// (app) shell onboarding-gate checks.

import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useOnboardingStore, validateOnboardingField } from '../../../src/react/stores/onboardingStore';
import { useProgresStore } from '../../../src/react/stores/progresStore';
import { Kicker } from '../../components/pulse/Kicker';
import { toast } from '../../../src/react/lib/toast';
import { dark, accent, mix } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';
import { Step1, Step6, Step7Height } from '../../components/onboarding/NumericSteps';
import { Step2, StepTrainingType, Step3, Step4, Step5 } from '../../components/onboarding/ChoiceSteps';
import { Step8Summary } from '../../components/onboarding/Step8Summary';

/** Local ISO YYYY-MM-DD (date-only) — mirror the web's todayIso (date-tz local). */
function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// Training-type step is at position 3 (after sex, before goal). Total steps = 9.
const TOTAL_STEPS = 9;

type StepN = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export default function Onboarding(): React.JSX.Element {
  const { step } = useLocalSearchParams<{ step: string }>();
  const stepNum = Math.max(1, Math.min(TOTAL_STEPS, parseInt(step ?? '1', 10))) as StepN;
  const data = useOnboardingStore((s) => s.data);
  const setField = useOnboardingStore((s) => s.setField);
  const finalize = useOnboardingStore((s) => s.finalize);

  const isLast = stepNum === TOTAL_STEPS;

  function resolveFieldCheck(
    check: ReturnType<typeof validateOnboardingField>,
  ): { ok: true } | { ok: false; reason: string } {
    if (check.ok) return { ok: true };
    return { ok: false, reason: t(check.messageKey, check.params) };
  }

  function validateCurrentStep(): { ok: true } | { ok: false; reason: string } {
    if (stepNum === 1) {
      if (data.age === null) return { ok: false, reason: t('onboarding.toast.completeAge') };
      return resolveFieldCheck(validateOnboardingField('age', data.age));
    }
    if (stepNum === 2 && data.sex === null) return { ok: false, reason: t('onboarding.toast.completeOption') };
    if (stepNum === 3 && (data.trainingType ?? null) === null) {
      return { ok: false, reason: t('onboarding.toast.completeTrainingType') };
    }
    if (stepNum === 4 && data.goal === null) return { ok: false, reason: t('onboarding.toast.completeGoal') };
    if (stepNum === 5 && data.frequency === null) return { ok: false, reason: t('onboarding.toast.completeFrequency') };
    if (stepNum === 6 && data.experience === null) return { ok: false, reason: t('onboarding.toast.completeLevel') };
    if (stepNum === 7) {
      if (data.weight === null) return { ok: false, reason: t('onboarding.toast.completeWeight') };
      return resolveFieldCheck(validateOnboardingField('weight', data.weight));
    }
    if (stepNum === 8) {
      if (data.height === null) return { ok: false, reason: t('onboarding.toast.completeHeight') };
      return resolveFieldCheck(validateOnboardingField('height', data.height));
    }
    return { ok: true };
  }

  function next(): void {
    const check = validateCurrentStep();
    if (!check.ok) {
      toast.show({ message: check.reason, variant: 'warning' });
      return;
    }
    if (isLast) {
      // Navigate ONLY if finalize succeeded. finalize rejects if any Big 6 is
      // null/out-of-range (stale state or direct /onboarding/N access).
      finalize();
      if (useOnboardingStore.getState().completed) {
        // Seed the weight timeline from the onboarding weight when empty so
        // "Greutate (7 zile)" starts at the user's real weight. Idempotent.
        const w = useOnboardingStore.getState().data.weight;
        if (w !== null) {
          useProgresStore.getState().seedFromProfileIfEmpty(w, todayIso());
        }
        router.replace('/app/antrenor');
      } else {
        toast.show({ message: t('onboarding.toast.completeAll'), variant: 'warning' });
      }
    } else {
      router.push(`/onboarding/${stepNum + 1}` as never);
    }
  }

  function back(): void {
    if (stepNum > 1) router.push(`/onboarding/${stepNum - 1}` as never);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-paper" style={{ backgroundColor: dark.paper }} testID={`onboarding-step-${stepNum}`}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        {/* Progress dots + "N din TOTAL" counter. */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const isCurrent = i + 1 === stepNum;
              const isDone = i + 1 < stepNum;
              return (
                <View
                  key={i}
                  testID={`progress-dot-${i + 1}`}
                  accessibilityState={{ selected: i + 1 <= stepNum }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    transform: isCurrent ? [{ scale: 1.5 }] : undefined,
                    backgroundColor: isCurrent ? dark.ink : isDone ? dark.brick : dark.line,
                  }}
                />
              );
            })}
          </View>
          <Text className="font-medium text-ink3" style={{ fontSize: 12 }}>
            {t('onboarding.progress', { current: stepNum, total: TOTAL_STEPS })}
          </Text>
        </View>

        {/* Kicker eyebrow. */}
        <View style={{ marginBottom: 4 }}>
          <Kicker color={accent.aqua}>{t('onboarding.stepKicker', { n: stepNum })}</Kicker>
        </View>

        {/* Active step body. */}
        <View>
          {stepNum === 1 && <Step1 value={data.age} onChange={(v) => setField('age', v)} />}
          {stepNum === 2 && <Step2 value={data.sex} onChange={(v) => setField('sex', v)} />}
          {stepNum === 3 && <StepTrainingType value={data.trainingType ?? 'gym'} onChange={(v) => setField('trainingType', v)} />}
          {stepNum === 4 && <Step3 value={data.goal} onChange={(v) => setField('goal', v)} />}
          {stepNum === 5 && <Step4 value={data.frequency} onChange={(v) => setField('frequency', v)} />}
          {stepNum === 6 && <Step5 value={data.experience} onChange={(v) => setField('experience', v)} />}
          {stepNum === 7 && <Step6 value={data.weight} onChange={(v) => setField('weight', v)} />}
          {stepNum === 8 && <Step7Height value={data.height} onChange={(v) => setField('height', v)} />}
          {stepNum === 9 && <Step8Summary data={data} />}
        </View>

        <View style={{ flex: 1, minHeight: 24 }} />

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
          {stepNum > 1 && (
            <Pressable
              onPress={back}
              testID="onb-back"
              accessibilityRole="button"
              className="bg-paper-2 border border-line-strong"
              style={{ paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text className="font-semibold text-ink" style={{ fontSize: 14 }}>{t('onboarding.backCta')}</Text>
            </Pressable>
          )}
          <Pressable
            onPress={next}
            testID="onb-next"
            accessibilityRole="button"
            className="bg-brick"
            style={{
              flex: 1,
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: isLast ? 1 : 0,
              borderColor: isLast ? dark.brick : 'transparent',
              backgroundColor: isLast ? mix.brick16Dark : dark.brick,
            }}
          >
            <Text className="font-semibold" style={{ fontSize: 16, color: isLast ? dark.brick : dark.onAccent }}>
              {isLast ? t('onboarding.finishCta') : t('onboarding.continueCta')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
