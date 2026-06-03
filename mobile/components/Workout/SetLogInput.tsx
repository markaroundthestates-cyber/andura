// ══ SET LOG INPUT (RN port) — kg/reps NumDial + 3-mode state machine ══════
// RN twin of src/react/components/Workout/SetLogInput.tsx. Three modes kept 1:1:
//   - 'tinta'   pre-log confirmation: target reference + editable kg/reps tiles
//               pre-filled with the recommendation + "Confirma setul" CTA.
//   - 'post-log' readonly "Tu ai facut X repetari cu Y kg" + pencil edit.
//   - 'editable' default — visible kg/reps tiles (backward-compat callsite).
// Each tile = the big free-type value (TextInput, keyboardType numeric) on its
// own row + the − / + stepper buttons below (web "option B" layout, never
// clips). Leading-0 fix: an empty field shows the placeholder, not "0"; a typed
// value replaces it. stepValue rounds to the grid (kg 0.5, reps 1) + clamps.
// testIDs + bodyweight branches kept verbatim (kg-input / reps-input /
// setlog-tinta* / setlog-postlog*). haptic() is the W3b web-guarded no-op shim.

import { View, Text, TextInput } from 'react-native';
import { Check, Pencil, Minus, Plus } from 'lucide-react-native';
import { PressScale } from '../Press';
import { accent, dark, surface, withAlpha } from '../../lib/tokens';
import { haptic } from '../../lib/motion';
import { t } from '../../../src/i18n/index.js';

export type SetLogInputMode = 'editable' | 'tinta' | 'post-log';

// Round to the step grid so a 0.5 nudge off a typed 22.3 lands on 22.5/22.0.
function stepValue(current: number, delta: number, min: number, max: number): number {
  const base = Number.isFinite(current) ? current : 0;
  const next = Math.round((base + delta) * 2) / 2;
  return Math.min(max, Math.max(min, next));
}

interface DialButtonProps {
  dir: 'down' | 'up';
  onPress: () => void;
  ariaLabel: string;
  testID: string;
}

function DialButton({ dir, onPress, ariaLabel, testID }: DialButtonProps): React.JSX.Element {
  return (
    <PressScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={ariaLabel}
      onPress={() => {
        haptic(8);
        onPress();
      }}
      style={{
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: surface.base,
        borderWidth: 1,
        borderColor: dark.line,
      }}
    >
      {dir === 'down' ? <Minus size={16} color={dark.ink} /> : <Plus size={16} color={dark.ink} />}
    </PressScale>
  );
}

// Shared numeric tile (label + big TextInput value + ± steppers). One tile
// renders for kg, one for reps; both reuse this so the layout stays single-source.
interface DialTileProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  testID: string;
  min: number;
  max: number;
  step: number;
  decreaseLabel: string;
  increaseLabel: string;
  minusTestID: string;
  plusTestID: string;
}

