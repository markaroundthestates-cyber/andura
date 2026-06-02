// ══ ONBOARDING — numeric steps (age / weight / height) (RN port) ══════════
// Twin of src/react/routes/screens/onboarding/NumericSteps.tsx. Pure
// presentational steps over BigNumberField — value + onChange come from the
// parent wizard which still owns every hook/store call/handler. Range-validation
// error copy + bounds + testIDs + i18n keys are kept verbatim.

import { View, Text } from 'react-native';
import { BigNumberField, type NumericStepProps } from './BigNumberField';
import { t } from '../../../src/i18n/index.js';

function StepHeading({ title, desc }: { title: string; desc: string }): React.JSX.Element {
  return (
    <View>
      <Text className="font-bold text-ink" style={{ fontSize: 24, marginBottom: 8 }}>{title}</Text>
      <Text className="text-ink2" style={{ fontSize: 14, marginBottom: 24, lineHeight: 20 }}>{desc}</Text>
    </View>
  );
}

export function Step1({ value, onChange }: NumericStepProps): React.JSX.Element {
  const error = value !== null && (value < 18 || value > 99)
    ? t('onboarding.steps.1.error')
    : null;
  return (
    <View>
      <StepHeading title={t('onboarding.steps.1.title')} desc={t('onboarding.steps.1.desc')} />
      <BigNumberField
        value={value}
        onChange={onChange}
        unit={t('onboarding.steps.1.unit')}
        helper={t('onboarding.steps.1.helper')}
        error={error}
        inputId="onb-age"
        errorId="onb-age-error"
        testId="onb-age-input"
        ariaLabel={t('onboarding.steps.1.ariaLabel')}
        placeholder={t('onboarding.steps.1.placeholder')}
        min={18}
        max={99}
        inputMode="numeric"
        enterKeyHint="next"
      />
    </View>
  );
}

export function Step6({ value, onChange }: NumericStepProps): React.JSX.Element {
  const error = value !== null && (value < 30 || value > 250)
    ? t('onboarding.steps.7.error')
    : null;
  return (
    <View>
      <StepHeading title={t('onboarding.steps.7.title')} desc={t('onboarding.steps.7.desc')} />
      <BigNumberField
        value={value}
        onChange={onChange}
        unit={t('onboarding.steps.7.unit')}
        helper={t('onboarding.steps.7.helper')}
        error={error}
        inputId="onb-weight"
        errorId="onb-weight-error"
        testId="onb-weight-input"
        ariaLabel={t('onboarding.steps.7.ariaLabel')}
        placeholder={t('onboarding.steps.7.placeholder')}
        min={30}
        max={250}
        step="0.1"
        inputMode="decimal"
        enterKeyHint="done"
      />
    </View>
  );
}

export function Step7Height({ value, onChange }: NumericStepProps): React.JSX.Element {
  const error = value !== null && (value < 120 || value > 230)
    ? t('onboarding.steps.8.error')
    : null;
  return (
    <View>
      <StepHeading title={t('onboarding.steps.8.title')} desc={t('onboarding.steps.8.desc')} />
      <BigNumberField
        value={value}
        onChange={onChange}
        unit={t('onboarding.steps.8.unit')}
        helper={t('onboarding.steps.8.helper')}
        error={error}
        inputId="onb-height"
        errorId="onb-height-error"
        testId="onb-height-input"
        ariaLabel={t('onboarding.steps.8.ariaLabel')}
        placeholder={t('onboarding.steps.8.placeholder')}
        min={120}
        max={230}
        step="1"
        inputMode="numeric"
        enterKeyHint="next"
      />
    </View>
  );
}
