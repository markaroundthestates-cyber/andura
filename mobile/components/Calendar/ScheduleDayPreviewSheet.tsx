// ══ SCHEDULE DAY PREVIEW SHEET (RN W3a STUB — replaced by W3c) ════════════
// Calendar7Day (ported here in W3a because the Antrenor hub renders it) opens a
// read-only per-day preview sheet on a non-edit tap. The full sheet — proposed
// exercises from the live engine for the tapped day — is a W3c deliverable
// (Antrenor post/friction wave, alongside Calendar7Day per the master plan
// split). This minimal placeholder preserves the import edge + the open/onClose
// contract so the weekly editor (toggle/save) is fully functional on W3a.
//
// W3c OWNER: replace with the full RN port of
// src/react/components/Calendar/ScheduleDayPreviewSheet.tsx.

import { Modal, View, Text, Pressable } from 'react-native';
import type { DayKind } from '../../../src/react/stores/scheduleStore';
import { PulseCard } from '../pulse/PulseCard';
import { dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

interface Props {
  open: boolean;
  dayIdx: number | null;
  dayKind: DayKind;
  dayLabel: string;
  onClose: () => void;
}

export function ScheduleDayPreviewSheet({ open, dayKind, dayLabel, onClose }: Props): React.JSX.Element | null {
  if (!open) return null;
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
      >
        <PulseCard testID="schedule-day-preview-sheet" style={{ padding: 20, margin: 12 }}>
          <Text className="font-display" style={{ fontSize: 18, fontWeight: '700', color: dark.ink }}>
            {dayLabel}
          </Text>
          <Text style={{ fontSize: 14, color: dark.ink2, marginTop: 8 }}>
            {dayKind === 'training' ? t('calendar.day7.kindTraining') : t('calendar.day7.kindRest')}
          </Text>
          <Pressable onPress={onClose} style={{ marginTop: 16, alignSelf: 'flex-end' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: dark.brick }}>{t('common.back')}</Text>
          </Pressable>
        </PulseCard>
      </Pressable>
    </Modal>
  );
}
