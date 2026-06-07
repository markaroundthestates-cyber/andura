// ══ NUMBER FIELD — select-all-on-tap + decimal-safe numeric input ════════
// Extracted from Workout/SetLogInput.tsx (commit d42e7a6c) so the same fix can
// be reused outside the set-logging flow (Progres inputs share the bug).
//
// SELECT-ALL-ON-TAP FIX (2026-06-07, Daniel live "aveam 90, vreau 95, se face
// 9590.0"): a type="number" field + onFocus .select() never selects-all because
// .select()/setSelectionRange are a NO-OP on type="number" in most browsers, so
// the first keystroke INSERTS into the old value instead of replacing it. Fix:
// type="text" + inputMode (numeric keypad stays on mobile) so .select() works →
// the first keystroke after tap replaces the whole value.
//
// type="text" is uncontrolled-feeling from a parent that owns a NUMBER (a
// controlled value={String(n)} strips an in-progress trailing "." on re-render
// so you can't type "9.5"). So NumberField keeps a LOCAL text buffer: the buffer
// survives mid-typing (".", "9."), parses to a number for the parent, and
// RESYNCS from the parent only when the parent value changes EXTERNALLY (±
// steppers, target prefill) — guarded so the user's own typing is never
// clobbered (resync only when the parsed buffer differs from the incoming value
// AND that value is not just the parent echoing our own onChange back).

import type { JSX, FocusEvent, ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

export function sanitizeNum(raw: string, allowDecimal: boolean): string {
  // Keep digits; for kg keep a single decimal point (first one wins).
  let cleaned = raw.replace(allowDecimal ? /[^0-9.]/g : /[^0-9]/g, '');
  if (allowDecimal) {
    const firstDot = cleaned.indexOf('.');
    if (firstDot !== -1) {
      cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
    }
  }
  return cleaned;
}

// Number → the buffer string shown when the value arrives from the parent.
// 0/NaN → empty (so a leading "0" is never glued in front, smoke #4 "022" fix).
export function numToBuffer(n: number): string {
  return Number.isFinite(n) && n > 0 ? String(n) : '';
}

interface NumberFieldProps {
  value: number;
  onChange: (n: number) => void;
  allowDecimal: boolean; // kg → true (decimal plates 186.5), reps → false
  inputMode: 'decimal' | 'numeric';
  id: string;
  testId: string;
  className: string;
  required?: boolean | undefined;
  'aria-required'?: 'true' | undefined;
  'aria-invalid'?: 'true' | undefined;
  'aria-describedby'?: string | undefined;
}

export function NumberField({
  value,
  onChange,
  allowDecimal,
  inputMode,
  id,
  testId,
  className,
  ...aria
}: NumberFieldProps): JSX.Element {
  const [buffer, setBuffer] = useState(() => numToBuffer(value));
  // Track the last numeric value WE emitted so an external change (stepper /
  // prefill) can be told apart from the parent simply echoing our own onChange
  // back as a prop — only the former should overwrite an in-progress buffer.
  const lastEmitted = useRef(value);

  useEffect(() => {
    // Resync only when the parent value diverged from what the buffer currently
    // parses to (external ± / prefill). If they match, the parent is just
    // echoing our keystroke — leave the buffer (keeps a trailing "9." alive).
    const parsed = buffer === '' ? 0 : Number(buffer);
    if (value !== parsed && value !== lastEmitted.current) {
      setBuffer(numToBuffer(value));
    }
    lastEmitted.current = value;
  }, [value, buffer]);

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    const next = sanitizeNum(e.target.value, allowDecimal);
    setBuffer(next);
    const n = next === '' || next === '.' ? 0 : Number(next);
    lastEmitted.current = n;
    onChange(Number.isFinite(n) ? n : 0);
  }

  // SELECT-ALL on tap: with type="text" .select() works → first keystroke
  // replaces the whole value (no more "9590").
  function handleFocus(e: FocusEvent<HTMLInputElement>): void {
    e.currentTarget.select();
  }

  return (
    <input
      id={id}
      type="text"
      inputMode={inputMode}
      value={buffer}
      onChange={handleChange}
      onFocus={handleFocus}
      data-testid={testId}
      className={className}
      {...aria}
    />
  );
}