function DialTile({
  label,
  value,
  onChange,
  testID,
  min,
  max,
  step,
  decreaseLabel,
  increaseLabel,
  minusTestID,
  plusTestID,
}: DialTileProps): React.JSX.Element {
  const display = Number.isFinite(value) && value > 0 ? String(value) : '';
  return (
    <View style={{ flex: 1, borderRadius: 16, padding: 12, backgroundColor: surface.s2, borderWidth: 1, borderColor: dark.line }}>
      <Text className="font-mono uppercase" style={{ fontSize: 10.5, letterSpacing: 1.9, color: dark.ink2, textAlign: 'center' }}>
        {label}
      </Text>
      <TextInput
        testID={testID}
        value={display}
        onChangeText={(text) => onChange(text === '' ? 0 : Number(text))}
        keyboardType={step < 1 ? 'decimal-pad' : 'number-pad'}
        selectTextOnFocus
        className="font-display"
        style={{ fontSize: 22, lineHeight: 30, fontWeight: '700', color: dark.ink, textAlign: 'center', paddingVertical: 4, marginTop: 8 }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
        <DialButton dir="down" onPress={() => onChange(stepValue(value, -step, min, max))} ariaLabel={decreaseLabel} testID={minusTestID} />
        <DialButton dir="up" onPress={() => onChange(stepValue(value, step, min, max))} ariaLabel={increaseLabel} testID={plusTestID} />
      </View>
    </View>
  );
}

interface SetLogInputProps {
  kg: number;
  reps: number;
  onKgChange: (n: number) => void;
  onRepsChange: (n: number) => void;
  mode?: SetLogInputMode;
  onLog?: () => void;
  onEdit?: () => void;
  isBodyweight?: boolean;
}

export function SetLogInput({
  kg,
  reps,
  onKgChange,
  onRepsChange,
  mode = 'editable',
  onLog,
  onEdit,
  isBodyweight = false,
}: SetLogInputProps): React.JSX.Element {
  if (mode === 'tinta') {
    return (
      <View testID="setlog-tinta" style={{ borderRadius: 22, padding: 18, marginBottom: 24, backgroundColor: surface.base, borderWidth: 1, borderColor: dark.line }}>
        <Text className="font-mono uppercase" style={{ fontSize: 10.5, letterSpacing: 1.9, textAlign: 'center', color: accent.aqua }}>
          {t('setLog.targetLabel')}
        </Text>
        <View testID="setlog-tinta-target-display" style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginTop: 8, marginBottom: 16 }}>
          <Text testID="setlog-tinta-reps" className="font-display" style={{ fontSize: 24, fontWeight: '700', color: dark.ink }}>
            {reps}
          </Text>
          {isBodyweight ? (
            <Text testID="setlog-tinta-bw" style={{ fontSize: 14, color: dark.ink2 }}>
              {t('setLog.bodyweightTargetReps')}
            </Text>
          ) : (
            <>
              <Text style={{ fontSize: 14, color: dark.ink2 }}>{t('setLog.targetReps')}</Text>
              <Text testID="setlog-tinta-kg" className="font-display" style={{ fontSize: 24, fontWeight: '700', color: dark.ink, marginLeft: 8 }}>
                {kg} kg
              </Text>
            </>
          )}
        </View>

        <Text className="font-mono uppercase" style={{ fontSize: 10.5, letterSpacing: 1.9, color: dark.ink2, marginBottom: 8, textAlign: 'center' }}>
          {t('setLog.askDoneLabel')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <DialTile
            label={isBodyweight ? t('setLog.addedWeightLabel') : t('setLog.kgLabel')}
            value={kg}
            onChange={onKgChange}
            testID="setlog-tinta-kg-input"
            min={0}
            max={500}
            step={0.5}
            decreaseLabel={t('setLog.kgDecrease')}
            increaseLabel={t('setLog.kgIncrease')}
            minusTestID="setlog-tinta-kg-minus"
            plusTestID="setlog-tinta-kg-plus"
          />
          <DialTile
            label={t('setLog.repsLabel')}
            value={reps}
            onChange={onRepsChange}
            testID="setlog-tinta-reps-input"
            min={0}
            max={100}
            step={1}
            decreaseLabel={t('setLog.repsDecrease')}
            increaseLabel={t('setLog.repsIncrease')}
            minusTestID="setlog-tinta-reps-minus"
            plusTestID="setlog-tinta-reps-plus"
          />
        </View>

        <PressScale
          testID="setlog-tinta-log-btn"
          accessibilityRole="button"
          disabled={!Number.isFinite(reps) || reps < 1}
          onPress={() => {
            haptic(12);
            onLog?.();
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: 12,
            borderRadius: 999,
            minHeight: 44,
            backgroundColor: accent.volt,
            opacity: !Number.isFinite(reps) || reps < 1 ? 0.5 : 1,
          }}
        >
          <Check size={20} color={dark.onAccent} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('setLog.confirmSetCta')}</Text>
        </PressScale>
      </View>
    );
  }

  if (mode === 'post-log') {
    return (
      <View testID="setlog-postlog" style={{ borderRadius: 22, padding: 18, marginBottom: 24, backgroundColor: surface.base, borderWidth: 1, borderColor: dark.line }}>
        <Text className="font-mono uppercase" style={{ fontSize: 10.5, letterSpacing: 1.9, color: dark.ink2, marginBottom: 8 }}>
          {t('setLog.youDidLabel')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text testID="setlog-postlog-text" style={{ flex: 1, fontSize: 16, color: dark.ink }}>
            <Text className="font-display" style={{ fontSize: 30, fontWeight: '700', color: dark.ink }}>
              {reps}
            </Text>
            {isBodyweight ? (
              <>
                <Text style={{ fontSize: 14, color: dark.ink2 }}> {t('setLog.youDidBodyweight')} </Text>
                {Number.isFinite(kg) && kg > 0 && (
                  <Text className="font-display" style={{ fontSize: 30, fontWeight: '700', color: dark.ink }}>
                    +{kg} kg
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={{ fontSize: 14, color: dark.ink2 }}> {t('setLog.youDidRepsWith')} </Text>
                <Text className="font-display" style={{ fontSize: 30, fontWeight: '700', color: dark.ink }}>
                  {kg} kg
                </Text>
              </>
            )}
          </Text>
          <PressScale
            testID="setlog-postlog-edit"
            accessibilityRole="button"
            accessibilityLabel={t('setLog.editAriaLabel')}
            onPress={onEdit}
            style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 999 }}
          >
            <Pencil size={16} color={dark.ink2} />
          </PressScale>
        </View>
      </View>
    );
  }

  // Default 'editable' — visible kg/reps tiles. kg bounds 1-500 loaded / 0-500
  // bodyweight (added). Inline error text mirrors the web a11y spec.
  const kgInvalid = !Number.isFinite(kg) || kg < (isBodyweight ? 0 : 1) || kg > 500;
  const repsInvalid = !Number.isFinite(reps) || reps < 1 || reps > 100;
  return (
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
      <View style={{ flex: 1 }}>
        <DialTile
          label={isBodyweight ? t('setLog.addedWeightLabel') : t('setLog.kgLabelRequired')}
          value={kg}
          onChange={onKgChange}
          testID="kg-input"
          min={isBodyweight ? 0 : 1}
          max={500}
          step={0.5}
          decreaseLabel={isBodyweight ? t('setLog.addedWeightDecrease') : t('setLog.kgDecrease')}
          increaseLabel={isBodyweight ? t('setLog.addedWeightIncrease') : t('setLog.kgIncrease')}
          minusTestID="kg-minus"
          plusTestID="kg-plus"
        />
        {kgInvalid && (
          <Text testID="kg-input-error" accessibilityRole="alert" style={{ marginTop: 4, fontSize: 12, color: withAlpha(accent.emberRed, 1) }}>
            {t('setLog.kgError')}
          </Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <DialTile
          label={t('setLog.repsLabelRequired')}
          value={reps}
          onChange={onRepsChange}
          testID="reps-input"
          min={1}
          max={100}
          step={1}
          decreaseLabel={t('setLog.repsDecrease')}
          increaseLabel={t('setLog.repsIncrease')}
          minusTestID="reps-minus"
          plusTestID="reps-plus"
        />
        {repsInvalid && (
          <Text testID="reps-input-error" accessibilityRole="alert" style={{ marginTop: 4, fontSize: 12, color: withAlpha(accent.emberRed, 1) }}>
            {t('setLog.repsError')}
          </Text>
        )}
      </View>
    </View>
  );
}
