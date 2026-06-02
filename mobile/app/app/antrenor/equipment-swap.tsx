// ══ EQUIPMENT SWAP (RN port, route '/app/antrenor/equipment-swap') ════════
// RN twin of src/react/routes/screens/antrenor/EquipmentSwap.tsx. WP-5 moat:
// busy machines → NAMED inline alternatives shown BEFORE confirming. Each item
// maps to coarse equipment_type(s); marking busy (a) shows inline the real
// alternative the user will do for each affected exercise (recomposeWithBusyTypes
// over today's planned session) and (b) forwards the busy COARSE TYPES to
// WorkoutPreview, which recomposes the session with those types unavailable.
// ALL engine logic kept 1:1 (getTodayWorkout async load, per-item swap memo,
// busy-type dedupe). Web passed react-router location.state → RN forwards
// equipmentContext as a JSON-encoded param WorkoutPreview already parses.
// testIDs kept (equipment-swap / -back / equipment-continue + per-item
// data-equipment-id → testID + swap-preview-{id} / swap-preview-row).

import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { gotoPath } from '../../../lib/nav';
import { SubHeader } from '../../../components/SubHeader';
import { getTodayWorkout } from '../../../../src/react/lib/engineWrappers';
import type { PlannedExercise } from '../../../../src/react/lib/engineWrappers';
import { recomposeWithBusyTypes } from '../../../../src/react/lib/substitution';
import { accent, dark, radius, surface, withAlpha } from '../../../lib/tokens';
import { t } from '../../../../src/i18n/index.js';

export type EquipmentStatus = 'available' | 'busy';

export interface EquipmentItem {
  id: string;
  name: string;
  status: EquipmentStatus;
  coarseTypes: readonly string[];
}

const INITIAL_EQUIPMENT: readonly EquipmentItem[] = [
  { id: 'bench', name: 'Bench press', status: 'available', coarseTypes: ['barbell'] },
  { id: 'smith', name: 'Smith machine', status: 'available', coarseTypes: ['machine'] },
  { id: 'lat-pulldown', name: 'Lat pulldown', status: 'available', coarseTypes: ['machine'] },
  { id: 'cable-row', name: 'Cable row', status: 'available', coarseTypes: ['cable'] },
  { id: 'leg-press', name: 'Leg press', status: 'available', coarseTypes: ['machine'] },
];

export default function EquipmentSwap(): React.JSX.Element {
  const [equipment, setEquipment] = useState<readonly EquipmentItem[]>(INITIAL_EQUIPMENT);
  // Today's planned exercises — so the inline preview shows REAL named
  // alternatives for the user's actual session (null while loading / no session).
  const [exercises, setExercises] = useState<readonly PlannedExercise[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getTodayWorkout().then((planned) => {
      if (!cancelled) setExercises(planned?.exercises ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Deduplicated coarse types currently marked busy.
  const busyCoarseTypes = useMemo(() => {
    const set = new Set<string>();
    for (const e of equipment) {
      if (e.status === 'busy') for (const ct of e.coarseTypes) set.add(ct);
    }
    return [...set];
  }, [equipment]);

  // Named swaps PER equipment item — recompose with each busy item's own coarse
  // type(s) unavailable so the inline preview shows exactly the alternatives
  // caused by IT.
  const swapsByItem = useMemo(() => {
    const out: Record<string, Array<{ original: string; alternative: string }>> = {};
    if (!exercises || exercises.length === 0) return out;
    for (const e of equipment) {
      if (e.status !== 'busy') continue;
      const next = recomposeWithBusyTypes(exercises, e.coarseTypes);
      const swaps: Array<{ original: string; alternative: string }> = [];
      for (let i = 0; i < exercises.length; i++) {
        const before = exercises[i]!;
        const after = next[i]!;
        if (after.swapReason && after.name !== before.name) {
          swaps.push({ original: before.name, alternative: after.name });
        }
      }
      out[e.id] = swaps;
    }
    return out;
  }, [exercises, equipment]);

  function toggleStatus(id: string): void {
    setEquipment((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: e.status === 'available' ? 'busy' : 'available' } : e,
      ),
    );
  }

  function handleContinue(): void {
    // Forward the busy COARSE TYPES — WorkoutPreview recomposes the session with
    // them unavailable (the cascade). Empty when nothing busy (no adaptation).
    router.push({
      pathname: gotoPath('workout-preview'),
      params: { equipmentContext: JSON.stringify({ busyCoarseTypes }) },
    } as never);
  }

  function handleBack(): void {
    router.back();
  }

  return (
    <View testID="equipment-swap" style={{ flex: 1, backgroundColor: dark.paper }}>
      <SubHeader title={t('equipmentSwap.subHeaderTitle')} onBack={handleBack} testIdBack="equipment-swap-back" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <Text className="font-display" style={{ fontSize: 24, fontWeight: '700', color: dark.ink, marginBottom: 8 }}>
          {t('equipmentSwap.heading')}
        </Text>
        <Text style={{ fontSize: 16, color: dark.ink2, marginBottom: 24 }}>{t('equipmentSwap.body')}</Text>

        <View style={{ gap: 8, marginBottom: 24 }}>
          {equipment.map((e) => {
            const isBusy = e.status === 'busy';
            const itemSwaps = isBusy ? swapsByItem[e.id] ?? [] : [];
            return (
              <View key={e.id} style={{ gap: 4 }}>
                <Pressable
                  testID={`equipment-item-${e.id}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isBusy }}
                  onPress={() => toggleStatus(e.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 16,
                    borderRadius: radius.sm,
                    borderWidth: 1,
                    backgroundColor: isBusy ? withAlpha(accent.ember, 0.1) : surface.base,
                    borderColor: isBusy ? accent.ember : dark.line,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '500', color: dark.ink }}>{e.name}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: isBusy ? accent.ember : dark.ink2 }}>
                    {isBusy ? t('equipmentSwap.statusBusy') : t('equipmentSwap.statusFree')}
                  </Text>
                </Pressable>
                {/* WP-5 moat — inline NAMED alternative under the busy item. */}
                {itemSwaps.length > 0 && (
                  <View testID={`swap-preview-${e.id}`} style={{ paddingLeft: 8, gap: 2 }}>
                    {itemSwaps.map((s, i) => (
                      <Text key={i} testID="swap-preview-row" style={{ fontSize: 14, color: dark.ink2, paddingVertical: 2 }}>
                        {t('equipmentSwap.swapPreviewPrefix')}{' '}
                        <Text style={{ fontWeight: '500', color: dark.ink }}>{s.alternative}</Text>{' '}
                        {t('equipmentSwap.swapPreviewSuffix', { original: s.original })}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <Pressable
          testID="equipment-continue"
          accessibilityRole="button"
          onPress={handleContinue}
          style={{ paddingVertical: 16, backgroundColor: accent.volt, borderRadius: 14 }}
        >
          <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: dark.onAccent }}>
            {t('equipmentSwap.continueCta')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
