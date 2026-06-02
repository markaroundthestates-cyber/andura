// ══ AA FRICTION MODAL (RN port) — per-set safety acknowledge (LOCK 9) ═════
// RN twin of src/react/components/AaFrictionModal.tsx. Blocking centered modal
// when auto-aggression is detected pre-set: user MUST choose Pauza or Continui
// (no dismiss — LOCK 9 safety gate). Same props (open / reason / onAcknowledge
// / onForceContinue), same testIDs (aa-friction-backdrop / -modal / -title /
// -body / -reason / -pause / -continue), same i18n keys. RN <Modal> with NO
// onRequestClose handler → Android back is inert (preserves the web's "no
// Escape, must choose" blocking intent). Type import is erased (pure union).

import { Modal, View, Text, Pressable } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import type { AggressiveReason } from '../../src/react/lib/aaFrictionDetect';
import { dark } from '../lib/tokens';
import { t } from '../../src/i18n/index.js';

interface AaFrictionModalProps {
  open: boolean;
  reason: AggressiveReason | null;
  onAcknowledge: () => void;
  onForceContinue: () => void;
}

const REASON_KEY: Record<AggressiveReason, string> = {
  fast_sets: 'perSetSafety.reasons.fast_sets',
  kg_jump: 'perSetSafety.reasons.kg_jump',
  rep_spike: 'perSetSafety.reasons.rep_spike',
  over_recommendation: 'perSetSafety.reasons.over_recommendation',
};

export function AaFrictionModal({
  open,
  reason,
  onAcknowledge,
  onForceContinue,
}: AaFrictionModalProps) {
  if (!open) return null;
  return (
    <Modal visible={open} transparent animationType="fade" statusBarTranslucent>
      <View
        testID="aa-friction-backdrop"
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          testID="aa-friction-modal"
          accessibilityViewIsModal
          accessibilityLabel={t('perSetSafety.title')}
          className="bg-paper-2 border border-line"
          style={{ width: '100%', maxWidth: 448, borderRadius: 22, padding: 24 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <AlertTriangle size={24} color={dark.brick} />
            <Text
              testID="aa-friction-title"
              style={{ fontSize: 16, fontWeight: '700', color: dark.ink, flex: 1 }}
            >
              {t('perSetSafety.title')}
            </Text>
          </View>
          <Text testID="aa-friction-body" style={{ fontSize: 14, color: dark.ink2, marginBottom: 16 }}>
            {t('perSetSafety.body')}
          </Text>
          {reason && (
            <Text
              testID="aa-friction-reason"
              style={{ fontSize: 12, fontStyle: 'italic', color: dark.ink2, marginBottom: 16 }}
            >
              {t(REASON_KEY[reason])}
            </Text>
          )}
          <Pressable
            testID="aa-friction-pause"
            accessibilityRole="button"
            onPress={onAcknowledge}
            className="bg-brick"
            style={{ paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 8 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: dark.onAccent }}>
              {t('perSetSafety.pauseCta')}
            </Text>
          </Pressable>
          <Pressable
            testID="aa-friction-continue"
            accessibilityRole="button"
            onPress={onForceContinue}
            style={{ paddingVertical: 8, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 14, color: dark.brick }}>
              {t('perSetSafety.continueCta')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
