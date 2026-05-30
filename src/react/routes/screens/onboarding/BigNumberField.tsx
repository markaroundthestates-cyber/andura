// ══ ONBOARDING — Pulse big-number field (shared numeric presenter) ════════
// Extracted from Onboarding.tsx (hygiene split, zero behavior change). A thin
// presentation wrapper — all the brain (NaN guard, store commit, bounds, aria)
// is passed in by the calling step so age/kg/cm keep their exact testids +
// validation. The parent Onboarding.tsx still owns every hook/handler.

import type { JSX } from 'react';

export interface NumericStepProps {
  value: number | null;
  onChange: (v: number | null) => void;
}

/**
 * Pulse big-number field (mockup BigNumberInput ~205-218): a huge centered
 * figure on a volt-accent underline + a unit beside it + a helper line, with
 * the error message replacing the helper when out-of-range. A thin presentation
 * wrapper — all the brain (NaN guard, store commit, bounds, aria) is passed in
 * by the calling step so age/kg/cm keep their exact testids + validation.
 */
export interface BigNumberFieldProps extends NumericStepProps {
  unit: string;
  helper: string;
  error: string | null;
  inputId: string;
  errorId: string;
  testId: string;
  ariaLabel: string;
  placeholder: string;
  min: number;
  max: number;
  step?: string;
  inputMode: 'numeric' | 'decimal';
  enterKeyHint: 'next' | 'done';
}

export function BigNumberField({
  value,
  onChange,
  unit,
  helper,
  error,
  inputId,
  errorId,
  testId,
  ariaLabel,
  placeholder,
  min,
  max,
  step,
  inputMode,
  enterKeyHint,
}: BigNumberFieldProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 pt-4">
      <div className="flex items-baseline gap-2.5">
        <input
          id={inputId}
          type="number"
          value={value ?? ''}
          // MED-A-3 fix CODE-REVIEW chat3: paste of non-numeric ("abc") yields
          // truthy value + Number("abc")=NaN → NaN propagates to store. Guard
          // with Number.isFinite before commit.
          onChange={(e) => {
            const v = e.target.value;
            if (!v) return onChange(null);
            const n = Number(v);
            onChange(Number.isFinite(n) ? n : null);
          }}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          required
          aria-required="true"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          inputMode={inputMode}
          autoComplete="off"
          enterKeyHint={enterKeyHint}
          aria-label={ariaLabel}
          data-testid={testId}
          className="onb-bignum font-mono w-[150px] text-center bg-transparent border-0 border-b-2 border-[color:var(--volt)] text-ink text-[58px] font-bold leading-none outline-none pb-1 transition-colors"
        />
        <span className="font-display text-[22px] font-semibold text-ink2">{unit}</span>
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          data-testid={`${testId.replace('-input', '')}-error`}
          className="text-sm text-danger text-center"
        >
          {error}
        </p>
      ) : (
        <p className="text-xs text-ink3 text-center">{helper}</p>
      )}
      <style>{`.onb-bignum::-webkit-inner-spin-button,.onb-bignum::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}`}</style>
    </div>
  );
}
