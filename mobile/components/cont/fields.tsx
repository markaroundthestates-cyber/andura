// ══ CONT — shared form-field primitives (RN port) ════════════════════════
// RN twins of the web's settingsProfile/rows.tsx (LabelRow / SelectRow) PLUS
// the RN replacements for the web form CONTROLS that have no native primitive:
//   - web <input type="number">  → NumberField (RN TextInput, numeric keyboard)
//   - web <select>               → SegmentedField (inline single-choice chips —
//                                   RN has no native dropdown; the option set is
//                                   tiny here, so an inline segmented control is
//                                   the honest, tap-friendly RN idiom)
//   - web <input type="checkbox">→ the shared Toggle (mobile/components/Toggle)
// All keep the SAME testID + value/onChange contract + i18n labels as the web
// source. Pulse field idiom (global.css .pulse-field: --surface-2 glass fill +
// hairline --line border) is reproduced with the dark tokens.

import type { ReactNode } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { accent, withAlpha } from '../../lib/tokens';
import { useTheme } from '../../lib/theme';

// ── LabelRow — row text on the left, control on the right ────────────────────
// RN twin of rows.tsx LabelRow. The web wrapped INPUT children in <label> for
// implicit binding; on RN the TextInput owns its own accessibility, so this is
// a plain flex row with the same padding + hairline divider rhythm.
export function LabelRow({
  label,
  isLast = false,
  children,
}: {
  label: string;
  isLast?: boolean;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.line,
      }}
    >
      <Text style={{ fontSize: 14, color: colors.ink, flexShrink: 1 }}>{label}</Text>
      {children}
    </View>
  );
}

// ── NumberField — RN replacement for <input type="number"> ───────────────────
// String value/onChange exactly like the web inputs (the parent owns parsing).
// `decimal`/`numeric` keyboard mirrors the web inputMode. Right-aligned, fixed
// 80px width matching the web `w-20`.
export function NumberField({
  value,
  onChangeText,
  testID,
  decimal = false,
  disabled = false,
  placeholder,
  invalid = false,
}: {
  value: string;
  onChangeText: (v: string) => void;
  testID: string;
  decimal?: boolean;
  disabled?: boolean;
  placeholder?: string;
  invalid?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <TextInput
      testID={testID}
      value={value}
      onChangeText={onChangeText}
      editable={!disabled}
      placeholder={placeholder}
      placeholderTextColor={colors.ink3}
      keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
      style={{
        width: 80,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: invalid ? colors.brick : colors.line,
        backgroundColor: colors.surface.s2,
        color: colors.ink,
        fontSize: 14,
        textAlign: 'right',
        opacity: disabled ? 0.5 : 1,
      }}
    />
  );
}

// ── SegmentedField — RN replacement for <select> (inline single-choice) ──────
// The web used a native <select> dropdown; RN has none. The option sets here
// (sex, frequency, experience, training-type, focus) are small, so inline
// chips are the clearest tap-friendly mapping. The selected chip carries the
// Pulse gradient wash (matching the segmented toggles elsewhere); each chip
// keeps the per-option testID from the web <option>'s parent <select> contract
// is preserved by giving the FIELD the parent select testID and each chip a
// derived `${testID}-${value}` id (tests target the field + can tap a chip).
export interface SegmentOption<V extends string> {
  value: V;
  label: string;
}

export function SegmentedField<V extends string>({
  value,
  options,
  onChange,
  testID,
}: {
  value: V | '';
  options: ReadonlyArray<SegmentOption<V>>;
  onChange: (v: V) => void;
  testID: string;
}) {
  const { colors } = useTheme();
  return (
    <View testID={testID} style={{ flexDirection: 'row', gap: 6, flexShrink: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            testID={`${testID}-${opt.value}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            onPress={() => onChange(opt.value)}
            style={{ borderRadius: 999, overflow: 'hidden' }}
          >
            {selected ? (
              <LinearGradient
                colors={[accent.volt, accent.aqua]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingHorizontal: 12, paddingVertical: 7 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.onAccent }}>{opt.label}</Text>
              </LinearGradient>
            ) : (
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  backgroundColor: colors.surface.s2,
                  borderWidth: 1,
                  borderColor: colors.line,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink2 }}>{opt.label}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Card — the Pulse glass card wrapper (.pulse-card) ────────────────────────
// A rounded translucent surface used for grouped rows. Matches the web
// `.pulse-card` / `.pulse-card-tight` look with the dark tokens.
export function Card({ children, style }: { children: ReactNode; style?: object }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: withAlpha(colors.paper2, 0.9),
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: 18,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ── ZoneHeading — mono uppercase wide-tracked section eyebrow ────────────────
// RN twin of the web `font-mono text-[11px] uppercase tracking-[0.14em]` label
// (Cont section heading + the settings sub-screen headings). Danger keeps the
// warm brick-dark flag.
export function ZoneHeading({ children, danger = false }: { children: ReactNode; danger?: boolean }) {
  const { colors } = useTheme();
  return (
    <Text
      className="font-mono uppercase"
      style={{
        fontSize: 11,
        letterSpacing: 1.5,
        fontWeight: '600',
        color: danger ? colors.brickDark : colors.ink3,
        marginTop: 24,
        marginBottom: 12,
      }}
    >
      {children}
    </Text>
  );
}
