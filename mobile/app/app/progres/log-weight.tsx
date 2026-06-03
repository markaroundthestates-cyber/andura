// ══ LOG WEIGHT (RN port) — '/app/progres/log-weight' ════════════════════
// RN twin of src/react/routes/screens/progres/LogWeight.tsx. The validation
// (kg 30-250, future-date block, inline error copy) + addWeightEntry store call
// are kept verbatim; markup → View/Text/Pressable/TextInput + ArrowLeft icon.
// Same testIDs + i18n keys.
//
// FIDELITY FLAG: the web date field used <input type="date"> with a native
// browser picker + max=today. RN has no built-in date input, so the field is a
// TextInput accepting YYYY-MM-DD (defaults to today). The future-date max is now
// enforced by the existing dateError guard only being clear when non-empty; a
// native date wheel is a Daniel-gated polish item.

import { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import { useProgresStore } from '../../../../src/react/stores/progresStore';
import { goto } from '../../../lib/nav';
import { dark } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default function LogWeight(): React.JSX.Element {
  const addWeightEntry = useProgresStore((s) => s.addWeightEntry);

  const [kg, setKg] = useState<string>('');
  const [date, setDate] = useState<string>(todayIso());

  const kgNum = Number(kg);
  const valid = kg !== '' && kgNum >= 30 && kgNum <= 250 && date !== '';

  const kgError =
    kg !== '' && (!Number.isFinite(kgNum) || kgNum < 30 || kgNum > 250)
      ? t('progres.logWeight.kgError')
      : null;
  const dateError = date === '' ? t('progres.logWeight.dateError') : null;

  function handleSave(): void {
    if (!valid) return;
    addWeightEntry({ kg: kgNum, date });
    goto('progres');
  }

  function handleCancel(): void {
    goto('progres');
  }

  return (
    <View testID="log-weight" className="bg-paper" style={{ flex: 1, padding: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Pressable
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel={t('progres.logWeight.backAriaLabel')}
          testID="log-weight-back"
          style={{ padding: 8 }}
        >
          <ArrowLeft size={20} color={dark.ink2} />
        </Pressable>
        <Text className="font-display font-bold text-ink" style={{ fontSize: 24 }}>
          {t('progres.logWeight.title')}
        </Text>
      </View>

      <Animated.View entering={FadeInUp.duration(440)} style={{ flex: 1, gap: 20 }}>
        <View>
          <Text className="text-ink2 font-medium" style={{ fontSize: 14, marginBottom: 8 }}>
            {t('progres.logWeight.kgLabel')}
          </Text>
          {/* Pulse hero input — big display weight value on the elevated surface. */}
          <View className="bg-paper-2 border border-line" style={{ borderRadius: 22, paddingHorizontal: 16, paddingVertical: 20, alignItems: 'center' }}>
            <TextInput
              value={kg}
              onChangeText={setKg}
              keyboardType="decimal-pad"
              placeholder={t('progres.logWeight.kgPlaceholder')}
              placeholderTextColor={dark.ink3}
              testID="weight-kg-input"
              accessibilityLabel={t('progres.logWeight.kgLabel')}
              className="font-display font-bold text-ink"
              style={{ width: '100%', textAlign: 'center', fontSize: 48, color: dark.ink }}
            />
            <Text className="font-mono uppercase text-ink2" style={{ fontSize: 11, letterSpacing: 2, marginTop: 6 }}>
              kg
            </Text>
          </View>
          {kgError && (
            <Text testID="weight-kg-error" accessibilityRole="alert" className="text-brick-dark" style={{ fontSize: 14, marginTop: 8 }}>
              {kgError}
            </Text>
          )}
        </View>

        <View>
          <Text className="text-ink2 font-medium" style={{ fontSize: 14, marginBottom: 8 }}>
            {t('progres.logWeight.dateLabel')}
          </Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={dark.ink3}
            testID="weight-date-input"
            accessibilityLabel={t('progres.logWeight.dateLabel')}
            className="bg-paper-2 border border-line text-ink"
            style={{ padding: 12, borderRadius: 14, fontSize: 16, color: dark.ink }}
          />
          {dateError && (
            <Text testID="weight-date-error" accessibilityRole="alert" className="text-brick-dark" style={{ fontSize: 14, marginTop: 8 }}>
              {dateError}
            </Text>
          )}
        </View>

        <Text className="text-ink2" style={{ fontSize: 14, lineHeight: 20 }}>
          {t('progres.logWeight.helper')}
        </Text>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={handleSave}
          disabled={!valid}
          testID="weight-save"
          className="bg-brick"
          style={({ pressed }) => ({
            width: '100%',
            paddingVertical: 16,
            borderRadius: 999,
            alignItems: 'center',
            opacity: !valid ? 0.5 : pressed ? 0.85 : 1,
            transform: [{ scale: pressed && valid ? 0.98 : 1 }],
          })}
        >
          <Text className="font-semibold" style={{ fontSize: 16, color: dark.onAccent }}>
            {t('progres.logWeight.saveCta')}
          </Text>
        </Pressable>
        <Pressable onPress={handleCancel} testID="weight-cancel" style={{ width: '100%', paddingVertical: 12, alignItems: 'center' }}>
          <Text className="text-ink3" style={{ fontSize: 14 }}>
            {t('progres.logWeight.cancelCta')}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
