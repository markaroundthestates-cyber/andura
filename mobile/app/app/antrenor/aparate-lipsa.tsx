// ══ APARATE LIPSA (RN port, route '/app/antrenor/aparate-lipsa') ══════════
// RN twin of src/react/routes/screens/antrenor/AparateLipsa.tsx. Permanent
// missing-equipment picker (home gym / sala mica) — distinct from EquipmentSwap
// (temporarily busy). The selection persists durably via
// scheduleAdapter.setMissingEquipment (kv-backed wv2-missing-equipment) so
// getDailyWorkout filters/substitutes exercises needing absent equipment on the
// next composition. ALL store/engine logic kept 1:1: hydrate from
// getMissingEquipment, origin-aware save (from:'workout' → workout-preview with
// the just-selected items mapped to coarse types via translateMissingToCoarse;
// else → Cont). Web read location.state.from → RN reads the `from` param. The
// 10 EQUIPMENT_ITEMS keep the Slice 1.7 LOCKED naming order. testIDs kept
// (aparate-lipsa / -back / aparate-save + per-item data-item → testID).

import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { gotoPath } from '../../../lib/nav';
import { SubHeader } from '../../../components/SubHeader';
import {
  getMissingEquipment,
  setMissingEquipment,
} from '../../../../src/engine/schedule/scheduleAdapter.js';
import { translateMissingToCoarse } from '../../../../src/engine/equipmentMap.js';
import { accent, dark, radius, surface, withAlpha } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

interface EquipmentItem {
  id: string;
}

// Slice 1.7 LOCKED naming order verbatim. Labels flow through i18n.
const EQUIPMENT_ITEMS: readonly EquipmentItem[] = [
  { id: 'banca-inclinata' },
  { id: 'banca-plana' },
  { id: 'bara-halterelor' },
  { id: 'gantere' },
  { id: 'aparat-cablu' },
  { id: 'power-rack' },
  { id: 'leg-press' },
  { id: 'aparat-extensii' },
  { id: 'aparat-tractiuni' },
  { id: 'banda-elastica' },
];

export default function AparateLipsa(): React.JSX.Element {
  const params = useLocalSearchParams<{ from?: string }>();
  // Origin discriminator: workout flow (CevaNuMerge) passes from:'workout' →
  // save returns to workout-preview for immediate session adapt. Cont/settings
  // entry passes nothing → save returns to Cont.
  const from = params.from;
  // Hydrate from persistence — the previous selection survives reload.
  const [missing, setMissing] = useState<Set<string>>(() => new Set(getMissingEquipment()));

  function toggle(itemId: string): void {
    setMissing((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function handleSave(): void {
    // Persist durable — getDailyWorkout consumes wv2-missing-equipment at the
    // next composition (excludes/substitutes the affected exercises).
    setMissingEquipment(Array.from(missing));
    if (from === 'workout') {
      // Immediate hand-off. WorkoutPreview consumes equipmentContext.
      // busyCoarseTypes — map the just-selected picker IDs to their coarse
      // equipment_type(s) so the preview re-skins the affected rows NOW.
      router.push({
        pathname: gotoPath('workout-preview'),
        params: {
          equipmentContext: JSON.stringify({
            busyCoarseTypes: translateMissingToCoarse(Array.from(missing)),
          }),
        },
      } as never);
    } else {
      router.push(gotoPath('cont') as never);
    }
  }

  function handleBack(): void {
    router.back();
  }

  return (
    <View testID="aparate-lipsa" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader title={t('aparatLipsa.subHeaderTitle')} onBack={handleBack} testIdBack="aparate-lipsa-back" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <Text className="font-display" style={{ fontSize: 16, color: dark.ink2, marginBottom: 12 }}>
          {t('aparatLipsa.introPre')}
          <Text style={{ fontWeight: '700', color: dark.ink }}>{t('aparatLipsa.introBold')}</Text>
          {t('aparatLipsa.introPost')}
        </Text>
        <Text style={{ fontSize: 14, color: dark.ink3, marginBottom: 24 }}>{t('aparatLipsa.intro2')}</Text>

        <View style={{ gap: 8, marginBottom: 24 }}>
          {EQUIPMENT_ITEMS.map((item) => {
            const selected = missing.has(item.id);
            const label = t(`equipmentList.items.${item.id}`);
            return (
              <Pressable
                key={item.id}
                testID={`aparate-lipsa-item-${item.id}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={label}
                onPress={() => toggle(item.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 14,
                  borderRadius: radius.sm,
                  borderWidth: 1,
                  backgroundColor: selected ? withAlpha(accent.volt, 0.16) : surface.base,
                  borderColor: selected ? accent.volt : dark.line,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selected ? accent.volt : 'transparent',
                    borderWidth: selected ? 0 : 1,
                    borderColor: dark.lineStrong,
                  }}
                >
                  {selected && <Check size={15} color={dark.onAccent} strokeWidth={3} />}
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: selected ? dark.ink : dark.ink2 }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="font-serif" style={{ fontSize: 14, fontStyle: 'italic', lineHeight: 22, color: dark.ink3, marginBottom: 24 }}>
          {t('aparatLipsa.learnNote')}
        </Text>
        <Pressable
          testID="aparate-save"
          accessibilityRole="button"
          onPress={handleSave}
          style={{ paddingVertical: 16, backgroundColor: accent.volt, borderRadius: 14 }}
        >
          <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '700', color: dark.onAccent }}>
            {t('aparatLipsa.saveCta')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
