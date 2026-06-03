// ══ ONBOARDING — Pulse big-number field (RN port) ═════════════════════════
// Twin of src/react/routes/screens/onboarding/BigNumberField.tsx. A thin
// presentation wrapper — all the brain (NaN guard, store commit, bounds, aria)
// is passed in by the calling step so age/kg/cm keep their exact testIDs +
// validation. Markup -> View/Text/TextInput; the web's huge centered figure on a
// volt underline + unit beside + helper/error line is reproduced. The web
// type="number" -> RN keyboardType (numeric/decimal-pad). The error testID
// derives from the input testId exactly as on web (`${testId minus -input}-error`).

import { View, Text, TextInput } from 'react-native';
import { dark, accent } from '../../lib/tokens';

export interface NumericStepProps {
  value: number | null;
  onChange: (v: number | null) => void;
}

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
  errorId,
  testId,
  ariaLabel,
  placeholder,
  inputMode,
  enterKeyHint,
}: BigNumberFieldProps): React.JSX.Element {
  return (
    <View style={{ alignItems: 'center', gap: 12, paddingTop: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
        <TextInput
          value={value == null ? '' : String(value)}
          // Paste of non-numeric ("abc") yields Number("abc")=NaN -> guard with
          // Number.isFinite before commit (web parity).
          onChangeText={(v) => {
            if (!v) return onChange(null);
            const n = Number(v);
            onChange(Number.isFinite(n) ? n : null);
          }}
          placeholder={placeholder}
          placeholderTextColor={dark.ink3}
          keyboardType={inputMode === 'decimal' ? 'decimal-pad' : 'number-pad'}
          returnKeyType={enterKeyHint === 'done' ? 'done' : 'next'}
          // Web parity (web BigNumberField input autoComplete="off"): RNW defaults
          // the DOM autocomplete attr to "on" when this prop is omitted, which lets
          // the browser overlay an autofill label (e.g. a saved "EGN"/personal-number
          // entry) on these bare numeric fields. "off" suppresses it.
          autoComplete="off"
          accessibilityLabel={ariaLabel}
          testID={testId}
          className="font-mono font-bold text-ink"
          style={{
            width: 150,
            textAlign: 'center',
            fontSize: 58,
            lineHeight: 60,
            color: dark.ink,
            borderBottomWidth: 2,
            borderBottomColor: accent.volt,
            paddingBottom: 4,
          }}
        />
        <Text className="font-display font-semibold text-ink2" style={{ fontSize: 22 }}>{unit}</Text>
      </View>
      {error ? (
        <Text
          nativeID={errorId}
          accessibilityRole="alert"
          testID={`${testId.replace('-input', '')}-error`}
          className="text-brick-dark"
          style={{ fontSize: 14, textAlign: 'center' }}
        >
          {error}
        </Text>
      ) : (
        <Text className="text-ink3" style={{ fontSize: 12, textAlign: 'center' }}>{helper}</Text>
      )}
    </View>
  );
}
