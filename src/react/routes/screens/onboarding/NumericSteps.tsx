// ══ ONBOARDING — numeric steps (age / weight / height) ════════════════════
// Extracted from Onboarding.tsx (hygiene split, zero behavior change). Pure
// presentational steps over BigNumberField — value + onChange come from the
// parent Onboarding.tsx which still owns every hook/store call/handler.

import type { JSX } from 'react';
import { BigNumberField, type NumericStepProps } from './BigNumberField';
import { t } from '../../../../i18n/index.js';

export function Step1({ value, onChange }: NumericStepProps): JSX.Element {
  // A11Y HIGH chat5 — surface range validation pentru screen reader. Show
  // doar daca value e ne-null + out-of-range (NU initial empty). WCAG SC
  // 3.3.1 + 3.3.3.
  const error = value !== null && (value < 18 || value > 99)
    ? t('onboarding.steps.1.error')
    : null;
  return (
    <>
      <h1 id="onb-step1-heading" className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.1.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.1.desc')}</p>
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
    </>
  );
}

export function Step6({ value, onChange }: NumericStepProps): JSX.Element {
  // A11Y HIGH chat5 — surface range validation pentru screen reader. Show
  // doar daca value e ne-null + out-of-range. WCAG SC 3.3.1 + 3.3.3.
  const error = value !== null && (value < 30 || value > 250)
    ? t('onboarding.steps.7.error')
    : null;
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.7.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.7.desc')}</p>
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
    </>
  );
}

// P-02 — Inaltime step (mockup andura-clasic.html #screen-onb-inaltime L599-
// 621 "Cat esti de inalt?"). Fitness metric necesar Mifflin-St Jeor BMR +
// US Navy BF% (NU medical). Bounds 120-230 cm match ONBOARDING_BOUNDS.height
// + SettingsProfile composition input. Modeled pe Step6 (weight) numeric
// pattern: keystroke commits allowed, range gate + aria-invalid on out-of-range.
export function Step7Height({ value, onChange }: NumericStepProps): JSX.Element {
  // A11Y HIGH chat5 parity — surface range validation pentru screen reader.
  // Show doar daca value e ne-null + out-of-range. WCAG SC 3.3.1 + 3.3.3.
  const error = value !== null && (value < 120 || value > 230)
    ? t('onboarding.steps.8.error')
    : null;
  return (
    <>
      <h1 className="text-2xl font-bold text-ink mb-2">{t('onboarding.steps.8.title')}</h1>
      <p className="text-sm text-ink2 mb-6">{t('onboarding.steps.8.desc')}</p>
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
    </>
  );
}
