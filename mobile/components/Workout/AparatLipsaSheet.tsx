// ══ APARAT LIPSA SHEET (RN port) — in-session missing-equipment picker ════
// RN twin of src/react/components/Workout/AparatLipsaSheet.tsx. A bottom sheet
// (RN Modal) over the log zone (NOT full-screen — keeps session context). The
// 10 EQUIPMENT_ITEMS are re-imported from the SoT list; already-missing items
// are pre-checked from getMissingEquipment (scheduleAdapter → kv). Salveaza
// persists via setMissingEquipment + reports the new list to the parent (which
// decides whether to recompose the current exercise). Inchide cancels. The
// store logic + persistence shape are kept 1:1. testIDs kept (aparat-lipsa-
// sheet-backdrop / -sheet / -item-{id} / -save / -close).

import { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import {
  getMissingEquipment,
  setMissingEquipment,
} from '../../../src/engine/schedule/scheduleAdapter.js';
import { accent, dark, surface, withAlpha } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

export interface EquipmentItem {
  id: string;
}

// Mirrors AparateLipsa EQUIPMENT_ITEMS verbatim (Slice 1.7 LOCKED naming order).
export const APARAT_LIPSA_ITEMS: readonly EquipmentItem[] = [
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

interface AparatLipsaSheetProps {
  open: boolean;
  onConfirm: (missing: readonly string[]) => void;
  onClose: () => void;
}

export function AparatLipsaSheet({ open, onConfirm, onClose }: AparatLipsaSheetProps): React.JSX.Element | null {
  // Re-hydrate from persistence each open (Cont-side changes surface; cancel
  // doesn't leak the prior open's draft).
  const [missing, setMissing] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!open) return;
    setMissing(new Set(getMissingEquipment()));
  }, [open]);

  if (!open) return null;

  function toggle(id: string): void {
    setMissing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave(): void {
    const list = Array.from(missing);
    // Persist FIRST so Cont -> AparateLipsa hydrates the new state on next mount
    // (the kv-backed shape is shared with that screen — no extra wiring needed).
    setMissingEquipment(list);
    onConfirm(list);
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        testID="aparat-lipsa-sheet-backdrop"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
      >
        <Pressable
          testID="aparat-lipsa-sheet"
          accessibilityViewIsModal
          accessibilityLabel={t('workout.aparatLipsaSheet.title')}
          onPress={() => {}}
          style={{ backgroundColor: dark.paper, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '80%' }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: dark.ink, marginBottom: 4 }}>{t('workout.aparatLipsaSheet.title')}</Text>
          <Text style={{ fontSize: 14, color: dark.ink2, marginBottom: 16 }}>{t('workout.aparatLipsaSheet.subtitle')}</Text>
          <ScrollView style={{ marginBottom: 16 }}>
            <View style={{ gap: 8 }}>
              {APARAT_LIPSA_ITEMS.map((item) => {
                const selected = missing.has(item.id);
                const label = t(`equipmentList.items.${item.id}`);
                return (
                  <Pressable
                    key={item.id}
                    testID={`aparat-lipsa-sheet-item-${item.id}`}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={label}
                    onPress={() => toggle(item.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: selected ? withAlpha(accent.volt, 0.1) : surface.base,
                      borderWidth: 1,
                      borderColor: selected ? accent.volt : dark.line,
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selected ? accent.volt : 'transparent',
                        borderWidth: selected ? 0 : 1,
                        borderColor: dark.lineStrong,
                      }}
                    >
                      {selected && <Check size={14} color={dark.onAccent} strokeWidth={2.6} />}
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: dark.ink }}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          <Pressable
            testID="aparat-lipsa-sheet-save"
            accessibilityRole="button"
            onPress={handleSave}
            style={{ paddingVertical: 12, backgroundColor: accent.volt, borderRadius: 14, minHeight: 44, justifyContent: 'center' }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('workout.aparatLipsaSheet.saveCta')}</Text>
          </Pressable>
          <Pressable testID="aparat-lipsa-sheet-close" accessibilityRole="button" onPress={onClose} style={{ paddingVertical: 10, marginTop: 8 }}>
            <Text style={{ textAlign: 'center', fontSize: 14, color: dark.ink2 }}>{t('workout.aparatLipsaSheet.closeCta')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
