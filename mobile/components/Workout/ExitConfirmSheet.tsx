// ══ EXIT CONFIRM SHEET (RN port) — 3-option bottom sheet ══════════════════
// RN twin of src/react/components/Workout/ExitConfirmSheet.tsx. Bottom sheet
// (RN Modal) with Continui / Salveaza / Termina mai devreme / Renunt + the
// dynamic progress line. The web's DOM focus-trap + Escape handling is replaced
// by the native Modal contract: the Android back button + the backdrop tap both
// resolve to 'continue' (the safe close, identical to the web semantic).
// testIDs kept (exit-sheet-backdrop / exit-sheet / exit-continue / -pause /
// -finish-early / -discard).

import { Text, Pressable, Modal } from 'react-native';
import { accent, dark } from '../../lib/tokens';
import { t } from '../../../src/i18n/index.js';

export type ExitAction = 'continue' | 'pause' | 'discard' | 'finish-early';

interface ExitConfirmSheetProps {
  open: boolean;
  exIdx: number; // 0-indexed
  totalExercises: number;
  onChoose: (action: ExitAction) => void;
}

export function ExitConfirmSheet({
  open,
  exIdx,
  totalExercises,
  onChoose,
}: ExitConfirmSheetProps): React.JSX.Element | null {
  if (!open) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => onChoose('continue')}>
      <Pressable
        testID="exit-sheet-backdrop"
        onPress={() => onChoose('continue')}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
      >
        <Pressable
          testID="exit-sheet"
          accessibilityViewIsModal
          onPress={() => {}}
          style={{ backgroundColor: dark.paper, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: 16, paddingHorizontal: 24, paddingBottom: 24 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: dark.ink, marginBottom: 8 }}>
            {t('exitSheet.title')}
          </Text>
          <Text style={{ fontSize: 14, color: dark.ink2, marginBottom: 16 }}>
            {t('exitSheet.progressLine', { done: exIdx, total: totalExercises })}
          </Text>
          <Pressable
            testID="exit-continue"
            accessibilityRole="button"
            onPress={() => onChoose('continue')}
            style={{ paddingVertical: 12, backgroundColor: accent.volt, borderRadius: 12, marginBottom: 8 }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: dark.onAccent }}>{t('exitSheet.continueCta')}</Text>
          </Pressable>
          <Pressable
            testID="exit-pause"
            accessibilityRole="button"
            onPress={() => onChoose('pause')}
            style={{ paddingVertical: 12, backgroundColor: dark.paper2, borderWidth: 1, borderColor: dark.lineStrong, borderRadius: 12, marginBottom: 8 }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: dark.ink }}>{t('exitSheet.pauseCta')}</Text>
          </Pressable>
          <Pressable
            testID="exit-finish-early"
            accessibilityRole="button"
            onPress={() => onChoose('finish-early')}
            style={{ paddingVertical: 12, backgroundColor: dark.paper2, borderWidth: 1, borderColor: dark.lineStrong, borderRadius: 12, marginBottom: 8 }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: dark.ink }}>{t('exitSheet.finishEarlyCta')}</Text>
          </Pressable>
          <Pressable
            testID="exit-discard"
            accessibilityRole="button"
            onPress={() => onChoose('discard')}
            style={{ paddingVertical: 8 }}
          >
            <Text style={{ textAlign: 'center', fontSize: 14, color: accent.volt }}>{t('exitSheet.discardCta')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
